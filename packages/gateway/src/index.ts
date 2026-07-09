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
export { readDxbMcpInventory, DXB_MCP_SERVER_NAME } from "./inventory.js";
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
} from "./generate-profiles.js";
