// Shared stub response (MCP-01): surface exists NOW; bodies arrive in their
// owning phases. A stub call is a clean tool error — never a silent no-op,
// never a DB touch.
export function stubError(group: string) {
  return {
    isError: true as const,
    content: [
      {
        type: "text" as const,
        text: `${group} tools are not yet active in this phase (arrives in its own phase)`,
      },
    ],
  };
}
