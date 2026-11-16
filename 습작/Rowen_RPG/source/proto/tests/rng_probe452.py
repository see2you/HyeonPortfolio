"""v4.52 G1-b2c 측정 공용: 종 sp를 그 지역 맵에서 서 있기(근접 vs 원거리) · 무리(자동 전투) 측정. 테스트와 조정용 프로브가 같이 쓴다."""
import os,sys
sys.path.insert(0,os.path.dirname(__file__));from fx_util import SETUP_JS;from rng_util import PACK_JS
HTML=os.path.abspath('rowen_mmo_local.html');ARGS=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']
IDLE="""([sp,lv,seed,beh])=>{const g=__g,S=g.S,P=g.player;let a=seed>>>0;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 const keep=g.MOB_B[sp];if(beh==='melee')delete g.MOB_B[sp];const m=g.mobs.find(e=>e.sp===sp&&!e.boss&&!e.eliteOf);if(!m){if(keep)g.MOB_B[sp]=keep;return null;}if(!m._h1)m._h1={x:m.home.x,y:m.home.y};m.home.x=m._h1.x;m.home.y=m._h1.y;
 for(const e of g.mobs){if(e!==m){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}}m.dead=false;m.lv=lv;const ms=g.mobStats(lv,false);m.atk=ms.atk;m.def=ms.def;m.max=m.hp=1e9;m.x=m.home.x;m.y=m.home.y;m.atkT=1;m.wind=0;m.aim=null;m.aggro=true;m.ret=false;
 S.autoQ=false;g.cancelNav&&g.cancelNav();m.evd=false;m.evU=0;m.evL=0;P.dead=false;const px=m.x+90,py=m.y;P.x=px;P.y=py;P.hp=1e8;P.shield=0;S.hpPot=0;g.shots.length=0;g.tele.length=0;g.setAuto(false);const e0=g.STAT.evade||0;
 for(let i=0;i<1200;i++){P.lastHit=1e12;g.step(1,.05);m.hp=1e9;P.x=px;P.y=py;m.home.x=(m.x+px)/2;m.home.y=(m.y+py)/2;if(P.hp<1e7)P.hp=1e8;}
 if(keep)g.MOB_B[sp]=keep;return [1e8-P.hp,(g.STAT.evade||0)-e0];}"""
HPK={lv:(1 if lv<16 else float(os.environ.get('PHPK','1'))) for lv in range(1,41)}  # v4.53: 모든 레벨 무리 체력 그대로(v4.52는 Lv16+ ×0.4) — ×0.4면 한 판 7~9초 · 1~2발이라 피격률이 무리 방향(지형)으로만 정해져 묶음 A/B가 갈림(이끼돌정령 0.29/0.54 · 안개정령 0.38/0.20). 꼬리 판을 고친 뒤로는 Lv26~39도 한 판 20~37초
SP={'cavemush':('kardo',(18,19)),'mosswisp':('kardo',(19,20)),'mist':('kardo',(26,27)),'flamewisp':('erna',(31,32,38,39)),'embertree':('erna',(32,33)),'fairy':('rowen',(5,6))}
def page(b,errs,mid='rowen'):
    pg=b.new_page(viewport={'width':1280,'height':720});pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart',timeout=60000);pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    if mid!='rowen':
        pg.evaluate("(m)=>{const S=__g.S;if(!S.maps.includes(m))S.maps.push(m);}",mid)
        pg.evaluate("async(m)=>{await __g.doTravel(m);}",mid);pg.wait_for_timeout(300);pg.evaluate("window.requestAnimationFrame=()=>0")
    return pg
def idle(pg,sp,lv,seeds):
    pg.evaluate(SETUP_JS,lv);M=[pg.evaluate(IDLE,[sp,lv,s,'melee']) for s in seeds];R=[pg.evaluate(IDLE,[sp,lv,s,'ranged']) for s in seeds]
    return sum(x[0] for x in R)/sum(x[0] for x in M),sum(x[1] for x in R)
def pack(pg,sp,lv,seeds,n=4):
    pg.evaluate("(k)=>{window.__packSec=180;window.__packHpK=k;}",HPK.get(lv,1) if callable(getattr(HPK,"get",None)) else 1)
    pg.evaluate(SETUP_JS,lv);R=[pg.evaluate(PACK_JS,[sp,lv,n,s,'ranged']) for s in seeds];RM=[pg.evaluate(PACK_JS,[sp,lv,n,s,'melee']) for s in seeds[:8]]
    R=[x for x in R if x];RM=[x for x in RM if x]
    return dict(sh=sum(x['shots'] for x in R),hi=sum(x['hits'] for x in R),mx=max([x['shots'] for x in R] or [0]),killed=all(x['killed']+x.get('away',0)==n for x in R),away=sum(x.get('away',0) for x in R),n=len(R),
      sec=sum(x['sec'] for x in R)/max(1,len(R)),taken=sum(x['taken'] for x in R[:8]),takenM=sum(x['taken'] for x in RM))
def measure(b,sp,nseed=30,idle_seeds=16,log=print):
    """종 하나: 레벨마다 서 있기 비율 · 묶음 A/B(레벨을 합쳐) 피격률 · 근접 대비 자동 전투 피해"""
    mid,lvs=SP[sp];errs=[];out={'sp':sp,'idle':{},'A':[0,0],'B':[0,0],'mx':0,'killed':True,'taken':0,'takenM':0,'sec':[]}
    for lv in lvs:
        pg=page(b,errs,mid)
        if idle_seeds:
            r,ev=idle(pg,sp,lv,range(1,idle_seeds+1));out['idle'][lv]=(r,ev);pg.close();pg=page(b,errs,mid)  # 서 있기가 집 자리를 옮겨 둬 무리 측정은 새 페이지에서
        for name,base in (('A',1),('B',101)):
            R=pack(pg,sp,lv,list(range(base,base+nseed)))
            out[name][0]+=R['hi'];out[name][1]+=R['sh'];out['mx']=max(out['mx'],R['mx']);out['killed']&=R['killed'];out['away']=out.get('away',0)+R['away'];out['taken']+=R['taken'];out['takenM']+=R['takenM'];out['sec'].append(R['sec'])
            log('  INFO %s Lv%d 묶음%s 피격 %d/%d · 처치 %.1f초 · 최대 %d발 · 회피해 떠남 %d'%(sp,lv,name,R['hi'],R['sh'],R['sec'],R['mx'],R['away']))
        pg.close()
    out['errs']=errs;return out
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    want=sys.argv[1:] or list(SP)
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        for sp in want:
            o=measure(b,sp);A,B=o['A'],o['B']
            print(sp,'idle',{k:round(v[0],3) for k,v in o['idle'].items()},'A %.3f B %.3f all %.3f'%(A[0]/max(1,A[1]),B[0]/max(1,B[1]),(A[0]+B[0])/max(1,A[1]+B[1])),'mx',o['mx'],'kill',o['killed'],'auto/melee %.2f'%(o['taken']/max(1,o['takenM'])),flush=True)
        b.close()
