/* DXB monogram (design-bank brand rule: geometric skyline mark, no
   invented symbols; vertical bar/skyline mark + wordmark). Five bars rise
   to a spire; the tallest carries a beacon tip. Extracted from the retired
   legacy AppShell (C6 legacy kill, 2026-07-19). */
export function DxbMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <rect x="4" y="19" width="3" height="9" fill="currentColor" opacity="0.55" />
      <rect x="9.5" y="13" width="3" height="15" fill="currentColor" opacity="0.75" />
      <rect x="15" y="5" width="3" height="23" fill="currentColor" />
      <path d="M16.5 1.5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="20.5" y="10" width="3" height="18" fill="currentColor" opacity="0.85" />
      <rect x="26" y="16" width="3" height="12" fill="currentColor" opacity="0.65" />
    </svg>
  );
}
