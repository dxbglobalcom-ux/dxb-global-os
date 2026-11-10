import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

import { reserveOf, usablePct } from '../hooks/calc'

const PANE = {
  plugin: 'dxb-live-pane',
  component: 'Pane',
  requestId: 'dxb-live',
  props: {
    title: 'DXB live',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

type World = { submitted: { text: string; asUser?: boolean }[]; files: Map<string, string>; pct: { raw: number } }

/** Everything beneath the plugin: the engine's answers, from memory. */
function world(on: On, env: Record<string, string>): World {
  const w: World = { submitted: [], files: new Map(), pct: { raw: 10 } }
  mock.env(on, env)
  mock.store(on)
  on('session.id', () => ({ value: 'S1' }))
  on('session.model', () => ({ value: 'claude-fable-5-2' }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: '+0300\n', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('command.register', () => ({ value: { command: 'live' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('agent.list', () => ({ value: [] }))
  on('prompt.read', () => ({ value: { text: '', cursor: 0 } }))
  on('session.usage', () => ({
    value: {
      startedAt: 0,
      context: { window: 1_000_000, percent: w.pct.raw, tokens: w.pct.raw * 10_000 },
      rateLimits: [{ kind: 'five_hour', percentUsed: 23, resetsAt: '2026-11-10T22:00:00Z' }],
      cost: { usd: 1.5 },
    },
  }))
  on('fs.read', (_, e) => {
    if (e.path.endsWith('handover-prompt.txt')) return { value: 'HAND OVER NOW' }
    const text = w.files.get(e.path)
    return text === undefined ? { deny: 'ENOENT' } : { value: text }
  })
  on('fs.write', (_, e) => {
    w.files.set(e.path, e.text)
    return { value: undefined }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('turn.complete', (_, e) => ({ text: e.answer }))
  on('agent.spawn', () => ({ model: 'claude-haiku-4-5', agentId: 'A1' }))
  on('tool.call', () => ({ result: {} }))
  on('prompt.submit', (_, e) => {
    w.submitted.push({ text: e.text, asUser: e.origin.kind === 'plugin' ? e.origin.asUser : undefined })
    return { text: e.text }
  })

  return w
}

test('the status line arithmetic: raw 42 % of the window is 50 % of the usable window', async () => {
  expect(usablePct(0, 16.5)).toBe(0)
  expect(usablePct(42, 16.5)).toBe(50)
  expect(usablePct(83.5, 16.5)).toBe(100)
  expect(usablePct(95, 16.5)).toBe(100)
  expect(Math.round(reserveOf(800_000, 1_000_000) * 1000) / 1000).toBe(20)
})

test('the roster shows a spawned subagent running, then done, on every surface', async ($, on) => {
  const clock = mock.clock(on, { now: Date.parse('2026-11-10T19:00:00Z') })
  world(on, {})
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.agent.spawn({ tool_use_id: 'tu1', prompt: 'list files', description: 'lists scripts', subagentType: 'Explore', provider: { plugin: 'engine', tier: 'core' }, parentModel: 'claude-fable-5-2', background: false, fork: false })
  await $.tool.call({ tool: 'Bash', command: 'ls scripts/governance', agentId: 'A1' })
  await clock.advance(4000)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const row = await ui.find({ type: 'Text', text: /Explore/ })
    expect(row?.text).toContain('● Explore · haiku-4-5 · running')
    expect(row?.text).toContain('from 22:00:00')
    expect((await ui.find({ type: 'Text', text: /ls scripts/ }))?.text).toContain('Bash ls scripts/governance')
    await ui.unmount()
  }

  await $.turn.complete({ answer: 'two files', durationMs: 4000, isAborted: false, turnId: 'T9', agentId: 'A1', reason: 'answer' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /Explore/ }))?.text).toContain('○ Explore · haiku-4-5 · done')
  expect((await ui.find({ type: 'Text', text: /agents:/ }))?.text).toBe('agents: 0 working · 1 finished')
  await ui.unmount()
})

test('the handover fires once, at the threshold, after a main turn', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  const w = world(on, { DXB_MOD_HANDOVER_PCT: '50' })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  // 30 % raw is 16 % usable: below the threshold.
  w.pct.raw = 30
  await $.turn.complete({ answer: 'a', durationMs: 1, isAborted: false, turnId: 'T1', reason: 'answer' })
  expect(w.submitted.length).toBe(0)

  // 45 % raw is 54 % usable: fires.
  w.pct.raw = 45
  await $.turn.complete({ answer: 'b', durationMs: 1, isAborted: false, turnId: 'T2', reason: 'answer' })
  await clock.advance(1)
  expect(w.submitted).toEqual([{ text: 'HAND OVER NOW', asUser: undefined }])

  // Never twice in a session.
  w.pct.raw = 60
  await $.turn.complete({ answer: 'c', durationMs: 1, isAborted: false, turnId: 'T3', reason: 'answer' })
  await clock.advance(1)
  expect(w.submitted.length).toBe(1)

  // A subagent's turn never fires it.
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /handover/ }))?.text).toContain('at 54%')
  await ui.unmount()
})
