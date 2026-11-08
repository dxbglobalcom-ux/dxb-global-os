---
name: ugcreaction
aliases: [tepki, ilkdeneme]
title_tr: Ürüne ilk tepki (UGC)
title_en: UGC reaction to the product
when_tr: Ürünün ilk dokunuşta fark edilen bir özelliği varsa; dokunma, koku, doku, ilk kullanım anı
when_en: When the product has a quality noticed at first touch; texture, feel or the first use
shelf: ugc-video
role: base
medium: video
inputs: [product-photo, cast-photo, scene-ref]
slots: {place: "a kitchen table by a window|a sofa in a living room in the evening|a parked car in daylight"}
composes_with: []
conflicts: []
cast: house
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: video-000221, video-000227, house-authored
version: 1
---

## Prompt

Use the attached scene reference only for its framing, room, light and phone angle; do not copy the person in it, and copy no text or logo from it. The person is the one in the attached cast photo, an adult man or an elderly woman from our own cast, with exactly that face, hair and build. The product is the attached product photo, with exactly its shape, colours, materials and its own label as photographed, unchanged in every frame. THE SCENE: in {place}, the person films themselves on the phone's front camera at arm's length and tries the product for the first time on camera: they open, press, touch or turn it, and the honest reaction arrives a breath later: eyebrows lift slightly, a short surprised half-smile, a small nod, then they bring the product closer to the lens for a second to show the detail that caused it, label visible. The reaction is small and believable, the size a real person shows when alone with a phone; no wide-eyed shock, no hand on the chest, no exaggerated mouth. Natural blinking and breathing, the phone arm moving with the body, auto exposure adjusting a little as the product comes close. Light only from what is really there.

Photoreal live-action smartphone video, vertical 9:16, filmed by the person themselves on a modern phone: auto exposure and auto white balance, slight sensor noise in the shadows, the phone's own mild sharpening, small handheld micro-movement, imperfect framing. Real skin with visible pores and fine texture, real fabric, real room. It must read as a real person filming their own day, never as a studio advertisement: no studio lights, no smooth gimbal or dolly movement, no cinematic shallow focus, no beauty filter, no airbrushed skin, no text, no captions, no watermark. The face, hands and product stay exactly the same from the first frame to the last; no warping, no flicker.

## Notes

- The reaction claims nothing in words; any spoken line comes from the job's script chain, never from this recipe.
- h3: cast photo `<Picture 1>`, product photo `<Picture 2>`; 8 steps.
- h3-from-still: start from a ugcselfie still; 8 steps.
