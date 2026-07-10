"use client";

// Login scene — "Golden Threshold" (quick/20260710-login-redesign, replaces
// the CEO-rejected single-card layout). Split composition: a layered brand
// atrium (original gold line-art skyline, horizon light, depth) beside a
// refined form column. Signature-moment motion per UI-SPEC §10 A1.
// Auth logic is unchanged: Supabase email+password; TOTP enroll/challenge
// stays behind NEXT_PUBLIC_DXB_MFA_ENFORCED (AM-08-AUTH-1 keeps local dev
// password-only; outward deploys never set the flag).
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DxbMark } from "@/components/shell/app-shell";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type Step = "credentials" | "enroll" | "verify" | "opening";

/* Original skyline line-art (drawn for this scene, not traced from the
   reference image). Thin bright strokes only — broad low-alpha gold washes
   over black read as mud-brown (CEO eye-test calibration rule). Two layers
   over an 1800-unit stage: the far haze stretches to any width, the near
   composition stays height-bound — dense at laptop and 3440 alike (A1.2). */
const FAR_HEIGHTS = [
  90, 140, 70, 180, 110, 150, 80, 200, 120, 160, 95, 175, 105, 140, 85, 190, 115, 150, 75, 165,
  100, 180, 90, 135, 110, 170, 95, 155, 120, 60, 140, 80,
];

const TOWERS: Array<{ x: number; top: number; o: number }> = [
  { x: 80, top: 470, o: 0.3 },
  { x: 150, top: 420, o: 0.38 },
  { x: 215, top: 455, o: 0.25 },
  { x: 290, top: 370, o: 0.45 },
  { x: 360, top: 430, o: 0.32 },
  { x: 430, top: 340, o: 0.5 },
  { x: 500, top: 395, o: 0.4 },
  { x: 570, top: 300, o: 0.55 },
  { x: 640, top: 360, o: 0.45 },
  { x: 720, top: 250, o: 0.6 },
  { x: 800, top: 330, o: 0.5 },
  { x: 1000, top: 290, o: 0.55 },
  { x: 1075, top: 350, o: 0.45 },
  { x: 1150, top: 260, o: 0.6 },
  { x: 1220, top: 330, o: 0.5 },
  { x: 1290, top: 390, o: 0.4 },
  { x: 1360, top: 310, o: 0.5 },
  { x: 1430, top: 430, o: 0.35 },
  { x: 1500, top: 370, o: 0.42 },
  { x: 1570, top: 460, o: 0.28 },
  { x: 1650, top: 410, o: 0.33 },
  { x: 1720, top: 480, o: 0.22 },
];

/* Far layer: stretches to any viewport width (preserveAspectRatio none +
   non-scaling strokes), so ultrawide never shows bare flanks (A1.2). */
function SkylineFar() {
  return (
    <svg
      viewBox="0 0 1800 300"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-[36%] w-full"
      style={{ maskImage: "linear-gradient(to top, black 40%, transparent 100%)" }}
    >
      <g stroke="var(--accent)" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {FAR_HEIGHTS.map((h, i) => (
          <path
            key={i}
            d={`M${20 + i * 55} 300V${300 - h * 1.4}`}
            vectorEffect="non-scaling-stroke"
            opacity={0.09 + (i % 3) * 0.03}
          />
        ))}
      </g>
    </svg>
  );
}

/* Main composition: height-bound `meet` keeps the silhouette (and beacon)
   intact at every aspect ratio; the far layer carries the flanks. */
