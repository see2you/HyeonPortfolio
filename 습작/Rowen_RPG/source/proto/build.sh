#!/bin/bash
# 로웬 원정기 빌드: art.js(+ monart.js 몬스터 그림) + items.js + windows.js + mmo.js + shell.html → rowen_mmo.html (단일 파일)
# THREE_JS=<three.min.js 경로> 를 주면 three.js를 인라인한 테스트용 rowen_mmo_local.html도 만든다.
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
import os
art=open('art.js').read();g=open('mmo.js').read();sh=open('shell.html').read()
for m in ('/*ART*/','/*ITEMS*/','/*MOBS*/','/*WINDOWS*/'):assert m in g,m
js=g.replace('/*ART*/',art).replace('/*ITEMS*/',open('items.js').read()).replace('/*MOBS*/',open('mobs.js').read()).replace('/*WINDOWS*/',open('windows.js').read())
assert '/*MONART*/' in js;js=js.replace('/*MONART*/',open('monart.js').read())   # 몬스터 새 도트(현의 그림) — art.js 안의 자리
open('game_full.js','w').write(js)
html=sh+js+'\n</script>\n<script data-goatcounter="https://hyeonportfolio.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>\n</body>\n</html>\n'
open('rowen_mmo.html','w').write(html)
t=os.environ.get('THREE_JS')
if t:
    cdn='<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
    open('rowen_mmo_local.html','w').write(html.replace(cdn,'<script>'+open(t).read()+'</script>'))
    print('local test html: rowen_mmo_local.html')
PY
node --check game_full.js
echo BUILT rowen_mmo.html
