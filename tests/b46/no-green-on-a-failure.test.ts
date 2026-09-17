// B46 — A FAILURE MAY NOT COME BACK GREEN.
//
// Three separate places where this engine turned a failure into a success, each reproduced by an
// independent auditor on 2026-09-17 and each re-measured here by running the real code:
//
//   N03  A tool answered with an explicit error — MCP `result.isError: true` — and the reading
//        chain, which only ever looked at the JSON-RPC envelope's `error` key, took the error
//        TEXT as the page: `read=true, liveness=alive, doors_tried=1`. The page was never read
//        and the next door was never tried.
//   N09  Both hunters exited 9, no report was produced, and the fleet printed "hicbir avci rapor
//        getirmedi" and "CEVAP HAZIR" in the same run and left with exit code 0.
//   N04  The engine can open Quora through the CEO's own signed-in browser — measured the same
//        day, 19 739 bytes of real answers after the search page had broken — but the general
//        reading chain had no route for a quora.com address at all: `no platform adapter for
//        this url`. Being able to open the search page never meant the ANSWER page would open.

import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Bench, makeBench, sample } from "./engine-copy.js";

let b: Bench;
beforeAll(() => {
  b = makeBench();
});
afterAll(() => b?.dispose());

function py(code: string, env: Record<string, string> = {}): string {
  try {
    return execFileSync("python3", ["-c", code], {
      encoding: "utf8",
      cwd: join(b.engine, "scripts"),
      env: { ...process.env, ...env, PATH: `${b.bin}:${process.env.PATH}`, PYTHONDONTWRITEBYTECODE: "1" },
    }).trim();
  } catch (e) {
    // A PYTHON TRACEBACK IS NOT AN ANSWER. Swallowing it once made two of these cases pass
    // for the wrong reason: the traceback echoed the code, the code contained the word the
    // assertion was looking for, and a missing function looked like a working route.
    const err = e as { stdout?: string; stderr?: string };
    return "PYERR: " + String(err.stdout ?? "") + String(err.stderr ?? "");
  }
}

describe("N03 — an explicit tool error is not a page", () => {
  it("refuses an MCP reply whose result carries isError, and walks on", () => {
    const body = sample(
      b,
      "mcp-error.json",
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        result: {
          isError: true,
          content: [
            {
              type: "text",
              text:
                "Upstream operation could not complete. ".repeat(30) +
                "This diagnostic is long enough to pass a length test, which is exactly how it got in.",
            },
          ],
        },
      }),
    );
    const out = py(
      "import json, fetch; print(json.dumps(fetch._mcp('https://door.example/mcp', '{}', [], 5)))",
      { DXB_STUB_BODY: body },
    );
    const [text, err] = JSON.parse(out) as [string, string];
    expect(err, "the door must say why it did not open").not.toBe("");
    expect(text, "an error body is not page text").toBe("");
  });
});

describe("N04 — the page the CEO's browser can open has a route", () => {
  it("routes a quora answer address to the signed-in browser instead of refusing it", () => {
    const out = py("import fetch; print(repr(fetch.door_browser('https://www.quora.com/What-is-X', 5)))", {
      DXB_STUB_BODY: "",
    });
    expect(out, out).not.toMatch(/^PYERR/);
    expect(out).not.toMatch(/no platform adapter/);
    // it came back through a door, with text or with a named reason — not with a shrug
    expect(out).toMatch(/\(/);
  });

  it("keeps the signed-in browser shut when the run was told not to open one", () => {
    const names = py("import fetch; print(' '.join(n for n, _ in fetch.chain_for(no_browser=True)))");
    expect(names, names).not.toMatch(/^PYERR/);
    expect(names).not.toMatch(/playwright/);
    expect(names).not.toMatch(/browser/);
    const all = py("import fetch; print(' '.join(n for n, _ in fetch.chain_for(no_browser=False)))");
    expect(all).toMatch(/playwright/);
  });
});

describe("N09 — a run where nothing was read does not end with 'the answer is ready'", () => {
  it("leaves with a non-zero code and names the hunters that failed", () => {
    // the model stand-in: every hunter dies with exit 9, exactly as it did in the audit
    execFileSync("bash", [
      "-c",
      `printf '%s\\n' '#!/bin/bash' 'echo "hunter failed" >&2' 'exit 9' > ${JSON.stringify(join(b.bin, "claude"))} && chmod +x ${JSON.stringify(join(b.bin, "claude"))}`,
    ]);
    const q = sample(b, "question.txt", "a question no hunter will answer\n");
    const out = join(b.root, "fleet-failed");
    let stdout = "";
    let code = 0;
    try {
      stdout = execFileSync("bash", [join(b.engine, "fleet", "fleet.sh"), q, out, "--hunters", "2", "--timeout", "20"], {
        encoding: "utf8",
        env: { ...process.env, PATH: `${b.bin}:${process.env.PATH}`, PYTHONDONTWRITEBYTECODE: "1" },
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e) {
      const err = e as { stdout?: string; stderr?: string; status?: number };
      stdout = String(err.stdout ?? "") + String(err.stderr ?? "");
      code = err.status ?? 1;
    }
    expect(stdout).not.toMatch(/CEVAP HAZIR/);
    expect(stdout, stdout.slice(-1200)).toMatch(/rapor getirmedi|BASARISIZ/);
    expect(code, "a run with zero reports is not a success").not.toBe(0);
  }, 120_000);
});
