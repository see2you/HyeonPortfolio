"""v4.46 균열 테스트 공통 도구 — 시간의 균열이 전용 공간(맵 'rift')이 되어 들어가기 · 나가기가 맵 이동(비동기)이다.
   · boot(): 새 게임을 열고 rAF를 멈춘다(시간은 __g.step으로만 흐른다)  · key=True면 개방 스토리를 지난 것으로 둔다(S.riftKey — 옛 세이브 보호용 값)
   · enter()/leave(): 들어가기 · 나가기를 부르고 맵 이동이 끝날 때까지 기다린다  · wait_in()/wait_out(): 버튼으로 눌렀을 때 기다리기만"""
import sys,os
ARGS=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']
def paths():
    html=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');out=sys.argv[2] if len(sys.argv)>2 else 'shots'
    os.makedirs(out,exist_ok=True);return html,out
def boot(p,html,key=True,viewport=None,**kw):
    b=p.chromium.launch(args=ARGS);pg=b.new_page(viewport=viewport or {'width':1280,'height':720},**kw);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+html);pg.wait_for_function('window.__ready===true',timeout=120000);pg.evaluate("localStorage.clear()")
    pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    if key:pg.evaluate("__g.S.riftKey=1")
    return b,pg,errs
class Rift:
    def __init__(self,pg):self.pg=pg
    def J(self,s):return self.pg.evaluate(s)
    def wait_in(self):
        self.pg.wait_for_function("__g.MAPID==='rift'&&!__g.traveling&&!!__g.rift",timeout=90000);self.J("__g.step(2,.05)")
    def wait_out(self):
        self.pg.wait_for_function("__g.MAPID!=='rift'&&!__g.traveling",timeout=90000);self.J("__g.step(2,.05)")
    def enter(self,force=True,calm=True):
        self.J("__g.riftEnter(%s)"%('true' if force else ''));self.wait_in()
        if calm:self.J("__g.mobs.forEach(m=>m.atk=0)")
    def leave(self,why='out'):
        self.J("__g.riftEnd('%s')"%why);self.wait_out()
