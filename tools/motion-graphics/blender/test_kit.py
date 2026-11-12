"""The kit's test — Blender runs it headless:

    blender -b --factory-startup --python "<absolute path>/test_kit.py"

It prints `KIT_TESTS_GREEN n/n` and exits 0, or names what failed and exits 1. Blender leaves the exit code at 0
when a script raises, so every failure here ends in an explicit sys.exit(1).
"""
import contextlib
import io
import math
import os
import shutil
import subprocess
import sys
import tempfile
import time
import traceback

import bpy
import numpy as np
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 30
TESTS = []
kit = None   # imported in main(), so that a kit that does not load is a red run and not a silent exit 0


def test(fn):
    TESTS.append(fn)
    return fn


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def near(a, b, tolerance=1e-3):
    return abs(a - b) <= tolerance


# --- what the tests build and measure with (none of it comes from the kit) ---------------------------------------

def box(name='fixture', size=(2.0, 1.0, 0.5), at=(0.0, 0.0, 0.0)):
    """A test fixture mesh written vertex by vertex: its size and place are known without asking the kit."""
    hx, hy, hz = (s / 2 for s in size)
    corners = [(x, y, z) for x in (-hx, hx) for y in (-hy, hy) for z in (-hz, hz)]
    faces = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(corners, [], faces)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = at
    return obj


def empty(name='probe'):
    obj = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def frame_of(t):
    """The convention the README states: frame 1 is t = 0."""
    return round(1 + t * FPS)


def at_time(t):
    bpy.context.scene.frame_set(frame_of(t))
    bpy.context.view_layer.update()


def mesh_bounds(root):
    """World bounds of every mesh under `root`, from the vertices themselves."""
    bpy.context.view_layer.update()
    points = [o.matrix_world @ v.co for o in [root, *root.children_recursive] if o.type == 'MESH'
              for v in o.data.vertices]
    check(points, f'no mesh under {root.name}')
    lo = Vector([min(p[i] for p in points) for i in range(3)])
    hi = Vector([max(p[i] for p in points) for i in range(3)])
    return hi - lo, (lo + hi) / 2


def hangs_under(obj, root):
    while obj.parent is not None:
        obj = obj.parent
        if obj == root:
            return True
    return False


