import {analizar} from './parser.js';
let fails=0;const ok=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m);if(!c)fails++};
const mk=(neto,ivaTxt,tot,extra='')=>`FACTURA A Código 01 Razón Social: Prov SA CUIT: 30-70967697-7 Punto de Venta: 00003 Comp. Nro: 00001234 Fecha de Emisión: 01/10/2026 CUIT: 30-71700245-4 CODES SRL Importe Neto Gravado: $ ${neto} ${ivaTxt} ${extra} Importe Total: $ ${tot} CAE N°: 71234567890123`;
let r=analizar(mk('1.000,00','IVA 10,5%: $ 105,00','1.105,00'));ok(r.datos.alicuota==='10.5'&&r.datos.iva===105&&r.datos.total===1105,'10,5%');
r=analizar(mk('1.000,00','IVA 27%: $ 270,00','1.270,00'));ok(r.datos.alicuota==='27'&&r.datos.iva===270,'27%');
r=analizar(mk('1.000,00','IVA 21%: $ 210,00','1.210,00'));ok(r.datos.alicuota==='21'&&r.datos.iva===210&&r.datos.otros===0,'21%');
r=analizar(mk('1.000,00','IVA 21%: $ 210,00','1.250,00','Importe Otros Tributos: $ 40,00'));ok(r.datos.alicuota==='21'&&r.datos.otros===40&&r.datos.total===1250,'21% + percepción en otros '+JSON.stringify(r.datos));
r=analizar(mk('1.000,00','IVA 0%: $ 0,00','1.000,00'));ok(r.datos.alicuota==='0'&&r.datos.iva===0,'0%');
console.log(fails?'FALLAS':'TODO OK');process.exit(fails?1:0)
