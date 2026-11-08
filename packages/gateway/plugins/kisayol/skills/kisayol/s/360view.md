---
name: 360view
aliases: [donusum360, turnaround]
title_tr: 360 derece dönüş sayfası
title_en: 360 view turnaround sheet
when_tr: Ürünün her açıdan görünüşü; ürün sayfası galerisi, 360 döndürücü, video ve 3B iş için referans
when_en: The product from every side; product page gallery, a 360 spinner, a reference for video and 3D work
shelf: studio-product
role: base
medium: image
inputs: [product-photo]
slots: {views: "eight views every 45 degrees in a 4 by 2 grid|five views: front, front three-quarter, side, rear three-quarter, rear, in one row", background: "pure white seamless|light neutral grey seamless", aspect: "16:9|3:2"}
composes_with: [gradeclean]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Make one turnaround sheet of this same product: {views}, framed for {aspect}, every view on the same {background}. Consistency is the whole job: the product turns on a turntable while the camera and lights stay still, so each view has the identical camera height, lens, distance, scale, light direction and white balance; the base sits on the same baseline in every cell. Sides the photo does not show are completed plainly and conservatively from what it does show, with no invented details, features or decoration. Lighting: two large softboxes left and right at 45 degrees and an overhead scrim, a soft contact shadow under each view. Medium-format camera, 120 mm lens at f/11, camera at the product's centre height, no perspective change between cells. Even gaps between views, no borders or dividers. Restrained grade, accurate colour, fine grain. No people. Add no text, letters, numbers or logos anywhere.

## Notes

- codex-image: attach the photo (better: front and back photos) and say "use the attached product exactly; the same product from every angle".
- Unseen sides are a guess: show the sheet to the client before any view goes to a listing.
- h3-from-still: from the front view, a slow eight-second turntable spin, locked camera; 8 steps.
