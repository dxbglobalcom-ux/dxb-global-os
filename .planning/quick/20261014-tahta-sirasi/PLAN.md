# Plan — the board in construction order, and the holding reviewed against it

**Bittiğinde ekranınızda:** Tahta sayfasını açtığınızda her açık iş, yapılış sırasıyla 1'den sona dizili durur ve
yanında neden o sırada olduğu tek satırla yazar; holdingi gözden geçirirken bulunan her kusur ya kendi satırında ya
da sizin onayınızla açılan yeni bir satırda durur.

**Kanıtı:** `pnpm board:order` — every open row carries one rank, no row ranks before a row it stands on, and every
finding of the review is tied to a row (a script written in step 5, red first).

Opened 2026-10-14 by the CEO, in conversation (session d9f45a6f-7aa4-4468-aa83-ea871564b340; his words below,
verbatim, from that conversation). **No construction in this job.** It ends when the ordered board and the review's
findings are on one page in front of him; construction starts only on his separate word after that page.

## His words (verbatim, 2026-10-14)

- *"Şimdi bu tahtada bir öncelik sıralaması yapılması gerekiyor. Tamam, tahta karışık. B1, 6, 6, B8, B9 ama bir
  sıralama yok. Tamam mı? Yani ilk yapılacaktan en temel inşaat. Şimdi kalkıp da bir inşaat yaparken, değil mi, çatıyı
  da getirip üstüne koymasın. Önce hani sırayla, onun tabii ki sırasını siz biliyorsunuz mühendisler olarak. Sırayla
  konulması lazım. Bir operating sistem inşa ediliyor ve o operating sistemde inşa ederken her şeyin önem ve
  gereklilik sırasına göre."*
- *"Diğer bir konu, şimdi bu holding yapıldı da eski modellerle yapıldı falan filan. Hani ben holdingin hani gözden de
  geçirilmesini istiyorum, yani aynı şekilde. Gözden geçirilirken, ha bak bu şurası bozuk, tahtada bununla ilgili bir
  şey yazılmış mı? Bakayım. Ha, yazılmamış. Bunu da tahtada ekleyelim ya ilgili satıra ya da şeye, yeni bir satır
  açalım."*
- *"Yani istediğim şey tahtanın düzenlenmesi. Anlatabildim mi? Yani işe tamamıyla şu an işe yapıma başlamaması. Önce
  bir düzenlemelerin yapılması. Planlamaların yapılması."*
- *"ne kadar başladığın işleri bitir, o ayrı."*
- *"Bunu sen belki yapamayabilirsin. Session'ın dolabilir. Tamam mı? Yeni bir session'a aynı şekilde kaldığı yerden
  devam edilsin yani kesinlikle."*
- *"Önem sırasını, o tahtanın önem sırasını ben bilemem. Ne daha önemli? Siz mühendissiniz. Yani bir inşaat mühendisi
  bilir. Mesela önce çimento dökülmeli, sonra demir konmalı. Bunu bir inşaat mühendisi bilir. Dolayısıyla hani evi
  alacak olan kişi bilmez. Ben de aynı şekilde. Ben CEO'yum. … Şimdi tahtada bir sürü plan var. Ve bu planlar hani
  belli bir düzenle, belli bir sırayla, belli bir ahenkle tek tek yapılmalı. Bunun planını işte yapmanızı istiyorum.
  Sen session'ın yetmeyecekse başka bir session'a devret, taze session yapsın bunu."*

- *"Yani tekrar ediyorum, dediğim gibi yani inşaata henüz başlanmayacak yani. Sadece düzgün yani holding baştan aşağı
  kontrol edilecek. Daha sonra plan ona göre yapılan, tahta ona göre düzenlenecek. … Belki ekleyeceğim başka şeyler de
  var, eksikler tahtasına. … Holding'e entegre edilmesi gereken bazı konular olabilir. … Bu incelemeler içerisinde şey
  de var. Excel dosyası Turbo var. Ondan sonra diğer şey var. Görev, masa üstünde görev, rakip 39 var. Rakip 41 var.
  Bunlarla ilgili de bunlar da okunsun. Ne değildir. Bakılsın. İncelensin. Anlatabildim mi? Tahtaya yazılacaksa,
  yazılması gereken şeylerse yazılsın yani."*

