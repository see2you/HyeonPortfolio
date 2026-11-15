"""v4.28 창 점검 2b — 후반 상태(Lv 40 · 모든 지역 · 서브 퀘스트 다수 · 시련 3개)로 퀘스트 트래커(탭마다) · 시련 선택 · 표석 이동 ·
NPC 대화 · 권능 창을 열어 '스크롤해야 보이는 / 화면 밖 동작 버튼'이 없는지 확인한다. 1280×720 · 960×540 (shots/v428_*.png)"""
import os, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0,os.path.dirname(__file__))
HTML=os.path.abspath('rowen_mmo_local.html')
AUDIT=open(os.path.join(os.path.dirname(__file__),'winaudit427_test.py'),encoding='utf-8').read().split('AUDIT="""')[1].split('"""')[0]
SETUP="""(()=>{const g=__g,S=g.S;S.lv=40;S.gold=900000;S.hpPot=40;S.mpPot=40;S.shard=99;S.maps=Object.keys(g.MAPS);
 const ids=Object.keys(g.SUBQ||{});let n=0;for(const id of ids){if(['ga','gr','gz'].includes(id))continue;if(n++<99)S.sq[id]={st:'active',n:0};}
 for(const id of ['ga','gr','gz'])S.sq[id]={st:'avail',n:0};g.setQTab('all');g.save();})()"""
