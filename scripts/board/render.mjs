#!/usr/bin/env node
/**
 * THE OPEN WORK BOARD, OPENED FOR THE CEO.
 *
 * WHY THIS EXISTS, and it is his own sentence: "tahtayı buraya yaz demedim,
 * herşeyi görebilmem için aç dedim" (2026-08-25). The board is the single
 * answer to "what is left" — and it lives in a 126 KB English markdown file
 * with cells thousands of characters long. The owner of the company could not
 * open it. A register the owner cannot read is not a register.
 *
 * WHAT THIS IS NOT: a copy of the board. It reads
 * HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md every time it runs and renders
 * what is in it at that moment. There is no second source of truth here, and
 * nothing is written back to the board.
 *
 * THE TURKISH LAYER, and how it is kept honest. The board's own language is
 * English (the corpus rule). What the CEO reads must be Turkish. So each row
 * carries a one-line Turkish headline in scripts/board/tr.json, WITH a
 * fingerprint of the English text it was written against. When the English
 * moves, the fingerprint stops matching and the page SAYS SO on that row —
 * a stale summary announces itself instead of quietly lying. A row with no
 * Turkish line at all says that too.
 *
 * Run:  node scripts/board/render.mjs          → writes var/board/tahta.html
 *       node scripts/board/render.mjs --open   → and opens it on the screen
 */
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { movement } from "./movement.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const BOARD = join(REPO, "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md");
const TR = join(REPO, "scripts/board/tr.json");
const ONAY = join(REPO, "scripts/governance/ceo-approvals.json");
const OUT = join(REPO, "var/board/tahta.html");

// ------------------------------------------------------------------ the rows
//
// The board holds several tables with different columns. The header line above
// each table decides what a cell means, so the parser never guesses by position.
function parse(text) {
  const lines = text.split("\n");
  const rows = [];
  let head = null;
  for (const line of lines) {
    if (/^\|\s*#\s*\|/.test(line)) {
      head = line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim().toLowerCase());
      continue;
    }
    const m = /^\|\s*(B\d+(?:-bis)?|C\d+)\s*\|/.exec(line);
    if (!m || !head) continue;
    const cells = line.trim().replace(/^\||\|$/g, "").split(" | ").map((c) => c.trim());
    const at = (needle) => {
      const i = head.findIndex((h) => h.includes(needle));
      return i >= 0 && i < cells.length ? cells[i] : "";
    };
    const id = m[1];
    // The body cell is named differently on the two kinds of table, and it is
    // NOT at a fixed position: the work tables carry an "Opened" column before
    // it and the complaint tables do not. Measured 2026-08-25 — reading column
    // 1 on both put a DATE where B36's closing sentence should have been, and
    // the page then showed three closed rows as open.
    const body = at("what is open") || at("the complaint") || cells[1] || "";
    // CLOSED only when the cell OPENS with it. Two rows (B18, C42) quote another
    // row's closing words in the middle of their text, and a looser test reads
    // them as closed — measured 2026-08-25, which is why this is anchored.
    const closed = /✓ CLOSED/.test(body.slice(0, 45));
    rows.push({
      id,
      opened: at("opened"),
      body,
      spec: at("owning spec") || at("spec"),
      why: at("why it is still open") || at("measured"),
      waits: at("waits on"),
      closes: at("what closes it"),
      closed,
    });
  }
  return rows;
}

/** Who the row is actually waiting for — the one thing the CEO sorts by. */
function owner(row) {
  if (row.closed) return "kapandi";
  const w = row.waits.toUpperCase();
  const ceo = w.includes("CEO");
  const author = w.includes("AUTHOR") || w.includes("BOTH");
  if (ceo && author) return "ortak";
  if (ceo) return "ceo";
  if (w.includes("HARDWARE") && !author) return "ceo";
  return "yazar";
}

/**
 * WHO IT WAITS FOR, IN HIS LANGUAGE. The board's own cell is English and some of
 * them are whole sentences — B28's runs to three clauses. Printing it raw put
 * English on a surface the CEO reads, which is an automatic failure under his
 * own rule (one locale, 100%). Caught by eye on the first full-screen render,
 * 2026-08-25. The English cell is not lost: it is quoted inside the row, under
 * a heading that says it is the register's own wording.
 */
