"""v4.7 세이브 → v4.8 이어하기: 무기·갑옷 강화 단계가 장비 아이템으로, 배운 스킬이 슬롯으로 옮겨지는지"""
import sys,os,json
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else 'rowen_mmo_local.html')
OLD={"map":"rowen","maps":["rowen","kardo"],"lv":22,"xp":100,"gold":5000,"hpPot":12,"mpPot":4,"scroll":3,"autoBuy":True,"autoRet":False,"wlv":6,"alv":3,"wfail":1,"afail":0,"stone":14,"shard":30,
 "st":{"str":20,"vit":15,"dex":12,"int":8},"sp":0,"kp":1,"sk":{"whirl":5,"dash":4,"star":5,"roar":3,"quake":2},"books":{"dash":True,"roar":True,"quake":True},"autoGrow":False,
 "god":"zeus","godLv":{"zeus":3,"athena":1,"artemis":1},"qi":16,"qs":"active","qn":0,"sq":{},"rep":None,"autoQ":False,"autoPot":True,"x":960,"y":1700,"kills":300,"lastSeen":0,"aiZone":None,"cfg":{"vol":True,"volK":0.45},"zoom":1}
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+HTML);pg.evaluate("s=>localStorage.setItem('rowen-mmo-v4',s)",json.dumps(OLD));pg.reload()
    pg.wait_for_function('window.__ready===true',timeout=120000);pg.click('#btnCont');pg.wait_for_timeout(600)
    r=pg.evaluate("""(()=>{const S=__g.S;return {items:S.items.map(i=>__g.itemName(i)),eq:S.eq,slots:S.slots,bag:S.bag,cfg:S.cfg,atk:__g.pStats().atk,cp:__g.cpOf()}})()""")
    print(json.dumps(r,ensure_ascii=False));print('ERRORS',errs or 'none');b.close()
