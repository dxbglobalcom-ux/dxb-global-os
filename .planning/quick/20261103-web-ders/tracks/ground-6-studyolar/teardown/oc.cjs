const {chromium}=require('/home/dxb/DxB Global OS/node_modules/.pnpm/playwright-core@1.61.1/node_modules/playwright-core');
const fs=require('fs');
(async()=>{const b=await chromium.launch({headless:true});const c=await b.newContext({viewport:{width:1440,height:900},locale:'de-DE',userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'});const p=await c.newPage();
const io=[];await p.addInitScript(()=>{window.__io=0;const O=IntersectionObserver;window.IntersectionObserver=function(a,b){window.__io++;return new O(a,b)};window.IntersectionObserver.prototype=O.prototype;window.__raf=0;const R=requestAnimationFrame;window.requestAnimationFrame=function(f){window.__raf++;return R(f)};window.__sc=0;const A=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(t,...r){if(t==='scroll'||t==='wheel'||t==='mousemove'||t==='pointermove')window.__sc++;return A.call(this,t,...r)}});
await p.goto('https://www.outletcity.com/de/metzingen/',{waitUntil:'domcontentloaded',timeout:45000});await p.waitForTimeout(8000);
try{await p.locator('#usercentrics-root').evaluate(e=>{const b=e.shadowRoot&&[...e.shadowRoot.querySelectorAll('button')].find(x=>/akzept|accept/i.test(x.textContent));b&&b.click()})}catch(e){}
await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const out={};
 const secs=[...document.querySelectorAll('main > *, main section, section')].slice(0,30).map(s=>{const r=s.getBoundingClientRect();return {tag:s.tagName,cls:(s.className+'').slice(0,70),y:Math.round(r.top+scrollY),h:Math.round(r.height),img:s.querySelectorAll('img').length,mux:s.querySelectorAll('mux-player').length,txt:(s.innerText||'').slice(0,80).replace(/\n/g,' | ')}});
 out.secs=secs;
 const ai=[...document.querySelectorAll('body *')].filter(e=>e.children.length==0&&/^\s*(AI|KI)\s*$/.test(e.textContent||'')).map(e=>({tag:e.tagName,cls:(e.className+'').slice(0,60),t:e.textContent,alt:e.getAttribute('title')||e.getAttribute('aria-label')}));
 const aimg=[...document.images].filter(i=>/\bAI\b|KI-/i.test(i.alt||'')).map(i=>i.alt.slice(0,120));
 const alts=[...document.querySelectorAll('[alt*="KI"],[title*="KI"],[aria-label*="KI"],[alt*=" AI"],[title*="AI"],[aria-label*="AI"]')].map(e=>({t:e.tagName,a:(e.getAttribute('alt')||e.getAttribute('title')||e.getAttribute('aria-label')).slice(0,120)}));
 out.ai=ai;out.aimg=aimg;out.alts=alts.slice(0,8);
 let kf=0,tr=0,sticky=0,anim=0;for(const s of document.styleSheets){try{for(const r of s.cssRules){if(r.type===7)kf++;if(r.style&&r.style.transition)tr++;if(r.style&&r.style.position==='sticky')sticky++;if(r.style&&(r.style.animationTimeline||''))anim++}}catch(e){}}
 out.css={kf,tr,sticky,anim};
 out.io=window.__io;out.raf=window.__raf;out.sc=window.__sc;
 out.gen=[...document.querySelectorAll('script[src]')].map(s=>s.src).filter(s=>/_nuxt|_onsite/.test(s)).length;
 out.jsonld=[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>s.textContent.slice(0,120));
 out.heroImgs=[...document.images].filter(i=>i.getBoundingClientRect().top<900).map(i=>({s:(i.currentSrc||i.src).slice(0,110),w:i.naturalWidth,h:i.naturalHeight,alt:(i.alt||'').slice(0,80)})).slice(0,6);
 out.pic=[...document.querySelectorAll('picture')].length;
 return out});
fs.writeFileSync(process.env.OUT+'/oc-dom.json',JSON.stringify(r,null,1));
for(const y of [0]){}
await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(800);
const ms=[1000,4000,7000];
await p.evaluate(()=>window.scrollTo(0,6387-40));await p.waitForTimeout(1500);
for(let i=0;i<3;i++){await p.screenshot({path:process.env.OUT+`/oc-wall${i}.jpg`,type:'jpeg',quality:60});await p.waitForTimeout(3000)}
console.log(JSON.stringify({io:r.io,raf:r.raf,sc:r.sc,css:r.css,ai:r.ai,alts:r.alts,aimg:r.aimg,pic:r.pic}));
console.log(r.secs.map(s=>[s.y,s.h,s.img,s.mux,s.txt].join(' · ')).join('\n'));console.log(JSON.stringify(r.heroImgs),JSON.stringify(r.jsonld));
await b.close()})().catch(e=>{console.error(e);process.exit(1)});
