import json,re
def unacc(s): return s
# ---------- mano de obra
b=json.load(open('lab_body3.json'))
def rub(r,prev):
    u=r.upper().replace('_',' ').replace('—','').strip()
    u=re.sub(r'[^A-Z0-9 .*%/]','',u)
    if not u.strip(): return prev
    vol=' VOLUM' in (' '+u) or 'VOLUM' in u
    if 'ESTRUCT' in u or 'ESTAUCT' in u or 'ESRRUCT' in u or 'ESTRAUCT' in u:
        if 'MET' in u or 'MEI' in u: return 'Estructuras metálicas'
        return 'Estructuras de hormigón'+(' (por volumen)' if vol else '')
    if 'MIN' in u and 'PINT' in u: return 'Terminaciones y pintura'+(' (por volumen)' if vol else '')
    if 'PINT' in u: return 'Terminaciones y pintura'
    if 'CARP' in u and ('REVES' in u or 'CONTR' in u): return 'Contrapisos, carpetas, revestimientos y pisos'
    if 'CARPINT' in u: return 'Carpinterías'
    if 'PARAM' in u: return 'Paramentos'
    if 'SANIT' in u: return 'Sanitarios'
    if 'ELECT' in u: return 'Electricidad'
    if 'DEMO' in u: return 'Demolición'
    if 'AREAS' in u or ('AUX' in u and 'SUELO' in u): return 'Tareas auxiliares · movimiento de suelo'
    if 'AUX' in u: return 'Tareas auxiliares'
    if 'UBIER' in u or 'CIELORR' in u: return 'Cubiertas, cielorrasos y aislaciones'
    return prev
def unidad(d):
    t=d.lower().replace('m²','m2').replace('m³','m3')
    ms=re.findall(r'(?<![a-z0-9])(m3|m2|ml|mi|un|unid|unidad|gl|kg|hs|c/u|mts)(?![a-z0-9])',t)
    if not ms: return ''
    u=ms[-1]
    return {'mi':'ml','unid':'un','unidad':'un','mts':'ml','c/u':'un'}.get(u,u)
ACR={'pvc':'PVC','h17':'H17','sima':'SIMA','al':'AL','mm':'mm','cm':'cm','float':'FLOAT','dpac':'DPAC'}
def caseify(d):
    L=[c for c in d if c.isalpha()]
    if not L or sum(1 for c in L if c.isupper())/len(L)<0.7: return d
    w=d.lower().split(' ')
    w=[ACR.get(x.strip('.,()'),x) if x.strip('.,()') in ACR else x for x in w]
    r=' '.join(w); return r[:1].upper()+r[1:]
def limpiar(d):
    d=re.sub(r'^[\s|_\-—\[\]¡"]+','',d)
    d=re.sub(r'\s+',' ',d).strip()
    d=re.sub(r'\bm[i!]\.',' ml.',d) if False else d
    d=re.sub(r'(?<=\s)m[i!]\b\.?','ml.',d)
    d=re.sub(r'\bxm3\b','x m3',d)
    d=d.replace('Ripso','Ripio').replace('Ripw0','Ripio')
    return d
items=[];prev='Estructuras de hormigón'
for x in b:
    prev=rub(x['rub'],prev)
    p=float(x['precio'].replace('.','').replace(',','.'))
    n=x['idx']
    items.append(dict(fuente='ayc_mo',revista='2026-10' if n<=96 else '2026-11',codigo=str(n),rubro=prev,nombre=caseify(limpiar(x['des'])) or '(sin descripción)',unidad=unidad(x['des']),p_mo=p,p_mat=None,p_tot=None))
# ---------- análisis de costos
a=json.load(open('an_items.json'))
FIX={'WVERT.':'VERT.','WERT.':'VERT.','PPORCELANATTO':'PORCELANATO','PORCELLANATTO':'PORCELANATO','PUERTAPLACA':'PUERTA PLACA','LATEXLOXON':'LATEX LOXON','ALACAL':'A LA CAL','FINOALA CAL':'FINO A LA CAL','DELADRILLOS':'DE LADRILLOS','DEO0,15':'DE 0,15','DE0.30M':'DE 0,30 m','DECEMENTO':'DE CEMENTO','DELOSETA':'DE LOSETA','LADR.P/':'LADR. P/','"VIGA':'VIGA',"'YESOBAJO LOSA INCU.AZOTADO":'YESO BAJO LOSA INCL./AZOTADO','CICELOSIA':'C/CELOSIA','PUERTAPLACA':'PUERTA PLACA'}
UN={'m2.':'m2','M2.':'m2','M2':'m2','m2':'m2','M3.':'m3','M3':'m3','m3':'m3','Mi':'ml','mi':'ml','omo':'ml','om':'ml','ml':'ml','UN':'un','Un':'un','un':'un','m2':'m2','Mg':'','':''}
for i in a:
    d=i['nombre']
    for k,v in FIX.items(): d=d.replace(k,v)
    d=re.sub(r'\s*\|.*$','',d).strip(); d=re.sub(r'\s+m2\.?\s*$','',d).strip()
    d=re.sub(r'\s+',' ',d)
    d=caseify(d)
    raw=i['unidad'].strip().lower().replace('²','2')
    mm=re.search(r'(m3|m2|ml|un|mi|om|omo)',raw)
    u={'mi':'ml','om':'ml','omo':'ml'}.get(mm.group(1),mm.group(1)) if mm else ''
    if not u:
        if 'Zócalos' in i['rubro']: u='ml'
        elif i['rubro'] in ('Mamposterías y tabiquerías','Revoques hasta 3 m de altura'): u='m2'
    nombre=d
    if i['nombre'].startswith('HASTA 2m2'): nombre='Colocación de marcos hasta 2 m2'
    if i['nombre'].startswith('POR M2'): nombre='Colocación de marcos por m2'
    PRE={'Demoliciones':'Demolición','Pisos':'Piso','Contrapisos':'Contrapiso','Revestimientos':'Revestimiento','Mamposterías y tabiquerías':'Mampostería','Movimientos de suelos':'Movimiento de suelos','Escalones, umbrales y solías':'Escalón/umbral','Cielorrasos':'Cielorraso','Zócalos':'Zócalo'}
    if d.upper().startswith('DE ') and i['rubro'] in PRE:
        r=d[3:].strip(); nombre=PRE[i['rubro']]+' de '+r
    elif d.upper().startswith('DE '): nombre=f"{d} ({i['rubro']})"
    if i['rubro']=='Pinturas' and d=='A LA CAL EN MUROS': nombre='A LA CAL EN MUROS'
    mat=i['mat'];mo=i['mo'];tot=i['tot']
    items.append(dict(fuente='ayc_costos',revista='2026-11',codigo=None,rubro=i['rubro'],nombre=nombre,unidad=u,p_mo=float(mo),p_mat=float(mat) if mat else None,p_tot=float(tot)))
# fix 6.1 rustico interior
for it in items:
    if it['nombre'].startswith('RUSTICO INTERIOR (esp. 2 cm)'): it['p_mat']=5933.0
json.dump(items,open('items_final.json','w'),ensure_ascii=False)
from collections import Counter
print(len(items),Counter(i['fuente'] for i in items))
print(Counter(i['unidad'] for i in items).most_common(15))
print(Counter(i['rubro'] for i in items if i['fuente']=='ayc_mo'))
for i in items[:3]+items[417:422]: print(i)
