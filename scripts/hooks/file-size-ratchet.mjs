#!/usr/bin/env node
// The file-size ratchet (his yes, 2026-11-17; row w042 of the 24 Sep - 16 Nov WhatsApp tab).
//
// Every session reads a code file whole, so a large file costs context on every job and is
// where edits go wrong. The ratchet turns one way only:
//   - a NEW code file may not enter the repository above LIMIT_TOKENS;
//   - a code file that is already above it may be edited, moved or shrunk, but may not GROW.
// Tokens are estimated as bytes / 4 — coarse, and the same for everyone.
//
// It reads the staged change as git itself records it (`git diff --cached --raw`: the old and
// the new blob of every entry), so a size is read from a blob id and never looked up by path.
// It needs no dependency, and judges hand-written code only: records, data, migrations, seeds,
// fixtures, snapshots, minified files and the `.agents` mirror are outside it (a migration is
// never split). A script without an extension is not seen.
//
// It stands aside while git replays commits that were judged when they were made — a merge, a
// revert, a cherry-pick, a rebase — so it never stops one of those in the middle.
//
// Called by scripts/hooks/pre-commit. Exit 0 = pass, 1 = blocked (or the guard itself failed,
// said plainly). DXB_SKIP_SIZE=1 lets one commit through; say so in the commit's report.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIMIT_TOKENS = 5000;
export const BYTES_PER_TOKEN = 4;
export const LIMIT_BYTES = LIMIT_TOKENS * BYTES_PER_TOKEN;

const CODE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|py|sh|bash|zsh|sql|php|rb|go|rs|vue|svelte|css|scss|sass|less)$/i;
const OUTSIDE = [
  /^db\/migrations\//, /^db\/seed\//, /^\.agents\//, /(^|\/)node_modules\//,
  /(^|\/)fixtures?\//, /(^|\/)__snapshots__\//, /\.min\.(js|css)$/i,
];
const REGULAR = new Set(['100644', '100755']);

export const judged = (path) => CODE.test(path) && !OUTSIDE.some((re) => re.test(path));
export const tokens = (bytes) => Math.ceil(bytes / BYTES_PER_TOKEN);

/**
 * One finding per staged file that breaks the ratchet.
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
    if (f.kind === 'new') lines.push(`  YENİ      ${f.path} — ${size}; en az ${Math.ceil(f.after / LIMIT_BYTES)} parçaya bölünür`);
    else if (f.kind === 'crossed') lines.push(`  SINIRI GEÇTİ ${f.path} — ${f.before} → ${size}; sınırın ${f.after - LIMIT_BYTES} bayt üstünde`);
    else lines.push(`  BÜYÜDÜ    ${f.path} — ${f.before} → ${size}, +${f.after - f.before} bayt; zaten büyük bir dosya büyüyemez`);
  }
  lines.push(
    'Nasıl bölünür — boyuta göre değil, SORUMLULUĞA göre:',
    '  1. dosyadaki işleri sorumluluğa göre grupla (utils2, utils3 değil; her parçanın bir adı ve bir işi olur);',
    '  2. kodu birebir taşı — sığdırmak için yorum silme, davranış değiştirme;',
    '  3. çağıranlar bozulmasın: dilin izin verdiği yerde (TS/JS modülü gibi) eski dosya parçaları yeniden dışa',
    '     aktaran ince giriş noktası kalır; betik, CSS ya da çalıştırılan giriş dosyasında çağıranları yeni yola çevir;',
    '     yeni parça eski dosyayı geri içe aktarmaz (döngü olmasın);',
    '  4. testleri koş.',
    'Zaten büyük bir dosyaya ekleme yapacaksan: yeni kodu yeni dosyaya yaz ve eski dosyadan, eklediğin bağlantı',
    'satırlarından fazlasını yeni dosyaya taşı — eski dosyanın toplam boyutu artmamalı.',
    'Bu commit gerçekten böyle girmeliyse (ör. eski büyük sürüme geri dönüş): DXB_SKIP_SIZE=1 ile geçer; raporda söylenir.', '');
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
  const entries = parseRaw(git(['diff', '--cached', '--raw', '-z', '-M', '--no-abbrev', '--diff-filter=ACMRT']));
  const size = (id) => Number(git(['cat-file', '-s', id]).trim()); // a blob that cannot be read is an error, never zero
  return entries
    .filter((e) => REGULAR.has(e.newMode) && judged(e.path)) // a symlink or a submodule is not a code file
    .map((e) => {
      // "Before" exists when this path, or the path it was moved from, held a regular file.
      const had = (e.status === 'M' || e.status === 'R' || e.status === 'T') && REGULAR.has(e.oldMode);
      return { path: e.path, before: had ? size(e.oldId) : null, after: size(e.newId) };
    });
}

/** True while git is replaying commits that were judged when they were made. */
export function replaying() {
  const dir = git(['rev-parse', '--absolute-git-dir']).trim();
  return ['MERGE_HEAD', 'REVERT_HEAD', 'CHERRY_PICK_HEAD', 'rebase-merge', 'rebase-apply'].some((n) => existsSync(join(dir, n)));
}

// The path is compared decoded: this repository's folder name has spaces in it.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.env.DXB_SKIP_SIZE === '1') {
    console.error('dosya boyutu cırcırı: DXB_SKIP_SIZE=1 ile atlandı — raporda söyle.');
    process.exit(0);
  }
  let found;
  try {
    if (replaying()) process.exit(0);
    found = verdicts(staged());
  } catch (err) {
    const why = String(err.stderr || err.message || err).trim().split('\n')[0];
    console.error(`\nCOMMIT DURDURULDU — dosya boyutu cırcırı çalışamadı (git okunamadı): ${why}`);
    console.error('Dosyaların boyutu ölçülemedi; sorun git tarafında. Giderilemiyorsa DXB_SKIP_SIZE=1 ile geçilir, raporda söylenir.\n');
    process.exit(1);
  }
  if (found.length) { console.error(message(found)); process.exit(1); }
}
