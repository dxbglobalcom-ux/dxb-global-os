---
name: cardashboard
aliases: [gosterge, aracici]
title_tr: Gösterge paneli ve kabin
title_en: Interior dashboard
when_tr: Kabin konforu ve teknolojisi; ön konsol, direksiyon ve koltuklar, sürücü koltuğunun ardından
when_en: Cabin comfort and technology; dashboard, steering wheel and seats, seen from behind the driver's seat
shelf: automotive
role: base
medium: image
inputs: [product-photo]
slots: {outside: "a sunlit coastal road|a quiet city street at dusk|a forest road in soft daylight", aspect: "16:9|4:5|1:1"}
composes_with: []
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: video-000353, ads-00738
version: 1
---

## Prompt

Use the attached photo of the cabin as the only source for it: keep the exact dashboard, steering wheel, controls, seats, materials, stitching and colours as photographed; do not redraw, restyle or add equipment. Photograph the cabin from just behind and between the front seats, framed for {aspect}, the car parked with {outside} through the windscreen, softly out of focus. All displays and the instrument cluster are on but show only a soft, abstract glow, with no numbers, letters or icons. Light: daylight through the windscreen and side windows falling across the dashboard's top surface, soft reflections in the glass and trim, the lower cabin falling into gentle shadow with the car's own ambient strip glowing faintly where it exists. Full-frame camera, 20 mm rectilinear lens at f/8, at the height of the headrests, the steering wheel and centre console sharp. Real materials: the grain of leather with slight creasing on the bolsters, open-pore wood or brushed aluminium trim, a little dust in the air vents. No people. Natural, restrained grade, fine grain; no fake HDR, no warped lines, no plastic look. Add no text, letters or logos anywhere beyond the car's own markings as photographed.

## Notes

- Needs a photo of the real cabin; without one, do not invent an interior.
- codex-image: attach the cabin photo and say "use the attached cabin exactly".
- h3-from-still: six seconds, a slow push forward between the seats toward the windscreen; 8 steps.
