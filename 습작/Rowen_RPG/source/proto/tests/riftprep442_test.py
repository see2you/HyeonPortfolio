"""v4.42 균열 입장 전 물약 확인 · 균열 안 보충 · 긴급 귀환
   HP 물약 < RIFT.potMin(10)이면 '균열 입장 준비'(취소 · 그대로 입장 · 채우고 입장) · 채우고 입장 = 상점까지 걸어가 한도까지 → 균열 입구
   · 균열 안 HP 물약 < 6(자동 보충 켬) → 상점 → 균열로(밖에서는 시간 안 줄어듦) · 물약 0 + HP 40% 아래 → 귀환 주문서 · 다시 입장 = 균열로 복귀"""
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
    chk('버전 v4.42',J("document.getElementById('verTag').textContent")=='v4.42')
    J("__g.S.autoQ=false;__g.S.lv=12;__g.S.riftT=3600;__g.S.gold=5000;__g.S.autoBuy=true;__g.step(5,.05)")
    calm="for(const m of __g.mobs)m.atk=0;"
    # 1) 물약 적음 → 준비 창
    J("__g.S.hpPot=3;__g.riftEnter()")
    m=J("""(()=>{const g=__g;const bs=[...document.querySelectorAll('#dlgA button')].map(b=>{const r=b.getBoundingClientRect();return {t:b.textContent,dis:b.disabled,b:r.bottom,r:r.right}});return {name:g.modal&&g.modal.name,rift:!!g.rift,bs}})()""")
    chk("HP 물약 3개 → '균열 입장 준비' 창 · 아직 입장 안 함",m['name']=='균열 입장 준비' and not m['rift'],m['name'])
    chk('버튼 3개(취소 · 그대로 입장 · 채우고 입장 −G) · 1280×720 화면 안',len(m['bs'])==3 and m['bs'][2]['t'].startswith('채우고 입장') and all(x['b']<=720 and x['r']<=1280 for x in m['bs']),m['bs'])
    cost=J("(20-3)*(10+3*12)");chk('채우고 입장 비용 = (20−3)×물약값',m['bs'][2]['t']==f"채우고 입장 (−{cost:,} G)" or str(cost) in m['bs'][2]['t'].replace(',',''),m['bs'][2]['t'])
    J("__g.render()");pg.screenshot(path=f"{OUT}/riftprep442_modal.png")
    J("[...document.querySelectorAll('#dlgA button')][0].click()");chk('[취소] → 창 닫힘 · 입장 안 함',J("!__g.modal&&!__g.rift"))
    J("__g.riftEnter();[...document.querySelectorAll('#dlgA button')][1].click()")
    chk('[그대로 입장] → 균열 입장',J("!!__g.rift&&__g.riftIn()"))
    J("__g.riftEnd('out');__g.S.hpPot=15;__g.riftEnter()")
    chk('HP 물약 15개 → 묻지 않고 바로 입장',J("!__g.modal&&!!__g.rift"))
    J("__g.riftEnd('out')")
    # 2) 채우고 입장: 마을 밖(균열 사냥터)에서 시작 → 상점까지 걸어가 구입 → 균열
    J("(()=>{const g=__g,Z=g.ZONES.z4;g.player.x=Z.c[0];g.player.y=Z.c[1];g.snap();g.S.hpPot=2;g.riftEnter();})()")
    J("[...document.querySelectorAll('#dlgA button')][2].click()")
    chk('[채우고 입장] → 상점으로 걷기 시작',J("!!__g.nav&&!__g.rift"),J("__g.nav&&__g.nav.label"))
    g0=J("__g.S.gold")
    for i in range(80):
        J("__g.step(3,.05)")
        if J("!!__g.rift"): break
    r=J("({rift:!!__g.rift,inR:__g.riftIn(),hp:__g.S.hpPot,gold:__g.S.gold,auto:__g.auto,hunt:!!__g.hunt})")
    chk('상점 도착 → HP 물약 한도(20) · 골드 차감 → 균열 입장 · 자동 사냥',r['rift'] and r['inR'] and r['hp']>=19 and r['gold']<g0 and r['hunt'],r)
    # 3) 균열 안 보충
    J(calm+"__g.S.hpPot=3;__g.S.mpPot=10")
    T0=J("__g.S.riftT");t0=J("__g.t")
    for i in range(10):
        J("__g.step(1,.05)")
        if J("!!__g.nav"): break
    chk('균열 안 HP 물약 3개(<6) → 상점으로(보충 카운트 +1)',J("!!__g.nav&&(__g.STAT.riftRes||0)>=1"),J("__g.nav&&__g.nav.label"))
    for i in range(120):
        J("__g.step(2,.05)")
        if J("__g.S.hpPot>=19&&__g.riftIn()&&!__g.nav"): break
    r=J("({inR:__g.riftIn(),hp:__g.S.hpPot,hunt:!!__g.hunt,rift:!!__g.rift,T:__g.S.riftT,t:__g.t})")
    el=r['t']-t0;used=T0-r['T']
    chk('보충 뒤 균열로 돌아와 사냥 계속',r['inR'] and r['hp']>=19 and r['hunt'] and r['rift'],r)
    chk('균열 밖에 있던 동안은 입장 시간이 줄지 않음',used<el-5,(round(used,1),round(el,1)))
    # 3b) 균열 안에서 메인 퀘스트 처치 목표가 끝나도 균열 사냥은 이어진다(v4.42 봇 시험에서 찾음)
    J("__g.mainDone()");J("__g.step(1,.05)")
    chk('균열 안 퀘스트 완료 → 균열 사냥 계속(hunt 유지)',J("!!__g.hunt&&__g.riftIn()"))
    J("__g.S.qs='active'")
    # 4) 물약 0 · 자동 보충 끔 → 긴급 귀환(주문서) · 다시 입장 = 균열로
    J(calm+"(()=>{const g=__g;g.S.autoBuy=false;g.S.hpPot=0;g.S.scroll=2;g.player.hp=Math.round(g.pStats().hp*.2);})()")
    for i in range(10):
        J("__g.step(1,.05)")
        if not J("__g.riftIn()"): break
    r=J("({inR:__g.riftIn(),rift:!!__g.rift,town:__g.S.scroll,dead:__g.player.dead})")
    chk('균열 안 물약 0 · HP 20% → 귀환 주문서로 마을(균열은 유지)',not r['inR'] and r['rift'] and r['town']==1 and not r['dead'],r)
    J("__g.S.hpPot=20;__g.riftEnter()")
    chk('다시 [입장] → 균열 입구로 돌아감',J("__g.riftIn()&&!!__g.hunt"))
    J("__g.render()");pg.screenshot(path=f"{OUT}/riftprep442_back.png")
    chk('페이지 오류 없음',not errs,errs[:3])
    b.close()
print('RESULT',sum(res),'/',len(res));sys.exit(0 if all(res) else 1)
