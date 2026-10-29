/* Oficina CODES: agentes de IA que leen los datos del sistema (solo lectura) y se muestran en 3D.
   Se carga solo cuando se abre «Oficina». Usa three.js r128 desde cdnjs/jsDelivr. */
(function () {
  'use strict';
  var CSS = ":host{display:block;--o-bg:var(--bg);--o-surface:var(--surface);--o-fg:var(--ink);--o-muted:var(--ink-2);--o-line:var(--line);--o-stage:var(--surface-2);--o-alert:#d8352a;--o-amber:#ffc93c;--o-ok:#2f9e6b;--o-display:var(--f-display,'Barlow Condensed','Arial Narrow',sans-serif);--o-body:var(--f-body,'Barlow',system-ui,sans-serif);font-family:var(--o-body);color:var(--o-fg);font-size:15px;line-height:1.45}\n.bar-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 16px;margin-bottom:12px}\n.fnd i{color:var(--o-muted);font-style:normal;font-size:12px}\n.feed{display:grid;gap:2px}.feed li{padding-left:0}.feed li::before{display:none}\n.feed button{all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;padding:7px 8px 7px 14px;border-radius:7px;border-left:4px solid var(--tc);font-size:13.5px;line-height:1.3;position:relative}\n.feed button:hover,.feed button:focus-visible{background:color-mix(in srgb,var(--o-fg) 7%,transparent)}\n.feed button b{font-weight:700}.feed button span{float:right;color:var(--o-muted);font-size:12px;margin-left:8px}\ndetails{margin:14px 0 0}details summary{cursor:pointer;font:600 13px/1 var(--o-display);letter-spacing:.14em;text-transform:uppercase;color:var(--o-muted);padding:4px 0}\ndetails ul{margin-top:8px}\n.chip[hidden]{display:none}\n[hidden]{display:none!important}\n/* Layout: tabs switch between the 3D cutaway office and the org chart; roster dock under them; detail panel at the right (below on phones).\n   Palette: whites and cool grays everywhere; one accent per team (coral, indigo, teal) plus signal-red for pending items; the 3D scene is a white/gray architectural office. */\n\n\n\n\n*{box-sizing:border-box}\n\n\n\n.eyebrow{font:600 13px/1 var(--o-display);letter-spacing:.14em;text-transform:uppercase;color:var(--o-muted)}\n\n.chips{display:flex;flex-wrap:wrap;gap:8px}\n.chip{display:inline-flex;align-items:baseline;gap:6px;padding:7px 12px;border:1px solid var(--o-line);background:var(--o-surface);border-radius:8px;font-size:13px;color:var(--o-muted);font-family:var(--o-body)}\n.chip b{font:700 20px/1 var(--o-display);color:var(--o-fg);font-variant-numeric:tabular-nums}\nbutton.chip{cursor:pointer}\n.chip.red{background:var(--o-alert);border-color:var(--o-alert);color:#fff}\n.chip.red b{color:#fff}\nbutton:focus-visible,.card:focus-visible{outline:3px solid var(--o-amber);outline-offset:2px}\n\n.layout{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start}\n@media (min-width:980px){.layout{grid-template-columns:minmax(0,1fr) 370px}}\n.left{display:flex;flex-direction:column;gap:12px;min-width:0}\n\n.tabs{display:flex;gap:4px;padding:4px;background:var(--o-surface);border:1px solid var(--o-line);border-radius:10px;align-self:flex-start}\n.tabs button{font:600 14px var(--o-body);padding:8px 16px;border:0;border-radius:7px;background:transparent;color:var(--o-muted);cursor:pointer}\n.tabs button[aria-selected=\"true\"]{background:var(--o-fg);color:var(--o-bg)}\n\n.stage{position:relative;height:clamp(440px,68vh,720px);border-radius:12px;overflow:hidden;background:var(--o-stage);isolation:isolate}\n.stage[hidden],.org[hidden]{display:none}\n.stage canvas{display:block;width:100%;height:100%;touch-action:none}\n#cards{position:absolute;inset:0;pointer-events:none;overflow:hidden}\n.callout{position:absolute;left:12px;top:12px;z-index:6;max-width:210px;background:var(--o-alert);color:#fff;border-radius:10px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,.35)}\n.callout b{display:block;font:700 20px/1 var(--o-display);letter-spacing:.02em;text-transform:uppercase}\n.callout span{display:block;margin:5px 0 8px;font-size:12.5px;line-height:1.3;opacity:.95}\n.callout button{font:600 12px var(--o-body);color:var(--o-alert);background:#fff;border:0;border-radius:6px;padding:6px 10px;cursor:pointer}\n.home{position:absolute;right:12px;top:12px;z-index:6;font:600 13px var(--o-body);color:#fff;background:rgba(14,16,25,.78);border:1px solid rgba(255,255,255,.22);border-radius:8px;padding:8px 12px;cursor:pointer;backdrop-filter:blur(6px)}\n.hint{position:absolute;left:12px;bottom:10px;z-index:6;font-size:12px;color:rgba(255,255,255,.7);background:rgba(14,16,25,.6);padding:5px 9px;border-radius:6px;pointer-events:none}\n.nogl{position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;color:#c9d1dd}\n\n.card{position:absolute;left:0;top:0;width:182px;padding:9px 11px 10px;border-radius:14px;background:rgba(12,15,23,.93);border:2px solid var(--sc);color:#fff;\n  box-shadow:0 0 0 1px rgba(0,0,0,.45),0 0 18px var(--gl),0 8px 22px rgba(0,0,0,.45);cursor:pointer;pointer-events:auto;text-align:left;\n  font-family:var(--o-body);transform-origin:50% 100%;will-change:transform;user-select:none}\n.card .top{display:flex;align-items:center;gap:7px}\n.card .dot{flex:none;width:10px;height:10px;border-radius:50%;background:var(--tc)}\n.card .name{font:700 16px/1.1 var(--o-body);white-space:nowrap}\n.card .badge{margin-left:auto;font:700 9px/1 var(--o-body);letter-spacing:.07em;text-transform:uppercase;padding:4px 6px;border-radius:6px;color:var(--sc);background:rgba(255,255,255,.08);white-space:nowrap}\n.card .role{margin-top:4px;font-size:12px;color:#b3bccb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.card .bar{margin-top:8px;height:5px;border-radius:3px;background:rgba(255,255,255,.13);overflow:hidden}\n.card .bar i{display:block;height:100%;width:0;background:var(--sc);border-radius:3px}\n.card.compact{width:auto;padding:6px 11px;border-radius:12px}\n.card.compact .role,.card.compact .bar,.card.compact .badge{display:none}\n.card.sel{z-index:5}\n.card[hidden]{display:none}\n\n/* organigrama */\n.org{background:var(--o-surface);border:1px solid var(--o-line);border-radius:12px;padding:22px 14px 16px;overflow-x:auto}\n.org-note{margin:18px 4px 0;font-size:13px;color:var(--o-muted);display:flex;flex-wrap:wrap;gap:6px 18px}\n.org-note span::before{content:\"\";display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px;background:var(--c)}\n.tree,.tree ul{list-style:none;margin:0;padding:0}\n.tree{display:flex;width:max-content;margin:0 auto}\n.tree ul{display:flex;justify-content:center;padding-top:26px;position:relative}\n.tree li{display:flex;flex-direction:column;align-items:center;position:relative;padding:26px 7px 0}\n.tree li::before,.tree li::after{content:\"\";position:absolute;top:0;right:50%;width:50%;height:26px;border-top:2px solid var(--o-line)}\n.tree li::after{right:auto;left:50%;border-left:2px solid var(--o-line)}\n.tree li:only-child::before,.tree li:only-child::after{display:none}\n.tree li:only-child{padding-top:0}\n.tree li:first-child::before,.tree li:last-child::after{border:0 none}\n.tree li:last-child::before{border-right:2px solid var(--o-line);border-radius:0 8px 0 0}\n.tree li:first-child::after{border-radius:8px 0 0 0}\n.tree ul ul::before,.tree li>ul::before{content:\"\";position:absolute;top:0;left:50%;border-left:2px solid var(--o-line);width:0;height:26px}\n.tree>li{padding-top:0}\n.node{display:flex;flex-direction:column;align-items:flex-start;gap:3px;width:118px;padding:9px 10px;border:2px solid var(--tc,var(--o-fg));border-radius:10px;background:var(--o-surface);color:var(--o-fg);text-align:left;font-family:var(--o-body);cursor:pointer}\n.node .nm{display:flex;align-items:center;gap:7px;min-width:0}\n.node .dot{flex:none;width:10px;height:10px;border-radius:50%;background:var(--tc)}\n.node b{font:700 14px/1.15 var(--o-body)}\n.node small{display:block;font-size:11.5px;color:var(--o-muted);line-height:1.25}\n.node.big{width:172px}\n.node[aria-pressed=\"true\"]{background:color-mix(in srgb,var(--tc) 18%,var(--o-surface))}\n.node.owner{border-style:dashed;cursor:default;width:190px}\n@media (max-width:720px){\n  .tree{display:block;width:auto;margin:0}\n  .tree ul{display:block;padding:0 0 0 14px;margin-left:12px;border-left:2px solid var(--o-line)}\n  .tree ul::before,.tree li>ul::before{display:none}\n  .tree li{display:block;padding:10px 0 0 16px}\n  .tree li::before{display:block;content:\"\";position:absolute;left:0;top:34px;width:16px;height:0;right:auto;border:0;border-top:2px solid var(--o-line);border-radius:0}\n  .tree li::after{display:none}\n  .tree>li{padding-left:0}.tree>li::before{display:none}\n  .tree li:only-child{padding-top:10px}\n  .tree>li:only-child{padding-top:0}\n  .node,.node.big,.node.owner{width:auto;max-width:none}\n}\n\n.dock{display:flex;align-items:center;gap:6px;padding:8px;background:var(--o-surface);border:1px solid var(--o-line);border-radius:12px;overflow-x:auto}\n.who{flex:none;display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:9px;border:1px solid transparent;background:transparent;color:var(--o-fg);font:600 14px var(--o-body);cursor:pointer;white-space:nowrap}\n.who i{width:11px;height:11px;border-radius:50%;background:var(--tc,var(--o-muted))}\n.who:hover{background:color-mix(in srgb,var(--o-fg) 7%,transparent)}\n.who[aria-pressed=\"true\"]{border-color:var(--o-fg);background:color-mix(in srgb,var(--o-fg) 8%,transparent)}\n.dock .sep{flex:none;width:1px;align-self:stretch;background:var(--o-line);margin:2px 4px}\n\n.panel{background:var(--o-surface);border:1px solid var(--o-line);border-radius:12px;padding:20px;min-width:0}\n@media (min-width:980px){.panel{position:sticky;top:16px;max-height:calc(100vh - 32px);overflow-y:auto}}\n.p-head{display:flex;align-items:center;gap:12px;margin-bottom:12px}\n.p-dot{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--tc) 22%,transparent);border:2px solid var(--tc)}\n.p-dot i{width:14px;height:14px;border-radius:50%;background:var(--tc)}\n.panel h2{margin:2px 0 0;font:700 30px/1 var(--o-display);text-transform:uppercase;letter-spacing:.01em}\n.panel h3{margin:18px 0 6px;font:600 13px/1 var(--o-display);letter-spacing:.14em;text-transform:uppercase;color:var(--o-muted)}\n.panel h3 em{font-style:normal;margin-left:8px;padding:2px 7px;border-radius:5px;background:color-mix(in srgb,var(--o-amber) 30%,transparent);color:var(--o-fg);letter-spacing:.06em;font-family:var(--o-body);font-weight:600;font-size:11px;text-transform:none}\n.panel ul{margin:0;padding:0;list-style:none;display:grid;gap:8px}\n.panel li{padding-left:16px;position:relative;text-wrap:pretty}\n.panel li::before{content:\"\";position:absolute;left:0;top:.62em;width:7px;height:7px;border-radius:2px;background:var(--tc,var(--o-alert))}\n.status{display:inline-flex;align-items:center;gap:8px;margin:0;padding:5px 10px;border-radius:7px;background:color-mix(in srgb,var(--sc) 18%,transparent);font-weight:600;font-size:13px}\n.status i{width:8px;height:8px;border-radius:50%;background:var(--sc)}\n.rel{margin:12px 0 0;font-size:13.5px;color:var(--o-muted);display:grid;gap:3px}\n.rel b{color:var(--o-fg);font-weight:600}\n.fnd li::before{background:var(--fc)}\n.fnd b.sev{font:700 10px/1 var(--o-body);letter-spacing:.08em;text-transform:uppercase;margin-right:6px;padding:2px 5px;border-radius:4px;color:#fff;background:var(--fc);vertical-align:1px}\n.panel h3 small{font:500 11px var(--o-body);letter-spacing:0;text-transform:none;margin-left:8px}\n.note{margin:18px 0 0;padding-top:14px;border-top:1px solid var(--o-line);font-size:13px;color:var(--o-muted)}\n.pending{color:var(--o-muted);font-style:normal;font-weight:600}\n@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}\n.chat{margin-top:12px;background:var(--o-surface);border:1px solid var(--o-line);border-radius:12px;display:flex;flex-direction:column;overflow:hidden}\n.c-head{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--o-line)}\n.c-head b{font:700 20px/1 var(--o-display);text-transform:uppercase;letter-spacing:.02em}\n.c-head small{color:var(--o-muted);font-size:12.5px}\n.c-head button{all:unset;margin-left:auto;cursor:pointer;font-size:12px;color:var(--o-muted);padding:4px 8px;border-radius:6px}\n.c-head button:hover,.c-head button:focus-visible{background:color-mix(in srgb,var(--o-fg) 8%,transparent)}\n.c-log{height:min(420px,56vh);overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;background:var(--o-stage)}\n.msg{max-width:min(680px,88%);padding:9px 13px;border-radius:12px;font-size:14.5px;line-height:1.45;overflow-wrap:anywhere}\n.msg p{margin:0}.msg p+p,.msg p+ul,.msg ul+p{margin-top:6px}.msg ul{margin:0;padding-left:18px;display:block}.msg li{padding:0;margin:2px 0}.msg li::before{display:none}\n.msg.ia{align-self:flex-start;background:var(--o-surface);border:1px solid var(--o-line)}\n.msg.user{align-self:flex-end;background:var(--o-fg);color:var(--o-bg)}\n.msg.err{border-color:var(--o-alert);color:var(--o-alert)}\n.dots i{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:var(--o-muted);animation:cd 1s infinite ease-in-out}\n.dots i:nth-child(2){animation-delay:.15s}.dots i:nth-child(3){animation-delay:.3s}\n@keyframes cd{0%,80%,100%{opacity:.25}40%{opacity:1}}\n@media (prefers-reduced-motion:reduce){.dots i{animation:none}}\n.c-sug{display:flex;gap:6px;flex-wrap:wrap;padding:10px 16px 0}\n.sg{all:unset;box-sizing:border-box;cursor:pointer;font-size:12.5px;padding:5px 10px;border:1px solid var(--o-line);border-radius:999px;color:var(--o-fg)}\n.sg:hover,.sg:focus-visible{background:color-mix(in srgb,var(--o-fg) 8%,transparent)}\n.c-note{margin:8px 16px 0;font-size:12.5px;color:var(--o-muted)}\n.c-form{display:flex;gap:8px;padding:12px 16px;align-items:flex-end}\n.c-form textarea{flex:1;min-width:0;resize:none;font:inherit;font-size:15px;line-height:1.35;padding:9px 12px;border:1px solid var(--o-line);border-radius:10px;background:var(--o-bg);color:var(--o-fg);max-height:140px}\n.c-form textarea:focus-visible{outline:2px solid var(--o-fg);outline-offset:1px}\n.c-form button{font:700 14px var(--o-body);padding:10px 18px;border:0;border-radius:10px;background:var(--o-fg);color:var(--o-bg);cursor:pointer;min-height:40px}\n.c-form button:disabled{opacity:.45;cursor:default}\n";
  var MARK = "<div class=\"bar-top\">\n  <div class=\"chips\" aria-label=\"Resumen\">\n    <span class=\"chip\"><b id=\"n-ag\">9</b> agentes</span>\n    <button class=\"chip red\" id=\"chip-urg\" type=\"button\" hidden><b id=\"n-urg\">0</b> urgentes</button>\n  </div>\n  <div class=\"tabs\" role=\"tablist\" aria-label=\"Vista\">\n    <button type=\"button\" role=\"tab\" id=\"tab-3d\" aria-selected=\"true\">Oficina 3D</button>\n    <button type=\"button\" role=\"tab\" id=\"tab-org\" aria-selected=\"false\">Organigrama</button>\n  </div>\n</div>\n<div class=\"layout\">\n  <section class=\"left\" aria-label=\"Oficina\">\n    <div class=\"stage\" id=\"stage\">\n      <div id=\"cards\"></div>\n      <div class=\"callout\"><b id=\"callout-b\">Cargando</b><span id=\"callout-s\"></span><button type=\"button\" id=\"call-toca\">Ver resumen</button></div>\n      <button class=\"home\" id=\"home\" type=\"button\">Vista general</button>\n      <div class=\"hint\" id=\"hint\">Arrastra para girar \u00b7 rueda o pellizco para acercar \u00b7 toca un agente</div>\n      <div class=\"nogl\" id=\"nogl\" hidden>No se pudo abrir la vista 3D en este navegador. El organigrama y la barra de agentes siguen disponibles.</div>\n    </div>\n    <div class=\"org\" id=\"org\" hidden></div>\n    <nav class=\"dock\" id=\"dock\" aria-label=\"Agentes\"></nav>\n    <section class=\"chat\" id=\"chat\" aria-label=\"Charla con el Director Ejecutivo\">\n  <div class=\"c-head\"><b>Director Ejecutivo</b><small>Habla con \u00e9l como con una persona. Solo recomienda: nada sale sin tu \u00abva\u00bb.</small><button type=\"button\" id=\"c-clear\">Borrar charla</button></div>\n  <div class=\"c-log\" id=\"c-log\" role=\"log\" aria-live=\"polite\"></div>\n  <div class=\"c-sug\" id=\"c-sug\"></div>\n  <p class=\"c-note\" id=\"c-note\" hidden></p>\n  <form class=\"c-form\" id=\"c-form\"><textarea id=\"c-in\" rows=\"1\" placeholder=\"Escr\u00edbele al director\u2026\" aria-label=\"Mensaje para el Director Ejecutivo\"></textarea><button type=\"submit\" id=\"c-send\">Enviar</button></form>\n</section>\n  </section>\n  <aside class=\"panel\" id=\"panel\" aria-live=\"polite\"></aside>\n</div>";
  /* ---------- Análisis en vivo (solo lectura sobre los datos que ya tiene el sistema) ---------- */
  var IDS = ['ejecutivo', 'admin', 'compras', 'pagos', 'cobros', 'maquinaria', 'impuestos', 'dirmkt', 'imagen', 'guion', 'redes'];
  var SEV = { alta: { l: 'Urgente', c: '#d8352a' }, media: { l: 'Revisar', c: '#d98a00' }, info: { l: 'Dato', c: '#666c76' } };
  function mm(n) {
    var a = Math.abs(n), s = n < 0 ? '−' : '';
    if (a >= 1e6) return s + '$' + (a / 1e6).toLocaleString('es-AR', { maximumFractionDigits: 1 }) + ' M';
    return s + '$' + Math.round(a).toLocaleString('es-AR');
  }
  function lts(n) { return Math.round(n).toLocaleString('es-AR') + ' L'; }
  function dias(a, b) { return Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function addDays(d, n) { return new Date(Date.parse(d + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10); }
  function suma(a, f) { var s = 0; for (var i = 0; i < a.length; i++) s += f(a[i]); return s; }
  function agrupar(a, kf) { var m = {}; a.forEach(function (x) { var k = kf(x); (m[k] = m[k] || []).push(x); }); return m; }

  function analizar(D) {
    var S = D.S, hoy = D.hoy, out = { find: {}, tot: {}, bad: {}, feed: [], keys: {} };
    IDS.forEach(function (id) { out.find[id] = []; out.tot[id] = 0; out.bad[id] = 0; });
    function add(id, sev, txt) { out.find[id].push([sev, txt]); }
    function chk(id, bad, sev, txt) { out.tot[id]++; if (bad) { out.bad[id]++; add(id, sev, typeof txt === 'function' ? txt() : txt); } }
    var ter = {}; (S.terceros || []).forEach(function (t) { ter[t.id] = t; });
    var cen = {}; (S.centros || []).forEach(function (c) { cen[c.id] = c; });
    function tn(id) { return ter[id] ? ter[id].razon : 'Sin proveedor'; }
    var act = (S.trans || []).filter(function (t) { return t.estado === 'activa'; });
    var ars = act.filter(function (t) { return t.moneda === 'ARS'; });
    var sal = ars.filter(function (t) { return t.tipo === 'salida'; });
    var ent = ars.filter(function (t) { return t.tipo === 'entrada'; });
    var facs = S.facturas || [];
    var NC = function (f) { return String(f.tipo).indexOf('NC') === 0; };
    var ventas = facs.filter(function (f) { return f.lado === 'debito' && !NC(f); });
    var compras = facs.filter(function (f) { return f.lado === 'credito' && !NC(f); });
    var EXCL = /mano de obra|moneda extranjera|distribuci|impuesto|sueldo|repuestos|arca/i;
    var excl = function (id) { var t = ter[id]; return !t || t.sistema || EXCL.test(t.razon); };
    var obras = (S.centros || []).filter(function (c) { return c.tipo === 'obra'; });
    var cuentas = S.cuentas || [];
    var saldos = cuentas.map(function (c) { return { c: c, s: D.saldo(c.id) }; });
    var negativas = saldos.filter(function (x) { return x.s < -0.5; });

    /* ===== COBROS ===== */
    var sinCobro = ventas.filter(function (f) { return D.saldoFact(f) > 0.5; }).map(function (f) { return { f: f, d: dias(f.fecha, hoy), s: D.saldoFact(f) }; }).sort(function (a, b) { return b.s - a.s; });
    chk('cobros', sinCobro.length > 0, sinCobro.some(function (x) { return x.d > 15; }) ? 'alta' : 'media', function () {
      var top = sinCobro.slice(0, 3).map(function (x) { return esc(tn(x.f.terceroId)) + ' ' + esc(x.f.tipo) + ' ' + x.f.nro + ' (' + mm(x.s) + ', hace ' + x.d + ' días)'; }).join('; ');
      return sinCobro.length + ' factura' + (sinCobro.length === 1 ? '' : 's') + ' de venta sin cobro vinculado, por ' + mm(suma(sinCobro, function (x) { return x.s; })) + ': ' + top + (sinCobro.length > 3 ? ' y ' + (sinCobro.length - 3) + ' más' : '') + '. Si ya se cobraron, falta vincular el cobro a la factura.';
    });
    var recopBorradas = {};
    (S.recop || []).forEach(function (r) {
      if (r.estado === 'cargada' && r.lado === 'debito' && r.facturaId && !facs.some(function (f) { return f.id === r.facturaId || (f.pv === r.pv && f.nro === r.nro && f.tipo === r.tipo); })) recopBorradas[r.pv + '-' + r.nro] = r;
    });
    Object.keys(recopBorradas).forEach(function (k) {
      var r = recopBorradas[k], parecida = ventas.filter(function (f) { return Math.abs(f.total - r.total) < 1 && f.nro !== r.nro; })[0];
      chk('cobros', true, 'alta', 'La factura de venta ' + esc(r.tipo) + ' ' + r.nro + ' (' + esc(r.razon || 'sin nombre') + ', ' + mm(r.total) + ') figura cargada desde el mail, pero ya no está en Facturas (se borró).' +
        (parecida ? ' Tiene el mismo importe que la ' + esc(parecida.tipo) + ' ' + parecida.nro + '. Si las dos tienen CAE en ARCA, hay un cobro más por registrar; si fue un error, hay que anularla con una nota de crédito.' : ' Revisar en ARCA si sigue vigente.'));
    });
    function toks(x) { return String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(function (w) { return w.length > 2 && !/^(del|las|los|srl|sas|saci|sacif)$/.test(w); }); }
    var tl = (S.terceros || []).filter(function (t) { return !t.sistema; }), root = {};
    tl.forEach(function (t) { root[t.id] = t.id; });
    function rt(id) { while (root[id] !== id) id = root[id]; return id; }
    var pares = [];
    for (var a1 = 0; a1 < tl.length; a1++) for (var b1 = a1 + 1; b1 < tl.length; b1++) {
      var ta = toks(tl[a1].razon), tb = toks(tl[b1].razon);
      if (ta.length < 2 || tb.length < 2) continue;
      var sub = function (x, y) { return x.every(function (w) { return y.indexOf(w) >= 0; }); };
      if (sub(ta, tb) || sub(tb, ta) || (tl[a1].cuit && tl[a1].cuit === tl[b1].cuit)) { root[rt(tl[a1].id)] = rt(tl[b1].id); pares.push([tl[a1], tl[b1]]); }
    }
    chk('admin', pares.length > 0, 'media', function () { return 'Posible cliente o proveedor cargado dos veces: ' + pares.slice(0, 3).map(function (p) { return '«' + esc(p[0].razon) + '» y «' + esc(p[1].razon) + '»'; }).join('; ') + '. Los cobros y las facturas quedan repartidos entre los dos.'; });
    var gk = function (id) { return root[id] ? rt(id) : id; };
    var vPorTer = agrupar(ventas, function (f) { return gk(f.terceroId); });
    var ePorTer = agrupar(ent, function (t) { return gk(t.terceroId); });
    Object.keys(ePorTer).forEach(function (id) {
      var t = ter[id]; if (!t) return;
      var cob = suma(ePorTer[id], function (x) { return x.total; }), fac = suma(vPorTer[id] || [], function (f) { return f.total; });
      if (/^codes\b/i.test(t.razon)) {
        chk('cobros', cob > 1e6, 'media', ePorTer[id].length + ' entradas a nombre de «' + esc(t.razon) + '» por ' + mm(cob) + ' parecen aportes propios y no cobros de clientes. Revisar cómo se clasifican.');
      } else {
        chk('cobros', cob - fac > 10e6 && fac < cob * 0.9, 'alta', esc(t.razon) + ': se cobraron ' + mm(cob) + ' y hay facturas de venta cargadas por ' + mm(fac) + '.' + (fac === 0 ? ' No hay ninguna factura de venta a este cliente.' : ''));
      }
    });
    var cajaObra = [];
    obras.forEach(function (o) {
      var cob = suma(ent.filter(function (t) { return t.ccId === o.id; }), function (t) { return t.total; });
      var gas = suma(sal.filter(function (t) { return t.ccId === o.id; }), function (t) { return t.total; });
      if (o.fin || !(o.contrato > 0)) return;
      cajaObra.push({ o: o, cob: cob, gas: gas });
      chk('cobros', gas > cob && gas > 5e6, 'media', esc(o.codigo + ' ' + o.nombre) + ': gastó ' + mm(gas) + ' y cobró ' + mm(cob) + ' (' + (cob / o.contrato * 100).toFixed(1).replace('.', ',') + '% de ' + mm(o.contrato) + '). La obra se está financiando con caja propia.');
    });
    if (cajaObra.length) add('cobros', 'info', 'Cobrado contra contrato: ' + cajaObra.sort(function (a, b) { return b.o.contrato - a.o.contrato; }).slice(0, 5).map(function (x) { return esc(x.o.codigo) + ' ' + (x.cob / x.o.contrato * 100).toFixed(0) + '%'; }).join(' · ') + '.');
    var certCli = (S.certifs || []).length;
    add('cobros', 'info', 'Las ' + certCli + ' certificaciones cargadas son de subcontratistas. Los certificados de obra emitidos a clientes no se registran en el sistema, por eso no se puede seguir certificado → factura → cobro.');

    /* ===== COMPRAS ===== */
    var salPorTer = agrupar(sal.filter(function (t) { return !excl(t.terceroId); }), function (t) { return t.terceroId; });
    var comPorTer = agrupar(compras, function (f) { return f.terceroId; });
    var faltan = Object.keys(salPorTer).map(function (id) {
      var pag = suma(salPorTer[id], function (t) { return t.total; }), fac = suma(comPorTer[id] || [], function (f) { return f.total; });
      return { id: id, pag: pag, fac: fac, dif: pag - fac, n: salPorTer[id].length };
    }).filter(function (x) { return x.dif > 5e6; }).sort(function (a, b) { return b.dif - a.dif; }).slice(0, 5);
    faltan.forEach(function (x) {
      chk('compras', true, 'alta', x.fac === 0 ? esc(tn(x.id)) + ' (' + mm(x.pag) + ' en ' + x.n + ' pagos) no tiene ninguna factura de compra cargada.'
        : esc(tn(x.id)) + ': pagos por ' + mm(x.pag) + ' y facturas cargadas por ' + mm(x.fac) + '. Faltan comprobantes por unos ' + mm(x.dif) + '.');
    });
    var totSal = suma(sal.filter(function (t) { return !(ter[t.terceroId] && ter[t.terceroId].sistema); }), function (t) { return t.total; });
    var rank = Object.keys(salPorTer).map(function (id) { return { id: id, s: suma(salPorTer[id], function (t) { return t.total; }) }; }).sort(function (a, b) { return b.s - a.s; });
    var top3 = rank.slice(0, 3), sh3 = totSal ? suma(top3, function (x) { return x.s; }) / totSal : 0;
    chk('compras', sh3 > 0.35, 'media', function () { return 'Tres proveedores (' + top3.map(function (x) { return esc(tn(x.id)); }).join(', ') + ') se llevan ' + mm(suma(top3, function (x) { return x.s; })) + ': el ' + Math.round(sh3 * 100) + '% de lo que salió en pesos. Son los candidatos para negociar precio y plazo.'; });
    var comb = S.comb || [];
    if (comb.length) {
      var tieneKm = comb.some(function (x) { return x.km != null || x.horas != null; });
      chk('maquinaria', !tieneKm, 'alta', 'Combustible: la carga solo guarda litros, precio y máquina. No tiene kilómetros ni horas de motor, así que no se puede calcular litros por hora o kilómetros por litro ni saber si se usó lo que se dice. Para auditarlo hay que agregar ese dato en cada carga.');
      var pr = S.precios || {}, prem = comb.filter(function (x) { return x.tipo === 'diesel_premium'; });
      var litP = suma(prem, function (x) { return x.litros; });
      if (litP > 0 && pr.diesel_premium > 0 && pr.diesel_500 > 0 && pr.diesel_premium > pr.diesel_500) {
        var dif = pr.diesel_premium - pr.diesel_500, f0 = comb.map(function (x) { return x.fh.slice(0, 10); }).sort()[0], nd = Math.max(1, dias(f0, hoy));
        chk('compras', true, 'media', 'Combustible: se cargaron ' + lts(litP) + ' de Diésel premium a ' + mm(pr.diesel_premium) + ' y el Diésel 500 sale ' + mm(pr.diesel_500) + ' (' + (dif / pr.diesel_500 * 100).toFixed(1).replace('.', ',') + '% menos). Son ' + mm(dif * litP) + ' de diferencia en ' + nd + ' días, o sea unos ' + mm(dif * litP / nd * 30) + ' por mes. Preguntar al mecánico qué máquinas pueden usar Diésel 500.');
      }
      var porMaq = agrupar(comb, function (x) { return x.maqId; }), ritmos = [];
      Object.keys(porMaq).forEach(function (id) {
        var l = porMaq[id].slice().sort(function (a, b) { return a.fh < b.fh ? -1 : 1; });
        for (var i = 1; i < l.length; i++) {
          var g = dias(l[i - 1].fh.slice(0, 10), l[i].fh.slice(0, 10));
          if (g >= 1 && g <= 7 && l[i].litros / g >= 100) ritmos.push({ id: id, r: l[i].litros / g, lit: l[i].litros, g: g, f: l[i].fh.slice(0, 10) });
        }
      });
      ritmos.sort(function (a, b) { return b.r - a.r; });
      if (ritmos.length) add('maquinaria', 'info', 'Ritmo diario entre cargas (más alto): ' + ritmos.slice(0, 3).map(function (x) { return esc((cen[x.id] || {}).nombre || 'Máquina') + ' ' + lts(x.lit) + ' en ' + x.g + ' día' + (x.g > 1 ? 's' : '') + ' (' + Math.round(x.r) + ' L/día)'; }).join('; ') + '. Es alto pero puede ser normal: sin horómetro no se puede confirmar.');

      /* ===== MAQUINARIA: litros cargados -> horas de motor esperadas (referencias por ficha del fabricante o por tipo de máquina) ===== */
      var REF = [
        { re: /pc.?200/i, tank: 400, lh: [10, 16], f: 'ficha Komatsu PC200-8: tanque 400 L, motor 103 kW' },
        { re: /zl.?50|xcmg/i, tank: 240, lh: [11, 16], f: 'ficha XCMG ZL50GN: tanque 240 L, motor Weichai 121 kW' },
        { re: /clg.?365|liugong/i, tank: 0, lh: [4, 7], f: 'ficha Liugong CLG365A: motor Yanmar 47,8 kW' },
        { re: /excavadora|retro/i, tank: 0, lh: [10, 16], f: 'rango típico de excavadora de 20 t (falta el manual de esta máquina)' },
        { re: /motoniveladora|14g|770/i, tank: 0, lh: [10, 16], f: 'rango típico de motoniveladora (falta el manual de esta máquina)' },
        { re: /pala|cargadora|lonking/i, tank: 0, lh: [9, 16], f: 'rango típico de pala cargadora de 5 t (falta el manual de esta máquina)' }
      ];
      function refDe(c) { var t = ((c.marca || '') + ' ' + (c.modelo || '') + ' ' + (c.nombre || '')); for (var i = 0; i < REF.length; i++) if (REF[i].re.test(t)) return REF[i]; return null; }
      function lunes(f) { var d = new Date(Date.parse(f + 'T12:00:00Z')), w = (d.getUTCDay() + 6) % 7; return new Date(d.getTime() - w * 864e5).toISOString().slice(0, 10); }
      function dm(f) { return f.split('-').reverse().slice(0, 2).join('/'); }
      var sinRef = [], conRef = 0, vehic = 0;
      Object.keys(porMaq).forEach(function (id) {
        var c = cen[id] || {}, nm = esc(c.nombre || 'Máquina'), R = refDe(c);
        var l = porMaq[id].slice().sort(function (x, y) { return x.fh < y.fh ? -1 : 1; });
        if (/camion|camión|mercedes|hilux|ranger|toyota|ford|camioneta/i.test((c.nombre || '') + ' ' + (c.marca || ''))) { vehic++; return; }
        if (!R) { sinRef.push(nm); return; }
        conRef++;
        var lo = R.lh[0], hi = R.lh[1], med = (lo + hi) / 2;
        if (R.tank) l.forEach(function (x) { chk('maquinaria', x.litros > R.tank * 1.02, 'alta', nm + ': el ' + dm(x.fh.slice(0, 10)) + ' se cargaron ' + lts(x.litros) + ' y el tanque es de ' + R.tank + ' L (' + R.f + '). Una carga no puede ser mayor que el tanque: revisar si se cargó en más de una máquina o si el dato está mal.'); });
        for (var i = 1; i < l.length; i++) {
          var hrs = (Date.parse(l[i].fh) - Date.parse(l[i - 1].fh)) / 36e5;
          if (hrs < 12) continue;
          var disp = hrs / 2, L = l[i].litros, hMin = L / hi, hTip = L / med;
          var rango = Math.round(hMin) + ' a ' + Math.round(L / lo) + ' h';
          if (hMin > disp) chk('maquinaria', true, 'alta', nm + ': entre el ' + dm(l[i - 1].fh.slice(0, 10)) + ' y el ' + dm(l[i].fh.slice(0, 10)) + ' se repusieron ' + lts(L) + ', que son ' + rango + ' de motor, y en ese tiempo hay como máximo ' + Math.round(disp) + ' h de trabajo posible (12 h por día). El consumo no cierra: revisar con el operador y el horómetro.');
          else if (hTip > disp * 0.8) chk('maquinaria', true, 'media', nm + ': entre el ' + dm(l[i - 1].fh.slice(0, 10)) + ' y el ' + dm(l[i].fh.slice(0, 10)) + ' se repusieron ' + lts(L) + ' (' + rango + ' de motor) en un lapso con ' + Math.round(disp) + ' h posibles. Está al límite: pedir las horas reales del horómetro.');
          else out.tot.maquinaria++;
        }
        var sem = agrupar(l, function (x) { return lunes(x.fh.slice(0, 10)); });
        Object.keys(sem).sort().reverse().slice(0, 2).forEach(function (w) {
          var li = suma(sem[w], function (x) { return x.litros; }), n = sem[w].length;
          add('maquinaria', 'info', nm + ' · semana del ' + dm(w) + ': ' + lts(li) + ' en ' + n + ' carga' + (n > 1 ? 's' : '') + ' → entre ' + Math.round(li / hi) + ' y ' + Math.round(li / lo) + ' h de motor (' + lo + ' a ' + hi + ' L/h, ' + R.f + ').');
        });
      });
      if (vehic) add('maquinaria', 'info', 'Camiones y camionetas: se controlan por kilómetros y litros cada 100 km, no por horas. Falta el kilometraje en cada carga.');
      if (sinRef.length) add('maquinaria', 'info', 'Sin manual ni modelo cargado, no se puede estimar las horas de: ' + sinRef.join(', ') + '. Hace falta marca, modelo y el manual (o foto de la chapa).');
      add('maquinaria', 'info', 'Cómo se calcula: horas = litros cargados ÷ litros por hora de la ficha o del tipo de máquina. Supone que cada carga llena el tanque. Es una estimación: solo el horómetro lo confirma. Un desvío es para revisar, no prueba un robo.');
    }
    var dupC = agrupar(compras, function (f) { return f.terceroId + '|' + f.total + '|' + f.fecha; });
    Object.keys(dupC).forEach(function (k) {
      var g = dupC[k];
      chk('compras', g.length > 1 && g[0].total > 1e5, 'media', function () { return esc(tn(g[0].terceroId)) + ': ' + g.length + ' facturas con el mismo día e importe (' + g.map(function (f) { return f.nro; }).join(', ') + ') por ' + mm(g[0].total) + ' cada una. Confirmar que no se compró dos veces lo mismo.'; });
    });
    add('compras', 'info', 'Mejores proveedores: hoy se puede medir cuánto se les compra, pero no si entregan a tiempo ni la calidad, porque eso no se carga. Comparar precios contra el mercado exige que las facturas lleven cantidades y precios unitarios; las que son importes globales («1 unidad») no se pueden comparar.');

    /* ===== PAGOS ===== */
    var propios = (S.cheques || []).filter(function (c) { return c.origen === 'propio' && c.estado === 'emitido'; });
    var venc = propios.filter(function (c) { return c.fechaPago < hoy; });
    var fut = propios.filter(function (c) { return c.fechaPago >= hoy; });
    var d7 = fut.filter(function (c) { return c.fechaPago <= addDays(hoy, 7); }), d30 = fut.filter(function (c) { return c.fechaPago <= addDays(hoy, 30); });
    chk('pagos', venc.length > 0, 'alta', function () { return venc.length + ' cheque' + (venc.length === 1 ? '' : 's') + ' emitido' + (venc.length === 1 ? '' : 's') + ' con la fecha de pago vencida y sin cerrar (' + mm(suma(venc, function (c) { return c.importe; })) + '). Hay que confirmar si se debitaron.'; });
    chk('pagos', d7.length > 0, 'alta', function () { return 'Cheques por pagar: ' + d7.length + ' en los próximos 7 días (' + mm(suma(d7, function (c) { return c.importe; })) + ') y ' + d30.length + ' en los próximos 30 (' + mm(suma(d30, function (c) { return c.importe; })) + '). En total hay ' + fut.length + ' cheques comprometidos por ' + mm(suma(fut, function (c) { return c.importe; })) + '.'; });
    var bancos = suma(saldos.filter(function (x) { return x.c.moneda === 'ARS' && (x.c.tipo === 'banco' || x.c.tipo === 'billetera_virtual' || x.c.tipo === 'caja') && x.s > 0; }), function (x) { return x.s; });
    var deuda = suma(venc.concat(fut), function (c) { return c.importe; });
    if (deuda > 0) chk('pagos', bancos < deuda * 1.2, 'alta', 'Los saldos positivos en pesos (' + mm(bancos) + ') no cubren con holgura los cheques por pagar (' + mm(deuda) + ').');
    if (deuda > 0 && bancos >= deuda * 1.2) add('pagos', 'info', 'Cobertura: ' + mm(bancos) + ' en cuentas contra ' + mm(deuda) + ' de cheques comprometidos (' + (bancos / deuda).toFixed(1).replace('.', ',') + ' veces).');
    negativas.forEach(function (x) { chk('pagos', true, 'alta', 'El saldo de «' + esc(x.c.nombre) + '» da ' + mm(x.s) + ': un saldo negativo no existe en la realidad. Faltan ingresos o transferencias sin cargar, y mientras tanto el saldo real no se conoce.'); });
    var mes = hoy.slice(0, 7), eM = suma(ent.filter(function (t) { return t.fecha.slice(0, 7) === mes; }), function (t) { return t.total; }), sM = suma(sal.filter(function (t) { return t.fecha.slice(0, 7) === mes; }), function (t) { return t.total; });
    chk('pagos', sM > eM * 1.3 && sM > 20e6, 'media', 'En lo que va del mes salieron ' + mm(sM) + ' y entraron ' + mm(eM) + ' (' + mm(eM - sM) + '). Si se repite, se está viviendo de cobros anteriores.');
    var sinPago = compras.filter(function (f) { return D.saldoFact(f) > 0.5; });
    chk('pagos', sinPago.length > 0, 'media', function () { return sinPago.length + ' facturas de compra (' + mm(suma(sinPago, function (f) { return D.saldoFact(f); })) + ') sin pago vinculado. Puede ser deuda real o pagos sin vincular; mientras tanto no se puede medir el plazo de pago.'; });
    var salTodas = suma(sal, function (t) { return t.total; }), porT = agrupar(sal, function (t) { return t.terceroId; });
    Object.keys(porT).forEach(function (id) {
      var s = suma(porT[id], function (t) { return t.total; });
      if (ter[id] && !ter[id].sistema && s > 50e6 && s / salTodas > 0.25) chk('pagos', true, 'media', esc(tn(id)) + ' concentra ' + mm(s) + ' (' + Math.round(s / salTodas * 100) + '% de todo lo que salió en pesos). Confirmar el destino: ' + esc(porT[id].slice(0, 2).map(function (t) { return t.concepto; }).join(' / ')) + '.');
    });
    var idg = agrupar(sal.filter(function (t) { return t.total > 1e6; }), function (t) { return t.terceroId + '|' + t.fecha; });
    Object.keys(idg).forEach(function (k) {
      var g = idg[k], same = agrupar(g, function (t) { return Math.round(t.total); });
      Object.keys(same).forEach(function (a) {
        var s = same[a];
        if (s.length >= 2) chk('pagos', true, 'media', s.length + ' movimientos idénticos de ' + mm(s[0].total) + ' el mismo día a ' + esc(tn(s[0].terceroId)) + ' (' + esc(s[0].concepto) + '). Revisar si son cuotas distintas o el mismo pago cargado varias veces (en ese caso los gastos están inflados).');
        var tot = s.length * s[0].total, otro = g.filter(function (t) { return Math.abs(t.total - tot) < 3 && t !== s[0]; })[0];
        if (s.length >= 2 && otro) chk('pagos', true, 'media', 'Posible doble registro: «' + esc(otro.concepto) + '» (' + mm(otro.total) + ') y ' + s.length + ' movimientos de ' + mm(s[0].total) + ' suman lo mismo, el mismo día y al mismo proveedor.');
      });
    });
    var arca = suma(sal.filter(function (t) { return ter[t.terceroId] && ter[t.terceroId].sistema; }), function (t) { return t.total; });
    if (arca > 0) add('pagos', 'info', 'El impuesto a los débitos y créditos suma ' + mm(arca) + '. Conviene preguntarle a tu contador si lo estás tomando como pago a cuenta de otros impuestos.');
    var usd = saldos.filter(function (x) { return x.c.moneda === 'USD'; });
    if (usd.length) add('pagos', 'info', 'Dólares: ' + usd.map(function (x) { return 'USD ' + Math.round(x.s).toLocaleString('es-AR') + ' en «' + esc(x.c.nombre) + '»'; }).join(', ') + '. No se suman a los totales en pesos.');
    add('pagos', 'info', 'Qué hacer con el dinero: definir el colchón de caja (cheques, sueldos e impuestos de los próximos 90 días) y, sobre lo que sobra, comparar plazo fijo, fondo común de dinero y dólares según rendimiento, riesgo y liquidez. La decisión es tuya y conviene validarla con tu contador matriculado.');

    /* ===== DIRECTOR ADMINISTRACIÓN ===== */
    negativas.forEach(function (x) { chk('admin', true, 'alta', 'Saldo negativo en «' + esc(x.c.nombre) + '» (' + mm(x.s) + '). Revisar qué movimientos faltan cargar.'); });
    var raras = act.filter(function (t) { return t.fecha < '2020-01-01' || t.fecha > addDays(hoy, 90); }).concat(facs.filter(function (f) { return f.fecha < '2020-01-01' || f.fecha > addDays(hoy, 90); }));
    chk('admin', raras.length > 0, 'media', function () { return raras.length + ' registro' + (raras.length === 1 ? '' : 's') + ' con fecha imposible (por ejemplo ' + esc(raras[0].fecha) + ' en «' + esc(raras[0].concepto || ('factura ' + raras[0].nro)) + '»). Corregir la fecha.'; });
    var sinItems = obras.filter(function (o) { return !o.fin && o.contrato > 0 && !(S.items || []).some(function (i) { return i.obraId === o.id; }); });
    chk('admin', sinItems.length > 0, 'media', function () { return 'El desvío de presupuesto no se puede calcular en ' + sinItems.length + ' de las obras activas (' + sinItems.slice(0, 4).map(function (o) { return esc(o.codigo); }).join(', ') + '): no tienen presupuesto por rubro cargado.'; });
    var prueba = (S.centros || []).filter(function (c) { return /ejemplo|prueba|test/i.test(c.nombre); }), cod = (S.centros || []).filter(function (c) { return /^0[A-Za-z]/.test(c.codigo); });
    chk('admin', prueba.length + cod.length > 0, 'media', function () { return 'Desorden en los centros de costo: ' + (prueba.length ? 'obras de prueba en la lista (' + prueba.map(function (c) { return esc(c.nombre); }).join(', ') + ')' : '') + (prueba.length && cod.length ? '; ' : '') + (cod.length ? 'código con cero en lugar de la letra O (' + cod.map(function (c) { return esc(c.codigo); }).join(', ') + ')' : '') + '.'; });
    var finVacia = obras.filter(function (o) { return o.fin && o.contrato > 0 && !act.some(function (t) { return t.ccId === o.id; }); });
    chk('admin', finVacia.length > 0, 'media', function () { return finVacia.length + ' obra' + (finVacia.length === 1 ? '' : 's') + ' figura' + (finVacia.length === 1 ? '' : 'n') + ' finalizada' + (finVacia.length === 1 ? '' : 's') + ' con contrato (' + finVacia.map(function (o) { return esc(o.codigo) + ' ' + mm(o.contrato); }).join(', ') + ') y sin un solo movimiento.'; });
    var rent = cajaObra.filter(function (x) { return x.cob > 0; }).sort(function (a, b) { return b.cob - a.cob; }).slice(0, 4);
    if (rent.length) add('admin', 'info', 'Caja por obra (cobrado menos gastado, antes de IVA e impuestos; no es la ganancia real): ' + rent.map(function (x) { return esc(x.o.codigo) + ' ' + mm(x.cob - x.gas) + (x.cob ? ' (' + ((x.cob - x.gas) / x.cob * 100).toFixed(0) + '%)' : ''); }).join(' · ') + '. La ganancia real necesita el avance físico de cada obra.');
    add('admin', 'info', 'En el sistema hay ' + obras.length + ' obras, ' + (S.terceros || []).length + ' clientes y proveedores, ' + act.length + ' movimientos, ' + (S.cheques || []).length + ' cheques y ' + facs.length + ' facturas.');

    /* ===== MARKETING ===== */
    var pub = sal.filter(function (t) { return /publicidad|marketing|instagram|redes/i.test(t.concepto || ''); });
    add('dirmkt', 'info', pub.length ? 'Gasto marcado como publicidad: ' + pub.slice(0, 2).map(function (t) { return esc(t.concepto) + ' ' + mm(t.total) + ' (' + t.fecha.split('-').reverse().join('/') + ')'; }).join('; ') + '. No hay forma de medir qué se obtuvo con eso.' : 'No hay ningún gasto de publicidad cargado, así que no se puede medir qué se invirtió.');
    /* ===== MARKETING (lectura del perfil @codesconstrucciones hecha el 29-oct-2026; se actualiza a mano al volver a leerlo) ===== */
    function mk(id, sev, txt) { out.tot[id]++; if (sev !== 'info') out.bad[id]++; add(id, sev, txt); }
    mk('imagen', 'info', 'Instagram limpio (29-oct): las 18 publicaciones quedaron archivadas, se pueden restaurar desde «Ver archivo». Foto de perfil con el logo nuevo.');
    mk('imagen', 'info', 'El material archivado es bueno (excavadora, losas, encofrado, estructura, interiores): se reusa para las series «Cómo se hace».');
    mk('imagen', 'media', 'Falta una plantilla visual fija: título sobre la foto, logo chico en una esquina y mismo estilo en todas las piezas (como Criba y Cemex).');
    mk('guion', 'media', 'La bio sigue sin decir qué hace CODES. Propuesta: «Constructora · Santiago del Estero. Obras viales, hormigón y edificios. Acá te contamos cómo se hace una obra.» Falta tu OK y agregar el WhatsApp desde el celular.');
    mk('guion', 'info', 'Línea editorial: «Cómo se hace», para informar y no para vender. 70 % edificio y construcción tradicional, 20 % maquinaria (incluye obras viales), 10 % herramientas. 3 publicaciones por semana, sin precios ni «contáctenos».');
    mk('guion', 'info', 'Primeras 4 semanas: losa en 4 pasos, cómo funciona una excavadora, antes y después; encofrado, hormigón armado, equipo; edificio piso por piso, compactación, una herramienta; controles antes de hormigonar, obra contada de principio a fin.');
    mk('guion', 'media', 'Destacados por crear: Cómo se hace, Máquinas, Herramientas, Obras y Contacto. Fijar 3 publicaciones arriba.');
    mk('redes', 'info', 'Comparación con 5 cuentas (Criba, Cemex, Vinci, Caterpillar, Groff Tractor): todas usan plantilla visual constante, texto sobre la imagen, personas en las fotos, destacados y un solo enlace. Criba (48 mil seguidores) es la más cercana en tono; Vinci (876) en tamaño.');
    mk('redes', 'media', 'La cuenta parte de 94 seguidores y 0 publicaciones. Las estadísticas de la cuenta todavía no se revisaron: falta tu OK para abrirlas.');
    var nomM = { imagen: 'Imagen', guion: 'Guion', redes: 'Redes' };
    ['imagen', 'guion', 'redes'].forEach(function (id) { out.find[id].forEach(function (f) { out.tot.dirmkt++; if (f[0] !== 'info') out.bad.dirmkt++; add('dirmkt', f[0], f[1] + ' <i>(' + nomM[id] + ')</i>'); }); });

    /* ===== EJECUTIVO ===== */
    /* ---- Impuestos: informe semanal calculado en la base (viernes 13 h) ---- */
    (function () {
      var I = D.imp;
      if (!I || !I.resumen) {
        chk('impuestos', true, 'media', 'Todavía no hay informe semanal de Impuestos. Se genera solo los viernes a las 13 h, cuando el sistema es el real.');
        return;
      }
      var r = I.resumen, sem = (I.semana || '').slice(0, 10);
      var fd = function (d) { return d ? String(d).slice(8, 10) + '/' + String(d).slice(5, 7) + '/' + String(d).slice(0, 4) : ''; };
      chk('impuestos', I.estado === 'observado', 'alta', 'El Director Adm. observó el informe de la semana del ' + fd(sem) + ': no se anunció como aprobado. Revisar los chequeos.');
      if (I.estado === 'aprobado') out.tot.impuestos++;
      (I.chequeos || []).forEach(function (c) { chk('impuestos', true, c.sev === 'alta' ? 'alta' : 'media', esc(c.t)); });
      add('impuestos', 'info', 'Ejercicio ' + fd(r.ejercicio_ini) + ' al ' + fd(r.ejercicio_fin) + ' · informe de la semana del ' + fd(sem) + ' (' + (I.estado === 'aprobado' ? 'aprobado por Dir. Adm.' : 'observado') + ').');
      add('impuestos', 'info', 'Ventas del ejercicio: ' + mm(r.ventas_brutas) + ' brutas (con IVA) y ' + mm(r.ventas_netas) + ' netas · gastos deducibles con factura: ' + mm(r.compras_deducibles) + ' · resultado a hoy: <b>' + mm(r.resultado_ytd) + '</b>.');
      add('impuestos', 'info', 'Proyección al ' + fd(r.ejercicio_fin) + ' (ritmo desde el ' + fd(r.desde_datos) + ', ' + r.dias + ' días): resultado <b>' + mm(r.resultado_proy) + '</b> · Ganancias estimado <b>' + mm(r.ganancias_proy) + '</b> · quedaría ' + mm(r.neto_proy) + ' después de impuesto. Con lo ya facturado, sin proyectar: Ganancias ' + mm(r.ganancias_ytd) + '.');
      if (r.sin_comprobante > 0) add('impuestos', 'media', 'Pagos sin factura vinculada en el ejercicio: ' + mm(r.sin_comprobante) + ' en ' + r.sin_comprobante_n + ' movimientos (' + mm(r.sin_comprobante_candidatos) + ' parecen gastos). No se descuentan: con su comprobante bajarían el impuesto.');
      add('impuestos', 'info', 'IVA del ejercicio: débito ' + mm(r.iva_debito) + ', crédito ' + mm(r.iva_credito) + ' (saldo ' + mm(r.iva_debito - r.iva_credito) + '). Impuesto a los créditos y débitos pagado: ' + mm(r.imp_debcred) + ' (puede tomarse como pago a cuenta de Ganancias; validar el porcentaje).');
      add('impuestos', 'info', 'Cómo se calcula: ventas netas menos compras netas con factura, proyectado a ritmo constante. Escala de sociedades 2026 (25 %, 30 %, 35 %). No incluye amortizaciones, sueldos, anticipos ni ajuste por inflación. Es una estimación: validar con el contador matriculado.');
    })();

    var nom = { admin: 'Dir. Adm.', compras: 'Compras', pagos: 'Pagos', cobros: 'Cobros', maquinaria: 'Maquinaria', impuestos: 'Impuestos', dirmkt: 'Marketing' };
    var todas = [];
    ['cobros', 'compras', 'pagos', 'maquinaria', 'impuestos', 'admin', 'dirmkt'].forEach(function (id) { out.find[id].forEach(function (f) { if (f[0] !== 'info') todas.push([id, f]); }); });
    todas.sort(function (a, b) { return (a[1][0] === 'alta' ? 0 : 1) - (b[1][0] === 'alta' ? 0 : 1); });
    todas.slice(0, 6).forEach(function (x) { chk('ejecutivo', true, x[1][0], x[1][1] + ' <i>(' + nom[x[0]] + ')</i>'); });
    if (!todas.length) { out.tot.ejecutivo++; add('ejecutivo', 'info', 'Sin alertas en Administración con los datos de hoy.'); }

    /* ===== MOVIMIENTO (actividad real, ordenada por fecha) ===== */
    var ev = [];
    act.forEach(function (t) {
      var who = t.tipo === 'entrada' ? 'cobros' : (t.tipo === 'salida' && !excl(t.terceroId) && /compra|material|hormig|asfalt|combust|flete|camion|alquiler|servicios/i.test((t.concepto || '') + ' ' + tn(t.terceroId)) ? 'compras' : 'pagos');
      ev.push({ k: 'T' + t.id, ag: who, f: t.fecha, o: t.numero, t: (t.tipo === 'entrada' ? 'Ingreso' : t.tipo === 'salida' ? 'Egreso' : 'Interno') + ' Nº ' + t.numero + ' · ' + (t.tipo === 'interna' ? esc(t.concepto || 'movimiento interno') : esc(tn(t.terceroId))) + ' · ' + mm(t.total) + (t.moneda === 'USD' ? ' USD' : '') });
    });
    facs.forEach(function (f) { ev.push({ k: 'F' + f.id, ag: f.lado === 'debito' ? 'cobros' : 'compras', f: f.creada || f.fecha, o: 0, t: 'Factura ' + (f.lado === 'debito' ? 'de venta ' : 'de compra ') + esc(f.tipo) + ' ' + f.nro + ' · ' + esc(tn(f.terceroId)) + ' · ' + mm(f.total) }); });
    comb.forEach(function (x) { ev.push({ k: 'G' + x.id, ag: 'compras', f: x.fh.slice(0, 10), o: 0, t: 'Combustible · ' + esc((cen[x.maqId] || {}).nombre || 'máquina') + ' · ' + lts(x.litros) }); });
    ev.push({ k: 'M-perfil', ag: 'redes', f: '2026-10-29', o: 0, t: 'Limpió y revisó @codesconstrucciones y la comparó con 5 cuentas del rubro' });
    ev.push({ k: 'M-plan', ag: 'guion', f: '2026-10-29', o: 0, t: 'Armó la línea «Cómo se hace» y el plan de 4 semanas' });
    ev.sort(function (a, b) { return a.f < b.f ? 1 : a.f > b.f ? -1 : b.o - a.o; });
    ev.forEach(function (e) { out.keys[e.k] = e; });
    out.feed = ev.slice(0, 12);
    return out;
  }

  function loadScript(src, cb) { var s = document.createElement('script'); s.src = src; s.onload = function () { cb(true); }; s.onerror = function () { cb(false); }; document.head.appendChild(s); }
  function ensureThree(cb) {
    if (window.THREE && window.THREE.OrbitControls) return cb(true);
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', function (ok) {
      if (!ok) return cb(false);
      loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', cb);
    });
  }
  function mount(host, getD) {
    var root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>' + CSS + '</style>' + MARK;
    function $(s) { return root.querySelector(s); }
    var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  /* ---------- Datos de la oficina ---------- */
  var STATES = {
    alerta:   { label: 'Urgente',      c: '#ff5a4d' },
    espera:   { label: 'En espera',    c: '#9aa6b8' },
    conectar: { label: 'Por conectar', c: '#ffc93c' },
    listo:    { label: 'Entregó',      c: '#3ddc97' }
  };
  var EXE = '#ff6a4d', ADM = '#6c7cff', MKT = '#19b394';
  var LIVE = null;
  var PEND = '<span class="pending">[pendiente]</span>';
  var AGENTS = [
    { id: 'ejecutivo', name: 'Director Ejecutivo', short: 'Ejecutivo', role: 'Habla contigo', area: 'Dirección ejecutiva', level: 'Rango 1', boss: null, tc: EXE, state: 'listo',
      desk: { x: 0, z: -6.2, w: 3.4 }, look: { shirt: 0x1d2026, hat: 0xf4f4f0, tie: 0xff6a4d, acc: 0xff6a4d },
      does: ['Es el único que se comunica contigo.', 'Recibe el trabajo de los dos directores y te lo entrega resumido.', 'Te dice qué está esperando tu «va». Nada se paga, se borra ni se publica sin él.'],
      skills: ['Resumen ejecutivo corto, con lo urgente primero, lo que tienes que decidir y lo que puede esperar.', 'Agenda de decisiones: lista de lo que espera tu «va», con la fecha límite de cada cosa.', 'Cruza las dos áreas: por ejemplo, cuánto se gasta en publicidad frente a lo que hay en caja.', 'Resuelve prioridades cuando las dos áreas piden lo mismo, y te avisa si no se pueden cumplir ambas.', 'Lleva el registro de lo que decidiste, para no repetir las mismas conversaciones.'],
      needs: ['Que confirmes el organigrama y las habilidades de cada agente.', 'Cada cuánto quieres el resumen y en qué formato: ' + PEND + '.'] },

    { id: 'admin', name: 'Director Adm.', short: 'Dir. Adm.', role: 'Jefe de Administración', area: 'Administración', level: 'Rango 2', boss: 'ejecutivo', tc: ADM, state: 'listo',
      desk: { x: -7.5, z: -0.2, w: 3.0 }, look: { shirt: 0x2b3038, hat: 0xf4f4f0, tie: 0x6c7cff, acc: 0x6c7cff, glasses: true },
      does: ['Dirige a los cinco contadores: Compras, Pagos, Cobros, Maquinaria e Impuestos. Aprueba el informe semanal de Impuestos antes de que se anuncie.', 'Revisa el sistema de gestión, lo sintetiza y encuentra las falencias de la empresa, como sobrecostos y desorden.'],
      skills: ['Control de presupuesto por obra: lo gastado contra lo presupuestado, con el desvío en porcentaje.', 'Cruza lo que ven los contadores: una compra sin pago, un pago sin comprobante, un cobro sin factura.', 'Calidad de la carga: datos vacíos, duplicados y registros sin obra asignada, para que el desorden se vea y se corrija.', 'Semáforo por obra (verde, amarillo, rojo) y resultado estimado de cada una.', 'Calendario de vencimientos de la empresa, impositivos incluidos, para que no se pase ninguno.', 'Resumen para el Director Ejecutivo con lo más grave arriba.'],
      needs: [LIVE, 'Qué te alarma: ' + PEND + ' % de desvío de presupuesto, días de pago vencido y de cobro atrasado.'] },

    { id: 'compras', name: 'Compras', short: 'Compras', role: 'Proveedores e insumos', area: 'Administración · contador', level: 'Rango 3', boss: 'admin', tc: ADM, state: 'listo',
      desk: { x: -11.5, z: 6.2, w: 2.4 }, look: { shirt: 0xd9dce0, hat: 0xf2c230, lan: 0x6c7cff, acc: 0x6c7cff },
      does: ['Analiza los proveedores y los insumos comprados, y los ordena por rubro.', 'Compara los precios pagados con los del mercado actual: ¿estamos comprando bien o no?'],
      skills: ['Ranking de proveedores por rubro: precio, cumplimiento de entrega, plazo de pago y calidad.', 'Historial de precio de cada insumo, con alerta cuando sube más que un índice de costos de la construcción.', 'Planilla de tres cotizaciones para las compras grandes, con la diferencia contra la más barata.', 'Detecta compras duplicadas, partidas en pedazos para esquivar controles o sin obra asignada.', 'Cantidad comprada contra cantidad presupuestada por obra, para ver desperdicios y faltantes.', 'Sugiere juntar pedidos de varias obras para negociar mejor precio y plazo de pago.'],
      needs: [LIVE, 'De dónde sacar los precios de mercado (listas de proveedores, cámaras, índices): ' + PEND + '.', 'Agregar kilómetros u horas de motor a cada carga de combustible, y el camión de cada carga de los alquilados.'] },

    { id: 'pagos', name: 'Pagos', short: 'Pagos', role: 'Egresos y finanzas', area: 'Administración · contador', level: 'Rango 3', boss: 'admin', tc: ADM, state: 'listo',
      desk: { x: -7.5, z: 6.2, w: 2.4 }, look: { shirt: 0xa9afb8, hat: 0xf2c230, lan: 0x6c7cff, acc: 0x6c7cff, glasses: true, stern: true },
      does: ['Controla todos los egresos de la empresa.', 'Te dice si estamos pagando rápido o muy lento, y si la plata se nos va de las manos.', 'Te aconseja cómo manejarla. Es un contador duro, a quien no le gusta pagar y que sabe de finanzas.'],
      skills: ['Plazo promedio de pago por proveedor, comparado con el plazo acordado.', 'Proyección de caja semanal y mensual: egresos comprometidos contra ingresos esperados, con lo que le pase Cobros.', 'No da el «ok» a un pago sin comprobante: orden de compra, remito y factura tienen que coincidir.', 'Negocia plazos y descuentos por pronto pago, y los compara con lo que costaría financiarse.', 'Ordena los vencimientos: sueldos, cargas sociales e impuestos primero, después los proveedores críticos.', 'Costo financiero: intereses, descubiertos y cheques diferidos o rechazados.', 'Ratios de salud financiera: capital de trabajo, endeudamiento y punto de equilibrio por obra.', 'Opciones para el dinero que sobra (plazo fijo, fondos comunes de inversión y otras), con rendimiento, riesgo y liquidez frente a la inflación y a lo que piden las obras. Presenta opciones: la decisión es tuya, no invierte nada sin tu «va» y conviene validarlo con tu contador matriculado.'],
      needs: [LIVE, 'Cuánta plata quieres tener siempre disponible como colchón de caja: ' + PEND + '.'] },

    { id: 'cobros', name: 'Cobros', short: 'Cobros', role: 'Presupuestos y contratos', area: 'Administración · contador', level: 'Rango 3', boss: 'admin', tc: ADM, state: 'listo',
      desk: { x: -3.5, z: 6.2, w: 2.4 }, look: { shirt: 0xeceef0, hat: 0xf2c230, lan: 0x6c7cff, acc: 0x6c7cff },
      does: ['Controla que todos los presupuestos y contratos se estén cobrando a tiempo y en forma.'],
      skills: ['Seguimiento de cada certificado de obra: emisión, aprobación, factura y cobro.', 'Antigüedad de la deuda por cliente (0 a 30, 31 a 60, 61 a 90 y más de 90 días): municipios, Vialidad, Arquitectura y privados.', 'Revisa que el monto cobrado coincida con el contrato más adicionales y redeterminaciones, y que las retenciones estén bien aplicadas.', 'Fondos de reparo y garantías: fechas de devolución y vencimiento de pólizas.', 'Anticipos financieros: que se descuenten en proporción en cada certificado.', 'Calcula los intereses por mora que se pueden reclamar según el contrato.', 'Redacta borradores de reclamos y recordatorios formales. No los envía sin tu «va».', 'Resultado de cada obra (cobrado menos gastado), junto con Compras y Pagos.'],
      needs: [LIVE, 'Plazos de cobro de cada contrato, si no están cargados en el sistema: ' + PEND + '.'] },

    { id: 'maquinaria', name: 'Maquinaria', short: 'Maquinaria', role: 'Combustible y horas de máquina', area: 'Administración · contador', level: 'Rango 3', boss: 'admin', tc: ADM, state: 'listo',
      desk: { x: -3.5, z: 1.9, w: 2.4 }, look: { shirt: 0xb9bec6, hat: 0xf2c230, lan: 0x6c7cff, acc: 0x6c7cff, glasses: true },
      does: ['Es el experto en máquinas: junta las cargas de combustible de cada semana y calcula cuántas horas debió trabajar cada una.', 'Lee el manual o la ficha de cada máquina (tanque, motor, consumo) y marca las cargas que no cierran, para revisar si el consumo es real.'],
      skills: ['Horas esperadas por máquina y por semana, a partir de litros cargados y consumo por hora del fabricante.', 'Alerta si una carga supera la capacidad del tanque o si los litros no entran en las horas posibles entre dos cargas.', 'Compara máquinas parecidas entre sí y contra la obra donde trabajaron.', 'Para camiones y camionetas: litros cada 100 km cuando haya kilometraje.'],
      needs: [LIVE, 'Marca, modelo y manual (o foto de la chapa) de cada máquina: ' + PEND + '.', 'Horas de motor (horómetro) y kilómetros en cada carga de combustible: ' + PEND + '.'] },

    { id: 'impuestos', name: 'Impuestos', short: 'Impuestos', role: 'Ganancias estimadas del ejercicio', area: 'Administración · contador', level: 'Rango 3', boss: 'admin', tc: ADM, state: 'listo',
      desk: { x: -11.5, z: 1.9, w: 2.4 }, look: { shirt: 0xdfe3e8, hat: 0xf2c230, lan: 0x6c7cff, acc: 0x6c7cff, glasses: true },
      does: ['Es el contador experto en impuestos: suma las ventas del ejercicio, resta los gastos deducibles con comprobante y estima la ganancia al cierre.', 'Todos los viernes a las 13 h arma el informe; el Director Adm. lo revisa y, si aprueba, el Director Ejecutivo avisa a Facundo y a los contadores.'],
      skills: ['Ventas brutas (con IVA) y netas del ejercicio, con notas de crédito restadas.', 'Gastos deducibles: compras y servicios con factura. Lo pagado sin comprobante se informa aparte y no se descuenta.', 'Resultado a hoy y proyectado al 31/12 según el ritmo de lo facturado.', 'Impuesto a las Ganancias estimado con la escala de sociedades 2026, y cuánto quedaría después de impuesto.', 'IVA débito y crédito del ejercicio e impuesto a los créditos y débitos pagado (puede tomarse como pago a cuenta).', 'Chequeos antes de aprobar: facturas que no suman, fechas imposibles, datos de pocos meses, gastos sin factura.'],
      needs: [LIVE, 'Amortizaciones de maquinaria, sueldos y cargas sociales (F.931) y anticipos de Ganancias ya pagados: ' + PEND + '.', 'Es una estimación para ordenar la decisión: la cifra final la valida tu contador matriculado.'] },

    { id: 'dirmkt', name: 'Director Marketing', short: 'Dir. Marketing', role: 'Jefe de Marketing', area: 'Marketing', level: 'Rango 2', boss: 'ejecutivo', tc: MKT, state: 'espera',
      desk: { x: 7.5, z: -0.2, w: 3.0 }, look: { shirt: 0x2b3038, hat: 0xf4f4f0, tie: 0x19b394, acc: 0x19b394, headset: true },
      does: ['Dirige a Imagen, Guion y Redes.', 'Cuida que todo lo que sale hable bien de CODES.'],
      skills: ['Calendario de contenidos del mes: qué obra se muestra, con qué imagen, qué texto y en qué red.', 'Guía de marca de CODES: voz, colores, tipo de letra y lo que nunca se dice. Parte del trato formal que usas con intendentes y organismos.', 'Revisa cada pieza antes de pasártela: sin datos inventados ni imágenes sin permiso.', 'Junta lo que mide Redes y decide qué repetir y qué dejar.', 'Presupuesto de marketing, coordinado con Pagos.'],
      needs: ['Cómo quieres que suene CODES: ' + PEND + '.', 'Presupuesto mensual de marketing: ' + PEND + '.'] },

    { id: 'imagen', name: 'Imagen', short: 'Imagen', role: 'Fotos y videos de obra', area: 'Marketing', level: 'Rango 3', boss: 'dirmkt', tc: MKT, state: 'conectar',
      desk: { x: 3.5, z: 6.2, w: 2.4 }, look: { shirt: 0xc4c8ce, hair: 0x2a1a12, cam: true, lan: 0x19b394, acc: 0x19b394 },
      does: ['Es el experto en imágenes de construcción.', 'Busca y extrae imágenes épicas y buenas de las obras.'],
      skills: ['Elige las mejores tomas de cada obra y descarta las flojas.', 'Ordena el archivo por obra, fecha y etapa, para encontrar rápido cualquier foto.', 'Lista de tomas para pedir en obra: plano general, detalle, gente trabajando con casco y chaleco, avance semanal, antes y después, vista aérea.', 'Recomienda la mejor hora de luz y el ángulo para una foto o un video.', 'Prepara los formatos para cada red: vertical, cuadrado y horizontal.', 'Cuida los permisos: sin caras, patentes ni carteles de terceros sin autorización. Usa fotos propias de CODES o con licencia; las de internet quedan solo como referencia.'],
      needs: ['Una carpeta con fotos y videos de las obras.', 'Quién saca las fotos en obra: ' + PEND + '.'] },

    { id: 'guion', name: 'Guion', short: 'Guion', role: 'Textos y publicidad', area: 'Marketing', level: 'Rango 3', boss: 'dirmkt', tc: MKT, state: 'espera',
      desk: { x: 7.5, z: 6.2, w: 2.4 }, look: { shirt: 0x9aa1ab, hair: 0x6b4a2a, glasses: true, lan: 0x19b394, acc: 0x19b394 },
      does: ['Escribe todos los textos que la empresa necesita para su publicidad.'],
      skills: ['Textos para publicaciones, con el trato formal de CODES.', 'Fichas de obra: qué se hizo, dónde y para quién. Solo con datos reales que cargues; no inventa cifras.', 'Guiones cortos para videos de obra.', 'Gacetillas de prensa para inauguraciones y finales de obra.', 'Presentación institucional de CODES, con sus obras viales y de hormigón.', 'Revisa que el texto suene a CODES y no a una máquina.'],
      needs: ['Datos reales de cada obra para contar (ubicación, qué se hizo, fechas): ' + PEND + '.', 'Frases tuyas, para tomar tu manera de hablar.'] },

    { id: 'redes', name: 'Redes', short: 'Redes', role: 'Métricas e ideas de marca', area: 'Marketing', level: 'Rango 3', boss: 'dirmkt', tc: MKT, state: 'conectar',
      desk: { x: 11.5, z: 6.2, w: 2.4 }, look: { shirt: 0xdfe2e6, hair: 0x8a3b52, headset: true, lan: 0x19b394, acc: 0x19b394 },
      does: ['Es una genia de internet: analiza los parámetros de las redes para ver si las publicaciones están siendo exitosas o no.', 'Te da ideas para que la marca CODES crezca y sea reconocida.'],
      skills: ['Tablero por publicación: alcance, interacciones, guardados, compartidos y clics, contra el promedio propio.', 'Qué formatos, días y horarios funcionan mejor.', 'Ideas de contenido para cada semana, pensadas desde lo que ya funcionó.', 'Mira cómo comunican otras constructoras y organismos de obra, para tomar ideas. Solo información pública.', 'Menciones y comentarios: avisa si hay algo que atender o responder.', 'Informe mensual de crecimiento de la marca.'],
      needs: ['Los usuarios de 4 empresas del rubro para compararlas con CODES.', 'Tu OK para abrir las estadísticas de la cuenta (instagram: codesconstrucciones).'] }
  ];


  AGENTS.forEach(function (a) { a.rank = parseInt(a.level.slice(-1), 10); a.base = [0, 0.24, 0.16, 0][a.rank]; });
  function byId(id) { for (var i = 0; i < AGENTS.length; i++) if (AGENTS[i].id === id) return AGENTS[i]; return null; }
  function hex(n) { return '#' + ('000000' + n.toString(16)).slice(-6); }
  function rgba(h, a) { var n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function li(arr) { return arr.map(function (t) { return '<li>' + t + '</li>'; }).join(''); }


  /* ---------- Interfaz ---------- */
  var A = analizar(getD());
  var sel = 'home', view = '3d', prevKeys = null;
  var hooks = { focus: function () {}, home: function () {}, mark: function () {}, sync: function () {}, pulse: function () {} };
  var cardsEl = $('#cards'), dock = $('#dock'), panel = $('#panel'), stageEl = $('#stage'), orgEl = $('#org');
  $('#n-ag').textContent = AGENTS.length;
  var LIVEIDS = { ejecutivo: 1, admin: 1, compras: 1, pagos: 1, cobros: 1, maquinaria: 1, impuestos: 1, dirmkt: 1, imagen: 1, guion: 1, redes: 1 };
  var DECIDE = [
    'Decidir qué te alarma: % de desvío de presupuesto, días de pago vencido y días de cobro atrasado. Con eso se ajustan los semáforos.',
    'Decidir si se agregan kilómetros u horas de motor a cada carga de combustible, para poder auditar el consumo por máquina.',
    'Aprobar la bio nueva de Instagram y agregar el WhatsApp (desde el celular). Dar el OK para abrir las estadísticas de la cuenta.'
  ];

  function urg(id) { return A.find[id].filter(function (f) { return f[0] === 'alta'; }).length; }
  function setStates() {
    AGENTS.forEach(function (a) {
      if (LIVEIDS[a.id]) { var u = urg(a.id); var md = (A.find[a.id] || []).filter(function (x) { return x[0] === 'media'; }).length; a.state = u ? 'alerta' : 'listo'; a.badge = u ? u + (u === 1 ? ' urgente' : ' urgentes') : (a.area === 'Marketing' && md ? 'Trabajando' : 'Al día'); }
      else { a.state = a.id === 'guion' ? 'espera' : 'conectar'; a.badge = STATES[a.state].label; }
      var st = STATES[a.state];
      a.card.style.setProperty('--sc', st.c); a.card.style.setProperty('--gl', rgba(st.c, 0.28));
      a.card.querySelector('.badge').textContent = a.badge;
      a.card.setAttribute('aria-label', a.name + ', ' + a.role + ', ' + a.badge);
      var tot = A.tot[a.id], bad = A.bad[a.id];
      a.pct = LIVEIDS[a.id] && tot ? Math.round((tot - bad) / tot * 100) : 0;
    });
    var eq = ['admin', 'compras', 'pagos', 'cobros', 'maquinaria', 'impuestos', 'dirmkt'].map(byId);
    byId('ejecutivo').pct = Math.round(eq.reduce(function (s, x) { return s + x.pct; }, 0) / eq.length);
    AGENTS.forEach(function (a) { a.card.querySelector('.bar i').style.width = a.pct + '%'; });
    var total = urg('ejecutivo');
    $('#n-urg').textContent = total;
    $('#chip-urg').hidden = false;
    $('#callout-b').textContent = total ? (total === 1 ? '1 cosa urgente' : total + ' cosas urgentes') : 'Todo al día';
    $('#callout-s').textContent = total ? 'Revisa lo que marcó cada contador.' : 'Los contadores no encontraron alertas urgentes.';
    $('.callout').style.background = total ? '' : '#2f9e6b';
  }

  AGENTS.forEach(function (a) {
    var c = el('div', 'card');
    c.setAttribute('role', 'button'); c.tabIndex = 0;
    c.dataset.id = a.id;
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(a.id); } });
    c.style.setProperty('--tc', a.tc);
    c.innerHTML = '<div class="top"><i class="dot"></i><span class="name">' + a.name + '</span><span class="badge"></span></div>' +
      '<div class="role">' + a.role + '</div><div class="bar"><i></i></div>';
    c.addEventListener('click', function () { select(a.id); });
    cardsEl.appendChild(c);
    a.card = c;
  });

  (function buildDock() {
    function btn(id, label, tc) {
      var b = el('button', 'who', '<i></i>' + label);
      b.type = 'button'; b.dataset.id = id; if (tc) b.style.setProperty('--tc', tc);
      b.addEventListener('click', function () { select(id); });
      dock.appendChild(b);
    }
    btn('home', 'Vista general');
    var lastArea = '';
    AGENTS.forEach(function (a) {
      var g = a.tc;
      if (g !== lastArea) { dock.appendChild(el('span', 'sep')); lastArea = g; }
      btn(a.id, a.short, a.tc);
    });
  })();

  (function buildOrg() {
    function node(a) {
      return '<button class="node' + (a.level === 'Rango 3' ? '' : ' big') + '" type="button" data-id="' + a.id + '" aria-pressed="false" style="--tc:' + a.tc + '"><span class="nm"><i class="dot"></i><b>' + a.name + '</b></span><small>' + a.role + '</small></button>';
    }
    function branch(id) {
      var a = byId(id), kids = AGENTS.filter(function (k) { return k.boss === id; });
      return '<li>' + node(a) + (kids.length ? '<ul>' + kids.map(function (k) { return branch(k.id); }).join('') + '</ul>' : '') + '</li>';
    }
    orgEl.innerHTML =
      '<ul class="tree"><li><div class="node owner" style="--tc:var(--o-fg)"><span class="nm"><b>Facundo Yunes</b></span><small>Dueño · da el «va»</small></div><ul>' + branch('ejecutivo') + '</ul></li></ul>' +
      '<div class="org-note"><span style="--c:' + EXE + '">Dirección ejecutiva</span><span style="--c:' + ADM + '">Administración</span><span style="--c:' + MKT + '">Marketing</span></div>';
    var nodes = orgEl.querySelectorAll('.node[data-id]');
    for (var i = 0; i < nodes.length; i++) nodes[i].addEventListener('click', function (e) { select(e.currentTarget.dataset.id); });
  })();

  function findList(arr, tc) {
    if (!arr.length) return '<p class="pending" style="margin:0">Sin alertas con los datos de hoy.</p>';
    return '<ul class="fnd">' + arr.map(function (f) { var v = SEV[f[0]]; return '<li style="--fc:' + v.c + '"><b class="sev">' + v.l + '</b>' + f[1] + '</li>'; }).join('') + '</ul>';
  }
  function fmtF(f) { return f ? f.split('-').reverse().slice(0, 2).join('/') : ''; }
  function renderPanel() {
    var h, keep = panel.scrollTop;
    if (sel === 'home') {
      var tot = urg('ejecutivo');
      h = '<div class="p-head"><div class="p-dot" style="--tc:' + (tot ? 'var(--o-alert)' : 'var(--o-ok)') + '"><i></i></div><div><div class="eyebrow">Resumen de hoy · datos en vivo</div><h2>' + (tot ? (tot === 1 ? '1 cosa urgente' : tot + ' cosas urgentes') : 'Todo al día') + '</h2></div></div>' +
        '<h3>Lo más importante</h3>' + findList(A.find.ejecutivo.filter(function (f) { return f[0] !== 'info'; }).slice(0, 6)) +
        '<h3>Movimiento reciente<small>lo último que se cargó</small></h3>' +
        '<ul class="feed">' + A.feed.slice(0, 8).map(function (e) { var ag = byId(e.ag); return '<li style="--tc:' + ag.tc + '"><button type="button" data-go="' + e.ag + '"><b>' + ag.short + '</b> ' + e.t + '<span>' + fmtF(e.f) + '</span></button></li>'; }).join('') + '</ul>' +
        '<h3>Te toca decidir</h3><ul style="--tc:var(--o-alert)">' + li(DECIDE) + '</ul>' +
        '<p class="note">Los controles se recalculan solos cada vez que cambia algo en el sistema. Los contadores solo leen: nada de lo que hacen sale, se paga o se borra sin tu «va».</p>';
    } else {
      var a = byId(sel), st = STATES[a.state], boss = a.boss ? byId(a.boss) : null;
      var kids = AGENTS.filter(function (k) { return k.boss === a.id; });
      var fl = A.find[a.id] || [];
      h = '<div class="p-head" style="--tc:' + a.tc + '"><div class="p-dot"><i></i></div><div><div class="eyebrow">' + a.area + ' · ' + a.level + '</div><h2>' + a.name + '</h2></div></div>' +
        '<p class="status" style="--sc:' + st.c + '"><i></i>' + (LIVEIDS[a.id] ? a.badge + (a.area === 'Marketing' ? ' · leyó el Instagram de CODES' : ' · leyendo tu sistema') : st.label) + '</p>' +
        '<div class="rel"><span>Responde a: <b>' + (boss ? boss.name : 'Facundo Yunes') + '</b></span>' +
        (kids.length ? '<span>Tiene a su cargo: <b>' + kids.map(function (k) { return k.name; }).join(', ') + '</b></span>' : '') + '</div>' +
        (fl.length ? '<h3>Lo que encontró<small>datos en vivo</small></h3>' + findList(fl) : '') +
        '<h3>Qué hace</h3><ul style="--tc:' + a.tc + '">' + li(a.does) + '</ul>' +
        '<details><summary>Habilidades propuestas</summary><ul style="--tc:' + a.tc + '">' + li(a.skills) + '</ul></details>' +
        '<h3>Qué necesita de ti</h3><ul style="--tc:' + a.tc + '">' + li(a.needs.filter(Boolean)) + '</ul>' +
        '<p class="note">Solo lee: no cambia ni paga nada en tu sistema. Nada de lo que hace sale, se paga o se borra sin tu «va».</p>';
    }
    panel.innerHTML = h;
    panel.scrollTop = keep;
    var gos = panel.querySelectorAll('[data-go]');
    for (var i = 0; i < gos.length; i++) gos[i].addEventListener('click', function (e) { select(e.currentTarget.dataset.go); });
  }
  function select(id) {
    if (id === 'toca') id = 'home';
    sel = id;
    renderPanel();
    var btns = dock.querySelectorAll('.who');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', btns[i].dataset.id === id ? 'true' : 'false');
    var nodes = orgEl.querySelectorAll('.node[data-id]');
    for (var j = 0; j < nodes.length; j++) nodes[j].setAttribute('aria-pressed', nodes[j].dataset.id === id ? 'true' : 'false');
    AGENTS.forEach(function (a) { a.card.classList.toggle('sel', a.id === id); });
    if (id === 'home') { if (view === '3d') hooks.home(); }
    else if (view === '3d') hooks.focus(byId(id));
    hooks.mark(id);
  }
  function setView(v) {
    view = v;
    stageEl.hidden = v !== '3d'; orgEl.hidden = v !== 'org';
    $('#tab-3d').setAttribute('aria-selected', v === '3d' ? 'true' : 'false');
    $('#tab-org').setAttribute('aria-selected', v === 'org' ? 'true' : 'false');
  }
  $('#tab-3d').addEventListener('click', function () { setView('3d'); });
  $('#tab-org').addEventListener('click', function () { setView('org'); });
  $('#chip-urg').addEventListener('click', function () { select('home'); });
  $('#call-toca').addEventListener('click', function () { select('home'); });
  $('#home').addEventListener('click', function () { select('home'); });

  /* refresco: vuelve a analizar con los datos actuales y anima lo que cambió */
  function refresh() {
    var prev = prevKeys;
    A = analizar(getD());
    prevKeys = A.keys;
    setStates();
    renderPanel();
    hooks.sync();
    if (prev) {
      var nuevos = Object.keys(A.keys).filter(function (k) { return !prev[k]; }).slice(0, 6);
      nuevos.forEach(function (k, i) { setTimeout(function () { hooks.pulse(A.keys[k].ag); }, i * 700); });
    }
  }
  prevKeys = A.keys;
  setStates();
  renderPanel();

  /* ---------- Chat con el Director Ejecutivo ---------- */
  (function () {
    var box = $('#chat'), log = $('#c-log'), form = $('#c-form'), inp = $('#c-in'), send = $('#c-send'), sug = $('#c-sug'), note = $('#c-note');
    var KEY = 'oficina_chat_v1', msgs = [], busy = false;
    try { msgs = JSON.parse(localStorage.getItem('oficina_chat_v1') || '[]').slice(-40); } catch (e) { msgs = []; }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); } catch (e) {} }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function md(s) {
      var h = esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').split(/\n/), out = '', ul = false;
      h.forEach(function (l) {
        var m = /^\s*(?:[-•*]|\d+[.)])\s+(.*)$/.exec(l);
        if (m) { if (!ul) { out += '<ul>'; ul = true; } out += '<li>' + m[1] + '</li>'; }
        else { if (ul) { out += '</ul>'; ul = false; } out += l.trim() ? '<p>' + l + '</p>' : ''; }
      });
      return out + (ul ? '</ul>' : '');
    }
    function bubble(role, text) {
      var d = el('div', 'msg ' + role);
      d.innerHTML = role === 'user' ? '<p>' + esc(text).replace(/\n/g, '<br>') + '</p>' : md(text);
      log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
    }
    function strip(h) { return String(h).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' '); }
    function contexto() {
      var D = getD(), L = ['Fecha: ' + D.hoy, 'Hallazgos de los contadores (urgencia · texto):'];
      ['compras', 'pagos', 'cobros', 'maquinaria', 'impuestos', 'admin', 'dirmkt', 'imagen', 'guion', 'redes', 'ejecutivo'].forEach(function (id) {
        var fl = (A.find[id] || []).slice(0, 14);
        if (!fl.length) return;
        L.push('[' + byId(id).name + ']');
        fl.forEach(function (f) { L.push('- ' + f[0] + ' · ' + strip(f[1])); });
      });
      if (A.feed && A.feed.length) { L.push('Movimiento reciente:'); A.feed.slice(0, 8).forEach(function (e) { L.push('- ' + strip(e.t) + ' (' + (e.f || '') + ')'); }); }
      L.push('Marketing: perfil de Instagram @codesconstrucciones leído el 29-oct-2026 (lectura hecha por Claude en el navegador, no en vivo). Facundo ya archivó las publicaciones y cambió la foto de perfil. No se publica ni borra nada sin su «va»; archivar, la foto y el enlace se hacen desde el celular.');
      return L.join('\n');
    }
    function draw() {
      log.innerHTML = '';
      if (!msgs.length) bubble('ia', 'Hola Facundo. Ya revisé el sistema con los contadores. Pregúntame lo que quieras o dame una tarea: por ejemplo, qué atender primero hoy.');
      msgs.forEach(function (m) { bubble(m.role === 'user' ? 'user' : 'ia', m.content); });
    }
    function fail(d, txt) { d.classList.add('err'); d.innerHTML = '<p>' + esc(txt) + '</p>'; }
    function ask(text) {
      text = (text || '').trim(); if (!text || busy) return;
      var C = getD().chat;
      if (!C || !C.ok) { note.hidden = false; note.textContent = 'La charla funciona en el sistema real con tu usuario de dueño, no en la demo.'; return; }
      busy = true; send.disabled = true; inp.value = ''; inp.style.height = '';
      msgs.push({ role: 'user', content: text }); bubble('user', text); save();
      var d = bubble('ia', ''); d.classList.add('typing'); d.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
      var acc = '';
      Promise.resolve(C.token()).then(function (tk) {
        if (!tk) throw new Error('sin sesión');
        return fetch(C.url + '/functions/v1/director', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: 'Bearer ' + tk, apikey: C.key },
          body: JSON.stringify({ messages: msgs.slice(-20), contexto: contexto() })
        });
      }).then(function (r) {
        if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { var e = new Error(j.error || ('error ' + r.status)); e.code = j.error; throw e; });
        var rd = r.body.getReader(), dec = new TextDecoder(), buf = '';
        function pump() {
          return rd.read().then(function (x) {
            if (x.done) return;
            buf += dec.decode(x.value, { stream: true });
            var lines = buf.split('\n'); buf = lines.pop();
            lines.forEach(function (l) {
              if (l.indexOf('data:') !== 0) return;
              try { var j = JSON.parse(l.slice(5)); if (j.type === 'content_block_delta' && j.delta && j.delta.text) { acc += j.delta.text; d.classList.remove('typing'); d.innerHTML = md(acc); log.scrollTop = log.scrollHeight; } } catch (e) {}
            });
            return pump();
          });
        }
        return pump();
      }).then(function () {
        if (!acc) throw new Error('vacío');
        msgs.push({ role: 'assistant', content: acc }); save();
      }).catch(function (e) {
        d.classList.remove('typing');
        if (e.code === 'falta_clave') fail(d, 'Todavía no tengo conexión con la IA: falta cargar la clave de Anthropic en Supabase (secreto ANTHROPIC_API_KEY).');
        else if (acc) { msgs.push({ role: 'assistant', content: acc }); save(); }
        else { msgs.pop(); save(); fail(d, 'No pude responder (' + (e.message || 'error') + '). Vuelve a intentar.'); }
      }).then(function () { busy = false; send.disabled = false; inp.focus(); });
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); ask(inp.value); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(inp.value); } });
    inp.addEventListener('input', function () { inp.style.height = 'auto'; inp.style.height = Math.min(140, inp.scrollHeight) + 'px'; });
    ['¿Qué atiendo primero hoy?', 'Resumen de cobros', 'Qué proveedores reclamar', 'Redáctame un reclamo de cobro'].forEach(function (t) {
      var b = el('button', 'sg', t); b.type = 'button'; b.addEventListener('click', function () { ask(t); }); sug.appendChild(b);
    });
    $('#c-clear').addEventListener('click', function () { msgs = []; save(); draw(); });
    var C0 = getD().chat; if (!C0 || !C0.ok) { note.hidden = false; note.textContent = 'La charla funciona en el sistema real con tu usuario de dueño, no en la demo.'; }
    draw();
  })();

  /* ---------- Escena 3D ---------- */
  function init3D() {
    var T = window.THREE;
    if (!T || !T.OrbitControls) throw new Error('three no cargó');
    var stage = stageEl;
    var renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    var dom = renderer.domElement;
    dom.setAttribute('role', 'img');
    dom.setAttribute('aria-label', 'Oficina de CODES en 3D: el Director Ejecutivo al fondo, los dos directores en el medio y los seis especialistas al frente');
    stage.insertBefore(dom, stage.firstChild);

    function stageColor() {
      var c = '';
      try { c = getComputedStyle(host).getPropertyValue('--o-stage').trim(); } catch (e) {}
      return c || '#e3e6ea';
    }
    var scene = new T.Scene();
    scene.background = new T.Color(stageColor());
    scene.fog = new T.Fog(stageColor(), 60, 120);
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onMq = function () { var c = stageColor(); scene.background.set(c); scene.fog.color.set(c); };
      if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
    }
    if (window.MutationObserver) new MutationObserver(function () { var c = stageColor(); scene.background.set(c); scene.fog.color.set(c); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    var camera = new T.PerspectiveCamera(38, 1, 0.1, 220);
    var controls = new T.OrbitControls(camera, dom);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 4.5; controls.maxDistance = 48;
    controls.screenSpacePanning = false;

    /* helpers */
    var seed = 20261029;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    function M(c, o) { return new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.7, metalness: 0 }, o || {})); }
    function mesh(geo, mat, x, y, z, o) {
      var m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0);
      o = o || {}; m.castShadow = o.cast !== false; m.receiveShadow = o.receive !== false; return m;
    }
    function box(w, h, d, mat, x, y, z, o) { return mesh(new T.BoxGeometry(w, h, d), mat, x, y, z, o); }
    function cyl(rt, rb, h, mat, x, y, z, seg, o) { return mesh(new T.CylinderGeometry(rt, rb, h, seg || 16), mat, x, y, z, o); }
    function sph(r, mat, x, y, z, o) { return mesh(new T.SphereGeometry(r, 20, 14), mat, x, y, z, o); }
    function canvasTex(w, h, draw) {
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var g = c.getContext('2d'); draw(g, w, h);
      var t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
    }
    function rr(g, x, y, w, h, r) {
      g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
    }
    function limb(a, b, r, mat) {
      var dir = new T.Vector3().subVectors(b, a), len = dir.length();
      var m = new T.Mesh(new T.CylinderGeometry(r, r, len, 10), mat);
      m.position.copy(a).addScaledVector(dir, 0.5);
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
      m.castShadow = true; return m;
    }

    /* paleta: blancos y grises */
    var WHITE = '#f1f2f4', OFF = '#e6e8eb', G1 = '#d3d6da', G2 = '#b4b9c0', G3 = '#8a9099', G4 = '#4a5059', INK = '#23272d', BRASS = '#c9a95a';

    /* luces */
    scene.add(new T.HemisphereLight(0xffffff, 0xc3c8d0, 0.62));
    var sun = new T.DirectionalLight(0xfff6ea, 0.52);
    sun.position.set(-10, 24, 14); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    var sc = sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 70;
    sun.shadow.bias = -0.0005;
    scene.add(sun);
    var fill = new T.DirectionalLight(0xdfe8ff, 0.22); fill.position.set(14, 10, 12); scene.add(fill);

    /* piso de microcemento */
    var ft = canvasTex(512, 512, function (g, w, h) {
      g.fillStyle = '#d4d7da'; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 4500; i++) {
        g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,' + (rnd() * 0.09) + ')' : 'rgba(0,0,0,' + (rnd() * 0.06) + ')';
        g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 2 + rnd() * 3);
      }
      for (var k = 0; k < 10; k++) {
        var cx = rnd() * w, cy = rnd() * h, gr = g.createRadialGradient(cx, cy, 0, cx, cy, 120 + rnd() * 120);
        gr.addColorStop(0, 'rgba(255,255,255,.08)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      }
      g.strokeStyle = 'rgba(60,66,74,.22)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h);
    });
    ft.wrapS = ft.wrapT = T.RepeatWrapping; ft.repeat.set(10, 6.67);
    var floor = new T.Mesh(new T.PlaneGeometry(30, 20), new T.MeshStandardMaterial({ map: ft, roughness: 0.55 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    scene.add(box(30.6, 0.4, 20.6, M(G4), 0, -0.21, 0, { cast: false }));

    /* paredes: blanco liso al fondo, pared acanalada a la izquierda */
    var skyTex = canvasTex(2048, 420, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0e1118'); gr.addColorStop(1, '#2a2f3a');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 120; i++) { g.fillStyle = 'rgba(255,255,255,' + (rnd() * 0.6) + ')'; g.fillRect(rnd() * w, rnd() * h * 0.45, 2, 2); }
      var x = 0;
      while (x < w) {
        var bw = 60 + rnd() * 110, bh = 90 + rnd() * 250;
        g.fillStyle = '#171a22'; g.fillRect(x, h - bh, bw, bh);
        for (var wy = h - bh + 14; wy < h - 10; wy += 22) for (var wx = x + 10; wx < x + bw - 14; wx += 20) {
          if (rnd() < 0.4) { g.fillStyle = rnd() < 0.85 ? '#ffe9b8' : '#cfe6ff'; g.globalAlpha = 0.5 + rnd() * 0.5; g.fillRect(wx, wy, 9, 12); g.globalAlpha = 1; }
        }
        x += bw + rnd() * 14;
      }
    });
    scene.add(box(30.6, 6.8, 0.3, M(WHITE), 0, 3.4, -10.15));
    var wallLow = new T.Mesh(new T.PlaneGeometry(30, 3.2), new T.MeshStandardMaterial({ color: WHITE, roughness: 0.9 }));
    wallLow.position.set(0, 1.6, -9.99); wallLow.receiveShadow = true; scene.add(wallLow);
    scene.add(box(30, 0.16, 0.1, M(G4), 0, 0.08, -9.94, { cast: false }));
    var sky = new T.Mesh(new T.PlaneGeometry(29.4, 3.2), new T.MeshBasicMaterial({ map: skyTex }));
    sky.position.set(0, 4.9, -9.99); scene.add(sky);
    var steel = M('#22262c', { roughness: 0.5, metalness: 0.4 });
    scene.add(box(29.8, 0.1, 0.12, steel, 0, 6.5, -9.9, { cast: false })); scene.add(box(29.8, 0.1, 0.12, steel, 0, 3.3, -9.9, { cast: false }));
    for (var mx = -14.6; mx <= 14.7; mx += 3.65) scene.add(box(0.07, 3.2, 0.12, steel, mx, 4.9, -9.9, { cast: false }));

    scene.add(box(0.3, 6.8, 20.6, M(WHITE), -15.15, 3.4, 0));
    var flute = canvasTex(512, 256, function (g, w, h) {
      for (var i = 0; i < 32; i++) {
        var gr = g.createLinearGradient(i * 16, 0, i * 16 + 16, 0); gr.addColorStop(0, '#f6f7f8'); gr.addColorStop(0.55, '#e4e6e9'); gr.addColorStop(1, '#bfc3c9');
        g.fillStyle = gr; g.fillRect(i * 16, 0, 16, h);
      }
    });
    flute.wrapS = flute.wrapT = T.RepeatWrapping; flute.repeat.set(5, 1);
    var leftWall = new T.Mesh(new T.PlaneGeometry(20, 6.6), new T.MeshStandardMaterial({ map: flute, roughness: 0.8 }));
    leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-14.99, 3.3, 0); leftWall.receiveShadow = true; scene.add(leftWall);

    /* alfombras, tarimas, aros y líneas del organigrama en el piso */
    function rug(x, z, w, d, col, border) {
      scene.add(box(w, 0.04, d, M(border, { roughness: 1 }), x, 0.02, z, { cast: false }));
      scene.add(box(w - 0.3, 0.05, d - 0.3, M(col, { roughness: 1 }), x, 0.026, z, { cast: false }));
    }
    function ring(x, y, z, r, col, op) {
      var m = new T.Mesh(new T.RingGeometry(r - 0.1, r, 56), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: op || 0.55, side: T.DoubleSide }));
      m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.012, z); scene.add(m); return m;
    }
    function dais(cx, cz, w, d, h) {
      scene.add(box(w, h, d, M('#f6f7f8', { roughness: 0.5 }), cx, h / 2, cz));
      scene.add(box(w + 0.02, 0.04, 0.06, M(BRASS, { metalness: 0.7, roughness: 0.3 }), cx, h - 0.005, cz + d / 2 + 0.005, { cast: false }));
    }
    function line(x1, z1, x2, z2) {
      var w = Math.abs(x2 - x1) || 0.07, d = Math.abs(z2 - z1) || 0.07;
      scene.add(box(w + (x1 === x2 ? 0 : 0.07), 0.01, d + (z1 === z2 ? 0 : 0.07), new T.MeshBasicMaterial({ color: 0xffffff }), (x1 + x2) / 2, 0.062, (z1 + z2) / 2, { cast: false }));
    }
    rug(0, -6.7, 9.4, 5.8, '#3b4047', '#2b2f35');       /* dirección ejecutiva */
    rug(-7.9, 3.15, 13, 12.5, '#c4c8ce', '#b0b5bc');    /* administración */
    rug(7.9, 3.15, 13, 12.5, '#d3d0cb', '#bfbbb4');     /* marketing */
    dais(0, -6.7, 7.0, 5.0, 0.24);
    dais(-7.5, -0.6, 5.4, 3.6, 0.16); dais(7.5, -0.6, 5.4, 3.6, 0.16);
    line(0, -4.0, 0, -2.9); line(-7.5, -2.9, 7.5, -2.9); line(-7.5, -2.9, -7.5, -2.5); line(7.5, -2.9, 7.5, -2.5);
    line(-7.5, 1.4, -7.5, 3.0); line(7.5, 1.4, 7.5, 3.0);
    line(-11.5, 3.0, -3.5, 3.0); line(3.5, 3.0, 11.5, 3.0);
    [-11.5, -7.5, -3.5, 3.5, 7.5, 11.5].forEach(function (x) { line(x, 3.0, x, 4.2); });

    function decal(text, sub, x, z, y) {
      var tex = canvasTex(1024, 256, function (g, w, h) {
        g.clearRect(0, 0, w, h); g.textAlign = 'center';
        g.fillStyle = 'rgba(40,46,54,.55)'; g.font = '700 120px "Barlow Condensed","Arial Narrow",sans-serif'; g.fillText(text, w / 2, 126);
        g.fillStyle = 'rgba(40,46,54,.4)'; g.font = '600 52px "Barlow Condensed","Arial Narrow",sans-serif'; g.fillText(sub, w / 2, 206);
      });
      var m = new T.Mesh(new T.PlaneGeometry(4.4, 1.1), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); scene.add(m); decals.push(tex);
    }
    var decals = [];
    decal('RANGO 1', 'DIRECCIÓN EJECUTIVA', 0, -4.9, 0.27);
    decal('RANGO 2', 'DIRECTORES DE ÁREA', 0, -0.4, 0.075);
    decal('RANGO 3', 'ESPECIALISTAS', 0, 6.4, 0.075);

    /* vidrios con marco negro fino */
    var glassMat = new T.MeshStandardMaterial({ color: 0xcfe3f2, transparent: true, opacity: 0.2, roughness: 0.1, side: T.DoubleSide, depthWrite: false });
    function glassWall(x1, z1, x2, z2, h) {
      var dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz), g = new T.Group();
      g.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2); g.rotation.y = -Math.atan2(dz, dx);
      g.add(box(L, h - 0.1, 0.04, glassMat, 0, (h - 0.1) / 2 + 0.05, 0, { cast: false, receive: false }));
      g.add(box(L, 0.06, 0.08, steel, 0, h, 0)); g.add(box(L, 0.08, 0.08, steel, 0, 0.04, 0));
      var n = Math.max(1, Math.round(L / 2.4));
      for (var i = 0; i <= n; i++) g.add(box(0.06, h, 0.08, steel, -L / 2 + (L * i) / n, h / 2, 0));
      scene.add(g);
    }

    /* mobiliario */
    function monitor() {
      var g = new T.Group();
      g.add(box(1.0, 0.62, 0.05, M('#0d1016', { roughness: 0.4 }), 0, 0, 0));
      var scr = new T.Mesh(new T.PlaneGeometry(0.92, 0.54), new T.MeshBasicMaterial({ color: 0x6f7b8a }));
      scr.rotation.y = Math.PI; scr.position.z = -0.03; g.add(scr);
      g.add(cyl(0.035, 0.035, 0.2, M('#20242c'), 0, -0.4, 0, 8)); g.add(box(0.4, 0.03, 0.24, M('#20242c'), 0, -0.52, 0));
      return g;
    }
    function plant(x, z, s) {
      var g = new T.Group(); g.position.set(x, 0, z); s = s || 1;
      g.add(cyl(0.3 * s, 0.24 * s, 0.46 * s, M('#dcdee1', { roughness: 0.9 }), 0, 0.23 * s, 0, 18));
      g.add(cyl(0.04 * s, 0.05 * s, 1.1 * s, M('#6b6f58'), 0, 0.9 * s, 0, 8));
      var lm = M('#4c8f5f', { side: T.DoubleSide });
      for (var i = 0; i < 8; i++) {
        var lg = new T.Group(); lg.position.y = (1.0 + (i % 3) * 0.12) * s; lg.rotation.y = (i / 8) * Math.PI * 2;
        var leaf = mesh(new T.SphereGeometry(0.5 * s, 8, 6), lm, 0, 0, 0.5 * s, { receive: false });
        leaf.scale.set(0.16, 0.03, 1); leaf.rotation.x = -0.5; lg.add(leaf); g.add(lg);
      }
      scene.add(g);
    }
    function cone(x, z) {
      var g = new T.Group(); g.position.set(x, 0, z);
      g.add(box(0.5, 0.05, 0.5, M('#2a2d33'), 0, 0.03, 0));
      g.add(cyl(0.07, 0.19, 0.6, M('#ff7a1a'), 0, 0.35, 0, 16));
      g.add(cyl(0.115, 0.14, 0.1, M('#f4f4f0'), 0, 0.37, 0, 16));
      scene.add(g);
    }
    function hardHat(x, y, z, col) {
      var hm = M(col, { roughness: 0.4 }), g = new T.Group(); g.position.set(x, y, z);
      var dome = mesh(new T.SphereGeometry(0.25, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), hm, 0, 0, 0); dome.scale.set(1, 0.9, 1.05); g.add(dome);
      g.add(cyl(0.29, 0.29, 0.03, hm, 0, 0.0, 0.03, 20)); g.add(box(0.06, 0.05, 0.4, hm, 0, 0.22, 0));
      scene.add(g);
    }
    function desk(a) {
      var d = a.desk, w = d.w, boss = a.rank < 3, g = new T.Group(); g.position.set(d.x, a.base, d.z);
      var top = boss ? M('#2c3036', { roughness: 0.35 }) : M('#f3f4f6', { roughness: 0.45 }), panel = boss ? M('#1f2328') : M('#d3d6da');
      g.add(box(w, 0.08, 1.2, top, 0, 1.0, 0));
      g.add(box(0.06, 1.0, 1.1, steel, -w / 2 + 0.06, 0.5, 0)); g.add(box(0.06, 1.0, 1.1, steel, w / 2 - 0.06, 0.5, 0));
      g.add(box(w - 0.2, 0.5, 0.04, panel, 0, 0.74, 0.55));
      if (boss) g.add(box(0.7, 0.025, 0.16, M(BRASS, { metalness: 0.7, roughness: 0.3 }), 0, 1.05, 0.42));
      var mon = monitor(); mon.position.set(0, 1.58, -0.02); g.add(mon);
      g.add(box(0.62, 0.025, 0.2, M('#e2e5e9'), 0, 1.06, -0.28)); g.add(box(0.1, 0.025, 0.16, M('#e2e5e9'), 0.5, 1.06, -0.28));
      g.add(cyl(0.07, 0.06, 0.12, M(hex(a.look.acc)), w / 2 - 0.35, 1.1, 0.22, 12));
      scene.add(g);
    }
    /* avatar sentado, mirando hacia la cámara (+z) */
    function avatar(a) {
      var o = a.look, boss = a.rank < 3, g = new T.Group();
      var skin = M('#efc8a2', { roughness: 0.6 }), shirt = M(hex(o.shirt)), pants = M('#2a2e36'), leather = M(boss ? '#1b1e23' : '#4a5059');
      g.add(cyl(0.42, 0.42, 0.06, M('#1d2028'), 0, 0.05, 0, 20)); g.add(cyl(0.06, 0.06, 0.45, M('#2b303c'), 0, 0.3, 0, 10));
      g.add(box(0.82, 0.12, 0.78, leather, 0, 0.58, 0.04));
      if (boss) {
        g.add(box(0.82, 1.35, 0.12, leather, 0, 1.25, -0.4)); g.add(box(0.5, 0.26, 0.14, leather, 0, 2.0, -0.4));
        g.add(box(0.08, 0.08, 0.6, leather, -0.46, 0.95, 0.1)); g.add(box(0.08, 0.08, 0.6, leather, 0.46, 0.95, 0.1));
      } else {
        g.add(box(0.78, 0.95, 0.1, leather, 0, 1.1, -0.4));
      }
      g.add(box(0.66, 0.26, 0.5, pants, 0, 0.78, 0.05));
      [-0.17, 0.17].forEach(function (sx) {
        g.add(box(0.24, 0.22, 0.62, pants, sx, 0.82, 0.4)); g.add(box(0.22, 0.6, 0.22, pants, sx, 0.48, 0.68));
        g.add(box(0.24, 0.12, 0.36, M('#15171d'), sx, 0.1, 0.76));
      });
      g.add(box(0.76, 0.86, 0.46, shirt, 0, 1.24, 0));
      if (o.tie != null) { g.add(box(0.12, 0.58, 0.02, M(hex(o.tie)), 0, 1.33, 0.235)); g.add(box(0.34, 0.12, 0.02, M('#f4f4f2'), 0, 1.64, 0.235)); }
      if (o.lan != null) { g.add(box(0.07, 0.78, 0.02, M(hex(o.lan)), 0, 1.28, 0.235)); g.add(box(0.2, 0.14, 0.02, M('#fafafa'), 0, 0.92, 0.24)); }
      if (o.cam) {
        g.add(box(0.34, 0.22, 0.16, M('#15171d'), 0, 1.1, 0.3));
        var lens = cyl(0.08, 0.08, 0.1, M('#0b0c10'), 0, 1.1, 0.4, 12); lens.rotation.x = Math.PI / 2; g.add(lens);
      }
      g.add(cyl(0.09, 0.09, 0.12, skin, 0, 1.72, 0, 10));
      var hands = [];
      [-1, 1].forEach(function (s) {
        var sh = new T.Vector3(s * 0.44, 1.58, 0), el2 = new T.Vector3(s * 0.5, 1.22, 0.32), ha = new T.Vector3(s * 0.26, 1.12, 0.8);
        g.add(limb(sh, el2, 0.09, shirt)); g.add(limb(el2, ha, 0.08, skin));
        var hand = sph(0.1, skin, ha.x, ha.y, ha.z); g.add(hand); hand.userData.y0 = ha.y; hands.push(hand);
      });
      var head = new T.Group(); head.position.set(0, 1.98, 0.02);
      head.add(sph(0.28, skin, 0, 0, 0));
      head.add(sph(0.04, M('#1b1b1f'), -0.1, 0.04, 0.25, { cast: false })); head.add(sph(0.04, M('#1b1b1f'), 0.1, 0.04, 0.25, { cast: false }));
      head.add(box(0.12, 0.025, 0.02, M('#b4645a'), 0, -0.09, 0.27, { cast: false }));
      if (o.glasses) {
        var gm = M('#15171d');
        [-1, 1].forEach(function (s) { var l2 = new T.Mesh(new T.TorusGeometry(0.075, 0.012, 6, 16), gm); l2.position.set(s * 0.1, 0.04, 0.27); head.add(l2); });
        head.add(box(0.07, 0.012, 0.012, gm, 0, 0.05, 0.275, { cast: false }));
      }
      if (o.stern) {
        [-1, 1].forEach(function (s) { var br = box(0.13, 0.03, 0.02, M('#2a1a12'), s * 0.1, 0.14, 0.27, { cast: false }); br.rotation.z = s * 0.4; head.add(br); });
      }
      if (o.hat != null) {
        var hm = M(hex(o.hat), { roughness: 0.4 });
        var dome = mesh(new T.SphereGeometry(0.33, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), hm, 0, 0.05, -0.01); dome.scale.set(1, 0.9, 1.05); head.add(dome);
        head.add(cyl(0.37, 0.37, 0.035, hm, 0, 0.06, 0.05, 24)); head.add(box(0.07, 0.06, 0.52, hm, 0, 0.35, 0));
      }
      if (o.hair != null) {
        var hr = M(hex(o.hair), { roughness: 0.9 });
        head.add(mesh(new T.SphereGeometry(0.31, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hr, 0, 0.03, -0.02));
        head.add(sph(0.27, hr, 0, -0.02, -0.12));
      }
      if (o.headset) {
        var hs = M('#1f232b');
        var arc = new T.Mesh(new T.TorusGeometry(0.31, 0.022, 8, 28, Math.PI), hs); arc.castShadow = true; head.add(arc);
        [-1, 1].forEach(function (s) { var cup = cyl(0.09, 0.09, 0.08, M(hex(o.acc || a.look.acc)), s * 0.31, 0, 0, 14); cup.rotation.z = Math.PI / 2; head.add(cup); });
        head.add(limb(new T.Vector3(-0.31, -0.02, 0.02), new T.Vector3(-0.12, -0.14, 0.27), 0.012, hs));
      }
      g.add(head);
      g.userData = { head: head, hands: hands, phase: rnd() * 6.28 };
      return g;
    }

    /* carteles de equipo */
    var signs = [];
    function sign(title, sub, col, x, y, z, w) {
      function paint(g, cw, ch) {
        g.clearRect(0, 0, cw, ch); rr(g, 10, 10, cw - 20, ch - 20, 30); g.fillStyle = '#16191e'; g.fill();
        g.lineWidth = 6; g.strokeStyle = col; g.stroke();
        g.fillStyle = '#ffffff'; g.font = '700 98px "Barlow Condensed","Arial Narrow",sans-serif'; g.textBaseline = 'alphabetic'; g.fillText(title, 56, 138);
        g.fillStyle = col; g.font = '600 46px "Barlow Condensed","Arial Narrow",sans-serif'; g.fillText(sub, 58, 202);
      }
      var tex = canvasTex(1024, 256, paint);
      var m = new T.Mesh(new T.PlaneGeometry(w, w / 4), new T.MeshBasicMaterial({ map: tex, transparent: true }));
      m.position.set(x, y, z); scene.add(m); signs.push({ tex: tex, paint: paint });
    }
    sign('ADMINISTRACIÓN', '5 AGENTES · DIRECTOR Y 4 CONTADORES', ADM, -9, 4.6, -9.85, 6.8);
    sign('DIRECCIÓN EJECUTIVA', '1 AGENTE', EXE, 0, 4.6, -9.85, 6.6);
    sign('MARKETING', '4 AGENTES · DIRECTOR, IMAGEN, GUION Y REDES', MKT, 9, 4.6, -9.85, 6.8);
    function repaintSigns() { signs.forEach(function (s) { var c = s.tex.image; s.paint(c.getContext('2d'), c.width, c.height); s.tex.needsUpdate = true; }); }
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load('700 98px "Barlow Condensed"'), document.fonts.load('600 46px "Barlow Condensed"')]).then(repaintSigns, function () {});
    }

    /* ===== Dirección ejecutiva: oficina de vidrio ===== */
    glassWall(-5.0, -3.6, -1.4, -3.6, 2.5); glassWall(1.4, -3.6, 5.0, -3.6, 2.5);
    glassWall(-5.0, -9.7, -5.0, -3.6, 2.5); glassWall(5.0, -9.7, 5.0, -3.6, 2.5);
    plant(-4.3, -9.0, 1.0); plant(4.3, -9.0, 1.0);

    /* ===== Rincón de obra (atrás a la izquierda, junto a Administración) ===== */
    var shelfCols = ['#e9ebed', '#c4c8ce', '#8a9099', '#4a5059', '#f2c230'];
    scene.add(box(0.55, 2.7, 5.4, M('#eceef0'), -14.7, 1.35, -6.3));
    for (var lv = 0; lv < 3; lv++) for (var bi = 0; bi < 17; bi++) {
      scene.add(box(0.3, 0.6, 0.22, M(shelfCols[(bi * 3 + lv) % 5]), -14.3, 0.5 + lv * 0.85, -8.8 + bi * 0.29, { cast: false }));
    }
    var bpTex = canvasTex(1024, 512, function (g, w, h) {
      g.fillStyle = '#35517a'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 1;
      for (var x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
      for (var y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.strokeStyle = '#ffffff'; g.lineWidth = 14; g.beginPath(); g.moveTo(40, 400); g.bezierCurveTo(300, 380, 420, 120, 980, 140); g.stroke();
      g.strokeStyle = '#35517a'; g.lineWidth = 3; g.setLineDash([22, 18]); g.beginPath(); g.moveTo(40, 400); g.bezierCurveTo(300, 380, 420, 120, 980, 140); g.stroke(); g.setLineDash([]);
      g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.strokeRect(620, 250, 120, 80); g.strokeRect(780, 270, 90, 90); g.strokeRect(150, 90, 140, 70);
    });
    var SX = -9.4, SZ = -6.6;
    scene.add(box(4.2, 0.08, 2.0, M('#f3f4f6', { roughness: 0.45 }), SX, 0.95, SZ));
    [[-1.9, -0.85], [1.9, -0.85], [-1.9, 0.85], [1.9, 0.85]].forEach(function (p) { scene.add(box(0.07, 0.95, 0.07, steel, SX + p[0], 0.47, SZ + p[1])); });
    var plan = new T.Mesh(new T.PlaneGeometry(3.8, 1.8), new T.MeshStandardMaterial({ map: bpTex, roughness: 0.9 }));
    plan.rotation.x = -Math.PI / 2; plan.position.set(SX, 0.995, SZ); plan.receiveShadow = true; scene.add(plan);
    hardHat(SX - 1.3, 1.0, SZ - 0.3, '#f2c230'); hardHat(SX + 1.1, 1.0, SZ + 0.3, '#f4f4f2'); hardHat(SX - 0.2, 1.0, SZ + 0.55, '#ff8f1f');
    var roll = cyl(0.09, 0.09, 1.2, M('#fafafa'), SX + 1.5, 1.08, SZ - 0.5, 12); roll.rotation.z = Math.PI / 2; scene.add(roll);
    cone(-6.6, -4.4); cone(-12.4, -4.4);
    for (var cb = 0; cb < 6; cb++) scene.add(box(1.0, 0.28, 0.62, M(cb % 2 ? '#b9bdc4' : '#aeb3bb'), -12.6, 0.14 + Math.floor(cb / 2) * 0.28, -9.1 + (cb % 2) * 0.7));
    plant(-5.9, -9.0, 1.1);

    /* ===== Rincón de estudio (atrás a la derecha, junto a Marketing) ===== */
    scene.add(box(3.6, 2.6, 0.05, M('#fbfbfb', { roughness: 0.95 }), 9.6, 1.3, -9.3));
    var bdrop = cyl(0.09, 0.09, 3.8, M('#2a2e36'), 9.6, 2.65, -9.25, 10); bdrop.rotation.z = Math.PI / 2; scene.add(bdrop);
    [8.0, 11.2].forEach(function (x) {
      scene.add(cyl(0.03, 0.03, 1.9, M('#2a2e36'), x, 0.95, -7.2, 8));
      scene.add(box(0.8, 0.8, 0.12, new T.MeshBasicMaterial({ color: 0xfffaf0 }), x, 1.95, -7.1, { cast: false }));
    });
    var tri = new T.Group(); tri.position.set(9.6, 0, -5.6);
    for (var tl = 0; tl < 3; tl++) { tri.add(limb(new T.Vector3(0, 1.2, 0), new T.Vector3(Math.cos(tl * 2.09) * 0.45, 0, Math.sin(tl * 2.09) * 0.45), 0.025, M('#2a2e36'))); }
    tri.add(box(0.4, 0.26, 0.3, M('#15171d'), 0, 1.32, 0));
    var lens3 = cyl(0.07, 0.07, 0.18, M('#0b0c10'), 0, 1.32, 0.24, 12); lens3.rotation.x = Math.PI / 2; tri.add(lens3);
    scene.add(tri);
    var pinTex = canvasTex(512, 640, function (g, w, h) {
      g.fillStyle = '#d9dbde'; g.fillRect(0, 0, w, h);
      var cols = ['#9aa0a8', '#c4c8ce', '#6f757e', '#e6e8eb', '#8a9099', '#b4b9c0', '#4a5059'];
      for (var i = 0; i < 9; i++) {
        var px = 40 + (i % 3) * 150 + rnd() * 20, py = 40 + Math.floor(i / 3) * 190 + rnd() * 16;
        g.save(); g.translate(px + 60, py + 70); g.rotate((rnd() - 0.5) * 0.2); g.fillStyle = '#fff'; g.fillRect(-62, -72, 124, 144);
        g.fillStyle = cols[i % 7]; g.fillRect(-54, -64, 108, 100); g.restore();
      }
    });
    var pin = new T.Mesh(new T.PlaneGeometry(1.5, 1.9), new T.MeshBasicMaterial({ map: pinTex })); pin.position.set(13.2, 1.9, -9.85); scene.add(pin);
    plant(13.6, -8.6, 1.2); plant(5.9, -9.0, 1.0);

    /* ===== Administración y Marketing: vidrios entre escritorios ===== */
    [-9.5, -5.5, 5.5, 9.5].forEach(function (x) { glassWall(x, 4.0, x, 6.9, 1.7); });
    plant(-14.0, 9.0, 1.0); plant(-1.0, 9.0, 0.9); plant(1.0, 9.0, 0.9); plant(14.0, 9.0, 1.0);
    plant(-3.3, 0.9, 1.0); plant(3.3, 0.9, 1.0);

    /* ===== Agentes ===== */
    var pickRoots = [], idleAv = [];
    var selRing = new T.Mesh(new T.RingGeometry(1.7, 2.0, 56), new T.MeshBasicMaterial({ color: 0x111418, transparent: true, opacity: 0.9, side: T.DoubleSide }));
    selRing.rotation.x = -Math.PI / 2; selRing.visible = false; scene.add(selRing);
    AGENTS.forEach(function (a) {
      desk(a);
      var av = avatar(a); av.position.set(a.desk.x, a.base, a.desk.z - 1.15); av.userData.agentId = a.id;
      scene.add(av); pickRoots.push(av); idleAv.push(av);
      var cx = a.desk.x, cz = a.desk.z - 0.55;
      ring(cx, a.base, cz, a.rank < 3 ? 2.2 : 1.85, hex(a.look.acc), 0.6);
      a.anchor = new T.Vector3(a.desk.x, 3.2 + a.base, a.desk.z - 1.15);
      a.ringAt = new T.Vector3(cx, a.base + 0.03, cz);
      a.focusAt = new T.Vector3(a.desk.x, 1.5 + a.base, a.desk.z - 0.9);
    });

    /* cámara */
    var W = 800, H = 500, tween = null, homeSet = false;
    var HOME_DIR = new T.Vector3(0.07, 0.55, 0.83).normalize(), HOME_TGT = new T.Vector3(0, 0, -0.5);
    function homePose() {
      var a = W / H, d = Math.min(46, 27 * Math.pow(Math.max(1, 1.6 / a), 0.85));
      return { pos: HOME_TGT.clone().addScaledVector(HOME_DIR, d), tgt: HOME_TGT.clone() };
    }
    function flyTo(pos, tgt, ms) {
      if (REDUCED) { camera.position.copy(pos); controls.target.copy(tgt); controls.update(); return; }
      tween = { t0: performance.now(), ms: ms || 1000, p0: camera.position.clone(), g0: controls.target.clone(), p1: pos, g1: tgt };
    }
    controls.addEventListener('start', function () { tween = null; });
    hooks.home = function () { var h = homePose(); flyTo(h.pos, h.tgt, 1100); };
    hooks.focus = function (a) {
      var tgt = a.focusAt.clone(), pos = tgt.clone().add(new T.Vector3(2.4, 2.6, 6.4));
      flyTo(pos, tgt, 1000);
    };
    hooks.mark = function (id) {
      var a = byId(id);
      if (a) { selRing.position.copy(a.ringAt); selRing.visible = true; } else selRing.visible = false;
    };

    function resize() {
      var cw = stage.clientWidth, ch = stage.clientHeight;
      if (cw < 10 || ch < 10) return;
      W = cw; H = ch;
      renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix();
      if (!homeSet) { var h = homePose(); camera.position.copy(h.pos); controls.target.copy(h.tgt); controls.update(); homeSet = true; }
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
    resize();

    /* clic sobre un agente (sin confundirlo con arrastrar) */
    var ray = new T.Raycaster(), mouse = new T.Vector2(), downAt = null;
    dom.addEventListener('pointerdown', function (e) { downAt = { x: e.clientX, y: e.clientY }; });
    dom.addEventListener('pointerup', function (e) {
      if (!downAt) return;
      var dx = e.clientX - downAt.x, dy = e.clientY - downAt.y; downAt = null;
      if (dx * dx + dy * dy > 36) return;
      var r = dom.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(mouse, camera);
      var hits = ray.intersectObjects(pickRoots, true);
      if (hits.length) { var o = hits[0].object; while (o && !(o.userData && o.userData.agentId)) o = o.parent; if (o) select(o.userData.agentId); }
    });

    /* tarjetas flotantes */
    var v = new T.Vector3();
    function placeCards() {
      var fovK = 2 * Math.tan((camera.fov * Math.PI) / 360);
      AGENTS.forEach(function (a) {
        v.copy(a.anchor).project(camera);
        var c = a.card;
        if (v.z > 1 || v.z < -1) { c.hidden = true; return; }
        c.hidden = false;
        var dist = camera.position.distanceTo(a.anchor), ppu = H / (dist * fovK);
        var isSel = a.id === sel, compact = ppu < 50 && !isSel;
        c.classList.toggle('compact', compact);
        var k = compact ? Math.min(1, Math.max(0.8, W / 900)) : Math.min(1.15, Math.max(0.7, ppu / 72)) * Math.min(1, Math.max(0.7, W / 700));
        var x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H;
        c.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-100%) scale(' + k.toFixed(3) + ')';
        c.style.zIndex = isSel ? 5 : Math.round(1000 - dist * 10);
      });
    }

    /* ===== Movimiento: informes que suben por la jerarquía, y destellos cuando entra algo nuevo ===== */
    var flows = [], pulsesL = [];
    var envGeo = new T.BoxGeometry(0.46, 0.035, 0.32), stripeGeo = new T.BoxGeometry(0.34, 0.04, 0.07);
    function envMesh(col) {
      var g = new T.Group();
      g.add(new T.Mesh(envGeo, new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })));
      var s = new T.Mesh(stripeGeo, new T.MeshBasicMaterial({ color: col })); s.position.set(0, 0.012, -0.07); g.add(s);
      g.visible = false; scene.add(g); return g;
    }
    function pathOf(a) {
      var pts = [], cur = a;
      while (cur) { pts.push(new T.Vector3(cur.desk.x, cur.base + 1.7, cur.desk.z - 0.2)); cur = cur.boss ? byId(cur.boss) : null; }
      var tot = 0, segs = [];
      for (var i = 1; i < pts.length; i++) { var L = pts[i].distanceTo(pts[i - 1]); segs.push(L); tot += L; }
      return { pts: pts, segs: segs, len: tot };
    }
    function along(p, k, out) {
      var d = k * p.len, i = 0;
      while (i < p.segs.length - 1 && d > p.segs[i]) { d -= p.segs[i]; i++; }
      var f = Math.min(1, d / (p.segs[i] || 1));
      out.lerpVectors(p.pts[i], p.pts[i + 1], f);
      return out;
    }
    var ringGeo = new T.RingGeometry(0.9, 1.0, 48);
    function addPulseRing(a, col) {
      var m = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, side: T.DoubleSide, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.copy(a.ringAt); m.position.y += 0.05; scene.add(m);
      return m;
    }
    hooks.sync = function () {
      flows.forEach(function (f) { scene.remove(f.env); });
      flows = [];
      AGENTS.forEach(function (a) {
        var hot = false;
        if (LIVEIDS[a.id] && a.id !== 'ejecutivo') {
          var u = urg(a.id), m = (A.find[a.id] || []).filter(function (x) { return x[0] === 'media'; }).length;
          var n = Math.min(a.id === 'admin' ? 2 : 3, u) + (m ? 1 : 0);
          hot = u > 0 || (a.area === 'Marketing' && m > 0);
          for (var i = 0; i < n; i++) {
            var isUrg = i < u;
            flows.push({ p: pathOf(a), env: envMesh(isUrg ? 0xd8352a : 0xd98a00), speed: 0.06 + 0.012 * (a.rank === 3 ? 1 : 0), ph: (i / Math.max(1, n)) + (a.rank === 3 ? 0.07 : 0.33) });
          }
        }
        idleAv.forEach(function (av) { if (av.userData.agentId === a.id) av.userData.hot = hot; });
      });
    };
    hooks.pulse = function (id) {
      var a = byId(id); if (!a || REDUCED || !a.boss) return;
      pulsesL.push({ a: a, p: pathOf(a), env: envMesh(0x2f9e6b), ring: addPulseRing(a, 0x2f9e6b), t0: performance.now(), ms: 4200 });
    };
    var tmpV = new T.Vector3();
    function stepFlows(now, t) {
      flows.forEach(function (f) {
        var k = ((t * f.speed) + f.ph) % 1;
        along(f.p, k, tmpV); f.env.position.copy(tmpV); f.env.position.y += Math.sin(Math.PI * k * f.p.segs.length) * 0.18 + 0.05;
        f.env.rotation.y = t * 0.8 + f.ph * 6; f.env.visible = true;
      });
      for (var i = pulsesL.length - 1; i >= 0; i--) {
        var q = pulsesL[i], k = (now - q.t0) / q.ms;
        if (k >= 1) { scene.remove(q.env); scene.remove(q.ring); pulsesL.splice(i, 1); continue; }
        along(q.p, k, tmpV); q.env.position.copy(tmpV); q.env.position.y += Math.sin(Math.PI * k * q.p.segs.length) * 0.2 + 0.1; q.env.rotation.y = k * 9; q.env.visible = true;
        var rk = Math.min(1, k * 2.4); q.ring.scale.setScalar(1 + rk * 1.5); q.ring.material.opacity = 0.9 * (1 - rk);
      }
    }
    hooks.sync();

    /* animación */
    var running = true;
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { running = es[0].isIntersecting; }).observe(stage);
    function loop(now) {
      requestAnimationFrame(loop);
      if (!running || view !== '3d') return;
      var t = now / 1000;
      if (tween) {
        var k = Math.min(1, (now - tween.t0) / tween.ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        camera.position.lerpVectors(tween.p0, tween.p1, e); controls.target.lerpVectors(tween.g0, tween.g1, e);
        if (k >= 1) tween = null;
      }
      if (!REDUCED) {
        idleAv.forEach(function (av) {
          var u = av.userData;
          u.head.rotation.y = Math.sin(t * 0.7 + u.phase) * 0.18; u.head.rotation.x = Math.sin(t * 0.5 + u.phase) * 0.04;
          u.hands.forEach(function (h, i) { h.position.y = h.userData.y0 + Math.sin(t * (u.hot ? 15 : 9) + u.phase + i * 1.7) * 0.012; });
        });
        selRing.material.opacity = 0.55 + Math.sin(t * 3) * 0.3;
        stepFlows(now, t);
      }
      controls.update();
      renderer.render(scene, camera);
      placeCards();
    }
    requestAnimationFrame(loop);
    select(sel);
  }


    ensureThree(function (ok) {
      try { if (!ok) throw new Error('three no cargó'); init3D(); }
      catch (e) {
        if (window.console) console.error(e);
        $('#nogl').hidden = false; $('#hint').hidden = true; $('#home').hidden = true;
        AGENTS.forEach(function (a) { a.card.hidden = true; });
        setView('org'); $('#tab-3d').hidden = true;
        orgEl.appendChild(el('p', 'org-note', 'La vista 3D no se pudo abrir en este navegador. El organigrama y la barra de agentes siguen disponibles.'));
        select(sel);
      }
    });
    return { refresh: refresh, select: select };
  }
  var inst = null, hostEl = null;
  window.OFICINA = {
    /* devuelve el elemento persistente; getD() entrega los datos actuales del sistema */
    abrir: function (getD) {
      if (!hostEl) { hostEl = document.createElement('div'); hostEl.id = 'oficinaHost'; inst = mount(hostEl, getD); }
      return hostEl;
    },
    refrescar: function () { if (inst) inst.refresh(); }
  };
})();