**The order is the engineers' call, not his** — he said so. The page does not ask him to judge importance; it shows
him the order with one line of reason each, and asks his word only where the board's laws need it (new rows, law 4).

Not yet registered in `scripts/governance/ceo-approvals.json`: they are registered when he says yes to the page
(step 6), together with the change to board law 4 (LAW A — see step 6).

## Facts that stand (do not re-litigate)

- The board: `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md`. Open work = Section 1 (43 rows, measured 2026-10-14: B01-B06, B08-B12, B14-B18, B22, B25-B35, B41-B45, B51, B62-B70 — readers B and C found B07, B13, B19, B20, B23, B24, B36-B40, B46-B50, B52-B61 already closed in Section 5, and B44/B45 accepted 2026-09-16 yet still in Section 1),
  Sections 2 / 2c / 2d (complaints C26-C42, C52-C64, the ruling of 2026-07-29) and Section 3 (the C42 programme, which
  B22 owns). Each row's detail: `.planning/board-rows/<ID>.md`. The board page he sees is rendered by
  `scripts/board/render.mjs`.
- Board law 1: a row opens only on his word → the review produces CANDIDATES; nothing is written onto the board or a
  row file before his yes on the page. Board law 4 (historical order) is what his order replaces, at step 6.
- "Before you pick a row" line 2: the first row must be the one that makes the company breathe.
- B64's design and plan are accepted and stand ready (`.planning/quick/20261012-b64-is-akisi/PLAN.md`); B64 gets its
  rank like every other row. Its step-1 pieces built on 2026-10-14 (routing door, 13 anon doors, Hamza's levels, goal
  not intent) are finished on the construction engine only — see `.planning/quick/20261014-b64-adim1/`.
- An idle employee, an empty queue, the absence of clients is the construction's normal state — never a finding
  (memory `under-construction-dormant-is-not-a-finding`). Nothing in his sources is called "decoration".
- The company engine (54322) is read SELECT-only through `~/.config/dxb/company-gateway.env` (role `dxb_gateway`);
  its URL is never printed. Nothing is ever written to the company.

## The layers — the construction order, foundation first

| Layer | Turkish (for his page) | What belongs there |
|---|---|---|
| L1 | Güvenlik ve verinin doğruluğu | grants, RLS, secrets, backups and restore, the migration ledger, the two engines' separation, data that lies |
| L2 | Çalışma motoru | resident services, scheduler, queue, workers, model catalogue and routing, cost and budget meter, alerts, logs |
| L3 | Çalışanlar ve bölümler | companies, departments, heads, agents, personas, brains, skills and tool profiles |
| L4 | İşin akışı | goal → owner → plan → parts → check → delivery (B64), Hamza's hands, the job desk, lines and schedules |
| L5 | Onay, para ve dışarıya çıkış | approval engine, critical gate, outbox, money in and out, contracts, the Islamic boundaries |
| L6 | Hafıza ve öğrenme | memory, knowledge, library, the one dream |
| L7 | Ekranınızın canlı olması | dashboard surfaces, the "alive" law, voice, briefing, design |
| L8 | Dış dünya | Gmail and Reception, Hermes, clients and CRM, revenue, the studio, new companies, sponsors |

Inside a layer: what makes the company visibly breathe goes first; then what more rows stand on; then age.

## Steps

1. **Read every open row** (four readers, ~25 items each, in parallel). Output, one file per reader in this folder,
   `rows-<A|B|C|D>.md`, one block per row:
   ```
   ### <ID> — <what it is, one plain line>
   - State: open | stale (the row says X, the code/engine says Y — evidence) | done already (evidence)
   - Layer: L1..L8
   - Stands on: <IDs, or a named foundation not on the board> — one line why
   - Breathes: yes | no — does finishing it make the company visibly work
   - Waits on: <as the board says> — still true? (one line)
   - Overlaps: <IDs it duplicates or contains>
   ```
