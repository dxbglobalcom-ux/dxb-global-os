---
name: airportad
aliases: [havalimani, terminalpanosu]
title_tr: Havalimanı terminal panosu
title_en: Airport concourse lightbox
when_tr: Seyahat eden, üst gelir kitleye kampanya; ürün terminaldeki dev ışıklı panoda
when_en: Campaign for travellers and premium audiences; the product on a large lightbox in a departures concourse
shelf: outdoor-ooh
role: base
medium: image
inputs: [product-photo]
slots: {time: "morning|late afternoon|evening", aspect: "16:9|4:5|9:16", market: "*"}
composes_with: [gradeclean, gradecool, gradefilm]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show it on a tall wall-mounted lightbox, wider than a person is tall, in the departures concourse of a modern airport in {market} in the {time}. The lightbox face is the product alone on a clean ground drawn from its own colours, lit like a premium packshot with a soft key from the upper left and a crisp contact shadow; it glows evenly from within. The concourse: floor-to-ceiling glass on one side with the apron beyond, aircraft tails soft and out of focus with plain livery, a long polished stone floor mirroring the lightbox, a slender steel roof structure. Photographed from the walkway at eye level, full-frame camera, 28 mm lens at f/4, perspective kept straight, framed for {aspect}. Travellers walking past are adult men and elderly women from our own cast, with wheeled cases, in natural motion blur, faces not readable, never covering the product. Motivated light: daylight through the glass from camera left (in the evening, the apron floodlights and warm ceiling downlights), the lightbox the brightest surface without blooming. Real imperfection: faint scuffs on the floor, fingerprints on a glass balustrade. Restrained grade, true colour, fine grain; no fake HDR, no glow halos. Add no text, letters or logos anywhere; departure boards and wayfinding panels are blank and unlit; keep the lightbox's left third a plain area for the client's copy and mark laid in post.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: a five-second locked shot, travellers crossing in motion blur, the lightbox steady; 8 steps.
