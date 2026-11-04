const path='/home/dxb/DxB Global OS/node_modules/.pnpm/playwright-core@1.61.1/node_modules/playwright-core';
const {chromium}=require(path);
const fs=require('fs');
const [,,url,tag,mode]=process.argv;
(async()=>{
 const b=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
 const mobile=mode==='mobile';
 const ctx=await b.newContext(mobile?{viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',locale:'de-DE'}:{viewport:{width:1440,height:900},userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',locale:'de-DE'});
 const page=await ctx.newPage();
 const cdp=await ctx.newCDPSession(page);
 await cdp.send('Network.enable');
 const reqs=new Map(); let phase='load';
 cdp.on('Network.responseReceived',e=>{const r=reqs.get(e.requestId)||{};Object.assign(r,{url:e.response.url,mime:e.response.mimeType,type:e.type,status:e.response.status,phase:r.phase||phase,server:e.response.headers['server']||e.response.headers['Server'],cl:e.response.headers['content-length']||e.response.headers['Content-Length'],cr:e.response.headers['content-range']||e.response.headers['Content-Range']});reqs.set(e.requestId,r)});
 cdp.on('Network.dataReceived',e=>{const r=reqs.get(e.requestId)||{phase};r.data=(r.data||0)+(e.encodedDataLength||0);r.dec=(r.dec||0)+(e.dataLength||0);reqs.set(e.requestId,r)});
 cdp.on('Network.loadingFinished',e=>{const r=reqs.get(e.requestId)||{phase};r.enc=e.encodedDataLength;reqs.set(e.requestId,r)});
 const t0=Date.now();
 let navErr=null;
 try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000})}catch(e){navErr=String(e).slice(0,200)}
 await page.waitForTimeout(9000);
 // cookie banners
 for(const s of ['#onetrust-accept-btn-handler','button:has-text("Alle akzeptieren")','button:has-text("Akzeptieren")','button:has-text("Accept all")','button:has-text("Accept")','#usercentrics-root']){try{const l=page.locator(s).first();if(await l.count()&&await l.isVisible()){await l.click({timeout:1500});break}}catch(e){}}
 await page.waitForTimeout(2500);
 await page.screenshot({path:`${process.env.OUT}/${tag}-top.jpg`,type:'jpeg',quality:70}).catch(()=>{});
 const snap=async()=>page.evaluate(()=>{
  const deep=(root,sel,acc=[])=>{root.querySelectorAll(sel).forEach(e=>acc.push(e));root.querySelectorAll('*').forEach(e=>{if(e.shadowRoot)deep(e.shadowRoot,sel,acc)});return acc};const mux=[...document.querySelectorAll('mux-player,mux-video,mux-background-video')].map(e=>({tag:e.tagName,pid:e.getAttribute('playback-id')||e.getAttribute('src'),y:Math.round(e.getBoundingClientRect().top+scrollY),w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)}));const v=deep(document,'video').map(x=>{const r=x.getBoundingClientRect();return {src:(x.currentSrc||x.src||'').slice(0,160),w:x.videoWidth,h:x.videoHeight,dur:x.duration,cw:Math.round(r.width),ch:Math.round(r.height),y:Math.round(r.top+scrollY),auto:x.autoplay,loop:x.loop,muted:x.muted,paused:x.paused}});
  const c=[...document.querySelectorAll('canvas')].map(x=>{const r=x.getBoundingClientRect();let gl=null;return {w:x.width,h:x.height,cw:Math.round(r.width),ch:Math.round(r.height),pos:getComputedStyle(x).position}});
  const imgs=[...document.images];
  const scripts=[...document.scripts].map(s=>s.src).filter(Boolean);
  const g=window; 
  return {mux,title:document.title,h:document.documentElement.scrollHeight,videos:v,canvases:c,imgCount:imgs.length,lazy:imgs.filter(i=>i.loading==='lazy').length,svgCount:document.querySelectorAll('svg').length,
   nodes:document.querySelectorAll('*').length,textLen:(document.body.innerText||'').length,
   libs:{three:!!g.__THREE__||!!g.THREE,threeRev:g.__THREE__||null,gsap:!!g.gsap,ScrollTrigger:!!g.ScrollTrigger,lenis:!!g.lenis||!!document.querySelector('.lenis'),next:!!g.__NEXT_DATA__||!!document.querySelector('#__next'),nuxt:!!g.__NUXT__||!!g.useNuxtApp||!!document.querySelector('#__nuxt'),webflow:!!document.documentElement.getAttribute('data-wf-site'),jquery:!!g.jQuery,react:!!document.querySelector('[data-reactroot]'),rive:!!g.rive,lottie:!!g.lottie||!!document.querySelector('lottie-player'),astro:!!document.querySelector('astro-island'),gen:(document.querySelector('meta[name=generator]')||{}).content||null},
   scripts:scripts.slice(0,30)}});
 const first=await snap();
 const loadT=Date.now()-t0;
 phase='scroll';
 const H=first.h; const step=Math.round((mobile?844:900)*0.6);
 let y=0, shots=0;
 for(let i=0;i<70&&y<H+2000;i++){ y+=step; await page.mouse.wheel(0,step).catch(()=>{}); await page.evaluate(s=>window.scrollBy(0,0),step).catch(()=>{}); await page.waitForTimeout(350); if(i%12===6){await page.screenshot({path:`${process.env.OUT}/${tag}-s${shots++}.jpg`,type:'jpeg',quality:60}).catch(()=>{})}}
 await page.waitForTimeout(4000);
 const last=await snap();
 const rows=[...reqs.values()].filter(r=>r.url);
 const cat=r=>{const u=(r.url||'').split('?')[0].toLowerCase(),m=(r.mime||'').toLowerCase();
   if(m.startsWith('video')||/\.(mp4|webm|m3u8|ts|m4s|mov)$/.test(u))return 'video';
   if(m.startsWith('audio')||/\.(mp3|ogg|wav|m4a)$/.test(u))return 'audio';
   if(/\.(glb|gltf|ktx2?|basis|drc|buf|hdr|exr|bin|riv|lottie)$/.test(u))return '3d/rive';
   if(m.startsWith('image'))return 'image';
   if(m.includes('javascript')||/\.m?js$/.test(u))return 'js';
   if(m.includes('css'))return 'css';
   if(m.includes('font')||/\.(woff2?|ttf|otf)$/.test(u))return 'font';
   if(m.includes('html'))return 'html';
   if(m.includes('json'))return 'json';
   return 'other'};
 const agg={};
 for(const r of rows){const k=cat(r);const b=r.enc||r.data||0;agg[k]=agg[k]||{n:0,bytes:0,load:0,scroll:0};agg[k].n++;agg[k].bytes+=b;agg[k][r.phase==='scroll'?'scroll':'load']+=b}
 const top=rows.map(r=>({b:r.enc||r.data||0,c:cat(r),u:r.url.slice(0,150),cl:r.cl,cr:r.cr,p:r.phase})).sort((a,b)=>b.b-a.b).slice(0,22);
 const hosts={};for(const r of rows){try{const h=new URL(r.url).host;hosts[h]=(hosts[h]||0)+(r.enc||r.data||0)}catch(e){}}
 const hostTop=Object.entries(hosts).sort((a,b)=>b[1]-a[1]).slice(0,14);
 const out={url,tag,mode:mode||'desktop',navErr,loadT,first,last,agg,top,hostTop,total:rows.reduce((s,r)=>s+(r.enc||r.data||0),0),n:rows.length,server:rows[0]&&rows[0].server};
 fs.writeFileSync(`${process.env.OUT}/${tag}.json`,JSON.stringify(out,null,1));
 console.log(tag,'total MB',(out.total/1e6).toFixed(1),'n',out.n,navErr||'');
 await b.close();
})().catch(e=>{console.error('ERR',tag,e);process.exit(1)});
