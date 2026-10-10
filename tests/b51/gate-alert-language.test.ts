// B51 step 3 · audit B5 — the critical gate's seat alert is Turkish on the CEO's Turkish screen. All three lines.
//
// runCriticalGate raises "Critical gate seat N cannot judge" with the seat's unavailability reason as the
// probable cause and a "Name an active Codex-lane model…" action. The row stays English (the language
// directive: the DB row is the artifact); the SURFACE must be one locale, and the localizer did not know any
// of these lines. The reasons here are produced by the gate's own seatsFrom, not copied, so a reason added
// there without a Turkish form shows up as English in this test.
import { describe, expect, it } from "vitest";
import { GATE_SETTING_KEY, seatsFrom, type CatalogueEntry } from "../../packages/orchestrator/src/critical-gate.js";
import { localizeAlertDetail, localizeAlertTitle } from "../../apps/dashboard/src/lib/alert-title.js";

const MODEL = "gpt-5.5-codex";
const row = (over: Partial<CatalogueEntry>): CatalogueEntry => ({
  id: MODEL, api_model_id: "gpt-5.5", display_name: "GPT 5.5", status: "active", banned: false, lane: "codex-cli", ...over,
});
const seat = (effort: unknown = "high") => [{ model: MODEL, effort }, { model: MODEL, effort: "high" }];
const reasonOf = (value: unknown, catalogue: CatalogueEntry[]) => seatsFrom(value, catalogue)[0]!.unavailable!;

// Every reason seatsFrom can write, one per branch; the status branch once per non-active catalogue status
// (model_catalog_status_check: active, testing, degraded, disabled, retired).
const REASONS = [
  reasonOf(null, []),
  reasonOf(seat("ultra"), [row({})]),
  reasonOf(seat(), []),
  reasonOf(seat(), [row({ banned: true })]),
  ...["testing", "degraded", "disabled", "retired"].map((status) => reasonOf(seat(), [row({ status })])),
  reasonOf(seat(), [row({ lane: "agent-sdk" })]),
];

// Identifiers he types or reads as names stay visible (setting key, its page, the model id, the effort values).
const IDENTIFIERS = [GATE_SETTING_KEY, "/sys/settings", MODEL, "low|medium|high|xhigh|max", "ultra", "Codex"];
// Unicode letter boundaries: an ASCII \b sees "in" inside "için", because ç is not a \w.
const ENGLISH = /(?<!\p{L})(critical|gate|seat|seats|cannot|judge|name|active|lane|is|not|in|the|of|one|two|for|catalogue|banned|testing|degraded|disabled|retired|effort)(?!\p{L})/iu;
const strip = (s: string) => IDENTIFIERS.reduce((acc, id) => acc.split(id).join(" "), s);

describe("B51 · audit B5 — the gate's seat alert, on the CEO's Turkish screen", () => {
  it("covers every reason branch of seatsFrom (nine distinct English lines)", () => {
    expect(new Set(REASONS).size).toBe(9);
  });

  it("says the title in Turkish", () => {
    expect(localizeAlertTitle("Critical gate seat 2 cannot judge", "tr")).toBe("Kritik kapının 2. koltuğu karar veremiyor");
  });

  it("says the action in Turkish and keeps the setting and its page visible", () => {
    const action = localizeAlertDetail(`Name an active Codex-lane model for seat 1 in ${GATE_SETTING_KEY} (/sys/settings).`, "tr")!;
    expect(action).toContain("1. koltuk");
    expect(action).toContain(GATE_SETTING_KEY);
    expect(action).toContain("/sys/settings");
    expect(strip(action)).not.toMatch(ENGLISH);
  });

  it("names the affected area in Turkish", () => {
    expect(localizeAlertDetail("critical_gate", "tr")).toBe("kritik karar kapısı");
    expect(localizeAlertDetail("critical_gate", "en")).toBe("critical_gate");
  });

  it.each(REASONS)("says the cause in Turkish: %s", (reason) => {
    const tr = localizeAlertDetail(reason, "tr")!;
    expect(tr).not.toBe(reason);
    expect(tr).toMatch(/[çğıöşüÇĞİÖŞÜ]/);
    expect(strip(tr)).not.toMatch(ENGLISH);
  });

  it("leaves every English line untouched on the English screen", () => {
    const title = "Critical gate seat 1 cannot judge";
    const action = `Name an active Codex-lane model for seat 1 in ${GATE_SETTING_KEY} (/sys/settings).`;
    expect(localizeAlertTitle(title, "en")).toBe(title);
    expect(localizeAlertDetail(action, "en")).toBe(action);
    for (const reason of REASONS) expect(localizeAlertDetail(reason, "en")).toBe(reason);
  });
});
