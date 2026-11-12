import * as THREE from 'three';

const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const ease=(a,b,t)=>{const v=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return v*v*(3-2*v);};
const fade=(o,v)=>{o.visible=v>.001;o.userData.fade=v;};
const mat=(color,metalness=.5,roughness=.35,emission=0)=>new THREE.MeshStandardMaterial({color,metalness,roughness,emissive:color,emissiveIntensity:emission});
const Y=V(0,1,0);

// A miniature, V3-inspired Starship stack. Motion is a staged visual narrative,
// not a real trajectory: the launch tower descends through the card surface.
export function createStarshipSequence(parent){
  const root=new THREE.Group();parent.add(root);
  const steel=mat('#c5ced3',.87,.27),seam=mat('#82919c',.8,.43),tile=mat('#111820',.08,.75);
  const black=mat('#202b33',.6,.43),engineMetal=mat('#525f6a',.9,.3);
  const newGroup=p=>{const g=new THREE.Group();p.add(g);return g;};
  const put=(geo,m,p,pos=V())=>{const o=new THREE.Mesh(geo,m.clone());o.position.copy(pos);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
  const box=(p,x,y,z,pos,m=steel)=>put(new THREE.BoxGeometry(x,y,z),m,p,pos);
  const cyl=(p,r,h,y,m=steel)=>put(new THREE.CylinderGeometry(r,r,h,64),m,p,V(0,y,0));
  const bar=(p,a,b,r=.015,m=steel)=>{const o=put(new THREE.CylinderGeometry(r,r,a.distanceTo(b),8),m,p,a.clone().add(b).multiplyScalar(.5));o.quaternion.setFromUnitVectors(Y,b.clone().sub(a).normalize());return o;};
  const ring=(p,y,r=.205,thickness=.0025,m=seam)=>{const o=put(new THREE.TorusGeometry(r,thickness,4,64),m,p,V(0,y,0));o.rotation.x=Math.PI/2;return o;};
  const booster=newGroup(root),ship=newGroup(root),pad=newGroup(root),smoke=newGroup(root);
  // Booster local origin is its center; Ship origin is the separation plane.
  cyl(booster,.205,2.58,0);
  for(let y=-1.25;y<1.27;y+=.135)ring(booster,y);
  for(const a of [.7,3.2]){const raceway=box(booster,.024,2.35,.02,V(Math.sin(a)*.207,0,Math.cos(a)*.207),seam);raceway.rotation.y=a;}
  // Open hot-stage vent ring; ribs leave actual gaps rather than a black stripe.
  ring(booster,1.3,.206,.012);ring(booster,1.47,.206,.012);
  for(let i=0;i<32;i++){const a=i*Math.PI/16;const rib=box(booster,.012,.17,.014,V(Math.sin(a)*.204,1.385,Math.cos(a)*.204),steel);rib.rotation.y=a;}
  cyl(booster,.18,.025,1.29,black);
  // Three open lattice grid fins near the top of Super Heavy.
  for(let i=0;i<3;i++){
    const fin=newGroup(booster);fin.position.set(0,.99,0);fin.rotation.y=i*Math.PI*2/3;
    const hinge=newGroup(fin);hinge.position.z=.31;
    for(const x of [-.13,.13])box(hinge,.016,.025,.23,V(x,0,0),black);
    for(const z of [-.115,.115])box(hinge,.27,.025,.016,V(0,0,z),black);
    for(let j=-3;j<=3;j++)box(hinge,.007,.02,.22,V(j*.034,0,0),steel);
    for(let j=-2;j<=2;j++)box(hinge,.25,.02,.007,V(0,0,j*.04),steel);
    bar(fin,V(0,0,.17),V(0,0,.3),.022,black);
  }
  function bell(p,x,y,z,r){
    const profile=[[r*.46,.065],[r*.40,.035],[r*.58,0],[r,-.075]].map(v=>new THREE.Vector2(...v));
    const m=engineMetal.clone();m.side=THREE.DoubleSide;
    return put(new THREE.LatheGeometry(profile,16),m,p,V(x,y,z));
  }
  // 20 + 10 + 3 engine bells, laid out in concentric rings.
  for(const [count,radius,size] of [[20,.162,.025],[10,.103,.025],[3,.035,.027]])for(let i=0;i<count;i++){
    const a=i*Math.PI*2/count;bell(booster,Math.cos(a)*radius,-1.31,Math.sin(a)*radius,size);
  }
  cyl(ship,.205,1.12,.56);
  const profile=[[.205,0],[.202,.10],[.187,.23],[.158,.36],[.113,.49],[.054,.60],[0,.67]].map(p=>new THREE.Vector2(...p));
  put(new THREE.LatheGeometry(profile,64),steel,ship,V(0,1.12,0));
  put(new THREE.CylinderGeometry(.207,.207,1.12,64,1,true,-Math.PI/2,Math.PI),tile,ship,V(0,.56,0));
  const shieldProfile=profile.map(p=>new THREE.Vector2(p.x+.0016,p.y));
  put(new THREE.LatheGeometry(shieldProfile,40,-Math.PI/2,Math.PI),tile,ship,V(0,1.12,0));
  for(let y=.08;y<1.1;y+=.13)ring(ship,y);
  // Small, staggered hexagonal faces make the heat shield read as tiles.
  const tileGeo=new THREE.CircleGeometry(.018,6),tileMat=mat('#263039',.03,.9);
  const tiles=new THREE.InstancedMesh(tileGeo,tileMat,24*16),dummy=new THREE.Object3D();let index=0;
  for(let row=0;row<24;row++)for(let col=0;col<16;col++){
    const a=-1.42+col*.185+(row%2)*.08;
    dummy.position.set(Math.sin(a)*.209,.025+row*.045,Math.cos(a)*.209);dummy.rotation.set(0,a,Math.PI/6);dummy.updateMatrix();tiles.setMatrixAt(index++,dummy.matrix);
  }ship.add(tiles);
  function flap(side,baseY,points){
    const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x*side,y):shape.moveTo(x*side,y));shape.closePath();
    const o=put(new THREE.ExtrudeGeometry(shape,{depth:.024,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.005,bevelThickness:.004}),tile,ship,V(0,baseY,.025));
    const outline=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,30),new THREE.LineBasicMaterial({color:'#7a8992'}));o.add(outline);
  }
  for(const side of [-1,1]){
    flap(side,.02,[[.18,0],[.43,.02],[.40,.31],[.22,.52],[.18,.48]]);
    flap(side,1.14,[[.16,0],[.29,.05],[.25,.26],[.11,.39]]);
  }
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;bell(ship,Math.cos(a)*.12,-.035,Math.sin(a)*.12,.058);bell(ship,Math.cos(a+.7)*.047,-.02,Math.sin(a+.7)*.047,.031);}
  // Orbital launch mount and a square, braced Mechazilla-inspired tower.
  cyl(pad,.43,.14,.22,black);ring(pad,.3,.43,.025,steel);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;bar(pad,V(Math.cos(a)*.39,.25,Math.sin(a)*.39),V(Math.cos(a)*.51,.02,Math.sin(a)*.51),.04,black);}
  const tower=newGroup(pad);tower.position.set(-.85,0,-.12);
  for(const x of [-.23,.23])for(const z of [-.23,.23])bar(tower,V(x,0,z),V(x,4.46,z),.033,steel);
  for(let y=.12;y<4.3;y+=.43){
    for(const z of [-.23,.23]){bar(tower,V(-.23,y,z),V(.23,y+.4,z),.014,seam);bar(tower,V(.23,y,z),V(-.23,y+.4,z),.014,seam);}
    for(const x of [-.23,.23])bar(tower,V(x,y,-.23),V(x,y+.4,.23),.015,seam);
    box(tower,.51,.025,.51,V(0,y,0),black);
  }
  box(tower,.55,.15,.55,V(0,4.46,0),black);
  const catchArms=newGroup(tower);catchArms.position.y=2.8;
  for(const z of [-.3,.3]){box(catchArms,.92,.07,.065,V(.37,0,z),steel);bar(catchArms,V(0,.26,z),V(.76,0,z),.016,seam);}
  const flameMat=mat('#ffa44d',0,.35,3.5),coreMat=mat('#b6e5ff',0,.3,5);
  function plume(p,y,length,width){const g=newGroup(p);g.position.y=y;const outer=put(new THREE.ConeGeometry(width,length,32),flameMat,g,V(0,-length/2,0));outer.rotation.z=Math.PI;const inner=put(new THREE.ConeGeometry(width*.42,length*.75,24),coreMat,g,V(0,-length*.375,0));inner.rotation.z=Math.PI;return g;}
  const boosterFlame=plume(booster,-1.38,1.2,.19),shipFlame=plume(ship,-.1,.72,.12);
  const puffs=[];for(let i=0;i<24;i++)puffs.push(put(new THREE.SphereGeometry(.14,12,8),mat('#b4bec4',0,1),smoke));
  root.position.x=-.9;
  // These are shared rigid-body transforms until the separation moment.
  const rotation=new THREE.Quaternion(),joint=V(),boosterCenter=V();
  function update(t){
    fade(root,ease(0,.65,t)*(1-ease(9.5,11.2,t)));
    const rise=ease(.7,4.5,t),lean=ease(4.5,8.9,t),separation=ease(6.8,9.5,t);
    rotation.setFromAxisAngle(V(0,0,1),-lean*Math.PI*.43);
    const center=V(-.12+ease(5,9.5,t)*.65,2.12+rise*.78,0);
    joint.copy(V(0,.75,0)).applyQuaternion(rotation).add(center);
    boosterCenter.copy(V(0,-.72,0)).applyQuaternion(rotation).add(center);
    ship.position.copy(joint).add(V(separation*1.05,separation*.2,0));ship.quaternion.copy(rotation);ship.rotateY(-.4);
    booster.position.copy(boosterCenter).add(V(-separation*.65,-separation*1.35,separation*.12));
    booster.quaternion.copy(rotation);booster.rotateZ(separation*.24);
    pad.position.y=-4.7*ease(.9,4.3,t);pad.visible=t<4.3;
    catchArms.scale.z=1+ease(.5,2,t)*.35;
    fade(boosterFlame,ease(.5,1.1,t)*(1-ease(6.5,7.2,t)));
    boosterFlame.scale.set(1+Math.sin(t*43)*.025,.65+rise*.35+Math.sin(t*34)*.035,1);
    fade(shipFlame,ease(6.6,7.2,t));shipFlame.scale.y=.8+Math.sin(t*39)*.04;
    for(let i=0;i<puffs.length;i++){
      const age=(t*.38+i/24)%1,a=i*2.39996,p=puffs[i];
      p.position.set(Math.cos(a)*age*1.2,.1+age*.15,Math.sin(a)*age*.85);
      p.scale.setScalar(.2+age*2.7);fade(p,ease(.4,1.2,t)*(1-ease(2.6,4.4,t))*(1-age)*.35);
    }
  }
  update(0);
  return {root,pad,ship,booster,update};
}
