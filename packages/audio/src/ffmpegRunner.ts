import { spawn } from "node:child_process";

export type AudioProcessRunner = (
  command: string,
  args: string[]
) => Promise<void>;

export class AudioProcessError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AudioProcessError";
  }
}

export function isMissingExecutableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const maybeError = error as { code?: unknown; message?: unknown };
  return (
    maybeError.code === "ENOENT" ||
    (typeof maybeError.message === "string" && maybeError.message.includes("ENOENT"))
  );
}

export const ffmpegNotFoundMessage =
  "FFmpeg not found. Install FFmpeg or provide an already-compatible .ogg audio source.";

export const runAudioProcess: AudioProcessRunner = (command, args) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";

    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        reject(new AudioProcessError(ffmpegNotFoundMessage, error));
        return;
      }
      reject(new AudioProcessError(`Failed to start audio process: ${error.message}`, error));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const details = stderr.trim();
      reject(
        new AudioProcessError(
          `FFmpeg conversion failed with exit code ${code}.${details ? ` ${details}` : ""}`
        )
      );
    });
  });
};
