"""v4.46 시간의 균열 개방 스토리(G17 · 현 요청) — 메인 q10 「호수의 주인」 뒤에 rq1 → rq2 → rq3를 끼우고, rq3을 마쳐야 균열이 열린다
   · 순서 · 보상(기존 퀘스트 보상이 한 칸도 밀리지 않음) · 잠김 안내(메뉴 · 표석 · 입장) · 자동 진행으로 스토리 완주 → 개방 연출 · 자동 진행은 균열에 들어가지 않음
   · 첫 균열 탐사(gr1 · 균열 처치 10) · 세이브 이전(옛 순번 → id로 다시 찾기 · 이미 지난 세이브는 열림 · 쓰던 세이브는 riftKey) · 이어하기 왕복"""
import sys,os,json
from playwright.sync_api import sync_playwright
from rift_util import paths,boot,Rift
HTML,OUT=paths()
res=[];chk=lambda n,c,v='':(res.append(bool(c)),print(('PASS ' if c else 'FAIL ')+n,v))
TOAST="[...document.querySelectorAll('.toast,#toasts div')].map(e=>e.textContent).join(' | ')"
with sync_playwright() as p:
    b,pg,errs=boot(p,HTML,key=False);R=Rift(pg);J=R.J
    def run(cond,n=200,k=20):
        for i in range(n):
            if J("__g.traveling"):pg.wait_for_function("!__g.traveling",timeout=90000)
            J(f"__g.step({k},.05)")
            if J("!__g.traveling&&("+cond+")"):return True
        return False
    IDX="(id=>__g.QUESTS.findIndex(q=>q.id===id))"
    chk('버전 v4.x',J("document.getElementById('verTag').textContent").startswith('v4.'))
    # 1) 순서 · 새 게임 qv · 보상
    o=J("(()=>{const Q=__g.QUESTS,ix=id=>Q.findIndex(q=>q.id===id);return {n:Q.length,q10:ix('q10'),r1:ix('rq1'),r2:ix('rq2'),r3:ix('rq3'),q11:ix('q11'),qv:__g.S.qv,qi:__g.S.qi,old:__g.QORDER_445.length,same:(()=>{const o=__g.QORDER_445.filter(x=>x!=='fb3'&&x!=='fb6');o.splice(o.indexOf('q12')+1,0,'fb3');o.splice(o.indexOf('q21')+1,0,'fb6');return o.join()===Q.filter(q=>!q.story).map(q=>q.id).join();})(),story:Q.filter(q=>q.story).map(q=>q.id).join()}})()")
    chk('메인 44개 · q10 → rq1 → rq2 → rq3 → q11 순서',o['n']==44 and o['r1']==o['q10']+1 and o['r2']==o['r1']+1 and o['r3']==o['r2']+1 and o['q11']==o['r3']+1,o)
    chk('옛 순서표(QORDER_445) 41개에서 fb3 · fb6만 그 지역 끝으로 옮긴 것 = 스토리를 뺀 지금 순서(v4.83 지역 단위 루트)',o['old']==41 and o['same'] and o['story']=='rq1,rq2,rq3',o)
    chk('새 게임: qv 4 · qi 0',o['qv']==4 and o['qi']==0,o)
    rw=J("(()=>{const Q=__g.QUESTS,g=id=>Q.find(q=>q.id===id);return {r1:g('rq1').rw,r2:g('rq2').rw,r3:g('rq3').rw,ty:[g('rq1').type,g('rq2').type,g('rq3').type],gate:['rq1','rq2','rq3'].some(id=>g(id).gate||g(id).subs)}})()")
    chk('스토리 보상: 경험치 합 600 · 광물/도면 덧셈 없음 · 기존 유형(talk · collect) · 관문/서브 없음',rw['r1']=={'xp':100,'gold':150} and rw['r2']=={'xp':400,'gold':300,'stone':4} and rw['r3']=={'xp':100,'shard':5} and rw['ty']==['talk','collect','talk'] and not rw['gate'],rw)
    # v4.45의 메인 보상 중 순번으로 붙는 것(광물 · 도면) — 스토리를 끼운 뒤에도 한 칸도 밀리지 않아야 한다
    RW445={"fb1":[5,0],"fb2":[5,1],"fb3":[7,0],"fb4":[7,0],"fb5":[7,1],"fb6":[9,0],"fb7":[9,0],"fb8":[9,1],"q1":[0,0],"q10":[10,2],"q11":[5,0],"q12":[10,2],"q13":[0,0],"q14":[7,0],"q15":[7,1],"q16":[14,2],"q17":[7,0],"q18":[7,1],"q19":[14,2],"q2":[5,0],"q20":[7,0],"q21":[14,2],"q22":[0,0],"q23":[0,0],"q24":[9,1],"q25":[9,0],"q26":[9,1],"q27":[18,2],"q28":[9,0],"q29":[9,1],"q3":[5,1],"q30":[18,2],"q31":[9,0],"q32":[18,2],"q33":[0,0],"q4":[5,0],"q5":[5,1],"q6":[10,2],"q7":[5,1],"q8":[5,0],"q9":[5,1]}
    now=J("Object.fromEntries(__g.QUESTS.filter(q=>!q.story).map(q=>[q.id,[q.rw.ore||0,q.rw.dsg||0]]))")
    par=[k for k in RW445 if now.get(k)!=RW445[k]]
    chk('기존 퀘스트 41개의 순번 보상(광물 · 도면)이 v4.45와 같다 — v4.83에서 자리를 옮긴 fb3 · fb6과 그 사이 퀘스트(도면 홀짝)만 다름',set(par)<=set(['fb3','fb6','q13','q14','q15','q22','q23','q24','q25','q26']) and len(now)==41,par)
    chk('관문 q12의 조건에 gr1이 없다(선택 서브) · fb2는 여전히 q10 보스 · q11 → fb2 → q12 → fb3 → q13 순서',J("(()=>{const Q=__g.QUESTS,ix=id=>Q.findIndex(q=>q.id===id);return !Q[ix('q12')].subs.includes('gr1')&&Q[ix('fb2')].boss==='q10'&&ix('fb2')===ix('q11')+1&&ix('q12')===ix('fb2')+1&&ix('fb3')===ix('q12')+1&&ix('q13')===ix('fb3')+1&&Q[ix('q13')].unlock==='kardo'})()"))
    chk('q11 서브 끝에 첫 균열 탐사(gr1)',J("__g.QUESTS.find(q=>q.id==='q11').subs.join()")=='ex4,gc3,gc4,gr1' and J("__g.SUBQ.gr1.grow==='rift'&&__g.SUBQ.gr1.n===10&&__g.SUBQ.gr1.giver==='hans'"))
    # 2) 잠김: 스토리 전에는 Lv가 돼도 닫혀 있다
    J("__g.S.autoQ=false;__g.S.lv=13;__g.S.hpPot=20;__g.S.mpPot=20;__g.S.gold=3000;__g.step(25,.05)")
    lk=J("({key:__g.riftKey(),open:__g.riftOpen(),lock:document.getElementById('bRift').classList.contains('lock'),t:document.getElementById('bRift').title,msg:__g.riftLockMsg()})")
    chk('스토리 전: 열쇠 없음 · 닫힘 · 메뉴 버튼 잠김 · 안내에 「호수의 주인」',not lk['key'] and not lk['open'] and lk['lock'] and '호수의 주인' in lk['msg'] and '닫혀 있다' in lk['t'],lk)
    J("__g.riftEnter(true)");chk('입장 시도 → 안내만(입장 · 이동 없음)',J("!__g.rift&&!__g.traveling&&__g.MAPID==='rowen'") and '닫혀 있다' in J(TOAST))
    J("__g.openRift()");pg.wait_for_timeout(60);chk('메뉴 [균열] → 창 대신 안내',J("!__g.modal"))
    J("__g.openWay()");pg.wait_for_timeout(80)
    row=J("(()=>{const r=document.querySelector('.si.rift');if(!r)return null;const b=r.querySelector('button');return {t:r.textContent,dis:b.disabled,bt:b.textContent}})()")
    chk('표석 창 균열 줄: 잠김 · 스토리 안내',row and row['dis'] and row['bt']=='잠김' and '닫혀 있다' in row['t'],row)
    pg.screenshot(path=f"{OUT}/riftstory446_lock.png");J("document.querySelector('#dlgA button')&&[...document.querySelectorAll('#dlgA button')].pop().click()")
    # 3) q10을 막 끝낸 상태에서 자동 진행으로 스토리 완주
    J(f"(()=>{{const g=__g,S=g.S;S.qi={IDX}('rq1');S.qs='avail';S.qn=0;for(const id of ['sb3','sb4','rp2','ht1','sd1','sd2','sd3','sb1','sb2','gc1','gc2','sd4','gc3','gc4'])S.sq[id]={{st:'clear',n:0}};/* q11의 다른 서브는 끝낸 것으로 — gr1만 본다 */S.st={{str:40,vit:60,dex:20,int:10}};g.player.hp=g.pStats().hp;S.autoQ=true;g.autoNext();}})()")
    ok=run(f"__g.S.qi==={IDX}('rq2')&&__g.S.qs==='active'",120,20)
    chk('rq1 「갈라진 안개」: 오르빈 → 한스 대화로 완료 · rq2 수락',ok,J("({qi:__g.S.qi,qs:__g.S.qs,nav:__g.nav&&__g.nav.label})"))
    chk('rq1~rq3 중 안내: 지금 메인 퀘스트 이름',('시간의 조각' in J("__g.riftLockMsg()")) and J("!__g.riftKey()"),J("__g.riftLockMsg()"))
    J("__g.setQTab('all');__g.step(2,.05)");tr=J("[...document.querySelectorAll('.qe')].map(e=>e.textContent).join(' | ')")
    chk("트래커에 '시간의 조각 0/6'",'시간의 조각' in tr,tr[:160])
    J("__g.render()");pg.screenshot(path=f"{OUT}/riftstory446_rq2.png")
    seenRift=[False]
    def run2(cond,n,k=20):
        for i in range(n):
            if J("__g.traveling"):pg.wait_for_function("!__g.traveling",timeout=90000)
            J(f"__g.player.hp=Math.max(__g.player.hp,__g.pStats().hp*.6);__g.step({k},.05)")
            if J("!!__g.rift||__g.MAPID==='rift'"):seenRift[0]=True
            if J("!__g.traveling&&("+cond+")"):return True
        return False
    ok=run2(f"__g.S.qi==={IDX}('rq3')",400)
    chk('rq2 「시간의 조각」: 안개 호숫가 물방울슬라임에게서 6개 수집 → 한스',ok,J("({qi:__g.S.qi,qs:__g.S.qs,qn:__g.S.qn,nav:__g.nav&&__g.nav.label,hunt:__g.hunt&&__g.hunt.zone,dead:__g.player.dead})"))
    ok=run2(f"__g.S.qi>{IDX}('rq3')",200,4)
    st=J("({key:__g.riftKey(),open:__g.riftOpen(),ban:document.getElementById('banT').textContent,lock:document.getElementById('bRift').classList.contains('lock'),glow:document.getElementById('bRift').classList.contains('glow'),msg:"+TOAST+",rift:!!__g.rift,auto:__g.S.autoQ})")
    chk('rq3 「균열의 문」 완료 → 균열 개방(배너 · 잠금 해제 · 버튼 반짝 · 안내)',ok and st['key'] and st['open'] and '시간의 균열이 열렸다' in st['ban'] and not st['lock'] and st['glow'] and '시간의 균열 개방' in st['msg'],st)
    J("__g.render()");pg.screenshot(path=f"{OUT}/riftstory446_open.png")
    ok=run2(f"__g.S.qi==={IDX}('q11')&&__g.S.qs==='active'&&__g.S.sq.gr1&&__g.S.sq.gr1.st==='active'",300)
    chk('자동 진행: 다음 메인 q11 수락 · 첫 균열 탐사(gr1)는 받기만',ok,J("({qi:__g.S.qi,qs:__g.S.qs,gr1:__g.S.sq.gr1,nav:__g.nav&&__g.nav.label})"))
    run2("false",40)
    chk('자동 진행은 균열에 들어가지 않는다(스토리 내내 · 개방 뒤에도)',not seenRift[0] and J("!__g.rift&&__g.MAPID!=='rift'") and J("__g.S.sq.gr1.st==='active'"),seenRift)
    chk('버튼 반짝은 6초 뒤 꺼진다',J("!document.getElementById('bRift').classList.contains('glow')"))
    # 4) 첫 균열 탐사: 균열 안 처치 10
    J("__g.S.autoQ=false;__g.cancelNav();__g.step(2,.05)")
    gg=J("__g.growthGoal(__g.SUBQ.gr1,__g.S.sq.gr1)");chk("성장 목표 문구 '균열 몬스터 처치 0/10'",'균열 몬스터 처치' in gg and '/10' in gg,gg)
    J("__g.S.hpPot=20");R.enter()
    J("(()=>{const g=__g;for(let i=0;i<10;i++){const m=g.mobs.find(x=>x.rift&&!x.dead);g.killMob(m);}g.growthTick();})()")
    chk('균열 안 10처치 → gr1 완료(한스에게 보상)',J("__g.S.sq.gr1.st")=='done' and J("__g.S.riftK")>=10,J("__g.S.sq.gr1"))
    R.leave()
    # 5) 세이브 이전 — 옛 순번(qv 2 = v4.45 · 없음 = v4.18 이전)을 id로 다시 찾는다
    mg=J("""(()=>{const g=__g,Q=g.QUESTS,ix=id=>Q.findIndex(q=>q.id===id),M=o=>{g.migrateQi(o);return o;},id=o=>o.qi<Q.length?Q[o.qi].id:'END';
      const a=M({qi:5,qv:2,sq:{}}),b=M({qi:5,qv:2,riftK:30,sq:{}}),c=M({qi:10,qv:2,qs:'active',sq:{}}),d=M({qi:11,qv:2,qs:'avail',sq:{}}),e=M({qi:11,qv:2,qs:'active',sq:{sd4:{st:'active',n:3}}}),
        f=M({qi:20,qv:2,sq:{}}),h=M({qi:41,qv:2,sq:{}}),o1=M({qi:9,sq:{}}),o2=M({qi:33,sq:{}}),n=M({qi:0,sq:{}}),k=M({qi:11,qv:2,qs:'avail',sq:{gr1:{st:'clear',n:10}}});
      const tw={qi:20,qv:2,sq:{}};M(tw);const q1=tw.qi;M(tw);
      return {a:[id(a),a.qv,!!a.riftKey,!!a.riftNote],b:[id(b),!!b.riftKey,!!b.riftNote],c:[id(c),!!c.riftKey,!!c.riftNote],d:[id(d),!!d.riftNote,!!d.sq.gr1],e:[id(e),!!e.riftNote,e.sq.gr1],
        f:[id(f),g.QORDER_445[20],!!f.riftNote,f.sq.gr1],h:[h.qi,Q.length],o1:id(o1),o2:[o2.qi,o2.qv],n:[n.qi,n.qv,!!n.riftNote,!!n.riftKey],k:k.sq.gr1.st,tw:[q1,tw.qi]}})()""")
    chk('q10 전 세이브: 같은 퀘스트 · qv 4 · 닫힘',mg['a']==['q6',4,False,False],mg['a'])
    chk('q10 전인데 균열을 써 본 세이브(riftK>0): riftKey로 계속 열림',mg['b']==['q6',True,False],mg['b'])
    chk('q10 진행 중 세이브: q10 그대로 · 닫힘(스토리를 정상 진행)',mg['c']==['q10',False,False],mg['c'])
    chk('q11을 아직 안 받은 세이브: q11 그대로(스토리 건너뜀 = 열림 알림) · gr1은 q11 수락 때',mg['d']==['q11',True,False],mg['d'])
    chk('q11 진행 중 세이브: 열림 · gr1 받을 수 있게 추가',mg['e'][0]=='q11' and mg['e'][1] and mg['e'][2]=={'st':'avail','n':0},mg['e'])
    chk('q11을 지난 세이브: 같은 id · 열림 · gr1 추가',mg['f'][0]==mg['f'][1] and mg['f'][2] and mg['f'][3]=={'st':'avail','n':0},mg['f'])
    chk('전부 끝낸 세이브 → 끝(QUESTS.length)',mg['h'][0]==mg['h'][1],mg['h'])
    chk('더 옛 세이브(qv 없음): 9번 → q10 · 33번(끝) → 끝 · qv 4',mg['o1']=='q10' and mg['o2']==[44,4],[mg['o1'],mg['o2']])
    chk('새 세이브(qi 0): q1 · 알림 없음',mg['n']==[0,4,False,False],mg['n'])
    chk('이미 있는 gr1은 건드리지 않음 · 두 번 이전해도 밀리지 않음',mg['k']=='clear' and mg['tw'][0]==mg['tw'][1],[mg['k'],mg['tw']])
    # 6) 이어하기 왕복: v4.45 세이브(q12 진행 중 = 옛 13번)
    J("__g.save()");sv=json.loads(J("localStorage.getItem('rowen-mmo-v4')"))
    old=dict(sv);old.update({'qv':2,'qi':13,'qs':'active','qn':0,'riftK':0,'lv':16,'map':'rowen','x':960,'y':1700});old.pop('riftKey',None);old.pop('riftNote',None);old['sq']={k:v for k,v in sv['sq'].items() if k!='gr1'}
    chk('옛 순번 13 = q12(확인)',J("__g.QORDER_445[13]")=='q12')
    pg.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",json.dumps(old));pg.reload();pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.click('#btnCont');pg.wait_for_timeout(600)
    r=J("({id:__g.curQ().id,qv:__g.S.qv,qs:__g.S.qs,key:__g.riftKey(),open:__g.riftOpen(),gr1:__g.S.sq.gr1,note:__g.S.riftNote})")
    chk('이어하기: 같은 퀘스트(q12) · qv 4 · 균열 열림 · gr1 추가',r['id']=='q12' and r['qv']==4 and r['qs']=='active' and r['key'] and r['open'] and r['gr1'] and r['gr1']['st']=='avail',r)
    pg.wait_for_timeout(2700);msg=J(TOAST)
    chk("한 번 알림 '원정대는 이미 시간의 균열을 열었다'",'이미 시간의 균열을 열었다' in msg and r['note'] is None,msg[-160:])
    pg.screenshot(path=f"{OUT}/riftstory446_cont.png")
    J("__g.save()");sv2=json.loads(J("localStorage.getItem('rowen-mmo-v4')"))
    chk('다시 저장: qv 4 · 알림 표시 지워짐',sv2.get('qv')==4 and 'riftNote' not in sv2 and sv2['qi']==J(f"{IDX}('q12')"),[sv2.get('qv'),sv2.get('qi')])
    chk('JS 오류 없음',not errs,errs[:3])
    b.close()
print(f"{sum(res)}/{len(res)}");sys.exit(0 if all(res) else 1)
