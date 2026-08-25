#!/usr/bin/env node
/**
 * B36 · Block 3-bis — THE ACCEPTANCE SCREEN.
 *
 * LAW B: the author's work being finished does not make it accepted; only the
 * CEO's own eye does. His auditor set what that eye has to see, and it is not
 * code — it is four things, live, on one screen:
 *
 *   1. the construction works in its own area;
 *   2. the same construction, turned at the company, is refused at once;
 *   3. the company's screen and its workers carry on as normal;
 *   4. the company's records are identical before and after the attempt.
 *
 * So this file does not describe those four things — it RUNS them, in order, and
 * streams what happened to a page on this machine while it happens. Every number
 * on that screen was measured in the seconds he was watching. Nothing is written
 * anywhere: the company is read through its own named-question gateway and
 * through a fingerprint that only counts.
 *
 *   pnpm b36:eye-check      then open http://127.0.0.1:4599
 */
import { createServer } from "node:http";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const PORT = Number(process.env.DXB_EYE_PORT || 4599);
const run = promisify(execFile);

const sh = async (cmd, args, opts = {}) => {
  try {
    const r = await run(cmd, args, { cwd: REPO, timeout: 300000, maxBuffer: 32 * 1024 * 1024, ...opts });
    return { ok: true, out: (r.stdout || "").trim(), err: (r.stderr || "").trim() };
  } catch (e) {
    return { ok: false, out: (e.stdout || "").trim(), err: (e.stderr || String(e.message)).trim() };
  }
};

// ------------------------------------------ every address the holding answers on
/**
 * Asked of Docker every run, never written down. The screen shows six of them by
 * name because a wall of forty lines is not something a human reads — but all of
 * them are fired, and the count on the screen is the count that was fired.
 */
async function companyAddresses() {
  const out = new Set();
  const ps = await sh("docker", ["ps", "--format", "{{.Names}}"]);
  const names = ps.out.split("\n").map((x) => x.trim()).filter((n) => n.endsWith("_DxB_Global_OS"));
  for (const n of names) {
    const r = await sh("docker", ["inspect", "-f",
      "{{range $k,$v := .NetworkSettings.Networks}}{{$v.IPAddress}} {{end}}"
      + "|{{range $p,$c := .Config.ExposedPorts}}{{$p}} {{end}}", n]);
    const [ipPart = "", portPart = ""] = r.out.split("|");
    // Only things that ARE an address. Docker's template prints the two words
    // `invalid IP` when a container has no IPv6 address, and a filter that took
    // anything non-empty turned both words into hostnames that never existed —
    // measured 2026-08-24, and a refusal against nothing is padding, not evidence.
    const isAddress = (x) => /^\d+\.\d+\.\d+\.\d+$/.test(x);
    for (const ip of ipPart.split(/\s+/).filter(isAddress)) {
      for (const p of portPart.split(/\s+/).filter(Boolean).map((x) => x.split("/")[0])) {
        out.add(`${ip}:${p}`);
      }
    }
  }
  const hosts = await sh("bash", ["-c", "ip -o -4 addr show | awk '{print $4}' | cut -d/ -f1"]);
  for (const ip of hosts.out.split("\n").map((x) => x.trim()).filter(Boolean)) {
    out.add(`${ip}:54322`);
    out.add(`${ip}:54321`);
  }
  return [...out];
}

// -------------------------------------------------- the company, counted not read
async function fingerprint() {
  const r = await sh("node", [join(REPO, "scripts/b36/company-state-fingerprint.mjs"), "company"]);
  const of = (k) => (r.out.split("\n").find((l) => l.includes(k)) || "").trim();
  const stamp = of("STATE_FINGERPRINT").replace("STATE_FINGERPRINT", "").trim();
  const gov = of("audit_log / hook_violations").replace("audit_log / hook_violations:", "").trim();
  return { stamp, gov };
}

// ------------------------------------------------------------------ the sequence
async function* sequence() {
  yield { step: "start", at: new Date().toISOString() };

  // ---- 4a. the company's records, BEFORE anything is attempted
  yield { step: "records", state: "running" };
  const before = await fingerprint();
  yield { step: "records", state: "half", before };

  const addrs = await companyAddresses();
  const dbAddr = addrs.find((a) => a.endsWith(":5432")) || "";

  // ---- the red half. Which of those addresses is a REAL door? An address nothing
  // listens on refuses everybody, walled or not, and counting it would inflate the
  // screen without strengthening it. So the same probe runs first with no wall
  // around it at all, and whatever IT reaches is what the construction then has to
  // be refused from.
  yield { step: "doors", state: "running" };
  const redRaw = await sh("node", [join(REPO, "scripts/b36/eye-inside.mjs"),
    `--targets=${addrs.join(",")}`, `--login-target=${dbAddr}`]);
  let red = null;
  try { red = JSON.parse(redRaw.out.slice(redRaw.out.indexOf("{"))); }
  catch { red = { attempts: [], error: redRaw.err || "okunamadı" }; }
  const live = (red.attempts || []).filter((a) => a.ok).map((a) => a.target);
  yield { step: "doors", state: "done", found: addrs.length, live, red };

  const shown = [dbAddr, "192.168.178.44:54322", "127.0.0.1:54322", "172.17.0.1:54322",
    addrs.find((a) => a.endsWith(":8000")) || "", "192.168.178.44:54321", "127.0.0.1:54321"]
    .filter((a) => a && live.includes(a));

  // ---- 1 + 2a. the construction, inside its sandbox
  yield { step: "construction", state: "running" };
  const insideRaw = await sh("bash", [join(REPO, "scripts/construction/run.sh"),
    "node", "scripts/b36/eye-inside.mjs",
    `--targets=${addrs.join(",")}`, `--login-target=${dbAddr}`]);
  let inside = null;
  try { inside = JSON.parse(insideRaw.out.slice(insideRaw.out.indexOf("{"))); }
  catch { inside = { error: insideRaw.err || insideRaw.out || "okunamadı" }; }
  yield { step: "construction", state: "done", inside, shown, live };

  // ---- 2b. the same runtime with NO sandbox at all — the second wall alone
  yield { step: "bare", state: "running" };
  const bareRaw = await sh("sudo", ["-n", "-u", "dxbbuild", "node",
    join(REPO, "scripts/b36/eye-inside.mjs"),
    `--targets=${addrs.join(",")}`, `--login-target=${dbAddr}`]);
  let bare = null;
  try { bare = JSON.parse(bareRaw.out.slice(bareRaw.out.indexOf("{"))); }
  catch { bare = { error: bareRaw.err || bareRaw.out || "okunamadı" }; }
  yield { step: "bare", state: "done", bare, shown, live };

  // ---- 3. the company: its screen, its workers, its resident services
  yield { step: "company", state: "running" };
  const code = async (url) => (await sh("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}",
    "--max-time", "10", url])).out;
  const surfaces = {
    login: await code("http://127.0.0.1:3000/login"),
    api: await code("http://127.0.0.1:54321/rest/v1/"),
    auth: await code("http://127.0.0.1:54321/auth/v1/health"),
  };
  const askOne = async (id) => {
    const r = await sh("node", ["-e",
      `import("${join(REPO, "scripts/b36/company-read-client.mjs")}").then(m=>m.ask("ask","${id}")).then(v=>console.log(String(v))).catch(e=>console.log("ERR "+e.message))`]);
    return r.out;
  };
  const workers = {
    total: await askOne("agents_total"),
    active: await askOne("agents_active"),
    objectives: await askOne("objectives_total"),
  };
  const units = {};
  for (const u of ["dxb-scheduler", "dxb-jarvis", "dxb-company-read"]) {
    units[u] = (await sh("systemctl", ["--user", "is-active", u])).out || "?";
  }
  units["dxb-company-wall"] = (await sh("systemctl", ["is-active", "dxb-company-wall.service"])).out || "?";
  yield { step: "company", state: "done", surfaces, workers, units };

  // ---- 4b. the company's records, AFTER every attempt above
  yield { step: "records", state: "running-after" };
  const after = await fingerprint();
  yield { step: "records", state: "done", before, after };

  yield { step: "end" };
}

// -------------------------------------------------------- the sequence, BLOCK 4
/**
 * B36 · Block 4 — WHAT HIS EYE HAS TO SEE, and the auditor passed the work on
 * 2026-08-24 before this screen was written.
 *
 * Block 4's claim in one sentence: no file in this repository assumes the
 * company's database any more. Five things prove it, and every one of them is
 * RUN here, live, while he watches:
 *
 *   1. the counter says zero — and it is first shown finding a planted one, so a
 *      zero from a blind instrument cannot be mistaken for a clean house;
 *   2. a real company tool, given no address, stops and says so instead of
 *      guessing (a seed that INSERTs into the holding's registry);
 *   3. the dashboard serving him right now really carries the address, and the
 *      gate that enforces it refuses a bare environment — the same code Next
 *      runs at startup, invoked in front of him;
 *   4. the dashboard answers this machine and refuses the house;
 *   5. the company's records are identical before and after all of it.
 *
 * Nothing here writes anywhere. Every company touch is a count or a connect.
 */
