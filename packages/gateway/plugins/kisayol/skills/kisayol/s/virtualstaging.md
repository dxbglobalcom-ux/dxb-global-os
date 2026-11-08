---
name: virtualstaging
aliases: [sanaldoseme, bosodadoseme]
title_tr: Boş odaya sanal döşeme
title_en: Virtual staging
when_tr: Yalnız brif döşeme isterse; boş odaya ölçüsüne uygun mobilya yerleştirilir, mimari hiç değişmez
when_en: Only when the brief asks for staging; furniture placed into an empty room at true scale, architecture untouched
shelf: real-estate
role: base
medium: image
inputs: [product-photo]
slots: {room: "living room|bedroom|dining room|home office", style: "warm contemporary|light minimal|warm traditional", aspect: "3:2|4:5|16:9", market: "*"}
composes_with: [gradeclean]
conflicts: []
cast: none
forms: {codex-image: ok, media-still: unavailable, h3-from-still: untested}
status: candidate
samples: []
provenance: house-authored
version: 1
---

## Prompt

Use the attached photograph of the empty room as the only source for the architecture: keep its exact walls, windows, doors, floor, ceiling, sockets, radiators and light fittings, the view through the windows, the camera position and the light direction as photographed; do not move, hide, enlarge or repaint any of it. Furnish it as a {room} in a {style} style, as homes in {market} are furnished, framed for {aspect}. Every piece is sized to the room's real dimensions, judged from the door height and the floorboards: a sofa or bed that fits the wall it stands against, walkways left clear, nothing blocking a door or a window. Each piece sits on the floor with a true contact shadow and is lit by the same window light as the room, its shadows falling the same way as the room's own. Real materials: linen, oak, wool, ceramic, a little natural wear. Restraint: a few pieces chosen well, one plant, one rug, no clutter. No people. Neutral, restrained grade matching the original photograph, fine grain; no floating furniture, no mismatched perspective, no fake HDR. Add no text, letters or logos anywhere, on art, books or textiles included.

## Notes

- Run only when the job asks for staging; most markets require virtually staged photos to be disclosed in the listing, and the unstaged original is kept beside it.
- codex-image: attach the empty-room photo and say "keep the room exactly; only add furniture".
