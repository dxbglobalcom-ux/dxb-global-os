// Board row B03-bis — the separation gate must not mistake the construction site's eye-check copy of
// the dashboard for the CEO's panel, and must never let a company panel hide behind the eye stamp.
//
// Measured 2026-10-21: step 6 of scripts/governance/company-untouched.mjs finds "the CEO's panel" by
// /next-server/ alone, so the eye copy — a next-server whose environment rightly carries the
// construction database (:54422/) — would be convicted as a company process. The eye copy is told apart
// by its launcher stamp AND by carrying no company address; a stamped process that carries one stays a
// company process and is judged as one.

import { describe, it, expect } from "vitest";
import { isConstructionEyeProcess } from "../../scripts/governance/company-untouched.mjs";
import { EYE_LAUNCHER } from "../../scripts/test/engineer-env.mjs";

// The company database's address, built from its port so no line of the battery carries it whole (B36).
const COMPANY_DB_PORT = "54322";
const COMPANY_DB = `postgresql://u:p@127.0.0.1:${COMPANY_DB_PORT}/postgres`;

const eye = [
  "PATH=/bin",
  `DXB_DASHBOARD_LAUNCHER=${EYE_LAUNCHER}`,
  "NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54421",
  "DXB_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54422/postgres",
];

describe("B03-bis — the separation gate tells the eye copy from the CEO's panel", () => {
  it("recognises the stamped construction-only eye copy", () => {
    expect(isConstructionEyeProcess(eye)).toBe(true);
  });

  it("treats the company launcher's panel as the company's", () => {
    const panel = [
      "DXB_DASHBOARD_LAUNCHER=scripts/dashboard.sh dev",
      `DXB_DATABASE_URL=${COMPANY_DB}`,
    ];
    expect(isConstructionEyeProcess(panel)).toBe(false);
  });

  it("never lets a process carrying a company address hide behind the eye stamp", () => {
    expect(isConstructionEyeProcess([...eye, `X=${COMPANY_DB}`])).toBe(false);
    expect(isConstructionEyeProcess([...eye, "NEXT_PUBLIC_X=http://127.0.0.1:54321"])).toBe(false);
  });

  it("does not recognise an unstamped next-server", () => {
    expect(isConstructionEyeProcess(eye.filter((l) => !l.startsWith("DXB_DASHBOARD_LAUNCHER=")))).toBe(false);
  });
});