def looks_at(obj, point):
    """True when the object's -Z axis (the way a camera and a light face) passes through `point`."""
    bpy.context.view_layer.update()
    forward = -(obj.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized()
    wanted = (Vector(point) - obj.matrix_world.translation).normalized()
    return forward.dot(wanted) > 0.9999


def read_png(path):
    """(pixels as rows x columns x RGBA in 0..1, bits per pixel) of a file on disk."""
    image = bpy.data.images.load(path, check_existing=False)
    width, height = image.size
    flat = np.empty(width * height * 4, dtype=np.float32)
    image.pixels.foreach_get(flat)
    depth = image.depth
    bpy.data.images.remove(image)
    return flat.reshape(height, width, 4), depth


def write_png(path, color, width=4, height=4):
    image = bpy.data.images.new(os.path.basename(path), width, height)
    image.pixels.foreach_set(np.tile(np.array([*color, 1.0], dtype=np.float32), width * height))
    image.filepath_raw = path
    image.file_format = 'PNG'
    image.save()
    bpy.data.images.remove(image)


def node_of(tree, idname):
    return next(n for n in tree.nodes if n.bl_idname == idname)


def image_feeding(socket):
    """(file name, colour space) of the image texture upstream of a socket, or None."""
    pending = [socket]
    while pending:
        for link in pending.pop().links:
            node = link.from_node
            if node.bl_idname in ('ShaderNodeTexImage', 'ShaderNodeTexEnvironment'):
                return os.path.basename(node.image.filepath), node.image.colorspace_settings.name
            pending.extend(node.inputs)
    return None


def stage(transparent=False, material=None, moving=False):
    """A tiny lit set for the render tests: one fixture box, the kit's light and camera, 320x180 at 8 samples."""
    kit.clear_scene()
    kit.setup_render(320, 180, FPS, samples=8, transparent=transparent, motion_blur=False)
    kit.world(color=(0, 0, 0))
    subject = box()
    kit.apply_material(subject, material or kit.material_glossy_plastic((0.8, 0.1, 0.1)))
    kit.key_light(size=3, power=400, location=(-3, -5, 4), target=subject)
    # The camera faces the place the box rests at, not the box: a camera that follows the box cancels its move.
    cam = kit.camera(location=(0, -6, 0), target=(0, 0, 0), lens_mm=85)
    if moving:
        kit.keyframe(subject, 'location', {0.0: (-0.6, 0, 0), 1.0: (0.6, 0, 0)}, interpolation='LINEAR')
    return subject, cam


CYCLES_PREFS = bpy.context.preferences.addons['cycles'].preferences
GET_DEVICES_CALLS = []


def _recording_get_devices(self, *args, **kwargs):
    GET_DEVICES_CALLS.append(''.join(traceback.format_stack(limit=4)))
    return ()


# --- the tests ---------------------------------------------------------------------------------------------------

@test
def clear_scene_leaves_no_object():
    box('left-over')
    check(len(bpy.data.objects) > 0, 'the fixture did not arrive')
    kit.clear_scene()
    check(len(bpy.data.objects) == 0, f'objects left: {[o.name for o in bpy.data.objects]}')


@test
def device_selection_takes_optix_without_get_devices():
    kit.clear_scene()
    chosen = kit.setup_render(320, 180, FPS, samples=8)
    check(chosen == 'OPTIX', f'this machine renders on OptiX; the kit chose {chosen}')
    check(CYCLES_PREFS.compute_device_type == 'OPTIX', f'preferences say {CYCLES_PREFS.compute_device_type}')
    check(bpy.context.scene.cycles.device == 'GPU', 'the scene still renders on the CPU')
    used = [(d.name, d.type) for d in CYCLES_PREFS.devices if d.use]
    check(used and all(kind == 'OPTIX' for _, kind in used), f'devices switched on: {used}')
    check(not GET_DEVICES_CALLS, 'get_devices() was called:\n' + '\n'.join(GET_DEVICES_CALLS))


@test
def setup_render_sets_the_figures():
    scene = bpy.context.scene
    kit.setup_render(640, 360, 25, samples=12, engine='CYCLES', transparent=True, motion_blur=False, denoise=False)
    r = scene.render
    check((r.resolution_x, r.resolution_y, r.resolution_percentage) == (640, 360, 100), 'resolution')
    check((r.fps, r.fps_base) == (25, 1.0), f'fps {r.fps}/{r.fps_base}')
    check(r.engine == 'CYCLES' and scene.cycles.samples == 12, f'engine {r.engine}, samples {scene.cycles.samples}')
    check(r.film_transparent is True and r.image_settings.color_mode == 'RGBA', 'transparent film with alpha')
    check(r.use_motion_blur is False and scene.cycles.use_denoising is False, 'motion blur and denoise off')
    check(r.image_settings.file_format == 'PNG', f'file format {r.image_settings.file_format}')

    kit.setup_render(320, 180, FPS)
    check(scene.cycles.samples == 64, f'default samples {scene.cycles.samples}')
    check(r.film_transparent is False and r.image_settings.color_mode == 'RGB', 'opaque by default')
    check(r.use_motion_blur is True and scene.cycles.use_denoising is True, 'motion blur and denoise on by default')

    kit.setup_render(320, 180, 24, samples=16, engine='BLENDER_EEVEE')
    check(r.engine == 'BLENDER_EEVEE' and scene.eevee.taa_render_samples == 16, f'EEVEE: {r.engine}')


@test
def script_args_reads_what_follows_the_double_dash():
    a = kit.script_args(['/tmp/x', '--w', '320', '--h', '180', '--samples', '8', '--times', '0.5,1.25'],
                        fps=25, end=8.0)
    check((a.out, a.w, a.h, a.samples) == ('/tmp/x', 320, 180, 8), f'given on the command line: {a}')
    check((a.fps, a.end, a.start) == (25, 8.0, None), f"the scene's own defaults: {a}")
    check(a.times == [0.5, 1.25], f'times {a.times}')

    real = sys.argv
    try:
        sys.argv = ['blender', '-b', '--python', 'scene.py', '--', 'frames-out', '--fps', '24', '--start', '1.5']
        a = kit.script_args()
        check((a.out, a.fps, a.start, a.times) == ('frames-out', 24, 1.5, None), f'from sys.argv: {a}')
        sys.argv = ['blender', '-b', '--python', 'scene.py']
        check(kit.script_args(samples=24).samples == 24, 'no -- on the command line')
    finally:
        sys.argv = real

    with contextlib.redirect_stderr(io.StringIO()):
        try:
            kit.script_args(['out', '--sample', '8'])
        except SystemExit as stop:
            check(stop.code != 0, 'a mistyped flag exits 0')
        else:
            raise AssertionError('a mistyped flag was swallowed')


@test
def vram_guard_reads_the_card_and_refuses():
    total = int(subprocess.run(['nvidia-smi', '--query-gpu=memory.total', '--format=csv,noheader,nounits'],
                               capture_output=True, text=True, check=True).stdout.splitlines()[0])
    free = kit.free_vram_mb()
    check(isinstance(free, int) and 0 < free <= total, f'free {free} MB of {total} MB')
    check(kit.require_vram(1) >= 1, 'a need of 1 MB was refused')
    try:
        kit.require_vram(total + 1)
    except RuntimeError as refusal:
        check(str(total + 1) in str(refusal), f'the refusal does not name the need: {refusal}')
    else:
        raise AssertionError('more memory than the card has was not refused')


@test
def world_is_a_colour_or_an_hdri():
    scene = bpy.context.scene
    w = kit.world(color=(0.2, 0.3, 0.4), strength=0.5)
    background = node_of(w.node_tree, 'ShaderNodeBackground')
    check(scene.world == w, 'the scene does not use the new world')
    check(all(near(a, b) for a, b in zip(background.inputs['Color'].default_value, (0.2, 0.3, 0.4))), 'colour')
    check(near(background.inputs['Strength'].default_value, 0.5), 'strength')
    check(node_of(w.node_tree, 'ShaderNodeOutputWorld').inputs['Surface'].links, 'the background is not wired out')

    hdri = os.path.join(TMP, 'studio_small_1k.hdr')
    image = bpy.data.images.new('hdri', 8, 4, float_buffer=True)
    image.filepath_raw, image.file_format = hdri, 'HDR'
    image.save()
    w = kit.world(hdri_path=hdri, strength=0.7, rotation_deg=90)
    background = node_of(w.node_tree, 'ShaderNodeBackground')
    fed = image_feeding(background.inputs['Color'])
    check(fed and fed[0] == 'studio_small_1k.hdr', f'the background colour comes from {fed}')
    check(near(background.inputs['Strength'].default_value, 0.7), 'hdri strength')
    turn = node_of(w.node_tree, 'ShaderNodeMapping').inputs['Rotation'].default_value[2]
    check(near(turn, math.pi / 2), f'rotation {turn}')

    try:
        kit.world(hdri_path=os.path.join(TMP, 'absent.hdr'))
    except FileNotFoundError as missing:
        check('absent.hdr' in str(missing), f'the error does not name the file: {missing}')
    else:
        raise AssertionError('a missing HDRI raised nothing')


@test
def lights_are_area_lights_aimed_at_the_target():
    kit.clear_scene()
    key = kit.key_light(size=2.0, power=500, location=(0, -4, 3), target=(0, 0, 0), color=(1.0, 0.9, 0.8))
    check(key.type == 'LIGHT' and key.data.type == 'AREA', f'{key.type}/{key.data.type}')
    check(near(key.data.energy, 500) and near(key.data.size, 2.0), f'{key.data.energy} W, {key.data.size} m')
    check(near(key.data.color[2], 0.8), f'colour {tuple(key.data.color)}')
    check(looks_at(key, (0, 0, 0)), 'the key light does not face its target')

    subject = box(at=(1, 0, 0))
    strip = kit.softbox(width=0.5, height=3.0, power=300, location=(3, -2, 1), target=subject)
    check(strip.data.shape == 'RECTANGLE' and near(strip.data.size, 0.5) and near(strip.data.size_y, 3.0),
          f'softbox {strip.data.shape} {strip.data.size} x {strip.data.size_y}')
    check(looks_at(strip, (1, 0, 0)), 'the softbox does not face the object')
    subject.location = (1, 2, 1)
    check(looks_at(strip, (1, 2, 1)), 'the softbox lost the object when it moved')

    rim = kit.rim_light(size=1.0, power=800, location=(0, 4, 2), target=subject)
    check(rim.data.spread < key.data.spread, f'rim beam {rim.data.spread} is not tighter than the key {key.data.spread}')
    check(looks_at(rim, (1, 2, 1)), 'the rim light does not face the object')


@test
def camera_has_the_lens_the_aim_and_the_focus():
    kit.clear_scene()
    subject = box(at=(0, 0, 1))
    cam = kit.camera(location=(0, -5, 1.5), target=subject, lens_mm=85, fstop=2.8)
    check(bpy.context.scene.camera == cam, 'not the scene camera')
    check(near(cam.data.lens, 85), f'lens {cam.data.lens}')
    check(looks_at(cam, (0, 0, 1)), 'the camera does not face its target')
    dof = cam.data.dof
    check(dof.use_dof is True and near(dof.aperture_fstop, 2.8), f'dof {dof.use_dof} f/{dof.aperture_fstop}')
    check(dof.focus_object == subject, f'focus is on {dof.focus_object}')

    far = kit.camera(location=(0, -5, 0), target=(0, 0, 0), lens_mm=100, fstop=4, focus=3.25)
    check(far.data.dof.use_dof is True and far.data.dof.focus_object is None, 'a distance was asked, not an object')
    check(near(far.data.dof.focus_distance, 3.25), f'focus distance {far.data.dof.focus_distance}')

    plain = kit.camera(location=(0, -5, 0), target=(0, 0, 0))
    check(plain.data.dof.use_dof is False, 'depth of field is on without an f-stop')
    try:
        kit.camera(location=(0, -5, 0), fstop=2.0)
    except ValueError:
        pass
    else:
        raise AssertionError('an f-stop with nothing to focus on raised nothing')


@test
def keyframe_eases_and_the_easing_changes_the_curve():
    kit.clear_scene()
    kit.setup_render(320, 180, FPS, samples=8)

    def travel(easing, interpolation):
        """An empty keyed 0 -> 10 on x between 1 s and 3 s; x at the start, quarter, half, three quarters, end."""
        probe = empty()
        kit.keyframe(probe, 'location', {1.0: (0, 0, 0), 3.0: (10, 0, 0)}, easing=easing,
                     interpolation=interpolation)
        values = []
        for t in (1.0, 1.5, 2.0, 2.5, 3.0):
            at_time(t)
            values.append(probe.location.x)
        return values

    # The control: the same measurement reads a straight line when a straight line is asked for.
    linear = travel('EASE_IN_OUT', 'LINEAR')
    check(all(near(v, w) for v, w in zip(linear, (0, 2.5, 5, 7.5, 10))), f'LINEAR is not linear: {linear}')

    both = travel('EASE_IN_OUT', 'BEZIER')
    check(near(both[0], 0) and near(both[4], 10), f'BEZIER EASE_IN_OUT ends: {both}')
    check(both[1] < 2.5 - 0.5 and both[3] > 7.5 + 0.5, f'BEZIER EASE_IN_OUT is not eased at the quarters: {both}')

    # A keyframe() that inserts keys and sets nothing gives 5.0 at the half for every easing; these tell them apart.
    slow_start = travel('EASE_IN', 'BEZIER')
    slow_end = travel('EASE_OUT', 'BEZIER')
    check(near(slow_start[0], 0) and near(slow_start[4], 10), f'BEZIER EASE_IN ends: {slow_start}')
    check(slow_start[2] < 5 - 0.5, f'BEZIER EASE_IN is not behind linear at the half: {slow_start}')
    check(slow_end[2] > 5 + 0.5, f'BEZIER EASE_OUT is not ahead of linear at the half: {slow_end}')

    # Blender's named curves, against their closed forms: cubic ease-in is t^3, ease-out its mirror.
    cubic_in = travel('EASE_IN', 'CUBIC')
    cubic_out = travel('EASE_OUT', 'CUBIC')
    check(near(cubic_in[2], 1.25, 0.01) and near(cubic_out[2], 8.75, 0.01),
          f'CUBIC at the half: in {cubic_in[2]}, out {cubic_out[2]}')
    check(near(cubic_in[0], 0) and near(cubic_in[4], 10), f'CUBIC ends: {cubic_in}')
    expo = travel('EASE_IN_OUT', 'EXPO')
    check(expo[1] < 1.0 and expo[3] > 9.0 and near(expo[4], 10), f'EXPO EASE_IN_OUT: {expo}')

    # Three keys on one line: EASE_IN_OUT rests at the middle key, AUTO runs through it.
    def step_past_the_middle(easing):
        probe = empty()
        kit.keyframe(probe, 'location', {0.0: (0, 0, 0), 1.0: (5, 0, 0), 2.0: (10, 0, 0)}, easing=easing)
        bpy.context.scene.frame_set(frame_of(1.0) + 1)
        return probe.location.x - 5

    check(step_past_the_middle('EASE_IN_OUT') < 0.05, 'EASE_IN_OUT does not rest at the middle key')
    check(step_past_the_middle('AUTO') > 0.1, 'AUTO stops at the middle key')

    # Data that is not an object: the lens lives on the camera's data, the focus on a struct inside it.
    cam = kit.camera(location=(0, -5, 0), target=(0, 0, 0), fstop=2.8, focus=1.0)
    kit.keyframe(cam.data, 'lens', {0.0: 50, 1.0: 100}, easing='EASE_IN', interpolation='CUBIC')
    kit.keyframe(cam.data.dof, 'focus_distance', {0.0: 1.0, 1.0: 3.0}, easing='EASE_OUT', interpolation='CUBIC')
    at_time(0.5)
    check(near(cam.data.lens, 56.25, 0.05), f'lens at the half: {cam.data.lens}')
    check(near(cam.data.dof.focus_distance, 2.75, 0.01), f'focus at the half: {cam.data.dof.focus_distance}')
    at_time(1.0)
    check(near(cam.data.lens, 100) and near(cam.data.dof.focus_distance, 3.0), 'lens and focus at the end')

    try:
        kit.keyframe(empty(), 'location', {0.0: (0, 0, 0), 1.0: (1, 0, 0)}, easing='SMOOTH')
    except (TypeError, ValueError):
        pass
    else:
        raise AssertionError('an easing that does not exist raised nothing')


@test
def orbit_keeps_the_radius_and_lands_on_its_angles():
    kit.clear_scene()
    kit.setup_render(320, 180, FPS, samples=8)
    probe = empty()
    kit.orbit(probe, center=(1, 2, 0), radius=2.0, start_deg=0, end_deg=90, t0=0.0, t1=2.0, height=0.5)

    def place(t):
        at_time(t)
        return probe.matrix_world.translation.copy()

    # 0 degrees is the front (-Y of the centre), 90 the right side (+X).
    start, middle, end = place(0.0), place(1.0), place(2.0)
    check((start - Vector((1, 0, 0.5))).length < 1e-3, f'start {tuple(start)}')
    check((end - Vector((3, 2, 0.5))).length < 1e-3, f'end {tuple(end)}')
    half = math.sqrt(2)
    check((middle - Vector((1 + half, 2 - half, 0.5))).length < 1e-3, f'middle {tuple(middle)}')
    early = place(0.5)
    flat_distance = math.hypot(early.x - 1, early.y - 2)
    check(near(flat_distance, 2.0) and near(early.z, 0.5), f'off the circle at 0.5 s: {tuple(early)}')
    swept = math.degrees(math.atan2(early.x - 1, -(early.y - 2)))
    check(1 < swept < 22.5 - 3, f'the turn is not eased: {swept:.2f} degrees at the first quarter')


IMPORT_FORMATS = {
    'glb': lambda path: bpy.ops.export_scene.gltf(filepath=path, export_format='GLB'),
    'gltf': lambda path: bpy.ops.export_scene.gltf(filepath=path, export_format='GLTF_SEPARATE'),
    'obj': lambda path: bpy.ops.wm.obj_export(filepath=path),
    'fbx': lambda path: bpy.ops.export_scene.fbx(filepath=path),
    'usd': lambda path: bpy.ops.wm.usd_export(filepath=path),
    'stl': lambda path: bpy.ops.wm.stl_export(filepath=path),
}


def model_file(extension):
    """A 2 x 1 x 0.5 box standing 3 m off the origin, written to disk in the format; the scene is left empty."""
    kit.clear_scene()
    box('product', size=(2.0, 1.0, 0.5), at=(3.0, 0.0, 0.0))
    folder = os.path.join(TMP, f'model-{extension}')
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, f'product.{extension}')
    IMPORT_FORMATS[extension](path)
    check(os.path.isfile(path), f'the {extension} exporter wrote nothing')
    kit.clear_scene()
    return path


