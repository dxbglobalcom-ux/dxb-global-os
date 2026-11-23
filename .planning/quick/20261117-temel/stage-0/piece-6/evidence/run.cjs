// B85 stage 0 piece 6 — measuring helper. Usage: node run.cjs <file.sql> [url]
// Runs the file's blocks one by one on ONE session of node `pg` (the driver the chain uses) and prints each block's
// label and rows, `|`-separated. A block begins with a line `-- @ <label>`; a block whose label starts with `!`
// prints nothing but its error, if any. An error is printed and the next block runs (the session is put back with
// a rollback when a transaction was open). The default address is the bench's installer (127.0.0.1:54522).
const req = require('module').createRequire('/home/dxb/DxB Global OS/foundation/bench/');
const { Client } = req('pg');
const fs = require('fs');

const file = process.argv[2];
const url = process.argv[3] || 'postgresql://postgres:postgres@127.0.0.1:54522/postgres';
const red = (s) => String(s).replace(/SCRAM-SHA-256\$[^\s'"|]*/g, 'SCRAM-SHA-256$<…>');

function blocks(text) {
  const out = [];
  let cur = null;
  for (const line of text.split('\n')) {
    const m = /^-- @ (.*)$/.exec(line);
    if (m) { cur = { label: m[1], sql: '' }; out.push(cur); continue; }
    if (cur) cur.sql += line + '\n';
  }
  return out.filter((b) => b.sql.trim() !== '');
}

(async () => {
  // Every value is printed as the server's own text (no type parser), and columns by position (duplicate names kept).
  const c = new Client({ connectionString: url, types: { getTypeParser: () => (v) => v } });
  c.on('error', () => undefined);
  await c.connect();
  for (const b of blocks(fs.readFileSync(file, 'utf8'))) {
    const quiet = b.label.startsWith('!');
    try {
      const r = await c.query({ text: b.sql, rowMode: 'array' });
      if (quiet) continue;
      console.log(`== ${b.label}`);
      for (const res of Array.isArray(r) ? r : [r]) {
        if (!res.rows || res.fields.length === 0) { console.log(`  (${res.command} ${res.rowCount ?? ''})`); continue; }
        for (const row of res.rows) console.log('  ' + red(row.map((v) => (v === null ? '∅' : v)).join(' | ')));
      }
    } catch (e) {
      console.log(`== ${b.label}\n  ERROR ${e.code ?? ''} ${red(e.message)}`);
      await c.query('rollback').catch(() => undefined);
    }
  }
  await c.end();
})().catch((e) => { console.log(`RUN FAILED: ${red(e.message)}`); process.exitCode = 1; });
