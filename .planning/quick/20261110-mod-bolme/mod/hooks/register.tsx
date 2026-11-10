// dxb-live-pane — a SPIKE mod, loaded only per run with --plugin-dir.
//
// P1  A pane that shows, with nobody typing, what the session is doing: the
//     lead's context percent (the status line's arithmetic), the model and
//     effort of the current main turn, the rate-limit windows, the cost, and a
//     roster of subagents (type, model, status, started-at, duration, last
//     activity). Fed by agent.spawn, turn.start / turn.step / turn.complete
//     (agentId), tool.call (agentId), session.measure, $.agent.list and
//     $.session.usage polled on a $.clock.every heartbeat.
// P2  The handover trigger: when a MAIN turn completes and the context percent
//     is at or above DXB_MOD_HANDOVER_PCT (default 50), once per session, it
//     queues the text of <job>/handover-prompt.txt with $.prompt.submit.
// P3  Probes (only with DXB_MOD_P3=1): $.process.run of `claude --version`,
//     which terminal emulators exist, and $.session.send to DXB_MOD_SEND_TO.
//
// Every state change is one JSON line in <job>/pane-log.jsonl, <job> being the
// folder that holds this mod's folder.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentRow, AgentRowStatus, Live, RateRow } from '../types'

import { DEFAULT_RESERVE_PCT, clockText, pad, reserveOf, spanText, usablePct } from './calc'

const PANE = 'dxb-live'
const HEARTBEAT_MS = 2000

const EMPTY: Live = {
  sessionId: null,
  tzOffsetMin: 0,
  ctx: { pct: null, rawPct: null, tokens: null, window: null, reservePct: DEFAULT_RESERVE_PCT },
  main: {
    model: null,
    effort: null,
    isRunning: false,
    turnStartedAt: null,
    turnEndedAt: null,
    steps: 0,
    lastTool: null,
  },
  rate: [],
  costUsd: null,
  agents: [],
  lastChangeAt: null,
  lastChange: null,
  handover: {
    threshold: 50,
    firedAt: null,
    firedAtPct: null,
    submitResolvedAt: null,
    outcome: null,
  },
}

const live = atom({ plugin: 'dxb-live-pane', key: 'live' } as const, EMPTY, { shape: 'live-1' })
const tick = atom({ plugin: 'dxb-live-pane', key: 'tick' } as const, 0)

// ---------------------------------------------------------------- time text

const resetText = (iso: string | null, now: number, tz: number): string => {
  if (iso === null) {
    return '?'
  }
  const at = Date.parse(iso)
  if (Number.isNaN(at)) {
    return iso
  }
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const local = new Date(at + tz * 60_000)
  const hm = `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`

  return at - now < 20 * 3600_000 ? hm : `${days[local.getUTCDay()]} ${hm}`
}

const shortModel = (m: string | null): string =>
  m === null ? '?' : m.replace(/^claude-/, '').replace(/-\d{8}$/, '')

const cut = (s: string, n: number): string => (s.length <= n ? s : `${s.slice(0, Math.max(1, n - 1))}…`)

// ---------------------------------------------------------------- the log

let logChain: Promise<void> = Promise.resolve()

const jobDir = ($: EngineInterface): string => {
  const root = $.plugin.root.replace(/\/+$/, '')

  return root.slice(0, root.lastIndexOf('/'))
}

/** <job>/pane-log.jsonl, or <job>/<DXB_MOD_LOG_NAME> when two sessions run at once. */
let logName: string | null = null
const logPath = async ($: EngineInterface): Promise<string> => {
  logName ??= ((await $.env.get('DXB_MOD_LOG_NAME')) ?? '') || 'pane-log.jsonl'

  return `${jobDir($)}/${logName}`
}

/** $.fs has no append: read, add a line, write; chained so parallel hooks do not race. */
function log($: EngineInterface, kind: string, row: Record<string, unknown> = {}): Promise<void> {
  logChain = logChain.then(async () => {
    try {
      const path = await logPath($)
      const t = await $.clock.now()
      const sessionId = await $.session.id().catch(() => null)
      const before = await $.fs.read(path).catch(() => '')
      const line = JSON.stringify({ time: new Date(t).toISOString(), t, sessionId, kind, ...row })

      await $.fs.write(path, `${before}${line}\n`)
    } catch {
      // The log must never break a turn.
    }
  })

  return logChain
}