function kimTr(row) {
  if (row.closed) return "Kapandı — kimseyi beklemiyor";
  const w = row.waits;
  const own = owner(row);
  const nedenler = [];
  if (/money|para/i.test(w)) nedenler.push("para");
  if (/one login|login/i.test(w)) nedenler.push("bir kez tarayıcı girişi");
  if (/timing/i.test(w)) nedenler.push("zamanlaması sizin");
  if (/ear\b|kulak/i.test(w)) nedenler.push("sizin kulağınız");
  if (/HARDWARE/i.test(w)) nedenler.push("donanım");
  if (/approve|approves/i.test(w)) nedenler.push("onayınız");
  if (/reads it|reads/i.test(w)) nedenler.push("sizin okumanız");
  const ek = nedenler.length ? ` — ${nedenler.join(" · ")}` : "";
  if (own === "ceo") return `Siz${ek}`;
  if (own === "ortak") return `Ben yaparım, kararı siz verirsiniz${ek}`;
  return `Ben${ek}`;
}

const OWNER_LABEL = {
  ceo: "SİZİ BEKLİYOR",
  ortak: "ORTAK — ben yaparım, onayı sizin",
  yazar: "BENİ BEKLİYOR",
  kapandi: "KAPANDI",
};

// --------------------------------------------------------------- the language
const fingerprint = (s) => createHash("sha256").update(s).digest("hex").slice(0, 12);

// ------------------------------------------------------------------ rendering
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The board's own markdown, as much of it as a reader needs. Nothing is cut:
 *  his ruling of 2026-07-18 forbids a "…" anywhere he can see it. */
function md(s) {
  let h = esc(s);
  h = h.replace(/&lt;!--.*?--&gt;/g, "");                       // the machine's own markers
  h = h.replace(/&lt;br&gt;/g, "<br>");
  h = h.replace(/`([^`]+)`/g, "<code>$1</code>");
  h = h.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  h = h.replace(/\*(.+?)\*/g, "<i>$1</i>");
  h = h.replace(/\[\[([^\]]+)\]\]/g, "<span class=spec>$1</span>");
  return h;
}

function daysSince(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const then = new Date(`${iso}T00:00:00Z`).getTime();
  const now = new Date(`${TODAY}T00:00:00Z`).getTime();
  return Math.round((now - then) / 86_400_000);
}

// The board's own engine has no clock here; the day comes from the machine, and
// the page prints it so nobody has to guess how fresh what they are reading is.
const NOW = new Date();
const TODAY = `${NOW.getFullYear()}-${String(NOW.getMonth() + 1).padStart(2, "0")}-${String(NOW.getDate()).padStart(2, "0")}`;
const CLOCK = `${TODAY} ${String(NOW.getHours()).padStart(2, "0")}:${String(NOW.getMinutes()).padStart(2, "0")}`;

function card(row, tr, hareket) {
  const own = owner(row);
  const entry = tr[row.id];
  const fp = fingerprint(row.body);
  let baslik, uyari = "";
  if (!entry) {
    baslik = "TÜRKÇE ÖZET YAZILMADI";
    uyari = `<div class="uyari">⚠ Bu satırın Türkçe özeti yok — aşağıdaki asıl metin okunmalı.</div>`;
  } else {
    baslik = entry.tr;
    if (entry.hash !== fp) {
      uyari = `<div class="uyari">⚠ Bu satırın asıl metni Türkçe özet yazıldıktan sonra değişti — özet eskimiş olabilir, aşağıdaki asıl metin doğrudur.</div>`;
    }
  }
  const gun = daysSince(row.opened);
  const yas = gun === null ? "" : `<span class="yas">${gun} gündür açık</span>`;

  // WHAT MOVED ON THIS ROW, AND WHEN — read out of the repository's own history
  // rather than written by hand, so it can never be forgotten or flattered.
  const hs = hareket[row.id] || [];
  const sonGun = hs.length ? daysSince(hs[0].date) : null;
  const sonSoz = sonGun === null ? "hiç hareket kaydı yok"
    : sonGun <= 0 ? "BUGÜN çalışıldı"
    : sonGun === 1 ? "DÜN çalışıldı"
    : `${sonGun} gündür dokunulmadı`;
  const sonSinif = sonGun !== null && sonGun <= 1 ? "taze" : sonGun !== null && sonGun > 21 ? "bayat" : "";
  const hareketSatiri = `<div class="hareket ${sonSinif}"><b>Son hareket:</b> ${
    hs.length ? `${hs[0].date} ${hs[0].time} · ${esc(sonSoz)} · toplam ${hs.length} hareket` : esc(sonSoz)
  }</div>`;
  const hareketListesi = hs.length ? `
      <h4>Bu satırda ne zaman ne yapıldı — ${hs.length} hareket</h4>
      <ul class="hlist">${hs.map((h) => `<li><span class="ht">${h.date} ${h.time}</span> <code>${h.sha}</code> ${esc(h.subject)}</li>`).join("")}</ul>` : "";
  const tarih = row.opened ? `<span class="tarih">${row.opened}</span>` : `<span class="tarih">27.07.2026 şikâyet defteri</span>`;

  return `
