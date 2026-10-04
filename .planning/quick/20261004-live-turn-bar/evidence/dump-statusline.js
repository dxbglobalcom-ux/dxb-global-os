// Probe wrapper: logs every status-line render — time, the payload's prompt_id VALUE and effort, the transcript's
// size and the promptId of its newest user row at that instant — then prints what the real status line prints.
const fs = require('fs'), { spawnSync } = require('child_process');
let input = ''; process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  let d = {}; try { d = JSON.parse(input); } catch {}
  let lines = 0, lastUserPromptId = null;
  try {
    const rows = fs.readFileSync(d.transcript_path, 'utf8').split('\n').filter(Boolean);
    lines = rows.length;
    for (let i = rows.length - 1; i >= 0; i--) { const r = JSON.parse(rows[i]); if (r.type === 'user' && r.promptId) { lastUserPromptId = r.promptId; break; } }
  } catch {}
  const out = spawnSync('/usr/bin/node', ['/home/dxb/.claude/hooks/dxb-statusline.js'], { input, encoding: 'utf8', env: process.env }).stdout;
  fs.appendFileSync(process.env.DUMP_LOG, JSON.stringify({ t: new Date().toTimeString().slice(0, 8) + '.' + String(Date.now() % 1000).padStart(3, '0'),
    prompt_id: d.prompt_id ?? null, effort: d.effort ?? null, transcriptLines: lines, lastUserPromptId,
    bar: out.replace(/\x1b\[[0-9;]*m/g, '') }) + '\n');
  process.stdout.write(out);
});
