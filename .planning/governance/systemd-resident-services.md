---
name: systemd-resident-services
description: "DXB'nin iki kalıcı süreci systemd user service — çıplak `node main.js` ile başlatılamaz (env unit'te), pid kill = otomatik restart"
metadata: 
  node_type: memory
  type: reference
  originSessionId: b9b613a7-8047-464f-ae46-1ff5bb39cbed
  modified: 2026-07-25T15:17:33.735Z
---

Şirketin iki 7/24 süreci **systemd user service**'tir (`systemctl --user`):

| Unit | Ne koşar |
|---|---|
| `dxb-scheduler.service` | `pnpm scheduler` → `packages/outbox-executor/dist/main.js` (pg-boss kuyrukları + voice/chat drain) |
| `dxb-jarvis.service` | JARVIS her-daim-açık wake daemon |

**Doğru yeniden başlatma:** `systemctl --user restart dxb-scheduler` — yeni `dist`
derlendikten sonra ZORUNLU (koşan süreç eski dist'i bellekte tutar).

**İki tuzak (2026-07-25'te ikisine de düşüldü):**

1. **Çıplak `node packages/outbox-executor/dist/main.js` BOOT EDEMEZ** —
   `DXB_DATABASE_URL is not set` ile ölür. Env unit dosyasındadır, `.env`'i
   elle `set -a; . ./.env` ile yüklemek de yetmedi. Servis yolunu kullan.
2. **pid ile `kill` = otomatik restart** (`Restart=always`), yani süreç
   "ölmedi" görünür ve iki farklı kuşak karışır. `pkill -f "outbox-executor"`
   ise ÇAĞIRAN SHELL'İN KENDİSİNİ eşler ve komutu 144 ile öldürür —
   `pgrep -fc` de aynı nedenle şişik sayar (ghost next-server dersinin aynısı).

**Tek-süreç kuralının doğru ölçümü:** `pgrep -fc` DEĞİL, systemd cgroup ağacı —
`systemctl --user status dxb-scheduler` çıktısındaki CGroup bloğunda
`node packages/outbox-executor/dist/main.js` satırı tam olarak BİR tane
olmalıdır (yanındaki `pnpm scheduler` ve `sh -c` sarmalayıcıları normaldir).

İlgili: [[e125-freeze-recovery]], [[opus-5-construction-governance]]
