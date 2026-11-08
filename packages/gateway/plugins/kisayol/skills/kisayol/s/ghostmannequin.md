---
name: ghostmannequin
aliases: [hayaletmanken, gorunmezmanken]
title_tr: Görünmez manken
title_en: Ghost mannequin
when_tr: E-ticaret ve katalog; giysi görünmez bir bedendeymiş gibi, hacmiyle ve kalıbıyla gösterilir
when_en: E-commerce and catalogue; the garment shown with its volume and fit, as if on an invisible body
shelf: fashion
role: base
medium: image
inputs: [product-photo]
slots: {background: "pure white seamless|seamless warm grey paper", view: "front|back|three-quarter front", aspect: "4:5|1:1|2:3"}
composes_with: [bgseamless, centered, gradeclean, gradecool]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: unavailable}
status: candidate
samples: []
provenance: ads-01629, ads-01628, ads-01631
version: 1
---

## Prompt

Use the attached product photo as the only source for the garment: keep its exact cut, proportions, colour, fabric, stitching, buttons, trims and its own labels as photographed; do not redraw, restyle or recolour it. Present it in the ghost-mannequin style, {view} view, centred on a {background}, framed for {aspect}: the garment holds the shape of an invisible, natural adult body, with a gentle shoulder slope, a relaxed fall at the waist and sleeves hanging with a slight forward bend. Where the neck and cuffs open, the inside of the garment shows its own back panel, lining, seam allowances and inner label, so the hollow reads as real. Light: two large softboxes at 45 degrees left and right, a top light for the shoulders, even illumination with soft natural shading in every fold. Medium-format camera, 80 mm lens at f/11, camera at chest height of the invisible body, perfectly straight verticals. Real fabric behaviour: weave texture, a few honest creases at the elbows, the weight of the hem. No people, no visible mannequin, no stand. True-to-sample colour, restrained grade, fine grain; no plastic sheen, no flattened fabric. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the garment photo (ideally shot on a mannequin or flat) and say "use the attached garment exactly".
- Marketplaces that require pure white: choose the white background slot.
