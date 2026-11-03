# Site E — Mavi Kuşak Çini, one Opus alone at max effort (2026-11-03)

**His order (this session, 17:45):** build the website in `BRIEF.md` alone, start to finish, in one plain
session at max effort; look at nothing else (not sites A–D); use only the images inside the 28 Ekim folder.
Two words of his while it ran: images could also be generated and everything else is to my taste; the
address, the map ("Google things") and the phone are to be completed as if the client had given them.

- **Where:** `~/Desktop/Örnek landing pageler/28 Ekim - Mavi Kuşak Çini/E - Opus tek başına, max, 46 dakika (3 Kasım)/`
  — open `index.html`.
- **Phone link:** https://claude.ai/artifact/Gcsz4q3eNzqRX4bPtW3vqj (private to his account).
- **Time:** 17:45:50 first command → 18:31 published → 18:32 checked live in his Chrome (46 minutes).
- **Effort:** max on his live word; the standing "code at high" rule was named to him in one line and his word applied.

## What was read and used

- Read: `BRIEF.md` only. The folder's 240 images were deduplicated to 113 and looked at as contact sheets.
  No HTML, CSS or JS of A–D was opened; D's `NOTE.md` was grepped for URLs only, to learn how the phone link
  was delivered (as an Artifact).
- Images: 47 library images chosen and converted to responsive WebP (95 files, 7.6 MB; the pages use 77 files,
  6.4 MB). None generated: the library covered every need in one consistent light. The same tile in three
  stages (blank body, pounced outline, painted) and its back with the seal and "R.T." made the two signature moves possible.
- Map: OpenStreetMap tiles of İznik (zoom 16, 42 tiles, fetched once) restyled into the site's palette, the lake
  kept blue; the pin is a CSS overlay. CARTO's tiles now need a key, so they were not used. Attribution is on the page.
- A web search found no business called "Mavi Kuşak"; the nearest real firm is "İznik Mavi Çini", a different name.

## The site

Three pages, Turkish only, one deliberate light look (lime-washed plaster, cobalt ink, square tile corners,
the kuşak border band closing each chapter, wordmark set like the seal on the tile's back). Type: Spectral and
Commissioner. No library; one CSS and one JS file.

- **Ana sayfa:** the tile you can hold. It arrives tilted as if set into the palm, breathes at rest, follows the
  pointer, turns under a finger drag and shows its back, which carries the workshop seal and the painter's initials R.T.
  The page continues with the workshop and the master, four facts as four tiles (%80 kuvars · elde · 3–8 hafta · 1 + 6),
  the five steps, the four colours with a wash, the seven patterns, four featured pieces and the custom-order call.
- **Koleksiyon:** twelve pieces in four groups (3 panels, 3 plates and bowls, 4 tile sets, 2 architectural), names,
  sizes and descriptions proposed from the brief, no prices; a sticky filter (hash per group); a close look with
  tap-to-zoom; every piece has "Bu parçayı sor", which carries the piece into the form.
- **Atölye ve İletişim:** the making of a tile told on the scroll. The same tile goes from raw body to white slip,
  pounced charcoal dots, paint spreading from the centre, milky raw glaze and the kiln's glow to the fired gloss,
  with the step text and a process photo beside it. Then the master, the visiting hours, address, phone and e-mail
  with copy buttons, the map with directions links (Google, Apple), and the custom-order form.
- **Form:** required name, phone or e-mail (at least one), what they want; optional size, quantity, date and up to
  three images (reduced previews kept); KVKK consent gate (the button stays muted and explains itself until
  ticked); inline errors plus a summary; the draft is kept across reloads; on send a request number and the full
  summary, kept after reload, with copy, edit and new request. No e-mail is sent: `talebiKaydet()` in
  `assets/site.js` is the one place the real sending connects; today the request is kept in the browser.
- **Google:** schema.org `Store` data (address, coordinates, hours, phone) on the home and workshop pages.

## Invented as if given by the client (replace with the real values)

Address Kılıçaslan Caddesi No: 112, 16860 İznik / Bursa (pin 40.4292, 29.7257) · phone +90 224 757 19 98 ·
e-mail atolye@mavikusak.com.tr · hours Tue–Sat 10.00–17.00, Sun 11.00–16.00, Mon closed. They appear in the
three footers, the three phone menus, the workshop page and the schema data. The KVKK text is drafted from
law 6698 and must be read by a lawyer before launch.

## Verified (Playwright on a local server, 1440 × 900 and 390 × 844)

- No horizontal scroll at 390 px (scrollWidth 390); console 0 errors, 0 warnings; `node --check` clean; both
  schema blocks parse as JSON.
- The tile flips (caption and button change), drags in 3D with its edge showing, settles on a face.
- The making-of sequence was captured at nine scroll points: every stage renders, nothing bleeds before its stage,
  and the tile fits its column at both widths.
- Collection filter, hash, close look and zoom, the phone menu (full screen, closes on a link and on Esc).
- The form flow at 390 px: "Bu parçayı sor" (Lale Bahçesi) → the piece card and a pre-filled request; an empty
  send → 3 errors, focus on the name; the draft survives a reload; send → "Talebiniz alındı", MK-261103-5246;
  a reload keeps it; edit restores the text.
- Live artifact in his Chrome: the home page renders with fonts and images; navigating to Koleksiyon works.

Fixed along the way, each re-measured: the hero headline orphan, the facts' numerals (a selector-specificity
bug), the wordmark wrapping on phones, the footer column, the two-piece group's empty column, a paint blob
before the paint stage, the making-of tile overflowing its column, the phone menu trapped by the header's
backdrop filter.

## Not verified

- ⚠ UNVERIFIED — requires human-eye confirmation: the live artifact on his phone (Safari or Chrome), the
  feel of the drag on a real touchscreen.
- By design, not by omission: device tilt is not used (the artifact frame refuses motion sensors), and
  `tel:`/`mailto:` may do nothing inside the artifact, so the numbers are selectable text with copy buttons.
