# personas/ — kadro ağacı

Kaynak gerçek **DB'dir** (`personas` tablosu — EMPLOYEE_PERSONA_STANDARD §22).
Bu dizin iki şey içerir:

```
personas/
├── db-mirror/           ← CANLI KADRO (salt-okunur DB aynası)
│   └── <departman>/<slug>.v<sürüm>.<gate>.md
│       örn. ceo/agents-orchestrator.v1.passed.md  (Atlas — ilk v2 persona)
└── legacy/              ← eski dönem dosyaları (yeniden-yazım bekliyor)
    └── product/         (5 adet v2.0-fable, Faz 5 dönemi — E5.5 product dalgasında DB'ye taşınır)
```

**Kurallar**
- `db-mirror/` ELLE DÜZENLENMEZ — `scripts/export-personas-mirror.sh` her persona
  commit'inde yeniden üretir; değişiklik `fn_persona_submit` ile YENİ SÜRÜM olarak yapılır.
- Dosya adındaki `<gate>` = kalite kapısı durumu (`passed/pending/failed/superseded`);
  yalnız `passed` persona bir çalışanı aktive edebilir (DB trigger zorlar).
- Hedef organizasyon (18 departman + 5 pod, 167 aktif persona):
  [[../HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX]] §1.
- 153 legacy ham maddesi `agency-agents/` dizinindedir (read-only); her biri kendi
  E5.5 dalgasında Fable v2 olarak DB'ye yazılır ve burada `db-mirror/` altında belirir.
