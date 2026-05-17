import { bpmToChartValue, type CloneHeroDrumNote, type DrumChart } from "@chdg/core";

const CYMBAL_MODIFIER_NOTES = {
	yellow: 66,
	blue: 67,
	green: 68,
} as const;

const ACCENT_MODIFIER_NOTES = {
	red: 34,
	yellow: 35,
	blue: 36,
	green: 37,
} as const;

const GHOST_MODIFIER_NOTES = {
	red: 40,
	yellow: 41,
	blue: 42,
	green: 43,
} as const;

function laneToChartNote(lane: string): number {
	switch (lane) {
		case "kick":
			return 0;
		case "red":
			return 1;
		case "yellow":
			return 2;
		case "blue":
			return 3;
		case "green":
			return 4;
		default:
			throw new Error(`Unsupported lane: ${lane}`);
	}
}

function cymbalModifierNote(note: CloneHeroDrumNote): number | null {
	if (!note.cymbal) return null;
	if (note.lane !== "yellow" && note.lane !== "blue" && note.lane !== "green") {
		return null;
	}
	return CYMBAL_MODIFIER_NOTES[note.lane];
}

function dynamicsModifierNote(note: CloneHeroDrumNote): number | null {
	if (note.lane === "kick") return null;
	if (note.lane !== "red" && note.lane !== "yellow" && note.lane !== "blue" && note.lane !== "green") {
		return null;
	}
	if (note.accent) return ACCENT_MODIFIER_NOTES[note.lane];
	if (note.ghost) return GHOST_MODIFIER_NOTES[note.lane];
	return null;
}

function expertDrumLines(note: CloneHeroDrumNote): string[] {
	const lines = [`  ${note.tick} = N ${laneToChartNote(note.lane)} ${note.length}`];
	const cymbalModifier = cymbalModifierNote(note);
	if (cymbalModifier !== null) {
		lines.push(`  ${note.tick} = N ${cymbalModifier} 0`);
	}
	const dynamicsModifier = dynamicsModifierNote(note);
	if (dynamicsModifier !== null) {
		lines.push(`  ${note.tick} = N ${dynamicsModifier} 0`);
	}
	return lines;
}

export function writeChart(
	chart: DrumChart,
	options?: { name?: string; artist?: string; charter?: string },
): string {
	const name = options?.name ?? "Untitled";
	const artist = options?.artist ?? "Unknown Artist";
	const charter = options?.charter ?? "CHDG";
	const expertLines = chart.expertDrums.flatMap(expertDrumLines);
	return [
		`[Song]\n{\n  Name = "${name}"\n  Artist = "${artist}"\n  Charter = "${charter}"\n  Offset = 0\n  Resolution = ${chart.resolution}\n}\n`,
		`[SyncTrack]\n{`,
		...chart.timeSignatures.map(
			(ts) => `  ${ts.tick} = TS ${ts.numerator} ${Math.log2(ts.denominator)}`,
		),
		...chart.tempos.map(
			(tempo) => `  ${tempo.tick} = B ${bpmToChartValue(tempo.bpm)}`,
		),
		`}\n`,
		`[Events]\n{\n}\n`,
		`[ExpertDrums]\n{`,
		...expertLines,
		`}\n`,
	].join("\n");
}
