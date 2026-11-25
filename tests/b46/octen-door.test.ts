// OCTEN, THE SPARE DOOR of mcpx.sh. It is the one door that is not MCP: a plain HTTPS call with the
// holding's key. These cases drive the real mcpx.sh against a stand-in curl that keeps what it was
// handed, so not one call reaches Octen and the key in them is nobody's.

import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const MCPX = resolve(__dirname, "../../.claude/skills/dxb-research/scripts/mcpx.sh");
const KEY = "not-a-real-octen-value";

// Octen's answer, in the shape the live door sent on 2026-11-25 (fields the door does not print left out).
const ANSWER = JSON.stringify({
  code: 0,
  msg: "success",
  data: {
    query: "q",
    results: [
      { title: "Dünya Kupası", url: "https://a.example/1", highlight: "ilk metin", authors: "Ada", time_published: "2026-11-23T12:15:26Z" },
      { title: "Second", url: "https://b.example/2", highlight: "second text", authors: "", time_published: "" },
    ],
  },
});

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "octen-"));
  // The stand-in: keeps its argv and every `-H @file` it was pointed at, answers FAKE_BODY as FAKE_STATUS.
  writeFileSync(
    join(dir, "curl"),
    `#!/usr/bin/env python3
import os, sys
here = os.path.dirname(os.path.abspath(sys.argv[0]))
open(here + "/argv", "w").write("\\n".join(sys.argv[1:]))
open(here + "/headers", "w").write("".join(open(a[1:]).read() for a in sys.argv[1:] if a.startswith("@")))
if os.environ["FAKE_STATUS"] == "000":
    sys.stdout.write("\\n000"); sys.exit(28)
sys.stdout.write(os.environ["FAKE_BODY"] + "\\n" + os.environ["FAKE_STATUS"])
`,
  );
  chmodSync(join(dir, "curl"), 0o755);
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function octen(status: string, body: string, env = `OCTEN_API_KEY=${KEY}\n`) {
  writeFileSync(join(dir, "octen.env"), env);
  const r = spawnSync("bash", [MCPX, "octen", 'a "quoted" söz', "10"], {
    encoding: "utf8",
    env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, DXB_OCTEN_ENV: join(dir, "octen.env"), FAKE_STATUS: status, FAKE_BODY: body },
  });
  return { rc: r.status, out: r.stdout, all: r.stdout + r.stderr };
}

describe("mcpx.sh octen", () => {
  it("prints the results in the form exa prints", () => {
    const r = octen("200", ANSWER);
    expect(r.rc).toBe(0);
    expect(r.out).toBe(
      "Title: Dünya Kupası\nURL: https://a.example/1\nPublished: 2026-11-23T12:15:26Z\nAuthor: Ada\nHighlights:\nilk metin\n\n---\n\n" +
        "Title: Second\nURL: https://b.example/2\nPublished: N/A\nAuthor: N/A\nHighlights:\nsecond text\n",
    );
  });

  it("asks the standard search, and the key travels in no argument", () => {
    octen("200", ANSWER);
    const argv = readFileSync(join(dir, "argv"), "utf8");
    expect(argv).toContain("https://api.octen.ai/search");
    expect(JSON.parse(argv.split("\n").find((a) => a.startsWith("{")) ?? "null")).toEqual({
      query: 'a "quoted" söz',
      count: 10,
      result_type: "standard",
    });
    expect(argv).not.toContain(KEY);
    expect(readFileSync(join(dir, "headers"), "utf8")).toContain(`x-api-key: ${KEY}`);
  });

  it.each(["401", "402", "403", "429"])("a %s is one flagged line that repeats nothing of the key", (status) => {
    const r = octen(status, JSON.stringify({ code: Number(status), msg: `refused for ${KEY}` }));
    expect(r.rc).toBe(1);
    expect(r.out).toMatch(new RegExp(`^MCP ERROR \\(quota\\): octen .*HTTP ${status}.*\\n$`));
    expect(r.all).not.toContain(KEY);
  });

  it("reads the refusal in the body when the HTTP status says 200", () => {
    const r = octen("200", JSON.stringify({ code: 403, msg: "Insufficient balance in account" }));
    expect(r.rc).toBe(1);
    expect(r.out).toContain("MCP ERROR (quota): octen");
  });

  it.each(["", "OCTEN_API_KEY=\n"])("no key (%j) is the same flagged line, and nothing is called", (env) => {
    const r = octen("200", ANSWER, env);
    expect(r.rc).toBe(1);
    expect(r.out).toMatch(/^MCP ERROR \(quota\): octen .*no key.*\n$/);
    expect(existsSync(join(dir, "argv"))).toBe(false);
  });

  it.each([
    ["500", '{"code":500,"msg":"Internal error"}', "Internal error"],
    ["502", "<html>bad gateway</html>", "HTTP 502"],
    ["000", "", "HTTP 000"],
  ])("any other failure (%s) is an error, never an answer", (status, body, says) => {
    const r = octen(status, body);
    expect(r.rc).toBe(1);
    expect(r.out).toMatch(/^MCP ERROR: octen .*\n$/);
    expect(r.out).toContain(says);
  });

  it("no result prints (empty), as the other doors do", () => {
    const r = octen("200", JSON.stringify({ code: 0, data: { results: [] } }));
    expect(r.rc).toBe(0);
    expect(r.out).toBe("(empty)\n");
  });
});