function SkylineArt() {
  return (
    <svg
      viewBox="0 0 1800 640"
      preserveAspectRatio="xMidYMax meet"
      fill="none"
      aria-hidden
      className="login-skyline absolute inset-x-0 bottom-0 h-[62%] w-full"
      style={
        {
          "--skyline-dash": 760,
          maskImage: "linear-gradient(to top, black 55%, transparent 96%)",
        } as React.CSSProperties
      }
    >
      {/* Near layer — structured towers with floors */}
      {TOWERS.map(({ x, top, o }) => (
        <g key={x} stroke="var(--accent)">
          <path d={`M${x} 620V${top}`} strokeWidth="1.75" opacity={Math.min(o + 0.14, 0.78)} />
          <path d={`M${x + 12} 620V${top + 40}`} strokeWidth="1" opacity={o * 0.7} />
          <path d={`M${x - 10} 620V${top + 90}`} strokeWidth="1" opacity={o * 0.5} />
          <path d={`M${x - 10} ${top + 55}h22`} strokeWidth="1" opacity={o * 0.8} />
          <path d={`M${x - 10} ${top + 130}h22`} strokeWidth="1" opacity={o * 0.6} />
        </g>
      ))}
      {/* Dominant spire — carries the beacon */}
      <g stroke="var(--accent)">
        <path d="M900 620V110" strokeWidth="2" opacity="0.9" />
        <path d="M886 620V240" strokeWidth="1.25" opacity="0.6" />
        <path d="M914 620V240" strokeWidth="1.25" opacity="0.6" />
        <path d="M872 620V360" strokeWidth="1" opacity="0.4" />
        <path d="M928 620V360" strokeWidth="1" opacity="0.4" />
        <path d="M858 620V470" strokeWidth="1" opacity="0.3" />
        <path d="M942 620V470" strokeWidth="1" opacity="0.3" />
        {[270, 330, 390, 450, 510, 570].map((y) => (
          <path key={y} d={`M886 ${y}h28`} strokeWidth="1" opacity="0.35" />
        ))}
      </g>
      <circle cx="900" cy="100" r="3.5" fill="var(--accent)" className="login-beacon" />
    </svg>
  );
}

function BrandAtrium({ tagline, taglineSub, holding }: Record<string, string>) {
  // E2.4 3D hover: pointer-driven parallax — the stage tilts ≤1.6°, the
  // near skyline drifts more than the far haze, the key light trails the
  // pointer. Pure CSS transforms (no WebGL dependency yet; the token-set
  // easing drives it so no second theme leaks in — DESIGN_SYSTEM §23).
  // prefers-reduced-motion: listeners bail, scene stays still.
  const stageRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  function handleMove(e: React.PointerEvent<HTMLElement>) {
    const el = stageRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--plx-x", nx.toFixed(3));
      el.style.setProperty("--plx-y", ny.toFixed(3));
    });
  }
  function handleLeave() {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty("--plx-x", "0");
    el.style.setProperty("--plx-y", "0");
  }

  return (
    <section
      aria-hidden
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="relative hidden flex-1 overflow-hidden lg:block"
      style={{
        /* Scene ground: deeper than --bg on purpose (stage, not panel);
           champagne key light is high-L / low-alpha so it never muddies. */
        background:
          "linear-gradient(180deg, oklch(0.13 0.007 78), oklch(0.1 0.008 72)), oklch(0.1 0.008 72)",
      }}
    >
      <div
        ref={stageRef}
        className="absolute inset-0 transition-transform duration-[var(--t-slow)] ease-refined"
        style={{
          transform:
            "perspective(1400px) rotateY(calc(var(--plx-x, 0) * 1.6deg)) rotateX(calc(var(--plx-y, 0) * -1.2deg))",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 transition-transform duration-[var(--t-slow)] ease-refined"
          style={{
            background:
              "radial-gradient(42rem 24rem at 28% -4%, oklch(0.92 0.05 95 / 0.08), transparent 68%)",
            transform:
              "translate3d(calc(var(--plx-x, 0) * 24px), calc(var(--plx-y, 0) * 12px), 0)",
          }}
        />
        {/* Skyline stands on a raised horizon; a faint glow reflects below it.
            A narrow champagne aura rises behind the spire (tight + bright —
            never a broad wash). Depth split: far haze drifts 6px, near
            composition 14px on a raised Z plane. */}
        <div className="absolute inset-x-0 bottom-[7%] top-0">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]"
            style={{
              background:
                "radial-gradient(16rem 42rem at 50% 100%, oklch(0.88 0.08 95 / 0.07), transparent 72%)",
            }}
          />
          <div
            className="absolute inset-0 transition-transform duration-[var(--t-slow)] ease-refined"
            style={{
              transform:
                "translate3d(calc(var(--plx-x, 0) * 6px), calc(var(--plx-y, 0) * 3px), 0)",
            }}
          >
            <SkylineFar />
          </div>
          <div
            className="absolute inset-0 transition-transform duration-[var(--t-slow)] ease-refined"
            style={{
              transform:
                "translate3d(calc(var(--plx-x, 0) * 14px), calc(var(--plx-y, 0) * 7px), 32px)",
            }}
          >
            <SkylineArt />
          </div>
        </div>
        <div
          className="absolute inset-x-0 bottom-[7%] h-px overflow-hidden transition-transform duration-[var(--t-slow)] ease-refined"
          style={{
            transform: "translate3d(calc(var(--plx-x, 0) * 10px), 0, 0)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent) 60%, transparent) 50%, transparent)",
            }}
          />
          <div
            className="login-horizon-sweep absolute inset-y-0 w-1/3"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent) 90%, white 10%), transparent)",
            }}
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[7%]"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--accent) 10%, transparent), transparent 75%)",
          }}
        />

        <div
          className="login-rise absolute left-[9%] top-[18%] max-w-md transition-transform duration-[var(--t-slow)] ease-refined"
          style={{
            transform:
              "translate3d(calc(var(--plx-x, 0) * -4px), calc(var(--plx-y, 0) * -2px), 20px)",
          }}
        >
          <div className="flex items-center gap-4">
            <DxbMark className="size-12 text-accent" />
            {/* Hero wordmark: display type scaled up for the signature surface */}
            <p className="text-[2.6rem] font-semibold leading-none tracking-[0.01em] text-ink">
              DXB <span className="text-accent">Global</span>
            </p>
          </div>
          <div
            className="mb-5 mt-7 h-px w-24"
            style={{
              background:
                "linear-gradient(90deg, var(--accent), transparent)",
            }}
          />
          <p className="text-page-title text-ink">{tagline}</p>
          <p className="mt-2 text-body text-ink-2">{taglineSub}</p>
        </div>
      </div>

      <p className="absolute bottom-6 left-[9%] text-micro text-ink-2 opacity-70">
        © 2026 {holding}
      </p>
    </section>
  );
}

