// usage: node say-default-paths.ts
//
// Prints `PATHS <json>` — where the bench keeps its list and its host lock, as
// THIS process answers it: the test starts it with an environment of its own
// choosing, to see that no variable moves either path.
import { defaultLockPath, defaultStatePath } from "@dxb-foundation/bench";

console.log(`PATHS ${JSON.stringify({ list: defaultStatePath(), lock: defaultLockPath() })}`);
