const { chromium } = require('/home/dxb/.hermes/hermes-agent/node_modules/playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch({executablePath:'/home/dxb/.cache/ms-playwright/chromium_headless_shell-1237/chrome-headless-shell-linux64/chrome-headless-shell'});
  const errs = [];
  for (const [w,h,tag,mob] of [[1440,900,'d',false],[390,844,'m',true]]) {
    const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:1, isMobile:mob, hasTouch:mob });
    for (const p of ['index','koleksiyon','atolye']) {
      const pg = await ctx.newPage();
      pg.on('console', m => { if (m.type()==='error') errs.push(`${tag}/${p}: ${m.text()}`); });
      pg.on('pageerror', e => errs.push(`${tag}/${p} PAGEERR: ${e.message}`));
      await pg.goto(`http://localhost:8765/${p}.html`, { waitUntil:'networkidle' });
      // scroll through to trigger reveals
      const H = await pg.evaluate(()=>document.documentElement.scrollHeight);
      for (let y=0;y<H;y+=400){ await pg.evaluate(y=>window.scrollTo(0,y),y); await pg.waitForTimeout(60); }
      await pg.waitForTimeout(1400);
      const sw = await pg.evaluate(()=>[document.documentElement.scrollWidth, window.innerWidth]);
      if (sw[0] > sw[1]) errs.push(`${tag}/${p}: horizontal overflow ${sw}`);
      // viewport shots at several stops
      const stops = 8; const H2 = await pg.evaluate(()=>document.documentElement.scrollHeight);
      for (let i=0;i<stops;i++){ const y=Math.round(i*(H2-h)/(stops-1)); await pg.evaluate(y=>window.scrollTo(0,y),y); await pg.waitForTimeout(1300); await pg.screenshot({ path:`${out}/${tag}-${p}-${i}.jpg`, quality:60, type:'jpeg' }); }
      await pg.close();
    }
    await ctx.close();
  }
  console.log(errs.join('\n') || 'no console errors, no overflow');
  await b.close();
})();