<article class="satir" data-owner="${own}" data-id="${row.id}" data-ara="${esc((baslik + " " + row.id + " " + row.body).toLowerCase())}">
  <header class="ust">
    <span class="rozet ${own}">${OWNER_LABEL[own]}</span>
    <span class="kimlik">${row.id}</span>
    ${tarih}${yas}
  </header>
  <h3 class="baslik">${esc(baslik)}</h3>
  ${uyari}
  <div class="kim"><b>Kimi bekliyor:</b> ${esc(kimTr(row))}</div>
  ${hareketSatiri}
  <details>
    <summary>Bu satırın tamamını aç</summary>
    <div class="tam">
      <p class="dilnot">Aşağısı tahtanın kendi metnidir — kayıt dili İngilizcedir (bu holdingin kuralı), hiçbir yeri kısaltılmadan gösterilir.</p>
      <h4>Açık olan iş</h4>
      <p>${md(row.body)}</p>
      ${row.why ? `<h4>Neden hâlâ açık / ölçüm</h4><p>${md(row.why)}</p>` : ""}
      ${row.closes ? `<h4>Bu satırı ne kapatır</h4><p>${md(row.closes)}</p>` : ""}
      ${row.spec ? `<h4>Sahibi olan belge</h4><p>${md(row.spec)}</p>` : ""}
      ${row.waits ? `<h4>Tahtanın kendi «kimi bekliyor» ifadesi</h4><p>${md(row.waits)}</p>` : ""}
      ${hareketListesi}
    </div>
  </details>
</article>`;
}

// --------------------------------------------------------------- what is DONE
//
// HIS QUESTION, 2026-08-26: "bitenler nerede? onlar icin de bir tahta yapar
// misin ... hatta bunlarin icinde olsun."
//
// The board is by design the register of what is LEFT — a row leaves it when it
// closes. So "what is finished" was nowhere he could see it. The truthful
// source is his OWN acceptance register, scripts/governance/ceo-approvals.json:
// LAW B says nothing is accepted until his own eye accepts it, and that file is
// the only place his acceptances live, each with the date and HIS OWN WORDS.
//
// Deliberately NOT counted here: the roadmap's finished rows. Board row B20
// records, measured, that nobody can count that file the same way twice, and a
// number nobody can reproduce is worse than no number. The page says so rather
// than inventing one.
function onaylar() {
  const raw = JSON.parse(readFileSync(ONAY, "utf8"));
  return Object.entries(raw)
    .filter(([k]) => !k.startsWith("_"))
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.id.localeCompare(b.id));
}

function gunEtiketi(iso) {
  const g = daysSince(iso);
  if (g === null) return "";
  if (g <= 0) return `<span class="bugun">BUGÜN</span>`;
  if (g === 1) return `<span class="bugun dun">DÜN</span>`;
  return `<span class="yas">${g} gün önce</span>`;
}

function onayKarti(o) {
  const sozu = o.verbatim
    ? `<blockquote class="sozu">${esc(o.verbatim)}</blockquote>`
    : `<div class="uyari">⚠ Bu onayın sizin kendi cümleniz kayda geçmemiş — aşağıda yalnız kaydın kendi tarifi var.</div>`;
  return `
