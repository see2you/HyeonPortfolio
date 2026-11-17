"""v4.58 G1-d1 (지시서 §G1) 방어 태세 원형 — 첫 종 흑요석게(로웬 잿빛 고원 Lv14~15 · 에르나 용암 호수 Lv35~36)
1) 배정: obsidiancrab = guard(상태이상 없음) · 보스 · 관문 정예는 원형 없음
2) 시간: 싸움이 붙고 1.5초 뒤 첫 웅크림 · 2.5초 · 6.5초마다 · 웅크린 동안 공격 · 이동 안 함 · 직전 0.5초 예고(방패 깜빡임)
3) 피해: 웅크린 동안 평타 ×0.3(−70%) · 스킬 ×0.7(−30%) · 밖에서는 그대로
4) 어그로가 풀리면(집으로) 태세 타이머 초기화
5) 처치 시간(같은 씨앗 · 근접형 대비): 평타만 +25~40% · 직접 잘 대응(웅크린 대상 대신 옆 개체 · 스킬 아끼기) +10% 이하 · 자동 전투는 표로
6) 화면 shots/v458_guard.png(방패) · 이전 세이브(v4.57) 이어하기 · 페이지 오류 없음"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from fx_util import SETUP_JS
from charge454_test import ONE as ONE0
from grd_probe458 import ktime,idle,SP
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg,flush=True)
ONE=ONE0.replace("'acornboar'","'obsidiancrab'")
TIME="""([one])=>{const g=__g,P=g.player;(new Function('return '+one))()([20,0,g.S.lv]);const m=window.__m;m.gdU=0;m.gdN=0;m.atkT=0;const px=P.x,py=P.y;const R0=Math.random;Math.random=()=>.5;
  const ev=[];let on=false,hits=0,hitsG=0,mvG=0,lx=m.x,ly=m.y;const t0=g.t;let h=P.hp;
  for(let i=0;i<1600;i++){g.step(1,.01);P.x=px;P.y=py;const o=g.guardOn(m);if(o!==on){ev.push([o?'on':'off',+(g.t-t0).toFixed(2)]);on=o;}
    if(P.hp<h){hits++;if(o)hitsG++;}h=P.hp;if(o&&Math.hypot(m.x-lx,m.y-ly)>.01)mvG++;lx=m.x;ly=m.y;}
  Math.random=R0;return {ev,hits,hitsG,mvG};}"""
DMG="""([one])=>{const g=__g,P=g.player;(new Function('return '+one))()([20,0,g.S.lv]);const m=window.__m;const R0=Math.random;Math.random=()=>.99;/* 치명 없음 */
  const f=(sk,gd)=>{m.gdU=gd?g.t+5:0;m.hp=1e9;const d=g.playerHit(m,1,sk);return 1e9-m.hp;};const r={ba:f(false,false),baG:f(false,true),sk:f(true,false),skG:f(true,true)};m.gdU=0;Math.random=R0;return r;}"""
RET="""([one])=>{const g=__g,P=g.player;(new Function('return '+one))()([20,0,g.S.lv]);const m=window.__m;m.gdU=0;m.gdN=0;for(let i=0;i<60;i++)g.step(1,.05);const a=[m.gdN>0,g.guardOn(m)];
  P.x=m.home.x+400;P.y=m.home.y;m.x=m.home.x+215;for(let i=0;i<5;i++)g.step(1,.05);return {before:a,ret:m.ret,gdN:m.gdN,gdU:m.gdU};}"""
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    errs=[];tab=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        pg=page(b,errs,'rowen');chk(pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
        r=pg.evaluate("()=>{const g=__g;return {b:g.mobBeh({sp:'obsidiancrab'}),boss:g.mobB({sp:'obsidiancrab',boss:true}),el:g.mobB({sp:'obsidiancrab',eliteOf:{}}),fx:g.MOB_B.obsidiancrab.fx||null,G:g.GUARD,others:['acornboar','fairy','lakesnake','squirrel'].map(k=>g.mobBeh({sp:k}))};}")
        print('  INFO',r)
        chk(r['b']=='guard' and r['boss'] is None and r['el'] is None and r['fx'] is None,'흑요석게 = 방어 태세 · 보스 · 관문 정예는 원형 없음 · 상태이상 없음')
        chk(r['others']==['charge','ranged','melee','melee'],'다른 종 배정 그대로')
        G=r['G'];chk(G['first']==1.5 and G['cd']==6.5 and G['dur']==2.5 and G['baK']==.3 and G['skK']==.7,'GUARD 표 %s'%G)
        pg.evaluate(SETUP_JS,14)
        tm=pg.evaluate(TIME,[ONE]);print('  INFO 시간',tm)
        ev=tm['ev'];ons=[e[1] for e in ev if e[0]=='on'];offs=[e[1] for e in ev if e[0]=='off']
        chk(len(ons)>=2 and abs(ons[0]-1.5)<.03,'첫 웅크림 1.5초 뒤 (%s)'%ons[:3])
        chk(all(abs(offs[i]-ons[i]-2.5)<.03 for i in range(min(len(ons),len(offs)))),'웅크림 2.5초')
        chk(6.49<=ons[1]-ons[0]<=6.5+.46,'6.5초마다 — 휘두르던 공격(0.45초)은 끝낸 뒤 웅크림 (%.2f)'%(ons[1]-ons[0]))
        chk(tm['hits']>=3 and tm['hitsG']==0 and tm['mvG']==0,'웅크린 동안 공격 · 이동 없음 (맞음 %d · 웅크림 중 %d)'%(tm['hits'],tm['hitsG']))
        d=pg.evaluate(DMG,[ONE]);print('  INFO 피해',d)
        chk(abs(d['baG']/d['ba']-.3)<.01,'웅크림 중 평타 ×0.3 (%.0f → %.0f)'%(d['ba'],d['baG']))
        chk(abs(d['skG']/d['sk']-.7)<.01,'웅크림 중 스킬 ×0.7 (%.0f → %.0f)'%(d['sk'],d['skG']))
        rt=pg.evaluate(RET,[ONE]);print('  INFO 귀환',rt)
        chk(rt['before'][0] and rt['ret'] and rt['gdN']==0 and rt['gdU']==0,'어그로가 풀리면 태세 타이머 초기화')
        pg.close()
        for sp in ('obsidiancrab','obsidiancrab3'):
            mid,lvs=SP[sp]
            for lv in lvs:
                pg=page(b,errs,mid);ri=idle(pg,sp,lv,range(1,9));pg.close()
                R={}
                for mode in ('basic','smart','auto'):
                    pg=page(b,errs,mid);R[mode]=ktime(pg,sp,lv,range(1,9),mode);pg.close()
                rb,rs,ra=(R[k]['sec']/R[k]['secM'] for k in ('basic','smart','auto'));rt=R['auto']['taken']/max(1,R['auto']['takenM'])
                print('  INFO %s Lv%d 서 있기 피해비 %.2f · 처치 시간 평타만 %.2f · 잘 대응 %.2f · 자동 %.2f · 자동 피해비 %.2f'%(sp,lv,ri,rb,rs,ra,rt),flush=True)
                tab.append((sp,lv,round(ri,2),round(rb,2),round(rs,2),round(ra,2),round(rt,2)))
                chk(1.25<=rb<=1.40,'%s Lv%d 평타만 처치 시간 %.2f (+25~40%%)'%(sp,lv,rb))
                chk(rs<=1.10,'%s Lv%d 직접 잘 대응 처치 시간 %.2f (+10%% 이하)'%(sp,lv,rs))
                chk(all(R[k]['killed'] for k in R),'%s Lv%d 모두 처치'%(sp,lv))
                chk(ri<1.0,'%s Lv%d 서 있기 받는 피해는 근접형보다 적음 %.2f'%(sp,lv,ri))
        pg=page(b,errs,'rowen');pg.evaluate(SETUP_JS,14)
        pg.evaluate("""([one])=>{const g=__g;(new Function('return '+one))()([40,14,14]);const m=window.__m;m.max=2000;m.hp=1300;m.gdN=g.t+.01;m.atkT=9;for(let i=0;i<6;i++)g.step(1,.05);g.setTarget(m);g.snap();g.render();}""",[ONE])
        pg.evaluate("()=>{const e=document.getElementById('toasts');if(e)e.innerHTML='';document.querySelectorAll('.tip,.bubble,#tipBox').forEach(x=>x.remove());__g.render();}");pg.wait_for_timeout(200);pg.screenshot(path='shots/v458_guard.png')
        vis=pg.evaluate("()=>({on:__g.guardOn(window.__m),ver:document.getElementById('verTag').textContent})");print('  screen',vis)
        chk(vis['on'],'화면: 흑요석게 웅크림(방패)')
        pg.evaluate("""()=>{__g.save();const k=Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('"lv"'));if(k){const o=JSON.parse(localStorage.getItem(k));o.ver='v4.57';localStorage.setItem(k,JSON.stringify(o));}}""")
        pg.close()
        pg=b.new_page(viewport={'width':1280,'height':720});errs2=[];pg.on('pageerror',lambda e:errs2.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        has=pg.evaluate("!!document.getElementById('btnCont')&&!document.getElementById('btnCont').hidden")
        pg.click('#btnCont' if has else '#btnStart',timeout=60000);pg.wait_for_timeout(600);pg.evaluate("window.requestAnimationFrame=()=>0;__g.step(100,.05)")
        chk(not errs2,'이어하기 → 오류 없음 '+str(errs2[:2]))
        b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    print('TABLE',tab)
    print('guard458',ok,'ok')
