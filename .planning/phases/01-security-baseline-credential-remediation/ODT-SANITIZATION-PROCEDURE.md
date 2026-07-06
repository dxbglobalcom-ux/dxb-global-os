# ODT Sanitization Procedure (CEO-executed)

The source `.odt` document contains the leaked credentials section. This procedure produces a credentials-free Markdown copy for the repo while the original stays out of git and out of cloud sync entirely. An ODT file is a zip container — visible text lives in `content.xml`, but headers/footers/metadata/tracked changes/version history can all hold stray text too, so this procedure checks the whole container, not just the visible page.

Two distinct scratch paths are used on purpose, and they are never interchanged:

- `/tmp/odt-original-work.odt` — the **UNSANITIZED, credential-bearing** working copy. Never edited in place; never reported as "sanitized."
- `/tmp/odt-sanitized-check.odt` — the **sanitized** copy, produced by a fresh Save As so LibreOffice rewrites the entire zip container. Only this path may ever be reported to the builder as the sanitized working copy.

Both paths are deleted after plan 01-05's verification and your approval — neither is a permanent artifact.

## Step 1 — Copy the original (never edit in place)

```bash
cp "DXB GLOBAL TECH...odt" /tmp/odt-original-work.odt
```

`/tmp/odt-original-work.odt` now holds the unsanitized, credential-bearing copy. The real original file stays exactly where it is (already gitignored via `*.odt`) and is never touched directly.

TR: Orijinal dosyayı asla doğrudan düzenlemeyin — her zaman `/tmp/odt-original-work.odt` kopyası üzerinde çalışın; bu kopya hâlâ tüm eski kimlik bilgilerini içerir.

## Step 2 — Open the copy in LibreOffice and strip the credentials

Open `/tmp/odt-original-work.odt` in LibreOffice.

1. Delete the entire credentials section (the §12-adjacent content).
2. **Edit → Track Changes → Manage** — accept all changes and confirm recording is switched off. Deleted text can survive inside tracked changes even after you delete it from the visible page.
3. **File → Versions** — delete any stored versions. Old versions can carry the un-redacted content forward.
4. Check headers, footers, and comments for stray values — these are easy to miss because they don't scroll with the body text.

TR: Track Changes kaydını kapatıp TÜM değişiklikleri kabul etmeden önce belgeyi kaydetmeyin — aksi halde silinen kimlik bilgileri iz kayıtlarının içinde saklı kalabilir.
TR: Sürüm geçmişini (File → Versions) silmek geri alınamaz bir işlemdir, ama gereklidir — eski sürümler sansürsüz içeriği taşıyabilir.

## Step 3 — Save As a NEW file (rewrites the whole container)

**File → Save As** → save to the distinct new path `/tmp/odt-sanitized-check.odt`.

This is the step that matters most: LibreOffice rewrites the *entire* zip container on Save As, so no deleted-text remnants survive anywhere in the file. The sanitized copy must NEVER reuse the original-copy path (`/tmp/odt-original-work.odt`) — only `/tmp/odt-sanitized-check.odt` is ever the sanitized copy, and only that path is ever reported to the builder as such.

TR: Sanitize edilmiş kopyayı ASLA orijinal kopyanın yoluna (`/tmp/odt-original-work.odt`) kaydetmeyin — sadece `/tmp/odt-sanitized-check.odt` yoluna kaydedin; iki yolun karışması, temizlenmemiş bir kopyanın "temiz" olarak işaretlenmesine yol açabilir.

## Step 4 — Export to Markdown (never .odt)

Export the sanitized content to `docs/source-architecture-notes-sanitized.md` — explicitly as Markdown, **not** as another `.odt`. The repo's `*.odt` gitignore rule would silently keep an `.odt` copy out of git, and this sanitization requirement would fail invisibly (no error, just a missing file in git).

In practice, LibreOffice's Markdown export may require Save-As-txt or a copy-paste into a plain text/Markdown editor to get clean output at `docs/source-architecture-notes-sanitized.md`. Content fidelity matters here; formatting does not.

After exporting, confirm the file is actually tracked by git (not silently ignored):

```bash
git status docs/source-architecture-notes-sanitized.md
```

## Step 5 — Verification (the builder runs this in plan 01-05)

So you know what happens next: the builder will run

```bash
mkdir -p /tmp/odt-check && cd /tmp/odt-check && unzip -o /tmp/odt-sanitized-check.odt >/dev/null
grep -rIiEl 'password|passwd|api[_-]?key|token|secret|2fa|sk-[A-Za-z0-9]|sk-or-|nvapi-|apify_api' . || echo "CLEAN"
gitleaks dir /tmp/odt-check --redact -v
```

against `/tmp/odt-sanitized-check.odt` and the exported Markdown, and record "CLEAN" + timestamp as evidence. Both `/tmp` ODT copies (`/tmp/odt-original-work.odt` and `/tmp/odt-sanitized-check.odt`) are deleted by the builder after your approval in plan 01-05.

## Step 6 — Guided cloud-sync and backup sweep

Copies of the original document may exist anywhere it was ever saved, synced, or emailed. Go through this list and record found/not-found + action taken for each:

| Location | Found? | Action taken |
|----------|--------|---------------|
| Downloads folder | | |
| Cloud-sync folders (Google Drive / Dropbox / OneDrive) | | |
| `~/.local/share/Trash` | | |
| Email attachments — sent | | |
| Email attachments — received | | |
| External/USB backups | | |

For each hit: delete it, or move it to the single non-synced location where the original will live going forward.

TR: Bulut senkron klasörlerini, Çöp Kutusunu (`~/.local/share/Trash`) ve e-posta eklerini tek tek kontrol edin — her biri için "bulundu/bulunmadı" ve yapılan işlemi kaydedin; hiçbirini atlamayın.

**Note:** copies already pasted into third-party AI tools are unrecoverable — this is exactly why every listed credential is treated as compromised and rotated (Sections 1-10 of `CREDENTIAL-ROTATION-CHECKLIST.md`), regardless of whether this sweep finds every synced copy.

## Handoff

When Steps 1-4 and Step 6 are done, resume plan 01-05 — the builder then runs the Step 5 verification and commits the sanitized copy plus evidence.