<article class="satir onay" data-owner="biten" data-id="${esc(o.id)}" data-ara="${esc(((o.verbatim || "") + " " + (o.what || "") + " " + o.id).toLowerCase())}">
  <header class="ust">
    <span class="rozet biten">ONAYLADINIZ</span>
    <span class="tarih">${esc(String(o.date || "tarihsiz"))}</span>
    ${gunEtiketi(String(o.date || ""))}
  </header>
  ${sozu}
  <details>
    <summary>Bu onayın tamamını aç</summary>
    <div class="tam">
      <p class="dilnot">Aşağısı onay defterinin kendi metnidir — kayıt dili İngilizcedir.</p>
      <h4>Neyi onayladınız</h4><p>${md(String(o.what || "—"))}</p>
      ${o.conditions ? `<h4>Şartınız</h4><p>${md(String(o.conditions))}</p>` : ""}
      ${o.where ? `<h4>Kaydı nerede duruyor</h4><p>${md(String(o.where))}</p>` : ""}
      <h4>Onayın kimliği</h4><p><code>${esc(o.id)}</code></p>
    </div>
  </details>
</article>`;
}

// ----------------------------------------------------------------------- main
const text = readFileSync(BOARD, "utf8");
const rows = parse(text);
const tr = existsSync(TR) ? JSON.parse(readFileSync(TR, "utf8")) : {};

const groups = { ceo: [], ortak: [], yazar: [], kapandi: [] };
for (const r of rows) groups[owner(r)].push(r);

const ONAYLAR = onaylar();
const bugunOnay = ONAYLAR.filter((o) => daysSince(String(o.date || "")) === 0).length;
const dunOnay = ONAYLAR.filter((o) => daysSince(String(o.date || "")) === 1).length;

const sayim = {
  toplam: rows.length,
  acik: rows.filter((r) => !r.closed).length,
  ceo: groups.ceo.length,
  ortak: groups.ortak.length,
  yazar: groups.yazar.length,
  kapandi: groups.kapandi.length,
  ceviriYok: rows.filter((r) => !tr[r.id]).length,
  ceviriEski: rows.filter((r) => tr[r.id] && tr[r.id].hash !== fingerprint(r.body)).length,
  onay: ONAYLAR.length,
  bugunOnay,
  dunOnay,
};

const HAREKET = movement({ refresh: process.argv.includes("--movement-refresh") }).hareket;

const bolum = (key, baslik, aciklama) => {
  const list = groups[key];
  if (list.length === 0) {
    // Zero is a real answer — his own design law. It is said, not hidden.
    return `<section><h2>${baslik} <span class="adet">0</span></h2><p class="bos">Bu bölümde açık satır yok.</p></section>`;
  }
  return `<section><h2>${baslik} <span class="adet">${list.length}</span></h2>
  <p class="aciklama">${aciklama}</p>
  <div class="liste">${list.map((r) => card(r, tr, HAREKET)).join("")}</div></section>`;
};

const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DXB — Açık İşler Tahtası</title>
<style>
:root{
  --zemin:#0a0c10; --kart:#12161d; --kart2:#161b24; --cizgi:#232b37;
  --metin:#e8ecf3; --sonuk:#94a3b8; --altin:#d9b26a; --altin2:#f0d9a8;
  --ceo:#e0b357; --ortak:#8fb8e8; --yazar:#6f7b8c; --kapandi:#3f5a45; --uyari:#e0745a; --bitti:#7ab68a;
}
*{box-sizing:border-box}
body{margin:0;background:var(--zemin);color:var(--metin);
  font:16px/1.6 "Inter","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
/* HIS COMPLAINT C62, and this page committed it on its first render:
   "34 INC EKRAN KOCA BOS SAYFA!" — a 1600 px column on a 3440 px screen left
   more empty ground than content. The page now takes the width it is given and
   lays the rows out in as many columns as the screen can carry, and an OPEN row
   takes the full width back because long text is unreadable in a narrow well. */
.sayfa{max-width:none;margin:0;padding:26px clamp(16px,2.2vw,44px) 90px}
.liste{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(660px,1fr));align-items:start}
.liste .satir:has(details[open]){grid-column:1/-1}
@media (max-width:1400px){.liste{grid-template-columns:1fr}}
header.tepe{border-bottom:1px solid var(--cizgi);padding-bottom:20px;margin-bottom:8px}
h1{font-size:26px;letter-spacing:.14em;font-weight:600;margin:0 0 6px;color:var(--altin2)}
.altyazi{color:var(--sonuk);font-size:14px;margin:0}
.ozet{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 0}
.kutu{flex:1 1 190px}
.kutu{background:var(--kart);border:1px solid var(--cizgi);border-radius:10px;padding:12px 18px;min-width:150px}
.kutu .sayi{font-size:26px;font-weight:700;color:var(--altin)}
.kutu .ad{font-size:12px;color:var(--sonuk);letter-spacing:.06em;text-transform:uppercase}
.arac{display:flex;flex-wrap:wrap;gap:10px;align-items:center;position:sticky;top:0;z-index:5;
  background:linear-gradient(var(--zemin) 78%,transparent);padding:16px 0 14px;margin-top:14px}
button.f{background:var(--kart);color:var(--metin);border:1px solid var(--cizgi);
  border-radius:999px;padding:9px 18px;font-size:14px;cursor:pointer}
button.f:hover{border-color:var(--altin)}
button.f[aria-pressed=true]{background:var(--altin);color:#14100a;border-color:var(--altin);font-weight:600}
input.ara{flex:1;min-width:220px;background:var(--kart);border:1px solid var(--cizgi);
  border-radius:10px;padding:10px 16px;color:var(--metin);font-size:15px}
input.ara::placeholder{color:var(--sonuk)}
section{margin:34px 0 0}
h2{font-size:15px;letter-spacing:.16em;text-transform:uppercase;color:var(--altin);
  border-bottom:1px solid var(--cizgi);padding-bottom:10px;margin:0 0 6px;font-weight:600}
.adet{color:var(--sonuk);font-weight:400;letter-spacing:0}
.aciklama{color:var(--sonuk);font-size:14px;margin:10px 0 16px}
.bos{color:var(--sonuk);font-size:14px;font-style:italic;padding:14px 0}
.satir{background:var(--kart);border:1px solid var(--cizgi);border-left:3px solid var(--yazar);
  border-radius:10px;padding:16px 20px;margin:0}
.satir[data-owner=ceo]{border-left-color:var(--ceo)}
.satir[data-owner=ortak]{border-left-color:var(--ortak)}
.satir[data-owner=kapandi]{border-left-color:var(--kapandi);opacity:.72}
.ust{display:flex;flex-wrap:wrap;gap:12px;align-items:center;font-size:12px;color:var(--sonuk)}
.rozet{font-size:11px;letter-spacing:.1em;padding:3px 10px;border-radius:999px;
  border:1px solid currentColor;text-transform:uppercase}
.rozet.ceo{color:var(--ceo)} .rozet.ortak{color:var(--ortak)}
.rozet.yazar{color:var(--yazar)} .rozet.kapandi{color:var(--kapandi)} .rozet.biten{color:var(--bitti)}
.satir[data-owner=biten]{border-left-color:var(--bitti)}
.kutu.bitti .sayi{color:var(--bitti)}
.bugun{margin-left:auto;background:var(--bitti);color:#0a0c10;font-weight:700;
  font-size:11px;letter-spacing:.1em;padding:3px 10px;border-radius:999px}
.bugun.dun{background:var(--ortak)}
.sozu{margin:12px 0 8px;padding:12px 16px;border-left:3px solid var(--bitti);
  background:rgba(122,182,138,.07);border-radius:0 8px 8px 0;font-size:15.5px;
  line-height:1.65;color:var(--metin);overflow-wrap:anywhere}
.sozu::before{content:"« "}.sozu::after{content:" »"}
.kimlik{font-weight:700;color:var(--metin);letter-spacing:.06em}
.yas{margin-left:auto}
.baslik{font-size:18px;font-weight:600;margin:10px 0 8px;line-height:1.45}
.satir[data-owner=ceo] .baslik{color:var(--altin2)}
.kim{font-size:14px;color:var(--sonuk);margin:0 0 10px}
.kim b{color:var(--metin);font-weight:600}
.uyari{color:var(--uyari);font-size:13px;border:1px solid var(--uyari);border-radius:8px;
  padding:8px 12px;margin:0 0 10px;background:rgba(224,116,90,.07)}
details summary{cursor:pointer;color:var(--altin);font-size:13.5px;letter-spacing:.04em;
  padding:6px 0;user-select:none}
details[open] summary{color:var(--altin2)}
.tam{background:var(--kart2);border:1px solid var(--cizgi);border-radius:8px;
  padding:6px 20px 16px;margin-top:8px}
.tam h4{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--altin);
  margin:18px 0 6px;font-weight:600}
.tam p{margin:0;font-size:14.5px;line-height:1.75;color:#cfd7e3;overflow-wrap:anywhere}
.tam code{background:#0c0f14;border:1px solid var(--cizgi);border-radius:4px;
  padding:1px 5px;font-size:13px;color:var(--altin2)}
.spec{color:var(--ortak)}
.dilnot{color:var(--sonuk);font-size:12.5px;font-style:italic;margin:14px 0 0}
.hareket{font-size:13px;color:var(--sonuk);margin:0 0 10px}
.hareket b{color:var(--metin);font-weight:600}
.hareket.taze{color:var(--bitti)} .hareket.taze b{color:var(--bitti)}
.hareket.bayat{color:#9a7b6a} .hareket.bayat b{color:#9a7b6a}
.hlist{margin:0;padding-left:18px;font-size:13.5px;line-height:1.8;color:#cfd7e3}
.hlist .ht{color:var(--altin);font-variant-numeric:tabular-nums}
.hlist code{background:#0c0f14;border:1px solid var(--cizgi);border-radius:4px;padding:0 5px;font-size:12px}
.arananlar{margin:16px 0 0;padding:12px 18px;border:1px solid var(--altin);border-radius:10px;
  background:rgba(217,178,106,.07);color:var(--metin);font-size:14.5px;display:none}
.arananlar.gorunur{display:block}
.arananlar b{color:var(--altin2)}
.dip{margin-top:60px;padding-top:18px;border-top:1px solid var(--cizgi);
  color:var(--sonuk);font-size:13px;line-height:1.8}
@media (max-width:900px){.sayfa{padding:20px 16px 70px}.yas{margin-left:0}}
</style></head>
<body><div class="sayfa">

<header class="tepe">
  <h1>AÇIK İŞLER TAHTASI</h1>
  <p class="altyazi">DXB Global AI-Native Holding OS — "ne kaldı" sorusunun tek cevabı.
  Bu sayfa <code>00-BOARD-OPEN-WORK.md</code> dosyasının kendisini okur, kendi kopyasını tutmaz.
  <b>Tahta her değiştiğinde saniyeler içinde kendini yeniler</b> ve açık duran bu sayfa da
  kendiliğinden tazelenir — siz hiçbir şeye basmazsınız.</p>
  <div class="ozet">
    <div class="kutu"><div class="sayi">${sayim.acik}</div><div class="ad">açık satır</div></div>
    <div class="kutu"><div class="sayi">${sayim.ceo}</div><div class="ad">sizi bekliyor</div></div>
    <div class="kutu"><div class="sayi">${sayim.ortak}</div><div class="ad">ortak</div></div>
    <div class="kutu"><div class="sayi">${sayim.yazar}</div><div class="ad">beni bekliyor</div></div>
    <div class="kutu"><div class="sayi">${sayim.kapandi}</div><div class="ad">tahtada kapandı</div></div>
    <div class="kutu bitti"><div class="sayi">${sayim.onay}</div><div class="ad">onayladığınız iş</div></div>
  </div>
  <p class="altyazi" style="margin-top:14px">Okunduğu an: <b>${CLOCK}</b>${
    sayim.ceviriYok || sayim.ceviriEski
      ? ` · <span style="color:var(--uyari)">⚠ ${sayim.ceviriYok} satırın Türkçe özeti yok, ${sayim.ceviriEski} satırın özeti eskimiş olabilir — o satırlar kendi üzerinde bunu yazar.</span>`
      : ` · Türkçe özetlerin tamamı satırların bugünkü metniyle eşleşiyor.`
  }</p>
</header>

<div class="arac">
  <button class="f" data-f="hepsi" aria-pressed="true">Hepsi</button>
  <button class="f" data-f="ceo" aria-pressed="false">Sizi bekleyenler</button>
  <button class="f" data-f="ortak" aria-pressed="false">Ortak</button>
  <button class="f" data-f="yazar" aria-pressed="false">Beni bekleyenler</button>
  <button class="f" data-f="kapandi" aria-pressed="false">Kapananlar</button>
  <button class="f" data-f="biten" aria-pressed="false">Bitenler — onayladıklarınız</button>
  <input class="ara" type="search" placeholder="Ara — kelime, satır numarası (B39, C60), kişi…">
  <button class="f" id="hepsiniAc">Bütün satırları aç</button>
</div>

<div class="arananlar" id="arananlar"></div>

${bolum("ceo", "Sizi bekleyenler", "Bunlar bende değil, sizde. Bir cümlenizle hareket ederler — para, kimlik, onay veya sizin gözünüz gerekiyor.")}
${bolum("ortak", "Ortak — ben yaparım, onayı sizin", "İşi ben yaparım; kararı, onayı veya parayı siz verirsiniz.")}
${bolum("yazar", "Beni bekleyenler", "Sizden hiçbir şey beklemiyor. Bunlar benim işim; sıra bende.")}
${bolum("kapandi", "Tahtada kapanan satırlar", "Bitmiş ve kaydı kanıtıyla duran satırlar. Bir satır kapanınca tahtadan silinmez — kanıtıyla birlikte burada durur.")}

<section id="bitenler"><h2>Bitenler — sizin kendi onay defteriniz <span class="adet">${sayim.onay}</span></h2>
  <p class="aciklama">
    Tahta "ne kaldı" sorusunun cevabıdır; bir iş bitince oradan çıkar. <b>"Ne bitti" sorusunun tek doğru cevabı ise bu defterdir:</b>
    KANUN B gereği hiçbir iş siz kendi gözünüzle bakıp «tamam» demeden bitmiş sayılmaz, ve bu defter sizin
    o «tamam»larınızın tamamını tutar — tarihiyle ve <b>sizin kendi cümlenizle</b>.
    En yenisi üstte. ${sayim.bugunOnay > 0 ? `<b>Bugün: ${sayim.bugunOnay} onay.</b>` : `Bugün henüz yeni bir onayınız yok.`}
    ${sayim.dunOnay > 0 ? `Dün: ${sayim.dunOnay}.` : ""}
    <br><b>Burada olmayan bir şey var ve bilerek yok:</b> yol haritasındaki bitmiş satırların sayısı.
    O dosyanın durumu makineyle okunamıyor, her oturum başka sayı çıkarıyor — tahtadaki <b>B20</b> satırı tam olarak bunu düzeltmek için açık.
    Kimsenin tekrar üretemeyeceği bir sayıyı size vermektense hiç vermemeyi seçtim.
  </p>
  <div class="liste">${ONAYLAR.map(onayKarti).join("")}</div>
</section>

<p class="dip">
Kaynak: <code>HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md</code> ·
Türkçe özetler: <code>scripts/board/tr.json</code> ·
Bu sayfayı üreten: <code>scripts/board/render.mjs</code><br>
Bu sayfa yalnız <b>okur</b>. Tahtaya hiçbir şey yazmaz, şirketin veri tabanına bağlanmaz,
ve bu makinenin dışına çıkmaz.<br>
Tazelemek için: <code>pnpm tahta</code>
</p>

</div>
<script>
const satirlar = [...document.querySelectorAll('.satir')];
const dugmeler = [...document.querySelectorAll('button.f[data-f]')];
const arama = document.querySelector('input.ara');
const haber = document.getElementById('arananlar');
let suzgec = 'hepsi';

const BOLUM_ADI = {
  ceo: 'Sizi bekleyenler', ortak: 'Ortak', yazar: 'Beni bekleyenler',
  kapandi: 'Tahtada kapananlar', biten: 'Bitenler — onay defteriniz',
};

function uygula(){
  const q = arama.value.trim().toLowerCase();

  // ARAMA FİLTREYE TAKILMAZ. Measured on his own screen, 2026-08-26: he typed
  // "B12" while the "Bitenler" button was pressed, and the page showed him
  // nothing — B12 is an open row and the filter was hiding it. A search is a
  // lookup, not a subset of whatever button happens to be pressed, so a
  // non-empty search looks EVERYWHERE and then says where it found things.
  const ariyor = q.length > 0;
  const bulunan = {};
  for (const s of satirlar){
    const eslesme = !q || s.dataset.ara.includes(q);
    const sahip = ariyor
      ? true
      : (suzgec === 'hepsi' ? (s.dataset.owner !== 'kapandi' && s.dataset.owner !== 'biten')
                            : s.dataset.owner === suzgec);
    const goster = sahip && eslesme;
    s.style.display = goster ? '' : 'none';
    if (goster && ariyor) bulunan[s.dataset.owner] = (bulunan[s.dataset.owner] || 0) + 1;
  }

  for (const bolum of document.querySelectorAll('section')){
    const gorunur = [...bolum.querySelectorAll('.satir')].some(s => s.style.display !== 'none');
    bolum.style.display = (gorunur || (!ariyor && bolum.querySelector('.bos'))) ? '' : 'none';
  }

  if (!ariyor){
    haber.classList.remove('gorunur');
    haber.innerHTML = '';
  } else {
    const toplam = Object.values(bulunan).reduce((a,b)=>a+b,0);
    haber.classList.add('gorunur');
    if (toplam === 0){
      haber.innerHTML = '«<b>' + arama.value.trim() + '</b>» diye bir şey tahtada yok. Yazımı kontrol edin, ya da kutuyu boşaltıp listeye dönün.';
    } else {
      const nerede = Object.entries(bulunan)
        .map(([k,v]) => '<b>' + (BOLUM_ADI[k] || k) + '</b> bölümünde ' + v)
        .join(' · ');
      haber.innerHTML = '«<b>' + arama.value.trim() + '</b>» için ' + toplam + ' sonuç — ' + nerede
        + '. <i>Arama, üstteki düğmeleri dinlemez: nerede olursa olsun bulur.</i>';
    }
  }
  durumuSakla();
}

for (const d of dugmeler){
  d.addEventListener('click', () => {
    suzgec = d.dataset.f;
    arama.value = '';
    for (const o of dugmeler) o.setAttribute('aria-pressed', String(o === d));
    uygula();
  });
}
arama.addEventListener('input', uygula);

document.getElementById('hepsiniAc').addEventListener('click', (e) => {
  const acik = satirlar.some(s => s.querySelector('details')?.open);
  for (const s of satirlar) { const d = s.querySelector('details'); if (d) d.open = !acik; }
  e.target.textContent = acik ? 'Bütün satırları aç' : 'Bütün satırları kapat';
});

// WHERE HE WAS, KEPT ACROSS A REFRESH. The page reloads itself so that a change
// on the board reaches him without a keystroke; a reload that threw away his
// scroll position, his filter and his open rows would make that a punishment.
function durumuSakla(){
  try {
    sessionStorage.setItem('dxb-tahta', JSON.stringify({
      suzgec, q: arama.value, y: window.scrollY,
      acik: satirlar.filter(s => s.querySelector('details')?.open).map(s => s.dataset.id),
    }));
  } catch { /* private window, or storage refused — the page still works */ }
}
function durumuGeriYukle(){
  try {
    const d = JSON.parse(sessionStorage.getItem('dxb-tahta') || 'null');
    if (!d) return;
    suzgec = d.suzgec || 'hepsi';
    arama.value = d.q || '';
    for (const o of dugmeler) o.setAttribute('aria-pressed', String(o.dataset.f === suzgec));
    const acik = new Set(d.acik || []);
    for (const s of satirlar){ const t = s.querySelector('details'); if (t && acik.has(s.dataset.id)) t.open = true; }
    uygula();
    window.scrollTo(0, d.y || 0);
  } catch { /* nothing stored, or storage refused */ }
}
window.addEventListener('scroll', () => { clearTimeout(window.__k); window.__k = setTimeout(durumuSakla, 250); });

durumuGeriYukle();
uygula();

// The page keeps itself current. The file behind it is rewritten within seconds
// of the board changing (dxb-board.service), so a quiet reload is what turns
// this from a photograph into a window.
setInterval(() => { durumuSakla(); location.reload(); }, 45000);
</script>
</body></html>`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html, "utf8");

console.log(`tahta yazıldı: ${OUT}`);
console.log(`satır: ${sayim.toplam} · açık ${sayim.acik} · sizi bekleyen ${sayim.ceo} · ortak ${sayim.ortak} · beni bekleyen ${sayim.yazar} · kapanan ${sayim.kapandi}`);
console.log(`türkçe özeti olmayan: ${sayim.ceviriYok} · eskimiş olabilecek: ${sayim.ceviriEski}`);

if (process.argv.includes("--fingerprints")) {
  // The helper that writes tr.json honestly: every row's id beside the
  // fingerprint of the English text a Turkish line must be written against.
  const out = {};
  for (const r of rows) out[r.id] = fingerprint(r.body);
  console.log(JSON.stringify(out, null, 2));
}

if (process.argv.includes("--open")) {
  execFile("xdg-open", [OUT], (e) => { if (e) console.error(`açılamadı: ${e.message}`); });
}
