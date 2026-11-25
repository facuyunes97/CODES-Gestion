import sys,json,re,numpy as np,cv2,pytesseract
from lab3 import *
VARS=[(2,False),(3,True),(3,False),(4,False),(4,True)]
def norm(v):
    v=re.sub(r'[^\d,.]','',v).replace('.',',')
    if not v: return ''
    if ',' not in v and len(v)>=3: v=v[:-2]+','+v[-2:]
    m=re.fullmatch(r'(\d+),(\d{2})',v)
    if not m:
        m=re.fullmatch(r'(\d+),(\d{2})\d*',v)
        if not m: return ''
    return m.group(1)+','+m.group(2)
def precio(g,yc,x0=2140,x1=2400,mar=13):
    outs=[]
    for esc,thr in VARS:
        c=g[yc-mar:yc+mar,x0:x1]
        c=cv2.resize(c,None,fx=esc,fy=esc,interpolation=cv2.INTER_LANCZOS4)
        if thr: _,c=cv2.threshold(c,0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)
        c=cv2.copyMakeBorder(c,20,20,20,20,cv2.BORDER_CONSTANT,value=255)
        outs.append(norm(pytesseract.image_to_string(c,config='--psm 7 -c tessedit_char_whitelist=0123456789,.')))
    from collections import Counter
    cnt=Counter([o for o in outs if o]);
    if not cnt: return '',outs
    best,k=cnt.most_common(1)[0];return best,(outs if k<len(VARS) else None)
def pagina(path):
    g=np.array(Image.open(path).convert('L'));rows=[]
    for yc,y,h in blobs_col(g,200,290,500):
        if yc>3345: continue
        n=celda(g,yc,215,268,'--psm 7 -c tessedit_char_whitelist=0123456789')
        rub=celda(g,yc,300,520,'--psm 7');des=celda(g,yc,545,2120,'--psm 7')
        p,dud=precio(g,int(yc))
        if not p and not n.isdigit(): continue
        rows.append(dict(n_ocr=n,y=int(yc),rub=rub,des=des,pr=p,dud=dud))
    return rows
if __name__=='__main__':
    r=pagina(sys.argv[1]);json.dump(r,open(sys.argv[2],'w'),ensure_ascii=False);print(sys.argv[1],len(r),sum(1 for x in r if x['dud']),'dudosos')