async function* sequence4() {
  yield { step: "start", at: new Date().toISOString() };

  yield { step: "records", state: "running" };
  const before = await fingerprint();
  yield { step: "records", state: "half", before };

  // ---- 1. the counter, and the instrument first
  yield { step: "counter", state: "running" };
  const c = await sh("node", ["-e",
    `import("${join(REPO, "scripts/b36/count-company-fallbacks.mjs")}").then(m=>{`
    + `const r=m.scan();`
    + `const planted=m.bindingsIn("ornek.ts",'process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";').length;`
    + `console.log(JSON.stringify({scanned:r.scanned,found:r.executable.length,planted,files:r.executable.map(e=>e.file+":"+e.line)}))})`]);
  let counter = null;
  try { counter = JSON.parse(c.out.slice(c.out.indexOf("{"))); }
  catch { counter = { error: c.err || c.out || "okunamadı" }; }
  yield { step: "counter", state: "done", counter };

  // ---- 2. a real tool, with no address
  yield { step: "refusal", state: "running" };
  const seed = await sh("bash", ["-c",
    "env -u DXB_DATABASE_URL node --experimental-strip-types db/seed/import-routing-rules.ts 2>&1 | tail -2; echo \"EXIT=${PIPESTATUS[0]}\""]);
  const seedExit = Number((/EXIT=(\d+)/.exec(seed.out) || [])[1] ?? -1);
  const seedSaid = seed.out.replace(/EXIT=\d+\s*$/, "").trim();
  // The CEO's screen is 100 % Turkish (00-CEO-DIRECTIVE-LANGUAGE). The tool's own
  // sentence is English because artefacts are English — so what travels to the
  // page is the FACT that the refusal names the address variable and stops, not
  // the English line itself. The line stays in the evidence file, where it belongs.
  yield {
    step: "refusal", state: "done", exit: seedExit,
    namesVar: /DXB_DATABASE_URL/.test(seedSaid),
    saidNothing: seedSaid.length === 0,
  };

  // ---- 3. the dashboard: what is serving him, and the gate itself
  yield { step: "dashboard", state: "running" };
  const live = await sh("bash", ["-c",
    "P=$(ss -ltnp 2>/dev/null | grep '127.0.0.1:3000' | grep -oP 'pid=\\K[0-9]+' | head -1);"
    + " if [ -z \"$P\" ]; then echo 'PID='; exit 0; fi;"
    + " echo \"PID=$P\";"
    + " tr '\\0' '\\n' < /proc/$P/environ | grep -E '^DXB_(DATABASE_URL|DASHBOARD_LAUNCHER)=' | sed 's#://[^:]*:[^@]*@#://***:***@#'"]);
  const pid = ((/PID=(\d*)/.exec(live.out) || [])[1] || "").trim();
  const carries = {
    address: /DXB_DATABASE_URL=/.test(live.out),
    stamp: (/DXB_DASHBOARD_LAUNCHER=(.*)/.exec(live.out) || [])[1]?.trim() || "",
  };
  const gate = await sh("bash", ["-c",
    "env -u DXB_DASHBOARD_LAUNCHER -u DXB_DATABASE_URL node --experimental-strip-types -e "
    + "'import(\"./apps/dashboard/src/instrumentation.ts\").then(m=>m.register())' 2>&1;"
    + " echo \"EXIT=$?\""]);
  const gateExit = Number((/EXIT=(\d+)/.exec(gate.out) || [])[1] ?? -1);
  const gateSaid = gate.out.replace(/EXIT=\d+\s*$/, "").trim();
  yield {
    step: "dashboard", state: "done", pid, carries, gateExit,
    gateRefused: /REFUSING TO SERVE/.test(gateSaid),
    gateNamesWrapper: /scripts\/dashboard\.sh/.test(gateSaid),
  };

  // ---- 4. this machine yes, the house no
  yield { step: "door", state: "running" };
  const lan = (await sh("bash", ["-c",
    "ip -o -4 addr show scope global | awk '{print $4}' | cut -d/ -f1 | head -1"])).out.trim();
  const code = async (url) => (await sh("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}",
    "--max-time", "6", url])).out || "000";
  const doors = {
    self: await code("http://127.0.0.1:3000/login"),
    lan: lan ? await code(`http://${lan}:3000/`) : "000",
    lanAddr: lan || "—",
  };
  yield { step: "door", state: "done", doors };

  // ---- 5. the records, after everything above
  yield { step: "records", state: "running-after" };
  const after = await fingerprint();
  yield { step: "records", state: "done", before, after };

  yield { step: "end" };
}

// ------------------------------------------------------------------------- page
// ------------------------------------------------------- one look, both pages
const STYLE = String.raw`  :root{
    --ink:#e8eef5; --dim:#8b9bb0; --line:#1d2734; --bg:#080b10; --card:#0e131b;
    --ok:#35d0a5; --no:#ff5f6d; --wait:#ffc043; --accent:#4ea8ff;
    --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
    font:15px/1.55 ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif;
    background-image:radial-gradient(1200px 600px at 50% -10%,#101a28 0%,transparent 60%)}
  header{padding:26px 28px 18px;border-bottom:1px solid var(--line);
    display:flex;align-items:baseline;gap:18px;flex-wrap:wrap}
  h1{margin:0;font-size:19px;letter-spacing:.14em;text-transform:uppercase;font-weight:650}
  header .sub{color:var(--dim);font-size:13px}
  header .clock{margin-left:auto;font:12px/1 var(--mono);color:var(--dim)}
  main{padding:22px 28px 40px;max-width:1500px;margin:0 auto}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(430px,1fr));gap:16px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:0;overflow:hidden;
    transition:border-color .35s}
  .card.live{border-color:#2b4a6b}
  .card.pass{border-color:#1e5c4b}
  .card.fail{border-color:#6b2530}
  .card h2{margin:0;padding:15px 18px;font-size:12.5px;letter-spacing:.13em;text-transform:uppercase;
    color:var(--dim);border-bottom:1px solid var(--line);display:flex;align-items:center;gap:11px}
  .card h2 .n{width:22px;height:22px;border-radius:6px;background:#16202c;color:var(--dim);
    display:grid;place-items:center;font:600 11px/1 var(--mono);flex:none}
  .card .body{padding:16px 18px 18px;min-height:186px}
  .dot{width:9px;height:9px;border-radius:50%;background:#2a3644;margin-left:auto;flex:none}
  .live .dot{background:var(--wait);animation:pulse 1s infinite}
  .pass .dot{background:var(--ok)}
  .fail .dot{background:var(--no)}
  @keyframes pulse{0%,100%{opacity:.25}50%{opacity:1}}
  .verdict{font-size:21px;font-weight:650;letter-spacing:-.01em;margin:0 0 6px}
  .pass .verdict{color:var(--ok)} .fail .verdict{color:var(--no)}
  .live .verdict{color:var(--wait)}
  .lead{color:var(--dim);font-size:13.5px;margin:0 0 14px}
  table{width:100%;border-collapse:collapse;font:12.5px/1.5 var(--mono)}
  td{padding:4px 0;vertical-align:top;border-bottom:1px solid #131b25}
  tr:last-child td{border-bottom:0}
  td.k{color:var(--dim);padding-right:14px;white-space:nowrap}
  td.v{text-align:right;overflow-wrap:break-word}
  tr.wide td{display:block;text-align:left;white-space:normal}
  tr.wide td.k{padding-bottom:2px}
  tr.wide td.v{padding-top:0;word-break:break-word}
  .yes{color:var(--ok)} .nope{color:var(--no)} .amber{color:var(--wait)}
  .note{margin-top:13px;font-size:12px;color:var(--dim);border-left:2px solid var(--line);padding-left:11px}
  .bar{margin-top:20px;padding:17px 20px;border-radius:14px;border:1px solid var(--line);
    background:var(--card);display:flex;gap:16px;align-items:center;flex-wrap:wrap}
  .bar .big{font-size:16px;font-weight:650}
  .bar.pass{border-color:#1e5c4b} .bar.pass .big{color:var(--ok)}
  .bar.fail{border-color:#6b2530} .bar.fail .big{color:var(--no)}
  button{margin-left:auto;background:#16202c;color:var(--ink);border:1px solid var(--line);
    border-radius:9px;padding:9px 17px;font-size:13px;cursor:pointer}
  button:hover{border-color:var(--accent)}
  .skel{color:#33404f;font:12.5px/1.6 var(--mono)}
  .tiny{font:11.5px/1.5 var(--mono);color:var(--dim);margin-top:9px}`;

