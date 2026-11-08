---
name: busstop
aliases: [durakposteri, otobusduragi]
title_tr: Otobüs durağı ışıklı afişi
title_en: Bus-stop backlit poster
when_tr: Şehir içi kampanya; ürün durağın ışıklı afiş kutusunda, gerçek sokakta yerinde görünür
when_en: City campaign; the product shown in situ in a bus shelter's backlit poster case
shelf: outdoor-ooh
role: base
medium: image
inputs: [product-photo]
slots: {time: "blue hour|early morning|overcast midday", background: "warm sand|deep bottle green|soft off-white", aspect: "4:5|9:16|1:1"}
composes_with: []
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ig-196601, ig-196991
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show it as the image of a portrait backlit poster inside the glazed end panel of a city bus shelter at {time}: the poster is the product alone, photographed on a seamless {background} ground with a soft top light and a gentle contact shadow, the product filling the middle half of the poster. The poster glows evenly from its own fluorescent backlight, slightly brighter at the centre. Photographed from the kerb at a three-quarter angle, full-frame camera, 35 mm lens at f/4, camera height 1.6 m, framed for {aspect} with the shelter, a stretch of pavement and the street behind. Real materials: powder-coated grey steel frame with chipped edges, toughened glass carrying water spots, a faint scratch and one dull sticker residue, worn granite kerb, damp asphalt with soft reflections of the poster's glow. If anyone waits in the shelter they are adult men from our own cast, out of focus, faces not readable, never blocking the product. Motivated light: the poster's backlight and a distant streetlamp from camera right. Restrained grade, true colour, fine film grain; no glow halos, no fake HDR. Add no text, letters or logos anywhere, on the poster or in the street; keep the poster's top fifth a plain band of the ground colour for the client's mark laid in post.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: a five-second slow lateral drift along the kerb, constant exposure, no cuts; 8 steps.
- Garbled label on the product: the real label is laid in post (rule f).
