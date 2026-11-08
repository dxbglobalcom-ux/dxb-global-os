---
name: apparelmockup
aliases: [giyimmokap, kiyafet]
title_tr: Giyim mokabı
title_en: Apparel mockup
when_tr: Tişört, sweatshirt, ceket ya da şapka gibi giysiyi kendi tasarımıyla gerçekçi göstermek; e-ticaret ve koleksiyon tanıtımı
when_en: Shows a garment such as a tee, sweatshirt, jacket or cap with its own design, realistically; e-commerce and collection launches
shelf: mockup-packaging
role: base
medium: image
inputs: [product-photo]
slots: {display: "on a wooden hanger against a limewashed plaster wall|on an invisible ghost-mannequin form against light grey|folded neatly on a linen-covered table|worn by an adult man from our own cast, framed from shoulder to waist, face out of frame", aspect: "4:5|1:1|9:16"}
composes_with: [gradeclean, gradecool, gradefilm, windowlight]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00309, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the garment: keep its exact cut, colour, fabric, stitching and any print or label exactly as photographed; do not redraw or restyle it. Show it {display}, framed for {aspect}, at a slight angle so the shape and the fall of the fabric read. The fabric behaves like the real cloth: weight and drape true to its kind, soft natural creases at the elbows, waist and fold lines, visible weave or knit, a loose thread at a hem, the print following every fold and slightly cracked where the fabric bends. The garment is modest and fits naturally; nothing tight or revealing. Lighting: soft daylight from a large window camera-left, a white bounce right, a gentle shadow behind. Full-frame camera, 70 mm lens at f/5.6, camera at chest height of the garment. Restrained grade, true colour matching the photo, fine grain; no plastic fabric, no airbrushed skin. Any person is an adult man from our own cast, face not readable. Add no text, letters or logos beyond what the garment already carries.

## Notes

- codex-image: attach the garment photo (front, flat) and say "use the attached garment exactly".
- Women's garments are shown on a hanger, form or flat; a woman wearing them only on the client's recorded request (cast: client-request, a new recipe).
- h3-from-still: a four-second slow drift with the fabric moving faintly in a draught; 8 steps.
