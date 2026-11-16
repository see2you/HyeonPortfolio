"""v4.46 시간의 균열 전용 공간(G17 · 현 요청) — v4.47 한 판짜리 균열 · 안내 팝업에 맞춰 고침
   · 전용 맵 구성(문턱 · 사냥 구역 · 지역 목록에 안 나옴) · 들어오기 전 자리 기억 → [나가기] → 확인 팝업 → 그 자리 · 귀환(주문서) → 마을 광장 + 안내 팝업 · 쓰러짐 → 마을에서 부활
   · 균열 문(표석)으로 나가기/지역 이동 · 퀘스트와 분리(균열 안 처치는 메인 · 서브 · 반복에 들지 않음) · 균열 안 저장 → 이어하기는 들어오기 전 자리(남은 유지 시간 · 진행 유지)
   · 미니맵 · 침공 없음 · 퀘스트 카드로 이동하면 균열에서 나간 뒤 이어 감 · 모바일(844×390) HUD · 확인 팝업 · 월드 ⧗ 표시가 화면 안이고 다른 것을 덮지 않음"""
import sys,os,json
from playwright.sync_api import sync_playwright
from rift_util import paths,boot,Rift
HTML,OUT=paths()
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
TOAST="[...document.querySelectorAll('.toast,#toasts div')].map(e=>e.textContent).join(' | ')"
RECT="(id=>{const e=document.getElementById(id);if(!e)return null;const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}})"
hit=lambda a,b:bool(a and b and a['w']>0 and b['w']>0 and a['l']<b['r']-1 and b['l']<a['r']-1 and a['t']<b['b']-1 and b['t']<a['b']-1)
with sync_playwright() as p:
    b,pg,errs=boot(p,HTML);R=Rift(pg);J=R.J
    def run(cond,n=200,k=4):
        for i in range(n):
            if J("__g.traveling"):pg.wait_for_function("!__g.traveling",timeout=90000)
            J(f"__g.step({k},.05)")
            if J("!__g.traveling&&("+cond+")"):return True
        return False
    chk('버전 v4.x',J("document.getElementById('verTag').textContent").startswith('v4.'))
    J("__g.S.autoQ=false;__g.S.lv=13;__g.S.hpPot=20;__g.S.mpPot=20;__g.S.scroll=2;__g.S.gold=3000;__g.step(5,.05)")
    # 1) 전용 맵 구성
    mp=J("(()=>{const M=__g.MAPS.rift,Z=M.zones;return {inst:!!M.inst,zones:Object.keys(Z),safe:!!Z.village.safe,npcs:Object.keys(M.npcs).length,houses:M.houses.length,inMaps:__g.S.maps.includes('rift'),zall:!!__g.ZALL.rz&&__g.ZALL.rz.map==='rift',noVil:!Object.values(__g.ZALL).some(z=>z.map==='rift'&&z.id==='village')}})()")
    chk('전용 맵: inst · 문턱(안전) + 사냥 구역 rz · NPC/집 없음 · 가진 지역 목록에 없음',mp['inst'] and mp['zones']==['village','rz'] and mp['safe'] and mp['npcs']==0 and mp['houses']==0 and not mp['inMaps'] and mp['zall'] and mp['noVil'],mp)
    J("__g.openWay()");pg.wait_for_timeout(80)
    rows=J("[...document.querySelectorAll('#dlgB .si')].map(e=>e.textContent.slice(0,24))")
    chk('길잡이 표석 목록: 균열 줄은 하나 · 이동할 지역에 전용 맵이 없다',sum('시간의 균열' in t for t in rows)==1,rows)
    J("[...document.querySelectorAll('#dlgA button')].pop().click()")
    # 2) 들어오기 전 자리 기억 → [나가기]로 그 자리
    J("(()=>{const g=__g,c=g.ZONES.z1.c;g.player.x=c[0];g.player.y=c[1];g.snap();})()");p0=J("[Math.round(__g.player.x),Math.round(__g.player.y)]")
    q0=J("({qi:__g.S.qi,qs:__g.S.qs,qn:__g.S.qn})")
    R.enter();ret=J("__g.riftRet")
    chk('입장: 들어오기 전 자리(지역 · 좌표) 기억 · 문턱에 선다',ret and ret['map']=='rowen' and [ret['x'],ret['y']]==p0 and J("__g.MAPID==='rift'"),ret)
    hud=J("(()=>{__g.riftHud();const o={};for(const id of ['riftHud','rhX','mini','rhT','rhE','rhL'])o[id]="+RECT+"(id);o.txt=document.getElementById('riftHud').textContent;o.zt=document.getElementById('zoneT').textContent;return o})()")
    chk('균열 HUD: 이름 · 남은 유지 시간 · 처치 n / 분량 · 이번 입장 획득 · [나가기] — 화면 안',hud['riftHud']['w']>0 and hud['riftHud']['l']>=0 and hud['riftHud']['r']<=1280 and hud['riftHud']['b']<=720 and '시간의 균열' in hud['txt'] and '처치 0 / 100' in hud['txt'] and '강화석' in hud['txt'] and '나가기' in hud['txt'],hud['txt'])
    chk('[나가기] 버튼: 보임 · 누를 수 있는 크기 · 미니맵과 안 겹침',hud['rhX']['w']>=36 and hud['rhX']['h']>=18 and not hit(hud['riftHud'],hud['mini']),[hud['rhX'],hud['mini']])
    J("__g.step(20,.05);__g.render()");pg.screenshot(path=f"{OUT}/riftspace446_in.png")
    top=pg.evaluate("(()=>{const r=document.getElementById('rhX').getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return e&&e.id})()")
    chk('[나가기] 위를 다른 요소가 가리지 않음',top=='rhX',top)
    pg.click('#rhX');pg.wait_for_timeout(80)
    ask=J("({name:__g.modal&&__g.modal.name,live:__g.modal&&__g.modal.live,sub:__g.modal&&__g.modal.sub,text:__g.modal&&__g.modal.text,rift:!!__g.rift,bs:[...document.querySelectorAll('#dlgA button')].map(b=>{const r=b.getBoundingClientRect();return {t:b.textContent,in:r.bottom<=innerHeight&&r.right<=innerWidth&&r.width>30}})})")
    chk("[나가기] → 확인 팝업 '균열에서 나가기'(아직 안 나감): 남은 시간 · 진행 · 시간은 계속 흐른다 · [계속 싸운다] [나간다] 화면 안",ask['name']=='균열에서 나가기' and ask['live'] and ask['rift'] and '남은 시간' in ask['sub'] and '처치 0 / 100' in ask['sub'] and '계속 흐른다' in ask['text'] and [x['t'] for x in ask['bs']]==['계속 싸운다','나간다'] and all(x['in'] for x in ask['bs']),ask)
    J("__g.render()");pg.screenshot(path=f"{OUT}/riftspace446_ask.png")
    hp0=J("(()=>{const g=__g,sum=()=>g.mobs.reduce((a,m)=>a+(m.dead?0:m.hp),0);g.mobs.forEach(m=>m.atk=0);const m=g.mobs.find(x=>!x.dead);g.player.x=m.x-18;g.player.y=m.y;const h=sum(),k=g.rift.k;g.step(100,.05);return {h,h2:sum(),k:g.rift.k-k,modal:g.modal&&g.modal.name,hunt:!!g.hunt}})()")
    chk('확인 팝업이 떠 있어도 자동 전투는 이어진다(읽다가 쓰러지지 않게)',hp0['modal']=='균열에서 나가기' and hp0['hunt'] and (hp0['k']>=1 or hp0['h2']<hp0['h']),hp0)
    J("[...document.querySelectorAll('#dlgA button')][0].click()");chk('[계속 싸운다] → 팝업 닫힘 · 균열 안 그대로',J("!__g.modal&&!!__g.rift&&__g.MAPID==='rift'&&!__g.traveling"))
    pg.click('#rhX');pg.wait_for_timeout(60);J("[...document.querySelectorAll('#dlgA button')][1].click()");R.wait_out()
    p1=J("[Math.round(__g.player.x),Math.round(__g.player.y)]")
    chk('[나가기] → 들어오기 전 자리(마을 광장이 아니다) · HUD 숨김 · 요약 알림',J("__g.MAPID==='rowen'&&!__g.rift&&!__g.riftRet") and abs(p1[0]-p0[0])<=2 and abs(p1[1]-p0[1])<=2 and J("document.getElementById('riftHud').hidden") and '균열에서 나왔다' in J(TOAST),[p0,p1])
    chk('나갔다 와도 메인 퀘스트 상태 그대로',J("({qi:__g.S.qi,qs:__g.S.qs,qn:__g.S.qn})")==q0)
    gr=J("__g.graceT-__g.t");chk('나온 직후 3초는 선공을 받지 않는다(사냥터 한가운데로 돌아올 수 있으므로)',2<gr<=3.01,gr)
    # 3) 퀘스트와 분리: 균열 안 처치는 메인 · 서브 · 수집에 들지 않는다(누적 처치에는 든다)
    J("""(()=>{const g=__g,S=g.S,ix=id=>g.QUESTS.findIndex(q=>q.id===id);S.qi=ix('q9');S.qs='active';S.qn=0;S.sq.sb4={st:'active',n:0};S.sq.sd3={st:'active',n:0};})()""")
    R.enter()
    sep=J("""(()=>{const g=__g,S=g.S,R=Math.random;const k0=S.kills;Math.random=()=>0.3;let n=0;for(const sp of ['waterslime','otter'])for(let i=0;i<4;i++){const m=g.mobs.find(x=>x.sp===sp&&!x.dead&&!x.riftBoss);if(m){g.killMob(m);n++;}}Math.random=R;
      return {n,qn:S.qn,sb4:S.sq.sb4.n,sd3:S.sq.sd3.n,kills:S.kills-k0,rk:g.rift.k,sps:[...new Set(g.mobs.map(m=>m.sp))]}})()""")
    chk('균열 안 8처치: 메인(q9 물방울슬라임) 0 · 수집 서브 0 · 처치 서브 0 · 누적 처치 +8 · 균열 처치 8',sep['n']==8 and sep['qn']==0 and sep['sb4']==0 and sep['sd3']==0 and sep['kills']==8 and sep['rk']==8,sep)
    J("__g.step(60,.05)");chk('균열 안에서 AI 모드 사냥터(오프라인 정산)를 전용 맵으로 바꾸지 않음 · 침공 없음',J("__g.S.aiZone!=='rz'&&!__g.inv"),J("__g.S.aiZone"))
    # 4) 귀환(주문서) → 마을 광장
    J("__g.S.scroll=0;__g.goTown()");chk('주문서 없음: 귀환 안 됨 · [나가기] 안내',J("__g.riftIn()&&!__g.traveling") and '나가기' in J(TOAST),J(TOAST)[-80:])
    J("__g.S.scroll=2;__g.goTown()");R.wait_out()
    v=J("Math.round(Math.hypot(__g.player.x-__g.MAPS.rowen.plaza.x,__g.player.y-__g.MAPS.rowen.plaza.y))")
    chk('귀환 주문서 → 로웬 마을 광장 · 주문서 −1 · 균열에서 나옴',J("__g.MAPID==='rowen'&&!__g.rift&&__g.S.scroll===1") and v<80,v)
    J("__g.step(3,.05)");m=J("({name:__g.modal&&__g.modal.name,sub:__g.modal&&__g.modal.sub,text:__g.modal&&__g.modal.text,bs:[...document.querySelectorAll('#dlgA button')].map(b=>b.textContent)})")
    chk("안내 팝업 '균열에서 나왔다': 귀환 주문서 · 균열은 아직 열려 있다 · [닫기] [다시 입장]",m['name']=='균열에서 나왔다' and '귀환 주문서' in m['text'] and '아직 열려 있다' in m['sub'] and '계속 흐른다' in m['text'] and m['bs']==['닫기','다시 입장'],m)
    J("[...document.querySelectorAll('#dlgA button')][0].click()");chk('[닫기] → 마을에 그대로',J("!__g.modal&&__g.MAPID==='rowen'&&!__g.traveling"))
    out=J("""(()=>{const g=__g,S=g.S,R=Math.random;Math.random=()=>0.3;const m=g.mobs.find(x=>x.sp==='waterslime'&&!x.dead&&!x.field&&!x.boss);g.killMob(m);Math.random=R;return {qn:S.qn,sb4:S.sq.sb4.n}})()""")
    chk('밖(안개 호숫가)에서 잡으면 메인 · 수집이 오른다',out['qn']==1 and out['sb4']==1,out)
    # 5) 쓰러짐 → 들어온 지역의 마을에서 부활
    R.enter();xp0=J("__g.S.xp")
    J("__g.die('test');__g.step(32,.05)")  # 사망 창은 1.3초 뒤
    d=J("({dead:__g.player.dead,rift:!!__g.rift,modal:__g.modal&&__g.modal.name,map:__g.MAPID,hud:document.getElementById('riftHud').hidden})")
    chk('균열 안에서 쓰러짐: 균열 끝 · 사망 창 · HUD 숨김',d['dead'] and not d['rift'] and d['modal']=='사망했습니다' and d['hud'],d)
    J("__g.modal.btns[0].f()");pg.wait_for_function("!__g.traveling&&!__g.player.dead",timeout=90000);J("__g.step(3,.05)")
    v=J("Math.round(Math.hypot(__g.player.x-__g.MAPS.rowen.plaza.x,__g.player.y-__g.MAPS.rowen.plaza.y))")
    chk('부활: 로웬 마을 광장 · 체력 가득 · 전용 맵에 남지 않음',J("__g.MAPID==='rowen'&&!__g.player.dead&&__g.player.hp>=__g.pStats().hp-1&&!__g.riftRet") and v<80,v)
    # 6) 균열 문(문턱의 표석): 나가기 · 지역 이동
    J("__g.S.hpPot=20");R.enter();J("__g.openWay()");pg.wait_for_timeout(80)
    w=J("({name:__g.modal&&__g.modal.name,rows:[...document.querySelectorAll('#dlgB .si')].map(e=>e.textContent.slice(0,30)),btn:(document.querySelector('.si.rift button')||{}).textContent})")
    chk("균열 문 창: 이름 '균열 문' · 균열 줄 [나가기] · 전용 맵 자신은 목록에 없음",w['name']=='균열 문' and w['btn']=='나가기' and not any(t.startswith('시간의 균열') and '⧗' not in t for t in w['rows']),w)
    pg.screenshot(path=f"{OUT}/riftspace446_gate.png")
    J("document.querySelector('.si.rift button').click()");pg.wait_for_timeout(60)
    chk('균열 문 [나가기] → 확인 팝업',J("__g.modal&&__g.modal.name")=='균열에서 나가기' and J("!!__g.rift"))
    J("[...document.querySelectorAll('#dlgA button')][1].click()");R.wait_out()
    chk('[나간다] → 밖으로 · 균열은 아직 열려 있다',J("__g.MAPID==='rowen'&&!__g.rift&&__g.riftUp()"))
    # 7) 균열 안 저장 → 이어하기는 들어오기 전 자리(균열 밖) · 남은 시간 유지
    # (이어하기는 사냥터 안 자리면 마을 광장에서 시작하는 기존 규칙이 있다 → 사냥터 밖 자리인 길잡이 표석 앞에서 들어간다)
    J("(()=>{const g=__g,w=g.MAPS.rowen.way;g.player.x=w.x+6;g.player.y=w.y+34;g.snap();})()");p2=J("[Math.round(__g.player.x),Math.round(__g.player.y)]")
    R.enter();J("__g.S.riftOpenT=500;__g.S.riftEK=7;__g.step(100,.05);__g.save()")
    sv=json.loads(J("localStorage.getItem('rowen-mmo-v4')"))
    chk('균열 안 저장: 맵 · 자리 = 들어오기 전 것 · 남은 유지 시간 · 처치 수 저장',sv['map']=='rowen' and [round(sv['x']),round(sv['y'])]==p2 and 490<=sv['riftOpenT']<=496 and sv['riftEK']==7,[sv['map'],sv['x'],sv['y'],sv['riftOpenT'],sv['riftEK']])
    pg.reload();pg.wait_for_function('window.__ready===true',timeout=120000);pg.click('#btnCont');pg.wait_for_timeout(500);pg.evaluate("window.requestAnimationFrame=()=>0")
    c=J("({map:__g.MAPID,rift:!!__g.rift,p:[Math.round(__g.player.x),Math.round(__g.player.y)],T:__g.S.riftOpenT,ek:__g.S.riftEK,up:__g.riftUp(),hud:document.getElementById('riftHud').hidden,key:__g.riftKey()})")
    chk('이어하기: 로웬 · 들어오기 전 자리 · 균열 밖 · HUD 숨김 · 균열은 열려 있고 남은 시간 · 진행 유지(꺼 둔 동안은 흐르지 않는다)',c['map']=='rowen' and not c['rift'] and abs(c['p'][0]-p2[0])<=2 and abs(c['p'][1]-p2[1])<=2 and c['hud'] and 485<=c['T']<=496 and c['ek']==7 and c['up'] and c['key'],c)
    # 8) 균열 안에서 퀘스트 카드로 이동 → 균열에서 나간 뒤 이어 간다(균열 문으로 걸어 나감)
    J("__g.S.autoQ=false;__g.S.hpPot=20;__g.step(3,.05)");R.enter();J("__g.questGo()")
    ok=run("__g.MAPID==='rowen'&&!__g.rift",120,6)
    chk('균열 안에서 퀘스트로 이동: 균열 문 → 나감(균열 끝) → 로웬에서 이어 감',ok and J("document.getElementById('riftHud').hidden"),J("({map:__g.MAPID,rift:!!__g.rift,nav:__g.nav&&__g.nav.label,hunt:__g.hunt&&__g.hunt.zone})"))
    J("__g.cancelNav();__g.step(2,.05)")
    # 9) 미니맵 누르기: 전용 맵 안에서 그 자리로 이동(나가지 않는다)
    J("__g.S.hpPot=20");R.enter();J("__g.cancelNav();__g.step(2,.05)")
    mr=J(RECT+"('mini')");pg.mouse.click(mr['l']+mr['w']*.5,mr['t']+mr['h']*.35);J("__g.step(10,.05)")
    chk('미니맵 누르기: 전용 맵 안에서 이동 · 균열 유지',J("__g.MAPID==='rift'&&!!__g.rift&&!__g.traveling"),J("__g.nav&&__g.nav.label"))
    R.leave()
    chk('JS 오류 없음',not errs,errs[:3]);b.close()
    # 10) 모바일 가로(844×390): HUD가 미니맵 · 스킬 슬롯 · 트래커 · 버전 표시를 덮지 않는다
    b,pg,errs=boot(p,HTML,viewport={'width':844,'height':390},has_touch=True,is_mobile=True);R=Rift(pg);J=R.J
    J("__g.S.autoQ=false;__g.S.lv=13;__g.S.hpPot=20;__g.step(5,.05)");R.enter();J("__g.step(20,.05);__g.riftHud();__g.render()")
    m=J("(()=>{const o={};for(const id of ['riftHud','rhX','mini','verTag','skrow'])o[id]="+RECT+"(id);return o})()")
    chk('모바일: HUD 화면 안 · [나가기] 누를 수 있는 크기',m['riftHud']['w']>0 and m['riftHud']['l']>=0 and m['riftHud']['r']<=844 and m['riftHud']['b']<=390 and m['rhX']['w']>=30 and m['rhX']['h']>=16,[m['riftHud'],m['rhX']])
    chk('모바일: HUD가 미니맵 · 스킬 · 버전 표시와 겹치지 않음',not hit(m['riftHud'],m['mini']) and not hit(m['riftHud'],m['verTag']) and not hit(m['riftHud'],m['skrow']) and m['skrow']['w']>0,[m['mini'],m['skrow'],m['verTag']])
    pg.screenshot(path=f"{OUT}/riftspace446_mobile.png")
    pg.tap('#rhX');pg.wait_for_timeout(80)
    mm=J("(()=>{const d=document.getElementById('dlg')||document.querySelector('.dlg');const bs=[...document.querySelectorAll('#dlgA button')].map(b=>{const r=b.getBoundingClientRect();return {t:b.textContent,l:r.left,r:r.right,t0:r.top,b:r.bottom,w:r.width,h:r.height}});return {name:__g.modal&&__g.modal.name,bs}})()")
    chk('모바일: 나가기 확인 팝업 버튼 2개가 화면 안 · 누를 수 있는 크기',mm['name']=='균열에서 나가기' and len(mm['bs'])==2 and all(x['l']>=0 and x['r']<=844 and x['b']<=390 and x['t0']>=0 and x['w']>=44 and x['h']>=24 for x in mm['bs']),mm)
    J("__g.render()");pg.screenshot(path=f"{OUT}/riftspace446_mobile_ask.png")
    pg.tap('#dlgA button:nth-child(2)');R.wait_out();chk('모바일: [나간다] 탭 → 밖으로',J("__g.MAPID==='rowen'&&!__g.rift"))
    J("__g.step(25,.05);__g.riftChip();__g.render()")
    cm=J("(()=>{const o={};for(const id of ['riftChip','bMenu','mini'])o[id]="+RECT+"(id);o.t=document.getElementById('rcT').textContent;o.sib=[...document.getElementById('riftChip').parentElement.children].filter(e=>e.id!=='riftChip'&&!e.hidden).map(e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}});return o})()")
    chk('모바일: 월드 위쪽 ⧗ 표시가 화면 안 · 메뉴 버튼 · 미니맵 · 옆 표시들과 겹치지 않음',cm['riftChip']['w']>30 and cm['riftChip']['l']>=0 and cm['riftChip']['r']<=844 and cm['riftChip']['t']>=0 and not hit(cm['riftChip'],cm['bMenu']) and not hit(cm['riftChip'],cm['mini']) and not any(hit(cm['riftChip'],x) for x in cm['sib']),cm)
    pg.screenshot(path=f"{OUT}/riftspace446_mobile_world.png")
    chk('JS 오류 없음(모바일)',not errs,errs[:3]);b.close()
print(f"{sum(res)}/{len(res)}");sys.exit(0 if all(res) else 1)
