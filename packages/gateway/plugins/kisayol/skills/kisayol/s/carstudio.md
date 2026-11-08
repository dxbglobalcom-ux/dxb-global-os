---
name: carstudio
aliases: [arabastudyo, otostudyo]
title_tr: Stüdyoda otomobil
title_en: Studio car
when_tr: Model lansmanı, bayi ya da galeri ilanı; araç karanlık stüdyoda, ışık çizgileriyle şekillenir
when_en: Model launch, dealer or showroom listing; the car in a dark studio, sculpted by lines of light
shelf: automotive
role: base
medium: image
inputs: [product-photo]
slots: {angle: "front three-quarter|rear three-quarter|pure side profile", floor: "dark polished concrete|matte black seamless floor|light grey cyclorama", aspect: "16:9|4:5|1:1"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-04508, ads-02279
version: 1
---

## Prompt

Use the attached photo as the only source for the vehicle: keep its exact body shape, proportions, paint colour and finish, wheels, lights, trim, glass tint and its own badges as photographed; do not redraw, restyle or modify it. Photograph it {angle} on a {floor} in a large studio, framed for {aspect} with room around the car. Light: one enormous overhead soft panel that lays a long, unbroken highlight along the roof and shoulder line, two tall strip lights low at the sides drawing sharp lines down the flanks and through the wheel arches, the rest of the studio falling to near black so the bodywork reads as sculpture. The paint behaves like real automotive paint: deep clear coat, the strip reflections bending with every curve, faint orange peel visible up close. A soft, true reflection and contact shadow under the tyres. Wheels turned slightly toward the camera on a front view. The number plate is blank, with no letters or numbers. Full-frame camera, 70 mm lens at f/11, camera at headlight height, perfectly level. No people. Neutral, restrained grade, deep clean blacks, fine grain; no glow halos, no fake lens flares, no plastic paint. Add no text, letters or logos anywhere beyond the car's own badges as photographed.

## Notes

- codex-image: attach the car photo and say "use the attached vehicle exactly; only the setting and light change".
- h3-from-still: six seconds, a slow orbit of 30 degrees, the light lines sliding along the body; 8 steps.
