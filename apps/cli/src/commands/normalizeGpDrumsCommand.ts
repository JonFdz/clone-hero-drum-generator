import { isAbsolute, resolve } from "node:path";
import { normalizeGpDrums } from "@chdg/guitarpro";
import type { NormalizeGpDrumsOptions } from "@chdg/guitarpro";

function parseNormalizeGpDrumsArgs(
  rawArgs: string[]
): { file: string; options: NormalizeGpDrumsOptions } | { help: true } {
  const helpFlags = new Set(["--help", "-h"]);
  if (rawArgs.some((a) => helpFlags.has(a))) {
    return { help: true };
  }

  const consumed = new Set<number>();
  const options: Partial<NormalizeGpDrumsOptions> = {};

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
    }
  }

  let fileIndex = -1;
  for (let i = 0; i < rawArgs.length; i++) {
    if (!consumed.has(i) && !rawArgs[i].startsWith("-")) {
      fileIndex = i;
      break;
    }
  }

  if (fileIndex === -1) {
    throw new Error("Missing GP file path.");
  }
  if (options.trackIndex === undefined) {
    throw new Error("Missing required --track <index> option.");
  }

  const file = rawArgs[fileIndex];

  for (let i = 0; i < rawArgs.length; i++) {
    if (!consumed.has(i) && i !== fileIndex) {
      const arg = rawArgs[i];
      if (arg.startsWith("-")) {
        throw new Error(`Unknown option: ${arg}`);
      }
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  return { file, options: { trackIndex: options.trackIndex } };
}

export function runNormalizeGpDrumsCommand(rawArgs: string[]): Promise<void> {
  let parsed: ReturnType<typeof parseNormalizeGpDrumsArgs>;
  try {
    parsed = parseNormalizeGpDrumsArgs(rawArgs);
  } catch (err) {
    console.error((err as Error).message);
    throw new Error("ARG_PARSE_ERROR");
  }

  if ("help" in parsed) {
    throw new Error("HELP_REQUESTED");
  }

  const file = resolveInputPath(parsed.file);
  return normalizeGpDrums(file, parsed.options).then((result) => {
    console.log("CHDG GPIF Drum Normalization");
    console.log("============================");
    console.log(`File: ${result.filePath}`);
    console.log(`Track: [${result.trackIndex}] ${result.trackName ?? "(unnamed)"}`);
    console.log(`Resolution (PPQ): ${result.resolution}`);
    console.log(`Hits: ${result.hits.length}`);
    console.log(`Unknown Articulations: ${result.unknownArticulations.length > 0 ? result.unknownArticulations.map((item) => `${item.rawArticulation} (${item.count})`).join(", ") : "none"}`);
    console.log();

    console.log("Piece Summary:");
    const pieceCounts = new Map<string, number>();
    for (const hit of result.hits) {
      pieceCounts.set(hit.piece, (pieceCounts.get(hit.piece) ?? 0) + 1);
    }
    for (const piece of ["kick", "snare", "hihat_closed", "hihat_open", "crash", "ride", "tom_high", "tom_mid", "tom_floor"]) {
      console.log(`  ${piece}: ${pieceCounts.get(piece) ?? 0}`);
    }
    console.log();

    console.log("First Hits:");
    const firstHits = result.hits.slice(0, 10);
    if (firstHits.length === 0) {
      console.log("  none");
    }
    for (const hit of firstHits) {
      const source = "kind" in hit.source && hit.source.kind === "gpif" ? hit.source : undefined;
      const raw = source?.rawArticulation ? ` raw ${source.rawArticulation}` : "";
      console.log(`  tick ${hit.tick}: ${hit.piece} vel ${hit.velocity}${raw}`);
    }
    if (result.hits.length > 10) {
      console.log(`  ... and ${result.hits.length - 10} more`);
    }

    if (result.warnings.length > 0) {
      console.log();
      console.log("Warnings:");
      for (const warning of result.warnings) console.log(`  - ${warning}`);
    }

    if (result.unhandled.length > 0) {
      console.log();
      console.log("Unhandled/Unknown:");
      for (const item of result.unhandled) console.log(`  - ${item}`);
    }
  });
}

function resolveInputPath(filePath: string): string {
  if (isAbsolute(filePath)) {
    return filePath;
  }
  return resolve(process.env.INIT_CWD ?? process.cwd(), filePath);
}
