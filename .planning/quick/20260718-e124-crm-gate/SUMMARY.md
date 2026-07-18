---
status: complete
completed_at: 2026-07-18T03:00:00.000Z
---

# SUMMARY — E12.4 Holding/CRM Integration Gate (GAP-05)

Roadmap row E12.4 ✓ (evidence in the row cell).

- **Data wall:** migration 20260718020000 — `company_id` on crm_clients ONLY (children isolate through client_id inner join); `fn_default_company_id()` STABLE default (bootstrap-parity: companies row is runtime-born). tests/e124 5/5 incl. NOT NULL wall + both-direction join isolation.
- **Shell home:** `/revenue/crm/{clients,contacts,deals,requests}` + chrome with COMPANY SWITCH (`dxb-company` cookie; single-company state = honest name, no info-free selector). Entity components reskinned to command tokens. CC-SPEC adaptation A3 records placement + idiom.
- **Tek-anahtar:** old cockpit CRM deleted SAME COMMIT; `/crm/*` → **308** → `/revenue/crm/*` (curl-proven).
- **Live isolation proof:** browser switch inverts the data universe (fixture company; screenshots crm-e124-*; fixtures swept to zero).
- **In-pass purity fix:** en-GB-pinned dates rendered "18 Jul" on TR → locale-threaded formatter ("18 Tem" measured).
- **Battery:** 61 files 448/0 · purity 1846=1846 · tsc 0 + build 0 · RULE #0 EN+TR × 1280/1920 clipped 0.
- **Boundary:** per-company org/project filter layers arrive with the second REAL company (Phase-11 Outleteuro) — one-company filter UI would be info-free (minimalism ruling).
