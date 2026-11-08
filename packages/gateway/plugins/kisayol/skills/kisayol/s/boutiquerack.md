---
name: boutiquerack
aliases: [butik, aski]
title_tr: Butik askısı
title_en: Boutique rack
when_tr: Mağaza, koleksiyon duyurusu; giysi gerçek bir butikte askıda, öbürleri arasında öne çıkar
when_en: Store or collection announcement; the garment on a rail in a real boutique, standing out from the rest
shelf: fashion
role: base
medium: image
inputs: [product-photo]
slots: {store: "minimal white boutique with oak floors|warm boutique with plaster walls and brass rails|industrial boutique with polished concrete", aspect: "4:5|1:1|9:16"}
composes_with: [gradeclean, gradecool, gradefilm]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the garment: keep its exact cut, proportions, colour, fabric, stitching, trims and its own labels as photographed; do not redraw, restyle or recolour it. Hang it on a wooden hanger at the front of a clothing rail in a {store}, framed for {aspect}, turned a little toward the camera. Behind it on the rail hang five or six other plain garments in quiet neutral tones that never compete, spaced with a hand's width between them. The shop beyond is softly out of focus: a folding table with folded knitwear, a full-length mirror, a pendant lamp. Light: daylight from a shopfront window on the right, a warm track light from above picking out the hero garment's shoulders and texture. Full-frame camera, 50 mm lens at f/2, chest height, the hero garment sharp and the rest falling away. Real store details: hanger scuffs, a slightly crooked rail end, dust in a light beam. No people. Calm, restrained grade, fine grain; no plastic fabric, no fake HDR. Add no text, letters or logos anywhere, not on the walls, tags or windows.

## Notes

- codex-image: attach the garment photo and say "use the attached garment exactly".
- h3-from-still: five seconds, a slow dolly along the rail ending on the hero garment; 8 steps.
