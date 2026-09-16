# Can hooks be declared in a Claude Code `SKILL.md` frontmatter?

Research run `20260916-212351` · class `capability` · mode LIGHT · 2026-09-16
Measured against **Claude Code 2.1.273** (`claude --version` → `2.1.273 (Claude Code)`),
binary `/home/dxb/.local/share/claude/versions/2.1.273`.

## Answer

**YES.** `hooks:` is a first-class, documented field of `SKILL.md` frontmatter. Claude Code
registers those hooks **at the moment the skill is invoked** — not at startup, and not when the
skill is merely preloaded — and then keeps them for the rest of that running session unless the
individual hook carries `once: true`.

## The four independent doors this rests on

### 1 · The shipped binary's own schema (`code`, ledger L0229)

```
hooks: ae().optional().describe("Hooks registered while this skill is active. Same shape as settings.json `hooks`.")
```

`hooks` sits in the recognised skill/command frontmatter field list:

```
var dR=["name","description","model","allowed-tools","disallowed-tools","disallowedTools",
"argument-hint","arguments","disable-model-invocation","user-invocable","effort","shell",
"version","when_to_use","paths","hooks","context","agent","background","fallback", ...]
```

The parser refuses the common mistake of writing the event at the top level:

```
function $zs(e,n){ if(IB(e,O8e)) return t(`Skill '${n}': PreToolUse/PermissionRequest is declared
  at the frontmatter top level, outside "hooks" ...`,{level:"error"}), {hooks:void 0,unloadableGuard:!0};
  ... let s=r4().safeParse(e.hooks); ... }
```

### 2 · The registration site — this is the "only when invoked" half (`code`, L0229)

Inside skill execution, after the skill's prompt is built:

```
let N=(!bc("hooks")||hK(e.source))&&!I;
if(e.hooks&&N){ let r=J(); He(o.sessionHooksRegistry,r,e.hooks,e.name,e.type==="prompt"?e.skillRoot:void 0) }
```

* `I` = `isSkillPreload` / `readOnlySkillLoad` → a skill that is only **preloaded** registers nothing.
* `bc(o)` = managed `policySettings.strictPluginOnlyCustomization` contains `o`; `hK(o)` = source is
  one of `plugin · policySettings · built-in · builtin · bundled`. So an enterprise policy listing
  `hooks` blocks a user/project skill's hooks while leaving plugin and bundled skills' hooks alive.

The registrar itself, and the only removal path on the skill side:

```
function He(e,s,o,d,l){ let f=0;
  for(let h of Ff){ let C=o[h]; if(!C) continue;
    for(let w of C) for(let R of w.hooks){
      let I=R.once?()=>{ t(`Removing one-shot hook for event ${h} in skill '${d}'`), e.remove(s,h,R) }:void 0;
      e.add(s,h,w.matcher||"",R,{onHookSuccess:I,skillRoot:l}), f++ } }
  if(f>0) t(`Registered ${f} hooks from skill '${d}'`) }
```

At runtime such a hook is labelled with its own source: `skill:<skillName>`.
By contrast the **agent** path tears its hooks down when the agent ends —
`{name:"sessionHooks", run:()=>{ if(e.hooks) r.sessionHooksRegistry.clear(tr) }}` — and the skill
path has no equivalent. That asymmetry is the lifetime difference, in the code.

### 3 · The official documentation (`primary-doc`)

`https://docs.claude.com/en/docs/claude-code/skills`, frontmatter table:

> | `hooks` | No | Hooks that Claude Code registers when the skill is invoked and keeps running
> for the rest of the session. See *Hooks in skills and agents* for the configuration format and
> the `once` option. |

`https://docs.claude.com/en/docs/claude-code/hooks`, "Hooks in skills and agents":

> **Skill hooks**: Claude Code registers them when you or Claude invoke the skill and keeps
> running them for the rest of the session, on turns after the skill's own turn as well. To have
> Claude Code remove a hook after its first successful run instead, set `once: true` on it.
> … Frontmatter hooks in a project skill follow the same workspace trust rule as hooks in settings
> files. Claude Code registers them when you or Claude invoke the skill, **including in a `-p` run
> in a folder you haven't trusted.**

Same page, the hook-source table: *Skill frontmatter → "The rest of the session once the skill is
invoked"*, against *Subagent frontmatter → "While that subagent is running"*.

### 4 · Live A/B test on this machine (`independent-test`, L0228 + L0231)

Probe skill `.claude/skills/ht-probe/SKILL.md` in a throwaway folder, frontmatter:

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "echo FIRED-BY-SKILL-HOOK >> .../hooktest/marker.txt"
```

| run | what the session did | `marker.txt` |
|---|---|---|
| A | called Bash, **never invoked the skill** | **does not exist** — hook never fired |
| B | invoked the skill, then called Bash | `FIRED-BY-SKILL-HOOK` — 1 line |
| D | one session, two turns: turn 1 invoked the skill + Bash, turn 2 only Bash | **2 lines** — still registered on the later turn |

Run D was a single session (`"session_id":"653a6b3b-f386-40a7-b4fe-11adc481ee74"`, one id in the
whole stream), driven with `--input-format stream-json`.

## The one boundary the documentation does not name

| run | | `marker.txt` |
|---|---|---|
| C | `claude -p` (skill + Bash), then a **second process** `claude -p --continue` (Bash only) | stayed at **1 line** — the hook did not fire on the continued turn |
| E | same pair of commands with `--output-format json` | both report `"session_id":"fad6bf48-0cf2-4632-bdf0-d896e59d4011"` — **the same session** |

So "the rest of the session" means the rest of the **running process**. The registry that holds
these hooks is an in-memory map (`class _Ut { sessions=new Map }`), so a new `-p --continue`
process that resumes the same session id starts with it empty. The reading of the code is mine;
the two measurements are the fact.

## What a third-party guide gets wrong

`allahabadi.dev`, *"Claude Code Skill Frontmatter: Every YAML Option Explained"* (`secondary`)
documents the field correctly but states the hooks fire **"only while this skill is active"**.
Run D measured the opposite: the hook fired on the turn after the skill's own turn.

## What would flip this answer

An enterprise `policySettings.strictPluginOnlyCustomization` containing `"hooks"`, or
`"disableAllHooks": true` in the settings that survive precedence. Both are visible in the code
path above; neither is set on this machine, which is why runs B and D fired.

## Where I did not look

* Channels that returned nothing this run: `github-repos`, `hackernews`, `stackoverflow`
  (their fallback, Google, had already run this round).
* The public `CHANGELOG.md` (fetched, 480 408 bytes, read) carries **no line introducing skill
  frontmatter hooks**; it only reaches back to 2.1.105. So **no version floor is established** —
  what is measured is that it works in 2.1.273.
* Only the `PreToolUse` event was tested live; the other events were read in the code, not fired.
