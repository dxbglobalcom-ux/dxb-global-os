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

// 2026-10-04 (CEO, during a design turn: "neden hala /effor seçtiğimde altta high görüorm kendisi
// şuan maxte değil mi"; to showing it here: "evet ekle"): the /effort menu and the spinner show the
// session's own level, while a skill's `effort: max` (dxb-design-max) lifts the rest of its own turn,
// and that is written nowhere but the transcript -- field `effort` on each assistant step, the same
// value the API request carries (measured through a local proxy, 2026-10-04). Then (CEO, the same
// evening: "alttaki tur yazısı tamamiyle aynı etkileşimde olmalı skill aktifse o turda max yazmalı
// çubukta. çubuk her turu canlı interaktif göstermeli"): the bar shows the level of the request in
// flight NOW, not the level of the last step that finished -- a step that thinks for two minutes is
// written to the transcript only when it ends, so the last finished step ran one level behind. Read
// from the end of the transcript, newest first, within the current turn (it begins at the newest
// prompt that is not a tool result, not a skill's injected text and not a local command):
//   * a call of a lifting skill in this turn            -> max, from the call on;
//   * else the newest step of this turn                 -> its level;
//   * else (the turn has no step yet) the session's own level -- an /effort set since the last step,
//     or the first step of the latest earlier turn (taken before any skill could lift it).
// That reading still drew nothing during a fresh session's turns: the transcript holds no readable line
// there at any render (measured 2026-10-04 18:28-18:39, .planning/quick/20261004-live-turn-bar/). So the
// render's own payload rules first, newest rule first:
//   * this session's turn marker (dxb-design-max/<session_id>.turn, written by the design-max hook when
//     the lifting skill is called) is a regular file holding the payload's `prompt_id` -> max;
//   * else the payload's `effort.level` (the session's own level, it follows /effort at once);
//   * else the transcript reading above, for a payload without `effort`.
// "tasarım açık" stands while this session's design-at-max flag stands. Best effort: the bar must never
// fail because of any of them -- an error falls to the next rule. The flag folder is trusted only as the
// design-max hook trusts it (open_flag_dir): a real directory, not a link, ours, writable by no one else.
const EFFORT_LEVELS = new Set(['low', 'medium', 'high', 'xhigh', 'max']);
const LIFTING_SKILLS = new Set(['dxb-design-max']);
const EFFORT_SET = /<local-command-stdout>Set effort level to (low|medium|high|xhigh|max)\b/;
const TRANSCRIPT_TAIL_BYTES = 256 * 1024;

function transcriptTail(transcriptPath) {
  if (typeof transcriptPath !== 'string' || !transcriptPath) return [];
  const fd = fs.openSync(transcriptPath, 'r');
  let text;
  try {
    const size = fs.fstatSync(fd).size;
    const length = Math.min(size, TRANSCRIPT_TAIL_BYTES);
    const buf = Buffer.alloc(length);
    fs.readSync(fd, buf, 0, length, size - length);
    text = buf.toString('utf8');
  } finally { fs.closeSync(fd); }
  const rows = [];
  for (const line of text.split('\n')) {
    if (!line) continue;
    try { const row = JSON.parse(line); if (row && typeof row === 'object') rows.push(row); }
    catch { /* the cut first line, or a line being written */ }
  }
  return rows;
}

function contentText(row) {
  const c = row.message?.content;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.filter(x => x?.type === 'text' && typeof x.text === 'string').map(x => x.text).join(' ');
  return '';
}
const isToolResult = row => Array.isArray(row.message?.content) && row.message.content.some(x => x?.type === 'tool_result');
const isLocalCommand = row => /^\s*<(local-command|command-name|command-message)/.test(contentText(row));
const startsTurn = row => row.type === 'user' && !row.isMeta && !isToolResult(row) && !isLocalCommand(row);
const stepLevel = row => (row.type === 'assistant' && EFFORT_LEVELS.has(row.effort) ? row.effort : null);
const effortSet = row => (row.type === 'user' ? (EFFORT_SET.exec(contentText(row)) || [])[1] || null : null);
const liftsToMax = row => row.type === 'assistant' && Array.isArray(row.message?.content)
  && row.message.content.some(x => x?.type === 'tool_use' && x.name === 'Skill' && LIFTING_SKILLS.has(x.input?.skill));

