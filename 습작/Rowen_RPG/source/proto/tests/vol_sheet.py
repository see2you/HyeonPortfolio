"""양감 비교 시트: 원본(외곽선 finalize) · 현재 · 후보들을 8배로 나란히 그린다. 인자: html, 출력 png, 후보 JSON 목록"""
import sys,os,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1]);OUT=sys.argv[2];VARS=json.loads(sys.argv[3])
JS="""(vars)=>{const A=__g._art,S=8,ids=[['hero','down'],['hero','right'],['hero','up'],['mira','down'],['orvin','down'],['bram','down']],mons=['acornboar','windfox','otter'];
 A.setVolume(false);const rows=[['원본',null],...vars.map(v=>[v.name,v.opt])];const W=(ids.length*24+mons.length*34)*S+140,H=rows.length*38*S+20;
 const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#8a7a58';g.fillRect(0,0,W,H);g.imageSmoothingEnabled=false;g.font='bold 22px sans-serif';
 rows.forEach(([n,o],r)=>{const y=10+r*38*S;g.fillStyle='#fff';g.fillText(n,8,y+40);let x=130;
  for(const [id,dir] of ids){const im=o?A.volumize(A.rawChar(id,dir,false,0),Object.assign({pad:0},o)):A.getSprite0(id,dir,false,0);g.drawImage(im,x,y,im.width*S,im.height*S);x+=24*S;}
  for(const m of mons){const src=A.MONSPR[m][0];/* v4.76: MON_ORIG는 없어졌다(새 그림은 setVolume이 다시 굽는다) */const im=o?A.volumize(src,Object.assign({pad:0,stripOutline:true},o)):src;g.drawImage(im,x,y+(34-im.height/1)*S*0,im.width*S*0.9,im.height*S*0.9);x+=34*S;}});
 return c.toDataURL();}"""
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page()
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    import base64;d=pg.evaluate(JS,VARS);open(OUT,'wb').write(base64.b64decode(d.split(',')[1]));b.close()
