// The file-size ratchet's bite tests: its verdicts on fixed sizes, and one real staged commit
// in a throw-away repository, so the hook's wiring is proven and not only its arithmetic.
import { describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { LIMIT_TOKENS, judged, message, verdicts } from '../../scripts/hooks/file-size-ratchet.mjs';

const LIMIT_BYTES = LIMIT_TOKENS * 4;
const SCRIPT = resolve(__dirname, '../../scripts/hooks/file-size-ratchet.mjs');

describe('file-size ratchet — what it judges', () => {
  it('judges code and leaves records, data and migrations alone', () => {
    expect(judged('packages/kernel/src/a.ts')).toBe(true);
    expect(judged('scripts/ops/x.py')).toBe(true);
    expect(judged('db/migrations/20260101000000_x.sql')).toBe(false);
    expect(judged('db/seed/build-seed.ts')).toBe(false);
    expect(judged('.planning/board-rows/B43.md')).toBe(false);
    expect(judged('scripts/governance/ceo-approvals.json')).toBe(false);
    expect(judged('tests/x/fixtures/big.ts')).toBe(false);
    expect(judged('apps/web/public/lib.min.js')).toBe(false);
    expect(judged('pnpm-lock.yaml')).toBe(false);
  });
});

describe('file-size ratchet — the verdicts', () => {
  it('lets a new file at the limit in and stops one byte-step above it', () => {
    expect(verdicts([{ path: 'a.ts', before: null, after: LIMIT_BYTES }])).toEqual([]);
    const found = verdicts([{ path: 'a.ts', before: null, after: LIMIT_BYTES + 4 }]);
    expect(found).toEqual([{ path: 'a.ts', kind: 'new', now: LIMIT_TOKENS + 1, was: 0 }]);
  });
  it('lets an already large file be edited or shrink, and stops it growing', () => {
    const big = LIMIT_BYTES * 3;
    expect(verdicts([{ path: 'b.ts', before: big, after: big }])).toEqual([]);
    expect(verdicts([{ path: 'b.ts', before: big, after: big - 100 }])).toEqual([]);
    expect(verdicts([{ path: 'b.ts', before: big, after: big + 1 }])[0].kind).toBe('grew');
  });
  it('stops a small file that crosses the limit in one commit', () => {
    expect(verdicts([{ path: 'c.ts', before: 100, after: LIMIT_BYTES + 400 }])[0].kind).toBe('grew');
  });
  it('never stops a file outside its judgement, whatever its size', () => {
    expect(verdicts([{ path: 'db/migrations/x.sql', before: null, after: LIMIT_BYTES * 50 }])).toEqual([]);
  });
  it('tells how to split: by responsibility, with the part count', () => {
    const text = message([{ path: 'a.ts', kind: 'new', now: LIMIT_TOKENS * 2 + 1, was: 0 }]);
    expect(text).toContain('en az 3 parçaya');
    expect(text).toContain('SORUMLULUĞA göre');
    expect(text).toContain('yorum silme');
  });
});

describe('file-size ratchet — on a real staged change', () => {
  const run = (cwd: string, env: Record<string, string> = {}) =>
    spawnSync('node', [SCRIPT], { cwd, encoding: 'utf8', env: { ...process.env, ...env } });
  const git = (cwd: string, ...args: string[]) =>
    execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'core.hooksPath=/dev/null', ...args], { cwd });

  it('blocks a large new file, passes a small one, and the escape is explicit', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ratchet-'));
    git(dir, 'init', '-q');
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src/small.ts'), 'export const a = 1;\n');
    git(dir, 'add', '.'); git(dir, 'commit', '-q', '-m', 'first');

    writeFileSync(join(dir, 'src/small.ts'), 'export const a = 2;\n');
    git(dir, 'add', '.');
    expect(run(dir).status).toBe(0);

    writeFileSync(join(dir, 'src/big.ts'), '// x\n'.repeat(LIMIT_BYTES));
    git(dir, 'add', '.');
    const blocked = run(dir);
    expect(blocked.status).toBe(1);
    expect(blocked.stderr).toContain('YENİ   src/big.ts');

    const skipped = run(dir, { DXB_SKIP_SIZE: '1' });
    expect(skipped.status).toBe(0);
    expect(skipped.stderr).toContain('atlandı');
  });
});
