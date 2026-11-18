"""v4.72 G1-h (지시서 §G1) 자동 전투 대응
1) 설정 창: '타겟 우선'에 [원거리 먼저] · 새 줄 '예고 회피'(기본 켬) — 1280×720에서 스크롤 없이 보임 · 누르면 S.cfg 바뀜
2) 웅크린 대상(방어 태세 · 직전 0.5초 포함)에게 재사용 대기 8초 이상 피해 스킬을 아낀다(버프 · 짧은 스킬은 그대로 · 범위 스킬은 곁에 안 웅크린 개체가 있으면 씀)
3) 웅크린 대상 곁(70 안)에 안 웅크린 개체가 있으면 자동 전투가 대상을 바꾼다 · 모두 웅크렸으면 그대로
4) '원거리 먼저': 나를 노리는 원거리 원형 몬스터(200 안)를 먼저 · '퀘스트 대상'이면 지금 대상 유지
5) '예고 회피' 끔 → 장판 안에서도 자동 전투가 피하지 않음 · 켬 → 걸어 나옴
6) 처치 시간(자동 전투 · 같은 씨앗 · 근접형 대비): 돌갑충 Lv21 · 에르나 흑요석게 Lv35 ≤ 1.12 (v4.71: 1.35 · 1.11)
7) 이전 세이브(cfg.dodge 없음) 이어하기 → 오류 없음 · 켬 · 화면 shots/v472_settings.png · 왼쪽 아래 버전"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from fx_util import SETUP_JS
from grd_probe458 import ktime
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg,flush=True)
# 종 sp를 n마리 남기고(나머지는 치움) 플레이어 곁 offs 자리에 둔다 · 모두 어그로 · 체력 크게
PLACE="""([sp,offs])=>{const g=__g,P=g.player,S=g.S;g.setAuto(false);S.autoQ=false;g.cancelNav&&g.cancelNav();g.resetAuto();g.tele.length=0;g.shots.length=0;g.clearStatus();
  const L=g.mobs.filter(e=>e.sp===sp&&!e.boss&&!e.eliteOf).slice(0,offs.length);for(const e of g.mobs)if(!L.includes(e)){e.aggro=false;e.ret=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
  const h=L[0]._h0||(L[0]._h0={x:L[0].home.x,y:L[0].home.y});let base=null;for(let k=0;k<300&&!base;k++){const x=h.x+((k*37)%200)-100,y=h.y+((k*53)%200)-100;let good=true;for(const [dx,dy] of offs.concat([[0,0]]))if(!g.reachOk(x+dx,y+dy))good=false;if(good)base={x,y};}
  if(!base)return null;L.forEach((m,i)=>{m.dead=false;m.x=base.x+offs[i][0];m.y=base.y+offs[i][1];m.home.x=m.x;m.home.y=m.y;m.max=m.hp=1e9;m.atkT=9;m.wind=0;m.aggro=true;m.ret=false;m.gdU=0;m.gdN=t0(g);m.aim=null;m.chg=null;m.bst=null;m.stag=0;m.evU=0;});
  function t0(g){return g.t+50;}
  P.dead=false;P.x=base.x;P.y=base.y;P.hp=1e8;S.hpPot=0;g.setTarget(null);window.__L=L;return {n:L.length};}"""
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    errs=[]
    with sync_playwright() as p:
        b=p.chromium.launch(args=ARGS)
        pg=page(b,errs,'rowen');chk(pg.evaluate("document.getElementById('verTag').textContent").startswith('v4.'),'버전 표시')
        pg.evaluate(SETUP_JS,14)
        r=pg.evaluate("()=>{const g=__g;return {A:g.AUTOH,dodge:g.S.cfg.dodge,tgt:g.S.cfg.tgt||'quest'};}")
        chk(r['A']=={'cd':8,'swap':70,'rng':200} and r['dodge'] is not False,'AUTOH 표 %s · 예고 회피 기본 켬'%r['A'])
        # 1) 설정 창
        pg.evaluate("()=>{__g.openSettings();__g.render&&__g.render();}");pg.wait_for_timeout(300)
        r=pg.evaluate("""()=>{const rows=[...document.querySelectorAll('.setw .srw')];const f=t=>rows.find(r=>r.querySelector('b')&&r.querySelector('b').textContent===t);
          const vis=el=>{const b=el.getBoundingClientRect();return b.top>=0&&b.bottom<=720&&b.left>=0&&b.right<=1280;};
          const tg=f('타겟 우선'),dg=f('예고 회피');return {tg:tg?[...tg.querySelectorAll('button')].map(x=>x.textContent):null,dg:dg?[...dg.querySelectorAll('button')].map(x=>x.textContent):null,
            vis:tg&&dg?[...tg.querySelectorAll('button'),...dg.querySelectorAll('button')].every(vis):false,on:dg?dg.querySelector('button.on').textContent:''};}""")
        print('  INFO',r)
        chk(r['tg']==['퀘스트 대상','가까운 몬스터','원거리 먼저'] and r['dg']==['켬','끔'] and r['on']=='켬','설정 줄: 타겟 우선 3칸 · 예고 회피 켬/끔(켬)')
        chk(r['vis'],'새 설정 버튼이 1280×720에서 스크롤 없이 보임')
        pg.screenshot(path='shots/v472_settings.png')
        r=pg.evaluate("""()=>{const rows=[...document.querySelectorAll('.setw .srw')];const f=t=>rows.find(r=>r.querySelector('b')&&r.querySelector('b').textContent===t);
          [...f('타겟 우선').querySelectorAll('button')].find(x=>x.textContent==='원거리 먼저').click();const a=__g.S.cfg.tgt;
          const rows2=[...document.querySelectorAll('.setw .srw')];[...rows2.find(r=>r.querySelector('b').textContent==='예고 회피').querySelectorAll('button')].find(x=>x.textContent==='끔').click();const d=__g.S.cfg.dodge;
          __g.S.cfg.tgt='quest';__g.S.cfg.dodge=true;__g.closeWin();return [a,d];}""")
        chk(r==['ranged',False],'누르면 S.cfg.tgt=ranged · dodge=false')
        # 2) 아끼는 스킬
        r=pg.evaluate("""()=>{const g=__g,SK=g.SK,ix=id=>SK.findIndex(s=>s.id===id);const m=g.mobs.find(e=>e.sp==='obsidiancrab'&&!e.boss&&!e.eliteOf);m.dead=false;m.gdU=g.t+2;
          const o={gd:g.gdNow(m),star:g.gdSave(ix('star')),quake:g.gdSave(ix('quake')),combo:g.gdSave(ix('combo')),whirl:g.gdSave(ix('whirl')),dash:g.gdSave(ix('dash')),roar:g.gdSave(ix('roar')),guard:g.gdSave(ix('guard'))};
          m.gdU=0;m.gdN=g.t+.3;o.pre=g.gdNow(m);m.gdN=g.t+3;o.far=g.gdNow(m);m.gdN=0;o.none=g.gdNow(m);const f=g.mobs.find(e=>e.sp==='fairy');o.fairy=g.gdNow(Object.assign({},f,{gdN:g.t+.2,gdU:0}));return o;}""")
        print('  INFO',r)
        chk(r['gd'] and r['pre'] and not r['far'] and not r['none'] and not r['fairy'],'웅크림 판정: 웅크림 · 직전 0.5초 · (먼 예정 · 다른 원형은 아님)')
        chk(r['star'] and r['quake'] and r['combo'] and not r['whirl'] and not r['dash'] and not r['roar'] and not r['guard'],'아끼는 스킬 = 피해 스킬 · 재사용 대기 8초 이상(별똥별 · 대지 가르기 · 연속 베기) · 회오리 · 돌진 · 버프는 씀')
        r=pg.evaluate(PLACE,['obsidiancrab',[[24,0],[40,30]]]);chk(r and r['n']==2,'흑요석게 2마리 배치 %s'%r)
        r=pg.evaluate("""()=>{const g=__g,SK=g.SK,ix=SK.findIndex(s=>s.id==='flame');const [a,b]=window.__L;a.gdU=g.t+3;b.gdU=g.t+3;const r1=g.gdSave(ix);b.gdU=0;const r2=g.gdSave(ix);a.gdU=0;return [r1,r2];}""")
        chk(r==[True,False],'범위 스킬(화염 회오리): 곁 모두 웅크림 → 아낌 · 안 웅크린 개체가 r 안 → 씀')
        # 3) 대상 바꾸기
        r=pg.evaluate("""()=>{const g=__g,P=g.player,[a,b]=window.__L;a.gdU=g.t+3;b.gdU=0;b.gdN=g.t+50;g.setTarget(a);g.setAuto(true);for(let i=0;i<3;i++)g.step(1,.05);const t1=g.target===b;
          g.setTarget(a);a.gdU=g.t+3;b.gdU=g.t+3;for(let i=0;i<3;i++)g.step(1,.05);const t2=g.target===a;a.gdU=0;b.gdU=0;g.setAuto(false);return {t1,t2,sw:g.STAT.gdSwap||0};}""")
        chk(r['t1'] and r['t2'] and r['sw']>=1,'웅크린 대상 → 곁 개체로 바꿈 · 둘 다 웅크리면 그대로 %s'%r)
        # 2') 실제 자동 전투가 아끼는지: 한 마리 · 웅크림 · 스킬 준비
        r=pg.evaluate(PLACE,['obsidiancrab',[[20,0]]])
        r=pg.evaluate("""()=>{const g=__g,P=g.player,S=g.S,SK=g.SK,[a]=window.__L;const L=S.slots.map(id=>id&&SK.findIndex(s=>s.id===id)).filter(i=>i!=null&&i>=0);const big=L.filter(i=>SK[i].kind!=='buff'&&SK[i].cd>=8);
          P.mp=1e6;P.cd.fill(0);a.gdU=g.t+2;g.setTarget(a);g.setAuto(true);const s0=g.STAT.gdSave||0;for(let i=0;i<20;i++){P.mp=1e6;a.gdU=Math.max(a.gdU,g.t+1);g.step(1,.05);}
          const saved=big.every(i=>P.cd[i]<=g.t),sv=(g.STAT.gdSave||0)-s0;a.gdU=0;a.gdN=g.t+50;for(let i=0;i<60;i++){P.mp=1e6;g.step(1,.05);}const used=big.some(i=>P.cd[i]>g.t);g.setAuto(false);return {slots:L.map(i=>SK[i].id),big:big.map(i=>SK[i].id),saved,sv,used};}""")
        print('  INFO',r)
        chk(len(r['big'])>=1 and r['saved'] and r['sv']>0 and r['used'],'자동 전투: 웅크린 동안 큰 스킬(%s) 아낌 → 풀리면 씀'%r['big'])
        # 4) 원거리 먼저 (로웬 들꽃요정 + 도토리멧돼지)
        r=pg.evaluate("""()=>{const g=__g,P=g.player,S=g.S;g.setAuto(false);g.resetAuto();const f=g.mobs.find(e=>e.sp==='fairy'&&!e.boss&&!e.eliteOf),bo=g.mobs.find(e=>e.sp==='acornboar'&&!e.boss&&!e.eliteOf);
          for(const e of g.mobs)if(e!==f&&e!==bo){e.aggro=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
          let base=null;for(let k=0;k<400&&!base;k++){const x=f.home.x+((k*37)%260)-130,y=f.home.y+((k*53)%260)-130;if(g.reachOk(x,y)&&g.reachOk(x+25,y)&&g.reachOk(x-150,y))base={x,y};}if(!base)return null;
          const put=(m,x,y)=>{m.dead=false;m.x=x;m.y=y;m.home.x=x;m.home.y=y;m.max=m.hp=1e9;m.aggro=true;m.ret=false;m.evU=0;m.aim=null;m.chg=null;m.atkT=9;m.wind=0;m.chgCd=99;};
          const run=(tg)=>{put(bo,base.x+25,base.y);put(f,base.x-150,base.y);P.x=base.x;P.y=base.y;P.hp=1e8;S.cfg.tgt=tg;g.resetAuto();g.setTarget(bo);g.setAuto(true);for(let i=0;i<3;i++){g.step(1,.05);f.aggro=true;}const r=g.target===f?'fairy':g.target===bo?'boar':String(g.target&&g.target.sp);g.setAuto(false);return r;};
          const q=run('quest'),rg=run('ranged');f.aggro=false;const far=(()=>{put(bo,base.x+25,base.y);put(f,base.x-150,base.y);f.aggro=false;S.cfg.tgt='ranged';g.resetAuto();g.setTarget(bo);g.setAuto(true);g.step(1,.05);const r=g.target===bo;g.setAuto(false);return r;})();
          S.cfg.tgt='quest';return {q,rg,ranged:g.mobBeh(f),idle:far};}""")
        print('  INFO',r)
        chk(r and r['ranged']=='ranged' and r['q']=='boar' and r['rg']=='fairy','원거리 먼저: 나를 노리는 들꽃요정으로 · 퀘스트 대상 설정이면 멧돼지 유지 %s'%r)
        chk(r['idle'],'원거리 먼저: 나를 노리지 않는(어그로 없음) 원거리는 고르지 않음')
        # 5) 예고 회피 끔/켬
        r=pg.evaluate("""()=>{const g=__g,P=g.player,S=g.S;g.setAuto(false);for(const e of g.mobs){e.aggro=false;e.dead=true;e.deadT=-1e9;e.respawn=1e9;}
          const f=g.mobs.find(e=>e.sp==='fairy');let base=null;for(let k=0;k<400&&!base;k++){const x=f.home.x+((k*37)%260)-130,y=f.home.y+((k*53)%260)-130;let good=true;for(let a=0;a<8;a++)if(!g.reachOk(x+Math.cos(a)*70,y+Math.sin(a)*70))good=false;if(good&&g.reachOk(x,y))base={x,y};}
          const run=(dg)=>{S.cfg.dodge=dg;P.x=base.x;P.y=base.y;P.hp=1e8;g.tele.length=0;g.resetAuto();g.teleAdd({kind:'circle',x:base.x+3,y:base.y,r:46,dur:3,hit:()=>{}});g.setAuto(true);for(let i=0;i<20;i++)g.step(1,.05);const d=Math.hypot(P.x-base.x,P.y-base.y);g.setAuto(false);g.tele.length=0;return +d.toFixed(1);};
          const on=run(true),off=run(false);S.cfg.dodge=true;return {on,off};}""")
        print('  INFO',r)
        chk(r['on']>30 and r['off']<2,'예고 회피 켬 → 걸어 나옴(%.1f) · 끔 → 그 자리(%.1f)'%(r['on'],r['off']))
        vt=pg.evaluate("(()=>{const r=document.getElementById('verTag').getBoundingClientRect();return [r.left,r.bottom];})()");chk(vt[0]<200 and vt[1]>600,'왼쪽 아래 버전 표시')
        # 7) 이전 세이브
        pg.evaluate("(()=>{__g.save();})()")
        sv=pg.evaluate("(()=>{const o=JSON.parse(localStorage.getItem('rowen-mmo-v4'));delete o.cfg.dodge;o.cfg.tgt='quest';return JSON.stringify(o);})()");pg.close()
        e2=[];pg2=b.new_page(viewport={'width':1280,'height':720});pg2.on('pageerror',lambda e:e2.append(str(e)))
        pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(20,.05);__g.render()")
        r=pg2.evaluate("__g.S.cfg.dodge");chk(not e2 and r is True,'이전 세이브 이어하기 → 오류 없음 · 예고 회피 켬');pg2.close()
        # 6) 처치 시간
        tab=[]
        for sp,mid,lv in (('stonebeetle','kardo',21),('obsidiancrab3','erna',35)):
            pg=page(b,errs,mid);k=ktime(pg,sp,lv,range(1,7),'auto');pg.close()
            rt=k['sec']/k['secM'];tab.append((sp,lv,rt,k['taken']/max(1,k['takenM'])));print('  %s Lv%d 자동 처치 시간비 %.2f (%.1f/%.1f초) 피해비 %.2f'%(sp,lv,rt,k['sec'],k['secM'],tab[-1][3]),flush=True)
            chk(k['killed'] and rt<=1.12,'%s Lv%d 자동 전투 처치 시간비 %.2f ≤ 1.12'%(sp,lv,rt))
        b.close()
    chk(not errs,'페이지 오류 없음 %s'%errs[:2])
    print('PASS',ok)
