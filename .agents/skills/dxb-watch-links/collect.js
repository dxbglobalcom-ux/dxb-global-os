// collect.js — run in his Chrome's WhatsApp Web tab (claude-in-chrome javascript_tool) with the chat open.
// Scrolls the chat UP with the wheel's own mechanism (scrollTop) until the date SINCE (dd.mm.yyyy) is
// reached, collecting every message: date/sender, text, links. Never types into the page.
// Then read window.__m out in chunks of ~850 characters (the tool cuts longer output), e.g.
//   JSON.stringify(Object.values(window.__m)).slice(0, 850)   …   .slice(850, 1700)   …
const SINCE = "13.06.2026"; // set before running
window.__m = window.__m || {};
const collect = () => document.querySelectorAll('#main [data-id]').forEach(r => {
  const p = r.querySelector('[data-pre-plain-text]');
  const links = [...new Set([...r.querySelectorAll('a[href]')].map(a => a.href)
    .filter(h => !h.startsWith('https://web.whatsapp.com')))];
  window.__m[r.getAttribute('data-id')] = { pre: p ? p.getAttribute('data-pre-plain-text') : null,
    text: (r.innerText || '').slice(0, 1500), links };
});
const toD = s => { const m = s && s.match(/(\d\d)\.(\d\d)\.(\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; };
const main = document.querySelector('#main');
const sc = [...main.querySelectorAll('div')].find(d => { const s = getComputedStyle(d);
  return (s.overflowY === 'auto' || s.overflowY === 'scroll') && d.scrollHeight > d.clientHeight + 50; });
window.__st = { running: true, rounds: 0 };
(async () => {
  const since = toD(SINCE); let stuck = 0, lastH = 0;
  while (window.__st.rounds++ < 300) {
    collect();
    const dates = Object.values(window.__m).map(v => toD(v.pre)).filter(Boolean);
    if (dates.length && Math.min(...dates) < since) break;
    sc.scrollTop = 0; await new Promise(r => setTimeout(r, 1500));
    if (sc.scrollHeight === lastH && ++stuck > 5) break; lastH = sc.scrollHeight;
  }
  collect(); window.__st.running = false; window.__st.n = Object.keys(window.__m).length;
})();
"started — poll window.__st until running is false";
