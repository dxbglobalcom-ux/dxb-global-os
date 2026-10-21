// B03-bis proof: the engineer's storageState opens the eye copy (127.0.0.1:3100) without a login,
// "/" and one command route, EN and TR, at 1280 and 1920; screenshots + horizontal overflow.
// Every view must land on /overview with HTTP 200, a visible non-empty <h1>, the asked html lang and
// overflow 0 — any miss is a FAIL line and exit 1. The whole output also goes to eye-proof.raw here.
//   node .planning/quick/20261021-b03bis/eye-proof.mjs
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ENGINEER_STATE_FILE, EYE_ORIGIN } from "../../../scripts/test/engineer-env.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(new URL("../../../apps/dashboard/package.json", import.meta.url));
const { chromium } = require("@playwright/test");
const { cookies } = JSON.parse(readFileSync(ENGINEER_STATE_FILE, "utf8"));
const raw = [];
const say = (text) => (console.log(text), raw.push(text));
let failures = 0;
const browser = await chromium.launch();
for (const lang of ["en", "tr"]) {
  for (const width of [1280, 1920]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addCookies([...cookies, { name: "dxb-locale", value: lang, domain: "127.0.0.1", path: "/" }]);
    const page = await ctx.newPage();
    for (const route of ["/", "/overview"]) {
      const response = await page.goto(EYE_ORIGIN + route, { waitUntil: "networkidle", timeout: 90_000 });
      const status = response?.status() ?? 0;
      const finalPath = new URL(page.url()).pathname;
      const htmlLang = await page.evaluate(() => document.documentElement.lang);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const h1 = page.locator("h1").first();
      const heading = (await h1.isVisible()) ? (await h1.innerText()).replace(/\s+/g, " ").trim() : "";
      const name = `${route === "/" ? "root" : route.slice(1)}-${lang}-${width}.png`;
      await page.screenshot({ path: join(here, name) });
      const misses = [
        finalPath !== "/overview" && "route",
        status !== 200 && "status",
        !heading && "heading",
        htmlLang !== lang && "lang",
        overflow !== 0 && "overflow",
      ].filter(Boolean);
      failures += misses.length;
      say(`${misses.length ? `FAIL(${misses.join(",")})` : "PASS"} ${route} ${lang} ${width}: landed on ${finalPath} · HTTP ${status} · h1 "${heading}" · html lang=${htmlLang} · overflow ${overflow}px · ${name}`);
    }
    await ctx.close();
  }
}
await browser.close();
say(failures ? `EYE_PROOF_FAILED (${failures} miss(es))` : "EYE_PROOF_PASSED");
writeFileSync(join(here, "eye-proof.raw"), raw.join("\n") + "\n");
process.exit(failures ? 1 : 0);
