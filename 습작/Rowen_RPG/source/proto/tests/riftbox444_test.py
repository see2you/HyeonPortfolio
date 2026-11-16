"""v4.44 균열 상자를 병목에 닿게(#3-4d) — v4.47: 상자는 균열의 주인(한 판에 하나)이 준다
   상자에 장비 1개 확정(레벨대별 등급 표 · 영웅/전설 확률) · 부위는 못 채운 컬렉션 칸 우선
   · 이미 만난 지역 보스의 전용 장비 30%(컬렉션에 없는 것 먼저) · 만난 보스가 없으면 없음 · 표 아래 상자 안내"""
import sys,os
from playwright.sync_api import sync_playwright
from rift_util import paths,boot,Rift
HTML,OUT=paths()
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
with sync_playwright() as p:
    b,pg,errs=boot(p,HTML);R=Rift(pg);J=R.J  # v4.46: 개방 스토리를 지난 상태(S.riftKey)로 시작 · 들어가기/나가기는 맵 이동을 기다린다
    chk('버전 v4.x',J("document.getElementById('verTag').textContent").startswith('v4.'))
    T=J("(()=>{const B=__g.RIFT.box;return {eq:B.eq,bu:B.buP}})()")
    chk('등급 표: 누적 확률 · 끝 = 1 · 희귀 이상',all(T['eq'][k][-1][1]==1 and all(g>=2 for g,_ in T['eq'][k]) and all(T['eq'][k][i][1]<T['eq'][k][i+1][1] for i in range(len(T['eq'][k])-1)) for k in '123'),T['eq'])
    chk('보스 전용 30%',T['bu']==.3,T['bu'])
    mc=J("""(()=>{const o={};for(const r of [1,2,3]){const c={2:0,3:0,4:0};for(let i=0;i<20000;i++)c[__g.riftBoxGrade(r)]++;o[r]={g3:c[3]/20000,g4:c[4]/20000,g2:c[2]/20000};}return o})()""")
    chk('몬테카를로 2만: 로웬 영웅 25% · 카르도 40% · 에르나 영웅 50% · 전설 10% (±1.5%p)',abs(mc['1']['g3']-.25)<.015 and mc['1']['g4']==0 and abs(mc['2']['g3']-.40)<.015 and abs(mc['3']['g3']-.50)<.015 and abs(mc['3']['g4']-.10)<.015,mc)
    sl=J("""(()=>{const g=__g;const s=new Set();for(let i=0;i<400;i++)s.add(g.riftBoxSlot(3,5));return [...s]})()""")
    chk('영웅 부위: 미등록 컬렉션 칸(무기 · 갑옷 · 목걸이 · 망토 · 반지 · 장화…)만',set(sl)<= {'weapon','armor','neck','cloak','ring','boots'} and 'weapon' in sl,sl)
    sl4=J("""(()=>{const g=__g;const s=new Set();for(let i=0;i<400;i++)s.add(g.riftBoxSlot(4,5));return [...s]})()""")
    chk('전설 부위에 반지(전설의 유산) 포함',  'ring' in sl4,sl4)
    # 만난 보스 없음 → 보스 전용 없음
    J("__g.S.lv=12;__g.S.autoQ=false;__g.step(3,.05)")
    chk('만난 지역 보스 없음(qi 0) → 후보 없음',J("__g.S.qi=0,__g.riftBoxBU()===null"))
    qi=J("(()=>{const Q=__g.QUESTS||null;return 0})()")
    J("""(()=>{const g=__g;const qs=g.fieldBossQs;})()""")
    # 로웬 보스 3(q6 · q10 · q12)을 만난 상태
    J("""(()=>{const g=__g,S=g.S;const QS=window.__QUESTS||null;})()""")
    ok=J("""(()=>{const g=__g,S=g.S;for(let i=1;i<60;i++){S.qi=i;if(g.fieldBossQs().map(q=>q.id).includes('q12'))return i;}return -1})()""")
    chk('qi를 q12 뒤로 → 로웬 보스 3 후보',ok>0 and J("__g.fieldBossQs().map(q=>q.id).join()")=='q6,q10,q12',J("__g.fieldBossQs().map(q=>q.id)"))
    # 등록할 사본이 이미 있는 b6a · b6b는 뒤로
    pick=J("""(()=>{const g=__g,S=g.S;S.items.push(g.newBU('b6a'),g.newBU('b6b'));const s=new Set();for(let i=0;i<300;i++)s.add(g.riftBoxBU().id);S.items=S.items.filter(x=>!x.bu);return [...s].sort()})()""")
    chk('사본 가진 b6a · b6b 제외 → b10 · b12만',pick==['b10a','b10b','b12a','b12b'],pick)
    # 균열 입장 · 균열의 주인 처치(낮은 굴림 = 영웅 · 보스 전용) — 상자 굴림만 여러 번 보려고 균열이 닫히지 않게 한다(rift.clear를 잠깐 세워 riftClear를 건너뜀)
    R.enter();J("__g.step(10,.05);__g.mobs.forEach(m=>m.atk=0)")
    chk('균열 입장',J("!!__g.rift&&__g.riftIn()"))
    lo=J("""(()=>{const g=__g,S=g.S;S.items=S.items.filter(i=>g.isEq(i));const m=g.riftElite();const n0=S.items.length;const R=Math.random;Math.random=()=>0.001;g.rift.clear=1;m.hp=1;g.killMob(m);g.rift.clear=0;Math.random=R;
      const nw=S.items.slice(n0);return {n:nw.length,hero:nw.filter(i=>!i.bu&&i.g===3).length,bu:nw.filter(i=>i.bu).map(i=>i.bu),rb:g.rift.bu,bg:g.rift.boxG,t:nw.filter(i=>i.g===3).map(i=>i.t)}})()""")
    chk('낮은 굴림: 영웅 장비 1 · 로웬 보스 전용 1',lo['hero']>=1 and len(lo['bu'])==1 and lo['bu'][0][:3] in ('b6a','b6b','b10','b12') and lo['rb']==1 and lo['bg']==3,lo)
    msg=J("[...document.querySelectorAll('.toast,#toasts div,.banner')].map(e=>e.textContent).join(' | ')")
    chk("상자 알림에 '영웅' · '★'",'영웅' in msg and '★' in msg,msg[-200:])
    pg.screenshot(path=f"{OUT}/riftbox444_box.png")
    hi=J("""(()=>{const g=__g,S=g.S;S.items=S.items.filter(i=>g.isEq(i));const m=g.riftElite();const n0=S.items.length;const R=Math.random;Math.random=()=>0.99;g.rift.clear=1;m.hp=1;g.killMob(m);g.rift.clear=0;Math.random=R;
      const nw=S.items.slice(n0);return {n:nw.length,g:nw.map(i=>i.g),bu:nw.filter(i=>i.bu).length,rb:g.rift.bu}})()""")
    chk('높은 굴림: 희귀 장비 1 · 보스 전용 없음',hi['n']==1 and hi['g']==[2] and hi['bu']==0 and hi['rb']==1,hi)
    # 1000 상자 몬테카를로(가방 비우며): 영웅 ≈25% · 보스 전용 ≈30%
    bm=J("""(()=>{const g=__g,S=g.S;let h=0,bu=0,N=1000;for(let i=0;i<N;i++){S.items=S.items.filter(x=>g.isEq(x));const m=g.riftElite();const n0=S.items.length;g.rift.clear=1;m.hp=1;g.killMob(m);g.rift.clear=0;const nw=S.items.slice(n0);if(nw.some(x=>!x.bu&&x.g===3))h++;if(nw.some(x=>x.bu))bu++;S.stone=0;S.bag={};}return {h:h/N,bu:bu/N}})()""")
    chk('상자 1000: 영웅 25% ±5%p · 보스 전용 30% ±5%p',abs(bm['h']-.25)<.05 and abs(bm['bu']-.30)<.05,bm)
    chk('굴림 시험 뒤에도 균열은 열려 있다(닫기를 건너뜀)',J("__g.riftUp()&&!!__g.rift&&!__g.rift.clear"))
    J("__g.S.riftEP=0;__g.riftEnd('out')")
    msg=J("[...document.querySelectorAll('.toast,#toasts div,.banner')].map(e=>e.textContent).join(' | ')");R.wait_out();J("__g.step(5,.05)")
    chk("나갈 때 요약에 '보스 전용 +'",'보스 전용 +' in msg,msg[-200:])
    # 표 아래 안내
    J("__g.toggleMenu(true)");pg.wait_for_timeout(60);J("document.getElementById('bRift').click()");pg.wait_for_timeout(100)
    tx=J("(()=>{const e=document.querySelector('.rtn.rbox');if(!e)return null;const r=e.getBoundingClientRect();return {t:e.textContent,b:r.bottom,r:r.right}})()")
    chk('표 아래 상자 안내(영웅 25% · 40% · 60% / 전설 10% · 보스 전용 30%)',tx and '보스 전용 장비 30%' in tx['t'] and '영웅 25%' in tx['t'] and '영웅 40%' in tx['t'] and '영웅 50%' in tx['t'] and '전설 10%' in tx['t'],tx and tx['t'])
    chk('안내 화면 안(1280×720)',tx and tx['b']<=720 and tx['r']<=1280,tx)
    pg.screenshot(path=f"{OUT}/riftbox444_table.png")
    chk('왼쪽 아래 버전 표시 보임',J("(()=>{const r=document.getElementById('verTag').getBoundingClientRect();return r.width>0&&r.left<200&&r.bottom>600})()"))
    chk('페이지 오류 없음',not errs,errs[:3])
    b.close()
print(f"{sum(res)}/{len(res)}");sys.exit(0 if all(res) else 1)
