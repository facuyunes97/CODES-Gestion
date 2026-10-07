// Supabase Edge Function "puente"
// La llama el script de Google (Apps Script) que corre dentro de codessrl.sgo@gmail.com.
// Se autentica con una clave propia (cabecera x-clave) cuyo hash está en public.ingesta_claves.
//   action "factura"            -> lee un PDF de factura y lo deja en public.facturas_recopiladas (estado pendiente)
//   action "cheques_pendientes" -> devuelve qué hay que crear/actualizar/cerrar/borrar en el calendario
//   action "cheque_evento"      -> el script informa el evento creado/actualizado/borrado
import { createClient } from "npm:@supabase/supabase-js@2";
import { extractText, getDocumentProxy } from "npm:unpdf@0.12.1";
import { analizar } from "./parser.js";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

async function sha256(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const VIGENTES = ["en_cartera", "emitido"];
const CERRADOS = ["depositado", "endosado", "cobrado", "debitado"];
const firmaDe = (c: any) => [c.fecha_pago, c.numero, c.banco, c.importe, c.moneda, c.tipo, c.origen, c.estado, c.librador].join("|");

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "usar POST" }, 405);
  const clave = req.headers.get("x-clave") || "";
  if (clave.length < 20) return json({ ok: false, error: "clave inválida" }, 401);
  const { data: k } = await sb.from("ingesta_claves").select("id").eq("hash", await sha256(clave)).limit(1);
  if (!k || !k.length) return json({ ok: false, error: "clave inválida" }, 401);

  let b: any;
  try { b = await req.json(); } catch { return json({ ok: false, error: "json inválido" }, 400); }

  try {
    if (b.action === "factura") {
      if (!b.message_id || !b.pdf_base64) return json({ ok: false, error: "faltan datos" }, 400);
      const adjunto = String(b.adjunto || "").slice(0, 200);
      const ya = await sb.from("facturas_recopiladas").select("id").eq("gmail_message_id", b.message_id).eq("adjunto", adjunto).limit(1);
      if (ya.data && ya.data.length) return json({ ok: true, ignorada: "ya estaba" });
      const bin = Uint8Array.from(atob(b.pdf_base64), (c) => c.charCodeAt(0));
      if (bin.length > 8 * 1024 * 1024) return json({ ok: true, ignorada: "pdf muy grande" });
      let texto = "";
      try {
        const pdf = await getDocumentProxy(bin);
        const r = await extractText(pdf, { mergePages: true });
        texto = Array.isArray(r.text) ? r.text.join("\n") : r.text;
      } catch (e) { return json({ ok: true, ignorada: "pdf ilegible" }); }
      const r = analizar(texto, adjunto);
      if (r.ignorar) return json({ ok: true, ignorada: r.motivo });
      const seguro = adjunto.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_");
      const path = `${b.message_id}/${seguro || "factura.pdf"}`;
      await sb.storage.from("facturas-recopiladas").upload(path, bin, { contentType: "application/pdf", upsert: true });
      const d = r.datos;
      const { error } = await sb.from("facturas_recopiladas").insert({
        gmail_message_id: b.message_id, adjunto, recibida_at: b.recibida || null,
        remitente: String(b.remitente || "").slice(0, 200), asunto: String(b.asunto || "").slice(0, 300), mail_url: b.mail_url || null,
        emisor_cuit: d.emisor_cuit || null, emisor_razon: d.emisor_razon || null, receptor_cuit: d.receptor_cuit || null,
        tipo: d.tipo, punto_venta: d.punto_venta, numero: d.numero, fecha: d.fecha,
        neto_gravado: d.neto_gravado, iva: d.iva, otros: d.otros, total: d.total, cae: d.cae || null,
        pdf_path: path, observaciones: r.observaciones.length ? r.observaciones.join(" ") : null,
      });
      if (error && !/duplicate/i.test(error.message)) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true, guardada: true, observaciones: r.observaciones });
    }

    if (b.action === "cheques_pendientes") {
      const [ch, mp] = await Promise.all([sb.from("cheques").select("*"), sb.from("cheques_calendario").select("*")]);
      if (ch.error || mp.error) return json({ ok: false, error: (ch.error || mp.error)!.message }, 500);
      const map = new Map((mp.data || []).map((m: any) => [m.cheque_id, m]));
      const porId = new Map((ch.data || []).map((c: any) => [c.id, c]));
      const ops: any[] = [];
      for (const c of ch.data || []) {
        const m: any = map.get(c.id);
        if (VIGENTES.includes(c.estado)) {
          if (!m) ops.push({ op: "crear", cheque: c, firma: firmaDe(c) });
          else if (m.firma !== firmaDe(c) || m.cerrado) ops.push({ op: "actualizar", evento_id: m.evento_id, cheque: c, firma: firmaDe(c) });
        } else if (m && !m.cerrado && CERRADOS.includes(c.estado)) {
          ops.push({ op: "cerrar", evento_id: m.evento_id, cheque: c, firma: firmaDe(c) });
        } else if (m && ["rechazado", "anulado"].includes(c.estado)) {
          ops.push({ op: "borrar", evento_id: m.evento_id, cheque: { id: c.id } });
        }
      }
      for (const m of mp.data || []) if (!porId.has((m as any).cheque_id)) ops.push({ op: "borrar", evento_id: (m as any).evento_id, cheque: { id: (m as any).cheque_id } });
      return json({ ok: true, ops: ops.slice(0, 40) });
    }

    if (b.action === "cheque_evento") {
      if (!b.cheque_id) return json({ ok: false, error: "falta cheque_id" }, 400);
      if (b.borrar) { await sb.from("cheques_calendario").delete().eq("cheque_id", b.cheque_id); return json({ ok: true }); }
      const { error } = await sb.from("cheques_calendario").upsert({
        cheque_id: b.cheque_id, evento_id: b.evento_id, fecha: b.fecha || null, firma: b.firma || null,
        cerrado: !!b.cerrado, actualizado: new Date().toISOString(),
      });
      return error ? json({ ok: false, error: error.message }, 500) : json({ ok: true });
    }
    return json({ ok: false, error: "acción desconocida" }, 400);
  } catch (e) {
    return json({ ok: false, error: String((e as Error).message || e) }, 500);
  }
});
