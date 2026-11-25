import sys,json,re,numpy as np,cv2,pytesseract
from collections import Counter
from PIL import Image
from an1 import lineas
VARS=[(2,False),(3,True),(3,False),(4,False),(4,True)]
COLS={'mat':(1560,1835),'mo':(1835,2130),'tot':(2130,2420)}
def normn(v):
    v=re.sub(r'[^\d,.]','',v).strip('.,')
    if not v: return None
    m=re.fullmatch(r'(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?',v)
    if not m: return None
    ent=int(m.group(1).replace('.',''));dec=m.group(2)
    return ent+(int(dec.ljust(2,'0'))/100 if dec else 0)
def celda_num(g,yc,x0,x1,mar=24):
    outs=[]
    for esc,thr in VARS:
        c=g[max(0,yc-mar):yc+mar,x0:x1];c=cv2.resize(c,None,fx=esc,fy=esc,interpolation=cv2.INTER_LANCZOS4)
        if thr:_,c=cv2.threshold(c,0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)
        c=cv2.copyMakeBorder(c,20,20,20,20,cv2.BORDER_CONSTANT,value=255)
        t=pytesseract.image_to_string(c,config='--psm 7 -c tessedit_char_whitelist=0123456789,.').strip()
        outs.append(normn(t))
    return outs
def pagina(path):
    g=np.array(Image.open(path).convert('L'));rows=lineas(path);res=[]
    for r in rows:
        if r['y']<1380 and 'a88' in path or r['y']>3340: continue
        ws=r['w'];code=' '.join(t for x0,x1,t,c in ws if x0<230);des=' '.join(t for x0,x1,t,c in ws if 230<=x0<1440)
        un=' '.join(t for x0,x1,t,c in ws if 1440<=x0<1580);nums=[t for x0,x1,t,c in ws if x0>=1580]
        res.append(dict(y=r['y'],code=code,des=des,u=un,nums=nums))
    items=[]
    for x in res:
        if not x['nums']: items.append(x);continue
        cand={k:celda_num(g,x['y'],*v) for k,v in COLS.items()};x['cand']=cand;items.append(x)
    return items
if __name__=='__main__':
    it=pagina(sys.argv[1]);json.dump(it,open(sys.argv[2],'w'),ensure_ascii=False,default=float);print(sys.argv[1],len(it))
