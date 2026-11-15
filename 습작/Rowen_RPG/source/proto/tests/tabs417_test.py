"""v4.17 퀘스트 탭(반복·시련 분리) · 반복 토글 · 스킬 레드닷 · 컬렉션 일괄등록(전부, 한 번) 검사 (shots/v417_*.png)"""
import os,sys
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');os.makedirs('shots',exist_ok=True)
TT="[...document.querySelectorAll('#qlist .qe .tt')].map(e=>e.textContent)"
def tab(pg,n):pg.evaluate("n=>[...document.querySelectorAll('#qtabs .qtb')].find(b=>b.textContent===n).click()",n);pg.evaluate("__g.step(.3,0.05)")
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    pg.evaluate("""(()=>{const g=__g,S=g.S;S.qi=5;S.qs='avail';S.lv=15;S.kp=2;S.gold=5000;for(const id of ['ga','gr','gz'])S.sq[id]={st:'avail',n:0};
      for(let i=0;i<6;i++)S.items.push(g.newItem('ring',1,0),g.newItem('weapon',1,0),g.newItem('armor',1,0));})()""")
    pg.evaluate("__g.step(3,0.05);__g.render()")
    tabs=pg.evaluate("[...document.querySelectorAll('#qtabs .qtb')].map(b=>b.textContent)");print('tabs',tabs)
    assert tabs[:5]==['전체','메인','서브','반복','시련']
    secs=pg.evaluate("[...document.querySelectorAll('#qlist .qsec')].map(e=>e.textContent)");print('all sections',secs,pg.evaluate(TT))
    assert len(secs)>=2 and all(x=='' for x in secs)  # v4.18: 머리글 대신 구분선
    assert pg.evaluate("__g.modalOpen?__g.modalOpen():!document.getElementById('modal')||document.getElementById('modal').hidden")!=False
    pg.screenshot(path='shots/v417_전체탭.png',clip={'x':0,'y':80,'width':460,'height':520})
    tab(pg,'서브');sub=pg.evaluate(TT);print('sub',sub);assert not any('시련' in x for x in sub)
    tab(pg,'시련');tr=pg.evaluate(TT);print('trial',tr);assert len(tr)==1 and '시련' in tr[0]
    pg.screenshot(path='shots/v417_시련탭.png',clip={'x':0,'y':80,'width':460,'height':360})
    pg.evaluate("__g.acceptSub('gr');__g.step(3,0.05)");tr2=pg.evaluate(TT);print('trial chosen',tr2,pg.evaluate('JSON.stringify(__g.S.sq)'));assert len(tr2)==1
    tab(pg,'반복');rp=pg.evaluate(TT);print('rep',rp)
    lp=pg.evaluate("document.querySelector('#qlist .qloop')&&document.querySelector('#qlist .qloop').textContent");print('loop',lp);assert lp and '반복 끔' in lp
    pg.screenshot(path='shots/v417_반복탭.png',clip={'x':0,'y':80,'width':460,'height':360})
    pg.evaluate("document.querySelector('#qlist .qloop').click()");pg.evaluate("__g.step(.5,0.05)")
    st=pg.evaluate("({loop:__g.S.repLoop,auto:__g.S.autoQ,txt:document.querySelector('#qlist .qloop').textContent})");print('loop on',st);assert st['loop']=='rowen' and '반복 중' in st['txt']
    pg.screenshot(path='shots/v417_반복켬.png',clip={'x':0,'y':80,'width':460,'height':360})
    # 의뢰를 끝내고 보상 → 반복이면 다시 의뢰
    pg.evaluate("(()=>{const S=__g.S;__g.acceptRep('rowen');S.rq.n=20;S.rq.st='done';__g.claimRep();})()");pg.evaluate("__g.step(8,0.05)")
    pg.evaluate('__g.step(150,0.05)');print('after claim',pg.evaluate("({rq:__g.S.rq,rep:__g.S.repR,nav:document.getElementById('navT').textContent})"));assert pg.evaluate('!!__g.S.rq')
    pg.evaluate("document.querySelector('#qlist .qloop').click()");assert pg.evaluate("!__g.S.repLoop")
    # 스킬 레드닷
    pg.evaluate("__g.closeWin&&__g.closeWin();__g.openSkills()");pg.wait_for_timeout(200)
    d=pg.evaluate("({cards:[...document.querySelectorAll('.skc')].length,dots:[...document.querySelectorAll('.skc.dot')].map(e=>e.querySelector('b').textContent)})");print('skill dots',d)
    assert d['dots'] and len(d['dots'])<d['cards']
    pg.screenshot(path='shots/v417_스킬레드닷.png')
    pg.evaluate("__g.S.kp=0;__g.openSkills()");pg.wait_for_timeout(100)
    d0=pg.evaluate("[...document.querySelectorAll('.skc.dot')].length");print('dots kp0',d0)
    # 컬렉션 일괄 등록: 한 번에 전부
    pg.evaluate("__g.openColl()");pg.wait_for_timeout(200);n=pg.evaluate("__g.collBatchList().length");print('batch',n);assert n>0
    pg.screenshot(path='shots/v417_일괄등록.png')
    pg.evaluate("document.querySelector('.clbatch .btn').click()");pg.wait_for_timeout(100)
    n2=pg.evaluate("__g.collBatchList().length");print('left',n2);assert n2==0
    print("ERRORS",errs or "none");b.close()
