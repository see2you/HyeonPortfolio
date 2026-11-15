"""자동 진행 전체 시뮬레이션 — 로웬 원정기 프로토타입 (v4.8: 자동 성장 + 자동 장착 켬, 자동 분해 기본값)
준비:
  pip install playwright && playwright install chromium
  npm i three@0.128.0   (cdn을 못 쓰는 헤드리스용)
  THREE_JS=node_modules/three/build/three.min.js bash build.sh   → rowen_mmo_local.html 생성
실행:
  python3 tests/flow_sim.py [rowen_mmo_local.html 경로]
출력: 3초(게임 시간) 단위 상태, 관문 통과 시점(GATE), 사망(DEAD), 정체(STALL: 120초 동안 퀘스트·레벨 변화 없음 — 느린 수집 퀘스트에서도 뜰 수 있음), 완주(ALL DONE)
"""
import sys,os
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html')
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.evaluate("__g.S.autoGrow=true;__g.S.cfg.autoEq=true;__g.S.autoQ=true;__g.autoNext()")
    st="(()=>{const q=__g.curQ(),g=__g.gateState(q);return {qi:__g.S.qi,qs:__g.S.qs,lv:__g.S.lv,cp:__g.cpOf(),map:__g.map,trav:__g.traveling,nav:__g.nav&&__g.nav.label,hunt:__g.hunt&&(__g.hunt.sub||__g.hunt.sp||'mob'),modal:__g.modal&&__g.modal.name,sub:JSON.stringify(Object.fromEntries(Object.entries(__g.S.sq).filter(([k,v])=>v.st!=='clear'&&!__g.SUBQ[k].trial).map(([k,v])=>[k,v.st+v.n]))),gate:q.gate?g.ok:null,sk:JSON.stringify(__g.S.sk),hpPot:__g.S.hpPot,w:Math.round(__g.wPct()*100),it:__g.S.items.length,mpPot:__g.S.mpPot,stat:JSON.stringify(__g.STAT),dead:__g.player.dead,gold:__g.S.gold,inv:__g.inv?__g.inv.m.lv+' '+__g.inv.zone:null,invSeen:!!__g.S.invSeen}})()"
    last=None;stall=0;gatelog={}
    for i in range(2600):
        if pg.evaluate("__g.traveling"):
            pg.wait_for_timeout(300);continue
        pg.evaluate("__g.step(60,0.05)")
        s=pg.evaluate(st)
        if s['modal'] in ('신의 시련이 열렸다','다음 신의 시련'):  # v4.8.5: 시련 선택은 플레이어 몫 — 시뮬레이션은 '나중에'로 메인만 진행(기준 비교용)
            print('TRIAL CHOICE',i*3);pg.evaluate("__g.modal.btns[0].f()")
        if s['dead']:
            print('DEAD',i*3,s);pg.evaluate("if(__g.modal&&__g.modal.name==='사망했습니다')__g.modal.btns[0].f()")
        if s['gate'] is not None and s['qs']=='active':
            k=s['qi'];subs_done=s['sub']=='{}'
            if subs_done and k not in gatelog: gatelog[k]=(s['lv'],s['cp'],s['gate']);print('GATE subs done q',k+1,'lv',s['lv'],'cp',s['cp'],'ok',s['gate'])
        key=(s['qi'],s['qs'],s['sub'],s["lv"])
        if key==last: stall+=1
        else: stall=0;last=key
        if i%100==0 or stall==40: print(i*3,'s',s)
        if stall==40: print('STALL');
        if s['qi']>=33: print('ALL DONE',i*3,s);break
    pg.evaluate("__g.snap();__g.render()");pg.screenshot(path='flow_end.png')
    print('gates',gatelog);print('FINAL',pg.evaluate("JSON.stringify({lv:__g.S.lv,gold:__g.S.gold,kills:__g.S.kills,stone:__g.S.stone,ore:[__g.cnt('ore1'),__g.cnt('ore2'),__g.cnt('ore3')],bls:__g.cnt('bls'),items:__g.S.items.length,eq:Object.values(__g.S.eq).filter(Boolean).map(u=>{const it=__g.S.items.find(i=>i.u===u);return __g.GRADES[it.g].n+' '+__g.itemName(it)}),slots:__g.S.slots,sk:__g.S.sk,w:Math.round(__g.wPct()*100),stat:__g.STAT,t:__g.t})"));print('ERRORS',errs[:5] or 'none');b.close()
