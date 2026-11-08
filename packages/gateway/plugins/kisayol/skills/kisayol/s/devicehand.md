---
name: devicehand
aliases: [elindecihaz, kullanim]
title_tr: Elde cihaz
title_en: Device in hand
when_tr: Telefon, kumanda, kulaklık, el aleti; cihazın gerçek boyutunu ve tutuşunu bir el gösterir
when_en: Phone, remote, earbuds or a handheld tool; a hand shows the device's real size and grip
shelf: electronics
role: base
medium: image
inputs: [product-photo]
slots: {setting: "a bright cafe table|a sunlit street corner|a quiet living room by a window", aspect: "4:5|9:16|1:1", market: "*"}
composes_with: [gradeclean, gradecool, gradefilm]
conflicts: []
cast: house
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached product photo as the only source for the device: keep its exact shape, proportions, colours, materials, buttons and its own markings as photographed; do not redraw or restyle it. An adult man's hand from our own cast holds it naturally in {setting} in {market}, framed for {aspect}: a real grip, thumb resting where a thumb would rest, the device at true scale against the fingers. If it has a screen, the screen is blank and dark or shows a soft, featureless gradient, with no interface, no text and no icons. Real skin: pores, knuckle creases, a few hairs on the back of the hand, a short clean nail, the cuff of a plain shirt sleeve. Light: soft daylight from the left, a long highlight along the device's edge, the hand's shadow falling naturally on the device. Full-frame camera, 50 mm lens at f/2.2, chest height, the device and the thumb sharp, the setting softly out of focus, any other adults far back and unreadable. No face in frame. Restrained grade, accurate colour, fine grain; no warped or extra fingers, no airbrushed skin. Add no text, letters or logos anywhere.

## Notes

- codex-image: attach the device photo and say "use the attached device exactly".
- h3-from-still: four seconds, the hand turns the device slowly toward the light; 8 steps.
