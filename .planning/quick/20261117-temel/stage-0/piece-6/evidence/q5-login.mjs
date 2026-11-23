// Q5: a login gives itself settings, over TCP, as os_reader. The password is read by the bench's own
// loginConnectionString (inside this process); nothing of it, nor of the address, is printed.
import { loginConnectionString } from '/home/dxb/DxB Global OS/foundation/bench/src/index.ts';
import { createRequire } from 'node:module';
const { Client } = createRequire('/home/dxb/DxB Global OS/foundation/bench/')('pg');
const c = new Client({ connectionString: loginConnectionString('os_reader') });
c.on('error', () => undefined);
try {
  await c.connect();
  const who = await c.query('select current_user, session_user, inet_server_port()');
  console.log(`connected over TCP as ${who.rows[0].current_user} (port ${who.rows[0].inet_server_port})`);
  for (const s of ["alter role os_reader set work_mem = '7MB'", "alter role os_reader in database postgres set statement_timeout = '5s'", "alter role os_reader set search_path = 'public'", "alter role os_reader set role = 'anon'", "alter role os_reader set session_replication_role = 'replica'", "alter role os_engine set work_mem = '1MB'"]) {
    try { await c.query(s); console.log(`  ${s} -> done`); } catch (e) { console.log(`  ${s} -> ERROR ${e.code} ${e.message}`); }
  }
  await c.end();
} catch (e) {
  console.log(`LOGIN FAILED: ${e.code ?? ''} ${String(e.message).replace(/postgres(ql)?:\/\/\S+/g, '<address>')}`);
  process.exitCode = 1;
}
