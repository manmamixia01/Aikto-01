import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {ConvexGeometry} from 'three/addons/geometries/ConvexGeometry.js';
import {createLunarPortal} from './lunar-portal.js';
import {createStarshipSequence} from './starship.js';
export async function createCardAnimation({ar=false}={}){
const scene=new THREE.Group();
const clamp=THREE.MathUtils.clamp, lerp=THREE.MathUtils.lerp;
const ease=(a,b,t)=>{const v=clamp((t-a)/(b-a),0,1);return v*v*(3-2*v);};
const windowAt=(t,a,b,c,d)=>ease(a,b,t)*(1-ease(c,d,t));
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const materials=[];
function material(color,metalness=.1,roughness=.4,emission=0){const m=new THREE.MeshStandardMaterial({color,metalness,roughness,emissive:color,emissiveIntensity:emission});return m;}
const silver=material('#bdcbd2',.88,.27), dark=material('#172029',.65,.32), gold=material('#e5b869',.7,.3), ivory=material('#eae8df',.05,.5);
const cyan=material('#65e8ef',.2,.2,2), amber=material('#ff9f4b',.1,.25,2.5);
function mesh(geometry,mat,parent,pos){const o=new THREE.Mesh(geometry,mat.clone());o.castShadow=true;o.receiveShadow=true;if(pos)o.position.copy(pos);parent?.add(o);return o;}
function box(parent,size,pos,mat=dark,rounded=0){return mesh(rounded?new RoundedBoxGeometry(...size,2,rounded):new THREE.BoxGeometry(...size),mat,parent,V(...pos));}
function cylinder(parent,r1,r2,h,pos,mat=silver,n=32){return mesh(new THREE.CylinderGeometry(r1,r2,h,n),mat,parent,V(...pos));}
function sphere(parent,r,pos,mat=cyan){return mesh(new THREE.SphereGeometry(r,16,12),mat,parent,V(...pos));}
function rod(parent,a,b,r,mat=silver){const o=cylinder(parent,r,r,1,[0,0,0],mat,12);orientRod(o,a,b);return o;}
function orientRod(o,a,b){o.position.copy(a).add(b).multiplyScalar(.5);o.scale.y=a.distanceTo(b);o.quaternion.setFromUnitVectors(V(0,1,0),b.clone().sub(a).normalize());}
function group(parent){const g=new THREE.Group();parent?.add(g);return g;}
function alpha(root,value){root.userData.fade=value;root.visible=value>.001;}
function applyFades(root,parent=1){if(!root.visible)return;const value=parent*(root.userData.fade??1);if(root.material){for(const m of Array.isArray(root.material)?root.material:[root.material]){if(m.userData.originalOpacity===undefined){m.userData.originalOpacity=m.opacity;m.userData.originalTransparent=m.transparent;m.userData.originalDepthWrite=m.depthWrite;}const opacity=m.userData.originalOpacity*value;m.transparent=m.userData.originalTransparent||opacity<.999;m.opacity=opacity;m.depthWrite=m.userData.originalDepthWrite&&opacity>.45;}}for(const child of root.children)applyFades(child,value);}

function line(points,color,parent,opacity=1){const o=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity}));parent.add(o);return o;}
const lunar=createLunarPortal(scene,{ar}),card=lunar.card;

const launchSequence=createStarshipSequence(scene);

const orbital=group(scene), satellite=group(orbital);
const laser=group(orbital);
const laserCore=rod(laser,V(),V(1,1,0),.014,material('#ff731c',0,.25,2));
const laserHalo=rod(laser,V(),V(1,1,0),.042,material('#ff6817',0,.5,.6));laserHalo.material.transparent=true;laserHalo.material.opacity=.17;laserHalo.material.depthWrite=false;
let aperture=V(.1,0,0);
// A travelling light carries the narrative across every scene transition.
const connector=group(scene), spark=sphere(connector,.07,[0,0,0],material('#b8ffff',0,.15,4));
const pathPoints=[V(2,.5,0),V(2.3,1.4,.2),V(0,2.6,.4),V(-1,1.8,0),V(0,.4,0)];
const curve=new THREE.CatmullRomCurve3(pathPoints);const trail=mesh(new THREE.TubeGeometry(curve,100,.012,8,false),cyan,connector);trail.material.transparent=true;trail.material.opacity=.5;

