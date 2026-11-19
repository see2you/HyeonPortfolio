"""v4.82 G2-b 능력치 빌드 정책(측정용) — growth_sim.py(STAT_POLICY)와 statpolicy482_test.py가 같이 쓴다.
window.__statPolicy(S.st) → 'str' | 'vit' | 'dex' | 'int' (그 밖의 값이면 게임 기본 REC 순환)
  allstr · vit · dex · int = 그 능력치에만
  balanced = 지시서 §G2의 구간 순서표(힘 10 → 체 10 → 힘 20 → 민 10 → 체 20 → 지 10 → 힘 30 → 민 20 → 체 30 → 힘 45 → 나머지는 가장 낮은 능력치부터)"""
POL_JS={'allstr':"()=>'str'",'vit':"()=>'vit'",'dex':"()=>'dex'",'int':"()=>'int'",
  'balanced':"(st)=>{const T=[['str',10],['vit',10],['str',20],['dex',10],['vit',20],['int',10],['str',30],['dex',20],['vit',30],['str',45]];for(const [k,v] of T)if(st[k]<v)return k;return ['str','vit','dex','int'].sort((a,b)=>st[a]-st[b])[0];}"}
