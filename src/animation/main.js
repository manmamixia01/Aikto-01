import {createCardAnimation} from './card-scene.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $=id=>document.getElementById(id), DURATION=64;
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=THREE.MathUtils.clamp;
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
let animation;
async function init(){
  animation=await createCardAnimation();scene.add(animation.root);
  label('91 mm',animation.card,V(0,.04,3.03),.19);label('55 mm',animation.card,V(-4.95,.04,0),.19);label('AKITO / 01',animation.card,V(3.4,.06,2.4),.12);
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
  animation.update(t);
  if(autoCamera){const mobile=innerWidth<700;const angle=.52+Math.sin(t/DURATION*Math.PI*2)*.09;const distance=mobile?31.5:18.5;camera.position.set(Math.sin(angle)*distance,mobile?18.5:12.2,Math.cos(angle)*distance);controls.target.set(0,mobile?-1:.55,0);camera.lookAt(controls.target);}else controls.update();
  $('timeline').value=t;$('timeline').style.setProperty('--progress',`${t/DURATION*100}%`);$('time-label').textContent=`${String(Math.floor(t)).padStart(2,'0')} / 64 s`;
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
