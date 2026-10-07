// Lector de facturas electrónicas argentinas (formato ARCA/AFIP) a partir del texto de un PDF.
// Sin dependencias: se usa en la función del puente y se prueba con Node.
export const CUIT_CODES = '30717002454'; // CODES SRL · 30-71700245-4

const CODIGOS = {
  1: 'A', 2: 'ND_A', 3: 'NC_A', 6: 'B', 7: 'ND_B', 8: 'NC_B', 11: 'C', 12: 'ND_C', 13: 'NC_C',
  51: 'M', 52: 'ND_A', 53: 'NC_A', 19: 'E', 201: 'A', 202: 'ND_A', 203: 'NC_A', 206: 'B', 207: 'ND_B', 208: 'NC_B', 211: 'C', 212: 'ND_C', 213: 'NC_C'
};

export function numero(s) {
  if (s == null) return 0;
  s = String(s).trim().replace(/[$\s]|ARS|USD/gi, '');
  if (!s) return 0;
  if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
  else if (/\.\d{1,2}$/.test(s) && !/,/.test(s) && (s.match(/\./g) || []).length === 1) s = s.replace(/,/g, '');
  else s = s.replace(/[.,]/g, '');
  const v = parseFloat(s);
  return isNaN(v) ? 0 : v;
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
  const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(s || '');
  if (!m) return '';
  const [d, mo, y] = [+m[1], +m[2], +m[3]];
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 2000 || y > 2100) return '';
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

// Nombre del emisor: por lo general está arriba a la izquierda del comprobante, sin etiqueta.
const RUIDO = /^(original|duplicado|triplicado|factura|nota\b|comprobante|cod\b|c[oó]digo|fecha|punto|comp\b|cuit|ingresos|condici[oó]n|domicilio|raz[oó]n|n[°º]|p[aá]gina|\d|\W)/i;
export function razonArriba(t) {
  const ok = l => l.length >= 3 && l.length <= 80 && /[A-Za-zÁÉÍÓÚÑáéíóúñ]{3}/.test(l) && !/^[ABCME]$/.test(l) && !RUIDO.test(l) && !/CODES/i.test(l);
  const lineas = String(t || '').split(/\n+/).map(x => x.trim()).filter(Boolean).slice(0, 14);
  for (const l of lineas) if (ok(l)) return l.slice(0, 90);
  // texto sin saltos de línea: tomar el comienzo hasta la primera palabra clave del encabezado
  const ini = String(t || '').trim().slice(0, 160).split(/\s(?:ORIGINAL|DUPLICADO|TRIPLICADO|FACTURA|NOTA DE|Raz[oó]n Social|Domicilio|CUIT|Condici[oó]n|Fecha|Punto de Venta)/i)[0].trim();
  return ok(ini) ? ini : '';
}

