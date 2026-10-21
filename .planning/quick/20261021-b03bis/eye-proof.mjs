// B03-bis proof: the engineer's storageState opens the eye copy (127.0.0.1:3100) without a login,
// "/" and one command route, EN and TR, at 1280 and 1920; screenshots + horizontal overflow.
//   node .planning/quick/20261021-b03bis/eye-proof.mjs
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(new URL("../../../apps/dashboard/package.json", import.meta.url));
const { chromium } = require("@playwright/test");
const BASE = "http://127.0.0.1:3100";
const state = JSON.parse(readFileSync(join(homedir(), ".dxb", "e2e-state.json"), "utf8"));
const cookies = state.cookies.map((c) => ({ ...c, domain: "127.0.0.1" }));
const browser = await chromium.launch();
for (const lang of ["en", "tr"]) {
  for (const width of [1280, 1920]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addCookies([...cookies, { name: "dxb-locale", value: lang, domain: "127.0.0.1", path: "/" }]);
    const page = await ctx.newPage();
    for (const route of ["/", "/overview"]) {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 90_000 });
      const finalPath = new URL(page.url()).pathname;
      const htmlLang = await page.evaluate(() => document.documentElement.lang);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const name = `${route === "/" ? "root" : route.slice(1)}-${lang}-${width}.png`;
      await page.screenshot({ path: join(here, name) });
      console.log(`${route} ${lang} ${width}: landed on ${finalPath} · html lang=${htmlLang} · overflow ${overflow}px · ${name}`);
    }
    await ctx.close();
  }
}
await browser.close();