@test
def import_model_returns_one_handle_fitted_and_centred():
    for extension in IMPORT_FORMATS:
        handle = kit.import_model(model_file(extension), fit_size=3.0)
        loose = [o.name for o in bpy.data.objects if o != handle and not hangs_under(o, handle)]
        check(handle.parent is None and not loose, f'{extension}: outside the handle: {loose}')
        check(handle.location.length < 1e-6 and all(near(s, 1.0) for s in handle.scale),
              f'{extension}: the handle is not at rest')
        size, centre = mesh_bounds(handle)
        check(all(near(a, b, 0.01) for a, b in zip(size, (3.0, 1.5, 0.75))), f'{extension}: fitted size {tuple(size)}')
        check(centre.length < 0.01, f'{extension}: centre {tuple(centre)}')
        handle.location = (0, 0, 5)
        _, moved = mesh_bounds(handle)
        check((moved - Vector((0, 0, 5))).length < 0.01, f'{extension}: the model did not follow its handle')

    as_made = kit.import_model(model_file('glb'), center=False)
    size, centre = mesh_bounds(as_made)
    check(all(near(a, b, 0.01) for a, b in zip(size, (2.0, 1.0, 0.5))), f'unfitted size {tuple(size)}')
    check((centre - Vector((3, 0, 0))).length < 0.01, f'uncentred place {tuple(centre)}')


