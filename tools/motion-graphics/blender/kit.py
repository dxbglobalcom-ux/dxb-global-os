"""Helpers for a job's own `scene.py` — a physical-product shot rendered headless in Blender 5.2:

    blender -b --factory-startup --python scene.py -- <out> [--w 1920 --h 1080 --fps 30 --samples 64 ...]

Helpers only. The kit never builds a scene: the product is a real imported model (or the job's own careful
modelling), and the light, the lens and the moves are the job's decisions, written in its scene.py.

Conventions, everywhere: time is in seconds and frame 1 is t = 0 (so `0001.png` is the first frame); lengths are
metres, angles degrees, light power watts; a colour is linear RGB `(r, g, b)` or a screen colour `'#rrggbb'`.
Call `setup_render` before anything that takes a time — it sets the frames per second the seconds are read with.
"""
import argparse
import math
import os
import shutil
import subprocess
import sys
import tempfile

import bpy
import numpy as np
from bpy_extras import anim_utils
from mathutils import Matrix, Vector

_SOLID_TYPES = {'MESH', 'CURVE', 'SURFACE', 'FONT', 'META'}
_SHAPE_TILE_PX = 720
_SHAPE_GAP_PX = 12


# --- small shared parts ------------------------------------------------------------------------------------------

def _frame(t):
    """The frame number of time `t`, as a float: frame 1 is t = 0."""
    return 1 + t * bpy.context.scene.render.fps


def _rgba(color):
    """A colour as Blender shades with it: linear RGBA. '#rrggbb' is a screen (sRGB) colour and is converted."""
    if isinstance(color, str):
        screen = [int(color.lstrip('#')[i:i + 2], 16) / 255 for i in (0, 2, 4)]
        color = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in screen]
    return (*color[:3], 1.0)


def _existing(path, helper):
    path = os.path.abspath(os.path.expanduser(path))
    if not os.path.exists(path):
        raise FileNotFoundError(f'{helper}: nothing at {path}')
    return path


def _add_object(name, data, location):
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = location
    return obj


def _aim(obj, target):
    """Keep `obj` facing `target` — an object, or a point that gets an empty of its own — while either moves."""
    if target is None:
        return None
    if not isinstance(target, bpy.types.Object):
        target = _add_object(f'{obj.name}.target', None, target)
    track = obj.constraints.new('TRACK_TO')
    track.target, track.track_axis, track.up_axis = target, 'TRACK_NEGATIVE_Z', 'UP_Y'
    return target


def _parts(target):
    """The object and everything parented under it that can carry a material."""
    return [o for o in (target, *target.children_recursive) if hasattr(o.data, 'materials')]


def _world_bounds(objects):
    """(lowest corner, highest corner) of the solid objects, in world space."""
    bpy.context.view_layer.update()
    corners = [o.matrix_world @ Vector(c) for o in objects if o.type in _SOLID_TYPES for c in o.bound_box]
    if not corners:
        raise ValueError('no solid object to measure')
    return (Vector([min(c[i] for c in corners) for i in range(3)]),
            Vector([max(c[i] for c in corners) for i in range(3)]))


# --- the run: arguments, the graphics card, the render settings ---------------------------------------------------

def script_args(argv=None, **defaults):
    """The arguments after `--` on Blender's command line: `out` and --w --h --fps --samples --start --end --times.

    `defaults` are the job's own figures (`script_args(fps=25, end=8.0)`); the command line overrides them for a
    small review render. A flag that is not one of these stops the run with exit code 2.
    """
    if argv is None:
        argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    parser = argparse.ArgumentParser(prog='scene.py --', allow_abbrev=False)
    parser.add_argument('out', nargs='?', default='frames', help='folder the frames are written into')
    parser.add_argument('--w', type=int, default=1920)
    parser.add_argument('--h', type=int, default=1080)
    parser.add_argument('--fps', type=int, default=30)
    parser.add_argument('--samples', type=int, default=64)
    parser.add_argument('--start', type=float, default=None, help='seconds')
    parser.add_argument('--end', type=float, default=None, help='seconds')
    parser.add_argument('--times', type=lambda text: [float(t) for t in text.split(',')], default=None,
                        help='single stills instead of a range, in seconds: 0.5,1.2,3')
    parser.set_defaults(**defaults)
    return parser.parse_args(argv)


