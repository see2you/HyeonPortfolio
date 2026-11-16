"""v4.54 G1-c 돌진 측정 공용: 서 있기 비율(돌진형 ÷ 근접형) · 자동 전투 무리 돌진 피격률. 테스트와 조정용 프로브가 같이 쓴다.
python3 tests/chg_probe454.py [종] — 수치 출력"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,IDLE
from fx_util import SETUP_JS
from rng_util import PACK_JS
RST="(sp)=>{for(const e of __g.mobs)if(e.sp===sp){e.chg=null;e.stag=0;e.chgCd=0;e.backT=0;}__g.tele.length=0;}"
SP={'acornboar':('rowen',(3,4,5))}
def idle(pg,sp,lv,seeds):
    pg.evaluate(SETUP_JS,lv);M=[];C=[]
    for s in seeds:
        pg.evaluate(RST,sp);M.append(pg.evaluate(IDLE,[sp,lv,s,'melee']))
        pg.evaluate(RST,sp);C.append(pg.evaluate(IDLE,[sp,lv,s,'charge']))
    return sum(x[0] for x in C)/sum(x[0] for x in M)
def pack(pg,sp,lv,seeds,n=4):
    pg.evaluate("()=>{window.__packSec=120;window.__packHpK=1;}");pg.evaluate(SETUP_JS,lv)
    R=[];RM=[]
    for s in seeds:
        pg.evaluate(RST,sp);R.append(pg.evaluate(PACK_JS,[sp,lv,n,s,'charge']))
    for s in seeds[:8]:
        pg.evaluate(RST,sp);RM.append(pg.evaluate(PACK_JS,[sp,lv,n,s,'melee']))
    R=[x for x in R if x];RM=[x for x in RM if x]
    return dict(chg=sum(x['chg'] for x in R),hit=sum(x['chgHit'] for x in R),killed=all(x['killed']==n for x in R),n=len(R),sec=sum(x['sec'] for x in R)/max(1,len(R)),
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
