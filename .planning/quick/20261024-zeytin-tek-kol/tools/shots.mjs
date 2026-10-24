// Screenshots of the three pages for the side-by-side report: first screen and scroll positions, desktop and phone.
// usage: node shots.mjs <out dir>  (pages read from the judge folder's A/B/C.html)
import { createRequire } from 'node:module';
const require = createRequire('/home/dxb/test-kutu/20261024-zeytin/job/work/00-tools/package.json');
const { chromium } = require('playwright');
const out = process.argv[2];
const J = '/home/dxb/test-kutu/20261024-zeytin/judge';
const views = [{ n: 'd', w: 1440, h: 900, stops: [0, 1, 2, 3, 4] }, { n: 'm', w: 390, h: 844, stops: [0, 1, 2, 3] }];
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
for (const p of ['A', 'B', 'C']) {
  for (const v of views) {
    const page = await browser.newPage({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 1 });
    await page.goto(`file://${J}/${p}.html`, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (const s of v.stops) {
      const y = Math.round((total - v.h) * s / (v.stops.length - 1));
      // scroll in steps so scroll-driven reveals fire on the way
      for (let t = 0; t <= y; t += Math.round(v.h / 2)) { await page.evaluate((yy) => window.scrollTo(0, yy), t); await page.waitForTimeout(120); }
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${out}/${p}-${v.n}-${s}.jpg`, type: 'jpeg', quality: 72 });
    }
    await page.close();
  }
}
await browser.close();
console.log('SHOTS_DONE');
