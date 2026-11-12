"""Blender --background --python export-transmitter.py -- source.blend output.glb"""
import bpy, sys, json
from pathlib import Path
from mathutils import Matrix, Vector
source, output = sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=source)
bpy.context.scene.frame_set(1)
originals = [o for o in bpy.context.scene.objects if o.type in {'MESH','CURVE'} and not o.hide_render]
deps=bpy.context.evaluated_depsgraph_get(); objects=[]
for index,o in enumerate(originals):
    data=bpy.data.meshes.new_from_object(o.evaluated_get(deps),depsgraph=deps)
    data.transform(o.matrix_world)
    baked=bpy.data.objects.new(o.name+'_Web',data);objects.append(baked)
    if index%200==0:print('BAKED',index,flush=True)
for o in originals:bpy.data.objects.remove(o,do_unlink=True)
for o in objects:bpy.context.scene.collection.objects.link(o)
coords=[v.co for o in objects for v in o.data.vertices]
lo=Vector([min(p[i] for p in coords) for i in range(3)])
hi=Vector([max(p[i] for p in coords) for i in range(3)])
center=(lo+hi)/2; scale=1/max(hi-lo)
for o in objects:o.data.transform(Matrix.Scale(scale,4)@Matrix.Translation(-center))
# Keep the original material colors; add metallic response to the gold insulation.
for m in {m for o in objects for m in o.data.materials if m}:
    color=(.65,.34,.055,1) if 'ochre' in m.name.lower() else tuple(m.diffuse_color)
    m.use_nodes=True
    m.node_tree.nodes.clear()
    bs=m.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
    out=m.node_tree.nodes.new('ShaderNodeOutputMaterial')
    m.node_tree.links.new(bs.outputs['BSDF'],out.inputs['Surface'])
    if bs:
        for link in list(bs.inputs['Base Color'].links):m.node_tree.links.remove(link)
        bs.inputs['Base Color'].default_value=color
        bs.inputs['Metallic'].default_value=.65 if 'ochre' in m.name.lower() else .25
        bs.inputs['Roughness'].default_value=.38
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
bpy.ops.object.join()
bpy.context.object.name='HELIOS_N1_Transmitter'
decimate=bpy.context.object.modifiers.new('Web detail reduction','DECIMATE');decimate.ratio=.3
bpy.ops.object.modifier_apply(modifier=decimate.name)
bpy.context.object.data.validate(clean_customdata=True)
bpy.context.object.data.update()
bpy.ops.export_scene.gltf(filepath=output,export_format='GLB',use_selection=True,export_animations=False,export_yup=True,export_cameras=False,export_lights=False)
# The optical array emits along Blender +X; GLB maps Z to Y and Y to -Z.
aperture=(Vector((3.60,0,0))-center)*scale
Path(output).with_suffix('.json').write_text(json.dumps({'source':Path(source).name,'scale':scale,'bounds':[list(lo),list(hi)],'aperture':[aperture.x,aperture.z,-aperture.y],'forward':[1,0,0]},indent=2),encoding='utf8')