// Devuelve { esFactura, ignorar, motivo, datos, observaciones }
export function analizar(texto, nombreArchivo = '') {
  const t = String(texto || '').replace(/ /g, ' ').replace(/[ \t]+/g, ' ');
  const obs = [];
  const tieneCAE = /\bCAE\b/i.test(t);
  const palabra = /(FACTURA|NOTA DE CR[EÉ]DITO|NOTA DE D[EÉ]BITO|COMPROBANTE)/i.test(t);
  if (!tieneCAE && !palabra) return { esFactura: false, ignorar: true, motivo: 'no parece una factura' };
  if (/\bRECIBO\b/i.test(t) && !/FACTURA|NOTA DE/i.test(t)) return { esFactura: false, ignorar: true, motivo: 'es un recibo' };

  // CUITs: el receptor tiene que ser CODES SRL
  const cuits = cuitsEn(t);
  let receptor = '';
  if (cuits.includes(CUIT_CODES)) receptor = CUIT_CODES;
  else if (/CODES\s*S\.?\s*R\.?\s*L/i.test(t)) obs.push('No se pudo leer el CUIT de CODES SRL en el comprobante: revisar que sea a nombre de la empresa.');
  else if (cuits.length > 0) return { esFactura: true, ignorar: true, motivo: 'no está a nombre de CODES SRL' };
  else obs.push('No se pudo leer ningún CUIT del comprobante: revisar que sea a nombre de CODES SRL.');
  const emisor = cuits.find(c => c !== CUIT_CODES) || '';

  // Tipo
  let tipo = '';
  const mc = /COD\.?\s*0*(\d{1,3})\b/i.exec(t);
  if (mc && CODIGOS[+mc[1]]) tipo = CODIGOS[+mc[1]];
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
  let m = /Punto de Venta:?\s*0*(\d{1,5})\s*(?:\n|\s)\s*Comp\.?\s*(?:Nro|N[°ºo]|Nº)\.?:?\s*0*(\d{1,8})/i.exec(t);
  if (m) { pv = +m[1]; nro = +m[2]; }
  if (!nro) {
    const sinFechas = t.replace(/\d{2}\/\d{2}\/\d{4}/g, ' ').replace(/(20|23|24|27|30|33|34)[-\s]?\d{8}[-\s]?\d(?!\d)/g, ' ');
    m = /(?<!\d)(\d{4,5})\s*[-–]\s*(\d{8})(?!\d)/.exec(sinFechas);
    if (m) { pv = +m[1]; nro = +m[2]; }
  }
  if (!nro) { m = /(?<!\d)(\d{5})(\d{8})(?!\d)/.exec(nombreArchivo) || /(?<!\d)(\d{4,5})[-_ ](\d{8})(?!\d)/.exec(nombreArchivo); if (m) { pv = +m[1]; nro = +m[2]; } }
  if (!(pv > 0) || !(nro > 0)) obs.push('No se pudo leer el punto de venta y el número.');

  // Fecha
  let fecha = fechaISO((/Fecha de Emisi[oó]n:?\s*(\d{2}\/\d{2}\/\d{4})/i.exec(t) || [])[1]);
  if (!fecha) { fecha = fechaISO((/(\d{2}\/\d{2}\/\d{4})/.exec(t) || [])[1]); if (fecha) obs.push('La fecha de emisión se tomó de la primera fecha del comprobante: revisar.'); }
  if (!fecha) obs.push('No se pudo leer la fecha.');

  // Importes
  const imp = (re) => { const x = re.exec(t); return x ? numero(x[1]) : 0; };
  let total = imp(/Importe Total:?\s*\$?\s*([\d.,]+)/i);
  let neto = imp(/Importe Neto Gravado:?\s*\$?\s*([\d.,]+)/i) || imp(/Subtotal:?\s*\$?\s*([\d.,]+)/i);
  let iva = 0;
  const reIva = /IVA\s*(\d{1,2}(?:[.,]\d{1,2})?)\s*%:?\s*\$?\s*([\d.]+,\d{2}|[\d]+\.\d{2})/gi;
  while ((m = reIva.exec(t))) iva += numero(m[2]);
  if (!iva) iva = imp(/Importe IVA:?\s*\$?\s*([\d.,]+)/i);
  let otros = imp(/Importe Otros Tributos:?\s*\$?\s*([\d.,]+)/i) + imp(/Importe No Gravado:?\s*\$?\s*([\d.,]+)/i) + imp(/Importe Exento:?\s*\$?\s*([\d.,]+)/i);
  if (!total) {
    const todos = [...t.matchAll(/Total:?\s*\$?\s*([\d.]+,\d{2})/gi)].map(x => numero(x[1]));
    if (todos.length) total = Math.max(...todos);
  }
  if (total && neto) {
    const resto = Math.round((total - neto - iva - otros) * 100) / 100;
    if (Math.abs(resto) > 0.02) { otros += resto; obs.push('El total no coincide con neto + IVA: la diferencia se cargó en "otros". Revisar.'); }
  } else if (total && !neto) {
    obs.push('No se pudo leer el neto gravado: se cargó el total completo como neto sin IVA. Revisar.');
    neto = total - iva - otros;
  }
  if (!(total > 0)) obs.push('No se pudo leer el importe total.');

  const cae = (/CAE\s*(?:N[°ºo.]*\s*)?:?\s*(\d{14})/i.exec(t) || [])[1] || '';
  let razon = '';
  const mr = /Raz[oó]n Social:?\s*([^\n]+)/i.exec(t);
  if (mr) razon = mr[1].split(/\s(?:Domicilio|Condici[oó]n|CUIT|Fecha|Punto|Ingresos|Comp\.|Per[ií]odo)/i)[0].trim().slice(0, 90);
  if (!razon || /CODES/i.test(razon)) {
    const todas = [...t.matchAll(/Raz[oó]n Social:?\s*([^\n]+)/gi)].map(x => x[1].split(/\s(?:Domicilio|Condici[oó]n|CUIT|Fecha|Punto)/i)[0].trim()).filter(x => x && !/CODES/i.test(x));
    razon = (todas[0] || '').slice(0, 90);
  }
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
