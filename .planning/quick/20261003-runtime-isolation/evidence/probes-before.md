# 2026-10-03 probes of what loads into a company SDK call (lead's session env, cwd = the residents' WorkingDirectory)
## leak-probe.mjs: A = Hamza's lane options as they stood, B = settingSources: []
A_as_is INIT tools=58 mcp=[plugin:claude-mem:mcp-search, playwright, context7, scrapling, claude.ai Claude Docs] slash=94 skills=60 plugins=[claude-mem] agents=10 · input_total=44306 · canaries anti-baby-sitting/Hitap protokol/graphify/THE CUPBOARD: PRESENT x4
B_isolated INIT tools=0 mcp=0 plugins=0 slash=51 skills=17 (bundled) agents=5 (built-in) · input_total=4267 · Hitap protokol PRESENT, the other three ABSENT
## leak-probe2.mjs: all with settingSources: []
B_isolated input_total=4237 · Hitap protokol PRESENT, Memory Index PRESENT
C_settings_autoMemory_false input_total=476 · both ABSENT · longest block "You are a Claude agent, built on Anthropic's Claude Agent SDK"
D_env_disable_auto_memory input_total=9612 · both ABSENT · the claude.ai Docs connector instructions appeared (env option changed what loaded) — not chosen
E_neutral_cwd input_total=3865 · both ABSENT — not chosen: the auto-memory's own instructions still load (3,865 vs 476); C reaches 476 without moving the working directory
