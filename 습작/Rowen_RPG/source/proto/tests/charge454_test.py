"""v4.54 G1-c1 (지시서 §G1) 돌진 원형 — 도토리멧돼지 먼저
1) 배정: 도토리멧돼지 = charge(상태이상 없음) · 관문 정예(왕멧돼지)는 원형 없음 · CHARGE 수치
2) 예고: 거리 100 → 따라가는 예고(aim · 자동 회피 대상 아님) → 고정(aim 아님 · t=0) → 돌진 → 서 있으면 한 번만 맞음 · ×1.45(방어 뒤)
3) 빗나감: 고정 뒤 옆으로 비키면 피해 0 · 경직 1.5초 · 경직 중 받는 피해 ×1.3 · 경직 중 공격 · 이동 없음
4) 쿨 8초 · 가까우면 뒷걸음질 뒤 다시 돌진 · 어그로가 풀리면 돌진 상태 지움
5) 피해 예산: 서 있기 비율 0.90~1.15(Lv4 · 5) · 자동 전투 무리 돌진 피격률 20~40% · 묶음 A/B 차 ≤ 0.15 · 모두 처치
6) 화면 shots/v454_charge.png · 이전 세이브(v4.53) 이어하기 · 페이지 오류 없음"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from fx_util import SETUP_JS
from chg_probe454 import idle,pack,RST
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg,flush=True)
ONE="""([dx,dy,lv])=>{const g=__g,P=g.player,S=g.S;for(const e of g.mobs){e.aggro=false;e.ret=false;e.aim=null;e.chg=null;if(e.sp!=='acornboar'||e.boss||e.eliteOf){e.dead=true;e.deadT=-1e9;e.respawn=1e9;}}
  const L=g.mobs.filter(e=>e.sp==='acornboar'&&!e.boss&&!e.eliteOf);const m=L[0];for(const e of L.slice(1)){e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
  g.tele.length=0;g.shots.length=0;g.clearStatus();g.setAuto(false);S.autoQ=false;g.cancelNav&&g.cancelNav();g.setTarget(null);
  if(!m._h0)m._h0={x:m.home.x,y:m.home.y};let best=null;for(let k=0;k<200&&!best;k++){const x=m._h0.x+((k*37)%160)-80,y=m._h0.y+((k*53)%160)-80;let good=true;for(let d=-40;d<=140;d+=6)if(!g.reachOk(x+d,y))good=false;for(let w=-50;w<=50;w+=10)if(!g.reachOk(x+100,y+w))good=false;if(good)best={x,y};}
  if(!best)return null;m.dead=false;m.x=best.x;m.y=best.y;m.home.x=best.x;m.home.y=best.y;m.lv=lv;const ms=g.mobStats(lv,false);m.atk=ms.atk;m.def=ms.def;m.max=m.hp=1e9;m.atkT=9;m.wind=0;m.aggro=true;m.stag=0;m.chgCd=0;m.backT=0;
  P.dead=false;P.x=best.x+dx;P.y=best.y+dy;P.hp=1e8;P.shield=0;P.dash=0;P.guardT=0;S.hpPot=0;P.lastHit=-1;window.__m=m;return best;}"""
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    errs=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        pg=page(b,errs,'rowen');chk(pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
        r=pg.evaluate("()=>{const g=__g;return {b:g.MOB_B.acornboar,boss:g.mobB({sp:'acornboar',eliteOf:'q5'}),C:g.CHARGE,beh:g.mobBeh(g.mobs.find(e=>e.sp==='acornboar'&&!e.eliteOf))}}")
        print('  INFO',r)
        chk(r['beh']=='charge' and not r['b'].get('fx'),'도토리멧돼지 = 돌진 · 상태이상 없음(입문 구간 보호)')
        chk(r['boss'] is None,'관문 정예 왕멧돼지는 원형 없음')
        C=r['C'];chk(C['aim']==.8 and C['w']==22 and C['spd']==260 and C['dist']==170 and C['cd']==8 and C['stag']==1.5 and C['stagK']==1.3 and C['min']==60 and C['max']==140,'CHARGE 수치(예고 0.8 · 폭 22 · 260 · 최대 170 · 쿨 8 · 경직 1.5 · ×1.3 · 거리 60~140)')
        pg.evaluate(SETUP_JS,4)
        # 2) 예고 → 고정 → 돌진 → 한 번 맞음
        res=pg.evaluate("""([one])=>{const g=__g,P=g.player;const B=(new Function('return '+one))()([100,0,4]);if(!B)return null;const m=window.__m;const px=P.x,py=P.y;const R0=Math.random;Math.random=()=>.5;
          const n0=g.STAT.chgHit||0;let track=null,lock=null,ph=[];g.step(1,.05);const e=m.chg&&m.chg.e;track=e&&{aim:e.aim,w:e.w,len:e.len,dz:!!g.dangerAt(P.x,P.y,0,false)};
          for(let i=0;i<10;i++){g.step(1,.05);P.x=px;P.y=py;}lock=m.chg&&{ph:m.chg.ph,aim:m.chg.e.aim,t:m.chg.e.t,dz:!!g.dangerAt(P.x,P.y,0,false),lk:!!m.chg.lk};
          const hp0=P.hp;let steps=0;while(m.chg&&steps<60){g.step(1,.05);P.x=px;P.y=py;steps++;if(P.lastHit>0)P.lastHit=-1;}
          const taken=hp0-P.hp,hits=(g.STAT.chgHit||0)-n0;Math.random=R0;const b0=m.atk,lf=Math.min(1.25,Math.max(.7,1+.05*(m.lv-g.S.lv))),want=Math.max(b0*.2,b0-g.pStats().def)*lf*g.CHARGE.mul;
          return {track,lock,taken,hits,want,stag:m.stag>g.t,end:Math.hypot(m.x-B.x,m.y-B.y),def:g.pStats().def,atk:m.atk};}""",[ONE])
        print('  INFO 돌진',res)
        chk(res is not None,'시험 자리 찾음(도토리 숲 트인 곳)')
        chk(res['track']['aim'] and res['track']['w']==22 and not res['track']['dz'],'앞 0.45초: 플레이어를 따라가는 예고(위험 판정 제외)')
        chk(res['lock']['lk'] and not res['lock']['aim'] and res['lock']['dz'] and res['lock']['t']<.4,'고정 단계: 방향 고정 · 위험 판정 대상 · 새 예고처럼 t가 0부터')
        chk(res['hits']==1 and res['taken']>0 and not res['stag'],'서 있으면 돌진에 한 번만 맞고 경직 없음 (피해 %.1f)'%res['taken'])
        chk(abs(res['taken']/res['want']-1)<.02,'돌진 피해 = 근접 한 대(방어 뒤) ×1.45 (%.1f / %.1f)'%(res['taken'],res['want']))
        chk(110<=res['end']<=135,'지나쳐 달림(고정 거리 100 + 30 · %.0f)'%res['end'])
        # 3) 빗나감 → 경직 · ×1.3
        res=pg.evaluate("""([one])=>{const g=__g,P=g.player;const B=(new Function('return '+one))()([100,0,4]);if(!B)return null;const m=window.__m;
          const dbg=[];for(let i=0;i<11;i++){g.step(1,.05);dbg.push([!!m.chg,Math.round(Math.hypot(m.x-P.x,m.y-P.y)),m.chgCd,g.t,m.stag,m.wind,m.aggro,m.ret]);}const lk=!!(m.chg&&m.chg.lk);P.y+=45;const hp0=P.hp,n0=g.STAT.chgMiss||0;let s=0;while(m.chg&&s<60){g.step(1,.05);s++;}
          const miss=(g.STAT.chgMiss||0)-n0,stag=m.stag-g.t,taken=hp0-P.hp;const x0=m.x,y0=m.y;
          m.hp=1e9;g.hurtMob(m,100,false);const dS=1e9-m.hp;const atk0=m.atkT;g.step(1,.05);g.step(1,.05);const moved=Math.hypot(m.x-x0,m.y-y0);
          m.stag=0;m.hp=1e9;g.hurtMob(m,100,false);const dN=1e9-m.hp;return {dbg:dbg.slice(0,3),lk,miss,stag,taken,dS,dN,moved,wind:m.wind};}""",[ONE])
        print('  INFO 빗나감',res)
        chk(res['lk'] and res['miss']==1 and res['taken']==0,'고정 뒤 옆으로 비키면 피해 0 · 빗나감 1')
        chk(1.2<res['stag']<=1.5,'경직 1.5초 (%.2f 남음)'%res['stag'])
        chk(abs(res['dS']/res['dN']-1.3)<.01,'경직 중 받는 피해 ×1.3 (%.0f / %.0f)'%(res['dS'],res['dN']))
        chk(res['moved']<.01 and res['wind']==0,'경직 중 이동 · 공격 없음')
        # 4) 쿨 · 뒷걸음질 · 어그로 풀림
        res=pg.evaluate("""([one])=>{const g=__g,P=g.player;(new Function('return '+one))()([100,0,4]);const m=window.__m;const px=P.x,py=P.y;let first=null,second=null,back=0,minD=1e9;
          for(let i=0;i<400;i++){const had=!!m.chg;g.step(1,.05);P.x=px;P.y=py;if(!had&&m.chg){if(first==null)first=g.t;else if(second==null)second=g.t;}if(first!=null&&second==null&&!m.chg){const d=Math.hypot(m.x-P.x,m.y-P.y);minD=Math.min(minD,d);if(m.backT>0)back++;}}
          m.chgCd=0;m.chg=null;m.stag=0;P.x=m.x+100;P.y=m.y;g.step(1,.05);const on=!!m.chg;m.home.x=m.x-400;g.step(1,.05);g.step(1,.05);return {gap:second-first,back,minD,on,off:!m.chg,ret:m.ret,tele:g.tele.filter(e=>e.ownC===m).length};}""",[ONE])
        print('  INFO 쿨',res)
        chk(7.9<=res['gap']<=11.5 and res['back']>0,'쿨 8초 · 가까우면 뒷걸음질 뒤 다시 돌진 (간격 %.1f초)'%res['gap'])
        chk(res['on'] and res['off'] and res['ret'],'집에서 멀어져 어그로가 풀리면 돌진 상태 지움')
        pg.close()
        # 5) 피해 예산
        for lv in (4,5):
            pg=page(b,errs,'rowen');ri=idle(pg,'acornboar',lv,range(1,17));pg.close()
            print('  INFO Lv%d 서 있기 %.3f'%(lv,ri),flush=True)
            chk(.90<=ri<=1.15,'서 있기 비율 Lv%d %.3f (0.90~1.15)'%(lv,ri))
        pg=page(b,errs,'rowen');A=pack(pg,'acornboar',4,range(1,16));pg.close()
        pg=page(b,errs,'rowen');B=pack(pg,'acornboar',4,range(16,31));pg.close()
        ra,rb=A['hit']/max(1,A['chg']),B['hit']/max(1,B['chg'])
        print('  INFO 무리 A',A,'\n  INFO 무리 B',B)
        chk(.20<=ra<=.40 and .20<=rb<=.40 and abs(ra-rb)<=.15,'자동 전투 돌진 피격률 A %.2f · B %.2f (20~40%% · 차 ≤ 0.15)'%(ra,rb))
        chk(A['killed'] and B['killed'],'자동 전투로 무리 모두 처치')
        print('  INFO 자동 전투 피해비(돌진 무리 ÷ 근접 무리) %.2f — 기준 0.60~0.90은 현 확인 필요(지시서 변경 기록)'%(A['taken']/max(1,A['takenM'])))
        # 6) 화면 · 이어하기
        pg=page(b,errs,'rowen');pg.evaluate(SETUP_JS,4)
        pg.evaluate("""([one])=>{const g=__g,P=g.player;(new Function('return '+one))()([95,10,4]);const m=window.__m;m.max=m.hp=60;for(let i=0;i<12;i++)g.step(1,.05);g.snap();g.render();}""",[ONE])
        pg.screenshot(path='shots/v454_charge.png')
        vis=pg.evaluate("()=>({tele:__g.tele.length,ver:document.getElementById('verTag').textContent})");print('  screen',vis)
        chk(vis['tele']>=1,'화면: 돌진 예고 띠')
        pg.evaluate("""()=>{__g.save();const k=Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('"lv"'));if(k){const o=JSON.parse(localStorage.getItem(k));o.ver='v4.53';localStorage.setItem(k,JSON.stringify(o));}}""")
        pg.close()
        pg=b.new_page(viewport={'width':1280,'height':720});errs2=[];pg.on('pageerror',lambda e:errs2.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        has=pg.evaluate("!!document.getElementById('btnCont')&&!document.getElementById('btnCont').hidden")
        pg.click('#btnCont' if has else '#btnStart',timeout=60000);pg.wait_for_timeout(600);pg.evaluate("window.requestAnimationFrame=()=>0;__g.step(100,.05)")
        chk(not errs2,'이어하기 → 오류 없음 '+str(errs2[:2]))
        b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    print('charge454',ok,'ok')