const kinetic=group(scene), hand=group(kinetic), skin=group(hand), skeleton=group(hand), keyboard=group(kinetic);
let handData,keyData,skinPalm,skinBones=[],jointMeshes=[],boneMeshes=[],keyMeshes=[];
const fingers=[[0,1,2,3,4],[0,5,6,7,8],[0,9,10,11,12],[0,13,14,15,16],[0,17,18,19,20]];
// Proper rotation from measured coordinates: +x fingers -> -z, +z palm -> -y.
const mapPoint=p=>V(p[1]*.022,-p[2]*.022+1.9,-(p[0]-85)*.022);
function buildHandAndKeys(data){
  handData=data.hand;keyData=data.keys;
  const pts=Object.values(handData.open).map(mapPoint);
  const skinMat=material('#c6ad99',.02,.53),boneMat=material('#e5f6f3',.15,.38,.15);
  for(let i=0;i<21;i++){const joint=sphere(skeleton,i===0?.09:.055,[0,0,0],material('#65e8ef',.2,.3,.7));jointMeshes.push(joint);}
  for(const finger of fingers)for(let i=0;i<4;i++){
    const a=finger[i],b=finger[i+1];const radius=(i===0?.115:.095)*(finger===fingers[0]?.85:1);
    const s=rod(skin,pts[a],pts[b],radius,skinMat);const end=sphere(skin,radius,[...pts[b]],skinMat);skinBones.push({s,end,a,b});
    const bone=rod(skeleton,pts[a],pts[b],i===0?.027:.039,boneMat);boneMeshes.push({bone,a,b});
  }
  const palmPoints=[];for(const i of [0,1,2,5,9,13,17])for(const dy of [-.10,.10])palmPoints.push(pts[i].clone().add(V(0,dy,0)));
  skinPalm=mesh(new ConvexGeometry(palmPoints),skinMat,skin);
  for(const entry of keyData){const cap=box(keyboard,[.376,.11,.376],[0,0,0],entry.finger==='thumb'?gold:ivory,.035);const normal=mapPoint(entry.normal).sub(mapPoint([0,0,0])).normalize();const depth=mapPoint(entry.tangent).sub(mapPoint([0,0,0])).normalize();const right=new THREE.Vector3().crossVectors(normal,depth).normalize();cap.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,normal,depth));const p=mapPoint(entry.pos);cap.userData.target=p;keyMeshes.push(cap);const inset=box(cap,[.28,.012,.28],[0,.06,0],entry.finger==='thumb'?gold:material('#cdd4d6',.2,.5),.025);}
}
function animateHand(t){const pose=ease(29,36,t),a=handData.open,b=handData.pressure||handData.natural||a;const pts=[];for(let i=0;i<21;i++){const p=mapPoint(a[i]).lerp(mapPoint(b[i]),pose);pts.push(p);jointMeshes[i].position.copy(p);}for(const s of skinBones){orientRod(s.s,pts[s.a],pts[s.b]);s.end.position.copy(pts[s.b]);}for(const s of boneMeshes)orientRod(s.bone,pts[s.a],pts[s.b]);}

const birdman=group(scene), platform=group(birdman), plane=group(birdman), lake=group(birdman);
const water=mesh(new THREE.PlaneGeometry(8.7,5.1,1,1),material('#123644',.6,.22),lake,V(0,.025,0));water.rotation.x=-Math.PI/2;
const waves=[];for(let i=0;i<24;i++){const points=[];for(let j=0;j<24;j++)points.push(V(-4.15+j*.36,.035,-2.4+i*.2));waves.push(line(points,'#41717d',lake,.28));}
const flightTrail=group(birdman);const flightLine=line(Array.from({length:100},()=>V()),'#9cd6dc',flightTrail,.35);
const loader=new GLTFLoader();
async function loadGLB(file,parent,width){const gltf=await loader.loadAsync(`/animation/assets/${file}`);const model=gltf.scene;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();}});const bounds=new THREE.Box3().setFromObject(model);const size=bounds.getSize(V()),center=bounds.getCenter(V());model.position.sub(center);const wrap=group(parent);wrap.add(model);wrap.scale.setScalar(width/Math.max(size.x,size.y,size.z));wrap.userData.originalSize=size;return wrap;}
let platformModel,planeModel,satelliteModel,caseModel;
  const data=await (await fetch('/animation/assets/keyboard-data.json')).json();buildHandAndKeys(data);
  [satelliteModel,platformModel,planeModel]=await Promise.all([
    loadGLB('transmitter.glb',satellite,6.8),loadGLB('platform.glb',platform,4.3),loadGLB('aircraft.glb',plane,6.8)
  ]);
  const [caseGeometry,handGeometry]=await Promise.all([new STLLoader().loadAsync('/animation/assets/keyboard-case.stl'),new STLLoader().loadAsync('/animation/assets/hand-open.stl')]);
  for(const geometry of [caseGeometry,handGeometry]){const p=geometry.getAttribute('position');for(let i=0;i<p.count;i++){const v=mapPoint([p.getX(i),p.getY(i),p.getZ(i)]);p.setXYZ(i,v.x,v.y,v.z);}geometry.computeVertexNormals();}
  caseModel=mesh(caseGeometry,material('#617c87',.7,.3),keyboard);caseModel.material.side=THREE.DoubleSide;
  skin.clear();skinBones=[];mesh(handGeometry,material('#c6b3a3',.03,.48),skin);
  // Converted assets are centered and upright. Keep the platform deck at a readable scale.
  platform.position.set(-1.9,0,-.05);const platformBox=new THREE.Box3().setFromObject(platformModel);platformModel.position.y-=platformBox.min.y;
  aperture.fromArray((await (await fetch('/animation/assets/transmitter.json')).json()).aperture);
  aperture.multiplyScalar(satelliteModel.scale.x);

