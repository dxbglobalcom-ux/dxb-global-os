// Answer-audio handoff directory, shared by two processes with different
// cwds: the scheduler (writer, repo root) and the dashboard route (reader,
// apps/dashboard). Env override first; else <repo-root>/var/voice with the
// repo root found by walking up to pnpm-workspace.yaml. Only SYNTHETIC
// answer WAVs ever land here — CEO question audio is processed in memory and
// never persisted (V9/§16: no biometric audio on disk).
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

export function repoRootFromCwd(start = process.cwd()): string {
  let dir = start;
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return start;
}

export function voiceAudioDir(): string {
  return process.env.DXB_VOICE_AUDIO_DIR ?? join(repoRootFromCwd(), "var", "voice");
}
