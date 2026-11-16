"""v4.41 균열 보상 표: 처치당 기대값(강화석 · 도면 · 비법서 · 상자) × 분당 처치(내 기록 1분 이상 / 예상 RIFT.kpm)
   · 균열 창(메뉴 ⧗) 지역별 표 3줄(현재 지역 강조 · 잠긴 지역 흐리게) · 표석 · 균열 줄에 '기대' 한 줄 · 기록 저장 · 1280×720 화면 안 · 버전 v4.41"""
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
    J("__g.S.autoQ=false;__g.S.lv=12;__g.S.riftT=3600;__g.step(5,.05)")
    # 1) 처치당 기대값 공식 대조 (안개 호숫가 z4)
    e=J("(()=>{const g=__g,E=g.riftExp('z4'),Z=g.ZALL.z4,R=g.RIFT;let w=0,sn=0;for(const [sp,l0,l1,n] of Z.mobs){w+=n;sn+=n*Math.ceil(g.tierOfLv(l1+R.lvUp)/2);}sn/=w;return {E,sn,st:R.stoneP*sn+(R.box.stone(1))/R.eN,dsg:.06*R.dsgK+1/R.eN,rcp:R.rcp[1][1]+1/R.eN}})()")
    E=e['E']
    chk('기록 없음 → 예상 처치 속도(RIFT.kpm) 사용',not E['mine'] and E['kpm']==J("__g.RIFT.kpm.z4"),E['kpm'])
    chk('처치당 강화석 = stoneP×⌈단계/2⌉ + 상자 몫',abs(E['pk']['stone']-e['st'])<1e-9,(E['pk']['stone'],e['st']))
    chk('처치당 도면 · 비법서 = 확률 + 상자 몫',abs(E['pk']['dsg']-e['dsg'])<1e-9 and abs(E['pk']['rcp']-e['rcp'])<1e-9)
    chk('분당 강화석 = 처치당 × 분당 처치',abs(E['stoneM']-E['pk']['stone']*E['kpm'])<1e-9)
    chk('60분 상자 = 60 × 분당 처치 / 150',abs(E['boxH']-60*E['kpm']/150)<1e-9,E['boxH'])
    chk('보통 사냥보다 강화석이 많다(×2 이상)',E['x']>=2,E['x'])
    for z in ('k3','e3'):
        Ez=J(f"__g.riftExp('{z}')");chk(f'{z}: 단계가 높을수록 처치당 강화석 ↑',Ez['pk']['stone']>E['pk']['stone'],Ez['pk']['stone'])
    # 2) 균열 창: 표 3줄 · 현재 지역 강조 · 잠긴 지역 흐림
    J("__g.toggleMenu(true)");pg.wait_for_timeout(60);J("document.getElementById('bRift').click()");pg.wait_for_timeout(100)
    tb=J("""(()=>{const t=document.querySelector('.rtab table');if(!t)return null;const rs=[...t.querySelectorAll('tr')].slice(1);const box=document.querySelector('.rtab').getBoundingClientRect();
      const btn=[...document.querySelectorAll('button')].filter(b=>b.textContent==='닫기'&&b.offsetParent).map(b=>b.getBoundingClientRect())[0];
      return {n:rs.length,cur:rs.map(r=>r.classList.contains('cur')),lk:rs.map(r=>r.classList.contains('lk')),c0:[...rs[0].children].map(c=>c.textContent),hd:[...t.querySelectorAll('th')].length,
        box:[box.left,box.right,box.bottom],sw:t.scrollWidth,cw:t.parentElement.clientWidth,btn:btn&&[btn.bottom,btn.right]}})()""")
    chk('균열 창: 지역별 표 3줄 · 열 9개',tb and tb['n']==3 and tb['hd']==9,tb)
    chk('현재 지역(로웬) 줄 강조 · 다른 맵은 잠김(흐림)',tb['cur']==[True,False,False] and tb['lk']==[False,True,True],(tb['cur'],tb['lk']))
    chk('첫 줄 값: 분당 처치 · 강화석 ×N',tb['c0'][2].startswith(str(J("__g.RIFT.kpm.z4"))+'.0') and tb['c0'][8].startswith('보통의 ×'),tb['c0'])
    chk('표가 1280×720 화면 안 · 가로 넘침 없음',tb['box'][0]>=0 and tb['box'][1]<=1280 and tb['box'][2]<=720 and tb['sw']<=tb['cw']+1,tb)
    chk('[닫기] 버튼 화면 안',tb['btn'] and tb['btn'][0]<=720 and tb['btn'][1]<=1280,tb['btn'])
    row=J("document.querySelector('.si.rift .rx').textContent");chk("균열 줄에 '기대 · 분당 처치 … (예상)'",'기대' in row and '(예상)' in row and '/분' in row,row)
    pg.screenshot(path=f"{OUT}/riftexp441_table.png")
    J("__g.closeModal&&__g.closeModal()")
    # 3) 균열 안 기록: 시간 · 처치
    J("__g.S.hpPot=20;__g.riftEnter(true);__g.mobs.forEach(m=>m.atk=0);(()=>{const c=__g.ZONES.z4.c;__g.player.x=c[0];__g.player.y=c[1];})()")
    J("__g.step(1300,.05)")  # 65초
    J("(()=>{const ms=__g.mobs.filter(m=>m.zone==='z4'&&!m.dead&&!m.riftBoss).slice(0,13);ms.forEach(m=>__g.killMob(m));})()")
    rec=J("JSON.stringify(__g.S.riftRec.z4)");import json;rec=json.loads(rec)
    chk('균열 안 시간 · 처치 기록(65초 · 13마리 이상)',rec['s']>=64 and rec['k']>=13,rec)
    E2=J("__g.riftExp('z4')");chk('1분 넘으면 내 기록 사용: 분당 처치 = 처치/분',E2['mine'] and abs(E2['kpm']-rec['k']/(rec['s']/60))<1e-6,E2['kpm'])
    J("__g.riftEnd('out');__g.step(10,.05)")
    s1=J("__g.S.riftRec.z4.s");J("__g.step(400,.05)")
    chk('균열 밖에선 기록 시간이 늘지 않음',abs(J("__g.S.riftRec.z4.s")-s1)<1e-9)
    J("__g.save()");sv=J("JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('riftRec')))).riftRec.z4.k")
    chk('기록이 세이브에 저장',sv==rec['k'] or sv>=rec['k'],sv)
    J("__g.openRift()");pg.wait_for_timeout(80)
    c0=J("[...document.querySelectorAll('.rtab tr')][1].children[2].textContent");chk('표: 내 기록이면 ✓ 표시',('✓' in c0),c0)
    row=J("document.querySelector('.si.rift .rx').textContent");chk("균열 줄: '(내 기록)'",'(내 기록)' in row,row)
    pg.screenshot(path=f"{OUT}/riftexp441_mine.png")
    J("__g.closeModal&&__g.closeModal();__g.openWay()");pg.wait_for_timeout(80)
    w=J("(()=>{const r=document.querySelector('.si.rift .rx');const bs=[...document.querySelectorAll('button')].filter(b=>b.textContent==='닫기'&&b.offsetParent).map(b=>b.getBoundingClientRect().bottom);return {t:r&&r.textContent,b:bs[0]}})()")
    chk('표석 창에도 기대 줄 · [닫기] 화면 안',w['t'] and '기대' in w['t'] and w['b']<=720,w)
    pg.screenshot(path=f"{OUT}/riftexp441_way.png")
    chk('왼쪽 아래 버전 표시 보임',J("(()=>{const r=document.getElementById('verTag').getBoundingClientRect();return r.width>0&&r.left<200&&r.bottom>600})()"))
    chk('JS 오류 없음',not errs,errs[:3])
    b.close()
print(f"{sum(res)}/{len(res)}");sys.exit(0 if all(res) else 1)
