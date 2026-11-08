---
name: cafetable
aliases: [kafemasasi, kahvemolasi]
title_tr: Kafe masasında
title_en: On a cafe table
when_tr: Taşınan, gün içinde kullanılan ürün; kahve ya da çay molasında şehir hayatı
when_en: Carried, all-day products; city life at a coffee or tea break
shelf: lifestyle
role: base
medium: image
inputs: [product-photo]
slots: {table: "a small round marble bistro table|a scratched zinc-top table on a pavement|a long oak communal table indoors", time: "morning|late afternoon", aspect: "4:5|1:1|9:16", market: "*"}
composes_with: [gradeclean, gradecool, gradefilm, thirds, windowlight]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ig-031519, ads-04324, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. The product sits on {table} at a neighbourhood cafe in {market} in the {time}, the room, cups and saucers those of a cafe there, beside a half-finished cup of coffee or tea on a saucer, a spoon resting on the saucer edge, a crumb or two, a paper napkin folded once. The product is placed as if its owner just put it down and will pick it up again. Customers in the background are adult men and elderly women from our own cast, softly out of focus, mid-conversation, faces not readable. Light: daylight through the cafe window on camera-left, a bright edge on the cup and the product, a warm reflection on the table, soft shadow falling right. Full-frame camera, 50 mm lens at f/2, seated eye height looking slightly down, framed for {aspect}; the product and the near cup sharp, the room dissolving in natural bokeh. Real materials: marble with a faint coffee stain, zinc with scratches, glaze crazing on the cup, a thin film of foam on the coffee. No readable menu, sign or window lettering anywhere in the background; such surfaces are blurred or blank. Restrained warm grade, fine grain; no glowing bokeh balls, no plastic surfaces. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: steam lifts from the cup, background figures move slightly, camera still, four seconds; 8 steps.
