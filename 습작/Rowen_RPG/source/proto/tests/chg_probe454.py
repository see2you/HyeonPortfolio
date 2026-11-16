"""v4.54 G1-c 돌진 측정 공용: 서 있기 비율(돌진형 ÷ 근접형) · 자동 전투 무리 돌진 피격률. 테스트와 조정용 프로브가 같이 쓴다.
python3 tests/chg_probe454.py [종] — 수치 출력"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,IDLE
from fx_util import SETUP_JS
from rng_util import PACK_JS
RST="(sp)=>{for(const e of __g.mobs)if(e.sp===sp){e.chg=null;e.stag=0;e.chgCd=0;e.backT=0;}__g.tele.length=0;}"
SP={'acornboar':('rowen',(3,4,5)),'bull':('rowen',(8,9)),'goat':('kardo',(17,18)),'crystalbat':('kardo',(20,21)),'ashbat':('erna',(29,30)),'ashbat3':('erna',(36,37)),'phoenix':('erna',(37,38))}
ZONE={'ashbat':'e1','ashbat3':'e3'}  # v4.57 잿빛박쥐는 두 사냥터 — 키 'ashbat3' = 용암 호수(e3) 개체
SPN=lambda k:'ashbat' if k=='ashbat3' else k
OPT=os.environ.get('CHGOPT')  # v4.56 조정용: '{"lock":.25}'처럼 MOB_B[종]에 덧붙여 잰다
def opt(pg,sp):
    if OPT:pg.evaluate('([sp,o])=>Object.assign(__g.MOB_B[sp],JSON.parse(o))',[sp,OPT])
# v4.57: 서 있기 측정(IDLE)은 플레이어를 그 종 첫 개체 집 +90에 세운다 — 불새 새끼는 그 사이에 둥지 바위가 있어 돌진이 매번 막혀(빗나감) 0.74로 나왔다(측정 자리 탓).
# 집에서 −60~+150 직선 · 플레이어 둘레가 막히지 않았을 때만 그대로 쓰고, 막혔으면 가까운 트인 자리로 옮긴다(이미 트인 종은 결과 불변). z = 그 사냥터 개체 집 기준
SPOT="""([sp,z])=>{const g=__g;const m=g.mobs.find(e=>e.sp===sp&&!e.boss&&!e.eliteOf);const b=g.mobs.find(e=>e.sp===sp&&!e.boss&&!e.eliteOf&&(!z||e.zone===z))||m;if(!m)return null;
  const base=b._h0||{x:b.home.x,y:b.home.y};const ok=(x,y)=>{for(let d=-60;d<=150;d+=6)if(!g.reachOk(x+d,y))return false;for(let w=-50;w<=50;w+=10)if(!g.reachOk(x+90,y+w))return false;return true;};
  if(m===b&&ok(base.x,base.y))return [Math.round(base.x),Math.round(base.y),0];for(let k=0;k<400;k++){const x=base.x+((k*37)%240)-120,y=base.y+((k*53)%240)-120;if(ok(x,y)){m._h1={x,y};return [Math.round(x),Math.round(y),1];}}return null;}"""
def idle(pg,sp,lv,seeds):
    z=ZONE.get(sp);sp=SPN(sp);opt(pg,sp)
    pg.evaluate(SETUP_JS,lv);pg.evaluate(SPOT,[sp,z]);M=[];C=[]
    for s in seeds:
        pg.evaluate(RST,sp);M.append(pg.evaluate(IDLE,[sp,lv,s,'melee']))
        pg.evaluate(RST,sp);C.append(pg.evaluate(IDLE,[sp,lv,s,'charge']))
    return sum(x[0] for x in C)/sum(x[0] for x in M)
def pack(pg,sp,lv,seeds,n=4,anc=None):
    z=ZONE.get(sp);sp=SPN(sp);opt(pg,sp);pg.evaluate("([z,a])=>{window.__packSec=120;window.__packHpK=1;window.__packZone=z;window.__packAnc=a;}",[z,anc]);pg.evaluate(SETUP_JS,lv)
    R=[];RM=[]
    for s in seeds:
        pg.evaluate(RST,sp);R.append(pg.evaluate(PACK_JS,[sp,lv,n,s,'charge']))
    for s in seeds[:8]:
        pg.evaluate(RST,sp);RM.append(pg.evaluate(PACK_JS,[sp,lv,n,s,'melee']))
    R=[x for x in R if x];RM=[x for x in RM if x]
    return dict(chg=sum(x['chg'] for x in R),hit=sum(x['chgHit'] for x in R),killed=all(x['killed']==n for x in R),done=all(x['killed']+x['away']==n and x['away']<=1 for x in R),away=sum(x['away'] for x in R),n=len(R),sec=sum(x['sec'] for x in R)/max(1,len(R)),
      taken=sum(x['taken'] for x in R[:8]),takenM=sum(x['taken'] for x in RM),secM=sum(x['sec'] for x in RM)/max(1,len(RM)))
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    sp=sys.argv[1] if len(sys.argv)>1 else 'acornboar';mid,lvs=SP[sp];errs=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        for lv in lvs:
            pg=page(b,errs,mid);r=idle(pg,sp,lv,range(1,17));pg.close()
            pg=page(b,errs,mid);A=pack(pg,sp,lv,range(1,16));pg.close()
            pg=page(b,errs,mid);B=pack(pg,sp,lv,range(16,31));pg.close()
            print('Lv%d 서 있기 %.3f | A 돌진 %d 맞음 %d (%.2f) %.1f초 | B 돌진 %d 맞음 %d (%.2f) | 자동 피해비 %.2f · 처치 %s %s'%(lv,r,A['chg'],A['hit'],A['hit']/max(1,A['chg']),A['sec'],B['chg'],B['hit'],B['hit']/max(1,B['chg']),A['taken']/max(1,A['takenM']),A['killed'],B['killed']),flush=True)
        b.close()
    print('errs',errs[:3])