// ---------------------------------------------------------------- state helpers

async function change(
  $: EngineInterface,
  what: string,
  fn: (s: Live) => Live,
  row: Record<string, unknown> = {},
): Promise<void> {
  const now = await $.clock.now()
  await update($, live, s => ({ ...fn(s), lastChangeAt: now, lastChange: what }))
  await log($, what, row)
}

const newRow = (id: string, now: number, over: Partial<AgentRow> = {}): AgentRow => ({
  id,
  type: '?',
  description: '',
  name: null,
  model: null,
  modelFrom: 'none',
  effort: null,
  status: 'running',
  statusFrom: 'event',
  background: null,
  parentId: null,
  startedAt: now,
  endedAt: null,
  steps: 0,
  tools: 0,
  lastActivity: null,
  lastActivityAt: null,
  outputTokens: 0,
  ...over,
})

const withAgent = (s: Live, id: string, now: number, fn: (r: AgentRow) => AgentRow): Live => {
  const has = s.agents.some(r => r.id === id)
  const agents = has ? s.agents.map(r => (r.id === id ? fn(r) : r)) : [...s.agents, fn(newRow(id, now))]

  return { ...s, agents: agents.slice(-40) }
}

const LIST_STATUS: Record<string, AgentRowStatus> = {
  pending: 'pending',
  running: 'running',
  waiting: 'waiting',
  idle: 'idle',
  completed: 'done',
  failed: 'failed',
  killed: 'killed',
}

const isActive = (st: AgentRowStatus): boolean => st === 'running' || st === 'pending' || st === 'waiting'

function activityOf(e: Record<string, unknown>): string {
  const tool = String(e.tool)
  const arg =
    typeof e.command === 'string'
      ? e.command
      : typeof e.file_path === 'string'
        ? e.file_path
        : typeof e.pattern === 'string'
          ? e.pattern
          : typeof e.path === 'string'
            ? e.path
            : typeof e.url === 'string'
              ? e.url
              : ''

  return cut(`${tool} ${arg.replace(/\s+/g, ' ')}`.trim(), 120)
}

// ---------------------------------------------------------------- measuring

let absentLogged = false

async function measure($: EngineInterface, why: string): Promise<void> {
  const usage = await $.session.usage().catch(() => undefined)
  if (usage === undefined) {
    return
  }
  const acw = Number((await $.env.get('CLAUDE_CODE_AUTO_COMPACT_WINDOW')) ?? '0') || 0
  const s = await read($, live)
  const window = usage.context.window
  const reservePct = reserveOf(acw, window)
  // A reading with no fill (before the first response, after a compaction, and
  // seen at the end of a -p run) keeps the last known fill; the log says so.
  const isAbsent = usage.context.percent === undefined
  if (isAbsent && s.ctx.pct !== null && !absentLogged) {
    absentLogged = true
    await log($, 'usage.context-absent', { why, keptPct: s.ctx.pct, window })
  }
  if (!isAbsent) {
    absentLogged = false
  }
  const rawPct = isAbsent ? s.ctx.rawPct : (usage.context.percent ?? null)
  const pct = rawPct === null ? null : usablePct(rawPct, reservePct)
  const tokens = isAbsent ? s.ctx.tokens : (usage.context.tokens ?? null)
  const rate: RateRow[] = usage.rateLimits.map(r => ({
    kind: r.kind,
    percentUsed: r.percentUsed,
    resetsAt: r.resetsAt ?? null,
  }))
  const costUsd = usage.cost === undefined ? null : Math.round(usage.cost.usd * 10000) / 10000
  const ctxChanged = pct !== s.ctx.pct || tokens !== s.ctx.tokens || window !== s.ctx.window
  const rateChanged = JSON.stringify(rate) !== JSON.stringify(s.rate)
  const costChanged = costUsd !== s.costUsd

  if (ctxChanged || rateChanged || costChanged) {
    await change(
      $,
      'usage',
      st => ({ ...st, ctx: { pct, rawPct, tokens, window, reservePct }, rate, costUsd }),
      { why, pct, rawPct, tokens, window, reservePct, rate, costUsd, changed: { ctxChanged, rateChanged, costChanged } },
    )
  }
}

