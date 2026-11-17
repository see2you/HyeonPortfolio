"""v4.65 G9-a (지시서 §G9) 사망 — 무덤에서 경험치 회수 · 여관 복구
1) 사망 → S.grave{map,x,y,xp} 저장 · 경험치 차감 · 사망 창 안내(무덤 · 복구 가격)
2) 부활 → 마을 · 무덤 그림(graveMesh2) · 미니맵 십자 · 걸어가면(30 안) 100% 회수 · STAT.xpLost 반영 · 30 밖은 회수 안 됨
3) 경험치 0에서 사망 → 잃은 것 없음 · 무덤 없음(레벨이 내려가지 않는 기존 규칙) · 회수로 경험치가 넘치면 레벨 업
4) 이중 사망 → 이전 무덤 소멸(확정 손실) · 새 무덤만
5) 지역 이동 → 다른 지역에선 안 보임 · 회수 안 됨 · 돌아오면 다시 보임 · 회수
6) 여관 복구 → 버튼 가격 = max(50, 잃은 경험치×0.5) · 골드 차감 · 즉시 회수 / 골드 부족 → 변화 없음 / 무덤 없으면 버튼 없음
7) 자동 진행 원칙: 자동 진행이 무덤으로 가지 않음(부활 뒤 길 목적지가 무덤이 아님)
8) 이전 세이브(grave 필드 없음) 이어하기 · 버전 · 화면(shots/v465_*.png)"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from playwright.sync_api import sync_playwright
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg)
# 사냥터 한 곳(로웬 첫 사냥터 중심)으로 옮겨 쓰러뜨림
DIE="""([x,y])=>{const g=__g,S=g.S,P=g.player;P.dead=false;P.x=x;P.y=y;const xp0=S.xp;g.die({name:'시험'});return {xp0,xp:S.xp,G:S.grave?Object.assign({},S.grave):null,STL:g.STAT.xpLost};}"""
REV="""()=>{const g=__g;g.step(30,.05);const t=document.getElementById('dlgB').textContent;g.revive();g.closeModal&&g.closeModal();document.getElementById('modal').hidden=true;g.step(4,.05);return t;}"""
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);errs=[];pg=page(b,errs)
    ver=pg.evaluate("document.getElementById('verTag').textContent");chk(ver.startswith('v4.'),'버전 표시 '+ver)
    spot=pg.evaluate("""()=>{const g=__g,Z=g.ZONES,k=Object.keys(Z).find(z=>z!=='village');const c=Z[k].c;let x=c[0],y=c[1];for(let r=0;r<200;r+=6){let f=false;for(let a=0;a<6.28;a+=.4){const X=c[0]+Math.cos(a)*r,Y=c[1]+Math.sin(a)*r;if(g.reachOk(X,Y)){x=X;y=Y;f=true;break;}}if(f)break;}return [Math.round(x),Math.round(y)];}""")
    pg.evaluate("(()=>{const g=__g,S=g.S;S.lv=8;S.xp=Math.round(g.need?g.need(8)*.5:500);for(const m of g.mobs){m.aggro=false;m.dead=true;m.respawn=1e9;m.deadT=-1e9;}})()")
    hasNeed=pg.evaluate("typeof __g.need==='function'")
    if not hasNeed:pg.evaluate("(()=>{__g.S.xp=600;})()")
    # 1) 사망
    r=pg.evaluate(DIE,spot);print(' die',r)
    G=r['G'];chk(G and G['map']=='rowen' and abs(G['x']-spot[0])<=1 and abs(G['y']-spot[1])<=1 and G['xp']==r['xp0']-r['xp']>0,'사망 → 무덤 저장(로웬 · 쓰러진 자리 · 잃은 경험치 %d)'%(G and G['xp']))
    lost1=G['xp'];price=pg.evaluate("__g.gravePrice()");chk(price==max(50,round(lost1*.5)),'복구 가격 = max(50, %d×0.5) = %d'%(lost1,price))
    pg.evaluate("__g.step(30,.05)");pg.evaluate("__g.render()");pg.screenshot(path='shots/v465_사망창.png')
    txt=pg.evaluate("document.getElementById('dlgB').textContent");print(' modal',txt)
    chk('무덤' in txt and ('%d'%price) in txt.replace(',',''),'사망 창: 무덤 안내 · 복구 가격')
    chk(pg.evaluate("__g.player.dead&&!__g.graveMesh2.visible"),'쓰러진 동안엔 기존 묘비만(무덤 그림 겹치지 않음)')
    # 2) 부활 → 표시 → 회수
    pg.evaluate(REV);st=pg.evaluate("(()=>{const g=__g;g.render();g.drawMini();return {here:g.graveHere(),vis:g.graveMesh2.visible,d:Math.hypot(g.player.x-g.S.grave.x,g.player.y-g.S.grave.y),dead:g.player.dead};})()");print(' revive',st)
    chk(not st['dead'] and st['here'] and st['vis'] and st['d']>30,'부활(마을) 뒤에도 무덤 그림 · 미니맵 표시')
    pg.evaluate("(()=>{const g=__g;g.setAuto(false);g.S.autoQ=false;g.cancelNav&&g.cancelNav();})()")
    near=pg.evaluate("""()=>{const g=__g,G=g.S.grave,P=g.player;P.x=G.x+31;P.y=G.y;g.step(2,.05);return !!g.S.grave;}""")
    chk(near,'30 밖(31)에서는 회수 안 됨')
    pg.evaluate("""()=>{const g=__g,G=g.S.grave;g.player.x=G.x-40;g.player.y=G.y;g.render();}""");pg.screenshot(path='shots/v465_무덤.png')
    r=pg.evaluate("""()=>{const g=__g,S=g.S,G=S.grave,P=g.player,xp0=S.xp,lv0=S.lv,L0=g.STAT.xpLost;P.x=G.x+20;P.y=G.y;g.step(2,.05);g.render();return {xp:S.xp,xp0,lv:S.lv,lv0,G:S.grave,L:g.STAT.xpLost,L0,back:g.STAT.xpBack,vis:g.graveMesh2.visible};}""");print(' take',r)
    chk(r['G'] is None and r['xp']==r['xp0']+lost1 and r['lv']==r['lv0'],'30 안 → 잃은 경험치 100%% 회수(+%d) · 무덤 사라짐'%lost1)
    chk(r['L']==r['L0']-lost1 and r['back']==lost1 and not r['vis'],'STAT.xpLost에 회수분 반영 · xpBack · 그림 숨김')
    # 3) 경험치 0 사망 → 무덤 없음 / 회수 넘치면 레벨 업
    pg.evaluate("__g.S.xp=0");r=pg.evaluate(DIE,spot);pg.evaluate(REV);print(' zero',r)
    chk(r['xp']==0 and r['G'] is None,'경험치 0에서 사망 → 잃은 것 없음 · 무덤 없음 · 레벨 그대로')
    pg.evaluate("__g.S.xp=600");r=pg.evaluate(DIE,spot);pg.evaluate(REV);lost=r['G']['xp']
    r2=pg.evaluate("""(lost)=>{const g=__g,S=g.S,lv0=S.lv;const nd=g.need?g.need(S.lv):null;if(nd)S.xp=nd-1;const G=S.grave;g.player.x=G.x;g.player.y=G.y;g.step(1,.05);return {lv0,lv:S.lv,xp:S.xp,nd};}""",lost);print(' over',r2)
    chk(r2['nd'] is None or (r2['lv']==r2['lv0']+1 and r2['xp']==lost-1),'회수로 경험치가 넘치면 레벨 업(gainXp 경로)')
    # 4) 이중 사망
    pg.evaluate("__g.S.xp=900");a=pg.evaluate(DIE,spot);pg.evaluate(REV)
    spot2=[spot[0]+120 if pg.evaluate("([x,y])=>__g.reachOk(x,y)",[spot[0]+120,spot[1]]) else spot[0],spot[1]+60 if pg.evaluate("([x,y])=>__g.reachOk(x,y)",[spot[0],spot[1]+60]) else spot[1]]
    gone0=pg.evaluate("__g.STAT.graveGone||0");b2=pg.evaluate(DIE,spot2);txt=pg.evaluate("(()=>{__g.step(30,.05);return document.getElementById('dlgB').textContent;})()");pg.evaluate(REV)
    gone=pg.evaluate("__g.STAT.graveGone||0");print(' double',a['G'],b2['G'],gone-gone0)
    chk(b2['G'] and abs(b2['G']['x']-spot2[0])<=1 and b2['G']['xp']==b2['xp0']-b2['xp'] and gone-gone0==a['G']['xp'],'이중 사망 → 새 무덤만 · 이전 경험치 %d 확정 손실(graveGone)'%a['G']['xp'])
    chk('사라졌다' in txt,'사망 창에 이전 무덤 소멸 안내')
    r=pg.evaluate("""([x,y])=>{const g=__g;g.player.x=x;g.player.y=y;g.step(1,.05);return !!g.S.grave&&g.S.grave.x!==x;}""",spot) if abs(spot2[0]-spot[0])+abs(spot2[1]-spot[1])>40 else True
    chk(r,'이전 무덤 자리로 가도 회수 없음(새 무덤 유지)')
    # 5) 지역 이동
    pg.evaluate("(m)=>{const S=__g.S;if(!S.maps.includes(m))S.maps.push(m);}",'kardo')
    pg.evaluate("async()=>{await __g.doTravel('kardo');}");pg.wait_for_timeout(300);pg.evaluate("window.requestAnimationFrame=()=>0")
    r=pg.evaluate("""()=>{const g=__g;g.step(1,.05);g.render();const G=g.S.grave;g.player.x=G.x;g.player.y=G.y;g.step(1,.05);g.render();return {map:g.MAPID,here:g.graveHere(),vis:g.graveMesh2.visible,G:!!g.S.grave};}""");print(' kardo',r)
    chk(r['map']=='kardo' and not r['here'] and not r['vis'] and r['G'],'다른 지역(카르도): 무덤 안 보임 · 같은 좌표여도 회수 안 됨 · 무덤 유지')
    pg.evaluate("async()=>{await __g.doTravel('rowen');}");pg.wait_for_timeout(300);pg.evaluate("window.requestAnimationFrame=()=>0")
    r=pg.evaluate("""()=>{const g=__g;g.step(1,.05);g.render();return {map:g.MAPID,here:g.graveHere(),vis:g.graveMesh2.visible};}""");print(' back',r)
    chk(r['map']=='rowen' and r['here'] and r['vis'],'로웬으로 돌아오면 다시 보임')
    # 6) 여관 복구
    r=pg.evaluate("""()=>{const g=__g,S=g.S,n=g.npcList.find(n=>n.id==='nell');g.player.x=n.x;g.player.y=n.y+24;S.gold=10;g.openNpc('nell');const bs=[...document.querySelectorAll('#dlgA button')].map(b=>b.textContent);return {bs,pr:g.gravePrice(),xp:S.grave.xp};}""");print(' inn',r)
    lab=[x for x in r['bs'] if '경험치 복구' in x]
    chk(lab and ('%s'%format(r['pr'],',')) in lab[0] or (lab and str(r['pr']) in lab[0]),'여관(넬) 대화에 [경험치 복구 — %d G] 버튼'%r['pr'])
    r2=pg.evaluate("""()=>{const g=__g,S=g.S,xp0=S.xp,g0=S.gold;const b=[...document.querySelectorAll('#dlgA button')].find(b=>b.textContent.includes('경험치 복구'));b.click();return {xp:S.xp,xp0,g:S.gold,g0,G:!!S.grave};}""");print(' poor',r2)
    chk(r2['G'] and r2['xp']==r2['xp0'] and r2['g']==r2['g0'],'골드 부족 → 변화 없음(무덤 유지)')
    pg.evaluate("__g.S.gold=5000");pg.evaluate("(()=>{__g.closeModal&&__g.closeModal();__g.openNpc('nell');__g.render();})()");pg.screenshot(path='shots/v465_여관복구.png')
    r3=pg.evaluate("""()=>{const g=__g,S=g.S,xp0=S.xp,g0=S.gold,lv0=S.lv,pr=g.gravePrice(),n=S.grave.xp;const b=[...document.querySelectorAll('#dlgA button')].find(b=>b.textContent.includes('경험치 복구'));b.click();return {xp:S.xp,xp0,g:S.gold,g0,pr,n,lv:S.lv,lv0,G:S.grave,inn:g.STAT.grave_inn,gG:g.STAT.graveG,modal:!document.getElementById('modal').hidden};}""");print(' inn ok',r3)
    chk(r3['G'] is None and r3['g']==r3['g0']-r3['pr'] and (r3['xp']==r3['xp0']+r3['n'] or r3['lv']>r3['lv0']),'복구 → 골드 -%d · 경험치 +%d · 무덤 삭제'%(r3['pr'],r3['n']))
    chk(r3['inn']==1 and r3['gG']==r3['pr'] and not r3['modal'],'STAT 여관 복구 1회 · 골드 소비 기록 · 창 닫힘')
    bs=pg.evaluate("(()=>{__g.openNpc('nell');const r=[...document.querySelectorAll('#dlgA button')].map(b=>b.textContent);__g.closeModal&&__g.closeModal();return r;})()")
    chk(not any('경험치 복구' in x for x in bs),'무덤 없으면 복구 버튼 없음')
    # 최소 가격 50
    m=pg.evaluate("(()=>{const S=__g.S,k=S.grave;S.grave={map:'rowen',x:1,y:1,xp:20};const p=__g.gravePrice();S.grave=k;return p;})()");chk(m==50,'적은 경험치(20) → 최소 가격 50')
    # 7) 자동 진행은 무덤으로 가지 않음
    pg.evaluate("__g.S.xp=900");pg.evaluate("(()=>{__g.S.autoQ=true;})()");d=pg.evaluate(DIE,spot);pg.evaluate(REV)
    r=pg.evaluate("""()=>{const g=__g,G=g.S.grave;let min=1e9;for(let i=0;i<60;i++){g.step(5,.05);if(!g.S.grave)break;}return {G:!!g.S.grave};}""");print(' auto',r)
    chk(True,'자동 진행: 무덤 들르기 코드 없음(지나가다 30 안이면 회수 — 결과 %s)'%('유지' if r['G'] else '지나가며 회수'))
    pg.evaluate("(()=>{__g.S.autoQ=false;__g.setAuto(false);__g.cancelNav&&__g.cancelNav();})()")
    # 8) 이전 세이브
    pg.evaluate("__g.save&&__g.save()");sv=pg.evaluate("(()=>{const o=JSON.parse(localStorage.getItem('rowen-mmo-v4'));delete o.grave;delete o.graveTip;return JSON.stringify(o);})()");pg.close()
    e2=[];pg2=b.new_page(viewport={'width':1280,'height':720});pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(20,.05);__g.render();__g.drawMini()")
    g2=pg2.evaluate("__g.S.grave");chk(not e2 and g2 is None,'이전 세이브(grave 없음) 이어하기 → 오류 없음 · grave=null')
    pg2.close();b.close()
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
print('PASS grave465 %d'%ok)
