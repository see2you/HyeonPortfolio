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
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:(errs.append(str(e)),print('PAGEERR',str(e),(getattr(e,'stack','') or '')[:600].replace('\n',' | '))))
    HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html')
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    BOT=os.environ.get("BOT","1")=="1";pg.add_script_tag(path=os.path.join(os.path.dirname(os.path.abspath(__file__)),"growth_bot.js"))
    pg.evaluate("__g.S.autoGrow=true;__g.S.cfg.autoEq=true;__g.S.autoQ=true;__g.autoNext()")
    st="(()=>{const q=__g.curQ(),g=__g.gateState(q);return {qi:__g.S.qi,qs:__g.S.qs,lv:__g.S.lv,cp:__g.cpOf(),map:__g.map,trav:__g.traveling,nav:__g.nav&&__g.nav.label,hunt:__g.hunt&&(__g.hunt.sub||__g.hunt.sp||'mob'),modal:__g.modal&&__g.modal.name,sub:JSON.stringify(Object.fromEntries(Object.entries(__g.S.sq).filter(([k,v])=>v.st!=='clear'&&!__g.SUBQ[k].trial).map(([k,v])=>[k,v.st+v.n]))),gate:q.gate?g.ok:null,sk:JSON.stringify(__g.S.sk),hpPot:__g.S.hpPot,w:Math.round(__g.wPct()*100),it:__g.S.items.length,mpPot:__g.S.mpPot,stat:JSON.stringify(__g.STAT),dead:__g.player.dead,gold:__g.S.gold,inv:__g.inv?__g.inv.m.lv+' '+__g.inv.zone:null,invSeen:!!__g.S.invSeen}})()"
    last=None;stall=0;gatelog={};BOTRIFT=os.environ.get('BOTRIFT')=='1';RIFT_ST=int(os.environ.get('BOTRIFT_ST','40'));riftOn=None;riftUse={'n':0,'k':0,'stone':0};riftRuns=[];NQ=pg.evaluate('__g.QUESTS.length')
    for i in range(int(os.environ.get('ITERS','3600'))):
        if pg.evaluate("__g.traveling"):
            pg.wait_for_timeout(300);continue
        pg.evaluate("__g.step(60,0.05)")
        if BOT and i%int(os.environ.get("BOTEVERY","5"))==0:
            lg=pg.evaluate("__bot("+os.environ.get("BOTOPT","{}")+")")
            if lg and os.environ.get("BOTLOG"): print("BOT",i*3,lg)
        s=pg.evaluate(st)
        if BOTRIFT:
            # v4.47 균열 v2(주기 15분 · 유지 10분 · 한 판): 열려 있으면 들어가 균열의 주인까지 — 클리어 · 시간 끝으로 그 균열이 끝나면 자동 진행으로 돌아간다.
            #   기본 = 열릴 때마다 바로(부지런한 플레이어) · BOTRIFT_MODE=wait = 성장 대기(수련 사냥, trainFor) 중일 때만. 물약 10 미만이면 [채우고 입장]
            #   한 판 기록(RIFTRUN): 들어간 레벨 · 레벨대 · 분량 · 열린 뒤 몇 초에 들어갔나(late) · 처치 25/50/75/100% 시점(들어간 뒤 초) · 주인 등장/처치 시점 · 결과 · 물약 · 사망 · 재입장
            rs=pg.evaluate("(()=>{const g=__g,S=g.S;return {up:g.riftUp(),inn:!!g.rift,ek:S.riftEK||0,need:g.riftNeed(),pend:g.riftPend(),stay:g.riftStay(),carry:!!g.riftCarry,modal:g.modal&&g.modal.name,clr:S.riftClr||0,fail:S.riftFail||0,hp:g.STAT.hpUse||0,deaths:g.STAT.deaths||0,t:g.t,trav:!!g.traveling,map:S.riftMap,lv:S.lv,lord:(()=>{const m=g.riftEliteOf&&g.riftEliteOf();return m&&!m.dead?Math.round(m.hp/m.max*100):null})()}})()")
            if rs['modal'] in ('균열을 닫았다','균열이 닫혔다','시간의 균열이 닫혔다'): pg.evaluate("__g.closeModal()")
            elif rs['modal']=='균열에서 나왔다':  # 물약 소진 · 귀환으로 나옴 → 열려 있으면 [물약 사고 다시 입장]
                pg.evaluate("(()=>{const b=__g.modal.btns;b[b.length-1].f()})()")
                if riftOn: riftOn['re']+=1
            elif riftOn is None and rs['up'] and not rs['inn'] and not s['modal'] and not s['dead'] and pg.evaluate("!!__g.hunt&&__g.S.autoQ&&!__g.nav"+("&&!!__g.trainFor" if os.environ.get('BOTRIFT_MODE')=='wait' else "")):
                riftOn={'lv':rs['lv'],'map':rs['map'],'need':rs['need'],'late':round(pg.evaluate('__g.RIFT.stay')-rs['stay']),'t0':rs['t'],'hp0':rs['hp'],'d0':rs['deaths'],'c0':rs['clr'],'f0':rs['fail'],'ek0':rs['ek'],'mk':{},'re':0,'cp':s['cp']}
                pg.evaluate("__g.S.hpPot<__g.RIFT.potMin?__g.riftPrepGo():__g.riftEnter(true)");riftUse['n']+=1;print('BOTRIFT in',i*3,s['map'],'lv',s['lv'],'need',rs['need'],'stay',round(rs['stay']))
            elif riftOn is not None:
                el=round(rs['t']-riftOn['t0'])
                for q in (25,50,75,100):
                    if q not in riftOn['mk'] and (rs['ek']>=riftOn['need']*q/100 or rs['pend']): riftOn['mk'][q]=el
                if rs['pend'] and 'lord' not in riftOn: riftOn['lord']=el
                if rs['clr']>riftOn['c0'] or rs['fail']>riftOn['f0']:
                    if not rs['trav'] and not rs['inn']:
                        L=pg.evaluate("__g.STAT.riftLast||{}");res='clear' if rs['clr']>riftOn['c0'] else 'time'
                        rec={'lv':riftOn['lv'],'map':riftOn['map'],'need':riftOn['need'],'late':riftOn['late'],'mk':riftOn['mk'],'lordAt':riftOn.get('lord'),'end':el,'res':res,'pot':rs['hp']-riftOn['hp0'],'dead':rs['deaths']-riftOn['d0'],'re':riftOn['re'],'cp':riftOn['cp'],'ekEnd':riftOn.get('ekLast'),'lordHp':riftOn.get('lordHp')}
                        print('RIFTRUN',json.dumps(rec,ensure_ascii=False));riftRuns.append(rec);riftUse['k']+=L.get('k',0);riftUse['stone']+=L.get('stone',0)
                        if not s['dead']: pg.evaluate("__g.cancelNav&&__g.cancelNav();__g.S.autoQ=true;__g.autoNext()")
                        riftOn=None
                else:
                    riftOn['ekLast']=rs['ek'];riftOn['lordHp']=rs['lord']
                    # 죽었다 살아났거나 다른 까닭으로 밖에 있으면 다시 들어간다(균열은 아직 열려 있다)
                    if rs['up'] and not rs['inn'] and not rs['carry'] and not rs['trav'] and not s['dead'] and not rs['modal'] and pg.evaluate("!__g.nav&&!__g.player.dead"):
                        pg.evaluate("__g.S.hpPot<__g.RIFT.potMin?__g.riftPrepGo():__g.riftEnter(true)");riftOn['re']+=1
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
            tr=pg.evaluate("(()=>{const g=__g,S=g.S,q=g.curQ();return {t:Math.round(g.t),lv:S.lv,qi:S.qi,qs:S.qs,faith:g.pStats().faith,br:g.faithBreak(),zone:g.curZoneId||null,bossFa:q.elite?q.elite.fa:null,rep:S.repN||0,coll:g.collDoneN(),bcoll:g.bcollDoneN(),pots:g.STAT.hpUse,deaths:g.STAT.deaths,cp:g.cpOf(),gold:S.gold,inc:(g.STAT.killG||0)+(g.STAT.rwG||0),buyG:g.STAT.buyG||0}})()")
            open(os.environ['TRACE'],'a').write(json.dumps(tr)+'\n')
        if i%100==0: print('  faith',pg.evaluate('__g.pStats().faith'),'coll',pg.evaluate('__g.collDoneN()'),'bcoll',pg.evaluate('__g.bcollDoneN()'),'bu',pg.evaluate('JSON.stringify(__g.S.items.filter(x=>x.bu).map(x=>x.bu+"+"+x.en))'),'stone',pg.evaluate('__g.S.stone'),'open',pg.evaluate('__g.COLL.filter(c=>!__g.collDone(c)).map(c=>c.id+":"+c.req.filter((r,i)=>__g.collReg(c,i)).length+"/"+c.req.length).join(" ")'),'resup',pg.evaluate('__g.STAT.resup||0'))
    pg.evaluate("__g.snap();__g.render()");pg.screenshot(path='flow_end.png')
    print('gates',gatelog);print('BOTRIFT use',riftUse,'runs',len(riftRuns),'clear',sum(1 for r in riftRuns if r['res']=='clear'),'time',sum(1 for r in riftRuns if r['res']=='time'),'clearSec',[r['end'] for r in riftRuns if r['res']=='clear']) if BOTRIFT else None;print('FINAL',pg.evaluate("JSON.stringify({lv:__g.S.lv,gold:__g.S.gold,kills:__g.S.kills,stone:__g.S.stone,ore:[__g.cnt('ore1'),__g.cnt('ore2'),__g.cnt('ore3')],bls:__g.cnt('bls'),items:__g.S.items.length,eq:Object.values(__g.S.eq).filter(Boolean).map(u=>{const it=__g.S.items.find(i=>i.u===u);return __g.GRADES[it.g].n+' '+__g.itemName(it)}),slots:__g.S.slots,sk:__g.S.sk,w:Math.round(__g.wPct()*100),stat:__g.STAT,t:__g.t})"));print('ERRORS',errs[:5] or 'none');b.close()
