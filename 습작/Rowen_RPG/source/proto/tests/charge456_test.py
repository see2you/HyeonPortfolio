"""v4.56 G1-c2a (지시서 §G1) 돌진 원형 — 초원황소 · 절벽산양 (네발 짐승 2종 · 박쥐 · 불새 새끼는 G1-c2b)
1) 배정: bull · goat = charge(상태이상 없음 — 기절은 G1-e) · 수정박쥐 · 잿빛박쥐 · 불새 새끼는 아직 근접 · 관문 정예 · 보스는 원형 없음
2) 종마다 고정 시간: 초원황소 lock 0.27초(예고 0.8초 = 따라감 0.53 + 고정 0.27) · 절벽산양 기본 0.35 · 돌진 피해 ×1.45(방어 뒤)
3) 피해 예산: 서 있기 비율 0.90~1.15(초원황소 Lv8 · 9 · 절벽산양 Lv17 · 18) · 자동 전투 무리 돌진 피격률 20~40% · 묶음 A/B 차 ≤ 0.15 · 모두 처치
4) 화면 shots/v456_bull.png · 이전 세이브(v4.55) 이어하기 · 페이지 오류 없음"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from fx_util import SETUP_JS
from chg_probe454 import idle,pack,SP
from charge454_test import ONE as ONE0
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg,flush=True)
ONE=ONE0.replace("'acornboar'","window.__sp")
TIMING="""([one,sp])=>{window.__sp=sp;const g=__g,P=g.player;const b=(new Function('return '+one))()([100,0,g.S.lv]);if(!b)return null;const m=window.__m;const px=P.x,py=P.y;m.atkT=9;const R0=Math.random;Math.random=()=>.5;
  let t0=null,tl=null,td=null,hit=0;const h0=P.hp;for(let i=0;i<300&&td==null;i++){g.step(1,.01);P.x=px;P.y=py;const c=m.chg;if(c&&t0==null)t0=g.t-.01;if(c&&c.lk&&tl==null)tl=g.t-.01;if(c&&c.ph==='dash'&&td==null)td=g.t-.01;}
  for(let i=0;i<100;i++){g.step(1,.01);P.x=px;P.y=py;}const want=Math.max(m.atk*.2,m.atk-g.pStats().def)*Math.min(1.25,Math.max(.7,1+.05*(m.lv-g.S.lv)))*g.CHARGE.mul;Math.random=R0;
  return {track:tl-t0,lock:td-tl,taken:h0-P.hp,want};}"""
CASES=[('bull','rowen',.27),('goat','kardo',.35)]
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    errs=[];res_tab=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        pg=page(b,errs,'rowen');chk(pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
        r=pg.evaluate("()=>{const g=__g;const o={};for(const k of ['bull','goat','crystalbat','ashbat','phoenix','acornboar'])o[k]=g.mobBeh({sp:k});o.bossBull=g.mobB({sp:'bull',boss:true});o.fx=[g.MOB_B.bull.fx,g.MOB_B.goat.fx];o.lock=[g.MOB_B.bull.lock,g.MOB_B.goat.lock];return o;}")
        print('  INFO 배정',r)
        chk(r['bull']=='charge' and r['goat']=='charge' and r['acornboar']=='charge','초원황소 · 절벽산양 · 도토리멧돼지 = 돌진')
        chk(r['crystalbat']=='charge' and r['ashbat']=='charge' and r['phoenix']=='charge','박쥐 2종 · 불새 새끼도 돌진(v4.57 G1-c2b — 측정은 charge457)')
        chk(r['bossBull'] is None and r['fx']==[None,None],'보스 · 정예는 원형 없음 · 상태이상 없음(기절은 G1-e)')
        pg.close()
        for sp,mid,lk in CASES:
            pg=page(b,errs,mid);lv=SP[sp][1][0];pg.evaluate(SETUP_JS,lv)
            t=pg.evaluate(TIMING,[ONE,sp]);print('  INFO 시간',sp,t)
            chk(t and abs(t['track']-(.8-lk))<.03 and abs(t['lock']-lk)<.03,'%s 예고: 따라감 %.2f · 고정 %.2f초 (고정 %.2f)'%(sp,t['track'],t['lock'],lk))
            chk(abs(t['taken']/t['want']-1)<.03,'%s 서 있으면 돌진 한 번 ×1.45 (%.1f / %.1f)'%(sp,t['taken'],t['want']))
            pg.close()
        for sp,mid,lk in CASES:
            for lv in SP[sp][1]:
                pg=page(b,errs,mid);ri=idle(pg,sp,lv,range(1,17));pg.close()
                pg=page(b,errs,mid);A=pack(pg,sp,lv,range(1,16));pg.close()
                pg=page(b,errs,mid);B=pack(pg,sp,lv,range(16,31));pg.close()
                ra,rb=A['hit']/max(1,A['chg']),B['hit']/max(1,B['chg']);rt=A['taken']/max(1,A['takenM'])
                print('  INFO %s Lv%d 서 있기 %.3f · A %d/%d · B %d/%d · 처치 %.1f초 · 자동 피해비 %.2f'%(sp,lv,ri,A['hit'],A['chg'],B['hit'],B['chg'],A['sec'],rt),flush=True)
                res_tab.append((sp,lv,ri,ra,rb,rt))
                chk(.90<=ri<=1.15,'%s Lv%d 서 있기 비율 %.3f (0.90~1.15)'%(sp,lv,ri))
                chk(.20<=ra<=.40 and .20<=rb<=.40 and abs(ra-rb)<=.15,'%s Lv%d 자동 전투 돌진 피격률 A %.2f · B %.2f (20~40%% · 차 ≤ 0.15)'%(sp,lv,ra,rb))
                chk(A['killed'] and B['killed'],'%s Lv%d 자동 전투로 무리 모두 처치'%(sp,lv))
        # 화면 · 이어하기
        pg=page(b,errs,'rowen');pg.evaluate(SETUP_JS,8)
        pg.evaluate("""([one])=>{window.__sp='bull';const g=__g;(new Function('return '+one))()([110,10,8]);const m=window.__m;m.max=m.hp=200;m.atkT=9;for(let i=0;i<12;i++)g.step(1,.05);g.snap();g.render();}""",[ONE])
        pg.screenshot(path='shots/v456_bull.png')
        vis=pg.evaluate("()=>({tele:__g.tele.length,ver:document.getElementById('verTag').textContent})");print('  screen',vis)
        chk(vis['tele']>=1,'화면: 초원황소 돌진 예고 띠')
        pg.evaluate("""()=>{__g.save();const k=Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('"lv"'));if(k){const o=JSON.parse(localStorage.getItem(k));o.ver='v4.55';localStorage.setItem(k,JSON.stringify(o));}}""")
        pg.close()
        pg=b.new_page(viewport={'width':1280,'height':720});errs2=[];pg.on('pageerror',lambda e:errs2.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        has=pg.evaluate("!!document.getElementById('btnCont')&&!document.getElementById('btnCont').hidden")
        pg.click('#btnCont' if has else '#btnStart',timeout=60000);pg.wait_for_timeout(600);pg.evaluate("window.requestAnimationFrame=()=>0;__g.step(100,.05)")
        chk(not errs2,'이어하기 → 오류 없음 '+str(errs2[:2]))
        b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    print('TABLE',res_tab)
    print('charge456',ok,'ok')
