import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { ffmpegNotFoundMessage, prepareAudio, type AudioProcessRunner } from "./index.js";

describe("prepareAudio", () => {
  it("copies .ogg input to the final output filename", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "chdg-audio-copy-"));
    const sourcePath = join(tempDir, "source.ogg");
    const outputDir = join(tempDir, "out");
    await writeFile(sourcePath, "synthetic ogg fixture");

    const result = await prepareAudio({ sourcePath, outputDir });

    expect(result.action).toBe("copied");
    expect(result.outputFileName).toBe("song.ogg");
    expect(result.outputPath).toBe(join(outputDir, "song.ogg"));
    await expect(readFile(result.outputPath, "utf8")).resolves.toBe(
      "synthetic ogg fixture"
    );
  });

  it("converts non-.ogg input using an injected runner", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "chdg-audio-convert-"));
    const sourcePath = join(tempDir, "source.mp3");
    const outputDir = join(tempDir, "out");
    await writeFile(sourcePath, "synthetic mp3 fixture");
    const calls: Array<{ command: string; args: string[] }> = [];
    const runner: AudioProcessRunner = async (command, args) => {
      calls.push({ command, args });
    };

    const result = await prepareAudio({
      sourcePath,
      outputDir,
      outputFileName: "preview.ogg",
      ffmpegPath: "custom-ffmpeg",
      runner,
    });

    expect(result.action).toBe("converted");
    expect(result.outputFileName).toBe("preview.ogg");
    expect(result.outputPath).toBe(join(outputDir, "preview.ogg"));
    expect(calls).toEqual([
      {
        command: "custom-ffmpeg",
        args: [
          "-y",
          "-i",
          sourcePath,
          "-vn",
          "-c:a",
          "libvorbis",
          "-q:a",
          "6",
          join(outputDir, "preview.ogg"),
        ],
      },
    ]);
  });

  it("falls back to ffmpeg native vorbis when libvorbis is unavailable", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "chdg-audio-vorbis-"));
    const sourcePath = join(tempDir, "source.mp3");
    await writeFile(sourcePath, "synthetic mp3 fixture");
    const calls: Array<{ command: string; args: string[] }> = [];
    const runner: AudioProcessRunner = async (command, args) => {
      calls.push({ command, args });
      if (args.includes("libvorbis")) {
        throw new Error("FFmpeg conversion failed: Unknown encoder 'libvorbis'");
      }
    };

    const result = await prepareAudio({ sourcePath, outputDir: tempDir, runner });

    expect(result.action).toBe("converted");
    expect(calls).toHaveLength(2);
    expect(calls[0].args).toContain("libvorbis");
    expect(calls[1].args).toContain("vorbis");
    expect(calls[1].args).toContain("-strict");
    expect(calls[1].args).toContain("-2");
  });

  it("throws a helpful error when the source is missing", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "chdg-audio-missing-"));

    await expect(
      prepareAudio({ sourcePath: join(tempDir, "missing.mp3"), outputDir: tempDir })
    ).rejects.toThrow(/audio source file not found/i);
  });

  it("throws a helpful error when ffmpeg cannot be started", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "chdg-audio-ffmpeg-"));
    const sourcePath = join(tempDir, "source.mp3");
    await writeFile(sourcePath, "synthetic mp3 fixture");
    const runner: AudioProcessRunner = async () => {
      const error = new Error("spawn ffmpeg ENOENT") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      throw error;
    };

    await expect(
      prepareAudio({ sourcePath, outputDir: tempDir, runner })
    ).rejects.toThrow(ffmpegNotFoundMessage);
  });
});
