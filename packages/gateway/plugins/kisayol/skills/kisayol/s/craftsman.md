---
name: craftsman
aliases: [usta, zanaatkar]
title_tr: Usta işinin başında
title_en: Craftsman at work
when_tr: Alet, iş giyimi, malzeme, el yapımı ürün; ustanın elinde, emeğin ortasında
when_en: Tools, workwear, materials, handmade goods; in a craftsman's hands, in the middle of the work
shelf: people-ugc-still
role: base
medium: image
inputs: [product-photo, cast-photo]
slots: {craft: "a woodworker at his bench|a leatherworker stitching|a potter at the wheel|a metalworker at the forge|a tailor at his cutting table", aspect: "4:5|16:9|9:16", market: "*"}
composes_with: [gradeclean, gradecool, gradefilm]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

The person is the one in the attached cast photo, an adult man from our own cast, with exactly that face, hair and build. The product is the attached product photo, with exactly its shape, colours, materials and its own label; do not change anything on it. A documentary photo of {craft}, caught in the middle of the work: his eyes on the piece, his hands doing the skilled thing, the product used in the work or within reach on the bench where it really belongs, label visible. The workshop is a real, old one in {market}, its tools and materials those of the craft there: tools hung on a pegboard with their outlines worn, offcuts and shavings on the floor, dust in the air, a stool with a cracked seat. Light: one large window or an open door on camera-left, a hard shaft across the bench, dust motes lit in it, the rest of the room falling into deep, detailed shadow. Real hands: calluses, a healed cut, dirt in the creases, veins and tendons in motion; real face: pores, wrinkles, sweat at the temple, concentration without performance. Full-frame camera, 35 mm lens at f/2.8, at bench height, framed for {aspect}; the hands and the product sharp, his face sharp or just behind the plane of focus. Restrained grade, rich but not crushed shadows, fine film grain; no glamour light, no smoke effect, no clean showroom bench. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the cast photo and the product photo; say which is which.
- Protective gear the craft really needs (apron, goggles, gloves) is worn.
- h3-from-still: one real stroke of the work, shavings or sparks fall, camera locked, five seconds; 8 steps.
