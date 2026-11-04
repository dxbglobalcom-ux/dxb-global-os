#!/usr/bin/env node
// One-off capture for the eye measurement: shows each page as it is experienced, through
// a recorded visit (rest, then scroll), frame sheets and raw numbers. Nothing here interprets.
//
//   node capture.mjs <pages.json> [--only slug,slug] [--jobs N]
//
// pages.json: [{slug, name, root, entry}]. Output: ~/.cache/dxb-goz-olcumu/raw/<slug>/.
// Without --only, pages whose output is complete are skipped, so a run can be resumed.
// The output is read blind: nothing in it may carry a page's name or path beyond the slug.

import { execFile } from 'node:child_process';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { chromium } from '@playwright/test';

const OUT_ROOT = path.join(os.homedir(), '.cache/dxb-goz-olcumu/raw');
const FFMPEG = '/home/dxb/.local/bin/ffmpeg';
const CHROME = '/usr/bin/google-chrome';
const LABEL_FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf';

const MAX_JOBS = 3; // memory: the CEO's own Chrome shares this machine
const LOAD_CAP_MS = 12_000;
const REST_MS = 4_000;
const SCROLL_CAP_MS = 45_000;
const END_HOLD_MS = 2_000;
const SCROLL_PX_PER_S = 700;
const WHEEL_STEP_MS = 30;
const SCROLL_PROBE_MS = 250;
const WHEEL_TRIAL_MS = 1_200; // phone: wheel events get this long to move the page
const SCROLL_STALL_MS = 2_000;
const PAGE_BUDGET_MS = 6 * 60_000;

const SCENE_CUT_SCORE = 0.3;
const NEAR_IDENTICAL_YDIF = 0.05;
const UNIFORM_FRAME_STD = 2; // luma stddev of a 64x64 thumbnail
const BLANK_UNIFORM_PCT = 90;
const FRAME_SIDE = 64;
const MARK_DARK_MS = 1_500;
const MARK_WHITE_MS = 300; // long enough that the page's first paint cannot swallow the white

const LABEL_STRIP_PX = 28;
const SHEET_GAP_PX = 4;
const REQUEST_URL_MAX = 200;
const ERROR_LIST_MAX = 50;

const VIEWPORTS = [
  {
    name: 'desktop',
    size: { width: 1440, height: 900 },
    context: { viewport: { width: 1440, height: 900 } },
    grid: { cols: 3, rows: 3, sheets: 2, frameWidth: 516 },
    wheelFallback: false,
  },
  {
    name: 'phone',
    size: { width: 390, height: 844 },
    context: {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36',
    },
    grid: { cols: 6, rows: 2, sheets: 1, frameWidth: 256 },
    wheelFallback: true,
  },
];

