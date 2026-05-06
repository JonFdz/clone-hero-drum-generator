import { inspectMidi } from "@chdg/midi";
import type { InspectMidiOptions, NoteStats } from "@chdg/midi";
import { generalMidiDrums } from "../mappings.js";
import { formatNumber, printNoteStats, printUnknownNotes } from "../cliOutput.js";

function parseInspectMidiArgs(
  rawArgs: string[]
): { file: string; options: InspectMidiOptions } | { help: true } {
  const helpFlags = new Set(["--help", "-h"]);
  if (rawArgs.some((a) => helpFlags.has(a))) {
    return { help: true };
  }

  const consumed = new Set<number>();
  const options: InspectMidiOptions = {};

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
    } else if (arg === "--drums-only") {
      options.drumsOnly = true;
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

export function runInspectMidiCommand(rawArgs: string[]): Promise<void> {
  let parsed: ReturnType<typeof parseInspectMidiArgs>;
  try {
    parsed = parseInspectMidiArgs(rawArgs);
  } catch (err) {
    console.error((err as Error).message);
    throw new Error("ARG_PARSE_ERROR");
  }

  if ("help" in parsed) {
    throw new Error("HELP_REQUESTED");
  }

  const { file, options } = parsed;

  return inspectMidi(file, generalMidiDrums, options).then((inspection) => {
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
  });
}
