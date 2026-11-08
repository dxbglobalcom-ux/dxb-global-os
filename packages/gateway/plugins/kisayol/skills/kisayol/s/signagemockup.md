---
name: signagemockup
aliases: [tabela, tabelamokap]
title_tr: Tabela mokabı
title_en: Signage mockup
when_tr: Mağaza, ofis ya da şube tabelasını gerçek cephede göstermek; işaret sonradan boş panele yerleştirilir
when_en: Shows a shop, office or branch sign on a real facade; the mark is laid onto the blank panel in post
shelf: mockup-packaging
role: base
medium: image
inputs: [none]
slots: {sign: "a long fascia board above a shopfront|a round projecting blade sign on a wrought-iron bracket|a freestanding steel totem by an entrance", facade: "an old stone street front|a modern glass and dark-steel front|a whitewashed plaster front", time: "overcast daylight|dusk with the sign's own light on", aspect: "16:9|4:5|1:1", market: "*"}
composes_with: [gradeclean, gradecool, gradefilm]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: untested, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Photograph {sign} on {facade} in a city of {market} in {time}, framed for {aspect}, from across the street at a slight angle so the sign reads clearly while its depth shows. The sign's face is a completely plain panel, evenly lit and free of any print, so the client's mark can be laid onto it in post; it keeps the real construction: powder-coated edges, fixing bolts, a faint weather streak below it, the depth of its returns. The street is real and lived-in: worn paving, a drainpipe, a potted plant by the door, reflections in the glass. Any passers-by are adult men from our own cast, small in the frame, in natural motion blur, faces not readable. Lighting: in daylight, soft sky light with gentle shadows under the sign; at dusk, the sign's own glow spilling onto the wall and pavement, the sky deep blue. Full-frame camera, 35 mm tilt-shift lens at f/8, camera at eye level, verticals corrected. Restrained grade, fine grain. Add no text, letters or logos anywhere, on the sign or the street.

## Notes

- media-still or codex-image: text-only; no input needed. The real mark is laid onto the plain panel in post with its perspective; at dusk add its glow there too.
- h3-from-still: a six-second slow push across the street toward the sign; 8 steps.
