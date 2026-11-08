---
name: bottlemockup
aliases: [sisemokap, kavanoz]
title_tr: Şişe ve kavanoz mokabı
title_en: Bottle and jar mockup
when_tr: Müşterinin etiket tasarımını gerçek bir şişe ya da kavanoz üzerinde göstermek; yağ, sos, içecek, kozmetik
when_en: Shows the client's label design on a real bottle or jar; oils, sauces, drinks, cosmetics
shelf: mockup-packaging
role: base
medium: image
inputs: [product-photo]
slots: {vessel: "a clear glass bottle|an amber glass bottle|a frosted glass jar with a matte lid|an opaque white plastic bottle", setting: "a pale stone counter|a warm grey seamless sweep|a linen-covered table by a window", aspect: "4:5|1:1|9:16"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00680, ads-00679, ads-00309
version: 1
---

## Prompt

Use the attached image, a photo of the client's bottle or its label artwork, as the only source of the design: keep its exact layout, colours, graphics and its own label as supplied; do not redraw, translate or restyle it. Show the label applied to {vessel} standing on {setting}, framed for {aspect}, slightly turned so the label curves away at both sides. The label wraps the curve correctly, with true perspective, a hairline edge and the paper or film texture of a real printed label; where the vessel is clear, its contents show through with honest colour and the label's back edge is visible through the glass. Glass behaves like glass: refraction bending the background, two clean vertical highlights from strip lights, a darker edge line, faint mould seams. Lighting: two strip softboxes behind left and right for the edge lines, a soft front fill for the label, a small contact shadow with a faint coloured caustic beneath. Medium-format camera, 100 mm lens at f/8, camera at label height. Restrained grade, accurate colour, fine grain. No people. Add no text, letters or logos beyond what the supplied design already carries.

## Notes

- codex-image: attach the photo or artwork and say "use the attached label design exactly".
- The contents must be what the client sells; never a drink the house does not show (no alcohol).
- h3-from-still: a four-second slow turn of the bottle by 30 degrees, locked camera; 8 steps.