@test
def import_model_names_what_is_wrong():
    absent = os.path.join(TMP, 'no-such-product.glb')
    try:
        kit.import_model(absent)
    except FileNotFoundError as missing:
        check(absent in str(missing), f'the error does not name the file: {missing}')
    else:
        raise AssertionError('a missing model raised nothing')

    unknown = os.path.join(TMP, 'product.step')
    open(unknown, 'w').close()
    try:
        kit.import_model(unknown)
    except ValueError as refused:
        check('.glb' in str(refused), f'the error does not list the formats: {refused}')
    else:
        raise AssertionError('an unsupported format raised nothing')


@test
def materials_carry_their_look_and_reach_every_part():
    red = kit.material_glossy_plastic('#ff0000', roughness=0.2)
    shader = node_of(red.node_tree, 'ShaderNodeBsdfPrincipled')
    check(all(near(a, b) for a, b in zip(shader.inputs['Base Color'].default_value, (1, 0, 0, 1))), 'plastic colour')
    check(near(shader.inputs['Roughness'].default_value, 0.2) and near(shader.inputs['Metallic'].default_value, 0),
          'plastic roughness / metallic')
    check(node_of(red.node_tree, 'ShaderNodeOutputMaterial').inputs['Surface'].links, 'plastic is not wired out')

    # A hex colour is a screen colour: #808080 is 0.2159 in the linear values Blender shades with.
    grey = kit.material_glossy_plastic('#808080')
    value = node_of(grey.node_tree, 'ShaderNodeBsdfPrincipled').inputs['Base Color'].default_value[0]
    check(near(value, 0.2159), f'#808080 became {value}')

    steel = node_of(kit.material_metal((0.6, 0.6, 0.65), roughness=0.3).node_tree, 'ShaderNodeBsdfPrincipled')
    check(near(steel.inputs['Metallic'].default_value, 1) and near(steel.inputs['Roughness'].default_value, 0.3),
          'metal')
    glass = node_of(kit.material_glass(ior=1.52).node_tree, 'ShaderNodeBsdfPrincipled')
    check(near(glass.inputs['Transmission Weight'].default_value, 1) and near(glass.inputs['IOR'].default_value, 1.52),
          'glass')
    glow = kit.material_emissive((0.1, 0.9, 0.2), strength=4)
    emission = node_of(glow.node_tree, 'ShaderNodeEmission')
    check(near(emission.inputs['Strength'].default_value, 4) and near(emission.inputs['Color'].default_value[1], 0.9),
          'emission')
    check(node_of(glow.node_tree, 'ShaderNodeOutputMaterial').inputs['Surface'].links[0].from_node == emission,
          'the emission is not the surface')

    handle = kit.import_model(model_file('glb'))
    kit.apply_material(handle, red)
    parts = [o for o in handle.children_recursive if o.type == 'MESH']
    check(parts and all(slot.material == red for o in parts for slot in o.material_slots)
          and all(len(o.material_slots) > 0 for o in parts), 'the material did not reach every part')


