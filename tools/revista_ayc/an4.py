import json,re
from collections import Counter
rows=json.load(open('an_rows.json'))
def ed(a,b):
    a,b=str(int(a)),str(int(b))
    if len(a)!=len(b): return 9
    return sum(1 for x,y in zip(a,b) if x!=y)
res=[]
for x in rows:
    if not x.get('cand'): continue
    c=x['cand'];S={k:Counter([v for v in c[k] if v]) for k in c}
    if not (S['mo'] or S['tot']): continue
    top=lambda k:(S[k].most_common(1)[0] if S[k] else (None,0))
    m,mv=top('mat');o,ov=top('mo');t,tv=top('tot')
    fix=None
    if o and t:
        if abs((m or 0)+o-t)>1.01:
            # opciones de reparación: cambiar uno solo
            cands=[]
            if m: 
                mi=t-o
                if mi>0 and ed(mi,m)<=1+ (1 if abs(mi-m)<5 else 0): cands.append(('mat',mi))
                # candidato por redondeo ±1
                for d in (-1,0,1):
                    if mi+d>0 and ed(mi+d,m)<=1: cands.append(('mat',mi+d))
            oi=t-(m or 0)
            for d in (-1,0,1):
                if oi+d>0 and ed(oi+d,o)<=1: cands.append(('mo',oi+d))
            if m:
                ti=m+o
                for d in (-1,0,1):
                    if ed(ti+d,t)<=1: cands.append(('tot',ti+d))
            if cands:
                cands.sort(key=lambda z:(abs((m if z[0]!='mat' else z[1] or 0)+(o if z[0]!='mo' else z[1])-(t if z[0]!='tot' else z[1])),))
                k,v=cands[0];fix=(k,v)
    x['final']=dict(mat=m,mo=o,tot=t);
    if fix: x['final'][fix[0]]=fix[1];x['fix']=fix
    x['ok']=abs((x['final']['mat'] or 0)+x['final']['mo']-x['final']['tot'])<=1.01 if x['final']['mo'] and x['final']['tot'] else False
    res.append(x)
print(len(res),'items; reparados',sum(1 for x in res if x.get('fix')),'; siguen sin cerrar',sum(1 for x in res if not x['ok']))
for x in res:
    if x.get('fix') or not x['ok']: print(x['page'],x['y'],repr(x['code']),x['des'][:40],'->',x['final'],x.get('fix'),'OK' if x['ok'] else 'NO CIERRA')
json.dump(res,open('an_fixed.json','w'),ensure_ascii=False,default=float)
