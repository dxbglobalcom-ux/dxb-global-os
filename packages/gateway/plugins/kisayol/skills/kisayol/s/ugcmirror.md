---
name: ugcmirror
aliases: [aynaselfie, banyoaynasi]
title_tr: UGC ayna çekimi
title_en: UGC mirror shot
when_tr: Tıraş, bakım, giyim; aynada telefonla çekilmiş, rutinin ortasında gerçek an
when_en: Grooming, care, clothing; a phone shot in the mirror, a real moment in the middle of a routine
shelf: people-ugc-still
role: base
medium: image
inputs: [product-photo, cast-photo, scene-ref]
slots: {room: "a small bathroom with white tiles|a hallway with a full-length mirror|a bedroom wardrobe mirror", time: "early morning|evening", aspect: "9:16|4:5", market: "*"}
composes_with: [phonemain]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-01728, house-authored
version: 1
---

## Prompt

Use the attached scene reference only for its framing, room, light and phone angle; do not copy the person in it, and copy no text or logo from it. The person is the one in the attached cast photo, an adult man or an elderly woman from our own cast, with exactly that face, hair and build, modestly dressed. The product is the attached product photo, with exactly its shape, colours, materials and its own label; do not change anything on it. A real photo taken in the mirror of {room} in a home in {market}, in the {time}: the person holds the phone at chest height with one hand, so the phone partly covers the lower face, and holds or uses the product with the other, label turned toward the mirror. The mirror has real traces: a few water spots, a faint smear, fog fading at one corner if it is a bathroom. Behind: a towel hanging slightly crooked, a shelf with two half-used bottles, a door frame. Light from what is in the room: the mirror light above, cool daylight from a small window to one side. Real skin with visible pores, fine hairs on the forearm, natural shine; real fabric with creases. The phone's look: framed for {aspect}, deep focus, mild wide-angle perspective, auto exposure, fine noise in the dim corners, neutral colour, framing slightly tilted. Do not smooth or retouch the skin, do not add studio light or a portrait-mode blur, do not mirror-flip the product's label into a wrong reading, and add no text, captions or watermark.

## Notes

- codex-image: attach the scene reference, the cast photo and the product photo; say which is which.
- A mirror reverses the label: if the engine cannot keep it true, the product faces the phone directly instead.
- h3-from-still: one simple use of the product, the phone arm moving with the body; 8 steps.
