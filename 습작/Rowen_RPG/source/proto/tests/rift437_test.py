"""v4.37 시간의 균열(시간 제한 사냥터) — v4.46 전용 공간에 맞춰 고침
   잠김(개방 스토리 · Lv) · 표석 창 줄 · 입장 → 전용 맵 '시간의 균열'(사냥 구역 rz) · 균열 몬스터 한 벌(보통 + 최고 Lv+1) · 안에서만 시간 감소
   · 나가면 충전(2분 → 1분) · 처치 보너스(강화석 · 도면 · 비법서) · 시간 끝 → 마을 · 1분 미만 입장 불가 · 세이브에 남은 시간 · 자동 진행은 들어가지 않음"""
import sys,os,json
from playwright.sync_api import sync_playwright
from rift_util import paths,boot,Rift
HTML,OUT=paths()
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
with sync_playwright() as p:
    b,pg,errs=boot(p,HTML,key=False);R=Rift(pg);J=R.J
    chk('버전 v4.x',J("document.getElementById('verTag').textContent").startswith('v4.'))
    chk('시작: 잠김 · 60:00 · 딸린 사냥터 z4',J("!__g.riftOpen()&&__g.riftT()===3600&&__g.riftZone()==='z4'"))
    J("__g.S.lv=10;__g.riftEnter(true)");chk('개방 스토리 전이면 Lv가 돼도 입장 안 됨',J("__g.rift===null&&__g.MAPID==='rowen'&&!__g.traveling"))
    J("__g.S.lv=1;__g.S.riftKey=1;__g.riftEnter(true)");chk('스토리를 지나도 Lv 모자라면 입장 안 됨',J("__g.rift===null&&!__g.traveling"))
    J("__g.S.lv=10;__g.S.autoQ=true;__g.step(3,.05)")
    chk('스토리 + Lv10: 열림',J("__g.riftOpen()"))
    J("__g.openWay()");pg.wait_for_timeout(80)
    row=J("(()=>{const r=document.querySelector('.si.rift');if(!r)return null;const b=r.querySelector('button').getBoundingClientRect();return {t:r.textContent,dis:r.querySelector('button').disabled,in:b.bottom<=innerHeight&&b.right<=innerWidth}})()")
    chk('표석 창에 균열 줄 · [입장] 화면 안',row and '입장' in row['t'] and not row['dis'] and row['in'],row)
    pg.screenshot(path=f"{OUT}/rift437_way.png")
    n0=J("__g.ZALL.z4.mobs.reduce((a,m)=>a+m[3],0)");p0=J("[Math.round(__g.player.x),Math.round(__g.player.y)]")
    J("__g.S.hpPot=20");J("document.querySelector('.si.rift button').click()");R.wait_in()
    st=J("({r:!!__g.rift,auto:__g.S.autoQ,in:__g.riftIn(),map:__g.MAPID,hz:__g.hunt&&__g.hunt.zone,n:__g.mobs.filter(m=>m.rift&&!m.dead).length,nn:__g.mobs.filter(m=>m.riftN).length,lv:Math.min(...__g.mobs.filter(m=>m.rift&&!m.riftN).map(m=>m.lv)),nm:(__g.mobs.find(m=>m.rift)||{}).name,all:__g.mobs.every(m=>m.rift&&m.zone==='rz'),base:__g.rift.base,of:__g.rift.of})")
    chk('입장: 전용 맵 · 자동 진행 끔 · 사냥 시작(rz)',st['r'] and not st['auto'] and st['in'] and st['map']=='rift' and st['hz']=='rz' and st['base']=='z4' and st['of']=='rowen',st)
    chk('균열 몬스터 한 벌(보통 n + 높은 Lv n) · 최고 Lv+1 · 이름',st['n']>=n0*2*0.8 and abs(st['nn']-st['n']/2)<=3 and st['lv']>=11 and st['nm'].startswith('균열 ') and st['all'],[st['n'],st['nn'],n0])
    chk('옛 사냥터(z4)에는 균열 몬스터가 없다(맵이 다르다)',J("!__g.mobs.some(m=>m.zone==='z4')"))
    J("__g.mobs.forEach(m=>m.atk=0)")  # 테스트: 몬스터 무해
    J("__g.step(200,.05)")  # 10초
    t1=J("__g.S.riftT");chk('안에서 시간 감소(10초)',3587<=t1<=3591,t1)
    J("__g.player.x=__g.ZONES.village.c[0];__g.player.y=__g.ZONES.village.c[1];__g.step(100,.05)")
    t2=J("__g.S.riftT");chk('문턱(안전 구역)에 서 있어도 전용 맵 안이면 시간이 준다',4.5<=t1-t2<=5.5 and J("!!__g.rift"),[t1,t2])
    # 처치 보너스: 확률 고정
    J("__g.player.x=__g.ZONES.rz.c[0];__g.player.y=__g.ZONES.rz.c[1];")
    rb=J("""(()=>{const g=__g,S=g.S,R=Math.random;const m=g.mobs.find(x=>x.rift&&!x.riftN&&!x.dead);const s0=S.stone,r0=g.cnt('rcp2');Math.random=()=>0.001;g.killMob(m);Math.random=R;
      const n=g.mobs.find(x=>x.riftN&&!x.dead);g.mobs.forEach(x=>x.atk=0);const k0=g.rift.k;g.killMob(n);
      return {st:S.stone-s0,rcp:g.cnt('rcp2')-r0,k:g.rift.k,rs:g.rift.stone,resp:m.respawn,nresp:n.respawn,nk:g.rift.k-k0}})()""")
    chk('균열 처치: 강화석 · 비법서 · 기록 · 4초 재생성',rb['st']>=1 and rb['rcp']==1 and rb['k']>=1 and rb['resp']==4,rb)
    chk('보통 레벨 균열 몬스터도 균열 처치로 센다 · 9초 재생성',rb['nk']==1 and rb['nresp']==9,rb)
    hud=J("(()=>{const h=document.getElementById('riftHud');__g.riftHud();const r=h.getBoundingClientRect(),x=document.getElementById('rhX').getBoundingClientRect();return {vis:!h.hidden&&r.width>0,t:document.getElementById('rhT').textContent,e:document.getElementById('rhE').textContent,x:x.width>0&&x.right<=innerWidth&&x.bottom<=innerHeight}})()")
    chk('균열 HUD: 남은 시간 · 정예까지 · [나가기]',hud['vis'] and ':' in hud['t'] and '정예까지' in hud['e'] and hud['x'],hud)
    J("__g.player.x=__g.ZONES.rz.c[0]+40;__g.player.y=__g.ZONES.rz.c[1]+60;__g.step(40,.05);__g.render()");pg.screenshot(path=f"{OUT}/rift437_in.png")
    # 시간 끝 → 마을
    J("__g.S.riftT=0.5;__g.step(20,.05)");R.wait_out()
    st=J("({r:__g.rift,t:__g.S.riftT,map:__g.MAPID,v:Math.hypot(__g.player.x-__g.ZONES.village.c[0],__g.player.y-__g.ZONES.village.c[1]),alive:__g.mobs.filter(m=>m.rift&&!m.dead).length,hud:document.getElementById('riftHud').hidden})")
    chk('시간 끝: 닫힘 · 로웬 마을로 · 균열 몬스터 없음 · HUD 숨김',st['r'] is None and st['map']=='rowen' and st['v']<300 and st['alive']==0 and st['hud'],st)
    ta=J("__g.S.riftT");J("__g.step(1200,.05)")  # 60초 → 30초 충전
    t3=J("__g.S.riftT");chk('밖에서 60초 → 약 30초 충전',28<=t3-ta<=32,[ta,t3])
    J("__g.S.riftT=30;__g.riftEnter(true)");chk('1분 미만이면 입장 불가',J("__g.rift===null&&!__g.traveling"))
    ps=J("""(()=>{const g=__g,R=Math.random;const m=g.mobs.find(x=>x.zone==='z1'&&!x.dead);const s0=g.S.stone;Math.random=()=>0.15;g.killMob(m);Math.random=R;return g.S.stone-s0})()""")
    chk('균열 밖 몬스터: 강화석 7%는 그대로(0.15면 안 나옴)',ps==0,ps)
    J("__g.S.riftT=600");R.enter();n2=J("__g.mobs.filter(m=>m.rift).length")
    chk('다시 입장: 한 벌 새로 깔림(늘지 않음)',J("!!__g.rift") and abs(n2-st['alive']-n0*2)<=n0*2*0.2,n2)
    R.leave();chk('나가기 → 들어오기 전 자리',J("__g.rift===null&&__g.MAPID==='rowen'") and J("Math.hypot(__g.player.x-__g.ZONES.village.c[0],__g.player.y-__g.ZONES.village.c[1])")<400)
    J("__g.S.riftT=600");R.enter();J("__g.player.dead=true;__g.step(2,.05)");chk('쓰러지면 균열 끝',J("__g.rift===null"))
    J("__g.player.dead=false;document.body.classList.remove('dead');__g.player.hp=999;__g.S.riftT=600;__g.step(2,.05)");R.wait_out()
    chk('입장 없이 전용 맵에 남으면 마을로 내보낸다(예외 처리)',J("__g.MAPID==='rowen'"))
    J("__g.save()");sv=J("JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('riftT')))).riftT")
    chk('세이브에 남은 시간',abs(sv-600)<2,sv)
    # 자동 진행은 균열에 들어가지 않는다
    J("__g.S.autoQ=true;__g.autoNext&&__g.autoNext();__g.step(200,.05)");chk('자동 진행은 균열 안 들어감',J("__g.rift===null&&__g.MAPID==='rowen'"))
    # 반복 탭 입장 카드
    J("__g.S.autoQ=false;__g.setQTab('rep');__g.step(20,.05)")
    rc=J("(()=>{const c=[...document.querySelectorAll('.qe')].find(e=>e.textContent.includes('시간의 균열'));if(!c)return null;const r=c.getBoundingClientRect();return {t:c.textContent,in:r.bottom<=innerHeight}})()")
    chk('반복 탭: 입장 카드',rc and '입장' in rc['t'] and rc['in'],rc)
    pg.screenshot(path=f"{OUT}/rift437_rep.png")
    chk('JS 오류 없음',not errs,errs[:3])
    b.close()
print(f"{sum(res)}/{len(res)}");sys.exit(0 if all(res) else 1)
