"""v4.38 균열 정예 · 균열 상자 — v4.46 전용 공간에 맞춰 고침
   균열 안 처치 150마다 정예(가장 높은 종 Lv+3 · 체력 ×5) · 카운트 누적(나가도 유지) · 균열 밖 처치는 안 셈 · 정예는 재생성 안 함
   · 처치 시 상자(강화석 4+2r · 도면 1 · 비법서 1 · 파편 5) · 나갔다 오면 남은 정예 다시 등장 · 균열 HUD '정예까지 N' / '균열의 주인 등장!'"""
import sys,os
from playwright.sync_api import sync_playwright
from rift_util import paths,boot,Rift
HTML,OUT=paths()
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
with sync_playwright() as p:
    b,pg,errs=boot(p,HTML);R=Rift(pg);J=R.J
    chk('버전 v4.x',J("document.getElementById('verTag').textContent").startswith('v4.'))
    J("__g.S.lv=12;__g.S.autoQ=false;__g.S.hpPot=20;__g.step(3,.05)");R.enter()
    chk('입장',J("!!__g.rift&&__g.riftIn()"))
    chk('처음: 정예까지 150',J("__g.riftLeft()")==150)
    KILL="""(n=>{const g=__g;for(let i=0;i<n;i++){const m=g.mobs.find(x=>x.rift&&!x.riftBoss&&!x.dead)||g.mobs.find(x=>x.rift&&!x.riftBoss);m.dead=false;m.hp=1;g.killMob(m);}})"""
    J(KILL+"(149)")
    chk('149처치: 정예 없음 · 남은 1',J("!__g.riftEliteOf()&&__g.riftLeft()===1"),J("__g.riftLeft()"))
    hud=J("(()=>{__g.riftHud();return document.getElementById('rhE').textContent})()")
    chk("균열 HUD: '처치 149 · 정예까지 1'",'149' in hud and '정예까지 1' in hud,hud)
    R.leave();chk('나가도 카운트 유지',J("__g.riftLeft()")==1)
    # 균열 밖 처치는 안 셈
    J("(()=>{const m=__g.mobs.find(x=>x.zone==='z1'&&!x.dead);__g.killMob(m)})()")
    chk('균열 밖 처치는 세지 않음',J("__g.riftLeft()")==1)
    J("__g.S.riftT=900");R.enter()
    J("(()=>{const c=__g.ZONES.rz.c;__g.player.x=c[0];__g.player.y=c[1];})()");J(KILL+"(1)")  # 사냥 구역 한가운데에서 150번째 처치
    e=J("(()=>{const m=__g.riftEliteOf();if(!m)return null;const top=Math.max(...__g.ZALL.z4.mobs.map(a=>a[2]));const n=__g.mobs.find(x=>x.rift&&!x.riftBoss&&x.lv===m.lv-2);const Z=__g.ZONES.rz,d=Math.hypot(m.x-__g.player.x,m.y-__g.player.y);return {lv:m.lv,top,nm:m.name,hp:m.max,nhp:n?n.max:0,dead:m.dead,left:__g.riftLeft(),hm:__g.hunt&&__g.hunt.mob===m,d:Math.round(d),inZ:m.x>=Z.r[0]&&m.x<=Z.r[2]&&m.y>=Z.r[1]&&m.y<=Z.r[3],zone:m.zone}})()")
    chk('150번째: 정예 출현 · Lv 최고+3 · 이름 · 카운트 0',e and e['lv']==e['top']+3 and e['nm'].startswith('균열의 주인') and not e['dead'] and e['left']==150,e)
    chk('정예 체력 ≈ ×5 (같은 Lv 일반 대비 큼)',e and e['hp']>0 and (not e['nhp'] or e['hp']>e['nhp']*3),e)
    chk('정예는 사냥 중인 플레이어 곁(90~150)에 나타난다 · 사냥 구역 안',e and 85<=e['d']<=155 and e['inZ'] and e['zone']=='rz',e)
    chk('자동 사냥이 정예를 노림',e and e['hm'],e)
    J("__g.step(4,.05)")
    hud=J("(()=>{__g.riftHud();const e=document.getElementById('rhE');return {t:e.textContent,on:e.classList.contains('on')}})()")
    chk("균열 HUD: '균열의 주인 등장!' 강조",'등장' in hud['t'] and hud['on'],hud)
    J("(()=>{const m=__g.riftEliteOf();__g.player.x=m.x-30;__g.player.y=m.y+10;return 1})()")
    J("__g.step(30,.05);__g.render()");pg.screenshot(path=f"{OUT}/rift438_elite.png")
    # 나갔다 오면 다시 등장
    R.leave();chk('나가면 정예는 대기(S.riftEP) · 밖에는 정예 없음',J("__g.S.riftEP.z4===1&&!__g.mobs.some(m=>m.riftBoss)"))
    J("__g.S.riftT=900");R.enter();J("__g.step(40,.05)")
    chk('다시 들어오면 남은 정예 다시 등장(하나뿐)',J("!!__g.riftEliteOf()&&!__g.riftEliteOf().dead&&__g.mobs.filter(m=>m.riftBoss).length===1"))
    gp=J("(()=>{const m=__g.riftEliteOf(),Z=__g.ZONES.rz,gx=Z.c[0],gy=Z.r[3]-95;return {d:Math.round(Math.hypot(m.home.x-gx,m.home.y-gy)),near:__g.mobs.filter(x=>!x.riftBoss&&Math.hypot(x.home.x-gx,x.home.y-gy)<110).length}})()")
    chk('다시 들어왔을 때 정예 자리 = 사냥 구역 입구 앞 빈터(주변에 몬스터 자리 없음)',gp['d']<=2 and gp['near']==0,gp)
    bx=J("""(()=>{const g=__g,S=g.S,m=g.riftEliteOf();const s0=S.stone,sh0=S.shard,r0=g.cnt('rcp2'),d0=['dw1','da1','dc1'].reduce((a,k)=>a+g.cnt(k),0),b0=S.riftBox||0;const R=Math.random;Math.random=()=>0.99;m.hp=1;g.killMob(m);Math.random=R;
      return {st:S.stone-s0,sh:S.shard-sh0,rcp:g.cnt('rcp2')-r0,dsg:['dw1','da1','dc1'].reduce((a,k)=>a+g.cnt(k),0)-d0,box:(S.riftBox||0)-b0,resp:m.respawn,left:g.riftLeft(),rb:g.rift.box}})()""")
    chk('균열 상자: 강화석 +6 · 도면 1 · 비법서 1 · 파편 5',bx['st']==6 and bx['dsg']==1 and bx['rcp']==1 and bx['sh']==5 and bx['box']==1 and bx['rb']==1,bx)
    chk('정예는 재생성 안 함 · 정예 처치는 카운트에 안 듦',bx['resp']>=1e9 and bx['left']==150,bx)
    J("__g.step(200,.05)");chk('10초 뒤에도 정예 없음',J("__g.riftEliteOf().dead"))
    lg=J("JSON.stringify(__g.S.acqLog||__g.S.acq||'')")
    chk('획득 기록에 균열 정예 출처','균열 정예' in lg,lg[:120])
    J("__g.step(30,.05);__g.render()");pg.screenshot(path=f"{OUT}/rift438_box.png")
    J("__g.save()");sv=J("JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('riftT'))))")
    chk('세이브: 카운트 · 상자 수',sv.get('riftBox')==1 and 'riftEK' in sv,[sv.get('riftBox'),sv.get('riftEK')])
    chk('세이브: 균열 안에서 저장해도 맵 · 자리는 들어오기 전 것',sv.get('map')=='rowen',sv.get('map'))
    R.leave();J("__g.openWay()");pg.wait_for_timeout(80)
    row=J("(()=>{const r=document.querySelector('.si.rift');return r?r.textContent:null})()")
    chk('표석 줄: 정예까지 N(상자 확정)',row and '정예까지 150' in row,row)
    pg.screenshot(path=f"{OUT}/rift438_way.png")
    chk('JS 오류 없음',not errs,errs[:3])
    b.close()
print(f"{sum(res)}/{len(res)}");sys.exit(0 if all(res) else 1)
