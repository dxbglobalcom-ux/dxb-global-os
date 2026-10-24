#!/usr/bin/env bash
# After the 20:32 usage-limit stop: r2a and r4 resume their own sessions, then r7 … r10 as the owner's DISPATCH says.
set -uo pipefail
J=/home/dxb/test-kutu/20261024-zeytin; S=$J/tools/step.sh; B=$J/tools/box.sh; L=$J/TIMES.log
T="Bash,Read,Write,Edit,Glob,Grep,WebSearch,WebFetch"
grp() { echo "$(date '+%F %T') group $*" >>"$L"; }
grp resume-r2a-r4
"$B" seat-r2a claude-opus-5-5 xhigh "$T" "$J/job" "$J/logs/resume-r2a.prompt.md" "$J/logs/step-r2a.resume.json" --resume 2df68aee-58b5-44ea-981f-b0b66bddd167 & a=$!
"$B" seat-r4 claude-opus-5-5 xhigh "$T" "$J/job" "$J/logs/resume-r4.prompt.md" "$J/logs/step-r4.resume.json" --resume 76e3a56c-e5a3-45ad-b89c-0cdda677006c & d=$!
wait $a $d
grp r7;  "$S" r7 high owner "The machine stopped at 20:32 on a usage limit and resumed at 21:30; the clock moved. Deliver by 22:40. The client, just now: "tmm güzelce devam edin 32 sayfalık hatayı yapmasınlar boş boş hikaye ve brokrasiden kaçınsınlar gerekli olanlar hariç." — one page only; no empty story, no bureaucracy beyond what is needed."
grp r8-r9
mkdir -p "$J/job/work/r8-audit"
SOL_EFFORT=high "$J/tools/sol-try.sh" "$J/job" "$J/job/work/r8-audit/report.md" 8791 >"$J/logs/sol-final.out" 2>&1 & s=$!
"$S" r9 xhigh & r=$!
wait $s $r
grp r10; "$S" r10 high owner "The auditor's report is work/r8-audit/report.md; the jury's verdict is work/r9-jury/jury.md. Redeliver by 23:30. The client, just now: "tmm güzelce devam edin 32 sayfalık hatayı yapmasınlar boş boş hikaye ve brokrasiden kaçınsınlar gerekli olanlar hariç." — one page only; no empty story, no bureaucracy beyond what is needed."
grp done
