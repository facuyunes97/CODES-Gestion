/* Oficina · Obras y máquinas: terrenos (obras) en isométrico con la maquinaria trabajando.
   Cada terreno tiene su obra en marcha: las retros cavan pozos y cargan los camiones, las palas mueven tierra,
   las motoniveladoras nivelan y los compactadores pasan el rodillo (todo ilustrativo).
   Se arrastra una máquina de una obra a otra; al tocarla se abre su ficha de combustible y su aspecto (color / forma).
   Sin librerías: SVG puro. Lo monta oficina.js dentro de su shadow DOM. */
(function () {
  'use strict';
  var TW = 136, TH = 68, HX = TW / 2, HY = TH / 2, SLAB = 14, TOP = 52, LAB = 36, GAP = 30;
  var NS = 'http://www.w3.org/2000/svg';
  var COMB_T = { nafta: 'Nafta', diesel_500: 'Diésel 500', diesel_premium: 'Diésel Premium' };
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var CSS = '' +
    '.ob{position:relative;font-family:var(--o-body,system-ui,sans-serif);color:var(--o-fg,#1d2026)}' +
    '.ob-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin:0 0 10px}' +
    '.ob-bar p{margin:0;font-size:13px;color:var(--o-muted,#666c76);max-width:62ch}' +
    '.ob-leg{display:flex;gap:12px;font-size:12px;color:var(--o-muted,#666c76);flex-wrap:wrap;align-items:center}' +
    '.ob-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}' +
    '.ob-hid{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 10px;font-size:12.5px;color:var(--o-muted,#666c76)}' +
    '.ob-hid button{font:inherit;font-size:12px;font-weight:600;padding:4px 10px;border-radius:99px;border:1px solid var(--o-line,#c9ced6);background:var(--o-surface,#fff);color:var(--o-fg,#1d2026);cursor:pointer}' +
    '.ob-hid button:hover{border-color:#e31b1f}.ob-hid button:disabled{cursor:default;opacity:.7}' +
    '.ob-stage{position:relative;border-radius:14px;background:var(--o-stage,#e3e6ea);border:1px solid var(--o-line,#d9dce1);overflow:hidden;touch-action:pan-y}' +
    '.ob-stage svg{display:block;width:100%;height:auto;user-select:none;-webkit-user-select:none}' +
    '.ob-stage.gl{height:clamp(600px,84vh,960px);touch-action:none;background:var(--o-stage,#e3e6ea)}.ob-stage canvas{display:block;width:100%;height:100%}' +
    '.ob-ov{position:absolute;inset:0;pointer-events:none;overflow:hidden}' +
    '.ob-cd{position:absolute;left:0;top:0;background:rgba(18,21,28,.88);color:#fff;font:700 11px/1 var(--o-body,system-ui);padding:4px 8px;border-radius:99px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.25);will-change:transform}' +
    '.ob-pl{position:absolute;left:0;top:0;display:flex;align-items:center;gap:6px;background:rgba(18,21,28,.8);color:#fff;border:1.5px solid var(--ac,#9aa0ab);border-radius:9px;padding:3px 5px 3px 8px;font:700 11px/1 var(--o-body,system-ui);white-space:nowrap;pointer-events:auto;box-shadow:0 3px 10px rgba(0,0,0,.22);will-change:transform}' +
    '.ob-pl:not(.ob-pl-tray)::after{content:"";position:absolute;left:50%;top:100%;width:2px;height:44px;margin-left:-1px;background:var(--ac,#9aa0ab);opacity:.9}' +
    '.ob-pl:not(.ob-pl-tray)::before{content:"";position:absolute;left:50%;top:calc(100% + 40px);width:8px;height:8px;margin-left:-4px;border-radius:50%;background:var(--ac,#9aa0ab);box-shadow:0 0 0 2px rgba(18,21,28,.8)}' +
    '.ob-pl i{width:7px;height:7px;border-radius:50%}.ob-pl em{font-style:normal;color:#ffd34d}' +
    '.ob-pl .x{all:unset;cursor:pointer;width:16px;height:16px;border-radius:50%;background:#3a3f4a;text-align:center;line-height:16px;font-size:12px}.ob-pl .x:hover{background:#e31b1f}' +
    '.ob-pl-tray{border-style:dashed;pointer-events:none}' +
    '.ob-zoom{position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:6px;z-index:3}' +
    '.ob-zoom button{width:34px;height:34px;border-radius:9px;border:1px solid rgba(0,0,0,.15);background:rgba(255,255,255,.92);font:700 18px/1 system-ui;cursor:pointer;color:#1d2026}.ob-zoom button:hover{background:#fff;border-color:#e31b1f}' +
    '.ob-bay{position:absolute;left:10px;bottom:10px;z-index:3;max-width:min(300px,60%);background:rgba(255,255,255,.94);border:1px solid rgba(0,0,0,.14);border-radius:12px;padding:7px 9px;box-shadow:0 4px 14px rgba(0,0,0,.14);font:600 12px var(--o-body,system-ui);color:#1d2026}' +
    '.ob-bay.hot{border-color:#e31b1f;box-shadow:0 0 0 2px #e31b1f}.ob-bay .bt{display:flex;gap:6px;align-items:center;margin-bottom:5px}.ob-bay .bt em{font-style:normal;background:#eceef2;border-radius:99px;padding:1px 7px}' +
    '.ob-bay .bl{display:flex;flex-wrap:wrap;gap:5px}.ob-bay .bc{all:unset;cursor:grab;display:inline-flex;align-items:center;gap:5px;padding:4px 8px;border-radius:99px;border:1px solid #c9ced6;background:#fff;font:700 12px var(--o-body,system-ui);touch-action:none}.ob-bay .bc:hover{border-color:#e31b1f}' +
    '.ob-bay .bc i{width:9px;height:9px;border-radius:50%;border:1px solid rgba(0,0,0,.25)}.ob-bay .bh{margin-top:5px;font-weight:500;color:#666c76}' +
    '.pl-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.pl-it{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:12px;border:1.5px solid rgba(128,128,128,.35);background:transparent;color:inherit;font:600 13px var(--o-body,system-ui);cursor:pointer;text-align:left}.pl-it:hover{border-color:#e31b1f}.pl-it i{width:12px;height:12px;border-radius:50%;flex:none;border:1px solid rgba(0,0,0,.25)}.pl-it small{display:block;font-weight:500;opacity:.7;font-size:11.5px}.ob-pick{position:absolute;inset:0;z-index:8;background:rgba(15,18,24,.45);display:flex;align-items:center;justify-content:center;padding:16px}.ob-pick>div{background:var(--o-card,#fff);color:var(--o-ink,#1d2026);border-radius:14px;padding:16px 18px;max-width:360px;width:100%;box-shadow:0 12px 40px rgba(0,0,0,.35);font:600 14px var(--o-body,system-ui)}.ob-pick h4{margin:0 0 4px;font-size:15px}.ob-pick p{margin:0 0 12px;font-weight:500;font-size:12.5px;opacity:.75}.ob-pick button{display:block;width:100%;text-align:left;margin:6px 0 0;padding:10px 12px;border-radius:10px;border:1.5px solid rgba(128,128,128,.4);background:transparent;color:inherit;font:inherit;cursor:pointer}.ob-pick button:hover{border-color:#e31b1f}.ob-pick button[disabled]{opacity:.45;cursor:default}.ob-pick .x{border:0;opacity:.7;text-align:center}' +
    '.ob-ghost{position:absolute;left:0;top:0;z-index:5;pointer-events:none;background:#1d2026;color:#fff;font:700 12px var(--o-body,system-ui);padding:5px 10px;border-radius:99px}' +
    '.ob-hint{position:absolute;right:10px;bottom:8px;font-size:12px;color:#555b66;background:rgba(255,255,255,.75);padding:4px 9px;border-radius:6px;pointer-events:none}' +
    '.ob-add{font:700 13px var(--o-body,system-ui);padding:8px 14px;border-radius:9px;border:0;background:#e31b1f;color:#fff;cursor:pointer}.ob-add:hover{filter:brightness(1.08)}' +
    '.ob-addf{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.ob-addf input{font:inherit;padding:8px 10px;border-radius:9px;border:1px solid var(--o-line,#c9ced6);background:var(--o-bg,#fff);color:var(--o-fg,#1d2026);min-width:240px}' +
    '.ob-addf span{flex-basis:100%;font-size:12px;color:var(--o-muted,#666c76)}.ob-cancel{font:600 13px var(--o-body,system-ui);padding:8px 12px;border-radius:9px;border:1px solid var(--o-line,#c9ced6);background:transparent;color:var(--o-fg,#1d2026);cursor:pointer}' +
    '.ob-gln{flex-basis:100%;font-size:12px;color:#b3541e}' +
    '.ob-edit{font:700 13px var(--o-body,system-ui);padding:7px 14px;border-radius:9px;border:1px solid var(--o-fg,#1d2026);background:var(--o-fg,#1d2026);color:var(--o-bg,#fff);cursor:pointer;margin-top:10px}' +
    '.ob-m{cursor:grab}.ob-m.drag{cursor:grabbing}.ob-m:focus{outline:none}.ob-m:focus-visible .ob-ring{opacity:1}' +
    '.ob-ring{fill:none;stroke:#e31b1f;stroke-width:2;opacity:0;stroke-dasharray:4 3}.ob-m.sel .ob-ring{opacity:1}' +
    '.ob-m:hover .ob-ring{opacity:1}' +
    '.ob-hide{cursor:pointer}.ob-hide circle{fill:#3a3f4a}.ob-hide:hover circle{fill:#e31b1f}' +
    '.ob-tip{position:fixed;z-index:50;width:292px;max-width:calc(100vw - 16px);background:#fff;color:#1d2026;border-radius:12px;box-shadow:0 10px 30px rgba(20,24,30,.28),0 0 0 1px rgba(20,24,30,.08);padding:12px 14px;font-size:12.5px;line-height:1.35;pointer-events:none}' +
    '.ob-tip h4{margin:0 0 2px;font-size:14px}' +
    '.ob-tip .sub{color:#666c76;font-size:12px}' +
    '.ob-tip .st{display:inline-block;font-size:11px;font-weight:700;border-radius:99px;padding:2px 8px;margin:6px 0 2px}' +
    '.ob-tip .st.on{background:#e6f6ec;color:#12794a}.ob-tip .st.off{background:#eceef2;color:#4a5160}' +
    '.ob-tip dl{display:grid;grid-template-columns:1fr auto;gap:3px 12px;margin:8px 0 0;padding:8px 0 0;border-top:1px solid #e6e8ec}' +
    '.ob-tip dt{color:#666c76}.ob-tip dd{margin:0;text-align:right;font-weight:700;font-variant-numeric:tabular-nums}' +
    '.ob-tip .none{margin:8px 0 0;padding-top:8px;border-top:1px solid #e6e8ec;color:#666c76}' +
    '.ob-empty{padding:30px 16px;text-align:center;color:var(--o-muted,#666c76)}' +
    '.ob-panel{position:relative;margin-top:12px;background:var(--o-surface,#fff);border:1px solid var(--o-line,#d9dce1);border-radius:14px;padding:14px 18px 16px}' +
    '.ob-panel .x{position:absolute;top:8px;right:12px;border:0;background:none;font-size:22px;line-height:1;cursor:pointer;color:var(--o-muted,#666c76)}' +
    '.pn-head{display:flex;gap:14px;align-items:center;margin-bottom:10px}.pn-head h3{margin:0;font-size:17px}.pn-ic{background:var(--o-stage,#e3e6ea);border-radius:12px;padding:6px 8px;flex:none}' +
    '.pn-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:6px 22px;border-top:1px solid var(--o-line,#d9dce1);padding-top:10px}' +
    '.ob-panel .sub{color:var(--o-muted,#666c76);font-size:12.5px}.ob-panel .st{display:inline-block;font-size:11.5px;font-weight:700;border-radius:99px;padding:2px 9px;margin-top:6px}' +
    '.ob-panel .st.on{background:#e6f6ec;color:#12794a}.ob-panel .st.off{background:#eceef2;color:#4a5160}' +
    '.ob-panel .sec{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--o-muted,#666c76);margin-bottom:4px}' +
    '.ob-panel dl{display:grid;grid-template-columns:1fr auto;gap:3px 12px;margin:0 0 8px;font-size:13px}.ob-panel dt{color:var(--o-muted,#666c76)}.ob-panel dd{margin:0;text-align:right;font-weight:700;font-variant-numeric:tabular-nums}' +
    '.ob-panel label{display:block;font-weight:700;font-size:12px}.ob-panel select{width:100%;margin-top:4px;font:inherit;padding:8px;border-radius:8px;border:1px solid var(--o-line,#c9ced6);background:var(--o-bg,#fff);color:var(--o-fg,#1d2026)}' +
    '.ob-panel .none{color:var(--o-muted,#666c76);font-size:13px}' +
    '.sw{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;align-items:center}' +
    '.sw button{width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #aab0ba;cursor:pointer;padding:0}' +
    '.sw button.on{box-shadow:0 0 0 2px #e31b1f}' +
    '.sw .auto{width:auto;height:auto;border-radius:99px;border:1px solid var(--o-line,#c9ced6);background:var(--o-bg,#fff);color:var(--o-fg,#1d2026);font:600 12px inherit;padding:3px 10px;box-shadow:none}' +
    '.sw .auto.on{border-color:#e31b1f;color:#e31b1f;box-shadow:none}' +
    '.sw input[type=color]{width:30px;height:26px;padding:0;border:1px solid var(--o-line,#c9ced6);border-radius:6px;background:none;cursor:pointer}';

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
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function ease(k) { return k < 0 ? 0 : k > 1 ? 1 : (1 - Math.cos(Math.PI * k)) / 2; }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function tri(x) { x = x - Math.floor(x); return x < .5 ? x * 2 : 2 - x * 2; }
  function darken(hex, k) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return '#8a6a00';
    var n = parseInt(m[1], 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function f(c) { return ('0' + Math.round(c * k).toString(16)).slice(-2); }
    return '#' + f(r) + f(g) + f(b);
  }

  /* ---------- Qué dibujo le toca a cada máquina ---------- */
  var FORMAS = [['', 'Automática (según el nombre)'], ['excavadora', 'Excavadora / retro'], ['pala', 'Pala cargadora'], ['moto', 'Motoniveladora'],
    ['camion', 'Camión'], ['camioneta', 'Camioneta'], ['tractor', 'Tractor'], ['rodillo', 'Compactador de suelo (rodillo)'],
    ['acc_desmalezadora', 'Accesorio: desmalezadora'], ['acc_rastra', 'Accesorio: rastra'], ['acc_regador', 'Accesorio: tanque regador'], ['acc_casilla', 'Accesorio: casilla'], ['acc_tanque', 'Accesorio: tanque de combustible']];
  function tipoDibujo(m) {
    if (m.formaMaq) return m.formaMaq;
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

  /* ---------- Aspecto según la marca (colores de su pintura de fábrica; sin logos) ---------- */
  var BRANDS = [
    { re: /caterpillar|\bcat\b/, n: 'Caterpillar', body: '#ffcd11', trim: '#1f2227', roof: 'flat', rim: '#1f2227' },
    { re: /komatsu/, n: 'Komatsu', body: '#f4b400', trim: '#2c4a8a', roof: 'round', rim: '#ffffff' },
    { re: /john ?deere|jonh ?deere|deere/, n: 'John Deere', body: '#367c2b', trim: '#ffde00', roof: 'round', rim: '#ffde00' },
    { re: /xcmg/, n: 'XCMG', body: '#f2b200', trim: '#d71920', roof: 'flat', rim: '#d71920' },
    { re: /lonking/, n: 'Lonking', body: '#f7a600', trim: '#1a5fb4', roof: 'flat', rim: '#1a5fb4' },
    { re: /liugong/, n: 'Liugong', body: '#ffc400', trim: '#0b5ca8', roof: 'round', rim: '#0b5ca8' },
    { re: /dynapac|dynamac/, n: 'Dynapac', body: '#fbb800', trim: '#3a3f4a', roof: 'flat', rim: '#3a3f4a' },
    { re: /deutz/, n: 'Deutz-Fahr', body: '#5da832', trim: '#cfd5db', roof: 'round', rim: '#cfd5db' },
    { re: /zanello/, n: 'Zanello', body: '#c62828', trim: '#f4f4f0', roof: 'flat', rim: '#f4f4f0' },
    { re: /chery/, n: 'Chery', body: '#d03a2f', trim: '#ffd34d', roof: 'flat', rim: '#ffd34d' },
    { re: /mercedes/, n: 'Mercedes-Benz', body: '#f4f4f0', trim: '#b7bcc4', roof: 'flat', rim: '#b7bcc4', bed: '#5c6470' },
    { re: /toyota|toyta|hilux/, n: 'Toyota', body: '#f4f4f0', trim: '#c4172c', roof: 'flat', rim: '#b7bcc4' },
    { re: /ford|ranger/, n: 'Ford', body: '#f4f4f0', trim: '#1c4f9c', roof: 'flat', rim: '#b7bcc4' }
  ];
  var DEFAULT_BODY = { excavadora: '#f2b705', pala: '#f2b705', moto: '#f2b705', rodillo: '#f2b705', camion: '#f4f4f0', camioneta: '#f4f4f0', tractor: '#2f7d4f', generico: '#f2b705', acc_desmalezadora: '#c8402f', acc_rastra: '#6b717b', acc_regador: '#2f6fb0', acc_casilla: '#e8e4d8', acc_tanque: '#d9382b' };
  var ROAD = { camion: 1, camioneta: 1 };
  var ROADB = { 'Mercedes-Benz': 1, 'Toyota': 1, 'Ford': 1 };
  function marcaDe(m) {
    var t = ((m.marca || '') + ' ' + (m.modelo || '') + ' ' + (m.nombre || '')).toLowerCase();
    for (var i = 0; i < BRANDS.length; i++) if (BRANDS[i].re.test(t)) return BRANDS[i];
    return null;
  }
  function estilo(m, tipo) {
    var b = marcaDe(m);
    /* la pintura de la marca solo se usa si es coherente con la forma (marca de camión en camión, etc.) */
    if (b && (!!ROAD[tipo] !== !!ROADB[b.n]) && (tipo !== 'tractor' || ROADB[b.n])) b = (tipo === 'tractor' && !ROADB[b.n]) ? b : null;
    var body = (b && b.body) || DEFAULT_BODY[tipo] || '#f2b705';
    var o = { brand: b ? b.n : '', body: body, trim: (b && b.trim) || '#2b2f36', roof: (b && b.roof) || 'flat', rim: (b && b.rim) || '#aeb4bd', bed: (b && b.bed) || '#d94a3d' };
    if (m.colorMaq) { o.body = m.colorMaq; if (tipo === 'camion') o.bed = darken(m.colorMaq, .82); }
    o.dark = darken(o.body, .78);
    return o;
  }

  var K = '#2b2f36', GL = '#bfe3f2';
  function wheel(cx, cy, r, rim) {
    return '<g><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + K + '"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.5) + '" fill="' + (rim || '#aeb4bd') + '"/>' +
      '<g data-p="wh" data-pv="' + cx + ' ' + cy + '"><rect x="' + (cx - 0.9) + '" y="' + (cy - r * 0.45) + '" width="1.8" height="' + (r * 0.9) + '" fill="' + K + '"/><rect x="' + (cx - r * 0.45) + '" y="' + (cy - 0.9) + '" width="' + (r * 0.9) + '" height="1.8" fill="' + K + '"/></g></g>';
  }
  function cabPath(x, y, w, h, roof) {
    if (roof === 'round') return 'M' + x + ' ' + y + 'v' + (-(h - 4)) + 'q0 -4 4 -4 h' + (w - 10) + ' q4 0 6 4 l4 ' + (h - 4) + 'z';
    return 'M' + x + ' ' + y + 'v' + (-h) + 'h' + w + 'l4 ' + h + 'z';
  }
  /* cada dibujo mide ~100×68 y apoya en y=66. data-p marca las partes que mueve la animación. */
  function dibujo(tipo, st) {
    var c = st.body, d = st.dark, t = st.trim, s = '';
    var ln = (c === '#f4f4f0' ? '#c7c9cd' : darken(c, .8));
    if (tipo === 'excavadora') {
      s += '<rect x="14" y="52" width="58" height="13" rx="6.5" fill="' + K + '"/><circle cx="22" cy="58.5" r="4" fill="#6b717b"/><circle cx="64" cy="58.5" r="4" fill="#6b717b"/>' +
        '<rect x="22" y="40" width="40" height="13" rx="3" fill="' + c + '"/><rect x="22" y="48" width="40" height="5" fill="' + d + '"/><rect x="22" y="44" width="40" height="2" fill="' + t + '" opacity=".85"/>' +
        '<path d="' + cabPath(26, 40, 16, 12, st.roof) + '" fill="' + c + '"/><path d="M30 38v-8h10l3 8z" fill="' + GL + '"/><rect x="50" y="36" width="12" height="4" fill="' + K + '"/>' +
        '<g data-p="arm" data-pv="58 42"><path d="M58 42 L78 22 L82 26 L63 47z" fill="' + c + '" stroke="' + d + '" stroke-width="1"/>' +
        '<g data-p="stick" data-pv="78 22"><path d="M78 22 L92 40 L88 43 L75 26z" fill="' + c + '" stroke="' + d + '" stroke-width="1"/>' +
        '<g data-p="bucket" data-pv="91 41"><path d="M88 40 L99 42 L96 52 L86 49z" fill="' + K + '"/><circle data-p="dirt" cx="94" cy="46" r="4.5" fill="#8b6b4a" visibility="hidden"/></g></g></g>';
    } else if (tipo === 'pala') {
      s += wheel(30, 56, 10, st.rim) + wheel(70, 56, 10, st.rim) +
        '<rect x="14" y="38" width="42" height="14" rx="3" fill="' + c + '"/><rect x="50" y="44" width="30" height="8" rx="2" fill="' + c + '"/><rect x="14" y="48" width="66" height="4" fill="' + d + '"/><rect x="14" y="43" width="66" height="2" fill="' + t + '" opacity=".85"/>' +
        '<path d="' + cabPath(18, 38, 18, 14, st.roof) + '" fill="' + c + '"/><path d="M22 36v-10h13l3 10z" fill="' + GL + '"/><rect x="16" y="22" width="24" height="3" fill="' + K + '"/>' +
        '<g data-p="lift" data-pv="62 47"><path d="M62 46 L84 40 L84 45 L63 51z" fill="' + c + '" stroke="' + d + '" stroke-width="1"/>' +
        '<g data-p="tilt" data-pv="84 43"><path d="M82 34 L98 36 L96 52 L84 52z" fill="' + K + '"/><path d="M84 38 L96 40 L94 50 L85 50z" fill="#555b66"/><path data-p="dirt" d="M84 36 Q91 28 97 36z" fill="#8b6b4a" visibility="hidden"/></g></g>';
    } else if (tipo === 'moto') {
      s += wheel(22, 56, 8, st.rim) + wheel(36, 56, 8, st.rim) + wheel(84, 56, 8, st.rim) +
        '<rect x="12" y="38" width="38" height="12" rx="3" fill="' + c + '"/><rect x="48" y="42" width="40" height="5" fill="' + c + '"/><rect x="12" y="46" width="76" height="3" fill="' + d + '"/><rect x="48" y="43" width="40" height="1.6" fill="' + t + '" opacity=".85"/>' +
        '<path d="' + cabPath(14, 38, 20, 14, st.roof) + '" fill="' + c + '"/><path d="M18 36v-10h16l3 10z" fill="' + GL + '"/><rect x="12" y="22" width="30" height="3" fill="' + K + '"/>' +
        '<g data-p="blade"><rect x="48" y="52" width="26" height="9" rx="2" fill="' + K + '"/><rect x="50" y="52" width="22" height="3" fill="#6b717b"/></g><rect x="84" y="46" width="3" height="8" fill="' + K + '"/>';
    } else if (tipo === 'camion') {
      s += wheel(24, 57, 8.5, st.rim) + wheel(40, 57, 8.5, st.rim) + wheel(82, 57, 8.5, st.rim) +
        '<rect x="10" y="50" width="86" height="5" fill="' + K + '"/>' +
        '<g data-p="bed" data-pv="10 50"><path d="M10 28h50v22H10z" fill="' + st.bed + '" stroke="' + darken(st.bed, .75) + '" stroke-width="1"/><rect x="10" y="44" width="50" height="6" fill="' + darken(st.bed, .75) + '"/>' +
        '<g data-p="load" transform="translate(35 28)"><path d="M-23 1 Q-14 -11 -3 -7 Q9 -15 23 1z" fill="#8b6b4a"/><path d="M-12 0 Q-4 -7 3 -4 Q10 -8 16 0z" fill="#a88560"/></g></g>' +
        '<path d="M62 50V32l8-8h14l6 10v16z" fill="' + c + '" stroke="' + ln + '" stroke-width="1"/><path d="M71 34l4-6h9l4 6z" fill="' + GL + '"/><rect x="90" y="44" width="6" height="4" fill="' + K + '"/><rect x="62" y="46" width="34" height="2.2" fill="' + t + '" opacity=".9"/>';
    } else if (tipo === 'camioneta') {
      s += wheel(26, 57, 8, st.rim) + wheel(76, 57, 8, st.rim) +
        '<path d="M8 52V40h34v12z" fill="' + c + '" stroke="' + ln + '" stroke-width="1"/><path d="M42 52V32l8-9h16l12 11v18z" fill="' + c + '" stroke="' + ln + '" stroke-width="1"/>' +
        '<path d="M52 33l6-8h8l8 8z" fill="' + GL + '"/><rect x="8" y="50" width="86" height="4" fill="' + K + '"/><rect x="86" y="42" width="6" height="4" fill="#ffd34d"/><rect x="8" y="45" width="84" height="2" fill="' + t + '" opacity=".9"/>';
    } else if (tipo === 'tractor') {
      s += wheel(32, 52, 14, st.rim) + wheel(78, 58, 7.5, st.rim) +
        '<rect x="42" y="40" width="42" height="14" rx="3" fill="' + c + '"/><rect x="82" y="44" width="10" height="8" fill="' + d + '"/><rect x="86" y="30" width="3" height="14" fill="' + K + '"/><rect x="42" y="45" width="42" height="2" fill="' + t + '" opacity=".9"/>' +
        '<path d="' + (st.roof === 'round' ? 'M20 40v-14q0 -4 4 -4h14q4 0 6 4l0 14z' : 'M20 40v-18h24v18z') + '" fill="' + c + '"/><path d="M24 38v-14h16v14z" fill="' + GL + '"/><rect x="18" y="20" width="28" height="3" fill="' + K + '"/>';
    } else if (tipo === 'rodillo') {
      s += '<rect x="30" y="40" width="42" height="14" rx="3" fill="' + c + '"/><rect x="30" y="49" width="42" height="4" fill="' + d + '"/><rect x="30" y="44" width="42" height="2" fill="' + t + '" opacity=".85"/>' +
        '<path d="M64 40 L74 46 L74 52 L64 52z" fill="' + c + '"/>' +
        '<path d="' + cabPath(32, 40, 22, 15, st.roof) + '" fill="' + c + '"/><path d="M36 38v-11h14l2 11z" fill="' + GL + '"/><rect x="30" y="22" width="28" height="3" fill="' + K + '"/>' +
        '<circle cx="82" cy="49" r="15" fill="#7f8792"/><circle cx="82" cy="49" r="15" fill="none" stroke="#5b616b" stroke-width="2"/><circle cx="82" cy="49" r="5.5" fill="#444a54"/><rect x="62" y="44" width="20" height="3.5" fill="' + K + '"/>' +
        '<circle cx="36" cy="54" r="12" fill="' + K + '"/><circle cx="36" cy="54" r="5" fill="' + st.rim + '"/>';
    } else if (tipo === 'acc_desmalezadora') {
      s += wheel(34, 58, 6, st.rim) + wheel(70, 58, 6, st.rim) + '<rect x="14" y="40" width="72" height="14" rx="3" fill="' + c + '"/><rect x="14" y="48" width="72" height="5" fill="' + darken(c, .75) + '"/><circle cx="50" cy="44" r="7" fill="#444a54"/><rect x="2" y="48" width="14" height="3" fill="' + K + '"/>';
    } else if (tipo === 'acc_rastra') {
      s += '<rect x="10" y="42" width="80" height="4" fill="' + K + '"/><rect x="2" y="48" width="12" height="3" fill="' + K + '"/>' + [18, 34, 50, 66, 82].map(function (x) { return '<ellipse cx="' + x + '" cy="54" rx="4" ry="11" fill="#9aa1ab" stroke="#5b616b" stroke-width="1.5"/>'; }).join('');
    } else if (tipo === 'acc_regador') {
      s += wheel(52, 58, 7, st.rim) + '<rect x="14" y="30" width="72" height="26" rx="13" fill="' + c + '"/><rect x="14" y="40" width="72" height="5" fill="' + darken(c, .75) + '" opacity=".6"/><rect x="2" y="50" width="14" height="3" fill="' + K + '"/><rect x="84" y="50" width="12" height="3" fill="#9aa1ab"/>';
    } else if (tipo === 'acc_casilla') {
      s += '<rect x="16" y="56" width="68" height="4" fill="' + K + '"/><rect x="16" y="26" width="68" height="30" fill="' + c + '" stroke="#b9b4a2" stroke-width="1.5"/><rect x="12" y="22" width="76" height="6" fill="#7a8190"/><rect x="24" y="34" width="16" height="12" fill="' + GL + '"/><rect x="58" y="32" width="14" height="24" fill="#8a6a44"/>';
    } else if (tipo === 'acc_tanque') {
      s += '<rect x="22" y="58" width="56" height="4" fill="' + K + '"/><rect x="24" y="34" width="52" height="24" rx="4" fill="' + c + '"/><rect x="24" y="44" width="52" height="4" fill="' + darken(c, .7) + '"/><rect x="44" y="26" width="12" height="8" fill="#444a54"/><rect x="76" y="46" width="12" height="3" fill="' + K + '"/>';
    } else {
      s += wheel(28, 57, 8, st.rim) + wheel(72, 57, 8, st.rim) + '<rect x="14" y="36" width="68" height="20" rx="4" fill="' + c + '"/><rect x="22" y="28" width="26" height="10" fill="' + GL + '"/>';
    }
    return '<g data-p="bob">' + s + '</g>';
  }

  var AREAS = [
    { piso: '#dbe3f3', borde: '#a9b8da', lado: '#8e9dc0', lado2: '#a3b2d4', acento: '#6c7cff' },
    { piso: '#f3e4cf', borde: '#dbc19a', lado: '#bda47c', lado2: '#d2b98f', acento: '#e0a21a' },
    { piso: '#d9efe4', borde: '#a3d1bb', lado: '#82b49b', lado2: '#98c8b0', acento: '#19b394' },
    { piso: '#f6dcd5', borde: '#e0b0a4', lado: '#c48f82', lado2: '#d7a699', acento: '#ff6a4d' },
    { piso: '#e5def2', borde: '#bfb2dc', lado: '#a093c2', lado2: '#b5a8d3', acento: '#8a63d2' }
  ];
  var COLORES = ['#ffcd11', '#f2b705', '#e8731a', '#d6281f', '#367c2b', '#2f7d4f', '#1f5fae', '#f4f4f0', '#8a9099', '#2b2f36'];
  var SC = 0.72, STEP = 92;

  /* ======== Motor 3D (three.js): escenario low-poly como el de la Oficina ======== */
  function webglOK() {
    try { var c = document.createElement('canvas'); return !!(window.THREE && window.THREE.OrbitControls && window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; }
  }
  var CW = 2.2, MG = 1, GLS = '#9fd0e6', KK = '#2b2f36';
  function angd(a, b) { var d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }

      /* ---- guion de trabajo (sin choques) ---- */
  /* Guion de trabajo de cada terreno: cada máquina tiene su propio carril o zona para que no se crucen.
     Coordenadas en casillas (u,v) dentro del terreno de lado s. Todo es función del tiempo t (segundos). */
  var BAND = 3.1, SLOT = 13, RING = 0.5;
  function roundPoly(P, r, closed) {
    var n = P.length, out = [], i, k;
    function corner(a0, c0, b0) {
      var a = [c0[0] - a0[0], c0[1] - a0[1]], b = [b0[0] - c0[0], b0[1] - c0[1]];
      var la = Math.hypot(a[0], a[1]), lb = Math.hypot(b[0], b[1]), rr = Math.min(r, la / 2, lb / 2);
      var p1 = [c0[0] - a[0] / la * rr, c0[1] - a[1] / la * rr], p2 = [c0[0] + b[0] / lb * rr, c0[1] + b[1] / lb * rr], res = [];
      for (k = 0; k <= 8; k++) { var t = k / 8, q = 1 - t; res.push([q * q * p1[0] + 2 * q * t * c0[0] + t * t * p2[0], q * q * p1[1] + 2 * q * t * c0[1] + t * t * p2[1]]); }
      return res;
    }
    if (closed) { for (i = 0; i < n; i++) out = out.concat(corner(P[(i + n - 1) % n], P[i], P[(i + 1) % n])); out.push(out[0]); }
    else { out.push(P[0]); for (i = 1; i < n - 1; i++) out = out.concat(corner(P[i - 1], P[i], P[i + 1])); out.push(P[n - 1]); }
    var L = [0]; for (i = 1; i < out.length; i++) L.push(L[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
    return { pts: out, L: L, len: L[L.length - 1] };
  }
  function atPath(pa, d) {
    d = Math.max(0, Math.min(pa.len, d)); var i = 1;
    while (i < pa.L.length - 1 && pa.L[i] < d) i++;
    var s0 = pa.L[i - 1], s1 = pa.L[i], f = s1 > s0 ? (d - s0) / (s1 - s0) : 0, a = pa.pts[i - 1], b = pa.pts[i], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return { u: a[0] + dx * f, v: a[1] + dy * f, hu: dx / l, hv: dy / l };
  }
  var HOFF = 1.25;
  function enganchable(t) { return t === 'acc_desmalezadora' || t === 'acc_rastra' || t === 'acc_regador'; }
  function esCamp(t) { return t === 'acc_casilla' || t === 'acc_tanque'; }
  function needSide(c, cap) {
    var nb = c.e > 0 ? c.e : (c.t > 0 ? 1 : 0), k = c.l + c.m + c.r, pal = (c.t > 0 && c.l > 0 && nb > 0) ? 1 : 0;
    var nl = pal ? 1 + Math.ceil((k - 1) / cap) : Math.ceil(k / cap); nl += Math.ceil(c.g / 4) + Math.ceil(c.k / 4);
    var ev0 = 2.95, vL0 = nb > 0 ? ev0 + BAND * nb - 1.38 : 1.5, need = (c.g + c.k) > 2 ? 8 : 6;
    if (nl > 0) need = Math.max(need, vL0 + (nl - 1) * 1.05 + 1.5); else if (nb > 0) need = Math.max(need, ev0 + BAND * (nb - 1) + 2.2);
    if (nb > 0) need = Math.max(need, 8); else if (k > 0) need = Math.max(need, cap === 2 ? 11.4 : 7);
    if (c.rr > 0) need = Math.max(need, Math.ceil((c.rr + 6) / 4));
    return Math.ceil(need);
  }
  function sizeFor(c) {
    var s1 = needSide(c, 1);
    if (s1 <= 10) return { s: s1, cap: 1 };
    var s2 = Math.max(needSide(c, 2), 12);
    return s2 < s1 ? { s: s2, cap: 2 } : { s: s1, cap: 1 };
  }
  var KF = [[0, 0.35, -1.0, -0.6, 0, 0], [0.3, -0.2, -0.3, 0.3, 0, 0], [0.45, -0.3, -0.05, -0.9, 1, 0], [0.62, 0.6, -0.6, -0.9, 1, 1], [0.8, 0.5, -0.5, 0.7, 0, 1], [1, 0.35, -1.0, -0.6, 0, 0]];
  function pose(p) {
    for (var k = 1; k < KF.length; k++) if (p <= KF[k][0]) {
      var a0 = KF[k - 1], a1 = KF[k], f = ease((p - a0[0]) / (a1[0] - a0[0]));
      return { boom: lerp(a0[1], a1[1], f), stick: lerp(a0[2], a1[2], f), bucket: lerp(a0[3], a1[3], f), dirt: (p > 0.44 && p < 0.74) ? 1 : 0, swing: lerp(a0[5], a1[5], f) };
    }
    return { boom: 0.35, stick: -1, bucket: -0.6, dirt: 0, swing: 0 };
  }
  /* L: lista [{id,tipo,host}] (host = id de la máquina a la que va enganchado el accesorio). Devuelve tamaño, guion de cada máquina y elementos del suelo. */
  function workPlan(L) {
    var by = { excavadora: [], camion: [], pala: [], moto: [], rodillo: [], tractor: [], camioneta: [], generico: [] }, camp = [], accs = [], tipoDe = {};
    L.forEach(function (m) {
      tipoDe[m.id] = m.tipo;
      if (esCamp(m.tipo)) camp.push(m.id); else if (enganchable(m.tipo)) accs.push(m); else (by[m.tipo] || by.generico).push(m.id);
    });
    var ex = by.excavadora, tr = by.camion, ld = by.pala, mg = by.moto, rl = by.rodillo, tc = by.tractor, pk = by.camioneta, gn = by.generico;
    var MAXT = 3, nb0 = ex.length > 0 ? ex.length : (tr.length > 0 ? 1 : 0);
    if (tr.length > MAXT * nb0) { gn = gn.concat(tr.slice(MAXT * nb0)); tr = tr.slice(0, MAXT * nb0); }
    /* accesorios enganchados: uno por tractor/camioneta; los demás quedan estacionados */
    var hosts = tc.concat(pk), accOf = {};
    accs.forEach(function (a) { if (a.host !== undefined && hosts.indexOf(a.host) >= 0 && accOf[a.host] === undefined) accOf[a.host] = a.id; else gn.push(a.id); });
    hosts.sort(function (x, y) { return (accOf[y] !== undefined ? 1 : 0) - (accOf[x] !== undefined ? 1 : 0); });
    var rr = 0; hosts.forEach(function (h) { rr += accOf[h] !== undefined ? 2.7 : 1.5; });
    var cnt = { e: ex.length, t: tr.length, l: ld.length, m: mg.length, r: rl.length, g: gn.length, k: camp.length, rr: rr };
    var sz = sizeFor(cnt), s = sz.s, cap = sz.cap, acts = {}, feats = [];
    var nb = cnt.e > 0 ? cnt.e : (cnt.t > 0 ? 1 : 0), ev0 = 2.95;
    /* 1) anillo perimetral: tractores y camionetas (con su accesorio enganchado atrás), parejos y sin cruzarse */
    var rp = roundPoly([[RING, RING], [s - RING, RING], [s - RING, s - RING], [RING, s - RING]], 0.9, true), fac = rr ? rp.len / rr : 1, cum = 0;
    function ringAt(d) { return atPath(rp, ((d % rp.len) + rp.len) % rp.len); }
    hosts.forEach(function (id) {
      var hasA = accOf[id] !== undefined, d0 = cum * fac + (hasA ? 1.3 : 0.4); cum += hasA ? 2.7 : 1.5;
      acts[id] = function (t) { var q = ringAt(d0 + t * 0.5); return { u: q.u, v: q.v, hu: q.hu, hv: q.hv, mov: 1 }; };
      if (hasA) acts[accOf[id]] = function (t) { var q = ringAt(d0 - HOFF + t * 0.5); return { u: q.u, v: q.v, hu: q.hu, hv: q.hv, mov: 1 }; };
    });
    /* 2) zonas de excavación: cada retro con su pozo, su carril de ida, su carril de vuelta y su montón de descarga */
    var su = 2.82, dpu = s - 2.2, Er = s - 1.5, Wq = su - 1.3, lastM = 0;
    for (var b = 0; b < nb; b++) (function (b) {
      var ev = ev0 + BAND * b, vA = ev - 0.78, vB = ev - 1.45, exId = ex[b] !== undefined ? ex[b] : null, grp = tr.filter(function (id, i) { return i % nb === b; });
      var path = roundPoly([[su, vA], [Er, vA], [Er, vB], [Wq, vB], [Wq, vA], [su, vA]], 0.3, false), dtip = dpu - su, dQ = path.len - 1.3, m = grp.length;
      if (m && b === nb - 1) lastM = 1;
      var Tmn = dQ / 1.1, Cyc = Math.max(m * SLOT, 9 + 3 + Tmn), Tm = Cyc - 12, t1 = Tm * dtip / dQ, t2 = Tm - t1;
      function tstate(j, t) {
        var tau = (((t - j * SLOT) % Cyc) + Cyc) % Cyc, st = { d: 0, bed: 0, lvl: 0, mov: 0, tau: tau, load: false };
        if (tau < 1.5) { st.d = dQ + 1.3 * ease(tau / 1.5); st.mov = 1; }
        else if (tau < 9) { st.d = 0; var p = tau - 1.5, k = Math.floor(p / 2.5), fr = (p % 2.5) / 2.5; st.lvl = (k + ease(seg(fr, 0.62, 0.85))) / 3; st.load = true; }
        else {
          var q = tau - 9; st.lvl = 1;
          if (q < t1) { st.d = q < 2 ? 1.1 * q : 2.2 + (dtip - 2.2) * (q - 2) / Math.max(0.1, t1 - 2); st.mov = 1; }
          else if (q < t1 + 3) { var pp = q - t1; st.d = dtip; st.bed = ease(seg(pp, 0, 1)) * (1 - ease(seg(pp, 2, 3))); st.lvl = 1 - ease(seg(pp, 0.7, 2.2)); }
          else { var r = q - t1 - 3; st.d = r > t2 - 2 ? dQ - 2.2 + 1.1 * (r - (t2 - 2)) : dtip + (dQ - 2.2 - dtip) * r / Math.max(0.1, t2 - 2); st.mov = 1; st.lvl = 0; }
        }
        return st;
      }
      grp.forEach(function (id, j) {
        acts[id] = function (t) { var st = tstate(j, t), q = atPath(path, st.d); return { u: q.u, v: q.v, hu: q.hu, hv: q.hv, mov: st.mov, bed: st.bed, lvl: st.lvl }; };
      });
      var eu = 2.2, pitU = eu + 0.62;
      if (exId !== null) {
        var swT = m ? Math.atan2(0.78, 0.62) : -Math.atan2(0.72, 0.74);
        acts[exId] = function (t) {
          var po = { boom: 0.32 + Math.sin(t * 2) * 0.02, stick: -1, bucket: -0.6, dirt: 0, swing: 0 };
          if (m) { for (var j = 0; j < m; j++) { var st = tstate(j, t); if (st.load) { var p = st.tau - 1.5; po = pose((p % 2.5) / 2.5); break; } } }
          else po = pose((t % 3.4) / 3.4);
          return { u: eu, v: ev, hu: 1, hv: 0, mov: 0, pose: po, swing: swT * po.swing };
        };
        feats.push({ k: 'pit', u: pitU, v: ev, fn: function (t) { return 0.62 + 0.38 * tri(t / 36); } });
        feats.push({ k: 'heap', u: pitU + 0.12, v: ev + 0.72, r: 0.78, h: 0.75, fn: function (t) { return 0.55 + 0.45 * tri(t / 36 + 0.5); } });
      } else if (m) {
        feats.push({ k: 'heap', u: su + 0.3, v: vA + 0.85, r: 0.8, h: 0.8, fn: function () { return 1; } });
      }
      if (m) feats.push({ k: 'heap', u: dpu, v: vA + 0.66, r: 0.85, h: 0.85, fn: function (t) { return 0.6 + 0.4 * tri(t / 40); } });
    })(b);
    /* 3) carriles de trabajo. La primera pala recoge la tierra que descargan los camiones y la lleva a su carril; la moto la estría y el rodillo la compacta */
    var vL0 = nb > 0 ? ev0 + BAND * nb - 1.38 : 1.5, workers = [], pal = (ld.length > 0 && lastM && nb > 0) ? ld[0] : null, lane0 = 0;
    mg.forEach(function (id) { workers.push({ id: id, k: 'moto' }); }); rl.forEach(function (id) { workers.push({ id: id, k: 'rodillo' }); });
    ld.forEach(function (id) { if (id !== pal) workers.push({ id: id, k: 'pala' }); });
    if (pal !== null) {
      var vl = vL0, vP = ev0 + BAND * (nb - 1) - 0.78 + 1.55, u1 = 2.85, pth = roundPoly([[dpu, vP], [dpu, vl], [u1, vl]], 0.45, false), Ts = 2.4, Td = pth.len / 0.9, Tu = 2.4, TT = 2 * Td + Ts + Tu;
      feats.push({ k: 'heap', u: 1.9, v: vl, r: 0.7, h: 0.7, fn: function (t) { return 0.55 + 0.45 * tri(t / TT * 0.5); } });
      acts[pal] = function (t) {
        var tt = ((t % TT) + TT) % TT, d, hu, hv, mov = 0, lift = -0.1, tilt = 0.2, dirt = 0, f;
        if (tt < Ts) { d = 0; hu = 0; hv = -1; f = tt / Ts; tilt = lerp(-0.2, 0.6, ease(seg(f, 0.2, 0.7))); lift = f < 0.5 ? lerp(-0.45, -0.05, ease(f / 0.5)) : lerp(-0.05, 0.45, ease(seg(f, 0.6, 1))); dirt = f > 0.6 ? 1 : 0; }
        else if (tt < Ts + Td) { d = pth.len * ease((tt - Ts) / Td); mov = 1; lift = 0.45; tilt = 0.6; dirt = 1; }
        else if (tt < Ts + Td + Tu) { d = pth.len; f = (tt - Ts - Td) / Tu; lift = lerp(0.45, 0.7, ease(seg(f, 0, 0.4))); tilt = lerp(0.6, -0.8, ease(seg(f, 0.3, 0.8))); dirt = f < 0.6 ? 1 : 0; }
        else { f = (tt - Ts - Td - Tu) / Td; d = pth.len * (1 - ease(f)); mov = 1; lift = lerp(0.7, -0.45, ease(seg(f, 0, 0.3))); tilt = lerp(-0.8, -0.2, ease(seg(f, 0, 0.4))); }
        var q = atPath(pth, d);
        if (tt >= Ts + Td + Tu) { q.hu = -q.hu; q.hv = -q.hv; }
        if (tt < Ts) { q.hu = hu; q.hv = hv; }
        return { u: q.u, v: q.v, hu: q.hu, hv: q.hv, mov: mov, lift: lift, tilt: tilt, dirt: dirt };
      };
      lane0 = 1;
    }
    var nLanes = lane0 + Math.ceil(workers.length / cap), cm = 0, cr = 0;
    workers.forEach(function (w, i) {
      var lane = lane0 + Math.floor(i / cap), slot = i % cap, inLane = Math.min(cap, workers.length - Math.floor(i / cap) * cap), v = vL0 + lane * 1.05, xa = 1.9, xb = s - 1.9;
      if (inLane === 2) { var mid = s / 2; if (slot === 0) xb = mid - 0.2; else xa = mid + 0.2; }
      if (w.k === 'pala') {
        var q1 = xa + 0.95, q2 = xb - 0.95, T = 14, ph = (i % 2) * 0.5;
        feats.push({ k: 'heap', u: xa, v: v, r: 0.7, h: 0.7, fn: function (t) { return 1.0 - 0.3 * tri(t / 28); } });
        feats.push({ k: 'heap', u: xb, v: v, r: 0.7, h: 0.7, fn: function (t) { return 0.72 + 0.3 * tri(t / 28); } });
        acts[w.id] = function (t) {
          var tt = (t + ph * T) % T, u, hu = 1, mov = 0, lift = -0.1, tilt = 0.2, dirt = 0;
          if (tt < 2.2) { u = q1; hu = -1; var f = tt / 2.2; tilt = lerp(-0.2, 0.6, ease(seg(f, 0.2, 0.7))); lift = f < 0.5 ? lerp(-0.45, -0.05, ease(f / 0.5)) : lerp(-0.05, 0.45, ease(seg(f, 0.6, 1))); dirt = f > 0.6 ? 1 : 0; }
          else if (tt < 6.2) { u = lerp(q1, q2, ease((tt - 2.2) / 4)); lift = 0.45; tilt = 0.6; dirt = 1; mov = 1; }
          else if (tt < 8.2) { u = q2; var f3 = (tt - 6.2) / 2; lift = lerp(0.45, 0.7, ease(seg(f3, 0, 0.4))); tilt = lerp(0.6, -0.8, ease(seg(f3, 0.3, 0.8))); dirt = f3 < 0.6 ? 1 : 0; }
          else { var f4 = ease((tt - 8.2) / 5.8); u = lerp(q2, q1, f4); hu = -1; lift = lerp(0.7, -0.45, ease(seg(f4, 0, 0.3))); tilt = lerp(-0.8, -0.2, ease(seg(f4, 0, 0.4))); mov = 1; }
          return { u: u, v: v, hu: hu, hv: 0, mov: mov, lift: lift, tilt: tilt, dirt: dirt };
        };
      } else {
        var T2 = 15, ph2 = w.k === 'moto' ? (cm++ % 2) * 0.5 : (0.55 + (cr++ % 2) * 0.5) % 1, ua = xa + 0.5, ub = xb - 0.5;
        feats.push({ k: 'trail', u0: ua, v: v, color: w.k === 'moto' ? '#efe4c8' : '#8f7752', op: w.k === 'moto' ? 0.95 : 0.55, fn: function (t) {
          var tt = (t + ph2 * T2) % T2, cov = tt < T2 * 0.42 ? ease(tt / (T2 * 0.42)) : 1, fade = tt > T2 * 0.92 ? 1 - (tt - T2 * 0.92) / (T2 * 0.08) : 1;
          return { len: (ub - ua) * cov, op: fade };
        } });
        acts[w.id] = function (t) {
          var tt = (t + ph2 * T2) % T2, u, hu = 1, mov = 1;
          if (tt < T2 * 0.42) u = lerp(ua, ub, ease(tt / (T2 * 0.42)));
          else if (tt < T2 * 0.5) { u = ub; mov = 0; }
          else if (tt < T2 * 0.92) { u = lerp(ub, ua, ease((tt - T2 * 0.5) / (T2 * 0.42))); hu = -1; }
          else { u = ua; mov = 0; hu = -1; }
          return { u: u, v: v, hu: hu, hv: 0, mov: mov, shake: w.k === 'rodillo' && mov ? 1 : 0 };
        };
      }
    });
    /* 4) estacionados (otras máquinas, accesorios sin tractor) y campamento (casillas y tanques de combustible) */
    var vG = vL0 + nLanes * 1.05, perRow = Math.max(1, Math.floor((s - 4) / 1.3) + 1);
    gn.forEach(function (id, i) { var u = 2.0 + (i % perRow) * 1.3, v = vG + Math.floor(i / perRow) * 1.05; acts[id] = function () { return { u: u, v: v, hu: 1, hv: 0, mov: 0 }; }; });
    if (camp.length) {
      var vC = vG + Math.ceil(gn.length / perRow) * 1.05, rows = Math.ceil(camp.length / perRow), cols = Math.min(camp.length, perRow);
      camp.forEach(function (id, i) { var u = 2.0 + (i % perRow) * 1.3, v = vC + Math.floor(i / perRow) * 1.05; acts[id] = function () { return { u: u, v: v, hu: 0, hv: 1, mov: 0 }; }; });
      feats.push({ k: 'camp', u0: 1.35, u1: 2.0 + (cols - 1) * 1.3 + 0.65, v0: vC - 0.58, v1: vC + (rows - 1) * 1.05 + 0.58 });
    }
    return { s: s, acts: acts, feats: feats };
  }
  

  function engine3D(stage, api) {
    var T = window.THREE, GC = {}, MC = {};
    function geo(k, a, b, c) {
      var key = k + [a, b, c].join(':'); if (GC[key]) return GC[key];
      var g;
      if (k === 'b') g = new T.BoxGeometry(a, b, c);
      else if (k === 'cz') { g = new T.CylinderGeometry(a, a, b, c || 14); g.rotateX(Math.PI / 2); }
      else if (k === 'cy') g = new T.CylinderGeometry(a, a, b, c || 18);
      else if (k === 'cone') g = new T.ConeGeometry(a, b, c || 7);
      else g = new T.SphereGeometry(a, 10, 8);
      return (GC[key] = g);
    }
    function mat(c) { return MC[c] || (MC[c] = new T.MeshLambertMaterial({ color: c })); }
    function bx(g, w, h, d, c, x, y, z) { var m = new T.Mesh(geo('b', w, h, d), mat(c)); m.position.set(x || 0, y || 0, z || 0); g.add(m); return m; }

    var renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var cv = renderer.domElement;
    function stageColor() { var c = ''; try { c = getComputedStyle(stage).getPropertyValue('--o-stage').trim(); } catch (e) { } return c || '#e3e6ea'; }
    var scene = new T.Scene(); scene.background = new T.Color(stageColor());
    var camera = new T.PerspectiveCamera(26, 1, 1, 600);
    scene.add(new T.HemisphereLight(0xffffff, 0xd8d1c0, 0.92));
    var sun = new T.DirectionalLight(0xffffff, 0.7); sun.position.set(-14, 26, 10); scene.add(sun);
    var world = new T.Group(); scene.add(world);
    var ov = document.createElement('div'); ov.className = 'ob-ov';
    var zoom = document.createElement('div'); zoom.className = 'ob-zoom';
    zoom.innerHTML = '<button type="button" data-z="in" aria-label="Acercar">+</button><button type="button" data-z="out" aria-label="Alejar">−</button><button type="button" data-z="home" aria-label="Vista general">⌂</button>';
    var bay = document.createElement('div'); bay.className = 'ob-bay';
    var emptyEl = document.createElement('div'); emptyEl.className = 'ob-empty'; emptyEl.hidden = true;
    var hint = document.createElement('div'); hint.className = 'ob-hint'; hint.textContent = 'Arrastrá el fondo para girar · tocá un terreno para ver su nombre · pasá el mouse por una máquina';
    stage.classList.add('gl'); stage.innerHTML = '';
    stage.appendChild(cv); stage.appendChild(ov); stage.appendChild(zoom); stage.appendChild(hint); stage.appendChild(bay); stage.appendChild(emptyEl);
    var controls = new T.OrbitControls(camera, cv);
    controls.enableDamping = true; controls.dampingFactor = 0.12; controls.enableZoom = false;
    controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.3; controls.screenSpacePanning = false;
    if (window.__obDebug) window.__obS = null;
    var ray = new T.Raycaster(), V = new T.Vector3(), plane = new T.Plane(new T.Vector3(0, 1, 0), -0.25);

    var S;
    S = { selPlot: null, slabs: [], bg: null, d: null, actors: [], plots: [], tray: null, labels: [], pinned: null, key: '', ext: null, hover: null, drag: null, hl: null, own: [], size: [0, 0] };
    if (window.__obDebug) window.__obS = S;

    /* ---------- modelos ---------- */
    function wheelM(g, W, r, x, y, z, w, rim) {
      var gp = new T.Group(); gp.position.set(x, y, z); g.add(gp);
      var tire = new T.Mesh(geo('cz', r, w, 14), mat(KK)); gp.add(tire);
      var hub = new T.Mesh(geo('cz', r * 0.55, w + 0.03, 12), mat(rim || '#aeb4bd')); gp.add(hub);
      bx(gp, r * 1.5, 0.06, w + 0.05, KK, 0, 0, 0);
      W.push(gp); return gp;
    }
    function model(tipo, st) {
      var g = new T.Group(), P = {}, W = [], c = st.body, d = st.dark, t = st.trim;
      if (tipo === 'excavadora') {
        bx(g, 1.3, 0.28, 0.34, KK, 0, 0.16, 0.36); bx(g, 1.3, 0.28, 0.34, KK, 0, 0.16, -0.36);
        bx(g, 1.2, 0.04, 0.2, '#6b717b', 0, 0.3, 0.36); bx(g, 1.2, 0.04, 0.2, '#6b717b', 0, 0.3, -0.36);
        var up = new T.Group(); up.position.y = 0.3; g.add(up); P.up = up;
        bx(up, 0.98, 0.34, 0.8, c, -0.05, 0.19, 0); bx(up, 0.36, 0.4, 0.8, d, -0.52, 0.22, 0); bx(up, 1.0, 0.05, 0.82, t, -0.05, 0.36, 0);
        bx(up, 0.44, 0.46, 0.44, c, 0.1, 0.63, 0.17); bx(up, 0.46, 0.06, 0.48, d, 0.1, 0.89, 0.17);
        bx(up, 0.04, 0.3, 0.36, GLS, 0.33, 0.66, 0.17);
        var boom = new T.Group(); boom.position.set(0.38, 0.32, -0.16); up.add(boom); P.boom = boom;
        bx(boom, 1.05, 0.16, 0.16, c, 0.52, 0, 0);
        var stick = new T.Group(); stick.position.set(1.04, 0, 0); boom.add(stick); P.stick = stick;
        bx(stick, 0.86, 0.11, 0.12, d, 0.43, 0, 0);
        var bucket = new T.Group(); bucket.position.set(0.86, 0, 0); stick.add(bucket); P.bucket = bucket;
        bx(bucket, 0.32, 0.26, 0.42, KK, 0.1, -0.1, 0);
        var dirt = new T.Mesh(geo('s', 0.2), mat('#8b6b4a')); dirt.position.set(0.12, 0.02, 0); dirt.visible = false; bucket.add(dirt); P.dirt = dirt;
      } else if (tipo === 'pala') {
        [-0.5, 0.5].forEach(function (x) { wheelM(g, W, 0.3, x, 0.3, 0.48, 0.24, st.rim); wheelM(g, W, 0.3, x, 0.3, -0.48, 0.24, st.rim); });
        bx(g, 0.86, 0.42, 0.74, c, -0.28, 0.55, 0); bx(g, 0.78, 0.26, 0.62, c, 0.42, 0.42, 0); bx(g, 1.7, 0.06, 0.66, d, 0.05, 0.28, 0);
        bx(g, 0.88, 0.05, 0.76, t, -0.28, 0.77, 0);
        bx(g, 0.42, 0.5, 0.52, c, -0.3, 1.02, 0); bx(g, 0.04, 0.34, 0.44, GLS, -0.08, 1.04, 0); bx(g, 0.46, 0.05, 0.56, d, -0.3, 1.29, 0);
        var lift = new T.Group(); lift.position.set(0.55, 0.5, 0); g.add(lift); P.lift = lift;
        bx(lift, 0.78, 0.1, 0.1, c, 0.39, 0, 0.36); bx(lift, 0.78, 0.1, 0.1, c, 0.39, 0, -0.36);
        var tilt = new T.Group(); tilt.position.set(0.78, 0, 0); lift.add(tilt); P.tilt = tilt;
        bx(tilt, 0.34, 0.4, 1.0, KK, 0.1, -0.02, 0); bx(tilt, 0.26, 0.3, 0.86, '#555b66', 0.12, 0.02, 0);
        var dirtP = new T.Mesh(geo('s', 0.3), mat('#8b6b4a')); dirtP.position.set(0.12, 0.2, 0); dirtP.scale.set(1, 0.7, 1.4); dirtP.visible = false; tilt.add(dirtP); P.dirt = dirtP;
      } else if (tipo === 'moto') {
        [-0.75, -0.4].forEach(function (x) { wheelM(g, W, 0.26, x, 0.26, 0.44, 0.2, st.rim); wheelM(g, W, 0.26, x, 0.26, -0.44, 0.2, st.rim); });
        wheelM(g, W, 0.26, 0.85, 0.26, 0.4, 0.2, st.rim); wheelM(g, W, 0.26, 0.85, 0.26, -0.4, 0.2, st.rim);
        bx(g, 2.05, 0.14, 0.24, c, 0.05, 0.62, 0); bx(g, 0.9, 0.46, 0.76, c, -0.55, 0.62, 0); bx(g, 0.9, 0.05, 0.78, t, -0.55, 0.86, 0);
        bx(g, 0.44, 0.5, 0.5, c, -0.62, 1.08, 0); bx(g, 0.04, 0.34, 0.42, GLS, -0.4, 1.1, 0); bx(g, 0.48, 0.05, 0.54, d, -0.62, 1.35, 0);
        bx(g, 0.2, 0.32, 0.2, d, 0.85, 0.5, 0);
        var blade = new T.Group(); blade.position.set(0.2, 0.28, 0); g.add(blade); P.blade = blade;
        bx(blade, 0.1, 0.26, 1.15, KK, 0, 0, 0); bx(blade, 0.12, 0.05, 1.15, '#8a9099', 0, -0.13, 0); bx(blade, 0.06, 0.16, 0.1, d, 0, 0.2, 0);
      } else if (tipo === 'camion') {
        bx(g, 2.1, 0.16, 0.72, KK, 0, 0.42, 0);
        [-0.75, -0.38].forEach(function (x) { wheelM(g, W, 0.27, x, 0.27, 0.42, 0.24, st.rim); wheelM(g, W, 0.27, x, 0.27, -0.42, 0.24, st.rim); });
        wheelM(g, W, 0.27, 0.72, 0.27, 0.42, 0.24, st.rim); wheelM(g, W, 0.27, 0.72, 0.27, -0.42, 0.24, st.rim);
        bx(g, 0.62, 0.72, 0.78, c, 0.78, 0.9, 0); bx(g, 0.04, 0.34, 0.66, GLS, 1.1, 1.05, 0); bx(g, 0.64, 0.06, 0.8, t, 0.78, 1.28, 0); bx(g, 0.1, 0.12, 0.7, KK, 1.12, 0.55, 0);
        var bed = new T.Group(); bed.position.set(-1.0, 0.54, 0); g.add(bed); P.bed = bed;
        bx(bed, 1.45, 0.1, 0.84, st.bed, 0.72, 0.05, 0); bx(bed, 1.45, 0.5, 0.08, st.bed, 0.72, 0.3, 0.38); bx(bed, 1.45, 0.5, 0.08, st.bed, 0.72, 0.3, -0.38);
        bx(bed, 0.08, 0.55, 0.84, st.bed, 0, 0.3, 0); bx(bed, 0.08, 0.5, 0.84, st.bed, 1.44, 0.3, 0);
        var load = new T.Mesh(geo('b', 1.3, 0.4, 0.72), mat('#8b6b4a')); load.position.set(0.72, 0.28, 0); load.visible = false; bed.add(load); P.load = load;
      } else if (tipo === 'camioneta') {
        wheelM(g, W, 0.24, -0.5, 0.24, 0.4, 0.2, st.rim); wheelM(g, W, 0.24, -0.5, 0.24, -0.4, 0.2, st.rim); wheelM(g, W, 0.24, 0.55, 0.24, 0.4, 0.2, st.rim); wheelM(g, W, 0.24, 0.55, 0.24, -0.4, 0.2, st.rim);
        bx(g, 1.7, 0.34, 0.8, c, 0, 0.46, 0); bx(g, 0.62, 0.36, 0.74, c, 0.18, 0.82, 0); bx(g, 0.04, 0.26, 0.64, GLS, 0.5, 0.84, 0);
        bx(g, 0.04, 0.24, 0.66, GLS, -0.12, 0.84, 0); bx(g, 0.64, 0.05, 0.76, d, 0.18, 1.02, 0);
        bx(g, 0.5, 0.18, 0.76, d, -0.6, 0.66, 0); bx(g, 1.72, 0.06, 0.82, t, 0, 0.5, 0); bx(g, 0.05, 0.1, 0.5, '#ffd34d', 0.86, 0.5, 0);
      } else if (tipo === 'tractor') {
        wheelM(g, W, 0.52, -0.35, 0.52, 0.58, 0.3, st.rim); wheelM(g, W, 0.52, -0.35, 0.52, -0.58, 0.3, st.rim);
        wheelM(g, W, 0.28, 0.78, 0.28, 0.4, 0.2, st.rim); wheelM(g, W, 0.28, 0.78, 0.28, -0.4, 0.2, st.rim);
        bx(g, 1.2, 0.34, 0.5, c, 0.3, 0.6, 0); bx(g, 0.3, 0.2, 0.46, d, 0.9, 0.5, 0); bx(g, 1.2, 0.04, 0.52, t, 0.3, 0.78, 0);
        bx(g, 0.54, 0.62, 0.62, c, -0.3, 1.0, 0); bx(g, 0.04, 0.4, 0.5, GLS, -0.03, 1.02, 0); bx(g, 0.6, 0.06, 0.68, d, -0.3, 1.33, 0); bx(g, 0.06, 0.4, 0.06, KK, 0.7, 0.98, 0);
      } else if (tipo === 'rodillo') {
        var drum = new T.Mesh(geo('cz', 0.48, 1.0, 20), mat('#7f8792')); drum.position.set(0.8, 0.48, 0); g.add(drum); W.push(drum);
        bx(g, 0.1, 0.5, 1.1, KK, 0.8, 0.5, 0);
        wheelM(g, W, 0.42, -0.55, 0.42, 0.4, 0.34, st.rim); wheelM(g, W, 0.42, -0.55, 0.42, -0.4, 0.34, st.rim);
        bx(g, 1.2, 0.46, 0.8, c, -0.1, 0.68, 0); bx(g, 0.6, 0.3, 0.7, c, 0.5, 0.58, 0); bx(g, 1.22, 0.05, 0.82, t, -0.1, 0.92, 0);
        bx(g, 0.5, 0.54, 0.54, c, -0.25, 1.2, 0); bx(g, 0.04, 0.36, 0.46, GLS, 0.0, 1.22, 0); bx(g, 0.54, 0.05, 0.58, d, -0.25, 1.5, 0);
      } else if (tipo === 'acc_desmalezadora') {
        wheelM(g, [], 0.16, -0.25, 0.16, 0.5, 0.12, st.rim); wheelM(g, [], 0.16, -0.25, 0.16, -0.5, 0.12, st.rim);
        bx(g, 1.0, 0.3, 1.2, c, 0, 0.42, 0); bx(g, 1.02, 0.06, 1.22, d, 0, 0.26, 0); bx(g, 0.34, 0.12, 0.34, '#444a54', 0, 0.64, 0); bx(g, 0.7, 0.07, 0.07, KK, 0.8, 0.4, 0); bx(g, 0.1, 0.2, 0.7, d, -0.5, 0.45, 0);
      } else if (tipo === 'acc_rastra') {
        bx(g, 0.1, 0.1, 1.3, KK, 0.2, 0.52, 0); bx(g, 0.1, 0.1, 1.3, KK, -0.3, 0.52, 0); bx(g, 0.9, 0.07, 0.07, KK, 0.85, 0.46, 0); bx(g, 0.5, 0.06, 0.06, KK, 0.2, 0.58, 0); bx(g, 0.5, 0.06, 0.06, KK, -0.3, 0.58, 0);
        for (var di = -3; di <= 3; di++) {
          var dk = new T.Mesh(geo('cz', 0.3, 0.05, 14), mat('#aab1bb')); dk.rotation.y = 0.55; dk.position.set(0.2, 0.32, di * 0.18); g.add(dk);
          var dk2 = new T.Mesh(geo('cz', 0.3, 0.05, 14), mat('#aab1bb')); dk2.rotation.y = -0.55; dk2.position.set(-0.3, 0.32, di * 0.18); g.add(dk2);
        }
      } else if (tipo === 'acc_regador') {
        wheelM(g, [], 0.24, -0.1, 0.24, 0.5, 0.16, st.rim); wheelM(g, [], 0.24, -0.1, 0.24, -0.5, 0.16, st.rim);
        var tk = new T.Mesh(geo('cy', 0.4, 1.2, 16), mat(c)); tk.rotation.x = Math.PI / 2; tk.position.set(-0.05, 0.62, 0); g.add(tk);
        bx(g, 0.1, 0.1, 0.9, KK, -0.62, 0.3, 0); bx(g, 0.9, 0.07, 0.07, KK, 0.7, 0.35, 0); bx(g, 0.16, 0.08, 0.16, '#444a54', -0.05, 1.03, 0);
      } else if (tipo === 'acc_casilla') {
        bx(g, 1.3, 0.1, 0.8, KK, 0, 0.06, 0); bx(g, 1.2, 0.62, 0.78, c, 0, 0.42, 0); bx(g, 1.3, 0.07, 0.88, '#7a8190', 0, 0.78, 0);
        bx(g, 0.3, 0.22, 0.04, GLS, -0.25, 0.5, 0.4); bx(g, 0.3, 0.22, 0.04, GLS, -0.25, 0.5, -0.4); bx(g, 0.28, 0.5, 0.04, '#8a6a44', 0.35, 0.34, 0.4);
      } else if (tipo === 'acc_tanque') {
        bx(g, 1.0, 0.07, 0.7, KK, 0, 0.04, 0); bx(g, 0.9, 0.46, 0.58, c, 0, 0.32, 0); bx(g, 0.9, 0.06, 0.6, darken(c, .7), 0, 0.42, 0); bx(g, 0.16, 0.1, 0.16, '#444a54', -0.2, 0.6, 0); bx(g, 0.1, 0.28, 0.1, KK, 0.5, 0.3, 0.2); bx(g, 0.34, 0.05, 0.05, KK, 0.62, 0.2, 0.2);
      } else {
        wheelM(g, W, 0.26, -0.45, 0.26, 0.4, 0.2, st.rim); wheelM(g, W, 0.26, 0.45, 0.26, 0.4, 0.2, st.rim); wheelM(g, W, 0.26, -0.45, 0.26, -0.4, 0.2, st.rim); wheelM(g, W, 0.26, 0.45, 0.26, -0.4, 0.2, st.rim);
        bx(g, 1.5, 0.6, 0.76, c, 0, 0.6, 0); bx(g, 0.5, 0.3, 0.6, GLS, 0.3, 1.05, 0);
      }
      g.scale.setScalar(0.92);
      return { g: g, P: P, W: W };
    }

    /* ---------- actor ---------- */
    function mkActor(m, tipo, st) {
      var M = model(tipo, st), root = new T.Group(), a = { m: m, tipo: tipo, root: root, P: M.P, W: M.W, spin: 0, ry: 0, px: null, pz: null, u: 0, v: 0 };
      var sh = new T.Mesh(new T.CircleGeometry(1, 20), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2, depthWrite: false }));
      sh.rotation.x = -Math.PI / 2; sh.scale.set(1.25, 0.8, 1); sh.position.y = 0.02; root.add(sh); S.own.push(sh.material);
      var ring = new T.Mesh(new T.RingGeometry(1.3, 1.45, 28), new T.MeshBasicMaterial({ color: 0xe31b1f, side: T.DoubleSide, transparent: true, opacity: 0.95 }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.04; ring.visible = false; root.add(ring); S.own.push(ring.material, ring.geometry); a.ring = ring;
      root.add(M.g); root.userData.actor = a; a.body = M.g;
      a.at = function (x, z, mov, ang) {
        if (a.px !== null && ang === undefined) { var dx = x - a.px, dz = z - a.pz; if (dx * dx + dz * dz > 1e-6) a.th = Math.atan2(-dz, dx); }
        if (ang !== undefined) a.th = ang;
        if (a.th !== undefined) a.ry += angd(a.ry, a.th) * 0.22;
        a.px = x; a.pz = z;
        if (S.drag && S.drag.a === a && S.drag.moved) return;
        root.position.set(x, 0, z); root.rotation.y = a.ry;
        if (mov) { a.spin += 0.2; a.W.forEach(function (w) { w.rotation.z = -a.spin; }); }
      };
      var lab = document.createElement('div'); lab.className = 'ob-cd'; lab.textContent = m.codigo; ov.appendChild(lab); a.lab = lab;
      return a;
    }

    /* ---------- construcción ---------- */
    function clearAll() {
      while (world.children.length) world.remove(world.children[0]);
      S.own.forEach(function (o) { if (o.dispose) o.dispose(); }); S.own = [];
      ov.innerHTML = ''; S.slabs = []; S.actors = []; S.plots = []; S.labels = []; S.hl = null;
    }
    function ptX(P, u) { return P.wx + (u + MG) * CW; }
    function ptZ(P, v) { return P.wz + (v + MG) * CW; }
    function heap(parent, x, z, r, h) {
      var gp = new T.Group(); gp.position.set(x, 0.05, z); parent.add(gp);
      var a = new T.Mesh(geo('cone', r, h, 8), mat('#9b7b55')); a.position.y = h / 2; gp.add(a);
      var b = new T.Mesh(geo('cone', r * 0.55, h * 0.7, 7), mat('#b08d63')); b.position.set(r * 0.12, h * 0.35, 0); gp.add(b);
      return gp;
    }
    function tree(parent, x, z, k) {
      var gp = new T.Group(); gp.position.set(x, 0, z); gp.scale.setScalar(k || 1); parent.add(gp);
      var tr = new T.Mesh(geo('cy', 0.1, 0.7, 6), mat('#7a5a3a')); tr.position.y = 0.35; gp.add(tr);
      var c1 = new T.Mesh(geo('cone', 0.55, 1.1, 7), mat('#4e9a5d')); c1.position.y = 1.15; gp.add(c1);
      var c2 = new T.Mesh(geo('cone', 0.42, 0.9, 7), mat('#63b072')); c2.position.y = 1.7; gp.add(c2);
    }
    function fillBay(d) {
      var ms = d.tray.maqs;
      bay.innerHTML = '<div class="bt"><b>Sin obra</b><em>' + ms.length + '</em></div>' + (ms.length ? '<div class="bl">' + ms.map(function (m) {
        var st = estilo(m, tipoDibujo(m));
        return '<button type="button" class="bc" data-m="' + esc(m.id) + '" title="' + esc(m.nombre) + '"><i style="background:' + st.body + '"></i>' + esc(m.codigo) + '</button>';
      }).join('') + '</div><div class="bh">Arrastr\u00e1 una a su obra</div>' : '<div class="bh">Todas tienen obra. Arrastr\u00e1 una ac\u00e1 para dejarla sin obra.</div>');
    }
    function overBay(ev) { var r = bay.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; }
    var bd = null;
    bay.addEventListener('pointerdown', function (ev) {
      var b = ev.target.closest && ev.target.closest('.bc'); if (!b || ev.button > 0) return;
      bd = { id: b.getAttribute('data-m'), el: b, x0: ev.clientX, y0: ev.clientY, moved: false, ghost: null, to: null };
      try { b.setPointerCapture(ev.pointerId); } catch (e) { }
      api.hover(null);
    });
    bay.addEventListener('pointermove', function (ev) {
      if (!bd) return;
      if (!bd.moved && Math.hypot(ev.clientX - bd.x0, ev.clientY - bd.y0) < 6) return;
      if (!api.puede()) return;
      if (!bd.moved) { bd.moved = true; bd.ghost = document.createElement('div'); bd.ghost.className = 'ob-ghost'; bd.ghost.textContent = bd.el.textContent; stage.appendChild(bd.ghost); }
      var r = stage.getBoundingClientRect(); bd.ghost.style.transform = 'translate(' + (ev.clientX - r.left) + 'px,' + (ev.clientY - r.top) + 'px) translate(-50%,-50%)';
      var gp = ground(ev), to = gp && !overBay(ev) ? target(gp.x, gp.z) : null; bd.to = to;
      if (to) { S.hl.visible = true; S.hl.scale.set(to.w, 1, to.h); S.hl.position.set(to.x + to.w / 2, 0.12, to.z + to.h / 2); } else if (S.hl) S.hl.visible = false;
    });
    function bayFin(ev) {
      if (!bd) return; var D = bd; bd = null;
      try { D.el.releasePointerCapture(ev.pointerId); } catch (e) { }
      if (D.ghost) D.ghost.remove(); if (S.hl) S.hl.visible = false;
      if (!D.moved) { api.click(D.id); return; }
      if (D.to) api.drop(D.id, D.to.id);
    }
    bay.addEventListener('pointerup', bayFin); bay.addEventListener('pointercancel', bayFin);
    function addLabel(html, cls) { var e = document.createElement('div'); e.className = cls; e.innerHTML = html; ov.appendChild(e); return e; }

    function build(d, pinned) {
      clearAll(); S.d = d; S.pinned = pinned;
      var MAXW = 44, GAPW = 2.6, rx = 0, rz = 0, rh = 0, tw = 0;
      d.plots.forEach(function (P) {
        P.wp = workPlan(P.maqs.map(function (m, i) { var h = -1; if (m.acopladoA) P.maqs.forEach(function (x, j) { if (x.id === m.acopladoA) h = j; }); return { id: i, tipo: tipoDibujo(m), host: h >= 0 ? h : undefined }; })); P.side = P.wp.s; P.sz = (P.side + 2 * MG) * CW;
        if (rx > 0 && rx + P.sz > MAXW) { rz += rh + GAPW + 1.6; rx = 0; rh = 0; }
        P.wx = rx; P.wz = rz; rx += P.sz + GAPW; rh = Math.max(rh, P.sz); tw = Math.max(tw, rx - GAPW);
      });
      var W = Math.max(tw, 12);
      S.ext = { x0: 0, z0: 0, x1: W, z1: rz + rh };
      var key = d.plots.map(function (p) { return p.id + ':' + p.side; }).join('|');
      var sc0 = stageColor(); scene.background.set(sc0); var gm = new T.MeshBasicMaterial({ color: sc0 }); S.own.push(gm); var ground = new T.Mesh(geo('b', 400, 0.2, 400), gm); ground.position.set(W / 2, -0.7, S.ext.z1 / 2); world.add(ground);

      d.plots.forEach(function (P) {
        var A = P.area, g = new T.Group(); g.position.set(P.wx, 0, P.wz); world.add(g); P.g = g; S.plots.push(P);
        var side = new T.MeshLambertMaterial({ color: A.lado }), side2 = new T.MeshLambertMaterial({ color: A.lado2 }), top = new T.MeshLambertMaterial({ color: A.piso });
        S.own.push(side, side2, top);
        var slab = new T.Mesh(geo('b', P.sz, 0.55, P.sz), [side2, side, top, side, side2, side]); slab.position.set(P.sz / 2, -0.275, P.sz / 2); slab.userData.plot = P; g.add(slab); S.slabs.push(slab);
        var lines = [], k, nc = P.side + 2 * MG;
        for (k = 0; k <= nc; k++) { lines.push(k * CW, 0.012, 0, k * CW, 0.012, P.sz, 0, 0.012, k * CW, P.sz, 0.012, k * CW); }
        var lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(lines, 3));
        var lm = new T.LineBasicMaterial({ color: A.borde, transparent: true, opacity: 0.7 }); S.own.push(lg, lm); g.add(new T.LineSegments(lg, lm));
        var wk = P.side * CW + 0.3; bx(g, wk, 0.07, wk, '#cdb48d', P.sz / 2, 0.035, P.sz / 2);
        /* paisaje: río por el fondo y árboles en los bordes */
        var m0 = MG * CW;
        var rv = new T.MeshLambertMaterial({ color: '#5fb0e8', transparent: true, opacity: 0.92 }); S.own.push(rv);
        var riv = new T.Mesh(geo('b', P.sz - 0.5, 0.08, m0 * 0.62), rv); riv.position.set(P.sz / 2, 0.03, m0 * 0.5); g.add(riv);
        bx(g, P.sz - 0.5, 0.05, 0.14, '#e9dfc4', P.sz / 2, 0.04, m0 * 0.5 - m0 * 0.31 - 0.07); bx(g, P.sz - 0.5, 0.05, 0.14, '#e9dfc4', P.sz / 2, 0.04, m0 * 0.5 + m0 * 0.31 + 0.07);
        P.ripples = [];
        for (k = 0; k < 7; k++) { var rp = bx(g, 1.1, 0.03, 0.07, '#d8f0ff', 0, 0.085, m0 * 0.5 + ((k % 3) - 1) * m0 * 0.18); rp.userData.k = k; P.ripples.push(rp); }
        var tk = 0;
        function tr1(x, z, sc) { tk++; tree(g, x + ((tk * 37) % 7 - 3) * 0.07, z + ((tk * 53) % 7 - 3) * 0.07, sc * (0.85 + (tk % 4) * 0.1)); }
        for (k = 0; k * 2.6 + m0 + 1.2 < P.sz - 0.6; k++) { var zz = m0 + 1.4 + k * 2.6; tr1(m0 * 0.45, zz, 1); tr1(P.sz - m0 * 0.45, zz + 0.9, 0.95); }
        for (k = 0; k * 3 + 2.4 < P.sz - 2; k++) tr1(2.4 + k * 3, P.sz - m0 * 0.5, 0.9);
        tr1(0.7, 0.7, 1.1); tr1(P.sz - 0.7, 0.7, 1.05);
        try { plan(P); } catch (e) { if (window.console) console.error('Obras 3D plan', e); }
        var lb = addLabel('<i style="background:' + A.acento + '"></i><b>' + esc((P.codigo + ' · ' + P.nombre).slice(0, 30)) + '</b><em>' + P.maqs.length + '</em>' + (d.puede ? '<button type="button" class="x" title="Quitar esta obra del gráfico" aria-label="Quitar esta obra del gráfico">×</button>' : ''), 'ob-pl');
        lb.style.setProperty('--ac', A.acento); lb.setAttribute('data-plot', P.id);
        S.labels.push({ el: lb, x: P.wx + P.sz * 0.5, z: P.wz, dy: 0, up: true, plot: P });
        var xb = lb.querySelector('.x'); if (xb) xb.addEventListener('click', function (e) { e.stopPropagation(); api.hide(P.id); });
        lb.addEventListener('pointerenter', function (e) { api.labelHover(P.id, e); });
        lb.addEventListener('pointermove', function (e) { api.labelHover(P.id, e); });
        lb.addEventListener('pointerleave', function () { api.hover(null); });
      });
      /* máquinas sin obra: tabla chica en una esquina */
      S.tray = d.tray; fillBay(d);
      /* resaltado al arrastrar */
      var hm = new T.MeshBasicMaterial({ color: 0xe31b1f, transparent: true, opacity: 0.18, depthWrite: false }); S.own.push(hm);
      S.hl = new T.Mesh(geo('b', 1, 0.2, 1), hm); S.hl.visible = false; world.add(S.hl);
      S.actors.forEach(function (a) { a.ring.visible = S.pinned === a.m.id; });
      S.size = [0, 0]; resize();
      if (S.key !== key) { S.key = key; fit(); }
    }

    /* ---------- guion de trabajo ---------- */
    var KF = [[0, 0.35, -1.0, -0.6, 0, 0], [0.3, -0.2, -0.3, 0.3, 0, 0], [0.45, -0.3, -0.05, -0.9, 1, 0], [0.62, 0.6, -0.6, -0.9, 1, 1], [0.8, 0.5, -0.5, 0.7, 0, 1], [1, 0.35, -1.0, -0.6, 0, 0]];
    function pose(p) {
      for (var k = 1; k < KF.length; k++) if (p <= KF[k][0]) {
        var a0 = KF[k - 1], a1 = KF[k], f = ease((p - a0[0]) / (a1[0] - a0[0]));
        return [lerp(a0[1], a1[1], f), lerp(a0[2], a1[2], f), lerp(a0[3], a1[3], f), (p > 0.44 && p < 0.74) ? 1 : 0, lerp(a0[5], a1[5], f)];
      }
      return [0.35, -1, -0.6, 0, 0];
    }
    function plan(P) {
      var wp = P.wp, g = P.g, par = g.parent, fe = []; P.acts = [];
      P.maqs.forEach(function (m, i) {
        var tp = tipoDibujo(m), a = mkActor(m, tp, estilo(m, tp)); a.P0 = P; world.add(a.root); S.actors.push(a); P.acts.push(a);
        var act = wp.acts[i]; if (!act) return;
        a.upd = function (t) {
          var q = act(t), pp = a.P;
          a.at(ptX(P, q.u), ptZ(P, q.v), q.mov, Math.atan2(-q.hv, q.hu));
          if (tp === 'camion') { pp.bed.rotation.z = 0.5 * q.bed; pp.load.visible = q.lvl > 0.03; pp.load.scale.y = Math.max(0.05, q.lvl); pp.load.position.y = 0.1 + 0.18 * q.lvl; }
          else if (tp === 'excavadora' && q.pose) { pp.boom.rotation.z = q.pose.boom; pp.stick.rotation.z = q.pose.stick; pp.bucket.rotation.z = q.pose.bucket; pp.dirt.visible = !!q.pose.dirt; pp.up.rotation.y = q.swing; }
          else if (tp === 'pala') { pp.lift.rotation.z = q.lift; pp.tilt.rotation.z = -q.tilt; pp.dirt.visible = !!q.dirt; }
          else if (tp === 'moto' || tp === 'rodillo') { a.body.position.y = q.shake ? Math.sin(t * 55) * 0.012 : 0; if (pp.blade) pp.blade.rotation.x = Math.sin(t * 3) * 0.03; }
        };
      });
      wp.feats.forEach(function (f) {
        if (f.k === 'pit') {
          var pg = new T.Group(); pg.position.set(ptX(P, f.u), 0.07, ptZ(P, f.v)); par.add(pg);
          pg.add(new T.Mesh(geo('cy', 0.95, 0.04, 20), mat('#9c8058'))); pg.add(new T.Mesh(geo('cy', 0.74, 0.07, 20), mat('#5d4630'))); pg.add(new T.Mesh(geo('cy', 0.44, 0.09, 16), mat('#473524')));
          fe.push(function (t) { var k = f.fn(t); pg.scale.set(k, 1, k); });
        } else if (f.k === 'heap') {
          var hp = heap(par, ptX(P, f.u), ptZ(P, f.v), f.r, f.h);
          fe.push(function (t) { var k = f.fn(t); hp.scale.set(k, k, k); });
        } else if (f.k === 'camp') {
          var cw = (f.u1 - f.u0) * CW, cd = (f.v1 - f.v0) * CW, cx = ptX(P, (f.u0 + f.u1) / 2), cz = ptZ(P, (f.v0 + f.v1) / 2), pad = new T.Mesh(geo('b', cw, 0.04, cd), mat('#cfc3a4')); pad.position.set(cx, 0.06, cz); par.add(pad);
          var nx = Math.max(2, Math.round(cw / 0.8)), nz = Math.max(2, Math.round(cd / 0.8)), k2;
          function post(x, z) { var p = new T.Mesh(geo('b', 0.07, 0.4, 0.07), mat('#7a5a3a')); p.position.set(x, 0.26, z); par.add(p); }
          for (k2 = 0; k2 <= nx; k2++) { post(cx - cw / 2 + cw * k2 / nx, cz + cd / 2); post(cx - cw / 2 + cw * k2 / nx, cz - cd / 2); }
          for (k2 = 1; k2 < nz; k2++) { post(cx - cw / 2, cz - cd / 2 + cd * k2 / nz); post(cx + cw / 2, cz - cd / 2 + cd * k2 / nz); }
          var rl1 = new T.Mesh(geo('b', cw, 0.04, 0.04), mat('#e9dfc4')); rl1.position.set(cx, 0.4, cz + cd / 2); par.add(rl1);
          var rl2 = new T.Mesh(geo('b', cw, 0.04, 0.04), mat('#e9dfc4')); rl2.position.set(cx, 0.4, cz - cd / 2); par.add(rl2);
          var mast = new T.Mesh(geo('b', 0.05, 0.9, 0.05), mat('#6b717b')); mast.position.set(cx - cw / 2 + 0.1, 0.5, cz - cd / 2 - 0.1); par.add(mast);
          var flag = new T.Mesh(geo('b', 0.36, 0.2, 0.02), mat('#e31b1f')); flag.position.set(cx - cw / 2 + 0.3, 0.84, cz - cd / 2 - 0.1); par.add(flag);
        } else if (f.k === 'trail') {
          var tm = new T.MeshBasicMaterial({ color: f.color, transparent: true, opacity: 0, depthWrite: false }); S.own.push(tm);
          var trl = new T.Mesh(geo('b', 1, 0.03, 0.62), tm); trl.position.y = 0.085; par.add(trl);
          fe.push(function (t) { var r = f.fn(t); trl.scale.x = Math.max(0.01, r.len * CW); trl.position.x = ptX(P, f.u0) + r.len * CW / 2; trl.position.z = ptZ(P, f.v); tm.opacity = f.op * r.op; });
        }
      });
      P.dumpAnim = function (t) { fe.forEach(function (f) { f(t); }); if (P.ripples) P.ripples.forEach(function (r) { r.position.x = ((t * 0.5 + r.userData.k * (P.sz / 7)) % (P.sz - 1.6)) + 0.8; }); };
    }

    /* ---------- cámara ---------- */
    function fit() {
      if (!S.ext) return;
      var cx = (S.ext.x0 + S.ext.x1) / 2, cz = (S.ext.z0 + S.ext.z1) / 2, w = S.ext.x1 - S.ext.x0, h = S.ext.z1 - S.ext.z0;
      var R = Math.hypot(w, h) / 2 * 0.6, asp = camera.aspect || 1, fov = camera.fov * Math.PI / 180;
      var dist = R / Math.sin(fov / 2 * Math.min(1, asp * 0.9));
      var dir = new T.Vector3(1, 0.85, 1).normalize();
      controls.target.set(cx, 0, cz); camera.position.set(cx, 0, cz).addScaledVector(dir, dist);
      camera.near = Math.max(1, dist / 40); camera.far = dist * 6; camera.updateProjectionMatrix(); controls.update();
    }
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
      if (S.size[0] === w && S.size[1] === h) return; S.size = [w, h];
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    if (window.ResizeObserver) new ResizeObserver(function () { var f = !S.size[0]; resize(); if (f) fit(); }).observe(stage);
    zoom.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var z = b.getAttribute('data-z');
      if (z === 'home') { fit(); return; }
      var off = camera.position.clone().sub(controls.target), k = z === 'in' ? 0.8 : 1.25; off.multiplyScalar(k);
      var l = off.length(); if (l < 8 || l > 400) return; camera.position.copy(controls.target).add(off); controls.update();
    });

    /* ---------- interacción ---------- */
    function ndc(ev) { var r = cv.getBoundingClientRect(); return { x: ((ev.clientX - r.left) / r.width) * 2 - 1, y: -((ev.clientY - r.top) / r.height) * 2 + 1 }; }
    function pick(ev) {
      var p = ndc(ev); ray.setFromCamera(p, camera);
      var hits = ray.intersectObjects(S.actors.map(function (a) { return a.root; }), true);
      for (var i = 0; i < hits.length; i++) { var o = hits[i].object; while (o && !(o.userData && o.userData.actor)) o = o.parent; if (o) return o.userData.actor; }
      return null;
    }
    function ground(ev) { var p = ndc(ev); ray.setFromCamera(p, camera); return ray.ray.intersectPlane(plane, V) ? V.clone() : null; }
    function target(x, z) {
      for (var i = 0; i < S.plots.length; i++) { var P = S.plots[i]; if (x >= P.wx && x <= P.wx + P.sz && z >= P.wz && z <= P.wz + P.sz) return { id: P.id, x: P.wx, z: P.wz, w: P.sz, h: P.sz }; }
      return null;
    }
    cv.addEventListener('pointerdown', function (ev) {
      if (ev.button > 0) return;
      var a = pick(ev); if (!a) { S.bg = { x: ev.clientX, y: ev.clientY }; return; }
      S.hover = a; S.bg = null;
      ev.stopImmediatePropagation();
      S.drag = { a: a, x0: ev.clientX, y0: ev.clientY, moved: false, to: null }; controls.enabled = false;
      try { cv.setPointerCapture(ev.pointerId); } catch (e) { }
      api.hover(null);
    }, true);
    cv.addEventListener('pointermove', function (ev) {
      var D = S.drag;
      if (D) {
        if (!D.moved && Math.hypot(ev.clientX - D.x0, ev.clientY - D.y0) < 6) return;
        if (!api.puede()) return;
        D.moved = true; cv.style.cursor = 'grabbing';
        var gp = ground(ev); if (!gp) return;
        D.a.root.position.set(gp.x, 0.35, gp.z); D.a.root.rotation.y = D.a.ry;
        var onBay = overBay(ev), to = onBay ? { id: '' } : target(gp.x, gp.z); D.to = to; bay.classList.toggle('hot', onBay);
        if (to && !onBay) { S.hl.visible = true; S.hl.scale.set(to.w, 1, to.h); S.hl.position.set(to.x + to.w / 2, 0.12, to.z + to.h / 2); } else S.hl.visible = false;
        return;
      }
      var h = pick(ev); S.hover = h; cv.style.cursor = h ? 'grab' : '';
      api.hover(h ? h.m : null, ev);
    });
    function fin(ev) {
      var D = S.drag; if (!D) return; S.drag = null; controls.enabled = true; cv.style.cursor = '';
      try { cv.releasePointerCapture(ev.pointerId); } catch (e) { }
      if (S.hl) S.hl.visible = false; bay.classList.remove('hot');
      if (!D.moved) { api.click(D.a.m.id); return; }
      api.drop(D.a.m.id, D.to ? D.to.id : null);
    }
    cv.addEventListener('pointerup', fin); cv.addEventListener('pointercancel', fin);
    cv.addEventListener('pointerup', function (ev) {
      var B = S.bg; S.bg = null; if (!B || S.drag) return;
      if (Math.hypot(ev.clientX - B.x, ev.clientY - B.y) > 5) return;
      var p = ndc(ev); ray.setFromCamera(p, camera);
      var hits = ray.intersectObjects(S.slabs, false), pl = hits.length && hits[0].object.userData.plot;
      S.hover = null; S.selPlot = pl ? (S.selPlot === pl.id ? null : pl.id) : null;
      if (api.plotSel) api.plotSel(S.selPlot);
    });
    cv.addEventListener('pointerleave', function () { if (!S.drag) { S.hover = null; api.hover(null); } });

    /* ---------- cuadro a cuadro ---------- */
    function frame(t) {
      if (!S.d) return;
      resize();
      S.plots.forEach(function (P) { if (P.dumpAnim) P.dumpAnim(t); });
      S.actors.forEach(function (a) { if (a.upd) a.upd(t); });
      controls.update(); renderer.render(scene, camera);
      var w = S.size[0], h = S.size[1];
      S.actors.forEach(function (a) {
        V.set(a.root.position.x, 1.9, a.root.position.z).project(camera);
        a.lab.style.transform = 'translate(' + ((V.x * 0.5 + 0.5) * w).toFixed(1) + 'px,' + ((-V.y * 0.5 + 0.5) * h).toFixed(1) + 'px) translate(-50%,-100%)';
        a.lab.style.display = (V.z > 1 || !(S.hover === a || (S.drag && S.drag.a === a && S.drag.moved))) ? 'none' : '';
      });
      S.labels.forEach(function (L) {
        V.set(L.x, 0, L.z).project(camera);
        L.el.style.transform = 'translate(' + ((V.x * 0.5 + 0.5) * w).toFixed(1) + 'px,' + ((-V.y * 0.5 + 0.5) * h + (L.up ? -48 : 12)).toFixed(1) + 'px) translate(-50%,' + (L.up ? '-100%' : '0') + ')';
        L.el.style.display = (V.z > 1 || (L.plot && L.plot.id !== S.selPlot)) ? 'none' : '';
      });
    }
    return {
      build: function (d, pinned) { emptyEl.hidden = true; cv.style.visibility = ''; ov.style.visibility = ''; hint.hidden = false; build(d, pinned); },
      empty: function (msg) { S.d = null; clearAll(); emptyEl.hidden = false; emptyEl.textContent = msg; cv.style.visibility = 'hidden'; hint.hidden = true; },
      plot: function (pid) { S.selPlot = pid; },
      select: function (mid) { S.pinned = mid; S.actors.forEach(function (a) { a.ring.visible = mid === a.m.id; }); },
      frame: frame
    };
  }

  function mount(host, getD) {
    var wrap = document.createElement('div'); wrap.className = 'ob';
    var st = document.createElement('style'); st.textContent = CSS;
    wrap.appendChild(st);
    var bar = document.createElement('div'); bar.className = 'ob-bar'; wrap.appendChild(bar);
    var hidBox = document.createElement('div'); hidBox.className = 'ob-hid'; hidBox.hidden = true; wrap.appendChild(hidBox);
    var stage = document.createElement('div'); stage.className = 'ob-stage'; wrap.appendChild(stage);
    var panelEl = document.createElement('section'); panelEl.className = 'ob-panel'; panelEl.hidden = true; panelEl.setAttribute('aria-live', 'polite'); wrap.appendChild(panelEl);
    host.appendChild(wrap);
    var tip = null, pinned = null, drag = null, raf = 0, T0 = performance.now(), gl = null, panelMode = '', plotSelId = null, hoverKey = '', adding = false, addTxt = '', glMsg = '';

    function datos() {
      var D = getD(), S = D.S;
      var cmp = function (a, b) { return String(a.codigo).localeCompare(String(b.codigo), 'es', { numeric: true }); };
      var todas = S.centros.filter(function (c) { return c.tipo === 'obra' && c.activo !== false && !c.fin; }).sort(cmp);
      var obras = todas.filter(function (o) { return !o.ocultaMapa; }), ocultas = todas.filter(function (o) { return o.ocultaMapa; });
      var maqs = S.centros.filter(function (c) { return c.tipo === 'maquina' && c.activo !== false; }).sort(cmp);
      var ids = {}; obras.forEach(function (o) { ids[o.id] = true; });
      var plots = obras.map(function (o, i) { return { id: o.id, c: o, nombre: o.nombre, codigo: o.codigo, maqs: [], area: AREAS[i % AREAS.length] }; });
      var tray = { id: '', c: null, tray: true, nombre: 'Sin obra', codigo: 'DEP', maqs: [] };
      var byId = {}; plots.forEach(function (p) { byId[p.id] = p; }); byId[''] = tray;
      maqs.forEach(function (m) { (byId[m.obraActual && ids[m.obraActual] ? m.obraActual : ''] || tray).maqs.push(m); });
      return { D: D, S: S, plots: plots, ocultas: ocultas, tray: tray, byId: byId, maqs: maqs, puede: !!(D.maq && D.maq.puede) };
    }
    function maqObra(M, d) { return M.obraActual && d.byId[M.obraActual] && d.byId[M.obraActual].c ? d.byId[M.obraActual].c : null; }

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
    function previewSVG(M) {
      var tipo = tipoDibujo(M), stl = estilo(M, tipo);
      return '<svg viewBox="0 0 100 70" width="92" height="64">' + dibujo(tipo, stl) + '</svg>';
    }
    function panelHTML(M, d) {
      var r = stats(M, d), S = d.S, u = r.u, tipo = tipoDibujo(M), stl = estilo(M, tipo);
      var sub = [M.marca, M.modelo, M.anio ? M.anio : '', M.patente].filter(Boolean).join(' · ');
      var h = '<button type="button" class="x" aria-label="Cerrar">×</button>' +
        '<div class="pn-head"><div class="pn-ic">' + previewSVG(M) + '</div><div><h3>' + esc(M.codigo) + ' · ' + esc(M.nombre) + '</h3>' +
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
      h += '</div><div>';
      if (d.puede) {
        h += '<label for="ob-mv">Mover a</label><select id="ob-mv"><option value=""' + (!r.obra ? ' selected' : '') + '>Sin obra (playa)</option>' + d.plots.map(function (p) {
          return '<option value="' + esc(p.id) + '"' + (r.obra && r.obra.id === p.id ? ' selected' : '') + '>' + esc(p.codigo + ' · ' + p.nombre) + '</option>';
        }).join('') + '</select>';
        var tpM = tipoDibujo(M);
        if ((tpM === 'acc_desmalezadora' || tpM === 'acc_rastra' || tpM === 'acc_regador') && r.obra && d.D.maq.accesorio) {
          var hs = (d.byId[r.obra.id] ? d.byId[r.obra.id].maqs : []).filter(function (x) { var t = tipoDibujo(x); return x.id !== M.id && (t === 'tractor' || t === 'camioneta'); });
          h += '<label for="ob-hk" style="margin-top:8px">Enganchado a</label><select id="ob-hk"><option value="">Sin enganchar</option>' + hs.map(function (x) { return '<option value="' + esc(x.id) + '"' + (M.acopladoA === x.id ? ' selected' : '') + '>' + esc(x.codigo + ' \u00b7 ' + x.nombre) + '</option>'; }).join('') + '</select>' + (hs.length ? '' : '<div class="none" style="border:0;padding:4px 0 0">No hay tractor ni camioneta en esta obra.</div>');
        }
      } else h += '<div class="none" style="border:0;padding:0">Solo el dueño y el ingeniero pueden mover máquinas.</div>';
      h += '</div><div><div class="sec">Aspecto en la Oficina</div>';
      if (d.puede) {
        h += '<label for="ob-fm">Forma</label><select id="ob-fm">' + FORMAS.map(function (f) { return '<option value="' + f[0] + '"' + ((M.formaMaq || '') === f[0] ? ' selected' : '') + '>' + esc(f[1]) + '</option>'; }).join('') + '</select>' +
          '<label style="margin-top:8px">Color</label><div class="sw"><button type="button" class="auto' + (!M.colorMaq ? ' on' : '') + '" data-color="">' + (stl.brand ? 'Según marca (' + esc(stl.brand) + ')' : 'Original') + '</button>' +
          COLORES.map(function (c) { return '<button type="button" data-color="' + c + '" class="' + (M.colorMaq === c ? 'on' : '') + '" style="background:' + c + '" aria-label="Color ' + c + '"></button>'; }).join('') +
          '<input type="color" id="ob-cc" value="' + (M.colorMaq || stl.body) + '" aria-label="Otro color"></div>';
      } else h += '<div class="none" style="border:0;padding:0">' + (stl.brand ? 'Estilo de ' + esc(stl.brand) + '.' : 'Estilo estándar.') + '</div>';
      if (d.D.maq.editar && d.D.maq.puedeEditar) h += '<button type="button" class="ob-edit" data-edit="1">Editar datos de la máquina</button>';
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
    function hideTip() { hoverKey = ''; if (tip) { tip.remove(); tip = null; } }

    /* ---------- escena ---------- */
    function pt(P, u, v) { return [P.x + (u - v) * HX, P.y + (u + v) * HY]; }
    function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
    function cesc(s) { return (window.CSS && window.CSS.escape) ? window.CSS.escape(s) : String(s).replace(/"/g, '\\"'); }
    function tree(x, y, k) {
      return '<g transform="translate(' + x + ',' + y + ') scale(' + (k || 1) + ')"><ellipse cx="0" cy="1" rx="7" ry="3" fill="rgba(0,0,0,.14)"/><rect x="-1.5" y="-8" width="3" height="9" fill="#7a5a3a"/><circle cx="0" cy="-15" r="9" fill="#4e9a5d"/><circle cx="-3" cy="-17" r="5" fill="#63b072"/></g>';
    }
    function actorEl(m, cx, cy, sel) {
      var tipo = tipoDibujo(m), stl = estilo(m, tipo);
      return '<g class="ob-m' + (sel ? ' sel' : '') + '" data-m="' + esc(m.id) + '" transform="translate(' + (cx - 50 * SC).toFixed(1) + ',' + (cy - 60 * SC).toFixed(1) + ') scale(' + SC + ')" tabindex="0" role="button" aria-label="' + esc(m.codigo + ' ' + m.nombre) + '">' +
        '<ellipse cx="50" cy="63" rx="40" ry="6" fill="rgba(0,0,0,.18)"/><g data-p="face">' + dibujo(tipo, stl) + '</g>' +
        '<rect class="ob-ring" x="2" y="14" width="96" height="56" rx="8"/>' +
        '<g transform="translate(50,76)"><rect x="-17" y="-9" width="34" height="14" rx="7" fill="#fff" opacity=".95"/><text x="0" y="1.5" text-anchor="middle" font-size="10" font-weight="700" fill="#1d2026" font-family="inherit">' + esc(m.codigo) + '</text></g></g>';
    }
    function heap(id) {
      return '<g id="' + id + '"><path d="M-27 0 Q-15 -22 0 -26 Q15 -22 27 0z" fill="#9b7b55"/><path d="M-14 -2 Q-4 -18 3 -20 Q10 -14 15 -2z" fill="#b08d63"/></g>';
    }
    function plotSVG(P) {
      var side = P.side, h = '', A = P.area, n = P.maqs.length;
      var T = pt(P, 0, 0), R = pt(P, side, 0), B = pt(P, side, side), Lf = pt(P, 0, side);
      h += '<g class="ob-plot" data-plot="' + esc(P.id) + '">';
      h += '<polygon points="' + pts([Lf, B, [B[0], B[1] + SLAB], [Lf[0], Lf[1] + SLAB]]) + '" fill="' + A.lado + '"/>';
      h += '<polygon points="' + pts([B, R, [R[0], R[1] + SLAB], [B[0], B[1] + SLAB]]) + '" fill="' + A.lado2 + '"/>';
      h += '<polygon class="ob-top" points="' + pts([T, R, B, Lf]) + '" fill="' + A.piso + '" stroke="' + A.borde + '" stroke-width="1.5"/>';
      for (var k = 1; k < side; k++) {
        h += '<polyline points="' + pts([pt(P, k, 0), pt(P, k, side)]) + '" fill="none" stroke="' + A.borde + '" stroke-width="1" opacity=".5"/>';
        h += '<polyline points="' + pts([pt(P, 0, k), pt(P, side, k)]) + '" fill="none" stroke="' + A.borde + '" stroke-width="1" opacity=".5"/>';
      }
      var a = 0.32;
      h += '<polygon points="' + pts([pt(P, a, a), pt(P, side - a, a), pt(P, side - a, side - a), pt(P, a, side - a)]) + '" fill="#cdb48d" stroke="#b79d74" stroke-width="1.2"/>';
      h += '<polygon points="' + pts([pt(P, 0.05, 0.05), pt(P, side - 0.05, 0.05), pt(P, side - 0.05, 0.27), pt(P, 0.05, 0.27)]) + '" fill="#6fb8ea"/><polygon points="' + pts([pt(P, 0.3, 0.12), pt(P, side * 0.45, 0.12), pt(P, side * 0.45, 0.17), pt(P, 0.3, 0.17)]) + '" fill="#cfeaff" opacity=".7"/>';
      h += '<g class="fx" id="fx-' + P.idx + '"></g>';
      var tl = pt(P, 0.1, 0.1), tr = pt(P, side - 0.1, 0.1);
      h += '<g class="ob-deco">' + tree(tl[0] + 4, tl[1] + 8, 0.9) + tree(tr[0] - 4, tr[1] + 8, 0.8) + '</g>';
      h += '<g class="act" id="act-' + P.idx + '">';
      P.maqs.forEach(function (m, i) {
        var col = i % side, row = Math.floor(i / side), c = pt(P, col + 0.5, row + 0.5);
        h += actorEl(m, c[0], c[1], pinned === m.id);
      });
      h += '</g>';
      var lb = pt(P, side / 2, 0), lbl = (P.codigo + ' · ' + P.nombre).slice(0, 30);
      var wlab = Math.max(100, lbl.length * 6.6 + 44 + (P.puedeOcultar ? 22 : 0));
      h += '<g class="ob-lab" transform="translate(' + lb[0].toFixed(1) + ',' + (lb[1] - 30) + ')"><rect x="' + (-wlab / 2) + '" y="0" width="' + wlab + '" height="22" rx="11" fill="#1d2026" stroke="' + A.acento + '" stroke-width="2"/><circle cx="' + (-wlab / 2 + 12) + '" cy="11" r="4.5" fill="' + A.acento + '"/><text x="' + (P.puedeOcultar ? -10 : 3) + '" y="15" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff" font-family="inherit">' + esc(lbl) + '</text><text x="' + (wlab / 2 - (P.puedeOcultar ? 40 : 18)) + '" y="15" text-anchor="middle" font-size="10.5" font-weight="700" fill="#ffd34d" font-family="inherit">' + n + '</text></g>';
      if (P.puedeOcultar) h += '<g class="ob-hide" data-hide="' + esc(P.id) + '" transform="translate(' + (lb[0] + wlab / 2 - 15).toFixed(1) + ',' + (lb[1] - 19) + ')"><title>Quitar esta obra del gráfico</title><circle r="8"/><path d="M-3.2 -3.2 L3.2 3.2 M3.2 -3.2 L-3.2 3.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></g>';
      return h + '</g>';
    }
    function layout(d, maxW) {
      var rowX = 0, rowY = 0, rowH = 0, tw = 0;
      d.plots.forEach(function (P, i) {
        var n = P.maqs.length;
        P.idx = i; P.puedeOcultar = d.puede;
        P.side = n ? Math.max(4, Math.ceil(Math.sqrt(n)) + 1) : 4;
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
        h += actorEl(m, T.bx + 20 + STEP / 2 + col * STEP, T.by + 40 + row * 80 + 50, pinned === m.id);
      });
      return h + '</g>';
    }

    /* ---------- trabajo en obra: guion de cada máquina ---------- */
    function planPlot(P, root) {
      var s = P.side, fx = root.querySelector('#fx-' + P.idx), layer = root.querySelector('#act-' + P.idx);
      P.acts = []; P.layer = layer; P.sig = '';
      var by = {};
      P.maqs.forEach(function (m) {
        var el = layer.querySelector('[data-m="' + cesc(m.id) + '"]');
        if (!el) return;
        var a = { m: m, tipo: tipoDibujo(m), el: el, u: 0, v: 0, face: 1, spin: 0, parts: {} };
        ['arm', 'stick', 'bucket', 'dirt', 'lift', 'tilt', 'bed', 'load', 'blade', 'bob', 'face'].forEach(function (k) { a.parts[k] = el.querySelector('[data-p="' + k + '"]'); });
        a.wheels = [].slice.call(el.querySelectorAll('[data-p="wh"]'));
        P.acts.push(a); var bt = String(a.tipo).indexOf('acc_') === 0 ? 'generico' : a.tipo; (by[bt] = by[bt] || []).push(a);
      });
      var ex = by.excavadora || [], tr = by.camion || [], ld = by.pala || [], mg = by.moto || [], rl = by.rodillo || [], tc = by.tractor || [], pk = by.camioneta || [], gn = by.generico || [];
      var fxs = '', I = P.idx, hasTrucks = tr.length > 0;
      var DU = s - 0.65, DV = s - 0.65;
      var cap = Math.max(1, Math.floor((s - 2) / 1.5) + 1), spots = [];
      ex.forEach(function (a, i) {
        var col = i % cap, row = Math.floor(i / cap);
        a.eu = 0.65 + col * 1.55; a.ev = 1.4 + row * 1.1; a.pit = { u: a.eu + 0.62, v: a.ev }; a.group = [];
        spots.push({ u: a.eu + 0.62, v: a.ev - 0.72, ex: a, group: [] });
      });
      if (!spots.length && hasTrucks) spots.push({ u: 1.5, v: 0.85, ex: null, src: true, group: [] });
      tr.forEach(function (a, i) { var sp = spots[i % spots.length]; a.spot = sp; sp.group.push(a); if (sp.ex) sp.ex.group.push(a); });
      ex.forEach(function (a, i) {
        var q = pt(P, a.pit.u, a.pit.v), x = q[0].toFixed(1), y = q[1].toFixed(1);
        fxs += '<g id="pit-' + I + '-' + i + '" data-cx="' + x + '" data-cy="' + y + '"><ellipse cx="' + x + '" cy="' + y + '" rx="27" ry="13.5" fill="#9c8058"/><ellipse cx="' + x + '" cy="' + (q[1] + 1.5).toFixed(1) + '" rx="21" ry="10" fill="#5d4630"/><ellipse cx="' + x + '" cy="' + (q[1] + 3).toFixed(1) + '" rx="13" ry="6" fill="#473524"/></g>';
        var q2 = pt(P, a.pit.u + 0.1, a.pit.v + 0.62);
        fxs += '<g transform="translate(' + q2[0].toFixed(1) + ',' + q2[1].toFixed(1) + ')">' + heap('mh-' + I + '-' + i) + '</g>';
      });
      spots.forEach(function (sp) { if (sp.src) { var q = pt(P, sp.u - 0.35, sp.v + 0.45); fxs += '<g transform="translate(' + q[0].toFixed(1) + ',' + q[1].toFixed(1) + ')">' + heap('sh-' + I) + '</g>'; } });
      if (hasTrucks) { var qd = pt(P, DU + 0.05, DV + 0.18); fxs += '<g transform="translate(' + qd[0].toFixed(1) + ',' + qd[1].toFixed(1) + ')">' + heap('dh-' + I) + '</g>'; }
      var lanes = []; [ld, mg, rl].forEach(function (g) { if (g.length) lanes.push(g); });
      lanes.forEach(function (g, li) {
        var v = s - 0.58 - li * 0.78; if (v < 2.5) v = 2.5 + (li % 2) * 0.4;
        g.forEach(function (a, k) { a.lane = v; a.ph = k * 0.5; });
        if (g === ld) {
          var q1 = pt(P, 0.75, v + 0.05), q2 = pt(P, s - 0.7, v + 0.05);
          fxs += '<g transform="translate(' + q1[0].toFixed(1) + ',' + q1[1].toFixed(1) + ')">' + heap('lh1-' + I) + '</g><g transform="translate(' + q2[0].toFixed(1) + ',' + q2[1].toFixed(1) + ')">' + heap('lh2-' + I) + '</g>';
        } else {
          var tid = 'tr-' + I + '-' + li;
          fxs += '<polygon id="' + tid + '" points="0,0" fill="' + (g === mg ? '#e6d9bd' : '#a98f68') + '" opacity="0"/>';
          g.forEach(function (a) { a.trailId = tid; a.trailOp = g === mg ? 0.95 : 0.55; });
        }
      });
      fx.innerHTML = fxs;
      var g_ = function (id) { return root.querySelector('#' + id); };
      tr.forEach(function (a) {
        var sp = a.spot, m = sp.group.length, Tc = m * 9 + 12, j = sp.group.indexOf(a), w0 = j * 9;
        var L1 = Math.abs(DU - sp.u), L2 = Math.abs(DV - 0.62 - sp.v), LT = L1 + L2;
        function along(f) { var dd = f * LT; if (dd <= L1) return { u: sp.u + (DU - sp.u) * (dd / (L1 || 1)), v: sp.v, f: 1 }; return { u: DU, v: sp.v + (dd - L1), f: -1 }; }
        a.upd = function (t) {
          var tt = t % Tc, pos, lvl = 0, bed = 0, face = 1;
          if (tt >= w0 && tt < w0 + 9) { pos = { u: sp.u, v: sp.v }; var k = Math.floor((tt - w0) / 3), fr = ((tt - w0) % 3) / 3; lvl = (k + ease(seg(fr, .62, .85))) / 3; }
          else if (tt >= w0 + 9 && tt < w0 + 13) { pos = along(ease((tt - w0 - 9) / 4)); face = pos.f; lvl = 1; }
          else if (tt >= w0 + 13 && tt < w0 + 16) { pos = along(1); var dd = tt - w0 - 13; bed = ease(seg(dd, 0, 1)) * (1 - ease(seg(dd, 2, 3))); lvl = 1 - ease(seg(dd, .7, 2.2)); }
          else if (tt >= w0 + 16 && tt < w0 + 21) { pos = along(1 - ease((tt - w0 - 16) / 5)); face = -pos.f; }
          else { pos = { u: sp.u + 0.95, v: sp.v }; }
          var moving = (tt >= w0 + 9 && tt < w0 + 13) || (tt >= w0 + 16 && tt < w0 + 21);
          a.set(pos.u, pos.v, face, moving ? 1 : 0);
          if (a.parts.bed) a.parts.bed.setAttribute('transform', 'rotate(' + (-28 * bed).toFixed(1) + ' 10 50)');
          if (a.parts.load) { a.parts.load.setAttribute('transform', 'translate(35 28) scale(1 ' + Math.max(0.02, lvl).toFixed(2) + ')'); a.parts.load.setAttribute('opacity', lvl > 0.02 ? 1 : 0); }
        };
      });
      var KF = [[0, -20, 0, -20, 0], [.30, 12, 28, 8, 0], [.45, 14, 34, 45, 1], [.62, -32, -4, 40, 1], [.80, -30, -6, -38, 0], [1, -20, 0, -20, 0]];
      function pose(p) {
        for (var k = 1; k < KF.length; k++) if (p <= KF[k][0]) { var a0 = KF[k - 1], a1 = KF[k], f = ease((p - a0[0]) / (a1[0] - a0[0])); return [lerp(a0[1], a1[1], f), lerp(a0[2], a1[2], f), lerp(a0[3], a1[3], f), p > .44 && p < .74 ? 1 : 0]; }
        return [-20, 0, -20, 0];
      }
      ex.forEach(function (a, i) {
        var m = a.group.length;
        a.upd = function (t) {
          var active = true, p;
          if (m) { var Tc = m * 9 + 12, tt = t % Tc; active = tt < m * 9; p = (tt % 3) / 3; } else p = (t % 3.4) / 3.4;
          var po = active ? pose(p) : [-18 + Math.sin(t * 2) * 1.2, 0, -16, 0];
          if (a.parts.arm) a.parts.arm.setAttribute('transform', 'rotate(' + po[0].toFixed(1) + ' 58 42)');
          if (a.parts.stick) a.parts.stick.setAttribute('transform', 'rotate(' + po[1].toFixed(1) + ' 78 22)');
          if (a.parts.bucket) a.parts.bucket.setAttribute('transform', 'rotate(' + po[2].toFixed(1) + ' 91 41)');
          if (a.parts.dirt) a.parts.dirt.setAttribute('visibility', po[3] ? 'visible' : 'hidden');
          a.set(a.eu, a.ev, 1, 0);
          var pe = g_('pit-' + I + '-' + i);
          if (pe) { var cx = pe.getAttribute('data-cx'), cy = pe.getAttribute('data-cy'), sc = 0.62 + 0.38 * tri(t / 36); pe.setAttribute('transform', 'translate(' + cx + ' ' + cy + ') scale(' + sc.toFixed(2) + ') translate(-' + cx + ' -' + cy + ')'); }
          var mh = g_('mh-' + I + '-' + i);
          if (mh) mh.setAttribute('transform', 'scale(' + (0.55 + 0.45 * tri(t / 36 + .5)).toFixed(2) + ')');
        };
      });
      ld.forEach(function (a) {
        var v = a.lane, u1 = 1.15, u2 = s - 1.15, T = 14;
        a.upd = function (t) {
          var tt = (t + a.ph * T) % T, u, face = 1, mov = 0, lift = 18, tilt = 10, dirt = 0;
          if (tt < 2.2) { u = u1; var f = tt / 2.2; tilt = lerp(-6, 30, ease(seg(f, .2, .7))); lift = f < .5 ? lerp(22, 2, ease(f / .5)) : lerp(2, -14, ease(seg(f, .6, 1))); dirt = f > .6 ? 1 : 0; }
          else if (tt < 6.2) { u = lerp(u1, u2, ease((tt - 2.2) / 4)); lift = -14; tilt = 30; dirt = 1; mov = 1; }
          else if (tt < 8.2) { u = u2; var f3 = (tt - 6.2) / 2; lift = lerp(-14, -22, ease(seg(f3, 0, .4))); tilt = lerp(30, -40, ease(seg(f3, .3, .8))); dirt = f3 < .6 ? 1 : 0; }
          else { var f4 = ease((tt - 8.2) / 5.8); u = lerp(u2, u1, f4); face = -1; lift = lerp(-22, 18, ease(seg(f4, 0, .3))); tilt = lerp(-40, -6, ease(seg(f4, 0, .4))); mov = 1; }
          a.set(u, v, face, mov);
          if (a.parts.lift) a.parts.lift.setAttribute('transform', 'rotate(' + lift.toFixed(1) + ' 62 47)');
          if (a.parts.tilt) a.parts.tilt.setAttribute('transform', 'rotate(' + tilt.toFixed(1) + ' 84 43)');
          if (a.parts.dirt) a.parts.dirt.setAttribute('visibility', dirt ? 'visible' : 'hidden');
          var h1 = g_('lh1-' + I), h2 = g_('lh2-' + I);
          if (h1) h1.setAttribute('transform', 'scale(' + (1.05 - 0.28 * tri(t / 28)).toFixed(2) + ')');
          if (h2) h2.setAttribute('transform', 'scale(' + (0.77 + 0.28 * tri(t / 28)).toFixed(2) + ')');
        };
      });
      function sweeper(arr, T, shake) {
        arr.forEach(function (a) {
          var v = a.lane, u1 = 0.95, u2 = s - 0.95;
          a.upd = function (t) {
            var tt = (t + a.ph * T) % T, u, face = 1, mov = 1;
            if (tt < T * .42) u = lerp(u1, u2, ease(tt / (T * .42)));
            else if (tt < T * .5) { u = u2; mov = 0; }
            else if (tt < T * .92) { u = lerp(u2, u1, ease((tt - T * .5) / (T * .42))); face = -1; }
            else { u = u1; mov = 0; }
            a.set(u, v, face, mov);
            if (a.parts.bob) a.parts.bob.setAttribute('transform', shake && mov ? 'translate(' + (Math.sin(t * 60) * .6).toFixed(2) + ' ' + (Math.cos(t * 53) * .5).toFixed(2) + ')' : '');
            var el = a.trailId && g_(a.trailId);
            if (el) {
              var cov = tt < T * .42 ? ease(tt / (T * .42)) : 1, ub = lerp(u1, u2, cov);
              el.setAttribute('points', pts([pt(P, u1, v - 0.28), pt(P, ub, v - 0.28), pt(P, ub, v + 0.28), pt(P, u1, v + 0.28)]));
              var fade = tt > T * .92 ? 1 - (tt - T * .92) / (T * .08) : 1;
              el.setAttribute('opacity', (a.trailOp * fade).toFixed(2));
            }
          };
        });
      }
      sweeper(mg, 15, false); sweeper(rl, 18, true);
      tc.forEach(function (a, k) {
        var m = 0.55, c4 = [[m, m], [s - m, m], [s - m, s - m], [m, s - m]], side = s - 2 * m, per = side * 4, spd = 0.45;
        a.upd = function (t) {
          var d0 = (t * spd + k * per / Math.max(1, tc.length)) % per, i4 = Math.floor(d0 / side), r = d0 - i4 * side, A0 = c4[i4], A1 = c4[(i4 + 1) % 4];
          var du = A1[0] - A0[0], dv = A1[1] - A0[1], len = Math.hypot(du, dv) || 1;
          a.set(A0[0] + du / len * r, A0[1] + dv / len * r, (du > 0 || dv < 0) ? 1 : -1, 1);
        };
      });
      pk.forEach(function (a, k) {
        var u1 = 0.7, u2 = s - 0.7, v = 0.52, T = 22;
        a.upd = function (t) {
          var tt = (t + k * 7) % T, u, face = 1, mov = 1;
          if (tt < 5) u = lerp(u1, s / 2, ease(tt / 5));
          else if (tt < 8) { u = s / 2; mov = 0; }
          else if (tt < 12) u = lerp(s / 2, u2, ease((tt - 8) / 4));
          else if (tt < 14) { u = u2; mov = 0; }
          else { u = lerp(u2, u1, ease((tt - 14) / 8)); face = -1; }
          a.set(u, v, face, mov);
        };
      });
      gn.forEach(function (a, k) { var c = 0.8 + k * 1.2; a.upd = function (t) { a.set(c, s - 1.4, 1, 0); if (a.parts.bob) a.parts.bob.setAttribute('transform', 'translate(0 ' + (Math.sin(t * 3 + k) * 1).toFixed(2) + ')'); }; });
      P.acts.forEach(function (a) {
        a.set = function (u, v, face, mov) {
          if (a.el.__drag) return;
          var q = pt(P, u, v); a.u = u; a.v = v;
          a.el.setAttribute('transform', 'translate(' + (q[0] - 50 * SC).toFixed(1) + ',' + (q[1] - 60 * SC).toFixed(1) + ') scale(' + SC + ')');
          if (a.parts.face) a.parts.face.setAttribute('transform', face < 0 ? 'translate(100 0) scale(-1 1)' : '');
          if (mov) { a.spin += 9; a.wheels.forEach(function (w) { w.setAttribute('transform', 'rotate(' + a.spin.toFixed(0) + ' ' + w.getAttribute('data-pv') + ')'); }); }
        };
      });
    }
    function tickPlot(P, t) {
      P.acts.forEach(function (a) { if (a.upd) a.upd(t); });
      var order = P.acts.slice().sort(function (p, q) { return (p.u + p.v) - (q.u + q.v); });
      var sig = order.map(function (a) { return a.m.id; }).join('|');
      if (sig !== P.sig) { P.sig = sig; order.forEach(function (a) { P.layer.appendChild(a.el); }); }
      var dump = stage.querySelector('#dh-' + P.idx);
      if (dump) dump.setAttribute('transform', 'scale(' + (0.6 + 0.4 * tri(t / 40)).toFixed(2) + ')');
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (document.hidden || wrap.offsetParent === null) return;
      var d = stage.__d; if (!d) return;
      var t = (now - T0) / 1000;
      if (gl) { try { gl.frame(t); } catch (e) { glFail(e); render(); } return; }
      d.plots.forEach(function (P) { if (P.acts) tickPlot(P, t); });
    }
    function glFail(e) {
      if (window.console) console.error('Obras 3D: se vuelve al dibujo plano', e);
      glMsg = String(e && e.message || e).slice(0, 140);
      gl = null; hideTip(); stage.classList.remove('gl'); stage.innerHTML = ''; stage.__d = null;
    }
    function vacio(msg) {
      if (gl) { gl.empty(msg); return; }
      stage.innerHTML = '<div class="ob-empty">' + msg + '</div>';
    }

    function render() {
      var d = datos();
      var nHid = d.ocultas.length;
      bar.innerHTML = '<p>' + (d.puede ? 'Arrastrá cada máquina desde la playa (abajo) al terreno de su obra, o de una obra a otra. Tocá una máquina para ver su ficha de combustible abajo y cambiarle el color o la forma. Con la × del cartel quitás una obra del gráfico.' : 'Tocá una máquina para ver su ficha de combustible abajo. Mover máquinas, cambiar su aspecto y quitar obras del gráfico lo hace el dueño o el ingeniero.') + '</p>' +
        (d.D.maq.crearObra && d.D.maq.puedeEditar ? (adding ? '<form class="ob-addf" data-addf="1"><input type="text" maxlength="120" placeholder="Nombre de la obra" aria-label="Nombre de la obra" value="' + esc(addTxt) + '"><button type="submit" class="ob-add">Crear</button><button type="button" class="ob-cancel" data-addx="1">Cancelar</button><span>El cliente y el contrato se completan después en Centro de costos (obras).</span></form>' : '<button type="button" class="ob-add" data-add="1">+ Agregar obra</button>') : '') + '<div class="ob-leg">' + d.plots.map(function (P) { return '<span><i style="background:' + P.area.acento + '"></i>' + esc(P.codigo) + '</span>'; }).join('') + '<span>' + d.maqs.length + ' máquinas · ' + d.plots.length + ' obras en el gráfico</span></div>' + (!gl && glMsg ? '<div class="ob-gln">Vista 3D no disponible (' + esc(glMsg) + '). Se muestra el dibujo plano.</div>' : '');
      if (nHid) {
        hidBox.hidden = false;
        hidBox.innerHTML = '<span>Obras fuera del gráfico:</span>' + d.ocultas.map(function (o) { return '<button type="button" data-show="' + esc(o.id) + '"' + (d.puede ? '' : ' disabled') + ' title="' + (d.puede ? 'Volver a poner en el gráfico' : '') + '">' + esc(o.codigo + ' · ' + o.nombre) + (d.puede ? ' ↺' : '') + '</button>'; }).join('');
      } else { hidBox.hidden = true; hidBox.innerHTML = ''; }
      if (!d.maqs.length) { vacio('Todavía no hay máquinas cargadas. Se cargan en Centros de costo → Máquina.'); panelEl.hidden = true; stage.__d = null; return; }
      if (!d.plots.length) { vacio('No hay obras en el gráfico. ' + (nHid ? 'Podés volver a ponerlas con los botones de arriba.' : 'Usá «Agregar obra» para crear una.')); panelEl.hidden = true; stage.__d = null; return; }
      if (gl) {
        try {
          stage.__d = d; gl.build(d, pinned);
          if (REDUCED) gl.frame(3);
        } catch (e) { glFail(e); }
        if (gl) {
          var M0 = pinned && d.maqs.filter(function (m) { return m.id === pinned; })[0];
          if (M0) { panelMode = ''; panelEl.hidden = false; panelEl.innerHTML = panelHTML(M0, d); bindPanel(M0); } else if (panelMode === 'plot' && plotSelId && d.byId[plotSelId] && d.byId[plotSelId].c) { mostrarPlot(plotSelId); } else { pinned = null; panelMode = ''; panelEl.hidden = true; panelEl.innerHTML = ''; }
          if (!raf && !REDUCED) raf = requestAnimationFrame(loop);
          return;
        }
      }
      var L = layout(d, 1500), pad = 30, vw = L.w + pad * 2;
      var h = '<svg xmlns="' + NS + '" viewBox="' + (-pad) + ' 0 ' + vw + ' ' + L.h + '" role="img" aria-label="Obras con su maquinaria">';
      d.plots.slice().sort(function (a, b) { return a.y - b.y || a.x - b.x; }).forEach(function (P) { h += plotSVG(P); });
      h += trayInner(d.tray) + '<g id="ob-top"></g></svg>';
      stage.innerHTML = h;
      stage.__d = d;
      d.plots.forEach(function (P) { try { planPlot(P, stage); } catch (e) { if (window.console) console.error(e); } });
      var t0 = REDUCED ? 3 : (performance.now() - T0) / 1000;
      d.plots.forEach(function (P) { if (P.acts) tickPlot(P, t0); });
      var M = pinned && d.maqs.filter(function (m) { return m.id === pinned; })[0];
      if (M) { panelEl.hidden = false; panelEl.innerHTML = panelHTML(M, d); bindPanel(M); } else { pinned = null; panelEl.hidden = true; panelEl.innerHTML = ''; }
      if (!raf && !REDUCED) raf = requestAnimationFrame(loop);
    }

    /* ---------- interacción ---------- */
    var svgPt = function (svg, ev) { var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    function plotAt(d, x, y) {
      for (var i = 0; i < d.plots.length; i++) {
        var P = d.plots[i], cx = P.x, cy = P.y + P.side * HY, a = P.side * HX, b = P.side * HY;
        if (Math.abs(x - cx) / a + Math.abs(y - cy) / b <= 1.02) return P;
      }
      var T = d.tray;
      if (x >= T.bx && x <= T.bx + T.bw && y >= T.by - 20 && y <= T.by + T.bh) return T;
      return null;
    }
    function bindPanel(M) {
      var x = panelEl.querySelector('.x'); if (x) x.onclick = function () { pinned = null; if (gl) { gl.select(null); panelEl.hidden = true; panelEl.innerHTML = ''; } else render(); };
      var sel = panelEl.querySelector('#ob-mv');
      if (sel) sel.onchange = function () { var d = stage.__d, r = moverMaq(d, M, sel.value); if (r) render(); };
      var hk = panelEl.querySelector('#ob-hk');
      if (hk) hk.onchange = function () { var d = stage.__d; if (d.D.maq.accesorio(M.id, M.obraActual || '', hk.value)) render(); };
      var fm = panelEl.querySelector('#ob-fm');
      if (fm) fm.onchange = function () { var d = stage.__d; if (d.D.maq.estilo(M.id, M.colorMaq || '', fm.value)) render(); };
      [].forEach.call(panelEl.querySelectorAll('[data-color]'), function (b) { b.onclick = function () { var d = stage.__d; if (d.D.maq.estilo(M.id, b.getAttribute('data-color'), M.formaMaq || '')) render(); }; });
      var cc = panelEl.querySelector('#ob-cc');
      if (cc) cc.onchange = function () { var d = stage.__d; if (d.D.maq.estilo(M.id, cc.value, M.formaMaq || '')) render(); };
    }
    function abrir(mid, scroll) {
      pinned = mid; hideTip(); panelMode = '';
      if (gl && stage.__d) {
        gl.select(mid); var d0 = stage.__d, M1 = d0.maqs.filter(function (m) { return m.id === mid; })[0];
        if (M1) { panelEl.hidden = false; panelEl.innerHTML = panelHTML(M1, d0); bindPanel(M1); }
      } else render();
      if (scroll && panelEl.scrollIntoView) { try { panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { } }
    }
    bar.addEventListener('click', function (ev) {
      var t = ev.target.closest && ev.target.closest('[data-add],[data-addx]'); if (!t) return;
      adding = t.hasAttribute('data-add'); if (!adding) addTxt = ''; render();
      var inp = bar.querySelector('.ob-addf input'); if (inp) inp.focus();
    });
    bar.addEventListener('input', function (ev) { if (ev.target.closest && ev.target.closest('.ob-addf')) addTxt = ev.target.value; });
    bar.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = datos(), nom = (addTxt || '').trim(); if (!nom || !d.D.maq.crearObra) return;
      if (d.D.maq.crearObra(nom)) { adding = false; addTxt = ''; render(); }
    });
    panelEl.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('[data-edit]'); if (!b || !pinned) return;
      var d = datos(); if (d.D.maq.editar) d.D.maq.editar(pinned);
    });
    hidBox.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('[data-show]'); if (!b) return;
      var d = datos(); if (d.puede && d.D.maq.ocultar(b.getAttribute('data-show'), false)) render();
    });
    stage.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('.ob-hide'); if (!b) return;
      var d = stage.__d; if (d && d.puede && d.D.maq.ocultar(b.getAttribute('data-hide'), true)) { hideTip(); render(); }
    });
    stage.addEventListener('pointerover', function (ev) {
      if (drag) return;
      var d = stage.__d; if (!d) return;
      var g = ev.target.closest && ev.target.closest('.ob-m');
      if (g) { var M = d.maqs.filter(function (m) { return m.id === g.getAttribute('data-m'); })[0]; if (M && pinned !== M.id) showTip(fichaCorta(M, d), ev); return; }
      var lab = ev.target.closest && ev.target.closest('.ob-lab');
      if (lab) { var pid = lab.parentNode.getAttribute('data-plot'); if (d.byId[pid]) showTip(fichaObra(d.byId[pid], d), ev); }
    });
    stage.addEventListener('pointermove', function (ev) {
      if (drag) {
        var dx = ev.clientX - drag.x0, dy = ev.clientY - drag.y0;
        if (!drag.moved && Math.hypot(dx, dy) < 6) return;
        var d = stage.__d;
        if (!drag.moved) {
          if (!d.puede) return;
          drag.moved = true; drag.g.classList.add('drag'); drag.g.__drag = true; hideTip();
          drag.tr = drag.g.getAttribute('transform');
          drag.p0 = svgPt(drag.svg, { clientX: drag.x0, clientY: drag.y0 });
          drag.svg.querySelector('#ob-top').appendChild(drag.g);
        }
        var p = svgPt(drag.svg, ev);
        drag.g.setAttribute('transform', drag.tr.replace(/translate\(([-\d.]+),([-\d.]+)\)/, function (_, a, b) { return 'translate(' + (+a + p.x - drag.p0.x).toFixed(1) + ',' + (+b + p.y - drag.p0.y).toFixed(1) + ')'; }));
        var P = plotAt(d, p.x, p.y);
        stage.querySelectorAll('.ob-top').forEach(function (t) { t.setAttribute('stroke-width', '1.5'); t.style.filter = ''; });
        var tb = stage.querySelector('.ob-trayb'); if (tb) tb.setAttribute('stroke', '#cfcbbd');
        if (P && !P.tray) { var t = stage.querySelector('.ob-plot[data-plot="' + cesc(P.id) + '"] .ob-top'); if (t) { t.setAttribute('stroke-width', '4'); t.style.filter = 'brightness(1.06)'; } }
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
      if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); abrir(g.getAttribute('data-m'), true); }
    });
    stage.addEventListener('pointerdown', function (ev) {
      if (ev.button > 0) return;
      var g = ev.target.closest && ev.target.closest('.ob-m'); if (!g) return;
      var svg = stage.querySelector('svg');
      drag = { g: g, mid: g.getAttribute('data-m'), x0: ev.clientX, y0: ev.clientY, moved: false, p0: null, tr: '', svg: svg, to: null };
      try { g.setPointerCapture(ev.pointerId); } catch (e) { }
      hideTip();
    });
    function fin(ev) {
      if (!drag) return;
      var D0 = drag, d = stage.__d; drag = null;
      try { D0.g.releasePointerCapture(ev.pointerId); } catch (e) { }
      D0.g.__drag = false;
      if (!D0.moved) { abrir(D0.mid, true); return; }
      var M = d.maqs.filter(function (m) { return m.id === D0.mid; })[0], to = D0.to;
      if (M && to && (M.obraActual || '') !== to.id) { if (moverMaq(d, M, to.id)) pinned = M.id; else return; }
      render();
    }
    stage.addEventListener('pointerup', fin);
    stage.addEventListener('pointercancel', fin);

    /* mueve una máquina; si es un accesorio que se engancha, pregunta a qué tractor o camioneta de esa obra lo conecta */
    function pickEl() { var e = stage.querySelector('.ob-pick'); if (e) e.remove(); return e; }
    function moverMaq(d, M, toId) {
      pickEl();
      var tp = tipoDibujo(M), esAccM = String(tp).indexOf('acc_') === 0, engancha = tp === 'acc_desmalezadora' || tp === 'acc_rastra' || tp === 'acc_regador';
      if (!esAccM || !d.D.maq.accesorio) return d.D.maq.mover(M.id, toId);
      if (!engancha || !toId) { if (d.D.maq.accesorio(M.id, toId, '')) { pinned = M.id; } return true; }
      var P = d.byId[toId], hosts = P ? P.maqs.filter(function (x) { var t = tipoDibujo(x); return x.id !== M.id && (t === 'tractor' || t === 'camioneta'); }) : [];
      var busy = {}; (P ? P.maqs : []).forEach(function (x) { if (x.acopladoA && x.id !== M.id && String(tipoDibujo(x)).indexOf('acc_') === 0) busy[x.acopladoA] = true; });
      var box = document.createElement('div'); box.className = 'ob-pick';
      box.innerHTML = '<div><h4>\u00bfA qu\u00e9 quer\u00e9s conectar ' + esc(M.nombre) + '?</h4><p>Va a quedar enganchado atr\u00e1s y se mueve con \u00e9l.</p>' +
        (hosts.length ? hosts.map(function (h) { return '<button type="button" data-host="' + esc(h.id) + '"' + (busy[h.id] ? ' disabled' : '') + '>' + esc(h.codigo + ' \u00b7 ' + h.nombre) + (busy[h.id] ? ' (ya lleva un accesorio)' : '') + '</button>'; }).join('') : '<p>No hay un tractor ni una camioneta en esta obra. Llev\u00e1 primero uno a esta obra.</p>') +
        '<button type="button" data-host="">Dejarlo suelto en la obra (sin enganchar)</button><button type="button" class="x" data-cancel="1">Cancelar</button></div>';
      box.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      box.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('button'); if (!b || b.disabled) return;
        box.remove();
        if (b.hasAttribute('data-host')) { if (d.D.maq.accesorio(M.id, toId, b.getAttribute('data-host'))) pinned = M.id; }
        render();
      });
      stage.appendChild(box);
      return false;
    }
    function tipoNom(m) { var t = tipoDibujo(m), r = ''; FORMAS.forEach(function (f) { if (f[0] === t) r = f[1].replace('Accesorio: ', ''); }); return r || 'Máquina'; }
    function plotPanel(P, d) {
      var ms = P.maqs, hostNom = function (m) { var h = m.acopladoA && ms.filter(function (x) { return x.id === m.acopladoA; })[0]; return h ? h.codigo : ''; };
      var h = '<button type="button" class="x" aria-label="Cerrar">\u00d7</button><div class="pn-head"><div><h3>' + esc(P.codigo) + ' \u00b7 ' + esc(P.nombre) + '</h3><div class="sub">' + (ms.length ? ms.length + ' m\u00e1quina' + (ms.length === 1 ? '' : 's') + ' en esta obra \u00b7 toc\u00e1 una para ver su ficha' : 'Esta obra todav\u00eda no tiene m\u00e1quinas. Arrastr\u00e1 una desde la playa.') + '</div></div></div>';
      if (ms.length) h += '<div class="pl-list">' + ms.map(function (m) {
        var tp = tipoDibujo(m), acc = String(tp).indexOf('acc_') === 0, st = estilo(m, tp), extra = '';
        if (acc) extra = (tp === 'acc_casilla' || tp === 'acc_tanque') ? ' \u00b7 campamento' : (hostNom(m) ? ' \u00b7 enganchado a ' + hostNom(m) : ' \u00b7 sin enganchar');
        return '<button type="button" class="pl-it" data-m="' + esc(m.id) + '"><i style="background:' + st.body + '"></i><span>' + esc(m.codigo + ' \u00b7 ' + m.nombre) + '<small>' + esc(tipoNom(m) + extra) + '</small></span></button>';
      }).join('') + '</div>';
      return h;
    }
    function mostrarPlot(pid) {
      var d = stage.__d, P = pid && d && d.byId[pid]; plotSelId = pid || null;
      if (!P || !P.c) { if (panelMode === 'plot') { panelEl.hidden = true; panelEl.innerHTML = ''; panelMode = ''; } return; }
      pinned = null; if (gl) gl.select(null);
      panelMode = 'plot'; panelEl.hidden = false; panelEl.innerHTML = plotPanel(P, d);
      var x = panelEl.querySelector('.x'); if (x) x.onclick = function () { panelEl.hidden = true; panelEl.innerHTML = ''; panelMode = ''; if (gl) gl.plot(null); };
      [].forEach.call(panelEl.querySelectorAll('.pl-it'), function (b) { b.onclick = function () { abrir(b.getAttribute('data-m'), true); }; });
      if (panelEl.scrollIntoView) { try { panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { } }
    }
    var api = {
      plotSel: function (pid) { mostrarPlot(pid); },
      puede: function () { var d = stage.__d; return !!(d && d.puede); },
      hover: function (m, ev) {
        var d = stage.__d;
        if (!m || !d) { if (hoverKey) hideTip(); return; }
        if (pinned === m.id) { if (hoverKey) hideTip(); return; }
        if (hoverKey !== 'm' + m.id) { showTip(fichaCorta(m, d), ev); hoverKey = 'm' + m.id; } else placeTip(ev);
      },
      labelHover: function (pid, ev) {
        var d = stage.__d; if (!d || !d.byId[pid]) return;
        if (hoverKey !== 'p' + pid) { showTip(fichaObra(d.byId[pid], d), ev); hoverKey = 'p' + pid; } else placeTip(ev);
      },
      click: function (mid) { abrir(mid, true); },
      drop: function (mid, toId) {
        var d = stage.__d, M = d && d.maqs.filter(function (m) { return m.id === mid; })[0];
        if (M && toId !== null && toId !== undefined && (M.obraActual || '') !== toId) { var r = moverMaq(d, M, toId); if (r === false) return; if (r) pinned = M.id; }
        render();
      },
      hide: function (pid) { var d = stage.__d; hideTip(); if (d && d.puede && d.D.maq.ocultar(pid, true)) render(); }
    };
    if (!webglOK()) glMsg = window.THREE ? 'Este navegador no tiene WebGL activo' : 'La librer\u00eda 3D no termin\u00f3 de cargar';
    if (webglOK()) { try { gl = engine3D(stage, api); } catch (e) { gl = null; stage.classList.remove('gl'); stage.innerHTML = ''; if (window.console) console.error(e); } }
    render();
    return { refresh: function () { if (!drag) render(); } };
  }
  window.OFICINA_OBRAS = { montar: mount };
})();
