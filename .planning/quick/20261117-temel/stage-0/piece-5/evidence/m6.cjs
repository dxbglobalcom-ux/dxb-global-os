// Helper of measure-corrections.sh (B85 stage 0 piece 5). Usage: node m6.cjs c1|c2d|c4a|c5
// Talks to the throwaway database named by M6_URL (the installer's address) with node `pg` — the driver the
// install step uses — so parameters are bound (extended protocol). Prints no password; prints a verifier only as
// its first 14 characters (and the caller's filter cuts any that slips through).
const req = require('module').createRequire('/home/dxb/DxB Global OS/foundation/bench/');
const { Client } = req('pg');
const { spawnSync } = require('child_process');
const crypto = require('crypto');

const URL_ = process.env.M6_URL;
const CONTAINER = 'supabase_db_DxB_Foundation';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const red = (s) => String(s).replace(/SCRAM-SHA-256\$[^\s'"]*/g, 'SCRAM-SHA-256$<…>').replace(/\n/g, ' | ').slice(0, 280);
const say = (s) => console.log(red(s));

function verifier(password) {
  const salt = crypto.randomBytes(16), iter = 4096;
  const salted = crypto.pbkdf2Sync(Buffer.from(password, 'utf8'), salt, iter, 32, 'sha256');
  const ck = crypto.createHmac('sha256', salted).update('Client Key').digest();
  const sk = crypto.createHash('sha256').update(ck).digest();
  const svk = crypto.createHmac('sha256', salted).update('Server Key').digest();
  return `SCRAM-SHA-256$${iter}:${salt.toString('base64')}$${sk.toString('base64')}:${svk.toString('base64')}`;
}
function logLinesSince(ts) {
  const r = spawnSync('docker', ['logs', '--since', ts, CONTAINER], { encoding: 'utf8', maxBuffer: 256 << 20 });
  return `${r.stdout}${r.stderr}`.split('\n');
}
async function connect(extra = {}) {
  const c = new Client({ connectionString: URL_, ...extra });
  c.on('error', () => undefined);
  await c.connect();
  return c;
}
const describe = (e, head) =>
  e && e.code !== undefined
    ? `ERROR code=${e.code} message="${e.message}" where-holds-verifier-head=${String(e.where ?? '').includes(head)} where="${e.where ?? ''}"`
    : `THROWN ${e}`;

// The install step's statements (foundation/bench/src/logins.ts:171-172), and the two wrapped forms asked for.
const HAND_OVER = "select pg_catalog.set_config('os_install.role', $1, true), pg_catalog.set_config('os_install.verifier', $2, true)";
const BODY = "execute pg_catalog.format('alter role %I password %L', pg_catalog.current_setting('os_install.role'), pg_catalog.current_setting('os_install.verifier'));";
const FORMS = {
  today: `do $apply$ begin ${BODY} end $apply$`,
  wrapped_others: `do $apply$ begin ${BODY} exception when others then raise exception using errcode = sqlstate, message = 'the server refused the verifier of ' || pg_catalog.current_setting('os_install.role'); end $apply$`,
  wrapped_canceled_or_others: `do $apply$ begin ${BODY} exception when query_canceled or others then raise exception using errcode = sqlstate, message = 'the server refused the verifier of ' || pg_catalog.current_setting('os_install.role'); end $apply$`,
};

let n = 0;
// One hand-over and `do`, on a session B of its own, in its own transaction; what B gets, how long it took, what
// B was waiting on 1 s in (read by a third session), and the log lines since the case began that hold the head.
async function attempt(label, { role, form, prep = [], during, end = 'rollback' }) {
  n += 1;
  const v = verifier(`m6-throwaway-${n}-${crypto.randomBytes(6).toString('hex')}`);
  const head = v.slice(0, 40);
  const ts = new Date().toISOString();
  const B = await connect();
  const t0 = Date.now();
  let out, waited = '';
  try {
    await B.query('begin');
    for (const s of prep) await B.query(s);
    await B.query(HAND_OVER, [role, v]);
    const p = B.query(FORMS[form]).then(() => 'success', (e) => e);
    const watcher = (async () => {
      await sleep(1000);
      const W = await connect();
      const { rows } = await W.query('select state, wait_event_type, wait_event from pg_stat_activity where pid = $1', [B.processID]);
      await W.end();
      waited = rows[0] ? `at 1 s B: state=${rows[0].state} wait=${rows[0].wait_event_type}/${rows[0].wait_event}` : 'at 1 s B: no row';
    })();
    if (during) await during();
    const r = await p;
    await watcher;
    out = r === 'success' ? 'success' : describe(r, head);
  } catch (e) {
    out = describe(e, head);
  }
  const ms = Date.now() - t0;
  await B.query(end).catch(() => undefined);
  await B.end();
  await sleep(1500);
  const lines = logLinesSince(ts).filter((l) => l.includes(head));
  say(`  [${label}] form=${form} role=${role} B ${end === 'commit' ? 'commits' : 'rolls back'} afterwards`);
  say(`     client: ${out}`);
  say(`     elapsed ${ms} ms; ${waited}`);
  say(`     server-log lines since the case began holding the verifier's first 40 characters: ${lines.length}`);
  for (const l of lines.slice(0, 2)) say(`     e.g.: ${l.split(head).join('SCRAM-SHA-256$<…>').replace(/SCRAM-SHA-256\$<…>[^\s'"]*/g, 'SCRAM-SHA-256$<…>')}`);
}

// Session A holds the role's row: `begin; alter role <role> connection limit 5;` and ends as `endA` says.
async function holding(role, fn) {
  const A = await connect();
  await A.query('begin');
  await A.query(`alter role ${role} connection limit 5`);
  try {
    await fn(A);
  } finally {
    await A.query('rollback').catch(() => undefined);
    await A.end();
  }
}

async function c1() {
  say('-- C1.a today\'s form, role does not exist');
  await attempt('a', { role: 'm6_nobody', form: 'today' });
  say('-- C1.b the body wrapped (exception when others → raise using errcode = sqlstate), role does not exist');
  await attempt('b', { role: 'm6_nobody', form: 'wrapped_others' });
  say("-- C1.c lock wait: A = begin; alter role m6_x connection limit 5; (open). B: set local lock_timeout = '2s'");
  for (const form of ['today', 'wrapped_others']) {
    await holding('m6_x', () => attempt(`c lock_timeout`, { role: 'm6_x', form, prep: ["set local lock_timeout = '2s'"] }));
  }
  say('-- C1.c' + "' A commits 1.5 s after B began waiting (B has no timeout)");
  for (const form of ['today', 'wrapped_others']) {
    await holding('m6_x', (A) => attempt(`c A-commits`, { role: 'm6_x', form, during: async () => { await sleep(1500); await A.query('commit'); } }));
  }
  say('-- C1.c" A rolls back 1.5 s after B began waiting (B has no timeout)');
  for (const form of ['today', 'wrapped_others']) {
    await holding('m6_x', (A) => attempt(`c A-rolls-back`, { role: 'm6_x', form, during: async () => { await sleep(1500); await A.query('rollback'); } }));
  }
  say("-- C1.d statement timeout: A holds as in c; B: set local statement_timeout = '2s'");
  for (const form of ['today', 'wrapped_others', 'wrapped_canceled_or_others']) {
    await holding('m6_x', () => attempt(`d statement_timeout`, { role: 'm6_x', form, prep: ["set local statement_timeout = '2s'"] }));
  }
  say('-- C1.e the success path, b\'s form, bound parameters, committed (role m6_y stands)');
  await attempt('e success', { role: 'm6_y', form: 'wrapped_others', end: 'commit' });
}

// The chain runner's own two statements (foundation/chain/src/session.ts:98-104), in one transaction as
// inOneTransaction holds it (session.ts:84-93), on a session whose own value of the setting differs.
async function c2d() {
  const HO = "select pg_catalog.set_config('os_chain.file', $1, true) is not null";
  const EX = "do $w$ begin execute pg_catalog.current_setting('os_chain.file'); end $w$";
  const text = "set local createrole_self_grant to 'set';\ncreate role m6_e nologin noinherit;\n";
  const c = await connect();
  await c.query("set createrole_self_grant = 'inherit'");
  say(`  the session's own value before: ${(await c.query('show createrole_self_grant')).rows[0].createrole_self_grant}`);
  await c.query('begin');
  await c.query(HO, [text]);
  await c.query(EX);
  say(`  inside the transaction after the file's text: ${(await c.query('show createrole_self_grant')).rows[0].createrole_self_grant}`);
  const rows = await c.query("select member::regrole::text as member, grantor::regrole::text as grantor, admin_option, inherit_option, set_option from pg_auth_members where roleid = 'm6_e'::regrole order by grantor::regrole::text");
  for (const r of rows.rows) say(`  m6_e row: ${JSON.stringify(r)}`);
  await c.query('commit');
  say(`  after commit: ${(await c.query('show createrole_self_grant')).rows[0].createrole_self_grant}`);
  await c.end();
}

async function c4a() {
  say(`  PGOPTIONS in this process's environment: ${process.env.PGOPTIONS ?? '(unset)'}`);
  const cases = [
    ['connectionString only', {}],
    ["options: ''", { options: '' }],
    ["options: '-c default_transaction_read_only=off'", { options: '-c default_transaction_read_only=off' }],
    ["options: '-c application_name=m6probe' (another setting)", { options: '-c application_name=m6probe' }],
  ];
  for (const [label, extra] of cases) {
    try {
      const c = await connect(extra);
      const r = await c.query('show default_transaction_read_only');
      say(`  ${label} → default_transaction_read_only = ${r.rows[0].default_transaction_read_only}`);
      await c.end();
    } catch (e) {
      say(`  ${label} → ${describe(e, 'none')}`);
    }
  }
}

async function tryLogin(user, password) {
  const u = new URL(URL_);
  u.username = user;
  u.password = password;
  const c = new Client({ connectionString: u.href, connectionTimeoutMillis: 10000 });
  c.on('error', () => undefined);
  try {
    await c.connect();
    const r = await c.query('select current_user');
    await c.end();
    return `came in as ${r.rows[0].current_user}`;
  } catch (e) {
    return describe(e, 'none').replace(/ where-holds.*$/, '');
  }
}

async function c5() {
  const pw = `m6-${crypto.randomBytes(9).toString('hex')}`; // throwaway, never printed
  const inst = await connect();
  for (const role of ['m6_c', 'm6_d', 'm6_n']) {
    await inst.query('begin');
    await inst.query(HAND_OVER, [role, verifier(pw)]);
    await inst.query(FORMS.today);
    await inst.query('commit');
  }
  for (const [letter, role, change] of [
    ['a', 'm6_c', "alter role m6_c valid until '2000-01-01'"],
    ['b', 'm6_d', 'alter role m6_d connection limit 0'],
    ['c', 'm6_n', 'alter role m6_n nologin'],
  ]) {
    say(`-- C5.${letter} ${role}`);
    say(`  before, correct password: ${await tryLogin(role, pw)}`);
    await inst.query(change);
    say(`  after \`${change}\`, correct password: ${await tryLogin(role, pw)}`);
    say(`  after, wrong password:   ${await tryLogin(role, `${pw}x`)}`);
  }
  await inst.query("alter role m6_n login password null");
  say(`-- C5.c' m6_n given LOGIN again but no password (null): ${await tryLogin('m6_n', pw)}`);
  await inst.query("alter role m6_n nologin");
  say(`-- C5.c" m6_n nologin and no password: ${await tryLogin('m6_n', pw)}`);
  await inst.end();
}

// C4.c: the installer turns a logging setting on for its transaction, then the hand-over with a bound throwaway verifier.
async function c4c() {
  await attempt("c4c log_statement=all", { role: "m6_y", form: "wrapped_others", prep: ["set local log_statement = 'all'"] });
  await attempt("c4c log_min_duration_statement=0", { role: "m6_y", form: "wrapped_others", prep: ["set local log_min_duration_statement = 0"] });
  await attempt("c4c log_statement=all, log_parameter_max_length=-1", { role: "m6_y", form: "wrapped_others", prep: ["set local log_statement = 'all'", "set local log_parameter_max_length = -1"] });
}

const which = process.argv[2];
({ c1, c2d, c4a, c4c, c5 })[which]().catch((e) => { say(`HELPER FAILED: ${e && e.message}`); process.exitCode = 1; });