def texture_set(folder_name, names):
    folder = os.path.join(TMP, folder_name)
    os.makedirs(folder, exist_ok=True)
    for name in names:
        write_png(os.path.join(folder, name), (0.5, 0.4, 0.3))
    return folder


@test
def material_from_textures_reads_poly_haven_and_ambientcg_names():
    # Poly Haven's naming, with an asset whose own name says "rough" and a packed map (arm) the kit does not read.
    haven = texture_set('rough_plaster', [
        'rough_plaster_diff_1k.png', 'rough_plaster_rough_1k.png', 'rough_plaster_nor_gl_1k.png',
        'rough_plaster_nor_dx_1k.png', 'rough_plaster_disp_1k.png', 'rough_plaster_arm_1k.png'])
    ambient = texture_set('Metal032', [
        'Metal032_1K-PNG_Color.png', 'Metal032_1K-PNG_Roughness.png', 'Metal032_1K-PNG_NormalGL.png',
        'Metal032_1K-PNG_NormalDX.png', 'Metal032_1K-PNG_Displacement.png', 'Metal032_1K-PNG_Metalness.png'])
    expected = {
        haven: ('rough_plaster_diff_1k.png', 'rough_plaster_rough_1k.png', 'rough_plaster_nor_gl_1k.png',
                'rough_plaster_disp_1k.png'),
        ambient: ('Metal032_1K-PNG_Color.png', 'Metal032_1K-PNG_Roughness.png', 'Metal032_1K-PNG_NormalGL.png',
                  'Metal032_1K-PNG_Displacement.png'),
    }
    for folder, (colour, roughness, normal, displacement) in expected.items():
        material = kit.material_from_textures(folder)
        shader = node_of(material.node_tree, 'ShaderNodeBsdfPrincipled')
        out = node_of(material.node_tree, 'ShaderNodeOutputMaterial')
        check(out.inputs['Surface'].links and out.inputs['Surface'].links[0].from_node == shader, 'not wired out')
        check(image_feeding(shader.inputs['Base Color']) == (colour, 'sRGB'),
              f"base colour from {image_feeding(shader.inputs['Base Color'])}")
        check(image_feeding(shader.inputs['Roughness']) == (roughness, 'Non-Color'),
              f"roughness from {image_feeding(shader.inputs['Roughness'])}")
        check(image_feeding(shader.inputs['Normal']) == (normal, 'Non-Color'),
              f"normal from {image_feeding(shader.inputs['Normal'])}")
        check(image_feeding(out.inputs['Displacement']) == (displacement, 'Non-Color'),
              f"displacement from {image_feeding(out.inputs['Displacement'])}")

    only_colour = kit.material_from_textures(texture_set('paint', ['paint_albedo.png']))
    shader = node_of(only_colour.node_tree, 'ShaderNodeBsdfPrincipled')
    check(image_feeding(shader.inputs['Base Color']) == ('paint_albedo.png', 'sRGB'), 'albedo alone')
    check(not shader.inputs['Roughness'].links, 'a roughness map appeared from nowhere')

    for bad, error in ((os.path.join(TMP, 'no-such-set'), FileNotFoundError),
                       (texture_set('holiday', ['beach.png']), ValueError)):
        try:
            kit.material_from_textures(bad)
        except error:
            pass
        else:
            raise AssertionError(f'{bad} raised no {error.__name__}')


