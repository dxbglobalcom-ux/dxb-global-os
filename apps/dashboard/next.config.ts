import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dashboard is a pure projection client (master-plan PHASE-08 LOCKED):
  // no LLM calls, no provider SDKs — enforced by eslint no-restricted-imports.
  reactStrictMode: true,
};

export default nextConfig;
