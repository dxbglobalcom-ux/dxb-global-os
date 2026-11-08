---
name: tableoverhead
aliases: [sofra, ustensofra]
title_tr: Kuşbakışı sofra
title_en: Overhead table
when_tr: Restoran, tarif ya da paylaşılan yemek; dolu bir sofra yukarıdan, ürün ortada
when_en: Restaurant, recipe or shared meal; a full table from above with the product at its heart
shelf: food-drink
role: base
medium: image
inputs: [product-photo]
slots: {table: "long rustic walnut table|round white marble table|old painted blue wooden table", aspect: "4:5|1:1|16:9", market: "*"}
composes_with: [gradeclean, gradefilm, topdown]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-01526, ads-00774
version: 1
---

## Prompt

Use the attached photo as the only source for the product or dish: keep its exact shape, portion, colours, materials and its own label as photographed; do not redraw or restyle it. Photograph a {table} straight from above, framed for {aspect}, set for a shared meal in a home in {market} that has just begun: the product as the clear centre, around it the everyday dishes of {market} in plain ceramic bowls and plates, water in clear glasses and a jug of a non-alcoholic drink. Two or three hands reach in from the frame edges, serving and passing a plate: the hands of adult men and elderly women from our own cast, relaxed, real skin with knuckle creases and veins, sleeves of everyday clothing; no faces in frame. Light: soft daylight from one side of the table, gentle shadows falling the same way under every plate. Camera on a rig directly overhead, 35 mm lens at f/8, everything sharp. Lived-in details: crumbs, a used napkin, a spoon resting in a bowl. No alcohol and no pork anywhere. Warm natural grade, fine grain; no plastic food, no symmetry. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: four seconds overhead, locked, only the hands move slowly; 8 steps.