@test
def render_frames_writes_the_frames_it_names():
    stage(moving=True)
    out = os.path.join(TMP, 'frames')
    said = io.StringIO()
    with contextlib.redirect_stdout(said):
        paths = kit.render_frames(out, start_s=0.0, end_s=0.1)
    # 0.1 s at 30 frames a second is three frames; frame 1 is t = 0.
    wanted = [os.path.join(out, name) for name in ('0001.png', '0002.png', '0003.png')]
    check(paths == wanted, f'returned {paths}')
    check(sorted(os.listdir(out)) == ['0001.png', '0002.png', '0003.png'], f'on disk: {sorted(os.listdir(out))}')
    for path in wanted:
        pixels, _ = read_png(path)
        check(pixels.shape[:2] == (180, 320), f'{path} is {pixels.shape[1]}x{pixels.shape[0]}')
        check(path in said.getvalue(), f'{path} was not printed')

    picked = kit.render_frames(out, times=[1.0, 0.5])
    check([os.path.basename(p) for p in picked] == ['0016.png', '0031.png'], f'times gave {picked}')
    early, _ = read_png(picked[0])
    late, _ = read_png(picked[1])
    check(np.abs(early - late).mean() > 0.01, 'the picture at 0.5 s and at 1.0 s is the same: time did not move it')

    try:
        kit.render_frames(out)
    except ValueError:
        pass
    else:
        raise AssertionError('no end and no times raised nothing')


