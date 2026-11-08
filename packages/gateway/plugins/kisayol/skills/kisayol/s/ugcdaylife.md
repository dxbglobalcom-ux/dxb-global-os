---
name: ugcdaylife
aliases: [gunumden, gunluk]
title_tr: Günümden bir an (UGC)
title_en: UGC day-in-life moment
when_tr: Ürün günlük hayatın doğal bir parçası olarak görünsün; reklam gibi durmaması gereken akış içeriği
when_en: The product seen as a natural part of an ordinary day; feed content that must not look like an ad
shelf: ugc-video
role: base
medium: video
inputs: [product-photo, cast-photo, scene-ref]
slots: {moment: "making breakfast in a home kitchen|packing a bag by the front door before leaving|a short break at a home desk|watering plants on a balcony", time: "morning|late afternoon", market: "*"}
composes_with: [lightleak, phonehandheld, whipcut]
conflicts: []
cast: house
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached scene reference only for its framing, room, light and phone angle; do not copy the person in it, and copy no text or logo from it. The person is the one in the attached cast photo, an adult man or an elderly woman from our own cast, with exactly that face, hair and build. The product is the attached product photo, with exactly its shape, colours, materials and its own label as photographed, unchanged in every frame. THE SCENE: {moment} in a home in {market}, in {time} light, filmed by the person on the phone's main camera held in one hand at chest height, as if showing a friend their day. The phone follows them for a few steps through the task, then the product enters naturally as part of it: picked up, used once in a real way, put down where it belongs, label seen for a moment without being presented. A small glance at the lens, an unforced half-smile. The camera sways a little with the steps and the breath, reframes when they move, and the focus finds the product again after a quick movement. The room is real and lived-in: a few honest things slightly out of order, worn surfaces, daylight from one side. Stable enough to read the action; no robotic motion, no random shaking.

Photoreal live-action smartphone video, vertical 9:16, filmed by the person themselves on a modern phone: auto exposure and auto white balance, slight sensor noise in the shadows, the phone's own mild sharpening, small handheld micro-movement, imperfect framing. Real skin with visible pores and fine texture, real fabric, real room. It must read as a real person filming their own day, never as a studio advertisement: no studio lights, no smooth gimbal or dolly movement, no cinematic shallow focus, no beauty filter, no airbrushed skin, no text, no captions, no watermark. The face, hands and product stay exactly the same from the first frame to the last; no warping, no flicker.

## Notes

- Picture only: any spoken line comes from the job's script chain, never from this recipe.
- h3: cast photo `<Picture 1>`, product photo `<Picture 2>`; 8 steps.
- h3-from-still: start from a ugcselfie or lifestyleshot still; 8 steps.
