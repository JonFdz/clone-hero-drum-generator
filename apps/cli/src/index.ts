#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { inspectMidi, normalizeDrumsFromFile } from "@chdg/midi";
import type { InspectMidiOptions, NoteStats, NormalizeDrumsOptions } from "@chdg/midi";
import type { MidiDrumPieceMap, CloneHeroProDrumsMapping } from "@chdg/mappings";
import { mapHitToCloneHeroNote } from "@chdg/mappings";
import generalMidiDrumsUntyped from "@chdg/mappings/data/general-midi-drums.json" with { type: "json" };
import cloneHeroProDrumsUntyped from "@chdg/mappings/data/clone-hero-pro-drums.json" with { type: "json" };
import { writeChart, writeSongIni } from "@chdg/chart";
import type { CloneHeroDrumNote, DrumChart } from "@chdg/core";

const generalMidiDrums: MidiDrumPieceMap = generalMidiDrumsUntyped as MidiDrumPieceMap;
const cloneHeroProDrums: CloneHeroProDrumsMapping = cloneHeroProDrumsUntyped as CloneHeroProDrumsMapping;

let [, , command, ...args] = process.argv;

// Handle pnpm passing through "--" separator
if (command === "--") {
  const next = args.shift();
  if (next !== undefined) {
    command = next;
  }
}

function printHelp(): void {
  console.log(`CHDG - Clone Hero Drum Generator

Usage:
  chdg inspect-midi [options] <file.mid>
  chdg normalize-drums [options] <file.mid>
  chdg generate [options] <file.mid> --out <output-dir>

Options:
  --track <index>   Select a specific track (for generate, inspect-midi, normalize-drums)
  --drums-only      Show only strong drum tracks
  --out <dir>       Output directory for generate command
  --help            Show this help
`);
}

