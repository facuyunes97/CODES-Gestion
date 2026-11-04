// Supabase Edge Function "copsat"
// Lee la plataforma GPS (RedGPS / Copsat, API https://api.service24gps.com/api/v1) y guarda unidades y km/horas por día
// en gps_unidades y gps_diario. Secretos: REDGPS_APIKEY, REDGPS_USER, REDGPS_PASS.
// Acciones (POST {accion}): "unidades" | "sync" {dias} | "probe".
// Acceso: sesión de dueño/contador, o cabecera x-sync-key igual a config_secretos('copsat_sync_key') (para pruebas y tareas programadas).
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-sync-key", "access-control-allow-methods": "POST, OPTIONS" };
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "content-type": "application/json" } });
const BASE = "https://api.service24gps.com/api/v1";
const KEY = (Deno.env.get("REDGPS_APIKEY") || "").trim();

async function llamar(ruta: string, campos: Record<string, string>) {
  const fd = new FormData();
  fd.append("apikey", KEY);
  for (const k of Object.keys(campos)) fd.append(k, campos[k]);
  const r = await fetch(BASE + ruta, { method: "POST", body: fd });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return { status: r.status, data: null, raw: t.slice(0, 300) }; }
}
async function token(): Promise<string> {
  const j = await llamar("/gettoken", { token: "", username: Deno.env.get("REDGPS_USER") || "", password: Deno.env.get("REDGPS_PASS") || "" });
  if (!j || j.status !== 200 || !j.data) throw new Error("gettoken: " + JSON.stringify(j).slice(0, 200) + " [largos apikey/user/pass: " + KEY.length + "/" + (Deno.env.get("REDGPS_USER") || "").length + "/" + (Deno.env.get("REDGPS_PASS") || "").length + "]");
  return String(j.data);
}
const num = (x: any) => { const n = parseFloat(String(x ?? "").replace(",", ".")); return isFinite(n) ? n : 0; };
const ymd = (d: Date) => d.toISOString().slice(0, 10);

async function unidades(tk: string) {
  const j = await llamar("/getdata", { token: tk, UseUTCDate: "0", sensores: "0" });
  if (j.status !== 200 || !Array.isArray(j.data)) throw new Error("getdata: " + JSON.stringify(j).slice(0, 200));
  const filas = j.data.map((u: any) => ({
    imei: String(u.GpsIdentif), nombre: u.UnitId || null, patente: u.UnitPlate || null,
    odometro_km: u.Odometer >= 0 ? num(u.Odometer) / 1000 : null,
    ultimo_reporte: u.ReportDate ? u.ReportDate.replace(" ", "T") + "-03:00" : null,
    ignicion: u.Ignition == null ? null : parseInt(u.Ignition), actualizado: new Date().toISOString(),
  }));
  if (filas.length) { const { error } = await sb.from("gps_unidades").upsert(filas, { onConflict: "imei" }); if (error) throw new Error("db unidades: " + error.message); }
  return filas;
}

async function odo(tk: string, imeis: string[], fecha: string) {
  const j = await llamar("/getOdometer", { token: tk, equipo: imeis.join(","), fecha, hora: "23:59:59", odometro_gps: "1" });
  const out: any[] = [];
  if (j.status === 200 && Array.isArray(j.data)) for (const o of j.data) for (const im of Object.keys(o)) {
    const v = o[im] || {};
    out.push({ imei: im, fecha, km: num(v.Kilometros), horas: num(v.Horas), odometro_km: num(v.Odometro), actualizado: new Date().toISOString() });
  }
  return { out, raw: j };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "usar POST" }, 405);
  let autorizado = false;
  const sk = req.headers.get("x-sync-key");
  if (sk) {
    const { data: c } = await sb.from("config_secretos").select("valor").eq("clave", "copsat_sync_key").maybeSingle();
    autorizado = !!c && c.valor === sk;
  } else {
    const t = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const { data: u } = t ? await sb.auth.getUser(t) : { data: null as any };
    if (u && u.user) {
      const { data: p } = await sb.from("perfiles").select("rol,activo").eq("id", u.user.id).maybeSingle();
      autorizado = !!p && p.activo && ["dueno", "contador"].includes(p.rol);
    }
  }
  if (!autorizado) return json({ ok: false, error: "no autorizado" }, 403);
  if (!KEY || !Deno.env.get("REDGPS_USER") || !Deno.env.get("REDGPS_PASS")) return json({ ok: false, error: "faltan_secretos" }, 503);

  let b: any = {}; try { b = await req.json(); } catch { /* sin cuerpo */ }
  try {
    const tk = await token();
    if (b.accion === "probe") {
      const u = await llamar("/getdata", { token: tk, UseUTCDate: "0", sensores: "1" });
      const s = await llamar("/getSensors", { token: tk });
      const im = Array.isArray(u.data) ? u.data.slice(0, 3).map((x: any) => String(x.GpsIdentif)) : [];
      const o = im.length ? await odo(tk, im, ymd(new Date(Date.now() - 864e5))) : null;
      return json({ ok: true, unidades: u, sensores: s, odometro: o && o.raw });
    }
    const us = await unidades(tk);
    if (b.accion === "unidades") return json({ ok: true, unidades: us.length });
    const dias = Math.min(Math.max(parseInt(b.dias) || 15, 1), 90);
    const imeis = us.map((x: any) => x.imei), hoy = new Date();
    let n = 0, fallas = 0;
    for (let i = 0; i < dias; i += 5) {
      const lote = await Promise.all(Array.from({ length: Math.min(5, dias - i) }, (_, k) => odo(tk, imeis, ymd(new Date(hoy.getTime() - (i + k) * 864e5)))));
      const filas = lote.flatMap((x) => x.out); lote.forEach((x) => { if (!x.out.length) fallas++; });
      if (filas.length) { const { error } = await sb.from("gps_diario").upsert(filas, { onConflict: "imei,fecha" }); if (error) throw new Error("db diario: " + error.message); n += filas.length; }
    }
    return json({ ok: true, unidades: us.length, dias, filas: n, dias_sin_datos: fallas });
  } catch (e) {
    return json({ ok: false, error: String((e as Error).message || e) }, 502);
  }
});
