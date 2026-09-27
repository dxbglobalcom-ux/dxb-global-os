// B56 — THE DRAWER'S OLDER DEFECTS, REPAIRED WHERE THEY LIVE (lane C of the older-defect list, 2026-09-27).
//
// Each case runs the real script, offline, on a scratch copy — nothing here reaches the network, his
// Chrome profile or the real hidden-Chrome unit:
//
//   sources.py        reject() let a search engine's ad click through (Startpage's admarketplace bridge,
//                     Google's aclk, Bing's aclick, AdSense for Search); it is furniture now.
//   platforms.py      reject(), the filter on the run path (evidence.py from-ground, kapsama.py), kept its
//                     own copy of those lists and let the ad clicks through; it gives sources.reject's
//                     verdict now.
//   profile-sync.sh   a test root still stopped and started the REAL unit (systemctl --user stop/start
//                     dxb-research-chrome, measured with a PATH stand-in); a copy interrupted by SIGTERM
//                     left his unstripped Preferences in Default; a cookie store that could not be read
//                     was reported as "kopyada cerez yok", an absent cookie.
//   fetch.py          a door that timed out was killed at its `sh -c` only — its tree lived on. Measured
//                     2026-09-27 08:38: 57 orphaned `scrapling extract stealthy-fetch` trees, RAM 27,951 MB
//                     used, swap 16,007 of 16,383 MB. And since a door now runs in its own session, the
//                     callers' `timeout N fetch.py` must still end it: the CLI passes the signal on.

import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Bench, makeBench, SKILL } from "./engine-copy.js";

const SCRIPTS = join(SKILL, "scripts");
let tmp = "";
let b: Bench;
beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "dxb-b56-drawer-"));
  b = makeBench();
});
afterAll(() => {
  rmSync(tmp, { recursive: true, force: true });
  b?.dispose();
});

const py = (code: string, ...args: string[]) =>
  execFileSync("python3", ["-B", "-c", code, SCRIPTS, ...args], {
    encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
  });

/** A marker no other process on the machine carries: `sleep 30.<digits>`. */
const marker = () => `30.${Date.now() % 1e8}${Math.floor(Math.random() * 1e4)}`;
const survivors = (m: string) => {
  const r = spawnSync("pgrep", ["-f", `sleep ${m}`], { encoding: "utf8" });
  return (r.stdout ?? "").split("\n").filter(Boolean);
};

describe("sources.py — an ad click is not a source", () => {
  it("rejects the search engines' ad-click addresses as furniture and keeps the pages beside them", () => {
    const out = py(
      "import sys, json; sys.path.insert(0, sys.argv[1]); import sources; " +
        "print(json.dumps({u: sources.reject(u) for u in sys.argv[2:]}))",
      "https://bridge.admarketplace.net/x?y=1",
      "https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChc",
      "https://www.google.com/aclk?sa=l&ai=DChc",
      "https://www.bing.com/aclick?ld=e8&u=aHR0",
      "https://syndicatedsearch.goog/afs/ads?q=x",
      "https://admarketplace.com/about",
      "https://startpagehq.com/compare/notion-vs-obsidian",
      "https://www.bing.com/aclicks-guide",
    );
    const why = JSON.parse(out) as Record<string, string | null>;
    const ads = Object.entries(why).slice(0, 5);
    const pages = Object.entries(why).slice(5);
    expect(ads.filter(([, w]) => w !== "furniture"), out).toEqual([]);
    expect(pages.filter(([, w]) => w !== null), out).toEqual([]);
  });
});

