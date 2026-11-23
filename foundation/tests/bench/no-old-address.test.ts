import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BENCH, connectionString } from "@dxb-foundation/bench";

const foundationDir = fileURLToPath(new URL("../../", import.meta.url));

// Every forbidden spelling below is put together from pieces, so that this file
// passes its own scan without being exempted from it.
const piece = (...parts: string[]): string => parts.join("");
const literally = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The company's API and database ports, then the old bench's.
const OLD_PORTS = [piece("543", "21"), piece("543", "22"), piece("544", "21"), piece("544", "22")];
// Every variable that carries a company address begins with this.
const COMPANY_VARIABLE = piece("DXB_", "COMPANY");
const DOT_ENV = piece(".", "env");
// Env files of the old system whose names carry no hyphen (the hyphenated ones are caught by their shape).
const OLD_ENV_FILES = [piece("backup", DOT_ENV), piece("iso", DOT_ENV)];
const ENV_OBJECT = piece("process", DOT_ENV);
// The same object by its two other spellings: asked for in brackets, and imported by its own name.
const ENV_IN_BRACKETS = piece("process", '["env"]');
const ENV_IMPORTED = piece("import { env } from ", '"node:process"');
// SPEC §5b.1: the only variables the foundation's bench reads.
const VARIABLES_OF_THE_CONTRACT = ["PATH", "DXB_FOUNDATION_LOCK_WAIT"];

const oldPort = new RegExp(`(?<!\\d)(?:${OLD_PORTS.join("|")})(?!\\d)`, "g");
const companyVariable = new RegExp(`${COMPANY_VARIABLE}\\w*`, "g");
// A dot-env file: the name starts with the dot — it is not a property read off some object.
const dotEnvFile = new RegExp(`(?<![\\w$)\\]])${literally(DOT_ENV)}(?:\\.[\\w-]+)*(?![\\w(])`, "g");
// A hyphenated `<name>` followed by the dot-env ending, or one of the old system's unhyphenated ones.
const namedEnvFile = new RegExp(
  `(?:[A-Za-z0-9_]+(?:-[A-Za-z0-9_]+)+${literally(DOT_ENV)}|\\b(?:${OLD_ENV_FILES.map(literally).join("|")}))\\b`,
  "g",
);
// Any touch of the environment object, with the variable's name when it is spelled.
const envRead = new RegExp(`${literally(ENV_OBJECT)}(?:\\.([A-Za-z_$][\\w$]*)|\\[\\s*["']([^"']*)["']\\s*\\])?`, "g");
// The environment object reached past that spelling — whatever is read off it then, the scan above would not see it.
const envInBrackets = /\bprocess\s*(?:\?\.)?\s*\[\s*["'`]env["'`]\s*\]/g;
// `env` imported from the process module under any name, also when the import's list spans lines.
const envImported = /\bimport\s+(?:[\w$]+\s*,\s*)?\{[^}]*\benv\b[^}]*\}\s*from\s*["'](?:node:)?process["']/g;

/** What one text spells that the foundation must not: each finding says its kind and the spelling. */
function oldAddressesIn(text: string): string[] {
  const findings: string[] = [];
  for (const [index, line] of text.split("\n").entries()) {
    const at = `line ${index + 1}`;
    for (const match of line.matchAll(oldPort)) findings.push(`${at}: old port ${match[0]}`);
    for (const match of line.matchAll(companyVariable)) findings.push(`${at}: company variable ${match[0]}`);
    for (const match of line.matchAll(dotEnvFile)) findings.push(`${at}: env file ${match[0]}`);
    for (const match of line.matchAll(namedEnvFile)) findings.push(`${at}: env file ${match[0]}`);
    for (const match of line.matchAll(envRead)) {
      const variable = match[1] ?? match[2];
      if (variable === undefined || !VARIABLES_OF_THE_CONTRACT.includes(variable)) {
        findings.push(`${at}: environment read outside SPEC §5b.1: ${match[0]}`);
      }
    }
    for (const match of line.matchAll(envInBrackets)) findings.push(`${at}: the environment by another spelling: ${match[0]}`);
  }
  for (const match of text.matchAll(envImported)) {
    const at = `line ${text.slice(0, match.index).split("\n").length}`;
    findings.push(`${at}: the environment by another spelling: ${match[0].replace(/\s+/g, " ")}`);
  }
  return findings;
}

/** Every regular file under `dir`, as a path relative to it; `node_modules` is not entered, links are not followed. */
function filesUnder(dir: string, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const relative = `${prefix}${entry.name}`;
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : filesUnder(join(dir, entry.name), `${relative}/`);
    return entry.isFile() ? [relative] : [];
  });
}

