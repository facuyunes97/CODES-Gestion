// Supabase Edge Function "calendario"
// La llama el script de Google (Apps Script) de codessrl.sgo@gmail.com con la misma clave (x-clave) que "puente".
// Mantiene sincronizados los eventos de la pestaña Calendario con el calendario compartido "CODES SRL".
//   action "pendientes"  -> qué eventos hay que crear/actualizar y cuáles borrar en Google
//   action "sync_ok"     -> el script informa el evento de Google creado/actualizado
//   action "borrado_ok"  -> el script informa que borró un evento de Google
//   action "importar"    -> el script manda lo que hay en Google; lo creado o editado allá entra/actualiza en el sistema
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
async function sha256(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });

const PREF: Record<string, string> = { recordatorio: "🔔 ", anuncio: "📢 ", reunion: "👥 ", vencimiento: "⚠ ", visita: "🏗 ", otro: "" };
const HECHO = "✔ ";
const hhmm = (h: any) => (h ? String(h).slice(0, 5) : "");
const masUnaHora = (h: string) => { const [a, m] = h.split(":").map(Number); return a >= 23 ? "23:59" : String(a + 1).padStart(2, "0") + ":" + String(m).padStart(2, "0"); };
// forma normalizada: lo que tiene que ser igual de los dos lados para considerar que no hubo cambios
const norm = (r: any) => {
  const hora = hhmm(r.hora);
  return {
    tipo: r.tipo, titulo: String(r.titulo || "").trim(), fecha: r.fecha, fecha_fin: r.fecha_fin || r.fecha,
    hora, hora_fin: hora ? (hhmm(r.hora_fin) || masUnaHora(hora)) : "", descripcion: String(r.descripcion || "").trim(), hecho: !!r.hecho,
  };
};
const firma = (n: any) => [n.tipo, n.titulo, n.fecha, n.fecha_fin, n.hora, n.hora_fin, n.descripcion, n.hecho ? 1 : 0].join("|");
const tituloGoogle = (n: any) => (n.hecho ? HECHO : "") + (PREF[n.tipo] ?? "") + n.titulo;
function parseTitulo(t: string) {
  let s = String(t || "").trim(), hecho = false, tipo = "otro";
  if (s.startsWith(HECHO)) { hecho = true; s = s.slice(HECHO.length); }
  for (const [k, p] of Object.entries(PREF)) if (p && s.startsWith(p)) { tipo = k; s = s.slice(p.length); break; }
  return { hecho, tipo, titulo: s.trim() || "(sin título)" };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "usar POST" }, 405);
  const clave = req.headers.get("x-clave") || "";
  if (clave.length < 20) return json({ ok: false, error: "clave inválida" }, 401);
  const { data: k } = await sb.from("ingesta_claves").select("id").eq("hash", await sha256(clave)).limit(1);
  if (!k || !k.length) return json({ ok: false, error: "clave inválida" }, 401);
  let b: any;
  try { b = await req.json(); } catch { return json({ ok: false, error: "json inválido" }, 400); }

  try {
    if (b.action === "pendientes") {
      const [ev, bo] = await Promise.all([sb.from("calendario_eventos").select("*"), sb.from("calendario_borrados").select("google_event_id")]);
      if (ev.error || bo.error) return json({ ok: false, error: (ev.error || bo.error)!.message }, 500);
      const ops: any[] = [];
      for (const r of ev.data || []) {
        const n = norm(r), f = firma(n);
        if (!r.google_event_id || r.google_firma !== f) {
          ops.push({
            op: r.google_event_id ? "actualizar" : "crear", id: r.id, google_event_id: r.google_event_id, firma: f,
            titulo: tituloGoogle(n), fecha: n.fecha, fecha_fin: n.fecha_fin, hora: n.hora, hora_fin: n.hora_fin, descripcion: n.descripcion, hecho: n.hecho,
          });
        }
      }
      return json({ ok: true, ops: ops.slice(0, 40), borrar: (bo.data || []).map((x: any) => x.google_event_id).slice(0, 40) });
    }

    if (b.action === "sync_ok") {
      if (!b.id || !b.google_event_id) return json({ ok: false, error: "faltan datos" }, 400);
      const { error } = await sb.from("calendario_eventos").update({ google_event_id: b.google_event_id, google_firma: b.firma || null, google_sync_at: new Date().toISOString() }).eq("id", b.id);
      return error ? json({ ok: false, error: error.message }, 500) : json({ ok: true });
    }

    if (b.action === "borrado_ok") {
      if (!b.google_event_id) return json({ ok: false, error: "falta google_event_id" }, 400);
      await sb.from("calendario_borrados").delete().eq("google_event_id", b.google_event_id);
      return json({ ok: true });
    }

    if (b.action === "importar") {
      const desde = String(b.desde || ""), hasta = String(b.hasta || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{4}-\d{2}-\d{2}$/.test(hasta) || !Array.isArray(b.eventos)) return json({ ok: false, error: "faltan datos" }, 400);
      const [ch, rs] = await Promise.all([
        sb.from("cheques_calendario").select("evento_id"),
        sb.from("calendario_eventos").select("*").or(`google_event_id.not.is.null,and(fecha.gte.${desde},fecha.lte.${hasta})`),
      ]);
      if (ch.error || rs.error) return json({ ok: false, error: (ch.error || rs.error)!.message }, 500);
      const cheques = new Set((ch.data || []).map((x: any) => x.evento_id));
      const porG = new Map((rs.data || []).filter((r: any) => r.google_event_id).map((r: any) => [r.google_event_id, r]));
      const vistos = new Set<string>();
      // limpieza: copias de cheques/echeqs que entraron desde Google (los cheques ya se ven en el calendario del sistema)
      for (const r of (rs.data || []) as any[]) {
        if (r.origen === "google" && /^(✔ )?(cheque|echeq)\b/i.test(String(r.titulo || "").trim())) {
          const d = await sb.from("calendario_eventos").delete().eq("id", r.id);
          if (!d.error) { await sb.from("calendario_borrados").delete().eq("google_event_id", r.google_event_id); porG.delete(r.google_event_id); }
        }
      }
      let creados = 0, actualizados = 0, borrados = 0;
      for (const e of b.eventos.slice(0, 1000)) {
        if (!e || !e.id || !/^\d{4}-\d{2}-\d{2}$/.test(String(e.fecha || ""))) continue;
        if (cheques.has(e.id) || /^(✔ )?(cheque|echeq)\b/i.test(String(e.titulo || "").trim())) continue;
        vistos.add(e.id);
        const p = parseTitulo(e.titulo);
        const g = { tipo: p.tipo, titulo: p.titulo, fecha: e.fecha, fecha_fin: /^\d{4}-\d{2}-\d{2}$/.test(String(e.fecha_fin || "")) && e.fecha_fin >= e.fecha ? e.fecha_fin : e.fecha, hora: e.hora || null, hora_fin: e.hora_fin || null, descripcion: e.desc || null, hecho: p.hecho };
        const gf = firma(norm(g));
        const row: any = porG.get(e.id);
        if (!row) {
          const { error } = await sb.from("calendario_eventos").insert({ ...g, fecha_fin: g.fecha_fin === g.fecha ? null : g.fecha_fin, origen: "google", google_event_id: e.id, google_firma: gf, google_sync_at: new Date().toISOString() });
          if (!error) creados++;
        } else if (row.google_firma !== gf && firma(norm(row)) === row.google_firma) {
          // se editó en Google y en el sistema no hubo cambios: gana Google (si se cambió en los dos lados, gana el sistema)
          const { error } = await sb.from("calendario_eventos").update({ ...g, fecha_fin: g.fecha_fin === g.fecha ? null : g.fecha_fin, google_firma: gf, google_sync_at: new Date().toISOString() }).eq("id", row.id);
          if (!error) actualizados++;
        }
      }
      // borrados en Google: solo los ya sincronizados hace más de 15 min, y de a pocos por vez (por seguridad)
      if (b.completo === true) {
        const lim = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const falt = (rs.data || []).filter((r: any) => r.google_event_id && !vistos.has(r.google_event_id) && porG.has(r.google_event_id) && r.fecha >= desde && r.fecha <= hasta && r.google_sync_at && r.google_sync_at < lim).slice(0, 10);
        for (const r of falt) { const { error } = await sb.from("calendario_eventos").delete().eq("id", r.id); if (!error) borrados++; }
      }
      return json({ ok: true, creados, actualizados, borrados });
    }
    return json({ ok: false, error: "acción desconocida" }, 400);
  } catch (e) {
    return json({ ok: false, error: String((e as Error).message || e) }, 500);
  }
});
