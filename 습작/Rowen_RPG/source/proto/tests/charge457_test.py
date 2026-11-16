"""v4.57 G1-c2b (지시서 §G1) 돌진 원형 — 날짐승 3종: 수정박쥐 · 잿빛박쥐(에르나 두 사냥터) · 불새 새끼 → 돌진 6종 완료
1) 배정: crystalbat · ashbat · phoenix = charge(상태이상 없음) · 돌진 6종 모두 charge · 침공 '불새 새끼'(보스 판정)는 원형 없음
2) 날짐승도 지형에 막힌다: 바위 앞에서 돌진이 멈추면 빗나감(경직)
3) 종마다 고정 시간: 예고 0.8초 = 따라감 + 고정(LOCKS) · 돌진 피해 ×1.45(방어 뒤)
4) 피해 예산: 서 있기 비율 0.90~1.15 · 자동 전투 무리 돌진 피격률 20~40% · 묶음 A/B 차 ≤ 0.15 · 모두 처치 (잿빛박쥐는 잿가루 언덕 Lv29~30 · 용암 호수 Lv36~37 모두)
5) 화면 shots/v457_phoenix.png · 이전 세이브(v4.56) 이어하기 · 페이지 오류 없음"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from fx_util import SETUP_JS
from chg_probe454 import idle,pack,SP,SPN
from charge454_test import ONE as ONE0
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg,flush=True)
ONE=ONE0.replace("'acornboar'","window.__sp")
TIMING="""([one,sp])=>{window.__sp=sp;const g=__g,P=g.player;const b=(new Function('return '+one))()([100,0,g.S.lv]);if(!b)return null;const m=window.__m;const px=P.x,py=P.y;m.atkT=9;const R0=Math.random;Math.random=()=>.5;
  let t0=null,tl=null,td=null,hit=0;const h0=P.hp;for(let i=0;i<300&&td==null;i++){g.step(1,.01);P.x=px;P.y=py;const c=m.chg;if(c&&t0==null)t0=g.t-.01;if(c&&c.lk&&tl==null)tl=g.t-.01;if(c&&c.ph==='dash'&&td==null)td=g.t-.01;}
  for(let i=0;i<100;i++){g.step(1,.01);P.x=px;P.y=py;}const want=Math.max(m.atk*.2,m.atk-g.pStats().def)*Math.min(1.25,Math.max(.7,1+.05*(m.lv-g.S.lv)))*g.CHARGE.mul*g.faithIn(m);/* v4.57: 에르나 종은 신앙 요구 — 측정 캐릭터 신앙 부족 보정(받는 피해 +) */Math.random=R0;
  return {track:tl-t0,lock:td-tl,taken:h0-P.hp,want};}"""
WALL="""()=>{const g=__g,P=g.player,S=g.S;const m=g.mobs.find(e=>e.sp==='phoenix'&&!e.boss&&!e.eliteOf);if(!m)return null;
  for(const e of g.mobs){e.aggro=false;e.chg=null;if(e!==m){e.dead=true;e.deadT=-1e9;e.respawn=1e9;}}g.tele.length=0;g.setAuto(false);S.autoQ=false;g.cancelNav&&g.cancelNav();
  let spot=null;for(let y=200;y<1100&&!spot;y+=4)for(let x=200;x<1800&&!spot;x+=4){if(!g.reachOk(x,y))continue;let k=0;while(k<60&&g.reachOk(x+k,y))k+=2;if(k<20||k>=60)continue;let w=k;while(w<70&&!g.reachOk(x+w,y))w+=2;if(w>=40&&w<70&&g.reachOk(x+w+4,y)&&g.reachOk(x+w+30,y))spot={x,y,wall:k};}
  if(!spot)return null;m.dead=false;m.x=m.home.x=spot.x;m.y=m.home.y=spot.y;m.lv=S.lv;const ms=g.mobStats(S.lv,false);m.atk=ms.atk;m.def=ms.def;m.max=m.hp=1e9;m.aggro=true;m.atkT=9;m.stag=0;m.chgCd=0;m.wind=0;
  const px=spot.x+spot.wall+50,py=spot.y;P.x=px;P.y=py;const st=g.pStats();P.hp=st.hp;const h0=P.hp;const R0=Math.random;Math.random=()=>.5;let started=false,stop=false,stag=false;
  for(let i=0;i<200;i++){g.step(1,.01);P.x=px;P.y=py;const c=m.chg;if(c&&c.ph==='dash')started=true;if(started&&!c){stop=m.x<spot.x+spot.wall+2;stag=m.stag>g.t;break;}}Math.random=R0;
  return {spot,started,stop,stag,mx:Math.round(m.x),taken:Math.round(h0-P.hp)};}"""
LOCKS={'crystalbat':.35,'ashbat':.25,'phoenix':.25}  # 측정 뒤 확정값(mobs.js와 같아야 함)
CASES=[('crystalbat','kardo'),('ashbat','erna'),('ashbat3','erna'),('phoenix','erna')]
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    errs=[];res_tab=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        pg=page(b,errs,'rowen');chk(pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
        r=pg.evaluate("()=>{const g=__g;const o={};for(const k of ['bull','goat','crystalbat','ashbat','phoenix','acornboar'])o[k]=g.mobBeh({sp:k});o.bossBull=g.mobB({sp:'bull',boss:true});o.invPh=g.mobB({sp:'phoenix',boss:true,inv:true});o.fx=[g.MOB_B.crystalbat.fx,g.MOB_B.ashbat.fx,g.MOB_B.phoenix.fx];o.lock=[g.MOB_B.crystalbat.lock||null,g.MOB_B.ashbat.lock,g.MOB_B.phoenix.lock];return o;}")
        print('  INFO 배정',r)
        chk(all(r[k]=='charge' for k in ['bull','goat','crystalbat','ashbat','phoenix','acornboar']),'돌진 6종 모두 charge(도토리멧돼지 · 초원황소 · 절벽산양 · 수정박쥐 · 잿빛박쥐 · 불새 새끼)')
        chk(r['bossBull'] is None and r['invPh'] is None and r['fx']==[None,None,None],'보스 · 침공(불새 새끼) · 정예는 원형 없음 · 날짐승 상태이상 없음(G1-e)')
        chk(r['lock']==[LOCKS['crystalbat'] if LOCKS['crystalbat']!=.35 else None,LOCKS['ashbat'],LOCKS['phoenix']],'고정 시간 표 %s'%r['lock'])
        pg.close()
        # 날짐승도 지형에 막힌다: 바로 앞에 막힌 칸이 있는 자리에서 돌진 → 막혀 멈춤 · 빗나감 경직
        pg=page(b,errs,'erna');pg.evaluate(SETUP_JS,37)
        wb=pg.evaluate(WALL);print('  INFO 벽',wb)
        chk(wb and wb['stop'] and wb['stag'] and wb['taken']==0,'날짐승 돌진이 바위에 막혀 멈춤 → 빗나감 경직 · 피해 0')
        pg.close()
        for sp,mid in CASES[:2]+CASES[3:]:
            lk=LOCKS[sp]
            pg=page(b,errs,mid);lv=SP[sp][1][0];pg.evaluate(SETUP_JS,lv)
            t=pg.evaluate(TIMING,[ONE,sp]);print('  INFO 시간',sp,t)
            chk(t and abs(t['track']-(.8-lk))<.03 and abs(t['lock']-lk)<.03,'%s 예고: 따라감 %.2f · 고정 %.2f초 (고정 %.2f)'%(sp,t['track'],t['lock'],lk))
            chk(abs(t['taken']/t['want']-1)<.03,'%s 서 있으면 돌진 한 번 ×1.45 (%.1f / %.1f)'%(sp,t['taken'],t['want']))
            pg.close()
        for sp,mid in CASES:
            for lv in SP[sp][1]:
                pg=page(b,errs,mid);ri=idle(pg,sp,lv,range(1,17));pg.close()
                pg=page(b,errs,mid);A=pack(pg,sp,lv,range(1,16),anc=180);pg.close()
                pg=page(b,errs,mid);B=pack(pg,sp,lv,range(16,31),anc=180);pg.close()
                ra,rb=A['hit']/max(1,A['chg']),B['hit']/max(1,B['chg']);rt=A['taken']/max(1,A['takenM'])
                print('  INFO %s Lv%d 서 있기 %.3f · A %d/%d · B %d/%d · 처치 %.1f초 · 자동 피해비 %.2f'%(sp,lv,ri,A['hit'],A['chg'],B['hit'],B['chg'],A['sec'],rt),flush=True)
                res_tab.append((sp,lv,ri,ra,rb,rt))
                chk(.90<=ri<=1.15,'%s Lv%d 서 있기 비율 %.3f (0.90~1.15)'%(sp,lv,ri))
                chk(.20<=ra<=.40 and .20<=rb<=.40 and abs(ra-rb)<=.15,'%s Lv%d 자동 전투 돌진 피격률 A %.2f · B %.2f (20~40%% · 차 ≤ 0.15)'%(sp,lv,ra,rb))
                chk(A['done'] and B['done'],'%s Lv%d 자동 전투로 무리 처치(추격 한계로 돌아가 자동 전투 범위 밖에 남은 개체는 판당 1 이하 — 빠짐 %d · %d)'%(sp,lv,A['away'],B['away']))
        # 화면 · 이어하기
        pg=page(b,errs,'erna');pg.evaluate(SETUP_JS,37)
        pg.evaluate("""([one])=>{window.__sp='phoenix';const g=__g;(new Function('return '+one))()([110,10,37]);const m=window.__m;m.max=m.hp=2000;m.atkT=9;for(let i=0;i<12;i++)g.step(1,.05);g.snap();g.render();}""",[ONE])
        pg.screenshot(path='shots/v457_phoenix.png')
        vis=pg.evaluate("()=>({tele:__g.tele.length,ver:document.getElementById('verTag').textContent})");print('  screen',vis)
        chk(vis['tele']>=1,'화면: 불새 새끼 돌진 예고 띠')
        pg.evaluate("""()=>{__g.save();const k=Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('"lv"'));if(k){const o=JSON.parse(localStorage.getItem(k));o.ver='v4.56';localStorage.setItem(k,JSON.stringify(o));}}""")
        pg.close()
        pg=b.new_page(viewport={'width':1280,'height':720});errs2=[];pg.on('pageerror',lambda e:errs2.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        has=pg.evaluate("!!document.getElementById('btnCont')&&!document.getElementById('btnCont').hidden")
        pg.click('#btnCont' if has else '#btnStart',timeout=60000);pg.wait_for_timeout(600);pg.evaluate("window.requestAnimationFrame=()=>0;__g.step(100,.05)")
        chk(not errs2,'이어하기 → 오류 없음 '+str(errs2[:2]))
        b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    print('TABLE',res_tab)
    print('charge457',ok,'ok')
