import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// B36 · Block 3 — THE ONE-WAY WINDOW, held by the battery.
//
// CEO, 2026-08-24: "bundan sonra TEK BİR HARF DAHİ ŞİRKETİN VERİ TABANINA
// GİRMESİN!"  The construction side reaches the holding through one login that
// holds SELECT and nothing else, and the refusal is issued by PostgreSQL rather
// than by our code.
//
// WHY THIS FILE WAS REWRITTEN. The block was audited on 2026-08-24 and FAILED.
// The drill had fired 23 routes and refused 23, and had never tried the two that
// worked: creating a LARGE OBJECT, and turning a SEQUENCE — the one write
// PostgreSQL does not undo on ROLLBACK. The auditor's sentence is the standard
// this file now holds: "test yeşil, soru cevapsız kalmış" — the test was green
// and the question was left unanswered. So the battery no longer asks whether a
// list of statements was refused; it asks the CATALOGUE what the role can still
// do, class by class, and it re-opens both escapes for real before requiring
// them to be closed.
//
// WHY THE LIVE HALF RUNS AGAINST THE CONSTRUCTION ENGINE AND NOT THE COMPANY.
// tests/b36/battery-carries-no-company-key.test.ts forbids any file the battery
// loads from carrying a connectable address for the holding, and it is right:
// `pnpm test` must not hold the key to the CEO's database, not even a read-only
// one. The company's own drill is `pnpm b36:prove-window`, which after the audit
// executes NOTHING against the holding — it measures privilege out of the
// catalogue and nothing else.
//
// WHAT THE STATIC HALF EXISTS FOR. On 2026-08-24 the first version of the window
// took EXECUTE from PUBLIC on 85 SECURITY DEFINER functions and handed it back
// to EVERY role on the engine. On the construction engine that was exact; on the
// holding it was not, and `anon` — the role an unauthenticated browser gets —
// gained the right to call `control_records_purge` and `decide_approvals`. It
// was caught by the installer's own blast-radius photograph, undone from the
// holding's dated dump, and the rule was corrected to give each privilege back
// only to the roles that already held it. These tests fail if that correction
// is ever removed.

