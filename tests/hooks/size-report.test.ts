// The file-size guard's report: what it counts from the guard's logs, in plain numbers.
import { describe, expect, it } from 'vitest';
import { findings, parse, summarize, within } from '../../scripts/ops/dxb-size-report.mjs';

const ROOT = '/repo';
const STOPS = [
  '2026-11-18T09:00:00.000Z\t/repo\tnew:0:30000:src/a.ts | crossed:19000:21000:src/b c.ts',
  '2026-11-18T09:01:00.000Z\t/repo\tnew:0:30000:src/a.ts',
  '2026-11-20T10:00:00.000Z\t/tmp/ratchet-x\tnew:0:30000:big.ts',
  '2026-12-05T10:00:00.000Z\t/repo\tnew:0:30000:late.ts',
].join('\n') + '\n';

describe('file-size guard report', () => {
  it('counts only this repository, only inside the period', () => {
    const all = parse(STOPS, ROOT);
    expect(all.length).toBe(3);
    expect(within(all, '2026-11-17', '2026-12-01').length).toBe(2);
    expect(within(all, '2026-11-19', '2026-12-01').length).toBe(0);
  });

  it('reads each finding, keeping a path that has spaces or a colon', () => {
    const f = findings(parse('2026-11-18T09:00:00.000Z\t/repo\tcrossed:19000:21000:src/b c.ts | grew:60000:60500:x:y.ts\n', ROOT));
    expect(f).toEqual([
      { kind: 'crossed', before: 19000, after: 21000, path: 'src/b c.ts' },
      { kind: 'grew', before: 60000, after: 60500, path: 'x:y.ts' },
    ]);
  });

  it('sums stops by kind, escapes, and the bytes large files grew', () => {
    const stops = within(parse(STOPS, ROOT), '2026-11-17', '2026-12-01');
    const escapes = parse('2026-11-19T00:00:00.000Z\t/repo\tsrc/a.ts\n', ROOT);
    const growth = parse('2026-11-19T00:00:00.000Z\t/repo\tgrew:60000:60500:x.sh | grew:30000:30100:y.sh\n2026-11-20T00:00:00.000Z\t/repo\tgrew:60500:61000:x.sh\n', ROOT);
    const s = summarize({ stops, escapes, growth, commits: 40 });
    expect(s.stops).toBe(2);
    expect(s.stopsNew).toBe(2);
    expect(s.stopsCrossed).toBe(1);
    expect(s.escapes).toBe(1);
    expect(s.growthCommits).toBe(2);
    expect(s.grownBytes).toBe(1100);
    expect(s.topStopped[0]).toEqual(['src/a.ts', 2]);
    expect(s.topGrown[0]).toEqual(['x.sh', 2]);
    expect(s.commits).toBe(40);
  });

  it('an empty log is zero, not an error', () => {
    const s = summarize({ stops: [], escapes: [], growth: [], commits: 0 });
    expect([s.stops, s.escapes, s.growthCommits, s.grownBytes]).toEqual([0, 0, 0, 0]);
  });
});
