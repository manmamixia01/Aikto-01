import {createCardAnimation} from './card-scene.js';

export async function createARAnimation(parent,ratio=55/91){
  const animation=await createCardAnimation({ar:true});
  animation.root.rotation.x=Math.PI/2;
  animation.root.scale.setScalar(Math.min(1,ratio/(55/91))/9.1);
  animation.root.position.z=.003;
  parent.add(animation.root);
  animation.update(0);
  return animation;
}
