"""v4.59 G1-d2 자폭 측정 공용: 무리(4마리)를 자동 전투로 처치까지 — 같은 씨앗으로 자폭형 ÷ 근접형.
손(mode): smart = 고정되는 즉시 바깥으로 걸음(직접 잘 대응) · stand = 폭발을 피하지 않음(고정된 예고가 있는 동안 자리 고정 · 그 밖은 자동 전투 — '대응 없음' 서 있기) · auto = 자동 전투 그대로(0.3초 뒤 회피)
피격률 = 폭발에 맞은 수 ÷ 부풀기 시작 수(부풀기 중 처치해 막은 것도 '안 맞음')
python3 tests/bst_probe459.py [종] — 수치 출력 · BOPT='{"lock":.5}' 로 MOB_B[종]에 덧붙여 잰다"""
import os,sys,json
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS
from fx_util import SETUP_JS
from rng_util import PACK_JS
SP={'emberslime':('rowen',(12,13)),'emberslime3':('erna',(33,34))}
ZONE={'emberslime':'z5','emberslime3':'e2'}
SPN=lambda k:k.rstrip('3')
BOPT=os.environ.get('BOPT')
RST="(sp)=>{for(const e of __g.mobs)if(e.sp===sp){e.bst=null;}__g.tele.length=0;}"
HOOK={'stand':"window.__packHook=(L,g)=>{const P=g.player,on=L.some(m=>!m.dead&&m.bst&&m.bst.lk);if(on&&window.__pin){P.x=window.__pin.x;P.y=window.__pin.y;}else window.__pin={x:P.x,y:P.y};};",  # 대응 없음: 고정된 폭발 예고가 있는 동안엔 움직이지 않는다(피하지 않음) — 그 밖엔 자동 전투 그대로
 'smart':"window.__packHook=(L,g)=>{const P=g.player,B=g.BURST;for(const m of L)if(!m.dead&&m.bst&&m.bst.lk){const d=Math.hypot(P.x-m.x,P.y-m.y);if(d<B.r+12){const k=82/32/Math.max(1,d);P.x+=(P.x-m.x)*k;P.y+=(P.y-m.y)*k;}}};",  # 직접 잘 대응: 예고가 고정되는 즉시(반응 0초) 바깥으로 걷는다
 'auto':"window.__packHook=null;"}
ST=['bstN','bstHit','bstBoom','bstKill']
def run(pg,sp,lv,seeds,mode,n=4):
    z=ZONE.get(sp);sp=SPN(sp)
    if BOPT:pg.evaluate('([sp,o])=>Object.assign(__g.MOB_B[sp],JSON.parse(o))',[sp,BOPT])
    pg.evaluate("([z,h])=>{window.__packSec=150;window.__packHpK=1;window.__packZone=z;window.__packAnc=null;(new Function(h))();}",[z,HOOK[mode]]);pg.evaluate(SETUP_JS,lv)
    B=[];M=[];st={k:0 for k in ST}
    for s in seeds:
        pg.evaluate(RST,sp);pg.evaluate("window.__pin=null");s0=pg.evaluate("(K)=>K.map(k=>__g.STAT[k]||0)",ST)
        B.append(pg.evaluate(PACK_JS,[sp,lv,n,s,'burst']))
        s1=pg.evaluate("(K)=>K.map(k=>__g.STAT[k]||0)",ST)
        for i,k in enumerate(ST):st[k]+=s1[i]-s0[i]
        pg.evaluate(RST,sp);pg.evaluate("window.__pin=null");M.append(pg.evaluate(PACK_JS,[sp,lv,n,s,'melee']))
    pg.evaluate("window.__packHook=null")
    B=[x for x in B if x];M=[x for x in M if x]
    return dict(st,taken=sum(x['taken'] for x in B),takenM=sum(x['taken'] for x in M),sec=sum(x['sec'] for x in B)/max(1,len(B)),secM=sum(x['sec'] for x in M)/max(1,len(M)),
      killed=all(x['killed']==n for x in B+M),n=len(B))
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    want=sys.argv[1:] or list(SP);errs=[]
    NS=int(os.environ.get('NS','12'))
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        for sp in want:
            mid,lvs=SP[sp]
            for lv in lvs:
                out=[]
                for mode in os.environ.get('MODES','stand,auto,smart').split(','):
                    pg=page(b,errs,mid);r=run(pg,sp,lv,range(1,NS+1),mode);pg.close()
                    out.append('%s 피해비 %.2f · 부풀기 %d 폭발 %d 맞음 %d 막음 %d (피격률 %.2f) · 처치 %.1f/%.1f초%s'%(mode,r['taken']/max(1,r['takenM']),r['bstN'],r['bstBoom'],r['bstHit'],r['bstKill'],r['bstHit']/max(1,r['bstN']),r['sec'],r['secM'],'' if r['killed'] else ' 미처치'))
                print('%s Lv%d | %s'%(sp,lv,' | '.join(out)),flush=True)
        b.close()
    print('errs',errs[:3])
