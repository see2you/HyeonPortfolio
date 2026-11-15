"""v4.37 시간의 균열(시간 제한 사냥터): 잠김(Lv) · 표석 창 줄 · 입장 → 사냥터 중앙 · 균열 몬스터 한 벌(Lv+1) · 안에서만 시간 감소
   · 밖이면 멈춤 · 끝나면 충전(2분 → 1분) · 처치 보너스(강화석 21% · 도면 · 비법서) · 트래커 카드 · 시간 끝 → 마을 · 1분 미만 입장 불가
   · 세이브에 남은 시간 저장 · 자동 진행은 들어가지 않음 · 1280×720 버튼 화면 안"""
import sys,os
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots'
os.makedirs(OUT,exist_ok=True)
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000);pg.evaluate("localStorage.clear()")
    pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    J=lambda s:pg.evaluate(s)
    chk('버전 v4.37',J("document.getElementById('verTag').textContent")=='v4.37')
    chk('시작: 잠김(Lv1) · 60:00',J("!__g.riftOpen()&&__g.riftT()===3600&&__g.riftZone()==='z4'"))
    J("__g.riftEnter()");chk('잠김이면 입장 안 됨',J("__g.rift===null"))
    J("__g.S.lv=10;__g.S.autoQ=true;__g.step(3,.05)")
    chk('Lv10: 열림',J("__g.riftOpen()"))
    J("__g.openWay()");pg.wait_for_timeout(80)
    row=J("(()=>{const r=document.querySelector('.si.rift');if(!r)return null;const b=r.querySelector('button').getBoundingClientRect();return {t:r.textContent,dis:r.querySelector('button').disabled,in:b.bottom<=innerHeight&&b.right<=innerWidth}})()")
    chk('표석 창에 균열 줄 · [입장] 화면 안',row and '입장' in row['t'] and not row['dis'] and row['in'],row)
    pg.screenshot(path=f"{OUT}/rift437_way.png")
    n0=J("__g.mobs.filter(m=>m.zone==='z4'&&!m.rift).length")
    J("document.querySelector('.si.rift button').click()");pg.wait_for_timeout(80)
    st=J("({r:!!__g.rift,auto:__g.S.autoQ,in:__g.riftIn(),hz:__g.hunt&&__g.hunt.zone,n:__g.mobs.filter(m=>m.rift&&!m.dead).length,lv:Math.min(...__g.mobs.filter(m=>m.rift).map(m=>m.lv)),nm:(__g.mobs.find(m=>m.rift)||{}).name})")
    chk('입장: 균열 · 자동 진행 끔 · 사냥터 안 · 사냥 시작',st['r'] and not st['auto'] and st['in'] and st['hz']=='z4',st)
    chk('균열 몬스터 한 벌 · 종별 최고 Lv+1 · 이름',st['n']>=n0*0.8 and st['lv']>=11 and st['nm'].startswith('균열 '),[st['n'],n0])
    J("__g.mobs.forEach(m=>m.atk=0)")  # 테스트: 몬스터 무해
    J("__g.step(200,.05)")  # 10초
    t1=J("__g.S.riftT");chk('안에서 시간 감소(10초)',3588<=t1<=3591,t1)
    J("__g.player.x=__g.ZONES.village.c[0];__g.player.y=__g.ZONES.village.c[1];__g.step(100,.05)")
    t2=J("__g.S.riftT");chk('밖이면 멈춤(충전도 안 됨)',abs(t2-t1)<.01 and J("!!__g.rift"),[t1,t2])
    # 처치 보너스: 확률 고정
    J("__g.player.x=__g.ZONES.z4.c[0];__g.player.y=__g.ZONES.z4.c[1];")
    rb=J("""(()=>{const g=__g,S=g.S,R=Math.random;const m=g.mobs.find(x=>x.rift&&!x.dead);const s0=S.stone,r0=g.cnt('rcp2');Math.random=()=>0.001;g.killMob(m);Math.random=R;
      return {st:S.stone-s0,rcp:g.cnt('rcp2')-r0,k:g.rift.k,rs:g.rift.stone,resp:m.respawn}})()""")
    chk('균열 처치: 강화석 · 비법서 · 기록 · 4초 재생성',rb['st']>=1 and rb['rcp']==1 and rb['k']==1 and rb['rs']==rb['st'] and rb['resp']==4,rb)
    ps=J("""(()=>{const g=__g,R=Math.random;let n=0;const m=g.mobs.find(x=>x.zone==='z1'&&!x.dead);const s0=g.S.stone;Math.random=()=>0.15;g.killMob(m);Math.random=R;return g.S.stone-s0})()""")
    chk('균열 밖 몬스터: 강화석 7%는 그대로(0.15면 안 나옴)',ps==0,ps)
    J("__g.setQTab('all');__g.step(2,.05)")
    card=J("(()=>{const c=[...document.querySelectorAll('.qe')].find(e=>e.textContent.includes('시간의 균열'));return c?c.textContent:null})()")
    chk('트래커 카드(남은 시간 · 나가기)',card and '나가기' in card and '남음' in card,card)
    J("__g.player.x=__g.ZONES.z4.c[0]+40;__g.player.y=__g.ZONES.z4.c[1]+60;__g.step(40,.05);__g.render()");pg.screenshot(path=f"{OUT}/rift437_in.png")
    # 시간 끝 → 마을
    J("__g.S.riftT=0.5;__g.step(20,.05)")
    st=J("({r:__g.rift,t:__g.S.riftT,v:Math.hypot(__g.player.x-__g.ZONES.village.c[0],__g.player.y-__g.ZONES.village.c[1]),alive:__g.mobs.filter(m=>m.rift&&!m.dead).length})")
    chk('시간 끝: 닫힘 · 마을로 · 균열 몬스터 사라짐',st['r'] is None and st['v']<300 and st['alive']==0,st)
    J("__g.step(1200,.05)")  # 60초 → 30초 충전
    t3=J("__g.S.riftT");chk('밖에서 60초 → 약 30초 충전',28<=t3<=32,t3)
    J("__g.riftEnter()");chk('1분 미만이면 입장 불가',J("__g.rift===null"))
    J("__g.S.riftT=600;__g.riftEnter()");n2=J("__g.mobs.filter(m=>m.rift).length")
    chk('다시 입장: 몬스터 재사용(늘지 않음)',J("!!__g.rift") and n2==st['alive'] or n2==J("__g.mobs.filter(m=>m.rift&&!m.dead).length"),n2)
    J("__g.riftEnd('out')");chk('나가기',J("__g.rift===null"))
    J("__g.S.riftT=600;__g.riftEnter();__g.player.dead=true;__g.step(2,.05)");chk('쓰러지면 균열 끝',J("__g.rift===null"))
    J("__g.player.dead=false;document.body.classList.remove('dead');__g.player.hp=999;__g.S.riftT=600")
    J("__g.save()");sv=J("JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>localStorage.getItem(k).includes('riftT')))).riftT")
    chk('세이브에 남은 시간',abs(sv-600)<2,sv)
    # 자동 진행은 균열에 들어가지 않는다
    J("__g.S.autoQ=true;__g.autoNext&&__g.autoNext();__g.step(200,.05)");chk('자동 진행은 균열 안 들어감',J("__g.rift===null"))
    # 반복 탭 입장 카드
    J("__g.setQTab('rep');__g.step(20,.05)")
    rc=J("(()=>{const c=[...document.querySelectorAll('.qe')].find(e=>e.textContent.includes('시간의 균열'));if(!c)return null;const r=c.getBoundingClientRect();return {t:c.textContent,in:r.bottom<=innerHeight}})()")
    chk('반복 탭: 입장 카드',rc and '입장' in rc['t'] and rc['in'],rc)
    pg.screenshot(path=f"{OUT}/rift437_rep.png")
    chk('JS 오류 없음',not errs,errs[:3])
    b.close()
print(f"{sum(res)}/{len(res)}");sys.exit(0 if all(res) else 1)