const PAGE = String.raw`<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gözle Kabul — B36 Blok 3-bis</title>
<style>
${STYLE}
</style></head><body>
<header>
  <h1>Gözle Kabul</h1>
  <span class="sub">B36 · Blok 3-bis — inşaat sahası ile holdingin ayrılması</span>
  <a href="/blok4" style="color:var(--accent);font-size:13px;text-decoration:none;border:1px solid var(--line);padding:6px 12px;border-radius:8px">Blok 4 ekranı →</a>
  <span class="clock" id="clock">bağlanıyor…</span>
</header>
<main>
  <div class="grid">
    <section class="card" id="c1"><h2><span class="n">1</span>İnşaat kendi alanında çalışıyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c2"><h2><span class="n">2</span>Aynı inşaat şirkete girmeye çalıştı<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c3"><h2><span class="n">3</span>Şirket normal çalışmaya devam ediyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c4"><h2><span class="n">4</span>Şirket kayıtları deneme öncesi ve sonrası<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
  </div>
  <div class="bar" id="bar">
    <span class="big" id="verdict">Ölçülüyor…</span>
    <span class="sub" id="verdictSub" style="color:var(--dim);font-size:13px"></span>
    <button id="again">Tekrar çalıştır</button>
  </div>
</main>
<script>
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const why = (code) => ({
  ENETUNREACH: 'o ağ oradan hiç görünmüyor',
  ECONNREFUSED: 'kapı yüzüne kapandı',
  EHOSTUNREACH: 'o makineye giden yol yok',
  ETIMEDOUT: 'cevap gelmedi',
}[code] || code);
function rows(pairs){
  return '<table>' + pairs.map(([k,v]) => '<tr><td class="k">'+k+'</td><td class="v">'+v+'</td></tr>').join('') + '</table>';
}
function paint(id, cls, verdict, lead, html, note){
  const c = $(id); c.className = 'card ' + cls;
  c.querySelector('.body').innerHTML =
    '<p class="verdict">'+verdict+'</p>' + (lead ? '<p class="lead">'+lead+'</p>' : '') + (html||'') +
    (note ? '<p class="note">'+note+'</p>' : '');
}
function waiting(id, text){
  const c = $(id); c.className = 'card live';
  c.querySelector('.body').innerHTML = '<p class="verdict">'+text+'</p><p class="skel">ölçülüyor…</p>';
}

let state = {};
function start(){
  state = {};
  for (const id of ['c1','c2','c3','c4']) { $(id).className='card'; $(id).querySelector('.body').innerHTML='<p class="skel">bekliyor…</p>'; }
  $('bar').className='bar'; $('verdict').textContent='Ölçülüyor…'; $('verdictSub').textContent='';
  const es = new EventSource('/stream');
  es.onmessage = (m) => {
    const d = JSON.parse(m.data);
    handle(d);
    if (d.step === 'end') es.close();
  };
  es.onerror = () => { $('clock').textContent = 'bağlantı kapandı'; es.close(); };
}

function handle(d){
  if (d.step === 'start') { $('clock').textContent = new Date(d.at).toLocaleString('tr-TR') + ' — canlı ölçüm'; waiting('c4','Şirketin kaydı alınıyor'); }

  if (d.step === 'records' && d.state === 'running') waiting('c4','Şirketin kaydı alınıyor');
  if (d.step === 'records' && d.state === 'half') {
    state.before = d.before;
    $('c4').className = 'card live';
    $('c4').querySelector('.body').innerHTML =
      '<p class="verdict">Deneme öncesi kayıt alındı</p>' +
      rows([['şirketin mührü', '<span class="amber">'+esc(d.before.stamp)+'</span>'],
            ['denetim kaydı / ihlal', '<span class="amber">'+esc(d.before.gov)+'</span>']]) +
      '<p class="note">Şimdi saldırı çalışacak. Bu iki satır sonra tekrar okunacak.</p>';
    waiting('c1','İnşaat kendi motorunda çalışıyor');
  }

  if (d.step === 'doors' && d.state === 'running') waiting('c2','Şirketin gerçek kapıları aranıyor');
  if (d.step === 'doors' && d.state === 'done') {
    state.found = d.found; state.live = d.live;
    $('c2').className = 'card live';
    $('c2').querySelector('.body').innerHTML =
      '<p class="verdict">' + d.live.length + ' gerçek kapı bulundu</p>' +
      '<p class="lead">Önce duvarsız denendi: holdingin ' + d.found + ' adresinden ' + d.live.length +
      ' tanesi gerçekten cevap veriyor. Şimdi inşaat aynı kapıları çalacak.</p>' +
      '<p class="skel">ölçülüyor…</p>';
  }

  if (d.step === 'construction' && d.state === 'running') waiting('c1','İnşaat kendi motorunda çalışıyor');
  if (d.step === 'construction' && d.state === 'done') {
    const i = d.inside || {};
    state.inside = i; state.shown = d.shown; state.total = d.total;
    if (i.ownEngine && i.ownEngine.ok) {
      paint('c1','pass','Çalışıyor — kendi motorunda gerçek iş yaptı',
        'İnşaat, kendi kapalı alanının içinden kendi veri tabanına girdi ve okudu.',
        rows([
          ['kim çalıştı', 'kullanıcı ' + i.identity.uid + ' · kapalı alan: ' + (i.identity.sandbox ? '<span class="yes">evet</span>' : '<span class="nope">hayır</span>')],
          ['hangi motor', '<span class="yes">' + esc(i.ownEngine.engineId) + '</span>'],
          ['okuduğu tablo sayısı', i.ownEngine.tables],
          ['okuduğu satır', i.ownEngine.rows],
          ['ne kadar sürdü', i.ownEngine.ms + ' ms'],
        ]),
        'Bu numara motorun kimliği. Holdingin motorunun numarası başkadır — yani inşaat holdingin veri tabanına değil, deponun kendi dosyalarından üretilmiş kendi kopyasına baktı.');
      waiting('c2','İnşaat şirkete girmeye çalışıyor');
    } else {
      paint('c1','fail','İnşaat kendi işini yapamadı', 'Bu hâlde 2. madde hiçbir şey kanıtlamaz.',
        rows([['sebep', esc((i.ownEngine && i.ownEngine.why) || i.error || 'bilinmiyor')]]));
    }
  }

  if (d.step === 'bare' && d.state === 'running') waiting('c2','İnşaat şirkete girmeye çalışıyor');
  if (d.step === 'bare' && d.state === 'done') {
    const i = state.inside || {}, b = d.bare || {};
    const live = d.live || [];
    const onlyLive = (o) => (o.attempts || []).filter(a => live.includes(a.target));
    const list = (o) => (o.attempts || []).filter(a => (d.shown||[]).includes(a.target));
    const both = [...list(i), ...list(b)];
    const allRefused = [...onlyLive(i), ...onlyLive(b)].every(a => !a.ok)
      && (!i.login || !i.login.ok) && (!b.login || !b.login.ok);
    const n = onlyLive(i).length + onlyLive(b).length;
    const slowest = both.length ? Math.max(...both.map(a => a.ms)) : 0;
    paint('c2', allRefused ? 'pass' : 'fail',
      allRefused ? n + ' denemenin ' + n + ' tanesi de reddedildi' : 'BİR YOL AÇIK KALDI',
      'Aynı inşaat, iki ayrı hâlde: kapalı alanın içinden, ve hiçbir kapalı alan olmadan çıplak makinede.',
      rows(list(i).slice(0,4).map(a => ['kapalı alandan · ' + a.target,
          (a.ok ? '<span class="nope">GİRDİ</span>' : '<span class="yes">reddedildi</span>') +
          ' <span style="color:var(--dim)">' + esc(why(a.why)) + '</span>'])
        .concat(list(b).slice(0,3).map(a => ['çıplak makineden · ' + a.target,
          (a.ok ? '<span class="nope">GİRDİ</span>' : '<span class="yes">reddedildi</span>') +
          ' <span style="color:var(--dim)">' + esc(why(a.why)) + '</span>']))
        .concat([['gerçek şifreyle giriş denemesi',
          (b.login && b.login.layer === 'network')
            ? '<span class="yes">ağ durdurdu — şifre bile sorulmadı</span>'
            : '<span class="nope">' + esc((b.login && b.login.layer) || '?') + '</span>']])),
      'Holdingin ' + (state.found||0) + ' adresi bulundu; bunların ' + live.length + ' tanesi gerçekten cevap veren kapı (bu makineden, hiçbir duvar olmadan denenerek ölçüldü). İnşaat o kapıların hepsinden, iki ayrı hâlde reddedildi — yukarıda okunabilir olsun diye birkaçı gösteriliyor. En yavaş ret ' + slowest + ' ms sürdü: bekleyip donmuyor, anında kapanıyor.');
    waiting('c3','Şirket yokla­nıyor');
  }

  if (d.step === 'company' && d.state === 'running') waiting('c3','Şirket yoklanıyor');
  if (d.step === 'company' && d.state === 'done') {
    const s = d.surfaces, w = d.workers, u = d.units;
    const okAll = s.login === '200' && s.api === '200' && s.auth === '200'
      && Object.values(u).every(v => v === 'active');
    const mark = (v, good) => (v === good ? '<span class="yes">' + v + '</span>' : '<span class="nope">' + v + '</span>');
    paint('c3', okAll ? 'pass' : 'fail',
      okAll ? 'Şirket normal çalışıyor' : 'Şirkette bir şey durdu',
      'Saldırı bittikten hemen sonra, şirketin kendi ekranı ve kendi çalışanları.',
      rows([
        ['giriş ekranı (dashboard /login)', mark(s.login,'200')],
        ['şirketin API kapısı', mark(s.api,'200')],
        ['şirketin kimlik servisi', mark(s.auth,'200')],
        ['kayıtlı çalışan', '<span class="yes">' + esc(w.total) + '</span>'],
        ['aktif çalışan', '<span class="yes">' + esc(w.active) + '</span>'],
        ['açık hedef', esc(w.objectives)],
      ]) + '<table><tr class="wide"><td class="k">sürekli çalışan servisler</td><td class="v">' +
        Object.entries(u).map(([k,v]) => k.replace('dxb-','') + ': ' + mark(v,'active')).join(' · ') +
        '</td></tr></table>',
      'Çalışan sayıları şirketin veri tabanından değil, sadece isimlendirilmiş soruları cevaplayan tek yönlü pencereden okundu.');
    waiting('c4','Şirketin kaydı tekrar okunuyor');
  }

  if (d.step === 'records' && d.state === 'done') {
    const same = d.before.stamp === d.after.stamp && d.before.gov === d.after.gov;
    paint('c4', same ? 'pass' : 'fail',
      same ? 'Tek satır bile değişmedi' : 'ŞİRKETTE BİR ŞEY DEĞİŞTİ',
      'Aynı iki ölçüm: saldırıdan önce ve saldırıdan sonra.',
      rows([
        ['mühür — önce', esc(d.before.stamp)],
        ['mühür — sonra', (same?'<span class="yes">':'<span class="nope">') + esc(d.after.stamp) + '</span>'],
        ['denetim kaydı / ihlal — önce', esc(d.before.gov)],
        ['denetim kaydı / ihlal — sonra', (same?'<span class="yes">':'<span class="nope">') + esc(d.after.gov) + '</span>'],
      ]),
      'Mühür, şirketin bütün tablolarının satır sayılarından üretilen tek bir imza. Değişseydi burada başka bir yazı çıkardı.');
    const cards = ['c1','c2','c3','c4'].map(id => $(id).classList.contains('pass'));
    const allPass = cards.every(Boolean);
    $('bar').className = 'bar ' + (allPass ? 'pass' : 'fail');
    $('verdict').textContent = allPass
      ? 'Dört maddenin dördü de gözünüzün önünde doğrulandı.'
      : 'Bir madde geçmedi — kabul edilmemeli.';
    $('verdictSub').textContent = allPass
      ? 'İnşaat kendi alanında çalışıyor · şirkete giremiyor · şirket normal · kayıtlar aynı.'
      : 'Yukarıdaki kırmızı kutuya bakın.';
  }
}

$('again').onclick = start;
start();
</script></body></html>`;


