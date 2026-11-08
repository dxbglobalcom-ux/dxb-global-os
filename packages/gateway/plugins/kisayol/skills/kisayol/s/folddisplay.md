---
name: folddisplay
aliases: [katlanmis, yigin]
title_tr: Katlanmış yığın
title_en: Folded stack
when_tr: Triko, gömlek, tişört, havlu; renk seçeneklerini katlanmış bir yığında gösteren ürün görseli
when_en: Knitwear, shirts, tees or towels; colourways shown in a neatly folded stack
shelf: fashion
role: base
medium: image
inputs: [product-photo]
slots: {surface: "solid oak table|pale birch shelf|honed travertine block", aspect: "4:5|1:1|9:16"}
composes_with: [gradeclean, gradecool, gradefilm, windowlight]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the garment: keep its exact cut, colour, fabric, knit or weave, trims and its own labels as photographed; do not redraw, restyle or recolour it. Fold it as a shop would and stack it on a {surface}, framed for {aspect}: the hero piece on top with its collar or neckline facing the camera, under it two or three folded pieces of the same garment only in colourways the client offers. Each fold shows the fabric's real thickness at the edges, slightly uneven, one corner lifting softly. Light: soft daylight from the left at a low angle, so the edges of the stack and the knit's texture carry fine shadows, a white card on the right. Full-frame camera, 85 mm lens at f/5.6, camera slightly above the top of the stack at a 20-degree angle, the top piece sharp. Real details: a fibre or two lifted from the knit, the faint impression of the fold line. No people. True colour, restrained grade, fine grain; no cardboard-stiff folds, no plastic fabric. Add no text, letters or logos anywhere.

## Notes

- Only colourways the client has in stock; for one colour, show a stack of that one colour.
- codex-image: attach the garment photo and say "use the attached garment exactly".
