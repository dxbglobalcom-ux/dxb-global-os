#!/usr/bin/env node
// UI-SPEC §9.1 contrast battery: parses the Gece Lobisi tokens straight out
// of globals.css (both themes), converts OKLCH → linear sRGB (Ottosson
// matrices — no dependency), computes WCAG 2.x contrast ratios and prints
// PASS/FAIL per required pair. Exit 1 on any FAIL so CI can gate on it.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const CSS = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../apps/dashboard/src/app/globals.css"),
  "utf8",
);

// --- token extraction -------------------------------------------------------
function parseBlock(source) {
  const tokens = {};
  for (const match of source.matchAll(/--([a-z0-9-]+):\s*oklch\(([^)]+)\)/g)) {
    const [l, c, h] = match[2].split("/")[0].trim().split(/\s+/).map(Number);
    const alpha = match[2].includes("/") ? Number(match[2].split("/")[1]) : 1;
    tokens[match[1]] = { l, c, h: Number.isNaN(h) ? 0 : h, alpha };
  }
  return tokens;
}

const lightStart = CSS.indexOf('[data-theme="light"]');
const dark = parseBlock(CSS.slice(0, lightStart));
const light = { ...dark, ...parseBlock(CSS.slice(lightStart)) };

// --- OKLCH → linear sRGB (Björn Ottosson's oklab matrices) ------------------
function oklchToLinearSrgb({ l: L, c: C, h }) {
  const rad = (h * Math.PI) / 180;
  const a = C * Math.cos(rad);
  const b = C * Math.sin(rad);
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ].map((v) => Math.min(1, Math.max(0, v)));
}

// WCAG relative luminance takes LINEAR channels directly.
const luminance = (rgb) => 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];

function contrast(fg, bg) {
  const [l1, l2] = [luminance(oklchToLinearSrgb(fg)), luminance(oklchToLinearSrgb(bg))];
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// --- §9.1 required pairs ----------------------------------------------------
const PAIRS = [
  ["ink", "bg", 7],
  ["ink-2", "surface-2", 4.5],
  ["on-accent", "accent", 4.5],
  ["ok", "surface", 3],
  ["warn", "surface", 3],
  ["danger", "surface", 3],
  ["info", "surface", 3],
];

let failed = 0;
for (const [themeName, tokens] of [
  ["dark", dark],
  ["light", light],
]) {
  console.log(`\n== ${themeName} ==`);
  for (const [fg, bg, min] of PAIRS) {
    const ratio = contrast(tokens[fg], tokens[bg]);
    const ok = ratio >= min;
    if (!ok) failed += 1;
    console.log(
      `${ok ? "PASS" : "FAIL"}  --${fg} / --${bg}  ${ratio.toFixed(2)}:1  (min ${min}:1)`,
    );
  }
}

process.exit(failed === 0 ? 0 : 1);
