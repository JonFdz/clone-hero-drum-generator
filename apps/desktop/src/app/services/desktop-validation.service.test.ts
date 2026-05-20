import { describe, expect, it } from "vitest";
import type { DesktopGenerateState } from "./desktop-generate-state.service";
import type { DesktopProjectState } from "./desktop-project-state.service";
import { buildDesktopValidationSummary } from "./desktop-validation-model";

function generateState(overrides: Partial<DesktopGenerateState> = {}): DesktopGenerateState {
	return {
		metadata: {},
		selectedTracks: [],
		issues: [],
		logs: [],
		status: "idle",
		...overrides,
	};
}

function projectState(overrides: Partial<DesktopProjectState> = {}): DesktopProjectState {
	return {
		projectName: "Test Project",
		dirty: false,
		outputStatus: "not-generated",
		missingPaths: [],
		recentProjects: [],
		settings: { schemaVersion: 1, theme: "dark", projectLocation: "" },
		...overrides,
	};
}

describe("desktop validation model", () => {
	it("returns blocking errors for missing required inputs", () => {
		const summary = buildDesktopValidationSummary(generateState(), projectState());

		expect(summary.canGenerate).toBe(false);
		expect(summary.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: "source.missing", blocking: true }),
				expect.objectContaining({ id: "audio.missing", blocking: true }),
				expect.objectContaining({ id: "output.missing", blocking: true }),
				expect.objectContaining({ id: "tracks.missing", blocking: true }),
			]),
		);
	});

	it("blocks unsupported source and invalid offset", () => {
		const summary = buildDesktopValidationSummary(
			generateState({
				sourcePath: "song.gp5",
				audioPath: "song.wav",
				outputDir: "/tmp/out",
				selectedTracks: [3],
				offsetMs: Number.NaN,
			}),
			projectState(),
		);

		expect(summary.canGenerate).toBe(false);
		expect(summary.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: "source.unsupported", severity: "error" }),
				expect.objectContaining({ id: "offset.invalid", severity: "error" }),
			]),
		);
	});

	it("blocks saved missing paths from loaded projects", () => {
		const summary = buildDesktopValidationSummary(
			generateState({
				sourcePath: "song.mid",
				audioPath: "song.wav",
				outputDir: "/tmp/out",
				selectedTracks: [3],
			}),
			projectState({
				missingPaths: [
					{ kind: "sourcePath", path: "song.mid", message: "Missing sourcePath: song.mid" },
					{ kind: "audioPath", path: "song.wav", message: "Missing audioPath: song.wav" },
				],
			}),
		);

		expect(summary.canGenerate).toBe(false);
		expect(summary.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: "source.path-missing", blocking: true }),
				expect.objectContaining({ id: "audio.path-missing", blocking: true }),
			]),
		);
	});

	it("treats warnings as non-blocking", () => {
		const summary = buildDesktopValidationSummary(
			generateState({
				sourcePath: "song.mid",
				audioPath: "song.wav",
				outputDir: "/tmp/out",
				selectedTracks: [3],
				metadata: {},
				issues: [
					{ severity: "warning", code: "IMPOSSIBLE_HAND_CHORD", message: "Detected impossible chord." },
				],
			}),
			projectState({ outputStatus: "needs-regenerate" }),
		);

		expect(summary.canGenerate).toBe(true);
		expect(summary.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: "generation.needs-regenerate", severity: "warning", blocking: false }),
				expect.objectContaining({ id: "metadata.missing-artist", severity: "warning", blocking: false }),
				expect.objectContaining({ id: "metadata.missing-charter", severity: "warning", blocking: false }),
				expect.objectContaining({ id: "chart.impossible-hand-chord", severity: "warning", blocking: false }),
			]),
		);
	});

	it("blocks when FFmpeg diagnostic is unavailable and audio conversion is required", () => {
		const summary = buildDesktopValidationSummary(
			generateState({
				sourcePath: "song.mid",
				audioPath: "song.wav",
				outputDir: "/tmp/out",
				selectedTracks: [3],
			}),
			projectState({ ffmpegDiagnostic: { available: false, message: "FFmpeg not found." } }),
		);

		expect(summary.canGenerate).toBe(false);
		expect(summary.items).toContainEqual(
			expect.objectContaining({ id: "ffmpeg.unavailable", category: "ffmpeg", blocking: true }),
		);
	});

	it("does not block unavailable FFmpeg when selected audio is already ogg", () => {
		const summary = buildDesktopValidationSummary(
			generateState({
				sourcePath: "song.mid",
				audioPath: "song.ogg",
				outputDir: "/tmp/out",
				selectedTracks: [3],
				metadata: { artist: "Artist", charter: "Charter" },
			}),
			projectState({ ffmpegDiagnostic: { available: false, message: "FFmpeg not found." } }),
		);

		expect(summary.canGenerate).toBe(true);
		expect(summary.items).toContainEqual(
			expect.objectContaining({ id: "ffmpeg.not-required", category: "ffmpeg", blocking: false }),
		);
	});

	it("surfaces generated current output as info", () => {
		const summary = buildDesktopValidationSummary(
			generateState({
				sourcePath: "song.gp",
				audioPath: "song.wav",
				outputDir: "/tmp/out",
				selectedTracks: [1, 2],
				metadata: { artist: "Artist", charter: "Charter" },
				lastGeneratedAt: "2026-05-20T00:00:00.000Z",
			}),
			projectState({
				outputStatus: "generated",
				ffmpegDiagnostic: { available: true, message: "FFmpeg is available." },
			}),
		);

		expect(summary.canGenerate).toBe(true);
		expect(summary.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: "generation.generated", severity: "info" }),
				expect.objectContaining({ id: "ffmpeg.available", severity: "info" }),
			]),
		);
	});
});
