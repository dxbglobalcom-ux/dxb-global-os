// Reads Meta's public Ad Library (no login) for one query and writes every ad object it returns as JSONL.
// usage: node adlib.js <out.jsonl> <country> <max_scrolls> <start_max YYYY-MM-DD> <query...>
const fs = require('fs');
const pw = require('/home/dxb/DxB Global OS/node_modules/.pnpm/playwright-core@1.61.1/node_modules/playwright-core');
const [, , out, country, maxScrolls, startMax, ...q] = process.argv;
const query = q.join(' ');
const seen = new Map();
function walk(o) {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) { for (const x of o) walk(x); return; }
  if (o.ad_archive_id && o.snapshot) { if (!seen.has(o.ad_archive_id)) seen.set(o.ad_archive_id, o); }
  for (const k of Object.keys(o)) walk(o[k]);
}
function eat(text) {
  for (const line of text.split('\n')) {
    const s = line.replace(/^for \(;;\);/, '').trim();
    if (!s.startsWith('{')) continue;
    try { walk(JSON.parse(s)); } catch (e) { /* not json */ }
  }
}
(async () => {
  const b = await pw.chromium.launch({ headless: true, executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1237/chrome-linux64/chrome', args: ['--disable-blink-features=AutomationControlled'] });
  const ctx = await b.newContext({ locale: 'en-US', viewport: { width: 1400, height: 1000 }, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36' });
  const page = await ctx.newPage();
  page.on('response', async (r) => {
    const u = r.url();
    if (u.includes('/api/graphql')) { try { eat(await r.text()); } catch (e) { } }
  });
  const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${country}&is_targeted_country=false&media_type=video&q=${encodeURIComponent(query)}&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions` + (startMax !== '-' ? `&start_date[max]=${startMax}` : '');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  // the first page of results is inlined in the HTML as JSON script tags
  const inl = await page.evaluate(() => [...document.querySelectorAll('script[type="application/json"]')].map(s => s.textContent));
  for (const t of inl) { try { walk(JSON.parse(t)); } catch (e) { } }
  const head = await page.evaluate(() => (document.body.innerText.match(/~?[\d,]+ results?/) || [''])[0]);
  let last = 0, still = 0;
  for (let i = 0; i < Number(maxScrolls); i++) {
    await page.mouse.wheel(0, 6000);
    await page.waitForTimeout(1800);
    if (seen.size === last) { if (++still > 4) break; } else { still = 0; last = seen.size; }
  }
  const w = fs.createWriteStream(out, { flags: 'a' });
  for (const o of seen.values()) w.write(JSON.stringify({ query, country, ...o }) + '\n');
  w.end();
  console.log(JSON.stringify({ query, country, head, ads: seen.size }));
  await b.close();
})().catch(e => { console.error('ERR', query, String(e).slice(0, 300)); process.exit(1); });
