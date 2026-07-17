# Study Card: Telegram channel (Claude Code plugin)

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 7 "telegram").

- **Tool:** Official Anthropic Telegram plugin (claude-plugins-official) — DM a Telegram bot ⇄ Claude Code session bridge
- **Slug:** telegram-channel
- **Category:** Claude Code ecosystem / Comms
- **Status:** STUDY
- **Target Phase:** 10 (CEO mobile channel to the holding; candidate JARVIS-adjacent input lane)
- **Owner (dept/tier):** Orchestrator (Hamza line) / CEO comms
- **Trigger Type:** mcp-profile (plugin ships an MCP server + bot)
- **Source:** https://github.com/anthropics/claude-plugins-official (external_plugins/telegram) — official Anthropic registry
- **Pinned Version:** registry-latest at INSTALL (record exact commit then)
- **Purpose:** CEO texts the holding from the phone: messages forward into a Claude Code session; replies/reactions/edits flow back. Fits anti-baby-sitting (intent from anywhere) and complements the /voice line (R3.1). Also candidate transport for alerts→CEO push.
- **Official Docs URL:** https://github.com/anthropics/claude-plugins-official/blob/main/external_plugins/telegram/README.md

## Key API / Usage Notes

- Three MCP tools: reply, react (emoji), edit previous message. Bot created via BotFather; token = secret (vault/.env only, never repo).
- **Runtime requirement: Bun** — Node/Deno runs fail (documented upstream). VPS placement must add Bun.
- Alternative patterns rejected for v1: Telethon account-level MCP (chigwell/telegram-mcp — full account surface = oversized privilege), RichardAtCT/claude-code-telegram (remote code session from phone = approval-gate bypass risk). Official plugin's narrow reply/react/edit surface matches least-privilege.

## Known Pitfalls

1. Inbound Telegram text is UNTRUSTED input — must land in the same intents intake as voice/typed (V5 single-path law), never as raw tool instructions.
2. Bot token leak = full bot control: vault only, rotation drill.
3. Outward messages to anyone other than the CEO = outward action → approval gate.

- **Install Command:** (deferred to ADOPT) install Bun, then `claude plugin add telegram` per official README; bot token via vault.
- **Legitimacy Verdict:** OK — first-party Anthropic registry; free (Bot API costs nothing) → D1 compliant.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
