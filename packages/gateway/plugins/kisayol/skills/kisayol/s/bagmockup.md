---
name: bagmockup
aliases: [alisveriscantasi, cantamokap]
title_tr: Alışveriş çantası mokabı
title_en: Shopping bag mockup
when_tr: Mağaza ya da marka için alışveriş çantası sunumu; markanın işareti sonradan yüzeye yerleştirilir
when_en: A shopping bag presentation for a store or brand; the brand's mark is laid onto the face in post
shelf: mockup-packaging
role: base
medium: image
inputs: [none]
slots: {bag: "an uncoated kraft paper bag with twisted paper handles|a matte laminated card bag with rope handles|a heavy cotton canvas tote", colour: "natural kraft brown|deep forest green|off-white|charcoal black", setting: "a light terrazzo floor against a plaster wall|a wooden bench in soft daylight", aspect: "4:5|1:1|16:9"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: untested, h3-from-still: unavailable}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Photograph {bag} in {colour}, standing slightly open on {setting}, framed for {aspect}, at a gentle three-quarter angle with a second, identical bag behind it turned the other way for depth. The bag is real: crisp folded gussets, a reinforced top fold, handles casting small shadows, slight bowing of the sides, fibre or weave texture visible, one faint scuff near the base. The large front face is completely plain and evenly lit, with no print of any kind, so the client's mark can be laid onto it in post; keep that face flat to the camera within 25 degrees. Lighting: soft daylight from a large window camera-left, a white bounce right, a soft contact shadow on the floor. Full-frame camera, 50 mm lens at f/5.6, camera at the bag's mid-height, verticals straight. Restrained grade, true colour, fine grain. No people. Add no text, letters or logos anywhere.

## Notes

- media-still or codex-image: text-only; no input needed. The real mark goes onto the plain face in post, following its perspective.
- If the client sends a photo of their real bag, use `boxmockup`'s approach instead: the supplied design as the only source.
