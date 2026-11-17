#!/usr/bin/env node
// What the file-size ratchet did since a date: the commits it stopped, the escapes taken, and
// how much the already large files grew — so the rule is judged on what happened, not on a
// guess (his word, 2026-11-17: count the stops and the escapes for two weeks, in a way every
// session can follow).
//
//   node scripts/ops/dxb-size-report.mjs [--since 2026-11-17] [--until 2026-12-01]
//
// It reads the three logs the guard writes outside the repository
// (~/.local/state/dxb/size-{stops,escapes,growth}.log) and counts the commits of the same
// period from git. Read-only. A log that does not exist yet counts as zero lines.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TRIAL_START = '2026-11-17';
export const TRIAL_END = '2026-12-01';

/** Log lines are `ISO time \t working directory \t detail`; only this repository's are counted. */
export function parse(text, root) {
  return text.split('\n').filter(Boolean).map((line) => {
    const [at, cwd, detail = ''] = line.split('\t');
    return { at, cwd, detail };
  }).filter((e) => e.cwd === root);
}

export const within = (entries, since, until) =>
  entries.filter((e) => e.at.slice(0, 10) >= since && e.at.slice(0, 10) <= until);

/** Stop and growth details are `kind:before:after:path` items joined by ` | `. */
export function findings(entries) {
  return entries.flatMap((e) => e.detail.split(' | ').filter(Boolean).map((item) => {
    const [kind, before, after, ...path] = item.split(':');
    return { kind, before: Number(before), after: Number(after), path: path.join(':') };
  }));
}

export function summarize({ stops, escapes, growth, commits }) {
  const stopped = findings(stops);
  const grown = findings(growth);
  const count = (list, kind) => list.filter((f) => f.kind === kind).length;
  const top = (list) => Object.entries(list.reduce((m, f) => ({ ...m, [f.path]: (m[f.path] || 0) + 1 }), {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 10);
  return {
    commits,
    stops: stops.length,
    stopsNew: count(stopped, 'new'),
    stopsCrossed: count(stopped, 'crossed'),
    escapes: escapes.length,
    growthCommits: growth.length,
    grownBytes: grown.reduce((n, f) => n + (f.after - f.before), 0),
    topStopped: top(stopped),
    topGrown: top(grown),
  };
}

const direct = () => {
  try { return resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]); } catch { return false; }
};
if (process.argv[1] && direct()) {
  const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : fallback; };
  const since = arg('--since', TRIAL_START);
  const until = arg('--until', TRIAL_END);
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const read = (name) => {
    try { return within(parse(readFileSync(join(homedir(), '.local', 'state', 'dxb', name), 'utf8'), root), since, until); } catch { return []; }
  };
  const commits = Number(execFileSync('git', ['-C', root, 'rev-list', '--count', '--no-merges',
    `--since=${since}T00:00:00`, `--until=${until}T23:59:59`, 'HEAD'], { encoding: 'utf8' }).trim());
  const s = summarize({ stops: read('size-stops.log'), escapes: read('size-escapes.log'), growth: read('size-growth.log'), commits });
  const lines = [
    `dosya boyutu bekçisi — ${since} … ${until}`,
    `  commit: ${s.commits}`,
    `  durdurma: ${s.stops} (yeni büyük dosya ${s.stopsNew}, sınırı geçen ${s.stopsCrossed})`,
    `  kaçış (DXB_SKIP_SIZE=1): ${s.escapes}`,
    `  zaten büyük dosyanın büyüdüğü commit: ${s.growthCommits} (toplam +${s.grownBytes} bayt)`,
  ];
  if (s.topStopped.length) lines.push('  en çok durdurulan: ' + s.topStopped.map(([p, n]) => `${n}× ${p}`).join(', '));
  if (s.topGrown.length) lines.push('  en çok büyüyen: ' + s.topGrown.map(([p, n]) => `${n}× ${p}`).join(', '));
  lines.push('  not: bir durdurma, commit yeniden denendiğinde yeniden sayılır; durdurma sayısı deneme sayısıdır.');
  console.log(lines.join('\n'));
}