let lastListSnapshot = ''

async function reconcileList($: EngineInterface): Promise<void> {
  const list = await $.agent.list().catch(() => undefined)
  if (list === undefined) {
    return
  }
  const s = await read($, live)
  const now = await $.clock.now()
  const snapshot = JSON.stringify(list.map(a => [a.id, a.type, a.status]))
  if (snapshot !== lastListSnapshot) {
    lastListSnapshot = snapshot
    await log($, 'agent.list.snapshot', { list })
  }

  for (const a of list) {
    const status = LIST_STATUS[a.status] ?? 'running'
    const row = s.agents.find(r => r.id === a.id)
    const isNew = row === undefined
    // An event of the agent's own loop is fresher than the list for an end;
    // the list wins where the events said nothing or the agent woke again.
    const isMoved = row !== undefined && row.status !== status && !(row.statusFrom === 'event' && !isActive(row.status) && !isActive(status))

    if (isNew || isMoved) {
      await change(
        $,
        isNew ? 'agent.listed' : 'agent.list-status',
        st =>
          withAgent(st, a.id, now, r => ({
            ...r,
            type: r.type === '?' ? a.type : r.type,
            description: r.description === '' ? a.description : r.description,
            name: r.name ?? a.name ?? null,
            parentId: r.parentId ?? a.parentId ?? null,
            status,
            statusFrom: 'list',
            endedAt: isActive(status) ? null : (r.endedAt ?? now),
          })),
        { agentId: a.id, listed: a, before: row?.status ?? null },
      )
    }
  }
}

// ---------------------------------------------------------------- the handover

async function maybeHandover($: EngineInterface): Promise<void> {
  await measure($, 'turn.complete')
  const s = await read($, live)
  const pct = s.ctx.pct
  const key = `fired:${s.sessionId ?? '?'}`
  const firedBefore = (await $.store.get(key)) !== undefined

  await log($, 'handover.check', { pct, threshold: s.handover.threshold, firedAt: s.handover.firedAt, firedBefore })

  if (pct === null || pct < s.handover.threshold || s.handover.firedAt !== null || firedBefore) {
    return
  }

  const now = await $.clock.now()
  await $.store.set(key, now)
  const promptPath = `${jobDir($)}/handover-prompt.txt`
  const text = (await $.fs.read(promptPath).catch(() => '')).trim()
  const asUser = (await $.env.get('DXB_MOD_HANDOVER_ASUSER')) === '1'

  await change(
    $,
    'handover.fired',
    st => ({ ...st, handover: { ...st.handover, firedAt: now, firedAtPct: pct, outcome: 'queued' } }),
    { pct, threshold: s.handover.threshold, asUser, textHead: text.slice(0, 120), promptPath },
  )

  if (text === '') {
    await change($, 'handover.no-text', st => ({ ...st, handover: { ...st.handover, outcome: 'no text' } }), { promptPath })

    return
  }

  // Not awaited: $.prompt.submit resolves when ITS turn starts, which cannot
  // happen before this turn.complete hook has returned.
  const draft = await $.prompt.read().catch(() => ({ text: '<read failed>', cursor: 0 }))
  const submitted = asUser ? $.prompt.submit({ text, asUser: true }) : $.prompt.submit({ text })

  void log($, 'handover.submit.called', { asUser, draftAtSubmit: draft.text })
  void submitted.then(
    async r => {
      const at = await $.clock.now()
      const draftAfter = await $.prompt.read().catch(() => ({ text: '<read failed>', cursor: 0 }))
      await change(
        $,
        'handover.submit.resolved',
        st => ({ ...st, handover: { ...st.handover, submitResolvedAt: at, outcome: r.drop === undefined ? 'turn started' : `dropped: ${r.drop}` } }),
        { result: r, draftAtTurnStart: draftAfter.text },
      )
    },
    async (err: unknown) => {
      await change(
        $,
        'handover.submit.rejected',
        st => ({ ...st, handover: { ...st.handover, outcome: `rejected: ${String(err)}` } }),
        { error: String((err as Error)?.message ?? err) },
      )
    },
  )
}

