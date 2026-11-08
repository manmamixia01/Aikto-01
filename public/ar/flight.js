import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export async function createFlightAnimation(parent,ratio=.6044){
const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp;
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const ease=(a,b,t)=>{const v=clamp((t-a)/(b-a),0,1);return v*v*(3-2*v);};
const windowAt=(t,a,b,c,d)=>ease(a,b,t)*(1-ease(c,d,t));
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

const scene=new THREE.Group();scene.rotation.x=Math.PI/2;scene.scale.setScalar(Math.min(1,ratio/(5.5/9.1))/9.1);scene.position.z=.003;parent.add(scene);
const birdman=group(scene), platform=group(birdman), plane=group(birdman), lake=group(birdman);
const water=mesh(new THREE.PlaneGeometry(8.7,5.1,1,1),material('#123644',.6,.22),lake,V(0,.025,0));water.rotation.x=-Math.PI/2;
const waves=[];for(let i=0;i<24;i++){const points=[];for(let j=0;j<24;j++)points.push(V(-4.15+j*.36,.035,-2.4+i*.2));waves.push(line(points,'#41717d',lake,.28));}
const flightTrail=group(birdman);const flightLine=line(Array.from({length:100},()=>V()),'#9cd6dc',flightTrail,.35);
const loader=new GLTFLoader();
async function loadGLB(file,parent,width){const gltf=await loader.loadAsync(`/animation/assets/${file}`);const model=gltf.scene;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();}});const bounds=new THREE.Box3().setFromObject(model);const size=bounds.getSize(V()),center=bounds.getCenter(V());model.position.sub(center);const wrap=group(parent);wrap.add(model);wrap.scale.setScalar(width/Math.max(size.x,size.y,size.z));wrap.userData.originalSize=size;return wrap;}

const [platformModel,planeModel]=await Promise.all([loadGLB('platform.glb',platform,4.3),loadGLB('aircraft.glb',plane,6.8)]);
platform.position.set(-1.9,0,-.05);
// Model bounds are evaluated in local coordinates, independent of the AR anchor.
scene.remove(birdman);platformModel.position.y=0;const localBounds=new THREE.Box3().setFromObject(platformModel);platformModel.position.y-=localBounds.min.y;scene.add(birdman);
return {duration:21,update(seconds){const t=43+((seconds%21)+21)%21;
  alpha(birdman,windowAt(t,41,43,62,64));alpha(lake,ease(41,44,t));
  // Each original scaffold component rises into its actual assembled position.
  if(platformModel){let index=0;platformModel.traverse(o=>{if(!o.isMesh)return;const i=index++;if(!o.userData.home){o.userData.home=o.position.clone();o.userData.homeScale=o.scale.clone();}const v=ease(42+(i%18)*.12,44.8+(i%18)*.12,t);o.position.copy(o.userData.home);o.position.y-=(1-v)*Math.max(1,2/platformModel.scale.x);o.scale.copy(o.userData.homeScale).multiplyScalar(Math.max(.001,v));});}
  const fly=ease(51,60,t);plane.position.set(lerp(-1.4,3.4,fly),lerp(2.35,2.5,fly)+Math.sin(fly*Math.PI)*.7,lerp(0,1.05,fly));plane.rotation.set(Math.sin(fly*Math.PI)*-.08,Math.PI/2-fly*.3,-Math.sin(fly*Math.PI)*.12);plane.scale.setScalar(ease(47.5,49.5,t)*(1-ease(61,64,t)*.5));alpha(plane,ease(47.5,49.5,t));
  if(planeModel)planeModel.traverse(o=>{if(/propeller|prop_rotor/i.test(o.name)){if(o.userData.baseRotation===undefined)o.userData.baseRotation=o.rotation.z;o.rotation.z=o.userData.baseRotation+t*12;}});
  const positions=flightLine.geometry.attributes.position;for(let i=0;i<100;i++){const f=fly*i/99;positions.setXYZ(i,lerp(-1.4,3.4,f),lerp(2.35,2.5,f)+Math.sin(f*Math.PI)*.7,lerp(0,1.05,f));}positions.needsUpdate=true;flightLine.visible=fly>0;
  waves.forEach((w,i)=>{w.position.x=Math.sin(t*.4+i)*.025;});

applyFades(scene);
}};
}
