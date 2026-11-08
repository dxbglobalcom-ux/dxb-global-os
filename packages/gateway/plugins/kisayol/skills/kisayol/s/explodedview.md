---
name: explodedview
aliases: [patlatilmis, parcalar, cihazici, icyapi]
title_tr: Patlatılmış görünüm
title_en: Exploded view
when_tr: Parçalardan oluşan ürünün yapısını ve işçiliğini göstermek; elektronik cihaz, alet, kozmetik ambalajı
when_en: Shows how a multi-part product is built and crafted; electronic devices, appliances, cosmetic packs
shelf: studio-product
role: base
medium: image
inputs: [product-photo]
slots: {axis: "a vertical stack|a horizontal line along the product's long axis|a gentle isometric diagonal", backdrop: "clean light grey seamless|charcoal-to-black gradient", aspect: "4:5|1:1|16:9"}
composes_with: [gradeclean, gradecool, macro100, softbox]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00002, ads-01619, ads-01622, ads-00805
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Create a clean exploded view of the same product: separate only the parts it really has and that the photo shows or plainly implies (cap, collar, body, inner seal, base, lid, strap), drawn apart along {axis} in assembly order, with even gaps so each part reads on its own and the way they fit back together stays obvious. Every part keeps its true scale, material and colour: machined edges, anodised and matte finishes, tiny screws where the product has them; nothing is invented inside. For an electronic device, inner layers such as the board or battery appear only when the job supplies a teardown photo, and any screen is dark and blank with no interface and no icons. Framed for {aspect} on a {backdrop}. Lighting: one large softbox above and slightly in front as the key, a thin rim light behind tracing every part's edge, soft individual contact shadows falling on the backdrop under the lowest part only. Photographic, not a render: real material texture, true speculars, tiny honest imperfections. Medium-format camera, 100 mm lens at f/11, square-on to the axis, verticals straight. Restrained grade, accurate colour, fine grain. No callout lines, no labels, no arrows, no people. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the photo and say "use the attached product exactly; separate its real parts only".
- If the product's real parts are unknown, ask the client for a photo of it taken apart; an invented inside is a false claim.
- h3-from-still: a four-second slow reassembly or separation, locked camera; 8 steps.
