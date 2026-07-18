import { Panel } from "@/components/primitives";

// E12.3 — (command) route-group loading state (CC-SPEC §17/§34: skeleton,
// never a spinner). Composed from the certified Panel loading skeleton
// (DESIGN_SYSTEM state matrix; specimen on /design-preview) so every route
// paints structure instead of a blank while its RSC queries run.
export default function CommandLoading() {
  return (
    <div className="mx-auto max-w-[1720px] space-y-6" aria-busy="true">
      <div className="skeleton h-9 w-72" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel state="loading" className="md:col-span-2">
          <span />
        </Panel>
        <Panel state="loading">
          <span />
        </Panel>
        <Panel state="loading">
          <span />
        </Panel>
        <Panel state="loading">
          <span />
        </Panel>
        <Panel state="loading">
          <span />
        </Panel>
      </div>
    </div>
  );
}
