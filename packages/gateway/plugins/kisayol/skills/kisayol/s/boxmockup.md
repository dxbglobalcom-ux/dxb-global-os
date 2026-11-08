---
name: boxmockup
aliases: [kutumokap, karton]
title_tr: Kutu ambalaj mokabı
title_en: Box packaging mockup
when_tr: Müşterinin kutu tasarımını gerçek bir kutu üzerinde göstermek; ambalaj sunumu, ürün sayfası, lansman
when_en: Shows the client's box design on a real, physical box; packaging pitch, product page, launch
shelf: mockup-packaging
role: base
medium: image
inputs: [product-photo]
slots: {box: "a folding carton with a tuck-end lid|a rigid two-piece box with the lid set beside it|a mailer box with the flap half open", setting: "a light oak table|a warm grey seamless sweep|a concrete studio floor", aspect: "4:5|1:1|16:9"}
composes_with: [gradeclean, gradecool, gradefilm, softbox]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-04894, ads-00310
version: 1
---

## Prompt

Use the attached image, a photo of the client's pack or its flat artwork, as the only source of the design: keep its exact layout, colours, graphics and its own label as supplied; do not redraw, translate or restyle it. Show it printed on {box}, standing on {setting}, framed for {aspect}, at a three-quarter angle so the front and one side face read at once. The pack is a real object: board thickness visible at the edges, crisp but slightly rounded folds, a faint crease line, the print sitting in the board's surface with a matte or satin sheen true to the stock, never a flat sticker look; the design wraps correctly around edges and follows the perspective. Lighting: a large softbox high camera-left as the key, a white card camera-right as fill, a soft contact shadow and a faint ambient occlusion where the box meets the surface. Medium-format camera, 80 mm lens at f/8, camera slightly above the lid, verticals straight. Restrained grade, accurate colour matching the artwork, fine grain. No people. Add no text, letters or logos beyond what the supplied design already carries.

## Notes

- codex-image: attach the pack photo or artwork and say "use the attached design exactly on the box".
- If small print comes out garbled, the real artwork is laid onto the faces in post (rule f).
- h3-from-still: a five-second slow orbit of 20 degrees around the box; 8 steps.
