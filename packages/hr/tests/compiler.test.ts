import { describe, expect, it } from "vitest";
import { compilePersonaPrompt } from "../src/compiler.js";
import { buildValidPersona, buildPersonaWithout } from "../src/fixtures.js";

const BASE = {
  personaBody: buildValidPersona(),
  hookVersion: 1,
  hookStandardText: "Pre-task gate: policy oku. Post-task gate: kanıt doğrula.",
  authoritySummary: "Para-çıkışı: YOK. Spawn: departman-içi. Bütçe: €5/gün.",
  taskContext: "Görev: haftalık maliyet raporunu derle.",
} as const;

describe("compiler snapshot", () => {
  it("aynı girdi → bit-eş prompt (deterministik)", () => {
    const a = compilePersonaPrompt({ ...BASE });
    const b = compilePersonaPrompt({ ...BASE });
    expect(a).toBe(b);
  });

  it("full mode çıktısı snapshot'a eş", () => {
    expect(compilePersonaPrompt({ ...BASE })).toMatchSnapshot();
  });

  it("compact: §9-10 kısalır, §1-6 + §11 tam kalır", () => {
    const full = compilePersonaPrompt({ ...BASE, mode: "full" });
    const compact = compilePersonaPrompt({ ...BASE, mode: "compact" });
    expect(compact.length).toBeLessThanOrEqual(full.length);
    // §1-6 içerikleri compact'ta da birebir var
    expect(compact).toContain("idempotency anahtarıyla önler");
    // §11 her zaman tam
    expect(compact).toContain("hook_violations'a yazılır");
  });

  it("hook sürüm değişimi → prompt değişimi", () => {
    const v1 = compilePersonaPrompt({ ...BASE, hookVersion: 1 });
    const v2 = compilePersonaPrompt({ ...BASE, hookVersion: 2 });
    expect(v1).not.toBe(v2);
    expect(v2).toContain("HOOK STANDARDI v2");
  });

  it("görev bağlamı VERİ bölgesine gider (talimat bölgesi ayrımı)", () => {
    const p = compilePersonaPrompt({ ...BASE });
    const dataRegion = p.indexOf("VERİ BÖLGESİ");
    expect(dataRegion).toBeGreaterThan(p.indexOf("DXB PERSONA"));
    expect(p.indexOf(BASE.taskContext)).toBeGreaterThan(dataRegion);
  });

  it("eksik bölümlü persona derlenemez (fail-closed)", () => {
    expect(() =>
      compilePersonaPrompt({ ...BASE, personaBody: buildPersonaWithout(4) }),
    ).toThrow(/§4 eksik/);
  });
});
