/* 양감 처리 — 원본 도트(외곽선 없는 원화) 위에 형태 명암·휴 시프트·반사광·선택적 외곽선을 입힌다.
   volumize(canvas, opt) → 새 canvas(사방 1px 여백). 원본 구조는 그대로, 픽셀 색만 바꾼다. */
function volumize(src,opt={}){
  const o=Object.assign({k:1,light:[-0.55,-0.7,0.55],hi:.30,sh1:.80,sh2:.62,warm:[255,236,196],cool:[62,52,128],rim:[170,205,255],stripOutline:false,minRegion:6,bigRegion:40,aoRows:3},opt);
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
  const run=(j,dx,dy)=>{let x=j%w,y=(j/w)|0,n=0;for(;n<4;n++){x+=dx;y+=dy;if(x<0||y<0||x>=w||y>=h)break;const k=y*w+x;if(!A[k]||reg[k]!==reg[j])break;}return n;};
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
    if(!small&&bd<0&&(!A[j+1]||!A[j+w])&&y<ymax-1){r=mix(r,o.rim[0],.26*o.k);g=mix(g,o.rim[1],.26*o.k);b=mix(b,o.rim[2],.3*o.k);}
    d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;}
  // 선택적 외곽선: 빛 쪽(왼·위)은 원색의 어두운 톤, 그늘 쪽(오른·아래)은 짙은 남보라
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const j=y*w+x,i=j*4;if(A[j])continue;
    let src=-1,lit=false;
    for(const [dx,dy,l] of [[1,0,true],[0,1,true],[-1,0,false],[0,-1,false]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const k=yy*w+xx;if(A[k]){src=k;lit=l;break;}}
    if(src<0)continue;const k4=src*4;
    const K2=o.k,b0=[d[k4]*.4+10,d[k4+1]*.34+6,d[k4+2]*.44+22];
    if(lit){d[i]=mix(b0[0],d[k4]*.55+8,K2);d[i+1]=mix(b0[1],d[k4+1]*.5+6,K2);d[i+2]=mix(b0[2],d[k4+2]*.55+18,K2);}
    else{d[i]=mix(b0[0],d[k4]*.26+14,K2);d[i+1]=mix(b0[1],d[k4+1]*.22+10,K2);d[i+2]=mix(b0[2],d[k4+2]*.3+34,K2);}
    d[i+3]=255;}
  og.putImageData(im,0,0);return out;}

/* 원본 캐릭터 원화(finalize 이전) */
function rawChar(id,dir,walk,f){const s=CHARS[id];if(!s.C)s.C=charColors(s);const c=mk(22,34),g=c.getContext('2d'),p=painter(g,1,1);
  let dy=0,lL=0,lR=0,sw=0;if(walk){if(f===1){dy=-1;lL=1;sw=1;}else if(f===3){dy=-1;lR=1;sw=-1;}}else dy=f===1?1:0;
  if(dir==='down')front(p,s,s.C,dy,lL,lR,sw);else if(dir==='up')back(p,s,s.C,dy,lL,lR,sw);else side(p,s,s.C,dy,walk?f:-1);return c;}

