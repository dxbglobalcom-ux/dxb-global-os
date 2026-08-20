---
name: dxb-operator
description: Use when a job needs the SCREEN — driving a desktop application with mouse and keyboard, reading what is actually on screen, or verifying by eye what a terminal cannot observe. Carries the working GNOME Wayland driver, the four traps that already cost this project an hour, and the CEO's standing law that a refusal is not an acceptable answer.
---

# The machine is driven the way a human drives it

**His order, 2026-08-20/21, given twice:** *"mouse ı falan herşeyi kullan insan gibi human style
kullan… hangi tool hangi skill hangi plugin hangi mcp gerekiorsa tıpkı bir insan gibi
kullanabilmen için ne gerekiorsa onu kur ve yap."* · *"kalıcı olarak yaz her zaman her opus bunu
kullansın."*

**THE LAW HE ATTACHED, and it is wider than this door — it binds every agent in the holding:**

> *"en nefret ettiğim şey hayır yapamam olmaz vs gibi cvplar. BUNLARI CEO OLARAK KABUL ETMİORM…
> aynı şey bu holding içindeki tüm ajanlar için geçerli asla HAYIR CVBNI KABUL ETMEM."*

A blocker is the **start** of the work, never the end of it. If a tool is missing, install it. If
the obvious path is closed, find the one that is open — this file exists because the obvious paths
(`xdotool`, `ydotool`, `grim`, `gnome-screenshot`, the Shell screenshot interface) are **all closed
on this machine**, and there is still a way through that needs no root and no package.

## What is on the machine

| | |
|---|---|
| Driver | `scripts/operator/op.py` — pointer, click, keyboard |
| Screen | `scripts/operator/shot.py` — one PNG frame of the whole screen |
| Route | Mutter's own `org.gnome.Mutter.RemoteDesktop` + `org.gnome.Mutter.ScreenCast` |
| Needs | Nothing. No root, no package, no `sudo`. `python3-gi` and GStreamer are already present |
| Screen | `DP-2`, **3440×1440** (measured 2026-08-21) |

```bash
cd "scripts/operator"
python3 -c "
import sys; sys.path.insert(0,'.')
from op import Op
op = Op()
op.move(1720, 720)      # ekranin ortasi
op.click()              # sol tik (272)
op.type_text('hello')
op.key(0xff0d)          # Return; Escape 0xff1b, Super 0xffeb
op.stop()"

python3 shot.py /tmp/screen.png     # sonra Read ile bak
```

**Always read the screenshot back before the next action.** A click that lands on the wrong window
is the normal failure, not the exception — it happened on the first attempt of the session that
wrote this file, and the only reason it was caught is that the screen was read after the click.

## The four traps — do not rediscover them

1. **`cursor-mode` must be `2`.** At `1` the compositor hides the real pointer and draws a virtual
   one into the capture stream: every call succeeds, the log looks perfect, and the CEO sees a
   frozen mouse. He said *"mouse hep duruor"* and he was right.
2. **Only the RemoteDesktop session's `Start()` is called.** It starts the screen stream too.
   Calling the ScreenCast session's own `Start()` fails with *Must be started from remote desktop
   session*. And the order matters — RemoteDesktop first.
3. **The PipeWire node id arrives on the `PipeWireStreamAdded` signal, after `Start()`.** It is
   never in the stream's `Parameters` property; reading it there throws `KeyError: 'node-id'`.
   Subscribe to the signal *before* `Start()`, then pump the main context until it lands.
4. **Never `pkill -f` on a pattern your own command line contains.** `pkill -f "port 41999"` kills
   the shell running it — exit code 144, three times in one night. Use `pkill -x <exact-name>`, or
   kill by pid.

## Windows and focus

A click goes to whatever window is under the pointer, and the app you want is often behind. Bring
it forward first: press `Super` (`0xffeb`), type the application's name, press `Return`
(`0xff0d`) — the same three moves a person makes. Clicking a window's own title bar also focuses
it. Verify with a screenshot before clicking anything that matters.

## When an application will not start

An Electron app that exits **immediately with code 0 and no output** is not broken — it found a
stale single-instance lock and handed off to a process that no longer exists. Delete
`~/.config/<App>/SingletonLock`, `SingletonSocket`, `SingletonCookie` and start it again. Measured
on LM Studio, 2026-08-21.

## The boundary

Driving the screen does not widen any other boundary. The approval gate, the outward-communication
rules and the Islamic boundaries apply to what is done on screen exactly as they apply to what is
done in a terminal — a mouse is a hand, not a permission.