@test
def transparent_render_has_an_alpha_channel():
    stage(transparent=True)
    clear = kit.render_still(os.path.join(TMP, 'alpha', 'clear.png'), 0.0)
    pixels, depth = read_png(clear)
    check(depth == 32, f'{depth} bits per pixel: no alpha channel in the file')
    check(pixels[2, 2, 3] == 0.0, f'the empty corner has alpha {pixels[2, 2, 3]}')
    check(pixels[90, 160, 3] == 1.0, f'the product has alpha {pixels[90, 160, 3]}')
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=pix_fmt',
                            '-of', 'csv=p=0', clear], capture_output=True, text=True)
    check(probe.stdout.strip() == 'rgba', f'ffprobe reads pixel format {probe.stdout.strip()!r}')

    stage(transparent=False)
    pixels, depth = read_png(kit.render_still(os.path.join(TMP, 'alpha', 'solid.png'), 0.0))
    check(depth == 24 and pixels[..., 3].min() == 1.0, f'an opaque render carries alpha: {depth} bits')
    # The same frame proves the set: the key light reaches the red plastic, and the black world stays black.
    # The file holds screen values, not linear ones: the plastic's 8:1 of red over green reads about 2.5:1 there.
    red, green, blue, _ = pixels[90, 160]
    check(red > 0.25 and red > 2 * max(green, blue),
          f'the product in the middle of the frame reads {tuple(pixels[90, 160])}')
    check(pixels[2, 2, :3].max() < 0.05, f'the empty corner reads {tuple(pixels[2, 2])}')


@test
def flat_silhouette_is_two_tones_and_comes_back():
    subject, _ = stage()
    scene = bpy.context.scene
    before = (scene.world, scene.view_settings.view_transform, [s.material for s in subject.material_slots])

    def tones(path):
        rgb = read_png(path)[0][..., :3]
        white = (rgb > 0.9).all(axis=2).mean()
        black = (rgb < 0.1).all(axis=2).mean()
        return white, black

    # The control: the lit glossy box is not two tones.
    white, black = tones(kit.render_still(os.path.join(TMP, 'flat', 'lit.png'), 0.0))
    check(white < 0.02, f'the lit render is already {white:.0%} white: the control cannot tell')

    undo = kit.flat_silhouette([subject], fg=(1, 1, 1), bg=(0, 0, 0))
    white, black = tones(kit.render_still(os.path.join(TMP, 'flat', 'flat.png'), 0.0))
    check(white + black > 0.97, f'only {white + black:.1%} of the picture is one of the two tones')
    check(white > 0.03 and black > 0.3, f'white {white:.1%}, black {black:.1%}')

    undo()
    after = (scene.world, scene.view_settings.view_transform, [s.material for s in subject.material_slots])
    check(after == before, f'not restored: {after} against {before}')
    white, _ = tones(kit.render_still(os.path.join(TMP, 'flat', 'back.png'), 0.0))
    check(white < 0.02, f'after the way back the render is still {white:.0%} white')


