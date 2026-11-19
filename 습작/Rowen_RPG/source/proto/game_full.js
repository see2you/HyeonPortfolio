'use strict';
(function(){
const GAME_VER='v4.83';{const vt=document.getElementById('verTag');if(vt)vt.textContent=GAME_VER;}
let W=480,H=270;
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const cx2=(c,smooth=false)=>{const g=c.getContext('2d');g.imageSmoothingEnabled=smooth;return g;};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function hash2(x,y){let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const a=hash2(xi,yi),b=hash2(xi+1,yi),c=hash2(xi,yi+1),d=hash2(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function rng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function hx(h){h=h.replace('#','');return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function toHex(r,g,b){return '#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');}
function shade(h,a){let [r,g,b]=hx(h);if(a<0){const k=1+a;r=r*k-(-a)*12;g=g*k-(-a)*5;b=b*k+(-a)*16;}else{r+=(255-r)*a;g+=(255-g)*a*.95;b+=(255-b)*a*.75;}return toHex(r,g,b);}
function painter(g,ox=0,oy=0){return (x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x+ox,y+oy,w,h);};}
function pe(g,cx,cy,rx,ry){for(let dy=-ry;dy<=ry;dy++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(dy*dy)/((ry+.5)*(ry+.5)))));if(w>0)g.fillRect(cx-w,cy+dy,w*2,1);}}
function finalize(c,{rim=true,outline=true}={}){
  const g=c.getContext('2d'),w=c.width,h=c.height,img=g.getImageData(0,0,w,h),d=img.data,s=new Uint8ClampedArray(d);
  const A=(x,y)=>(x<0||y<0||x>=w||y>=h)?0:s[(y*w+x)*4+3];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
    if(s[i+3]>200){if(rim&&(A(x-1,y)<10||A(x,y-1)<10)){d[i]+=(255-d[i])*.22;d[i+1]+=(255-d[i+1])*.17;d[i+2]+=(255-d[i+2])*.08;}}
    else if(outline&&s[i+3]<10){let j=-1;
      if(A(x,y+1)>200)j=((y+1)*w+x)*4;else if(A(x+1,y)>200)j=(y*w+x+1)*4;else if(A(x-1,y)>200)j=(y*w+x-1)*4;else if(A(x,y-1)>200)j=((y-1)*w+x)*4;
      if(j>=0){d[i]=s[j]*.4+10;d[i+1]=s[j+1]*.34+6;d[i+2]=s[j+2]*.44+22;d[i+3]=255;}}}
  g.putImageData(img,0,0);return c;}

/* ================= characters ================= */
const CHARS={
  hero:{name:'나',skin:'#f6d0aa',hair:'#8c6c52',hairStyle:'wolf',cuteEyes:true,feather:['#c8502e','#e8784a','#f4e6c8','#c9a24a'],cloth:'#4f86d6',pants:'#ece2c6',boots:'#8a5a3a',belt:'#7a5434',accent:'#e6c05a',iris:'#8a5a34'},
  hans:{name:'경비병 한스',skin:'#e7b88f',hair:'#3a2a22',hairStyle:'short',cloth:'#7c8698',hat:'#a3acb6',hatType:'helm',accent:'#c0392b',pants:'#3a3f4a',boots:'#3b2a20',belt:'#3a2a22'},
  mira:{name:'상인 미라',skin:'#f5d0ad',hair:'#a2462e',hairStyle:'long',cloth:'#5b8a5a',apron:'#efe4cc',pants:'#5a4636',accent:'#e6c05a',iris:'#5a8a4a'},
  orvin:{name:'장로 오르빈',skin:'#e9c3a0',hair:'#e8e4dc',hairStyle:'swept',cloth:'#6a4d8c',robe:true,beard:'#efebe3',boots:'#4a3a32',iris:'#6a6a8a'},
  lia:{name:'리아',skin:'#f7d6b8',hair:'#e8c25a',hairStyle:'tails',cloth:'#d97a8a',dress:true,accent:'#fff4f4',boots:'#8a4a3a',iris:'#3a7ab0'},
  teo:{name:'농부 테오',skin:'#d9a57c',hair:'#5a3a24',hairStyle:'bald',cloth:'#7a9a4a',hat:'#e2c27a',hatType:'straw',accent:'#a0503a',pants:'#5b4a3a',boots:'#5a3a24'},
  bram:{name:'대장장이 브람',skin:'#d9a07a',hair:'#3a2418',hairStyle:'bald',cloth:'#8a6a50',apron:'#5a3a26',pants:'#3a302a',boots:'#2a2222',belt:'#3a2418',beard:'#4a2c1a',iris:'#5a4a3a'},
  nell:{name:'여관 주인 넬',skin:'#f0c8a4',hair:'#6a3a5a',hairStyle:'long',cloth:'#b8603a',apron:'#f2ead8',pants:'#5a3a30',iris:'#7a4a6a'},
  fin:{name:'소년 핀',skin:'#f2c9a0',hair:'#d0903a',hairStyle:'short',cloth:'#3a8aa0',pants:'#5a4a3a',boots:'#6a4a2a',iris:'#3a6a8a'}
};
function charColors(s){const C={};
  C.skin=s.skin;C.skinD=shade(s.skin,-.18);C.hair=s.hair;C.hairD=shade(s.hair,-.28);C.hairL=shade(s.hair,.3);
  C.cloth=s.cloth;C.clothD=shade(s.cloth,-.28);C.clothL=shade(s.cloth,.2);
  C.pants=s.pants||'#4a3b34';C.pantsD=shade(C.pants,-.25);C.boots=s.boots||'#5a3a26';C.bootsD=shade(C.boots,-.3);C.bootsL=shade(C.boots,.25);
  C.belt=s.belt||'#6b4426';C.accent=s.accent||'#e0b552';C.eye='#2a2140';C.iris=s.iris||'#4a6fa8';C.blush='#ec9c8c';C.mouth='#a8584f';
  if(s.hat){C.hat=s.hat;C.hatD=shade(s.hat,-.3);C.hatL=shade(s.hat,.3);}
  if(s.apron){C.apron=s.apron;C.apronD=shade(s.apron,-.18);}
  if(s.beard){C.beard=s.beard;C.beardD=shade(s.beard,-.2);}
  return C;}
function legsF(p,s,C,x,lift,right){
  const bot=31-lift;
  if(s.robe){p(x,29-lift,3,3,right?C.bootsD:C.boots);return;}
  if(s.dress){p(x+(right?0:1),27,2,Math.max(1,bot-28),C.skin);p(x,bot-1,3,2,C.boots);return;}
  p(x,24,3,bot-26,C.pants);p(x+2,24,1,bot-26,C.pantsD);p(x,bot-2,3,3,C.boots);p(x+2,bot-2,1,3,C.bootsD);p(x,bot-2,1,1,C.bootsL);}
function bodyF(p,s,C,dy){
  const bb=s.robe?28:26;
  for(let y=17;y<=bb;y++){let x0=5,x1=14;if(y===17){x0=6;x1=13;}
    if(s.dress&&y>=23){const e=y===23?1:2;x0-=e;x1+=e;}
    if(s.robe&&y>=25){x0=4;x1=15;}
    p(x0,y+dy,x1-x0+1,1,C.cloth);p(x1-1,y+dy,2,1,C.clothD);p(x0,y+dy,1,1,C.clothL);}
}
let NOARM=null;
function armsF(p,C,dy,sw){const arm=(x,o)=>{if(NOARM===x)return;p(x,18+dy+o,2,5,C.cloth);p(x+1,18+dy+o,1,5,C.clothD);p(x,23+dy+o,2,2,C.skin);};arm(3,sw>0?1:0);arm(15,sw<0?1:0);}
function hatF(h,s,C,back){
  if(s.hatType==='helm'){h(5,1,10,1,C.hat);h(4,2,12,2,C.hat);h(3,4,14,4,C.hat);h(3,8,14,1,C.hatD);h(5,2,3,1,C.hatL);h(4,4,2,3,C.hatL);h(13,4,4,4,C.hatD);h(9,0,2,2,C.accent);if(back){h(3,8,14,4,C.hat);h(13,8,4,4,C.hatD);}}
  if(s.hatType==='straw'){h(6,1,8,1,C.hat);h(5,2,10,4,C.hat);h(5,5,10,1,C.accent);h(1,6,18,2,C.hat);h(1,7,18,1,C.hatD);h(7,2,3,1,C.hatL);h(12,2,3,4,C.hatD);}
}
function front(p,s,C,dy,lL,lR,sw){
  const st=s.hairStyle,h=(x,y,w,hh,c)=>p(x,y+dy,w,hh,c);
  if(st==='long'){h(3,9,2,12,C.hairD);h(15,9,2,12,C.hairD);}
  if(st==='halfup'){h(3,9,2,8,C.hairD);h(15,9,2,8,C.hairD);}
  legsF(p,s,C,7,lL,false);legsF(p,s,C,11,lR,true);
  bodyF(p,s,C,dy);
  h(8,17,4,1,C.skinD);
  if(s.dress)h(5,21,10,1,C.accent);
  else if(!s.robe){h(5,23,10,1,C.belt);h(9,23,2,1,C.accent);}
  else{h(6,22,8,1,shade(C.cloth,-.4));}
  if(s.apron){h(7,19,6,8,C.apron);h(11,19,2,8,C.apronD);h(7,17,1,2,C.apron);h(12,17,1,2,C.apron);}
  armsF(p,C,dy,sw);
  if(s.scarf){h(6,17,8,2,s.scarf);h(6,18,8,1,shade(s.scarf,-.25));h(11,19,2,3,s.scarf);h(12,19,1,3,shade(s.scarf,-.25));}
  h(6,4,8,1,C.skin);h(5,5,10,1,C.skin);h(4,6,12,8,C.skin);h(5,14,10,1,C.skin);h(6,15,8,1,C.skin);h(7,16,6,1,C.skinD);h(15,7,1,6,C.skinD);h(14,14,1,1,C.skinD);h(13,15,1,1,C.skinD);
  if(st==='bald'){h(3,8,2,4,C.hair);h(15,8,2,4,C.hairD);}
  else{
    h(5,2,10,1,C.hair);h(4,3,12,1,C.hair);h(3,4,14,4,C.hair);h(13,3,2,1,C.hairD);h(14,4,3,4,C.hairD);h(6,3,4,1,C.hairL);h(5,4,3,1,C.hairL);
    if(st==='swept'){h(3,8,3,2,C.hair);h(14,8,3,2,C.hairD);h(3,10,2,3,C.hair);h(15,10,2,3,C.hairD);}
    else{h(3,8,3,1,C.hair);h(8,8,4,1,C.hair);h(14,8,3,1,C.hairD);h(3,9,2,1,C.hair);h(9,9,2,1,C.hair);h(15,9,2,1,C.hairD);
      const sl=st==='long'?10:st==='bob'?6:st==='halfup'?7:st==='wolf'?1:4;h(3,9,2,sl,C.hair);h(15,9,2,sl,C.hairD);}
    if(st==='tails'){h(1,9,2,7,C.hair);h(17,9,2,7,C.hairD);h(1,9,2,1,C.accent);h(17,9,2,1,C.accent);h(1,15,2,1,C.hairD);}
    if(st==='bob'){h(2,13,2,2,C.hair);h(16,13,2,2,C.hairD);h(2,14,1,1,C.hairD);h(9,4,3,1,C.hairL);h(12,8,1,1,C.hair);h(5,8,1,1,C.hairD);}
    if((st==='halfup'||st==='wolf')){h(8,0,4,2,C.hairL);h(8,1,4,1,C.hair);h(7,1,1,1,'#1c1820');h(12,1,1,1,'#1c1820');h(6,4,3,1,C.hairL);h(12,8,1,1,C.hair);h(6,8,1,1,C.hairD);
      if(st==='halfup'){h(2,8,3,8,C.hair);h(15,8,3,8,C.hairD);h(3,9,1,5,C.hairL);h(4,15,1,1,C.hairD);h(15,15,1,1,shade(C.hair,-.4));h(2,16,2,1,C.hairD);h(16,16,2,1,shade(C.hair,-.4));}}
    if(st==='wolf'){h(4,2,1,1,C.hair);h(15,2,1,1,C.hairD);h(3,3,1,1,C.hair);h(16,3,1,1,C.hairD);h(2,5,1,2,C.hair);h(17,5,1,2,C.hairD);
      for(const [x,l] of [[5,2],[6,1],[8,2],[9,2],[10,1],[11,2],[14,2]])h(x,8,1,l,x>=12?C.hairD:C.hair);h(8,8,1,1,C.hairL);
      h(3,10,1,3,C.skin);h(3,11,1,1,C.skinD);h(16,10,1,3,C.skinD);h(2,11,1,1,C.skinD);h(17,11,1,1,shade(C.skin,-.3));
      h(4,9,2,5,C.hair);h(4,9,1,5,C.hairL);h(4,14,1,3,C.hair);h(4,17,1,1,C.hairD);h(14,9,2,5,C.hairD);h(15,14,1,3,C.hairD);h(15,17,1,1,shade(C.hair,-.4));
      for(const x of [9,11])h(x,9,1,1,C.hairD);}
    if(s.feather){const [f1,f2,f3,g]=s.feather;h(16,13,1,1,g);h(16,14,2,1,f1);h(16,15,2,1,f2);h(17,16,1,1,f1);h(17,17,1,1,f3);h(16,15,1,1,f1);}
  }
  const eye=s.cuteEyes?(x=>{h(x,10,2,1,C.eye);h(x,11,2,3,C.iris);h(x,13,2,1,shade(C.iris,-.3));h(x,11,1,1,'#ffffff');}):(x=>{h(x,10,2,4,C.eye);h(x+1,11,1,3,C.iris);h(x,10,1,1,'#ffffff');h(x+1,13,1,1,shade(C.iris,.35));});eye(6);eye(12);
  if((st==='halfup'||st==='wolf')){h(6,14,2,1,C.blush);h(12,14,2,1,C.blush);}else{h(4,13,2,1,C.blush);h(14,13,2,1,C.blush);}
  if(s.beard){h(5,13,10,3,C.beard);h(6,16,8,3,C.beard);h(8,19,4,2,C.beard);h(13,13,2,3,C.beardD);h(12,16,2,3,C.beardD);h(8,13,4,1,C.beardD);}
  else h(9,14,2,1,C.mouth);
  hatF(h,s,C,false);
}
function back(p,s,C,dy,lL,lR,sw){
  const st=s.hairStyle,h=(x,y,w,hh,c)=>p(x,y+dy,w,hh,c);
  legsF(p,s,C,7,lL,false);legsF(p,s,C,11,lR,true);
  bodyF(p,s,C,dy);
  if(s.dress)h(5,21,10,1,C.accent);else if(!s.robe)h(5,23,10,1,C.belt);
  if(s.apron){h(8,22,4,2,C.apron);h(7,17,1,5,C.apron);h(12,17,1,5,C.apron);}
  armsF(p,C,dy,sw);
  if(s.scarf){h(6,17,8,2,s.scarf);h(7,19,3,3,s.scarf);h(9,19,1,3,shade(s.scarf,-.25));}
  if(st==='bald'){h(5,4,10,1,C.skin);h(4,5,12,11,C.skin);h(14,5,2,11,C.skinD);h(3,9,14,6,C.hair);h(13,9,4,6,C.hairD);h(6,16,8,1,C.skinD);}
  else{
    h(5,2,10,1,C.hair);h(4,3,12,1,C.hair);h(3,4,14,11,C.hair);h(4,15,12,1,C.hairD);h(13,4,4,11,C.hairD);h(6,3,4,1,C.hairL);h(4,5,2,4,C.hairL);
    h(7,16,6,1,C.skinD);
    if(st==='long'){h(4,15,12,7,C.hair);h(13,15,3,7,C.hairD);h(5,21,10,1,C.hairD);}
    if((st==='halfup'||st==='wolf')){h(3,14,14,2,C.hair);h(13,14,4,2,C.hairD);for(let x=3;x<17;x+=2)h(x,16,1,1,C.hairD);h(2,9,1,6,C.hair);h(17,9,1,6,C.hairD);h(6,4,8,1,C.hairL);for(let i=0;i<3;i++){h(4+i,9-i,1,1,C.hairD);h(15-i,9-i,1,1,C.hairD);}h(7,9,1,1,C.hairD);h(12,9,1,1,C.hairD);h(8,5,4,2,'#1c1820');h(8,5,4,1,'#4a4452');h(7,7,1,5,C.hairD);h(12,7,1,5,C.hairD);h(8,7,4,4,C.hairL);h(9,7,1,3,shade(C.hair,.45));h(8,11,4,1,C.hairD);h(9,11,2,2,C.hairL);h(9,13,2,1,C.hairD);}
    if(st==='wolf'){for(const [x,l] of [[3,2],[4,3],[5,1],[6,2],[7,3],[8,1],[11,2],[12,3],[13,1],[14,2],[15,3],[16,1]])h(x,16,1,l,x>=13?C.hairD:C.hair);h(2,3,1,2,C.hair);h(17,3,1,2,C.hairD);h(4,8,1,1,C.hairL);h(15,10,1,1,C.hairL);h(2,15,1,4,C.hair);h(17,15,1,4,C.hairD);}
    if(s.feather){const [f1,f2,f3,g]=s.feather;h(2,12,1,1,g);h(1,13,2,1,f1);h(1,14,2,1,f2);h(1,15,1,1,f1);h(1,16,1,1,f3);}
    if(st==='tails'){h(1,9,2,7,C.hair);h(17,9,2,7,C.hairD);h(1,9,2,1,C.accent);h(17,9,2,1,C.accent);}
    if(st==='bob'){h(2,12,2,3,C.hair);h(16,12,2,3,C.hairD);for(let x=4;x<16;x+=3)h(x,15,1,1,C.hairD);h(6,6,4,1,C.hairL);}
  }
  hatF(h,s,C,true);
}
function side(p,s,C,dy,f){
  const st=s.hairStyle,h=(x,y,w,hh,c)=>p(x,y+dy,w,hh,c);
  if(st==='long')h(3,8,4,12,C.hairD);
  if((st==='halfup'||st==='wolf'))h(3,8,5,8,C.hairD);
  if(s.robe){p(6,29,4,3,C.bootsD);p(10,29,5,3,C.boots);}
  else if(f===1||f===3){
    if(s.dress){p(7,27,2,1,C.skinD);p(6,28,3,2,C.bootsD);p(11,27,2,2,C.skin);p(11,29,4,3,C.boots);}
    else{p(6,24,3,4,C.pantsD);p(5,28,4,2,C.bootsD);p(10,24,3,5,C.pants);p(12,24,1,5,C.pantsD);p(10,29,4,3,C.boots);p(10,29,1,1,C.bootsL);}
  }else{
    if(s.dress){p(8,27,2,2,C.skin);p(8,29,4,3,C.boots);}
    else{p(8,24,4,5,C.pants);p(11,24,1,5,C.pantsD);p(8,29,5,3,C.boots);p(8,29,1,1,C.bootsL);}
  }
  const bb=s.robe?28:26;
  for(let y=17;y<=bb;y++){let x0=7,x1=13;if(y===17){x0=8;x1=12;}if(s.dress&&y>=23){const e=y===23?1:2;x0-=e;x1+=e;}if(s.robe&&y>=25){x0=6;x1=14;}
    h(x0,y,x1-x0+1,1,C.cloth);h(x0,y,1,1,C.clothL);h(x1,y,1,1,C.clothD);}
  if(s.dress)h(7,21,7,1,C.accent);else if(!s.robe){h(7,23,7,1,C.belt);h(12,23,1,1,C.accent);}
  if(s.apron){h(12,19,2,8,C.apron);h(13,19,1,8,C.apronD);}
  const ax=f===1?11:f===3?7:9;
  if(NOARM!=='side')h(ax,18,3,5,C.cloth);if(NOARM!=='side'){h(ax+2,18,1,5,C.clothD);h(ax,23,3,2,C.skin);h(ax+2,24,1,1,C.skinD);}
  if(s.scarf){h(8,17,6,2,s.scarf);h(8,18,6,1,shade(s.scarf,-.25));h(5,18,3,2,s.scarf);h(4,19,2,1,shade(s.scarf,-.25));}
  h(8,4,6,1,C.skin);h(7,5,8,1,C.skin);h(6,6,10,8,C.skin);h(6,14,9,1,C.skin);h(7,15,7,1,C.skin);h(8,16,5,1,C.skinD);h(15,7,1,6,C.skinD);h(14,14,1,1,C.skinD);
  if(st==='bald'){h(5,8,5,6,C.hair);h(5,8,1,6,C.hairD);}
  else{h(7,2,7,1,C.hair);h(5,3,10,1,C.hair);h(4,4,12,4,C.hair);h(4,8,6,7,C.hair);h(4,8,1,7,C.hairD);h(8,8,2,6,C.hairD);
    h(13,8,3,1,C.hair);h(15,9,1,1,C.hair);h(7,3,4,1,C.hairL);h(5,4,3,1,C.hairL);
    if(st==='long')h(4,15,5,6,C.hair);
    if((st==='halfup'||st==='wolf')){h(4,15,4,1,C.hair);h(4,16,3,1,C.hairD);h(9,8,2,7,C.hair);h(10,8,1,7,C.hairD);h(9,15,1,1,C.hairD);h(4,5,2,3,'#1c1820');h(4,5,2,1,'#4a4452');h(1,6,3,2,C.hairL);h(1,8,3,3,C.hairL);h(0,7,1,4,C.hairD);h(1,11,2,2,C.hair);h(1,13,2,1,C.hairD);}
    if(st==='wolf'){h(9,15,2,2,C.hair);h(10,17,1,2,C.hairD);for(const [y,l] of [[14,2],[15,3],[16,1]])h(4,y,l,1,C.hair);h(4,17,1,1,C.hairD);h(5,2,1,1,C.hair);h(12,2,1,1,C.hair);h(14,8,2,2,C.hair);h(15,10,1,1,C.hair);}
    if(s.feather){const [f1,f2,f3,g]=s.feather;h(8,12,1,1,g);h(7,13,2,1,f1);h(7,14,2,1,f2);h(7,15,1,1,f1);h(6,16,1,1,f1);h(6,17,1,1,f3);}
    if(st==='tails'){h(2,9,3,7,C.hair);h(2,9,3,1,C.accent);}
    if(st==='bob'){h(3,12,3,3,C.hair);h(3,14,2,1,C.hairD);h(8,4,4,1,C.hairL);}}
  h(10,10,2,3,C.skin);h(10,12,2,1,C.skinD);
  if(s.cuteEyes){h(13,10,2,1,C.eye);h(13,11,2,3,C.iris);h(13,13,2,1,shade(C.iris,-.3));h(13,11,1,1,'#ffffff');}else{h(13,10,2,4,C.eye);h(14,11,1,3,C.iris);h(13,10,1,1,'#ffffff');h(14,13,1,1,shade(C.iris,.35));}
  h(14,13,1,1,C.blush);
  if(s.beard){h(11,13,5,4,C.beard);h(12,17,3,3,C.beard);h(11,16,1,1,C.beardD);h(12,19,3,1,C.beardD);}else h(15,14,1,1,C.mouth);
  if(s.hatType==='helm'){h(6,1,8,1,C.hat);h(5,2,10,2,C.hat);h(4,4,12,4,C.hat);h(4,8,13,1,C.hatD);h(4,8,4,4,C.hat);h(6,2,3,1,C.hatL);h(8,0,2,2,C.accent);h(13,4,3,4,C.hatD);}
  if(s.hatType==='straw'){h(6,1,8,1,C.hat);h(5,2,10,4,C.hat);h(5,5,10,1,C.accent);h(1,6,19,2,C.hat);h(1,7,19,1,C.hatD);h(7,2,3,1,C.hatL);}
}
function buildChar(s,dir,walk,f){
  const c=mk(22,34),g=c.getContext('2d'),p=painter(g,1,1);
  let dy=0,lL=0,lR=0,sw=0;
  if(walk){if(f===1){dy=-1;lL=1;sw=1;}else if(f===3){dy=-1;lR=1;sw=-1;}}else dy=f===1?1:0;
  if(dir==='down')front(p,s,s.C,dy,lL,lR,sw);else if(dir==='up')back(p,s,s.C,dy,lL,lR,sw);else side(p,s,s.C,dy,walk?f:-1);
  return finalize(c);}
const sprites=new Map();
function flipX(r){const c=mk(r.width,r.height),g=c.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(r,0,0);return hkOf(c,r);}
/* ================= 캐릭터 새 도트 (v4.80) — 현이 준 캐릭터 · NPC 시트 21종(주인공 + NPC 20명) =================
   CHARART[id]=[가로, 세로, 팔레트(6자리 hex 이어 붙임), 색 번호 바이트열(0 = 투명)을 raw deflate로 줄인 base64] — 굽는 도구 tools/charart_bake.py · 원본 art_src/char/sprites
   시트 = 칸 48×72 · 5열[대기, 걷기 4] × 4행[아래, 왼쪽, 오른쪽, 위] · 발 중앙(앵커)은 칸의 (24, 68). CHARATK.hero = 공격 시트(칸 80×80 · 4열[준비, 베기, 팔로스루, 복귀] · 앵커 (40, 72))
   CHARART에 있는 캐릭터는 getSprite가 이 그림을 돌려준다(없으면 예전 절차 생성 — 지금은 21명 전부 있다).
   · 캔버스 = 칸에서 [0, 앵커 y + 발끝 여유) 줄을 자른 것 → 맨 아랫줄이 땅 · 가로 한가운데가 발 중앙. hk(CHARMETA.hk) = 그림 1칸이 월드 몇 칸.
   · 서 있기 2장 = 대기 칸 + 그 칸의 윗몸을 1칸 내린 것(숨쉬기 — 시트에는 대기가 한 장뿐이다) · 걷기 4장 = 시트의 걷기 칸 그대로.
   · 그림에 양감이 이미 그려져 있어 설정의 '도트 양감'(volHD)은 입히지 않는다 — 양감 설정은 몬스터에만 듣는다.
   · 브라우저에 동기 inflate가 없어 작은 해독기(inflate)를 넣었다. 이미지 태그(data: 주소)로 읽으면 비동기라 첫 화면 · 테스트의 순서가 꼬인다. */
/* 만들어진 파일 — 손으로 고치지 않는다(tools/charart_bake.py가 art_src/char/sprites/*.png에서 굽는다) */
const CHARMETA={"hk":0.575,"cell":[48,72],"anchor":[24,68],"rows":["down","left","right","up"],"foot":3,"atk":{"cell":[80,80],"anchor":[40,72],"dur":[0.11,0.06,0.09,0.14],"hit":1}};
const CHARART={
 hero:[240,288,"0e0917100e211315571e02071f01041f3c96240206251f302625342731782c1c2c2e5bb532050f3a151c3b14173b3b47400e1341171c4277cb4995dd4c16174d1e19553422571c225751475b27245b2a1b5f2b266338266b302f6e1d046f3426700123704529733a2e734e3a75401277503a7b413d7f453f804c2e813532835f3f87675290382190644092484093263c9375599e52489e5436a57f5eac5500ad6845b01a3eb07542b27b52b9734ebe8954c3915cc87e00c87e68ca8568ca955ed1a56fd2452fdba522dcb279e1be90e3a27fe76e24edca9befbe97f1a491f4ce6bf6d0aaf9903effefb5ffffff","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"],
 hans:[240,288,"080617090b190a0a190e09171200031304051316251707081707091806091c1c291d21341e0b0e1f0b0d1f2132202132222c4423283b251f30264e8e292c3c2a0f0d2a2e402b18142c1c2c2d18152d1816301c1e301c1f31313e321b1f34384d3a41553a445b3c29213c29223c36473e00133f261c3f2e253f3a4b414c624246584a4f644a50694c463a4d3c3250586c533b2f534339565063575d7759311e5a54675b667b60002b606b7e6089cc63504463657964574e6a6e826b6b836c7385700000784b367a81937c86977e899888889a8a95a39500009aa3ae9ba5b39da9aea00031a2a3afa6b6bcac5500b62700b6c5cabbc5cabc272bbc6c4ebf6e56c2bcb1c87e00d08e67d15b38d24f35d58964d8d3bedba522dbd3c2dc7350e0a67ce7b88fe8e2cde9c9a5ea9884ffefb5ffffff","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"],
 mira:[240,288,"002326003d41004d4500631700684c1d02062000052100042a00082c1c2c2f050d38171b3d13193e07123e1118437e5349001e4a1f184a9e564c38324d121c5434245a241a5f382660002568524c6a2f246a9463703f26724f3d73503a7e0020804b3083593a8aa67992261a936544a54424b86541bb7059c67f6ac8866bd29b6fdec49be0a383e8ddc6edbe9bf0a492f5d0adf9e0c2ffffff","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"],
 orvin:[240,288,"13040614002a1707092a18162b0c512c13462c1c2c301c1f3f2e273f3a4b45276c4c39304d373153433b5534245a54675d408164574f672510734e3c7955918383a18471678840298989a7956a95a54823a5a5bcabacc3ba6448bb6f18bc795fc49533c5c6d5ccccdcd0915cd3b35ad59676e1b18ee2ddd4e9c3a0e9e4daf4f1eaf7f1e6fef8edffffff","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"],
 lia:[240,288,"004ba41e01092c1c2c3a141f3f3a4b4918264989e351362853003854173d5a54676731336b21096f50417331597e4c408585a78a346a8c3c258d05679465539494b2a7a7c5ae4e77b6b7cec68471c88d77cb6a82ce5a2fd24e74d7d8e8de8006e0a524e0aa8ee48690eac150eb6d7eefc5a6f2a798f3a3a0f5f0e6f7d6b8f88f8cfce6ccffde81ffffff","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"],
 teo:[240,288,"00353000514a006148057b441b04041c03061f0105210004240004264e8e2c1c2c2f000833110f36191837181b3a0f083b140c45021e4a25104b19104c2a1c502d1a5b301d5b3a215f8f4360341c60442c6089cc612a1d63442e70533c735945735c427a4a357c202d81453588a455943f32aa5c43ae593bb6624ab7775cc77651cf8c54d29369d9a57cdcb069e28e7aedcd88ffe5acffffff","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"],
 bram:[240,288,"0806170e09171414211707091806091b04071c1c2b1e05091e0c0e21212c230709251f302c120f2c19162c1c2c2f070f301c1f31313b31314036181d3b23193b29233c23153e16113e1e1f4a44394c3c334d47394e29194f26275c2f1d5f3e29615a4c63554d6a40347458497558447c49367f5b4494755bad5439c6714fd28e67d9a07ad9b38effffff","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"],
 nell:[240,288,"1a011b1d020629002e2c1c2c2f050d34143538171b3c001142103e4a1f184c383255332358244b5c0d285f3826682e9068524c6e385773503a74052f744e3b875265952c2fa36dcead4e32b47c6ac16c44c37e63c47964cda484ce8962dc9a7adecaace9b691ebe3d1eea08ef0c8a4f4d9b9ffffff","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"],
 fin:[240,288,"001c3a00446b004ba40062830c36571707071c03071e0203200005250e0e277c962c1c2c311c1d33060837181c3a140e3a16173e251d4596a54989e34d21104f2d1c523d2f57331f603c1e62171763442f66544469abac6d1e04735435754d3883322f836a4f8f3a21a32e29ad5900bb500ac57300c67960c87d5ec98200d28f2fdba92ee09a74e7ad60ebb78defa08cf2c9a0f4d171f5dab6ffffff","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"],
 karl:[240,288,"001210001310001d11002c27003323063419150303160705164b281707051707072c170e2c1c2c2d1d14311d1c3b32323f3a4b402d1f465f315343335931205a546764574964647b667444672510726868784b387c7c8e7e865e8840298888a08d460091919fa1a1b4a86d00aca8a0b46549b7b7c5bb922cc9c2b4cd825fd0d0d0d3cfc7d5b967d99e77e0b08ae2c19ff2eadbffffff","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"],
 dor:[240,288,"0c0a180f0a181200031707081806091b04081e0b0d201f2f210004230e182320312a0f0d2c18142c19102c1c2c2d2c412e0710301c1e36191d3737473b29213e11183e16133f261c3f3a4b422c2f4646564c3c324d121c4e2a1b4e4e5e52210f5c4c425d5d6e5f3e2b614c4263554b6663736a2f246c1f06723b27740a21746a5e7d6056804b308e3a228f8881904923936544978378a9633cafa49bb74a21bc7b52c88a62cd7300d49c23e3bb52f4d381ff9a3affffff","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"],
 sena:[240,288,"001219002624002b3200303000413d00463600503e006317046a3f12583a1d02062c1c2c2f050d38000138171b3b6a464a1f184a9e564c3832517f425235265718155f38265f815c68524c6d1a14704f3f73503a789454883d0b985f19aa7b39b9935ebb7059c47f6cc4876fd29b6fdca386dec49be8ddc6eabf9eefa494f2d0b0f7e0c4ffffff","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"],
 rian:[240,288,"0905280906260b064a0c0b170d0e3b0e0917120003141526151522161b4c1806091817221919261c246b1c2d6a1d1d441e1d421f4da7202856222230222a49251f30262634264e8e2727322a0f0d2a34682b2d402c1c2c321b1f3232403269bd333f6d33488b3539493636453787ce3e392e3e4d7e3f261c3f3a4b404a6740a4ce47516a4b45384f536650493c505481533b2f56332159607459b6e95c62936069826089cc63504469748a6b6250737c90744d3a7480da77276e7d889c8181998a4fa48a95a78c96a990d5de999aae9ba8b0a3b0c0aab4c3ac5500afb0c3b7c7d1bd7559bf745dc87e00cad5dbcfc7b6d5926fdba522e1ae87e8c09aea9c89ecd1b0ffefb5ffffff","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"],
 mora:[240,288,"1900291d02062c1c2c2f050d320e4536065338171b4a1f184c383253236c5533235f3826682e9068524c6c1d196d3c8073503a744e3b89538e8f3832a26a92a36dceb47c6ab73b2fc37e63c47964cda484ce5e08d68200dc9a7adecaace29f34e9b691ebe3d1eea08ef0c8a4f4d9b9f7be68ffffff","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"],
 aila:[240,288,"0e091711111e1d1d2b24000d240010251f3029000f2c1c2c2d2d3b3f3a4b40001b43001646403348002659311e5a5467615846630021633e7565271a784b377878967d15248641339437309a9ab19e78b1a15544ad543dba6448babacabd6c4fbf6e57c6793cd0915cd29d4fd58965d7d2c8e1a67de2bb6ee8b890ea9884ebe5daffffff","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"],
 taon:[240,288,"03020a0605140a0a160b0b140b0b170e091711111d11152a1200031616201619251717211806091919201a19271e02031e1e28222135232630251f3026262c27272f2a0f0d2c19122c1c2c2d33432e2e362e2e382f2a20321b1f3306083939493a16173d382d3e34343e392e3e4c513f261c43120546403548443b4d211050505e533b2f59503f5c4c4a603c1e614c45622b1d626f7463504465001f67624f6e685b7354357f381b837c6d8817388f8a77930100984a36995233ac5500ac6948b73a00b87858be8868c8352ec87e00d27868d65f00dba522de5f23efb986f08b44f18238fba263ffefb5ffffff","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"],
 rumi:[240,288,"00475f00647e00788d00989910010211081713051b1501231707081a07271b0f251c003321b2a128130d281333291c322b1b342c1c2c2e163e301d1d36164b3a24423c291d4c37334d2d5f4f35504f3e3151362960002460524661cbad67436f69524d6d1e046e50427640187f5776830e3c8f3a21a60044ad5900b37a55b67363c48272c48c77c71234c98200cf9c7ada4520dba92edda88fdec4a3e9ddcaeb672aebc3a6f0a698f4d171f4d4b8f9e4cbfd8d51ffffff","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"],
 goro:[240,288,"0707120e09170e0e1a13131c1717241a1a241d1c3021000622222b24242f251f302a2a312c19122c1c2c30000735353c3535443934293d111b423c314312074908074b4c564d473c534b395a230a612c1e614c4567625968604e6b391b7f391d805437995235ac694ab8785abe886affffff","7Z0Ld9o4EIVt+YVtGh7BQHCzENvp//+JOyPJYF72jIN6ENWc3XbP9urzXFkQQjMXz3PlypUrV65cuXLlytVPqtT1b/DL8lsXfYXF/KP6+7tpypfnd+TsBRbyz+Sgb4qX5l/Jm7p4Yf65XOkZC6zjX+NfWl9eqVFPXWAf/725VKO8fn9R/vtX05yJlbzeT16S//71tW/OS8n3u0kvv7GT/77f76/VdbXb3dFbzp/sdvtrdQX69UvyW/3b25sSw39UqF+vX5IPC/Z7kP15e1PsP1K/vi+3my8vgNhfv9RWwn8M6O3mqwUg+93qfw/LNR833ja+1O/3X/AP/IsFR2dIX0l+pfqxjC9PEIi/tB6eCQfkdvOVvpWClqS3mC+/5mks1m7XL9f8na18qd/p0msG9TbzPbHbneuF98r8fL6+qEi8MD/fbrPZ7CSezaIsE6/LB/08mrWl5AP6Ix9/t41fgj6LokTpkyhCfdHfj2H+1iC/bFC/naMQapFlqL///gluZ2aQj/1vr/j3DXP5pfy2a7s4Vgav4uo+/Rz8nvGrun4gH9/byOYG+5f6zw1dD9tpkI9+q3mHD1U9tH+mHr4L2RrkK7+bk14ueKzfOfA3JH6J9Gp+xe9bwOJ/3/RbPYyP8upaf28B+q3O9b1+2Xy0W1dZV3/oMTCi/1avF8DzT6++vvAbUf3S+OP9EvtHfZQR9eo4n/t9JF/7jaIrv/cb4vGl3vc3xwW+37Of6jgf5vD82fKj3hvM5auHr/S76fqtHsP3Cvl+p/A/ZeESv5D8+3rwK0LUqgv4RZ9fJh/bb1C/ORoIi8Ohtx9W/14h/0xsNu0VhP5f9+VVgX5bx9Lv4/id/pU+FMXhcXxYUIA82BwXBEL+rx45/KE46YXeg8fwNeuMr6/5mP7Vd5zn+sES8SW/eBS/uNH/cD+m9fGT9eP8Or/O77/k9/j9piG/R75vov+Q2f80gEoS/DWm+R3D97FCE/ufSjS5/3w5jePY90EdU/rJP5bLZZiw+eA2JPmN1f4v8TIkvymAGf0vlynqsR2qX1yAdmMOn+oX7QZ+iHaJ/Yec/mF/eH6XJ78sPv5O4ku/KcPvyTBx/1Pm/kgDIY9PPZ/6fqUpeX/YfqEj+v6P8AsN+eo2k/v3lymjHwDTz8+H9BvKY0run7GfH8ovdET5cqT8quOwTCkLJFj4nP7xbpEfLx9K6XP6R7IQFDl+QYV2crpfCZZ+aY/HUB5M/Rv5/gpB7J8M7vYv2qvQF5EvozunGiA/EC/4zGJv07jLUB8vnvH6S5chPl5e5zKuXLly5cqVK1euXLly5f2j8Rve6HiM0kb+Ke2CG4/BTdN4Cv4P4zFKy/g/jccYusCz8Uuz8RjPxi+Z8Ri280te3IXt/FvyV+aXzWXcRV3z8j0s4+v8irO0i179DbxV/BvxD9VL828EIrw0H7IQmgaDPtr0h+qF+e9N8+etqXCauiHIW/6Xpfz3r3X96w3yWvbrtRb39/OOGRHI/9o1Ld4ePubV7H/Xhz2O2pLakfyDrfx3mQ1QHfYwh1lVBL3i17bycQFeYtfV98ut5nf1M4L8FfgyHgDkB4Jc623nI359gBqc7LjiF3bxJzoGAfQ4Xjz40xIqDeTIF4VnF9+bqFwAGJOXk+OCx8+EZXxvooMBoiRZZBmhIcv53mSi6AnxBljOlysmAuRIpzRkOV8W6Lf//YdBFgS95s+hrOSjPokg9oKht52/iLYqSOQ5+IXp/tn6BGNQTPGLamHabybfTajI9/f7G/2SH188flktthnPL6///FPpyf0ncs6e7JfHLxv0K9/PMdS/1ldUvcwVkHITfPD7uY3U+1eRif7zz03E9dsw/HL5xYHnl8vPP5OGo9e3l+GXx4f+5zy/XP6i1YeCd3uN8NGvNEz2y+VrvR/Sj3M1wi+Rn39+Ju0NLozwWfrjcaZOj4zxG/om/Sb6yxft9mo4TJdlJvh4npl++Xx8t5c0zNumylS0NxTG8FGfqPNcFYb4+GYR2a8Sx7EhPurjVSx3tTDED6jDy+rlcxIw/XL4ym9QEe2O409Z/S+4frn81UoO/QtDfNBPmX7phpEvmHzwG8dwQIWZ/tn9GPeLcmr+APCnDD7EL7H6EUy/R35I9qtvb0z6Eo98jl+cS5zKBcRxXszFaA0T521TGXFA3n+WX0/kub8i968iQeh+czkMrvxSX2KBX/rMMEw6r1Z4nAP6ADbX73I5nabEl2PyVrV2aa/QVUQDmb9cxgy/CPfp/eOKcEkd9m/TRgJB9yskneU3hECWgB6QIcM6yH7hhJL7yT+kXwxEoPqF+XemX9DKABryQL7Pe7yE5H50aoJMh4lDhl/yzH+uemnzdjhryPf3g65XYQXoVx5r2hrVOT3sIj3l7bDWkJ8P1U0LqeEevkoDSennzSeGdXR6GbOG+OysAmKoX1tUjVjD62XMGkbyAzf8Ycyap+lFjMjqEIbyPZ6pF1euXLly5cqVK1euXLnyXALHK/FPCRCGAjKei1+yAiC6C5jy5+CXvMCI84CPxjr+5Qx5zUyAsIx/lYjA7ccu/s8CMuzj/2MBHJcP9qFAB9v53AAL2/k/CMiwlH8jAOK1+ZdiRuCF3XwYlcafWXx7I+qPeIv48MOuXf0axozf/lQTKn9XWcaXH3GoC1Mg1qD/Nev5yPtz/s46fmeB/MB7uADO4E6o/INlfPXTzKpmUr8e0B/5UljZxu8saD/4nii3k39asKbpbefjQJeq9b/Blx9TytEXhd18D0eqoTAZgaYvhN38PJI10wtoeHv5OU4vLxZJRO3Hcj7oEZ+oK0yG2+nw8QqW8RGPeQiwQEyGu7Gen6Mc8x8S4kDg3+FvzfEznYewoOr/Bn9rkI9ypl7yC8N8g/2z9RBIsTgUBv3OE2P963F5nt8oI/tl8rfZHK7Q1Imh/rcR06+e4F8cKBPJfD74lQ4SQ/3z9CL7PvqtzPjdMub3+f0f4xAWpAVdv4UBPvSv8goaml92/62+pj1BiOjo1wx/Pm/91oUJfsr2qwM4Fmb485PhwgAfRj51HAJNX55urxE+1y+XP9IvfAS8Gb9ww8KQdaCZfDihnPPA9svkwxMizpcxnqGZfC9X8Q/E/vEvATCBIyH75fHRMHx7NPBXKT/hgx7fISPqi1rFewSG+KjHgAZyIsUYPk6oU/U6cSQwxVd+gZ8kxvg4ME9+/sHha5h3NsVv9QvDfKI+z1eBzPcw5Vff3mDD44vEiD7/WJn3i/Jgs3kCvzDR/gFPJug3fhq/yzF+Y9KMJY4Xr+Ixfn3aDGfeHmd8/PrkjINUzgx7LL9Udqj9kkfIlV9qIsKHur1ypJ2RcUCed0b9dErOT8A4gSBm5G+0fJJhmQCh/DL4csCbPAIs7xn0I8jswJ9S8xk6/FDQ80aE8hvSe4KpdnICh0pdoPWD4/KpjzeMuf/0/cTnEk6qg+opTckRDWrg3ydFcCiyP02Z+x+GOVkbHwMpiBEfqimGX5mCQkvgkF342gN9/2n8Vpu2fik9qY3xQ8Z5TuVjTJDTENp7FlLPBJHfalOfkbrATGjQqSnsBA7y/o/SclIXmAkNplMvhLl75T1l6oXBe+XKlStXrly5cuXKlStXrrwfpleYysd4Mn4nD6F8fX4n/oGYj2E1/2qAvHhp/o18gOKV+f+Y/lrOz4uwiX8d/8DQW8d/n9yS1/X9GQmr+e9fu+ZcrPX3Bowt56O+uRWI0KO3mr+/qYYfnrunt5tf3pbf/TE+2/nwc5A3xff0tvNVNsAp2OOovi+3mo+fh17X1+rZZDgswko+fv77pRhjEXr0dvNhQXVVsz653fxbC5hyu/i4oxfyIb3dfG8CKzAM4agekFvOV5dQS+Tw+KDacr5a0OYhEOUW8/M8F3mmi/aDMTbzc5iTn2P8g6rhzyC3m5//p/TtisEP5cbZXIv5Ei/1OP9O09vML1G23Z4vKF6WXzYYs3DUz5X+/htGuYSa40P/rV2SYS4fvuOsW/1c66uqT489XPDrR/Kbrl/UR4/tH+ZaT3I0U/Xr667dOcrr+pF8HD3t8qWBR/Lraq7Fw3opP+dX9aBfOl/6lQtO/R8GG+L1D/p5Ry719xaUKK+2XX6vXy6/9dtd0OeX3/+ZPiP4hT8+41d9gbZ8/rnfTPutHsfv6NVXvMN9vTrOh/PtrHv+BoDJv/Sr9D2GR/Dr9n61r2h6/dZdv+oFwZBfBl8f5+i8/wG/PD4aCMOjOAv9vvMj57pFlx+h3+ZR/K7fdkVx6NOP6L/Swzuqij69XFCIDt+Xeb73NpTJ18dZ+NmpfwHJkr3t8Pv38qxVwyuZojckAJItvS7fL3oTuHl8+XBEv50LCHlJ75H9w7Bqpr7fzHAkto+vX1Vm+gJRpPj3L8DjaxakT+r2B/PcxvQvh3NRHtNGgEEf6ZL8odAIBl+yRBB3+bThYkb/YjqFcVslJ/JX0w5/eD/pfGQJnC022j8uSBK5jOoX+IEhvvQbRNEUFxjpf4zfJDHnN8Bsg0RexgR/yve7mtL9cvlcv2y+OjjClN98yeOP86v4oTG/QtD9QsG8J8dvEIic6TfEmeHUnN9ARugQB3ph/J3uF5+ugoDtlzq/r/cf92dJ0q8wMYLnF/O7qPzWL+RwLKeM/qnz+yosQvqlBoLAyRE+0y+Zr/yG8jKc/ql+2344+4MHFP2G9PPM6EeGjSzJ+8Psf4xeHlA/Ds34TTGNImX275v0G0q/nLAIwePz/QpeIALbr6D6hXl8TEai8+U3miLl9iMv41EDRIT+jcGnhyiI02WIAQ2C5VeDBSNYQghqCETr1+OFKAh6yASC6X455FMARPsrkR+KUZEXxvbHaHzF34nHcCEcrgj1Pw=="],
 hana:[240,288,"1c000a1d010e1d02062c1c2c2f050d35001338171b3914253f3a4b45001449141b4a1f185633205a54675c29265f382666162b6e374a71433b73503a754d397e12318988b69f362fab7083ababd5b65831c47861c57c5ec97645ccccead69266dd9975e9b68dede5d5eea08cf0c8a0f4d9b6ffffff","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"],
 kiki:[240,288,"1905081f01042105092200052c1c2c310108331a1d3a1b163b000f3b14183e02103e11184c1b0f4f33265a1f155a311a5d002661361b634a396c1d196e3724703b20744e30794b337c003083553484654a8f38329c0024ab715db04034b12112bf6a47c06d51c3471acc6625d66d3dd7885dda8c2ee2a576e8b88aea9881eaac51eac9a2f8c67effffff","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"],
 pip:[240,288,"004ba41d03041f01041f01052000012200052c1c2c2f00083101083818183914053b14183b14193e111841000f4100144989e34b19104c1b0f4c2d1457331f5a190f5f452960341c61361b620b2b6b32136d1e04734c30744e30754d387a00337b492584654a8f3a219065439d2a32ad5900b54e33c67960c87d5ec96d44c98200d58a62dba92ee09a74ebb78defa08cf2c9a0f5dab6fff2b9ffffff","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"]
};
const CHARATK={
 hero:[320,320,"0e0917100e211315571e02071f01041f3c96240206251f3026253427317828000c2c1c2c2e5bb532050f3a151c3b14173b3b473f3a4b400e1341171c4277cb4603154995dd4c16174d1e1954b2dd553422571c225751475a54675b27245b2a1b5e201e5f2b266338266b302f6e1d046f34266f7699700123704529733a2e734e3a7540127671dd77503a7b413d7f453f7fbcf2804c2e813532835f3f84ccf98767528e99b88f85cf90382190644092484093263c9375599e52489e5436a57f5eac5500ad6845adb9ceb01a3eb07542b27b52b9734eb9958ebe8954c3915cc3d2d7c87e00c87e68ca8568ca955ed1a56fd2452fd2aa7ddba522dcb279e1be90e1e1e1e3a27fe6e3d7e76e24edca9befbe97f1a491f4ce6bf6d0aaf9903efae0c0ffaf6bffefb5ffffff","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"]
};

function inflate(b64,n){const s=atob(b64),src=new Uint8Array(s.length);for(let i=0;i<s.length;i++)src[i]=s.charCodeAt(i);const out=new Uint8Array(n);let sp=0,bb=0,bc=0,op=0;
  const bits=k=>{while(bc<k){bb|=src[sp++]<<bc;bc+=8;}const v=bb&((1<<k)-1);bb>>>=k;bc-=k;return v;};
  const build=L=>{const cnt=new Uint16Array(16),off=new Uint16Array(16),sym=new Uint16Array(L.length);for(let i=0;i<L.length;i++)cnt[L[i]]++;cnt[0]=0;for(let i=1;i<16;i++)off[i]=off[i-1]+cnt[i-1];for(let i=0;i<L.length;i++)if(L[i])sym[off[L[i]]++]=i;return {cnt,sym};};
  const dec=h=>{let code=0,first=0,idx=0;for(let l=1;l<16;l++){code|=bits(1);const c=h.cnt[l];if(code-c<first)return h.sym[idx+(code-first)];idx+=c;first+=c;first<<=1;code<<=1;}throw new Error('inflate');};
  const LB=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258],LE=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],
    DB=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],DE=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],ORD=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
  let last;do{last=bits(1);const ty=bits(2);
    if(ty===0){bb=0;bc=0;const len=src[sp]|src[sp+1]<<8;sp+=4;for(let i=0;i<len;i++)out[op++]=src[sp++];}
    else{let hl,hd;
      if(ty===1){const l=new Uint8Array(288);l.fill(8,0,144);l.fill(9,144,256);l.fill(7,256,280);l.fill(8,280,288);hl=build(l);hd=build(new Uint8Array(30).fill(5));}
      else{const nl=bits(5)+257,nd=bits(5)+1,nc=bits(4)+4,cl=new Uint8Array(19);for(let i=0;i<nc;i++)cl[ORD[i]]=bits(3);const hc=build(cl),ls=new Uint8Array(nl+nd);
        for(let i=0;i<nl+nd;){const sy=dec(hc);if(sy<16)ls[i++]=sy;else{let v=0,rep;if(sy===16){v=ls[i-1];rep=3+bits(2);}else if(sy===17)rep=3+bits(3);else rep=11+bits(7);while(rep--)ls[i++]=v;}}
        hl=build(ls.subarray(0,nl));hd=build(ls.subarray(nl));}
      for(;;){const sy=dec(hl);if(sy<256)out[op++]=sy;else if(sy===256)break;else{const k=sy-257,len=LB[k]+bits(LE[k]),ds=dec(hd),dist=DB[ds]+bits(DE[ds]);for(let i=0;i<len;i++){out[op]=out[op-dist];op++;}}}}
  }while(!last);return out;}
const CHARPIX={},CHARSPR=new Map();
function sheetPix(a){const [w,h,ps,b64]=a,pal=[];for(let i=0;i<ps.length;i+=6)pal.push([parseInt(ps.substr(i,2),16),parseInt(ps.substr(i+2,2),16),parseInt(ps.substr(i+4,2),16)]);return {w,h,pal,px:inflate(b64,w*h)};}
/* 시트의 한 칸 → 캔버스. sx · sy = 칸 왼쪽 위, cw = 칸 폭, rows = 쓸 줄 수(맨 아랫줄 = 땅), cut = 0보다 크면 그 줄 위쪽(윗몸)을 1칸 내린다(숨쉬기) */
function sheetCell(P,sx,sy,cw,rows,cut){const c=mk(cw,rows),g=c.getContext('2d'),im=g.createImageData(cw,rows),d=im.data;let top=rows;
  for(let y=0;y<rows;y++)for(let x=0;x<cw;x++){const yy=cut&&y<cut?y-1:y;if(yy<0)continue;const v=P.px[(sy+yy)*P.w+sx+x];if(!v)continue;const q=P.pal[v-1],o=(y*cw+x)*4;d[o]=q[0];d[o+1]=q[1];d[o+2]=q[2];d[o+3]=255;if(y<top)top=y;}
  g.putImageData(im,0,0);c.hk=CHARMETA.hk;c.lw=cw*c.hk;c.lh=(rows-top)*c.hk;return c;}
function charArt(id,dir,walk,f){const k=id+dir+(walk?'w':'i')+f;let c=CHARSPR.get(k);if(c)return c;
  const P=CHARPIX[id]||(CHARPIX[id]=sheetPix(CHARART[id])),M=CHARMETA,r=Math.max(0,M.rows.indexOf(dir)),rows=M.anchor[1]+M.foot;
  c=sheetCell(P,(walk?1+f%4:0)*M.cell[0],r*M.cell[1],M.cell[0],rows,!walk&&f%2?rows-12:0);CHARSPR.set(k,c);return c;}
/* 주인공 공격: e = 공격을 시작한 뒤 지난 시간(초) → 그 순간의 칸. 끝났으면 null */
const charAtkDur=()=>CHARMETA.atk.dur.reduce((a,b)=>a+b,0);
function charAtk(id,dir,e){const M=CHARMETA.atk,D=M.dur;let f=0,s=0;for(;f<D.length;f++){s+=D[f];if(e<s)break;}if(f>=D.length)return null;
  const k=id+dir+'a'+f;let c=CHARSPR.get(k);if(c)return c;const P=CHARPIX[id+'@a']||(CHARPIX[id+'@a']=sheetPix(CHARATK[id]));
  c=sheetCell(P,f*M.cell[0],Math.max(0,CHARMETA.rows.indexOf(dir))*M.cell[1],M.cell[0],M.anchor[1]+CHARMETA.foot,0);c.atk=f;CHARSPR.set(k,c);return c;}
/* 초상: head = 머리만(왼쪽 위 얼굴 칸 — 머리가 위쪽 가운데에 오게) · 아니면 몸 전체를 여백 없이 */
function charFace(id,head){const im=charArt(id,'down',false,0),w=im.width,h=im.height,d=im.getContext('2d').getImageData(0,0,w,h).data;let x0=w,x1=0,y0=h,y1=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]){if(y<y0)y0=y;if(y>y1)y1=y;}
  const yb=head?Math.min(y1,y0+27):y1;for(let y=y0;y<=yb;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;}
  if(!head){const c=mk(x1-x0+5,y1-y0+3);c.getContext('2d').drawImage(im,2-x0,1-y0);return c;}
  const s=Math.round((x1-x0+1)/.72),c=mk(s,s);c.getContext('2d').drawImage(im,Math.round((s-(x1-x0+1))/2)-x0,Math.round(s*.05)-y0);return c;}
function getSprite(id,dir,walk,f,noArm){
  if(CHARART[id])return charArt(id,dir,walk,f);                                          /* v4.76 구운 그림이 있는 캐릭터 */
  const k=id+dir+(walk?'w':'i')+f+(noArm?'n':'');let c=sprites.get(k);if(c)return c;
  const s=CHARS[id];if(!s.C)s.C=charColors(s);
  if(dir==='left')c=flipX(getSprite(id,'right',walk,f,noArm));else{NOARM=noArm?(dir==='down'?15:dir==='up'?3:'side'):null;c=buildChar(s,dir,walk,f);NOARM=null;}
  sprites.set(k,c);return c;}
function makeTree(seed,pal){
  const c=mk(48,62),g=c.getContext('2d'),p=painter(g);
  p(21,40,6,18,'#6e4a32');p(25,40,2,18,'#4e3322');p(21,40,1,18,'#8a6040');p(18,56,12,3,'#5a3c28');p(18,56,3,1,'#6e4a32');
  const r=rng(seed),cl=[];
  for(let i=0;i<20;i++){const a=r()*Math.PI*2,dd=Math.sqrt(r());cl.push({x:24+Math.cos(a)*dd*13,y:25+Math.sin(a)*dd*12,r:5+r()*4});}
  cl.push({x:24,y:12,r:7},{x:17,y:16,r:6},{x:31,y:17,r:6});
  cl.sort((a,b)=>a.y-b.y);
  const img=g.getImageData(0,0,48,62),d=img.data,P=pal.map(hx);
  for(const k of cl){for(let y=Math.floor(k.y-k.r);y<=k.y+k.r;y++)for(let x=Math.floor(k.x-k.r);x<=k.x+k.r;x++){
    if(x<0||y<0||x>=48||y>=62)continue;const nx=(x-k.x)/k.r,ny=(y-k.y)/k.r,dd=nx*nx+ny*ny;if(dd>1)continue;
    let l=-(nx*.6+ny*.8)*.55+(1-dd)*.2+(25-k.y)/34+(24-k.x)/90+(hash2(x+seed,y)-.5)*.16;
    const lv=l*2.4+2.3;let idx=Math.floor(lv);if(lv-idx>.55&&((x+y)&1))idx++;idx=clamp(idx,0,P.length-1);
    const i=(y*48+x)*4;d[i]=P[idx][0];d[i+1]=P[idx][1];d[i+2]=P[idx][2];d[i+3]=255;}}
  g.putImageData(img,0,0);return finalize(c,{rim:false});}
function makeBush(seed,pal){
  const c=mk(26,20),g=c.getContext('2d'),img=g.createImageData(26,20),d=img.data,P=pal.map(hx),r=rng(seed),cl=[];
  for(let i=0;i<7;i++)cl.push({x:7+r()*12,y:9+r()*5,r:4+r()*2.5});cl.sort((a,b)=>a.y-b.y);
  for(const k of cl)for(let y=Math.floor(k.y-k.r);y<=k.y+k.r;y++)for(let x=Math.floor(k.x-k.r);x<=k.x+k.r;x++){
    if(x<0||y<0||x>=26||y>=20)continue;const nx=(x-k.x)/k.r,ny=(y-k.y)/k.r,dd=nx*nx+ny*ny;if(dd>1)continue;
    const l=-(nx*.6+ny*.8)*.55+(1-dd)*.2+(11-k.y)/14;const lv=l*2.2+2.2;let idx=Math.floor(lv);if(lv-idx>.55&&((x+y)&1))idx++;idx=clamp(idx,0,P.length-1);
    const i=(y*26+x)*4;d[i]=P[idx][0];d[i+1]=P[idx][1];d[i+2]=P[idx][2];d[i+3]=255;}
  if(r()<.6){for(let n=0;n<5;n++){const x=5+Math.floor(r()*16),y=5+Math.floor(r()*8),i=(y*26+x)*4;if(d[i+3]){d[i]=236;d[i+1]=118;d[i+2]=130;}}}
  g.putImageData(img,0,0);return finalize(c,{rim:false});}
function makeLeaves(seed){const c=mk(80,46),g=c.getContext('2d'),img=g.createImageData(80,46),d=img.data,r=rng(seed),cl=[];
  for(let i=0;i<9;i++)cl.push({x:12+r()*56,y:20+r()*18,r:8+r()*7});cl.sort((a,b)=>a.y-b.y);
  const P=['#101c15','#16271b','#1f3524','#2a4730'].map(hx);
  for(const k of cl)for(let y=Math.floor(k.y-k.r);y<=k.y+k.r;y++)for(let x=Math.floor(k.x-k.r);x<=k.x+k.r;x++){
    if(x<0||y<0||x>=80||y>=46)continue;const nx=(x-k.x)/k.r,ny=(y-k.y)/k.r,dd=nx*nx+ny*ny;if(dd>1)continue;
    const l=-(nx*.5+ny*.85)*.6+(1-dd)*.15;let idx=clamp(Math.floor(l*2.2+1.3),0,3);const i=(y*80+x)*4;d[i]=P[idx][0];d[i+1]=P[idx][1];d[i+2]=P[idx][2];d[i+3]=255;}
  g.putImageData(img,0,0);return c;}
function sprTable(w,d,legH,top,opt={}){const head=opt.head||0,c=mk(w+2,head+d+3+legH+2),g=c.getContext('2d'),p=painter(g,1,1+head),leg=shade(top,-.35);
  p(1,d+3,3,legH,leg);p(w-4,d+3,3,legH,shade(leg,-.2));
  p(0,0,w,d,top);p(0,0,w,1,shade(top,.18));p(w-2,0,2,d,shade(top,-.12));p(0,d,w,3,shade(top,-.28));p(0,d+2,w,1,shade(top,-.42));
  if(opt.items)opt.items(p);return finalize(c,{rim:false});}
function sprBench(){return sprTable(52,10,12,'#8a6a4a',{head:4,items:p=>{p(4,-2,9,3,'#5a5a64');p(4,-2,9,1,'#8a8a96');p(12,-1,9,2,'#8a5a34');p(28,-1,14,1,'#4a4a52');p(28,1,14,1,'#4a4a52');p(41,-1,2,3,'#4a4a52');
    p(18,13,16,6,'#2a1a10');p(18,13,16,1,'#5a3a24');p(19,14,14,4,'#6a4a30');p(25,16,3,1,'#c0a060');}});}
function fireAt(g,x,y,t,s){const k=s||1;for(let i=0;i<14;i++){const a=hash2(i,Math.floor(t*12)),b=hash2(Math.floor(t*12),i);const fx=Math.round(x+(a-.5)*14*k),hgt=Math.round((4+b*10)*k),fy=Math.round(y-hgt);g.fillStyle=b>.7?'rgba(255,236,160,.95)':b>.35?'rgba(255,170,70,.9)':'rgba(230,90,40,.85)';g.fillRect(fx,fy,2,hgt);}
  g.fillStyle='rgba(255,220,140,.9)';g.fillRect(x-5,y-3,10,3);}
function makeBuilding(o){
  const ov=5,top=12,cw=o.w+ov*2,ch=top+o.rh+o.fh+2,c=mk(cw,ch),g=c.getContext('2d'),p=painter(g);
  const fx=ov,fy=top+o.rh,fw=o.w,fh=o.fh,wall=o.wall,wallD=shade(wall,-.1),beam='#5a3a28',beamL='#73503a';
  p(fx,fy,fw,fh,wall);
  for(let y=fy;y<fy+fh;y++)for(let x=fx;x<fx+fw;x++)if(hash2(x*3+o.bx,y*7)<.07)p(x,y,1,1,wallD);
  p(fx+fw-4,fy,4,fh,shade(wall,-.16));
  p(fx,fy,fw,3,beam);p(fx,fy+fh-10,fw,2,beam);p(fx,fy+fh-10,fw,1,beamL);
  const busy=x=>{if(x>=o.door-4&&x<=o.door+18)return true;for(const w of o.windows)if(x>=w-4&&x<=w+15)return true;return false;};
  for(let x=0;x<fw;x+=22){if(x===0||!busy(x)){p(fx+x,fy,3,fh-10,beam);p(fx+x,fy,1,fh-10,beamL);}}
  p(fx+fw-3,fy,3,fh-10,beam);
  const sy=fy+fh-7;p(fx,sy,fw,7,'#6a655f');
  for(let r=0;r<2;r++){const yy=sy+1+r*3;for(let x=fx-(r?4:0);x<fx+fw;x+=7){const x0=Math.max(fx,x),x1=Math.min(fx+fw,x+6);if(x1>x0){const col=hash2(x,yy+o.bx)<.5?'#9a958e':'#8b867f';p(x0,yy,x1-x0,2,col);p(x0,yy,x1-x0,1,shade(col,.14));}}}
  g.fillStyle='rgba(40,20,40,.32)';g.fillRect(fx,fy+3,fw,3);
  o.win=[];
  for(const wx of o.windows){const x=fx+wx,y=fy+10;
    p(x-1,y-1,14,14,'#4a3020');p(x,y,12,12,'#2c3a55');p(x+1,y+1,3,2,'#6f8db3');p(x+1,y+3,1,2,'#56739a');
    p(x+5,y,2,12,'#4a3020');p(x,y+5,12,2,'#4a3020');
    p(x-1,y+13,14,3,'#6b4a33');p(x-1,y+15,14,1,'#4e3322');
    if(!o.noFlowers)for(let i=0;i<6;i++){const col=['#e0564a','#f2c14e','#f08aa8'][i%3];p(x+i*2,y+11+(i&1),2,2,col);p(x+i*2+1,y+12+(i&1),1,1,'#4f8a3a');}
    o.win.push({dx:wx,dy:-fh+10});}
  const dx=fx+o.door,dw=14,dh=22,dyy=fy+fh-dh;
  p(dx-2,dyy-2,dw+4,dh+2,'#4a3020');p(dx,dyy,dw,dh,'#7a5034');for(let i=3;i<dw;i+=4)p(dx+i,dyy,1,dh,'#5e3c26');p(dx,dyy,dw,1,'#94653f');
  p(dx-2,dyy-2,1,1,wall);p(dx+dw+1,dyy-2,1,1,wall);p(dx+dw-3,dyy+12,1,1,'#e3c060');
  p(dx-3,fy+fh,dw+6,2,'#9a958e');p(dx-3,fy+fh,dw+6,1,'#b2ada5');
  if(o.sign){const sx=dx-4,syy=fy+7;p(sx,syy,22,9,'#4a3020');p(sx+1,syy+1,20,7,'#9a6a40');p(sx+1,syy+1,20,1,'#b07c4c');
    if(o.sign==='inn'){p(sx+6,syy+3,8,3,'#efe6d0');p(sx+12,syy+2,3,2,'#efe6d0');p(sx+15,syy+2,1,1,'#e6a030');p(sx+13,syy+2,1,1,'#2a2140');}
    else{p(sx+5,syy+3,12,2,'#5a5a64');p(sx+9,syy+5,4,2,'#5a5a64');p(sx+5,syy+3,12,1,'#9a9aa6');}}
  const rx=1,ry=top,rw=cw-2,rh=o.rh+3,R=o.roof,RD=shade(R,-.22),RDD=shade(R,-.42),RL=shade(R,.18);
  for(let row=0;row*4<rh;row++){const yy=ry+row*4,off=(row&1)?3:0,t=row/(rh/4),base=t<.3?RL:t>.72?RD:R;p(rx,yy,rw,Math.min(4,ry+rh-yy),base);
    for(let x=rx-off;x<rx+rw;x+=6){const x0=Math.max(rx,x);p(x0,yy+3,Math.min(5,rx+rw-x0),1,RD);if(x+5<rx+rw&&x+5>=rx)p(x+5,yy,1,3,RD);}}
  p(rx,ry,rw,2,RDD);p(rx,ry+2,rw,1,RL);p(rx,ry,2,rh,RD);p(rx+rw-3,ry,3,rh,RDD);p(rx,ry+rh-2,rw,2,RDD);
  if(o.chimney){const cxp=rx+rw-24;p(cxp,ry-10,9,14,'#8b867f');p(cxp+6,ry-10,3,14,'#6a655f');p(cxp-1,ry-11,11,2,'#6a655f');p(cxp,ry-11,9,1,'#a9a49c');
    for(let yy=ry-8;yy<ry+3;yy+=3)p(cxp,yy,6,1,'#77726b');o.chim={dx:cxp+4-ov,dy:ry-12-(ch-2)};}
  return finalize(c,{rim:false});}
function makeMon(sp,f){
  const big=sp==='jelly',c=mk(big?24:28,big?32:22),g=c.getContext('2d'),p=painter(g,1,1),K='#2a2140';
  if(sp==='squirrel'){const hop=f?-2:0;
    ell(p,7,8+hop,6.5,6.5,'#f4f0e8',(x,y,e)=>e>.75?'#e2dccb':(hash2(x,y)<.18?'#d4ccb8':(y<6+hop?'#ffffff':'#f4f0e8')));
    for(const [x,y] of [[1,3],[3,1],[12,2],[0,8],[13,6]])p(x,y+hop,1,1,'#ece6d6');
    p(11,10+hop,9,6,'#d09050');p(11,15+hop,9,1,'#a86e3a');p(13,12+hop,5,3,'#f0d8b0');
    p(16,6+hop,7,6,'#d89a5a');p(16,6+hop,7,1,'#e8b070');p(18,4+hop,2,2,'#c08048');p(21,4+hop,1,2,'#c08048');p(20,8+hop,1,1,K);p(22,9+hop,1,1,'#4a2e1e');p(19,10+hop,1,1,'#ec9c8c');
    p(12,16+hop,3,2,'#a86e3a');p(17,16+(f?0:hop),3,2,'#a86e3a');}
  else if(sp==='frog'){const j=f?-2:0;
    p(2,13+j,5,3+(f?2:0),'#3a8aaa');p(14,15,4,2,'#3a8aaa');
    ell(p,10,11+j,8.5,5.5,'',(x,y,e)=>y>13+j&&e<.8?'#d0ecf0':(y<9+j?'#6ac0dc':'#4aa0c0'));
    ell(p,9,4+j,2.6,2.6,'#6ac0dc');ell(p,15,4+j,2.6,2.6,'#6ac0dc');p(9,3+j,2,3,'#ffffff');p(15,3+j,2,3,'#ffffff');p(10,4+j,1,2,K);p(16,4+j,1,2,K);
    ell(p,17,10+j,2.6,2.4,'#aee8ff');p(16,9+j,1,1,'#ffffff');p(12,12+j,4,1,'#2a6a8a');}
  else if(sp==='turtle'){const s=f?1:0;
    p(4+s,14,4,5,'#7a8a5a');p(17-s,14,4,5,'#6a7a4a');p(1,12,3,2,'#7a8a5a');
    ell(p,11.5,10,10.5,7,'',(x,y,e)=>y>14?'#3a5226':e>.82?'#4e6e34':(y<6?'#7a9e4c':(hash2(x,y)<.2?'#8ab858':'#5e8240')));
    for(const [x,y,c] of [[7,4,'#f2cf55'],[13,3,'#ef8fb0'],[16,6,'#f2cf55'],[10,7,'#ffffff']])p(x,y,1,1,c);
    p(4,14,15,2,'#c8b888');
    p(20,8,6,6,'#9aaa78');p(20,8,6,1,'#b0c090');p(24,10,1,1,K);p(25,12,1,1,'#6a7a4a');}
  else if(sp==='mole'){const s=f?1:0;
    p(4,15,4,3,'#6a5a4a');
    ell(p,11,10,9.5,6.5,'',(x,y,e)=>y>13&&x>5&&x<17?'#a8988a':(e>.8?'#7a6a5a':'#8a7a6a'));
    for(const [x,y] of [[6,6],[9,4],[12,6],[7,9]]){p(x,y,3,2,'#9a9a9a');p(x,y,2,1,'#c8c8c8');}
    p(19,8,4,4,'#f08a9a');p(20,8,2,1,'#ffb8c4');p(16,7,1,1,K);
    p(15+s,15,5,2,'#e8dcc0');p(16+s,17,4,1,'#d8ccb0');p(20+s,15,1,1,'#f4ecd8');}
  else if(sp==='snail'){const s=f?1:0;
    p(1,14,20+s,4,'#c89a6a');p(1,17,20+s,1,'#a07850');p(1,14,20+s,1,'#d8aa78');
    p(17+s,8,6,8,'#d8aa78');p(17+s,8,6,1,'#e8c090');p(18+s,3,1,5,'#d8aa78');p(22+s,4,1,4,'#c89a6a');p(17+s,2,2,2,K);p(22+s,3,2,2,K);p(20+s,12,1,1,'#a07850');
    p(3,9,14,6,'#b8863a');p(3,9,14,1,'#e0b060');p(15,10,2,5,'#8a5e28');p(3,14,14,1,'#8a5e28');p(0,11,3,2,'#b8863a');
    p(6,3,9,6,'#f4d68a');p(7,2,7,1,'#f4d68a');p(7,3,2,3,'#fff6d0');p(9,4,3,4,'#ffb04a');p(9,1,3,1,'#8a5e28');}
  else if(sp==='jelly'){const w=f?1:0;
    ell(p,11,9,10,8.5,'',(x,y,e)=>y>15?null:((x%3===0)?'#d8b878':(y<4?'#fff0c8':'#f2dcaa')));
    p(7,0,9,2,'#8a3a2a');p(8,0,7,1,'#a84a32');p(2,15,19,2,'#8a3a2a');p(3,15,17,1,'#a84a32');
    p(8,8,1,2,'#6a3a2a');p(14,8,1,2,'#6a3a2a');p(10,11,3,1,'#c07050');p(6,10,1,1,'#f0a090');p(16,10,1,1,'#f0a090');
    for(const [x,col,len] of [[4,'#c0392b',9],[9,'#e6b84a',12],[13,'#c0392b',10],[18,'#e6b84a',8]])for(let i=0;i<len;i++)p(x+((Math.floor(i/3)+w)%2),17+i,2,1,col);}
  return finalize(c);}
const MONSPR={},MONSPRL={},MONW={},MONWL={},MONSIL={};
function whiteOf(c){const w=mk(c.width,c.height),g=w.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#ffffff';g.fillRect(0,0,w.width,w.height);return hkOf(w,c);}
function silOf(c){const w=mk(c.width,c.height),g=w.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#1a1630';g.fillRect(0,0,w.width,w.height);return hkOf(w,c);}

/* ================= monster data (50) ================= */
// form: blob quad bird fish bug golem serpent sprite plant crab | size 1..3 | c:[body, accent, detail]
const SPECIES={
  // ---- 로웬 ----
  squirrel:{r:'rowen',name:'솜꼬리다람쥐',el:'바람',hp:30,atk:4,spd:44,cap:.9,work:{log:3,farm:1},flee:true,drop:[['wood',1,2]],desc:'민들레 솜 같은 꼬리로 활공한다. 나무를 갉아 쓰러뜨리는 데 선수다.'},
  frog:{r:'rowen',name:'방울개구리',el:'물',hp:36,atk:5,spd:30,cap:.85,work:{farm:2},drop:[['berry',1,2]],desc:'볼에 물방울을 머금고 다닌다. 밭에 물을 주며 열매를 키운다.'},
  turtle:{r:'rowen',name:'이끼등거북',el:'풀',hp:62,atk:3,spd:11,cap:.85,work:{farm:3},drop:[['berry',1,2]],desc:'등 위에 작은 이끼 정원을 키운다. 밭일의 달인이지만 걸음이 느리다.'},
  leafdrop:{r:'rowen',name:'풀잎방울',el:'풀',form:'blob',size:1,c:['#7cc050','#c8ec90','#3f6e2c'],acc:'leaf',hp:28,atk:3,spd:24,cap:.92,work:{farm:1},drop:[['berry',1,1]],desc:'이슬을 머금은 풀잎이 뭉쳐 생겼다. 햇볕을 쬐면 몸이 통통해진다.'},
  acornboar:{r:'rowen',name:'도토리멧돼지',el:'땅',form:'quad',size:2,c:['#9a6a42','#d8b48a','#5a3a24'],acc:'acorn',hp:52,atk:6,spd:30,cap:.85,work:{log:2},terr:true,drop:[['wood',1,2]],desc:'머리에 도토리 모자를 쓴 멧돼지. 영역에 들어오면 콧김부터 뿜는다.'},
  sparrow:{r:'rowen',name:'깃털참새',el:'바람',form:'bird',size:1,c:['#b88a5a','#f0d8b0','#7a4a2a'],acc:'none',hp:26,atk:4,spd:46,cap:.9,work:{farm:1,log:1},flee:true,drop:[['berry',1,1]],desc:'로웬 지붕마다 앉아 있는 참새. 씨앗을 물어다 밭에 심는다.'},
  fairy:{r:'rowen',name:'들꽃요정',el:'풀',form:'plant',size:1,c:['#5f9a3a','#f08ab0','#fff0a0'],acc:'flower',hp:30,atk:4,spd:22,cap:.85,work:{farm:2},drop:[['berry',1,2]],desc:'들꽃이 걸어 다니는 모습. 밟힌 풀을 다시 일으켜 세운다.'},
  honeybug:{r:'rowen',name:'꿀벌레',el:'풀',form:'bug',size:1,c:['#e6b84a','#3a2a22','#fff0b0'],acc:'antenna',hp:32,atk:5,spd:34,cap:.85,work:{craft:1,farm:1},drop:[['berry',1,1]],desc:'꿀을 모아 둥근 밀랍을 빚는다. 손재주가 제법 좋다.'},
  mudpuff:{r:'rowen',name:'진흙방울',el:'땅',form:'blob',size:1,c:['#8a6a4a','#b8946a','#4a3424'],acc:'none',hp:34,atk:4,spd:20,cap:.9,work:{mine:1},drop:[['stone',1,1]],desc:'연못가 진흙이 뭉쳐 생겼다. 굴러다니며 자갈을 줍는다.'},
  firefly:{r:'rowen',name:'반딧불정령',el:'달빛',form:'sprite',size:1,c:['#d8f080','#ffffff','#7a9a3a'],acc:'none',hp:36,atk:5,spd:28,cap:.7,work:{craft:1,farm:1},night:true,light:1,glow:'220,255,130',drop:[['berry',1,2]],desc:'밤에만 나타나는 작은 빛. 거점에 두면 밤에도 주변을 밝힌다.'},
  // ---- 평원 ----
  windfox:{r:'plains',name:'바람여우',el:'바람',form:'quad',size:2,c:['#e8a050','#fff4e0','#8a4a22'],acc:'fluff',hp:48,atk:7,spd:42,cap:.8,work:{log:1,craft:1},drop:[['wood',1,2]],desc:'바람을 타고 풀밭을 가로지른다. 꼬리 끝이 늘 흔들린다.'},
  bull:{r:'plains',name:'초원황소',el:'땅',form:'quad',size:3,c:['#7a5a40','#e8dcc0','#3a2a20'],acc:'horn',hp:96,atk:9,spd:22,cap:.7,work:{mine:2,log:1},terr:true,drop:[['stone',1,2],['wood',1,1]],desc:'평원의 주인. 뿔을 낮추면 돌진이 시작된다.'},
  sheep:{r:'plains',name:'민들레양',el:'풀',form:'quad',size:2,c:['#f6f2e6','#3a3430','#d8d0c0'],acc:'fluff',hp:50,atk:4,spd:20,cap:.88,work:{farm:2},drop:[['berry',1,2]],desc:'털이 민들레 솜처럼 날린다. 바람 부는 날엔 몸이 가벼워진다.'},
  rat:{r:'plains',name:'들쥐도적',el:'땅',form:'quad',size:1,c:['#9a948a','#e8dcd0','#4a4440'],acc:'none',hp:28,atk:5,spd:48,cap:.85,work:{craft:1},flee:true,drop:[['berry',1,1],['ore',.1,1]],desc:'반짝이는 걸 보면 훔쳐 달아난다. 굴 안에 보물을 쌓아 둔다.'},
  lark:{r:'plains',name:'하늘종달',el:'바람',form:'bird',size:1,c:['#6a9ad8','#e8f0ff','#2a4a7a'],acc:'none',hp:30,atk:5,spd:46,cap:.85,work:{farm:1},flee:true,drop:[['berry',1,1]],desc:'해 뜰 무렵 가장 먼저 노래한다. 높이 날아 씨앗을 뿌린다.'},
  grasssnake:{r:'plains',name:'풀뱀',el:'풀',form:'serpent',size:2,c:['#5aa03a','#c8e890','#2a5a1e'],acc:'none',hp:44,atk:7,spd:30,cap:.8,work:{log:1},drop:[['wood',1,1]],desc:'풀 사이에 숨어 지나가는 발목을 노린다. 겁은 많다.'},
  locust:{r:'plains',name:'메뚜기기사',el:'풀',form:'bug',size:2,c:['#7ab048','#d8ec90','#3a5a22'],acc:'horn',hp:54,atk:8,spd:36,cap:.78,work:{log:2},terr:true,drop:[['wood',1,2]],desc:'이마의 뿔을 창처럼 세운 메뚜기. 결투를 신청해 온다.'},
  sunflower:{r:'plains',name:'해바라기',el:'풀',form:'plant',size:2,c:['#4a8a32','#f6c83a','#7a4a1e'],acc:'sun',hp:56,atk:5,spd:14,cap:.8,work:{farm:3},drop:[['berry',2,3]],desc:'해를 따라 고개를 돌린다. 밭에 두면 열매가 쑥쑥 자란다.'},
  earthgolem:{r:'plains',name:'흙골렘',el:'땅',form:'golem',size:2,c:['#8a7050','#a8906a','#5a8a3a'],acc:'moss',hp:78,atk:8,spd:16,cap:.72,work:{mine:2,craft:1},terr:true,drop:[['stone',2,3]],desc:'흙더미가 일어선 모습. 등에 풀이 자란다.'},
  jelly:{r:'plains',name:'유등해파리',el:'달빛',hp:84,atk:8,spd:16,cap:.45,work:{log:1,mine:1,farm:1,craft:1},light:2,aura:true,night:true,float:true,rare:true,drop:[['ore',1,2]],desc:'종이 등불처럼 밤하늘을 떠다니는 희귀종. 거점에 있으면 밤에도 모두가 제 힘을 낸다.'},
  // ---- 암석 ----
  mole:{r:'rock',name:'자갈두더지',el:'바위',hp:50,atk:6,spd:26,cap:.8,work:{mine:3,craft:1},terr:true,drop:[['stone',1,2]],desc:'곡괭이 같은 앞발로 돌을 캔다. 영역에 들어오면 먼저 달려든다.'},
  snail:{r:'rock',name:'등잔달팽이',el:'불',hp:42,atk:4,spd:13,cap:.85,work:{craft:3},light:1,drop:[['stone',1,1],['ore',.3,1]],desc:'등껍질이 작은 등잔이다. 불 앞에서 일을 잘하고, 밤에는 거점을 밝힌다.'},
  rockcrab:{r:'rock',name:'바위게',el:'바위',form:'crab',size:2,c:['#8a847a','#b8b2a6','#5a5650'],acc:'none',hp:64,atk:8,spd:22,cap:.8,work:{mine:2},terr:true,drop:[['stone',2,2]],desc:'바위인 척 가만히 있다가 집게를 휘두른다.'},
  crystalbat:{r:'rock',name:'수정박쥐',el:'달빛',form:'bird',size:1,c:['#6a4a8a','#c8a8f0','#2a1a3a'],acc:'crystal',hp:40,atk:7,spd:40,cap:.75,work:{mine:1},night:true,light:1,glow:'190,160,255',drop:[['ore',1,1]],desc:'날개에 수정 조각이 박혀 있다. 밤이 되면 동굴에서 날아오른다.'},
  stonebeetle:{r:'rock',name:'돌갑충',el:'바위',form:'bug',size:2,c:['#6a6260','#9a928a','#3a3432'],acc:'spikes',hp:70,atk:9,spd:20,cap:.75,work:{mine:2},terr:true,drop:[['stone',1,2],['ore',.2,1]],desc:'등껍질이 돌처럼 단단하다. 몸을 굴려 부딪쳐 온다.'},
  oregolem:{r:'rock',name:'광석골렘',el:'바위',form:'golem',size:3,c:['#6a6474','#8a8494','#c8d0e8'],acc:'crystal',hp:120,atk:11,spd:12,cap:.42,work:{mine:3,craft:2},rare:true,terr:true,drop:[['ore',2,3]],desc:'몸 곳곳에 은빛 광석이 박힌 거인. 쓰러뜨리면 광석을 쏟아 낸다.'},
  goat:{r:'rock',name:'절벽산양',el:'바위',form:'quad',size:2,c:['#e8e4dc','#a89a88','#5a5048'],acc:'horn',hp:58,atk:8,spd:38,cap:.8,work:{log:1,mine:1},flee:true,drop:[['stone',1,1]],desc:'가파른 바위도 겁 없이 오른다. 뿔이 크게 말려 있다.'},
  sandlizard:{r:'rock',name:'모래도마뱀',el:'땅',form:'serpent',size:1,c:['#c8a870','#f0dcb0','#7a5a3a'],acc:'spikes',hp:40,atk:7,spd:36,cap:.85,work:{craft:1},drop:[['stone',1,1]],desc:'햇볕이 드는 바위 위에서 몸을 데운다.'},
  mosswisp:{r:'rock',name:'이끼돌정령',el:'풀',form:'sprite',size:1,c:['#7a9a6a','#c8e0b0','#3a5a32'],acc:'moss',hp:42,atk:6,spd:24,cap:.8,work:{farm:1,mine:1},drop:[['berry',1,1],['stone',1,1]],desc:'오래된 바위에 핀 이끼가 깨어났다.'},
  cavemush:{r:'rock',name:'동굴버섯',el:'달빛',form:'plant',size:1,c:['#d8d0c0','#4ac0b0','#c8fff4'],acc:'mush',hp:44,atk:5,spd:12,cap:.82,work:{farm:2},light:1,glow:'90,230,210',drop:[['berry',1,2]],desc:'어두운 곳에서 은은하게 빛나는 버섯. 포자를 뿌려 작물을 키운다.'},
  // ---- 호수 ----
  waterslime:{r:'lake',name:'물방울슬라임',el:'물',form:'blob',size:1,c:['#5ab8e8','#c8f0ff','#2a6a9a'],acc:'drop',hp:40,atk:6,spd:22,cap:.88,work:{farm:2},drop:[['berry',1,1]],desc:'호숫물이 동그랗게 뭉쳤다. 몸속에 작은 물고기가 비친다.'},
  clam:{r:'lake',name:'조개집게',el:'물',form:'crab',size:1,c:['#e89a9a','#fff0e8','#9a4a4a'],acc:'none',hp:46,atk:8,spd:24,cap:.82,work:{craft:2},drop:[['stone',1,1],['ore',.15,1]],desc:'등에 조개껍데기를 진 게. 껍데기를 다듬는 솜씨가 좋다.'},
  carp:{r:'lake',name:'은비늘잉어',el:'물',form:'fish',size:2,c:['#c8d0dc','#f4f6ff','#6a7a9a'],acc:'none',hp:54,atk:7,spd:30,cap:.78,work:{farm:1},aquatic:true,drop:[['berry',1,2]],desc:'은빛 비늘이 햇빛에 반짝인다. 호수 위로 튀어 오른다.'},
  lotus:{r:'lake',name:'연잎동자',el:'풀',form:'plant',size:1,c:['#4a9a5a','#f8c0d8','#2a6a3a'],acc:'lotus',hp:44,atk:5,spd:18,cap:.85,work:{farm:3},drop:[['berry',2,2]],desc:'연잎을 모자처럼 쓴 꼬마. 물가의 작물을 잘 돌본다.'},
  kingfisher:{r:'lake',name:'물총새',el:'물',form:'bird',size:1,c:['#2a9ab0','#f0a050','#1a4a6a'],acc:'none',hp:38,atk:8,spd:46,cap:.8,work:{log:1},flee:true,drop:[['berry',1,1]],desc:'물속으로 번개처럼 꽂힌다. 부리가 단단하다.'},
  mist:{r:'lake',name:'안개정령',el:'달빛',form:'sprite',size:2,c:['#c8dcf0','#ffffff','#6a8ab0'],acc:'none',hp:56,atk:8,spd:20,cap:.65,work:{craft:2},night:true,float:true,light:1,glow:'190,220,255',drop:[['ore',1,1]],desc:'밤안개가 모여 생긴 정령. 다가가면 차가운 기운이 돈다.'},
  lakesnake:{r:'lake',name:'호수뱀',el:'물',form:'serpent',size:2,c:['#2a5a8a','#8ac0e0','#14304a'],acc:'fin',hp:62,atk:10,spd:28,cap:.72,work:{mine:1},aquatic:true,drop:[['stone',1,1]],desc:'호수 깊은 곳을 유유히 헤엄친다. 등지느러미만 보일 때가 많다.'},
  puffer:{r:'lake',name:'거품복어',el:'물',form:'fish',size:1,c:['#f0d060','#fff8d0','#9a7a2a'],acc:'spikes',hp:42,atk:9,spd:22,cap:.82,work:{craft:1},aquatic:true,drop:[['berry',1,1]],desc:'놀라면 가시를 세우고 동그랗게 부푼다.'},
  otter:{r:'lake',name:'개울수달',el:'물',form:'quad',size:2,c:['#7a5034','#e8d0b0','#3a2418'],acc:'none',hp:56,atk:8,spd:34,cap:.8,work:{log:2,craft:1},drop:[['wood',1,2]],desc:'나뭇가지로 둑을 쌓는 재주꾼. 벌목장에서도 부지런하다.'},
  watergolem:{r:'lake',name:'물골렘',el:'물',form:'golem',size:3,c:['#4a7a9a','#8ab8d8','#c8f0ff'],acc:'crystal',hp:118,atk:11,spd:12,cap:.42,work:{mine:2,craft:2},rare:true,terr:true,drop:[['ore',2,3]],desc:'호수 바닥의 돌이 물을 품고 일어섰다. 몸에서 물방울이 끊임없이 떨어진다.'},
  // ---- 화산 ----
  emberslime:{r:'volcano',name:'불씨슬라임',el:'불',form:'blob',size:1,c:['#f08a3c','#ffd08a','#9a3a1a'],acc:'flame',hp:48,atk:9,spd:22,cap:.85,work:{craft:2},light:1,glow:'255,160,70',drop:[['stone',1,1],['obs',.25,1]],desc:'몸이 뜨거워 지나간 자리에 그을음이 남는다.'},
  lavalizard:{r:'volcano',name:'용암도마뱀',el:'불',form:'serpent',size:2,c:['#c0392b','#f6a04a','#5a1a14'],acc:'spikes',hp:70,atk:12,spd:30,cap:.75,work:{craft:2},terr:true,drop:[['obs',1,1]],desc:'용암 가장자리를 헤엄치듯 걷는다. 등의 가시가 붉게 달아 있다.'},
  ashbat:{r:'volcano',name:'잿빛박쥐',el:'불',form:'bird',size:1,c:['#4a3a3a','#9a6a5a','#1a1212'],acc:'none',hp:46,atk:10,spd:42,cap:.8,work:{log:1},night:true,drop:[['stone',1,1]],desc:'화산재 속을 날아다닌다. 밤이면 무리 지어 덤빈다.'},
  obsidiancrab:{r:'volcano',name:'흑요석게',el:'바위',form:'crab',size:2,c:['#3a2a4a','#7a6a9a','#140c1a'],acc:'crystal',hp:84,atk:12,spd:20,cap:.72,work:{mine:3},terr:true,drop:[['obs',1,2]],desc:'흑요석 껍데기는 칼날처럼 날카롭다.'},
  volsheep:{r:'volcano',name:'화산양',el:'불',form:'quad',size:2,c:['#3a3434','#f08a3c','#1a1414'],acc:'flame',hp:76,atk:11,spd:26,cap:.75,work:{mine:1,craft:1},light:1,glow:'255,150,70',drop:[['obs',1,1],['stone',1,1]],desc:'털 대신 불꽃이 일렁이는 양. 추운 밤에 곁에 두면 따뜻하다.'},
  flamewisp:{r:'volcano',name:'불꽃정령',el:'불',form:'sprite',size:1,c:['#ffb04a','#fff0c0','#c0392b'],acc:'flame',hp:52,atk:11,spd:30,cap:.72,work:{craft:3},float:true,light:2,glow:'255,170,80',drop:[['obs',1,1]],desc:'용암에서 튀어 오른 불티가 정령이 됐다. 제작대 앞에서 신이 난다.'},
  magmagolem:{r:'volcano',name:'마그마골렘',el:'불',form:'golem',size:3,c:['#2a2222','#4a3a34','#ff7a2a'],acc:'lava',hp:140,atk:14,spd:11,cap:.38,work:{mine:3,craft:3},rare:true,terr:true,light:1,glow:'255,120,50',drop:[['obs',2,3],['ore',1,2]],desc:'식은 용암 껍질 틈으로 마그마가 흐른다. 화산의 문지기.'},
  sulfurbeetle:{r:'volcano',name:'유황딱정벌레',el:'땅',form:'bug',size:2,c:['#d8c040','#f6ea90','#6a5a1a'],acc:'horn',hp:72,atk:11,spd:24,cap:.75,work:{mine:2},drop:[['stone',1,2],['obs',.3,1]],desc:'유황 냄새를 풍기며 바위를 파고든다.'},
  embertree:{r:'volcano',name:'불티나무',el:'불',form:'plant',size:2,c:['#4a3a30','#ff8a3a','#ffd08a'],acc:'flame',hp:80,atk:10,spd:10,cap:.72,work:{log:2,craft:1},light:1,glow:'255,140,60',drop:[['wood',2,3]],desc:'잿더미에서 자라는 나무. 가지 끝마다 불티가 맺힌다.'},
  phoenix:{r:'volcano',name:'불새 새끼',el:'불',form:'bird',size:2,c:['#f06a3a','#ffd060','#9a2a1a'],acc:'crest',hp:96,atk:13,spd:36,cap:.35,work:{craft:2,log:1,mine:1,farm:1},night:true,rare:true,aura:true,light:2,glow:'255,180,90',drop:[['obs',2,2],['ore',1,1]],desc:'화산 꼭대기에서 밤에만 모습을 보이는 전설의 새끼. 거점에 있으면 밤에도 모두가 힘을 낸다.'}
};
Object.assign(SPECIES,{
  g_rowen:{r:'rowen',boss:true,name:'고목 수호자 느티',el:'풀',form:'plant',size:4,c:['#6a4a30','#4e8a3c','#e6c05a'],acc:'none',hp:420,atk:10,spd:12,cap:0,work:{log:3,farm:3,craft:2},light:0,drop:[],desc:'로웬 숲의 가장 오래된 느티나무. 첫 정착민이 맡긴 등불 조각을 뿌리 속에 품고 있었다.'},
  g_plains:{r:'plains',boss:true,name:'바람갈기 질풍',el:'바람',form:'quad',size:4,c:['#d8d2bc','#ffffff','#5a6a8a'],acc:'fluff',hp:1400,atk:16,spd:40,cap:0,work:{log:3,mine:2,farm:2,craft:2},drop:[],desc:'평원을 가로지르는 바람 그 자체. 갈기를 한 번 털면 풀밭 전체가 눕는다.'},
  g_rock:{r:'rock',boss:true,name:'수정 거인 반석',el:'바위',form:'golem',size:4,c:['#5a5a7a','#7a7a9a','#c8e0ff'],acc:'crystal',hp:3000,atk:26,spd:14,cap:0,work:{mine:3,craft:3,log:1},light:1,glow:'170,200,255',drop:[],desc:'암석 지역의 뼈대가 일어선 거인. 몸속 수정이 지역의 모든 광석을 부른다.'},
  g_lake:{r:'lake',boss:true,name:'안개 용 물안개',el:'물',form:'serpent',size:4,c:['#3a6a9a','#a8d8f0','#14304a'],acc:'fin',hp:3800,atk:30,spd:30,cap:0,work:{farm:3,craft:2,mine:2},aquatic:true,drop:[],desc:'호수 깊은 곳에서 안개를 뿜는 용. 물을 다스려 밭을 늘 촉촉하게 한다.'},
  g_volcano:{r:'volcano',boss:true,name:'불새 여왕 홍염',el:'불',form:'bird',size:4,c:['#e0402a','#ffd060','#7a1a10'],acc:'crest',hp:5600,atk:36,spd:34,cap:0,work:{craft:3,log:2,mine:2,farm:2},light:2,aura:true,glow:'255,170,80',drop:[],desc:'화산 꼭대기에 둥지를 튼 불새들의 여왕. 날개를 펴면 밤하늘이 낮처럼 밝아진다.'}});
const DEX_ORDER=Object.keys(SPECIES).filter(k=>!SPECIES[k].boss);
const BOSS_IDS=Object.keys(SPECIES).filter(k=>SPECIES[k].boss);
const EL_C={'풀':'#7cc050','물':'#5ab8e0','불':'#f08a3c','바위':'#b8ac96','바람':'#d8d2bc','달빛':'#f6d890','땅':'#c8a070'};
for(const k of DEX_ORDER)SPECIES[k].elC=EL_C[SPECIES[k].el]||'#ccc';
/* ---- 원소 상성: 물>불>풀>바위>바람>땅>물 (약점 1.5배 · 반대 방향은 0.5배). 달빛·무속성은 상성 없음 ---- */
const EL_STRONG={'물':'불','불':'풀','풀':'바위','바위':'바람','바람':'땅','땅':'물'},EL_WEAK_MUL=1.5,EL_RES_MUL=.5;
function elemMul(a,d){if(!a||!d)return 1;if(EL_STRONG[a]===d)return EL_WEAK_MUL;if(EL_STRONG[d]===a)return EL_RES_MUL;return 1;}
function weakOf(d){for(const a in EL_STRONG)if(EL_STRONG[a]===d)return a;return '';}
function strongVs(a){return EL_STRONG[a]||'';}
function elTag(e,pap){return !e?'':pap?`<span class="el" style="--c:${EL_C[e]}">${e}</span>`:`<span style="color:${EL_C[e]}">${e}</span>`;}
function elHint(e,pap){const w=weakOf(e);return w?`약점 ${elTag(w,pap)}`:'약점 없음';}

/* ---- generator ---- */
function ell(p,cx,cy,rx,ry,col,fn){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const e=((x-cx)/rx)**2+((y-cy)/ry)**2;if(e<=1){const c=fn?fn(x,y,e):col;if(c)p(x,y,1,1,c);}}}
const shd=(base,cy,ry)=>{const L=shade(base,.2),D=shade(base,-.3);return (x,y,e)=>e>.82?D:(y<cy-ry*.35?L:base);};
function eyes(p,x,y,K,big){p(x,y,big?2:1,2,K);if(big)p(x,y,1,1,'#ffffff');}
function genMon(def,f){
  const s=def.size||1,Wd=[0,24,30,38,56][s],Ht=[0,20,24,32,48][s],c=mk(Wd+2,Ht+2),g=c.getContext('2d'),p=painter(g,1,1);
  const [A,B,C]=def.c,K='#2a2140',k=[0,.8,1,1.3,1.95][s],anc={top:[Wd/2,2],head:[Wd*.7,Ht*.4],back:[Wd*.4,Ht*.4]};
  const f4=(f|0)%4,fr=f4%2;
  if(def.form==='blob'){const cy=Ht-7*k-fr,rx=8*k+(fr?1:0),ry=6.5*k-(fr?1:0),cx=Wd/2;
    ell(p,cx,cy,rx,ry,'',shd(A,cy,ry));ell(p,cx,cy+ry*.45,rx*.6,ry*.3,'',(x,y)=>B);p(Math.round(cx-rx*.5),Math.round(cy-ry*.55),2,1,shade(A,.45));
    eyes(p,Math.round(cx+rx*.15),Math.round(cy-ry*.2),K,true);eyes(p,Math.round(cx+rx*.55),Math.round(cy-ry*.2),K,true);p(Math.round(cx+rx*.35),Math.round(cy+ry*.2),2,1,C);
    anc.top=[cx,cy-ry];anc.head=[cx+rx*.3,cy-ry*.6];anc.back=[cx-rx*.3,cy-ry*.8];}
  else if(def.form==='quad'){let cy=Ht-10*k;const cx=Wd*.42,rx=9*k,ry=5.5*k,lg=Math.round(4*k);
    /* trot gait: diagonal pairs swing forward/back, the passing pair lifts; body rises 1px while passing */
    const st=Math.max(2,Math.round(2*k)),lf=Math.max(2,Math.round(1.5*k)),bu=fr?1:0,lw=Math.round(2*k)+1,ly=Math.round(cy+ry*.5)-bu,gnd=Math.min(Ht+1,Math.round(cy+ry*.5)+lg+1+Math.round(1.2*k));
    const PA=[[st,0],[0,lf],[-st,0],[0,0]][f4],PB=[[-st,0],[0,0],[st,0],[0,lf]][f4];
    const leg=(bx,P,col)=>{const x=Math.round(clamp(bx+P[0]+lw/2,cx-rx*.74,cx+rx*.74)-lw/2),xm=(x+lw/2-cx)/rx,top=Math.min(ly,Math.round(cy-bu+ry*Math.sqrt(Math.max(0,1-xm*xm))*.85)-1),bot=gnd-P[1];/* top tucked under the belly curve so a swung leg never floats */p(x,top,lw,Math.max(1,bot-top),col);p(x+(P[0]>0?lw-1:0),bot-1,1,1,shade(col,-.25));};
    leg(cx-rx*.7,PA,C);leg(cx+rx*.5,PB,C);leg(cx-rx*.4,PB,shade(C,.15));leg(cx+rx*.8,PA,shade(C,.15));
    cy-=bu;
    if(def.acc==='fluff')ell(p,cx-rx-2*k,cy-ry*.6,4.5*k,4.5*k,'',(x,y,e)=>e>.8?shade(B,-.15):B);else{p(Math.round(cx-rx-2),Math.round(cy-ry*.5),3,2,A);p(Math.round(cx-rx-3),Math.round(cy-ry*.8),2,2,A);}
    ell(p,cx,cy,rx,ry,'',shd(A,cy,ry));ell(p,cx+1,cy+ry*.45,rx*.6,ry*.35,'',()=>B);
    const hx=cx+rx*.9,hy=cy-ry*.9,hr=4.6*k;ell(p,hx,hy,hr,hr*.9,'',shd(A,hy,hr));p(Math.round(hx+hr*.5),Math.round(hy+hr*.1),Math.round(2*k)+1,Math.round(2*k),B);p(Math.round(hx+hr*.9),Math.round(hy+hr*.1),1,1,K);
    p(Math.round(hx-hr*.5),Math.round(hy-hr-1),2,2,shade(A,-.2));p(Math.round(hx+hr*.2),Math.round(hy-hr-1),2,2,shade(A,-.1));eyes(p,Math.round(hx+hr*.3),Math.round(hy-hr*.3),K,s>1);
    anc.top=[hx,hy-hr];anc.head=[hx,hy-hr*.8];anc.back=[cx-rx*.2,cy-ry];}
  else if(def.form==='bird'){const cy=Ht-8*k,cx=Wd*.45,r=6.5*k;
    p(Math.round(cx-1),Math.round(cy+r-1),1,3,'#e0a040');p(Math.round(cx+2),Math.round(cy+r-1),1,3,'#e0a040');
    p(Math.round(cx-r-3),Math.round(cy-1),4,2,C);p(Math.round(cx-r-4),Math.round(cy-2),3,1,C);
    ell(p,cx,cy,r,r*.92,'',shd(A,cy,r));ell(p,cx+r*.3,cy+r*.35,r*.55,r*.45,'',()=>B);
    const wy=cy-[-.15,.3,.75,.3][f4]*r;ell(p,cx-r*.25,wy,r*.6,r*.42,'',(x,y,e)=>e>.7?shade(C,-.1):C);
    p(Math.round(cx+r),Math.round(cy-r*.25),Math.round(2*k)+1,2,'#e0a040');eyes(p,Math.round(cx+r*.45),Math.round(cy-r*.45),K,s>1);
    anc.top=[cx+r*.2,cy-r];anc.head=[cx+r*.4,cy-r*.8];anc.back=[cx-r*.3,cy-r*.6];}
  else if(def.form==='fish'){const cy=Ht/2+2,cx=Wd*.5,rx=8.5*k,ry=5*k,tw=fr?1:0;
    for(let i=0;i<5*k;i++)p(Math.round(cx-rx-i),Math.round(cy-1-i*.8-tw),1,Math.round(2+i*1.6),C);
    ell(p,cx,cy,rx,ry,'',shd(A,cy,ry));ell(p,cx+1,cy+ry*.4,rx*.6,ry*.35,'',()=>B);
    for(let i=0;i<4*k;i++)p(Math.round(cx-2+i),Math.round(cy-ry-2+i*.4),1,2,C);
    eyes(p,Math.round(cx+rx*.5),Math.round(cy-ry*.3),K,true);p(Math.round(cx+rx*.85),Math.round(cy+1),1,1,C);
    for(let i=0;i<3;i++)p(Math.round(cx-rx*.3+i*3),Math.round(cy),1,1,shade(A,.3));
    anc.top=[cx,cy-ry];anc.head=[cx+rx*.5,cy-ry];anc.back=[cx-rx*.2,cy-ry];}
  else if(def.form==='bug'){const cy=Ht-8*k,cx=Wd*.45,rx=8*k,ry=5.5*k,l=fr?1:0;
    for(let i=0;i<3;i++){const lx=Math.round(cx-rx*.6+i*rx*.6);p(lx,Math.round(cy+ry-2),1,3+((i+l)%2),K);p(lx+2,Math.round(cy+ry-2),1,3+((i+l+1)%2),K);}
    ell(p,cx,cy,rx,ry,'',shd(A,cy,ry));p(Math.round(cx),Math.round(cy-ry+1),1,Math.round(ry*1.6),shade(A,-.35));
    for(const [dx,dy] of [[-.5,-.2],[.4,.1],[-.2,.3]])p(Math.round(cx+rx*dx),Math.round(cy+ry*dy),2,2,B);
    const hx=cx+rx+1.5*k,hy=cy-1;ell(p,hx,hy,3.4*k,3*k,'',()=>C);eyes(p,Math.round(hx+1),Math.round(hy-1),'#ffffff',false);p(Math.round(hx+2),Math.round(hy-1),1,1,K);
    anc.top=[cx,cy-ry];anc.head=[hx,hy-3*k];anc.back=[cx-rx*.3,cy-ry];}
  else if(def.form==='golem'){const bw=Math.round(16*k),bh=Math.round(12*k),x0=Math.round(Wd/2-bw/2),y0=Ht-bh-Math.round(5*k),st=fr?1:0;
    p(x0+2,Ht-Math.round(5*k)-1,Math.round(5*k),Math.round(5*k)+1-st,shade(A,-.2));p(x0+bw-Math.round(5*k)-2,Ht-Math.round(5*k)-1,Math.round(5*k),Math.round(5*k)+st,shade(A,-.2));
    p(x0,y0,bw,bh,A);p(x0,y0,bw,2,shade(A,.25));p(x0+bw-3,y0,3,bh,shade(A,-.3));p(x0,y0+bh-2,bw,2,shade(A,-.35));
    for(let i=0;i<5;i++){const xx=x0+2+Math.floor(hash2(i,bw)*(bw-5)),yy=y0+3+Math.floor(hash2(bw,i)*(bh-5));p(xx,yy,3,1,shade(A,-.25));}
    p(x0-Math.round(4*k),y0+2+st,Math.round(4*k),Math.round(8*k),B);p(x0+bw,y0+3-st,Math.round(4*k),Math.round(8*k),B);
    const hw=Math.round(9*k),hy=y0-Math.round(7*k);p(Math.round(Wd/2-hw/2),hy,hw,Math.round(8*k),B);p(Math.round(Wd/2-hw/2),hy,hw,1,shade(B,.25));
    p(Math.round(Wd/2-hw/2)+2,hy+3,2,2,C);p(Math.round(Wd/2+hw/2)-4,hy+3,2,2,C);
    anc.top=[Wd/2,hy];anc.head=[Wd/2,hy];anc.back=[x0+bw*.3,y0];}
  else if(def.form==='serpent'){const n=6,cy=Ht-6*k,step=2.6*k;let hx=0,hy=0;
    for(let i=0;i<n;i++){const x=Wd*.18+i*step,y=cy+Math.sin(i*1.1+f4*1.5708)*2*k,r=(2.2+i*.35)*k;ell(p,x,y,r,r*.85,'',shd(A,y,r));p(Math.round(x),Math.round(y+r*.4),1,1,B);if(i===n-1){hx=x;hy=y;}}
    const hr=4*k;ell(p,hx+hr*.6,hy-2,hr,hr*.8,'',shd(A,hy-2,hr));p(Math.round(hx+hr*.6),Math.round(hy-1),Math.round(hr),1,B);eyes(p,Math.round(hx+hr*.7),Math.round(hy-3),K,s>1);
    p(Math.round(hx+hr*1.6),Math.round(hy-1),2,1,'#d8304a');
    anc.top=[hx+hr*.6,hy-2-hr];anc.head=[hx+hr*.6,hy-2-hr];anc.back=[Wd*.35,cy-3*k];}
  else if(def.form==='sprite'){const cx=Wd/2,cy=Ht*.55,r=6.5*k;
    for(let i=0;i<4;i++)p(Math.round(cx-3+i*2+((i+fr)%2)),Math.round(cy+r-1),1,3+(i%2),shade(A,-.15));
    ell(p,cx,cy,r,r,'',(x,y,e)=>e>.8?shade(A,-.2):(e<.35?B:A));for(let i=0;i<Math.round(5*k);i++)p(Math.round(cx-i*.4),Math.round(cy-r-i),Math.max(1,Math.round(3*k-i*.6)),1,A);
    p(Math.round(cx-2*k),Math.round(cy-1),1,2,C);p(Math.round(cx+2*k),Math.round(cy-1),1,2,C);
    anc.top=[cx,cy-r-4*k];anc.head=[cx,cy-r];anc.back=[cx-r*.5,cy-r*.5];}
  else if(def.form==='plant'){const cx=Wd/2,base=Ht-2,stemH=Math.round(9*k),fr2=fr?1:0;
    p(Math.round(cx-3*k),base-2,Math.round(2*k)+1,2+fr2,shade(A,-.2));p(Math.round(cx+2*k),base-2,Math.round(2*k)+1,3-fr2,shade(A,-.2));
    p(Math.round(cx-1),base-stemH,Math.round(2*k)+1,stemH,A);ell(p,cx-4*k,base-stemH*.55,3*k,1.6*k,'',()=>shade(A,.15));ell(p,cx+4*k,base-stemH*.45-fr2,3*k,1.6*k,'',()=>A);
    const hy=base-stemH-4*k;
    if(def.acc==='mush'){ell(p,cx,hy+2*k,7*k,4*k,'',(x,y)=>y>hy+2*k?shade(B,-.25):B);for(const [dx,dy] of [[-3,0],[2,-1],[4,1]])p(Math.round(cx+dx*k),Math.round(hy+2*k+dy*k),1,1,C);p(Math.round(cx-1),Math.round(hy+3*k),Math.round(3*k),Math.round(3*k),A);}
    else if(def.acc==='lotus'){ell(p,cx,hy+1,8*k,2.5*k,'',(x,y,e)=>e>.7?shade(A,-.2):A);ell(p,cx,hy+4*k,4*k,3.6*k,'',()=>'#f4e8d8');eyes(p,Math.round(cx-1.5*k),Math.round(hy+4*k),K,false);eyes(p,Math.round(cx+1.5*k),Math.round(hy+4*k),K,false);ell(p,cx+5*k,hy-1,1.6*k,1.6*k,'',()=>B);}
    else{const pr=def.acc==='sun'?6.5*k:5*k;for(let i=0;i<8;i++){const a=i/8*6.283;ell(p,cx+Math.cos(a)*pr*.75,hy+Math.sin(a)*pr*.75,pr*.42,pr*.42,'',()=>i%2?B:shade(B,.15));}ell(p,cx,hy,pr*.45,pr*.45,'',()=>C);
      eyes(p,Math.round(cx-1),Math.round(hy-1),K,false);eyes(p,Math.round(cx+2),Math.round(hy-1),K,false);}
    anc.top=[cx,hy-4*k];anc.head=[cx,hy-3*k];anc.back=[cx,hy];}
  else if(def.form==='crab'){const cx=Wd/2,cy=Ht-7*k,rx=9*k,ry=5*k,l=fr?1:0;
    for(let i=0;i<3;i++){p(Math.round(cx-rx+1-i*2),Math.round(cy+1+i),2,1,C);p(Math.round(cx+rx-2+i*2),Math.round(cy+1+i+l),2,1,C);}
    ell(p,cx,cy,rx,ry,'',shd(A,cy,ry));p(Math.round(cx-rx*.5),Math.round(cy+ry*.4),Math.round(rx),1,shade(A,-.25));
    for(const sgn of [-1,1]){const clx=cx+sgn*(rx+2*k),cly=cy-ry-(sgn>0?l:0);ell(p,clx,cly,3*k,2.6*k,'',shd(B,cly,2.6*k));p(Math.round(clx+sgn*k),Math.round(cly-2*k),Math.round(2*k),1,shade(B,-.3));}
    p(Math.round(cx-3*k),Math.round(cy-ry-3*k),1,Math.round(3*k),A);p(Math.round(cx+3*k),Math.round(cy-ry-3*k),1,Math.round(3*k),A);p(Math.round(cx-3*k)-1,Math.round(cy-ry-4*k),2,2,K);p(Math.round(cx+3*k),Math.round(cy-ry-4*k),2,2,K);
    anc.top=[cx,cy-ry];anc.head=[cx,cy-ry];anc.back=[cx-rx*.3,cy-ry];}
  // accessories
  const [tx,ty]=anc.top.map(Math.round),[hx2,hy2]=anc.head.map(Math.round),[bx,by]=anc.back.map(Math.round);
  if(def.acc==='leaf'){p(tx,ty-4,1,4,'#3f6e2c');ell(p,tx+2,ty-4,2.5,1.4,'',()=>'#8cc45a');}
  if(def.acc==='acorn'){ell(p,hx2,hy2-1,3.6*k,2*k,'',(x,y)=>y<hy2-1?'#7a4a22':'#9a6a32');p(hx2,Math.round(hy2-2-2*k),1,2,'#4a2e1e');}
  if(def.acc==='horn'){p(hx2-2,hy2-Math.round(3*k),2,Math.round(3*k),'#f0e8d0');p(hx2+2,hy2-Math.round(3*k),2,Math.round(3*k),'#d8ccb0');p(hx2-2,hy2-Math.round(3*k),2,1,'#ffffff');}
  if(def.acc==='antenna'){p(hx2,hy2-3,1,3,K);p(hx2+2,hy2-4,1,4,K);p(hx2-1,hy2-4,2,1,K);p(hx2+2,hy2-5,2,1,K);}
  if(def.acc==='flame'){for(let i=0;i<5;i++){const h=3+Math.round(hash2(i,7)*4*k)+(i===2?2:0);p(tx-2+i,ty-h,1,h,i%2?'#ffb04a':'#f06a2a');}p(tx,ty-2,1,1,'#fff0c0');}
  if(def.acc==='crystal'){for(const [dx,h] of [[-3,5],[0,7],[3,4]]){p(bx+dx,by-h,2,h,'#c8d0f0');p(bx+dx,by-h,1,h,'#ffffff');}}
  if(def.acc==='spikes'){for(let i=0;i<4;i++)p(bx-4+i*3,by-2-(i%2),2,3,shade(C,.1));}
  if(def.acc==='moss'){for(let i=0;i<6;i++)p(bx-5+i*2,by-1-(i%2),2,2,i%2?'#5f9a3a':'#8cc45a');}
  if(def.acc==='drop'){p(tx,ty-4,2,3,'#c8f0ff');p(tx,ty-5,1,1,'#c8f0ff');}
  if(def.acc==='fin'){for(let i=0;i<4;i++)p(bx-2+i*2,by-3+Math.abs(i-1.5),2,3,C);}
  if(def.acc==='lava'){for(let i=0;i<4;i++){const xx=Math.round(Wd/2-6*k+i*4*k),yy=Math.round(Ht-12*k+(i%2)*4);p(xx,yy,Math.round(3*k),1,'#ff7a2a');p(xx+1,yy+1,1,2,'#ffb04a');}}
  if(def.acc==='crest'){for(let i=0;i<3;i++)p(hx2-1+i*2,hy2-3-i,1,3+i,i===2?'#ffd060':'#f06a2a');}
  const out=finalize(c);out.anc=anc;return out;}

/* ================= 몬스터 새 도트 (v4.75 · v4.76) — 현이 그린 그림(55종)을 한 마리씩 오려 넣은 스프라이트 =================
   MONART[종]=[가로, 세로, hk(그림 1칸 = 월드 몇 칸 — 도트 밀도가 예전의 약 2배라 줄여 그린다), 팔레트(6자리 hex를 이어 붙임), 줄길이 부호(색 번호 · 길이 쌍)의 base64, (다리 칸)]
   그림은 한 자세뿐이다 → 프레임은 monFrame()이 그 한 장을 변형해서 만든다. MONSPR[종] = [서 있기 2장, 걷기 4장] (v4.76 — 걷기와 서 있기를 나눴다. 고르는 곳은 mmo.js의 monFr)
   · MON_GAIT = 몸 전체를 변형하는 움직임(밀기 dy · 늘이기 sx sy · 위쪽 흔들기 sw · 물결 wv) — 0 · 1번이 서 있기로도 쓰인다
   · MON_LEGGAIT = 다리를 따로 떼어 번갈아 내딛는 움직임(v4.76) — 다리 칸은 굽는 도구가 그림에서 찾아 MONART에 넣는다(art_src/mon/_legs.json)
   · MON_MOVE = 종마다 [움직임, 띄우는 높이(나는 종)]. 표에 없는 종은 통통 뛰기(hop)
   · 양감(v4.76): volHD()가 실루엣을 둥글게 부풀린 높이에서 빛(왼쪽 위)과 그늘을 계산해 원래 색에 입힌다. 세기 ART_VOL(0 = 끔)은 mmo.js setVolume이 정한다.
     왼쪽을 보는 그림은 '뒤집은 뒤에' 양감을 입힌다 — 뒤집힌 그림에서도 빛이 왼쪽 위에서 온다.
   새 종을 더하려면: 그림을 art_src/mon에 넣고 굽고(tools/monart_bake.py) MON_MOVE에 한 줄. MONART에 없는 종은 예전 절차 생성(genMon · makeMon)으로 그린다. */
/* 만들어진 파일 — 손으로 고치지 않는다(tools/monart_bake.py가 art_src/mon/*.png에서 굽는다) */
const MONART={
 squirrel:[46,36,0.616,"f8f1e1f3e8d6eee0cbe8d5b6decbb4dcb991ccb9a5c3ad96c2a689b29981cf9251ad8c6fc98945c1813e9e8773967c68b3753b9e6d41846d5b7b5f4b945b317e4f2e665441644839754627663b235344354f37274d2e1f422216302116240e0a","AAcUARMBAAQXARAEDwEUARsBAB8UAQ8BCgEbAhcBEwIJAwgCEwEXAhsBFwEbAQAbFwEKAQMBEwEUAQ8BCgEJAQQCAwICAQoBEAEXARQBCgEJARsBABocARcCEwEJAQcBAwcFAQoBDwIDAQUBDwEbAQAWFAEYAhsBEAEKAQkBBQEEAQMCAQICAgMBBwEJAQgBBQECAQQBEwEXARsBABQQAQoCEwIMAQcBBQIDAQICAQMFAQEBCAEJAgcCCAEKARABEwEXARsBHwIACB8CAAYPAQgBBQEHAQUBCgEIAQUBAwEBBgUBCAEHAQECBQEIAQkBCgEMAhcBHwEcAh4BAAYfAR0BHAEgAQAFFwETARACDwEJAQUBAwEBBAMBBQEHAQEBAgIBAgQBBwEIAQoBDwEYARwCGwEZAR4CAAQfARwBGgEZAR8CAAUbARMBEAEKAQgBBQECAQEEBQICAQEFAgEDAggBCgEdARgDFwEYAR0BHgEAAh8BHQEZARYBHAEeASABAAQcARcBCQEHAQUBCAEHAQUBAwECAgMBBQECAgECAwECAQEBAgEDAQUBBwEPAR0BGAMcAQwBFQEeAR0BHgIaARYBFQEZARoBIAEABBsBFAEKAQUCBwEFAQcBBQEBAQUBDAEHAQMCAgITAQ8BEAEFAQcBCQEMARwBHQEYAx0BGgESAR0CHwEeAR0BGQEMARUBGgEgAQADHwEbARcBEwIPAQUEAQEFAQoBEwEIAQUBAwEHARABFAETARABCgIMARgBGgEZARQBFwEaARwBFQERARUDEgIZARoCIAEAAx8BHAEYARMDBQIHAQUBAQEIARABEwIHAQgBEwEMAQcBBQEJAQ8BEwEPAhwBFgETAQoBGQEWAQ4BDQERARUBEQEOAREBEgEWARoBIAEAAxwBGwEUAQkBCgEYAQwCDwEIAg8BEAEKARMBFwETARgBHAEIAQQBBQEHAQgBDwEcAR0BGQISAQ4BCwUNAhEBDgERARkBIAEAAxsCCAEHAQUBEAEWARMBGAEUARgBEwEMAwgBCQEbAQcBFwEEAQUBBAITARgBFAEaARYBEQEOAQ0BCwMJAQMBCwENAgsBEQEgAQACGwEKAggBCgEHAQkBGgEIAQQBHAETAQUCCAEJAQYCCAETASABEAEEAxMBHAEaARYBFQEOAg0BDgELAwQBDQIOAREBFQEaAR0BAAETAQgCCQEEAQUBDAEaAQkBBAEQAQ8BBAIGARMBDAEJAQQBHAEfAQ8BBAMGARMBHQEWARIBDgMRAQ0BDgELAREBDQIOAREBEgEZASABAAEeARYBGgEMAxABGgEJAQYBBAMGARABFgETAQsBBQEIAQ8BBAMGAQwBEwEdARUBEgEOAg0BFgEfAR0BGAERAQ0DDgEZAR0BIAEAAR0BHAEdARMBDAEQARMBGgEGAgUDBgIXARMBDAEGAQQBAwEEAQgBDAESARkBGgIWARUBEQEOAhYBFAEHASABFQELAg0CHgEcASABAAIfAR0BGwEQAhYBGAETAQYBBAEGAQoBDwEMARABEwEMAQkBBQEEAQYBDAEZAREBEgEaAR4BGgEWAREEBwEgAgwBCwQeARoBIAEAAxsBEwIXAQ8BBQEcARACFAETARACAwEHARQBEAEMAhEBFgERAQ4BEQIaARYBEQIOAQ0CCwEgAgQBDQELAxEBFQEfAQADFwEUAhMBCQEIAQcBEwEQAQMCAQECAggBCQETARQBFgIRAQ0DEQEaARUBEgEOAQ0DDgIRAQsBCQEGAhEBGQEVARYBHwEAAxwBEwEPAQkBBwEEAQMBAQECBAEBBQEBAQcBDAEXARUBEQELAw0BEgEWARkBEQEOAQ0ECwEEAgMBAgEYASABHgEZASABAAMXARABCgEJAQUBAgIDAQIEAQEFAQQBBQEKARkBEQILBA0BFQEZARUBEQEOAQYCBAMJAQIBAQECARYBBgESASABAAMTAQoBDwEJAQUBAwEEAQcBAQECAQEBAgEFAQQBBQEIARMBFQERAg0BCwQNARIBGQEaARABBgEEBBEBFQERARQBEwELARkBHQEABBQBEAEPAQoBCQIHAQIDBQEJAQMBBQETARcBFQERAg4BCwUEAQ4BCQEQARYBEwEMAQgBBgQJARIBHQEfAQAGGAEQAQgBCgEPAQoBCAEFAQMBBwEKAQUBCQIYARUBEgERAg4BCQEFAQkBAwEEAwUBCgETAhQBGAEXARYBFAEaAR4BAAgXARABGAEQARMBDAEJAQcBBAEIAQoEGAEZARIBEQILAQYBBAEDAQ0BCwEJAQQCBgIMARMCIAEfAQAMFwEbARQBGAEXARMBCgEHARABDwEQAhMBFwIZAREBEgEVAQkBBgEIARIBDQELAQ4BBgEDAQoBEwEVAR0BIAEADx0BDwETARgBGwETARABEwIUARcBGAEbARoBEgERARYBEgEMAQoBFgEOAxIBDAIaAR4BIAEAEBgBDwEQARwDGwEcAhcBGAEcAR8BGQESAREBHQIUARMBHAESAREBFgEVAhoBFgEeASABABAbARABDwEcAR4BAAMdARMBFAEbAQABGgERARIBHgEdASACHwEWARUBGgEfAR4BHQEVAR4BIAEAEB0BFAEQARwBHwEAAx4BHQEbARwBAAEeARUBFgEeAR0BHwEAAR8BHQEVARkBHgEfAR0BGQEdAR8BABAeARgBGwEcASABAAQeAgACHwEWAR0BHgEgAgACHwEaAh0BHAEeARkBGgEfAQARHwEeAR8BAAoeARoBHQEgAQADIAEeARkBHQEAAR8BHQIfAQAfHwEgAQAFIAIAAx8BIAEACQ==",[[25,27,31,1],[21,24,31,0],[28,31,31,1],[32,37,31,0]]],
 frog:[32,30,0.684,"cfe4ecaccbdc9abace7cb5d66ba7cb76a3c262a1c7609ec36298bd6393b75b97bd5792b95c89aa5280a74880a84f7aa044769d4e7092406a9143658a3f62833e5a7b36587a38507137506536495f32455b2d4459313e4c2d384726303e1f242e","ABAgAR4BHwEbARUBGgEAGR4BHwEaAhQBDQESARoBABcaARwBGgMOAQICEwEXAQAVHgEOAQ8BEAEZARgCDQEBAhMBHAEAExYBDwEGAQEBAwESARYCEgENAQEBCAETAQASGQEQAQwBAQENAQICCwEUARkBCQEBAQoBFQEAERoBFAENAQQBAQENASABCQEEAggBEgEDARwBFgEcAQAPHgESARMBDgEEAQEBDQEgAQUBBAMSAQIBHAEUAR0BAA4dARsBFgEQAQwBBAEBAQ0CBQEEAwkBEgEEARUBHQEADR0BGgEVAQ8BCAEHAQUBBgEBAQICBAMFAQQCDwEVAR0BAAsbARcBFQEOAQcBCAILAQQBBQEEBQUCCAEMAREBGAEeAQAJHQEVAhEBDAEHAggBBwIEAQUBBAMFAwcBDAEPAREBFQEaAQAHHQEXAREBBgEIAQwBBQEHBAgBBwEFAQQBBQQHAQwBDgEKAhgBHgEABR4BFQETAREBEAEMAQsCBwUMAQkBBQYDAQEBAwEKARABFgEaAQADHgEaARQBEwERARABCwEMAwsBBQEHAQgBAwEBARUBBQQEAQIBIAEDAQIBAwEOARoBAAMeARgBEwIRAQ4BCwQMAQsBBwEFAR0CGwELAQUBBwEFAQQBAgEdAQIBAQECAhQBGgEAASABHQEWARUBEQENAgwBCwUHAh8BFQESAQsBCAEFAgQBAgEEAQMDAQENARwBAAEgARsBFAIRAQ8CDQEMAQsGCQENAggBBQENARIBCQEEAQIBAQIGAQMBEAEcAQABIAEbARMBFAERAQ8EDQELAQwBCwIMAQ8BDQEIAgUBEgINARIBDQEJAQoBDAERARMBHAEAAR8BGgETAhABDgEPBAwBCwMNAQsCGgEZARwBHQIfAR0BHgEJAQ0BDgESARcBHAEAAR8BGgEUARMCEQEPBQwBCwIMAQgCGgENAhICDQEYARoBDgEQARIBFwEYARwBAAEfARoBFgEUARMCEAIRARABDwIMAQsDCAESARQCEgIVARYBEgETARUBGAIfASABAAIgARkBFQITARUCEQIQAg0BCwEJAgsBCgMOAhIBFQEYAxoBHAEeAQACHgEYARkBGAEVARYCFQEUARIBFAESAQ4CCQMLAQwCCgESAxoBGQEbAR0BHwEAAh4BFgEJAQoBDgEZARgCFgMGAQEBDQEUAQ4BDQMMAQ0BEAEUARgDGgEcAR8BIAEAAhwBDwEHAQUBDQEZARwBGgEXARYBAwECAQEBAgEDARUBEwERARMCFQEYARsBFQEbARoBDQEYAR8BAAMfARkBFwEYARcBFgEaASABHQESAQQBAQICAhYBFwEVAhgCGwEWARACFQENAREBHQEABB8BHAEfASABHQEfASABHgEQAQoBBAECAQEBCQEdAR8CHgIfAR0BFAERARMBGgEdARgBIAEACx0BGQEOAQkBAgEGARIBHwEgBR4BGgEVARoBHgEADyABEgEUAQ0BFgEeAQAHHQEYAR4BAAc="],
 turtle:[46,33,0.651,"dacfa2c0b27da5b06ea2a568959c5da695628d97548b90508b8856838747947f51797d43767643847347776f426b6c3b6c64395f5e326b59365c55325d50314f4a2b59442a4b3d284635223d35213e2d1d332a1d312016291f1321130e150807","ABYZAR4BACcdARwBGgIYAQ4CFwEcAR4CACAeAhgBGwEaARgBFgEVAQ4BBAEXARkBGgEbARgBGgEAHRwCGgEUAREBEAERARABDwERARUCDQEQAREBGAEcAh4BABkeARoBGAERAQ8BEAENAQwCCgENAgoBDAEIAQcBCgEQARIBFgEcAR8BABcaAhYBEQEIAREBEAEMAQoBBQEDAQgCBwEKAgQBBwEMARUBFwETAh0CABQaARwBFAERARIBBAENAQwBCgEIAQEBAgEMAQgBCgEIAgoBDwEVAQ4BBgMRARgBHQEAEh0BGAEUARIBFAMSAQoCCAMKAQMBBAEMAQcBEwELAQEBAgEIAQYCDgEXARkBHQEAEBoBGQEWARUBFAERAQoCDQIKAQgCBwEIBBABDgELAQEBBAEOAQsBCAERAQ8BFQEcAR4BAA4cARoBEgEUARYBEAEMAxABFAEKAQgBAgEBAQgBBwIIARABDwEOAQQBAQELAQgCEgEVARcBHAQACxoCFgEQAhEBEgENAhABFgEUAQoBBAMHAQgCCgEPARoBFAEGAw4BEQEVAxQCFQEYARoBAAoeARsBDQIQAQwBFgUaAQwBCgIIAQcBCgEMAQ0BDwEFARIBEQELAQ4BFQIHAQUEBwENAQ8BGAEACRoCFAESARABEgEYAREBEAEKAQQBBwEWAQ0BDAENAhABEQEKAQUBCgESARQBFwITAQkBAwIBAQMBBAMFAQ4BGAEABxwCFgEZARgCFgERAQ0BCgIFAQoBFAEWARQBCgEIAg0BCgEIAQwCEAEaARQBCQEIAQUBAwECAQEBAwUHARYBAAUaAxIBEQEMARABFgEQAQ0BCgIQAQwCEAEUAQoBDAENARABBwEMARIBDAEYAgkBBwMFAQIBDgEHAQMEBQEUARgBAAQdARgBEAESARYBEAESAREBDQIMAhEBEAENARQBEQEMAhABEgEIARYBDQEXARgBFAEHBQMBDgEWAQUBAwIEAg4BGAEAAxwBEwEXARQBEQISARYBEQESAREBDAERAhMBFAEYAREBDQEQAREBFgIQAQwBFAEXAQ4BBwEFAQcBDQEFAQQBCQEeARYBAwEJAR0BBgERAR0BAAMaARkBHQEbARQBEAERARIBEAERARICDgELAQYBDgEaARYBEgEUARUBGAEWAQ8BDAEUAgoBBQIPARIBBQEEAQMBBAEDAgcBGgEGAREBHQEAAxkBGwEZARsCFAESAREBEAEPAREBBgELAQYDEQEKARACEQEJAQQBDwEMARcBEQEHAQUEBAIDBAQCBgEOARoBHAEAARsCEQEEARgBFwEdAxkBGAERAQ4BAgEBAQICDgESAQoEDQEMAREBGQERAQcBBQUEBgkBFwETAQkBHwEbARcBCwIGAQsBFAEeARgBFwEdARsBBgIBAwIBBgESAhQBEgEWARgBGQEbAR0BFgEJAQcCBQQEBg8BEQEJAR8BHQEPAQYCCwEOARIBGwERAQsBDwELAREBAQYGARsBGgEZARgBFQERAhMBGAETAQwBCQEHAgUCDgIJARMBEgEEAQMCCQEeAR0BFQERAQ4CDwEUARsBDgEJAQsBBgIBBw4BEwEVAQ4CCwMRARUBFwEOAQkEDgUFAQkCDwEeAQABHAEdARMBFQEXAhkBEwEGAQQBBgEEAQIBAQEEAQEFAgEGAQsDBgMOARgDEwEOBgsBBgEPARcBHQEAAx4BGAEdAR4BHQETAQ4BEQEOAQYCCwEGAQsBBAMBBAIBDgELAQYDCwETARgBGQEVARsCGQQYBAAHHgEbAQ8CCwEVAhEBDwERAQsBBgECAQYBCwECAQECAgEOARcBDgELAQ4BDwEUARgBHgEcASACHwQeAh0BAAgeARkBDgELAhsBHQEYAhcBBgECAQEBBAEPAQsBCQELARMBFQEdARcBGAEZARsBHAEfASABHwEcARsBHwEADh8BHQEYAQ8BEwEYAR4BIAIZAQYBAgEBAQYBFwETARQBFgIbASABHwIdARsCFAEeAhgBFgEgAgANIAEeARsCGQEYARwBIAEYAgQBAQICAQ4BHgEfAyACHgEbAhoBHAEVAR4CGAIbARwBAA0fAR4BGwEXAhgBGgEfARgBFQECBBMBFAEeASADHwEeARkBDgERAQ8BHAEeAhgCGQEgAgANIAEfARsBHQEeAR0BHwEAARUBDgERAQYCFwEcAQAEHwEbARUBDgIQARgBAAEfARwBHwEgAR8BABAfASACHwEAAhwBGQEVARMCFwEABhkBFwEZARMBHQEABCACABggAR8BHgEfAQAIIAQADw==",[[6,12,30,0],[33,37,30,0],[14,20,30,1],[25,31,30,1]]],
 leafdrop:[26,32,0.655,"c4dc98b8d086aac26d98b3568fad5188ac4d8fa05a819d497c914b7681476d754366673f665b41575f3651532f5a5238524b3244492b4d3f2d4341284438273838223d2c1f332d1f31261a2b25192f2118241b1221150f1a110d150a07080403","AAoPARIBDAEEAQcCFAEAEhIBDAEKAQQBAgEDAg8BEgEAEBQBCwEJAQMBAgMDAQIBCgEWAQAPEgEJAQUBBAEDAQIBAwECAgQBCwEADhQBDAEJAQgBBgEIAQwBBAEDAQIBBwEMARoBAA0WARIBDgIJAQsCCQEEAQcBDwEUAQAOGgIYAQ4BCwEKAQsBBQEKARIBFQEYAQANGgEZAQ4BGgIOAQsBDgEUAQ8BFgEYAQAOGQEPAQ4BFAEWARIBCgEOARgBFgEADxwBFgEOAxgBHQELAQ4BGgMADh4BFgERARYBFQEbAhECHQEeARgBHgEcAQAMHgMcARUBEwMVARMCFQEZARgBHAEACh4CHAEXARUBEwERAhABEQIQAhEBFQEZAR4BAAgaAR4BGQEVAREBEwERARABDQEMAQcBCgENARABEQITARsBHAEABiABHAEXAREBCgETARECDQIMAQcBCgELAQ0BEAMRARsBHAEABBoBGwEXARMBCgELAREDDwEOAQwCCwIMAQ0BEwEVAREBFQEZARwBAAMfARcBFQETAREBDwESAQkBBgEFAQQBCAELAQwECwEKAQsBFAEVARwBHwEAARgBHAEXAhMBDwIJAQQDBwEDAgsBCgELAQkBBAEBAQIBCgETARsBHAEAAR4BFwEVAQ0BDAEQAQ8BBAMNARABAQIIAwYBBAEBAQoBAQEUARUBGwEeAR0BFwETARABDAIIAQUBBAESAQEBAwEaAQcBBgIFAQYBCQEcAREBBwESARUBGQEgAR0BFwETARABDQEOAQgBBgEFAQkBAQEJARIBCQEFBAgBFgESAQcBDwETARoBIAEdARcBFQEQAQ0BDwEIAQYBBQIGAQgCBAEMAgsBCAIJAQoBAwEJARQBGgEgAR0BGAEVARMBEQIJAQYDBQEGAQUBAgEMARMBEQEQAQ8BBQEDAQQBDAEVARoBIAEcARsBFwIVARMBDAEIAQYBBAEDAgIBAQQMAQsBAwEEAQgBEgEXARwCHgEdARsBGAEVAwoBBwEDAQIHAwEEAgcBDgEWARoBHwEAAh4BHQEaARsBFwIPAQgBBQEDAQIGBAIIAQ8BFgEcAR4BAAQeAR0BGQEYARcBGwERAQoBCAIDAQICAwEHAg8CGAEaAR4BIAEABR8BHQEbARkBFwEYARYCDgEJBBQBDwEWARwBHgIfAQAHHAEeARwCFQETARwBGgEUARICFgEcAR4BIAIeASABAAoeAg0BCQEaASAFFwENARgBHwEADB8BHQEQAQwBFwEgBRoBGQEcAR8BAA0gAh8BAAceAgAH"],
 acornboar:[46,41,0.674,"f0d6b5dcb890d1a372bd8c5db77c4aa27147a5683992633c985a2e9159308c542d825734884f2a7f4d2a7450327d48266f41236b3f2262412961371f583b26543420522d1a462d1d4527173d2314331e13281a1026110c160e0a0d0503","ABobARwBAAQdAQAnEQEVARgBAAIeARsBGgIAJREBEAESARYBGAEPAhUBHAEeAR8BACMVARIBBwEbAhUBDwISARQBFwEbAR8BACEYARsBDgERAQ4BEAEMAQsBDgIQARIBFgEcAR4BAB0dARsCFAEQAQsDCgELAQ0BDgMQARIBGgEcAQAbGAEbARYBEgENAQoBBwIKAwsEDQIRARcBHQEAFxsBHAEbAhECFgERAQsBCgEEAQcCCgENAQsBCgILAg0BEQEYAR4BABQbARkCFAERAQoBBgIOARQBEAENAQcDBQERAQgBBwEDAQYBCQELAQ0BEAEYAQAUHAEOAQkCBwIIAgUBBwEFAhABCgELARICCAENAQYBBwIKAg0BFAEcAQAUFgIXARkBFwEZARgBBgEOARMBCAERARABEQEUAhABFAESAQkBCgEOARkBDgEPARsBABUYAhsBFgERARoBFwEOARsBEQENAQ4BEgERARABDgEXARQBDQELARIBFwEPARIBGgEbAQAQGwEfAR4BHwIcARkBFAERARcBFgIUAREBEAIHAQMCFAEIAQYBEQESAQ4BBwEZARIBFAEbAQACGQEbAQAKGwIYAxkBGwEeARcBFAESARABCwINARABDgEQAQcBAwECAQkBCgEFAQ0BFgEKAQkBFwIWARsBAAEZARIBFwEZAQAHHAEYARkBGAQaAh0BHAESAg8BCwEKAwsBDgEFAQMEBwMJAQ0BBgEbARQBHAEYARQCBQESARsBAAUbARkBFgETAQ8BEwEYAhkBGgEbARkBEAIRAQoFBQEVARwBEwECAgUCBgEHAQoBEwEaAh4BGQERAQUCBgELARQBAAMcARoBEwMPARgCFgIZARgBGgEQAQ0BEgELAQoCCwEQAQ8BFQEEARgBHQEDAgcCCAEbAQ8BGwEeAQABGwERAQUBBAEHAQsBEgEZARsDEwIVARMDFQEWARUBFgEVARkBDgENARABCwEKAQsCCQEXAQYBCAEcARYBAQIGAgkBHgEPARgBHwEAARsBFAEEAg4BCgENARQBGwEcARYBEgEVBxcBGQEMARQBGgENAQkBCwIHAwsBAQEVARwBFQEBAgIBAwEEARoBFQEaAR8BAAIWAQIBAwERAQoCBwEZARcBEAEGARgBFQMTARUBEwEVARkBEQIYARQBEAENAQkBBwIFAQcBAQEMARoBEQEBBAIBAwEHARcBHAEAAhgBDwECAQMBBAEBAQMBFAEOAQsBCAEOARUBFgEVARMDFQEPAREBEAEUAwsCBwIFAgQBBwICAQEFDAEQAhkBHQEAAhUBBQEBAQIBAwEIARIBEAELAQkBBwEJARECFQEMARIBEAEMARkBDgENARABGQEUAREBCgEHAQUBBAEDAgIBAQUEARwBGQECARcBHQEAAxQBBgEHAhECCwEKAxIBEQEOAREBBwEJAQcBCgEPAREBDQIRARcBEgIMAQQBAQYEAQEDCAECAQMBFQEABRcBCgEPARgBEgELAQoDEgEXAQ4BCgENAQoCCQEQBA0BCQERARYBDwEIAQIBAQUOAQoBDAEIAQ8BAwEZAQAJGQEUAQsBCgMLAREBFgENAQsCCQENAREBDgEUAQ4BEAEJAQcBBQEGAQwCDwEGAQMBAgQDAQQBDwEcAQAKGgEUAQ0CCQEKAQsCGgEUAQsDEAERAQcBBAEWAg0BCQEEAQICBQEPAQgBDAEPARYBFQMdAQAMHAEZARECCQQZAQwBDQEOAQgBDwERAQQBAwEFAQ8BGgERAQwBAQIDAQQCBgEPARgBGwEADxwBGwEUARABCgEJAgUBEQEDAQYBEwEDAQ8BCgEDAQQBAwEHAQUBCQEXAQQBAgEBAQMBBAEDAQgBFwEbAQAQGwEUAQ0BCQEHAQMCEAEGAQMDAgEHAgUBBAMCAhMBCAEBAQICBAEGAQ8BGQEAEB4BGwEOAQoBAwIEAREBEwEGAQMBAgEDARMBEAEFAQQCBQECBAQBGAEPARoCHQEAERsBGgEQAQcBAwIJARoBGAEPAQwBBgEEAQgBFAEHAQUCBwEFAQ8BAwECAQYBDwEaAhsBABEeARUBCwEHAQUBBwIUARsBDAEPAwgCFgELAQcCCAETAgwBCAEPARkBEQEXARsBABEeARYBDQELAQkBDQEaARwCGQEXAQ8BHQEfAR4BGgESAQoBBwENARsBHAEdARwBHQEWAQ4CFQEcAQAQHgEXARABDgEUARsCAAEdARoCGQEfARwBFQEbARABCgEHAREBHQEfAh4BHQEUAREBEgEcAR4BABEbARIBEAEOARwBHQEAARwBGwEZARoBHAEbARUBGAEUAREBEAEUAR0BHwEAAR8BGwIUARoBHgEAEh0BFAERARQBHAEdAQACHAEaARkBFwEcARsBHAIUARcBGgEcAR8BAAEeAR0CGAEZARwBGwEAER8BFwEWARgBHAIAAx0BGgIcAR8BHgEcARcBFgEXARsBHgEAAh8BHAEYARYCGwEcAQAQHwEcARQBEgEZAR4BHwEAAx4BHwIAAhwBFwERAQ4BEQEbAgABHwEdARkBEwIZAR4BABEeAR0CHgIACR8BGgERAQwBEgEZAR0BAAIfAh4CHQEAEx8DAAofAR0BGwEaARsBGAEbAQADHwIeAQAjHwEeAR0BGwEAEQ==",[[17,20,36,1],[8,14,36,0],[31,37,36,0],[21,29,36,1]]],
 sparrow:[36,34,0.517,"e8cea5c2ac778b974bb593657982409d784781683f75683973753d9e643a906542935a34825f3a656035745835634e30774a2d6e4329633a2660472b55492a543722513f274738244d2e1c3e2e1e3d26193b1f1331261a2e1c1225130b110906","ABEZARwBHgQcAQAbHgEdARcBFgETARUEFwEaAQAXHgEbARYBFQERAQ8DDgQYARsBGgEAFB0BGgEXARQBEQEPAQ0BBwIJAwUBDgEQAhsBABIdARkBFQEQAREBDwEHAQUBBwEFBQMBCQIOARsBABAbARYBEAIPAQgBDwEIAQUBBwEDBgUCCQEVARgBAA4YARkBEAIOAQgCDwMIAQMCAgEEAQMDBQMQARoBAAwdARkBFgEQAREBDgEIAhABFQEUAQgBAwIEAQIBAwMFAwkBDgEYAQALGQIVARABDgEPARcDBwIIAQkBBQIDAwUCAwEFAggBGgEABBsCAAUeARYBFQEQAQ4BEAEYAQcBFAEPAQ0BCwEPAQkBBQEDAQUCBAECAQMBBQMQARgBAAIfARYCFwEABBwBFgEXARoBFwIYAQ8BBwELAw0BEAEFAQgBEQIDAQQBAwEFAgkBDgEbAQADEwEGAQwBGQEWAQACHAEZARgCGgEXARQBCAENAgsCDQIUAhEBEwEFBAkCDgEbAQADEwEMAQYBBAEKARYBGgEcARkBGAEPARoBGQEXAQ8CDQILAQ0BEQEQAQ0BCAIJAQUCCQIOAhoBAAMaARkBDAEGAQQBBgEPARwBGQEeARIBAgIWARcBDwEUAQ0EBwEIAwkFGAEQARoBHQEAAxgBDAMKAQsBGQEcAQ0BDAEKAQQBCwENAhsBFAEPAggCBwEJAwgBDgMYAhoBGAEAAxsBEwERAQwBDQESARkBHAENAREEDQERAhIBGQIVAQ4CCAEHAQgBDgIVAhQBFgEZARMBHAEAAxsBEwERAQoCHgEbAREBDAELAQwCEQITARICEQEWARkBGAITARgBGwEcAgwBCgEGAgwBGQEABRoBFgEKAREBHAERAQwBCgIMAiABAgEgAR4BCgILAQoBDAETARgBBQESARMBBAIMARMBAAgaAh4BGwESAQwBCgQEAQcBIAIHAQYBBAMPASABGQEKARkBCgEMARQBAAgdARoCGwEeARsBEQEKAgYBCgECAQ0BIAIBAQIBAQMZASABEgEMARwBHwEACR0DGAEXAR4CGQERAQYDBAENARABCwEBBgQCCgEWAR0BAAgbARYBEwISARQCGgEbARkBEgERAQwBBgECAgEFCwECAQECBAEbAR4BAAYfARwBEwINAREBDgIVARoBEQEZARwBFgESAQoBAgEBAxEBAgEEAgECAgEZAR4BAAcgARkBEwEUAgACHQEaAQQCFQELARsBDQELAQoBBgEBAwIBAQICAQ0BFAEaAQAJHAEABh4BCwEGARUBFgERAQQCEQITAQUBBAECAgQBDwEYAQATHwERARsBGgEQARgBHQEUAQ8BDQEEARsBHgEbAR0BABUfAR4DDwEYAR0CDgEUAQcBFAIfAR4BABceAR8CFQMOAQUBAQELARYCHgEAGB8BHAEOARUCDgEFAQQBDwEbAQ0BIAEAGCABGwEIAQ4BGgEYAxUBEAEfASABABggARwBDQEPASABHwEgAh0BEwEeAR0BABkeARICIAEAAiABGwERARYBHwEAGR4BGQESAR8BIAEAAh4BEwIgAQAaIAMABB8CAAw="],
 fairy:[30,34,0.535,"e7c1a4cea98cc78f83aa8e6ca97a768b6f5ea0627d92567e6f594e8d5367854e68764e546b494b7f4458723e59603b466f374a66384a5c33464d36334c2e395a2a3f4e2a394c2132452331432a2f3d232f36232a371e283319242b161d1c0d12","AAwaARgBFwEYARkCFAEaAQATGgEbAhABCwQOARcBGAEaARsBABAeARMBDgILAQgGCwEPARMBHAEADhkBEgEOAQgCBwYIAwsBDwETAR4BAAsXAQ8BCwEIAQcBCAIHBggBBwEIAQsCEwEcAQAJGwETAQ8BCwEIAwUBAwIFAQcCDwEbARkBCwEIAgsBFwEcAQAHHgETAQ8CCwIIAgcBAwIFAgcBCgEMAgcBCAIKAQ4BGwEABx0BEwEPAwsCCAEHAgUCCgIDAQICBQEHAQgBCgELARMBGgEABhsBEwESARMBEAELAQgCBwIIAQUBFAEeAQUBAgEDAhsBGAELAg8BHQEABRwBGQETARkBFQEQAg8BCAIHAQgBGAEeARoBDAECAQMBCgEJAR0BEAEPAhYBHAEABBsBFwEWARABEwEVARYBCwIIAgoBBAINAQwBAgEFAQYBDAEGAR8BEgEPAh4BAAQcARcBFgERAQ4BGgEQAQ4BCwEKAhEBBAEDARECBgEOAQYCBAEfARkBDwESAR4BAAQdARYBEwEPARMBFgERAQsDGAEGAQMBAgEQARECCgEDAQUBBgEEARkBDwESAR4BAAQcARYBEwEQARwBFQERAQ4BCwEbASACHwEEARIBDgEMAQMBDQEfAhQBHQERARYBHwEABB4BFwEWARMBFQEYAREBDwEXARoBIAEMARQBBAEOAgUBAQEfAQ0BBgEfAR0BEwEXAR8BAAIGARQBHAIXARIBDwEMAREBFwEfAQEBCQEgARQBAQUeAR8BAwEYAhYBFQEAAgkBAgEGAQkBGgEZARIBDgIKARMBCgEEARQBHwEEAQEFEAEcAQIBEAEWARkBHQEAAgkBBAEBAQIBFAEVARMBDwIFAQ4BCgEEAgoBAQcDAQIBFwEWAR0BHwEAAwkBBAEBAgoBEwEWARIBEQEOAQoBBQEDAQIBAQECAQMBAQECAQwBAQIDARcBHQIABgQCBQEMARABFwESAQ4BEQEKAQUBAgEBAQIBDgIGAQMBAQECARkBHQEfARwBAAYUAQwBDQEKARMBHAEZAQ0BHQEbARgBFgEDAQIEBAETARYBGAEdARwCAAUcARoBFQIQARkBHAEeARcCGgEQARkBGAIWARcBHQIYARMBGQIJAQAFGgEVARIBCAELARABDwEdAhUBDAEKAQUBEgEKAQYBDAEUAhADGAEZARABFAEAAx4BEgEPAQoBDwESARUBHQEZAQwBBgEEARABFwEGAQQBDAEGAQQBCQEeAQYBDAENARcBGAEaAgACHgEdARMBFgETARkBHwEVAQwCBgEQARoBDQMGAQQBCQEeARQBCQEEAQYCEgEFAQwBFAEAAh8BHAEeARwBHgEbARUBDQEKARUBGgEQARQCBAEJAQQBFAEaARQCBgEEAwECEAEeAQADIAEfARQBEAEdARACHgEbAQkBDQEGAQQBAwEEAhQBHwIJARQBCQENAQUBBgEUAQAFIAEbARcBGAIdAR4BHAEQAQwBCgIFAQYBDQEWARoBHwEeARQBHgIGARoBAAcfAR4BGQEWARIBHgEaARACDQEMAQ4BCgESARgBFgEdARsBHwIACx8BHgIdAR4BFwELAQoBGwEWARIBEwEcARsBEAEZAR0BIAEAEB8BFwEPAhwCHgEfAg0BEQEdASACABAgARcBDgERAR8BIAIeAR8BEAERARcBGgEAESABHgEWAR0BIAEAAyABHQESARABHgEAEiABHwIABSABHwMABw=="],
 honeybug:[35,38,0.567,"f0e4cce9d198e2b05cc4aa91bc8e579c8270b3752e93673a835e3b7f512c71503a62555176472765432b5b47435f3b23563c2b5232224f3d3843352d4a302341261a3f2d2436281f3a2018331f192d2019271c152916132216151b130f1b0b0b","ABkbASABAAEfAh4BABseARsBFAEeARwBGwEMARMBFAEAGR4BGAEUARMBDwEeARMCCQETARcBABceAR0BEwEPAgwBEwEYAQwDDwEbAQAWGQEJAQwBDwETAQwCGwEMAxMBGgEeAQAVFwETAQEBDwETAQwCGwEMAg8BGAIfAQAMIAUfARsBAAIPAhQBDwEUAQwCGAEMAhQBGgEYAQAKHgEfARoBFQMSARUBFwEYARsBHgEPAxMCDAIPAQwBDwEbAR4BAAkgARgBFgEVAg4BEAEOAhEBGQMbAhQBGwETAQ8BBgMMAhwCAAgeAhoBEQEQAQ4BCgEJAQsBGQEVAQ4CEAIVAR4BGAEMAQYBBAEBAwYBDAETAQAHHwEdAREBEgIOAQkBCAEJAQ4BFgELAQoBDQEOAREBFgEbAQ8BCAEEAQEFBAEJARcBAAUcARoBCQEFARUBDgELAQYBCAEJARkBCAIKAQsCFwIYAQkBBgEEAQEGCAEYAQAEIAEZAQ4BBgEIARUBEQELAQkBCgEVAQsCCgEJAQoBDgIRAQ8BBgEEAQEFBAMIAQAEHAEaARcBFQEbARUBDgELAhEBHwELAQoBCwEJAQoBCwERAgwBBAIBBQQBBgEEAQkBFAEAAhwCFgESAhsBEQIOAhUBHwEOAgsCCgELARUBDwEMAQQCBgEJAQIBAQIUAQwBBAEJARMBAAIcAhICEQEZARECDgIaARUBEQIOBBcBDwEJAQQCAgEgAQYBAQITAR4BBgEIARMBAAIYAR0BEQEXARIBFwEVARECEgEgARgBEQEXARUBFgEYARUBGAEPAQYBBAEBAgYBAgEBAQIBBAEXAQYCCAEAAR4BGwEcARgBGQEbARUBHwEcARkCHQEfARoCGQENAQoCFgEOAQYBBAEBAwIBCAEEBAIBBgEAARoBFQERAR4BGQEKAQcBFgIIAQcBHQIQAQ0CBwQIAQoBBAECAQEBBAEIAQoBAgEFAQkCBAEOAR8BFgEVARYBGgEKAQMBCAEOARABBQEHARoBGQEIAg0BHQEgAQUBBwIIAQUBBAMQARkBHQEgAggCFQEfARoBFgEaARUBCAEDAQgBDgEKAQIBBwEZARIBCAEHARkBEQEFAQ0BBwIFAQoBCAEEAgUBBgMJAQgBEQEAASABGgEVARkBFQEIAQMBCgEQAQgBAgEHARkBEAEHAQoBBgERAR4BCwEDAQUBEAEZAQ4BCAEGAQUBBAIFAQkBEwEAAiABGgEWAQ0BFQEHAQMBCgEQAQoBAgEIAR0BGQEDAQgBAQERARsBFQEBAQgBDgENARoCFQEPAREBDwETARQBAAMfARsBHQEFARABBwEDAQgBEAEHAQIBAwEWARoBBwEDAQIBDgIFAQEBBgEFAQ0BFQEZARMBHwEeAQAHHAEdARABFgEKAQcBAwEKAQcBAwIIARYBCAIDBAcBDgECAgUBGQEPASABAAkLARABFgESAQoBBwEKAQMCBwIFARABCgEFAQMHCgEOARsBHAEACQ8BCQELAR0BEAEKAQcBAwIFAQcBBQECAQEBCAIHAwoBEAEWASACGwEACgkBCAEOASACEgENAQcEDQECAQECAgEQARYBGgEgARoBHgEbASABFAETAQAKDgEUARkBFgEOARUBDQEHAQgBEQIOAQgBAgEFARABEwIbAQ8BGAEbARMBFAEbAQALGAEZAQgBFQEEARICFQEPAQwBBAEUARgBCQEOAQYBBAEXAQkBFAIRAQsBHgEAChsBGAEOAREBDgEXARUCGQELAQgBCwEVARYBCgEFAQ8BCwIUARYBDwEZAiABAAoYAR4BDQEbAR0BHgEWASABGwEPAQwBGQENAQoBCAEKARABGAEXAR4BGAEPARQBIAEACxQBGQENARUBGwEcARkCGwEPAQkBFgIQAQ0BCgEWARkBHAIUARgBIAIACxsBGQEaARgBFwEbARkBDQEdARMBDAEaAR8BFgESARoBHgEVAQkBGwEeARgBEQEbAQAMHwIAAhMBCwEdARoBGAEJASABHwEbASABHgEZAREBFwEOAgoBHgIAEBcBCwERAQ4BGwEVARYBIAEcAQABHAEeARkBGwEOARcBGQEgAQARHgEcARgBEwEYAR0BDQEaAQADIAIAAhkBABQfAQADIAEfAQAU"],
 mudpuff:[34,32,0.468,"ebd8bbd0ae84c39665b58758af794d95704d9d6a408b62428a5d3c805d447f57397d503073533d714d34664a356d472f63422c5e3f2a5c3c275938255235234c32234c2d1c422c1f3d2619312417371f152e1c142d170e21160f1b0d09110403","AA0YARsCHAEbARwBGwMAFxkBHAEYARMFEgETARUBHAEdAgASHAEaARYBEQIQAQ4BEAEOAw8BEQEPARQBGwEZAQAQGAEZARQBDwEQAQoBBgEIAQoFEAEPAxYBHAEADhgBHAEUARABCwEKAQYBBQEGAQgCCgUPAhEBFQEZAQAMGgEYAhMBDgEKAQgBCgECAQMBCAQKAg8BDQEOAQ8BEwEYARwBAAsZAhMBEQELAQgBCgEIAQYDCAIKAw0BDwIRARMBFAEbAR0BAAkcARsBFAESAQ4BEQELAQoCBgMIAQoCCwINAREDEwESARQBGwEACRwBGQEVARIBDgERAQ0BCwEKAggBBgEKAQsCDQEQAhMBEgEWAhMBFAEdARkBAAcdARkBFwEVARMBEQIOAQ0ECAEGAQoBCwEKAQsCDgEQARUCFgIZAR8BAAcfARwBFgEVAhYBEwEPAQ4BEAEOAQ0BCAEFAgcBCQELAQ4BEAMUARgCGQEeAgAGHAEdARcBFgEXARkBFQEQAQ4ECwEMAQkCCwERAxACEwEKAREBEgEZAR8BAAYcARsBFgEUAgQBEAEVAQ8BDQEOARACEQEUARUBGwEYARQBGwEXARQBEAENAxUBFwEcAQAEGgEbARcBFQETARIBEQEOARQBFwEZAhsBHQEcAR0CHAEZARsCHAEdARsBHAEVAQ4CEwEbAR4BAAIaAR4BGAEXAhUBFwEZARsCGQIbAhQBEwERARADEQMTARwBHQEZAhQBEQEVAR8BAAEeARoBGQEeARsBHAEZARQBEAEUAhEBEAEXASABEQENARQBCwEMBBMBDQEPAREBGQIWAhkBHwEAARoBGAEWARUCGwIIARABDAMQAQoBBgEaAQQBAQEMAQgBBwEIAQcBGAEGARQBBgEbARcBFgEZAR8CGQEbAREBCwIMARACGQEMAQsBCAEHAQUBAgEPAR4BHQEEAQcBBQQYASABBgEFARsBGAEZAR4BIAEAARkBFQEQAQgBAQEFAQcBDAEZARABCwEHAQQCBwEXAR8BEwEFAwQBBQEJAQUBHgEGAQcBFgEfAh4BAAIfARUBDgEHAQEBBQEHAQkBFAEMAQsBBwEEAQUBBAEFAQQBAwEEAQUBAwICAQkBBAEDAQQBBwEUAR8BGgEAAx8BFwEOAQgBBwEFAwwCCwEJAQUBBAMDAgIBEAEVAQ8BEQEXAQcBAwEEAQcBFAERARgBGQEAAh0BGQEQAQwBCQIFAQMBCQEMAgkCBwEFAQQBAwICAQMBBQEIAQkBBAEDAQUBDAEFAQQBBQEQARwBAAIeAR0BFAEMAggBCQEFARQBEQEQAQkBBwIFAgIBAQYDAgcBEgEEAQECDAEdAQADGwEZARUBFwEJAxcBFAIFAQQBAwEEAQkBAQcCAQUBCAEYAQwBBgEFAR0BHgEABCABGwEXARMBFQEbAR8BHQEJAQUBAgMDAQYBAQYCAQYBDgEcARQBEwEbASABAAcgAR8BHgEaARUBFwEHAQUBBAEBAgIBBAEBBAIBAwIOARcBHAEeAR0BAA0aAR4BGAEOAQgBAgEBAg0BBgEEBAUBDgEZAR8BABEeASABEwELAQQBAgEGAQ0BCgINAREBGgEOAQUBGwEgAQAQHwEeAR8BEwEQAQ0BAQEGARsBIAMeARkBEgEIAR0BHwEAEB8BHAEXAhUBEQEKARMBGAEAAx8BHAEXARABGwEeAQARHwEgAR4BFwERARQBHQEfAQAEIAEfARsBHQEgAQAUIAIfASABAAYgAwAJ"],
 firefly:[32,38,0.504,"f7f9dcf1f4a9e9eaa5e7e986dadb78cecb66c3bf5eb9b456aaa64f9f94448d8f408e863d827d3b6b703878663262613257582e675430544f2e4748295a4629533f24463e264738214532203b3720382f1e412d1d2b2519362419291c151c0e0d","AA4QAQ8BAB0QAQ8BDQEAHBABDQEGAREBABwNAQgBBAEIARABABsPAggBBgENAQsBABsRAQsBBwEIAQwBDwEABBgBABYRAQoBBgIJAQ0BAAIZARUBFgEAFB0BEQEMAQYBBAEGAQwBAAEbARMCFgEADR8BAAUdAR8BEwEKAQQBAQEFAQkBFAEaARMCAA0fAR4CAAMbARkBHAEPAQgBAgEBAQUBCgEXAR4BEAIADR4BFgEZARgCGQESARUBDAEIAQUBAgEBAQUBCgEQARIBFgEXARQBHQEACyABHgEcAhgBEgEPAQoBCQEGAQIBAQIEAQcBCQESARABEwEdAR8BIAEAChsBHAETAR4BFgEPAQgBBgEEAQUBAgEBAgQBBQEHAQgBCgETARgBHwEgAQALFwEdARcBDgEJAQcBBAECAQQBAwEBAgMBBAEFAQcBCQENARcBHAEfAQALHAITAQwBBwEFAQQBAgEBBgQBBQEHAQoBDgEZARsBAAscARYBCgEIAQYBBQECAgEFBAIDAQQBCAEKARcBGwEAChMBGwEQAQgBBwEGAQkBDAEDAQEEAgEEAQIBBQEGAgwBFgEXARMBHwEABR8BGwEeARgBDwEKAQcBBgEQAR4BGwEJAQQBAgEBAgICDwERAQ8BBgELAQwBFwEaARMBGQEdAQACIAEdARABFQEWAQ8BCwEGAQUBGgEPAQMBEwEEAQIBAQMFARsBAQEJAQgBCQEKARMBHwEOARsBHwEAAh8BHQEVARIBFQENAQgBBQEEAQMBEAEgARUBBAEDAQIDCAEbARcBAwEGAQgBCgEYARcBGwIABBcCGAEPAQkBBwEGAQQBAgEKAR0BCwEEAQMCAgEDAQQBFwETAQEBBgEJAQwBHgEbARMBFAEABB0BEwEfARIBCwEJAQgBBgEFAwQBAwYEAQUBBAEGAQkBDQEeARQBEAEUAQAEFAEQAQkBBgEKAQkBCgEIAQYCBAEBAQYBBwECAQMBBgEJAQMBBQEGAQgBDAENAQkDEQEUAQADGgEUAQ0DCwIJAQgCBgEDAQYBFQEPAQ0BHAEJAQUBBwEIAQwBEAENAQcBBgIIAREBAAMUAxoBHQETAQ8BCwEKAQgBBwEFAQMBAgEQARUBCAEFAQcBCgELAQ4BGgERAQ0BCQIMARoBAAIaARMBEAIOAREBGgIOAQwBCwEIAQcDBgIHAQgBCwENAh0BHwEaAQ4BEQENAQoBEwEXAQABGwELAQoBCQENAQ4BFAEbAQ4CDwILAQkECgEPARABHQEUAQ0BDgEUAREBDgQQARMBDQELAg4BEQEbARABDQEIAQ4BGAEWAQ0BFwEQAQgBCwEYARYBGQETAQsCDQIaARQBDgIQARoCDgEQAxoBGAEOAQ0BCwEIARwBGQEWARkBFwEIAQwBHwEeARkBGAEMAQsBDQETARoCEwEXARoBAAIQARQBEwEdARgBEgEPAQ0BDwEWARkBHgEWARUBEgENAQ8BHgENARkBGwETAQ0BEAEbAR0BAAkgARgBEgIVARIBFgEfASABHgEcAQ8BFQIdAR4BFQEPARsCFwEfAgAJIAEbARYBFQIZAR8BIAIcARYBFQESAhsBHgEcARUBHgEUARsBHwEACyABGwEdASACFwEdASABEwESARYBDwESAQ8BGQEcAR4DAA4gAwABEwIZAQ8BDQEZARcBGQEIARIBEwEOARsBIAEAEh4BEwEJAQgBDAESAR0BEgEJAQoBFwEYAR4BHQEAEhcBDwEIAQoBGAEXAhQBDwEKAQkBEgEZASACABEcARUBDQEPARwBGgEAAhABDQIPARwBIAEAEiABHgEcAR0BHwEABBIBGAEWAQAK"],
 g_rowen:[39,51,0.878,"cfa666cc9157bb9856869845a380467e8c416d7f396c7438a87244a26b40996b3e97623a8b62395f6f346564348757355661317b4d2f6a4b2f67412b52522d4d4429603b275736264838264f2f213e2d2045271c3721192e191626101016080a","ABMbAR0BEQEZAQAeCAEAAhsCDwEIAhEBFgEdAQAbBgENARMBGgEWARUBBwEIAQQCFQIZAQABCAEEAQMBABYPAhMBFQEPAQYCCAECAQQBBgEIARUBGQEGAQQCABcWARkBDgEEBAYBBAMGARUBGwEVAQAYGQERAQ8BDgEGAQQDBgEEAgcBDgEdAQAUGQIbAQACGwERAg4BCAEGAgkBCAEGAQcBDgIdAQAQDAEXARUBEQMVARkCHgERAg8BCAEGAQ8CBwIIAREBFQEbAR4DGwEACwkBAgENAQgBBwEGAgcCGQEdARUBEQEOAQgBDgEIAQ8CEQEVARYBHgEVAREBFQEWARkBGwEACRMBCwEBAgMBBAQGAQgBEQEbARYBDgEPAQ4CDwERARUBFgEZAREBDgEIAgcBCAERARkBAAgWAREBBAEBAQMBBAMGAQcBCAEOARsBGQEVAREBDwIRARUBFgEeARUBCAEGAgQCBgEHAQ4BGQEVAQAGGQERAQYBBAECAgQBBgEEAQYBCAEOARYBGwEeARUBEQEPARUBHgEgARsBEQEHAQYBBAIBAQMBBAEGAQ4BGwEABhsBFQEHAQQGBgEHAQ4CHgEaAR0BGwIdARgBHAEbAQ4BBwEGAQQFBgEHARUBFgEABRsBFQEIAgYBBAQGAQcBEQIYARACFAETARIBDQEMARIBCAEGAgQGBgEOAR0BAAYdARUBDgIHAQYBBwEGAQQBBgEZAQ0BCgEFAQIBCQEKAQUBCQEMAQkBBQEJAQQEBgEEAQYBDgEVARkCAAQeAh0BDwEVAQgCBwIPARQBEgEJAgIBAQUFAQIDCgEHAQQBBgIRARgBEwEZARsBHQEAAxsCFQEbAxUBCAMXAQoBBQECAwEFAgEBAwIBDQEGAxUBGwEIAxsBGQEAAR4BGQERARUBFgEbAR0BGwEdARUBDwEXAQkBBQECBAoBAQcFAhMBDgEVARkBBwEGAQcBDgERARsBIAEVAREBFgEVAREBDwERARYBHQITAQsBBQMCAQEBAgIFAQEHAgELAR4CFgEVAQ4DFQEeASABFgEOAQgBDgIIAxUBHgEdAQoBCQMYARsBBQECAgEEAgEDARcBCQEMARoBGwEVAREBFQERAhYBHQEfARsBCAMOAQgBBwEOARYBHQILAQoBDAEgAxMBAQQCAx0BHgIMARoBGwEVBR8BGwEAAR4BFgEPAQ4BFQEOAQgBFQIeAR0BDAEKARIBIAEDAQEBGwEBBAIBAQEYAR0BAQEDAQwBHAEeARsEHgEdAQADGwIYARcBGwIWARUBHgINAQoBBQEWASACGQEBBhcBHgEfAQEBCgEaARsBGQEWAR0BHgEdAQAFHwEeARwBEwEXAR4BHAEeARQBCwEJAQEBEwEgAR0BCwECAwEDEgEeAR0BAQEJARIBEQEOAhYBHQEeAQAGHwEZAQ8BCAEVAQ8BCAEPAQwBCQEFAQoBGQENAQEGAgISARwBAQEFAQ0BDgERAg4BGQEeAQAGHwEVAQ4BCAIRAg8BFAEQAQkBBQECAwEBAgISAQ0BDAECAwUCDQEIARECDgEZAR8BAAYeARUBDgEIAgcBBgITAQoBCQEFAQIBBQIQAQIEAQICAQUBCQENAQgBBAEGAQ4BFQEdAR4BAAYeAR0BDwEIAQcDBgEIAQsBCgEFAwkBGgEcARoBHAEaARwBCgEFAgoBDwEGAwgBFgEdAQAIHQIVAQ4BBwEGAQcCDwESAQsBBQEJAxwBHgEcAgkBBQEJAQsBCAEGAwgBFgEfAQAKHwEbARkBEQEIAQcBDgERARUBFwEKAQkBCgEMBBIBDAENARMBDwEGAwgBFgEbAQAMHAEdARoBFgEVAQ4DFQEYARcBEAUSAhQBGQEHAQgBDgERARYBHgEADhsBFwEaARYBDgMRARYBGAEaARQBEgIUARgBGwMZARUBGwEdAgALHgEgAR8BHgEdARQBFwEUAREEFgEYAhcBEgEMARQBHAEbARUBFwEUARgBGgEUAQAKHgIcARQBEAENAhoBHQEcARsCGQERAR0BFwETARABDAISARABEwEbARMDFAEYARoBAAkdARMBBQELARABCwEJAQwBEAIXAR0BHwEdARoBFwESAQwBBQEBAg0BEgEdARgBEwMYARsBHAIABhoBGAEMAQsBCQEKAQsBGgEJAQsBDQEMAQoBDQEUARcCDQEMAQEDDQESARwBHQIbAR0BEgELARABHAIfAQADHwEaARABCwIMAQsBDQEcARACDAENARIBFAESAw0BCwEJAQMBCgEMARIBGAEaARgBFwESAQsBAgINAhwBGwEAAh8BGQESAgMBEwESAhwBFAEQARIBEwIXARoBFAEQAQsBCQEQARMBDQIMAQoECQEMAgICCwEJARcBHgEAAR8BGwESARgBEgEUARMBEgEQAhICFwEaARwBHwEaAQ0BCgILARgBEgENAgwDCgEMAhABCQILAhABFwEeAQABHQEcARgBFAETARQBEwESAhQBFwEYAR0BIAITAQ0BCQEKAgsBCgEMARQDEgIQAQwBCwIQAhgBDQESAR8BAAIeARwBGAEXAhQCFwEYARoBHAEeASABHgESAQwBCQMKAQsBEAEUARgBFwEUARIDDQIQAQ0BFwENARIBHwEAAx0BHwIcARgBGgIdAR8CFwEUARgBEAEKAQkECwEQARIBGgEbARoBGAIUARICFAETARIBEwEaAR4BAAQgARgBHwQYARcBFAETARsBFwELAQ0BCQQLARIBEwEcAR4BGwEeAR0BGwIUARMCFAEcAR4BAAcgAx0BFwEYAhoBHgEUARABDQEJBA0BEgEXAR0CGwEgAQABHgcACx8BIAIfASACFwESAQsBBQIJARACEgEXARwBIAQfAQAQHgIdARsBGgIfARwBEgEKAQUCCQEQARIBFAEeAR8BHAEaARgBHgIfAQAOHgEfARgCGgIYARcBHgEcAQkBBQEJAhIBEwEdAhgCGgEXAx8BHgEADCABGwEXARQCFwEYAhoBHwEQAQkBBQENARABFAEXAR8BHAEYARMBDQELAQ0BFAEcAR4BHwEACyABHQEXARQCFwEYAh8BFAEFAQkBAwEQARQBGwIgAR4BGgESAQ0BEgIXARwBHwEgAQALHwEeAR8BGAMaAR0BHwECAgUBDAEYAR0BHwEgAh8BGgEYARcBGgESARcBHQEfASABAAwfAh0BGwIcAR0BHAELAQoBEgEXAR0BHgEAAx8BHgEbARoCGAEcAR8BIAEABg=="],
 windfox:[46,38,0.683,"f6ebcff2dfb9e8d0aaddbc8fd0a675c49767b18355cd7f31c87327c1702ab96825947151aa5c1f905c347b5233924f2082421c6d462c67351a5a422f573d284b30203a2d1d45231431201531170e27181024100a190d09110a06080000","ABobAgAKHwEdAQAfGwEXARkBGwEZAQAGHgEbARkCAB4ZAhYBFQEWARkBFwEABRsCFgEXAR0BAB0fARkBFgISARYBFwEZAQADHgEZARYBFAEVARoBHAEAGxsBGQEXARYBFwEWARIBFgIZAR0BHgEbARkBFQEPARQBHAEeAQAbHgEbARYCEgEMARYBDwIbARkCFwIUARICGwEdAQAbHgEbARYCDwEGARYBEgEQAREBDwISARUBEgEWARMBFgEcAQAbHgEbARYCDgEMARYBEwEKAQkBCwEQAQ8EEQETARwBABsfARsBFgIUAQ8BDgENAQsBCQILARABDgEPAg0BEwEZAQAGHAEYARkCFAEYARsBAA8dAhgCEQEKAgkECgELARABDgELAg4BAAUWARIBFAEPAgcBFAEWAhcBAA0fAR4BGAEOARABCwIJBAgBBgEKAg0BCwITAQAEFgEPARYBAwECAQEBDAITARYBGQEADBsBHAETARABDQELAQkFCgEFAQgBCwEJAQgBCQERARoBAAIVAgMBDAEEAQECAgEDARIBDwEZAQALFwEcARMBEQEQAQ0BCQQIAQYBAQEEAQgBCQIIAQkBEAEdAQACDAEHAQICAwEBAwIBBQEPARMBGgEABR0FFwEbARMBEQEQAQ0BCQMTARwCBAECAQgBCQIIARgCGwEAAgwBBgEDAgQBAQQDAQYBDgEYARwBAAIeARkCFwIWARkBHAEaARYBEQINAQkCCwEYARIBDAEeAQwBBAEJAggBHAEbARwBAAIMAQYBAwEBAQMBAQQEAQ8BEAEWARsBHQEbAhkBFgEUAxYBGAETAREBDQERAQ0BCQINAQUBDwEcAg8BAwEIAQkCFgERARsBAAIHAQYBAwEBBQwBBgETAhgBHgIWAhQFFgIRARACCQUEAQUBHAEaAQcBBAEDAgQBBwEOARYBGwEAAQcBBgEEAQEEBAEMAREBEwEaARsCFAgWARwBGAERAg0BCgEJAwgBBgERAQkBBgECAQEDDAEbAh0BHgEMAQYCBAECAQEBAwESAQ0BEAERARgBGgEOAQ8BFQEUBRUBFgEQARMBGAETARACCAUFAQMBAgEBBAQBGQEbAh8BFAEPAQcBBQEGAQMBBQETAQoBCwERARoBFgEKAQkBCgEOARQFFgEIAREBGgEYAREBCgEEAQUDBAEDAQEBAwIBBA4BBQEVAQABGgEUAQYCBQEDAgwBEAENAREBEwEQAQoCCQENARIBFAESAhMCCgENAREBGAETAQ8BDAEFAQQCAwECAgMBEgEEAwMCDAESAQACFAEPAQcBBgIPARIBEQETARgBEAENAQsBCgEJAQoBCQEQAQ0BCQELAQ0BCQILARABEwIVAQwBBgIEAQMBAgIEAQcBDgEPAQUBDgEZAQADHAEUAQwBBwIWARMDGAEQAQ0BCwEKAQkBCgERAQ0BCAIJAQsBCQEIAhEBEAEKAQwDBwIGAwUBBAIUAQ8BFgEABRYBGAEWARgBFgMbAhABDQELAgkBCwEYAQ0BCAIJAQoBCAEEAQIBCQERAQwBBQIEAgYBDwEUARsBGQEXARYBFwEACBsBHQEaARgCGQEdARsBEAENAgsCDQETAQcBCAEKAQkBBgECAQMBAgEEAQUBEgEMAQQBAQIDAQcBDwEZAQAOHAEfAhwBAAEZARACDQELAQUBBgEPAQECBAEKAQIFBQIHAQ8BBQECAgwBBgEWAQATFgERAg0BCAEFAQQBDwEDAgIBAwEGAQ0BCAEEAQMBBAEBAQMBBgEMAQcCDgEVARsBABQZAREBDQEIAQUBDgEaAQ4BBgEDAQIBDAEOAQgBBQEEAQUBBwEDAQEBAwEMAhcBGwEAFRsBEQENAQgBBgEPAR0BDwEOAQcBBgEPARMBDQEJAggBDwEFAQYBBwEOARMBFgEdAQAUGgETAQ0BEAELARMBHgEbARgBFgIUAhYBEAELAQkBCgEYAQwCEgETARABEgEfAQAUGAEQARECEwEaAR8BGAETAh0BGwMTAQ0BCwIaARkBHAEWARABEQEaAQAVHAETAhgBHgEAAR4BGQETARgBHQEWAQABGwEWARADHAEZARsBGgETAh4BABUdARMCGAEcAQABHwEeARoBGAEbAgABHQEYAREBFgEZAR8BAAIdARoBGAEdAQAVHgEWARMBGAEeAQACHgEbARgBGwEeAQACHgEbARUCHgEAAR4CGQEWARsBABUeARkBFgEYARwBHgEAAh8EAAIdARkBFQEWAR0CAAEfARkBFgIcAQAVHAEYAhoBHQEACB8BHAEYAhcBHgIAAR4BHAEdAR4BABYfAwAKHQEZARsCHgEAAx8CACUfAwAR",[[16,21,31,1],[10,15,31,0],[30,35,31,0],[23,29,31,1]]],
 bull:[51,46,0.746,"f3e4c7e4caa5cbaf91be9a76ad88649b74539c67408f63428c58357f573b7e5032784a2e6b4d3766493269432b5c4433603d27563723553d2e4a372953311f473121462a1c38271a3e2216351c132b1e1427150e21110c1c0e0a130c07080200","ACITARQBAAUYAR0BACkGAgoBEwEABAwBBQEXAQAnDQEDAQEBAgEFAQADFAEKAQEBBgENAQAlDQEDAQEBAwELARABAAMYAQQBAQEEARkBACUUAQUBAwIXARoBHQEcAhgBBAEDAQUBFAEAIx4BGwEYAREBCAEFARoBFwMWAggBFQENARUBGAEAHiABAAIbAR0BHgEbARcBEgEZARcBGQEOAQgCCgESARgBEgEaAR0BABwfARsBHgIcAhcBEgERAQ4BDwUFAQYBCgIOARQBGAIAGx4BHAEdAQoEBgEOARABEQIPAgwCCAEDAQYBCAEKAQgBDgEUARsBABoeAQ4BFQEPARECDwENAQ8BEQEYARwBDwIOAQwCAgIGAQMBAQEEAQgBGAIbAQAZEwEWARgBHQEWAREBFQEXARgCFwELAQwDCAEBBgQBCgEXARYBGAEABBUBGQEAExsCHgEaAREBDwEOARwBDAEPAQoBCQIHAQsBBQEBBQMBBAESAQ4BEgEcAQACGAEPAQwBEQEACxwBGwEgAR8BHgIdARwBGAIcARsBGgEVAgkBBwEJAQcCDgEDAQYBAgEBBAQBGAEQAR0BGQEeAQABFgEPAQcBBAELARUBAAcbARwBHwEdARkBGAEXBBwBHgEWARsBHgESAREBCQIHAhEBHAEQAhIBBQEBBAUBHgEUARwCAAEXARUBBQEEAgcBCwEWAQAEGAEcARsBGQEUARABFAUWARgBEwEaARwBFQEPAQkCBwMbARwBAwEbARgBCwEBAwICEgEYAR4BAAIXAQkBBgEFAQsBDAESARgBAAMeARkBFgEUARMBEAENAQgBFAQaARgBDQEaAg8BCwEJAwcCGQEDARgBHgEZAQcBAgIBAwIBCAEcAQACFQEHAxcBFgEYAQADHAEZAREBDQIQAxQFHAEbAQ0BGgEYAQwBCQEHAQkCBwIJAQMBCAEZAQwBBAECAQEFAwEGARQBAAERAQYBBwEMARgCAAMbARgBEQEOAQgBEAEUARMBFAUWAR4BFAEQAR0BGgEMAQcJBgECAwMEBAEGAQQBEAEAARUBCQIMAQMBDQEYAR0BHwEcARUBEQEOARYBFAEQARQBEwEUARMBFAMeARQBEwEeARoBDwEJAwcGBQECAgMBBQEOAQ0CCAEYARsBBAEXAgwBCwEHAQUCCgEbARgBEgERAQ8BEAEUARMBEAETARQBEwIUARcBEwEcARMBDgEQAR4BEQILAQkBBwUGAQMFBQEUAQYCGwEKAQMBEQEXAQ8BDAEJAQcCCAEZARYBDwELAQ4BEAQOAQ0BEwEQAQ4BEwIaARQBDQEUAR0BGwEVAQsCBwUEAQMHBAIFAQMCEgEAARcBCQILAhIBGQERAQ8BBwEMAREBEAMOAhABDgIQARMCHQEcARgCHwEWARIBDwEJAQcDBQEDAwQCAwQFAQQCBQETAQABGQENAQwBCQEPARIBFQEPAQwBCwIOAREBEAQOARMCDgEQAQ4BHwEbARgCHgEfAQ8BCQIHAwYBBAEDAggBCgEEAwgBGQEEAhYBHQEAAh0BEgEMAhkBEQEPAQwBCQMLAREBEgEQAQ4HFAEbARgBFgIdAhEBDAIJAQwBCQEEAQMBBAIIAQoBBQEGAgoCEwEUAQAFEQEWARwBEQEPAQsBCQILAg4BFgEQAQ4IHQEYARQCFgEYAR0BEgEPAgwBCgEGAQUCBAIIAQoBDQEKAREBDQEcAQAIHAERAgsBCQELAxIBGAERAQ4HDQEUARoBEwMUARsBEAEVAQ8BEgEVAREBCgEGAQUEBgEOARoBHAEACRoBEQELAQkBCwQXARkBFQEQAQ4FEQEEAQYBFgEYARMEGAIIARIBEQESARcBHQEcARsEHgEACxoBEQELBg4BFwEaARIBDgMRAQgBAgEBAQQBCAETARgBFAETAhQBGAEeAR0BFAEOARMBHwEdAR4BHwEADhoBEQESAQ8BCwUSARkBFQERAwUBAwEBAwIBBgETARsBFAITARQBEQEGARQBHAEbARABGAEdAgAOGgESAhEBDAELBBUBBQEZAQ4BBgEIAQEHBAESARYBGAEUARMCEAEUAhYBEwEYARwBHwEADhoBFQERAg8BCwEJAQsCEgEEAQ4BBAEBAwIBBQECAQEEAwENARoBFgEQAhQBGwEYAR0BHgEYAR4BIAEADhwBGgERAwsBDwEHAQUBFQEGAQIBAQQCAQYBAgIBAgIBAwIKARQBGAEUAhYBBgEYAR8DABAbARUBEQIMAQkBBQEEARcBCgEFAQMBAgIBAQMBCQECBAUDAgEQARgCFAEaARABGwEgAgARHAEZAQcBDAEGAQQDGgEIAgUBAwECAgQBDAECAQQBAgEDAQcBCQEMAQgBBAEIARwBGwIUARsBHgEgAQARHAEVAQkBBwEEBB0BEAIIAgUDDgELAQkBBwEJAxIBDgEIAQYBDQIbAR0BEQEXASABABAgARkBEQEHAQUCBAEHARUBHgEcAhYBCgEIAgYBEAERAQkBBwEJAxUBEAEIAQ0BHAEdARUBEwERARYBHgEAEB8BEgEMAQkBBwEFAQcBCgEfAR4BFwEZAhgBHQEbARgCFAELAQkEFwEbAh4BHAEbARIBEQIZAR8BABAfARUBDwEMAQ8BEQESAR8BEwEYARoBGQEXARgBIAMeARgBEQEJAwwBGgEgAx4BFwESAREBFQEcAR8BABAgARoBEgEPAhUBHgEAAhwCGQEXARgBIAEAAxwBDAEJAgsBDAEbASABAAEgAR8BGQEXARIBFQEfAR4BABEcARIBDwIVAR4BAAMdARcDIAEfAQACHAESAREBDAEOARoBHgEfAQABIAIaARkBFQESASABABIcARIBDwERARcBHgEAAx0BHAEXARUBFwEdAR8BAAEcARoBGQESAhUBHAEfAQACHQEcARkBEQEMARoBGAEAERwBFQEPAQgBEgEaAR4BAAMeARcBGQEaARwBHwEAAR8BHAERAQsBCAEKARkBHgEAAh8BHAERAQYBBQIXAR4BABAbARYBDgEGAQoBFwEgAgADIAMfAQADGAEMAQoBBQEIAQ4BGwEAAxsBFQEKAQYBCgEWASABABEbARUBFgEZARwBIAEACx8BFwEKAQYBCgEHARYBHAEAAh4BHAEXARkBHAEeAR0BABIgBAANHAEZAQ4BFAEYARoBAAQeARwBHQEfAgAkIAQfAgAT",[[15,22,38,1],[6,14,38,0],[32,41,38,0],[24,31,38,1]]],
 sheep:[42,36,0.734,"f6efdff5ecd9f2e7d3ecdec8e4d7c2e2d0b9d8c7afe3c6a7d6bfa4d1b79ac9b299c3ae96bfa58bb29b81a78e789d826b94786188705c7a5e4b695744614d3e5643354e3d324d3a2e4633273e282033261d2c1e172615111b130f150a08080402","ABITARUIFgEAHRMBFAEVAREBCgELAQwCDQMMARMBFwEWAQAaFQEQAQ8BEAEPAQwBBgEFAQYBBwQOAQ8CFgEAFxQBEgIMAQYBBAEHAQYBBAEFBAYBBwEGAQUBCQEOARQBGQEAAR0BABIVARIBDQEJAgQBAQEGAQQBAwEEAQsBDQEEAQYBDwEHAg8BCgELARMBGQEcAR0BABAVARMBDAEGAQQBCgEHAQYBBAECAgMBBgELAQcBEgETAhIBEwERARIBEwEWARsBHgEADxgBEQENAQcCBgEHAQQCAgEBAgIBDAESAg8BBwETAREBDQEOARYBDwETARkBHQEZAR4BAAgdAR4BHQMZARABDAEJAQcBCQEFAQEECgISAQ0BCgEEAg0BBwEEAg8BAgEFARIBFQEbAR0CAAYfAR0BGAEUAhcBGQEaAQ8BCQEHAQYBAwEBAwQBDQERAQMBBAEDAQEBAgMDBAUBAwEOARgBGQEaAhwBAAMdARsBFgEVAhMBEgIYARYBCQIHAQkBBwEEAQMBDgETAQ4BDAEDAQEEAgQBAQwBBgISARUBEwEaARsCAAEdARwBGgEVAxQBEwESARQBGQEWAQkCCwEKAQkBBwEGAQ4BBAEGAQQBAQUCAQMBAQIEAQwBCgEHARUBFAEWARkBHgEAAR4BGQEWAhUDFAMZAR0BCwEKAQsBCgELAQ8BEAESAQoBAwECAQEFAgIBAgMBBgELARABGQEWARkBHAIAARsBGQEWBBQBFQMXAR0BEwEKAQcBCwEMAQ8BEwEOAQ0BBgEEAQMBAgEEAQkBAQYCAQkBEAEbARgBGgEZARcBGwEaARgBFwIWARcBFQQWARwBFgEMAQQCBgENAQ8BCQEGAQQEBwIEAQEEAgEDAQYBDAEaARgCGgEfAhsBGAEWARcBGQEYARYFGAEPAQUBAwEFAQ0CDwEKAQkBBQEEAgUBBAEBAgMBAQICAgMBBgEKARIBGQIbASABHwEbARgBFQEWARoBFwIWARUCHAEaAQ0BBQEKAQUBDAETAg4BCgEJAQYBBAEFAgoBBAEHAQECAgEDAgcBDAEOARwBGQEbAQABHwEcARgBFwIYBBYCGwEcAQ0BCQELAQQBBwEUAQ8BEgEPAQkBCgEFAQwBGAEdARkBBwEEAQICAwIMARoBEgEeARoBHwEAAR8BHAEYARcDGAEZAxwBGwETARABCwEEAQcBDwERAQwBDgELAQkCDAEfARoBBwEcARoBBAECAgMCDQEZARIBHwEeAQADHgEZARYDGAEZAhsBHQEZAQoBDAEJAQYBBwEOARIBCgMIAQkCFAESARwBHQEVAQYBAQICAQMBCQEeARIBIAEABB8BHAEbARYBGwIcAR4BHwEUARIBDgEGAQQCBwEOARUBDwEOAQgBBwEGAQoCDgEeAhMBBAMGAQgCCwESAR4BAAUeAR0BGQEYARwBGQETARICCgETAQ4BCQEPARACEgMKAQgCCgEIAQoBGQEWAQ4BBAEIBAYBCAETARsBAAceARoBGwEXARABDgENAQUBDAESAg4BCwIMAREBDgEPAQwBCgQIAgoCCAMJAQgBDQEOARYBAAgdARwBFQEQAQ8BDQEEAQYCDQEJAQYBBAEGARICEQENAQwBCgIJAggBCgIIAgoBGQERARMDHAEACRsBFQEQAQ8BDQEPAQkBBAEGAQMCBAEHARIBFAESAQ4BDAELAQkBBwELAQ4BCQEIAgkBFQEdARoBEAESARsBAAkeARYBEwEQAQ8BDAEPAQ4BDQEEAQMBBAEGAREBFQIRAQ4BDQELAQkBDgEQAQoBCAEJAgoBEQEMAQoBEwEYAQAKGwEUAREBEAEOARABEgENAQkBBgIRARABDwEVARMBFAERAQ4BDQEMAREBEwEQAQoDEQENARABHgEADBsBFgESAQ8BEQEUARIBDwEMAhIBDwEKAQ8BFwEVARMDEgEQAREBEwERARABEQEVARkBGgEADR0BFgEQARIBDgEYARMBEgEQAhQBEQELAQ8BEAESARQBEQESARUBFwEYARYBFQIWARwBAA8dARMBEAEOARMBIAEfAR0BEwEQARMBFgEPAhQBGwEVARMCFgEbASABHQEaAhwBABAdARYDHAIgARkBHQEfAR4BHQEPARIBGQEeARkBGAEZAR0BHAEgAQAUIAEdAh8BIAEbAR8BFgEbAR4BGwEeARoBFwEZASACHgEfARgBFQEgAQAUIAEbAh0CAAEfAR4BHwEgAQABHgEaARgBGgEeAQACIAEdARoBHQEeAQATIAEcARkCHgEfAQABIAIAAxsBGQIdAQACHgEfARoBGQEgAgATHAEaARsBHQEeAQAGHwEWARMBGQEfAQACIAEfAwAVIAIeAQAHHwEdAR8BHgEgAQADIAIAISADABE=",[[15,18,31,1],[9,14,31,0],[27,32,31,0],[20,25,31,1]]],
 rat:[42,33,0.629,"f1e7cedac9afb29b83a78c759177637e70617e6554746152715a4b69594f6a544465554a5f5349664e3d5c4c435b473c53453c524037503a30473a2f4333283e2e24332a213a271f2f231c2a1e172719121e1b131d16101b0f0c130f0a0d0504","ABgeAR0BHgEABCACACAYARsDHQEAAiACHgEaAQAdHAEeARgBDgETARsCIAIdARgBEAEYAR4BABscARkBEwEJAQ4BCQEHAR0BHgEfAR4BGgELARABFQEfAQAZGgEfARUBCQEHAQkBDQEFAR4BFwETAhQBGQEaAiABABkZARsBDgELAQcBDgEaARUBGgEVARABDwERARQBFgEaAR4BABkgAR0BEgEOAQkBDgEWARoBEgEJAQoBDAEPAxQBFgEdAQAYHwEaARQBGAEVARABDAEJAQoCBgIMAQoBDAEPAREBGgEcAQAHFQEZARUBAAwfARUBCwEJAQ4BFAEQAQoCCQEKAQwBBQEIAgkBDwERARQBGgIABBYBFwEVAQYBDwEXAQALHQESAQ4BCwESAg8BDAEKAgwBDQEMAQgBCQINAQ8BEAESARkBFgEAAxUBFAEGAQUBBgENARYBAAoZAR0BGwEVAREBEAENAQwCCgEJAQQBDQEJAgoBDAEPAQYBEgEQARUBFwEAARsBFQESAQUBBAEFAQoBGgEABB0BGwEeAyABHAEgARkBGAENAQ8CDAIRARkBFgEHAQwBCgEMAQ0CFAEXARABCQEYAR8BGwEUAQoBCAEGAQ0BDwEaAQADGQEbARYBFQEUARUBFgEdAR8BEgEQAQ0CDwMdAQYBGgETAREBDAEKAQwBEQEcARkBEwIcAR8BGwESAQoBCAERAhQBHQEAAh8BFgERAQ8BEQESAREBEgEYAR0BCwEJAQwDDwEVARIBBAEZARYBAwEFAQoBDQESAgwBGQEaASABAAEbARMBEQEKAQ8BEQEVARwCGgEUAREBDwIQAREBFAEWARIBGgEOARABCgEJAQcCBAEBARoCEgECAwQBBQEaARYBHgEgAQADGAEUAQsBBAEFARkBGwEeARgBCQETAQ8CEgERARUBEgIbARoBEwENAQgCBQEJAQEBGAEaAQ8BAQUGARUBGwEABBkBDwEFAQMDFgEQAQkBBwESAREBEgQXARgBEAEdARgBEwEKAQUBAwEEAQUBBwEIAQIBAQQDARYBGAEWARcBAAQUAQUBBAIDARYBCwEHAgsBEQEMARICEQEUAg4BGQEcARgBFQEJAQQBAwECAwEFAwEfAQ8BFQEcAQAFGQEQAQUBEAEUAQkBBwMFAQgBEgEPAQgBBwEIAQkBCwEZARsBFgEaAQsBBQEBBAMBBQECAwUBAgEVARwBAAccAhMBCQEHAwwBDwEJAQYCBwIIAQ4BCQEIARgBFAITAQMBAQICAgcBEAEIARIBBQEYAgAJHAEVAQkBCAMUARcBCQEGAwUBAQEDAQQBBwEIARkBEgEPAggBBQEDBRMBFQEcAQAKHwEYAQsBCQMLARkBDwEJAQcBAwEBAQMCAgEBAQQBEQEXAQYCDQEUARoCHAEXARYBHQEADBwBGgEPAQkCBQEDARMBAQEDAgEBAwEOAQUCAwEBAQIBDQEVAQ0BCgEUARcBHAEdAQAOHQEXAR0BGQEFAgEBAgETAQUBAQMGAQ4BBQEDAwEBBAESARcBBgEXARIBHAEgAQAOHwEPARgBCQEEAQMBAQEDARMBBwEFAQMBAgEGARABBQEEAQMBCAENAQMBAgERARkBHAEfASABABAdARIBBQECAQEBAgEHAR0BHgESAQgBBQETARABBQEEAQMBBAEaAQUBBwEaAR0CIAEAESABFgEIAQUBDAEZARoCEgEaASACHgEWAQUBAwIHARoBEAEcAhIBDgEYAQASFwEQAQsBFwEaARwCEwEZAR8BFwIcAQgBBwEJARYBIAMfAQsBBwETAR4BABEeARQBDgEZAR8BAAEcARYBEwEaAR0BHgEcARcBEgEQARkBIAEAAiABFAEQARoBIAEAESABEwIWARwBAAIeAiACAAEfARwBFwEYARsBIAEAAh8BHAEYARIBHQEAEhoBEgEQARoBHgEAAiACAAIgAhcBFQEQAR8CAAIcARkBFQEdAQASIAEfASACAAggARkBEgEQARYBHwEAAx4BIAIAHxwBIAMAEQ==",[[14,17,29,1],[7,12,29,0],[27,31,29,0],[19,25,29,1]]],
 lark:[37,32,0.525,"ebe1d3ccbda6d0a36e93a0b58e7e786c84a5587dab5175a5ab64359f54255e64794b709e456a9945628c435b8541557c6f3c2b4343553d50743d4b7039455f373b4e3035463b2f332d2c3727272e2e2426291f1f1f1b1f231313161316","ABEZBRcBGQEAGxoBGQIXARMCEAETARQBGQMAGBcDFQEUAQ4FEwEXARkCABYXARYBFQEOAQYBDgENAgwDDgMVARkBABIOAQsBGAEWARUBEAEGAQQBDAMIAQcBBgEMAw4BFAEXAQAQFwELAQQBDgEUAQ8BDgMHAQQCBwEGAgcCCAIOARQBGQEADxcBEgEWARUBDgMPAQ0BDAEHAQQBBwEEAQcBBgIHAQgBDAEOARQBFwEAAxsCAAMaARwBAAUSARcBFQEUAQ8CDgENBAwBBwIGAQIBCAIMAhABGgEAAhsBGAERARwBAAEZARUCGQEaAQADGAEXARUBFAIPARABDgQNAQgCBwEGAQgDDAEOARYBHAEAARgBEQESARsBAAEXARUBFAEXAhkBAAEbAR0BFwEVARQCEwIQAQ8CFAEEAgwBCAQMAQ4BFQESARsBGAELAQQBFgEdARoBFwEUAQ8BDAEVARcBGQEWARoBFwEVBBACEwEZAR8BHQESAQQBDAEIAwwBFAEZAhwBCwEEARABFwEeAR0BFQEPAgYCFQEZARsBHAEXARUCGQEaARcBFAEZAR8BEgECARsBBgENAQgCCwEFAREBCQEbAgYCFQEcAR8BHAEWARABDwEOAQcBEAEVAR8BHQEXARUBEgECAQsBFQEUARUBAgEfAR0BHwEEAQ0BBgEFAQMEEQELARQBFQEZAR4BAAIZARYBFAETAQwBDQEUARsBHQEVAQsBDgEGAQEBAgEMAQ4BAgEfAwQBCwEFAQkBAwUJAREBFwEcAQADHwEXARQBEAEOARMBFAEaARYBBgEOAQsBDAEEBAYBDgEPAQ4BBAEDAgkBAwcRARsBAAQaARcBEAIPARABFgEZAg4CDAEIAQcBCAEHBQQBAwMKAwkDCgIbAQAEHQEXAhQCEwEUARkBHQESAQ8BDgENAQwDCAEHAQgBBAEBAQUBCgEJAQoBCQIKAhEBGAEbAQAFHQEVAxQBFQEdARUBFgEZARcBEAEPAQ4CDQIMAQQBAQIDAQoBCQEDAwkCCgEeAQAHHQEXARUCEgEdARUBEAEZARUBEAIUARMCCAEEAQIBAQICAQUBCgMRAhgBAAkfAR0BGQEXARwBHQIXAQ4BDQEIAg4BDwEQARUBBgEEBQUBEQEYARsCAA0cARoBFQEUAQ4BCAEMAQ0BDAMUARcBAgEBAgIBBAILAh0BHwEADxoBFQEQARMCFAEMAQ0BDAETAQ4BEgEBBQIBCwIZARwBABAXARUBEAEUAg8BDQEVARYBGQEFAQEGBAEUARUBABEdARkCFAELAhYBHQERAQUBAQUCAQsBEgEaAR0BABIdARoBGAEKAQkBCgIJAQMBAgIBAQICCwIcAR0BABUfAREFCQEFBRsCABgcAhEBHAERAQsEEQEeAgAYHgEYAQoBEQEfAR4BGwEeAh8BEQEfAgAZGAERAhwCAAIeAgoBHgMAGBsBEQEJAhgBAAMeAREBCgIeAQAYHwERAxwBHwEAAx4EABkcAR4BGwEcAQAFHwEADg=="],
 grasssnake:[42,27,0.616,"c8d2a1a8b96f91ae5085ab4a90a35a84a14b7da0457b9b467b944472943c718e3c6a873a758143767843657c385a702f8a4d40625f395851315663314b4d2b4a542a454626453d273941234c2e24363720362c1b2e331b2b2819261c14181109","ABscAh0BAAIeAQAjGwEYAhsCGQIWARkBACAdARsCGAEPAQwCDwEWAhsBAB4bARUBFAEPARQBCAIJAQoBCwEPARYBGQEeAQAbGQEdAQ8CCwEHAQkBAgIIAQoBCwEPARABHQEeAQAaFwEUAQ8BCAEJAQYBBwEIAQIBCAILAQgBDwEUARkBABUdAR8CGwEcARkBDwEJAQQCAwEEAQcBCQEHAgkBAQELAQwBFgEbAQASGQEWARgBGQIcAR4BGQELAQYBAwEEAQYBEAEfARkBBgEHAgQBCwEMAQ8BHQEAERMBDwEXARQBDwIQARsBFgENAQYBBAEDARYBHwEBAQUBFQEHAgsBEAEPAh0BABAbAg8BCQELAQwBCwEWARcBDwEVARIBBAEDARUBAgEaAR8BHQEHAQgBCgEPARABDwEdAQAPGwEcAQ8BCwEHAQEBBgELAR0BGQEQAQcBBgEHAQQBBgEBAR4BHwEXAQYBCAEJAg8BDgEaAgADHgEcAx4BAAUdARsBEwELAQYBBAEBAQYBAwEGARYBEAEMAQsBBwEGAQMCEAILAQYBCAINAQ4BEQEOAREBGgEAARYBGAIOARMBGAEcAQAEGwEVAQ8BCQEGAQQCAwIGAQ8BFgEPAQsBCgEHAQQCAwQGAhEDAQERARoBAAEeARUBFAESAQ8BEgEXARsCGQEfAR0BFQENAQYCBAEDAQQBBwIJAR0BEAEMAQkBCAEGAQcBAwEBAR4BHAEfARwBGgERAxoCAAEbARcBDAIGARABEgEcARsBHgEZARcBFgENAQ8BEwEDAgYBCQEIAQYBEAEWARQBDAEIAQkBBAEGAQEFBQERAhoBHAEAASABFgENAQYBAwEPAQkBEgIeARUBFgEPAQkBDwENARIBBgEQARYBCQIHAQkCDQEUAQ8BCwEIAQYCBQQOARoCHAEAAiABFQEPAQMCCQEUARUBEwEYARMBFgEMAQcBCwIJAQYBFgEcARMBDwEIAQkBAQIFARUBEgINAw8CFQEbARwBIAEAAx8BGwEUAQ8BCgEJARQBDQEcARcBBwEEAggBCwEQAQ8BEAEJARQBHAIFAQECAgEBAQ0BEgETARcBGQEeAR0BGQEACB8BFwEQAwsBDAEXARQBBwEDAQQCDAEWAQ0BCQECAQ8BFQEfARcBDQEFAQ4BDQESAhMBHAEfASABAAogAR4BFAIWAQ8BCwEWARQBCgEEAQMBBAEPARkBCQECAQECEgEfARMBFQESARMBGAQVARIBGwEACx4BHAEXARsBFgEUAhYBDAEKAQMCAQESARYBDwEBAQUBEgETARIBGAEcAR8BHgMcAQ4BHgEfAQAMIAEYARsBEgECAQEBGwEQAQsBBAECAQEBAgETARIBDQESAhoBGAEABh8BFQEgAQAOIAEfAQ4BAQIOAQ0BEAEJAQECEwEcAR4BHAEeAR0BIAEAGRMBBQECARIBDgEdARUBBQEOAQ0BHAIRARwBHwEAGx8BEgETARgBIAQSAhMBGgESARoBACMfARIBEQEcARoBHwEAJSADABo="],
 locust:[42,41,0.548,"ced59ca8bf5ea3b26a8baa4696957579943f73863b857a6f6078355f6f3259642e696142545634695435574c34604a3658402b484b2c483f254339264732224a2c203a331f3c26183326192b22132f1b1326140e1d140d190c09110404","AB4IAQwBAAMMARABACIIAQEBCAENAQABEgEIAQEBCAEAIBABAQIIAQ0BEgENAQwBBQEBAQgBAB8IAQECCAENAhIBDAEIAQEBBQEIAQAdCAIBAwwBDQESAQ0BCAEBAggBAB0IAgEDBQEMARIBDQEFAQEDDAEAHAwBCAEFAQEDCAESAQUCAQEFAhABABwQAQgBBQIBAggBEwEFAQECBQIQAQAcDwEIAgUBAQIIARcBCAEFBBABABAeAR0BHAUABQ8BDAEIAQUCDAEXARQBFQEQAQUCCAEPAQANHgEAARsBHAEbARoEGwEZARwBAAMSAQ8BDAEIAQUBEQEUAw8BBQEIAQ8BFAEADB4BHQEcARsBFQERAhADFQEcAhsBGgIcARUBEAEIAQEBFAEXARQBFQEIAhABFAEACxcBHwEXARUBEQIQAQ4BEAEOAhMBHgEZARcCGgEZARgBGwEQAQgCDwEXAhMBDAIXAQALGwEZARECDgEMAw4CEAETARcBEwESAQ0BCwETARoBFgERARMBDwESAQYBBwESAxkBFAEAChwBFQERAQ4BDAEIAQUBCAEOAQcBDAERARoBFwENAgsBCgEOAREBFgEOAQoBBwEEAQYCBwEJAQ0BGQEXAQAJHAEXAREBDgEMAg4BBwEFAQgBEQEOARsBEwELAwoBCQEXAREBFQEHAQYBBAEDAQQCBgEHAQkBCwEXAgAHGwEZAREBDwEOAQwBDgUPARgBFwESAQkBBwEKAQsBDQEOARUBCgEHAgYBBAMFAQcBDQIKARQBFwEABR4BHAETAREBDwIOBx4BDwELAQIBAQEEAQ0BGQEaAQ0BCQIHBAYBAQEMARIBDQEKARQBGQEABBwBFQEZARMBEQEPAhQBEwEVARMEGgEGAQQBAgEBAgcBCgEXARIBCQMGAgsBBwEBARABFwEZAQoBEwEZAQADHgEPARgBFgERAhQBDwEdARwBGQEXAhsBGgETAQQCAgQFARIBDQEJBBIBCQEKAQcBAQEbARMBCwETARQBAAMZARgBFwEbAREBFQEbARwBFwEHAwYBEwEaAREBBAECAgECAgEEAQoBCwEJBQcEEwEKAxIBHQEAAR0BFQEYARsBEQEbARwBGQEXAQcCAgMLARoBEQEEAQIDAQECAQQBBwETAQoBCQQHAwoBCwEKAgkBDQEdAQABGQEVAhEBFgEcAQ8BDQEEAQIBBAEBAgQBBgEOARUBBgECBQYBBwENAQoEBwMKAxQBCwEKAQ0BHgIbARUBFgEbARwBFQEXAQYBBAECAgECBgEEAQoBGAESAQIFBAELAQkBCgEJAQsBEgEHAQkCCwEXARABHAEXAQ0BEwEeAR8BHAEYARwBGwEcAQsBBwEEAgIBAQEEAwIBBAEXAhIBBAEDAQIBBAMKAQsCCgEHAgkBDQEbAREBGAEbARcBGgEbAQABHgEbARgBHAEaAgoBBAQCAQQDAgITARoBFwEHAQQFCQESAgsBCgEJAgoBBwEIAQ4BEAEPARsBAAMaBBQBCQEECAIDHQEaARQBCQEEAwYBBwEKARcBFAETARIBCwIKAQ4CFQEdAQAEHwEcARoBDQESAQcBBgEEBQECAgMfAQcBFwEZAQ0BCgEHAwsBCgEbARwBFwETAhcBGQQABR8BDQEFAQsBCgEGAgQEAgQBAR8BBwEEAQsBFwEdARoBFwESARcBGQEeAR8CHgMdARQBEwEaAQAGEgIaAQ0BBwIGAgQDAgMHAR4BBwEGAQQBBwEXAR0BGgEZARgCFwEfAQAGEgEYAQAGEwIXARIBCQEHAwYBBAICAwoBHAEHAQQCBgEFARUBEAIRARYBGwEeAQAGEwEVARgBAAQaARgBGwIYAQsBCQEHAgYDBAIGAQcBHAEJAQQCBwEbARABCAIRARUBGwIABxMBFQEAAxoBGAERAQ4BGAEbARMBCQMHAQYDBAEHARwBFQELAQQBBwEVAQgBEAEFARABHgIVAQwBHgEABhQBEwEAAhwBFgERAQ4BFgEVAhoBFAETAQkBBwUNARwBGwEVAREBFQEMAQUCFQEZARsBHgEcARABGwEABxMBFwEAARwBFQEYAhwBGwEVAR4BGwEVARIBDQELAQoBBwEUARwBEQEOARsCEQEWAQwBFQEcARsBHAEZAR0BFQEQAR4BAAkcAQgBGAEcAQACGAEVARsBGAESARMBGQETARcBGwEcAREBDAEVARwBGAEbAhwBEwEDARoBFAEeARsBEQEbARoBAAkcAQAEFQEQARgBFgEIARQBHgEfBBwBDAEbAR4BHwMcARoBGQEVARcBHQEVAREBHAEADx8BFQEUARYBCAEVAR0CAAIeAR0BDgEVAR4BHwEAAhsBFwEUARcBGwEaARwBHgEAEB8BDAEXARUBEQIYAR4BAAMdAQ4BFgEeAQAEGgEUARUBEwEbAgARHwEcAhkBGwEVAh8BAAQZARgBGwEABR8BFQERAR4BABMfAQACHAEWAh4BAAQeARsBFgEABhwBHwEADQ==",[[6,8,37,0],[9,13,37,1],[16,21,37,1],[24,31,37,0]]],
 sunflower:[36,42,0.585,"f7d458f4c74aefbc43e3a631cb8c2ab47a28788b3f657037ac6b20925e26a15d1c8e501c834d21655e3057512d774a2350452772401d6340216937155e341a473f223d351d51311a382c1a4c2915462111302316381a1125150e170e090d0505","AA8aARwBGgEZAQAeGAESAQwCFQEWAhcBABsVAQsBBQEDAQkBDQETARUBEQIAAQoBEgEAEwwBEgEAAhMBBQECAQEBAgELAQ0BEAEaARYBEwEGAQwBFAEAEQwBBQEGARIBEAEMAQQBAgIBAQYCDQEVARQBBgEDAgwBABAUAQsBAQIGAQwBBgEEAQMBAgMMARQBFQEGAQIBAQEDAQ0BFgEADxIBCQEBAgIBBQELAQUBBAEDAQQBAwENARoBCwEEAQICBAEKARcBFgEYAQAMGAESAQYBBAEBAgIBDAEFAQQECwEaAQUBAgMGARgBEgEQARIBGAEACgsBDQEFAQsBBQECAQEBAgEKAQkBDAQUAQkBBAECAgQBBgEFAQYBBAELAQwBFQEACQkBBAECAgMBBAIFAQwBCwEaAhsCHQEKARQBBAIFAgICAQEFAQkBEAEACRQBBgEBAQIDBQEGARsBGgEMAQoCDQEQARIBFQEUAQkBBAEBAgIBBAEGARgBFwEACBcBGgEKAgMBAgIKARoBFQEMAQkCCgINAxIBGgEFAQICBAEMARIBHAEXARwBAAUWARcBEgIMAgkBBAEFAQoBGgEQAQsBAQEDAQoEDQESARgBFAEEAQUBCQEaAxkBHAEZAQADFwETARQBCwEFAQQBBQEMAQoBFQEdARUBEAESAQYBDAEKAxUBGAEQARUCCgENARUBGgEVARIBEAETARwCAAIaARQBDAEFAQEBAgIEAQsBGgIVAQ0CCgENBBsBFgENARUBGwEaAQEBDQEaAQkBBQEGAQ0BFQEZARwBAAEUARIBCwEGAQMBAQEDAQQBCQEYARoBEwENAh8BFQEQAxIBHwEQARUBGgISAR0BFQELAQUCCgETARwBHgEAARsBFQESAQoBBgEJAQUCCwEYARoBFQENAhwBEgUeARIBFQEbARQBBgEYARoBDAENAhIBFQEaARwBAAEdARgBFQESARQBDQEJAQ0CGgIVARIBDQISBBQBEgEQARoBGwEUAQUBEgEVAhIBEwEVARwBHgEAAxoCFQMUARIBCwENAR0BFQETARIBEAEUARUBGwITAxgBHQEMAQUBDAEaAhUCHAIABBkBHAIYARUBBQECAQQBBgEQARgBGwEUARIBFAEVBBMBGwEYAQ0BAgIDAQUBFAEdAR4BFwEZAQAFHwEcARgBCwEEAQICBQEGAR0BHAEYARUFGAEbARwBGwEFAQMBAQIDAQsBGAEcAQ4BDwEABhcBEAECAQMBAgEDAQUBFAEKARsCGgIYARoBGwEcAR0CFQEFAQICAwECAQQBBgEZARYBAAcTAQYBAwMEAQYBEgEEAQkBCgEdAx4DFQEGAQUBBgELAQUBAgEBAQUBBgERAgABDwEIAQAEEwEFBA0BCwEEAQIBAwEFARsBFAENAhQBFQEUAQMBAgEEAQwBDQELAQYBCgEQAQ4BCAEOAQgBDQETAQAEEAITARABGAEJAQIDBQELAQUBBAIFAQkBCwECAgMBBgEdARsBFQEXARkBDgEIAg4BEAERAQAFEQEXARYBHQEFAQMBAgEEAQ0BCQEDAwQCGwEGAQQDGgEWARcBHAEWAQ8CDgIWAQAFHAIgAR8BHAEEAQMBBAEFAR0BEAEDAQICBAEFAR4BFAEJAQUBCQEXAQ8CAAUWAQAFHAEXARECFgIKAQUBDQEeAhgBBAEDAQIBBQEJAR4CHAERARYBDwEOARYBHAEACRwBFgEPAhYBEQEPARkBCgEVAR8BHgEZAQkBBAEDARIBHQEXARkBFgEIAQcDDwEXAgAIHAERARMBBwEPAQgBDwERARkBIAEfAhcBEQEEAhQBGQEWARECCAEHBAgBFgEcAQAGHwEZAREBCAEPAgcBDwERAhkBHAIIAREBBwEWARkBFgEIAgcCDgEWAQgBBwIIARwCAAUfARwBFgEOARMBDwERAg8EGQEIAQ8BCAEWARkBFgEIAg8BBwQIAQ4BBwEIARwBAAUgARwBGAIaARYBEQEPARYCEQEZAggCDwEZARwBFgEOAQgDBwYPARcCAAUeARkBGwEeAR0BFgEPARkBHgMWAQgCDwEXAR4BIAEfARkBFgEPAQ4CCAIHAQgBDgEXARkBAAUfAR4BHwIcAh4BHAEXAR4CDwEIAQcBDwEXAR4BIAQfARwBFwEWARECFgIZAR4BAAYfAQAEHwEIAQ8BGQIOAQgCFgEXAR8BIAEeARwDFwEfAyADHwEADBwBGQEWARwBCAIOAQ8BFgEeASACGQEPAQgBHgEfAQATHAEWAQoBFgIPARYBEQEWAR8BIAEfARoBGQEWAQ4BGQEeAQARIAEcAQ0EEQEcARkCHwEgAR0BFgEOAxYBHgEfAQAQIAEaARABDQEQAhoBHwMgAh4BEgEOAhEBGAEeAR8BABAgAR0BGwESARoBGwEfAQAEIAEfAR0BFQEcAQgBGwEfASABABEgAR0BGgEfAgAHHgIfARwBHgEfAQAK"],
 earthgolem:[42,40,0.729,"c4b17bb39d6baf9169a58f60a98861a187609880569f7f5a9276538a6e4d87684a8164487d5c4272563d6b513a684c36614a336647315d422f563f2e543b29503526473525452e213f2a1e39241a3325193020162e1c152615101b0d0a0d0603","ABAcARsBHAEdAxwBGwIZARoBGQIAGxsBGQERARACEQMQAxIBEAERARgBGQIAGBcBGQEVAQ4BCQEHAgkFDQEMAQsBEAETARgCABcaARYBDgEMAQEHAgEFAgMCBQETARgBABcdAQkBAgEBAwcBBQEDAQgBBgEDAggBAwIFAQYBFgEaAQAWHQELAQkBAQEDAQEBCAEEAQUBAwMFAQcBBQIJAQoBFgEaAQAWHgENAQsBAgEEAgcBBAEDBQYBBAEDAQoCGAEbAQAWHgEOAQsBAwEEAQIBAQECAQMBAgEDAgQBAQECAQQBCQELARkBHAEAERsBHQEaARwBHQEeAQ4BCwEDAQQBAgEBAQIBBAEFAwQBAQIGAQkBDAEZARwBABAdARYBBAECAQQBCgINAQoBAwEEAgEBBAIGAQMBCAEHAQEBAgEHAQoBDQEZARwBAA8eARcBCgEBAgcDEAEJAQQBBgEEAwcBAgIEAQoBBwEEAQcBCwEOARoBHQEbAQAOHQEaAQkBCgEMAQ8BEwEcARMBDgIHAQkCBwEGAQoBDQEHAQwBFwEHAQoBEgETAR4BHwEZAR4BHwEACR8BHQIXARgBFAEMAQ0BDgIUARkCDgENAQcCBAEDAQQBBwMKAQwBCwEWARoBFgEUAREBEwEdASABAAcYARwBFwIYARkCEwEOAQ8CDgEYAR0BEwESAhABCQEEAQYBCAEJAQoBCQELAQ4BGgEeARMBEQIQARwBIAEABhgBFgEMAQkBCAMKARkBFQERAQ4CDAIPARgBFwIVARQCFgEXARYBFQEWARkBHAEUAREBFAIcAR8BGQEbAhwBAAIZARYBDwEDAQIBAQMCAQgBCgEdAQkCBwEGAQoBEQMPAhQBFgEUARMBEgEQAQ8BEgEYAR0BFwEfARoBEwERARMCGQEaAQABGwEWAQkBAwEBBQUBCgEOARgBDgEMAQsBDQEBBgQBDgQPARIBFQEZAR4BHQEVAQ4BDAELAQkBDgEVARsBGgEVAQgBAwECAQMCAQEMAQoCDAEdAQ8BDgEPARIBCQEGAQMBAQICAQEBDgEQAQ8CEAEVARgCHwEVAQsBCQEBAQIBAwEJAREBGwEaARUBCAEDAQIBAwMLAQoBCwEMARsBDwEMAQkBDQEXARgBDgEFAQIBAQIOARIBGAEdARsBEAETARQBHgETAQsBCgEDAQIBBQEKAREBGwEaARYBDgEPAQIBAwMMAQoBDAIbAQ8BCgEFAQgBDAEHAR8BBgEFAQIBAwENAQ8BHwEKARMBCgENAREBHQEPAQsBDAEDAQIBBQEKAREBGwEaARYBCQEFAQoCBgECAQwBDQEOAhoBDwEKAQUEDgEIAQYDCwEOARcBCQIMAQ8BEQEcARUBDwENAQcBAwEJAQwBFAEbAhcBCAIFAQkBCwEDARABDwEQARkBGgEPAQsBCAERAQgBBQQGAgkBDAELAg0BEgETARQBHQEVAQ4BCQELAQ8CFAEVARwBGwEXAQkCCAEGAQgCEwERAQ8BHAIQAQwBCQERAQkBBQEDAgUCBgEHAQ4BGwERARABEgETARQBHQETAQ4BDAEJAQ8BEwEPARUBHAEZARcBCgILAQoBCAENARkBGgEYAR4BHQERAQ4BCQEIAQoBCwEJAwoBDAIYARQBIAEUAREBEwEVAR4BGQEPAQwBCwEHAQwBFgEZAR0BGgEYARQBEAEJAQsBCAEPAQ0BCwEHAR4BHQETAQ8BDAELAQ0BFwEMAR0BHwQUAQsBEgENARUBGgEZAR0BEgEWAQ0BBgEJAQwBCgEYAR0BGgEWAQoBCAEGAQsBCAEBAQgBBwEJAQ4BGwEUAQ8BDgENAQ4BHQEWAQ0BCQIHAhEBDQEOARIBFgEaAhUBFAERARkBCwEKAgsBFgEdARsBEwEIAQcBBQELAQkBAQEOAQ0BEwEMAR8BHgEZARYBFQIOAQkBBwIGAw4BEwESARUBHgEgAR8BFQESARMBGgEKAQsCDAEWARwBGwESAQgBBwIKAgkBFwEUARYBDwEfAh4BHwEeAR0BHAEbAhcBGAEZARoBHQEeBSABFgETARgBGQENAgwCFwEcAQABGAEWAQ0BCQELAQwBEQEYARUBDwEeAR0BGAEXARgBDgELAQkCAgEBAwcBCQEMARQBFgEYARwBIAEaAR4BHQEZAQ8BDQEPARkBGgEAAxkBFgEUAhUBFgEdAR4BHQEeAh8BHAEZAQ8BDgEMAQoBAQEEAQIBAQEKAQwCEQEZAxwBHwEgAR4BHAEbARkCHwEgAQAEHgIfASABHwIbARgBEwEOAREBGQEfARMBDwEOAQwBCQEEAQYBDQIPARIBHAEdARgDHQEfAiAFAAkfARgBEwEQAQ8BCgELARgBGwEZARYBFAEPAQwBCgEMARABEgEWARkBEwEQAhUBGAEaAR8BAA8fARYBEQEPAQoBBAEKARYBFQEdAhYCFQIWAhgBHQIPAQ4BDAEOARcBGgEdAQAOHwEcAQ8CDgEJAQYBDgEWARUBFAEXAR4BIAUbARYBFQEPAQoBGAIXAhwBHwEADSABHgEQAQ8BDgIJARgBFQEUAhUBHQEgAQACIAIaARgBFgETAQwBFAEVARcCHgEgAQAOHgEQARUBGAEZAREBHAEYARUBFgEVARwBIAEAAiACGQIcAR0BFgEVARYBFAEVARsBHgEADRwBGgEUAQ0BCgEHARIBHQEWARMBFAIcAR8BAAMgARkCGwEXARMBEAETARABCgENARoBHgEADBkBEgEMAQoBCQEIAQ0BDAETAxUBHAEgAQADIAEXARgBFgERARIBAQEDAQkBDQEOARgBHgEADB0BEAENAgUBAwEMAQ0BCwEWAhcBHQEgAQADIAEfAhMBFAEOAQoBDAIOARMBGQEeAQANEwESARYBCAINAQ4BDQEZAh4BIAEABCACHwEZARcBDwEOAxMBGAEdAQAH",[[6,19,34,0],[22,35,34,1]]],
 jelly:[41,46,0.707,"f6e7b7f2dda0efd798ecd095e7c887e2bf81e0b672d7b478d1a970dba666caa367da975ebd8f57b5814ec07142a16d418f6037bd5b3ca753328b5232a7452c6e5035823725903023742f1f70271d6a2a1e5734224e271d5d231c3d1915","ABAaARsBHAUdAR4BHQEfAQAcHAEXARgEFwUbARwCABoWAR0BGQETAQ8CEgYVARcBHgEdARwBABUWAhEBDgIQARcBEwESBhMBFwIaARkBFgEAFBEBEAEOAQkBCAIJAREBFwcZAREBDgENAQsBDgEWAREBFgEAEBYBDgELAQkBCAEFAQYBDQEOAQsBCQEUAQ4BBAERARABDQEOAQkCBgIJAQ4BFgIADhYBDgELAQgBBQEEAQgBDgEJAQYBBQENAQsBBQECAQYBDgEFAQkBDgEGAgUCCAELARABFgEADBYBEAENAQgBBAECAg4BCgEEAgMBCwEFAQIBAQEDAQsBCQECAQgBCQEBAQYBBQIGAQ4BEAEWAQAKCwIIAQYBAgIBAQgBCwEEAQEBAgEOAQYBBAECAQECCAEGAQECCQELAQEBCAECAQEBBAEOARABFgEACRYBDQEIAQQBAgEBAQgBCwEIAQECAgEOAQEFBQEIAQECBQELAQUBAQEGAQEBBQEIAQ4BFgEACBYBDgELAQgBBAECAQEBCwEIAQIBAQEGAQoCAQUEAQcBBQEBAgYBDgEBAQMCBgENAQ4BFgEcAQAHEQEOAQ0BCAEEAggBBgENAQICBAENAQcBAgEDAQIBAQIDAQYBDQEBAgQBCQEGAQEBBgEIAgsBEAEWAQAHEQELAQgBBQEJAQgBBgILAQMBBAEcARABBwEDAQICAQIEAQYBDgIBAgYBDQEBAQYBCQEIAQsBDgERARwBAAMWARQBEQELAQQBAgEEAQkBBAECAQgBCQEDAQkBFAERAQcBAwECAQEDBAEJAR8BEQEDAQEBBgENAQkBBQENAQYBCwEOARYBHAEAAxEBDgEIAQEBCAMGAQQBAwELAQUBAwENAREBDAEGAQIBBAEGAQECBAEKARcBDQIBAQQBDgIFAQsCBgEJARABFAEABBYBEQEOAQ0BCwIEAQMBBAEOAQMDBQEMAQYCDAEGAQECAwEGAQ0CDAEDAg4BDQEIAhABCAEGAQ0BEAEWAQADHAERAQ4BCAEDAQsBAwIEAQ4BAgQHARUBGAETARIBAQIDAQYBBQESAQwBBgEDAQUBDgEJAQUBCwEJAQYBDgEWAQAEFgEQAQUBCQELAgMBBAEGAQ4BAgMGAQ0DDwIDAQIBBAEHAQIBBQENAgIBBAEOAQsBAwEIARABCwEOARYBHAEAAhYBEQELAQgBDgIKAQUCBwEQAQMBAgIQARIBBwEBAQcBBgEDAQIBBQEKAQQBAwEQAQ4BAwIOAQ0BAQEGAQkBDgINAREBFgEAAQ4BDQELARQBEQELAQYBBwEMARQBDgEDAgQBDwESAQcBAgELAgMCBQEMAQMBCAETAQ4BAgEDAQ4CAgEEAQkBEQEOAQkBDQERAQABDgEUAhYBDgEFAQYBCgERARsBEAEFAQMBEQEXAg8BBQEJAQ4BBwEDAQUBEAEOARABFAETAQgBBQERARMBBQEBAQsBEAEcARECAAMcAw4BBwENAhcBHAEXAQoBBwEXARQBFwETBBABBQEIARACEQEZARcBCwENARkBFwEJAQQBDQEQARsBHAEABBwBGQETAQ0BCgEPARgBHgEdARQBDgEUARcBGAIVAhcCFAEFAQ0BEQETARcCGAEVARgBHgEaAQ0BDgEQARMBFwEbAQAEHAEYAQ8BFAERARgBFQEZAR4CGQEYAhUBHgEfAR0BFwEYARUCFwEVARcBFQEZARoGFwEYARICHQEABB8BGQEYARsBHgEYARIBGAEaARkBGAEVARkBHwINARYBFAESBRUBGwEWAhkBFQEYARoBDgEQARcBGAEaAR8BAAUdARoBHQEbARMBEgEYARoBFwEVARMBGAEOAREBFgEfARABDwESAw8BEgEeAR0BEQESARUBGAEZAQ4CFwEaAR8BAAcdAxMBEgEXARsBFwEVARMCCQEVAR8CDgEKAQwCCgEIAQwBHwIWAQsBEwEYARcBDQIXAR0BHwEABx0DEwESARcBGwEUARkBCwEEAQcBFQEeAR8BDQEHAQoEDAEWAR0BEAEGARIBEwEXAQ0BCgEUARwBAAgbAh0BEwESARcBHAERARsBCwEDAQcBEwEPAQ0BCgEHAQoBFwEKAQwCDQIIAhIBFQEbAQ4BCgERARYBAAgfAR0BHAETARIBFwEdAR4BFAEOAQcBCwENAQwCBwERAQ8BEwERAQwDDQEJAQ0BFQEaAR8BEQEMARABEQEcAQAIHQEeARMBEgEXAR0BHwERARQBCwEHAQ0BDAEKAQcBEAIRARYBCgIMAQ0BFAEXARoBHwEdARQBDwEGAQwBFwEcAQAIHQESAhkBHQEfAh4BDgEGARACDQEMAQkCCwIOARMBDAEPARwCHwIcARYBFAEKAQ8BFQEXAQAIHQEVARIBGAEdAhcBGQEOAQYBCgENARgBFAUWARcBDQIcARsBHgEaARwCEQEKAQcBDQEVAQAHFwEVARICEwEeAhcBGQEOAQYBAwEOARMBHgQdAR4BEwENAQcBFAEbARgBFQEaARsBFAEKAQYBDQEXARwBAAUeARIDHgEaAh4BHQEeARABBgEFAQ0BEwEaARkBDwEVARsBFwESAQwBBQEUARsBGQEeARoBGwEWAQoBDgEPARsBHAEABB4BGAESAhgBHgIXAR4DFAEHAQUBCwETARoBGAESARUBGAIPAQcBEQEbARwBGgEeARgBGwEWAQ4BEQEWARsBHQEABB0BGgEYARIBFQEaARcBFQEWARsBEAEHAQUBCwEXARoCEgIYAhUBEwEHARQBHAEdARoBGAEVARoBFgEQAQ0BEQEXAR0BAAQeARUBEgIYARkBGwEcARYCEwEKAQMBCwEXARoCGAEeARcBGAEVARcBDAEHARYBHAEbARUBGgEbARoBGQEPARIBGQEdAQADFgEZARUBEgIVARoBHAEWAxQBCgEDAQoBFwEZARoBGQEcAhgBFQEYAQcBCgEUARYBHAEXAR0BHAEZARgBFQEdARwBAAMXAQ8BFwEaARgBFQEYARkBHAEAARYCFwEPAQYBBwEQARcBGwEdAQACFwEYARMBDQEKARYBHAEABBwBHgIABBICFQEXAR4BGgIeARsBAAIXARoCGAEMAQUCEgEbAQADHQEaARUCFwEbARwBAAUdAQAGFQEAAh8CHQEABBoDEwEMAQIBBQEPARQBAAMfAR4BGgEZARoBHgEcAR0BABUeARgBEgEMAQcBAwEPARUBHAEAAx8CGQINAhQBHQEAFh4BGAEPAQQBAgEPARcBHAEAAx8CGwEXARMBFwEbAR8BABYbARUBEgEHAQkBDwEXARwBAAQfARwBGwIcAR8BABgcARkBEwESAhcBAAYfBAAM"],
 g_plains:[52,42,1.083,"f7f0dcf2e6ceebdbbfe1c8a3d4b288c3996bcd9150be874fb278419e82689a7454946c4b7e624c8d5e397758406f533e785136724a31674c3a60443267412b5c3926543c2f4d3528492e2244271e3a251d311d162d171325100d1c0e0d110403","ACMfAgAIIAEAKBwBGwEaARsBAAYcAR4BHAEAJh0BGwEXARQBHAEfAQADHAEeARsBGAEfAQAlGgEbARIBFAEYARUBGQEaARsBGQEdARgBFwEZAR0CACMcARkBEgIMAQ0BEgEbARoBGwEUARwBGQEQAhQBHwEAIx8BGQEPARQBBAEPARQBGgEWAQ4BEQEWARcCDAENAR4BACMbARMBDgEPARcBGQEXAgwBCQEIAQkBEgEcAQ0CHQEADBsBHgEfAR4BABIeAR0BFQERARgBFAETARABDwEMAQcCCAEJAQ4BFQEZAR0BHwEACh4BGwEZAh4BHwEAER0BGwEUARcBEwEQAQ8CDQIJAQQBBgEHAQwBDgEUAR8CAAgcARkBGwEYARcBGAEXARgBHQEADx8BHgEaARQBDwMNAgwCCwEEAgYBBwEMAQ4BGAEbAQAHGwEXARgBCgEPARMBFAEPARoBGQEdAQAHHQEgAwADHgEYARQCEAENAwwBCgENAQwBCQEFAwgBDgEMARsBHgEABB0BEwENAQsBDQEEAQwBEAMUARgBHQEABB8BIAEeARoBGQIbAR8BIAEYAR8BGgEUARMBEAINAQwCCAEGAQgBCQEGAQUBBAEHAQgBBgEWARwBAAMbARgBCgEFAQ0CBAEQBA8BFAIZAQABGwEZARwDGAMZARsBFgEeAR8BGQEXARQBEAEPAgsCBgEDAQsCBAECAQQBBgEJAhIBHwIAAg0BBQEDAQIBBgMPARAFFgEYARsBHAEbARQDFwEYAxkBEgEWAR8BGwEZARQBEwEPAQ0BEAEWARsBFgEIAQsBAwEBAQIBBgEMAR4BHQEeAQADFAEMAQQBAgEDAQQCCgEQBBMBFAEcARkBFAEQAxMBFwIYARkBEgEOARoBGQEYAhQBEwIPARkBHwENAR0BHwEQAQQBAQIFARIBFwEZASABAAMTAQwBBQEDAQIEDwEQARMBFAIZARoBEAEPAhACEwEUARcCGAEOARIBHgEXARQBEwEXARQBEwIIARQBBAEdAR8BGAEFAQECAwENARcBGAEaAQACHQEXAQ0BBgEEAQIBAQENARICFAEXARgBGwEVAQkBEQEPAhACEwIUAw4BEgEcARkBFAEXARQCEAEPAQUBBgEbAR0CBgEDAQECAgEEAQ0CGQEAAhwBGAENAQoBBgEDAQEBDAEWARIBFAEWARkBGgEOAQgCEgERAhACEwMUARIBCQESARwBFgEUARcBEAELAQ0BCwEFAQ4DBAEBBAQBBgEPARkBGgEAAhcBEwEMAQYBBQECAQMBDgEVAxYBCQEIAgcBDAISARACEwISARUBDAEJAQ4BHAEaARMBDQQEAgsBCAEEAQEECgEbAQ0BGAEZARQBHwEAARgCCgEGAQUBCgEWAQ4BCQIOARIBCQEIAQcDCQEMARIBEQEJAQsBEgEJAQgBCQEIARIBGgEdARoBFAEPAQ0BAwECAgEGDQEaARQBHQEWARkBHQEAARQBCgEGAQQCBQEPAQkDEgEJAgcBBgIHAxEBDgEIAQkBFQEIAwYCEQEdARoCEwEEAQIFCgEFAQEBAgEEAQgBEgEMAQsBFgEAAgoBAwEEAQUBBAEFAQ4BCQIOARYBBwgIAQcCCQEOAQgBBwEIAgQBCgEJARECEAEKAQQCAwECAgMBCgIGAQgDEAEYAQADEwILAQUBCgEPARIBEQEOARUBDAEFAQcGCAIHAggBBwIFAQYBCAEFAQMBBQEEAQwBDQIPAQYBBAEDAwUBCgILARIBEAEbAQAEHAEXARMBDQEPAhEBEgIZAQkBCAIHBAkBDgEIAQcCCAIHAQUBAQEEAQgCAgEBAQIBBAEKAQsBCgIMAQ0DCwITARsBAAcdARsBFAEWARIDFgEbAQwBCQEIAQcECQERAQgBBwQGAQQBAQIEAQwBCgEDAQICBAEGAQoCCwEMARABHAEZARcBAAoZAhoCFQIeAR0BDgEJAgcFDgEIAQcBBAEIAQcBBgECAQEDBgELAgYBAwMGAQUBCgINARoBGwEADRsCHAEbASABHgEOAQkCBwQFAQYCBQEBAQQBAwEFAQEFAwEKAQwBBgEDAgYBBAEKBBMBABIdARUBDgEIAQcCBQEDAQYBCAEEAQIBAQICAQwBBQEBBAQBAgEGAQ0BDAEFAQQBCgEGARMCGAEbAQASGQEVAQwBCAEHAQYBBAEDAQUBEQEIAQUBAgIDAQwBBgEBBAQBBgECAQQBCgELAQYBCwEKARkBHQEeAQAUGgESAQgBBgECAQQBAwEKARUBCwEKAQYBBQILAQYBAQMCAQQBCwEDAgYBCwEKAhMBGgEdAQAVGgERAQcCBQMRARkBEwENAQsBBgEKAQwCCAEDAQICBgENAQUBBgILAQoBEAETARkBGwEAFBoBEgEJAQgBBwEGAhIBGQEWARoBFgEPAQ0DDgEHAQQDCgEZAQ0BCwEKAQ8BFgENAQ8BGgEAFB4BFgEJAQgDCQEVARkBIAEaAQ4BEQESARwBGQITAQcBBAIFAQsBEwEMARQBGQEaARIBCAEGARsBABQfARsBDgEJAhIBFgEbAQABIAEWARUBEgEZAR4CIAEUAQkBCAEHAhEBHgIdAhIBEQEIARIBHQEAFB8BHQEOAhEBGQEcAQACIAEeARkCGgEdAQACFAEJAQgCCQEWAR4BAAIfARoBFgESAR0CABUdARIBEQEVARsBHwEAAx4BFgEZAh0BAAIdARUBCQEOARIBHQEfAQACIAEdARYCHQEeAQAVHQEVARABEQEcAR4BAAMfAR0BFgIXAR8BAAEfARsBDgESAh0BIAEAAx4BFgIYAR0BHAEAFB8BFwEPARIBFgEZAR8BAAMdAR4DIAEAAhgBFQESAhwBHgEAAyABGQEWARQBFgEcAR4BABMZAR4BFAIWARgBHwEABCADAAMcARkBFAIZARsBHgEAAx0BGQEYARkBHQEeAQAUIAEdAR8CHgEfAQAKHQIUARMCGAEgAQAEHwEgAwAXIAIfAQALIAEcARgDGgEfAQAuGwEgBAAT",[[18,24,34,1],[35,42,34,0],[9,16,34,0],[26,33,34,1]]],
 mole:[40,32,0.617,"d8cabbc49689a18b76d4857f9f806f988170977c66927a68a16d5e8e75658b75638b6e5b87705e856c5a8168577d64537a5f4f725c4c7158496d5444804e46675040624b3c584335623f34543c2f4e3429413325432820352a1e331f1923120c","ABAeCBwBABwfAR4CFgETAhQBEwESAhMBGAEeARwBABgcAhcBEwEXAQ8BCAMGAwgBFgEUARYBHAEAFRwBGwEaARMBEAIOAQYBAgIDAQYCAwIKAQ8BEQEQARsBHAEAEh8BGwEYARQBEAELAQMCAQQIAQsBCAILAQgCBgEPARMBGAEAEB8BGwEYARYBEgIGAgMCAQIDAQgBBgYDAQgBDgEYARwBAA4eARsBGAEXARQBEgEQAQgBBgEDAgYBCgELAQMEBgEHAQEBAgEDAQsBEAEXAR8BAAweAhgBFgEPAQgBEwIRAQgBBgMHAQMBAQMDAQYCCgENAQsBCgENARMBGAEaAQALHgEbARgBFAELAQYBGAEOAQsBCgEIAQYBEwELAQMBAgEBAQMCEgEUAQsDCgIOARYBHwEAChsBHAEYARcBFAEQAg4CDQEKAQgBBwEPAQMBBgEDAxgBHwERAQ8BCwEKAw0BDwEcAR4BAAgbARwBFgEXAxgBFwEQAQ8BDgELAgoBCAEHAwMBDgEDARwBEgEXAQ0BCgIIAQsBDAEZAhUBGQEABR4BGQEaARYDFAEXARgBFAESAhEBDwENAQ4BDAEJAgYBDQEBAR4BIAEcAQoBCwEKAQwBBQEEBAkBGQEAAx4BEQEMAQcBFgITARQBFgEXARgCFgEbARYBDgELAQwBCQIHAQoBAwEgARQBDwEKAwQFAQIVARkBAAEYARoBDAEHARYBEwEUARYBFAEXARgBAwEBAg4BFgEOAQsBBwEJAgcDEQEGAQcBCgEIAQQIBQEVARsBHAERAQwBCgEUARMBFgEXAhQBBgECAQECAgEGARABDAEKAQcJBQEEBgkDFQEbAhEBDgEMARcBFgEPAREBGwEcARIBDQEGAQ0BFgEYAQsBCgEIAQcCCAYKAQUBBAYJAxUBHAEdAREBDwEOARgBFgEUARIBEQEXARwBHQIaAQ8BDQELAQoBCwEKAQgGCgELARUBBAgJARQBAAEdAREBDgEKARgBFwETARADEwEZARMBDAENAgoDDQEKAQgDCgMLAQwBGQEEBxkBHQEAAR8BGQETARcBGgEXARMBDgMRARABCwQPAQsCDgILAQ0CCwMNAhEBFQEMAQkEGQEbAQACHwEbAhwBGAEXARMBEAEMARECCwEKAQgBDgELARABCwENARcBDAEPAQ4BDQIPAREBDwEQAhYBGgEbARoBGwMABRwBHgEcAREBDAEFAREBGAEUAQwBCgIWARMBCgEGAhEBGAEPAQ4BEAIRARICEwMRARYBGwEcAgAGHgEfARsBEQEMAQQBBQESARQBEAEPAREBFgEOAQYBAwIIAQwBFgETARABEQITARcBGAEaARYBEQECAQMBFAEaAQAHHgEUARUBDAEKAQIBDAEYARcBEgEbARgBDgEHAQMCCAEKARoBFgETAREBFgEUARgBFAEQAQ0BAgEBAwIBAAceARgBEwERARABDQEPARYBGwERARoBGAERAQ4BBwEGAQgBAwEZARcBFAEWARgBAwEGAQEFAgEDAQ4BAAgdARQBEwESAhEBGgEgARcBHAEbARQBDwEOAQoBBgEUARgBGwEYAQEEAwIKAQMCDgEaAQAJHQEXARIBEQESARQBHQIYARsBHAEbARIBDwELAQYBFAEdARwBFAERAQYBAgEGAhACCwEYAQAKHgEdARgBFAEZARoBHQEfASAEGgEUARIBDwEHARgBHwIaARgBGgIQAQ8BFgEfAR4BAAogAhsBGgIZARsBHQIfASACHwEbARYBFAETARABGQEgAR4CHwIaARYBEQEUARgBHgEACyABGwEZAhoBHQEaARsBIAEAAh8BHQEXARQBEQEUAh8BHAEAAx0BGgEUAhkBHwEADCABHQIfASADAAQfARkBFAEHAQYBEQIdAQADIAEbARkBGgEdAR8BAA0gBQAGHQEaARECGQIfAQAEHwEdAR8CABofAh0CHwIAEQ==",[[3,11,28,0],[26,31,28,0],[14,22,28,1]]],
 snail:[44,33,0.671,"f1d58fefc067efb751e1b368edaf44d3a56ed69e52c6945bcd9447c88d43bf8849b28557b77a3aad7a47a673419e6a3b92603b975c318955326b5d5967554d7f4c2d6e41265c4637643a21573422542c1d4a35293a292146261b372119261512","ABEdAR8CAAogBAAaGgEbAx4BAAgfAR0BHAEVARgBHQEABCABABMfARsBGAEPAREBGQEfASABAAUcASABFQEYARwBGAIcAgABHQEYASABABIcARoBHAQfAgAEHwEcARUBDwEdAh8BDAEcAh8CGAEgAR8BABEZARoBGQEYAhoBHAEaARwBAAIdAR8BFAEYAR0BHAEdAgwBGAEcASABGAEVAhwBIAEADhoBFwISARABBwISARYBFwIZARwDHQEcARgBFQMUARUBHAEdAR8BHAIYARwBHwEADBcCDQEHAQMBAgEDAgIBBAEBAQ0BEgEYARwBGAEcAhgBFAEMAQgBDAEUAhUBGAIcAR8BGAEgAQALFwESAQQCAgYBAwgBFwEdARgCFQYUAhwBGAMgARwBIAEAChkBEAEGAQQBAQICAQMDAQQEAhwBGAEcARgBFQEUARUBFAQcAh0CIAMAChcBDwEEAQEEBQIDAgIBAQMEARoBGAEdARgBFAERAQEBFQEUAxwBEQEXARwBIAIAChcBEgELAQIBAQICAgUCAwQBAgIBGgEYARwBGAEUAQ4BAQERARQDHQEMARIBAA0ZARIBCQECAQECBQQDBQEBBAEZARgBHAEVARQBDgEBARABFAEVAh0BDAESAQANFwESAQoBAgIBAQUEAwUCAQQBGQEYARwBFQEUAQ4BAQEPARUDHQEMARIBAAwcARYBEgELAQIBAwECAQUCCgEDAQcCBQEDAgEBBAEZARgBHAEYARQBEQEEARYBFQIYAR8BDAESAQAKGwMaARYBCwEHAgMBBQgDAQoCGQEfARwCFwEWARICEwIRAxoCAAcbAhMBEgELARMCDQEJAQQBAwEFCAMBCgIeAR8BGwEQAQEGBAEGAQgBEQEeARwBAAUaAhkBEAEEAQEBCAENAQ8BCgEHAQMBBwEFBgcBCQENAhABFgEOAQgBBAIBAwQBBgIIAQwBEwEWAQAEGgEWAQ0BFwEQAQgBAgEBAQ0DCQEHAQMBBQQHAgUBCgENARABFgEaARABDgEIAQYBBAMIAgYDDgEWAQADGwESAQ4BCAEXARIBCQIEAQgBDwENAQsBCQEHBQkBBwEKAQsBDQESARYBGQEQAQ4BDwEOAQsBDAIGBQwBEwEbAQABGQEWAQYBBAELARcBEgENAQoBCQEKAQ0CCwEJAQcBCQUKAgsBDQESARMBGgEQAQoCCwEOAgwBBAEGBAwBEwEaAQABGwETAQgBCwIWARMBDQELAQoBCAEKAQ0CCQcKAQsCDQEQARYBGQEQAQkBCAIPAhMBAQEGBBEBFgEaAQABHwEXAhYBFwEaARMBDQILAQ0CCgENAgkFCgENAQoBDQESARcBFgEXARABCwEIAgwCBgERARYBDgEGAgwBEwEZAQACGgEcARoCHQETAQ8BDQMPARIBDQILAQkBCgQPARIBDwIXARYBFwEQAQsBCAMEAhYBFwEIAQYDEQEZAQADHAEaARcBGQEXARACDwMSARACEgENBA8BEgEPARIBFgEXAxABCAMEAgYBBAEGBRMBGgEAAxoBFgEOAQgBFgESAxABEgIaARYBEAMPAxIBEwEWARoBGQEXAg8BCAEGAQQBBggIARMBGwEAAxoBDwEBAQYBDwEWARcDGQEaAR4BGwEaARkCFwIZARoDFwEZARcBGgEQAQgBBgkIAQwBFgEbAQADGgETAQ8BEgEPAQ4BCwEIBAsBCgISBQ8CEAEPAhIBGQEWAQ4BBggIAQwCFgEeAQADGgERAQ8BEAIPAQgFCgMJAggCCwEOAgsBDgEQARIBFwEZARMBDAEIAQYFDAEPAhgBHgEABBgBEgEQAQ4BDwESAQ8BDgELAQgCCQIIAQsDDgEMAQsBEAEPARABEgIRARkBGAIMAggEDgEPAREBGgEfAQADGwEXAREBDwERAhABEwEWAQ8CDgIQAQ8BDAESAQ8BDgEQARIBEwISARMBFgIaARkBEwEWAg8BEAEPARABEQEXAh4BAAQfARsBEwEPARECEwEWBBEFEgERARMBEgERARMDFgIZARsBHgEbARYBGAQXAR4BHwEbAQAGHgEaBxsFGgYbBRoBGwMeBx8BAAkeAR8JHgQbAR4DHwogBgAH"],
 rockcrab:[47,32,0.681,"bdac9aa99682a18d78998470907b688873618267557963527457486b56466b4f41634f40634a3b5d4437564436553d314d3b2e4a35293f3828482f273d2f233f29213b2a20342b1f36251e2a2117331f19291a132615111f170f1c0e0a120606","ABIdAR8BAAccAR0BEwEAIR8BGQEUAhcBAAURARkBFgITAQAfGgEbARIBCwEJARIBFwEAAxoBFAEOAQkBCwEQARcBABQYASABHwEVAQAGGAESAQ0BCAEBAQgBGQEfAQACHQEOAQkBAQINARABFQEABSADHgEACRoBFQEbARYBEQETAQAEGgEXAQ8BDAEOARQBDgIZAQACFQELAQkBCgELAQkBDgEZAQADHQETARIDFQEYAgAFHQEcARYBDwENAQkBDQEXARgCAAIcARcBDwENAQ8BEgERAQ0BFAEAAhUBCQELAQ0BEAEJAQ0BGQEAAhUBFgEQAQ0BCwEOAQ8BFgIbAQADFQEZARYBDwEMAQMCCQENAREBGAEaAQABHgEYAQ8BEAEFAQcBFgIaAQACGwESAQ8BDAERAQsBDQEYAQABGgEXAQ0BBwEBAQUBAgEOAQ8BFgEbAQADHgEbARABDAEKAQYBCQEBAQkBEAEVARkBAAIaARIBFAEEAQEBFQEbAQAEGgEMAQIBDwENAREBAAITAQ4BCwEHAQIBCQEHAQkBDQEQARkBIAEAAR4BGQEWARABDQEMAQkCCAEKAQ0BDwEaAQACHgEdARkBBQEKARUBDwEcAR8CIAEcARoBAQEIAR4BHwEAAR4BGAELAQkCCAIHAQsBDgEQAhcBGAEgARsBFgEQAQ0CDAILAgwBEAEdAQADGgEbAQsBBwEdARwBGgEbARoBHAEeARkBAwEJAR4BAAIcARUBDQELAQkBCwESAQ0BDwMQARkBIAIaARcBFAEPAREBFwEZARQBDQIRARwBAAIYARkCCgEIARsBEQEPAxABEgEVAQYBEgEeAgABHgEXAQ0BCwEJARIBHAEPARECEAIZASACHAELAQQBAgERARoBHAEDAQgBEQEWARkBEQEYARUBEAEUARIBCwEOAQ8BDQUSARQCGAEeARwBGgEbAQ8BDQEKARkBDAEHAgEBCgEUARsBIAEbAREBAwECAQMBAQECAQoBCAEEAQ0BGQEXAREBGQEOAQ0BCwIJAQcCCAEFAQQBBwEJAQsBDgERARIBEAEVASABHgESAQ8BCQEPAQIBAQICAQMBBgESARoBAAEUAQUBAQQFAQ8BCwEGAR0BHAEbARIBDgENAgsBCQEHAQQBCQEGAQUBCAEJAQsBDQEOARABEQEUARUBHwEWAR8BDwEBBQMBBwEfAQACEwEPAQUBAQMFAQ8BEgEZAQsBGwEUARABDgENAQ8BFwEOAQkBBwEJAQoBCwQYAR8BGQEQAhIBGwEeARoBEQEEAQEDAgEKAREBAAQTAREBCAEDAQIBBAEMARUBFAEcAREBDQELAREBFgEXAQYBEQEXAQ0BDAENBA4BGgIBAREBCwEIAQ4BGQEVAQoBDwEFAQQBBgEPAgAHDQEgAR4BGQIXAR8BEAIRARABDgEPAQkBAQIGAQwBCgIMAQ0CDwEHAggBFAEBAgcBDgEbARwBEQETARIBDwEADRoBHgEdARABBQEBAQYBCQEHAQIBBQECBQMECgETAQcCCgEBAQUBCAEXAR0BDgEPAQAOEQEcAR4BHAEIAQcBAgEBAQIBAwISAQMBAgYDAQIBDwERAQUCBgEBAQIBBwEXARwBEwIaAQALFAIHAQoBEgEZAQ0BCQEFAQICAwIFAQMCBAIFAQYDBAMFAwQBCAEKARkBFAEQAQkBEQETAQAJFAEOAQgBBwEEAQgBGwESAQcBBAIFAQQCBQEcAh4CHwEgAwoBDQEEAgUDCQEPAR8BBwEFAgMBCQEbARMBAAYXAQ4BBwEJARABEgEXAg8BCAEFAgYBCAENARcBFQEPAQQBBQEGAwUBHQEeAQoBCAEEAQUBBwEMARUBIAEdARsBEwERAQUBBwEcAQAFEwEUAQ4CEQEPAQgBBQEQAgkBBgIFAQgBHgEdAQQCAwECBQoBEwEeARMBBQEGAQwBEAEZARgBFAEXARMCDAEKARIBEwEAAxwBGQEQAREBFQIPAQUBAwEPARUBFgEKAQgBBgEIAQ8BCQEFAQQCAwQCAQMCGQEKAQYBCQEQAR8BEwEFAQMBBwEPARMBGAEJAQYBHAEfAQACGAESAQ8BEQEYARMBDwETARgCGQEaARUBCQEHARoBHgEKAQcBBQEEAgMEBQEGARABGQEEAQ0BGwEgARgBEwEIAgwBEwEVAQECFgEaAQACHQEJAQEBCAEPAhgCFQEKAQEBGAEdAR8CGwEdAQwBDwEIAQUBBgIFAgYBDAEeARkBHQIQAQkBEgETARgBHwEdAQgBDwETAQkBBwEWASABAAIeARABDQEUARcBGAEaAgoBBgENAR0CFQEFAQgBIAEfAQ8BEAEPBBABEgIdAQ4BGQIOAQUBBwEeAQACIAEJARIBFQERARsBHAEABBgBGQESAR4BAAIcAQ0BCwEaAR4BHQELAQMBCwEdAhsBHAEbAhwDHQEgARwBCQELARcBFAERAQsBDwEYAQACGQEbARQBGwEdAQAGIAEeAQADGwEHARoBAAIcAQkBCwEPARMBGQEfAR4BHQIeAR8BHQEAAh4BCQIVARkCFAELARQBAAQVASABAAwgAR0BAAMdARABFAEZARoBAAsWAQ4BCgEYAQABGQEdASABABccAQsBDgEdAQAMGgENAQ8BGQEAAiABABgeAR8CAA4gAR8BAA8=",[[2,5,27,0],[39,43,27,1],[8,10,27,1],[33,36,28,0],[13,17,28,0],[28,32,28,1]]],
 crystalbat:[42,34,0.578,"dee1e7c3c0c9bea4a4958eb08c7092b767377b62976f5b89676c94705586684f7866486f524d747f464c5d40655a466750415a513b5b6132394b2e4c4a3553402d443d3544332c303f293e3b233630202b281a2125131b1f0c17160e100e0608","ABQNAgAnEQEEAQkBFQEACx4BHAEAGA0BBAEBAgkBDQEACBwBGgELARkBHAEAFhcBCgEEAQECCQEVAQAHHAEXARQBCAEPARYBGAEAERsBHAIXAgkBBAEBAgQCFwEYARwCAAIcAhABCwEHAQgBCwEZARwBAA8XBgkBAgEBAgQBCQEYARcBGAIXAhsBGQEHAQQBCAILARABGwEcAQAOGAENAQkBDQEXAgkBAQMEAQkBFwEVAQQBFwERARgBFgEIAQUBAwEIAQoDFQEYAQANHQERAQoBAgIXAgkBAQICAQQBCgIJAQEBCAEXARwBFgEIAQQBCgEFAgoCCwEcAQANHgENAQoBAgIJARcBCQECAwQBCgEEAQICCQEXARwBFQEKAQsBBQEIAQcBCwEKAQwBGQEXAQAMFwEQAQoBCQEEAhcBCQEEAQECBAENAQECBAEJARkBGwESAQwCBwEKAQgBCgEMAhEBGwEdAQALGAEVAQ0BCQEEAQIBFwEaARUBAgEBAREBFAECAQEBBAENARsBGgEQAQwCCwEKAQgBCwEQAQwBDwERAR0BAAwXAQ0BBAEQAQkBHgEdARYBAgEBAREBEgEBAQIBFQERARsBFAEPARABDAILAQoBCwEPAQ0BEgEWAR4BAAUeAR8BGAEABBgBFwERARwBBQEQAQsBDAENAQgDCgEIARABHAEdARUBDwIMAQ4CEwEUARYBFQEdAR4BAAMfARwBGgESAREBFwEcAQADHAEdAhUBEgELAQoCCAEHAwUBBwEQAhoBFAEPAhMBBgIOARQBGwEZAR4BAAMbARwBGwEZARUBEQEKAQsBGAEAAh4BGwEUARABCwEKAQgCBwQFAQcBCgEMAhkCEwIGAQMBDgETARwCHgEAAh4BGQESAw8BEQEZAREBCAEYAR8BHAEUAQ8BDAELAQgCBwQIAQcCCgELAQwBFQEdAQYEDgETAR0BIAIAAh4BGwEZARIEFQEUAQsBCAEYARkBFQEPAQwBCgEIAQcBCwEIAwoBBwIKAQsBDAEOARMBBgEDAgYCEwEbAR8BAAQfARsBFQESBBQBFgERARsBFAESARABDAELAQgBEgEbAgoCBwEBAQMBCwEMAgYDAwIGARMBHAEbASABAAUcARQBFQESAxUBFgEbAhUBEgEPAQwBCwEfASABAgEMARkBCgEIAQEBAgEMAg8BAwEGARMBBgITAh0BAAcdARUBFAEVAQ8BFgEZARUBGQEcARUBDwIMAhkBHAIgAhkBCwECAQEBCAEMAQ8BBQEUARsBEwIbAR0BGwEABx8BHQEaAQ8BEgEVAxQBHQEUARUCDwIUAQMBHwMRAQsBBQEBAQIBAwEFARUBGQEgAR8BHAEfAgAJHwEZARQBGgEZARQBFQEUAR4BGwEaARYBEgEPARIBAwEaARkBFAEPARoBBQEDBBABGwEYAR8BIAEACyABGwEZAhsBFgEUAh0BIAEcARoBFAEVAQ8CCwEMAQsBDwEFAQICAwMTARQBFgEfAQANHAEeAR0BGwEZARsBHgEfASABHgEbARoBFAIVAQ8CDAEKAQMBAgIKAQ4CEwEFAQ4BHQEAEB4CHwIgAhEBGQEbARoBFgEUAhUBFAEFAQMFCgEOAhMBHQEAESABAAMfARsBFgEUARoBGwIaAgwBAwMEAgMBBQEOARMBGgEAFxwBGgEWARkBHAEbARwBFAEPAQgBBQEHAgUBCwEPARkBHgEAGRwBHQIaARMBGQETAQ8DFQEaARcBGAEZARsBABocAhMCHQIeAh0CHAEUAR8BGwEAHR8BEwEOAh8BIAMfAR0BEwEgAQAfFAETAh0BAAIgAR4BGwEaAR8BAB8dAQYCEwEAAxwBEwEGARMBHgEAHxMBDgETAQAEHQETARsBHwEAICABAAYgAgAP"],
 stonebeetle:[41,34,0.627,"a6998e8975677b6455715f537057486653486a4e3f604c406347365c483c5e4231594135544235523e32513a2d493b304d352846362a3a3225462f233a2b223c291f3623192c2018331d162b1913241b1422161221120f180f0c110906090202","AAseAhsBAAgTARkBABceAQADHAEWAQcBGAEeAQAGHwEZAQ8BGAEbAQAUGAEZARoBGQIXARUBAwEIARYBGAEZARwBAAMYARcBFgERARwBHwEAEhUBGQEPAQsCDwEUAQoCFAIPAQcBCwEXARoBHAEWAQUBBwEUARcBFgEAEhYBCwEJAgcBDwESAQEBEwELAQkECwEaARwBFAEDAREBFAERAR8BIAEAAxoBAAweAREBCwEJAgcBDwEVAQYBFAELAQkECwEYAQ4CCwEUARYBDwEfAQAECwEUAQALHAERAQsDDAERAQ4BAwETAQsBCQQLARUBAwERARkBFAMfAQAEAgEJARUBAAoZARQBCwMMARQBDwENARcBCwIOAREBFAEZARgBBQEUARYBEQEWAR4CAAQNAQEBEgEAChkBFAEPAQwCDQERAQ4BEAEWARoBHAEYAxwBFAEHAREBGgEYARoBHAEYAQAECgEJARIBGAEAChoCFQEOAQ0BDwERAR4BGQEWARQBDwINARUBGwELAQcBGgEcAx0BFgEYARYBHAEQAQcBGwETAgAJEQEWAQ0BEQEMAREBGQEfARIBDwENAQoBCAEOARQBEgEVAQkCBAEHARQBFgEeARwBFgEPARUBEgEWARwBEwEQAQoBEwEABhcBFgERARYBFAEaARcBEgEPAQwBCAIKARABEgEYARUBDgEHAQICBwERARwBGAEPAQ4BDAEIAQUBEAEYARUBDQESAQAGHAEZAQ8BFgEcARcBDwEOAQ0BCAEGAQQBDgIYARQBDQEHAgIBAQEDARYBFAEPAQwBCgEHAQQBBQEIAQoBEwEYAgAEGwETARgBGwEWARoBGQEUAQ4BDAEKAQgBBAEGAQ0BFAEXAQ4BBwEFAgcCFgEbARIBDAEIAQIBBAECAQMBBAEKAQwBHQEWAQADGAEaARgBBQEEAR4CDwEOAQ0BDAIIAgoBDQEXARABDQEFAgcBCgEMARICDQEKAhUBAQIDAQQBBgESAQEBEAEAAh0BGgEGAQQBBwERARcBFgEKAQEBCAEOAQoBCAEGAQgBEgEaARABBQEBAgYBBwEYAR4BEgEOAhIBEAETARYBAgIIARUBGwEYARYBAAEfAQwBFgEaARQBFgEdARQBBgEEAQ0BCAEKAQYBCAEMARoBDAIDAQEDAwESAR4BEAENARIBFQEIAQQCGQERAQ4BEAEEARABIAEAAR4BHAERAQ8BEQEXARkBEAEGAQgCBAEBAxUBGwEGAgQBAgIFAQMBDAEXAQ4BDAEIAQYBBQEEAQoCAwMGAQ8BEwEbAQABGAEWARQBFgEZARIBDAEKAQ0BCAEFAQIBAwEEARYBHAEKAQcBBQEDAQYBBQEDAQUBFAENAQoBCAEGAQUCBwEIAQUBAwIHAQ4CIAEAASABHAEUARYBHAEPAQkBCwIMAQcCBgIYAR0BDAEIAQYBCgEIARMBAgEFARgBFAEKAQgBBgIHAQgCBgEEARIBFwEOAh8BAAIeARwBFwEeARQBDQEFAhEBDAEIAQYCHgIOAQoBBgEEAQIBFAECAQEBEAEVAQ4BDAEKAh0BDQEIAQYBEwEbAR0BFAESAR8BAAMgAh8BFAEPAQcBCwERAQ8BCQEFAQIBDQEaAQ8BCAEDAQECBwEMAQIBAwEIARcBDgEMAQoBEgEXARQBEQEOAREBGQEVAR4BAAcYARIBCgEIAQoBFwEGAgEBBAEcAREBCgEBBAIBCQEGAhUBGAESARABFAEZAQ4BAgENAREBFwEYAR8BAAcfARYBCAEGAh0BBAEBAgQBHAEUAREBAgIBAwQBBgINAQoBHgEaARgBFQEEAQMBCgEaAR0BHwEACB4BFAEIAQQCDgEMAQIBAQIQARkBFAEXAQIBAQMEAQYCEAEaAR8BIAUfAwAJEAEKAQYBAgEDARYBDgECAQECAgEbARYCEAEBAwICBAESARgBHwEdAR8BAAMfAQAKHwEYAQoBAwMdARgBEwEGAQQBAwEYARoBFgEXAQgBAwEGAQgBDQEUARgBHAEVARkBGgEADiABHgEMAQQBEgEaARwBGAIaARgBGwEUAQoBFAEaARIBDwEQARIBGAEeAR0BEgENASABABAeAQ0BCgETAR4CHAEeAR8BHgEcAQ4BBQEYAR8BHAEXARwBHQEfAR4BGAEQAiABABAQARMBEgETAR4BHwEABBgBDwEOARwBIAIfAR4BAAMcARYBEAEeARwBAA8fARoBEAEUAR0BHgEAAx4BGAEPARcBGwEAAh8BGwIAAh8BHAETARUBHwEADx8BHAEMARIBFAEaAQADHgEYAQMBBAEbAQADHgEfAQACIAEWARABEgEfAQAQHwEgAwAFGAEWAh0BAAgcAR8BIAEeAQAaGAEcAR8BAAkgAgAK",[[20,24,29,1],[6,11,29,0],[15,19,29,1],[27,31,29,0]]],
 oregolem:[46,46,0.837,"d8dde1aaa6b79d93a58f899b8c8297877d9383778d7d758c7c6f88756d8475697f72667b6f61776d5d70675c6e64586a6255655f515f5b4e5b5a4a585449555343504d3e49483a4446363e4233393c2b3235282b3120252a1e2124171a17090e","ABAcAR0BHgEXARsCHQEeBB8CIAEfAQAdHAEXAQ4BCQEDAQsBEwEUAhoBGQEaAhsBHAMeAgAaGQEVAQsBCgEFAQECAwEEAQcBEwEUAxYBFwMZARgBGgEAGB4BGwEQAQoBCQEEAQECAgEDAgICBQEGAgcBBgIEAQIBFAEaAQAXHgEaAQ4BDAEJAQMBAgEDBgUBBgEHAgYBCAEJAQQBEgEbAQAXHQEZAQ0BCQEIAQECBAcGAQgBAQIJAQgBDAEUARsBABceARkBCwEJAQIBAQMDAQUBBAQGAQIBAQICAQgBDgEWARwBABceARkBDAEEAQIBAQMCAQUCBgEEAgUBAQQIAQsBFgEcAQAXEgECAQEBAwIBAwIBBAEFAQICBAICAQECAgEFAQYBEgEcAQAYEAECAQQCAgMDAQQBBQEBAgQCCQEBAgMBCAEGARIBHAEAFB0CHwEeARcBDAIIAQQBAQEFAQYBBAEHAQECBAEGAQgBAwEEAQYBCAELARIBGwEAExwBFwESARwCHQEUAREBDQEOAQgBCQIEAQIBAQIGAQgCBwEGAgcBDAEVARsBHgIfAQAPHwEPAQsBBgEFAQ0BEgEcARUBEQESAgsBDwECAgkBBAECAQYBCgEIAgcBCAEMARIBGwEaARkBGwEeASABAAkZARcBGAEaAR4BFwEQAQQBBQEHAQkBFAEZARYBFwEWARMBDAEKAQsBCAIEAhMBCwEIAgkBFAEaAQ4BCQEHAQ4BFQEfAQAIGgESAQwBDQEPARABFgEXARYBDwEOAhgBHgEaARkCFwETAQ8CDAQNAREBEAIRARkBFwENAQwCFAEcAR8BAAcWAQ0BBQEDAwcBEAERARgBFAERAQ4BDAEPARIBDgESARQBFgEXARkBGgEZARYBFAIWARcCFgERAQ4BEgEWAR4BGgEcAhoBFgIaAQACGwEUAQUBBAECBQQBDAEaARYBEQENAQwBDgEPAQgBBgEEAQMBAgEDAQIBEgIWARcBGAEZARYBDgEWARoBHQEaARQBDwEMAQoBCQIXARsBAAEaARQBBgIFAgYBAwEFAQwBDgEcARcBEwEPAhABDwELAQcBBgEFAQQBAgQHAQkBCwENAQ4BEQEVARwBGgENAQwBAgEDBAcBEgEdARsBFAEHAgYBBQIDAQYBCgEMARcBGAEUAQ8CFQEXAREBCAIHAQYCBQEBAQQBBwIKAQ0BDgEQARYBGwEXAQ8BEAEBAQcBCAEJAxABHQEaARYBCQEHAQYCBQEDAQYBCgENARYBGQEUAQ8BDgEbAR8BFwENAQkBCAEGAQUCAwEGAQwBFwEZARMBCwEQARUBGgEUAQ0BDAEDAQYBCAEHAQkBDAESAR0BGgEWAQcBCwEGAgQBAwEHAQwBDQEWARkBFAEPAQ4BEgEdAQIBGgEWAQcBBgEFAwYBFwEfAQwBHwEMARABEwEaARIBCwEKAggDCwENAREBHAEaARQBDgIJAQQCAgEJAQwBDQEXARkBEwENAQkBBwMFAQwBEgEOARABEQESARgBHgECAQEBCwEJAQ0BEgEaAREBCwEKAQwCCgEJAQwCEQEcARoBFAEMAQsBDQEGAgQBDAEPARMBHAEXARIBDAEEAQsBBwIGARcBGAEJAQ4BEwEXARMBGwEBAQIBBAEJAQ0BEwEaARIBDAELAQ0BDwEKAQkBDAELARABHAEaARYBDAEJAQ0BEQEOAQYBDwEQAREBGwEXAREBDAEcARoBBQEHAQkBBQEGAQkBCAEGAgkBBwEDAQQBBgEKAQ4BFAEbARUBDQEMAQYBCgIJAQwBCgEQARsBGQEWAQwBCwEOAQ0BDgELAQ0BEQIbARcBEQEMARoBBAEWAQgBCQIIAQkBBgEHAggBBwEFAQQBBgEMAQ8BFAEcARYBDwEQAQQBCQEKAQgBDgESARQBHAEZARcBEAMRARACGQETAhoBGAERAQwBCwETAQsBCAEJAgcCBgIEAQkBCAEGAwoBEAEWARwBFwEQARMBDAERAQwBCwEWAhcBHQEeARsBGQEbARoBFgETAQ0BDAEQAREBHQEaARIBDgEMAQkEDwEWAhMBDgEaAQwBCQEIAgsBEAESARgBHQEcARkBGAEaAQwBCQEGAQcBGgEbAR4BHwEZAQwBCQEHARYBEQEEAQcBEAELAQ8BGAEXAQ8BDAELAQkCBwEUARcBGAEbAhgBGgEKAw4BEAEYAR0BGQETAQ4BBQEJAQoBDAELAQMBCgESAR4BHQENAQkCBwEOAQUBBAEJARcBEwEQARwBFwESAQ8BDAELAQkBCgERAQ0BBAEFAgkBFgENAQwBDQERARUBGAEdARYBEwESARoBDQELAQwBCwEKAQwBEAEeAg0BCQINAQ8BCQEEAQkBGgEfARcBHgEdARwBGwEaARcBGgIYAQQBAgIDAREBFAEXARgEGwEcARcBEgENARsBDgEMAQ0DDwEVAR8CFAENAQsBDQEKAQYBCQENARMBGwEYAR0BHgEaARkBGAEcAR4BGwEYARABAQECAREBFwEZAR4BHwEeAx8BHQEXAhYBGwEXAQwCDwESAhkBHwEAAR8BGQEOAQ8BCQEMARQBDwETARoBIAEcARcBEgEPAQ4BDwEMAQIDAQECAQEBAgEEARMBFwETARUBGAIeARsBGgMXARIBDAETARYBGAEfAQADGwIYARMBEgEaARgCGwEaAhsBFgEUAREBDwEOAQkBBgEEAQECBQEJAQwBEQEXARUBGAEaARsBIAIcARsBGQEXAhkBGgEfAgAGHAEaAR8DHQEXARABCQITAR8BEgEQAQ4BCgEHAQYBAgEDAQUBBgENARIBGwIdARwCGwIeAR8CHgEfAyABAAofARsBEgETAQsBBwEJAQYBEgEYARIBDwENAQoBCQEDAQUBCQEMAQ8BFQEcAR4BGAEUARMBFQEYARwBIAEAEB8BFwESAQgBBAMFARIBFgEeARcBDwIMAQQBDgESAhkBHgEbARoBFAEOAQ8BEAEXARkBHwEAEB4BFgESAQUFFAEVARkBHAEdAR4FHQIbARgBFAEFAQIBCgEMAQ8BFQEZAR8BAA8dARUBEwEMAQgBBgMSARUBGAEdAR8BIAYfARgBFgEQAQQCBgEMAQ0BFgEYASABAA8cARUBFAEQAREBEAEFAQYBEgEUARgBGgEfASABAAQgAR4BFwEUAQ4BBQEJAQcBDwENARcCIAEADxwBFQITARABEQEQARcBFgEVAhcBHgEgAQAEIAEdARYBEwIXARQBDAEaARgCFwEgAQAOHgEbARYBGQEcARoBFwESARsCFQEWAh0BIAEABCABHQEXARoBFgEXAxUBFgEaAR4BHwEADh8BGgEWARQBEwEMAg8BGgEcARYDHQEgAQAEIAEdARYDGQEXAgwBDgEPARkBHQEADiABFwESAhABAgEJAQsBDQEcARgBFwIfASABAAQgAR0BFgIXAQ0BBAEDAgkBDwEQAR4BIAEADR8BGgEXAQ4BDAEEAQkBDAEOARYBGgEZAR8CAAYeAR8BGAEWAQYBBwEGAQQBBgEMARQBHAEfAQAOHwEdARMBEgITARQBFQIdAR8BIAEACCABHAEZARECEAMSARoBGwEAER4BHQEeAx8BHgEgAgAKIAEfAR4DHQIcASABAAk=",[[6,20,38,0],[25,38,38,1]]],
 goat:[42,38,0.717,"f7f0dcf1e7d1eedfc7e0d2bad1bfa5c2ac92b3967da7947da0836b90745e85664f755f4c7156446d513f6752425d4d3d6346365845364e4332593b2c4938284930243c30243b281e35201a2a2119261b122415111b0f0c120d090c0202","ABsVARkBAAYNARYBAB4cARcBEgEHAQsBAAQWAQkBDQEQAQAcHQEXARYBCAEEAQkBEgETARUBEAEMAQQBBgESAQAbGgEbARkBFgEDAQYCFwEaARcBEgEHAQEBCAELAQAYHwEeAR0BGAEVARcBFQEGAQoBDgEJAQgBCgEMAQsBBwEKARIBABceARsBGAEcARUBEgEZAhYBGAEWAQgBAgIFAQkBEQEWARoBABYfAR0BFAERAxQBGQEXARMBEQMFAQECAwEJAREBGwEaAQAVHwEdARECFAEZARQBEQEVAQ0DDgEJAQMBAQIEAQsBFgEZARoBABUbARkBFAERAhMBEgEPAQ0FCgEBAgIBCQERARUBGgEZAQAVHgEcARkBFQEWAQ0BDwIMAQsBDAEPAgYBAQEDAQkBCgEbARUBFwEbAQATGgEQAR0BFwEUARIBDwIOARcBGgESARACBwEBAQMBCgEXARoCGwEdAQAOHwIdAR4CGwIdARYBEwESARABDwETARcBBgEaAhgBCQEBAQMBCgEZARUBHAEdAQAEFgEABx8CGwEYARcDGAIeARwBFgETARIBEAERAQkBCgEIAR4CGgEIAQECBQEQAQoBEgEAAxcBDQIWARcBAAQdARwBFwIVARACEwMdARwBGAEWARICCwEEAQYBHAEdARUBBAEDAQEBBAEFAQQBCAETAQACFwEVAQcBCQEUARMBFQEAAhsCEwESARADDwESAhMBGwEXAQkBBgELAQYBAwIFARABGwEMAQEBAwEJAQoBCwEKARQBEwEVAQABFQEKAQQCFgERARMCGAIUARIBDwUQARICGAILAQMCAgEDAwUCAQEJAQcBCQIKARYBFAEYAh0BEgEGAQcBBQEKAREBEgEVARoBEgEUAREBDwENAwoBDwEQAhUBGQEIAQQBAwECAQMDAgEBAQQBDAEJBAsBHQENAh0BDQEFAwYBFgEZARoBGAEPAhEBDwENAQ8DDQEPAhABEgEWAQkBBQEDBAIBAQEJAQsBCgEJBAsBCgEOAR4BEwENAQsBCQEHAgkBHAERAQ0BDAELARABEQEPAxABDwIMAQgBDgESAQgBBgEFAQQBAwMJAREBDgEMAQoCCwEMAQ0BFQEaAQABFQELAQkDGAETAQ4BDQILARMBDwMQBAwBAQEDAQcBEQENAQkBBQEEAQUCCgEUAQwBCwEOAREBFAEOARUBHQEAAxkBDgELAQ0BGAESAQ4BDQIOAQ8BEAQSARACBQEBAQIBBAEJARoBEAEMAQgBBQEGAg4BFAESAREBDgERARwCAAUVAR0CGwERAQ4BDQIOARABEgYLAQIBAQMKARABFwIPAQsCDAEOAREBHwEdAhsBHgEACRsBDgINAQsBDgESARMEEgICAQEEBwESARMBBwEKAQ0BEAESARQBHAEfAQANGAEOAgsBBQEMAQoBFgEVAQoCFgEIAQEFAgEJARMBEAEFAQoBDwEQARIBGQEcAQANGQERAQ4BCwEFAQMBBQEGAQoBBQECAQQBAQEDAQEGCgEcARABCwEMARIBFwEPAR4BAA0eARgBFAEKAQUBAgEGAREBBQEDAQICAwEGAQQBAQMDAQUBBwEIARcBGAETAhUBHAEADh0BGAENAQYBAgIGAQwBCAEHAQYBBQIKAQYBAQICAQQBCQEHAQYBEQEVARoBEwEZARsBAA4bARYBBAEDAQIBAwEKARkBGAEKAQkBBwIMAQcBAgIDAQYBDQEKAwwBEgIZARwBAA4UAQkBBQEEAgkBEgETARQCDAEKAQkBCwEJAQMCBAEFAQ0BCgIMARYBEQEJARIBHQEADRcBDAEKAQUCBgEXARgBGgEUAREBEgEcARkBGAEMAQcBBgEDAQQBHQEcARsBEwEMAQoBBwETAR8BAA0aAREBCgEIAREBGAEaAQABHQEVAREBFwEfAQACDAEJAQYBAQEEAR0BHgEdARoBCwEJAQcBGQEfAQANHQEbAQsBCQERARoBAAIeARgBFgEbAR0BAAIdAQoBBgEJAQsBHQEAAh0BEAELAQYBHAEfAQANHwEdAQwBDQEVARkBAAIfAR0BGAEWARsBHgEAAR4BCgEJAQsBEQEdAQACGwESAhQBGQEaAQANHwEdARYBEgEUARgBGwEAAh4BHQMfAQABGwEYARQBEQESARsBHgEAAR4BHQEWAQ4BFAEbAR0BAA0cARgBFgIZARwBAAMfAwACGwEYARECFAEWARwBAAIeARkBFgEYARsBHQEADh0BHAEdAgAKGwEZAQ0BEgETAR0BHwEAAh4BHwIdAQAeGwEZAhsBHAEAJR8BHgIfAQAQ",[[13,18,30,1],[5,11,30,0],[28,34,30,0],[20,27,30,1]]],
 sandlizard:[40,25,0.553,"e5ca98deb678d7a65ec5a471c1935ab88248a98258a8734298744fa2693f8e6845955736855c3a7a5639765034684b31734a2f6c3f28613e2758422c5635214e37244c3924492e1e3c2b1e40271836201533291b2d22152b180f221910180a07","ABgfASAGHQEAHiABHQEYAxYDGQEcAR8BABEdASACHgEABx8BFgITARABDwERAQ8BEwEVARgCGQEADx8BHgETAREBGgEfAQAFFwEYARMBEQEOAQ0BCwEEAQYBCAETAhEBFQEaAQAKHgEbAxYBFQEPAQsBGQEfAQABHwEgAQABHQEfARMBEQEOAQ0BCwIIAgoBDQIOAQ8BEwEfAQAIGAITAhoBHAERAQkBFwIZAR0BHgEdAR4BHwEeARMBEAEPAQsBCQELARMCCgMLAQ4BEwEWAR0BAAYaARYBEAEXARYBGAEUAQ4BBwEcARQBFwEfARkBFQEQARQBGgETARABEwELAQkBHgEgAQcCCAEKAQsBDwERARMBHwEdAQAEIAEYARABDwEJARQBGQEVARABCQEcARgBIAEWARUBDQIYAhMBEQEFAQQBCAEEAR4BGQEcAQkBDAENAQ8BEQIVARYBFwEAAyABGAEQAQ8BCwEUARwBFgEQAQsBHQEbARUBEAELAQkBDQEVARYBEwEaAQgBAgEFAQEBFAEdAR8BCQEIAQwBDQIMAQcBBAESARwBAAIeARgBFAQcARYCEAEYAR0BFgEPAREBDgIRARYBEQENAQMCAgEDARgBGQEFAQIBBAEGAgoCDAMdAQACHgEaARYCFAIXAR8BFgIaAhEBDwEOAQ0CCwETAQYBAwEGAQMDAgMBAwwBBgMIAQwBHgEAAiABHgEbARcBGAEXARQBHAEeAhoBEQENAQ4BDQIIAQIBAwEKAhoBBgEDAwICBwEUARUCEgUZAQACHQEgARQCGQEcARgBGgEgARsBGAETAQsBCgENAQsBBwEKAQIBDAEKAQgBBQEDAwIDBAICAQ0BEwESARsBHQEAAxcBDwETAxYBGgIYARsBGAEPAQ0BBQEDAgIBAQIEARgBCgEFAgQCAgIEAQUBBwEGAQgBCgEMARYBAAQgAQsBBgENAQwBEwEYARMBEAEYARYBCQEMAQMCBgEKAQQBAQECAQkCCwIJAgcCCAEHAQgBDAEOARgBGQEABRsBCAEGAQEBAgENARUBDQELARUBEQEIAQYBDAEGAQQBEQEEAQcBAQMJAgsBDQIOARABFAIaASABAAUgAR4CFQEBAQYBCgEIAgUBBgENAREBCAEGARIBAQIEAQkBCwEBBAcBCwEPARkBHwEACiABGwEdARsBFQEFAQwBCgEBAwgBDQEOAQoBCwEEAxABDgEEAQECBAEHARABGAEcAQALIAEaARMBFgEdAQ4BDQEHAQECBQECAQUBDgETARABDQEEAQ8BGgETAQkDCwEOARsBHQEADRsCGAEdARwBGQEFAQEBBQETAQoBDQELAhQBDQEEAQ0BGgEbAR0BGQEaARYBDQEWARwBAA4fAQADFwEEAQICFQEaARsBHgMKAQYBDwEdAR8BAAIdARMBDQERARoBHQEAERMBBgEKAQcBGgEeAR8CFgEbAQ8BEwEVARsBAAQYARMBGgEYAR8BABEVAQwBGgEWARMBHgEgAQACHAEYAQoBGAIABR0BIAIAEh8BGwEgAhUBHgEgAQADGwEOAR4CAB4gAgAFIAIAFQ==",[[23,28,20,0],[12,14,20,1],[6,11,20,0],[15,20,20,1]]],
 mosswisp:[36,38,0.528,"b9c979acbd76a7b86d9eb5609eaa6695a85793a05c8b995483944d7c8d467e8547727f416d783e686e3d616d3a5e6636585e3550552e4f4e2f484c2c47442a3b4127453c25393925362f1f2e2e1e2b25172424192618121e1811180c0b0a0404","ABQbARkBACETAQsBEgEVARgBAB4SAQsBAwESAQ8BGAEaAQAdEQELAQgBAwEPARUBEwEAHhYBEQEFAQsBDgEYARoBAB0ZARIBEAEEAQ0BGAEWAQAdFgIQAQQBCwETARoCABobARUBGwESAQwBBAEOAREBGQISARYBABUdARMBGAITARABDwEKAQYBBAEJAQ0BFQEYARYCEwEAEhkCGwEYARIBDAEKAQgCBAECAQMBBgEMARABCgEPARcBFgEAERUBEwIQAQwBCQEIAQYBBAIBAgYCCgEMAQQBEwEYARoBAAcWARQBGAEABh0BGAENAQoBCAEJAQQCAwIBAgQDBgEYARkBGAIABhYBGgELAQcBDQEABB0BEwENAQkBBgEDAQYBCAEEAQMBAQMEAhABCgERARsBGQEYAQAFFAEJAQMBDwEUAgAEHQEVAQ8BCAEGAQMBCQEKAQMBBAEDAQECBAEGAgkBDAEQARgBFQEABBYBEgEDAQQBDAERARIBFAEZARsBHAEaARUBDgENAQgBBgEEAQEBAwEGAQMBAgEBAQQBCAEGAggBEAEYARoBGAEAAhoBEwELAQoBBgIJAQ0BGgEVARYBGwITAQ4BCgEIAQYBBwEBAQQFAwEEAQUCBwEMAQsBFQEWAQACGwEVAQ8BCgEGAQsBEAETARIBFAEPAREBGAETAQ0BCgEGAh8BGQEGAQQEAwIIARwBDwEKARIBGQEVARgBAAEdARUBEwERAhABEwERARABCQEKARABFwESAQwBCQEOARsBEwECARUBAwEEAQMCAgEHARsBCAENAQoBFwEZARQBGgEAARoBGAEXARMDFgERAQwBCAEKARIBEQESAQ4BCwECARABHQEgARkBCQEDAgICBwEbARYBAQEOARYBFQERARYBHAEAARsBGAEUARMBFwIRAQYBBAENARQBCQELAgcBAwEHARkBHwEOAQkBAwICAgsBHQETAQEBEQEYAhEBGQEcAQACGAEZARMBGAEVAQ0BCgEIAQ0BEgEUAQwBBgEIAQYBBQEXAR0BDQEDAwICBwEVARgBBwEOARYBGwEcARsBHgEAAx4BGAEaARIBCgEFAQgBCgESARACCQEIAgcBCAIDAQIDBQEDAQQBBQEIAQkBCgEQARMBHAIABRMBGQEQAQwBCAEGAQwBEAERAgoBCQIIAQUBAgMBAQgBGAEHAQgBBAEFAQYBCgELAQ4BGAEaAQAFGwEXAQ8BDQMGAQgBDgERAQ0BCgEJAQgBBAECAgEBEwELAQUBCwEXAQgBAwEIAQ0BCwEBARABEgEABRYBFQEPAg4BDQEMAgoCEgEQAQ0BCQEHAQIDBQEQARkBFQEIAQUBCgEQARMBCAEBAQIBFAEcAQAEHQEZARECDwEQAQ8BDQEPARICDgIMAgUBAgEDAQUDAwEFAQwBEAEVARoBFQEQAQ4BFQEcAQAFGgEbARMBDwEQAREBDwEQARkBDQIFAQMBEQELAQcCCAIJAQsBDAEOARsBHQEbARgBEQEXARsBAAYeARoBEQEQAhMBEgEXAR4BFAEMAQQCBwEFAQ4BBwIIAQoBDgEPARsCGAEADBsBFwEQAREBEwEYAxQBCQEGAgoBDwEOAQECDAERAhMBGAEbARwBAAwcARsBEQESARkBHgEaARgBFgENAQoCCAESARQBCwEIAQ4BEwEZAhMBGAEeAQAMHgEfARcBEwEaAR8BHQIZAQ4BDwEKAQwBGAEWARUBEQEUARsBGQEXARUBGQEbAQAMIAEdARkCHgEgAR8DFAEQAQgBCgEbAR4CHwIeARkBEwEbAR0BAA0gAR0BGQEeARsBGgEfAR4BAAEZARMBCQIbAR8FGwETAR0BGwEADSABHQEZARsCGAEgAQACHAEYARACGwEdAQACHwIeARkBGwEdAQANHwEdARcBEwEfASABAAQeARcBGQIeAQACIAIeARcBFQEdAR8BAA0aASADAAUfAR4BEQEVAR4BHwEAAyABHQIfASABAA4gAgAHHgEdAwAEIAMfAQAZIAIABx8BAAg="],
 cavemush:[28,32,0.518,"efe5cbe5d5b9cdcdadaea48d78bfae48aea73baba6359d992f8d8e8d7d647c69534d898163654e2c7d812c6f74265c605a523c5c46354c4333493d2c2c4a472a413f402e23332a1e3236281e35352f241d261f18251d141e161116100b0c0503","AAsaBxkBABAZARoBFgIOBg8BFgMADRoBFQEPAQwCCQIHAggDCQIPARUCAAkcARYBEAEOAQkBCAEGBgUBBgEHAQgCCQEQARoCAAYWAg8BDgEJAggBBwEGAwUBBgEFAQYDBwEJAQ4BDwEVARkBAAMZARoBEAEPAQ4BCQMIAQcBBgIDAgUBBwEGAwcBCAEJAQ4BDwEQARoBAAIaARABDAEDAQ4CBQEDAQgBBwIGAwcBBgMHAQgBCQEKAQQBDAEQARoBFgIQAQ8BAgEBAQUBCQECAQMBCQEIAQcDBgIHAwgBDAIDAQEBBQEOARABGgEWAQ8BDAEDAQIBDAEJAQYBDAEJAwcEBQECAQYBDAEOAQ8BDAEEAQwBDgEPARoBFgEQAQ4FCQIOAhABCAMJAQUBAgEDAQ8FDgEPAhoCEAEPBA4BDAIVAREBGAEZARsBGgEWARkBBAEKARUCEAUVARsCFgEQAgwBEAEPAQQCGwEYAhsEGAIfAR4CFQEQBBwBAAIcARYBEAEMARABGQEYARMBEgEUAREBCwERAQsBFAEXARgCHAEeARMBDwEQARYBGwEABBsCFgEQARYBGwESAhcBHgIKAQMBCwESARMCFAEYAR4CGgEbAQAGHgEbARoBHgEcARIBEQEbAQoBBAEcAQoBEQESARMCFwEcARgBHAEACxwBHwEUAQsBBAELARwCCwENARECFAERAQQBEQEcAQAJHgEdAhgBBAIDAQQBHAEYAQQBAwIEAQsBGwEUAQoBHgEABxgCEQINARIBEQECAQQBAgEEAQIBAQUKAQsBBAELARkBAAUYAhcBDQELARMBFAERARQBCwEKAQMBAgEBBQMBCgERARQBGQIABBgBGwERAhMBFAEYARwBFAIXAQQBAgQDAQsBDQELBBwBGQEAAiABHgERARMBDQEEARgBHAEYARcBCwEEAQICAwELAQoBEwINAQQBCwECAgMBEwEfAQACHQEeARQBEQEYARsBEgELAgQBAQQLAR8BEgEcARkBBAEBAgQBCgEXAR0BAAMfARsBGAEUAR0BDQELAgoBAgEBAgIBBAEfAR4BHQEYAQoBCwEKAQQBGwIABRwBGAEUARsBEgENAhEBCgEBAgIBBAEcAR8CFAERAhkBHAEYAQAHGAEeARgBGwERARYBFQERAQMBAgEDAQoBGAEUAR4BHAEUAhkBAAsdAR8BGQERARUBEQENAQQBCgELARcBGAEcAR4BHwEdAQAMIAEfARgBFAEZARcBHAENAhkBGwEYARsBHgEdAR8BAA0eAgsBCgEYAR8CIAEfARsBEgEbARwCAA4YARcBEgERARsBHgEfASABHwEYARcCHQEeAQAOHwEbAQsCHQEfAQACIAEfARIBDQEdASABAA8eARcBEgEeAR0BAAMfAR4BIAEfAR4BABAgAh8BAAUgAwAI"],
 g_rock:[50,50,1.127,"cccad39791aa89839e847e9b8079987f77967b769478728f756d8c7069827168896a6382696279665c786259745f546a585068554a6053465a4e43564c3f534d3e45473c4d4837414134433c2e3a3727322e222a2b1a1f21161c190f130d0508","ABMdARIBCQEALhoBFwENAQcBHAEaARwKACENARMBAgEEAQsBFQEZARoHGwQYAQAeFwEJAQECAwEHAQgBEgEUARYCFQEUARYDFQIYARsCABwVAQwBAgEBAwUBCAERARMDEgEOARUBGAEWARQBEwIUARkBGgEAGxQBCQECAQEDBwIEAwUCBgEFAwQEDQETARsBABoUAQsBBAECAgYCBAMFAgYCBwIEAQEBAgEEAQ4CEQEZAQAaFwEMAQgBBgEEAQUCBgEFBAYBBwMCAQECBwEKAQ0BBAEQAQAaFwEPAQUBCwEIAgkBCAEHAQYCBQIGAgcBBQEGAQgBBwEKARABFQEAGxcBDwEMAgcBAQIJAQgBBwEGAQUEBAEDAQYBCAINARIBFgEaAQAaFwERAQ0BCwECAQECBAEIAQcBBgEFAQQCAgEBAgIBBQEIAQ4BFAEWARoBABkSAQgBBAEIAQcBAQMEAQgBBgEFAQQDAQMCAQUBCAEPARYCGgEAGRoBEQEJAQMBAgIBAgQBBwECAQMBBAMCAQECAwEGAQgBDwEYARoBABUfAR4BHQEcAh0BGQEUAQ8BDAEHAQEBAgEDAQIBAQECAQMDBAECAgUBBwEIAQ8BGAEbAQAVGwEZAREBEgEYARsBGQEXARUBDAEKAQQBAwMBAQIBBAEFAQYBDQEEAgUBCAEJAREBGAEbAh0CHwEAEB0BGQEKAQgBBgEEAQYBFwEYARQBEwIKAQsBAwMEAgYBBwEPAQoBBQEGAQcBCQESARgBIAEdAhsBHwIAChoFGQMPAQkBDQEQAhoBHAETARICEwEEAgUBBwEIAQkDCAEJAQsDFAEXAhMDFwEcAR8BAAgYARIBCgEJAQoEFAEXARMEHAEeARgBFwEaARkBFAESARABCwMJBAsCCgEZARwBEgERAxMBHAEdARwCHQEABBQBEgEHAQIBAQICAwkBBQEZARUBEwERAQ8BDgENAREDEgEVARcBFAEVARcBFAESAREBEAERARIBFAEYAREBEAMTARcFGAEZAQACGwETAQkBAwICAQEBAgEBAQMBBAEIAQ4BFwEUARIBDwEOAhABBwMRARIBEAISARcBFQESARcCFQEUARMBEQMYARsBEAEOAQ0BDAMYARsBAAEaARMBCgEDBAQBAQEOAQwBDQEMAR0BGAEUARMBEgERAgkBCAEJAQQBAgEBAgcBBAECAQMBCgEMAQ0CDwESARUBHAETAQQBAwECAwMBAgEOARMBGwEaARMBCgEDBQUBDwEOAxEBFwESAhECDwEMAQsBCQEIAQQBAQECAQsBCQELAQ0BDgMPAREBEgEZAR0BEAEKAQkBAgIEAQYBBAEJAREBGwEaARQBDQECAQMEBgEPBRoBEgERAxoBGAERAQsBCQEIAQYBBwELAQwCDgEUARcBFAEPAhIBGQEcAQ0BDAIGAQMBCAEJAQsCEQEbARoBEwEQAgQBAwQPBBEBGgESAREBEAEUAR0BEAEWAQ4BCQEIAwsBDQEOARQBIAEeARkBDwISARcBGwEMAgsBDAEKAQcBCAEKAQsBEQEaAhMBCQEKARIBAwMPBA4BFQEZARIBEQEPAQwBCQECARQBFwEIBAsBFQEeARoBCQEMAQ8BEQEQAREBFwEbAQ0BDAELAgoBCwEKAgsBEQEaARsBEwEJAgoBDwEQAQMBDAEPAwwBGwEYARMBEgEMAQgBBAECAQoBDAEJAggBCQELARQBEAEKAgkBCgEOAQ8BEQEXARwBDQEKAQsBCAEHAQoBDAILAREBGgEbARQBCwQHAQkBEQEPAQ4CDAEYAhMBEgETARABAgIHAQgBEgEJAw0BGQEHAQIBCAEKAQgBDQEOARABFwEcAQ8BCgELAQYBAgEMAgsCEQEbAhUBCwMJAgQBEQEPAQ4CDwEdARgBEwESAQ8BDgELAQgCBwEUARUBEwERAQ0BCQQLAg8CEQEYAR0BEAENAg8BBgEMAQsBDwERARUBGwIXARABEgEOAQsBCAEGAQ8BEgIRARABHQEYARQBEQEOAgwBCgIJAQcBAgEBAgoBCwEJAQsBDAENAQ8CEAESARsBHQEUAQ8BBQIOAQwCDwERARkBHQEcARcBGAEVARQBCgEHAQYBFwEUARIBEQEQAR0BFwETARIBDgIMAxABEgEHAQEBAgENAQsDDAEPARACEQESARwBFQEHAQQCAwEEAQcCCgETARkBHQIUAQoBCAEHAQoBDQEOAQEBDgEJAQwBDwEQARcBEwESAREBDgENAgwBGwEdARsBHQEeAR0BEQELAgkBDgERAhIBHQEaARcBEwEKAQgBBwEDAQ8BEQEMARMBGQEeARwBEgEDAQkBBgEHAQkBCAEEAQoBEQETAQ8BEAEZARcBFAESAg8BDgIPAQQBAgMHAQ8BDAELAQwBDwESAhMBHQEaARcBHAEaARABCAEPARMBFQESAREBFwEeARwBEgEEAQYBBAELAggBCwEMARkBGwESAQ8BHQEZARMBFAEXARQBEAEPAQ4BDAEHAQUBBAEGARUBDwMQARIBFQEUAR4BGgESAQ0BGwEWAQ8BDAITARIBEQEXAR4BHQEVAQoBBQEDAQoBCwIOAREBFwEdARgBEgEeAR0BHAEbARwCGQIaAQ8CCgERARYBHAIbARoBFAEaARwBHgEfARoBEAEYARwBFwEQAQwBCQEXARMBEgEZAR8BAAEYARYBEAEKAg0BCwEUAhgBGwEaARgBGgEVAREBDwIOAQQDAgEFAQEBAgEEAQcBDQEVAQ4BAgENARABFAEYAR0BGgEWAhIBEQESARUBFwEVARoBHQEAAx8BGQETARABDgEPARoBGQEaAR0EGAERAQ8CDAEEAQMDAgEBAgIBAwEJAREBBwEFAQ4BFAEXARoBHwEdARsBGQEXAhkBGgEYARkBHQEABRwBGgIdARwBHQEeAR8BGwEZARoCGAEcARIBEQEOAQYBBQEEAQMBAgEBAQICBQEKARIBEwEUARgBGwEcAR0CHwIeAR0CHgMfAQAJIAEfASACHQEZARcBEAEKAREBFwEaARQBEgELAQgBBgEEAQIBAQECAQcBCgEQARcCGgEbARoBGwEYARoBGwEfAR4BHwMgAgANHwEUARICEQENAQ4BDQEZARsBFgEUAQ8CDQEKAQEBDAEKAREBFAEdARwBHQERAhIBFwEZAh0BABIdAhEBDwEOAQ0BDgITARUBHgEfARsBFQITAREBAwERARQCHwEeARsBEQEOAQwBDwERARUBFwEaARwBABAfAR0BFQERAgwBDQEKAQgBEgEXARsBHgEgAh0DHgEfAR4BHQEcAR0BGgEMAQIBBwELAQwBDwEUARUBHgEgAQAQHwEVARIBEQEPAQQBCgECARIBFwEbARwBHQEfASABHQEeAR0BHwMdARwBGQEPAQQBBQELAhEBFAEVAR4BIAEAEB8BGgETARIDEQESARQBGgEbAx4BIAEABCABHgEbAhoBFQETAQoBEwIUARkCHwEgAQAQHwEZARQCFQMXARUBHgEaAhsBHgEgAQAEHwEdARoCGQIXARQBGQEVAhoBGwEeASABAA8gAR0BFQEUARcBGAEdAR4BHQEbAR4BGgIbAR4BIAEABCABHQEYARkBGgEYARsBHQIeAR0BGwEaARsBHgEADyABHQEXAhsBGAESARQBGAEdAR4BGwMeASABAAQgAR0BGQIcARsBHAEaAhgBGgEbAx8BIAEADiABHwEbARoBGwEYARICGAIcAR0BGgEbAR4BIAEABCABHwEaAh0CGAESARABDQEWARoBHAIgAgAPHwIdARsBGAESARQBFgEYARoBHQEbAR8CAAUcARsBIAEfARwBGwEYARQBEgMYAR8BIAEfAgAQIAEfAR0BGwEaBBsBHgEfASABAAcaAR8CHgEdARwDHQIfBAATIAMfBCACAAoeASAJAAo=",[[7,22,42,0],[27,42,42,1]]],
 waterslime:[27,34,0.624,"b5deef9bcae48cbddd7aacd0749dbd619dc75c9dc75c90b95c89b05e82a2566f9048698e4b60844b5a784556743f5c80455270414f71434c67384e6e3c48633f4353353f5c383b4f2f384a2f30412d2931242329271f281b171d160d11110c11","AA0aAQAaFwEVAQAYFwEPAQkBFQEAFw8BDQEDARABFQEAFhABAwECAQMBFAEaAQAUFwEMAQQBAgIJAQwBABQQAQkBBAEBAgQBDAEAFBUBCQEEAQECAwEMAQASHgEdARUBCgEGAQMCCAEPARkBAA8fAR0BHAEbARgBDQEJAQQBAwEKAQ8BHAEdAQANHQEcARoBGAEXARMBEQEMAQUBCgENARUBHAEdARsBHAEACR0CGgEYARcBEwMRARMBEgMVAhYBGwEdAR4BAAccAR0BGgEXARUCEgEFAQMBEgERARIBEwEVARMCFQIYARoBHAEABRwBHgEYAhcBFQETAREBDQEOAw0BDgERAg8BBQEUARUBGQEbAgAEHQEbARkBEwIVARECDwIOAQ0BCwENARICDwENAQ4BFAEXARgBHgEAAxsBHQEaAQ0CDwETARIBDwESAg4BDQELAg0BCwENARACDgEVARcBGgEcAQACHwEbARgBEwERAQ4BDwELAQgBCQEKAwsBDAINBAsBAgEVARgBHgEAAh0BGgEVARIBDwENAQgBBgEHAQgBDAEFAgoBCwINAgwBCwIDAREBFwEbAR0BHwEdARoBFQESAQ8CBAEHAQYBDAENAQECCAEKAgwDAwIOARQBFwEbAR4BHwEdARoBFAESAQ4BCAEGAgcBBQENAQMBCwEEAQgBCgMJAQUBFgEVAhcBGgEfAh0BGgEUARIBDQEHAgYCAQEWAR0BGgEEAQcBBgEIAwoBHwENAQMBFQEaAR8CHQEaARICDQEHAgYCBAEKARUBEAEGAQgBGQEaARkCCwETAQMBAQENARgBHwIdARoBEwESAREBCAEHAQYCBAEGAQcBCAEKAwwCCgELAQoBCAEFARABGQEfASABHQEbARcBFQIIAQcCBgEEAQYBBAEDARgBGwEOAQ0BCgERARgBBQEDAQYBFAEaAR4BAAEeARsBGAETAQ8BDAEIAQcBBAIDAQECAgEKAQsBGgEbARoBDwECAQMBCgEUAR0BHwEAAR4BHQEYARUBEgETAQoBBwEEAQIDAQQNAQUBAwECAQUBCgEQARoBHQEAAiABHgEbARgBFQIUAQkBBwECAQEHAgEDAgUBEAEYARwBHwEAAx8BHgEbARgBFwIUAQgCAwEBBAIBAwIGAQoBEAEXARwBHgEABR8BHQEcARgCFwEPAQsBBQEDBAQBCAIMAhoBGwEdAQAHHgEfARwCGQIXARUBDQEIAgkBDQEUARABGQEdAR4CAAogAh4BGAEWARoBFAIQARQBFwEPAR0CHgEADSABFgEOARgBIAIeAh0BHwEVARYBHQEADiABHQEWARsBHwEABCABGgEWAR4BAA8gAR8BIAEABiACHwEABw=="],
 clam:[42,28,0.627,"e6cebcd6a090de8d83cb8478c2796ebf6a64a76058a374647d5a49a6534d95534a904a43964541774e427f4038624637573f2f7c363369372e67292759282355352a502c244427204f1f1d403123382a1d3322193f20193518122417101e0d0a","ABAcAR4BHQEaAQAEHQIeAQAeHQEUARICFAEYAQACFwEUARICFAEAHBUBEgEPAQQBCgESARkBAAEdARQBEgEHAQUBEgEVAQASIAMABRkBFAENAQoBCQETAQoBGQEAAR0BDQIJAQwBCgESAR0BAAQfAiACAAcfARoBHwEeAxgBAAMVARIBCgENARQBGgEYAR4BAAEbAQ8BEwEdARUBDQESARsBAAIeAR0BFgERAhoBHwEABRwCGAERAxACHQEAAhkBEgEKAQcCGgERARoBAAERAR0BGAEIARMBDQESARcBAAEaARYBCAEJAxABGAEbAQADHwEcARcBEAEOAQkDDgETAQADGAETAQgBBAEYARABEQQJAQEBEwIWAREBAAERAQkBAQECAQgBCQEOAhoBHgEAAiABGAEQAg4BCQIBAggBAAMaARcBDgEFAR8BHAIYARwCCQECARYBGgEOAQkBGgEQAQsBAgEOAQkBDgEJAQ4BEQEYAR8BAAEcARYBEQEQARYBFwERAQECBQEQAQABEQEaARYBHQEVAhIBDQIPARIBDwEVARoBHAEOAQkBGgEQAQsBDgEQARcBEAEOARABEQEdASACHAEWAxABCAEWAQIBAQEEARsBGgIZARQBEgEPAQ0CCgEGAQcBDAEPARIBEwEYARoBEQEbARABCQEQARwBCAEOAQkBEQIdASACHAEWAgkBAQICARMBBgEIARwBGgEUAQ8CDAELAQ0BAgEEAQMBBgENAhICEwEVARgBHAERARIBDgEJAQEBBAEJAQEBEAEdASACHAEYAQkBAgEBAwgBCwEdARgBEwEKAgsBDQIKAQYCBQEKAgwBDwEVARMBDQIdARcBCAICAQEEEAEYAR8BAAEfARgBCwECAQEDCwEPAQ4BEgELAQoBBQIVAQ8BCgMNAgwBDQETAREBAgENAQYBCwETAQQBCQEEAQEDBAEIASABAAMWAQkBCAEEAQIBBQELARICDQEKAQQBAgEBAQgBFQENAQcFCgEUAQgBAgEFAQMCBwEUAQgCBQEEAggBHAEABRwBEAERAxMBFQEPAQcBBAEDAQIDBQEDAQIBAwUEAQgBHwEZAQMCBQEdAR4BFwERARoCAAkfARwBGgIeAQ8BBwEEAQMFBAEFAQMEBAEGAQIBCQEPAQMCBQEdAh4BHAEbARwBAAkQAREBDgEWAR4BDQEHAQQBAwMEAQkBHwEcARABDAMGAREBAQICAQMBBAEGARQBDQEKAQsBFwEYAQAIFAEHAQQBAwEFAQsBEwEMAQoBBwEGAQQBHgIWARUBFwEVARcCHgECAQECAgEDAQ0CEgEEAQUBBAEGAQwBHgEABhIBCgEEARIBBwEKARIBGQESAQsBDAEHAQUBHQEXAQYBBAIDAxQBGQEEAQIBBAEGAQwBGQITARUBFAEGAQ0BEgEeAQAEGAEKAQUBDwEXAhUEEwEPAg0CBgIEAgMBBAEGAhUBBwEGAQoBEgEVARQBHQEbAhoBFAEKAQQBFQEdAQACFwESAQUBEgEWARoBGwEYAQ0BBwIeARUBDAELARUBCgENAQcBBQEEAQUBCgIUAQ0BCgEWAR0BDwEGAQ8BGgEbARoBHQESAQQBCwEdAR4BHQETAQcBAQETAREBAAEaARMBCgEMARQBHgIUARkBHgEUAQwBCwEKAwwBGQEYARIBHQEfARoBFwEPAQYBEgEAAxcBFQEPARkBAAEeARcBDQITAQACFgEMAQUBFAEcAR4BDAEGAQcBIAIYARUBFgETAhcBHwEeAQoBBwERAhsBEQENARkBAAMeAQwBCwEWAQACHgEUAQ0BFQEAAhEBDQESARoBHAEaAQcBBQEUAR8DIAEeAiABHwIcAQ8BBAEJARoBAAEbAQsBEgEAAx4BFwEeAQAEGAEXAQADEwENAR4BAAIXAQYBDAEVARkBHgEABxwBFAEeAQcBDgEAAhkBHQEABB4BAAogAR4BAAMWAQoBDwEZAR4BAAgfARYBEwEeASABABgRARkBHQEZAQAKHgEZASABABofASABAAwgAQAO",[[2,3,24,0],[32,33,24,0],[38,38,24,1],[7,9,24,1],[12,17,24,0],[25,29,24,1]]],
 carp:[40,30,0.617,"e7e9efe0e3e9d7d7dec7c7cfbbbbc1aba9b1a39ea5948e97847f8d807985716a7b6b6172695e67605b716159646156615e5454574e55584a5051444a49404647383f41373b3e3031382b2e3328262f2321271e1b2316161d17141d1111130a08","ABIaARsCGgEZAQAiHAEQAQ4BDAELARUBFwEAIRkBEgEMAQsBCQIIARQBAB8dARYBEgEOAQwBDgEKAQgBBAEVAQAPHAEeAQANHQEVAhABCwEQAQ4BCwIIARIBHAEgARoBHAEfAgAHHgEZARcCAAsfAR0BHwEdARoBFQEZARcBFQEQAQ0BGAEaARwBGwEfARQBGQEfAQAGHgEWARIBFQEYAQAJHAEdAhYBFwEWAREBDQERAxABEwIUARYBGAEbARkBHwEABh4BFQEOAQkBEAEaAQAGHwEbAR0BGgEXAhQBEQEQAQwBCwERARMBEQITARACFAEXARkBHwEcAQAFHgEVAQwBBgEIARIBGQEABRsBHAEYARUBEgETARIBDwENARABDQEYAREBDAILAQkBDAEQARICGAEcAR4BAAQeARUBDAELAQgBCQEVARwBAAMdARsBFwEUAgwBEQIQAhYCEAEPAQ4BDAEKAQQBCgELAQ4BEgEVARYBHgEABB4BFQEOAQoBCQEFARUBHAEAAhwCGAEVARQBEQITARIBEQEZARgBFAEQAQ4CDAELBAwBCgEQARQBFwEfAQADHgEWAQwBBgELAgYBDwEYARcBHAEZARUBFAETAhQBEgERARMBHgEUAQ0BDAIOAQwBEAIOAgsBDwEQARIBEwEcAQADHgEWAQwBBgELAgwBEAEcAR0BGwEXARABDQETARQBEwESAQwBFQEcARIBDAEKAQgBBgEWARgBGgEbAQ0BEAQRARkCAAIeARUBDAEKAQsBDAEOARIBGQEcARgBDQEJAQIBCgEQARMBBwEEAQgBGgENAQoBCAEFAQYBHwEFAiABEgEPAw0BBwILARsBAAEfARUBDgEJAQsBDgEQARIBGgERAQ0BBQEEAgEBBQEWAQUCBwEbAQ0BCwEDAgYBGAEQAR8BHgEQAQgDBgEDAQUBDAEWARwBIAEVAQwBCQIIAQ4BEAEZAQgBBAECAgEBAwETARkBGAEKAREBGAENAQwBCwEFAQMCDQETAREBBgECAQEBBgEHAQgBCgEYARkBHAEgARUBDgEJAgsBEAIZAQoBBwEGAQUBAQEKARYBCgEFAQEBBwEUAQwBEQEIAQYBAgIDAQQBAwEBAQwDCgELARQBGwEZAQABIAEVAQ4BCgELAQ4BEAESARsBDQEKAQcBBgEFAQYBDAEEAQECAgEGARABCgEEAQIEAQMLARECCgENAQgBCwEgAQABIAEWAQ4BCwEOAhABFQEfAgwBCAEHAQYBBQIBBAIBCgEEAQMBAgEBCAMBCAEKAhQBAAIgARYBDgEJAQsBEAEUARkBGwEeARcBDQEIAQYBCgEJAQMBAQMCAQQCAgEBBQICAwECAQMBBwEUARoBHQEAAiABFgEOAQkBDAESARcBHwEAAR4BIAEVAQ0BBwEMAQYBBQEEAQMBBAIDAQYCBAIDAwIBBAIDAQYBCAEMARsBAAMgARUBDgELARIBFAEZAQADIAEaAREBDQILAQYBBwEFAgYBCAEHAgUBBAEDAQQBBQEEAQYBBwEIAhABHAEABCABFgEQAQ8BFQEYARwBAAQcARgBEQETARQBCAELAQQBAQEDAQYBCAIGAgUBCAMJAQoBEwEdAQAGIAEXARIBFQEXARsBAAUfAREBDQEbARwBGQEHAQMCAQEHAQwBCAMHAgsBEAEXARsBFwEAByABGAEVARkBHQEABhsBGQEYARwBHQESAQUBAQEEAQUBEAESARABDQEMAQ8BBwELAQ0BHQEACR4BHAEdAgAIHgEcARoBHAEHAQQBAgEGARYBGAEdAR4CHAEUAQUCCAEYAQAKHQEfAQAMGQEKAQIBBAEQARUBHgEABBQBCwEIAQsBHwEAGBoBCAEFAQoBGQEaAQAFGgEZARQBGgEcAQAYHwEMAREBEAETAQAIGQEgAQAaHwIAFg=="],
 lotus:[31,32,0.548,"e0dec9b5ce82adc579a1c16badb47c88a554a7a07580944e938b5d748b4678774b62773d5e6b3b726047505d33505432494f2e5d40353f4227463d2a3b3a253b322333312132261c2c261b252217231d1424191318150e1a0e0e0e0908","ABUOARIBABQdARwBGgEbAhoBHAEZAQ4BBQEOARIBABIaARwBGgEYARkDFAIOAQEBBwEOAQAPHgEcARcBGAERAhMBFAIWAQ4BAQQHAQkBAA0aARgBFAEWARUBEAEKAgsBDQEPARIBBwEBBAcBFAEACxoBHAESAg0BCAEKAQYBBAEDAQQCCQESAQUBAQIHAQ4BFgEXAQAIHQEZARoBEQMNAQoBBgIEAQIBAQECAQQBBgINAQkBFAEXARABFgEZAQAFHgEcAhUBDwEQARUBEAEIAQYCBAEDAQIBAQEDAgQBBgEIAQsBEQETARQBEAETAR0BAAMdAR4BGAERAQ0DEAEMAQYDBAMDAgQCBgIIAhcBFQEYAREBFgEVAR0BHgEcARYCFAEPAQ0BDwEMAQoBCAEEAQcCBQECAQQFCgELAhMBFQENAxQBHgEAARwBGAMRARoBGQEQAQoBBgELARkBFAELAQUBBAUNAQcBEQEGARoBGQEXARoBGwEdAQABHQIcARYBGwEaARcBDwEKAQYBFwELAQIBGAERAQMBBAIDAQQBDQEfARUBCwEdAR4BFQEdARcBAAQdARMBHQEaAQ8BCgEIAQMBCwESAR4BHAENAQMBBAEDAgQBCwEfARABCwEQAR8BGwEABxsBGAEaAQwBCgEJAQcBAQESARwCDQECAQMDBAEFARUBCAILARoCAAcXARkBGAENAQsBCQIHAg4BCQEFAQcBCQEHAQIBCQEIAQUBCAEMARQCAAgQARUBFwERAQsCCQIHAQYBAwECAQkBEgIOARQBBwEGAQwBDwEbARQBAAcTARcBFQEQARYBEAELAQoBCAEGAgICBgEFAQECEAEHAQgBDwEVARwBFAEABxABGQEQAQ0BGAEQAQ0BCwEIAgYBAwQCAgkBCgENARABFQEaAREBAAQYARABEQEVAQkBDQEVAREBFAEQAQ8BDQELAQoBCAIKAgsBDQIQAQ0EEAEVAQADGAEUARgBFQESARABGQEWARQBGwEWAREBCAEHAQgBDQMLARcCDQEDAQQBCAEKAQwBEQEXAQADHAEYAQ0BFAEXARUBEQENAhUBDwEGAQQCCAEKAQgBCQERAQoBBgEHAQMBAgEEAQwBDwEXARkBAAMaARgBGQEVAREBEAEPARQBEwEMAQYCBAEDAQICBwELAggBBgEEAQYBAwECAQoCFQEAAx0BHAEVARYCFAEVAhABCgIMAQQBAgIBAQcBCwETAQwBCAEKAgkBAgEJAQsBHQEABBoCGAEWARgBFAENAQoDDQEGAQMBAgEDAQgBDQEWARMBCgEQARUCDQEJARgBAAYbARoBFgEcARABDAEKAg8BEQELAQYBCAEKAQ0BGQEbAhABEwIYARcBGgEACR0BHAEUARABCgIVARABDAMNAREBHgEbARUBGwEdAQAOHgEcARUBDAIXAg8BDQERARsBHgEcARYBHQEeAQAQHwEWARECHQEeARoCHgMcARYBHgEfAQAQHwEVARYBGQEdARcBAAMfAR4BFgERARgBGwEAEB8BGAESAQkBFQEaAQADHwEeARQBEgERARgBHQEAEBoBFAIYAQAFHwEeARkBHAEeAQARHQEfAR4BHQEABh8CHgEfAQAI"],
 kingfisher:[35,28,0.577,"d8a970d98b394e8daa477c9bc37036666268456e8e3a5f80b05b28a0582b9b461d454e643e54713a4b663f465776351a523122442b2440414e36363e3730342e3b4e282d3527282f2b2320381d12241a141e12101c0c09120d0c0e0606","ABEeBgAbHgEdARQDEwIUARgBGQEAFx4BGwEZARIBEwEPAQ4BDAMPARQBHgEZAQAUHQEcARECEwEMAQ0DAQEHAQ4BDAEPARcBHAEAEh0BGwESAhMBDwEIBAwCDQIMAQ8BFAEbAQAQHwEbARkBFQETAgwDEwMMAw0BDAEUAR4BAA8fARkBHQEZARUBEwEPAhMBFwEeARMBAQEXAQwCDQEMAREBGgIADxUBHwEZAhUBFAIZARQBHwEGAhwBFgENAQYBCQILARADEgEADB8BHgEZARQBFgMIAQEBBgEeARwBGQENAQYBCgECAwECCwEQAgAEHAIABRwBGQEWAQQBAwUBARQBFwEYAQQBCgECCAUBGgEAAhcCFAEYAQAEHAEHAwMHBAEDAQYBBQEJAgsHEgEAARcBFgEIAg8BFwEAAhwBGQEXAQ0BBwIEAQMGBAEGAQUCCQQKARABEgEaAQABHgEUAQ4BDQEDAggBFwEZARgCDgEHAwgBBAUBAgUBCwEFBQkBEAIAAxkBGAEXAQ4BBwEEAQcBFwEUAQgBBwMIARYBDQEIAgcBBQECAwsFEAIaAQAEHgEYAQgBDQEIAQcBDQEOAQgBAwEHARYCDgEEAQMCDQEKAQUBAgEFAgkBCgEeARsCAAgYARYBDgENAw4BDQEWAg8BBwEEAQMCBAEHARQBAQECAgUBCgEFAR4BGQIACB4BFwEWAQ4DFgEZAg4BBwEEAwMBBwENAQYBAgEBBAUBEQEYAQAKGwEYARQBFQEXARwBGAEWAg8BDQEHAggCDgEKAQEFBgEZAR8BAAweAh8BHAEPAQ0CFwEWAQ0CDgEWAQYBAgEBAwUBCgEZARsBABAcARcBDwEIAhMBFgIXAREBBQECAQECBQEKAQYBGgEAEhgBFAEWAQgBFAEbARkBEQEQAQoBCQILAQoBEQEeAQAUHAEYARUBGgEdAREBCwQQAREBHQEeAQAWHQEaARABGgEcARoCEgEaAREBGgEfAQAXGgERARABEQEcARsBHQEZAR0BEgERAR8BABcaAREBEAIbAQADGwEQAh0BABcdARoBEAEFARABHQEAAhsBCgEQAREBGgEAFxoBCwEQAhIBAAMaARABGgEdAQAYHQEaARsBAAQfAwAM"],
 mist:[29,40,0.613,"f5f6f8f2f3f7f1f2f7f0f0f7edeef5e3e8f2dbe0eacdd6e7c7d0e2c0cadfbdc6d9bac1d2aeb7c9a3aac09ea3b7969bb19092a9898ba07f7f91736e7e616472645b665a4d574d4852513f4348393a3e2d2a302c2b261f1b311e2021151312090a","AA0fAQAbFAEVAQAaDwELAR8BABoWARMBHAEaAQAaGgEUARIBFgEYAQAZFgEQAQcBFQEYAQAYHAEUAQcBEQEVARwBABIgAgADHQEUAQcBAQESARcBAAMgAQANHQEaAR4BIAIdARwBEwEGAQEBDwEWARoBHQEcARoBHQEACxoBGAEaAx8CHAESAQUBAQENARYBHQEcARoBEwEcAR0BAAkdARcBEwEWARsCGgEbARQBDwEDAQIBCwEVAR0BGwEOARQBFgEfAQAJHAEXARIBGAEWARQBDgELAREBCgEFAgYBDgEUARUBDwEWARoBAAocARgBEwEUAREBDQEKAgsBBgEFAwwBEAEOAREBFgEaARsBAAggAR0BGgETAQ0CCwEJAQgBBwEFAQQBBQMHAQgBCwETARoBHAEABiABHQEbAR4BGAERAQ8BCwEKAgcBAQECAQMBBAIFAQQBCAIPARQBGwEdAQAFHwEeAR0BGQEPAQ0BCgEHAQgBBgEBAQIEBAECAgEBBgEJAQ4BGgEbAR8BAAMfARsCGQESAQ0BCgEIAQYBBQECAwMBBAMDAQICBQEGAQkBDgEYARwBAAIgAhoBGwERARABCwEKAQkBBgEFAQECAwMEAgMDAQEGAQkBDAEVARkBHQEAARsCGgEeARABDgEKAgkBBgEFARcBFAEBAQMEBAECAQEBFgERAQkBCgERARcBHQEAAR4BGgEZARMBDQEKAwkBBwEVARwBCQECAQMBAgIDAQQBBwEUARMBDwELAQkBDQEUARcBGQEbARoBGQEPAQ0BCQQTARsBFAEWAQwBBAECAwQBBwEdARoBDAELAQgBCQETARUBGgEbARoBGQEPAQ4BCQMIARIBHAEZAR8BDAEEAQIDAwEHASABHwEYAQYBCQIRARQBGwIaARkBDwEOAQsBCQIHAQYBFAEeARUBAwEEAQMBAgIEAQMBFAEZAQ4BBwEMAhEBFAEeAhoBGQEQAQ4BDQEMAQkBBwECAQ8CDAECAQQBAQIFAgIBAwERAQcCDQEMAREBFAEeAhoBFwEQAQ8BDgENAQkBCwEFAQQBBQEEAQUBAQERAQ0BBwEUAQkBBAECAQYBCAEMAhEBFAEeAR0BGwESARABDwEOAQ0BCwIKAQcBBgQUARsBHgEbAQwBBQEGAQgBCgEMAhEBFAEeAQABHAESARABDwEQAREBDQEJAQwBCgEHAQYCDgENAQ4BFAENAQcBBgEIAQsBDAENAhIBFgEeAQABHAEXAREBEAMOAQkBCwENAQoBBgIHAg4BFAENAQYBBwELAgwBDgESAQ8BGQEAAhwBGgERARADDgEJAg4BDQEGAwsBDAELAQ0BBwEIAQsBDgENAREBEwERARoBAAMVARIBEAEWARIBDgEJAQsBDgEKAQcBBgIOAw0BBwEJAQ0BEQEOARMBFAESAREBAAMRARQBFgEXARMBDgEQAg8BDQELAQcBBgEPAhABDgEGAQsBEAEWARIBFAEXARsBAAUUARoBGAETAQ4BDwETARQBEgEPAQsBBgERARICEQEJAQ4BEwEaARMBFQEACRkBEwENARQBGQEYARICFAEPARUBFwIUAQkBDgEZAR0BFQEUAQAJGAETAQ4BEwEcARYBDQEYARcBIAMfARYBCQENARoBHQEVAQAKGAERARMBFgEdARQBDQETAR8CIAIfARcBEgENARsBHgEfAQAKGAETARgBFwEeARUBDgEMAR8BIAEAAh0BGgEZARIBGgEbAR0BAAogARcCGgEZARsBEgENAR4BIAEAAh0BGQEWAREBGgEYAR8BAAogARkBFgEeARsCEQEQARkBHQEAAxcBEQENARYBGwEADB8BHQIAARsBGQEWARkBHwEAAyABGQIaAR0BABEfAiABAAUdAwAH"],
 lakesnake:[41,28,0.612,"a5b0b95d7d9b6371864d6f94456c9256647b476385416387415d7f5b515e4a4c534458713e474f3d55733d4e633a475d3e424b383f563c3c43343d4b4436383c323436353a2e2f36432c302b2729291f1f211e1e211616181417180e0f0e090b","ABIaAhwBACQcARYBGgETARcBAAQdAR8CHQIfAhcBABcYARoBFgELAgAEHwEWARUBEQELAxMBGAEeARoBABMXARoBEwELAREBEwERARMBFwEeARYCEQELAwoCCwIXARoBHgEAERoBEwEXARMBGAEXARMBFwEVARcBGgEVAQsCCgICAgYBAgELAREBEwEYARwBAA8YAg0BEgIQARQBEwEXARUCCwEKAwYBCgEDAgYBAwEGAQoBEQIcAR0BAA0XAhIBDwEQARICEAENARMBGgEWAQsBBgECAgYDDAEGAgwBCwERARABEgEbAR8BAAsXAhIBCgENARQBEQESAxEBHQEWAQsBDAEEAgIBEAEcAR4BEgEHAQkBDwIOAQ8BGgEfAQAKHAEYARQBDwENARQBEgEUARIBEAINARoBGAEQAQwBCQEFAQ4BIAEBAQIBHAEPAQkBDgEMAQ4BDAEaARwBAAobARgBEQEQAQ0BEQESAREBEAESARABFwELARgBDwEOAQcBBQEQARgBCwEdASABFwEJAQ4BDAEJAQYBFAEaARgBAAkcARgBDQIUARABEgERAQkBAgEMAQ8BHQEYAQ4CBwEFAQkBAQEVAR0BIAEPAQcBCQIGAgoBGQIVAQAIIAEVAQ0BEwEXAREBDwEEAQICCAEJARgBDwEOAgUBBAEIAQICCgEMAQUBBwIGAgoCAQEZARsBAAIaASACHAEAAxYBEQETARoBFwEQAQUBAgIEAQgBEAEOAQUBBAQFAQgBBQEEAQICAwEKBRkBGwEAAR8BHAEWAhoBHAIXARYBHQEaARsCFwEQAQICBAEFAQkBFAEOAQkBCAEEAgUDDAEeARoBGwEWARkEGwEAAhwBGAERARUCGwEfAREBCgEYARsCEQEKAQ0BBAIFAggBEAEUAQ4BCQEIAQQBBQIIAQUBCQIHAQYCFQIbAQACIAEYARMBCwMRARsBFgEaAhsBCwEKAQYBAwEHAQ4BEAEJAgwBEgEGARIBDwEJAQUBCAQFAgIBDAERAR8BAAMgARgBEgEMAQcBCgELARUBHwEaARcBEQEGARABFAEQAQYBGAEDARgBEAEJAQICCgESAQ8BDAEOAw8CEgEPARwCAAQfAREBDgEFAQIBDAELARYBGwERARABBAEHAgwBGAEXARoBHgEYAQ0BDgEFAQEBAgESARcBDQEUAhEBFwEaARwBHgEABh0BEAEJAQQBBQEMAREBGAEaAQ8BCQEHAwkBDgEXAQIBEQEaARwBDwEJAQICAwEKARIBFwEdAR4BHwIACB8BFAEQAQkBEAEOAQkBEQELAQ8BCQUGAQIBAQECAREBIAEUARABDAEJAQ8BFwETARQCFwEfAQAJEwEaARICFAEPAQkCGAEPAQkBBwIJAR4BCgEBAQICBgELARsBGAEXAhoBHQEcAQ8CGgEdAQAJFwEcARgBFAIOAQgBDgEaARQBBwEIAgIBCwEYAQwBBAEDAQYBGAEbAR0CHAEdAQABHQENARMBHQEgAQAKGgEbARgBEwEMAQcBAwECARoBDAEJAQIBAQILAQwBBwEGAQsBHQEABxsBHwEdAQAMGgIWAQsBAQMYARcBAgEBAgsBFgEXAREBGgEdAQAJIAEADRcBFgEbARYBCgEBAQMBDAEcARcBAwEGARUBHwIdARwBABkgARoBCwEGAQsBGAEaAR4BFQIZAR0BIAEfASABABwVAQoBHQEeASABHgEVARkCHQEfAQAkHwMAGw=="],
 puffer:[39,31,0.539,"f5e8ceefdebce4ca9ae0b359d4a654b79568ca933fb38241a9733199754b936635935a26825b387e502c71513567492e6d4223633e245e442c533a255f371c4f392446322051311d3a2a1c3f291a3f25163124172a1e152f19111e140d150a07","ABQgAgAIIAEAGx0BFgEaAR8BAAYZAR4BHQEgAQAVIAIdARkBHQENAR4BIAEABR0BGgEQAR0CGQEAExwBHwEeAR0BHwIPARYBHwEgAx8BHAEXAQoBEAEWAQ0BGgEfAQARHwEUAREBDgEWARwBHwEPARcBHwEeARsBHAEeAR8BHgEKARMBFgEUAh0BABAgARoBEAEGARIBGgEXARoBEQEXARYBGAQaAR4BGwEaARQBGwEVAR8BIAEADyABGgITAR4BHAIRARoBFAEQARICFAEWARoBGwEdAh4BGAEaAR0BAAcXARsBGgEABiABHQEbARoCFAINARcBEAENAQYBEQITARcBFgEYARYBIAEbAR4BAAcXARgBEQIXAQAFHAEfARcBGgEUARMBDwEYAQ4BDQIGARECEAETARYDGgEfARkBAAcUARUBCAISARcBAAMfAhoBEwEcARcBEwERAg8CDQEOAQ8CEAITARQCGAEbARkBEAIABBkBGAEMAQcBBAEOARQBAAMdARoBFAESARsBHAEUAQ8CDgEPARYBFAEPAREBDwERARMBFAIGAQsBEwEQAQAFFwEYAQgBBwMSARYBAAEdARwBGAESAREBFAEQAhEBDwIaARQBHwEeAQ8CEQETAhQBGgEbAR4BHwEABBYBEgEVAQcBBQEJAQcBEQEVARcBHAEaARUBEQIUARIBEAERAhgBHgEDARQBHQERAQ8DEAESASABHgEbAR0CAAMbAREBDAEHAQUBDAEJAQcBDgEZAR0BGAESARECEgIQAhIBGAEcAR4BIAEdAQUBCQENAQsCCQEfARgCHQEXARkBHQEZARsBEQEMAQgBBwEJAQwDHAIUAREBCQEHAREBBwEJAQwBCwERAQoBCAEdARsBBQIEAQMBBQEIAQkBDAIYARkBEAEOAR4BGwERAQwBCQEIAQkBDAEOAQwBGgEVAgkBBwEFAQkBDAEFAwcDCAEHAQgCBAIPARkBEAEFAQcBCAEVAQwCHgEbAREBDAEJAhIBFQEMAQkBDAEHAgUEBwEIAQUFBAEKARYBDQEDAQYBFgEZARMBBAEFAgcBGAIAAR4BEQEMAQkCGAESAREBCQEMAQgBBwIFAwcBGwERAQUDBAEDAQ0CAQMDAQoBBgEFAgcBCQEaAQACHgERAQwBCQISAQsBEQESAR4BEQEVARgBBwEFAwgCBQEEAQIBAQMKAQ8BBgEDAg0BAgEHAQkBEQEZAQADGwERAQwBCQIOAQsBDgEVARwBFQERAQwBBwEFBAQCAgEBBgoBHgEQAQYBAgEDAQYBCgEXAQADGQERAgkDDgESARsBHAEeARoBCQEHAQUCBAIBCQMCAQIDAggBEAEXAQADGgEVAREBCQEIAQkBEgEYAR4BHQEZAQ4BCwEIAQUCBAEDAQEBAgEBCAICAwEGAg0BEwEABB4CFQEMAQkBDgESAR4BAAIcARoBDgEMAQUBCQEHAQMBAgEEAQIFAQECAwYDCgEXAR4BAAUcARoBDAIRARgBHgEAAx4BFgEOAQsCAwEGAQoBBAEDBAIBAwQGAQoBFAEPARYBAAceARECGAEeAQAGFgETAQ8BBgEDAQYBCgEGBQoCBgEKARABFgENARwBAAkeARsBHgEABxkBFwEKAQYBAgEKARABCgEGAw0BCgEGAQoBEwEZARwBAAwfAQAJEAEEAQMCBgEQARQBDQEKAQ0BFwEQAQMBBgEUARkBABcQAQYBAwEGAQoBEwEABBkBDQEGAQMBDwEUAQAWGgEQAREBBgEPAhMBAAUWAQ8BAwEQAR0BABcfARoBCgETAR4BAAcTARQBGwEAGiABHwEACR4BAAs="],
 otter:[44,37,0.695,"edd3a9d2af86b8916aa87d58a06f479d69428c6c5199613a8d603e8f5a358859368e563181533472523b804e2f714b3071452a68442e6440285c3e2b5437265832214a301f492a1b3e2a1d3e2519391e152c1f1627160f1e140d1a0d080e0503","ABwfAgACHwEeASABACMgARwBHQIbARwBHgEfAhsBHwEAHyABHQEgARwBFQccAR0BHwEAHCABHAEfARwBGAEVARQCFQEUAhMDFAEZAR0BHAEAFxwBGwEcAR0BFwETAQsBDwETARIBEQIQAg0BEAESARABFAEYARsBHAEAFR8BHAEYAREBBQEEAhIBDQEEARgBEAINAxEBDQESARMBFgEaARsBABUZARcBEQENAREBEwERARgBGwEYAg0BDwMNARABEgITAhUBHQEfAQAVGwETARYBEwERARIBBAEYAREBDQIIAQQBCwEPARMEFQEUARcBHAEdAQAEGwEdAQAOHQEfARcBEQMTAQ8BCgQDAQgBBgEJAg0BEwEVAQ0BFgEbARwBAAMZARgBGgEXAQAIHwIeAR0CHgEfARsBEAERAQ8BEQEIBAUBBAEGAwkBDwEQAhkBGgEYAR8CAAEZARMBDwIYARcBAAUfARwBHQEYAhcBGAEbAR0BGgEUARYBCQIIAQYCEAEdAR4BBwEBAQYBCQENARABFgEEAR4BHAEfAQABGQEXAREBBAEGAQgBFAEAAx0BGQEcARkBFwEVAxcBGQEcARIBDQEQAQoBCQEIAgYBFgEbAQ4BBwENAQgBCwENAREBFQEcAR8BGwEfAQABGgEJAQUCDwELARUBHAEAARsBGAITARUEFwIYAR0BEwERAQ8BCwEJAQgCBgESAQIBIAIQAQoBCwENAhEBHgIWARgBAAEaAQYBBAEJAQgBDQEUARkDFQETAQ4BBwEUARUDFAEVAR0BFAERAQ8BCwEKAQgCBgEIAQMBHQINAQYBCAEGAQQBBgETARUBFgEZAQABGAEFAQMBCwEPAgkBHAEZARABEwISAQ4BFAIVARcBGQENARUBGAETAQ8BDQELAQkBBQIIBAYBBAECAhICFAEZAhcBGQEaAQQBAwEGAQ0BEAEWARkBFQEMAQUBEgEUBhUBCgEVARoBFwERARABDwEIAQYBCgIIAQoBAwEBBAkBGQIcAR4BDQEaARsBBwEDAQIBCwEIARgBFAEKAQYBBAEWARQGEQEMAhIBGwEXARECCQEIAgsBDQELAQEFAgEHARcBHQELAQQBFgEcARgBBAECAQMBDQETAREBCgEIAQkBCwENARUBEgITARABDwEMAQgBDwERARgBFgERAQsBBAICAgMBAgEBBAIBAQESARABAgEFARoBAAEaAQkBBQEQARYCEQELAQoBDAENAQ8BEAIRAQoCDQIIAg0BDwEYAhABCwEBAgIBAwEQAQECDgMVARoBFQESARwBAAMbARACGgEWAREBDQEMAgoBCAEKARMBDQEKAQwDCgEIAgwBDQEVARoBEwEHAQMDBwEEAQICBAEHAhoBHAEbAQAFFwIcARQBEwENAQsDFAELARMBDQEMAwoBCAEEAQMBBgEMAQQCCwEOAQcEEAIHAxQBHAEdAQAIGwEVARMBDwENAgsBGAENARMBCwEMAwUBBAEBAgMBDwEFAQEBAwIHAwkBFQEUARsBGQEVARkBAAofARUBEwEPAwoBEwMLAQgBCwEFAQEFAwENAQcBAQECAQMDBwEVAQ4BHgIADB4BFgETAQ8DCgELARMBCQENAQMBAQECAQEGAwEJAQ4BAwECAQQCBwELAQQBGQEfAQANHAETAQ0CBgEEAhABBAECAQECAgEGAQIBAQECAQMBBQEBAQIBBwIEAQ4CBwIYARkBAA4dAREBDQEGAQICBAEaAQcBAwECAQEBAwETAQUCBAIFAQMBAQEHAQQBBwELAQcBFAEYAR0BHgEADh0BEwELAQUBAgEFAQcBHAEVAQcBAwIEARgBDwEFAQQBBQEEAQkBBwEEAQcDEwEYAR0BHwEADhkBGAEQAQQEHwEbARoBFQESAQcBBAEVAQ0BCgEFAQQBBgEPARcBBwIJARABGwEWARQBHQEADh4BFQERAQ8BDQEVARsBHgEcARoBGAEWARwBGwEcAQ8BDAIKAQwBEwEcARQCGwEYARMBDQEOARwBHwEADR8BGAEVARMBGAEbAR4DGgEYARYBHQEcAhcBDwENAg8BFgEfAR4DGgERARABFAEfAQAPGwEVARIBGQEdAQACHwEcARgBGgEeARkBAAEbAQ8BCwEPAhUBHwEAAh0BGAIWAR0BHwEADx0BFAEQARcBHQEAAh8CGAEXARoBHQEeAR8BGgEYARQBDQETAR8BAAMZARsBGgEZAR0BIAEADh8BGAEWAhoBHAEAAh4BHAIdAR4BHwEgAR0BFgISARkBHQEAAyABHwEYARUCGwEeAQANIAEXARABEgEUAR8BAAMgAx4BAAIcARYCEgIVARwBAAIgAR8BGAEXAhsBIAEADh0EHwEACR4BGwEXAQ0BDgEUAR0BHwEAAiAFHgEADx8DAAsdAhsDHwEABCADACAfBCABABA=",[[13,18,31,1],[6,11,31,0],[30,36,31,0],[19,28,31,1]]],
 watergolem:[46,46,0.837,"d3e2e68eb6cf86acc876a5ca77a1c06a99b86c8ba55b87a7617f9c567f9e5c77954f7b9b4f74914e6f8b4b67834660794458704352693e4b6045485b434452433f48363f51353b4939373f303442342e362a2a362c2226211c231912150e0609","AA8fAh4CHAIaARwJAB0dARwBFwELAQYBDwEUARUBFwMYBRcBGQEbAQAaGwEcARMBEAENAQECBwEPAhIDEwQSARcBFgEZAQAYHwEZARQBDQEEAQEBAgEBAwUEBgELAQcCCQEHAQkBEwEaAQAXHQEUARABCAEGAQICAQICAQMDBAEFAQYEBwITAQAYGwEOAQcBBgEEAwMBAgIDAwQCBQMCAQsBCQETAQAXEQETAQMCBAIBAQIBBAEDAQICAwQCAQMBBAEDAQsCEwEAFwcBAQMCAQQBAQMDAgICAwEGAQECAgEEAgkBCwETAQAXBwECAQECAgEEAQEDBAEDAQICAwEBBAQBAwEJAQsBEwEAFxUCAwMEAQEDBQEDAgIBAwECAQEDAwIJAQsBFwEAFxsCCwEGAQQCAgEHAQMBBAICAQMDAQMCAQMBCQEOARcBABcbAR0BDwEHAQUBBAECARMBBwEEAgEBAgEEAgMBAgQJAQ4BFwEAEx8BIAEbARgBHQEeAREBDgEGAQUBBAEOAQYBBAECAQEBAgEEAgcCBAECAgkBDgEYAR0BHgEdAR8BAA4eARsBFAERAQ8CEgEYARcBBgUFAQICAwEEAQMBCwEPAQYBAwECAQkBDgEZAR0BGwEZAR0BHwEADR8CEwERAQ8CEQEXARkBHAEKAQgCBgIFAQMCBAEFAQYDBQIOARYBGwEVARQBFQIZAR8BAAkRAxcBEwEZAhIEFAEdARIBDwEQAQ4BCQEHAQkBCAEJAQoFCwERARsBFgEVARQCFgEfAgAHGAEaAQkBBwILAQ8BEgERARQBGgEUARMBFQEaAhwCFwETARcBFQEXARMCFwEVARcBGAEbARwBFQEWAhgBGQEUARcBEwISARMBGQEAAxIBBgEBAwIBAwECAQUBBwEaAhMBEAEPAQ4BDAEIAQcBBgEFAQYCDgIRARoBFwETAhcBGAEWAR0CFQEQAQ8BDQMOARkCAAEaAQ8BBQIDAgIBAQEFAQcBCwIaAREBEAEPAg4BDQELAQkBBwEGAQUBCQEGAQ4BEgERBBIBGQEWAREBCwEJAQIBAwMFAQkBEwEbARoBDwEFAQQBAwECAwgCCwIdARMBEAEPAg4BCwEKAQcEDQEOARAFEQESARkBGwEPAQ4BCQEBAQYBCAINAQsBEwEZARgBDwEFAQYBBAECAgMBCAEKAQsCHAETARABDwEeAR0BGAEJAQgCBwIKAQ0BDwETARcBGAERAhMBGQEaAQ4CDQEEAQgDCgELARMBGQEYAQ8BBQMCAQMCCgEMAgkBHAESAQ4CEAEaAQIBCQEOAQoBCAIKARIBFwERARwBHgEQAREBEwEZARoBDgMGAQgDCgITARkBGAEPAQUDBgEFAQIBCgMLARwBEQENAQwBCAERAQEBEQEfAQ8BCgEIAQsBHgIBAQcBEgEPAREBEwEZARoBDgQIAwoCEwEZARgBDwEFAwYDEgERARQBGgEbARABDQEMAwkBHAEaARMCEgEQAREBCQEHAQkBDQEPARABEgEYARkBDQEOAhEBDQEIAgoCEwEZARgBDwEGAwUBBgIQAQ4BDwIaARABDgEKAQwFEQEKAQcBDAEPAQsBBgECAQcBDgEQAREBGAINAg4BEQEOAQgCCgEMARMBGQEYAQ8BCwEKAgYCBQEOBBoBEQEOAQoBCAEKAQwBDQMKAQgBDAEOAgMCBgEMAQ8BEQEWARgBDQIOAQIBCgEIAgoBDAETARkBGAEQAQcBCAEKAQgBBgEFAQ0CDgELARcBEAEPAREBHQEeAQ4BDQMMAQgBDQEOAQ0BCwEDAQkBDwEQAREBGAINAQ4BDwEOAgoCDwEOARMBGwEaAREBCQEKAwgBBgEPAREBEgEXARoBEQEQAQ8BFwESAQ0DEAESARMBEgENAgwCDQEPARABEgEZAhICEwEPAREBDwISARMBGAEcARoBEwERAg0BCAILAhEBBwESARwBEgEQAQ8BDgINAgwBFwIYARMBDwEOAQ0BDAEKAQ8BEQEdARkBFQEUARIBEQECAQgCDQERARIBGAEdARoBFwEJAggBBgEHAgEBEAEPAhUCEAEPAg4BDQEMAgoBDAENAQwBEgEUAQwDEAESARkBEwEPAQYBCwEeAQsBCgMMARABFwEdARwBEQEGBBEBDwEBAREBEwEPARwBHgEUARIBEQEQAQ8BDQEKAgkBDAIQARIBDQEOAQ8BEQETARoBFwEQAQkBCwEdAREBCgMMARABFQEdARwBDgEGBBMBEQEGARIBGAEPAR4CGQEcAR0BHAIaAREBDwEJAQsBEwEXARgBGQEaAxwBHwEeAREBEwEVAR4BFQEIAw0BEQEVAR4BHAESARABBgMTAgsBEgEbARoBIAEYAhwBGgEXARMBEQELAQMBAQIMAQgBEwEcARgCGgEdAR4CGwEZARsCEgEMAQoBDAENARMBGwEAAhoBFQESAQ8BEAEXARQBEwEVARwBHwEeAhkBFAERARABDgENAQUBAQMGAgsBFQEQAQ8BEgEbAR0BHgEfAR4BGwEWAxUBFwEYARoBAAQZAR0BGwIdAR8DHQEaARcBFQEXAR4BGAERAQ8BCQEEAQUBAQEGAw4BEgETARIBGgEdARwBHQIfAx4EHQEACR4BHwEgARkBFQEXAREBEgEOARwBHgEXAREBEgEJAQMBAQEIAQwBDgESAhwBHgEcARcBFAEaARsBHwEgAR8EAAwgAR4BFwESAQ4BBgEIAQ4BGgEbAR4BGgESAQ8BBwECAQ0BDgERARUBHwEdARwBEgERARABEgEYARwBHwEAEB8BFQETARABDwEKAQgBDwEYAhwBHwEcARcBFAQVARkBHwEYARIBDwMQARUBFwEfASABAA8dARICEAEMAg0BEQEXAhoBHgEdAR8BHgUcARkBFwEPAQoBDwERARIBEwEXAR0CAA4gAR8BEwESARABDQEOAQwBEwEYAxoBHAEgAR8BIAIfAhgCFwERAQ0BEQETAhIBFwEbAR8BIAEADh8BFwEUARMBEgEXARABHwEYARoBGAEaARwBIAIAAiABHwEYARcCGAEPARMBHQIZARwBGQEfASABAA4eARYDGQIbAR0BGwEYARoCHAEgAgACIAEfARgBFwIZAR0CGwEdAxkBHwEgAQANHwEeARkBFgYbAR0BGgIcASACAAIgAhkDGwEZARYDFQEZARsBHwIADSABHwEZARUCCwIWARUBFgEdARsDIAIAAyABHgEdARsBGQEUARUBDwIVAhkBHQEgAQANIAEfAR0BFgEVBRYBGwIdAR8BIAEABCACHgEdARYDFAEVARYBGQEbAR4BIAEADh8BHgEbARkBFgMZAhsCHwEgAQAGIAEfAhsBGQQbAR0BGwEfAQAI",[[6,21,40,0],[24,38,40,1]]],
 g_lake:[50,30,0.923,"8ea4b96a8aa8667c994f77a060728c4b6f9649698f4765896f5e624e617c4b597140608540587740526c3e4d644e48523c4558413941353d50543333362e3435374635333d2f272b3a262531202026232d2a191c2614152113151b1319170a10","ACMgBwAqHAEaARkBEgIVARkBGgEgARwBAB8fAR4CAAQgARwBGgESARADEQESARgBFwEYAR0BGgEAFiABAAQgAR4BHAEaAwACGQEfARMBCgILAw0BDgIPAREBFQEZAgATHwEVARwBGwEAAyABGgEQAhQBGQEeAR0BEgEOAQwBBgECAQEBBgIHAQgCCgEPAREBFQEaAQASFQEYARMBDwERARcBHgEaAh0BGQEUBBoBDgEMAQIBAQECAw8BEwEKAQYBBwEIAg0BFQEdAQAQHAEXARMCEQIXAR8BGQEeAhwBGgIZARwBDgEIAQYBAQIEAQIBEwEJAQEBCgEDAQcCCAIWARUBAA8bAREBDwETAREBGwEfARwBFQEXARMBEQITARcBHAEYAQ0BBwEGAQQEHwEQAQUBIAEPAQYCBwEMAQ4BHwEdAQAOGwEOAhMBGAEVARsBEQEPBRYBEwELARcBDQEHAQYDBAIFAQoBIAITAQYDCgIFARQBHAEADhwBEgEVASABEAEPAQ4BDQEMAxYCDQEKARsBDQEIBAcCAQIbAQ8BBAIGAQUCFAEFARQBHQEAByABAAccARkBEAEPAQsBAQIHAx8BCAEEAQoBGwEOAQwBCgELAQoBBgEHAQYBBAECAwECBQEJAxQBHQEABR4BGQEaAR0BIAEABSABEwEKAQEBAwERAggBBgEHARYBBgIIARUBFgELARACCgELAQQBAgEEAgIBCAEWARcBEAEUBBoBAAQeARwBGwESARoBHAEZAQADHQEVAQgBBgEBAQUBGAEKAQgBBAEGARsBBwMTARUBCQEQAwsBBwEEAQYBBAECAQQBBgEIAQsBDgESARwBHgEABCABFwETBBYBHgEgAR0BAAEaARYBBwEEAQIBBgEQAQEBCgECAQoBHwEKAQgCDAERARQBCQEQAQoBCwEMAQcBBgIEBQgBGwEdAQAEIAEXAREBDgMPARMBEQEVAR4CHAETAQYBBAMKARsBBgEIAQoBFgEPAQgBDAEIAQ4BEwEBARABEwEOAQ0BBwEGAwgBDQEOARMBFQEYAQAEHQESAQ8BBwEGAw8BEwEWARABGAMRAQYBBAYGAQwBEQEVAQsBDAEIAgYBDgIRARMBEQEPAQ4BCwEOAQ8BEwEXARUBGQEABR4BEwEIAQQBAQECAQoBEwEWARIBFwILAREBFgEKAQcBBgUHAQgBCwEYARYBCwEIAQYECwERARMBFgESARcCGAEdAR4BGgEABSABEQENAQYBBAEBARcBEQEWARICFQEPAQcBCwEbARcBCgEGBAcBCAIKARMBFQIPAQ0BCAEGAQIBAQEDARMBFgEcASACHgEACB8BCgEHAQYBBAERAQoBAQERAhUBFwEHAQQCBgEfAREBCgEHAQgBDAMIAQ0BCwEOARUBFgERARMCDgEBAQ4BEwERAR0BIAEACh8BDQEHAQgBBwIKAQECCgEaAQ4BBAECAg0BCgIbAQ4BDQEMAQ0BAQMIARMBCgEXAR8BGwERAQsBAwERARMBGwEcAQALIAEWARMBDQITAQcBAQEGAQoBHAEKAQQDAgEGAgsBGwETAQ4BDQECAQEBBgEKAhABGgEcASABEgEZAQUBEgEYAR4BAA0eARcBFgETARcBDQEGAQgBDQEbAREBDQEEAwYBBAENARYBHwEXARMBDgEPAREBFwEVARwBAAIdARwBCQEZAR0BIAEADx4BFQERARUBDgINAQwBGwEcAREBCwEGAQQBBgIIAQYBCgEfBB4BIAIABCABHgEcAQASFQEYARUBEQEPAQ4BDQERARwBFAEBAg0CDAICAQMBEQEKAR4BHwEAHSABGQETAQ8BDQEGAQEBFQEJAgoBDwENAQgBAgEDAhcBHQEAIBkBGgEKAQEBAwERARkBCQIUARcBFQERAQMBEgEdAgAhHAEZARgBEgEZAR8BHAEJAhkBIAIfARsBEAEUAQAjIAEcARoBHAEgARoBFAEJARQBHQEgAhkBGAEcAQApGQEJARkBGgEAAyABACodASACACM="],
 emberslime:[29,38,0.585,"f5cb6cf4c05be8b25aea8e31eb7e21e8771be17b24cd8139df6d19cd7023c95f1cc54716a756219a461d9b3e187742296b3e2a8e2f1378281377391d6d2b16673a2762392557311f5f2c1b4e271a301e16471d1437150e2c120e1d0e0b190907","AA0XAgAaFwEUARYBGQEAGBkBFAETAQwBDwEZAQAXGAEUAQwBBAEPARQBGQEAFxkBDAECAQkBDQEVARgBABUYARQBDAECAQkBEgEVAwAUFgENAQkBAwEJAQ8BFQESAQwBEgEAEhkBEgEMAQsBBAEJAQsBDwESAQoBDwEZAQAQGQESAgwBCQEGAgsBDwIBAQwBEgEAEBUBEgEMAQkBBgIJAQUBBAEMAQQBDAESAQAQFQEPAQkBBgMBAQMBBQEJAQwBEgETAQAQGQESAQsBBQIEAQECBAEJAQwBEgEVAQAQGQEVAQ4BBgEEAQMBAQECAQQBCwEMARMBGQEADxsBGgIPAQ4BBAECAQMCBwESAQ8BGQEADxsBHwEeARwBGgINAQkBCgELAQ0BDgEeARoBGwEADR4BGwEaARgBGgEYAREBEAEOAxcBGAEaAhsDAAkfAR4BHAEYARcBFgEZAREBEAQWARcDGAEaARwBHwEbAQAHGwEdARoBGAEWARcBFgIRARABEQYWARcBGAEZARoBGwIABh0BHAEYARcBFgQRARYBEQEXAQMBEQIWBBcBGAEaAR4BHwEABCABGgEYARcBFgIXARABBwEEAgUBDgEQAhEBFgMPAQUBDQEVARcBHgEfAQADHgEYARYBEQIXAQ4BCwEFAQQCBgELAQ4BEAIRAhQBCwEJAQQBEgEVARoBGwEAAiABHAEZARYDDQEJAQYBBQEHAgUBBgIHAQsBGQEUAQkBBwEKARMBDwETARwBGwIfAR4BHAEZARcBFAEVAQcBBgIOARoBGwEIAQMBBAEHAQkBCgEHAQkBBwEYAQECEgEZAR0BIAIeARwBGQEWARQBCgEGAgUBCAEDAR0BCAIHAwkDBwEbAggBEgEZAR0BIAIeARwBGAEXARQBBwEGAgUBBwEDAR4BHQEKAQQCDQEOAQ0BDgEIAR4BHAEDAQQBFQEcASACHgEcARoBFwEUAQcBBgQKARYBEAEEAQ0BEgENAQwCGgELARQBDQEDAQEBFQEdASACHgEcARoBFwEUAQcBCQEGBAcBBAIPAgwEDwEOAQQBCQEKARwBHQEfASABHgEcARoBGQITAQYECQEHAQQBAQEIARMBDwEOAQ8BEgEaAQgBBAEHAQoBHQEeASABAAEgAR0BGgEZAg4BBgQEAQMBAQMDAwgBDgEDAgQCEwEcAR4BAAIgAR4BGgEZAhUBEgEJAQMBAQICAgEFAwICAQMBBwELARUBHQEeAQADHwEdARoCGQEVAQ0BBAECBAEGAgEDAQQBCgETARwBHgEABR8BHQEaAhkBEwENAQgBAwECAgEEAgEBAQMBBAEOARoBHQEeAQAHHwEeAR0BFQESAQ8BCgMDAQIECgINAhUBHAEfAQAJHwEeARwBEgITAQ0BCwENAQoDCwINARQBHwIeAQAMIAEeARoBFQEcARkBDgENAw4BHQEZAR4BIAEADxsBFAENAR8CHgQgAhUBGgEbAQAPIAEZARABHgEABh8BFwEWARoBABAdARwBAAgfAgAI"],
 lavalizard:[48,30,0.546,"d9ab79b9764b995a3ac94c2770482fc73d21b73d21a140266f3c2ab0321aa0321d92321e7f34216934276037275639278224166c2518582f225b1f164b2c1f46241b461d153f121034271b331f17301a13311610241611260e0c180f0b130807","ACAgAR8BHgQAGR4BHwEACR0CEAIdAR8BGgMZAhoBGQEdASABABUeARcCGQEABx8BFwENARMBFQEdARsBFQETAw8CFgEaARsBGQEADx4CHwIVAR4BEgEOAR8BAAgYAQwBBQEZARMBDwEOAgkDDgEPAhMBHAEZAQANGQEcARsBGgEdARoBBQEJARYBGgEfAQADIAIdAhkBHQEaAQ8CDgIJAQMBAQINAQkDEwEcAR8BAAsbARUBCQEPAQkBEAEaAQMBDQETARkBHwIbAR8BHQQbARwBEwEOAQkCDgEJAQ0BCAMJAxMBFgEZAQAKHwEVARABBQEDAg8CAgEIAQ8BBQEQAR4BHQEWARABEwEWARUBGQEaARMBCQQWAR4BHAEVAQkDDgEPARMBGQEdAQAJHQEVARABBQEDAQUBEwEFAQ0BDgEFARUBHwEZARMCEAEPAQkCGgIOAQkBDAEGAQ0BGAEdAR8BAQEJAQ8CDgEPARUBHQEaAgAHHwEVAhABCQEFAQkBFQEFAQkBEAIZARoBFQETAQ8BEwEJARMBFwEcARoBEgELAQoBAQEEAQIBAQEgAQUBGgETAQ8BDgEPARMCHAEVAQAHIAEWARUBEAIPARABHQEQAQ8BFQEaAg8DEwEFAQIBAwEcAhQBBwIGAQQBBwECAh0BGQINAQoBBwELAQwBCwERAhgBAAYgARYBFQIQAhcBHQEVARABGgEdARoBDwEOAQ8BFgITARQBHgEYARcBEQEGAwcBAgIUAhIBBgQLAgMBAQERARgBAAUgARYBFQMXARoBAwEFARUBHgEWARUBDwEJAQ8BEwEbAQ4BCAESAwwBBwQGAQQDBgUKAgsCEQEYAQAGGQEXARUBFgEVAgUBDwEQAR8BFgETAQ8BDgELAQQBDQEIAQQCBwERAgcBCgMHAQQECwEGAgcBCwIMARECGAEABh0BGwETARYBCQEQARkCHgEgARcBEwENAQYEBAIGAgsBFAEMAQsDBwEGAQQCDAEcARgCHgMYAxoBAAQeAh8BHQEVARYBCQEPARwBHQEfAhQBDQELAQoBBgELAQQBCwEGAQQBBgEHARcBFAEMAQsCCAEHAQYBBAICAgQBBwEIAQcCEgEeAQADHAEUARECEgEXARwBFgEVARwBHgEfARwBGAEMAgoDDAMKAQYCBAIIARMBEgEMAQgBCwUIAgoBCwEUAR0BAAQfARcBEQIMAhIBHAEeAR0BHgEcARYBFQETARIBDQESAQoCCAILAgYDAgEBAgMBBQEOAhICEQENARcBGwEUAhwBAAUXARIBCwEDAQIBCAESAQUBGwEeARYBDwEQAQ8BDQERAQkBGgEUAQoBDAESAQwBDQERAQYBBAEBBAICGgEgAx0CAAggARIBCwEEAQICDAEJARUBHAEWARMBDgEJAQ8BCAEKAQwCEQIXARoBCQEXAREBBgEEAQEEAwEPARQBFwEYAR8BAAoeAREBCAEDAQIBDgENAQgBDQEXARMBFAENAQkBDwENAQoBBgEEAQYCEQEaARwBGAEMAQoBDAECAwUCGAESARQBHgEgAQAKHwEUAREBCAEDAQgBBAEKAQwBGAESAREBCgIMAQoBBwEKAQQCAQEEARgBHAEeARgBFAESAQMBAgEDAQUBFwIRARQBHgEADBcBEgEIAQwBDQEEAQoBEQEcARMBCwEKAgYCCgELAREBAQQYARcCGAEXAQkCDgEVARgBHAEUARgBIAEADB0BEgERAQ0BFAIRAhgBHAERAQoCBwIRARQBBAEHAQQBAQECAREBCwEMARQBFgEeAhgCAAEeAhUBIAEADRwBEgIaARYBCQECAgMBDAELAQoBBwECAhQBDQERAQICDQISARQBGAEeAQAXHQIcAREBAwEBAgIBFAEMAQQBAQMCARwBDgEIAQMBDgEUAR4CABoZAREBCAEDAQEBAwEJARcBDQEIAQECAgEXAR0DGQEAHSABHAERARIBDQEJAQMBEwEfAR4BEgEMAREBEgEYARwBHwEAIB8BHgEgAR4CGAEeASACHwEWAREBBAEJARUBHgEAISABAAgZARQBBwEJAR0BACwXARgBHAEAHg==",[[20,26,22,0],[3,10,23,0],[11,19,24,1]]],
 ashbat:[40,34,0.49,"d3a87abb885ca76f48866a59795d517c5a476d56476a53447846326a4b3d644f4363493a5d493d5a4538594133554135563b2f4e3b2f4f35293f38283f30243a261e31261d321d182c1b13251c122216121f110c19100c1709090d0605","ACIXARgBFgEXAQAiFwEbARUBCAEFARUBFAEAIBoBFAEIAQUDBwESARcBAB4aARIBBwEEAQUBBAEFAg0BFAEAFRoBFgEABhsBEgERAQIBBQUHARcBABIeARUCFAESARcBFAEdAQADGgEMAQQCCwEFBAcBFwEAERQCGgEcARIBEAEYARsBGgEVAQABFAEXAQcBBAEFAwQBBQIQARcBAA4cARkBGgEXARUBEAEOAxIDHQIXARoBBwEFAQcCBAIFAQcBEwEWAQANFQIWARkBFQINAQwBCwEFAg0BDgEPARUBGwEUAQcDCwEEAgUBDQETARQBAAwVAQ8BBQEJAhMBDAENAQsBCAEFAQQBCAIPARIBFQIIAQcCCAEHAQUBBwEQARYBAAwbARUBEwERAQkBEQEKAQsCCAEHAQgBBAECAQUBCgEOAREBGwEVAQgBBwEGAQMBEQELARABEwEUAQAMGwEUARkBGAEQAQgDBwIIAQsBBQEEAgoBEwEUARkBCgEJAQIBAwEJAQwBDwESARkBAAEeAxwDAAYaARsBEwENAQsBCAISAg4BDQEHAgoBDwERAQwBGAERAQkBAgEDAhEBEwEYAR4BGQEYARYCFQMXAQAFGgIPAQwBCwEIAhkBHQEXAQEBDAEIAQoBDAEOAQkBFgETAREBCQEGAQkBEwEYARkBAAEcAREBDQILAQUBBAELARYBGAEAAxwBFgEOAQwBCwEKARsBAgIeARUBBQEIAQoCDAEJAQEBBgEWAQkDEwEYARsBAAIbARIBDQELAwQBBQEOARcBAAEaARsBEAEOAQwBCgEHARkBAwEQAR0BEAEEAQoBCQEGAQICAQICARECEwEWARwBHgEAAhoBEwELAQ0CCwIEAhcDGQERAg4BCwEIAREBAQEKARUBEwEEAQkBBgEBAQIBAwEGAQIBAwETAQkBHAEdAR4BAAQaARUBEAELAgcBCwEKAQIBHQEaARUBFAETAREBDwEMAQoCCQMDAQIBBgEBAQIBCQETAQMCEQEYAR8CAAUaARcBEAENAQsBDgETAQ4BEwESARABDQEVARQBEQEQAQ8BDAMJAQMBAQITAREBAwERAQkBEQETAhsBHwEABhsBFgENAhIBFwESAREBDwEOARMBDAEVAhIBEAMOAgMBAQQHARgBCQQYAR0BAAgXAQ4BEAEWAREBDQEQARUBEQIVARMBDAEQARMCEQESAQMBAgEBBAIBDAEGAQMCCQEXAQAJGgEVARYBFAERARACFgMMAQgCBQEMARABEQIGAgECAgIDAgYBEQEVARcBAAodARgDFQERAhkBGAETAQ0BDAEIAQ0BDwEMAg8BEwEGAQMBCQEFAQQBBwEYAR4CHQEADB4BHQEcARkBGAEbARwBGAESAQ4BCwIVAQ4BCgIHAQkBAQMCAQQBEQEeAR8BABIeAxcBEwEQAQsBDgEVAQ8BCgEFAQQBAwIBAwMBCAEbARwBABQfARgBFAEQAQcBAwEVAREBCgEJARYBBwEBAwIBBgEYARsBABYdARgBEAEPAQMBDwEVAQkBAQEPAQUBAQIDAQ8BGAEeAQAWHwEcARMBGAEXAREBEwEYAQwBBgEYARIBDgEMARMBHQEfAQAYHQEVARsBHgEfAh0BEwIfAR4BHQEcARYBHAEfAQAYGgEcARUBGAEfARUBGwEfAR0BHwEdARwCGAEcAR8BABgeAhUCHAESARoBHgEdAR8BGgEdARwBGQEaAgAZHgEXARoBHAEAARoBGQERARwBAAIaARgBBwEdAQAaHgEABBgBEQEZAQACGgIZAR0BACAfAgAEHwEADg=="],
 obsidiancrab:[50,36,0.675,"cbcede9697b9827ea16f698966586e634d695b4c5e5e4865584959573f62523e514c3d484c3850463547423342412d3f3a2d363928322f282a2d22263721312e1e2727181f241b1c2213191c1414180f12180c0f15080d0d0808090205","ABgRAQAwBgECAQ0BAC4FAQIBAQEDAQQBACwFAQIBAQIDAQQBDwEAJxgBFAETAgUBAgEBAgIBAwELAREBAAEbARgBFAEAIRIBDAIPARMBBAECAQECAgEDAQcBFAETARIBFQESARkBABYeAwAGEwENAQMBAgEPARMBBAECAQECAgEDAQcBFgEOAQcBBQELAhMBAAYdAR8CAAoYARsBHQIbARMBAAUUAQQBAwEBAQUBEwEEAQIBAQICAQMBBwEKAQMCBAEKAQsBFwEABBgBGgEUARMBGAIcAQAHHQEbAQ8BDAELAQwBFwEYAQAEDgEDAQIBAQEDAREBBAEDAQECAgEEAQcBBAEBAQIBBAEKAQsBFwEAAxgCEwEJAQwCEQESARgBAAUaARQBDwELAQkBAwIGARUBGAEAAw8BAwECAQEBAgEMAQQBAwEBAgIBAwEHAQIBAQEDAQcBCwEOARgBAAIbARoBEQELAQMBAQEGAQsBDAETARQBAAMUARgBEQELAQUBCQECAQMBBQEHAREBGAEAAg4BBQEDAQECBQEHAQMBAQMEAQMBAQIDAQ4BFwEYAQADGgEYAQwBCQEEAQMBBQEHAQsBDAEWARsBAAIaARIBDwEJAQUBCQIFAgsBDgEbAQADCgEDAQIBAQEHAQoBAwECAgEBDgECAQECAwEPARkBGwEAAxoBDAELAQkBBgEHAQwBCwMRARMBAAEaARgBEwERAQwDDwESAQ4BCwIaAQADEQEEAQICFAEaAR0BGAEBARMBGQICAgMBFgEYAQADHwEcAQ8BDAIJAhQBDwEJAQ4CFwEfAR4BGQEXARUBDgEJAQ8BHQEXAREBDgEMARsBAAMbARgBFAEPARgBGgEYARYBFQISARUBBwEVARcBHQIaAQACHgEbARMBEgEPAwQBDAEPARIBDgEZAR8BHQESAQsCBQEEAQsBEwEFAhEBFgEdAQACGAEdARcBEgEPAgkBDAELAg0BCwEOARABEQEWARgBHQEYARoBAAEYARsBEQEIAQQBCwEEAQIBAwERARYBEQEaAR8BGwELAQQBAwMEAQsBBQEEAQoBGQEYARQBGAEWARUBEQIOAQIBAwEKAQgECgENAQ4BDwERARIBFQEZARoBDwEZAQsBAwEEAQYBAwECAgQCBgETAR4BAAERAQQBAQMCAQQBBQEEAQUBFwEMARgBEwESAhEBDgEMAgcBCAIGAwUBCgENAQ4BEAEOARUBFwEYARkBFwERAQMBBgEFAQQBAgMDAREBGAEAAhgBBwEDAQEDAwEFAQkBDgEXARoBEwEOARADFgESAREBCwEKAQgGDQERARcBFgEZARMBFwEZARQBAwEOAQsBBAEDAQIBAQEDAQUBDwEABREBBQEDAgQBFQESAREBEgIOAQ0CDgEMAR0BCwEBAQcBDgEKAQgECwEPARQBBwEXARsBAwEOAQsBDgEWARIBEwEMAQkBCwENAQ8BGAEABwwBGQEYARkBGwEUAhgBEAENBBEBGQEJAQMBBQENAQoCCAIKAhgBCQEBARUBFAEFAQwBCwIXARYBFwEcAR4BHAEaAQAOHQEaARYBEQENAQoCDgEFAgwBCwEFAQoHCAEEAQgBBwEJAwoBDQEWARoBFAEPAgAPHAIbARUBEAEOAQoBCAEOAQYCCAIGAQgBCgYIAQUBCAIKBA0BEgEcARsBEgEMARMBAAwYAhMBGwIVARABDQIOAQsBCgEGAggBCgcIAgYBEgIGAQgBCgINARABHQEWAREBEgEXARQBAAoYAQ8BCQELAQ8BHQEVARABDgMNAQoBBgEIAhEBHQEeAh8EFAEHARYBCQEIAQoDEQEWARsBCwENAgsBFgEZAQAIEQEOAQkBDgEWAh4BGwEWAQ4BDQEQAQ4BEAEaARgBHgEbARYBEgERBBIBHAEWAQ4BCgQOARABHQEeARsBGQEXAREBDgERARoBAAYYARUBCwEOARUBFgEaAR4BGwEVARABDgINAhwBGgEWAQsBCAIGAggBCgILARYCCgINAQ4BEAEVARwBGAEUARgDDgEMARQBAAUcARcBDgERARYBEQEOAQkBDwEZARcBEAIOAxYBHAEOAQoBCAEGBxUBHAEOAhABEQEWAR4BFAEJAgcBGAEZARYBCQEaAR8BAAQaARsBDAEXARMBDwILAQwBGwEfARcBEQIQAREBFQEQAQ0CCgIIAQYBCgENAQoBDQIRARUDFgEZARwBGQERAQ8CFAEOARYBDAESARoBAAMdARcBCQEPAREBFgEPARgCHgEfAh4BGwEXARkBHQEbARABDQIOAQ0BCgIOBBUBHQEbARYBFwEeAQwBEwESARoBGAEFARgBFQEOAQsBDAEZAR4BAAMZARMBEQEUARkBDAETARoBGAERARMBDwEeARwBCwEPAR0BGQESARADDQIOARABFQEWAREBDgEZAR8CGwEZAQkBBwEZARgBDwEAARMBEgIXARgBAAQcAR0BGAEcARsBHQEeAQABHwETAQsBEgEcAQkBBgEPAR8BHgEXARUBEgQVAREBGwEdARUBEAEVAR4BGwEaARwBGQIRARMBHQEAAR8BHQEaARsBAAYeAR8BAAUbAQ8CGgERAQYBCAERAR4BHwEdARwBGgEZAxsBHAEeAR0BFQEOAQ8BHAEAAxMBEgIXAR4BAAIeAR0BAA4XAQwBEgEXARYBDgELAREBHwEAAh4BAAcdAREBBwETARsBHQEAAh4BHQEeAR8BABMdARoBFwEbARIBDwEXARIBHwEACxwBDgIJARMBAAMeAQAYHQEYAQYBGQEdAQANFwEJARYBHQEAHR4CHwEADx0CABA=",[[2,8,30,0],[43,46,30,0],[37,41,31,1],[10,18,32,1],[29,34,32,0]]],
 volsheep:[47,48,0.629,"e0b16fd77c2aaf7c4f826449c356179d623574533d614f4189401c6a48335f483957483d553c2d5442374d3e334d372b5b321f4d2f2247362b422e233b2a212e271c39251b2c1f18361d17291c152615111c1410190d0c120d090f0807060102","AB4JAgUBAgIJAREBCQERAgAkEQEFAgIDBQEJAwUBEQEAIwkBBQICAQEBAgEFAQkCBQECAQUBCQEAIgkBBQICAgEBBQEJAQUBAgIFAQkBACIJAQUCAgMFAgIDBQEJAREBACERAQUCAggFAQkBEQEAHh8CFwERAQUCAgMBAgICBQEJAhEBAB0fARwBGwEaAREBBQICAwECAgEFAgkBEQEAHh8BGwENARUBGQEJAQUDAgIBAQIBBQIRARQBAB4aARsBFAEQARoBGwEGAREBFwEJAQIBAQECAQkCEgEAHx0CFwERARABFAEZARcBEQIJAQIBCQEZARwBGAEAHhgCFQETARQBDQIQAQsBDQERARQBAgEJAQ0BFQEaARsBABwWARcBDwEIAhUBDQIOAQsCBwEGAgUBCQEOARMBGAEcAQAZHQEZARcBFQEXAg8BDAEUAQgFCgEGAQUBBgELAQ4BEAEbARoBABcdARQBEQMGAQMBFQEQAQgFBwMJAgsBDAEOARUBFAEAFx8BEwESAREBCwEJAQYBEQEIBwECCgIMAggCFwEYAQAXFgEeARgBFAEXARQBEwEMAQgDDAETARsBAwEBAgoBDAEIAQcCDgEaAR4BAAQeAR8BHAEAChwBIAQcAh4BFAETAQ8BCAQUARwBGwEBAQQBAwEBAQQBCAIHAQ4BGgEcAQAEHAEUARABFQEWAQAGHQEWARwBGwEaAhsCHQEfAR0BFAEPAQgFGwEMARwBEwEYAQwBAQIIAQwBBwEaAQ4BFgEAAxoBFQEIAQcBEAEWAgADHQEVARoBGAEWARUBDwEUARUBFgEaAR8BFgETARABDAEIAQwBCAIcAQEBDAEdARwBGQEBAgQBBwEEARwBEwEbAQACHAEaAQ4BCAEEAQgBFQEWAQACFgEcARoBEwEPARMBFAEOAQ8BFAEXAhsBFQETAg8BDAEIAwcBAwEYARoBGAEVAQECAwQUARwBAAIaARkBEAEIAhQBCAEaAhwCFQEUAQ8BDAEPARABEwEVBBQBGAETARQBEwEOAQwBCAUMAQcBCQECBQUBCQIaAQABHwEVARQBCAEVARMBCgEYARMBHgEWARQBDwEEAQwBDgEPARACFAEVAhQBHgEbARQCEwEMAQgDDAIIAQcBAwECAQMCBgEVAREBCQIbAR8CGQETAQ4BFQEUAQoBFwEeARYBFAIOAQQBDgEMARABDwITARUBFwEVARwBGAEZARUBEwEPAQwCCAIMAgYBAwQGAQ0BGgEJAhsBHwEdARkBFwEVAQgBAwISAR4BFQEIAQwBDwETAQ4DDwITARUBCwERARQBIAEbARUBFAEPAQwBCAMMAQ4BBAEDBQYBCgECAQYBGQEdAQABGQEPAQcBCAELAQkBFwEPAQwCBAEIAQ8CDAITARABDwETAREBCQERARsBHgEWARMCDAEIAgMCFwEHAgQBBgIEAgoBBAERARsBAAIdAQwBCAEEAhQBGAETAQ4BDAEIARUBEwEPAQwBDwEXAQ4CCgERAQkBEQESARcBHAEYARUBDwEEAQMBAgEDAQcBEAEUARIBDQIRARkBEQEQARcBAAQaARUBBAEHARIBGAEQAQ4BDAQYAQ4CDAEOAQwBCgEJAQYBEQENARABDQEYARYBFAEDBQQBBwELAREBFAEZARoBEgEcAQAGFgEVARoBGwEZARABDgEMAg4BDAEVAQ8CDgEMAggBCQEGAQsBDQMUARwBFQEEBgcCCgIRARsBHQEACR4CFgETAQ4BDAIOAQ8BGQETAQ8BDgEMAgsBAgEFAQYBFwENAgsBEAEHAQMBBAIHAQsBFQEbARwBHgEXARkBAAwgARcBEAETAQ4DEwEaARQBDwIMAQ4BCQECAwoBGAEQAQ0CDAEEAQIBBgEHAhgBHQEfASABAA4gARUBEwIPAQwBDgEPARkCFAENAREBBgEFAQIEBgEZARcBFAETAQcBAwEBAQQBBwESARQBHwEgAQAOHwEVARMCDgEIAQwBDQEGARkBGwECAQUBAgYDAhIBGAEUARABCwEEAQMBBwERARsBHwIADxUCEAEOAQgBCgIJAQYBAQMCBwoBAwEEARYBFQIUAQsBFQEYAR0BHgEfAQAPHwEYARMBCwEEAQYCEQEDAQEEBgIJAQIDBgEBAQMBBwEaARUBFAEQARcBHQIfAQARGwENAQkBBgECAhcBBwECAQEDBAIGAQIDBgEEAQMBAQEbAQQBDQEQARkBHQEeAQASHQEKAQkBAgMZAQ0BCgEDAQECAwERAQkBAgMGAQ0BCAEBAQMDGQEcAh4BABEfARwBEQEJAxEBHwEVAQ0CBwIEARkBCQEGAwkBFAIGAhEBGAEXARoBIAEAEh8BFwERBBkBHwEdARsBFQERARICGwEJAwYBCQEXAhEBEgEbARcBFQIfAQARHwIXARQBEgEVAR0BHgIYARQCHgEfAxEBCwEJAQYBCQEbAR8BHgEcARkBFQIaASABABEgAR8BGQEXARQBGgEeAQABHwEYARUCHwEgAQABHgEcARYBCwIUAR4BAAIeARwBFwIdASABABEgAR8BGQESAhgBHgEAAR4BGwEWAh0BIAEAASABHgEWAQ0BFAEXAR8BAAIeAR0BGgEXARwBIAEAESABHwEZARABCwEZARwBAAIeARsCGgEdAQABIAEdARYBEAEVARcBHwEAAh8BHAEaARcCHAEAEhYBHAEQAQsBEgEXAR4BAAIfAR0BHAEfAQACHQEWARgBFgEXAR8BAAMeARwBFAENAREBHgEAERoBHwEUAREBFQEbASABAAMfAgADHAEYAhICGQEcAQACIAEeARkBEQIfASABABEfASABHwMACRwBGgEXAQsCEgEfASABAAIeASACHwEeAQATIAMACx0BGAEZARcBGAEaARwBAAMgAwAjHAEfAyABABI=",[[14,19,40,1],[6,13,40,0],[30,37,40,0],[21,29,40,1]]],
 flamewisp:[27,42,0.564,"fbe8aff9e0a2f8d48af5bf62f3ac4ae79b43f0952ff08927e88123c57f3de5771fd36c1ce06b19d26016b95d1cca5613b44914a14e1b8b4d228e3f16a23a0e823d19922e0b7e3210684a29633a1d51311d682f155f230e4a23133520141c0e09","AA8bARYBFQIAEhgBFwIYAhkBFgEQAhcBGAEADxgBEAEMAREBFwEWARQBDAEGAQUBEQEXAQAOFgEVAQYBBQEMAREBEgEMAQ0BBgEIARUBFwEADRgBFQEOAQYBBAEOARABDQEJAQsBDQIRARcBAA0YARUBDgELAQ0DCAEDAQgBDQEOAREBFwEADRgBFQEOAQkBCwEQAQ0BBQEEAQkBDQEOARUBFwEADRwBFQEOAQgEAQEHAQsBDQEQAREBFwEADR0BFQEOAQgBBAEDAQgBBgEIAQ0BDgEVAhgBAA4YARUBCwECAQQBCwEQAQ0BEAEVARwBGwEADxoBFgEOAQUBCQIQAhUBFAEZARsBAA8bARkBDwEIAQkBBwEOAREBGQIaAQAQGwEZARMCDwEFAQgBFAEZAwABGwETAQALHgIbAhkBFAERAQUCDAETARkEEgEYAQAJHwEdARoBGwEcARQBDwEJAQUBBAEIAQwBDwESARkBEwESAQAKGgEdARsBFAESAgwBCAEFAQQBBQEHAQ4BDQESARYBGQEAChsBFgESAQ8CEAELAQkBBQEEAQUBBwEJARIBFAEWARkBGwIABx4BHAEUAQ8BCAILAgkBBQIHAggBEQEPARIBGQIaARcBHQEABB4BHAEXARUBEQEMAQgBCQIIAQUCBwIIAQ0CDwESAQ8BFgEXAR0BAAMeARwBGAEPAREBDgELAQgBBQEIAgMBBQIHAggBCwIMARABDwEaARsBAAMaARgBEQELAQ0BCAEHAQUBBAEFAQQBAQMDAQkBBQIHAQsBEAEVARkBGwEAAh8BFgEVAggBBwIFAQQBAwECAQEDAgIIAQICBQEIAQkBDgEUARsBAAIfARwBFwEJAQgBBwEFAQYBCgEBBQIFBQEIAQsBDgEUARsBAAIaARgBFQEJAQUBBwEKARkBGwECAQEFAgITARkBCgEHAQkBDQEXARkBGgEdARQBFwEQAQsBCAEFARsBHwEKAR8BAwEBBAIBCgEfAQoBGwEFAQsBEAEPAREBHQIUAhABCwEJAQwBCgEbAQoBHwEEAQIBAQICAhkBHwEKAgUBDQEOAhEBHQIWARQBDwEMAQsBBgEDARsDAwECBRkBGwEfAQIBBQELARABEQEVAR0BHgEYARQBEQEMAQsBBQECARgBHgETAQMBAgUKARsBHQECAQUBDQEQARQBHAEfAR4BGAEPAg4BDQEEAQMBBAIDAwQBCgEDAwUBBgIJAQwCFgEbAR8BEgEPAQYBBQEPARABDAIFAQMDAgEFAQYBAwEEAgUBBwELAQwBDgEJAQYBEwEAARkBGAEMAhEDDgEJAQQBAwESARMBBQEEAQoBGQEEAQUCCAEMAREBBgIPARsBAAEfARwBFwEQARUBEAIVAQkBBQEGARwEDwEFAgcBCQESAQ8BHAETAR0BHwEAAxIBHgEUAREBEAELAQcBBQIHAwgCCQEMARIBFAEeARwBGgIbAQAFHwIdARQBEAEJAggBBwMJAQ8BDAEPARQBHQEfARoBGQEbAQAGHwIWARgBDwEUAhIBDwEJAQwBEgEWARgBHAEeAR0BHgEZAQAIIAEZAQkBBQECARgBFgEUAhIBFAIYAQoBAwEeARIBFgEfAQAIIAEZARIBBQEEARQBIAEfAR4EFgEEAQMBHAEZARwBHwEACSABFAIJARQBIAYYAQYBDwEcAR4BIAEACiABHgEfARQBEgEdASABAAMgARYBCgETAR0BHwEADCABGgEPAQwBEgEdAQADIAEUAQUBEgEcASABAA0eARgBDwEgAQAEIAEeARMBEgEfAQAPIAIABiABHwEeAQAI"],
 magmagolem:[49,53,0.756,"d27a2499592c6550418149285f493b5b4b3d5b473957473a653c27573e305240355236284d3c314b382d4a352945352b4f2b1d452d21412f263d291f39261d37231a2b20172f1e162c191324110d1e110d19100c1b0c0a1708060e09060b0302","ABAcARsFHQEbBBoBGwEZAxoBAB4cARkBFQESAhQCFQMUBhUCGAEdAQAcHwEWARgBDAEKAQUCBwEIAQUBDwESAQwGDwESARYBFwEAGhkBFwEYAQMBBAEBAgMPFgEZAQAZHQEYAQwBAwIEAgMLBQEIAhABDgEaAR4BABgeARgBDQEIAQUCBAIDCgUBCAELARACGgEeAQAYHgEYAQ0BCwEFAQoBBAEBAQQBAwcEAQIBBAEKAQsBEAIdAR4BABgeARgBDQEKAQUBBAEBAwQBAwUEAgECCgELAQ4BDwEdAR4BABgeARgBCwEIAQUBAgEBAwQBAwQEAQEEBQELAQ0BDgEaAR4BABgdARYBCAEHAQUBAQQEAQMEBAEBBAQBCAELAQ0BGgEeAQAYGwEUAQcBBQEDAQQBAQICAQUCBgEFAgoBAQQEAQgBCwENARoBHgEAGBoBFAEFAgMBBAECAQEBBAEGBAcBCgEJAQECBAEFAQgBCwEOARoBHgEAGB0BFQEFAgMCBAIKAQYEBwEIAgkCBAEKAQsCDgEdASABABUbARkBGgEbARgBCgEHAQMEBQEGBAcCCAEHAQUBBwILAQ0BDgEeASABABQXARkBEwIXARgBFQENAQcBCAEFAQMBBQEGBQcDBQENAQsCDQEOAR0CIAEYARsBHwEADx4BFAELAQUBAwEPARQBGQEVAwsBBwEGCAgBDQQTAh0BGAEWARUBGQEcARsBAAoeAhwBFwEeARMBCgEFAgcBDQEgARkCFQEUARMBCwIHAQUDBwINARABDgEQAQ0BGQIXARIBCgINARIBHgEgAQAIEwEYAhcCGwIPAQ4BEAEVARgCGwEgBB4CGAkeAR0BGwEOAQUBAwEHARIBGAIfAgAHFwEVAQoBBQEDAggBFwEZAhQCEAELAQgBCwEVAQ4BCwMNAg4BEAETARQBGAIVAg0BCgIPARIBFAIaAxsBHgEfAhsBAAIXARQBBQEEAQIDAwECARgBGQEYARMBEAENAQgCDgELAQMDAgQDAxQCEwEOAxMBFAIYARoBGAEMAw8BEgEXARwBAAEdAQ8BDAEBAQQBAwICAQMBDQEXAR4BFAITAhABDgENAQsBCAEDBAIBAwEIAQsBEwEUARMDDgETARQBGQIKAQcBBAECAQQBBQEKAQUBCgEXAR0BDAEEAQEBBAEGAQgBAwEQAQ4BGQEgARQBEwEQAQ4DDwENAQgBBgEDBAgBCwEOARABEwQPARABFQEeAQ8BBQEDAQICBAEDAgIBDAEbAR0BDAECAQQBBQEIAgMBDwEOARkBIAEVARABDgIfARgBGQEFAQsBCAEGAgMCCAENARACHAEfARsBEwEQAhYBHwEYAQcBBQIDAQIBCgIHARIBGwEdAQwBAwEFAQcBCAIDAQ4BEAEXAR8BFAEQAQ0CGAEEAhQBEgEIAQYEDgEQARsCDgETARQBEAITARkBGwEWAQsBCAEGAQQBAgEFAQ0CEwEaAR0BDwEHAQgBBgEHAQgBAwEPARABFwEeARQBDgENAQoBBQIEARQCDQEGBBcBHwEZAQ8BDQMOARABFAEeARQBDgENAQsBBwEEAgcBDgENARMBGQEdARABCgEIAQcCCAEDARACFgEZARQBEAENAQsBBQEDAQUBAwEVARkBEwEPARsBGAEVARABDgELAQoBCAEKAg4BFAEeARMBEAENAQsBBwMFAQ0CEwEZAR0BDwEKAQcCCAEGAQMBDgIUAgQBAgEJAQQBAgIFAQYBCwEIAw4BFgELAQ4BAgQEAgwBFAEeARMBDwENAQsBCAMHAQ0CEwEZAR0BEAEKAgsBBwEGAQMBDgIQARQBBAEBBQUBBgUIAgsBDgEBBgkBFAEgARMBDwEOAQsBCAELAQgCEAETARQBGQEdARABCgEMAQ0BCwEGAQMBDgITARsBGAEEAQECBAIFAQYFCAILAQ0BBAIBAxICFgEgARMBEAEPAQsBCAELAQgCFAEWARkBGwIQAQ4CDQEQAQgBDQESAQwBFAEcARYBEgECAg0BCwEHAQgFCwINAQ4BDwESAQEBBAEPARABFAEYASABFAEQAhMBEAETAhQBGAEXARsBHQEbARMBDwEQAw8BAgEEAQkBFAEbARYBEgECAQQBCgEOAQwBGQEaARwBGwEdAx4BIAEVARIBAQEEAQ8BEAEVARcBIAEVARMCEAELAQgBCwEXARECGAEdARsBEwEQARMCDAEKAQQBAgEEAQkBGQEVARIBCgQSAQ8BDAMPARABDwEOAg8CAQEJAQ4BEAEVARkBGwERAgkBDAELAQ0BDgEPAQkBAQEJAR0CEgIMAQQBCQEEAQoBBAMRARYBEgEPAQ0BCgEMAQQCCgQMAg0BDgIMAQoBDAENAQ8BFgEbAQEEBAELAQ0CDAERAQkBEQEdAR4BEgEEAgIBDAEKARkBEgEJARIBFgEbARQBEwEQAQ8BDAERAQIBAQYPAQwCDQIOAxUBGgECAQECBAEJAQoBDQEOAQ8BDAERAh4BHwESAQoBBQEKAhABGQEYAREBFAIcARsCGQEVARICCQEBBg8CDgIPARIBEwIYAhkBAgEBAREBEgEMAQ4BEAIKARYBEQEeAQABFQESAQoCCAEQARsBGAEUARkBGwEdARcCGgEZAxcBCQEBAhECCQEKARQCDwESAhMBFgEaARsBHQEEAQIBGAEaARIBFAMSARgBGQEAAh8BGgEUAQsBDQETARcBGQIaAR8BHgEXAxQBEgEMAQoBAgEBAhQCFQEWARwCGgEbAR4BGwIeAh0BEQEEARQBGwEWARQBEwIZARwBAAUaARsBHAEeAh8BIAEZARgBFQEWAR8BHAEVARICCgECAQECBAEHAQsBDQEQARMBFAIXAR4BGQEYARcBGQEcARsBHQIeAR8DIAEABxwCHwEbAR0BGQESAgwCFgEQARkBGAESAQwBBAEBAgQBCgENAQ8BEwEUARUBGQEdARoBDAEYARYBGAMdAR8BHAEfASABAAwgAR4BFgESAQwBCgEMAhIBGwEdARgBEgEKAQECDAENAQ4BEAETARYBGwEcARsBEgEEAQwCEgEVARgBHAEeAR8BAA4UARkBFAEPAQwBAgEKAhIBFgEZAR0BGAICAg8BEgETARQBFwEcARsBHQESAQoBBAIKAQwBEgEUARkBDQEbAQAOHgEUARICCQEEAgoBFQEWAh0CGAERAhYBGAMZARwBFAESAQwBCgEFAQQBCgEMARQCFgEZARcBAA4gARUBEgIJAgoBFAEXARYBGAEaARsBHgEdAR4BIAMfARsBGAERAQwBEgEMAQoBBAEFARUCFgEYASACAA4gARgBEwEQAQwBCgIVARYBGAQdAR4BIAEAAyABGAEUAREBCQEMARIBDAEKARIBFwEWAhgBIAIADhkBGAETARABEwEPAQcBFAEVARECGAIZAR4BIAEAAyABGQEUARIBBAEMARgBFAEVARYBGQIYAh4BIAEADSABGAEUARMCGQIQARkBFgERARQBFgMdASABAAMfAhkBGAQaARIBHAEeARwBGQEWARoBGwEADSABFgEVARwCGgEXARkBGAEWARIBFAEVAhYBHAEgAQAEIAEZARcCGAMUAhUBFAEYARkBFgEZAR8BAAwgARgCCQERAQQCCgEYARYBFAIVARgCHwEgAQAEIAEZARgBFwEYARIBDAERAgwBEgMUARgBHwEADCABGAESAQQDCgELAQ0BEgIYARkCGgEgAgAEIAEZARgCFQEMAgQBAQEEARICFAEWARkBHwEADCABGAEUAQwBBAEJAQoBCwIOARgBFAEbASADAAUgARgBFgEUARIBDAIJAQQBCQESARQBFgEYAR0BIAEADRwCGAEMAREBDAEOAQ8BEAEYARYBHQEgAR8BHAEABhkBGwEaARQBDAIRAxQBFgEZAR4BHAEADxsCFwIYAxkBGwIdASABHwEACB8BGgEbARgDGQIbARwBHwEgAQARIAEfAyAGAAwgAh8EIAIACg==",[[6,22,43,0],[26,42,43,1]]],
 sulfurbeetle:[40,38,0.583,"eddea0dfc876cdb57bd3b03fc7a344caa02cbc9c45b38e309d8b768c795b9975358b6b2b806b467e62338861298059286f5d4172542a704d25654b305c42285042305938224d372545301f41291a31261b3722152d1c142919111b120c1d0c0a","ABwJAgACFgEJAQoBACAUAQEBCQEWAwoBAwEJAQAfCQEDAQEBCgEWAREBCgEBAQkBEQEAHQoBCQEDAQEBAwERAgkBAQIJAQoBABwKAQkBAwEBAhECCQEBAgkBCgEAHAoBCQEDAQECEQIJAQECCQEKAQAXHgIAAwoBCQEDAQEBAwEWAREBCQEBAgkBCgEAFhsBDQEZAQADFgERAQkDFAIKAQkCCgEAEB8BHgIfAyABHwEKARYBAAMYARQBCgEJAREBGgIKAQkBCgEZAQANHQEeARwBFwIVARcDGgEdARsBGQEbAQACGwEWAQ0BCQEZAhoBEQMADRgCFQETARIBEAESAxQBGgEfAR0DHgMWAREBCQEZAhoBCgERARsBAAsfARoBGQEVAQ8CDAEPARACFQEdARoBFQETAhcBGgEdAR4BFgEUAREBEgELARMBFQEZAgAHHwEAAh4BHQEXARIBDgILAQIBDAEQARIBGAEZARIBEAMTARkBHQESAg4CCwMTARkBGwIABR8BHQEfAR4BHQEYARQBDgISAQ4BDwIQARUBHAESAQwDDwEQARMBGQEPAQwBCwEIAwsBDAEOARgBGgEbAQAEIAEbARgBHQEZARUBFAESARMBEgEQAQ4CEwEaARMBDwELAQUBBwEPARIBFAETAQwBCwMIAQoBAQEJAQ0BCQIdAQAFHgIdARkBFwEVARQBEwESAhACFwEeARABDAEBAw8BHAEaARABDwELBA0BAwIYAREBCQEZARsBAAMeAhoBGQIXARoBEwEaARkBGAEVAxoBCwEFAQECAgEGAQ8BGgESARABEgELAxABGAEDARYBGAEVAh4BAAIZARgBHgEVBBwBGgEdARwBGQEaARwBGQEcAQgBAQMCAgwBGQETARABGQEOAQsBDAEPAQ4BFQIYARIBFAEaAQABHgEdARoBHAEYARQBFQEaARABCAEGBBABHQIIAQQBAgMEAQcBGAESARABDAcSARABDAEQARUBHgEdARgBHQEZAhcBFQEPAQgBBgEEAQYBAgEHARcBHAEdAQcBAgIBAQIBBAIHARIBDAEPAQwHDwEMAQ8BEgEeAR8BGQEdARkCHAEXAQYCBAEBAgIBBgEMAR0BGgEIAQQBAgIEAwgBFwEQAQwFDQEOAQ0BCgEMARABFwEeASABGgEfARkBGwETAQ8BBAMBAgQBAgEEARwBBAEXAQgBAgIEAwgBFwEQAQwDDgEWARUBFAERAQ4BFwEVAR0BAAIdAR8BHgITAQYCBAMGAQICBAEdAQIBGgEPAQQFBgELARIBDwEOAxEBGAEdAhoBEgEaAR4BAAIfAR4BIAEfARMBBgMEAQUBBAECAgQBHAECARMCDAEEAQUBBAEFAQYBCAEPARQBDgQRARUBFgEYAR0BHgEAAyABFwEaAR0BDAEIAQYCBwETAQIEBAEcAQUBEAEXARABBgQIAQ8BEgEcARYBEQEOAxQBHQIABQsBDAEdAQsBCAIGAQcCBAECAwQBHwEEAQgBFQEbARcBCwEIAgwBDwEXARoBHQIeARsBHwEaAQAIBQEUARABCAEGAQgBBgEFAQQEBQEgAQgBBgEEAQgBCwEeARcBGQEcAR0BGQIdAR8BAAwcAR4BHAEPAggBBgMFAQQDHgEGBAwBEgINAR0CHAEXAR0BAA0YARQBGQEcAQgBCwEFAQcBBgIEAw8BFQEGAggBCwEKAQkBCgEYARQBGAEaARgCAAoeARkBDgIWARwBGgEXAQcBBQEHAQUCBgEIAQ8BIAEQAQgBCwIDAQoBFQERAQoBFQEOARoBHQEAChkBDQEOAREBGAEZARoBFwMcARMBDAELARMBFwEaARADCgEJAQ0BGAEKAhkBHgEVAR8BAAodARMBDQERARcBFAEJARoCCgEVAQ4CFAEdARUBAwEUARoBFQERARkBCgEbARkBCgEWAR0BHwEgAQAMFgEYARYBFQEaARkBFQEDAQkBHgEfASACFgEDARYBHQEeARsDGQEdAQoBFgEdAR4BAA0eARoBFAEWARkCFQEDAQoBIAEfASACGAEDARUBHQIbAR0CGgIVARgBHgEdAQANIAEdAwABGwEVAREBDgEeAQADGQEDAQ4BHgEAAx4BGwERAR0BCgEVASABAA4fAR4BAAIdARYBFQENAR0BAAMYARkBFQEaAR4BAAMaAQ0BGgEcASACABMdARoCHwEAAx4BGQEWARoBAAUgAgAWIAEfAgAFHQEfAgAU",[[3,6,34,0],[23,29,34,0],[8,12,34,1],[16,20,34,1]]],
 embertree:[30,48,0.587,"f5c070e9ab5aef8c2fd48d43da691f8e6948c3571c875a3b7b543bac44189143206f4e377d44266a452d6348315a462f7e33186832195a3a25582c1b4c3926493221462a1b452013382a1b302318261c12311b1226170e21120b16100a090402","AA0OARECABoSAREBBwEKAREBABgUAREBBwEDAQoBEgEAFxQBCwEKAQUBAwEKAQ4BEAEAFhIBCgEHAQMBAgEKAQ0BDwEOAREBEgEAExEBCgEFAQIBAQEKARIBEAELAQUBDQEXAQASEQEKAQUBAwIHAQoBEQEFAQMBEQEKARQBABESAREBBwEFAQMBBQEDAQcBBQIRAhQBABETAQ4BEQEFAQMBAgEFAgcBEQETARUBABIQAhIBBQEDAQEBAwIHAREBFwEcAQASGwEZARgBBQEDAQUBEQEFAQoBHAEbARoBABAaARcBHgEdARwBEgELAQkBEAEUAREBHQEfARkBAA8XARgBEQELARsBHAEZARYBCQEVARYBGQELAQoBGAEVAQANHQERAQoBBQEKARwBFwEZAQ4BDQETARUBCwEHAQUBCgERARoBAAwSAREBBQMRAQ0BDgINAwMCBQEHAQoBEgEPARIBAAkaAREBBwEFBAcBBgETAQ4BBQEDBQcBCgEYAQoBDQEABh8BGQEaARcBEQEHAQUCAwEFAQMBCwEFAQIDCgEDAQIBAwEKARgBEQEYAQAFHwIcAR4BGAESAQoBBQEKAQsBBQEEAQIBAQECAQEDBgEHAQIBCgEUARcBFAEXAQAEHgEcAQ0BFAEYARMBEQEKAR4CBgEBBQIBDwEZARcBBwIYARQCHAEABBIBCwERAQgBDQESAhwBBgEBAR4BEAEBBAwBGwEQAQYBEQISAQgCFgEdAQADGAERAgYCDQEXAQkBBAEVAR4BDQEBBAgBGwEdAQIBCwESAREBBAEGARMBHAEAAx0BGAEXARQBEgETARYBCAEBAR4BHAENAQEEBAEcARoBCwEKARICDQESARQBHgEABB0CGQEWARQCBQECAREBCAECAQEFCAEYAQQBBQEUARgBHAEaAR0BHgEABR4BHAESAQsBCgEFAgMBAQICAgQCAgIDAgoBBwEYARoCAAceAREBBQEKAwcBAwEBAQQCCAMCAQMDBQIRAQwBDwEACBgBEQECAQQBCgIDAQEBGQEYAQsBCgEUARgBBAECAwQBBgEdAQAKEwEBAgoCAgEMAREBCwMRARQBCwEDAQIBBwEXARkBAAwVAQQBAgESAQQBFAENAQsDEQESAgMBDQEQARkBAAwfARUBBgECARMBHAIUAQsBCgELARQBGAEcAhcBBgEQAQALHgEbAhkBDwEQARsBHAETAQ0BCgERARgBGwEaARsBGQEGAQAKGgEZAQ8BCQMPARcBHgEcAQ4BDQEFAREBFAEdARsBAAweARABDwEIAQkCDAEOAQwBEwEZAQ8BDgELAQ4BFAEdAR8BAAQfAiABAAQaARMBEAEIAQkCDwEWAgwCDwETAQ8BCAEJARABHQEbAR0CHgEZARUBDwEZARsBAAMcARMBDAEIAQkBFgEQARoBHgETAQwBDwETAQ8BCQEIAQkBHgIWAQwBCAEMAQkBBgEIARoBGQEAASABFgEPAQwBDwIaARkBEAIZAR4BFQEPAQwCCAEMAgkBCAEGAwkBCAEXARYBGQEdASABHAEVARMBFgEVARAEFgEbARUBEAEMAgkBBgEJAgYEDAIXAQ4BGAEeASABGgEZARYCEAMVAhkBGwEWARABCQIMARABGQEWARMBEAEOAgwCEwIYAR8BAAEfAR4BGQIXARUBFgMaARsBEAEIAgkCFgEXAR0BFwEWAhUBEAEPAQwBFQEcAR0BAAIeAR8CHQEWARsBHgIdARYBDwEIAgkBDAEWARoBIAIfAR4BGQEXAhUBHwEeAQAEIAIfARsCFgEZAR0BEAEOAQgCCQEPARcBGgEgARUBGQEeARsBHwIeAR8BAAggARkBEAIcAQ8BDgEIAQkBEAEWAxoBGwEZARABGwEgAgALGgEVARoBFQEOAQkBBgITARYCFwETARkBGwEZAQAOHgEPAQwCGAEQAQgBCQETAR0BHgEXARMBEAIcAR8BAAweARUBDwEMAhgBDAEJARMBFQEeARcBEwEMAQgCEAEaAQALIAEfAQ8BDAIJARcBDwEYARwBHgEgARkBEAEJAQYBDAIaAR8BAAsgARwBGAEUAhwBHgIAAiABHQEaARMBCQETARQBHgEgAQAMIAQABiABHQEcAh0BHgIADiABAAogAh8BIAEABw=="],
 phoenix:[34,40,0.654,"f3d68bedc46ee1b166e29841db8435b87f44d86b29b66328c35d22cf5b26cd4c21cd4620bc421daf511f9c5528874124774b29c33b19ac36179d301689301679402370392064381f722814572f1a3d25155522144b160d3719102a19101b0f09","ABkIAQAgFQEPAgAfFgEIAQYBFgEAHg8BBwECAQgBEAEAHBgBFAEFAQEBCAEVAQAZGAEWAw4BBAEBAQgBFgEAGBgBFgEUAQkBDgEJAQQBAQEJAREBABcXARUBGQEUAQcCDQEEAQEBCQEPARYBABYZARQBDgETAQcBCgELAQQBAQECAQUBDwEWAQAUGgEVAQ0BCgETAQcBBAEJAQICAQEDAQ8BFgEAFBoBFQELAQoBEwEKAQQBAwEBAQIBAwEFAQ8BABUcARkBDQEKARMBCQEDAQQBAgIEAQ8BFgEAEiABAAIfAh0BCQEVAQgBAwEFAQQCDwEYAQASIAEeAR8BHgEcAxgBHAEWAQgBDwEIAQcBFgEAEhsBHwEaARwBFgEQAhcBGwIaAQ8BEQEXARoBGwEAER8CHAEYARYBEAIXARkBFwEWAhcBGAIaAR4BGwEADyABGwEaARkBFgEQAREBFwEcARABFQEGAQMBGQEXARgBFwIaARsBAA0fAhoCFwEWAhEBHAEQARUBBAEFARUBEAEWAhcBGAEUARkBGwEACyACGwEcARoBFwEQAQ8BFwEaAQgCAgIFAQoBEwEQARcBGQEHARUBGgEcAQAEHgEdAgADIAEeAR0BFQMLAg0BHAEEAQIBAwEPARoBDwEKARcBFgEVAQUBBAEFARkBAAMcAg0BFQEeARoBGwEgARkBDQELARICCwEMAQsBBAEFAQIBGQEeAQMBFwEJAQ8BEAEIAQQBAgEFARQBGQEAAR4BGQENAQoBDQEVARsCHgEUAQ0BCgESAgwDAwEHARQBBgERASABHwEEAgUCBAECAQMBBQEVAQABHgEVARMBCwENARQBGQEbARkBEgEHARoBHwENAQwCEwEUAQcBDQEDAQYBIAEeAQUBBAEFAQcBDwEXAQ8BCQESAR0BAAEdARkBEwINARkBGgEUARIBCgEbAREBEgMUAQoCBQIJAQ8BBwEEAgcBDgEbAREBHwEVARIBHAEAAR4BFQEUAQ0BFAEZAhMBEgIVAQUBEgINAhUBDQEKAgcBCgEEAQIBBAEKAhwBIAIQARkBHgEAAR0BGgEVAQsBFAEZAhMBEgIMAQsCDAENAhkBDQIFAQIBAQMOAQcBCgENARQBDQIZAR4BAAIdARkBFAIZARwBEwESAwwBCwEMAg0BFAEZAQ4BBAEBBAYBCgELAQ0BCwENARQBHQEABB0BHAIeAR0BEwESBAsCDAENARIBGQIJAQMBAQQDARECFwEaARwBAAceARsBHQEUARICEwESAQwDDQIPAQMBFgEPAQYBAwECAwMBBgEPARsBAAodARUBFAEHARMBFAENAQwBCgEIARMBBgEBAQMBBgEIAQ8CCAEPAQYBGAEbAQALHAEZARUBCwEKARQBDQEJAQMBAQEDAQEDAwEGAQ8BFgEaAR8BGgEADh8BGQEUAQsBCgENAQICAQEGAQIBAQMDAQYBEQEeAQARHAEVAhkBDwEEAQgBBQEIAgUBAwECAQ8BEQEWAR8BABEgARsBGgMYAQ8BBwEFAQ8BCAEFAQgBFgEfASABABQfAQ8BGgEYARkBBwIfAR4BGgEcAQgBGgEgAQAUGAEKARABGwIKAQgBGwEaARsBFgEJARwBIAEAFBgBDQEeAR8BGwEJAQgBHwEaAR8BFwEIARYBHgEAEyABHgEaAR4BAAEaAQ4BCAEXAQACGAEJAQoBGgEgAQATIAIAAx0BCAEQAQACHgIZAR0BABobAQAEHwEeAQAK"],
 g_volcano:[42,41,0.941,"f8d568f4cc56f2c24dd9993fbe874ad4842d9f6937c86429ce4c2296542ace451fbf3a1ba23a207c44276d3a2689341f60311f8a2a1b7c2b1f772d2176261c6a2f1c572d1e672417641f1350281b4c1c133b1e1630150f3e140f2612101e0b0b","ACAFAQcBACcKAQEBCAEKAQAjEAIKAQgBAQEFAQoBACISAQsBDQEGAQECBQEKAQAgDgEMAgYBDQEGAQEBBAEHAQAZIAcOAQgBDAINAQ4BAwEFAQcBABcfASABHAEdBB8CIAEPAQcBFAEMAQ4BBwEFAQcBDwEAFRoBHQEfAhoBEQcaAR8BHAERARcBBQEOAREBABUdASABHAEaARcDDgEPBxEBHAEdAQ4BFwEAFRoBHQEaAhcBEQEPAg4CEAEHAg4BDwIRAhcBHQEfARwBABMdAhoDFwEWAREBDwEOARABBQIHAQ0BDgEPARYBEQEXARoBHAEfAQASIAEdARoDFwIRAg8BDgESAQUBBwEKAQ0BDgEWAQ8BEQIaARsBHAEdAgAPHwEdARwBGgIXAxECDgEQAQ0FFAEPAQ4BBwERARoBGwEeARwBIAEADh8BHAIaARcBGgEXARoBFwERAQ8BDQYSARACCgEBARYCEgENARMBGgEfAQANHAEfARQBEAENAQwBEwIaARwCGgETAg0BCwEMAQsEDgENAQwEEgEbARwBAAsgAR0BGgEQAQ0BDAELAQgBGgEeAR0CHgIdARgBDQILBAwBCwIMBBUBHwEaAQAKIAEeARgBDQEJAQsBEwEdAR4BGAEHAhABFAEYARkBHgEZAQ0BCwcNAQsBDAENAR4BDwIAAgcBCAEABR4BGwEVAQsBCQESAR0CEQEFAg0BEwEUAhgBGQEbAgsECQQLAg0BGQEYAQ4CCgEGAQgBAAIdARoBIAEdARsBEgEJAQwBHgEbARgBEwEQARMBFAQWARkBGgEbARkBCQELAQkGCwEMAQ0CBAEDAggBDgEAARcBGQEWARsBHwEbARIBDAEZAR4BGQETARABEwEUBhgDFgEJAwYBBAEJAwsBDAIZAQgBBAEMAQ4BAAEfARUBDQESAiABGQESAhYBBwEYARMBEAETAhQDFQEKARoDHgEYAQMCAQECAQQBBgEJAQsBDAIZAQoCDwEAAxoBEgITAR8BEgENARsBGgEFAR0BEwEQARMDFAITARwBGgEHAREBGgENAQIBAwMCAQMBCQELAQwCHgEaAQ8CAAQXARIBFgEfARIBGQEdAREBHwIUARMEFAITASABHAEBAQ8BHAEWAQIBAwUEAQkBCwEMAR4BFwEOAgAEHAEXARoBIAEdARsBHgEUARgBFQEUARMEFAMfAhwBGgEcARYBAQEDBgQBDAIeARYBBwIABRoBHwIbARgBHgIZARgCFAETBBQCFQEWAhcBHAEPAQEBAgUDAQQBDQIeAQ4BBwEFAQAHHQEbARgBGwEdAR4BGAIWARMFFQQaARcBAwEBBAIBAwEEAQYBDQESARoBBwEIAQoBAAcgAR4BGQEWAR0CGQEYAhMFFQQXAQ8BAQUDAgYCEgEVAQ4BCAEEAQAIIAEdARgBFQEYAR8BGwEZARgBFQQTARUCGAEbAQ8BAQUCAQMCBAEGAQoBEQEHAQgBAAofAR4BGAEVARIBEwEbARkBFQQYAhsBIAEHAQEFAgEDAgQCBQEHAQ4BAAwgAR0BGgEVARIBDQEMARsCHgEbAg8BGwEDAQIEAQMDAgQCBQEHAQAPIAEdARkBEwESAQwBCwEJAQsBDQEMAQQBAwECAQMFAQIDAQQCBQIHAQAQIAEbARgBEgENAQwCCwEJAggBBgEDBAIDBAMFAgoBABIcAhgBFQENAQwBCwEJAgsCBAQFAQQBAwEEAgUCDQEAFCABHQEcARUBEgINAQsBDAINAgQFBQIKARYBABcdAhsBGAISBQwBBAIFAgcBDQEPAQAZHwEcAxoBEQEYARYBFAIEAg8BEQEKAQAbHAEaARcBEQEWAQUBGgEfASABDgEEAg8BAB4fARcBFgEKAQUBBwEAAgcBBgIRARcBAB4cAQcBBAIHAQADBwEGAQQBCgEAHxYBBgEDAQYBAAMKAQQCFwEAIAgBBAEABQcBCgEAEA=="]
};

let ART_VOL=0;
const MON_GAIT={
  hop:[{},{dy:1,sy:1.04},{dy:4,sy:1.07,sx:.96},{sy:.9,sx:1.07}],                       /* 통통 뛰기: 살짝 들썩 → 길게 뛰어오름 → 납작하게 착지 */
  fly:[{},{dy:1},{dy:3,sx:1.06,sy:.95},{dy:1,sx:.95,sy:1.04}],                          /* 날기: 오르내리며 날개를 폈다 접는 느낌(가로로 늘었다 줄었다) */
  float:[{},{dy:1},{dy:2,sw:.8},{dy:1,sw:-.8}],                                         /* 떠다니기: 둥실 + 위쪽이 하늘하늘 */
  slither:[{wv:1.3,ph:0},{wv:1.3,ph:1.57},{wv:1.3,ph:3.14},{wv:1.3,ph:4.71}],           /* 물결: 몸이 물결친다 */
  waddle:[{},{dy:1},{dy:2,sw:1.2},{dy:1,sw:-1.2}],                                      /* 뒤뚱뒤뚱: 들썩 + 좌우 흔들림 */
  swim:[{wv:.9,ph:0},{wv:.9,ph:1.57,dy:1},{wv:.9,ph:3.14,dy:2},{wv:.9,ph:4.71,dy:1}],   /* 헤엄: 물결 + 둥실 */
  glide:[{},{sx:1.03,sy:.98},{sx:1.06,sy:.96},{sx:1.02}]};                              /* 달팽이: 몸을 늘였다 당긴다 */
/* 다리 걷기: a = 발이 앞뒤로 나가는 칸 수 · l = 발을 드는 칸 수 · bob = 두 묶음이 다 땅을 디딘 프레임에 몸이 내려앉는 칸 수 · sw = 발을 들 때 몸이 디딘 쪽으로 기우는 정도
   한 다리의 한 바퀴(4프레임): 앞에 디딤 → 몸 밑 → 뒤로 밀림 → 들어서 앞으로. 묶음 1은 두 프레임 늦다 = 번갈아 나간다 */
const MON_LEGGAIT={
  trot:{a:2,l:2,bob:1},                 /* 네발 걸음: 대각선 다리끼리 한 묶음 */
  crawl:{a:2,l:1,bob:1,sw:.6},          /* 기어가기: 낮게, 발을 조금만 들고 몸이 디딘 쪽으로 살짝 쏠린다 */
  scuttle:{a:1,l:2,bob:1,sw:.5},        /* 게걸음: 여러 다리가 하나 건너 하나씩 */
  stomp:{a:0,l:3,bob:1,sw:1.3}};        /* 기우뚱: 두 발을 번갈아 들고 몸이 디딘 쪽으로 기운다(정면 그림이라 앞뒤로는 안 나간다) */
const MON_MOVE={squirrel:['trot'],turtle:['crawl'],acornboar:['trot'],sparrow:['waddle'],fairy:['float',2],honeybug:['fly',4],firefly:['float',3],g_rowen:['waddle'],
  windfox:['trot'],bull:['trot'],sheep:['trot'],rat:['trot'],lark:['fly',4],grasssnake:['slither'],locust:['crawl'],sunflower:['waddle'],earthgolem:['stomp'],jelly:['float',4],g_plains:['trot'],
  mole:['crawl'],snail:['glide'],rockcrab:['scuttle'],crystalbat:['fly',5],stonebeetle:['crawl'],oregolem:['stomp'],goat:['trot'],sandlizard:['crawl'],cavemush:['waddle'],g_rock:['stomp'],
  clam:['scuttle'],carp:['swim',4],lotus:['waddle'],kingfisher:['fly',4],mist:['float',3],lakesnake:['slither'],puffer:['swim',4],otter:['trot'],watergolem:['stomp'],g_lake:['slither'],
  lavalizard:['crawl'],ashbat:['fly',5],obsidiancrab:['scuttle'],volsheep:['trot'],flamewisp:['float',3],magmagolem:['stomp'],sulfurbeetle:['crawl'],embertree:['waddle'],g_volcano:['fly',4]};
const monLegged=k=>!!MON_LEGGAIT[(MON_MOVE[k]||'')[0]];                                 /* 다리로 걷는 종인가(서서 싸울 때는 걷기 대신 서 있기 프레임을 쓴다) */
/* 구운 그림 해독 → {w, h, hk, px(0 = 투명), rgb, legs} */
function monPix(a){const [w,h,hk,ps,b64,lg]=a,pal=[];for(let i=0;i<ps.length;i+=6)pal.push([parseInt(ps.substr(i,2),16),parseInt(ps.substr(i+2,2),16),parseInt(ps.substr(i+4,2),16)]);
  const s=atob(b64),px=new Uint8Array(w*h),rgb=new Uint8ClampedArray(w*h*3);let p=0;for(let i=0;i<s.length;i+=2){const n=s.charCodeAt(i+1);px.fill(s.charCodeAt(i),p,p+n);p+=n;}
  for(let i=0;i<w*h;i++){const v=px[i];if(v){const q=pal[v-1];rgb[i*3]=q[0];rgb[i*3+1]=q[1];rgb[i*3+2]=q[2];}}
  return {w,h,hk,px,rgb,flip:false,legs:(lg||[]).map(q=>({x0:q[0],x1:q[1],top:q[2],g:q[3]}))};}
function flipPix(A){const {w,h}=A,px=new Uint8Array(w*h),rgb=new Uint8ClampedArray(w*h*3);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,j=y*w+w-1-x;px[j]=A.px[i];rgb[j*3]=A.rgb[i*3];rgb[j*3+1]=A.rgb[i*3+1];rgb[j*3+2]=A.rgb[i*3+2];}
  return {w,h,hk:A.hk,px,rgb,flip:!A.flip,legs:A.legs.map(L=>({x0:w-1-L.x1,x1:w-1-L.x0,top:L.top,g:L.g}))};}
/* 양감: 실루엣 안쪽 거리 → 둥근 높이 → 법선 → 왼쪽 위 빛. 밝은 쪽은 따뜻하게, 그늘은 어둡고 푸르게(5단계로 끊어 도트 느낌을 지킨다). 어두운 외곽선은 밝히지 않는다 */
function volHD(A,k){const {w,h,px}=A,N=w*h,d=new Float32Array(N),H=new Float32Array(N),rgb=new Uint8ClampedArray(A.rgb);
  for(let i=0;i<N;i++)d[i]=px[i]?99:0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!px[i])continue;d[i]=Math.min(d[i],(x>0?d[i-1]:0)+1,(y>0?d[i-w]:0)+1,(x>0&&y>0?d[i-w-1]:0)+1.41,(x<w-1&&y>0?d[i-w+1]:0)+1.41);}
  for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const i=y*w+x;if(!px[i])continue;d[i]=Math.min(d[i],(x<w-1?d[i+1]:0)+1,(y<h-1?d[i+w]:0)+1,(x<w-1&&y<h-1?d[i+w+1]:0)+1.41,(x>0&&y<h-1?d[i+w-1]:0)+1.41);}
  let dm=1,ymax=0;for(let i=0;i<N;i++)if(px[i]){if(d[i]>dm)dm=d[i];ymax=(i/w)|0;}
  const R=Math.max(3,Math.min(dm*.62,8));                                              /* 가장자리에서 이만큼 안쪽까지만 둥글린다 — 얼굴 · 무늬가 있는 가운데는 원래 그림 그대로 */
  for(let i=0;i<N;i++)if(px[i]){const t=Math.min(d[i],R)/R;H[i]=Math.sqrt(1-(1-t)*(1-t))*R;}
  for(let it=0;it<2;it++){const T=new Float32Array(H);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!px[i])continue;let s=0;
    for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const xx=x+a,yy=y+b;if(xx>=0&&yy>=0&&xx<w&&yy<h)s+=T[yy*w+xx];}H[i]=s/9;}}
  const Lx=-.52,Ly=-.62,Lz=.59,Ln=Math.hypot(Lx,Ly,Lz),f0=Lz/Ln,S=.9;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!px[i])continue;
    const hx=((x<w-1?H[i+1]:0)-(x>0?H[i-1]:0))*.5,hy=((y<h-1?H[i+w]:0)-(y>0?H[i-w]:0))*.5,nx=-hx*S,ny=-hy*S,t=(nx*Lx+ny*Ly+Lz)/(Math.hypot(nx,ny,1)*Ln)-f0;
    let u=t>0?Math.min(1,t/.3):Math.max(-1,t/.5);u=u>.62?1:u>.22?.5:u<-.62?-1:u<-.22?-.5:0;
    if(y>=ymax-1&&u>-.5)u=-.5;                                                           /* 땅에 닿는 맨 아래 두 줄은 그늘 */
    if(!u)continue;let r=rgb[i*3],g=rgb[i*3+1],b=rgb[i*3+2];const L=.3*r+.59*g+.11*b;
    if(u>0){const e=Math.min(1,Math.max(0,(L-40)/50)),a=u*k*.5*e;r+=(255-r)*a;g+=(240-g)*a;b+=(204-b)*a*.8;}
    else{const a=-u*k,m=1-.4*a,c=.12*a;r=r*m;g=g*m*.985;b=b*Math.min(1,m*1.06);r+=(52-r)*c;g+=(44-g)*c;b+=(112-b)*c;}
    rgb[i*3]=r;rgb[i*3+1]=g;rgb[i*3+2]=b;}
  return {w,h,hk:A.hk,px,rgb,flip:A.flip,legs:A.legs};}
/* 한 장 → 프레임 한 장. T = 변형(MON_GAIT 한 칸) 또는 다리 걷기 {f: 0~3, leg: MON_LEGGAIT 한 칸, bob, sw} */
function monFrame(A,T,lift){const {w,h,px,rgb}=A,PL=4,PT=7,PB=2+(lift||0),W=w+PL*2,H=h+PT+PB,c=mk(W,H),g=c.getContext('2d'),im=g.createImageData(W,H),d=im.data;
  const put=(X,Y,i)=>{const o=(Y*W+X)*4;d[o]=rgb[i*3];d[o+1]=rgb[i*3+1];d[o+2]=rgb[i*3+2];d[o+3]=255;};
  if(T.leg||T.bob!=null){                                                                /* 다리 걷기 · 숨쉬기: 몸은 bob만큼 내려앉고(다리 윗줄을 덮는다) 다리는 칸마다 따로 움직인다 */
    const G=T.leg,legs=G?A.legs:[],bob=T.bob||0,sw=T.sw||0,face=A.flip?-1:1,lt=new Int16Array(w).fill(h);
    for(const L of A.legs)for(let x=L.x0;x<=L.x1;x++)if(L.top<lt[x])lt[x]=L.top;
    for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){const x=X-PL,y=Y-PT;let src=-1;
      for(const L of legs){if(y<L.top+bob)continue;const p=(T.f+2*L.g)%4,ys=y+(p===3?G.l:0);if(ys>=h)continue;
        const xs=Math.round(x-(p===0?G.a:p===2?-G.a:0)*face*(ys-L.top)/Math.max(1,h-1-L.top));if(xs<L.x0||xs>L.x1)continue;const i=ys*w+xs;if(px[i])src=i;}
      if(src<0&&!G&&x>=0&&x<w&&y<h&&y>=lt[x]+bob){const i=y*w+x;if(px[i])src=i;}          /* 서 있기: 다리는 제자리 */
      if(src<0){const yb=y-bob;if(yb>=0&&yb<h){const xb=Math.round(x-sw*(h-yb)/h);if(xb>=0&&xb<w&&yb<lt[xb]){const i=yb*w+xb;if(px[i])src=i;}}}   /* 몸(다리 칸이 아닌 곳) */
      if(src>=0)put(X,Y,src);}}
  else{const cx=w/2,dy=T.dy||0,sx=T.sx||1,sy=T.sy||1,sw=T.sw||0,wv=T.wv||0,ph=T.ph||0;
    for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){let x=(X-PL+.5-cx)/sx+cx,y=Y-PT+.5+dy;
      if(wv)y+=wv*Math.sin(x/w*7.2+ph);y=h-(h-y)/sy;if(sw)x-=sw*(h-y)/h;
      const xi=Math.floor(x),yi=Math.floor(y);if(xi<0||yi<0||xi>=w||yi>=h)continue;const i=yi*w+xi;if(px[i])put(X,Y,i);}}
  g.putImageData(im,0,0);c.hk=A.hk;c.lh=(h+(lift||0))*A.hk;c.lw=w*A.hk;return c;}
/* 한 종의 6장: [서 있기 2, 걷기 4] */
function monFrames(A,mv){const lift=mv[1]||0,G=MON_LEGGAIT[mv[0]];
  if(G)return [{bob:0},{bob:1},...[0,1,2,3].map(f=>({f,leg:G,bob:f%2?0:G.bob,sw:f===1?G.sw||0:f===3?-(G.sw||0):0}))].map(T=>monFrame(A,T,lift));
  const fs=(MON_GAIT[mv[0]]||MON_GAIT.hop).map(T=>monFrame(A,T,lift));return [fs[0],fs[1],fs[0],fs[1],fs[2],fs[3]];}
const hkOf=(c,r)=>{if(r.hk){c.hk=r.hk;c.lh=r.lh;c.lw=r.lw;}return c;};                 /* 뒤집기 · 흰/검은 실루엣에 배율을 물려준다 */
const monH=k=>{const c=MONSPR[k][0];return c.lh||c.height;},monW=k=>{const c=MONSPR[k][0];return c.lw||c.width;};   /* 월드 칸 단위 크기(이름표 · 대상 고리 · 누르기 판정) */
const MONPIX={};
function buildMonSprites(){const kv=ART_VOL;
  for(const k of Object.keys(SPECIES)){const d=SPECIES[k];let fs,fl;
    if(MONART[k]){const mv=MON_MOVE[k]||['hop'],A=MONPIX[k]||(MONPIX[k]=monPix(MONART[k]));
      if(kv){fs=monFrames(volHD(A,kv),mv);fl=monFrames(volHD(flipPix(A),kv),mv);}else{fs=monFrames(A,mv);fl=fs.map(flipX);}}
    else{let f4=[0,1,2,3].map(f=>d.form?genMon(d,f):makeMon(k,f%2));if(kv)f4=f4.map(c=>{const v=volumize(c,{pad:0,stripOutline:true,k:kv});v.anc=c.anc;return v;});
      fs=[f4[0],f4[1],f4[0],f4[1],f4[2],f4[3]];fl=fs.map(c=>{const v=flipX(c);v.anc=c.anc;return v;});}
    MONSPR[k]=fs;MONSPRL[k]=fl;MONW[k]=whiteOf(fs[0]);MONWL[k]=flipX(MONW[k]);MONSIL[k]=silOf(fs[0]);}}
/* ================= world sprites ================= */
function sprStump(){const c=mk(18,12),p=painter(c.getContext('2d'),1,1);p(2,3,12,6,'#6e4a32');p(2,3,12,1,'#a07850');ell(p,8,3,6,1.6,'#c8a070');p(6,3,4,1,'#a07850');p(12,4,2,5,'#4e3322');return finalize(c,{rim:false});}
function sprRock(seed,big){const w=big?30:22,h=big?22:16,c=mk(w+2,h+2),g=c.getContext('2d'),p=painter(g,1,1),r=rng(seed);
  ell(p,w/2,h/2+1,w/2-.5,h/2-1,'',(x,y,e)=>{const l=-(x-w/2)/w*.8-(y-h/2)/h+(hash2(x+seed,y)-.5)*.3;return e>.85?'#5e5a54':l>.35?'#b8b2a6':l>0?'#9a948a':'#7a756c';});
  for(let i=0;i<3;i++){const x=3+Math.floor(r()*(w-8)),y=4+Math.floor(r()*(h-8));p(x,y,3,1,'#5e5a54');p(x+2,y+1,2,1,'#5e5a54');}
  return finalize(c,{rim:false});}
function sprOre(){const c=mk(26,26),p=painter(c.getContext('2d'),1,1);
  ell(p,12,17,11,7,'',(x,y,e)=>e>.85?'#4e4a54':y<15?'#8a8494':'#6a6474');
  for(const [x,y,h] of [[6,6,10],[11,2,14],[16,7,9],[19,11,6]]){p(x,y,3,h,'#c8d0e8');p(x,y,1,h,'#f4f6ff');p(x+2,y+1,1,h-1,'#8a96b8');p(x+1,y-1,1,1,'#f4f6ff');}
  return finalize(c,{rim:false});}
function sprBerryBush(seed,ripe){const b=makeBush(seed,['#22402a','#2f5a31','#3f7436','#56903f','#74ad4c','#9cca62']),c=mk(b.width,b.height),g=c.getContext('2d');g.drawImage(b,0,0);
  if(ripe){const p=painter(g),r=rng(seed+5);for(let i=0;i<7;i++){const x=5+Math.floor(r()*15),y=5+Math.floor(r()*9);p(x,y,2,2,'#d8304a');p(x,y,1,1,'#ff8a9a');}}return c;}
function sprMush(){const c=mk(12,12),p=painter(c.getContext('2d'),1,1);p(4,5,2,5,'#d8d0c0');p(2,2,6,3,'#4ac0b0');p(3,1,4,1,'#6ae0d0');p(3,3,1,1,'#c8fff4');return finalize(c,{rim:false});}
function sprCampfire(){const c=mk(26,18),p=painter(c.getContext('2d'),1,1);
  for(const [x,y] of [[1,9],[5,12],[11,13],[17,12],[21,9],[4,6],[18,6]]){p(x,y,4,3,'#8a847a');p(x,y,4,1,'#b0aaa0');}
  p(6,9,13,2,'#6e4a32');p(8,7,9,2,'#5a3a24');p(9,10,7,2,'#7a5034');return finalize(c,{rim:false});}
function sprLogSite(){const c=mk(44,32),p=painter(c.getContext('2d'),1,1);
  p(2,18,14,8,'#6e4a32');ell(p,9,18,7,2,'#c8a070');p(13,19,3,7,'#4e3322');p(8,8,2,11,'#8a5a34');p(5,6,8,4,'#8a8a96');p(5,6,8,1,'#c0c0cc');
  for(const [x,y] of [[20,20],[28,20],[36,20],[24,14],[32,14]]){p(x,y,8,6,'#7a5034');ell(p,x+1,y+3,1.5,3,'#c8a070');p(x+1,y+3,1,1,'#a07850');}
  return finalize(c,{rim:false});}
function sprQuarry(){const c=mk(44,32),p=painter(c.getContext('2d'),1,1);
  ell(p,20,20,19,9,'',(x,y,e)=>e>.8?'#5e5a54':(hash2(x,y)<.25?'#b0aa9e':'#8a847a'));
  for(const [x,y] of [[8,12],[18,8],[27,12],[14,16]]){p(x,y,6,4,'#9a948a');p(x,y,6,1,'#c0baae');}
  p(32,4,2,16,'#8a5a34');p(27,3,12,3,'#6a6a74');p(27,3,12,1,'#9a9aa6');return finalize(c,{rim:false});}
function sprFarm(){const c=mk(56,30),p=painter(c.getContext('2d'),1,1);
  p(0,4,54,24,'#5a3e28');for(let y=6;y<27;y+=5){p(1,y,52,2,'#6e4c32');p(1,y+2,52,1,'#4a3220');}
  p(0,4,54,1,'#7a5a3a');for(let x=0;x<54;x+=9){p(x,2,2,4,'#8a6a48');}p(0,3,54,1,'#a8845b');
  return finalize(c,{rim:false});}
function sprCrop(st){const c=mk(10,12),p=painter(c.getContext('2d'),1,1);p(3,4,2,6,'#3f6e2c');p(1,5,3,2,'#5f9a3a');p(5,3,3,2,'#8cc45a');if(st>0){p(1,1,2,2,'#d8304a');p(5,1,2,2,'#d8304a');p(1,1,1,1,'#ff8a9a');}return finalize(c,{rim:false});}
function sprFeed(){const c=mk(28,20),p=painter(c.getContext('2d'),1,1);
  p(0,6,26,12,'#9a7048');p(0,6,26,1,'#b88a5a');p(0,11,26,1,'#7a5434');p(24,6,2,12,'#6b4a2e');p(0,17,26,1,'#5a3a24');
  for(const [x,y] of [[3,3],[7,2],[11,4],[15,2],[19,3],[5,5],[13,5],[21,5]]){p(x,y,3,3,'#d8304a');p(x,y,1,1,'#ff8a9a');}
  return finalize(c,{rim:false});}
function sprPalbox(){const c=mk(28,30),p=painter(c.getContext('2d'),1,1);
  p(3,14,20,14,'#7a746a');p(3,14,20,1,'#a8a298');p(20,14,3,14,'#5e5a54');p(1,26,24,3,'#6a645c');p(5,18,16,1,'#5e5a54');p(5,22,16,1,'#5e5a54');
  ell(p,13,8,6,6,'#2c4a7a');p(10,5,3,3,'#6a9ad8');p(9,13,8,2,'#5e5a54');return finalize(c,{rim:false});}
function sprSign(){const c=mk(30,30),p=painter(c.getContext('2d'),1,1);p(13,8,3,20,'#6a4630');p(0,4,26,9,'#9a6a40');p(0,4,26,1,'#b07c4c');p(0,12,26,1,'#6a4630');p(2,7,3,3,'#efe6d0');p(5,8,16,1,'#efe6d0');return finalize(c,{rim:false});}
function sprOrb(t2){const c=mk(8,8),p=painter(c.getContext('2d'),1,1);p(0,0,6,6,t2?'#7a8aa8':'#e0b050');p(0,0,6,3,t2?'#c8d4ec':'#f4e0a0');p(0,3,6,1,'#3a2a22');p(2,2,2,2,'#ffffff');return c;}
const STUMP=sprStump(),ORE=sprOre(),MUSH=sprMush(),CAMPF=sprCampfire(),LOGSITE=sprLogSite(),QUARRY=sprQuarry(),FARM=sprFarm(),CROP=[sprCrop(0),sprCrop(1)],FEED=sprFeed(),PALBOX=sprPalbox(),SIGN=sprSign(),BENCH=sprBench(),ORBS=[sprOrb(false),sprOrb(true)];
const ROCKS=[sprRock(3,true),sprRock(7,false),sprRock(11,true),sprRock(19,false)];
const BUSH=[0,1,2,3].map(i=>[sprBerryBush(20+i,false),sprBerryBush(20+i,true)]);
const TREEPAL=[['#22402a','#2f5a31','#3f7436','#56903f','#74ad4c','#9cca62'],['#1f3a2c','#2a5235','#386a3d','#4d8448','#689f55','#8bbb6a'],['#3a3f22','#56602a','#717c30','#93983a','#b7b04a','#d6c766'],['#14262c','#1c3a3e','#24504e','#2e6a60','#3e8a76','#5aa88e']];
const TREES=[makeTree(11,TREEPAL[0]),makeTree(23,TREEPAL[1]),makeTree(37,TREEPAL[0]),makeTree(51,TREEPAL[2]),makeTree(64,TREEPAL[1])];
const DTREES=[makeTree(71,TREEPAL[3]),makeTree(83,TREEPAL[3])];
const LEAVES=[makeLeaves(3),makeLeaves(9),makeLeaves(17)];


/* ================= base facility sprites ================= */
const WD=['#5a3a24','#7a5434','#9a7048','#b88a5a'],ST=['#5e5a54','#7a746a','#8a847a','#a8a298'],MT=['#4a4a56','#6a6a78','#8a8a96','#c0c0cc'];
function FS(w,h,fn){const c=mk(w,h),p=painter(c.getContext('2d'),1,1);fn(p);return finalize(c,{rim:false});}
const box=(p,x,y,w,h,P)=>{p(x,y,w,h,P[2]);p(x,y,w,1,P[3]);p(x+w-2,y,2,h,P[1]);p(x,y+h-1,w,1,P[0]);};
const FSPR={
  furnace:FS(32,36,p=>{box(p,3,12,24,20,ST);for(let y=14;y<30;y+=4)p(3,y,24,1,ST[1]);ell(p,15,13,10,7,'',(x,y,e)=>e>.8?ST[0]:y<10?ST[3]:ST[2]);p(10,20,10,10,'#1a1010');p(11,21,8,1,'#3a1a10');p(20,0,5,10,ST[1]);p(20,0,5,1,ST[3]);p(0,30,30,3,ST[0]);}),
  furnace2:FS(36,40,p=>{box(p,3,14,28,22,['#3a3238','#4e4448','#5e5458','#7a7074']);for(let y=16;y<34;y+=4)p(3,y,28,1,'#3a3238');ell(p,17,15,12,8,'',(x,y,e)=>e>.8?'#2a2228':y<11?'#7a7074':'#5e5458');p(11,22,12,12,'#140c18');p(23,0,6,12,'#4e4448');p(23,0,6,1,'#7a7074');p(0,34,34,3,'#2a2228');for(const x of [5,28])p(x,16,2,3,'#9a7ad0');}),
  wbench:FS(44,30,p=>{p(2,16,34,4,WD[2]);p(2,16,34,1,WD[3]);p(4,20,3,8,WD[0]);p(31,20,3,8,WD[0]);p(8,10,14,4,MT[1]);p(8,10,14,1,MT[3]);p(12,14,6,2,MT[0]);p(10,16,10,1,MT[0]);
    p(38,2,2,26,WD[1]);p(36,4,6,2,WD[2]);p(36,2,1,10,MT[3]);p(41,1,1,12,MT[2]);p(26,12,8,2,'#c8d0e8');p(26,12,1,4,WD[1]);}),
  med:FS(40,28,p=>{p(2,14,34,4,WD[2]);p(2,14,34,1,WD[3]);p(4,18,3,8,WD[0]);p(29,18,3,8,WD[0]);
    for(const [x,c] of [[6,'#ff6a8a'],[11,'#7ae0c0'],[16,'#8ad870']]){p(x,7,4,7,c);p(x+1,5,2,2,'#e8e4dc');p(x,7,1,7,'#ffffff');}ell(p,26,11,5,3,'#a8a298');p(24,9,4,2,'#5e5a54');p(28,4,1,6,WD[1]);p(18,10,2,4,'#3f6e2c');p(17,9,4,2,'#5f9a3a');}),
  line:FS(56,30,p=>{p(2,14,50,6,MT[1]);p(2,14,50,1,MT[3]);p(2,19,50,1,MT[0]);for(let x=4;x<50;x+=6)p(x,16,3,2,MT[0]);p(4,20,3,8,MT[0]);p(46,20,3,8,MT[0]);p(25,20,3,8,MT[0]);
    p(6,4,12,10,WD[2]);p(6,4,12,1,WD[3]);ell(p,36,8,5,5,'',(x,y,e)=>e>.6?MT[1]:MT[3]);p(35,7,2,2,MT[0]);p(44,6,6,8,MT[2]);p(44,6,6,1,MT[3]);p(46,3,2,3,'#f0d060');}),
  pot:FS(28,28,p=>{for(const [x,y] of [[2,22],[8,24],[16,24],[22,22]]){p(x,y,4,3,ST[2]);p(x,y,4,1,ST[3]);}p(3,2,1,22,WD[0]);p(23,2,1,22,WD[0]);p(3,2,21,1,WD[1]);p(13,3,1,4,MT[0]);
    ell(p,13,13,8,6,'',(x,y,e)=>e>.75?'#24242c':y<11?'#4a4a56':'#34343e');p(6,8,15,2,'#5a5a66');p(8,8,11,1,'#c8a070');}),
  mill:FS(40,42,p=>{box(p,4,16,22,22,WD);p(2,12,26,5,'#8a4a32');p(2,12,26,1,'#b8553f');p(12,26,6,12,WD[0]);
    ell(p,31,24,8,12,'',(x,y,e)=>e>.75?WD[0]:((x+y)%4<2?WD[2]:WD[1]));p(30,12,2,24,WD[0]);p(23,24,16,2,WD[0]);p(26,34,14,4,'#5ab8e8');p(26,34,14,1,'#c8f0ff');}),
  gen:FS(32,36,p=>{ell(p,14,16,12,12,'',(x,y,e)=>e>.8?WD[0]:e>.6?WD[2]:(Math.abs(x-14)<2||Math.abs(y-16)<2)?WD[1]:'');p(12,14,4,4,MT[2]);p(2,28,26,4,ST[2]);p(2,28,26,1,ST[3]);p(26,10,4,18,'#b87a3a');for(let y=11;y<27;y+=3)p(26,y,4,1,'#e8a85a');p(27,4,2,6,MT[2]);p(27,2,2,2,'#f0e060');}),
  chest:FS(22,18,p=>{box(p,1,5,18,10,WD);p(1,8,18,1,WD[0]);p(8,8,4,3,'#d8c070');p(1,3,18,3,WD[3]);}),
  chest2:FS(24,20,p=>{box(p,1,5,20,12,MT);p(1,9,20,1,MT[0]);p(9,9,4,4,'#f0d060');p(1,3,20,3,MT[3]);p(4,5,1,12,MT[0]);p(17,5,1,12,MT[0]);}),
  lamp:FS(10,32,p=>{p(4,8,2,22,WD[0]);p(2,28,6,2,ST[1]);p(1,2,8,7,'#2a2224');p(2,3,6,5,'#f0c870');p(2,1,6,1,'#4a3a34');p(4,0,2,1,'#4a3a34');}),
  bed:FS(46,18,p=>{for(const x of [1,16,31]){p(x,6,13,9,'#c8a850');p(x,6,13,2,'#e8d080');for(let i=0;i<4;i++)p(x+1+i*3,8+(i%2),2,1,'#a88838');p(x,14,13,1,'#7a6028');}}),
  bed2:FS(50,20,p=>{for(const [x,c] of [[1,'#e89ab0'],[17,'#8ab0e8'],[33,'#a8d890']]){p(x,4,15,12,WD[1]);p(x+1,5,13,10,'#f4f0e6');p(x+1,9,13,6,c);p(x+1,9,13,1,'#ffffff');p(x+2,6,5,3,'#ffffff');p(x,15,15,2,WD[0]);}}),
  spring:FS(58,30,p=>{ell(p,28,16,27,12,'',(x,y,e)=>e>.72?(hash2(x,y)<.5?ST[1]:ST[2]):e>.62?ST[3]:e<.25?'#7ad0e8':'#4aa8d0');for(const [x,y] of [[6,8],[44,6],[50,18],[8,22]]){p(x,y,5,3,ST[3]);p(x,y+2,5,1,ST[0]);}}),
  heater:FS(18,26,p=>{p(2,12,14,10,ST[2]);p(2,12,14,1,ST[3]);p(1,10,16,3,ST[1]);p(5,22,2,3,ST[0]);p(11,22,2,3,ST[0]);p(5,14,8,4,'#2a1a14');p(6,9,6,2,'#6e4a32');}),
  cooler:FS(20,26,p=>{box(p,2,8,16,16,WD);ell(p,10,15,5,5,'',(x,y,e)=>e>.6?MT[1]:(x+y)%3?'#c8e8ff':'#8ac0e0');p(9,14,2,2,MT[0]);for(const [x,y] of [[3,3],[13,1],[8,4]]){p(x,y,2,4,'#e8f8ff');p(x-1,y+1,4,2,'#a8d8f0');}}),
  incub:FS(28,24,p=>{box(p,1,10,24,10,WD);ell(p,13,10,11,4,'#c8a850');p(4,8,18,2,'#e8d080');p(10,0,6,2,MT[2]);p(12,2,2,6,MT[1]);}),
  cond:FS(22,38,p=>{p(2,28,18,6,ST[2]);p(2,28,18,1,ST[3]);p(5,20,12,9,ST[1]);p(5,20,12,1,ST[3]);p(0,34,22,3,ST[0]);p(8,4,6,16,'#8a6ad0');p(9,2,4,2,'#b8a0f0');p(8,4,2,16,'#c8b0ff');p(12,6,2,14,'#5a3a9a');}),
  mine:FS(44,38,p=>{ell(p,22,22,21,15,'',(x,y,e)=>e>.75?ST[1]:e>.5?ST[0]:'#0c0a0c');p(10,8,3,26,WD[1]);p(31,8,3,26,WD[1]);p(8,6,28,4,WD[2]);p(8,6,28,1,WD[3]);
    p(14,28,16,1,MT[2]);p(14,32,16,1,MT[2]);p(16,24,10,6,MT[1]);p(16,24,10,1,MT[3]);p(18,22,2,2,'#c8d8ff');p(22,21,3,3,'#c8d8ff');}),
  obspit:FS(42,32,p=>{ell(p,20,20,19,10,'',(x,y,e)=>e>.75?'#3a3234':e>.45?'#241c20':'#0c080c');for(const [x,y,h] of [[8,6,10],[14,10,8],[28,8,9]]){p(x,y,3,h,'#4a2e6a');p(x,y,1,h,'#9a7ad0');}p(34,2,2,18,WD[1]);p(30,1,10,3,MT[1]);p(30,1,10,1,MT[3]);}),
  turret:FS(26,48,p=>{p(4,14,2,32,WD[0]);p(20,14,2,32,WD[0]);for(let y=20;y<44;y+=8){p(5,y,16,1,WD[1]);}p(2,10,22,5,WD[2]);p(2,10,22,1,WD[3]);p(3,4,20,7,WD[1]);p(3,4,20,1,WD[3]);
    p(6,1,14,3,MT[1]);p(12,0,2,4,MT[3]);p(0,44,26,3,ST[1]);}),
  warp:FS(34,38,p=>{ell(p,16,30,15,6,'',(x,y,e)=>e>.7?ST[1]:e>.45?ST[3]:'#6a7a9a');p(13,6,7,24,ST[2]);p(13,6,7,1,ST[3]);p(18,6,2,24,ST[1]);p(12,4,9,3,ST[1]);for(let y=10;y<26;y+=5)p(15,y,3,2,'#6a9ad8');}),
  ranch:FS(76,40,p=>{const F=WD;for(let x=0;x<74;x+=9){p(x,4,2,10,F[0]);p(x,30,2,8,F[0]);}p(0,6,74,1,F[2]);p(0,10,74,1,F[2]);p(0,32,74,1,F[2]);p(0,35,74,1,F[2]);p(0,4,1,34,F[1]);p(73,4,1,34,F[1]);for(let y=4;y<36;y+=8)p(72,y,2,2,F[0]);
    p(52,20,16,6,F[1]);p(53,21,14,2,'#c8a850');}),
  breed:FS(66,38,p=>{const F=WD;for(let x=0;x<64;x+=9){p(x,4,2,10,F[0]);p(x,28,2,8,F[0]);}p(0,6,64,1,F[2]);p(0,10,64,1,F[2]);p(0,30,64,1,F[2]);p(0,33,64,1,F[2]);p(0,4,1,32,F[1]);p(63,4,1,32,F[1]);
    p(28,0,10,6,F[2]);p(30,2,2,2,'#ff6a8a');p(34,2,2,2,'#ff6a8a');p(31,3,4,2,'#ff6a8a');p(32,5,2,1,'#ff6a8a');p(6,18,14,6,'#c8a850');p(6,18,14,1,'#e8d080');}),
  fridge:FS(20,30,p=>{box(p,2,2,16,25,['#8a96a8','#b8c4d4','#dce4ee','#f4f8ff']);p(2,11,16,1,'#8a96a8');p(14,5,1,4,'#6a7688');p(14,14,1,6,'#6a7688');p(5,4,4,3,'#a8d8f0');}),
  egg:FS(8,9,p=>{ell(p,3,4,3,3.6,'',(x,y,e)=>e>.7?'#c8b898':y<3?'#fffaf0':'#f0e6d0');p(2,3,1,1,'#e8a0b0');p(4,5,1,1,'#a0c0e8');})};
function sprCropK(kind,st){const c=mk(10,12),p=painter(c.getContext('2d'),1,1);
  if(kind==='wheat'){for(const x of [2,4,6]){p(x,4,1,7,st?'#c8a840':'#6a9a3a');if(st){p(x-1,1,3,4,'#f0d070');p(x,1,1,4,'#fff0a0');}}}
  else if(kind==='herb'){p(4,5,2,6,'#3f6e2c');p(1,4,4,3,'#6ac050');p(5,3,4,3,'#8ad870');if(st){p(2,1,2,2,'#ffffff');p(6,0,2,2,'#f0f0ff');p(3,2,1,1,'#f0d060');}}
  else{p(3,4,2,6,'#3f6e2c');p(1,5,3,2,'#5f9a3a');p(5,3,3,2,'#8cc45a');if(st){p(1,1,2,2,'#d8304a');p(5,1,2,2,'#d8304a');p(1,1,1,1,'#ff8a9a');}}return finalize(c,{rim:false});}
const CROPS={berry:[sprCropK('berry',0),sprCropK('berry',1)],wheat:[sprCropK('wheat',0),sprCropK('wheat',1)],herb:[sprCropK('herb',0),sprCropK('herb',1)]};

function chestSpr(silver,open){const P=silver?['#4a4a56','#8a8a96','#c0c0cc','#e8eef8']:['#5a3a24','#7a5434','#9a7048','#b88a5a'],B=silver?'#f0d060':'#d8b060';
  return FS(20,17,p=>{p(2,8,16,8,P[1]);p(2,8,16,1,P[2]);p(2,15,16,1,P[0]);p(5,8,1,8,P[0]);p(14,8,1,8,P[0]);
    if(open){p(2,2,16,4,P[2]);p(2,2,16,1,P[3]);p(3,6,14,2,'#1a1210');if(silver){p(6,6,2,1,'#c8e0ff');p(11,6,2,1,'#f0d060');}else{p(7,6,2,1,'#f0d060');}}
    else{p(2,4,16,5,P[2]);p(2,4,16,1,P[3]);p(3,3,14,1,P[2]);p(5,4,1,5,P[0]);p(14,4,1,5,P[0]);p(9,7,3,4,B);p(10,8,1,2,'#5a3a24');}});}
const PORTALSPR=FS(40,48,p=>{const S2=['#4a4458','#6a6478','#8a8498','#aaa4b8'];p(4,10,6,34,S2[1]);p(4,10,1,34,S2[3]);p(9,10,1,34,S2[0]);p(30,10,6,34,S2[1]);p(30,10,1,34,S2[3]);p(35,10,1,34,S2[0]);
  p(2,4,36,7,S2[2]);p(2,4,36,1,S2[3]);p(2,10,36,1,S2[0]);p(16,1,8,4,S2[2]);p(18,2,4,2,'#c8a0ff');for(let y=14;y<40;y+=6){p(5,y,4,1,S2[0]);p(31,y,4,1,S2[0]);}
  p(10,11,20,33,'#2a1e3e');p(12,13,16,29,'#3e2a5e');p(15,18,10,20,'#5a3a8a');p(18,24,4,8,'#8a6ad0');p(0,43,40,4,S2[0]);p(0,43,40,1,S2[2]);});
const TCHEST={wood:[chestSpr(false,false),chestSpr(false,true)],silver:[chestSpr(true,false),chestSpr(true,true)]};

/* ================= items / tools ================= */
const WORKS={log:'벌목',mine:'채굴',farm:'재배',craft:'제작',fire:'불 지피기',water:'물 주기',elec:'발전',med:'약제',cool:'냉각',ranch:'목장'};
const ITEMS={wood:'나무',stone:'돌',berry:'열매',ore:'은빛 광석',obs:'흑요석',wheat:'밀',herb:'약초',wool:'털 뭉치',milk:'우유',honey:'꿀',egg:'새알',flour:'밀가루',ingot:'은빛 주괴',obsingot:'흑요 주괴',
  orb:'유대 구슬',orb2:'단단한 구슬',orb3:'흑요석 구슬',skewer:'열매 꼬치',bread:'빵',omelet:'새알 부침',pie:'열매 파이',cake:'꿀 케이크',potion:'회복약',tonic:'기운 회복제',arrow:'화살'};
const ITEMC={wood:'#e0b070',stone:'#d8d4cc',berry:'#ff8a9a',ore:'#c8d8ff',obs:'#b49ae0',wheat:'#f0d070',herb:'#8ad870',wool:'#f4f0e6',milk:'#ffffff',honey:'#ffc040',egg:'#f8e8c8',flour:'#fff4dc',ingot:'#dce6ff',obsingot:'#a888e0',
  orb:'#f4e0a0',orb2:'#c8d4ec',orb3:'#9a7ad0',skewer:'#ffc070',bread:'#e8b070',omelet:'#ffe080',pie:'#e07a6a',cake:'#ffd0e0',potion:'#ff6a8a',tonic:'#7ae0c0',arrow:'#e8c890'};
/* v51 아이템 픽셀 아이콘 12×12 (코드로 그림, 외곽선은 finalize) — HUD 인벤토리·가방·제작 창·퀘스트 필요 줄·날아오는 보상·나르는 생산품 */
const ICO_N=12,ICO={},ICO_URL={};
const ICO_DRAW={
  wood:p=>{p(1,4,8,5,'#9a6a36');p(1,4,8,1,'#c08a4c');p(1,8,8,1,'#7a5028');p(3,6,4,1,'#7a5028');p(8,3,3,7,'#e8c088');p(9,4,1,5,'#c89858');p(9,6,1,1,'#9a6a36');},
  stone:p=>{p(3,3,6,1,'#c8c4bc');p(2,4,8,4,'#aaa69e');p(1,6,10,3,'#9a968e');p(2,9,8,1,'#7a766e');p(3,4,3,1,'#e8e4dc');p(2,5,2,1,'#d8d4cc');p(7,7,2,1,'#86827a');},
  berry:p=>{p(5,1,2,2,'#5aa040');p(7,1,2,1,'#7ac850');p(2,4,4,4,'#e0506a');p(6,5,4,4,'#f06a80');p(3,8,2,1,'#b03a52');p(7,9,2,1,'#c0405a');p(3,4,1,1,'#ffc0c8');p(7,5,1,1,'#ffc0c8');},
  ore:p=>{p(2,5,8,4,'#8a867e');p(1,7,10,3,'#7a766e');p(3,4,6,1,'#9a968e');p(3,2,2,4,'#c8d8ff');p(6,3,2,3,'#a8c0f0');p(8,5,2,2,'#dce6ff');p(3,2,1,1,'#ffffff');p(6,3,1,1,'#eef4ff');},
  obs:p=>{p(5,1,2,1,'#c8b0f0');p(4,2,4,2,'#8a6ac0');p(3,4,6,3,'#6a4aa0');p(2,7,8,2,'#5a3a8a');p(3,9,6,1,'#3a2a5a');p(5,2,1,4,'#d8c8ff');p(4,4,1,2,'#b49ae0');},
  wheat:p=>{p(5,4,1,7,'#b08a40');p(4,1,2,2,'#f0d070');p(6,2,2,2,'#e8c060');p(3,3,2,2,'#e8c060');p(6,4,2,2,'#f0d070');p(3,5,2,2,'#d8b050');p(6,7,2,1,'#8ab040');p(3,8,2,1,'#8ab040');},
  herb:p=>{p(5,6,2,5,'#4a8a3a');p(2,3,3,4,'#6ac050');p(7,2,3,4,'#8ad870');p(4,1,3,4,'#7acc5a');p(3,4,1,1,'#b8f0a0');p(8,3,1,1,'#c8f8b0');p(1,7,3,2,'#5aa848');p(8,7,3,2,'#6ac050');},
  wool:p=>{p(3,3,3,2,'#f4f0e6');p(6,2,3,3,'#fbf8f0');p(2,5,8,4,'#f0ece0');p(1,6,10,2,'#e8e2d4');p(3,9,6,1,'#cfc6b4');p(4,3,1,1,'#ffffff');p(7,2,1,1,'#ffffff');p(8,7,2,1,'#d8d0c0');},
  milk:p=>{p(5,1,2,1,'#c84a3a');p(5,2,2,2,'#e8e8e8');p(4,4,4,1,'#f4f4f4');p(3,5,6,5,'#ffffff');p(3,10,6,1,'#c8ccd4');p(3,7,6,1,'#7ab8f0');p(4,5,1,2,'#ffffff');p(8,5,1,5,'#d8dce4');},
  honey:p=>{p(4,1,4,1,'#a86a2a');p(3,2,6,2,'#d8a050');p(2,4,8,6,'#ffc040');p(3,10,6,1,'#c88a20');p(3,4,2,3,'#ffe090');p(8,5,1,4,'#e8a030');p(4,2,4,1,'#f0c070');},
  egg:p=>{p(5,1,2,1,'#fbf2dc');p(4,2,4,1,'#f8e8c8');p(3,3,6,2,'#f8e8c8');p(2,5,8,4,'#f4e0bc');p(3,9,6,1,'#e0c89c');p(4,10,4,1,'#c8ae84');p(4,3,1,2,'#ffffff');p(7,6,1,2,'#e8d0a8');},
  flour:p=>{p(4,1,4,1,'#c8a878');p(5,2,2,1,'#a88858');p(3,3,6,1,'#f0e4c8');p(2,4,8,6,'#fff4dc');p(2,10,8,1,'#d8c8a4');p(4,6,4,2,'#e8c070');p(3,4,1,4,'#ffffff');p(9,5,1,4,'#e8dcc0');},
  ingot:p=>{p(3,4,6,1,'#f4f8ff');p(2,5,8,2,'#dce6ff');p(1,7,10,2,'#b8c4e0');p(1,9,10,1,'#8a96b4');p(3,5,3,1,'#ffffff');},
  obsingot:p=>{p(3,4,6,1,'#c8b0f0');p(2,5,8,2,'#a888e0');p(1,7,10,2,'#7a5ab0');p(1,9,10,1,'#4a3a7a');p(3,5,3,1,'#e0d0ff');},
  orb:p=>ICO_ORB(p,'#f4e0a0','#c8a050','#fff8dc','#8a5a2e'),
  orb2:p=>ICO_ORB(p,'#c8d4ec','#8a96b4','#f4f8ff','#4a5a7a'),
  orb3:p=>ICO_ORB(p,'#9a7ad0','#5a3a8a','#d8c8ff','#2a1a4a'),
  skewer:p=>{p(1,10,2,1,'#8a5a30');p(2,9,2,1,'#a87040');for(const [x,y,c] of [[3,6,'#ff8a9a'],[5,4,'#ffc070'],[7,2,'#ff8a9a']]){p(x,y,3,3,c);p(x,y,1,1,'#fff0e0');}p(9,1,2,1,'#c89058');},
  bread:p=>{p(3,3,6,1,'#e8b070');p(2,4,8,1,'#d89a58');p(1,5,10,4,'#c88848');p(2,9,8,1,'#9a6430');p(3,5,1,1,'#f8d8a0');p(5,4,1,2,'#f0c888');p(8,4,1,2,'#f0c888');p(2,6,1,2,'#d89a58');},
  omelet:p=>{p(1,7,10,3,'#e8e4dc');p(2,10,8,1,'#b8b4ac');p(2,5,8,3,'#ffe080');p(3,4,6,1,'#fff0b0');p(5,5,2,2,'#ffb030');p(5,5,1,1,'#ffe0a0');},
  pie:p=>{p(2,4,8,1,'#f0c070');p(1,5,10,4,'#d89a50');p(2,9,8,1,'#a86a30');p(3,5,2,2,'#e07a6a');p(7,6,2,2,'#c85a5a');p(5,7,2,1,'#e07a6a');p(3,4,6,1,'#f8d898');},
  cake:p=>{p(4,1,1,2,'#ff6a5a');p(2,3,8,2,'#fff0f4');p(2,5,8,2,'#ffd0e0');p(2,7,8,1,'#ffc040');p(2,8,8,2,'#f0b0c8');p(2,10,8,1,'#c88aa0');p(3,3,1,1,'#ffffff');},
  potion:p=>ICO_FLASK(p,'#ff6a8a','#c03a5a','#ffc0d0'),
  tonic:p=>ICO_FLASK(p,'#7ae0c0','#3aa088','#d0fff0'),
  arrow:p=>{p(1,9,2,2,'#f4f0e6');p(2,8,1,1,'#f4f0e6');p(1,10,1,1,'#d8d0c0');for(let i=0;i<6;i++)p(3+i,8-i,1,1,'#b08050');p(8,2,2,2,'#c8ccd4');p(9,1,2,2,'#e8ecf4');p(10,1,1,1,'#ffffff');}
};
function ICO_ORB(p,a,d,l,band){p(4,1,4,1,a);p(2,2,8,2,a);p(1,4,10,4,a);p(2,8,8,2,d);p(4,10,4,1,d);p(1,6,10,1,band);p(5,5,2,3,'#fbf6e9');p(5,6,2,1,band);p(3,2,2,2,l);p(2,4,1,1,l);}
function ICO_FLASK(p,a,d,l){p(5,1,2,2,'#a8784a');p(4,3,4,1,'#d8e4f0');p(5,4,2,1,'#c8d8e8');p(3,5,6,1,'#e8f0f8');p(2,6,8,4,a);p(3,10,6,1,d);p(8,6,1,4,d);p(3,6,1,2,l);p(2,5,1,1,'#c8d8e8');p(9,5,1,1,'#c8d8e8');}
function itIcon(k){if(ICO[k])return ICO[k];const c=mk(ICO_N,ICO_N),g=c.getContext('2d'),p=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const f=ICO_DRAW[k];if(f)f(p);else{p(2,2,8,8,ITEMC[k]||'#e0c080');p(2,2,8,1,'rgba(255,255,255,.6)');}finalize(c,{rim:false,outline:true});return ICO[k]=c;}
function icoUrl(k){if(ICO_URL[k])return ICO_URL[k];try{return ICO_URL[k]=itIcon(k).toDataURL();}catch(e){return '';}}
/* 제작 창용 장비 아이콘(아이템이 아닌 결과물) */
Object.assign(ICO_DRAW,{
  saddle:p=>{p(2,4,8,4,'#a8683a');p(3,3,6,1,'#c8844a');p(1,6,2,3,'#8a5028');p(9,6,2,3,'#8a5028');p(4,8,4,2,'#6a4020');p(5,5,2,1,'#e6c05a');p(3,4,2,1,'#e0a060');},
  vest:p=>{p(2,2,3,2,'#f4f0e6');p(7,2,3,2,'#f4f0e6');p(1,4,10,6,'#e8e2d4');p(5,4,2,6,'#c8a070');p(2,10,8,1,'#cfc6b4');p(2,4,1,4,'#ffffff');},
  silver:p=>{p(2,1,3,2,'#dce6ff');p(7,1,3,2,'#dce6ff');p(1,3,10,7,'#b8c4e0');p(4,3,4,1,'#4f86d6');p(5,4,2,5,'#dce6ff');p(2,10,8,1,'#8a96b4');p(2,3,1,5,'#f4f8ff');},
  obsarmor:p=>{p(2,1,3,2,'#a888e0');p(7,1,3,2,'#a888e0');p(1,3,10,7,'#6a4aa0');p(4,3,4,1,'#ff9a5a');p(5,4,2,5,'#a888e0');p(2,10,8,1,'#3a2a5a');p(2,3,1,5,'#c8b0f0');}
});
function recIcoH(r){let u='';try{if(r.weapon){const c=WSPR[r.weapon]||(WSPR[r.weapon]=mkWeapon(r.weapon));u=c.toDataURL();}else if(r.armor)u=icoUrl(r.armor);else if(r.saddle)u=icoUrl('saddle');else if(r.give)u=icoUrl(Object.keys(r.give)[0]);}catch(e){}
  return u?`<div class="pi"><img class="ico ${r.weapon?'wpn':'big'}" src="${u}" alt="" aria-hidden="true"></div>`:'';}
/* HTML용: 글자 높이에 맞춘 픽셀 아이콘(없으면 기존 색 네모) */
function icoH(k,big){const u=icoUrl(k);return u?`<img class="ico${big?' big':''}" src="${u}" alt="" aria-hidden="true">`:`<i style="--c:${ITEMC[k]||'#e0c080'}"></i>`;}
const FOODS={pie:{f:60,h:20},bread:{f:45,h:0},skewer:{f:40,h:15},omelet:{f:35,h:10},berry:{f:12,h:0}};
const ORBTYPES=[['orb3',2.4,'흑요석 구슬'],['orb2',1.6,'단단한 구슬'],['orb',1,'유대 구슬']];
const WEAPONS={club:{name:'나무 몽둥이',dmg:6,gather:1,col:'255,240,210',tier:0},axe:{name:'돌 도끼',dmg:11,gather:2,col:'220,235,255',tier:1},spear:{name:'은빛 창',dmg:18,gather:2,col:'190,215,255',tier:2,el:'바람'},obsword:{name:'흑요석 검',dmg:30,gather:3,col:'200,160,255',tier:3,el:'불'},bow:{name:'나무 활',dmg:4,gather:1,col:'240,220,170',tier:0,ranged:true}};
/* 활: 공격하면 사거리 안 가장 가까운 적에게 화살 1발(자동 조준). 화살이 없거나 적이 없으면 활로 때린다(채집 포함) */
const ARROW={dmg:12,range:190,spd:420,cd:.5};
const ARMORS={none:{name:'없음',red:0,tier:0},vest:{name:'털 조끼',red:.12,tier:1},silver:{name:'은빛 갑옷',red:.25,tier:2},obsarmor:{name:'흑요 갑옷',red:.4,tier:3}};
const RECIPES={
  bench:[{id:'orb',name:'유대 구슬',cost:{wood:2,stone:2,berry:1},t:4,give:{orb:1}},
         {id:'orb2',name:'단단한 구슬',cost:{stone:3,ore:1},t:6,give:{orb2:1}},
         {id:'orb3',name:'흑요석 구슬',cost:{stone:2,ore:1,obs:2},t:8,give:{orb3:1}},
         {id:'axe',name:'돌 도끼',cost:{wood:5,stone:5},t:8,weapon:'axe'},
         {id:'saddle',name:'안장',cost:{wood:8,stone:4,berry:4},t:8,saddle:true},
         {id:'bow',name:'나무 활',cost:{wood:8,stone:2},t:8,weapon:'bow',give:{arrow:10}},
         {id:'arrow',name:'화살 ×5',cost:{wood:2,stone:1},t:3,give:{arrow:5}}],
  wbench:[{id:'spear',name:'은빛 창',cost:{wood:4,ingot:3},t:12,weapon:'spear'},
          {id:'obsword',name:'흑요석 검',cost:{wood:2,obsingot:3},t:16,weapon:'obsword'},
          {id:'vest',name:'털 조끼',cost:{wool:5,wood:2},t:8,armor:'vest'},
          {id:'silver',name:'은빛 갑옷',cost:{ingot:5,wool:2},t:14,armor:'silver'},
          {id:'obsarmor',name:'흑요 갑옷',cost:{obsingot:4,wool:2},t:18,armor:'obsarmor'}],
  fire:[{id:'skewer',name:'열매 꼬치',cost:{berry:3},t:5,give:{skewer:1}}],
  pot:[{id:'bread',name:'빵',cost:{flour:2},t:6,give:{bread:1}},
       {id:'omelet',name:'새알 부침',cost:{egg:2,berry:1},t:6,give:{omelet:1}},
       {id:'pie',name:'열매 파이',cost:{flour:1,berry:3},t:8,give:{pie:1}},
       {id:'cake',name:'꿀 케이크',cost:{flour:2,milk:1,honey:1,egg:1},t:14,give:{cake:1}}],
  med:[{id:'potion',name:'회복약',cost:{herb:2,berry:1},t:6,give:{potion:1}},
       {id:'tonic',name:'기운 회복제',cost:{herb:2,honey:1},t:8,give:{tonic:1}}],
  line:[{id:'orbx',name:'유대 구슬 ×5',cost:{wood:8,stone:8,berry:4},t:10,give:{orb:5}},
        {id:'orb2x',name:'단단한 구슬 ×5',cost:{stone:12,ingot:2},t:14,give:{orb2:5}},
        {id:'orb3x',name:'흑요석 구슬 ×3',cost:{stone:6,obsingot:1,obs:4},t:18,give:{orb3:3}},
        {id:'potionx',name:'회복약 ×3',cost:{herb:5,berry:2},t:12,give:{potion:3}},
        {id:'arrowx',name:'화살 ×20',cost:{wood:6,stone:3},t:8,give:{arrow:20}}]};
const RECIPE_DESC={arrow:'나무 활로 쏜다 · 한 발 피해 12',saddle:'탈것에 올라타는 데 필요하다 · 한 번만 만들면 모든 탈것에 쓴다',orb:'포획률 1배',orb2:'포획률 1.6배',orb3:'포획률 2.4배',bread:'포만감 +45 · 먹으면 2분 작업 속도 +25%·기력 회복 +30%',omelet:'포만감 +35 · 체력 +10 · 먹으면 1분 30초 받는 피해 -12%',pie:'포만감 +60 · 체력 +20 · 먹으면 2분 30초 공격 +12%·작업 속도 +25%',cake:'번식 농장의 재료',potion:'체력 +50',tonic:'거점 몬스터 기분 +50, 체력 회복',skewer:'포만감 +40 · 체력 +15 · 먹으면 1분 30초 공격 +10%'};
/* tiers: 0 start · 1 로웬 수호자 · 2 평원 수호자 · 3 암석+호수 수호자 */
const TIER_NAME=['처음부터','느티 진정 후','질풍 진정 후','반석·물안개 진정 후'];
const BASE={x:640,y:1000,rx:430,ry:330};
const FACDEF={
  // hub
  campfire:{name:'모닥불',x:700,y:976,tier:0,built:true,kind:'craft',craft:'fire',work:['fire'],cap:1,helper:true,sz:[18,6],desc:'요리를 한다. 불 곁에서는 밤에도 밝다.'},
  palbox:{name:'몬스터 상자',x:572,y:966,tier:0,built:true,kind:'box',sz:[20,6],desc:'잡은 몬스터를 관리한다.'},
  feed:{name:'먹이 상자',x:572,y:1064,tier:0,cost:{wood:5},kind:'passive',sz:[24,6],desc:'거점 몬스터가 여기서 먹이를 꺼내 먹는다. 기본은 열매부터, \'요리 먼저 먹이기\'를 켜면 파이·빵 같은 요리부터 먹고 일정 시간 작업·공격이 오른다.'},
  chest:{name:'나무 상자',x:500,y:1060,tier:0,cost:{wood:10},kind:'passive',sz:[20,6],desc:'자동 생산품 저장 한도 +60 (기본 40).'},
  lamps:{name:'등불 기둥',x:640,y:1140,tier:0,cost:{wood:8,stone:4},kind:'passive',sz:[6,4],multi:[[640,1140],[640,880],[470,1000],[810,1000]],desc:'거점 네 곳을 밝힌다. 밤에도 몬스터가 제 힘을 낸다.'},
  warp:{name:'거점 이동 비석',x:706,y:1068,tier:0,built:true,cost:{},kind:'warp',sz:[26,8],desc:'거점의 이동 비석. 각 지역에서 깨운 비석으로 순간이동한다.'},
  // production (NW)
  bench:{name:'작업대',x:390,y:840,tier:0,cost:{wood:6,stone:3},kind:'craft',craft:'bench',work:['craft'],cap:2,helper:true,sz:[48,10],desc:'구슬과 도구를 만든다. 제작 적성이 있는 몬스터가 거든다.'},
  wbench:{name:'무기 작업대',x:480,y:840,tier:1,cost:{wood:12,stone:8},kind:'craft',craft:'wbench',work:['craft'],cap:2,helper:true,sz:[40,8],desc:'주괴로 무기와 갑옷을 만든다.'},
  med:{name:'제약대',x:300,y:840,tier:1,cost:{wood:10,berry:6},kind:'craft',craft:'med',work:['med'],cap:2,helper:true,sz:[38,8],desc:'약초로 회복약을 만든다. 약제 적성이 있는 몬스터가 거든다.'},
  line:{name:'생산 라인',x:568,y:840,tier:2,cost:{ingot:8,wood:10},kind:'craft',craft:'line',work:['craft'],cap:3,power:true,sz:[52,8],desc:'구슬과 약을 한꺼번에 만든다. 발전기가 돌아가야 움직이고, 직접 거들 수 없다.'},
  pot:{name:'조리 냄비',x:380,y:922,tier:1,cost:{stone:8,ingot:2},kind:'craft',craft:'pot',work:['fire'],cap:1,helper:true,sz:[24,6],desc:'밀가루와 열매로 요리를 한다. 불 지피기 적성 몬스터가 불을 지핀다.'},
  furnace:{name:'용광로',x:400,y:762,tier:1,cost:{stone:20,wood:6},kind:'conv',work:['fire'],cap:2,in:{ore:2,wood:1},out:{ingot:1},t:18,sz:[28,8],desc:'은빛 광석을 녹여 주괴를 만든다. 불 지피기 적성 몬스터가 있어야 불이 붙는다.'},
  furnace2:{name:'고온 용광로',x:500,y:762,tier:3,cost:{ingot:10,stone:20},kind:'conv',work:['fire'],cap:2,minLv:2,in:{obs:2,ingot:1},out:{obsingot:1},t:28,sz:[32,8],desc:'흑요석을 녹여 흑요 주괴를 만든다. 불 지피기 적성 ★2 이상만 다룰 수 있다.'},
  mill:{name:'제분기',x:470,y:922,tier:1,cost:{wood:14,stone:10},kind:'conv',work:['water'],cap:2,in:{wheat:2},out:{flour:1},t:10,sz:[34,8],desc:'물레방아로 밀을 빻아 밀가루를 만든다. 물 주기 적성 몬스터가 물레를 돌린다.'},
  gen:{name:'발전기',x:292,y:922,tier:2,cost:{ingot:6,stone:10,wood:6},kind:'gen',work:['elec'],cap:2,sz:[30,8],desc:'발전 적성 몬스터가 바퀴를 돌려 전기를 만든다. 생산 라인과 냉장고가 쓴다.'},
  chest2:{name:'금속 상자',x:560,y:922,tier:2,cost:{ingot:6},kind:'passive',sz:[22,6],desc:'자동 생산품 저장 한도 +200.'},
  // resources (NE)
  log:{name:'벌목장',x:740,y:840,tier:0,cost:{wood:8},kind:'prod',work:['log'],cap:2,make:{wood:1},base:22,sz:[40,8],desc:'벌목 적성 몬스터가 나무를 만든다.'},
  quarry:{name:'채석장',x:850,y:840,tier:0,cost:{wood:6,stone:4},kind:'prod',work:['mine'],cap:2,make:{stone:1},base:26,bonus:['ore',.15],sz:[38,8],desc:'채굴 적성 몬스터가 돌을 캔다. 가끔 은빛 광석이 나온다.'},
  mine:{name:'광산',x:780,y:762,tier:2,cost:{wood:10,stone:10,ingot:2},kind:'prod',work:['mine'],cap:3,make:{ore:1},base:34,sz:[40,8],desc:'채굴 적성 몬스터가 은빛 광석을 캔다.'},
  obspit:{name:'흑요석 채굴장',x:880,y:762,tier:3,cost:{ingot:6,stone:20},kind:'prod',work:['mine'],cap:2,minLv:2,make:{obs:1},base:44,sz:[38,8],desc:'채굴 적성 ★2 이상 몬스터가 흑요석을 캔다.'},
  // farm (SW)
  farm:{name:'열매 밭',x:400,y:1082,tier:0,cost:{wood:4,berry:3},kind:'prod',field:'berry',work:['farm','water'],cap:2,make:{berry:2},base:28,sz:[0,0],desc:'재배 적성 몬스터가 열매를 기른다. 물 주기 적성 몬스터도 거든다.'},
  herb:{name:'약초밭',x:300,y:1082,tier:1,cost:{wood:6,berry:5},kind:'prod',field:'herb',work:['farm','water'],cap:2,make:{herb:1},base:30,sz:[0,0],desc:'약초를 기른다. 제약대의 재료.'},
  wheat:{name:'밀밭',x:500,y:1150,tier:1,cost:{wood:6,berry:8},kind:'prod',field:'wheat',work:['farm','water'],cap:3,make:{wheat:2},base:30,sz:[0,0],desc:'밀을 기른다. 제분기에서 밀가루가 된다.'},
  ranch:{name:'목장',x:388,y:1166,tier:1,cost:{wood:20,stone:6},kind:'ranch',work:['ranch'],cap:4,sz:[0,0],desc:'목장 적성 몬스터를 풀어 두면 털, 우유, 꿀, 새알을 얻는다.'},
  fridge:{name:'냉장고',x:290,y:1166,tier:2,cost:{ingot:4,stone:6},kind:'passive',power:true,sz:[16,6],desc:'전기가 돌면 먹이가 오래 간다. 거점 몬스터의 배고픔이 천천히 찬다.'},
  bed:{name:'짚 침대',x:404,y:1246,tier:0,cost:{wood:10,berry:2},kind:'passive',beds:6,sz:[44,6],desc:'몬스터 6마리의 잠자리. 잠자리가 있으면 기분이 덜 떨어지고 빨리 회복된다.'},
  bed2:{name:'푹신 침대',x:520,y:1246,tier:3,cost:{wool:10,wood:10},kind:'passive',beds:10,sz:[48,6],desc:'몬스터 10마리의 잠자리.'},
  // monsters (SE)
  spring:{name:'온천',x:790,y:1082,tier:1,cost:{stone:24,wood:4},kind:'spring',cap:3,sz:[0,0],desc:'기분이 바닥난 몬스터가 스스로 찾아와 쉰다.'},
  heater:{name:'화로',x:898,y:1082,tier:2,cost:{stone:14,ingot:2},kind:'temp',work:['fire'],cap:1,sz:[16,6],desc:'불 지피기 적성 몬스터가 불을 지키면 밤의 추위로 기분이 떨어지지 않는다. 알도 빨리 깬다.'},
  cooler:{name:'냉풍기',x:980,y:1082,tier:2,cost:{ingot:3,wood:6},kind:'temp',work:['cool'],cap:1,sz:[18,6],desc:'냉각 적성 몬스터가 바람을 일으키면 한낮의 더위로 기분이 떨어지지 않는다.'},
  breed:{name:'번식 농장',x:770,y:1170,tier:3,cost:{wood:20,wool:6,ingot:2},kind:'breed',work:['any'],cap:2,sz:[0,0],desc:'몬스터 두 마리와 꿀 케이크로 알을 얻는다. 알은 부화기로 간다.'},
  incub:{name:'알 부화기',x:880,y:1166,tier:3,cost:{ingot:6,wool:4},kind:'incub',sz:[26,6],desc:'알을 최대 3개 품는다. 화로가 켜져 있으면 빨리 깬다.'},
  cond:{name:'정수 응축기',x:970,y:1166,tier:3,cost:{ingot:8,ore:8},kind:'cond',sz:[20,6],desc:'같은 몬스터를 합쳐 랭크(★)를 올린다. 랭크마다 작업 효율 +15%, 체력·공격 +10%.'},
  // defense
  turret1:{name:'방어 망루',x:262,y:1010,tier:2,cost:{wood:12,ingot:3},kind:'turret',sz:[16,6],desc:'거점에 들어온 적대 몬스터에게 쇠뇌를 쏜다.'},
  turret2:{name:'방어 망루',x:1018,y:1010,tier:2,cost:{wood:12,ingot:3},kind:'turret',sz:[16,6],desc:'거점에 들어온 적대 몬스터에게 쇠뇌를 쏜다.'}};
for(const k in FACDEF){const f=FACDEF[k];f.k=k;if(f.work&&!Array.isArray(f.work))f.work=[f.work];}
const PADS=Object.values(FACDEF).filter(f=>f.kind!=='ranch'&&f.kind!=='breed'&&!f.field&&f.k!=='lamps').map(f=>({x:f.x,y:f.y-4,rx:Math.max(18,f.sz[0]/2+12),ry:13}));
/* extra work suitability + ranch produce */
const WORK_ADD={
  fire:{firefly:1,sunflower:1,windfox:1,snail:2,emberslime:2,lavalizard:2,volsheep:2,flamewisp:3,magmagolem:3,embertree:1,phoenix:3,ashbat:1,g_volcano:3},
  water:{frog:2,turtle:1,leafdrop:1,waterslime:2,clam:1,carp:1,lotus:1,otter:1,watergolem:2,puffer:1,lakesnake:1,kingfisher:1,g_lake:3},
  elec:{firefly:1,lark:1,rat:1,jelly:2,crystalbat:2,mist:1,g_plains:3},
  med:{fairy:2,leafdrop:1,mosswisp:2,cavemush:2,lotus:2,honeybug:1,sunflower:1,turtle:1,mist:1,g_rowen:3},
  cool:{mist:3,waterslime:1,crystalbat:1,watergolem:2,clam:1,jelly:1,goat:1,g_lake:3},
  ranch:{sheep:2,volsheep:1,goat:1,bull:1,honeybug:2,sparrow:1,lark:1}};
const RANCH_ITEM={sheep:'wool',volsheep:'wool',goat:'milk',bull:'milk',honeybug:'honey',sparrow:'egg',lark:'egg'};
for(const [w,m] of Object.entries(WORK_ADD))for(const [k,l] of Object.entries(m))if(SPECIES[k])SPECIES[k].work[w]=l;
/* facility tier ← earliest region tier where a capturable monster with the needed work (and level) lives */
const REGION_TIER={rowen:0,plains:1,rock:2,lake:2,volcano:3};
function workSources(ws,minLv=1){const out=[];for(const k of DEX_ORDER){const sp=SPECIES[k];if(!sp||sp.boss)continue;let lv=0;for(const w of ws)lv=Math.max(lv,w==='any'?1:(sp.work[w]||0));if(lv>=minLv)out.push({k,lv,t:REGION_TIER[sp.r]??9});}return out.sort((a,b)=>a.t-b.t||b.lv-a.lv);}
for(const k in FACDEF){const f=FACDEF[k];if(!f.work||f.helper)continue;const src=workSources(f.work,f.minLv||1),need=src.length?src[0].t:9;if(need>f.tier){f.tierOrig=f.tier;f.tier=need;}}
for(const k in FACDEF)if(FACDEF[k].power)FACDEF[k].tier=Math.max(FACDEF[k].tier,FACDEF.gen.tier);
const PHASES=[[4,'새벽'],[7,'낮'],[17,'노을'],[20,'밤']];
function phaseOf(h){let n='밤';for(const [s,name] of PHASES)if(h>=s)n=name;return n;}
const ENVK=[
  [0,{amb:[56,66,122],grade:[86,118,214,.34],sh:.1,lk:1,dust:0,fly:1}],
  [4,{amb:[60,68,124],grade:[90,110,210,.32],sh:.1,lk:1,dust:0,fly:.8}],
  [5.5,{amb:[176,156,196],grade:[230,150,200,.32],sh:.16,lk:.45,dust:.4,fly:.2}],
  [7,{amb:[255,248,236],grade:[255,214,160,.24],sh:.26,lk:0,dust:1,fly:0}],
  [16.5,{amb:[255,246,230],grade:[255,206,150,.26],sh:.26,lk:0,dust:1,fly:0}],
  [18.5,{amb:[228,160,140],grade:[255,130,86,.38],sh:.2,lk:.65,dust:.6,fly:.3}],
  [20.5,{amb:[64,72,128],grade:[86,118,214,.34],sh:.1,lk:1,dust:0,fly:1}],
  [24,{amb:[56,66,122],grade:[86,118,214,.34],sh:.1,lk:1,dust:0,fly:1}]];
function envAt(h){let a=ENVK[0],b=ENVK[1];for(let i=0;i<ENVK.length-1;i++)if(h>=ENVK[i][0]&&h<=ENVK[i+1][0]){a=ENVK[i];b=ENVK[i+1];break;}
  const u=(h-a[0])/((b[0]-a[0])||1),L=(x,y)=>x+(y-x)*u,A=a[1],B=b[1];
  return {amb:A.amb.map((v,i)=>L(v,B.amb[i])),grade:A.grade.map((v,i)=>L(v,B.grade[i])),sh:L(A.sh,B.sh),lk:L(A.lk,B.lk),dust:L(A.dust,B.dust),fly:L(A.fly,B.fly)};}
const HOUR_SEC=20;

/* ================= sprites ================= */
buildMonSprites();
function sprRockP(seed,big,P){const w=big?30:22,h=big?22:16,c=mk(w+2,h+2),g=c.getContext('2d'),p=painter(g,1,1),r=rng(seed);
  ell(p,w/2,h/2+1,w/2-.5,h/2-1,'',(x,y,e)=>{const l=-(x-w/2)/w*.8-(y-h/2)/h+(hash2(x+seed,y)-.5)*.3;return e>.85?P[0]:l>.35?P[3]:l>0?P[2]:P[1];});
  for(let i=0;i<3;i++){const x=3+Math.floor(r()*(w-8)),y=4+Math.floor(r()*(h-8));p(x,y,3,1,P[0]);p(x+2,y+1,2,1,P[0]);}return finalize(c,{rim:false});}
function sprObs(){const c=mk(26,26),p=painter(c.getContext('2d'),1,1);
  ell(p,12,17,11,7,'',(x,y,e)=>e>.85?'#1a1214':y<15?'#3a3234':'#2a2224');
  for(const [x,y,h] of [[5,7,9],[10,2,14],[15,6,10],[19,10,6]]){p(x,y,3,h,'#4a2e6a');p(x,y,1,h,'#9a7ad0');p(x+2,y+1,1,h-1,'#22142e');p(x+1,y-1,1,1,'#c8b0f0');}return finalize(c,{rim:false});}
function sprReed(){const c=mk(12,18),p=painter(c.getContext('2d'),1,1);for(const [x,h] of [[2,14],[5,16],[8,12]]){p(x,16-h,1,h,'#5a8a3a');p(x,16-h,1,3,'#8a6a3a');}p(1,10,3,1,'#7ab048');return finalize(c,{rim:false});}
function sprVent(){const c=mk(20,12),p=painter(c.getContext('2d'),1,1);ell(p,9,6,9,4.5,'',(x,y,e)=>e>.7?'#2a2224':'#140c0c');p(6,4,6,2,'#3a1410');return finalize(c,{rim:false});}
function sprCave(){const c=mk(64,40),p=painter(c.getContext('2d'),1,1);ell(p,31,24,31,16,'',(x,y,e)=>e>.75?'#5a544c':e>.5?'#3a3632':'#0c0a0c');for(let i=0;i<6;i++)p(8+i*8,8+(i%2)*3,6,4,'#6e665a');return finalize(c,{rim:false});}
function sprDead(seed){const c=mk(48,62),p=painter(c.getContext('2d')),r=rng(seed);p(21,30,6,28,'#2a2020');p(25,30,2,28,'#1a1414');p(18,56,12,3,'#1e1818');
  const br=(x,y,dx,len,d)=>{for(let i=0;i<len;i++){p(Math.round(x+dx*i),Math.round(y-i),2,2,'#2e2424');if(d>0&&i===Math.floor(len*.6))br(x+dx*i,y-i,-dx*.6,Math.round(len*.5),d-1);}};
  br(23,32,-1.1,14,1);br(25,30,1,16,1);br(24,26,.2,14,0);for(let i=0;i<6;i++)p(10+Math.floor(r()*28),8+Math.floor(r()*20),1,1,'#ff7a3a');return finalize(c,{rim:false});}
{const c=mk(8,8),p=painter(c.getContext('2d'),1,1);p(0,0,6,6,'#4a2e6a');p(0,0,6,3,'#9a7ad0');p(0,3,6,1,'#1a1020');p(2,2,2,2,'#f0e0ff');ORBS.push(c);}
function sprAltar(){const c=mk(46,40),p=painter(c.getContext('2d'),1,1);p(4,26,36,10,'#7a746a');p(4,26,36,2,'#a8a298');p(0,34,44,4,'#5e5a54');p(10,12,24,16,'#8a847a');p(10,12,24,2,'#b0aa9e');p(30,12,4,16,'#5e5a54');p(6,6,32,7,'#6a645c');p(6,6,32,2,'#9a948a');p(12,8,20,3,'#2a2224');for(let i=0;i<5;i++)p(12+i*5,18,2,6,'#c8b080');return finalize(c,{rim:false});}
const ALTARSPR=sprAltar();
const OBS=sprObs(),REED=sprReed(),VENT=sprVent(),CAVE=sprCave();
const RP={rock:['#5e5a54','#7a756c','#9a948a','#b8b2a6'],basalt:['#141012','#241c1e','#342a2a','#4a3c38'],moss:['#4a5a44','#5e6e54','#7a8a6a','#98a888']};
const ROCKSET={rowen:[sprRockP(3,true,RP.rock),sprRockP(7,false,RP.rock)],plains:[sprRockP(11,false,RP.moss),sprRockP(13,true,RP.moss)],rock:[sprRockP(3,true,RP.rock),sprRockP(7,false,RP.rock),sprRockP(11,true,RP.rock),sprRockP(19,false,RP.rock)],
  lake:[sprRockP(23,false,RP.moss),sprRockP(29,true,RP.rock)],volcano:[sprRockP(31,true,RP.basalt),sprRockP(37,false,RP.basalt),sprRockP(41,true,RP.basalt)]};
TREEPAL.push(['#1a1616','#262020','#342a26','#44362e','#56443a','#6a5446']);
const TREESET={rowen:TREES,plains:[makeTree(91,TREEPAL[1]),makeTree(93,TREEPAL[0]),makeTree(97,TREEPAL[2])],rock:[makeTree(101,TREEPAL[2]),makeTree(103,TREEPAL[3])],lake:[makeTree(107,TREEPAL[1]),makeTree(109,TREEPAL[3]),makeTree(111,TREEPAL[0])],volcano:[sprDead(1),sprDead(2),sprDead(3)]};

/* ================= regions ================= */
const GPAL={grass:['#3e6c33','#4b7d38','#598e3f','#679d46','#77ac4e','#89ba58'],meadow:['#5a8e3e','#68a046','#78b050','#88c05a','#98cc66','#a8d474'],lakeg:['#3a6e3e','#467e46','#548e4e','#629c58','#72aa62','#84b870'],
  rock:['#6e665a','#7e7668','#8e8676','#9e9684','#aea692','#bab2a0'],basalt:['#221c1e','#2c2426','#362c2c','#403432','#4c3e3a','#584842']};
function mkWeapon(k){const c=mk(24,9),g=c.getContext('2d'),p=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  if(k==='club'){p(0,4,7,1,'#7a4e2a');p(0,3,5,1,'#5a3820');p(6,3,7,3,'#8a5a30');p(7,2,5,1,'#a87444');p(7,6,5,1,'#5a3820');p(9,4,1,1,'#5a3820');}
  else if(k==='axe'){p(0,4,13,1,'#7a4e2a');p(0,5,12,1,'#5a3820');p(9,1,4,3,'#c8ccd4');p(9,5,4,3,'#9aa0aa');p(12,0,2,9,'#e8ecf4');p(13,1,1,7,'#ffffff');p(8,3,2,3,'#4a4a52');}
  else if(k==='spear'){p(0,4,17,1,'#8a5a30');p(0,5,16,1,'#5a3820');p(15,3,2,3,'#3a3a44');p(17,3,5,3,'#b8c8e0');p(17,4,6,1,'#ffffff');p(22,4,2,1,'#e8f0ff');p(19,2,2,1,'#90a0c0');p(19,6,2,1,'#90a0c0');}
  else if(k==='bow'){p(0,4,4,1,'#6a4428');p(3,0,1,9,'#f0e8d8');p(4,0,1,1,'#7a4e2a');p(4,8,1,1,'#7a4e2a');p(5,1,1,2,'#9a6838');p(5,6,1,2,'#9a6838');p(6,3,1,3,'#b07a44');p(5,3,1,3,'#6a4428');p(6,2,1,1,'#7a4e2a');p(6,6,1,1,'#7a4e2a');}
  else{p(0,4,4,1,'#3a2a44');p(0,3,3,1,'#2a1e34');p(4,1,1,7,'#e0b050');p(5,3,12,3,'#3a2856');p(5,3,12,1,'#b090e8');p(17,4,2,1,'#c8a8ff');p(6,4,10,1,'#6a4a9a');}
  return c;}

/* 양감 처리 — 원본 도트(외곽선 없는 원화) 위에 형태 명암·휴 시프트·반사광·선택적 외곽선을 입힌다.
   volumize(canvas, opt) → 새 canvas(사방 1px 여백). 원본 구조는 그대로, 픽셀 색만 바꾼다. */
function volumize(src,opt={}){
  /* v4.8.2: silEdge=false — 실루엣 가장자리(투명과 맞닿은 면)는 그늘을 넣지 않는다(외곽선과 겹쳐 2픽셀 두께로 보였음). rimK 반사광 기본 0. olK 외곽선 변화 폭(원본 finalize 외곽선 기준) */
  const o=Object.assign({k:1,light:[-0.55,-0.7,0.55],hi:.30,sh1:.80,sh2:.62,warm:[255,236,196],cool:[62,52,128],rim:[170,205,255],rimK:0,silEdge:false,olK:.35,stripOutline:false,minRegion:6,bigRegion:40,aoRows:2},opt);
  const W=src.width,H=src.height,g0=src.getContext('2d'),s=g0.getImageData(0,0,W,H).data;
  const P=opt.pad??1,w=W+2*P,h=H+2*P,N=w*h;
  const R=new Float32Array(N),G=new Float32Array(N),B=new Float32Array(N),A=new Uint8Array(N);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4,j=(y+P)*w+x+P;if(s[i+3]>128){R[j]=s[i];G[j]=s[i+1];B[j]=s[i+2];A[j]=1;}}
  const lum=j=>.3*R[j]+.59*G[j]+.11*B[j];
  const nb=[[1,0],[-1,0],[0,1],[0,-1]];
  if(o.stripOutline){ // 기존 어두운 외곽선 제거(안쪽 이웃보다 많이 어두운 테두리 픽셀)
    const kill=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const j=y*w+x;if(!A[j])continue;
      let edge=false,inner=-1;for(const [dx,dy] of nb){const k=(y+dy)*w+x+dx;if(!A[k])edge=true;else if(inner<0)inner=k;}
      if(edge&&inner>=0&&lum(j)<lum(inner)*.62)kill.push(j);}
    for(const j of kill)A[j]=0;}
  const key=j=>(R[j]>>3)<<10|(G[j]>>3)<<5|(B[j]>>3);
  // 실루엣 거리장
  const ds=new Float32Array(N).fill(0);
  for(let j=0;j<N;j++)ds[j]=A[j]?99:0;
  for(let it=0;it<2;it++){
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const j=y*w+x;if(!A[j])continue;let m=ds[j];if(x>0)m=Math.min(m,ds[j-1]+1);if(y>0)m=Math.min(m,ds[j-w]+1);if(x>0&&y>0)m=Math.min(m,ds[j-w-1]+1.4);if(x<w-1&&y>0)m=Math.min(m,ds[j-w+1]+1.4);ds[j]=m;}
    for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const j=y*w+x;if(!A[j])continue;let m=ds[j];if(x<w-1)m=Math.min(m,ds[j+1]+1);if(y<h-1)m=Math.min(m,ds[j+w]+1);if(x<w-1&&y<h-1)m=Math.min(m,ds[j+w+1]+1.4);if(x>0&&y<h-1)m=Math.min(m,ds[j+w-1]+1.4);ds[j]=m;}}
  // 같은 색 영역(연결 요소) + 영역 경계 거리
  const reg=new Int32Array(N).fill(-1),area=[];let rc=0;
  for(let j=0;j<N;j++){if(!A[j]||reg[j]>=0)continue;const k0=key(j),st=[j];reg[j]=rc;let n=0;
    while(st.length){const q=st.pop();n++;const qx=q%w,qy=(q/w)|0;for(const [dx,dy] of nb){const xx=qx+dx,yy=qy+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const k=yy*w+xx;if(A[k]&&reg[k]<0&&key(k)===k0){reg[k]=rc;st.push(k);}}}
    area.push(n);rc++;}
  const dr=new Float32Array(N);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const j=y*w+x;if(!A[j])continue;let m=4;
    for(let r=1;r<=3&&m===4;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const xx=x+dx,yy=y+dy;const k=yy*w+xx;if(xx<0||yy<0||xx>=w||yy>=h||!A[k]||reg[k]!==reg[j]){m=Math.min(m,r);}}
    dr[j]=m;}
  // 색 덩어리별 방향 명암(왼쪽 위 광원): 오른쪽·아래 가장자리 그늘, 왼쪽·위 가장자리 하이라이트, 큰 덩어리는 오른쪽 1/3 원통 그늘
  const band=new Int8Array(N);
  let ymin=h,ymax=0;for(let j=0;j<N;j++)if(A[j]){const y=(j/w)|0;ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);}
  const bx0=new Int32Array(rc).fill(1e9),bx1=new Int32Array(rc).fill(-1);
  for(let j=0;j<N;j++)if(A[j]){const x=j%w,r=reg[j];if(x<bx0[r])bx0[r]=x;if(x>bx1[r])bx1[r]=x;}
  /* 같은 색 덩어리 안에서 (dx,dy)로 몇 칸 이어지는지. 실루엣(투명) 때문에 끊긴 경우 silEdge가 꺼져 있으면 그늘 판정에서 '이어짐'으로 본다 */
  const run=(j,dx,dy)=>{let x=j%w,y=(j/w)|0,n=0;for(;n<4;n++){x+=dx;y+=dy;if(x<0||y<0||x>=w||y>=h)return o.silEdge?n:4;const k=y*w+x;if(!A[k])return o.silEdge||n?n:4;if(reg[k]!==reg[j])break;}return n;};
  for(let j=0;j<N;j++){if(!A[j])continue;const r=reg[j];if(area[r]<o.minRegion)continue;
    const dR=run(j,1,0),dB=run(j,0,1),dL=run(j,-1,0),dT=run(j,0,-1),x=j%w,y=(j/w)|0;
    let b=-((dR===0?1:0)+(dB===0?1:0));
    if(area[r]>=o.bigRegion&&b===0){const wd=bx1[r]-bx0[r]+1;if(wd>=5&&x>=bx1[r]-Math.max(1,Math.round(wd/3))+1)b=-1;}
    if(b===0&&(dL===0||dT===0)&&dR>=1&&dB>=1)b=1;
    if(o.k>=.5&&y>ymax-o.aoRows&&b<=0)b=Math.max(-2,b-1);
    band[j]=Math.max(o.k>=.8?-2:-1,b);}
  // 색 적용
  const out=document.createElement('canvas');out.width=w;out.height=h;const og=out.getContext('2d'),im=og.createImageData(w,h),d=im.data;
  const mix=(a,b,t)=>a+(b-a)*t;/*shared*/
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const j=y*w+x,i=j*4;if(!A[j])continue;
    let r=R[j],g=G[j],b=B[j];const L=lum(j);
    const small=area[reg[j]]<o.minRegion||L>232;        // 눈·하이라이트 같은 작은 디테일은 보존
    let bd=small?0:band[j];
    const K=o.k,s1=1-(1-o.sh1)*K,s2=1-(1-o.sh2)*K;
    if(bd===1){r=mix(r,o.warm[0],o.hi*K);g=mix(g,o.warm[1],o.hi*K);b=mix(b,o.warm[2],o.hi*.8*K);}
    else if(bd===-1){r=mix(r*s1,o.cool[0],.16*K);g=mix(g*s1,o.cool[1],.16*K);b=mix(b*s1,o.cool[2],.2*K);}
    else if(bd===-2){r=mix(r*s2,o.cool[0],.26*K);g=mix(g*s2,o.cool[1],.26*K);b=mix(b*s2,o.cool[2],.32*K);}
    // 반사광: 오른쪽·아래 실루엣 가장자리의 그늘
    if(o.rimK&&!small&&bd<0&&(!A[j+1]||!A[j+w])&&y<ymax-1){r=mix(r,o.rim[0],.26*o.rimK);g=mix(g,o.rim[1],.26*o.rimK);b=mix(b,o.rim[2],.3*o.rimK);}
    d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;}
  // 선택적 외곽선: 빛 쪽(왼·위)은 원색의 어두운 톤, 그늘 쪽(오른·아래)은 짙은 남보라
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const j=y*w+x,i=j*4;if(A[j])continue;
    let src=-1,lit=false;
    for(const [dx,dy,l] of [[1,0,true],[0,1,true],[-1,0,false],[0,-1,false]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const k=yy*w+xx;if(A[k]){src=k;lit=l;break;}}
    if(src<0)continue;const k4=src*4;
    /* 원본 외곽선(b0) 기준: 빛 쪽은 조금 밝게, 그늘 쪽은 그대로(세기 k × olK만큼만 어둡게) */
    const K2=o.k*o.olK,b0=[R[src]*.4+10,G[src]*.34+6,B[src]*.44+22];
    if(lit){d[i]=mix(b0[0],R[src]*.6+10,K2);d[i+1]=mix(b0[1],G[src]*.55+8,K2);d[i+2]=mix(b0[2],B[src]*.58+16,K2);}
    else{d[i]=mix(b0[0],R[src]*.3+12,K2*.5);d[i+1]=mix(b0[1],G[src]*.26+8,K2*.5);d[i+2]=mix(b0[2],B[src]*.34+30,K2*.5);}
    d[i+3]=255;}
  og.putImageData(im,0,0);return out;}

/* 원본 캐릭터 원화(finalize 이전) */
function rawChar(id,dir,walk,f){const s=CHARS[id];if(!s.C)s.C=charColors(s);const c=mk(22,34),g=c.getContext('2d'),p=painter(g,1,1);
  let dy=0,lL=0,lR=0,sw=0;if(walk){if(f===1){dy=-1;lL=1;sw=1;}else if(f===3){dy=-1;lR=1;sw=-1;}}else dy=f===1?1:0;
  if(dir==='down')front(p,s,s.C,dy,lL,lR,sw);else if(dir==='up')back(p,s,s.C,dy,lL,lR,sw);else side(p,s,s.C,dy,walk?f:-1);return c;}

/* v4.7 도트 양감: 캐릭터·NPC·몬스터 스프라이트에 양감 처리 적용 (설정에서 켜고 끔) */
/* v4.8.2: 세기 낮춤 약 .45→.3 · 보통 .7→.5 · 강 1→.75 (외곽선이 두껍고 어색하다는 피드백) */
let VOL_ON=false,VOL_K=.3;const VOL_LV={약:.3,보통:.5,강:.75};const VOL_OLD={0.45:.3,0.7:.5,1:.75};
const _getSprite0=getSprite,VSPR=new Map();
getSprite=function(id,dir,walk,f,noArm){if(!VOL_ON||CHARART[id])return _getSprite0(id,dir,walk,f,noArm);
  const k=VOL_K+id+dir+(walk?'w':'i')+f+(noArm?'n':'');let c=VSPR.get(k);if(c)return c;
  if(dir==='left')c=flipX(getSprite(id,'right',walk,f,noArm));
  else{NOARM=noArm?(dir==='down'?15:dir==='up'?3:'side'):null;c=volumize(rawChar(id,dir,walk,f),{pad:0,k:VOL_K});NOARM=null;}
  VSPR.set(k,c);return c;};
/* v4.76: 새 그림(몬스터 55종 · 구운 캐릭터)은 art.js의 volHD가 양감을 입힌다 — 세기가 바뀌면 ART_VOL을 고쳐 다시 만든다(뒤집힌 그림도 빛은 왼쪽 위). 예전 절차 생성 캐릭터는 위 getSprite의 volumize 그대로 */
function setVolume(on,k){VOL_ON=!!on;if(k!=null)VOL_K=k;const nv=VOL_ON?VOL_K:0;if(nv!==ART_VOL){ART_VOL=nv;buildMonSprites();}}
setVolume(false); /* 시작할 때 저장된 설정으로 다시 부른다(v4.76: 기본 켬 · 보통) */

/* =====================================================================
   로웬 원정기 (가제) v4 — 버디 트래블러 아트 리소스 위의 싱글 MMORPG 프로토타입
   여러 지역(맵) · 지역마다 마을과 퀘스트 · 스탯 분배 · 스킬 습득 · 관문 메인 + 서브 퀘스트
   좌표: 월드 x(동) · y(남) 픽셀. three.js: X=x, Z=y, Y=고도
   ===================================================================== */
const $=id=>document.getElementById(id);
const T3=THREE;
const WW=1920,WH=1920,CELL=8,GW=WW/CELL,GH=WH/CELL,VS=1.18,FOV=26,PITCH=0.72,VIEWH=300;
const smooth=t=>t*t*(3-2*t);
const rand=(a,b)=>a+Math.random()*(b-a);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const fmt=n=>Math.round(n).toLocaleString('ko-KR');
const inR=(r,x,y,p=0)=>x>=r[0]-p&&x<=r[2]+p&&y>=r[1]-p&&y<=r[3]+p;

/* ================= 새 NPC (버디 트래블러 캐릭터 생성기 사용) ================= */
Object.assign(CHARS,{
  karl:{name:'촌장 카를',skin:'#e0b08a',hair:'#a8a8a8',hairStyle:'swept',cloth:'#5a6a3a',robe:true,beard:'#d0d0d0',boots:'#4a3a2a',iris:'#5a5a6a'},
  dor:{name:'광부 도르',skin:'#c88a62',hair:'#2a1a12',hairStyle:'bald',cloth:'#6a6a7a',hat:'#d8b040',hatType:'helm',accent:'#e05a2a',apron:'#4a3a2a',pants:'#3a3030',boots:'#2a2020',belt:'#3a2a1a',beard:'#3a2214',iris:'#4a3a2a'},
  sena:{name:'약초상 세나',skin:'#f2d0b0',hair:'#3a6a4a',hairStyle:'long',cloth:'#a0702a',apron:'#efe4cc',pants:'#5a4636',accent:'#e6c05a',iris:'#3a8a5a'},
  rian:{name:'경비대장 리안',skin:'#e8c09a',hair:'#c0c8d8',hairStyle:'short',cloth:'#4a5a8a',hat:'#8a94a6',hatType:'helm',accent:'#2a6ac0',pants:'#2a2f3a',boots:'#2a2020',belt:'#3a2a22',iris:'#3a5a8a'},
  mora:{name:'여관 주인 모라',skin:'#f0c8a4',hair:'#e0a040',hairStyle:'bob',cloth:'#7a4a8a',apron:'#f2ead8',pants:'#4a3a40',iris:'#6a4a8a'},
  aila:{name:'촌장 아일라',skin:'#e8b890',hair:'#d8d8e0',hairStyle:'long',cloth:'#8a2a2a',robe:true,boots:'#3a2a2a',iris:'#8a4a2a'},
  taon:{name:'경비대장 타온',skin:'#c08060',hair:'#1a1414',hairStyle:'short',cloth:'#3a3a42',hat:'#5a4a4a',hatType:'helm',accent:'#e0602a',pants:'#2a2228',boots:'#1a1414',belt:'#4a2a1a',iris:'#6a2a1a'},
  rumi:{name:'연금술사 루미',skin:'#f4d4b8',hair:'#e86a3a',hairStyle:'bob',cloth:'#5a3a6a',apron:'#f0e4d0',pants:'#3a2a3a',accent:'#ffc040',iris:'#a04a2a'},
  goro:{name:'대장장이 고로',skin:'#b8785a',hair:'#3a2a20',hairStyle:'bald',cloth:'#4a4a4a',apron:'#3a2a1a',pants:'#2a2424',boots:'#1a1414',belt:'#2a1a10',beard:'#6a3a20',iris:'#3a2a1a'},
  hana:{name:'여관 주인 하나',skin:'#f0c8a0',hair:'#5a2a2a',hairStyle:'long',cloth:'#c06a3a',apron:'#f4ecdc',pants:'#4a3030',iris:'#5a3a2a'},
  kiki:{name:'꼬마 키키',skin:'#e8b88a',hair:'#c04a2a',hairStyle:'short',cloth:'#e0a040',pants:'#5a3a2a',boots:'#4a2a1a',iris:'#4a2a1a'},
  pip:{name:'꼬마 핍',skin:'#f2c9a0',hair:'#7a4a2a',hairStyle:'short',cloth:'#c0603a',pants:'#5a4a3a',boots:'#6a4a2a',iris:'#3a6a8a'},
});
const npcName=id=>CHARS[id].name;

/* ================= 지역(맵) ================= */
const FORESTPAL=['#284626','#30532c','#3a6032','#446e38','#4f7c3e','#5c8a46'];
const CANYON=['#8a7050','#9a7e5a','#ab8d64','#bb9c6e','#c9ab7a','#d6ba88'];
const CAVEPAL=['#1e2a28','#243430','#2c3e38','#344a40','#3e5648','#4a6450'];
const ASHPAL=['#4a4442','#55504c','#625b55','#6e675f','#7b746a','#898176'];
const DRYPAL=['#56663a','#62723f','#6e7e46','#7a8a4e','#869658','#94a264'];
/* 바이옴: 0 풀 · 1 들판 · 2 숲 · 3 협곡 모래 · 4 호숫가 · 5 현무암 · 6 바위 비탈 · 7 동굴 이끼 · 8 마른 풀 · 9 화산재 */
const BPAL=[GPAL.grass,GPAL.meadow,FORESTPAL,CANYON,GPAL.lakeg,GPAL.basalt,GPAL.rock,CAVEPAL,DRYPAL,ASHPAL].map(p=>p.map(hx));
const MAPS={
  rowen:{id:'rowen',name:'로웬',haze:'#b9b0c4',amb:0xfff0e0,
    zones:{
      village:{name:'로웬 마을',r:[760,1470,1170,1850],safe:true,c:[960,1680]},
      z1:{name:'솜꼬리 들판',lv:'1–3',r:[1215,1400,1740,1830],c:[1470,1615],mobs:[['squirrel',1,2,8],['leafdrop',1,2,7],['sparrow',2,3,7]]},
      z2:{name:'도토리 숲',lv:'3–7',r:[170,1250,705,1790],c:[450,1510],mobs:[['acornboar',3,5,8],['honeybug',4,5,7],['fairy',5,6,6]]},
      z3:{name:'바람 평원',lv:'6–9',r:[620,800,1300,1300],c:[960,1070],mobs:[['windfox',6,7,8],['sheep',7,8,6],['bull',8,9,7]]},
      z4:{name:'안개 호숫가',lv:'9–13',r:[1330,330,1820,1080],c:[1500,880],mobs:[['waterslime',9,10,8],['otter',10,11,7],['lakesnake',11,12,6]]},
      z5:{name:'잿빛 고원',lv:'12–16',r:[150,190,660,790],c:[440,580],mobs:[['emberslime',12,13,9],['lavalizard',13,14,6],['obsidiancrab',14,15,6]]},
    },
    lakes:[{x:1590,y:650,rx:150,ry:92}],
    lava:[{x:290,y:430,rx:34,ry:19},{x:545,y:330,rx:28,ry:15},{x:270,y:680,rx:26,ry:14},{x:600,y:560,rx:24,ry:13}],
    plats:[{x:400,y:490,rx:300,ry:335,h:30,cliff:6,top:5}],
    plaza:{x:960,y:1665},way:{x:1012,y:1622},
    roads:[[[960,1850],[960,1470],[960,1070],[960,850]],[[1170,1660],[1470,1615]],[[760,1660],[450,1510]],[[960,1070],[1240,980],[1470,900]],[[960,850],[700,720],[470,580],[410,400]]],
    houses:[
      {id:'elder',x:830,base:1575,w:110,d:46,rh:30,fh:42,wall:'#e8dcc0',roof:'#6a4d8c',door:48,windows:[10,82],chimney:true,bx:3},
      {id:'forge',x:775,base:1630,w:84,d:40,rh:24,fh:38,wall:'#c8b8a0',roof:'#5a5a64',door:34,windows:[8],sign:'smith',chimney:true,bx:5},
      {id:'inn',x:1040,base:1792,w:104,d:44,rh:28,fh:44,wall:'#f0e2c8',roof:'#b8553f',door:44,windows:[10,74],sign:'inn',chimney:true,bx:7},
      {id:'h1',x:790,base:1790,w:76,d:36,rh:24,fh:36,wall:'#e2d4b4',roof:'#3f6aa0',door:30,windows:[8,54],bx:9},
      {id:'h2',x:1075,base:1556,w:72,d:36,rh:22,fh:36,wall:'#e8dcc0',roof:'#6a8a4a',door:28,windows:[6,50],bx:11},
    ],
    npcs:{
      orvin:{x:885,y:1596,role:'장로',greet:['원정은 순조로운가? 무리하지 말게.','로웬의 등불이 자네를 지켜 줄 걸세.']},
      hans:{x:928,y:1484,role:'북문 경비병 · 토벌 의뢰',greet:['북문 밖은 위험해. 물약은 챙겼나?','바깥 사냥터는 북쪽으로 갈수록 거칠어진다네.'],guard:true},
      mira:{x:1112,y:1672,role:'상인 · 물약',greet:['어서 와! 물약 떨어지면 큰일 나.','오늘 들어온 물약, 효과 확실해!'],shop:true},
      bram:{x:817,y:1648,role:'대장장이 · 장비 강화',greet:['무기는 강화할수록 손에 붙지.','골드와 강화석만 가져오면 단단하게 두드려 주지.'],forge:true},
      nell:{x:1092,y:1810,role:'여관 주인 · 휴식',greet:['쉬어 가세요. 체력과 기력을 채워 드릴게요.'],rest:true},
    },
    deco:[{id:'lia',x:900,y:1712},{id:'fin',x:1016,y:1736},{id:'teo',x:858,y:1822}],
    trees:()=>({0:TREESET.rowen,1:TREESET.plains,2:TREES.concat(DTREES),4:TREESET.lake,5:TREESET.volcano,6:TREESET.rock}),
    dens:(b,x,y)=>[.05,.025,vnoise(x/90,y/90)>.45?.5:.1,.03,.06,.035,.02,.3,.03][b],
    biome(x,y,j){const vr=this.zones.village.r,k=j*.3,L=this.lakes[0],P=this.plats[0];
      if(x>vr[0]-k&&x<vr[2]+k&&y>vr[1]-k&&y<vr[3]+k)return 0;
      const dp=Math.hypot((x-P.x)/P.rx,(y-P.y)/P.ry)+j/1000;if(dp<.97)return 5;if(dp<1.12)return 6;
      if(Math.hypot((x-L.x)/(L.rx*2.4),(y-L.y)/(L.ry*3.7))+j/1000<1)return 4;
      const z2=this.zones.z2.r;if(x>z2[0]-80+j&&x<z2[2]+50+j&&y>z2[1]-60+j&&y<z2[3]+70+j)return 2;
      if((x>1180+j&&y>1360+j)||(y>760+j&&y<1340+j&&x>560+j&&x<1340+j))return 1;return 0;},
    decor(stat,ctx){const N=this.npcs;
      for(const [x,y] of [[944,1522],[978,1522],[944,1762],[978,1762],[1176,1650],[750,1676],[1048,1640],[872,1690]])stat(FSPR.lamp,x,y,{r:4});
      stat(CAMPF,this.plaza.x,this.plaza.y+6,{r:9});stat(SIGN,990,1478,{r:4});stat(SIGN,1180,1626,{r:4});stat(SIGN,742,1640,{r:4});
      stat(ctx.stall(['#e8584a','#e8584a','#5aa0e8','#5aa0e8','#f2cf55','#8ad870']),N.mira.x,N.mira.y-14,{r:12});ctx.markRect(N.mira.x-26,N.mira.y-22,N.mira.x+26,N.mira.y-10);
      stat(FSPR.wbench,N.bram.x+34,N.bram.y-6,{r:10});stat(FSPR.chest,1060,1806,{r:6});stat(FSPR.chest2,N.mira.x+32,N.mira.y-12,{r:6});
      stat(FARM,880,1846,{flat:true});for(const [x,y] of [[868,1838],[880,1838],[892,1838],[868,1852],[880,1852],[892,1852]])stat(CROPS.wheat[1],x,y);
      for(const [x,y,v] of [[800,1520,0],[1130,1500,1],[1150,1740,2],[780,1720,3],[1010,1840,0]])stat(BUSH[v][1],x,y,{r:7});},
    scatter:[[70,b=>true,b=>b>=5?ROCKSET.volcano:b===6?ROCKSET.rock:b===4?ROCKSET.lake:ROCKSET.rowen,9],[80,b=>b<=2,()=>BUSH.map(v=>v[1]),6],[30,b=>b===2,()=>[MUSH],0]],
    reeds:true,
    inv:{z1:['earthgolem',4],z2:['oregolem',7],z3:['jelly',10],z4:['watergolem',13],z5:['phoenix',16]},
  },
  kardo:{id:'kardo',name:'카르도',haze:'#c4b8a8',amb:0xffe8d0,
    zones:{
      village:{name:'카르도 마을',r:[260,880,660,1240],safe:true,c:[460,1070]},
      k1:{name:'자갈 언덕',lv:'16–18',r:[700,920,1200,1320],c:[950,1120],mobs:[['mole',16,17,8],['goat',17,18,7],['sandlizard',17,18,7]]},
      k2:{name:'버섯 동굴숲',lv:'18–21',r:[160,1330,780,1800],c:[480,1580],mobs:[['cavemush',18,19,8],['mosswisp',19,20,7],['crystalbat',20,21,7]]},
      k3:{name:'갑충 협곡',lv:'21–25',r:[1240,1180,1790,1740],c:[1510,1440],mobs:[['stonebeetle',21,22,8],['rockcrab',22,23,7],['snail',23,24,6]]},
      k4:{name:'수정 호숫가',lv:'24–28',r:[860,180,1660,780],c:[1040,640],mobs:[['clam',24,25,8],['puffer',25,26,7],['mist',26,27,6]]},
    },
    lakes:[{x:1180,y:430,rx:170,ry:100}],
    lava:[],
    plats:[{x:1510,y:1450,rx:300,ry:290,h:-20,cliff:6,top:3},{x:1770,y:930,rx:140,ry:115,h:46,cliff:6,top:6}],
    plaza:{x:460,y:1060},way:{x:560,y:1092},
    roads:[[[460,1240],[460,880]],[[460,880],[600,720],[900,650],[1150,640],[1480,380]],[[660,1060],[950,1110],[1250,1170],[1510,1430]],[[460,1240],[480,1580]]],
    houses:[
      {id:'kelder',x:330,base:962,w:104,d:44,rh:28,fh:42,wall:'#d8ccb4',roof:'#6a5a3a',door:46,windows:[10,76],chimney:true,bx:13},
      {id:'kforge',x:520,base:975,w:84,d:40,rh:24,fh:38,wall:'#b8b0a0',roof:'#4a4a54',door:34,windows:[8],sign:'smith',chimney:true,bx:15},
      {id:'kinn',x:300,base:1200,w:100,d:44,rh:28,fh:44,wall:'#e0d4bc',roof:'#8a3a3a',door:44,windows:[10,72],sign:'inn',chimney:true,bx:17},
      {id:'kh1',x:540,base:1205,w:76,d:36,rh:22,fh:36,wall:'#d0c4ac',roof:'#3a6a6a',door:30,windows:[8,54],bx:19},
    ],
    npcs:{
      karl:{x:384,y:982,role:'촌장',greet:['카르도는 거칠지만 정직한 땅이라네.','협곡 바람이 오늘따라 차갑군.']},
      rian:{x:426,y:900,role:'경비대장 · 토벌 의뢰',greet:['북쪽 호숫가는 수정이 자라는 곳이지. 아름답지만 위험해.','협곡에선 발밑을 조심하게.'],guard:true},
      sena:{x:452,y:1150,role:'약초상 · 물약',greet:['동굴 버섯으로 만든 물약이에요. 잘 들어요!'],shop:true},
      dor:{x:562,y:995,role:'광부 · 장비 강화',greet:['카르도 광석으로 두드리면 날이 다르지.'],forge:true},
      mora:{x:344,y:1218,role:'여관 주인 · 휴식',greet:['먼 길 오셨네요. 쉬었다 가세요.'],rest:true},
    },
    deco:[{id:'pip',x:500,y:1100}],
    trees:()=>({0:TREESET.rowen,3:TREESET.volcano,4:TREESET.lake,6:TREESET.rock,7:DTREES.concat(TREESET.lake),8:TREESET.rock.concat(TREESET.plains)}),
    dens:(b,x,y)=>[.05,.03,.1,.015,.06,.03,.02,vnoise(x/80,y/80)>.45?.42:.12,.035][b],
    biome(x,y,j){const vr=this.zones.village.r,k=j*.3,L=this.lakes[0],[P,Q]=this.plats;
      if(x>vr[0]-k&&x<vr[2]+k&&y>vr[1]-k&&y<vr[3]+k)return 0;
      const dp=Math.hypot((x-P.x)/P.rx,(y-P.y)/P.ry)+j/1000;if(dp<.97)return 3;if(dp<1.12)return 6;
      if(Math.hypot((x-Q.x)/Q.rx,(y-Q.y)/Q.ry)+j/1000<1.15)return 6;
      if(Math.hypot((x-L.x)/(L.rx*2.3),(y-L.y)/(L.ry*3.4))+j/1000<1)return 4;
      const z=this.zones.k2.r;if(x>z[0]-80+j&&x<z[2]+60+j&&y>z[1]-60+j&&y<z[3]+80+j)return 7;
      const z1=this.zones.k1.r;if(x>z1[0]-30+j&&x<z1[2]+30+j&&y>z1[1]-30+j&&y<z1[3]+30+j)return vnoise(x/60,y/60)>.55?6:8;
      return 8;},
    decor(stat,ctx){const N=this.npcs;
      for(const [x,y] of [[444,900],[476,900],[444,1225],[476,1225],[650,1046],[612,1130],[350,1080]])stat(FSPR.lamp,x,y,{r:4});
      stat(CAMPF,this.plaza.x,this.plaza.y+6,{r:9});stat(SIGN,490,884,{r:4});stat(SIGN,668,1032,{r:4});stat(SIGN,500,1252,{r:4});
      stat(ctx.stall(['#7ad070','#7ad070','#5aa0e8','#e8584a','#c89af0','#f2cf55']),N.sena.x,N.sena.y-14,{r:12});ctx.markRect(N.sena.x-26,N.sena.y-22,N.sena.x+26,N.sena.y-10);
      stat(FSPR.wbench,N.dor.x+34,N.dor.y-6,{r:10});stat(FSPR.chest2,286,1220,{r:6});stat(FSPR.mine,640,940,{r:16});
      for(const [x,y] of [[300,1000],[620,1180],[290,1110]])stat(ROCKSET.rock[0],x,y,{r:8});},
    scatter:[[110,b=>b===6||b===3||b===8,b=>b===3?ROCKSET.volcano:ROCKSET.rock,9],[34,b=>b===7||b===4,()=>[ORE,OBS],8],[45,b=>b===7,()=>[MUSH],0],[30,b=>b===8,()=>BUSH.map(v=>v[1]),6]],
    reeds:true,
    inv:{k1:['earthgolem',19],k2:['jelly',22],k3:['magmagolem',25],k4:['watergolem',28]},
  },
  erna:{id:'erna',name:'에르나',haze:'#b8a49a',amb:0xffd8c0,skirt:0x3a3430,
    zones:{
      village:{name:'에르나 마을',r:[1300,1420,1700,1780],safe:true,c:[1500,1600]},
      e1:{name:'잿가루 언덕',lv:'28–31',r:[780,1280,1240,1760],c:[1010,1520],mobs:[['volsheep',28,29,8],['ashbat',29,30,7],['sulfurbeetle',30,31,7]]},
      e2:{name:'불티 숲',lv:'31–34',r:[180,1080,700,1700],c:[440,1390],mobs:[['flamewisp',31,32,8],['embertree',32,33,7],['emberslime',33,34,6]]},
      e3:{name:'용암 호수',lv:'34–37',r:[1180,560,1820,1120],c:[1480,880],mobs:[['lavalizard',34,35,8],['obsidiancrab',35,36,7],['ashbat',36,37,6]]},
      e4:{name:'불새 둥지',lv:'37–40',r:[260,160,980,780],c:[620,500],mobs:[['phoenix',37,38,8],['flamewisp',38,39,6],['magmagolem',38,39,5]]},
    },
    lakes:[],
    lava:[{x:1400,y:760,rx:42,ry:22},{x:1610,y:930,rx:38,ry:20},{x:1330,y:1000,rx:30,ry:16},{x:1700,y:690,rx:30,ry:16},{x:1560,y:700,rx:22,ry:12},{x:540,y:380,rx:24,ry:13},{x:720,y:560,rx:22,ry:12}],
    plats:[{x:620,y:450,rx:320,ry:290,h:40,cliff:6,top:5}],
    plaza:{x:1500,y:1590},way:{x:1600,y:1622},
    roads:[[[1500,1780],[1500,1410],[1500,1150],[1480,900]],[[1300,1600],[1010,1520],[700,1450],[440,1390]],[[1010,1520],[900,1150],[740,760],[620,520]]],
    houses:[
      {id:'eelder',x:1370,base:1492,w:104,d:44,rh:28,fh:42,wall:'#c8b8a8',roof:'#7a2a2a',door:46,windows:[10,76],chimney:true,bx:21},
      {id:'eforge',x:1560,base:1505,w:84,d:40,rh:24,fh:38,wall:'#a8a0a0',roof:'#3a3a42',door:34,windows:[8],sign:'smith',chimney:true,bx:23},
      {id:'einn',x:1340,base:1730,w:100,d:44,rh:28,fh:44,wall:'#d8c8b4',roof:'#a8502a',door:44,windows:[10,72],sign:'inn',chimney:true,bx:25},
      {id:'eh1',x:1580,base:1735,w:76,d:36,rh:22,fh:36,wall:'#c8bca8',roof:'#5a3a3a',door:30,windows:[8,54],bx:27},
    ],
    npcs:{
      aila:{x:1424,y:1512,role:'촌장',greet:['불의 땅에 온 걸 환영하네. 땅이 뜨거우니 발 조심하게.','화산이 숨을 쉴 때마다 마을이 흔들린다네.']},
      taon:{x:1466,y:1430,role:'경비대장 · 토벌 의뢰',greet:['북쪽 용암 호수는 가까이 가기만 해도 숨이 막히지.','둥지의 불새들은 무리 지어 덤빈다. 각오해.'],guard:true},
      rumi:{x:1492,y:1680,role:'연금술사 · 물약',greet:['유황으로 달인 물약이에요. 맛은 장담 못 해요!'],shop:true},
      goro:{x:1602,y:1525,role:'대장장이 · 장비 강화',greet:['흑요석으로 두드린 날은 부러지지 않지.'],forge:true},
      hana:{x:1384,y:1748,role:'여관 주인 · 휴식',greet:['온천물로 씻고 가세요. 피로가 싹 풀려요.'],rest:true},
    },
    deco:[{id:'kiki',x:1540,y:1630}],
    trees:()=>({5:TREESET.volcano,6:TREESET.rock,8:TREESET.volcano.concat(TREESET.rock),9:TREESET.volcano}),
    dens(b,x,y){const z=this.zones.e2.r,inF=x>z[0]-40&&x<z[2]+40&&y>z[1]-40&&y<z[3]+40;return [.05,.03,.1,.015,.06,.025,.02,.1,inF?(vnoise(x/70,y/70)>.4?.34:.14):.04,.02][b];},
    biome(x,y,j){const vr=this.zones.village.r,k=j*.3,P=this.plats[0];
      if(x>vr[0]-k&&x<vr[2]+k&&y>vr[1]-k&&y<vr[3]+k)return 8;
      const dp=Math.hypot((x-P.x)/P.rx,(y-P.y)/P.ry)+j/1000;if(dp<.97)return 5;if(dp<1.12)return 6;
      const z2=this.zones.e2.r;if(x>z2[0]-60+j&&x<z2[2]+50+j&&y>z2[1]-60+j&&y<z2[3]+70+j)return 8;
      const z3=this.zones.e3.r;if(x>z3[0]-30+j&&x<z3[2]+30+j&&y>z3[1]-30+j&&y<z3[3]+30+j)return vnoise(x/70,y/70)>.5?5:9;
      return vnoise(x/90+3,y/90)>.6?6:9;},
    decor(stat,ctx){const N=this.npcs;
      for(const [x,y] of [[1484,1430],[1516,1430],[1484,1755],[1516,1755],[1690,1576],[1652,1660],[1390,1610]])stat(FSPR.lamp,x,y,{r:4});
      stat(CAMPF,this.plaza.x,this.plaza.y+6,{r:9});stat(SIGN,1530,1414,{r:4});stat(SIGN,1308,1585,{r:4});stat(SIGN,1540,1782,{r:4});
      stat(ctx.stall(['#e8584a','#e8584a','#f2cf55','#e8584a','#c89af0','#5aa0e8']),N.rumi.x,N.rumi.y-14,{r:12});ctx.markRect(N.rumi.x-26,N.rumi.y-22,N.rumi.x+26,N.rumi.y-10);
      stat(FSPR.wbench,N.goro.x+34,N.goro.y-6,{r:10});stat(FSPR.chest2,1326,1750,{r:6});stat(FSPR.mine,1680,1470,{r:16});
      for(const [x,y] of [[1340,1530],[1660,1710],[1330,1640]])stat(ROCKSET.volcano[0],x,y,{r:8});},
    scatter:[[120,b=>b===9||b===6||b===5,b=>b===6?ROCKSET.rock:ROCKSET.volcano,9],[26,b=>b===8,()=>BUSH.map(v=>v[1]),6],[24,b=>b===5,()=>[OBS,ORE],8]],
    reeds:false,
    inv:{e1:['oregolem',30],e2:['earthgolem',33],e3:['magmagolem',36],e4:['magmagolem',39]},
  },
};
/* v4.46 시간의 균열 전용 공간(G17 · 현 요청): 사냥터 위에 덧씌우던 균열을 별도 맵으로 떼어 냈다 — 메인 퀘스트 사냥터와 겹치지 않는다.
   한 맵을 세 지역 균열이 같이 쓴다(들어온 지역에 따라 몬스터 한 벌을 새로 깐다). 걸을 수 있는 곳은 bound 안뿐이고 그 밖은 어두운 허공.
   village = 균열 문턱(안전) · rz = 사냥 구역 · way = 균열 문(길잡이 표석과 같은 조작 — 나가기 · 다른 지역으로) · mini = 미니맵이 비추는 정사각형 */
MAPS.rift={id:'rift',name:'시간의 균열',inst:true,haze:'#5a4186',amb:0xdccaff,skirt:0x120c1e,voidCol:'#161026',
  bound:[540,490,1380,1420],mini:{x:490,y:485,w:940},
  zones:{village:{name:'균열 문턱',r:[850,1190,1070,1330],safe:true,c:[960,1255]},
    rz:{name:'시간의 균열',r:[640,590,1280,1150],c:[960,880],mobs:[]}},
  lakes:[],lava:[],plats:[],plaza:{x:960,y:1238},way:{x:960,y:1300},roads:[[[960,1296],[960,1150]]],houses:[],npcs:{},deco:[],
  trees:()=>({0:DTREES}),dens:()=>.035,biome:()=>7,
  decor(stat){for(const [x,y] of [[902,1206],[1018,1206],[902,1306],[1018,1306],[930,1160],[990,1160]])stat(FSPR.lamp,x,y,{r:4});},
  scatter:[[22,b=>true,()=>[ORE,OBS],8],[26,b=>true,()=>ROCKSET.rock,9]],reeds:false};
const ZALL={};for(const mid in MAPS)for(const z in MAPS[mid].zones){const Z=Object.assign(MAPS[mid].zones[z],{map:mid,id:z});if(!(MAPS[mid].inst&&z==='village'))ZALL[z]=Z;}
const NALL={};for(const mid in MAPS)for(const id in MAPS[mid].npcs)NALL[id]=Object.assign(MAPS[mid].npcs[id],{map:mid});
const HUNTALL=['z1','z2','z3','z4','z5','k1','k2','k3','k4','e1','e2','e3','e4'];
const AGGRO={windfox:1,bull:1,otter:1,lakesnake:1,lavalizard:1,obsidiancrab:1,goat:1,crystalbat:1,rockcrab:1,puffer:1,ashbat:1,phoenix:1,magmagolem:1};
/* v4.25 (현 요청) 선공 몬스터라도 내 레벨보다 낮으면 먼저 공격하지 않는다(MMORPG 라이크). 같은 레벨 이상만 선공, 맞으면 반격은 그대로 */
const aggroOn=m=>!!AGGRO[m.sp]&&!m.eliteOf&&m.lv>=S.lv;

/* ================= 수치 (기획 테이블) ================= */
const LV_MAX=40;
/* Lv28+(에르나) 후반 곡선: +4%/레벨 */
/* v4.23 레벨 곡선 재조정: 지역 끝 정예에서 그 지역 상한 레벨 근처가 되도록 구간 배수(XP_K) — 로웬 끝 ~16 · 카르도 끝 ~28 · 에르나 끝(홍염) ~40.
   v4.22까지는 퀘스트 26(카르도 끝)에 Lv39였다(시뮬레이션). 배수는 [레벨, 배수] 점 사이를 선형 보간 */
const XP_K=[[1,1],[6,1.6],[10,2.2],[14,2.7],[28,2.7],[34,2.2],[40,2.1]];
const xpK=L=>{for(let i=1;i<XP_K.length;i++){const[a,ka]=XP_K[i-1],[b,kb]=XP_K[i];if(L<=b)return ka+(kb-ka)*clamp((L-a)/(b-a),0,1);}return XP_K[XP_K.length-1][1];};
const need=L=>Math.round((65+58*(L-1)+16*(L-1)**2)*1.7*(L>=28?1+.04*(L-27):1)*xpK(L));
/* v4.23 레벨 차이 경험치(MMORPG 라이크): 나보다 3레벨 이상 낮은 몬스터는 1레벨마다 −15%, 최저 20% — 지나간 사냥터에서 레벨만 올리는 것을 막는다 */
const XP_GAP={free:2,per:.15,min:.2};
const xpGapF=mL=>{const d=S.lv-mL;return d<=XP_GAP.free?1:Math.max(XP_GAP.min,1-XP_GAP.per*(d-XP_GAP.free));};
/* 레벨업마다 능력치 포인트 3 · 스킬 포인트 1. 기본 성장은 낮추고 분배로 채운다 */
const STATS={str:['힘','공격력 +2'],vit:['체력','최대 HP +14 · 방어 +0.6'],dex:['민첩','치명 +0.5%p · 공격 속도 +0.8%'],int:['지력','스킬 피해 +1.5% · 최대 MP +5']};
/* ================= v4.80 G2-a 능력치 구간 보너스 (지시서 §G2) =================
   투자 포인트(S.st — 장비 · 버프 제외)가 10 · 20 · 30 · 45에 닿으면 켜진다. 같은 키가 여러 구간에 있으면 큰 값이 대체한다(방어 관통 10→25% 등).
   tbVal(키,st) = 지금 켜진 값(없으면 0) · tbN(능력치,st) = 닿은 구간 수 · tbCount(st) = 전체 구간 수(전투력 +60씩) */
const TB_AT=[10,20,30,45],TB_CP=60;
const TB={str:[{pen:.10,d:'방어 관통 10%'},{critM:.15,d:'치명 피해 +15%p'},{killAtk:.08,killT:3,d:'처치 후 3초 공격 +8%'},{pen:.25,d:'방어 관통 25%'}],
  vit:[{pot:.10,d:'HP 물약 회복 +10%'},{rg:1,wt:.10,d:'비전투 회복 2배 · 무게 한도 +10%'},{lowDr:.20,lowAt:.30,d:'HP 30% 이하 받는 피해 −20%'},{save:120,d:'죽는 피해를 한 번 버팀(120초)'}],
  dex:[{mv:.06,d:'이동 속도 +6%'},{ev:.08,d:'회피 8% (평타 · 투사체)'},{critAs:.15,critT:3,d:'치명 시 3초 공격 속도 +15%'},{ev:.15,d:'회피 15%'}],
  int:[{mpRg:.5,d:'MP 자연 회복 +50%'},{cd:.08,d:'스킬 재사용 −8%'},{next:.40,d:'스킬 뒤 다음 평타 +40%'},{cd:.15,d:'스킬 재사용 −15%'}]};
/* 측정용: window.__tbRef=1이면 구간을 모두 끈다 — §G1 원형 · 보스 측정(tests/rng_probe452.page)이 '구간 없는 기준 캐릭터'로 재는 데만 쓴다(G2-c에서 구간 포함으로 다시 맞춘 뒤 지운다) */
const tbN=(k,st)=>{if(window.__tbRef)return 0;const v=(st||S.st)[k]||0;let n=0;while(n<TB_AT.length&&v>=TB_AT[n])n++;return n;};
const tbCount=st=>tbN('str',st)+tbN('vit',st)+tbN('dex',st)+tbN('int',st);
function tbVal(key,st){let r=0;for(const k in TB){const n=tbN(k,st);for(let i=0;i<n;i++){const v=TB[k][i][key];if(v!=null&&v>r)r=v;}}return r;}
const tbNext=(k,st)=>{const n=tbN(k,st);return n<TB_AT.length?{at:TB_AT[n],left:TB_AT[n]-((st||S.st)[k]||0),d:TB[k][n].d}:null;};
/* 스킬을 쓴 순간: 재사용 시간(지력 20 · 45) · 다음 평타 강화 표시(지력 30) */
function tbCast(cd){if(tbVal('next'))player.tbNx=1;return cd*(1-tbVal('cd'));}
/* 죽는 피해를 한 번 버팀(체력 45) — 장비의 버팀(gfxSave)이 먼저 */
function tbSave(){const cd=tbVal('save');if(!cd||player.dead||t<(player.tbSvT||0))return false;player.tbSvT=t+cd;player.hp=1;STAT.tbSave=(STAT.tbSave||0)+1;floatTxt(player.x,player.y-10,'버팀!','#8ef07a',true);burst(player.x,player.y,20,'#8ef07a',20,90,5);toast('체력 45 — 쓰러지지 않고 버텼다 (다음은 '+cd+'초 뒤)',true);return true;}
/* v4.8: 장비 합계(gearSum) 반영 · st를 넘기면 미리보기(능력치 창 적용 전→후) */
function pStats(st,noBuff){const L=S.lv,s=st||S.st,G=gearSum(),buff=!noBuff&&t<player.buffT?1+player.buffK:1,fv=!noBuff&&t<player.fervT?player.fervK:0;
  const bA=!noBuff&&bufOn('atkp')?1+BUFP.atkp.atk:1,bS=!noBuff&&bufOn('spdp')?BUFP.spdp.as:0;/* v4.66 G12 버프 물약 — noBuff(전투력 · 관문 판정)에는 넣지 않는다 */
  const hpM=Math.round(120+20*(L-1)+14*s.vit+G.hp),gl=!noBuff&&!st?gfxLowAtk(hpM):0;/* v4.73 G3 고유 효과(마그마 심장 반지) — 전투력 · 미리보기에는 넣지 않는다 */
  const tk=!noBuff&&!st&&t<(player.tbKillT||0)?1+tbVal('killAtk'):1,tc=!noBuff&&!st&&t<(player.tbCritT||0)?tbVal('critAs'):0;/* v4.80 G2-a 처치 후 공격 · 치명 뒤 공속 — 전투력 · 미리보기에는 넣지 않는다 */
  return{atk:Math.round((14+3*(L-1)+2*s.str+G.atk)*buff*bA*(1+gl)*tk),def:Math.round(2+1.1*(L-1)+.6*s.vit+G.def),hp:hpM,mp:Math.round(50+5*(L-1)+5*s.int+G.mp),
    crit:.10+.005*s.dex+G.crit+fv+(godOn('artemis')?.05+.005*gLv():0),critM:1.6+gfxSum('critM')+tbVal('critM',s),aspd:1+Math.min(.4,.008*s.dex)+fv+bS+tc,skm:1+.015*s.int+G.skm,faith:G.faith||0};}
function cpOf(st){const s=pStats(st,true),sk=SK.reduce((n,k,i)=>n+skLv(i),0);return Math.round(s.atk*6+s.def*4+s.hp*.6+s.mp*.4+(s.crit-.1)*1200+(s.aspd-1)*750+(s.skm-1)*660+sk*25+S.lv*20+gLv()*45+TB_CP*tbCount(st));}
/* v4.8: 장비·신규 스킬로 오른 플레이어 성장만큼 몬스터 공격·체력 상향 (flow_sim으로 물약 압박을 v4.7 수준에 맞춤) */
const BAL={mobAtk:1.4,mobAtkHi:1.75,mobHp:1,mobHpHi:1.65,ramp:[10,24]};
/* 초반(장비가 거의 없는 Lv10 이하)은 v4.7 값 그대로, Lv24까지 장비가 쌓이는 만큼 선형으로 올린다 */
const rampK=L=>clamp((L-BAL.ramp[0])/(BAL.ramp[1]-BAL.ramp[0]),0,1),mobAtkAt=L=>BAL.mobAtk+(BAL.mobAtkHi-BAL.mobAtk)*rampK(L),mobHpAt=L=>BAL.mobHp+(BAL.mobHpHi-BAL.mobHp)*rampK(L);
/* 화면 줌: 마우스 휠 80%~180% (Z키·확대 버튼은 100%↔140%) */
const ZOOM={min:.8,max:1.8,step:1.1};
function mobStats(L,boss){let hp=Math.round((42+30*(L-1)+3.2*(L-1)**2)*mobHpAt(L)),atk=(7+3.6*(L-1))*mobAtkAt(L),def=1+1.3*(L-1),xp=Math.round(12+8*(L-1)+1.2*(L-1)**2),gold=Math.round(4+2.5*(L-1));
  if(boss){hp*=6;atk*=1.2;def*=1.2;xp*=12;gold*=20;}return{hp,atk,def,xp,gold};}
/* v4.73 G3-a 고유 효과 훅 (gearFx를 거친다) */
function gfxLowAtk(hpM){const F=gearFx();let k=0;for(const id in F){const L=F[id].low;if(L&&!player.dead&&player.hp>0&&player.hp<=hpM*L.hp)k+=L.atk;}return k;}
function gfxBasic(m){let mul=1;const F=gearFx();for(const id in F){const f=F[id];if(f.n){player.g3n=(player.g3n||0)+1;if(player.g3n%f.n===0){mul*=1+f.k;STAT.gfxHvy=(STAT.gfxHvy||0)+1;floatTxt(m.x,m.y-14,'강타','#ffa04a');}}}return mul;}
function gfxAfterBasic(m){if(!alive(m))return;const F=gearFx();for(const id in F){const B=F[id].burn;if(B){const dps=pStats().atk*B.k,on=m.gburn&&t<m.gburn.u;m.gburn={u:t+B.dur,dps,tk:on?m.gburn.tk:t+1};}}}
function gburnTick(m){const b=m.gburn;if(t>=b.tk){b.tk+=1;STAT.gfxBurn=(STAT.gfxBurn||0)+b.dps;hurtMob(m,b.dps,false,'#ff9a3a');}if(m.gburn&&b.tk>b.u+1e-6)m.gburn=null;}/* 1초마다 · 마지막 평타 뒤 3번 */
function gfxKill(m){/* 처치 훅 — 광석왕의 반지(MP) · 홍염의 날개검(불꽃) · 자폭(스스로 쓰러짐)과 불꽃이 다시 부른 처치는 세지 않는다 */if(gfxKillD)return;gfxKillD=true;try{const F=gearFx();for(const id in F){const f=F[id];if(f.kill)f.kill(m);}}finally{gfxKillD=false;}}
/* v4.74 G3-b 고유 효과 훅 */
let gfxKillD=false;
function gfxMp(v){if(player.dead)return;const st=pStats();if(player.mp>=st.mp)return;player.mp=Math.min(st.mp,player.mp+v);STAT.gfxMp=(STAT.gfxMp||0)+v;}
function gfxFlame(m,r,k){const a=pStats().atk*k;let n=0;for(const e of mobs)if(e!==m&&alive(e)&&Math.hypot(e.x-m.x,e.y-m.y)<r+8*e.sc){hurtMob(e,a,false,'#ff7a3a');n++;}STAT.gfxFlame=(STAT.gfxFlame||0)+1;STAT.gfxFlameHit=(STAT.gfxFlameHit||0)+n;burst(m.x,m.y,8,'#ff7a3a',r*.6,110,5);}
const gfxSkR=id=>1+gfxSum('skR',id),gfxCd=s=>Math.max(1,s.cd-gfxSum('cdS',s.id));
function gfxXhit(sm){const p=gfxSum('xhit');if(!p||Math.random()>=p)return;STAT.gfxX=(STAT.gfxX||0)+1;later(.12,()=>{if(!alive(sm)||player.dead||!inRange(sm,basicRange()+8))return;playerHit(sm,basicMul());floatTxt(sm.x,sm.y-14,'한 번 더','#ffa04a');});}
/* 받는 피해: 장판 · 폭발(kind 'zone') −25% · HP 50% 이상 −8% */
function gfxHurtK(dmg,kind){const F=gearFx();let k=1;for(const id in F){const f=F[id];if(f.zoneK&&kind==='zone')k*=1-f.zoneK;if(f.hiDr&&player.hp>=pStats().hp*f.hiDr.hp)k*=1-f.hiDr.dr;}if(k<1)STAT.gfxDr=(STAT.gfxDr||0)+dmg*(1-k);return dmg*k;}
/* 홍염의 깃 반지 — 쓰러질 피해를 받으면 한 번 HP 30%로 버팀 · 게임 시간 300초마다(player.g3sv) */
function gfxSave(){if(player.dead)return false;const F=gearFx();for(const id in F){const S2=F[id].save;if(S2&&t>=(player.g3sv||0)){player.g3sv=t+S2.cd;player.hp=Math.max(1,pStats().hp*S2.hp);STAT.gfxSave=(STAT.gfxSave||0)+1;floatTxt(player.x,player.y-10,'버팀!','#ff9a3a',true);burst(player.x,player.y,20,'#ff7a3a',20,90,5);toast('홍염의 깃 반지 — 쓰러지지 않고 버텼다 (다음은 '+S2.cd+'초 뒤)',true);return true;}}return false;}
function calcDmg(atk,mul,def,aL,dL){const b=atk*mul*(.92+Math.random()*.16),lf=clamp(1+.05*(aL-dL),.7,1.25);return Math.max(b*.2,b-def)*lf;}
/* v4.10 신앙 요구치: 사냥터(지역)별 · 보스(관문 정예 = 지역 보스, 침공 보스)별. 모자라면 r=신앙/요구 → 주는 피해 ×(0.15+0.85·r²) · 받는 피해 ×(1+0.9·(1−r)) (v4.11) */
const ZFAITH={z1:0,z2:0,z3:0,z4:4,z5:12,k1:28,k2:34,k3:42,k4:52,e1:62,e2:70,e3:80,e4:90},INV_FAITH=10;
const FAITH_K={out0:.15,outP:2,inK:.9};
function faithR(m){const need=m&&m.fa||0;if(need<=0)return 1;return clamp(pStats(null,true).faith/need,0,1);}
const faithOut=m=>{const r=faithR(m);return r>=1?1:FAITH_K.out0+(1-FAITH_K.out0)*r**FAITH_K.outP;},faithIn=m=>{const r=faithR(m);return r>=1?1:1+FAITH_K.inK*(1-r);};
const potPrice=k=>k==='hp'?10+3*S.lv:k==='mp'?12+3*S.lv:30+2*S.lv;
/* v4.1 물약 압박: 보상 물약 없음 · 소지 한도 · 필드 회복 감소 · 사망 경험치 손실 */
const POT_CAP={hp:20,mp:10,scroll:5},POT_LOW={hp:6,mp:3},DEATH_XP=.05;
/* v4.65 G9 (지시서 §G9 · MMORPG 라이크 '사망 경험치 복구'): 잃은 경험치는 쓰러진 자리 무덤(S.grave)에 남는다 — 30 안으로 걸어가면 100% 회수, 여관 주인(휴식 NPC)에게 골드(잃은 경험치 × 0.5 · 최소 50)로 복구. 다시 쓰러지면 이전 무덤은 사라진다(확정 손실). 균열 안 사망은 자리가 없어 여관 복구만 */
const GRAVE_K={r:30,inn:.5,min:50};
const REGEN={field:{delay:6,hp:.01,mp0:.4,mp:.006},village:{delay:1,hp:.08,mp0:2,mp:.08}};
/* 스킬: 레벨 조건 + 스킬 포인트로 습득·강화(최대 5). 책 표시는 서브 퀘스트 보상 스킬서가 있어야 배울 수 있음 */
/* v4.8: 차수(tier) — 1차 로웬 · 2차 카르도(Lv16 + 카르도 개방) · 3차 에르나(Lv28 + 에르나 개방). step = 단계당 필요 레벨 간격.
   kind: aoe(자신 주변) · dash · ground(지정 범위) · buff · line(일직선) · multi(연타) · drain(흡혈) — 자동 전투가 kind로 사용 조건을 판단 */
const SK=[
  {id:'whirl',name:'회오리 베기',icon:'🌀',tier:1,kind:'aoe',cls:'검술 · 주변 범위',req:2,mp:10,cd:5,mul:1.5,r:50,desc:'주변 범위 공격'},
  {id:'dash',name:'돌진 찌르기',icon:'➹',tier:1,kind:'dash',cls:'검술 · 돌진',req:4,book:true,mp:12,cd:7,mul:2.3,range:95,desc:'대상에게 돌진해 찌르기'},
  {id:'star',name:'별똥별',icon:'✦',tier:1,kind:'ground',cls:'마법 · 지정 범위',req:7,mp:20,cd:11,mul:2.9,r:44,range:130,desc:'대상 위치에 별을 떨어뜨림'},
  {id:'roar',name:'전투 함성',icon:'📯',tier:1,kind:'buff',cls:'버프 · 공격',req:11,book:true,mp:16,cd:28,buff:12,desc:'12초간 공격력 상승'},
  {id:'quake',name:'대지 가르기',icon:'⛰',tier:2,kind:'line',cls:'검술 · 일직선',req:18,book:true,mp:26,cd:14,mul:3.4,range:115,desc:'대상 방향으로 땅을 갈라 일직선 공격'},
  {id:'guard',name:'바위 껍질',icon:'◈',tier:2,kind:'buff',cls:'버프 · 방어',req:20,mp:18,cd:30,buff:10,desc:'10초간 받는 피해 감소'},
  {id:'combo',name:'연속 베기',icon:'⚔',tier:2,kind:'multi',cls:'검술 · 단일 3연타',req:23,mp:22,cd:9,mul:1.25,hits:3,range:44,desc:'대상을 빠르게 세 번 벤다'},
  {id:'flame',name:'화염 회오리',icon:'✹',tier:3,kind:'aoe',cls:'마법 · 넓은 주변 범위',req:29,step:2,mp:30,cd:12,mul:2.4,r:66,desc:'불길을 휘감아 넓은 주변을 태운다'},
  {id:'drain',name:'흡혈 일격',icon:'❦',tier:3,kind:'drain',cls:'검술 · 단일 · 회복',req:31,step:2,mp:24,cd:10,mul:3,range:44,drain:.18,desc:'강하게 베고 준 피해의 일부를 HP로 회복'},
  {id:'ferv',name:'전장의 기운',icon:'✴',tier:3,kind:'buff',cls:'버프 · 치명·공속',req:34,step:1,mp:28,cd:40,buff:15,desc:'15초간 치명 확률·공격 속도 상승'},
];
const SK_TIER=[null,{n:'1차',area:'로웬',lv:1,map:'rowen',how:'처음부터'},{n:'2차',area:'카르도',lv:16,map:'kardo',how:'Lv 16 · 메인 13 「협곡 너머 카르도」로 카르도 개방'},{n:'3차',area:'에르나',lv:28,map:'erna',how:'Lv 28 · 메인 23 「불의 땅 에르나」로 에르나 개방'}];
const tierOpen=n=>S.lv>=SK_TIER[n].lv&&S.maps.includes(SK_TIER[n].map);
const SLOT_N=8;
const SK_MAX=5,skLv=i=>S.sk[SK[i].id]||0,skMul=i=>SK[i].mul*(1+.12*(skLv(i)-1)),skNeedLv=(i,k)=>SK[i].req+(SK[i].step||3)*(k-1),roarK=()=>.15+.04*(skLv(3)-1);
const guardK=()=>.15+.03*(skLv(skIdx('guard'))-1),fervK=()=>.10+.02*(skLv(skIdx('ferv'))-1);
const skIdx=id=>SK.findIndex(s=>s.id===id);
/* ===== 제우스 레퍼런스: 신의 권능 ===== */
const GODS={
  zeus:{name:'제우스',title:'천둥의 권능',col:'#ffe066',sk:2,skn:'천벌',ski:'⚡',desc:lv=>'평타 3번째마다 연쇄 번개 — 주변 '+(2+Math.floor(lv/4))+'마리에 공격력 ×'+(.6+.06*lv).toFixed(2)+' · 별똥별 → 천벌(피해 +40%, 범위 +10)'},
  athena:{name:'아테나',title:'방패의 권능',col:'#8ac8ff',sk:0,skn:'방패 회전',ski:'🛡',desc:lv=>'8초마다 최대 HP '+(10+1.5*lv).toFixed(1)+'% 보호막 · 받은 피해 '+(20+2*lv)+'% 반사 · 회오리 → 방패 회전(보호막 즉시 충전)'},
  artemis:{name:'아르테미스',title:'사냥의 권능',col:'#a8f0a0',sk:1,skn:'연사',ski:'🏹',desc:lv=>'평타가 원거리(사거리 70) · 치명 +'+(5+lv*.5).toFixed(1)+'%p · 평타 피해 ×'+(.85+.03*lv).toFixed(2)+' · 돌진 → 연사(3갈래 화살)'},
};
const GOD_MAX=10,godCost=lv=>({shard:10*lv,gold:200*lv});
const godOn=k=>!!(S&&S.god===k),gLv=()=>S&&S.god?S.godLv[S.god]:0;
const basicRange=()=>godOn('artemis')?70:26,basicMul=()=>godOn('artemis')?.85+.03*gLv():1;
/* v4.8.4: 권능은 신의 시련 퀘스트로 하나씩 얻는다 (S.gods) */
const godUnlocked=()=>!!S.gods&&Object.values(S.gods).some(Boolean),hasGod=k=>!!(S.gods&&S.gods[k]),invUnlocked=()=>S.lv>=INV.unlockLv;
/* 침공: Lv20 개방 · 보스 레벨 = 내 레벨 + lvAdd (사냥터 종은 지역표 사용) */
/* v4.10: 제작이 성장의 중심이 되어 강화석 드롭 4% → 10% · 단계가 오를수록 1→2→3개 (제작 비용이 단계에 비례)  */
const STONE_P=.07;
const INV={unlockLv:20,lvAdd:2,hpMul:7,atkMul:.7,every:300,stay:180};
const ENH_MAX=10,enhRate=n=>n<5?1:[.7,.6,.5,.4,.3][n-5],enhCost=n=>({gold:Math.round(100*1.5**n),stone:1+Math.floor(n/2)});
const WEAP=n=>n>=7?'obsword':n>=4?'spear':n>=2?'axe':'club';
const WEAPN={club:'나무 몽둥이',axe:'돌 도끼',spear:'은빛 창',obsword:'흑요석 검'};
/* =====================================================================
   v4.8 아이템 · 장비 · 가방 (리니지 라이크)
   - 장비 9부위 × 5티어(지역) × 5등급, 몬스터 드롭(자동 획득)
   - 무기/갑옷 마법 주문서로 강화 — 안전 강화(무기 +6 · 방어구 +4) 이후 확률, 파괴·하락 없음, 3연속 실패마다 +5%p
   - 무게: 50% 이상 자연 회복 정지 · 82% 이상 공격·스킬 불가 · 100% 초과 획득 불가
   - 재화 짝: 주문서(상점 골드 · 제작 강화석 · 드롭 → 강화) · 강화석(드롭 · 분해 · 퀘스트 → 주문서 제작)
   ===================================================================== */
const GRADES=[
  {n:'일반',c:'#d8d2c4',m:1,dis:1},
  {n:'고급',c:'#7ad870',m:1.15,dis:2},
  {n:'희귀',c:'#62a8ff',m:1.35,dis:4},
  {n:'영웅',c:'#ff6a58',m:1.6,dis:8},
  {n:'전설',c:'#c88cff',m:2,dis:16}];
const SLOTS=['weapon','helm','armor','cloak','gloves','boots','neck','ring1','ring2'];
const SLOTN={weapon:'무기',helm:'투구',armor:'갑옷',cloak:'망토',gloves:'장갑',boots:'장화',neck:'목걸이',ring:'반지',ring1:'반지',ring2:'반지'};
const slotKind=s=>s.startsWith('ring')?'ring':s;
const TIERS=[null,
  {iL:1,area:'로웬',mat:'가죽',w:'club',wn:'나무 몽둥이',ck:'천 망토',nk:'나무 목걸이',rk:'구리 반지',col:{a:'#9a6a3a',b:'#c89058',c:'#6a4424',g:'#d8b070'}},
  {iL:8,area:'로웬',mat:'청동',w:'axe',wn:'돌 도끼',ck:'사냥꾼 망토',nk:'호박 목걸이',rk:'은 반지',col:{a:'#b87a3a',b:'#e8b060',c:'#7a4a20',g:'#f0d080'}},
  {iL:16,area:'카르도',mat:'강철',w:'spear',wn:'은빛 창',ck:'협곡 망토',nk:'수정 목걸이',rk:'수정 반지',col:{a:'#9aa4b4',b:'#d8e0ec',c:'#5a6474',g:'#6ab0ff'}},
  {iL:24,area:'카르도',mat:'미스릴',w:'sword',wn:'미스릴 장검',ck:'바람 망토',nk:'달빛 목걸이',rk:'미스릴 반지',col:{a:'#8ab8d8',b:'#e0f4ff',c:'#4a7a9a',g:'#a8f0ff'}},
  {iL:32,area:'에르나',mat:'흑요석',w:'obsword',wn:'흑요석 검',ck:'불꽃 망토',nk:'불새 목걸이',rk:'홍염 반지',col:{a:'#4a3a5a',b:'#8a6aaa',c:'#2a2034',g:'#ff6a3a'}}];
const TIER_MAX=5,tierOfLv=L=>L<8?1:L<16?2:L<24?3:L<32?4:5;
/* 기본 능력치 (iL = 티어 아이템 레벨, 등급 배율 m) */
function itemBase(kind,iL,g){const m=GRADES[g].m,r=v=>Math.round(v*m);
  switch(kind){
    case 'weapon':return{atk:r(4+1.6*iL)};
    case 'armor':return{def:r(1+.3*iL),hp:r(6+2.4*iL)};
    case 'helm':return{def:r(.5+.15*iL),hp:r(3+1.2*iL)};
    case 'boots':return{def:r(.5+.14*iL),hp:r(2.5+1*iL)};
    case 'gloves':return{atk:r(1+.35*iL),def:r(.3+.08*iL)};
    case 'cloak':return{hp:r(5+1.8*iL),mp:r(4+1.2*iL)};
    case 'neck':return{hp:r(4+1.5*iL),skm:+((.02+.0015*iL)*m).toFixed(3)};
    case 'ring':return{atk:r(1+.3*iL),crit:+((.005+.0004*iL)*m).toFixed(4)};}
  return{};}
/* 강화 1단계당 */
/* v4.14 강화 (제우스: 오만의 신 방식): 무기·방어구 안전 강화 +5 · 장신구 +1, 그 위는 확률. 재료 = 강화석 + 골드 (주문서 없음).
   싱글 완화: 실패해도 파괴·하락 없음(3연속 실패마다 +5%p). 축복받은 강화 주문서: 안전 구간에서 +1~3 */
const ENCH={weapon:{atk:5},armor:{def:2,hp:10},helm:{def:1,hp:5},boots:{def:1,hp:5},gloves:{def:1,atk:1},cloak:{hp:8,mp:3},neck:{hp:8,skm:.006},ring:{atk:2,crit:.003}};
const isAcc=k=>k==='neck'||k==='ring',canEnch=k=>!!ENCH[k];
const ENH={max:10,safe:{weapon:5,armor:5,acc:1},rate:{weapon:[.7,.6,.5,.4,.35],armor:[.7,.6,.5,.45,.4],acc:[.6,.5,.4,.35,.3,.25,.2,.2,.2]},failBonus:.05};
const enchCls=k=>k==='weapon'?'weapon':isAcc(k)?'acc':'armor',enchSafe=k=>ENH.safe[enchCls(k)];
/* v4.45 보조 강화석(아이온 '강화 보조제' 방식): 안전 구간 위에서만 · 단계 k(0~3)마다 강화석 +100% · 성공 확률 +5%p(최대 95%) — 남는 강화석으로 시도 수(골드 수수료)를 줄인다 */
ENH.aid={max:3,rate:.05,cap:.95};
const enchAid=(it,aid)=>it.en<enchSafe(it.k)?0:Math.max(0,Math.min(ENH.aid.max,aid==null?(S.encAid|0):aid|0));
function enchRate(it,aid){const k=enchCls(it.k),s=ENH.safe[k];if(it.en<s)return 1;const a=enchAid(it,aid),b=Math.min(1,(ENH.rate[k][it.en-s]||.2)+Math.floor((it.ff||0)/3)*ENH.failBonus);return a?Math.min(Math.max(b,ENH.aid.cap),b+a*ENH.aid.rate):b;}
/* 강화 비용: 강화석은 단계·지역에 비례(무기 ×1.5 · 장신구 ×2), 골드는 수수료 */
function enchCost(it,aid){const m=it.k==='weapon'?1.5:isAcc(it.k)?2:1,st=Math.max(1,Math.round((1+it.en*.6)*(1+.5*(it.t-1))*m)),a=enchAid(it,aid);return{stone:st*(1+a),gold:Math.round(60*it.t*(it.en+1)*(it.bu?1.5:1)),aid:a,base:st};}
const STATN={atk:'공격력',def:'방어',hp:'최대 HP',mp:'최대 MP',crit:'치명',skm:'스킬 피해',faith:'신앙'};
const statFmt=(k,v)=>k==='crit'||k==='skm'?'+'+(v*100).toFixed(1)+(k==='crit'?'%p':'%'):'+'+v;
const WT={weapon:40,armor:55,helm:20,cloak:15,gloves:15,boots:20,neck:3,ring:3};
/* v4.9 드롭 (리니지M 방식): 일반 몬스터는 낮은 확률로 일반/고급만. 희귀 이상은 지역 보스(관문 정예 · 침공 보스)의 낮은 확률 또는 제작.
   지역 보스는 장비 1개 + 제작 비법서 · 축복받은 주문서를 확률로 */
const DROP={eq:.04,hi:.15,ore:.18,dsg:.06,slot:{weapon:1,armor:1,helm:1,cloak:1,gloves:1,boots:1,neck:.6,ring:.8},
  boss:{grade:[[4,.01],[3,.05],[2,.20],[1,.60]],rcp2:.40,rcp3:.12,rcp4:.03,bls:.25,dsg:1}};
/* v4.14 제작 재료: 지역 광물 + 지역 장비 도면(무기·방어구·장신구) + 골드. 1·2단계 로웬 · 3·4단계 카르도 · 5단계 에르나 */
const REG=t=>t<=2?1:t<=4?2:3,REGN=['','로웬','카르도','에르나'],MAP_REG={rowen:1,kardo:2,erna:3};
const PART=k=>k==='weapon'?'w':isAcc(k)?'c':'a',PARTN={w:'무기',a:'방어구',c:'장신구'};
const oreKey=t=>'ore'+REG(t),dsgKey=(k,t)=>'d'+PART(k)+REG(t);
const BAG_SLOTS=80;
/* 묶음 아이템: 기존 세이브 필드(hpPot 등)는 그대로 두고 가방에서 같은 칸으로 보여 준다 */
const STK={
  hp:{n:'HP 물약',cat:'use',w:3,ic:'pot',col:'#e8584a',desc:()=>'최대 HP의 35% 회복 (Q) · 소지 한도 '+POT_CAP.hp,f:'hpPot'},
  mp:{n:'MP 물약',cat:'use',w:3,ic:'pot',col:'#5aa0e8',desc:()=>'최대 MP의 40% 회복 (E) · 소지 한도 '+POT_CAP.mp,f:'mpPot'},
  ret:{n:'귀환 주문서',cat:'use',w:1,ic:'scroll',col:'#8ad870',desc:()=>'즉시 마을로 귀환 (B) · 소지 한도 '+POT_CAP.scroll,f:'scroll'},
  /* v4.66 G12-a 버프 물약(지시서 §G12 · MMORPG 라이크 상점 구매형 시간제 버프): 5분 · 같은 종류는 시간만 갱신 · 사망하면 사라짐 · 전투력(cpOf)에 넣지 않음 */
  spdp:{n:'가속 물약',cat:'use',w:2,ic:'pot',col:'#5fe0b8',desc:()=>bufDesc('spdp')},
  atkp:{n:'힘의 물약',cat:'use',w:2,ic:'pot',col:'#ff8a3a',desc:()=>bufDesc('atkp')},
  defp:{n:'수호 물약',cat:'use',w:2,ic:'pot',col:'#c0a8ff',desc:()=>bufDesc('defp')},
  cure:{n:'정화 물약',cat:'use',w:1,ic:'pot',col:'#e8f6ff',desc:()=>'독 · 화상 · 둔화를 바로 풀고 '+CURE_K.imm+'초 동안 셋에 걸리지 않는다 · 기절은 풀지 못함 · 소지 한도 '+CURE_K.cap+' · 물약 상인'},/* v4.67 G12-b */
  stone:{n:'강화석',cat:'mat',w:.2,ic:'gem',col:'#7ac8ff',desc:()=>'장비 강화 재료 (강화 창) · 장비 분해 · 몬스터 · 퀘스트 · 대장장이 상점',f:'stone'},
  shard:{n:'권능 파편',cat:'mat',w:0,ic:'gem',col:'#ffd860',desc:()=>'신의 권능 각성 재료 (P)',f:'shard'},
  bls:{n:'축복받은 강화 주문서',cat:'use',w:1,ic:'scroll',col:'#ffd860',desc:()=>'강화 창에서 사용 · 안전 강화 구간에서 +1~3 (강화석 없이 골드만) · 지역 보스 · 퀘스트'},
  rcp2:{n:'희귀 제작 비법서',cat:'mat',w:1,ic:'book',col:'#62a8ff',desc:()=>'희귀 장비 제작 재료 · 지역 보스(관문 정예 · 침공)에게서 얻는다'},
  rcp3:{n:'영웅 제작 비법서',cat:'mat',w:1,ic:'book',col:'#ff6a58',desc:()=>'영웅 장비 제작 재료 · 지역 보스에게서 낮은 확률로'},
  rcp4:{n:'전설 제작 비법서',cat:'mat',w:1,ic:'book',col:'#c88cff',desc:()=>'전설 장비 제작 재료 · 지역 보스에게서 매우 낮은 확률로'},
  book_dash:{n:'스킬서 · 돌진 찌르기',cat:'use',w:5,ic:'book',col:'#62a8ff',book:'dash'},
  book_roar:{n:'스킬서 · 전투 함성',cat:'use',w:5,ic:'book',col:'#ff9a4a',book:'roar'},
  book_quake:{n:'스킬서 · 대지 가르기',cat:'use',w:5,ic:'book',col:'#c89a60',book:'quake'},
};
for(const r of [1,2,3]){const C=['','#b8a088','#c8d8e8','#8a5ab8'][r];STK['ore'+r]={n:REGN[r]+' '+['','철광석','은광석','흑요석 원석'][r],cat:'mat',w:.2,ic:'gem',col:C,desc:()=>REGN[r]+' 장비('+(r===1?'1·2':r===2?'3·4':'5')+'단계) 제작 재료 · '+REGN[r]+' 몬스터 · 퀘스트 · 토벌 의뢰'};
  for(const p of ['w','a','c'])STK['d'+p+r]={n:REGN[r]+' '+PARTN[p]+' 도면',cat:'mat',w:0,ic:'book',col:{w:'#e08a5a',a:'#6aa0d8',c:'#c8a0e8'}[p],desc:()=>REGN[r]+' '+PARTN[p]+(p==='a'?'(투구·갑옷·망토·장갑·장화)':p==='c'?'(목걸이·반지)':'')+' 제작에 1장 · '+REGN[r]+' 몬스터 낮은 확률 · 지역 보스 · 퀘스트'};}
const STK_ORDER=['hp','mp','ret','spdp','atkp','defp','cure','bls','book_dash','book_roar','book_quake','stone','ore1','ore2','ore3','dw1','da1','dc1','dw2','da2','dc2','dw3','da3','dc3','rcp2','rcp3','rcp4','shard'];
const stonePrice=()=>40+4*S.lv;
/* v4.66 G12-a 버프 물약 표 — 효과 · 지속(초) · 소지 한도 · 값 */
const BUFP={spdp:{ic:'»',mv:.15,as:.10,txt:'이동 속도 +15% · 공격 속도 +10%'},atkp:{ic:'⚔',atk:.08,txt:'공격력 +8%'},defp:{ic:'⛊',dr:.08,txt:'받는 피해 −8%'}},BUF_K={dur:300,cap:5,p0:150,pL:18};
const BUF_IDS=Object.keys(BUFP),bufPrice=()=>BUF_K.p0+BUF_K.pL*S.lv;
/* v4.67 G12-b 정화 물약 — fx: 푸는 상태이상(기절 제외) · imm: 면역 초 · 값 p0+pL×Lv */
const CURE_K={fx:['poison','burn','slow'],imm:10,cap:5,p0:60,pL:4},curePrice=()=>CURE_K.p0+CURE_K.pL*S.lv;
const bufDesc=k=>BUFP[k].txt+' · '+(BUF_K.dur/60)+'분 · 다시 마시면 시간만 처음으로 · 쓰러지면 사라짐 · 소지 한도 '+BUF_K.cap+' · 물약 상인';
/* 퀘스트 보상 정리: 예전 주문서 보상 → 강화석(장당 3) · 축복 주문서 */
function normRwStk(o){if(!o)return;const conv={wsc:['stone',3],asc:['stone',3],wscB:['bls',1],ascB:['bls',1]};for(const k in conv)if(o[k]){const [nk,m]=conv[k];o[nk]=(o[nk]||0)+o[k]*m;delete o[k];}}
const cnt=k=>{const d=STK[k];if(!d)return 0;return d.f?S[d.f]||0:(S.bag[k]||0);};
const setCnt=(k,v)=>{const d=STK[k];if(d.f)S[d.f]=v;else S.bag[k]=v;};
function addStk(k,n){if(n<=0)return 0;setCnt(k,cnt(k)+n);if(acqSrc&&acqStk(k))acqLog({cat:/^(book_|rcp)/.test(k)?'book':'mat',k,n:STK[k].n,q:n,src:acqSrc,z:acqZone});return n;}
/* v4.31 획득 기록 — 자동 사냥 중 무엇을 어디서 얻었는지. 고급 이상 장비 · 보스 전용 장비 · 도면 · 제작 비법서 · 스킬서 · 축복 주문서만, 최근 ACQ_MAX건(새것이 앞).
   가방 가득 · 무게 초과로 줍지 못한 장비도 '놓침'으로 남긴다. 상점 구입 · 분해 · 제작 결과 · 광물 · 강화석 · 물약은 남기지 않는다(너무 많아 정작 볼 것을 가림) */
const ACQ_MAX=50,ACQ_MERGE=3000;let acqSrc=null,acqZone=null;
const acqStk=k=>k==='bls'||/^rcp\d$/.test(k)||k.startsWith('book_')||/^d[wac]\d$/.test(k);
function acqSrcOf(m){if(!m)return null;if(typeof m==='string')return m;const kind=m.inv?'침공':m.field?'필드 보스':m.eliteOf?'관문 정예':m.boss?'보스':'';return (kind?kind+' · ':'')+m.name+' Lv '+m.lv;}
function acqZoneOf(m){if(m&&m.zone&&typeof ZALL!=='undefined'&&ZALL[m.zone])return ZALL[m.zone].name;return typeof MAPS!=='undefined'&&MAPS[MAPID]?MAPS[MAPID].name:'';}
function withAcq(src,z,f){const a=acqSrc,b=acqZone;acqSrc=src;acqZone=z;try{return f();}finally{acqSrc=a;acqZone=b;}}
function acqLog(e){if(!S)return;const L=S.acq||(S.acq=[]),now=Date.now(),p=L[0];
  /* 같은 곳에서 같은 재료를 잇달아 얻으면 한 줄로 합친다(퀘스트 보상 도면 2장 등) */
  if(p&&!e.u&&!p.u&&p.k===e.k&&p.src===e.src&&!p.miss===!e.miss&&now-p.at<ACQ_MERGE){p.q=(p.q||1)+(e.q||1);p.at=now;return;}
  e.at=now;L.unshift(e);if(L.length>ACQ_MAX)L.length=ACQ_MAX;}
const acqMissNew=()=>!!(S&&S.acq&&S.acq.some(e=>e.miss&&e.at>(S.acqSeen||0)));
/* v4.9 제작 (리니지M: 일반·고급은 적은 재료로 확정, 희귀 이상은 제작 비법서 + 확률 제작). 실패하면 비법서·강화석·골드만 잃고 재료 장비는 남는다(싱글 완화). 대성공 5%: 결과물 +1~3 */
const CRAFT_EQ=[
  {need:null,ore:t=>2+t,gold:t=>20+30*t*t,rate:1},
  {need:{g:0,n:2},ore:t=>3+t,gold:t=>60*t*t,rate:1},
  {need:{g:1,n:1},rcp:'rcp2',ore:t=>4+2*t,gold:t=>150*t*t,rate:.8},
  {need:{g:2,n:1},rcp:'rcp3',ore:t=>6+3*t,gold:t=>300*t*t,rate:.5},
  {need:{g:3,n:1},rcp:'rcp4',ore:t=>8+4*t,gold:t=>600*t*t,rate:.3}];
const CRAFT_GREAT=.05,CRAFT_KINDS=['weapon','helm','armor','cloak','gloves','boots','neck','ring'];
const craftTierMax=()=>S.maps.includes('erna')?5:S.maps.includes('kardo')?4:2;

/* =====================================================================
   v4.10 신앙 (지역·보스 권장 스탯)
   - 출처: 장비 등급(높은 등급 · 높은 단계일수록) · 강화 단계(무기·방어구 +1당 1) · 컬렉션 · 지역 보스 전용 장비
   - 지역(사냥터)·보스마다 요구 신앙이 있고, 모자라면 주는 피해↓ · 받는 피해↑ (faithMul)
   ===================================================================== */
const FAITH_G=[0,1,2,4,6];
const gradeFaith=(g,t)=>Math.round(FAITH_G[g]*(1+.25*((t||1)-1)));
/* 지역 보스 전용 장비 (리니지M 보스 드롭 장비): 관문 정예(지역 보스)만 떨어뜨린다. 퀘스트 첫 처치는 a 확정 · b 35%, 다시 나타난 지역 보스는 40%로 둘 중 하나 */
const BU={
  b6a:{q:'q6',n:'왕멧돼지 엄니 도끼',k:'weapon',t:2,g:2,fa:3,x:{atk:2}},
  b6b:{q:'q6',n:'왕멧돼지 가죽 장화',k:'boots',t:2,g:2,fa:3,x:{hp:20}},
  b10a:{q:'q10',n:'큰물뱀 비늘 갑옷',k:'armor',t:2,g:2,fa:4,x:{def:2}},
  b10b:{q:'q10',n:'물뱀 눈 목걸이',k:'neck',t:2,g:2,fa:4,x:{mp:20}},
  b12a:{q:'q12',n:'군주의 용암 장갑',k:'gloves',t:2,g:3,fa:5,x:{atk:3}},
  b12b:{q:'q12',n:'마그마 심장 반지',k:'ring',t:2,g:3,fa:5,x:{crit:.01}},
  b16a:{q:'q16',n:'파수꾼의 포자 투구',k:'helm',t:3,g:2,fa:5,x:{hp:40}},
  b16b:{q:'q16',n:'균사 망토',k:'cloak',t:3,g:2,fa:5,x:{mp:30}},
  b19a:{q:'q19',n:'등잔 껍데기 갑옷',k:'armor',t:3,g:3,fa:6,x:{def:4}},
  b19b:{q:'q19',n:'여왕의 등불 목걸이',k:'neck',t:3,g:3,fa:6,x:{skm:.02}},
  b21a:{q:'q21',n:'광석왕의 대검',k:'weapon',t:4,g:3,fa:7,x:{atk:6}},
  b21b:{q:'q21',n:'광석왕의 반지',k:'ring',t:4,g:3,fa:7,x:{atk:3}},
  b27a:{q:'q27',n:'불티나무 껍질 망토',k:'cloak',t:5,g:3,fa:8,x:{hp:60}},
  b27b:{q:'q27',n:'거목의 뿌리 장화',k:'boots',t:5,g:3,fa:8,x:{def:3}},
  b30a:{q:'q30',n:'대게 집게 장갑',k:'gloves',t:5,g:3,fa:9,x:{atk:6}},
  b30b:{q:'q30',n:'흑요석 등딱지 투구',k:'helm',t:5,g:3,fa:9,x:{def:4}},
  b32a:{q:'q32',n:'홍염의 날개검',k:'weapon',t:5,g:4,fa:12,x:{atk:12}},
  b32b:{q:'q32',n:'홍염의 깃 반지',k:'ring',t:5,g:4,fa:12,x:{crit:.02}}};
for(const id in BU)BU[id].id=id;
const buOfQ=qid=>Object.values(BU).filter(b=>b.q===qid);
/* v4.73 G3-a 보스 전용 장비 고유 효과 (MMORPG 라이크의 보스 드롭 장비 고유 옵션) — 착용 중에만 · 한 줄.
   효과 코드는 playerHit · killMob · usePot · pStats에 흩지 않고 gearFx()(착용 중 효과 목록 · gearSum처럼 캐시)를 거친다.
   훅: 평타(n · k · burn) · 처치(kill — G3-b) · 물약(pot) · 능력치(mv · fxK · low) */
const GFX={
  b6a:{txt:'평타 3번째마다 피해 +40%',n:3,k:.40},
  b6b:{txt:'이동 속도 +6%',mv:.06},
  b10a:{txt:'독 지속 시간 −50%',fxK:{poison:.5}},
  b10b:{txt:'MP 물약 회복량 +25%',pot:{mp:.25}},
  b12a:{txt:'평타가 대상에 화상 3초(초당 공격력 ×0.10 · 방어 무시)',burn:{dur:3,k:.10}},
  b12b:{txt:'HP 30% 이하일 때 공격력 +12%',low:{hp:.30,atk:.12}},
  /* v4.74 G3-b 카르도 · 에르나 12종 */
  b16a:{txt:'회오리 베기 범위 +20%',skR:{whirl:.20}},
  b16b:{txt:'비전투 HP 회복 2배',rg:1},
  b19a:{txt:'장판 · 폭발 피해 −25%',zoneK:.25},
  b19b:{txt:'별똥별 재사용 대기 −2초',cdS:{star:2}},
  b21a:{txt:'치명 피해 +20%p',critM:.20},
  b21b:{txt:'처치할 때 MP 4 회복',kill:m=>gfxMp(4)},
  b27a:{txt:'HP 물약 대기 2.2 → 1.7초',potCd:.5},
  b27b:{txt:'둔화 · 기절 지속 시간 −50%',fxK:{slow:.5,stun:.5}},
  b30a:{txt:'평타 15% 확률로 한 번 더',xhit:.15},
  b30b:{txt:'HP 50% 이상일 때 받는 피해 −8%',hiDr:{hp:.50,dr:.08}},
  b32a:{txt:'처치 시 주변 40에 공격력 ×0.5 불꽃(방어 무시)',kill:m=>gfxFlame(m,40,.5)},
  b32b:{txt:'쓰러질 때 한 번 HP 30%로 버팀(300초마다 · 경험치 손실 없음)',save:{hp:.30,cd:300}}};
for(const id in GFX)if(BU[id])BU[id].fx=Object.assign({id},GFX[id]);
let gfxV=-1,gfxC=null;
function gearFx(){const v=S.nu*1000+(S.gv||0);if(gfxV===v&&gfxC)return gfxC;const o={};
  for(const s of SLOTS){const it=S.eq[s]&&itemById(S.eq[s]);if(it&&it.bu&&BU[it.bu]&&BU[it.bu].fx)o[it.bu]=BU[it.bu].fx;}gfxC=o;gfxV=v;return o;}
const gfx=id=>gearFx()[id]||null;
const gfxSum=(key,sub)=>{let n=0;const F=gearFx();for(const id in F){const v=F[id][key];if(v==null)continue;n+=sub?(v[sub]||0):v;}return n;};
const BU_FIRST_B=.35,BU_FIELD=.40,BU_PITY=3,BU_INV=.10,FIELD_RESP=150;
/* ===== 장비 인스턴스 ===== */
function newItem(k,t,g){return{u:++S.nu,k,t:clamp(t,1,TIER_MAX),g:clamp(g,0,4),en:0,ff:0};}
function newBU(id){const b=BU[id];return{u:++S.nu,k:b.k,t:b.t,g:b.g,en:0,ff:0,bu:id};}
function itemName(it){if(it.bu)return (it.en?'+'+it.en+' ':'')+BU[it.bu].n;const T=TIERS[it.t],base=it.k==='weapon'?T.wn:it.k==='cloak'?T.ck:it.k==='neck'?T.nk:it.k==='ring'?T.rk:T.mat+' '+SLOTN[it.k];return (it.en?'+'+it.en+' ':'')+base;}
function itemStats(it){const o=Object.assign({},itemBase(it.k,TIERS[it.t].iL,it.g)),E=ENCH[it.k];if(E&&it.en)for(const s in E)o[s]=(o[s]||0)+E[s]*it.en;
  const B=it.bu&&BU[it.bu];if(B)for(const s in B.x)o[s]=+((o[s]||0)+B.x[s]).toFixed(4);
  const fa=(B?B.fa:gradeFaith(it.g,it.t))+(E?it.en:0);if(fa)o.faith=fa;return o;}
const itemW=it=>Math.round(WT[it.k]*(1+.1*(it.t-1)));
const itemById=u=>S.items.find(i=>i.u===u);
const equippedU=()=>new Set(Object.values(S.eq).filter(Boolean));
const isEq=it=>equippedU().has(it.u);
const slotOf=it=>{for(const s of SLOTS)if(S.eq[s]===it.u)return s;return null;};
/* 장착 합계 (pStats에서 매 프레임 쓰므로 버전 캐시) */
let gearV=-1,gearC=null;const gearDirty=()=>{gearV=-1;gfxV=-1;lastQKey='';};
function gearSum(){if(gearV===S.nu*1000+(S.gv||0)&&gearC)return gearC;const o={atk:0,def:0,hp:0,mp:0,crit:0,skm:0,faith:0};
  for(const s of SLOTS){const it=S.eq[s]&&itemById(S.eq[s]);if(!it)continue;const st=itemStats(it);for(const k in st)o[k]+=st[k];}
  const cb=collSum();for(const k in cb)o[k]+=cb[k];
  gearC=o;gearV=S.nu*1000+(S.gv||0);return o;}
const bumpGear=()=>{S.gv=(S.gv||0)+1;gearDirty();};
/* 비교용 전투력: 해당 아이템으로 바꿨을 때 */
function cpWith(slot,u){const old=S.eq[slot];S.eq[slot]=u;bumpGear();const c=cpOf();S.eq[slot]=old;bumpGear();return c;}
function targetSlot(it){if(it.k!=='ring')return it.k;if(!S.eq.ring1)return 'ring1';if(!S.eq.ring2)return 'ring2';
  const a=itemById(S.eq.ring1),b=itemById(S.eq.ring2);return cpScore(a)<=cpScore(b)?'ring1':'ring2';}
function cpScore(it){if(!it)return 0;const s=itemStats(it);return (s.atk||0)*6+(s.def||0)*4+(s.hp||0)*.6+(s.mp||0)*.4+(s.crit||0)*1200+(s.skm||0)*660+(s.faith||0)*FAITH_CP;}
const FAITH_CP=10;
function equipItem(u,silent){const it=itemById(u);if(!it)return false;const prev=slotOf(it);if(prev)return false;const s=targetSlot(it);S.eq[s]=u;bumpGear();
  const st=pStats();player.hp=Math.min(player.hp,st.hp);player.mp=Math.min(player.mp,st.mp);if(!silent)toast(itemName(it)+' 장착',true);save();return true;}
function unequip(slot,silent){const u=S.eq[slot];if(!u)return false;S.eq[slot]=null;bumpGear();const st=pStats();player.hp=Math.min(player.hp,st.hp);player.mp=Math.min(player.mp,st.mp);if(!silent)toast(itemName(itemById(u))+' 해제');save();return true;}
/* 무게 */
function weightNow(){let w=0;for(const it of S.items)w+=itemW(it);for(const k in STK)w+=STK[k].w*cnt(k);return w;}
const weightMax=()=>Math.round((1500+25*(S.st.str+S.st.vit)+15*S.lv)*(1+tbVal('wt')));/* v4.80 체력 20: 무게 한도 +10% */
const wPct=()=>weightNow()/weightMax();
const bagUsed=()=>S.items.length+STK_ORDER.filter(k=>cnt(k)>0).length;
/* 획득 */
function addItem(it,from){const src=from?acqSrc||acqSrcOf(from):null,lg=src&&(it.g>=1||it.bu),rec=miss=>acqLog({cat:'eq',n:itemName(it),g:it.g,bu:it.bu?1:0,u:miss?0:it.u,miss:miss?1:0,src,z:acqZone||acqZoneOf(from)});
  if(bagUsed()>=BAG_SLOTS){toastThr('가방이 가득 찼다 · 분해하거나 정리하자 (I)');if(lg)rec(1);return false;}
  if(weightNow()+itemW(it)>weightMax()){toastThr('무게 초과 · '+itemName(it)+'을(를) 들 수 없다');if(lg)rec(1);return false;}
  it.nw=1;S.items.push(it);if(lg)rec(0);autoLockNew(it);STAT.drops=(STAT.drops||0)+1;lastQKey='';
  if(S.cfg.autoEq&&!isEq(it)){const s=targetSlot(it),cur=S.eq[s]&&itemById(S.eq[s]);if(!cur||cpWith(s,it.u)>cpOf()+1){equipItem(it.u,true);toast('자동 장착 · '+GRADES[it.g].n+' '+itemName(it),true);}}
  return true;}
let toastT=0;function toastThr(m){if(t<toastT)return;toastT=t+4;toast(m);}
function rollGrade(boss){const r=Math.random();if(!boss)return r<DROP.hi?1:0;for(const [g,p] of DROP.boss.grade)if(r<p)return g;return 0;}
function rollSlot(){const W=DROP.slot;let s=0;for(const k in W)s+=W[k];let r=Math.random()*s;for(const k in W){r-=W[k];if(r<=0)return k;}return 'weapon';}
/* 지역 보스 전용 장비 드롭 */
function dropBU(m){let L=[];if(m.eliteOf){const q=QUESTS.find(x=>x.id===m.eliteOf),B=buOfQ(m.eliteOf);if(!B.length)return;
    if(m.field){const cq=curQ(),force=S.qs==='active'&&cq.type==='fboss'&&cq.boss===m.eliteOf;/* v4.24 천장: 같은 필드 보스에서 연속 2번 못 얻으면 3번째는 확정 */const bm=S.buMiss||(S.buMiss={}),pity=(bm[m.eliteOf]||0)>=BU_PITY-1;if(force||pity||Math.random()<BU_FIELD){bm[m.eliteOf]=0;/* 아직 컬렉션에 못 넣었고 등록할 수 있는 사본(미장착 · 미잠금)이 없는 쪽을 우선 — v4.24: 장착 중인 사본은 '갖고 있음'으로 치지 않는다 */const want=B.filter(b=>!COLL.some(c=>c.req.some((r,i)=>r.bu===b.id&&!collReg(c,i)))?false:!S.items.some(x=>x.bu===b.id&&!isEq(x)&&!x.lock));L.push(want.length?want[Math.floor(Math.random()*want.length)]:B[Math.random()<.5?0:1]);}else bm[m.eliteOf]=(bm[m.eliteOf]||0)+1;}else{L.push(B[0]);if(Math.random()<BU_FIRST_B)L.push(B[1]);}}
  else if(m.inv){const cl=QUESTS.filter((q,i)=>i<S.qi&&q.elite&&qMap(q)===MAPID).flatMap(q=>buOfQ(q.id));if(cl.length&&Math.random()<BU_INV)L.push(cl[Math.floor(Math.random()*cl.length)]);}
  L.forEach((b,i)=>{const it=newBU(b.id);if(addItem(it,m)){floatTxt(m.x,m.y-46-i*9,'★ '+b.n,GRADES[b.g].c,true);banner('보스 전용 장비',b.n+' · 신앙 +'+b.fa,true);STAT.bu=(STAT.bu||0)+1;}});}
function dropFrom(m){return withAcq(acqSrcOf(m),acqZoneOf(m),()=>dropFrom0(m));}
function dropFrom0(m){dropBU(m);const tier=tierOfLv(m.lv),n=m.boss?1:Math.random()<DROP.eq?1:0;
  for(let i=0;i<n;i++){const it=newItem(rollSlot(),tier,rollGrade(m.boss));if(addItem(it,m)){const G=GRADES[it.g];floatTxt(m.x,m.y-30-i*8,G.n+' '+itemName(it),G.c,it.g>=2);
      if(it.g>=3)banner(G.n+' 장비 획득',itemName(it),true);else if(it.g>=2)toast(G.n+' · '+itemName(it)+' 획득',true);else if(betterThanEq(it))toast('더 좋은 장비 · '+itemName(it)+' (가방 I)',true);}}
  {const r=(m.zone&&ZALL[m.zone]&&MAP_REG[ZALL[m.zone].map])||REG(tier),tr=r===1?1:r===2?3:5;if(Math.random()<(m.boss?1:DROP.ore)){const n=m.boss?3+2*r:1;addStk('ore'+r,n);if(m.boss||Math.random()<.3)floatTxt(m.x,m.y-34,'+'+STK['ore'+r].n+' '+n,STK['ore'+r].col);}
    if(Math.random()<(m.boss?DROP.boss.dsg:DROP.dsg)){const k=dsgRand(r);addStk(k,1);floatTxt(m.x,m.y-52,'+'+STK[k].n,STK[k].col,true);toast(STK[k].n+' 획득',true);}}
  if(m.boss){const B=DROP.boss;for(const k of ['rcp2','rcp3','rcp4','bls'])if(Math.random()<B[k]){addStk(k,1);floatTxt(m.x,m.y-40,'+'+STK[k].n,STK[k].col,true);toast(STK[k].n+' 획득',true);}}
}
const dsgRand=r=>{const x=Math.random();return 'd'+(x<.3?'w':x<.75?'a':'c')+r;};
/* 분해 → 강화석 */
const disYield=it=>GRADES[it.g].dis*(it.bu?2:1)+(it.t-1)+Math.floor(it.en/2);
function disassemble(us,silent){let n=0,st=0;for(const u of us){const i=S.items.findIndex(x=>x.u===u);if(i<0)continue;const it=S.items[i];if(isEq(it)||it.lock)continue;st+=disYield(it);S.items.splice(i,1);n++;}
  if(n){S.stone+=st;STAT.dis=(STAT.dis||0)+n;bumpGear();if(!silent)toast('분해 '+n+'개 · 강화석 +'+st,true);save();}return{n,st};}
/* 자동 분해: 무게 45% 이상 또는 가방 90% 이상일 때, 설정 등급 이하 · 미장착 · 잠기지 않음 · 지금 장비보다 좋지 않은 것 */
function autoDisCheck(){const g=S.cfg.autoDis;if(g==null||g<0)return;if(wPct()<.45&&bagUsed()<BAG_SLOTS*.9)return;
  const us=S.items.filter(it=>it.g<=g&&!it.bu&&!isEq(it)&&!it.lock&&!betterThanEq(it)&&!collNeeds(it)).map(it=>it.u);if(!us.length)return;const r=disassemble(us,true);
  if(r.n)toast('자동 분해 · '+GRADES[g].n+(g?'까지 ':' ')+r.n+'개 → 강화석 +'+r.st+' (설정에서 변경)',true);}
/* v4.32 자동 잠금: 설정 등급 이상을 얻으면 바로 잠근다 — 아직 컬렉션에 등록할 수 있는 장비는 등록을 막지 않도록 잠그지 않는다 */
function autoLockOk(it){const g=S.cfg&&S.cfg.autoLock;return g!=null&&g>=0&&it.g>=g&&!it.lock&&!collNeeds(it);}
function autoLockNew(it){if(!autoLockOk(it))return false;it.lock=1;toast('자동 잠금 🔒 '+GRADES[it.g].n+' '+itemName(it)+' (설정에서 변경)',true);return true;}
/* v4.32 일괄 잠금 대상 */
const LOCK_SETS=[['eq','장착 중인 장비',it=>isEq(it)],['hi','영웅 이상 (가방)',it=>!isEq(it)&&it.g>=3],['en','강화한 장비 +1 이상 (가방)',it=>!isEq(it)&&it.en>=1],['bu','보스 전용 ★ (가방)',it=>!isEq(it)&&!!it.bu]];
function lockSet(id,on){const L=LOCK_SETS.find(x=>x[0]===id);if(!L)return 0;let n=0;for(const it of S.items)if(L[2](it)&&!it.lock===!!on){it.lock=on?1:0;n++;}if(n)save();return n;}
function unlockAll(){let n=0;for(const it of S.items)if(it.lock){it.lock=0;n++;}if(n)save();return n;}
function betterThanEq(it){const s=targetSlot(it),cur=S.eq[s]&&itemById(S.eq[s]);return !cur||cpScore(it)>cpScore(cur);}
/* 강화 */

/* 축복받은 주문서: 안전 구간 안에서는 +0~2 → +1~3, +3~5 → +1~2, 그 위 +1 (리니지). 안전 구간을 넘어서는 일반과 같은 확률로 +1 */
function blessUp(en){const m=en<=2?3:en<=5?2:1;return 1+Math.floor(Math.random()*m);}
/* blessed: 축복받은 강화 주문서 1장 + 골드 (강화석 없음) */
function enchCheck(it,blessed){if(!it||!canEnch(it.k))return{ok:false,why:'강화할 수 없다'};if(it.en>=ENH.max)return{ok:false,why:'최대 강화'};const c=enchCost(it,blessed?0:null);
  if(S.gold<c.gold)return{ok:false,why:'골드 부족',c};if(blessed){if(!cnt('bls'))return{ok:false,why:'축복받은 강화 주문서가 없다',c};}else if(S.stone<c.stone)return{ok:false,why:'강화석 '+S.stone+'/'+c.stone,c};return{ok:true,c};}
function enchant(u,blessed){const it=itemById(u),ck=enchCheck(it,blessed);if(!ck.ok)return it&&it.en>=ENH.max?{max:true,it}:null;
  S.gold-=ck.c.gold;if(blessed)setCnt('bls',cnt('bls')-1);else{S.stone-=ck.c.stone;if(ck.c.aid)STAT.aidSt=(STAT.aidSt||0)+ck.c.stone-ck.c.base;}STAT.ench=(STAT.ench||0)+1;STAT.enchG=(STAT.enchG||0)+ck.c.gold;
  if(blessed&&it.en<enchSafe(it.k)){const up=Math.min(ENH.max-it.en,blessUp(it.en));it.en+=up;it.ff=0;bumpGear();growthEvent('ench',it);save();return{ok:true,it,rate:1,up};}
  const rate=enchRate(it,blessed?0:null),ok=Math.random()<rate;
  if(ok){it.en++;it.ff=0;bumpGear();growthEvent('ench',it);}else it.ff=(it.ff||0)+1;save();return{ok,it,rate,up:ok?1:0};}
function enchantEquipped(slot){const it=S.eq[slot]&&itemById(S.eq[slot]);if(!it||it.en>=ENH.max){S.stone+=4;return false;}it.en++;bumpGear();return true;}
/* 무기 스프라이트(휘두르기) = 장착 무기 티어 */
const weapSpr=()=>{const it=S.eq.weapon&&itemById(S.eq.weapon);return it?TIERS[it.t].w:'club';};
/* 미스릴 장검 스프라이트 (art.js에 없는 종류) */
const _mkWeapon0=mkWeapon;
mkWeapon=function(k){if(k!=='sword')return _mkWeapon0(k);const c=mk(24,9),g=c.getContext('2d'),p=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  p(0,4,4,1,'#4a3a2a');p(0,3,3,1,'#2a2018');p(4,1,1,7,'#c8d8e8');p(3,2,1,5,'#8aa0b8');p(5,3,15,3,'#8ab8d8');p(5,3,15,1,'#e0f4ff');p(20,4,2,1,'#e0f4ff');p(6,4,13,1,'#6a98b8');return c;};

/* ===== 픽셀 아이콘 (12×12 문자 지도) ===== */
const ICONMAP={
  helm:['............','....kkkk....','...kbbaak...','..kbaaaack..','..kaaaaack..','.kaaggaaack.','.kaakkkkack.','.kak....kck.','.kak....kck.','..k......k..','............','............'],
  armor:['............','..kk....kk..','.kbak..kack.','.kaaakkaaak.','.kkaabbaakk.','..kaabbaak..','..kaaggaak..','..kaaaaaak..','..kcccccck..','..kaaaaaak..','...kkkkkk...','............'],
  cloak:['............','....kggk....','...kabbak...','..kaabbaak..','..kaaaaaak..','.kaaaaaaaak.','.kaacaacaak.','.kaacaacaak.','kaaacaacaaak','kaacaaaacaak','kkkkkkkkkkkk','............'],
  gloves:['............','....k.k.k...','...kbkbkbk..','...kakakak..','..kkaaaaaak.','.kbkaaaaaak.','.kaakaaaaak.','..kaaaaaak..','...kaaaak...','...kggggk...','...kkkkkk...','............'],
  boots:['............','...kkkkk....','...kbaak....','...kbaak....','...kaaak....','...kaaak....','...kaaakkk..','..kbaaaaaakk','..kaaaaaaaak','..kgggggggck','..kkkkkkkkkk','............'],
  neck:['............','..aa....aa..','.a..a..a..a.','.a...aa...a.','..a......a..','...a....a...','....a..a....','.....aa.....','....kggk....','....kgbk....','.....kk.....','............'],
  ring:['............','.....kk.....','....kggk....','....kgbk....','....kaak....','...ka..ak...','..ka....ak..','..ka....ak..','...ka..ak...','....kaak....','............','............'],
  pot:['............','.....ww.....','.....ww.....','....kkkk....','....k..k....','...kbaaak...','..kbaaaaak..','..kaaaaaak..','..kaaaaaak..','..kcaaaack..','...kkkkkk...','............'],
  scroll:['............','.kkkkkkkkkk.','kwwwwwwwwwwk','.kkkkkkkkkk.','..kpppppppk.','..kpcccccpk.','..kppppppk..','..kpcccpppk.','..kpppaaapk.','.kkkkkabakk.','kwwwwwaaawwk','.kkkkkkkkkk.'],
  gem:['............','.....kk.....','....kbbk....','...kbaaak...','..kbaaaaak..','..kaaaaack..','...kaaack...','....kack....','.....kk.....','............','............','............'],
  book:['............','..kkkkkkkk..','.kaaaaaaabk.','.kawwwwwabk.','.kawwbwwabk.','.kawwwwwabk.','.kaaaaaaabk.','.kaaaaaaabk.','.kaaaaaaabk.','.kccccccccwk','..kkkkkkkkk.','............'],
};
const ICONC=new Map();
function shade(hex,f){const n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,m=v=>clamp(Math.round(f>1?v+(255-v)*(f-1):v*f),0,255);return '#'+[m(r),m(g),m(b)].map(v=>v.toString(16).padStart(2,'0')).join('');}
function paintIcon(key,pal){const ck=key+JSON.stringify(pal);let c=ICONC.get(ck);if(c)return c;const map=ICONMAP[key];c=mk(12,12);const g=c.getContext('2d');
  for(let y=0;y<12;y++)for(let x=0;x<12;x++){const ch=map[y][x];if(!ch||ch==='.')continue;g.fillStyle=ch==='k'?'#1a1220':pal[ch]||'#ff00ff';g.fillRect(x,y,1,1);}ICONC.set(ck,c);return c;}
/* 무기 아이콘: 스프라이트의 실제 그림 영역만 잘라 45° 돌려 꽉 차게 */
function weaponIcon(w){const ck='w:'+w;let c=ICONC.get(ck);if(c)return c;const s=mkWeapon(w),d=s.getContext('2d').getImageData(0,0,s.width,s.height).data;let x0=99,x1=-1,y0=99,y1=-1;
  for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++)if(d[(y*s.width+x)*4+3]>0){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  const bw=x1-x0+1,bh=y1-y0+1,n=Math.ceil((bw+bh)/1.414)+1;c=mk(n,n);const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.translate(n/2,n/2);g.rotate(-Math.PI/4);g.drawImage(s,x0,y0,bw,bh,-bw/2,-bh/2,bw,bh);ICONC.set(ck,c);return c;}
function itemIcon(it){if(it.k==='weapon')return weaponIcon(it.bu&&BU[it.bu].g>=4?'obsword':TIERS[it.t].w);const P=it.bu?Object.assign({},TIERS[it.t].col,{g:GRADES[it.g].c,b:shade(GRADES[it.g].c,1.3)}):TIERS[it.t].col;return paintIcon(it.k,P);}
function stkIcon(k){const d=STK[k],a=d.col;return paintIcon(d.ic,{a,b:shade(a,1.45),c:shade(a,.62),w:'#d8c8a0',p:'#efe2c0',g:a});}

/* ===== 세이브 이전 (v4.7 → v4.8) ===== */
const CFG0={scan:'mid',tgt:'quest',order:'slot',counter:true,potAt:.4,autoDis:-1,autoEq:false,autoLock:-1,autoBuf:false,autoCure:false};
function migrate48(S,fresh){if(S.cfg&&S.cfg.dodge===undefined)S.cfg.dodge=true;/* v4.72 G1-h 예고 회피 설정 */if(typeof migrateQi==='function')migrateQi(S);if(S.grave===undefined)S.grave=null;if(!S.buf||typeof S.buf!=='object')S.buf={};/* v4.66 G12 버프 물약 남은 시간(초) *//* v4.65 G9 무덤(이전 세이브엔 없음) */S.cfg=Object.assign({},CFG0,S.cfg||{});if(S.cfg.potAt==null)S.cfg.potAt=.4;
  if(!S.items){S.items=[];S.eq={};S.bag={};S.nu=S.nu||0;
    /* 기존 세이브: 무기·갑옷 강화 단계를 그대로 옮기고, 몬스터 상향에 맞춰 현재 레벨 티어의 일반 장비 6부위를 지급 */
    const T=fresh?1:tierOfLv(S.lv||1),mkI=(k)=>({u:++S.nu,k,t:T,g:0,en:0,ff:0});
    /* v4.9: 새 게임은 장비 없이 시작 — 사냥·제작으로 얻는다 */
    if(!fresh){const w=mkI('weapon');w.en=Math.min(ENH.max,S.wlv||0);const a=mkI('armor');a.en=Math.min(ENH.max,S.alv||0);S.items.push(w,a);S.eq.weapon=w.u;S.eq.armor=a.u;for(const k of ['helm','cloak','gloves','boots']){const it=mkI(k);S.items.push(it);S.eq[k]=it.u;}S.migrated48=true;}
    S.bag.wsc=fresh?0:2;S.bag.asc=fresh?0:3;}
  S.coll=S.coll||{};
  /* v4.14: 주문서 → 강화석(장당 3) · 축복 주문서 통합 */
  if(S.bag){normRwStk(S.bag);if(S.bag.stone){S.stone=(S.stone||0)+S.bag.stone;delete S.bag.stone;}}S.crafted=S.crafted||[0,0,0,0,0];
  /* v4.10: 진행 중인 관문에 새로 생긴 성장 서브를 연다 */
  if(S.qs==='active'&&S.qi<QUESTS.length)for(const id of QUESTS[S.qi].subs||[])if(S.sq&&!S.sq[id])S.sq[id]={st:'avail',n:0};
  for(const s of SLOTS)if(!(s in S.eq))S.eq[s]=null;S.bag=S.bag||{};
  if(!S.slots){S.slots=Array(8).fill(null);let j=0;for(const s of SK)if((S.sk[s.id]||0)>0&&j<8)S.slots[j++]=s.id;}
  while(S.slots.length<8)S.slots.push(null);S.slots=S.slots.slice(0,8);
  if(S.autoPot==null)S.autoPot=true;
  /* v4.8.4 권능 퀘스트 획득: 이전 세이브는 쓰던 권능만 얻은 것으로, 나머지는 시련 퀘스트로 (메인 5를 넘겼으면 바로 열림) */
  if(!S.gods){S.gods={};if(S.god)S.gods[S.god]=true;if(S.qi>=5)for(const [id,k] of [['ga','athena'],['gr','artemis'],['gz','zeus']])if(!S.gods[k]&&!S.sq[id])S.sq[id]={st:'avail',n:0};}
  return S;}

/* =====================================================================
   v4.9 컬렉션 (리니지M 아이템 컬렉션): 지정 장비를 등록하면 아이템은 사라지고, 컬렉션을 완성하면 능력치가 영구히 오른다.
   장착 중 · 잠금 장비는 등록 불가. 요구 조건: 부위(k) · 단계(t, 없으면 아무 단계) · 등급 이상(g) · 강화 이상(en)
   ===================================================================== */
const COLL=[
  {id:'c1',cat:0,n:'원정대 견습생',req:[{k:'weapon',t:1},{k:'armor',t:1}],b:{hp:30,faith:1}},
  {id:'c2',cat:0,n:'가죽 수집가',req:[{k:'helm',t:1},{k:'gloves',t:1},{k:'boots',t:1}],b:{def:2,faith:1}},
  {id:'c3',cat:0,n:'첫 장신구',req:[{k:'neck',t:1},{k:'ring',t:1}],b:{mp:20,hp:20,faith:1}},
  {id:'c4',cat:0,n:'청동 전사',req:[{k:'weapon',t:2},{k:'helm',t:2},{k:'armor',t:2}],b:{atk:3,hp:30,faith:2}},
  {id:'c5',cat:0,n:'사냥꾼의 차림',req:[{k:'cloak',t:2},{k:'gloves',t:2},{k:'boots',t:2}],b:{def:2,hp:30,faith:2}},
  {id:'c6',cat:1,n:'단련의 시작',req:[{k:'weapon',en:4},{k:'armor',en:3}],b:{atk:4,faith:3}},
  {id:'c7',cat:1,n:'고급 장신구함',req:[{k:'neck',g:1},{k:'ring',g:1},{k:'ring',g:1}],b:{crit:.01,faith:2}},
  {id:'c8',cat:1,n:'강철 수호대',req:[{k:'helm',t:3,en:2},{k:'armor',t:3,en:2},{k:'boots',t:3,en:2}],b:{def:3,hp:60,faith:3}},
  {id:'c9',cat:1,n:'협곡의 검사',req:[{k:'weapon',t:3,g:1,en:3},{k:'gloves',t:3,g:1}],b:{atk:6,faith:3}},
  {id:'c10',cat:2,n:'희귀한 빛',req:[{k:'weapon',g:2},{k:'armor',g:2},{k:'cloak',g:2}],b:{hp:100,mp:30,faith:4}},
  {id:'c11',cat:2,n:'미스릴 기사단',req:[{k:'weapon',t:4,en:5},{k:'helm',t:4,en:4},{k:'armor',t:4,en:4},{k:'gloves',t:4,en:4}],b:{atk:8,def:4,faith:5}},
  {id:'c12',cat:2,n:'수정 현자',req:[{k:'neck',t:3,g:2},{k:'ring',t:3,g:2}],b:{skm:.04,faith:4}},
  {id:'c13',cat:3,n:'흑요석 정예',req:[{k:'weapon',t:5,g:2,en:6},{k:'armor',t:5,g:2,en:4},{k:'boots',t:5,g:1,en:4}],b:{atk:12,hp:120,faith:6}},
  {id:'c14',cat:3,n:'영웅의 증표',req:[{k:'weapon',g:3},{k:'armor',g:3},{k:'neck',g:3}],b:{crit:.02,skm:.05,faith:6}},
  {id:'c15',cat:3,n:'전설의 유산',req:[{k:'weapon',g:4,en:7},{k:'ring',g:4}],b:{atk:20,crit:.02,faith:8}},
];
/* v4.10 지역 보스 컬렉션: 보스 전용 장비(req.bu)로만 채운다 — 착용과 등록 사이의 선택 (리니지M 보스 아이템 컬렉션) */
COLL.push(
  {id:'bc6',cat:4,n:'숲의 주인 토벌',req:[{bu:'b6a'},{bu:'b6b'}],b:{faith:4,atk:3}},
  {id:'bc10',cat:4,n:'호수의 주인 토벌',req:[{bu:'b10a'},{bu:'b10b'}],b:{faith:5,hp:60}},
  {id:'bc12',cat:4,n:'마그마골렘 군주의 유산',req:[{bu:'b12a'},{bu:'b12b'}],b:{faith:6,def:3}},
  {id:'bc16',cat:4,n:'동굴 파수꾼 토벌',req:[{bu:'b16a'},{bu:'b16b'}],b:{faith:6,hp:80}},
  {id:'bc19',cat:4,n:'협곡 여왕 토벌',req:[{bu:'b19a'},{bu:'b19b'}],b:{faith:7,skm:.02}},
  {id:'bc21',cat:4,n:'광석골렘 왕의 유산',req:[{bu:'b21a'},{bu:'b21b'}],b:{faith:8,atk:6}},
  {id:'bc27',cat:4,n:'불티 숲 주인 토벌',req:[{bu:'b27a'},{bu:'b27b'}],b:{faith:9,hp:120}},
  {id:'bc30',cat:4,n:'용암 호수 군주 토벌',req:[{bu:'b30a'},{bu:'b30b'}],b:{faith:10,def:5}},
  {id:'bc32',cat:4,n:'불새 여왕 홍염의 유산',req:[{bu:'b32a'},{bu:'b32b'}],b:{faith:14,atk:12,crit:.01}},
  {id:'br1',cat:4,n:'로웬의 수호자',req:[{bu:'b6a',en:3},{bu:'b10a',en:3},{bu:'b12a',en:2}],b:{faith:8,atk:5,hp:80}},
  {id:'br2',cat:4,n:'카르도의 수호자',req:[{bu:'b16a',en:4},{bu:'b19a',en:4},{bu:'b21a',en:4}],b:{faith:10,atk:8,def:4}},
  {id:'br3',cat:4,n:'에르나의 수호자',req:[{bu:'b27a',en:5},{bu:'b30a',en:5},{bu:'b32a',en:5}],b:{faith:14,atk:12,hp:150}});
const COLL_CAT=['일반','고급','희귀','영웅 · 전설','지역 보스'];
const isBossColl=c=>c.cat===4;
const collReg=(c,i)=>!!(S.coll[c.id]&&S.coll[c.id][i]);
const collDone=c=>c.req.every((r,i)=>collReg(c,i));
function collSum(){const o={};if(!S||!S.coll)return o;for(const c of COLL)if(collDone(c))for(const k in c.b)o[k]=(o[k]||0)+c.b[k];return o;}
function reqLabel(r){if(r.bu)return (r.en?'+'+r.en+' ':'')+BU[r.bu].n+' · '+QUESTS.find(q=>q.id===BU[r.bu].q).elite.name.split(' · ').pop();const T=r.t&&TIERS[r.t];let n=T?(r.k==='weapon'?T.wn:r.k==='cloak'?T.ck:r.k==='neck'?T.nk:r.k==='ring'?T.rk:T.mat+' '+SLOTN[r.k]):'아무 '+SLOTN[r.k];
  return (r.en?'+'+r.en+' ':'')+n+(r.g?' · '+GRADES[r.g].n+' 이상':'');}
const reqMatch=(r,it,ignoreEn)=>(r.bu?it.bu===r.bu:!it.bu&&it.k===r.k&&(!r.t||it.t===r.t)&&it.g>=(r.g||0))&&(ignoreEn||it.en>=(r.en||0));
const reqIcon=r=>r.bu?{k:BU[r.bu].k,t:BU[r.bu].t,g:BU[r.bu].g,en:0,bu:r.bu}:{k:r.k,t:r.t||1,g:r.g||0,en:0};
/* 등록에 쓸 장비: 조건을 만족하는 미장착·미잠금 장비 중 가장 값이 낮은 것 */
function collCand(r,ignoreEn){return S.items.filter(it=>!isEq(it)&&!it.lock&&reqMatch(r,it,ignoreEn)).sort((a,b)=>a.g-b.g||a.en-b.en||a.t-b.t)[0]||null;}
function collNeeds(it){for(const c of COLL){if(collDone(c))continue;for(let i=0;i<c.req.length;i++)if(!collReg(c,i)&&reqMatch(c.req[i],it))return c;}return null;}
const collCanAny=()=>COLL.some(c=>!collDone(c)&&c.req.some((r,i)=>!collReg(c,i)&&collCand(r)));
function collRegister(cid,i,u){const c=COLL.find(x=>x.id===cid);if(!c||collReg(c,i))return false;const r=c.req[i],it=u?itemById(u):collCand(r);if(!it||isEq(it)||it.lock||!reqMatch(r,it))return false;
  S.items.splice(S.items.indexOf(it),1);S.coll[cid]=S.coll[cid]||{};S.coll[cid][i]=1;STAT.coll=(STAT.coll||0)+1;bumpGear();growthEvent('reg',it);
  if(collDone(c)){banner('컬렉션 완성',c.n+' · '+Object.entries(c.b).map(([k,v])=>STATN[k]+' '+statFmt(k,v)).join(' · '),true);burst(player.x,player.y,18,'#ffe08a',40,100,5);}
  else toast('컬렉션 등록 · '+c.n+' '+c.req.filter((r,j)=>collReg(c,j)).length+'/'+c.req.length,true);save();return true;}

/* ===== 제작 ===== */
function craftMats(k,t,g,n){return S.items.filter(it=>it.k===k&&it.t===t&&it.g===g&&!it.bu&&!isEq(it)&&!it.lock).sort((a,b)=>a.en-b.en).slice(0,n);}
function craftCheck(k,t,g){const R=CRAFT_EQ[g],ok=oreKey(t),dk=dsgKey(k,t),ore=R.ore(t),gold=R.gold(t),why=[];if(t>craftTierMax())why.push(TIERS[t].area+' 지역을 열어야 한다');
  if(cnt(ok)<ore)why.push(STK[ok].n+' '+cnt(ok)+'/'+ore);if(!cnt(dk))why.push(STK[dk].n+' 필요');if(S.gold<gold)why.push('골드 부족');if(R.rcp&&!cnt(R.rcp))why.push(STK[R.rcp].n+' 필요');
  if(R.need){const m=craftMats(k,t,R.need.g,R.need.n);if(m.length<R.need.n)why.push('재료 장비 '+GRADES[R.need.g].n+' '+m.length+'/'+R.need.n);}
  return{ok:!why.length,why,ore,ok_:ok,dk,gold,R};}
/* v4.33 여러 개 한 번에: 최대 = 모든 시도가 성공한다고 볼 때 재료가 되는 횟수(실패하면 재료 장비가 남아 더 할 수 있어도 보수적으로) · 최대 50 */
const CRAFT_N_MAX=50;
function craftMaxN(k,t,g){const c=craftCheck(k,t,g);if(!c.ok)return 0;const R=c.R;let n=Math.min(CRAFT_N_MAX,Math.floor(cnt(c.ok_)/c.ore),cnt(c.dk),c.gold>0?Math.floor(S.gold/c.gold):CRAFT_N_MAX);
  if(R.rcp)n=Math.min(n,cnt(R.rcp));if(R.need)n=Math.min(n,Math.floor(craftMats(k,t,R.need.g,99).length/R.need.n));return Math.max(0,n);}
/* n번 시도(재료가 떨어지면 그 자리에서 멈춤) → 요약 */
function craftBatch(k,t,g,n){const o={tries:0,ok:0,fail:0,great:0,items:[],stop:''};for(let i=0;i<n;i++){const r=craftItem(k,t,g);if(!r){o.stop=craftCheck(k,t,g).why[0]||'';break;}o.tries++;if(r.ok){o.ok++;o.items.push(r.it);if(r.great)o.great++;}else o.fail++;}
  o.best=o.items.slice().sort((a,b)=>cpScore(b)-cpScore(a))[0]||null;return o;}
function craftItem(k,t,g){const c=craftCheck(k,t,g);if(!c.ok)return null;const R=c.R;setCnt(c.ok_,cnt(c.ok_)-c.ore);setCnt(c.dk,cnt(c.dk)-1);S.gold-=c.gold;if(R.rcp)setCnt(R.rcp,cnt(R.rcp)-1);STAT.craft=(STAT.craft||0)+1;
  if(Math.random()>=R.rate){save();return{ok:false};}
  if(R.need)for(const it of craftMats(k,t,R.need.g,R.need.n))S.items.splice(S.items.indexOf(it),1);
  const it=newItem(k,t,g),great=Math.random()<CRAFT_GREAT;if(great)it.en=1+Math.floor(Math.random()*3);bumpGear();growthEvent('craft',it);
  if(!addItem(it)){S.items.push(it);}save();return{ok:true,it,great};}

/* ================= v4.47 몬스터 행동 원형 · 상태이상 데이터 (지시서 §G1) =================
   MOB_B: 종 → {b:행동 원형, fx:거는 상태이상}. 배정은 이 표 하나로만 한다(코드에 흩지 않는다).
   G1-a(v4.47)는 틀만: 원형은 모두 'melee'(지금 동작 그대로), 상태이상은 호수뱀의 독 하나만 시험 배정.
   지역 보스 · 관문 정예(boss · eliteOf)에는 아직 붙이지 않는다(보스 패턴은 G1-f~g). */
const MOB_B={
  lakesnake:{b:'melee',fx:'poison'},
  /* v4.62 G1-e1: 상태이상 3종 첫 배정(각 1종) — fxBy = 그 공격으로만 건다(melee · charge · shot · burst · 없으면 모두) */
  lavalizard:{b:'melee',fx:'burn'},
  /* v4.63 G1-e2: 상태이상 나머지 배정 — 독 모래도마뱀 · 유황딱정벌레(근접 25%) */
  sandlizard:{b:'melee',fx:'poison'},/* 카르도 자갈 언덕 Lv17~18 */
  sulfurbeetle:{b:'melee',fx:'poison'},/* 에르나 잿가루 언덕 Lv30~31 *//* 용암도마뱀 — 로웬 잿빛 고원 Lv13~14 · 에르나 용암 호수 Lv34~35 (근접 타격 25%) */
  acornboar:{b:'charge'},/* v4.54 G1-c1: 돌진 첫 종(로웬 도토리 숲 Lv3~5 · 상태이상 없음 — 입문 구간 보호). 관문 정예 '왕멧돼지'(q5 · q6)는 제외(G1-f 보스 패턴) */
  bull:{b:'charge',lock:.27,lj:.025,fx:'stun',fxBy:'charge'},/* v4.62 G1-e1: 돌진 명중 = 기절 0.8초(100% · 같은 개체 6초 면역) · 고정 0.27~0.295초 무작위(lj) — 기절이 무리 돌진을 잇게 해 Lv9 피격률 0.46~0.60 → 기절 중 고정 보류(stunHold) 0.32~0.42 → lj 0.025로 0.21~0.34 *//* v4.56 G1-c2a: 로웬 바람 평원 Lv8~9 · 고정 0.35 → 0.27초(트인 평원이라 0.35면 자동 전투 피격률 0.02~0.16) · 기절(돌진 명중)은 G1-e */
  goat:{b:'charge'},/* v4.56 G1-c2a: 카르도 자갈 언덕 Lv17~18 */
  /* v4.57 G1-c2b: 돌진 날짐승 — 날짐승도 지형에 막힌다(모든 몬스터 stepMove · 막히면 빗나감 경직). 침공 '불새 새끼'(isBoss)는 원형 없음(G1-g) */
  crystalbat:{b:'charge'},/* 카르도 버섯 동굴숲 Lv20~21 */
  ashbat:{b:'charge',lock:.25},/* 고정 0.35 → 0.25초(0.35면 피격률 e1 0.19 · e3 0.13) · 에르나 잿가루 언덕 Lv29~30 · 용암 호수 Lv36~37 */
  phoenix:{b:'charge',lock:.25},/* 고정 0.35 → 0.25초(0.35면 피격률 0.14~0.15) · 에르나 불새 둥지 Lv37~38 */
  obsidiancrab:{b:'guard'},/* v4.58 G1-d1: 방어 태세 첫 종(로웬 잿빛 고원 Lv14~15 · 에르나 용암 호수 Lv35~36 · 상태이상 없음). 관문 정예 '흑요석 대게'(q30)는 제외(G1-g 보스 패턴) */
  /* v4.60 G1-d3a: 방어 태세 나머지 4종 — 카르도 갑충 협곡(k3) · 수정 호숫가(k4). 관문 정예 '등잔달팽이'(q19)는 mobB가 eliteOf에서 null(G1-f~g 보스 패턴) */
  stonebeetle:{b:'guard',first:2.5},/* 돌갑충 k3 Lv21~22 · 첫 웅크림 1.5 → 2.5초(1.5면 잘 대응 처치 시간 Lv22 1.12~1.13 — +10% 밖 · 처치 3~4초라 첫 태세가 무리 처치 한가운데 걸림) */
  rockcrab:{b:'guard'},/* 바위게 k3 Lv22~23 */
  snail:{b:'guard'},/* 등잔달팽이 k3 Lv23~24 (일반 개체만) */
  clam:{b:'guard'},/* 조개집게 k4 Lv24~25 */
  emberslime:{b:'burst',fx:'burn',fxBy:'burst',lj:.015,mul:.8,/* v4.63 잿빛 고원 폭발 ×1 → ×0.8: 화상을 붙이자 대응 없음 48판 Lv12 1.18(위 끝 밖) → 1.13 · Lv13 1.09 (물방울슬라임과 같은 값) *//* v4.63 잿빛 고원 개체도 lj 0.015(0.77~0.785초): 화상 뒤 난수 흐름이 바뀌어 burst459 Lv12 피격률 0.42 · 48판 0.27 · 0.29 *//* v4.63 G1-e2: 폭발 명중 25% = 화상 4초(두 사냥터 · zo가 합쳐 받음) */zo:{e2:{lock:.9,lj:.015,mul:.6}}},/* v4.63 e2 lj 0.015(고정 0.9~0.915초 무작위): 화상을 붙인 뒤 같은 씨앗 48판 자동 전투 피격률 Lv33 0.40(위 끝 — 난수 흐름이 바뀜) · lj 0.03은 0.22~0.23 · 0.015에서 0.28 · 0.28 */ /* v4.61 G1-d3b: 에르나 불티 숲(e2) 개체도 자폭 · zo = 사냥터별 덮어쓰기 — 고정 0.77 → 0.9초(0.77이면 자동 전투 피격률 0.62~0.68: 처치가 느려 부풀기 중 처치 0 · 매번 폭발) · 폭발 ×1 → ×0.6(e2는 폭발이 받는 피해의 절반 — ×1이면 대응 없음 1.16~1.46) */
  waterslime:{b:'burst',fx:'slow',fxBy:'burst',/* v4.63 G1-e2: 폭발 명중 = 둔화 3초 · Lv9~10은 물약 민감 구간이라 fxP 15% */dk:.4,mul:.8},/* v4.61 G1-d3b 로웬 안개 호숫가 Lv9~10(물약 민감 구간) · 껍질 ×0.5 → ×0.4(0.5면 부풀기 중 처치가 많아 자동 전투 피격률 Lv9 0.16) · 폭발 ×1 → ×0.8(대응 없음 Lv10 1.18 → 1.14) */
  puffer:{b:'burst',lj:.04},/* v4.61 G1-d3b 카르도 수정 호숫가 Lv25~26 · 고정 0.77~0.81초 무작위(lj) — 0.77이면 자동 전투 피격률 0.43~0.47, 0.80이면 0.15~0.16: 걸음 1/32초 경계라 그 사이 값이 없음 */
  /* v4.59 원래 줄: emberslime zn:['z5'] *//* v4.59 G1-d2: 자폭 첫 종 — 로웬 잿빛 고원(z5) Lv12~13만(zn). 에르나 불티 숲 Lv33~34 개체는 G1-d3에서(그 레벨대는 처치가 느려 부풀기 중 처치가 한 번도 안 되고 자동 전투 피격률 0.62~0.68) · 화상(폭발)은 G1-e · 물방울슬라임은 Lv9~10 물약 민감 구간이라 d3에서 */
  fairy:{b:'ranged',spd:205},/* v4.49 G1-b: 원거리 첫 종(로웬 도토리 숲 Lv5~6) · v4.53 속도 220 → 205(자동 전투가 공격 중인 요정을 쫓게 되어 evade451 묶음 0.39~0.41) */
  /* v4.52 G1-b2c: 원거리 나머지 5종 — 둔화 · 화상 투사체는 G1-e에서(지금은 피해만). spd = 그 종의 투사체 속도(없으면 RANGED.spd) — 사냥터 지형이 트여 자동 전투가 잘 피하는 종은 빠르게 해 피격률 20~40%에 맞춘다 */
  cavemush:{b:'ranged',spd:190},/* v4.53 G1-b2c2 카르도 버섯 동굴 Lv18~19 (관문 정예 '동굴버섯'(q16)은 제외) */
  mosswisp:{b:'ranged',spd:215,fx:'slow',fxBy:'shot'},/* v4.63 G1-e2: 투사체 명중 25% = 둔화 3초 *//* v4.53 카르도 Lv19~20 */
  mist:{b:'ranged',spd:225,fx:'slow',fxBy:'shot'},/* v4.62 G1-e1: 투사체 명중 25% = 둔화 3초 *//* v4.53: 250 → 225 (무리 체력 그대로 측정에서 250은 피격 0.49~0.54) *//* 카르도 수정 호숫가 Lv26~27 */
  flamewisp:{b:'ranged',fx:'burn',fxBy:'shot'},/* v4.63 G1-e2: 투사체 명중 25% = 화상 4초 *//* v4.53 에르나 Lv31~32 · 불새 둥지 Lv38~39 */
  embertree:{b:'ranged'},/* 에르나 불티 숲 Lv32~33 (관문 정예 '불티나무'(q27)는 제외) */
};
/* 상태이상 정의: dur=기본 지속(초) · 갱신만 하고 중첩 없음. 지속은 반드시 fxDur()를 거친다(§G2 저항 · §G3 장비 · §G12 정화가 붙을 자리). */
const FXDEF={
  poison:{name:'독',ic:'☠',col:'#8ae04a',dur:5,dps:.004,potK:.7,desc:'초당 최대 HP의 0.4% · HP 물약 회복 −30%'},
  /* v4.62 G1-e1: k = 초당 (건 몬스터 공격력 × k) 고정 피해(방어 무시) · mv/as = 이동 · 공격 속도 배율 · p = 부여 확률 덮어쓰기 · imm = 같은 개체 재부여 면역(초) */
  burn:{name:'화상',ic:'♨',col:'#ff9a3a',dur:4,k:.05,desc:'초당 건 몬스터 공격력의 5% 고정 피해(방어 무시)'},
  slow:{name:'둔화',ic:'≈',col:'#8fc8ff',dur:3,mv:.6,as:.8,desc:'이동 속도 −40% · 공격 속도 −20%'},
  stun:{name:'기절',ic:'✶',col:'#ffe27a',dur:.8,p:1,imm:6,desc:'0.8초 행동 불가(물약 자동 사용은 됨) · 같은 몬스터에게 6초 면역'},
};
/* 부여 확률: 일반 25% · 정예/보스 100% · 입문 · 물약 민감 구간(Lv1~6 · Lv9~11) 15% */
/* v4.49 원거리 원형(지시서 §G1 · G1-b): 거리 range 안이면 멈춰 aim초 조준(가는 예고선 · 플레이어를 따라감) → 조준 끝 시점의 플레이어 위치로 투사체.
   flee 안으로 오면 fleeK 속도로 물러남(집에서 leash까지만). 투사체 spd/초 · 반경 pr · 피해 ×mul · 주기 cd초 · 사거리 range×fly · 체력 ×hpK */
const RANGED={range:110,aim:1.2,flee:70,fleeK:.6,leash:150,spd:220,pr:8,mul:1.4,cd:2.6,fly:1.7,hpK:.8};
/* v4.51 G1-b2b 회피(evade): 자동 전투가 t초 동안 prog만큼도 못 다가가면 원거리 대상이 집으로 돌아가 체력 회복 · 자동 전투는 skip초 건너뜀 · 집 도착 뒤 lock초 선공 안 함 */
const EVADE={t:4,prog:12,skip:8,lock:3};
const FX_P={base:.25,early:.15,elite:1};
/* v4.54 돌진 원형(지시서 §G1 · G1-c): 거리 min~max에서 aim초 예고(일직선 띠 폭 w) — 앞 (aim−lock)초는 플레이어를 따라가고 마지막 lock초는 방향이 고정(띠가 밝아짐) →
   spd/초로 직선 돌진(고정 순간 거리 + over, 최대 dist) · 지나가며 한 번 맞히면 ×mul(방어 뒤) · 빗나가거나 벽에 막히면 stag초 경직(받는 피해 ×stagK) · 쿨 cd초.
   맞힌 뒤 rest초 숨 고르기(근접 공격 안 함) · 쿨이 찼는데 min보다 가까우면 back초까지 뒷걸음질쳐 거리를 벌린다(못 벌리면 근접으로 · 3초 뒤 다시). 그 밖에는 근접형 그대로 */
const CHARGE={min:60,max:140,aim:.8,lock:.35,w:22,spd:260,dist:170,over:30,mul:1.45,cd:8,stag:1.5,stagK:1.3,back:1.2,rest:1.6,leash:200};/* v4.57 leash: 돌진 끝은 집에서 200 안(추격 한계 210 — 넘으면 체력 가득으로 귀환) */
/* v4.58 방어 태세 원형(지시서 §G1 · G1-d): 싸움이 붙고 first초 뒤부터 cd초마다 dur초 웅크림(v4.58 측정: cd 6이면 평타만 처치 시간 Lv15 +41% — 위 끝 밖 → 6.5) — 그동안 평타 피해 ×baK(−70%) · 스킬 피해 ×skK(−30%) · 공격 · 이동 안 함 · 머리 위 방패.
   웅크리기 직전 pre초 예고(방패가 깜빡임) — 스킬을 아낄 틈. 그 밖에는 근접형 그대로. 피해가 아니라 처치 시간으로 잰다(평타만 +25~40% · 스킬을 태세 밖에 쓰면 +10% 이하) */
const GUARD={first:1.5,cd:6.5,dur:2.5,pre:.5,baK:.3,skK:.7};
/* v4.59 자폭 원형(지시서 §G1 · G1-d2): 체력 at 이하에서 inf초 부풀기(원형 예고 반경 r) — 앞 (inf−lock)초는 creep/초로 플레이어 쪽으로 기어가고(예고가 따라감) 마지막 lock초는 멈춰 고정 →
   r 안이면 ×mul(방어 뒤) 후 스스로 쓰러짐(경험치 · 드롭 정상). 부풀기 중 처치하면 폭발 없음. 종마다 MOB_B[종].inf · lock · r로 덮어쓴다(돌진 lock과 같은 방식) */
const BURST={at:.25,inf:1.5,lock:.77,r:46,mul:1,creep:34,dk:.5};/* v4.59 측정으로: lock .55 → .77(.70 이하는 자동 전투가 늘 맞고 .80 이상은 늘 피함 — 피격률 .37) · mul 1.8 → 1(서 있기 1.29 → 1.11~1.14) *//* dk = 부풀기 중 받는 피해 배율(단단해진 껍질) */
/* v4.64 G1-e3 타깃 창 표시(지시서 §G1 '타깃 창에 그 몬스터의 원형 · 상태이상 아이콘' + 몬스터 설명 한 줄).
   BDEF: 원형 → 이름 · 아이콘 · 색 · 동작(desc) · 대응법(how). 근접(melee)은 표시하지 않는다(지금까지와 같음 — 아이콘이 없으면 '평범한 근접형').
   st = 지금 이 개체가 하고 있는 일(웅크림 · 부풀기 · 휘청 · 조준 · 돌진 예고)을 칩 옆에 잠깐 밝혀 준다. 수치는 위 표(RANGED · CHARGE · GUARD · BURST)에서 읽어 문구와 코드가 어긋나지 않게 한다. */
const BDEF={
  ranged:{name:'원거리',ic:'➶',col:'#9fe0ff',desc:'멈춰 조준한 뒤 투사체 · 가까이 오면 물러남',how:'조준선이 보이면 옆으로 비켜서기 · 바짝 붙으면 쏘지 않는다'},
  charge:{name:'돌진',ic:'➤',col:'#ffb36a',desc:'띠 예고 뒤 일직선 돌진',how:'띠가 밝아지면 옆으로 · 빗나가면 '+CHARGE.stag+'초 휘청(받는 피해 +'+Math.round((CHARGE.stagK-1)*100)+'%)'},
  guard:{name:'방어 태세',ic:'⛨',col:'#c8d0ff',desc:GUARD.cd+'초마다 '+GUARD.dur+'초 웅크림 · 평타 −'+Math.round((1-GUARD.baK)*100)+'% · 스킬 −'+Math.round((1-GUARD.skK)*100)+'%',how:'방패가 깜빡이면 다른 대상을 치거나 큰 스킬을 아끼기'},
  burst:{name:'자폭',ic:'✸',col:'#ff8a6a',desc:'체력 '+Math.round(BURST.at*100)+'% 이하에서 부풀어 폭발',how:'부풀면 원 밖으로 · 부풀기 중 처치하면 폭발 없음'},
};
/* 상태이상을 거는 공격 이름(MOB_B.fxBy) — 없으면 '공격' */
const FXBY={melee:'근접',charge:'돌진 명중',shot:'투사체 명중',burst:'폭발 명중'};
/* v4.68 G1-f 보스 패턴(지시서 §G1 '보스 패턴' · 로웬 3보스 먼저). 관문 정예와 같은 퀘스트의 지역 보스판(eliteOf가 같은 q)에 함께 붙는다.
   패턴 칸은 기존 보스 장판과 같은 박자(cd 7초 — 처음은 aoeT 5초) · 한 보스가 동시에 예고하는 것은 1개 · 패턴 사이 최소 gap 2.5초(cd − 가장 긴 패턴 2초 ≥ 2.5).
   피해 배율은 기존 장판(①)처럼 방어 앞에 곱한다(calcDmg(공격,mul,방어)) — ①이 지금과 같은 값이 되게.
   aoe ① 원형 장판(지금 것과 같은 r58 · 1.4초 · ×2.2 — 단 새 예고 풀로 그려 자동 전투는 0.3초 늦게 반응)
   fan ② 부채꼴 휩쓸기: 보스 앞(플레이어 쪽) 120° · r80 · 예고 1.0초 · ×1.8 · 그동안 보스는 멈춤
   dash ③ 돌진: 예고 1.0초(앞 0.5초는 플레이어를 따라감 · 마지막 lock 0.5초 고정) · 폭 30 · 최대 220(고정 순간 거리 +30) · ×2.0 · spd/초 · 끝은 집에서 leash 안
   tri ④ 3연속 장판: 0.5초 간격으로 그 순간 플레이어 자리에 r40 · 각 1.0초 · ×1.4
   rage ⑥ 광폭: 체력 30% 이하 → 근접 공격 주기 2.2 → 1.6초 · 이름 붉게 */
const BPAT={cd:7,gap:2.5,
  aoe:{name:'장판',r:58,dur:1.4,mul:2.2},
  fan:{name:'휩쓸기',r:80,half:Math.PI/3,dur:1,mul:1.8},
  dash:{name:'돌진',dur:1,lock:.5,w:30,dist:220,over:30,mul:2,spd:300,leash:220},
  tri:{name:'3연속 장판',n:3,gap:.5,r:40,dur:1,mul:1.4},
  rage:{name:'광폭',at:.3,cd:1.6},
  /* v4.69 G1-g1 카르도 3보스 */
  volley:{name:'3갈래 투사체',n:3,gap:40,aim:1.1,lock:.5,w:14,pr:7,spd:210,dist:230,mul:1.6},/* 나란한 3줄 예고(옆으로 gap 40 · 앞 0.6초 따라감 · 마지막 0.5초 고정) → 세 줄을 따라 투사체(한 번에 한 발만 맞음) · 각 ×mul(방어 앞) · 그동안 보스는 멈춤 */
  summon:{name:'졸개 소환',at:.5,n:3,r:46,hpK:.5,atkK:.5},/* 체력 50%에 한 번 · 그 사냥터 일반 몬스터 3마리(체력 · 공격 ×0.5 — 약한 졸개)(보스가 집에 돌아가거나 쓰러지면 사라짐) */
  guard:{name:'방어 태세',pre:.5,dur:2.5},
  /* v4.70 G1-g2 에르나 3보스 */
  ember:{name:'불씨 장판',r:58,dur:1.4,mul:2.2},/* ① 장판과 같은 예고 · 배율(r58 · 1.4초 · ×2.2) → 터진 자리에 남는 불(fire) */
  fire:{name:'남는 불',r:52,life:4,iv:1,mul:.3}};/* 남는 불 장판: 4초 · 안에 있으면 1초마다 ×0.3(방어 앞) · 자동 전투도 위험 지역으로 보고 걸어 나온다 *//* 0.5초 방패 깜빡임 → 2.5초 웅크림(평타 −70% · 스킬 −30% — 일반 방어 태세 GUARD와 같은 배율) · 그동안 공격 · 이동 안 함 */
/* 퀘스트 id → 패턴 순서(번갈아) · fx = 그 패턴이 맞히면 거는 상태이상(보스 100%) · rage = 광폭 있음 */
const BOSS_PAT={
  q6:{p:['aoe','dash']},/* 숲의 주인 · 왕멧돼지 Lv8 (fb1 지역 보스판 포함) */
  q10:{p:['aoe','fan'],fx:{fan:'poison'}},/* 호수의 주인 · 큰물뱀 Lv13 (fb2) — 휩쓸기 명중 = 독 */
  q12:{p:['aoe','tri'],rage:true,fx:{tri:'burn'}},/* 마그마골렘 군주 Lv16 — 3연속 장판 명중 = 화상 · 광폭 */
  q16:{p:['volley'],sum:'cavemush',fx:{volley:'slow'}},/* v4.69 동굴의 파수꾼 · 거대 동굴버섯 Lv21 (fb4) — 3갈래 투사체(명중 = 둔화) + 50% 졸개 소환(동굴버섯 3) */
  q19:{p:['guard','tri'],fx:{tri:'burn'}},/* v4.69 협곡의 여왕 · 등잔달팽이 Lv25 (fb5) — 방어 태세 + 3연속 장판(명중 = 화상) */
  q21:{p:['aoe','fan'],rage:true,fx:{fan:'stun'}},/* v4.69 광석골렘 왕 Lv28 (fb6) — 장판 + 휩쓸기(명중 = 기절) + 광폭 */
  q27:{p:['volley','ember'],fx:{ember:'burn',fire:'burn'}},/* v4.70 불티 숲의 주인 · 거목 불티나무 Lv34 (fb7) — 3갈래 투사체 + 불씨 장판(남는 불 4초 · 명중 = 화상) */
  q30:{p:['guard','dash']},/* v4.70 용암 호수의 군주 · 흑요석 대게 Lv37 (fb8) — 방어 태세 + 돌진 */
  q32:{p:['dash','tri'],rage:true,rageCd:1.9,mul:{dash:1.5,tri:1.15},fx:{tri:'burn'},nm:{dash:'급강하'}},/* v4.83 급강하 배율 2 → 1.5 · 3연속 장판 1.4 → 1.15 · 광폭 공격 주기 1.6 → 1.9초(홍염만 · 보스별 mul 덮어쓰기): 초당 받은 피해가 옛 장판 대비 1.35~1.36(기준 0.75~1.30)이라 낮춤 *//* v4.70 불새 여왕 홍염 Lv40 — 급강하(돌진) + 3연속 장판(명중 = 화상) + 광폭 */
};
/* v4.71 G1-g3 침공 보스 · 균열의 주인(지시서 §G1 '그 종의 원형 + ①') — 퀘스트 id가 없으므로 따로 한 줄. gen = 그 종의 원형(MOB_B)이 함께 돈다:
   ① 장판은 원형의 특수 공격(조준 · 돌진 · 웅크림 · 부풀기 · 휘청)과 겹치지 않는다 — 특수 공격 중이거나 끝난 지 2.5초 안이면 장판을 미루고, 장판 중 · 끝난 뒤 2.5초는 원형 대신 근접만 한다(동시 예고 1개 · 패턴 사이 2.5초) */
const BOSS_GEN={p:['aoe'],gen:true,bk:2,chgK:.85};/* v4.83 chgK = 침공 보스의 돌진 피해 배율(불새 · 초당 받은 피해 옛 대비 1.33 → 기준 0.75~1.30 안으로) *//* bk = 돌진 원형의 뒷걸음질 속도 배율(54 × 2) */


/* ================= 퀘스트 =================
   메인은 순서대로. 관문(gate) 메인은 수락하면 서브 퀘스트 2개가 열리고,
   서브를 모두 끝내고 스킬·전투력 조건을 채워야 관문 정예가 나타나 클리어할 수 있다. */
const QUESTS=[
  {id:'q1',giver:'orvin',title:'원정대의 첫걸음',type:'talk',npc:'hans',
    offer:'오, 자네가 새 원정대원이군.\n북문의 경비병 한스에게 가 보게. 바깥 사정은 그가 제일 잘 알지.',done:'장로님이 보내셨다고? 마침 일손이 필요했어.\n환영하네, 원정대원!',rw:{xp:30,gold:40}},
  {id:'q2',giver:'hans',title:'들판의 말썽꾼',type:'kill',sp:'squirrel',n:6,zone:'z1',
    offer:'동쪽 솜꼬리 들판에 다람쥐가 너무 불어나 밭을 다 갉아 먹고 있네.\n여섯 마리만 쫓아내 주게.',done:'벌써? 손이 빠르군. 이건 수고비일세.\n레벨이 오르면 능력치와 스킬을 꼭 챙기게. (C · K)',rw:{xp:60,gold:60}},
  {id:'q3',giver:'hans',title:'이슬방울 모으기',type:'collect',sp:'leafdrop',item:'이슬방울',rate:.7,n:5,zone:'z1',
    offer:'풀잎방울을 잡으면 맑은 이슬방울이 나온다네.\n다섯 개만 모아 주게.',done:'맑은 이슬이군. 수고비를 챙겨 주지.\n바깥에선 아무도 물약을 주지 않네. 미라네 가게에서 넉넉히 사 두게.',rw:{xp:80,gold:70}},
  {id:'q4',giver:'mira',title:'참새 소동',type:'kill',sp:'sparrow',n:8,zone:'z1',
    offer:'깃털참새들이 내 가판대 과일을 쪼아 먹어!\n여덟 마리만 혼내 줘.',done:'고마워! 물약은 언제든 우리 가게에서!',rw:{xp:110,gold:90,stone:2}},
  {id:'q5',giver:'orvin',title:'도토리 숲의 소란',type:'kill',sp:'acornboar',n:8,zone:'z2',
    offer:'서쪽 도토리 숲의 멧돼지들이 사나워졌다는 소식이네.\n먼저 수를 줄여 주게.',done:'숲이 조금은 잠잠해졌군. 수고했네.\n신들이 자네를 지켜보고 있네. 시련을 이겨 내면 권능을 내려 줄 걸세.',rw:{xp:220,gold:150,stone:3}},
  {id:'q6',giver:'orvin',title:'숲의 주인',type:'elite',zone:'z2',subs:['sb1','sb2'],gate:{skills:{dash:1},cp:950},
    elite:{sp:'acornboar',lv:8,name:'숲의 주인 · 왕멧돼지',hpMul:3,sc:1.8,fa:0},
    offer:'숲을 뒤흔드는 건 거대한 왕멧돼지일세. 지금 자네로는 어림없어.\n브람과 넬을 도와 힘을 길러 오게. 돌진 기술 없이는 녀석의 돌격을 받아낼 수 없을 걸세.',done:'왕멧돼지를 쓰러뜨렸다니! 자네, 몰라보게 강해졌군.',rw:{xp:500,gold:300,shard:10}},
  {id:'q7',giver:'orvin',title:'바람 평원으로',type:'kill',subs:['ex1','gc1'],sp:'windfox',n:10,zone:'z3',
    offer:'북문 너머 바람 평원에서 바람여우 떼가 길을 막고 있네.\n열 마리를 물리치게. 녀석들은 먼저 덤벼드니 조심하게.',done:'평원 길이 열렸군.',rw:{xp:420,gold:260,shard:10}},
  {id:'q8',giver:'hans',title:'성난 초원황소',type:'kill',subs:['ex2','gc2'],sp:'bull',n:8,zone:'z3',
    offer:'초원황소들이 사람만 보면 들이받는다네.\n여덟 마리를 진정시켜 주게.',done:'황소들을 진정시켰다니, 대단하군!',rw:{xp:520,gold:320,stone:4}},
  {id:'q9',giver:'orvin',title:'안개 호숫가의 이변',type:'kill',subs:['ex3'],sp:'waterslime',n:10,zone:'z4',
    offer:'북동쪽 호숫가에 물방울슬라임이 끓어오르고 있네.\n열 마리를 잠재워 주게.',done:'슬라임은 줄었지만, 호수 깊은 곳에 무언가 있네.',rw:{xp:800,gold:480,shard:10}},
  {id:'fb1',giver:'orvin',title:'지역 보스 토벌',type:'fboss',boss:'q6',zone:'z2',n:1,
    offer:'숲의 주인이 다시 깨어났다네. 왕멧돼지는 쓰러져도 숲의 기운을 먹고 더 사납게 일어나지.\n호수로 가기 전에 녀석을 한 번 더 잠재워 주게. 녀석이 지닌 장비는 신앙을 키우는 데 쓸모가 있을 걸세.',done:'역시 자네로군. 이제 호수 쪽을 살필 수 있겠어.',rw:{xp: 700, gold: 420, stone: 4, shard: 10}},
  {id:'q10',giver:'orvin',title:'호수의 주인',type:'elite',zone:'z4',subs:['sb3','sb4','rp2','ex5'],gate:{skills:{roar:1,star:2},cp:1750},
    elite:{sp:'lakesnake',lv:13,name:'호수의 주인 · 큰물뱀',hpMul:3,sc:1.8,fa:4},
    offer:'호수 깊은 곳의 큰물뱀이 뒤틀림의 원인일세.\n넬과 미라를 도와 준비하게. 전투 함성을 배우고 별똥별을 더 익혀야 할 걸세.',done:'호수의 기운이 맑아졌네.\n하지만 뒤틀림은 북서쪽 고원에서 흘러오고 있어.',rw:{xp:1200,gold:600,shard:15}},
  /* v4.46 시간의 균열 개방 스토리(G17 · 현 요청): 호수의 주인이 쓰러진 자리에서 안개가 갈라진다 → 조각을 모아 길잡이 표석에 문을 낸다 → 균열 개방.
     기존 유형(talk · collect)만 쓴다. story가 붙은 퀘스트는 메인 보상 덧셈(순번 짝수 도면 · 광물)에서 빠져 기존 퀘스트의 보상이 한 칸도 밀리지 않는다 */
  {id:'rq1',story:'rift',giver:'orvin',title:'갈라진 안개',type:'talk',npc:'hans',
    offer:'큰물뱀이 쓰러지던 순간, 호수 위 안개가 칼로 벤 듯 갈라졌다고 하네.\n북문의 한스가 그 광경을 봤다니 이야기를 들어 보게.',done:'봤고말고. 갈라진 틈으로 다른 하늘이 보였어.\n틈에서 반짝이는 조각이 쏟아졌는데, 호숫가 슬라임들이 그걸 삼키더군.',rw:{xp:100,gold:150}},
  {id:'rq2',story:'rift',giver:'hans',title:'시간의 조각',type:'collect',sp:'waterslime',item:'시간의 조각',rate:.5,n:6,zone:'z4',
    offer:'그 조각을 모아 장로님께 가져가면 뭔가 알아내실 거야.\n안개 호숫가의 물방울슬라임에게서 여섯 개만 되찾아 와.',done:'차갑지도 뜨겁지도 않은데, 쥐고 있으면 시계 소리가 나는군.\n장로님께 가져가 봐.',rw:{xp:400,gold:300,stone:4}},
  {id:'rq3',story:'rift',giver:'orvin',title:'균열의 문',type:'talk',npc:'bram',
    offer:'시간의 조각이라… 옛 기록에 있네. 뒤틀림이 시간에 낸 상처, 「시간의 균열」일세.\n조각을 길잡이 표석에 박으면 그 안으로 드나드는 문이 된다네. 브람에게 맡기게.',done:'표석에 박아 넣었다. …문이 열렸군. 표석에 손을 대면 균열로 들어갈 수 있을 거다.\n안의 시간은 한 시간뿐이야. 밖에서 쉬면 다시 차오르니 아껴 써.',rw:{xp:100,shard:5}},
  {id:'q11',giver:'orvin',title:'잿빛 고원',type:'kill',subs:['ex4','gc3','gc4','gr1'],sp:'emberslime',n:12,zone:'z5',
    offer:'뒤틀림의 근원은 잿빛 고원일세.\n불씨슬라임 열두 마리를 처치하고 길을 트게.',done:'고원 깊은 곳에서 거대한 열기가 느껴지네…\n마그마골렘 군주가 깨어난 게야.',rw:{xp:1500,gold:800,shard:15}},
  {id:'fb2',giver:'hans',title:'지역 보스 토벌',type:'fboss',boss:'q10',zone:'z4',n:1,
    offer:'호수의 주인이 다시 물 위로 올라왔어. 고원으로 가는 길목이 또 막혔네.\n군주와 맞서려면 신앙이 더 필요해. 큰물뱀을 잡아 그 비늘 장비부터 챙겨 오게.',done:'좋아, 이제 고원으로 갈 채비가 됐군.',rw:{xp: 1300, gold: 700, stone: 5, shard: 10}},
  {id:'q12',giver:'orvin',title:'마그마골렘 군주',type:'elite',zone:'z5',subs:['sb5','sb6','gc5','gc6','rp3','fk1'],gate:{skills:{star:3},cp:2250},
    elite:{sp:'magmagolem',lv:16,name:'마그마골렘 군주',hpMul:6,sc:2.3,fa:30,x:400,y:335},
    offer:'고원 북쪽 끝의 마그마골렘 군주를 쓰러뜨리면 로웬의 이변이 멎을 걸세.\n브람과 한스가 채비를 도울 걸세. 붉은 장판이 보이면 반드시 피하게!',done:'해냈군! 로웬의 원정대원이여, 자네 이름은 오래도록 기억될 걸세.',rw:{xp:3000,gold:2000,shard:40,stone:10}},
  {id:'fb3',giver:'orvin',title:'지역 보스 토벌',type:'fboss',boss:'q12',zone:'z5',n:1,
    offer:'잿빛 고원의 마그마골렘 군주가 다시 끓어오른다는 전갈일세. 카르도로 떠나기 전에 로웬의 뒤를 정리해 두게.\n군주의 갑주는 협곡 너머에서도 자네를 지켜 줄 걸세.',done:'이제 로웬은 안심이군. 마음 놓고 협곡을 넘게.',rw:{xp: 1900, gold: 900, stone: 6, shard: 15}},
  {id:'q13',giver:'orvin',title:'협곡 너머 카르도',type:'talk',npc:'karl',
    offer:'남쪽 협곡 너머 카르도에서도 이변이 일어난다는 전갈이 왔네.\n마을의 길잡이 표석으로 카르도에 가서 촌장 카를을 만나게.',done:'로웬의 영웅이 와 주다니! 카르도는 자네를 환영하네.',rw:{xp:600,gold:300},unlock:'kardo'},
  {id:'q14',giver:'karl',title:'자갈 언덕 정리',type:'kill',subs:['ex6'],sp:'goat',n:10,zone:'k1',
    offer:'동쪽 자갈 언덕의 절벽산양들이 광부들을 들이받는다네.\n열 마리를 쫓아 주게.',done:'광부들이 한시름 놓겠군.',rw:{xp:1400,gold:600,stone:4}},
  {id:'q15',giver:'rian',title:'모래도마뱀 소탕',type:'kill',subs:['ex7'],sp:'sandlizard',n:10,zone:'k1',
    offer:'모래도마뱀이 마을 창고를 노리고 있어.\n열 마리를 처리해 줘.',done:'창고가 무사하군. 고맙네.',rw:{xp:1700,gold:700}},
  {id:'q16',giver:'karl',title:'동굴의 파수꾼',type:'elite',zone:'k2',subs:['sk1','sk2','gc7','gc8','rp4','ht2'],gate:{skills:{quake:1,roar:2},cp:2950},
    elite:{sp:'cavemush',lv:21,name:'동굴의 파수꾼 · 거대 동굴버섯',hpMul:3,sc:2,fa:40},
    offer:'남쪽 동굴숲 입구를 거대 동굴버섯이 막고 있네.\n도르와 세나를 도와 준비하게. 대지 가르기 정도는 익혀야 포자를 뚫을 수 있을 게야.',done:'파수꾼이 쓰러졌군! 동굴숲 길이 열렸네.',rw:{xp:3500,gold:1200,shard:15}},
  {id:'q17',giver:'karl',title:'갑충 협곡의 소음',type:'kill',subs:['ex8'],sp:'stonebeetle',n:12,zone:'k3',
    offer:'동남쪽 협곡에서 돌갑충들이 밤낮없이 바위를 갉는다네.\n열두 마리를 처리해 주게.',done:'협곡이 조용해졌군.',rw:{xp:3200,gold:1000,stone:5}},
  {id:'q18',giver:'rian',title:'바위게 떼',type:'kill',subs:['ex9'],sp:'rockcrab',n:10,zone:'k3',
    offer:'바위게들이 협곡 길을 막았어. 먼저 덤벼드니 조심해.',done:'길이 뚫렸군!',rw:{xp:3600,gold:1100}},
  {id:'fb4',giver:'rian',title:'지역 보스 토벌',type:'fboss',boss:'q16',zone:'k2',n:1,
    offer:'동굴의 파수꾼이 다시 포자를 뿜고 있어. 협곡의 여왕에게 가기 전에 녀석부터 정리해 줘.\n파수꾼이 떨군 장비로 신앙을 다져 두면 여왕의 열기도 견딜 거야.',done:'좋아, 협곡으로 내려가자.',rw:{xp: 3200, gold: 1100, stone: 6, shard: 15}},
  {id:'q19',giver:'rian',title:'협곡의 여왕',type:'elite',zone:'k3',subs:['sk3','sk4','gc9','gc10','rp5','fk2'],gate:{skills:{quake:2,dash:3},cp:3500},
    elite:{sp:'snail',lv:25,name:'협곡의 여왕 · 등잔달팽이',hpMul:3,sc:2,fa:54},
    offer:'협곡 바닥의 거대 등잔달팽이가 협곡을 달구고 있어.\n모라와 도르가 채비를 도울 거야. 대지 가르기와 돌진을 더 단련해 와.',done:'여왕이 쓰러지니 협곡 바람이 식는군!',rw:{xp:6000,gold:1800,shard:20}},
  {id:'q20',giver:'karl',title:'수정 호숫가',type:'kill',subs:['ex10'],sp:'puffer',n:10,zone:'k4',
    offer:'북쪽 수정 호숫가의 거품복어가 독을 뿜는다네.\n열 마리를 처리해 주게.',done:'호숫가 공기가 맑아졌네. 하지만 수정이 떨고 있어…',rw:{xp:5500,gold:1500,shard:10}},
  {id:'fb5',giver:'karl',title:'지역 보스 토벌',type:'fboss',boss:'q19',zone:'k3',n:1,
    offer:'협곡의 여왕이 다시 등잔불을 켰네. 광석골렘 왕은 그보다 훨씬 강하다네.\n여왕을 한 번 더 쓰러뜨려 협곡을 식히고, 그 장비로 채비를 단단히 하게.',done:'협곡이 식었군. 이제 왕과 맞설 때일세.',rw:{xp: 4800, gold: 1500, stone: 8, shard: 15}},
  {id:'q21',giver:'karl',title:'광석골렘 왕',type:'elite',zone:'k4',subs:['sk5','sk6','gc11','gc12','rp6','lv1'],gate:{skills:{quake:3},cp:3900},
    elite:{sp:'oregolem',lv:28,name:'광석골렘 왕',hpMul:6,sc:2.3,fa:62,x:1500,y:330},
    offer:'호숫가 북동쪽 끝에서 광석골렘 왕이 깨어났네. 카르도 이변의 근원일세.\n세나와 리안이 채비를 도울 걸세.',done:'카르도가 자네에게 큰 빚을 졌네.\n로웬의 오르빈 장로께 이 소식을 전해 주게.',rw:{xp:9000,gold:4000,shard:50,stone:12}},
  {id:'fb6',giver:'karl',title:'지역 보스 토벌',type:'fboss',boss:'q21',zone:'k4',n:1,
    offer:'수정 호숫가의 광석골렘 왕이 다시 일어났다네. 카르도를 떠나기 전에 한 번 더 잠재워 주게.\n왕의 갑주는 불의 땅에서도 쓸모가 있을 걸세.',done:'카르도 사람들이 두 다리 뻗고 자겠군. 고맙네.',rw:{xp: 5200, gold: 1800, stone: 8, shard: 15}},
  {id:'q22',giver:'karl',title:'승전보',type:'talk',npc:'rian',
    offer:'카르도의 이변을 모두 잠재웠군. 경비대장 리안에게 알려 주게 — 로웬의 오르빈 장로께 승전보를 띄울 걸세.',done:'두 지역의 이변을 모두 잠재웠다고? 전령을 바로 로웬으로 보내지. 자네야말로 진정한 원정대원이야.',rw:{xp:3000,gold:2000,shard:20}},
  {id:'q23',giver:'rian',title:'불의 땅 에르나',type:'talk',npc:'aila',
    offer:'전령이 돌아오는 길에 소식을 들었어. 카르도 너머 화산 지대 에르나에서 땅이 끓어오른다더군.\n길잡이 표석으로 에르나에 가서 촌장 아일라를 만나 줘.',done:'두 지역의 영웅이로군! 에르나는 지금 자네 같은 사람이 절실하다네.',rw:{xp:3000,gold:1000},unlock:'erna'},
  {id:'q24',giver:'aila',title:'잿가루 언덕의 화산양',type:'kill',subs:['ex11'],sp:'volsheep',n:12,zone:'e1',
    offer:'서쪽 잿가루 언덕의 화산양들이 불붙은 털로 들판을 태우고 있네.\n열두 마리를 진정시켜 주게.',done:'들불이 잦아들었군. 고맙네.',rw:{xp:4200,gold:1600,stone:5}},
  {id:'q25',giver:'taon',title:'유황 결정',type:'collect',sp:'sulfurbeetle',item:'유황 결정',rate:.6,n:8,zone:'e1',
    offer:'유황딱정벌레 등에 붙은 결정으로 마을 방벽을 굳힌다.\n여덟 개를 모아 와.',done:'이 정도면 방벽이 버티겠군.',rw:{xp:4800,gold:1700}},
  {id:'q26',giver:'aila',title:'불티 숲의 정령',type:'kill',subs:['ex12'],sp:'flamewisp',n:12,zone:'e2',
    offer:'더 서쪽 불티 숲에서 불꽃정령들이 날뛰고 있네.\n열둘을 잠재워 주게.',done:'숲의 불길이 약해졌네. 그런데 숲 깊은 곳에서 나무가 울고 있어…',rw:{xp:5700,gold:1900,shard:10}},
  {id:'q27',giver:'aila',title:'불티 숲의 주인',type:'elite',zone:'e2',subs:['se1','se2','gc13','gc14','rp7','ex15'],gate:{skills:{quake:4,star:5},cp:4850},
    elite:{sp:'embertree',lv:34,name:'불티 숲의 주인 · 거목 불티나무',hpMul:3.2,sc:2.2,fa:78},
    offer:'숲 한가운데 거목 불티나무가 불씨를 뿌리고 있네.\n고로와 하나를 도와 채비를 갖추게. 불씨는 대지 가르기로 끊어 내야 할 걸세.',done:'거목이 쓰러지니 숲이 숨을 쉬는군!',rw:{xp:9000,gold:3000,shard:20}},
  {id:'q28',giver:'taon',title:'용암도마뱀 토벌',type:'kill',subs:['ex13'],sp:'lavalizard',n:12,zone:'e3',
    offer:'북쪽 용암 호수의 용암도마뱀들이 길을 막았다. 먼저 덤벼드니 조심해.\n열두 마리를 처리해.',done:'길이 열렸군. 호수의 열기가 심상치 않아.',rw:{xp:7200,gold:2200}},
  {id:'q29',giver:'aila',title:'흑요석 핵',type:'collect',sp:'obsidiancrab',item:'흑요석 핵',rate:.6,n:6,zone:'e3',
    offer:'흑요석게 몸속의 핵이 화산의 맥을 읽는 열쇠라네.\n여섯 개를 모아 주게.',done:'핵이 떨고 있군… 호수 바닥에 무언가 있네.',rw:{xp:7800,gold:2300,stone:6}},
  {id:'fb7',giver:'taon',title:'지역 보스 토벌',type:'fboss',boss:'q27',zone:'e2',n:1,
    offer:'불티 숲의 주인이 다시 불씨를 뿌린다. 호수의 군주에게 가기 전에 숲부터 꺼.\n거목의 껍질 장비가 군주의 용암을 막아 줄 거다.',done:'숲이 다시 잠잠하군. 호수로 가자.',rw:{xp: 7000, gold: 2200, stone: 8, shard: 20}},
  {id:'q30',giver:'taon',title:'용암 호수의 군주',type:'elite',zone:'e3',subs:['se3','se4','gc15','gc16','rp8','fk3'],gate:{skills:{quake:5,roar:5},cp:5300},
    elite:{sp:'obsidiancrab',lv:37,name:'용암 호수의 군주 · 흑요석 대게',hpMul:3.5,sc:2.2,fa:98,x:1500,y:840},
    offer:'호수 한가운데의 흑요석 대게가 용암을 휘젓고 있다.\n루미와 고로가 채비를 도울 거다. 장비부터 단단히 해.',done:'군주가 가라앉았다! 이제 남은 건 둥지뿐이군.',rw:{xp:12600,gold:3500,shard:25}},
  {id:'q31',giver:'aila',title:'불새 둥지',type:'kill',subs:['ex14'],sp:'phoenix',n:10,zone:'e4',
    offer:'북서쪽 화산 위 불새 둥지에서 새끼들이 쏟아져 나오고 있네.\n열 마리를 쫓아 주게.',done:'둥지 꼭대기에서 거대한 날갯짓이 들리네… 여왕이 깨어났어.',rw:{xp:10800,gold:2800,shard:10}},
  {id:'fb8',giver:'aila',title:'지역 보스 토벌',type:'fboss',boss:'q30',zone:'e3',n:1,
    offer:'용암 호수의 군주가 다시 떠올랐네. 홍염에게 가기 전 마지막 채비일세.\n군주를 쓰러뜨리고 그 장비로 신앙을 끝까지 끌어올리게. 홍염의 불길은 신앙 없이는 견딜 수 없네.',done:'이제 남은 건 화산 꼭대기뿐일세.',rw:{xp: 9500, gold: 2600, stone: 10, shard: 20}},
  {id:'q32',giver:'aila',title:'불새 여왕 홍염',type:'elite',zone:'e4',subs:['se5','se6','gc17','gc18','rp9','lv2'],gate:{skills:{quake:5,dash:5,star:5},cp:5600},
    elite:{sp:'g_volcano',lv:40,name:'불새 여왕 홍염',hpMul:6,sc:1.5,fa:118,x:620,y:330},
    offer:'화산 꼭대기의 불새 여왕 홍염이 에르나 이변의 근원일세.\n타온과 루미가 마지막 채비를 도울 걸세. 붉은 장판을 조심하게!',done:'여왕이 잠들었네… 에르나의 하늘이 맑아지는군!\n로웬의 오르빈 장로께 이 소식을 전해 주게.',rw:{xp:18000,gold:8000,shard:60,stone:15}},
  {id:'q33',giver:'aila',title:'세 지역의 영웅',type:'talk',npc:'orvin',
    offer:'오르빈 장로께 에르나의 소식을 전해 주게.\n자네 이야기는 불의 땅에서도 오래 전해질 걸세.',done:'로웬, 카르도, 에르나… 세 지역의 이변을 모두 잠재웠군!\n자네야말로 진정한 원정대의 영웅일세.',rw:{xp:3000,gold:3000,shard:30}},
];
/* 서브 퀘스트: 관문 메인을 수락하면 열린다. 보상은 스킬서·보너스 능력치·스킬 포인트·장비 강화 */
const SUBQ={
  se1:{giver:'goro',title:'불티 숯',type:'collect',sp:'embertree',item:'불티 숯',rate:.6,n:6,zone:'e2',
    offer:'불티나무 숯으로 달구면 쇠가 한층 단단해지지.\n여섯 덩이를 가져오게.',done:'좋은 숯이군. 무기를 한 단계 두드려 놨네.',rw:{xp:2100,wup:1,stone:5}},
  se2:{giver:'hana',title:'온천 약초',type:'kill',sp:'flamewisp',n:8,zone:'e2',
    offer:'불꽃정령들이 온천 약초밭을 태워요.\n여덟만 쫓아 주세요.',done:'온천 약초탕이에요. 몸이 한결 단단해질 거예요.',rw:{xp:2100,stat:3,shard:10}},
  se3:{giver:'rumi',title:'용암 비늘',type:'collect',sp:'lavalizard',item:'용암 비늘',rate:.6,n:6,zone:'e3',
    offer:'용암도마뱀 비늘로 열기를 견디는 영약을 만들 수 있어요.\n여섯 장만 부탁해요!',done:'영약 완성! 한 병 드세요.',rw:{xp:3000,stat:3}},
  se4:{giver:'goro',title:'흑요석 판',type:'collect',sp:'obsidiancrab',item:'흑요석 판',rate:.6,n:6,zone:'e3',
    offer:'군주의 집게를 버티려면 갑옷에 흑요석 판을 덧대야 하네.\n여섯 장을 가져오게.',done:'흑요석 갑옷일세. 한 단계 단단해졌어.',rw:{xp:3000,aup:1,stat:3}},
  se5:{giver:'taon',title:'둥지 정찰',type:'kill',sp:'phoenix',n:8,zone:'e4',
    offer:'여왕에게 가는 길목의 불새 새끼부터 줄여야 한다.\n여덟 마리.',done:'길목이 비었다. 이건 경비대의 훈련 비법이다.',rw:{xp:4200,stat:3,shard:10}},
  se6:{giver:'rumi',title:'마그마 심장',type:'collect',sp:'magmagolem',item:'마그마 심장',rate:.5,n:5,zone:'e4',
    offer:'마그마골렘 심장으로 무기에 불의 숨결을 불어넣을 수 있어요.\n다섯 개만요!',done:'불의 숨결이 깃든 무기예요. 여왕도 벨 수 있을 거예요.',rw:{xp:4200,wup:1,stat:3}},
  sb1:{giver:'bram',title:'대장장이의 시험',type:'collect',sp:'honeybug',item:'밀랍',rate:.6,n:6,zone:'z2',
    offer:'왕멧돼지 돌격을 받아내려면 돌진으로 먼저 파고들어야 해.\n꿀벌레 밀랍 여섯 덩이를 가져오면 「돌진 찌르기」 비법서를 주지.',done:'좋아, 약속한 비법서다. 스킬 창(K)에서 배워 두게.',rw:{xp:150,book:'dash',stone:3}},
  sb2:{giver:'nell',title:'약초 바구니',type:'kill',sp:'fairy',n:6,zone:'z2',
    offer:'들꽃요정들이 약초밭을 망쳐요.\n여섯만 쫓아 주시면 기운이 나는 약초죽을 끓여 드릴게요.',done:'약초죽 드세요! 몸이 한결 단단해질 거예요.',rw:{xp:150,stat:3}},
  sb3:{giver:'nell',title:'수달 털 이불',type:'collect',sp:'otter',item:'수달 털',rate:.6,n:8,zone:'z4',
    offer:'호숫가 개울수달 털 여덟 뭉치면 따뜻한 이불을 지을 수 있어요.\n이불 값으로 오래된 「전투 함성」 비법서를 드릴게요.',done:'보드라운 털이네요! 약속한 비법서예요.',rw:{xp:400,book:'roar'}},
  sb4:{giver:'mira',title:'맑은 물방울',type:'collect',sp:'waterslime',item:'맑은 물방울',rate:.65,n:6,zone:'z4',
    offer:'물방울슬라임의 맑은 물방울로 특제 물약을 만들 거야.\n여섯 개만 부탁해!',done:'특제 물약 완성! 한 병은 너 먹어. 몸이 가벼워질 거야.',rw:{xp:400,stat:3,kp:1}},
  sb5:{giver:'bram',title:'흑요석 갑옷',type:'collect',sp:'obsidiancrab',item:'흑요석 조각',rate:.6,n:6,zone:'z5',
    offer:'군주의 화염을 버티려면 갑옷부터 손봐야지.\n흑요석게 조각 여섯 개를 가져오게.',done:'흑요석을 덧댄 갑옷일세. 한 단계 단단해졌어.',rw:{xp:600,aup:1,stat:3}},
  sb6:{giver:'hans',title:'용암도마뱀 사냥',type:'kill',sp:'lavalizard',n:8,zone:'z5',
    offer:'군주 곁을 지키는 용암도마뱀부터 줄여야 하네.\n여덟 마리를 처치해 주게.',done:'이걸로 군주에게 가는 길이 트였군. 이건 훈련 비법일세.',rw:{xp:600,kp:1,shard:10}},
  sk1:{giver:'dor',title:'수정 가루',type:'collect',sp:'crystalbat',item:'수정 가루',rate:.6,n:6,zone:'k2',
    offer:'수정박쥐 날개의 수정 가루 여섯 줌이면,\n카르도 광부의 비기 「대지 가르기」를 가르쳐 주지.',done:'바로 이거야! 비기를 적어 두었네.',rw:{xp:900,book:'quake',stone:5}},
  sk2:{giver:'sena',title:'이끼 약초',type:'kill',sp:'mosswisp',n:8,zone:'k2',
    offer:'이끼돌정령들이 약초 군락을 덮어 버렸어요.\n여덟만 정리해 주세요.',done:'고마워요! 이끼 약초 달인 차예요. 기운이 솟을 거예요.',rw:{xp:900,stat:3,kp:1}},
  sk3:{giver:'mora',title:'등잔 기름',type:'collect',sp:'snail',item:'등잔 기름',rate:.6,n:6,zone:'k3',
    offer:'여관 등불 기름이 다 떨어졌어요.\n등잔달팽이 기름 여섯 병만 구해 주세요.',done:'이제 밤에도 환하겠어요! 감사의 뜻으로 특별식을 드릴게요.',rw:{xp:1500,stat:3}},
  sk4:{giver:'dor',title:'갑각 단조',type:'collect',sp:'stonebeetle',item:'갑각 조각',rate:.6,n:6,zone:'k3',
    offer:'돌갑충 갑각을 녹여 넣으면 무기가 한층 날카로워지지.\n여섯 조각만 가져오게.',done:'갑각을 녹여 무기를 두드렸네. 한 단계 강해졌어.',rw:{xp:1500,wup:1,stone:5}},
  sk5:{giver:'sena',title:'안개 정수',type:'kill',sp:'mist',n:8,zone:'k4',
    offer:'안개정령의 정수로 마지막 영약을 만들 수 있어요.\n여덟을 잠재워 주세요.',done:'영약이에요. 왕과 싸우기 전에 꼭 드세요.',rw:{xp:2200,stat:3,kp:1}},
  sk6:{giver:'rian',title:'조개 진주',type:'collect',sp:'clam',item:'조개 진주',rate:.6,n:6,zone:'k4',
    offer:'조개집게의 진주는 권능을 깨우는 데 쓰인다네.\n여섯 알을 모아 오게.',done:'훌륭하군. 진주를 권능 파편으로 바꿔 두었네.',rw:{xp:2200,shard:20,stone:5}},
};
/* 신의 시련 (v4.8.4): 메인 5 「도토리 숲의 소란」 보상 후 장로 오르빈에게서 셋 다 열린다. 깨면 그 신의 권능을 얻는다 (처음 얻은 권능은 바로 장착) */
Object.assign(SUBQ,{
  ga:{giver:'orvin',trial:'athena',lv:6,title:'아테나의 시련 · 방패의 시험',type:'kill',sp:'acornboar',n:12,zone:'z2',
    offer:'방패의 여신 아테나는 물러서지 않는 자에게 권능을 내린다네.\n도토리 숲의 멧돼지 열둘의 돌격을 정면으로 받아 내 보게.',done:'버텨 냈군. 아테나의 방패가 자네 곁에 머물 걸세.',rw:{xp:300,god:'athena',shard:5}},
  gr:{giver:'orvin',trial:'artemis',lv:9,title:'아르테미스의 시련 · 사냥의 시험',type:'collect',sp:'windfox',item:'바람여우 꼬리',rate:.6,n:8,zone:'z3',
    offer:'사냥의 여신 아르테미스는 빠른 짐승을 잡는 자를 아낀다네.\n바람 평원의 바람여우 꼬리 여덟 개를 가져오게.',done:'훌륭한 사냥 솜씨야. 아르테미스의 화살이 자네를 따를 걸세.',rw:{xp:650,god:'artemis',shard:5}},
  gz:{giver:'orvin',trial:'zeus',lv:14,title:'제우스의 시련 · 천둥의 시험',type:'kill',sp:'lakesnake',n:10,zone:'z4',
    offer:'천둥의 신 제우스는 폭풍 속에서도 물러서지 않는 자를 찾는다네.\n안개 호숫가의 물뱀 열을 쓰러뜨리게. 녀석들은 먼저 덤벼드니 조심하게.',done:'호수 위로 번개가 쳤다네. 제우스가 자네를 인정한 게야.',rw:{xp:1100,god:'zeus',shard:5}},
});
/* v4.10 성장 서브 (리니지M 메인 퀘스트의 「제작하세요 · 강화하세요 · 컬렉션을 등록하세요」 단계).
   관문 메인을 수락하면 사냥 서브와 함께 열린다. 자동 진행은 수락·보상만 하고, 제작·강화·컬렉션 등록은 플레이어가 직접 한다(그동안 같은 지역에서 수련 사냥).
   give: 수락할 때 지급하는 재료(튜토리얼) · 진행은 상태로 판정(강화·컬렉션·신앙) 또는 수락 뒤 횟수(제작·보스 장비 등록) */
const ARMOR_K=['helm','armor','cloak','gloves','boots'];
/* v4.11 서브 다양화 (제우스: 에픽 퀘스트 아래 서브 · 아이온2: 일일 수호자 임무 같은 반복 의뢰)
   type: hunt(지역 아무 몬스터) · rep(그 지역 경비대 토벌 의뢰 누적 n회) · fbk(그 지역 지역 보스 처치 n회) · lv(레벨 도달) — 모두 자동 진행이 할 수 있다(사냥·방치) */
Object.assign(SUBQ,{
  rp1:{giver:'hans',type:'rep',map:'rowen',n:2,title:'경비대 토벌 의뢰 Ⅰ',offer:'숲의 주인과 싸우기 전에 경비대 일부터 거들어 주게.\n내 토벌 의뢰를 두 번 끝내면 돼. 의뢰는 몇 번이고 다시 받을 수 있네.',done:'경비대가 자네를 믿기 시작했네.',rw:{xp:300,stone:4}},
  rp2:{giver:'hans',type:'rep',map:'rowen',n:2,title:'경비대 토벌 의뢰 Ⅰ',offer:'호숫가로 가는 길이 위험해. 내 토벌 의뢰를 두 번 끝내 주게. 의뢰는 몇 번이고 다시 받을 수 있네.',done:'이제 북문 밖이 조금은 조용하군.',rw:{xp:700,stk:{asc:2}}},
  rp3:{giver:'hans',type:'rep',map:'rowen',n:5,title:'경비대 토벌 의뢰 Ⅲ',offer:'군주를 치려면 고원 길목부터 비워야 하네.\n로웬 토벌 의뢰를 모두 다섯 번까지 채워 주게.',done:'로웬 경비대의 명예 대원일세!',rw:{xp:1100,stk:{wsc:2},stone:6}},
  ht1:{giver:'bram',type:'hunt',zone:'z4',n:30,title:'호숫가 정찰',offer:'호숫가 아무 놈이나 서른 마리. 녀석들 버릇을 알아야 큰물뱀도 잡지.',done:'몸이 호숫가에 익었군.',rw:{xp:700,stone:5}},
  fk1:{giver:'hans',type:'fbk',map:'rowen',n:2,title:'지역 보스 토벌',offer:'쓰러뜨린 보스들이 다시 깨어났다네. 로웬의 지역 보스를 두 번 토벌해 주게.\n트래커의 「지역 보스」로 찾아가면 되네.',done:'보스들이 다시 잠잠해졌군.',rw:{xp:1100,stk:{rcp2:1}}},
  rp4:{giver:'rian',type:'rep',map:'kardo',n:3,title:'카르도 토벌 의뢰 Ⅰ',offer:'카르도는 처음이지? 내 토벌 의뢰를 세 번 끝내 보면 이곳 사정을 알게 될 거야.',done:'카르도 경비대에 온 걸 환영해.',rw:{xp:1500,stone:6}},
  ht2:{giver:'dor',type:'hunt',zone:'k2',n:35,title:'동굴숲 개척',offer:'파수꾼까지 길을 내려면 동굴숲 놈들 서른다섯은 치워야 해.',done:'길이 났군! 광부들이 고마워할 거야.',rw:{xp:1500,stk:{asc:2}}},
  rp5:{giver:'rian',type:'rep',map:'kardo',n:6,title:'카르도 토벌 의뢰 Ⅱ',offer:'협곡 여왕에게 가기 전에, 카르도 토벌 의뢰를 모두 여섯 번까지 채워.',done:'경비대 기록에 이름이 올랐어.',rw:{xp:2300,stk:{wsc:2}}},
  fk2:{giver:'karl',type:'fbk',map:'kardo',n:2,title:'카르도 지역 보스 토벌',offer:'동굴의 파수꾼이 다시 깨어났다네. 카르도의 지역 보스를 두 번 토벌해 주게.',done:'광부들이 다시 동굴로 들어갈 수 있겠군.',rw:{xp:2300,stk:{rcp2:1}}},
  rp6:{giver:'rian',type:'rep',map:'kardo',n:9,title:'카르도 토벌 의뢰 Ⅲ',offer:'왕과 싸우려면 카르도 전역이 조용해야 해. 토벌 의뢰를 모두 아홉 번까지.',done:'카르도의 수호자로군.',rw:{xp:3300,stone:10}},
  lv1:{giver:'rian',type:'lv',n:28,title:'광석골렘 왕의 기준',offer:'왕의 일격은 Lv 28은 돼야 버틴다. 그 전엔 보내 줄 수 없어.',done:'좋아, 이제 왕 앞에 서도 되겠어.',rw:{xp:3000,stk:{ascB:1}}},
  rp7:{giver:'taon',type:'rep',map:'erna',n:3,title:'에르나 토벌 의뢰 Ⅰ',offer:'에르나 경비대는 실력으로 말한다. 토벌 의뢰 세 번.',done:'불의 땅에서도 버티는군.',rw:{xp:4300,stone:8}},
  ht3:{giver:'taon',type:'hunt',zone:'e2',n:40,title:'불티 숲 소각',offer:'거목에게 가는 길의 불씨를 꺼야 해. 불티 숲 몬스터 마흔.',done:'숲길이 식었다.',rw:{xp:4300,stk:{asc:3}}},
  rp8:{giver:'taon',type:'rep',map:'erna',n:6,title:'에르나 토벌 의뢰 Ⅱ',offer:'군주에게 가는 길목을 비운다. 에르나 토벌 의뢰를 모두 여섯 번까지.',done:'호숫가 길이 열렸다.',rw:{xp:5300,stk:{wsc:3}}},
  fk3:{giver:'taon',type:'fbk',map:'erna',n:2,title:'에르나 지역 보스 토벌',offer:'불티 숲의 주인이 다시 일어섰다. 에르나의 지역 보스를 두 번 쓰러뜨려.',done:'둘 다 다시 잠들었군.',rw:{xp:5300,stk:{rcp3:1}}},
  rp9:{giver:'taon',type:'rep',map:'erna',n:9,title:'에르나 토벌 의뢰 Ⅲ',offer:'여왕의 둥지 아래를 깨끗이. 에르나 토벌 의뢰를 모두 아홉 번까지.',done:'에르나 경비대 최고의 대원이다.',rw:{xp:6500,stone:14}},
  lv2:{giver:'aila',type:'lv',n:37,title:'불새 여왕의 기준',offer:'홍염 앞에 서려면 Lv 37은 되어야 하네.',done:'이제 여왕과 겨룰 만하군.',rw:{xp:5000,stk:{wscB:1}}},
  sd1:{giver:'hans',type:'hunt',zone:'z3',n:20,title:'평원 순찰',offer:'여우 말고도 평원엔 말썽꾼이 많아. 아무 놈이나 스물.',done:'평원이 한결 조용하군.',rw:{xp:300,gold:150,stone:3}},
  sd2:{giver:'mira',type:'collect',sp:'sheep',item:'보송 양털',rate:.6,n:6,zone:'z3',title:'보송 양털',offer:'평원 양털로 물약 거름망을 만들 거야. 여섯 뭉치만!',done:'보송보송! 이건 수고비야.',rw:{xp:350,gold:200,stk:{wsc:1}}},
  sd3:{giver:'nell',type:'kill',sp:'otter',n:8,zone:'z4',title:'수달 소동',offer:'개울수달이 여관 생선을 훔쳐 가요! 여덟 마리만 쫓아 주세요.',done:'생선이 무사해요! 고마워요.',rw:{xp:500,stone:4}},
  sd4:{giver:'hans',type:'hunt',zone:'z5',n:25,title:'고원 정찰',offer:'잿빛 고원의 놈들이 어떤지 직접 보고 와 주게. 스물다섯이면 충분하네.',done:'고원 지도가 완성됐군.',rw:{xp:900,stk:{asc:2}}},
  sd5:{giver:'dor',type:'collect',sp:'mole',item:'두더지 발톱',rate:.6,n:6,zone:'k1',title:'두더지 발톱',offer:'두더지 발톱은 곡괭이 끝으로 최고지. 여섯 개 가져와.',done:'좋은 발톱이야. 강화석으로 쳐 주지.',rw:{xp:900,stone:5}},
  sd6:{giver:'mora',type:'hunt',zone:'k1',n:25,title:'언덕길 청소',offer:'여관 손님들이 자갈 언덕을 무서워해요. 스물다섯만 정리해 주세요.',done:'손님들이 다시 오겠네요!',rw:{xp:1000,stk:{wsc:1}}},
  sd7:{giver:'sena',type:'collect',sp:'rockcrab',item:'바위게 껍데기',rate:.6,n:6,zone:'k3',title:'바위게 껍데기',offer:'바위게 껍데기 가루가 해독약에 들어가요. 여섯 개만요.',done:'해독약 완성! 고마워요.',rw:{xp:1800,stk:{asc:2}}},
  sd8:{giver:'karl',type:'hunt',zone:'k3',n:30,title:'협곡 소탕',offer:'협곡이 시끄럽네. 아무 놈이나 서른을 정리해 주게.',done:'협곡이 고요해졌군.',rw:{xp:2000,stone:6}},
  sd9:{giver:'mora',type:'collect',sp:'clam',item:'조개 살',rate:.6,n:6,zone:'k4',title:'조개 살',offer:'오늘 특별식은 조개탕이에요! 조개 살 여섯 개만 부탁해요.',done:'맛있는 조개탕이 될 거예요.',rw:{xp:2800,stk:{wsc:1}}},
  sd10:{giver:'hana',type:'kill',sp:'ashbat',n:10,zone:'e1',title:'잿빛박쥐 퇴치',offer:'잿빛박쥐가 온천에 잿가루를 떨궈요. 열 마리만요.',done:'온천물이 맑아졌어요!',rw:{xp:2600,stone:6}},
  sd11:{giver:'rumi',type:'collect',sp:'flamewisp',item:'정령의 불씨',rate:.6,n:6,zone:'e2',title:'정령의 불씨',offer:'불꽃정령의 불씨로 화염 물약을 달여요. 여섯 개!',done:'불씨가 살아 있어요! 고마워요.',rw:{xp:3200,stk:{asc:2}}},
  sd12:{giver:'goro',type:'hunt',zone:'e3',n:30,title:'용암 호숫가 정찰',offer:'호숫가 놈들 서른. 흑요석 캘 자리를 봐야 하네.',done:'좋은 자리를 찾았네.',rw:{xp:4000,stone:8}},
  sd13:{giver:'hana',type:'kill',sp:'flamewisp',n:10,zone:'e4',title:'둥지의 불꽃정령',offer:'둥지 근처 불꽃정령이 온천까지 내려와요. 열만요.',done:'이제 안심이에요!',rw:{xp:5500,stk:{wsc:2}}},
  /* ===== v4.83 G10 새 서브 유형(지시서 §G10) — 탐색(reach) · 방어(wave) · 보상 택1(rw.pick). 옛 곁가지 서브(sd1~sd13 · ht1 · ht3)와 바꿔 끼웠다(XQ_OLD · 옛 데이터는 진행 중 세이브를 위해 남겨 둔다) ===== */
  ex1:{giver:'hans',type:'reach',zone:'z3',n:3,title:'평원 길 살피기',offer:'평원에 낯선 발자국이 늘었어. 세 군데만 둘러보고 와 줘.',done:'발자국이 평원 안쪽으로 이어진다고? 덕분에 순찰 길을 다시 짰어.',rw:{xp:300,gold:150,stone:3}},
  ex2:{giver:'mira',type:'collect',sp:'sheep',item:'보송 양털',rate:.6,n:6,zone:'z3',title:'보송 양털',offer:'평원 양털로 물약 거름망을 만들 거야. 여섯 뭉치만! 수고비는 골라 가.',done:'보송보송! 약속한 수고비야. 하나 골라.',rw:{xp:350,pick:[{gold:200,stone:3},{stone:6},{shard:6}]}},
  ex3:{giver:'nell',type:'wave',zone:'z3',n:3,title:'평원 야영지 지키기',offer:'평원 야영지에 들짐승이 몰려온대. 자리를 지키고 세 번만 막아 줘.',done:'야영지가 무사하다니 다행이야. 푹 쉬다 가.',rw:{xp:500,stone:4}},
  ex4:{giver:'hans',type:'reach',zone:'z5',n:3,title:'고원의 갈라진 땅',offer:'잿빛 고원 땅이 갈라진다는 말이 있어. 세 군데를 직접 보고 와.',done:'군주가 깨어나려는 게 틀림없군. 수고했어.',rw:{xp:900,stk:{asc:2}}},
  ex5:{giver:'bram',type:'hunt',zone:'z4',n:30,title:'호숫가 정찰',offer:'호숫가 아무 놈이나 서른 마리. 녀석들 버릇을 알아야 큰물뱀도 잡지. 품삯은 고르게.',done:'몸이 호숫가에 익었군. 뭘로 받겠나?',rw:{xp:700,pick:[{stone:5},{gold:350},{shard:8}]}},
  ex6:{giver:'dor',type:'collect',sp:'mole',item:'두더지 발톱',rate:.6,n:6,zone:'k1',title:'두더지 발톱',offer:'두더지 발톱이 곡괭이 날로 그만이지. 여섯 개만 구해 주게. 값은 고르게.',done:'좋은 발톱이군! 하나 골라 가게.',rw:{xp:900,pick:[{stone:5},{gold:500},{shard:8}]}},
  ex7:{giver:'mora',type:'reach',zone:'k1',n:3,title:'언덕길 살피기',offer:'자갈 언덕 길이 무너졌다는 소문이야. 세 군데만 보고 와 줘.',done:'길은 멀쩡하구나. 장사 길이 다시 열리겠어.',rw:{xp:1000,stk:{wsc:1}}},
  ex8:{giver:'sena',type:'collect',sp:'rockcrab',item:'바위게 껍데기',rate:.6,n:6,zone:'k3',title:'바위게 껍데기',offer:'바위게 껍데기 여섯 장이 필요해. 대가는 골라.',done:'단단한 껍데기네. 어느 쪽으로 받을래?',rw:{xp:1800,pick:[{stone:6},{gold:800},{shard:10}]}},
  ex9:{giver:'karl',type:'wave',zone:'k3',n:3,title:'협곡 초소 지키기',offer:'협곡 초소로 놈들이 몰려온다네. 초소 자리에서 세 번만 막아 주게.',done:'초소가 버텼군. 카르도가 자네에게 빚을 졌네.',rw:{xp:2000,stone:6}},
  ex10:{giver:'mora',type:'reach',zone:'k4',n:3,title:'수정이 자라는 자리',offer:'수정 호숫가에 새 수정이 돋았다던데, 세 군데만 확인해 줘.',done:'정말 돋았구나! 좋은 소식이야.',rw:{xp:2800,stk:{wsc:1}}},
  ex11:{giver:'hana',type:'reach',zone:'e1',n:3,title:'잿가루 언덕의 연기',offer:'언덕 세 군데에서 연기가 오른대. 가서 살펴봐 줘.',done:'땅속 불길이 올라오는 거였구나. 고마워.',rw:{xp:2600,stone:6}},
  ex12:{giver:'rumi',type:'collect',sp:'flamewisp',item:'정령의 불씨',rate:.6,n:6,zone:'e2',title:'정령의 불씨',offer:'정령의 불씨 여섯 개가 필요해. 답례는 골라 가.',done:'따뜻한 불씨야. 어느 걸로 할래?',rw:{xp:3200,pick:[{stone:6},{gold:1200},{shard:12}]}},
  ex13:{giver:'goro',type:'wave',zone:'e3',n:3,title:'용암 호숫가 지키기',offer:'호숫가 대장간 터로 놈들이 몰려와. 터를 지키고 세 번만 막아.',done:'터가 무사하군. 솜씨가 좋아.',rw:{xp:4000,stone:8}},
  ex14:{giver:'hana',type:'reach',zone:'e4',n:3,title:'둥지로 가는 길',offer:'불새 둥지로 가는 길 세 군데를 살펴 줘. 여왕과 싸우기 전에 길을 알아야지.',done:'길을 다 봐 뒀구나. 이제 여왕만 남았어.',rw:{xp:5500,stk:{wsc:2}}},
  ex15:{giver:'taon',type:'hunt',zone:'e2',n:40,title:'불티 숲 소각',offer:'불티 숲 놈들 마흔 마리. 숲의 주인에게 가는 길을 열어 둬. 보급은 골라.',done:'길이 열렸군. 보급을 골라 가.',rw:{xp:4300,pick:[{stone:9},{gold:1500},{shard:15}]}},
});
const STATE_T={rep:1,lv:1};
Object.assign(SUBQ,{
  /* v4.46 첫 균열 안내(선택): 균열 안 누적 처치(S.riftK) — 처치 이벤트가 아니라 수를 보는 성장 서브라 '균열 처치는 퀘스트에 들지 않는다'와 부딪히지 않는다 */
  gr1:{giver:'hans',grow:'rift',n:10,title:'첫 균열 탐사',offer:'문이 열렸다며? 안이 어떤지 직접 보고 와. 균열 몬스터 열 마리면 충분해.\n위험하면 화면의 [나가기]를 눌러.',done:'시간이 멈춘 사냥터라… 강화석이 저렇게 쏟아진다니 종종 들러야겠군.',rw:{xp:300,stone:5}},
  gc1:{giver:'bram',grow:'craft',g:0,n:2,title:'첫 장비 제작',give:{stone:6,gold:120},offer:'이제부터 장비는 주워 쓰는 게 아니라 만들어 쓰는 거야.\n강화석을 줄 테니 제작 창에서 장비 두 개를 만들어 봐. (가방 I → 제작)',done:'제법인데? 같은 장비 둘을 모으면 고급으로 올려 만들 수 있지.',rw:{xp:250,stk:{asc:3},stone:3}},
  gc2:{giver:'bram',grow:'ench',k:'weapon',en:3,title:'무기 단련',give:{wsc:3},offer:'강화석을 넉넉히 주지. 장착한 무기를 +3까지 올려 보게. (메뉴 → 강화)\n안전 강화 구간에선 실패하지 않아. 강화할수록 신앙도 깊어지지.',done:'손에 착 붙는군. 강화 단계마다 신앙이 1씩 오른다네.',rw:{xp:250,stone:4}},
  gc3:{giver:'orvin',grow:'coll',n:2,title:'첫 컬렉션',offer:'장비를 컬렉션에 바치면 그 장비는 사라지지만, 그 힘은 영원히 자네에게 남는다네.\n컬렉션 둘을 완성해 보게. (가방 I → 컬렉션)',done:'몸에 힘이 차오르는 게 느껴지나? 그게 신앙일세.',rw:{xp:600,stk:{wsc:2}}},
  gc4:{giver:'bram',grow:'craft',g:1,n:1,title:'고급 장비 제작',give:{stone:8,gold:300},offer:'같은 부위·같은 단계 일반 장비 둘이면 고급 하나를 만들 수 있어.\n고급 장비를 하나 만들어 와. 고급부터는 신앙이 깃들지.',done:'초록빛이 도는군. 이건 비법서다 — 희귀 제작에 쓰게.',rw:{xp:600,stk:{rcp2:1}}},
  gc5:{giver:'bram',grow:'ench',k:'armor',en:4,n:3,title:'방어구 단련',give:{asc:4},offer:'군주의 불길을 맨몸으로 받을 텐가? 방어구 셋을 +4까지 두드리게.\n강화석은 내 가게에서도 판다네.',done:'이 정도면 불길도 버티겠군. 축복받은 주문서를 하나 얹어 주지.',rw:{xp:800,stk:{ascB:1}}},
  gc6:{giver:'orvin',grow:'faith',n:30,title:'신앙의 증명 · 로웬',offer:'마그마골렘 군주는 신앙이 얕은 자의 칼을 튕겨 낸다네.\n신앙 30에 이르게. 높은 등급 장비 · 강화 · 컬렉션이 신앙을 키우지.',done:'자네의 신앙이 군주의 열기를 꿰뚫을 걸세.',rw:{xp:800,stk:{wscB:1}}},
  gc7:{giver:'karl',grow:'reg',n:1,title:'보스의 유품',offer:'로웬의 보스들이 떨군 전용 장비를 아직 갖고 있나?\n그걸 컬렉션에 하나 등록해 보게. 같은 보스의 유품을 모두 바치면 큰 신앙을 얻지.\n쓰러뜨린 지역 보스는 시간이 지나면 다시 나타난다네.',done:'유품을 바쳤군. 보스를 다시 잡아 나머지도 채우게.',rw:{xp:1400,stk:{rcp2:1}}},
  gc8:{giver:'dor',grow:'craft',g:2,n:1,title:'희귀 장비 제작',give:{rcp2:2,stone:10},offer:'희귀 장비는 비법서가 있어야 해. 두 권 줄 테니 고급 장비를 재료로 희귀를 만들어 봐.\n실패해도 재료 장비는 남으니 걱정 말고.',done:'푸른빛! 카르도 광부들도 인정할 솜씨야.',rw:{xp:1400,stk:{asc:4}}},
  gc9:{giver:'dor',grow:'ench',k:'weapon',en:7,title:'한계 너머의 단련',give:{wscB:1,wsc:2},offer:'안전 강화(+5)를 넘으면 확률이야. 실패해도 깨지진 않으니 두려워 마.\n무기를 +7까지 올려 와. 축복받은 주문서도 하나 주지.',done:'+7! 이제 협곡 여왕의 껍데기도 갈라지겠군.',rw:{xp:2200,stk:{rcp3:1}}},
  gc10:{giver:'rian',grow:'coll',n:6,title:'수집가의 길',offer:'컬렉션 여섯 개를 완성하면 카르도 수집가 조합에서 인정해 주지.\n남는 장비는 분해하지 말고 컬렉션에 넣어.',done:'훌륭한 수집가야. 이건 조합의 선물이다.',rw:{xp:2200,stk:{ascB:1}}},
  gc11:{giver:'karl',grow:'bcoll',n:1,title:'지역 보스 토벌 기록',offer:'지역 보스의 유품을 모두 모아 보스 컬렉션 하나를 완성하게.\n쓰러뜨린 보스는 다시 나타나니, 트래커의 「지역 보스」로 찾아가면 된다네.',done:'토벌 기록이 남았군. 광석골렘 왕도 자네를 알아볼 걸세.',rw:{xp:3200,stk:{wscB:1}}},
  gc12:{giver:'karl',grow:'faith',n:62,title:'신앙의 증명 · 카르도',offer:'광석골렘 왕의 몸은 신앙 없이는 흠집도 나지 않네.\n신앙 62에 이르게.',done:'좋아, 이제 왕의 몸에 칼이 들어갈 걸세.',rw:{xp:3200,stk:{rcp3:1}}},
  gc13:{giver:'goro',grow:'craft',g:3,n:1,title:'영웅 장비 제작',give:{rcp3:3,stone:20},offer:'영웅 비법서 세 권이다. 희귀 장비를 재료로 영웅을 두드려 보게. 성공률은 반반이야.',done:'붉게 타오르는군. 에르나의 불도 견딜 걸세.',rw:{xp:4200,stk:{ascB:1}}},
  gc14:{giver:'goro',grow:'ench',k:'armor',en:5,n:4,title:'흑요석 단련',give:{asc:6},offer:'방어구 넷을 +5까지 올려 오게. +5를 넘으면 확률이지만 깨지진 않아.',done:'흑요석처럼 단단해졌군.',rw:{xp:4200,stk:{wscB:1}}},
  gc15:{giver:'taon',grow:'bcoll',n:2,title:'토벌대의 기록',offer:'지역 보스 컬렉션 둘을 완성해. 군주는 토벌 경험이 없는 자를 비웃는다.',done:'두 보스의 유산이군. 전설 비법서를 주지.',rw:{xp:5200,stk:{rcp4:1}}},
  gc16:{giver:'aila',grow:'faith',n:98,title:'신앙의 증명 · 에르나',offer:'용암 호수의 군주는 깊은 신앙만이 꿰뚫을 수 있네.\n신앙 98에 이르게.',done:'호수의 열기가 자네를 피하는군.',rw:{xp:5200,stk:{ascB:1}}},
  gc17:{giver:'aila',grow:'coll',n:9,title:'대수집가',offer:'컬렉션 아홉 개를 완성하게. 원정대의 전설은 모두 그렇게 시작됐지.',done:'대수집가의 칭호를 내리지.',rw:{xp:6400,stk:{wscB:1}}},
  gc18:{giver:'aila',grow:'faith',n:118,title:'불의 신앙',offer:'홍염은 불의 신앙 118에 이른 자에게만 깃털을 허락하네.',done:'불의 신앙이 자네를 감싸는군. 이제 여왕에게 가게.',rw:{xp:6400,stone:20}},
});
const TRIALS=['ga','gr','gz'],TRIAL_OF={athena:'ga',artemis:'gr',zeus:'gz'};
/* v4.13: 시련은 알맞은 레벨이 되어야 열린다 (아테나 Lv6 · 아르테미스 Lv9 · 제우스 Lv14) */
const trialReady=id=>S.lv>=(SUBQ[id].lv||1);
for(const id in SUBQ)SUBQ[id].id=id;
const qMap=q=>q.zone?ZALL[q.zone].map:NALL[q.type==='talk'?q.npc:q.giver].map;
const turnNpc=q=>q.type==='talk'?q.npc:q.giver;
/* v4.14 보상 정리: 주문서 → 강화석 · 축복 주문서, 메인 퀘스트마다 그 지역 광물 · 관문은 도면 */
for(const q of [...QUESTS,...Object.values(SUBQ)]){if(q.rw){normRwStk(q.rw);if(q.rw.stk)normRwStk(q.rw.stk);if(q.rw.stk&&q.rw.stk.stone){q.rw.stone=(q.rw.stone||0)+q.rw.stk.stone;delete q.rw.stk.stone;}}if(q.give)normRwStk(q.give);}
/* v4.19 지역 보스 토벌(메인): 관문 정예의 필드 보스판을 다시 쓰러뜨려야 다음 관문으로 */
const QFB=q=>QUESTS.find(x=>x.id===q.boss);QUESTS.forEach(q=>{if(q.type==='fboss')q.title=QFB(q).elite.name.split(' · ')[0]+' 재토벌';});
/* 이전 세이브의 S.qi는 v4.18까지의 순서 — 퀘스트 id로 옮긴다 */
const QORDER_418=['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10','q11','q12','q13','q14','q15','q16','q17','q18','q19','q20','q21','q22','q23','q24','q25','q26','q27','q28','q29','q30','q31','q32','q33'];
const QORDER_445=['q1','q2','q3','q4','q5','q6','q7','q8','q9','fb1','q10','q11','fb2','q12','q13','q14','q15','fb3','q16','q17','q18','fb4','q19','q20','fb5','q21','q22','q23','q24','q25','q26','fb6','q27','q28','q29','fb7','q30','q31','fb8','q32','q33'];
const QORDER_446=['q1','q2','q3','q4','q5','q6','q7','q8','q9','fb1','q10','rq1','rq2','rq3','q11','fb2','q12','q13','q14','q15','fb3','q16','q17','q18','fb4','q19','q20','fb5','q21','q22','q23','q24','q25','q26','fb6','q27','q28','q29','fb7','q30','q31','fb8','q32','q33'];/* qv 3의 순서(v4.46~v4.82) */
/* v4.46 메인에 균열 개방 스토리 3개(rq1~rq3)를 q10 뒤에 끼움 → 순번을 id로 다시 찾는다. qv 3 = 이 순서. 옛 순번(qv 2 = QORDER_445 · 그 전 = QORDER_418)의 id를 지금 QUESTS에서 찾는다.
   · q10을 넘긴 세이브는 스토리를 지난 것으로 본다(균열 열림 — 한 번 알림) · q10 전인데 옛 규칙으로 균열을 써 본 세이브는 riftKey로 계속 열어 둔다 · q11을 지난 세이브에는 '첫 균열 탐사'를 열어 준다 */
const XQ_OLD={'sd1':'ex1','sd2':'ex2','sd3':'ex3','sd4':'ex4','ht1':'ex5','sd5':'ex6','sd6':'ex7','sd7':'ex8','sd8':'ex9','sd9':'ex10','sd10':'ex11','sd11':'ex12','sd12':'ex13','sd13':'ex14','ht3':'ex15'};
/* v4.83 옛 곁가지 서브 → 새 서브: 끝낸 것은 끝낸 것으로 · 보상 전이면 보상 전으로 · 그 밖(받기 전 · 진행 중)은 새 서브를 받기 전으로 */
function migrateXq(S){if(!S.sq)return;for(const o in XQ_OLD){const n=XQ_OLD[o],a=S.sq[o];if(!a||S.sq[n])continue;S.sq[n]=a.st==='clear'?{st:'clear',n:0}:a.st==='done'?{st:'done',n:SUBQ[n].n||0}:{st:'avail',n:0};delete S.sq[o];}}
function migrateQi(S){migrateXq(S);const v=S.qv||0;if(v>=4)return;if(v<3){if(S.qi!=null){const id=(v>=2?QORDER_445:QORDER_418)[S.qi];const i=id?QORDER_446.indexOf(id):QORDER_446.length;if(i>=0)S.qi=i;
    const k=QORDER_446.indexOf('rq3'),k11=QORDER_446.indexOf('q11');
    if(S.qi>k)S.riftNote=1;else if((S.riftK||0)>0)S.riftKey=1;
    if(S.sq&&!S.sq.gr1&&(S.qi>k11||S.qi===k11&&S.qs&&S.qs!=='avail'))S.sq.gr1={st:'avail',n:0};}}
  /* v4.83 지역 단위 루트(qv 4): 재토벌 fb3 · fb6을 그 지역의 끝(q12 · q21 뒤)으로 옮겼다. 옛 순번의 id로 새 자리를 찾는다 —
     옛 자리의 fb3 · fb6에 서 있던 세이브는 옛 순서의 다음 퀘스트로(이미 다음 지역에 있으니 되돌아가지 않는다) · 그렇게 건너뛴 재토벌은 끝낸 것으로 치고 보상(경험치 · 골드 · 강화석)을 준다(한 번 알림) */
  if(S.qi!=null){const O=QORDER_446,oi=S.qi,id=O[oi];let ni=id?QUESTS.findIndex(q=>q.id===id):QUESTS.length;
    if(id==='fb3'||id==='fb6'){ni=QUESTS.findIndex(q=>q.id===O[oi+1]);S.qs='avail';S.qn=0;}
    for(const m of ['fb3','fb6']){const om=O.indexOf(m),nm=QUESTS.findIndex(q=>q.id===m);if(oi<=om&&ni>nm){const rw=QUESTS[nm].rw;S.xp=(S.xp||0)+(rw.xp||0);S.gold=(S.gold||0)+(rw.gold||0);S.stone=(S.stone||0)+(rw.stone||0);S.routeNote=(S.routeNote||0)+1;}}
    S.qi=ni;}
  S.qv=4;}
{let j=0;QUESTS.forEach(q=>{const i=j;if(!q.story)j++;if(q.type==='talk'||q.story)return;const r=MAP_REG[q.type==='fboss'?NALL[q.giver].map:qMap(q)]||1;q.rw.ore=(q.rw.ore||0)+(q.elite?6+4*r:3+2*r);if(q.elite)q.rw.dsg=(q.rw.dsg||0)+2;else if(i%2===0)q.rw.dsg=(q.rw.dsg||0)+1;});}
for(const id of ['gc1','gc4','gc8','gc13']){const q=SUBQ[id];q.give=q.give||{};const r=id==='gc13'?3:id==='gc8'?2:1;q.give['ore'+r]=(q.give['ore'+r]||0)+(id==='gc1'?8:id==='gc4'?10:20);q.give.dsgAny=(id==='gc1'?2:1);if(q.give.stone){delete q.give.stone;}}

/* ================= 저장 ================= */
const SAVE_KEY='rowen-mmo-v4'; /* v4.8도 같은 키 — loadSave에서 migrate48로 이전 */
let S=null;
const newSave=()=>({map:'rowen',maps:['rowen'],lv:1,xp:0,gold:60,hpPot:5,mpPot:3,scroll:2,autoBuy:true,autoRet:false,wlv:0,alv:0,wfail:0,afail:0,stone:3,shard:0,
  st:{str:0,vit:0,dex:0,int:0},sp:0,kp:0,sk:{},books:{},autoGrow:false,
  god:null,godLv:{zeus:1,athena:1,artemis:1},qi:0,qs:'avail',qn:0,sq:{},rep:null,autoQ:false,autoPot:true,x:960,y:1700,kills:0,lastSeen:0,aiZone:null,grave:null});
function save(){if(!S)return;S.lastSeen=Date.now();if(M.inst){if(riftRet){S.map=riftRet.map;S.x=riftRet.x;S.y=riftRet.y;}/* 전용 공간에서는 들어오기 전 자리를 적는다 → 이어하기는 균열 밖에서 */}else{S.map=MAPID;S.x=Math.round(player.x);S.y=Math.round(player.y);}try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}
function loadSave(){try{const r=JSON.parse(localStorage.getItem(SAVE_KEY));if(r&&r.lv)return migrate48(Object.assign(newSave(),r));}catch(e){}return null;}

/* ================= 현재 지역 바인딩 ================= */
let trainFor=null;let MAPID='rowen',M=MAPS.rowen,ZONES,HUNT,LAKES,LAVA,PLATS,PLAZA,HOUSES,NPCS,ROADSEG,EG,blk,reach,statics,terrain,groundCv,miniBase,npcList,mobs,G0;
function mapRt(id){const m=MAPS[id];if(!m.rt){m.rt={EG:new Float32Array((GW+1)*(GH+1)),blk:new Uint8Array(GW*GH),reach:new Uint8Array(GW*GH),statics:[],npcList:[],mobs:[],group:new T3.Group(),built:false};
  m.roadseg=[];for(const r of m.roads)for(let i=0;i<r.length-1;i++){const a=r[i],b=r[i+1];m.roadseg.push({ax:a[0],ay:a[1],bx:b[0],by:b[1],x0:Math.min(a[0],b[0])-40,x1:Math.max(a[0],b[0])+40,y0:Math.min(a[1],b[1])-40,y1:Math.max(a[1],b[1])+40});}}return m.rt;}
function bindMap(id){M=MAPS[id];MAPID=id;const R=mapRt(id);ZONES=M.zones;HUNT=Object.keys(ZONES).filter(z=>z!=='village');LAKES=M.lakes;LAVA=M.lava;PLATS=M.plats;PLAZA=M.plaza;HOUSES=M.houses;NPCS=M.npcs;ROADSEG=M.roadseg;
  EG=R.EG;blk=R.blk;reach=R.reach;statics=R.statics;terrain=R.terrain;groundCv=R.groundCv;miniBase=R.miniBase;npcList=R.npcList;mobs=R.mobs;G0=R.group;}
function roadD(x,y){let m=1e9;for(const s of ROADSEG){if(x<s.x0||x>s.x1||y<s.y0||y>s.y1)continue;const dx=s.bx-s.ax,dy=s.by-s.ay,l=dx*dx+dy*dy;const u=clamp(((x-s.ax)*dx+(y-s.ay)*dy)/l,0,1),d=Math.hypot(x-s.ax-u*dx,y-s.ay-u*dy);if(d<m)m=d;}return m;}
const ellE=(L,x,y)=>((x-L.x)/L.rx)**2+((y-L.y)/L.ry)**2;
const lakeMin=(x,y)=>{let m=1e9;for(const L of LAKES)m=Math.min(m,ellE(L,x,y));return m;};
function elevRaw(x,y){let e=(vnoise(x/170,y/170)-.5)*14+(vnoise(x/55+9,y/55+3)-.5)*4;
  for(const P of PLATS)e+=P.h*smooth(clamp((1.08-Math.hypot((x-P.x)/P.rx,(y-P.y)/P.ry))/.2,0,1));
  for(const L of LAKES){const dl=Math.sqrt(ellE(L,x,y));if(dl<1.6)e-=7*smooth(clamp((1.6-dl)/.6,0,1));}
  const vr=ZONES.village.r,vx=Math.max(vr[0]-x,0,x-vr[2]),vy=Math.max(vr[1]-y,0,y-vr[3]),fl=smooth(clamp(1-Math.hypot(vx,vy)/140,0,1));return e*(1-fl*.9);}
function elevAt(x,y){const fx=clamp(x/CELL,0,GW-.001),fy=clamp(y/CELL,0,GH-.001),i=fx|0,j=fy|0,ax=fx-i,ay=fy-j,k=j*(GW+1)+i;
  return (EG[k]*(1-ax)+EG[k+1]*ax)*(1-ay)+(EG[k+GW+1]*(1-ax)+EG[k+GW+2]*ax)*ay;}
const biomeAt=(x,y,j)=>M.biome(x,y,j);

/* ================= 렌더러 준비 ================= */
const stage=$('stage'),ov=$('ov'),og=ov.getContext('2d');
const rd=new T3.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
rd.shadowMap.enabled=true;rd.shadowMap.type=T3.PCFSoftShadowMap;
rd.domElement.id='gl';stage.insertBefore(rd.domElement,ov);{const rv=document.getElementById('riftV');if(rv)stage.insertBefore(rv,ov);}/* v4.39 보라 그늘은 3D 화면 위 · 이름표 아래 */
const scene=new T3.Scene(),cam=new T3.PerspectiveCamera(FOV,16/9,8,5000);
const HAZE=new T3.Color('#b9b0c4');scene.background=HAZE;scene.fog=new T3.Fog(HAZE,600,1600);
const amb=new T3.AmbientLight(0xfff0e0,.62),sun=new T3.DirectionalLight(0xfff0d8,.55);scene.add(amb,sun,sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);{const c=sun.shadow.camera;c.left=-430;c.right=430;c.top=430;c.bottom=-430;c.near=10;c.far=1800;}sun.shadow.bias=-.0015;sun.shadow.normalBias=.6;
const rt=new T3.WebGLRenderTarget(16,16,{minFilter:T3.LinearFilter,magFilter:T3.LinearFilter});
const POST_FS=`uniform sampler2D tD;uniform vec2 uRes;uniform float uFocus;uniform float uDof;uniform vec4 uGrade;uniform float uVig;uniform float uHurt;varying vec2 vUv;
vec3 soft(vec3 b,vec3 s){return mix(2.0*b*s+b*b*(1.0-2.0*s),sqrt(b)*(2.0*s-1.0)+2.0*b*(1.0-s),step(0.5,s));}
void main(){vec2 px=1.0/uRes;float d=vUv.y-uFocus;float bl=uDof*(smoothstep(0.12,0.46,d)*1.3+smoothstep(0.2,0.55,-d)*0.8);vec3 c=texture2D(tD,vUv).rgb;
 if(bl>0.05){vec3 acc=c;float w=1.0;for(int i=0;i<12;i++){float a=float(i)*2.39996;float r=sqrt(float(i)+0.5)/3.5;vec2 o=vec2(cos(a),sin(a))*r*bl*4.0*px*uRes.y/540.0;acc+=texture2D(tD,vUv+o).rgb;w+=1.0;}c=acc/w;}
 c=mix(c,soft(c,uGrade.rgb),uGrade.a);
 float v=smoothstep(0.34,0.98,length((vUv-vec2(0.5,0.48))*vec2(1.2,1.0)));c=mix(c,vec3(0.06,0.035,0.1),v*uVig);
 float hv=smoothstep(0.3,0.95,length((vUv-0.5)*vec2(1.1,1.0)));c=mix(c,vec3(0.86,0.1,0.08),hv*uHurt);gl_FragColor=vec4(c,1.0);}`;
const pscene=new T3.Scene(),pcam=new T3.OrthographicCamera(-1,1,1,-1,0,1);
const pmat=new T3.ShaderMaterial({uniforms:{tD:{value:rt.texture},uRes:{value:new T3.Vector2(16,16)},uFocus:{value:.45},uDof:{value:1},uGrade:{value:new T3.Vector4(1,.9,.78,.22)},uVig:{value:.55},uHurt:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',fragmentShader:POST_FS,depthTest:false,depthWrite:false});
pscene.add(new T3.Mesh(new T3.PlaneGeometry(2,2),pmat));
const TEX=new Map(),MATC=new Map(),DEPM=new Map(),ADDM=new Map();
function tex(img){let t=TEX.get(img);if(t)return t;t=new T3.CanvasTexture(img);t.magFilter=T3.NearestFilter;t.minFilter=T3.NearestFilter;t.generateMipmaps=false;TEX.set(img,t);return t;}
/* v4.8.3 가림 페이드: 캐릭터·몬스터 앞(화면에서 겹치고 월드에서 더 앞쪽)에 있는 나무·바위·집의 그 부분만 디더링으로 반투명하게.
   uFade[i] = (화면 x, 화면 y [렌더 픽셀, 아래가 0], 월드 y(깊이), 반지름 배율) — 매 프레임 updateFade()가 채운다. 캐릭터 실루엣(x-ray)은 쓰지 않는다. */
const FADE_N=8,FADE={uFade:{value:Array.from({length:FADE_N},()=>new T3.Vector4(0,0,0,0))},uFadeR:{value:new T3.Vector2(30,40)},uFadeK:{value:.62}};
function fadeMat(m){m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,FADE);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>','#include <project_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform vec4 uFade['+FADE_N+'];uniform vec2 uFadeR;uniform float uFadeK;\nfloat fdB2(vec2 a){a=floor(a);return fract(dot(a,vec2(.5,a.y*.75)));}\nfloat fdB4(vec2 a){return fdB2(.5*a)*.25+fdB2(a);}')
      .replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
      float fdA=0.;for(int i=0;i<${FADE_N};i++){vec4 c=uFade[i];if(c.w<=0.)continue;if(vWP.z<c.z+3.)continue;vec2 d=(gl_FragCoord.xy-c.xy)/(uFadeR*c.w);fdA=max(fdA,1.-smoothstep(.75,1.,length(d)));}
      if(fdA>0.&&fdB4(gl_FragCoord.xy*.5)<fdA*uFadeK)discard;`);};
  m.customProgramCacheKey=()=>'fade';return m;}
const MATF=new Map();function matOfF(img){let m=MATF.get(img);if(!m){m=fadeMat(new T3.MeshLambertMaterial({map:tex(img),alphaTest:.5,side:T3.DoubleSide}));MATF.set(img,m);}return m;}
function matOf(img){let m=MATC.get(img);if(!m){m=new T3.MeshLambertMaterial({map:tex(img),alphaTest:.5,side:T3.DoubleSide});MATC.set(img,m);}return m;}
function depthOf(img){let m=DEPM.get(img);if(!m){m=new T3.MeshDepthMaterial({depthPacking:T3.RGBADepthPacking,map:tex(img),alphaTest:.5,side:T3.DoubleSide});DEPM.set(img,m);}return m;}
function addOf(img,col){let mm=ADDM.get(img);if(!mm){mm=new Map();ADDM.set(img,mm);}let m=mm.get(col);if(!m){m=new T3.MeshBasicMaterial({map:tex(img),color:new T3.Color(col),transparent:true,blending:T3.AdditiveBlending,depthWrite:false,fog:false,side:T3.DoubleSide});mm.set(col,m);}return m;}
const SPN=[0,.8,.6];
const SPGEO=(()=>{const g=new T3.PlaneGeometry(1,1);g.translate(0,.5,0);const n=g.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,...SPN);return g;})();
const CGEO=new T3.PlaneGeometry(1,1);
const WGEO=(()=>{const g=new T3.PlaneGeometry(1,1);g.translate(.5,0,0);const n=g.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,...SPN);return g;})();
function spriteMesh(parent){const m=new T3.Mesh(SPGEO,matOf(STUMP));m.castShadow=true;(parent||scene).add(m);return m;}
/* v4.39 균열 몬스터는 보랏빛으로 물든 재질(이미지별 캐시) */const MATR=new Map();function matOfR(img){let m=MATR.get(img);if(!m){m=new T3.MeshLambertMaterial({map:tex(img),alphaTest:.5,side:T3.DoubleSide,color:new T3.Color('#c4a2ff'),emissive:new T3.Color('#3a1060')});MATR.set(img,m);}return m;}
function setSpr(m,img,x,y,sc=1,lift=0,tint){if(m.userData.img!==img||m.userData.tint!==!!tint){m.material=tint?matOfR(img):matOf(img);m.customDepthMaterial=depthOf(img);m.userData.img=img;m.userData.tint=!!tint;}m.scale.set(img.width*sc*(img.hk||1),img.height*sc*VS*(img.hk||1),1);/* v4.75: 새 몬스터 그림은 도트 밀도가 높다 → hk로 줄여 그린다 */m.position.set(x,elevAt(x,y)+lift,y);}

/* ================= 효과 ================= */
function cvs(w,h,fn){const c=mk(w,h),g=c.getContext('2d');fn(g,w,h);return c;}
const FX_DOT=cvs(16,16,(g)=>{const r=g.createRadialGradient(8,8,0,8,8,8);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.6)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,16,16);});
const FX_SLASH=cvs(48,32,(g)=>{for(let i=0;i<14;i++){const a0=-1.25+i*.02,a1=1.25-i*.02;g.strokeStyle=`rgba(255,${230-i*6},${180-i*8},${.08+i*.06})`;g.lineWidth=2.2-i*.1;g.beginPath();g.ellipse(10,16,30-i*.6,14-i*.4,0,a0,a1);g.stroke();}});
const FX_RING=cvs(64,64,(g)=>{g.strokeStyle='rgba(255,255,255,1)';g.lineWidth=5;g.beginPath();g.arc(32,32,27,0,6.283);g.stroke();g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=10;g.beginPath();g.arc(32,32,24,0,6.283);g.stroke();});
const FX_DISC=cvs(64,64,(g)=>{const r=g.createRadialGradient(32,32,4,32,32,32);r.addColorStop(0,'rgba(255,255,255,.25)');r.addColorStop(.85,'rgba(255,255,255,.55)');r.addColorStop(.97,'rgba(255,255,255,.95)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.beginPath();g.arc(32,32,32,0,6.283);g.fill();});
const FX_STAR=cvs(24,24,(g)=>{g.fillStyle='#fff';g.translate(12,12);for(let i=0;i<4;i++){g.rotate(Math.PI/4);g.fillRect(-1,-11,2,22);}g.fillRect(-3,-3,6,6);});
const DGEO=(()=>{const g=new T3.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);return g;})();
function decal(img,col,normal){const m=new T3.Mesh(DGEO,normal?new T3.MeshBasicMaterial({map:tex(img),color:new T3.Color(col),transparent:true,depthWrite:false,fog:false,opacity:.85}):addOf(img,col).clone());m.renderOrder=3;m.visible=false;scene.add(m);return m;}
const tgtRing=decal(FX_RING,'#ffd860'),moveRing=decal(FX_RING,'#a8f0ff'),shRing=decal(FX_RING,'#8ac8ff'),buffRing=decal(FX_RING,'#ff9a4a');
/* v4.47 예고 데칼 풀 (지시서 §G1): 원형 6 · 직선 4 · 부채꼴 2 — 예고마다 테두리 + 차오르는 채움 한 쌍. 가장 가까운 것부터 배정한다 */
const FX_BAR=cvs(64,64,(g)=>{g.fillStyle='rgba(255,255,255,.4)';g.fillRect(0,8,64,48);g.strokeStyle='#fff';g.lineWidth=5;g.strokeRect(2.5,8,59,48);});
const FX_FAN=cvs(64,64,(g)=>{const a=Math.PI/3;g.fillStyle='rgba(255,255,255,.4)';g.strokeStyle='#fff';g.lineWidth=4;g.beginPath();g.moveTo(32,32);g.arc(32,32,29,-a,a);g.closePath();g.fill();g.stroke();});
const TELE_N={circle:6,line:4,fan:2},TELE_POOL={};
for(const k in TELE_N){TELE_POOL[k]=[];for(let i=0;i<TELE_N[k];i++)TELE_POOL[k].push(k==='circle'?{o:decal(FX_RING,'#ff5030'),f:decal(FX_DISC,'#ff3a20',true)}:{o:decal(k==='line'?FX_BAR:FX_FAN,'#ff5030'),f:decal(k==='line'?FX_BAR:FX_FAN,'#ff3a20',true)});}
const parts=[];const PPOOL=[];
for(let i=0;i<260;i++){const m=new T3.Mesh(CGEO,addOf(FX_DOT,'#ffffff'));m.visible=false;m.renderOrder=4;scene.add(m);PPOOL.push(m);}
function spawnP(x,y,z,o){const m=PPOOL.find(m=>!m.visible);if(!m)return;m.visible=true;m.material=addOf(o.img||FX_DOT,o.col||'#ffffff');
  parts.push({m,x,y,z,vx:o.vx||0,vy:o.vy||0,vz:o.vz||0,g:o.g??0,life:0,max:o.life||.6,s0:o.size||4,s1:o.size1??0,rot:o.rot||0});}
function burst(x,y,z,col,n,sp=60,size=4){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=sp*(.4+Math.random()*.8);spawnP(x,y,z,{col,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6,vz:20+Math.random()*sp*.8,g:-140,life:.35+Math.random()*.35,size});}}
function tickParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life+=dt;if(p.life>=p.max){p.m.visible=false;parts.splice(i,1);continue;}
  p.vz+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;const k=p.life/p.max,s=p.s0+(p.s1-p.s0)*k;p.m.scale.set(s,s,1);p.m.rotation.z=p.rot*p.life;p.m.position.set(p.x,elevAt(p.x,p.y)+p.z,p.y+.5);}}
const fxq=[];
function fxMesh(img,col,o){const m=new T3.Mesh(o.geo||CGEO,addOf(img,col).clone());m.renderOrder=5;scene.add(m);fxq.push(Object.assign({m,life:0},o));return m;}
function tickFx(dt){for(let i=fxq.length-1;i>=0;i--){const f=fxq[i];f.life+=dt;const k=f.life/f.max;if(k>=1){scene.remove(f.m);f.m.material.dispose();fxq.splice(i,1);continue;}f.up(f.m,k,f);}}
function clearFx(){for(const p of parts)p.m.visible=false;parts.length=0;for(const f of fxq){scene.remove(f.m);f.m.material.dispose();}fxq.length=0;floats=[];bolts=[];}

/* ================= 상태 ================= */
const player={shield:0,shT:0,hitN:0,buffT:0,buffK:0,x:960,y:1700,dir:'down',face:1,moving:false,hp:100,mp:50,atkT:0,swing:0,cd:Array(10).fill(0),guardT:0,fervT:0,fervK:0,lastHit:-99,dead:false,dash:null,potT:0,hurt:0,fx:{}};
const timers=[];function later(sec,f){timers.push({at:t+sec,f});}
let bolts=[],inv=null,invNext=90;const shots=[];/* v4.49 몬스터 투사체 */
let target=null,auto=false,anchor=null,hunt=null,nav=null,chase=null,manualT=0,modal=null,started=false,zoom=1,camX=960,camY=1700,camE=0,t=0,floats=[],curZone='village',traveling=false;
const ci=(x,y)=>clamp(Math.floor(y/CELL),0,GH-1)*GW+clamp(Math.floor(x/CELL),0,GW-1);
function blockedAt(x,y){if(x<8||y<8||x>=WW-8||y>=WH-8)return true;return blk[ci(x,y)]===1;}
function markCircle(x,y,r){for(let cy=Math.floor((y-r)/CELL);cy<=Math.floor((y+r)/CELL);cy++)for(let cx=Math.floor((x-r)/CELL);cx<=Math.floor((x+r)/CELL);cx++){if(cx<0||cy<0||cx>=GW||cy>=GH)continue;if(Math.hypot(cx*CELL+4-x,(cy*CELL+4-y)*1.3)<=r)blk[cy*GW+cx]=1;}}
function markRect(x0,y0,x1,y1){for(let cy=Math.floor(y0/CELL);cy<=Math.floor(y1/CELL);cy++)for(let cx=Math.floor(x0/CELL);cx<=Math.floor(x1/CELL);cx++)if(cx>=0&&cy>=0&&cx<GW&&cy<GH)blk[cy*GW+cx]=1;}

/* ================= 세계 생성 (지역마다 한 번) ================= */
async function buildWorld(id,prog){bindMap(id);const R=M.rt;
  for(let j=0;j<=GH;j++)for(let i=0;i<=GW;i++)EG[j*(GW+1)+i]=elevRaw(i*CELL,j*CELL);
  const c=mk(WW,WH),g=c.getContext('2d'),img=g.createImageData(WW,WH),d=img.data;
  const DI=['#8f7150','#a2805a','#b18f66','#bf9e73'].map(hx),DIB=['#3a2e2a','#463830','#524236','#5e4a3c'].map(hx),WA=hx('#3a73a2'),WD=hx('#2c5f8e'),WL=hx('#6aa3cc'),SA=hx('#cbb586'),SAD=hx('#b59e70'),LV=hx('#e0601e'),LVD=hx('#a8341a'),CR=hx('#1c1414');
  const put=(i,col,k=1)=>{d[i]=col[0]*k;d[i+1]=col[1]*k;d[i+2]=col[2]*(k+(1-k)*.35);d[i+3]=255;};
  /* v4.46 전용 공간: bound가 있는 맵은 그 밖을 허공으로(땅 그림 · 풀 · 나무 · 통행 모두) */
  const BD=M.bound,VOID=hx(M.voidCol||'#161026'),edgeOf=BD?(x,y)=>Math.min(x-BD[0],BD[2]-x,y-BD[1],BD[3]-y):(x,y)=>Math.min(x,WW-x,y,WH-y);
  for(let y=0;y<WH;y++){if(y%96===0){prog(y/WH*.7);await new Promise(r=>setTimeout(r,0));}
    for(let x=0;x<WW;x++){const i=(y*WW+x)*4;if(BD&&edgeOf(x,y)<-46){put(i,VOID);continue;}const j=(vnoise(x/38,y/38)-.5)*60,edge=edgeOf(x,y);if(BD&&edge<-12-j*.3){put(i,VOID);continue;}const k=edge<140?1-(140-Math.max(edge,-30))/140*.45:1;
      let wet=false;for(const L of LAKES){const le=((x-L.x)/(L.rx+j*.3))**2+((y-L.y)/(L.ry+j*.2))**2;if(le<1){let col=le<.45?WD:WA;if(le>.9||hash2(x>>1,y)<.012)col=WL;put(i,col);wet=true;break;}if(le<1.24){put(i,hash2(x,y)<.3?SAD:SA);wet=true;break;}}
      if(wet)continue;
      let hot=false;for(const L of LAVA){const e=((x-L.x)/(L.rx+j*.08))**2+((y-L.y)/(L.ry+j*.05))**2;if(e<1){put(i,e<.5?LV:LVD);hot=true;break;}if(e<1.55){put(i,hash2(x,y)<.45?CR:BPAL[5][0]);hot=true;break;}}
      if(hot)continue;
      const b=biomeAt(x,y,j);
      if(roadD(x,y)<12+j*.06||Math.hypot(x-PLAZA.x,(y-PLAZA.y)*1.25)<100+j*.3){const n=vnoise(x/5,y/5)+(hash2(x,y)-.5)*.25;put(i,(b===5||b===7?DIB:DI)[clamp(Math.floor(n*4),0,3)],k);continue;}
      const n=vnoise(x/16,y/16)*.62+vnoise(x/5,y/5)*.38,lv=n*5.2-.6;let idx=Math.floor(lv);if(lv-idx>.5&&((x^y)&1))idx++;put(i,BPAL[b][clamp(idx,0,5)],k);}}
  const set=(x,y,col)=>{if(x<0||y<0||x>=WW||y>=WH)return;const i=(y*WW+x)*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];};
  const free=(x,y)=>lakeMin(x,y)>1.4&&roadD(x,y)>16&&Math.hypot(x-PLAZA.x,(y-PLAZA.y)*1.25)>106&&!LAVA.some(L=>ellE(L,x,y)<1.7);
  const r=rng(777+id.length),FL=['#f4f1e4','#f2cf55','#ef8fb0','#9fc3f0'].map(hx);
  for(let n=0;n<52000;n++){const x=2+Math.floor(r()*(WW-4)),y=2+Math.floor(r()*(WH-4));if(!free(x,y)||BD&&edgeOf(x,y)<4)continue;const b=biomeAt(x,y,0),P=BPAL[b];
    if(b===5){if(r()<.3){set(x,y,hx('#6a2216'));set(x+1,y,hx('#6a2216'));}else set(x,y,hx('#6a625e'));continue;}
    if(b===3||b===6){set(x,y,P[5]);set(x+1,y,P[4]);set(x,y+1,P[0]);continue;}
    if(b===7&&r()<.12){const col=r()<.5?hx('#8ad8ff'):hx('#c8a8ff');set(x,y,col);continue;}
    set(x,y,P[5]);set(x-1,y+1,P[1]);set(x+1,y+1,P[1]);set(x,y+1,P[0]);
    if((b===1||b===0||b===4)&&r()<.22){const col=FL[Math.floor(r()*4)];set(x+2,y-1,col);if(r()<.4)set(x+3,y-1,col);}}
  for(const L of LAKES)for(let n=0;n<60;n++){const a=r()*6.283,rr=.5+r()*.42,lx=Math.round(L.x+Math.cos(a)*L.rx*rr),ly=Math.round(L.y+Math.sin(a)*L.ry*rr);for(let yy=-2;yy<=2;yy++)for(let xx=-3;xx<=3;xx++)if(xx*xx/10+yy*yy/5<=1&&!(xx===1&&yy<=0))set(lx+xx,ly+yy,yy<0?hx('#76b257'):hx('#4e8a3c'));if(r()<.3)set(lx-1,ly-1,hx('#f8c0d8'));}
  g.putImageData(img,0,0);R.groundCv=groundCv=c;prog(.75);await new Promise(r=>setTimeout(r,0));
  const geo=new T3.PlaneGeometry(WW,WH,WW/16,WH/16);geo.rotateX(-Math.PI/2);geo.translate(WW/2,0,WH/2);
  const pos=geo.attributes.position;for(let i=0;i<pos.count;i++)pos.setY(i,elevAt(pos.getX(i),pos.getZ(i)));geo.computeVertexNormals();
  const gt=new T3.CanvasTexture(c);gt.magFilter=T3.NearestFilter;gt.minFilter=T3.LinearMipMapLinearFilter;gt.anisotropy=rd.capabilities.getMaxAnisotropy();
  R.terrain=terrain=new T3.Mesh(geo,new T3.MeshLambertMaterial({map:gt}));terrain.receiveShadow=true;G0.add(terrain);
  const skirt=new T3.Mesh(new T3.PlaneGeometry(WW+6000,WH+6000),new T3.MeshLambertMaterial({color:M.skirt||(id==='kardo'?0x4a4630:0x2a4424)}));skirt.rotation.x=-Math.PI/2;{let lo=1e9;for(let i=0;i<EG.length;i++)if(EG[i]<lo)lo=EG[i];/* 지형 최저점보다 아래 — 협곡(h −20)이 덮이던 버그 */skirt.position.set(WW/2,Math.min(-12,lo-6),WH/2);}G0.add(skirt);
  for(let cy=0;cy<GH;cy++)for(let cx=0;cx<GW;cx++){const x=cx*CELL+4,y=cy*CELL+4;if(x<26||y<26||x>WW-26||y>WH-26||BD&&edgeOf(x,y)<8||lakeMin(x,y)<1.06||LAVA.some(L=>ellE(L,x,y)<1.15))blk[cy*GW+cx]=1;}
  for(const h of HOUSES){buildHouse(h);markRect(h.x-4,h.base-h.d-6,h.x+h.w+4,h.base+1);}
  const stat=(img,x,y,o={})=>{statics.push({img,x,y,flat:o.flat,s:o.s||1});if(o.r)markCircle(x,y,o.r);};
  const ctx={markRect,stall:cols=>sprTable(46,10,10,'#9a6a40',{head:6,items:p=>{cols.forEach((c2,k)=>{const x=3+k*6+(k>3?3:0);p(x,-5,4,6,c2);p(x+1,-6,2,1,'#e8e4dc');p(x,-5,1,6,'#ffffff');});}})};
  M.decor(stat,ctx);stat(PORTALSPR,M.way.x,M.way.y,{r:12});
  const TS=M.trees(),eliteSpots=QUESTS.filter(q=>q.elite&&q.zone&&ZONES[q.zone]).map(q=>q.elite.x?[q.elite.x,q.elite.y]:ZONES[q.zone].c);
  const clearSpot=(x,y)=>{if(roadD(x,y)<28||inR(ZONES.village.r,x,y,34)||lakeMin(x,y)<1.5)return false;if(eliteSpots.some(([ex,ey])=>Math.hypot(x-ex,y-ey)<110))return false;
    if(LAVA.some(L=>ellE(L,x,y)<2.2))return false;for(const z of HUNT){const c2=ZONES[z].c;if(Math.hypot(x-c2[0],y-c2[1])<70)return false;}return true;};
  for(let gy=14;gy<WH;gy+=20)for(let gx=4;gx<WW;gx+=22){const x=Math.round(gx+(hash2(gx,gy)-.5)*16),y=Math.round(gy+(hash2(gy,gx)-.5)*10);
    if(!clearSpot(x,y))continue;const b=biomeAt(x,y,(vnoise(x/38,y/38)-.5)*60),edge=edgeOf(x,y);if(BD&&edge<0)continue;/* bound가 있는 맵(전용 공간)만 — 지역 맵은 v4.45와 한 그루도 다르지 않게 */
    let dens=M.dens(b,x,y);if(edge<80)dens=.92;else if(edge<130)dens=Math.max(dens,.4);
    if(hash2(gx*3+7,gy*5)<dens){const L=TS[b]||TS[0];stat(L[Math.floor(hash2(x,y)*L.length)],x,y,{r:6});}}
  for(const [n,ok,pick,rr] of M.scatter){let k=0;for(let i=0;i<n*40&&k<n;i++){const x=40+r()*(WW-80),y=40+r()*(WH-80);if(!clearSpot(x,y)||blockedAt(x,y))continue;const b=biomeAt(x,y,0);if(!ok(b))continue;const L=pick(b);stat(L[Math.floor(r()*L.length)],Math.round(x),Math.round(y),{r:rr});k++;}}
  const REED=typeof sprReed==='function'?sprReed(3):null;if(REED&&M.reeds)for(const L of LAKES)for(let i=0;i<70;i++){const a=r()*6.283,rr=1.1+r()*.16,x=L.x+Math.cos(a)*L.rx*rr,y=L.y+Math.sin(a)*L.ry*rr;if(roadD(x,y)>18)stat(REED,Math.round(x),Math.round(y));}
  buildStatics();prog(.9);
  const q=[ci(PLAZA.x,PLAZA.y+30)];reach[q[0]]=1;while(q.length){const c2=q.pop(),cx=c2%GW,cy=(c2/GW)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const n=ny*GW+nx;if(blk[n]||reach[n])continue;reach[n]=1;q.push(n);}}
  buildMini();makeNpcs();spawnMobs();R.built=true;}
function buildStatics(){const groups=new Map();for(const s of statics){const k=(s.flat?'f':'u');let m=groups.get(s.img);if(!m){m={u:[],f:[]};groups.set(s.img,m);}m[k].push(s);}
  for(const [img,gp] of groups){for(const kind of ['u','f']){const L=gp[kind];if(!L.length)continue;const n=L.length,P=new Float32Array(n*12),N=new Float32Array(n*12),U=new Float32Array(n*8),I=new Uint32Array(n*6);
      L.forEach((s,q)=>{const w=img.width*s.s,h=img.height*s.s,e=elevAt(s.x,s.y);let v;
        if(kind==='u')v=[[s.x-w/2,e+h*VS,s.y],[s.x+w/2,e+h*VS,s.y],[s.x+w/2,e,s.y],[s.x-w/2,e,s.y]];else v=[[s.x-w/2,e+.4,s.y-h/2],[s.x+w/2,e+.4,s.y-h/2],[s.x+w/2,e+.4,s.y+h/2],[s.x-w/2,e+.4,s.y+h/2]];
        v.forEach((p,k)=>{P.set(p,(q*4+k)*3);N.set(kind==='u'?SPN:[0,1,0],(q*4+k)*3);});U.set([0,1,1,1,1,0,0,0],q*8);I.set([q*4,q*4+3,q*4+2,q*4,q*4+2,q*4+1],q*6);});
      const geo=new T3.BufferGeometry();geo.setAttribute('position',new T3.BufferAttribute(P,3));geo.setAttribute('normal',new T3.BufferAttribute(N,3));geo.setAttribute('uv',new T3.BufferAttribute(U,2));geo.setIndex(new T3.BufferAttribute(I,1));
      const m=new T3.Mesh(geo,kind==='u'?matOfF(img):matOf(img));if(kind==='u'){m.castShadow=true;m.customDepthMaterial=depthOf(img);}else m.receiveShadow=true;m.frustumCulled=false;G0.add(m);}}}
function buildHouse(h){
  const o={w:h.w,rh:h.rh,fh:h.fh,wall:h.wall,roof:h.roof,door:h.door,windows:h.windows,bx:h.bx,sign:h.sign,chimney:h.chimney},full=makeBuilding(o),ovr=5,top=12;
  const fac=mk(h.w,h.fh);fac.getContext('2d').drawImage(full,ovr,top+h.rh+1,h.w,h.fh,0,0,h.w,h.fh);
  const roofT=mk(24,16);roofT.getContext('2d').drawImage(full,ovr+6,top+6,24,16,0,0,24,16);
  const side=mk(h.d,h.fh),sg=side.getContext('2d'),sp=painter(sg);sp(0,0,h.d,h.fh,shade(h.wall,-.12));for(let y=0;y<h.fh;y++)for(let x=0;x<h.d;x++)if(hash2(x*5+h.bx,y*3)<.07)sp(x,y,1,1,shade(h.wall,-.24));
  sp(0,0,h.d,3,'#4a3020');sp(0,h.fh-10,h.d,2,'#4a3020');sp(0,h.fh-7,h.d,7,'#5e5a54');for(let x=0;x<h.d;x+=7)sp(x,h.fh-6,6,2,'#7a756c');sp(0,0,3,h.fh-8,'#4a3020');sp(h.d-3,0,3,h.fh-8,'#4a3020');
  const wallM=fadeMat(new T3.MeshLambertMaterial({map:tex(side)})),facM=fadeMat(new T3.MeshLambertMaterial({map:tex(fac)}));
  const fhW=h.fh*VS,e=Math.min(elevAt(h.x,h.base),elevAt(h.x+h.w,h.base),elevAt(h.x,h.base-h.d),elevAt(h.x+h.w,h.base-h.d))-1;
  const body=new T3.Mesh(new T3.BoxGeometry(h.w,fhW,h.d),[wallM,wallM,wallM,wallM,facM,wallM]);body.position.set(h.x+h.w/2,e+fhW/2,h.base-h.d/2);body.castShadow=body.receiveShadow=true;G0.add(body);
  const rt2=tex(roofT).clone();rt2.needsUpdate=true;rt2.wrapS=rt2.wrapT=T3.RepeatWrapping;rt2.magFilter=rt2.minFilter=T3.NearestFilter;
  const ov2=6,x0=h.x-ov2,x1=h.x+h.w+ov2,yE=e+fhW,yR=yE+h.rh*VS*.95,zF=h.base+ov2,zB=h.base-h.d-ov2,zM=h.base-h.d/2,sl=Math.hypot(yR-yE,zF-zM),ur=(x1-x0)/24,vr=sl/16;
  const P=[x0,yE,zF,x1,yE,zF,x1,yR,zM,x0,yR,zM, x1,yE,zB,x0,yE,zB,x0,yR,zM,x1,yR,zM],UV=[0,0,ur,0,ur,vr,0,vr, 0,0,ur,0,ur,vr,0,vr];
  const rg=new T3.BufferGeometry();rg.setAttribute('position',new T3.Float32BufferAttribute(P,3));rg.setAttribute('uv',new T3.Float32BufferAttribute(UV,2));rg.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]);rg.computeVertexNormals();
  const roof=new T3.Mesh(rg,fadeMat(new T3.MeshLambertMaterial({map:rt2,side:T3.DoubleSide})));roof.castShadow=roof.receiveShadow=true;G0.add(roof);
  const gb=new T3.BufferGeometry();gb.setAttribute('position',new T3.Float32BufferAttribute([h.x,yE,h.base,h.x,yE,h.base-h.d,h.x,yR,zM, h.x+h.w,yE,h.base,h.x+h.w,yE,h.base-h.d,h.x+h.w,yR,zM],3));gb.computeVertexNormals();
  const gable=new T3.Mesh(gb,fadeMat(new T3.MeshLambertMaterial({color:new T3.Color(shade(h.wall,-.1)),side:T3.DoubleSide})));gable.castShadow=true;G0.add(gable);
  if(h.chimney){const ch=new T3.Mesh(new T3.BoxGeometry(9,22,9),fadeMat(new T3.MeshLambertMaterial({color:0x8b867f})));ch.position.set(x1-24,yR-2,zM-8);ch.castShadow=true;G0.add(ch);h.smoke={x:x1-24,y:zM-8,z:yR+10-e};}}
const mini=$('mini'),mg=mini.getContext('2d');
function buildMini(){const c=mk(192,192),g=c.getContext('2d'),V=M.mini;g.imageSmoothingEnabled=true;if(V){g.drawImage(groundCv,V.x,V.y,V.w,V.w,0,0,192,192);const k=WW/V.w;g.setTransform(k,0,0,k,-V.x/10*k,-V.y/10*k);}else g.drawImage(groundCv,0,0,192,192);g.fillStyle='rgba(20,40,20,.35)';
  for(const s of statics)if(s.img.height>40)g.fillRect(s.x/10-1,s.y/10-1,2,2);g.fillStyle='#6a4d8c';for(const h of HOUSES)g.fillRect(h.x/10,(h.base-h.d)/10,h.w/10,h.d/10);g.fillStyle='#b8a0ff';g.fillRect(M.way.x/10-2,M.way.y/10-3,4,5);M.rt.miniBase=miniBase=c;}

/* ================= 길찾기 (A*) ================= */
const gS=new Float32Array(GW*GH),fS=new Float32Array(GW*GH),par=new Int32Array(GW*GH),stamp=new Uint32Array(GW*GH),closed=new Uint32Array(GW*GH);let stampN=0;
const DX=[1,-1,0,0,1,1,-1,-1],DY=[0,0,1,-1,1,-1,1,-1];
function nearFree(x,y){let c=ci(x,y);if(!blk[c]&&reach[c])return c;const cx=c%GW,cy=(c/GW)|0;for(let r=1;r<14;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.abs(dx)!==r&&Math.abs(dy)!==r)continue;const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const n=ny*GW+nx;if(!blk[n]&&reach[n])return n;}return -1;}
function los(ax,ay,bx,by){const d=Math.hypot(bx-ax,by-ay),n=Math.ceil(d/4),px=-(by-ay)/(d||1)*4,py=(bx-ax)/(d||1)*4;for(let i=1;i<=n;i++){const x=ax+(bx-ax)*i/n,y=ay+(by-ay)*i/n;if(blockedAt(x,y)||blockedAt(x+px,y+py)||blockedAt(x-px,y-py))return false;}return true;}
function findPath(sx,sy,tx,ty){const s=nearFree(sx,sy),g=nearFree(tx,ty);if(s<0||g<0)return null;if(s===g)return [{x:tx,y:ty}];stampN++;const open=[];
  const push=i=>{open.push(i);let k=open.length-1;while(k>0){const p=(k-1)>>1;if(fS[open[p]]<=fS[open[k]])break;const tmp=open[p];open[p]=open[k];open[k]=tmp;k=p;}};
  const pop=()=>{const top=open[0],last=open.pop();if(open.length){open[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<open.length&&fS[open[l]]<fS[open[m]])m=l;if(r<open.length&&fS[open[r]]<fS[open[m]])m=r;if(m===k)break;const tmp=open[m];open[m]=open[k];open[k]=tmp;k=m;}}return top;};
  const gx=g%GW,gy=(g/GW)|0,hh=i=>{const dx=Math.abs(i%GW-gx),dy=Math.abs(((i/GW)|0)-gy);return dx+dy-.5858*Math.min(dx,dy);};
  gS[s]=0;stamp[s]=stampN;fS[s]=hh(s);par[s]=-1;push(s);let it=0;
  while(open.length&&it<70000){it++;const c=pop();if(closed[c]===stampN)continue;closed[c]=stampN;if(c===g)break;const cx=c%GW,cy=(c/GW)|0;
    for(let k=0;k<8;k++){const dx=DX[k],dy=DY[k],nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const n=ny*GW+nx;if(blk[n]||closed[n]===stampN)continue;if(dx&&dy&&(blk[cy*GW+nx]||blk[ny*GW+cx]))continue;
      const ng=gS[c]+(dx&&dy?1.4142:1);if(stamp[n]!==stampN||ng<gS[n]){stamp[n]=stampN;gS[n]=ng;fS[n]=ng+hh(n);par[n]=c;push(n);}}}
  if(closed[g]!==stampN)return null;const cells=[];for(let c=g;c!==-1;c=par[c])cells.push(c);cells.reverse();
  const pts=cells.map(c=>({x:(c%GW)*CELL+4,y:((c/GW)|0)*CELL+4}));pts[pts.length-1]=blockedAt(tx,ty)?pts[pts.length-1]:{x:tx,y:ty};
  const out=[];let cx=sx,cy=sy,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!los(cx,cy,pts[j].x,pts[j].y))j--;out.push(pts[j]);cx=pts[j].x;cy=pts[j].y;i=j+1;}return out;}

/* ================= 엔티티 ================= */
const XRAY=new Map();function xrayOf(img){let m=XRAY.get(img);if(!m){m=new T3.MeshBasicMaterial({map:tex(img),alphaTest:.5,color:new T3.Color('#a8ccff'),transparent:true,opacity:.62,depthFunc:T3.GreaterDepth,depthWrite:false,fog:false,side:T3.DoubleSide});XRAY.set(img,m);}return m;}
const pX=new T3.Mesh(SPGEO,xrayOf(STUMP));pX.renderOrder=6;scene.add(pX);
/* 사망 표시: 묘지 십자가 (픽셀아트) */
const GRAVE=(()=>{const W=18,H=26,c=mk(W,H),g=c.getContext('2d');const px=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const O='#2a2230',S='#a9a4b4',L='#d4d0dc',D='#77708a';
  px(1,19,16,7,O);px(2,20,14,5,'#6b4a32');px(3,20,12,2,'#8a6444');px(4,23,3,1,'#4f3524');px(11,22,3,1,'#4f3524');
  px(6,1,6,20,O);px(1,6,16,6,O);px(7,2,4,18,S);px(2,7,14,4,S);px(7,2,1,18,L);px(2,7,14,1,L);px(10,3,1,17,D);px(3,10,13,1,D);
  px(8,8,2,2,D);px(7,20,4,1,D);return c;})();
const pMesh=spriteMesh(),graveMesh=spriteMesh(),graveMesh2=spriteMesh(),wMesh=new T3.Mesh(WGEO,matOf(STUMP));wMesh.castShadow=true;wMesh.visible=false;scene.add(wMesh);
function makeNpcs(){for(const id in NPCS){const n=NPCS[id];npcList.push({id,x:n.x,y:n.y,m:spriteMesh(G0),seed:Math.random()*9});markCircle(n.x,n.y,6);}
  npcList.push({id:'way',way:true,x:M.way.x,y:M.way.y+2});
  for(const dd of M.deco)npcList.push({id:dd.id,x:dd.x,y:dd.y,hx:dd.x,hy:dd.y,m:spriteMesh(G0),seed:Math.random()*9,deco:true,dir:'down',walk:0,next:0});}
let uid=0;
function makeMob(sp,lv,hx,hy,zone,isBoss,o={}){const st=mobStats(lv,isBoss);if(o.hpMul)st.hp=Math.round(st.hp/6*o.hpMul);const m=Object.assign({id:++uid,sp,lv,zone,home:{x:hx,y:hy},x:hx,y:hy,hp:st.hp,max:st.hp,atk:st.atk,def:st.def,xp:st.xp,gold:st.gold,
  boss:!!isBoss,fa:ZFAITH[zone]||0,sc:isBoss?2.3:1,face:Math.random()<.5?1:-1,phase:Math.random()*4,next:rand(1,4),aggro:false,ret:false,atkT:rand(.5,1.5),wind:0,hit:0,dead:false,deadT:0,respawn:0,mv:null,mesh:spriteMesh(G0),name:SPECIES[sp].name,aoe:null,aoeT:5},o.ext||{});if(mobBeh(m)==='ranged'){m.hp=m.max=Math.max(1,Math.round(m.max*RANGED.hpK));}mobs.push(m);return m;}
function spawnMobs(){const r=rng(4242+MAPID.length*7),es=QUESTS.filter(q=>q.elite&&q.zone&&ZONES[q.zone]).map(q=>q.elite.x?[q.elite.x,q.elite.y]:ZONES[q.zone].c);
  for(const z of HUNT){const Z=ZONES[z],homes=[];for(const [sp,l0,l1,n] of Z.mobs){let k=0;for(let i=0;i<n*80&&k<n;i++){const x=Z.r[0]+30+r()*(Z.r[2]-Z.r[0]-60),y=Z.r[1]+30+r()*(Z.r[3]-Z.r[1]-60),c=ci(x,y);
      if(blk[c]||!reach[c]||homes.some(h=>Math.hypot(h.x-x,h.y-y)<30)||es.some(([ex,ey])=>Math.hypot(x-ex,y-ey)<100)||roadD(x,y)<10)continue;homes.push({x,y});makeMob(sp,l0+Math.floor(r()*(l1-l0+1)),Math.round(x),Math.round(y),z);k++;}}}}
const alive=m=>m&&!m.dead;
/* 관문 정예: 조건을 채운 뒤에만 나타난다 */
function eliteOf(q){return mobs.find(m=>m.eliteOf===q.id);}
function spawnElite(q){if(!q.elite||qMap(q)!==MAPID)return null;let m=eliteOf(q);if(m){if(m.dead&&S.qs==='active'){m.dead=false;m.hp=m.max;m.x=m.home.x;m.y=m.home.y;m.mesh.visible=true;}return m;}
  const [x,y]=q.elite.x?[q.elite.x,q.elite.y]:ZONES[q.zone].c,E=q.elite;m=makeMob(E.sp,E.lv,x,y,q.zone,true,{hpMul:E.hpMul,ext:{sc:E.sc,name:E.name,eliteOf:q.id,fa:E.fa||0}});
  banner('관문 정예 출현',ZONES[q.zone].name+' · '+E.name+(E.fa?' · 권장 신앙 '+E.fa:''));return m;}
/* v4.10 지역 보스: 관문을 넘긴 정예는 그 지역의 필드 보스로 남아 FIELD_RESP초마다 다시 나타난다 (먼저 공격하지 않고 · 자동 사냥 대상에서 빠짐) */
const fieldBossQs=()=>QUESTS.filter((q,i)=>q.elite&&i<S.qi&&qMap(q)===MAPID);
/* v4.19 필드 보스판은 관문 때보다 강하다 — 다음 관문 앞 '지역 보스 토벌' 메인이 성장 확인이 되도록 */
/* v4.23 레벨 곡선을 낮추며 Lv+3 → +1: 플레이어가 사냥터 상한 레벨이 되자 +3 보스판에서 물약이 바닥나 사망(봇 3판 중 1판) */
const FB_UP={lv:1,hp:1.4};
function fieldUp(m,E){const L=E.lv+FB_UP.lv,st=mobStats(L,true);Object.assign(m,{lv:L,max:Math.round(st.hp/6*E.hpMul*FB_UP.hp),atk:st.atk,def:st.def,xp:st.xp,gold:st.gold});m.hp=m.max;}
function ensureFieldBosses(){if(!mobs||!started)return;for(const q of fieldBossQs()){let m=eliteOf(q);const E=q.elite;
    if(!m){const [x,y]=E.x?[E.x,E.y]:ZONES[q.zone].c;m=makeMob(E.sp,E.lv,x,y,q.zone,true,{hpMul:E.hpMul,ext:{sc:E.sc,name:E.name,eliteOf:q.id,fa:E.fa||0,field:true}});fieldUp(m,E);}
    if(!m.field){m.field=true;const d=m.dead;fieldUp(m,E);if(d){m.hp=0;m.respawn=FIELD_RESP;m.deadT=0;}}}}
const fieldBossInfo=()=>fieldBossQs().map(q=>eliteOf(q)).filter(Boolean);

/* ================= 표시 ================= */
function toast(msg,ok){msg=kTxt(msg);const el=document.createElement('div');el.className='toast'+(ok?' ok':'');el.textContent=msg;const box=$('toasts');box.appendChild(el);while(box.children.length>3)box.firstChild.remove();setTimeout(()=>el.remove(),2700);}
function banner(a,b,lv){const el=$('banner');$('banT').textContent=kTxt(a);$('banS').textContent=kTxt(b||'');el.className='banner'+(lv?' lv':'');void el.offsetWidth;el.classList.add('show');}
function floatTxt(x,y,txt,col,big){floats.push({x,y,up:30,txt,col,big,life:0,dx:rand(-6,6)});if(floats.length>60)floats.shift();}

/* ================= 성장 ================= */
function gainGod(k){S.gods=S.gods||{};if(S.gods[k])return;S.gods[k]=true;const G=GODS[k];banner('권능 획득',G.name+' · '+G.title,true);burst(player.x,player.y,18,G.col,40,100,5);
  if(!S.god){S.god=k;player.hitN=0;player.shield=0;player.shT=0;toast(G.name+'의 권능을 장착했다 · 권능 창(P)에서 바꾸고 각성',true);}else toast(G.name+'의 권능을 얻었다 · 권능 창(P)에서 바꿀 수 있다',true);lastQKey='';}
function openTrials(){let n=0;for(const id of TRIALS)if(!S.sq[id]&&!hasGod(SUBQ[id].trial)){S.sq[id]={st:'avail',n:0};n++;}lastQKey='';if(!n)return false;save();toast(TRIALS.some(trialReady)?'신의 시련이 열렸다 · 퀘스트의 [시련] 탭에서 골라 받자':'신의 시련은 Lv '+Math.min(...TRIALS.map(id=>SUBQ[id].lv))+'부터 받을 수 있다 · 퀘스트 [시련] 탭',true);return false;}
/* 레벨이 올라 새 시련이 열리면 (진행 중인 시련이 없을 때) 고르라고 묻는다 */
function trialLvCheck(prev){const nw=TRIALS.filter(id=>subSt(id)==='avail'&&SUBQ[id].lv>prev&&SUBQ[id].lv<=S.lv);if(!nw.length)return;lastQKey='';toast('새 신의 시련이 열렸다 · '+nw.map(id=>GODS[SUBQ[id].trial].name).join(' · ')+' — 퀘스트 [시련] 탭',true);}
/* 신의 시련 선택 창 (v4.8.5): 자동 진행 중이어도 자동으로 고르지 않는다(autoBtn 없음). 자동 진행은 modal이 열려 있는 동안 멈춰 있다가,
   플레이어가 시련을 고르거나 '나중에'를 누르면 이어서 진행한다(고른 시련 → 메인 순). 시련을 하나 깰 때마다 남은 시련이 있으면 다시 묻는다. */
function chooseTrial(first){const L=TRIALS.filter(id=>(S.sq[id]||{}).st==='avail'&&trialReady(id));if(!L.length||player.dead)return false;
  const body=el('div','shop');
  for(const id of L){const sq=SUBQ[id],G=GODS[sq.trial],d=el('div','si'),ic=el('span','wpic',G.ski);ic.style.cssText='display:grid;place-items:center;font-size:1.8em;color:'+G.col;d.appendChild(ic);
    const nm=el('div','nm');nm.append(el('b',null,G.name+' · '+G.title),el('small',null,G.desc(1)),el('small',null,'시련 · '+qGoal(sq,0)+' · '+ZALL[sq.zone].name+' Lv '+ZALL[sq.zone].lv));d.appendChild(nm);
    const b=el('button','btn pri','이 시련 받기');b.type='button';b.onclick=()=>{toast(G.name+'의 시련을 골랐다',true);acceptSub(id);};d.appendChild(b);body.appendChild(d);}
  openModal({who:'orvin',npc:null,name:first?'신의 시련이 열렸다':'다음 신의 시련',sub:'권능을 얻을 시련을 고르세요'+(S.autoQ?' · 고르면 자동 진행이 이어집니다':''),
    text:first?'신들이 자네를 지켜보고 있네. 시련 하나를 이겨 낼 때마다 그 신의 권능을 내려 줄 걸세.\n어느 신의 시련부터 받겠나?':'다른 신들도 자네를 기다리고 있네. 다음은 어느 시련을 받겠나?',
    body,btns:[{t:'나중에 · 메인 퀘스트 계속',alt:true,f:()=>{closeModal();toast('신의 시련은 장로 오르빈 · 권능 창(P)에서 언제든 받을 수 있다');if(S.autoQ)later(.5,autoGo);}}],noFocus:true});return true;}
function gainXp(n){if(S.lv>=LV_MAX)return;S.xp+=n;let up=0;const lv0=S.lv;while(S.lv<LV_MAX&&S.xp>=need(S.lv)){S.xp-=need(S.lv);S.lv++;up++;}
  if(up){S.sp+=3*up;S.kp+=up;const st=pStats();player.hp=st.hp;player.mp=st.mp;banner('LEVEL UP','Lv '+S.lv+' · 능력치 +'+3*up+' · 스킬 포인트 +'+up,true);
    for(let i=0;i<40;i++){const a=i/40*6.283;spawnP(player.x+Math.cos(a)*14,player.y+Math.sin(a)*8,2,{col:i%2?'#ffe08a':'#d8b8ff',vz:60+Math.random()*60,g:-20,life:1.1,size:5,size1:1});}
    SK.forEach((s,i)=>{if(s.req===S.lv&&tierOpen(s.tier))toast((s.book&&!S.books[s.id]?'스킬서가 있으면 배울 수 있다: ':'새 스킬을 배울 수 있다: ')+s.name,true);});
    for(const n of [2,3])if(S.lv===SK_TIER[n].lv&&tierOpen(n))banner(SK_TIER[n].n+' 스킬 개방',SK_TIER[n].area+' · 스킬 수련 창(K)',true);
    if(S.autoGrow)autoGrowNow();else if(S.lv<=3)toast('능력치(C)와 스킬(K)을 올리자');trialLvCheck(lv0);if(lv0<REP.lv&&S.lv>=REP.lv)toast('경비대장의 토벌 의뢰가 열렸다 · 반복해서 받을 수 있다',true);save();}}
const REC=['str','vit','dex','str','int'];
/* 자동 성장: 능력치 분배 → 가방의 스킬서 사용 → 스킬 습득·강화(관문 조건 우선) → 슬롯 정리 → (설정) 더 좋은 장비 장착 */
const SK_PRI=['roar','ferv','guard','quake','flame','combo','drain','star','dash','whirl'];
/* 측정용(v4.82 G2-b): window.__statPolicy(S.st)가 있으면 그 함수가 고른 능력치에 넣는다 — tests/growth_sim.py의 STAT_POLICY(5빌드 비교)만 쓴다. 게임에서는 늘 REC 순환(G2-c에서 순서표로 바꾼다) */
function autoGrowNow(){let n=0;while(S.sp>0){const pk=window.__statPolicy&&window.__statPolicy(S.st),k=Object.prototype.hasOwnProperty.call(STATS,pk)?pk:REC[(S.st.str+S.st.vit+S.st.dex+S.st.int)%REC.length];S.st[k]++;S.sp--;n++;}
  for(const k of ['book_dash','book_roar','book_quake'])if(cnt(k)>0)useBook(k,true);
  const q=curQ(),want=q.gate&&S.qs==='active'?q.gate.skills:{};let guard=0;
  while(S.kp>0&&guard++<60){let pick=-1;for(const id in want){const i=skIdx(id);if(skLv(i)<want[id]&&canLearn(i)){pick=i;break;}}
    if(pick<0)for(const id of SK_PRI){const i=skIdx(id);if(skLv(i)===0&&canLearn(i)){pick=i;break;}}
    if(pick<0){let best=-1;for(const id of SK_PRI){const i=skIdx(id);if(canLearn(i)&&(best<0||skLv(i)<skLv(best)))best=i;}pick=best;}
    if(pick<0)break;learnSkill(pick,true);}
  autoSlots();if(S.cfg.autoEq)autoEquipAll();
  if(n)player.hp=Math.min(pStats().hp,player.hp);}
/* 슬롯: 빈 칸을 채우고, 가득 차면 우선순위가 가장 낮은 스킬을 더 높은 스킬로 바꾼다 */
function autoSlots(){const learned=SK_PRI.filter(id=>(S.sk[id]||0)>0);for(const id of learned){if(S.slots.includes(id))continue;const e=S.slots.indexOf(null);if(e>=0){S.slots[e]=id;continue;}
    let worst=-1,wp=-1;S.slots.forEach((sid,j)=>{const p=SK_PRI.indexOf(sid);if(p>wp){wp=p;worst=j;}});if(wp>SK_PRI.indexOf(id))S.slots[worst]=id;}}
/* v4.22 일괄 장착: 부위마다 전투력 점수가 가장 높은 장비를 낀다(반지는 두 칸). 좋은 것부터 넣어 반지 두 칸도 최선이 된다 */
function equipCands(){return S.items.filter(it=>!isEq(it)&&it.k&&targetSlot(it)).sort((a,b)=>cpScore(b)-cpScore(a));}
function autoEquipAll(){const done=[];for(const it of equipCands()){if(isEq(it))continue;const s=targetSlot(it),cur=S.eq[s]&&itemById(S.eq[s]);if((!cur||cpScore(it)>cpScore(cur))&&equipItem(it.u,true))done.push(it);}return done;}
function equipBetterN(){let n=0;const used={};for(const it of equipCands()){const s=it.k==='ring'?null:it.k;if(s){const cur=S.eq[s]&&itemById(S.eq[s]),best=used[s];if(!best&&(!cur||cpScore(it)>cpScore(cur))){used[s]=it;n++;}}}
  const rings=[S.eq.ring1,S.eq.ring2].map(u=>u&&itemById(u)),cand=S.items.filter(it=>it.k==='ring'&&!isEq(it)).map(cpScore).sort((a,b)=>b-a),cur=rings.map(cpScore).sort((a,b)=>a-b);for(let i=0;i<2&&i<cand.length;i++)if(cand[i]>cur[i])n++;return n;}
function batchEquip(){const cp0=cpOf(),L=autoEquipAll();if(!L.length){toast('지금보다 좋은 장비가 없다');return L;}
  toast('일괄 장착 '+L.length+'개 · 전투력 '+fmt(cp0)+' → '+fmt(cpOf()),true);burst(player.x,player.y,12,'#ffe08a',24,70,3);return L;}
/* v4.17 스킬 레드닷: 배우기·강화 가능하거나, 스킬서를 쓸 수 있는 스킬 */
function skCan(i){const s=SK[i];return canLearn(i)||!!(s.book&&!S.books[s.id]&&cnt('book_'+s.id)>0&&tierOpen(s.tier));}
function canLearn(i){const s=SK[i],k=skLv(i)+1;return k<=SK_MAX&&S.kp>0&&tierOpen(s.tier)&&S.lv>=skNeedLv(i,k)&&(!s.book||S.books[s.id]);}
function learnSkill(i,silent){if(!canLearn(i))return false;S.kp--;S.sk[SK[i].id]=skLv(i)+1;
  if(skLv(i)===1&&!S.slots.includes(SK[i].id)){const e=S.slots.indexOf(null);if(e>=0){S.slots[e]=SK[i].id;if(!silent)toast(SK[i].name+' 습득 · 슬롯 '+(e+1)+'에 장착',true);}else if(!silent)toast(SK[i].name+' 습득 · 슬롯이 가득 찼다 — 스킬 창(K)에서 바꿔 끼우자',true);}
  else if(!silent)toast(SK[i].name+' Lv '+skLv(i),true);lastQKey='';return true;}
/* 스킬서 사용 → 해당 스킬을 배울 수 있게 됨 */
/* v4.77 스킬 일괄 강화: 쓸 수 있는 스킬서 먼저 → 포인트가 남는 동안 레벨이 낮은 스킬부터(같으면 슬롯에 낀 스킬 먼저) 한 단계씩 */
function skBatchN(){let kp=S.kp,n=0;const lv=SK.map((s,i)=>skLv(i)),bk=new Set(STK_ORDER.filter(k=>STK[k]&&STK[k].book&&cnt(k)>0&&!S.books[STK[k].book]&&tierOpen(SK[skIdx(STK[k].book)].tier)).map(k=>STK[k].book));
  n+=bk.size;while(kp>0){let best=-1;for(let i=0;i<SK.length;i++){const s=SK[i],k=lv[i]+1;if(k>SK_MAX||!tierOpen(s.tier)||S.lv<skNeedLv(i,k)||(s.book&&!S.books[s.id]&&!bk.has(s.id)))continue;
    const sl=x=>S.slots.includes(SK[x].id)?0:1;if(best<0||lv[i]<lv[best]||(lv[i]===lv[best]&&sl(i)<sl(best)))best=i;}
    if(best<0)break;lv[best]++;kp--;n++;}return n;}
function skBatch(){const before=SK.map((s,i)=>skLv(i));let books=0;
  for(const k of STK_ORDER)if(STK[k]&&STK[k].book&&cnt(k)>0&&!S.books[STK[k].book]&&tierOpen(SK[skIdx(STK[k].book)].tier)&&useBook(k,true))books++;
  let n=0;while(S.kp>0){let best=-1;for(let i=0;i<SK.length;i++){if(!canLearn(i))continue;const a=S.slots.includes(SK[i].id)?0:1,b=best<0?9:S.slots.includes(SK[best].id)?0:1;if(best<0||skLv(i)<skLv(best)||(skLv(i)===skLv(best)&&a<b))best=i;}
    if(best<0||!learnSkill(best,true))break;n++;}
  const ch=SK.map((s,i)=>[s,before[i],skLv(i)]).filter(x=>x[2]>x[1]);
  if(!n&&!books){toast('지금 강화할 수 있는 스킬이 없다');return 0;}
  toast('일괄 강화 · '+(books?'스킬서 '+books+'권 · ':'')+ch.map(([s,a,b])=>s.name+' '+(a?'Lv '+a+'→'+b:'습득'+(b>1?' Lv '+b:''))).join(' · '),true);save();lastQKey='';return n+books;}
function useBook(k,silent){const id=STK[k].book;if(!cnt(k))return false;if(S.books[id]){if(!silent)toast('이미 익힌 스킬서다');return false;}setCnt(k,cnt(k)-1);S.books[id]=true;if(!silent)toast('스킬서 사용 · '+SK[skIdx(id)].name+'을(를) 배울 수 있다 (K)',true);lastQKey='';save();return true;}

/* ================= 전투 ================= */
/* 침공 보스는 직접 노린 경우에만 피해 — 사냥 중 범위 스킬로 실수로 끌어오지 않게 */
const invShielded=m=>(m.inv||m.field)&&!m.aggro&&target!==m&&!(hunt&&hunt.mob===m)&&!(chase===m);
function hurtMob(m,dmg,crit,col){if(!alive(m)||invShielded(m))return;const fk=faithOut(m);if(fk<1){dmg*=fk;toastThr('신앙 부족 '+pStats(null,true).faith+' / '+m.fa+' · 주는 피해 '+Math.round(fk*100)+'% · 받는 피해 +'+Math.round((faithIn(m)-1)*100)+'%');}if(m.stag>t)dmg*=CHARGE.stagK;/* v4.54 돌진 빗나감 경직 중 받는 피해 +30% */if(m.bst)dmg*=(mobB(m)||{}).dk||BURST.dk;/* v4.59 부풀기 중 받는 피해 ×dk — 남은 체력 25%가 0.6초 안에 깎여 폭발이 한 번도 안 나던 것 */m.hp-=dmg;m.hit=.16;m.aggro=true;m.ret=false;m.evd=false;m.evU=0;floatTxt(m.x,m.y,(crit?'치명 ':'')+Math.round(dmg),col||(crit?'#ffe066':'#fff4dc'),crit);
  burst(m.x,m.y,12*m.sc,crit?'#ffe08a':'#fff0d0',crit?10:5,50);if(m.hp<=0)killMob(m);}
function playerHit(m,mul,skill){player.lastAtk=t;if(!skill&&player.tbNx){player.tbNx=0;mul*=1+tbVal('next');STAT.tbNx=(STAT.tbNx||0)+1;}/* v4.80 지력 30 */const st=pStats(),crit=Math.random()<st.crit,d=calcDmg(st.atk,mul*(crit?st.critM:1)*(skill?st.skm:1),m.def*(1-tbVal('pen')),S.lv,m.lv);if(crit&&tbVal('critAs'))player.tbCritT=t+3;/* v4.80 힘 10 · 45 방어 관통 · 민첩 30 */if(!alive(m)||invShielded(m))return 0;const gk=guardOn(m)?(skill?GUARD.skK:GUARD.baK):1;/* v4.58 방어 태세: 평타 −70% · 스킬 −30% */if(gk<1){STAT.guardHit=(STAT.guardHit||0)+1;if(Math.random()<.35)floatTxt(m.x,m.y-4,'막음','#9ac8ff');}hurtMob(m,d*gk,crit);return d*gk;}
/* 무게 82% 이상: 공격·스킬 불가 (리니지) */
const tooHeavy=()=>wPct()>=.82;
function heavyBlock(silent){if(!tooHeavy())return false;if(!silent)toastThr('무게 '+Math.round(wPct()*100)+'% · 82% 이상이면 공격할 수 없다 — 가방(I)에서 분해하자');return true;}
function killMob(m){m.gburn=null;gfxKill(m);if(tbVal('killAtk'))player.tbKillT=t+3;/* v4.80 힘 30 */if(m.bst){m.bst=null;STAT.bstKill=(STAT.bstKill||0)+1;}/* v4.59 부풀기 중 처치 → 폭발 없음 */m.dead=true;m.deadT=0;m.hp=0;m.respawn=m.field?FIELD_RESP:m.boss||m.riftBoss?1e9:m.rift?riftResp():9;if(m.sumOf){m.respawn=1e9;m.gone=true;}if(m.wave)m.respawn=1e9;/* v4.83 방어 웨이브 몬스터 */if(m.boss)bpDismiss(m);/* v4.69 졸개는 다시 나오지 않음 · 보스가 쓰러지면 졸개도 사라짐 */const inRift=riftHas(m);if(target===m)target=null;if(chase===m)chase=null;S.kills++;m.aoe=null;m.bp=null;
  if(Math.random()<(inRift?RIFT.stoneP:STONE_P)||m.boss){const n0=S.stone;const n=m.boss?(m.inv||m.field?3:6):Math.ceil(tierOfLv(m.lv)/2);S.stone+=n;if(inRift)rift.stone+=S.stone-n0;floatTxt(m.x,m.y-14,'+강화석 '+n,'#9ee6ff');}
  dropFrom(m);if(inRift)riftLoot(m);
  if(m.boss){const sh=m.inv?20:m.field?5:15;S.shard+=sh;floatTxt(m.x,m.y-22,'+권능 파편 '+sh,'#ffe08a');if(m.inv){toast('침공 보스 토벌! 권능 파편 +'+sh+' · 강화석 +3',true);inv=null;invNext=t+INV.every;lastQKey='';}}
  const gx=Math.round(m.xp*xpGapF(m.lv));gainXp(gx);STAT.killXp=(STAT.killXp||0)+gx;S.gold+=m.gold;STAT.killG+=m.gold;floatTxt(m.x,m.y-6,'+'+gx+' EXP',gx<m.xp?'#a89cc0':'#d8b8ff');floatTxt(player.x,player.y,'+'+m.gold+' G','#ffd76a');
  for(let i=0;i<6;i++)spawnP(m.x,m.y,8,{col:'#ffd860',vx:rand(-30,30),vy:rand(-20,20),vz:rand(60,110),g:-260,life:.7,size:3});
  burst(m.x,m.y,10*m.sc,'#f0e8ff',m.boss?40:12,m.boss?120:60,m.boss?7:4);
  progressKill(m);if(m.field&&S.autoQ)later(1.5,()=>{if(!modal&&!player.dead&&!nav)autoGo();});if(m.field){toast('지역 보스 토벌 · '+m.name+' — '+Math.round(FIELD_RESP/60*10)/10+'분 뒤 다시 나타난다',true);lastQKey='';}else if(m.eliteOf)banner('관문 돌파',m.name+'을(를) 쓰러뜨렸다');}
function hurtPlayer(dmg,src,kind){if(player.dead||player.dash)return;if(kind==='melee'||kind==='shot'){const ev=tbVal('ev');if(ev&&Math.random()<ev){STAT.tbEv=(STAT.tbEv||0)+1;floatTxt(player.x,player.y,'회피','#9ad8ff');return;}}/* v4.80 민첩 20 · 45 — 평타 · 투사체만(장판 · 돌진 · 폭발은 피하지 못한다) */{const ld=tbVal('lowDr');if(ld&&player.hp<=pStats().hp*.30)dmg*=1-ld;}/* v4.80 체력 30 */if(src&&src.fa)dmg*=faithIn(src);dmg=gfxHurtK(dmg,kind);if(godOn('athena')&&src&&alive(src))hurtMob(src,dmg*(.2+.02*gLv()),false);
  if(t<player.guardT)dmg*=1-guardK();
  if(bufOn('defp'))dmg*=1-BUFP.defp.dr;/* v4.66 수호 물약 */
  if(player.shield>0){const a=Math.min(player.shield,dmg);player.shield-=a;dmg-=a;if(dmg<=0){floatTxt(player.x,player.y,'흡수','#a8d4ff');player.lastHit=t;return;}}player.hp-=dmg;player.lastHit=t;player.hurt=.35;floatTxt(player.x,player.y,'-'+Math.round(dmg),'#ff7a6a');
  if(player.hp<=0){if(gfxSave())return;if(tbSave())return;player.hp=0;die(src);}}
/* 사망: 쓰러지는 연출 → 1.3초 뒤 사망 팝업 → '부활하기'를 눌러야 마을에서 부활 */
function die(src){if(win)closeWin();clearStatus();player.cureU=0;if(S.buf&&Object.keys(S.buf).length){STAT.bufLost=(STAT.bufLost||0)+Object.keys(S.buf).length;S.buf={};}/* v4.66 버프 물약은 쓰러지면 사라진다 */tele.length=0;shots.length=0;STAT.deaths++;const lost=Math.min(S.xp,Math.round(need(S.lv)*DEATH_XP));S.xp-=lost;STAT.xpLost+=lost;const gOld=S.grave&&S.grave.xp?S.grave.xp:0;if(gOld)STAT.graveGone=(STAT.graveGone||0)+gOld;S.grave=lost?(M.inst?{map:null,xp:lost,zn:'시간의 균열'}:{map:MAPID,x:Math.round(player.x),y:Math.round(player.y),xp:lost,zn:(()=>{for(const k in ZONES)if(inR(ZONES[k].r,player.x,player.y))return ZONES[k].name;return M.name;})()}):null;const gTip=!S.graveTip&&!!S.grave;if(gTip)S.graveTip=1;player.dead=true;player.deadT=t;auto=false;hunt=null;nav=null;chase=null;target=null;moveRing.visible=false;
  for(const m of mobs){m.aggro=false;m.ret=true;}document.body.classList.add('dead');save();
  const by=src&&src.name?src.name:null,where=curZone&&ZONES[curZone]?ZONES[curZone].name:M.name,vill=(M.inst&&riftRet?MAPS[riftRet.map].zones:ZONES).village.name;
  later(1.3,()=>{if(!player.dead)return;openModal({who:'hero',name:'사망했습니다',sub:where+(by?' · '+by+'에게 쓰러짐':''),
    text:'눈앞이 흐려진다…\n'+vill+'의 등불 아래에서 다시 일어설 수 있다.'+(M.inst&&riftUp()?'\n시간의 균열은 아직 열려 있다 · '+mmss(riftStay())+' 뒤 닫힌다 (진행은 남는다)':'')+(lost?'\n\n경험치 -'+fmt(lost)+' (현재 레벨의 '+Math.round(DEATH_XP*100)+'%)'+(S.grave&&S.grave.map?'\n쓰러진 자리의 무덤(✝)으로 돌아가면 되찾는다 · 여관 주인에게 '+fmt(gravePrice())+' G로 복구할 수도 있다':'\n여관 주인에게 '+fmt(gravePrice())+' G로 복구할 수 있다 (균열 안이라 무덤이 남지 않는다)'):'')+(gOld?'\n이전 무덤의 경험치 '+fmt(gOld)+'은(는) 사라졌다':''),
    btns:[{t:'부활하기',pri:true,f:()=>{revive();closeModal();if(gTip)later(1.6,()=>toast('잃은 경험치는 무덤(✝ · 미니맵 보라 십자)에 남아 있다 — 직접 걸어가 되찾거나 여관 주인에게 골드로 복구하자 · 자동 진행은 무덤에 들르지 않는다',true));}}],noFocus:true,lock:.8});});}
function gravePrice(){return S.grave&&S.grave.xp?Math.max(GRAVE_K.min,Math.round(S.grave.xp*GRAVE_K.inn)):0;}
function graveHere(){return !!(S.grave&&S.grave.map&&S.grave.map===MAPID&&!M.inst);}
function graveTake(how){const G=S.grave;if(!G||!G.xp)return 0;const n=G.xp;S.grave=null;if(S.lv>=LV_MAX)S.xp+=n;else gainXp(n);STAT.xpLost=Math.max(0,STAT.xpLost-n);STAT.xpBack=(STAT.xpBack||0)+n;STAT['grave_'+how]=(STAT['grave_'+how]||0)+1;
  if(how==='walk')burst(G.x,G.y,14,'#d8b8ff',16,60,3);toast((how==='inn'?'여관에서 복구했다':'무덤에서 되찾았다')+' · 경험치 +'+fmt(n),true);save();return n;}
function graveTick(){if(player.dead||!graveHere())return;const G=S.grave;if(Math.hypot(G.x-player.x,G.y-player.y)<GRAVE_K.r)graveTake('walk');}
function revive(){if(!player.dead)return;if(M.inst){/* v4.46 균열 안에서 쓰러지면 들어온 지역의 마을에서 일어난다 */if(!traveling)doTravel(riftRet?riftRet.map:'rowen',revive,{quiet:true,now:true,label:'마을로 돌아가는 중…'});return;}document.body.classList.remove('dead');clearStatus();const st=pStats();player.dead=false;player.hp=st.hp;player.mp=st.mp;player.x=PLAZA.x;player.y=PLAZA.y+40;snapCam();save();if(S.autoQ)later(1.2,()=>{if(!modal&&!nav&&!hunt)autoGo();});}
/* v4.66 G12-a 버프 물약 — S.buf[k] = 남은 초(게임 시간으로 줄어듦 · 세이브에 그대로 남음) */
const bufOn=k=>!!(S&&S.buf&&S.buf[k]>0);
function useBuf(k,silent){if(!BUFP[k]||player.dead)return false;if(!cnt(k)){if(!silent)toast(STK[k].n+'이(가) 없다');return false;}const re=bufOn(k);setCnt(k,cnt(k)-1);S.buf[k]=BUF_K.dur;STAT.bufUse=(STAT.bufUse||0)+1;
  burst(player.x,player.y,12,STK[k].col,10,30,3);if(!silent)toast(STK[k].n+(re?' · 시간 갱신 ':' · ')+BUFP[k].txt+' ('+(BUF_K.dur/60)+'분) · 남은 '+cnt(k)+'개',true);save();return true;}
function buyBuf(k,n){const pr=bufPrice();n=Math.max(0,Math.min(n,BUF_K.cap-cnt(k),Math.floor(S.gold/pr),Math.floor((weightMax()-weightNow())/STK[k].w)));if(!n)return 0;setCnt(k,cnt(k)+n);S.gold-=n*pr;STAT.buyG+=n*pr;STAT.bufBuy=(STAT.bufBuy||0)+n;STAT.bufG=(STAT.bufG||0)+n*pr;return n;}
/* 전투 중인가 — 최근 3초 안에 맞았거나 때렸다 */
const inFight=()=>t-player.lastHit<3||t-(player.lastAtk||-99)<3;
function bufTick(dt){if(!S||!S.buf||player.dead)return;for(const k in S.buf){S.buf[k]-=dt;if(S.buf[k]<=0){delete S.buf[k];toast(STK[k].n+' 효과가 끝났다'+(cnt(k)?' · 남은 '+cnt(k)+'개':''));}}
  /* 자동 사용(설정 · 기본 끔): 전투가 시작되면 꺼진 버프를 마신다 — 플레이어가 켠 것만 · 토스트로 알림 */
  if(S.cfg.autoBuf&&inFight()){const used=[];for(const k of BUF_IDS)if(!bufOn(k)&&cnt(k)&&useBuf(k,true))used.push(STK[k].n);if(used.length)toast('버프 자동 사용 · '+used.join(' · '),true);}}
function shopId(){const n=npcList.find(n=>NPCS[n.id]&&NPCS[n.id].shop);return n&&n.id;}
function buyItem(k,n){const pr=potPrice(k),key=k==='hp'?'hpPot':k==='mp'?'mpPot':'scroll';n=Math.max(0,Math.min(n,POT_CAP[k]-S[key],Math.floor(S.gold/pr)));if(!n)return 0;S[key]+=n;S.gold-=n*pr;STAT.buy+=k==='scroll'?0:n;STAT.buyG+=n*pr;return n;}
/* 자동 진행 보충: HP 한도까지 → MP 한도까지(지력·스킬 비중에 맞춰 골드 25%까지) → 주문서 2장 */
function autoBuy(){const g0=S.gold,h=buyItem('hp',POT_CAP.hp);const mpBudget=Math.floor(S.gold*.25/potPrice('mp'));const m=buyItem('mp',Math.min(POT_CAP.mp,mpBudget));const s=S.scroll<2?buyItem('scroll',2-S.scroll):0;
  STAT.shop++;if(h||m||s)toast('물약 보충 · HP +'+h+(m?' · MP +'+m:'')+(s?' · 주문서 +'+s:'')+' (-'+fmt(g0-S.gold)+' G)',true);else toast('골드가 부족해 물약을 사지 못했다',true);save();}
function needShop(){if(!S.autoBuy||t<shopSkipT)return false;const low=S.hpPot<POT_LOW.hp||(S.kp+Object.keys(S.sk).length>0&&S.mpPot<POT_LOW.mp);return low&&S.gold>=potPrice('hp');}
let shopSkipT=0,retT=0;
/* v4.24 사냥 중 보충 (MMORPG 라이크 '물약 부족 시 귀환 · 자동 구매'): 자동 진행으로 사냥하는 동안 HP 물약이 기준(6) 아래로 내려가면
   사냥을 멈추고 마을 상점에서 보충한 뒤 하던 일로 돌아간다. 전에는 다음 단계를 고를 때만 확인해서, 긴 수련 · 컬렉션 대기 사냥에서 물약이 바닥났다. */
function huntResupply(){if(!S.autoQ||!auto||!hunt||nav||modal||player.dead||traveling)return false;if(hunt.mob&&S.hpPot>=2)return false;/* 보스와 싸우는 중엔 물약 2개까지 버틴다 */if(!needShop())return false;STAT.resup=(STAT.resup||0)+1;hunt=null;toast('HP 물약 '+S.hpPot+'개 · 사냥을 멈추고 물약을 보충하러 간다',true);if(shopGo())return true;autoNext();return false;}
function shopGo(){const sid=shopId();if(!sid)return false;shopSkipT=t+60;const done=()=>{autoBuy();later(.4,()=>{if(!modal&&!player.dead)autoGo();});};
  const n=npcList.find(n=>n.id===sid);if(dist(n,player)<30){done();return true;}return navTo('npc',sid,npcName(sid)+'에게 · 물약 보충',done);}
/* 필드에서 HP 물약이 떨어지면 귀환(주문서 있으면 즉시, 없으면 걸어서) */
function emergencyReturn(){if(!(S.autoRet||S.autoQ||rift)||player.dead||!auto||S.hpPot>0||t<retT)return;const st=pStats();if(player.hp>st.hp*.4||inR(ZONES.village.r,player.x,player.y,0))return;retT=t+40;STAT.ret++;hunt=null;
  if(M.inst){if(rift)riftEnd('pot');else riftLeave();return;}
  if(S.scroll>0){goTown();toast('물약 소진 · 귀환 주문서를 사용해 마을로 돌아왔다 (상점의 긴급 귀환 설정)',true);if(S.autoQ)later(.6,()=>{shopSkipT=0;autoGo();});}else{toast('물약도 주문서도 없다 · 걸어서 마을로!',true);auto=false;shopSkipT=0;shopGo();}}
const STAT={hpUse:0,mpUse:0,buy:0,buyG:0,killG:0,rwG:0,shop:0,ret:0,deaths:0,xpLost:0};
function usePot(k,silent){const st=pStats();if(player.dead||t<player.potT)return false;if(k==='hp'){if(!S.hpPot){if(!silent)toast('HP 물약이 없다');return false;}if(player.hp>=st.hp)return false;S.hpPot--;STAT.hpUse++;if(S.hpPot===POT_LOW.hp-1||S.hpPot===2)toast('HP 물약 '+S.hpPot+'개 남음 · 마을 상점에서 보충',true);else if(!S.hpPot)toast('HP 물약이 떨어졌다!',true);const v=Math.max(60,st.hp*.35)*(fxOn('poison')?FXDEF.poison.potK:1)*(1+tbVal('pot'));/* v4.80 체력 10 */player.hp=Math.min(st.hp,player.hp+v);floatTxt(player.x,player.y,'+'+Math.round(v),'#8ef07a');}
  else{if(!S.mpPot){if(!silent)toast('MP 물약이 없다');return false;}if(player.mp>=st.mp)return false;S.mpPot--;STAT.mpUse++;const v=Math.max(30,st.mp*.4)*(1+gfxSum('pot','mp'));player.mp=Math.min(st.mp,player.mp+v);floatTxt(player.x,player.y,'+'+Math.round(v)+' MP','#8ac8ff');}
  player.potT=t+(k==='hp'?2.2-gfxSum('potCd'):2.2);/* v4.74 껍질 망토 */burst(player.x,player.y,14,k==='hp'?'#ff8a7a':'#8ac8ff',10,30,3);return true;}
function faceTo(x,y){const dx=x-player.x,dy=y-player.y;if(Math.abs(dx)>Math.abs(dy)*.8){player.dir=dx<0?'left':'right';}else player.dir=dy<0?'up':'down';if(Math.abs(dx)>2)player.face=dx<0?-1:1;}
function inRange(m,r){return dist(player,m)<=r+6*m.sc;}
function basicAttack(m){if(!alive(m)||player.atkT>0||player.dash||fxOn('stun'))return false;if(heavyBlock())return false;if(!inRange(m,basicRange()))return false;faceTo(m.x,m.y);player.atkT=.62/pStats().aspd;player.swing=.001;player.swingTgt=m;
  if(godOn('artemis')){streak(player.x,player.y,m.x,m.y,'#d8ffc8');return true;}
  fxMesh(FX_SLASH,'#fff0c0',{max:.22,up:(mm,k)=>{mm.scale.set(36*player.face*(1+k*.3),24*(1+k*.2),1);mm.position.set(player.x+player.face*10,elevAt(player.x,player.y)+16,player.y+2);mm.material.opacity=1-k;}});return true;}
function castSkill(i,silent){const s=SK[i];if(!s||player.dead||player.dash)return false;if(fxOn('stun')){if(!silent)toast('기절 중');return false;}
  if(!skLv(i)){if(!silent)toast(s.book&&!S.books[s.id]?s.name+' · 스킬서가 필요하다 (서브 퀘스트)':S.lv<s.req?s.name+' · Lv '+s.req+'부터 배울 수 있다':s.name+' · 스킬 창(K)에서 배우자');return false;}
  if(player.cd[i]>t){if(!silent)toast('재사용 대기 중');return false;}if(player.mp<s.mp){if(!silent)toast('MP가 부족하다');return false;}if(heavyBlock(silent))return false;const mul=skMul(i),id=s.id;
  if(id==='whirl'||id==='flame'){player.mp-=s.mp;player.cd[i]=t+tbCast(gfxCd(s));player.atkT=Math.max(player.atkT,.35);player.swing=.001;player.spin=.4;const ath=id==='whirl'&&godOn('athena'),rr=s.r*gfxSkR(id)+(ath?10:0),fl=id==='flame';/* v4.74 포자 투구 범위 */if(ath){player.shield=Math.max(player.shield,pStats().hp*(.10+.015*gLv()));player.shT=8;floatTxt(player.x,player.y,'보호막','#a8d4ff');}
    for(const m of mobs)if(alive(m)&&dist(player,m)<rr+8*m.sc)playerHit(m,mul,true);
    fxMesh(FX_RING,fl?'#ff7a3a':'#ffe8a0',{geo:DGEO,max:fl?.55:.4,up:(mm,k)=>{const r=(rr*2)*(.5+k*.7);mm.scale.set(r,1,r*.92);mm.position.set(player.x,elevAt(player.x,player.y)+1,player.y);mm.material.opacity=1-k;}});
    if(fl){fxMesh(FX_DISC,'#ff5a20',{geo:DGEO,max:.5,up:(q,k)=>{const r=s.r*2*(.4+k*.7);q.scale.set(r,1,r*.9);q.position.set(player.x,elevAt(player.x,player.y)+1.2,player.y);q.material.opacity=.8*(1-k);}});}
    for(let a=0;a<(fl?28:18);a++){const an=a/(fl?28:18)*6.283;spawnP(player.x+Math.cos(an)*s.r*.7,player.y+Math.sin(an)*s.r*.5,10,{col:fl?(a%2?'#ff8a3a':'#ffd060'):'#fff0b0',vx:-Math.sin(an)*90,vy:Math.cos(an)*50,vz:fl?40:10,life:fl?.5:.35,size:fl?5:4});}return true;}
  if(s.kind==='buff'){player.mp-=s.mp;player.cd[i]=t+tbCast(s.cd);
    if(id==='roar'){player.buffT=t+s.buff;player.buffK=roarK();floatTxt(player.x,player.y,'전투 함성 · 공격력 +'+Math.round(roarK()*100)+'%','#ffb070',true);burst(player.x,player.y,18,'#ff9a4a',30,90,5);}
    else if(id==='guard'){player.guardT=t+s.buff;floatTxt(player.x,player.y,'바위 껍질 · 받는 피해 -'+Math.round(guardK()*100)+'%','#c8b890',true);burst(player.x,player.y,16,'#b8a070',26,70,5);}
    else{player.fervT=t+s.buff;player.fervK=fervK();floatTxt(player.x,player.y,'전장의 기운 · 치명·공속 +'+Math.round(fervK()*100)+'%','#ff8ad8',true);burst(player.x,player.y,18,'#ff6ac8',30,90,5);}
    const col=id==='roar'?'#ff9a4a':id==='guard'?'#c8b070':'#ff6ac8';fxMesh(FX_RING,col,{geo:DGEO,max:.6,up:(mm,k)=>{const r=30+k*90;mm.scale.set(r,1,r*.9);mm.position.set(player.x,elevAt(player.x,player.y)+1,player.y);mm.material.opacity=1-k;}});return true;}
  const m=alive(target)?target:nearestMob(s.range,null);if(!m||dist(player,m)>s.range+8*m.sc){if(!silent)toast('대상이 사거리 밖에 있다');return false;}
  player.mp-=s.mp;player.cd[i]=t+tbCast(gfxCd(s));target=m;faceTo(m.x,m.y);/* v4.74 등불 목걸이: 별똥별 −2초 */
  if(id==='dash'&&godOn('artemis')){player.atkT=Math.max(player.atkT,.35);player.swing=.001;const ts=[m,...mobs.filter(e=>alive(e)&&e!==m&&dist(e,player)<s.range).sort((a,b)=>dist(a,m)-dist(b,m)).slice(0,2)];for(const e of ts){streak(player.x,player.y,e.x,e.y,'#c8ffb0');playerHit(e,mul*.7,true);}return true;}
  if(id==='dash'){const dx=m.x-player.x,dy=m.y-player.y,d=Math.hypot(dx,dy)||1,stop=Math.max(0,d-14);let ex=player.x+dx/d*stop,ey=player.y+dy/d*stop,kk=stop;while(kk>0&&!los(player.x,player.y,ex,ey)){kk-=6;ex=player.x+dx/d*kk;ey=player.y+dy/d*kk;}player.dash={t:0,dur:.18,x0:player.x,y0:player.y,x1:ex,y1:ey,m,mul};player.atkT=Math.max(player.atkT,.4);return true;}
  if(id==='star'){const x=m.x,y=m.y;player.atkT=Math.max(player.atkT,.4);player.swing=.001;
    fxMesh(FX_STAR,'#fff4c8',{max:.42,up:(mm,k)=>{mm.scale.set(26,26,1);mm.rotation.z=k*6;mm.position.set(x+(1-k)*40,elevAt(x,y)+(1-k)*150+8,y);}});
    const zz=godOn('zeus'),r3=s.r+(zz?10:0),mul3=mul+(zz?.4:0);if(zz)for(let b=0;b<3;b++)later(.3+b*.06,()=>bolts.push({pts:[[x+rand(-20,20),y,170],[x+rand(-12,12),y,90],[x+rand(-8,8),y,40],[x,y,0]],life:0,col:'#fff2a0',w:2}));
    later(.42,()=>{for(const mm of mobs)if(alive(mm)&&Math.hypot(mm.x-x,mm.y-y)<r3+8*mm.sc)playerHit(mm,mul3,true);
      fxMesh(FX_DISC,'#ffd890',{geo:DGEO,max:.5,up:(q,k)=>{const r=s.r*2*(.6+k*.6);q.scale.set(r,1,r*.9);q.position.set(x,elevAt(x,y)+1,y);q.material.opacity=1-k;}});burst(x,y,6,'#fff0b0',26,110,5);});return true;}
  if(id==='quake'){player.atkT=Math.max(player.atkT,.45);player.swing=.001;const dx=m.x-player.x,dy=m.y-player.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,L=Math.max(d+20,90);
    for(let k=0;k<5;k++){const px=player.x+ux*L*(k+1)/5,py=player.y+uy*L*(k+1)/5;later(.06*k,()=>{fxMesh(FX_DISC,'#e8b070',{geo:DGEO,max:.45,up:(q,kk)=>{const r=34*(.5+kk*.8);q.scale.set(r,1,r*.8);q.position.set(px,elevAt(px,py)+1,py);q.material.opacity=1-kk;}});burst(px,py,4,'#c89a60',8,80,4);});}
    later(.12,()=>{for(const e of mobs){if(!alive(e))continue;const ex=e.x-player.x,ey=e.y-player.y,u=clamp(ex*ux+ey*uy,0,L),dd=Math.hypot(ex-ux*u,ey-uy*u);if(dd<26+6*e.sc)playerHit(e,mul,true);}});return true;}
  if(id==='combo'){player.atkT=Math.max(player.atkT,.5);for(let h=0;h<s.hits;h++)later(.13*h,()=>{if(!alive(m))return;player.swing=.001;player.swingHit=true;faceTo(m.x,m.y);playerHit(m,mul,true);
      fxMesh(FX_SLASH,'#d8f0ff',{max:.18,up:(mm,k)=>{mm.scale.set(34*player.face*(1+k*.3)*(h%2?-1:1),22,1);mm.position.set(m.x,elevAt(m.x,m.y)+14+h*3,m.y+2);mm.material.opacity=1-k;}});});return true;}
  if(id==='drain'){player.atkT=Math.max(player.atkT,.45);player.swing=.001;later(.12,()=>{if(!alive(m))return;const d=playerHit(m,mul,true),hp=pStats().hp,h=Math.round(Math.min(d*s.drain,hp*.25));if(h>0){player.hp=Math.min(hp,player.hp+h);floatTxt(player.x,player.y,'+'+h,'#ff8aa8');}
      burst(m.x,m.y,12,'#c0304a',18,70,4);for(let k=0;k<10;k++)spawnP(m.x,m.y,12,{col:'#ff6a8a',vx:(player.x-m.x)*2.2,vy:(player.y-m.y)*2.2,vz:20,g:0,life:.45,size:4,size1:1});});return true;}
  return false;}
function nearestMob(r,sp,zone){let best=null,bd=r;for(const m of mobs){if(!alive(m)||m.inv||m.evU>t)continue;if(sp&&m.sp!==sp)continue;if(m.eliteOf&&sp)continue;if(m.field&&!(hunt&&hunt.mob===m))continue;if(zone&&!inR(ZONES[zone].r,m.x,m.y,60))continue;const d=dist(player,m);if(d<bd){bd=d;best=m;}}return best;}

/* ================= 이동 ================= */
const SPD=82;const pSPD=()=>SPD*(fxOn('slow')?FXDEF.slow.mv:1)*(bufOn('spdp')?1+BUFP.spdp.mv:1)*(1+gfxSum('mv'))*(1+tbVal('mv'));/* v4.80 민첩 10 · v4.73 G3 고유 효과 · v4.62 둔화: 이동 −40% */
function stepMove(o,dx,dy,spd,dt){const d=Math.hypot(dx,dy);if(d<.001)return false;const vx=dx/d*spd*dt,vy=dy/d*spd*dt;
  if(!blockedAt(o.x+vx,o.y+vy)){o.x+=vx;o.y+=vy;return true;}if(!blockedAt(o.x+vx,o.y)&&Math.abs(vx)>.01){o.x+=vx;return true;}if(!blockedAt(o.x,o.y+vy)&&Math.abs(vy)>.01){o.y+=vy;return true;}return false;}
function followPath(o,path,spd,dt){while(path.length&&Math.hypot(path[0].x-o.x,path[0].y-o.y)<4)path.shift();if(!path.length)return true;const p=path[0],dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy);
  if(d<=spd*dt){o.x=p.x;o.y=p.y;path.shift();}else stepMove(o,dx,dy,spd,dt);return !path.length;}
function navTo(kind,id,label,then){let gx,gy;if(kind==='npc'){const n=npcList.find(n=>n.id===id);gx=n.x;gy=n.y+16;}else if(kind==='zone'){[gx,gy]=ZONES[id].c;}else{gx=id.x;gy=id.y;}
  const path=findPath(player.x,player.y,gx,gy);if(!path){toast('그곳으로 가는 길을 찾지 못했다');return false;}
  nav={kind,id,label,path,goal:{x:gx,y:gy},stuck:0,lx:player.x,ly:player.y,then};chase=null;anchor=null;if(kind!=='zone'||!alive(target)||!target.aggro)target=null;closeModal();return true;}
function cancelNav(){nav=null;hunt=null;moveRing.visible=false;}
/* 다른 지역 목적지: 길잡이 표석까지 걸어가 이동한 뒤 이어서 진행 */
function goNpc(id,label){const mid=NALL[id].map;if(mid!==MAPID){travelTo(mid,()=>goNpc(id,label));return;}const n=npcList.find(n=>n.id===id);if(dist(n,player)<30){openNpc(id);return;}navTo('npc',id,label);}
function goHunt(zone,sp,mob,label){const mid=ZALL[zone].map;if(mid!==MAPID){travelTo(mid,()=>goHunt(zone,sp,mob,label));return;}
  if(inR(ZONES[zone].r,player.x,player.y,40)){startHunt(zone,sp,mob);return;}if(navTo('zone',zone,label||ZONES[zone].name+'(으)로 · 사냥하러'))nav.hunt={zone,sp,mob};}
function travelTo(mid,then){if(!S.maps.includes(mid)){toast(MAPS[mid].name+'(으)로 가는 길은 아직 열리지 않았다');return;}
  const w=npcList.find(n=>n.way);if(dist(w,player)<40){doTravel(mid,then);return;}navTo('npc','way','길잡이 표석 · '+MAPS[mid].name+'(으)로',()=>doTravel(mid,then));}
/* 현재 지역 그룹만 씬에 — 이어하기로 다른 지역에서 시작할 때 로웬 지형이 남아 협곡(고도 −20)을 덮던 버그 */
function showMapOnly(){for(const k in MAPS){const R=MAPS[k].rt;if(R&&R.group&&R.group!==G0)scene.remove(R.group);}scene.add(G0);}
async function doTravel(mid,then,o){o=o||{};if(traveling||mid===MAPID)return then&&then();traveling=true;closeModal();cancelNav();chase=null;target=null;auto=false;
  const lo=$('loadov');lo.hidden=false;$('loadovT').textContent=o.label||MAPS[mid].name+'(으)로 이동하는 중…';await new Promise(r=>setTimeout(r,30));
  scene.remove(G0);if(inv){inv=null;invNext=t+120;}if(rift&&!o.rift)riftEnd('move');clearFx();clearStatus();tele.length=0;shots.length=0;for(const m of mobs)if(m.aggro){m.aggro=false;m.ret=true;}
  if(!MAPS[mid].rt||!MAPS[mid].rt.built)await buildWorld(mid,p=>{$('loadovT').textContent=MAPS[mid].name+' 지역을 그리는 중… '+Math.round(p*100)+'%';});
  bindMap(mid);showMapOnly();applyLook();{const at=o.at||{x:M.way.x,y:M.way.y+30};player.x=at.x;player.y=at.y;}snapCam();curZone='';lo.hidden=true;traveling=false;if(!M.inst)riftRet=null;if(o.arrive)o.arrive();riftHud();/* 맵이 바뀌는 순간 균열 HUD를 맞춘다(다음 HUD 갱신까지 남지 않게) */save();lastQKey='';
  if(!o.quiet)toast(M.name+'에 도착했다');if(then){if(o.now)then();else later(.6,then);}}
function applyLook(){HAZE.set(M.haze);scene.background=HAZE;scene.fog.color=HAZE;amb.color.setHex(M.amb);}

/* ================= 퀘스트 ================= */
function repZone(){let z='z1';for(const k of HUNTALL)if(S.maps.includes(ZALL[k].map)&&ZALL[k].mobs[0][1]<=S.lv)z=k;return z;}
function curQ(){if(S.qi<QUESTS.length)return QUESTS[S.qi];const z=(S.rep&&S.rep.zone)||repZone(),gid=Object.keys(MAPS[ZALL[z].map].npcs).find(k=>MAPS[ZALL[z].map].npcs[k].guard);
  return {id:'rep',rep:true,giver:gid,title:'토벌 의뢰 · '+ZALL[z].name,type:'zone',zone:z,n:15,
    offer:'요즘도 '+ZALL[z].name+'이(가) 시끄럽다네.\n아무 몬스터나 열다섯 마리만 정리해 주게. 언제든 다시 맡길 수 있네.',done:'깔끔하군. 다음에도 부탁하지.',rw:{xp:Math.round(need(S.lv)*.3),gold:40*S.lv}};}
function gateState(q){if(!q.gate)return {ok:true,items:[]};const it=[];
  for(const id of q.subs||[]){const st=(S.sq[id]||{}).st;it.push({ok:st==='clear',txt:'서브 「'+SUBQ[id].title+'」'});}
  for(const id in q.gate.skills){const i=skIdx(id);it.push({ok:skLv(i)>=q.gate.skills[id],txt:SK[i].name+' Lv '+q.gate.skills[id]+(skLv(i)?' (현재 '+skLv(i)+')':'')});}
  if(q.gate.cp){const c=cpOf();it.push({ok:c>=q.gate.cp,txt:'전투력 '+fmt(Math.min(c,q.gate.cp))+'/'+fmt(q.gate.cp)});}
  return {ok:it.every(x=>x.ok),items:it};}
const subSt=id=>(S.sq[id]||{}).st;
/* ===== v4.10 성장 서브 판정 ===== */
const buRegN=()=>COLL.reduce((n,c)=>n+c.req.filter((r,i)=>r.bu&&collReg(c,i)).length,0);
const isGrowth=id=>!!(SUBQ[id]&&SUBQ[id].grow);
const collDoneN=()=>COLL.filter(collDone).length,bcollDoneN=()=>COLL.filter(c=>isBossColl(c)&&collDone(c)).length;
function growthProg(sq,s){if(sq.type==='rep')return [(S.repR&&S.repR[sq.map])||0,sq.n];if(sq.type==='lv')return [S.lv,sq.n];switch(sq.grow){
  case 'craft':return [(S.crafted||[]).slice(sq.g||0).reduce((a,b)=>a+b,0),sq.n];case 'reg':return [buRegN(),sq.n];
  case 'ench':{if(sq.k==='weapon'){const it=S.eq.weapon&&itemById(S.eq.weapon);return [it?it.en:0,sq.en];}return [ARMOR_K.filter(k=>{const it=S.eq[k]&&itemById(S.eq[k]);return it&&it.en>=sq.en;}).length,sq.n];}
  case 'coll':return [collDoneN(),sq.n];case 'bcoll':return [bcollDoneN(),sq.n];case 'faith':return [pStats(null,true).faith,sq.n];case 'rift':return [S.riftK||0,sq.n];}return [0,1];}
function growthGoal(sq,s){const [a,b]=growthProg(sq,s),x=Math.min(a,b);switch(sq.grow){
  case 'craft':return (sq.g?GRADES[sq.g].n+' 이상 ':'')+'장비 제작 '+x+'/'+b;case 'reg':return '보스 전용 장비 컬렉션 등록 '+x+'/'+b;
  case 'ench':return sq.k==='weapon'?'장착 무기 +'+sq.en+' (현재 +'+a+')':'장착 방어구 +'+sq.en+' 이상 '+x+'/'+b+'부위';
  case 'coll':return '컬렉션 완성 '+x+'/'+b;case 'bcoll':return '지역 보스 컬렉션 완성 '+x+'/'+b;case 'faith':return '신앙 '+x+'/'+b;case 'rift':return '균열 몬스터 처치 '+x+'/'+b;}return '';}
const GROW_HOW={craft:'가방 → 제작',reg:'가방 → 컬렉션 · 지역 보스',ench:'주문서로 강화',coll:'가방 → 컬렉션',bcoll:'지역 보스 유품 모으기',faith:'등급 · 강화 · 컬렉션',rift:'메뉴 → 균열 · 길잡이 표석'};
function growthEvent(kind,it){if(!S||!S.sq)return;if(kind==='craft'){S.crafted=S.crafted||[0,0,0,0,0];S.crafted[it.g]++;}for(const id in S.sq){const s=S.sq[id],sq=SUBQ[id];if(!sq||s.st!=='active'||!sq.grow)continue;
}growthTick();}
function growthTick(){if(!S||!S.sq)return;let any=false;for(const id in S.sq){const s=S.sq[id],sq=SUBQ[id];if(!sq||s.st!=='active'||!(sq.grow||STATE_T[sq.type]))continue;const [a,b]=growthProg(sq,s);
    s.n=a;if(a>=b){s.st='done';any=true;toast((sq.grow?'성장 퀘스트':'서브')+' 완료 · '+sq.title+' — '+npcName(sq.giver)+'에게',true);if(hunt&&hunt.sub===id)hunt=null;}}
  if(any){lastQKey='';save();if(S.autoQ)later(.9,()=>{if(!modal&&!player.dead)autoGo();});}}
/* 성장 서브: 플레이어가 직접 — 해당 창을 연다 */
function openGrowth(sq){if(sq.grow==='rift')return openRift();if(sq.grow==='craft')return openCraft();if(sq.grow==='ench'){return openEnchant(sq.k==='weapon'?S.eq.weapon:ARMOR_K.map(k=>S.eq[k]).find(Boolean));}
  if(sq.grow==='coll'||sq.grow==='bcoll'||sq.grow==='reg'){colCat=sq.grow==='coll'?-1:4;return openColl();}openBag();}
let growHintT=-99;function growHint(){if(t<growHintT)return;growHintT=t+45;const L=activeSubs().filter(id=>isGrowth(id)&&subSt(id)==='active').map(id=>SUBQ[id].title),R2=activeSubs().filter(id=>SUBQ[id].type==='rep'&&subSt(id)==='active').map(id=>SUBQ[id].title);if(L.length)toast('성장 퀘스트 「'+L.join('」 「')+'」는 직접 — 제작 · 강화 · 컬렉션 등록은 자동 진행이 하지 않는다 · 그동안 수련 사냥',true);if(R2.length)toast('「'+R2.join('」 「')+'」 — 퀘스트 [반복] 탭에서 토벌 의뢰를 받거나 반복을 켜자',true);}
function activeSubs(){const L=[];for(const id in S.sq){const s=S.sq[id];if(s.st!=='clear')L.push(id);}return L;}
function qGoal(q,n){if(q.grow)return growthGoal(q,S.sq[q.id]);if(q.type==='rep')return MAPS[q.map].name+' 토벌 의뢰 '+Math.min(n,q.n)+'/'+q.n+'회';if(q.type==='lv')return '레벨 '+Math.min(S.lv,q.n)+'/'+q.n;if(q.type==='hunt')return ZALL[q.zone].name+' 몬스터 '+n+'/'+q.n;if(q.type==='reach')return ZALL[q.zone].name+' 지점 '+Math.min(n,q.n)+'/'+q.n+' 살피기';if(q.type==='wave')return ZALL[q.zone].name+' 방어 '+Math.min(n,q.n)+'/'+q.n+' 웨이브';if(q.type==='fbk')return MAPS[q.map].name+' 지역 보스 '+n+'/'+q.n;if(q.type==='fboss')return QFB(q).elite.name+' 처치 '+Math.min(n,q.n)+'/'+q.n;if(q.type==='talk')return npcName(q.npc)+'와(과) 대화';if(q.type==='collect')return q.item+' '+n+'/'+q.n;if(q.type==='elite')return q.elite.name+' 처치';
  if(q.type==='zone')return ZALL[q.zone].name+' 몬스터 '+n+'/'+q.n;return SPECIES[q.sp].name+' '+n+'/'+q.n;}
function rwList(rw){const a=[];if(rw.god)a.push('권능 「'+GODS[rw.god].name+' · '+GODS[rw.god].title+'」');if(rw.xp)a.push('경험치 '+fmt(rw.xp));if(rw.gold)a.push('골드 '+fmt(rw.gold));if(rw.book)a.push('스킬서 「'+SK[skIdx(rw.book)].name+'」');if(rw.stat)a.push('능력치 포인트 +'+rw.stat);if(rw.kp)a.push('스킬 포인트 +'+rw.kp);
  if(rw.ore)a.push(STK['ore'+(MAP_REG[MAPID]||1)].n+' '+rw.ore);if(rw.dsg)a.push('장비 도면 '+rw.dsg+'장');if(rw.stk)for(const k in rw.stk)a.push(STK[k].n+' '+rw.stk[k]);if(rw.wup)a.push('무기 강화 +1');if(rw.aup)a.push('갑옷 강화 +1');if(rw.stone)a.push('강화석 '+rw.stone);if(rw.shard)a.push('권능 파편 '+rw.shard);if(rw.hp)a.push('HP 물약 '+rw.hp);if(rw.mp)a.push('MP 물약 '+rw.mp);return a;}
function applyRw(rw,src){return withAcq(src||'보상',acqZoneOf(null),()=>applyRw0(rw));}
function applyRw0(rw){gainXp(rw.xp||0);S.gold+=rw.gold||0;STAT.rwG+=rw.gold||0;S.hpPot+=rw.hp||0;S.mpPot+=rw.mp||0;S.stone+=rw.stone||0;S.shard+=rw.shard||0;S.sp+=rw.stat||0;S.kp+=rw.kp||0;if(rw.wup&&!enchantEquipped('weapon'))toast('장착한 무기가 없거나 최대 강화라 무기 마법 주문서로 받았다',true);if(rw.aup&&!enchantEquipped('armor'))toast('장착한 갑옷이 없거나 최대 강화라 갑옷 마법 주문서로 받았다',true);if(rw.book)addStk('book_'+rw.book,1);if(rw.stk)for(const k in rw.stk)addStk(k,rw.stk[k]);if(rw.ore)addStk('ore'+(MAP_REG[MAPID]||1),rw.ore);if(rw.dsg)for(let i=0;i<rw.dsg;i++)addStk(dsgRand(MAP_REG[MAPID]||1),1);if(rw.god)gainGod(rw.god);
  toast('보상 · '+rwList(rw).join(' · '),true);burst(player.x,player.y,16,'#ffe08a',30,80,4);if(S.autoGrow&&(rw.stat||rw.kp||rw.book))autoGrowNow();lastQKey='';}
function progressKill(m){if(m.wave){xqWaveKill(m);return;}if(m.rift){lastQKey='';return;}/* v4.46 균열 전용 공간의 처치는 메인 · 서브 · 반복 의뢰에 들지 않는다 */const q=curQ();
  if(S.qs==='active'){let inc=false;if(q.type==='kill'&&q.sp===m.sp)inc=true;else if(q.type==='collect'&&q.sp===m.sp&&Math.random()<q.rate){inc=true;toast(q.item+' 획득 '+(S.qn+1)+'/'+q.n);}
    else if(q.type==='zone'&&m.zone===q.zone)inc=true;else if(q.type==='elite'&&m.eliteOf===q.id)inc=true;else if(q.type==='fboss'&&m.field&&m.eliteOf===q.boss)inc=true;
    if(inc){S.qn=Math.min(q.n||1,S.qn+1);if(S.qn>=(q.n||1))mainDone();}}
  if(S.rq&&S.rq.st==='active'&&m.zone===S.rq.zone&&!m.eliteOf&&!m.inv){S.rq.n++;if(S.rq.n>=REP.n){S.rq.st='done';toast('토벌 의뢰 완료 · '+npcName(guardOf(S.rq.map))+'에게',true);if(hunt&&hunt.sub==='rq')hunt=null;save();if(S.autoQ)later(.9,()=>{if(!modal&&!player.dead)autoGo();});}}
  for(const id in S.sq){const s=S.sq[id],sq=SUBQ[id];if(s.st!=='active')continue;
    if(sq.type==='hunt'){if(m.zone!==sq.zone||m.eliteOf||m.inv)continue;}else if(sq.type==='fbk'){if(!m.field||ZALL[m.zone].map!==sq.map)continue;}else if(!sq.sp||sq.sp!==m.sp||m.eliteOf)continue;
    if(sq.type==='collect'&&Math.random()>=sq.rate)continue;
    s.n=Math.min(sq.n,s.n+1);if(sq.type==='collect')toast(sq.item+' 획득 '+s.n+'/'+sq.n);if(s.n>=sq.n){s.st='done';toast('서브 완료 · '+sq.title+' — '+npcName(sq.giver)+'에게',true);if(hunt&&hunt.sub===id)hunt=null;save();if(S.autoQ)later(.9,()=>{if(!modal&&!player.dead)autoGo();});}}
  lastQKey='';}
function mainDone(){S.qs='done';const q=curQ();toast('퀘스트 완료 · '+q.title+' — 보상을 받으러 가자',true);if(!(rift&&riftIn()))hunt=null;/* v4.42 균열 안에서는 퀘스트가 끝나도 균열 사냥을 이어 간다 */save();if(S.autoQ)later(.9,()=>{if(S.qs==='done'&&!modal&&!player.dead)autoGo();});}
function startHunt(zone,sp,mob,sub){nav=null;hunt={zone,sp,mob:mob||null,sub:sub||null,roam:null};auto=true;anchor=null;toast((mob?mob.name:sp?SPECIES[sp].name:ZONES[zone].name+' 몬스터')+' 사냥 시작 · 자동 전투');}
/* 메인 진행 (트래커 메인 카드 · G) */
function questGo(){if(player.dead||!started)return;const q=curQ();
  if(S.qs==='avail')return goNpc(q.giver,npcName(q.giver)+'에게 · 퀘스트 받기');
  if(S.qs==='done')return goNpc(turnNpc(q),npcName(turnNpc(q))+'에게 · 보상 받기');
  if(q.type==='talk')return goNpc(q.npc,npcName(q.npc)+'에게 · 대화');
  if(q.type==='fboss'){const bq=QFB(q),go=()=>{ensureFieldBosses();const m=eliteOf(bq);if(alive(m))return goHunt(q.zone,null,m,ZONES[q.zone].name+'(으)로 · '+bq.elite.name+' 토벌');
      toast(bq.elite.name+'이(가) 다시 나타날 때까지 근처에서 사냥한다');goHunt(q.zone,null,null,ZONES[q.zone].name+'(으)로 · 지역 보스 기다리며 사냥');};if(qMap(q)!==MAPID)return travelTo(qMap(q),go);return go();}
  if(q.type==='elite'){const g=gateState(q);if(!g.ok)return gateGo(q,g);const go=()=>{const m=spawnElite(q);goHunt(q.zone,null,m,ZONES[q.zone].name+'(으)로 · '+q.elite.name+' 토벌');};
    if(qMap(q)!==MAPID)return travelTo(qMap(q),go);return go();}
  goHunt(q.zone,q.type==='zone'?null:q.sp);}
/* 관문 조건 미달: 남은 서브부터, 서브가 끝났으면 성장 창으로 */
function gateGo(q,g){const nx=(q.subs||[]).find(id=>subSt(id)!=='clear');if(nx)return subGo(nx);
  if(S.autoGrow){autoGrowNow();if(gateState(q).ok)return questGo();}
  const miss=g.items.filter(x=>!x.ok).map(x=>x.txt).join(' · ');toast('관문 조건 부족 · '+miss);
  if(S.sp>0)openStats();else if(S.kp>0||q.gate.skills&&Object.keys(q.gate.skills).some(id=>skLv(skIdx(id))<q.gate.skills[id]))openSkills();
  else toast('전투력이 모자라면 사냥으로 레벨을 올리거나 장비를 강화하자');}
function subGo(id){const s=S.sq[id],q=SUBQ[id];if(!s)return;if(q.grow&&s.st==='active')return openGrowth(q);
  /* 관문 서브 '의뢰 N회'는 메인 목표라 자동 진행이 채운다 — 그 밖의 반복은 [반복] 탭에서 플레이어가 */
  if(s.st==='active'&&q.type==='rep')return repGo(q.map);
  if(s.st==='active'&&q.type==='lv'){const z=repZone();return goHunt(z,null,null,ZALL[z].name+'(으)로 · 수련 사냥');}
  if(s.st==='active'&&q.type==='fbk'){const f=pStats(null,true).faith;const go=()=>{const fb=fieldBossInfo(),al=fb.filter(alive);if(al.length){const m=al[0];return goHunt(m.zone,null,m,ZONES[m.zone].name+'(으)로 · 지역 보스 토벌');}if(fb.length){toast('지역 보스가 다시 나타날 때까지 토벌 의뢰를 하자');return repGo(q.map);}return repGo(q.map);};if(q.map!==MAPID)return travelTo(q.map,go);return go();}
  if(s.st==='avail')return goNpc(q.giver,npcName(q.giver)+'에게 · 서브 받기');if(s.st==='done')return goNpc(q.giver,npcName(q.giver)+'에게 · 서브 보상');
  if(s.st==='active'&&(q.type==='reach'||q.type==='wave')){const mid=ZALL[q.zone].map,go=()=>{xqEnsure(id);const i=q.type==='wave'?0:xqNext(id);if(i<0||!s.pts)return;const p=s.pts[i];
      if(q.type==='wave'&&Math.hypot(p[0]-player.x,p[1]-player.y)<=XQ.near){if(!hunt||hunt.sub!==id)startHunt(q.zone,null,null,id);return;}
      if(navTo('pt',{x:p[0],y:p[1]},ZONES[q.zone].name+' · '+q.title+(q.type==='wave'?' (방어 지점)':' (지점 '+((s.n|0)+1)+'/'+q.n+')'))){nav.xq=id;if(q.type==='wave')nav.hunt={zone:q.zone,sp:null,sub:id};}};
    if(mid!==MAPID)return travelTo(mid,go);return go();}
  if(s.st==='active'){const z=q.zone;const mid=ZALL[z].map;const go=()=>{if(inR(ZONES[z].r,player.x,player.y,40))startHunt(z,q.sp,null,id);else if(navTo('zone',z,ZONES[z].name+'(으)로 · '+q.title))nav.hunt={zone:z,sp:q.sp,sub:id};};
    if(mid!==MAPID)return travelTo(mid,go);go();}}
/* ===== v4.83 G10 탐색(reach) · 방어(wave) · 보상 택1(pick) =====
   탐색: 그 사냥터의 지점 n곳(반경 XQ.r)을 아무 순서로 밟는다 · 도착하면 30%로 매복(가까운 몬스터 2마리가 덤빈다)
   방어: 지점에 서면 웨이브(3 · 4 · 5마리 · 그 사냥터 종 · 종마다 가장 낮은 레벨)가 온다 · 지점에서 XQ.leash 넘게 벗어나 있으면 다음 웨이브는 오지 않는다
   지점은 그 사냥터 몬스터들의 집 자리에서 고른다(걸을 수 있는 자리) — 서로 가장 먼 곳부터. 세이브에 좌표로 남는다(s.pts) */
/* 택1 보상: 기본 보상 + 고른 묶음 */
function xqRw(rw,pi){if(!rw.pick)return rw;const o=Object.assign({},rw,rw.pick[pi]||{});delete o.pick;if(rw.stk||(rw.pick[pi]||{}).stk)o.stk=Object.assign({},rw.stk||{},(rw.pick[pi]||{}).stk||{});return o;}
const xqHold=id=>{const s=S.sq[id];return !!(s&&s.st==='done'&&s.hold&&SUBQ[id].rw.pick);};
const XQ={r:24,amb:.3,ambN:2,wave:[3,4,5],near:40,leash:60,gap:2.5};
function xqPts(zone,n){const hs=mobs.filter(m=>m.zone===zone&&!m.boss&&!m.eliteOf&&!m.wave&&!m.sumOf&&!m.inv&&!m.rift).map(m=>m.home);if(!hs.length)return [ZONES[zone].c.slice()];
  const c=ZONES[zone].c,d2=(a,b)=>(a.x-b.x)**2+(a.y-b.y)**2,out=[hs.reduce((a,b)=>d2(a,{x:c[0],y:c[1]})<=d2(b,{x:c[0],y:c[1]})?a:b)];
  while(out.length<n&&out.length<hs.length){let best=null,bd=-1;for(const h of hs){const d=Math.min(...out.map(o=>d2(o,h)));if(d>bd){bd=d;best=h;}}out.push(best);}
  return out.map(h=>[Math.round(h.x),Math.round(h.y)]);}
const xqHere=q=>ZALL[q.zone].map===MAPID&&!M.inst;
function xqEnsure(id){const s=S.sq[id],q=SUBQ[id];if(!s.pts&&xqHere(q))s.pts=xqPts(q.zone,q.type==='wave'?1:q.n);return s.pts;}
const xqNext=id=>{const s=S.sq[id];return s.pts?s.pts.findIndex((p,i)=>!((s.v|0)&1<<i)):-1;};
function xqDone(id){const s=S.sq[id],q=SUBQ[id];s.st='done';toast('서브 완료 · '+q.title+' — '+npcName(q.giver)+'에게',true);if(hunt&&hunt.sub===id)hunt=null;if(nav&&nav.xq===id)nav=null;save();lastQKey='';if(S.autoQ)later(.9,()=>{if(!modal&&!player.dead)autoGo();});}
const xqWaveMobs=id=>mobs.filter(m=>m.wave===id);
function xqSpawn(id){const s=S.sq[id],q=SUBQ[id],P=s.pts[0],need=XQ.wave[Math.min(s.n,XQ.wave.length-1)],T0=ZONES[q.zone].mobs,Tn=T0.filter(r=>mobBeh({sp:r[0],zone:q.zone})!=='burst'),T=Tn.length?Tn:T0,/* 자폭형은 웨이브에 넣지 않는다 — 여러 마리가 한꺼번에 터지면 피할 수 없다 */pool=xqWaveMobs(id);
  const hs=mobs.filter(m=>m.zone===q.zone&&!m.boss&&!m.eliteOf&&!m.wave&&!m.sumOf&&!m.inv).map(m=>m.home).sort((a,b)=>Math.hypot(a.x-P[0],a.y-P[1])-Math.hypot(b.x-P[0],b.y-P[1])).filter(h=>Math.hypot(h.x-P[0],h.y-P[1])>30);
  for(let i=0;i<need;i++){const [sp,lo]=T[i%T.length],lv=Math.max(1,Math.min(lo,S.lv)),/* 그 종의 가장 낮은 레벨(내 레벨보다 높지는 않게) — 한꺼번에 덤비므로 */h=hs[i%Math.max(1,hs.length)]||{x:P[0]+60,y:P[1]},jx=(i*37%21)-10,jy=(i*53%21)-10;let m=pool[i];
    if(!m)m=makeMob(sp,lv,h.x+jx,h.y+jy,q.zone,false,{ext:{wave:id}});else{m.home.x=h.x+jx;m.home.y=h.y+jy;}
    m.dead=false;m.gone=false;m.hp=m.max;m.x=m.home.x;m.y=m.home.y;m.deadT=0;m.respawn=1e9;m.ret=false;m.aggro=true;m.wind=0;m.atkT=1+i*.15;m.mesh.visible=true;}
  s.live=need;toast('방어 '+(s.n+1)+'/'+q.n+' · '+need+'마리가 몰려온다',true);banner('방어 '+(s.n+1)+' / '+q.n,ZONES[q.zone].name+' · 자리를 지켜라');}
function xqWaveKill(m){const id=m.wave,s=S.sq[id],q=SUBQ[id];if(!s||s.st!=='active')return;if(xqWaveMobs(id).some(e=>!e.dead))return;
  s.n++;s.live=0;lastQKey='';if(s.n>=q.n)return xqDone(id);s.wt=t+XQ.gap;toast('웨이브를 막았다 · 다음 웨이브 준비',true);save();}
let xqFxT=0;
function xqTick(dt){if(player.dead||!started)return;const fx=t>=xqFxT;if(fx)xqFxT=t+.7;
  for(const id in S.sq){const s=S.sq[id],q=SUBQ[id];if(!q||s.st!=='active'||q.type!=='reach'&&q.type!=='wave'||!xqHere(q))continue;xqEnsure(id);
    if(q.type==='reach'){s.pts.forEach((p,i)=>{if((s.v|0)&1<<i)return;if(fx)burst(p[0],p[1],6,'#8fe8ff',3,22,3);if(Math.hypot(p[0]-player.x,p[1]-player.y)>XQ.r)return;
        s.v=(s.v|0)|1<<i;s.n=Math.min(q.n,(s.n|0)+1);burst(p[0],p[1],14,'#8fe8ff',18,70,4);toast(q.title+' · 지점 '+s.n+'/'+q.n+' 확인');lastQKey='';
        if(s.n>=q.n)return xqDone(id);
        if(Math.random()<XQ.amb){const near=mobs.filter(m=>!m.dead&&m.zone===q.zone&&!m.boss&&!m.eliteOf&&!m.wave&&!m.inv&&Math.hypot(m.x-player.x,m.y-player.y)<260).sort((a,b)=>dist(a,player)-dist(b,player)).slice(0,XQ.ambN);if(near.length){for(const m of near){m.aggro=true;m.ret=false;}toast('매복이다! · '+near.length+'마리가 덤벼든다',true);}}
        save();if(S.autoQ||nav&&nav.xq===id)later(.6,()=>{if(!modal&&!player.dead&&S.sq[id].st==='active')subGo(id);});});}
    else{const P=s.pts[0],d=Math.hypot(P[0]-player.x,P[1]-player.y),live=xqWaveMobs(id).filter(m=>!m.dead);if(fx)burst(P[0],P[1],6,'#ffd27a',3,22,3);
      if(live.length&&d<=XQ.leash){for(const m of live)if(!m.aggro||m.ret){m.aggro=true;m.ret=false;}}/* 자리를 지키고 있으면 남은 웨이브 몬스터가 다시 덤빈다(자리를 비웠다 돌아와도 이어진다) */
      if(!live.length){if(d<=XQ.near&&t>=(s.wt||0))xqSpawn(id);
        else if(d>XQ.near&&hunt&&hunt.sub===id&&!nav&&!alive(target)){hunt=null;subGo(id);}}}}}
/* ===== v4.11 반복 토벌 의뢰 (경비대장 · 아이온2 일일 수호자 임무 · 제우스 신탁처럼 몇 번이고) =====
   지역 사냥터 하나에서 아무 몬스터 REP.n마리 → 경비대장에게 보상. 지역별 누적 횟수(S.repR)가 관문 서브 조건이 된다 */
const REP={n:20,lv:10};
const guardOf=mid=>Object.keys(MAPS[mid].npcs).find(k=>MAPS[mid].npcs[k].guard);
function repZoneIn(mid){let z=null;const f=pStats(null,true).faith;for(const k of HUNTALL)if(ZALL[k].map===mid&&ZALL[k].mobs[0][1]<=S.lv&&(ZFAITH[k]||0)<=f)z=k;return z||HUNTALL.find(k=>ZALL[k].map===mid);}
/* 보상은 의뢰 사냥터 수준 기준 — 낮은 지역을 반복해도 레벨이 너무 앞서가지 않게 */
const repLv=()=>{const z=S.rq?S.rq.zone:repZoneIn(MAPID);return Math.min(S.lv,ZALL[z].mobs[ZALL[z].mobs.length-1][2]);};
const repRw=()=>{const L=repLv();return {xp:Math.round(need(L)*.08),gold:25*L,stone:tierOfLv(L),ore:2+2*(MAP_REG[S.rq?S.rq.map:MAPID]||1),dsg:Math.random()<.6?1:0};};
let wantRep=null;
function acceptRep(mid){S.rq={map:mid,zone:repZoneIn(mid),n:0,st:'active'};wantRep=null;toast('토벌 의뢰 수락 · '+ZALL[S.rq.zone].name+' 몬스터 '+REP.n+'마리');save();lastQKey='';closeModal();if(S.autoQ)later(.5,autoGo);}
function claimRep(){if(!S.rq||S.rq.st!=='done')return;const mid=S.rq.map;applyRw(repRw(),'반복 의뢰');S.repR=S.repR||{};S.repR[mid]=(S.repR[mid]||0)+1;S.repN=(S.repN||0)+1;S.rq=null;hunt=null;
  toast(MAPS[mid].name+' 토벌 의뢰 누적 '+S.repR[mid]+'회',true);growthTick();save();lastQKey='';closeModal();if(S.autoQ)later(.6,autoGo);}
function repOffer(id){const mid=NALL[id].map,z=repZoneIn(mid),rw=repRw(),body=el('div','qbox');body.append(el('b',null,'[의뢰] '+MAPS[mid].name+' 토벌 의뢰'),el('div',null,'목표 · '+ZALL[z].name+' 아무 몬스터 '+REP.n+'마리 (Lv '+ZALL[z].lv+')'),el('div',null,'누적 '+((S.repR||{})[mid]||0)+'회 · 몇 번이고 다시 받을 수 있다'));const r=el('div','rw');for(const x of rwList(rw))r.appendChild(el('span',null,x));body.appendChild(r);
  openModal({who:id,npc:id,name:npcName(id),sub:NPCS[id].role,text:'요즘 '+ZALL[z].name+'이(가) 시끄럽다네. 아무 놈이나 '+REP.n+'마리만 정리해 주게.',body,btns:[{t:'나중에',alt:true,f:()=>{wantRep=null;closeModal();}},{t:'반복 수락',alt:true,f:()=>{S.repLoop=mid;S.autoQ=true;acceptRep(mid);}},{t:'수락',pri:true,f:()=>acceptRep(mid)}],autoBtn:S.autoQ&&wantRep===mid?()=>acceptRep(mid):null});}
function repGo(mid){if(S.lv<REP.lv&&!S.rq){const q=curQ(),z=q.zone||repZone();return goHunt(z,null,null,ZALL[z].name+'(으)로 · 수련 사냥');}mid=mid||(S.rq&&S.rq.map)||MAPID;if(!S.maps.includes(mid))mid=MAPID;
  if(S.rq&&S.rq.st==='done')return goNpc(guardOf(S.rq.map),npcName(guardOf(S.rq.map))+'에게 · 의뢰 보상');
  if(S.rq&&S.rq.st==='active'){const z=S.rq.zone;if(ZALL[z].map!==MAPID)return travelTo(ZALL[z].map,()=>repGo());if(inR(ZONES[z].r,player.x,player.y,40))return startHunt(z,null,null,'rq');if(navTo('zone',z,ZONES[z].name+'(으)로 · 토벌 의뢰'))nav.hunt={zone:z,sp:null,sub:'rq'};return;}
  wantRep=mid;goNpc(guardOf(mid),npcName(guardOf(mid))+'에게 · 토벌 의뢰 받기');}
/* 자동 진행: 완료 보상 → 서브 보상 → 관문 서브 → 메인 순서 */
function autoGo(){if(S.autoQ)autoNext();}
/* 수동 조작(이동·터치)은 퀘스트 자동 진행을 끈다 */
/* v4.78 자동 진행 감시: 켜져 있는데 아무것도 안 하고 서 있으면 다음 할 일을 다시 찾는다 (창·대화 조작 뒤 멈춤 방지) */
let aqIdle=0;function aqWatch(dt){if(!S.autoQ||!started||modal||nav||hunt||chase||traveling||player.dead||M.inst||trainFor){aqIdle=0;return;}aqIdle+=dt;if(aqIdle>=2.5){aqIdle=-3;autoNext();}}
function stopAutoQ(){trainFor=null;if(!S.autoQ)return;S.autoQ=false;toast('수동 조작 · 퀘스트 자동 진행 끔');save();}
function autoNext(){if(player.dead||modal)return;if(needShop()&&shopGo())return;const q=curQ();
  if(S.qs==='done')return questGo();const sd=Object.keys(S.sq).find(id=>S.sq[id].st==='done'&&!xqHold(id));if(sd)return subGo(sd);if(S.rq&&S.rq.st==='done')return repGo();
  /* v4.17 반복 의뢰는 플레이어가 고른다: 받은 의뢰는 끝까지, [반복] 켜면 계속 다시 받는다 */
  if(S.rq&&S.rq.st==='active')return repGo();if(S.repLoop&&S.lv>=REP.lv)return repGo(S.repLoop);
  /* 플레이어가 수락한 신의 시련은 자동 진행이 이어서 한다 (수락은 직접) */
  const tr=TRIALS.find(id=>(S.sq[id]||{}).st==='active');if(tr&&S.qs!=='active'||tr&&q.type!=='elite')return subGo(tr);
  if(S.qs==='active'&&q.type==='elite'){const g=gateState(q);if(!g.ok){const nx=(q.subs||[]).find(id=>subSt(id)!=='clear'&&!(isGrowth(id)&&subSt(id)==='active')&&!xqHold(id));if(nx)return subGo(nx);if(S.autoGrow)autoGrowNow();if(!gateState(q).ok){growHint();/* 전투력·성장·대기 — 같은 지역 수련 사냥 (서브 밖 반복 의뢰는 플레이어가 고른다) */trainFor=q.id;return goHunt(q.zone,null,null,ZONES[q.zone]?ZONES[q.zone].name+'(으)로 · 수련 사냥':'수련 사냥');}}}
  /* 일반 메인의 곁가지 서브: 자동 진행이 먼저 끝낸다 */
  if(S.qs==='active'&&q.type!=='elite'){const sx=(q.subs||[]).find(id=>{const st=subSt(id);return st==='avail'||st==='active'&&!isGrowth(id);});if(sx)return subGo(sx);}
  questGo();}
function acceptQuest(){const q=curQ();S.qs='active';S.qn=0;if(q.rep)S.rep={zone:q.zone};if(q.unlock&&!S.maps.includes(q.unlock)){S.maps.push(q.unlock);banner(MAPS[NALL[q.giver].map].name+' 원정 완료','다음 지역 '+MAPS[q.unlock].name+' · 길잡이 표석으로 이동 가능');for(const n of [2,3])if(SK_TIER[n].map===q.unlock&&tierOpen(n))toast(SK_TIER[n].n+' 스킬이 열렸다 · 스킬 수련 창(K)',true);}
  if(q.subs){for(const id of q.subs)if(!S.sq[id])S.sq[id]={st:'avail',n:0};toast((q.gate?'관문 퀘스트 · ':'')+'서브 퀘스트 '+q.subs.length+'개가 열렸다',true);}
  toast('퀘스트 수락 · '+q.title);save();lastQKey='';closeModal();if(S.autoQ)later(.5,autoGo);}
function claimQuest(){const q=curQ();if(S.qs!=='done')return;anchor=null;hunt=null;applyRw(q.rw,'메인 「'+q.title+'」');
  if(q.rep)S.rep=null;else S.qi++;S.qs='avail';S.qn=0;save();lastQKey='';const nq=curQ(),here=modal&&modal.npc;closeModal();
  if(S.qi===QUESTS.length&&!q.rep)banner('메인 퀘스트 완료','이제 경비대의 토벌 의뢰를 반복할 수 있다');if(q.id==='rq3')riftUnlocked();if(q.id==='q5'&&openTrials())return;/* 시련 선택 창이 먼저 — 고를 때까지 자동 진행 대기 */
  if(here&&nq.giver===here){openNpc(here);return;}if(S.autoQ)later(.6,autoGo);}
function acceptSub(id){S.sq[id].st='active';S.sq[id].n=0;toast('서브 수락 · '+SUBQ[id].title);const gv=SUBQ[id].give;if(gv)withAcq('수락 지급 「'+SUBQ[id].title+'」',acqZoneOf(null),()=>{const a=[];for(const k in gv){if(k==='stone')S.stone+=gv[k];else if(k==='gold')S.gold+=gv[k];else if(k==='dsgAny'){for(let i=0;i<gv[k];i++)addStk(dsgRand(MAP_REG[MAPID]||1),1);}else addStk(k,gv[k]);a.push((k==='stone'?'강화석':k==='gold'?'골드':k==='dsgAny'?'장비 도면':STK[k].n)+' '+gv[k]);}toast('지급 · '+a.join(' · '),true);});if(SUBQ[id].grow)growthTick();save();lastQKey='';closeModal();if(S.autoQ)later(.5,autoGo);}
function claimSub(id,pi){const s=S.sq[id];if(!s||s.st!=='done')return;const R0=SUBQ[id].rw;if(R0.pick&&!(pi>=0&&pi<R0.pick.length))return;/* v4.83 택1은 고른 뒤에만 */anchor=null;hunt=null;s.st='clear';delete s.hold;applyRw(xqRw(R0,pi),(isGrowth(id)?'성장 「':'서브 「')+SUBQ[id].title+'」');const rw=xqRw(R0,pi);
  if(rw.book)toast('스킬서 「'+SK[skIdx(rw.book)].name+'」 · 가방(I)에서 사용하면 배울 수 있다',true);if(rw.stat||rw.kp)toast('능력치·스킬 포인트가 늘었다 · C · K',true);save();lastQKey='';const here=modal&&modal.npc;closeModal();
  const q=curQ();if(q.gate&&S.qs==='active'&&gateState(q).ok)banner('관문 조건 충족',q.title+' · 정예에게 도전할 수 있다');
  if(SUBQ[id].trial&&TRIALS.some(x=>subSt(x)==='avail'&&trialReady(x)))toast('다음 신의 시련을 고를 수 있다 · 퀘스트 [시련] 탭',true);
  if(here){const more=Object.keys(S.sq).find(k=>S.sq[k].st!=='clear'&&SUBQ[k].giver===here&&S.sq[k].st!=='active'&&!(S.autoQ&&SUBQ[k].trial&&S.sq[k].st==='avail'));if(more){openNpc(here);return;}}if(S.autoQ)later(.6,autoGo);}

/* ================= 대화창 ================= */
function portrait(id,el,head){el.replaceChildren();let c;if(CHARART[id])c=charFace(id,head);else{c=mk(22,head?22:34);c.getContext('2d').drawImage(getSprite(id,'down',false,0),0,0);}el.appendChild(c);}
function openModal(o){modal=o;$('modal').hidden=false;portrait(o.who,$('dlgF'));$('dlgN').innerHTML='';$('dlgN').append(o.name);if(o.sub){const s=document.createElement('small');s.textContent=o.sub;$('dlgN').appendChild(s);}
  const B=$('dlgB');B.replaceChildren();if(o.text){const p=document.createElement('p');p.textContent=o.text;B.appendChild(p);}if(o.body)B.appendChild(o.body);
  const A=$('dlgA');A.replaceChildren();let first=null;for(const b of o.btns||[]){const e=document.createElement('button');e.type='button';e.className='btn'+(b.pri?' pri':b.alt?' alt':'')+(b.cls?' '+b.cls:'');e.textContent=b.t;if(b.tip)e.title=b.tip;if(b.dis)e.disabled=true;e.onclick=()=>{b.f();};A.appendChild(e);if(!first&&b.pri)first=e;}
  if(o.autoBtn)later(1.1,()=>{if(modal===o)o.autoBtn();});if(o.autoClose)later(o.autoClose,()=>{if(modal===o)closeModal();});
  if(o.lock){const bs=[...A.children];bs.forEach(b=>b.disabled=true);setTimeout(()=>{if(modal===o)bs.forEach(b=>b.disabled=false);},o.lock*1000);}
  if(!o.noFocus)(first||A.firstChild)?.focus({preventScroll:true});else A.blur&&document.activeElement&&document.activeElement.blur();}
function closeModal(){modal=null;$('modal').hidden=true;stage.focus({preventScroll:true});}
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
function qbox(q,kind,withRw){const d=el('div','qbox');d.appendChild(el('b',null,(kind==='sub'?'[서브] ':q.rep?'[반복] ':q.gate?'[관문] ':q.type==='fboss'?'[지역 보스] ':'[메인] ')+q.title));
  const goal=q.grow?growthGoal(q,S.sq[q.id])+' · '+GROW_HOW[q.grow]+' (직접 진행)':q.type==='rep'||q.type==='lv'||q.type==='hunt'||q.type==='fbk'||q.type==='reach'||q.type==='wave'?qGoal(q,(S.sq[q.id]||{}).n||0)+(q.type==='rep'?' · '+npcName(guardOf(q.map))+'의 반복 의뢰 (몇 번이고 다시 받을 수 있다)':q.type==='lv'?' · 사냥·토벌 의뢰로 레벨 업':''):q.type==='talk'?npcName(q.npc)+'와(과) 대화'+(NALL[q.npc].map!==MAPID?' ('+MAPS[NALL[q.npc].map].name+')':''):q.type==='collect'?SPECIES[q.sp].name+'에게서 '+q.item+' '+q.n+'개':q.type==='zone'?ZALL[q.zone].name+' 몬스터 '+q.n+'마리':q.type==='elite'?q.elite.name+' 처치':q.type==='fboss'?QFB(q).elite.name+' (지역 보스 · Lv '+(QFB(q).elite.lv+FB_UP.lv)+') 처치 · 보스 전용 장비 확정':SPECIES[q.sp].name+' '+q.n+'마리';
  if(q.give)d.appendChild(el('div','give','수락하면 지급 · '+Object.entries(q.give).map(([k,v])=>(k==='stone'?'강화석':k==='gold'?'골드':k==='dsgAny'?'장비 도면':STK[k].n)+' '+v).join(' · ')));
  d.appendChild(el('div',null,'목표 · '+goal+(q.zone?' ('+MAPS[ZALL[q.zone].map].name+' · '+ZALL[q.zone].name+' Lv '+ZALL[q.zone].lv+')':'')));
  if(q.type==='fboss'){const E=QFB(q).elite,f=pStats(null,true).faith;d.appendChild(el('div','gate',''));d.lastChild.append(el('span','gh','지역 보스'),el('span',null,'관문 때보다 강하다 (Lv +'+FB_UP.lv+' · 체력 ×'+FB_UP.hp+') · '+Math.round(FIELD_RESP/60*10)/10+'분마다 다시 나타난다'),el('span',E.fa&&f<E.fa?'warn':'ok','권장 신앙 '+(E.fa||0)+' (현재 '+f+')'));}
  if(q.gate){const g=gateState(q),gl=el('div','gate');gl.appendChild(el('span','gh','정예 출현 조건'));for(const it of g.items)gl.appendChild(el('span',it.ok?'ok':'no',(it.ok?'✓ ':'✗ ')+it.txt));if(q.elite.fa){const f=pStats(null,true).faith;gl.appendChild(el('span',f>=q.elite.fa?'ok':'warn','권장 신앙 '+q.elite.fa+' (현재 '+f+') · 모자라면 주는 피해↓ 받는 피해↑'));}d.appendChild(gl);}
  if(withRw){const r=el('div','rw');for(const s of rwList(q.rw))r.appendChild(el('span',null,s));d.appendChild(r);}return d;}
function openNpc(id){if(player.dead)return;if(id==='way')return openWay();const N=NPCS[id];if(!N)return;nav=null;const q=curQ(),base={who:id,npc:id,name:npcName(id),sub:N.role};faceTo(N.x,N.y);
  if(S.qs==='active'&&q.type==='talk'&&q.npc===id){S.qs='done';lastQKey='';}
  if(S.qs==='done'&&turnNpc(q)===id){openModal({...base,text:q.done,body:qbox(q,'main',true),btns:[{t:'보상 받기',pri:true,f:claimQuest}],autoBtn:S.autoQ?claimQuest:null});return;}
  if(S.rq&&S.rq.st==='done'&&guardOf(S.rq.map)===id){const rw=repRw(),b=el('div','qbox');b.append(el('b',null,'[의뢰] '+MAPS[S.rq.map].name+' 토벌 의뢰'));const r=el('div','rw');for(const x of rwList(rw))r.appendChild(el('span',null,x));b.appendChild(r);openModal({...base,text:'깔끔하군. 다음에도 부탁하지.',body:b,btns:[{t:'보상 받기',pri:true,f:claimRep}],autoBtn:S.autoQ?claimRep:null});return;}
  for(const sid in S.sq){const s=S.sq[sid],sq=SUBQ[sid];if(sq.giver!==id)continue;
    if(s.st==='done'&&sq.rw.pick){/* v4.83 보상 택1 — 자동 진행은 고르지 않는다(자동 버튼 없음). [나중에]를 누르면 자동 진행은 이 서브를 두고 다른 일을 한다 */
      openModal({...base,text:sq.done+'\n\n보상을 하나 고르자.',body:qbox(sq,'sub',true),pick:sid,btns:[...sq.rw.pick.map((r,i)=>({t:rwList(r).join(' · '),pri:true,cls:'pickb',f:()=>claimSub(sid,i)})),{t:'나중에',alt:true,f:()=>{s.hold=1;save();closeModal();lastQKey='';if(S.autoQ)later(.4,autoGo);}}]});return;}
    if(s.st==='done'){openModal({...base,text:sq.done,body:qbox(sq,'sub',true),btns:[{t:'보상 받기',pri:true,f:()=>claimSub(sid)}],autoBtn:S.autoQ?()=>claimSub(sid):null});return;}
    if(s.st==='avail'&&sq.trial&&(!trialReady(sid)||S.autoQ))continue;/* v4.17: 시련은 플레이어가 [시련] 탭에서 고른다 */
    if(s.st==='avail'&&sq.trial&&S.qs==='avail'&&q.giver===id)continue;/* 메인 퀘스트 제안이 먼저 */
    if(s.st==='avail'&&sq.trial&&Object.keys(S.sq).some(k=>k!==sid&&SUBQ[k].giver===id&&!SUBQ[k].trial&&(S.sq[k].st==='avail'||S.sq[k].st==='done')))continue;/* v4.10: 같은 NPC의 다른 서브가 먼저 (시련 선택 창이 자동 진행을 막지 않게) */
    if(s.st==='avail'){openModal({...base,text:sq.offer,body:qbox(sq,'sub',true),btns:[{t:'나중에',alt:true,f:()=>{closeModal();if(S.autoQ&&sq.trial)later(.5,autoGo);}},{t:'수락',pri:true,f:()=>acceptSub(sid)}],autoBtn:S.autoQ&&!sq.trial?()=>acceptSub(sid):null});return;}}
  if(S.qs==='avail'&&q.giver===id){openModal({...base,text:q.offer,body:qbox(q,'main',true),btns:[{t:'나중에',alt:true,f:closeModal},{t:'수락',pri:true,f:acceptQuest}],autoBtn:S.autoQ?acceptQuest:null});return;}
  if(N.guard&&wantRep===NALL[id].map&&!S.rq&&S.lv>=REP.lv)return repOffer(id);
  const btns=[];if(N.guard&&!S.rq&&S.lv>=REP.lv)btns.push({t:'토벌 의뢰',pri:true,f:()=>repOffer(id)});if(N.shop)btns.push({t:'상점',pri:true,f:()=>openShop(id)});if(N.forge)btns.push({t:'강화 상점 · 제작',pri:true,f:()=>openForge(id)});
  if((id==='orvin'||id==='karl'||id==='aila')&&godUnlocked())btns.push({t:'신탁 · 권능',pri:true,f:openGods});
  if(N.rest)btns.push({t:'휴식하기',pri:true,f:()=>{const st=pStats();player.hp=st.hp;player.mp=st.mp;toast('체력과 기력을 모두 회복했다',true);closeModal();}});
  if(N.rest&&S.grave&&S.grave.xp){const pr=gravePrice();btns.push({t:'경험치 복구 '+fmt(S.grave.xp)+' — '+fmt(pr)+' G',pri:S.gold>=pr,f:()=>{if(!S.grave)return closeModal();const pr=gravePrice();if(S.gold<pr){toast('골드가 부족하다 · '+fmt(pr)+' G 필요',true);return;}S.gold-=pr;STAT.graveG=(STAT.graveG||0)+pr;graveTake('inn');closeModal();}});}
  btns.push({t:'닫기',alt:true,f:closeModal});
  let text=N.greet[Math.floor(Math.random()*N.greet.length)];if(S.qs==='active'&&q.giver===id&&q.type!=='talk')text=q.gate&&!gateState(q).ok?'아직 준비가 덜 됐네. 조건을 채우고 오게.':'아직인가? '+qGoal(q,S.qn)+' — 서두르진 말게.';
  openModal({...base,text,body:S.qs==='active'&&q.giver===id?qbox(q,'main',false):null,btns});}
function openWay(){const body=el('div','shop');for(const mid in MAPS){if(MAPS[mid].inst)continue;const m=MAPS[mid],d=el('div','si'),open=S.maps.includes(mid);const nm=el('div','nm');nm.append(el('b',null,m.name+(mid===MAPID?' (현재 위치)':'')),el('small',null,Object.values(m.zones).filter(z=>z.lv).map(z=>z.name+' Lv '+z.lv).join(' · ')));d.appendChild(nm);
    const b=el('button','btn pri',open?'이동':'잠김');b.type='button';b.disabled=!open||mid===MAPID;b.onclick=()=>doTravel(mid);d.appendChild(b);body.appendChild(d);}
  riftRow(body);openModal({who:'hero',name:M.inst?'균열 문':'길잡이 표석',sub:M.inst?'균열에서 나가기 · 다른 지역으로':'마을 사이를 순간 이동 · 시간의 균열',text:'',body,btns:[{t:'닫기',alt:true,f:closeModal}]});}
/* openShop · openForge · openStats · openSkills · openSettings → windows.js (v4.8) */
function godCard(k){const G=GODS[k],lv=S.godLv[k],d=el('div','si');d.style.borderColor=S.god===k?G.col:'';const ic=el('span','wpic',G.ski);ic.style.cssText='display:grid;place-items:center;font-size:1.8em;color:'+G.col;d.appendChild(ic);
  const nm=el('div','nm');nm.append(el('b',null,G.name+' · '+G.title+'  Lv '+lv+(S.god===k?' (사용 중)':'')),el('small',null,G.desc(lv)));d.appendChild(nm);
  if(!hasGod(k)){const id=TRIAL_OF[k],st=(S.sq[id]||{}).st,sq=SUBQ[id];nm.appendChild(el('small',null,'획득 · '+sq.title+' — '+(!st?'메인 퀘스트 5 「도토리 숲의 소란」을 마치면 장로 오르빈에게서 열린다':st==='avail'?(trialReady(id)?'장로 오르빈에게 받기':'Lv '+sq.lv+'부터 받을 수 있다'):st==='active'?'진행 중 '+qGoal(sq,S.sq[id].n)+' · '+ZALL[sq.zone].name:'완료 · 장로 오르빈에게 보고')));
    d.style.opacity=.75;if(st){const e=el('button','btn pri',st==='active'?'사냥터로':'오르빈에게');e.type='button';e.onclick=()=>{closeModal();subGo(id);};d.appendChild(e);}return d;}
  if(S.god!==k){const e=el('button','btn','선택');e.type='button';e.onclick=()=>{S.god=k;player.hitN=0;player.shield=0;player.shT=0;toast(G.name+'의 권능을 받았다',true);burst(player.x,player.y,16,G.col,30,90,5);save();openGods();};d.appendChild(e);}
  if(lv<GOD_MAX){const c=godCost(lv),e=el('button','btn pri','각성 (파편 '+c.shard+' · '+fmt(c.gold)+' G)');e.type='button';e.disabled=S.shard<c.shard||S.gold<c.gold;e.onclick=()=>{if(S.shard<c.shard||S.gold<c.gold)return;S.shard-=c.shard;S.gold-=c.gold;S.godLv[k]++;toast(G.name+' 권능 Lv '+S.godLv[k],true);save();openGods();};d.appendChild(e);}return d;}
function openGods(){if(!godUnlocked()&&!TRIALS.some(id=>S.sq[id])){toast('메인 퀘스트 5 「도토리 숲의 소란」을 마치면 신의 시련이 열린다');return;}const body=el('div','shop');for(const k in GODS)body.appendChild(godCard(k));
  body.appendChild(el('p','note2','권능은 신의 시련 퀘스트로 하나씩 얻는다 · 얻은 권능 중 하나만 쓸 수 있고 언제든 바꿀 수 있다 · 각성 단계는 신마다 따로 남는다 · 권능 파편: 침공 보스 · 관문 정예 · 퀘스트'));
  openModal({who:MAPID==='kardo'?'karl':MAPID==='erna'?'aila':'orvin',name:'신탁 · 신의 권능',sub:'권능 파편 '+S.shard+' · 골드 '+fmt(S.gold),text:'',body,btns:[{t:'닫기',alt:true,f:closeModal}]});}

/* ================= 퀘스트 트래커 ================= */
let lastQKey='';
/* v4.11 퀘스트 트래커 (제우스: 에픽 퀘스트 위 · 그 아래 서브 / 누르면 자동 진행 · 아이온2: 반복 임무 진행 표시)
   탭 전체·메인·서브·의뢰 · 접기 · 카드마다 진행 막대 · 전체 탭은 서브 최대 3개 + '더 보기' */
let qTab='all',qFold=false;const Q_TABS=[['all','전체'],['main','메인'],['sub','서브'],['rep','반복'],['trial','시련']];
function subProg(id){const s=S.sq[id],sq=SUBQ[id];if(sq.grow||STATE_T[sq.type])return growthProg(sq,s);return [s.n||0,sq.n||1];}
function renderQuests(){const q=curQ(),g=q.gate&&S.qs==='active'?gateState(q):null;
  const key=[qTab,qFold,S.qi,S.qs,S.qn,nav?nav.kind:'',hunt?(hunt.sub||'h'):'',S.lv,S.god,S.repLoop||0,JSON.stringify(S.sq),JSON.stringify(S.rq||0),JSON.stringify(S.repR||0),inv?Math.ceil((inv.until-t)/5):0,rift?rift.k+'r'+(alive(riftEliteOf())?'e':''):(qTab==='rep'&&riftKey()?(riftUp()?'u'+(S.riftEK||0)+(riftPend()?'p':'')+Math.ceil(riftStay()/5):'c'+Math.ceil(riftCd()/5)):0),MAPID,g?g.ok+''+cpOf():'',S.sp,S.kp,pStats(null,true).faith,fieldBossInfo().map(m=>m.dead?Math.ceil((m.respawn-m.deadT)/5):'a').join(',')].join('|');if(key===lastQKey)return;lastQKey=key;
  const T=$('qtabs');if(T){T.replaceChildren();for(const [id,n] of Q_TABS){const b=el('button','qtb'+(qTab===id?' on':''),n);b.type='button';b.onclick=e=>{e.stopPropagation();qTab=id;qFold=false;lastQKey='';renderQuests();};T.appendChild(b);}
    const f=el('button','qtb fold',qFold?'▸':'▾');f.type='button';f.title=qFold?'펼치기':'접기';f.onclick=e=>{e.stopPropagation();qFold=!qFold;lastQKey='';renderQuests();};T.appendChild(f);}
  const L=$('qlist');L.replaceChildren();
  const card=(cls,tag,tagCls,title,desc,go,fn,prog)=>{/* v4.18 메인 외 카드는 한 줄: 제목 · 진행 수치 (설명은 마우스 오버) */const one=!/\bepic\b/.test(cls);const b=el(fn?'button':'div','qe panel '+cls+(one?' one':''));if(fn){b.type='button';b.onclick=fn;}const ds=el('span','ds');if(typeof desc==='string')ds.textContent=desc;else ds.append(...desc);b.append(el('span','tg '+tagCls,tag),el('span','tt',title));if(one&&prog)b.appendChild(el('span','qn',prog[0]+'/'+prog[1]));b.append(el('span','go',go),ds);if(one)b.title=title+(prog?' '+prog[0]+'/'+prog[1]:'')+' — '+ds.textContent;
    if(prog){const [a,c]=prog,bar=el('i','qp');const f=el('b');f.style.width=Math.min(100,a/Math.max(1,c)*100)+'%';bar.appendChild(f);b.appendChild(bar);}L.appendChild(b);return b;};
  const where=z=>ZALL[z].map!==MAPID?MAPS[ZALL[z].map].name+' · '+ZALL[z].name:ZALL[z].name;
  const showMain=qTab==='all'||qTab==='main',showSub=qTab==='all'||qTab==='sub',showRep=qTab==='all'||qTab==='rep',showTr=qTab==='all'||qTab==='trial';
  const sec=(n,tab)=>{if(qTab!=='all')return;if(!L.children.length)return;const h=el('i','qsec');h.setAttribute('aria-hidden','true');h.title=n;L.appendChild(h);};
  /* 메인 (에픽) */
  if(showMain||qFold){let desc,go,prog=null;if(S.qs==='avail'){desc=npcName(q.giver)+'에게 퀘스트 받기'+(NALL[q.giver].map!==MAPID?' ('+MAPS[NALL[q.giver].map].name+')':'');go='이동 ▶';}
    else if(S.qs==='done'){desc=npcName(turnNpc(q))+'에게 보상 받기';go='보상 ▶';}
    else if(g&&!g.ok){const miss=g.items.filter(x=>!x.ok);desc=[el('em','no','정예 출현 조건 '+(g.items.length-miss.length)+'/'+g.items.length),' · '+miss.map(x=>x.txt).slice(0,1).join('')];go='준비 ▶';prog=[g.items.length-miss.length,g.items.length];}
    else{desc=[el('em',null,qGoal(q,S.qn))];if(q.zone)desc.push(' · '+where(q.zone));if(q.type==='fboss'){const bq=QFB(q),bm=MAPID===qMap(q)&&eliteOf(bq),f=pStats(null,true).faith;if(bq.elite.fa)desc.push(el('em',f>=bq.elite.fa?null:'no',' · 신앙 '+f+'/'+bq.elite.fa));if(bm&&bm.dead){const r=Math.max(0,bm.respawn-bm.deadT);desc.push(' · 재출현 '+Math.floor(r/60)+':'+String(Math.floor(r%60)).padStart(2,'0'));}}
    if(q.elite&&q.elite.fa){const f=pStats(null,true).faith;desc.push(el('em',f>=q.elite.fa?null:'no',' · 신앙 '+f+'/'+q.elite.fa));}go=hunt&&!hunt.sub&&!(inv&&hunt.mob===inv.m)?'사냥 중':'이동 ▶';if(q.n)prog=[S.qn,q.n];}
    card('epic '+(S.qs==='done'?'done ':'')+((nav||hunt)&&!(hunt&&hunt.sub)?'run':''),S.qs==='done'?'완료':q.rep?'반복':q.gate?'관문':q.type==='fboss'?'지역 보스':'메인',q.rep?'rep':q.gate?'gatet':q.type==='fboss'?'fb':'',q.title,desc,go,questGo,prog);}
  if(qFold)return;
  /* 서브: 지금 메인의 서브 → 나머지(시련 등). 완료 > 진행 > 받기 순 */
  if(showSub){const own=new Set(q.subs||[]),ord=st=>st==='done'?0:st==='active'?1:2;
    /* v4.17: 시련·반복 의뢰는 각자의 탭으로 — 서브에는 섞지 않는다 */
    const ids=Object.keys(S.sq).filter(id=>S.sq[id].st!=='clear'&&!SUBQ[id].trial).sort((a,b)=>(own.has(b)-own.has(a))||ord(S.sq[a].st)-ord(S.sq[b].st));
    if(ids.length)sec('서브','sub');
    const lim=qTab==='all'?3:99;ids.slice(0,lim).forEach(id=>{const s=S.sq[id],sq=SUBQ[id];let d2,g2,pr=null;
      if(s.st==='avail'){d2=npcName(sq.giver)+'에게 받기';g2='이동 ▶';}else if(s.st==='done'){d2=npcName(sq.giver)+'에게 보상 받기';g2='보상 ▶';}
      else{pr=subProg(id);if(sq.grow){d2=[el('em',null,qGoal(sq,s.n)),' · '+GROW_HOW[sq.grow]];g2='열기 ▶';}else if(sq.type==='rep'||sq.type==='lv'||sq.type==='fbk'){d2=[el('em',null,qGoal(sq,s.n))];g2='진행 ▶';}else{d2=[el('em',null,qGoal(sq,s.n)),' · '+where(sq.zone)];g2=hunt&&hunt.sub===id?'사냥 중':'이동 ▶';}}
      card('sub '+(s.st==='done'?'done ':'')+(hunt&&hunt.sub===id?'run':''),s.st==='done'?'완료':sq.trial?'시련':sq.grow?'성장':STATE_T[sq.type]||sq.type==='fbk'?'반복':'서브',sq.trial?'god':sq.grow?'grow':STATE_T[sq.type]||sq.type==='fbk'?'rep':'sub',sq.title,d2,g2,()=>subGo(id),pr);});
    if(ids.length>lim){const m=el('button','qmore','서브 '+(ids.length-lim)+'개 더 보기 ▸');m.type='button';m.onclick=()=>{qTab='sub';lastQKey='';renderQuests();};L.appendChild(m);}
    if(qTab==='sub'&&!ids.length)L.appendChild(el('div','qnone','진행 중인 서브 퀘스트가 없다'));}
  /* 의뢰 · 필드 콘텐츠 */
  /* v4.17 시련: 플레이어가 고른다 — 고르기 전에는 '시련 선택' 카드, 고른 뒤엔 그 하나만 */
  if(showTr){const trOn=TRIALS.filter(id=>subSt(id)==='active'||subSt(id)==='done'),trAv=TRIALS.filter(id=>subSt(id)==='avail'&&trialReady(id)),trClr=TRIALS.filter(id=>subSt(id)==='clear');
    if(trOn.length||trAv.length)sec('신의 시련','trial');
    for(const id of trOn){const s=S.sq[id],sq=SUBQ[id],done=s.st==='done';card('sub '+(done?'done ':'')+(hunt&&hunt.sub===id?'run':''),done?'완료':'시련','god',sq.title,done?npcName(sq.giver)+'에게 보상 받기':[el('em',null,qGoal(sq,s.n)),sq.zone?' · '+where(sq.zone):''],done?'보상 ▶':hunt&&hunt.sub===id?'사냥 중':'이동 ▶',()=>subGo(id),done?null:subProg(id));}
    if(!trOn.length&&trAv.length)card('sub','시련','god','신의 시련 · '+trAv.length+'개 중 하나',trAv.map(id=>GODS[SUBQ[id].trial].name).join(' · ')+' — 골라서 받기','선택 ▶',()=>chooseTrial(false));
    if(qTab==='trial'&&!trOn.length&&!trAv.length){const nx=TRIALS.filter(id=>subSt(id)==='avail'&&!trialReady(id)).map(id=>SUBQ[id].lv||0).sort((a,b)=>a-b)[0];
      L.appendChild(el('div','qnone',trClr.length?'신의 시련을 마쳤다 · 권능을 확인하자':nx?'Lv '+nx+'에 신의 시련이 열린다':'아직 열린 시련이 없다'));}}
  if(showRep){const gid=guardOf(MAPID);
    if(S.rq||(gid&&S.lv>=REP.lv)||S.repLoop)sec('반복 의뢰','rep');
    if(S.rq){const z=S.rq.zone,done=S.rq.st==='done';card('sub rq '+(done?'done ':'')+(hunt&&hunt.sub==='rq'?'run':''),done?'완료':'의뢰','rep',MAPS[S.rq.map].name+' 토벌 의뢰 · '+(((S.repR||{})[S.rq.map]||0)+1)+'회째',done?npcName(guardOf(S.rq.map))+'에게 보상 받기':[el('em',null,ZALL[z].name+' '+S.rq.n+'/'+REP.n)],done?'보상 ▶':hunt&&hunt.sub==='rq'?'사냥 중':'이동 ▶',()=>repGo(),done?null:[S.rq.n,REP.n]);}
    else if(gid&&S.lv>=REP.lv)card('sub','반복','rep',MAPS[MAPID].name+' 토벌 의뢰','누적 '+((S.repR||{})[MAPID]||0)+'회 · '+npcName(gid)+'에게 받기','받기 ▶',()=>{S.autoQ=true;repGo(MAPID);});
    if(qTab==='rep'&&S.lv<REP.lv)L.appendChild(el('div','qnone','Lv '+REP.lv+'부터 경비대 토벌 의뢰를 반복할 수 있다'));
    if(qTab==='rep'&&S.lv>=REP.lv&&(gid||S.repLoop)){const on=!!S.repLoop,lm=S.repLoop||MAPID,b=el('button','qloop'+(on?' on':''));b.type='button';
      b.append(el('b',null,on?'🔁 반복 중 · '+MAPS[lm].name:'🔁 반복 끔'),el('small',null,on?'의뢰를 마치면 자동으로 다시 받는다 · 누르면 끈다':'켜면 '+MAPS[lm].name+' 의뢰를 계속 받아 사냥한다 (메인 진행은 멈춘다)'));
      b.onclick=e=>{e.stopPropagation();if(on){S.repLoop=null;toast('반복 의뢰 끔 · 지금 의뢰까지만 한다');}else{S.repLoop=lm;S.autoQ=true;toast('반복 의뢰 켬 · '+MAPS[lm].name,true);if(!S.rq)repGo(lm);}save();lastQKey='';renderQuests();};L.appendChild(b);}
    /* v4.46 균열 안 정보 · 나가기는 균열 HUD(트래커 맨 위)가 맡는다 */
    if(!rift&&qTab==='rep'&&riftKey())card('sub','균열','rep','시간의 균열',riftUp()?'열림 · '+mmss(riftStay())+' 남음 · '+(riftPend()?'균열의 주인이 기다린다':'주인까지 '+riftLeft()):'다음 균열까지 '+mmss(riftCd()),riftUp()?'입장 ▶':'대기',riftUp()?riftEnter:null);
    if(inv){const rem=Math.max(0,inv.until-t),mm=Math.floor(rem/60),ss=Math.floor(rem%60);card('inv','침공','inv','Lv'+inv.m.lv+' '+inv.m.name,ZONES[inv.zone].name+' · '+mm+':'+String(ss).padStart(2,'0')+' 남음',hunt&&hunt.mob===inv.m?'토벌 중':'토벌 ▶',()=>goHunt(inv.zone,null,inv.m,ZONES[inv.zone].name+'(으)로 · 침공 보스 토벌'));}
    const fb=fieldBossInfo().filter(m=>!(q.type==='fboss'&&m.eliteOf===q.boss)),al=fb.filter(alive);if(al.length){const m=al.reduce((a,b)=>dist(a,player)<dist(b,player)?a:b),f=pStats(null,true).faith;card('fb','지역 보스','fb',m.name,[ZONES[m.zone].name+' · ',el('em',f>=m.fa?null:'no','신앙 '+f+'/'+m.fa),al.length>1?' · 외 '+(al.length-1):''],hunt&&hunt.mob===m?'토벌 중':'토벌 ▶',()=>goHunt(m.zone,null,m,ZONES[m.zone].name+'(으)로 · 지역 보스 토벌'));}
    else if(fb.length&&qTab==='rep'){const m=fb.reduce((a,b)=>(a.respawn-a.deadT)<(b.respawn-b.deadT)?a:b),rem=Math.max(0,m.respawn-m.deadT);card('fb','지역 보스','fb',m.name,'다시 나타나기까지 '+Math.floor(rem/60)+':'+String(Math.floor(rem%60)).padStart(2,'0'),'대기',null);}}
  if(godUnlocked()&&!S.god&&qTab==='all')card('done','권능','god','권능을 고를 수 있다',kTxt('신의 권능 선택 (P)'),'선택 ▶',openGods);
}

/* ================= 입력 ================= */
const keys=new Set();let joy={on:false,id:null,ox:0,oy:0,dx:0,dy:0};
/* v4.8.7: 한글 입력 상태에서도 단축키가 먹도록 물리 키 위치(e.code)로 판정 — 한글이면 e.key가 'ㅈ'·'Process'로 들어온다 */
function keyOf(e){const c=e.code||'';if(c.startsWith('Key'))return c.slice(3).toLowerCase();if(c.startsWith('Digit'))return c.slice(5);if(c.startsWith('Numpad')&&/\d$/.test(c))return c.slice(-1);
  if(c==='Space')return ' ';if(c.startsWith('Arrow'))return c.toLowerCase();if(c==='Escape')return 'escape';return (e.key||'').toLowerCase();}
addEventListener('keydown',e=>{const k0=keyOf(e);if(!started||traveling)return;
  /* v4.35 키 설정 창에서 [키] 버튼을 누른 뒤 다음 키 입력 = 새 키 (Esc = 취소 · 고정 키는 거절) */
  if(kbCap){e.preventDefault();if(k0==='escape'){kbCap=null;renderWin();return;}const r=setKey(kbCap,k0);if(r===false){toastThr('이 키는 쓸 수 없다 · 이동 WASD · 스킬 1~8 · Space · Esc는 고정');return;}kbCap=null;renderWin();return;}
  const k=kAct(k0);
  if(k==='escape'&&!$('keys').hidden){toggleKeys(false);return;}
  if(k==='escape'&&!$('menuPop').hidden){toggleMenu(false);return;}
  if(k==='escape'&&!$('npcPop').hidden){toggleNpcList(false);return;}
  if(win){if(k==='escape'||(k===win.key)){e.preventDefault();closeWin();}else{/* v4.29 창이 열려 있어도 다른 창 단축키로 바로 바꾼다 (닫고 다시 열 필요 없음) */const W={i:openBag,c:openStats,k:openSkills,j:openEnchant,u:openCraft,o:openColl,l:openLog,p:()=>{closeWin();openGods();}}[k];if(W&&k.length===1){e.preventDefault();W();}}return;}
  if(modal){if(k==='escape'&&!player.dead)closeModal();return;}
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();keys.add(k0);
  if(k===' '){const m=alive(target)?target:nearestMob(90);if(m){target=m;if(!basicAttack(m)){chase=m;}}}
  else if('12345678'.includes(k)&&k.length===1)castSlot(+k-1);else if(k==='r')toggleAuto();else if(k==='t')toggleAutoQ();else if(k==='g')questGo();
  else if(k==='q')usePot('hp');else if(k==='e')usePot('mp');else if(k==='f'){const n=npcList.filter(n=>!n.deco).sort((a,b)=>dist(a,player)-dist(b,player))[0];if(n&&dist(n,player)<60)openNpc(n.id);else toast('가까이에 대화할 사람이 없다');}
  else if(k==='c')openStats();else if(k==='k')openSkills();else if(k==='i')openBag();else if(k==='p')openGods();else if(k==='m')toggleMenu();else if(k==='n')toggleNpcList();else if(k==='u')openCraft();else if(k==='j')openEnchant();else if(k==='o')openColl();else if(k==='l')openLog();else if(k==='b')goTown();else if(k==='z')toggleZoom();else if(k==='h')toggleKeys();else if(k==='escape'){cancelNav();chase=null;}});
addEventListener('keyup',e=>keys.delete(keyOf(e)));
addEventListener('blur',()=>keys.clear());
function toggleAuto(){auto=!auto;anchor=null;if(!auto)hunt=null;toast(auto?'자동 전투 시작':'자동 전투 종료');}
function toggleAutoQ(){S.autoQ=!S.autoQ;toast(S.autoQ?'퀘스트 자동 진행 켬 · 수락·이동·사냥·보상을 자동으로':'퀘스트 자동 진행 끔');save();if(S.autoQ&&!nav&&!hunt&&!modal)autoNext();}
function goTown(){if(player.dead)return;if(M.inst){/* v4.46 균열 안 귀환 = 들어온 지역의 마을 광장 */if(!S.scroll){toast('귀환 주문서가 없다 · 화면의 [나가기]로 균열에서 나갈 수 있다');return;}S.scroll--;if(rift)riftEnd('town');else riftLeave();return;}if(inR(ZONES.village.r,player.x,player.y,0)){toast('이미 마을이다');return;}if(!S.scroll){toast('귀환 주문서가 없다 · 상점에서 구입');return;}S.scroll--;cancelNav();chase=null;auto=false;$('flash').classList.add('on');setTimeout(()=>$('flash').classList.remove('on'),200);player.x=PLAZA.x;player.y=PLAZA.y+40;snapCam();toast(ZONES.village.name+'(으)로 귀환했다');}
let zoomT=1;
function setZoom(z){zoomT=Math.max(ZOOM.min,Math.min(ZOOM.max,Math.round(z*100)/100));if(Math.abs(zoomT-1)<.04)zoomT=1;if(S&&started){S.zoom=zoomT;save();}$('bZoom').textContent=Math.round(zoomT*100)+'%';}
function toggleZoom(){setZoom(zoomT>1.05?1:1.4);}
stage.addEventListener('wheel',e=>{if(!started||modal||win)return;/* v4.28 퀘스트 목록이 넘치면 휠은 목록 스크롤 */{const L=e.target.closest&&e.target.closest('#qlist');if(L&&L.scrollHeight>L.clientHeight+1)return;}e.preventDefault();setZoom(zoomT*(e.deltaY<0?ZOOM.step:1/ZOOM.step));},{passive:false});
const ray=new T3.Raycaster(),ndc=new T3.Vector2();
function pickAt(sx,sy){let best=null,bd=34;const test=(o,h)=>{const [x,y]=W2S(o.x,o.y,h);const d=Math.hypot(x-sx,y-sy);if(d<bd){bd=d;best=o;}};
  for(const n of npcList)if(!n.deco)test(n,n.way?22:16);for(const m of mobs)if(alive(m))test(m,monH(m.sp)*m.sc*.5);return best;}
function groundAt(sx,sy){const r=stage.getBoundingClientRect();ndc.set(sx/r.width*2-1,-(sy/r.height)*2+1);ray.setFromCamera(ndc,cam);const h=ray.intersectObject(terrain)[0];return h?{x:h.point.x,y:h.point.z}:null;}
stage.addEventListener('pointerdown',e=>{if(!started||modal||win||traveling||e.target.closest('.hud button,.mm,.joyz,.win'))return;const r=stage.getBoundingClientRect(),sx=e.clientX-r.left,sy=e.clientY-r.top;
  if(e.pointerType==='touch'&&sx<r.width*.42&&sy>r.height*.38)return;
  stopAutoQ();const o=pickAt(sx,sy);if(o&&!o.sp){if(dist(o,player)<46)openNpc(o.id);else navTo('npc',o.id,o.way?'길잡이 표석':npcName(o.id)+'에게');return;}
  if(o&&o.sp){target=o;chase=o;nav=null;hunt=null;return;}
  const gp=groundAt(sx,sy);if(gp){chase=null;hunt=null;if(navTo('point',gp,'이동')){moveRing.visible=true;moveRing.userData.p=gp;}}});
mini.addEventListener('pointerdown',e=>{if(!started||modal)return;stopAutoQ();const r=mini.getBoundingClientRect(),V=M.mini,x=V?V.x+(e.clientX-r.left)/r.width*V.w:(e.clientX-r.left)/r.width*WW,y=V?V.y+(e.clientY-r.top)/r.height*V.w:(e.clientY-r.top)/r.height*WH;chase=null;hunt=null;navTo('point',{x,y},'지도 지점으로');e.stopPropagation();});
const joyz=$('joyz'),joyEl=$('joy'),knob=$('knob');
function joyPos(){const r=stage.getBoundingClientRect();joyEl.style.left=(joy.on?joy.ox:r.width*.13)+'px';joyEl.style.top=(joy.on?joy.oy:r.height*.72)+'px';}
joyz.addEventListener('pointerdown',e=>{joy.on=true;joy.id=e.pointerId;const r=stage.getBoundingClientRect();joy.ox=e.clientX-r.left;joy.oy=e.clientY-r.top;joy.dx=joy.dy=0;joyEl.classList.add('on');joyPos();joyz.setPointerCapture(e.pointerId);});
joyz.addEventListener('pointermove',e=>{if(!joy.on||e.pointerId!==joy.id)return;const r=stage.getBoundingClientRect(),R=joyEl.offsetWidth*.42;let dx=e.clientX-r.left-joy.ox,dy=e.clientY-r.top-joy.oy;const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d;}joy.dx=dx/R;joy.dy=dy/R;knob.style.transform=`translate(${dx}px,${dy}px)`;});
const joyEnd=e=>{if(e.pointerId!==joy.id)return;joy.on=false;joy.dx=joy.dy=0;knob.style.transform='';joyEl.classList.remove('on');joyPos();};
joyz.addEventListener('pointerup',joyEnd);joyz.addEventListener('pointercancel',joyEnd);
addEventListener('touchstart',()=>{if(!document.body.classList.contains('touch')){document.body.classList.add('touch');if(started){joyz.hidden=false;joyEl.hidden=false;joyPos();}}},{passive:true});
$('s0').onclick=()=>{const m=alive(target)?target:nearestMob(120);if(m){target=m;if(!basicAttack(m))chase=m;}};
for(let j=0;j<SLOT_N;j++)$('s'+(j+1)).onclick=()=>castSlot(j);
function castSlot(j){const id=S.slots[j];if(!id){openSkills(null,j);return;}castSkill(skIdx(id));}
$('bAuto').onclick=toggleAuto;$('autoQ').onclick=toggleAutoQ;
$('pHP').onclick=()=>usePot('hp');$('pMP').onclick=()=>usePot('mp');
$('pHP').oncontextmenu=e=>{e.preventDefault();S.autoPot=!S.autoPot;toast('HP 물약 자동 사용 '+(S.autoPot?'켬':'끔'));};
/* v4.8.6 조작법: 항상 보이지 않고 왼쪽 아래 [조작법 보기] → 버튼 위 작은 팝업 (다시 누르기 · 화면 터치 · Esc로 닫기) */
/* v4.34 조작법 안내를 한 곳(KEYGUIDE)에서 만든다 — 묶음(이동·전투 / 자동 / 창 / 화면) · 빠졌던 Q · E · T · B · Z · Esc · H 반영 · tests/keys434_test.py가 keydown 처리 키와 대조 */
const KEYGUIDE=[
  ['이동 · 전투',[['이동','WASD','방향키'],['공격','Space'],['스킬','1~8'],['HP 물약','Q'],['MP 물약','E'],['대화','F'],['멈춤','Esc']]],
  ['자동',[['자동 전투','R'],['퀘스트 자동 진행','T'],['퀘스트 이동','G'],['마을 귀환','B']]],
  ['창',[['가방','I'],['강화','J'],['제작','U'],['컬렉션','O'],['기록','L'],['능력치','C'],['스킬','K'],['권능','P'],['메뉴','M'],['NPC 목록','N']]],
  ['화면',[['확대·축소','Z','휠'],['조작법','H'],['이동 · 공격 · 대화','클릭']]]];
function fillKeys(){const box=document.querySelector('#keys .kpc');if(!box)return;box.replaceChildren();
  for(const [g,L] of KEYGUIDE){const row=el('span','kg');row.appendChild(el('b','kgh',g));const ks_=el('span','kis');row.appendChild(ks_);
    L.forEach(([n,...ks],i)=>{const it=el('span','ki');it.append(n+' ');ks.forEach((k,j)=>{if(j)it.append('/');const lk=k.toLowerCase(),ch=/^[A-Z]$/.test(k)&&typeof KB_ACTS!=='undefined'&&kb(lk)!==lk;it.appendChild(el('kbd',ch?'chg':null,ch?kbU(lk):k));});ks_.appendChild(it);});box.appendChild(row);}
  box.appendChild(el('span','ktip','창이 열려 있을 때 — 다른 창 키 = 바로 전환 · 같은 키 · Esc = 닫기 · 창을 열어도 게임은 멈추지 않는다'));
  const ks=el('button','btn alt kset','키 바꾸기');ks.type='button';ks.id='kSet';ks.onclick=e=>{e.stopPropagation();toggleKeys(false);openKeyset();};box.appendChild(ks);}
/* v4.35 단축키 바꾸기: 조작법 안내(KEYGUIDE)의 한 글자 키 = 바꿀 수 있는 동작(기본 글자가 동작 id) · S.keymap={기본:새 키} · 겹치면 맞바꿈
   keydown은 kAct(실제 키) → 동작 id(기본 글자)로 바꿔 기존 처리 코드를 그대로 쓴다 · 이동 WASD/방향키 · Space · 1~8 · Esc는 고정 */
const KB_ACTS=KEYGUIDE.flatMap(([,L])=>L.flatMap(([,...ks])=>ks.filter(k=>/^[A-Z]$/.test(k)).map(k=>k.toLowerCase())));
const KB_OK=new Set([...'abcdefghijklmnopqrstuvwxyz90'].filter(c=>!'wasd'.includes(c)));
let kbCap=null;
function kb(d){const m=S&&S.keymap;return (m&&m[d])||d;}
function kbU(d){return kb(d).toUpperCase();}
function kAct(k){if(!KB_OK.has(k))return k;for(const d of KB_ACTS)if(kb(d)===k)return d;return '';}
function kTxt(s){try{return String(s).replace(/\(([A-Z])\)/g,(m,c)=>KB_ACTS.includes(c.toLowerCase())?'('+kbU(c.toLowerCase())+')':m);}catch(e){return s;}}
function kbName(d){for(const [,L] of KEYGUIDE)for(const [n,...ks] of L)if(ks.includes(d.toUpperCase()))return n;return d;}
function setKey(d,nk){if(!KB_OK.has(nk)||!KB_ACTS.includes(d))return false;const old=kb(d);if(old===nk)return null;const o=KB_ACTS.find(x=>x!==d&&kb(x)===nk);
  const m=S.keymap=S.keymap||{};m[d]=nk;if(o)m[o]=old;for(const x in m)if(m[x]===x)delete m[x];save();kbRefresh();
  toast(kbName(d)+' → '+nk.toUpperCase()+(o?' · '+kbName(o)+'은(는) '+old.toUpperCase()+'(으)로 맞바꿈':''),true);return o||'';}
function kbReset(){S.keymap={};kbCap=null;save();kbRefresh();toast('단축키를 기본값으로 되돌렸다',true);}
function kbRefresh(){fillKeys();const b=$('bKeys');if(b)b.title='조작법 ('+kbU('h')+')';lastQKey='';if(win)renderWin();}
fillKeys();
function toggleKeys(on){const k=$('keys'),b=$('bKeys');on=on??k.hidden;k.hidden=!on;b.setAttribute('aria-expanded',on);b.textContent=on?'조작법 닫기':'조작법 보기';if(on)popFit(k);}
/* v4.36 작은 창(조작법 · NPC 목록 · 메뉴)은 화면 아래로 넘치지 않게 높이를 줄이고(안은 스크롤), 새로 연 창과 겹치는 다른 작은 창은 닫는다 */
const POPS=[['keys',()=>toggleKeys(false)],['npcPop',()=>toggleNpcList(false)],['menuPop',()=>toggleMenu(false)]];
function popFit(p){if(!p||p.hidden)return;if(p.id!=='keys'){p.style.maxHeight='';const r0=p.getBoundingClientRect(),room=innerHeight-r0.top-8;if(r0.height>room)p.style.maxHeight=Math.max(80,room)+'px';}
  const r=p.getBoundingClientRect();for(const [id,close] of POPS){if(id===p.id)continue;const o=$(id);if(!o||o.hidden)continue;const q=o.getBoundingClientRect();if(q.left<r.right&&r.left<q.right&&q.top<r.bottom&&r.top<q.bottom)close();}}
$('bKeys').onclick=e=>{e.stopPropagation();toggleKeys();};
stage.addEventListener('pointerdown',e=>{if(!$('keys').hidden&&!e.target.closest('#bKeys,#kSet'))toggleKeys(false);},true);
$('bTown').onclick=goTown;$('bZoom').onclick=toggleZoom;$('bGod').onclick=openGods;$('bStat').onclick=()=>openStats();$('bSkill').onclick=()=>openSkills();$('bBag').onclick=()=>openBag();$('bSet').onclick=()=>openSettings();$('bCraft').onclick=()=>openCraft();
/* v4.16 NPC 목록 (미니맵 아래 NPC 버튼 · N): 이 지역 NPC와 하는 일, [이동]으로 그 NPC에게 자동 이동 */
function npcTag(id){const N=NPCS[id];if(N.shop)return '상점';if(N.forge)return '대장간';if(N.rest)return '여관';if(N.guard)return '경비대 · 토벌 의뢰';return (N.role||'').split('·')[0].trim()||'주민';}
function toggleNpcList(on){const p=$('npcPop'),b=$('bNpc');on=on??p.hidden;p.hidden=!on;b.setAttribute('aria-expanded',on);if(!on)return;p.replaceChildren();
  const h=el('div','nph');const x=el('button','npx','×');x.type='button';x.title='닫기';x.onclick=()=>toggleNpcList(false);h.append(M.name+' NPC',x);p.appendChild(h);
  const q=curQ(),mark=id=>{const mk=npcMark(id);return mk?mk[0]:'';};
  const row=(name,tag,go,m)=>{const r=el('div','npr'),l=el('span');l.append(el('b',null,name),el('small',null,'('+tag+')'));if(m)l.appendChild(el('em',null,m==='?'?'보상':'퀘스트'));const b=el('button','btn pri','이동');b.type='button';b.onclick=()=>{toggleNpcList(false);if(player.dead)return;stopAutoQ();go();};r.append(l,b);p.appendChild(r);};
  for(const id in NPCS){if(NPCS[id].deco)continue;row(npcName(id),npcTag(id),()=>goNpc(id,npcName(id)+'에게'),mark(id));}
  row('길잡이 표석','지역 이동',()=>navTo('npc','way','길잡이 표석으로'));popFit(p);}
$('bNpc').onclick=e=>{e.stopPropagation();toggleNpcList();};
document.addEventListener('pointerdown',e=>{if(!$('npcPop').hidden&&!e.target.closest('#npcPop')&&!e.target.closest('#bNpc'))toggleNpcList(false);});$('bEnc').onclick=()=>openEnchant();$('bColl').onclick=()=>openColl();$('bLog').onclick=()=>openLog();$('bRift').onclick=()=>openRift();{const x=$('rhX');if(x)x.onclick=e=>{e.stopPropagation();if(rift)riftAsk();};}{const c=$('riftChip');if(c)c.onclick=e=>{e.stopPropagation();openRift();};}
/* v4.12 메뉴: 스킬·능력치·가방·제작·컬렉션·권능·설정을 ☰ 하나로 (레드닷은 메뉴 버튼과 각 항목에) */
function toggleMenu(on){const p=$('menuPop'),b=$('bMenu');on=on??p.hidden;p.hidden=!on;b.setAttribute('aria-expanded',on);if(on)popFit(p);}
$('bMenu').onclick=e=>{e.stopPropagation();toggleMenu();};$('menuPop').addEventListener('click',e=>{if(e.target.closest('.tmb'))toggleMenu(false);});
document.addEventListener('pointerdown',e=>{if(!$('menuPop').hidden&&!e.target.closest('.topmenu'))toggleMenu(false);});$('navX').onclick=()=>{cancelNav();};
/* =====================================================================
   v4.8 창 — 가방(I) · 능력치(C) · 스킬 수련(K) · 설정 · 상점 · 대장장이
   - 큰 창(win)을 연 동안 전투·타이머 정지 (update에서 win이면 진행하지 않음)
   - 가방 · 능력치 · 스킬은 같은 창의 탭으로 오간다
   ===================================================================== */
let win=null;
const WTABS=[['bag','가방','I'],['enc','강화','J'],['craft','제작','U'],['coll','컬렉션','O'],['log','기록','L'],['stats','능력치','C'],['skills','스킬','K']];
/* v4.36 창 위치 · 크기 기억 (MMORPG 라이크 UI 편집 · HUD 프리셋): 머리줄을 끌어 옮기고 [100%]로 크기(100 → 90 → 80%)를 고른다
   - 탭으로 오가는 창(가방 · 강화 · 제작 · 컬렉션 · 기록 · 능력치 · 스킬)은 한 묶음('main'), 나머지(상점 · 설정 · 대장장이 …)는 창마다 따로
   - S.winUi={창:{x,y,s}} — x,y는 화면 폭 · 높이 대비 비율(화면 크기가 바뀌어도 같은 자리), 머리줄은 늘 화면 안 · 키 설정처럼 새 게임에도 유지
   - [↺] 또는 머리줄 두 번 누르기 = 그 창만 처음대로 */
const WSIZES=[1,.9,.8];
const winGrp=o=>WTABS.some(t=>t[0]===o.id)?'main':o.id;
function winPos(){return win?((S.winUi||{})[winGrp(win)]||null):null;}
function winClamp(x,y){/* 창 전체가 화면 안 — 옮겨도 동작 버튼이 화면 밖으로 나가지 않게(원칙 8) */const bx=document.querySelector('#win .wbox');if(!bx)return [x,y];bx.style.setProperty('--wx','0px');bx.style.setProperty('--wy','0px');const r=bx.getBoundingClientRect(),W=innerWidth,H=innerHeight;
  x=Math.max(Math.min(0,-r.left),Math.min(Math.max(0,W-r.right),x));y=Math.max(Math.min(0,-r.top),Math.min(Math.max(0,H-r.bottom),y));return [Math.round(x),Math.round(y)];}
function winApply(){const bx=document.querySelector('#win .wbox');if(!bx)return;const p=winPos()||{};const s=WSIZES.includes(p.s)?p.s:1;bx.style.setProperty('--ws',s);
  const [x,y]=winClamp((p.x||0)*innerWidth,(p.y||0)*innerHeight);bx.style.setProperty('--wx',x+'px');bx.style.setProperty('--wy',y+'px');
  $('wSz').textContent=Math.round(s*100)+'%';$('wRs').hidden=!(p.x||p.y||s!==1);}
function winSet(ch){if(!win)return;const U=S.winUi=S.winUi||{},g=winGrp(win),p=Object.assign({x:0,y:0,s:1},U[g]||{},ch);if(!p.x&&!p.y&&p.s===1)delete U[g];else U[g]=p;winApply();save();}
function winReset(){if(!win)return;if(S.winUi)delete S.winUi[winGrp(win)];winApply();save();toast('창을 처음 자리 · 크기로 되돌렸다');}
$('wSz').onclick=()=>{const p=winPos()||{},i=WSIZES.indexOf(p.s||1);winSet({s:WSIZES[(i+1)%WSIZES.length]});};
$('wRs').onclick=winReset;
{let dr=null;const wh=document.querySelector('#win .wh');
  wh.addEventListener('pointerdown',e=>{if(e.button>0||e.target.closest('button'))return;const bx=wh.parentNode,cs=getComputedStyle(bx);dr={sx:e.clientX,sy:e.clientY,ox:parseFloat(cs.getPropertyValue('--wx'))||0,oy:parseFloat(cs.getPropertyValue('--wy'))||0,mv:false,id:e.pointerId};});
  document.addEventListener('pointermove',e=>{if(!dr||e.pointerId!==dr.id)return;const dx=e.clientX-dr.sx,dy=e.clientY-dr.sy;if(!dr.mv&&Math.hypot(dx,dy)<4)return;if(!dr.mv){dr.mv=true;hideTip();wh.parentNode.classList.add('drag');}
    const bx=wh.parentNode,[x,y]=winClamp(dr.ox+dx,dr.oy+dy);bx.style.setProperty('--wx',x+'px');bx.style.setProperty('--wy',y+'px');});
  document.addEventListener('pointerup',e=>{if(!dr||e.pointerId!==dr.id)return;const d=dr;dr=null;const bx=wh.parentNode;bx.classList.remove('drag');if(!d.mv||!win)return;const cs=getComputedStyle(bx);winSet({x:(parseFloat(cs.getPropertyValue('--wx'))||0)/innerWidth,y:(parseFloat(cs.getPropertyValue('--wy'))||0)/innerHeight});});
  document.addEventListener('pointercancel',()=>{if(dr){dr=null;wh.parentNode.classList.remove('drag');}});
  wh.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;winReset();});
  addEventListener('resize',()=>{if(win)winApply();});}
function openWin(o){stopHold();if(win&&win.id==='bag'&&o.id!=='bag')for(const it of S.items)delete it.nw;if(modal&&!player.dead){/* v4.78 자동 진행 대화는 버리지 않고 이어서 처리한다 */const ab=S.autoQ&&modal.autoBtn;closeModal();if(ab)later(.4,()=>{if(S.autoQ&&!modal&&!player.dead)ab();});}hideTip();document.querySelectorAll('.encfx').forEach(e=>e.remove());kbCap=null;const g0=win&&winGrp(win);win=o;$('win').hidden=false;$('win').dataset.id=o.id;renderWin();if(g0!==winGrp(o))winApply();}
function closeWin(){stopHold();kbCap=null;if(!win)return;if(win.id==='bag')for(const it of S.items)delete it.nw;win=null;$('win').hidden=true;hideTip();stage.focus({preventScroll:true});lastQKey='';aqIdle=0;}
function renderWin(){const o=win;if(!o)return;$('wKick').textContent=o.kick||'';$('wTitle').textContent=o.title;const inf=$('wInfo');inf.replaceChildren(...(o.info?o.info():[]));
  const tb=$('wTabs');tb.replaceChildren();if(o.tabs!==false)for(const [id,n,k] of WTABS){const b=el('button','wtab'+(o.id===id?' on':''),n);b.type='button';if(k&&!document.body.classList.contains('touch'))b.appendChild(el('kbd',null,kbU(k.toLowerCase())));
    const dot=id==='bag'?equipBetterN()>0:id==='stats'?S.sp>0:id==='skills'?SK.some((s,i)=>skCan(i)):id==='coll'?collCanAny():id==='enc'?enchHint():id==='craft'?craftHint():id==='log'?acqMissNew():false;if(dot)b.classList.add('dot');b.onclick=()=>({bag:openBag,enc:()=>openEnchant(),craft:openCraft,coll:openColl,log:openLog,stats:openStats,skills:openSkills})[id]();tb.appendChild(b);}
  tb.hidden=o.tabs===false;const B=$('wBody'),F=$('wFoot');
  /* v4.14: 다시 그려도 스크롤 위치 유지 (같은 창일 때) — 스킬 목록을 누르면 맨 위로 튀던 버그 */
  const keep=B.dataset.id===o.id?[...B.querySelectorAll('*')].filter(e=>e.scrollTop>0||e.scrollLeft>0).map(e=>[pathOf(e,B),e.scrollTop,e.scrollLeft]):[];const bs=B.dataset.id===o.id?B.scrollTop:0;
  B.replaceChildren();F.replaceChildren();B.className='wb wb-'+o.id;B.dataset.id=o.id;o.render(B,F);B.scrollTop=bs;
  for(const [pth,st,sl] of keep){const e=fromPath(pth,B);if(e){e.scrollTop=st;e.scrollLeft=sl;}}}
function pathOf(e,root){const p=[];while(e&&e!==root){p.unshift([...e.parentNode.children].indexOf(e));e=e.parentNode;}return p;}
function fromPath(p,root){let e=root;for(const i of p){e=e&&e.children[i];}return e||null;}
$('wX').onclick=closeWin;
/* v4.16: 팝업(아이템 · 재료 얻는 곳) 바깥을 누르면 닫힌다 — 팝업을 여는 버튼을 누른 경우는 그 버튼이 새로 연다 */
document.addEventListener('pointerdown',e=>{const tp=$('itip');if(!tp||tp.hidden)return;if(tp.contains(e.target))return;hideTip();},true);$('win').addEventListener('pointerdown',e=>{if(e.target.id==='win')closeWin();});
/* 공통 */
const btn=(t,cls,f,dis)=>{const b=el('button','btn'+(cls?' '+cls:''),t);b.type='button';if(dis)b.disabled=true;b.onclick=f;return b;};
const icv=(c,cls)=>{const x=mk(c.width,c.height);x.getContext('2d').drawImage(c,0,0);x.className=cls||'icv';return x;};
function hideTip(){const t=$('itip');if(t){t.hidden=true;t.replaceChildren();}}
function showTip(anchor,build){const tp=$('itip');tp.replaceChildren();const tx=el('button','tipx','×');tx.type='button';tx.title='닫기';tx.setAttribute('aria-label','닫기');tx.onclick=e=>{e.stopPropagation();hideTip();};tp.appendChild(tx);build(tp);tp.hidden=false;const box=$('win').querySelector('.wbox').getBoundingClientRect(),r=anchor.getBoundingClientRect();
  const w=tp.offsetWidth,h=tp.offsetHeight;let x=r.right-box.left+8,y=r.top-box.top;if(x+w>box.width-8)x=r.left-box.left-w-8;if(x<8)x=8;if(y+h>box.height-8)y=box.height-h-8;if(y<8)y=8;tp.style.left=x+'px';tp.style.top=y+'px';}
const pct=v=>(v*100).toFixed(1)+'%';

/* ================= 가방 + 장비 (I) ================= */
const BAG_CAT=[['all','전체'],['eq','장비'],['use','소모품'],['mat','재료 · 기타']];
let bagCat='all',bagSel=null;/* bagCat은 S.bagUi.cat과 같이 움직인다 (v4.30) */
const encLbl=it=>Math.round(enchRate(it)*100)+'%';
function openBag(mode){if(!started||player.dead)return;if(win&&win.id==='bag'){renderWin();return;}
  openWin({id:'bag',key:'i',kick:'INVENTORY / EQUIPMENT',title:'가방',enc:null,info:()=>[],render:renderBag});}
/* v4.30 가방 정렬 · 필터 (MMORPG 라이크 가방 정렬 버튼 · 보기 필터) — 선택은 세이브(S.bagUi)에 저장
   정렬: 장비 칸에만 적용 · 장착 중은 항상 맨 앞 · 같은 값이면 기본 순서(부위 → 단계 → 등급 → 강화)
   필터: NEW(지금보다 좋음 또는 새로 얻음) · 컬렉션 가능(등록할 수 있는 사본) · 분해 대상(일괄 분해 기준과 같음, 등급 무관) — 필터가 켜지면 장비만 보인다 */
const BAG_SORT=[['def','기본'],['grade','등급'],['slot','부위'],['tier','단계'],['en','강화']];
const BAG_FLT=[['all','전체 보기'],['new','NEW만'],['coll','컬렉션 가능만'],['dis','분해 대상만'],['lock','잠금만']];
function bagUi(){if(!S.bagUi||typeof S.bagUi!=='object')S.bagUi={};const u=S.bagUi;if(!BAG_SORT.some(x=>x[0]===u.sort))u.sort='def';if(!BAG_FLT.some(x=>x[0]===u.flt))u.flt='all';if(!BAG_CAT.some(x=>x[0]===u.cat))u.cat='all';return u;}
function disTarget(it){return !isEq(it)&&!it.lock&&!betterThanEq(it)&&!collNeeds(it);}
function bagFltOk(it,f){if(f==='new')return !isEq(it)&&(betterThanEq(it)||!!it.nw);if(f==='coll')return !isEq(it)&&!it.lock&&!!collNeeds(it);if(f==='dis')return disTarget(it);if(f==='lock')return !!it.lock;return true;}
function bagSortItems(arr,sort){const ord=k=>['weapon','helm','armor','cloak','gloves','boots','neck','ring'].indexOf(k);
  const base=(a,b)=>ord(a.k)-ord(b.k)||b.t-a.t||b.g-a.g||b.en-a.en||a.u-b.u;
  const key={grade:(a,b)=>b.g-a.g,slot:(a,b)=>ord(a.k)-ord(b.k),tier:(a,b)=>b.t-a.t,en:(a,b)=>b.en-a.en}[sort]||(()=>0);
  return [...arr].sort((a,b)=>(isEq(b)-isEq(a))||key(a,b)||base(a,b));}
function bagEntries(){const L=[],u=bagUi(),f=u.flt;if(f==='all')for(const k of STK_ORDER)if(cnt(k)>0)L.push({stk:k,cat:STK[k].cat});
  for(const it of bagSortItems(S.items.filter(it=>bagFltOk(it,f)),u.sort))L.push({it,cat:'eq'});
  if(f!=='all')return L;
  /* 퀘스트 수집품(무게 없음) */
  const q=curQ();if(S.qs==='active'&&q.type==='collect')L.push({quest:{n:q.item,c:S.qn,of:q.n},cat:'mat'});
  for(const id in S.sq){const s=S.sq[id],sq=SUBQ[id];if(s.st==='active'&&sq.type==='collect')L.push({quest:{n:sq.item,c:s.n,of:sq.n},cat:'mat'});}
  return L;}
function renderBag(B,F){const o=win,enc=o.enc;
  const wrap=el('div','bag');B.appendChild(wrap);
  /* 왼쪽: 장비 인형 */
  const doll=el('div','doll'),dg=el('div','dgrid');doll.appendChild(dg);
  const L=['helm','armor','cloak','boots'],R=['weapon','gloves','neck','ring1','ring2'];
  const colL=el('div','dcol'),colR=el('div','dcol'),mid=el('div','dmid');
  const slotCell=s=>{const it=S.eq[s]&&itemById(S.eq[s]),b=el('button','eqs'+(it?' has':''));b.type='button';b.style.setProperty('--gc',it?GRADES[it.g].c:'rgba(232,184,100,.25)');
    if(it){b.appendChild(icv(itemIcon(it)));if(it.en)b.appendChild(el('span','en','+'+it.en));}else b.appendChild(el('span','eqn',SLOTN[s]));
    b.title=it?itemName(it):SLOTN[s]+' (비어 있음)';
    if(enc){const ok=it&&canEnch(it.k)&&scrollFor(it.k)===scrollBase(enc)&&it.en<ENH.max;b.classList.toggle('encok',!!ok);b.classList.toggle('encno',!ok);if(ok)b.appendChild(el('span','rt',encLbl(it,enc)));}
    b.onclick=()=>{if(!it)return;if(enc)return doEnchant(it,b);bagSel=it.u;showTip(b,tp=>itemTip(tp,it));};return b;};
  for(const s of L)colL.appendChild(slotCell(s));for(const s of R)colR.appendChild(slotCell(s));
  const hc=CHARART.hero?charFace('hero',false):mk(22,34);if(!CHARART.hero)hc.getContext('2d').drawImage(getSprite('hero','down',false,0),0,0);hc.className='hero';mid.appendChild(hc);
  const st=pStats(null,true);mid.appendChild(el('div','dcp',null)).append(el('small',null,'전투력'),el('b',null,fmt(cpOf())));
  dg.append(colL,mid,colR);
  const ds=el('div','dstats');for(const [n,v] of [['공격력',st.atk],['방어',st.def],['최대 HP',st.hp],['최대 MP',st.mp],['치명',pct(st.crit)],['공격 속도','+'+((st.aspd-1)*100).toFixed(1)+'%'],['스킬 피해','+'+((st.skm-1)*100).toFixed(1)+'%'],['신앙',st.faith],['무게 한도',fmt(weightMax())]])ds.append(el('span',null,n),el('b',null,String(v)));
  doll.appendChild(ds);wrap.appendChild(doll);
  /* 오른쪽: 가방 칸 */
  const inv=el('div','inv');wrap.appendChild(inv);
  if(enc){const bar=el('div','encbar');bar.append(icv(stkIcon(enc)),el('b',null,STK[enc].n+' '+cnt(enc)+'장'),el('span',null,cnt(enc)?' · 강화할 장비를 고르세요 (장착 중인 장비도 가능)':' · 주문서를 모두 썼다'),btn('그만하기','alt',()=>{o.enc=null;renderWin();}));inv.appendChild(bar);}
  else{const u=bagUi();bagCat=u.cat;const ct=el('div','icat');for(const [id,n] of BAG_CAT){const b=el('button','ict'+(bagCat===id?' on':''),n);b.type='button';b.onclick=()=>{bagCat=u.cat=id;if(id==='use'||id==='mat')u.flt='all';hideTip();renderWin();};ct.appendChild(b);}
    /* v4.30 정렬 · 보기 (오른쪽 끝, 누르면 고르는 팝업) */
    const sp=el('span','isp');ct.appendChild(sp);
    const sb=el('button','ict isort'+(u.sort!=='def'?' set':''),'정렬 · '+BAG_SORT.find(x=>x[0]===u.sort)[1]+' ▾');sb.type='button';sb.title='장비 정렬 기준 (장착 중은 항상 앞)';
    sb.onclick=()=>showTip(sb,tp=>{tp.append(el('b','tn','장비 정렬'),el('p',null,'장착 중인 장비는 항상 앞 · 같은 값이면 부위 → 단계 → 등급 순'));const a=el('div','tbtn col');for(const [id,n] of BAG_SORT)a.appendChild(btn((u.sort===id?'✓ ':'')+n+(id==='grade'?' (높은 순)':id==='tier'?' (높은 순)':id==='en'?' (높은 순)':id==='slot'?' (무기 → 반지)':' (부위 · 단계)'),u.sort===id?'pri':'',()=>{u.sort=id;hideTip();renderWin();}));tp.appendChild(a);});
    const fc=S.items.filter(it=>u.flt!=='all'&&bagFltOk(it,u.flt)).length;
    const fb=el('button','ict iflt'+(u.flt!=='all'?' set':''),(u.flt==='all'?'보기 · 전체':BAG_FLT.find(x=>x[0]===u.flt)[1]+' '+fc)+' ▾');fb.type='button';fb.title='장비만 골라 보기';
    fb.onclick=()=>showTip(fb,tp=>{tp.append(el('b','tn','보기 필터'),el('p',null,'필터를 켜면 장비만 보인다 · 분해 대상 = 일괄 분해 기준(장착 · 잠금 · 지금보다 좋음 · 컬렉션 가능 제외)'));const a=el('div','tbtn col');for(const [id,n] of BAG_FLT){const c=id==='all'?'':' · '+S.items.filter(it=>bagFltOk(it,id)).length;a.appendChild(btn((u.flt===id?'✓ ':'')+n+c,u.flt===id?'pri':'',()=>{u.flt=id;if(id!=='all')bagCat=u.cat='all';hideTip();renderWin();}));}tp.appendChild(a);});
    /* v4.32 일괄 잠금 · 자동 잠금 (🔒 N ▾) */
    const ln=S.items.filter(it=>it.lock).length,lb=el('button','ict lkb'+((S.cfg.autoLock??-1)>=0?' set':''),'🔒 '+ln+' ▾');lb.type='button';lb.title='일괄 잠금 · 자동 잠금 — 잠근 장비는 분해 · 자동 분해 · 제작 재료 · 컬렉션 등록에서 빠진다';lb.onclick=()=>bulkLockTip(lb);
    ct.append(sb,fb,lb);inv.appendChild(ct);}
  const grid=el('div','grid'),ents=bagEntries().filter(e=>enc?e.it:bagCat==='all'||e.cat===bagCat);let n=0;
  if(!enc&&!ents.length&&bagUi().flt!=='all')grid.appendChild(el('div','iempty','조건에 맞는 장비가 없다 · 보기 → 전체 보기'));
  for(const e of ents){const b=el('button','cell');b.type='button';n++;
    if(e.it){const it=e.it;b.style.setProperty('--gc',GRADES[it.g].c);if(it.g>=3)b.classList.add('glow');b.appendChild(icv(itemIcon(it)));if(it.en)b.appendChild(el('span','en','+'+it.en));if(isEq(it))b.appendChild(el('span','eqm','E'));else if(betterThanEq(it))b.appendChild(el('span','newm','NEW'));if(it.nw)b.appendChild(el('span','nwd'));if(it.lock)b.appendChild(el('span','lk','🔒'));if(it.bu)b.appendChild(el('span','bum','★'));
      if(enc){const ok=canEnch(it.k)&&scrollFor(it.k)===scrollBase(enc)&&it.en<ENH.max;b.classList.toggle('encok',ok);b.classList.toggle('encno',!ok);if(ok)b.appendChild(el('span','rt',encLbl(it,enc)));}
      if(bagSel===it.u)b.classList.add('sel');b.title=GRADES[it.g].n+' '+itemName(it);
      b.onclick=()=>{if(enc)return doEnchant(it,b);bagSel=it.u;grid.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');showTip(b,tp=>itemTip(tp,it));};}
    else if(e.stk){const k=e.stk;b.style.setProperty('--gc','rgba(232,184,100,.3)');b.appendChild(icv(stkIcon(k)));b.appendChild(el('span','ct',fmt(cnt(k))));b.title=STK[k].n;if(bagSel===k)b.classList.add('sel');
      b.onclick=()=>{bagSel=k;grid.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');showTip(b,tp=>stkTip(tp,k));};}
    else{const q=e.quest;b.classList.add('qitem');b.appendChild(el('span','qn',q.n));b.appendChild(el('span','ct',q.c+'/'+q.of));b.title='퀘스트 물품 · '+q.n;b.onclick=()=>showTip(b,tp=>{tp.append(el('b','tn',q.n),el('div','tt','퀘스트 물품 · 무게 없음'),el('p',null,'퀘스트를 완료하면 사라진다 · '+q.c+'/'+q.of));});}
    grid.appendChild(b);}
  for(let i=n;i<(enc?Math.max(n,24):Math.max(BAG_SLOTS,n));i++)grid.appendChild(el('div','cell empty'));
  inv.appendChild(grid);
  /* 바닥: 무게 · 칸 · 일괄 분해 */
  const p=wPct(),wb=el('div','wbar'+(p>=.82?' bad':p>=.5?' warn':''));wb.append(el('i',null)),wb.firstChild.style.width=Math.min(100,p*100)+'%';wb.appendChild(el('b',null,Math.round(p*100)+'% · '+fmt(weightNow())+'/'+fmt(weightMax())));wb.title='무게 '+fmt(weightNow())+' / '+fmt(weightMax())+' · 50% 자연 회복 멈춤 · 82% 공격 불가';
  const fl=el('div','ifoot');fl.append(wb,el('span','slots','칸 '+bagUsed()+' / '+BAG_SLOTS));
  if(!enc){{const n=equipBetterN(),eb=btn(n?'일괄 장착 · '+n:'일괄 장착',n?'pri':'',()=>{batchEquip();renderWin();},!n);eb.title=n?'부위마다 지금보다 전투력이 높은 장비를 모두 장착한다':'지금보다 좋은 장비가 없다';if(n)eb.classList.add('dot');fl.appendChild(eb);}fl.appendChild(btn('제작','pri',()=>openCraft()));fl.appendChild(btn('컬렉션','',()=>openColl()));const db=btn('일괄 분해','',()=>bulkDisTip(db));fl.appendChild(db);}inv.appendChild(fl);
  F.append(el('p','note2','무게 50% 이상이면 자연 회복이 멈추고 · 82% 이상이면 공격·스킬을 쓸 수 없다 · 장비를 누르면 장착·강화·분해 · 장비 강화는 메뉴 → 강화(J)'));}
function statLines(it,cmp){const s=itemStats(it),c=cmp?itemStats(cmp):{},box=el('div','tst');const ks=new Set([...Object.keys(s),...Object.keys(c)]);
  for(const k of ks){const v=s[k]||0,d=v-(c[k]||0),row=el('div',null);row.append(el('span',null,STATN[k]),el('b',null,statFmt(k,v)));if(cmp&&Math.abs(d)>1e-6)row.appendChild(el('em',d>0?'up':'dn',(d>0?'▲ ':'▼ ')+statFmt(k,Math.abs(d)).slice(1)));box.appendChild(row);}return box;}
function itemTip(tp,it){const G=GRADES[it.g],eq=isEq(it),T=TIERS[it.t];
  const nm=el('b','tn',itemName(it));nm.style.color=G.c;tp.append(nm,el('div','tt',G.n+' · '+SLOTN[it.k]+' · '+T.area+' '+it.t+'단계 (Lv '+T.iL+'~) · 무게 '+itemW(it)+(eq?' · 장착 중':'')));if(it.bu){const B=BU[it.bu];tp.appendChild(el('div','tcmp up','★ 지역 보스 전용 · '+QUESTS.find(q=>q.id===B.q).elite.name+' · 제작 불가 · 보스 컬렉션 재료'));if(B.fx){const f=el('div','tgfx','◆ 고유 효과 · '+B.fx.txt+(eq?' · 켜짐':' · 착용 중에만'));f.style.color='#ffa04a';f.style.fontWeight='600';tp.appendChild(f);}/* v4.73 G3-a */}
  const s=targetSlot(it),cur=!eq&&S.eq[s]&&itemById(S.eq[s]);tp.appendChild(statLines(it,cur||null));
  if(cur){const d=cpWith(s,it.u)-cpOf();tp.appendChild(el('div','tcmp'+(d>0?' up':d<0?' dn':''),'장착 중 '+itemName(cur)+'과(와) 비교 · 전투력 '+(d>=0?'▲ ':'▼ ')+fmt(Math.abs(d))));}
  else if(!eq){const d=cpWith(s,it.u)-cpOf();tp.appendChild(el('div','tcmp up','빈 부위 · 장착하면 전투력 ▲ '+fmt(d)));}
  if(canEnch(it.k)){const r=it.en>=ENH.max?'최대 강화':'다음 강화 성공 '+Math.round(enchRate(it)*100)+'%'+(it.en<enchSafe(it.k)?' (안전)':'')+(it.ff?' · 연속 실패 '+it.ff+'회':'');tp.appendChild(el('div','tt','강화 +'+it.en+' / 최대 +'+ENH.max+' · 안전 +'+enchSafe(it.k)+' · '+r));}
  const a=el('div','tbtn');
  if(eq)a.appendChild(btn('해제','',()=>{unequip(slotOf(it));hideTip();renderWin();}));else a.appendChild(btn('장착','pri',()=>{equipItem(it.u);hideTip();renderWin();}));
  if(canEnch(it.k)&&it.en<ENH.max)a.appendChild(btn('강화','',()=>{hideTip();openEnchant(it.u);}));
  if(!eq&&!it.lock){const c=collNeeds(it);if(c){const i=c.req.findIndex((r,j)=>!collReg(c,j)&&reqMatch(r,it));tp.appendChild(el('div','tcmp up','📖 컬렉션 「'+c.n+'」에 등록할 수 있다 (등록하면 사라짐)'));let armed=false;const rb=btn('컬렉션 등록','',()=>{if(!armed){armed=true;rb.textContent='한 번 더 눌러 등록';return;}collRegister(c.id,i,it.u);hideTip();renderWin();});a.appendChild(rb);}}
  if(!eq)a.appendChild(btn('분해 · 강화석 +'+disYield(it),'alt',()=>{disassemble([it.u]);hideTip();renderWin();},!!it.lock));
  if(!eq&&betterThanEq(it))tp.insertBefore(el('div','tcmp up','NEW · 지금 착용한 장비보다 좋다'),tp.children[2]);
  a.appendChild(btn(it.lock?'잠금 해제':'잠금','alt',()=>{it.lock=!it.lock;save();hideTip();renderWin();}));tp.appendChild(a);}
function stkTip(tp,k){const d=STK[k];tp.append(el('b','tn',d.n),el('div','tt',(d.cat==='use'?'소모품':'재료')+' · '+fmt(cnt(k))+'개 · 개당 무게 '+d.w));
  tp.appendChild(el('p',null,d.book?'사용하면 「'+SK[skIdx(d.book)].name+'」을(를) 스킬 창(K)에서 배울 수 있다. 서브 퀘스트에서만 나온다.':d.desc()));
  const a=el('div','tbtn');
  if(k==='hp'||k==='mp')a.appendChild(btn('사용','pri',()=>{usePot(k);hideTip();renderWin();}));
  else if(BUFP[k])a.appendChild(btn(bufOn(k)?'마시기 · 시간 갱신':'마시기','pri',()=>{useBuf(k);hideTip();renderWin();}));
  else if(k==='cure')a.appendChild(btn(cureNeed()?'마시기 · 상태이상 해제':'마시기','pri',()=>{useCure();hideTip();renderWin();}));
  else if(k==='ret')a.appendChild(btn('사용 · 마을로 귀환','pri',()=>{closeWin();goTown();}));
  else if(k==='bls'||k==='stone')a.appendChild(btn('강화 창으로','pri',()=>{hideTip();openEnchant();}));
  else if(k.startsWith('rcp')||k.startsWith('ore')||/^d[wac][123]$/.test(k))a.appendChild(btn('제작 창으로','pri',()=>{hideTip();openCraft();}));
  else if(d.book)a.appendChild(btn(S.books[d.book]?'이미 익힘':'사용','pri',()=>{useBook(k);hideTip();renderWin();},!!S.books[d.book]));
  if(a.children.length)tp.appendChild(a);}
/* v4.32 일괄 잠금 — 장착 · 등급 · 강화 · 보스 전용을 한 번에 잠그거나 풀고, 자동 잠금 등급을 고른다 */
function bulkLockTip(anchor){showTip(anchor,tp=>{const ln=S.items.filter(it=>it.lock).length;tp.append(el('b','tn','일괄 잠금 · 지금 '+ln+'개 잠김'),el('p',null,'잠근 장비는 분해 · 일괄 분해 · 자동 분해 · 제작 재료 · 컬렉션 등록에 쓰이지 않는다. 장착 장비를 잠가 두면 새 장비로 바꾼 뒤에도 지켜진다.'));
  const a=el('div','tbtn col');
  for(const [id,n,f] of LOCK_SETS){const k=S.items.filter(it=>f(it)&&!it.lock).length,all=S.items.filter(f).length;a.appendChild(btn(n+' 잠금 · '+(k?k+'개':all?'모두 잠김':'없음'),id==='eq'?'pri':'',()=>{const c=lockSet(id,true);toast('잠금 🔒 '+c+'개 · '+n,true);hideTip();renderWin();},!k));}
  let armed=false;const ub=btn('잠금 모두 해제 · '+ln+'개','alt',()=>{if(!armed){armed=true;ub.textContent='한 번 더 눌러 '+ln+'개 해제';return;}const c=unlockAll();toast('잠금 해제 '+c+'개');hideTip();renderWin();},!ln);a.appendChild(ub);
  tp.appendChild(a);
  const g=S.cfg.autoLock??-1,r=el('div','tbtn');r.appendChild(el('span','tlk','자동 잠금'));for(const [v,n] of AUTOLOCK_OPT){r.appendChild(btn((g===v?'✓ ':'')+n.replace(' 이상','+'),g===v?'pri':'',()=>{S.cfg.autoLock=v;save();hideTip();bulkLockTip(anchor);}));}tp.appendChild(r);
  tp.appendChild(el('p','tlkn','자동 잠금(+ = 그 등급 이상): 얻으면 바로 잠근다 · 아직 컬렉션에 등록할 수 있는 장비는 잠그지 않는다'));});}
const AUTOLOCK_OPT=[[-1,'끔'],[2,'희귀 이상'],[3,'영웅 이상'],[4,'전설']];
function bulkDisTip(anchor){showTip(anchor,tp=>{tp.append(el('b','tn','일괄 분해'),el('p',null,'장착 중 · 잠금 · 지금 장비보다 좋은 것 · 컬렉션에 등록할 수 있는 장비는 분해하지 않는다.'));const a=el('div','tbtn col');
  for(let g=0;g<=2;g++){const us=S.items.filter(it=>it.g<=g&&disTarget(it)).map(it=>it.u),y=us.reduce((n,u)=>n+disYield(itemById(u)),0);
    a.appendChild(btn(GRADES[g].n+(g?'까지':'')+' · '+us.length+'개 → 강화석 +'+y,g?'':'pri',()=>{disassemble(us);hideTip();renderWin();},!us.length));}
  tp.appendChild(a);});}
/* ================= 강화 (J) — 제우스: 오만의 신 방식 =================
   왼쪽: 장착 중 → 가방 장비 목록 · 오른쪽: 선택 장비의 +N → +N+1 능력치 변화 · 성공 확률(안전 강화 표시) · 재료(강화석 · 골드) · 축복 주문서 사용
   [강화] 한 번 · [안전 강화까지] 안전 단계까지 연속 · v4.29 [목표 +N까지 연속 강화](평균 비용 미리 보기). 싱글 완화: 실패해도 파괴·하락 없음 */
let encSel=null,encBless=false;
function openEnchant(u){if(!started||player.dead)return;if(u)encSel=u;if(!encSel||!itemById(encSel))encSel=S.eq.weapon||S.items.filter(canEnchIt)[0]?.u||null;
  openWin({id:'enc',key:'j',kick:'ENHANCE',title:'강화',info:()=>[],render:renderEnc});}
const canEnchIt=it=>canEnch(it.k);
function encRow(it){const b=el('button','enr'+(encSel===it.u?' on':''));b.type='button';b.style.setProperty('--gc',GRADES[it.g].c);const ic=el('div','eni');ic.appendChild(icv(itemIcon(it)));if(it.en)ic.appendChild(el('span','en','+'+it.en));
  const safe=it.en<enchSafe(it.k);b.append(ic,el('span','enn',itemName(it)),el('small',safe?'ens safe':'ens',it.en>=ENH.max?'최대':safe?'안전 +'+enchSafe(it.k):Math.round(enchRate(it)*100)+'%'));if(isEq(it))b.appendChild(el('span','eqm','E'));
  b.onclick=()=>{encSel=it.u;renderWin();};return b;}
function renderEnc(B,F){const g=el('div','enw');B.appendChild(g);const L=el('div','enl');g.appendChild(L);
  L.appendChild(el('h4',null,'장착 중'));for(const s of SLOTS){const it=S.eq[s]&&itemById(S.eq[s]);if(it)L.appendChild(encRow(it));}
  const rest=S.items.filter(it=>!isEq(it)&&canEnchIt(it)).sort((a,b)=>b.g-a.g||b.t-a.t||b.en-a.en);if(rest.length){L.appendChild(el('h4',null,'가방'));for(const it of rest)L.appendChild(encRow(it));}
  /* v4.26 오른쪽 = 위 정보(스크롤) + 아래 동작 줄(고정) — 버튼은 스크롤 없이 한 줄로 (원칙 8) */
  const PW=el('div','enp');g.appendChild(PW);const P=el('div','enpi');const A=el('div','enact');PW.append(P,A);const it=encSel&&itemById(encSel);
  if(!it){P.appendChild(el('p','note2','강화할 장비가 없다 · 장비는 사냥 · 제작으로'));A.remove();return;}
  const G=GRADES[it.g],hd=el('div','enh'),ic=el('div','enbig');ic.style.setProperty('--gc',G.c);ic.appendChild(icv(itemIcon(it)));const nm=el('div');const t1=el('b',null,itemName(it));t1.style.color=G.c;
  const nx=Object.assign({},it,{en:Math.min(ENH.max,it.en+1)});nm.append(t1,el('small',null,G.n+' · '+SLOTN[it.k]+' · '+(isEq(it)?'장착 중':'가방')),el('div','enlv',it.en>=ENH.max?'최대 강화 +'+ENH.max:'+'+it.en+'  →  +'+nx.en));hd.append(ic,nm);P.appendChild(hd);
  if(it.en<ENH.max)P.appendChild(statLines(nx,it));
  const safe=it.en<enchSafe(it.k),rate=enchRate(it),bl=encBless&&cnt('bls')>0;
  const rb=el('div','enrate'+(safe||bl?' safe':''));rb.append(el('span',null,'성공 확률'),el('b',null,bl&&safe?'100% · +1~'+(it.en<=2?3:2):Math.round(rate*100)+'%'),el('small',null,safe?'안전 강화 (+'+enchSafe(it.k)+'까지 실패 없음)':'실패해도 파괴·하락 없음'+(it.ff?' · 연속 실패 '+it.ff+'회 (3회마다 +5%p)':'')+(!bl&&enchAid(it)?' · 보조 +'+Math.round((rate-enchRate(it,0))*100)+'%p':'')));P.appendChild(rb);
  /* v4.45 보조 강화석: 안전 구간 위에서 강화석을 더 넣어 확률 +5%p씩 (선택은 저장 · 목표 강화에도 적용) */
  if(!safe&&!bl&&it.en<ENH.max){const ar=el('div','enaid'),bc=enchCost(it,0).stone;ar.appendChild(el('span','tgl','보조 강화석'));
    for(let k=0;k<=ENH.aid.max;k++){const b=el('button','aidb'+((S.encAid|0)===k?' on':''),k?'+'+Math.round((enchRate(it,k)-enchRate(it,0))*100)+'%p':'없음');b.type='button';b.title=k?'강화석 ×'+(k+1)+' ('+fmt(bc*(k+1))+'개)':'보조 없음';b.onclick=()=>{S.encAid=k;save();renderWin();};ar.appendChild(b);}
    ar.appendChild(el('small','aidn',(S.encAid|0)?'강화석 ×'+((S.encAid|0)+1)+' · 시도 수(골드)를 줄인다':'남는 강화석 → 확률'));P.appendChild(ar);}
  const c=enchCost(it),need=el('div','cfn');const row=(ico,label,have,req)=>{const d=el('div','cfm'+(have>=req?'':' no'));const l=el('span');if(ico)l.appendChild(icv(stkIcon(ico),'sic'));l.append(label);d.append(l,el('b',null,fmt(have)+' / '+fmt(req)));need.appendChild(d);};
  if(bl)row('bls',STK.bls.n,cnt('bls'),1);else row('stone','강화석',S.stone,c.stone);row(null,'골드',S.gold,c.gold);P.appendChild(need);
  if(cnt('bls')){const tg=el('label','enbl');const cb=document.createElement('input');cb.type='checkbox';cb.checked=encBless;cb.onchange=()=>{encBless=cb.checked;renderWin();};tg.append(cb,' 축복받은 강화 주문서 사용 ('+cnt('bls')+'장) — 안전 구간에서 +1~3');A.appendChild(tg);}
  const ck=enchCheck(it,bl);const row2=el('div','enbtns');A.appendChild(row2);
  const go=btn(it.en>=ENH.max?'최대 강화':'강화','pri',()=>doEnc(it,bl),!ck.ok);go.classList.add('cfgo');row2.appendChild(go);
  if(it.en<enchSafe(it.k)&&!bl){const go2=btn('안전 강화까지 (+'+enchSafe(it.k)+')','',()=>{let n=0;const nm0=itemName(it);while(it.en<enchSafe(it.k)&&enchCheck(it).ok&&n<20){enchant(it.u,false);n++;}renderWin();encFx(true,n+'회 강화',nm0+' → '+itemName(it));},!ck.ok);go2.classList.add('cfgo','alt2');row2.appendChild(go2);}
  /* v4.29 목표 단계까지 연속 강화 — 목표 +N을 고르고 평균 비용을 미리 본 뒤 한 번에 (실패해도 파괴·하락 없음이라 '실패 시 멈춤'은 두지 않는다) */
  if(it.en<ENH.max&&!bl){const t=encTgtOf(it),ex=encExpect(it,t),tr=el('div','entg');
    const st=(d,lab)=>{const b=el('button','tgb',lab);b.type='button';b.disabled=d<0?t<=it.en+1:t>=ENH.max;b.onclick=()=>{encTgt[it.u]=t+d;renderWin();};return b;};
    tr.append(el('span','tgl','목표'),st(-1,'−'),el('b','tgv','+'+t),st(1,'+'));
    const go3=btn('+'+t+'까지 연속 강화','',()=>encToTarget(it,t),!ck.ok);go3.classList.add('cfgo','alt2');tr.appendChild(go3);A.appendChild(tr);
    const ok=S.stone>=ex.stone&&S.gold>=ex.gold,xs=el('small','enexp'+(ok?'':' short'),'평균 '+ex.tries.toFixed(1)+'회 · 강화석 ~'+fmt(Math.ceil(ex.stone))+' (보유 '+fmt(S.stone)+') · 골드 ~'+fmt(Math.ceil(ex.gold))+(ok?'':' · 모자라면 거기서 멈춤'));A.appendChild(xs);}
  if(!ck.ok&&it.en<ENH.max)A.appendChild(el('small','why',ck.why+(ck.why.startsWith('강화석')?' · 분해 · 몬스터 · 대장장이 상점':'')));
  F.append(el('p','note2','무기·방어구 +'+ENH.safe.weapon+' · 장신구 +'+ENH.safe.acc+'까지 안전 강화 · 그 위는 확률(실패해도 파괴·하락 없음) · 강화석은 장비 분해 · 몬스터 · 퀘스트 · 대장장이 상점 · 강화 1단계마다 신앙 +1'));}
/* v4.29 목표 강화: 기본 목표 = 안전 단계 아래면 안전 단계, 위면 +1 · 평균 시도 수는 연속 실패 보정(3회마다 +5%p)까지 정확히 계산 */
const encTgt={};
function encTgtOf(it){const lo=it.en+1,d=it.en<enchSafe(it.k)?enchSafe(it.k):lo;let t=encTgt[it.u]??d;t=Math.max(lo,Math.min(ENH.max,t));encTgt[it.u]=t;return t;}
function encExpect(it,tgt){let tries=0,stone=0,gold=0;for(let n=it.en;n<Math.min(tgt,ENH.max);n++){let surv=1,ff=n===it.en?(it.ff||0):0,e=0;
    for(let k=0;k<400&&surv>1e-7;k++){e+=surv;surv*=1-enchRate({k:it.k,en:n,ff});ff++;}
    const c=enchCost({k:it.k,en:n,t:it.t,bu:it.bu});tries+=e;stone+=e*c.stone;gold+=e*c.gold;}return{tries,stone,gold};}
function encToTarget(it,tgt){const nm0=itemName(it),e0=it.en,s0=S.stone,g0=S.gold;let n=0,f=0;while(it.en<tgt&&enchCheck(it).ok&&n<300){const r=enchant(it.u,false);if(!r)break;n++;if(!r.ok)f++;}
  STAT.encTgt=(STAT.encTgt||0)+1;renderWin();const hit=it.en>=tgt,why=hit?'':' · '+(enchCheck(it).why||'멈춤');
  encFx(hit,hit?'+'+tgt+' 달성':'+'+it.en+'에서 멈춤',n+'회 시도 (실패 '+f+') · 강화석 -'+fmt(s0-S.stone)+' · 골드 -'+fmt(g0-S.gold)+why);if(it.en>e0)burst(player.x,player.y,14,'#ffb050',24,90,4);return{n,f,from:e0,to:it.en,hit};}
function encFx(ok,a,b2){const fx=el('div','encfx '+(ok?'ok':'no'));fx.append(el('b',null,a),el('span',null,b2));$('win').querySelector('.wbox').appendChild(fx);setTimeout(()=>fx.remove(),1400);}
function doEnc(it,bl){const nm0=itemName(it),r=enchant(it.u,bl);if(!r||r.max)return;if(!cnt('bls'))encBless=false;renderWin();
  encFx(r.ok,r.ok?(r.up>1?'+'+r.up+' 강화 성공':'강화 성공'):'강화 실패',r.ok?nm0+' → '+itemName(it):itemName(it)+' · 단계 유지'+(it.ff%3===0?' · 다음 확률 +5%p':' · 연속 실패 '+it.ff+'회'));if(r.ok)burst(player.x,player.y,14,'#ffb050',24,90,4);}

/* ================= 능력치 (C) ================= */
let draft=null;
/* 길게 누르면 연속 입력 (v4.8.1 수정): 누를 때마다 창을 다시 그려 버튼이 바뀌므로, 떼기는 버튼이 아니라 문서 전체에서 받는다.
   (v4.8은 버튼에 떼기 이벤트를 달아서, 다시 그린 뒤엔 떼기를 못 받고 반복이 멈추지 않았음 → 포인트 연속 입력 + 다른 창 버튼이 계속 바뀌어 터치가 먹지 않음) */
let holdTo=null,holdIv=null;
function stopHold(){clearTimeout(holdTo);clearInterval(holdIv);holdTo=holdIv=null;}
for(const ev of ['pointerup','pointercancel','blur'])addEventListener(ev,stopHold);
function hold(b,f){b.onpointerdown=e=>{if(e.button>0)return;e.preventDefault();stopHold();if(!f())return;const w0=win;
    holdTo=setTimeout(()=>{holdIv=setInterval(()=>{if(win!==w0||!f())stopHold();},70);},400);};
  b.onclick=e=>{e.preventDefault();if(e.detail===0)f();};/* 키보드(Enter·Space)로 누른 경우 */}
function openStats(){if(!started)return;draft={str:0,vit:0,dex:0,int:0};openWin({id:'stats',key:'c',kick:'CHARACTER / GROWTH',title:'능력치',info:statsInfo,render:renderStats});}
const draftUsed=()=>draft.str+draft.vit+draft.dex+draft.int;
function statsInfo(){const xb=el('div','xpm');xb.append(el('i',null));xb.firstChild.style.width=(S.lv>=LV_MAX?100:S.xp/need(S.lv)*100)+'%';
  const left=S.sp-draftUsed(),pt=el('span','wpt'+(left>0?' on':''));pt.append(el('small',null,'남은 포인트'),el('b',null,String(left)));
  return [el('span','wchip','Lv '+S.lv+' · 원정대원'),el('span','wchip',S.lv>=LV_MAX?'경험치 MAX':'경험치 '+fmt(S.xp)+' / '+fmt(need(S.lv))),xb,pt];}
function renderStats(B,F){const cur=S.st,nxt={str:cur.str+draft.str,vit:cur.vit+draft.vit,dex:cur.dex+draft.dex,int:cur.int+draft.int},left=S.sp-draftUsed();
  const g=el('div','stw');B.appendChild(g);const L=el('div','stl');g.appendChild(L);
  const EN={str:'STR',vit:'VIT',dex:'DEX',int:'INT'};
  for(const k in STATS){const r=el('div','srow'),nm=el('div','snm');nm.append(el('b',null,STATS[k][0]),el('small',null,EN[k]),el('span',null,'포인트당 '+STATS[k][1]));r.appendChild(nm);
    const sp=el('div','step'),mi=el('button','sbt','−'),pl=el('button','sbt','+'),v=el('b','sv',String(nxt[k]));mi.type=pl.type='button';mi.disabled=!draft[k];pl.disabled=left<=0;
    if(draft[k])v.appendChild(el('em',null,' +'+draft[k]));
    hold(mi,()=>{if(draft[k]<=0)return false;draft[k]--;renderWin();return draft[k]>0;});hold(pl,()=>{if(S.sp-draftUsed()<=0)return false;draft[k]++;renderWin();return S.sp-draftUsed()>0;});
    sp.append(mi,v,pl);r.appendChild(sp);L.appendChild(r);
    /* v4.80 G2-a 구간 보너스 — 칩 4개(닿음 = 금색 · 이번 배분으로 닿음 = 밝은 테두리) + 다음 구간까지 남은 포인트 · 효과 */
    {const tr=el('div','tbr'),n0=tbN(k,cur),n1=tbN(k,nxt);TB_AT.forEach((at,i)=>{const c=el('span','tbc'+(i<n0?' on':i<n1?' new':''),String(at));c.title=STATS[k][0]+' '+at+' — '+TB[k][i].d;tr.appendChild(c);});
      const nx=tbNext(k,nxt);tr.appendChild(el('span','tbt'+(n1>n0?' new':''),n1>n0?'새 효과: '+TB[k][n1-1].d:nx?'다음 '+nx.at+'까지 '+nx.left+' · '+nx.d:'구간 모두 달성'));nm.appendChild(tr);}}
  const a=pStats(cur,true),b=pStats(nxt,true),T=el('div','cmp');g.appendChild(T);T.appendChild(el('div','ch','전투 능력 · 적용 전 → 적용 후'));
  const row=(n,x,y,f)=>{const d=el('div','cr'+(y!==x?' chg':''));d.append(el('span',null,n),el('b',null,f(x)),el('i',null,'→'),el('b','af',f(y)+(y>x?' ▲':'')));T.appendChild(d);};
  const pc=v=>(v*100).toFixed(1)+'%';
  row('공격력',a.atk,b.atk,String);row('방어',a.def,b.def,String);row('최대 HP',a.hp,b.hp,String);row('최대 MP',a.mp,b.mp,String);row('치명 확률',a.crit,b.crit,pc);row('공격 속도',a.aspd-1,b.aspd-1,v=>'+'+pc(v));row('스킬 피해',a.skm-1,b.skm-1,v=>'+'+pc(v));row('신앙',a.faith,b.faith,String);
  const sl=S.slots.map(id=>id&&skIdx(id)).filter(i=>i!=null&&i>=0&&SK[i].mul);for(const i of sl.slice(0,3))row(SK[i].name+' 1타',Math.round(a.atk*skMul(i)*a.skm*(SK[i].hits||1)),Math.round(b.atk*skMul(i)*b.skm*(SK[i].hits||1)),fmt);
  {const on=[];for(const k in TB)for(let i=0;i<tbN(k,nxt);i++){const d=TB[k][i],sup=TB[k].slice(i+1,tbN(k,nxt)).some(e=>Object.keys(e).some(q=>q!=='d'&&d[q]!=null&&e[q]>=d[q]));if(!sup)on.push([STATS[k][0]+' '+TB_AT[i],d.d,i>=tbN(k,cur)]);}
    const bx=el('div','tbl');bx.appendChild(el('div','ch','구간 보너스 '+tbCount(nxt)+' / 16 · 전투력 +'+TB_CP*tbCount(nxt)));if(!on.length)bx.appendChild(el('small',null,'능력치 하나를 10 · 20 · 30 · 45까지 올리면 덤 효과가 켜진다'));for(const o of on){const d=el('span','tbi'+(o[2]?' new':''));d.append(el('b',null,o[0]),document.createTextNode(' '+o[1]));bx.appendChild(d);}row('전투력',cpOf(cur),cpOf(nxt),fmt);T.lastChild.classList.add('cpr');T.appendChild(bx);/* 전투력 줄 아래 — 구간이 많아 목록이 길어져도 전투력 줄은 밀려 내려가지 않는다 */}
  F.append(el('p','note2','레벨업마다 3포인트 · 능력치마다 10 · 20 · 30 · 45에서 구간 보너스 · 공격 속도는 민첩으로 최대 +40% · 창을 닫으면 적용하지 않은 배분은 취소된다'));
  const bt=el('div','btns');
  bt.append(btn('자동 성장 '+(S.autoGrow?'켬':'끔'),S.autoGrow?'tg on':'tg',()=>{S.autoGrow=!S.autoGrow;if(S.autoGrow){draft={str:0,vit:0,dex:0,int:0};autoGrowNow();}save();renderWin();}),
    btn('추천 분배','',()=>{let n=S.sp-draftUsed();const tmp={...nxt};while(n-->0){const k=REC[(tmp.str+tmp.vit+tmp.dex+tmp.int)%REC.length];tmp[k]++;draft[k]++;}renderWin();},left<=0),
    btn('되돌리기','alt',()=>{draft={str:0,vit:0,dex:0,int:0};renderWin();},!draftUsed()),
    btn('배분 적용','pri',()=>{for(const k in draft){S.st[k]+=draft[k];}S.sp-=draftUsed();const n=draftUsed();draft={str:0,vit:0,dex:0,int:0};lastQKey='';save();toast('능력치 '+n+'포인트 적용 · 전투력 '+fmt(cpOf()),true);renderWin();},!draftUsed()));
  F.appendChild(bt);}

/* ================= 스킬 수련 (K) ================= */
let skTier=1,skSel=null;
function openSkills(sel,slotHint){if(!started)return;if(typeof sel==='string')skSel=sel;if(skSel==null){const c=SK.find((s,i)=>skCan(i));skSel=(c||SK[0]).id;}skTier=SK[skIdx(skSel)].tier;
  openWin({id:'skills',key:'k',kick:'PATH OF THE EXPEDITION',title:'스킬 수련',slotHint:slotHint??null,info:()=>{const pt=el('span','wpt'+(S.kp>0?' on':''));pt.append(el('small',null,'스킬 포인트'),el('b',null,String(S.kp)));return [el('span','wchip','Lv '+S.lv+' · '+(S.lv>=28?'원정대 용사':S.lv>=16?'원정대 검사':'견습 원정대원')),pt];},render:renderSkills});}
function skState(i){const s=SK[i],lv=skLv(i),k=lv+1;if(!tierOpen(s.tier))return['잠김 · '+SK_TIER[s.tier].n,'lock'];if(lv>=SK_MAX)return['최대','max'];
  if(s.book&&!S.books[s.id])return[cnt('book_'+s.id)?'스킬서 사용 필요':'스킬서 필요','book'];if(S.lv<skNeedLv(i,k))return[(lv?'Lv'+lv+'/'+SK_MAX+' · ':'')+'캐릭터 Lv '+skNeedLv(i,k),'lock'];
  if(!S.kp)return[lv?'Lv'+lv+'/'+SK_MAX:'포인트 부족',lv?'on':'lock'];return[lv?'강화 가능 Lv'+lv:'배우기 가능','can'];}
function skDmg(i,lvAt){const s=SK[i],st=pStats(null,true),L=lvAt||Math.max(1,skLv(i)),m=s.mul?s.mul*(1+.12*(L-1)):0;return Math.round(st.atk*m*st.skm);}
function skEffect(i,L){const s=SK[i];L=Math.max(1,L);if(s.id==='roar')return'공격력 +'+Math.round((.15+.04*(L-1))*100)+'% · '+s.buff+'초';if(s.id==='guard')return'받는 피해 -'+Math.round((.15+.03*(L-1))*100)+'% · '+s.buff+'초';if(s.id==='ferv')return'치명 +'+Math.round((.10+.02*(L-1))*100)+'%p · 공속 +'+Math.round((.10+.02*(L-1))*100)+'% · '+s.buff+'초';
  return'피해 ×'+(s.mul*(1+.12*(L-1))).toFixed(2)+(s.hits?' × '+s.hits+'회':'')+(s.drain?' · 피해의 '+Math.round(s.drain*100)+'% 회복':'');}
function renderSkills(B,F){const o=win;
  const tt=el('div','stier');for(let n=1;n<=3;n++){const T=SK_TIER[n],op=tierOpen(n),b=el('button','stb'+(skTier===n?' on':'')+(op?'':' lock'));b.type='button';b.append(el('b',null,T.n+' · '+T.area),el('small',null,op?'Lv '+T.lv+'~ · 개방':'미개방 · Lv '+T.lv));
    if(op&&SK.some((s,i)=>s.tier===n&&skCan(i)))b.classList.add('dot');b.onclick=()=>{skTier=n;const f=SK.find(s=>s.tier===n);skSel=f.id;hideTip();renderWin();};tt.appendChild(b);}
  B.appendChild(tt);const T=SK_TIER[skTier],op=tierOpen(skTier),list=SK.map((s,i)=>i).filter(i=>SK[i].tier===skTier);
  const hd=el('div','sthd');hd.append(el('b',null,T.n+' 스킬 · 총 '+list.length+'개'),el('span',null,op?T.area+' 지역의 기술 · 레벨과 스킬 포인트로 배운다':'개방 조건 · '+T.how));
  if(!op){const q=curQ();hd.appendChild(btn('메인 퀘스트 진행','',()=>{closeWin();questGo();}));}B.appendChild(hd);
  const g=el('div','skw');B.appendChild(g);const L=el('div','skl');g.appendChild(L);
  for(const i of list){const s=SK[i],[stt,cls]=skState(i),G=S.god&&GODS[S.god],mod=G&&G.sk===i,c=el('button','skc'+(skSel===s.id?' sel':'')+' '+cls+(skCan(i)?' dot':''));if(skCan(i))c.title=s.book&&!S.books[s.id]?'스킬서를 쓸 수 있다':'배우기 · 강화 가능';c.type='button';
    const ic=el('span','ski',mod?G.ski:s.icon);if(mod)ic.style.color=G.col;c.append(ic);const tx=el('span','skt');tx.append(el('b',null,(mod?G.skn:s.name)+(s.book?' 📕':'')),el('small',null,s.cls),el('em',null,stt));c.appendChild(tx);
    if(S.slots.includes(s.id))c.appendChild(el('span','slotm',String(S.slots.indexOf(s.id)+1)));
    c.onclick=()=>{skSel=s.id;renderWin();};L.appendChild(c);}
  /* 상세 */
  const i=skIdx(skSel),s=SK[i],lv=skLv(i),D=el('div','skd');g.appendChild(D);const G=S.god&&GODS[S.god],mod=G&&G.sk===i;
  const top=el('div','skdt'),bi=el('span','ski big',mod?G.ski:s.icon);if(mod)bi.style.color=G.col;const tn=el('div',null);tn.append(el('small',null,s.cls+' · '+SK_TIER[s.tier].n),el('b',null,(mod?G.skn+' ('+s.name+')':s.name)),el('span',null,lv?'Lv '+lv+' / '+SK_MAX:'미습득 · 아래 수치는 Lv 1 기준'));top.append(bi,tn);
  const act=el('div','skact'),[stt]=skState(i);
  if(s.book&&!S.books[s.id]&&cnt('book_'+s.id))act.appendChild(btn('스킬서 사용','pri',()=>{useBook('book_'+s.id);renderWin();}));
  else{const b=btn((lv?'강화':'배우기')+' · 1P','pri',()=>{learnSkill(i);save();renderWin();},!canLearn(i));act.appendChild(b);if(!canLearn(i)&&lv<SK_MAX)act.appendChild(el('small','why',skWhy(i)));}
  top.appendChild(act);D.appendChild(top);D.appendChild(el('p','skdesc',s.desc+(mod?' · 권능 변형: '+G.title+'의 힘이 깃든다':'')));
  const cards=el('div','skcards'),cd=(k,v)=>{const x=el('div','kc');x.append(el('small',null,k),el('b',null,v));cards.appendChild(x);};
  if(s.mul)cd('1타 피해 (현재 능력치)',fmt(skDmg(i))+(s.hits?' × '+s.hits:''));else cd('효과',skEffect(i,lv||1));
  cd(s.kind==='aoe'?'범위':s.kind==='buff'?'대상':'사거리',s.kind==='aoe'?'주변 '+s.r:s.kind==='buff'?'자신':String(s.range));cd('MP 소모',String(s.mp));cd('재사용 대기',s.cd+'초');D.appendChild(cards);
  const nx=el('div','sknx');if(lv<SK_MAX){const k=lv+1;nx.append(el('b',null,lv?'다음 단계 Lv '+lv+' → '+k:'습득 Lv 1'),el('span',null,skEffect(i,k)+' · 필요 캐릭터 Lv '+skNeedLv(i,k)+' · 스킬 포인트 1'));}else nx.append(el('b',null,'최대 단계'),el('span',null,skEffect(i,SK_MAX)));D.appendChild(nx);
  const lvs=el('div','sklvs');for(let k=1;k<=SK_MAX;k++)lvs.appendChild(el('span',k<=lv?'on':'',String(skNeedLv(i,k))));D.appendChild(el('small','lvh','단계별 필요 캐릭터 레벨'));D.appendChild(lvs);
  if(lv)D.appendChild(el('p','note2',S.slots.includes(s.id)?'슬롯 '+(S.slots.indexOf(s.id)+1)+'에 장착됨 · 다른 슬롯을 누르면 자리를 옮긴다':'아래 슬롯을 누르면 장착된다 · 이미 장착된 스킬과는 자리를 바꾼다'));
  /* 슬롯 바 8칸 */
  const bar=el('div','slotbar');for(let j=0;j<SLOT_N;j++){const id=S.slots[j],k=id&&skIdx(id),c=el('button','slc'+(id?' has':'')+(id===skSel?' sel':'')+(o.slotHint===j?' hint':''));c.type='button';
    c.appendChild(el('span','sn',String(j+1)));if(id){const G2=S.god&&GODS[S.god],md=G2&&G2.sk===k;c.append(el('span','ski',md?G2.ski:SK[k].icon),el('span','sln',md?G2.skn:SK[k].name));const x=el('span','slx','×');x.onclick=e=>{e.stopPropagation();S.slots[j]=null;save();renderWin();};c.appendChild(x);}
    else c.append(el('span','ski','+'),el('span','sln','빈 슬롯'));
    c.onclick=()=>{if(skLv(i)>0){const from=S.slots.indexOf(s.id);if(from===j){skSel=s.id;renderWin();return;}const prev=S.slots[j];S.slots[j]=s.id;if(from>=0)S.slots[from]=prev;o.slotHint=null;save();toast(s.name+' · 슬롯 '+(j+1),true);renderWin();}
      else if(id){skSel=id;skTier=SK[k].tier;renderWin();}else toast('먼저 스킬을 배운 뒤 슬롯을 누르자');};bar.appendChild(c);}
  B.appendChild(bar);
  F.append(el('p','note2','레벨업마다 스킬 포인트 1 · 배우기/강화 1P · 최대 Lv '+SK_MAX+' · 자동 전투는 슬롯에 넣은 스킬만 슬롯 순서대로 사용 (설정에서 변경) · 빨간 점 = 지금 배우기 · 강화 · 스킬서 사용 가능'));
  const bt=el('div','btns');bt.append(btn('자동 성장 '+(S.autoGrow?'켬':'끔'),S.autoGrow?'tg on':'tg',()=>{S.autoGrow=!S.autoGrow;if(S.autoGrow)autoGrowNow();save();renderWin();}));
  {const n=skBatchN(),b=btn(n?'일괄 강화 · '+n:'일괄 강화',n?'pri':'',()=>{skBatch();renderWin();},!n);b.title=n?'스킬 포인트로 강화할 수 있는 스킬을 한 번에 강화한다(낮은 레벨부터 · 같으면 슬롯에 낀 스킬 먼저) · 쓸 수 있는 스킬서도 함께 사용':'지금 강화할 수 있는 스킬이 없다';if(n)b.classList.add('dot');bt.appendChild(b);}
  F.appendChild(bt);}
function skWhy(i){const s=SK[i],k=skLv(i)+1;if(!tierOpen(s.tier))return SK_TIER[s.tier].n+' 미개방 · '+SK_TIER[s.tier].how;if(s.book&&!S.books[s.id]){const sb=Object.values(SUBQ).find(q=>q.rw.book===s.id);return '스킬서 필요 — 서브 「'+(sb?sb.title:'?')+'」';}
  if(S.lv<skNeedLv(i,k))return '캐릭터 Lv '+skNeedLv(i,k)+' 필요';if(!S.kp)return '스킬 포인트 부족';return '';}

/* ================= 설정 ================= */
function openSettings(){if(!started)return;openWin({id:'settings',key:null,kick:'OPTIONS',title:'설정',tabs:false,info:()=>{const c=[el('span','wchip','자동 전투 · 물약 · 진행 · 화면')];if(!document.body.classList.contains('touch')){const b=el('button','btn alt wkset','⌨ 단축키 바꾸기');b.type='button';b.onclick=openKeyset;c.push(b);}return c;},render:renderSettings});}
/* v4.35 단축키 바꾸기 창 — 묶음별 [키] 버튼 → 누른 키로 바꿈(겹치면 맞바꿈) · 고정 키는 회색 · 아래 고정 줄 [기본값으로](두 번) */
function openKeyset(){if(!started)return;openWin({id:'keyset',key:null,kick:'KEY BINDINGS',title:'단축키 바꾸기',tabs:false,
  info:()=>{const n=Object.keys(S.keymap||{}).length;return [el('span','wchip',n?'바꾼 키 '+n+'개':'모두 기본값'),el('span','wchip','한글 입력 상태에서도 같은 자리 키')];},render:renderKeyset});}
function renderKeyset(B,F){const g=el('div','kbw');B.appendChild(g);
  for(const [gn,L] of KEYGUIDE){const sec=el('div','kbsec');sec.appendChild(el('h4',null,gn));
    for(const [n,...ks] of L){const r=el('div','kbr');r.appendChild(el('span','kbn',n));const one=ks.find(k=>/^[A-Z]$/.test(k));
      if(one){const d=one.toLowerCase(),cap=kbCap===d,b=el('button','kbk'+(cap?' cap':'')+(kb(d)!==d?' chg':''),cap?'키를 누르세요…':kbU(d));b.type='button';b.dataset.act=d;
        b.onclick=()=>{kbCap=cap?null:d;renderWin();};r.appendChild(b);r.appendChild(el('small','kbd0',kb(d)!==d?'기본 '+one:''));}
      else{r.appendChild(el('span','kbk fix',ks.join(' / ')));r.appendChild(el('small','kbd0','고정'));}
      sec.appendChild(r);}
    g.appendChild(sec);}
  let armed=false;const rb=btn('기본값으로','alt',()=>{if(!Object.keys(S.keymap||{}).length){toast('이미 기본값이다');return;}if(armed){kbReset();return;}armed=true;rb.textContent='한 번 더 누르면 되돌림';});
  F.append(el('p','note2',kbCap?'바꿀 키를 누르세요 · Esc = 취소 · 다른 동작이 쓰던 키면 서로 맞바꿈':'[키]를 누른 뒤 새 키를 누른다 · 겹치면 맞바꿈 · 이동 WASD · 1~8 · Space · Esc는 고정'),rb);}
function renderSettings(B,F){const C=S.cfg,g=el('div','setw');B.appendChild(g);
  const sec=n=>{const d=el('div','sec');d.appendChild(el('h4',null,n));g.appendChild(d);return d;};
  const row=(p,title,desc,opts,get,set)=>{const r=el('div','srw'),n=el('div','nm');n.append(el('b',null,title),el('small',null,desc));r.appendChild(n);const os=el('div','opts');
    for(const [v,lab] of opts){const b=el('button','opt'+(get()===v?' on':''),lab);b.type='button';b.onclick=()=>{set(v);save();renderWin();};os.appendChild(b);}r.appendChild(os);p.appendChild(r);};
  const onoff=[[true,'켬'],[false,'끔']];
  let s1=sec('자동 전투');
  row(s1,'타겟 범위','퀘스트 사냥이 아닐 때 자동 전투가 찾는 거리',[['near','가까이'],['mid','보통'],['far','넓게']],()=>C.scan,v=>C.scan=v);
  row(s1,'타겟 우선','원거리 먼저 = 나를 노리는 원거리 몬스터부터',[['quest','퀘스트 대상'],['near','가까운 몬스터'],['ranged','원거리 먼저']],()=>C.tgt||'quest',v=>C.tgt=v);
  row(s1,'스킬 사용 순서','슬롯에 넣은 스킬만 쓴다',[['slot','슬롯 1→8'],['strong','버프 → 강한 순']],()=>C.order,v=>C.order=v);
  row(s1,'몬스터 자동 반격','나를 공격한 몬스터를 먼저 상대',onoff,()=>C.counter!==false,v=>C.counter=v);
  let s2=sec('물약 · 귀환 · 회피');
  row(s2,'HP 물약 자동 사용','HP가 이 비율 아래로 떨어지면 마신다',[[.3,'30%'],[.4,'40%'],[.5,'50%'],[.6,'60%'],[0,'끔']],()=>S.autoPot?C.potAt:0,v=>{S.autoPot=v>0;if(v>0)C.potAt=v;});
  row(s2,'자동 진행 물약 보충','자동 진행 중 HP 물약이 '+POT_LOW.hp+'개 아래면 상점에 들러 한도까지 구입',onoff,()=>!!S.autoBuy,v=>S.autoBuy=v);
  row(s2,'긴급 귀환','자동 사냥 중 물약이 없고 HP 40% 미만이면 귀환 주문서로 귀환 (퀘스트 자동 진행 중엔 항상 켜짐)',onoff,()=>!!S.autoRet,v=>S.autoRet=v);
  row(s2,'예고 회피','자동 전투가 바닥 · 돌진 · 투사체 예고를 피한다',onoff,()=>C.dodge!==false,v=>C.dodge=v);/* v4.72 G1-h — 자동 전투 칸에 두면 첫 줄 높이가 늘어 아래 칸이 스크롤로 밀림 */
  let s3=sec('진행 · 성장 · 장비');
  row(s3,'퀘스트 자동 진행',kTxt('수락 → 이동 → 사냥 → 보상을 자동으로 (T)'),onoff,()=>!!S.autoQ,v=>{S.autoQ=v;});
  row(s3,'자동 성장','능력치·스킬 포인트·스킬서·슬롯을 자동으로 쓴다',onoff,()=>!!S.autoGrow,v=>{S.autoGrow=v;if(v)autoGrowNow();});
  row(s3,'더 좋은 장비 자동 장착','얻은 장비가 지금보다 전투력이 높으면 바로 장착',onoff,()=>!!C.autoEq,v=>{C.autoEq=v;if(v)autoEquipAll();});
  row(s3,'자동 분해','무게 45% 또는 가방 90%가 넘으면 이 등급 이하를 분해 (장착·잠금·더 좋은 장비 제외 · 자동 잠금은 가방 🔒 ▾)',[[-1,'끔'],[0,'일반'],[1,'고급까지'],[2,'희귀까지']],()=>C.autoDis??-1,v=>C.autoDis=v);
  let s4=sec('화면 · 데이터');
  row(s4,'도트 양감','몬스터 도트에 빛(왼쪽 위)과 그늘을 입힌다 · 끄면 원래 그림 (캐릭터 그림에는 양감이 이미 그려져 있다)',onoff,()=>VOL_ON,v=>{setVolume(v);C.vol=v;portrait('hero',$('face'),true);});
  row(s4,'양감 세기','약하게 하면 원래 그림에 가까워진다',Object.entries(VOL_LV).map(([n,k])=>[k,n]),()=>VOL_K,v=>{setVolume(true,v);C.volK=v;C.vol=true;portrait('hero',$('face'),true);});
  row(s4,'화면 확대','마우스 휠 80~180% · Z키 100%↔140%',[[1,'100%'],[1.2,'120%'],[1.4,'140%']],()=>Math.round(zoomT*10)/10,v=>{setZoom(v);});
  const r=el('div','srw'),n=el('div','nm');n.append(el('b',null,'데이터 초기화'),el('small',null,'저장을 지우고 처음부터 시작한다 (되돌릴 수 없음)'));let armed=false;const rb=btn('초기화','alt',()=>{if(armed){try{localStorage.removeItem(SAVE_KEY);}catch(e){}location.reload();return;}armed=true;rb.textContent='한 번 더 누르면 삭제';});r.append(n,rb);s4.appendChild(r);
  F.append(el('p','note2','설정은 저장된다 · 창을 열어도 게임은 계속 진행된다'));}

/* ================= 상점 (물약 · 주문서) ================= */
function buyStone(n){const pr=stonePrice();n=Math.max(0,Math.min(n,Math.floor(S.gold/pr),Math.floor(weightMax()-weightNow())));if(!n)return 0;S.stone+=n;S.gold-=n*pr;STAT.buyG+=n*pr;STAT.stoneBuy=(STAT.stoneBuy||0)+n;return n;}
function openShop(id){const body=el('div','shop');
  const key=k=>k==='hp'?'hpPot':k==='mp'?'mpPot':'scroll';
  const row=(k,label,desc,ic)=>{const d=el('div','si'),pr=potPrice(k),nm=el('div','nm'),have=S[key(k)],cap=POT_CAP[k];d.appendChild(icv(stkIcon(ic),'sic'));nm.append(el('b',null,label+'  '+have+'/'+cap),el('small',null,desc));d.append(nm,el('span','pr',fmt(pr)+' G'));
    for(const n of [1,5,'가득']){const want=n==='가득'?cap-have:Math.min(n,cap-have),b=el('button','btn',n==='가득'?'가득':n+'개');b.type='button';b.disabled=want<=0||S.gold<pr*(n==='가득'?1:want);b.onclick=()=>{const got=buyItem(k,want);if(got)toast(label+' '+got+'개 구입 (-'+fmt(got*pr)+' G)');save();openShop(id);};d.appendChild(b);}return d;};
  body.append(row('hp','HP 물약','최대 체력의 35% 회복 · 소지 한도 '+POT_CAP.hp,'hp'),row('mp','MP 물약','최대 기력의 40% 회복 · 소지 한도 '+POT_CAP.mp,'mp'),row('scroll','귀환 주문서','즉시 마을로 귀환 (B) · 소지 한도 '+POT_CAP.scroll,'ret'));
  /* v4.66 G12-a 버프 물약 3종 — 5분 · 소지 한도 5 · 자동 진행은 사지 않는다(플레이어의 선택) */
  const brow=k=>{const d=el('div','si bfr'),pr=bufPrice(),nm=el('div','nm'),have=cnt(k),cap=BUF_K.cap,on=bufOn(k);d.dataset.buf=k;d.appendChild(icv(stkIcon(k),'sic'));nm.append(el('b',null,STK[k].n+'  '+have+'/'+cap+(on?'  · 효과 중 '+mmss(Math.ceil(S.buf[k])):'')),el('small',null,BUFP[k].txt+' · '+(BUF_K.dur/60)+'분 · 무게 '+STK[k].w));d.append(nm,el('span','pr',fmt(pr)+' G'));
    for(const n of [1,'가득']){const want=n==='가득'?cap-have:Math.min(1,cap-have),b=el('button','btn',n==='가득'?'가득':n+'개');b.type='button';b.disabled=want<=0||S.gold<pr;b.onclick=()=>{const got=buyBuf(k,want);if(got)toast(STK[k].n+' '+got+'개 구입 (-'+fmt(got*pr)+' G)');else toast('골드나 무게가 부족하다');save();openShop(id);};d.appendChild(b);}
    const u=el('button','btn pri','마시기');u.type='button';u.disabled=!have;u.onclick=()=>{useBuf(k);openShop(id);};d.appendChild(u);return d;};
  for(const k of BUF_IDS)body.appendChild(brow(k));
  /* v4.67 G12-b 정화 물약 — 독 · 화상 · 둔화 해제 + 10초 면역 · 한도 5 · 무게 1 */
  {const d=el('div','si cur'),pr=curePrice(),nm=el('div','nm'),have=cnt('cure'),cap=CURE_K.cap;d.dataset.buf='cure';d.appendChild(icv(stkIcon('cure'),'sic'));nm.append(el('b',null,STK.cure.n+'  '+have+'/'+cap),el('small',null,'독 · 화상 · 둔화 해제 + '+CURE_K.imm+'초 면역 · 기절 제외 · 무게 '+STK.cure.w));d.append(nm,el('span','pr',fmt(pr)+' G'));
    for(const n of [1,'가득']){const want=n==='가득'?cap-have:Math.min(1,cap-have),b=el('button','btn',n==='가득'?'가득':n+'개');b.type='button';b.disabled=want<=0||S.gold<pr;b.onclick=()=>{const got=buyCure(want);if(got)toast('정화 물약 '+got+'개 구입 (-'+fmt(got*pr)+' G)');else toast('골드나 무게가 부족하다');save();openShop(id);};d.appendChild(b);}
    const u=el('button','btn pri','마시기');u.type='button';u.disabled=!have;u.onclick=()=>{useCure();openShop(id);};d.appendChild(u);body.appendChild(d);}
  body.appendChild(el('p','note2 bfnote','물약 보충 · 긴급 귀환은 설정(⚙) · 강화석은 대장장이 · 버프 · 정화 물약은 직접 산다(아래 토글은 마시기만)'));
  openModal({who:id,npc:id,name:npcName(id),sub:'상점 · 보유 골드 '+fmt(S.gold)+' · 무게 '+Math.round(wPct()*100)+'%',text:'',body,btns:[{t:'버프 자동 사용 · '+(S.cfg.autoBuf?'켬':'끔'),cls:'bftg'+(S.cfg.autoBuf?' on':''),tip:'켜면 전투가 시작될 때(최근 3초 안에 맞거나 때림) 효과가 꺼진 버프 물약을 가진 것만 마신다 · 기본 끔 · 사는 것은 직접',f:()=>{S.cfg.autoBuf=!S.cfg.autoBuf;toast('버프 물약 자동 사용 '+(S.cfg.autoBuf?'켬 — 전투가 시작되면 효과가 꺼진 버프를 가진 것만 마신다':'끔'),true);save();openShop(id);}},{t:'정화 자동 · '+(S.cfg.autoCure?'켬':'끔'),cls:'cutg'+(S.cfg.autoCure?' on':''),tip:'켜면 독 · 화상 · 둔화가 1초 넘게 남았을 때 정화 물약을 가진 것만 마신다 · 기본 끔 · 사는 것은 직접',f:()=>{S.cfg.autoCure=!S.cfg.autoCure;toast('정화 물약 자동 사용 '+(S.cfg.autoCure?'켬 — 독 · 화상 · 둔화에 걸리면 가진 것만 마신다':'끔'),true);save();openShop(id);}},{t:'가방 (I)',f:()=>{closeModal();openBag();}},{t:'닫기',alt:true,f:closeModal}]});}
/* ================= 대장장이: 강화 상점 (마법 주문서 판매) · 제작 · 강화 ================= */
function openForge(id){const body=el('div','shop');
  {const d=el('div','si'),pr=stonePrice(),nm=el('div','nm');d.appendChild(icv(stkIcon('stone'),'sic'));nm.append(el('b',null,'강화석  '+fmt(S.stone)+'개'),el('small',null,STK.stone.desc()));d.append(nm,el('span','pr',fmt(pr)+' G'));
    for(const n of [1,10]){const b=el('button','btn'+(n===1?' pri':''),n+'개');b.type='button';b.disabled=S.gold<pr*n;b.onclick=()=>{const got=buyStone(n);if(got)toast('강화석 '+got+'개 구입 (-'+fmt(got*pr)+' G)');else toast('골드나 무게가 부족하다');save();openForge(id);};d.appendChild(b);}body.appendChild(d);}
  body.appendChild(el('p','note2','강화 = 강화석 + 골드 · 무기·방어구 +'+ENH.safe.weapon+' · 장신구 +'+ENH.safe.acc+'까지 안전 · 제작 = 지역 광물 + 지역 장비 도면 + 골드(희귀 이상은 제작 비법서) · 광물·도면은 상점에서 팔지 않는다 — 사냥 · 퀘스트 · 지역 보스'));
  openModal({who:id,npc:id,name:npcName(id),sub:'대장장이 · 골드 '+fmt(S.gold),text:'',body,btns:[{t:'장비 강화',pri:true,f:()=>{closeModal();openEnchant();}},{t:'장비 제작',pri:true,f:()=>{closeModal();openCraft();}},{t:'닫기',alt:true,f:closeModal}]});}

/* ================= 제작 (리니지M: 일반·고급 확정 · 희귀 이상 제작 비법서 + 확률) ================= */
let cfK='weapon',cfT=1,cfG=0,cfN=1;
const targetSlotKind=k=>k==='ring'?'ring1':k;
function openCraft(){if(!started)return;cfT=Math.min(cfT,craftTierMax());if(!craftCan(cfK,cfT,cfG)){/* v4.19 레드닷이 있으면 그 조합(가장 좋은 등급·높은 단계)을 먼저 보여 준다 */let pick=null;for(const k of [cfK,...CRAFT_KINDS])if(!pick&&craftCanK(k))for(let t=craftTierMax();t>=1&&!pick;t--)for(let g=4;g>=0;g--)if(craftCan(k,t,g)){pick=[k,t,g];break;}if(pick)[cfK,cfT,cfG]=pick;}openWin({id:'craft',key:'u',kick:'CRAFTING',title:'제작',info:()=>[],render:renderCraft});}
function renderCraft(B,F){const g=el('div','cfw');B.appendChild(g);const L=el('div','cfl');g.appendChild(L);
  const sec=(t,items)=>{const d=el('div','cfs');d.appendChild(el('h4',null,t));const r=el('div','cfr');items.forEach(x=>r.appendChild(x));d.appendChild(r);L.appendChild(d);};
  sec('부위',CRAFT_KINDS.map(k=>{const b=el('button','cfb'+(cfK===k?' on':'')+(craftCanK(k)?' dot':''));b.type='button';b.append(icv(itemIcon({k,t:cfT,g:0,en:0})),el('span',null,SLOTN[k]));b.onclick=()=>{cfK=k;renderWin();};return b;}));
  sec('단계 (지역)',[1,2,3,4,5].map(t=>{const lock=t>craftTierMax(),b=el('button','cfb'+(cfT===t?' on':'')+(lock?' lock':'')+(!lock&&craftCanKT(cfK,t)?' dot':''));b.type='button';b.append(el('b',null,t+'단계'),el('span',null,TIERS[t].mat+' · '+TIERS[t].area));b.disabled=lock;b.title=lock?TIERS[t].area+' 지역을 열면 제작 가능':'';b.onclick=()=>{cfT=t;renderWin();};return b;}));
  sec('등급',[0,1,2,3,4].map(gr=>{const b=el('button','cfb grade'+(cfG===gr?' on':'')+(craftCan(cfK,cfT,gr)?' dot':''));b.type='button';b.style.setProperty('--gc',GRADES[gr].c);b.append(el('b',null,GRADES[gr].n),el('span',null,Math.round(CRAFT_EQ[gr].rate*100)+'%'+(CRAFT_EQ[gr].rcp?' · 비법서':'')));b.onclick=()=>{cfG=gr;renderWin();};return b;}));
  /* 결과 미리보기 */
  const P=el('div','cfp');g.appendChild(P);/* v4.27: 정보는 스크롤(.cfpi) · [제작하기]는 아래 고정 줄(.cfact) */const PI=el('div','cfpi'),ACT=el('div','cfact');P.append(PI,ACT);const pv={k:cfK,t:cfT,g:cfG,en:0},G=GRADES[cfG],c=craftCheck(cfK,cfT,cfG),R=c.R;
  const hd=el('div','cfh'),ic=el('div','cfi');ic.style.setProperty('--gc',G.c);ic.appendChild(icv(itemIcon(pv)));const nm=el('div',null);const t1=el('b',null,itemName(pv));t1.style.color=G.c;nm.append(t1,el('small',null,G.n+' · '+SLOTN[cfK]+' · '+TIERS[cfT].area+' '+cfT+'단계 · 착용 레벨 없음'));hd.append(ic,nm);PI.appendChild(hd);
  const cur=S.eq[targetSlotKind(cfK)]&&itemById(S.eq[targetSlotKind(cfK)]);PI.appendChild(statLines(pv,cur||null));if(cur)PI.appendChild(el('div','tt','착용 중 '+itemName(cur)+'과(와) 비교'));if(craftCan(cfK,cfT,cfG))PI.appendChild(el('div','cfok','● 지금 만들 수 있다 · 착용 중인 장비보다 좋다'));
  const need=el('div','cfn');need.appendChild(el('h4',null,'재료'));
  /* v4.15: 재료 이름 · (i)를 누르면 얻는 곳 팝업 */
  const row=(label,have,req,ok,ico,info)=>{const d=el('div','cfm'+(ok?'':' no'));const l=el('button','cfml');l.type='button';if(ico)l.appendChild(icv(stkIcon(ico),'sic'));l.append(label);
    const ib=el('button','infob','i');ib.type='button';ib.title='얻는 곳';const open=e=>{e.stopPropagation();showTip(ib,tp=>acqTip(tp,info||ico));};l.onclick=open;ib.onclick=open;d.append(l,ib,el('b',null,have+' / '+req));need.appendChild(d);};
  row(STK[c.ok_].n,cnt(c.ok_),c.ore,cnt(c.ok_)>=c.ore,c.ok_);row(STK[c.dk].n,cnt(c.dk),1,cnt(c.dk)>=1,c.dk);if(R.rcp)row(STK[R.rcp].n,cnt(R.rcp),1,cnt(R.rcp)>=1,R.rcp);row('골드',fmt(S.gold),fmt(c.gold),S.gold>=c.gold,null,'gold');
  if(R.need){const m=craftMats(cfK,cfT,R.need.g,R.need.n);row('재료 장비 · '+GRADES[R.need.g].n+' '+itemName({k:cfK,t:cfT,g:R.need.g,en:0}),m.length,R.need.n,m.length>=R.need.n,null,{eq:true,k:cfK,t:cfT,g:R.need.g});}
  PI.appendChild(need);
  PI.appendChild(el('p','note2','성공 '+Math.round(R.rate*100)+'%'+(R.rate<1?' · 실패하면 광물·도면·비법서·골드를 잃고 재료 장비는 남는다':'')+' · 대성공 '+Math.round(CRAFT_GREAT*100)+'%: +1~3 강화된 채로'+(R.need?' · 재료 장비는 강화 수치가 낮은 것부터 · 장착·잠금 장비는 쓰지 않는다':'')));
  /* v4.33 수량: [−] ×N [+] [최대] · 재료가 되는 만큼 · 결과 요약 */
  const mx=craftMaxN(cfK,cfT,cfG);cfN=Math.max(1,Math.min(cfN,Math.max(1,mx)));
  const showFx=(cls,b,sp)=>{const fx=el('div','encfx '+cls);fx.append(el('b',null,b),el('span',null,sp));$('win').querySelector('.wbox').appendChild(fx);setTimeout(()=>fx.remove(),cls.includes('cfsum')?2400:1400);};
  if(mx>1){const q=el('div','cfq');const tb=(t,f,dis)=>{const b=el('button','tgb',t);b.type='button';b.disabled=dis;b.onclick=f;return b;};
    q.append(el('span','tgl','수량'),tb('−',()=>{cfN=Math.max(1,cfN-1);renderWin();},cfN<=1),el('b','tgv','×'+cfN),tb('+',()=>{cfN=Math.min(mx,cfN+1);renderWin();},cfN>=mx),tb('최대',()=>{cfN=mx;renderWin();},cfN>=mx),el('span','cfmax','재료로 최대 '+mx+'회'));ACT.appendChild(q);}
  const go=btn(cfN>1?'제작하기 ×'+cfN:'제작하기','pri',()=>{
    if(cfN<=1){const r=craftItem(cfK,cfT,cfG);if(!r)return;renderWin();showFx(r.ok?'ok':'no',r.ok?(r.great?'대성공':'제작 성공'):'제작 실패',r.ok?GRADES[r.it.g].n+' '+itemName(r.it):'재료 장비는 남았다');return;}
    const o=craftBatch(cfK,cfT,cfG,cfN);if(!o.tries)return;cfN=1;renderWin();
    const sp=o.tries+'회 · 성공 '+o.ok+(o.fail?' · 실패 '+o.fail:'')+(o.great?' · 대성공 '+o.great:'')+(o.best?' · 가장 좋은 것 '+GRADES[o.best.g].n+' '+itemName(o.best):'')+(o.stop?' · 재료가 떨어져 멈춤':'');
    showFx('cfsum '+(o.ok?'ok':'no'),'제작 ×'+o.tries,sp);toast('제작 ×'+o.tries+' — 성공 '+o.ok+(o.fail?' · 실패 '+o.fail:'')+(o.great?' · 대성공 '+o.great:''),o.ok>0);},!c.ok);
  go.classList.add('cfgo');ACT.appendChild(go);
  if(!c.ok)ACT.appendChild(el('small','why',c.why.join(' · ')));
  F.append(el('p','note2','빨간 점 = 지금 재료로 만들 수 있고 착용 중인 장비보다 좋은 부위 · 단계 · 등급 · 제작 = 그 지역 광물 + 그 지역 장비 도면(무기·방어구·장신구) + 골드 · 희귀 이상은 제작 비법서(지역 보스)가 더 필요한 확률 제작 · 광물·도면은 그 지역 사냥 · 퀘스트 · 토벌 의뢰 · 지역 보스로 · 착용 레벨 없음'));}

/* ===== 재료 얻는 곳 (제작 창 (i)) ===== */
const pctS=p=>(Math.round(p*1000)/10)+'%';
function regionHunts(r){return HUNTALL.filter(z=>MAP_REG[ZALL[z].map]===r).map(z=>ZALL[z]);}
function regionBosses(r){return QUESTS.filter(q=>q.elite&&MAP_REG[qMap(q)]===r);}
function acqTip(tp,key){const sec=(t,lines)=>{if(!lines.length)return;tp.appendChild(el('b','acqh',t));const u=el('ul','acql');for(const x of lines){const li=el('li');if(typeof x==='string')li.textContent=x;else li.append(...x);u.appendChild(li);}tp.appendChild(u);};
  const go=(z)=>{const b=btn('이동','',()=>{hideTip();closeWin();const Z=ZALL[z.id];if(!S.maps.includes(Z.map)){toast(MAPS[Z.map].name+'은(는) 아직 갈 수 없다');return;}goHunt(z.id,null,null,Z.name+'(으)로 · 재료 사냥');});b.classList.add('mini');return b;};
  const zoneLine=z=>{const open=S.maps.includes(z.map);return [z.name+' Lv '+z.lv+' — '+z.mobs.map(m=>SPECIES[m[0]].name).join(' · ')+(open?'':' (미개방)'),' ',open?go(z):''];};
  const bossLine=q=>{const i=QUESTS.indexOf(q),f=i<S.qi;return q.elite.name+' · '+ZALL[q.zone].name+(f?' (지역 보스 · '+Math.round(FIELD_RESP/60*10)/10+'분마다)':' (관문 '+(i+1)+' 「'+q.title+'」)');};
  if(key==='gold'){tp.append(el('b','tn','골드'));sec('얻는 곳',['모든 몬스터 처치','메인 · 서브 퀘스트 보상','토벌 의뢰 보상 (Lv '+REP.lv+'+)','지역 보스 · 침공 보스']);return;}
  if(key&&key.eq){const G=GRADES[key.g];tp.append(el('b','tn','재료 장비 · '+G.n+' '+itemName({k:key.k,t:key.t,g:key.g,en:0})));
    sec('얻는 곳',[key.g===0?'제작 · 일반 등급 (같은 부위 · 같은 단계)':'제작 · '+G.n+' 등급','몬스터 드롭 '+pctS(DROP.eq)+(key.g===1?' 중 고급 '+pctS(DROP.hi):key.g===0?'':' (희귀 이상은 지역 보스만)'),TIERS[key.t].area+' 사냥터 (장비 '+key.t+'단계 = Lv '+TIERS[key.t].iL+'~)']);
    tp.appendChild(el('p','note2','장착 · 잠금 장비는 재료로 쓰지 않는다'));return;}
  const d=STK[key];if(!d)return;tp.append(el('b','tn',d.n),el('div','tt','보유 '+fmt(cnt(key))));
  let m;if((m=/^ore(\d)$/.exec(key))){const r=+m[1];sec('드롭하는 몬스터 · '+pctS(DROP.ore)+' (1개)',regionHunts(r).map(zoneLine));sec('지역 보스 · 확정 '+(3+2*r)+'개',regionBosses(r).map(bossLine));sec('그 밖에',[REGN[r]+' 메인 퀘스트 보상','토벌 의뢰 보상 ('+REGN[r]+' 경비대장 · Lv '+REP.lv+'+)','제작 튜토리얼 서브 수락 시']);}
  else if((m=/^d([wac])(\d)$/.exec(key))){const r=+m[2],p=PARTN[m[1]];sec('드롭하는 몬스터 · '+pctS(DROP.dsg)+' (무기·방어구·장신구 중 하나)',regionHunts(r).map(zoneLine));sec('지역 보스 · 확정 1장',regionBosses(r).map(bossLine));sec('그 밖에',[REGN[r]+' 관문 퀘스트 보상 2장 · 일반 메인 일부 1장','토벌 의뢰 보상 60%']);tp.appendChild(el('p','note2',p+' 계열 제작에 1장씩 쓴다'));}
  else if(/^rcp\d$/.test(key)){const pr=DROP.boss[key];sec('지역 보스 · '+pctS(pr),[...QUESTS.filter(q=>q.elite).map(bossLine),'침공 보스 (Lv '+INV.unlockLv+'+)']);sec('그 밖에',['성장 서브 보상 (희귀 · 영웅 장비 제작 등)']);}
  else{tp.appendChild(el('p',null,d.desc?d.desc():''));}}
/* ================= 컬렉션 (리니지M 아이템 컬렉션) ================= */
let colCat=-1;
function openColl(){if(!started)return;openWin({id:'coll',key:'o',kick:'ITEM COLLECTION',title:'컬렉션',info:()=>{const n=COLL.filter(collDone).length,cb=collSum();return [el('span','wchip','완성 '+n+' / '+COLL.length),el('span','wchip',Object.keys(cb).length?Object.entries(cb).map(([k,v])=>STATN[k]+' '+statFmt(k,v)).join(' · '):'효과 없음')];},render:renderColl});}
/* v4.12 일괄 등록: 미완성 컬렉션의 빈 칸마다 조건에 맞는 장비(장착·잠금·지금 장비보다 좋은 것 제외)를 낮은 값부터 */
function collBatchList(){const used=new Set(),L=[];/* v4.17: 등록 가능한 칸은 모두 채운다 (장착 · 잠금 장비만 제외) */
  for(const c of COLL){if(collDone(c))continue;c.req.forEach((r,i)=>{if(collReg(c,i))return;
    const it=S.items.filter(x=>!used.has(x.u)&&!isEq(x)&&!x.lock&&reqMatch(r,x)).sort((a,b)=>a.g-b.g||a.en-b.en||a.t-b.t)[0];if(it){used.add(it.u);L.push([c.id,i,it.u]);}});}return L;}
function collBatch(){const L=collBatchList();let n=0;const before=COLL.filter(collDone).length;for(const [cid,i,u] of L)if(collRegister(cid,i,u))n++;const done=COLL.filter(collDone).length-before;STAT.batchReg=(STAT.batchReg||0)+n;return{n,done};}
function renderColl(B,F){const ct=el('div','icat');for(const [i,n] of [[-1,'전체'],...COLL_CAT.map((n,i)=>[i,n])]){const b=el('button','ict'+(colCat===i?' on':''),n);b.type='button';if(i>=0&&COLL.some(c=>c.cat===i&&!collDone(c)&&c.req.some((r,j)=>!collReg(c,j)&&collCand(r))))b.classList.add('dot');b.onclick=()=>{colCat=i;renderWin();};ct.appendChild(b);}B.appendChild(ct);
  const list=el('div','cll');B.appendChild(list);
  for(const c of COLL.filter(c=>colCat<0||c.cat===colCat)){const done=collDone(c),nReg=c.req.filter((r,i)=>collReg(c,i)).length,card=el('div','clc'+(done?' done':''));
    const hd=el('div','clh');hd.append(el('span','clg',COLL_CAT[c.cat]),el('b',null,c.n),el('span','clp',nReg+'/'+c.req.length),el('span','clb',Object.entries(c.b).map(([k,v])=>STATN[k]+' '+statFmt(k,v)).join(' · ')));card.appendChild(hd);
    const sl=el('div','cls');c.req.forEach((r,i)=>{const reg=collReg(c,i),cand=!reg&&collCand(r),near=!reg&&!cand&&r.en&&collCand(r,true),d=el('div','clr'+(reg?' reg':cand?' can':near?' near':''));
      const ic=el('div','clic');ic.style.setProperty('--gc',r.g?GRADES[r.g].c:'rgba(232,184,100,.35)');ic.appendChild(icv(itemIcon(reqIcon(r))));if(reg)ic.appendChild(el('span','ok','✓'));else if(cand)ic.appendChild(el('span','ex','!'));else if(near)ic.appendChild(el('span','pl','+'));
      d.append(ic,el('span','cln',reqLabel(r)));
      if(cand){let armed=false;const b=btn('등록','pri',()=>{if(!armed){armed=true;b.textContent='한 번 더 (사라짐)';return;}collRegister(c.id,i,cand.u);renderWin();});b.title=itemName(cand)+'을(를) 등록 — 등록한 아이템은 사라진다';d.appendChild(b);}
      else if(near)d.appendChild(el('small','clhint','강화 후 등록'));
      else if(!reg&&r.bu){const q=QUESTS.find(x=>x.id===BU[r.bu].q),i=QUESTS.indexOf(q);d.appendChild(el('small','clhint',i<S.qi?ZALL[q.zone].name+' 지역 보스':'관문 「'+q.title+'」에서'));}
      sl.appendChild(d);});card.appendChild(sl);list.appendChild(card);}
  {const L=collBatchList();const bb=btn(L.length?'일괄 등록 · '+L.length+'칸':'일괄 등록할 장비 없음','pri',()=>{const r=collBatch();toast('일괄 등록 '+r.n+'개'+(r.done?' · 컬렉션 '+r.done+'개 완성':''),true);renderWin();},!L.length);
    bb.title='등록 가능한 모든 칸을 한 번에 채운다 · 장착 · 잠금 장비는 빠진다';const bar=el('div','clbatch');bar.append(bb,el('small',null,'등록 가능한 칸을 모두 채운다 · 지키고 싶은 장비는 🔒 잠금'));F.appendChild(bar);}
  F.append(el('p','note2','지역 보스 컬렉션은 보스 전용 장비(★)로만 채운다 · 관문을 넘긴 보스는 '+Math.round(FIELD_RESP/60*10)/10+'분마다 다시 나타난다 · 등록한 장비는 사라지고 되돌릴 수 없다 · 컬렉션을 완성하면 능력치·신앙이 영구히 오른다 · 장착 중 · 잠금 장비는 등록되지 않는다 · 빨간 ! 바로 등록 가능 · 파란 + 강화하면 등록 가능 · 컬렉션에 쓸 수 있는 장비는 일괄·자동 분해에서 빠진다'));}

/* ================= v4.31 획득 기록 (L) — 자동 사냥 중 무엇을 어디서 얻었는지 ================= */
const LOGF=[['all','전체'],['eq','장비'],['mat','도면 · 주문서'],['book','비법서 · 스킬서'],['miss','놓친 것']];
const logOk=(e,f)=>f==='all'||(f==='miss'?!!e.miss:!e.miss&&e.cat===f);
function agoTxt(at){const s=Math.max(0,(Date.now()-at)/1000);return s<60?'방금':s<3600?Math.floor(s/60)+'분 전':s<86400?Math.floor(s/3600)+'시간 전':Math.floor(s/86400)+'일 전';}
const LOG_T0=Date.now();
function logSum(){const L=(S.acq||[]).filter(e=>e.at>=LOG_T0),o={eq:0,mat:0,book:0,miss:0};for(const e of L){if(e.miss)o.miss+=e.q||1;else o[e.cat]+=e.q||1;}return o;}
function logState(e){if(e.miss)return['놓침','miss'];if(!e.u)return['',''];const it=itemById(e.u);if(!it)return['사용함','gone'];if(isEq(it))return['장착 중','on'];return[it.lock?'가방 · 🔒':'가방','bag'];}
function openLog(){if(!started)return;openWin({id:'log',key:'l',kick:'LOOT LOG',title:'획득 기록',info:()=>{const L=S.acq||[],m=logSum(),c=[el('span','wchip','최근 '+L.length+' / '+ACQ_MAX),el('span','wchip','이번 접속 · 장비 '+m.eq+' · 도면 · 주문서 '+m.mat+' · 비법서 '+m.book)];if(m.miss)c.push(el('span','wchip warn','놓친 장비 '+m.miss));return c;},render:renderLog});}
function renderLog(B,F){const L=S.acq||[],f=LOGF.some(x=>x[0]===S.logF)?S.logF:'all';
  const ct=el('div','icat');for(const [id,n] of LOGF){const k=L.filter(e=>logOk(e,id)).length,b=el('button','ict'+(f===id?' on':''),n+(id==='all'?'':' '+k));b.type='button';if(id==='miss'&&L.some(e=>e.miss&&e.at>(S.acqSeen||0)))b.classList.add('dot');b.onclick=()=>{S.logF=id;save();renderWin();};ct.appendChild(b);}B.appendChild(ct);
  const list=el('div','lgl');B.appendChild(list);const V=L.filter(e=>logOk(e,f));
  if(!V.length)list.appendChild(el('p','lgem',L.length?'이 분류의 기록이 없다':'아직 기록이 없다 — 고급 이상 장비 · 보스 전용 장비(★) · 도면 · 제작 비법서 · 스킬서 · 축복 주문서를 얻으면 여기에 남는다'));
  for(const e of V){const r=el('div','lgr'+(e.miss?' miss':'')),col=e.cat==='eq'?GRADES[e.g||0].c:(STK[e.k]&&STK[e.k].col)||'#e8b864',[st,sc]=logState(e);
    const nm=el('b','lgn',(e.bu?'★ ':'')+e.n+((e.q||1)>1?' ×'+e.q:''));nm.style.color=col;const dt=el('i','lgd');dt.style.background=col;
    r.append(dt,nm,el('span','lgs',e.src||''),el('span','lgz',e.z||''),el('span','lgt '+sc,st),el('span','lga',agoTxt(e.at)));list.appendChild(r);}
  {let armed=false;const b=btn('기록 비우기','',()=>{if(!armed){armed=true;b.textContent='한 번 더 (비우기)';return;}S.acq=[];save();renderWin();},!L.length);
    F.append(b,el('p','note2','자동 사냥 · 퀘스트로 얻은 것을 최근 '+ACQ_MAX+'건까지 · 고급 이상 장비 · 보스 전용 장비 · 도면 · 비법서 · 스킬서 · 축복 주문서만 (일반 장비 · 광물 · 강화석 · 물약 · 상점 구입 · 제작 결과는 남기지 않는다) · 놓친 것 = 가방 가득 · 무게 초과로 줍지 못한 장비 — 가방(I)을 정리하자'));}
  S.acqSeen=Date.now();}



/* ================= 갱신 ================= */
function manualVec(){let x=0,y=0;if(keys.has('a')||keys.has('arrowleft'))x--;if(keys.has('d')||keys.has('arrowright'))x++;if(keys.has('w')||keys.has('arrowup'))y--;if(keys.has('s')||keys.has('arrowdown'))y++;if(joy.on&&Math.hypot(joy.dx,joy.dy)>.2){x=joy.dx;y=joy.dy;}return [x,y];}
function updatePlayer(dt){if(t<cineT){player.moving=false;return;}/* 포탈 연출 중에는 움직이지 않는다 */const st=pStats();player.atkT-=dt*(fxOn('slow')?FXDEF.slow.as:1)/* v4.62 둔화: 공격 속도 −20% */;player.hurt=Math.max(0,player.hurt-dt);
  if(player.swing>0){player.swing+=dt;const sm=player.swingTgt;if(sm&&!player.swingHit&&player.swing>.1){player.swingHit=true;if(alive(sm)&&inRange(sm,basicRange()+8)){playerHit(sm,basicMul()*gfxBasic(sm));gfxAfterBasic(sm);gfxXhit(sm);if(godOn('zeus')&&++player.hitN%3===0)chainBolt(sm);}}if(player.swing>.28){player.swing=0;player.swingHit=false;player.swingTgt=null;}}
  if(player.spin>0)player.spin-=dt;
  if(player.dash){const D=player.dash;D.t+=dt;const k=Math.min(1,D.t/D.dur);player.x=D.x0+(D.x1-D.x0)*k;player.y=D.y0+(D.y1-D.y0)*k;if(Math.random()<.9)spawnP(player.x,player.y,14,{col:'#a8e0ff',life:.25,size:6,size1:0});
    if(k>=1){player.dash=null;player.swing=.001;player.swingHit=true;for(const m of mobs)if(alive(m)&&(m===D.m||Math.hypot(m.x-player.x,m.y-player.y)<24+6*m.sc))playerHit(m,D.mul,true);burst(player.x,player.y,10,'#c8f0ff',14,90,4);}
    player.moving=true;return;}
  if(player.dead){player.moving=false;return;}
  if(godOn('athena')){player.shT-=dt;if(player.shT<=0){player.shT=8;player.shield=Math.max(player.shield,st.hp*(.10+.015*gLv()));}}else player.shield=0;
  {const R=inR(ZONES.village.r,player.x,player.y,0)?REGEN.village:REGEN.field;if(wPct()<.5){if(t-player.lastHit>R.delay)player.hp=Math.min(st.hp,player.hp+st.hp*R.hp*dt*(1+gfxSum('rg')+tbVal('rg')));/* v4.74 균사 망토 */player.mp=Math.min(st.mp,player.mp+(R.mp0+st.mp*R.mp)*dt*(1+tbVal('mpRg')));/* v4.80 체력 20 · 지력 10 */}}
  if(S.autoPot&&player.hp<st.hp*(S.cfg.potAt||.4)&&t-player.lastHit<6)usePot('hp',true);if(auto&&player.mp<st.mp*.2)usePot('mp',true);
  if(fxOn('stun')){player.moving=false;return;}/* v4.62 기절: 0.8초 행동 불가(자동 · 수동 모두 · 물약 자동 사용은 위에서 이미 함) */
  const [mx,my]=modal&&!modal.live?[0,0]:manualVec();player.moving=false;
  if(mx||my){manualT=.5;stopAutoQ();if(nav||hunt||chase){nav=null;hunt=null;chase=null;moveRing.visible=false;}const moved=stepMove(player,mx,my,pSPD(),dt);player.moving=moved;faceTo(player.x+mx*10,player.y+my*10);anchor=null;return;}
  manualT-=dt;if(modal&&!modal.live)return;/* live 팝업(균열 안내)은 떠 있어도 전투가 이어진다 */
  if(nav){const done=followPath(player,nav.path,pSPD(),dt);player.moving=!done;if(nav.path.length)faceTo(nav.path[0].x,nav.path[0].y);
    nav.stuck+=dt;if(nav.stuck>.8){if(Math.hypot(player.x-nav.lx,player.y-nav.ly)<4){const p=findPath(player.x,player.y,nav.goal.x,nav.goal.y);if(p)nav.path=p;}nav.stuck=0;nav.lx=player.x;nav.ly=player.y;}
    if(nav.hunt&&inR(ZONES[nav.hunt.zone].r,player.x,player.y,-10)){const h=nav.hunt;startHunt(h.zone,h.sp,h.mob,h.sub);return;}
    if(nav.kind==='npc'){const n=npcList.find(n=>n.id===nav.id);if(dist(n,player)<30||done){const id=nav.id,th=nav.then;nav=null;if(th)th();else openNpc(id);}return;}
    if(done){if(nav.hunt){const h=nav.hunt;startHunt(h.zone,h.sp,h.mob,h.sub);return;}nav=null;moveRing.visible=false;}return;}
  if(chase){if(!alive(chase)){chase=null;}else{target=chase;if(inRange(chase,basicRange()-2)){faceTo(chase.x,chase.y);basicAttack(chase);}else{approach(chase,dt);}return;}}
  if(auto&&manualT<=0)autoTick(dt);}
let apPath=null,apT=0,apFor=null;
/* v4.51 G1-b2b 닿을 수 없는 원거리 몬스터의 회피(evade) — MMORPG 라이크의 목줄 · 회피 규칙.
   자동 전투가 같은 대상에게 EVADE.t초 동안 EVADE.prog만큼도 다가가지 못하면(지형에 막힘 · 길 없음) 그 원거리 몬스터는 쏘지 않고 집으로 돌아가 체력을 되찾고,
   집에 닿은 뒤 EVADE.lock초 동안 먼저 덤비지 않는다. 자동 전투는 그 대상을 EVADE.skip초 건너뛴다. 근접형은 스스로 다가오므로 해당 없음(동작 불변). */
let apProg=null;
function apWatch(m){const d=dist(m,player);if(!apProg||apProg.m!==m){apProg={m,best:d,t0:t};return false;}
  if(d<apProg.best-EVADE.prog){apProg.best=d;apProg.t0=t;return false;}
  if(t-apProg.t0>=EVADE.t&&m.aggro&&mobBeh(m)==='ranged'){mobEvade(m);apProg=null;return true;}return false;}
function mobEvade(m){m.aggro=false;m.ret=true;m.evd=true;m.wind=0;if(m.aim){const i=tele.indexOf(m.aim.e);if(i>=0)tele.splice(i,1);m.aim=null;}m.evU=t+EVADE.skip;
  if(target===m)target=null;if(apFor===m){apFor=null;apPath=null;}floatTxt(m.x,m.y,'회피','#bfe0ff');STAT.evade=(STAT.evade||0)+1;}
function approach(m,dt){apT-=dt;if(apFor!==m||apT<=0||!apPath){apFor=m;apT=.6;apPath=los(player.x,player.y,m.x,m.y)?[{x:m.x,y:m.y}]:findPath(player.x,player.y,m.x,m.y);}
  if(apPath&&apPath.length){const last=apPath[apPath.length-1];last.x=m.x;last.y=m.y;followPath(player,apPath,pSPD(),dt);player.moving=true;if(apPath.length)faceTo(apPath[0].x,apPath[0].y);}}
const sReady=i=>skLv(i)>0&&player.cd[i]<=t&&player.mp>=SK[i].mp;
/* v4.8 자동 전투 스킬: 슬롯에 넣은 스킬만, 설정 순서(슬롯 1→8 / 강한 순)로 */
function autoOrder(){const L=S.slots.map(id=>id&&skIdx(id)).filter(i=>i!=null&&i>=0);if(S.cfg.order==='strong')L.sort((a,b)=>(SK[b].kind==='buff')-(SK[a].kind==='buff')||(SK[b].mul||0)*(SK[b].hits||1)-(SK[a].mul||0)*(SK[a].hits||1));return L;}
function skillFits(i,m,dm,near){const s=SK[i],st=pStats();switch(s.kind){
  case 'buff':if(s.id==='roar')return (m.boss||near>=2)&&t>=player.buffT;if(s.id==='guard')return (m.boss||near>=2||player.hp<st.hp*.6)&&t>=player.guardT;return (m.boss||near>=2)&&t>=player.fervT;
  case 'aoe':return near>=1&&dm<s.r;
  case 'dash':return (godOn('artemis')||dm>34)&&dm<s.range;
  default:return dm<s.range;}}
let dodgeT=0,dodgeOff=0;const DODGE={max:2,rest:1};
/* v4.72 G1-h 자동 전투 대응(지시서 §G1) — MMORPG 라이크 자동 사냥 설정의 '대상 우선순위' · 스킬 사용 조건.
   gdNow: 방어 태세로 웅크렸거나 웅크리기 직전(GUARD.pre) · gdSwap: 곁(AUTOH.swap) 다른 개체 · gdSave: 웅크린 대상에게 아끼는 스킬(피해 스킬 · 재사용 대기 AUTOH.cd초 이상)
   autoRanged: '원거리 먼저' — 나를 노리는(어그로) 원거리 원형 몬스터 중 가장 가까운 것(AUTOH.rng 안) */
const AUTOH={cd:8,swap:70,rng:200};
const gdNow=m=>!!(m&&(m.gdU>t||m.gdN>0&&m.gdN-t<GUARD.pre&&(mobBeh(m)==='guard'||m.bp&&m.bp.k==='guard')));
function gdSwap(m){let best=null,bd=AUTOH.swap;for(const e of mobs){if(e===m||!alive(e)||e.inv||e.evU>t||e.ret||e.field&&!(hunt&&hunt.mob===e)||gdNow(e))continue;if(!e.aggro&&!(hunt&&hunt.sp&&e.sp===hunt.sp))continue;const d=dist(e,player);if(d<bd){bd=d;best=e;}}return best;}
const gdSave=i=>{const s=SK[i];if(s.kind==='buff'||(s.cd||0)<AUTOH.cd)return false;if(s.kind==='aoe'){for(const e of mobs)if(alive(e)&&!gdNow(e)&&dist(e,player)<s.r)return false;}return true;};
function autoRanged(){let best=null,bd=AUTOH.rng;for(const e of mobs){if(!alive(e)||!e.aggro||e.ret||e.inv||e.evU>t||e.field&&!(hunt&&hunt.mob===e))continue;if(mobBeh(e)!=='ranged')continue;const d=dist(e,player);if(d<bd){bd=d;best=e;}}return best;}
function autoTick(dt){
  {const dz=t<dodgeOff||S.cfg.dodge===false?null:dangerAt(player.x,player.y,8,true);/* v4.72 G1-h 설정 '예고 회피'(기본 켬) */if(dz){const a=dz.a,x0=player.x,y0=player.y;stepMove(player,Math.cos(a),Math.sin(a),pSPD(),dt);const mv=Math.hypot(player.x-x0,player.y-y0);
    /* v4.52 피하는 걸음이 막히거나(벽 · 물가) 2초 넘게 계속 피하기만 하면 1초 동안 피하기를 쉬고 싸움 · 다가가기로 — 원거리 둘이 번갈아 쏘면 막힌 쪽으로 '피하다' 한 걸음도 못 가고 다 맞던 것(180초 133발 중 133발) */
    if(alive(target)&&!inRange(target,basicRange()-2)&&apWatch(target)){dodgeT=0;return;}/* v4.52 피하는 동안에도 다가가기 진척을 센다 */
    if(mv<pSPD()*dt*.25||(dodgeT+=dt)>DODGE.max){dodgeT=0;dodgeOff=t+DODGE.rest;STAT.dodgeRest=(STAT.dodgeRest||0)+1;}else{player.moving=true;faceTo(player.x+Math.cos(a),player.y+Math.sin(a));return;}}else if(t>=dodgeOff)dodgeT=0;}/* v4.47 모든 예고(원형 · 직선 · 부채꼴)를 피한다 */
  if(!hunt&&inR(ZONES.village.r,player.x,player.y,10)){anchor=null;return;}
  if(!anchor)anchor={x:player.x,y:player.y};
  let m=null;if(hunt&&hunt.mob&&alive(hunt.mob))m=hunt.mob;
  if(!m&&alive(target)&&!(target.evU>t)&&(!hunt||!hunt.sp||target.sp===hunt.sp||target.aggro)&&!(hunt&&!inR(ZONES[hunt.zone].r,target.x,target.y,90)&&!target.aggro))m=target;
  if(!m&&S.cfg.counter!==false){let bd=1e9;for(const e of mobs)if(alive(e)&&e.aggro&&!e.ret){const d=dist(e,player);if(d<bd&&d<140){bd=d;m=e;}}}
  if(!m&&hunt&&hunt.mob&&!alive(hunt.mob))hunt.mob=null;
  const SCAN={near:110,mid:170,far:260}[S.cfg.scan]||170;
  if(!m)m=hunt?nearestMob(900,S.cfg.tgt==='near'&&!hunt.mob&&!hunt.sub?null:hunt.sp,hunt.zone):nearestMob(SCAN);
  if(m&&!(hunt&&hunt.mob===m)){if(S.cfg.tgt==='ranged'&&mobBeh(m)!=='ranged'){const r=autoRanged();if(r)m=r;}/* v4.72 G1-h '원거리 먼저' */
    if(gdNow(m)){const o=gdSwap(m);if(o){m=o;STAT.gdSwap=(STAT.gdSwap||0)+1;}}}/* v4.72 G1-h 웅크린(직전 포함) 대상은 곁의 다른 개체로 */
  if(m&&!hunt&&dist(m,anchor)>SCAN+50&&!(m.aggro&&!m.ret&&dist(m,player)<140))m=null;/* v4.53 G1-b2c2: 나를 공격 중인 몬스터(140 안)는 자리 범위 밖이어도 버리지 않는다 — 원거리가 물러나 범위(SCAN+50) 밖에서 쏘면 자리로 돌아가다 지형에 막혀 180초 동안 133발을 다 맞던 꼬리 판 */
  if(!m){if(hunt){const Z=ZONES[hunt.zone];if(!hunt.roam||!hunt.roam.length){const homes=mobs.filter(e=>e.zone===hunt.zone&&!e.eliteOf&&(!hunt.sp||e.sp===hunt.sp));const h=homes.length?homes[Math.floor(Math.random()*homes.length)].home:{x:Z.c[0],y:Z.c[1]};hunt.roam=findPath(player.x,player.y,h.x,h.y)||[];}
      followPath(player,hunt.roam,pSPD(),dt);player.moving=!!hunt.roam.length;if(hunt.roam.length)faceTo(hunt.roam[0].x,hunt.roam[0].y);}
    else if(dist(player,anchor)>12){const x0=player.x,y0=player.y;stepMove(player,anchor.x-player.x,anchor.y-player.y,pSPD(),dt);if(Math.hypot(player.x-x0,player.y-y0)<SPD*dt*.25)anchor={x:player.x,y:player.y};/* v4.53: 자리로 가는 길이 막히면(직선 걸음) 지금 자리를 새 자리로 */else{player.moving=true;faceTo(anchor.x,anchor.y);}}return;}
  target=m;if(hunt)hunt.roam=null;
  if(player.atkT<=.2&&!player.dash&&!tooHeavy()){const dm=dist(m,player),near=mobs.filter(e=>alive(e)&&dist(e,player)<SK[0].r+8).length,big=m.boss||m.hp>m.max*.5||near>=2;
    if(big){const gd=gdNow(m);for(const i of autoOrder())if(sReady(i)&&skillFits(i,m,dm,near)&&!(gd&&gdSave(i))&&castSkill(i,true)){return;}else if(gd&&sReady(i)&&gdSave(i))STAT.gdSave=(STAT.gdSave||0)+1;}}/* v4.72 G1-h 웅크린 대상에게는 재사용 대기 AUTOH.cd초 이상 스킬을 아낀다 *//* v4.52: 스킬을 써도 다가가기 진척(apProg)은 이어 본다 — 스킬마다 지워 회피 판정이 영영 안 되던 것 */
  if(inRange(m,basicRange()-2)){apProg=null;faceTo(m.x,m.y);basicAttack(m);}else{if(apWatch(m))return;approach(m,dt);}}
/* ================= v4.47 몬스터 행동 원형 (지시서 §G1) =================
   BEHAV[id].tick(m,dt,dp,moveTo) — 어그로 상태의 한 프레임. 'melee'는 v4.46까지의 코드를 그대로 옮긴 것(동작 불변 · melee447 테스트가 옛 빌드와 대조).
   원거리 · 돌진 · 방어 태세 · 자폭은 G1-b~d에서 이 표에 더한다. */
const mobB=m=>{if(m.boss&&!m.inv||m.eliteOf)return null;/* v4.71 침공 보스는 그 종의 원형(G1-g3) */const b=MOB_B[m.sp];if(!b||(b.zn&&m.zone&&!b.zn.includes(m.zone)))return null;return (b.zo&&m.zone&&MOB_BZ[m.sp+'@'+m.zone])||b;};/* v4.61 zo: 사냥터별 덮어쓰기(같은 종이 두 레벨대에 있을 때 — 미리 합친 표 MOB_BZ) */
const MOB_BZ={};for(const k in MOB_B){const b=MOB_B[k];if(b.zo)for(const z in b.zo)MOB_BZ[k+'@'+z]=Object.assign({},b,b.zo[z]);}/* v4.59 zn: 그 사냥터 개체에만 원형(한 종이 두 레벨대에 있을 때 하나씩) *//* 보스 · 관문 정예는 G1-f~g에서 패턴으로 */
const mobBeh=m=>{const b=mobB(m);return b&&b.b||'melee';};
/* v4.68 G1-f 보스 패턴(지시서 §G1) — BOSS_PAT[퀘스트 id]가 있는 관문 정예 · 지역 보스판만. 나머지 보스는 옛 장판(m.aoe) 그대로(G1-g).
   m.bp = 지금 하는 패턴 하나({id,k,t,…}) · 예고는 tele 풀(ownP/bid — 보스가 죽거나 어그로가 풀리면 teleTick이 판정 없이 지움 · 돌진 띠는 bcut). 돌아오는 값 true = 이번 프레임 근접 행동 없음(휩쓸기 · 돌진 중) */
let bpUid=0;
const bossPat=m=>m&&(m.boss&&m.eliteOf&&BOSS_PAT[m.eliteOf]||(m.inv&&m.boss||m.riftBoss)&&BOSS_GEN)||null;/* v4.71 G1-g3 침공 보스 · 균열의 주인 = BOSS_GEN(그 종의 원형 + ①) */
const spBusy=m=>!!(m.chg||m.aim||m.bst||m.gdU>t||m.stag>t||mobBeh(m)==='guard'&&m.gdN>t&&m.gdN-t<GUARD.pre);/* v4.71 원형 특수 공격 중(조준 · 돌진 · 부풀기 · 웅크림(직전 포함) · 휘청) */
function bpStat(k,hit){const o=STAT.bp||(STAT.bp={});const r=o[k]||(o[k]={n:0,hit:0});if(hit)r.hit++;else r.n++;}
const BP_ZONE={aoe:1,ember:1,tri:1,fire:1};/* v4.74 장판 계열(등잔 껍데기 갑옷) */
function bpHit(m,k){const P=bossPat(m),D=BPAT[k];if(player.dead)return false;hurtPlayer(calcDmg(m.atk,P&&P.mul&&P.mul[k]||D.mul,pStats().def,m.lv,S.lv),m,BP_ZONE[k]?'zone':null);if(player.lastHit!==t)return false;bpStat(k,true);const fx=P&&P.fx&&P.fx[k];if(fx)addFx(fx,m);return true;}
function bpTri(m){const c=m.bp,B=BPAT.tri,x=player.x,y=player.y;bpTele(m,{kind:'circle',x,y,r:B.r,dur:B.dur,hit:()=>{if(Math.hypot(player.x-x,player.y-y)<B.r)bpHit(m,'tri');burst(x,y,5,'#ff7030',30,120,5);}});c.n++;if(c.n>1)bpStat('tri');}/* 3연속: 그 순간 플레이어 자리 · 하나하나를 한 번의 시도로 센다 */
function bpTele(m,o){return teleAdd(Object.assign({ownP:m,bid:m.bp.id},o));}
/* v4.70 G1-g2 남는 불 장판 — 불씨 장판이 터진 자리에 4초(같은 패턴 id · 동시 예고 1개로 센다). 1초마다 안에 있으면 ×0.3 · 자동 전투에게도 위험 지역(dangerAt) */
function bpFire(m,x,y,id){const F=BPAT.fire;if(m.dead||!m.aggro)return;teleAdd({kind:'circle',x,y,r:F.r,dur:F.life,ownP:m,bid:id,lin:true,nt:F.iv,tick:(e)=>{if(e.t>=e.nt){e.nt+=F.iv;bpStat('fire');if(!player.dead&&Math.hypot(player.x-x,player.y-y)<F.r){bpHit(m,'fire');burst(player.x,player.y,4,'#ff7030',10,60,3);}}if(Math.random()<.3)burst(x+rand(-F.r,F.r)*.7,y+rand(-F.r,F.r)*.7,1,'#ff9040',4,40,3);}});STAT.bpFire=(STAT.bpFire||0)+1;}
/* v4.69 G1-g1 — 3갈래 발사(고정된 세 줄 방향 · 한 번의 시도로 센다) · 졸개 소환 · 졸개 정리 */
function bpVolley(m){const c=m.bp,B=BPAT.volley,bv={},col=(SPECIES[m.sp].c||[])[1]||'#ffd0f0';for(const e of c.es){e.bcut=true;if(shots.length>=16)shots.shift();shots.push({x:e.x,y:e.y,a:e.a,c:Math.cos(e.a),s:Math.sin(e.a),v:B.spd,d:0,max:B.dist,r:B.pr,t:0,m,col,bk:'volley',bv});}STAT.shotN=(STAT.shotN||0)+B.n;}
function bpSummon(m){const P=bossPat(m),B=BPAT.summon,Z=ZONES[m.zone],L=Z&&Z.mobs||[],row=L.find(r=>r[0]===P.sum)||L[0];if(!row)return;STAT.bpSum=(STAT.bpSum||0)+1;
  for(let i=0;i<B.n;i++){const a=i/B.n*6.283+.4;let x=m.x+Math.cos(a)*B.r,y=m.y+Math.sin(a)*B.r;if(blockedAt(x,y)){x=m.x;y=m.y;}const e=makeMob(row[0],row[1],Math.round(x),Math.round(y),m.zone,false,{ext:{sumOf:m}});e.aggro=true;e.atkT=1+i*.5;e.hp=e.max=Math.max(1,Math.round(e.max*B.hpK));e.atk=Math.round(e.atk*B.atkK);burst(x,y,8,'#c0a0ff',10,80,4);}
  floatTxt(m.x,m.y-24,'졸개 소환!','#d0b0ff');}
function bpDismiss(m){m.sumD=false;for(const e of mobs)if(e.sumOf===m&&!e.gone){e.gone=true;if(!e.dead){e.dead=true;e.hp=0;e.deadT=0;e.respawn=1e9;e.aggro=false;e.mesh.visible=false;burst(e.x,e.y,6,'#c0a0ff',10,60,3);if(target===e)target=null;}}}
function bpStart(m,k,dp){const B=BPAT[k],a=Math.atan2(player.y-m.y,player.x-m.x);m.bp={id:++bpUid,k,t:0,n:0};bpStat(k);m.face=player.x<m.x?-1:1;
  if(k==='aoe'||k==='ember'){const x=player.x,y=player.y,id=m.bp.id;bpTele(m,{kind:'circle',x,y,r:B.r,dur:B.dur,hit:()=>{if(Math.hypot(player.x-x,player.y-y)<B.r)bpHit(m,k);burst(x,y,4,'#ff8040',40,140,6);if(k==='ember')bpFire(m,x,y,id);}});}
  else if(k==='fan'){const x=m.x,y=m.y;bpTele(m,{kind:'fan',x,y,a,r:B.r,half:B.half,dur:B.dur,hit:e=>{const d=Math.hypot(player.x-x,player.y-y);let da=Math.atan2(player.y-y,player.x-x)-e.a;da=Math.atan2(Math.sin(da),Math.cos(da));if(d<B.r&&(Math.abs(da)<=B.half||d<8))bpHit(m,k);burst(x+Math.cos(e.a)*B.r*.5,y+Math.sin(e.a)*B.r*.5,6,'#8ae0c0',30,120,5);}});}
  else if(k==='tri')bpTri(m);
  else if(k==='volley'){m.bp.es=[];for(let i=0;i<B.n;i++){const o=(i-(B.n-1)/2)*B.gap;m.bp.es.push(bpTele(m,{kind:'line',x:m.x-Math.sin(a)*o,y:m.y+Math.cos(a)*o,a,len:B.dist,w:B.w,dur:B.aim,aim:true,keep:true,off:o}));}}/* v4.69 3갈래: 같은 패턴 id의 줄 3개(동시 예고 1개로 센다) */
  else if(k==='guard'){m.gdN=t+B.pre;}/* v4.69 방어 태세: 방패 깜빡임(그리기는 일반 방어 태세와 같은 gdN · gdU) */
  else if(k==='dash'){m.bp.ph='aim';m.bp.e=bpTele(m,{kind:'line',x:m.x,y:m.y,a,len:Math.min(B.dist,dp+B.over),w:B.w,dur:B.dur,aim:true,keep:true});}
  m.wind=0;}
function bossTick(m,dt,dp){const P=bossPat(m),R=BPAT.rage;
  if(P.rage&&!m.rage&&m.hp>0&&m.hp<=m.max*R.at){m.rage=true;STAT.bpRage=(STAT.bpRage||0)+1;floatTxt(m.x,m.y-20,'광폭!','#ff4a3a');burst(m.x,m.y,14,'#ff4a3a',20,120,6);}
  if(P.sum&&!m.sumD&&m.hp>0&&m.hp<=m.max*BPAT.summon.at){m.sumD=true;bpSummon(m);}/* v4.69 ⑤ 졸개 소환 — 패턴 칸과 따로(체력 구간 전환 · 한 번) */
  m.aoeT-=dt;const c=m.bp;
  if(P.gen&&spBusy(m))m.spE=t;/* v4.71 원형 특수 공격이 끝난 시각 */
  if(!c){if(m.aoeT<=0&&dp<200&&!player.dead&&!(P.gen&&t-(m.spE||-99)<BPAT.gap)){const k=P.p[(m.pi||0)%P.p.length],stop=k==='fan'||k==='dash'||k==='volley';if(stop&&m.wind>0)return false;/* 휘두르던 근접은 끝내고 */m.pi=(m.pi||0)+1;m.aoeT=BPAT.cd;bpStart(m,k,dp);return stop;}return false;}
  c.t+=dt;const B=BPAT[c.k];
  if(c.k==='volley'){m.face=player.x<m.x?-1:1;const ba=Math.atan2(player.y-m.y,player.x-m.x);
    const lay=e=>{e.a=ba;e.x=m.x-Math.sin(ba)*e.off;e.y=m.y+Math.cos(ba)*e.off;};/* 나란한 세 줄(옆으로 gap씩) — 줄 사이로 피할 틈이 있다 */
    if(c.t<B.aim-B.lock){for(const e of c.es)lay(e);}
    else if(!c.lk){c.lk=true;for(const e of c.es){e.aim=false;e.t=0;e.dur=B.lock;lay(e);}}/* 고정: 새 예고처럼 t=0 — 자동 전투는 0.3초 뒤 반응 */
    if(c.t>=B.aim){bpVolley(m);m.bp=null;m.atkT=Math.max(m.atkT,.6);}return true;}
  if(c.k==='guard'){if(!c.on){if(c.t>=B.pre&&m.wind<=0){c.on=true;m.gdU=t+B.dur;STAT.guardN=(STAT.guardN||0)+1;}return false;}/* 휘두르던 근접은 끝낸 뒤 웅크림 */
    if(m.gdU<=t){m.bp=null;m.gdN=0;}return true;}
  if(c.k==='aoe'||c.k==='ember'){if(c.t>=B.dur){m.bp=null;m.bpE=t;}return false;}
  if(c.k==='tri'){while(c.n<B.n&&c.t>=c.n*B.gap)bpTri(m);
    if(c.t>=(B.n-1)*B.gap+B.dur+.01)m.bp=null;return false;}
  if(c.k==='fan'){m.face=Math.cos((tele.find(e=>e.bid===c.id)||{a:0}).a)<0?-1:1;if(c.t>=B.dur+.01)m.bp=null;return true;}
  /* dash */const e=c.e;
  if(c.ph==='aim'){m.face=player.x<m.x?-1:1;
    if(c.t<B.dur-B.lock){e.x=m.x;e.y=m.y;e.a=Math.atan2(player.y-m.y,player.x-m.x);e.len=Math.min(B.dist,dp+B.over);}
    else if(!c.lk){c.lk=true;e.aim=false;e.t=0;e.dur=B.lock;e.x=m.x;e.y=m.y;e.a=Math.atan2(player.y-m.y,player.x-m.x);e.len=Math.min(B.dist,dp+B.over);c.a=e.a;c.rem=e.len;const ca=Math.cos(c.a),sa=Math.sin(c.a);while(c.rem>20&&Math.hypot(m.x+ca*c.rem-m.home.x,m.y+sa*c.rem-m.home.y)>B.leash)c.rem-=5;e.len=c.rem;}/* 고정: 새 예고처럼 t=0 — 자동 전투는 0.3초 뒤 반응 · 끝은 집에서 leash 안(보스 추격 한계 240) */
    if(c.t>=B.dur)c.ph='dash';return true;}
  const x0=m.x,y0=m.y,ca=Math.cos(c.a),sa=Math.sin(c.a),v=Math.min(c.rem,B.spd*dt),mv=stepMove(m,ca,sa,v/dt,dt);c.rem-=v;m.moving=true;m.face=ca<0?-1:1;e.x=m.x;e.y=m.y;e.len=Math.max(0,c.rem);
  if(!c.hit&&!player.dead){const px=player.x-x0,py=player.y-y0,u=Math.max(0,Math.min(v,px*ca+py*sa)),qx=x0+ca*u-player.x,qy=y0+sa*u-player.y;if(Math.hypot(qx,qy)<B.w/2+6){c.hit=true;if(bpHit(m,'dash'))burst(player.x,player.y,12,'#e0b080',10,90,5);}}
  if(Math.random()<dt*25)burst(m.x,m.y,1,'#b89a70',3,30,2);
  if(c.rem<=.01||!mv){e.bcut=true;m.bp=null;m.atkT=Math.max(m.atkT,.6);}return true;}
const BEHAV={
  melee:{tick(m,dt,dp,moveTo){const reach2=(m.boss?18+12*m.sc:22)+4;
    if(m.wind>0){m.wind+=dt;if(m.wind>=.45){m.wind=0;if(dist(m,player)<reach2+8){hurtPlayer(calcDmg(m.atk,1,pStats().def,m.lv,S.lv),m,'melee');if(player.lastHit===t)mobFx(m,'melee');}}return;}
    if(dp>reach2){moveTo(player.x,player.y,m.boss?46:54);}else if(m.atkT<=0){m.wind=.001;m.atkT=m.boss?(m.rage?((bossPat(m)||{}).rageCd||BPAT.rage.cd):2.2):1.8;m.face=player.x<m.x?-1:1;}}},
  /* v4.49 원거리(G1-b): 조준(예고선) → 투사체. 가까이 오면 물러나지만 집에서 leash 밖으로는 안 간다(몰리면 그 자리에서 쏜다) */
  ranged:{tick(m,dt,dp,moveTo){const R=RANGED;
    if(m.aim&&dp<R.flee){/* v4.50 G1-b2: 조준 중에 플레이어가 flee 안으로 들어오면 쏘지 않고 조준을 거둔다(바로 앞에서 쏜 투사체는 반응할 틈이 없다 · 예고 → 반응 원칙) */const i=tele.indexOf(m.aim.e);if(i>=0)tele.splice(i,1);m.aim=null;STAT.aimCancel=(STAT.aimCancel||0)+1;}
    if(m.aim){m.aim.t+=dt;const e=m.aim.e;e.x=m.x;e.y=m.y;e.a=Math.atan2(player.y-m.y,player.x-m.x);e.len=Math.max(12,dp);m.face=player.x<m.x?-1:1;
      if(m.aim.t>=R.aim){m.aim=null;const i=tele.indexOf(e);if(i>=0)tele.splice(i,1);mobShoot(m,player.x,player.y);}return;}
    if(m.wind>0||dp<R.flee){if(m.wind<=0&&dist(m,m.home)<R.leash){moveTo(m.x+(m.x-player.x),m.y+(m.y-player.y),54*R.fleeK);return;}/* 몰리면 근접형처럼 할퀸다 */BEHAV.melee.tick(m,dt,dp,moveTo);return;}
    if(dp>R.range){moveTo(player.x,player.y,54);if(!m.stk||Math.hypot(m.x-m.stk.x,m.y-m.stk.y)>EVADE.prog)m.stk={x:m.x,y:m.y,t:0};else if((m.stk.t+=dt)>=EVADE.t){m.stk=null;STAT.evadeMob=(STAT.evadeMob||0)+1;mobEvade(m);}return;}/* v4.53 G1-b2c2: 사거리 밖에서 다가오다 지형에 막혀 EVADE.t초 동안 EVADE.prog도 못 움직이면 몬스터 쪽도 회피(집으로) — 막힌 채 어그로만 남아 자동 전투(범위 밖)와 서로 기다리던 판 */
    if(m.atkT<=0){m.atkT=R.cd;m.face=player.x<m.x?-1:1;m.aim={t:0,e:teleAdd({kind:'line',x:m.x,y:m.y,a:Math.atan2(player.y-m.y,player.x-m.x),len:Math.max(12,dp),w:4,dur:R.aim,aim:true,own:m})};}}},
  /* v4.54 돌진(G1-c): 예고(따라감 → 고정) → 직선 돌진 → 맞힘 ×1.6 / 빗나감 경직. 그 밖은 근접 */
  charge:{tick(m,dt,dp,moveTo){const C=CHARGE,ob=mobB(m)||{},LK0=ob.lock||C.lock,LK=m.chg?(m.chg.L!=null?m.chg.L:(m.chg.L=LK0+(ob.lj?Math.random()*ob.lj:0))):LK0/* v4.62 돌진도 lj: 고정 시간을 lock~lock+lj에서 돌진마다 무작위(자폭 v4.61과 같은 방식 · 걸음 경계 계단) */,SPD=ob.dspd||C.spd;/* v4.56 종마다 고정 시간(lock) · 돌진 속도(dspd) — 트인 사냥터에서 자동 전투가 늘 피하는 종을 피격률 20~40%에 맞춘다(원거리 MOB_B.spd와 같은 방식) */
    if(m.stag>t)return;/* 경직: 움직이지도 때리지도 않는다 */
    const c=m.chg;
    if(c){c.t+=dt;const e=c.e;
      if(c.ph==='aim'){m.face=player.x<m.x?-1:1;if(!c.lk&&c.t>=C.aim-LK&&fxOn('stun')){c.t=C.aim-LK-.001;e.t=c.t;STAT.chgHold=(STAT.chgHold||0)+1;}/* v4.62 G1-e1: 플레이어가 기절 중이면 방향을 고정하지 않고 계속 따라간다 — 기절이 풀린 뒤 고정 시간만큼 반응할 틈(예고 → 반응 원칙 · 무리 돌진이 기절에 이어 맞던 것: 초원황소 Lv9 피격률 0.46~0.60) */
        if(c.t<C.aim-LK){e.x=m.x;e.y=m.y;e.a=Math.atan2(player.y-m.y,player.x-m.x);e.len=Math.min(C.dist,dp+C.over);}
        else if(!c.lk){c.lk=true;e.aim=false;e.t=0;e.dur=LK;e.keep=true;e.x=m.x;e.y=m.y;e.a=Math.atan2(player.y-m.y,player.x-m.x);e.len=Math.min(C.dist,dp+C.over);c.a=e.a;c.rem=e.len;{const ca=Math.cos(c.a),sa=Math.sin(c.a);while(c.rem>20&&Math.hypot(m.x+ca*c.rem-m.home.x,m.y+sa*c.rem-m.home.y)>C.leash){c.rem-=5;}if(c.rem<e.len)STAT.chgClamp=(STAT.chgClamp||0)+1;e.len=c.rem;}}/* v4.57: 돌진 끝이 집에서 C.leash 밖이면 그만큼 짧게 — 지나쳐 달린 돌진이 추격 한계(210)를 넘겨 몬스터가 체력 가득으로 집에 돌아가던 것(불새 둥지 측정에서 찾음) *//* 고정: 새 예고처럼 t=0 — 자동 전투는 여기서 0.3초 뒤 반응 */
        if(c.t>=C.aim){c.ph='dash';STAT.chgN=(STAT.chgN||0)+1;}return;}
      /* dash */const x0=m.x,y0=m.y,ca=Math.cos(c.a),sa=Math.sin(c.a),v=Math.min(c.rem,SPD*dt),mv=stepMove(m,ca,sa,v/dt,dt);c.rem-=v;m.moving=true;m.face=ca<0?-1:1;e.x=m.x;e.y=m.y;e.len=Math.max(0,c.rem);
      if(!c.hit&&!player.dead){const px=player.x-x0,py=player.y-y0,u=Math.max(0,Math.min(v,px*ca+py*sa)),qx=x0+ca*u-player.x,qy=y0+sa*u-player.y;
        if(Math.hypot(qx,qy)<C.w/2+6){c.hit=true;hurtPlayer(calcDmg(m.atk,1,pStats().def,m.lv,S.lv)*C.mul*(m.inv&&BOSS_GEN.chgK||1),m);if(player.lastHit===t){STAT.chgHit=(STAT.chgHit||0)+1;mobFx(m,'charge');burst(player.x,player.y,10,'#e0b080',10,80,4);}else c.hit=false;}}
      if(Math.random()<dt*20)burst(m.x,m.y,1,'#b89a70',3,30,2);
      if(c.rem<=.01||!mv){const i=tele.indexOf(e);if(i>=0)tele.splice(i,1);m.chg=null;
        if(!c.hit){m.stag=t+C.stag;STAT.chgMiss=(STAT.chgMiss||0)+1;floatTxt(m.x,m.y,'휘청','#ffd070');}else m.atkT=Math.max(m.atkT,CHARGE.rest);}/* 맞힌 뒤 숨 고르기 — 돌진이 거리를 단숨에 좁혀 짧은 싸움에서 근접형보다 먼저 때리기 시작하던 몫을 덜어 낸다 */
      return;}
    const ready=!(m.chgCd>t)&&m.wind<=0;
    if(ready&&dp>=C.min&&dp<=C.max){m.chgCd=t+C.cd;m.backT=0;m.chg={ph:'aim',t:0,e:teleAdd({kind:'line',x:m.x,y:m.y,a:Math.atan2(player.y-m.y,player.x-m.x),len:Math.min(C.dist,dp+C.over),w:C.w,dur:C.aim,aim:true,ownC:m})};m.chg.e.chg=true;return;}
    if(ready&&dp<C.min){m.backT=(m.backT||0)+dt;if(m.backT<C.back){moveTo(m.x+(m.x-player.x),m.y+(m.y-player.y),54*(m.inv||m.riftBoss?BOSS_GEN.bk:1));return;}/* v4.71 침공 · 균열의 주인은 빠르게 물러난다(혼자 싸우는 보스는 54로는 거리를 못 벌려 돌진을 한 번도 안 함) */m.backT=0;m.chgCd=t+3;}/* 뒷걸음질로 거리를 벌린다 — 못 벌리면 근접 · 3초 뒤 다시 */
    BEHAV.melee.tick(m,dt,dp,moveTo);}},
  /* v4.58 방어 태세(G1-d): 싸움이 붙고 GUARD.first초 뒤부터 GUARD.cd초마다 GUARD.dur초 웅크림(공격 · 이동 안 함 · 받는 피해는 playerHit에서 평타 ×0.3 · 스킬 ×0.7). 휘두르던 공격(wind)은 끝낸 뒤 웅크린다 */
  guard:{tick(m,dt,dp,moveTo){const G=GUARD;if(!m.gdN)m.gdN=t+((mobB(m)||{}).first||G.first);/* v4.60 종별 첫 웅크림 MOB_B[종].first */
    if(m.gdU>t)return;/* 웅크림 */
    if(t>=m.gdN&&m.wind<=0){m.gdU=t+G.dur;m.gdN=t+G.cd;STAT.guardN=(STAT.guardN||0)+1;return;}
    BEHAV.melee.tick(m,dt,dp,moveTo);}},
  /* v4.59 자폭(G1-d2): 체력 BURST.at 이하에서 부풀기 inf초(원형 예고 r) — 앞 (inf−lock)초는 플레이어 쪽으로 기어가고(예고가 따라감 · 자동 회피 대상 아님) 마지막 lock초는 멈춰 고정(새 예고 t=0) →
     폭발: r 안이면 ×mul(방어 뒤) · 스스로 쓰러짐(killMob — 경험치 · 드롭 정상). 부풀기 중 처치하면 폭발 없음(killMob → 예고 정리). 그 밖에는 근접형 그대로 */
  burst:{tick(m,dt,dp,moveTo){const B=BURST,ob=mobB(m)||{},INF=ob.inf||B.inf,R=ob.r||B.r;
    const c=m.bst,LK=c&&c.L||ob.lock||B.lock;/* v4.61 lj: 부풀기마다 고정 시간 lock~lock+lj 무작위(종마다 · 경계가 날카로운 사냥터용) */
    if(!c){if(m.hp>0&&m.hp<=m.max*B.at&&m.wind<=0){m.bst={t:0,L:(ob.lock||B.lock)+(ob.lj?Math.random()*ob.lj:0),e:teleAdd({kind:'circle',x:m.x,y:m.y,r:R,dur:INF,aim:true,keep:true,ownB:m})};STAT.bstN=(STAT.bstN||0)+1;floatTxt(m.x,m.y-6,'부풀어 오른다!','#ff9a5a');return;}
      BEHAV.melee.tick(m,dt,dp,moveTo);return;}
    c.t+=dt;const e=c.e;m.face=player.x<m.x?-1:1;
    if(c.t<INF-LK){if(dp>14)moveTo(player.x,player.y,B.creep);e.x=m.x;e.y=m.y;e.t=c.t;return;}
    if(!c.lk){c.lk=true;e.aim=false;e.t=0;e.dur=LK;e.x=m.x;e.y=m.y;}/* 고정: 자동 전투는 여기서 0.3초 뒤 반응 */
    if(c.t>=INF){const i=tele.indexOf(e);if(i>=0)tele.splice(i,1);m.bst=null;STAT.bstBoom=(STAT.bstBoom||0)+1;
      if(!player.dead&&Math.hypot(player.x-m.x,player.y-m.y)<R+6){const h0=player.hp;hurtPlayer(calcDmg(m.atk,1,pStats().def,m.lv,S.lv)*(ob.mul||B.mul),m,'zone');if(player.lastHit===t){STAT.bstHit=(STAT.bstHit||0)+1;STAT.bstDmg=(STAT.bstDmg||0)+Math.max(0,h0-player.hp);mobFx(m,'burst');}}
      burst(m.x,m.y,6,(SPECIES[m.sp].c||[])[0]||'#ff8a3a',30,140,6);floatTxt(m.x,m.y-10,'펑!','#ffb070',true);gfxKillD=true;killMob(m);gfxKillD=false;}}},
};
const guardOn=m=>!!(m&&m.gdU>t);/* v4.58 방어 태세 중인가 */
/* v4.49 투사체: 직선 이동 · 지나간 선분으로 맞음 판정(빠르게 지나쳐도 놓치지 않음) · 사거리 끝 · 플레이어와 760 넘게 멀어지면 사라짐(지형 · 나무는 넘어 날아간다 — 낮은 장애물에 막혀 사라지던 시험 결과).
   자동 전투 회피용으로 날아가는 길을 직선 예고(shot)로 dangerList에 넣는다 — 그리진 않는다(투사체 자체가 보임) */
function mobShoot(m,tx,ty){const R=RANGED,a=Math.atan2(ty-m.y,tx-m.x);if(shots.length>=16)shots.shift();
  shots.push({x:m.x,y:m.y,a,c:Math.cos(a),s:Math.sin(a),v:(mobB(m)||{}).spd||R.spd/* v4.52 종마다 투사체 속도(MOB_B.spd) — 없으면 RANGED.spd */,d:0,max:R.range*R.fly,r:R.pr,t:0,m,col:(SPECIES[m.sp].c||[])[1]||'#ffd0f0'});STAT.shotN=(STAT.shotN||0)+1;}
function shotTick(dt){const R=RANGED;for(let i=shots.length-1;i>=0;i--){const s=shots[i],x0=s.x,y0=s.y,v=(s.v||R.spd)*dt;s.x+=s.c*v;s.y+=s.s*v;s.d+=v;s.t+=dt;
  let hit=false;if(!player.dead){const px=player.x-x0,py=player.y-y0,u=Math.max(0,Math.min(v,px*s.c+py*s.s)),qx=x0+s.c*u-player.x,qy=y0+s.s*u-player.y;hit=Math.hypot(qx,qy)<s.r+6;}
  if(hit&&s.bk&&s.bv.hit){shots.splice(i,1);continue;}/* 한 번의 3갈래는 한 발만 맞는다(보스 곁에선 세 줄이 겹친다) */
  if(hit&&s.bk){shots.splice(i,1);hurtPlayer(calcDmg(s.m.atk,BPAT[s.bk].mul,pStats().def,s.m.lv,S.lv),s.m,'shot');if(player.lastHit===t){if(!s.bv.hit){s.bv.hit=1;bpStat(s.bk,true);}const P=bossPat(s.m),fx=P&&P.fx&&P.fx[s.bk];if(fx)addFx(fx,s.m);}burst(player.x,player.y,12,s.col,8,60,3);continue;}/* v4.69 보스 3갈래 — 배율은 보스 패턴처럼 방어 앞 */
  if(hit){shots.splice(i,1);STAT.shotHit=(STAT.shotHit||0)+1;const hp0=player.hp;hurtPlayer(calcDmg(s.m.atk,1,pStats().def,s.m.lv,S.lv)*R.mul,s.m,'shot')/* v4.52 G1-b2c: 배율을 방어 뒤에 곱한다 — 방어 앞에 곱하면 레벨대마다 방어 비중이 달라 서 있기 비율이 0.78~0.93으로 갈렸다 */;if(player.lastHit===t)mobFx(s.m,'shot');burst(player.x,player.y,12,s.col,8,60,3);continue;}
  if(s.d>=s.max||Math.hypot(s.x-player.x,s.y-player.y)>760){shots.splice(i,1);burst(s.x,s.y,6,s.col,4,40,2);}}}
/* ================= v4.47 상태이상 (플레이어가 걸림 · player.fx) ================= */
function fxDur(k){const F=gearFx();let r=1;for(const id in F){const K=F[id].fxK;if(K&&K[k]!=null)r*=K[k];}return FXDEF[k].dur*r;}/* v4.73 장비(§G3) 반영 · /* 저항(§G2) · 장비(§G3) · 정화(§G12)가 붙을 자리 */
function fxP(m){return m.boss||m.eliteOf?FX_P.elite:(m.lv<=6||m.lv>=9&&m.lv<=11)?FX_P.early:FX_P.base;}
function mobFx(m,by){const b=mobB(m);if(!b||!b.fx||player.dead||!FXDEF[b.fx])return false;if(b.fxBy&&by&&b.fxBy!==by)return false;const D=FXDEF[b.fx];/* v4.62 fxBy: 그 공격으로만 · D.p: 확률 덮어쓰기(기절 100%) · D.imm: 같은 개체 면역 */
  if(D.imm&&m.fxImm>t)return false;const p=D.p!=null?D.p:fxP(m);if(p<1&&Math.random()>=p)return false;if(D.imm)m.fxImm=t+D.imm;return addFx(b.fx,m);}
const fxOn=k=>!!(player.fx[k]&&player.fx[k].until>t);
function addFx(k,src){if(player.dead||!FXDEF[k])return false;if(cureImm(k)){STAT.cureBlk=(STAT.cureBlk||0)+1;return false;}/* v4.67 정화 물약 면역 */const D=FXDEF[k],f=player.fx[k],on=f&&f.until>t;
  player.fx[k]={until:t+fxDur(k),dur:fxDur(k),src:src&&src.name||D.name,atk:src&&src.atk||0,tk:on?f.tk:t+1};/* 갱신 · 중첩 없음(초당 틱 박자는 유지) */
  if(k==='stun')stunHold();
  if(!on){floatTxt(player.x,player.y-6,D.name+'!',D.col);STAT.fxN=(STAT.fxN||0)+1;}return true;}
/* v4.62 G1-e1: 기절이 걸리는 순간 다른 몬스터가 이미 고정한 돌진 예고(아직 달리기 전)를 '따라가기'로 되돌린다 — 기절 동안 고정하지 않고(charge tick) 풀린 뒤 고정 시간만큼 반응할 틈을 준다(예고 → 반응 원칙) */
function stunHold(){for(const m of mobs){const c=m.chg;if(!c||c.ph!=='aim'||!c.lk)continue;const LK=c.L!=null?c.L:(mobB(m)||{}).lock||CHARGE.lock;c.lk=false;c.t=CHARGE.aim-LK-.001;const e=c.e;e.aim=true;e.keep=false;e.dur=CHARGE.aim;e.t=c.t;STAT.chgHold=(STAT.chgHold||0)+1;}}
function clearStatus(){for(const k in player.fx)delete player.fx[k];}
/* v4.67 G12-b 정화 물약 — 독 · 화상 · 둔화를 풀고 CURE_K.imm초 면역(기절 제외) · 면역은 게임 시간 · 저장하지 않음(10초) */
const cureImm=k=>CURE_K.fx.includes(k)&&(player.cureU||0)>t;
const cureNeed=()=>CURE_K.fx.some(k=>fxOn(k));
function useCure(silent){if(player.dead)return false;if(!cnt('cure')){if(!silent)toast('정화 물약이 없다');return false;}const had=CURE_K.fx.filter(k=>fxOn(k));setCnt('cure',cnt('cure')-1);for(const k of had)delete player.fx[k];player.cureU=t+CURE_K.imm;STAT.cureUse=(STAT.cureUse||0)+1;STAT.cureFx=(STAT.cureFx||0)+had.length;
  burst(player.x,player.y,12,STK.cure.col,10,30,3);if(!silent)toast('정화 물약 · '+(had.length?had.map(k=>FXDEF[k].name).join(' · ')+' 해제 · ':'')+CURE_K.imm+'초 면역 · 남은 '+cnt('cure')+'개',true);save();return true;}
function buyCure(n){const pr=curePrice();n=Math.max(0,Math.min(n,CURE_K.cap-cnt('cure'),Math.floor(S.gold/pr),Math.floor((weightMax()-weightNow())/STK.cure.w)));if(!n)return 0;setCnt('cure',cnt('cure')+n);S.gold-=n*pr;STAT.buyG+=n*pr;STAT.cureBuy=(STAT.cureBuy||0)+n;STAT.bufG=(STAT.bufG||0)+n*pr;return n;}
/* 자동 사용(설정 · 기본 끔): 풀 수 있는 상태이상이 1초 넘게 남았으면 마신다 */
function cureTick(){if(!S||!S.cfg.autoCure||player.dead||!cnt('cure'))return;const k=CURE_K.fx.find(k=>fxOn(k)&&player.fx[k].until-t>=1);if(!k)return;const nm=FXDEF[k].name;if(useCure(true))toast('정화 자동 사용 · '+nm+' 해제 · 남은 '+cnt('cure')+'개',true);}
function tickStatus(dt){if(player.dead){clearStatus();return;}for(const k in player.fx){const f=player.fx[k],D=FXDEF[k];
  while(f.tk<=Math.min(t,f.until)+1e-6&&!player.dead){f.tk+=1;if(D.dps||D.k){const v=D.dps?pStats().hp*D.dps:Math.max(1,f.atk*D.k);/* v4.62 화상: 건 몬스터 공격력 × k · 방어 무시 */player.hp-=v;STAT.fxDmg=(STAT.fxDmg||0)+v;player.lastFx=t;floatTxt(player.x,player.y,'-'+Math.max(1,Math.round(v)),D.col);if(player.hp<=0){if(gfxSave())continue;player.hp=0;delete player.fx[k];die({name:f.src});return;}}}
  if(f.until<=t)delete player.fx[k];}}
/* v4.64 G1-e3 타깃 창 — 원형 · 상태이상 아이콘 칩 + 대응법 한 줄(mobs.js BDEF · FXDEF · FXBY). 근접형 · 상태이상 없음 · 보스(mobB=null)는 줄을 숨긴다 */
/* v4.68 G1-f 보스 패턴도 같은 칩으로: ♛ 패턴 이름들 · 지금 하는 패턴 강조 · 상태이상 칩(명중 100%) · 대응법은 패턴마다 짧게 */
const BHOW={aoe:'원 밖으로',ember:'원 밖으로 — 터진 자리에 불이 '+BPAT.fire.life+'초 남음',fan:'앞 부채꼴에서 옆 · 뒤로',dash:'띠가 밝아지면 옆으로',tri:'멈추지 말고 계속 움직이기',volley:'세 줄이 밝아지면 줄 사이 · 옆으로',summon:'체력 '+Math.round(BPAT.summon.at*100)+'%에 졸개 '+BPAT.summon.n+'마리 — 보스가 쓰러지면 사라짐',guard:'방패가 뜨면 큰 스킬을 아끼기',rage:'체력 '+Math.round(BPAT.rage.at*100)+'% 이하 공격 주기 2.2 → '+BPAT.rage.cd+'초'};
const bpName=(P,k)=>P&&P.nm&&P.nm[k]||BPAT[k].name;/* v4.70 보스별 이름(홍염 돌진 = 급강하) */
function bossInfo(m){const P=bossPat(m);if(!P)return null;const ks=P.p.concat(P.rage?['rage']:[],P.sum?['summon']:[]),B={name:ks.map(k=>bpName(P,k)).join(' · '),ic:'♛',col:'#ffb0ff'};
  const fk=P.fx?Object.keys(P.fx)[0]:null,F=fk?FXDEF[P.fx[fk]]:null,fxTxt=F?bpName(P,fk)+' 명중 100% → '+F.name+' '+F.dur+'초':'';
  B.how=ks.map(k=>bpName(P,k)+' — '+BHOW[k]).join(' · ');return {b:'boss',B,fx:fk?P.fx[fk]:null,F,fxTxt,line:B.how,tip:'보스 패턴: '+B.how+(F?'\n'+F.name+': '+fxTxt+' · '+F.desc:'')};}
function mobInfo(m){const I=mobInfo0(m),P=bossPat(m);if(!P||!P.gen||!I||I.b==='boss')return I;/* v4.71 침공 · 균열의 주인: 원형 칩에 ♛ 장판을 붙인다 */
  const h=bpName(P,'aoe')+' — '+BHOW.aoe,B=I.B?Object.assign({},I.B,{name:I.B.name+' · ♛'+bpName(P,'aoe')}):{name:bpName(P,'aoe'),ic:'♛',col:'#ffb0ff'};return Object.assign({},I,{B,b:I.B?I.b:'boss',line:(I.B?I.line+' · ':'')+h,tip:I.tip+'\n보스 패턴: '+h});}
function mobInfo0(m){const b=m&&mobB(m);if(!b)return bossInfo(m);const B=b.b&&b.b!=='melee'?BDEF[b.b]:null,F=b.fx&&FXDEF[b.fx]||null;if(!B&&!F)return null;
  let fxTxt='';if(F){const P=F.p!=null?F.p:fxP(m);fxTxt=(FXBY[b.fxBy]||(B?'공격':'근접'))+' '+Math.round(P*100)+'% → '+F.name+' '+F.dur+'초';}
  const line=B?B.how:F.name+' — '+F.desc;return {b:b.b,B,fx:b.fx,F,fxTxt,line,tip:(B?B.name+': '+B.desc+' · 대응: '+B.how:'')+(F?(B?'\n':'')+F.name+': '+fxTxt+' · '+F.desc:'')};}
/* 지금 그 개체가 하는 일 — 칩 옆에 밝힌다 */
function mobState(m){if(!m)return '';if(bossPat(m)&&bossPat(m).gen&&m.bp)return bpName(bossPat(m),m.bp.k);if(bossPat(m)&&!bossPat(m).gen){const c=m.bp;if(c&&c.k==='guard')return c.on?'웅크림':'웅크리기 직전';if(c)return bpName(bossPat(m),c.k)+(c.k==='dash'&&c.ph==='aim'||c.k==='fan'||c.k==='volley'&&!c.lk?' 예고':'');return m.rage?'광폭':'';}if(m.gdU>t)return '웅크림';if(m.bst)return '부풀기';if(m.stag>t)return '휘청';if(m.chg)return '돌진 예고';if(m.aim)return '조준';if(mobBeh(m)==='guard'&&m.aggro&&m.gdN>t&&m.gdN-t<=GUARD.pre)return '웅크리기 직전';return '';}
let tgtIK='';function tgtInfo(m){const e=$('tgtI');if(!e)return;/* v4.79 보스(지역 보스·침공·균열의 주인)는 패턴을 미리 알려주지 않는다 — 직접 겪으며 익힌다 */const I=m&&bossPat(m)?null:mobInfo(m),stt=I?mobState(m):'',key=I?(m.id||m.sp)+'|'+m.lv+'|'+stt:'';if(key===tgtIK)return;tgtIK=key;
  if(!I){e.hidden=true;e.replaceChildren();e.title='';return;}e.hidden=false;const row=el('div','tic');
  if(I.B){const c=el('span','tch b'+(stt?' on':''),I.B.ic+' '+I.B.name+(stt?' · '+stt:''));c.style.setProperty('--c',I.B.col);c.dataset.b=I.b;row.appendChild(c);}
  if(I.F){const c=el('span','tch f',I.F.ic+' '+I.fxTxt);c.style.setProperty('--c',I.F.col);c.dataset.fx=I.fx;row.appendChild(c);}
  const d=el('div','tdsc',I.line);e.title=I.tip;e.replaceChildren(row,d);}
let fxHudK='';function fxHud(){const e=$('fxRow');if(!e)return;let h='',key='';if(S&&S.buf)for(const k of BUF_IDS){const r=S.buf[k];if(!(r>0))continue;const rs=r>=60?Math.ceil(r/60)+'분':Math.ceil(r)+'';key+=k+rs;h+='<i class="fxi bf" style="--c:'+STK[k].col+'" data-buf="'+k+'" title="'+STK[k].n+' · '+BUFP[k].txt+' · 남은 '+mmss(Math.ceil(r))+'">'+BUFP[k].ic+'<b>'+rs+'</b></i>';}/* v4.66 버프 물약(파란 테두리) */if((player.cureU||0)>t){const r=Math.ceil(player.cureU-t);key+='cure'+r;h+='<i class="fxi bf" style="--c:'+STK.cure.col+'" data-buf="cure" title="정화 · 독 · 화상 · 둔화 면역 · 남은 '+r+'초">✚<b>'+r+'</b></i>';}/* v4.67 정화 면역 */for(const k in player.fx){const f=player.fx[k],D=FXDEF[k],rem=Math.max(0,Math.ceil(f.until-t));if(f.until<=t)continue;key+=k+rem;h+='<i class="fxi" style="--c:'+D.col+'" title="'+D.name+' · '+D.desc+'">'+D.ic+'<b>'+rem+'</b></i>';}
  if(key!==fxHudK){fxHudK=key;e.innerHTML=h;e.hidden=!h;}}
/* 그 점이 어떤 예고 안인가 — 원형(보스 장판 m.aoe 포함) · 직선 · 부채꼴. auto=true면 자동 전투의 반응(새 예고는 0.3초 뒤 · 스킬 동작 중엔 못 움직임)을 적용.
   돌려주는 a = 가장 가까운 바깥쪽 방향(라디안) */
const tele=[];
function teleAdd(o){const e=Object.assign({t:0,dur:1,r:40,a:0,len:120,w:22,half:Math.PI/3},o);tele.push(e);return e;}
function dangerList(){const L=[];for(const m of mobs)if(m.aoe&&!m.dead)L.push({kind:'circle',x:m.aoe.x,y:m.aoe.y,r:m.aoe.r,t:m.aoe.t,dur:1.4,old:true,m});for(const e of tele)L.push(e);for(const s of shots)L.push({kind:'line',x:s.x,y:s.y,a:s.a,len:Math.max(0,s.max-s.d),w:s.r*2,t:s.t,dur:1,shot:true});return L;}
function inDanger(e,x,y,pad){const dx=x-e.x,dy=y-e.y;
  if(e.kind==='circle'){const d=Math.hypot(dx,dy);return d<e.r+pad?{a:d>.01?Math.atan2(dy,dx):Math.random()*6,cost:e.r+pad-d}:null;}/* 한가운데면 아무 쪽(옛 코드의 `atan2||random`은 정확히 오른쪽(0)일 때도 무작위였다) */
  if(e.kind==='line'){const c=Math.cos(e.a),s=Math.sin(e.a),u=dx*c+dy*s,v=-dx*s+dy*c;if(u<-pad||u>e.len+pad||Math.abs(v)>=e.w/2+pad)return null;const sg=v>=0?1:-1;return {a:e.a+sg*Math.PI/2,cost:e.w/2+pad-Math.abs(v)};}
  if(e.kind==='fan'){const d=Math.hypot(dx,dy);if(d>=e.r+pad)return null;let da=Math.atan2(dy,dx)-e.a;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>e.half&&d>pad)return null;
    const out=e.r+pad-d,side=d*Math.sin(Math.max(0,e.half-Math.abs(da)))+pad,ang=Math.atan2(dy,dx);return out<=side?{a:ang,cost:out}:{a:ang+(da>=0?1:-1)*Math.PI/2,cost:side};}
  return null;}
function dangerAt(x,y,pad,auto){pad=pad||0;let best=null;for(const e of dangerList()){if(e.aim)continue;if(auto&&!e.old&&(e.t<.3||player.spin>0))continue;const r=inDanger(e,x,y,pad);if(r&&(!best||r.cost<best.cost))best=Object.assign(r,{e});}return best;}
function teleTick(dt){for(let i=tele.length-1;i>=0;i--){const e=tele[i];if(e.own&&(e.own.dead||!e.own.aim||e.own.aim.e!==e)||e.ownC&&(e.ownC.dead||!e.ownC.chg||e.ownC.chg.e!==e)||e.ownB&&(e.ownB.dead||!e.ownB.bst||e.ownB.bst.e!==e)||e.ownP&&(e.ownP.dead||e.ownP.ret||!e.ownP.aggro||e.bcut)){tele.splice(i,1);continue;}e.t+=dt;if(e.tick)e.tick(e,dt);if(e.t>=e.dur&&!e.keep){tele.splice(i,1);if(e.hit)e.hit(e);}}}
function teleDraw(){const L=dangerList().filter(e=>!e.shot&&Math.hypot(e.x-player.x,e.y-player.y)<420).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y)),used={circle:0,line:0,fan:0};
  for(const e of L){const P=TELE_POOL[e.kind];if(!P||used[e.kind]>=P.length)continue;const q=P[used[e.kind]++],k=e.lin?1:Math.min(1,e.t/e.dur),h=elevAt(e.x,e.y);q.o.visible=q.f.visible=true;
    if(e.kind==='circle'){q.o.rotation.y=q.f.rotation.y=0;q.o.scale.set(e.r*2,1,e.r*2);q.o.position.set(e.x,h+1,e.y);q.f.scale.set(e.r*2*k,1,e.r*2*k);q.f.position.set(e.x,h+1.1,e.y);}
    else if(e.kind==='line'){const c=Math.cos(e.a),s=Math.sin(e.a);q.o.rotation.y=q.f.rotation.y=-e.a;q.o.scale.set(e.len,1,e.w*64/48);q.o.position.set(e.x+c*e.len/2,h+1,e.y+s*e.len/2);q.f.scale.set(e.len*k,1,e.w*64/48);q.f.position.set(e.x+c*e.len*k/2,h+1.1,e.y+s*e.len*k/2);}
    else{q.o.rotation.y=q.f.rotation.y=-e.a;q.o.scale.set(e.r*2*64/58,1,e.r*2*64/58);q.o.position.set(e.x,h+1,e.y);q.f.scale.set(e.r*2*64/58*k,1,e.r*2*64/58*k);q.f.position.set(e.x,h+1.1,e.y);}
    q.f.material.opacity=e.lin?.4+.15*Math.sin(t*9):.35+.3*k;}/* v4.70 남는 불은 가득 찬 채 일렁임 */
  for(const k in TELE_POOL)for(let i=used[k];i<TELE_POOL[k].length;i++){const q=TELE_POOL[k][i];q.o.visible=q.f.visible=false;}}
function updateMobs(dt){const village=ZONES.village.r;for(const m of mobs)if(m.gburn&&!m.dead)gburnTick(m);/* v4.73 G3 군주의 용암 장갑 화상 */
  for(let i=mobs.length-1;i>=0;i--){const e=mobs[i];if(e.gone&&e.dead&&e.deadT>1.2){if(e.mesh&&e.mesh.parent)e.mesh.parent.remove(e.mesh);mobs.splice(i,1);}}/* v4.69 사라진 졸개를 목록에서 뺀다 */
  for(const m of mobs){if(m.dead){m.deadT+=dt;if(m.deadT>m.respawn){m.dead=false;m.gburn=null;m.hp=m.max;m.rage=false;m.bp=null;m.sumD=false;m.x=m.home.x;m.y=m.home.y;m.aggro=false;m.ret=false;m.chg=null;m.stag=0;m.gdU=0;m.gdN=0;m.bst=null;m.mesh.visible=true;}continue;}
    const dp=dist(m,player);if(dp>760&&!m.aggro)continue;m.hit=Math.max(0,m.hit-dt);m.phase+=dt;
    const dh=dist(m,m.home),moveTo=(x,y,spd)=>{const dx=x-m.x,dy=y-m.y;if(Math.abs(dx)>1)m.face=dx<0?-1:1;if(!stepMove(m,dx,dy,spd,dt)){m.blockT=(m.blockT||0)+dt;if(m.blockT>.8){const a=Math.random()*6.28;stepMove(m,Math.cos(a),Math.sin(a),spd*2,dt);m.blockT=0;}}m.moving=true;};
    m.moving=false;
    if(m.ret){if(dh<6){m.ret=false;m.hp=m.max;m.rage=false;if(m.evd){m.evd=false;m.evL=t+EVADE.lock;}}else moveTo(m.home.x,m.home.y,70);continue;}
    if(m.aggro&&(dh>(m.boss?240:210)||player.dead||inR(village,player.x,player.y,10))){m.aggro=false;m.ret=true;m.wind=0;m.aoe=null;m.bp=null;if(m.boss)bpDismiss(m);if(m.inv||m.riftBoss){m.spE=t;m.bpE=t;}/* v4.71 어그로가 풀리며 끊긴 특수 공격 · 장판도 '끝난 시각'으로 센다(다시 붙으면 2.5초 뒤) */m.aim=null;m.chg=null;m.stag=0;m.gdU=0;m.gdN=0;m.bst=null;continue;}
    if(!m.aggro&&!m.inv&&!(m.evL>t)&&(aggroOn(m)||m.boss&&!m.field)&&dp<(m.boss?110:70)&&!player.dead&&t>=graceT&&!inR(village,player.x,player.y,10)){m.aggro=true;if(dp<200)floatTxt(m.x,m.y,'!','#ff8a6a');}
    if(m.aggro){m.atkT-=dt;
      const BP=bossPat(m);if(BP){if(bossTick(m,dt,dp))continue;}
      else if(m.boss){m.aoeT-=dt;if(m.aoe){m.aoe.t+=dt;if(m.aoe.t>=1.4){const ao=m.aoe;m.aoe=null;if(Math.hypot(player.x-ao.x,player.y-ao.y)<ao.r)hurtPlayer(calcDmg(m.atk,2.2,pStats().def,m.lv,S.lv),m,'zone');burst(ao.x,ao.y,4,'#ff8040',40,140,6);}}
        else if(m.aoeT<=0&&dp<200){m.aoe={x:player.x,y:player.y,r:58,t:0};m.aoeT=7;}}
      if(BP&&BP.gen&&(m.bp||t-(m.bpE||-99)<BPAT.gap)){if(mobBeh(m)==='guard'&&m.gdN){const end=m.bp?t+Math.max(0,BPAT.aoe.dur-m.bp.t):m.bpE;m.gdN=Math.max(m.gdN,end+BPAT.gap+GUARD.pre+.05);}/* 웅크림(깜빡임 포함)도 장판 끝 + 2.5초 뒤로 */BEHAV.melee.tick(m,dt,dp,moveTo);continue;}/* v4.71 장판 중 · 끝난 뒤 2.5초는 원형 특수 공격 없이 근접만 */
      (BEHAV[mobBeh(m)]||BEHAV.melee).tick(m,dt,dp,moveTo);
      continue;}
    m.next-=dt;if(m.mv){moveTo(m.mv.x,m.mv.y,22);if(Math.hypot(m.mv.x-m.x,m.mv.y-m.y)<3||m.next<-3)m.mv=null;}
    else if(m.next<=0){m.next=rand(2,5);if(Math.random()<.6){const a=Math.random()*6.283,r=rand(10,34);const x=m.home.x+Math.cos(a)*r,y=m.home.y+Math.sin(a)*r;if(!blockedAt(x,y)&&!inR(village,x,y,20))m.mv={x,y};}}}}
const aoeMob=()=>{let best=null,bd=420;for(const m of mobs)if(m.aoe&&!m.dead){const d=dist(m,player);if(d<bd){bd=d;best=m;}}return best;};
function update(dt){zoom+=(zoomT-zoom)*Math.min(1,dt*12);if(Math.abs(zoomT-zoom)<.002)zoom=zoomT;/* v4.13: 창을 열어도 게임은 계속 흐른다 */t+=dt;for(let i=timers.length-1;i>=0;i--)if(t>=timers[i].at){const f=timers[i].f;timers.splice(i,1);f();}if(traveling)return;updatePlayer(dt);graveTick();updateMobs(dt);teleTick(dt);shotTick(dt);tickStatus(dt);bufTick(dt);cureTick();
  for(const n of npcList)if(n.deco){n.next-=dt;if(n.mv){const dx=n.mv.x-n.x,dy=n.mv.y-n.y,d=Math.hypot(dx,dy);if(d<2){n.mv=null;n.walk=0;}else{n.x+=dx/d*24*dt;n.y+=dy/d*24*dt;n.walk+=dt;n.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');}}
    else if(n.next<=0){n.next=rand(3,7);const x=n.hx+rand(-30,30),y=n.hy+rand(-16,16);if(!blockedAt(x,y))n.mv={x,y};}}
  for(const b of bolts)b.life+=dt;bolts=bolts.filter(b=>b.life<(b.max||.22));for(const f of floats)f.life+=dt;floats=floats.filter(f=>f.life<1.1);tickParts(dt);tickFx(dt);
  let z='field';for(const k in ZONES)if(inR(ZONES[k].r,player.x,player.y)){z=k;break;}if(HUNT.includes(z)&&!M.inst)S.aiZone=z;invTick(dt);riftTick(dt);riftFx(dt);xqTick(dt);aqWatch(dt);
  if(z!==curZone){const first=curZone==='';curZone=z;if(z!=='field'){const Z=ZONES[z],fa=ZFAITH[z]||0;banner(Z.name,Z.lv?M.name+' · Lv '+Z.lv+(fa?' · 권장 신앙 '+fa:''):M.name+' · 안전 지역');if(fa&&pStats(null,true).faith<fa)later(1.2,()=>toast('신앙 '+pStats(null,true).faith+' / '+fa+' · 이 지역에선 주는 피해가 줄고 받는 피해가 늘어난다 — 제작·강화·컬렉션으로 신앙을 올리자'));}}
  for(const h of HOUSES)if(h.smoke&&Math.random()<dt*3)spawnP(h.smoke.x+rand(-2,2),h.smoke.y,h.smoke.z,{col:'#6a6070',vx:rand(-4,4),vy:-2,vz:14,life:1.6,size:3,size1:9});
  if(Math.random()<dt*1.2)for(const L of LAVA)if(Math.hypot(L.x-player.x,L.y-player.y)<500)spawnP(L.x+rand(-L.rx,L.rx)*.7,L.y+rand(-L.ry,L.ry)*.6,2,{col:'#ff8a3a',vz:rand(20,50),g:-10,life:1.2,size:3,size1:0});
  if(Math.random()<dt*2){const w=M.way;if(Math.hypot(w.x-player.x,w.y-player.y)<400)spawnP(w.x+rand(-8,8),w.y,rand(6,30),{col:'#c8a8ff',vz:rand(10,24),g:0,life:1.4,size:3,size1:0});}
  if(started&&Math.floor(t*2)!==Math.floor((t-dt)*2)){emergencyReturn();autoDisCheck();}
  if(started&&Math.floor(t/4)!==Math.floor((t-dt)/4)){save();ensureFieldBosses();growthTick();huntResupply();riftResupply();if(trainFor&&S.autoQ){const q=curQ();if(q.id!==trainFor||S.qs!=='active'||gateState(q).ok){trainFor=null;if(!modal&&!nav){hunt=null;autoNext();}}}}}

/* ================= 그리기 ================= */
const tmpV=new T3.Vector3();let cssW=1,cssH=1,pr=1;const WSPRC={};
function W2S(x,y,up){tmpV.set(x,elevAt(x,y)+up*VS,y).project(cam);return [(tmpV.x*.5+.5)*cssW,(-tmpV.y*.5+.5)*cssH,tmpV.z];}
function resize(){const r=stage.getBoundingClientRect();cssW=Math.max(1,r.width);cssH=Math.max(1,r.height);pr=Math.min(devicePixelRatio||1,1.75);
  rd.setPixelRatio(1);rd.setSize(Math.round(cssW*pr),Math.round(cssH*pr),false);rt.setSize(Math.round(cssW*pr),Math.round(cssH*pr));pmat.uniforms.uRes.value.set(cssW*pr,cssH*pr);
  ov.width=Math.round(cssW*pr);ov.height=Math.round(cssH*pr);cam.aspect=cssW/cssH;cam.updateProjectionMatrix();if(document.body.classList.contains('touch'))joyPos();}
addEventListener('resize',resize);
function snapCam(){camX=player.x;camY=player.y;camE=elevAt(player.x,player.y);}
function frameMeshes(){
  {const sw=player.swing;if(sw>0&&(!player._sw||sw<player._sw))player.atkA=player.spin>0||godOn('artemis')?null:t;player._sw=sw;}/* v4.80 공격 시트: 휘두르기가 시작된 때를 적어 둔다 */
  const walkF=player.moving?Math.floor(t*8)%4:Math.floor(t*1.6)%2,atkImg=!player.dead&&player.atkA!=null&&CHARATK.hero?charAtk('hero',player.dir,t-player.atkA):null,img=atkImg||getSprite('hero',player.dir,player.moving,walkF);
  {const ps=pScale();setSpr(pMesh,img,player.x,player.y,ps,(player.dash?2:0)+(1-ps)*14);}pMesh.visible=true;if(player.dead){const dk=Math.min(1,(t-(player.deadT||0))/.3);pMesh.visible=false;pX.visible=false;graveMesh.visible=true;setSpr(graveMesh,GRAVE,player.x,player.y,1.1,(1-dk)*26);}else{graveMesh.visible=false;pX.visible=false;}if(graveHere()&&!player.dead){graveMesh2.visible=true;setSpr(graveMesh2,GRAVE,S.grave.x,S.grave.y,1.1,Math.sin(t*2)*1.2);if(Math.random()<.04)spawnP(S.grave.x+rand(-6,6),S.grave.y,6,{col:'#d8b8ff',vz:24,g:-4,life:1.2,size:2.5,size1:0});}else graveMesh2.visible=false;pX.scale.copy(pMesh.scale);pX.position.copy(pMesh.position);
  if((player.swing>0||player.spin>0)&&!atkImg){const w=godOn('artemis')&&!(player.spin>0)?'bow':weapSpr(),wi=WSPRC[w]||(WSPRC[w]=mkWeapon(w));if(wMesh.userData.img!==wi){wMesh.material=matOf(wi);wMesh.customDepthMaterial=depthOf(wi);wMesh.userData.img=wi;}
    const k=player.spin>0?1-player.spin/.4:Math.min(1,player.swing/.2),f=player.face;wMesh.visible=true;wMesh.scale.set(wi.width*1.2*f,wi.height*1.2,1);
    const ang=player.spin>0?k*Math.PI*4:(1.1-k*2.2);wMesh.rotation.z=f>0?ang:-ang;wMesh.position.set(player.x+f*6,elevAt(player.x,player.y)+17*VS,player.y+1.5);}else wMesh.visible=false;
  for(const n of npcList){if(n.way)continue;const im=n.deco?getSprite(n.id,n.dir||'down',!!n.mv,n.mv?Math.floor(n.walk*7)%4:Math.floor(t*1.5+n.seed)%2):getSprite(n.id,'down',false,Math.floor(t*1.5+n.seed)%2);setSpr(n.m,im,n.x,n.y);}
  for(const m of mobs){if(m.dead){if(m.deadT<.5){const k=m.deadT/.5;m.mesh.visible=true;setSpr(m.mesh,m.face<0?MONWL[m.sp]:MONW[m.sp],m.x,m.y,m.sc*(1-k*.6),-k*6,m.rift);}else m.mesh.visible=false;continue;}
    if(Math.abs(m.x-player.x)>520||Math.abs(m.y-player.y)>420){m.mesh.visible=false;continue;}m.mesh.visible=true;
    const fr=m.moving||(m.aggro&&!monLegged(m.sp))?2+Math.floor(m.phase*7)%4:Math.floor(m.phase*(m.aggro?4:2.2))%2,im=m.hit>0?(m.face<0?MONWL[m.sp]:MONW[m.sp]):(m.face<0?MONSPRL[m.sp][fr]:MONSPR[m.sp][fr]);
    setSpr(m.mesh,im,m.x+(m.wind>0?-2:m.chg&&m.chg.ph==='aim'?Math.sin(m.phase*40)*1.2:0)*m.face,m.y,m.sc*(m.gdU>t?.9:m.bst?1+.35*Math.min(1,m.bst.t/((mobB(m)||{}).inf||BURST.inf))+.05*Math.sin(m.phase*30):1)/* v4.58 웅크림 · v4.59 부풀기 */,SPECIES[m.sp].form==='bird'||SPECIES[m.sp].form==='sprite'?4+Math.sin(m.phase*4)*2:0,m.rift);}
  if(player.shield>0&&!player.dead){shRing.visible=true;const k=1+Math.sin(t*4)*.05;shRing.scale.set(30*k,1,22*k);shRing.position.set(player.x,elevAt(player.x,player.y)+.9,player.y);shRing.material.opacity=.5+.3*Math.min(1,player.shield/(pStats().hp*.1));}else shRing.visible=false;
  if(t<player.buffT&&!player.dead){buffRing.visible=true;const k=(t*1.3)%1;buffRing.scale.set(20+k*16,1,(20+k*16)*.75);buffRing.position.set(player.x,elevAt(player.x,player.y)+1,player.y);buffRing.material.opacity=.8*(1-k);}else buffRing.visible=false;
  if(alive(target)){tgtRing.visible=true;const r=(16+monW(target.sp)*.5)*target.sc;tgtRing.scale.set(r,1,r*.75);tgtRing.position.set(target.x,elevAt(target.x,target.y)+.8,target.y);tgtRing.material.opacity=.6+.3*Math.sin(t*6);}else tgtRing.visible=false;
  if(moveRing.visible&&moveRing.userData.p){const p=moveRing.userData.p,k=(t*1.5)%1;moveRing.scale.set(10+k*14,1,(10+k*14)*.8);moveRing.position.set(p.x,elevAt(p.x,p.y)+.8,p.y);moveRing.material.opacity=1-k;if(!nav)moveRing.visible=false;}
  teleDraw();}
function render(){const r=stage.getBoundingClientRect();if(Math.abs(r.width-cssW)>1||Math.abs(r.height-cssH)>1)resize();if(!G0||!M.rt||!M.rt.built){rd.render(pscene,pcam);return;}
  camX+=(player.x-camX)*.14;camY+=(player.y-camY)*.14;camE+=(elevAt(player.x,player.y)-camE)*.1;
  const D=(VIEWH*.5)/Math.tan(FOV*Math.PI/360)/zoom,tz=camY+8;cam.position.set(camX,camE+D*Math.sin(PITCH),tz+D*Math.cos(PITCH));cam.lookAt(camX,camE,tz);
  scene.fog.near=D*1.02;scene.fog.far=D*2.5;sun.position.set(camX-260,camE+520,tz+300);sun.target.position.set(camX,camE,tz);sun.target.updateMatrixWorld();
  if(S)frameMeshes();else pMesh.visible=false;
  if(S)updateFade();
  rd.setRenderTarget(rt);rd.render(scene,cam);rd.setRenderTarget(null);
  const fp=tmpV.set(player.x,camE+14,player.y).project(cam);pmat.uniforms.uFocus.value=fp.y*.5+.5;
  const st=S?pStats():{hp:1};pmat.uniforms.uHurt.value=Math.min(1,player.hurt*2)*.5+(S&&player.hp<st.hp*.3&&!player.dead?.12+.08*Math.sin(t*5):0);
  rd.render(pscene,pcam);drawOverlay();}
/* 가림 페이드 대상: 플레이어 · 대상 · 싸우는/가까운 몬스터 (최대 8) */
function updateFade(){cam.updateMatrixWorld();const U=FADE.uFade.value,ps=cssH/VIEWH*zoom*pr,L=[];if(!player.dead)L.push([player,17,1]);
  if(alive(target))L.push([target,monH(target.sp)*target.sc*.5,target.sc]);
  const near=mobs.filter(m=>alive(m)&&m!==target&&(m.aggro||Math.abs(m.x-player.x)<220&&Math.abs(m.y-player.y)<170)).sort((a,b)=>dist(a,player)-dist(b,player));
  for(const m of near){if(L.length>=FADE_N)break;L.push([m,monH(m.sp)*m.sc*.5,m.sc]);}
  FADE.uFadeR.value.set(16*ps,22*ps);
  for(let i=0;i<FADE_N;i++){const e=L[i];if(!e){U[i].w=0;continue;}const [o,up,sc]=e,[x,y]=W2S(o.x,o.y,up);U[i].set(x*pr,(cssH-y)*pr,o.y,Math.max(1,.75+.35*sc));}}
function lvCol(L){const d=L-S.lv;return d<=-5?'#9a96a8':d<=-2?'#9ee07a':d<=1?'#f4ecdc':d<=3?'#ffb050':'#ff6a5a';}
function npcMark(id){const q=curQ();if(S.qs==='done'&&turnNpc(q)===id)return ['?','#8ef07a'];
  for(const sid in S.sq){const s=S.sq[sid];if(SUBQ[sid].giver!==id)continue;if(s.st==='done')return ['?','#8ef07a'];if(s.st==='avail'&&!(SUBQ[sid].trial&&S.qs==='avail'&&q.giver===id))return ['!',SUBQ[sid].trial?'#ffe066':'#7ac8ff'];}
  if(S.qs==='avail'&&q.giver===id)return ['!','#ffd040'];if(S.qs==='active'&&q.type==='talk'&&q.npc===id)return ['…','#ffd040'];return null;}
function drawOverlay(){const g=og;g.setTransform(pr,0,0,pr,0,0);g.clearRect(0,0,cssW,cssH);if(!started||traveling)return;const u=Math.min(cssW/100,cssH*1.78/100);g.textAlign='center';g.textBaseline='middle';
  const fs=Math.max(10,u*1.25);g.lineJoin='round';
  const txt=(s,x,y,col,size,bold)=>{g.font=(bold?'700 ':'')+size+'px "Gowun Dodum","Apple SD Gothic Neo",sans-serif';g.lineWidth=Math.max(2,size*.28);g.strokeStyle='rgba(16,10,24,.85)';g.strokeText(s,x,y);g.fillStyle=col;g.fillText(s,x,y);};
  const sc=cssH/VIEWH*zoom;
  const path=nav?nav.path:hunt&&hunt.roam?hunt.roam:null;if(path&&path.length){let px=player.x,py=player.y,acc=0;const pts=[];for(const p of path){const d=Math.hypot(p.x-px,p.y-py);let s=14-acc;while(s<d){pts.push([px+(p.x-px)*s/d,py+(p.y-py)*s/d]);s+=14;}acc=(acc+d)%14;px=p.x;py=p.y;if(pts.length>60)break;}
    g.lineWidth=1.5;g.strokeStyle='rgba(40,24,10,.6)';pts.forEach(([x,y],i)=>{const [a,b]=W2S(x,y,0),pulse=Math.max(0,Math.sin(i*.55-t*7));g.fillStyle=`rgba(255,${214+pulse*30|0},${110+pulse*90|0},${.7+.3*pulse})`;g.beginPath();g.ellipse(a,b,sc*(2.2+pulse*.8),sc*(1.25+pulse*.45),0,0,6.283);g.fill();g.stroke();});}
  for(const n of npcList){if(n.deco)continue;const [x,y]=W2S(n.x,n.y,n.way?52:CHARART[n.id]?getSprite(n.id,'down',false,0).lh+7:40);if(x<-50||x>cssW+50||y<-50||y>cssH+50)continue;
    if(n.way){txt(M.inst?'균열 문':'길잡이 표석',x,y,'#d8c0ff',fs,true);txt(M.inst?'나가기 · 지역 이동':'마을 간 이동',x,y+fs*1.05,'#c8bcd8',fs*.8);continue;}
    txt(npcName(n.id),x,y+sc*2,'#ffe8b0',fs,true);txt(NPCS[n.id].role,x,y+sc*2+fs*1.05,'#c8bcd8',fs*.8);
    const mk2=npcMark(n.id);if(mk2){const by=y-fs*1.4-Math.abs(Math.sin(t*3))*sc*3;g.fillStyle='rgba(20,12,30,.8)';g.beginPath();g.arc(x,by,fs*1.05,0,6.283);g.fill();g.strokeStyle=mk2[1];g.lineWidth=2;g.stroke();txt(mk2[0],x,by+1,mk2[1],fs*1.5,true);}}
  const q=curQ(),subSp=Object.keys(S.sq).filter(id=>S.sq[id].st==='active').map(id=>SUBQ[id].sp);
  for(const m of mobs){if(m.dead)continue;const dp=dist(m,player);if(dp>(m.boss?400:190)&&m!==target)continue;const h=monH(m.sp)*m.sc;const [x,y]=W2S(m.x,m.y,h+6);
    const isQ=!m.eliteOf&&((S.qs==='active'&&(q.sp===m.sp||(q.type==='zone'&&m.zone===q.zone)))||subSp.includes(m.sp));
    txt('Lv'+m.lv+' '+m.name,x,y-sc*5,m.rage?'#ff6a5a':m.eliteOf||m.riftBoss?'#ffb0ff':m.rift?RIFT_COL.name:lvCol(m.lv),fs*(m.boss?1.15:.85),m.boss||m===target);
    if(isQ){g.fillStyle=subSp.includes(m.sp)?'#7ac8ff':'#ffd040';g.font='700 '+fs*.9+'px sans-serif';g.fillText('◆',x-g.measureText('Lv'+m.lv+' '+m.name).width/2-fs*.9,y-sc*5);}
    if(m.hp<m.max||m===target||m.aggro){const bw=sc*(m.boss?40:20),bh=Math.max(3,sc*1.6);g.fillStyle='rgba(16,10,24,.85)';g.fillRect(x-bw/2-1,y-1,bw+2,bh+2);g.fillStyle=m.aggro?'#e0584a':'#8ad06a';g.fillRect(x-bw/2,y,bw*m.hp/m.max,bh);}
    if(m.wind>0){const k=m.wind/.45;txt('!',x+sc*12,y-sc*2,k>.6&&Math.floor(t*24)%2?'#ffffff':'#ffd040',fs*1.6,true);}
    if((mobBeh(m)==='guard'||m.bp&&m.bp.k==='guard')&&m.aggro&&(m.gdU>t||m.gdN&&m.gdN-t<GUARD.pre)){/* v4.58 방어 태세 방패(웅크리기 직전 GUARD.pre초는 깜빡임) */const on=m.gdU>t;if(on||Math.floor(t*12)%2){const r=fs*.95,bx=m.boss?x-sc*20-r*1.7:x,by=m.boss?y+r*.5:y-sc*5-fs*1.5;/* v4.69 보스는 체력 바 왼쪽(머리 위는 타깃 창에 가린다) */g.fillStyle=on?'rgba(120,180,255,.92)':'rgba(200,220,255,.55)';g.strokeStyle='#e8f4ff';g.lineWidth=2;g.beginPath();g.moveTo(bx-r,by-r*.9);g.lineTo(bx+r,by-r*.9);g.lineTo(bx+r*.9,by+r*.1);g.quadraticCurveTo(bx+r*.5,by+r*.85,bx,by+r*1.15);g.quadraticCurveTo(bx-r*.5,by+r*.85,bx-r*.9,by+r*.1);g.closePath();g.fill();g.stroke();}}}
  for(const b of bolts){const k=b.life/(b.max||.22);g.globalAlpha=1-k;g.strokeStyle=b.col;g.lineWidth=Math.max(1.5,sc*(b.w||1.1));g.shadowColor=b.col;g.shadowBlur=8;g.beginPath();b.pts.forEach((p,i)=>{const [x,y]=W2S(p[0],p[1],p[2]);const jx=i&&i<b.pts.length-1?rand(-3,3):0;i?g.lineTo(x+jx,y+jx):g.moveTo(x,y);});g.stroke();g.shadowBlur=0;}g.globalAlpha=1;
  for(const s of shots){const [x,y]=W2S(s.x,s.y,10),r=Math.max(3,sc*s.r*.55),[tx,ty]=W2S(s.x-s.c*14,s.y-s.s*14,10);g.strokeStyle=s.col;g.globalAlpha=.5;g.lineWidth=r;g.beginPath();g.moveTo(tx,ty);g.lineTo(x,y);g.stroke();g.globalAlpha=1;g.shadowColor=s.col;g.shadowBlur=10;g.fillStyle='#fff';g.beginPath();g.arc(x,y,r*.7,0,6.283);g.fill();g.strokeStyle=s.col;g.lineWidth=2;g.stroke();g.shadowBlur=0;}
  for(const f of floats){const k=f.life/1.1,[x,y]=W2S(f.x,f.y,f.up+k*26);g.globalAlpha=k<.7?1:1-(k-.7)/.3;const size=fs*(f.big?1.7:1.2)*(k<.1?1+(.1-k)*4:1);txt(f.txt,x+f.dx,y,f.col,size,true);}g.globalAlpha=1;
  const goal=questPoint();if(goal&&!modal){const [x,y]=W2S(goal.x,goal.y,10),m=40;if(x<m||x>cssW-m||y<m||y>cssH-m){const cx=cssW/2,cy=cssH/2,a=Math.atan2(y-cy,x-cx),R=Math.min(cssW,cssH)*.42,ax=cx+Math.cos(a)*R*cssW/cssH*.9,ay=cy+Math.sin(a)*R;
      g.save();g.translate(clamp(ax,m,cssW-m),clamp(ay,m,cssH-m));g.rotate(a);g.fillStyle='rgba(255,214,110,.9)';g.beginPath();g.moveTo(fs*1.4,0);g.lineTo(-fs*.6,-fs*.8);g.lineTo(-fs*.2,0);g.lineTo(-fs*.6,fs*.8);g.closePath();g.fill();g.restore();}}}
/* 화면 밖 화살표·미니맵 목표: 현재 지역 안의 목적지만, 다른 지역이면 길잡이 표석 */
function questPoint(){const q=curQ();let id=null,z=null;
  if(S.qs==='avail')id=q.giver;else if(S.qs==='done')id=turnNpc(q);else if(q.type==='talk')id=q.npc;else if(q.type==='elite'&&!gateState(q).ok){const nx=(q.subs||[]).find(s=>subSt(s)!=='clear');if(nx){const s=S.sq[nx];if(s.st==='active')z=SUBQ[nx].zone;else id=SUBQ[nx].giver;}else return null;}else z=q.zone;
  if(id){if(NALL[id].map!==MAPID)return M.way;return NALL[id];}if(z){if(ZALL[z].map!==MAPID)return M.way;const e=q.type==='elite'?eliteOf(q):null;if(alive(e))return e;const c=ZALL[z].c;return {x:c[0],y:c[1]};}return null;}
let hudT=0,lastHp=-1,menuDotT=0;
/* 레드닷 판정: 제작 = 지금 단계에서 장착 장비보다 좋은 것을 바로 만들 수 있다 · 권능 = 고를 권능이 있거나 각성 재료가 찼거나 받을 시련이 있다 */
/* v4.19 제작 레드닷: 지금 재료로 만들 수 있고, 그 부위 착용 장비보다 좋은 조합 (열린 단계 전부) */
function craftCan(k,t,g){if(t>craftTierMax())return false;const sl=targetSlot({k}),cur=S.eq[sl]&&itemById(S.eq[sl]);if(cur&&cpScore({k,t,g,en:0})<=cpScore(cur))return false;return craftCheck(k,t,g).ok;}
function craftCanKT(k,t){for(let g=0;g<5;g++)if(craftCan(k,t,g))return true;return false;}
function craftCanK(k){for(let t=1;t<=craftTierMax();t++)if(craftCanKT(k,t))return true;return false;}
function craftHint(){return CRAFT_KINDS.some(craftCanK);}
function enchHint(){for(const s of SLOTS){const it=S.eq[s]&&itemById(S.eq[s]);if(it&&it.en<enchSafe(it.k)&&enchCheck(it).ok)return true;}return false;}
function godHint(){if(godUnlocked()&&!S.god)return true;if(TRIALS.some(id=>subSt(id)==='avail'&&trialReady(id))&&!TRIALS.some(id=>subSt(id)==='active'))return true;if(S.god){const L=S.godLv[S.god];if(L<GOD_MAX){const c=godCost(L);if(S.shard>=c.shard&&S.gold>=c.gold)return true;}}return false;}
function updateHud(dt){hudT-=dt;const st=pStats();
  $('hpB').style.width=(player.hp/st.hp*100)+'%';$('mpB').style.width=(player.mp/st.mp*100)+'%';if(Math.abs(player.hp-lastHp)>.5){$('hpLag').style.width=(player.hp/st.hp*100)+'%';lastHp=player.hp;}
  const G=S.god&&GODS[S.god];for(let j=0;j<SLOT_N;j++){const e2=$('s'+(j+1)),id=S.slots[j],i=id?skIdx(id):-1;
    if(i<0){if(e2.dataset.lb!=='-'){e2.dataset.lb='-';e2.querySelector('.lb').textContent='빈 슬롯';e2.querySelector('.ic').textContent='+';e2.style.borderColor='';e2.className='sl empty';e2.querySelector('.cd').style.setProperty('--p','0%');e2.querySelector('.cdn').textContent='';e2.title='빈 슬롯 — 눌러서 스킬 장착';}continue;}
    const s=SK[i],rem=Math.max(0,player.cd[i]-t),mod=G&&G.sk===i,lb=mod?G.skn:s.name,lv=skLv(i);
    if(e2.dataset.lb!==lb){e2.dataset.lb=lb;e2.className='sl';e2.querySelector('.lb').textContent=lb;e2.querySelector('.ic').textContent=mod?G.ski:s.icon;e2.style.borderColor=mod?G.col:'';e2.title=lb+' ('+(j+1)+')';}
    e2.classList.toggle('lock',!lv);e2.classList.toggle('can',!lv&&canLearn(i));e2.querySelector('.cd').style.setProperty('--p',(lv?rem/s.cd*100:0)+'%');e2.querySelector('.cdn').textContent=!lv?(canLearn(i)?'배우기':s.book&&!S.books[s.id]?'📕':'Lv'+s.req):rem>0?Math.ceil(rem):'';}
  $('s0').querySelector('.cd').style.setProperty('--p',(Math.max(0,player.atkT)/(.62/st.aspd)*100)+'%');
  if(hudT>0)return;hudT=.12;fxHud();
  $('hpT').textContent=Math.ceil(player.hp)+' / '+st.hp;$('mpT').textContent=Math.floor(player.mp)+' / '+st.mp;$('lvTxt').textContent='Lv '+S.lv;
  $('xpB').style.width=(S.lv>=LV_MAX?100:S.xp/need(S.lv)*100)+'%';$('xpT').textContent=S.lv>=LV_MAX?'MAX':(S.xp/need(S.lv)*100).toFixed(1)+'%';
  $('cpT').textContent=fmt(cpOf());$('goldTop').textContent=fmt(S.gold);{const zf=ZFAITH[curZone]||0,fe=$('faT');fe.textContent=st.faith;fe.parentNode.classList.toggle('low',zf>st.faith);fe.parentNode.title=zf?'이 지역 권장 신앙 '+zf:'신앙 — 등급·강화·컬렉션으로 오른다';}$('goldT').textContent=fmt(S.gold);$('bGod').classList.toggle('lock',!godUnlocked()&&!TRIALS.some(id=>S.sq[id]));
  {const p=wPct(),wt=$('wtT');wt.textContent='무게 '+Math.round(p*100)+'%';wt.className=p>=.82?'bad':p>=.5?'warn':'';$('bBag').classList.toggle('warn',p>=.5&&p<.82);$('bBag').classList.toggle('bad',p>=.82);$('bBag').classList.toggle('dot',S.items.some(it=>it.nw)||equipBetterN()>0);}$('shB').style.width=Math.min(100,player.shield/st.hp*100)+'%';$('pHPn').textContent=S.hpPot;$('bTown').textContent='귀환 '+S.scroll;$('pHP').classList.toggle('low',S.hpPot<POT_LOW.hp);$('pMPn').textContent=S.mpPot;$('pHP').classList.toggle('autoon',!!S.autoPot);
  $('bStat').classList.toggle('gold',S.sp>0);$('bStat').classList.toggle('dot',S.sp>0);
  if(t>=menuDotT){menuDotT=t+1;{const q=curQ();if(q.type==='fboss'&&S.qs==='active'&&hunt&&!hunt.sub&&hunt.zone===q.zone&&!alive(hunt.mob)&&qMap(q)===MAPID){const bm=eliteOf(QFB(q));if(alive(bm)){hunt.mob=bm;toast(bm.name+' 출현 · 토벌하자',true);}}}$('bEnc').classList.toggle('dot',enchHint());$('bCraft').classList.toggle('dot',craftHint());$('bLog').classList.toggle('dot',acqMissNew());riftBtn();$('bColl').classList.toggle('dot',collCanAny());$('bGod').classList.toggle('dot',godHint());}$('bStatN').textContent=S.sp>0?'+'+S.sp:'';$('bSkill').classList.toggle('dot',SK.some((s,i)=>skCan(i)));
  riftHud();const Z=ZONES[curZone];$('zoneT').replaceChildren(Z?Z.name:M.inst?M.name:M.name+' 들녘');if(Z&&Z.lv&&!(rift&&rift.map===MAPID))$('zoneT').appendChild(el('small',null,'Lv '+Z.lv+(ZFAITH[curZone]?' · 신앙 '+ZFAITH[curZone]:'')));if(rift&&rift.map===MAPID){/* v4.46 남은 시간은 균열 HUD가 보여 준다 — 여기에는 딸린 지역 이름만 */const rz=el('small','rz','Lv '+rift.lv);rz.title='균열 몬스터 레벨';$('zoneT').appendChild(rz);}$('zoneT').classList.toggle('rift',riftK>.05);
  $('bAuto').classList.toggle('on',auto);$('bAuto').setAttribute('aria-pressed',auto);$('autoQ').classList.toggle('on',!!S.autoQ);$('autoQ').setAttribute('aria-pressed',!!S.autoQ);
  const nv=$('nav');if(nav&&!player.dead){nv.hidden=false;$('navT').textContent='자동 이동 · '+nav.label;}else if(hunt){nv.hidden=false;$('navT').textContent=(riftIn()?'균열 사냥 · ':hunt.sub?'서브 사냥 · ':'퀘스트 사냥 · ')+(hunt.mob?hunt.mob.name:hunt.sp?SPECIES[hunt.sp].name:ZONES[hunt.zone].name);}else nv.hidden=true;
  if(alive(target)){$('tgt').hidden=false;const tn=$('tgtN');tn.replaceChildren(el('small',null,'Lv '+target.lv),target.name);if(target.fa){const lo=st.faith<target.fa;tn.appendChild(el('small','tfa'+(lo?' low':''),'신앙 '+st.faith+'/'+target.fa+(lo?' · '+Math.round(faithOut(target)*100)+'%':'')));}tn.className='tn'+(target.boss?' boss':'');$('tgtB').style.width=(target.hp/target.max*100)+'%';$('tgtT').textContent=fmt(target.hp)+' / '+fmt(target.max);tgtInfo(target);}else{$('tgt').hidden=true;tgtInfo(null);}
  $('bMenu').classList.toggle('dot',[...$('menuPop').querySelectorAll('.tmb')].some(b=>b.classList.contains('dot')));
  renderQuests();drawMini();}
function drawMini(){if(!miniBase)return;const g=mg,V=M.mini;g.setTransform(1,0,0,1,0,0);g.drawImage(miniBase,0,0);const s=.1;if(V){const k=WW/V.w;g.setTransform(k,0,0,k,-V.x*s*k,-V.y*s*k);}
  const q=curQ(),hz=[];if(S.qs==='active'&&q.zone&&ZONES[q.zone])hz.push([q.zone,'255,214,90']);for(const id in S.sq)if(S.sq[id].st==='active'&&ZONES[SUBQ[id].zone])hz.push([SUBQ[id].zone,'122,200,255']);
  for(const [z,c] of hz){const r=ZONES[z].r;g.strokeStyle=`rgba(${c},${.55+.35*Math.sin(t*4)})`;g.lineWidth=2;g.strokeRect(r[0]*s,r[1]*s,(r[2]-r[0])*s,(r[3]-r[1])*s);}
  if(rift&&M.inst)for(const m of mobs)if(m.rift&&alive(m)){g.fillStyle=m.riftBoss?'#ff9cff':RIFT_COL.dot;g.beginPath();g.arc(m.x*s,m.y*s,m.riftBoss?3:1.1,0,6.283);g.fill();if(m.riftBoss){g.strokeStyle='#fff';g.lineWidth=.8;g.stroke();}}
  for(const m of mobs)if(alive(m)&&(m.aggro||m.boss)){g.fillStyle=m.boss?'#ff3a20':'#ff5a4a';g.beginPath();g.arc(m.x*s,m.y*s,m.boss?4:1.5,0,6.283);g.fill();}
  for(const n of npcList)if(!n.deco&&!n.way){g.fillStyle='#ffe8a0';g.fillRect(n.x*s-1,n.y*s-1,3,3);}
  /* v4.83 탐색 · 방어 지점(아직 안 간 곳) */for(const id in S.sq){const sx=S.sq[id],sq=SUBQ[id];if(!sq||sx.st!=='active'||!sx.pts||sq.type!=='reach'&&sq.type!=='wave'||!xqHere(sq))continue;sx.pts.forEach((p,i)=>{if(sq.type==='reach'&&(sx.v|0)&1<<i)return;g.fillStyle='#10202a';g.fillRect(p[0]*s-3,p[1]*s-3,6,6);g.fillStyle=sq.type==='wave'?'#ffd27a':'#8fe8ff';g.fillRect(p[0]*s-2,p[1]*s-2,4,4);});}
  if(graveHere()){const G=S.grave,x=G.x*s,y=G.y*s;g.strokeStyle='#1a1020';g.lineWidth=3;g.beginPath();g.moveTo(x,y-4);g.lineTo(x,y+4);g.moveTo(x-3,y-1.5);g.lineTo(x+3,y-1.5);g.stroke();g.strokeStyle='#e0c4ff';g.lineWidth=1.5;g.stroke();}
  const qp=questPoint();if(qp){g.strokeStyle='#ffe04a';g.lineWidth=2;g.beginPath();g.arc(qp.x*s,qp.y*s,5+Math.sin(t*5)*1.5,0,6.283);g.stroke();}
  const path=nav?nav.path:null;if(path&&path.length){g.strokeStyle='rgba(255,230,150,.8)';g.lineWidth=1.5;g.setLineDash([3,3]);g.beginPath();g.moveTo(player.x*s,player.y*s);for(const p of path)g.lineTo(p.x*s,p.y*s);g.stroke();g.setLineDash([]);}
  g.fillStyle='#ffffff';g.strokeStyle='#1a1020';g.lineWidth=1.5;g.beginPath();g.arc(player.x*s,player.y*s,V?2:3.5,0,6.283);g.fill();g.stroke();g.setTransform(1,0,0,1,0,0);}

/* ================= 권능 연출 · 침공 · AI 모드 ================= */
function streak(x0,y0,x1,y1,col){bolts.push({pts:[[x0,y0,16],[x1,y1,10]],life:0,max:.14,col,w:.8});}
function chainBolt(m0){const L=gLv(),n=2+Math.floor(L/4),mul=.6+.06*L,ts=mobs.filter(e=>alive(e)&&e!==m0&&dist(e,m0)<70).sort((a,b)=>dist(a,m0)-dist(b,m0)).slice(0,n);
  const pts=[[player.x,player.y,18],[m0.x,m0.y,10]];for(const e of ts){pts.push([e.x,e.y,10]);playerHit(e,mul);}bolts.push({pts,life:0,max:.3,col:'#fff6b0',w:2.4});burst(m0.x,m0.y,10,'#fff2a0',8,70,3);}
function invSpawn(){const open=HUNT.filter(z=>S.lv>=ZONES[z].mobs[0][1]-1),cand=open.slice(-2),z=cand[Math.floor(Math.random()*cand.length)]||HUNT[0],[sp]=M.inv[z],lv=Math.min(LV_MAX,S.lv+INV.lvAdd),c=ZONES[z].c;
  const m=makeMob(sp,lv,c[0]+rand(-30,30),c[1]+rand(-20,20),z,true,{hpMul:INV.hpMul,ext:{sc:1.9,inv:true,name:'침공 '+SPECIES[sp].name,fa:(ZFAITH[z]||0)+INV_FAITH}});m.atk=Math.round(m.atk*INV.atkMul);inv={m,zone:z,until:t+INV.stay};
  banner('침공 보스 출현',ZONES[z].name+' · '+m.name);toast('트래커의 침공 카드를 누르면 바로 토벌하러 간다');lastQKey='';}
/* v4.37 시간의 균열 → v4.46 전용 공간 → v4.48 '주기적으로 열리는 한 판짜리 균열'(현 요청).
   · 열림: 균열이 닫힌 뒤 플레이 시간 RIFT.every(15분)마다 하나 열린다(침공과 같은 방식 · 실제 시각은 쓰지 않는다 — 접속 유도 장치를 만들지 않는다). 월드 HUD 위쪽 ⧗ 표시가 남은 시간을 보여 준다.
   · 유지: 열린 뒤 RIFT.stay(10분) 안에 균열의 주인을 쓰러뜨리지 못하면 닫힌다. 안에 있든 밖에 있든 시간은 흐른다 — 중간에 나가도 진행(처치 수)은 남지만 시계는 멈추지 않는다.
   · 한 판: 몬스터는 RIFT.eN마리만 나온다(한 번에 pop마리 · 잡힐 때마다 채워지다가 다 나오면 끝) → 다 잡으면 균열의 주인 → 쓰러뜨리면 균열 상자 · 균열 종료 → 플레이어 자리에 포탈이 열려 월드로 돌아간다.
   · 난이도: 몬스터 = 내 레벨 + lvAdd · 균열의 주인 = 내 레벨 + eLv. 몬스터 종 · 보상 지역은 내 레벨대의 딸린 사냥터(RIFT.zone — 로웬 z4 → Lv21+ 카르도 k3 → Lv34+ 에르나 e3).
   · 처치 보상(강화석 ×2 · 도면 ×2 · 장비 ×2 · 비법서 · 권능 파편)은 그대로. 자동 진행은 균열에 들어가지 않는다(플레이어가 고른다). */
const RIFT={potMin:10,every:900,stay:600,pop:42,lvAdd:1,zone:{rowen:'z4',kardo:'k3',erna:'e3'},resp:4,cine:{open:1.2,enter:2.3,total:2.9,arrive:1.1},stoneP:.14,dsgK:2,eqK:2,shardP:.01,rcp:{1:['rcp2',.008],2:['rcp3',.006],3:['rcp4',.003]},
  /* v4.43 보상 재구성(#3-4c): 봇 시험에서 강화석은 병목이 아니었다 → 강화석 ×3→×2, 대신 장비 드롭 ×2(eqK) · 비법서 ×2 · 권능 파편(처치당 1%) */
  /* v4.38 균열 정예 → v4.48 균열의 주인: 한 판의 몬스터 eN마리를 다 잡으면 등장 · 내 레벨 +eLv · 체력 ×5 · 공격 ×1.25 · 처치 시 균열 상자 확정 + 균열 종료.
     eN = 한 판 분량(레벨대별 — 뒤 지역일수록 한 마리가 오래 걸린다): 유지 10분 가운데 5~7분에 끝나도록 성장 봇 실측으로 맞춤(100/75/60일 때 로웬 4:39~6:51 · 카르도 5:57~6:24 · 에르나 5:15~6:24 → 80 · 65로 조금 올림 — README v4.48) */
  eN:{rowen:100,kardo:80,erna:65},eLv:3,eHp:5,eAtk:1.25,eXp:6,eGold:10,box:{stone:r=>4+2*r,shard:5,
  /* v4.44 상자를 병목에 닿게(#3-4d): 장비 1개 확정(지역별 등급 표 — 누적 확률, 영웅 이상은 아직 못 채운 컬렉션 부위 우선) · 그 지역에서 이미 만난 지역 보스의 전용 장비 buP 확률(컬렉션에 없는 쪽 우선) */
  eq:{1:[[3,.25],[2,1]],2:[[3,.40],[2,1]],3:[[4,.10],[3,.60],[2,1]]},buP:.30}};
/* v4.46 전용 공간: rift = 이번 입장 {of 들어온 지역, base 딸린 사냥터(몬스터 표 · 기록의 기준), zone 'rz', …} · riftRet = 돌아갈 곳 {map,x,y}(전용 맵에 있는 동안 유지)
   · riftCarry = 물약을 사러 잠깐 나간 입장의 집계(돌아오면 이어 붙인다) */
let rift=null,riftRet=null,riftCarry=null,graceT=0,cineT=0,pCine=null;const RIFT_MAP='rift',RIFT_GAP={y:95,r:115};/* cineT: 포탈 연출 동안 조작을 막는 시각 · pCine: 플레이어가 포탈로 빨려 들어가고(−1) 나오는(+1) 크기 변화 *//* graceT: 균열에서 [나가기]로 사냥터 한가운데에 돌아온 직후 3초는 선공을 받지 않는다 */
const riftOf=()=>M.inst?(rift?rift.of:riftRet?riftRet.map:'rowen'):MAPID;
const riftRegMin=mid=>ZALL[RIFT.zone[mid]].mobs[0][1],riftBaseMap=()=>{let r='rowen';for(const mid in RIFT.zone)if(S.maps.includes(mid)&&S.lv>=riftRegMin(mid))r=mid;return r;};
/* 열린 균열의 레벨대(S.riftMap)와 한 판 분량(S.riftQ)은 열릴 때 정해진다 — 열려 있는 동안 레벨이 올라 레벨대가 바뀌어도 그 균열은 그대로다 */
const riftNeedOf=mid=>RIFT.eN[mid]||RIFT.eN.rowen,riftMapNow=()=>riftUp()&&RIFT.zone[S.riftMap]?S.riftMap:riftBaseMap(),riftNeed=()=>riftUp()&&S.riftQ?S.riftQ:riftNeedOf(riftBaseMap());
const riftZone=mid=>RIFT.zone[mid&&RIFT.zone[mid]?mid:riftMapNow()],riftLv=()=>Math.min(LV_MAX,S.lv)+RIFT.lvAdd,riftFa=()=>ZFAITH[repZone()]||0;
const pScale=()=>{if(!pCine)return 1;const k=clamp((t-pCine.t0)/pCine.dur,0,1);if(k>=1&&pCine.dir>0){pCine=null;return 1;}return pCine.dir<0?1-k:k;};
/* v4.46 개방 스토리: 균열은 메인 「균열의 문」(rq3)을 마쳐야 열린다 — 판정은 메인 진행에서 계산(riftKey는 옛 세이브 보호용 예외) */
const riftKeyIdx=()=>QUESTS.findIndex(q=>q.id==='rq3'),riftKey=()=>!!S.riftKey||S.qi>riftKeyIdx();
const riftLockMsg=()=>{const a=QUESTS.findIndex(q=>q.id==='rq1');return S.qi<a?'시간의 균열은 아직 닫혀 있다 · 메인 퀘스트 「호수의 주인」 뒤의 이야기에서 열린다':'시간의 균열은 아직 닫혀 있다 · 메인 퀘스트 「'+QUESTS[Math.min(S.qi,riftKeyIdx())].title+'」을(를) 마치면 열린다';};
/* v4.48 열림 상태: S.riftOpenT = 열린 균열의 남은 유지 시간(초, 0이면 닫힘) · S.riftCd = 다음 균열까지(초) · S.riftEK = 이번 균열 처치 수 · S.riftEP = 균열의 주인 대기(1) */
const riftUp=()=>riftKey()&&(S.riftOpenT||0)>0,riftOpen=()=>riftUp(),riftCd=()=>Math.max(0,S.riftCd||0),riftStay=()=>Math.max(0,S.riftOpenT||0),riftPend=()=>!!S.riftEP&&(typeof S.riftEP!=='object'||Object.keys(S.riftEP).length>0);
function riftUnlocked(){banner('시간의 균열이 열렸다',mmss(RIFT.stay)+' 안에 균열의 주인을 쓰러뜨리면 닫힌다 · 길잡이 표석 · 메뉴 [균열]');toast('시간의 균열 개방 · 길잡이 표석 · 메뉴 [균열] · 위쪽 ⧗ 표시에서 들어간다 (자동 진행은 들어가지 않는다)',true);
  riftOpenNow();/* v4.48 첫 균열은 개방과 함께 열린다 */riftBtn();/* 잠금 모양을 바로 푼다 */for(const id of ['bRift','bMenu']){const b=$(id);if(b){b.classList.add('glow');later(6,()=>b.classList.remove('glow'));}}lastQKey='';}
const riftHas=m=>!!(rift&&m.rift&&MAPID===RIFT_MAP);
const riftIn=()=>!!(rift&&MAPID===RIFT_MAP);
const riftName=()=>'시간의 균열';
const mmss=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
/* v4.42 입장 전 물약 확인 (MMORPG 라이크 '사냥 준비' · 물약 N개 이하 귀환 → 자동 구매 → 복귀): 균열 안은 퀘스트 자동 진행이 꺼지므로
   HP 물약이 RIFT.potMin(10) 미만이면 [채우고 입장](상점까지 걸어가 한도까지 구입 → 균열 입구로) · [그대로 입장] · [취소]를 묻는다. */
const riftPotCost=()=>Math.max(0,POT_CAP.hp-S.hpPot)*potPrice('hp');
function riftPrep(){const sid=shopId(),c=riftPotCost(),can=S.gold>=potPrice('hp');
  openModal({who:'hero',name:'균열 입장 준비',sub:'HP 물약 '+S.hpPot+'개 · MP 물약 '+S.mpPot+'개',text:'균열 안에서는 퀘스트 자동 진행이 꺼진다. 물약이 '+POT_LOW.hp+'개 아래로 내려가면 상점에 다녀오지만(자동 보충 켬일 때), 처음부터 적으면 정예를 만나 쓰러지기 쉽다. HP 물약 '+RIFT.potMin+'개 이상을 권한다.',
    btns:[{t:'취소',alt:true,f:closeModal},{t:'그대로 입장',alt:true,f:()=>riftEnter(true)},{t:can?'채우고 입장 (−'+fmt(Math.min(c,Math.floor(S.gold/potPrice('hp'))*potPrice('hp')))+' G)':'골드 부족',pri:true,dis:!can||!sid,f:riftPrepGo}]});}
function riftPrepGo(){const sid=shopId();if(!sid)return riftEnter(true);const go=()=>{autoBuy();later(.3,()=>{if(!player.dead&&!modal)riftEnter(true);});};
  stopAutoQ();const n=npcList.find(n=>n.id===sid);if(dist(n,player)<30){closeModal();go();return;}if(!navTo('npc',sid,npcName(sid)+'에게 · 물약 사고 균열로',go))riftEnter(true);}
/* v4.42 균열 안 보충: 자동 보충이 켜져 있고 HP 물약이 기준(6) 아래면 사냥을 멈추고 상점 → 다시 균열 입구로(균열 밖에선 시간이 줄지 않는다). 정예와 싸우는 중엔 2개까지 버틴다. */
function riftResupply(){if(!rift||rift.clear||!riftIn()||!auto||!hunt||hunt.zone!==rift.zone||nav||modal||player.dead||traveling||!S.autoBuy)return false;if(hunt.mob&&S.hpPot>=2)return false;
  if(S.hpPot>=POT_LOW.hp||S.gold<potPrice('hp'))return false;const of=rift.of;STAT.riftRes=(STAT.riftRes||0)+1;hunt=null;
  toast('균열 · HP 물약 '+S.hpPot+'개 · 상점에 다녀온다 (그동안에도 균열의 남은 시간은 흐른다)',true);
  /* v4.46 전용 공간: 균열에서 나가(시간 멈춤) 마을 상점에서 사고 다시 들어온다 — 이번 입장의 집계는 riftCarry로 이어 붙인다 */
  rift.then=()=>{const sid=shopId();if(!sid)return;const back=()=>{autoBuy();later(.3,()=>{if(!rift&&!player.dead&&!modal&&MAPID===of){if(riftUp())riftEnter(true);else toast('그사이 시간의 균열이 닫혔다',true);}});};
    const n=npcList.find(n=>n.id===sid);if(dist(n,player)<30)back();else navTo('npc',sid,npcName(sid)+'에게 · 물약 보충 후 균열로',back);};
  riftEnd('supply');return true;}
/* 전용 맵에 한 벌 깔기(v4.48): 이번 균열에 남은 수(RIFT.eN − 지금까지 처치)만큼만 나온다 — 한 번에 pop마리까지, 나머지는 잡힐 때마다 채워지고(rift.left) 다 나오면 더는 나오지 않는다.
   종은 딸린 사냥터 표의 비율 · 레벨은 전부 rift.lv(들어올 때의 내 레벨 + lvAdd). 균열의 주인이 대기 중이면(riftPend) 몬스터 없이 주인만 나온다 */
function riftSpawn(){const Z=ZONES.rz,B=ZALL[rift.base];for(const m of mobs)if(m.mesh&&m.mesh.parent)m.mesh.parent.remove(m.mesh);mobs.length=0;Z.mobs=B.mobs;
  const need=riftPend()?0:Math.max(0,riftNeed()-(S.riftEK||0)),n0=Math.min(RIFT.pop,need),bag=[];for(const [sp,l0,l1,n] of B.mobs)for(let i=0;i<n*2;i++)bag.push(sp);
  for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
  const homes=[];let made=0;for(let k=0;k<n0;k++){const sp=bag[k%bag.length];for(let i=0;i<160;i++){const x=Z.r[0]+26+Math.random()*(Z.r[2]-Z.r[0]-52),y=Z.r[1]+26+Math.random()*(Z.r[3]-Z.r[1]-52),c=ci(x,y);
      if(blk[c]||!reach[c]||i<120&&homes.some(h=>Math.hypot(h.x-x,h.y-y)<22)||Math.hypot(x-Z.c[0],y-(Z.r[3]-RIFT_GAP.y))<RIFT_GAP.r)continue;/* 입구 앞 빈터: 들어서자마자 둘러싸이지 않게 · 다시 들어올 때 남은 주인이 서는 자리 */
      homes.push({x,y});makeMob(sp,rift.lv,Math.round(x),Math.round(y),'rz',false,{ext:{rift:true,fa:rift.fa,name:'균열 '+SPECIES[sp].name}});made++;break;}}
  rift.left=need-made;}
/* 균열 몬스터가 쓰러졌을 때: 아직 나올 몬스터가 남았으면 RIFT.resp초 뒤 그 자리에 다시 나오고(남은 수 −1), 다 나왔으면 더는 나오지 않는다 */
function riftResp(){if(rift&&!rift.clear&&(rift.left||0)>0){rift.left--;return RIFT.resp;}return 1e9;}
function riftEnter(force){closeModal();if(rift||traveling)return;if(M.inst)return;const of=MAPID;if(!riftKey())return toast(riftLockMsg(),true);
  if(!riftUp())return toast('지금은 열린 균열이 없다 · 다음 균열까지 '+mmss(riftCd()),true);if(player.dead)return;
  if(force!==true&&S.hpPot<RIFT.potMin)return riftPrep();
  stopAutoQ();cancelNav();chase=null;target=null;const cr=riftCarry&&riftCarry.of===of&&t-riftCarry.at<900?riftCarry.s:null;riftCarry=null;const z=riftZone();
  rift=Object.assign({of,map:RIFT_MAP,zone:'rz',k:0,stone:0,dsg:0,rcp:0,eq:0,sh:0,sec:0},cr,{base:z,lv:riftLv(),fa:riftFa(),left:0,clear:0});riftRet={map:of,x:Math.round(player.x),y:Math.round(player.y)};MAP_REG.rift=MAP_REG[ZALL[z].map]||1;
  const P=MAPS.rift.plaza;
  doTravel(RIFT_MAP,()=>{if(!rift)return;$('flash').classList.add('on');setTimeout(()=>$('flash').classList.remove('on'),200);
    for(let i=0;i<24;i++)spawnP(player.x+rand(-40,40),player.y+rand(-30,30),6,{col:'#c89cff',vx:rand(-20,20),vy:rand(-20,20),vz:rand(40,90),g:-120,life:1,size:3});
    banner('시간의 균열','몬스터 Lv '+rift.lv+' · '+(riftPend()?'균열의 주인이 기다린다':'남은 몬스터 '+riftLeft()+' → 균열의 주인')+' · '+mmss(riftStay())+' 뒤 닫힌다');startHunt('rz');if(riftPend())later(1.5,()=>{if(rift&&riftIn()&&!alive(riftEliteOf()))riftElite(true);});lastQKey='';save();},
    {rift:true,quiet:true,now:true,label:'시간의 균열로 들어가는 중…',at:{x:P.x,y:P.y-18},arrive:()=>{if(rift)riftSpawn();}});}
/* 전용 맵에 입장 없이 남았을 때(예외) 들어온 지역의 마을로 내보낸다 */
function riftLeave(){if(!M.inst||traveling)return;const of=riftRet?riftRet.map:'rowen',H=MAPS[of];hunt=null;auto=false;doTravel(of,null,{quiet:true,label:'균열에서 나가는 중…',at:{x:H.plaza.x,y:H.plaza.y+40}});}
function riftLoot(m){rift.k++;S.riftK=(S.riftK||0)+1;riftRecOf(rift.base).k++;const r=MAP_REG.rift||1;
  if(m.riftBoss){riftBox(m,r);riftClear();}else{S.riftEK=Math.min(riftNeed(),(S.riftEK||0)+1);if(S.riftEK>=riftNeed()&&!alive(riftEliteOf()))riftElite();}/* v4.48 한 판의 몬스터를 다 잡으면 주인 · 주인을 쓰러뜨리면 균열 종료 */
  withAcq(acqSrcOf(m),acqZoneOf(m),()=>{
  if(Math.random()<DROP.dsg*(RIFT.dsgK-1)){const k=dsgRand(r);addStk(k,1);rift.dsg++;floatTxt(m.x,m.y-52,'+'+STK[k].n,STK[k].col,true);}
  const [rk,rp]=RIFT.rcp[r];if(Math.random()<rp){addStk(rk,1);rift.rcp++;floatTxt(m.x,m.y-40,'+'+STK[rk].n,STK[rk].col,true);toast('균열 · '+STK[rk].n+' 획득',true);}
  if(Math.random()<DROP.eq*(RIFT.eqK-1)){const it=newItem(rollSlot(),tierOfLv(m.lv),rollGrade(false));if(addItem(it,m)){rift.eq=(rift.eq||0)+1;const G=GRADES[it.g];floatTxt(m.x,m.y-62,G.n+' '+itemName(it),G.c,it.g>=2);}}
  if(Math.random()<RIFT.shardP){S.shard+=1;rift.sh=(rift.sh||0)+1;floatTxt(m.x,m.y-46,'+권능 파편','#ffd860');}});}
const riftEliteOf=()=>M.inst?mobs.find(m=>m.riftBoss):undefined;
const riftLeft=()=>Math.max(0,riftNeed()-(S.riftEK||0));
function riftElite(gate){/* gate: 다시 들어왔을 때 남아 있던 정예 — 입구 앞 빈터에 세운다 */if(!rift||!riftIn())return null;const z=rift.base,Z=ZONES.rz,B=ZALL[z];S.riftEP=1;let m=riftEliteOf();
  if(!m){const top=B.mobs.reduce((a,b)=>b[2]>=a[2]?b:a),sp=top[0],lv=rift.lv-RIFT.lvAdd+RIFT.eLv;/* v4.48 들어올 때의 내 레벨 + eLv *//* 자리: 사냥 구역 안에서 사냥 중이면 플레이어 곁(90~150 — 막 잡아 비운 자리라 딸려 오는 몬스터가 적다) · 막 들어온 문턱이면 사냥 구역 입구 앞 빈터.
       처음엔 위쪽 끝(문턱에서 먼 쪽)에 뒀는데, 거기까지 가로지르며 몬스터를 끌고 가 물약이 옛 균열의 2.3배 들었다(통제 측정 6.2 → 14.5개/120초) → 바꿈 */
    let x=Z.c[0],y=Z.r[3]-RIFT_GAP.y;
    if(gate!==true&&inR(Z.r,player.x,player.y,0))for(let i=0;i<80;i++){const a=Math.random()*6.283,d=90+Math.random()*60,xx=player.x+Math.cos(a)*d,yy=player.y+Math.sin(a)*d,c=ci(xx,yy);if(inR(Z.r,xx,yy,-30)&&!blk[c]&&reach[c]){x=Math.round(xx);y=Math.round(yy);break;}}
    m=makeMob(sp,lv,x,y,'rz',false,{hpMul:6*RIFT.eHp,ext:{rift:true,riftBoss:true,sc:2,fa:rift.fa,name:'균열의 주인 · '+SPECIES[sp].name}});m.atk=Math.round(m.atk*RIFT.eAtk);m.xp=Math.round(m.xp*RIFT.eXp);m.gold=Math.round(m.gold*RIFT.eGold);}
  else{m.dead=false;m.hp=m.max;m.x=m.home.x;m.y=m.home.y;m.aggro=false;m.ret=false;m.deadT=0;m.respawn=1e9;m.mesh.visible=true;}
  for(let i=0;i<20;i++)spawnP(m.x+rand(-20,20),m.y+rand(-14,14),6,{col:'#c89cff',vx:rand(-20,20),vy:rand(-20,20),vz:rand(50,100),g:-120,life:1.1,size:3});
  if(hunt&&hunt.zone==='rz'&&!hunt.mob)hunt.mob=m;banner('균열의 주인 등장','Lv'+m.lv+' '+m.name+' · 쓰러뜨리면 균열 상자 · 균열이 닫힌다');lastQKey='';return m;}
/* v4.44 균열 상자 장비: 등급은 지역 표(RIFT.box.eq[r]) · 부위는 그 등급 이상을 요구하는 미등록 컬렉션 칸 우선(없으면 보통 부위 굴림) · 단계는 정예 Lv */
function riftBoxGrade(r){const x=Math.random();for(const [g,p] of RIFT.box.eq[r])if(x<p)return g;return 2;}
function riftBoxSlot(g,t){const c=[];for(const C of COLL)C.req.forEach((q,i)=>{if(!q.bu&&q.k&&(q.g||0)>=2&&(q.g||0)<=g&&(!q.t||q.t===t)&&!collReg(C,i))c.push(q.k);});return c.length?c[Math.floor(Math.random()*c.length)]:rollSlot();}
/* 그 지역(지금 맵)에서 이미 만난 지역 보스의 전용 장비 후보 — 컬렉션에 아직 없고 등록할 수 있는 사본도 없는 것 우선 */
function riftBoxBU(){const of=ZALL[rift?rift.base:riftZone()].map,B=QUESTS.filter((q,i)=>q.elite&&i<S.qi&&qMap(q)===of).flatMap(q=>buOfQ(q.id));/* v4.46 전용 공간 안에서는 MAPID가 'rift' — 딸린 지역(riftOf) 기준 */if(!B.length)return null;
  const want=B.filter(b=>COLL.some(c=>c.req.some((q,i)=>q.bu===b.id&&!collReg(c,i)))&&!S.items.some(x=>x.bu===b.id&&!isEq(x)&&!x.lock));const L=want.length?want:B;return L[Math.floor(Math.random()*L.length)];}
function riftBox(m,r){S.riftEP=0;S.riftBox=(S.riftBox||0)+1;rift.box=(rift.box||0)+1;
  const ns=RIFT.box.stone(r),dk=dsgRand(r),rk=RIFT.rcp[r][0],sh=RIFT.box.shard;S.stone+=ns;rift.stone+=ns;S.shard+=sh;
  const g=riftBoxGrade(r),t=tierOfLv(m.lv),it=newItem(riftBoxSlot(g,t),t,g),bu=Math.random()<RIFT.box.buP?riftBoxBU():null;let got=[];
  withAcq('균열 상자 · '+m.name,acqZoneOf(m),()=>{addStk(dk,1);addStk(rk,1);
    if(addItem(it,m)){rift.eq=(rift.eq||0)+1;rift.boxG=Math.max(rift.boxG||0,g);STAT.riftBoxG=STAT.riftBoxG||{};STAT.riftBoxG[g]=(STAT.riftBoxG[g]||0)+1;got.push(GRADES[g].n+' '+itemName(it));}
    if(bu){const b=newBU(bu.id);if(addItem(b,m)){rift.bu=(rift.bu||0)+1;STAT.riftBU=(STAT.riftBU||0)+1;STAT.bu=(STAT.bu||0)+1;got.push('★ '+bu.n);}}});rift.dsg++;rift.rcp++;
  floatTxt(m.x,m.y-30,'균열 상자','#e0c0ff',true);const gs=got.length?' · '+got.join(' · '):'';
  banner('균열 상자','강화석 +'+ns+' · '+STK[dk].n+' · '+STK[rk].n+' · 권능 파편 +'+sh+gs);toast('균열의 주인 토벌 · 균열 상자: 강화석 +'+ns+' · '+STK[dk].n+' +1 · '+STK[rk].n+' +1 · 권능 파편 +'+sh+gs,true);
  if(hunt&&hunt.mob===m)hunt.mob=null;lastQKey='';save();}
/* v4.48 포탈(현 요청): 균열의 주인을 쓰러뜨리면 플레이어 자리에 포탈이 열리고(cine.open초 뒤) 빨려 들어가(cine.enter) 월드로 돌아간다(cine.total). 월드에 도착하면 같은 포탈에서 걸어 나온다(cine.arrive) */
const FX_PORTAL=cvs(64,96,(g,w,h)=>{g.translate(w/2,h/2);g.scale(.62,1);const r=g.createRadialGradient(0,0,2,0,0,46);r.addColorStop(0,'rgba(255,255,255,.95)');r.addColorStop(.3,'rgba(255,255,255,.5)');r.addColorStop(.75,'rgba(255,255,255,.26)');r.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=r;g.beginPath();g.arc(0,0,46,0,6.283);g.fill();g.lineWidth=4;g.strokeStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(0,0,40,0,6.283);g.stroke();
  for(let i=0;i<3;i++){g.lineWidth=2.5;g.strokeStyle='rgba(255,255,255,'+(.55-i*.13)+')';g.beginPath();g.arc(0,0,31-i*9,i*2.1,i*2.1+4.2);g.stroke();}});
function portalFx(x,y,dur){const e=()=>elevAt(x,y),grow=k=>Math.min(1,k*dur/.35)*Math.min(1,(1-k)*dur/.3);
  fxMesh(FX_DISC,'#6a3ad0',{geo:DGEO,max:dur,up:(q,k)=>{const s=grow(k)*(1+Math.sin(t*6)*.05);q.scale.set(48*s,1,36*s);q.position.set(x,e()+.8,y);q.material.opacity=.8;}});
  fxMesh(FX_RING,'#d8b8ff',{geo:DGEO,max:dur,up:(q,k)=>{const s=grow(k)*(1+Math.sin(t*9)*.04);q.scale.set(56*s,1,42*s);q.position.set(x,e()+1,y);q.material.opacity=.9;}});
  fxMesh(FX_PORTAL,'#b98cff',{geo:SPGEO,max:dur,up:(q,k)=>{const s=grow(k);q.scale.set(36*s,58*VS*s*(1+Math.sin(t*5)*.03),1);q.position.set(x,e()+2,y-4);q.material.opacity=.95;}});
  for(let i=0;i<26;i++){const a=i/26*6.283;spawnP(x+Math.cos(a)*34,y+Math.sin(a)*24,3,{col:'#c89cff',vx:-Math.cos(a)*34,vy:-Math.sin(a)*24,vz:36,g:-10,life:.9,size:3.2,size1:.5});}}
function riftClear(){if(!rift||rift.clear)return;rift.clear=1;rift.clearT=RIFT.stay-riftStay();/* 열린 지 몇 초 만에 닫았나(밖에 있던 시간 포함) */const C=RIFT.cine;S.riftOpenT=0;S.riftCd=RIFT.every;S.riftEK=0;S.riftEP=0;S.riftClr=(S.riftClr||0)+1;STAT.riftClr=(STAT.riftClr||0)+1;
  hunt=null;auto=false;nav=null;chase=null;target=null;moveRing.visible=false;cineT=t+C.total+.2;lastQKey='';save();
  later(C.open,()=>{if(!rift||!rift.clear||!riftIn()||player.dead)return;banner('균열이 닫힌다','균열의 주인을 쓰러뜨렸다 · 포탈이 열린다');portalFx(player.x,player.y,C.total-C.open+.15);});
  later(C.enter,()=>{if(!rift||!rift.clear||!riftIn()||player.dead)return;pCine={t0:t,dur:C.total-C.enter,dir:-1};burst(player.x,player.y,14,'#d8b8ff',22,70,4);});
  later(C.total,()=>{if(rift&&rift.clear&&riftIn()&&!player.dead){$('flash').classList.add('on');setTimeout(()=>$('flash').classList.remove('on'),220);riftEnd('clear');}});}
/* 유지 시간이 다 됨(v4.48): 안에 있으면 내보내고, 그 균열의 진행은 사라진다 */
function riftExpire(){const k=S.riftEK||0,pend=riftPend(),N=riftNeed();S.riftOpenT=0;S.riftCd=RIFT.every;S.riftEK=0;S.riftEP=0;S.riftFail=(S.riftFail||0)+1;STAT.riftFail=(STAT.riftFail||0)+1;lastQKey='';
  if(rift){rift.endK=k;rift.endPend=pend;rift.endN=N;riftEnd('time');return;}
  toast('시간의 균열이 닫혔다'+(pend?' · 균열의 주인을 남겨 둔 채':k?' · 처치 '+k+'/'+N+'에서 멈춘 채':'')+' · 다음 균열까지 '+mmss(RIFT.every),true);save();
  if(k||pend){/* 들어갔다가 나온 사이에 닫힘 → 팝업(15초 뒤 저절로 닫힌다) · 한 번도 안 들어갔으면 배너만 */if(!modal&&!win&&!player.dead)openModal({who:'hero',live:true,autoClose:15,name:'시간의 균열이 닫혔다',sub:'시간 끝 · 균열 밖에 있는 동안 닫혔다',
      text:'유지 시간 '+mmss(RIFT.stay)+'이 지났다. 이번 진행('+(pend?'균열의 주인 앞까지':'처치 '+k+' / '+N)+')은 사라졌다.\n다음 균열까지 '+mmss(RIFT.every)+'.',btns:[{t:'확인',pri:true,f:closeModal}]});}
  else if(!M.inst)banner('시간의 균열이 닫혔다','다음 균열까지 '+mmss(RIFT.every));}
/* 새 균열이 열림(v4.48) */
function riftOpenNow(){S.riftOpenT=RIFT.stay;S.riftCd=0;S.riftEK=0;S.riftEP=0;S.riftMap=riftBaseMap();S.riftQ=riftNeedOf(S.riftMap);}
function riftAppear(){riftOpenNow();lastQKey='';if(!M.inst)banner('시간의 균열이 열렸다',mmss(RIFT.stay)+' 안에 균열의 주인을 쓰러뜨리면 닫힌다 · 길잡이 표석 · 메뉴 [균열]');
  toast('시간의 균열이 열렸다 · '+Math.round(RIFT.stay/60)+'분 뒤 닫힌다 · 위쪽 ⧗ 표시를 누르면 입장 창 (자동 진행은 들어가지 않는다)',true);for(const id of ['bRift','bMenu']){const b=$(id);if(b){b.classList.add('glow');later(6,()=>b.classList.remove('glow'));}}riftBtn();save();}
/* v4.48 안내 팝업(현 요청): 나가기 확인 · 시간 끝 · 클리어 · 물약 소진/귀환으로 나옴 — 무엇이 남고 무엇이 사라지는지, 균열이 아직 열려 있는지, 다음 균열까지 얼마인지를 말해 준다.
   live 팝업은 떠 있는 동안에도 자동 전투가 이어진다(균열 안에서 확인 창을 읽다 쓰러지지 않게) */
function riftAsk(){if(!rift)return;if(rift.clear||!riftUp()){closeModal();return riftEnd('out');}const k=S.riftEK||0;
  openModal({who:'hero',live:true,name:'균열에서 나가기',sub:'남은 시간 '+mmss(riftStay())+' · '+(riftPend()?'균열의 주인 대기':'처치 '+k+' / '+riftNeed()),
    text:'나가도 진행은 남지만 균열의 시간은 계속 흐른다.\n'+mmss(riftStay())+' 안에 돌아와 균열의 주인을 쓰러뜨리지 못하면 균열이 닫히고 이번 진행은 사라진다.',
    btns:[{t:'계속 싸운다',alt:true,f:closeModal},{t:'나간다',pri:true,f:()=>{closeModal();riftEnd('out');}}]});}
function riftNote(kind,R){if(player.dead||win)return false;const loot='처치 '+R.k+' · 강화석 +'+R.stone+(R.dsg?' · 도면 +'+R.dsg:'')+(R.rcp?' · 비법서 +'+R.rcp:'')+(R.eq?' · 장비 +'+R.eq:'')+(R.sh?' · 권능 파편 +'+R.sh:'')+(R.bu?' · 보스 전용 +'+R.bu:'')+(R.box?' · 균열 상자 '+R.box:''),next='다음 균열까지 '+mmss(riftCd());
  if(kind==='clear')return openModal({who:'hero',live:true,name:'균열을 닫았다',sub:'균열의 주인 토벌 · 열린 지 '+mmss(R.clearT||R.sec||0)+' 만에 닫았다',text:'이번 균열에서 얻은 것 — '+loot+'\n'+next+' · 새 균열이 열리면 위쪽 ⧗ 표시가 알려 준다.',btns:[{t:'확인',pri:true,f:closeModal}]}),true;
  if(kind==='time')return openModal({who:'hero',live:true,name:'균열이 닫혔다',sub:'시간 끝 · 균열의 주인을 쓰러뜨리지 못했다',
    text:'유지 시간 '+mmss(RIFT.stay)+'이 지나 밖으로 밀려났다. 이번 진행('+(R.endPend?'균열의 주인 앞까지':'처치 '+(R.endK||0)+' / '+(R.endN||riftNeed()))+')은 사라졌다.\n얻은 것은 그대로다 — '+loot+'\n'+next+' · 열리자마자 들어가야 시간 안에 주인을 잡을 수 있다.',btns:[{t:'확인',pri:true,f:closeModal}]}),true;
  const up=riftUp(),pot=kind==='pot';
  openModal({who:'hero',live:true,name:'균열에서 나왔다',sub:up?'균열은 아직 열려 있다 · '+mmss(riftStay())+' 뒤 닫힌다':'균열은 닫혔다 · '+next,
    text:(pot?'물약이 떨어져 마을로 나왔다.':'귀환 주문서로 마을에 돌아왔다.')+(up?' 진행('+(riftPend()?'균열의 주인 대기':'처치 '+(S.riftEK||0)+' / '+riftNeed())+')은 남아 있지만 균열의 시간은 계속 흐른다.':''),
    btns:[{t:'닫기',alt:true,f:closeModal}].concat(up?[{t:pot?'물약 사고 다시 입장':'다시 입장',pri:true,f:()=>{closeModal();if(pot)riftPrepGo();else riftEnter();}}]:[])});return true;}
/* 나가는 이유와 도착지 — out(나가기 버튼 · 균열 문) · clear(주인 처치 → 포탈) · time(유지 시간 끝): 들어오기 전 자리 / town(귀환) · pot(물약 소진) · supply(물약 보충): 들어온 지역 마을 광장
   / dead: 쓰러진 채 남고 부활할 때 마을로(revive) / move: 균열 문으로 다른 지역에 가는 중(doTravel이 옮긴다). clear · time이 아니면 균열은 아직 열려 있다(진행 유지 · 시계는 계속 흐른다) */
function riftEnd(why){if(!rift)return;const R=rift,H=MAPS[R.of];rift=null;if(why!=='clear')pCine=null;
  for(const m of MAPS.rift.rt?MAPS.rift.rt.mobs:[]){m.dead=true;m.respawn=1e9;m.deadT=1;m.aggro=false;m.mesh.visible=false;}if(target&&target.rift)target=null;if(chase&&chase.rift)chase=null;
  const sum='시간의 균열 · '+mmss(R.sec||0)+' · 처치 '+R.k+' · 강화석 +'+R.stone+(R.dsg?' · 도면 +'+R.dsg:'')+(R.rcp?' · 비법서 +'+R.rcp:'')+(R.eq?' · 장비 +'+R.eq:'')+(R.sh?' · 권능 파편 +'+R.sh:'')+(R.bu?' · 보스 전용 +'+R.bu:'')+(R.box?' · 균열 상자 '+R.box:'');
  STAT.riftLast={why,k:R.k,stone:R.stone,dsg:R.dsg,rcp:R.rcp,eq:R.eq||0,sh:R.sh||0,box:R.box||0,sec:Math.round(R.sec||0),lv:R.lv,ct:why==='clear'?Math.round(R.clearT||0):0};
  if(why==='supply')riftCarry={of:R.of,at:t,s:{k:R.k,stone:R.stone,dsg:R.dsg,rcp:R.rcp,eq:R.eq,sh:R.sh,bu:R.bu,box:R.box,boxG:R.boxG,sec:R.sec}};
  const note=why==='clear'||why==='time'||why==='town'||why==='pot',msg=(why==='clear'?'균열을 닫았다 · ':why==='time'?'균열이 닫혔다(시간 끝) · ':why==='dead'?'쓰러져 균열에서 밀려났다 · ':why==='pot'?'물약이 떨어져 균열에서 나왔다 · ':'균열에서 나왔다 · ')+sum+(why!=='clear'&&why!=='time'&&riftUp()?' · 균열은 아직 열려 있다('+mmss(riftStay())+')':'');
  if(why!=='supply'&&!note)toast(msg,true);/* 안내 팝업이 뜨는 경우(note)는 팝업이 같은 내용을 말한다 — 팝업을 못 띄웠을 때만 토스트 */lastQKey='';
  if(M.inst&&why!=='move'&&why!=='dead'&&!player.dead){hunt=null;auto=false;const back=(why==='out'||why==='clear'||why==='time')&&riftRet&&riftRet.map===R.of,at=back?{x:riftRet.x,y:riftRet.y}:{x:H.plaza.x,y:H.plaza.y+40};
    doTravel(R.of,()=>{graceT=t+3;
      if(why==='clear'){portalFx(player.x,player.y,RIFT.cine.arrive);pCine={t0:t,dur:.45,dir:1};cineT=t+.5;later(.9,()=>{if(!riftNote('clear',R))toast(msg,true);});}
      else if(note&&!riftNote(why,R))toast(msg,true);/* 안내 팝업(현 요청): 왜 나왔는지 · 균열이 아직 열려 있는지 · 다음 균열까지 */
      if(R.then)R.then();},{quiet:true,now:true,label:why==='clear'?'포탈을 지나 월드로 돌아가는 중…':'균열에서 나가는 중…',at});}
  else{if(note)toast(msg,true);save();}}
function riftTick(dt){if(!started||traveling)return;
  if(rift&&player.dead)riftEnd('dead');else if(rift&&!M.inst)riftEnd('move');
  if(riftKey()){
    if(S.riftCd==null&&S.riftOpenT==null)riftAppear();/* 개방 뒤 처음(옛 세이브 포함): 바로 하나 열린다 */
    else if(rift&&rift.clear)rift.sec=(rift.sec||0)+dt;/* 포탈 연출 중 */
    else if((S.riftOpenT||0)>0){S.riftOpenT=Math.max(0,S.riftOpenT-dt);
      if(rift){rift.sec=(rift.sec||0)+dt;riftRecOf(rift.base).s+=dt;
        /* 안전장치: 남은 몬스터도 나올 몬스터도 없는데 주인이 없으면 불러낸다 */
        if(!riftPend()&&(rift.left||0)<=0&&!mobs.some(m=>m.rift&&!m.riftBoss&&(!m.dead||m.respawn<1e8))){S.riftEK=riftNeed();riftElite();}}
      if(S.riftOpenT<=0)riftExpire();}
    else{S.riftCd=Math.max(0,(S.riftCd??RIFT.every)-dt);if(S.riftCd<=0)riftAppear();}}
  if(!rift&&M.inst&&!player.dead&&!traveling)riftLeave();}
/* v4.39 균열 안 표시 — 균열 사냥터 안에서는 보라 안개(장면 안개 · 하늘색을 보라로 · 화면 가장자리 보라 그늘 · 떠오르는 보라 입자),
   균열 몬스터는 보랏빛 재질 · 보라 이름, 미니맵에 균열 사냥터(열림 = 점선 · 안 = 칠함 · 균열 몬스터 점 · 정예 큰 점), 미니맵 지역 이름 옆 남은 시간, 메뉴 '균열'(표석과 같은 줄). */
const RIFT_COL={haze:new T3.Color('#6e4c98'),amb:new T3.Color('#8a6ab8'),hazeK:.55,mote:'#b78aff',name:'#c9a0ff',dot:'#b78aff',moteN:10};
let riftK=0,riftMoteT=0;const _hz=new T3.Color(),_am=new T3.Color();
function riftFx(dt){const want=rift&&riftIn()?1:0,k0=riftK;riftK+=(want-riftK)*Math.min(1,dt*2.2);if(Math.abs(riftK-want)<.003)riftK=want;if(!M.inst)riftK=0;/* v4.46 전용 공간 밖에서는 보라 그늘을 남기지 않는다(맵을 바꾸며 나오므로 서서히 걷힐 것이 없다) */
  const v=$('riftV');if(v){v.style.opacity=riftK.toFixed(3);v.hidden=riftK<=0;}
  if(rift&&riftK>.2){riftMoteT-=dt;while(riftMoteT<0){riftMoteT+=1/RIFT_COL.moteN;const r=M.bound,x=player.x+rand(-170,170),y=player.y+rand(-120,120);if(inR(r,x,y))spawnP(x,y,1+Math.random()*6,{col:RIFT_COL.mote,vx:rand(-4,4),vy:rand(-3,3),vz:8+Math.random()*10,g:2,life:1.6+Math.random()*.8,size:2.6+Math.random()*2,size1:.5});}}}
/* v4.46 균열 HUD(G17 · 현 요청): 전용 공간 안에서만 보인다 — 남은 유지 시간 · 처치 n/분량(→ 균열의 주인) · 이번 입장 획득 · [나가기] */
function riftHud(){riftChip();const h=$('riftHud');if(!h)return;const on=!!(rift&&riftIn()&&!traveling);if(h.hidden===on)h.hidden=!on;document.body.classList.toggle('inrift',on);if(!on)return;
  const E=riftEliteOf(),el_=alive(E),pend=riftPend(),done=!!rift.clear,T=riftStay(),k=Math.min(riftNeed(),S.riftEK||0);$('rhN').textContent='⧗ 시간의 균열 · Lv '+rift.lv;
  const tm=$('rhT');tm.textContent=done?'닫힘':mmss(T);tm.className='rht'+(done?'':T<60?' bad':T<180?' warn':'');$('rhTB').style.width=(done?0:clamp(T/RIFT.stay*100,0,100))+'%';
  const e=$('rhE');e.textContent=done?'포탈이 열린다…':el_?'균열의 주인 등장!':pend?'균열의 주인이 깨어난다…':'처치 '+k+' / '+riftNeed();e.className='rhe'+(el_||done?' on':'');
  $('rhEB').style.width=(done?100:el_?clamp(E.hp/E.max*100,0,100):pend?100:clamp(k/riftNeed()*100,0,100))+'%';
  const L=[['강화석',rift.stone],['도면',rift.dsg],['장비',rift.eq||0],['비법서',rift.rcp],['파편',rift.sh||0]];if(rift.box)L.push(['상자',rift.box]);
  const key=L.map(x=>x[1]).join(',');if(h.dataset.k!==key){h.dataset.k=key;$('rhL').replaceChildren(...L.map(([n,v])=>el('span',v?'':'z',n+' +'+v)));}}
function riftBtn(){const b=$('bRift');if(!b)return;const key=riftKey(),up=riftUp();b.classList.toggle('lock',!key);b.classList.toggle('on',!!rift);b.classList.toggle('dot',up&&!rift);
  b.title=!key?riftLockMsg():rift?'시간의 균열 · 안에 있음 · '+mmss(riftStay())+' 뒤 닫힌다':up?'시간의 균열 · 열려 있다 · '+mmss(riftStay())+' 뒤 닫힌다'+(riftPend()?' · 균열의 주인 대기':S.riftEK?' · 처치 '+S.riftEK+'/'+riftNeed():''):'시간의 균열 · 다음 균열까지 '+mmss(riftCd());riftChip();}
/* v4.48 월드 HUD 위쪽 표시(현 요청): 다음 균열까지 남은 시간 / 열려 있으면 남은 유지 시간과 진행 — 누르면 균열 창 */
function riftChip(){const c=$('riftChip');if(!c)return;const show=!!(started&&riftKey()&&!M.inst);if(c.hidden===show)c.hidden=!show;if(!show)return;const up=riftUp(),T=riftStay();
  const tx=up?(riftPend()?'주인 ':S.riftEK?S.riftEK+'/'+riftNeed()+' ':'열림 ')+mmss(T):mmss(riftCd());if(c.dataset.k===tx)return;c.dataset.k=tx;/* 바뀔 때만 다시 쓴다(매 프레임 불림) */
  c.classList.toggle('up',up);c.classList.toggle('warn',up&&T<120);$('rcT').textContent=tx;
  c.title=up?'시간의 균열이 열려 있다 · '+mmss(T)+' 뒤 닫힌다 · 누르면 입장 창':'다음 균열까지 '+mmss(riftCd())+' · 균열은 닫힌 뒤 '+Math.round(RIFT.every/60)+'분마다 열린다';}
function openRift(){toggleMenu(false);if(!riftKey())return toast(riftLockMsg(),true);/* 잠겨 있으면 창 대신 안내 */const body=el('div','shop');riftRow(body);riftTable(body);
  openModal({who:'hero',name:'시간의 균열',sub:'한 판: 몬스터 '+riftNeed()+' → 균열의 주인 → 닫힘 · '+Math.round(RIFT.every/60)+'분마다 열려 '+Math.round(RIFT.stay/60)+'분 유지',text:'',body,btns:[{t:'닫기',alt:true,f:closeModal}]});}
/* v4.41 균열 보상 표 — 처치 1마리당 기대값 × 분당 처치(내 기록 1분 이상이면 그 값, 아니면 RIFT.kpm 예상). v4.48: 60분 기준 → 한 판(몬스터 RIFT.eN + 균열 상자 1개) 기준.
   강화석/처치 = stoneP × ⌈단계/2⌉ · 도면 = DROP.dsg × dsgK · 비법서 = rcp 확률 · 상자 = 1/eN(상자 강화석 4+2r · 도면 1 · 비법서 1).
   보통 사냥 비교 = 같은 처치 수일 때(STONE_P × ⌈단계/2⌉). */
RIFT.kpm={z4:20,k3:15,e3:12};/* 예상 분당 처치 — v4.41 성장 봇 측정(RIFTPROBE: 열린 직후 120초) 로웬 22.5 · 에르나 12.5, 카르도는 사이 값 */
function riftRecOf(z){if(!S.riftRec)S.riftRec={};return S.riftRec[z]||(S.riftRec[z]={s:0,k:0});}
function riftExp(z){const Z=ZALL[z],r=MAP_REG[Z.map]||1,cur=z===riftZone();let w=0,sn=0,snN=0;
  for(const [sp,l0,l1,n] of Z.mobs){w+=n;sn+=n*Math.ceil(tierOfLv(cur?riftLv():l1+RIFT.lvAdd)/2);snN+=n*Math.ceil(tierOfLv(cur?S.lv:Math.round((l0+l1)/2))/2);}sn/=w||1;snN/=w||1;
  const R=riftRecOf(z),mine=R.s>=60&&R.k>0,kpm=mine?R.k/(R.s/60):RIFT.kpm[z]||12,N=cur?riftNeed():riftNeedOf(Z.map),boxK=1/N;
  const pk={stone:RIFT.stoneP*sn+boxK*RIFT.box.stone(r),dsg:DROP.dsg*RIFT.dsgK+boxK,rcp:RIFT.rcp[r][1]+boxK,box:boxK,eq:DROP.eq*RIFT.eqK,sh:RIFT.shardP+boxK*RIFT.box.shard};
  return {z,r,cur,n:N,lv:Z.mobs[0][1],kpm,mine,pk,stoneM:pk.stone*kpm,stoneN:STONE_P*snN*kpm,dsgH:pk.dsg*kpm*60,rcpH:pk.rcp*kpm*60,boxH:pk.box*kpm*60,eqH:pk.eq*kpm*60,shH:pk.sh*kpm*60,rcpK:RIFT.rcp[r][0],
    runMin:N/kpm,runStone:pk.stone*N,runStoneN:STONE_P*snN*N,runDsg:pk.dsg*N,runRcp:pk.rcp*N,runEq:pk.eq*N,runSh:pk.sh*N,x:pk.stone/(STONE_P*snN||1)};}
/* v4.44 정예 상자 안내 한 줄 — 지역 표에서 바로 만든다 */
function riftBoxTxt(){const pc=x=>Math.round(x*100)+'%',part=r=>{const T=RIFT.box.eq[r];let prev=0,o=[];for(const [g,p] of T){if(g>=3)o.push(GRADES[g].n+' '+pc(p-prev));prev=p;}return MAPS[Object.keys(RIFT.zone).find(m=>(MAP_REG[m]||1)===r)].name+' '+o.reverse().join(' · ');};
  return '균열 상자(균열의 주인 · 한 판에 1개): 장비 1개 확정(희귀 이상 · '+[1,2,3].map(part).join(' / ')+') · 보스 전용 장비 '+pc(RIFT.box.buP)+'(그 레벨대 지역에서 이미 만난 지역 보스 · 컬렉션에 없는 것 먼저) · 강화석 · 도면 · 비법서 · 권능 파편';}
function riftTable(body){const w=el('div','rtab');w.appendChild(el('div','rth','한 판 기대 보상 · 한 판의 몬스터 + 균열 상자 1개 (레벨대별 · 처치당 기대값 × 한 판의 몬스터 수)'));
  const tb=el('table');const hr=el('tr');for(const h of ['레벨대','지금','한 판 · 분당 처치','한 판 강화석','도면','비법서','장비','파편','처치당 강화석'])hr.appendChild(el('th',null,h));tb.appendChild(hr);
  for(const mid in RIFT.zone){const z=RIFT.zone[mid],E=riftExp(z),reach=S.maps.includes(mid)&&S.lv>=E.lv||mid==='rowen',tr=el('tr',(E.cur?'cur ':'')+(reach?'':'lk'));
    const c=[MAPS[mid].name,E.cur?'지금 · Lv '+riftLv():'Lv '+E.lv+(reach?'+':'부터'),E.n+'마리 · '+E.kpm.toFixed(1)+(E.mine?' ✓':''),Math.round(E.runStone)+'',E.runDsg.toFixed(1),E.runRcp.toFixed(1)+' '+STK[E.rcpK].n.split(' ')[0],E.runEq.toFixed(1),E.runSh.toFixed(1),'보통의 ×'+E.x.toFixed(1)];
    for(const v of c)tr.appendChild(el('td',null,v));tb.appendChild(tr);}
  w.appendChild(tb);w.appendChild(el('div','rtn','균열 몬스터 = 내 레벨 +'+RIFT.lvAdd+' · 균열의 주인 = 내 레벨 +'+RIFT.eLv+' · 종과 보상은 내 레벨대를 따른다 · ✓ = 내 기록(1분 이상) · 나머지는 예상 처치 속도'));w.appendChild(el('div','rtn rbox',riftBoxTxt()));body.appendChild(w);}
function riftRow(body){const z=riftZone(),d=el('div','si rift'),nm=el('div','nm'),key=riftKey(),up=riftUp();
  nm.append(el('b',null,'⧗ 시간의 균열'),el('small',null,!key?riftLockMsg():rift?'균열 안 · 몬스터 Lv '+rift.lv+' · '+(riftPend()?'균열의 주인을 쓰러뜨리면 닫힌다':'균열의 주인까지 '+riftLeft())+' · '+mmss(riftStay())+' 뒤 닫힌다'
    :up?'열려 있다 · '+mmss(riftStay())+' 뒤 닫힌다 · 몬스터 Lv '+riftLv()+' · '+(riftPend()?'균열의 주인이 기다린다':'몬스터 '+riftLeft()+'마리 → 균열의 주인')+' → 균열 상자 · 장비 ×2 · 도면 ×2 · 비법서 ×2 · 강화석 ×2 · 권능 파편'
    :'다음 균열까지 '+mmss(riftCd())+' · 닫힌 뒤 '+Math.round(RIFT.every/60)+'분마다 열려 '+Math.round(RIFT.stay/60)+'분 유지된다(플레이 시간 기준)'));
  {const E=riftExp(z);nm.appendChild(el('small','rx','기대 · 분당 처치 '+E.kpm.toFixed(1)+(E.mine?'(내 기록)':'(예상)')+' · 한 판 약 '+E.runMin.toFixed(1)+'분 · 강화석 '+Math.round(E.runStone)+' (같은 처치 수 보통 사냥 '+Math.round(E.runStoneN)+') · 도면 '+E.runDsg.toFixed(1)+' · 비법서 '+E.runRcp.toFixed(1)+' · 장비 '+E.runEq.toFixed(1)+' · 파편 '+E.runSh.toFixed(1)));}d.appendChild(nm);
  const b=el('button','btn pri',rift?'나가기':!key?'잠김':up?'입장':'대기');b.type='button';b.disabled=!key||(!rift&&!up);b.onclick=()=>{if(rift)riftAsk();else riftEnter();};d.appendChild(b);body.appendChild(d);}
function invTick(dt){if(!started)return;if(M.inst){invNext=Math.max(invNext,t+30);return;}/* 전용 공간에는 침공이 없다 */if(!invUnlocked()){invNext=Math.max(invNext,t+60);return;}if(!S.invSeen){S.invSeen=true;banner('침공 개방','Lv '+INV.unlockLv+' 달성 · 잠시 후 첫 침공 보스가 나타난다');save();}if(inv){if(inv.m.dead){inv=null;invNext=t+INV.every;lastQKey='';}else if(t>inv.until){inv.m.dead=true;inv.m.respawn=1e9;inv.m.deadT=1;inv.m.mesh.visible=false;if(target===inv.m)target=null;if(hunt&&hunt.mob===inv.m)hunt=null;toast('침공 보스가 물러갔다');inv=null;invNext=t+INV.every;lastQKey='';}}
  else if(t>=invNext&&!player.dead)invSpawn();}
function offlineSettle(){if(!S.lastSeen||!S.aiZone||!ZALL[S.aiZone])return;const sec=Math.min(12*3600,(Date.now()-S.lastSeen)/1000);if(sec<60)return;const Z=ZALL[S.aiZone],lv0=Z.mobs[0][1],lv1=Z.mobs[Z.mobs.length-1][2],L=Math.round((lv0+lv1)/2),ms=mobStats(L);
  const kills=Math.floor(sec/7*.4),stone=Math.floor(kills*.04),pot=Math.min(S.hpPot,Math.floor(kills/60)),lv0b=S.lv;let xp=0,gold=0;
  for(let k=0;k<kills;k+=50){const n=Math.min(50,kills-k),f=clamp(1-.25*Math.max(0,S.lv-lv1),0,1),gx=Math.round(n*ms.xp*f);xp+=gx;gold+=Math.round(n*ms.gold*Math.max(.3,f));gainXp(gx);}const fx=xp/Math.max(1,kills*ms.xp);
  S.gold+=gold;S.stone+=stone;S.hpPot-=pot;S.kills+=kills;
  const h=Math.floor(sec/3600),mi=Math.floor(sec%3600/60),body=el('div','qbox');body.appendChild(el('b',null,MAPS[Z.map].name+' · '+Z.name+'에서 '+(h?h+'시간 ':'')+mi+'분 동안 사냥했다'));
  const r=el('div','rw');for(const t2 of ['처치 '+fmt(kills),'경험치 +'+fmt(xp)+(fx<.995?' (레벨 차 보정 평균 '+Math.round(fx*100)+'%)':''),'골드 +'+fmt(gold),'강화석 +'+stone,'HP 물약 -'+pot,S.lv>lv0b?'레벨 '+lv0b+' → '+S.lv:''])if(t2)r.appendChild(el('span',null,t2));body.appendChild(r);
  openModal({who:'hero',name:'AI 모드 정산',sub:'접속하지 않은 동안',text:'게임을 닫아 두는 동안 마지막으로 머문 사냥터에서 자동으로 사냥한다. 최대 12시간, 직접 사냥의 40% 효율. 사냥터보다 레벨이 높을수록 경험치가 줄고, 최고 레벨 +4부터는 오르지 않는다.',body,btns:[{t:'확인',pri:true,f:closeModal}]});}

/* ================= 루프 ================= */
let last=0;
function loop(ts){requestAnimationFrame(loop);const now=ts/1000,dt=Math.min(.05,Math.max(0,now-(last||now)));last=now;if(started)update(dt);render();if(started&&!traveling)updateHud(dt);}
window.__g={aqIdle:()=>aqIdle,XQ,XQ_OLD,xqPts,xqTick,xqRw,xqWaveMobs,subSt,mobsAll:()=>mobs,NALL,skBatch,skBatchN,bpHit,gfxMp,gfxFlame,gfxSkR,gfxCd,gfxXhit,gfxHurtK,gfxSave,BP_ZONE,unequip,itemTip,collRegister,COLL,bumpGear,GFX,gearFx,gfx,gfxSum,gfxBasic,gfxAfterBasic,gburnTick,gfxLowAtk,snapCam:()=>snapCam(),AUTOH,gdNow,gdSwap,gdSave,autoRanged,BOSS_GEN,spBusy,mobInfo0,bpFire,bpName,BPAT,BOSS_PAT,bossPat,bossInfo,bpStart,spawnElite,STK_ORDER,stkTip,CURE_K,curePrice,cureImm,cureNeed,useCure,buyCure,cureTick,BUFP,BUF_K,BUF_IDS,useBuf,buyBuf,bufOn,bufTick,bufPrice,inFight,fxHud,openShop,shopId,GRAVE_K,gravePrice,graveHere,graveTake,graveTick,get graveMesh2(){return graveMesh2;},drawMini:()=>drawMini(),mobInfo,mobState,tgtInfo,BDEF,FXBY,pSPD,SPD,basicAttack,castSkill,MOB_BZ,BURST,GUARD,guardOn,playerHit,get npcList(){return npcList;},get anchor(){return anchor;},CHARGE,DODGE,reachOk:(x,y)=>{if(x<8||y<8||x>=WW-8||y>=WH-8)return false;const c=ci(x,y);return !blk[c]&&!!reach[c];},EVADE,mobEvade,apWatch,get apProg(){return apProg;},get target(){return target;},blockedAt:(x,y)=>blockedAt(x,y),los:(a,b,c,d)=>los(a,b,c,d),resetAuto(){dodgeT=0;dodgeOff=0;anchor=null;apPath=null;apFor=null;target=null;apProg=null;},get PLAZA(){return PLAZA;},RANGED,shots,mobShoot,shotTick,usePot,gainXp,mobStats,setAuto(v){auto=!!v;},MOB_B,FXDEF,FX_P,BEHAV,mobB,mobBeh,fxDur,fxP,mobFx,addFx,fxOn,clearStatus,tele,teleAdd,dangerAt,dangerList,TELE_POOL,STAT,enchAid,enchRate,riftBoxTxt,riftBoxGrade,riftBoxSlot,riftBoxBU,fieldBossQs,mainDone,riftPrep,riftKey,riftKeyIdx,riftLockMsg,riftUnlocked,QORDER_445,die,growthGoal,cancelNav,riftPrepGo,riftResupply,riftSpawn,riftLeave,riftName,riftOf,get riftRet(){return riftRet;},get riftCarry(){return riftCarry;},get graceT(){return graceT;},get MAPID(){return MAPID;},get traveling(){return traveling;},riftHud,riftPotCost,riftExp,riftRecOf,riftTable,RIFT_COL,get riftK(){return riftK;},riftFx,riftBtn,openRift,matOfR,RIFT,riftElite,riftEliteOf,riftBox,riftLeft,openWay,get ZONES(){return ZONES;},riftEnter,riftEnd,riftTick,riftOpen,riftZone,riftIn,get rift(){return rift;},riftUp,riftCd,riftStay,riftPend,riftLv,riftFa,riftBaseMap,riftClear,riftExpire,riftAppear,riftChip,riftResp,portalFx,riftAsk,riftNote,riftNeed,riftNeedOf,riftMapNow,riftLeft,closeModal,pScale,get cineT(){return cineT;},get pCine(){return pCine;},winApply,winSet,winReset,winGrp,popFit,WSIZES,kb,kAct,setKey,kbReset,KB_ACTS,openKeyset,get kbCap(){return kbCap;},renderWin,craftMaxN,craftBatch,get cfN(){return cfN;},setCfN(v){cfN=v;},CRAFT_N_MAX,lockSet,unlockAll,autoLockOk,autoLockNew,LOCK_SETS,bulkLockTip,AUTOLOCK_OPT,openLog,acqLog,withAcq,acqMissNew,ACQ_MAX,addItem,dropFrom,applyRw,newItem,bagUi,bagFltOk,bagSortItems,bagEntries,disTarget,encToTarget,encExpect,encTgtOf,openColl,openCraft,killMob,AGGRO,aggroOn,hurtMob,need,xpK,xpGapF,XP_K,XP_GAP,FADE,batchEquip,equipBetterN,QFB,FB_UP,migrateQi,skCan,craftCan,craftCanK,craftCanKT,get qTab(){return qTab;},enchSafe,toggleMenu,craftHint,godHint,openEnchant,enchCheck,enchCost,buyStone,oreKey,dsgKey,stonePrice,collBatchList,collBatch,chooseTrial,faithBreak(){const o={grade:0,ench:0,boss:0,coll:0};for(const sl of SLOTS){const it=S.eq[sl]&&itemById(S.eq[sl]);if(!it)continue;const E=ENCH[it.k];if(it.bu)o.boss+=BU[it.bu].fa;else o.grade+=gradeFaith(it.g,it.t);if(E)o.ench+=it.en;}o.coll=collSum().faith||0;return o;},repGo,acceptRep,claimRep,get qTab(){return qTab;},setQTab(v){qTab=v;lastQKey="";},get trainFor(){return trainFor;},setTarget(m){target=m;},ZALL,isEq,collNeeds,craftTierMax,tierOfLv,CRAFT_EQ,collReg,itemById,collDone,BU,newBU,ZFAITH,faithOut,faithIn,faithR,growthTick,growthProg,isGrowth,fieldBossInfo,ensureFieldBosses,collDoneN,bcollDoneN,SUBQ_G:()=>Object.keys(SUBQ).filter(isGrowth),travelTo,eliteOf,collCand,isBossColl,autoEquipAll,targetSlot,cpScore,betterThanEq,craftMats,ARMOR_K,get win(){return win;},closeWin,get statics(){return statics;},_art:{volumize,rawChar,getSprite0:_getSprite0,getSprite:(...a)=>getSprite(...a),MONSPR,MONSPRL,MONART,CHARART,CHARATK,CHARMETA,charAtk:(...a)=>charAtk(...a),charFace:(...a)=>charFace(...a),get pimg(){return pMesh.userData.img;},get wvis(){return wMesh.visible;},MON_MOVE,monLegged,setVolume,get ART_VOL(){return ART_VOL;}},setVolume,get VOL_ON(){return VOL_ON;},openSettings,get zoom(){return zoom;},get zoomT(){return zoomT;},save,get scene(){return scene;},get G0(){return G0;},MAPS,elevAt,get terrain(){return terrain;},T3,revive,hurtPlayer,INV,goHunt,BAL,STAT,autoBuy,needShop,goTown,get inv(){return inv;},offlineSettle,openGods,openStats,openSkills,setGod(k){S.god=k;},invSpawn,snap(){snapCam();},timers,get t(){return t;},get S(){return S;},player,get mobs(){return mobs;},get nav(){return nav;},get hunt(){return hunt;},get auto(){return auto;},get modal(){return modal;},get map(){return MAPID;},get traveling(){return traveling;},
  get win(){return win;},closeWin,openBag,openCraft,openColl,craftItem,craftCheck,collRegister,collSum,COLL,STK,openSettings,openForge,openShop,addItem,newItem,equipItem,unequip,enchant,disassemble,dropFrom,weightNow,weightMax,wPct,gearSum,itemName,itemStats,cnt,addStk,castSlot,autoOrder,autoSlots,tierOpen,ENH,DROP,GRADES,TIERS,SK,
  questGo,autoNext,openNpc,claimQuest,acceptQuest,claimSub,acceptSub,subGo,doTravel,gateState,cpOf,pStats,autoGrowNow,TB,TB_AT,tbN,tbVal,tbCount,tbNext,hurtPlayer,playerHit,usePot,pSPD,tbSave,tbCast,learnSkill,update,render,step(n,dt){for(let i=0;i<n;i++){update(dt);if(started&&!traveling)updateHud(dt);}},curQ,findPath,QUESTS,SUBQ,gainXp,set autoQ(v){S.autoQ=v;}};

/* ================= 시작 ================= */
async function startGame(fresh){/* v4.35 새 게임이어도 바꾼 단축키는 이어 쓴다(키 설정은 캐릭터가 아니라 사람의 것) */const sv0=fresh?(loadSave()||{}):null,km0=sv0&&sv0.keymap,wu0=sv0&&sv0.winUi;/* v4.36 창 위치 · 크기도 사람의 것 */S=fresh?migrate48(newSave(),true):loadSave()||migrate48(newSave(),true);if(km0)S.keymap=km0;if(wu0)S.winUi=wu0;gearDirty();if(!MAPS[S.map]||MAPS[S.map].inst){S.map='rowen';S.x=MAPS.rowen.plaza.x;S.y=MAPS.rowen.plaza.y+40;}if(S.map!==MAPID){$('loadT').textContent=MAPS[S.map].name+' 지역을 그리는 중…';if(!MAPS[S.map].rt||!MAPS[S.map].rt.built)await buildWorld(S.map,p=>{$('loadT').textContent=MAPS[S.map].name+' 지역을 그리는 중… '+Math.round(p*100)+'%';});bindMap(S.map);showMapOnly();applyLook();}
  const st=pStats();player.hp=st.hp;player.mp=st.mp;
  const ok=!fresh&&!blockedAt(S.x,S.y)&&!Object.values(ZONES).some(z=>z.lv&&inR(z.r,S.x,S.y));player.x=ok?S.x:PLAZA.x;player.y=ok?S.y:PLAZA.y+40;
  started=true;kbRefresh();$('title').hidden=true;$('hud').hidden=false;if(document.body.classList.contains('touch')){joyz.hidden=false;joyEl.hidden=false;joyPos();}
  if(S.cfg&&VOL_OLD[S.cfg.volK]!=null&&!S.cfg.vol482){S.cfg.volK=VOL_OLD[S.cfg.volK];}if(S.cfg&&!S.cfg.vol483){S.cfg.vol=false;S.cfg.vol483=true;S.cfg.vol482=true;}if(S.cfg&&!S.cfg.vol476){S.cfg.vol=true;S.cfg.volK=VOL_LV.보통;S.cfg.vol476=true;}/* v4.76: 새 그림에 양감 — 기본 켬 · 보통(현 요청) */setVolume(!!(S.cfg&&S.cfg.vol===true),S.cfg&&S.cfg.volK||VOL_LV.약);portrait('hero',$('face'),true);setZoom(S.zoom||1);zoom=zoomT;snapCam();curZone='';lastQKey='';stage.focus({preventScroll:true});
  if(fresh)setTimeout(()=>toast('왼쪽 퀘스트를 누르면 목적지로 자동 이동한다'),1200);else offlineSettle();
  /* v4.48 균열 v2: 옛 입장 시간 · 지역별 기록 표시는 쓰지 않는다 — 개방된 세이브는 첫 균열이 바로 열린다(riftTick) */
  delete S.riftT;delete S.riftSeen;if(S.riftCd==null&&S.riftOpenT==null){S.riftEK=0;S.riftEP=0;}else if(S.riftEP&&typeof S.riftEP==='object')S.riftEP=0;pCine=null;cineT=0;
  if(S.routeNote){delete S.routeNote;if(!fresh)setTimeout(()=>toast('퀘스트 순서가 지역 단위로 바뀌었다 · 지나간 재토벌은 끝낸 것으로 하고 보상을 넣었다',true),4200);}
  if(S.riftNote){delete S.riftNote;if(!fresh)setTimeout(()=>toast('원정대는 이미 시간의 균열을 열었다 · 길잡이 표석 · 메뉴 [균열]',true),2400);}
  if(S.migrated48){delete S.migrated48;setTimeout(()=>{banner('v4.8 장비 시스템','강화 단계를 장비로 옮기고 지금 레벨의 장비를 지급했다');toast('가방(I)에서 장비와 마법 주문서를 확인하자',true);},1600);}save();}
$('btnStart').onclick=()=>startGame(true);$('btnCont').onclick=()=>startGame(false);
resize();requestAnimationFrame(loop);
buildMonSprites();
buildWorld('rowen',p=>{$('loadT').textContent='세계를 그리는 중… '+Math.round(p*100)+'%';}).then(()=>{scene.add(G0);applyLook();
  $('loadT').textContent='';$('btnStart').disabled=false;if(loadSave()){$('btnCont').hidden=false;$('btnCont').focus();}else $('btnStart').focus();
  player.x=PLAZA.x;player.y=PLAZA.y+40;snapCam();window.__ready=true;}).catch(e=>{$('loadT').textContent='오류: '+e.message;console.error(e);});
})();
