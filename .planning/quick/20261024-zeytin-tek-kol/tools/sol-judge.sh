#!/usr/bin/env bash
# Sol 6.1 as the visual judge of three pages, blind (A, B, C), against the benchmark captures. Read-only profile,
# a headless browser limited to the local origin and Google Fonts.
# usage: sol-judge.sh <judge dir: brief.md benchmarks.md benchmarks/ A.html B.html C.html> <out.md> <port>
set -uo pipefail
dir="$1"; out="$2"; port="$3"
cd "$dir" || exit 2
setsid nohup python3 -m http.server "$port" --bind 127.0.0.1 --directory "$dir" >"$out.http.log" 2>&1 &
srv=$!
trap 'kill $srv 2>/dev/null || true' EXIT
sleep 1
prompt="Sen üç web sayfasının görsel hakemisin. $dir klasöründe: brief.md (iş), benchmarks.md ve benchmarks/ (16 ödüllü sitenin ekran görüntüleri), ve üç sayfa: A.html, B.html, C.html — aynı brife üç ayrı yoldan yapılmışlar; hangisinin nasıl yapıldığını bilmiyorsun. Bu klasörün dışında hiçbir şey okuma.

Sayfalar http://127.0.0.1:$port/A.html, /B.html, /C.html adresinde. Her birini tarayıcıda 1440 ve 390 genişlikte baştan sona kaydırarak aç, ekran görüntüsü al ve bak; ödüllü sitelerin görüntüleriyle karşılaştır.

Yalnız GÖRSEL olarak değerlendir: tasarım, tipografi, renk, kompozisyon, çizimler, hareket ve kaydırma hissi, ilk ekranın etkisi, yaratıcılık. Teknik konulara (erişilebilirlik, performans, form doğrulama, kod) girme.

Cevabın KISA ve TÜRKÇE olsun:
1. Her sayfa için Tasarım ve Yaratıcılık puanı (Awwwards ölçeği, 1-10, bir ondalık), ödüllülerle kıyasla.
2. Her sayfa için en güçlü 3 yan ve en zayıf 3 yan, birer satır.
3. Görsel sıralama (1., 2., 3.) ve tek cümlelik gerekçe.
Hiçbir şey yazma ya da değiştirme."
start=$(date +%s)
deny='permissions.sol_try.filesystem={":root"="read","/home/dxb/DxB Global OS"="deny","/home/dxb/.claude"="deny","/home/dxb/.claude-mem"="deny","/home/dxb/Desktop"="deny","/tmp/claude-1000"="deny","/home/dxb/test-kutu/20261024-zeytin/job"="deny","/home/dxb/test-kutu/20261024-zeytin/arm1"="deny","/home/dxb/test-kutu/20261024-zeytin/arm3"="deny","'"$dir"'"="read"}'
timeout 2400 codex -p refuter -c "model_reasoning_effort=\"${SOL_EFFORT:-high}\"" \
  -c 'mcp_servers.dxbdb.enabled=false' -c 'mcp_servers.playwright.enabled=true' \
  -c 'mcp_servers.playwright.default_tools_approval_mode="approve"' \
  -c "mcp_servers.playwright.args=[\"--headless\",\"--isolated\",\"--browser\",\"chromium\",\"--allowed-origins\",\"http://127.0.0.1:$port;https://fonts.googleapis.com;https://fonts.gstatic.com\"]" \
  -c "$deny" -c 'default_permissions="sol_try"' \
  exec --skip-git-repo-check --ephemeral -C "$dir" -o "$out" -- "$prompt" </dev/null >"$out.log" 2>&1
rc=$?
echo "$(date '+%F %T') sol-judge end rc=$rc seconds=$(( $(date +%s) - start )) tokens=$(grep -A1 'tokens used' "$out.log" | tail -1)" \
  >>/home/dxb/test-kutu/20261024-zeytin/TIMES.log
echo "EXIT=$rc"
