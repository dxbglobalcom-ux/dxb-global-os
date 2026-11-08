---
name: showcase
aliases: [vitrin, studyocekimi]
title_tr: Stüdyo vitrin çekimi
title_en: Studio showcase shot
when_tr: Telefonla çekilmiş ürün fotoğrafını profesyonel stüdyo çekimine çevirir; katalog, pazaryeri, reklam ana görseli
when_en: Turns a phone photo of the product into a professional studio shot; catalogue, marketplace, key visual
shelf: studio-product
role: base
medium: image
inputs: [product-photo]
slots: {background: "seamless warm grey paper|soft grey-to-white gradient|a honed travertine plinth", aspect: "1:1|4:5|9:16"}
composes_with: [bggradient, bgseamless, centered, gradeclean, gradecool, gradefilm, gradehighkey, macro100, matfrosted, matmetal, matstone, matwet, negspace, rimlight, softbox, thirds]
conflicts: []
cast: none
forms: {codex-image: ok, seedream: unavailable, klein-ref: unavailable, krea-still: unavailable}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Re-photograph it as a high-end studio packshot on {background}, framed for {aspect} with generous negative space. Lighting: a large softbox high camera-left as the key, a white bounce card camera-right for gentle fill, a thin strip light behind for a clean rim along the edges. Real material behaviour: true specular highlights on gloss, soft falloff on matte, micro-texture and tiny dust-free imperfections that prove it is a real object. A soft contact shadow and a faint reflection ground the product; physically plausible shadows only. Medium-format camera, 100 mm macro lens at f/8, eye-level, perfectly level horizon. Restrained grade, accurate colour, fine grain; no airbrushed plastic look, no oversharpening, no glowing edges. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; only the setting and light change".
- Marketplace main images that require pure white: pick a separate white-background recipe, not this one.
