// Client helper for the settings control seam (E6.1). One function per
// action; both go through POST /api/control/settings with a mandatory
// Idempotency-Key so a network retry can never double-write.

export type ControlResult = {
  ok: boolean;
  change_id?: number | null;
  noop?: boolean;
  error?: string;
  detail?: string;
  approval_id?: string;
  current?: unknown;
};

async function callControlSettings(
  body: Record<string, unknown>,
  idempotencyKey?: string,
): Promise<ControlResult> {
  const response = await fetch("/api/control/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey ?? crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });
  return (await response.json()) as ControlResult;
}

export function setSetting(params: {
  key: string;
  value: unknown;
  scope?: string;
  expectedCurrent?: unknown;
  rationale?: string;
  idempotencyKey?: string;
}): Promise<ControlResult> {
  const { idempotencyKey, ...payload } = params;
  return callControlSettings(
    { action: "set", payload: { scope: "global", ...payload } },
    idempotencyKey,
  );
}

export function undoSetting(params: {
  changeId: number;
  idempotencyKey?: string;
}): Promise<ControlResult> {
  return callControlSettings(
    { action: "undo", payload: { changeId: params.changeId } },
    params.idempotencyKey,
  );
}
