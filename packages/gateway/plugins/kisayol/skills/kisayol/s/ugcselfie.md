---
name: ugcselfie
aliases: [ozcekim, telefonselfie]
title_tr: UGC telefon özçekimi
title_en: UGC phone selfie with the product
when_tr: Sosyal akışta reklam gibi görünmemesi gereken iş; kast fotoğrafı ve gerçek bir sahne referansı elde
when_en: A social job that must not look like an ad; a cast photo and a real scene reference at hand
shelf: people-ugc-still
role: base
medium: image
inputs: [product-photo, cast-photo, scene-ref]
slots: {place: "a home kitchen in morning window light|a parked car in daylight|a balcony at late afternoon|a living room by a lamp in the evening", aspect: "9:16|4:5", market: "*"}
composes_with: []
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-01728, ads-01727, house-authored
version: 1
---

## Prompt

Use the attached scene reference only for its framing, room, light and phone angle; do not copy the person in it, and copy no text or logo from it. The person is the one in the attached cast photo, an adult man or an elderly woman from our own cast, with exactly that face, hair and build. The product in the hand is the attached product photo, with exactly its shape, colours, materials and its own label as photographed; do not invent or change anything on it. A real photo taken by the person on the phone's front camera at arm's length in {place} in {market}, the phone a little below eye level and tilted up, framing slightly off-centre, an elbow or the top of the head cut by the edge. The free hand holds the product up beside the face at a natural distance, label to the lens, fingers relaxed; the expression is an ordinary, unposed half-smile mid-sentence. Real skin: visible pores on the nose and cheeks, fine lines, slight shine on the forehead, natural variation in tone; the everyday clothes of {market} with a soft worn collar. Light only from what is really there: window daylight on one side, warmer room light on the other, the phone's auto white balance settling between them. The phone's look: framed for {aspect}, deep focus with the background only slightly soft, mild wide-angle perspective, auto exposure with the window a little bright, fine sensor noise in the shadows, neutral slightly cool colour. Do not smooth or beauty-filter the skin, do not add a ring light, a portrait-mode blur or a warm filter, do not make it look like an advertisement, and add no text, captions, stickers or watermark.

## Notes

- codex-image: attach the scene reference, the cast photo and the product photo, in that order; say which is which.
- A spoken claim belongs to the video step and the writer seat; this still claims nothing.
- h3-from-still: the H3 UGC look line from the UGC realism sheet ends the prompt; 8 steps.
