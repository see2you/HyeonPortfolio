"""v4.27 창 점검 2차 — 후반 상태(Lv 40 · 가방 가득 · 재료 · 도면 · 비법서 많음 · 컬렉션 다수)로 모든 창 · 대화창을 열어
'스크롤해야 보이는 동작 버튼'이 없는지 확인한다. 1280×720 · 960×540. (shots/v427_*.png)"""
import os, sys
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html')
# 보이는 버튼 중 스크롤 조상 밖으로 밀린 것 · 화면 밖인 것. 목록의 행 · 칸(가방 칸 .cell, 강화 목록 .enr, 스킬 카드 .skc, 재료 줄 .cfml/.infob, 컬렉션 카드 .clc 안 [등록])은
# 목록 자체가 스크롤되는 내용이라 제외 — '창의 동작 버튼'(일괄 · 제작 · 강화 · 구입 등)만 본다
AUDIT="""((root)=>{const out=[];const R=document.querySelector(root);if(!R||R.hidden)return out;for(const b of R.querySelectorAll('button')){if(b.offsetParent===null||b.closest('.cell,.enr,.skc,.cfml,.infob,.clc,.si'))continue;const r=b.getBoundingClientRect();
 let p=b.parentElement,hid=false;while(p&&p!==R){const cs=getComputedStyle(p);if(/(auto|scroll)/.test(cs.overflowY)&&p.scrollHeight>p.clientHeight+2){const q=p.getBoundingClientRect();if(r.top<q.top-1||r.bottom>q.bottom+1){hid=true;}}p=p.parentElement;}
 if(hid||r.bottom>innerHeight+1||r.right>innerWidth+1)out.push(b.className+':'+(b.textContent||b.title||'').trim().slice(0,24));}return out;})"""
SETUP="""(()=>{const g=__g,S=g.S;S.lv=40;S.gold=900000;S.stone=300;S.hpPot=40;S.mpPot=40;S.scroll=10;
 S.maps=Object.keys(g.MAPS);
 for(const k of Object.keys(g.STK))try{g.addStk(k,20);}catch(e){}
 const K=['weapon','helm','armor','cloak','gloves','boots','neck','ring'];
 for(let i=0;i<70;i++){const it=g.newItem(K[i%K.length],1+(i%3),i%5);S.items.push(it);}
 for(const k of ['weapon','armor','helm','boots','neck','ring']){const it=g.newItem(k,3,3);S.items.push(it);g.equipItem(it.u);}
 try{for(const c of g.COLL.slice(0,8))for(let j=0;j<3;j++)g.collRegister&&0;}catch(e){}
 S.sp=10;})()"""
WINS=[('가방','__g.openBag()'),('제작','__g.openCraft()'),('컬렉션','__g.openColl()'),('능력치','__g.openStats()'),('스킬','__g.openSkills()'),
      ('설정','__g.openSettings()'),('강화','__g.openEnchant()'),('신','__g.openGods()'),
      ('상점','__g.openShop("mira")'),('대장장이','__g.openForge("bram")'),('NPC','__g.openNpc("bram")')]
bad=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    for vw,vh in [(1280,720),(960,540)]:
        pg=b.new_page(viewport={'width':vw,'height':vh});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
        pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
        pg.evaluate(SETUP);pg.wait_for_timeout(100)
        print(vw,vh,'items',pg.evaluate("__g.S.items.length"),'무게',pg.evaluate("Math.round(__g.wPct()*100)"),'ver',pg.evaluate("document.getElementById('verTag').textContent"))
        for nm,js in WINS:
            pg.evaluate("__g.closeWin&&__g.closeWin()");pg.evaluate("(()=>{const m=document.getElementById('modal');if(m&&!m.hidden)document.querySelector('#dlgA .btn.alt')?.click();})()")
            try: pg.evaluate(js)
            except Exception as e: print('  열기 실패',nm,str(e)[:100]);continue
            pg.wait_for_timeout(150)
            # 창 탭이 있으면 탭마다
            tabs=pg.evaluate("[...document.querySelectorAll('#win:not([hidden]) .wtabs button, #win:not([hidden]) .tabs button')].length")
            hid=pg.evaluate(AUDIT+"('#win')")+pg.evaluate(AUDIT+"('#modal')")
            print('  ',vw,nm,'탭',tabs,'숨은 버튼',len(hid),hid[:8])
            if hid: bad.append((vw,nm,hid))
            if vw==1280: pg.screenshot(path=f'shots/v427_{nm}.png')
        # 제작: [제작하기]는 고정 줄(.cfact)에 있고 스크롤 영역(.cfpi) 밖 · 창 안에 보인다 · 누르면 제작된다
        pg.evaluate("__g.closeWin&&__g.closeWin()");pg.evaluate("__g.openCraft()");pg.wait_for_timeout(150)
        c=pg.evaluate("""(()=>{const go=document.querySelector('.cfact .cfgo'),pi=document.querySelector('.cfpi');const r=go.getBoundingClientRect(),wb=document.querySelector('#win .wbox').getBoundingClientRect();
          return {inScroll:pi.contains(go),bot:r.bottom,wbot:wb.bottom,dis:go.disabled,txt:go.textContent}})()""")
        print('  제작 버튼',c);assert c['txt']=='제작하기' and not c['inScroll'] and c['bot']<=min(vh,c['wbot'])
        n0=pg.evaluate("__g.S.gold")
        if not c['dis']:
            pg.click('.cfact .cfgo');pg.wait_for_timeout(100);n1=pg.evaluate("__g.S.gold");print('  제작 골드',n0,'->',n1);assert n1<n0,'제작하기를 눌러도 아무 일 없음'
        # 가방: 무게 줄 글자가 잘리지 않는다
        pg.evaluate("__g.closeWin&&__g.closeWin()");pg.evaluate("__g.openBag()");pg.wait_for_timeout(150)
        w=pg.evaluate("(()=>{const b=document.querySelector('.wbar b');return [b.scrollWidth,b.clientWidth,b.textContent]})()")
        print('  무게 줄',w);assert w[0]<=w[1]+1,'무게 글자 잘림'
        if vw==1280: pg.screenshot(path='shots/v427_가방.png')
        print('ERRORS',errs or 'none');assert not errs,errs
        pg.close()
    b.close()
print('BAD',bad)
assert not bad, bad
print('OK')
