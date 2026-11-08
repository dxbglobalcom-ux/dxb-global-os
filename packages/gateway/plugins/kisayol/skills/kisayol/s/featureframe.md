---
name: featureframe
aliases: [ozellikgorseli, ozellikler]
title_tr: Özellik anlatım karesi
title_en: Feature callout frame
when_tr: Ürünün 3 öne çıkan özelliğini gösteren reklam ya da pazaryeri ikinci görseli; çizgi ve yazılar sonradan eklenir
when_en: An ad or second marketplace image that shows three key features; callout lines and copy are added in post
shelf: platform-ads
role: base
medium: image
inputs: [product-photo]
slots: {background: "soft grey-to-white gradient|warm sand seamless|a muted colour from the product", aspect: "1:1|4:5"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: unavailable}
status: candidate
samples: []
provenance: ads-01646
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Re-photograph it on {background}, framed for {aspect}, as the base of a feature callout image. The product stands centred, three-quarter view, filling about half the frame, with a generous, even margin of clean background on every side where callout lines and copy will be laid in post. The lighting reveals its three most important physical features as distinct, legible zones: shape the key light so each one (for example a closure, a texture, a control or an edge) catches its own highlight and holds visible micro-detail. A large soft key from high camera left, a white card fill from the right, a thin rim from behind, a soft contact shadow. Real material behaviour: true specular highlights on gloss, soft falloff on matte, honest tiny imperfections. Medium-format camera, 100 mm macro lens at f/11 so the whole product is sharp front to back, eye level, perfectly level. Restrained grade, accurate colour, fine grain; no oversharpening, no glowing edges, no drawn lines, arrows or icons. No people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly". Name the three features from the job in place of the example.
