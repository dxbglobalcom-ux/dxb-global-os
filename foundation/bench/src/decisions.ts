// The pure decisions of SPEC §5b.8, exported so that tests pin them. This file
// is the contract's edge and nothing more: each function throws until it is
// built. What decides today stays where it is — the two-argument statusOf in
// instance.ts, the exposure and config checks in make.ts, answerOf in cli.ts.
import type { BenchContainer } from "./docker.ts";
import type { Status } from "./instance.ts";
import type { ListFile } from "./instances.ts";
import type { VolumeFacts } from "./removal.ts";

/** What the labelled containers, the labelled volumes and the list file say together (SPEC §5b.3, §5b.4). */
export function statusOf(containers: readonly BenchContainer[], labelled: readonly VolumeFacts[], list: ListFile): Status {
  throw new Error("not built: statusOf");
}

/** Every published port that is bound anywhere but the loopback address, each named; empty when none is. */
export function exposedBeyondLoopback(containers: readonly BenchContainer[]): string[] {
  throw new Error("not built: exposedBeyondLoopback");
}

/** What a stack config says that is not the bench — its project or one of its two ports — or undefined when it is the bench's. */
export function configMismatch(tomlText: string): string | undefined {
  throw new Error("not built: configMismatch");
}

/** The line and the exit code of a call that did not end well (SPEC §4, the command's table). */
export function answerOf(failure: unknown): { line: string; exit: number } {
  throw new Error("not built: answerOf");
}