function update(seconds){const t=((seconds%64)+64)%64;
  launchSequence.update(t);
  lunar.update(t);
  alpha(orbital,windowAt(t,9.8,11.6,21,23));
  const emerge=ease(9.8,12.4,t),travel=ease(11.2,14.3,t);
  // Begin inside the upper-stage center, then drift to the transmitting position.
  const payloadCenter=scene.worldToLocal(launchSequence.ship.localToWorld(V(0,.9,0)));
  const drift=ease(14.3,21.5,t);
  satellite.position.copy(payloadCenter).lerp(V(-1.6+drift*1.15,3.05+Math.sin(drift*Math.PI)*.16,-.65+drift*.4),travel);
  satellite.scale.setScalar(lerp(.035,1,emerge));
  scene.updateMatrixWorld(true);
  const destination=scene.worldToLocal(lunar.target.getWorldPosition(V()));
  const forward=destination.clone().sub(satellite.position).normalize();
  const wing=V(0,0,1).addScaledVector(forward,-forward.z).normalize();
  const normal=new THREE.Vector3().crossVectors(forward,wing).normalize();
  satellite.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(forward,wing,normal));
  satellite.rotateX(.4);
  satellite.updateMatrixWorld(true);
  const source=scene.worldToLocal(satellite.localToWorld(aperture.clone()));
  const endpoint=source.clone().lerp(destination,ease(15.2,16.6,t));
  orientRod(laserCore,source,endpoint);orientRod(laserHalo,source,endpoint);
  alpha(laser,windowAt(t,15.2,15.6,20.5,21.3));
  const bridge=windowAt(t,20,21.3,25,26.5);alpha(connector,bridge);spark.position.copy(curve.getPoint(ease(20.5,24.5,t)));trail.geometry.setDrawRange(0,Math.floor(ease(20.5,24,t)*600)*8);
  alpha(kinetic,windowAt(t,22,24,40.5,43));kinetic.position.set(0,ease(40,43,t)*-.8,0);kinetic.rotation.y=lerp(-.2,.17,ease(23,41,t));animateHand(t);
  alpha(skin,1-ease(26.5,29.5,t));alpha(skeleton,windowAt(t,26,28,37.5,40));
  const kb=ease(31,34,t);alpha(keyboard,kb);for(let i=0;i<keyMeshes.length;i++){const k=keyMeshes[i],p=ease(31+i*.075,33+i*.075,t);k.position.copy(k.userData.target);k.position.y-=(1-p)*1.2;k.scale.setScalar(.01+.99*p);}
  if(caseModel){alpha(caseModel,ease(34,36.5,t));caseModel.position.y=-(1-ease(34,36.5,t))*.5;}
  alpha(birdman,windowAt(t,41,43,62,64));alpha(lake,ease(41,44,t));
  // Each original scaffold component rises into its actual assembled position.
  if(platformModel){let index=0;platformModel.traverse(o=>{if(!o.isMesh)return;const i=index++;if(!o.userData.home){o.userData.home=o.position.clone();o.userData.homeScale=o.scale.clone();}const v=ease(42+(i%18)*.12,44.8+(i%18)*.12,t);o.position.copy(o.userData.home);o.position.y-=(1-v)*Math.max(1,2/platformModel.scale.x);o.scale.copy(o.userData.homeScale).multiplyScalar(Math.max(.001,v));});}
  const fly=ease(51,60,t);plane.position.set(lerp(-1.4,3.4,fly),lerp(2.35,2.5,fly)+Math.sin(fly*Math.PI)*.7,lerp(0,1.05,fly));plane.rotation.set(Math.sin(fly*Math.PI)*-.08,Math.PI/2-fly*.3,-Math.sin(fly*Math.PI)*.12);plane.scale.setScalar(ease(47.5,49.5,t)*(1-ease(61,64,t)*.5));alpha(plane,ease(47.5,49.5,t));
  if(planeModel)planeModel.traverse(o=>{if(/propeller|prop_rotor/i.test(o.name)){if(o.userData.baseRotation===undefined)o.userData.baseRotation=o.rotation.z;o.rotation.z=o.userData.baseRotation+t*12;}});
  const positions=flightLine.geometry.attributes.position;for(let i=0;i<100;i++){const f=fly*i/99;positions.setXYZ(i,lerp(-1.4,3.4,f),lerp(2.35,2.5,f)+Math.sin(f*Math.PI)*.7,lerp(0,1.05,f));}positions.needsUpdate=true;flightLine.visible=fly>0;
  waves.forEach((w,i)=>{w.position.x=Math.sin(t*.4+i)*.025;});
  lunar.updateClipPlanes();applyFades(scene);
}
update(0);return {root:scene,card:lunar.card,duration:64,update};
}
