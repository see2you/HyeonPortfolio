"""v4.43 균열 보상 재구성(#3-4c): 강화석 ×3→×2(stoneP .14) · 도면 ×2 · 장비 드롭 ×2(eqK) · 비법서 ×2 · 권능 파편 처치당 1%
   · 기대 보상 표(열 9개: 60분 강화석 · 도면 · 비법서 · 장비 · 파편) · 처치 시 추가 장비 · 파편 · 나갈 때 요약 · 1280×720 · 버전 v4.43"""
import sys,os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots'
os.makedirs(OUT,exist_ok=True)
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000);pg.evaluate("localStorage.clear()")
    pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    J=lambda s:pg.evaluate(s)
    chk('버전 v4.x',J("document.getElementById('verTag').textContent").startswith('v4.'))
    R=J("(()=>{const R=__g.RIFT;return {sp:R.stoneP,dk:R.dsgK,ek:R.eqK,sh:R.shardP,rc:[R.rcp[1][1],R.rcp[2][1],R.rcp[3][1]]}})()")
    chk('수치: 강화석 .14(보통 .07의 ×2) · 도면 ×2 · 장비 ×2 · 파편 1%',R['sp']==.14 and R['dk']==2 and R['ek']==2 and R['sh']==.01,R)
    chk('비법서 ×2: .008 · .006 · .003',R['rc']==[.008,.006,.003],R['rc'])
    J("__g.S.autoQ=false;__g.S.lv=12;__g.S.riftT=3600;__g.S.hpPot=20;__g.step(5,.05)")
    E=J("__g.riftExp('z4')")
    chk('처치당 장비 = 보통 4% × 2',abs(E['pk']['eq']-.08)<1e-9,E['pk']['eq'])
    chk('처치당 파편 = 1% + 상자 몫(5/150)',abs(E['pk']['sh']-(.01+5/150))<1e-9,E['pk']['sh'])
    chk('60분 장비 · 파편 = 처치당 × 분당 처치 × 60',abs(E['eqH']-E['pk']['eq']*E['kpm']*60)<1e-9 and abs(E['shH']-E['pk']['sh']*E['kpm']*60)<1e-9,(E['eqH'],E['shH']))
    chk('강화석은 보통 사냥의 ×2 안팎(×1.8~×3)',1.8<=E['x']<=3,E['x'])
    # 표
    J("__g.toggleMenu(true)");pg.wait_for_timeout(60);J("document.getElementById('bRift').click()");pg.wait_for_timeout(100)
    tb=J("""(()=>{const t=document.querySelector('.rtab table');if(!t)return null;const rs=[...t.querySelectorAll('tr')].slice(1);const box=document.querySelector('.rtab').getBoundingClientRect();
      return {n:rs.length,hd:[...t.querySelectorAll('th')].map(h=>h.textContent),c0:[...rs[0].children].map(c=>c.textContent),box:[box.left,box.right,box.bottom],sw:t.scrollWidth,cw:t.parentElement.clientWidth}})()""")
    chk('표 3줄 · 열 9개 · 장비 · 파편 열',tb and tb['n']==3 and len(tb['hd'])==9 and '장비' in tb['hd'] and '파편' in tb['hd'],tb and tb['hd'])
    chk('장비 · 파편 칸 값 = 기대값',tb['c0'][6]==f"{E['eqH']:.1f}" and tb['c0'][7]==f"{E['shH']:.1f}",tb['c0'])
    chk('표 화면 안 · 가로 넘침 없음',tb['box'][0]>=0 and tb['box'][1]<=1280 and tb['box'][2]<=720 and tb['sw']<=tb['cw']+1,tb)
    row=J("document.querySelector('.si.rift').textContent")
    chk("균열 줄 설명: 장비 ×2 · 도면 ×2 · 파편",'도면 ×2' in row and '장비 ×2' in row and '권능 파편' in row and '강화석 ×3' not in row,row[:160])
    pg.screenshot(path=f"{OUT}/riftrew443_table.png")
    J("__g.closeModal&&__g.closeModal()");J("__g.closeWin&&__g.closeWin()")
    J("__g.riftEnter(true);__g.step(10,.05)")
    chk('균열 입장',J("!!__g.rift"))
    # 확률 고정 처치: 추가 장비 · 파편
    k=J("""(()=>{const g=__g,S=g.S,R=Math.random;S.items=S.items.filter(i=>g.isEq(i));const m=g.mobs.find(x=>x.rift&&!x.dead&&!x.riftBoss);const n0=S.items.length,sh0=S.shard;
      Math.random=()=>0.001;g.killMob(m);Math.random=R;return {it:S.items.length-n0,sh:S.shard-sh0,eq:g.rift.eq,rsh:g.rift.sh}})()""")
    chk('낮은 굴림: 보통 드롭 + 균열 추가 장비 = 장비 2 · 파편 +1',k['it']==2 and k['sh']==1 and k['eq']==1 and k['rsh']==1,k)
    k2=J("""(()=>{const g=__g,S=g.S,R=Math.random;const m=g.mobs.find(x=>x.rift&&!x.dead&&!x.riftBoss);const n0=S.items.length,sh0=S.shard,st0=S.stone;
      Math.random=()=>0.5;g.killMob(m);Math.random=R;return {it:S.items.length-n0,sh:S.shard-sh0,st:S.stone-st0}})()""")
    chk('높은 굴림: 추가 없음',k2['it']==0 and k2['sh']==0 and k2['st']==0,k2)
    # 몬테카를로: 3000번 처치 → 추가 장비율 ≈ 4% · 파편율 ≈ 1% · 강화석 처치당 ≈ .14×단계
    mc=J("""(()=>{const g=__g,S=g.S;const e0=g.rift.eq,s0=g.rift.sh,st0=g.rift.stone,k0=g.rift.k;let n=0;S.riftEK=0;
      for(let i=0;i<3000;i++){const m=g.mobs.find(x=>x.rift&&!x.dead&&!x.riftBoss)||g.mobs.find(x=>x.rift&&!x.riftBoss);m.dead=false;m.hp=m.max;g.killMob(m);n++;S.riftEK=0;if(S.items.length>60||g.wPct()>.3){S.items=S.items.filter(i=>g.isEq(i));S.stone=0;S.bag={};}}
      const el=g.riftEliteOf();return {eq:(g.rift.eq-e0)/n,sh:(g.rift.sh-s0)/n,st:(g.rift.stone-st0)/n,k:g.rift.k-k0}})()""")
    chk('3000 처치: 추가 장비율 4% ±1.2%p',abs(mc['eq']-.04)<.012,mc)
    chk('3000 처치: 파편율 1% ±.6%p',abs(mc['sh']-.01)<.006,mc['sh'])
    chk('3000 처치: 처치당 강화석 .14 ±.04 (로웬 ⌈단계/2⌉=1)',abs(mc['st']-.14)<.04,mc['st'])
    # 나갈 때 요약
    J("__g.riftEnd('out');__g.step(5,.05)")
    msg=J("[...document.querySelectorAll('.toast,#toasts div,.banner')].map(e=>e.textContent).join(' | ')")
    chk("나갈 때 요약에 '장비 +' · '권능 파편 +'",'장비 +' in msg and '권능 파편 +' in msg,msg[-220:])
    pg.screenshot(path=f"{OUT}/riftrew443_out.png")
    chk('왼쪽 아래 버전 표시 보임',J("(()=>{const r=document.getElementById('verTag').getBoundingClientRect();return r.width>0&&r.left<200&&r.bottom>600})()"))
    chk('페이지 오류 없음',not errs,errs[:3])
    b.close()
print(f"{sum(res)}/{len(res)}");sys.exit(0 if all(res) else 1)
