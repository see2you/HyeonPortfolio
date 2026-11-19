"""v4.83 G10-r1 지역 단위 퀘스트 루트 (지시서 §G10 · 현 요청)
1) 메인 순서에서 전투 퀘스트의 지역이 바뀌는 횟수 = 2(로웬 → 카르도 → 에르나) · 주는 사람 / 보고 NPC도 같은 규칙(엔딩 q33 제외) · 다음 지역으로 떠나는 대화(q13 · q23)는 지금 지역 NPC → 다음 지역 NPC
2) 재토벌 fb3 = q12 바로 뒤 · fb6 = q21 바로 뒤 · 총 44개 그대로
3) 세이브 이전(qv 3 → 4): 옛 순번 6가지 + 옛 자리의 fb3 · fb6 + 끝낸 세이브 + qv 2 세이브 → 다음 퀘스트가 맞고, 건너뛴 재토벌 보상
4) 지역 전환 알림 · 이어하기 오류 없음 · 버전 · 화면(shots/v483_*.png)"""
import os,sys,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath('rowen_mmo_local.html');os.makedirs('shots',exist_ok=True);N=[0,0]
def chk(c,msg):
    N[0]+=1;N[1]+=0 if c else 1;print(('ok  ' if c else 'FAIL'),msg)
