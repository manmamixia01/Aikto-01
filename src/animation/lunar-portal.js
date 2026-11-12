import * as THREE from 'three';

const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const ease=(a,b,t)=>{const v=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return v*v*(3-2*v);};
const mat=(color,metalness=.1,roughness=.65)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const gray=mat('#c8c6bf',.4,.48),dark=mat('#27313a',.6,.4),soil=mat('#85817a',.03,1);

export function createLunarPortal(scene){
  const card=new THREE.Group(),world=new THREE.Group();scene.add(card,world);
  const mesh=(p,g,m,pos=V())=>{const o=new THREE.Mesh(g,m.clone());o.position.copy(pos);o.receiveShadow=true;o.castShadow=true;p.add(o);return o;};
  const box=(p,w,h,d,pos,m=gray)=>mesh(p,new THREE.BoxGeometry(w,h,d),m,pos);
  const cylinder=(p,r,h,pos,m=gray)=>mesh(p,new THREE.CylinderGeometry(r,r,h,24),m,pos);
  const line=(p,pts,color,opacity=1)=>{const o=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity}));p.add(o);return o;};
  const bar=(p,a,b,r=.025,m=gray)=>{const o=cylinder(p,r,a.distanceTo(b),a.clone().add(b).multiplyScalar(.5),m);o.quaternion.setFromUnitVectors(V(0,1,0),b.clone().sub(a).normalize());return o;};
  // A real opening in the foreground plane: lunar geometry continues well past its edges.
  const surround=new THREE.Shape();surround.moveTo(-100,-100);surround.lineTo(100,-100);surround.lineTo(100,100);surround.lineTo(-100,100);surround.closePath();
  const cutout=new THREE.Path();cutout.moveTo(-4.55,-2.75);cutout.lineTo(-4.55,2.75);cutout.lineTo(4.55,2.75);cutout.lineTo(4.55,-2.75);cutout.closePath();surround.holes.push(cutout);
  const ground=mesh(scene,new THREE.ShapeGeometry(surround),mat('#0b111b',.2,.72),V(0,-.055,0));ground.rotation.x=-Math.PI/2;ground.castShadow=false;
  const clip=[new THREE.Plane(V(1,0,0),4.55),new THREE.Plane(V(-1,0,0),4.55)];
  const doors=[new THREE.Group(),new THREE.Group()];doors.forEach(d=>card.add(d));
  doors.forEach((d,i)=>{
    const sign=i===0?-1:1;
    box(d,4.55,.09,5.5,V(sign*2.275,-.045,0),mat('#17212c',.48,.36));
    for(let x=.5;x<4.5;x+=.5)line(d,[V(sign*x,.007,-2.5),V(sign*x,.007,2.5)],'#30434f',.18);
    for(let z=-2.5;z<=2.5;z+=.5)line(d,[V(sign*.04,.008,z),V(sign*4.35,.008,z)],'#30434f',.18);
    line(d,[V(sign*.018,.015,-2.65),V(sign*.018,.015,2.65)],'#8b9fa7',.5);
    d.traverse(o=>{if(o.material){o.material.clippingPlanes=clip;o.material.clipShadows=true;}});
  });
  for(const z of [-2.75,2.75])box(card,9.16,.055,.035,V(0,-.005,z),dark);
  for(const x of [-4.55,4.55])box(card,.035,.055,5.5,V(x,-.005,0),dark);
  line(card,[V(-4.55,.025,-2.75),V(4.55,.025,-2.75),V(4.55,.025,2.75),V(-4.55,.025,2.75),V(-4.55,.025,-2.75)],'#b6d4d8',.8);
  for(const x of [-4.35,4.35])for(const z of [-2.55,2.55]){
    const d=doors[x<0?0:1];line(d,[V(x-.07,.02,z),V(x+.07,.02,z)],'#b8cace');line(d,[V(x,.02,z-.07),V(x,.02,z+.07)],'#b8cace');
  }
  doors.forEach(d=>d.traverse(o=>{if(o.material){o.material.clippingPlanes=clip;o.material.clipShadows=true;}}));
  // A dark recessed lip establishes the portal's depth at every orbit angle.
  for(const z of [-2.76,2.76])box(card,9.15,.26,.04,V(0,-.16,z),dark);
  for(const x of [-4.56,4.56])box(card,.04,.26,5.5,V(x,-.16,0),dark);
  // Seeded terrain and crater bowls make all scrub positions reproducible.
  let seed=713;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const craters=[[-2.9,.6,1.02],[2.9,-1.8,.8],[-.3,-2.4,.55],[3,2.5,1.1],[-4.6,-2,1.25]];
  for(let i=0;i<32;i++)craters.push([(rand()-.5)*19,(rand()-.5)*15,.12+rand()*.42]);
  function height(x,z){
    let y=-1.85+.065*Math.sin(x*2.1+z)*Math.cos(z*1.7)+.025*Math.sin(x*11.2+z*7.8);
    for(const [cx,cz,r] of craters){const d=Math.hypot(x-cx,z-cz)/r;if(d<1.45)y+=r*(.14*Math.exp(-(((d-1)/.13)**2))-.26*Math.max(0,1-d*d));}
    return y;
  }
  const geo=new THREE.PlaneGeometry(24,20,240,200);geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position,colors=[];
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,height(x,z));const c=.64+rand()*.18+.055*Math.sin(x*4+z*5);colors.push(c,c*.98,c*.94);}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const terrain=mesh(world,geo,soil);terrain.material.vertexColors=true;
  const rockGeo=new THREE.IcosahedronGeometry(1,0),rockMat=mat('#74716a',0,1);
  const rocks=new THREE.InstancedMesh(rockGeo,rockMat,170),dummy=new THREE.Object3D();
  for(let i=0;i<170;i++){const x=(rand()-.5)*20,z=(rand()-.5)*17,s=.025+rand()**3*.16;dummy.position.set(x,height(x,z)+s*.2,z);dummy.rotation.set(rand()*3,rand()*6,rand()*3);dummy.scale.set(s,s*.65,s*.85);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);}
  rocks.castShadow=true;rocks.receiveShadow=true;world.add(rocks);
  // Lunar surface habitat concept: pressure modules, airlock, power receiver, rover.
  const base=new THREE.Group();world.add(base);base.position.set(.65,-1.73,-.85);
  const litWindows=[];
  function habitat(x,z,len){
    const g=new THREE.Group();base.add(g);g.position.set(x,.38,z);
    const shell=mesh(g,new THREE.CapsuleGeometry(.24,len,6,20),gray);shell.rotation.z=Math.PI/2;
    for(const dx of [-len*.4,len*.4]){const ring=mesh(g,new THREE.TorusGeometry(.247,.018,6,32),dark,V(dx,0,0));ring.rotation.y=Math.PI/2;for(const dz of [-.19,.19])bar(g,V(dx,-.16,dz),V(dx,-.40,dz*1.4),.025,dark);}
    for(let dx=-len*.35;dx<len*.45;dx+=.22){const w=box(g,.10,.075,.012,V(dx,.06,.239),mat('#a9dcdf',.1,.3));w.material.emissive=new THREE.Color('#ffc185');litWindows.push(w);}
    box(g,len*.65,.035,.26,V(0,.247,0),gray);return g;
  }
  habitat(0,0,1.2);habitat(.25,-.9,.95);habitat(1.45,-.4,.85);
  bar(base,V(.25,.34,-.12),V(.25,.34,-.85),.11,gray);bar(base,V(.52,.34,-.4),V(1.3,.34,-.4),.1,gray);
  const airlock=cylinder(base,.17,.34,V(-.86,.30,0),gray);airlock.rotation.z=Math.PI/2;
  for(let i=0;i<5;i++)box(base,.12,.035,.28,V(-1.08-i*.09,.23-i*.045,0),dark);
  // Receiver lies inside the aperture; the beam terminates at its actual face.
  const receiver=new THREE.Group();base.add(receiver);receiver.position.set(-.45,.3,1.1);
  bar(receiver,V(0,-.3,0),V(0,.05,0),.045,dark);
  const receiverFace=new THREE.Group();receiver.add(receiverFace);receiverFace.rotation.x=-.30;
  box(receiverFace,1.03,.06,.68,V(),gray);
  const cells=mat('#1a2731',.6,.25);cells.emissive=new THREE.Color('#ff6417');
  const panels=[];
  for(let x=-3;x<=3;x++)for(let z=-2;z<=2;z++)panels.push(box(receiverFace,.126,.012,.112,V(x*.14,.037,z*.125),cells));
  const target=new THREE.Object3D();target.position.set(0,.055,0);receiverFace.add(target);
  const glow=new THREE.PointLight('#ff741f',0,3,2);glow.position.set(0,.25,0);receiver.add(glow);
  const antenna=new THREE.Group();base.add(antenna);antenna.position.set(1.75,0,.55);
  bar(antenna,V(),V(0,.78,0),.025,dark);const dish=mesh(antenna,new THREE.SphereGeometry(.18,24,12,0,Math.PI*2,0,.65),gray,V(0,.77,0));dish.rotation.z=-.55;
  const rover=new THREE.Group();base.add(rover);rover.position.set(-1.5,.12,-.8);box(rover,.42,.16,.27,V(),gray);
  for(const x of [-.14,.14])for(const z of [-.19,.19]){const wheel=cylinder(rover,.08,.06,V(x,-.04,z),dark);wheel.rotation.x=Math.PI/2;}
  box(rover,.12,.12,.17,V(.09,.14,0),dark);bar(rover,V(-.13,.1,0),V(-.13,.3,0),.012,gray);
  const powerLine=line(base,[V(-.45,.05,1.1),V(-.6,.05,.55),V(.4,.05,.55),V(.4,.05,0)],'#e69a42');
  const update=t=>{
    const opening=ease(12,15,t)*(1-ease(21.2,23.5,t));
    doors[0].position.x=-4.57*opening;doors[1].position.x=4.57*opening;
    world.visible=opening>.001;
    const power=ease(16.5,18,t)*(1-ease(20.5,21.5,t));
    panels.forEach(p=>p.material.emissiveIntensity=power*.65);
    litWindows.forEach(w=>w.material.emissiveIntensity=.08+power*1.3);
    glow.intensity=power*4;powerLine.material.opacity=.25+power*.75;powerLine.material.transparent=true;
  };
  update(0);return {card,doors,world,target,update,height};
}
