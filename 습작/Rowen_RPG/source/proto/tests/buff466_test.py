"""v4.66 G12-a (지시서 §G12) 버프 물약 3종 — 가속 · 힘 · 수호
1) 데이터: STK 3종 · 무게 2 · 한도 5 · 값 120+8×Lv · 가방 순서(STK_ORDER)
2) 상점: 물약 상인 창에 3줄 · [1개] · [가득] 구입 → 개수 · 골드 · 한도 5 넘지 않음 · 골드 부족 → 변화 없음 · 무게 한도
3) 사용: 힘 공격 ×1.08 · 가속 이동 ×1.15 · 공속 +0.10 · 수호 받는 피해 ×0.92
4) 다시 마시기: 시간만 300초로 갱신 · 효과 겹치지 않음 · 개수 −1
5) 만료: 남은 시간 0 → 효과 사라짐 · 토스트
6) 전투력(cpOf) · 관문 판정에 넣지 않음
7) 사망 → 버프 사라짐(기본값)
8) 세이브에 남은 시간 → 이어하기 뒤에도 남음
9) HUD 아이콘(파란 테두리 .fxi.bf) — 켜진 버프 수만큼
10) 자동 사용 토글: 기본 끔(끔이면 전투 중에도 안 마심) · 상점 버튼으로 켬 → 전투 시작 시 꺼진 버프만 마심 · 전투 밖이면 안 마심
11) 자동 진행 보충(autoBuy)은 버프 물약을 사지 않음
12) 이전 세이브(buf · cfg.autoBuf 없음) 이어하기 → 오류 없음
13) 화면: 상점 창 1280×720 · 960×540 · 모든 구입 · 마시기 버튼이 스크롤 없이 보임 · HUD 아이콘 · 왼쪽 아래 버전(shots/v466_*.png)"""
import os,sys
sys.path.insert(0,os.path.dirname(__file__))
from rng_probe452 import page,ARGS,HTML
from playwright.sync_api import sync_playwright
os.makedirs('shots',exist_ok=True)
ok=0
def chk(c,msg):
    global ok
    assert c,msg;ok+=1;print('  ok',msg)
