"""v4.10 성장 봇 시뮬레이션 (tests/growth_bot.js가 플레이어 대신 제작·강화·컬렉션) — 원본: 자동 진행 전체 시뮬레이션 — 로웬 원정기 프로토타입 (v4.8: 자동 성장 + 자동 장착 켬, 자동 분해 기본값)
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
    BOT=os.environ.get("BOT","1")=="1";pg.add_script_tag(path=os.path.join(os.path.dirname(os.path.abspath(__file__)),"growth_bot.js"))
    pg.evaluate("__g.S.autoGrow=true;__g.S.cfg.autoEq=true;__g.S.autoQ=true;__g.autoNext()")
    st="(()=>{const q=__g.curQ(),g=__g.gateState(q);return {qi:__g.S.qi,qs:__g.S.qs,lv:__g.S.lv,cp:__g.cpOf(),map:__g.map,trav:__g.traveling,nav:__g.nav&&__g.nav.label,hunt:__g.hunt&&(__g.hunt.sub||__g.hunt.sp||'mob'),modal:__g.modal&&__g.modal.name,sub:JSON.stringify(Object.fromEntries(Object.entries(__g.S.sq).filter(([k,v])=>v.st!=='clear'&&!__g.SUBQ[k].trial).map(([k,v])=>[k,v.st+v.n]))),gate:q.gate?g.ok:null,sk:JSON.stringify(__g.S.sk),hpPot:__g.S.hpPot,w:Math.round(__g.wPct()*100),it:__g.S.items.length,mpPot:__g.S.mpPot,stat:JSON.stringify(__g.STAT),dead:__g.player.dead,gold:__g.S.gold,inv:__g.inv?__g.inv.m.lv+' '+__g.inv.zone:null,invSeen:!!__g.S.invSeen}})()"
    last=None;stall=0;gatelog={};RIFTPROBE=os.environ.get('RIFTPROBE')=='1';BOTRIFT=os.environ.get('BOTRIFT')=='1';RIFT_ST=int(os.environ.get('BOTRIFT_ST','40'));riftOn=None;riftUse={'n':0,'k':0,'stone':0};probed=set();NQ=pg.evaluate('__g.QUESTS.length')
    for i in range(int(os.environ.get('ITERS','3600'))):
        if pg.evaluate("__g.traveling"):
            pg.wait_for_timeout(300);continue
        pg.evaluate("__g.step(60,0.05)")
        if BOT and i%int(os.environ.get("BOTEVERY","5"))==0:
            lg=pg.evaluate("__bot("+os.environ.get("BOTOPT","{}")+")")
            if lg and os.environ.get("BOTLOG"): print("BOT",i*3,lg)
        s=pg.evaluate(st)
        if BOTRIFT and not s['modal'] and not s['dead']:
            # v4.42 봇 균열 사용: 자동 진행으로 사냥 중 강화석이 모자라면(< BOTRIFT_ST) 균열에 15분(게임 시간) — 물약 10 미만이면 [채우고 입장]
            # v4.43 BOTRIFT_MODE=wait: 강화석 대신 '성장 대기(수련 사냥, trainFor)' 중에 균열 15분 — 대기 시간을 균열이 줄이는지 본다
            RCOND=("!!__g.trainFor&&__g.S.lv<=Math.max(...__g.ZALL[__g.riftZone()].mobs.map(a=>a[2]))+3" if os.environ.get('BOTRIFT_MODE')=='wait' else f"__g.S.stone<{RIFT_ST}")
            # v4.44: wait 모드는 '지금 레벨에 맞는 균열'만(균열 사냥터 최고 Lv+3 이하) — v4.43에선 Lv26에 로웬 Lv9 균열을 썼다
            if riftOn is None and pg.evaluate(f"__g.riftOpen()&&!__g.rift&&__g.riftT()>=900&&!!__g.hunt&&__g.S.autoQ&&{RCOND}&&!__g.nav"):
                pg.evaluate("__g.S.hpPot<__g.RIFT.potMin?__g.riftPrepGo():__g.riftEnter(true)");riftOn=i;riftUse['n']+=1;print('BOTRIFT in',i*3,s['map'],'lv',s['lv'],'stone',pg.evaluate('__g.S.stone'))
            elif riftOn is not None and (i-riftOn>=300 or pg.evaluate("!__g.rift&&!__g.nav")):
                o=pg.evaluate("(()=>{const g=__g,R=g.rift;const o=R?{k:R.k,stone:R.stone,dsg:R.dsg,rcp:R.rcp,eq:R.eq||0,sh:R.sh||0,box:R.box||0}:{};if(R)g.riftEnd('out');g.S.autoQ=true;g.autoNext();return o})()")
                riftOn=None;riftUse['k']+=o.get('k',0);riftUse['stone']+=o.get('stone',0);print('BOTRIFT out',i*3,o)
        if RIFTPROBE and not s['modal'] and not s['dead'] and pg.evaluate("__g.riftOpen()&&!__g.rift&&__g.riftT()>=600") and s['map'] not in probed:
            # v4.41 균열 측정: 균열이 처음 열린 시점에 120초(게임 시간) 들어가 분당 처치 · 강화석을 잰다 — 측정 뒤 자동 진행으로 돌아감
            probed.add(s['map']);pr=pg.evaluate("(()=>{const g=__g;g.riftEnter();return {lv:g.S.lv,st:g.S.stone,k:g.S.kills,z:g.rift&&g.rift.zone,cp:g.cpOf()}})()")
            for j in range(40):
                pg.evaluate("__g.step(60,0.05)")
                if BOT and j%5==0: pg.evaluate("__bot("+os.environ.get("BOTOPT","{}")+")")
                if pg.evaluate("!__g.rift"): break
            r=pg.evaluate("(()=>{const g=__g,R=g.rift;const o=R?{k:R.k,stone:R.stone,dsg:R.dsg,rcp:R.rcp,sec:R.t0-g.S.riftT,dead:false}:{dead:g.player.dead};if(R)g.riftEnd('out');g.S.autoQ=true;g.autoNext();return o})()")
            print('RIFTPROBE',i*3,s['map'],pr,r,'kpm',round(r.get('k',0)/max(1,r.get('sec',0))*60,1) if r.get('sec') else '-')
            if pg.evaluate("__g.player.dead"): pg.evaluate("if(__g.modal&&__g.modal.name==='사망했습니다')__g.modal.btns[0].f()")
            continue
        if s['modal'] in ('신의 시련이 열렸다','다음 신의 시련'):  # v4.8.5: 시련 선택은 플레이어 몫 — 시뮬레이션은 '나중에'로 메인만 진행(기준 비교용)
            print('TRIAL CHOICE',i*3);pg.evaluate("__g.modal.btns[0].f()")
        if s['dead']:
            print('DEAD',i*3,s);pg.evaluate("if(__g.modal&&__g.modal.name==='사망했습니다')__g.modal.btns[0].f()")
        if s['gate'] is not None and s['qs']=='active':
            k=s['qi'];subs_done=s['sub']=='{}'
            if subs_done and k not in gatelog: gatelog[k]=(s['lv'],s['cp'],s['gate']);print('GATE subs done q',k+1,'lv',s['lv'],'cp',s['cp'],'faith',pg.evaluate('__g.pStats().faith'),'ok',s['gate'])
        key=(s['qi'],s['qs'],s['sub'],s["lv"])
        if key==last: stall+=1
        else: stall=0;last=key
        if i%100==0 or stall==40: print(i*3,'s',s)
        if stall==40: print('STALL');
        if s['qi']>=NQ: print('ALL DONE',i*3,s);break
        if i%20==0 and os.environ.get('TRACE'):
            tr=pg.evaluate("(()=>{const g=__g,S=g.S,q=g.curQ();return {t:Math.round(g.t),lv:S.lv,qi:S.qi,qs:S.qs,faith:g.pStats().faith,br:g.faithBreak(),zone:g.curZoneId||null,bossFa:q.elite?q.elite.fa:null,rep:S.repN||0,coll:g.collDoneN(),bcoll:g.bcollDoneN(),pots:g.STAT.hpUse,deaths:g.STAT.deaths,cp:g.cpOf()}})()")
            open(os.environ['TRACE'],'a').write(json.dumps(tr)+'\n')
        if i%100==0: print('  faith',pg.evaluate('__g.pStats().faith'),'coll',pg.evaluate('__g.collDoneN()'),'bcoll',pg.evaluate('__g.bcollDoneN()'),'bu',pg.evaluate('JSON.stringify(__g.S.items.filter(x=>x.bu).map(x=>x.bu+"+"+x.en))'),'stone',pg.evaluate('__g.S.stone'),'open',pg.evaluate('__g.COLL.filter(c=>!__g.collDone(c)).map(c=>c.id+":"+c.req.filter((r,i)=>__g.collReg(c,i)).length+"/"+c.req.length).join(" ")'),'resup',pg.evaluate('__g.STAT.resup||0'))
    pg.evaluate("__g.snap();__g.render()");pg.screenshot(path='flow_end.png')
    print('gates',gatelog);print('BOTRIFT use',riftUse) if BOTRIFT else None;print('FINAL',pg.evaluate("JSON.stringify({lv:__g.S.lv,gold:__g.S.gold,kills:__g.S.kills,stone:__g.S.stone,ore:[__g.cnt('ore1'),__g.cnt('ore2'),__g.cnt('ore3')],bls:__g.cnt('bls'),items:__g.S.items.length,eq:Object.values(__g.S.eq).filter(Boolean).map(u=>{const it=__g.S.items.find(i=>i.u===u);return __g.GRADES[it.g].n+' '+__g.itemName(it)}),slots:__g.S.slots,sk:__g.S.sk,w:Math.round(__g.wPct()*100),stat:__g.STAT,t:__g.t})"));print('ERRORS',errs[:5] or 'none');b.close()
