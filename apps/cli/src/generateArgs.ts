export type GenerateOptions = {
  trackIndex?: number;
  outDir: string;
  audioFile?: string;
  audioSource?: string;
};

export function parseGenerateArgs(
  rawArgs: string[]
): { file: string; options: GenerateOptions } | { help: true } {
  const helpFlags = new Set(["--help", "-h"]);
  if (rawArgs.some((a) => helpFlags.has(a))) {
    return { help: true };
  }

  // First pass: extract option values so they are not treated as the file
  const consumed = new Set<number>();
  const options: GenerateOptions = { outDir: "" };

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === "--track") {
      const next = rawArgs[++i];
      if (next === undefined) {
        throw new Error("--track requires a track index.");
      }
      const idx = Number(next);
      if (!Number.isInteger(idx)) {
        throw new Error(`Invalid track index: ${next}`);
      }
      options.trackIndex = idx;
      consumed.add(i - 1);
      consumed.add(i);
    } else if (arg === "--out") {
      const next = rawArgs[++i];
      if (next === undefined) {
        throw new Error("--out requires an output directory.");
      }
      options.outDir = next;
      consumed.add(i - 1);
      consumed.add(i);
    } else if (arg === "--audio") {
      const next = rawArgs[++i];
      if (next === undefined) {
        throw new Error("--audio requires a filename.");
      }
      options.audioFile = next;
      consumed.add(i - 1);
      consumed.add(i);
    } else if (arg === "--audio-source") {
      const next = rawArgs[++i];
      if (next === undefined) {
        throw new Error("--audio-source requires a path.");
      }
      options.audioSource = next;
      consumed.add(i - 1);
      consumed.add(i);
    }
  }

  // Find the first non-consumed, non-option argument as the file
  let fileIndex = -1;
  for (let i = 0; i < rawArgs.length; i++) {
    if (!consumed.has(i) && !rawArgs[i].startsWith("-")) {
      fileIndex = i;
      break;
    }
  }

  if (fileIndex === -1) {
    throw new Error("Missing MIDI file path.");
  }

  const file = rawArgs[fileIndex];

  // Validate that remaining unconsumed args are not unknown options
  for (let i = 0; i < rawArgs.length; i++) {
    if (!consumed.has(i) && i !== fileIndex) {
      const arg = rawArgs[i];
      if (arg.startsWith("-")) {
        throw new Error(`Unknown option: ${arg}`);
      }
    }
  }

  if (!options.outDir) {
    throw new Error("--out <output-dir> is required.");
  }

  return { file, options };
}
