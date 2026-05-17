import { copyFile, mkdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import {
  AudioProcessError,
  type AudioProcessRunner,
  ffmpegNotFoundMessage,
  isMissingExecutableError,
  runAudioProcess,
} from "./ffmpegRunner.js";

const defaultOutputFileName = "song.ogg";

export type PrepareAudioInput = {
  sourcePath: string;
  outputDir: string;
  outputFileName?: string;
  ffmpegPath?: string;
  runner?: AudioProcessRunner;
};

export type PrepareAudioResult = {
  sourcePath: string;
  outputPath: string;
  outputFileName: string;
  action: "copied" | "converted";
};

export async function prepareAudio(
  input: PrepareAudioInput
): Promise<PrepareAudioResult> {
  const outputFileName = input.outputFileName ?? defaultOutputFileName;
  const outputPath = join(input.outputDir, outputFileName);

  await assertSourceFileExists(input.sourcePath);
  await mkdir(input.outputDir, { recursive: true });

  if (extname(input.sourcePath).toLowerCase() === ".ogg") {
    await copyFile(input.sourcePath, outputPath);
    return {
      sourcePath: input.sourcePath,
      outputPath,
      outputFileName,
      action: "copied",
    };
  }

  const runner = input.runner ?? runAudioProcess;
  const ffmpegPath = input.ffmpegPath ?? "ffmpeg";
  const args = buildFfmpegArgs(input.sourcePath, outputPath, "libvorbis");

  try {
    await runner(ffmpegPath, args);
  } catch (error) {
    if (isMissingExecutableError(error)) {
      throw new AudioProcessError(ffmpegNotFoundMessage, error);
    }

    if (isMissingLibvorbisError(error)) {
      await runner(ffmpegPath, buildFfmpegArgs(input.sourcePath, outputPath, "vorbis"));
    } else {
      throw error;
    }
  }

  return {
    sourcePath: input.sourcePath,
    outputPath,
    outputFileName,
    action: "converted",
  };
}

function buildFfmpegArgs(
  sourcePath: string,
  outputPath: string,
  encoder: "libvorbis" | "vorbis"
): string[] {
  const encoderArgs =
    encoder === "vorbis"
      ? ["-c:a", encoder, "-strict", "-2"]
      : ["-c:a", encoder];

  return [
    "-y",
    "-i",
    sourcePath,
    "-vn",
    ...encoderArgs,
    "-q:a",
    "6",
    outputPath,
  ];
}

function isMissingLibvorbisError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("libvorbis");
}

async function assertSourceFileExists(sourcePath: string): Promise<void> {
  try {
    const sourceStat = await stat(sourcePath);
    if (!sourceStat.isFile()) {
      throw new Error(`Audio source is not a file: ${sourcePath}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Audio source file not found: ${sourcePath}`);
    }
    throw error;
  }
}
