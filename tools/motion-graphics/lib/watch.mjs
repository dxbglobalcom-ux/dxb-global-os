// dxb-motion-graphics — the watch `run` sets over each tool it starts. `run` waits for a tool without
// an event loop, so by itself it can send one signal and then only wait; this process of its own sends
// two. At the limit the tool is asked to end (SIGTERM: it may still close what it opened), and a tool
// still there after the grace is ended by the signal no process can ignore (SIGKILL). The tool reads
// and writes through this process's own three streams; how it went is written to descriptor 3 as JSON:
// { late, code, signal }, or { late, error } for a tool that could not be started.
// Started as: node watch.mjs <limit ms> <grace ms> <cmd> <args…>
import { spawn } from "node:child_process";
import { writeSync } from "node:fs";

const [limitMs, graceMs, cmd, ...args] = process.argv.slice(2);
const tool = spawn(cmd, args, { stdio: "inherit" });
let late = false;
const went = (how) => {
  writeSync(3, JSON.stringify({ late, ...how }));
  process.exit(0);
};
tool.on("error", (e) => went({ error: e.message }));
tool.on("exit", (code, signal) => went({ code, signal }));
setTimeout(() => {
  late = true;
  tool.kill("SIGTERM");
  setTimeout(() => tool.kill("SIGKILL"), Number(graceMs));
}, Number(limitMs));
