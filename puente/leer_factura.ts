// Supabase Edge Function "leer_factura"
// La llama la app (con la sesión de un dueño o contador) cuando se suben PDFs a mano desde Facturas → "Subir facturas".
// Lee el PDF con el mismo lector que el puente de Gmail y lo deja en public.facturas_recopiladas como pendiente:
// nada entra a Facturas hasta que se apriete "Cargar al sistema".
import { createClient } from "npm:@supabase/supabase-js@2";
import { extractText, getDocumentProxy } from "npm:unpdf@0.12.1";
import { analizar } from "./parser.js";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type", "access-control-allow-methods": "POST, OPTIONS" };
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "usar POST" }, 405);
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ ok: false, error: "sin sesión" }, 401);
  const { data: u, error: ue } = await sb.auth.getUser(token);
  if (ue || !u || !u.user) return json({ ok: false, error: "sesión inválida" }, 401);
  const { data: p } = await sb.from("perfiles").select("rol,activo").eq("id", u.user.id).maybeSingle();
  if (!p || !p.activo || !["dueno", "contador"].includes(p.rol)) return json({ ok: false, error: "sin permiso" }, 403);

  let b: any;
  try { b = await req.json(); } catch { return json({ ok: false, error: "json inválido" }, 400); }
  try {
    const nombre = String(b.nombre || "factura.pdf").slice(0, 200);
    if (!b.pdf_base64) return json({ ok: false, error: "falta el PDF" }, 400);
    const bin = Uint8Array.from(atob(String(b.pdf_base64)), (c) => c.charCodeAt(0));
    if (bin.length > 8 * 1024 * 1024) return json({ ok: true, ignorada: "el PDF pesa más de 8 MB" });
    if (!(bin[0] === 0x25 && bin[1] === 0x50 && bin[2] === 0x44 && bin[3] === 0x46)) return json({ ok: true, ignorada: "no es un PDF" });
    let texto = "";
    try {
      const pdf = await getDocumentProxy(bin);
      const r = await extractText(pdf, { mergePages: true });
      texto = Array.isArray(r.text) ? r.text.join("\n") : r.text;
    } catch (e) { return json({ ok: true, ignorada: "no se pudo leer el PDF (puede ser una foto escaneada)" }); }
    if (!String(texto).trim()) return json({ ok: true, ignorada: "el PDF no tiene texto (puede ser una foto escaneada)" });
    const r = analizar(texto, nombre);
    if (r.ignorar) return json({ ok: true, ignorada: r.motivo });
    const d = r.datos;
    if (d.numero && d.punto_venta && d.emisor_cuit) {
      const dup = await sb.from("facturas_recopiladas").select("id,estado").eq("punto_venta", d.punto_venta).eq("numero", d.numero).eq("emisor_cuit", d.emisor_cuit).limit(1);
      if (dup.data && dup.data.length) return json({ ok: true, duplicada: true, estado: dup.data[0].estado });
    }
    const uid = crypto.randomUUID();
    const seguro = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_");
    const path = `manual/${uid}/${seguro || "factura.pdf"}`;
    await sb.storage.from("facturas-recopiladas").upload(path, bin, { contentType: "application/pdf", upsert: true });
    const fila = {
      gmail_message_id: "manual-" + uid, adjunto: nombre, recibida_at: new Date().toISOString(),
      remitente: "Subida a mano", asunto: nombre, mail_url: null,
      emisor_cuit: d.emisor_cuit || null, emisor_razon: d.emisor_razon || null, receptor_cuit: d.receptor_cuit || null,
      tipo: d.tipo, punto_venta: d.punto_venta, numero: d.numero, fecha: d.fecha,
      neto_gravado: d.neto_gravado, iva: d.iva, otros: d.otros, total: d.total, cae: d.cae || null,
      pdf_path: path, observaciones: r.observaciones.length ? r.observaciones.join(" ") : null,
      texto: String(texto).slice(0, 8000),
    };
    const ins = await sb.from("facturas_recopiladas").insert(fila).select("id,estado").single();
    if (ins.error) return json({ ok: false, error: ins.error.message }, 500);
    return json({ ok: true, id: ins.data.id, estado: ins.data.estado, observaciones: r.observaciones });
  } catch (e) {
    return json({ ok: false, error: String((e as Error).message || e) }, 500);
  }
});
