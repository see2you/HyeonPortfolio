"""v4.80 G2-a 능력치 구간 보너스 엔진 (지시서 §G2) — 투자 포인트 10 · 20 · 30 · 45에서 켜지는 덤 효과 16개
1) 구간 표: 경계(9↔10 · 19↔20 · 29↔30 · 44↔45)에서 켜짐/꺼짐 · 큰 값이 대체(관통 · 회피 · 재사용)
2) 실제 효과: 방어 관통 · 치명 피해 · 처치 후 공격 · 물약 회복 · 비전투 회복 · 무게 한도 · 낮은 HP 피해 감소 · 버팀 · 이동 속도 · 회피(평타 · 투사체만) · 치명 뒤 공속 · MP 회복 · 재사용 · 다음 평타
3) 전투력 = 구간 하나당 +60
4) 능력치 창 미리 보기 = 실제 값(칩 · 다음 구간 안내 · 전투력) · 배분 적용 뒤 켜짐 · 포인트를 내리면(초기화) 꺼짐 · [+] 버튼이 줄 안
5) 이전 세이브 이어하기 · 버전 · 화면(shots/v480_*.png)"""
import os,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html');os.makedirs('shots',exist_ok=True);N=[0,0]
def chk(c,msg):
    N[0]+=1;N[1]+=0 if c else 1;print(('ok  ' if c else 'FAIL'),msg)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    ver=pg.evaluate("document.body.innerText.match(/v4\\.\\d+/)[0]");chk(ver.startswith('v4.'),'버전 표시 '+ver)
    E=lambda s:pg.evaluate(s)
    E("(()=>{const S=__g.S;S.autoGrow=false;S.autoPot=false;S.lv=30;S.st={str:0,vit:0,dex:0,int:0};window.ST=o=>{S.st=Object.assign({str:0,vit:0,dex:0,int:0},o);};window.R0=Math.random;window.RND=v=>{Math.random=v==null?R0:()=>v;};})()")
    # 1) 구간 표
    tb=E("(()=>{const o={};for(const k of ['str','vit','dex','int']){o[k]=[9,10,19,20,29,30,44,45,99].map(v=>__g.tbN(k,{[k]:v}));}return o})()")
    chk(all(v==[0,1,1,2,2,3,3,4,4] for v in tb.values()),'구간 수 경계 9↔10 · 19↔20 · 29↔30 · 44↔45 '+str(tb['str']))
    vals=E("(()=>{const v=(k,st)=>__g.tbVal(k,st);return {pen:[v('pen',{str:9}),v('pen',{str:10}),v('pen',{str:44}),v('pen',{str:45})],critM:[v('critM',{str:19}),v('critM',{str:20})],kill:[v('killAtk',{str:29}),v('killAtk',{str:30})],pot:[v('pot',{vit:9}),v('pot',{vit:10})],rg:[v('rg',{vit:19}),v('rg',{vit:20})],wt:[v('wt',{vit:19}),v('wt',{vit:20})],low:[v('lowDr',{vit:29}),v('lowDr',{vit:30})],save:[v('save',{vit:44}),v('save',{vit:45})],mv:[v('mv',{dex:9}),v('mv',{dex:10})],ev:[v('ev',{dex:19}),v('ev',{dex:20}),v('ev',{dex:44}),v('ev',{dex:45})],cas:[v('critAs',{dex:29}),v('critAs',{dex:30})],mp:[v('mpRg',{int:9}),v('mpRg',{int:10})],cd:[v('cd',{int:19}),v('cd',{int:20}),v('cd',{int:44}),v('cd',{int:45})],nx:[v('next',{int:29}),v('next',{int:30})]}})()")
    exp={'pen':[0,.1,.1,.25],'critM':[0,.15],'kill':[0,.08],'pot':[0,.1],'rg':[0,1],'wt':[0,.1],'low':[0,.2],'save':[0,120],'mv':[0,.06],'ev':[0,.08,.08,.15],'cas':[0,.15],'mp':[0,.5],'cd':[0,.08,.08,.15],'nx':[0,.4]}
    chk(vals==exp,'구간 값 16개 · 큰 값이 대체(관통 10→25 · 회피 8→15 · 재사용 8→15) '+json.dumps(vals))
    # 3) 전투력
    cp=E("(()=>{const a=__g.cpOf({str:9,vit:0,dex:0,int:0}),b=__g.cpOf({str:10,vit:0,dex:0,int:0}),c=__g.cpOf({str:8,vit:0,dex:0,int:0});return [a-c,b-a]})()")
    chk(cp[1]-cp[0]==60,'전투력: 구간 하나 +60 (9→10 = %d, 8→9 = %d)'%(cp[1],cp[0]))
    # 2) 실제 효과 — 허수아비 몬스터 하나(마을 밖에서 불러오지 않고 목록의 첫 몬스터를 쓴다)
    E("(()=>{const m=__g.mobs.find(x=>!x.dead&&!x.boss);window.M=m;m.max=m.hp=1e9;m.def=40;m.lv=30;m.fa=0;})()")
    HIT="(()=>{M.hp=1e9;const h=M.hp;__g.playerHit(M,1,%s);return h-M.hp})()"
    def dmg(st,skill='false',rnd=.5):
        E("ST(%s);RND(%s)"%(json.dumps(st),rnd));d=E(HIT%skill);E("RND()");return d
    a=E("(ST({str:9}),__g.pStats().atk)");d9=dmg({'str':9});chk(abs(d9-(a-40))<.01,'힘 9: 관통 없음 %.1f = 공격 %d − 방어 40'%(d9,a))
    a=E("(ST({str:10}),__g.pStats().atk)");d10=dmg({'str':10});chk(abs(d10-(a-36))<.01,'힘 10: 방어 관통 10%% %.1f = 공격 %d − 36'%(d10,a))
    a=E("(ST({str:45}),__g.pStats().atk)");d45=dmg({'str':45});chk(abs(d45-(a-30))<.01,'힘 45: 방어 관통 25%% %.1f = 공격 %d − 30'%(d45,a))
    cm=E("[(ST({str:19}),__g.pStats().critM),(ST({str:20}),__g.pStats().critM),__g.pStats({str:20,vit:0,dex:0,int:0},true).critM]");chk(abs(cm[0]-1.6)<1e-9 and abs(cm[1]-1.75)<1e-9 and abs(cm[2]-1.75)<1e-9,'힘 20: 치명 피해 1.60 → 1.75 (미리 보기 값도 같음) '+str(cm))
    # 처치 후 공격 +8% 3초
    k=E("(()=>{ST({str:30});const a0=__g.pStats().atk,cp0=__g.cpOf();const m=__g.mobs.find(x=>!x.dead&&!x.boss&&x!==M);__g.killMob(m);const a1=__g.pStats().atk,cp1=__g.cpOf(),left=__g.player.tbKillT-__g.t;__g.player.tbKillT=__g.t-.01;const a2=__g.pStats().atk;ST({str:29});const m2=__g.mobs.find(x=>!x.dead&&!x.boss&&x!==M);const b0=__g.pStats().atk;__g.player.tbKillT=0;__g.killMob(m2);return {a0,a1,a2,left,cp0,cp1,b0,b1:__g.pStats().atk}})()")
    chk(k['a1']==round(k['a0']*1.08) and k['a2']==k['a0'] and abs(k['left']-3)<1e-6 and k['cp0']==k['cp1'] and k['b0']==k['b1'],'힘 30: 처치 뒤 3초 공격 ×1.08 → 끝나면 원래 · 전투력에는 안 들어감 · 힘 29는 없음 '+json.dumps(k))
    # 물약
    pot=E("(()=>{const f=v=>{ST({vit:v});const st=__g.pStats();__g.S.hpPot=5;__g.player.potT=0;__g.player.hp=1;__g.usePot('hp',true);return [(__g.player.hp-1),Math.max(60,st.hp*.35)]};return [f(9),f(10)]})()")
    chk(abs(pot[0][0]-pot[0][1])<.01 and abs(pot[1][0]-pot[1][1]*1.1)<.01,'체력 10: HP 물약 회복 ×1.10 '+str(pot))
    wt=E("[(ST({vit:19}),__g.weightMax()),(ST({vit:20}),__g.weightMax())]");chk(wt[1]==round((wt[0]+25)*1.1),'체력 20: 무게 한도 +10%% %s'%wt)
    rg=E("(()=>{const f=v=>{ST({vit:v});const st=__g.pStats();__g.player.lastHit=-99;__g.player.hp=st.hp*.2;const h=__g.player.hp;__g.step(10,.05);return (__g.player.hp-h)/st.hp};return [f(19),f(20)]})()")
    chk(rg[0]>0 and abs(rg[1]/rg[0]-2)<.02,'체력 20: 비전투 회복 2배 %.4f → %.4f'%(rg[0],rg[1]))
    low=E("(()=>{const f=(v,r)=>{ST({vit:v});const st=__g.pStats();__g.player.shield=0;__g.player.guardT=0;__g.player.hp=Math.floor(st.hp*r);const h=__g.player.hp;__g.hurtPlayer(50,null,'zone');return h-__g.player.hp};return [f(29,.3),f(30,.3),f(30,.5)]})()")
    chk(low==[50,40,50],'체력 30: HP 30%% 이하 받는 피해 −20%% (29 = 50 · 30 = 40 · HP 50%%면 50) %s'%low)
    mv=E("[(ST({dex:9}),__g.pSPD()),(ST({dex:10}),__g.pSPD())]");chk(abs(mv[1]/mv[0]-1.06)<1e-9,'민첩 10: 이동 속도 ×1.06 %s'%mv)
    EV="(()=>{ST({dex:%d});RND(%s);const st=__g.pStats();__g.player.hp=st.hp;const h=__g.player.hp;__g.hurtPlayer(30,null,%s);RND();return h-__g.player.hp})()"
    ev=[E(EV%(20,.05,"'melee'")),E(EV%(20,.05,"'shot'")),E(EV%(20,.05,"'zone'")),E(EV%(20,.05,"null")),E(EV%(20,.10,"'melee'")),E(EV%(45,.10,"'melee'")),E(EV%(19,.0,"'melee'"))]
    chk(ev==[0,0,30,30,30,0,30],'민첩 20 · 45: 회피 8%% → 15%% · 평타 · 투사체만(장판 · 돌진은 그대로) · 민첩 19는 없음 %s'%ev)
    cas=E("(()=>{ST({dex:30});__g.player.tbCritT=0;const a0=__g.pStats().aspd;RND(0);M.hp=1e9;__g.playerHit(M,1,false);RND();const a1=__g.pStats().aspd;__g.player.tbCritT=__g.t-.01;const a2=__g.pStats().aspd;ST({dex:29});__g.player.tbCritT=0;const b0=__g.pStats().aspd;RND(0);__g.playerHit(M,1,false);RND();return [a0,a1,a2,b0,__g.pStats().aspd]})()")
    chk(abs(cas[1]-cas[0]-.15)<1e-9 and cas[2]==cas[0] and cas[3]==cas[4],'민첩 30: 치명 뒤 3초 공격 속도 +15%%p → 끝나면 원래 · 민첩 29는 없음 %s'%cas)
    mp=E("(()=>{const f=v=>{ST({int:v});const st=__g.pStats();__g.player.mp=0;__g.step(10,.05);return __g.player.mp/(st.mp)};const a=f(9),b=f(10);ST({int:9});const s9=__g.pStats().mp;ST({int:10});const s10=__g.pStats().mp;return [a*s9,b*s10,s9,s10]})()")
    # 마을 안: (mp0 + mp×비율)×dt — 기대값을 식으로
    exp9=(2+mp[2]*.08)*.5;exp10=(2+mp[3]*.08)*.5*1.5
    chk(abs(mp[0]-exp9)<.05 and abs(mp[1]-exp10)<.05,'지력 10: MP 자연 회복 ×1.5 (%.2f = %.2f · %.2f = %.2f)'%(mp[0],exp9,mp[1],exp10))
    cd=E("(()=>{const i=__g.SK.findIndex(s=>s.id==='whirl');__g.S.sk.whirl=1;const f=v=>{ST({int:v});__g.player.cd[i]=0;__g.player.mp=999;__g.player.tbNx=0;const ok=__g.castSkill(i,true);return [ok,+(__g.player.cd[i]-__g.t).toFixed(4),__g.player.tbNx||0]};return {cd:__g.gfxCd(__g.SK[i]),r:[f(19),f(20),f(29),f(30),f(45)]}})()")
    c0=cd['cd'];r=cd['r'];chk(all(x[0] for x in r) and abs(r[0][1]-c0)<1e-3 and abs(r[1][1]-c0*.92)<1e-3 and abs(r[4][1]-c0*.85)<1e-3 and [x[2] for x in r]==[0,0,0,1,1],'지력 20 · 45: 재사용 −8%% → −15%% (%.2f → %.2f → %.2f) · 지력 30: 스킬 뒤 다음 평타 표시 %s'%(r[0][1],r[1][1],r[4][1],[x[2] for x in r]))
    E("ST({int:30})");a=E("__g.pStats().atk");E("__g.player.tbNx=1");n1=dmg({'int':30});n2=dmg({'int':30});E("__g.player.tbNx=1");n3=dmg({'int':30},'true');fl=E("__g.player.tbNx")
    chk(abs(n1-(a*1.4-40))<.01 and abs(n2-(a-40))<.01 and fl==1,'지력 30: 다음 평타 ×1.4 한 번만(%.1f → %.1f) · 스킬 타격은 표시를 쓰지 않음'%(n1,n2));E("__g.player.tbNx=0")
    # 버팀(체력 45) — 한 번 버티고 120초 안의 다음 죽는 피해에는 쓰러진다
    sv=E("(()=>{ST({vit:45});const st=__g.pStats();__g.player.hp=st.hp;__g.player.tbSvT=0;__g.hurtPlayer(1e6,null,'zone');const a=[__g.player.hp,__g.player.dead,+(__g.player.tbSvT-__g.t).toFixed(2)];ST({vit:44});__g.player.hp=50;__g.player.tbSvT=0;return a})()")
    chk(sv==[1,False,120],'체력 45: 죽는 피해를 한 번 버팀(HP 1 · 다음은 120초 뒤) %s'%sv)
    # 4) 능력치 창 미리 보기
    E("(()=>{const S=__g.S;ST({str:28,vit:12,dex:9,int:4});S.sp=16;__g.openStats();})()");pg.wait_for_timeout(200)
    UI="(()=>{const rows=[...document.querySelectorAll('.srow')];return {chips:rows.map(r=>[...r.querySelectorAll('.tbc')].map(c=>c.classList.contains('on')?2:c.classList.contains('new')?1:0)),txt:rows.map(r=>r.querySelector('.tbt').textContent),box:document.querySelector('.tbl').innerText,cp:[...document.querySelectorAll('.cr.cpr b')].map(x=>x.textContent),plus:rows.map(r=>{const a=r.getBoundingClientRect(),b=r.querySelectorAll('.sbt')[1].getBoundingClientRect();return b.right<=a.right+1&&b.left>=a.left}),btn:[...document.querySelectorAll('.btns .btn')].map(x=>{const q=x.getBoundingClientRect();return q.bottom<=720&&q.top>=0})}})()"
    u0=E(UI);print(u0)
    chk(u0['chips']==[[2,2,0,0],[2,0,0,0],[0,0,0,0],[0,0,0,0]] and '다음 30까지 2' in u0['txt'][0] and '처치 후 3초 공격 +8%' in u0['txt'][0] and '다음 10까지 1' in u0['txt'][2] and '3 / 16' in u0['box'],'능력치 창: 칩 = 닿은 구간 · 다음 구간까지 남은 포인트 + 효과')
    chk(all(u0['plus']) and all(u0['btn']),'[+] 버튼은 줄 안 · 아래 동작 버튼은 스크롤 없이 화면 안')
    E("(()=>{const b=[...document.querySelectorAll('.srow')];const pl=k=>b[k].querySelectorAll('.sbt')[1];pl(0).dispatchEvent(new MouseEvent('click',{detail:0}));})()");E("(()=>{const b=[...document.querySelectorAll('.srow')];b[0].querySelectorAll('.sbt')[1].dispatchEvent(new MouseEvent('click',{detail:0}));})()");E("(()=>{const b=[...document.querySelectorAll('.srow')];b[2].querySelectorAll('.sbt')[1].dispatchEvent(new MouseEvent('click',{detail:0}));})()");pg.wait_for_timeout(150)
    u1=E(UI);real=E("(()=>{const n={str:30,vit:12,dex:10,int:4};return {cp:__g.cpOf(n),cnt:__g.tbCount(n),now:__g.tbCount(),cp0:__g.cpOf()}})()");print(u1,real)
    chk(u1['chips'][0]==[2,2,1,0] and u1['chips'][2]==[1,0,0,0] and u1['txt'][0].startswith('새 효과') and '5 / 16' in u1['box'] and '+300' in u1['box'] and real['cnt']==5 and real['now']==3,'미리 보기: 이번 배분으로 닿는 구간 = 새 칩 · 구간 5/16 · 전투력 +300 (적용 전에는 실제 3개)')
    chk(u1['cp'][0].replace(',','')==str(real['cp0']) and u1['cp'][1].replace(',','').split()[0]==str(real['cp']),'미리 보기 전투력 = 실제 cpOf (%s → %s)'%(u1['cp'][0],u1['cp'][1]))
    pg.screenshot(path='shots/v480_능력치구간.png')
    E("[...document.querySelectorAll('.btns .btn')].find(x=>x.textContent==='배분 적용').click()");pg.wait_for_timeout(150)
    ap=E("({st:__g.S.st,n:__g.tbCount(),k:__g.tbVal('killAtk'),mv:__g.tbVal('mv'),cp:__g.cpOf()})");chk(ap['st']['str']==30 and ap['n']==5 and ap['k']==.08 and ap['mv']==.06 and ap['cp']==real['cp'],'배분 적용 → 구간 5개 켜짐 · 전투력 = 미리 보기 값')
    off=E("(()=>{ST({str:5,vit:5,dex:5,int:5});return [__g.tbCount(),__g.tbVal('pen'),__g.tbVal('mv'),__g.pStats().critM]})()");chk(off[0]==0 and off[1]==0 and off[2]==0 and abs(off[3]-1.6)<1e-9,'포인트를 내리면(초기화) 모두 꺼짐 %s'%off)
    # 가장 많은 상태(16개 모두)
    E("(()=>{ST({str:45,vit:45,dex:45,int:45});__g.S.sp=0;__g.closeWin();__g.openStats();})()");pg.wait_for_timeout(200);u2=E(UI);pg.screenshot(path='shots/v480_능력치구간_전부.png')
    fit=E("(()=>{const w=document.querySelector('.tbl').getBoundingClientRect(),c=document.querySelector('.cr.cpr').getBoundingClientRect(),f=[...document.querySelectorAll('.btns .btn')].find(x=>x.textContent==='배분 적용').parentElement.getBoundingClientRect();return [Math.round(w.bottom),Math.round(c.bottom),Math.round(f.top)]})()")
    chk('16 / 16' in u2['box'] and all(u2['plus']) and all(u2['btn']) and all('모두 달성' in x for x in u2['txt']) and '관통 10%' not in u2['box'] and '관통 25%' in u2['box'],'16개 모두: 대체된 줄(관통 10% 등)은 감추고 버튼은 화면 안 '+str(fit))
    chk(fit[1]<=fit[2]+1,'16개 모두일 때 전투력 줄이 아래 버튼 줄에 가리지 않음 %s'%fit)
    # 5) 이전 세이브 이어하기
    E("(()=>{ST({str:12,vit:3,dex:2,int:1});__g.closeWin();__g.save&&__g.save();})()");sv=E("localStorage.getItem('rowen-mmo-v4')")
    chk(sv is not None and 'tb' not in json.loads(sv),'새 저장 필드 없음(구간은 S.st에서 계산)')
    pg2=b.new_page(viewport={'width':1280,'height':720});e2=[];pg2.on('pageerror',lambda e:e2.append(str(e)))
    pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",sv);pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(600);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(20,.05)")
    r2=pg2.evaluate("[__g.S.st.str,__g.tbCount(),__g.tbVal('pen')]");chk(not e2 and r2==[12,1,.1],'이어하기 → 오류 없음 · 힘 12 = 구간 1개(관통 10%%) %s %s'%(r2,e2))
    print('ERRORS',errs or 'none');print('RESULT %d/%d'%(N[0]-N[1],N[0]));assert not errs and N[1]==0
    b.close()