OLD=['q1','q2','q3','q4','q5','q6','q7','q8','q9','fb1','q10','rq1','rq2','rq3','q11','fb2','q12','q13','q14','q15','fb3','q16','q17','q18','fb4','q19','q20','fb5','q21','q22','q23','q24','q25','q26','fb6','q27','q28','q29','fb7','q30','q31','fb8','q32','q33']
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart',timeout=60000);pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    ver=pg.evaluate("document.body.innerText.match(/v4\\.\\d+/)[0]");chk(ver.startswith('v4.'),'버전 표시 '+ver)
    Q=pg.evaluate("""()=>{const g=__g,zm=z=>g.ZALL[z].map,nm=n=>g.NALL[n]&&g.NALL[n].map;return g.QUESTS.map(q=>({id:q.id,type:q.type,map:q.zone?zm(q.zone):null,giver:nm(q.giver),npc:q.npc?nm(q.npc):null,unlock:q.unlock||null}));}""")
    ids=[q['id'] for q in Q];chk(len(Q)==44 and sorted(ids)==sorted(OLD),'메인 44개 · 같은 퀘스트')
    seq=[];
    for q in Q:
        if q['map'] and (not seq or seq[-1]!=q['map']):seq.append(q['map'])
    chk(seq==['rowen','kardo','erna'],'전투 퀘스트 지역 순서 = 로웬 → 카르도 → 에르나(바뀜 2번) '+' → '.join(seq))
    # 주는 사람 · 보고 NPC: 지역이 뒤로 가지 않는다(엔딩 제외)
    R={'rowen':0,'kardo':1,'erna':2};cur=0;bad=[]
    for q in Q[:-1]:
        for k in ('giver','map','npc'):
            m=q[k]
            if m is None:continue
            if R[m]<cur:bad.append((q['id'],k,m))
            cur=max(cur,R[m])
    chk(not bad,'주는 사람 · 사냥터 · 보고 NPC가 지난 지역으로 되돌아가지 않는다(엔딩 q33 제외) '+str(bad))
    last=Q[-1];chk(last['id']=='q33' and last['giver']=='erna' and last['npc']=='rowen','엔딩 q33만 로웬 귀환')
    q13=Q[ids.index('q13')];q23=Q[ids.index('q23')];q22=Q[ids.index('q22')]
    chk(q13['giver']=='rowen' and q13['npc']=='kardo' and q13['unlock']=='kardo','q13: 로웬 NPC → 카르도 NPC(카르도 개방)')
    chk(q22['giver']=='kardo' and q22['npc']=='kardo','q22 승전보: 카르도 안에서 보고')
    chk(q23['giver']=='kardo' and q23['npc']=='erna' and q23['unlock']=='erna','q23: 카르도 NPC → 에르나 NPC(에르나 개방)')
    chk(ids.index('fb3')==ids.index('q12')+1 and ids.index('q13')==ids.index('fb3')+1,'fb3 = q12 바로 뒤 · q13 바로 앞')
    chk(ids.index('fb6')==ids.index('q21')+1 and ids.index('q22')==ids.index('fb6')+1,'fb6 = q21 바로 뒤 · q22 바로 앞')
    fb=pg.evaluate("['fb3','fb6'].map(i=>{const q=__g.QUESTS.find(x=>x.id===i);return [__g.NALL[q.giver].map,__g.ZALL[q.zone].map,q.title]})")
    chk(fb[0][0]=='rowen'==fb[0][1] and fb[1][0]=='kardo'==fb[1][1],'재토벌 주는 사람과 사냥터가 같은 지역 '+str(fb))
    # 3) 세이브 이전
    pg.evaluate("__g.save&&__g.save()");base=json.loads(pg.evaluate("localStorage.getItem('rowen-mmo-v4')"))
    chk(base.get('qv')==4,'새 게임 세이브 qv = 4')
    def cont(mut):
        s=json.loads(json.dumps(base));s['maps']=['rowen','kardo','erna'];s['lv']=30;mut(s)
        pg2=b.new_page(viewport={'width':1280,'height':720});e2=[];pg2.on('pageerror',lambda e:e2.append(str(e)))
        pg2.goto('file://'+HTML);pg2.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",json.dumps(s));pg2.reload();pg2.wait_for_function('window.__ready===true',timeout=120000);pg2.click('#btnCont',timeout=60000);pg2.wait_for_timeout(500);pg2.evaluate("window.requestAnimationFrame=()=>0;__g.step(10,.05)")
        r=pg2.evaluate("({id:(__g.QUESTS[__g.S.qi]||{}).id||null,qs:__g.S.qs,qn:__g.S.qn,qv:__g.S.qv,gold:__g.S.gold,stone:__g.S.stone,n:__g.QUESTS.length,qi:__g.S.qi})");r['errs']=e2;return r,pg2
    def old(i,qs='active',qn=0):
        def f(s):s['qv']=3;s['qi']=i;s['qs']=qs;s['qn']=qn;s['gold']=1000;s['stone']=10
        return f
    rw=pg.evaluate("['fb3','fb6'].map(i=>__g.QUESTS.find(x=>x.id===i).rw)")
    cases=[(OLD.index('q12'),'q12',0),(OLD.index('q13'),'q13',1),(OLD.index('q15'),'q15',1),(OLD.index('fb3'),'q16',1),(OLD.index('q16'),'q16',0),(OLD.index('q21'),'q21',0),(OLD.index('q22'),'q22',2),(OLD.index('q23'),'q23',2),(OLD.index('q26'),'q26',2),(OLD.index('fb6'),'q27',2),(OLD.index('q27'),'q27',0),(OLD.index('q5'),'q5',0)]
    for i,want,pay in cases:
        r,p2=cont(old(i));p2.close()
        g=1000+(rw[0]['gold'] if pay==1 else rw[1]['gold'] if pay==2 else 0);st=10+(rw[0]['stone'] if pay==1 else rw[1]['stone'] if pay==2 else 0)
        chk(r['id']==want and r['qv']==4 and not r['errs'] and r['gold']==g and r['stone']==st,'옛 순번 %d(%s) → %s · 건너뛴 재토벌 보상 %s (골드 %d · 강화석 %d) %s'%(i,OLD[i],r['id'],['없음','fb3','fb6'][pay],r['gold'],r['stone'],r['errs'][:1]))
    r,p2=cont(old(OLD.index('fb3'),'done',1));p2.close();chk(r['id']=='q16' and r['qs']=='avail' and r['qn']==0,'옛 fb3을 끝내고 보고 전이던 세이브 → q16 받기 전 상태 '+json.dumps(r)[:120])
    r,p2=cont(old(44,'avail'));p2.close();chk(r['id'] is None and r['qi']==44,'끝낸 세이브(qi 44) 그대로')
    def v2(s):s['qv']=2;s['qi']=17;s['qs']='active';s['qn']=0   # QORDER_445[17]='fb3'
    r,p2=cont(v2);p2.close();chk(r['id']=='q16' and not r['errs'],'qv 2 세이브의 fb3 자리 → q16 '+str(r['id']))
    r,p2=cont(old(OLD.index('q12')));chk(r['id']=='q12','다시 이어하기(이미 qv 4) 변화 없음') if False else None
    # 이미 qv 4인 세이브는 건드리지 않는다
    def v4(s):s['qv']=4;s['qi']=ids.index('fb3');s['qs']='active';s['qn']=0;s['gold']=1000
    p2.close();r,p2=cont(v4);chk(r['id']=='fb3' and r['gold']==1000,'qv 4 세이브(fb3 진행 중)는 그대로');
    # 4) 지역 전환 알림 + 화면: q13을 받으면 '로웬 원정 완료'
    p2.evaluate("(()=>{const g=__g,S=g.S;S.maps=['rowen'];S.qi=g.QUESTS.findIndex(q=>q.id==='q13');S.qs='avail';g.acceptQuest();})()");p2.wait_for_timeout(300)
    bt=p2.evaluate("[document.getElementById('banT').textContent,document.getElementById('banS').textContent,__g.S.maps.includes('kardo')]")
    chk('로웬' in bt[0] and '원정 완료' in bt[0] and '카르도' in bt[1] and bt[2],'q13 수락 → 배너 「%s」 / 「%s」 · 카르도 개방'%(bt[0],bt[1]))
    p2.evaluate("__g.snap&&__g.snap();__g.render()");p2.screenshot(path='shots/v483_지역전환.png')
    p2.evaluate("(()=>{const g=__g,S=g.S;S.qi=g.QUESTS.findIndex(q=>q.id==='fb3');S.qs='active';S.qn=0;g.step(5,.05);})()");p2.wait_for_timeout(200);p2.evaluate("__g.snap&&__g.snap();__g.render()");p2.screenshot(path='shots/v483_fb3.png')
    vt=p2.evaluate("(()=>{const e=document.getElementById('verTag'),r=e.getBoundingClientRect();return [e.textContent,r.left,r.bottom,innerHeight]})()")
    chk(vt[0].startswith('v4.') and vt[1]<200 and vt[2]<=vt[3],'왼쪽 아래 버전 %s 화면 안'%vt[0])
    chk(not errs,'페이지 오류 없음 '+str(errs[:2]))
    b.close()
print('%d/%d ok'%(N[0]-N[1],N[0]));sys.exit(1 if N[1] else 0)
