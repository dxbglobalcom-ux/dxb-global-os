import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dashboard is a pure projection client (master-plan PHASE-08 LOCKED):
  // no LLM calls, no provider SDKs — enforced by eslint no-restricted-imports.
  reactStrictMode: true,
  // Next's dev "N" indicator stays ON (CEO 2026-07-13: useful — shows live
  // rendering activity during development; dev-only, absent from production).
  // Nudged to bottom-right so it never overlaps the nav rail.
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
