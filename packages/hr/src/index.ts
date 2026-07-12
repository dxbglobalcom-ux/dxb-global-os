export { gatePersona, type GateResult, type GateFailure } from "./gate.js";
export {
  compilePersonaPrompt,
  type CompileInput,
  type CompileMode,
} from "./compiler.js";
export { PERSONA_SECTIONS, parsePersona, HOOK_VERSION_RE } from "./template.js";
export {
  hrPerformanceDaily,
  hrProbationCheck,
  hrStalePersonaScan,
  hrTrainingQueue,
} from "./jobs.js";
