---
name: textureswatch
aliases: [doku, krembulas]
title_tr: Doku sürüntüsü
title_en: Texture swatch
when_tr: Krem, jel, serum, fondöten; ürünün dokusunu kavanozun yanında gerçek bir sürüntüyle gösterir
when_en: Cream, gel, serum or foundation; shows the texture as a real swatch beside the pack
shelf: cosmetics
role: base
medium: image
inputs: [product-photo]
slots: {surface: "pale honed travertine|frosted glass|warm sandstone|white marble|honed grey concrete|pale terrazzo", aspect: "4:5|1:1|9:16"}
composes_with: [bgconcrete, bgmarble, bgterrazzo, gradeclean, gradecool, gradefilm, macro100]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: video-003000, house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, materials and its own label as photographed; do not redraw or restyle it. Stand it on {surface}, framed for {aspect}. In the foreground lies one confident swatch of the product's own formula in exactly its true colour: a single spatula sweep that starts thick, with a soft peak and the ridged trail of the tool, and thins to a translucent feathered edge where the surface shows through. The swatch carries real physics: tiny air bubbles, a satin sheen on the thick part, a faint matte drag at the thin end. Light: a large soft source low from the left raking across the swatch so every ridge casts a fine shadow, a white card on the right, a small rim on the pack. Full-frame camera, 100 mm macro lens at f/8, camera low at 20 degrees above the surface, the swatch sharp, the pack just behind in gentle focus. No people. Clean, true-to-formula colour, restrained grade, fine grain; no glossy plastic smear, no perfectly uniform texture, no glowing edges. Add no text, letters or logos anywhere.

## Notes

- Ask the client the formula's real colour and finish; the swatch shows that, never a guessed shade.
- codex-image: attach the product photo and say "use the attached product exactly".