2. **Review today's holding** (six reviewers, in parallel, measuring — never guessing). Areas: R1 security and data
   (L1) · R2 the engine (L2) · R3 the workforce (L3) · R4 work flow, approval, money (L4+L5) · R5 memory, screens,
   voice (L6+L7, from code, data and logs; what only an eye can see is listed for his eye) · R6 the outside world (L8).
   "Broken" means: an error, a failing job, data that contradicts itself or the code, a dead or misleading screen, a
   security hole, a record that lies. Output `review-<R1..R6>.md`, one block per finding:
   ```
   ### F-<R#>-<n> — <the defect, one plain line>
   - Evidence: <command and decisive output, or file:line>
   - Owner row: <ID and the row's words that cover it> | NONE
   - Layer: L1..L8 · Severity: blocks | hurts | cosmetic · Needs his eye: yes | no
   ```
2b. **His sources** (one reader each, in parallel with step 2; each writes `sources-<name>.md` here): the Excel
   Turbo file `~/Desktop/İNCELEMELER/Excel-turbo.xlsx` (nine projects, thirteen decisions — STATE's old path
   `~/Desktop/Lİnk araştırmaları/` is stale), the task file for rival sources 39 and 40 `~/Desktop/GOREV-RAKIP-39-40.md`
   (did that task run? where did it land — B43, B22, `.planning/research/rival-intel/`?), and the source-41 report
   `~/Desktop/RAKIP-41-RAPOR.md` (MCP / the opening; his words in it: nothing built until he has seen the plan). For
   each item they carry: what it is, is it already on the board (row) or already built (evidence), what it would
   integrate into the holding, its layer, and whether it belongs on the board (a candidate row or a note for an
   existing row) — the board takes it only if it is real work he ordered or should be put to him (law 6). He may add
   more items himself before the page: they enter the same way. Never call anything in his sources decoration.
3. **Consolidate** (the lead): merge overlaps, attach each finding to its owner row (noted for that row's file) or to
   a candidate new row (one line what, one line why, layer); draw the "stands on" graph; flag cycles.
4. **Order**: a rank for every open row and candidate — layer by layer, inside a layer by breathes → stood on → age;
   no row before a row it stands on. One line per rank: why it is there.
5. **The proof script** `scripts/board/order-check.mjs` + `pnpm board:order` (test first, red): reads the ranks and
   the "stands on" edges from the board, fails on a missing or duplicate rank, an edge pointing forward, or a finding
   with no row. Written only after his yes on the page (it reads what the page approves).
6. **One page to him** (Turkish, plain, his page; Artifact quickstart first): the ordered list (rank · row · one line
   what · one line why there), the candidate new rows, and the findings that need his eye. He is not asked to rank —
   the order is ours; he looks, and his word opens the new rows and replaces law 4. On his yes: register his
   words (this file's list + his yes) in the ledger; rewrite board law 4 to his order (LAW A — the old law goes);
   write the ranks onto the board (a rank column or an ordered section — the board renderer `scripts/board/render.mjs`
   shows them); open the new rows he accepted; each finding into its row's file; `pnpm board:order` green; rulers
   6/6; STATE's three headings rewritten.

## How it is verified

The readers' and reviewers' files carry their evidence; the lead spot-checks every "done already", "stale" and
"blocks" claim by re-running its command before it reaches the page. The records rulers run on the board commit;
`pnpm board:order` proves the order. Nothing on the page says accepted until he has looked (LAW B).

## Risks

- Size: 43 rows, ~40 complaint items, six areas — more than one session. Every step leaves its files in this folder;
  a new session continues from the last finished file (his order: *"kaldığı yerden devam edilsin yani kesinlikle"*).
- A finding a terminal cannot see (a screen's look) is ⚠ UNVERIFIED and goes to his eye list, never stated as fact.
- A reader may call a row "done" from a summary: every such claim is re-measured by the lead.
