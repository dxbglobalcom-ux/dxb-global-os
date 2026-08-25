---
name: dxb-operator
description: Points to the global `operator` skill. Any job that needs the screen, the mouse or the keyboard is done with the globally installed `operator` command.
---

# The screen, the mouse and the keyboard → `operator`

The procedure lives once, in the global skill: `~/.agents/skills/operator/SKILL.md`. Read that
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
