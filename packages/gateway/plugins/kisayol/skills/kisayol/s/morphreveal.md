---
name: morphreveal
aliases: [donusum, bicimdegisimi, urundonusumu, morf]
title_tr: Hammaddeden ürüne dönüşüm
title_en: Raw-material morph reveal
when_tr: Ürünün neyden yapıldığını göstermek ya da aynı serinin iki ürünü arasında geçiş; doğal içerik, el işçiliği, malzeme vurgusu
when_en: Show what the product is made of, or pass from one product of a range to its sibling; natural ingredients, craft, material story
shelf: product-video
role: base
medium: video
inputs: [product-photo]
slots: {material: "a flowing ribbon of its own liquid|a swirl of fine powder|a cloud of soft fibres|a column of fine sand", finish: "the identical product of the first frame, so the clip loops|the second attached product, a sibling from the same range, exactly as in its own photo", backdrop: "warm sand seamless paper|deep graphite seamless paper|pale sage seamless paper", aspect: "9:16 at 640x1152|4:5|1:1"}
composes_with: []
conflicts: []
cast: none
forms: {h3-from-still: ok, h3: unavailable, seedance: unavailable, kling: unavailable}
status: candidate
samples: []
provenance: video-020535, house-authored
version: 1
---

## Prompt

Start from the attached approved still as the first frame: the product standing on a matte surface in front of a {backdrop}. A six-second single continuous shot, framed for {aspect}. In the first two seconds the product gently loosens from its top downward into {material}, which lifts and circles slowly around the spot where it stood, catching the light; for one second only the material is in frame, hanging in a soft spiral; in the last three seconds it gathers back, settles and re-forms from its base upward as {finish}: the same shape, proportions, colours, materials and its own label as photographed, perfectly still for the final second. Surfaces return in their true materials: gloss stays gloss, matte stays matte, metal reflects the same room throughout, and the contact shadow reshapes with the outline; in the middle frames no label or marking is invented. Material behaviour is physically believable: gravity-true arcs, real particle size, translucent where thin, no glitter. Light: one large softbox high camera-left as the key, a rim from behind-right that makes the material glow at its edges. Camera: full-frame cinema camera, 85 mm lens at f/8, at product height, locked off. Restrained grade, fine grain. No glowing edges, no neon, no CGI gloss, no flicker, no cuts. No people. Add no text, letters or logos anywhere.

## Notes

- h3-from-still: first frame is a clean studio still from codex-image; 8 steps. Reject any take whose label or shape drifts at either end.
- The sibling finish needs the second product photo as the reference; check both ends for label fidelity, and no middle frame may carry a readable mark.
- Choose a material true to the product; never imply an ingredient it does not contain. Picture only.
