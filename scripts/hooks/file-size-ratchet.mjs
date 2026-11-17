#!/usr/bin/env node
// The file-size ratchet (his yes, 2026-11-17; row w042 of the 24 Sep - 16 Nov WhatsApp tab).
//
// Every session reads a code file whole, so a large file costs context on every job and is
// where edits go wrong. The rule binds what is made from now on and leaves the old alone
// (his word, 2026-11-17 evening, after the replay: the first form — "a large file may not
// grow" — would have stopped one commit in seven):
//   - a NEW code file may not enter the repository above LIMIT_TOKENS;
//   - a code file under the limit may not be taken OVER it;
//   - a code file that was already above it is left alone: it may be edited, moved, shrunk or
//     grown. Its growth is named in one line and stops nothing. The large files are a closed
//     list: nothing joins it, and one that shrinks under the limit is bound from then on.
// Tokens are estimated as bytes / 4 — coarse, and the same for everyone.
//
// It reads the staged change as git itself records it (`git diff --cached --raw`: the old and
// the new blob of every entry), so a size is read from a blob id and never looked up by path.
// It needs no dependency, and judges hand-written code only: records, data, migrations, seeds,
// fixtures, snapshots, minified files, the `.agents` mirror and everything under `.planning/`
// (the records and each job's evidence, which is filed as it was) are outside it (a migration
// is never split). A script without an extension is not seen.
//
// It stands aside while git replays commits that were judged when they were made — a merge, a
// revert, a cherry-pick, a rebase — so it never stops one of those in the middle; it says so in
// one line naming the state it saw, because a state file left behind would switch it off.
//
// Known limits: a commit amended after a shrink is compared with the commit it amends; a file
// moved and rewritten beyond git's rename similarity reads as new; a merge can take a file over
// the limit unjudged.
//
// Called by scripts/hooks/pre-commit. Exit 0 = pass, 1 = blocked (or the guard itself failed,
// said plainly). DXB_SKIP_SIZE=1 lets one commit through; say so in the commit's report. Every
// escape is one line in ~/.local/state/dxb/size-escapes.log, so how often it is used can be counted.

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIMIT_TOKENS = 5000;
export const BYTES_PER_TOKEN = 4;
export const LIMIT_BYTES = LIMIT_TOKENS * BYTES_PER_TOKEN;

const CODE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|py|sh|bash|zsh|sql|php|rb|go|rs|vue|svelte|css|scss|sass|less)$/i;
const OUTSIDE = [
  /^db\/migrations\//, /^db\/seed\//, /^\.agents\//, /^\.planning\//, /(^|\/)node_modules\//,
  /(^|\/)fixtures?\//, /(^|\/)__snapshots__\//, /\.min\.(js|css)$/i,
];
const REGULAR = new Set(['100644', '100755']);

export const judged = (path) => CODE.test(path) && !OUTSIDE.some((re) => re.test(path));
export const tokens = (bytes) => Math.ceil(bytes / BYTES_PER_TOKEN);

/** A finding stops the commit unless it is the growth of a file that was already large. */
export const blocks = (finding) => finding.kind !== 'grew';

/** The one line said, without stopping anything, when already large files grew. */
export function note(grown) {
  const list = grown.map((f) => `${f.path} (${f.before} → ${f.after} bayt, ~${tokens(f.after)} token)`).join(', ');
  return `dosya boyutu cırcırı: durdurulmadı — zaten büyük dosya büyüdü: ${list}. `
    + 'Yeni kod yeni dosyaya yazılırsa bu dosya her işte daha az bağlam yer.';
}

/**
 * One finding per staged file above the limit that is new, crossed it, or grew.
 * `before` is the bytes of the file it was before this commit — for a moved file, the file it
 * was moved from — and null when there was none (a new file, a copy).
 */
export function verdicts(files) {
  const out = [];
  for (const { path, before, after } of files) {
    if (!judged(path) || after <= LIMIT_BYTES) continue;
    if (before === null) out.push({ path, kind: 'new', before: 0, after });
    else if (after > before) out.push({ path, kind: before > LIMIT_BYTES ? 'grew' : 'crossed', before, after });
  }
  return out;
}

