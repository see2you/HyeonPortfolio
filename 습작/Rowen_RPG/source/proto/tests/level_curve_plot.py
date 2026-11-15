"""v4.23 레벨 곡선 그래프 — growth_sim.py TRACE(jsonl)로 퀘스트 순번별 레벨을 그린다.
사용: python3 tests/level_curve_plot.py out.png trace1.jsonl [trace2.jsonl ...]
비교선: v4.22 관문 시점 레벨(시뮬레이션 기록), 목표: 각 지역 정예 퀘스트에서 사냥터 상한 레벨"""
import sys,json
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
for f in fm.findSystemFonts():
    if 'NotoSansCJK-Regular' in f: fm.fontManager.addfont(f);plt.rcParams['font.family']=fm.FontProperties(fname=f).get_name();break
OLD={6:6,11:17,14:23,19:31,23:37,26:39,33:40,37:40,40:40}   # v4.22 관문(퀘스트 번호: 레벨)
TGT={6:7,11:13,14:16,19:21,23:25,26:28,33:34,37:37,40:40}   # 사냥터 상한
out=sys.argv[1];fig,ax=plt.subplots(figsize=(9,4.6),dpi=110)
ax.axvspan(0.5,15.5,color='#e9f3e0');ax.axvspan(15.5,27.5,color='#efe7d8');ax.axvspan(27.5,41.5,color='#f6e0da')
for x,t in ((8,'로웬'),(21.5,'카르도'),(34.5,'에르나')):ax.text(x,41.2,t,ha='center',fontsize=10,color='#555')
ax.plot(list(OLD),list(OLD.values()),'o--',color='#999',label='v4.22 (관문 시점)')
ax.plot(list(TGT),list(TGT.values()),'s:',color='#2b7a3d',label='목표 (사냥터 상한)')
cols=['#c0392b','#e67e22','#8e44ad','#2980b9']
for i,fn in enumerate(sys.argv[2:]):
    q={}
    for l in open(fn):
        d=json.loads(l);q[d['qi']+1]=max(q.get(d['qi']+1,0),d['lv'])
    ks=sorted(q);ax.plot(ks,[q[k] for k in ks],'-',color=cols[i%4],lw=2,label=f'v4.23 시뮬레이션 {i+1}')
ax.set_xlim(.5,41.5);ax.set_ylim(0,43);ax.set_xlabel('메인 퀘스트 순번');ax.set_ylabel('레벨');ax.set_title('〈로웬 원정기〉 레벨 곡선 — v4.22 → v4.23');ax.grid(alpha=.3);ax.legend(loc='lower right',fontsize=9)
fig.tight_layout();fig.savefig(out);print('saved',out)
