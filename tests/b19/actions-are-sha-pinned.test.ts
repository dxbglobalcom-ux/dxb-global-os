import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// B19 · EVERY CI ACTION IS NAILED TO A COMMIT, AND A CHECK WATCHES IT.
//
// THE DEFECT THIS FILE HOLDS, opened 2026-07-06 and measured again 2026-08-26.
// `.planning/STATE.md` (Phase 01) recorded a TODO: "gitleaks-action @v2 tag with
// SHA-pin TODO at remote go-live". A workflow that names an action by a moving
// tag (`@v4`, `@v2`) runs whatever that tag points at TODAY — the owner of the
// action, or anyone who takes their account, can change it after we reviewed it.
// That is the supply-chain hole SHA-pinning exists to close, and the TODO's
// trigger ("remote go-live") was an event with no owner and no watcher.
//
// The tag really does move: measured 2026-08-26, `gitleaks/gitleaks-action@v2`
// resolved to ff98106e4c7b2bc287b24eaf42907196329070c7, while this repository
// has been pinned since 2026-07-09 to dcedce43c6f43de0b836d1fe38946645c9c638dc.
// The pin held; the four unpinned actions beside it would not have.
//
// This file is the watcher the TODO never had. It runs inside `pnpm test`, so
// it fires on every verification pass rather than at an event nobody owns.

const WORKFLOWS = join(process.cwd(), ".github/workflows");

/** `- uses: owner/repo@ref` and `uses: owner/repo@ref`, with whatever trails it. */
const USES = /^\s*(?:-\s*)?uses:\s*(\S+)(.*)$/;
const SHA = /^[0-9a-f]{40}$/;

type Use = { file: string; line: number; action: string; ref: string; trailer: string };

function everyUse(): Use[] {
  const files = readdirSync(WORKFLOWS).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
  const uses: Use[] = [];
  for (const file of files) {
    readFileSync(join(WORKFLOWS, file), "utf8").split("\n").forEach((text, i) => {
      const m = USES.exec(text);
      if (!m) return;
      const [action, ref = ""] = m[1].split("@");
      // A local action (`./.github/actions/x`) has no ref to pin.
      if (!m[1].startsWith(".")) uses.push({ file, line: i + 1, action, ref, trailer: m[2] ?? "" });
    });
  }
  return uses;
}

describe("B19 — CI actions are pinned to commits, not to tags", () => {
  it("finds workflows and actions to check at all (a gate that checks nothing is not a gate)", () => {
    const files = readdirSync(WORKFLOWS).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
    expect(files.length).toBeGreaterThan(0);
    expect(everyUse().length).toBeGreaterThan(0);
  });

  it("names every third-party action by a 40-character commit SHA", () => {
    const moving = everyUse()
      .filter((u) => !SHA.test(u.ref))
      .map((u) => `${u.file}:${u.line} ${u.action}@${u.ref || "(no ref)"}`);
    expect(moving, "these run whatever the tag points at today").toEqual([]);
  });

  it("says beside each pin which tag it was and when it was resolved", () => {
    const unlabelled = everyUse()
      .filter((u) => SHA.test(u.ref))
      .filter((u) => !/#\s*\S+ tag, resolved \d{4}-\d{2}-\d{2}/.test(u.trailer))
      .map((u) => `${u.file}:${u.line} ${u.action}`);
    expect(unlabelled, "a bare SHA tells a human nothing about what it is").toEqual([]);
  });
});