@test
def shape_check_puts_ours_beside_the_reference():
    _, cam = stage(material=kit.material_emissive((1, 0, 0)))
    scene = bpy.context.scene
    scene.view_settings.view_transform = 'Standard'   # so the fixture's red reads as red in the file
    reference = os.path.join(TMP, 'reference.png')
    write_png(reference, (1.0, 0.5, 0.0), width=40, height=20)
    out = os.path.join(TMP, 'board', 'shape.png')
    said = io.StringIO()
    with contextlib.redirect_stdout(said):
        returned = kit.shape_check(out, reference, t=0, views=('front', 'side'))
    check(returned == out and os.path.isfile(out) and out in said.getvalue(), 'the file was not written and named')

    pixels, _ = read_png(out)
    height, width = pixels.shape[:2]
    check(width > height, f'{width}x{height} is not wider than tall')
    rgb = pixels[..., :3]
    orange = (np.abs(rgb - (1.0, 0.5, 0.0)) < 0.06).all(axis=2).any(axis=0)
    red = ((rgb[..., 0] > 0.8) & (rgb[..., 1] < 0.2) & (rgb[..., 2] < 0.2)).sum(axis=0)

    def runs(columns):
        """(first column, pixels inside) of every unbroken stretch of marked columns."""
        found, start = [], None
        for x, marked in enumerate([*columns, 0]):
            if marked and start is None:
                start = x
            elif not marked and start is not None:
                found.append((start, int(np.sum(columns[start:x]))))
                start = None
        return found

    reference_runs, our_runs = runs(orange), runs(red)
    check(len(reference_runs) == 1 and reference_runs[0][0] == 0, f'the reference is not the left tile: {reference_runs}')
    check(len(our_runs) == 2, f'expected the front and the side of our model, found {len(our_runs)} shapes')
    check(our_runs[0][0] > reference_runs[0][1], 'our renders are not to the right of the reference')
    # The box is 2 m wide from the front and 1 m from the side, drawn at one scale.
    ratio = our_runs[0][1] / our_runs[1][1]
    check(1.7 < ratio < 2.3, f'front and side cover {our_runs[0][1]} and {our_runs[1][1]} pixels')

    r = scene.render
    check(scene.camera == cam and (r.resolution_x, r.resolution_y) == (320, 180), "the film's camera and size are gone")
    try:
        kit.shape_check(out, os.path.join(TMP, 'no-photo.png'))
    except FileNotFoundError:
        pass
    else:
        raise AssertionError('a missing reference photo raised nothing')


@test
def no_helper_called_get_devices_in_the_whole_run():
    check(not GET_DEVICES_CALLS, 'get_devices() was called:\n' + '\n'.join(GET_DEVICES_CALLS))


# --- the run -----------------------------------------------------------------------------------------------------

def main():
    global kit, TMP
    for tool in ('ffprobe', 'nvidia-smi'):
        if shutil.which(tool) is None:
            print(f'SKIPPED: {tool} missing', flush=True)
            return 1
    sys.path.insert(0, HERE)
    type(CYCLES_PREFS).get_devices = _recording_get_devices   # the real one crashes this build
    try:
        import kit as kit_module
    except Exception:
        traceback.print_exc()
        print(f'KIT_TESTS_RED 0/{len(TESTS)} — kit.py does not load', flush=True)
        return 1
    kit = kit_module
    TMP = tempfile.mkdtemp(prefix='kit-test-')
    failed = []
    started = time.time()
    try:
        for fn in TESTS:
            clock = time.time()
            try:
                fn()
            except Exception:
                failed.append(fn.__name__)
                print(f'FAIL {fn.__name__}\n{traceback.format_exc()}', flush=True)
            else:
                print(f'PASS {fn.__name__} ({time.time() - clock:.1f} s)', flush=True)
    finally:
        shutil.rmtree(TMP, ignore_errors=True)
    passed = len(TESTS) - len(failed)
    if failed:
        print(f'KIT_TESTS_RED {passed}/{len(TESTS)} — failed: {", ".join(failed)}', flush=True)
        return 1
    print(f'KIT_TESTS_GREEN {passed}/{len(TESTS)} ({time.time() - started:.0f} s)', flush=True)
    return 0


TMP = None
try:
    status = main()
except BaseException:
    traceback.print_exc()
    status = 1
sys.exit(status)
