// usage: node decide-in-package.ts <a bench package under the temporary directory> <sysid> [twice]
//
// Loads THAT package (not the repository's), asks it to decide on the identity
// `(sysid, 5, postgres)` against an empty list, and prints `DECIDED <json>`.
// With `twice`, it deletes the package's refused.json after the first answer and
// asks again. Any throw leaves through the process: no DECIDED line, exit not 0.
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { pathToFileURL } from "node:url";

const [packageDir, sysid, twice] = process.argv.slice(2);
if (packageDir === undefined || sysid === undefined) {
  console.error("usage: decide-in-package.ts <package dir> <sysid> [twice]");
  process.exit(64);
}
// This script deletes a file: it works on a throwaway copy and nowhere else.
if (!packageDir.startsWith(tmpdir() + sep)) {
  console.error(`refused: ${packageDir} is not under the temporary directory`);
  process.exit(64);
}

const bench = (await import(pathToFileURL(join(packageDir, "src", "index.ts")).href)) as
  typeof import("@dxb-foundation/bench");
const identity = { sysid, dboid: "5", dbname: "postgres" };

console.log(`DECIDED ${JSON.stringify(bench.decide(identity, []))}`);
if (twice === "twice") {
  rmSync(join(packageDir, "refused.json"));
  console.log(`DECIDED ${JSON.stringify(bench.decide(identity, []))}`);
}
