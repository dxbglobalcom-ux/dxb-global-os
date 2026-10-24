**1. Conditions and risks derived from `brief.md` alone**

The delivered work must:

- Be **one landing page**, delivered at `delivery/index.html`, usable on computers and phones.
- Use Turkish throughout the visitor experience.
- Present a fictional family farm in Urla, İzmir, growing olives for three generations, producing early-harvest extra-virgin olive oil and hosting autumn harvest days.
- Help visitors understand the farm and want to order its oil or attend a harvest day.
- Create every visible graphic in code, using no external photographs or image files. Google Fonts is permitted.
- Work independently without a backend. Any form submission must be handled in the browser.
- Invent the remaining business details without asking the client or waiting for approval.
- Aim at work capable of competing for first place internationally.

The brief **does not require checkout, inventory management, confirmed reservations, multiple products, calendar downloads or even forms**.

The principal risks are:

- Expanding a landing-page assignment into a shopping or reservation application.
- Producing generic illustrations or decorative effects that fall below the visual ambition.
- Letting elaborate storytelling obscure the farm, its oil or the two intended actions.
- Losing readability, speed or usability on phones.
- Making browser-only interactions appear to perform actions that require someone to receive the submission.
- Introducing inconsistent invented dates, family history, products or prices.

**2. Plan A**

**What A lacks that B has**

- **A single illustration owner and sequential art integration.** B assigns its visual library to one part before construction. A splits landscape and objects between parallel contributors. A has substantial contracts to mitigate this, but B’s arrangement gives visual consistency a clearer owner. ([A](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:435), [B](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:123))
- **Time estimates.** B estimates its stages; A supplies dependencies and effort levels without estimating elapsed work. This matters particularly given A’s larger workflow. ([B](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:230))
- **An explicit “do not change” list during revision.** B protects successful design decisions while prescribing fixes. A prioritises findings but has no equivalent explicit protection. ([A](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:574), [B](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:173))
- **A visitor-copyable order summary.** B specifies “Özeti kopyala”; A provides an on-page confirmation without that portable result. This is useful for a browser-only interaction, although the brief does not require it. ([B](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:40))

**Errors in A**

1. **It materially widens the assignment.** A makes a persistent cart, shipping thresholds, pickup, gift wrapping, checkout, local seat accounting, booking codes, calendar export, a question form and a subsequent-season notification form mandatory. Together these turn the landing-page job into a small commerce and reservation application. Keeping everything inside one HTML document does not remove that functional expansion. ([A §2.2–2.3](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:90))

2. **Its confirmation promises an unsupported next step.** Payment and delivery will supposedly be arranged by phone, yet submissions never leave the browser and the farm has no receiving channel for those orders. A reference number and local confirmation cannot initiate a callback. The flow needs an explicit local/demo outcome rather than an operational promise. ([A](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:127))

3. **Its asset prohibition contradicts its production instructions.** Section 2.4 prohibits vector image files “in every part,” but P2 must produce `logo.svg`, and the illustration parts produce asset files for later inlining. Code-authored SVG intermediates are compatible with the brief; A’s own absolute prohibition makes its workflow inconsistent. ([A prohibition](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:160), [A outputs](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:345))

4. **It asks research to verify fictional operating history.** The “Üç Hafta” product depends on research confirming three pressing weeks for an invented farm. Research can establish seasonal plausibility; the team must decide the fictional farm’s actual schedule. This introduces a false external dependency. ([A](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:271))

5. **It weakens the stated ambition when translating it into acceptance language.** A defines first-place potential as something a jury would “shortlist.” Shortlisting is a lower target. Its internal numerical scores also need comparative evidence to support the original ambition. ([A](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:26))

6. **Its failure fallback is too broad.** After a second failed intake, the owner may “drop it from scope,” without restricting this option to discretionary features. That could remove work necessary to satisfy the brief. ([A](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:673))

**3. Plan B**

**What B lacks that A has**

