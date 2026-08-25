// B39 — THE ALERT THE CEO READS IS TURKISH ON HIS TURKISH SCREEN. ALL THREE LINES.
//
// An alert has three lines that reach him: the title (what happened), the
// probable cause (why), and the suggested action (what to do). Measured
// 2026-08-25: only the TITLE was ever localized. `probable_cause` and
// `suggested_action` — the two lines he actually acts on — went to his screen as
// raw English, because nothing between the database row and the page touched
// them. `alerts` has no `_tr` column by design (the row is a machine-written
// artifact, English by the language directive); the SURFACE is what must be
// pure, and half of it was not.
//
// This file pins both halves for the alert B39 introduced, and pins the
// fall-through contract for everything else: an unrecognised line is passed
// through verbatim, never guessed at, never rendered as "undefined".
import { describe, expect, it } from "vitest";
import {
  localizeAlertDetail,
  localizeAlertTitle,
} from "../../apps/dashboard/src/lib/alert-title.js";

const CAP_TITLE =
  "The company paused its own work — this hour's working allowance is used up";
const CAP_CAUSE = "the company used 480000 of the 500000 it allows itself per hour";
const CAP_ACTION =
  "Nothing is broken and nothing is lost. Waiting work stays in the queue and the company " +
  "starts again on its own within the hour — you do not have to do anything. If this allowance " +
  "is the wrong size for the company's pace, it is one number in Settings " +
  "(orchestrator.subscription_tokens_per_hour).";

describe("B39 · the dispatch-brake alert, on the CEO's own screen", () => {
  it("says in Turkish what stopped, why, and that nothing is lost", () => {
    const title = localizeAlertTitle(CAP_TITLE, "tr");
    expect(title).toBe(
      "Şirket kendi işini duraklattı — bu saat için ayırdığı çalışma payı doldu",
    );
    // No English survives in the line he reads first.
    expect(title).not.toMatch(/\b(work|allowance|hour|company|paused)\b/);

    const cause = localizeAlertDetail(CAP_CAUSE, "tr");
    expect(cause).toContain("bir saatte");
    expect(cause).toContain("480000");
    expect(cause).toContain("500000");
    expect(cause).not.toContain("company");

    const action = localizeAlertDetail(CAP_ACTION, "tr");
    expect(action).toContain("Bozulan bir şey yok");
    expect(action).toContain("kendi kendine yeniden başlar");
    expect(action).toContain("sizin bir şey yapmanız gerekmiyor");
    // The real setting name stays visible — he is never left guessing what a
    // word means, and the word is never hidden from him (standing order 14).
    expect(action).toContain("orchestrator.subscription_tokens_per_hour");
    expect(action).not.toContain("Nothing is broken");
  });

  it("leaves the English record untouched on the English screen", () => {
    expect(localizeAlertTitle(CAP_TITLE, "en")).toBe(CAP_TITLE);
    expect(localizeAlertDetail(CAP_CAUSE, "en")).toBe(CAP_CAUSE);
    expect(localizeAlertDetail(CAP_ACTION, "en")).toBe(CAP_ACTION);
  });

  it("passes an unknown line through verbatim instead of guessing", () => {
    // The failure mode this guards is silent: a lookup that returns undefined
    // renders the literal word "undefined" on a command surface.
    const unknown = "Some future alert nobody has translated yet";
    expect(localizeAlertDetail(unknown, "tr")).toBe(unknown);
    expect(localizeAlertTitle(unknown, "tr")).toBe(unknown);
  });

  it("passes null through as null — an absent cause is not the string 'null'", () => {
    expect(localizeAlertDetail(null, "tr")).toBeNull();
    expect(localizeAlertDetail(null, "en")).toBeNull();
  });

  it("still localizes the titles that were already covered", () => {
    // A regression here would mean the refactor that added the detail rules
    // quietly broke the rules that existed before it.
    expect(localizeAlertTitle("Spend velocity breaker tripped", "tr")).toBe(
      "Harcama hız şalteri attı",
    );
    expect(localizeAlertTitle("3 task(s) queued longer than 30 min", "tr")).toBe(
      "3 görev 30 dk'dan uzun süredir kuyrukta",
    );
  });
});