export function message(found) {
  const lines = ['', `COMMIT DURDURULDU — dosya boyutu cırcırı (sınır ${LIMIT_TOKENS} token = ${LIMIT_BYTES} bayt):`];
  for (const f of found) {
    const size = `${f.after} bayt (~${tokens(f.after)} token)`;
    if (f.kind === 'new') lines.push(`  YENİ      ${f.path} — ${size}; en az ${Math.ceil(f.after / LIMIT_BYTES)} parçaya bölünür`
      + ' (bu dosyayı yalnız TAŞIDIYSAN: eski yolunu da aynı commit\'e kat, o zaman taşıma olarak okunur)');
    else lines.push(`  SINIRI GEÇTİ ${f.path} — ${f.before} → ${size}; sınırın ${f.after - LIMIT_BYTES} bayt üstünde`);
  }
  lines.push(
    'Nasıl bölünür — boyuta göre değil, SORUMLULUĞA göre:',
    '  1. dosyadaki işleri sorumluluğa göre grupla (utils2, utils3 değil; her parçanın bir adı ve bir işi olur);',
    '  2. kodu birebir taşı — sığdırmak için yorum SİLİNMEZ, test SİLİNMEZ, davranış DEĞİŞTİRİLMEZ;',
    '  3. çağıranlar bozulmasın: dilin izin verdiği yerde (TS/JS modülü gibi) eski dosya parçaları yeniden dışa',
    '     aktaran ince giriş noktası kalır; betik, CSS ya da çalıştırılan giriş dosyasında çağıranları yeni yola çevir;',
    '     yeni parça eski dosyayı geri içe aktarmaz (döngü olmasın);',
    '  4. testleri koş.',
    'Sınırı geçen dosyada en kısa yol: eklediğin yeni kodu yeni bir dosyaya yaz, eski dosya sınırın altında kalsın.',
    'Sınırdan kaçmak için dosya muaf bir klasöre taşınmaz, uzantısı değiştirilmez, --no-verify kullanılmaz.',
    'Bölmenin şimdi yanlış olduğu iki durum var — acil bir hata düzeltmesi ve eski büyük sürüme geri dönüş:',
    'o zaman DXB_SKIP_SIZE=1 ile geçilir, raporda söylenir ve dosyanın bölünmesi sonraki iş olarak yazılır.', '');
  return lines.join('\n');
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

/** Parses `git diff --cached --raw -z -M --no-abbrev` into {status, oldMode, newMode, oldId, newId, path}. */
export function parseRaw(raw) {
  const parts = raw.split('\0');
  const out = [];
  for (let i = 0; i < parts.length; i += 1) {
    const head = parts[i];
    if (!head.startsWith(':')) continue;
    const [oldMode, newMode, oldId, newId, statusWord] = head.slice(1).split(' ');
    const status = statusWord[0];
    i += 1;
    if (status === 'R' || status === 'C') i += 1; // a rename or a copy lists its source first, then its destination
    out.push({ status, oldMode, newMode, oldId, newId, path: parts[i] });
  }
  return out;
}

/** The staged entries the ratchet judges, with their sizes read from the blobs themselves. */
export function staged() {
  const entries = parseRaw(git(['diff', '--cached', '--raw', '-z', '-M', '-l0', '--no-abbrev', '--diff-filter=ACMRT']));
  const size = (id) => Number(git(['cat-file', '-s', id]).trim()); // a blob that cannot be read is an error, never zero
  return entries
    .filter((e) => REGULAR.has(e.newMode) && judged(e.path)) // a symlink or a submodule is not a code file
    .map((e) => {
      // "Before" exists when this path, or the path it was moved from, held a regular file.
      const had = (e.status === 'M' || e.status === 'R' || e.status === 'T') && REGULAR.has(e.oldMode);
      return { path: e.path, before: had ? size(e.oldId) : null, after: size(e.newId) };
    });
}

/** The state file that says git is replaying commits judged when they were made, or null. */
export function replaying() {
  const dir = git(['rev-parse', '--absolute-git-dir']).trim();
  return ['MERGE_HEAD', 'REVERT_HEAD', 'CHERRY_PICK_HEAD', 'rebase-merge', 'rebase-apply'].find((n) => existsSync(join(dir, n))) ?? null;
}

/** One line per escape, outside the repository; never a reason to fail. */
function noteEscape() {
  try {
    const dir = join(homedir(), '.local', 'state', 'dxb');
    mkdirSync(dir, { recursive: true });
    const files = git(['diff', '--cached', '--name-only']).trim().split('\n').filter(judged).join(' ');
    appendFileSync(join(dir, 'size-escapes.log'), `${new Date().toISOString()}\t${process.cwd()}\t${files}\n`);
  } catch { /* the log is a measure, not a gate */ }
}

// The paths are compared decoded and resolved: this repository's folder name has spaces in it, and
// the script may be reached through a symlink.
const direct = () => {
  try { return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]); } catch { return false; }
};
if (process.argv[1] && direct()) {
  if (process.env.DXB_SKIP_SIZE === '1') {
    console.error('dosya boyutu cırcırı: DXB_SKIP_SIZE=1 ile atlandı — raporda söyle.');
    noteEscape();
    process.exit(0);
  }
  let found;
  try {
    const state = replaying();
    if (state) {
      console.error(`dosya boyutu cırcırı: kenara çekildi — git bir ${state} işleminin ortasında (.git/${state}). `
        + 'Böyle bir işlem yoksa o dosya artakalmıştır: kaldırılmadıkça bekçi ölçmez.');
      process.exit(0);
    }
    found = verdicts(staged());
  } catch (err) {
    const why = String(err.stderr || err.message || err).trim().split('\n')[0];
    console.error(`\nCOMMIT DURDURULDU — dosya boyutu cırcırı çalışamadı (git okunamadı): ${why}`);
    console.error('Dosyaların boyutu ölçülemedi; sorun git tarafında. Giderilemiyorsa DXB_SKIP_SIZE=1 ile geçilir, raporda söylenir.\n');
    process.exit(1);
  }
  const stops = found.filter(blocks);
  const grown = found.filter((f) => !blocks(f));
  if (grown.length) console.error(note(grown));
  if (stops.length) { console.error(message(stops)); process.exit(1); }
}
