---
name: compareframe
aliases: [kiyasla, muadilkarsi]
title_tr: Karşılaştırma görseli
title_en: Comparison visual
when_tr: Farkı gösteren reklam: ürünümüz yanında sıradan, markasız bir muadil; eşit çerçeve, eşit ışık (önce/sonra için beforeafter)
when_en: An ad that shows the difference: our product beside a plain unbranded generic; matched framing and light (before/after: beforeafter)
shelf: platform-ads
role: base
medium: image
inputs: [product-photo]
slots: {aspect: "1:1|4:5|16:9"}
composes_with: []
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: unavailable}
status: candidate
samples: []
provenance: ads-01576, ads-01573
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Create one comparison photograph framed for {aspect}, split into two equal halves by a clean vertical line: the product on the right, a plain unbranded generic of its kind on the left. The two halves are matched exactly: the same camera position, lens, height, scale and surface, so the only difference is the one being shown. Our side (right) is the real result: the product sharp and as photographed, the scene orderly and fresh. The other side (left) is honest and ordinary, not mocked: a plain object of the same kind with no marks, no brand cues and no resemblance to any real rival, clean and intact, simply less refined in material and finish. Lighting is the same soft window light from camera left on both halves; the right half may be a touch brighter only because of what the scene shows, never by a different light. Real materials with small imperfections on both sides. Full-frame camera, 50 mm lens at f/5.6, camera at product height, straight-on, level. Any hand in frame is an adult man's hand from our own cast, real skin texture. A plain band across the top of both halves stays clear for the client's copy, labels and mark laid in post. Restrained grade, true colour, fine grain; no fake HDR, no ticks, crosses or icons. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly, right half only".
- Claims shown in a comparison must be true for the client's product; the job records them.
