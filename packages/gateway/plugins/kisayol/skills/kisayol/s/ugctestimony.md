---
name: ugctestimony
aliases: [ugctanik, kullanicitanik]
title_tr: Telefona tanıklık (UGC)
title_en: UGC testimonial to the phone camera
when_tr: Yalnız işte gerçek, kayıtlı bir kullanım varsa; kullanan kişi ön kamerayla ürünü anlatır
when_en: Only when the job records a real use; the user tells about the product to the front camera
shelf: ugc-video
role: base
medium: video
inputs: [product-photo, cast-photo, scene-ref]
slots: {place: "a home kitchen in morning window light|a parked car in daylight|a living room by a lamp in the evening|a small home workshop by a window"}
composes_with: []
conflicts: []
cast: house
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: video-000124, video-000172, house-authored
version: 1
---

## Prompt

Use the attached scene reference only for its framing, room, light and phone angle; do not copy the person in it, and copy no text or logo from it. The person is the one in the attached cast photo, an adult man or an elderly woman from our own cast, with exactly that face, hair and build. The product is the attached product photo, with exactly its shape, colours, materials and its own label as photographed, unchanged in every frame. THE SCENE: in {place}, the person films themselves on the phone's front camera held at arm's length, a little below eye level and tilted up, and speaks to the lens about the product they really use, mouth moving naturally mid-sentence with a small pause before the main point. Halfway through they lift the product beside the face for a second, label to the lens, then lower it and keep it loosely in the hand. Real micro-movements: natural blinking, breathing in the shoulders, a short glance down at the screen and back, the phone arm moving a little with the body, the framing drifting once and corrected. Light only from what is really there: daylight from one side, warmer room light from the other, the white balance settling between them. Calm, plain, believable; no exaggerated gestures, no frozen smile, no rubbery mouth.

Photoreal live-action smartphone video, vertical 9:16, filmed by the person themselves on a modern phone: auto exposure and auto white balance, slight sensor noise in the shadows, the phone's own mild sharpening, small handheld micro-movement, imperfect framing. Real skin with visible pores and fine texture, real fabric, real room. It must read as a real person filming their own day, never as a studio advertisement: no studio lights, no smooth gimbal or dolly movement, no cinematic shallow focus, no beauty filter, no airbrushed skin, no text, no captions, no watermark. The face, hands and product stay exactly the same from the first frame to the last; no warping, no flicker.

## Notes

- Picture only: what is said comes from the job's script chain, never from this recipe; first-person use is claimed only with the real use recorded in the job.
- h3: cast photo `<Picture 1>`, product photo `<Picture 2>`; the scene reference shapes the scene paragraph; 8 steps.
- h3-from-still: start from a ugcselfie still; 8 steps.
