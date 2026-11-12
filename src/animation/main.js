import { createLunarPortal } from './lunar-portal.js';
import { createStarshipSequence } from './starship.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $=id=>document.getElementById(id), DURATION=64;
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
function label(text,parent,position,size=.19,color='#a2b5bd'){
  const c=document.createElement('canvas');c.width=512;c.height=64;const ctx=c.getContext('2d');ctx.font='400 27px monospace';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,256,43);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));sprite.position.copy(position);sprite.scale.set(size*8,size,1);parent.add(sprite);return sprite;
}
let renderer;
try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(err){$('loading').hidden=true;$('error').hidden=false;$('error').textContent='3D表示を開始できませんでした。ブラウザのハードウェアアクセラレーションを有効にして再読み込みしてください。';throw err;}
renderer.localClippingEnabled=true;
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;$('viewport').appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#090e15');scene.fog=new THREE.FogExp2('#090e15',.018);
const camera=new THREE.PerspectiveCamera(35,1,.1,90);camera.position.set(11,9,14);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.4,0);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=9;controls.maxDistance=28;controls.maxPolarAngle=Math.PI*.48;controls.minPolarAngle=.15;
const environment=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(environment,.04).texture;scene.environmentIntensity=.45;environment.dispose();pmrem.dispose();
scene.add(new THREE.HemisphereLight('#d4eaff','#132237',1.25));
const key=new THREE.DirectionalLight('#fff1d9',2.6);key.position.set(-4,10,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.5,far:35});key.shadow.bias=-.0004;scene.add(key);
const rim=new THREE.DirectionalLight('#72d9ff',1.7);rim.position.set(5,5,-7);scene.add(rim);
const fill=new THREE.PointLight('#ffb461',8,14,2);fill.position.set(-4,1,3);scene.add(fill);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.22,.4,3.0);composer.addPass(bloom);composer.addPass(new OutputPass());
const lunar=createLunarPortal(scene),card=lunar.card;
label('91 mm',card,V(0,.04,3.03),.19);label('55 mm',card,V(-4.95,.04,0),.19);label('AKITO  /  01',card,V(3.4,.06,2.4),.12);

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
async function init(){
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
  $('loading').hidden=true;ready=true;seek(Number(new URL(location.href).searchParams.get('t'))||0);if(new URL(location.href).searchParams.has('paused'))playing=false;syncPlay();
  window.animationPreview={seek, setPlaying:value=>{playing=value;syncPlay();},getState:()=>({time,ready,playing,autoCamera,assets:4,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles}),duration:DURATION};
}
let time=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,ready=false,autoCamera=true,last=performance.now();
const chapters=[
 {start:0,title:'重力の、その先へ。',description:'SUPER HEAVY → STARSHIP',label:'打ち上げ'},
 {start:10,title:'月へ、エネルギーを。',description:'HELIOS N1 / LUNAR POWER TRANSMISSION',label:'衛星・受光'},
 {start:22,title:'手の動きを、かたちに。',description:'HAND → SKELETON',label:'手・骨格'},
 {start:32,title:'あなたの手から、生まれる。',description:'KINETICFIT / PERSONALIZED KEYBOARD',label:'キーボード'},
 {start:42,title:'飛び立つための、構造。',description:'BIRDMAN / PLATFORM ASSEMBLY',label:'足場'},
 {start:51,title:'つくる。その先へ飛ぶ。',description:'BIRDMAN / GLIDER FLIGHT',label:'飛行'}
];
let chapterIndex=-1;
function update(t){
  const c=chapters.findLastIndex(c=>t>=c.start);if(c!==chapterIndex){chapterIndex=c;$('chapter-number').textContent=`0${c+1} / 06`;$('chapter-title').textContent=chapters[c].title;$('chapter-description').textContent=chapters[c].description;document.querySelectorAll('[data-time]').forEach((b,i)=>{b.classList.toggle('active',i===c);b.setAttribute('aria-current',i===c?'step':'false');});}
  launchSequence.update(t);
  lunar.update(t);
  alpha(orbital,windowAt(t,9.8,11.6,21,23));
  const emerge=ease(9.8,12.4,t),travel=ease(11.2,14.3,t);
  // Begin inside the upper-stage center, then drift to the transmitting position.
  const payloadCenter=launchSequence.ship.localToWorld(V(0,.9,0));
  const drift=ease(14.3,21.5,t);
  satellite.position.copy(payloadCenter).lerp(V(-1.6+drift*1.15,3.05+Math.sin(drift*Math.PI)*.16,-.65+drift*.4),travel);
  satellite.scale.setScalar(lerp(.035,1,emerge));
  scene.updateMatrixWorld(true);
  const destination=lunar.target.getWorldPosition(V());
  const forward=destination.clone().sub(satellite.position).normalize();
  const wing=V(0,0,1).addScaledVector(forward,-forward.z).normalize();
  const normal=new THREE.Vector3().crossVectors(forward,wing).normalize();
  satellite.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(forward,wing,normal));
  satellite.rotateX(.4);
  satellite.updateMatrixWorld(true);
  const source=satellite.localToWorld(aperture.clone());
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
  if(autoCamera){const mobile=innerWidth<700;const angle=.52+Math.sin(t/DURATION*Math.PI*2)*.09;const distance=mobile?31.5:18.5;camera.position.set(Math.sin(angle)*distance,mobile?18.5:12.2,Math.cos(angle)*distance);controls.target.set(0,mobile?-1:.55,0);camera.lookAt(controls.target);}else controls.update();
  applyFades(scene);$('timeline').value=t;$('timeline').style.setProperty('--progress',`${t/DURATION*100}%`);$('time-label').textContent=`${String(Math.floor(t)).padStart(2,'0')} / 64 s`;
}
function seek(t){time=clamp(t,0,DURATION-.001);if(ready)update(time);}
function syncPlay(){$('play').textContent=playing?'一時停止':'再生';$('play').setAttribute('aria-label',playing?'一時停止':'再生');$('play').setAttribute('aria-pressed',String(playing));}
$('play').onclick=()=>{playing=!playing;syncPlay();};$('replay').onclick=()=>{seek(0);playing=true;syncPlay();};$('timeline').oninput=e=>seek(Number(e.target.value));
document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>seek(Number(b.dataset.time)+.01));
$('orbit').onclick=()=>{autoCamera=!autoCamera;$('orbit').textContent=autoCamera?'視点：自動':'視点：自由';$('orbit').setAttribute('aria-pressed',String(!autoCamera));};
$('reset-view').onclick=()=>{autoCamera=true;$('orbit').textContent='視点：自動';$('orbit').setAttribute('aria-pressed','false');controls.target.set(0,.55,0);};
controls.addEventListener('start',()=>{autoCamera=false;$('orbit').textContent='視点：自由';$('orbit').setAttribute('aria-pressed','true');});
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}};
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','BUTTON'].includes(e.target.tagName)){e.preventDefault();playing=!playing;syncPlay();}});
document.addEventListener('visibilitychange',()=>last=performance.now());
function resize(){const w=$('viewport').clientWidth,h=$('viewport').clientHeight;renderer.setSize(w,h);composer.setSize(w,h);camera.aspect=w/h;camera.fov=innerWidth<700?42:35;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe($('viewport'));resize();
function tick(now){requestAnimationFrame(tick);const delta=Math.min((now-last)/1000,.08);last=now;if(!ready)return;if(playing)time=(time+delta*Number($('speed').value))%DURATION;update(time);composer.render();}requestAnimationFrame(tick);
init().catch(error=>{console.error(error);$('loading').hidden=true;$('error').hidden=false;$('error').textContent='3D素材を読み込めませんでした。通信を確認して再読み込みしてください。';});
