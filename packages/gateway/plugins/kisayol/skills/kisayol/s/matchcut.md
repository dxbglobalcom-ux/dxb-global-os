---
name: matchcut
aliases: [eslesenkesme, sekilkesme]
title_tr: Eşleşen kesme
title_en: Match cut
when_tr: İki çekim arasında biçim ya da hareket eşleşerek geçiş; ürün bir sahneden ötekine akar
when_en: A shape- or motion-matched change between two shots; the product flows from one scene to the next
shelf: transitions
role: effect
medium: video
inputs: [none]
slots: {}
composes_with: [preroll15]
conflicts: []
cast: none
forms: {h3: ok, h3-from-still: ok, codex-image: unavailable, seedance: unavailable}
status: candidate
samples: []
provenance: video-002677, video-002925, house-authored
version: 1
---

## Prompt

Transition: where the clip changes from one shot to the next, make it a match cut. The last frame of the outgoing shot and the first frame of the incoming one share the product's exact position, size and angle in frame, or the same motion continuing in the same direction at the same speed; only the setting around it changes in a single clean cut. The light direction stays consistent across the cut so the eye accepts it as one movement. The product keeps its exact shape, colours and label on both sides. No dissolve, no flash frame, no morph, no warping at the cut.

## Notes

- Works only on a base with more than one shot; in preroll15 it joins shot 3 to shot 4.
- h3 / h3-from-still: written into the same 8-step take as the base; check the cut frame by frame.