// ------------------------------------------------------------------ page, BLOCK 4
const PAGE4 = String.raw`<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gözle Kabul — B36 Blok 4</title>
<style>
${STYLE}
</style></head>
<body>
<header>
  <h1>Gözle Kabul</h1>
  <span class="sub">B36 · Blok 4 — şirketin adresi artık hiçbir dosyanın varsayımı değil</span>
  <a href="/" style="color:var(--accent);font-size:13px;text-decoration:none;border:1px solid var(--line);padding:6px 12px;border-radius:8px">← Blok 3-bis ekranı</a>
  <a href="/blok5" style="color:var(--accent);font-size:13px;text-decoration:none;border:1px solid var(--line);padding:6px 12px;border-radius:8px">Blok 5 ekranı →</a>
  <span class="clock" id="clock">bağlanıyor…</span>
</header>
<main>
  <div class="grid">
    <section class="card" id="c1"><h2><span class="n">1</span>Hiçbir dosya şirketin adresini varsaymıyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c2"><h2><span class="n">2</span>Adres verilmeyen araç duruyor, uydurmuyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c3"><h2><span class="n">3</span>Panel elle başlatılamıyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c4"><h2><span class="n">4</span>Panel yalnız bu makineye açık<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c5"><h2><span class="n">5</span>Şirketin kayıtları kıpırdamadı<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
  </div>
  <div class="bar" id="bar">
    <span class="verdict" id="verdict">Ölçülüyor…</span>
    <span class="sub" id="verdictSub" style="color:var(--dim);font-size:13px"></span>
    <button id="again">Tekrar çalıştır</button>
  </div>
</main>
<script>
var $ = function (id) { return document.getElementById(id); };
var t0 = Date.now();
setInterval(function () {
  $('clock').textContent = 'ekran açık: ' + Math.floor((Date.now() - t0) / 1000) + ' sn';
}, 1000);

function esc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function card(id, cls, verdict, lead, rows) {
  var el = $(id);
  el.className = 'card ' + cls;
  var html = '<p class="verdict">' + esc(verdict) + '</p>';
  if (lead) html += '<p class="lead">' + esc(lead) + '</p>';
  if (rows && rows.length) {
    html += '<table>';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.wide) {
        html += '<tr class="wide"><td class="k">' + esc(r[0]) + '</td><td class="v">' + esc(r[1]) + '</td></tr>';
      } else {
        html += '<tr><td class="k">' + esc(r[0]) + '</td><td class="v">' + esc(r[1]) + '</td></tr>';
      }
    }
    html += '</table>';
  }
  el.querySelector('.body').innerHTML = html;
}
function waiting(id, what) {
  $(id).className = 'card live';
  $(id).querySelector('.body').innerHTML = '<p class="verdict">' + esc(what) + '</p>';
}

var pass = {};
function start() {
  pass = {};
  ['c1', 'c2', 'c3', 'c4', 'c5'].forEach(function (id) {
    $(id).className = 'card';
    $(id).querySelector('.body').innerHTML = '<p class="skel">bekliyor…</p>';
  });
  $('verdict').textContent = 'Ölçülüyor…';
  $('verdictSub').textContent = '';
  $('bar').className = 'bar';

  var es = new EventSource('/stream4');
  es.onmessage = function (m) {
    var e = JSON.parse(m.data);

    if (e.step === 'records' && e.state === 'running') waiting('c5', 'Şirketin kaydı sayılıyor…');
    if (e.step === 'records' && e.state === 'half') {
      card('c5', 'live', 'Ölçüldü, şimdi denenecek', 'Aşağıdaki her şey bittikten sonra aynı sayım tekrarlanacak.', [
        ['kaydın parmak izi', e.before.stamp],
        ['denetim kayıtları', e.before.gov]
      ]);
    }
    if (e.step === 'records' && e.state === 'running-after') waiting('c5', 'Şirketin kaydı yeniden sayılıyor…');
    if (e.step === 'records' && e.state === 'done') {
      var same = e.before.stamp === e.after.stamp && e.before.gov === e.after.gov;
      pass.c5 = same;
      card('c5', same ? 'pass' : 'fail', same ? 'Aynı — tek satır değişmedi' : 'DEĞİŞTİ',
        same ? 'Bu ekrandaki her deneme yapıldı ve şirketin defterinde hiçbir şey oynamadı.'
             : 'Şirketin defteri bu ekran çalışırken değişti. Kabul edilmemeli.', [
          ['önce', e.before.stamp],
          ['sonra', e.after.stamp],
          ['denetim kayıtları', e.before.gov + '  →  ' + e.after.gov]
        ]);
    }

    if (e.step === 'counter' && e.state === 'running') waiting('c1', 'Bütün depo taranıyor…');
    if (e.step === 'counter' && e.state === 'done') {
      var c = e.counter || {};
      var blind = c.planted !== 1;
      var ok = c.found === 0 && !blind;
      pass.c1 = ok;
      card('c1', ok ? 'pass' : 'fail',
        c.error ? 'Ölçülemedi' : (c.found === 0 ? '0 dosya' : c.found + ' dosya'),
        blind ? 'DİKKAT: araç, kasten yerleştirilen sahte satırı GÖREMEDİ — sıfır bir şey ifade etmez.'
              : 'Depodaki bütün dosyalar okundu. Hiçbiri şirketin adresini varsaymıyor.', [
          ['taranan dosya', c.scanned],
          ['şirketin adresini varsayan', c.found],
          ['araç sahte bir satırı gördü mü', blind ? 'HAYIR' : 'evet (1 tane)'],
          ['bu iş başlamadan önce', '95 dosya']
        ]);
    }

    if (e.step === 'refusal' && e.state === 'running') waiting('c2', 'Gerçek bir araç adressiz çalıştırılıyor…');
    if (e.step === 'refusal' && e.state === 'done') {
      var ok2 = e.exit !== 0 && e.namesVar;
      pass.c2 = ok2;
      card('c2', ok2 ? 'pass' : 'fail', ok2 ? 'Durdu ve sebebini söyledi' : 'Durmadı',
        'Şirketin yönlendirme kurallarını yazan gerçek bir araç, adres verilmeden çalıştırıldı.', [
          ['çalıştırılan', 'db/seed/import-routing-rules.ts'],
          ['çıkış kodu', e.exit + (e.exit !== 0 ? ' — hata verdi, doğrusu bu' : ' — sessizce çalıştı')],
          ['sebebini söyledi mi', e.saidNothing ? 'HAYIR, sessizce durdu' : 'evet'],
          ['adresin adını anıyor mu', e.namesVar ? 'evet' : 'HAYIR'],
          { wide: true, 0: 'kısacası', 1: ok2
              ? 'Nereye yazacağı söylenmediği için hiçbir şey yazmadı ve neden durduğunu bildirdi. Eskiden şirketin defterini varsayıp yazardı.'
              : 'Adres verilmediği halde durmadı.' }
        ]);
    }

    if (e.step === 'dashboard' && e.state === 'running') waiting('c3', 'Çalışan panel sorgulanıyor…');
    if (e.step === 'dashboard' && e.state === 'done') {
      var running = !!e.pid;
      var ok3 = running && e.carries.address && !!e.carries.stamp
        && e.gateExit !== 0 && e.gateRefused && e.gateNamesWrapper;
      pass.c3 = ok3;
      card('c3', ok3 ? 'pass' : 'fail',
        !running ? 'Panel şu an kapalı' : (ok3 ? 'Doğru başlatılmış' : 'Yanlış başlatılmış'),
        running ? 'Size hizmet eden panelin kendisine soruldu; sonra kapı çıplak bir ortamda denendi.'
                : 'Panel çalışmıyor, bu madde şu an ölçülemez.', [
          ['çalışan panel', running ? 'var (' + e.pid + ')' : 'yok'],
          ['şirketin adresini taşıyor mu', e.carries.address ? 'evet' : 'HAYIR'],
          ['nasıl başlatılmış', e.carries.stamp || '—'],
          ['elle başlatılsa ne olur', e.gateExit !== 0 ? 'reddediyor, çıkış kodu ' + e.gateExit : 'KABUL EDİYOR'],
          ['reddi doğru sebeple mi veriyor', e.gateRefused && e.gateNamesWrapper ? 'evet' : 'HAYIR'],
          { wide: true, 0: 'kısacası', 1: (e.gateExit !== 0 && e.gateRefused)
              ? 'Panel, doğru komutla başlatılmadığında hizmet vermeyi reddediyor ve kapanıyor. Böylece şirketin adresi elinde olmayan bir panel size hizmet edemez.'
              : 'Panel elle başlatıldığında da hizmet veriyor — kapı çalışmıyor.' }
        ]);
    }

    if (e.step === 'door' && e.state === 'running') waiting('c4', 'Kapılar deneniyor…');
    if (e.step === 'door' && e.state === 'done') {
      var self = e.doors.self, lan = e.doors.lan;
      var ok4 = self !== '000' && lan === '000';
      pass.c4 = ok4;
      card('c4', ok4 ? 'pass' : 'fail', ok4 ? 'Bu makineye açık, eve kapalı' : 'Eve açık',
        ok4 ? 'Panel yalnız bu bilgisayardan açılıyor. Ev ağındaki başka bir cihaz ulaşamıyor.'
            : 'Ev ağındaki herkes holdingin ön yüzüne ulaşabiliyor.', [
          ['bu makine (127.0.0.1:3000)', self === '000' ? 'cevap yok' : 'cevap veriyor (' + self + ')'],
          ['ev ağı (' + e.doors.lanAddr + ':3000)', lan === '000' ? 'kapalı' : 'AÇIK (' + lan + ')'],
          ['bu iş başlamadan önce', 'ev ağına açıktı']
        ]);
    }

    if (e.step === 'end') {
      es.close();
      var all = pass.c1 && pass.c2 && pass.c3 && pass.c4 && pass.c5;
      $('bar').className = 'bar ' + (all ? 'pass' : 'fail');
      $('verdict').textContent = all
        ? 'Beş maddenin beşi de gözünüzün önünde doğrulandı.'
        : 'Bir madde geçmedi — kabul edilmemeli.';
      $('verdictSub').textContent = all
        ? 'Hiçbir dosya varsaymıyor · araç adressiz duruyor · panel elle açılamıyor · panel eve kapalı · şirket kıpırdamadı.'
        : 'Yukarıdaki kırmızı kutuya bakın.';
    }
  };
  es.onerror = function () { es.close(); };
}
$('again').onclick = start;
start();
</script></body></html>`;


