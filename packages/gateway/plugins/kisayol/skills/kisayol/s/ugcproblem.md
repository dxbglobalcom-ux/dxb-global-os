---
name: ugcproblem
aliases: [sorunçözüm, oncesonrasiugc]
title_tr: Önce sorun sonra çözüm (UGC)
title_en: UGC problem then solution
when_tr: Ürünün çözdüğü gündelik bir zorluk varsa; önce eski yol, sonra ürün
when_en: When the product answers an everyday struggle; first the old way, then the product
shelf: ugc-video
role: base
medium: video
inputs: [product-photo, cast-photo, scene-ref]
slots: {place: "a home kitchen|a small home workshop|a hallway by the front door|a bathroom with a frosted window", time: "morning|evening"}
composes_with: []
conflicts: []
cast: house
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: video-000125, video-000131, video-000158, house-authored
version: 1
---

## Prompt

Use the attached scene reference only for its framing, room, light and phone angle; do not copy the person in it, and copy no text or logo from it. The person is the one in the attached cast photo, an adult man or an elderly woman from our own cast, with exactly that face, hair and build. The product is the attached product photo, with exactly its shape, colours, materials and its own label as photographed, unchanged in every frame. THE SCENE, about eight seconds in {place} in {time} light, filmed on the phone's main camera held by the person or propped on a shelf. First half: the person meets the small everyday struggle named in the job brief, doing it the old way, with a real, small frustration: a sigh in the shoulders, a second try, a glance at the lens. Second half, with no cut: they set the old way aside, pick up the product and do the same task with it in one clear, honest gesture, the result plainly visible and no larger than the product can really give, then hold the product up for a second, label to the lens. Natural blinking and breathing, the phone moving a little with the hand. Light stays the room's own across the whole take.

Photoreal live-action smartphone video, vertical 9:16, filmed by the person themselves on a modern phone: auto exposure and auto white balance, slight sensor noise in the shadows, the phone's own mild sharpening, small handheld micro-movement, imperfect framing. Real skin with visible pores and fine texture, real fabric, real room. It must read as a real person filming their own day, never as a studio advertisement: no studio lights, no smooth gimbal or dolly movement, no cinematic shallow focus, no beauty filter, no airbrushed skin, no text, no captions, no watermark. The face, hands and product stay exactly the same from the first frame to the last; no warping, no flicker.

## Notes

- The struggle comes from the job brief and must be one the product truly solves; no exaggerated result.
- Picture only: any spoken line comes from the job's script chain, never from this recipe.
- h3: cast photo `<Picture 1>`, product photo `<Picture 2>`; 8 steps.
