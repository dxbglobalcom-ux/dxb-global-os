job: Hamza says plainly when he cannot read his notes, and one real task-lane company call proves an employee's note lands in and comes back from the drawer
range: b8bb4222..HEAD
blast: 1
risk: 2
reasoning: 1
ambiguity: 0

# The card — 4 / 8, normal, Sol at `high`

- **His words, 2026-10-04:** the two items were put to him as *"1. Hamza notlarını okuyamadığında bunu
  cevabında açıkça söyleyecek … 2. Bir çalışanın gerçek bir işte not yazdığı, Hamza tarafının da aynı
  notu geri okuduğu tek bir deneme"*; his answer: *"kısaysa yap değilse boşver"*.
- blast 1 — the answer lanes (chat-drain, voice answer) through their one standing layer (prompt-core).
- risk 2 — an agent's prompt; what Hamza tells the CEO.
- reasoning 1 — a failed recall vs an empty one.
- ambiguity 0.
- Origin: Sol's C on the memory-drawer job (`../20261004-company-memory-drawer/SOL.md`): chat and voice
  turn a recall error into an empty memory; and that job's open check (the employee side shown only by
  a model-free probe).

# Done-list (written before the code)

1. `pnpm -C "/home/dxb/DxB Global OS" exec vitest run tests/phase6/memory-unreachable.test.ts` → RED
   before the code (the seam and the flag do not exist), GREEN after.
2. Same file, after: a recall that throws reaches the chat lane's and the voice lane's answer producer as
   `memoryUnreachable: true` with no memory lines, and one `[memory] recall failed on the <lane> lane`
   line is logged; a recall that works carries its lines and `memoryUnreachable: false`.
3. Same file: the standing layer carries the unreachable sentence only when flagged; with no memory and
   no failure it carries no memory block (the B21 case unchanged).
4. `pnpm -C "/home/dxb/DxB Global OS" run build` → exit 0.
5. `tests/b21 tests/c9 tests/u15r2 tests/phase6` targeted → all pass.
6. `bash .planning/quick/20261003-runtime-isolation/run-lanes-probe.sh evidence/note-probe.txt` with
   `LANES_PROBE=.planning/quick/20261004-memory-followups/note-probe.mjs` → a real `defaultExecutor`
   call of a staffed seat commits a note through its own dxb-mcp child; the scheduler-side `recallMemory`
   finds that note in the root it was handed (a construction folder, never the company's), the bodies
   match; `RUN_LANES_PROBE_STATUS=0`, the probe's rows removed.
7. Battery once (dxb-verify) → `BATTERY_GREEN`.
8. Deploy: `dxb-scheduler` restarted; its start lines read; company counts unchanged.
