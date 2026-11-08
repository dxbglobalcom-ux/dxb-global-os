---
name: storewindow
aliases: [vitrinduzeni, magazacami]
title_tr: Mağaza vitrini düzeni
title_en: Storefront window display
when_tr: Mağaza lansmanı ya da perakende kampanyası; ürün sokaktan görülen gerçek vitrin düzeninin kahramanı
when_en: Store launch or retail campaign; the product as the hero of a real window display seen from the street
shelf: outdoor-ooh
role: base
medium: image
inputs: [product-photo]
slots: {time: "blue hour|overcast midday", background: "warm plaster|deep forest green|sand linen", aspect: "4:5|1:1|9:16", market: "*"}
composes_with: [bluehour, gradeclean, gradecool, gradefilm]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-01717
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Show it as the hero of an art-directed shop window, seen from the pavement of a shopping street in {market} at {time}. Inside the window: three staggered plinths in honed stone and pale oak, the product standing on the tallest at eye level, two more of the same product on the lower plinths turned to other angles; behind them a backdrop wall of {background}, and one sculptural prop (a branch in a stoneware vessel) to the side. Window lighting: two small spotlights from the upper corners give the product a crisp key and a soft shadow on the plinth; a warm wash on the backdrop. Photographed from outside, full-frame camera, 50 mm lens at f/4, camera height 1.5 m, slightly off-axis so the glass reads, framed for {aspect}. Real glass: faint reflections of the street and the opposite facades across the lower third, a little dust on the sill, a slim bronze window frame with patina, the shop's stone surround with weathering. Motivated light balance: at blue hour the window glows against the blue street; on an overcast day the reflections are stronger and the interior a touch darker. Restrained grade, true colour, fine grain; no glow halos, no plastic surfaces. No people, reflected or otherwise. Add no text, letters or logos anywhere, on the glass, the backdrop or the plinths; keep the backdrop's upper band plain for the client's mark laid in post.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly".
- h3-from-still: a five-second slow walk-by drift along the glass, reflections sliding, no cuts; 8 steps.
