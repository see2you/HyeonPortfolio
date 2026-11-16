"""균열 테스트 공통 도구 — v4.46 전용 공간(맵 'rift': 들어가기 · 나가기가 맵 이동, 비동기) · v4.47 주기적으로 열리는 한 판짜리 균열(열림 S.riftOpenT · 다음까지 S.riftCd)
   · boot(): 새 게임을 열고 rAF를 멈춘다(시간은 __g.step으로만 흐른다)  · key=True면 개방 스토리를 지난 것으로 두고(S.riftKey — 옛 세이브 보호용 값) 첫 균열을 연다
   · enter()/leave(): 들어가기 · 나가기를 부르고 맵 이동이 끝날 때까지 기다린다(닫혀 있으면 enter가 새 균열을 연다)  · wait_in()/wait_out(): 버튼으로 눌렀을 때 기다리기만
   · no_clear(): 균열의 주인을 잡아도 균열이 닫히지 않게 한다(상자 굴림을 여러 번 볼 때) — KILL_LORD가 쓴다"""
import sys,os
ARGS=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']
# 균열의 주인을 불러 잡되 균열은 닫지 않는다(rift.clear를 잠깐 세워 riftClear를 건너뛴다) — 상자 내용만 보는 테스트용
KILL_LORD="(()=>{const g=__g,m=g.riftElite();g.rift.clear=1;m.hp=1;g.killMob(m);g.rift.clear=0;return m})()"
def paths():
    html=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');out=sys.argv[2] if len(sys.argv)>2 else 'shots'
    os.makedirs(out,exist_ok=True);return html,out
def boot(p,html,key=True,viewport=None,**kw):
    b=p.chromium.launch(args=ARGS);pg=b.new_page(viewport=viewport or {'width':1280,'height':720},**kw);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+html);pg.wait_for_function('window.__ready===true',timeout=120000);pg.evaluate("localStorage.clear()")
    pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    if key:pg.evaluate("__g.S.riftKey=1;__g.step(1,.05)")  # 열쇠가 생기면 첫 균열이 바로 열린다(riftTick)
    return b,pg,errs
class Rift:
    def __init__(self,pg):self.pg=pg
    def J(self,s):return self.pg.evaluate(s)
    def wait_in(self):
        self.pg.wait_for_function("__g.MAPID==='rift'&&!__g.traveling&&!!__g.rift",timeout=90000);self.J("__g.step(2,.05)")
    def wait_out(self):
        self.pg.wait_for_function("__g.MAPID!=='rift'&&!__g.traveling",timeout=90000);self.J("__g.step(2,.05)")
    def open(self,stay=None):
        """새 균열을 연다(열려 있던 것은 버린다) — stay: 남은 유지 시간(초)"""
        self.J("__g.riftAppear()"+(";__g.S.riftOpenT=%s"%stay if stay else ""))
    def enter(self,force=True,calm=True):
        self.J("if(!__g.riftUp())__g.riftAppear();__g.closeModal();__g.riftEnter(%s)"%('true' if force else ''));self.wait_in()
        if calm:self.J("__g.mobs.forEach(m=>m.atk=0)")
    def leave(self,why='out'):
        self.J("__g.riftEnd('%s')"%why);self.wait_out()
    def kill(self,n):
        """균열 몬스터 n마리를 잡는다(살아 있는 것부터 · 다시 나올 때까지 시간을 흘려 가며) — 잡은 수를 돌려준다"""
        c=0
        for _ in range(60):
            c+=self.J("(n=>{const g=__g;let c=0;for(let i=0;i<n;i++){const m=g.mobs.find(x=>x.rift&&!x.riftBoss&&!x.dead);if(!m)break;g.killMob(m);c++;}g.mobs.forEach(m=>m.atk=0);return c})(%d)"%(n-c))
            if c>=n or self.J("__g.riftPend()||!__g.rift"):break
            self.J("__g.step(90,.05);__g.mobs.forEach(m=>m.atk=0)")
        return c
