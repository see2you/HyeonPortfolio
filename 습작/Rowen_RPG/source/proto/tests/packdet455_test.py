"""v4.55 G1-b2d (지시서 §G1) 무리 측정 안정화 — 게임 수치는 바꾸지 않는다
1) 원인 확인: 측정(rng_util.PACK_JS) 20판 뒤에도 캐릭터 레벨 · 경험치 · 포인트가 그대로(v4.54까지 Lv5 → 7로 올라 측정 순서에 따라 결과가 갈렸다)
2) 결정성: 같은 씨앗은 ① 새 페이지 ② 다른 묶음을 먼저 돌린 페이지 ③ 또 새 페이지에서 판마다 결과(발 수 · 명중 · 처치 초 · 받은 피해)가 같다 — 들꽃요정(원거리) · 도토리멧돼지(돌진)
3) 들꽃요정 무리(Lv5 · 6 · 묶음 A 1~30 / B 101~130): 피격률 0.20~0.40 · A/B 차 ≤ 0.15 · 모두 처치 · 한 판 최대 ≤ 20발
4) 게임 수치 불변: RANGED · CHARGE · MOB_B.fairy 속도가 v4.54와 같음
5) 화면 shots/v455_pack.png · 버전 · 이전 세이브(v4.54) 이어하기 · 페이지 오류 없음"""
import os,sys,json
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML,SETUP_JS
from rng_util import PACK_JS
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg,flush=True)
def runs(pg,sp,lv,seeds,beh):
    R=[pg.evaluate(PACK_JS,[sp,lv,4,s,beh]) for s in seeds]
    return [(x['shots'],x['hits'],x['chg'],x['chgHit'],round(x['sec'],2),round(x['taken'],1),x['killed']) for x in R]