// ---------------------------------------------------------------- P3 probes

async function probes($: EngineInterface): Promise<void> {
  const version = await $.process
    .run(['/home/dxb/.local/bin/claude', '--version'], { timeoutMs: 20_000 })
    .then(r => ({ exitCode: r.exitCode, stdout: r.stdout.trim(), stderr: r.stderr.trim().slice(0, 300) }))
    .catch((err: unknown) => ({ error: String((err as Error)?.message ?? err) }))
  await log($, 'p3.process.run.claude-version', { version })

  const term = await $.process
    .run(['sh', '-c', 'for t in ptyxis gnome-terminal kgx konsole xterm; do command -v $t; done; echo DISPLAY=${DISPLAY:-} WAYLAND=${WAYLAND_DISPLAY:-}'], { timeoutMs: 10_000 })
    .then(r => ({ exitCode: r.exitCode, stdout: r.stdout.trim() }))
    .catch((err: unknown) => ({ error: String((err as Error)?.message ?? err) }))
  await log($, 'p3.process.run.terminals', { term })

  // A streamed child: does $.process.spawn run, and what does it give back?
  try {
    const pieces: string[] = []
    const child = $.process.spawn({ argv: ['/home/dxb/.local/bin/claude', '--version'] })
    for await (const piece of child) {
      pieces.push(`${piece.stream}:${piece.text.trim()}`)
    }
    await log($, 'p3.process.spawn.claude-version', { pieces })
  } catch (err) {
    await log($, 'p3.process.spawn.claude-version', { error: String((err as Error)?.message ?? err) })
  }

  const to = await $.env.get('DXB_MOD_SEND_TO')
  if (to !== undefined && to !== '') {
    const text = `P3 probe from session ${await $.session.id()}: hello from the dxb-live-pane mod at ${new Date(await $.clock.now()).toISOString()}`
    const sent = await $.session
      .send({ to: { sessionId: to }, text })
      .catch((err: unknown) => ({ error: String((err as Error)?.message ?? err) }))
    await log($, 'p3.session.send', { to, sent })
  }
  // The control: a session id that runs nowhere.
  const ghost = await $.session
    .send({ to: { sessionId: '00000000-0000-4000-8000-000000000000' }, text: 'P3 probe: nobody is here' })
    .catch((err: unknown) => ({ error: String((err as Error)?.message ?? err) }))
  await log($, 'p3.session.send.ghost', { sent: ghost })
}

// ---------------------------------------------------------------- register

