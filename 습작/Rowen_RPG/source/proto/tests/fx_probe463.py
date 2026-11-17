"""v4.63 G1-e2 측정: 독 근접 2종 서 있기(DUEL) · 화상 투사체 불꽃정령 서 있기(IDLE 원거리 ÷ 근접, 화상 있음/없음)
python3 tests/fx_probe463.py [poison|flame]"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from fx_util import SETUP_JS,DUEL_JS
from rng_probe452 import page,ARGS,IDLE
POI={'sandlizard':('kardo',(17,18)),'sulfurbeetle':('erna',(30,31))}
FLM={'flamewisp':('erna',(31,32,38,39))}
NOFX="(sp)=>{const B=__g.MOB_B[sp];window.__fxk=[B.fx,B.fxBy];delete B.fx;delete B.fxBy;}"
REFX="(sp)=>{const B=__g.MOB_B[sp];B.fx=window.__fxk[0];B.fxBy=window.__fxk[1];}"
def poison(b,errs,sp,seeds=range(1,9)):
    mid,lvs=POI[sp];out={}
    for lv in lvs:
        pg=page(b,errs,mid);pg.evaluate(SETUP_JS,lv);A=B=C=0;pr=0
        for s in seeds:
            a=pg.evaluate(DUEL_JS,[sp,lv,60,s,True]);c=pg.evaluate(DUEL_JS,[sp,lv,60,s,False]);A+=a['taken'];B+=a['melee'];C+=c['taken'];pr+=a['procs']
        out[lv]=(A/B,A/C,pr);pg.close()
    return out
def flame(b,errs,sp='flamewisp',seeds=range(1,17)):
    mid,lvs=FLM[sp];out={}
    for lv in lvs:
        pg=page(b,errs,mid);pg.evaluate(SETUP_JS,lv)
        M=[pg.evaluate(IDLE,[sp,lv,s,'melee']) for s in seeds];R=[pg.evaluate(IDLE,[sp,lv,s,'ranged']) for s in seeds]
        pg.evaluate(NOFX,sp);N=[pg.evaluate(IDLE,[sp,lv,s,'ranged']) for s in seeds];pg.evaluate(REFX,sp)
        m=sum(x[0] for x in M);out[lv]=(sum(x[0] for x in R)/m,sum(x[0] for x in N)/m);pg.close()
    return out
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    w=sys.argv[1:] or ['poison','flame'];errs=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        if 'poison' in w:
            for sp in POI:print(sp,{k:tuple(round(x,3) for x in v) for k,v in poison(b,errs,sp).items()},flush=True)
        if 'flame' in w:print('flamewisp idle (with burn, no burn)',{k:tuple(round(x,3) for x in v) for k,v in flame(b,errs).items()},flush=True)
        b.close()
    print('errs',errs[:3])
