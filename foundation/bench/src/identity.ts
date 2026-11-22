import { NotBuilt } from "./not-built.ts";

export type Identity = { sysid: string; dboid: string; dbname: string };

/** Anything that can run one SQL text — a `pg` Client satisfies it. */
export type Queryable = { query(text: string): Promise<{ rows: Record<string, unknown>[] }> };

export function readIdentity(conn: Queryable): Promise<Identity> {
  throw new NotBuilt("readIdentity");
}
