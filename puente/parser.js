// Lector de facturas electrónicas argentinas (formato ARCA/AFIP) a partir del texto de un PDF.
// Sin dependencias: se usa en la función del puente y se prueba con Node.
export const CUIT_CODES = '30717002454'; // CODES SRL · 30-71700245-4

const CODIGOS = {
  1: 'A', 2: 'ND_A', 3: 'NC_A', 6: 'B', 7: 'ND_B', 8: 'NC_B', 11: 'C', 12: 'ND_C', 13: 'NC_C',
  51: 'M', 52: 'ND_A', 53: 'NC_A', 19: 'E', 201: 'A', 202: 'ND_A', 203: 'NC_A', 206: 'B', 207: 'ND_B', 208: 'NC_B', 211: 'C', 212: 'ND_C', 213: 'NC_C'
};

export function numero(s) {
  if (s == null) return 0;
  s = String(s).trim().replace(/[$\s]|ARS|USD|u\$s/gi, '');
  if (!s) return 0;
  const neg = /^-/.test(s) || /^\(.*\)$/.test(s);
  s = s.replace(/[^\d.,]/g, '');
  const m = /^(.*?)([.,])(\d{1,2})$/.exec(s);
  let v;
  if (m) v = parseFloat(m[1].replace(/[.,]/g, '') + '.' + m[3]);
  else v = parseFloat(s.replace(/[.,]/g, ''));
  if (isNaN(v)) return 0;
  return neg ? -v : v;
}

// Todos los importes con centavos que aparecen en el texto (formato 1.234,56 o 1,234.56 o 1234.56)
export function importesEn(t) {
  const out = [];
  const re = /(?<![\d.,])(\d{1,3}(?:[.,]\d{3})+[.,]\d{2}|\d+[.,]\d{2})(?![\d])/g;
  let m;
  while ((m = re.exec(t))) { const v = numero(m[1]); if (v > 0 && !out.includes(v)) out.push(v); }
  return out;
}

// Busca la combinación que cierra: neto + IVA (+ otros) = total, con IVA = neto × alícuota.
// Devuelve null si no hay una combinación única y razonable.
export function conciliar(t) {
  const A = importesEn(t);
  const tolI = n => Math.max(0.06, n * 0.0006);
  const sol = [];
  for (const T of A) for (const N of A) {
    if (N >= T || N < T / 1.4) continue;
    for (const r of [0.21, 0.105, 0.27, 0.05, 0.025]) {
      const I = A.find(x => Math.abs(x - N * r) <= tolI(N));
      if (I && Math.abs(N + I - T) <= 0.03) sol.push({ neto: N, iva: I, otros: 0, total: T });
    }
  }
  if (!sol.length) {
    for (const T of A) for (const N of A) {
      if (N >= T) continue;
      for (const r of [0.21, 0.105, 0.27]) {
        const I = A.find(x => Math.abs(x - N * r) <= tolI(N));
        if (!I) continue;
        const X = A.find(x => Math.abs(N + I + x - T) <= 0.03 && x < T * 0.2);
        if (X) sol.push({ neto: N, iva: I, otros: X, total: T });
      }
    }
  }
  if (!sol.length) return null;
  // preferir el total que figura rotulado como TOTAL y, si no, el mayor
  const rot = new Set([...t.matchAll(/(?:IMPORTE\s+)?TOTAL[^\d\n]{0,12}?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2}|\d+[.,]\d{2})/gi)].map(x => numero(x[1])));
  sol.sort((a, b) => (rot.has(b.total) - rot.has(a.total)) || (b.total - a.total) || (a.otros - b.otros));
  return sol[0];
}

export function cuitValido(d) {
  if (!/^\d{11}$/.test(d)) return false;
  const w = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let s = 0;
  for (let i = 0; i < 10; i++) s += +d[i] * w[i];
  let v = 11 - (s % 11);
  if (v === 11) v = 0;
  if (v === 10) v = 9;
  return v === +d[10];
}

export function cuitsEn(texto) {
  const out = [];
  const re = /(?<!\d)(20|23|24|27|30|33|34)[-\s]?(\d{8})[-\s]?(\d)(?!\d)/g;
  let m;
  while ((m = re.exec(texto))) {
    const d = m[1] + m[2] + m[3];
    if (cuitValido(d) && !out.includes(d)) out.push(d);
  }
  return out;
}

