**1. Photoreal images from the studio**

The brief rules this out: "Fotoğraf yok: dışarıdan fotoğraf ya da görsel dosyası kullanılmaz. Sayfada görünen her şey kodla yapılır." Raster images would also fail check-static (A2). The client can change their own brief, but as it stands this would breach it.

If the brief were changed, I would not put photos in the hero. The drawn grove is the page's identity, and a photo next to it would mean two styles on one screen. The places that would gain are the empty right halves at 1440:
- **Harvest day:** people picking onto the cloths, beside the "Hasat günü" head.
- **The oil:** green oil coming out of the decanter, in the six-step process section ("Dalından şişeye altı adım").
- **The grove:** a terraced Ovacık slope in the garden section.

How the scores would move against the benchmark median:
- **Design:** about +0.2, from 7.2 to 7.4. The pictures would fill the dead space and add appetite, which is how Don Molinico and SŌM use photography. That is still below the median of 7.65.
- **Creativity:** about −0.4, from 7.0 to 6.6. A page drawn entirely in code is the concept and the thing that sets it apart. Mixing in AI photos breaks the single hand that G1 asks for.

What it would risk:
- **The brief and test A2:** disqualifying on the client's own terms.
- **Details that look wrong:** olive leaves, hands, Erkence fruit and an Urla landscape that isn't real. Turkish visitors and jurors would notice, and Awwwards juries mark AI imagery down.
- **Honesty:** photoreal "evidence" of harvest days at a fictional farm clashes with the page's honest-outcome stance.
- **Weight:** image size and LCP against the performance budgets.

My advice is not to do it.

**2. Is the type too large?**

Partly. I measured the 22:02 page at 1440:
- H1 is 58px but section H2s are 66px, so the hierarchy is upside down.
- Those 66px H2s sit next to empty half-columns, which reads as "big type, empty page".
- The opening story paragraph in Fraunces is about 30px and runs to seven lines, which feels heavy.
- Body text at 16–17px and buttons at 15px are right; body must stay at least 16px on phones.

Changes I'd make:
- **H2:** from `clamp(2.05rem,1.2rem + 3.3vw,4.1rem)` to `clamp(1.85rem,1.2rem + 2.2vw,3.2rem)`. That gives about 51px at 1440 and about 30px at 390.
- **H1:** keep it, or raise it to about 64px at 1440, so it is the largest heading.
- **Story paragraph:** cap it at about 1.5rem (24px).
- **FAQ questions:** from 23px to about 20px.

Score effect: Design +0.1 to +0.2, because the hierarchy and rhythm get cleaner. Creativity doesn't change. This alone won't flip the gate.

**Estimate if both were done well:** Design about **7.5** and Creativity about **6.7**, so both still below the medians of 7.65 and 7.45. With the type fix alone and no photos: Design 7.3–7.4, Creativity 7.0. These are judgements: I measured the type on the 22:02 page but did not fully rescore it, and I changed nothing.