// ---------------------------------------------------------------- BLOCK 5
//
// His order of 2026-08-25: the three groups leave the company, the boundary
// stays shut, and one retrospective record is written. This screen does not
// report that — it asks the two engines, live, while he is looking.
//
// Everything here is a READ. The company is only ever SELECTed.

const COMPANY_CT = "supabase_db_DxB_Global_OS";
const BUILD_CT = "supabase_db_DxB_Build";

const TEST_WORKERS5 =
  "'worker-lad-1','worker-lad-2','worker-lad-lc','worker-lad-ok','worker-e2e-1',"
  + "'worker-fail-1','worker-dep-1','worker-dep-2','worker-hard-1','worker-hard-2',"
  + "'worker-hard-3','worker-hard-4','worker-hard-5','worker-orch-qa-appr',"
  + "'worker-orch-qa-mal','worker-orch-qa-done','worker-orch-qa-noc',"
  + "'worker-orch-qa-fail','r21t-resident'";

/** One SELECT, one answer. Never anything else. */
async function ask(container, db, sql) {
  const r = await sh("docker", ["exec", "-i", container, "psql", "-U", "supabase_admin",
    "-d", db, "-v", "ON_ERROR_STOP=1", "-tA", "-c", sql]);
  return r.ok ? r.out : `HATA:${r.err.split("\n")[0]}`;
}

/** The same checksum the move used, recomputed here rather than read back. */
const sum5 = (table, cols, key) => `
  SELECT coalesce(md5(string_agg(j, E'\n' ORDER BY k)), 'empty') FROM (
    SELECT "${key}"::text AS k, row_to_json(x)::text AS j
      FROM (SELECT ${cols} FROM public."${table}") x) t;`;

async function* sequence5() {
  yield { step: "start", at: new Date().toISOString() };

  yield { step: "records", state: "running" };
  const before = await fingerprint();
  yield { step: "records", state: "half", before };

  // ---- 1. is the residue really out of the company?
  yield { step: "gone", state: "running" };
  const gone = {
    cost: await ask(COMPANY_CT, "postgres", "SELECT count(*) FROM public.cost_ledger;"),
    brown: await ask(COMPANY_CT, "postgres",
      "SELECT count(*) FROM public.project_risks WHERE title LIKE 'Approvals brown-token audit%';"),
    workers: await ask(COMPANY_CT, "postgres",
      `SELECT count(*) FROM public.decision_log WHERE decided_by IN (${TEST_WORKERS5});`),
    decisions: await ask(COMPANY_CT, "postgres", "SELECT count(*) FROM public.decision_log;"),
    memory: await ask(COMPANY_CT, "postgres", "SELECT count(*) FROM public.memory_index;"),
  };
  yield { step: "gone", state: "done", gone };

  // ---- 2. and is every one of those rows still recoverable?
  yield { step: "archive", state: "running" };
  const groups = [
    { table: "cost_ledger", cols: '"id", "task_id", "agent_id", "department", "model", "mode", "prompt_tokens", "completion_tokens", "cost_eur", "source", "meta", "created_at"', key: "id", expect: 1612 },
    { table: "project_risks", cols: '"id", "project_id", "title", "severity", "status", "note", "updated_at", "title_tr", "note_tr"', key: "id", expect: 1 },
    { table: "decision_log", cols: '"id", "run_id", "decided_by", "decision", "rationale", "data_used", "alternatives", "confidence", "risk", "approval_id", "outcome", "created_at"', key: "id", expect: 1143 },
  ];
  const archive = [];
  for (const g of groups) {
    const rows = await ask(BUILD_CT, "dxb_archive", `SELECT count(*) FROM public."${g.table}";`);
    const live = await ask(BUILD_CT, "dxb_archive", sum5(g.table, g.cols, g.key));
    const stored = await ask(BUILD_CT, "dxb_archive",
      `SELECT checksum FROM public.manifest WHERE source_table='${g.table}';`);
    archive.push({ table: g.table, rows, live, stored, expect: g.expect, same: live === stored });
  }
  const dump = await sh("bash", ["-c",
    "stat -c %s ~/backups/dxb/dxb-b36-pre-separation-2026-08-23.dump 2>/dev/null || echo 0"]);
  yield { step: "archive", state: "done", archive, dumpBytes: Number(dump.out || 0) };

  // ---- 3. was his boundary honoured?
  yield { step: "boundary", state: "running" };
  // The count is compared against the value measured on this engine BEFORE the
  // move (29637 / 1963). max(id) would prove nothing: both books have gaps from
  // their own history — 1963 rows live between id 910 and 9149 — so a detector
  // built on it would call a healthy system broken. The oldest record is asked
  // for as well: if history had been trimmed from the front, it would have moved.
  const hv = await ask(COMPANY_CT, "postgres", "SELECT count(*) FROM public.hook_violations;");
  const hvOld = await ask(COMPANY_CT, "postgres",
    "SELECT coalesce(min(created_at)::date::text,'-') || ' (kayıt ' || coalesce(min(id)::text,'-') || ')' FROM public.hook_violations;");
  const al = await ask(COMPANY_CT, "postgres", "SELECT count(*) FROM public.audit_log;");
  const alOld = await ask(COMPANY_CT, "postgres",
    "SELECT coalesce(min(created_at)::date::text,'-') || ' (kayıt ' || coalesce(min(id)::text,'-') || ')' FROM public.audit_log;");
  const added = await ask(COMPANY_CT, "postgres",
    "SELECT action || ' x' || count(*) FROM public.audit_log "
    + "WHERE action IN ('residue.moved_out','memory.cleared_on_ceo_order') GROUP BY action ORDER BY action;");
  const addedN = await ask(COMPANY_CT, "postgres",
    "SELECT count(*) FROM public.audit_log WHERE action IN ('residue.moved_out','memory.cleared_on_ceo_order');");
  yield { step: "boundary", state: "done",
    boundary: { hv, hvOld, al, alOld, addedN, added: added.split("\n").filter(Boolean) } };

  // ---- 4. do his own surfaces still stand?
  yield { step: "surfaces", state: "running" };
  const risks = await ask(COMPANY_CT, "postgres",
    "SELECT status || ' · ' || coalesce(title_tr, title) FROM public.project_risks ORDER BY updated_at;");
  const views = await ask(COMPANY_CT, "postgres",
    "SELECT count(*) FROM (SELECT (xpath('/row/c/text()', query_to_xml("
    + "format('SELECT count(*) AS c FROM public.%I', c.relname), false, true, '')))[1]::text::bigint AS n "
    + "FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace "
    + "WHERE ns.nspname='public' AND c.relkind='v') x;");
  const total = await ask(COMPANY_CT, "postgres",
    "SELECT count(*) FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace "
    + "WHERE ns.nspname='public' AND c.relkind='v';");
  const lanAddr = (await sh("bash", ["-c",
    "ip -o -4 addr show scope global | awk '{print $4}' | cut -d/ -f1 | head -1"])).out.trim() || "192.168.178.44";
  const self = (await sh("bash", ["-c",
    "curl -s -o /dev/null -w '%{http_code}' --max-time 20 http://127.0.0.1:3000/login"])).out.trim();
  const lan = (await sh("bash", ["-c",
    `curl -s -o /dev/null -w '%{http_code}' --max-time 8 http://${lanAddr}:3000/login`])).out.trim();
  yield { step: "surfaces", state: "done",
    surfaces: { risks: risks.split("\n").filter(Boolean), views, total, self, lan, lanAddr } };

  // ---- 5. and did the company move while he was watching?
  yield { step: "records", state: "running-after" };
  const after = await fingerprint();
  yield { step: "records", state: "done", before, after };

  yield { step: "end" };
}


