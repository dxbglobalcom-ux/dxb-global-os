import { lstatSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { LoginsRefused, connectionString, loginConnectionString, scramVerifier } from "@dxb-foundation/bench";
import { readChain, readPasses } from "@dxb-foundation/chain";
import { refusalOf } from "../chain/fixtures/refusal.ts";
import { REAL_ROOT } from "./fixtures/the-run.ts";

// Piece 5's SPEC §8 A: what is true without the bench — the verifier's arithmetic, the real chain on the disk, and
// the reading of the secret file.

const scratch = mkdtempSync(join(tmpdir(), "dxb-foundation-roles-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const saltOf = (base64: string): Uint8Array => new Uint8Array(Buffer.from(base64, "base64"));

describe("A.1 scramVerifier — PostgreSQL's own stored form", () => {
  // Two verifiers the server computed itself (2026-11-23), for these passwords and salts: SPEC §8 A.1.
  const VECTORS = [
    [
      "pencil-of-the-bench",
      "UNx3tZGuHcbFu2SKdUYfPA==",
      "SCRAM-SHA-256$4096:UNx3tZGuHcbFu2SKdUYfPA==$/6xTb6SfbNYguIF9RJps8f2bzT3+9coCE00nz76quU8=:U2yl746+8wWUbujZcYfqw0J5eF5GTikVD8NRxD7DFww=", // gitleaks:allow
    ],
    [
      "Zq8-throwaway_vector.2",
      "FhOPpGYFfvxdPt87LkbMPQ==",
      "SCRAM-SHA-256$4096:FhOPpGYFfvxdPt87LkbMPQ==$ADcREg3jdNTZNvvRfdKEHnPtR8DdgHOz4K6kHvU9AgU=:3n/zve6mEWjr8B6g2Si483cIb+vRy2n050LDOPqGxjM=", // gitleaks:allow
    ],
  ] as const;

  it.each(VECTORS)("%s with the salt %s answers the server's verifier — with the iterations left out and with 4096 said", (password, salt, verifier) => {
    expect(scramVerifier(password, saltOf(salt))).toBe(verifier);
    expect(scramVerifier(password, saltOf(salt), 4096)).toBe(verifier);
  });
});

describe("A.2 the real root reads as a chain", () => {
  it("with no offence; its first two files are 0001-roles.sql and 0002-os.sql", () => {
    const chain = readChain(REAL_ROOT);
    expect(chain.offences).toEqual([]);
    expect(chain.files.slice(0, 2).map((file) => file.name)).toEqual(["0001-roles.sql", "0002-os.sql"]);
    expect(readPasses(REAL_ROOT).offences).toEqual([]);
  });

  it.each(["functions", "reference"])("db/%s stands as a directory and holds a regular file .gitkeep", (directory) => {
    expect(lstatSync(join(REAL_ROOT, directory)).isDirectory()).toBe(true);
    expect(lstatSync(join(REAL_ROOT, directory, ".gitkeep")).isFile()).toBe(true);
  });
});

describe("A.3 no file of the chain sets a password", () => {
  // The word, then a quote, a dollar-quote or null: a string in any of the server's spellings, or a password taken away.
  const SETS_A_PASSWORD = /\bpassword\s*(?:'|"|e'|u&'|\$\w*\$|null\b)/i;

  it("no file under db/schema, db/functions or db/reference holds the word password followed by a quote, a dollar-quote or null", () => {
    // The detector is seen to work first: it finds each spelling, and not the word in a sentence.
    for (const sets of ["password 'x'", "PASSWORD E'x'", "Password U&'x'", 'password "x"', "password $$x$$", "password $tag$x$tag$", "password NULL", "password\n  'x'"]) {
      expect(SETS_A_PASSWORD.test(sets), sets).toBe(true);
    }
    for (const says of ["-- no password is written in the chain", "passwords are minted by the install step", "password_encryption"]) {
      expect(SETS_A_PASSWORD.test(says), says).toBe(false);
    }
    const read: string[] = [];
    const setting: string[] = [];
    for (const directory of ["schema", "functions", "reference"]) {
      for (const entry of readdirSync(join(REAL_ROOT, directory), { withFileTypes: true })) {
        if (!entry.isFile()) continue;
        const name = `${directory}/${entry.name}`;
        read.push(name);
        if (SETS_A_PASSWORD.test(readFileSync(join(REAL_ROOT, directory, entry.name), "utf8"))) setting.push(name);
      }
    }
    // Nothing read proves nothing: the chain's two files are among what was read.
    expect(read).toEqual(expect.arrayContaining(["schema/0001-roles.sql", "schema/0002-os.sql", "functions/.gitkeep", "reference/.gitkeep"]));
    expect(setting).toEqual([]);
  });
});

describe("A.4 loginConnectionString reads the secret file", () => {
  const FOUR = { os_engine: "a".repeat(43), os_executor: "b".repeat(43), os_intake: "c".repeat(43), os_reader: "d".repeat(43) };

  /** A secret file of the case's own, holding this text. */
  function fileHolding(name: string, text: string): string {
    const path = join(scratch, name);
    writeFileSync(path, text, { mode: 0o600 });
    return path;
  }

  it("a file of the four gives each login the bench's own address with its role and its password", () => {
    const path = fileHolding("whole.json", JSON.stringify({ sysid: "7711370004733567015", logins: FOUR }));
    const bench = new URL(connectionString());
    for (const [role, password] of Object.entries(FOUR)) {
      const address = new URL(loginConnectionString(role as keyof typeof FOUR, path));
      expect(address.protocol).toBe(bench.protocol);
      expect(address.host).toBe(bench.host);
      expect(address.pathname).toBe(bench.pathname);
      expect(decodeURIComponent(address.username)).toBe(role);
      expect(decodeURIComponent(address.password) === password).toBe(true);
    }
  });

  const NO_SECRET: [string, string | undefined][] = [
    ["missing", undefined],
    ["not JSON", "os_engine=aaaa\n"],
    ["a JSON array", "[]\n"],
    ["without logins", JSON.stringify({ sysid: "7711370004733567015" })],
    ["logins not an object", JSON.stringify({ sysid: "7711370004733567015", logins: "os_engine" })],
    ["the password not a text", JSON.stringify({ sysid: "7711370004733567015", logins: { ...FOUR, os_engine: 42 } })],
    ["the password empty", JSON.stringify({ sysid: "7711370004733567015", logins: { ...FOUR, os_engine: "" } })],
  ];

  it.each(NO_SECRET)("a file %s → LoginsRefused, reason no-secret", async (what, text) => {
    const path = text === undefined ? join(scratch, "no-such-file.json") : fileHolding(`${what.replace(/\W+/g, "-")}.json`, text);
    const refusal = await refusalOf(LoginsRefused, () => loginConnectionString("os_engine", path));
    expect(refusal.reason).toBe("no-secret");
  });

  it("a file without the role → LoginsRefused, reason no-secret", async () => {
    const { os_reader: _left, ...three } = FOUR;
    const path = fileHolding("three.json", JSON.stringify({ sysid: "7711370004733567015", logins: three }));
    const refusal = await refusalOf(LoginsRefused, () => loginConnectionString("os_reader", path));
    expect(refusal.reason).toBe("no-secret");
  });
});
