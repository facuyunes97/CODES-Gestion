import json,sys,numpy as np,cv2,pytesseract
from collections import Counter
from PIL import Image
from lab5 import norm
body=json.load(open('lab_body.json'))
gs={p:np.array(Image.open(f'm{p}-{p}.png').convert('L')) for p in (81,82,83,84,85)}
def extra(g,yc):
    outs=[]
    for x0,x1,mar,esc,thr,psm in [(2120,2420,12,3,False,7),(2150,2390,14,3,True,7),(2135,2410,11,2,True,7),(2145,2400,13,5,False,7),(2130,2420,15,3,False,13),(2140,2400,12,4,True,13)]:
        c=g[yc-mar:yc+mar,x0:x1];c=cv2.resize(c,None,fx=esc,fy=esc,interpolation=cv2.INTER_LANCZOS4)
        if thr:_,c=cv2.threshold(c,0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)
        c=cv2.copyMakeBorder(c,20,20,20,20,cv2.BORDER_CONSTANT,value=255)
        outs.append(norm(pytesseract.image_to_string(c,config=f'--psm {psm} -c tessedit_char_whitelist=0123456789,.')))
    return outs
res=[]
for x in body:
    if not x['dud']: continue
    e=extra(gs[x['page']],x['y']);x['dud2']=e
    allv=[o for o in x['dud']+e if o];c=Counter(allv).most_common(2)
    x['final']=c[0][0];x['v1']=c[0][1];x['v2']=c[1] if len(c)>1 else None
json.dump(body,open('lab_body2.json','w'),ensure_ascii=False)
d=[x for x in body if x.get('dud')]
print(len(d),'revisadas; con dudas reales (<7/11 votos):',sum(1 for x in d if x['v1']<7),'; cambió la elección en',sum(1 for x in d if x['final']!=x['pr']))