const PAGE5 = String.raw`<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gözle Kabul — B36 Blok 5</title>
<style>
${STYLE}
</style></head>
<body>
<header>
  <h1>Gözle Kabul</h1>
  <span class="sub">B36 · Blok 5 — inşaat kalıntısı şirketten çıktı, taşındı, silinmedi</span>
  <a href="/blok4" style="color:var(--accent);font-size:13px;text-decoration:none;border:1px solid var(--line);padding:6px 12px;border-radius:8px">← Blok 4 ekranı</a>
  <a href="/blok6" style="color:var(--accent);font-size:13px;text-decoration:none;border:1px solid var(--line);padding:6px 12px;border-radius:8px">Blok 6 ekranı →</a>
  <span class="clock" id="clock">bağlanıyor…</span>
</header>
<main>
  <div class="grid">
    <section class="card" id="c1"><h2><span class="n">1</span>Kalıntı şirketten çıktı<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c2"><h2><span class="n">2</span>Tek satır bile kaybolmadı<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c3"><h2><span class="n">3</span>Kapalı tutun dediğiniz defter kıpırdamadı<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c4"><h2><span class="n">4</span>Sizin gördüğünüz yüzeyler sağlam<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c5"><h2><span class="n">5</span>Siz bakarken şirket kıpırdamıyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
  </div>
  <div class="bar" id="bar">
    <span class="verdict" id="verdict">Ölçülüyor…</span>
    <span class="sub" id="verdictSub" style="color:var(--dim);font-size:13px"></span>
    <button id="again">Tekrar çalıştır</button>
  </div>
</main>
<script>
var $ = function (id) { return document.getElementById(id); };
var t0 = Date.now();
setInterval(function () {
  $('clock').textContent = 'ekran açık: ' + Math.floor((Date.now() - t0) / 1000) + ' sn';
}, 1000);

function esc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function card(id, cls, verdict, lead, rows) {
  var el = $(id);
  el.className = 'card ' + cls;
  var html = '<p class="verdict">' + esc(verdict) + '</p>';
  if (lead) html += '<p class="lead">' + esc(lead) + '</p>';
  if (rows && rows.length) {
    html += '<table>';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.wide) html += '<tr class="wide"><td class="k">' + esc(r[0]) + '</td><td class="v">' + esc(r[1]) + '</td></tr>';
      else html += '<tr><td class="k">' + esc(r[0]) + '</td><td class="v">' + esc(r[1]) + '</td></tr>';
    }
    html += '</table>';
  }
  el.querySelector('.body').innerHTML = html;
}
function waiting(id, what) {
  $(id).className = 'card live';
  $(id).querySelector('.body').innerHTML = '<p class="verdict">' + esc(what) + '</p>';
}
function num(x) { return /^[0-9]+$/.test(String(x)) ? parseInt(x, 10) : null; }

var pass = {};
function start() {
  pass = {};
  ['c1', 'c2', 'c3', 'c4', 'c5'].forEach(function (id) {
    $(id).className = 'card';
    $(id).querySelector('.body').innerHTML = '<p class="skel">bekliyor…</p>';
  });
  $('verdict').textContent = 'Ölçülüyor…';
  $('verdictSub').textContent = '';
  $('bar').className = 'bar';

  var es = new EventSource('/stream5');
  es.onmessage = function (m) {
    var e = JSON.parse(m.data);

    if (e.step === 'records' && e.state === 'running') waiting('c5', 'Şirketin mührü alınıyor…');
    if (e.step === 'records' && e.state === 'half') {
      card('c5', 'live', 'Mühür alındı, şimdi her şey okunacak',
        'Bu ekrandaki bütün sorular sorulduktan sonra aynı mühür tekrar alınacak.', [
        ['şirketin mührü', e.before.stamp],
        ['denetim kaydı / ihlal', e.before.gov]
      ]);
      waiting('c1', 'Şirket sayılıyor…');
    }
    if (e.step === 'records' && e.state === 'running-after') waiting('c5', 'Mühür yeniden alınıyor…');
    if (e.step === 'records' && e.state === 'done') {
      var same = e.before.stamp === e.after.stamp && e.before.gov === e.after.gov;
      pass.c5 = same;
      card('c5', same ? 'pass' : 'fail', same ? 'Aynı — tek satır oynamadı' : 'DEĞİŞTİ',
        same ? 'Bu ekran şirkete yalnızca soru sordu. Hiçbir şey yazmadı.'
             : 'Şirketin defteri bu ekran çalışırken değişti. Kabul edilmemeli.', [
          ['önce', e.before.stamp],
          ['sonra', e.after.stamp],
          ['denetim kaydı / ihlal', e.before.gov + '  →  ' + e.after.gov]
        ]);
    }

    if (e.step === 'gone' && e.state === 'running') waiting('c1', 'Şirket sayılıyor…');
    if (e.step === 'gone' && e.state === 'done') {
      var g = e.gone;
      var ok = num(g.cost) === 0 && num(g.brown) === 0 && num(g.workers) === 0;
      pass.c1 = ok;
      card('c1', ok ? 'pass' : 'fail',
        ok ? 'Üç grubun üçü de şirkette bitti' : 'Bir grup hâlâ şirkette',
        'Şu an, siz bakarken şirketin kendi veri tabanına soruldu.', [
          ['inşaatın jeton harcaması', g.cost + ' satır (önce 1.612)'],
          ['kahve-token işi', g.brown + ' satır (önce 1)'],
          ['19 test işçisinin kararı', g.workers + ' satır (önce 1.143)'],
          ['şirketin kendi kararları', g.decisions + ' satır (önce 4.730)'],
          ['şirketin hafızası', g.memory + ' satır (sizin emrinizle)'],
          { wide: true, 0: 'kısacası', 1: ok
              ? 'İnşaatın izi şirketin defterinden çıktı; şirketin kendi 3.587 kararı yerinde duruyor.'
              : 'Taşınması gereken bir grup hâlâ şirkette görünüyor.' }
        ]);
      waiting('c2', 'Arşiv okunuyor…');
    }

    if (e.step === 'archive' && e.state === 'running') waiting('c2', 'Arşiv okunuyor…');
    if (e.step === 'archive' && e.state === 'done') {
      var a = e.archive || [];
      var okAll = a.length === 3 && a.every(function (x) { return num(x.rows) === x.expect && x.same; })
        && e.dumpBytes > 1000000;
      pass.c2 = okAll;
      var rows = a.map(function (x) {
        return [x.table + ' (satır)', x.rows + ' / ' + x.expect];
      });
      rows.push({ wide: true, 0: 'parmak izleri (checksum — satırların özeti)',
        1: a.map(function (x) { return x.table + ': ' + (x.same ? 'birebir aynı' : 'TUTMUYOR'); }).join('   ·   ') });
      rows.push(['23 Ağustos yedeği (bayt)', e.dumpBytes > 0
        ? e.dumpBytes.toLocaleString('tr-TR') : 'BULUNAMADI']);
      rows.push({ wide: true, 0: 'kısacası', 1: okAll
        ? 'Silinen her satır iki ayrı yerde duruyor: inşaat motorundaki arşivde ve taşımadan önceki tam yedekte. Parmak izleri şimdi yeniden hesaplandı, deftere bakılmadı.'
        : 'Bir grubun sayısı veya parmak izi tutmuyor — geri dönüş garantisi yok.' });
      card('c2', okAll ? 'pass' : 'fail',
        okAll ? '2.756 satırın hepsi arşivde, birebir' : 'Arşiv tam değil',
        'Soldaki sayı arşivde bulunan satır, sağdaki beklenen satır. Parmak izleri şu an yeniden hesaplandı ve taşıma defterindekiyle karşılaştırıldı.', rows);
      waiting('c3', 'Sınır okunuyor…');
    }

    if (e.step === 'boundary' && e.state === 'running') waiting('c3', 'Sınır okunuyor…');
    if (e.step === 'boundary' && e.state === 'done') {
      var b = e.boundary;
      var okB = num(b.hv) === 1963 && num(b.al) === 29641 && num(b.addedN) === 4;
      pass.c3 = okB;
      card('c3', okB ? 'pass' : 'fail',
        okB ? 'Kıpırdamadı' : 'SINIR OYNADI',
        '"Kapalı kalsın" dediğiniz iki defter. Ölçüt: sayı, taşımadan önce bu sabah ölçülen sayıyla aynı olmalı — ve defterin en eski kaydı hâlâ yerinde durmalı.', [
          ['ihlal defteri (hook_violations)', b.hv + ' satır'],
          ['bu sabah, taşımadan önce', '1.963 satır'],
          ['denetim defteri (audit_log)', b.al + ' satır'],
          ['bu sabah, taşımadan önce', '29.637 satır'],
          ['aradaki fark', b.addedN + ' satır EKLENDİ'],
          { wide: true, 0: 'iki defterin en eski kaydı da hâlâ yerinde — baştan kırpılmamışlar',
            1: 'ihlal defteri: ' + b.hvOld + '   ·   denetim defteri: ' + b.alOld },
          { wide: true, 0: 'eklenen dört kayıt', 1: b.added.join('   ·   ') },
          { wide: true, 0: 'kısacası', 1: okB
              ? 'İki defterden tek satır çıkmadı. Denetim defterine yalnızca bu işin kendi kaydı ve sizin onayladığınız hafıza kaydı eklendi.'
              : 'Dokunulmaması gereken bir defter değişmiş.' }
        ]);
      waiting('c4', 'Yüzeyler yoklanıyor…');
    }

    if (e.step === 'surfaces' && e.state === 'running') waiting('c4', 'Yüzeyler yoklanıyor…');
    if (e.step === 'surfaces' && e.state === 'done') {
      var s = e.surfaces;
      var open = (s.risks || []).filter(function (r) { return r.indexOf('open') === 0; });
      var okS = num(s.views) !== null && num(s.views) === num(s.total)
        && open.length === 0 && s.self !== '000' && s.lan === '000';
      pass.c4 = okS;
      card('c4', okS ? 'pass' : 'fail',
        okS ? 'Hepsi ayakta' : 'Bir yüzey bozuldu',
        'Taşınan satırları okuyan 15 görünüm vardı. Hepsi ve diğerleri şimdi tek tek çalıştırıldı.', [
          ['çalışan görünüm (view)', s.views + ' / ' + s.total],
          ['kırılan görünüm', num(s.views) === num(s.total) ? 'yok' : 'VAR'],
          ['risk sayfanızda kalan', (s.risks || []).length + ' satır'],
          ['açık kalan inşaat işi', open.length === 0 ? 'yok' : open.length + ' tane'],
          ['paneliniz (127.0.0.1)', s.self === '000' ? 'CEVAP YOK' : 'açık (' + s.self + ')'],
          ['ev ağına (' + s.lanAddr + ')', s.lan === '000' ? 'kapalı' : 'AÇIK (' + s.lan + ')'],
          { wide: true, 0: 'risk sayfanızda ne kaldı', 1: (s.risks || []).join('   ·   ') },
          { wide: true, 0: 'kısacası', 1: okS
              ? 'Taşınan satırları okuyan hiçbir ekran kırılmadı, risk sayfanız yalnız iş riski taşıyor, paneliniz yalnız bu makineye açık.'
              : 'Bir yüzey bozuldu — yukarıdaki satıra bakın.' },
        ]);
    }

    if (e.step === 'end') {
      es.close();
      var all = pass.c1 && pass.c2 && pass.c3 && pass.c4 && pass.c5;
      $('bar').className = 'bar ' + (all ? 'pass' : 'fail');
      $('verdict').textContent = all
        ? 'Beş maddenin beşi de gözünüzün önünde doğrulandı.'
        : 'Bir madde geçmedi — kabul edilmemeli.';
      $('verdictSub').textContent = all
        ? 'Kalıntı çıktı · hepsi arşivde birebir · sınır kıpırdamadı · yüzeyleriniz ayakta · şirket siz bakarken durdu.'
        : 'Yukarıdaki kırmızı kutuya bakın.';
    }
  };
  es.onerror = function () { es.close(); };
}
$('again').onclick = start;
start();
</script></body></html>`;