VIS="""()=>{const bs=[...document.querySelectorAll('#modal .bfr button, #modal .bftg')];return bs.map(b=>{const r=b.getBoundingClientRect(),e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {t:b.textContent,in:r.top>=0&&r.bottom<=720&&r.left>=0&&r.right<=1280,hit:!!e&&(e===b||b.contains(e))};});}"""
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS);errs=[];pg=page(b,errs)
    ver=pg.evaluate("document.getElementById('verTag').textContent");chk(ver.startswith('v4.'),'버전 표시 '+ver)
    pg.evaluate("(()=>{const g=__g;for(const m of g.mobs){m.aggro=false;m.dead=true;m.respawn=1e9;m.deadT=-1e9;}g.S.lv=20;g.S.gold=100000;g.S.autoQ=false;g.setAuto(false);})()")
    # 1) 데이터
    d=pg.evaluate("(()=>{const g=__g,K=g.BUF_IDS;return {K,w:K.map(k=>g.STK[k].w),use:K.map(k=>g.STK[k].cat),cap:g.BUF_K.cap,dur:g.BUF_K.dur,pr:g.bufPrice(),lv:g.S.lv};})()")
    chk(d['K']==['spdp','atkp','defp'] and d['w']==[2,2,2] and d['use']==['use']*3,'3종 · 무게 2 · 소모품')
    chk(d['cap']==5 and d['dur']==300 and d['pr']==120+8*d['lv'],'한도 5 · 5분 · 값 120+8×Lv = %d'%d['pr'])
    # 2) 상점
    sid=pg.evaluate("__g.shopId()");chk(bool(sid),'물약 상인 '+str(sid))
    pg.evaluate("(id)=>__g.openShop(id)",sid)
    rows=pg.evaluate("[...document.querySelectorAll('#modal .bfr')].map(r=>r.dataset.buf)");chk(rows==['spdp','atkp','defp'],'상점 창에 버프 물약 3줄')
    r=pg.evaluate("""()=>{const g=__g,S=g.S,g0=S.gold,pr=g.bufPrice();const b=[...document.querySelector('#modal .bfr[data-buf=atkp]').querySelectorAll('button')].find(b=>b.textContent==='1개');b.click();return {n:g.cnt('atkp'),d:g0-S.gold,pr};}""")
    chk(r['n']==1 and r['d']==r['pr'],'[1개] → 1개 · 골드 -%d'%r['pr'])
    r=pg.evaluate("""()=>{const g=__g,S=g.S;for(const k of g.BUF_IDS){const b=[...document.querySelector('#modal .bfr[data-buf='+k+']').querySelectorAll('button')].find(b=>b.textContent==='가득');b.click();}return g.BUF_IDS.map(k=>g.cnt(k));}""")
    chk(r==[5,5,5],'[가득] → 각 5개(한도)')
    r=pg.evaluate("(()=>{const g=__g,g0=g.S.gold;const n=g.buyBuf('atkp',3);return {n,c:g.cnt('atkp'),d:g0-g.S.gold,dis:document.querySelector('#modal .bfr[data-buf=atkp] button').disabled};})()")
    chk(r['n']==0 and r['c']==5 and r['d']==0 and r['dis'],'한도에서 더 사지 못함 · 버튼 꺼짐')
    r=pg.evaluate("(()=>{const g=__g,S=g.S;g.setCnt?0:0;S.bag.spdp=0;const gd=S.gold;S.gold=g.bufPrice()-1;const n=g.buyBuf('spdp',1);const o={n,c:g.cnt('spdp'),g:S.gold};S.gold=gd;return o;})()")
    chk(r['n']==0 and r['c']==0,'골드 부족 → 변화 없음')
    r=pg.evaluate("(()=>{const g=__g,S=g.S,wm=g.weightMax,ws=S.stone;S.stone=Math.floor((g.weightMax()-g.weightNow()-3)/.2);const n=g.buyBuf('spdp',5);const o={n,free:g.weightMax()-g.weightNow()};S.stone=ws;return o;})()")
    chk(r['n']==1,'무게 여유만큼만 구입(여유 3 → 1개)')
    pg.evaluate("(()=>{const g=__g;g.buyBuf('spdp',5);})()")
    # 3) 사용
    base=pg.evaluate("(()=>{const g=__g,P=g.player,st=g.pStats();return {atk:st.atk,as:st.aspd,sp:g.pSPD(),cp:g.cpOf()};})()")
    def hurt():
        return pg.evaluate("(()=>{const g=__g,P=g.player;P.hp=99999;P.shield=0;P.dash=null;P.guardT=-1;const h=P.hp;g.hurtPlayer(1000,null);return h-P.hp;})()")
    h0=hurt()
    pg.evaluate("(()=>{const g=__g;for(const k of g.BUF_IDS)g.useBuf(k);})()")
    on=pg.evaluate("(()=>{const g=__g,st=g.pStats();return {atk:st.atk,as:st.aspd,sp:g.pSPD(),cp:g.cpOf(),buf:Object.assign({},g.S.buf),c:g.BUF_IDS.map(k=>g.cnt(k)),atk0:g.pStats(null,true).atk};})()");print(' on',base,on)
    h1=hurt()
    chk(abs(on['atk']-round(base['atk']*1.08))<=1,'힘의 물약: 공격 %d → %d (×1.08)'%(base['atk'],on['atk']))
    chk(abs(on['as']-base['as']-0.10)<1e-9 and abs(on['sp']/base['sp']-1.15)<1e-9,'가속 물약: 공속 +0.10 · 이동 ×1.15')
    chk(abs(h1/h0-0.92)<1e-6,'수호 물약: 받는 피해 %.0f → %.0f (×0.92)'%(h0,h1))
    chk(all(abs(v-300)<1e-6 for v in on['buf'].values()) and len(on['buf'])==3 and on['c']==[4,4,4],'마시면 300초 · 개수 −1')
    # 6) 전투력 미포함
    chk(on['cp']==base['cp'] and on['atk0']==base['atk'],'전투력(cpOf) · noBuff 능력치는 그대로 %d'%on['cp'])
    gs=pg.evaluate("(()=>{const g=__g;try{return JSON.stringify(g.gateState(g.curQ()))}catch(e){return 'x'}})()")
    # 9) HUD
    pg.evaluate("(()=>{__g.step(3,.05);__g.fxHud();})()")
    n=pg.evaluate("document.querySelectorAll('#fxRow .fxi.bf').length");chk(n==3,'HUD에 버프 아이콘 3개(파란 테두리)')
    lab=pg.evaluate("document.querySelector('#fxRow .fxi.bf b').textContent");chk(lab.endswith('분'),'남은 시간 분 단위 표시 '+lab)
    pg.evaluate("(()=>{const g=__g;g.closeModal();document.getElementById('modal').hidden=true;g.render();})()");pg.screenshot(path='shots/v466_HUD.png')
    # 4) 갱신
    pg.evaluate("(()=>{__g.step(200,.05);})()")
    r=pg.evaluate("(()=>{const g=__g,a=g.S.buf.atkp;g.useBuf('atkp');return {a,b:g.S.buf.atkp,atk:g.pStats().atk,c:g.cnt('atkp')};})()")
    chk(r['a']<300-9 and abs(r['b']-300)<1e-6 and r['atk']==on['atk'] and r['c']==3,'다시 마시기 → 시간만 300초로(%.0f→300) · 공격 겹치지 않음 · 개수 −1'%r['a'])
    # 5) 만료
    r=pg.evaluate("(()=>{const g=__g;g.S.buf.atkp=.5;g.step(20,.05);g.fxHud();return {on:g.bufOn('atkp'),k:'atkp' in g.S.buf,atk:g.pStats().atk,n:document.querySelectorAll('#fxRow .fxi.bf').length,toast:document.body.innerText.includes('힘의 물약 효과가 끝났다')};})()")
    chk(not r['on'] and not r['k'] and r['atk']==base['atk'] and r['n']==2,'만료 → 효과 · 아이콘 사라짐')
    chk(r['toast'],'만료 토스트')
    # 8) 세이브
    pg.evaluate("(()=>{__g.S.buf.defp=123.4;__g.save();})()")
    sv=pg.evaluate("JSON.parse(localStorage.getItem('rowen-mmo-v4')).buf")
    chk(abs(sv['defp']-123.4)<1e-6 and 'spdp' in sv,'세이브에 남은 시간 저장 '+str({k:round(v) for k,v in sv.items()}))
    # 7) 사망
    r=pg.evaluate("(()=>{const g=__g;g.die({name:'시험'});return Object.keys(g.S.buf).length;})()")
    chk(r==0,'사망 → 버프 사라짐')
    pg.evaluate("(()=>{const g=__g;g.step(30,.05);g.revive();g.closeModal();document.getElementById('modal').hidden=true;g.step(4,.05);})()")
    # 10) 자동 사용
    r=pg.evaluate("(()=>{const g=__g;const a=g.S.cfg.autoBuf;g.player.lastHit=g.t;g.step(2,.05);return {a,n:Object.keys(g.S.buf).length};})()")
    chk(r['a'] is False and r['n']==0,'자동 사용 기본 끔 → 전투 중에도 안 마심')
    pg.evaluate("(id)=>__g.openShop(id)",sid)
    tg=pg.evaluate("document.querySelector('#modal .bftg').textContent");chk('끔' in tg and pg.evaluate("!!document.querySelector('#dlgA .bftg')"),'상점 아래 고정 버튼 줄 토글: '+tg)
    pg.evaluate("document.querySelector('#modal .bftg').click()")
    r=pg.evaluate("(()=>{const g=__g;g.player.lastHit=-99;g.player.lastAtk=-99;g.step(5,.05);const out=Object.keys(g.S.buf).length;const c0=g.BUF_IDS.map(k=>g.cnt(k));g.S.buf.spdp=100;g.player.lastHit=g.t;g.step(2,.05);return {on:g.S.cfg.autoBuf,out,buf:Object.assign({},g.S.buf),c0,c:g.BUF_IDS.map(k=>g.cnt(k)),toast:document.body.innerText.includes('버프 자동 사용')};})()");print(' auto',r)
    chk(r['on'] and r['out']==0,'켬 · 전투 밖에서는 안 마심')
    chk(abs(r['buf']['spdp']-100)<1 and r['buf'].get('atkp',0)>299 and r['buf'].get('defp',0)>299 and r['c'][0]==r['c0'][0] and r['c'][1]==r['c0'][1]-1 and r['c'][2]==r['c0'][2]-1,'전투 시작 → 꺼진 버프만 마심(가속은 켜져 있어 그대로)')
    chk(r['toast'],'자동 사용 토스트')
    r=pg.evaluate("(()=>{const g=__g;g.player.lastAtk=-99;g.player.hp=1;g.player.lastHit=-99;return 0;})()")
    # 11) 자동 진행 보충
    r=pg.evaluate("(()=>{const g=__g,c0=g.BUF_IDS.map(k=>g.cnt(k));g.S.hpPot=0;g.autoBuy();return {c0,c:g.BUF_IDS.map(k=>g.cnt(k)),hp:g.S.hpPot};})()")
    chk(r['c']==r['c0'] and r['hp']>0,'자동 보충은 HP 물약만 · 버프 물약 그대로')
    # 13) 화면
    pg.evaluate("(()=>{const g=__g;g.player.hp=g.pStats().hp;g.closeModal();})()");pg.evaluate("(id)=>{__g.openShop(id);__g.render();}",sid)
    v=pg.evaluate(VIS);bad=[x for x in v if not (x['in'] and x['hit'])];print(' vis',len(v),bad)
    chk(len(v)==10 and not bad,'상점: 버프 줄 버튼 9 + 토글 1 · 모두 스크롤 없이 보임')
    al=pg.evaluate("""()=>{const bs=[...document.querySelectorAll('#modal button')];return bs.filter(b=>{const r=b.getBoundingClientRect();return r.bottom>720||r.top<0;}).map(b=>b.textContent);}""")
    chk(not al,'상점 창 모든 버튼이 화면 안 '+str(al))
    pg.screenshot(path='shots/v466_상점.png')
    pg.set_viewport_size({'width':960,'height':540});pg.evaluate("(id)=>{__g.closeModal();__g.openShop(id);__g.render();}",sid)
    r=pg.evaluate("(()=>{const b=document.querySelector('#dlgA .bftg').getBoundingClientRect();return b.bottom<=540&&b.right<=960&&b.top>=0;})()");chk(r,'960×540에서도 토글이 아래 고정 줄에서 보임')
    pg.screenshot(path='shots/v466_상점_960.png');pg.set_viewport_size({'width':1280,'height':720})
    vt=pg.evaluate("(()=>{const r=document.getElementById('verTag').getBoundingClientRect();return [r.left,r.bottom];})()");chk(vt[0]<200 and vt[1]>600,'왼쪽 아래 버전 표시')
    # 12) 이전 세이브
    pg.evaluate("(()=>{__g.closeModal();__g.save();})()")
    sv=pg.evaluate("(()=>{const o=JSON.parse(localStorage.getItem('rowen-mmo-v4'));delete o.buf;delete o.cfg.autoBuf;for(const k of ['spdp','atkp','defp'])delete o.bag[k];return JSON.stringify(o);})()");pg.close()
    e2=[];pg2=b.new_page(viewport={'width':1280,'height':720});pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(20,.05);__g.render();__g.fxHud()")
    r=pg2.evaluate("({b:__g.S.buf,a:__g.S.cfg.autoBuf,c:__g.cnt('atkp')})");chk(not e2 and r['b']=={} and r['a'] is False and r['c']==0,'이전 세이브 이어하기 → 오류 없음 · buf {} · 자동 끔')
    # 세이브 남은 시간 이어하기
    pg2.evaluate("(()=>{__g.S.buf={atkp:77};__g.save();})()");pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0")
    r=pg2.evaluate("__g.S.buf.atkp");chk(r is not None and 70<r<=77,'이어하기 뒤에도 남은 시간 유지 %.1f'%(r or -1))
    pg2.close();b.close()
    chk(not errs and not e2,'페이지 오류 없음 '+str((errs+e2)[:2]))
print('PASS buff466 %d'%ok)