def free_vram_mb():
    """Free memory on the graphics card in MB, as nvidia-smi reports it; None when it cannot be read."""
    try:
        said = subprocess.run(['nvidia-smi', '--query-gpu=memory.free', '--format=csv,noheader,nounits'],
                              capture_output=True, text=True, timeout=10, check=True).stdout
        return int(said.splitlines()[0])
    except (OSError, subprocess.SubprocessError, ValueError, IndexError):
        return None


def require_vram(mb):
    """Stop before a render the card cannot hold: it is shared with the studio's resident tools."""
    free = free_vram_mb()
    if free is None:
        print('kit: nvidia-smi gave no figure — free memory on the graphics card not checked', flush=True)
    elif free < mb:
        raise RuntimeError(f'require_vram: {free} MB free on the graphics card, this scene needs {mb} MB')
    return free


def select_device():
    """Point Cycles at the graphics card — OptiX, else CUDA, else the CPU. Prints and returns the one chosen."""
    scene = bpy.context.scene
    preferences = bpy.context.preferences.addons['cycles'].preferences
    for kind in ('OPTIX', 'CUDA'):
        # get_devices_for_type only: preferences.get_devices() crashes Blender 5.2.4 on this machine.
        devices = preferences.get_devices_for_type(kind)
        cards = [d for d in devices if d.type == kind]
        if cards:
            preferences.compute_device_type = kind
            for device in devices:
                device.use = device.type == kind
            scene.cycles.device = 'GPU'
            print(f'kit: Cycles renders on {kind} — {cards[0].name}', flush=True)
            return kind
    scene.cycles.device = 'CPU'
    print('kit: Cycles renders on the CPU — no OptiX or CUDA device found', flush=True)
    return 'CPU'


def setup_render(w, h, fps, samples=64, engine='CYCLES', transparent=False, motion_blur=True, denoise=True):
    """Size, frame rate, samples and engine ('CYCLES' or 'BLENDER_EEVEE'); frames are PNG, with alpha when
    `transparent`. Returns the device Cycles renders on ('OPTIX', 'CUDA' or 'CPU'), None for EEVEE.
    `denoise` is Cycles' only."""
    scene = bpy.context.scene
    render = scene.render
    render.engine = engine
    render.resolution_x, render.resolution_y, render.resolution_percentage = w, h, 100
    render.fps, render.fps_base = fps, 1.0
    render.film_transparent = transparent
    render.use_motion_blur = motion_blur
    render.image_settings.file_format = 'PNG'
    render.image_settings.color_mode = 'RGBA' if transparent else 'RGB'
    if engine != 'CYCLES':
        scene.eevee.taa_render_samples = samples
        return None
    device = select_device()
    scene.cycles.samples = samples
    scene.cycles.use_denoising = denoise
    scene.cycles.denoiser = 'OPTIX' if device == 'OPTIX' else 'OPENIMAGEDENOISE'
    return device


def clear_scene():
    """Empty the file. --factory-startup opens with a cube, a light and a camera, and none of them belongs in a
    film: a scene.py calls this first."""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)


# --- world, light, camera ----------------------------------------------------------------------------------------

def world(color=(0, 0, 0), hdri_path=None, strength=1.0, rotation_deg=0.0):
    """The surroundings: one flat colour, or an HDRI file turned `rotation_deg` about the vertical."""
    surroundings = bpy.data.worlds.new('kit.world')
    nodes, links = surroundings.node_tree.nodes, surroundings.node_tree.links
    nodes.clear()
    background = nodes.new('ShaderNodeBackground')
    background.inputs['Strength'].default_value = strength
    links.new(background.outputs['Background'], nodes.new('ShaderNodeOutputWorld').inputs['Surface'])
    if hdri_path is None:
        background.inputs['Color'].default_value = _rgba(color)
    else:
        sky = nodes.new('ShaderNodeTexEnvironment')
        sky.image = bpy.data.images.load(_existing(hdri_path, 'world'))
        turn = nodes.new('ShaderNodeMapping')
        turn.inputs['Rotation'].default_value[2] = math.radians(rotation_deg)
        links.new(nodes.new('ShaderNodeTexCoord').outputs['Generated'], turn.inputs['Vector'])
        links.new(turn.outputs['Vector'], sky.inputs['Vector'])
        links.new(sky.outputs['Color'], background.inputs['Color'])
    bpy.context.scene.world = surroundings
    return surroundings


