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
import { execFile } from "node:child_process";
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

// ------------------------------------------------------------------------- page
const PAGE = String.raw`<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gözle Kabul — B36 Blok 3-bis</title>
<style>
  :root{
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
  td.v{text-align:right}
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
  .tiny{font:11.5px/1.5 var(--mono);color:var(--dim);margin-top:9px}
</style></head><body>
<header>
  <h1>Gözle Kabul</h1>
  <span class="sub">B36 · Blok 3-bis — inşaat sahası ile holdingin ayrılması</span>
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

// ----------------------------------------------------------------------- server
const server = createServer(async (req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(PAGE);
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
  console.error(`[eye-check] açık: http://127.0.0.1:${PORT}`);
});
