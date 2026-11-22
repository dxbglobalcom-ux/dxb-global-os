// B72 — A FAILED NIGHT IS SAID ALOUD, and only about the night that failed. These tests drive the real
// scripts/backup/backup-alert.sh and scripts/backup/install-units.sh on the fakes of tests/ops/backup-fakes.ts
// (`notify-send`, `sleep`, `systemctl`), and read the two units as they are written. No systemd is touched.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NEVER, ROOT, setup } from "./backup-fakes";

const UNITS = join(ROOT, "scripts/systemd");
const THIS = "11111111111111111111111111111111";
const OTHER = "22222222222222222222222222222222";
const runOf = (invocation: string, date: string, legs: string) => `BACKUP_RUN ${date} invocation=${invocation} ${legs} bytes=5 exit=1`;

describe("backup-alert.sh — the failure is said on the desktop", () => {
  const said = (t: ReturnType<typeof setup>) => t.log("notify.args");
  const withLog = (lines: string[]) => {
    const t = setup();
    writeFileSync(join(t.backups, "backup.log"), `${lines.join("\n")}\n`);
    return t;
  };
  const failed = { MONITOR_INVOCATION_ID: THIS, MONITOR_SERVICE_RESULT: "exit-code" };

  it("names the legs from the last line of the run that started it, whatever other runs wrote before and after", () => {
    const t = withLog([
      runOf(OTHER, "2026-11-21", "local=ok offsite=ok prune=fail"),
      "BACKUP_FAIL 2026-11-22 empty dump",
      runOf(THIS, "2026-11-22", "local=fail offsite=unset prune=skipped"),
      runOf("manual", "2026-11-23", "local=ok offsite=fail prune=skipped"),
    ]);
    const r = t.alert(failed);
    expect(r.status, r.stderr).toBe(0);
    expect(said(t)).toContain("critical");
    expect(said(t)).toContain("2026-11-22");
    expect(said(t)).toContain("yerel döküm");
    expect(said(t)).toContain("hedef"); // the unset destination is named too
    expect(said(t)).not.toContain("eski kopyalar"); // that was another run's
    expect(said(t)).not.toContain("yerine ulaşmadı"); // and so was that
  });

  it("names the off-site copy alone when the local set is good", () => {
    const t = withLog([runOf(THIS, "2026-11-22", "local=ok offsite=fail prune=skipped")]);
    expect(t.alert(failed).status).toBe(0);
    expect(said(t)).toContain("şirket dışı kopya");
    expect(said(t)).not.toContain("yerel döküm");
  });

  it("names the pruning when an old copy could not be removed", () => {
    const t = withLog([runOf(THIS, "2026-11-22", "local=ok offsite=ok prune=fail")]);
    expect(t.alert(failed).status).toBe(0);
    expect(said(t)).toContain("eski kopyalar silinemedi");
    expect(said(t)).not.toContain("şirket dışı kopya");
  });

  const NO_LINE_OF_ITS_OWN: [string, (t: ReturnType<typeof setup>) => void, Record<string, string>][] = [
    ["the run was cut off before its last line", () => {}, { MONITOR_INVOCATION_ID: THIS, MONITOR_SERVICE_RESULT: "timeout" }],
    ["it was not told which run failed", () => {}, { MONITOR_SERVICE_RESULT: "timeout" }],
    ["there is no log to read", (t) => rmSync(t.backups, { recursive: true }), { MONITOR_INVOCATION_ID: THIS, MONITOR_SERVICE_RESULT: "timeout" }],
  ];
  for (const [what, arrange, env] of NO_LINE_OF_ITS_OWN) {
    it(`says the run ended without its last line, and how systemd saw it end, when ${what} — never another run's legs`, () => {
      const t = withLog([runOf(OTHER, "2026-11-22", "local=fail offsite=fail prune=fail")]);
      arrange(t);
      const r = t.alert(env);
      expect(r.status, r.stderr).toBe(0);
      expect(said(t)).toContain("critical");
      expect(said(t)).toContain("son satırını yazmadan");
      expect(said(t)).toContain("timeout");
      expect(said(t)).not.toMatch(/yerel döküm|şirket dışı kopya|eski kopyalar/);
    });
  }

  it("keeps trying while the desktop is not up yet, and fails itself when it never comes", () => {
    const t = withLog([runOf(THIS, "2026-11-22", "local=fail offsite=fail prune=skipped")]);
    expect(t.alert({ ...failed, STUB_NOTIFY_AFTER: "4" }).status).toBe(0);
    expect(said(t)).toContain("yerel döküm");
    const never = withLog([runOf(THIS, "2026-11-22", "local=fail offsite=fail prune=skipped")]);
    expect(never.alert({ ...failed, STUB_NOTIFY_AFTER: NEVER }).status).not.toBe(0);
    expect(said(never)).toBe("");
  });
});