def _area_light(name, width, height, power, location, target, color, spread_deg):
    data = bpy.data.lights.new(name, 'AREA')
    data.shape, data.size, data.size_y = 'RECTANGLE', width, height
    data.energy, data.color, data.spread = power, _rgba(color)[:3], math.radians(spread_deg)
    light = _add_object(name, data, location)
    _aim(light, target)
    return light


def key_light(size, power, location, target, color=(1, 1, 1)):
    """The one large soft light: a square area light `size` metres across, kept facing `target`."""
    return _area_light('kit.key', size, size, power, location, target, color, 180)


def softbox(width, height, power, location, target, color=(1, 1, 1)):
    """A rectangular area light — the long strip that reads as one clean reflection on a glossy product."""
    return _area_light('kit.softbox', width, height, power, location, target, color, 180)


def rim_light(size, power, location, target, color=(1, 1, 1), spread_deg=60):
    """A tight-beamed area light from behind, for the edge; the narrow beam keeps it off the rest of the set."""
    return _area_light('kit.rim', size, size, power, location, target, color, spread_deg)


def camera(location, target=None, lens_mm=85, fstop=None, focus=None):
    """The scene's camera, kept facing `target` (an object or a point; None leaves it free to be turned by keys).

    Depth of field is on when `fstop` is given; it focuses on `focus` — an object, or a distance in metres —
    and on the target when `focus` is left out.
    """
    data = bpy.data.cameras.new('kit.camera')
    data.lens = lens_mm
    data.clip_start = 0.01   # Blender's 0.1 m cuts into the product in a macro shot
    cam = _add_object('kit.camera', data, location)
    aimed_at = _aim(cam, target)
    if fstop is not None:
        focus = aimed_at if focus is None else focus
        if focus is None:
            raise ValueError('camera: an f-stop needs something to focus on — an object, a distance, or a target')
        data.dof.use_dof, data.dof.aperture_fstop = True, fstop
        if isinstance(focus, bpy.types.Object):
            data.dof.focus_object = focus
        else:
            data.dof.focus_distance = focus
    bpy.context.scene.camera = cam
    return cam


# --- the product: model and materials ----------------------------------------------------------------------------

_IMPORTERS = {
    '.glb': lambda path: bpy.ops.import_scene.gltf(filepath=path),
    '.gltf': lambda path: bpy.ops.import_scene.gltf(filepath=path),
    '.obj': lambda path: bpy.ops.wm.obj_import(filepath=path),
    '.fbx': lambda path: bpy.ops.wm.fbx_import(filepath=path),
    '.usd': lambda path: bpy.ops.wm.usd_import(filepath=path),
    '.usda': lambda path: bpy.ops.wm.usd_import(filepath=path),
    '.usdc': lambda path: bpy.ops.wm.usd_import(filepath=path),
    '.usdz': lambda path: bpy.ops.wm.usd_import(filepath=path),
    '.stl': lambda path: bpy.ops.wm.stl_import(filepath=path),
}


def import_model(path, fit_size=None, center=True):
    """Load a real model and return ONE handle (an empty at the origin) that everything in the file hangs under:
    move, turn and key the handle. `fit_size` scales the model so its longest side is that many metres;
    `center` puts the middle of its bounds on the handle."""
    path = _existing(path, 'import_model')
    extension = os.path.splitext(path)[1].lower()
    if extension not in _IMPORTERS:
        raise ValueError(f'import_model: {extension or "no extension"} is not read — use {", ".join(_IMPORTERS)}')
    before = set(bpy.data.objects)
    _IMPORTERS[extension](path)
    arrived = [o for o in bpy.data.objects if o not in before]
    low, high = _world_bounds(arrived)
    longest = max(high - low)
    placing = Matrix.Scale(fit_size / longest, 4) if fit_size else Matrix.Identity(4)
    if center:
        placing = placing @ Matrix.Translation(-(low + high) / 2)
    handle = _add_object(os.path.splitext(os.path.basename(path))[0], None, (0, 0, 0))
    for obj in arrived:
        if obj.parent is None:
            obj.matrix_world = placing @ obj.matrix_world
            obj.parent = handle
    size = (high - low) * (fit_size / longest if fit_size else 1.0)
    print(f'kit: {os.path.basename(path)} — {len(arrived)} objects, {size.x:.3f} x {size.y:.3f} x {size.z:.3f} m',
          flush=True)
    return handle