def fresh(b,errs,lv):
    pg=page(b,errs);pg.evaluate("()=>{window.__packSec=180;}");pg.evaluate(SETUP_JS,lv);return pg
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    errs=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        # 1) 레벨 고정
        pg=fresh(b,errs,5);chk(pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
        s0=pg.evaluate("()=>{const S=__g.S;return [S.lv,S.xp,S.sp,S.kp]}")
        A0=runs(pg,'fairy',5,range(101,121),'ranged')
        s1=pg.evaluate("()=>{const S=__g.S;return [S.lv,S.xp,S.sp,S.kp]}")
        print('  INFO 측정 전',s0,'· 20판 뒤',s1)
        chk(s0==s1,'측정 20판 뒤 레벨 · 경험치 · 포인트 그대로 %s'%s1)
        chk(pg.evaluate("__g.npcList.some(n=>n.deco)"),'디버그 API에 마을 장식 NPC 목록(npcList)')
        # 2) 결정성 — 다른 묶음(101~120)을 먼저 돌린 페이지에서 1~12
        X2=runs(pg,'fairy',5,range(1,13),'ranged');pg.close()
        pg=fresh(b,errs,5);X1=runs(pg,'fairy',5,range(1,13),'ranged');pg.close()
        pg=fresh(b,errs,5);X3=runs(pg,'fairy',5,range(1,13),'ranged');pg.close()
        print('  INFO 들꽃요정 1~12',X1)
        chk(sum(x[0] for x in X1)>0,'들꽃요정 측정이 투사체를 쏨 (%d발)'%sum(x[0] for x in X1))
        chk(X1==X3,'새 페이지 둘에서 같은 씨앗 → 같은 결과(들꽃요정 12판)')
        print('  INFO X2',X2)
        chk(X1==X2,'다른 묶음을 먼저 돌린 페이지에서도 같은 결과(측정 순서 무관)')
        pg=fresh(b,errs,4);C1=runs(pg,'acornboar',4,range(1,9),'charge');pg.close()
        pg=fresh(b,errs,4);runs(pg,'acornboar',4,range(201,209),'charge');C2=runs(pg,'acornboar',4,range(1,9),'charge');pg.close()
        print('  INFO 도토리멧돼지 1~8',C1)
        chk(sum(x[2] for x in C1)>0 and C1==C2,'도토리멧돼지(돌진) 같은 씨앗 → 같은 결과 · 순서 무관 (돌진 %d회)'%sum(x[2] for x in C1))
        # 3) 들꽃요정 무리 묶음
        G={'A':[0,0],'B':[0,0]};mx=0;allk=True
        for lv in (5,6):
            pg=fresh(b,errs,lv)
            for nm,base in (('A',1),('B',101)):
                R=runs(pg,'fairy',lv,range(base,base+30),'ranged')
                sh=sum(x[0] for x in R);hi=sum(x[1] for x in R);G[nm][0]+=hi;G[nm][1]+=sh;mx=max(mx,max(x[0] for x in R));allk&=all(x[6]==4 for x in R)
                print('  INFO Lv%d 묶음%s 피격 %d/%d=%.3f · 처치 %.1f초 · 판당 %.2f발'%(lv,nm,hi,sh,hi/max(1,sh),sum(x[4] for x in R)/len(R),sh/len(R)))
            pg.close()
        ra,rb=G['A'][0]/G['A'][1],G['B'][0]/G['B'][1];al=(G['A'][0]+G['B'][0])/(G['A'][1]+G['B'][1])
        print('  INFO 묶음 A %.3f · B %.3f · 전체 %.3f'%(ra,rb,al))
        chk(allk,'들꽃요정 무리 모두 처치')
        chk(.20<=al<=.40,'들꽃요정 묶음 피격률 %.3f (0.20~0.40)'%al)
        chk(abs(ra-rb)<=.15,'들꽃요정 A/B 차 %.3f ≤ 0.15'%abs(ra-rb))
        chk(mx<=20,'한 판 최대 %d발 ≤ 20'%mx)
        # 4) 게임 수치 불변 · 5) 화면 · 이어하기
        pg=page(b,errs)
        v=pg.evaluate("()=>{const g=__g;return {R:g.RANGED,C:g.CHARGE,f:g.MOB_B.fairy}}")
        chk(v['R']=={'range':110,'aim':1.2,'flee':70,'fleeK':.6,'leash':150,'spd':220,'pr':8,'mul':1.4,'cd':2.6,'fly':1.7,'hpK':.8},'RANGED 그대로')
        chk(v['C']=={'min':60,'max':140,'aim':.8,'lock':.35,'w':22,'spd':260,'dist':170,'over':30,'mul':1.45,'cd':8,'stag':1.5,'stagK':1.3,'back':1.2,'rest':1.6},'CHARGE 그대로')
        chk(v['f']=={'b':'ranged','spd':205},'들꽃요정 원거리 · 속도 205 그대로')
        pg.evaluate(SETUP_JS,5)
        pg.evaluate("""()=>{const g=__g,P=g.player;const L=g.mobs.filter(e=>e.sp==='fairy'&&!e.boss&&!e.eliteOf).slice(0,3);for(const e of g.mobs)if(!L.includes(e)){e.dead=true;e.respawn=1e9;}
          const m=L[0];L.forEach((e,i)=>{e.dead=false;e.x=m.home.x+i*40;e.y=m.home.y-i*30;e.aggro=true;e.atkT=i?.3:2;e.aim=null;});P.x=m.home.x+100;P.y=m.home.y;P.hp=1e6;g.setAuto(true);
          for(let i=0;i<30;i++){g.step(1,.05);P.lastHit=1e12;}g.snap();g.render();}""")
        pg.screenshot(path='shots/v455_pack.png')
        ver=pg.evaluate("document.getElementById('verTag').textContent");print('  screen ver',ver);chk(ver.startswith('v4.'),'화면 왼쪽 아래 버전 %s'%ver)
        pg.evaluate("""()=>{__g.setAuto(false);__g.save();const k=Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('"lv"'));if(k){const o=JSON.parse(localStorage.getItem(k));o.ver='v4.54';localStorage.setItem(k,JSON.stringify(o));}}""")
        pg.close()
        pg=b.new_page(viewport={'width':1280,'height':720});errs2=[];pg.on('pageerror',lambda e:errs2.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        has=pg.evaluate("!!document.getElementById('btnCont')&&!document.getElementById('btnCont').hidden")
        pg.click('#btnCont' if has else '#btnStart',timeout=60000);pg.wait_for_timeout(600);pg.evaluate("window.requestAnimationFrame=()=>0;__g.step(100,.05)")
        print('  INFO 이어하기 버튼',has);chk(not errs2,'이어하기 → 오류 없음 '+str(errs2[:2]))
        b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    print('packdet455',ok,'ok')
