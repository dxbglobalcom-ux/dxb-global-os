---
name: grandmakitchen
aliases: [ninemutfak, anneannemutfagi]
title_tr: Büyükannenin mutfağı
title_en: Grandmother's kitchen
when_tr: Gıda, mutfak gereci, ev ürünü; deneyimli ellerden güven ve sıcaklık
when_en: Food, kitchenware, home products; trust and warmth from experienced hands
shelf: people-ugc-still
role: base
medium: image
inputs: [product-photo, cast-photo, scene-ref]
slots: {task: "kneading dough|stirring a pot of soup|rolling pastry|filling jars with preserves", aspect: "9:16|4:5"}
composes_with: []
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: video-004461, house-authored
version: 1
---

## Prompt

Use the attached scene reference only for its framing, kitchen, light and phone angle; do not copy the person in it, and copy no text or logo from it. The cook is the one in the attached cast photo, an elderly woman from our own cast, with exactly that face, hair and build, in a modest house dress, sleeves rolled, a headscarf or hair tied back. The product is the attached product photo, with exactly its shape, colours, materials and its own label; do not change anything on it. A real phone photo taken by someone in the family from about one metre while she is {task} in her own kitchen: she glances up at the phone with a warm, unposed look; the product is used in what she is doing or stands on the counter within her reach, label to the lens. Her kitchen has decades in it: a worn wooden spoon, a dented pot, a tiled backsplash with one cracked tile, flour on the counter and on her hands. Real skin: deep wrinkles, age spots, fine hairs, soft shine; hands with knuckles enlarged by work. Light: daylight from the kitchen window on one side, a warm ceiling lamp on, the phone's white balance between them. The phone's look: main camera, framed for {aspect}, deep focus, mild wide-angle, framing slightly off-centre, fine noise in the shadows, a little motion blur on her moving hands. Do not smooth her skin or make her younger, do not stage it, do not add studio light or a warm filter, and add no text, captions or logos anywhere.

## Notes

- codex-image: attach the scene reference, the cast photo and the product photo; say which is which.
- h3-from-still: she continues the task and looks up once, the phone held still; 8 steps.