export default function LoginPage() {
  const dict = getDict();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<Step>("credentials");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  function openDoor() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyOpened = sessionStorage.getItem("dxb-door") === "open";
    sessionStorage.setItem("dxb-door", "open");
    if (reduced || alreadyOpened) {
      router.push("/overview");
      router.refresh();
      return;
    }
    setStep("opening");
    window.setTimeout(() => {
      router.push("/overview");
      router.refresh();
    }, 700);
  }

  async function afterPasswordAccepted() {
    // CEO order 2026-07-10: on the local laptop the door opens on password
    // alone — TOTP friction rejected. Outward deploys never set this flag,
    // so the aal2 wall in proxy.ts stays live there.
    if (process.env.NEXT_PUBLIC_DXB_MFA_ENFORCED === "false") {
      openDoor();
      return;
    }
    const { data: factorData, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      setError(dict.login.errorGeneric);
      return;
    }
    const verified = factorData.totp.find((f) => f.status === "verified");
    if (verified) {
      setFactorId(verified.id);
      setStep("verify");
      return;
    }
    // 2FA is mandatory for the CEO account: first login enrolls.
    const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });
    if (enrollError || !enrollData) {
      setError(dict.login.errorGeneric);
      return;
    }
    setFactorId(enrollData.id);
    setQrSvg(enrollData.totp.qr_code);
    setSecret(enrollData.totp.secret);
    setStep("enroll");
  }

  async function handleCredentials(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(dict.login.errorCredentials);
      setBusy(false);
      return;
    }
    await afterPasswordAccepted();
    setBusy(false);
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    if (!factorId) return;
    setBusy(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });
    if (verifyError) {
      setError(dict.login.errorTotp);
      setBusy(false);
      return;
    }
    setBusy(false);
    openDoor();
  }

  const inputClass =
    "h-12 w-full rounded-lg border border-line bg-surface-3 px-4 text-body text-ink outline-none transition-colors duration-[var(--dur-fast)] focus-visible:border-accent";
  const labelClass = "text-micro uppercase tracking-[0.08em] text-ink-2";
  const buttonClass =
    "mt-2 h-12 rounded-lg bg-accent px-5 text-body font-medium text-on-accent transition-all duration-[var(--dur-fast)] hover:bg-accent-press active:-translate-y-px active:scale-[0.99] disabled:opacity-60";
  const buttonSheen = { boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.25)" };

  return (
    <main className="relative flex min-h-[100dvh] overflow-hidden bg-bg">
      <BrandAtrium
        tagline={dict.login.tagline}
        taglineSub={dict.login.taglineSub}
        holding={dict.brand.holding}
      />

      {/* Form column — full-height panel, hairline gold seam toward the scene */}
      <section className="relative flex w-full flex-col justify-center overflow-hidden bg-surface px-6 py-10 sm:px-10 lg:w-[30rem] lg:shrink-0 xl:w-[33rem]">
        {/* Below lg the atrium is gone — a low skyline band keeps the scene
            present on the phone (CEO checklist §5.5) without crowding it. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-72 lg:hidden">
          <SkylineFar />
          <div
            className="absolute inset-x-0 bottom-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent) 45%, transparent) 50%, transparent)",
            }}
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-px lg:block"
          style={{
            background:
              "linear-gradient(180deg, transparent, color-mix(in oklab, var(--accent) 60%, transparent) 50%, transparent)",
          }}
        />

        <div className="login-rise-late mx-auto w-full max-w-sm">
          {/* Compact brand header (the atrium is hidden below lg) */}
          <div className="flex items-center gap-3 pb-2 lg:hidden">
            <DxbMark className="size-9 text-accent" />
            <div>
              <p className="text-panel-title leading-tight text-ink">{dict.brand.name}</p>
              <p className="text-micro text-ink-2">{dict.login.tagline}</p>
            </div>
          </div>

          {/* At lg+ the atrium already carries the brand — the column opens
              straight on the title so nothing repeats across the seam. */}
          <h1 className="mt-8 text-display text-ink lg:mt-0">{dict.login.title}</h1>
          <div
            aria-hidden
            className="mb-8 mt-4 h-px w-16"
            style={{ background: "linear-gradient(90deg, var(--accent), transparent)" }}
          />

          {step === "credentials" && (
            <form onSubmit={handleCredentials} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className={labelClass}>
                  {dict.login.email}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className={labelClass}>
                  {dict.login.password}
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              {error && (
                <p role="alert" className="text-body text-danger">
                  {error}
                </p>
              )}
              <button type="submit" disabled={busy} className={buttonClass} style={buttonSheen}>
                {busy ? dict.login.signingIn : dict.login.signIn}
              </button>
            </form>
          )}

          {(step === "enroll" || step === "verify") && (
            <form onSubmit={handleVerify} className="flex flex-col gap-5">
              <h2 className="text-panel-title text-ink">
                {step === "enroll" ? dict.login.enrollTitle : dict.login.totpTitle}
              </h2>
              <p className="text-body text-ink-2">
                {step === "enroll" ? dict.login.enrollHint : dict.login.totpHint}
              </p>
              {step === "enroll" && qrSvg && (
                <div
                  className="mx-auto w-40 rounded-xl bg-ink p-2 [&_svg]:h-auto [&_svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              )}
              {step === "enroll" && secret && (
                <p className="text-center text-micro text-ink-2">
                  {dict.login.enrollManual}
                  {": "}
                  <span className="font-mono text-ink" data-testid="totp-secret">
                    {secret}
                  </span>
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="totp" className={labelClass}>
                  {dict.login.totpCode}
                </label>
                <input
                  id="totp"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`${inputClass} text-center font-mono tracking-[0.3em]`}
                  data-numeric
                />
              </div>
              {error && (
                <p role="alert" className="text-body text-danger">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className={buttonClass}
                style={buttonSheen}
              >
                {busy ? dict.login.verifying : dict.login.verify}
              </button>
            </form>
          )}

          <p className="mt-10 text-micro text-ink-2 opacity-70 lg:hidden">
            © 2026 {dict.brand.holding} — {dict.login.taglineSub}
          </p>
        </div>

        <p className="absolute bottom-8 left-1/2 hidden w-full max-w-sm -translate-x-1/2 text-micro text-ink-2 opacity-60 lg:block">
          © 2026 {dict.brand.holding}
        </p>
      </section>

      {/* Door-opening handover: two halves part along a horizontal light line */}
      {step === "opening" && (
        <div aria-hidden className="absolute inset-0" style={{ zIndex: "var(--z-modal)" }}>
          <div className="door-half absolute inset-x-0 top-0 h-1/2 bg-bg" />
          <div className="door-half-b absolute inset-x-0 bottom-0 h-1/2 bg-bg" />
          <div className="door-line absolute inset-x-0 top-1/2 h-px bg-accent" />
        </div>
      )}
    </main>
  );
}