describe("the two units — neither waits on a file, both have an end", () => {
  const unit = (name: string) => readFileSync(join(UNITS, name), "utf8").split("\n").filter((line) => !line.startsWith("#"));
  const seconds = (lines: string[]) => Number(lines.find((line) => line.startsWith("TimeoutStartSec="))?.match(/^TimeoutStartSec=(\d+)min$/)?.[1]) * 60;

  for (const name of ["dxb-backup.service", "dxb-backup-alert.service"]) {
    it(`${name} logs to the journal: nothing has to be opened before its script starts`, () => {
      expect(unit(name).filter((line) => /^Standard(Output|Error)=/.test(line))).toEqual([]);
    });
  }

  it("the job is cut off after 30 minutes and still raises the alert", () => {
    expect(unit("dxb-backup.service")).toContain("TimeoutStartSec=30min");
    expect(unit("dxb-backup.service")).toContain("OnFailure=dxb-backup-alert.service");
  });

  it("the alert is given longer than the time it keeps trying the desktop", () => {
    const alert = readFileSync(join(ROOT, "scripts/backup/backup-alert.sh"), "utf8");
    expect(alert).toMatch(/^WAIT=600$/m);
    expect(seconds(unit("dxb-backup-alert.service"))).toBeGreaterThan(600);
  });
});

describe("install-units.sh — the backup's three units, and nothing else", () => {
  const NAMES = ["dxb-backup-alert.service", "dxb-backup.service", "dxb-backup.timer"];

  it("copies the three units, reloads, and enables and starts only the timer", () => {
    const t = setup();
    const r = t.install();
    expect(r.status, r.stdout + r.stderr).toBe(0);
    const installed = join(t.home, ".config/systemd/user");
    expect(readdirSync(installed).sort()).toEqual(NAMES);
    for (const name of NAMES) expect(readFileSync(join(installed, name), "utf8")).toBe(readFileSync(join(UNITS, name), "utf8"));
    expect(t.log("systemctl.log").trim().split("\n")).toEqual(["--user daemon-reload", "--user enable --now dxb-backup.timer"]);
  });

  it("leaves another unit that is already installed exactly as it was", () => {
    const t = setup();
    mkdirSync(join(t.home, ".config/systemd/user"), { recursive: true });
    writeFileSync(join(t.home, ".config/systemd/user/dxb-jarvis.service"), "as it was\n");
    expect(t.install().status).toBe(0);
    expect(readFileSync(join(t.home, ".config/systemd/user/dxb-jarvis.service"), "utf8")).toBe("as it was\n");
    expect(t.log("systemctl.log")).not.toMatch(/jarvis|restart|\.service/);
  });

  it("stops and exits non-zero when systemd will not reload: the timer is not enabled on stale units", () => {
    const t = setup();
    const r = t.install({ STUB_SYSTEMCTL_FAIL: "daemon-reload" });
    expect(r.status).not.toBe(0);
    expect(t.log("systemctl.log").trim().split("\n")).toEqual(["--user daemon-reload"]);
  });
});