const OUTPUT_FILES = [
  'hero.png',
  ...VIEWPORTS.flatMap(({ name, grid }) => [
    `${name}.mp4`,
    ...Array.from({ length: grid.sheets }, (_, i) => `sheet-${name}-${i + 1}.jpg`),
  ]),
  'numbers.json',
  'meta.json',
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

const execFileAsync = promisify(execFile);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const round = (value, digits = 3) => Number(value.toFixed(digits));

// ---- static server ----------------------------------------------------------------------

async function serveFile(root, req, res) {
  let relative;
  try {
    relative = decodeURIComponent(new URL(req.url, 'http://local').pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  let file = path.join(root, relative);
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(404).end();
    return;
  }
  let stat;
  try {
    stat = await fs.stat(file);
    if (stat.isDirectory()) {
      file = path.join(file, 'index.html');
      stat = await fs.stat(file);
    }
  } catch {
    res.writeHead(404).end();
    return;
  }

  const headers = {
    'Content-Type': MIME_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store',
  };
  let start = 0;
  let end = stat.size - 1;
  let status = 200;
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
  if (range && (range[1] || range[2])) {
    start = range[1] ? Number(range[1]) : Math.max(stat.size - Number(range[2]), 0);
    if (range[1] && range[2]) end = Math.min(Number(range[2]), end);
    if (start >= stat.size || start > end) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end();
      return;
    }
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length'] = stat.size === 0 ? 0 : end - start + 1;
  res.writeHead(status, headers);
  if (req.method === 'HEAD' || stat.size === 0) {
    res.end();
    return;
  }
  // The browser aborts media requests as a matter of course; that is not a server error.
  pipeline(createReadStream(file, { start, end }), res, () => {});
}

export async function startStaticServer(root) {
  const webRoot = path.resolve(root);
  const server = http.createServer((req, res) => {
    serveFile(webRoot, req, res).catch(() => res.destroy());
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: async () => {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

// ---- pure measurement helpers -----------------------------------------------------------

export function blindText(text, origin, entry) {
  return text.replaceAll(origin, '').replaceAll(encodeURI(entry), '<entry>').replaceAll(entry, '<entry>');
}

// Parses `metadata=print` output. A freeze still open at the end runs to the video's end.
export function parseFrameMetadata(text, videoSeconds) {
  const frames = [];
  const freezes = [];
  let openFreezeStart = null;
  for (const line of text.split('\n')) {
    const header = /^frame:\d+\s+pts:\S+\s+pts_time:(\S+)/.exec(line);
    if (header) {
      frames.push({ t: Number(header[1]), ydif: 0, scene: 0 });
      continue;
    }
    const [key, value] = line.split('=');
    const frame = frames.at(-1);
    if (key === 'lavfi.signalstats.YDIF') frame.ydif = Number(value);
    else if (key === 'lavfi.scene_score') frame.scene = Number(value);
    else if (key === 'lavfi.freezedetect.freeze_start') openFreezeStart = Number(value);
    else if (key === 'lavfi.freezedetect.freeze_end') {
      freezes.push([openFreezeStart, Number(value)]);
      openFreezeStart = null;
    }
  }
  if (openFreezeStart !== null) freezes.push([openFreezeStart, videoSeconds]);
  return { frames, freezes };
}

export function summarisePhase(frames, freezes, [start, end]) {
  const inside = frames.filter(({ t }) => t >= start && t < end);
  const sorted = inside.map(({ ydif }) => ydif).sort((a, b) => a - b);
  const total = sorted.reduce((sum, ydif) => sum + ydif, 0);
  const nearIdentical = inside.filter(({ ydif }) => ydif < NEAR_IDENTICAL_YDIF).length;
  return {
    seconds: round(end - start, 2),
    frames: inside.length,
    ydifMean: inside.length ? round(total / inside.length) : null,
    ydifP95: inside.length ? round(sorted[Math.ceil(0.95 * sorted.length) - 1]) : null,
    sceneCuts: inside.filter(({ scene }) => scene > SCENE_CUT_SCORE).length,
    freezes: freezes
      .filter(([from, to]) => from < end && to > start)
      .map(([from, to]) => [round(Math.max(from, start), 2), round(Math.min(to, end), 2)]),
    nearIdenticalPct: inside.length ? round((100 * nearIdentical) / inside.length, 1) : null,
  };
}

export function phaseAt(t, phases) {
  return Object.entries(phases).findLast(([, [start]]) => t >= start)[0];
}

export function sampleTimes(seconds, count) {
  return Array.from({ length: count }, (_, i) => ((i + 0.5) * seconds) / count);
}

export async function isComplete(dir) {
  const present = await Promise.all(
    OUTPUT_FILES.map((file) => fs.access(path.join(dir, file)).then(() => true, () => false)),
  );
  return present.every(Boolean);
}

// ---- the visit --------------------------------------------------------------------------

// Runs in the page; counts WebGL contexts as they are made, so one lost later still counts.
function countWebglContexts() {
  const original = HTMLCanvasElement.prototype.getContext;
  const seen = new WeakSet();
  const tally = { made: 0, refused: 0 };
  Object.defineProperty(window, '__gozWebgl', { value: tally });
  HTMLCanvasElement.prototype.getContext = function getContext(type, ...rest) {
    const context = original.call(this, type, ...rest);
    if (/^(experimental-)?webgl2?$/.test(type)) {
      if (!context) tally.refused += 1;
      else if (!seen.has(context)) {
        seen.add(context);
        tally.made += 1;
      }
    }
    return context;
  };
}

// The recorder's clock starts at the first frame painted after its stream comes alive, some
// hundred ms after the tab opens, and no caller is told when. So the blank tab paints a band
// of dark frames, repainted every frame to outlast that delay, then white. The dark-to-white
// edge in the video ties wall-clock phases to video time. Returns the wall time of the white.
function paintAlignmentMark(page, darkMs, whiteMs) {
  return page.evaluate(
    async ([dark, white]) => {
      const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
      const { style } = document.documentElement;
      const darkEnd = Date.now() + dark;
      for (let i = 0; Date.now() < darkEnd; i += 1) {
        style.background = i % 2 ? '#000' : '#040404';
        await nextFrame();
      }
      style.background = '#fff';
      await nextFrame();
      await nextFrame();
      const whitePainted = Date.now();
      await new Promise((resolve) => setTimeout(resolve, white));
      return whitePainted;
    },
    [darkMs, whiteMs],
  );
}

function collectEvidence(page, cdp, site) {
  const evidence = { consoleErrors: [], failedRequests: [], bytesByRequest: new Map() };
  const blind = (text) => blindText(text, site.origin, site.entry);
  const shortUrl = (url) => blind(url).slice(0, REQUEST_URL_MAX);

  page.on('console', (message) => {
    if (message.type() === 'error') evidence.consoleErrors.push(blind(message.text()));
  });
  page.on('pageerror', (error) => evidence.consoleErrors.push(blind(String(error.stack ?? error))));
  page.on('requestfailed', (request) => {
    evidence.failedRequests.push({ url: shortUrl(request.url()), failure: request.failure()?.errorText });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) evidence.failedRequests.push({ url: shortUrl(response.url()), status: response.status() });
  });
  cdp.on('Network.dataReceived', ({ requestId, encodedDataLength }) => {
    evidence.bytesByRequest.set(requestId, (evidence.bytesByRequest.get(requestId) ?? 0) + encodedDataLength);
  });
  cdp.on('Network.loadingFinished', ({ requestId, encodedDataLength }) => {
    evidence.bytesByRequest.set(requestId, encodedDataLength);
  });
  return evidence;
}

async function waitForQuiet(page, notes) {
  const deadline = Date.now() + LOAD_CAP_MS;
  for (const state of ['load', 'networkidle']) {
    try {
      await page.waitForLoadState(state, { timeout: Math.max(deadline - Date.now(), 1) });
    } catch {
      notes.push(`${state} not reached within the ${LOAD_CAP_MS / 1000} s cap`);
    }
  }
}

function readScroll(page) {
  return page.evaluate(() => {
    const root = document.scrollingElement ?? document.documentElement;
    return { y: window.scrollY, height: root.scrollHeight, viewport: window.innerHeight };
  });
}

const atBottom = ({ y, viewport, height }) => y + viewport >= height - 4;

// Steady wheel scroll to the bottom. Ends early only when the page really moved and reached
// its end, so a scroll-jacked page keeps being wheeled for the whole cap.
async function scrollThrough(page, viewport, notes) {
  const started = Date.now();
  await page.mouse.move(viewport.size.width / 2, viewport.size.height / 2);
  const first = await readScroll(page);
  let state = first;
  let method = 'wheel';
  let moved = false;
  let speed = SCROLL_PX_PER_S;
  let lastProbe = started;
  let lastMove = started;
  let lastStep = started;
  let stallNoted = false;
  let carry = 0;

  for (let now = started; now - started < SCROLL_CAP_MS; now = Date.now()) {
    if (now - lastProbe >= SCROLL_PROBE_MS) {
      lastProbe = now;
      const previousY = state.y;
      state = await readScroll(page);
      if (state.y !== previousY) {
        moved = true;
        lastMove = now;
        stallNoted = false;
      }
      if (moved && atBottom(state)) break;
      if (!stallNoted && now - lastMove >= SCROLL_STALL_MS) {
        notes.push(`scrollY stayed at ${Math.round(state.y)} of ${state.height} from ${((lastMove - started) / 1000).toFixed(1)} s into the scroll`);
        stallNoted = true;
      }
      if (viewport.wheelFallback && method === 'wheel' && !moved && now - started >= WHEEL_TRIAL_MS) {
        method = 'scrollBy';
        notes.push('page ignored wheel events; switched to window.scrollBy steps');
      }
      const secondsLeft = Math.max((SCROLL_CAP_MS - (now - started)) / 1000 - 1, 0.5);
      speed = Math.max(SCROLL_PX_PER_S, (state.height - state.viewport - state.y) / secondsLeft);
    }

    const wanted = (speed * (now - lastStep)) / 1000 + carry;
    const step = Math.round(wanted);
    carry = wanted - step;
    lastStep = now;
    if (step > 0) {
      if (method === 'wheel') await page.mouse.wheel(0, step);
      else await page.evaluate((top) => window.scrollBy({ top, behavior: 'instant' }), step);
    }
    await sleep(WHEEL_STEP_MS);
  }

  state = await readScroll(page);
  return {
    method,
    moved: moved || state.y !== first.y,
    startY: Math.round(first.y),
    endY: Math.round(state.y),
    scrollHeight: state.height,
    reachedBottom: atBottom(state),
    pxPerSecondAtEnd: Math.round(speed),
  };
}

async function recordVisit(browser, viewport, site, workDir, heroPath) {
  const context = await browser.newContext({
    ...viewport.context,
    locale: 'tr-TR',
    reducedMotion: 'no-preference',
    recordVideo: { dir: workDir, size: viewport.size },
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  const evidence = collectEvidence(page, cdp, site);
  await page.addInitScript(countWebglContexts);

  const notes = [];
  const clock = { whitePainted: await paintAlignmentMark(page, MARK_DARK_MS, MARK_WHITE_MS) };
  clock.zero = clock.whitePainted + MARK_WHITE_MS;
  try {
    await page.goto(site.url ?? `${site.origin}/${encodeURI(site.entry)}`, { waitUntil: 'commit', timeout: LOAD_CAP_MS });
    await waitForQuiet(page, notes);
  } catch (error) {
    notes.push(`navigation failed: ${blindText(error.message, site.origin, site.entry)}`);
  }

  clock.restStart = Date.now();
  await sleep(REST_MS);
  clock.restEnd = Date.now();
  // Taken after the rest window so the shot cannot disturb the rest numbers.
  if (heroPath) await page.screenshot({ path: heroPath });

  clock.scrollStart = Date.now();
  const scroll = await scrollThrough(page, viewport, notes);
  clock.scrollEnd = Date.now();
  await sleep(END_HOLD_MS);
  clock.holdEnd = Date.now();

  const pageFacts = await page.evaluate(() => ({
    canvas: document.querySelectorAll('canvas').length,
    video: document.querySelectorAll('video').length,
    img: document.querySelectorAll('img').length,
    webglContexts: window.__gozWebgl?.made ?? 0,
    webglRefused: window.__gozWebgl?.refused ?? 0,
    loadMs: Math.round(performance.getEntriesByType('navigation')[0]?.loadEventEnd ?? 0) || null,
  }));
  const videoPath = await page.video().path();
  const bytes = [...evidence.bytesByRequest.values()].reduce((sum, size) => sum + size, 0);
  const { consoleErrors, failedRequests } = evidence; // snapshot before close aborts what is in flight
  const snapshot = { consoleErrors: [...consoleErrors], failedRequests: [...failedRequests] };
  await context.close();

  return { videoPath, clock, scroll, notes, pageFacts: { ...pageFacts, transferredBytes: bytes }, ...snapshot };
}

// ---- video processing -------------------------------------------------------------------

async function ffmpeg(args, encoding = 'utf8') {
  const { stdout } = await execFileAsync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    encoding,
    maxBuffer: 512 * 1024 * 1024,
    timeout: 180_000,
  });
  return stdout;
}

async function findAlignmentMark(webm) {
  const text = await ffmpeg([
    '-t', '10', '-i', webm,
    '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-',
    '-an', '-f', 'null', '-',
  ]);
  let time = 0;
  let sawDark = false;
  for (const line of text.split('\n')) {
    const header = /pts_time:(\S+)/.exec(line);
    if (header) time = Number(header[1]);
    else if (line.startsWith('lavfi.signalstats.YAVG=')) {
      const luma = Number(line.split('=')[1]);
      if (luma < 40) sawDark = true;
      else if (sawDark && luma > 200) return time;
    }
  }
  throw new Error(`alignment mark not found in the recording (dark band ${sawDark ? 'seen' : 'not seen'})`);
}

function transcode(webm, mp4, startSeconds, seconds) {
  return ffmpeg([
    '-ss', String(startSeconds), '-i', webm, '-t', String(seconds),
    '-map_metadata', '-1', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18',
    '-pix_fmt', 'yuv420p', '-threads', '4', '-movflags', '+faststart', mp4,
  ]);
}

async function measureFrames(mp4, seconds) {
  const text = await ffmpeg([
    '-i', mp4,
    '-vf', "signalstats,select='gte(scene,0)',freezedetect=n=-60dB:d=0.5,metadata=print:file=-",
    '-an', '-f', 'null', '-',
  ]);
  return parseFrameMetadata(text, seconds);
}

async function uniformFramesPct(mp4, fromSeconds) {
  const raw = await ffmpeg(
    [
      '-ss', String(fromSeconds), '-i', mp4,
      '-vf', `fps=2,scale=${FRAME_SIDE}:${FRAME_SIDE},format=gray`,
      '-f', 'rawvideo', '-',
    ],
    'buffer',
  );
  const pixels = FRAME_SIDE * FRAME_SIDE;
  const count = Math.floor(raw.length / pixels);
  let uniform = 0;
  for (let frame = 0; frame < count; frame += 1) {
    const values = raw.subarray(frame * pixels, (frame + 1) * pixels);
    const mean = values.reduce((sum, value) => sum + value, 0) / pixels;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / pixels;
    if (Math.sqrt(variance) < UNIFORM_FRAME_STD) uniform += 1;
  }
  return count ? round((100 * uniform) / count, 1) : 100;
}

async function buildSheets(mp4, viewport, phases, outDir, workDir) {
  const { cols, rows, sheets, frameWidth } = viewport.grid;
  const perSheet = cols * rows;
  const times = sampleTimes(phases.hold[1], perSheet * sheets);
  for (let sheet = 0; sheet < sheets; sheet += 1) {
    const frameDir = await fs.mkdtemp(path.join(workDir, 'frames-'));
    for (let cell = 0; cell < perSheet; cell += 1) {
      const t = times[sheet * perSheet + cell];
      const label = `t=${t.toFixed(1)}s ${phaseAt(t, phases)}`;
      await ffmpeg([
        '-ss', t.toFixed(3), '-i', mp4, '-frames:v', '1',
        '-vf',
        `scale=${frameWidth}:-2:flags=lanczos,pad=iw:ih+${LABEL_STRIP_PX}:0:${LABEL_STRIP_PX}:black,` +
          `drawtext=fontfile=${LABEL_FONT}:text='${label}':x=6:y=5:fontsize=18:fontcolor=white`,
        path.join(frameDir, `${String(cell).padStart(2, '0')}.png`),
      ]);
    }
    await ffmpeg([
      '-framerate', '1', '-i', path.join(frameDir, '%02d.png'),
      '-vf', `tile=${cols}x${rows}:padding=${SHEET_GAP_PX}:color=0x444444`,
      '-frames:v', '1', '-q:v', '3',
      path.join(outDir, `sheet-${viewport.name}-${sheet + 1}.jpg`),
    ]);
  }
}

async function processVisit(visit, viewport, outDir, workDir) {
  const { clock } = visit;
  const fromZero = (wall) => round((wall - clock.zero) / 1000, 2);
  const phases = {
    load: [0, fromZero(clock.restStart)],
    rest: [fromZero(clock.restStart), fromZero(clock.restEnd)],
    scroll: [fromZero(clock.scrollStart), fromZero(clock.scrollEnd)],
    hold: [fromZero(clock.scrollEnd), fromZero(clock.holdEnd)],
  };
  const mark = await findAlignmentMark(visit.videoPath);
  const mp4 = path.join(outDir, `${viewport.name}.mp4`);
  await transcode(visit.videoPath, mp4, mark + MARK_WHITE_MS / 1000, phases.hold[1]);

  const { frames, freezes } = await measureFrames(mp4, phases.hold[1]);
  await buildSheets(mp4, viewport, phases, outDir, workDir);
  const uniformPct = await uniformFramesPct(mp4, phases.rest[0]);

  return {
    numbers: {
      rest: summarisePhase(frames, freezes, phases.rest),
      scroll: summarisePhase(frames, freezes, phases.scroll),
      page: {
        scrollHeight: visit.scroll.scrollHeight,
        ...visit.pageFacts,
        consoleErrors: visit.consoleErrors.length,
        failedRequests: visit.failedRequests.length,
      },
    },
    meta: {
      startedAt: new Date(clock.zero).toISOString(),
      phases,
      scroll: visit.scroll,
      notes: visit.notes,
      consoleErrors: visit.consoleErrors.slice(0, ERROR_LIST_MAX),
      failedRequests: visit.failedRequests.slice(0, ERROR_LIST_MAX),
      uniformFramesPct: uniformPct,
      blank: uniformPct >= BLANK_UNIFORM_PCT,
    },
  };
}

// ---- one page, then all pages -----------------------------------------------------------

export async function capturePage(spec, outRoot = OUT_ROOT) {
  const started = Date.now();
  const outDir = path.join(outRoot, spec.slug);
  await fs.mkdir(outDir, { recursive: true });
  await fs.rm(path.join(outDir, 'meta.json'), { force: true }); // an interrupted redo must not look complete

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dxb-goz-'));
  const server = await startStaticServer(spec.root);
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: [
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });
  // Closing the browser rejects whatever a hung page left waiting.
  const watchdog = setTimeout(() => browser.close(), PAGE_BUDGET_MS);
  try {
    const site = { origin: server.origin, entry: spec.entry, url: spec.url }; // url: a live reference site
    const numbers = {};
    const meta = { slug: spec.slug };
    for (const viewport of VIEWPORTS) {
      const heroPath = viewport.name === 'desktop' ? path.join(outDir, 'hero.png') : null;
      const visit = await recordVisit(browser, viewport, site, workDir, heroPath);
      const result = await processVisit(visit, viewport, outDir, workDir);
      numbers[viewport.name] = result.numbers;
      meta[viewport.name] = result.meta;
    }
    meta.blank = VIEWPORTS.some(({ name }) => meta[name].blank);
    meta.elapsedSeconds = round((Date.now() - started) / 1000, 1);
    await fs.writeFile(path.join(outDir, 'numbers.json'), `${JSON.stringify(numbers, null, 2)}\n`);
    await fs.writeFile(path.join(outDir, 'meta.tmp'), `${JSON.stringify(meta, null, 2)}\n`);
    await fs.rename(path.join(outDir, 'meta.tmp'), path.join(outDir, 'meta.json'));
    return meta;
  } finally {
    clearTimeout(watchdog);
    await browser.close();
    await server.close();
    await fs.rm(workDir, { recursive: true, force: true });
  }
}

function parseArgs(argv) {
  const [pagesFile, ...flags] = argv;
  if (!pagesFile) throw new Error('usage: capture.mjs <pages.json> [--only slug,slug] [--jobs N]');
  const options = { pagesFile, only: null, jobs: 2 };
  for (let i = 0; i < flags.length; i += 2) {
    if (flags[i] === '--only') options.only = flags[i + 1].split(',');
    else if (flags[i] === '--jobs') {
      options.jobs = Math.min(Number(flags[i + 1]), MAX_JOBS);
      if (!(options.jobs >= 1)) throw new Error(`--jobs needs a number, got ${flags[i + 1]}`);
    }
    else throw new Error(`unknown flag ${flags[i]}`);
  }
  return options;
}

async function pagesToRun(options) {
  const pages = JSON.parse(await fs.readFile(options.pagesFile, 'utf8'));
  if (options.only) {
    const unknown = options.only.filter((slug) => !pages.some((page) => page.slug === slug));
    if (unknown.length) throw new Error(`unknown slug: ${unknown.join(', ')}`);
    return pages.filter((page) => options.only.includes(page.slug));
  }
  const pending = [];
  for (const page of pages) {
    if (await isComplete(path.join(OUT_ROOT, page.slug))) console.log(`${page.slug} already complete, skipped`);
    else pending.push(page);
  }
  return pending;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const queue = await pagesToRun(options);
  const failed = [];
  const worker = async () => {
    for (let page = queue.shift(); page; page = queue.shift()) {
      try {
        const meta = await capturePage(page);
        console.log(`${page.slug} done in ${meta.elapsedSeconds} s${meta.blank ? ' (BLANK)' : ''}`);
      } catch (error) {
        failed.push(page.slug);
        console.error(`${page.slug} FAILED: ${error.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: options.jobs }, worker));
  if (failed.length) {
    console.error(`failed: ${failed.join(', ')}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
