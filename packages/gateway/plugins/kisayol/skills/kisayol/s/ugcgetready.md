---
name: ugcgetready
aliases: [hazirlanma, sabahrutini]
title_tr: Benimle hazırlan rutini (UGC)
title_en: UGC get-ready routine
when_tr: Bakım, tıraş, saç ya da giyim ürünü; kast yetişkin erkek ya da yaşlı kadın, aynada sabah rutini
when_en: Grooming, shaving, hair or wear products; cast an adult man or an elderly woman, a morning routine at the mirror
shelf: ugc-video
role: base
medium: video
inputs: [product-photo, cast-photo, scene-ref]
slots: {place: "a bathroom mirror with a frosted window|a bedroom dresser mirror by a window|a hallway mirror by the front door", time: "early morning|late morning"}
composes_with: []
conflicts: []
cast: house
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: video-002954, house-authored
version: 1
---

## Prompt

Use the attached scene reference only for its framing, room, light and phone angle; do not copy the person in it, and copy no text or logo from it. The person is the one in the attached cast photo, an adult man or an elderly woman from our own cast, with exactly that face, hair and build. The product is the attached product photo, with exactly its shape, colours, materials and its own label as photographed, unchanged in every frame. THE SCENE: {time}, at {place}, the phone propped on the shelf or dresser at chest height, main camera, the person seen in the room and partly in the mirror, modestly and fully dressed in everyday clothes. One ordinary step of their routine with the product: an adult man shaving, trimming or combing his beard or hair, or an elderly woman smoothing a cream onto her hands or pinning her hair, as the cast photo and product decide. They pick the product up from a slightly messy shelf, use it in one unhurried, believable gesture, glance at the lens once with a small private smile, and set it back label-out. Real detail: a towel hung a little crooked, a toothbrush cup, half-used bottles, damp skin catching the window light, fine hairs and pores visible. Daylight from the window on one side, warmer mirror light above.

Photoreal live-action smartphone video, vertical 9:16, filmed by the person themselves on a modern phone: auto exposure and auto white balance, slight sensor noise in the shadows, the phone's own mild sharpening, small handheld micro-movement, imperfect framing. Real skin with visible pores and fine texture, real fabric, real room. It must read as a real person filming their own day, never as a studio advertisement: no studio lights, no smooth gimbal or dolly movement, no cinematic shallow focus, no beauty filter, no airbrushed skin, no text, no captions, no watermark. The face, hands and product stay exactly the same from the first frame to the last; no warping, no flicker.

## Notes

- Wear and modesty: everyday, fully covered clothing; the routine never shows more.
- Picture only: any spoken line comes from the job's script chain, never from this recipe.
- h3: cast photo `<Picture 1>`, product photo `<Picture 2>`; 8 steps. h3-from-still: start from a mirrorritual still; 8 steps.
