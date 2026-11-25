import json,re,itertools
from collections import Counter
def solve(c):
    sets={k:[v for v in c[k]] for k in c}
    best=None
    opts={k:list({v for v in sets[k] if v is not None and v>0 and v<1e8}|{None}) for k in sets}
    def votes(k,v): return sum(1 for x in sets[k] if x==v)
    for m in opts['mat']:
        for o in opts['mo']:
            for t in opts['tot']:
                if o is None or t is None: continue
                ok=(abs((m or 0)+o-t)<=1.01)
                s=votes('mat',m)+votes('mo',o)+votes('tot',t)+(12 if ok else 0)
                if best is None or s>best[0]: best=(s,m,o,t,ok)
    return best
rows=[]
for p in (88,89,90,91,92):
    for x in json.load(open(f'an_{p}.json')):
        x['page']=p;rows.append(x)
out=[];
for i,x in enumerate(rows):
    if not x.get('cand'): continue
    b=solve(x['cand'])
    x['sol']=b
    # filas de ingredientes (sin precios válidos) se descartan
    if b is None: continue
    out.append(x)
bad=[x for x in out if not x['sol'][4]]
print(len(out),'filas con precios;',len(bad),'no cierran mat+mo=total')
for x in bad: print(x['page'],x['y'],repr(x['code']),x['des'][:50],x['sol'][1:4],x['cand'])
json.dump(rows,open('an_rows.json','w'),ensure_ascii=False,default=float)
print('--- sin descripción:')
for x in out:
    if not x['des'].strip(): print(x['page'],x['y'],repr(x['code']),x['u'],x['sol'][1:4])
