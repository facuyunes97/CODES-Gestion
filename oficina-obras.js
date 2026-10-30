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
    '.ob-ring{fill:none;stroke:#e31b1f;stroke-width:2;opacity:0;stroke-dasharray:4 3}' +
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
    if (/hilux|ranger|camioneta|pick|toyo|ford/.test(t)) return 'camioneta';
    if (/camion|camión|mercedes|volcador|\b1634\b/.test(t)) return 'camion';
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
      s += '<g class="' + (w ? 'a-shake' : '') + '"><circle cx="24" cy="52" r="14" fill="#7f8792"/><circle cx="24" cy="52" r="5" fill="#5b616b"/><circle cx="78" cy="53" r="12" fill="#7f8792"/><circle cx="78" cy="53" r="4.5" fill="#5b616b"/>' +
        '<rect x="22" y="36" width="58" height="16" rx="4" fill="' + c + '"/><rect x="22" y="46" width="58" height="4" fill="' + Yd + '"/><path d="M50 36v-12h18v12z" fill="' + GL + '"/><rect x="48" y="22" width="22" height="3" fill="' + K + '"/></g>';
    } else {
      s += wheel(28, 57, 8, w) + wheel(72, 57, 8, w) + '<rect x="14" y="36" width="68" height="20" rx="4" fill="' + c + '"/><rect x="22" y="28" width="26" height="10" fill="' + GL + '"/>';
    }
    return '<g class="' + (w ? 'a-bob' : '') + '">' + s + '</g>';
  }

  function mount(host, getD) {
    var root = host.shadowRoot || host;
    var wrap = document.createElement('div'); wrap.className = 'ob';
    var st = document.createElement('style'); st.textContent = CSS;
    wrap.appendChild(st);
    var bar = document.createElement('div'); bar.className = 'ob-bar'; wrap.appendChild(bar);
    var stage = document.createElement('div'); stage.className = 'ob-stage'; wrap.appendChild(stage);
    host.appendChild(wrap);
    var tip = null, pinned = null, drag = null;

    function datos() {
      var D = getD(), S = D.S;
      var obras = S.centros.filter(function (c) { return c.tipo === 'obra' && c.activo !== false && !c.fin; })
        .sort(function (a, b) { return String(a.codigo).localeCompare(String(b.codigo), 'es', { numeric: true }); });
      var maqs = S.centros.filter(function (c) { return c.tipo === 'maquina' && c.activo !== false; })
        .sort(function (a, b) { return String(a.codigo).localeCompare(String(b.codigo), 'es', { numeric: true }); });
      var ids = {}; obras.forEach(function (o) { ids[o.id] = true; });
      var plots = [{ id: '', c: null, nombre: 'Depósito / taller', codigo: 'DEP', maqs: [] }];
      obras.forEach(function (o) { plots.push({ id: o.id, c: o, nombre: o.nombre, codigo: o.codigo, maqs: [] }); });
      var byId = {}; plots.forEach(function (p) { byId[p.id] = p; });
      maqs.forEach(function (m) { (byId[m.obraActual && ids[m.obraActual] ? m.obraActual : ''] || plots[0]).maqs.push(m); });
      return { D: D, S: S, plots: plots, byId: byId, maqs: maqs, puede: !!(D.maq && D.maq.puede) };
    }

    /* ---------- fichas de combustible ---------- */
    function ficha(M, d, pin) {
      var S = d.S, hoy = new Date(), lim = hoy.getTime() - 30 * 864e5;
      var cargas = (S.comb || []).filter(function (x) { return x.maqId === M.id; }).sort(function (a, b) { return String(b.fh).localeCompare(String(a.fh)); });
      var obra = M.obraActual && d.byId[M.obraActual] && M.obraActual ? d.byId[M.obraActual] : null;
      var tot = 0, tot30 = 0, gasto = 0, gasto30 = 0, enObra = 0, conPrecio = 0, lPrecio = 0, porTipo = {};
      cargas.forEach(function (x) {
        var l = +x.litros || 0, p = +x.precio || 0, f = Date.parse(x.fh);
        tot += l; gasto += l * p; if (p > 0) { conPrecio += l * p; lPrecio += l; }
        if (f >= lim) { tot30 += l; gasto30 += l * p; }
        if (obra && x.obraId === obra.id) enObra += l;
        var t = COMB_T[x.tipo] || x.tipo || 'Sin tipo'; porTipo[t] = (porTipo[t] || 0) + l;
      });
      var u = cargas[0], h = '';
      h += '<h4>' + esc(M.codigo) + ' · ' + esc(M.nombre) + '</h4>';
      var sub = [M.marca, M.modelo, M.anio ? M.anio : '', M.patente].filter(Boolean).join(' · ');
      if (sub) h += '<div class="sub">' + esc(sub) + '</div>';
      h += obra ? '<span class="st on">En obra ' + esc(obra.codigo) + ' · ' + esc(obra.nombre) + '</span>' : '<span class="st off">En depósito</span>';
      if (!cargas.length) {
        h += '<div class="none">Sin cargas de combustible registradas.</div>';
      } else {
        h += '<dl>' +
          '<dt>Litros últimos 30 días</dt><dd>' + lts(tot30) + '</dd>' +
          '<dt>Gasto últimos 30 días</dt><dd>' + (gasto30 > 0 ? money(gasto30) : '—') + '</dd>' +
          '<dt>Litros totales</dt><dd>' + lts(tot) + '</dd>' +
          '<dt>Gasto total</dt><dd>' + (gasto > 0 ? money(gasto) : '—') + '</dd>' +
          '<dt>Cargas registradas</dt><dd>' + cargas.length + '</dd>' +
          '<dt>Precio medio por litro</dt><dd>' + (lPrecio > 0 ? money(conPrecio / lPrecio) : '—') + '</dd>' +
          (obra ? '<dt>Litros cargados en esta obra</dt><dd>' + lts(enObra) + '</dd>' : '') + '</dl>';
        h += '<div class="sec">Última carga</div><dl style="border:0;margin-top:4px;padding-top:0"><dt>' + esc(fechaHora(u.fh)) + '</dt><dd>' + lts(+u.litros) + '</dd>' +
          '<dt>' + esc(COMB_T[u.tipo] || u.tipo || 'Sin tipo') + '</dt><dd>' + (u.precio > 0 ? money(u.precio) + '/L' : '') + '</dd>' +
          (u.obraId && d.S.centros ? '<dt>Obra</dt><dd>' + esc((S.centros.filter(function (c) { return c.id === u.obraId; })[0] || {}).codigo || '—') + '</dd>' : '') + '</dl>';
        var tk = Object.keys(porTipo);
        if (tk.length > 1) h += '<div class="sec">Por tipo de combustible</div><dl style="border:0;margin-top:4px;padding-top:0">' + tk.map(function (k) { return '<dt>' + esc(k) + '</dt><dd>' + lts(porTipo[k]) + '</dd>'; }).join('') + '</dl>';
      }
      if (pin) {
        if (d.puede) {
          h += '<label for="ob-mv">Mover a</label><select id="ob-mv">' + d.plots.map(function (p) {
            return '<option value="' + esc(p.id) + '"' + ((M.obraActual || '') === p.id || (!M.obraActual && !p.id) || (M.obraActual && !d.byId[M.obraActual] && !p.id) ? ' selected' : '') + '>' + esc(p.c ? p.codigo + ' · ' + p.nombre : p.nombre) + '</option>';
          }).join('') + '</select>';
        } else h += '<div class="none">Solo el dueño y el ingeniero pueden mover máquinas.</div>';
        h += '<button type="button" class="x" aria-label="Cerrar">×</button>';
      }
      return h;
    }
    function fichaObra(P, d) {
      var S = d.S, lim = Date.now() - 30 * 864e5, l30 = 0, lt = 0, g30 = 0;
      if (P.c) (S.comb || []).forEach(function (x) { if (x.obraId !== P.id) return; var l = +x.litros || 0; lt += l; if (Date.parse(x.fh) >= lim) { l30 += l; g30 += l * (+x.precio || 0); } });
      var h = '<h4>' + esc(P.codigo) + ' · ' + esc(P.nombre) + '</h4><div class="sub">' + P.maqs.length + ' máquina' + (P.maqs.length === 1 ? '' : 's') + (P.c ? ' en esta obra' : ' sin obra') + '</div>';
      if (P.c) h += '<dl><dt>Combustible últimos 30 días</dt><dd>' + lts(l30) + '</dd><dt>Gasto últimos 30 días</dt><dd>' + (g30 > 0 ? money(g30) : '—') + '</dd><dt>Combustible total cargado</dt><dd>' + lts(lt) + '</dd></dl>';
      return h;
    }
    function showTip(html, ev, pin) {
      hideTip(true);
      tip = document.createElement('div'); tip.className = 'ob-tip' + (pin ? ' pin' : ''); tip.setAttribute('role', pin ? 'dialog' : 'tooltip'); tip.innerHTML = html;
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
    function hideTip(force) { if (tip && (force || !pinned)) { tip.remove(); tip = null; } }

    /* ---------- escena ---------- */
    function pt(P, u, v) { return [P.x + (u - v) * TW / 2, P.y + (u + v) * TH / 2]; }
    function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
    function tree(x, y, k) {
      return '<g transform="translate(' + x + ',' + y + ') scale(' + (k || 1) + ')"><ellipse cx="0" cy="1" rx="7" ry="3" fill="rgba(0,0,0,.14)"/><rect x="-1.5" y="-8" width="3" height="9" fill="#7a5a3a"/><circle cx="0" cy="-15" r="9" fill="#4e9a5d"/><circle cx="-3" cy="-17" r="5" fill="#63b072"/></g>';
    }
    function plotSVG(P, d, sizes) {
      var n = P.maqs.length, side = P.side, h = '';
      var T = pt(P, 0, 0), R = pt(P, side, 0), B = pt(P, side, side), Lf = pt(P, 0, side);
      var dep = !P.c;
      h += '<g class="ob-plot" data-plot="' + esc(P.id) + '">';
      h += '<polygon points="' + pts([Lf, B, [B[0], B[1] + SLAB], [Lf[0], Lf[1] + SLAB]]) + '" fill="#8d7556"/>';
      h += '<polygon points="' + pts([B, R, [R[0], R[1] + SLAB], [B[0], B[1] + SLAB]]) + '" fill="#a98d6a"/>';
      h += '<polygon class="ob-top" points="' + pts([T, R, B, Lf]) + '" fill="' + (dep ? '#d9d5c9' : '#cdb48d') + '" stroke="' + (dep ? '#bdb8aa' : '#b79d74') + '" stroke-width="1.5"/>';
      /* franja de pasto */
      var a = 0.18;
      h += '<polygon points="' + pts([pt(P, a, a), pt(P, side - a, a), pt(P, side - a, side - a), pt(P, a, side - a)]) + '" fill="' + (dep ? '#e5e2d8' : '#d8c19c') + '" opacity=".85"/>';
      /* rayas de zanja/obra */
      if (!dep) {
        for (var k = 1; k < side; k++) h += '<polyline points="' + pts([pt(P, k, 0.3), pt(P, k, side - 0.3)]) + '" fill="none" stroke="#c0a67c" stroke-width="1" opacity=".7"/>';
      } else {
        h += '<polyline points="' + pts([pt(P, 0.35, 0.35), pt(P, side - 0.35, 0.35), pt(P, side - 0.35, side - 0.35), pt(P, 0.35, side - 0.35), pt(P, 0.35, 0.35)]) + '" fill="none" stroke="#bdb8aa" stroke-width="1.5" stroke-dasharray="5 4"/>';
      }
      /* árboles y cartel */
      var tl = pt(P, 0.12, 0.12), tr = pt(P, side - 0.12, 0.12);
      h += '<g class="ob-deco">' + tree(tl[0] + 6, tl[1] + 8, 0.9) + tree(tr[0] - 6, tr[1] + 8, 0.8) + '</g>';
      /* etiqueta */
      var lb = pt(P, side / 2, side); var lbl = (P.codigo + (P.c ? ' · ' + P.nombre : ' · Sin obra')).slice(0, 34);
      var wlab = Math.max(80, lbl.length * 6.6 + 22);
      h += '<g class="ob-lab" transform="translate(' + (lb[0] + 0).toFixed(1) + ',' + (lb[1] + SLAB + 6) + ')"><rect x="' + (-wlab / 2) + '" y="0" width="' + wlab + '" height="21" rx="10.5" fill="' + (dep ? '#59606c' : '#1d2026') + '"/><text x="0" y="14.5" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff" font-family="inherit">' + esc(lbl) + '</text><text x="' + (wlab / 2 - 11) + '" y="14.5" text-anchor="middle" font-size="10" font-weight="700" fill="#ffd34d" font-family="inherit">' + n + '</text></g>';
      /* máquinas, de atrás hacia adelante */
      var order = P.maqs.map(function (m, i) { var col = i % side, row = Math.floor(i / side); return { m: m, col: col, row: row }; })
        .sort(function (p, q) { return (p.col + p.row) - (q.col + q.row) || p.row - q.row; });
      order.forEach(function (o) {
        var c = pt(P, o.col + 0.5, o.row + 0.5), sc = 0.72, tipo = tipoDibujo(o.m);
        h += '<g class="ob-m" data-m="' + esc(o.m.id) + '" data-x="' + c[0].toFixed(1) + '" data-y="' + c[1].toFixed(1) + '" transform="translate(' + (c[0] - 50 * sc).toFixed(1) + ',' + (c[1] - 60 * sc).toFixed(1) + ') scale(' + sc + ')" tabindex="0" role="button" aria-label="' + esc(o.m.codigo + ' ' + o.m.nombre) + '">' +
          '<ellipse cx="50" cy="63" rx="40" ry="6" fill="rgba(0,0,0,.18)"/>' + dibujo(tipo, !dep) +
          '<rect class="ob-ring" x="2" y="14" width="96" height="56" rx="8"/>' +
          '<g transform="translate(50,76)"><rect x="-16" y="-9" width="32" height="14" rx="7" fill="#fff" opacity=".92"/><text x="0" y="1.5" text-anchor="middle" font-size="10" font-weight="700" fill="#1d2026" font-family="inherit">' + esc(o.m.codigo) + '</text></g></g>';
      });
      return h + '</g>';
    }
    function layout(d, maxW) {
      var rowX = 0, rowY = 0, rowH = 0, tw = 0;
      d.plots.forEach(function (P) {
        var n = Math.max(P.maqs.length, 1);
        P.side = Math.max(3, Math.ceil(Math.sqrt(n)) + (n > 4 ? 0 : 0));
        if (P.maqs.length > P.side * P.side) P.side++;
        P.w = P.side * TW; P.h = TOP + P.side * TH + SLAB + LAB;
        if (rowX > 0 && rowX + P.w > maxW) { rowY += rowH + GAP; rowX = 0; rowH = 0; }
        P.x = rowX + P.w / 2; P.y = rowY + TOP; rowX += P.w + GAP; rowH = Math.max(rowH, P.h); tw = Math.max(tw, rowX - GAP);
      });
      return { w: Math.max(tw, 400), h: rowY + rowH + 10 };
    }
    function render() {
      var d = datos();
      var dep0 = d.plots[0];
      bar.innerHTML = '<p>' + (d.puede ? 'Arrastrá una máquina al terreno de otra obra para moverla. Pasá el mouse (o tocala) para ver su ficha de combustible.' : 'Pasá el mouse (o tocá una máquina) para ver su ficha de combustible. Mover máquinas lo hace el dueño o el ingeniero.') + '</p>' +
        '<div class="ob-leg"><span><i style="background:#cdb48d"></i>Obra (trabajando)</span><span><i style="background:#d9d5c9"></i>Depósito (paradas)</span><span>' + d.maqs.length + ' máquinas · ' + (d.plots.length - 1) + ' obras activas</span></div>';
      if (!d.maqs.length) { stage.innerHTML = '<div class="ob-empty">Todavía no hay máquinas cargadas. Se cargan en Centros de costo → Máquina.</div>'; return; }
      var maxW = 1500, L = layout(d, maxW);
      var pad = 30, vw = L.w + pad * 2, vh = L.h + 10;
      var h = '<svg xmlns="' + NS + '" viewBox="' + (-pad) + ' 0 ' + vw + ' ' + vh + '" role="img" aria-label="Obras con su maquinaria">';
      /* los terrenos más al fondo primero */
      d.plots.slice().sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (P) { h += plotSVG(P, d); });
      h += '<g id="ob-top"></g></svg>';
      stage.innerHTML = h;
      stage.__d = d;
      if (pinned) { var M = d.maqs.filter(function (m) { return m.id === pinned; })[0]; if (M) { showTip(ficha(M, d, true), { clientX: stage.getBoundingClientRect().left + 20, clientY: stage.getBoundingClientRect().top + 20 }, true); bindPin(M); } else pinned = null; }
    }

    /* ---------- interacción ---------- */
    var svgPt = function (svg, ev) { var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    function plotAt(d, x, y) {
      for (var i = 0; i < d.plots.length; i++) {
        var P = d.plots[i], cx = P.x, cy = P.y + P.side * TH / 2, a = P.side * TW / 2, b = P.side * TH / 2;
        if (Math.abs(x - cx) / a + Math.abs(y - cy) / b <= 1.02) return P;
      }
      return null;
    }
    function bindPin(M) {
      if (!tip) return;
      var x = tip.querySelector('.x'); if (x) x.onclick = function () { pinned = null; hideTip(true); };
      var sel = tip.querySelector('#ob-mv');
      if (sel) sel.onchange = function () { var d = stage.__d; if (d.D.maq.mover(M.id, sel.value)) { pinned = M.id; render(); } };
    }
    stage.addEventListener('pointerover', function (ev) {
      if (drag || pinned) return;
      var d = stage.__d; if (!d) return;
      var g = ev.target.closest && ev.target.closest('.ob-m');
      if (g) { var M = d.maqs.filter(function (m) { return m.id === g.dataset.m; })[0]; if (M) showTip(ficha(M, d, false), ev, false); return; }
      var lab = ev.target.closest && ev.target.closest('.ob-lab');
      if (lab) { var pid = lab.parentNode.dataset.plot; showTip(fichaObra(d.byId[pid], d), ev, false); }
    });
    stage.addEventListener('pointermove', function (ev) {
      if (drag) return;
      if (tip && !pinned) {
        var ok = ev.target.closest && (ev.target.closest('.ob-m') || ev.target.closest('.ob-lab'));
        if (!ok) hideTip(); else placeTip(ev);
      }
    });
    stage.addEventListener('pointerleave', function () { if (!drag) hideTip(); });
    stage.addEventListener('keydown', function (ev) {
      var g = ev.target.closest && ev.target.closest('.ob-m');
      if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); openPin(g.dataset.m, g.getBoundingClientRect()); }
    });
    function openPin(mid, rect) {
      var d = stage.__d, M = d.maqs.filter(function (m) { return m.id === mid; })[0]; if (!M) return;
      pinned = mid; showTip(ficha(M, d, true), { clientX: rect.right, clientY: rect.top }, true); bindPin(M);
    }
    stage.addEventListener('pointerdown', function (ev) {
      if (ev.button > 0) return;
      var g = ev.target.closest && ev.target.closest('.ob-m'); if (!g) return;
      var svg = stage.querySelector('svg'), d = stage.__d;
      drag = { g: g, mid: g.dataset.m, x0: ev.clientX, y0: ev.clientY, moved: false, p0: svgPt(svg, ev), tr: g.getAttribute('transform'), svg: svg, to: null };
      try { g.setPointerCapture(ev.pointerId); } catch (e) { }
      hideTip(true);
    });
    stage.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var dx = ev.clientX - drag.x0, dy = ev.clientY - drag.y0;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      var d = stage.__d;
      if (!drag.moved) {
        if (!d.puede) return;
        drag.moved = true; drag.g.classList.add('drag');
        var top = drag.svg.querySelector('#ob-top'); top.appendChild(drag.g);
      }
      var p = svgPt(drag.svg, ev);
      drag.g.setAttribute('transform', drag.tr.replace(/translate\(([-\d.]+),([-\d.]+)\)/, function (_, a, b) { return 'translate(' + (+a + p.x - drag.p0.x).toFixed(1) + ',' + (+b + p.y - drag.p0.y).toFixed(1) + ')'; }));
      var P = plotAt(d, p.x, p.y);
      stage.querySelectorAll('.ob-top').forEach(function (t) { t.setAttribute('stroke-width', '1.5'); t.style.filter = ''; });
      if (P) { var t = stage.querySelector('.ob-plot[data-plot="' + (window.CSS && CSS.escape ? CSS.escape(P.id) : P.id) + '"] .ob-top'); if (t) { t.setAttribute('stroke-width', '3'); t.style.filter = 'brightness(1.08)'; } }
      drag.to = P;
    });
    function fin(ev) {
      if (!drag) return;
      var D0 = drag, d = stage.__d; drag = null;
      try { D0.g.releasePointerCapture(ev.pointerId); } catch (e) { }
      if (!D0.moved) { render(); openPin(D0.mid, D0.g.getBoundingClientRect ? D0.g.getBoundingClientRect() : { right: ev.clientX, top: ev.clientY }); return; }
      var M = d.maqs.filter(function (m) { return m.id === D0.mid; })[0], to = D0.to;
      if (M && to && (M.obraActual || '') !== to.id) d.D.maq.mover(M.id, to.id);
      render();
    }
    stage.addEventListener('pointerup', fin);
    stage.addEventListener('pointercancel', fin);
    document.addEventListener('pointerdown', function (ev) {
      if (!pinned) return;
      var path = ev.composedPath ? ev.composedPath() : [];
      if (tip && path.indexOf(tip) >= 0) return;
      if (path.some(function (n) { return n.classList && n.classList.contains('ob-m'); })) return;
      pinned = null; hideTip(true);
    });

    render();
    return { refresh: function () { if (!drag) render(); } };
  }
  window.OFICINA_OBRAS = { montar: mount };
})();
