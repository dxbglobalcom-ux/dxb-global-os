---
name: texturepass
aliases: [dokugecisi, yakindoku]
title_tr: Doku yakın geçişi
title_en: Texture close-up pass
when_tr: Malzeme ve işçilik kalitesini göstermek; tekstil, deri, cilt bakımı, saat, mobilya
when_en: Show material and finish quality; textiles, leather, skincare, watches, furniture
shelf: product-video
role: base
medium: video
inputs: [product-photo]
slots: {light: "a low raking light from camera-left|a soft overhead light with a narrow rim from behind", aspect: "9:16 at 640x1152|4:5|1:1|16:9"}
composes_with: []
conflicts: []
cast: none
forms: {h3-from-still: ok, h3: unavailable, seedance: unavailable, kling: unavailable}
status: candidate
samples: []
provenance: video-000020, video-000208, video-000287
version: 1
---

## Prompt

Start from the attached approved still as the first frame: an extreme close-up of the product's own surface. The product stays exactly as in the still for the whole clip: its materials, colours, stitching, grain and its own label as photographed; nothing is redrawn. A six-second single continuous shot, framed for {aspect}. The camera slides slowly sideways across the surface on a motorised macro rail, a few centimetres in all, with a very slow focus pull so a thin plane of sharpness travels over the material: weave and fibres, grain and pores, brushed lines, the soft edge of a cream, a single fine stitch. Light: {light}, so every relief casts its own tiny shadow and specular highlights glint on raised edges as the camera passes. Real imperfection is kept: a loose fibre, a faint tool mark, uneven grain. Camera: full-frame cinema camera, 100 mm macro lens at f/4, shallow depth of field, steady, constant speed, no shake. Constant exposure, restrained grade, true colour, fine grain. No oversharpening, no perfectly uniform texture, no glow, no flicker, no cuts. No people. Add no text, letters or logos anywhere.

## Notes

- h3-from-still: first frame is a macro still from codex-image (the image recipe `macrotexture` fits); 8 steps.
- Picture only.
