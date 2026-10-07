// Supabase Edge Function "avisos": manda avisos del sistema al grupo de Telegram de CODES.
// La llama el script de Google cada 10 minutos (misma clave x-clave que "puente").
// El token del bot y el ID del grupo están en public.config_secretos (sin acceso desde la app).
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
async function sha256(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
const h = (s: unknown) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
const money = (n: number, m = "ARS") => (m === "USD" ? "US$ " : "$ ") + Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fd = (d: string) => (d ? d.split("-").reverse().join("/") : "");
const hoyAR = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
const diasEntre = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

async function cfg(k: string) { const r = await sb.from("config_secretos").select("valor").eq("clave", k).maybeSingle(); return r.data?.valor as string | undefined; }
async function setCfg(k: string, v: string) { await sb.from("config_secretos").upsert({ clave: k, valor: v, actualizado: new Date().toISOString() }); }

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "usar POST" }, 405);
  const clave = req.headers.get("x-clave") || "";
  if (clave.length < 20) return json({ ok: false, error: "clave inválida" }, 401);
  const { data: k } = await sb.from("ingesta_claves").select("id").eq("hash", await sha256(clave)).limit(1);
  if (!k || !k.length) return json({ ok: false, error: "clave inválida" }, 401);

  try {
    const token = await cfg("telegram_token");
    if (!token) return json({ ok: false, error: "falta el token del bot" }, 500);
    const api = (m: string, body?: unknown) => fetch(`https://api.telegram.org/bot${token}/${m}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body || {}) }).then((r) => r.json());

    let chat = await cfg("telegram_chat_id");
    if (!chat) {
      const up = await api("getUpdates", { limit: 100, allowed_updates: ["message", "my_chat_member", "channel_post"] });
      const chats: any[] = [];
      for (const u of up.result || []) {
        const c = u.message?.chat || u.my_chat_member?.chat || u.channel_post?.chat;
        if (c && ["group", "supergroup"].includes(c.type)) chats.push(c);
      }
      if (!chats.length) return json({ ok: true, enviados: 0, aviso: "El bot todavía no vio ningún grupo: agregalo al grupo y escribí un mensaje." });
      chat = String(chats[chats.length - 1].id);
      await setCfg("telegram_chat_id", chat);
      await api("sendMessage", { chat_id: chat, parse_mode: "HTML", text: "✅ <b>CODES Gestión</b> conectado. Desde acá vas a recibir los avisos del sistema." });
    }

    const enviar = async (clave: string, texto: string) => {
      const ya = await sb.from("avisos_enviados").select("clave").eq("clave", clave).maybeSingle();
      if (ya.data) return false;
      const r = await api("sendMessage", { chat_id: chat, parse_mode: "HTML", text: texto, disable_web_page_preview: true });
      if (!r.ok) throw new Error("Telegram: " + (r.description || "error"));
      await sb.from("avisos_enviados").insert({ clave });
      return true;
    };

    let n = 0;
    const hoy = hoyAR();

    // 1) Facturas recopiladas nuevas
    const rec = await sb.from("facturas_recopiladas").select("*").eq("estado", "pendiente").order("created_at").limit(30);
    for (const r of rec.data || []) {
      const nro = r.numero ? `${String(r.tipo).replace("_", " ")} ${String(r.punto_venta || 0).padStart(4, "0")}-${String(r.numero).padStart(8, "0")}` : "(número sin leer)";
      if (await enviar("rec:" + r.id, `🧾 <b>Factura recopilada</b>\n${h(r.emisor_razon || "Proveedor sin leer")}\n${h(nro)} · ${h(fd(r.fecha || ""))}\nTotal <b>${money(r.total)}</b>${r.observaciones ? "\n⚠️ Revisar: " + h(r.observaciones) : ""}\nQuedó pendiente de autorizar en el sistema.`)) n++;
    }

    // 2) Cheques / Echeq por vencer y rechazados
    const ch = await sb.from("cheques").select("*").in("estado", ["en_cartera", "emitido", "rechazado"]);
    for (const c of ch.data || []) {
      const tipo = c.tipo === "echeq" ? "Echeq" : "Cheque";
      const det = `${tipo} Nº ${h(c.numero || "-")} · ${h(c.banco || "")}\n${h(c.librador || "")}\nImporte <b>${money(c.importe, c.moneda)}</b> · paga ${fd(c.fecha_pago)}`;
      if (c.estado === "rechazado") { if (await enviar("rech:" + c.id, `🚫 <b>${tipo} rechazado</b>\n${det}`)) n++; continue; }
      if (!c.fecha_pago) continue;
      const d = diasEntre(hoy, c.fecha_pago);
      const sentido = c.origen === "propio" ? "A PAGAR" : "A COBRAR";
      if (d < 0) continue;
      const etapa = d === 0 ? "hoy" : d === 1 ? "1d" : d <= 3 ? "3d" : "";
      if (!etapa) continue;
      const cuando = d === 0 ? "HOY" : d === 1 ? "MAÑANA" : `en ${d} días`;
      if (await enviar(`chq:${c.id}:${c.fecha_pago}:${etapa}`, `⏰ <b>${tipo} ${sentido} ${cuando}</b>\n${det}`)) n++;
    }
    return json({ ok: true, enviados: n });
  } catch (e) {
    return json({ ok: false, error: String((e as Error).message || e) }, 500);
  }
});
