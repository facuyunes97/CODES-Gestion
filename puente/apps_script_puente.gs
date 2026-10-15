/**
 * PUENTE CODES · Google Apps Script
 * Se instala DENTRO de la cuenta codessrl.sgo@gmail.com (script.google.com).
 *  1) Cada 10 min lee los mails nuevos con PDF adjunto y se los manda al sistema (quedan como "pendientes", nada se carga solo).
 *  2) Cada 10 min sincroniza los cheques/Echeq con el calendario compartido "CODES SRL".
 *  3) Cada 10 min sincroniza los eventos de la pestaña Calendario (recordatorios, anuncios, etc.) con ese mismo calendario, en los dos sentidos.
 */
var URL_PUENTE = 'https://ljnhikarhvwgbktkkzug.supabase.co/functions/v1/puente';
var URL_CAL = 'https://ljnhikarhvwgbktkkzug.supabase.co/functions/v1/calendario';
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

// Si hace falta que el sistema vuelva a leer los mails (por ejemplo después de mejorar el lector): ejecutar una vez.
function reprocesar() {
  var et = GmailApp.getUserLabelByName(ETIQUETA);
  if (!et) return;
  var hilos = et.getThreads(0, 100);
  hilos.forEach(function (h) { h.removeLabel(et); });
  console.log('Listo: ' + hilos.length + ' hilos se vuelven a leer en el próximo ciclo (10 min).');
}

function ciclo() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return; // ya hay un ciclo corriendo
  try {
    // primero lo liviano (calendario y avisos); las facturas al final porque pueden tardar
    try { cheques_(); } catch (e) { console.error('cheques: ' + e); }
    try { eventos_(); } catch (e) { console.error('eventos: ' + e); }
    try { avisos_(); } catch (e) { console.error('avisos: ' + e); }
    try { facturas_(); } catch (e) { console.error('facturas: ' + e); }
  } finally { lock.releaseLock(); }
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
  var hilos = GmailApp.search('has:attachment filename:pdf -label:' + ETIQUETA + ' newer_than:' + DIAS_ATRAS + 'd', 0, 8);
  var t0 = Date.now();
  hilos.forEach(function (h) {
    if (Date.now() - t0 > 240000) return; // máx. 4 min por ciclo; sigue en el próximo
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
    var cerrado = o.op === 'cerrar' || o.cerrado === true;
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

// ---- Eventos de la pestaña Calendario <-> Google Calendar ----
var TZ_AR = 'America/Argentina/Buenos_Aires';
function llamarCal_(cuerpo) {
  var r = UrlFetchApp.fetch(URL_CAL, {
    method: 'post', contentType: 'application/json', headers: { 'x-clave': CLAVE },
    payload: JSON.stringify(cuerpo), muteHttpExceptions: true
  });
  var j; try { j = JSON.parse(r.getContentText()); } catch (e) { throw new Error('respuesta rara: ' + r.getContentText().slice(0, 200)); }
  if (!j.ok) throw new Error(j.error || 'error');
  return j;
}
function dia_(iso) { var f = iso.split('-'); return new Date(+f[0], +f[1] - 1, +f[2]); }
function sumaDia_(iso, n) { var d = dia_(iso); d.setDate(d.getDate() + n); return Utilities.formatDate(d, TZ_AR, 'yyyy-MM-dd'); }
function fechaHoraAR_(iso, hhmm) { return new Date(iso + 'T' + hhmm + ':00-03:00'); }

function eventos_() {
  var cal = CalendarApp.getCalendarById(CALENDARIO_ID);
  if (!cal) throw new Error('No encuentro el calendario compartido');
  // 1) borrados en el sistema -> borrar en Google
  var p = llamarCal_({ action: 'pendientes' });
  p.borrar.forEach(function (gid) {
    try { var ev = cal.getEventById(gid); if (ev) ev.deleteEvent(); } catch (e) {}
    llamarCal_({ action: 'borrado_ok', google_event_id: gid });
  });
  // 2) creados o modificados en el sistema -> crear/actualizar en Google
  p.ops.forEach(function (o) {
    var opc = { description: o.descripcion || '' };
    var ev = null;
    if (o.google_event_id) { try { ev = cal.getEventById(o.google_event_id); } catch (e) {} }
    var ini, fin;
    if (o.hora) { ini = fechaHoraAR_(o.fecha, o.hora); fin = fechaHoraAR_(o.fecha_fin, o.hora_fin); }
    if (ev) {
      ev.setTitle(o.titulo); ev.setDescription(opc.description);
      if (o.hora) ev.setTime(ini, fin); else ev.setAllDayDates(dia_(o.fecha), dia_(sumaDia_(o.fecha_fin, 1)));
    } else {
      ev = o.hora ? cal.createEvent(o.titulo, ini, fin, opc) : cal.createAllDayEvent(o.titulo, dia_(o.fecha), dia_(sumaDia_(o.fecha_fin, 1)), opc);
    }
    llamarCal_({ action: 'sync_ok', id: o.id, google_event_id: ev.getId(), firma: o.firma });
  });
  // 3) lo que hay en Google (creado o editado allá) -> al sistema
  var hoy = Utilities.formatDate(new Date(), TZ_AR, 'yyyy-MM-dd');
  var desde = sumaDia_(hoy, -30), hasta = sumaDia_(hoy, 365);
  var lista = cal.getEvents(dia_(desde), dia_(hasta)), out = [], completo = true;
  lista.forEach(function (ev) {
    try {
      if (ev.isRecurringEvent()) return; // los eventos que se repiten se dejan solo en Google
      var todo = ev.isAllDayEvent(), e;
      if (todo) {
        var i = Utilities.formatDate(ev.getAllDayStartDate(), TZ_AR, 'yyyy-MM-dd');
        var f = sumaDia_(Utilities.formatDate(ev.getAllDayEndDate(), TZ_AR, 'yyyy-MM-dd'), -1);
        e = { fecha: i, fecha_fin: f < i ? i : f, hora: '', hora_fin: '' };
      } else {
        e = {
          fecha: Utilities.formatDate(ev.getStartTime(), TZ_AR, 'yyyy-MM-dd'), fecha_fin: Utilities.formatDate(ev.getEndTime(), TZ_AR, 'yyyy-MM-dd'),
          hora: Utilities.formatDate(ev.getStartTime(), TZ_AR, 'HH:mm'), hora_fin: Utilities.formatDate(ev.getEndTime(), TZ_AR, 'HH:mm')
        };
      }
      e.id = ev.getId(); e.titulo = ev.getTitle(); e.desc = ev.getDescription() || '';
      out.push(e);
    } catch (err) { completo = false; }
  });
  var r = llamarCal_({ action: 'importar', desde: desde, hasta: hasta, completo: completo, eventos: out });
  if (r.creados || r.actualizados || r.borrados) console.log('Calendario: ' + r.creados + ' nuevos desde Google, ' + r.actualizados + ' editados, ' + r.borrados + ' borrados.');
}
