// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Panel } from "../../apps/dashboard/src/components/panel.js";
import { FreshnessStamp } from "../../apps/dashboard/src/components/freshness-stamp.js";

// 08-02 Task 1 verify: Panel renders under both themes; FreshnessStamp
// degrades to the --warn "not live" state when the channel goes stale.
// Labels are {time} templates (A2 bilingual): en "as of {time}" puts the
// label first, tr "{time} itibarıyla" puts it last — both orders proven.
afterEach(cleanup);

const STAMP_LABELS = { asOfLabel: "as of {time}", notLiveLabel: "not live · last {time}" };

describe("Panel (Double-Bezel)", () => {
  it.each(["dark", "light"])("renders title + content under data-theme=%s", (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    render(
      <Panel title="Waiting on me">
        <p>content</p>
      </Panel>,
    );
    expect(screen.getByRole("heading", { name: "Waiting on me" })).toBeTruthy();
    expect(screen.getByText("content")).toBeTruthy();
  });
});

describe("FreshnessStamp degrade behavior", () => {
  it("live: shows mono time + asOf label (en order: label before time)", () => {
    const { container } = render(
      <FreshnessStamp
        state={{ status: "live", lastAt: new Date("2026-07-10T14:32:00") }}
        {...STAMP_LABELS}
      />,
    );
    expect(screen.getByText("14:32")).toBeTruthy();
    expect(container.textContent).toBe("as of 14:32");
    expect(screen.queryByText(/not live/)).toBeNull();
  });

  it("live: tr template order (time before label)", () => {
    const { container } = render(
      <FreshnessStamp
        state={{ status: "live", lastAt: new Date("2026-07-10T14:32:00") }}
        asOfLabel="{time} itibarıyla"
        notLiveLabel="canlı değil · son {time}"
      />,
    );
    expect(container.textContent).toBe("14:32 itibarıyla");
  });

  it("stale: flips to warn state with last-seen time", () => {
    const { container } = render(
      <FreshnessStamp
        state={{ status: "stale", lastAt: new Date("2026-07-10T14:32:00") }}
        {...STAMP_LABELS}
      />,
    );
    expect(container.textContent).toBe("not live · last 14:32");
    expect(screen.getByText("14:32")).toBeTruthy();
  });

  it("connecting with no message yet renders nothing (no fake freshness)", () => {
    const { container } = render(
      <FreshnessStamp state={{ status: "connecting", lastAt: null }} {...STAMP_LABELS} />,
    );
    expect(container.textContent).toBe("");
  });
});
