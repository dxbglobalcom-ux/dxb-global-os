# r5: owner notes at the midpoint (20:34 job clock)

**What I looked at:**
- r4 checkpoint first screens: `shots/checkpoint/` at 1440×900@2 and 390×844@3;
- my own captures of `#siparis` and `#hikaye` at 1440, taken from `r4-page/dist/index.html` at 20:28.

**Overall:** the page is on direction and on the bar. Nothing below is a rethink. These are refinements, ordered by impact. Owners are named in brackets.

## Fix (in this order)
1. **[r2a] Hero crown reads as broccoli, not olive.**
   - The canopy is built from round, dark, opaque clumps.
   - An olive crown is airy and grey-green, with sky showing through.
   - Lighten and grey the clump fills towards `--c-leaf`.
   - Break the circular silhouettes with leaf-edged, irregular outlines.
   - Open more gaps.
   - Keep the silver sprigs and the flip, which are good.
   - The same applies to the phone crop and the generations panels.
   - This is the single biggest jury-visible gain.
2. **[r2a/r4] Lower fifth of the desktop hero is dead space.**
   - Two stone-wall strips (y ≈ 970 and ≈ 1220 at @2) sandwich an empty beige band.
   - Keep **one** wall, and either crop the hero bottom closer to the tree base, or give the foreground some life (fallen leaves on the cloth, tufts) at low contrast.
3. **[r4] Season badge separator.**
   - On desktop: "sürüyor·" has no space before the dot.
   - On phones: the line wraps and the "·" starts the second line.
   - Fix: make the separator a CSS pseudo-element with a space on each side, and hide it when the badge stacks. Better still, show two lines on phones with no dot.
4. **[r4] Too much empty space above section content on desktop.**
   - At 1440×900, `#siparis` opens with about 150 px before the kicker, so the product cards only begin at the bottom of the first view.
   - Cut desktop section block padding by about a third, so the packshots enter the viewport together with the headline.
   - Check `#hasat-gunleri` the same way.
5. **[r4] `#hikaye` intro leaves the right half empty at 1440.**
   - Use the space: either sit the first generations panel (or a ledger page in Rıza's hand: date, wind, hour, crates) beside the intro, or tighten the grid so the intro and the triptych read as one composition.

## Do not change
- Palette (limestone, olive-black, the alaca aubergine accent).
- Fraunces + Figtree, and `no-common-ligatures`.
- The ledger-time kickers ("07.45 · Ovacık, Urla", "09.30 · Karşılama", "14.25 · İlk yağ").
- Hero copy and CTAs.
- **The r2b packshots and label system** (excellent; the hand-tied Lot 2 tag, the tin with the yelkovan clock).
- The hut with the weathervane in the hero.
- ’ apostrophes and "hâlâ".
- The honest-outcome wording.

## Clock
- r2a delivers fixes 1–2 as a refreshed READY by 21:00.
- r4 does 3–5 and rebuilds with the PROOFED copy (by 20:55) and the refreshed art.
- r4 finishes by 21:35 as planned.
