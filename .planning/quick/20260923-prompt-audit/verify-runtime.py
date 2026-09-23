"""Re-verify each runtime finding at its file:line: the quoted snippet must sit within +-2 lines,
and each template row's grep count is re-taken. Prints one line per check: OK / MISS."""
import subprocess, os
R = '/home/dxb/DxB Global OS/'
P = R + 'personas/'

POINT = [
    # slice B (personas 1-107)
    ('B1', P + 'ceo/agents-orchestrator.md', 67, 'küçük iş'),
    ('B2', P + 'ceo/agents-orchestrator.md', 60, 'Muhakeme sırası sabittir ve atlanamaz'),
    ('B8', P + 'ceo/agents-orchestrator.md', 110, 'rapor Türkçe'),
    ('B9', P + 'ceo/agents-orchestrator.md', 57, 'sorulmadan durum raporlamaz'),
    ('B10', P + 'marketing/marketing-cross-border-ecommerce.md', 99, 'MUST-B amendment'),
    ('B17', P + 'ceo/agents-orchestrator.md', 165, 'forms of laziness'),
    ('B18', P + 'ceo/agents-orchestrator.md', 203, 'FAILS the gate'),
    ('B19', P + 'data-ai/prompt-context-engineer.md', 55, 'PERSONA YAZARLIĞI BU ROLDE YOKTUR'),
    ('B20', P + 'design/design-image-prompt-engineer.md', 64, 'rejected'),
    ('B4t', R + 'packages/hr/src/template.ts', 33, 'Fable 5 hook'),
    # slice C part 2 (runtime code)
    ('C2-1', R + 'packages/orchestrator/src/chat-drain.ts', 116, 'query('),
    ('C2-2', R + 'packages/orchestrator/src/chat-drain.ts', 118, '"low", "medium", "high", "max"'),
    ('C2-2b', R + 'packages/voice/src/answer.ts', 119, '"low", "medium", "high", "max"'),
    ('C2-5', R + 'packages/orchestrator/src/decompose.ts', 158, 'longest chain <= 3'),
    ('C2-5b', R + 'packages/orchestrator/src/decompose.ts', 38, 'MAX_HOP_DEPTH = 5'),
    ('C2-6', R + 'packages/orchestrator/src/chat-drain.ts', 105, 'under 8 sentences'),
    ('C2-7', R + 'packages/orchestrator/src/chat-drain.ts', 102, 'DO NOT start any work'),
    ('C2-8', R + 'packages/voice/src/answer.ts', 99, '2-4 short spoken sentences'),
    ('C2-9', R + 'packages/orchestrator/src/chat-drain.ts', 111, 'Hamza replies:'),
    ('C2-10', R + 'packages/kernel/src/classify.ts', 126, 'JSON ONLY'),
    ('C2-11', R + 'packages/orchestrator/src/worker-shim.ts', 268, 'verify'),
    ('C2-13', R + 'packages/kernel/src/classify.ts', 35, 'opus-4.8'),
    ('C2-4', R + 'packages/kernel/src/workflow/executor.ts', 74, 'a DXB Global OS employee agent'),
    ('C2-iso', R + 'packages/orchestrator/src/worker-shim.ts', 371, 'workerIsolation'),
    ('C1-5', R + 'packages/voice/src/persona.ts', 50, 'slice(start)'),
]

TEMPLATE = [
    ('B3/C4 fixed reasoning order', r'Muhakeme sırası sabittir|Fixed (reasoning|pipeline) order'),
    ('B4 §11 Fable 5 hook heading', r'^## 11\. Fable 5 hook'),
    ('B5 version comment fable-5', r'^<!-- v[0-9]+ · (fable-5|Opus 5)'),
    ('B6/C2 escalation one sentence', r'^(Escalation language: one sentence|Eskalasyon dili: tek cümle)'),
    ('B7/C3 Dil: rapor Türkçe', r'^Dil: rapor Türkçe'),
    ('C3 Language: English (project artifact', r'^Language: English \(project artifact'),
    ('B11/C7 Plan before execution', r'^- Plan before execution'),
    ('B12/C7 Self-review before handoff', r'^- Self-review before handoff'),
    ('B13/C8 No lazy proposals', r'^- No lazy proposals'),
    ('B14 Fable 5 and Solo 5.6', r'the discipline of Fable 5 and Solo 5\.6 Ultra'),
    ('B15 Inheritance', r'^Inheritance: every future persona'),
    ('B16 Format sabittir / Fixed format', r'^(Format sabittir|Fixed format)'),
    ('C1 notify_broadcast', r'notify_broadcast'),
    ('C1 WebSearch/WebFetch', r'WebSearch/WebFetch|web fetch and search'),
    ('C6 On violation line', r'^(On violation|İhlalde davranış):'),
]


def near(path, line, snip):
    try:
        L = open(path, encoding='utf-8').read().split('\n')
    except OSError as e:
        return f'NOFILE {e}'
    for i in range(max(0, line - 3), min(len(L), line + 2)):
        if snip in L[i]:
            return f'OK@{i+1}'
    # fall back: where is it now?
    hits = [str(i + 1) for i, t in enumerate(L) if snip in t][:4]
    return 'MISS (now at ' + ','.join(hits) + ')' if hits else 'MISS (absent)'


for tag, path, line, snip in POINT:
    print(f'{tag:7} {near(path, line, snip):22} {path.replace(R, "")}:{line}  [{snip}]')

print('--- template counts (files with >=1 hit, of all persona files)')
allf = subprocess.run(['bash', '-c', f'find "{P}" -name "*.md" | wc -l'], capture_output=True, text=True).stdout.strip()
for name, pat in TEMPLATE:
    out = subprocess.run(['grep', '-rlE', pat, P], capture_output=True, text=True).stdout.split('\n')
    n = len([x for x in out if x])
    print(f'{n:4}/{allf}  {name}')
