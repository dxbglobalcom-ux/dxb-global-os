#!/usr/bin/env node
// DXB status line — model · context meter · directory · git branch.
//
// Replaces gsd-statusline.js, removed with the rest of GSD on the CEO's order
// of 2026-08-01. The only part of it he used was the context meter, and that
// part depends on nothing but the JSON Claude Code puts on stdin.
//
// Context percentage matches what the meter showed before: Claude Code reserves
// a slice of the window for auto-compaction (16.5% by default, or whatever
// CLAUDE_CODE_AUTO_COMPACT_WINDOW sets), so the bar reports usage of the
// USABLE window, not of the raw one — 100% means "compaction starts now".
//
// 2026-09-21 (CEO: "operatör kullansın baksın alttaki çubuğa %40 olunca … devretsin"):
// the same number the bar shows is also written to
//   $XDG_RUNTIME_DIR/claude-ctx/<session_id>.json
// so a session can read its OWN percentage with `dxb-ctx` instead of guessing it
// (a writer session guessed 16% while the bar said 44%). A screenshot of the bar
// stays the fallback when the file is missing or stale.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const AUTO_COMPACT_DEFAULT_PCT = 16.5;

function formatTokens(t) {
  if (t >= 1_000_000 || Math.round(t / 1000) >= 1000) return (t / 1_000_000).toFixed(1) + 'M';
  if (t >= 1000) return Math.round(t / 1000) + 'k';
  return String(t);
}

function usedTokens(usage) {
  if (!usage || typeof usage !== 'object') return 0;
  return (Number(usage.input_tokens) || 0)
    + (Number(usage.cache_creation_input_tokens) || 0)
    + (Number(usage.cache_read_input_tokens) || 0)
    + (Number(usage.output_tokens) || 0);
}

// The one number the CEO reads on the bar. Returns null when Claude Code sent no meter.
function usedPercent(cw) {
  const remaining = cw?.remaining_percentage;
  if (remaining == null) return null;
  const total = cw.total_tokens || 1_000_000;
  const acw = parseInt(process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW || '0', 10);
  const bufferPct = acw > 0
    ? Math.min(100, Math.max(0, (1 - acw / total) * 100))
    : AUTO_COMPACT_DEFAULT_PCT;
  const usableRemaining = Math.max(0, ((remaining - bufferPct) / (100 - bufferPct)) * 100);
  return Math.max(0, Math.min(100, Math.round(100 - usableRemaining)));
}

function contextMeter(cw) {
  const used = usedPercent(cw);
  if (used == null) return '';
  const bar = '█'.repeat(Math.floor(used / 10)) + '░'.repeat(10 - Math.floor(used / 10));
  const tokens = usedTokens(cw.current_usage);
  const suffix = tokens > 0 ? ` (${formatTokens(tokens)})` : '';

  const colour = used < 50 ? '32' : used < 65 ? '33' : used < 80 ? '38;5;208' : '5;31';
  const skull = used >= 80 ? '💀 ' : '';
  return ` \x1b[${colour}m${skull}${bar} ${used}%${suffix}\x1b[0m`;
}

// Persist the meter for `dxb-ctx`. Best effort: the bar must never fail because of it.
function persist(data) {
  try {
    const sid = data.session_id;
    if (!sid || !/^[0-9a-f-]{8,}$/i.test(sid)) return;
    const used = usedPercent(data.context_window);
    if (used == null) return;
    const dir = path.join(process.env.XDG_RUNTIME_DIR || '/tmp', 'claude-ctx');
    fs.mkdirSync(dir, { recursive: true });
    const cw = data.context_window || {};
    const rec = {
      session_id: sid,
      used_pct: used,
      tokens: usedTokens(cw.current_usage),
      total_tokens: cw.total_tokens || 1_000_000,
      model: data.model?.display_name || null,
      cwd: data.workspace?.current_dir || null,
      ts: new Date().toISOString(),
    };
    // the live /effort level, read by .claude/hooks/dxb-effort-warn.py (CEO 2026-10-06)
    const effort = data.effort?.level;
    if (['low', 'medium', 'high', 'xhigh', 'max'].includes(effort)) rec.effort = effort;
    const tmp = path.join(dir, `${sid}.json.tmp`);
    fs.writeFileSync(tmp, JSON.stringify(rec));
    fs.renameSync(tmp, path.join(dir, `${sid}.json`));
  } catch { /* the bar is the product; the file is a convenience */ }
}

