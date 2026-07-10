---
type: quick
slug: ui-spec-amendment-a1
created: 2026-07-10
status: executing
author: Fable 5 (inline, governance v5)
---

# Quick Task: UI-SPEC Amendment A1 — kayıp session kararlarının kurtarılması

## Bağlam

CEO handoff notu (2026-07-10 ~02:27): önceki session'ın son turlarında verilen 4 karar diske hiç yazılmadan session kapandı. Doğrulama (grep + obs #2833): diskte tersi/hiçbiri var — UI-SPEC:16 "Three.js/WebGL YASAK", diğer 3 karar hiçbir dosyada yok. CEO talimatı: ŞİMDİ UI-SPEC amendment + kalıcı memory olarak commit et, hash göster.

## Kararlar (CEO, 2026-07-10)

1. WebGL/Three.js yasağı KALKTI
2. 34" ultrawide + çoklu ekran + toplantı/TV modu gereksinimi
3. Hedef donanım profili: RTX 4090 Linux laptop
4. Göz testi ölçütü: "referans görselden güzel olmalı"

## Tasks

1. `08-UI-SPEC.md`: §1 WebGL maddesi güncelle; §5'e ultrawide + TV-modu maddeleri; §9.5 göz testi netleştir; yeni §10 Amendment Log (A1, Fable verdict)
2. `08-CONTEXT.md`: satır 26 WebGL kararı revize (A1 referanslı)
3. Kalıcı memory: `phase8-design-brief.md` A1 bölümü + MEMORY.md index güncelle
4. Atomic commit, hash raporla

## Verification

- `grep -n "YASAK" 08-UI-SPEC.md` → WebGL satırında yasak kalmadı
- `grep -c "A1" 08-UI-SPEC.md 08-CONTEXT.md` → her ikisinde amendment izi
- `git log -1 --format=%H` → hash CEO'ya raporlanır
