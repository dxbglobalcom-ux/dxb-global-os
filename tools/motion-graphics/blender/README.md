# Blender kit

Helpers for a job's own `scene.py`: a physical-product shot rendered headless in Blender 5.2 (Cycles on OptiX).
The kit never builds a scene — the product is a real imported model or the job's own careful modelling, and the
light, the lens and the moves are the job's decisions.
Everywhere: time is seconds and frame 1 is t = 0 (`0001.png`), lengths metres, angles degrees, light power watts,
a colour linear `(r, g, b)` or a screen colour `'#rrggbb'`.

## Use

```python
# scene.py
import math
import sys
sys.path.insert(0, '/home/dxb/DxB Global OS/tools/motion-graphics/blender')
import kit

args = kit.script_args(fps=30, end=2.0)            # the job's own figures; the command line overrides them
kit.clear_scene()
kit.setup_render(args.w, args.h, args.fps, samples=args.samples)   # before anything that takes a time
kit.world(color=(0.004, 0.004, 0.005))
product = kit.import_model('/abs/path/product.glb', fit_size=0.06)
kit.key_light(size=0.5, power=10, location=(-0.35, -0.40, 0.45), target=product)
kit.camera(location=(0, -0.33, 0.05), target=product, lens_mm=85, fstop=4)
kit.keyframe(product, 'rotation_euler', {0.0: (0, 0, math.radians(-25)), 2.0: (0, 0, math.radians(20))})
kit.render_frames(args.out, args.start, args.end, args.times)
```

```
node "/home/dxb/DxB Global OS/tools/motion-graphics/mg.mjs" blender <scene.py> -- <out> [--w 1920 --h 1080 --fps 30 --samples 64 --start S --end S --times 0.5,1.2]
blender -b --factory-startup --python scene.py -- <out> [the same flags]
```

The kit's own test: `blender -b --factory-startup --python "<this folder>/test_kit.py"` prints `KIT_TESTS_GREEN n/n`.

## Helpers

The run
- `script_args(argv=None, **defaults)` — what follows `--`: `out`, `--w --h --fps --samples --start --end --times`; an unknown flag exits 2.
- `free_vram_mb()` — free memory on the graphics card in MB, None when nvidia-smi cannot say.
- `require_vram(mb)` — raises before a render the shared card cannot hold.
- `select_device()` — Cycles on OptiX, else CUDA, else the CPU; returns the one chosen (`setup_render` calls it).
- `setup_render(w, h, fps, samples=64, engine='CYCLES', transparent=False, motion_blur=True, denoise=True)` — size, rate, samples, engine (`'CYCLES'` or `'BLENDER_EEVEE'`); PNG frames, RGBA when `transparent`.
- `clear_scene()` — removes the cube, light and camera `--factory-startup` opens with.

World, light, camera
- `world(color=(0, 0, 0), hdri_path=None, strength=1.0, rotation_deg=0.0)` — one flat colour, or an HDRI file.
- `key_light(size, power, location, target, color=(1, 1, 1))` — the one large soft square light.
- `softbox(width, height, power, location, target, color=(1, 1, 1))` — a strip: one clean reflection on gloss.
- `rim_light(size, power, location, target, color=(1, 1, 1), spread_deg=60)` — a tight beam from behind, for the edge.
- `camera(location, target=None, lens_mm=85, fstop=None, focus=None)` — depth of field is on when `fstop` is given; `focus` is an object or a distance, the target when left out.

A `target` is an object or a point. A light or camera aimed at an object FOLLOWS it: a product that travels stays
in the middle of the frame. Aim at a point to see it travel.

The product
- `import_model(path, fit_size=None, center=True)` — glb, gltf, obj, fbx, usd/usda/usdc/usdz, stl; returns ONE handle to move, turn and key.
- `material_glossy_plastic(color, roughness=0.15)`
- `material_metal(color=(0.8, 0.8, 0.8), roughness=0.25)`
- `material_glass(color=(1, 1, 1), roughness=0.0, ior=1.45)`
- `material_emissive(color, strength=1.0)`
- `material_from_textures(folder, scale=1.0, displacement_m=0.01)` — a Poly Haven / ambientCG set in a local folder: colour, roughness, normal (OpenGL), displacement.
- `apply_material(target, material)` — the object and every part under it.
- `flat_silhouette(objects, fg=(1, 1, 1), bg=(0, 0, 0))` — the flat two-tone look, colours written as given; returns the way back: `back = flat_silhouette([product]); ...; back()`.

Motion
- `keyframe(obj, data_path, keys, easing='EASE_IN_OUT', interpolation='BEZIER')` — `keys` is `{seconds: value}`; `obj` is whatever owns the property (an object, `cam.data`, `cam.data.dof`, a light's data); a value is in Blender's own unit, so `rotation_euler` is radians.
- `orbit(obj, center, radius, start_deg, end_deg, t0, t1, height=0.0, easing='EASE_IN_OUT', interpolation='BEZIER')` — a true circle round `center`; 0 is the front (-Y), 90 the right (+X); returns the pivot.

Rendering
- `render_frames(out_dir, start_s=None, end_s=None, times=None)` — `NNNN.png` by frame number; a range stops before `end_s`; `times` renders single moments. Returns the paths.
- `render_still(out_png, t)` — one PNG at time `t`.
- `shape_check(out_png, reference_png, t=0, views=('front', 'side'), subject=None)` — the reference photo beside our model seen square-on, one image for the storyboard.

## Three things that go wrong

1. **Never call `preferences.get_devices()`** — it crashes this Blender build. `setup_render` selects the card through
   `get_devices_for_type('OPTIX')`, then `'CUDA'`, then the CPU; do not select devices in a scene.py.
2. **An action without a bound slot animates nothing in Blender 5.x** — the keys exist and evaluate to nothing. Key
   through `kit.keyframe` (it binds the slot). An action made by hand needs both `animation_data.action` and
   `animation_data.action_slot` set.
3. **Render small before rendering all** — `-- <out> --w 480 --h 270 --samples 16 --times 0,1,2`, open the PNGs and
   look (black frame, blown highlight, focus, framing), then render the range. A PNG holds screen values under
   Blender's film look (AgX), not the linear colours given to a material.
