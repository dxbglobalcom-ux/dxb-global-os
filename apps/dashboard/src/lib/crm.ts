// CRM entity registry (DASH-04): ONE source for the four entity configs —
// columns the tables render, the CEO-editable whitelist (mirrors the
// crm_update door in migration 0017 — the DB raises on anything wider),
// and the zod schemas the server action validates with.
import { z } from "zod";

export type CrmEntity = "clients" | "requests" | "contacts" | "deals";

export const CRM_ENTITIES: CrmEntity[] = ["clients", "requests", "contacts", "deals"];

export const CRM_TABLES: Record<CrmEntity, string> = {
  clients: "crm_clients",
  requests: "crm_requests",
  contacts: "crm_contacts",
  deals: "crm_deals",
};

export const CLIENT_STATUS = ["lead", "active", "paused", "closed"] as const;
export const REQUEST_STATUS = ["new", "triaged", "in_progress", "delivered", "rejected"] as const;
export const DEAL_STAGE = ["open", "proposal", "won", "lost"] as const;

// Editable-field schemas — .strip() drops unknown keys at the action layer;
// the DB door additionally RAISEs, so drift between layers cannot pass.
export const CRM_EDIT_SCHEMAS: Record<CrmEntity, z.ZodType<Record<string, unknown>>> = {
  clients: z
    .object({
      name: z.string().trim().min(1).max(200).optional(),
      status: z.enum(CLIENT_STATUS).optional(),
    })
    .strip(),
  requests: z.object({ status: z.enum(REQUEST_STATUS).optional() }).strip(),
  contacts: z
    .object({
      name: z.string().trim().min(1).max(200).optional(),
      email: z.string().trim().email().max(320).nullable().optional(),
      phone: z.string().trim().max(40).nullable().optional(),
      role: z.string().trim().max(120).nullable().optional(),
    })
    .strip(),
  deals: z
    .object({
      title: z.string().trim().min(1).max(200).optional(),
      value_eur: z.number().nonnegative().max(9_999_999_999).nullable().optional(),
      stage: z.enum(DEAL_STAGE).optional(),
    })
    .strip(),
};

export const CRM_EDITABLE_FIELDS: Record<CrmEntity, string[]> = {
  clients: ["name", "status"],
  requests: ["status"],
  contacts: ["name", "email", "phone", "role"],
  deals: ["title", "value_eur", "stage"],
};

// Row shapes as the pages read them (superset union keeps the generic
// table simple; per-entity configs pick the columns).
export type CrmRow = {
  id: string;
  created_at: string;
  [key: string]: unknown;
};

export type CrmColumn = {
  key: string;
  kind: "text" | "mono" | "status" | "eur" | "date";
};

export const CRM_COLUMNS: Record<CrmEntity, CrmColumn[]> = {
  clients: [
    { key: "name", kind: "text" },
    { key: "status", kind: "status" },
    { key: "created_at", kind: "date" },
  ],
  requests: [
    { key: "summary", kind: "text" },
    { key: "client_name", kind: "text" },
    { key: "status", kind: "status" },
    { key: "created_at", kind: "date" },
  ],
  contacts: [
    { key: "name", kind: "text" },
    { key: "client_name", kind: "text" },
    { key: "email", kind: "mono" },
    { key: "role", kind: "text" },
  ],
  deals: [
    { key: "title", kind: "text" },
    { key: "client_name", kind: "text" },
    { key: "value_eur", kind: "eur" },
    { key: "stage", kind: "status" },
    { key: "created_at", kind: "date" },
  ],
};
