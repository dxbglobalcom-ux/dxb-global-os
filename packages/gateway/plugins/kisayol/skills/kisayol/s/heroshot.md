---
name: heroshot
aliases: [kahramancekim, anagorsel]
title_tr: Kahraman ürün çekimi
title_en: Product hero shot
when_tr: Lansman ve premium reklamın tek güçlü ürün görseli; site kahraman alanı, kampanya açılışı
when_en: The single powerful product image of a launch or premium ad; website hero, campaign opener
shelf: studio-product
role: base
medium: image
inputs: [product-photo]
slots: {backdrop: "deep charcoal sweep|midnight-blue gradient|warm umber gradient", aspect: "4:5|16:9|1:1|9:16"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00124, ads-00169, ads-04536
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Photograph it as a premium hero image: the product stands alone on a low dark surface against a {backdrop}, framed for {aspect}, seen from slightly below its centre so it reads tall and confident, with clear focal dominance and calm negative space around it. Lighting: one large hard-edged strip softbox high camera-right as the key, carving a bright highlight down one side; two thin strip lights behind left and right drawing clean rim lines along both edges; a black flag camera-left so that side falls into rich, detailed shadow. A faint pool of light on the backdrop behind the product separates it from the dark. Real materials: crisp speculars on gloss, fine micro-texture on matte, a soft reflection in the dark surface beneath. Medium-format camera, 120 mm lens at f/8, camera height just below the product's midline. Filmic contrast with detail held in the shadows, restrained saturation, fine grain; no glow halos, no fake HDR, no plastic sheen. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; only the setting and light change".
- h3-from-still: a slow five-second push-in with the rim light steady, constant exposure, no cuts; 8 steps.
