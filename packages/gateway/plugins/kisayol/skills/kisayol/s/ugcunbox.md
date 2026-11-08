---
name: ugcunbox
aliases: [kutuacilisi, ugckutu]
title_tr: UGC kutu açılışı özçekim
title_en: UGC unboxing selfie
when_tr: Kargo ya da hediye kutusundan ilk çıkış; paket deneyimi önemli ürünler
when_en: The first moment out of the parcel or gift box; products whose packaging matters
shelf: ugc-video
role: base
medium: video
inputs: [product-photo, cast-photo, scene-ref]
slots: {surface: "a kitchen table by a window|a sofa cushion in a living room|a home desk under a lamp", box: "a plain brown shipping box|the product's own retail box as photographed"}
composes_with: []
conflicts: []
cast: house
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: video-000019, video-003000, house-authored
version: 1
---

## Prompt

Use the attached scene reference only for its framing, room, light and phone angle; do not copy the person in it, and copy no text or logo from it. The person is the one in the attached cast photo, an adult man or an elderly woman from our own cast, with exactly that face, hair and build. The product is the attached product photo, with exactly its shape, colours, materials and its own label as photographed, unchanged in every frame. THE SCENE: the phone is propped against a mug on {surface}, main camera about 60 cm away, the person's face and chest at the top of the frame and their hands at the centre. They open {box}: a thumb runs along the tape, the flaps fold back, a sheet of tissue or the inner tray lifts, and they take the product out and turn it once in both hands toward the lens, label first, with a small honest smile and a short glance at the camera. Real paper behaviour: cardboard creases, tape tears unevenly, tissue crinkles and settles. The light is the room's own: window daylight from one side, a warmer lamp on the other. The product looks exactly as in the photo the moment it appears; nothing pops in or changes.

Photoreal live-action smartphone video, vertical 9:16, filmed by the person themselves on a modern phone: auto exposure and auto white balance, slight sensor noise in the shadows, the phone's own mild sharpening, small handheld micro-movement, imperfect framing. Real skin with visible pores and fine texture, real fabric, real room. It must read as a real person filming their own day, never as a studio advertisement: no studio lights, no smooth gimbal or dolly movement, no cinematic shallow focus, no beauty filter, no airbrushed skin, no text, no captions, no watermark. The face, hands and product stay exactly the same from the first frame to the last; no warping, no flicker.

## Notes

- Picture only: any spoken line comes from the job's script chain, never from this recipe.
- h3: cast photo `<Picture 1>`, product photo `<Picture 2>`; 8 steps.
- h3-from-still: start from the frame with the closed box; 8 steps.