describe("the detector — seen to find each forbidden spelling before its silence is trusted", () => {
  it.each([
    ["the company's API port", `curl http://127.0.0.1:${OLD_PORTS[0]}/rest/v1/`],
    ["the company's database port", `postgresql://postgres:postgres@127.0.0.1:${OLD_PORTS[1]}/postgres`],
    ["the old bench's API port", `api_url = "http://127.0.0.1:${OLD_PORTS[2]}"`],
    ["the old bench's database port", `port = ${OLD_PORTS[3]}`],
    ["a company variable", `const url = env.${COMPANY_VARIABLE}_URL;`],
    ["another company variable", `${COMPANY_VARIABLE}_GATEWAY_URL=postgresql://…`],
    ["the dot-env file", `set -a; source ${DOT_ENV}; set +a`],
    ["a dot-env file with an ending", `dotenv -f "${DOT_ENV}.daemon" run`],
    ["a named env file with a hyphen", `EnvironmentFile=%h/dxb/${piece("company-gateway", DOT_ENV)}`],
    ["a named env file without one", `. "$HOME/${OLD_ENV_FILES[0]}"`],
    ["a read of a variable the contract does not name", `const url = ${ENV_OBJECT}.DXB_DATABASE_URL;`],
    ["a bracketed read of one", `${ENV_OBJECT}["SUPABASE_SERVICE_ROLE_KEY"]`],
    ["the whole environment handed on", `spawn(command, { env: { ...${ENV_OBJECT} } })`],
    ["a read by a computed name", `const value = ${ENV_OBJECT}[name];`],
    ["a read of HOME, which SPEC §5b.1 took from the contract", `const home = ${ENV_OBJECT}.HOME ?? "";`],
    ["a read of XDG_STATE_HOME, taken from it too", `join(${ENV_OBJECT}.XDG_STATE_HOME, "dxb")`],
    ["a read of XDG_RUNTIME_DIR, taken from it too", `${ENV_OBJECT}["XDG_RUNTIME_DIR"]`],
    ["the environment asked for in brackets, even for a variable of the contract", `${ENV_IN_BRACKETS}.PATH`],
    ["the environment imported by its own name", `${ENV_IMPORTED};`],
    ["that import under another name, its list on several lines", ENV_IMPORTED.replace("{ env }", "{\n  argv,\n  env as variables,\n}")],
    ["that import from the module's bare name, beside its default", ENV_IMPORTED.replace("node:", "").replace("{", "process, {")],
  ])("finds %s", (_what, sample) => {
    expect(oldAddressesIn(sample)).toHaveLength(1);
  });

  it("is silent on the foundation's own address and on the two variables SPEC §5b.1 names", () => {
    const allowed = [
      "postgresql://postgres:postgres@127.0.0.1:54522/postgres",
      "port = 54521",
      "shadow_port = 54520",
      // an old port's digits inside a longer number are not a port
      `sysid 7700${OLD_PORTS[0]}0000000001`,
      `const path = ${ENV_OBJECT}.PATH ?? "";`,
      `${ENV_OBJECT}["PATH"]`,
      `Number(${ENV_OBJECT}.DXB_FOUNDATION_LOCK_WAIT)`,
      "execFile(command, args, { env: options.env })",
      // the process module imported for something else, and an `env` that is not the process's
      'import { argv, exit } from "node:process";',
      'import { env } from "./settings.ts";',
      'openai_api_key = "env(OPENAI_API_KEY)"',
    ].join("\n");
    expect(oldAddressesIn(allowed)).toEqual([]);
  });
});

describe("foundation/** — nothing in it spells an address of the old system", () => {
  const files = filesUnder(foundationDir);

  it("the scan reaches the foundation's own files and stays out of node_modules", () => {
    expect(files).toEqual(
      expect.arrayContaining([
        "tsconfig.json",
        "bench/package.json",
        "bench/refused.json",
        "bench/supabase/config.toml",
        "bench/src/index.ts",
        "bench/src/cli.ts",
        "tests/vitest.config.ts",
        "tests/bench/no-old-address.test.ts",
        "tests/bench/instance.test.ts",
      ]),
    );
    expect(files.filter((file) => file.split("/").includes("node_modules"))).toEqual([]);
  });

  it("no file spells an old port, a company variable or an env file of the old system, and the environment is read only for the names of SPEC §5b.1", () => {
    const findings = files.flatMap((file) =>
      oldAddressesIn(readFileSync(join(foundationDir, file), "utf8")).map((finding) => `${file} ${finding}`),
    );
    expect(findings).toEqual([]);
  });
});

describe("the foundation's own address — SPEC §3", () => {
  const config = readFileSync(join(foundationDir, "bench/supabase/config.toml"), "utf8");
  /** The text of one table of the stack's config, from its header to the next one. */
  const table = (name: string): string => config.split(/^\[/m).find((part) => part.startsWith(`${name}]`)) ?? "";

  it("BENCH names the project, the two ports, the network and the only address it binds", () => {
    expect(BENCH).toEqual({
      project: "DxB_Foundation",
      apiPort: 54521,
      dbPort: 54522,
      network: "dxb_foundation_bench",
      bind: "127.0.0.1",
    });
  });

  it("connectionString() is the bench's database on the loopback address", () => {
    expect(connectionString()).toBe("postgresql://postgres:postgres@127.0.0.1:54522/postgres");
  });

  it("the stack's config says project DxB_Foundation, API 54521, database 54522, shadow 54520", () => {
    expect(config).toMatch(/^project_id = "DxB_Foundation"$/m);
    expect(table("api")).toMatch(/^port = 54521$/m);
    expect(table("db")).toMatch(/^port = 54522$/m);
    expect(table("db")).toMatch(/^shadow_port = 54520$/m);
  });

  it("every port the stack's config names beside them is in the 545xx range", () => {
    const nearTheOldRanges = config.match(/(?<!\d)54\d{3}(?!\d)/g) ?? [];
    expect(nearTheOldRanges.length).toBeGreaterThanOrEqual(3);
    expect(nearTheOldRanges.filter((port) => !port.startsWith("545"))).toEqual([]);
  });
});