// 2026-09-24 (CEO: "rate limit daralmışsa haftalıkta o zaman medium'da yazar kodu"):
// the quota reaches no hook, only this bar, so it is also written to
//   $XDG_RUNTIME_DIR/claude-ctx/rate-limits.json
// where ~/.local/bin/dxb-quota reads it (the code gate that read it first was thrown
// away 2026-09-28). One file for the whole machine: the quota belongs to the account,
// not to a session. Best effort, like persist().
function persistRateLimits(data) {
  try {
    const rl = data.rate_limits;
    if (!rl || typeof rl !== 'object') return;
    const win = w => (w && typeof w === 'object'
      ? { used_percentage: w.used_percentage ?? null, resets_at: w.resets_at ?? null }
      : null);
    const dir = path.join(process.env.XDG_RUNTIME_DIR || '/tmp', 'claude-ctx');
    fs.mkdirSync(dir, { recursive: true });
    const rec = {
      session_id: typeof data.session_id === 'string' ? data.session_id : null,
      seven_day: win(rl.seven_day),
      five_hour: win(rl.five_hour),
      written_at: new Date().toISOString(),
    };
    // Sessions share this file, so each writes through its own tmp name.
    const tmp = path.join(dir, `rate-limits.json.${process.pid}.tmp`);
    fs.writeFileSync(tmp, JSON.stringify(rec));
    fs.renameSync(tmp, path.join(dir, 'rate-limits.json'));
    persistRateHistory(dir, rec);
  } catch { /* the bar is the product; the file is a convenience */ }
}

// 2026-09-26 (his word on the pace rule: "yani ok"): the gate also asks how FAST the quota
// rises, which one record cannot say, so a short history is kept beside it:
//   $XDG_RUNTIME_DIR/claude-ctx/rate-limits-history.jsonl
// one line {ts, seven_day, five_hour} per render -- none when the last line is under
// HISTORY_MIN_GAP_S old and both percentages are unchanged -- pruned to its last
// HISTORY_KEEP_HOURS once it passes HISTORY_MAX_LINES lines. Best effort, like the record.
const HISTORY_MIN_GAP_S = 60;
const HISTORY_MAX_LINES = 2000;
const HISTORY_KEEP_HOURS = 24;

function persistRateHistory(dir, rec) {
  try {
    const file = path.join(dir, 'rate-limits-history.jsonl');
    const ts = Date.parse(rec.written_at) / 1000;
    const line = JSON.stringify({ ts, seven_day: rec.seven_day, five_hour: rec.five_hour });
    let lines = [];
    try { lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean); } catch { /* none yet */ }
    const parse = l => { try { return JSON.parse(l); } catch { return null; } };
    const used = w => (w && typeof w === 'object' ? w.used_percentage : undefined);
    const last = lines.length ? parse(lines[lines.length - 1]) : null;
    const unchanged = Boolean(last) && typeof last.ts === 'number' && ts - last.ts < HISTORY_MIN_GAP_S
      && used(last.seven_day) === used(rec.seven_day) && used(last.five_hour) === used(rec.five_hour);
    if (!unchanged) lines.push(line);
    if (lines.length > HISTORY_MAX_LINES) {
      const cutoff = ts - HISTORY_KEEP_HOURS * 3600;
      const kept = lines.filter(l => { const e = parse(l); return e && typeof e.ts === 'number' && e.ts >= cutoff; });
      const tmp = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, kept.map(l => l + '\n').join(''));
      fs.renameSync(tmp, file);
    } else if (!unchanged) {
      fs.appendFileSync(file, line + '\n');
    }
  } catch { /* the bar is the product; the history is a convenience */ }
}

function branch(dir) {
  try {
    const b = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 800,
    }).trim();
    return b ? ` \x1b[36m${b}\x1b[0m` : '';
  } catch { return ''; }
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(input); } catch { /* fall through to a bare line */ }

  persist(data);
  persistRateLimits(data);

  const model = (data.model?.display_name || 'Claude').replace(/\s*\((\d+M|\d+K) context\)/i, ' ($1)');
  const dir = data.workspace?.current_dir || process.cwd();
  const name = dir.split('/').filter(Boolean).pop() || dir;

  process.stdout.write(`\x1b[2m${model}\x1b[0m${contextMeter(data.context_window)} \x1b[2m${name}\x1b[0m${branch(dir)}`);
});
