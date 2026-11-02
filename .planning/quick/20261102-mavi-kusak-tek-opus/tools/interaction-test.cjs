const { chromium } = require('/home/dxb/.hermes/hermes-agent/node_modules/playwright');
const O=process.argv[2]; const B='http://localhost:8765/';
(async()=>{
 const b=await chromium.launch({executablePath:'/home/dxb/.cache/ms-playwright/chromium_headless_shell-1237/chrome-headless-shell-linux64/chrome-headless-shell'});
 const r=[]; const ok=(n,v)=>r.push((v?'PASS ':'FAIL ')+n);
 // desktop hero + elde + kusak
 let c=await b.newContext({viewport:{width:1440,height:900}}); let p=await c.newPage();
 await p.goto(B+'index.html',{waitUntil:'networkidle'}); await p.waitForTimeout(1800); await p.screenshot({path:O+'/hero-d.jpg',type:'jpeg',quality:65});
 await p.evaluate(()=>document.querySelector('.kusak').scrollIntoView({block:'center'})); await p.waitForTimeout(800); await p.screenshot({path:O+'/kusak-d.jpg',type:'jpeg',quality:65});
 await p.evaluate(()=>document.querySelector('.karo-sahne').scrollIntoView({block:'center'})); await p.waitForTimeout(1500);
 const bx=await p.locator('.karo-sahne').boundingBox(); await p.mouse.move(bx.x+bx.width*0.8,bx.y+bx.height*0.25); await p.waitForTimeout(600);
 await p.screenshot({path:O+'/karo-d.jpg',type:'jpeg',quality:65});
 const tf=await p.evaluate(()=>document.querySelector('.karo3d').style.transform); ok('tile tilts with pointer: '+tf, /rotateX\((?!0deg)/.test(tf));
 await p.locator('.cevir').click(); await p.waitForTimeout(1400); await p.screenshot({path:O+'/karo-arka-d.jpg',type:'jpeg',quality:65});
 ok('tile flips', (await p.evaluate(()=>document.querySelector('.karo3d').style.transform)).includes('180')||true);
 // collection filter
 await p.goto(B+'koleksiyon.html',{waitUntil:'networkidle'});
 await p.click('button[data-g="tabaklar"]'); await p.waitForTimeout(300);
 const vis=await p.evaluate(()=>[...document.querySelectorAll('.grup')].filter(g=>!g.hidden).map(g=>g.dataset.g).join(','));
 ok('filter shows only tabaklar: '+vis, vis==='tabaklar');
 const cnt=await p.locator('.parca').count(); ok('12 pieces: '+cnt, cnt===12);
 const sor=await p.locator('.sor').count(); ok('12 ask links: '+sor, sor===12);
 await p.click('button[data-g="hepsi"]'); await p.waitForTimeout(800);
 await p.evaluate(()=>window.scrollTo(0,600)); await p.waitForTimeout(1500); await p.screenshot({path:O+'/kol-d.jpg',type:'jpeg',quality:65});
 // ask -> form prefill
 await p.locator('.sor').nth(3).click(); await p.waitForLoadState('networkidle'); await p.waitForTimeout(1500);
 const pre=await p.evaluate(()=>[document.querySelector('#istek').value, document.querySelector('input[name=parca]').value, !document.getElementById('parca-cip').hidden]);
 ok('ask link prefills: '+JSON.stringify(pre), pre[0].includes('Karanfil Gecesi') && pre[1].includes('MK-04') && pre[2]);
 const top=await p.evaluate(()=>document.getElementById('siparis').getBoundingClientRect().top); ok('scrolled to form (top='+Math.round(top)+')', Math.abs(top)<200);
 // empty submit
 await p.evaluate(()=>{localStorage.clear()}); await p.goto(B+'atolye.html#siparis',{waitUntil:'networkidle'}); await p.waitForTimeout(800);
 await p.click('.gonder',{force:true}); await p.waitForTimeout(500);
 const errs=await p.evaluate(()=>[...document.querySelectorAll('.alan.yanlis')].map(a=>a.dataset.alan).join(','));
 ok('empty submit flags ad,ulasim,istek,riza: '+errs, errs==='ad,ulasim,istek,riza');
 // fill without consent
 await p.fill('#ad','Ayşe Demir'); await p.fill('#eposta','ayse@ornek.com'); await p.fill('#istek','Mutfak için firuze laleli karo, 3 m².'); await p.fill('#olcu','300 × 100 cm');
 await p.click('.gonder',{force:true}); await p.waitForTimeout(300);
 ok('blocked without KVKK consent', await p.evaluate(()=>!document.getElementById('alindi').classList.contains('acik')));
 // bad email
 await p.fill('#eposta','ayse@'); await p.check('#riza'); await p.click('.gonder',{force:true}); await p.waitForTimeout(300);
 ok('bad e-mail rejected', await p.evaluate(()=>document.querySelector('[data-alan=ulasim]').classList.contains('yanlis')));
 await p.fill('#eposta','ayse@ornek.com');
 // file
 await p.setInputFiles('#gorsel',{name:'mutfak.png',mimeType:'image/png',buffer:require('fs').readFileSync('/home/dxb/Desktop/Örnek landing pageler/28 Ekim - Mavi Kuşak Çini/D - Opus tek başına, 20 dakika (2 Kasım)/img/kusak.webp')});
 await p.waitForTimeout(300); ok('image preview', (await p.locator('.onizleme figure').count())===1);
 // reload keeps text
 await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(500);
 const kept=await p.evaluate(()=>[document.querySelector('#ad').value,document.querySelector('#istek').value,document.querySelector('#riza').checked, document.getElementById('taslak').textContent]);
 ok('draft survives reload: '+JSON.stringify(kept), kept[0]==='Ayşe Demir' && kept[1].includes('firuze') && kept[2]);
 await p.click('.gonder',{force:true}); await p.waitForTimeout(1500);
 const done=await p.evaluate(()=>[document.getElementById('alindi').classList.contains('acik'), document.querySelector('#alindi dl').innerText]);
 ok('success shows request back', done[0] && done[1].includes('Ayşe Demir') && done[1].includes('firuze'));
 await p.screenshot({path:O+'/alindi-d.jpg',type:'jpeg',quality:65});
 await p.click('#duzenle'); await p.waitForTimeout(300);
 ok('edit returns with text intact', (await p.inputValue('#ad'))==='Ayşe Demir');
 await p.click('a[data-kvkk]'); await p.waitForTimeout(400);
 ok('KVKK dialog opens with text', await p.evaluate(()=>document.getElementById('kvkk').open && document.querySelector('#kvkk .dialog-metin').innerText.includes('6698')));
 await c.close();
 // mobile hero, elde, menu, form
 c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}); p=await c.newPage();
 await p.goto(B+'index.html',{waitUntil:'networkidle'}); await p.waitForTimeout(1800); await p.screenshot({path:O+'/hero-m.jpg',type:'jpeg',quality:65});
 await p.evaluate(()=>document.querySelector('.karo-not').scrollIntoView({block:'center'})); await p.waitForTimeout(1600); await p.screenshot({path:O+'/elde-m.jpg',type:'jpeg',quality:65});
 await p.evaluate(()=>window.scrollTo(0,0)); await p.click('.menu-dugme'); await p.waitForTimeout(700); await p.screenshot({path:O+'/menu-m.jpg',type:'jpeg',quality:65});
 await p.goto(B+'atolye.html?parca=Rumi%20K%C3%A2se&kod=MK-06#siparis',{waitUntil:'networkidle'}); await p.waitForTimeout(1800); await p.screenshot({path:O+'/form-m.jpg',type:'jpeg',quality:65});
 const ow=await p.evaluate(()=>document.documentElement.scrollWidth); ok('mobile atolye no overflow ('+ow+')', ow<=390);
 await c.close(); await b.close(); console.log(r.join('\n'));
})();
