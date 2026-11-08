---
name: kitchenhero
aliases: [mutfak, mutfakilan]
title_tr: Mutfak kahraman karesi
title_en: Kitchen hero
when_tr: Mülk ilanında mutfak; tezgâhları, dolapları ve ışığıyla evin satan karesi
when_en: The kitchen in a listing; its counters, cabinets and light as the frame that sells the home
shelf: real-estate
role: base
medium: image
inputs: [product-photo]
slots: {time: "bright morning daylight|soft midday daylight|early evening with the under-cabinet lights on", aspect: "3:2|4:5|16:9"}
composes_with: [gradeclean]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached photograph of the kitchen as the only source for it: keep its exact layout, cabinets, counters, appliances, sink, taps, tiles, floor, lights and windows as photographed; add nothing that is not there, remove nothing that is built in, and do not upgrade any material or appliance. Re-photograph it in {time}, framed for {aspect}, from the position that shows the working triangle and the longest run of counter. Clear the counters of clutter only; at most one existing item may stay, such as a fruit bowl or a cutting board already in the photograph. Light: daylight from the kitchen's own window, real soft reflections running along the counter surface and the cabinet fronts, existing pendant or under-cabinet lights switched on and warm. Architectural camera, 20 mm rectilinear lens at f/8, chest height, perfectly vertical cabinet lines. Real materials: veining in stone, grain in wood, the brushed finish of steel with a faint fingerprint on a handle. No people. Clean, neutral grade, fine grain; no fake HDR, no oversaturation, no plastic surfaces, no warped lines. Add no text, letters or logos anywhere, including on appliances beyond their own markings as photographed.

## Notes

- codex-image: attach the kitchen photo and say "use the attached kitchen exactly; only light, angle correction and decluttering change".
- h3-from-still: six seconds, a slow lateral slide along the counter; 8 steps.
