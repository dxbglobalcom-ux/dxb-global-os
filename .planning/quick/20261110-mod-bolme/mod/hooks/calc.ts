// Pure arithmetic and time text of dxb-live-pane, shared with its tests.

export const DEFAULT_RESERVE_PCT = 16.5

/** The status line's reserve: CLAUDE_CODE_AUTO_COMPACT_WINDOW, else 16.5 %. */
export const reserveOf = (acw: number, window: number): number =>
  acw > 0 ? Math.min(100, Math.max(0, (1 - acw / window) * 100)) : DEFAULT_RESERVE_PCT

/**
 * /home/dxb/.claude/hooks/dxb-statusline.js usedPercent(), on the figures the
 * API gives: remaining = 100 - used_percentage, then the usable window.
 */
export const usablePct = (rawPct: number, reservePct: number): number => {
  const remaining = 100 - rawPct
  const usableRemaining = Math.max(0, ((remaining - reservePct) / (100 - reservePct)) * 100)

  return Math.max(0, Math.min(100, Math.round(100 - usableRemaining)))
}

// ---------------------------------------------------------------- time text

export const pad = (n: number): string => String(n).padStart(2, '0')

export const clockText = (ms: number, tzOffsetMin: number): string => {
  const d = new Date(ms + tzOffsetMin * 60_000)

  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
}

export const spanText = (ms: number): string => {
  const s = Math.max(0, Math.round(ms / 1000))

  return s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m${pad(s % 60)}s` : `${Math.floor(s / 3600)}h${pad(Math.floor((s % 3600) / 60))}m`
}