def _surface_material(name, shader_idname, **inputs):
    """A material that is one shader node wired to the surface, with the named inputs set."""
    material = bpy.data.materials.new(name)
    nodes = material.node_tree.nodes
    nodes.clear()
    shader = nodes.new(shader_idname)
    for socket, value in inputs.items():
        shader.inputs[socket].default_value = value
    material.node_tree.links.new(shader.outputs[0], nodes.new('ShaderNodeOutputMaterial').inputs['Surface'])
    return material


def material_glossy_plastic(color, roughness=0.15):
    return _surface_material('kit.plastic', 'ShaderNodeBsdfPrincipled',
                             **{'Base Color': _rgba(color), 'Roughness': roughness})


def material_metal(color=(0.8, 0.8, 0.8), roughness=0.25):
    return _surface_material('kit.metal', 'ShaderNodeBsdfPrincipled',
                             **{'Base Color': _rgba(color), 'Metallic': 1.0, 'Roughness': roughness})


def material_glass(color=(1, 1, 1), roughness=0.0, ior=1.45):
    return _surface_material('kit.glass', 'ShaderNodeBsdfPrincipled',
                             **{'Base Color': _rgba(color), 'Transmission Weight': 1.0, 'Roughness': roughness,
                                'IOR': ior})


def material_emissive(color, strength=1.0):
    """Pure light of one colour: no shading, no reflection — it looks the same under any lamp."""
    return _surface_material('kit.emissive', 'ShaderNodeEmission', Color=_rgba(color), Strength=strength)


# The map a texture file holds, told by a token of its name: Poly Haven writes `<asset>_diff_4k.jpg`, ambientCG
# `<Asset>_4K-JPG_Color.jpg`. An asset's own name may hold "rough" or "color" too (`rough_plaster_arm_4k.png`),
# so the tokens every file in the folder starts with are set aside first, and the last known one decides.
_TEXTURE_TOKENS = {
    'diff': 'base', 'diffuse': 'base', 'albedo': 'base', 'col': 'base', 'color': 'base', 'basecolor': 'base',
    'rough': 'roughness', 'roughness': 'roughness',
    'nor': 'normal', 'normal': 'normal', 'normalgl': 'normal',
    'disp': 'displacement', 'displacement': 'displacement', 'height': 'displacement',
    'dx': None, 'normaldx': None,   # the DirectX normal map: Blender reads the OpenGL one
}
_TEXTURE_FILES = ('.png', '.jpg', '.jpeg', '.exr', '.tif', '.tiff', '.webp')


def _texture_maps(folder):
    """{'base' | 'roughness' | 'normal' | 'displacement': file path} for the maps the folder holds."""
    tokens = {}
    for file_name in sorted(os.listdir(folder)):
        if file_name.lower().endswith(_TEXTURE_FILES):
            stem = os.path.splitext(file_name)[0].lower()
            tokens[file_name] = ''.join(c if c.isalnum() else ' ' for c in stem).split()
    asset_name = os.path.commonprefix(list(tokens.values()))
    maps = {}
    for file_name, own in tokens.items():
        own = own[min(len(asset_name), len(own) - 1):]
        kind = next((_TEXTURE_TOKENS[t] for t in reversed(own) if t in _TEXTURE_TOKENS), None)
        if kind:
            maps.setdefault(kind, os.path.join(folder, file_name))
    return maps


