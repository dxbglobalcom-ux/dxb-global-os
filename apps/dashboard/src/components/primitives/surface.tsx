import type { ElementType, ReactNode } from "react";

// Surface — the material base every Command Center element sits on
// (DESIGN_SYSTEM §4-5). Picks one of the six obsidian depth levels,
// an elevation, and optionally the mandatory top reflection (B2).
// Consumes SEMANTIC tokens only — never raw hex (§3 ⛔).

export type SurfaceLevel =
  | "void"
  | "obsidian"
  | "carbon"
  | "graphite"
  | "anthracite"
  | "titanium";

export type Elevation = "e0" | "e1" | "e2" | "e3";

const LEVEL_CLASS: Record<SurfaceLevel, string> = {
  void: "bg-surface-void",
  obsidian: "bg-surface-obsidian",
  carbon: "bg-surface-carbon",
  graphite: "bg-surface-graphite",
  anthracite: "bg-surface-anthracite",
  titanium: "bg-surface-titanium",
};

const ELEVATION_CLASS: Record<Elevation, string> = {
  e0: "",
  e1: "shadow-e1",
  e2: "shadow-e2",
  e3: "shadow-e3",
};

export function Surface({
  as: Tag = "div",
  level = "carbon",
  elevation = "e0",
  reflect = false,
  bordered = false,
  className = "",
  children,
}: {
  as?: ElementType;
  level?: SurfaceLevel;
  elevation?: Elevation;
  reflect?: boolean;
  bordered?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Tag
      className={`${LEVEL_CLASS[level]} ${ELEVATION_CLASS[elevation]} ${
        reflect ? "reflection" : ""
      } ${bordered ? "border border-edge-neutral" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
