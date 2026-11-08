---
name: inhand
aliases: [eldeurun, avucta]
title_tr: Elde ürün
title_en: Product in hand
when_tr: Ürünün boyunu ve tutuşunu gösterir; küçük ürün, sosyal akış ve pazaryeri ikinci görseli
when_en: Shows the product's real size and grip; small products, social feed, marketplace second image
shelf: lifestyle
role: base
medium: image
inputs: [product-photo]
slots: {hand: "an adult man's hand|an elderly woman's hand", backdrop: "a softly blurred sunlit room|a plain warm-grey wall|a blurred street in shade", aspect: "4:5|1:1|9:16"}
composes_with: []
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-01520, ads-04316, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. The product is held in {hand} from our own cast, shown from the wrist up, the way one really holds it to look at it or to use it: fingers wrapped naturally, thumb resting on its side, the label turned toward the lens and fully visible, not covered by a finger. Real scale: the product exactly as large as it is next to the hand. Real skin with visible pores, knuckle creases, a few fine hairs, short clean nails, slight colour variation at the fingertips; no ring, no watch with a readable face. Behind: {backdrop}, far enough to fall softly out of focus. Light from a window or open sky high on camera-left, a soft shadow from the fingers on the product, one true specular highlight on its glossiest surface. Full-frame camera, 85 mm lens at f/4, at the height of the hand, product razor-sharp, framed for {aspect} with the hand entering from the lower edge. Restrained natural grade, fine film grain; no extra or warped fingers, no waxy skin, no floating product. No face in frame. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the product photo and say "use the attached product exactly; the hand holds it, nothing else changes on it".
- Check fingers and label first; a warped hand or a covered label is a reject.
- h3-from-still: the hand turns the product a quarter turn toward the light, four seconds, no cuts; 8 steps.