- **An early, self-tested browser harness.** A establishes viewport capture, scrolling, interaction scenarios, network inspection and measurement before production. B leaves important harness work to construction and QA. ([A P0](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:282))
- **A meaningful alternative-design comparison.** A requires two working concepts, including hero and product cards, before selecting a direction. B requires one concept and a hero proof. ([A](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:347))
- **Concrete performance acceptance thresholds.** B budgets source size and node counts but offers only a CPU “sanity check” and conditional Lighthouse testing. A specifies load, layout-shift and animation budgets under throttling. ([A](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:225))
- **Second-engine verification and stronger mobile interaction checks.** A tests Chrome and Firefox, phone landscape, rotation during flows and sticky controls around focused fields. B’s required execution centres on headless Chrome. ([A](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:529))
- **Detailed functional boundaries and testing.** A explicitly covers duplicate submissions, seat limits, minimum adults, storage failure, monetary boundaries and Istanbul date handling. B’s form requirements leave several of these decisions implicit.
- **Comprehensive copy-state proofing.** A explicitly extracts errors, confirmations, announced text and seasonal states. B’s `--dump-dom` instruction does not specify exercising every state before extracting its text. ([A](/home/dxb/test-kutu/20261024-zeytin/blind/A.md:548), [B](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:147))

**Errors in B**

1. **It also expands the functional scope.** Three-product ordering, shipping calculations, reservation pricing, availability deductions and an off-season preregistration state become mandatory. Forms are allowed by the brief, but a miniature order-and-reservation system is not required. B’s expansion is smaller than A’s, but still needs naming. ([B inventory](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:39))

2. **Its final-check procedure targets the wrong file at the wrong time.** Part 08 says to test the revised file before copying it into delivery; the prescribed protocol instead opens `delivery/index.html`. On first assembly this may not exist; later it may be an older version. The same hard-coded path is unsuitable for checking the Part 04 candidate. ([B assembly](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:187), [B protocol](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:258))

3. **Its “full-page” captures change the layout being assessed.** Setting the browser window height to 12,000 pixels is not a full-page capture at the intended phone or desktop viewport. Viewport-height sections and scroll-triggered behaviour can change substantially. A explicitly handles this distinction; B’s screenshots can therefore give misleading evidence. ([B](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:252))

4. **Its navigation rules contradict its content inventory.** B prohibits outbound links and says navigation is anchors only, then requires `tel:` and `mailto:` links. Those exceptions should be stated consistently. They are not additional pages, however. ([B prohibition](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:10), [B contact section](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:44))

5. **Its date model is underspecified.** The visitor’s clock determines availability without an explicit farm timezone or a rule for booking today’s event. Different visitor locations can therefore produce different availability around midnight. ([B](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:25))

6. **Its acceptance threshold can be waived by explanation.** The definition of done requires every jury criterion to reach eight; the later rubric permits delivery below eight if the owner records why. That creates an escape from its own quality gate. ([B definition](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:61), [B waiver](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:284))

7. **Its contact safeguard does not establish what it claims.** A patterned, valid-format telephone number can still reach someone; an invented domain is not necessarily unowned. B identifies this risk but supplies no reliable resolution. These contact mechanisms are optional additions to this fictional landing page. ([B](/home/dxb/test-kutu/20261024-zeytin/blind/B.md:308))

**4. What the brief needs that neither plan adequately establishes**

- **A proportionate landing-page scope.** Both preserve one final HTML page, but both make substantial transactional machinery compulsory. Neither starts with the smallest persuasive experience that meets the two visitor goals and requires additions to justify their place.
- **Evidence of persuasion.** A’s five-second test checks whether visitors identify the business and available actions. Both test whether interactions work. Neither explicitly tests whether representative visitors find the farm convincing, want the oil or harvest experience, and understand enough to choose.
- **An unambiguous browser-only outcome.** A promises a phone follow-up without transmission. B requires honest confirmation language but leaves its exact meaning unresolved while displaying reference numbers and deducting seats. Neither fully specifies the distinction between a local interaction and a received order or secured place.
- **A firm quality gate matching first-place potential.** Both provide useful critique and revision processes, but neither establishes that internal scoring demonstrates competitive distinction. A lowers the wording to shortlisting; B allows its score threshold to be waived.

Neither plan proposes a delivered multi-page site. Their internal prototypes, showcases and review pages are working materials, not extra delivered pages. The scope errors concern the compulsory functionality and production burden added to the requested landing page.