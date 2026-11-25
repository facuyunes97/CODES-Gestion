import cv2,numpy as np,pytesseract,re,sys,json
from PIL import Image
def blobs_col(g,x0,x1,ymin=500):
    c=g[:,x0:x1]; _,b=cv2.threshold(255-c,0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)
    b=cv2.dilate(b,cv2.getStructuringElement(cv2.MORPH_RECT,(25,5)))
    cs,_=cv2.findContours(b,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    out=[]
    for k in cs:
        x,y,w,h=cv2.boundingRect(k)
        if y>=ymin and 12<=h<=45 and w>=12: out.append((y+h//2,y,h))
    return sorted(out)
def celda(g,y,x0,x1,cfg,esc=2,mar=14):
    c=g[max(0,y-mar):y+mar,x0:x1]
    c=cv2.resize(c,None,fx=esc,fy=esc,interpolation=cv2.INTER_CUBIC)
    c=cv2.copyMakeBorder(c,10,10,10,10,cv2.BORDER_CONSTANT,value=255)
    return pytesseract.image_to_string(c,lang='spa',config=cfg).strip().replace('\n',' ')
if __name__=='__main__':
    g=np.array(Image.open(sys.argv[1]).convert('L'))
    bl=blobs_col(g,200,290);print(len(bl),[b[0] for b in bl[:6]],[b[0] for b in bl[-4:]])
    d=np.diff([b[0] for b in bl]);print('pitch med',np.median(d),'min',d.min(),'max',d.max())
