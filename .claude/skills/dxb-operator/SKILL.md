---
name: dxb-operator
description: Points to the global `operator` skill. Any job that needs the screen, the mouse or the keyboard is done with the globally installed `operator` command.
---

# The screen, the mouse and the keyboard → `operator`

The procedure lives once, in the global skill: `~/.claude/skills/operator/SKILL.md`. Read that
first — it carries the command surface, the two rules that were learned the hard way, and the
CEO's standing order that a refusal is not an acceptable answer.

```bash
operator shot /tmp/s.png    # one frame of the whole screen — then LOOK at it with Read
operator click 1720 720     # left click at an absolute point
operator type "Türkçe metin de olur"
operator key alt+Tab        # bring a window to the front
```

`/usr/local/bin/operator` works in every shell on this machine and needs no root.

## What is specific to this holding

- **The screen is `DP-2`, 3440×1440** (measured 2026-08-21). Coordinates in evidence and in
  earlier sessions' notes are in that frame.
- **The CEO expects the machine to be verified by YOU** — *"sende insan gibi kullanma yetkisi
  var… operator olarak kullanıp herşeyi teyit edebilirsin"*. A `⚠ UNVERIFIED — requires
  human-eye confirmation` line is not written for anything you can open and look at yourself.
- **Claude Code's own commands are keys on this screen too.** `/goal` and the other slash commands
  go into the session's prompt box by paste: `wl-copy` the line, `operator click` the box, `operator
  shot` to see it focused, `operator key ctrl+shift+v`, read it, `operator key Return` (`operator
  type` inverts case here). Why the engineer does it at all: `dxb-crew` §0 (and `dxb-team1` §5, which points there).

## The second hand — a terminal program, driven WITHOUT the screen: `dxb-tui`

`operator` is for the desktop. When the thing to be driven is a **full-screen terminal
program** (an installer's wizard, a login flow, an agent's own text interface), do NOT drive it
by clicking pixels — the CEO may be typing at that moment and the keystrokes land in his prompt
box. Use `dxb-tui`, which opens the program in its own pseudo-terminal (a terminal with no
window), reads what it is showing, and types into it.

```bash
export TUI_DIR=<a scratch folder>       # each driven program gets its own folder
dxb-tui start /path/to/program          # open it
dxb-tui screen                          # print what it is showing RIGHT NOW — then read it
dxb-tui send "text"                     # type
dxb-tui key enter                       # enter · up · down · left · right · tab · esc · ctrl-c
dxb-tui stop                            # close it, leaving no orphan process
```

Written 2026-08-26 to install and sign in to Antigravity CLI without touching the CEO's screen.
It lives in the holding's tool room — `/home/dxb/tools/tui/tui.py`, beside `operator` and
`OpenMontage` — and `~/.local/bin/dxb-tui` makes it a command in every shell.
Its screen rendering needs `pyte` (a terminal emulator written in Python), installed once at
`/home/dxb/.venvs/tui`.