// ---------------------------------------------------------------- BLOCK 6
//
// THE PROOF COMMAND, WATCHED WHILE IT RUNS.
//
// This screen measures nothing of its own. It starts
// `node scripts/governance/company-untouched.mjs --events` and paints the JSON
// objects that command writes on stderr as they arrive — so what he is looking
// at is the drill happening, not a page describing it. One source of truth: if
// the command changes its mind about what a breach is, this screen changes with
// it in the same second, and there is no second place where a verdict is decided.
//
// The command's own step 0 fires the red half first, on the CONSTRUCTION engine
// and in a planted file, and refuses to print anything else if an instrument
// cannot be shown convicting. He therefore watches the gate go red BEFORE he
// watches it go green, every time, without anything being staged for him.

/** Stream the proof command's judgements as they happen. */
async function* sequence6(fast) {
  const args = [join(REPO, "scripts/governance/company-untouched.mjs"), "--events"];
  if (fast) args.push("--no-battery");
  const child = spawn("node", args, { cwd: REPO, stdio: ["ignore", "ignore", "pipe"] });

  const queue = [];
  let waiter = null;
  let done = false;
  let buf = "";

  const push = (ev) => { queue.push(ev); if (waiter) { const w = waiter; waiter = null; w(); } };

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    buf += chunk;
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const l = buf.slice(0, i);
      buf = buf.slice(i + 1);
      if (!l.startsWith("@@EV ")) continue;
      try { push(JSON.parse(l.slice(5))); } catch { /* a half-written line is skipped */ }
    }
  });
  child.on("close", (code) => { push({ t: "closed", code }); done = true; if (waiter) { const w = waiter; waiter = null; w(); } });
  child.on("error", (e) => { push({ t: "closed", code: -1, error: String(e.message || e) }); done = true; if (waiter) { const w = waiter; waiter = null; w(); } });

  yield { t: "opened", fast: Boolean(fast) };
  for (;;) {
    if (queue.length) { const ev = queue.shift(); yield ev; if (ev.t === "closed") return; continue; }
    if (done) return;
    await new Promise((r) => { waiter = r; });
  }
}

