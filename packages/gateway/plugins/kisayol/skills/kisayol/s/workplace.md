---
name: workplace
aliases: [isyeri, mesai]
title_tr: İş yerinde
title_en: At the workplace
when_tr: İş ve profesyonel kullanım ürünü; çalışan bir insanın elinde, gerçek iş anında
when_en: Professional and work-use products; in the hands of a working person, in a real work moment
shelf: people-ugc-still
role: base
medium: image
inputs: [product-photo, cast-photo]
slots: {workplace: "a small architecture office|a busy restaurant kitchen pass|a warehouse loading bay|a pharmacy back room|a repair shop counter", aspect: "4:5|16:9|9:16"}
composes_with: []
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

The person is the one in the attached cast photo, an adult man from our own cast, with exactly that face, hair and build, dressed in the real working clothes of {workplace}. The product is the attached product photo, with exactly its shape, colours, materials and its own label; do not change anything on it. A candid photo taken by a colleague on a phone's main camera from about one metre in {workplace} during the working day: the man is in the middle of a task and uses the product as part of it, his attention on the work, not on the camera; the label stays visible. Colleagues in the background are adult men or elderly women from our own cast, busy and out of focus, faces not readable. The workplace is real: tools and materials in use, marks of wear, a cable, a cardboard box, light that comes from the place itself (overhead fluorescent tubes mixed with daylight from a door or window). Real skin with pores and a little sweat at the temple, sleeves pushed up, fabric creased from movement. The phone's look: framed for {aspect}, deep focus, mild wide-angle perspective, framing slightly off-centre, auto exposure, fine noise in the shadows, neutral colour, a little motion blur on the moving hand only. Every sign, screen and box in the background is blank or blurred beyond reading. Do not retouch the skin, do not stage it like a stock photo, do not add studio light, and add no text, letters or logos anywhere.

## Notes

- codex-image: attach the cast photo and the product photo; say which is which.
- Safety gear the place really requires (gloves, apron, hair net) is worn.
- h3-from-still: the hand completes the task with the product, phone held by a colleague; 8 steps.
