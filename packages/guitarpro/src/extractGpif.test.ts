import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { extractGpifFromBuffer, GpifUnsupportedFileError } from "./extractGpif.js";

function gpArchive(entries: Record<string, string>): Uint8Array {
  return zipSync(Object.fromEntries(Object.entries(entries).map(([path, text]) => [path, strToU8(text)])));
}

describe("extractGpifFromBuffer", () => {
  it("extracts Content/score.gpif from a synthetic .gp ZIP", () => {
    const archive = gpArchive({
      "Content/score.gpif": "<GPIF><Score><Title>Demo</Title></Score></GPIF>",
      "Other/file.txt": "ignored",
    });

    const result = extractGpifFromBuffer(archive);

    expect(result.gpifPath).toBe("Content/score.gpif");
    expect(result.xml).toContain("<Title>Demo</Title>");
    expect(result.entries).toEqual(["Content/score.gpif", "Other/file.txt"]);
  });

  it("falls back to a deterministic .gpif entry", () => {
    const archive = gpArchive({
      "z/ignored.txt": "ignored",
      "a/custom.gpif": "<GPIF />",
    });

    expect(extractGpifFromBuffer(archive).gpifPath).toBe("a/custom.gpif");
  });

  it("throws a clear unsupported-file error when no GPIF exists", () => {
    const archive = gpArchive({ "Content/readme.txt": "not gpif" });

    expect(() => extractGpifFromBuffer(archive)).toThrow(GpifUnsupportedFileError);
    expect(() => extractGpifFromBuffer(archive)).toThrow(/no \.gpif entry/i);
  });
});
