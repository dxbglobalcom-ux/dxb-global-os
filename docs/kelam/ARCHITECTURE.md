# KELAM — Native Linux Voice-to-Text Application
## Full Architecture Specification (v1.0 — architecture only, no implementation yet)

> **Origin:** CEO order 2026-07-17 ("prepare the architecture in finest detail, only the architecture").
> Fills the recorded stub `.planning/research/study-cards/whisperflow-clone.md` (INTEGRATION-TRACKER row 45: "Build clone: voicebox + whisper, NOT the paid product" — locked decision) and REVENUE-OPPORTUNITIES #12 (SME packaged install).
> **Source contract:** CEO's full WisprFlow-clone prompt (22 sections), delivered in chat 2026-07-17 — every numbered requirement below cites it as `P§n`.
> **Status:** DESIGN. No code, no repo, no packages exist yet. Every "will/should" here is a hypothesis until built (Evidence-Before-Done).

---

## 0. Product identity (P§1)

| Field | Decision |
|---|---|
| Working name | **Kelam** (Arabic/Turkish: "speech, the word") — final name = CEO decision |
| Alternates | Beyan, Sada, Lisan, VoiceQuill |
| One-liner | System-wide hold-to-talk dictation for Linux: speak anywhere, clean text lands in the active app |
| What it is NOT | Not a WisprFlow rebrand, no proprietary assets copied; original name/icon/UI. Not a TTS studio (that is voicebox's job). Not an Electron web-wrap (P§4 ban) |
| License | MIT or Apache-2.0 (final = CEO; MIT recommended for SME distribution — revenue op #12) |
| Repo | New standalone repo `kelam/` (own lifecycle, own CI). NOT inside DxB Global OS monorepo — the holding *uses and sells* it; it is a product, not an OS module |

**Relation to existing holding assets (measured 2026-07-17):**
- **Speaches** (`ghcr.io/speaches-ai/speaches:0.8.3-cpu`, container `dxb_speaches_local` running on laptop; declared in `vps/compose.yaml:195`) exposes OpenAI-compatible `/v1/audio/transcriptions` (faster-whisper) → **Kelam's default STT backend. Zero cost, already deployed.**
- **LiteLLM proxy** (holding infra) → optional refinement backend via virtual key.
- **voicebox** (jamiepine/voicebox, cloned at `~/voicebox/voicebox-main`) → complementary: voicebox owns TTS/cloning/agent-voice; Kelam owns native dictation. Shared user, no code dependency. If voicebox's Linux dictation matures upstream, revisit (recorded open decision OD-6).

---

## 1. Technology decision (P§4, decision record required by prompt → this section IS `docs/architecture/technology-decision.md` content)

### 1.1 Chosen stack

| Layer | Choice | Version policy |
|---|---|---|
| Language | **Rust** (stable, edition 2024) | MSRV pinned at repo creation |
| UI | **GTK4 + libadwaita** via `gtk4-rs`/`libadwaita-rs` | match Ubuntu 24.04 runtime (GTK 4.14+, adw 1.5+) |
| Async | **tokio** (multi-thread runtime) on a dedicated thread; GTK keeps the GLib main loop | |
| Audio | **PipeWire** first (`pipewire-rs`); **cpal** fallback path (covers Pulse/ALSA via compat) | |
| Resampling | `rubato` (sinc) → 16 kHz mono i16 WAV | |
| VAD/silence | RMS gate (own code) + optional `webrtc-vad` bindings | |
| HTTP | `reqwest` (rustls, HTTPS-only, per-request timeout) | |
| DB | **SQLite** via `rusqlite` + `refinery` migrations | |
| Secrets | **Secret Service** via `oo7` crate (keyring); encrypted-file fallback with explicit warning | |
| Global shortcuts | XDG Desktop Portal `GlobalShortcuts` (Wayland) + `x11rb` XGrabKey (X11) | |
| Clipboard | `wl-clipboard-rs` (Wayland) / `arboard` (X11) | |
| Overlay | `gtk4-layer-shell` where available (KDE/wlroots); fallback plain GtkWindow (GNOME — see §11) | |
| Logging | `tracing` + `tracing-appender` (rotating), redaction layer | |
| Packaging | `cargo-deb`, AppImage (linuxdeploy), Flatpak manifest | |

### 1.2 Alternatives rejected (P§4 evaluation axes)

| Option | Verdict | Decisive reasons |
|---|---|---|
| Electron/web-wrap | ❌ banned by prompt | RAM (300MB+ idle), startup, no native portal integration |
| Tauri | ❌ | WebView UI still; global-shortcut + overlay + tray on Wayland weaker than GTK-native; two-language debt (Rust+JS) |
| Qt/QML (Rust bindings) | ◐ viable | Bindings (cxx-qt) younger than gtk4-rs; libadwaita gives free GNOME-native look; KDE users still fine |
| Python + GTK | ❌ | Startup + packaging weight + single-binary goal lost; audio latency risk |
| GNOME Shell extension approach | ❌ as core | Locks to GNOME only; keep as OPTIONAL overlay add-on later |

**Why this passes the prompt's axes:** native system integration (portals, D-Bus, keyring — first-class in Rust/GTK), Wayland+X11 (dual adapters §10-§11), memory (~30-60MB target idle), startup (<300ms target), audio reliability (PipeWire native), packaging (single binary + 3 formats), accessibility (GTK a11y tree), maintainability (one language end-to-end), testability (headless core crates, UI thin).

---

## 2. Process & threading model (P§9)

```
┌────────────────────────────────────────────────────────────┐
│ kelam (single user-session process, no root, no daemon)    │
│                                                            │
│  GLib main loop (UI thread)                                │
│   ├─ GTK4 windows: Settings, History, Onboarding, Overlay  │
│   └─ glib channel receiver ⇦ core events                   │
│                                                            │
│  tokio runtime thread ("core")                             │
│   ├─ StateMachine actor (single owner of AppState)         │
│   ├─ audio capture task (PipeWire stream)                  │
│   ├─ stt task (HTTP or whisper-rs blocking pool)           │
│   ├─ refine task                                           │
│   ├─ delivery task                                         │
│   └─ storage task (rusqlite on blocking pool)              │
│                                                            │
│  D-Bus (zbus): portal GlobalShortcuts, Notifications,      │
│                Secret Service, RemoteDesktop (paste)       │
└────────────────────────────────────────────────────────────┘
```

- **One process.** No privileged helper, no setuid, no always-on daemon beyond the user-session app itself (P§6F, P§10 bans). Autostart = user-controlled XDG autostart entry.
- UI⇄core communication: typed `enum CoreEvent` / `enum UiCommand` over channels. **No business logic in UI callbacks** (P§9).
- The StateMachine actor is the ONLY writer of state; UI renders projections.

---

## 3. Crate/module map (P§9 module list → Rust workspace)

```
kelam/
├─ crates/
│  ├─ kelam-domain      # types: Session, Transcript, RefinedText, Language,
│  │                    # DeliveryResult, HistoryEntry, ProviderConfig, ErrorKind
│  ├─ kelam-core        # state machine actor, orchestration, retry policy
│  ├─ kelam-audio       # devices, capture, resample, VAD, wav writer, temp files
│  ├─ kelam-stt         # TranscriptionProvider trait + speaches/openai/whisper-rs impls
│  ├─ kelam-refine      # TextRefiner trait + rules engine + llm impl
│  ├─ kelam-deliver     # clipboard + paste strategies + strategy selector
│  ├─ kelam-platform    # session/DE detection, shortcuts, tray/StatusNotifier,
│  │                    # notifications, autostart, portals (zbus)
│  ├─ kelam-store       # sqlite (settings, history, vocabulary), migrations
│  ├─ kelam-secrets     # oo7 keyring wrapper + redaction helpers
│  └─ kelam-diag        # tracing setup, doctor checks, report export
├─ app/                 # GTK4/libadwaita binary: windows, overlay, onboarding
├─ assets/              # icon (original), desktop entry, metainfo
├─ packaging/           # cargo-deb meta, AppImage recipe, flatpak manifest
├─ docs/                # the 9 prompt-required docs (P§17)
└─ justfile             # setup/dev/test/lint/build/package/clean/doctor (P§13)
```

Prompt's 20 modules → mapping: app+ui→`app/`, domain→`kelam-domain`, audio→`kelam-audio`, transcription→`kelam-stt`, refinement→`kelam-refine`, delivery→`kelam-deliver`, platform+shortcuts+notifications→`kelam-platform`, overlay+onboarding→`app/`, history+vocabulary+settings+storage→`kelam-store`(+app views), secrets→`kelam-secrets`, diagnostics+telemetry(=none)+update(channel stub)→`kelam-diag`.

---

## 4. Domain model (P§9 explicit types)

```rust
struct RecordingSession { id: Uuid, started_at: DateTime, mode: ActivationMode,
    mic: DeviceId, state: SessionState, wav_path: Option<TempPath>,
    duration_ms: u64, peak_rms: f32 }

enum ActivationMode { HoldToTalk, Toggle }

struct Transcript { session_id: Uuid, text: String, language: Lang,
    provider: ProviderId, confidence: Option<f32>, elapsed_ms: u64 }

struct RefinedText { transcript_id: Uuid, text: String, mode: RefineMode,
    engine: RefineEngine /* Rules | Llm(ProviderId) | None */ }

enum RefineMode { Raw, LightCleanup, Professional, Concise, Casual,
    Email, Technical, PreserveSpoken }                        // P§6D list

enum Lang { Auto, Tr, En, De, Other(String) }                 // TR/EN/DE first-class (P§6E)

struct DeliveryResult { method: DeliveryMethod, ok: bool, detail: String }
enum DeliveryMethod { ClipboardOnly, ClipboardPlusPaste(PasteBackend) }
enum PasteBackend { X11XTest, PortalRemoteDesktop, KdeFakeInput, YdotoolOptIn }

struct HistoryEntry { id, ts, raw: String, refined: Option<String>, lang,
    refine_mode, delivery: DeliveryResult, session_meta }     // P§6H fields

enum ErrorKind { NoMic, MicPermission, MicLost, StreamFail, EmptyAudio,
    TooLong, KeyMissing, AuthFail, RateLimit, Timeout, Offline, BadResponse,
    RefineFail, ClipboardFail, PasteUnsupported, ShortcutUnavailable,
    ShortcutConflict, DbFail, ConfigCorrupt, ShutdownDuringWork }  // P§12 taxonomy
```

---

## 5. State machine (P§8 model, made transition-explicit)

| From | Trigger | Guard | Side effects | To |
|---|---|---|---|---|
| Idle | hotkey press (hold) / toggle-on | mic available | open stream, show overlay Listening, start max-duration timer | Preparing→Recording |
| Recording | key release / toggle-off | ≥ min-duration & not silence-only | close stream, write WAV | Stopping→Transcribing |
| Recording | cancel shortcut / overlay Cancel | — | discard buffers, delete temp | Cancelled→Idle |
| Recording | mic disconnect / stream error | — | preserve partial WAV if ≥2s else discard; notify | Failed(recoverable) |
| Recording | max duration hit | — | auto-stop, mark `TooLong` warning | Stopping→Transcribing |
| Transcribing | provider ok | text non-empty | — | Refining (or Delivering if mode=Raw) |
| Transcribing | provider err | retry budget left | backoff retry (1×) | Transcribing |
| Transcribing | provider err final | — | keep WAV, history entry `retryable`, notify | Failed |
| Refining | ok / engine=None | — | — | Delivering |
| Refining | err | — | **fall back to raw transcript** (never lose text, P§6F) | Delivering |
| Delivering | clipboard ok + paste ok | — | success toast, history write | Completed→Idle |
| Delivering | paste unsupported/fail | — | **text stays on clipboard**, notification "paste manually" (P§6F mandate) | Completed(clipboard-only)→Idle |
| any busy state | app quit | — | finish-or-persist: flush WAV + queue entry marked `interrupted` | — |

Invariant (P§6F/P§12): **a completed transcript is never destroyed** — clipboard write happens BEFORE paste attempt; history row written before delivery attempt.

---

## 6. Audio pipeline (P§8)

1. **Enumeration/default:** PipeWire registry listing; hot-plug events subscribed (mic disconnect → ErrorKind::MicLost live).
2. **Capture:** native format/rate stream → lock-free ring buffer (bounded, ~30s window) → level meter events at 30Hz to overlay.
3. **Convert:** downmix to mono → `rubato` resample → 16 kHz i16.
4. **Silence/empty detection:** rolling RMS; "empty recording" if < threshold for entire session or duration < 400ms.
5. **Temp files:** `$XDG_RUNTIME_DIR/kelam/` (tmpfs), mode `0600`, named by session UUID; deleted on Completed/Cancelled; orphan sweep at startup (P§10 abandoned-file cleanup).
6. **Limits:** max recording duration configurable (default 5 min) with auto-stop; retention: raw audio deleted after successful transcription unless user enables audio history (default OFF, P§8).
7. **Cancellation & shutdown:** stream teardown is idempotent; SIGTERM during Recording → state machine `ShutdownDuringWork` path (flush + mark interrupted).

---

## 7. Transcription provider layer (P§6C)

```rust
#[async_trait]
trait TranscriptionProvider {
    fn id(&self) -> ProviderId;
    async fn health(&self) -> Result<(), ErrorKind>;
    async fn transcribe(&self, wav: &Path, opts: SttOpts) -> Result<Transcript, ErrorKind>;
}
struct SttOpts { lang: Lang, vocabulary_hint: Option<String>, timeout: Duration }
```

Implementation order (all behind the trait; secrets only from keyring — P§6C):

| Priority | Provider | Notes |
|---|---|---|
| 1 (default) | **`openai-compatible` → Speaches** | `POST /v1/audio/transcriptions` (faster-whisper). Endpoints: `http://localhost:8000` (laptop container, RUNNING today) or VPS URL. **Free path — matches CEO free-first ruling 2026-07-17.** Vocabulary → whisper `initial_prompt` |
| 2 | **`whisper-local` via whisper-rs** | Fully offline (airplane mode); ggml `small`-int8 default, model download manager with checksum; CPU threads configurable |
| 3 (later) | OpenAI cloud / Deepgram / others | Same trait; disclosure before cloud use (P§10) |

Language: `Auto` uses whisper detection; manual TR/EN/DE pins `language=` param; mixed technical terms preserved via vocabulary hint (P§6E).

---

## 8. Refinement layer (P§6D)

```rust
trait TextRefiner { fn refine(&self, t: &Transcript, mode: RefineMode,
                              vocab: &Vocabulary) -> Result<RefinedText, ErrorKind>; }
```

- **Engine A — deterministic rules (always available, offline, default):** filler-word lexicons per language (TR: "ııı, yani, hani, şey…"; EN: "um, uh, like, you know…"; DE: "äh, ähm, halt, quasi…"), immediate-repetition collapse, sentence-boundary punctuation heuristics, paragraph split on long pauses (pause metadata from VAD), capitalization, vocabulary-table replacements (P§6I "common corrections").
- **Engine B — LLM (optional):** via LiteLLM proxy virtual key or local ollama; fixed system prompt encoding the P§6D contract verbatim: remove fillers/repetitions, fix punctuation, add paragraphs, preserve names/terms/meaning/language, **never invent information**. Response schema-checked; on any failure → Engine A output (silent-quality-degrade is logged, never hidden).
- Modes map to rule-strength + LLM prompt variants; `Raw` bypasses both.

---

## 9. Global activation (P§6B, P§7)

| Environment | Mechanism | Hold-to-talk | Notes |
|---|---|---|---|
| GNOME Wayland (45+) | XDG portal `GlobalShortcuts` (zbus) | ✓ (Activated/Deactivated signals) | User approves binding dialog once; rebind via portal UI |
| KDE Wayland (Plasma 5.27+/6) | same portal | ✓ | Native support good |
| X11 (GNOME/KDE/other) | `x11rb` XGrabKey | ✓ (KeyPress/KeyRelease) | Conflict detection: grab failure reported (P§6B) |
| Fallback (portal absent) | ❌ no silent evdev | — | Documented limitation + in-app "press record" button; optional opt-in ydotool/evdev instructions in docs, never auto (P§6F "no silent root") |

Toggle mode: portal Activated toggles state. Cancel shortcut: second registered accel. Shortcut conflict: portal handles ownership; X11 grab errors surfaced with the conflicting keysym.

---

## 10. Text delivery (P§6F — the hard Linux problem, strategy ladder)

**Rule 0 (invariant): clipboard is written FIRST, always.** Auto-paste is an enhancement, never the only path.

| Step | Strategy | Where it works | Detection |
|---|---|---|---|
| 1 | Clipboard set (`wl-clipboard-rs` / `arboard`) | everywhere | — |
| 2a | X11 XTest synthetic Ctrl+V (`x11rb`) | all X11 sessions | `XDG_SESSION_TYPE=x11` |
| 2b | Portal `RemoteDesktop.NotifyKeyboardKeycode` Ctrl+V | GNOME/KDE Wayland where portal grants | runtime portal probe; user consents once |
| 2c | KDE `fake-input` Wayland protocol | KDE Wayland | wl registry probe |
| 2d | `ydotool` (uinput) | any, **opt-in only** (user installs + udev perm) | binary+socket probe; settings toggle default OFF |
| 3 | No paste path → notification "copied — press Ctrl+V" | rest (e.g. locked-down GNOME) | fallthrough |

- Terminal-target caveat documented (Ctrl+Shift+V) — per-app override table in settings (later milestone; recorded, not v1).
- Middle-click primary-selection optional extra on X11.
- AT-SPI direct insertion: research flag OD-4 (off by default; accessibility bus often disabled).
- Delivery result (method, ok) recorded in history (P§6H "delivery status").

---

## 11. Overlay (P§6G) — honest platform matrix

| Environment | Mechanism | Status expectation |
|---|---|---|
| KDE Wayland / wlroots (Sway…) | `gtk4-layer-shell` (top layer, no keyboard focus, anchored bottom-center of monitor with pointer) | Full overlay |
| GNOME Wayland | **no layer-shell for apps** → borderless GtkWindow; GNOME may not keep it above | Degraded: rely on libnotify progress notifications + tray icon state; optional GNOME Shell extension = later add-on (OD-5) |
| X11 (all) | override-redirect always-on-top window | Full overlay |

States rendered: Idle(hidden) / Listening(+live level bars) / Processing(spinner) / Success(checkmark, auto-hide 1.5s) / Error(message + Retry/Copy buttons) / Cancel button visible while Listening (P§6G list). Respects dark/light (libadwaita), scaling (GDK logical px), multi-monitor (monitor-at-pointer), reduced-motion (disable pulse animation).

---

## 12. Storage (P§9 schema)

```sql
-- refinery migrations V1__init.sql
CREATE TABLE settings   (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER);
CREATE TABLE history    (id TEXT PRIMARY KEY, ts INTEGER, raw TEXT, refined TEXT,
                         lang TEXT, refine_mode TEXT, delivery_method TEXT,
                         delivery_ok INTEGER, provider TEXT, duration_ms INTEGER);
CREATE TABLE vocabulary (id INTEGER PRIMARY KEY, phrase TEXT NOT NULL, replaces TEXT,
                         kind TEXT CHECK(kind IN ('name','company','product','term','correction')),
                         capitalization TEXT);
CREATE TABLE providers  (id TEXT PRIMARY KEY, kind TEXT, base_url TEXT, model TEXT,
                         enabled INTEGER);         -- NO key column: secrets live in keyring
CREATE INDEX history_ts ON history(ts DESC);
-- FTS5 virtual table for history search (P§6H search)
```

Paths: `$XDG_DATA_HOME/kelam/kelam.db`, `$XDG_CONFIG_HOME/kelam/` (exported settings), `$XDG_STATE_HOME/kelam/logs/`. History OFF switch = stop writing + "Clear all" with confirm (P§6H); "Delete all local data" wipes DB+logs+temp (P§10).

---

## 13. Secrets & privacy (P§10)

- API keys → Secret Service collection `kelam` via `oo7`; if keyring absent → age-encrypted file with passphrase prompt + persistent warning banner (never plaintext settings — P§19 DoD).
- Log redaction layer: request headers, keys, and transcript bodies filtered by `tracing` field policy; transcripts never logged by default (P§16).
- HTTPS-only enforced for non-localhost providers; localhost HTTP allowed (Speaches).
- Telemetry: **none**. Update check: manual/channel stub only (P§16 "update channel architecture" = version-check endpoint config, default off).
- Threat model doc (P§10 list) written at repo creation; headline mitigations: keyring isolation, clipboard-exposure warning in onboarding, temp `0600` + tmpfs, provider cert validation, no privileged helper (attack surface: none installed).

---

## 14. Onboarding (P§6K, 12 steps → 7 screens)

1. Welcome (what it does, privacy summary) → 2. Microphone (detect, pick, live level test = steps 2-3) → 3. STT provider (default "Local server (Speaches)" preconfigured URL, or Local Whisper model download, or cloud+key→keyring; **connection test button** = steps 4-6) → 4. Shortcut (portal registration flow, hold/toggle choice, test press = steps 7-8) → 5. Test dictation (record→transcribe→show = step 9) → 6. Delivery explainer (environment detected, which paste path active, limitation text = steps 10-11) → 7. Live insertion test into a text field + Finish (enabled ONLY when steps 2-6 verified = step 12 "completes only when usable").

---

## 15. Failure handling map (P§12 → user-visible contract)

Every `ErrorKind` row gets: user message (plain language, actionable), auto-recovery (retry/backoff where safe), manual action (Retry button in history/overlay), and text-preservation guarantee. Examples: `AuthFail` → "Key rejected — open Settings→Provider" + transcript WAV kept 24h for retry; `Offline` → queue entry `retryable`, auto-retry on network-up signal (NetworkManager D-Bus); `ConfigCorrupt` → rename bad file `.bak`, boot with defaults, notify. Full 20-row table lives in `docs/architecture/system-architecture.md` at build time.

---

## 16. Testing strategy (P§14)

- **Unit:** state transitions (every table row in §5), rules engine per language (fixture pairs raw→expected), config validation, redaction, error mapping, vocabulary application.
- **Integration:** audio pipeline against fixture WAVs (TR/EN/DE, silence, 1-hour long, clipped); STT/refine via `wiremock` OpenAI-compatible mock + real Speaches container in CI service; clipboard roundtrip (headless weston + X11 Xvfb runners); DB migrations up/down; settings persistence.
- **UI (best-effort):** GTK inspector-driven smoke via `gtk4::test` harness for onboarding/settings navigation.
- **Manual matrix** (`docs/testing/manual-test-plan.md`): GNOME-Wayland, GNOME-X11, KDE-Wayland, 2 mics, no-mic, offline, slow provider (toxiproxy), invalid key, 2 monitors, 125%/150% scaling, TR/EN/DE dictations, 10-min dictation, rapid repeat ×10.
- CI: fmt + clippy(-D warnings) + unit/integration + `cargo deny` + release build.

---

## 17. Packaging (P§15)

| Artifact | Tool | Notes |
|---|---|---|
| `.deb` | `cargo-deb` | Depends: libgtk-4, libadwaita, pipewire; postrm cleans autostart |
| AppImage | linuxdeploy + GTK plugin | bundles GTK; largest but distro-agnostic |
| Flatpak | manifest `org.dxb.Kelam.yml` | portals-first design makes sandbox natural; finish-args: `--socket=wayland --socket=fallback-x11 --socket=pulseaudio --talk-name=org.freedesktop.secrets` |
| Desktop entry + icon + metainfo | assets/ | original icon (no WisprFlow branding — P§1) |

Install docs + clean uninstall (incl. "purge my data" command) in `docs/installation/linux-installation.md`.

---

## 18. Developer experience (P§13)

`justfile`: `setup` (apt/dnf dep script + rustup), `dev` (debug run, verbose logs), `test`, `lint` (fmt+clippy), `build` (release), `package` (deb+appimage), `clean`, `doctor` (kelam-diag CLI: session type, DE, portal versions, PipeWire status, mic list, Speaches reachability, keyring presence — mirrors P§16 diagnostics page).

---

## 19. Build phases → milestones (P§18, execution slot = CEO decision)

| Milestone | Prompt phases | Exit evidence (Evidence-Before-Done) |
|---|---|---|
| M0 Repo+docs skeleton | 1-4 | research doc + this architecture committed; CI green on empty workspace |
| M1 Core loop headless | 5-8 | CLI: record→Speaches→rules-cleanup→clipboard, TR/EN/DE fixtures pass |
| M2 Desktop integration | 9-11 | portal shortcut + overlay + paste ladder verified on GNOME-Wayland & X11 |
| M3 Product surface | 12-14 | onboarding completable; history/vocab/settings persist across restart |
| M4 Hardening | 15-16 | full test suite green; failure-matrix manual pass |
| M5 Packages | 17-18 | .deb installed on clean Ubuntu 24.04 VM; DoD checklist (P§19) 100% |
| M6 Docs freeze | 19 | README + support matrix reflect MEASURED results only |

Estimated effort: M1-M2 are the risk mass (Wayland). No calendar promise here — scheduling is a roadmap decision (see OD-1).

---

## 20. Open decisions for the CEO

| ID | Question | Recommendation |
|---|---|---|
| OD-1 | Build slot: now vs after open E12/E13 rows + Revenue spec wave | After current wave; M0-M1 can ride the new PC's arrival |
| OD-2 | Final product name | **Kelam** |
| OD-3 | License for SME distribution (revenue op #12) | MIT |
| OD-4 | AT-SPI insertion research in v1? | No — v1 ships the §10 ladder |
| OD-5 | GNOME Shell extension for true overlay on GNOME Wayland | Later add-on if GNOME UX proves annoying |
| OD-6 | Contribute Linux fixes upstream to voicebox instead of/alongside Kelam dictation? | Revisit after M2 — measure voicebox's Linux dictation maturity then |

---

*Architecture only — per CEO order no repo, code, or package was created. Next artifact on "build" approval: repo bootstrap (M0) with the 9 prompt-required docs seeded from this file.*
