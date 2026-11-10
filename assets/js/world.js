/* Procedural low-poly scene adapted from the user's original temple. */
(function(root){
'use strict';
root.Temple.createWorld=function(scene){
const S=new THREE.Group();scene.add(S);
let buddhaBounds;
let seed=7;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
const mats={};const mt=c=>mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c}));
function add(g,m,x,y,z,p){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;(p||S).add(o);return o}
const box=(w,h,d,c,x,y,z,p)=>add(new THREE.BoxGeometry(w,h,d),mt(c),x,y,z,p);
const cyl=(a,b,h,c,x,y,z,p)=>add(new THREE.CylinderGeometry(a,b,h,12),mt(c),x,y,z,p);
const sph=(r,c,x,y,z,p,sy)=>{const o=add(new THREE.SphereGeometry(r,16,12),mt(c),x,y,z,p);if(sy)o.scale.y=sy;return o};
// world
const TILE=0xa9653e,TILE2=0x75452d,RED=0x773c2c,WOODD=0x3d2418,WHITE=0xe9e5d9,GRAN=0xb9b6ad,GOLD=0xd8b04a;
const cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
scene.background=cv(2,256,(g,w,h)=>{const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,'#9bb9c9');r.addColorStop(.6,'#ced9d1');r.addColorStop(1,'#e8e7d7');g.fillStyle=r;g.fillRect(0,0,w,h)});
const plazaTex=cv(256,256,(g,w,h)=>{g.fillStyle='#a8a89a';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle='rgba('+(rnd()<.5?'255,255,255':'0,0,0')+','+(.03+rnd()*.05)+')';g.fillRect(rnd()*w,rnd()*h,2,2)}g.strokeStyle='#898d80';g.lineWidth=3;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,h);g.stroke();g.beginPath();g.moveTo(0,i*64);g.lineTo(w,i*64);g.stroke()}});
function floor(w,d,x,z,y){const t=plazaTex.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/6,d/6);t.needsUpdate=true;const m=new THREE.Mesh(new THREE.BoxGeometry(w,.2,d),new THREE.MeshLambertMaterial({map:t}));m.position.set(x,y,z);m.receiveShadow=true;S.add(m)}
function hip(w,d,hr,rl,c){const x=w/2,z=d/2,r=rl/2;let g=new THREE.BufferGeometry();
g.setAttribute('position',new THREE.Float32BufferAttribute([-x,0,z,x,0,z,x,0,-z,-x,0,-z,-r,hr,0,r,hr,0],3));g.setIndex([0,1,5,0,5,4,1,2,5,2,3,4,2,4,5,3,0,4]);g=g.toNonIndexed();g.computeVertexNormals();
const m=new THREE.Mesh(g,mt(c));m.castShadow=true;return m}
function roof(x,y,z,w,d,hr,rl){box(w,.4,d,TILE2,x,y,z);box(w-3,.9,d-3,WOODD,x,y-.6,z);
const m=hip(w,d,hr,rl,TILE);m.position.set(x,y+.2,z);S.add(m);box(rl,.35,.7,TILE2,x,y+hr+.35,z);
for(const sx of[-1,1]){add(new THREE.ConeGeometry(.4,1.5,6),mt(GOLD),x+sx*rl/2,y+hr+.9,z);
for(const sz of[-1,1])add(new THREE.CylinderGeometry(.04,.32,1.8,6),mt(TILE),x+sx*w/2,y+.4,z+sz*d/2).rotation.set(sz*.65,0,-sx*.65)}}
// ground, plaza, terrace
box(900,1,900,0x8eaa70,0,-.5,-100);
floor(70,78,0,13,-.05);floor(24,44,0,74,-.05);
box(66,1.5,26,GRAN,0,.75,-39);floor(66,26,0,-39,1.5);
for(let i=0;i<5;i++)box(11,(i+1)*.32,1,GRAN,0,(i+1)*.16,-21.5-i);
function balx(x1,x2,z){const l=x2-x1,cx=(x1+x2)/2,y=1.6;box(l,.3,.4,WHITE,cx,y+1.15,z);box(l,.9,.25,WHITE,cx,y+.5,z);for(let x=x1;x<=x2+.01;x+=2.5){box(.4,1.4,.4,WHITE,x,y+.7,z);sph(.28,WHITE,x,y+1.5,z)}}
balx(-33,-6.5,-26);balx(6.5,33,-26);
for(const s of[-1,1])box(.9,.8,5.2,WHITE,s*6.2,1,-23.5).rotation.x=.31;
// Daxiong hall
const leaves=[];let doorOpen=0;
(function(){const w=34,d=18,x=0,z=-39,y0=1.6,H=8,zf=z+d/2-1,zB=-43.7;
box(w+6,.6,d+6,GRAN,x,y0+.3,z);const y1=y0+.6;
box(w-2,.1,d-2,0x6b4a30,x,y1+.05,z);box(w-2,H,.6,0x1f2142,x,y1+H/2,z-d/2+.8);
for(const s of[-1,1])box(.6,H,d-2,0x7f2420,x+s*(w/2-1),y1+H/2,z);
box(w-2,.3,d-2,0x2b2336,x,y1+H-.1,z);
for(const px of[-14.7,-9,-3.3,3.3,9,14.7])cyl(.45,.5,H,WHITE,px,y1+H/2,zf);
const pln=(t,pw,ph,px,py,pz)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}));m.position.set(px,py,pz);S.add(m)};
const door=cv(128,256,(g,W,Q)=>{g.fillStyle='#8c2020';g.fillRect(0,0,W,Q);g.strokeStyle='#d8b04a';g.lineWidth=5;g.strokeRect(5,5,W-10,Q-10);g.fillStyle='#e0b848';for(let i=0;i<5;i++)for(let j=0;j<9;j++){g.beginPath();g.arc(20+i*22,22+j*26,5,0,7);g.fill()}});
const gs=cv(128,256,(g,W,Q)=>{g.fillStyle='#7a1c1c';g.fillRect(0,0,W,Q);g.strokeStyle='#e8c25a';g.lineWidth=4;g.strokeRect(4,4,W-8,Q-8);g.fillStyle='#2a1a14';g.fillRect(12,12,W-24,Q*.6);g.lineWidth=2;for(let i=1;i<6;i++){g.beginPath();g.moveTo(12+i*(W-24)/6,12);g.lineTo(12+i*(W-24)/6,12+Q*.6);g.stroke();g.beginPath();g.moveTo(12,12+i*Q*.1);g.lineTo(W-12,12+i*Q*.1);g.stroke()}g.strokeRect(12,Q*.72,W-24,Q*.22)});
for(const c of[-11.85,-6.15,6.15,11.85])pln(gs,5.5,5.4,c,y1+2.9,zf-.1);
for(const s of[-1,1]){const g=new THREE.Group();g.position.set(s*3.3,y1+2.9,zf);g.userData.dynamic=true;S.add(g);leaves.push([g,s]);const m=new THREE.Mesh(new THREE.BoxGeometry(3.2,5.4,.16),new THREE.MeshLambertMaterial({map:door}));m.position.x=-s*1.6;g.add(m)}
box(7.2,.7,.5,WOODD,0,y1+5.65,zf);box(w-2,H-5.8,.3,RED,x,y1+5.8+(H-5.8)/2,zf);box(w-2,.5,.6,WOODD,x,y1+H-.3,zf);
const win=cv(128,128,(g,W,Q)=>{g.fillStyle='#2a4fb0';g.fillRect(0,0,W,Q);g.strokeStyle='#e6e0b0';g.lineWidth=3;for(let i=0;i<=8;i++){g.beginPath();g.moveTo(i*16,0);g.lineTo(i*16,Q);g.stroke();g.beginPath();g.moveTo(0,i*16);g.lineTo(W,i*16);g.stroke()}});
for(const s of[-1,1])pln(win,5,3.4,s*10.5,y1+4.5,-46.85);
const cp=t=>cv(64,320,(g,W,Q)=>{g.fillStyle='#1b1620';g.fillRect(0,0,W,Q);g.fillStyle='#e8c25a';g.font='bold 40px "Noto Serif TC",serif';g.textAlign='center';[...t].forEach((c,i)=>g.fillText(c,W/2,40+i*42))});
for(const[s,t]of[[-1,'\u6cd5\u8f2a\u5e38\u8f49\u5b89\u5929\u4e0b'],[1,'\u4f5b\u65e5\u589e\u8f1d\u5229\u6709\u60c5']]){cyl(.55,.6,H,0x1b1620,s*8.6,y1+H/2,-35);pln(cp(t),.9,4.7,s*8.6,y1+4.4,-34.38)}
// Interior lights are invisible; no ceiling fixture obscures the scene.
const L1=new THREE.PointLight(0xffe0a8,1.4,45);L1.position.set(0,y1+6,-40);S.add(L1);const L2=new THREE.PointLight(0x7f9bff,.8,40);L2.position.set(0,y1+7,-36);S.add(L2);
// Buddha + disciples
const GL=0xd9a93a,GL2=0xf0cc66,GD=[GL,GL2,0xd2a238,0xdcb750],BL=0x2a4fa0,HR=0x1a2250;
const goldM=new THREE.MeshPhongMaterial({color:GL,specular:0xffeeaa,shininess:60,emissive:0x3a2a05});
const gild=g=>g.traverse(o=>{if(o.isMesh&&GD.includes(o.material.color.getHex()))o.material=goldM});
box(12,1,6,0x7a3a24,0,y1+.5,zB);
const st=new THREE.Group();st.position.set(0,y1+1,zB);st.scale.setScalar(.9);S.add(st);
const E=(r,c,px,py,pz,a,b,e)=>{const o=sph(r,c,px,py,pz,st);o.scale.set(a||1,b||1,e||1);return o};
cyl(3.4,3.8,.6,GL,0,.3,0,st);
for(let i=0;i<14;i++){const a=i/14*Math.PI*2;E(.8,GL2,Math.cos(a)*3.5,.5,Math.sin(a)*3.5,1,.45,.55).rotation.y=-a}
E(2.6,GL,0,1.3,.2,1.45,.38,.95);E(2,0xc79428,0,1,1.1,1.4,.3,.6);
cyl(1.15,1.7,2.8,GL,0,2.9,0,st);box(.9,2.6,.15,0xc03a2a,.3,3.1,1.25,st).rotation.z=-.5;
E(.75,GL,-1.35,4,0);E(.75,GL,1.35,4,0);
function limb(a,b,radius,parent,color){
 const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),direction=end.clone().sub(start);
 const mesh=add(new THREE.CylinderGeometry(radius,radius*1.12,direction.length(),12),mt(color),0,0,0,parent);
 mesh.position.copy(start.add(end).multiplyScalar(.5));
 mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());return mesh;
}
// Continuous upper arms, elbows and wrists replace the disconnected cylinders.
limb([1.35,4,.1],[1.85,2.85,.55],.38,st,GL);
limb([1.85,2.85,.55],[1.5,1.85,1.25],.3,st,GL);
E(.34,GL,1.85,2.85,.55);E(.33,GL2,1.3,1.7,1.4,1.3,.45,1);
limb([-1.35,4,.1],[-1.75,3.25,.7],.36,st,GL);
limb([-1.75,3.25,.7],[-1.8,4.3,1.15],.27,st,GL);
E(.32,GL,-1.75,3.25,.7);E(.31,GL2,-1.8,4.58,1.15,.85,1.15,.4);
for(let i=0;i<4;i++)cyl(.055,.065,.4,GL2,-1.8+(i-1.5)*.115,4.98,1.15,st);
E(.12,GL2,-1.5,4.55,1.15,.8,1.6,.65).rotation.z=-.45;
cyl(.5,.6,.6,GL,0,4.5,0,st);E(.95,GL2,0,5.4,0,1,1.1,1);
for(const s of[-1,1]){E(.2,GL2,s*.95,5.3,0,.8,2.2,.6);box(.3,.05,.05,0x4a2a10,s*.35,5.5,.9,st)}
E(.97,HR,0,5.75,-.05,1,.7,1);E(.5,HR,0,6.5,0);sph(.07,0xffffff,0,5.65,.93,st);E(.12,GL2,0,5.3,.98);box(.3,.07,.06,0xb04030,0,5,.9,st);
add(new THREE.CylinderGeometry(1.9,1.9,.1,32),mt(BL),0,5.4,-1.2,st).rotation.x=Math.PI/2;add(new THREE.TorusGeometry(1.9,.15,8,40),mt(GL2),0,5.4,-1.2,st);
function arch(sc,c,pz){const sh=new THREE.Shape();sh.moveTo(-3.4*sc,0);sh.bezierCurveTo(-3.8*sc,4.2*sc,-1.6*sc,5.8*sc,0,7.4*sc);sh.bezierCurveTo(1.6*sc,5.8*sc,3.8*sc,4.2*sc,3.4*sc,0);sh.lineTo(-3.4*sc,0);
const o=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.2,bevelEnabled:false}),mt(c));o.position.set(0,.2,pz);st.add(o)}
arch(1,GL,-2.4);arch(.88,BL,-2.2);arch(.72,GL2,-2);gild(st);
// Capture the complete statue and lotus before static meshes are merged.
buddhaBounds=new THREE.Box3().setFromObject(st);
function disc(px,c,old){
 const g=new THREE.Group();g.position.set(px,y1+1,-42.2);S.add(g);
 const robe=old?0xa77a35:0xbd8c3b;
 const shape=[[.001,0],[.8,0],[.83,.25],[.7,2],[.64,3.05],[.4,3.45],[.001,3.5]];
 const m=new THREE.Mesh(new THREE.LatheGeometry(shape.map(p=>new THREE.Vector2(...p)),24),mt(robe));g.add(m);
 cyl(.22,.25,.42,GL2,0,3.58,0,g);sph(.43,GL2,0,4.05,0,g,1.1);
 for(const side of[-1,1]){
  limb([side*.55,3.15,.05],[side*.7,2.5,.45],.2,g,robe);
  limb([side*.7,2.5,.45],[side*.1,2.9,.83],.16,g,robe);
  sph(.16,GL2,side*.1,2.97,.85,g,1.6);
  sph(.055,0x44301e,side*.15,4.08,.4,g);
  sph(.09,GL2,side*.43,4.02,.03,g,1.4);
  if(old)box(.15,.025,.025,0xe9dbc1,side*.15,4.23,.39,g);
 }
 sph(.065,GL2,0,3.99,.45,g);box(.16,.025,.025,0x8b5929,0,3.88,.42,g);
 box(.22,2.5,.05,0x8b572c,.1,1.55,.72,g).rotation.z=-.1;
 gild(g);
}
disc(-6.3,0xd2a238,1);disc(6.3,0xdcb750,0);
})();
// side corridors
for(const s of[-1,1]){const L=74,cz=13;box(.7,4.6,L,RED,s*35,2.3,cz);box(9,.3,L,GRAN,s*31,.15,cz);
for(let z=48;z>=-22;z-=5)cyl(.4,.45,4.6,WHITE,s*27,2.3,z);
box(.6,.6,L,WOODD,s*27,4.8,cz);box(10,.4,L+3,TILE,s*31,5.5,cz).rotation.z=s*.17;box(.5,.5,L+3,TILE2,s*35.6,6.2,cz)}
function wall(x,z,w,d){box(w,3.2,d,RED,x,1.6,z);box(w+.5,.45,d+.5,TILE,x,3.4,z)}
wall(-21.5,52,27,.8);wall(21.5,52,27,.8);wall(-35,-41,.8,30);wall(35,-41,.8,30);wall(0,-56,70,.8);
// gate
(function(){const z=52;box(22,.6,9,GRAN,0,.3,z);
for(const x of[-8,-3.8,3.8,8])for(const s of[-1,1])cyl(.45,.5,6.4,WOODD,x,3.8,z+s*3);
for(const s of[-1,1])box(4.2,5,.5,RED,s*5.9,3.4,z);
box(19,.7,7.5,WOODD,0,7.2,z);roof(0,7.7,z,24,11,2.8,15)})();
// scenery outside
function tree(x,z){const h=3+rnd()*3,r=rnd();cyl(.35,.5,h,0x5a4030,x,h/2,z).castShadow=false;
sph(3+rnd()*1.8,r<.1?0xc0392b:r<.2?0xe3bf36:[0x4f8f45,0x5fa050,0x3f7a3a][(rnd()*3)|0],x,h+2.6,z).castShadow=false}
for(let i=0;i<90;i++){const s=rnd()<.5?-1:1,x=s*(42+rnd()*80),z=100-rnd()*170;tree(x,z)}
for(let i=0;i<30;i++)tree(-70+rnd()*140,-62-rnd()*50);
for(let i=0;i<18;i++){const r=40+rnd()*25,h=80+rnd()*50;add(new THREE.ConeGeometry(r,h,7),mt([0x4f7f5a,0x5f8f66,0x6f9f78][i%3]),-330+i*38+rnd()*20,h/2-1,-230-rnd()*60).castShadow=false}
for(let i=0;i<8;i++)for(const s of[-1,1]){const r=45+rnd()*25,h=60+rnd()*40;add(new THREE.ConeGeometry(r,h,7),mt(0x5f8f66),s*(260+rnd()*40),h/2-1,60-i*45).castShadow=false}
for(let i=0;i<10;i++){const cx=-300+rnd()*600,cy=110+rnd()*60,cz=-280+rnd()*80;for(let j=0;j<4;j++){const o=new THREE.Mesh(new THREE.SphereGeometry(14+rnd()*10,10,8),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}));o.position.set(cx+j*18,cy+rnd()*5,cz);o.scale.y=.5;S.add(o)}}

