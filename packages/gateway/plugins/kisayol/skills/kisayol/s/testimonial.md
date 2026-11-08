---
name: testimonial
aliases: [tavsiye, musterisesi]
title_tr: Tanıklık portresi
title_en: Testimonial portrait
when_tr: Yalnızca işte gerçek ve kayıtlı bir kullanım varsa; kullananın sakin, belgesel portresi ürünle
when_en: Only when the job records a real use; a calm documentary portrait of the user with the product
shelf: people-ugc-still
role: base
medium: image
inputs: [product-photo, cast-photo, scene-ref]
slots: {place: "their own workshop|a kitchen table at home|the counter of their own small shop|a garden bench", time: "morning|late afternoon", aspect: "4:5|1:1|9:16"}
composes_with: []
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: ads-00325, ads-00342, house-authored
version: 1
---

## Prompt

Use the attached scene reference only for its place, light and camera angle; do not copy the person in it, and copy no text or logo from it. The person is the one in the attached cast photo, an adult man or an elderly woman from our own cast, with exactly that face, hair and build, in their own everyday clothes. The product is the attached product photo, with exactly its shape, colours, materials and its own label; do not change anything on it. A quiet documentary portrait at {place} in the {time}: the person sits or stands at ease, holding the product the way they really use it, looking just past the lens or into it with a calm, sincere expression, as if they have just finished telling what it did for them. Their own things around them, worn from real use. Light: daylight from a window or open door on camera-left, soft falloff across the face, a natural shadow under the chin and nose, catchlights only from the window. Real face: pores, fine lines and wrinkles kept, age shown with dignity, hair with flyaways, hands that have worked. Full-frame camera, 50 mm lens at f/2.8, at the person's eye level, framed for {aspect} from mid-chest up with the product clearly in view; the background softly present, not erased. Restrained natural grade, fine film grain; no beauty retouching, no waxy skin, no studio backdrop, no staged grin. Add no text, quotes, letters or logos anywhere; any quotation is laid in post from the recorded statement.

## Notes

- Testimony only with a real use recorded in the job (SKILL §4); without it, choose another recipe.
- codex-image: attach the scene reference, the cast photo and the product photo; say which is which.
- h3-from-still: breathing, a blink, a small nod, camera locked, four seconds; 8 steps.
