import { isAbsolute, resolve } from "node:path";
import { inspectGpFile } from "@chdg/guitarpro";
import type { GpInspection } from "@chdg/guitarpro";

function parseInspectGpArgs(rawArgs: string[]): { file: string } | { help: true } {
  const helpFlags = new Set(["--help", "-h"]);
  if (rawArgs.some((a) => helpFlags.has(a))) {
    return { help: true };
  }

  if (rawArgs.length === 0) {
    throw new Error("Missing GP file path.");
  }

  const unknownOption = rawArgs.find((arg) => arg.startsWith("-"));
  if (unknownOption !== undefined) {
    throw new Error(`Unknown option: ${unknownOption}`);
  }

  if (rawArgs.length > 1) {
    throw new Error(`Unexpected argument: ${rawArgs[1]}`);
  }

  return { file: rawArgs[0] };
}

export async function runInspectGpCommand(rawArgs: string[]): Promise<void> {
  let parsed: ReturnType<typeof parseInspectGpArgs>;
  try {
    parsed = parseInspectGpArgs(rawArgs);
  } catch (err) {
    console.error((err as Error).message);
    throw new Error("ARG_PARSE_ERROR");
  }

  if ("help" in parsed) {
    throw new Error("HELP_REQUESTED");
  }

  const inspection = await inspectGpFile(resolveInputPath(parsed.file));
  printGpInspection(inspection);
}

function resolveInputPath(filePath: string): string {
  if (isAbsolute(filePath)) {
    return filePath;
  }
  return resolve(process.env.INIT_CWD ?? process.cwd(), filePath);
}

function printGpInspection(inspection: GpInspection): void {
  console.log("CHDG GP Inspection");
  console.log("==================");
  console.log(`File: ${inspection.filePath}`);
  console.log(`Format: ${inspection.format.toUpperCase()}`);
  console.log(`GPIF Entry: ${inspection.gpifPath ?? "unknown"}`);
  console.log();

  console.log("Metadata:");
  printField("Title", inspection.metadata.title);
  printField("Artist", inspection.metadata.artist);
  printField("Album", inspection.metadata.album);
  printField("Composer", inspection.metadata.composer);
  printField("Copyright", inspection.metadata.copyright);
  printField("Tempo", inspection.metadata.tempo);
  console.log();

  console.log("Tracks:");
  if (inspection.tracks.length === 0) {
    console.log("  (none)");
  } else {
    for (const track of inspection.tracks) {
      const details = [
        track.instrument ? `instrument: ${track.instrument}` : undefined,
        track.type ? `type: ${track.type}` : undefined,
        track.channel !== undefined ? `channel: ${track.channel}` : undefined,
      ].filter(Boolean);
      const marker = track.isDrumCandidate ? " (drum candidate)" : "";
      const detailText = details.length > 0 ? ` — ${details.join(", ")}` : "";
      console.log(`  [${track.index}] ${track.name ?? "(unnamed)"}${marker}${detailText}`);
      for (const reason of track.drumCandidateReasons) {
        console.log(`      reason: ${reason}`);
      }
    }
  }
  console.log();

  console.log(
    `Drum Track Candidates: ${inspection.drumTrackCandidates.length > 0 ? inspection.drumTrackCandidates.join(", ") : "none"}`
  );
  console.log();

  printUnknownList("Tempo Events", inspection.tempos);
  printUnknownList("Time Signatures", inspection.timeSignatures);

  console.log("Sections/Markers:");
  if (inspection.sections.length === 0) {
    console.log("  none");
  } else {
    for (const section of inspection.sections) {
      const location = section.tick !== undefined ? `tick ${section.tick}` : section.measureIndex !== undefined ? `measure ${section.measureIndex}` : "timing unknown";
      console.log(`  - ${location}: ${section.name} (${section.kind})`);
    }
  }
  console.log();

  console.log("Drum Articulations:");
  if (inspection.drumArticulations.length === 0) {
    console.log("  none");
  } else {
    for (const articulation of inspection.drumArticulations) {
      const path = articulation.path ? ` — ${articulation.path}` : "";
      console.log(`  - ${articulation.name}: ${articulation.count}${path}`);
    }
  }
  console.log();

  console.log("Warnings:");
  printStringList(inspection.warnings);
  console.log();

  console.log("Unhandled/Unknown:");
  printStringList(inspection.unhandled);
}

function printField(label: string, value: string | number | undefined): void {
  console.log(`  ${label}: ${value ?? "unknown"}`);
}

function printUnknownList(label: string, items: unknown[]): void {
  console.log(`${label}:`);
  if (items.length === 0) {
    console.log("  none");
  } else {
    for (const item of items) {
      console.log(`  - ${formatUnknown(item)}`);
    }
  }
  console.log();
}

function printStringList(items: string[]): void {
  if (items.length === 0) {
    console.log("  none");
  } else {
    for (const item of items) {
      console.log(`  - ${item}`);
    }
  }
}

function formatUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
