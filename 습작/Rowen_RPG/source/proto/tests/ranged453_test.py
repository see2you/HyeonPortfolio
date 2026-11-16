"""v4.53 G1-b2c2 (지시서 §G1) 원거리 나머지 3종(동굴버섯 · 이끼돌정령 · 불꽃정령) + 꼬리 판 원인 고침
꼬리 판 원인: 자동 전투(사냥 지정 없음)는 자리(anchor)에서 SCAN+50(220) 밖 대상을 버리고 자리로 걸어 돌아간다(직선 걸음).
원거리 몬스터가 물러나 220 밖에서 쏘면 → 대상을 버림 → 자리로 가다 지형에 막혀 그 자리에 선 채 180초 133발을 다 맞았다.
고침: ① 나를 공격 중인 몬스터(어그로 · 140 안)는 자리 범위 밖이어도 버리지 않는다 ② 자리로 가는 걸음이 막히면 지금 자리를 새 자리로.
1) 배정: 원거리 6종 · 종별 속도(동굴버섯 190 · 이끼돌정령 215 · 불꽃정령 기본) · 셋 체력 ×0.8
2) 자리 규칙: 어그로 원거리가 자리 250 · 나 100이면 대상 유지(자리로 돌아가지 않음) / 어그로 아니면 예전대로 자리로
3) 막힌 귀환: 자리로 가는 직선이 벽이면 자리를 지금 위치로 바꾼다(그 자리에서 멈춰 서 있지 않음)
4) 꼬리 판 재현 시나리오(동굴버섯 Lv18 · 씨앗 1~30 차례로): 판별 최대 쏜 수 ≤ 20 · 모두 처치
5) 이전 세이브(v4.52 형식) 이어하기 · 화면 shots/v453_ranged.png(카르도 동굴버섯) · 버전 · 페이지 오류 없음"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML,SETUP_JS,HPK
from rng_util import PACK_JS
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg,flush=True)
ISO="""()=>{const g=__g,P=g.player;for(const e of g.mobs){e.aggro=false;e.ret=false;e.aim=null;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}g.shots.length=0;g.tele.length=0;g.clearStatus();g.setTarget(null);g.resetAuto();P.hp=1e8;P.shield=0;P.dead=false;g.S.autoQ=false;g.cancelNav&&g.cancelNav();}"""
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    errs=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        pg=page(b,errs,'kardo');chk(pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
        r=pg.evaluate("""()=>{const g=__g;return {rng:Object.keys(g.MOB_B).filter(k=>g.MOB_B[k].b==='ranged').sort(),spd:['cavemush','mosswisp','flamewisp'].map(k=>g.MOB_B[k].spd||g.RANGED.spd),
          hp:['cavemush','mosswisp'].map(sp=>{const m=g.mobs.find(e=>e.sp===sp&&!e.boss&&!e.eliteOf&&!e.rift);return m&&m.max/g.mobStats(m.lv,false).hp;}),boss:g.mobB({sp:'cavemush',eliteOf:'q16'})}}""")
        print('  INFO',r)
        chk(r['rng']==sorted(['fairy','mist','embertree','cavemush','mosswisp','flamewisp']),'원거리 6종')
        chk(r['spd']==[190,215,220],'종별 속도 %s'%r['spd'])
        chk(all(x and abs(x-.8)<.03 for x in r['hp']),'동굴버섯 · 이끼돌정령 체력 ×0.8')
        chk(r['boss'] is None,'관문 정예 동굴버섯은 원형 없음')
        pg.evaluate(SETUP_JS,19)
        # 2) 자리 규칙 — 자리 Q에서 시작, 나는 Q+150, 원거리는 Q+250(자리에서 220 밖 · 나에게서 100)
        res=pg.evaluate("""([iso])=>{const g=__g,P=g.player;(new Function('return '+iso))()();
          const m=g.mobs.find(e=>e.sp==='mosswisp'&&!e.boss&&!e.eliteOf&&!e.rift);let Q=null,a=0;
          for(let k=0;k<72&&!Q;k++){const an=k*.0873,x0=m.home.x,y0=m.home.y,c=Math.cos(an),s=Math.sin(an);let good=true;for(let d=0;d<=260;d+=8)if(!g.reachOk(x0-c*(260-d),y0-s*(260-d)))good=false;
            for(let w=-30;w<=30;w+=10)if(!g.reachOk(x0-c*110-s*w,y0-s*110+c*w))good=false;if(good){Q={x:x0-c*250,y:y0-s*250};a=an;}}
          if(!Q)return null;const c=Math.cos(a),s=Math.sin(a);
          const run=(aggro)=>{(new Function('return '+iso))()();P.x=Q.x;P.y=Q.y;g.setAuto(true);g.step(1,.05);const A=g.anchor&&{x:g.anchor.x,y:g.anchor.y};
            P.x=Q.x+c*150;P.y=Q.y+s*150;m.dead=false;m.x=m.home.x;m.y=m.home.y;m.lv=19;m.max=m.hp=1e9;m.atkT=9;m.aggro=aggro;m.ret=false;m.evd=false;m.evU=0;g.setTarget(m);
            const d0=Math.hypot(P.x-A.x,P.y-A.y),dm0=Math.hypot(m.x-A.x,m.y-A.y);for(let i=0;i<20;i++){g.step(1,.05);m.hp=1e9;}const out={A,d0,dm0,d1:Math.hypot(P.x-A.x,P.y-A.y),tgt:g.target===m};g.setAuto(false);m.dead=true;m.respawn=1e9;return out;};
          return {on:run(true),off:run(false)};}""",[ISO])
        print('  INFO 자리 규칙',res)
        chk(res is not None,'시험 자리 찾음(카르도 이끼돌정령 집 근처)')
        on,off=res['on'],res['off']
        chk(on['dm0']>220 and on['tgt'] and on['d1']>=on['d0']-5,'어그로 원거리(자리에서 %.0f · 나에게서 ~100) → 대상 유지 · 자리로 안 돌아감 (%.0f → %.0f)'%(on['dm0'],on['d0'],on['d1']))
        chk(off['d1']<off['d0']-20,'어그로 아님 → 예전대로 자리로 돌아감 (%.0f → %.0f)'%(off['d0'],off['d1']))
        # 3) 막힌 귀환
        bl=pg.evaluate("""([iso])=>{const g=__g,P=g.player;(new Function('return '+iso))()();const PL=g.PLAZA||{x:0,y:0};
          for(const m of g.mobs.filter(e=>e.sp==='cavemush'&&!e.boss)){for(let k=0;k<400;k++){const x=m.home.x+((k*37)%200)-100,y=m.home.y+((k*53)%200)-100;
            if(!g.reachOk(x,y))continue;if(!g.blockedAt(x+8,y)||g.blockedAt(x,y))continue;
            P.x=x+40;P.y=y;g.setAuto(true);g.step(1,.05);const A=g.anchor&&{x:g.anchor.x,y:g.anchor.y};if(!A||Math.abs(A.x-(x+40))>1)continue;
            P.x=x;P.y=y;for(let i=0;i<10;i++)g.step(1,.05);const B=g.anchor&&{x:g.anchor.x,y:g.anchor.y};const pp={x:P.x,y:P.y};g.setAuto(false);return {F:{x,y},A,B,P:pp};}}return null;}""",[ISO])
        print('  INFO 막힌 귀환',bl)
        chk(bl is not None,'벽 앞 시험 자리 찾음')
        chk(abs(bl['B']['x']-bl['P']['x'])<2 and abs(bl['B']['y']-bl['P']['y'])<2 and abs(bl['B']['x']-bl['A']['x'])>20,'자리로 가는 직선이 막히면 지금 위치가 새 자리')
        pg.close()
        # 4) 꼬리 판 재현 — v4.52에서 씨앗 4 · 25가 180초 133발
        pg=page(b,errs,'kardo');pg.evaluate("(k)=>{window.__packSec=180;window.__packHpK=k;}",HPK[18]);pg.evaluate(SETUP_JS,18)
        R=[pg.evaluate(PACK_JS,['cavemush',18,4,s,'ranged']) for s in range(1,31)]
        mx=max(x['shots'] for x in R);hi=sum(x['hits'] for x in R);sh=sum(x['shots'] for x in R)
        print('  INFO 동굴버섯 Lv18 씨앗 1~30: 최대 %d발 · 피격 %d/%d · 최장 %.1f초'%(mx,hi,sh,max(x['sec'] for x in R)))
        chk(mx<=20 and all(x['killed']+x['away']==4 for x in R),'꼬리 판 없음 (판별 최대 %d발 ≤ 20 · 모두 처치)'%mx)
        # 5) 화면 · 이어하기
        pg.evaluate("""()=>{const g=__g,P=g.player;const L=g.mobs.filter(e=>e.sp==='cavemush'&&!e.boss&&!e.eliteOf&&!e.rift).slice(0,2);const m=L[0];P.x=m.home.x+95;P.y=m.home.y;P.hp=1e6;
          L.forEach((e,i)=>{e.x=m.home.x;e.y=m.home.y-i*45;e.aggro=true;e.atkT=i?0:2;e.aim=null;e.dead=false;});for(let i=0;i<14;i++){g.step(1,.05);P.x=m.home.x+95;P.y=m.home.y;}g.mobShoot(m,P.x,P.y);g.shotTick(.12);g.snap();g.render();}""")
        pg.screenshot(path='shots/v453_ranged.png')
        vis=pg.evaluate("()=>({shots:__g.shots.length,ver:document.getElementById('verTag').textContent,map:__g.map})");print('  screen',vis)
        chk(vis['shots']>=1 and vis['map']=='kardo','화면: 카르도 동굴버섯 투사체')
        pg.evaluate("""()=>{__g.save();const k=Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('"lv"'));if(k){const o=JSON.parse(localStorage.getItem(k));o.ver='v4.52';localStorage.setItem(k,JSON.stringify(o));}}""")
        pg.close()
        pg=b.new_page(viewport={'width':1280,'height':720});errs2=[];pg.on('pageerror',lambda e:errs2.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        has=pg.evaluate("!!document.getElementById('btnCont')&&!document.getElementById('btnCont').hidden")
        pg.click('#btnCont' if has else '#btnStart',timeout=60000);pg.wait_for_timeout(600);pg.evaluate("window.requestAnimationFrame=()=>0;__g.step(100,.05)")
        chk(not errs2,'이어하기 → 오류 없음 '+str(errs2[:2]))
        b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    print('ranged453',ok,'ok')
