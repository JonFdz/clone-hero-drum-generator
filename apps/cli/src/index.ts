#!/usr/bin/env node
import { inspectMidi } from "@chdg/midi";
import type { InspectMidiOptions, NoteStats } from "@chdg/midi";
import type { MidiDrumPieceMap } from "@chdg/mappings";
import generalMidiDrumsUntyped from "@chdg/mappings/data/general-midi-drums.json" with { type: "json" };

const generalMidiDrums: MidiDrumPieceMap = generalMidiDrumsUntyped as MidiDrumPieceMap;

const [, , command, ...args] = process.argv;

function printHelp(): void {
  console.log(`CHDG - Clone Hero Drum Generator

Usage:
  chdg inspect-midi [options] <file.mid>
  chdg generate <file.mid> --out <output-dir>

Options:
  --track <index>   Inspect a specific track only (overrides --drums-only)
  --drums-only      Show only strong drum tracks
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

  case "generate": {
    const [file] = args;
    if (!file) {
      console.error("Missing MIDI file path.");
      process.exitCode = 1;
      break;
    }
    console.log(`Chart generation is not implemented yet. Requested file: ${file}`);
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
