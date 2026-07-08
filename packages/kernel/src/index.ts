import { PACKAGE } from "@dxb/shared";

export const OWNER = "kernel" as const;
export { PACKAGE };

export { ClassifiedIntent, classify } from "./classify.js";
export { loadPolicy, route, NoRouteError } from "./policy.js";
export type { ResolvedRoute, RoutingRule } from "./policy.js";
