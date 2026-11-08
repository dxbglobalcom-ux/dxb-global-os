---
name: desksetup
aliases: [masaustu, calismamasasi, masaduzeni, teknomasa]
title_tr: Çalışma masasında
title_en: On a work desk
when_tr: Ofis, teknoloji (klavye, fare, kulaklık, dizüstü), kırtasiye ya da günlük kullanım ürünü; işin içindeki an, LinkedIn ve Meta akışı
when_en: Office, tech (keyboard, mouse, headphones, laptop), stationery or everyday-carry products; a moment inside real work, LinkedIn and Meta feed
shelf: lifestyle
role: base
medium: image
inputs: [product-photo]
slots: {surface: "oiled oak|solid walnut with a felt mat|matte black steel|white laminate with a worn edge|honed grey concrete", time: "morning light|late-afternoon light|evening lamp light", angle: "three-quarter from above|top-down flat lay|eye level across the desk", aspect: "4:5|1:1|16:9", market: "*"}
composes_with: [bgconcrete, bgwood, candlewarm, gradeclean, gradecool, gradefilm, thirds, windowlight]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-04316, ads-00805, ig-001657, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials, buttons, ports and its own label or markings as photographed; do not redraw or restyle it. The product sits on a desk of {surface} at home or in an office in {market}, in the middle of a real working day, in {time}: an open notebook with blank pages, a pencil worn down a little, a ceramic mug with a dried coffee ring at its base, a closed laptop edge at the frame's border, a cable that does not lie perfectly straight; the room's things are those of a workplace there. The product is the clear subject, placed where a hand would naturally reach for it, with breathing room around it. Every screen in frame is off and blank or turned away, showing no interface and no icons. If a hand appears it is an adult man's hand from our own cast, mid-gesture, real skin texture. Light: by day, a window on camera-left, long soft shadows across the desk and a faint reflection of the window on any glossy surface; in the evening, a desk lamp on the left as the only warm source, the room falling into soft shadow. Camera: full-frame, 35 mm lens at f/4, {angle}, framed for {aspect}; the product sharp, the far corners of the desk gently soft. Real materials: wood grain or metal with micro-scratches, felt fibres, paper fibre, a fingerprint on gloss, dust only where it would be. Restrained grade, fine grain; no fake HDR, no plastic surfaces, no gamer glow beyond the device's own lights, no symmetry staged for a catalogue. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- top-down flat lay: keep all objects parallel or at one consistent angle; the shadows still fall from camera-left.
- h3-from-still: a slow two-second rack from the mug to the product, then hold; 8 steps.