def material_from_textures(folder, scale=1.0, displacement_m=0.01):
    """A material from a Poly Haven / ambientCG texture set in a local folder: base colour, roughness, normal
    (OpenGL) and displacement, whichever the folder holds. `scale` repeats the textures over the model's UVs;
    `displacement_m` is the height of white above black (a bump on the surface; the mesh is not moved)."""
    folder = _existing(folder, 'material_from_textures')
    maps = _texture_maps(folder)
    if not maps:
        raise ValueError(f'material_from_textures: no colour, roughness, normal or displacement map among '
                         f'{sorted(os.listdir(folder))} in {folder}')

    material = _surface_material(os.path.basename(folder), 'ShaderNodeBsdfPrincipled')
    nodes, links = material.node_tree.nodes, material.node_tree.links
    shader = next(n for n in nodes if n.bl_idname == 'ShaderNodeBsdfPrincipled')
    placing = nodes.new('ShaderNodeMapping')
    placing.inputs['Scale'].default_value = (scale, scale, scale)
    links.new(nodes.new('ShaderNodeTexCoord').outputs['UV'], placing.inputs['Vector'])

    def texture(kind):
        node = nodes.new('ShaderNodeTexImage')
        node.image = bpy.data.images.load(maps[kind])
        if kind != 'base':
            node.image.colorspace_settings.name = 'Non-Color'
        links.new(placing.outputs['Vector'], node.inputs['Vector'])
        return node.outputs['Color']

    if 'base' in maps:
        links.new(texture('base'), shader.inputs['Base Color'])
    if 'roughness' in maps:
        links.new(texture('roughness'), shader.inputs['Roughness'])
    if 'normal' in maps:
        bend = nodes.new('ShaderNodeNormalMap')
        links.new(texture('normal'), bend.inputs['Color'])
        links.new(bend.outputs['Normal'], shader.inputs['Normal'])
    if 'displacement' in maps:
        lift = nodes.new('ShaderNodeDisplacement')
        lift.inputs['Scale'].default_value = displacement_m
        links.new(texture('displacement'), lift.inputs['Height'])
        links.new(lift.outputs['Displacement'],
                  next(n for n in nodes if n.bl_idname == 'ShaderNodeOutputMaterial').inputs['Displacement'])
    print(f'kit: material {material.name} — ' + ', '.join(f'{k}: {os.path.basename(p)}' for k, p in maps.items()),
          flush=True)
    return material


def _swap_materials(targets, material):
    """Put `material` in every slot of every part of the targets; returns what was there, for the way back."""
    was = []
    for part in (p for target in targets for p in _parts(target)):
        was.append((part, [slot.material for slot in part.material_slots]))
        if not part.material_slots:
            part.data.materials.append(material)
        for slot in part.material_slots:
            slot.material = material
    return was


def apply_material(target, material):
    """Give the object — and every part under it, so an import_model handle works — this one material."""
    _swap_materials([target], material)


def flat_silhouette(objects, fg=(1, 1, 1), bg=(0, 0, 0)):
    """The flat two-tone look: the objects (with their parts) become pure `fg`, the world pure `bg`, and the
    colours go to the file as given, without the film look. Returns the way back: call it to restore the
    materials, the world and the look.

        back = flat_silhouette([product]); render_frames(out, 4.5, 5.0); back()
    """
    scene = bpy.context.scene
    look = scene.view_settings
    before = (scene.world, look.view_transform, look.look, look.exposure, look.gamma)
    was = _swap_materials(objects, material_emissive(fg))
    world(bg)
    look.view_transform, look.look, look.exposure, look.gamma = 'Standard', 'None', 0.0, 1.0

    def back():
        for part, materials in was:
            if not materials:
                part.data.materials.clear()
            for slot, material in zip(part.material_slots, materials):
                slot.material = material
        scene.world, look.view_transform, look.look, look.exposure, look.gamma = before

    return back


# --- motion ------------------------------------------------------------------------------------------------------

def _fcurves(struct, data_path):
    """The F-curves that animate `struct.data_path`. Blender 5 keeps them in the action's channelbag for the
    slot its owner uses — `action.fcurves` is gone."""
    animation = struct.id_data.animation_data
    action = animation.action if animation else None
    channelbag = anim_utils.action_get_channelbag_for_slot(action, animation.action_slot) if action else None
    path = struct.path_from_id(data_path)
    curves = [c for c in channelbag.fcurves if c.data_path == path] if channelbag else []
    if not curves:
        raise RuntimeError(f'keyframe: the keys for {path!r} were set but no F-curve holds them — nothing would '
                           f'be eased')
    return curves


