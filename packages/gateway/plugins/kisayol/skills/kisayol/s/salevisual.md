---
name: salevisual
aliases: [indirimgorseli, kampanyaindirim, buyukindirim, indirimsezonu]
title_tr: İndirim kampanyası görseli
title_en: Sale visual
when_tr: İndirim, sezon sonu, büyük indirim günleri ya da özel gün kampanyası; fiyat ve teklif sonradan boş alana yerleştirilir
when_en: Sale, end-of-season, big sale days or a special-day campaign; the price and offer are laid into the plain space in post
shelf: poster-keyvisual
role: base
medium: image
inputs: [product-photo]
slots: {colour: "a vivid warm red-orange|an energetic electric blue|a sunny saturated yellow|a deep emerald green", space: "the left half|the upper half|the right half", props: "a few real paper confetti pieces and torn coloured paper strips in tones of the background falling through the air, caught sharp by a flash, some blurred close to the lens|a stack of plain shipping boxes and matte paper shopping bags beside it, one box open with crumpled tissue spilling out", aspect: "1:1|4:5|9:16|16:9", occasion: "*|a big sale season"}
composes_with: [gradeclean, gradecool, gradefilm]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00376, ads-00374, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Make an energetic sale visual for {occasion}, framed for {aspect}: the product placed in the half of the frame opposite {space}, tilted 10 degrees for momentum, on a seamless background of {colour}. Around it, {props}, never covering the product; every box and bag stays blank. Keep {space} a plain, flat, even field of the background colour for the price and the offer laid in post. Lighting: a hard key from high camera-right making a crisp shadow on the background, a soft front fill keeping the product's colours true, a rim light behind. Full-frame camera, 50 mm lens at f/8, camera at product height. Punchy but honest grade, colour of the product untouched, fine grain; no percent signs, no price tags, no badges, no glow. No people. Add no text, letters, numbers or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; the offer is added later".
- The price and offer are set by the designer from the client's real terms; a sale claim must be true.
- h3-from-still: a three-second loop of the confetti falling, product still; 8 steps.
