import { PACKAGE } from "@dxb/shared";

export const OWNER = "gateway" as const;
export { PACKAGE };

export {
  computeToolHash,
  pinAll,
  checkPins,
  type ToolInventoryEntry,
  type PinAllResult,
  type CheckPinsResult,
} from "./pin-check.js";
export {
  readDxbMcpInventory,
  readExternalServerInventory,
  readFullInventory,
  DXB_MCP_SERVER_NAME,
  type FullInventoryResult,
} from "./inventory.js";
// R2.2 — runtime consumption of the compiled profile layer (audit F-02/F-04).
export { resolveRuntimeProfile, mcpToolName, buildSdkToolOptions } from "./runtime-profile.js";
export type { RuntimeToolSurface, SdkToolOptions } from "./runtime-profile.js";
export {
  generateProfiles,
  generateProfilesFromPolicy,
  type DenialsMap,
  type ProfilePolicy,
  type ServerCatalogEntry,
  type GrantValue,
  type GenerateProfilesOptions,
  type GenerateProfilesResult,
  type DeptManifest,
  type EmployeeManifest,
  type LibraryLayer,
  type LibrarySubjectCaps,
} from "./generate-profiles.js";
export {
  readLibraryLayer,
  compileLibraryProfiles,
  type CompileLibraryProfilesResult,
} from "./library-profiles.js";
