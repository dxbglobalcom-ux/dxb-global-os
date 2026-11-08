---
name: truckside
aliases: [tirreklami, kamyonyani]
title_tr: Kamyon yan panosu
title_en: Truck-side ad
when_tr: Gezen reklam ya da dağıtım filosu kampanyası; ürün kamyonun yan panelinde, şehir caddesinde
when_en: Mobile billboard or fleet campaign; the product on a truck's side panel on a city avenue
shelf: outdoor-ooh
role: base
medium: image
inputs: [product-photo]
slots: {motion: "parked at the kerb|passing with the background panned into motion blur", time: "morning|late afternoon|golden hour", aspect: "16:9|4:5|1:1", market: "*"}
composes_with: [goldenhour, gradeclean, gradecool, gradefilm, street35]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show it on the full side panel of a plain white rigid box truck on a city avenue in {market} in the {time}, {motion}. The panel's printed image is the product alone, large and right of centre, on a clean ground drawn from its own colours with a soft studio shadow, printed on vinyl over flat aluminium. Real materials: rivet lines along the panel seams, a faint ripple where the vinyl crosses a seam, road grime along the lower edge, a dented rear corner guard, black rubber side skirts, dusty wheels, an unbranded cab with no badges. Photographed from the opposite pavement, square-on to the panel, full-frame camera, 35 mm lens, camera height 1.4 m, framed for {aspect}; the truck fills most of the width, the avenue's trees and shopfronts behind. Pedestrians, if any, are adult men from our own cast at the frame's edges, faces not readable. Motivated light: the sun from camera left, low enough to give the panel a gentle falloff, true shadows under the truck. Restrained grade, true colour, fine grain; no fake HDR, no oversharpening. Add no text, letters or logos anywhere, on the truck, its number plates (plain blank plates) or the shops; keep the panel's left third a plain area for the client's copy and mark laid in post.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: from the parked still, five seconds, the truck pulls away left to right, camera pans with it; 8 steps.