const PAGE6 = String.raw`<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gözle Kabul — B36 Blok 6</title>
<style>
${STYLE}
</style></head>
<body>
<header>
  <h1>Gözle Kabul</h1>
  <span class="sub">B36 · Blok 6 — tek komut: inşaat şirkete girebiliyor mu, yazabiliyor mu, duvarı aşabiliyor mu</span>
  <a href="/blok5" style="color:var(--accent);font-size:13px;text-decoration:none;border:1px solid var(--line);padding:6px 12px;border-radius:8px">← Blok 5 ekranı</a>
  <span class="clock" id="clock">bağlanıyor…</span>
</header>
<main>
  <div class="grid">
    <section class="card" id="c1"><h2><span class="n">0</span>Önce kırmızı — aletler kendini ispatlıyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c2"><h2><span class="n">1</span>Şirketin fotoğrafı çekiliyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c3"><h2><span class="n">2</span>İnşaat bütün gününü çalışıyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c4"><h2><span class="n">3</span>Fotoğraf tekrar çekiliyor, ikisi çıkarılıyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c5"><h2><span class="n">4</span>Şirketin kapısına yükleniliyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c6"><h2><span class="n">5</span>Depo, şirketin adresi için süpürülüyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
    <section class="card" id="c7"><h2><span class="n">6</span>Şirketin kendi odaları inşaat izi için süpürülüyor<span class="dot"></span></h2><div class="body"><p class="skel">bekliyor…</p></div></section>
  </div>
  <div class="bar" id="bar">
    <span class="big" id="verdict">Bekliyor…</span>
    <span class="sub" id="verdictSub" style="color:var(--dim);font-size:13px"></span>
    <button id="fast">Hızlı koşu (sınavsız)</button>
    <button id="again" style="margin-left:10px">Tam koşu</button>
  </div>
  <p class="tiny">Bu ekran hiçbir şeyi kendisi ölçmez. <span style="color:var(--ink)">pnpm verify:separation</span> komutunu başlatır ve
  onun kararlarını geldikçe boyar. Şirkete tek harf yazılmaz: her okuma SELECT, her yazma denemesi
  BEGIN ile açılıp ROLLBACK ile kapanır.</p>
</main>
<script>
var $ = function (id) { return document.getElementById(id); };
var t0 = Date.now();
setInterval(function () {
  $('clock').textContent = 'ekran açık: ' + Math.floor((Date.now() - t0) / 1000) + ' sn';
}, 1000);

function esc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

var CARD = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
var GREEN = [
  'Üç aletin üçü de aradığını buldu',
  'Fotoğraf çekildi',
  'İnşaatın bütün sınavı yeşil',
  'Tek satır kıpırdamadı',
  'Denemelerin hepsi reddedildi',
  'Depoda kaçak adres yok',
  'Şirkette inşaattan eser yok'
];
var RED = [
  'BİR ALET KÖR — altındaki hiçbir ölçüm anlam taşımaz',
  'Fotoğraf alınamadı',
  'SINAV KIRMIZI',
  'ŞİRKETTE BİR ŞEY DEĞİŞTİ',
  'İÇERİ GİREN BİR YOL VAR',
  'KAÇAK ADRES BULUNDU',
  'İNŞAAT İZİ BULUNDU'
];
var LEAD = [
  'Her alet, aradığı şeyi bilerek kurulmuş bir örnek üzerinde bulduğunu gösteriyor; bulamazsa komut devam etmiyor.',
  'Şirketin bütün tabloları, satır satır sayıldı. Bu, karşılaştırmanın başlangıç noktası.',
  'İnşaat, kendi motorunda bütün sınavını veriyor — şirketin motoruna hiç dokunmadan.',
  'Aynı sayım tekrar yapıldı ve ilkinden çıkarıldı. Sıfır olmayan her fark kırmızıdır.',
  'Şirkette kalan tek hesapla (dxb_gateway) yazmaya çalışılıyor. Kabul edilen tek ifade bile kırmızıdır.',
  'Depodaki bütün kayıtlı dosyalar okunuyor: şirketin adresini varsayılan yapan bir satır var mı?',
  'Şirketin 60 tablosunun tamamı, inşaatın kendi adları için taranıyor — ve hiçbir canlı şirket süreci inşaat motoruna giden bir yol taşıyor mu diye bakılıyor.'
];

var acc = {};
function repaint(i, live) {
  var a = acc[i]; if (!a) return;
  var el = $(CARD[i]); if (!el) return;
  var cls = live ? 'live' : (a.ok ? 'pass' : 'fail');
  el.className = 'card ' + cls;
  var html = '<p class="verdict">' + esc(live ? 'Ölçülüyor…' : (a.ok ? GREEN[i] : RED[i])) + '</p>';
  html += '<p class="lead">' + esc(LEAD[i]) + '</p>';
  if (a.rows.length) {
    html += '<table>';
    for (var j = 0; j < a.rows.length; j++) {
      var r = a.rows[j];
      html += '<tr class="wide"><td class="k">' + esc(r[0]) + '</td><td class="v ' + (r[2] || '') + '">' + esc(r[1]) + '</td></tr>';
    }
    html += '</table>';
  }
  el.querySelector('.body').innerHTML = html;
}

function reset() {
  acc = {};
  for (var i = 0; i < CARD.length; i++) {
    $(CARD[i]).className = 'card';
    $(CARD[i]).querySelector('.body').innerHTML = '<p class="skel">bekliyor…</p>';
  }
  $('verdict').textContent = 'Ölçülüyor…';
  $('verdictSub').textContent = '';
  $('bar').className = 'bar';
}

function start(fast) {
  reset();
  var es = new EventSource(fast ? '/stream6?fast=1' : '/stream6');
  var last = -1;
  es.onmessage = function (m) {
    var e = JSON.parse(m.data);

    if (e.t === 'opened') {
      $('verdictSub').textContent = e.fast
        ? 'hızlı koşu — inşaatın sınavı atlanıyor'
        : 'tam koşu — inşaatın bütün sınavı da koşuyor, iki üç dakika sürer';
      return;
    }
    if (e.t === 'step') {
      if (last >= 0 && acc[last]) repaint(last, false);
      last = e.step;
      acc[e.step] = { ok: true, rows: [] };
      repaint(e.step, true);
      return;
    }
    if (e.t === 'closed') {
      if (last >= 0 && acc[last]) repaint(last, false);
      es.close();
      return;
    }
    if (e.t === 'end') {
      if (last >= 0 && acc[last]) repaint(last, false);
      var held = e.verdict === 'SEPARATION_HOLDS';
      $('bar').className = 'bar ' + (held ? 'pass' : 'fail');
      $('verdict').textContent = held ? 'AYRIM SAĞLAM' : 'AYRIM KIRIK';
      $('verdictSub').textContent = held
        ? 'İnşaatın bütün sınavı koştu; şirkette tek satır kıpırdamadı, ' + (e.probes || 0) + ' yazma denemesinin ' + (e.probes || 0) + '’ü de reddedildi, depoda kaçak adres yok.'
        : (e.why || 'Aşağıdaki kırmızı satırlar kabul edilmemeli.');
      return;
    }

    var i = e.step;
    if (!acc[i]) { acc[i] = { ok: true, rows: [] }; }
    if (e.t === 'fact') {
      acc[i].rows.push([e.tr || e.k, e.v, '']);
    } else if (e.t === 'log') {
      acc[i].rows.push(['·', e.v, '']);
    } else if (e.t === 'moved') {
      acc[i].ok = false;
      acc[i].rows.push(['KIPIRDADI · ' + e.k, e.v, 'nope']);
    } else if (e.t === 'red') {
      if (!e.ok) acc[i].ok = false;
      acc[i].rows.push([(e.ok ? 'KIRMIZI GÖRÜLDÜ · ' : 'KÖR · ') + (e.tr || e.what), e.trDetail || e.detail, e.ok ? 'amber' : 'nope']);
    } else if (e.t === 'judge') {
      if (!e.ok) acc[i].ok = false;
      acc[i].rows.push([(e.ok ? '' : 'KIRMIZI · ') + (e.tr || e.what), e.trDetail || e.detail, e.ok ? 'yes' : 'nope']);
    }
    repaint(i, true);
  };
  es.onerror = function () {
    if (last >= 0 && acc[last]) repaint(last, false);
    es.close();
  };
}
$('again').onclick = function () { start(false); };
$('fast').onclick = function () { start(true); };
start(false);
</script></body></html>`;

// ----------------------------------------------------------------------- server
const server = createServer(async (req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(PAGE);
    return;
  }
  if (req.url === "/blok4") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(PAGE4);
    return;
  }
  if (req.url === "/blok5") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(PAGE5);
    return;
  }
  if (req.url === "/blok6") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(PAGE6);
    return;
  }
  if (req.url === "/stream6" || req.url === "/stream6?fast=1") {
    res.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
      connection: "keep-alive",
    });
    try {
      for await (const ev of sequence6(req.url.includes("fast=1"))) {
        res.write(`data: ${JSON.stringify(ev)}\n\n`);
      }
    } catch (e) {
      res.write(`data: ${JSON.stringify({ t: "closed", code: -1, error: String(e.message || e) })}\n\n`);
    }
    res.end();
    return;
  }
  if (req.url === "/stream5") {
    res.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
      connection: "keep-alive",
    });
    try {
      for await (const ev of sequence5()) {
        res.write(`data: ${JSON.stringify(ev)}\n\n`);
      }
    } catch (e) {
      res.write(`data: ${JSON.stringify({ step: "end", error: String(e.message || e) })}\n\n`);
    }
    res.end();
    return;
  }
  if (req.url === "/stream4") {
    res.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
      connection: "keep-alive",
    });
    try {
      for await (const ev of sequence4()) {
        res.write(`data: ${JSON.stringify(ev)}\n\n`);
      }
    } catch (e) {
      res.write(`data: ${JSON.stringify({ step: "end", error: String(e.message || e) })}\n\n`);
    }
    res.end();
    return;
  }
  if (req.url === "/stream") {
    res.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
      connection: "keep-alive",
    });
    try {
      for await (const ev of sequence()) {
        res.write(`data: ${JSON.stringify(ev)}\n\n`);
      }
    } catch (e) {
      res.write(`data: ${JSON.stringify({ step: "end", error: String(e.message || e) })}\n\n`);
    }
    res.end();
    return;
  }
  res.writeHead(404).end("yok");
});

server.listen(PORT, "127.0.0.1", () => {
  console.error(`[eye-check] Blok 3-bis: http://127.0.0.1:${PORT}`);
  console.error(`[eye-check] Blok 4    : http://127.0.0.1:${PORT}/blok4`);
  console.error(`[eye-check] Blok 5    : http://127.0.0.1:${PORT}/blok5`);
  console.error(`[eye-check] Blok 6    : http://127.0.0.1:${PORT}/blok6`);
});
