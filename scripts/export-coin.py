"""
Turn a stock coin .blend into a GLB the site can load.

Driven by `scripts/export-coin.sh`, which is the entry point to use. Directly:

    Blender --background <in.blend> --python export-coin.py -- <out.glb> <name> [draco] [ratio]

READ ONLY on the input. This runs in a background Blender process and never
calls bpy.ops.wm.save_mainfile, so the .blend it opens is untouched no matter
what the steps below do to the in-memory scene. The only thing written is the
GLB at the path given.

What it does, and why each step is here:

  - Drops cameras and lights. They belong to the stock render, and the site
    lights its own stage. A second camera inside a glTF is just something to
    trip over at load time.
  - Applies modifiers before measuring anything. These files lean on Mirror and
    Bevel, so the bounds are wrong until those are real geometry.
  - Joins to one object. The separate materials survive as separate primitives,
    which means the site gets one node to spin rather than a hierarchy to keep
    in step.
  - Normalises to a 1-unit diameter, centred on its own bounds. Every coin then
    arrives the same size and the component needs no per-file magic number.
  - Decimates. A stock coin arrives around 55,000 triangles once the bevels are
    real, which is far past what a coin drawn 120px across can show. At 0.18 it
    is indistinguishable from the full mesh, checked by rendering both side by
    side rather than assumed, and the GLB goes from 1.9MB to 65KB.
"""

import json
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
out_path = argv[0]
name = argv[1]
draco = len(argv) > 2 and argv[2] == "draco"
ratio = float(argv[3]) if len(argv) > 3 else 0.18

for obj in list(bpy.data.objects):
    if obj.type != "MESH":
        bpy.data.objects.remove(obj, do_unlink=True)

meshes = [o for o in bpy.data.objects if o.type == "MESH"]
if not meshes:
    raise SystemExit("no mesh objects in this file")

bpy.ops.object.select_all(action="DESELECT")
for obj in meshes:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for mod in list(obj.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except RuntimeError as err:
            print(f"[warn] could not apply {mod.name} on {obj.name}: {err}")
    obj.select_set(False)

bpy.ops.object.select_all(action="DESELECT")
for obj in meshes:
    obj.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1:
    bpy.ops.object.join()
coin = bpy.context.view_layer.objects.active
coin.name = name

bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
coin.location = (0, 0, 0)
bpy.context.view_layer.update()

dims = coin.dimensions
scale = 1.0 / max(dims.x, dims.y)
coin.scale = (scale, scale, scale)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.context.view_layer.update()

if ratio < 1.0:
    decimate = coin.modifiers.new("decimate", "DECIMATE")
    decimate.decimate_type = "COLLAPSE"
    decimate.ratio = ratio
    bpy.ops.object.modifier_apply(modifier="decimate")

export = dict(
    filepath=out_path,
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_cameras=False,
    export_lights=False,
    export_animations=False,
    export_extras=False,
    export_yup=True,
)
if draco:
    export.update(
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
    )

bpy.ops.object.select_all(action="DESELECT")
coin.select_set(True)
bpy.ops.export_scene.gltf(**export)

mesh = coin.data
mesh.calc_loop_triangles()
report = {
    "name": name,
    "ratio": ratio,
    "tris": len(mesh.loop_triangles),
    "verts": len(mesh.vertices),
    "dims": [round(v, 4) for v in coin.dimensions],
    "materials": [
        {
            "name": m.name,
            "base_color": [
                round(c, 3)
                for c in m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value
            ]
            if m.use_nodes and "Principled BSDF" in m.node_tree.nodes
            else None,
        }
        for m in mesh.materials
        if m
    ],
}
print("<<<JSON>>>")
print(json.dumps(report))
