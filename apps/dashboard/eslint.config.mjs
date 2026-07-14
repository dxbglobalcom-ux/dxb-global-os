// Dashboard is a pure projection client (master-plan PHASE-08 LOCKED decision):
// intent goes to the kernel through the dxb-mcp/HTTP seam — the dashboard itself
// never talks to a model provider. The `ai` SDK core (render/stream helpers,
// arrives 08-05) is allowed; provider SDKs are not.
import tseslint from "typescript-eslint";

export default [
  {
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Registered so the in-code disable comments reference a REAL rule —
      // ESLint 9 hard-errors on directives naming unregistered rules.
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@anthropic-ai/*"], message: "Provider SDK forbidden in dashboard — kernel seam only (PHASE-08 LOCKED)." },
            { group: ["openai", "openai/*"], message: "Provider SDK forbidden in dashboard — kernel seam only (PHASE-08 LOCKED)." },
            { group: ["@ai-sdk/*"], message: "Provider adapters forbidden in dashboard — `ai` core render/stream only (PHASE-08 LOCKED)." },
            { group: ["ai/rsc"], message: "ai/rsc drives model calls — dashboard renders only (PHASE-08 LOCKED)." },
          ],
        },
      ],
    },
  },
];