describe("profile-sync.sh — a scratch root never touches the real unit, a stop never leaves his settings", () => {
  /** A PATH stand-in for systemctl that writes down every call, and a curl that reaches nothing. */
  const standIns = (dir: string) => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "systemctl"), `#!/bin/sh\necho "systemctl $*" >> "${dir}/systemctl.log"\n`);
    writeFileSync(join(dir, "curl"), "#!/bin/sh\nexit 7\n");
    for (const f of ["systemctl", "curl"]) chmodSync(join(dir, f), 0o755);
    return dir;
  };
  const HIS = '{"account_info":[{"email":"his@x"}],"google":{"services":{"account_id":"1"}},' +
    '"profile":{"password_hash_data_list":[1],"name":"p"},"signin":{"allowed":true}}';

  it("--strip with DXB_SYNC_ROOT set strips the scratch copy and never calls systemctl", () => {
    const bin = standIns(join(tmp, "c-bin"));
    const root = join(tmp, "c-root");
    mkdirSync(join(root, "Default"), { recursive: true });
    writeFileSync(join(root, "Default", "Preferences"), HIS);
    const r = spawnSync("bash", [join(SCRIPTS, "profile-sync.sh"), "--strip"], {
      encoding: "utf8", timeout: 60_000,
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, DXB_SYNC_ROOT: root, PYTHONDONTWRITEBYTECODE: "1" },
    });
    const said = `${r.stdout}\n${r.stderr}`;
    expect(r.status, said).toBe(0);
    // before the repair this log held `--user stop dxb-research-chrome` and `--user start …`
    expect(existsSync(join(bin, "systemctl.log")), existsSync(join(bin, "systemctl.log"))
      ? readFileSync(join(bin, "systemctl.log"), "utf8") : "").toBe(false);
    expect(said).toMatch(/birimine dokunulmaz/);
    expect(readFileSync(join(root, "Default", "Preferences"), "utf8")).not.toMatch(/his@x|account_id|password_hash/);
  }, 60_000);

  /** The copy's script, reading a scratch "Profile 5" instead of his: the one line that names it is replaced. */
  const copyReadingFrom = (src: string) => {
    const p = join(b.engine, "scripts", "profile-sync.sh");
    const text = readFileSync(p, "utf8");
    const line = /^SRC="[^"\n]*"$/gm;
    expect(text.match(line)?.length, "the one line that names his profile").toBe(1);
    writeFileSync(p, text.replace(line, `SRC="${src}"`));
    return p;
  };

  it("a copy stopped by SIGTERM in the middle leaves no half copy and none of his settings in Default", () => {
    const src = join(tmp, "a-src");
    mkdirSync(src, { recursive: true });
    writeFileSync(join(src, "Preferences"), HIS);
    const root = join(tmp, "a-root");
    mkdirSync(join(root, "Default"), { recursive: true });
    writeFileSync(join(root, "Default", "Preferences"), '{"profile":{"name":"the previous, stripped copy"}}');
    const bin = standIns(join(tmp, "a-bin"));
    // an rsync that lays his Preferences down in the destination and is still copying when the stop comes
    writeFileSync(join(bin, "rsync"), `#!/bin/sh\nfor last; do :; done\ncp "${src}/Preferences" "$last"\nsleep 30\n`);
    chmodSync(join(bin, "rsync"), 0o755);
    const script = copyReadingFrom(src);
    const r = spawnSync("timeout", ["-s", "TERM", "3", "bash", script], {
      encoding: "utf8", timeout: 60_000,
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, DXB_SYNC_ROOT: root, PYTHONDONTWRITEBYTECODE: "1" },
    });
    const said = `${r.stdout}\n${r.stderr}`;
    expect(said).toMatch(/SIGTERM ile kesildi/);
    expect(existsSync(join(root, "Default.new")), said).toBe(false);
    const prefs = join(root, "Default", "Preferences");
    // on HEAD this file WAS his: {"account_info":[{"email":"his@x"}],…}
    expect(existsSync(prefs) ? readFileSync(prefs, "utf8") : "", said).not.toMatch(/his@x/);
    expect(existsSync(join(bin, "systemctl.log"))).toBe(false);
  }, 60_000);

  it("--check says a cookie store that could not be read is unread, not empty", () => {
    const script = copyReadingFrom(join(tmp, "no-such-profile"));
    // the copy is asked through the engine copy's hidden.py; the bench points it at port 1, where nothing listens
    const r = spawnSync("bash", [script, "--check"], {
      encoding: "utf8", timeout: 60_000, env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    });
    const verdict = (r.stdout ?? "").split("\n").find((l) => l.startsWith("OTURUM KORUMASI:")) ?? "";
    expect(r.status, r.stdout + r.stderr).toBe(1);
    expect(verdict).toMatch(/Profile 5'te cerez okunamadi: /);
    expect(verdict).toMatch(/kopyada cerez okunamadi: /);
    expect(verdict).not.toMatch(/cerez yok/);
    expect(verdict).toMatch(/oturumu bilinmiyor/);
  }, 60_000);
});