// Double-eaved Great Hall and plaques, absent from the first version.
roof(0,10.7,-39,42,26,3.4,26);
roof(0,14.25,-39,31,19,2.4,21);
function plaque(text,w,h,x,y,z){
  const texture=cv(768,192,(g,cw,ch)=>{
    g.fillStyle='#263a31';g.fillRect(0,0,cw,ch);
    g.strokeStyle='#b99b58';g.lineWidth=7;g.strokeRect(9,9,cw-18,ch-18);
    g.fillStyle='#e4cd8b';g.textAlign='center';g.textBaseline='middle';
    g.font='96px "Songti TC","PMingLiU",serif';g.fillText(text,cw/2,ch/2+7);
  });
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));
  mesh.position.set(x,y,z);S.add(mesh);
}
plaque('大 雄 寶 殿',6.1,1.4,0,9.1,-30.6);
plaque('報 恩 寺',5,1.2,0,6.35,55.6);
for(const side of[-1,1]){
  // Stone lanterns stay outside the central walking route.
  for(const z of[43,-14]){
    const x=side*15;
    box(1.8,.3,1.8,GRAN,x,.15,z);
    cyl(.4,.6,1.8,GRAN,x,1.2,z);
    box(1.1,.75,1.1,WHITE,x,2.35,z);
    box(.5,.45,1.12,0xd8b76e,x,2.36,z);
    const cap=hip(2,2,.7,.3,TILE2);cap.position.set(x,2.8,z);S.add(cap);
  }
}
// Flatten only static meshes by material. Doors and the visitor stay animated.
function batchStatic(){
  S.updateMatrixWorld(true);
  const groups=new Map(), originals=[];
  S.traverse(o=>{
    if(!o.isMesh || Array.isArray(o.material))return;
    for(let p=o;p&&p!==S;p=p.parent)if(p.userData.dynamic)return;
    const key=o.material.uuid+':'+Number(o.castShadow)+':'+Number(o.receiveShadow);
    let group=groups.get(key);
    if(!group){group={material:o.material,cast:o.castShadow,receive:o.receiveShadow,parts:[]};groups.set(key,group)}
    const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
    geometry.applyMatrix4(o.matrixWorld);
    if(!geometry.getAttribute('normal'))geometry.computeVertexNormals();
    group.parts.push(geometry);originals.push(o);
  });
  for(const group of groups.values()){
    const count=group.parts.reduce((n,g)=>n+g.getAttribute('position').count,0);
    const positions=new Float32Array(count*3),normals=new Float32Array(count*3),uvs=new Float32Array(count*2);
    let offset=0;
    for(const geo of group.parts){
      const p=geo.getAttribute('position'),n=geo.getAttribute('normal'),uv=geo.getAttribute('uv');
      positions.set(p.array,offset*3);normals.set(n.array,offset*3);
      if(uv)uvs.set(uv.array,offset*2);
      offset+=p.count;geo.dispose();
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
    geo.setAttribute('normal',new THREE.BufferAttribute(normals,3));
    geo.setAttribute('uv',new THREE.BufferAttribute(uvs,2));geo.computeBoundingSphere();
    const mesh=new THREE.Mesh(geo,group.material);mesh.castShadow=group.cast;mesh.receiveShadow=group.receive;S.add(mesh);
  }
  const geometries=new Set();
  for(const o of originals){o.parent.remove(o);geometries.add(o.geometry)}
  for(const geo of geometries)geo.dispose();
  return {before:originals.length,after:groups.size};
}
const batching=batchStatic();
// monk
const mk=new THREE.Group();S.add(mk);mk.position.set(0,0,67);
const lat=(p,c)=>{const o=new THREE.Mesh(new THREE.LatheGeometry(p.map(q=>new THREE.Vector2(q[0],q[1])),20),new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide}));o.castShadow=true;return o};
mk.add(lat([[.001,0],[.62,0],[.6,.2],[.52,.6],[.46,.9],[.001,.9]],0xb5c9d4));
const legs=[-.22,.22].map(x=>{const g=new THREE.Group();g.position.set(x,.2,0);mk.add(g);box(.32,.16,.55,0x3a2f28,0,-.12,-.1,g);return g});
const B=new THREE.Group();B.position.set(0,.85,0);mk.add(B);
B.add(lat([[.46,0],[.47,.3],[.41,.7],[.3,.95],[.2,1.05],[.001,1.05]],0xb5c9d4));
box(.5,1.1,.06,0xf0d878,.05,.5,.44,B).rotation.z=.45;
add(new THREE.TorusGeometry(.3,.045,6,18),mt(0x6b3f22),0,1,0,B).rotation.x=Math.PI/2;
sph(.5,0xe9bb8c,0,1.5,0,B,.95);
for(const s of[-1,1]){sph(.09,0xe9bb8c,s*.5,1.5,0,B);sph(.05,0x2a2220,s*.17,1.52,-.465,B);sph(.07,0xf0a090,s*.28,1.4,-.42,B)}
const arms=[-1,1].map(s=>{const g=new THREE.Group();g.position.set(s*.52,.9,0);B.add(g);add(new THREE.CylinderGeometry(.13,.22,.75,10),mt(0xc9d8e0),0,-.4,0,g);sph(.12,0xe9bb8c,0,-.82,0,g);return g});
mk.scale.setScalar(.6);

const woodfish=new THREE.Group();woodfish.visible=false;woodfish.position.set(0,.15,-.7);B.add(woodfish);
sph(.3,0x8a5034,0,0,0,woodfish,.65);
box(.05,.07,.33,0x35271d,0,.18,-.03,woodfish);
const handBeads=new THREE.Mesh(new THREE.TorusGeometry(.19,.035,6,12),mt(0x6b3f22));
handBeads.position.set(0,.25,-.6);handBeads.visible=false;B.add(handBeads);
return {
  avatar:mk,body:B,legs,arms,woodfish,handBeads,batching,buddhaBounds,
  get doorOpen(){return doorOpen},
  updateDoors(dt,position){
    const near=Math.hypot(position.x,position.z+31)<8 || position.z < -30.4;
    doorOpen+=(Number(near)-doorOpen)*Math.min(1,dt*3.6);
    for(const [leaf,side] of leaves)leaf.rotation.y=side*1.5*doorOpen;
  },
  resetDoors(){doorOpen=0;for(const [leaf] of leaves)leaf.rotation.y=0}
};
};
})(window);
