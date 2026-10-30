/* Oficina · Obras y máquinas: terrenos (obras) en isométrico con la maquinaria trabajando.
   Se arrastra una máquina de una obra a otra; al pasar el mouse sale la ficha de combustible.
   Sin librerías: SVG puro. Lo monta oficina.js dentro de su shadow DOM. */
(function () {
  'use strict';
  var TW = 136, TH = 68, SLAB = 14, TOP = 50, LAB = 34, GAP = 30;
  var NS = 'http://www.w3.org/2000/svg';
  var COMB_T = { nafta: 'Nafta', diesel_500: 'Diésel 500', diesel_premium: 'Diésel Premium' };

  var CSS = '' +
    '.ob{position:relative;font-family:var(--o-body,system-ui,sans-serif);color:var(--o-fg,#1d2026)}' +
    '.ob-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin:0 0 10px}' +
    '.ob-bar p{margin:0;font-size:13px;color:var(--o-muted,#666c76);max-width:60ch}' +
    '.ob-leg{display:flex;gap:12px;font-size:12px;color:var(--o-muted,#666c76);flex-wrap:wrap}' +
    '.ob-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}' +
    '.ob-stage{position:relative;border-radius:14px;background:#ecebe4;border:1px solid var(--o-line,#d9dce1);overflow:hidden;touch-action:pan-y}' +
    '.ob-stage svg{display:block;width:100%;height:auto;user-select:none;-webkit-user-select:none}' +
    '.ob-m{cursor:grab}.ob-m.drag{cursor:grabbing}.ob-m:focus{outline:none}.ob-m:focus-visible .ob-ring{opacity:1}' +
    '.ob-ring{fill:none;stroke:#e31b1f;stroke-width:2;opacity:0;stroke-dasharray:4 3}.ob-m.sel .ob-ring{opacity:1}' +
    '.ob-panel{position:relative;margin-top:12px;background:var(--o-surface,#fff);border:1px solid var(--o-line,#d9dce1);border-radius:14px;padding:14px 18px 16px}' +
    '.ob-panel .x{position:absolute;top:8px;right:12px;border:0;background:none;font-size:22px;line-height:1;cursor:pointer;color:var(--o-muted,#666c76)}' +
    '.pn-head{display:flex;gap:14px;align-items:center;margin-bottom:10px}.pn-head h3{margin:0;font-size:17px}.pn-ic{background:#ecebe4;border-radius:12px;padding:6px 8px;flex:none}' +
    '.pn-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:6px 22px;border-top:1px solid var(--o-line,#d9dce1);padding-top:10px}' +
    '.ob-panel .sub{color:var(--o-muted,#666c76);font-size:12.5px}.ob-panel .st{display:inline-block;font-size:11.5px;font-weight:700;border-radius:99px;padding:2px 9px;margin-top:6px}' +
    '.ob-panel .st.on{background:#e6f6ec;color:#12794a}.ob-panel .st.off{background:#eceef2;color:#4a5160}' +
    '.ob-panel .sec{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--o-muted,#666c76);margin-bottom:4px}' +
    '.ob-panel dl{display:grid;grid-template-columns:1fr auto;gap:3px 12px;margin:0 0 8px;font-size:13px}.ob-panel dt{color:var(--o-muted,#666c76)}.ob-panel dd{margin:0;text-align:right;font-weight:700;font-variant-numeric:tabular-nums}' +
    '.ob-panel label{display:block;font-weight:700;font-size:12px}.ob-panel select{width:100%;margin-top:4px;font:inherit;padding:8px;border-radius:8px;border:1px solid var(--o-line,#c9ced6);background:var(--o-bg,#fff);color:var(--o-fg,#1d2026)}' +
    '.ob-panel .none{color:var(--o-muted,#666c76);font-size:13px}' +
    '.ob-m:hover .ob-ring{opacity:1}' +
    '.ob-tip{position:fixed;z-index:50;width:292px;max-width:calc(100vw - 16px);background:#fff;color:#1d2026;border-radius:12px;box-shadow:0 10px 30px rgba(20,24,30,.28),0 0 0 1px rgba(20,24,30,.08);padding:12px 14px;font-size:12.5px;line-height:1.35;pointer-events:none}' +
    '.ob-tip.pin{pointer-events:auto}' +
    '.ob-tip h4{margin:0 0 2px;font-size:14px;display:flex;gap:8px;align-items:center}' +
    '.ob-tip .sub{color:#666c76;font-size:12px}' +
    '.ob-tip .st{display:inline-block;font-size:11px;font-weight:700;border-radius:99px;padding:2px 8px;margin:6px 0 2px}' +
    '.ob-tip .st.on{background:#e6f6ec;color:#12794a}.ob-tip .st.off{background:#eceef2;color:#4a5160}' +
    '.ob-tip dl{display:grid;grid-template-columns:1fr auto;gap:3px 12px;margin:8px 0 0;padding:8px 0 0;border-top:1px solid #e6e8ec}' +
    '.ob-tip dt{color:#666c76}.ob-tip dd{margin:0;text-align:right;font-weight:700;font-variant-numeric:tabular-nums}' +
    '.ob-tip .sec{margin:8px 0 0;padding-top:8px;border-top:1px solid #e6e8ec;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#666c76}' +
    '.ob-tip .none{margin:8px 0 0;padding-top:8px;border-top:1px solid #e6e8ec;color:#666c76}' +
    '.ob-tip label{display:block;margin-top:10px;font-weight:700;font-size:12px}' +
    '.ob-tip select{width:100%;margin-top:4px;font:inherit;padding:7px 8px;border-radius:8px;border:1px solid #c9ced6;background:#fff;color:#1d2026}' +
    '.ob-tip .x{position:absolute;top:6px;right:8px;border:0;background:none;font-size:18px;line-height:1;cursor:pointer;color:#666c76}' +
    '.ob-empty{padding:30px 16px;text-align:center;color:var(--o-muted,#666c76)}' +
    /* animaciones de trabajo */
    '.a-arm{transform-box:fill-box;transform-origin:0% 100%;animation:oArm 2.6s ease-in-out infinite}' +
    '.a-stick{transform-box:fill-box;transform-origin:0% 0%;animation:oStick 2.6s ease-in-out infinite}' +
    '.a-lift{transform-box:fill-box;transform-origin:0% 100%;animation:oLift 3s ease-in-out infinite}' +
    '.a-bed{transform-box:fill-box;transform-origin:0% 100%;animation:oBed 5s ease-in-out infinite}' +
    '.a-bob{animation:oBob .9s ease-in-out infinite}' +
    '.a-shake{animation:oShake .13s linear infinite}' +
    '.a-spin{transform-box:fill-box;transform-origin:50% 50%;animation:oSpin 1.6s linear infinite}' +
    '.a-blade{animation:oBlade 2.4s ease-in-out infinite}' +
    '@keyframes oArm{0%,100%{transform:rotate(4deg)}50%{transform:rotate(-9deg)}}' +
    '@keyframes oStick{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(14deg)}}' +
    '@keyframes oLift{0%,100%{transform:rotate(7deg)}50%{transform:rotate(-14deg)}}' +
    '@keyframes oBed{0%,55%{transform:rotate(0)}75%,85%{transform:rotate(-22deg)}100%{transform:rotate(0)}}' +
    '@keyframes oBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}' +
    '@keyframes oShake{0%{transform:translate(0,0)}25%{transform:translate(.7px,-.6px)}50%{transform:translate(-.6px,.4px)}75%{transform:translate(.5px,.6px)}100%{transform:translate(0,0)}}' +
    '@keyframes oSpin{to{transform:rotate(360deg)}}' +
    '@keyframes oBlade{0%,100%{transform:translateX(0)}50%{transform:translateX(2px)}}' +
    '@media (prefers-reduced-motion:reduce){.a-arm,.a-stick,.a-lift,.a-bed,.a-bob,.a-shake,.a-spin,.a-blade{animation:none!important}}';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function num(n, d) { return Number(n).toLocaleString('es-AR', { maximumFractionDigits: d == null ? 0 : d }); }
  function lts(n) { return num(n, 0) + ' L'; }
  function money(n) { return '$ ' + num(n, 0); }
  function fechaHora(fh) {
    try {
      var d = new Date(fh);
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' }) + ' ' +
        d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Argentina/Buenos_Aires' });
    } catch (e) { return String(fh || ''); }
  }

  /* ---------- Qué dibujo le toca a cada máquina ---------- */
  function tipoDibujo(m) {
    var t = (m.nombre + ' ' + (m.marca || '') + ' ' + (m.modelo || '')).toLowerCase();
    if (/excavad/.test(t)) return 'excavadora';
    if (/pala|cargadora|payloader/.test(t)) return 'pala';
    if (/motonivel|niveladora/.test(t)) return 'moto';
    if (/vibrador|dynamac|dynapac|rodillo|compactador/.test(t)) return 'rodillo';
    if (/tractor|deutz|zanello|chery|agro/.test(t)) return 'tractor';
    if (/camion|camión|mercedes|volcador|\b1634\b/.test(t)) return 'camion';
    if (/hilux|ranger|camioneta|pick|toyo|ford/.test(t)) return 'camioneta';
    return 'generico';
  }
  var Y = '#f2b705', Yd = '#c98f00', K = '#2b2f36', G = '#8a9099', GL = '#bfe3f2';
  function wheel(cx, cy, r, spin) {
    return '<g><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + K + '"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.45) + '" fill="#aeb4bd"/>' +
      (spin ? '<g class="a-spin"><rect x="' + (cx - 0.9) + '" y="' + (cy - r * 0.42) + '" width="1.8" height="' + (r * 0.84) + '" fill="' + K + '"/><rect x="' + (cx - r * 0.42) + '" y="' + (cy - 0.9) + '" width="' + (r * 0.84) + '" height="1.8" fill="' + K + '"/></g>' : '') + '</g>';
  }
  /* cada dibujo mide ~100×68 y apoya en y=66; trabaja = true agrega movimiento */
  function dibujo(tipo, w, col) {
    var c = col || Y, s = '';
    if (tipo === 'excavadora') {
      s += '<rect x="14" y="52" width="58" height="13" rx="6.5" fill="' + K + '"/><circle cx="22" cy="58.5" r="4" fill="#6b717b"/><circle cx="64" cy="58.5" r="4" fill="#6b717b"/>' +
        '<rect x="22" y="40" width="40" height="13" rx="3" fill="' + c + '"/><rect x="22" y="48" width="40" height="5" fill="' + Yd + '"/>' +
        '<path d="M26 40v-12h16l5 12z" fill="' + c + '"/><path d="M30 38v-8h10l3 8z" fill="' + GL + '"/><rect x="50" y="36" width="12" height="4" fill="' + K + '"/>' +
        '<g class="' + (w ? 'a-arm' : '') + '"><path d="M58 42 L78 22 L82 26 L63 47z" fill="' + c + '" stroke="' + Yd + '" stroke-width="1"/>' +
        '<g class="' + (w ? 'a-stick' : '') + '"><path d="M78 22 L92 40 L88 43 L75 26z" fill="' + c + '" stroke="' + Yd + '" stroke-width="1"/>' +
        '<path d="M88 40 L99 42 L96 52 L86 49z" fill="' + K + '"/></g></g>';
    } else if (tipo === 'pala') {
      s += wheel(30, 56, 10, w) + wheel(70, 56, 10, w) +
        '<rect x="14" y="38" width="42" height="14" rx="3" fill="' + c + '"/><rect x="50" y="44" width="30" height="8" rx="2" fill="' + c + '"/><rect x="14" y="48" width="66" height="4" fill="' + Yd + '"/>' +
        '<path d="M18 38v-14h20l4 14z" fill="' + c + '"/><path d="M22 36v-10h13l3 10z" fill="' + GL + '"/><rect x="16" y="22" width="24" height="3" fill="' + K + '"/>' +
        '<g class="' + (w ? 'a-lift' : '') + '"><path d="M62 46 L84 40 L84 45 L63 51z" fill="' + c + '" stroke="' + Yd + '" stroke-width="1"/><path d="M82 34 L98 36 L96 52 L84 52z" fill="' + K + '"/><path d="M84 38 L96 40 L94 50 L85 50z" fill="#555b66"/></g>';
    } else if (tipo === 'moto') {
      s += wheel(22, 56, 8, w) + wheel(36, 56, 8, w) + wheel(84, 56, 8, w) +
        '<rect x="12" y="38" width="38" height="12" rx="3" fill="' + c + '"/><rect x="48" y="42" width="40" height="5" fill="' + c + '"/><rect x="12" y="46" width="76" height="3" fill="' + Yd + '"/>' +
        '<path d="M14 38v-14h24l4 14z" fill="' + c + '"/><path d="M18 36v-10h16l3 10z" fill="' + GL + '"/><rect x="12" y="22" width="30" height="3" fill="' + K + '"/>' +
        '<g class="' + (w ? 'a-blade' : '') + '"><rect x="48" y="52" width="26" height="9" rx="2" fill="' + K + '"/><rect x="50" y="52" width="22" height="3" fill="#6b717b"/></g><rect x="84" y="46" width="3" height="8" fill="' + K + '"/>';
    } else if (tipo === 'camion') {
      s += wheel(24, 57, 8.5, w) + wheel(40, 57, 8.5, w) + wheel(82, 57, 8.5, w) +
        '<rect x="10" y="50" width="86" height="5" fill="' + K + '"/>' +
        '<g class="' + (w ? 'a-bed' : '') + '"><path d="M10 28h50v22H10z" fill="#d94a3d" stroke="#a8362c" stroke-width="1"/><rect x="10" y="44" width="50" height="6" fill="#a8362c"/></g>' +
        '<path d="M62 50V32l8-8h14l6 10v16z" fill="#f4f4f0" stroke="#c7c9cd" stroke-width="1"/><path d="M71 34l4-6h9l4 6z" fill="' + GL + '"/><rect x="90" y="44" width="6" height="4" fill="' + K + '"/>';
    } else if (tipo === 'camioneta') {
      s += wheel(26, 57, 8, w) + wheel(76, 57, 8, w) +
        '<path d="M8 52V40h34v12z" fill="#f4f4f0" stroke="#c7c9cd" stroke-width="1"/><path d="M42 52V32l8-9h16l12 11v18z" fill="#f4f4f0" stroke="#c7c9cd" stroke-width="1"/>' +
        '<path d="M52 33l6-8h8l8 8z" fill="' + GL + '"/><rect x="8" y="50" width="86" height="4" fill="' + K + '"/><rect x="86" y="42" width="6" height="4" fill="#ffd34d"/>';
    } else if (tipo === 'tractor') {
      s += wheel(32, 52, 14, w) + wheel(78, 58, 7.5, w) +
        '<rect x="42" y="40" width="42" height="14" rx="3" fill="#2f7d4f"/><rect x="82" y="44" width="10" height="8" fill="#256640"/><rect x="86" y="30" width="3" height="14" fill="' + K + '"/>' +
        '<path d="M20 40v-18h24v18z" fill="#2f7d4f"/><path d="M24 38v-14h16v14z" fill="' + GL + '"/><rect x="18" y="20" width="28" height="3" fill="' + K + '"/>';
    } else if (tipo === 'rodillo') {
      s += '<g class="' + (w ? 'a-shake' : '') + '">' +
        '<rect x="30" y="40" width="42" height="14" rx="3" fill="' + c + '"/><rect x="30" y="49" width="42" height="4" fill="' + Yd + '"/>' +
        '<path d="M64 40 L74 46 L74 52 L64 52z" fill="' + c + '"/>' +
        '<path d="M32 40v-15h22l3 15z" fill="' + c + '"/><path d="M36 38v-11h14l2 11z" fill="' + GL + '"/><rect x="30" y="22" width="28" height="3" fill="' + K + '"/>' +
        '<circle cx="82" cy="49" r="15" fill="#7f8792"/><circle cx="82" cy="49" r="15" fill="none" stroke="#5b616b" stroke-width="2"/><circle cx="82" cy="49" r="5.5" fill="#444a54"/><rect x="62" y="44" width="20" height="3.5" fill="' + K + '"/>' +
        '<circle cx="36" cy="54" r="12" fill="' + K + '"/><circle cx="36" cy="54" r="5" fill="#aeb4bd"/></g>';
    } else {
      s += wheel(28, 57, 8, w) + wheel(72, 57, 8, w) + '<rect x="14" y="36" width="68" height="20" rx="4" fill="' + c + '"/><rect x="22" y="28" width="26" height="10" fill="' + GL + '"/>';
    }
    return '<g class="' + (w ? 'a-bob' : '') + '">' + s + '</g>';
  }

  /* áreas de trabajo: mismos colores que los pisos de la oficina (azul, amarillo/beige, verde...) */
  var AREAS = [
    { piso: '#dbe3f3', borde: '#a9b8da', lado: '#8e9dc0', lado2: '#a3b2d4', acento: '#6c7cff', nombre: 'azul' },
    { piso: '#f3e4cf', borde: '#dbc19a', lado: '#bda47c', lado2: '#d2b98f', acento: '#e0a21a', nombre: 'amarillo' },
    { piso: '#d9efe4', borde: '#a3d1bb', lado: '#82b49b', lado2: '#98c8b0', acento: '#19b394', nombre: 'verde' },
    { piso: '#f6dcd5', borde: '#e0b0a4', lado: '#c48f82', lado2: '#d7a699', acento: '#ff6a4d', nombre: 'naranja' },
    { piso: '#e5def2', borde: '#bfb2dc', lado: '#a093c2', lado2: '#b5a8d3', acento: '#8a63d2', nombre: 'lila' }
  ];
  function mount(host, getD) {
    var root = host.shadowRoot || host;
    var wrap = document.createElement('div'); wrap.className = 'ob';
    var st = document.createElement('style'); st.textContent = CSS;
    wrap.appendChild(st);
    var bar = document.createElement('div'); bar.className = 'ob-bar'; wrap.appendChild(bar);
    var stage = document.createElement('div'); stage.className = 'ob-stage'; wrap.appendChild(stage);
    var panelEl = document.createElement('section'); panelEl.className = 'ob-panel'; panelEl.hidden = true; panelEl.setAttribute('aria-live', 'polite'); wrap.appendChild(panelEl);
    host.appendChild(wrap);
    var tip = null, pinned = null, drag = null;

    function datos() {
      var D = getD(), S = D.S;
      var obras = S.centros.filter(function (c) { return c.tipo === 'obra' && c.activo !== false && !c.fin; })
        .sort(function (a, b) { return String(a.codigo).localeCompare(String(b.codigo), 'es', { numeric: true }); });
      var maqs = S.centros.filter(function (c) { return c.tipo === 'maquina' && c.activo !== false; })
        .sort(function (a, b) { return String(a.codigo).localeCompare(String(b.codigo), 'es', { numeric: true }); });
      var ids = {}; obras.forEach(function (o) { ids[o.id] = true; });
      var plots = obras.map(function (o, i) { return { id: o.id, c: o, nombre: o.nombre, codigo: o.codigo, maqs: [], area: AREAS[i % AREAS.length] }; });
      var tray = { id: '', c: null, tray: true, nombre: 'Sin obra', codigo: 'DEP', maqs: [] };
      var byId = {}; plots.forEach(function (p) { byId[p.id] = p; }); byId[''] = tray;
      maqs.forEach(function (m) { (byId[m.obraActual && ids[m.obraActual] ? m.obraActual : ''] || tray).maqs.push(m); });
      return { D: D, S: S, plots: plots, tray: tray, byId: byId, maqs: maqs, puede: !!(D.maq && D.maq.puede) };
    }
    function maqObra(M, d) { return M.obraActual && d.byId[M.obraActual] && M.obraActual ? d.byId[M.obraActual] : null; }

    /* ---------- datos de combustible de una máquina ---------- */
    function stats(M, d) {
      var S = d.S, lim = Date.now() - 30 * 864e5;
      var cargas = (S.comb || []).filter(function (x) { return x.maqId === M.id; }).sort(function (a, b) { return String(b.fh).localeCompare(String(a.fh)); });
      var obra = maqObra(M, d);
      var r = { cargas: cargas, obra: obra, tot: 0, tot30: 0, gasto: 0, gasto30: 0, enObra: 0, conPrecio: 0, lPrecio: 0, porTipo: {}, u: cargas[0] };
      cargas.forEach(function (x) {
        var l = +x.litros || 0, p = +x.precio || 0, f = Date.parse(x.fh);
        r.tot += l; r.gasto += l * p; if (p > 0) { r.conPrecio += l * p; r.lPrecio += l; }
        if (f >= lim) { r.tot30 += l; r.gasto30 += l * p; }
        if (obra && x.obraId === obra.id) r.enObra += l;
        var t = COMB_T[x.tipo] || x.tipo || 'Sin tipo'; r.porTipo[t] = (r.porTipo[t] || 0) + l;
      });
      return r;
    }
    function obraCod(S, id) { return (S.centros.filter(function (c) { return c.id === id; })[0] || {}).codigo || '—'; }
    function fichaCorta(M, d) {
      var r = stats(M, d), h = '<h4>' + esc(M.codigo) + ' · ' + esc(M.nombre) + '</h4>';
      h += r.obra ? '<span class="st on">En obra ' + esc(r.obra.codigo) + ' · ' + esc(r.obra.nombre) + '</span>' : '<span class="st off">Sin obra (en la playa)</span>';
      if (!r.cargas.length) return h + '<div class="none">Sin cargas de combustible registradas.</div>';
      h += '<dl><dt>Litros últimos 30 días</dt><dd>' + lts(r.tot30) + '</dd><dt>Litros totales</dt><dd>' + lts(r.tot) + '</dd>' +
        '<dt>Última carga</dt><dd>' + esc(fechaHora(r.u.fh)) + '</dd></dl><div class="none" style="border:0;padding:6px 0 0">Tocá la máquina para ver toda la ficha abajo.</div>';
      return h;
    }
    function panelHTML(M, d) {
      var r = stats(M, d), S = d.S, u = r.u;
      var sub = [M.marca, M.modelo, M.anio ? M.anio : '', M.patente].filter(Boolean).join(' · ');
      var h = '<button type="button" class="x" aria-label="Cerrar">×</button>' +
        '<div class="pn-head"><div class="pn-ic"><svg viewBox="0 0 100 70" width="92" height="64">' + dibujo(tipoDibujo(M), !!r.obra) + '</svg></div><div><h3>' + esc(M.codigo) + ' · ' + esc(M.nombre) + '</h3>' +
        (sub ? '<div class="sub">' + esc(sub) + '</div>' : '<div class="sub">Sin marca ni modelo cargados</div>') +
        (r.obra ? '<span class="st on">En obra ' + esc(r.obra.codigo) + ' · ' + esc(r.obra.nombre) + '</span>' : '<span class="st off">Sin obra (en la playa)</span>') + '</div></div>';
      if (!r.cargas.length) {
        h += '<div class="pn-grid"><div class="none">Sin cargas de combustible registradas para esta máquina.</div>';
      } else {
        h += '<div class="pn-grid"><div><div class="sec">Combustible</div><dl>' +
          '<dt>Litros últimos 30 días</dt><dd>' + lts(r.tot30) + '</dd>' +
          '<dt>Gasto últimos 30 días</dt><dd>' + (r.gasto30 > 0 ? money(r.gasto30) : '—') + '</dd>' +
          '<dt>Litros totales</dt><dd>' + lts(r.tot) + '</dd>' +
          '<dt>Gasto total</dt><dd>' + (r.gasto > 0 ? money(r.gasto) : '—') + '</dd></dl></div>' +
          '<div><div class="sec">Detalle</div><dl>' +
          '<dt>Cargas registradas</dt><dd>' + r.cargas.length + '</dd>' +
          '<dt>Precio medio por litro</dt><dd>' + (r.lPrecio > 0 ? money(r.conPrecio / r.lPrecio) : '—') + '</dd>' +
          (r.obra ? '<dt>Litros cargados en esta obra</dt><dd>' + lts(r.enObra) + '</dd>' : '') + '</dl>';
        var tk = Object.keys(r.porTipo);
        if (tk.length) h += '<dl>' + tk.map(function (k) { return '<dt>' + esc(k) + '</dt><dd>' + lts(r.porTipo[k]) + '</dd>'; }).join('') + '</dl>';
        h += '</div><div><div class="sec">Última carga</div><dl><dt>' + esc(fechaHora(u.fh)) + '</dt><dd>' + lts(+u.litros) + '</dd>' +
          '<dt>' + esc(COMB_T[u.tipo] || u.tipo || 'Sin tipo') + '</dt><dd>' + (u.precio > 0 ? money(u.precio) + '/L' : '') + '</dd>' +
          (u.obraId ? '<dt>Obra</dt><dd>' + esc(obraCod(S, u.obraId)) + '</dd>' : '') + '</dl>';
      }
      h += '<div>';
      if (d.puede) {
        h += '<label for="ob-mv">Mover a</label><select id="ob-mv"><option value=""' + (!r.obra ? ' selected' : '') + '>Sin obra (playa)</option>' + d.plots.map(function (p) {
          return '<option value="' + esc(p.id) + '"' + (r.obra && r.obra.id === p.id ? ' selected' : '') + '>' + esc(p.codigo + ' · ' + p.nombre) + '</option>';
        }).join('') + '</select>';
      } else h += '<div class="none" style="border:0;padding:0">Solo el dueño y el ingeniero pueden mover máquinas.</div>';
      return h + '</div></div>';
    }
    function fichaObra(P, d) {
      var S = d.S, lim = Date.now() - 30 * 864e5, l30 = 0, lt = 0, g30 = 0;
      (S.comb || []).forEach(function (x) { if (x.obraId !== P.id) return; var l = +x.litros || 0; lt += l; if (Date.parse(x.fh) >= lim) { l30 += l; g30 += l * (+x.precio || 0); } });
      return '<h4>' + esc(P.codigo) + ' · ' + esc(P.nombre) + '</h4><div class="sub">' + P.maqs.length + ' máquina' + (P.maqs.length === 1 ? '' : 's') + ' en esta obra</div>' +
        '<dl><dt>Combustible últimos 30 días</dt><dd>' + lts(l30) + '</dd><dt>Gasto últimos 30 días</dt><dd>' + (g30 > 0 ? money(g30) : '—') + '</dd><dt>Combustible total cargado</dt><dd>' + lts(lt) + '</dd></dl>';
    }
    function showTip(html, ev) {
      hideTip();
      tip = document.createElement('div'); tip.className = 'ob-tip'; tip.setAttribute('role', 'tooltip'); tip.innerHTML = html;
      wrap.appendChild(tip); placeTip(ev);
    }
    function placeTip(ev) {
      if (!tip) return;
      var vw = window.innerWidth, vh = window.innerHeight, w = tip.offsetWidth, h = tip.offsetHeight;
      var x = ev.clientX + 16, y = ev.clientY + 12;
      if (x + w > vw - 8) x = ev.clientX - w - 16;
      if (x < 8) x = 8;
      if (y + h > vh - 8) y = Math.max(8, vh - h - 8);
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    }
    function hideTip() { if (tip) { tip.remove(); tip = null; } }

    /* ---------- escena ---------- */
    function pt(P, u, v) { return [P.x + (u - v) * TW / 2, P.y + (u + v) * TH / 2]; }
    function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
    function tree(x, y, k) {
      return '<g transform="translate(' + x + ',' + y + ') scale(' + (k || 1) + ')"><ellipse cx="0" cy="1" rx="7" ry="3" fill="rgba(0,0,0,.14)"/><rect x="-1.5" y="-8" width="3" height="9" fill="#7a5a3a"/><circle cx="0" cy="-15" r="9" fill="#4e9a5d"/><circle cx="-3" cy="-17" r="5" fill="#63b072"/></g>';
    }
    function maqSVG(m, c, working, sel) {
      var sc = 0.72, tipo = tipoDibujo(m);
      return '<g class="ob-m' + (sel ? ' sel' : '') + '" data-m="' + esc(m.id) + '" transform="translate(' + (c[0] - 50 * sc).toFixed(1) + ',' + (c[1] - 60 * sc).toFixed(1) + ') scale(' + sc + ')" tabindex="0" role="button" aria-label="' + esc(m.codigo + ' ' + m.nombre) + '">' +
        '<ellipse cx="50" cy="63" rx="40" ry="6" fill="rgba(0,0,0,.18)"/>' + dibujo(tipo, working) +
        '<rect class="ob-ring" x="2" y="14" width="96" height="56" rx="8"/>' +
        '<g transform="translate(50,76)"><rect x="-17" y="-9" width="34" height="14" rx="7" fill="#fff" opacity=".95"/><text x="0" y="1.5" text-anchor="middle" font-size="10" font-weight="700" fill="#1d2026" font-family="inherit">' + esc(m.codigo) + '</text></g></g>';
    }
    function plotSVG(P) {
      var n = P.maqs.length, side = P.side, h = '', A = P.area;
      var T = pt(P, 0, 0), R = pt(P, side, 0), B = pt(P, side, side), Lf = pt(P, 0, side);
      h += '<g class="ob-plot" data-plot="' + esc(P.id) + '">';
      h += '<polygon points="' + pts([Lf, B, [B[0], B[1] + SLAB], [Lf[0], Lf[1] + SLAB]]) + '" fill="' + A.lado + '"/>';
      h += '<polygon points="' + pts([B, R, [R[0], R[1] + SLAB], [B[0], B[1] + SLAB]]) + '" fill="' + A.lado2 + '"/>';
      h += '<polygon class="ob-top" points="' + pts([T, R, B, Lf]) + '" fill="' + A.piso + '" stroke="' + A.borde + '" stroke-width="1.5"/>';
      /* baldosas del piso, como en la oficina */
      for (var k = 1; k < side; k++) {
        h += '<polyline points="' + pts([pt(P, k, 0), pt(P, k, side)]) + '" fill="none" stroke="' + A.borde + '" stroke-width="1" opacity=".55"/>';
        h += '<polyline points="' + pts([pt(P, 0, k), pt(P, side, k)]) + '" fill="none" stroke="' + A.borde + '" stroke-width="1" opacity=".55"/>';
      }
      var tl = pt(P, 0.12, 0.12), tr = pt(P, side - 0.12, 0.12);
      h += '<g class="ob-deco">' + tree(tl[0] + 6, tl[1] + 8, 0.9) + tree(tr[0] - 6, tr[1] + 8, 0.8) + '</g>';
      var lb = pt(P, side / 2, side), lbl = (P.codigo + ' · ' + P.nombre).slice(0, 34);
      var wlab = Math.max(96, lbl.length * 6.6 + 34);
      h += '<g class="ob-lab" transform="translate(' + lb[0].toFixed(1) + ',' + (lb[1] + SLAB + 6) + ')"><rect x="' + (-wlab / 2) + '" y="0" width="' + wlab + '" height="22" rx="11" fill="#1d2026" stroke="' + A.acento + '" stroke-width="2"/><circle cx="' + (-wlab / 2 + 12) + '" cy="11" r="4.5" fill="' + A.acento + '"/><text x="3" y="15" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff" font-family="inherit">' + esc(lbl) + '</text><text x="' + (wlab / 2 - 12) + '" y="15" text-anchor="middle" font-size="10.5" font-weight="700" fill="#ffd34d" font-family="inherit">' + n + '</text></g>';
      var order = P.maqs.map(function (m, i) { return { m: m, col: i % side, row: Math.floor(i / side) }; })
        .sort(function (p, q) { return (p.col + p.row) - (q.col + q.row) || p.row - q.row; });
      order.forEach(function (o) { h += maqSVG(o.m, pt(P, o.col + 0.5, o.row + 0.5), true, pinned === o.m.id); });
      return h + '</g>';
    }
    var STEP = 92;
    function layout(d, maxW) {
      var rowX = 0, rowY = 0, rowH = 0, tw = 0;
      d.plots.forEach(function (P) {
        var n = Math.max(P.maqs.length, 1);
        P.side = Math.max(3, Math.ceil(Math.sqrt(n)));
        P.w = P.side * TW; P.h = TOP + P.side * TH + SLAB + LAB;
        if (rowX > 0 && rowX + P.w > maxW) { rowY += rowH + GAP; rowX = 0; rowH = 0; }
        P.x = rowX + P.w / 2; P.y = rowY + TOP; rowX += P.w + GAP; rowH = Math.max(rowH, P.h); tw = Math.max(tw, rowX - GAP);
      });
      var W = Math.max(tw, 760), T = d.tray, per = Math.max(1, Math.floor((W - 40) / STEP));
      T.per = per; T.rows = Math.max(1, Math.ceil(T.maqs.length / per));
      T.bx = 0; T.by = rowY + rowH + 26; T.bw = W; T.bh = 44 + T.rows * 80;
      return { w: W, h: T.by + T.bh + 8 };
    }
    function trayInner(T) {
      var h = '<g class="ob-tray" data-plot=""><rect class="ob-trayb" x="' + T.bx + '" y="' + T.by + '" width="' + T.bw + '" height="' + T.bh + '" rx="16" fill="#f7f6f1" stroke="#cfcbbd" stroke-width="2" stroke-dasharray="7 5"/>' +
        '<text x="' + (T.bx + 20) + '" y="' + (T.by + 27) + '" font-size="14" font-weight="700" fill="#4a5160" font-family="inherit">Playa de máquinas</text>' +
        '<text x="' + (T.bx + 170) + '" y="' + (T.by + 27) + '" font-size="12" fill="#7a8190" font-family="inherit">' + (T.maqs.length ? T.maqs.length + ' sin obra · arrastrá cada una al terreno de su obra' : 'Todas las máquinas están asignadas a una obra · arrastrá una acá para dejarla sin obra') + '</text>';
      T.maqs.forEach(function (m, i) {
        var col = i % T.per, row = Math.floor(i / T.per);
        h += maqSVG(m, [T.bx + 20 + STEP / 2 + col * STEP, T.by + 40 + row * 80 + 50], false, pinned === m.id);
      });
      return h + '</g>';
    }
    function render() {
      var d = datos();
      bar.innerHTML = '<p>' + (d.puede ? 'Arrastrá cada máquina desde la playa (abajo) al terreno de su obra, o de una obra a otra. Tocá una máquina para ver su ficha de combustible abajo.' : 'Tocá una máquina para ver su ficha de combustible abajo. Mover máquinas lo hace el dueño o el ingeniero.') + '</p>' +
        '<div class="ob-leg">' + d.plots.map(function (P) { return '<span><i style="background:' + P.area.acento + '"></i>' + esc(P.codigo) + '</span>'; }).join('') + '<span>' + d.maqs.length + ' máquinas · ' + d.plots.length + ' obras activas</span></div>';
      if (!d.maqs.length) { stage.innerHTML = '<div class="ob-empty">Todavía no hay máquinas cargadas. Se cargan en Centros de costo → Máquina.</div>'; panelEl.hidden = true; return; }
      if (!d.plots.length) { stage.innerHTML = '<div class="ob-empty">No hay obras activas. Cargá una obra en Centros de costo para armar su terreno.</div>'; panelEl.hidden = true; return; }
      var L = layout(d, 1500), pad = 30, vw = L.w + pad * 2;
      var h = '<svg xmlns="' + NS + '" viewBox="' + (-pad) + ' 0 ' + vw + ' ' + L.h + '" role="img" aria-label="Obras con su maquinaria">';
      d.plots.slice().sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (P) { h += plotSVG(P); });
      h += trayInner(d.tray) + '<g id="ob-top"></g></svg>';
      stage.innerHTML = h;
      stage.__d = d;
      var M = pinned && d.maqs.filter(function (m) { return m.id === pinned; })[0];
      if (M) { panelEl.hidden = false; panelEl.innerHTML = panelHTML(M, d); bindPanel(M); } else { pinned = null; panelEl.hidden = true; panelEl.innerHTML = ''; }
    }

    /* ---------- interacción ---------- */
    var svgPt = function (svg, ev) { var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    function plotAt(d, x, y) {
      for (var i = 0; i < d.plots.length; i++) {
        var P = d.plots[i], cx = P.x, cy = P.y + P.side * TH / 2, a = P.side * TW / 2, b = P.side * TH / 2;
        if (Math.abs(x - cx) / a + Math.abs(y - cy) / b <= 1.02) return P;
      }
      var T = d.tray;
      if (x >= T.bx && x <= T.bx + T.bw && y >= T.by - 20 && y <= T.by + T.bh) return T;
      return null;
    }
    function bindPanel(M) {
      var x = panelEl.querySelector('.x'); if (x) x.onclick = function () { pinned = null; render(); };
      var sel = panelEl.querySelector('#ob-mv');
      if (sel) sel.onchange = function () { var d = stage.__d; if (d.D.maq.mover(M.id, sel.value)) render(); };
    }
    function abrir(mid, scroll) {
      pinned = mid; hideTip(); render();
      if (scroll && panelEl.scrollIntoView) { try { panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { } }
    }
    stage.addEventListener('pointerover', function (ev) {
      if (drag) return;
      var d = stage.__d; if (!d) return;
      var g = ev.target.closest && ev.target.closest('.ob-m');
      if (g) { var M = d.maqs.filter(function (m) { return m.id === g.dataset.m; })[0]; if (M && pinned !== M.id) showTip(fichaCorta(M, d), ev); return; }
      var lab = ev.target.closest && ev.target.closest('.ob-lab');
      if (lab) { var pid = lab.parentNode.dataset.plot; if (d.byId[pid]) showTip(fichaObra(d.byId[pid], d), ev); }
    });
    stage.addEventListener('pointermove', function (ev) {
      if (drag) {
        var dx = ev.clientX - drag.x0, dy = ev.clientY - drag.y0;
        if (!drag.moved && Math.hypot(dx, dy) < 6) return;
        var d = stage.__d;
        if (!drag.moved) {
          if (!d.puede) return;
          drag.moved = true; drag.g.classList.add('drag'); hideTip();
          drag.svg.querySelector('#ob-top').appendChild(drag.g);
        }
        var p = svgPt(drag.svg, ev);
        drag.g.setAttribute('transform', drag.tr.replace(/translate\(([-\d.]+),([-\d.]+)\)/, function (_, a, b) { return 'translate(' + (+a + p.x - drag.p0.x).toFixed(1) + ',' + (+b + p.y - drag.p0.y).toFixed(1) + ')'; }));
        var P = plotAt(d, p.x, p.y);
        stage.querySelectorAll('.ob-top').forEach(function (t) { t.setAttribute('stroke-width', '1.5'); t.style.filter = ''; });
        var tb = stage.querySelector('.ob-trayb'); if (tb) tb.setAttribute('stroke', '#cfcbbd');
        if (P && !P.tray) { var t = stage.querySelector('.ob-plot[data-plot="' + (window.CSS && CSS.escape ? CSS.escape(P.id) : P.id) + '"] .ob-top'); if (t) { t.setAttribute('stroke-width', '4'); t.style.filter = 'brightness(1.06)'; } }
        if (P && P.tray && tb) tb.setAttribute('stroke', '#e31b1f');
        drag.to = P;
        return;
      }
      if (tip) {
        var ok = ev.target.closest && (ev.target.closest('.ob-m') || ev.target.closest('.ob-lab'));
        if (!ok) hideTip(); else placeTip(ev);
      }
    });
    stage.addEventListener('pointerleave', function () { if (!drag) hideTip(); });
    stage.addEventListener('keydown', function (ev) {
      var g = ev.target.closest && ev.target.closest('.ob-m');
      if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); abrir(g.dataset.m, true); }
    });
    stage.addEventListener('pointerdown', function (ev) {
      if (ev.button > 0) return;
      var g = ev.target.closest && ev.target.closest('.ob-m'); if (!g) return;
      var svg = stage.querySelector('svg');
      drag = { g: g, mid: g.dataset.m, x0: ev.clientX, y0: ev.clientY, moved: false, p0: svgPt(svg, ev), tr: g.getAttribute('transform'), svg: svg, to: null };
      try { g.setPointerCapture(ev.pointerId); } catch (e) { }
      hideTip();
    });
    function fin(ev) {
      if (!drag) return;
      var D0 = drag, d = stage.__d; drag = null;
      try { D0.g.releasePointerCapture(ev.pointerId); } catch (e) { }
      if (!D0.moved) { abrir(D0.mid, true); return; }
      var M = d.maqs.filter(function (m) { return m.id === D0.mid; })[0], to = D0.to;
      if (M && to && (M.obraActual || '') !== to.id) { d.D.maq.mover(M.id, to.id); pinned = M.id; }
      render();
    }
    stage.addEventListener('pointerup', fin);
    stage.addEventListener('pointercancel', fin);

    render();
    return { refresh: function () { if (!drag) render(); } };
  }
  window.OFICINA_OBRAS = { montar: mount };
})();
