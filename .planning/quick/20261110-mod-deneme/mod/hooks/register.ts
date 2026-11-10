// dxb-effort-trial — a TRIAL mod, loaded only per run with --plugin-dir.
//
// What it does:
//   1. On each user message it decides a level for the turn: medium, high or
//      xhigh. First choice: one small side call, $.model.classify, over three
//      self-describing labels. If that call fails or names no label, a plain
//      keyword rule decides, and the log row says which of the two decided.
//   2. On every model request of that turn (turn.step, main loop only) it
//      rewrites `effort` to that level. No skill call, nothing typed.
//   3. If the environment variable DXB_MOD_TALK_MODEL is set, a turn classified
//      as talk (medium) is also sent to that model; other turns keep the
//      session's model.
//   4. It appends one JSON line per classification and one per request to
//      <job>/mod-log.jsonl (the folder that holds this mod's folder).
import type { EngineInterface, Register } from 'claude-code'

type Level = 'medium' | 'high' | 'xhigh'

type Decision = {
  level: Level
  label: string
  by: 'classify' | 'keyword-fallback'
  note?: string
}

const TALK = 'talk-question-fact-record'
const WORK = 'plan-design-architecture-code'
const HEAVY = 'truly-complex-important-job'
const LABELS = [TALK, WORK, HEAVY] as const

const LEVEL_OF: Record<string, Level> = {
  [TALK]: 'medium',
  [WORK]: 'high',
  [HEAVY]: 'xhigh',
}

const WORK_WORDS =
  /\b(plan|design|sketch|architect\w*|implement\w*|refactor\w*|code|function|schema|migration|queue|algorithm|spec|tasar\w*|mimari\w*|kod\w*|planla\w*)\b/i

const keywordRule = (text: string): Level => (WORK_WORDS.test(text) ? 'high' : 'medium')

const logPath = ($: EngineInterface): string => {
  const root = $.plugin.root.replace(/\/+$/, '')

  return `${root.slice(0, root.lastIndexOf('/'))}/mod-log.jsonl`
}

// $.fs has no append: read what is there, write it back with one more line.
// Requests of one session run one after another, so the rows do not race.
async function appendLog($: EngineInterface, row: Record<string, unknown>): Promise<void> {
  try {
    const path = logPath($)
    const time = new Date(await $.clock.now()).toISOString()
    const sessionId = await $.session.id()
    const before = await $.fs.read(path).catch(() => '')
    const line = JSON.stringify({ time, sessionId, ...row })

    await $.fs.write(path, `${before}${line}\n`)
  } catch {
    // The log must never break a turn.
  }
}

async function decide($: EngineInterface, text: string, at: string): Promise<Decision> {
  const sample = text.slice(0, 2000)
  let decision: Decision

  try {
    const label = await $.model.classify(sample, LABELS)
    const level = label === undefined ? undefined : LEVEL_OF[label]

    decision =
      label !== undefined && level !== undefined
        ? { level, label, by: 'classify' }
        : {
            level: keywordRule(sample),
            label: 'none',
            by: 'keyword-fallback',
            note: 'classify named no label',
          }
  } catch (error) {
    decision = {
      level: keywordRule(sample),
      label: 'none',
      by: 'keyword-fallback',
      note: `classify rejected: ${String((error as Error)?.message ?? error).slice(0, 200)}`,
    }
  }

  await appendLog($, {
    kind: 'classification',
    at,
    promptHead: text.slice(0, 80),
    promptChars: text.length,
    ...decision,
  })

  try {
    $.ui.status(`effort ${decision.level}`)
  } catch {
    // No surface (claude -p): nothing to show.
  }

  return decision
}

export const register: Register = on => {
  // The decision for the prompt that was just submitted, until its turn starts.
  let pending: Decision | null = null
  // turnId -> the decision its requests run under.
  const byTurn = new Map<string, Decision>()

  on('prompt.submit', async ($, e, next) => {
    if (e.isMeta !== true && e.command === undefined) {
      pending = await decide($, e.text, 'prompt.submit')
    }

    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    if (e.agentId !== undefined) {
      return next(e)
    }

    // Where prompt.submit did not fire for this turn, decide here.
    const decision = pending ?? (e.text === '' ? null : await decide($, e.text, 'turn.start'))
    pending = null

    if (decision !== null) {
      byTurn.set(e.turnId, decision)
    }

    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    const decision = e.agentId === undefined ? byTurn.get(e.turnId) : undefined

    if (decision === undefined) {
      return yield* next(e)
    }

    const talkModel = await $.env.get('DXB_MOD_TALK_MODEL')
    const isTalkToOther = decision.level === 'medium' && talkModel !== undefined && talkModel !== ''
    const askedModel = isTalkToOther ? talkModel : e.model
    const asked = { ...e, effort: decision.level, model: askedModel }
    const row = {
      kind: 'request',
      turnId: e.turnId,
      index: e.index,
      messageCount: e.messageCount,
      classification: decision.label,
      classifiedBy: decision.by,
      incomingEffort: e.effort ?? null,
      incomingModel: e.model,
      askedEffort: decision.level,
      askedModel,
    }

    let answeredModel: string | null = null
    let usage: Record<string, number> | null = null

    try {
      const result = yield* next(asked)

      if (result.usage !== null) {
        answeredModel = result.usage.model
        usage = {
          input_tokens: result.usage.input_tokens,
          cache_creation_input_tokens: result.usage.cache_creation_input_tokens,
          cache_read_input_tokens: result.usage.cache_read_input_tokens,
          output_tokens: result.usage.output_tokens,
        }
      }

      return result
    } finally {
      await appendLog($, { ...row, answeredModel, usage })
    }
  })
}
