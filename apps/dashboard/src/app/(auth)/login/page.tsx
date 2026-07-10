"use client";

// Login scene (UI-SPEC §8, DENSITY 3): dark ground, ONE ambient gold radial,
// DXB monogram, minimal form. Supabase Auth email+password with ENFORCED
// TOTP: no factor -> enroll flow, factor -> challenge. On success the
// door-opening transition (clip-path halves, 700ms, once per session,
// reduced-motion: instant) hands over to the cockpit.
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DxbMark } from "@/components/shell/app-shell";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type Step = "credentials" | "enroll" | "verify" | "opening";

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
      router.push("/");
      router.refresh();
      return;
    }
    setStep("opening");
    window.setTimeout(() => {
      router.push("/");
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
    "h-11 w-full rounded-xl border border-line bg-surface-2 px-4 text-body text-ink outline-none transition-colors duration-[var(--dur-fast)] focus-visible:border-accent";
  const labelClass = "text-micro text-ink-2";

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-bg px-4">
      {/* The single ambient gold light (only gradient allowed on this scene) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(56rem 34rem at 50% 12%, oklch(0.8 0.115 92 / 0.13), transparent 62%)",
        }}
      />

      <section
        className="relative w-full max-w-sm rounded-[1.25rem] border border-line bg-surface p-1.5"
        style={{ boxShadow: "0 32px 64px -32px oklch(0.1 0.02 80 / 0.7)" }}
      >
        <div
          className="rounded-[calc(1.25rem-0.375rem)] bg-surface-2 px-6 py-8"
          style={{ boxShadow: "inset 0 1px 0 var(--edge-light)" }}
        >
          <div className="flex flex-col items-center gap-2 pb-6">
            <DxbMark className="size-10 text-accent" />
            <h1 className="text-panel-title text-ink">{dict.brand.name}</h1>
            <p className="text-micro text-ink-2">{dict.login.title}</p>
          </div>

          {step === "credentials" && (
            <form onSubmit={handleCredentials} className="flex flex-col gap-4">
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
              <button
                type="submit"
                disabled={busy}
                className="mt-2 h-10 rounded-full bg-accent px-5 text-body font-medium text-on-accent transition-transform duration-[var(--dur-fast)] hover:bg-accent-press active:-translate-y-px active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? dict.login.signingIn : dict.login.signIn}
              </button>
            </form>
          )}

          {(step === "enroll" || step === "verify") && (
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
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
                className="mt-2 h-10 rounded-full bg-accent px-5 text-body font-medium text-on-accent transition-transform duration-[var(--dur-fast)] hover:bg-accent-press active:-translate-y-px active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? dict.login.verifying : dict.login.verify}
              </button>
            </form>
          )}
        </div>
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
