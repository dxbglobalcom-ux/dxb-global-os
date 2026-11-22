// usage: node hold-lock.ts <lock path> [<milliseconds to hold>]
//
// Takes the host lock at the path through the bench's own acquireHostLock, says
// HELD on stdout, and holds it — for the given time, or until its stdin closes;
// then it releases and exits 0. Killed, it releases nothing itself: whatever
// frees the lock then is the kernel.
import { acquireHostLock } from "@dxb-foundation/bench";

const [path, holdMilliseconds] = process.argv.slice(2);
if (path === undefined) {
  console.error("usage: hold-lock.ts <lock path> [<milliseconds to hold>]");
  process.exit(64);
}

const lock = acquireHostLock({ path });
process.stdout.write("HELD\n");

const letGo = (): void => {
  lock.release();
  process.exit(0);
};
if (holdMilliseconds !== undefined) {
  setTimeout(letGo, Number(holdMilliseconds));
} else {
  process.stdin.resume();
  process.stdin.on("end", letGo);
}
