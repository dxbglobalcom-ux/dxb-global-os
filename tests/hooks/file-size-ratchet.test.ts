// The file-size ratchet's bite tests. The limit is written here as plain numbers — 5,000 tokens,
// 20,000 bytes — and never taken from the code, so a changed limit turns these red. The second
// half makes real staged changes in a throw-away repository: a move, a copy, a merge in
// progress, a symlink, a path with spaces.
import { describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, renameSync, symlinkSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { judged, message, parseRaw, tokens, verdicts } from '../../scripts/hooks/file-size-ratchet.mjs';

const SCRIPT = resolve(__dirname, '../../scripts/hooks/file-size-ratchet.mjs');
const PRE_COMMIT = resolve(__dirname, '../../scripts/hooks/pre-commit');

describe('file-size ratchet — what it judges', () => {
  it('judges code, whatever the case of its extension', () => {
    for (const p of ['packages/kernel/src/a.ts', 'scripts/ops/x.py', 'a.MTS', 'styles/a.scss', 'scripts/x.sql',
      'src/build/a.ts', 'src/a.generated.ts', 'src/a.d.ts', 'wp/plugin.php']) expect(judged(p), p).toBe(true);
  });
  it('leaves records, data, migrations, seeds, fixtures and the mirror alone', () => {
    for (const p of ['db/migrations/20260101000000_x.sql', 'db/seed/build-seed.ts', '.planning/board-rows/B43.md',
      'scripts/governance/ceo-approvals.json', 'tests/x/fixtures/big.ts', 'apps/web/public/lib.min.js',
      'pnpm-lock.yaml', '.agents/skills/x/run.py', 'HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md']) expect(judged(p), p).toBe(false);
  });
});

describe('file-size ratchet — the verdicts, in plain numbers', () => {
  it('counts tokens as bytes / 4, rounded up', () => {
    expect(tokens(20000)).toBe(5000);
    expect(tokens(20001)).toBe(5001);
  });
  it('lets a new file of 20,000 bytes in and stops one of 20,001', () => {
    expect(verdicts([{ path: 'a.ts', before: null, after: 20000 }])).toEqual([]);
    expect(verdicts([{ path: 'a.ts', before: null, after: 20001 }])).toEqual([{ path: 'a.ts', kind: 'new', before: 0, after: 20001 }]);
  });
  it('lets a large file be edited, moved or shrunk, and stops it growing by one byte', () => {
    expect(verdicts([{ path: 'b.ts', before: 60000, after: 60000 }])).toEqual([]);
    expect(verdicts([{ path: 'b.ts', before: 60000, after: 59000 }])).toEqual([]);
    expect(verdicts([{ path: 'b.ts', before: 60000, after: 60001 }])[0].kind).toBe('grew');
  });
  it('stops a file at the step that takes it over the limit, however small the step', () => {
    expect(verdicts([{ path: 'c.ts', before: 19999, after: 20000 }])).toEqual([]);
    expect(verdicts([{ path: 'c.ts', before: 20000, after: 20001 }])[0].kind).toBe('crossed');
    expect(verdicts([{ path: 'c.ts', before: 100, after: 20400 }])[0].kind).toBe('crossed');
  });
  it('never stops a file outside its judgement, whatever its size', () => {
    expect(verdicts([{ path: 'db/migrations/x.sql', before: null, after: 1000000 }])).toEqual([]);
  });
  it('says the bytes, which case it is, and how to split', () => {
    const text = message([
      { path: 'a.ts', kind: 'new', before: 0, after: 40001 },
      { path: 'b.ts', kind: 'grew', before: 20001, after: 20002 },
      { path: 'c.ts', kind: 'crossed', before: 19000, after: 20500 },
    ]);
    expect(text).toContain('en az 3 parçaya');
    expect(text).toContain('20001 → 20002 bayt');
    expect(text).toContain('+1 bayt');
    expect(text).toContain('sınırın 500 bayt üstünde');
    expect(text).toContain('SORUMLULUĞA göre');
    expect(text).toContain('yorum silme');
  });
  it('reads a rename as one entry whose path is the destination', () => {
    const z = '\0';
    const raw = `:100644 100644 aaa bbb R100${z}old name.ts${z}new name.ts${z}:000000 100644 000 ccc A${z}x.ts${z}`;
    expect(parseRaw(raw).map((e) => [e.status, e.path, e.oldId, e.newId])).toEqual([['R', 'new name.ts', 'aaa', 'bbb'], ['A', 'x.ts', '000', 'ccc']]);
  });
});

describe('file-size ratchet — on real staged changes', () => {
  const run = (cwd: string, env: Record<string, string> = {}) =>
    spawnSync('node', [SCRIPT], { cwd, encoding: 'utf8', env: { ...process.env, ...env } });
  const git = (cwd: string, ...args: string[]) =>
    execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'core.hooksPath=/dev/null', ...args], { cwd, stdio: 'pipe' });
  const BIG = '// x\n'.repeat(6000); // 30,000 bytes
  const repo = () => {
    const dir = mkdtempSync(join(tmpdir(), 'ratchet-'));
    git(dir, 'init', '-q', '-b', 'main');
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src/small.ts'), 'export const a = 1;\n');
    writeFileSync(join(dir, 'src/old big.ts'), BIG);
    git(dir, 'add', '.'); git(dir, 'commit', '-q', '-m', 'first');
    return dir;
  };

  it('passes a small edit, blocks a large new file even in the very first commit, and the escape is explicit', () => {
    const fresh = mkdtempSync(join(tmpdir(), 'ratchet-'));
    git(fresh, 'init', '-q');
    writeFileSync(join(fresh, 'big.ts'), BIG);
    git(fresh, 'add', '.');
    expect(run(fresh).status).toBe(1); // no HEAD yet

    const dir = repo();
    writeFileSync(join(dir, 'src/small.ts'), 'export const a = 2;\n');
    git(dir, 'add', '.');
    expect(run(dir).status).toBe(0);
    writeFileSync(join(dir, 'src/yeni dosya.ts'), BIG);
    git(dir, 'add', '.');
    const blocked = run(dir);
    expect(blocked.status).toBe(1);
    expect(blocked.stderr).toContain('src/yeni dosya.ts');
    const skipped = run(dir, { DXB_SKIP_SIZE: '1' });
    expect(skipped.status).toBe(0);
    expect(skipped.stderr).toContain('atlandı');
  });

  it('lets a large file be moved unchanged, and stops it when the move also grows it', () => {
    const dir = repo();
    renameSync(join(dir, 'src/old big.ts'), join(dir, 'src/moved.ts'));
    git(dir, 'add', '-A');
    expect(run(dir).status).toBe(0);
    appendFileSync(join(dir, 'src/moved.ts'), '// one more line\n');
    git(dir, 'add', '-A');
    const grown = run(dir);
    expect(grown.status).toBe(1);
    expect(grown.stderr).toContain('BÜYÜDÜ');
  });

  it('stops a copy of a large file, with copy detection on or off', () => {
    const dir = repo();
    writeFileSync(join(dir, 'src/copy.ts'), BIG);
    writeFileSync(join(dir, 'src/old big.ts'), 'export const b = 1;\n');
    git(dir, 'add', '-A');
    expect(run(dir).status).toBe(1);
    git(dir, 'config', 'diff.renames', 'copies');
    expect(run(dir).status).toBe(1);
  });

  it('stands aside during a merge, and does not measure a symlink', () => {
    const dir = repo();
    git(dir, 'checkout', '-q', '-b', 'other');
    writeFileSync(join(dir, 'src/from-other.ts'), BIG);
    git(dir, 'add', '.'); git(dir, 'commit', '-q', '-m', 'other', '--no-verify');
    git(dir, 'checkout', '-q', 'main');
    writeFileSync(join(dir, 'src/small.ts'), 'export const a = 3;\n');
    git(dir, 'add', '.'); git(dir, 'commit', '-q', '-m', 'main moves');
    git(dir, 'merge', '--no-commit', '--no-ff', 'other');
    expect(run(dir).status).toBe(0); // the large file was judged on its own branch

    const linked = repo();
    symlinkSync('old big.ts', join(linked, 'src/link.ts'));
    git(linked, 'add', '-A');
    expect(run(linked).status).toBe(0);
  });

  it('says plainly when git cannot be read, and stops rather than pass unmeasured', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ratchet-nogit-'));
    const out = run(dir, { GIT_CEILING_DIRECTORIES: tmpdir() });
    expect(out.status).toBe(1);
    expect(out.stderr).toContain('çalışamadı');
  });
});

describe('file-size ratchet — wired into the commit hook', () => {
  it('pre-commit runs it, stops on its failure, and runs it before the secret scan', () => {
    const hook = readFileSync(PRE_COMMIT, 'utf8');
    const call = hook.indexOf('if ! node "$REPO_TOP/scripts/hooks/file-size-ratchet.mjs"; then\n  exit 1\nfi');
    expect(call).toBeGreaterThan(-1);
    expect(call).toBeLessThan(hook.indexOf('exec gitleaks'));
  });
});