export const cuitFmt = d => d ? d.slice(0, 2) + '-' + d.slice(2, 10) + '-' + d.slice(10) : '';

const fechaISO = s => {
  const m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s || '');
  if (!m) return '';
  const [d, mo, y] = [+m[1], +m[2], +m[3]];
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 2000 || y > 2100) return '';
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

// Nombre del emisor: por lo general está arriba a la izquierda del comprobante, sin etiqueta.
const RUIDO = /^(original|duplicado|triplicado|factura|nota\b|comprobante|cod\b|c[oó]digo|fecha|punto|comp\b|cuit|ingresos|condici[oó]n|domicilio|raz[oó]n|n[°º]|p[aá]gina|\d|\W)/i;
export function razonArriba(t) {
  const ok = l => l.length >= 3 && l.length <= 80 && /[A-Za-zÁÉÍÓÚÑáéíóúñ]{3}/.test(l) && !/^[ABCME]$/.test(l) && !/\d{2}/.test(l) && !/c[oó]digo/i.test(l) && !RUIDO.test(l) && !/CODES/i.test(l);
  const lineas = String(t || '').split(/\n+/).map(x => x.trim()).filter(Boolean).slice(0, 14);
  for (const l of lineas) if (ok(l)) return l.slice(0, 90);
  // texto sin saltos de línea: tomar el comienzo hasta la primera palabra clave del encabezado
  const ini = String(t || '').trim().slice(0, 160).split(/\s(?:ORIGINAL|DUPLICADO|TRIPLICADO|FACTURA|NOTA DE|Raz[oó]n Social|Domicilio|CUIT|Condici[oó]n|Fecha|Punto de Venta)/i)[0].trim();
  return ok(ini) ? ini : '';
}

