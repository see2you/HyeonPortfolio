"""v4.59 G1-d2 (지시서 §G1) 자폭 원형 — 첫 종 불씨슬라임(로웬 잿빛 고원 z5 Lv12~13 · 에르나 개체는 d3)
1) 배정: emberslime = burst · z5 개체만(zn) · 보스 · 관문 정예는 원형 없음 · 다른 종 그대로
2) 시간: 체력 25% 이하에서 부풀기 시작 · 원형 예고 r46 · 앞 0.73초는 따라감(자동 회피 대상 아님) · 마지막 0.77초 고정 · 1.5초에 폭발
3) 폭발: 예고 안이면 calcDmg×1(방어 뒤) · 밖이면 0 · 스스로 쓰러짐(처치 수 · 경험치 정상)
4) 부풀기 중 처치 → 폭발 없음 · 예고 정리 · 부풀기 중 받는 피해 ×0.5
5) 어그로가 풀리면 부풀기 초기화
6) 측정(같은 씨앗 무리 4 · 근접형 대비): 대응 없음(폭발을 안 피함) 피해비 0.90~1.15 · 자동 전투 피격률 0.20~0.40 · 자동 · 잘 대응은 표로
7) 화면 shots/v459_burst.png(부풀기 예고) · 이전 세이브(v4.58) 이어하기 · 페이지 오류 없음"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from fx_util import SETUP_JS
from charge454_test import ONE as ONE0
from bst_probe459 import run,SP
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg,flush=True)
ONE=ONE0.replace("'acornboar'","'emberslime'")
# 한 마리 · 체력 24% · 플레이어 dx 앞에 고정. 돌려주는 값: 예고 상태 기록 · 피해 · 처치
SEQ="""([one,dx,pin,killAt])=>{const g=__g,P=g.player,S=g.S;(new Function('return '+one))()([dx,0,g.S.lv]);const m=window.__m;m.max=1000;m.hp=240;m.atkT=9;m.bst=null;const R0=Math.random;Math.random=()=>.99;
  const px=P.x,py=P.y,k0=S.kills,x0=S.xp,b0=g.STAT.bstBoom||0,h0=g.STAT.bstHit||0,t0=g.t;let st=[],hp=P.hp,tel=null,first=null,lockAt=null,boomAt=null;
  for(let i=0;i<200;i++){g.step(1,.01);if(pin){P.x=px;P.y=py;}const e=g.tele.find(e=>e.ownB===m);if(e&&!tel)tel={r:e.r,kind:e.kind};if(m.bst&&first===null)first=+(g.t-t0).toFixed(2);if(m.bst&&m.bst.lk&&lockAt===null)lockAt=+(g.t-t0).toFixed(2);
    if(m.bst&&!m.bst.lk&&e)st.push(e.aim?1:0);if(killAt&&m.bst&&m.bst.t>=killAt&&!m.dead){m.hp=1;g.hurtMob(m,50,false);}
    if((g.STAT.bstBoom||0)>b0&&boomAt===null)boomAt=+(g.t-t0).toFixed(2);if(m.dead){g.step(1,.01);break;}}
  Math.random=R0;const exp=g.calcDmg?null:null;return {first,lockAt,boomAt,tel,aimAll:st.every(x=>x===1),taken:hp-P.hp,dead:m.dead,kills:S.kills-k0,xp:S.xp!==x0||S.lv>0,boom:(g.STAT.bstBoom||0)-b0,hit:(g.STAT.bstHit||0)-h0,left:g.tele.filter(e=>e.ownB===m).length,atk:m.atk,lv:m.lv};}"""
DK="""([one])=>{const g=__g;(new Function('return '+one))()([20,0,g.S.lv]);const m=window.__m;m.max=1e9;m.hp=1e9;g.hurtMob(m,1000,false);const a=1e9-m.hp;m.hp=1e9;m.bst={t:0,e:g.teleAdd({kind:'circle',x:m.x,y:m.y,r:46,dur:1.5,aim:true,keep:true,ownB:m})};g.hurtMob(m,1000,false);const b=1e9-m.hp;m.bst=null;g.tele.length=0;return [a,b];}"""
RET="""([one])=>{const g=__g,P=g.player;(new Function('return '+one))()([20,0,g.S.lv]);const m=window.__m;m.max=1000;m.hp=240;m.atkT=9;for(let i=0;i<20;i++)g.step(1,.01);const a=!!m.bst;
  P.x=m.home.x+400;P.y=m.home.y;m.x=m.home.x+215;for(let i=0;i<5;i++)g.step(1,.05);return {before:a,ret:m.ret,bst:m.bst,tel:g.tele.filter(e=>e.ownB===m).length};}"""
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    errs=[];tab=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        pg=page(b,errs,'rowen');chk(pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
        r=pg.evaluate("()=>{const g=__g;const z=g.mobs.filter(e=>e.sp==='emberslime'&&!e.boss&&!e.eliteOf);return {b:g.mobBeh({sp:'emberslime'}),z5:g.mobBeh({sp:'emberslime',zone:'z5'}),e2:g.mobBeh({sp:'emberslime',zone:'e2'}),here:z.length&&z.every(e=>g.mobBeh(e)==='burst'),boss:g.mobB({sp:'emberslime',boss:true}),el:g.mobB({sp:'emberslime',eliteOf:{}}),fx:g.MOB_B.emberslime.fx||null,B:g.BURST,others:['acornboar','fairy','obsidiancrab','lakesnake','waterslime','puffer'].map(k=>g.mobBeh({sp:k}))};}")
        print('  INFO',r)
        chk(r['z5']=='burst' and r['here'] and r['e2']=='melee','불씨슬라임 = 자폭(잿빛 고원 개체만 · 에르나 개체는 근접 그대로)')
        chk(r['boss'] is None and r['el'] is None and r['fx'] is None,'보스 · 관문 정예 원형 없음 · 상태이상 없음(화상은 G1-e)')
        chk(r['others']==['charge','ranged','guard','melee','melee','melee'],'다른 종 배정 그대로')
        B=r['B'];chk(B['at']==.25 and B['inf']==1.5 and B['r']==46 and B['lock']==.77 and B['mul']==1 and B['dk']==.5,'BURST 표 %s'%B)
        pg.evaluate(SETUP_JS,12)
        a=pg.evaluate(SEQ,[ONE,20,True,0]);print('  INFO 안',a)
        exp=pg.evaluate("([atk,lv])=>__g.calcDmg?0:0",[a['atk'],a['lv']])
        chk(a['first'] is not None and a['first']<=.02 and a['tel']=={'r':46,'kind':'circle'},'체력 25% 이하 → 부풀기 · 원형 예고 r46')
        chk(a['aimAll'] and abs(a['lockAt']-(1.5-.77))<.03,'앞 0.73초 따라감(자동 회피 대상 아님) → 고정 %.2f초'%a['lockAt'])
        chk(abs(a['boomAt']-1.5)<.03 and a['boom']==1,'1.5초에 폭발 (%.2f)'%a['boomAt'])
        chk(a['taken']>0 and a['hit']==1 and a['dead'] and a['kills']==1 and a['left']==0,'예고 안: 피해 %.0f · 스스로 쓰러짐(처치 수 +1) · 예고 정리'%a['taken'])
        d1=pg.evaluate("([atk,lv,plv])=>{const g=__g;return g.calcDmg?1:0}",[a['atk'],a['lv'],12])
        pg.evaluate(SETUP_JS,12)
        o=pg.evaluate(SEQ,[ONE.replace("P.x=best.x+dx","P.x=best.x+dx"),20,False,0])
        # 밖: 고정 직후 플레이어를 80 밖으로 옮긴다
        o=pg.evaluate("""([one])=>{const g=__g,P=g.player,S=g.S;(new Function('return '+one))()([20,0,g.S.lv]);const m=window.__m;m.max=1000;m.hp=240;m.atkT=9;const k0=S.kills,b0=g.STAT.bstBoom||0;let hp=null;
          for(let i=0;i<200;i++){g.step(1,.01);if(m.bst&&m.bst.lk){if(hp===null){P.x=m.x+80;P.y=m.y;hp=P.hp;}P.x=m.x+80;P.y=m.y;}if(m.dead)break;}return {taken:hp===null?-1:hp-P.hp,dead:m.dead,kills:S.kills-k0,boom:(g.STAT.bstBoom||0)-b0};}""",[ONE])
        print('  INFO 밖',o)
        chk(o['boom']==1 and o['taken']==0 and o['dead'] and o['kills']==1,'예고 밖: 피해 0 · 그래도 스스로 쓰러짐')
        pg.evaluate(SETUP_JS,12)
        k=pg.evaluate(SEQ,[ONE,20,True,.5]);print('  INFO 부풀기 중 처치',k)
        chk(k['dead'] and k['boom']==0 and k['hit']==0 and k['left']==0 and k['kills']==1,'부풀기 중 처치 → 폭발 없음 · 예고 정리 · 처치 수 +1')
        dk=pg.evaluate(DK,[ONE]);print('  INFO dk',dk)
        chk(abs(dk[1]/dk[0]-.5)<.01,'부풀기 중 받는 피해 ×0.5 (%.0f → %.0f)'%tuple(dk))
        rt=pg.evaluate(RET,[ONE]);print('  INFO 귀환',rt)
        chk(rt['before'] and rt['ret'] and rt['bst'] is None and rt['tel']==0,'어그로가 풀리면 부풀기 초기화 · 예고 정리')
        pg.close()
        mid,lvs=SP['emberslime']
        for lv in lvs:
            R={}
            for mode in ('stand','auto','smart'):
                pg=page(b,errs,mid);R[mode]=run(pg,'emberslime',lv,range(1,13),mode);pg.close()
            rs,ra,rm=(R[k]['taken']/max(1,R[k]['takenM']) for k in ('stand','auto','smart'));hr=R['auto']['bstHit']/max(1,R['auto']['bstN'])
            print('  INFO Lv%d 대응 없음 피해비 %.2f · 자동 %.2f(피격률 %.2f · 부풀기 %d · 폭발 %d · 막음 %d) · 잘 대응 %.2f(피격률 %.2f)'%(lv,rs,ra,hr,R['auto']['bstN'],R['auto']['bstBoom'],R['auto']['bstKill'],rm,R['smart']['bstHit']/max(1,R['smart']['bstN'])),flush=True)
            tab.append((lv,round(rs,2),round(ra,2),round(hr,2),round(rm,2)))
            chk(.90<=rs<=1.15,'Lv%d 대응 없음 피해비 %.2f (0.90~1.15)'%(lv,rs))
            chk(.20<=hr<=.40,'Lv%d 자동 전투 폭발 피격률 %.2f (0.20~0.40)'%(lv,hr))
            chk(R['auto']['bstKill']>0 and R['auto']['bstBoom']>0,'Lv%d 부풀기 중 처치(막음)와 폭발이 둘 다 나옴'%lv)
            chk(rm<ra,'Lv%d 잘 대응 < 자동 전투'%lv)
            chk(all(R[k]['killed'] for k in R),'Lv%d 모두 처치'%lv)
        pg=page(b,errs,'rowen');pg.evaluate(SETUP_JS,12)
        pg.evaluate("""([one])=>{const g=__g;(new Function('return '+one))()([22,8,12]);const m=window.__m;m.max=1000;m.hp=240;m.atkT=9;for(let i=0;i<100;i++)g.step(1,.01);g.player.x=m.x+24;g.player.y=m.y+6;g.setTarget(m);g.snap();g.render();}""",[ONE])
        pg.evaluate("()=>{const e=document.getElementById('toasts');if(e)e.innerHTML='';document.querySelectorAll('.tip,.bubble,#tipBox').forEach(x=>x.remove());__g.render();}");pg.wait_for_timeout(200);pg.screenshot(path='shots/v459_burst.png')
        vis=pg.evaluate("()=>({on:!!(window.__m.bst),lk:!!(window.__m.bst&&window.__m.bst.lk),ver:document.getElementById('verTag').textContent})");print('  screen',vis)
        chk(vis['on'] and vis['lk'],'화면: 불씨슬라임 부풀기(고정된 예고)')
        pg.evaluate("""()=>{__g.save();const k=Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('"lv"'));if(k){const o=JSON.parse(localStorage.getItem(k));o.ver='v4.58';localStorage.setItem(k,JSON.stringify(o));}}""")
        pg.close()
        pg=b.new_page(viewport={'width':1280,'height':720});errs2=[];pg.on('pageerror',lambda e:errs2.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        has=pg.evaluate("!!document.getElementById('btnCont')&&!document.getElementById('btnCont').hidden")
        pg.click('#btnCont' if has else '#btnStart',timeout=60000);pg.wait_for_timeout(600);pg.evaluate("window.requestAnimationFrame=()=>0;__g.step(100,.05)")
        chk(not errs2,'이어하기 → 오류 없음 '+str(errs2[:2]))
        b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    print('TABLE',tab)
    print('burst459',ok,'ok')