def _shape_bezier_segment(start, end, easing):
    """Ease one Bezier segment with its two inner handles: a handle level with its own key is a slow end,
    a handle on the straight line to the other key a fast one."""
    third = (end.co - start.co) / 3
    slow_start = easing in ('EASE_IN', 'EASE_IN_OUT')
    slow_end = easing in ('EASE_OUT', 'EASE_IN_OUT')
    start.handle_right_type = end.handle_left_type = 'FREE'
    start.handle_right = (start.co.x + third.x, start.co.y + (0 if slow_start else third.y))
    end.handle_left = (end.co.x - third.x, end.co.y - (0 if slow_end else third.y))


def keyframe(obj, data_path, keys, easing='EASE_IN_OUT', interpolation='BEZIER'):
    """Key `obj.data_path` at `{seconds: value}` and ease every stretch between two of these keys.

    `obj` is whatever owns the property: an object ('location', 'rotation_euler', 'scale'), `cam.data` ('lens'),
    `cam.data.dof` ('focus_distance'), a light's data ('energy'), a node socket ('default_value').
    `interpolation`: 'BEZIER', 'LINEAR', 'CONSTANT', or one of Blender's named curves — 'SINE' 'QUAD' 'CUBIC'
    'QUART' 'QUINT' 'EXPO' 'CIRC' 'BACK' 'BOUNCE' 'ELASTIC'.
    `easing`: 'EASE_IN' (slow start), 'EASE_OUT' (slow arrival), 'EASE_IN_OUT' (both — the motion rests at
    every key), or 'AUTO': with 'BEZIER' that is one smooth curve THROUGH the keys, for a move that never stops.
    """
    holder_path, _, name = data_path.rpartition('.')
    holder = obj.path_resolve(holder_path) if holder_path else obj
    frames = []
    for t in sorted(keys):
        setattr(holder, name, keys[t])
        obj.keyframe_insert(data_path, frame=_frame(t))
        frames.append(_frame(t))
    for curve in _fcurves(obj, data_path):
        points = [p for p in curve.keyframe_points if any(abs(p.co.x - f) < 1e-3 for f in frames)]
        for point in points:
            point.interpolation, point.easing = interpolation, easing
            if interpolation == 'BEZIER' and easing == 'AUTO':
                point.handle_left_type = point.handle_right_type = 'AUTO_CLAMPED'
        if interpolation == 'BEZIER' and easing != 'AUTO':
            for start, end in zip(points, points[1:]):
                _shape_bezier_segment(start, end, easing)
        curve.update()


def orbit(obj, center, radius, start_deg, end_deg, t0, t1, height=0.0, easing='EASE_IN_OUT',
          interpolation='BEZIER'):
    """Carry a camera (or any object) round `center` on a true circle from `start_deg` at `t0` to `end_deg` at
    `t1`: 0 is the front (-Y), 90 the right side (+X), `height` metres above the centre.

    The object is parented to a pivot at the centre and the pivot's turn is keyed; the pivot is returned.
    Afterwards the object's own location is relative to the pivot: key its Y to push in while it circles.
    """
    pivot = _add_object(f'{obj.name}.orbit', None, center)
    obj.parent = pivot
    obj.matrix_parent_inverse = Matrix.Identity(4)
    obj.location = (0, -radius, height)
    keyframe(pivot, 'rotation_euler', {t0: (0, 0, math.radians(start_deg)), t1: (0, 0, math.radians(end_deg))},
             easing, interpolation)
    return pivot


# --- rendering ---------------------------------------------------------------------------------------------------

def _render(frame, path):
    """Render one frame to `path`; a render that leaves no file there is an error, not a quiet gap."""
    scene = bpy.context.scene
    os.makedirs(os.path.dirname(path), exist_ok=True)
    scene.frame_set(frame)
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    if not os.path.isfile(path):
        raise RuntimeError(f'render: Blender wrote no file at {path} (the name must end in .png)')
    return path


def _saved(path):
    print(f'kit: saved {path}', flush=True)
    return path


