import { z } from "zod";

export const TaskEnvelope = z.object({
  department: z.string().min(1),
  objective: z.string().min(20),          // self-contained zorunluluğunun kaba bekçisi
  output_contract: z.string().min(10),
  model_tier: z.enum(["L1", "L2", "L3", "L4"]),
  approval_class: z.enum(["none", "internal", "outward"]).default("none"),
  budget: z.object({
    max_tokens: z.number().int().positive().default(200_000),
    max_cost_eur: z.number().positive().default(1.0),
  }).prefault({}), // zod v4: prefault({}) = v3 default({}) — boş girdi iç default'lardan geçer (LOCKED semantik)
  priority: z.number().int().min(0).max(9).default(0),
  parent_task_id: z.string().uuid().nullable().default(null),
});
export type TaskEnvelope = z.infer<typeof TaskEnvelope>;
