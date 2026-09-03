// B43 — the studio's measuring eye, shared by the dxb-mcp `media` group (an
// expert asks "show me frames 0 / 5 / 10 s of this take") and the resident
// media lane (every finished job records what it produced). ffprobe/ffmpeg
// are the holding's own binaries on this station (~/.local/bin); a service
// unit's PATH may not carry that directory, so the binary is resolved here
// once, explicitly, instead of trusting the environment.
import { accessSync, constants, mkdirSync } from "node:fs";
import { execFile } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

export function resolveMediaBinary(name: "ffmpeg" | "ffprobe"): string {
  const override = process.env[`DXB_${name.toUpperCase()}`];
  const candidates = [
    ...(override ? [override] : []),
    join(homedir(), ".local", "bin", name),
    `/usr/local/bin/${name}`,
    `/usr/bin/${name}`,
  ];
  for (const c of candidates) {
    try {
      accessSync(c, constants.X_OK);
      return c;
    } catch {
      /* next */
    }
  }
  return name; // PATH lookup as the last resort — spawn reports the failure
}

export interface MediaProbeSummary {
  path: string;
  duration_s: number | null;
  size_bytes: number | null;
  video: { codec: string; width: number; height: number; fps: number | null; frames: number | null } | null;
  audio: { codec: string; channels: number | null; sample_rate: number | null } | null;
}

/** ffprobe → one compact summary (never the raw JSON: an expert reads numbers, not a dump). */
export async function probeMedia(path: string): Promise<MediaProbeSummary> {
  const { stdout } = await run(
    resolveMediaBinary("ffprobe"),
    ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", path],
    { maxBuffer: 4 * 1024 * 1024 },
  );
  const j = JSON.parse(stdout) as {
    format?: { duration?: string; size?: string };
    streams?: Array<Record<string, unknown>>;
  };
  const v = (j.streams ?? []).find((s) => s.codec_type === "video");
  const a = (j.streams ?? []).find((s) => s.codec_type === "audio");
  const fps = (() => {
    const r = typeof v?.r_frame_rate === "string" ? v.r_frame_rate : null;
    if (!r || !r.includes("/")) return null;
    const [n, d] = r.split("/").map(Number);
    return d ? Math.round((n / d) * 1000) / 1000 : null;
  })();
  return {
    path,
    duration_s: j.format?.duration ? Number(j.format.duration) : null,
    size_bytes: j.format?.size ? Number(j.format.size) : null,
    video: v
      ? {
          codec: String(v.codec_name ?? ""),
          width: Number(v.width ?? 0),
          height: Number(v.height ?? 0),
          fps,
          frames: v.nb_frames ? Number(v.nb_frames) : null,
        }
      : null,
    audio: a
      ? {
          codec: String(a.codec_name ?? ""),
          channels: a.channels ? Number(a.channels) : null,
          sample_rate: a.sample_rate ? Number(a.sample_rate) : null,
        }
      : null,
  };
}

/** One PNG per requested second, long edge capped (an expert's eye needs the
 *  picture, the conversation does not need 8 MB of it). Returns the files written. */
export async function extractFrames(
  path: string,
  atSeconds: number[],
  outDir: string,
  maxEdge = 640,
): Promise<string[]> {
  mkdirSync(outDir, { recursive: true });
  const ffmpeg = resolveMediaBinary("ffmpeg");
  const out: string[] = [];
  for (const t of atSeconds) {
    const file = join(outDir, `frame_${t.toFixed(2).replace(".", "_")}s.png`);
    await run(ffmpeg, [
      "-y", "-v", "error", "-ss", String(t), "-i", path, "-frames:v", "1",
      "-vf", `scale='if(gt(iw,ih),min(iw,${maxEdge}),-2)':'if(gt(iw,ih),-2,min(ih,${maxEdge}))'`,
      file,
    ]);
    out.push(file);
  }
  return out;
}