bad=[]
def modal_check(pg,nm,vw,vh):
    hid=pg.evaluate(AUDIT+"('#modal')")
    r=pg.evaluate("(()=>{const d=document.querySelector('#modal .dlg').getBoundingClientRect(),a=document.getElementById('dlgA').getBoundingClientRect();return {top:d.top,bot:d.bottom,abot:a.bottom,atop:a.top}})()")
    ok=not hid and r['abot']<=vh+1 and r['top']>=-1
    print('  ',vw,nm,'숨은 버튼',hid[:6],'창',round(r['top']),'~',round(r['bot']),'버튼 줄 아래',round(r['abot']),'OK' if ok else 'BAD')
    if not ok: bad.append((vw,nm,hid,r))
    if vw==1280 or not ok: pg.screenshot(path=f'shots/v428_{nm}_{vw}.png')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    for vw,vh in [(1280,720),(960,540),(1366,600)]:
        pg=b.new_page(viewport={'width':vw,'height':vh});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
        pg.evaluate(SETUP);pg.wait_for_timeout(100)
        print(vw,vh,'ver',pg.evaluate("document.getElementById('verTag').textContent"),'maps',pg.evaluate("__g.S.maps.length"))
        # 퀘스트 트래커: 탭마다
        for tab in ['all','main','sub','rep','trial']:
            nmT={'all':'전체','main':'메인','sub':'서브','rep':'반복','trial':'시련'}[tab]
            pg.evaluate("(n)=>[...document.querySelectorAll('#qtabs .qtb')].find(b=>b.textContent===n).click()",nmT);pg.wait_for_timeout(150)
            assert pg.evaluate("__g.qTab")==tab
            # 퀘스트 카드(.qe)는 목록 줄이라 스크롤돼도 된다 — 탭 · [더 보기] · [반복 의뢰] 같은 동작 버튼만 본다
            hid=[h for h in pg.evaluate(AUDIT+"('.qt')") if not h.startswith('qe ')]
            r=pg.evaluate("(()=>{const q=document.querySelector('.qt').getBoundingClientRect(),k=document.getElementById('bKeys').getBoundingClientRect();const bs=[...document.querySelectorAll('.qt button')].filter(b=>b.offsetParent);return {bot:round(q.bottom),ktop:round(k.top),n:bs.length}})()".replace('round(','Math.round('))
            ok=not hid and r['bot']<=r['ktop']+1
            print('   ',vw,'퀘스트',tab,'버튼',r['n'],'숨은',hid[:5],'트래커 아래',r['bot'],'조작법 위',r['ktop'],'OK' if ok else 'BAD')
            if not ok: bad.append((vw,'quest-'+tab,hid,r))
            if vw==1280 and tab in('all','sub'): pg.screenshot(path=f'shots/v428_퀘스트_{tab}.png')
        # v4.28 트래커가 [조작법 보기] 위에서 끝나고, 넘치는 카드는 목록 안에서 스크롤된다 (탭 줄은 고정)
        pg.evaluate("[...document.querySelectorAll('#qtabs .qtb')].find(b=>b.textContent==='서브').click()");pg.wait_for_timeout(150)
        q=pg.evaluate("""(()=>{const q=document.querySelector('.qt').getBoundingClientRect(),k=document.getElementById('bKeys').getBoundingClientRect(),L=document.getElementById('qlist'),t=document.getElementById('qtabs').getBoundingClientRect();
          const n=L.querySelectorAll('.qe').length;const r={qbot:q.bottom,ktop:k.top,sh:L.scrollHeight,ch:L.clientHeight,tabTop:t.top,n};L.scrollTop=L.scrollHeight;r.tab2=document.getElementById('qtabs').getBoundingClientRect().top;
          const last=[...L.querySelectorAll('.qe')].pop().getBoundingClientRect(),lb=L.getBoundingClientRect();r.lastIn=last.bottom<=lb.bottom+1;return r;})()""")
        print('   트래커 서브 전부',q);assert q['qbot']<=q['ktop']+1,'트래커가 조작법 버튼과 겹침';assert q['tabTop']==q['tab2'],'탭이 같이 스크롤됨';assert q['lastIn'],'마지막 카드에 닿을 수 없음'
        if vw==1280: pg.screenshot(path='shots/v428_퀘스트_서브전부.png')
        # 목록 위 휠 = 목록 스크롤(화면 확대 아님)
        pg.evaluate("document.getElementById('qlist').scrollTop=0");z0=pg.evaluate("__g.zoomT")
        bx=pg.evaluate("(()=>{const r=document.getElementById('qlist').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()")
        pg.mouse.move(*bx);pg.mouse.wheel(0,300);pg.wait_for_timeout(200)
        st,z1=pg.evaluate("[document.getElementById('qlist').scrollTop,__g.zoomT]");print('   휠',st,z0,z1);assert st>0 and z0==z1,'목록 위 휠이 스크롤되지 않음'
        pg.evaluate("__g.setQTab('all')")
        for nm,js in [('시련선택','__g.chooseTrial(true)'),('표석','__g.openNpc("way")'),('권능','__g.openGods()'),('장로','__g.openNpc("orvin")')]:
            pg.evaluate("(()=>{const m=document.getElementById('modal');if(m&&!m.hidden){m.hidden=true;}})()");pg.evaluate("__g.closeWin&&__g.closeWin()")
            try: pg.evaluate(js)
            except Exception as e: print('  열기 실패',nm,str(e)[:120]);continue
            pg.wait_for_timeout(200)
            if pg.evaluate("document.getElementById('modal').hidden"):
                hid=pg.evaluate(AUDIT+"('#win')");print('  ',vw,nm,'(창) 숨은',hid[:6])
                if hid: bad.append((vw,nm,hid))
                if vw==1280: pg.screenshot(path=f'shots/v428_{nm}_{vw}.png')
            else: modal_check(pg,nm,vw,vh)
        # v4.28 대화 본문이 화면보다 길어도 버튼 줄(#dlgA)은 화면 안 · 본문만 스크롤
        pg.evaluate("__g.openGods()");pg.wait_for_timeout(100)
        pg.evaluate("(()=>{const B=document.getElementById('dlgB');for(let i=0;i<25;i++){const d=document.createElement('div');d.className='si';d.textContent='긴 목록 '+i;d.style.minHeight='40px';B.appendChild(d);}})()");pg.wait_for_timeout(100)
        r=pg.evaluate("(()=>{const a=document.getElementById('dlgA').getBoundingClientRect(),d=document.querySelector('#modal .dlg').getBoundingClientRect(),B=document.getElementById('dlgB');return {abot:a.bottom,dtop:d.top,scroll:B.scrollHeight>B.clientHeight}})()")
        print('   긴 대화',r);assert r['abot']<=vh and r['dtop']>=-1 and r['scroll'],'긴 대화창 버튼이 화면 밖'
        if vw==1280: pg.screenshot(path='shots/v428_긴대화.png')
        print('ERRORS',errs or 'none');assert not errs,errs
        pg.close()
    b.close()
print('BAD',bad)
assert not bad, bad
print('OK')
