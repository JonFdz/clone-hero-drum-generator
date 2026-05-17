import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { normalizeDrumsFromFile } from "@chdg/midi";
import { mapHitToCloneHeroNote } from "@chdg/mappings";
import { writeChart, writeSongIni, deduplicateBaseNotes } from "@chdg/chart";
import type { CloneHeroDrumNote, DrumChart } from "@chdg/core";
import { prepareAudio } from "@chdg/audio";
import { generalMidiDrums, cloneHeroProDrums } from "../mappings.js";
import { parseGenerateArgs } from "../generateArgs.js";

export function runGenerateCommand(rawArgs: string[]): Promise<void> {
  let parsed: ReturnType<typeof parseGenerateArgs>;
  try {
    parsed = parseGenerateArgs(rawArgs);
  } catch (err) {
    console.error((err as Error).message);
    throw new Error("ARG_PARSE_ERROR");
  }

  if ("help" in parsed) {
    throw new Error("HELP_REQUESTED");
  }

  const { file, options } = parsed;

  return normalizeDrumsFromFile(file, generalMidiDrums, { trackIndex: options.trackIndex })
    .then(async (result) => {
      if (result.unknownNotes.length > 0) {
        console.warn(
          `Warning: unknown MIDI notes skipped: ${result.unknownNotes.join(", ")}`
        );
      }

      const expertDrums: CloneHeroDrumNote[] = result.hits
        .map((hit) => mapHitToCloneHeroNote(hit, cloneHeroProDrums))
        .filter((n): n is CloneHeroDrumNote => n !== null);

      const deduplicated = deduplicateBaseNotes(expertDrums);

      const chart: DrumChart = {
        resolution: result.resolution,
        tempos: result.tempos,
        timeSignatures: result.timeSignatures,
        expertDrums: deduplicated,
      };

      const songName = basename(file, extname(file));
      const audioFile = options.audioFile ?? "song.ogg";
      const chartText = writeChart(chart, { name: songName });
      const songIniText = writeSongIni({
        name: songName,
        artist: "Unknown Artist",
        songFile: audioFile,
      });

      await mkdir(options.outDir, { recursive: true });
      await writeFile(join(options.outDir, "notes.chart"), chartText);
      await writeFile(join(options.outDir, "song.ini"), songIniText);

      const audioResult = options.audioSource
        ? await prepareAudio({
            sourcePath: options.audioSource,
            outputDir: options.outDir,
            outputFileName: audioFile,
          })
        : null;

      console.log("CHDG Chart Generation");
      console.log("=====================");
      console.log(`File: ${file}`);
      console.log(`Track: [${result.track.index}] "${result.track.name}"`);
      console.log(`Hits: ${result.hits.length}`);
      console.log(`Mapped notes: ${expertDrums.length}`);
      if (deduplicated.length < expertDrums.length) {
        console.log(`Deduplicated notes: ${expertDrums.length - deduplicated.length}`);
      }
      console.log(`Output: ${options.outDir}`);
      console.log(`  - notes.chart`);
      console.log(`  - song.ini`);
      if (audioResult) {
        console.log(`  - ${audioResult.outputFileName} (${audioResult.action})`);
      }
    });
}
