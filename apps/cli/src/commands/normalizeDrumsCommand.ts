import { normalizeDrumsFromFile } from "@chdg/midi";
import type { NormalizeDrumsOptions } from "@chdg/midi";
import { generalMidiDrums } from "../mappings.js";

function parseNormalizeDrumsArgs(
  rawArgs: string[]
): { file: string; options: NormalizeDrumsOptions } | { help: true } {
  const helpFlags = new Set(["--help", "-h"]);
  if (rawArgs.some((a) => helpFlags.has(a))) {
    return { help: true };
  }

  const consumed = new Set<number>();
  const options: NormalizeDrumsOptions = {};

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
    throw new Error("Missing MIDI file path.");
  }

  const file = rawArgs[fileIndex];

  for (let i = 0; i < rawArgs.length; i++) {
    if (!consumed.has(i) && i !== fileIndex) {
      const arg = rawArgs[i];
      if (arg.startsWith("-")) {
        throw new Error(`Unknown option: ${arg}`);
      }
    }
  }

  return { file, options };
}

export function runNormalizeDrumsCommand(rawArgs: string[]): Promise<void> {
  let parsed: ReturnType<typeof parseNormalizeDrumsArgs>;
  try {
    parsed = parseNormalizeDrumsArgs(rawArgs);
  } catch (err) {
    console.error((err as Error).message);
    throw new Error("ARG_PARSE_ERROR");
  }

  if ("help" in parsed) {
    throw new Error("HELP_REQUESTED");
  }

  const { file, options } = parsed;

  return normalizeDrumsFromFile(file, generalMidiDrums, options).then((result) => {
    console.log("CHDG Drum Normalization");
    console.log("=======================");
    console.log(`File: ${file}`);
    const chInfo = result.track.channel !== undefined ? ` (ch ${result.track.channel})` : "";
    console.log(`Track: [${result.track.index}] "${result.track.name}"${chInfo}`);
    console.log(`Hits: ${result.hits.length}`);
    console.log(
      `Unknown Notes: ${result.unknownNotes.length > 0 ? result.unknownNotes.join(", ") : "none"}`
    );
    console.log();

    const pieceCounts = new Map<string, number>();
    for (const hit of result.hits) {
      pieceCounts.set(hit.piece, (pieceCounts.get(hit.piece) ?? 0) + 1);
    }
    console.log("Piece Summary:");
    for (const [piece, count] of pieceCounts) {
      console.log(`  ${piece}: ${count}`);
    }
    console.log();

    console.log("First Hits:");
    const firstHits = result.hits.slice(0, 10);
    for (const hit of firstHits) {
      const midiNote = "midiNote" in hit.source ? hit.source.midiNote : "unknown";
      console.log(
        `  tick ${hit.tick}: ${hit.piece} vel ${hit.velocity} midi ${midiNote}`
      );
    }
    if (result.hits.length > 10) {
      console.log(`  ... and ${result.hits.length - 10} more`);
    }
  });
}
