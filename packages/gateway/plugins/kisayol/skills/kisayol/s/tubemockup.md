---
name: tubemockup
aliases: [tupmokap, krem]
title_tr: Tüp ambalaj mokabı
title_en: Squeeze tube mockup
when_tr: Krem, diş macunu, el kremi gibi tüp ambalajın tasarımını göstermek; kozmetik ve bakım ürünleri
when_en: Shows the design of a squeeze tube such as cream or toothpaste; cosmetics and personal care
shelf: mockup-packaging
role: base
medium: image
inputs: [product-photo]
slots: {pose: "a pair of tubes, one standing on its cap and one lying in front|a single tube lying on its side with a small swirl of the contents beside the nozzle", setting: "a pale stone basin edge|a soft blush-beige seamless sweep|a white tiled shelf with a folded towel", aspect: "4:5|1:1|9:16"}
composes_with: [gradeclean, gradecool, gradefilm, macro100]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00309, house-authored
version: 1
---

## Prompt

Use the attached image, a photo of the client's tube or its flat artwork, as the only source of the design: keep its exact layout, colours, graphics and its own label as supplied; do not redraw, translate or restyle it. Show {pose} on {setting}, framed for {aspect}. The tube is real: a soft, slightly uneven body, a crimped and ribbed seal at the flat end, a matte or gloss laminate true to the supplied finish, the design curving round the body and pinching correctly into the seal, a screw or flip cap with its moulding line. The contents, where shown, have true texture: a soft peak, a glossy skin, fine air bubbles. Lighting: a large softbox overhead and slightly behind for a long highlight along the body, a white card in front, soft contact shadows. Medium-format camera, 100 mm lens at f/8, camera just above the tubes. Restrained grade, accurate colour, fine grain. No people. Add no text, letters or logos beyond what the supplied design already carries.

## Notes

- codex-image: attach the photo or artwork and say "use the attached design exactly on the tube".
- h3-from-still: a four-second slow push-in, locked exposure; 8 steps.
