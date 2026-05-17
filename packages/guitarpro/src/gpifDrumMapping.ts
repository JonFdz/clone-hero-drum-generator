import type { DrumPiece } from "@chdg/core";

export const DEFAULT_GPIF_DRUM_VELOCITY = 95;

const DYNAMIC_VELOCITIES: Record<string, number> = {
	pp: 35,
	p: 50,
	mp: 65,
	mf: 80,
	f: 100,
	ff: 115,
};

export type GpifDrumMappingResult = {
	piece?: Exclude<DrumPiece, "unknown">;
	warning?: string;
};

export function mapGpifDrumArticulation(
	rawValues: string[],
): GpifDrumMappingResult {
	const haystack = normalize(rawValues.join(" "));
	if (!haystack) return {};

	if (/\b(side stick|sidestick|rim ?shot|cross ?stick)\b/.test(haystack)) {
		return {
			piece: "snare",
			warning:
				"Mapped side-stick/rimshot articulation to snare because CHDG has no dedicated side-stick piece.",
		};
	}

	if (/\b(kick|bass drum|bd)\b/.test(haystack)) return { piece: "kick" };
	if (/\bsnare\b/.test(haystack)) return { piece: "snare" };

	if (
		/\b(open|opened)\b/.test(haystack) &&
		/\b(hi ?hat|hihat|hh)\b/.test(haystack)
	)
		return { piece: "hihat_open" };
	if (
		/\b(closed|close)\b/.test(haystack) &&
		/\b(hi ?hat|hihat|hh)\b/.test(haystack)
	)
		return { piece: "hihat_closed" };
	if (/\b(hi ?hat|hihat|hh)\b/.test(haystack)) return { piece: "hihat_closed" };

	if (/\bcrash\b/.test(haystack)) return { piece: "crash" };
	if (/\bride\b/.test(haystack)) return { piece: "ride" };

	if (/\b(high tom|hi tom|rack tom high|tom high|tom 1)\b/.test(haystack))
		return { piece: "tom_high" };
	if (/\b(mid tom|middle tom|rack tom|tom mid|tom 2)\b/.test(haystack))
		return { piece: "tom_mid" };
	if (/\b(floor tom|low tom|tom low|tom floor|tom 3)\b/.test(haystack))
		return { piece: "tom_floor" };

	return {};
}

export function mapGpifMidiDrumNumber(midi: number): GpifDrumMappingResult {
	if (midi === 35 || midi === 36) return { piece: "kick" };
	if (midi === 37) {
		return {
			piece: "snare",
			warning:
				"Mapped side-stick/rimshot articulation to snare because CHDG has no dedicated side-stick piece.",
		};
	}
	if (midi === 38 || midi === 40) return { piece: "snare" };
	if (midi === 42 || midi === 44) return { piece: "hihat_closed" };
	if (midi === 46) return { piece: "hihat_open" };
	if (midi === 49 || midi === 52 || midi === 55 || midi === 57)
		return { piece: "crash" };
	if (midi === 51 || midi === 53 || midi === 59) return { piece: "ride" };
	if (midi === 48 || midi === 50) return { piece: "tom_high" };
	if (midi === 45 || midi === 47) return { piece: "tom_mid" };
	if (midi === 41 || midi === 43) return { piece: "tom_floor" };
	return {};
}

export function mapGpifDynamicToVelocity(
	dynamic: string | undefined,
): number | undefined {
	if (!dynamic) return undefined;
	return DYNAMIC_VELOCITIES[dynamic.trim().toLowerCase()];
}

function normalize(value: string): string {
	return value.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}
