"""v4.58 G1-d 방어 태세 측정 공용: 처치 시간 비율(방어 태세 ÷ 근접형, 같은 씨앗 · 같은 손) · 서 있기 피해 비율.
손(mode): basic = 스킬을 안 씀(평타만) · smart = 대상이 웅크린 동안(+직전 예고 0.5초) 스킬을 아낌 · auto = 자동 전투 그대로
python3 tests/grd_probe458.py [종] — 수치 출력"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,IDLE
from fx_util import SETUP_JS
from rng_util import PACK_JS
SP={'obsidiancrab':('rowen',(14,15)),'obsidiancrab3':('erna',(35,36)),'stonebeetle':('kardo',(21,22)),'rockcrab':('kardo',(22,23)),'snail':('kardo',(23,24)),'clam':('kardo',(24,25))}
ZONE={'obsidiancrab':'z5','obsidiancrab3':'e3','stonebeetle':'k3','rockcrab':'k3','snail':'k3','clam':'k4'}
SPN=lambda k:k[:-1] if k.endswith('3') else k
GOPT=os.environ.get('GOPT')  # 조정용: '{"first":2}'처럼 GUARD에 덧붙여 잰다
RST="(sp)=>{for(const e of __g.mobs)if(e.sp===sp){e.gdU=0;e.gdN=0;}__g.tele.length=0;}"
HOOK={'basic':"window.__packHook=(L,g)=>{g.player.cd.fill(1e9);};",
 'smart':"window.__packHook=(L,g)=>{const G=g.GUARD,P=g.player,gd=m=>m&&m.gdN&&(m.gdU>g.t||m.gdN-g.t<G.pre);let m=g.target;if(gd(m)){const o=L.filter(e=>!e.dead&&e.aggro&&!gd(e)&&Math.hypot(e.x-P.x,e.y-P.y)<70).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y))[0];if(o){g.setTarget(o);m=o;}}if(gd(m)){for(let i=0;i<P.cd.length;i++)if(P.cd[i]<g.t+.05)P.cd[i]=g.t+.05;}};",  # 직접 잘 대응: 웅크린(곧 웅크릴) 대상이면 가까운(70 안) 다른 개체로 바꿔 치고, 바꿀 게 없으면 스킬을 아낀다
 'auto':"window.__packHook=null;"}
def ktime(pg,sp,lv,seeds,mode,n=4):
    pg.evaluate('(k)=>window.__ksec=k',400 if mode=='basic' else 150)
    if GOPT:pg.evaluate('(o)=>Object.assign(__g.GUARD,JSON.parse(o))',GOPT)
    z=ZONE.get(sp);sp=SPN(sp);pg.evaluate("([z,h])=>{window.__packSec=window.__ksec||150;window.__packHpK=1;window.__packZone=z;window.__packAnc=null;(new Function(h))();}",[z,HOOK[mode]]);pg.evaluate(SETUP_JS,lv)
    G=[];M=[]
    for s in seeds:
        pg.evaluate(RST,sp);G.append(pg.evaluate(PACK_JS,[sp,lv,n,s,'guard']))
        pg.evaluate(RST,sp);M.append(pg.evaluate(PACK_JS,[sp,lv,n,s,'melee']))
    pg.evaluate("window.__packHook=null")
    G=[x for x in G if x];M=[x for x in M if x]
    return dict(sec=sum(x['sec'] for x in G)/max(1,len(G)),secM=sum(x['sec'] for x in M)/max(1,len(M)),killed=all(x['killed']==n for x in G+M),taken=sum(x['taken'] for x in G),takenM=sum(x['taken'] for x in M),n=len(G))
def idle(pg,sp,lv,seeds):
    sp=SPN(sp);pg.evaluate(SETUP_JS,lv);M=[];C=[]
    for s in seeds:
        pg.evaluate(RST,sp);M.append(pg.evaluate(IDLE,[sp,lv,s,'melee']))
        pg.evaluate(RST,sp);C.append(pg.evaluate(IDLE,[sp,lv,s,'guard']))
    return sum(x[0] for x in C)/sum(x[0] for x in M)
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    want=sys.argv[1:] or list(SP);errs=[]
    NS=int(os.environ.get('NS','10'))
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        for sp in want:
            mid,lvs=SP[sp]
            for lv in lvs:
                pg=page(b,errs,mid);ri=idle(pg,sp,lv,range(1,9));pg.close()
                out=[]
                for mode in os.environ.get('MODES','basic,smart,auto').split(','):
                    pg=page(b,errs,mid);r=ktime(pg,sp,lv,range(1,NS+1),mode);pg.close()
                    out.append('%s %.2f(%.1f/%.1f초)%s'%(mode,r['sec']/r['secM'],r['sec'],r['secM'],'' if r['killed'] else ' 미처치'))
                    if mode=='auto':out.append('자동 피해비 %.2f'%(r['taken']/max(1,r['takenM'])))
                print('%s Lv%d 서 있기 %.2f | %s'%(sp,lv,ri,' · '.join(out)),flush=True)
        b.close()
    print('errs',errs[:3])
