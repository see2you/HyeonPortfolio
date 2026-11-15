"""권능 획득 퀘스트(신의 시련) 흐름: 메인 5 보상 → 시련 3개 열림 → 오르빈은 메인 6을 먼저 제안 → 시련 수락·완료 → 권능 획득·자동 장착 / 이전 세이브 이전"""
import sys,os,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html');OUT=sys.argv[2] if len(sys.argv)>2 else 'shots'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.wait_for_function('window.__ready===true',timeout=120000)
    pg.evaluate("localStorage.clear()");pg.click('#btnStart');pg.wait_for_timeout(400);pg.evaluate("window.requestAnimationFrame=()=>0")
    r={}
    r['before']=pg.evaluate("[__g.S.gods,Object.keys(__g.S.sq)]")
    pg.evaluate("__g.S.qi=4;__g.S.qs='done';__g.S.lv=6;__g.claimQuest()")
    r['after_q5']=pg.evaluate("[__g.S.gods,__g.S.sq,__g.S.god]")
    pg.evaluate("__g.openNpc('orvin')");r['orvin1']=pg.evaluate("__g.modal&&document.getElementById('dlgB').innerText.split('\\n').slice(-6).join(' | ')")
    pg.evaluate("__g.acceptQuest();__g.openNpc('orvin')");r['orvin2']=pg.evaluate("__g.modal&&document.getElementById('dlgB').innerText.split('\\n')[0]")
    pg.evaluate("__g.acceptSub('ga');__g.S.sq.ga.st='done';__g.openNpc('orvin')");pg.evaluate("__g.claimSub('ga')")
    r['after_trial']=pg.evaluate("[__g.S.gods,__g.S.god,__g.S.sq.ga.st]")
    pg.evaluate("__g.closeWin&&__g.closeWin();__g.openGods()");pg.wait_for_timeout(150);pg.evaluate("__g.step(1,.05);__g.render()");pg.screenshot(path=f'{OUT}/gods.png')
    OLD={"lv":22,"qi":16,"qs":"active","god":"zeus","godLv":{"zeus":3,"athena":1,"artemis":1},"sq":{},"maps":["rowen","kardo"],"st":{"str":10,"vit":10,"dex":5,"int":5},"sk":{},"books":{},"wlv":2,"alv":1}
    pg.evaluate("s=>{localStorage.setItem('rowen-mmo-v4',s)}",json.dumps(OLD));pg.reload();pg.wait_for_function('window.__ready===true',timeout=120000);pg.click('#btnCont');pg.wait_for_timeout(500)
    r['migrated']=pg.evaluate("[__g.S.gods,__g.S.god,__g.S.sq]")
    for k,v in r.items():print(k,json.dumps(v,ensure_ascii=False)[:300])
    print('ERRORS',errs or 'none');b.close()
