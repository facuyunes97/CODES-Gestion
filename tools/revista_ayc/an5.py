import json,re
rows=json.load(open('an_rows.json'))
from collections import Counter
SEC={'A':'Demoliciones','1':'Movimientos de suelos','2':'Cimientos','3':'Aislaciones hidrófugas','4':'Mamposterías y tabiquerías','5':'Estructuras','6':'Revoques hasta 3 m de altura','7':'Revestimientos','8':'Contrapisos','9':'Cielorrasos','10':'Pisos','11':'Escalones, umbrales y solías','12':'Zócalos','13':'Cubiertas','14':'Carpinterías de madera','15':'Carpintería metálica y aluminio','16':'Aluminio línea Modena','17':'Colocación de marcos','18':'Pinturas','19':'Vidrios','20':'Instalación eléctrica (módulo centro boca)','21':'Pared de ladrillo','22':'Cerca perimetral'}
OV={ # (pagina,y): (mat,mo,tot) corregidos a ojo / por la suma
 (88,1996):(None,132452,132452),(88,2171):(None,46181,46181),(89,517):(13906,20420,34326),(89,974):(58812,54382,113194),(89,1285):(58601,30849,89450),(89,1641):(489039,544627,1033666),(89,1775):(387814,502580,890394),
 (89,2176):(51396,9881,61278),(90,635):(109484,32886,142370),(90,1480):(5705,18480,24184),(90,1546):(35309,50915,86224),(90,2615):(35198,21496,56694),(90,2677):(51820,25796,77615),(90,2748):(1311,13100,14411),
 (91,2895):(537190,46841,584031),(91,2966):(471200,54382,525582),(92,1324):(None,61128,61128),(92,1377):(None,46831,46831),(92,2245):(5904,12672,18576),(92,2896):(90834,111063,201897)}
DESC={(91,2599):'PUERTA ENTRADA EUCALIPTUS GRANDIS 43 mm C/MARCO Y HERR. 1.20 X 2.10 PIVOTANTE',(92,2896):'PARED DE LADRILLO COMÚN 0,15 m DE 2,50 m DE ALTURA, POR METRO LINEAL, INCLUYE CIMIENTOS Y PILARES CADA 3 m, SIN REVOQUES',(92,3116):'CERCA PERIMETRAL ALAMBRE TEJIDO ROMBOIDAL, INCLUYE ENCAD. Ho Ao INFERIOR DE 20x20'}
UNI={(91,2599):'un',(92,2896):'ml',(92,3116):'ml',(92,1324):'un',(92,1377):'m2'}
sec_actual='A';items=[]
def top(c):
    return {k:(Counter([v for v in c[k] if v]).most_common(1)[0][0] if any(c[k]) else None) for k in c}
for x in rows:
    code=x['code'].strip();des=x['des'].strip()
    if not x.get('cand'):
        m=re.fullmatch(r'(A|\d{1,2})',code)
        if m and des and len(des)>3 and m.group(1) in SEC: sec_actual=m.group(1)
        continue
    key=(x['page'],x['y'])
    t=top(x['cand'])
    if key in OV: mat,mo,tot=OV[key]
    else: mat,mo,tot=t['mat'],t['mo'],t['tot']
    if not mo or not tot: continue
    ok=abs((mat or 0)+mo-tot)<=1.01
    if not ok and key not in OV and not re.match(r'15',code.replace(',','.')): 
        # descartar ruido sin descripción
        if not des: continue
    # sección por código
    cd=re.sub(r'[^0-9A]','',code)
    cand=[]
    if cd:
        for L in (1,2):
            if cd[:L] in SEC and (cd[:L]==sec_actual or (cd[:L].isdigit() and (sec_actual=='A' and cd[:L]=='1' or sec_actual.isdigit() and int(cd[:L])==int(sec_actual)+1))): cand.append(cd[:L])
    if cand: sec_actual=cand[0]
    elif key==(92,2896): sec_actual='21'
    elif key==(92,3116): sec_actual='22'
    d=DESC.get(key,des)
    d=re.sub(r'^[\[\]|¡"“\s]+','',d).strip().strip('"')
    if not d: continue
    items.append(dict(page=x['page'],y=x['y'],codigo=code,rubro=SEC[sec_actual],nombre=d,unidad=UNI.get(key,x['u'].strip()),mat=mat,mo=mo,tot=tot,ok=ok))
print(len(items))
for i in items: print(i['page'],i['y'],i['rubro'][:14],'|',i['codigo'],'|',i['nombre'][:55],'|',i['unidad'],i['mat'],i['mo'],i['tot'],'' if i['ok'] else '<<NO CIERRA')
json.dump(items,open('an_items.json','w'),ensure_ascii=False)