def render_frames(out_dir, start_s=None, end_s=None, times=None):
    """Render PNG frames into `out_dir`, named by frame number (`0001.png` is t = 0), printing each path.

    A range runs from `start_s` (0 when left out) up to but not including `end_s`, so 8 s at 25 frames a second
    is 200 files; `times` renders those single moments instead, each at its nearest frame. One of `end_s` and
    `times` must be given. Returns the paths.
    """
    if times is not None:
        frames = sorted({round(_frame(t)) for t in times})
    elif end_s is not None:
        frames = range(round(_frame(start_s or 0.0)), round(_frame(end_s)))
    else:
        raise ValueError('render_frames: say where it ends — end_s, or times')
    out_dir = os.path.abspath(out_dir)
    return [_saved(_render(frame, os.path.join(out_dir, f'{frame:04d}.png'))) for frame in frames]


def render_still(out_png, t):
    """One PNG of the film at time `t` (its nearest frame). Returns the path."""
    return _saved(_render(round(_frame(t)), os.path.abspath(out_png)))


_VIEW_FROM = {'front': (0, -1, 0), 'back': (0, 1, 0), 'side': (1, 0, 0), 'top': (0, 0, 1)}


def _read_pixels(path, height=None):
    """An image file as rows x columns x RGBA, resized to `height` rows (keeping its shape) when given."""
    image = bpy.data.images.load(path, check_existing=False)
    if height:
        image.scale(max(1, round(height * image.size[0] / image.size[1])), height)
    flat = np.empty(image.size[0] * image.size[1] * 4, dtype=np.float32)
    image.pixels.foreach_get(flat)
    pixels = flat.reshape(image.size[1], image.size[0], 4)
    bpy.data.images.remove(image)
    return pixels


def shape_check(out_png, reference_png, t=0, views=('front', 'side'), subject=None):
    """One image for the storyboard's shape-check tile: the reference photo on the left, then our model at time
    `t` seen square-on from each of `views` ('front', 'back', 'side', 'top'), all at one scale, under the
    scene's own light. `subject` (an object or an import_model handle) is what gets framed; left out, it is
    everything solid in the scene. The film's camera and size are put back afterwards."""
    reference_png = _existing(reference_png, 'shape_check')
    scene = bpy.context.scene
    render = scene.render
    solids = [subject, *subject.children_recursive] if subject else list(scene.objects)
    low, high = _world_bounds(solids)
    centre, reach = (low + high) / 2, (high - low).length
    before = (scene.camera, render.resolution_x, render.resolution_y, render.use_motion_blur)
    scratch = tempfile.mkdtemp(prefix='kit-shape-')
    lenses = []
    try:
        render.resolution_x = render.resolution_y = _SHAPE_TILE_PX
        render.use_motion_blur = False
        tiles = [_read_pixels(reference_png, _SHAPE_TILE_PX)]
        for view in views:
            away = Vector(_VIEW_FROM[view])
            lens = bpy.data.cameras.new('kit.shape_check')
            lens.type, lens.ortho_scale = 'ORTHO', max(high - low) * 1.15
            lens.clip_start, lens.clip_end = reach, reach * 3
            scene.camera = _add_object('kit.shape_check', lens, centre + away * reach * 2)
            scene.camera.rotation_euler = away.to_track_quat('Z', 'Y').to_euler()
            lenses.append(scene.camera)
            gap = np.zeros((_SHAPE_TILE_PX, _SHAPE_GAP_PX, 4), dtype=np.float32)
            gap[..., 3] = 1.0
            tiles += [gap, _read_pixels(_render(round(_frame(t)), os.path.join(scratch, f'{view}.png')))]
        row = np.concatenate(tiles, axis=1)
        sheet = bpy.data.images.new('kit.shape_check', row.shape[1], row.shape[0], alpha=True)
        sheet.pixels.foreach_set(row.ravel())
        out_png = os.path.abspath(out_png)
        os.makedirs(os.path.dirname(out_png), exist_ok=True)
        sheet.filepath_raw, sheet.file_format = out_png, 'PNG'
        sheet.save()
        bpy.data.images.remove(sheet)
    finally:
        scene.camera, render.resolution_x, render.resolution_y, render.use_motion_blur = before
        for lens_object in lenses:
            bpy.data.objects.remove(lens_object, do_unlink=True)
        shutil.rmtree(scratch, ignore_errors=True)
    return _saved(out_png)
