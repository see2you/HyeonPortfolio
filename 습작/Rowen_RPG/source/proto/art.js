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
/*CHARART*/
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
/*MONART*/
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