// Devuelve { esFactura, ignorar, motivo, datos, observaciones }
export function analizar(texto, nombreArchivo = '') {
  const t = String(texto || '').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ');
  const obs = [];
  const tieneCAE = /\bCAE\b/i.test(t);
  const palabra = /(FACTURA|NOTA DE CR[EÉ]DITO|NOTA DE D[EÉ]BITO|COMPROBANTE)/i.test(t);
  if (!tieneCAE && !palabra) return { esFactura: false, ignorar: true, motivo: 'no parece una factura' };
  if (/\bRECIBO\b/i.test(t.slice(0, 80)) || (/\bRECIBO\b/i.test(t) && !/FACTURA|NOTA DE/i.test(t))) return { esFactura: false, ignorar: true, motivo: 'es un recibo' };
  if (/ORIGINAL\s+CODES\s+S\.?\s*R\.?\s*L/i.test(t)) return { esFactura: true, ignorar: true, motivo: 'emitida por CODES SRL (no es una compra)' };

  // CUITs: el receptor tiene que ser CODES SRL
  const cuits = cuitsEn(t);
  let receptor = '';
  if (cuits.includes(CUIT_CODES)) receptor = CUIT_CODES;
  else if (/CODES\s*S\.?\s*R\.?\s*L/i.test(t)) obs.push('No se pudo leer el CUIT de CODES SRL en el comprobante: revisar que sea a nombre de la empresa.');
  else return { esFactura: true, ignorar: true, motivo: 'no está a nombre de CODES SRL' };
  const emisor = cuits.find(c => c !== CUIT_CODES) || '';

  // Tipo
  let tipo = '';
  const mc = /C[oó]d(?:igo|\.)?:?\s*0*(\d{1,3})\b/i.exec(t);
  if (mc && CODIGOS[+mc[1]]) tipo = CODIGOS[+mc[1]];
  if (!tipo) { const ml = /(?:^|\s)([ABCM])\s+C[oó]digo\s*(?:N[°ºro]*\.?:?\s*)?:?\s*0*(\d{1,3})?/m.exec(t); if (ml) tipo = ml[1].toUpperCase(); }
  if (!tipo) {
    const nc = /NOTA DE CR[EÉ]DITO/i.test(t), nd = /NOTA DE D[EÉ]BITO/i.test(t);
    const letra = (/\b(?:FACTURA|NOTA DE CR[EÉ]DITO|NOTA DE D[EÉ]BITO)\s*(?:ELECTR[OÓ]NICA\s*)?(?:TIPO\s*)?([ABCME])\b/i.exec(t) || /(?:^|\s)([ABC])(?:\s+COD|\s*\n)/m.exec(t) || [])[1];
    if (letra) tipo = (nc ? 'NC_' : nd ? 'ND_' : '') + letra.toUpperCase();
    else {
      const nm = /^([ABCM])[_\- ]/i.exec(nombreArchivo);
      if (nm) tipo = nm[1].toUpperCase();
    }
  }
  if (!tipo) { obs.push('No se pudo reconocer el tipo de comprobante (se propone A).'); tipo = 'A'; }

  // Punto de venta y número
  let pv = 0, nro = 0;
  let m = /Punto de Venta:?\s*0*(\d{1,5})\s*(?:\n|\s)\s*Comp\.?\s*(?:Nro|N[°ºro]|Nº)\.?:?\s*0*(\d{1,8})/i.exec(t);
  if (m) { pv = +m[1]; nro = +m[2]; }
  if (!nro) { m = /N[úu]mero:?\s*0*(\d{1,5})\s*-\s*0*(\d{1,8})(?!\d)/i.exec(t); if (m) { pv = +m[1]; nro = +m[2]; } }
  if (!nro) {
    const sinFechas = t.replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, ' ').replace(/(20|23|24|27|30|33|34)[-\s]?\d{8}[-\s]?\d(?!\d)/g, ' ');
    m = /(?<!\d)(\d{4,5})\s*[-–]\s*(\d{8})(?!\d)/.exec(sinFechas);
    if (m) { pv = +m[1]; nro = +m[2]; }
  }
  if (!nro) { m = /(?<!\d)(\d{5})(\d{8})(?!\d)/.exec(nombreArchivo) || /(?<!\d)(\d{4,5})[-_ ](\d{8})(?!\d)/.exec(nombreArchivo); if (m) { pv = +m[1]; nro = +m[2]; } }
  if (!(pv > 0) || !(nro > 0)) obs.push('No se pudo leer el punto de venta y el número.');

  // Fecha
  let fecha = fechaISO((/Fecha de Emisi[oó]n:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i.exec(t) || [])[1]);
  if (!fecha) fecha = fechaISO((/(?:FACTURA|NOTA DE CR[EÉ]DITO|NOTA DE D[EÉ]BITO)\s+\d{4,5}\s*-\s*\d{8}\s+(\d{1,2}\/\d{1,2}\/\d{4})/i.exec(t) || [])[1]);
  if (!fecha) fecha = fechaISO((/(?<![\w])Fecha:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i.exec(t) || [])[1]);
  if (!fecha) { fecha = fechaISO((/(\d{1,2}\/\d{1,2}\/\d{4})/.exec(t) || [])[1]); if (fecha) obs.push('La fecha de emisión se tomó de la primera fecha del comprobante: revisar.'); }
  if (!fecha) obs.push('No se pudo leer la fecha.');

  // Importes
  const imp = (re) => { const x = re.exec(t); return x ? numero(x[1]) : 0; };
  let total = imp(/Importe Total:?\s*\$?\s*([\d.,]+)/i);
  let neto = imp(/Importe Neto Gravado:?\s*\$?\s*([\d.,]+)/i) || imp(/Subtotal:?\s*\$?\s*([\d.,]+)/i);
  let iva = 0, otros = 0, especial = false;
  // Formato combustibles (Emblema/YPF): "IVA 21%: IVA 10.5%: [iva21] [iva10,5] [neto] [imp1] [imp2] [imp3] [imp4] [total]"
  const mE = /IVA\s*21\s*%:?\s*IVA\s*10[.,]5\s*%:?\s*((?:\d[\d.]*,\d{2}\s+){7}\d[\d.]*,\d{2})/i.exec(t);
  if (mE) {
    const n = mE[1].trim().split(/\s+/).map(numero);
    iva = n[0] + n[1]; neto = n[2]; otros = n[3] + n[4] + n[5] + n[6]; total = n[7]; especial = true;
  }
  // Formato con punto decimal y fechas pegadas (ProHygiene): "NETO $ 58456.26 $ 12275.81I.V.A. $ 70732.0708/09/2026"
  if (!especial) {
    const pn = /NETO\s*\$?\s*(\d+\.\d{2})/i.exec(t), pi = /\$\s*(\d+\.\d{2})\s*I\.V\.A\./i.exec(t), pt = /I\.V\.A\.\s*\$\s*(\d+\.\d{2})(?=\d{1,2}\/\d{1,2}\/\d{4})/i.exec(t);
    if (pn && pt) { neto = numero(pn[1]); iva = pi ? numero(pi[1]) : 0; total = numero(pt[1]); especial = true; }
  }
  const reIva = /IVA\s*(\d{1,2}(?:[.,]\d{1,2})?)\s*%:?\s*\$?\s*([\d.]+,\d{2}|[\d]+\.\d{2})/gi;
  if (!especial) {
    while ((m = reIva.exec(t))) iva += numero(m[2]);
    if (!iva) iva = imp(/Importe IVA:?\s*\$?\s*([\d.,]+)/i);
    otros = imp(/Importe Otros Tributos:?\s*\$?\s*([\d.,]+)/i) + imp(/Importe No Gravado:?\s*\$?\s*([\d.,]+)/i) + imp(/Importe Exento:?\s*\$?\s*([\d.,]+)/i);
  }
  if (!total) {
    const todos = [...t.matchAll(/Total:?\s*\$?\s*([\d.]+,\d{2})/gi)].map(x => numero(x[1]));
    if (todos.length) total = Math.max(...todos);
  }
  // Moneda: facturas en dólares (se pasan a pesos con el tipo de cambio que declara la propia factura)
  const usd = /Son\s+D[oó]lares|\bu\$s\b|\bUSD\b|d[oó]lares?\s+estadounidenses?/i.test(t.replace(/Equivalente a:?\s*USD[\s\d.,]+/gi, '').replace(/cotizados al valor[^.]*\./gi, '').replace(/en billetes dolar[^.]*\./gi, ''))
    && /Son\s+D[oó]lares|TOTAL\s*u\$s/i.test(t);
  const coherente = (n, i, o, tt) => tt > 0 && n > 0 && i >= 0 && o >= 0 && i <= n && Math.abs(n + i + o - tt) <= 0.025 && o <= tt * 0.25;
  let verificado = coherente(neto, iva, otros, total);
  if (!verificado) {
    const c = conciliar(t);
    if (c) { neto = c.neto; iva = c.iva; otros = c.otros; total = c.total; verificado = true; if (especial) obs.push('Los importes se recalcularon porque los rotulados no cerraban: revisar.'); }
  }
  if (!verificado) {
    // No hay combinación que cierre: no se inventa nada. Se deja solo lo rotulado como total, si es razonable.
    const sano = total > 0 && total < 1e10 && neto >= 0 && iva >= 0 && otros >= 0 && neto <= total && Math.abs(neto + iva + otros - total) <= Math.max(1, total * 0.01);
    if (!sano) { neto = 0; iva = 0; otros = 0; if (!(total > 0 && total < 1e10)) total = 0; }
    obs.push('NO SE PUDIERON VERIFICAR LOS IMPORTES (neto + IVA ≠ total): completar neto, IVA y total a mano mirando el PDF.');
  } else {
    // Si hay varios conceptos de IVA (21% y 10,5%), no se fuerza una sola alícuota
    const rate = neto ? iva / neto : 0;
    if (!(Math.abs(rate - 0.21) < 0.003 || Math.abs(rate - 0.105) < 0.003 || Math.abs(rate - 0.27) < 0.003 || Math.abs(rate - 0.05) < 0.003 || Math.abs(rate - 0.025) < 0.003 || iva === 0))
      obs.push('El IVA no coincide con una alícuota única (' + (rate * 100).toFixed(2) + '%): puede tener varias alícuotas o percepciones. Revisar.');
  }
  if (usd && verificado) {
    const mt = /tipo de cambio de\s*\$?\s*([\d.,]+)/i.exec(t) || /([\d.]+,\d{4})\s*al tipo de cambio/i.exec(t);
    let tc = mt ? numero(String(mt[1]).replace(/[^\d]+$/, '')) : 0;
    if (mt && /\.\d{4}$|,\d{4}$/.test(String(mt[1]))) tc = numero(String(mt[1]).replace(/[.,]0+$/, ''));
    if (!(tc > 100 && tc < 100000)) tc = 0;
    if (tc) {
      const f = x => Math.round(x * tc * 100) / 100;
      const u = total; neto = f(neto); iva = f(iva); otros = f(otros); total = f(total);
      obs.push('Factura en DÓLARES: USD ' + u.toLocaleString('es-AR', { minimumFractionDigits: 2 }) + ' convertidos a pesos a ' + tc.toLocaleString('es-AR') + ' (el tipo de cambio que figura en la factura). Revisar.');
    } else obs.push('Factura en DÓLARES: los importes están en USD y no se encontró el tipo de cambio. Pasarlos a pesos a mano.');
  }
  if (!(total > 0)) obs.push('No se pudo leer el importe total.');

  const cae = (/C\.?\s?A\.?\s?E\.?\s*(?:N[°ºro.]*\s*)?:?\s*(\d{14})/i.exec(t) || [])[1] || '';
  let razon = '';
  const mr = /Raz[oó]n Social:?\s*([^\n]+)/i.exec(t);
  if (mr) razon = mr[1].split(/\s(?:Domicilio|Condici[oó]n|CUIT|Fecha|Punto|Ingresos|Comp\.|Per[ií]odo)/i)[0].trim().slice(0, 90);
  if (!razon || /CODES/i.test(razon)) {
    const todas = [...t.matchAll(/Raz[oó]n Social:?\s*([^\n]+)/gi)].map(x => x[1].split(/\s(?:Domicilio|Condici[oó]n|CUIT|Fecha|Punto)/i)[0].trim()).filter(x => x && !/CODES/i.test(x));
    razon = (todas[0] || '').slice(0, 90);
  }
  if (!razon) { const mn = /FACTURA\s+C[oó]digo:?\s*\d+\s+[ABCM]\s+(?:[A-Z]{1,3}\s+)?(.{3,70}?)\s+[A-ZÁÉÍÓÚÑ]{3,}(?:\s+[A-ZÁÉÍÓÚÑ]+)*\s+\d/.exec(t); if (mn) razon = mn[1].trim().slice(0, 90); }
  if (!razon) {
    const pos = emisor ? Math.max(t.indexOf(cuitFmt(emisor)), t.indexOf(emisor)) : -1;
    let zona = pos > 0 ? t.slice(Math.max(0, pos - 300), pos + 40) : t.slice(0, 400);
    if (pos > 300) zona = zona.slice(zona.indexOf(' ') + 1);
    const soc = [...zona.matchAll(/([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ0-9.&' -]{2,60}?\s(?:S\.?\s?R\.?\s?L\.?|S\.?\s?A\.?\s?S\.?|S\.?\s?A\.?|S\.?\s?H\.?))(?![A-Za-z])/g)].map(x => x[1].replace(/^(?:Concesionario Oficial|Hoja\s+\d+\s+de\s+\d+|N[úu]mero:?[\d\s-]*Hoja \d+ de \d+|Fecha:?\s*[\d/]+|ORIGINAL|DUPLICADO)\s*/i, '').trim()).filter(x => x.length > 4 && !/CODES/i.test(x));
    if (soc.length) razon = soc[soc.length - 1].slice(0, 90);
  }
  if (!razon) { const mp = /\d{4,5}\s*-\s*\d{8}\s+([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ.' ]{3,50}?)\s+(?:CFNMN|FACTURA|CUIT)/.exec(t); if (mp && !/CODES/i.test(mp[1])) razon = mp[1].trim(); }
  if (!razon) razon = razonArriba(t);
  if (!emisor) obs.push('No se pudo leer el CUIT del emisor.');
  if (!razon) obs.push('No se pudo leer la razón social del emisor.');

  return {
    esFactura: true, ignorar: false,
    datos: {
      emisor_cuit: cuitFmt(emisor), emisor_razon: razon, receptor_cuit: receptor ? cuitFmt(receptor) : '',
      tipo, punto_venta: pv || null, numero: nro || null, fecha: fecha || null,
      neto_gravado: Math.round(neto * 100) / 100, iva: Math.round(iva * 100) / 100, otros: Math.round(otros * 100) / 100,
      total: Math.round(total * 100) / 100, cae
    },
    observaciones: obs
  };
}
