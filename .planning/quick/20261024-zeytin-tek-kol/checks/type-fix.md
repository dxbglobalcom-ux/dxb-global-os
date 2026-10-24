# Type scale fix (2026-10-24)
- H2 `.h2`: clamp(2.05rem,1.2rem+3.3vw,4.1rem) → clamp(1.85rem,1.2rem+2.2vw,3.2rem); 1440: 66 → 51px, 390: 33 → 30px.
- H1 (side-by-side hero): 4.05vw → 4.45vw inside the same min/max; 1440: 58 → 64px, now the largest heading. Phone H1 unchanged (~41px).
- Story lead `.lead`: clamp(1.3rem,1.05rem+.9vw,1.85rem) → clamp(1.25rem,1rem+.55vw,1.5rem); 1440: 30px/7 lines → 24px/6 lines, 390: 21 → 20px.
- FAQ questions: clamp(1.2rem,1.05rem+.5vw,1.45rem) → clamp(1.125rem,1rem+.3vw,1.25rem); 1440: 23 → 20px, 390: 19 → 18px. Body (17px) and buttons (15px) untouched; diff vs index.pre-type.html is these 4 CSS lines only. 1440×900 and 390×844 screenshots checked: no new wraps, overlap or horizontal overflow.
