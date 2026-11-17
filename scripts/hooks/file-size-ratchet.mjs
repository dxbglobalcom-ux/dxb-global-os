#!/usr/bin/env node
// The file-size ratchet (his yes, 2026-11-17; row w042 of the 24 Sep - 16 Nov WhatsApp tab).
//
// Every session reads a code file whole, so a large file costs context on every job and is
// where edits go wrong. The ratchet turns one way only:
//   - a NEW code file may not enter the repository above LIMIT_TOKENS;
//   - a code file that is already above it may be edited, but may not GROW.
// Tokens are estimated as bytes / 4 — coarse, and the same for everyone.
//
// It reads staged content only (the index against HEAD), needs no dependency, and judges code
// only: records, data, migrations, seeds, fixtures, lock files, generated and vendored files
// are outside it (a migration is never split).
//
// Called by scripts/hooks/pre-commit. Exit 0 = pass, 1 = blocked.
// DXB_SKIP_SIZE=1 lets one commit through; say so out loud in the commit's report when you use it.

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const LIMIT_TOKENS = 5000;
export const BYTES_PER_TOKEN = 4;

const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|py|sh|css)$/;
const OUTSIDE = [
  /^db\/migrations\//, /^db\/seed\//, /^\.agents\//, /(^|\/)node_modules\//, /(^|\/)vendor\//,
  /(^|\/)fixtures?\//, /(^|\/)__snapshots__\//, /(^|\/)(dist|build|generated)\//,
  /\.min\.(js|css)$/, /\.d\.ts$/, /\.generated\./,
];

export const judged = (path) => CODE.test(path) && !OUTSIDE.some((re) => re.test(path));
export const tokens = (bytes) => Math.ceil(bytes / BYTES_PER_TOKEN);

/** One finding per staged file that breaks the ratchet. `before` is null for a new file. */
export function verdicts(files) {
  const out = [];
  for (const { path, before, after } of files) {
    if (!judged(path)) continue;
    const now = tokens(after);
    if (now <= LIMIT_TOKENS) continue;
    if (before === null) out.push({ path, kind: 'new', now, was: 0 });
    else if (after > before) out.push({ path, kind: 'grew', now, was: tokens(before) });
  }
  return out;
}

export function message(found) {
  const lines = ['', `COMMIT DURDURULDU — dosya boyutu cırcırı (sınır ${LIMIT_TOKENS} token, bayt/4):`];
  for (const f of found) {
    const parts = Math.ceil(f.now / LIMIT_TOKENS);
    lines.push(f.kind === 'new'
      ? `  YENİ   ${f.path} — ${f.now} token; en az ${parts} parçaya bölünür`
      : `  BÜYÜDÜ ${f.path} — ${f.was} → ${f.now} token (+${f.now - f.was}); zaten büyük bir dosya büyüyemez`);
  }
  lines.push(
    'Nasıl bölünür — boyuta göre değil, SORUMLULUĞA göre:',
    '  1. dosyadaki işleri sorumluluğa göre grupla (utils2, utils3 değil; her parçanın bir adı ve bir işi olur);',
    '  2. kodu birebir taşı — sığdırmak için yorum silme, davranış değiştirme;',
    '  3. eski dosya, parçaları yeniden dışa aktaran ince bir giriş noktası kalır (çağıranlar bozulmaz);',
    '  4. testleri koş.',
    'Büyüyen eski dosyada: yeni kodu yeni bir dosyaya yaz, eskisinden çağır.',
    'Bu commit gerçekten böyle girmeliyse: DXB_SKIP_SIZE=1 ile geçer; raporda açıkça söylenir.', '');
  return lines.join('\n');
}

function git(args) {
  // stderr is dropped: for a new file git says "exists on disk, but not in 'HEAD'", which is expected here.
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
}
function size(spec) {
  try { return Number(git(['cat-file', '-s', spec]).trim()); } catch { return null; }
}

export function staged() {
  const names = git(['diff', '--cached', '--name-only', '--diff-filter=AMR', '-z']).split('\0').filter(Boolean);
  return names.map((path) => ({ path, before: size(`HEAD:${path}`), after: size(`:${path}`) ?? 0 }));
}

// The path is compared decoded: this repository's folder name has spaces in it.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.env.DXB_SKIP_SIZE === '1') {
    console.error('dosya boyutu cırcırı: DXB_SKIP_SIZE=1 ile atlandı — raporda söyle.');
    process.exit(0);
  }
  const found = verdicts(staged());
  if (found.length) { console.error(message(found)); process.exit(1); }
}
