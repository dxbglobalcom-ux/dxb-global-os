---
name: dxb-surface
description: Use whenever a surface the CEO can see changes — pages, panels, cards, alerts, briefings, chat and voice UI. Carries RULE #0 (design verification), the living-holding design law, and the rulings the CEO has already given about how his screens must look.
---

# RULE #0 — mandatory design verification

**CEO directive 2026-07-13, severest tier. No visual work is done until the pass has run and is
evidenced. The CEO is not the QA layer — a catchable visual defect that reaches his eye is a
governance violation.**

## The pass, per surface, in the same turn that surface changes — never batched

1. Render the touched route in a real browser
2. **Both locales**, EN and TR
3. **At least two widths**, and one of them must be the CEO's real windowed class (~1280–1366),
   not only a full-screen baseline — a full-screen photo hides the truncation he actually sees
4. Walk `references/design-bank/CHECKLIST.md`: overlap, alignment, cut-off, scroll sanity,
   language purity, honest zero states, token discipline
5. Compare against the baselines in `references/design-bank/`
6. Run `scripts/i18n-purity-check.sh`
7. Measure horizontal overflow: `scrollWidth === clientWidth` at every tested width
8. **Open every disclosure on a fixed-height surface** and re-measure — a panel that only
   overlaps when opened passed every earlier check

**Automatic failures:** a visible "…" truncation · a field that carries no information ·
horizontal overflow · a locale leak in either direction.

Kill overflow at the data source; render a field only when its value is informative.
Full text: `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-DESIGN-VERIFICATION.md`.

**The browser leg currently needs one thing from the CEO** — automated login is forbidden because
no second factor is enrolled and a form login would enrol one on his account. Until he mints a
session file by hand, the eye leg of an authenticated surface is `⚠ UNVERIFIED` and says so.
Board row **B03-bis**.

## The design law — his sentence, made binding

> **"HER PANELIN CANLI OLDUĞU YAŞAYAN BİR HOLDİNG."**

1. **Every panel reads from a query or shows an honest empty state.** No panel displays a number
   it cannot prove. A rival's goal panel sat frozen at one figure for a whole video while its
   owner spoke nine different numbers; that is the failure we refuse.
2. **Zero is a real answer.** A quiet board says nothing is running and means it. It never
   animates to look busy.
3. **The refusals are visible.** Every pipeline card names the rule it will not break. This
   system has the strongest refusals of anything we have studied and shows him none of them.
4. **Outward actions look different from reads** — the distinction the whole governance rests on
   must be visible at a glance.
5. **No "…" truncation** (CEO ruling 2026-07-18) — shorten at the source.
6. **Both locales, ≥2 widths, no horizontal overflow** — RULE #0, per surface, same turn.

## His standing rulings about his own screens

- **The only pre-approved visual element is the left navigation bar and its icons.** Everything
  else is open to redesign, and he has said the current surfaces are far below the systems he
  admires.
- **Progressive disclosure.** He likes dropdowns, hovers and sub-tabs: *"her şey babak gibi ortada
  olmak zorunda değil"*. Long text collapses by default and is beautiful when opened.
- **Business and construction are two different companies.** No build-process file, label, card,
  metric or navigation item appears in the operating interface of the holding. Engineering
  telemetry belongs in a clearly separated machine/admin environment.
- **The business hierarchy is** Command · Finance · Operations · Organization · Intelligence ·
  Governance · System.
- **Every click leads somewhere.** A card that opens nothing is a defect, not a placeholder.
- **Every timestamp carries its date.**
- **Charts are required where they explain real business information** — and forbidden where they
  do not. Each chart reads a named view and shows an honest empty state.
- **Luxury is a quality standard, not a decorative theme.** "Burj Al Arab" was one throwaway
  example he gave at the start and it must not be treated as the goal. The visual language is the
  Iron Man / JARVIS cockpit; champagne over obsidian; no coffee tones.
- **He approves the design before it is built.** *"Önce bana örnek design sunulacak, gerçeğe
  geçmeden önce. Beğenmediğimi asla onaylamam."* A visual package — every major page, every state
  — comes before implementation. This is not bureaucracy: a working visual is the most precise
  specification a builder can be given.

## Opus 5.5's default looks — a prompting aid, not his ruling

Anthropic's Opus 5.5 migration guide ("Frontend design defaults"): left without direction, the
model falls back on a few default looks. None of them is this holding's unless his approved design
shows it — a cream or off-white page, italic accent words in headlines, numbered "01 / 02 / 03"
section labels, pill-shaped buttons (the design system keeps full rounding for avatars and status
dots, `DESIGN_SYSTEM.md:76`). When a draft falls back on another default, add it to this list,
never to his rulings above.

## Cleaning up after a design pass

Any demo mutation made to photograph a state is reverted through the same control function that
made it, and the residue is measured to zero. Background collectors and probe processes are swept.