function formatNumber(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

function parseInspectMidiArgs(
  rawArgs: string[]
): { file: string; options: InspectMidiOptions } | { help: true } {
  const helpFlags = new Set(["--help", "-h"]);
  if (rawArgs.some((a) => helpFlags.has(a))) {
    return { help: true };
  }

  let fileIndex = -1;
  for (let i = rawArgs.length - 1; i >= 0; i--) {
    if (!rawArgs[i].startsWith("-")) {
      fileIndex = i;
      break;
    }
  }

  if (fileIndex === -1) {
    throw new Error("Missing MIDI file path.");
  }

  const file = rawArgs[fileIndex];
  const optionArgs = rawArgs.slice(0, fileIndex).concat(rawArgs.slice(fileIndex + 1));

  const options: InspectMidiOptions = {};
  for (let i = 0; i < optionArgs.length; i++) {
    const arg = optionArgs[i];
    if (arg === "--track") {
      const next = optionArgs[++i];
      if (next === undefined) {
        throw new Error("--track requires a track index.");
      }
      const idx = Number(next);
      if (!Number.isInteger(idx)) {
        throw new Error(`Invalid track index: ${next}`);
      }
      options.trackIndex = idx;
    } else if (arg === "--drums-only") {
      options.drumsOnly = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return { file, options };
}

function parseNormalizeDrumsArgs(
  rawArgs: string[]
): { file: string; options: NormalizeDrumsOptions } | { help: true } {
  const helpFlags = new Set(["--help", "-h"]);
  if (rawArgs.some((a) => helpFlags.has(a))) {
    return { help: true };
  }

  let fileIndex = -1;
  for (let i = rawArgs.length - 1; i >= 0; i--) {
    if (!rawArgs[i].startsWith("-")) {
      fileIndex = i;
      break;
    }
  }

  if (fileIndex === -1) {
    throw new Error("Missing MIDI file path.");
  }

  const file = rawArgs[fileIndex];
  const optionArgs = rawArgs.slice(0, fileIndex).concat(rawArgs.slice(fileIndex + 1));

  const options: NormalizeDrumsOptions = {};
  for (let i = 0; i < optionArgs.length; i++) {
    const arg = optionArgs[i];
    if (arg === "--track") {
      const next = optionArgs[++i];
      if (next === undefined) {
        throw new Error("--track requires a track index.");
      }
      const idx = Number(next);
      if (!Number.isInteger(idx)) {
        throw new Error(`Invalid track index: ${next}`);
      }
      options.trackIndex = idx;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return { file, options };
}

type GenerateOptions = {
  trackIndex?: number;
  outDir: string;
};

function parseGenerateArgs(
  rawArgs: string[]
): { file: string; options: GenerateOptions } | { help: true } {
  const helpFlags = new Set(["--help", "-h"]);
  if (rawArgs.some((a) => helpFlags.has(a))) {
    return { help: true };
  }

  // Find the first non-option argument as the file path
  let fileIndex = -1;
  for (let i = 0; i < rawArgs.length; i++) {
    if (!rawArgs[i].startsWith("-")) {
      fileIndex = i;
      break;
    }
  }

  if (fileIndex === -1) {
    throw new Error("Missing MIDI file path.");
  }

  const file = rawArgs[fileIndex];
  const optionArgs = rawArgs.slice(0, fileIndex).concat(rawArgs.slice(fileIndex + 1));

  const options: GenerateOptions = { outDir: "" };
  for (let i = 0; i < optionArgs.length; i++) {
    const arg = optionArgs[i];
    if (arg === "--track") {
      const next = optionArgs[++i];
      if (next === undefined) {
        throw new Error("--track requires a track index.");
      }
      const idx = Number(next);
      if (!Number.isInteger(idx)) {
        throw new Error(`Invalid track index: ${next}`);
      }
      options.trackIndex = idx;
    } else if (arg === "--out") {
      const next = optionArgs[++i];
      if (next === undefined) {
        throw new Error("--out requires an output directory.");
      }
      options.outDir = next;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!options.outDir) {
    throw new Error("--out <output-dir> is required.");
  }

  return { file, options };
}

function printNoteStats(noteStats: Record<number, NoteStats>): void {
  console.log("  Note | Count | Avg Vel | Guessed Piece");
  console.log("  -----|-------|---------|---------------");
  const noteNumbers = Object.keys(noteStats)
    .map(Number)
    .sort((a, b) => a - b);
  for (const note of noteNumbers) {
    const stat = noteStats[note];
    const pieceStr = stat.guessedPiece === "unknown" ? "UNKNOWN" : stat.guessedPiece;
    console.log(
      `  ${String(note).padEnd(4)} | ${String(stat.count).padEnd(5)} | ${formatNumber(stat.avgVelocity).padEnd(7)} | ${pieceStr}`
    );
  }
}

function printUnknownNotes(label: string, unknownNotes: number[]): void {
  if (unknownNotes.length > 0) {
    console.log(`Unknown Notes (${label}): ${unknownNotes.join(", ")}`);
  } else {
    console.log(`Unknown Notes (${label}): none`);
  }
}

switch (command) {
  case "inspect-midi": {
    let parsed: ReturnType<typeof parseInspectMidiArgs>;
    try {
      parsed = parseInspectMidiArgs(args);
    } catch (err) {
      console.error((err as Error).message);
      printHelp();
      process.exitCode = 1;
      break;
    }

    if ("help" in parsed) {
      printHelp();
      break;
    }

    const { file, options } = parsed;

    inspectMidi(file, generalMidiDrums, options)
      .then((inspection) => {
        console.log("CHDG MIDI Inspection");
        console.log("====================");
        console.log(`File: ${inspection.filePath}`);
        console.log(`Resolution (PPQ): ${inspection.resolution}`);
        console.log();

        console.log("Tracks:");
        for (const track of inspection.tracks) {
          const chInfo = track.channel !== undefined ? ` (ch ${track.channel})` : "";
          console.log(`  [${track.index}] "${track.name}"${chInfo}: ${track.noteCount} notes`);
        }
        console.log();

        console.log(
          `Strong Drum Tracks: ${inspection.strongDrumTracks.length > 0 ? inspection.strongDrumTracks.join(", ") : "(none)"}`
        );
        console.log(
          `Weak Drum Candidates: ${inspection.weakDrumTracks.length > 0 ? inspection.weakDrumTracks.join(", ") : "(none)"}`
        );
        console.log();

        console.log("Tempo Events:");
        for (const tempo of inspection.tempos) {
          console.log(`  - tick ${tempo.tick}: ${formatNumber(tempo.bpm)} BPM`);
        }
        console.log();

        console.log("Time Signatures:");
        for (const ts of inspection.timeSignatures) {
          console.log(`  - tick ${ts.tick}: ${ts.numerator}/${ts.denominator}`);
        }
        console.log();

        console.log("--- Global Note Statistics ---");
        const globalNoteCount = Object.keys(inspection.noteStats).length;
        if (globalNoteCount > 0) {
          printNoteStats(inspection.noteStats);
        } else {
          console.log("  (no notes)");
        }
        console.log();
        printUnknownNotes("Global", inspection.unknownNotes);
        console.log();

        for (const track of inspection.tracks) {
          console.log(`--- Track ${track.index}: "${track.name}" ---`);
          const trackNoteCount = Object.keys(track.noteStats).length;
          if (trackNoteCount > 0) {
            printNoteStats(track.noteStats);
          } else {
            console.log("  (no notes)");
          }
          console.log();
          printUnknownNotes(`Track ${track.index}`, track.unknownNotes);
          console.log();
        }
      })
      .catch((err: Error) => {
        console.error(`Error inspecting MIDI file: ${err.message}`);
        process.exitCode = 1;
      });

    break;
  }

  case "normalize-drums": {
    let parsed: ReturnType<typeof parseNormalizeDrumsArgs>;
    try {
      parsed = parseNormalizeDrumsArgs(args);
    } catch (err) {
      console.error((err as Error).message);
      printHelp();
      process.exitCode = 1;
      break;
    }

    if ("help" in parsed) {
      printHelp();
      break;
    }

    const { file, options } = parsed;

    normalizeDrumsFromFile(file, generalMidiDrums, options)
      .then((result) => {
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
          console.log(
            `  tick ${hit.tick}: ${hit.piece} vel ${hit.velocity} midi ${hit.source.midiNote}`
          );
        }
        if (result.hits.length > 10) {
          console.log(`  ... and ${result.hits.length - 10} more`);
        }
      })
      .catch((err: Error) => {
        console.error(`Error normalizing drums: ${err.message}`);
        process.exitCode = 1;
      });

    break;
  }

  case "generate": {
    let parsed: ReturnType<typeof parseGenerateArgs>;
    try {
      parsed = parseGenerateArgs(args);
    } catch (err) {
      console.error((err as Error).message);
      printHelp();
      process.exitCode = 1;
      break;
    }

    if ("help" in parsed) {
      printHelp();
      break;
    }

    const { file, options } = parsed;

    normalizeDrumsFromFile(file, generalMidiDrums, { trackIndex: options.trackIndex })
      .then(async (result) => {
        const expertDrums: CloneHeroDrumNote[] = result.hits
          .map((hit) => mapHitToCloneHeroNote(hit, cloneHeroProDrums))
          .filter((n): n is CloneHeroDrumNote => n !== null);

        const chart: DrumChart = {
          resolution: result.resolution,
          tempos: result.tempos,
          timeSignatures: result.timeSignatures,
          expertDrums,
        };

        const songName = basename(file, extname(file));
        const chartText = writeChart(chart, { name: songName });
        const songIniText = writeSongIni({ name: songName, artist: "Unknown Artist" });

        await mkdir(options.outDir, { recursive: true });
        await writeFile(join(options.outDir, "notes.chart"), chartText);
        await writeFile(join(options.outDir, "song.ini"), songIniText);

        console.log("CHDG Chart Generation");
        console.log("=====================");
        console.log(`File: ${file}`);
        console.log(`Track: [${result.track.index}] "${result.track.name}"`);
        console.log(`Hits: ${result.hits.length}`);
        console.log(`Mapped notes: ${expertDrums.length}`);
        console.log(`Output: ${options.outDir}`);
        console.log(`  - notes.chart`);
        console.log(`  - song.ini`);
      })
      .catch((err: Error) => {
        console.error(`Error generating chart: ${err.message}`);
        process.exitCode = 1;
      });

    break;
  }

  case "--help":
  case "-h":
  case undefined:
    printHelp();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exitCode = 1;
}
