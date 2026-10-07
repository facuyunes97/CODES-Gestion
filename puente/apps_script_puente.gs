/**
 * PUENTE CODES · Google Apps Script
 * Se instala DENTRO de la cuenta codessrl.sgo@gmail.com (script.google.com).
 *  1) Cada 10 min lee los mails nuevos con PDF adjunto y se los manda al sistema (quedan como "pendientes", nada se carga solo).
 *  2) Cada 10 min sincroniza los cheques/Echeq con el calendario compartido "CODES SRL".
 */
var URL_PUENTE = 'https://ljnhikarhvwgbktkkzug.supabase.co/functions/v1/puente';
var URL_AVISOS = 'https://ljnhikarhvwgbktkkzug.supabase.co/functions/v1/avisos';
var CLAVE = 'PEGAR_AQUI_LA_CLAVE';
var CALENDARIO_ID = '1aa1b0e83c5cd779e17d303c7014ea125e1bd24aa709e6b0444309e6550a0c4d@group.calendar.google.com';
var ETIQUETA = 'CODES-revisado';
var DIAS_ATRAS = 45; // primera vez: cuánto mirar hacia atrás

function instalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('ciclo').timeBased().everyMinutes(10).create();
  ciclo();
}

function ciclo() {
  try { facturas_(); } catch (e) { console.error('facturas: ' + e); }
  try { cheques_(); } catch (e) { console.error('cheques: ' + e); }
  try { avisos_(); } catch (e) { console.error('avisos: ' + e); }
}

function llamar_(cuerpo) {
  var r = UrlFetchApp.fetch(URL_PUENTE, {
    method: 'post', contentType: 'application/json', headers: { 'x-clave': CLAVE },
    payload: JSON.stringify(cuerpo), muteHttpExceptions: true
  });
  var txt = r.getContentText();
  var j; try { j = JSON.parse(txt); } catch (e) { throw new Error('respuesta rara: ' + txt.slice(0, 200)); }
  if (!j.ok) throw new Error(j.error || 'error');
  return j;
}

// Avisos al grupo de Telegram (facturas nuevas, cheques por vencer)
function avisos_() {
  var r = UrlFetchApp.fetch(URL_AVISOS, { method: 'post', contentType: 'application/json', headers: { 'x-clave': CLAVE }, payload: '{}', muteHttpExceptions: true });
  var j = JSON.parse(r.getContentText());
  if (!j.ok) throw new Error(j.error || 'error');
  if (j.aviso) console.log(j.aviso);
}

function facturas_() {
  var et = GmailApp.getUserLabelByName(ETIQUETA) || GmailApp.createLabel(ETIQUETA);
  var hilos = GmailApp.search('has:attachment filename:pdf -label:' + ETIQUETA + ' newer_than:' + DIAS_ATRAS + 'd', 0, 15);
  hilos.forEach(function (h) {
    var ok = true;
    h.getMessages().forEach(function (m) {
      m.getAttachments({ includeInlineImages: false }).forEach(function (a) {
        var nombre = a.getName() || '';
        if (!/\.pdf$/i.test(nombre) && a.getContentType() !== 'application/pdf') return;
        if (a.getSize() > 6 * 1024 * 1024) return;
        try {
          llamar_({
            action: 'factura', message_id: m.getId(), adjunto: nombre,
            remitente: m.getFrom(), asunto: m.getSubject(), recibida: m.getDate().toISOString(),
            mail_url: 'https://mail.google.com/mail/u/0/#all/' + h.getId(),
            pdf_base64: Utilities.base64Encode(a.getBytes())
          });
        } catch (e) { ok = false; console.error(nombre + ': ' + e); }
      });
    });
    if (ok) h.addLabel(et);
  });
}

function cheques_() {
  var cal = CalendarApp.getCalendarById(CALENDARIO_ID);
  if (!cal) throw new Error('No encuentro el calendario compartido');
  var r = llamar_({ action: 'cheques_pendientes' });
  r.ops.forEach(function (o) {
    var c = o.cheque;
    if (o.op === 'borrar') {
      try { var ev = cal.getEventById(o.evento_id); if (ev) ev.deleteEvent(); } catch (e) {}
      llamar_({ action: 'cheque_evento', cheque_id: c.id, borrar: true });
      return;
    }
    var f = String(c.fecha_pago).split('-');
    var dia = new Date(+f[0], +f[1] - 1, +f[2]);
    var tipo = c.tipo === 'echeq' ? 'Echeq' : 'Cheque';
    var sentido = c.origen === 'propio' ? 'A PAGAR' : 'A COBRAR';
    var cerrado = o.op === 'cerrar';
    var titulo = (cerrado ? '✔ ' : '') + tipo + ' ' + sentido + ' $' + Number(c.importe).toLocaleString('es-AR') + (c.moneda && c.moneda !== 'ARS' ? ' ' + c.moneda : '') + ' · ' + (c.librador || c.banco || '');
    var desc = tipo + ' Nº ' + (c.numero || '-') + '\nBanco: ' + (c.banco || '-') + '\nLibrador: ' + (c.librador || '-') + '\nEstado: ' + c.estado + '\n(cargado desde CODES Gestión)';
    var ev = null;
    if (o.evento_id) { try { ev = cal.getEventById(o.evento_id); } catch (e) {} }
    if (!ev) ev = cal.createAllDayEvent(titulo, dia, { description: desc });
    else { ev.setTitle(titulo); ev.setAllDayDate(dia); ev.setDescription(desc); }
    ev.setColor(cerrado ? CalendarApp.EventColor.GRAY : (c.origen === 'propio' ? CalendarApp.EventColor.RED : CalendarApp.EventColor.GREEN));
    llamar_({ action: 'cheque_evento', cheque_id: c.id, evento_id: ev.getId(), fecha: c.fecha_pago, firma: o.firma, cerrado: cerrado });
  });
}
