import { readFile, writeFile } from "node:fs/promises";

export function offsetMsToSeconds(offsetMs: number): number {
	if (!Number.isFinite(offsetMs)) {
		throw new Error("OFFSET_NOT_FINITE");
	}
	return offsetMs / 1000;
}

export function applySongOffsetToChartText(
	chartText: string,
	offsetSeconds: number,
): string {
	if (!Number.isFinite(offsetSeconds)) {
		throw new Error("OFFSET_NOT_FINITE");
	}

	const sectionMatch = chartText.match(/\[Song\]\s*\{[\s\S]*?\}/);
	if (!sectionMatch || sectionMatch.index === undefined) {
		throw new Error("SONG_SECTION_NOT_FOUND");
	}

	const songSection = sectionMatch[0];
	const offsetLine = `  Offset = ${offsetSeconds}`;
	let updatedSongSection: string;

	if (/^\s*Offset\s*=.*$/m.test(songSection)) {
		updatedSongSection = songSection.replace(
			/^(\s*)Offset\s*=.*$/m,
			`$1Offset = ${offsetSeconds}`,
		);
	} else {
		updatedSongSection = songSection.replace(/\}\s*$/, `${offsetLine}\n}`);
	}

	return `${chartText.slice(0, sectionMatch.index)}${updatedSongSection}${chartText.slice(sectionMatch.index + songSection.length)}`;
}

export async function applyChartOffsetFile(input: {
	chartPath: string;
	offsetMs: number;
}): Promise<{ chartPath: string; offsetSeconds: number }> {
	const offsetSeconds = offsetMsToSeconds(input.offsetMs);
	const original = await readFile(input.chartPath, "utf8");
	const updated = applySongOffsetToChartText(original, offsetSeconds);
	await writeFile(input.chartPath, updated, "utf8");
	return { chartPath: input.chartPath, offsetSeconds };
}
