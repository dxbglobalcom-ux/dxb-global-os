# NOTE — source 02 is HALF WATCHED. This is where to resume.

Row 02 in `00-LEDGER.md` is still `fetched`, and that is correct: **it has not been reported and
must not be marked so.** This file exists only so the watching done on 2026-08-02 is not repeated.
It is notes, not a report. When the report is written, this file is deleted with the same commit.

**Source:** `https://www.instagram.com/reel/DbTuJhOo69k/` — Okyanusi · Akın Yılmaz
(`akinyilmaz.ai`). 143.2 s, 1080×1920, AAC. `media/02-DbTuJhOo69k.mp4`.
**The CEO's words about it:** *"(BURADAKI SKILLERI VS TUM SISTEMI ISTIORZ)"*.

## What was watched: seconds 0, 15-16, 104-105 of 143

Frames opened: `t001`, `t016`, `t105`, plus native zooms cut from the video at 15 s and 104 s.
**Everything else is unwatched.** Do not write section 2 of the report from this file.

## A trap the next session must know about

The scene-change measurement that worked on source 01 **does not work here.** Frame-to-frame
difference over all 143 frames gives a median of **53.1 RMS** — the whole reel is fast-cut,
hand-held and constantly moving, so there is no quiet floor to measure excursions against and no
frame can be shown to be redundant. **Every second of this one has to be opened by eye.** Measured
2026-08-02, not assumed.

Second trap, already recorded in the handover and confirmed here: **the Turkish transcript is
unreliable.** `Systran/faster-whisper-small` produced "Moriafa", "SunTrench", "akın Yemez",
"cevizleri kurmak", "bir dapay çektim". The audio is a lead; **the burned-in Turkish subtitles in
the frames are what can be trusted**, and they are legible.

## What the three watched moments established

**00:15-16 — two screens, both readable by native zoom.**

*Upper screen (Acer monitor) — the **OpenAI Codex desktop application**:*
- Heading `What should we build?` over four cards: `Explore and understand code` ·
  `Build a new feature, app, or tool` · `Review code and suggest changes` · `Fix issues and failures`
- A `Choose project` control, an input reading `Do anything`, and a **microphone icon** — voice in
- Model selector: **`5.6 Sol · Medium`**
- And in orange: **`⚠ Full access`** — **the approval gate is off.** He has given the agent
  unattended authority over his machine. This is the exact opposite of DXB's constitutional gate,
  and it is the reason his demo moves fast. It is a difference to understand, not to copy.

*Lower screen (MacBook) — the **Claude desktop application**:*
- Sidebar: `Home` / `Code`, then `+ New`, `Artifacts`, **`Routines`**, `Customize`
- Under it, named recurring jobs: `Streamyard reel auto…`, `Fırsat avcısı günlük`
- `Pinned`: `Dream Come True`
- `Recents`: `PC çok yavaş sorun` · `PC dosyaları organize…` · `Yanlışlıkla kapatılan…` ·
  `Okyanusi daily advisor` · `Youtube ctr optimiz…` · `Connecteverest site…` ·
  `PC uyku modu ve vir…`
- On the right, a Turkish working document is open — `Desktop/AUTODS_KONUSMA_METNI.odt` — carrying
  a scene-by-scene script (`SAHNE 6 — KİME GÖRE / CTA`, `KAMERAYA (ekran yok)`) and dropshipping
  copy about AutoDS. **He writes his video scripts inside the same assistant that runs his jobs.**

**A notification card seen in the same span:** **`GOD MODE Akşam Review — Ready`** with a green
tick, over a green wallpaper. That is one of the Routines above finishing on its own clock and
announcing itself. **It is the same shape as our own W2.6 morning briefing** — which is the one
line where DXB is not behind.

**01:44-45 — the artefact the CEO actually asked for.** A Google Sheets file whose tab reads
`…_skills_rehberi`, titled **`Tüm AI Agent Ekosistemleri — Karşılaştırma Özeti`**. Columns:
`Ekosistem · Geliştirici · Skill Sayısı (yaklaşık) · Olgunluk · (note)`. Read by native zoom:

| Ekosistem | Developer | Skills | Maturity | Note (partly legible) |
|---|---|---|---|---|
| Hermes Agent | Nous Research | **660+** (Skills Hub) | Aktif/Hızlı | `23k+ … Self-improving agent model destekler` |
| OpenClaw | OpenClaw Community | **5,400+** (ClawHub) | Olgun/Yavaş | `Eski adı Moltbot/ClawBot` |
| **Claude Skills** | **Anthropic** | **1000+** (resmî + community) | Aktif/Hızlı | `Anthropic resmî + travis…/awesome`, `VoltAgent/awesome-agent-skills` |
| Cursor | Anysphere | **30k+ rules** | Çok Aktif | `PatrickJS/awesome-cursorrules` |
| Codex CLI | OpenAI | **100+ skills** | Aktif | `OpenAI'ın resmî terminal kodlama a…` |
| Gemini CLI | Google | **200+ extensions** | Aktif | `Google'ın resmî Gemini CLI` |
| GitHub Copilot | GitHub/Microsoft | yerleşik özellikler | Çok Aktif | `VS Code/JetBrains terminal entegrasyon…` |
| Windsurf | Codeium | topluluk rules | Aktif | `Cascade ile bütünleşik AI IDE` |
| OpenCode | OpenCode | açık kaynak | Aktif | `Açık kaynak Claude Code alternatifi` |
| Frameworks | çoklu | 10+ büyük framework | Çok Aktif | `VoltAgent…` |

**The line that matters to DXB is the third one.** We are already on Claude; that pool of
**1000+ official and community skills is open to us and we use none of it today.** What he calls
"yüzlerce yetenek ekledim" is drawn from exactly this. **This is a lead, not a decision** — nothing
is installed before `.planning/research/STACK.md` is read and the CEO has approved it.

## Resume instruction

1. Open `frames/02/t001.jpg` … `t143.jpg` **in order, every one**, transcript beside them, the
   burned-in Turkish subtitles as the authority over the audio.
2. Zoom from the VIDEO (`ffmpeg -ss <t> … crop=…`) wherever a screen carries text — this reel is
   almost entirely screens, so expect many.
3. Write the six-section report at `02-akinyilmaz-skills-system.md`, set the row to `reported`,
   run `npx vitest run tests/c42/rival-intel-ledger.test.ts`, commit, **and delete this file.**
