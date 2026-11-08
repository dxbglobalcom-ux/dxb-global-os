---
name: bigsale
aliases: [buyukindirim, indirimsezonu]
title_tr: Büyük indirim sezonu
title_en: Big sale season
when_tr: Büyük indirim günleri (Kasım indirimleri, 11.11 tarzı); teklif ve fiyat sonradan gerçek dosyadan eklenir
when_en: Big sale days (November sales, 11.11 style); the offer and price are laid in post from the real file
shelf: seasonal
role: base
medium: image
inputs: [product-photo]
slots: {palette: "deep black with one warm accent|electric red on charcoal|bright yellow on white", space: "the upper third|the right half|the lower third", aspect: "4:5|9:16|1:1"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00376, ads-00374, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. A bold sale-season hero in a {palette} palette: the product stands on a stack of plain shipping boxes and matte paper shopping bags, one box open with crumpled tissue spilling out, a parcel tape roll, a delivery bag folded. The set is graphic and confident: solid colour paper sweep, one strong diagonal from the stacked boxes leading to the product, energy without chaos. No people. Leave {space} of the frame as clean, even, uncluttered colour, free of objects and shadows, for the offer laid in post. Light: a hard key from high camera-left for crisp graphic shadows, a strip light behind for a bright rim on the product, a white card filling the front. Full-frame camera, 50 mm lens at f/8, slightly below product height so it looks heroic, framed for {aspect}; everything sharp. Real materials: corrugated board edges, paper bag creases, tissue crinkle, the product's true specular highlights. Restrained, punchy but true colour, fine grain; no glow, no confetti, no fake explosion, no price tags. Add no text, letters or logos anywhere, and no numbers or percent signs; every box and bag stays blank.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly; leave the stated area empty".
- The offer, the price and the date come from the client's real file in post; the engine draws none of them.
- h3-from-still: the open box's tissue settles, a slow push-in, four seconds; 8 steps.
