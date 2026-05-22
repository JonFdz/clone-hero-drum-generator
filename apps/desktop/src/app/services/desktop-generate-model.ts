import type { SourceKind, TrackCandidate } from "@chdg/project/browser";
import type {
	DesktopGenerateState,
	DesktopMetadata,
	GenerateValidationResult,
} from "./desktop-generate-state.service";

export function detectDesktopSourceKind(
	sourcePath: string,
): SourceKind | undefined {
	const lower = sourcePath.toLowerCase();
	if (lower.endsWith(".mid") || lower.endsWith(".midi")) {
		return "midi";
	}
	if (lower.endsWith(".gp")) {
		return "gpif";
	}
	return undefined;
}

export function validateGenerateState(
	state: DesktopGenerateState,
): GenerateValidationResult {
	const errors: string[] = [];
	if (!state.sourcePath) errors.push("Source file is required.");
	if (state.sourcePath && !detectDesktopSourceKind(state.sourcePath))
		errors.push("Supported source files are .mid, .midi, and .gp.");
	if (!state.audioPath)
		errors.push("Audio file is required for Desktop Generate MVP.");
	if (!state.outputDir) errors.push("Output folder is required.");
	if (state.selectedTracks.length === 0)
		errors.push("Select at least one drum track.");
	if (state.offsetMs !== undefined && !Number.isFinite(state.offsetMs))
		errors.push("Offset must be numeric if provided.");
	return { ok: errors.length === 0, errors };
}

export function chooseDefaultTracks(tracks: TrackCandidate[]): number[] {
	const drumTracks = tracks.filter(
		(track) => track.role === "drums" && track.strength === "strong",
	);
	if (drumTracks.length > 0) {
		return [drumTracks[0].index];
	}
	const weakDrumTrack = tracks.find((track) => track.role === "drums");
	return weakDrumTrack ? [weakDrumTrack.index] : [];
}

export function cleanMetadata(metadata: DesktopMetadata): DesktopMetadata {
	return Object.fromEntries(
		Object.entries(metadata).filter(
			([, value]) => value !== undefined && value.trim().length > 0,
		),
	) as DesktopMetadata;
}