export const register: Register = on => {
  let beat: { cancel: () => void } | null = null

  on('session.start', async ($, e, next) => {
    const started = await next(e)
    const sessionId = await $.session.id().catch(() => null)
    const threshold = Number((await $.env.get('DXB_MOD_HANDOVER_PCT')) ?? '50') || 50
    const tz = await $.process
      .run(['date', '+%z'], { timeoutMs: 5000 })
      .then(r => {
        const m = /^([+-])(\d\d)(\d\d)/.exec(r.stdout.trim())
        return m === null ? 0 : (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]))
      })
      .catch(() => 0)
    const model = await $.session.model().catch(() => null)

    // A new session starts clean; a reload of the same session keeps its rows.
    await change(
      $,
      'session.start',
      s =>
        s.sessionId === sessionId
          ? { ...s, tzOffsetMin: tz, handover: { ...s.handover, threshold } }
          : { ...EMPTY, sessionId, tzOffsetMin: tz, main: { ...EMPTY.main, model }, handover: { ...EMPTY.handover, threshold } },
      { cwd: e.cwd, surface: e.surface, isInteractive: e.isInteractive, threshold, tzOffsetMin: tz, model },
    )

    await $.command
      .register({ name: 'live', description: 'Open the DXB live pane (subagents, context, effort, usage)' })
      .catch(err => log($, 'command.register.failed', { error: String(err) }))

    const opened = await $.ui.open({ id: PANE, title: 'DXB live' }).catch((err: unknown) => ({ error: String(err) }))
    await log($, 'pane.open.unasked', { opened })

    await measure($, 'session.start')

    beat?.cancel()
    beat = $.clock.every(HEARTBEAT_MS, () => {
      void (async () => {
        await reconcileList($)
        await measure($, 'heartbeat')
        const s = await read($, live)
        if (s.main.isRunning || s.agents.some(r => isActive(r.status))) {
          const at = await $.clock.now()
          await update($, tick, () => at)
        }
      })()
    })

    if ((await $.env.get('DXB_MOD_P3')) === '1') {
      await probes($)
    }

    return started
  })

  on('command.run', { command: 'live' }, async $ => {
    const opened = await $.ui.open({ id: PANE, title: 'DXB live' })
    await log($, 'pane.open.asked', { opened })

    return { text: opened.isPlaced ? 'DXB live pane opened.' : `DXB live pane waits: ${opened.reason}` }
  })

  on('prompt.submit', async ($, e, next) => {
    await log($, 'prompt.submit', { origin: e.origin, isMeta: e.isMeta ?? false, turnId: e.turnId ?? null, textHead: e.text.slice(0, 80) })
    if ((await $.env.get('DXB_MOD_DROP_PROMPT')) === '1' && e.origin.kind !== 'plugin') {
      return { drop: 'dxb-live-pane P3 probe: this run makes no model turn' }
    }

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await measure($, `session.measure:${e.changed.join(',')}`)

    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    const now = await $.clock.now()
    if (e.agentId === undefined) {
      await change(
        $,
        'main.turn.start',
        s => ({ ...s, main: { ...s.main, isRunning: true, turnStartedAt: now, turnEndedAt: null, steps: 0 } }),
        { turnId: e.turnId, textHead: e.text.slice(0, 80) },
      )
    } else {
      const id = e.agentId
      await change(
        $,
        'agent.turn.start',
        s => withAgent(s, id, now, r => ({ ...r, status: 'running', statusFrom: 'event', endedAt: null })),
        { agentId: id, turnId: e.turnId, textHead: e.text.slice(0, 80) },
      )
    }

    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    const now = await $.clock.now()
    const effort = e.effort === undefined ? null : String(e.effort)
    if (e.agentId === undefined) {
      await change(
        $,
        'main.turn.step',
        s => ({ ...s, main: { ...s.main, model: e.model, effort, isRunning: true, steps: e.index + 1 } }),
        { turnId: e.turnId, index: e.index, model: e.model, effort, messageCount: e.messageCount },
      )
    } else {
      const id = e.agentId
      await change(
        $,
        'agent.turn.step',
        s =>
          withAgent(s, id, now, r => ({
            ...r,
            model: r.modelFrom === 'spawn' ? r.model : e.model,
            modelFrom: r.modelFrom === 'spawn' ? 'spawn' : 'step',
            effort,
            steps: r.steps + 1,
            status: 'running',
            statusFrom: 'event',
          })),
        { agentId: id, turnId: e.turnId, index: e.index, model: e.model, effort },
      )
    }

    return yield* next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const now = await $.clock.now()
    const out = e.usage?.output_tokens ?? 0
    if (e.agentId === undefined) {
      await change(
        $,
        'main.turn.complete',
        s => ({ ...s, main: { ...s.main, isRunning: false, turnEndedAt: now, model: e.usage?.model ?? s.main.model } }),
        { turnId: e.turnId, reason: e.reason, durationMs: e.durationMs, usage: e.usage ?? null },
      )
      const result = await next(e)
      if (e.reason === 'answer') {
        await maybeHandover($)
      }

      return result
    }
    const id = e.agentId
    const status: AgentRowStatus = e.reason === 'answer' ? 'done' : e.reason === 'aborted' ? 'killed' : 'failed'
    await change(
      $,
      'agent.turn.complete',
      s =>
        withAgent(s, id, now, r => ({
          ...r,
          status,
          statusFrom: 'event',
          endedAt: now,
          outputTokens: r.outputTokens + out,
          model: r.model ?? e.usage?.model ?? null,
          modelFrom: r.modelFrom === 'none' && e.usage?.model !== undefined ? 'step' : r.modelFrom,
          lastActivity: e.answer === '' ? r.lastActivity : `answered: ${cut(e.answer.replace(/\s+/g, ' '), 100)}`,
          lastActivityAt: now,
        })),
      { agentId: id, turnId: e.turnId, reason: e.reason, durationMs: e.durationMs, usage: e.usage ?? null, answerHead: e.answer.slice(0, 120) },
    )

    return next(e)
  })

  on('agent.spawn', async ($, e, next) => {
    const now = await $.clock.now()
    await log($, 'agent.spawn.asked', {
      subagentType: e.subagentType,
      description: e.description,
      model: e.model ?? null,
      parentModel: e.parentModel,
      background: e.background,
      fork: e.fork,
      name: e.name ?? null,
      parentAgentId: e.parentAgentId ?? null,
      resume: e.resume ?? null,
      provider: e.provider,
    })
    const result = await next(e)
    if (result.deny !== undefined) {
      await log($, 'agent.spawn.denied', { deny: result.deny })

      return result
    }
    const id = result.agentId
    if (id !== undefined) {
      await change(
        $,
        'agent.spawn',
        s =>
          withAgent(s, id, now, r => ({
            ...r,
            type: e.subagentType,
            description: e.description,
            name: e.name ?? r.name,
            model: result.model,
            modelFrom: 'spawn',
            background: e.background,
            parentId: e.parentAgentId ?? null,
            startedAt: r.steps === 0 ? now : r.startedAt,
          })),
        { agentId: id, model: result.model, subagentType: e.subagentType, background: e.background },
      )
    } else {
      await log($, 'agent.spawn.no-id', { result })
    }

    return result
  })

  // Every tool but Agent: the Agent call is the spawn itself, and a hook frame
  // around it might keep this plugin from hearing the agent's own loop.
  on('tool.call', { tool: /^(?!Agent$)/ }, async ($, e, next) => {
    const now = await $.clock.now()
    const what = activityOf(e as unknown as Record<string, unknown>)
    if (e.agentId === undefined) {
      await change($, 'main.tool', s => ({ ...s, main: { ...s.main, lastTool: what } }), { tool: String(e.tool), what })
    } else {
      const id = e.agentId
      await change(
        $,
        'agent.tool',
        s => withAgent(s, id, now, r => ({ ...r, tools: r.tools + 1, lastActivity: what, lastActivityAt: now })),
        { agentId: id, tool: String(e.tool), what },
      )
    }

    return next(e)
  })

  on('session.receive', async ($, e, next) => {
    await log($, 'p3.session.receive', { origin: e.origin, agentId: e.agentId ?? null, textHead: e.text.slice(0, 200) })

    return next(e)
  })

  on('session.send', async ($, e, next) => {
    const result = await next(e)
    await log($, 'session.send.seen', { to: e.to, origin: e.origin, agentId: e.agentId ?? null, result })

    return result
  })

  // ---------------------------------------------------------------- drawing

  let lastRenderKey = ''

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const s = await read($, live)
    const t = await read($, tick)
    const cols = Math.max(20, e.props.bodyColumns)
    const isAnyRunning = s.main.isRunning || s.agents.some(r => isActive(r.status))
    // While something runs the heartbeat moves `tick`; idle, time stands at the last change.
    const now = isAnyRunning ? Math.max(t, s.lastChangeAt ?? 0) : (s.lastChangeAt ?? 0)
    const tz = s.tzOffsetMin

    const renderKey = `${e.surface}|${e.props.placement}|${cols}|${e.viewport?.columns ?? '?'}|${e.viewport?.isFullscreen ?? '?'}`
    if (renderKey !== lastRenderKey) {
      lastRenderKey = renderKey
      void log($, 'pane.render', {
        surface: e.surface,
        placement: e.props.placement,
        bodyColumns: e.props.bodyColumns,
        viewport: e.viewport ?? null,
      })
    }

    const ctxColor = s.ctx.pct === null ? 'inactive' : s.ctx.pct >= s.handover.threshold ? 'error' : s.ctx.pct >= 40 ? 'warning' : 'success'
    const ctxText =
      s.ctx.pct === null
        ? 'ctx —  (no response yet)'
        : `ctx ${s.ctx.pct}%  (raw ${s.ctx.rawPct ?? '?'}% · ${Math.round((s.ctx.tokens ?? 0) / 1000)}k/${Math.round((s.ctx.window ?? 0) / 1000)}k)`
    const mainText = s.main.isRunning
      ? `lead: working ${spanText(now - (s.main.turnStartedAt ?? now))} · step ${s.main.steps}`
      : s.main.turnEndedAt === null
        ? 'lead: no turn yet'
        : `lead: idle since ${clockText(s.main.turnEndedAt, tz)}`
    const modelText = `model ${shortModel(s.main.model)} · effort ${s.main.effort ?? '?'}`
    const rateText =
      s.rate.length === 0
        ? 'usage windows: no reading yet'
        : s.rate.map(r => `${r.kind.replace('five_hour', '5h').replace('seven_day', '7d')} ${r.percentUsed}% ↺${resetText(r.resetsAt, now || Date.now(), tz)}`).join(' · ')
    const running = s.agents.filter(r => isActive(r.status))
    const rest = s.agents.filter(r => !isActive(r.status))
    const room = Math.max(3, (e.props.scroll?.bodyRows ?? 24) - 9)
    const rows = [...running, ...rest.slice().reverse()].slice(0, room)
    const ho = s.handover
    const hoText =
      ho.firedAt === null
        ? `handover at ${ho.threshold}%: not yet`
        : `handover fired ${clockText(ho.firedAt, tz)} at ${ho.firedAtPct}% · ${ho.outcome ?? ''}`

    return (
      <Box flexDirection="column">
        <Text weight="bold">{cut(`DXB live · last change ${s.lastChangeAt === null ? '—' : clockText(s.lastChangeAt, tz)}`, cols)}</Text>
        <Text color={ctxColor}>{cut(ctxText, cols)}</Text>
        <Text color={s.main.isRunning ? 'success' : undefined} weight={s.main.isRunning ? 'bold' : 'regular'}>
          {cut(mainText, cols)}
        </Text>
        <Text dimColor>{cut(modelText, cols)}</Text>
        <Text dimColor>{cut(`${rateText}${s.costUsd === null ? '' : ` · $${s.costUsd.toFixed(2)}`}`, cols)}</Text>
        <Text>{cut(`agents: ${running.length} working · ${rest.length} finished`, cols)}</Text>
        {rows.length === 0 && <Text dimColor>no subagent yet</Text>}
        {rows.map(r => {
          const isOn = isActive(r.status)
          const span = spanText((r.endedAt ?? now) - r.startedAt)
          const head = `${isOn ? '●' : r.status === 'failed' || r.status === 'killed' ? '✕' : '○'} ${r.type} · ${shortModel(r.model)}${r.effort === null ? '' : `/${r.effort}`} · ${r.status} ${span} · from ${clockText(r.startedAt, tz)}`
          const tail = r.lastActivity === null ? cut(r.description, cols - 2) : cut(r.lastActivity, cols - 2)

          return (
            <Box flexDirection="column">
              <Text color={isOn ? 'success' : r.status === 'failed' ? 'error' : undefined} weight={isOn ? 'bold' : 'regular'} dimColor={!isOn}>
                {cut(head, cols)}
              </Text>
              <Text dimColor>{`  ${tail}`}</Text>
            </Box>
          )
        })}
        <Text dimColor>{cut(hoText, cols)}</Text>
      </Box>
    )
  })
}
