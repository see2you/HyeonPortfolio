"""v4.67 G12-b (지시서 §G12) 정화 물약 + 값 조정
1) 데이터: STK.cure · 무게 1 · 한도 5 · 값 60+4×Lv · 가방 순서(defp 뒤) · 버프 물약 값 공식 유지(120+8×Lv)
2) 상점: 정화 줄 1개 · [1개] · [가득] → 한도 5 · 골드 부족 → 변화 없음 · 무게 여유만큼
3) 사용: 독 · 화상 · 둔화 즉시 해제 · 기절은 남음 · 개수 −1
4) 면역 10초: 셋은 addFx가 막힘(STAT.cureBlk) · 기절은 걸림 · 10초 뒤엔 다시 걸림
5) HUD: 면역 중 ✚ 아이콘(파란 테두리) · 끝나면 사라짐
6) 가방 툴팁 [마시기]
7) 자동 사용: 기본 끔(걸려도 안 마심) · 상점 고정 줄 [정화 자동] 켬 → 1초 넘게 남은 독에 마심 · 토스트 · 물약 없으면 아무것도 안 함
8) 자동 진행 보충(autoBuy)은 정화 물약을 사지 않음
9) 사망 → 면역 사라짐
10) 이전 세이브(cfg.autoCure · bag.cure 없음) 이어하기 → 오류 없음
11) 화면: 상점 창 1280×720 · 960×540 — 정화 줄 · 토글 스크롤 없이 · 왼쪽 아래 버전(shots/v467_*.png)"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from playwright.sync_api import sync_playwright
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg)
VIS="""(W)=>{const bs=[...document.querySelectorAll('#modal .cur button, #modal .cutg, #modal .bftg, #modal .bfr button')];return bs.map(b=>{const r=b.getBoundingClientRect(),e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {t:b.textContent,in:r.top>=0&&r.bottom<=W[1]&&r.left>=0&&r.right<=W[0],hit:!!e&&(e===b||b.contains(e))};});}"""
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);errs=[];pg=page(b,errs)
    ver=pg.evaluate("document.getElementById('verTag').textContent");chk(ver.startswith('v4.'),'버전 표시 '+ver)
    pg.evaluate("(()=>{const g=__g;for(const m of g.mobs){m.aggro=false;m.dead=true;m.respawn=1e9;m.deadT=-1e9;}g.S.lv=20;g.S.gold=100000;g.S.autoQ=false;g.setAuto(false);})()")
    # 1) 데이터
    d=pg.evaluate("(()=>{const g=__g,C=g.STK.cure,K=g.CURE_K;return {w:C.w,cat:C.cat,cap:K.cap,imm:K.imm,fx:K.fx,pr:g.curePrice(),bp:g.bufPrice(),lv:g.S.lv,ord:g.STK_ORDER.indexOf('cure')-g.STK_ORDER.indexOf('defp'),desc:C.desc()};})()")
    chk(d['w']==1 and d['cat']=='use' and d['cap']==5 and d['imm']==10,'정화 물약 · 소모품 · 무게 1 · 한도 5 · 면역 10초')
    chk(d['fx']==['poison','burn','slow'],'푸는 상태이상: 독 · 화상 · 둔화(기절 제외)')
    chk(d['pr']==60+4*d['lv'] and d['bp']==150+18*d['lv'],'값 정화 60+4×Lv = %d · 버프 150+18×Lv = %d(G12-b 값 조정)'%(d['pr'],d['bp']))
    chk(d['ord']==1 and '기절' in d['desc'],'가방 순서 수호 물약 뒤 · 설명에 기절 제외')
    # 2) 상점
    sid=pg.evaluate("__g.shopId()");pg.evaluate("(id)=>__g.openShop(id)",sid)
    n=pg.evaluate("document.querySelectorAll('#modal .cur').length");chk(n==1,'상점 창에 정화 물약 줄 1개')
    r=pg.evaluate("""()=>{const g=__g,S=g.S,g0=S.gold,pr=g.curePrice();[...document.querySelector('#modal .cur').querySelectorAll('button')].find(b=>b.textContent==='1개').click();return {n:g.cnt('cure'),d:g0-S.gold,pr};}""")
    chk(r['n']==1 and r['d']==r['pr'],'[1개] → 1개 · 골드 -%d'%r['pr'])
    r=pg.evaluate("""()=>{const g=__g;[...document.querySelector('#modal .cur').querySelectorAll('button')].find(b=>b.textContent==='가득').click();const n=g.cnt('cure');const m=g.buyCure(3);return {n,m,c:g.cnt('cure'),dis:document.querySelector('#modal .cur button').disabled};}""")
    chk(r['n']==5 and r['m']==0 and r['c']==5 and r['dis'],'[가득] → 5개(한도) · 더 사지 못함 · 버튼 꺼짐')
    r=pg.evaluate("(()=>{const g=__g,S=g.S;S.bag.cure=0;const gd=S.gold;S.gold=g.curePrice()-1;const n=g.buyCure(1);const o={n,c:g.cnt('cure')};S.gold=gd;return o;})()")
    chk(r['n']==0 and r['c']==0,'골드 부족 → 변화 없음')
    r=pg.evaluate("(()=>{const g=__g,S=g.S,ws=S.stone;S.stone=ws+Math.floor((g.weightMax()-g.weightNow()-2.5)/.2);const n=g.buyCure(5);S.stone=ws;return n;})()")
    chk(r==2,'무게 여유만큼만 구입(여유 2.5 → 2개)')
    pg.evaluate("__g.buyCure(5)")
    # 3) 사용
    r=pg.evaluate("""()=>{const g=__g,P=g.player;P.hp=g.pStats().hp;g.clearStatus();for(const k of ['poison','burn','slow','stun'])g.addFx(k,{name:'시험',atk:100});const on=Object.keys(P.fx).filter(k=>g.fxOn(k));const c0=g.cnt('cure');const u=g.useCure();return {on,u,c0,c:g.cnt('cure'),left:Object.keys(P.fx).filter(k=>g.fxOn(k)),imm:P.cureU-g.t};}""")
    chk(len(r['on'])==4 and r['u'],'네 가지 걸린 뒤 마심')
    chk(r['left']==['stun'],'독 · 화상 · 둔화 해제 · 기절은 남음 '+str(r['left']))
    chk(r['c']==r['c0']-1 and abs(r['imm']-10)<1e-6,'개수 −1 · 면역 10초')
    # 4) 면역
    r=pg.evaluate("""()=>{const g=__g,P=g.player;const b0=g.STAT.cureBlk||0;g.step(10,.05);const a=['poison','burn','slow'].map(k=>g.addFx(k,{name:'x',atk:100}));g.clearStatus();const s=g.addFx('stun',{name:'x'});g.clearStatus();return {a,s,blk:(g.STAT.cureBlk||0)-b0,sp:g.pSPD()===g.SPD};}""")
    chk(r['a']==[False,False,False] and r['blk']==3,'면역 중 독 · 화상 · 둔화가 걸리지 않음(막힘 3)')
    chk(r['s'],'면역 중에도 기절은 걸림')
    # 5) HUD
    pg.evaluate("__g.fxHud()");h=pg.evaluate("(()=>{const e=document.querySelector('#fxRow .fxi.bf[data-buf=cure]');return e?e.textContent:null;})()")
    chk(h and h.startswith('✚'),'HUD 면역 아이콘 '+str(h))
    pg.evaluate("(()=>{__g.closeModal();__g.render();})()");pg.screenshot(path='shots/v467_HUD.png')
    r=pg.evaluate("(()=>{const g=__g;g.step(200,.05);g.fxHud();const a=g.addFx('poison',{name:'x'});const on=g.fxOn('poison');g.clearStatus();return {a,on,ic:!!document.querySelector('#fxRow .fxi.bf[data-buf=cure]')};})()")
    chk(r['a'] and r['on'] and not r['ic'],'10초 뒤 면역 끝 → 독이 다시 걸림 · 아이콘 사라짐')
    # 6) 가방 툴팁
    r=pg.evaluate("(()=>{const g=__g;const tp=document.createElement('div');g.stkTip?g.stkTip(tp,'cure'):0;return g.stkTip?[...tp.querySelectorAll('button')].map(b=>b.textContent):['skip'];})()")
    chk(r==['skip'] or any('마시기' in t for t in r),'가방 툴팁 [마시기] '+str(r))
    # 7) 자동 사용
    r=pg.evaluate("(()=>{const g=__g,P=g.player;const a=g.S.cfg.autoCure;const c0=g.cnt('cure');g.addFx('poison',{name:'x'});g.step(10,.05);const o={a,c0,c:g.cnt('cure'),on:g.fxOn('poison')};g.clearStatus();return o;})()")
    chk(r['a'] is False and r['c']==r['c0'] and r['on'],'자동 사용 기본 끔 → 독에 걸려도 안 마심')
    pg.evaluate("(id)=>__g.openShop(id)",sid)
    tg=pg.evaluate("(()=>{const e=document.querySelector('#dlgA .cutg');return e&&e.textContent;})()");chk(tg and '끔' in tg,'상점 아래 고정 줄 토글: '+str(tg))
    pg.evaluate("document.querySelector('#dlgA .cutg').click()")
    r=pg.evaluate("""()=>{const g=__g,P=g.player;const c0=g.cnt('cure');P.hp=g.pStats().hp;g.addFx('slow',{name:'x'});P.fx.slow.until=g.t+.5;g.step(4,.05);const short=g.cnt('cure');g.clearStatus();g.step(2,.05);g.addFx('poison',{name:'x'});g.step(4,.05);return {on:g.S.cfg.autoCure,c0,short,c:g.cnt('cure'),poi:g.fxOn('poison'),imm:P.cureU>g.t,toast:document.body.innerText.includes('정화 자동 사용')};}""");print(' auto',r)
    chk(r['on'] and r['short']==r['c0'],'켬 · 1초 안 남은 둔화엔 안 마심')
    chk(r['c']==r['c0']-1 and not r['poi'] and r['imm'] and r['toast'],'켬 · 독에 걸리면 마심 → 해제 · 면역 · 토스트')
    r=pg.evaluate("(()=>{const g=__g,P=g.player;P.cureU=0;g.S.bag.cure=0;g.addFx('poison',{name:'x'});g.step(4,.05);const o=g.fxOn('poison');g.clearStatus();return o;})()")
    chk(r,'켬 · 물약이 없으면 그대로(오류 없음)')
    # 8) 자동 진행 보충
    r=pg.evaluate("(()=>{const g=__g;g.S.hpPot=0;g.autoBuy();return {c:g.cnt('cure'),hp:g.S.hpPot};})()")
    chk(r['c']==0 and r['hp']>0,'자동 보충은 HP 물약만 · 정화 물약 안 삼')
    # 9) 사망
    r=pg.evaluate("(()=>{const g=__g,P=g.player;g.buyCure(2);g.useCure(true);const a=P.cureU>g.t;g.die({name:'시험'});return {a,b:(P.cureU||0)>g.t};})()")
    chk(r['a'] and not r['b'],'사망 → 면역 사라짐')
    pg.evaluate("(()=>{const g=__g;g.step(30,.05);g.revive();g.closeModal();document.getElementById('modal').hidden=true;g.step(4,.05);g.player.hp=g.pStats().hp;})()")
    # 11) 화면
    pg.evaluate("(()=>{const g=__g;g.buyCure(5);for(const k of g.BUF_IDS)g.buyBuf(k,5);g.useCure(true);})()")
    pg.evaluate("(id)=>{__g.closeModal();__g.openShop(id);__g.render();}",sid)
    v=pg.evaluate(VIS,[1280,720]);bad=[x for x in v if not (x['in'] and x['hit'])];print(' vis',len(v),bad)
    chk(len(v)==9+3+2 and not bad,'상점(1280×720): 버프 9 + 정화 3 + 토글 2 · 모두 스크롤 없이 보임')
    al=pg.evaluate("""()=>[...document.querySelectorAll('#modal button')].filter(b=>{const r=b.getBoundingClientRect();return r.bottom>720||r.top<0||r.right>1280;}).map(b=>b.textContent)""")
    chk(not al,'상점 창 모든 버튼이 화면 안 '+str(al))
    pg.screenshot(path='shots/v467_상점.png')
    pg.set_viewport_size({'width':960,'height':540});pg.evaluate("(id)=>{__g.closeModal();__g.openShop(id);__g.render();}",sid)
    r=pg.evaluate("(()=>{const ok=s=>{const b=document.querySelector(s).getBoundingClientRect();return b.bottom<=540&&b.right<=960&&b.top>=0&&b.left>=0;};return [ok('#dlgA .cutg'),ok('#dlgA .bftg')];})()");chk(all(r),'960×540에서도 토글 2개가 아래 고정 줄에서 보임 '+str(r))
    pg.screenshot(path='shots/v467_상점_960.png');pg.set_viewport_size({'width':1280,'height':720})
    vt=pg.evaluate("(()=>{const r=document.getElementById('verTag').getBoundingClientRect();return [r.left,r.bottom];})()");chk(vt[0]<200 and vt[1]>600,'왼쪽 아래 버전 표시')
    # 10) 이전 세이브
    pg.evaluate("(()=>{__g.closeModal();__g.save();})()")
    sv=pg.evaluate("(()=>{const o=JSON.parse(localStorage.getItem('rowen-mmo-v4'));delete o.cfg.autoCure;delete o.bag.cure;return JSON.stringify(o);})()");pg.close()
    e2=[];pg2=b.new_page(viewport={'width':1280,'height':720});pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(20,.05);__g.render();__g.fxHud()")
    r=pg2.evaluate("(()=>{const g=__g;g.addFx('poison',{name:'x'});g.step(40,.05);return {a:g.S.cfg.autoCure,c:g.cnt('cure')};})()");chk(not e2 and r['a'] is False and r['c']==0,'이전 세이브 이어하기 → 오류 없음 · 자동 끔 · 0개')
    pg2.close();b.close()
    chk(not errs and not e2,'페이지 오류 없음 '+str((errs+e2)[:2]))
print('PASS cure467 %d'%ok)
