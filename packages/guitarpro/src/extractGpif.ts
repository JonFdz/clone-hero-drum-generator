import { readFile } from "node:fs/promises";
import { strFromU8, unzipSync } from "fflate";
import type { GpifExtraction } from "./gpifTypes.js";

const PREFERRED_GPIF_PATH = "Content/score.gpif";

export class GpifUnsupportedFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GpifUnsupportedFileError";
  }
}

export class GpifExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GpifExtractionError";
  }
}

export async function extractGpifFromFile(filePath: string): Promise<GpifExtraction> {
  let data: Buffer;
  try {
    data = await readFile(filePath);
  } catch (err) {
    const nodeErr = err as NodeJS.ErrnoException;
    if (nodeErr.code === "ENOENT") {
      throw new Error(`GP file not found: ${filePath}`);
    }
    throw err;
  }

  return extractGpifFromBuffer(data);
}

export function extractGpifFromBuffer(data: Uint8Array): GpifExtraction {
  let archive: Record<string, Uint8Array>;
  try {
    archive = unzipSync(data);
  } catch (err) {
    throw new GpifUnsupportedFileError(
      `Unsupported GP file: expected a modern .gp ZIP container with GPIF XML (${(err as Error).message})`
    );
  }

  const entries = Object.keys(archive).sort((a, b) => a.localeCompare(b));
  const gpifPath = selectGpifEntry(entries);
  if (gpifPath === undefined) {
    throw new GpifUnsupportedFileError("Unsupported GP file: no .gpif entry found in container.");
  }

  try {
    return {
      gpifPath,
      xml: strFromU8(archive[gpifPath]),
      entries,
    };
  } catch (err) {
    throw new GpifExtractionError(`Failed to decode GPIF XML as UTF-8: ${(err as Error).message}`);
  }
}

function selectGpifEntry(entries: string[]): string | undefined {
  if (entries.includes(PREFERRED_GPIF_PATH)) {
    return PREFERRED_GPIF_PATH;
  }

  return entries.find((entry) => entry.toLowerCase().endsWith(".gpif"));
}