describe("fetch.py — a door that is stopped takes its whole tree with it", () => {
  it("a door that outlives its timeout is ended with every process under it", () => {
    const m = marker();
    try {
      const t0 = Date.now();
      const out = py(
        "import sys, json; sys.path.insert(0, sys.argv[1]); import fetch; " +
          "print(json.dumps(fetch._sh(sys.argv[2], 1)))",
        `sh -c 'sleep ${m} & sleep ${m}'`,
      );
      expect(JSON.parse(out)).toEqual([124, "", "timeout"]);
      expect(Date.now() - t0).toBeLessThan(10_000);
      // before the repair: the inner sh and both sleeps were still there
      expect(survivors(m)).toEqual([]);
    } finally {
      spawnSync("pkill", ["-f", `sleep ${m}`]);
    }
  }, 30_000);

  it("`timeout N fetch.py` — the callers' stop — still ends the door that is running", () => {
    const m = marker();
    const door = join(tmp, "fake-scrapling");
    writeFileSync(door, `#!/bin/sh\nsleep ${m} &\nsleep ${m}\n`);
    chmodSync(door, 0o755);
    try {
      // doors 1 and 2 answer at once for an address that is neither a video nor a PDF; door 3 hangs
      const r = spawnSync("timeout", ["3", "python3", join(SCRIPTS, "fetch.py"), "https://example.invalid/page",
        "--timeout", "30", "--stop-at", "3"], {
        encoding: "utf8", timeout: 30_000,
        env: { ...process.env, DXB_SCRAPLING: door, DXB_RESEARCH_RUN: "dxb-no-such-run", PYTHONDONTWRITEBYTECODE: "1" },
      });
      expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(124);
      expect(survivors(m)).toEqual([]);
    } finally {
      spawnSync("pkill", ["-f", `sleep ${m}`]);
    }
  }, 30_000);
});

describe("platforms.py — the run path refuses the same ad clicks, by sources.py's rule", () => {
  it("platforms.reject gives sources.reject's verdict on the ad clicks and keeps the page beside them", () => {
    const out = py(
      "import sys, json; sys.path.insert(0, sys.argv[1]); import sources, platforms; " +
        "print(json.dumps([[sources.reject(u), platforms.reject(u)] for u in sys.argv[2:]]))",
      "https://bridge.admarketplace.net/x?y=1",
      "https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChc",
      "https://www.bing.com/aclick?ld=e",
      "https://www.admarketplace.com/about",
    );
    // on HEAD's platforms.py the second column read null, null, null, null
    expect(JSON.parse(out), out).toEqual([
      ["furniture", "furniture"], ["furniture", "furniture"], ["furniture", "furniture"], [null, null],
    ]);
  });
});

