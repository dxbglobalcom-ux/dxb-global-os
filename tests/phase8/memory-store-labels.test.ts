import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// CEO, 2026-07-28 02:33, looking at his own Bellek page: "şu mallığa bak ya
// saçma sapan küçük yazılar ör: notebook altında bu ne yaaa ben CEO yum".
// The store cards were describing themselves with `library_items.usage_notes`
// — a catalogue note written for the library, in engineering language. His
// NOTEBOOK card read: "procedure store — memory-store/procedure/*.md
// (open-notebook line); kind=procedure, LOCKED composition".
//
// The card now says what the store HOLDS, one word, from the page dictionary.
// This gate exists because the failure mode of a dictionary lookup is silent:
// a missing key renders the literal string "undefined" on a command surface,
// and the i18n purity check would not catch a key absent from BOTH locales.
//
// The word must also stay a word: the whole point of the fix is that a CEO
// card carries no file paths, no `kind=` pairs and no composition rules.
const STORES = ["obsidian", "graphify", "notebook", "pgvector"] as const;
const LOCALES = ["tr", "en"] as const;

function dict(locale: string): Record<string, unknown> {
  const path = fileURLToPath(
    new URL(`../../apps/dashboard/messages/${locale}.json`, import.meta.url),
  );
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

describe("memory store cards speak to the CEO, not to the engineer", () => {
  it.each(LOCALES)("%s: every company store has a label", (locale) => {
    const d = dict(locale) as {
      command: { memory: { storeHolds?: Record<string, string> } };
    };
    const holds = d.command.memory.storeHolds;
    expect(holds, `command.memory.storeHolds missing in ${locale}.json`).toBeTruthy();
    for (const s of STORES) {
      expect(holds?.[s], `${locale}: no label for store '${s}'`).toBeTruthy();
    }
  });

  it.each(LOCALES)("%s: labels carry no engineering jargon", (locale) => {
    const d = dict(locale) as {
      command: { memory: { storeHolds: Record<string, string> } };
    };
    for (const s of STORES) {
      const label = d.command.memory.storeHolds[s];
      // The exact shapes that reached the CEO's card: a path, a `kind=` pair,
      // a LOCKED composition note, or a sentence where a word belongs.
      expect(label, `${locale}/${s}`).not.toMatch(/\/|\*|kind=|LOCKED|store —/i);
      expect(label.split(/\s+/).length, `${locale}/${s} is a phrase, not a word`).toBeLessThanOrEqual(2);
    }
  });

  it("the page no longer reads usage_notes onto a card", () => {
    const page = readFileSync(
      fileURLToPath(
        new URL("../../apps/dashboard/src/app/(command)/ai/memory/page.tsx", import.meta.url),
      ),
      "utf8",
    );
    // Comments explaining the removal are expected; a live read is not.
    const code = page
      .split("\n")
      .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"))
      .join("\n");
    expect(code).not.toContain("usage_notes");
  });
});
