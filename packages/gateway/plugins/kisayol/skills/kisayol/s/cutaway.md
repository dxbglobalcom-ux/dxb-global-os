---
name: cutaway
aliases: [kesit, icgorunum]
title_tr: Kesit görünüm
title_en: Cutaway view
when_tr: Ürünün içindeki katmanı, dolguyu ya da mekanizmayı göstermek; yastık, ayakkabı tabanı, termos, cihaz
when_en: Reveals an inner layer, filling or mechanism; pillows, soles, flasks, devices
shelf: studio-product
role: base
medium: image
inputs: [product-photo]
slots: {cut: "a clean quarter section removed from the front corner|a straight vertical half-section", backdrop: "warm light grey seamless|deep slate seamless", aspect: "4:5|1:1|16:9"}
composes_with: [gradeclean, gradecool, macro100, softbox]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: unavailable}
status: candidate
samples: []
provenance: ads-00003, ads-00001
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show a professional cutaway of the same product: {cut}, removing only the minimum of the outer shell needed to reveal the inside, while the rest of the product stays whole and recognisable from the front. The cut faces are flat and precise, showing the real wall thickness and the true layers, filling or mechanism of this kind of product, each in its honest material: foam cells, fibre, insulation, metal, plastic, glass. Framed for {aspect} on a {backdrop}. Lighting: a softbox high camera-left as the key raking across the cut faces so their texture reads, a white card camera-right as fill, a thin rim light behind. Photographic and physically plausible, like a real product sawn in a workshop and photographed in the studio: crisp edges, faint tool marks on the cut. Medium-format camera, 100 mm lens at f/11, three-quarter angle, eye level. Restrained grade, accurate colour, fine grain. No callout lines, no labels, no arrows, no people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; only the cut section is new".
- The inside must be true to the product: get the client's construction (a section photo or spec) before use; an invented inside is a false claim.