function inFlightEffort(rows) {
  let i = rows.length - 1;
  let newestStep = null;
  for (; i >= 0; i--) {                       // the current turn
    const row = rows[i];
    if (liftsToMax(row)) return 'max';
    const level = stepLevel(row);
    if (level) { if (!newestStep) newestStep = level; }
    else if (!newestStep && effortSet(row)) return effortSet(row);
    if (startsTurn(row)) break;
  }
  if (newestStep) return newestStep;
  let firstStep = null;                        // no step yet: the session's own level
  for (i -= 1; i >= 0; i--) {
    const row = rows[i];
    const set = effortSet(row);
    if (set) return firstStep || set;
    const level = stepLevel(row);
    if (level) firstStep = level;              // keeps the oldest step of that turn
    if (startsTurn(row) && firstStep) return firstStep;
  }
  return firstStep;
}

function turnEffort(transcriptPath) {
  try { return inFlightEffort(transcriptTail(transcriptPath)); }
  catch { return null; }                       // no transcript yet, or unreadable
}

function trustedFlagDir() {
  const dir = path.join(process.env.XDG_RUNTIME_DIR || '/tmp', 'dxb-design-max');
  const st = fs.lstatSync(dir);
  if (!st.isDirectory() || st.uid !== process.getuid() || (st.mode & 0o022) !== 0) return null;
  return dir;
}

function designOpen(sid) {
  try {
    if (!sid || !/^[0-9a-f-]{8,}$/i.test(sid)) return false;
    const dir = trustedFlagDir();
    return !!dir && fs.lstatSync(path.join(dir, sid)).isFile();
  } catch { return false; }
}

const TURN_MARKER_MAX_BYTES = 128;

function turnMarked(sid, promptId) {
  let fd;
  try {
    if (!sid || !/^[0-9a-f-]{8,}$/i.test(sid)) return false;
    if (typeof promptId !== 'string' || !/^[0-9a-f-]{8,}$/i.test(promptId)) return false;
    const dir = trustedFlagDir();
    if (!dir) return false;
    const file = path.join(dir, `${sid}.turn`);
    if (!fs.lstatSync(file).isFile()) return false;
    fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
    const st = fs.fstatSync(fd);
    if (!st.isFile() || st.uid !== process.getuid()) return false;
    const buf = Buffer.alloc(TURN_MARKER_MAX_BYTES);
    const n = fs.readSync(fd, buf, 0, TURN_MARKER_MAX_BYTES, 0);
    return buf.toString('utf8', 0, n).trim() === promptId;
  } catch { return false; }
  finally { if (fd !== undefined) try { fs.closeSync(fd); } catch { /* closed */ } }
}

function payloadEffort(data) {
  const level = data.effort?.level;
  return EFFORT_LEVELS.has(level) ? level : null;
}

function turnMark(data) {
  let effort = null;
  try { effort = turnMarked(data.session_id, data.prompt_id) ? 'max' : payloadEffort(data); }
  catch { /* the next rule */ }
  if (!effort) effort = turnEffort(data.transcript_path);
  const design = designOpen(data.session_id) ? ' \x1b[35m🟣 tasarım açık\x1b[0m' : '';
  if (!effort) return design;
  return `${design} ${effort === 'max' ? '\x1b[35;1m' : '\x1b[2m'}tur: ${effort}\x1b[0m`;
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

  process.stdout.write(`\x1b[2m${model}\x1b[0m${contextMeter(data.context_window)}${turnMark(data)} \x1b[2m${name}\x1b[0m${branch(dir)}`);
});
