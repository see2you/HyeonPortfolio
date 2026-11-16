"""v4.42 균열 입장 전 물약 확인 · 균열 안 보충 · 긴급 귀환 — v4.46 전용 공간 · v4.47 한 판짜리 균열에 맞춰 고침
   HP 물약 < RIFT.potMin(10)이면 '균열 입장 준비'(취소 · 그대로 입장 · 채우고 입장) · 채우고 입장 = 상점까지 걸어가 한도까지 → 균열로
   · 균열 안 HP 물약 < 6(자동 보충 켬) → 균열에서 나가 마을 상점 → 다시 균열로 · 이번 입장 집계와 균열 진행은 이어 붙는다 · 그동안에도 유지 시간은 흐른다
   · 물약 0 + HP 40% 아래 → 균열에서 마을로 나간다(주문서는 쓰지 않는다) → 안내 팝업 '균열에서 나왔다'([닫기] · [물약 사고 다시 입장] · 닫혔으면 [닫기]만)"""
import sys,os
from playwright.sync_api import sync_playwright
from rift_util import paths,boot,Rift
HTML,OUT=paths()
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
with sync_playwright() as p:
    b,pg,errs=boot(p,HTML);R=Rift(pg);J=R.J
    def run(cond,n=200,k=2):
        """맵 이동 중이면 끝날 때까지 기다리며 게임 시간을 흘린다 — cond가 참이 되면 True"""
        for i in range(n):
            if J("__g.traveling"):pg.wait_for_function("!__g.traveling",timeout=90000)
            J(f"__g.step({k},.05)")
            if J("!__g.traveling&&("+cond+")"):return True
        return False
    chk('버전 v4.x',J("document.getElementById('verTag').textContent").startswith('v4.'))
    J("__g.S.autoQ=false;__g.S.lv=12;__g.S.gold=5000;__g.S.autoBuy=true;__g.step(5,.05)")
    calm="for(const m of __g.mobs)m.atk=0;"
    # 1) 물약 적음 → 준비 창
    J("__g.S.hpPot=3;__g.riftEnter()")
    m=J("""(()=>{const g=__g;const bs=[...document.querySelectorAll('#dlgA button')].map(b=>{const r=b.getBoundingClientRect();return {t:b.textContent,dis:b.disabled,b:r.bottom,r:r.right}});return {name:g.modal&&g.modal.name,rift:!!g.rift,trav:g.traveling,bs}})()""")
    chk("HP 물약 3개 → '균열 입장 준비' 창 · 아직 입장 안 함",m['name']=='균열 입장 준비' and not m['rift'] and not m['trav'],m['name'])
    chk('버튼 3개(취소 · 그대로 입장 · 채우고 입장 −G) · 1280×720 화면 안',len(m['bs'])==3 and m['bs'][2]['t'].startswith('채우고 입장') and all(x['b']<=720 and x['r']<=1280 for x in m['bs']),m['bs'])
    cost=J("(20-3)*(10+3*12)");chk('채우고 입장 비용 = (20−3)×물약값',m['bs'][2]['t']==f"채우고 입장 (−{cost:,} G)" or str(cost) in m['bs'][2]['t'].replace(',',''),m['bs'][2]['t'])
    J("__g.render()");pg.screenshot(path=f"{OUT}/riftprep442_modal.png")
    J("[...document.querySelectorAll('#dlgA button')][0].click()");chk('[취소] → 창 닫힘 · 입장 안 함',J("!__g.modal&&!__g.rift&&!__g.traveling"))
    J("__g.riftEnter();[...document.querySelectorAll('#dlgA button')][1].click()");R.wait_in()
    chk('[그대로 입장] → 균열 입장',J("!!__g.rift&&__g.riftIn()"))
    R.leave();J("__g.S.hpPot=15;__g.riftEnter()")
    chk('HP 물약 15개 → 묻지 않고 바로 입장',J("!__g.modal&&(!!__g.rift||__g.traveling)"));R.wait_in()
    R.leave()
    # 2) 채우고 입장: 마을 밖(안개 호숫가)에서 시작 → 상점까지 걸어가 구입 → 균열
    J("(()=>{const g=__g,Z=g.ZONES.z4;g.player.x=Z.c[0];g.player.y=Z.c[1];g.snap();g.S.hpPot=2;g.riftEnter();})()")
    J("[...document.querySelectorAll('#dlgA button')][2].click()")
    chk('[채우고 입장] → 상점으로 걷기 시작',J("!!__g.nav&&!__g.rift"),J("__g.nav&&__g.nav.label"))
    g0=J("__g.S.gold")
    ok=run("!!__g.rift&&__g.riftIn()",240,3)
    r=J("({rift:!!__g.rift,inR:__g.riftIn(),hp:__g.S.hpPot,gold:__g.S.gold,auto:__g.auto,hunt:!!__g.hunt,ret:__g.riftRet})")
    chk('상점 도착 → HP 물약 한도(20) · 골드 차감 → 균열 입장 · 자동 사냥',ok and r['rift'] and r['inR'] and r['hp']>=19 and r['gold']<g0 and r['hunt'],r)
    # 3) 균열 안 보충: 나가서 사고 다시 들어온다
    J(calm+"(()=>{const g=__g;for(let i=0;i<7;i++){const m=g.mobs.find(x=>x.rift&&!x.dead);g.killMob(m);}})()")
    k0=J("__g.rift.k");t00=J("__g.rift.sec");ek0=J("__g.S.riftEK")
    J(calm+"__g.S.hpPot=3;__g.S.mpPot=10")
    T0=J("__g.S.riftOpenT");t0=J("__g.t")
    ok=run("__g.MAPID==='rowen'",120,1)  # 보충 확인은 게임 시간 4초마다
    st=J("({nav:!!__g.nav,lab:__g.nav&&__g.nav.label,res:__g.STAT.riftRes||0,rift:!!__g.rift,carry:!!__g.riftCarry,map:__g.MAPID,v:Math.round(Math.hypot(__g.player.x-__g.ZONES.village.c[0],__g.player.y-__g.ZONES.village.c[1]))})")
    chk('균열 안 HP 물약 3개(<6) → 균열에서 나가 상점으로(보충 카운트 +1 · 마을 도착)',ok and st['res']>=1 and st['map']=='rowen' and not st['rift'] and st['carry'] and (st['nav'] or J("__g.S.hpPot>=19")),st)
    tOut=J("__g.t");Tout=J("__g.S.riftOpenT")
    ok=run("__g.S.hpPot>=19&&__g.riftIn()&&!__g.nav",240,2);J(calm)
    r=J("({inR:__g.riftIn(),hp:__g.S.hpPot,hunt:!!__g.hunt,rift:!!__g.rift,T:__g.S.riftOpenT,t:__g.t,k:__g.rift&&__g.rift.k,t0:__g.rift&&__g.rift.sec,carry:__g.riftCarry,ek:__g.S.riftEK,n:__g.mobs.length+(__g.rift?__g.rift.left:0)})")
    el=r['t']-t0;used=T0-r['T']
    chk('보충 뒤 균열로 돌아와 사냥 계속',ok and r['inR'] and r['hp']>=19 and r['hunt'] and r['rift'],r)
    chk('이번 입장 집계가 이어 붙는다(처치 수 · 안에 있던 시간) · 균열 진행도 그대로(남은 수만큼만 다시 나온다)',r['k'] is not None and r['k']>=k0 and r['t0']>=t00 and r['carry'] is None and r['ek']>=ek0 and r['n']<=100-ek0,(k0,r['k'],t00,r['t0'],ek0,r['ek'],r['n']))
    chk('물약을 사러 나가 있는 동안에도 균열의 유지 시간은 흐른다',abs(used-el)<1.5 and el>2,(round(used,1),round(el,1)))
    # 3b) 균열 안에서는 메인 퀘스트 처치가 오르지 않고, 메인 목표가 끝나도 균열 사냥은 이어진다
    qn0=J("__g.S.qn");J("__g.mainDone()");J("__g.step(1,.05)")
    chk('균열 안 퀘스트 완료 → 균열 사냥 계속(hunt 유지)',J("!!__g.hunt&&__g.riftIn()"))
    J("__g.S.qs='active'")
    # 4) 물약 0 · 자동 보충 끔 → 균열에서 마을로(균열 입장 끝) · 다시 입장 = 새로 들어감
    J(calm+"(()=>{const g=__g;g.S.autoBuy=false;g.S.hpPot=0;g.S.scroll=2;g.player.hp=Math.round(g.pStats().hp*.2);})()")
    ok=run("__g.MAPID==='rowen'",20,1)
    r=J("({inR:__g.riftIn(),rift:!!__g.rift,town:__g.S.scroll,dead:__g.player.dead,map:__g.MAPID,v:Math.round(Math.hypot(__g.player.x-__g.ZONES.village.c[0],__g.player.y-__g.ZONES.village.c[1])),hud:document.getElementById('riftHud').hidden})")
    chk('균열 안 물약 0 · HP 20% → 균열에서 마을 광장으로(주문서는 쓰지 않는다 · HUD 숨김)',ok and not r['inR'] and not r['rift'] and r['town']==2 and not r['dead'] and r['v']<200 and r['hud'],r)
    J("__g.step(3,.05)");m=J("({name:__g.modal&&__g.modal.name,live:__g.modal&&__g.modal.live,sub:__g.modal&&__g.modal.sub,text:__g.modal&&__g.modal.text,bs:[...document.querySelectorAll('#dlgA button')].map(b=>{const r=b.getBoundingClientRect();return {t:b.textContent,in:r.bottom<=innerHeight&&r.right<=innerWidth}}),up:__g.riftUp()})")
    chk("안내 팝업 '균열에서 나왔다': 물약 소진 · 균열은 아직 열려 있다 · [닫기] [물약 사고 다시 입장] 화면 안",m['name']=='균열에서 나왔다' and m['live'] and '물약이 떨어져' in m['text'] and '아직 열려 있다' in m['sub'] and m['up'] and [x['t'] for x in m['bs']]==['닫기','물약 사고 다시 입장'] and all(x['in'] for x in m['bs']),m)
    J("__g.render()");pg.screenshot(path=f"{OUT}/riftprep442_potout.png")
    J("__g.S.gold=5000;[...document.querySelectorAll('#dlgA button')][1].click()");ok=run("__g.riftIn()&&!!__g.hunt&&__g.S.hpPot>=19",240,3)
    chk('[물약 사고 다시 입장] → 상점에서 채우고 균열로 · 사냥',ok,J("({inR:__g.riftIn(),hp:__g.S.hpPot,nav:__g.nav&&__g.nav.label,modal:__g.modal&&__g.modal.name})"))
    J(calm+"__g.S.riftOpenT=0;__g.S.riftCd=500;__g.riftEnd('pot')");R.wait_out();J("__g.step(3,.05)")
    m=J("({name:__g.modal&&__g.modal.name,sub:__g.modal&&__g.modal.sub,bs:[...document.querySelectorAll('#dlgA button')].map(b=>b.textContent)})")
    chk("그사이 균열이 닫혔으면: '균열은 닫혔다 · 다음 균열까지' · [닫기]만",m['name']=='균열에서 나왔다' and '닫혔다' in m['sub'] and '다음 균열까지' in m['sub'] and m['bs']==['닫기'],m)
    J("__g.closeModal();__g.S.hpPot=20");R.enter(force=False)
    chk('새 균열이 열리면 다시 [입장] → 균열로 들어감 · 사냥',J("__g.riftIn()&&!!__g.hunt"))
    J("__g.render()");pg.screenshot(path=f"{OUT}/riftprep442_back.png")
    chk('페이지 오류 없음',not errs,errs[:3])
    b.close()
print('RESULT',sum(res),'/',len(res));sys.exit(0 if all(res) else 1)
