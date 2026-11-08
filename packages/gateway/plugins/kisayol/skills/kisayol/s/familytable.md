---
name: familytable
aliases: [ailesofrasi, aileyemegi]
title_tr: Aile sofrası
title_en: Family table
when_tr: Gıda, sofra ve ev ürünü; evde paylaşılan bir öğünün içinden, sıcak ve gerçek
when_en: Food, tableware and home products; from inside a shared meal at home, warm and real
shelf: people-ugc-still
role: base
medium: image
inputs: [product-photo, cast-photo]
slots: {meal: "a weekend breakfast|a weekday dinner|an afternoon tea", aspect: "4:5|16:9|1:1"}
composes_with: []
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00332, house-authored
version: 1
---

## Prompt

The product is the attached product photo, with exactly its shape, colours, materials and its own label; do not change anything on it. The main person is the one in the attached cast photo, from our own cast, with exactly that face, hair and build. A real phone photo taken by one of the family across the table during {meal} at home: the cast member, an elderly woman or an adult man, reaches for or passes the product at the centre of the moment; around the table two or three more family members, all adult men or elderly women, caught mid-conversation and mid-gesture, their faces turned away, cropped by the frame or out of focus, never readable. The table is really in use: plates with food half eaten, bread torn by hand, a jug of water, a teapot, napkins crumpled, crumbs on the cloth; only halal food and drink. The product sits where it really belongs on such a table, label toward the lens. Light: the ceiling lamp warm over the table mixing with the last daylight from a window, the phone's auto white balance between them. The phone's look: main camera, framed for {aspect}, mild wide-angle, deep focus, framing a little tilted, fine noise in the dim corners, a little motion blur on a moving hand. Real skin, real fabric, real wear on the table. Do not stage it like an advertisement, do not make everyone smile at the camera, do not add studio light or a warm filter, and add no text, letters or logos anywhere.

## Notes

- codex-image: attach the cast photo and the product photo; say which is which.
- The house cast holds: no other ages or people at this table.
- h3-from-still: hands pass the product across the table once, phone held still; 8 steps.
