/* Oficina CODES: agentes de IA que leen los datos del sistema (solo lectura) y se muestran en 3D.
   Se carga solo cuando se abre «Oficina». Usa three.js r128 desde cdnjs/jsDelivr. */
(function () {
  'use strict';
  var CSS = ":host{display:block;--o-bg:var(--bg);--o-surface:var(--surface);--o-fg:var(--ink);--o-muted:var(--ink-2);--o-line:var(--line);--o-stage:var(--surface-2);--o-alert:#d8352a;--o-amber:#ffc93c;--o-ok:#2f9e6b;--o-display:var(--f-display,'Barlow Condensed','Arial Narrow',sans-serif);--o-body:var(--f-body,'Barlow',system-ui,sans-serif);font-family:var(--o-body);color:var(--o-fg);font-size:15px;line-height:1.45}\n.bar-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 16px;margin-bottom:12px}\n.fnd i{color:var(--o-muted);font-style:normal;font-size:12px}\n.feed{display:grid;gap:2px}.feed li{padding-left:0}.feed li::before{display:none}\n.feed button{all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;padding:7px 8px 7px 14px;border-radius:7px;border-left:4px solid var(--tc);font-size:13.5px;line-height:1.3;position:relative}\n.feed button:hover,.feed button:focus-visible{background:color-mix(in srgb,var(--o-fg) 7%,transparent)}\n.feed button b{font-weight:700}.feed button span{float:right;color:var(--o-muted);font-size:12px;margin-left:8px}\ndetails{margin:14px 0 0}details summary{cursor:pointer;font:600 13px/1 var(--o-display);letter-spacing:.14em;text-transform:uppercase;color:var(--o-muted);padding:4px 0}\ndetails ul{margin-top:8px}\n.chip[hidden]{display:none}\n[hidden]{display:none!important}\n/* Layout: tabs switch between the 3D cutaway office and the org chart; roster dock under them; detail panel at the right (below on phones).\n   Palette: whites and cool grays everywhere; one accent per team (coral, indigo, teal) plus signal-red for pending items; the 3D scene is a white/gray architectural office. */\n\n\n\n\n*{box-sizing:border-box}\n\n\n\n.eyebrow{font:600 13px/1 var(--o-display);letter-spacing:.14em;text-transform:uppercase;color:var(--o-muted)}\n\n.chips{display:flex;flex-wrap:wrap;gap:8px}\n.chip{display:inline-flex;align-items:baseline;gap:6px;padding:7px 12px;border:1px solid var(--o-line);background:var(--o-surface);border-radius:8px;font-size:13px;color:var(--o-muted);font-family:var(--o-body)}\n.chip b{font:700 20px/1 var(--o-display);color:var(--o-fg);font-variant-numeric:tabular-nums}\nbutton.chip{cursor:pointer}\n.chip.red{background:var(--o-alert);border-color:var(--o-alert);color:#fff}\n.chip.red b{color:#fff}\nbutton:focus-visible,.card:focus-visible{outline:3px solid var(--o-amber);outline-offset:2px}\n\n.layout{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start}\n@media (min-width:980px){.layout{grid-template-columns:minmax(0,1fr) 370px}}\n.left{display:flex;flex-direction:column;gap:12px;min-width:0}\n\n.tabs{display:flex;gap:4px;padding:4px;background:var(--o-surface);border:1px solid var(--o-line);border-radius:10px;align-self:flex-start}\n.tabs button{font:600 14px var(--o-body);padding:8px 16px;border:0;border-radius:7px;background:transparent;color:var(--o-muted);cursor:pointer}\n.tabs button[aria-selected=\"true\"]{background:var(--o-fg);color:var(--o-bg)}\n\n.stage{position:relative;height:clamp(440px,68vh,720px);border-radius:12px;overflow:hidden;background:var(--o-stage);isolation:isolate}\n.stage[hidden],.org[hidden]{display:none}\n.stage canvas{display:block;width:100%;height:100%;touch-action:none}\n#cards{position:absolute;inset:0;pointer-events:none;overflow:hidden}\n.callout{position:absolute;left:12px;top:12px;z-index:6;max-width:210px;background:var(--o-alert);color:#fff;border-radius:10px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,.35)}\n.callout b{display:block;font:700 20px/1 var(--o-display);letter-spacing:.02em;text-transform:uppercase}\n.callout span{display:block;margin:5px 0 8px;font-size:12.5px;line-height:1.3;opacity:.95}\n.callout button{font:600 12px var(--o-body);color:var(--o-alert);background:#fff;border:0;border-radius:6px;padding:6px 10px;cursor:pointer}\n.home{position:absolute;right:12px;top:12px;z-index:6;font:600 13px var(--o-body);color:#fff;background:rgba(14,16,25,.78);border:1px solid rgba(255,255,255,.22);border-radius:8px;padding:8px 12px;cursor:pointer;backdrop-filter:blur(6px)}\n.hint{position:absolute;left:12px;bottom:10px;z-index:6;font-size:12px;color:rgba(255,255,255,.7);background:rgba(14,16,25,.6);padding:5px 9px;border-radius:6px;pointer-events:none}\n.nogl{position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;color:#c9d1dd}\n\n.card{position:absolute;left:0;top:0;width:182px;padding:9px 11px 10px;border-radius:14px;background:rgba(12,15,23,.93);border:2px solid var(--sc);color:#fff;\n  box-shadow:0 0 0 1px rgba(0,0,0,.45),0 0 18px var(--gl),0 8px 22px rgba(0,0,0,.45);cursor:pointer;pointer-events:auto;text-align:left;\n  font-family:var(--o-body);transform-origin:50% 100%;will-change:transform;user-select:none}\n.card .top{display:flex;align-items:center;gap:7px}\n.card .dot{flex:none;width:10px;height:10px;border-radius:50%;background:var(--tc)}\n.card .name{font:700 16px/1.1 var(--o-body);white-space:nowrap}\n.card .badge{margin-left:auto;font:700 9px/1 var(--o-body);letter-spacing:.07em;text-transform:uppercase;padding:4px 6px;border-radius:6px;color:var(--sc);background:rgba(255,255,255,.08);white-space:nowrap}\n.card .role{margin-top:4px;font-size:12px;color:#b3bccb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.card .bar{margin-top:8px;height:5px;border-radius:3px;background:rgba(255,255,255,.13);overflow:hidden}\n.card .bar i{display:block;height:100%;width:0;background:var(--sc);border-radius:3px}\n.card.compact{width:auto;padding:6px 11px;border-radius:12px}\n.card.compact .role,.card.compact .bar,.card.compact .badge{display:none}\n.card.sel{z-index:5}\n.card[hidden]{display:none}\n\n/* organigrama */\n.org{background:var(--o-surface);border:1px solid var(--o-line);border-radius:12px;padding:22px 14px 16px;overflow-x:auto}\n.org-note{margin:18px 4px 0;font-size:13px;color:var(--o-muted);display:flex;flex-wrap:wrap;gap:6px 18px}\n.org-note span::before{content:\"\";display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px;background:var(--c)}\n.tree,.tree ul{list-style:none;margin:0;padding:0}\n.tree{display:flex;width:max-content;margin:0 auto}\n.tree ul{display:flex;justify-content:center;padding-top:26px;position:relative}\n.tree li{display:flex;flex-direction:column;align-items:center;position:relative;padding:26px 7px 0}\n.tree li::before,.tree li::after{content:\"\";position:absolute;top:0;right:50%;width:50%;height:26px;border-top:2px solid var(--o-line)}\n.tree li::after{right:auto;left:50%;border-left:2px solid var(--o-line)}\n.tree li:only-child::before,.tree li:only-child::after{display:none}\n.tree li:only-child{padding-top:0}\n.tree li:first-child::before,.tree li:last-child::after{border:0 none}\n.tree li:last-child::before{border-right:2px solid var(--o-line);border-radius:0 8px 0 0}\n.tree li:first-child::after{border-radius:8px 0 0 0}\n.tree ul ul::before,.tree li>ul::before{content:\"\";position:absolute;top:0;left:50%;border-left:2px solid var(--o-line);width:0;height:26px}\n.tree>li{padding-top:0}\n.node{display:flex;flex-direction:column;align-items:flex-start;gap:3px;width:118px;padding:9px 10px;border:2px solid var(--tc,var(--o-fg));border-radius:10px;background:var(--o-surface);color:var(--o-fg);text-align:left;font-family:var(--o-body);cursor:pointer}\n.node .nm{display:flex;align-items:center;gap:7px;min-width:0}\n.node .dot{flex:none;width:10px;height:10px;border-radius:50%;background:var(--tc)}\n.node b{font:700 14px/1.15 var(--o-body)}\n.node small{display:block;font-size:11.5px;color:var(--o-muted);line-height:1.25}\n.node.big{width:172px}\n.node[aria-pressed=\"true\"]{background:color-mix(in srgb,var(--tc) 18%,var(--o-surface))}\n.node.owner{border-style:dashed;cursor:default;width:190px}\n@media (max-width:720px){\n  .tree{display:block;width:auto;margin:0}\n  .tree ul{display:block;padding:0 0 0 14px;margin-left:12px;border-left:2px solid var(--o-line)}\n  .tree ul::before,.tree li>ul::before{display:none}\n  .tree li{display:block;padding:10px 0 0 16px}\n  .tree li::before{display:block;content:\"\";position:absolute;left:0;top:34px;width:16px;height:0;right:auto;border:0;border-top:2px solid var(--o-line);border-radius:0}\n  .tree li::after{display:none}\n  .tree>li{padding-left:0}.tree>li::before{display:none}\n  .tree li:only-child{padding-top:10px}\n  .tree>li:only-child{padding-top:0}\n  .node,.node.big,.node.owner{width:auto;max-width:none}\n}\n\n.dock{display:flex;align-items:center;gap:6px;padding:8px;background:var(--o-surface);border:1px solid var(--o-line);border-radius:12px;overflow-x:auto}\n.who{flex:none;display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:9px;border:1px solid transparent;background:transparent;color:var(--o-fg);font:600 14px var(--o-body);cursor:pointer;white-space:nowrap}\n.who i{width:11px;height:11px;border-radius:50%;background:var(--tc,var(--o-muted))}\n.who:hover{background:color-mix(in srgb,var(--o-fg) 7%,transparent)}\n.who[aria-pressed=\"true\"]{border-color:var(--o-fg);background:color-mix(in srgb,var(--o-fg) 8%,transparent)}\n.dock .sep{flex:none;width:1px;align-self:stretch;background:var(--o-line);margin:2px 4px}\n\n.panel{background:var(--o-surface);border:1px solid var(--o-line);border-radius:12px;padding:20px;min-width:0}\n@media (min-width:980px){.panel{position:sticky;top:16px;max-height:calc(100vh - 32px);overflow-y:auto}}\n.p-head{display:flex;align-items:center;gap:12px;margin-bottom:12px}\n.p-dot{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--tc) 22%,transparent);border:2px solid var(--tc)}\n.p-dot i{width:14px;height:14px;border-radius:50%;background:var(--tc)}\n.panel h2{margin:2px 0 0;font:700 30px/1 var(--o-display);text-transform:uppercase;letter-spacing:.01em}\n.panel h3{margin:18px 0 6px;font:600 13px/1 var(--o-display);letter-spacing:.14em;text-transform:uppercase;color:var(--o-muted)}\n.panel h3 em{font-style:normal;margin-left:8px;padding:2px 7px;border-radius:5px;background:color-mix(in srgb,var(--o-amber) 30%,transparent);color:var(--o-fg);letter-spacing:.06em;font-family:var(--o-body);font-weight:600;font-size:11px;text-transform:none}\n.panel ul{margin:0;padding:0;list-style:none;display:grid;gap:8px}\n.panel li{padding-left:16px;position:relative;text-wrap:pretty}\n.panel li::before{content:\"\";position:absolute;left:0;top:.62em;width:7px;height:7px;border-radius:2px;background:var(--tc,var(--o-alert))}\n.status{display:inline-flex;align-items:center;gap:8px;margin:0;padding:5px 10px;border-radius:7px;background:color-mix(in srgb,var(--sc) 18%,transparent);font-weight:600;font-size:13px}\n.status i{width:8px;height:8px;border-radius:50%;background:var(--sc)}\n.rel{margin:12px 0 0;font-size:13.5px;color:var(--o-muted);display:grid;gap:3px}\n.rel b{color:var(--o-fg);font-weight:600}\n.fnd li::before{background:var(--fc)}\n.fnd b.sev{font:700 10px/1 var(--o-body);letter-spacing:.08em;text-transform:uppercase;margin-right:6px;padding:2px 5px;border-radius:4px;color:#fff;background:var(--fc);vertical-align:1px}\n.panel h3 small{font:500 11px var(--o-body);letter-spacing:0;text-transform:none;margin-left:8px}\n.note{margin:18px 0 0;padding-top:14px;border-top:1px solid var(--o-line);font-size:13px;color:var(--o-muted)}\n.pending{color:var(--o-muted);font-style:normal;font-weight:600}\n@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}\n.chat{margin-top:12px;background:var(--o-surface);border:1px solid var(--o-line);border-radius:12px;display:flex;flex-direction:column;overflow:hidden}\n.c-head{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--o-line)}\n.c-head b{font:700 20px/1 var(--o-display);text-transform:uppercase;letter-spacing:.02em}\n.c-head small{color:var(--o-muted);font-size:12.5px}\n.c-head button{all:unset;margin-left:auto;cursor:pointer;font-size:12px;color:var(--o-muted);padding:4px 8px;border-radius:6px}\n.c-head button:hover,.c-head button:focus-visible{background:color-mix(in srgb,var(--o-fg) 8%,transparent)}\n.c-log{height:min(420px,56vh);overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;background:var(--o-stage)}\n.msg{max-width:min(680px,88%);padding:9px 13px;border-radius:12px;font-size:14.5px;line-height:1.45;overflow-wrap:anywhere}\n.msg p{margin:0}.msg p+p,.msg p+ul,.msg ul+p{margin-top:6px}.msg ul{margin:0;padding-left:18px;display:block}.msg li{padding:0;margin:2px 0}.msg li::before{display:none}\n.msg.ia{align-self:flex-start;background:var(--o-surface);border:1px solid var(--o-line)}\n.msg.user{align-self:flex-end;background:var(--o-fg);color:var(--o-bg)}\n.msg.err{border-color:var(--o-alert);color:var(--o-alert)}\n.dots i{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:var(--o-muted);animation:cd 1s infinite ease-in-out}\n.dots i:nth-child(2){animation-delay:.15s}.dots i:nth-child(3){animation-delay:.3s}\n@keyframes cd{0%,80%,100%{opacity:.25}40%{opacity:1}}\n@media (prefers-reduced-motion:reduce){.dots i{animation:none}}\n.c-sug{display:flex;gap:6px;flex-wrap:wrap;padding:10px 16px 0}\n.sg{all:unset;box-sizing:border-box;cursor:pointer;font-size:12.5px;padding:5px 10px;border:1px solid var(--o-line);border-radius:999px;color:var(--o-fg)}\n.sg:hover,.sg:focus-visible{background:color-mix(in srgb,var(--o-fg) 8%,transparent)}\n.c-note{margin:8px 16px 0;font-size:12.5px;color:var(--o-muted)}\n.c-form{display:flex;gap:8px;padding:12px 16px;align-items:flex-end}\n.c-form textarea{flex:1;min-width:0;resize:none;font:inherit;font-size:15px;line-height:1.35;padding:9px 12px;border:1px solid var(--o-line);border-radius:10px;background:var(--o-bg);color:var(--o-fg);max-height:140px}\n.c-form textarea:focus-visible{outline:2px solid var(--o-fg);outline-offset:1px}\n.c-form button{font:700 14px var(--o-body);padding:10px 18px;border:0;border-radius:10px;background:var(--o-fg);color:var(--o-bg);cursor:pointer;min-height:40px}\n.c-form button:disabled{opacity:.45;cursor:default}\n\n.callout{display:none!important}\n";
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
    /* Con factura / sin factura (en negro): lo marca el usuario en cada transacción. Lo declarado sin factura no se reclama como «falta factura». */
    var conF = function (t) { return !t.auto && t.tipo !== 'interna' && t.tipo !== 'inicial'; };
    var salNeg = sal.filter(function (t) { return conF(t) && t.conFact === 'no'; });
    var salND = sal.filter(function (t) { return conF(t) && !t.conFact; });
    var entNeg = ent.filter(function (t) { return conF(t) && t.conFact === 'no'; });
    var entND = ent.filter(function (t) { return conF(t) && !t.conFact; });
    var salPorTer = agrupar(sal.filter(function (t) { return !excl(t.terceroId) && t.conFact !== 'no'; }), function (t) { return t.terceroId; });
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
    var negTot = suma(salNeg, function (t) { return t.total; }), conTot = suma(sal.filter(function (t) { return conF(t) && t.conFact === 'si'; }), function (t) { return t.total; });
    var negPorTer = agrupar(salNeg, function (t) { return t.terceroId; });
    var negRank = Object.keys(negPorTer).map(function (id) { return { id: id, s: suma(negPorTer[id], function (t) { return t.total; }), n: negPorTer[id].length }; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 3);
    if (salNeg.length) add('compras', 'info', 'Pagos marcados sin factura (en negro): ' + mm(negTot) + ' en ' + salNeg.length + ' pagos, ' + (negTot + conTot ? Math.round(negTot / (negTot + conTot) * 100) : 0) + '% de lo definido con o sin factura en pesos. Los mayores: ' + negRank.map(function (x) { return esc(tn(x.id)) + ' ' + mm(x.s); }).join('; ') + '.');
    chk('compras', salND.length > 0, 'media', function () { return salND.length + ' pago' + (salND.length === 1 ? '' : 's') + ' en pesos por ' + mm(suma(salND, function (t) { return t.total; })) + ' sin marcar si tienen factura o van sin factura. Hay que definirlos en Transacciones → Modificar (columna «¿Tiene factura?»).'; });
    if (entNeg.length) add('cobros', 'info', 'Cobros marcados sin factura (en negro): ' + mm(suma(entNeg, function (t) { return t.total; })) + ' en ' + entNeg.length + ' cobros.');
    chk('cobros', entND.length > 0, 'media', function () { return entND.length + ' cobro' + (entND.length === 1 ? '' : 's') + ' en pesos por ' + mm(suma(entND, function (t) { return t.total; })) + ' sin marcar si tienen factura o van sin factura. Definirlos en Transacciones → Modificar.'; });
    if (salNeg.length || entNeg.length) add('impuestos', 'info', 'Marcado sin factura en el sistema (en pesos): egresos ' + mm(negTot) + ' y cobros ' + mm(suma(entNeg, function (t) { return t.total; })) + '. No se descuentan como gasto ni se suman a las ventas declaradas.');
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
      (I.chequeos || []).filter(function (c) { return !/^Hay egresos sin comprobante/.test(c.t); }).forEach(function (c) { chk('impuestos', true, c.sev === 'alta' ? 'alta' : 'media', esc(c.t)); });
      add('impuestos', 'info', 'Ejercicio ' + fd(r.ejercicio_ini) + ' al ' + fd(r.ejercicio_fin) + ' · informe de la semana del ' + fd(sem) + ' (' + (I.estado === 'aprobado' ? 'aprobado por Dir. Adm.' : 'observado') + ').');
      add('impuestos', 'info', 'Ventas del ejercicio: ' + mm(r.ventas_brutas) + ' brutas (con IVA) y ' + mm(r.ventas_netas) + ' netas · gastos deducibles con factura: ' + mm(r.compras_deducibles) + ' · resultado a hoy: <b>' + mm(r.resultado_ytd) + '</b>.');
      add('impuestos', 'info', 'Proyección al ' + fd(r.ejercicio_fin) + ' (ritmo desde el ' + fd(r.desde_datos) + ', ' + r.dias + ' días): resultado <b>' + mm(r.resultado_proy) + '</b> · Ganancias estimado <b>' + mm(r.ganancias_proy) + '</b> · quedaría ' + mm(r.neto_proy) + ' después de impuesto. Con lo ya facturado, sin proyectar: Ganancias ' + mm(r.ganancias_ytd) + '.');
      if (r.sin_comprobante > 0) chk('impuestos', r.sin_comprobante_candidatos > 0.25 * r.ventas_netas, 'alta', 'Pagos sin factura vinculada en el ejercicio: ' + mm(r.sin_comprobante) + ' en ' + r.sin_comprobante_n + ' movimientos (' + mm(r.sin_comprobante_candidatos) + ' parecen gastos). No se descuentan: con su comprobante bajarían el impuesto.');
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

    { id: 'dirmkt', name: 'Michael', short: 'Michael', role: 'Director de Marketing · productor y orquestador', area: 'Marketing', level: 'Rango 2', boss: 'ejecutivo', tc: MKT, state: 'espera',
      desk: { x: 7.5, z: -0.2, w: 3.0 }, look: { shirt: 0x2b3038, hat: 0xf4f4f0, tie: 0x19b394, acc: 0x19b394, headset: true },
      does: ['Es el jefe de Marketing: dirige a Imagen, Guion y Redes. Mientras no tenga empleados, escribe él mismo los textos para Instagram.', 'Trabaja con el recetario de marca de CODES: tu voz (formal, cordial, humilde y tranquila), lo que ofrecen y lo que nunca se dice.', 'Antes de entregarte algo lo revisa solo: sin datos inventados, sin presumir y con una sola petición al final.', 'Solo habla contigo. No responde ni escribe a nadie más, y no tiene acceso a las cuentas: tú copias y publicas.'],
      skills: ['Posts, carruseles, guiones de reel e historias para Instagram, 3 piezas por semana.', 'Cada pieza: gancho en la primera línea, una sola idea, algo útil para el cliente y una sola petición (escribir por mensaje privado de Instagram).', 'Entrega una versión lista para copiar y 2 ganchos de repuesto, con una línea de «revisado contra tu recetario».', 'Guarda cada pieza en su carpeta de proyectos y anota tus correcciones para no repetir el error.', 'Colores rojo y gris, letra simple y firme.'],
      needs: ['Una frase textual de lo que le duele al cliente: ' + PEND + '.', 'Palabras que nunca usarías: ' + PEND + '.', 'Confirmar los ejemplos «así sí / así no» y tu OK al primer post (el del hospital en 48 horas).'] },
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
      if (!msgs.length) bubble('ia', 'Hola. Ya revisé el sistema con los contadores. Pregúntame lo que quieras o dame una tarea: por ejemplo, qué atender primero hoy.');
      msgs.forEach(function (m) { bubble(m.role === 'user' ? 'user' : 'ia', m.content); });
    }
    function fail(d, txt) { d.classList.add('err'); d.innerHTML = '<p>' + esc(txt) + '</p>'; }
    function ask(text) {
      text = (text || '').trim(); if (!text || busy) return;
      var C = getD().chat;
      if (!C || !C.ok) { note.hidden = false; note.textContent = 'La charla funciona en el sistema real con tu usuario de dueño o contador, no en la demo.'; return; }
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
    var C0 = getD().chat; if (!C0 || !C0.ok) { note.hidden = false; note.textContent = 'La charla funciona en el sistema real con tu usuario de dueño o contador, no en la demo.'; }
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
    rug(0, -6.7, 9.4, 5.8, '#3b4047', '#a8171b');       /* dirección ejecutiva */
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

    /* ===== Identidad CODES: rojo de marca, logo y láminas de maquinaria ===== */
    var RED = '#e31b1f', REDD = '#b3171b';
    var FONT = '"Barlow Condensed","Arial Narrow",sans-serif';
    /* franja de obra rojo y blanco sobre el zócalo del fondo */
    var hzTex = canvasTex(256, 32, function (g, w, h) {
      g.fillStyle = '#f4f4f2'; g.fillRect(0, 0, w, h); g.fillStyle = RED;
      for (var i = -2; i < 12; i++) { g.beginPath(); g.moveTo(i * 32, h); g.lineTo(i * 32 + 16, h); g.lineTo(i * 32 + 32, 0); g.lineTo(i * 32 + 16, 0); g.closePath(); g.fill(); }
    });
    hzTex.wrapS = T.RepeatWrapping; hzTex.repeat.set(58, 1);
    var hz = new T.Mesh(new T.PlaneGeometry(29.6, 0.2), new T.MeshBasicMaterial({ map: hzTex }));
    hz.position.set(0, 0.3, -9.935); scene.add(hz);
    /* logo grande detrás del Director Ejecutivo */
    var logoImg = new Image(), logoOk = false;
    function logoPaint(g, cw, ch) {
      g.clearRect(0, 0, cw, ch);
      rr(g, 6, 6, cw - 12, ch - 12, 26); g.fillStyle = '#fbfbfb'; g.fill(); g.lineWidth = 6; g.strokeStyle = RED; g.stroke();
      if (logoOk) { var k = Math.min((cw - 90) / logoImg.width, (ch - 70) / logoImg.height); var iw = logoImg.width * k, ih = logoImg.height * k; g.drawImage(logoImg, (cw - iw) / 2, (ch - ih) / 2, iw, ih); }
    }
    logoImg.onload = function () { logoOk = true; var c = logoTex.image; logoPaint(c.getContext('2d'), c.width, c.height); logoTex.needsUpdate = true; };
    logoImg.src = 'data:image/png;base64,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';
    var logoTex = canvasTex(1024, 320, logoPaint);
    if (logoOk) logoImg.onload();
    var logoM = new T.Mesh(new T.PlaneGeometry(4.6, 1.44), new T.MeshBasicMaterial({ map: logoTex, transparent: true }));
    logoM.position.set(0, 2.15, -9.93); scene.add(logoM); signs.push({ tex: logoTex, paint: logoPaint });
    /* láminas de maquinaria */
    function wheel(g, x, y, r) { g.fillStyle = '#23272d'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = '#b4b9c0'; g.beginPath(); g.arc(x, y, r * 0.45, 0, 7); g.fill(); }
    function pl(g, pts, w, col) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.stroke(); }
    var MAQ = {
      excavadora: function (g) {
        rr(g, 120, 300, 300, 56, 28); g.fillStyle = '#23272d'; g.fill();
        [160, 230, 300, 370].forEach(function (x) { g.fillStyle = '#6f757e'; g.beginPath(); g.arc(x, 328, 14, 0, 7); g.fill(); });
        g.fillStyle = RED; rr(g, 150, 232, 220, 70, 10); g.fill();
        g.fillStyle = '#23272d'; rr(g, 150, 172, 92, 66, 8); g.fill(); g.fillStyle = '#cfe3f2'; g.fillRect(160, 182, 72, 40);
        pl(g, [[330, 250], [450, 150], [540, 220]], 22, RED); pl(g, [[540, 220], [575, 300]], 16, '#23272d');
        g.fillStyle = '#23272d'; g.beginPath(); g.moveTo(560, 292); g.lineTo(620, 300); g.lineTo(592, 346); g.lineTo(546, 330); g.closePath(); g.fill();
      },
      cargadora: function (g) {
        g.fillStyle = RED; rr(g, 200, 230, 280, 80, 14); g.fill();
        g.fillStyle = '#23272d'; rr(g, 270, 160, 130, 76, 10); g.fill(); g.fillStyle = '#cfe3f2'; g.fillRect(282, 172, 106, 44);
        wheel(g, 270, 330, 52); wheel(g, 430, 330, 52);
        pl(g, [[200, 270], [120, 250], [90, 300]], 20, '#23272d');
        g.fillStyle = RED; g.beginPath(); g.moveTo(40, 260); g.lineTo(130, 270); g.lineTo(120, 350); g.lineTo(48, 350); g.closePath(); g.fill();
      },
      motoniveladora: function (g) {
        pl(g, [[90, 250], [520, 250]], 30, RED);
        g.fillStyle = '#23272d'; rr(g, 450, 160, 110, 90, 10); g.fill(); g.fillStyle = '#cfe3f2'; g.fillRect(462, 172, 86, 50);
        [300, 370, 440, 520].forEach(function (x) { wheel(g, x, 318, 36); });
        pl(g, [[190, 262], [175, 305]], 10, '#6f757e');
        g.fillStyle = '#23272d'; rr(g, 100, 300, 140, 22, 8); g.fill();
      },
      rodillo: function (g) {
        g.fillStyle = RED; rr(g, 150, 190, 330, 64, 14); g.fill();
        g.fillStyle = '#23272d'; rr(g, 290, 118, 120, 76, 10); g.fill(); g.fillStyle = '#cfe3f2'; g.fillRect(302, 130, 96, 46);
        [[200, 296], [430, 296]].forEach(function (c) { g.fillStyle = '#8a9099'; g.beginPath(); g.arc(c[0], c[1], 54, 0, 7); g.fill(); g.strokeStyle = '#23272d'; g.lineWidth = 8; g.stroke(); g.fillStyle = '#4a5059'; g.beginPath(); g.arc(c[0], c[1], 14, 0, 7); g.fill(); });
      },
      hormigonero: function (g) {
        g.fillStyle = '#23272d'; rr(g, 70, 240, 500, 40, 8); g.fill();
        g.fillStyle = '#f4f4f2'; rr(g, 70, 190, 100, 80, 12); g.fill(); g.fillStyle = '#cfe3f2'; g.fillRect(80, 200, 70, 36);
        g.save(); g.translate(360, 195); g.rotate(-0.18); g.fillStyle = '#f4f4f2'; g.beginPath(); g.ellipse(0, 0, 200, 78, 0, 0, 7); g.fill();
        g.strokeStyle = RED; g.lineWidth = 12; [-120, -50, 20, 90].forEach(function (x) { g.beginPath(); g.moveTo(x, -70); g.quadraticCurveTo(x + 40, 0, x, 70); g.stroke(); }); g.restore();
        [130, 330, 420, 500].forEach(function (x) { wheel(g, x, 306, 34); });
      }
    };
    function lamina(kind, label, x, y, z, ry, w) {
      function paint(g, cw, ch) {
        g.clearRect(0, 0, cw, ch); g.fillStyle = '#f4f5f6'; g.fillRect(0, 0, cw, ch);
        g.fillStyle = '#e3e5e8'; g.fillRect(0, ch - 150, cw, 150);
        g.save(); g.translate(0, 0); MAQ[kind](g); g.restore();
        g.fillStyle = RED; g.fillRect(0, 0, 18, ch);
        g.fillStyle = '#23272d'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = '800 64px ' + FONT; var fs = 64; while (g.measureText(label).width > cw - 80 && fs > 28) { fs -= 2; g.font = '800 ' + fs + 'px ' + FONT; } g.fillText(label, 44, 78);
        g.fillStyle = RED; g.fillRect(46, 94, 90, 6);
        g.fillStyle = '#4a5059'; g.font = '700 36px ' + FONT; g.fillText('CODES CONSTRUCCIONES', 44, ch - 22);
      }
      var tex = canvasTex(640, 440, paint), hh = w * 440 / 640, gp = new T.Group();
      gp.add(box(w + 0.16, hh + 0.16, 0.06, M('#23272d', { roughness: 0.5 }), 0, 0, 0, { cast: false }));
      var pm = new T.Mesh(new T.PlaneGeometry(w, hh), new T.MeshBasicMaterial({ map: tex })); pm.position.z = 0.04; gp.add(pm);
      gp.position.set(x, y, z); gp.rotation.y = ry; scene.add(gp); signs.push({ tex: tex, paint: paint });
    }
    lamina('excavadora', 'EXCAVADORA', -12.3, 2.15, -9.9, 0, 1.9);
    lamina('motoniveladora', 'MOTONIVELADORA', -7.2, 2.15, -9.9, 0, 1.9);
    lamina('cargadora', 'CARGADORA FRONTAL', -14.95, 2.3, -1.0, Math.PI / 2, 1.9);
    lamina('rodillo', 'RODILLO COMPACTADOR', -14.95, 2.3, 3.0, Math.PI / 2, 1.9);
    lamina('hormigonero', 'CAMIÓN HORMIGONERO', -14.95, 2.3, 7.0, Math.PI / 2, 1.9);

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
