# B72 — one night's backup is a SET, and the set is its own proof

Written by the lead on 2026-11-22 after Sol's audit of `6c8f858d` (`SOL.md`, finding 6): a drill that compares the
restored copy with the *living* company proves little — the company has moved on since the dump, so differences are
tolerated, and then a dump with empty tables passes too. And a `pg_dump` carries no roles, so the drill borrowed their
names from the living company: a restore after this machine is lost would have had nowhere to borrow from.

**The decision.** The nightly job writes, beside the dump, what the database held at the dump's own snapshot. The
drill restores from the set alone — it asks the living company nothing but its image name — and demands equality.

## The set of one night — three files, one stem `dxb-laptop-<YYYY-MM-DD>`

| file | what | written |
|---|---|---|
| `.dump` | `pg_dump -Fc` of database `postgres`, taken on an exported snapshot | first |
| `.globals.sql` | `pg_dumpall --globals-only --no-role-passwords` — roles, attributes, memberships; **no password** | second |
| `.manifest.json` | the inventory below, taken inside the transaction that exported the snapshot | **last** |

A set is **proven** when its manifest exists and the manifest's `dump_sha256` and `globals_sha256` equal the files'.
Until then no file of the night carries a name the patterns `dxb-laptop-*.dump`, `*.globals.sql`, `*.manifest.json`
match. The three are pruned together and travel off-site together.

Passwords are not in the backup, by design: a login's password comes back from the vault and the env files, never
from a file that leaves the machine. The row says so.

## The manifest

```json
{
  "format": 1,
  "stem": "dxb-laptop-2026-11-23",
  "taken_at": "2026-11-23T02:30:07+01:00",
  "server_version": "17.6",
  "dump_bytes": 25128666,
  "dump_sha256": "…",
  "globals_sha256": "…",
  "inventory": {
    "tables":        { "public.jobs": 1234 },
    "sequences":     { "public.jobs_id_seq": { "last_value": 77, "is_called": true } },
    "large_objects": 0,
    "extensions":    { "pgcrypto": "1.3" },
    "roles":         { "dxb_reader": { "login": true, "member_of": [] } },
    "acl_sha256":    "…"
  },
  "excluded": [ { "what": "schema.table", "why": "extension-owned; pg_dump carries no rows of it" } ]
}
```

- **One SQL file computes `inventory`** — `scripts/backup/inventory.sql` — and both sides run that same file: the job
  on the company (inside the snapshot's read-only transaction), the drill on the restored copy. It returns one JSON
  document. Nothing is computed twice in two wordings.
- `tables`: exact `count(*) FROM ONLY` of every ordinary and partitioned table whose rows the dump carries.
  What the dump does not carry rows of is not counted and is listed under `excluded` with its reason — by a rule read
  from the catalogue, never a hand-kept list of names.
- `acl_sha256`: one hash over the sorted `(object, privilege text)` of schemas, tables, sequences and functions the
  dump carries, and of default privileges. If a fresh instance of the same image cannot reproduce an entry for a
  reason the restore does not control, that entry is listed under `excluded` with the reason — measured, not assumed.
- `roles`: every role not named `pg_*`, with `login` and `member_of`.

## The drill's verdict

`RESTORE_DRILL_OK` only when: the set is proven; the globals were applied from the set's own file; `pg_restore`
exited 0 with 0 errors; the inventory computed on the restored copy **equals** the manifest's, key by key; the
throwaway container and the working directory are verified gone. Every difference is printed by name; one difference
is a failure. With no file named, the drill takes **today's** set and fails when today has none.
