import {analizar} from './parser.js';
import fs from 'fs';
let fails=0;const ok=(c,m)=>{console.log((c?'OK  ':'FAIL')+' '+m);if(!c)fails++};
const src=fs.readFileSync('./test_emitidas.mjs','utf8');
const a1=/const a1=`([^`]*)`/.exec(src)[1];
for(const [cod,esp] of [['081','A'],['082','B'],['111','C'],['112','NC_A']]){
  const t=a1.replace('FACTURAA COD. 01','TIQUE FACTURA '+(esp.slice(-1))+' COD. '+cod);
  const r=analizar(t,'30717002454_001_00001_00000001.pdf',{emitidas:true});
  ok(r.datos&&r.datos.tipo===esp,'Tique cód. '+cod+' -> '+esp+' (salió '+(r.datos&&r.datos.tipo)+')');
}
console.log(fails?'FALLAS '+fails:'TODO OK');process.exit(fails?1:0)