const REPO = process.cwd();
const WINDOW_SQL = join(REPO, "scripts/b36/company-one-way-window.sql");
const PKG = JSON.parse(readFileSync(join(REPO, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};

/** execFileSync throws everything the script printed away unless it is read back
 *  off the error — the mistake this row already made once. */
function runNode(args: string[]): string {
  try {
    return execFileSync("node", args, { cwd: REPO, encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string };
    return `${err.stdout ?? ""}\n${err.stderr ?? ""}`;
  }
}

// The packet filter holds two walls facing opposite ways, so every test that reads
// it reads ONE chain at a time — a rule that is right in one is wrong in the other.
const WALL_NFT = join(REPO, "scripts/construction/company-wall.nft");
const WALL_NFT_INSTALLED = "/usr/local/share/dxb-company-wall.nft";
function rulesOfChain(nft: string, chain: string): string[] {
  const i = nft.indexOf(`chain ${chain} {`);
  if (i < 0) return [];
  const j = nft.indexOf("\n  }", i);
  return nft.slice(i, j < 0 ? undefined : j).split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));
}

describe("B36 · Block 3 — the one-way window", () => {
  it("(1) the window's SQL gives each privilege back only to who already held it", () => {
    const sql = readFileSync(WINDOW_SQL, "utf8");

    // The correction itself: the set of grantees is MEASURED per object, from
    // who could already do the thing, rather than taken to be every role.
    expect(
      sql,
      "the per-object holder capture is gone — this is the shape that gave `anon` " +
        "the right to call every control function on the CEO's database",
    ).toMatch(/SELECT\s+array_agg\(r\.rolname[\s\S]*?has_function_privilege\(r\.rolname/);
    expect(sql).toMatch(/FOREACH\s+v_role\s+IN\s+ARRAY\s+coalesce\(v_holders/);

    // And the shape that caused it must not come back: a grant loop whose
    // grantee list is "every role that is not dxb_reader".
    const blanket = /FOR\s+v_role\s+IN\s*\n?\s*SELECT\s+rolname\s+FROM\s+pg_roles\s*\n?\s*WHERE\s+rolname\s+NOT\s+LIKE[^\n]*\n?\s*LOOP\s*\n?\s*EXECUTE\s+format\('GRANT/;
    expect(blanket.test(sql), "the blanket re-grant is back in the window's SQL").toBe(false);
  });

  it("(2) the seal and its proof are written from ONE sentence, and it covers the audited classes", () => {
    const sql = readFileSync(WINDOW_SQL, "utf8");

    // The audit's deeper finding: a seal and a proof that had drifted apart.
    // There is exactly one definition of "a function whose call can leave
    // something behind", and both the sealing loop and the closing assertion
    // interpolate it.
    const predicate = sql.match(/c_effectful CONSTANT text := \$flt\$([\s\S]*?)\$flt\$;/);
    expect(predicate, "c_effectful is gone — the seal and its proof can drift again").toBeTruthy();
    expect(
      (sql.match(/c_effectful\)/g) ?? []).length,
      "c_effectful must be interpolated by BOTH the sealing loop and the assertion",
    ).toBeGreaterThanOrEqual(2);

    // The two escapes the audit found, by name, inside that one sentence.
    expect(predicate![1], "the large-object family is not in the seal").toMatch(/\^lo_/);
    expect(predicate![1], "pg_notify is not in the seal").toContain("pg_notify");

    // Sequences — the write ROLLBACK does not undo — swept in every schema.
    expect(sql).toMatch(/has_sequence_privilege\('dxb_reader'/);
    expect(sql).toMatch(/the window can still turn a counter/);

    // Seven table verbs, not four.
    for (const verb of ["INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER", "MAINTAIN"]) {
      expect(sql, `${verb} is missing from the table seal`).toContain(`'${verb}'`);
    }

    // Every other room, and what does not exist yet.
    expect(sql).toMatch(/the window can still stand inside/);
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC/);

    // And it must still be a window.
    expect(sql).toMatch(/the window is blind/);
    expect(sql).toMatch(/nspname NOT IN \('pg_catalog','information_schema'\)/);
  });

  it("(3) the drills and the wall are committed and reachable as commands", () => {
    for (const f of [
      "scripts/b36/install-company-window.mjs",
      "scripts/b36/window-classes.mjs",
      "scripts/b36/prove-wall.mjs",
      "scripts/b36/wall-probe.mjs",
      "scripts/b36/withdraw-company-login.mjs",
      "scripts/b36/company-read-gateway.mjs",
      "scripts/b36/company-read-client.mjs",
      "scripts/b36/prove-window-preserves.mjs",
      "scripts/b36/prove-window-escapes.mjs",
      "scripts/b36/prove-forged-event.mjs",
      "scripts/b36/company-state-fingerprint.mjs",
      "scripts/b36/restore-company-privileges.mjs",
      "scripts/construction/run.sh",
      "scripts/construction/battery.sh",
    ]) {
      expect(existsSync(join(REPO, f)), `${f} is missing`).toBe(true);
    }
    for (const s of ["b36:window", "b36:prove-wall", "b36:prove-window-preserves",
                     "b36:prove-window-escapes", "b36:prove-forged-event"]) {
      expect(PKG.scripts[s], `package.json has no "${s}" script`).toBeTruthy();
    }
    // The drill whose question Block 3-bis replaced is DELETED, not kept beside
    // the new one. Two drills answering two versions of the same question is how
    // three audits ended up reading two different answers.
    expect(existsSync(join(REPO, "scripts/b36/prove-window.mjs")),
      "the superseded prove-window drill is back").toBe(false);
    expect(PKG.scripts["b36:prove-window"], "the superseded command is back").toBeFalsy();
  });

  it("(4) the wall's shape, held in the files themselves", () => {
    // The governance gate has NO second way to read the holding. The third audit
    // of 2026-08-24 found its fallback: `docker exec … psql -U postgres`, the
    // owner of every table in the company.
    // Measured on the CODE, not on the prose: this file explains the fallback it
    // lost, so the word "docker" appears in its comments and must not be what
    // the assertion reads.
    const gate = readFileSync(join(REPO, "scripts/governance/ledger-truth.mjs"), "utf8");
    expect(gate, "the governance gate can run a program again").not.toContain("node:child_process");
    expect(gate, "the governance gate can run a program again").not.toMatch(/execFileSync|spawnSync|spawn\(/);
    expect(gate, "the governance gate names a command again").not.toMatch(/["'`]docker/i);
    expect(gate, "the governance gate spells a company address again").not.toContain("54322");
    expect(gate, "the governance gate no longer fails closed").toContain("reads the holding NO other way");

    // The caller sends a NAME. The SQL behind it lives on the company's side, and
    // the gateway freezes its catalogue when it starts.
    const client = readFileSync(join(REPO, "scripts/b36/company-read-client.mjs"), "utf8");
    expect(client, "the read client learned how to send SQL").not.toMatch(/\bSELECT\b/);
    const gateway = readFileSync(join(REPO, "scripts/b36/company-read-gateway.mjs"), "utf8");
    expect(gateway, "the gateway stopped opening its connection read-only")
      .toContain("default_transaction_read_only=on");
    expect(gateway, "the gateway stopped wrapping its answers in a read-only transaction")
      .toContain("BEGIN READ ONLY");
    expect(gateway, "the gateway re-reads its catalogue while it runs").toContain("never again");

    // The sandbox is default-deny: the company's two doors are not in the list,
    // and there is no network to carry them.
    const wall = readFileSync(join(REPO, "scripts/construction/sandbox.sh"), "utf8");
    const allow = wall.slice(wall.indexOf("ALLOW=("), wall.indexOf(")", wall.indexOf("ALLOW=(")));
    expect(allow, "the company's database port is in the construction's allow list").not.toContain("54322");
    expect(allow, "the company's HTTP gateway is in the construction's allow list").not.toContain("54321");
    expect(wall, "the sandbox stopped taking its own network namespace").toContain("--unshare-net");
    expect(wall, "the sandbox stopped hiding the other processes on this machine").toContain("--unshare-pid");
    expect(wall, "the sandbox stopped dropping to the construction identity").toContain("setpriv --reuid");
    expect(wall, "the sandbox stopped keeping git out of the construction's reach")
      .toContain('--ro-bind "$REPO/.git"');
  });

  it("(6) the packet filter is a DESTINATION allow-list, and it never tests `skuid != 997`", () => {
    // Both halves of this test are an audit finding from 2026-08-24, written into
    // the battery so no future author can quietly undo either one.
    //
    // FINDING ONE — the wall named the two published port numbers and forbade
    // those. It was walked past in a single move, because the holding's database
    // also answers on its own container address (172.18.0.6 port 5432), and because
    // Docker rewrites the destination of every non-loopback local address in the
    // `nat` OUTPUT hook, which runs BEFORE the filter hook — so the host's own LAN
    // address on the published port had already become the container's address on
    // port 5432 before any port rule looked at it. A wall that names what it
    // forbids will always be shorter than the list of ways to spell an address, so
    // this one names what it ALLOWS.
    //
    // FINDING TWO — the wall let everyone else past with `meta skuid != 997 accept`.
    // A packet the kernel emits with no owning socket carries no skuid at all, so
    // that rule does not MATCH it and therefore does not accept it either: it fell
    // into the default-deny. Measured on this machine, the wall was destroying the
    // loopback replies of the CEO's own editor processes, ten packets in two idle
    // seconds, for every user on the machine.
    const nft = readFileSync(WALL_NFT, "utf8");

    // Read chain by chain. This file holds two walls facing opposite ways, and a
    // rule that is right in one of them is wrong in the other: the outward wall may
    // never name a port it forbids, and the inward one names nothing else.
    const outward = [...rulesOfChain(nft, "output"), ...rulesOfChain(nft, "construction")];
    const denies = outward.filter((l) => /\b(reject|drop)\b/.test(l));
    const allows = outward.filter((l) => /\baccept\b/.test(l));

    expect(denies.length, "the outward wall forbids nothing at all").toBeGreaterThan(0);
    for (const d of denies) {
      expect(d, `a rule forbids by port number — the shape that failed its audit: ${d}`)
        .not.toMatch(/dport/);
    }
    expect(denies.some((d) => /l4proto tcp/.test(d) && /reject/.test(d)),
      "the outward wall has no default-deny for TCP").toBe(true);
    expect(denies.some((d) => !/l4proto/.test(d) && /drop/.test(d)),
      "the outward wall lets through everything that is not TCP").toBe(true);

    // Measured on the RULES, never on the file: this file explains the trap in its
    // own comments, and a test that reads the prose cannot tell the warning from
    // the mistake.
    const ruleText = outward.join("\n");
    expect(ruleText, "the wall stopped examining the construction identity by name")
      .toMatch(/meta skuid 997 jump/);
    expect(ruleText, "the wall tests `skuid != 997`, which destroys ownerless packets for every user")
      .not.toMatch(/skuid\s*!=\s*997/);

    // Every door it opens is bound to a loopback destination. 127.0.0.0/8 is the
    // one address family Docker's DNAT leaves alone, so it is the only one where
    // what is written is what the kernel matches.
    for (const a of allows.filter((l) => /dport/.test(l))) {
      expect(a, `a door is opened to something that is not the loopback address: ${a}`)
        .toMatch(/(127\.0\.0\.0\/8|::1)/);
    }

    // And the file that is loaded is this one.
    expect(existsSync(WALL_NFT_INSTALLED),
      "the packet filter is not installed — run: bash scripts/construction/install-wall.sh").toBe(true);
    expect(readFileSync(WALL_NFT_INSTALLED, "utf8"),
      `${WALL_NFT_INSTALLED} has drifted from ${WALL_NFT}`).toBe(nft);
  });

  it("(7) the holding's own two doors are shut to the network, and this machine is not", () => {
    // The other half of the same audit, and it is not about the construction at all.
    // The Supabase CLI publishes the holding's database and API gateway on 0.0.0.0 —
    // every interface this machine owns — and the password behind that database is
    // the CLI's own documented local default. Measured 2026-08-24 from a container
    // on a different network, which is the nearest thing to another machine on the
    // wifi that can be produced without a second device:
    //
    //     192.168.178.44:54322   REACHABLE     the holding's database
    //     192.168.178.44:54321   REACHABLE     the holding's API gateway
    //
    // Changing the password was rejected on measurement, not on taste: the
    // repository's own canonical chain spells it in three named places, the live
    // `dxb_litellm` container connects to the holding with it, and `supabase start`
    // writes it back. The door is shut in the kernel instead, where no tool reopens
    // it by accident. The live proof is in prove-wall.mjs; this test guards the shape.
    const nft = readFileSync(WALL_NFT, "utf8");
    const front = rulesOfChain(nft, "company_front_door");

    // It must run BEFORE Docker rewrites the destination, or it would be looking for
    // a port that no longer exists by the time it sees the packet.
    expect(front.join("\n"), "the front door stopped running before Docker's address rewrite")
      .toMatch(/hook prerouting priority (mangle|-150)/);

    // This machine's own traffic is untouched.
    expect(front.some((l) => /iifname "lo" return/.test(l)),
      "the front door stopped letting this machine's own loopback past").toBe(true);

    // And both of the holding's doors are shut to everything else.
    // Both engines. The construction's own two were shut on 2026-08-24 as well: it
    // carries no holding row, but nothing on this machine reaches it by any address
    // but the loopback one, so open to the network it bought nothing and left a
    // PostgreSQL with a documented default password standing in the open.
    for (const door of ["54322", "54321", "54422", "54421"]) {
      expect(front.some((l) => l.includes(`dport ${door}`) && /\bdrop\b/.test(l)),
        `door ${door} is open to the network`).toBe(true);
    }
  });

  it("(5) the wall that runs is ROOT-OWNED, and the repository's copy has not drifted from it", () => {
    // A wall the construction can rewrite is a suggestion. The program that
    // actually runs lives outside the repository and belongs to root; this file
    // is its reviewable source, and the two must be identical.
    const INSTALLED = "/usr/local/sbin/dxb-construction-sandbox";
    expect(existsSync(INSTALLED),
      `the wall is not installed — run: bash scripts/construction/install-wall.sh`).toBe(true);

    // Inside the sandbox this test cannot see uid 0: the user namespace maps the
    // real root to `nobody` (65534). What it CAN see is the thing that matters —
    // the program is not owned by whoever is running it, and nobody but its owner
    // may write it. That the owner is really root is measured on the host side,
    // by prove-wall.mjs, where uid 0 is uid 0.
    const st = statSync(INSTALLED);
    expect(st.uid, `${INSTALLED} is owned by the identity that runs inside it`)
      .not.toBe(process.getuid?.());
    expect(st.mode & 0o022, `${INSTALLED} is writable by someone other than its owner`).toBe(0);

    expect(readFileSync(INSTALLED, "utf8"),
      "the installed wall and scripts/construction/sandbox.sh have drifted apart — "
      + "re-install it with scripts/construction/install-wall.sh, or explain the difference")
      .toBe(readFileSync(join(REPO, "scripts/construction/sandbox.sh"), "utf8"));

    // And the door in the repository is thin on purpose: it must not carry a
    // second definition of the wall beside the root-owned one.
    const door = readFileSync(join(REPO, "scripts/construction/run.sh"), "utf8");
    expect(door, "the door stopped calling the installed wall").toContain(INSTALLED);
    expect(door, "the door grew a wall definition of its own").not.toContain("bwrap");
  });
});