// fetch.py --no-browser (lane A2, the fresh verifier's finding of 2026-09-27): the flag — "for a run that must not use the
// hidden research Chrome" (sweep.sh) — withheld the two browser doors and still walked opencli-reader, whose reddit, twitter,
// youtube and zhihu readers bin/opencli sends to a window of that Chrome. Which readers drive it is asked of opencli's own
// manifest; this case hands fetch.py an installed opencli whose manifest is the seven readers' entries of opencli 1.8.7's
// (fixtures/opencli/cli-manifest.json), so the opencli on this machine is not what is measured.
describe("fetch.py — --no-browser keeps shut every door that can reach the hidden Chrome", () => {
  it("chain_for(True) leaves the opencli reader out for an X, Reddit, YouTube or Zhihu address and keeps it for the API readers; chain_for(False) is the whole chain", () => {
    const pkg = join(tmp, "opencli-pkg");
    mkdirSync(join(pkg, "bin"), { recursive: true });
    writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "@jackwener/opencli", version: "1.8.7" }));
    writeFileSync(join(pkg, "cli-manifest.json"), readFileSync(join(import.meta.dirname, "fixtures", "opencli", "cli-manifest.json")));
    writeFileSync(join(pkg, "bin", "opencli"), "#!/bin/sh\nexit 0\n");
    chmodSync(join(pkg, "bin", "opencli"), 0o755);
    const urls = {
      twitter: "https://x.com/someone/status/1234567890", reddit: "https://www.reddit.com/r/LocalLLaMA/comments/abc123/title/",
      youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", zhihu: "https://www.zhihu.com/question/12345678",
      hackernews: "https://news.ycombinator.com/item?id=4242", v2ex: "https://www.v2ex.com/t/4242",
      stackoverflow: "https://stackoverflow.com/questions/4242/a-question",
    };
    const r = spawnSync("python3", ["-B", "-c",
      "import sys, json; sys.path.insert(0, sys.argv[1]); import fetch; u = json.loads(sys.argv[2]); " +
        "names = lambda c: [n for n, _ in c]; " +
        "print(json.dumps({'chain': names(fetch.CHAIN), 'off': {k: names(fetch.chain_for(False, v)) for k, v in u.items()}, " +
        "'on': {k: names(fetch.chain_for(True, v)) for k, v in u.items()}}))",
      SCRIPTS, JSON.stringify(urls)], {
      encoding: "utf8", env: { ...process.env, PATH: `${join(pkg, "bin")}:${process.env.PATH}`, PYTHONDONTWRITEBYTECODE: "1" },
    });
    expect(r.status, r.stderr).toBe(0);
    const got = JSON.parse(r.stdout) as { chain: string[]; off: Record<string, string[]>; on: Record<string, string[]> };
    const REACH = ["opencli-reader", "browser-signed-in", "playwright"];     // the doors that can reach the hidden Chrome
    expect(got.chain).toEqual(expect.arrayContaining(REACH));
    // before the repair: ["opencli-reader"] for all seven
    for (const k of ["twitter", "reddit", "youtube", "zhihu"]) expect(got.on[k].filter((d) => REACH.includes(d)), k).toEqual([]);
    for (const k of ["hackernews", "v2ex", "stackoverflow"]) {
      expect(got.on[k].filter((d) => REACH.includes(d)), k).toEqual(["opencli-reader"]);
    }
    for (const k of Object.keys(urls)) expect(got.off[k], k).toEqual(got.chain);
  });
});

// hidden.py and the desktop's login keyring (lane E2, 2026-09-27): while the login collection is locked the hidden Chrome
// cannot decrypt its cookies, and every read hung until `Page.navigate: no answer in 30s`. hidden.py asks the secret service
// first. DXB_BUSCTL puts a stand-in in busctl's place, and the port is the bench's dead one: no Chrome is reached either way.
describe("hidden.py — a locked login keyring is named at once, not waited out", () => {
  /** A busctl stand-in that writes down how it was asked and answers the Locked property with `answer`. */
  const busctl = (name: string, answer: string) => {
    const p = join(tmp, name);
    writeFileSync(p, `#!/bin/sh\necho "$*" >> "${p}.log"\necho "${answer}"\n`);
    chmodSync(p, 0o755);
    return p;
  };
  const read = (bus: string) => {
    const t0 = Date.now();
    const r = spawnSync("python3", [join(SCRIPTS, "hidden.py"), "read", "https://www.quora.com/search?q=x", "--timeout", "40"], {
      encoding: "utf8", timeout: 30_000,
      env: { ...process.env, DXB_BUSCTL: bus, DXB_HIDDEN_PORT: "1", PYTHONDONTWRITEBYTECODE: "1" },
    });
    return { code: r.status, out: r.stdout, err: r.stderr, ms: Date.now() - t0 };
  };

  it("`b true`: its one line and code 1 within 6 s, the Chrome never asked; `b false`: the old path, down on the dead port", () => {
    const locked = busctl("busctl-locked", "b true");
    const r = read(locked);
    // the port is never asked: asking it prints the other line, below
    expect(r.err, r.out).toBe("gizli Chrome okunamaz: giris anahtar kasasi kilitli (login keyring locked) — yalniz CEO'nun "
      + "sifresi acar; Chrome cerezlerini cozemez\n");
    expect(r.code).toBe(1);
    expect(r.out).toBe("");
    expect(r.ms).toBeLessThan(6_000);
    expect(readFileSync(`${locked}.log`, "utf8")).toBe("--user get-property org.freedesktop.secrets "
      + "/org/freedesktop/secrets/collection/login org.freedesktop.Secret.Collection Locked\n");
    const open = read(busctl("busctl-open", "b false"));
    expect(open.code, open.err).toBe(69);
    expect(open.err).toMatch(/^gizli arastirma Chrome'u kapali: 127\.0\.0\.1:1 cevap vermiyor/);
  }, 30_000);
});
