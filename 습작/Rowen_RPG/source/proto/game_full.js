'use strict';
(function(){
const GAME_VER='v4.63';{const vt=document.getElementById('verTag');if(vt)vt.textContent=GAME_VER;}
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
function flipX(r){const c=mk(r.width,r.height),g=c.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(r,0,0);return c;}
function getSprite(id,dir,walk,f,noArm){
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
function whiteOf(c){const w=mk(c.width,c.height),g=w.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#ffffff';g.fillRect(0,0,w.width,w.height);return w;}
function silOf(c){const w=mk(c.width,c.height),g=w.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#1a1630';g.fillRect(0,0,w.width,w.height);return w;}

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

function buildMonSprites(){
  for(const k of Object.keys(SPECIES)){const d=SPECIES[k];const fs=[0,1,2,3].map(f=>d.form?genMon(d,f):makeMon(k,f%2)),a=fs[0];
    MONSPR[k]=fs;MONSPRL[k]=fs.map(flipX);MONW[k]=whiteOf(a);MONWL[k]=flipX(MONW[k]);MONSIL[k]=silOf(a);}}
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
const _getSprite0=getSprite,VSPR=new Map(),MON_ORIG={},MON_VOL={},MON_VOLL={},MON_ORIGL={};
getSprite=function(id,dir,walk,f,noArm){if(!VOL_ON)return _getSprite0(id,dir,walk,f,noArm);
  const k=VOL_K+id+dir+(walk?'w':'i')+f+(noArm?'n':'');let c=VSPR.get(k);if(c)return c;
  if(dir==='left')c=flipX(getSprite(id,'right',walk,f,noArm));
  else{NOARM=noArm?(dir==='down'?15:dir==='up'?3:'side'):null;c=volumize(rawChar(id,dir,walk,f),{pad:0,k:VOL_K});NOARM=null;}
  VSPR.set(k,c);return c;};
function setVolume(on,k){VOL_ON=!!on;if(k!=null&&k!==VOL_K){VOL_K=k;for(const q in MON_VOL)delete MON_VOL[q];}
  for(const k of Object.keys(MONSPR)){if(!MON_ORIG[k]){MON_ORIG[k]=MONSPR[k];MON_ORIGL[k]=MONSPRL[k];}
    if(on&&!MON_VOL[k]){MON_VOL[k]=MON_ORIG[k].map(c=>{const v=volumize(c,{pad:0,stripOutline:true,k:VOL_K});v.anc=c.anc;return v;});MON_VOLL[k]=MON_VOL[k].map(c=>{const v=flipX(c);v.anc=c.anc;return v;});}
    MONSPR[k]=on?MON_VOL[k]:MON_ORIG[k];MONSPRL[k]=on?MON_VOLL[k]:MON_ORIGL[k];}}
setVolume(false); /* v4.8.3: 원본 도트가 기본 (설정에서 켤 수 있음) */

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
/* v4.8: 장비 합계(gearSum) 반영 · st를 넘기면 미리보기(능력치 창 적용 전→후) */
function pStats(st,noBuff){const L=S.lv,s=st||S.st,G=gearSum(),buff=!noBuff&&t<player.buffT?1+player.buffK:1,fv=!noBuff&&t<player.fervT?player.fervK:0;
  return{atk:Math.round((14+3*(L-1)+2*s.str+G.atk)*buff),def:Math.round(2+1.1*(L-1)+.6*s.vit+G.def),hp:Math.round(120+20*(L-1)+14*s.vit+G.hp),mp:Math.round(50+5*(L-1)+5*s.int+G.mp),
    crit:.10+.005*s.dex+G.crit+fv+(godOn('artemis')?.05+.005*gLv():0),critM:1.6,aspd:1+Math.min(.4,.008*s.dex)+fv,skm:1+.015*s.int+G.skm,faith:G.faith||0};}
function cpOf(st){const s=pStats(st,true),sk=SK.reduce((n,k,i)=>n+skLv(i),0);return Math.round(s.atk*6+s.def*4+s.hp*.6+s.mp*.4+(s.crit-.1)*1200+(s.aspd-1)*750+(s.skm-1)*660+sk*25+S.lv*20+gLv()*45);}
/* v4.8: 장비·신규 스킬로 오른 플레이어 성장만큼 몬스터 공격·체력 상향 (flow_sim으로 물약 압박을 v4.7 수준에 맞춤) */
const BAL={mobAtk:1.4,mobAtkHi:1.75,mobHp:1,mobHpHi:1.65,ramp:[10,24]};
/* 초반(장비가 거의 없는 Lv10 이하)은 v4.7 값 그대로, Lv24까지 장비가 쌓이는 만큼 선형으로 올린다 */
const rampK=L=>clamp((L-BAL.ramp[0])/(BAL.ramp[1]-BAL.ramp[0]),0,1),mobAtkAt=L=>BAL.mobAtk+(BAL.mobAtkHi-BAL.mobAtk)*rampK(L),mobHpAt=L=>BAL.mobHp+(BAL.mobHpHi-BAL.mobHp)*rampK(L);
/* 화면 줌: 마우스 휠 80%~180% (Z키·확대 버튼은 100%↔140%) */
const ZOOM={min:.8,max:1.8,step:1.1};
function mobStats(L,boss){let hp=Math.round((42+30*(L-1)+3.2*(L-1)**2)*mobHpAt(L)),atk=(7+3.6*(L-1))*mobAtkAt(L),def=1+1.3*(L-1),xp=Math.round(12+8*(L-1)+1.2*(L-1)**2),gold=Math.round(4+2.5*(L-1));
  if(boss){hp*=6;atk*=1.2;def*=1.2;xp*=12;gold*=20;}return{hp,atk,def,xp,gold};}
function calcDmg(atk,mul,def,aL,dL){const b=atk*mul*(.92+Math.random()*.16),lf=clamp(1+.05*(aL-dL),.7,1.25);return Math.max(b*.2,b-def)*lf;}
/* v4.10 신앙 요구치: 사냥터(지역)별 · 보스(관문 정예 = 지역 보스, 침공 보스)별. 모자라면 r=신앙/요구 → 주는 피해 ×(0.15+0.85·r²) · 받는 피해 ×(1+0.9·(1−r)) (v4.11) */
const ZFAITH={z1:0,z2:0,z3:0,z4:4,z5:12,k1:28,k2:34,k3:42,k4:52,e1:62,e2:70,e3:80,e4:90},INV_FAITH=10;
const FAITH_K={out0:.15,outP:2,inK:.9};
function faithR(m){const need=m&&m.fa||0;if(need<=0)return 1;return clamp(pStats(null,true).faith/need,0,1);}
const faithOut=m=>{const r=faithR(m);return r>=1?1:FAITH_K.out0+(1-FAITH_K.out0)*r**FAITH_K.outP;},faithIn=m=>{const r=faithR(m);return r>=1?1:1+FAITH_K.inK*(1-r);};
const potPrice=k=>k==='hp'?10+3*S.lv:k==='mp'?12+3*S.lv:30+2*S.lv;
/* v4.1 물약 압박: 보상 물약 없음 · 소지 한도 · 필드 회복 감소 · 사망 경험치 손실 */
const POT_CAP={hp:20,mp:10,scroll:5},POT_LOW={hp:6,mp:3},DEATH_XP=.05;
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
const STK_ORDER=['hp','mp','ret','bls','book_dash','book_roar','book_quake','stone','ore1','ore2','ore3','dw1','da1','dc1','dw2','da2','dc2','dw3','da3','dc3','rcp2','rcp3','rcp4','shard'];
const stonePrice=()=>40+4*S.lv;
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
let gearV=-1,gearC=null;const gearDirty=()=>{gearV=-1;lastQKey='';};
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
const weightMax=()=>1500+25*(S.st.str+S.st.vit)+15*S.lv;
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
const CFG0={scan:'mid',tgt:'quest',order:'slot',counter:true,potAt:.4,autoDis:-1,autoEq:false,autoLock:-1};
function migrate48(S,fresh){if(typeof migrateQi==='function')migrateQi(S);S.cfg=Object.assign({},CFG0,S.cfg||{});if(S.cfg.potAt==null)S.cfg.potAt=.4;
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
  {id:'q7',giver:'orvin',title:'바람 평원으로',type:'kill',subs:['sd1','gc1'],sp:'windfox',n:10,zone:'z3',
    offer:'북문 너머 바람 평원에서 바람여우 떼가 길을 막고 있네.\n열 마리를 물리치게. 녀석들은 먼저 덤벼드니 조심하게.',done:'평원 길이 열렸군.',rw:{xp:420,gold:260,shard:10}},
  {id:'q8',giver:'hans',title:'성난 초원황소',type:'kill',subs:['sd2','gc2'],sp:'bull',n:8,zone:'z3',
    offer:'초원황소들이 사람만 보면 들이받는다네.\n여덟 마리를 진정시켜 주게.',done:'황소들을 진정시켰다니, 대단하군!',rw:{xp:520,gold:320,stone:4}},
  {id:'q9',giver:'orvin',title:'안개 호숫가의 이변',type:'kill',subs:['sd3'],sp:'waterslime',n:10,zone:'z4',
    offer:'북동쪽 호숫가에 물방울슬라임이 끓어오르고 있네.\n열 마리를 잠재워 주게.',done:'슬라임은 줄었지만, 호수 깊은 곳에 무언가 있네.',rw:{xp:800,gold:480,shard:10}},
  {id:'fb1',giver:'orvin',title:'지역 보스 토벌',type:'fboss',boss:'q6',zone:'z2',n:1,
    offer:'숲의 주인이 다시 깨어났다네. 왕멧돼지는 쓰러져도 숲의 기운을 먹고 더 사납게 일어나지.\n호수로 가기 전에 녀석을 한 번 더 잠재워 주게. 녀석이 지닌 장비는 신앙을 키우는 데 쓸모가 있을 걸세.',done:'역시 자네로군. 이제 호수 쪽을 살필 수 있겠어.',rw:{xp: 700, gold: 420, stone: 4, shard: 10}},
  {id:'q10',giver:'orvin',title:'호수의 주인',type:'elite',zone:'z4',subs:['sb3','sb4','rp2','ht1'],gate:{skills:{roar:1,star:2},cp:1750},
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
  {id:'q11',giver:'orvin',title:'잿빛 고원',type:'kill',subs:['sd4','gc3','gc4','gr1'],sp:'emberslime',n:12,zone:'z5',
    offer:'뒤틀림의 근원은 잿빛 고원일세.\n불씨슬라임 열두 마리를 처치하고 길을 트게.',done:'고원 깊은 곳에서 거대한 열기가 느껴지네…\n마그마골렘 군주가 깨어난 게야.',rw:{xp:1500,gold:800,shard:15}},
  {id:'fb2',giver:'hans',title:'지역 보스 토벌',type:'fboss',boss:'q10',zone:'z4',n:1,
    offer:'호수의 주인이 다시 물 위로 올라왔어. 고원으로 가는 길목이 또 막혔네.\n군주와 맞서려면 신앙이 더 필요해. 큰물뱀을 잡아 그 비늘 장비부터 챙겨 오게.',done:'좋아, 이제 고원으로 갈 채비가 됐군.',rw:{xp: 1300, gold: 700, stone: 5, shard: 10}},
  {id:'q12',giver:'orvin',title:'마그마골렘 군주',type:'elite',zone:'z5',subs:['sb5','sb6','gc5','gc6','rp3','fk1'],gate:{skills:{star:3},cp:2250},
    elite:{sp:'magmagolem',lv:16,name:'마그마골렘 군주',hpMul:6,sc:2.3,fa:30,x:400,y:335},
    offer:'고원 북쪽 끝의 마그마골렘 군주를 쓰러뜨리면 로웬의 이변이 멎을 걸세.\n브람과 한스가 채비를 도울 걸세. 붉은 장판이 보이면 반드시 피하게!',done:'해냈군! 로웬의 원정대원이여, 자네 이름은 오래도록 기억될 걸세.',rw:{xp:3000,gold:2000,shard:40,stone:10}},
  {id:'q13',giver:'orvin',title:'협곡 너머 카르도',type:'talk',npc:'karl',
    offer:'남쪽 협곡 너머 카르도에서도 이변이 일어난다는 전갈이 왔네.\n마을의 길잡이 표석으로 카르도에 가서 촌장 카를을 만나게.',done:'로웬의 영웅이 와 주다니! 카르도는 자네를 환영하네.',rw:{xp:600,gold:300},unlock:'kardo'},
  {id:'q14',giver:'karl',title:'자갈 언덕 정리',type:'kill',subs:['sd5'],sp:'goat',n:10,zone:'k1',
    offer:'동쪽 자갈 언덕의 절벽산양들이 광부들을 들이받는다네.\n열 마리를 쫓아 주게.',done:'광부들이 한시름 놓겠군.',rw:{xp:1400,gold:600,stone:4}},
  {id:'q15',giver:'rian',title:'모래도마뱀 소탕',type:'kill',subs:['sd6'],sp:'sandlizard',n:10,zone:'k1',
    offer:'모래도마뱀이 마을 창고를 노리고 있어.\n열 마리를 처리해 줘.',done:'창고가 무사하군. 고맙네.',rw:{xp:1700,gold:700}},
  {id:'fb3',giver:'karl',title:'지역 보스 토벌',type:'fboss',boss:'q12',zone:'z5',n:1,
    offer:'로웬의 마그마골렘 군주가 다시 끓어오른다는 전갈일세. 카르도의 동굴로 가기 전에 뒤를 정리해 두게.\n군주의 갑주는 동굴 파수꾼의 포자를 견디게 해 줄 걸세. 로웬 잿빛 고원으로 다녀오게.',done:'로웬도 이제 안심이겠군. 동굴로 가세.',rw:{xp: 1900, gold: 900, stone: 6, shard: 15}},
  {id:'q16',giver:'karl',title:'동굴의 파수꾼',type:'elite',zone:'k2',subs:['sk1','sk2','gc7','gc8','rp4','ht2'],gate:{skills:{quake:1,roar:2},cp:2950},
    elite:{sp:'cavemush',lv:21,name:'동굴의 파수꾼 · 거대 동굴버섯',hpMul:3,sc:2,fa:40},
    offer:'남쪽 동굴숲 입구를 거대 동굴버섯이 막고 있네.\n도르와 세나를 도와 준비하게. 대지 가르기 정도는 익혀야 포자를 뚫을 수 있을 게야.',done:'파수꾼이 쓰러졌군! 동굴숲 길이 열렸네.',rw:{xp:3500,gold:1200,shard:15}},
  {id:'q17',giver:'karl',title:'갑충 협곡의 소음',type:'kill',subs:['sd7'],sp:'stonebeetle',n:12,zone:'k3',
    offer:'동남쪽 협곡에서 돌갑충들이 밤낮없이 바위를 갉는다네.\n열두 마리를 처리해 주게.',done:'협곡이 조용해졌군.',rw:{xp:3200,gold:1000,stone:5}},
  {id:'q18',giver:'rian',title:'바위게 떼',type:'kill',subs:['sd8'],sp:'rockcrab',n:10,zone:'k3',
    offer:'바위게들이 협곡 길을 막았어. 먼저 덤벼드니 조심해.',done:'길이 뚫렸군!',rw:{xp:3600,gold:1100}},
  {id:'fb4',giver:'rian',title:'지역 보스 토벌',type:'fboss',boss:'q16',zone:'k2',n:1,
    offer:'동굴의 파수꾼이 다시 포자를 뿜고 있어. 협곡의 여왕에게 가기 전에 녀석부터 정리해 줘.\n파수꾼이 떨군 장비로 신앙을 다져 두면 여왕의 열기도 견딜 거야.',done:'좋아, 협곡으로 내려가자.',rw:{xp: 3200, gold: 1100, stone: 6, shard: 15}},
  {id:'q19',giver:'rian',title:'협곡의 여왕',type:'elite',zone:'k3',subs:['sk3','sk4','gc9','gc10','rp5','fk2'],gate:{skills:{quake:2,dash:3},cp:3500},
    elite:{sp:'snail',lv:25,name:'협곡의 여왕 · 등잔달팽이',hpMul:3,sc:2,fa:54},
    offer:'협곡 바닥의 거대 등잔달팽이가 협곡을 달구고 있어.\n모라와 도르가 채비를 도울 거야. 대지 가르기와 돌진을 더 단련해 와.',done:'여왕이 쓰러지니 협곡 바람이 식는군!',rw:{xp:6000,gold:1800,shard:20}},
  {id:'q20',giver:'karl',title:'수정 호숫가',type:'kill',subs:['sd9'],sp:'puffer',n:10,zone:'k4',
    offer:'북쪽 수정 호숫가의 거품복어가 독을 뿜는다네.\n열 마리를 처리해 주게.',done:'호숫가 공기가 맑아졌네. 하지만 수정이 떨고 있어…',rw:{xp:5500,gold:1500,shard:10}},
  {id:'fb5',giver:'karl',title:'지역 보스 토벌',type:'fboss',boss:'q19',zone:'k3',n:1,
    offer:'협곡의 여왕이 다시 등잔불을 켰네. 광석골렘 왕은 그보다 훨씬 강하다네.\n여왕을 한 번 더 쓰러뜨려 협곡을 식히고, 그 장비로 채비를 단단히 하게.',done:'협곡이 식었군. 이제 왕과 맞설 때일세.',rw:{xp: 4800, gold: 1500, stone: 8, shard: 15}},
  {id:'q21',giver:'karl',title:'광석골렘 왕',type:'elite',zone:'k4',subs:['sk5','sk6','gc11','gc12','rp6','lv1'],gate:{skills:{quake:3},cp:3900},
    elite:{sp:'oregolem',lv:28,name:'광석골렘 왕',hpMul:6,sc:2.3,fa:62,x:1500,y:330},
    offer:'호숫가 북동쪽 끝에서 광석골렘 왕이 깨어났네. 카르도 이변의 근원일세.\n세나와 리안이 채비를 도울 걸세.',done:'카르도가 자네에게 큰 빚을 졌네.\n로웬의 오르빈 장로께 이 소식을 전해 주게.',rw:{xp:9000,gold:4000,shard:50,stone:12}},
  {id:'q22',giver:'karl',title:'승전보',type:'talk',npc:'orvin',
    offer:'로웬의 오르빈 장로께 카르도의 승전보를 전해 주게.\n길잡이 표석으로 금방 갈 수 있을 걸세.',done:'두 지역의 이변을 모두 잠재웠군! 자네야말로 진정한 원정대원일세.',rw:{xp:3000,gold:2000,shard:20}},
  {id:'q23',giver:'orvin',title:'불의 땅 에르나',type:'talk',npc:'aila',
    offer:'카르도 너머 화산 지대 에르나에서 땅이 끓어오른다는 소식이네.\n길잡이 표석으로 에르나에 가서 촌장 아일라를 만나 주게.',done:'두 지역의 영웅이로군! 에르나는 지금 자네 같은 사람이 절실하다네.',rw:{xp:3000,gold:1000},unlock:'erna'},
  {id:'q24',giver:'aila',title:'잿가루 언덕의 화산양',type:'kill',subs:['sd10'],sp:'volsheep',n:12,zone:'e1',
    offer:'서쪽 잿가루 언덕의 화산양들이 불붙은 털로 들판을 태우고 있네.\n열두 마리를 진정시켜 주게.',done:'들불이 잦아들었군. 고맙네.',rw:{xp:4200,gold:1600,stone:5}},
  {id:'q25',giver:'taon',title:'유황 결정',type:'collect',sp:'sulfurbeetle',item:'유황 결정',rate:.6,n:8,zone:'e1',
    offer:'유황딱정벌레 등에 붙은 결정으로 마을 방벽을 굳힌다.\n여덟 개를 모아 와.',done:'이 정도면 방벽이 버티겠군.',rw:{xp:4800,gold:1700}},
  {id:'q26',giver:'aila',title:'불티 숲의 정령',type:'kill',subs:['sd11'],sp:'flamewisp',n:12,zone:'e2',
    offer:'더 서쪽 불티 숲에서 불꽃정령들이 날뛰고 있네.\n열둘을 잠재워 주게.',done:'숲의 불길이 약해졌네. 그런데 숲 깊은 곳에서 나무가 울고 있어…',rw:{xp:5700,gold:1900,shard:10}},
  {id:'fb6',giver:'aila',title:'지역 보스 토벌',type:'fboss',boss:'q21',zone:'k4',n:1,
    offer:'카르도에서 광석골렘 왕이 다시 일어났다는 소식이 왔네. 에르나의 거목과 맞서려면 왕의 갑주가 필요할 걸세.\n길잡이 표석으로 카르도 수정 호숫가에 다녀오게.',done:'카르도 사람들이 고마워하더군. 이제 숲의 주인일세.',rw:{xp: 5200, gold: 1800, stone: 8, shard: 15}},
  {id:'q27',giver:'aila',title:'불티 숲의 주인',type:'elite',zone:'e2',subs:['se1','se2','gc13','gc14','rp7','ht3'],gate:{skills:{quake:4,star:5},cp:4850},
    elite:{sp:'embertree',lv:34,name:'불티 숲의 주인 · 거목 불티나무',hpMul:3.2,sc:2.2,fa:78},
    offer:'숲 한가운데 거목 불티나무가 불씨를 뿌리고 있네.\n고로와 하나를 도와 채비를 갖추게. 불씨는 대지 가르기로 끊어 내야 할 걸세.',done:'거목이 쓰러지니 숲이 숨을 쉬는군!',rw:{xp:9000,gold:3000,shard:20}},
  {id:'q28',giver:'taon',title:'용암도마뱀 토벌',type:'kill',subs:['sd12'],sp:'lavalizard',n:12,zone:'e3',
    offer:'북쪽 용암 호수의 용암도마뱀들이 길을 막았다. 먼저 덤벼드니 조심해.\n열두 마리를 처리해.',done:'길이 열렸군. 호수의 열기가 심상치 않아.',rw:{xp:7200,gold:2200}},
  {id:'q29',giver:'aila',title:'흑요석 핵',type:'collect',sp:'obsidiancrab',item:'흑요석 핵',rate:.6,n:6,zone:'e3',
    offer:'흑요석게 몸속의 핵이 화산의 맥을 읽는 열쇠라네.\n여섯 개를 모아 주게.',done:'핵이 떨고 있군… 호수 바닥에 무언가 있네.',rw:{xp:7800,gold:2300,stone:6}},
  {id:'fb7',giver:'taon',title:'지역 보스 토벌',type:'fboss',boss:'q27',zone:'e2',n:1,
    offer:'불티 숲의 주인이 다시 불씨를 뿌린다. 호수의 군주에게 가기 전에 숲부터 꺼.\n거목의 껍질 장비가 군주의 용암을 막아 줄 거다.',done:'숲이 다시 잠잠하군. 호수로 가자.',rw:{xp: 7000, gold: 2200, stone: 8, shard: 20}},
  {id:'q30',giver:'taon',title:'용암 호수의 군주',type:'elite',zone:'e3',subs:['se3','se4','gc15','gc16','rp8','fk3'],gate:{skills:{quake:5,roar:5},cp:5300},
    elite:{sp:'obsidiancrab',lv:37,name:'용암 호수의 군주 · 흑요석 대게',hpMul:3.5,sc:2.2,fa:98,x:1500,y:840},
    offer:'호수 한가운데의 흑요석 대게가 용암을 휘젓고 있다.\n루미와 고로가 채비를 도울 거다. 장비부터 단단히 해.',done:'군주가 가라앉았다! 이제 남은 건 둥지뿐이군.',rw:{xp:12600,gold:3500,shard:25}},
  {id:'q31',giver:'aila',title:'불새 둥지',type:'kill',subs:['sd13'],sp:'phoenix',n:10,zone:'e4',
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
  gc10:{giver:'rian',grow:'coll',n:7,title:'수집가의 길',offer:'컬렉션 일곱 개를 완성하면 카르도 수집가 조합에서 인정해 주지.\n남는 장비는 분해하지 말고 컬렉션에 넣어.',done:'훌륭한 수집가야. 이건 조합의 선물이다.',rw:{xp:2200,stk:{ascB:1}}},
  gc11:{giver:'karl',grow:'bcoll',n:1,title:'지역 보스 토벌 기록',offer:'지역 보스의 유품을 모두 모아 보스 컬렉션 하나를 완성하게.\n쓰러뜨린 보스는 다시 나타나니, 트래커의 「지역 보스」로 찾아가면 된다네.',done:'토벌 기록이 남았군. 광석골렘 왕도 자네를 알아볼 걸세.',rw:{xp:3200,stk:{wscB:1}}},
  gc12:{giver:'karl',grow:'faith',n:62,title:'신앙의 증명 · 카르도',offer:'광석골렘 왕의 몸은 신앙 없이는 흠집도 나지 않네.\n신앙 62에 이르게.',done:'좋아, 이제 왕의 몸에 칼이 들어갈 걸세.',rw:{xp:3200,stk:{rcp3:1}}},
  gc13:{giver:'goro',grow:'craft',g:3,n:1,title:'영웅 장비 제작',give:{rcp3:3,stone:20},offer:'영웅 비법서 세 권이다. 희귀 장비를 재료로 영웅을 두드려 보게. 성공률은 반반이야.',done:'붉게 타오르는군. 에르나의 불도 견딜 걸세.',rw:{xp:4200,stk:{ascB:1}}},
  gc14:{giver:'goro',grow:'ench',k:'armor',en:5,n:4,title:'흑요석 단련',give:{asc:6},offer:'방어구 넷을 +5까지 올려 오게. +5를 넘으면 확률이지만 깨지진 않아.',done:'흑요석처럼 단단해졌군.',rw:{xp:4200,stk:{wscB:1}}},
  gc15:{giver:'taon',grow:'bcoll',n:3,title:'토벌대의 기록',offer:'지역 보스 컬렉션 셋을 완성해. 군주는 토벌 경험이 없는 자를 비웃는다.',done:'세 보스의 유산이군. 전설 비법서를 주지.',rw:{xp:5200,stk:{rcp4:1}}},
  gc16:{giver:'aila',grow:'faith',n:98,title:'신앙의 증명 · 에르나',offer:'용암 호수의 군주는 깊은 신앙만이 꿰뚫을 수 있네.\n신앙 98에 이르게.',done:'호수의 열기가 자네를 피하는군.',rw:{xp:5200,stk:{ascB:1}}},
  gc17:{giver:'aila',grow:'coll',n:11,title:'대수집가',offer:'컬렉션 열하나를 완성하게. 원정대의 전설은 모두 그렇게 시작됐지.',done:'대수집가의 칭호를 내리지.',rw:{xp:6400,stk:{wscB:1}}},
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
/* v4.46 메인에 균열 개방 스토리 3개(rq1~rq3)를 q10 뒤에 끼움 → 순번을 id로 다시 찾는다. qv 3 = 이 순서. 옛 순번(qv 2 = QORDER_445 · 그 전 = QORDER_418)의 id를 지금 QUESTS에서 찾는다.
   · q10을 넘긴 세이브는 스토리를 지난 것으로 본다(균열 열림 — 한 번 알림) · q10 전인데 옛 규칙으로 균열을 써 본 세이브는 riftKey로 계속 열어 둔다 · q11을 지난 세이브에는 '첫 균열 탐사'를 열어 준다 */
function migrateQi(S){const v=S.qv||0;if(v>=3)return;if(S.qi!=null){const id=(v>=2?QORDER_445:QORDER_418)[S.qi];const i=id?QUESTS.findIndex(q=>q.id===id):QUESTS.length;if(i>=0)S.qi=i;
    const k=QUESTS.findIndex(q=>q.id==='rq3'),k11=QUESTS.findIndex(q=>q.id==='q11');
    if(S.qi>k)S.riftNote=1;else if((S.riftK||0)>0)S.riftKey=1;
    if(S.sq&&!S.sq.gr1&&(S.qi>k11||S.qi===k11&&S.qs&&S.qs!=='avail'))S.sq.gr1={st:'avail',n:0};}S.qv=3;}
{let j=0;QUESTS.forEach(q=>{const i=j;if(!q.story)j++;if(q.type==='talk'||q.story)return;const r=MAP_REG[q.type==='fboss'?NALL[q.giver].map:qMap(q)]||1;q.rw.ore=(q.rw.ore||0)+(q.elite?6+4*r:3+2*r);if(q.elite)q.rw.dsg=(q.rw.dsg||0)+2;else if(i%2===0)q.rw.dsg=(q.rw.dsg||0)+1;});}
for(const id of ['gc1','gc4','gc8','gc13']){const q=SUBQ[id];q.give=q.give||{};const r=id==='gc13'?3:id==='gc8'?2:1;q.give['ore'+r]=(q.give['ore'+r]||0)+(id==='gc1'?8:id==='gc4'?10:20);q.give.dsgAny=(id==='gc1'?2:1);if(q.give.stone){delete q.give.stone;}}

/* ================= 저장 ================= */
const SAVE_KEY='rowen-mmo-v4'; /* v4.8도 같은 키 — loadSave에서 migrate48로 이전 */
let S=null;
const newSave=()=>({map:'rowen',maps:['rowen'],lv:1,xp:0,gold:60,hpPot:5,mpPot:3,scroll:2,autoBuy:true,autoRet:false,wlv:0,alv:0,wfail:0,afail:0,stone:3,shard:0,
  st:{str:0,vit:0,dex:0,int:0},sp:0,kp:0,sk:{},books:{},autoGrow:false,
  god:null,godLv:{zeus:1,athena:1,artemis:1},qi:0,qs:'avail',qn:0,sq:{},rep:null,autoQ:false,autoPot:true,x:960,y:1700,kills:0,lastSeen:0,aiZone:null});
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
function setSpr(m,img,x,y,sc=1,lift=0,tint){if(m.userData.img!==img||m.userData.tint!==!!tint){m.material=tint?matOfR(img):matOf(img);m.customDepthMaterial=depthOf(img);m.userData.img=img;m.userData.tint=!!tint;}m.scale.set(img.width*sc,img.height*sc*VS,1);m.position.set(x,elevAt(x,y)+lift,y);}

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
const pMesh=spriteMesh(),graveMesh=spriteMesh(),wMesh=new T3.Mesh(WGEO,matOf(STUMP));wMesh.castShadow=true;wMesh.visible=false;scene.add(wMesh);
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
function autoGrowNow(){let n=0;while(S.sp>0){const k=REC[(S.st.str+S.st.vit+S.st.dex+S.st.int)%REC.length];S.st[k]++;S.sp--;n++;}
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
function useBook(k,silent){const id=STK[k].book;if(!cnt(k))return false;if(S.books[id]){if(!silent)toast('이미 익힌 스킬서다');return false;}setCnt(k,cnt(k)-1);S.books[id]=true;if(!silent)toast('스킬서 사용 · '+SK[skIdx(id)].name+'을(를) 배울 수 있다 (K)',true);lastQKey='';save();return true;}

/* ================= 전투 ================= */
/* 침공 보스는 직접 노린 경우에만 피해 — 사냥 중 범위 스킬로 실수로 끌어오지 않게 */
const invShielded=m=>(m.inv||m.field)&&!m.aggro&&target!==m&&!(hunt&&hunt.mob===m)&&!(chase===m);
function hurtMob(m,dmg,crit){if(!alive(m)||invShielded(m))return;const fk=faithOut(m);if(fk<1){dmg*=fk;toastThr('신앙 부족 '+pStats(null,true).faith+' / '+m.fa+' · 주는 피해 '+Math.round(fk*100)+'% · 받는 피해 +'+Math.round((faithIn(m)-1)*100)+'%');}if(m.stag>t)dmg*=CHARGE.stagK;/* v4.54 돌진 빗나감 경직 중 받는 피해 +30% */if(m.bst)dmg*=(mobB(m)||{}).dk||BURST.dk;/* v4.59 부풀기 중 받는 피해 ×dk — 남은 체력 25%가 0.6초 안에 깎여 폭발이 한 번도 안 나던 것 */m.hp-=dmg;m.hit=.16;m.aggro=true;m.ret=false;m.evd=false;m.evU=0;floatTxt(m.x,m.y,(crit?'치명 ':'')+Math.round(dmg),crit?'#ffe066':'#fff4dc',crit);
  burst(m.x,m.y,12*m.sc,crit?'#ffe08a':'#fff0d0',crit?10:5,50);if(m.hp<=0)killMob(m);}
function playerHit(m,mul,skill){const st=pStats(),crit=Math.random()<st.crit,d=calcDmg(st.atk,mul*(crit?st.critM:1)*(skill?st.skm:1),m.def,S.lv,m.lv);if(!alive(m)||invShielded(m))return 0;const gk=guardOn(m)?(skill?GUARD.skK:GUARD.baK):1;/* v4.58 방어 태세: 평타 −70% · 스킬 −30% */if(gk<1){STAT.guardHit=(STAT.guardHit||0)+1;if(Math.random()<.35)floatTxt(m.x,m.y-4,'막음','#9ac8ff');}hurtMob(m,d*gk,crit);return d*gk;}
/* 무게 82% 이상: 공격·스킬 불가 (리니지) */
const tooHeavy=()=>wPct()>=.82;
function heavyBlock(silent){if(!tooHeavy())return false;if(!silent)toastThr('무게 '+Math.round(wPct()*100)+'% · 82% 이상이면 공격할 수 없다 — 가방(I)에서 분해하자');return true;}
function killMob(m){if(m.bst){m.bst=null;STAT.bstKill=(STAT.bstKill||0)+1;}/* v4.59 부풀기 중 처치 → 폭발 없음 */m.dead=true;m.deadT=0;m.hp=0;m.respawn=m.field?FIELD_RESP:m.boss||m.riftBoss?1e9:m.rift?riftResp():9;const inRift=riftHas(m);if(target===m)target=null;if(chase===m)chase=null;S.kills++;m.aoe=null;
  if(Math.random()<(inRift?RIFT.stoneP:STONE_P)||m.boss){const n0=S.stone;const n=m.boss?(m.inv||m.field?3:6):Math.ceil(tierOfLv(m.lv)/2);S.stone+=n;if(inRift)rift.stone+=S.stone-n0;floatTxt(m.x,m.y-14,'+강화석 '+n,'#9ee6ff');}
  dropFrom(m);if(inRift)riftLoot(m);
  if(m.boss){const sh=m.inv?20:m.field?5:15;S.shard+=sh;floatTxt(m.x,m.y-22,'+권능 파편 '+sh,'#ffe08a');if(m.inv){toast('침공 보스 토벌! 권능 파편 +'+sh+' · 강화석 +3',true);inv=null;invNext=t+INV.every;lastQKey='';}}
  const gx=Math.round(m.xp*xpGapF(m.lv));gainXp(gx);STAT.killXp=(STAT.killXp||0)+gx;S.gold+=m.gold;STAT.killG+=m.gold;floatTxt(m.x,m.y-6,'+'+gx+' EXP',gx<m.xp?'#a89cc0':'#d8b8ff');floatTxt(player.x,player.y,'+'+m.gold+' G','#ffd76a');
  for(let i=0;i<6;i++)spawnP(m.x,m.y,8,{col:'#ffd860',vx:rand(-30,30),vy:rand(-20,20),vz:rand(60,110),g:-260,life:.7,size:3});
  burst(m.x,m.y,10*m.sc,'#f0e8ff',m.boss?40:12,m.boss?120:60,m.boss?7:4);
  progressKill(m);if(m.field&&S.autoQ)later(1.5,()=>{if(!modal&&!player.dead&&!nav)autoGo();});if(m.field){toast('지역 보스 토벌 · '+m.name+' — '+Math.round(FIELD_RESP/60*10)/10+'분 뒤 다시 나타난다',true);lastQKey='';}else if(m.eliteOf)banner('관문 돌파',m.name+'을(를) 쓰러뜨렸다');}
function hurtPlayer(dmg,src){if(player.dead||player.dash)return;if(src&&src.fa)dmg*=faithIn(src);if(godOn('athena')&&src&&alive(src))hurtMob(src,dmg*(.2+.02*gLv()),false);
  if(t<player.guardT)dmg*=1-guardK();
  if(player.shield>0){const a=Math.min(player.shield,dmg);player.shield-=a;dmg-=a;if(dmg<=0){floatTxt(player.x,player.y,'흡수','#a8d4ff');player.lastHit=t;return;}}player.hp-=dmg;player.lastHit=t;player.hurt=.35;floatTxt(player.x,player.y,'-'+Math.round(dmg),'#ff7a6a');
  if(player.hp<=0){player.hp=0;die(src);}}
/* 사망: 쓰러지는 연출 → 1.3초 뒤 사망 팝업 → '부활하기'를 눌러야 마을에서 부활 */
function die(src){if(win)closeWin();clearStatus();tele.length=0;shots.length=0;STAT.deaths++;const lost=Math.min(S.xp,Math.round(need(S.lv)*DEATH_XP));S.xp-=lost;STAT.xpLost+=lost;player.dead=true;player.deadT=t;auto=false;hunt=null;nav=null;chase=null;target=null;moveRing.visible=false;
  for(const m of mobs){m.aggro=false;m.ret=true;}document.body.classList.add('dead');save();
  const by=src&&src.name?src.name:null,where=curZone&&ZONES[curZone]?ZONES[curZone].name:M.name,vill=(M.inst&&riftRet?MAPS[riftRet.map].zones:ZONES).village.name;
  later(1.3,()=>{if(!player.dead)return;openModal({who:'hero',name:'사망했습니다',sub:where+(by?' · '+by+'에게 쓰러짐':''),
    text:'눈앞이 흐려진다…\n'+vill+'의 등불 아래에서 다시 일어설 수 있다.'+(M.inst&&riftUp()?'\n시간의 균열은 아직 열려 있다 · '+mmss(riftStay())+' 뒤 닫힌다 (진행은 남는다)':'')+(lost?'\n\n경험치 -'+fmt(lost)+' (현재 레벨의 '+Math.round(DEATH_XP*100)+'%)':''),
    btns:[{t:'부활하기',pri:true,f:()=>{revive();closeModal();}}],noFocus:true,lock:.8});});}
function revive(){if(!player.dead)return;if(M.inst){/* v4.46 균열 안에서 쓰러지면 들어온 지역의 마을에서 일어난다 */if(!traveling)doTravel(riftRet?riftRet.map:'rowen',revive,{quiet:true,now:true,label:'마을로 돌아가는 중…'});return;}document.body.classList.remove('dead');clearStatus();const st=pStats();player.dead=false;player.hp=st.hp;player.mp=st.mp;player.x=PLAZA.x;player.y=PLAZA.y+40;snapCam();save();if(S.autoQ)later(1.2,()=>{if(!modal&&!nav&&!hunt)autoGo();});}
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
function usePot(k,silent){const st=pStats();if(player.dead||t<player.potT)return false;if(k==='hp'){if(!S.hpPot){if(!silent)toast('HP 물약이 없다');return false;}if(player.hp>=st.hp)return false;S.hpPot--;STAT.hpUse++;if(S.hpPot===POT_LOW.hp-1||S.hpPot===2)toast('HP 물약 '+S.hpPot+'개 남음 · 마을 상점에서 보충',true);else if(!S.hpPot)toast('HP 물약이 떨어졌다!',true);const v=Math.max(60,st.hp*.35)*(fxOn('poison')?FXDEF.poison.potK:1);player.hp=Math.min(st.hp,player.hp+v);floatTxt(player.x,player.y,'+'+Math.round(v),'#8ef07a');}
  else{if(!S.mpPot){if(!silent)toast('MP 물약이 없다');return false;}if(player.mp>=st.mp)return false;S.mpPot--;STAT.mpUse++;const v=Math.max(30,st.mp*.4);player.mp=Math.min(st.mp,player.mp+v);floatTxt(player.x,player.y,'+'+Math.round(v)+' MP','#8ac8ff');}
  player.potT=t+2.2;burst(player.x,player.y,14,k==='hp'?'#ff8a7a':'#8ac8ff',10,30,3);return true;}
function faceTo(x,y){const dx=x-player.x,dy=y-player.y;if(Math.abs(dx)>Math.abs(dy)*.8){player.dir=dx<0?'left':'right';}else player.dir=dy<0?'up':'down';if(Math.abs(dx)>2)player.face=dx<0?-1:1;}
function inRange(m,r){return dist(player,m)<=r+6*m.sc;}
function basicAttack(m){if(!alive(m)||player.atkT>0||player.dash||fxOn('stun'))return false;if(heavyBlock())return false;if(!inRange(m,basicRange()))return false;faceTo(m.x,m.y);player.atkT=.62/pStats().aspd;player.swing=.001;player.swingTgt=m;
  if(godOn('artemis')){streak(player.x,player.y,m.x,m.y,'#d8ffc8');return true;}
  fxMesh(FX_SLASH,'#fff0c0',{max:.22,up:(mm,k)=>{mm.scale.set(36*player.face*(1+k*.3),24*(1+k*.2),1);mm.position.set(player.x+player.face*10,elevAt(player.x,player.y)+16,player.y+2);mm.material.opacity=1-k;}});return true;}
function castSkill(i,silent){const s=SK[i];if(!s||player.dead||player.dash)return false;if(fxOn('stun')){if(!silent)toast('기절 중');return false;}
  if(!skLv(i)){if(!silent)toast(s.book&&!S.books[s.id]?s.name+' · 스킬서가 필요하다 (서브 퀘스트)':S.lv<s.req?s.name+' · Lv '+s.req+'부터 배울 수 있다':s.name+' · 스킬 창(K)에서 배우자');return false;}
  if(player.cd[i]>t){if(!silent)toast('재사용 대기 중');return false;}if(player.mp<s.mp){if(!silent)toast('MP가 부족하다');return false;}if(heavyBlock(silent))return false;const mul=skMul(i),id=s.id;
  if(id==='whirl'||id==='flame'){player.mp-=s.mp;player.cd[i]=t+s.cd;player.atkT=Math.max(player.atkT,.35);player.swing=.001;player.spin=.4;const ath=id==='whirl'&&godOn('athena'),rr=s.r+(ath?10:0),fl=id==='flame';if(ath){player.shield=Math.max(player.shield,pStats().hp*(.10+.015*gLv()));player.shT=8;floatTxt(player.x,player.y,'보호막','#a8d4ff');}
    for(const m of mobs)if(alive(m)&&dist(player,m)<rr+8*m.sc)playerHit(m,mul,true);
    fxMesh(FX_RING,fl?'#ff7a3a':'#ffe8a0',{geo:DGEO,max:fl?.55:.4,up:(mm,k)=>{const r=(s.r*2)*(.5+k*.7);mm.scale.set(r,1,r*.92);mm.position.set(player.x,elevAt(player.x,player.y)+1,player.y);mm.material.opacity=1-k;}});
    if(fl){fxMesh(FX_DISC,'#ff5a20',{geo:DGEO,max:.5,up:(q,k)=>{const r=s.r*2*(.4+k*.7);q.scale.set(r,1,r*.9);q.position.set(player.x,elevAt(player.x,player.y)+1.2,player.y);q.material.opacity=.8*(1-k);}});}
    for(let a=0;a<(fl?28:18);a++){const an=a/(fl?28:18)*6.283;spawnP(player.x+Math.cos(an)*s.r*.7,player.y+Math.sin(an)*s.r*.5,10,{col:fl?(a%2?'#ff8a3a':'#ffd060'):'#fff0b0',vx:-Math.sin(an)*90,vy:Math.cos(an)*50,vz:fl?40:10,life:fl?.5:.35,size:fl?5:4});}return true;}
  if(s.kind==='buff'){player.mp-=s.mp;player.cd[i]=t+s.cd;
    if(id==='roar'){player.buffT=t+s.buff;player.buffK=roarK();floatTxt(player.x,player.y,'전투 함성 · 공격력 +'+Math.round(roarK()*100)+'%','#ffb070',true);burst(player.x,player.y,18,'#ff9a4a',30,90,5);}
    else if(id==='guard'){player.guardT=t+s.buff;floatTxt(player.x,player.y,'바위 껍질 · 받는 피해 -'+Math.round(guardK()*100)+'%','#c8b890',true);burst(player.x,player.y,16,'#b8a070',26,70,5);}
    else{player.fervT=t+s.buff;player.fervK=fervK();floatTxt(player.x,player.y,'전장의 기운 · 치명·공속 +'+Math.round(fervK()*100)+'%','#ff8ad8',true);burst(player.x,player.y,18,'#ff6ac8',30,90,5);}
    const col=id==='roar'?'#ff9a4a':id==='guard'?'#c8b070':'#ff6ac8';fxMesh(FX_RING,col,{geo:DGEO,max:.6,up:(mm,k)=>{const r=30+k*90;mm.scale.set(r,1,r*.9);mm.position.set(player.x,elevAt(player.x,player.y)+1,player.y);mm.material.opacity=1-k;}});return true;}
  const m=alive(target)?target:nearestMob(s.range,null);if(!m||dist(player,m)>s.range+8*m.sc){if(!silent)toast('대상이 사거리 밖에 있다');return false;}
  player.mp-=s.mp;player.cd[i]=t+s.cd;target=m;faceTo(m.x,m.y);
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
const SPD=82;const pSPD=()=>SPD*(fxOn('slow')?FXDEF.slow.mv:1);/* v4.62 둔화: 이동 −40% */
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
function qGoal(q,n){if(q.grow)return growthGoal(q,S.sq[q.id]);if(q.type==='rep')return MAPS[q.map].name+' 토벌 의뢰 '+Math.min(n,q.n)+'/'+q.n+'회';if(q.type==='lv')return '레벨 '+Math.min(S.lv,q.n)+'/'+q.n;if(q.type==='hunt')return ZALL[q.zone].name+' 몬스터 '+n+'/'+q.n;if(q.type==='fbk')return MAPS[q.map].name+' 지역 보스 '+n+'/'+q.n;if(q.type==='fboss')return QFB(q).elite.name+' 처치 '+Math.min(n,q.n)+'/'+q.n;if(q.type==='talk')return npcName(q.npc)+'와(과) 대화';if(q.type==='collect')return q.item+' '+n+'/'+q.n;if(q.type==='elite')return q.elite.name+' 처치';
  if(q.type==='zone')return ZALL[q.zone].name+' 몬스터 '+n+'/'+q.n;return SPECIES[q.sp].name+' '+n+'/'+q.n;}
function rwList(rw){const a=[];if(rw.god)a.push('권능 「'+GODS[rw.god].name+' · '+GODS[rw.god].title+'」');if(rw.xp)a.push('경험치 '+fmt(rw.xp));if(rw.gold)a.push('골드 '+fmt(rw.gold));if(rw.book)a.push('스킬서 「'+SK[skIdx(rw.book)].name+'」');if(rw.stat)a.push('능력치 포인트 +'+rw.stat);if(rw.kp)a.push('스킬 포인트 +'+rw.kp);
  if(rw.ore)a.push(STK['ore'+(MAP_REG[MAPID]||1)].n+' '+rw.ore);if(rw.dsg)a.push('장비 도면 '+rw.dsg+'장');if(rw.stk)for(const k in rw.stk)a.push(STK[k].n+' '+rw.stk[k]);if(rw.wup)a.push('무기 강화 +1');if(rw.aup)a.push('갑옷 강화 +1');if(rw.stone)a.push('강화석 '+rw.stone);if(rw.shard)a.push('권능 파편 '+rw.shard);if(rw.hp)a.push('HP 물약 '+rw.hp);if(rw.mp)a.push('MP 물약 '+rw.mp);return a;}
function applyRw(rw,src){return withAcq(src||'보상',acqZoneOf(null),()=>applyRw0(rw));}
function applyRw0(rw){gainXp(rw.xp||0);S.gold+=rw.gold||0;STAT.rwG+=rw.gold||0;S.hpPot+=rw.hp||0;S.mpPot+=rw.mp||0;S.stone+=rw.stone||0;S.shard+=rw.shard||0;S.sp+=rw.stat||0;S.kp+=rw.kp||0;if(rw.wup&&!enchantEquipped('weapon'))toast('장착한 무기가 없거나 최대 강화라 무기 마법 주문서로 받았다',true);if(rw.aup&&!enchantEquipped('armor'))toast('장착한 갑옷이 없거나 최대 강화라 갑옷 마법 주문서로 받았다',true);if(rw.book)addStk('book_'+rw.book,1);if(rw.stk)for(const k in rw.stk)addStk(k,rw.stk[k]);if(rw.ore)addStk('ore'+(MAP_REG[MAPID]||1),rw.ore);if(rw.dsg)for(let i=0;i<rw.dsg;i++)addStk(dsgRand(MAP_REG[MAPID]||1),1);if(rw.god)gainGod(rw.god);
  toast('보상 · '+rwList(rw).join(' · '),true);burst(player.x,player.y,16,'#ffe08a',30,80,4);if(S.autoGrow&&(rw.stat||rw.kp||rw.book))autoGrowNow();lastQKey='';}
function progressKill(m){if(m.rift){lastQKey='';return;}/* v4.46 균열 전용 공간의 처치는 메인 · 서브 · 반복 의뢰에 들지 않는다 */const q=curQ();
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
  if(s.st==='active'){const z=q.zone;const mid=ZALL[z].map;const go=()=>{if(inR(ZONES[z].r,player.x,player.y,40))startHunt(z,q.sp,null,id);else if(navTo('zone',z,ZONES[z].name+'(으)로 · '+q.title))nav.hunt={zone:z,sp:q.sp,sub:id};};
    if(mid!==MAPID)return travelTo(mid,go);go();}}
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
function stopAutoQ(){trainFor=null;if(!S.autoQ)return;S.autoQ=false;toast('수동 조작 · 퀘스트 자동 진행 끔');save();}
function autoNext(){if(player.dead||modal)return;if(needShop()&&shopGo())return;const q=curQ();
  if(S.qs==='done')return questGo();const sd=Object.keys(S.sq).find(id=>S.sq[id].st==='done');if(sd)return subGo(sd);if(S.rq&&S.rq.st==='done')return repGo();
  /* v4.17 반복 의뢰는 플레이어가 고른다: 받은 의뢰는 끝까지, [반복] 켜면 계속 다시 받는다 */
  if(S.rq&&S.rq.st==='active')return repGo();if(S.repLoop&&S.lv>=REP.lv)return repGo(S.repLoop);
  /* 플레이어가 수락한 신의 시련은 자동 진행이 이어서 한다 (수락은 직접) */
  const tr=TRIALS.find(id=>(S.sq[id]||{}).st==='active');if(tr&&S.qs!=='active'||tr&&q.type!=='elite')return subGo(tr);
  if(S.qs==='active'&&q.type==='elite'){const g=gateState(q);if(!g.ok){const nx=(q.subs||[]).find(id=>subSt(id)!=='clear'&&!(isGrowth(id)&&subSt(id)==='active'));if(nx)return subGo(nx);if(S.autoGrow)autoGrowNow();if(!gateState(q).ok){growHint();/* 전투력·성장·대기 — 같은 지역 수련 사냥 (서브 밖 반복 의뢰는 플레이어가 고른다) */trainFor=q.id;return goHunt(q.zone,null,null,ZONES[q.zone]?ZONES[q.zone].name+'(으)로 · 수련 사냥':'수련 사냥');}}}
  /* 일반 메인의 곁가지 서브: 자동 진행이 먼저 끝낸다 */
  if(S.qs==='active'&&q.type!=='elite'){const sx=(q.subs||[]).find(id=>{const st=subSt(id);return st==='avail'||st==='active'&&!isGrowth(id);});if(sx)return subGo(sx);}
  questGo();}
function acceptQuest(){const q=curQ();S.qs='active';S.qn=0;if(q.rep)S.rep={zone:q.zone};if(q.unlock&&!S.maps.includes(q.unlock)){S.maps.push(q.unlock);banner('새 지역',MAPS[q.unlock].name+' · 길잡이 표석으로 이동 가능');for(const n of [2,3])if(SK_TIER[n].map===q.unlock&&tierOpen(n))toast(SK_TIER[n].n+' 스킬이 열렸다 · 스킬 수련 창(K)',true);}
  if(q.subs){for(const id of q.subs)if(!S.sq[id])S.sq[id]={st:'avail',n:0};toast((q.gate?'관문 퀘스트 · ':'')+'서브 퀘스트 '+q.subs.length+'개가 열렸다',true);}
  toast('퀘스트 수락 · '+q.title);save();lastQKey='';closeModal();if(S.autoQ)later(.5,autoGo);}
function claimQuest(){const q=curQ();if(S.qs!=='done')return;anchor=null;hunt=null;applyRw(q.rw,'메인 「'+q.title+'」');
  if(q.rep)S.rep=null;else S.qi++;S.qs='avail';S.qn=0;save();lastQKey='';const nq=curQ(),here=modal&&modal.npc;closeModal();
  if(S.qi===QUESTS.length&&!q.rep)banner('메인 퀘스트 완료','이제 경비대의 토벌 의뢰를 반복할 수 있다');if(q.id==='rq3')riftUnlocked();if(q.id==='q5'&&openTrials())return;/* 시련 선택 창이 먼저 — 고를 때까지 자동 진행 대기 */
  if(here&&nq.giver===here){openNpc(here);return;}if(S.autoQ)later(.6,autoGo);}
function acceptSub(id){S.sq[id].st='active';S.sq[id].n=0;toast('서브 수락 · '+SUBQ[id].title);const gv=SUBQ[id].give;if(gv)withAcq('수락 지급 「'+SUBQ[id].title+'」',acqZoneOf(null),()=>{const a=[];for(const k in gv){if(k==='stone')S.stone+=gv[k];else if(k==='gold')S.gold+=gv[k];else if(k==='dsgAny'){for(let i=0;i<gv[k];i++)addStk(dsgRand(MAP_REG[MAPID]||1),1);}else addStk(k,gv[k]);a.push((k==='stone'?'강화석':k==='gold'?'골드':k==='dsgAny'?'장비 도면':STK[k].n)+' '+gv[k]);}toast('지급 · '+a.join(' · '),true);});if(SUBQ[id].grow)growthTick();save();lastQKey='';closeModal();if(S.autoQ)later(.5,autoGo);}
function claimSub(id){const s=S.sq[id];if(!s||s.st!=='done')return;anchor=null;hunt=null;s.st='clear';applyRw(SUBQ[id].rw,(isGrowth(id)?'성장 「':'서브 「')+SUBQ[id].title+'」');const rw=SUBQ[id].rw;
  if(rw.book)toast('스킬서 「'+SK[skIdx(rw.book)].name+'」 · 가방(I)에서 사용하면 배울 수 있다',true);if(rw.stat||rw.kp)toast('능력치·스킬 포인트가 늘었다 · C · K',true);save();lastQKey='';const here=modal&&modal.npc;closeModal();
  const q=curQ();if(q.gate&&S.qs==='active'&&gateState(q).ok)banner('관문 조건 충족',q.title+' · 정예에게 도전할 수 있다');
  if(SUBQ[id].trial&&TRIALS.some(x=>subSt(x)==='avail'&&trialReady(x)))toast('다음 신의 시련을 고를 수 있다 · 퀘스트 [시련] 탭',true);
  if(here){const more=Object.keys(S.sq).find(k=>S.sq[k].st!=='clear'&&SUBQ[k].giver===here&&S.sq[k].st!=='active'&&!(S.autoQ&&SUBQ[k].trial&&S.sq[k].st==='avail'));if(more){openNpc(here);return;}}if(S.autoQ)later(.6,autoGo);}

/* ================= 대화창 ================= */
function portrait(id,el,head){el.replaceChildren();const c=mk(22,head?22:34);c.getContext('2d').drawImage(getSprite(id,'down',false,0),0,0);el.appendChild(c);}
function openModal(o){modal=o;$('modal').hidden=false;portrait(o.who,$('dlgF'));$('dlgN').innerHTML='';$('dlgN').append(o.name);if(o.sub){const s=document.createElement('small');s.textContent=o.sub;$('dlgN').appendChild(s);}
  const B=$('dlgB');B.replaceChildren();if(o.text){const p=document.createElement('p');p.textContent=o.text;B.appendChild(p);}if(o.body)B.appendChild(o.body);
  const A=$('dlgA');A.replaceChildren();let first=null;for(const b of o.btns||[]){const e=document.createElement('button');e.type='button';e.className='btn'+(b.pri?' pri':b.alt?' alt':'');e.textContent=b.t;if(b.dis)e.disabled=true;e.onclick=()=>{b.f();};A.appendChild(e);if(!first&&b.pri)first=e;}
  if(o.autoBtn)later(1.1,()=>{if(modal===o)o.autoBtn();});if(o.autoClose)later(o.autoClose,()=>{if(modal===o)closeModal();});
  if(o.lock){const bs=[...A.children];bs.forEach(b=>b.disabled=true);setTimeout(()=>{if(modal===o)bs.forEach(b=>b.disabled=false);},o.lock*1000);}
  if(!o.noFocus)(first||A.firstChild)?.focus({preventScroll:true});else A.blur&&document.activeElement&&document.activeElement.blur();}
function closeModal(){modal=null;$('modal').hidden=true;stage.focus({preventScroll:true});}
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
function qbox(q,kind,withRw){const d=el('div','qbox');d.appendChild(el('b',null,(kind==='sub'?'[서브] ':q.rep?'[반복] ':q.gate?'[관문] ':q.type==='fboss'?'[지역 보스] ':'[메인] ')+q.title));
  const goal=q.grow?growthGoal(q,S.sq[q.id])+' · '+GROW_HOW[q.grow]+' (직접 진행)':q.type==='rep'||q.type==='lv'||q.type==='hunt'||q.type==='fbk'?qGoal(q,(S.sq[q.id]||{}).n||0)+(q.type==='rep'?' · '+npcName(guardOf(q.map))+'의 반복 의뢰 (몇 번이고 다시 받을 수 있다)':q.type==='lv'?' · 사냥·토벌 의뢰로 레벨 업':''):q.type==='talk'?npcName(q.npc)+'와(과) 대화'+(NALL[q.npc].map!==MAPID?' ('+MAPS[NALL[q.npc].map].name+')':''):q.type==='collect'?SPECIES[q.sp].name+'에게서 '+q.item+' '+q.n+'개':q.type==='zone'?ZALL[q.zone].name+' 몬스터 '+q.n+'마리':q.type==='elite'?q.elite.name+' 처치':q.type==='fboss'?QFB(q).elite.name+' (지역 보스 · Lv '+(QFB(q).elite.lv+FB_UP.lv)+') 처치 · 보스 전용 장비 확정':SPECIES[q.sp].name+' '+q.n+'마리';
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
  for(const n of npcList)if(!n.deco)test(n,n.way?22:16);for(const m of mobs)if(alive(m))test(m,MONSPR[m.sp][0].height*m.sc*.5);return best;}
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
function openWin(o){stopHold();if(win&&win.id==='bag'&&o.id!=='bag')for(const it of S.items)delete it.nw;if(modal&&!player.dead)closeModal();hideTip();document.querySelectorAll('.encfx').forEach(e=>e.remove());kbCap=null;const g0=win&&winGrp(win);win=o;$('win').hidden=false;$('win').dataset.id=o.id;renderWin();if(g0!==winGrp(o))winApply();}
function closeWin(){stopHold();kbCap=null;if(!win)return;if(win.id==='bag')for(const it of S.items)delete it.nw;win=null;$('win').hidden=true;hideTip();stage.focus({preventScroll:true});lastQKey='';}
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
  const hc=mk(22,34);hc.getContext('2d').drawImage(getSprite('hero','down',false,0),0,0);hc.className='hero';mid.appendChild(hc);
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
  const nm=el('b','tn',itemName(it));nm.style.color=G.c;tp.append(nm,el('div','tt',G.n+' · '+SLOTN[it.k]+' · '+T.area+' '+it.t+'단계 (Lv '+T.iL+'~) · 무게 '+itemW(it)+(eq?' · 장착 중':'')));if(it.bu){const B=BU[it.bu];tp.appendChild(el('div','tcmp up','★ 지역 보스 전용 · '+QUESTS.find(q=>q.id===B.q).elite.name+' · 제작 불가 · 보스 컬렉션 재료'));}
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
    sp.append(mi,v,pl);r.appendChild(sp);L.appendChild(r);}
  const a=pStats(cur,true),b=pStats(nxt,true),T=el('div','cmp');g.appendChild(T);T.appendChild(el('div','ch','전투 능력 · 적용 전 → 적용 후'));
  const row=(n,x,y,f)=>{const d=el('div','cr'+(y!==x?' chg':''));d.append(el('span',null,n),el('b',null,f(x)),el('i',null,'→'),el('b','af',f(y)+(y>x?' ▲':'')));T.appendChild(d);};
  const pc=v=>(v*100).toFixed(1)+'%';
  row('공격력',a.atk,b.atk,String);row('방어',a.def,b.def,String);row('최대 HP',a.hp,b.hp,String);row('최대 MP',a.mp,b.mp,String);row('치명 확률',a.crit,b.crit,pc);row('공격 속도',a.aspd-1,b.aspd-1,v=>'+'+pc(v));row('스킬 피해',a.skm-1,b.skm-1,v=>'+'+pc(v));row('신앙',a.faith,b.faith,String);
  const sl=S.slots.map(id=>id&&skIdx(id)).filter(i=>i!=null&&i>=0&&SK[i].mul);for(const i of sl.slice(0,3))row(SK[i].name+' 1타',Math.round(a.atk*skMul(i)*a.skm*(SK[i].hits||1)),Math.round(b.atk*skMul(i)*b.skm*(SK[i].hits||1)),fmt);
  row('전투력',cpOf(cur),cpOf(nxt),fmt);T.lastChild.classList.add('cpr');
  F.append(el('p','note2','레벨업마다 3포인트 · 서브 퀘스트 보상 추가 포인트 · 공격 속도는 민첩으로 최대 +40% · 피해는 치명·방어·변동 적용 전 기준 · 창을 닫으면 적용하지 않은 배분은 취소된다'));
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
  const bt=el('div','btns');bt.append(btn('자동 성장 '+(S.autoGrow?'켬':'끔'),S.autoGrow?'tg on':'tg',()=>{S.autoGrow=!S.autoGrow;if(S.autoGrow)autoGrowNow();save();renderWin();}));F.appendChild(bt);}
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
  row(s1,'타겟 우선','퀘스트 사냥 중 노릴 몬스터',[['quest','퀘스트 대상 우선'],['near','가까운 몬스터']],()=>C.tgt,v=>C.tgt=v);
  row(s1,'스킬 사용 순서','슬롯에 넣은 스킬만 쓴다',[['slot','슬롯 1→8'],['strong','버프 → 강한 순']],()=>C.order,v=>C.order=v);
  row(s1,'몬스터 자동 반격','나를 공격한 몬스터를 먼저 상대',onoff,()=>C.counter!==false,v=>C.counter=v);
  let s2=sec('물약 · 귀환');
  row(s2,'HP 물약 자동 사용','HP가 이 비율 아래로 떨어지면 마신다',[[.3,'30%'],[.4,'40%'],[.5,'50%'],[.6,'60%'],[0,'끔']],()=>S.autoPot?C.potAt:0,v=>{S.autoPot=v>0;if(v>0)C.potAt=v;});
  row(s2,'자동 진행 물약 보충','자동 진행 중 HP 물약이 '+POT_LOW.hp+'개 아래면 상점에 들러 한도까지 구입',onoff,()=>!!S.autoBuy,v=>S.autoBuy=v);
  row(s2,'긴급 귀환','자동 사냥 중 물약이 없고 HP 40% 미만이면 귀환 주문서로 귀환 (퀘스트 자동 진행 중엔 항상 켜짐)',onoff,()=>!!S.autoRet,v=>S.autoRet=v);
  let s3=sec('진행 · 성장 · 장비');
  row(s3,'퀘스트 자동 진행',kTxt('수락 → 이동 → 사냥 → 보상을 자동으로 (T)'),onoff,()=>!!S.autoQ,v=>{S.autoQ=v;});
  row(s3,'자동 성장','능력치·스킬 포인트·스킬서·슬롯을 자동으로 쓴다',onoff,()=>!!S.autoGrow,v=>{S.autoGrow=v;if(v)autoGrowNow();});
  row(s3,'더 좋은 장비 자동 장착','얻은 장비가 지금보다 전투력이 높으면 바로 장착',onoff,()=>!!C.autoEq,v=>{C.autoEq=v;if(v)autoEquipAll();});
  row(s3,'자동 분해','무게 45% 또는 가방 90%가 넘으면 이 등급 이하를 분해 (장착·잠금·더 좋은 장비 제외 · 자동 잠금은 가방 🔒 ▾)',[[-1,'끔'],[0,'일반'],[1,'고급까지'],[2,'희귀까지']],()=>C.autoDis??-1,v=>C.autoDis=v);
  let s4=sec('화면 · 데이터');
  row(s4,'도트 양감','캐릭터·몬스터 도트에 형태 명암·반사광·선택적 외곽선',onoff,()=>VOL_ON,v=>{setVolume(v);C.vol=v;portrait('hero',$('face'),true);});
  row(s4,'양감 세기','약하게 하면 원래 도트에 가까워진다',Object.entries(VOL_LV).map(([n,k])=>[k,n]),()=>VOL_K,v=>{setVolume(true,v);C.volK=v;C.vol=true;portrait('hero',$('face'),true);});
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
  body.appendChild(el('p','note2','자동 진행 물약 보충 · 긴급 귀환 · 물약 자동 사용은 설정(⚙)에서 바꾼다 · 강화석은 대장장이 상점에서'));
  openModal({who:id,npc:id,name:npcName(id),sub:'상점 · 보유 골드 '+fmt(S.gold)+' · 무게 '+Math.round(wPct()*100)+'%',text:'',body,btns:[{t:'가방 (I)',f:()=>{closeModal();openBag();}},{t:'닫기',alt:true,f:closeModal}]});}
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
  if(player.swing>0){player.swing+=dt;const sm=player.swingTgt;if(sm&&!player.swingHit&&player.swing>.1){player.swingHit=true;if(alive(sm)&&inRange(sm,basicRange()+8)){playerHit(sm,basicMul());if(godOn('zeus')&&++player.hitN%3===0)chainBolt(sm);}}if(player.swing>.28){player.swing=0;player.swingHit=false;player.swingTgt=null;}}
  if(player.spin>0)player.spin-=dt;
  if(player.dash){const D=player.dash;D.t+=dt;const k=Math.min(1,D.t/D.dur);player.x=D.x0+(D.x1-D.x0)*k;player.y=D.y0+(D.y1-D.y0)*k;if(Math.random()<.9)spawnP(player.x,player.y,14,{col:'#a8e0ff',life:.25,size:6,size1:0});
    if(k>=1){player.dash=null;player.swing=.001;player.swingHit=true;for(const m of mobs)if(alive(m)&&(m===D.m||Math.hypot(m.x-player.x,m.y-player.y)<24+6*m.sc))playerHit(m,D.mul,true);burst(player.x,player.y,10,'#c8f0ff',14,90,4);}
    player.moving=true;return;}
  if(player.dead){player.moving=false;return;}
  if(godOn('athena')){player.shT-=dt;if(player.shT<=0){player.shT=8;player.shield=Math.max(player.shield,st.hp*(.10+.015*gLv()));}}else player.shield=0;
  {const R=inR(ZONES.village.r,player.x,player.y,0)?REGEN.village:REGEN.field;if(wPct()<.5){if(t-player.lastHit>R.delay)player.hp=Math.min(st.hp,player.hp+st.hp*R.hp*dt);player.mp=Math.min(st.mp,player.mp+(R.mp0+st.mp*R.mp)*dt);}}
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
function autoTick(dt){
  {const dz=t<dodgeOff?null:dangerAt(player.x,player.y,8,true);if(dz){const a=dz.a,x0=player.x,y0=player.y;stepMove(player,Math.cos(a),Math.sin(a),pSPD(),dt);const mv=Math.hypot(player.x-x0,player.y-y0);
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
  if(m&&!hunt&&dist(m,anchor)>SCAN+50&&!(m.aggro&&!m.ret&&dist(m,player)<140))m=null;/* v4.53 G1-b2c2: 나를 공격 중인 몬스터(140 안)는 자리 범위 밖이어도 버리지 않는다 — 원거리가 물러나 범위(SCAN+50) 밖에서 쏘면 자리로 돌아가다 지형에 막혀 180초 동안 133발을 다 맞던 꼬리 판 */
  if(!m){if(hunt){const Z=ZONES[hunt.zone];if(!hunt.roam||!hunt.roam.length){const homes=mobs.filter(e=>e.zone===hunt.zone&&!e.eliteOf&&(!hunt.sp||e.sp===hunt.sp));const h=homes.length?homes[Math.floor(Math.random()*homes.length)].home:{x:Z.c[0],y:Z.c[1]};hunt.roam=findPath(player.x,player.y,h.x,h.y)||[];}
      followPath(player,hunt.roam,pSPD(),dt);player.moving=!!hunt.roam.length;if(hunt.roam.length)faceTo(hunt.roam[0].x,hunt.roam[0].y);}
    else if(dist(player,anchor)>12){const x0=player.x,y0=player.y;stepMove(player,anchor.x-player.x,anchor.y-player.y,pSPD(),dt);if(Math.hypot(player.x-x0,player.y-y0)<SPD*dt*.25)anchor={x:player.x,y:player.y};/* v4.53: 자리로 가는 길이 막히면(직선 걸음) 지금 자리를 새 자리로 */else{player.moving=true;faceTo(anchor.x,anchor.y);}}return;}
  target=m;if(hunt)hunt.roam=null;
  if(player.atkT<=.2&&!player.dash&&!tooHeavy()){const dm=dist(m,player),near=mobs.filter(e=>alive(e)&&dist(e,player)<SK[0].r+8).length,big=m.boss||m.hp>m.max*.5||near>=2;
    if(big)for(const i of autoOrder())if(sReady(i)&&skillFits(i,m,dm,near)&&castSkill(i,true)){return;}}/* v4.52: 스킬을 써도 다가가기 진척(apProg)은 이어 본다 — 스킬마다 지워 회피 판정이 영영 안 되던 것 */
  if(inRange(m,basicRange()-2)){apProg=null;faceTo(m.x,m.y);basicAttack(m);}else{if(apWatch(m))return;approach(m,dt);}}
/* ================= v4.47 몬스터 행동 원형 (지시서 §G1) =================
   BEHAV[id].tick(m,dt,dp,moveTo) — 어그로 상태의 한 프레임. 'melee'는 v4.46까지의 코드를 그대로 옮긴 것(동작 불변 · melee447 테스트가 옛 빌드와 대조).
   원거리 · 돌진 · 방어 태세 · 자폭은 G1-b~d에서 이 표에 더한다. */
const mobB=m=>{if(m.boss||m.eliteOf)return null;const b=MOB_B[m.sp];if(!b||(b.zn&&m.zone&&!b.zn.includes(m.zone)))return null;return (b.zo&&m.zone&&MOB_BZ[m.sp+'@'+m.zone])||b;};/* v4.61 zo: 사냥터별 덮어쓰기(같은 종이 두 레벨대에 있을 때 — 미리 합친 표 MOB_BZ) */
const MOB_BZ={};for(const k in MOB_B){const b=MOB_B[k];if(b.zo)for(const z in b.zo)MOB_BZ[k+'@'+z]=Object.assign({},b,b.zo[z]);}/* v4.59 zn: 그 사냥터 개체에만 원형(한 종이 두 레벨대에 있을 때 하나씩) *//* 보스 · 관문 정예는 G1-f~g에서 패턴으로 */
const mobBeh=m=>{const b=mobB(m);return b&&b.b||'melee';};
const BEHAV={
  melee:{tick(m,dt,dp,moveTo){const reach2=(m.boss?18+12*m.sc:22)+4;
    if(m.wind>0){m.wind+=dt;if(m.wind>=.45){m.wind=0;if(dist(m,player)<reach2+8){hurtPlayer(calcDmg(m.atk,1,pStats().def,m.lv,S.lv),m);if(player.lastHit===t)mobFx(m,'melee');}}return;}
    if(dp>reach2){moveTo(player.x,player.y,m.boss?46:54);}else if(m.atkT<=0){m.wind=.001;m.atkT=m.boss?2.2:1.8;m.face=player.x<m.x?-1:1;}}},
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
        if(Math.hypot(qx,qy)<C.w/2+6){c.hit=true;hurtPlayer(calcDmg(m.atk,1,pStats().def,m.lv,S.lv)*C.mul,m);if(player.lastHit===t){STAT.chgHit=(STAT.chgHit||0)+1;mobFx(m,'charge');burst(player.x,player.y,10,'#e0b080',10,80,4);}else c.hit=false;}}
      if(Math.random()<dt*20)burst(m.x,m.y,1,'#b89a70',3,30,2);
      if(c.rem<=.01||!mv){const i=tele.indexOf(e);if(i>=0)tele.splice(i,1);m.chg=null;
        if(!c.hit){m.stag=t+C.stag;STAT.chgMiss=(STAT.chgMiss||0)+1;floatTxt(m.x,m.y,'휘청','#ffd070');}else m.atkT=Math.max(m.atkT,CHARGE.rest);}/* 맞힌 뒤 숨 고르기 — 돌진이 거리를 단숨에 좁혀 짧은 싸움에서 근접형보다 먼저 때리기 시작하던 몫을 덜어 낸다 */
      return;}
    const ready=!(m.chgCd>t)&&m.wind<=0;
    if(ready&&dp>=C.min&&dp<=C.max){m.chgCd=t+C.cd;m.backT=0;m.chg={ph:'aim',t:0,e:teleAdd({kind:'line',x:m.x,y:m.y,a:Math.atan2(player.y-m.y,player.x-m.x),len:Math.min(C.dist,dp+C.over),w:C.w,dur:C.aim,aim:true,ownC:m})};m.chg.e.chg=true;return;}
    if(ready&&dp<C.min){m.backT=(m.backT||0)+dt;if(m.backT<C.back){moveTo(m.x+(m.x-player.x),m.y+(m.y-player.y),54);return;}m.backT=0;m.chgCd=t+3;}/* 뒷걸음질로 거리를 벌린다 — 못 벌리면 근접 · 3초 뒤 다시 */
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
      if(!player.dead&&Math.hypot(player.x-m.x,player.y-m.y)<R+6){const h0=player.hp;hurtPlayer(calcDmg(m.atk,1,pStats().def,m.lv,S.lv)*(ob.mul||B.mul),m);if(player.lastHit===t){STAT.bstHit=(STAT.bstHit||0)+1;STAT.bstDmg=(STAT.bstDmg||0)+Math.max(0,h0-player.hp);mobFx(m,'burst');}}
      burst(m.x,m.y,6,(SPECIES[m.sp].c||[])[0]||'#ff8a3a',30,140,6);floatTxt(m.x,m.y-10,'펑!','#ffb070',true);killMob(m);}}},
};
const guardOn=m=>!!(m&&m.gdU>t);/* v4.58 방어 태세 중인가 */
/* v4.49 투사체: 직선 이동 · 지나간 선분으로 맞음 판정(빠르게 지나쳐도 놓치지 않음) · 사거리 끝 · 플레이어와 760 넘게 멀어지면 사라짐(지형 · 나무는 넘어 날아간다 — 낮은 장애물에 막혀 사라지던 시험 결과).
   자동 전투 회피용으로 날아가는 길을 직선 예고(shot)로 dangerList에 넣는다 — 그리진 않는다(투사체 자체가 보임) */
function mobShoot(m,tx,ty){const R=RANGED,a=Math.atan2(ty-m.y,tx-m.x);if(shots.length>=16)shots.shift();
  shots.push({x:m.x,y:m.y,a,c:Math.cos(a),s:Math.sin(a),v:(mobB(m)||{}).spd||R.spd/* v4.52 종마다 투사체 속도(MOB_B.spd) — 없으면 RANGED.spd */,d:0,max:R.range*R.fly,r:R.pr,t:0,m,col:(SPECIES[m.sp].c||[])[1]||'#ffd0f0'});STAT.shotN=(STAT.shotN||0)+1;}
function shotTick(dt){const R=RANGED;for(let i=shots.length-1;i>=0;i--){const s=shots[i],x0=s.x,y0=s.y,v=(s.v||R.spd)*dt;s.x+=s.c*v;s.y+=s.s*v;s.d+=v;s.t+=dt;
  let hit=false;if(!player.dead){const px=player.x-x0,py=player.y-y0,u=Math.max(0,Math.min(v,px*s.c+py*s.s)),qx=x0+s.c*u-player.x,qy=y0+s.s*u-player.y;hit=Math.hypot(qx,qy)<s.r+6;}
  if(hit){shots.splice(i,1);STAT.shotHit=(STAT.shotHit||0)+1;const hp0=player.hp;hurtPlayer(calcDmg(s.m.atk,1,pStats().def,s.m.lv,S.lv)*R.mul,s.m)/* v4.52 G1-b2c: 배율을 방어 뒤에 곱한다 — 방어 앞에 곱하면 레벨대마다 방어 비중이 달라 서 있기 비율이 0.78~0.93으로 갈렸다 */;if(player.lastHit===t)mobFx(s.m,'shot');burst(player.x,player.y,12,s.col,8,60,3);continue;}
  if(s.d>=s.max||Math.hypot(s.x-player.x,s.y-player.y)>760){shots.splice(i,1);burst(s.x,s.y,6,s.col,4,40,2);}}}
/* ================= v4.47 상태이상 (플레이어가 걸림 · player.fx) ================= */
function fxDur(k){return FXDEF[k].dur*1;}/* 저항(§G2) · 장비(§G3) · 정화(§G12)가 붙을 자리 */
function fxP(m){return m.boss||m.eliteOf?FX_P.elite:(m.lv<=6||m.lv>=9&&m.lv<=11)?FX_P.early:FX_P.base;}
function mobFx(m,by){const b=mobB(m);if(!b||!b.fx||player.dead||!FXDEF[b.fx])return false;if(b.fxBy&&by&&b.fxBy!==by)return false;const D=FXDEF[b.fx];/* v4.62 fxBy: 그 공격으로만 · D.p: 확률 덮어쓰기(기절 100%) · D.imm: 같은 개체 면역 */
  if(D.imm&&m.fxImm>t)return false;const p=D.p!=null?D.p:fxP(m);if(p<1&&Math.random()>=p)return false;if(D.imm)m.fxImm=t+D.imm;return addFx(b.fx,m);}
const fxOn=k=>!!(player.fx[k]&&player.fx[k].until>t);
function addFx(k,src){if(player.dead||!FXDEF[k])return false;const D=FXDEF[k],f=player.fx[k],on=f&&f.until>t;
  player.fx[k]={until:t+fxDur(k),dur:fxDur(k),src:src&&src.name||D.name,atk:src&&src.atk||0,tk:on?f.tk:t+1};/* 갱신 · 중첩 없음(초당 틱 박자는 유지) */
  if(k==='stun')stunHold();
  if(!on){floatTxt(player.x,player.y-6,D.name+'!',D.col);STAT.fxN=(STAT.fxN||0)+1;}return true;}
/* v4.62 G1-e1: 기절이 걸리는 순간 다른 몬스터가 이미 고정한 돌진 예고(아직 달리기 전)를 '따라가기'로 되돌린다 — 기절 동안 고정하지 않고(charge tick) 풀린 뒤 고정 시간만큼 반응할 틈을 준다(예고 → 반응 원칙) */
function stunHold(){for(const m of mobs){const c=m.chg;if(!c||c.ph!=='aim'||!c.lk)continue;const LK=c.L!=null?c.L:(mobB(m)||{}).lock||CHARGE.lock;c.lk=false;c.t=CHARGE.aim-LK-.001;const e=c.e;e.aim=true;e.keep=false;e.dur=CHARGE.aim;e.t=c.t;STAT.chgHold=(STAT.chgHold||0)+1;}}
function clearStatus(){for(const k in player.fx)delete player.fx[k];}
function tickStatus(dt){if(player.dead){clearStatus();return;}for(const k in player.fx){const f=player.fx[k],D=FXDEF[k];
  while(f.tk<=Math.min(t,f.until)+1e-6&&!player.dead){f.tk+=1;if(D.dps||D.k){const v=D.dps?pStats().hp*D.dps:Math.max(1,f.atk*D.k);/* v4.62 화상: 건 몬스터 공격력 × k · 방어 무시 */player.hp-=v;STAT.fxDmg=(STAT.fxDmg||0)+v;player.lastFx=t;floatTxt(player.x,player.y,'-'+Math.max(1,Math.round(v)),D.col);if(player.hp<=0){player.hp=0;delete player.fx[k];die({name:f.src});return;}}}
  if(f.until<=t)delete player.fx[k];}}
let fxHudK='';function fxHud(){const e=$('fxRow');if(!e)return;let h='',key='';for(const k in player.fx){const f=player.fx[k],D=FXDEF[k],rem=Math.max(0,Math.ceil(f.until-t));if(f.until<=t)continue;key+=k+rem;h+='<i class="fxi" style="--c:'+D.col+'" title="'+D.name+' · '+D.desc+'">'+D.ic+'<b>'+rem+'</b></i>';}
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
function teleTick(dt){for(let i=tele.length-1;i>=0;i--){const e=tele[i];if(e.own&&(e.own.dead||!e.own.aim||e.own.aim.e!==e)||e.ownC&&(e.ownC.dead||!e.ownC.chg||e.ownC.chg.e!==e)||e.ownB&&(e.ownB.dead||!e.ownB.bst||e.ownB.bst.e!==e)){tele.splice(i,1);continue;}e.t+=dt;if(e.t>=e.dur&&!e.keep){tele.splice(i,1);if(e.hit)e.hit(e);}}}
function teleDraw(){const L=dangerList().filter(e=>!e.shot&&Math.hypot(e.x-player.x,e.y-player.y)<420).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y)),used={circle:0,line:0,fan:0};
  for(const e of L){const P=TELE_POOL[e.kind];if(!P||used[e.kind]>=P.length)continue;const q=P[used[e.kind]++],k=Math.min(1,e.t/e.dur),h=elevAt(e.x,e.y);q.o.visible=q.f.visible=true;
    if(e.kind==='circle'){q.o.rotation.y=q.f.rotation.y=0;q.o.scale.set(e.r*2,1,e.r*2);q.o.position.set(e.x,h+1,e.y);q.f.scale.set(e.r*2*k,1,e.r*2*k);q.f.position.set(e.x,h+1.1,e.y);}
    else if(e.kind==='line'){const c=Math.cos(e.a),s=Math.sin(e.a);q.o.rotation.y=q.f.rotation.y=-e.a;q.o.scale.set(e.len,1,e.w*64/48);q.o.position.set(e.x+c*e.len/2,h+1,e.y+s*e.len/2);q.f.scale.set(e.len*k,1,e.w*64/48);q.f.position.set(e.x+c*e.len*k/2,h+1.1,e.y+s*e.len*k/2);}
    else{q.o.rotation.y=q.f.rotation.y=-e.a;q.o.scale.set(e.r*2*64/58,1,e.r*2*64/58);q.o.position.set(e.x,h+1,e.y);q.f.scale.set(e.r*2*64/58*k,1,e.r*2*64/58*k);q.f.position.set(e.x,h+1.1,e.y);}
    q.f.material.opacity=.35+.3*k;}
  for(const k in TELE_POOL)for(let i=used[k];i<TELE_POOL[k].length;i++){const q=TELE_POOL[k][i];q.o.visible=q.f.visible=false;}}
function updateMobs(dt){const village=ZONES.village.r;
  for(const m of mobs){if(m.dead){m.deadT+=dt;if(m.deadT>m.respawn){m.dead=false;m.hp=m.max;m.x=m.home.x;m.y=m.home.y;m.aggro=false;m.ret=false;m.chg=null;m.stag=0;m.gdU=0;m.gdN=0;m.bst=null;m.mesh.visible=true;}continue;}
    const dp=dist(m,player);if(dp>760&&!m.aggro)continue;m.hit=Math.max(0,m.hit-dt);m.phase+=dt;
    const dh=dist(m,m.home),moveTo=(x,y,spd)=>{const dx=x-m.x,dy=y-m.y;if(Math.abs(dx)>1)m.face=dx<0?-1:1;if(!stepMove(m,dx,dy,spd,dt)){m.blockT=(m.blockT||0)+dt;if(m.blockT>.8){const a=Math.random()*6.28;stepMove(m,Math.cos(a),Math.sin(a),spd*2,dt);m.blockT=0;}}m.moving=true;};
    m.moving=false;
    if(m.ret){if(dh<6){m.ret=false;m.hp=m.max;if(m.evd){m.evd=false;m.evL=t+EVADE.lock;}}else moveTo(m.home.x,m.home.y,70);continue;}
    if(m.aggro&&(dh>(m.boss?240:210)||player.dead||inR(village,player.x,player.y,10))){m.aggro=false;m.ret=true;m.wind=0;m.aoe=null;m.aim=null;m.chg=null;m.stag=0;m.gdU=0;m.gdN=0;m.bst=null;continue;}
    if(!m.aggro&&!m.inv&&!(m.evL>t)&&(aggroOn(m)||m.boss&&!m.field)&&dp<(m.boss?110:70)&&!player.dead&&t>=graceT&&!inR(village,player.x,player.y,10)){m.aggro=true;if(dp<200)floatTxt(m.x,m.y,'!','#ff8a6a');}
    if(m.aggro){m.atkT-=dt;
      if(m.boss){m.aoeT-=dt;if(m.aoe){m.aoe.t+=dt;if(m.aoe.t>=1.4){const ao=m.aoe;m.aoe=null;if(Math.hypot(player.x-ao.x,player.y-ao.y)<ao.r)hurtPlayer(calcDmg(m.atk,2.2,pStats().def,m.lv,S.lv),m);burst(ao.x,ao.y,4,'#ff8040',40,140,6);}}
        else if(m.aoeT<=0&&dp<200){m.aoe={x:player.x,y:player.y,r:58,t:0};m.aoeT=7;}}
      (BEHAV[mobBeh(m)]||BEHAV.melee).tick(m,dt,dp,moveTo);
      continue;}
    m.next-=dt;if(m.mv){moveTo(m.mv.x,m.mv.y,22);if(Math.hypot(m.mv.x-m.x,m.mv.y-m.y)<3||m.next<-3)m.mv=null;}
    else if(m.next<=0){m.next=rand(2,5);if(Math.random()<.6){const a=Math.random()*6.283,r=rand(10,34);const x=m.home.x+Math.cos(a)*r,y=m.home.y+Math.sin(a)*r;if(!blockedAt(x,y)&&!inR(village,x,y,20))m.mv={x,y};}}}}
const aoeMob=()=>{let best=null,bd=420;for(const m of mobs)if(m.aoe&&!m.dead){const d=dist(m,player);if(d<bd){bd=d;best=m;}}return best;};
function update(dt){zoom+=(zoomT-zoom)*Math.min(1,dt*12);if(Math.abs(zoomT-zoom)<.002)zoom=zoomT;/* v4.13: 창을 열어도 게임은 계속 흐른다 */t+=dt;for(let i=timers.length-1;i>=0;i--)if(t>=timers[i].at){const f=timers[i].f;timers.splice(i,1);f();}if(traveling)return;updatePlayer(dt);updateMobs(dt);teleTick(dt);shotTick(dt);tickStatus(dt);
  for(const n of npcList)if(n.deco){n.next-=dt;if(n.mv){const dx=n.mv.x-n.x,dy=n.mv.y-n.y,d=Math.hypot(dx,dy);if(d<2){n.mv=null;n.walk=0;}else{n.x+=dx/d*24*dt;n.y+=dy/d*24*dt;n.walk+=dt;n.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');}}
    else if(n.next<=0){n.next=rand(3,7);const x=n.hx+rand(-30,30),y=n.hy+rand(-16,16);if(!blockedAt(x,y))n.mv={x,y};}}
  for(const b of bolts)b.life+=dt;bolts=bolts.filter(b=>b.life<(b.max||.22));for(const f of floats)f.life+=dt;floats=floats.filter(f=>f.life<1.1);tickParts(dt);tickFx(dt);
  let z='field';for(const k in ZONES)if(inR(ZONES[k].r,player.x,player.y)){z=k;break;}if(HUNT.includes(z)&&!M.inst)S.aiZone=z;invTick(dt);riftTick(dt);riftFx(dt);
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
  const walkF=player.moving?Math.floor(t*8)%4:Math.floor(t*1.6)%2,img=getSprite('hero',player.dir,player.moving,walkF);
  {const ps=pScale();setSpr(pMesh,img,player.x,player.y,ps,(player.dash?2:0)+(1-ps)*14);}pMesh.visible=true;if(player.dead){const dk=Math.min(1,(t-(player.deadT||0))/.3);pMesh.visible=false;pX.visible=false;graveMesh.visible=true;setSpr(graveMesh,GRAVE,player.x,player.y,1.1,(1-dk)*26);}else{graveMesh.visible=false;pX.visible=false;}pX.scale.copy(pMesh.scale);pX.position.copy(pMesh.position);
  if(player.swing>0||player.spin>0){const w=godOn('artemis')&&!(player.spin>0)?'bow':weapSpr(),wi=WSPRC[w]||(WSPRC[w]=mkWeapon(w));if(wMesh.userData.img!==wi){wMesh.material=matOf(wi);wMesh.customDepthMaterial=depthOf(wi);wMesh.userData.img=wi;}
    const k=player.spin>0?1-player.spin/.4:Math.min(1,player.swing/.2),f=player.face;wMesh.visible=true;wMesh.scale.set(wi.width*1.2*f,wi.height*1.2,1);
    const ang=player.spin>0?k*Math.PI*4:(1.1-k*2.2);wMesh.rotation.z=f>0?ang:-ang;wMesh.position.set(player.x+f*5,elevAt(player.x,player.y)+15*VS,player.y+1.5);}else wMesh.visible=false;
  for(const n of npcList){if(n.way)continue;const im=n.deco?getSprite(n.id,n.dir||'down',!!n.mv,n.mv?Math.floor(n.walk*7)%4:Math.floor(t*1.5+n.seed)%2):getSprite(n.id,'down',false,Math.floor(t*1.5+n.seed)%2);setSpr(n.m,im,n.x,n.y);}
  for(const m of mobs){if(m.dead){if(m.deadT<.5){const k=m.deadT/.5;m.mesh.visible=true;setSpr(m.mesh,m.face<0?MONWL[m.sp]:MONW[m.sp],m.x,m.y,m.sc*(1-k*.6),-k*6,m.rift);}else m.mesh.visible=false;continue;}
    if(Math.abs(m.x-player.x)>520||Math.abs(m.y-player.y)>420){m.mesh.visible=false;continue;}m.mesh.visible=true;
    const fr=m.moving||m.aggro?Math.floor(m.phase*7)%4:Math.floor(m.phase*2.2)%2,im=m.hit>0?(m.face<0?MONWL[m.sp]:MONW[m.sp]):(m.face<0?MONSPRL[m.sp][fr]:MONSPR[m.sp][fr]);
    setSpr(m.mesh,im,m.x+(m.wind>0?-2:m.chg&&m.chg.ph==='aim'?Math.sin(m.phase*40)*1.2:0)*m.face,m.y,m.sc*(m.gdU>t?.9:m.bst?1+.35*Math.min(1,m.bst.t/((mobB(m)||{}).inf||BURST.inf))+.05*Math.sin(m.phase*30):1)/* v4.58 웅크림 · v4.59 부풀기 */,SPECIES[m.sp].form==='bird'||SPECIES[m.sp].form==='sprite'?4+Math.sin(m.phase*4)*2:0,m.rift);}
  if(player.shield>0&&!player.dead){shRing.visible=true;const k=1+Math.sin(t*4)*.05;shRing.scale.set(30*k,1,22*k);shRing.position.set(player.x,elevAt(player.x,player.y)+.9,player.y);shRing.material.opacity=.5+.3*Math.min(1,player.shield/(pStats().hp*.1));}else shRing.visible=false;
  if(t<player.buffT&&!player.dead){buffRing.visible=true;const k=(t*1.3)%1;buffRing.scale.set(20+k*16,1,(20+k*16)*.75);buffRing.position.set(player.x,elevAt(player.x,player.y)+1,player.y);buffRing.material.opacity=.8*(1-k);}else buffRing.visible=false;
  if(alive(target)){tgtRing.visible=true;const r=(16+MONSPR[target.sp][0].width*.5)*target.sc;tgtRing.scale.set(r,1,r*.75);tgtRing.position.set(target.x,elevAt(target.x,target.y)+.8,target.y);tgtRing.material.opacity=.6+.3*Math.sin(t*6);}else tgtRing.visible=false;
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
  if(alive(target))L.push([target,MONSPR[target.sp][0].height*target.sc*.5,target.sc]);
  const near=mobs.filter(m=>alive(m)&&m!==target&&(m.aggro||Math.abs(m.x-player.x)<220&&Math.abs(m.y-player.y)<170)).sort((a,b)=>dist(a,player)-dist(b,player));
  for(const m of near){if(L.length>=FADE_N)break;L.push([m,MONSPR[m.sp][0].height*m.sc*.5,m.sc]);}
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
  for(const n of npcList){if(n.deco)continue;const [x,y]=W2S(n.x,n.y,n.way?52:40);if(x<-50||x>cssW+50||y<-50||y>cssH+50)continue;
    if(n.way){txt(M.inst?'균열 문':'길잡이 표석',x,y,'#d8c0ff',fs,true);txt(M.inst?'나가기 · 지역 이동':'마을 간 이동',x,y+fs*1.05,'#c8bcd8',fs*.8);continue;}
    txt(npcName(n.id),x,y+sc*2,'#ffe8b0',fs,true);txt(NPCS[n.id].role,x,y+sc*2+fs*1.05,'#c8bcd8',fs*.8);
    const mk2=npcMark(n.id);if(mk2){const by=y-fs*1.4-Math.abs(Math.sin(t*3))*sc*3;g.fillStyle='rgba(20,12,30,.8)';g.beginPath();g.arc(x,by,fs*1.05,0,6.283);g.fill();g.strokeStyle=mk2[1];g.lineWidth=2;g.stroke();txt(mk2[0],x,by+1,mk2[1],fs*1.5,true);}}
  const q=curQ(),subSp=Object.keys(S.sq).filter(id=>S.sq[id].st==='active').map(id=>SUBQ[id].sp);
  for(const m of mobs){if(m.dead)continue;const dp=dist(m,player);if(dp>(m.boss?400:190)&&m!==target)continue;const h=MONSPR[m.sp][0].height*m.sc;const [x,y]=W2S(m.x,m.y,h+6);
    const isQ=!m.eliteOf&&((S.qs==='active'&&(q.sp===m.sp||(q.type==='zone'&&m.zone===q.zone)))||subSp.includes(m.sp));
    txt('Lv'+m.lv+' '+m.name,x,y-sc*5,m.eliteOf||m.riftBoss?'#ffb0ff':m.rift?RIFT_COL.name:lvCol(m.lv),fs*(m.boss?1.15:.85),m.boss||m===target);
    if(isQ){g.fillStyle=subSp.includes(m.sp)?'#7ac8ff':'#ffd040';g.font='700 '+fs*.9+'px sans-serif';g.fillText('◆',x-g.measureText('Lv'+m.lv+' '+m.name).width/2-fs*.9,y-sc*5);}
    if(m.hp<m.max||m===target||m.aggro){const bw=sc*(m.boss?40:20),bh=Math.max(3,sc*1.6);g.fillStyle='rgba(16,10,24,.85)';g.fillRect(x-bw/2-1,y-1,bw+2,bh+2);g.fillStyle=m.aggro?'#e0584a':'#8ad06a';g.fillRect(x-bw/2,y,bw*m.hp/m.max,bh);}
    if(m.wind>0){const k=m.wind/.45;txt('!',x+sc*12,y-sc*2,k>.6&&Math.floor(t*24)%2?'#ffffff':'#ffd040',fs*1.6,true);}
    if(mobBeh(m)==='guard'&&m.aggro&&(m.gdU>t||m.gdN&&m.gdN-t<GUARD.pre)){/* v4.58 방어 태세 방패(웅크리기 직전 GUARD.pre초는 깜빡임) */const on=m.gdU>t;if(on||Math.floor(t*12)%2){const r=fs*.95,bx=x,by=y-sc*5-fs*1.5;g.fillStyle=on?'rgba(120,180,255,.92)':'rgba(200,220,255,.55)';g.strokeStyle='#e8f4ff';g.lineWidth=2;g.beginPath();g.moveTo(bx-r,by-r*.9);g.lineTo(bx+r,by-r*.9);g.lineTo(bx+r*.9,by+r*.1);g.quadraticCurveTo(bx+r*.5,by+r*.85,bx,by+r*1.15);g.quadraticCurveTo(bx-r*.5,by+r*.85,bx-r*.9,by+r*.1);g.closePath();g.fill();g.stroke();}}}
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
  if(alive(target)){$('tgt').hidden=false;const tn=$('tgtN');tn.replaceChildren(el('small',null,'Lv '+target.lv),target.name);if(target.fa){const lo=st.faith<target.fa;tn.appendChild(el('small','tfa'+(lo?' low':''),'신앙 '+st.faith+'/'+target.fa+(lo?' · '+Math.round(faithOut(target)*100)+'%':'')));}tn.className='tn'+(target.boss?' boss':'');$('tgtB').style.width=(target.hp/target.max*100)+'%';$('tgtT').textContent=fmt(target.hp)+' / '+fmt(target.max);}else $('tgt').hidden=true;
  $('bMenu').classList.toggle('dot',[...$('menuPop').querySelectorAll('.tmb')].some(b=>b.classList.contains('dot')));
  renderQuests();drawMini();}
function drawMini(){if(!miniBase)return;const g=mg,V=M.mini;g.setTransform(1,0,0,1,0,0);g.drawImage(miniBase,0,0);const s=.1;if(V){const k=WW/V.w;g.setTransform(k,0,0,k,-V.x*s*k,-V.y*s*k);}
  const q=curQ(),hz=[];if(S.qs==='active'&&q.zone&&ZONES[q.zone])hz.push([q.zone,'255,214,90']);for(const id in S.sq)if(S.sq[id].st==='active'&&ZONES[SUBQ[id].zone])hz.push([SUBQ[id].zone,'122,200,255']);
  for(const [z,c] of hz){const r=ZONES[z].r;g.strokeStyle=`rgba(${c},${.55+.35*Math.sin(t*4)})`;g.lineWidth=2;g.strokeRect(r[0]*s,r[1]*s,(r[2]-r[0])*s,(r[3]-r[1])*s);}
  if(rift&&M.inst)for(const m of mobs)if(m.rift&&alive(m)){g.fillStyle=m.riftBoss?'#ff9cff':RIFT_COL.dot;g.beginPath();g.arc(m.x*s,m.y*s,m.riftBoss?3:1.1,0,6.283);g.fill();if(m.riftBoss){g.strokeStyle='#fff';g.lineWidth=.8;g.stroke();}}
  for(const m of mobs)if(alive(m)&&(m.aggro||m.boss)){g.fillStyle=m.boss?'#ff3a20':'#ff5a4a';g.beginPath();g.arc(m.x*s,m.y*s,m.boss?4:1.5,0,6.283);g.fill();}
  for(const n of npcList)if(!n.deco&&!n.way){g.fillStyle='#ffe8a0';g.fillRect(n.x*s-1,n.y*s-1,3,3);}
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
window.__g={pSPD,SPD,basicAttack,castSkill,MOB_BZ,BURST,GUARD,guardOn,playerHit,get npcList(){return npcList;},get anchor(){return anchor;},CHARGE,DODGE,reachOk:(x,y)=>{if(x<8||y<8||x>=WW-8||y>=WH-8)return false;const c=ci(x,y);return !blk[c]&&!!reach[c];},EVADE,mobEvade,apWatch,get apProg(){return apProg;},get target(){return target;},blockedAt:(x,y)=>blockedAt(x,y),los:(a,b,c,d)=>los(a,b,c,d),resetAuto(){dodgeT=0;dodgeOff=0;anchor=null;apPath=null;apFor=null;target=null;apProg=null;},get PLAZA(){return PLAZA;},RANGED,shots,mobShoot,shotTick,usePot,gainXp,mobStats,setAuto(v){auto=!!v;},MOB_B,FXDEF,FX_P,BEHAV,mobB,mobBeh,fxDur,fxP,mobFx,addFx,fxOn,clearStatus,tele,teleAdd,dangerAt,dangerList,TELE_POOL,STAT,enchAid,enchRate,riftBoxTxt,riftBoxGrade,riftBoxSlot,riftBoxBU,fieldBossQs,mainDone,riftPrep,riftKey,riftKeyIdx,riftLockMsg,riftUnlocked,QORDER_445,die,growthGoal,cancelNav,riftPrepGo,riftResupply,riftSpawn,riftLeave,riftName,riftOf,get riftRet(){return riftRet;},get riftCarry(){return riftCarry;},get graceT(){return graceT;},get MAPID(){return MAPID;},get traveling(){return traveling;},riftHud,riftPotCost,riftExp,riftRecOf,riftTable,RIFT_COL,get riftK(){return riftK;},riftFx,riftBtn,openRift,matOfR,RIFT,riftElite,riftEliteOf,riftBox,riftLeft,openWay,get ZONES(){return ZONES;},riftEnter,riftEnd,riftTick,riftOpen,riftZone,riftIn,get rift(){return rift;},riftUp,riftCd,riftStay,riftPend,riftLv,riftFa,riftBaseMap,riftClear,riftExpire,riftAppear,riftChip,riftResp,portalFx,riftAsk,riftNote,riftNeed,riftNeedOf,riftMapNow,riftLeft,closeModal,pScale,get cineT(){return cineT;},get pCine(){return pCine;},winApply,winSet,winReset,winGrp,popFit,WSIZES,kb,kAct,setKey,kbReset,KB_ACTS,openKeyset,get kbCap(){return kbCap;},renderWin,craftMaxN,craftBatch,get cfN(){return cfN;},setCfN(v){cfN=v;},CRAFT_N_MAX,lockSet,unlockAll,autoLockOk,autoLockNew,LOCK_SETS,bulkLockTip,AUTOLOCK_OPT,openLog,acqLog,withAcq,acqMissNew,ACQ_MAX,addItem,dropFrom,applyRw,newItem,bagUi,bagFltOk,bagSortItems,bagEntries,disTarget,encToTarget,encExpect,encTgtOf,openColl,openCraft,killMob,AGGRO,aggroOn,hurtMob,need,xpK,xpGapF,XP_K,XP_GAP,FADE,batchEquip,equipBetterN,QFB,FB_UP,migrateQi,skCan,craftCan,craftCanK,craftCanKT,get qTab(){return qTab;},enchSafe,toggleMenu,craftHint,godHint,openEnchant,enchCheck,enchCost,buyStone,oreKey,dsgKey,stonePrice,collBatchList,collBatch,chooseTrial,faithBreak(){const o={grade:0,ench:0,boss:0,coll:0};for(const sl of SLOTS){const it=S.eq[sl]&&itemById(S.eq[sl]);if(!it)continue;const E=ENCH[it.k];if(it.bu)o.boss+=BU[it.bu].fa;else o.grade+=gradeFaith(it.g,it.t);if(E)o.ench+=it.en;}o.coll=collSum().faith||0;return o;},repGo,acceptRep,claimRep,get qTab(){return qTab;},setQTab(v){qTab=v;lastQKey="";},get trainFor(){return trainFor;},setTarget(m){target=m;},ZALL,isEq,collNeeds,craftTierMax,tierOfLv,CRAFT_EQ,collReg,itemById,collDone,BU,newBU,ZFAITH,faithOut,faithIn,faithR,growthTick,growthProg,isGrowth,fieldBossInfo,ensureFieldBosses,collDoneN,bcollDoneN,SUBQ_G:()=>Object.keys(SUBQ).filter(isGrowth),travelTo,eliteOf,collCand,isBossColl,autoEquipAll,targetSlot,cpScore,betterThanEq,craftMats,ARMOR_K,get win(){return win;},closeWin,get statics(){return statics;},_art:{volumize,rawChar,getSprite0:_getSprite0,MON_ORIG,MONSPR,setVolume},setVolume,get VOL_ON(){return VOL_ON;},openSettings,get zoom(){return zoom;},get zoomT(){return zoomT;},save,get scene(){return scene;},get G0(){return G0;},MAPS,elevAt,get terrain(){return terrain;},T3,revive,hurtPlayer,INV,goHunt,BAL,STAT,autoBuy,needShop,goTown,get inv(){return inv;},offlineSettle,openGods,openStats,openSkills,setGod(k){S.god=k;},invSpawn,snap(){snapCam();},timers,get t(){return t;},get S(){return S;},player,get mobs(){return mobs;},get nav(){return nav;},get hunt(){return hunt;},get auto(){return auto;},get modal(){return modal;},get map(){return MAPID;},get traveling(){return traveling;},
  get win(){return win;},closeWin,openBag,openCraft,openColl,craftItem,craftCheck,collRegister,collSum,COLL,STK,openSettings,openForge,openShop,addItem,newItem,equipItem,unequip,enchant,disassemble,dropFrom,weightNow,weightMax,wPct,gearSum,itemName,itemStats,cnt,addStk,castSlot,autoOrder,autoSlots,tierOpen,ENH,DROP,GRADES,TIERS,SK,
  questGo,autoNext,openNpc,claimQuest,acceptQuest,claimSub,acceptSub,subGo,doTravel,gateState,cpOf,pStats,autoGrowNow,learnSkill,update,render,step(n,dt){for(let i=0;i<n;i++){update(dt);if(started&&!traveling)updateHud(dt);}},curQ,findPath,QUESTS,SUBQ,gainXp,set autoQ(v){S.autoQ=v;}};

/* ================= 시작 ================= */
async function startGame(fresh){/* v4.35 새 게임이어도 바꾼 단축키는 이어 쓴다(키 설정은 캐릭터가 아니라 사람의 것) */const sv0=fresh?(loadSave()||{}):null,km0=sv0&&sv0.keymap,wu0=sv0&&sv0.winUi;/* v4.36 창 위치 · 크기도 사람의 것 */S=fresh?migrate48(newSave(),true):loadSave()||migrate48(newSave(),true);if(km0)S.keymap=km0;if(wu0)S.winUi=wu0;gearDirty();if(!MAPS[S.map]||MAPS[S.map].inst){S.map='rowen';S.x=MAPS.rowen.plaza.x;S.y=MAPS.rowen.plaza.y+40;}if(S.map!==MAPID){$('loadT').textContent=MAPS[S.map].name+' 지역을 그리는 중…';if(!MAPS[S.map].rt||!MAPS[S.map].rt.built)await buildWorld(S.map,p=>{$('loadT').textContent=MAPS[S.map].name+' 지역을 그리는 중… '+Math.round(p*100)+'%';});bindMap(S.map);showMapOnly();applyLook();}
  const st=pStats();player.hp=st.hp;player.mp=st.mp;
  const ok=!fresh&&!blockedAt(S.x,S.y)&&!Object.values(ZONES).some(z=>z.lv&&inR(z.r,S.x,S.y));player.x=ok?S.x:PLAZA.x;player.y=ok?S.y:PLAZA.y+40;
  started=true;kbRefresh();$('title').hidden=true;$('hud').hidden=false;if(document.body.classList.contains('touch')){joyz.hidden=false;joyEl.hidden=false;joyPos();}
  if(S.cfg&&VOL_OLD[S.cfg.volK]!=null&&!S.cfg.vol482){S.cfg.volK=VOL_OLD[S.cfg.volK];}if(S.cfg&&!S.cfg.vol483){S.cfg.vol=false;S.cfg.vol483=true;S.cfg.vol482=true;}setVolume(!!(S.cfg&&S.cfg.vol===true),S.cfg&&S.cfg.volK||VOL_LV.약);portrait('hero',$('face'),true);setZoom(S.zoom||1);zoom=zoomT;snapCam();curZone='';lastQKey='';stage.focus({preventScroll:true});
  if(fresh)setTimeout(()=>toast('왼쪽 퀘스트를 누르면 목적지로 자동 이동한다'),1200);else offlineSettle();
  /* v4.48 균열 v2: 옛 입장 시간 · 지역별 기록 표시는 쓰지 않는다 — 개방된 세이브는 첫 균열이 바로 열린다(riftTick) */
  delete S.riftT;delete S.riftSeen;if(S.riftCd==null&&S.riftOpenT==null){S.riftEK=0;S.riftEP=0;}else if(S.riftEP&&typeof S.riftEP==='object')S.riftEP=0;pCine=null;cineT=0;
  if(S.riftNote){delete S.riftNote;if(!fresh)setTimeout(()=>toast('원정대는 이미 시간의 균열을 열었다 · 길잡이 표석 · 메뉴 [균열]',true),2400);}
  if(S.migrated48){delete S.migrated48;setTimeout(()=>{banner('v4.8 장비 시스템','강화 단계를 장비로 옮기고 지금 레벨의 장비를 지급했다');toast('가방(I)에서 장비와 마법 주문서를 확인하자',true);},1600);}save();}
$('btnStart').onclick=()=>startGame(true);$('btnCont').onclick=()=>startGame(false);
resize();requestAnimationFrame(loop);
buildMonSprites();
buildWorld('rowen',p=>{$('loadT').textContent='세계를 그리는 중… '+Math.round(p*100)+'%';}).then(()=>{scene.add(G0);applyLook();
  $('loadT').textContent='';$('btnStart').disabled=false;if(loadSave()){$('btnCont').hidden=false;$('btnCont').focus();}else $('btnStart').focus();
  player.x=PLAZA.x;player.y=PLAZA.y+40;snapCam();window.__ready=true;}).catch(e=>{$('loadT').textContent='오류: '+e.message;console.error(e);});
})();
