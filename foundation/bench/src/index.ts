// The contract of @dxb-foundation/bench, whole: everything a caller may use is exported here.

export type { Identity, Queryable } from "./identity.ts";
export { readIdentity } from "./identity.ts";

export type { RefusalReason } from "./guard.ts";
export { TargetRefused, decide, assertFoundationTarget, guarded } from "./guard.ts";

export type { InstanceRecord, ListFile } from "./instances.ts";
export { defaultStatePath, readInstances } from "./instances.ts";

export type { HostLock } from "./lock.ts";
export { LockRefused, defaultLockPath, acquireHostLock, assertHeld } from "./lock.ts";

export type { ContainerFacts, PendingRecord, VolumeFacts } from "./removal.ts";
export { RemovalRefused, selectRemovalTargets } from "./removal.ts";

export type { BenchContainer } from "./docker.ts";
export { statusOf, exposedBeyondLoopback, configMismatch, answerOf } from "./decisions.ts";

export { BENCH, connectionString } from "./bench.ts";

export type { Status } from "./instance.ts";
export { instanceStatus, destroyInstance } from "./instance.ts";

export { InstanceStands, ExposureRefused, makeInstance } from "./make.ts";
