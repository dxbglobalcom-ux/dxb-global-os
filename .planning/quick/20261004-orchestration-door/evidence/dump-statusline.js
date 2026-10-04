// Probe wrapper: logs every status-line render (time, payload keys, any effort-like field, the transcript's
// size and its last assistant effort at that instant), then prints what the real status line prints.
const fs = require('fs'), { spawnSync } = require('child_process');
let input = ''; process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  let d = {}; try { d = JSON.parse(input); } catch {}
  let lines = 0, lastEff = null, lastType = null;
  try {
    const rows = fs.readFileSync(d.transcript_path, 'utf8').split('\n').filter(Boolean);
    lines = rows.length;
    for (let i = rows.length - 1; i >= 0; i--) { const r = JSON.parse(rows[i]); if (!lastType) lastType = r.type; if (r.type === 'assistant' && r.effort) { lastEff = r.effort; break; } }
  } catch {}
  const pick = {}; const walk = (o, p) => { if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { const q = p ? p + '.' + k : k; if (/effort|thinking|reason/i.test(k)) pick[q] = v; else walk(v, q); } };
  walk(d, '');
  const out = spawnSync('/usr/bin/node', ['/home/dxb/.claude/hooks/dxb-statusline.js'], { input, encoding: 'utf8', env: process.env }).stdout;
  fs.appendFileSync(process.env.DUMP_LOG, JSON.stringify({ t: new Date().toISOString().slice(11, 23), keys: Object.keys(d), effortish: pick, transcriptLines: lines, lastType, lastAssistantEffort: lastEff, bar: out.replace(/\x1b\[[0-9;]*m/g, '') }) + '\n');
  process.stdout.write(out);
});
