import { describe, expect, it } from "vitest";
import type { DesktopGenerateState } from "./desktop-generate-state.service";
import type { DesktopProjectState } from "./desktop-project-state.service";
import { buildDesktopValidationSummary } from "./desktop-validation-model";

function generateState(
	overrides: Partial<DesktopGenerateState> = {},
): DesktopGenerateState {
	return {
		metadata: {},
		selectedTracks: [],
		issues: [],
		logs: [],
		mappingOverrides: {},
		status: "idle",
		...overrides,
	};
}

function projectState(
	overrides: Partial<DesktopProjectState> = {},
): DesktopProjectState {
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
		const summary = buildDesktopValidationSummary(
			generateState(),
			projectState(),
		);

		expect(summary.canGenerate).toBe(false);
		expect(summary.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: "source.missing", blocking: true }),
				expect.objectContaining({ id: "audio.missing", blocking: true }),
				expect.objectContaining({
					id: "output.missing",
					severity: "info",
					blocking: false,
				}),
				expect.objectContaining({ id: "tracks.missing", blocking: true }),
			]),
		);
		expect(summary.items).not.toContainEqual(
			expect.objectContaining({
				fixAction: expect.objectContaining({
					route: expect.stringMatching(
						/^\/(?:projects\/details|source-review|generate)$/,
					),
				}),
			}),
		);
		expect(
			summary.items.map((item) => `${item.title} ${item.message}`).join(" "),
		).not.toMatch(/choose|before generating/i);
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
				expect.objectContaining({
					id: "source.unsupported",
					severity: "error",
				}),
				expect.objectContaining({ id: "offset.invalid", severity: "error" }),
			]),
		);
	});

	it("treats an unrecorded optional export target as informational", () => {
		const summary = buildDesktopValidationSummary(
			generateState({
				sourcePath: "song.mid",
				audioPath: "song.ogg",
				selectedTracks: [3],
				metadata: { artist: "Artist", charter: "Charter" },
			}),
			projectState(),
		);
		const output = summary.items.find((item) => item.id === "output.missing");

		expect(output).toMatchObject({
			severity: "info",
			blocking: false,
			title: "Export target not recorded",
		});
		expect(summary.canGenerate).toBe(true);
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
					{
						kind: "sourcePath",
						path: "song.mid",
						message: "Missing sourcePath: song.mid",
					},
					{
						kind: "audioPath",
						path: "song.wav",
						message: "Missing audioPath: song.wav",
					},
					{
						kind: "outputDir",
						path: "/tmp/out",
						message: "Missing outputDir: /tmp/out",
					},
					{
						kind: "outputChartPath",
						path: "/tmp/out/notes.chart",
						message: "Missing managed chart: /tmp/out/notes.chart",
					},
					{
						kind: "outputAudioPath",
						path: "/tmp/out/song.ogg",
						message: "Missing managed audio: /tmp/out/song.ogg",
					},
				],
			}),
		);

		expect(summary.canGenerate).toBe(false);
		expect(summary.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: "source.path-missing", blocking: true }),
				expect.objectContaining({ id: "audio.path-missing", blocking: true }),
				expect.objectContaining({
					id: "output.path-missing",
					title: "Recorded export target unavailable",
					blocking: true,
				}),
				expect.objectContaining({
					id: "output.chart-missing",
					title: "Managed preview chart unavailable",
					blocking: true,
				}),
				expect.objectContaining({
					id: "output.audio-missing",
					title: "Managed preview audio unavailable",
					blocking: true,
				}),
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
					{
						severity: "warning",
						code: "IMPOSSIBLE_HAND_CHORD",
						message: "Detected impossible chord.",
					},
				],
			}),
			projectState({ outputStatus: "needs-regenerate" }),
		);

		expect(summary.canGenerate).toBe(true);
		expect(summary.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "generation.needs-regenerate",
					severity: "warning",
					blocking: false,
				}),
				expect.objectContaining({
					id: "metadata.missing-artist",
					severity: "warning",
					blocking: false,
				}),
				expect.objectContaining({
					id: "metadata.missing-charter",
					severity: "warning",
					blocking: false,
				}),
				expect.objectContaining({
					id: "chart.impossible-hand-chord",
					severity: "warning",
					blocking: false,
				}),
			]),
		);
		expect(
			summary.items.find(
				(item) => item.id === "generation.needs-regenerate",
			),
		).toEqual(
			expect.objectContaining({
				title: "Persisted export status is outdated",
				message: "Managed regeneration is unavailable in this migration.",
				fixAction: undefined,
			}),
		);
	});

	it("does not offer generation actions for persisted export states", () => {
		for (const outputStatus of [
			"failed",
			"not-generated",
		] satisfies DesktopProjectState["outputStatus"][]) {
			const summary = buildDesktopValidationSummary(
				generateState(),
				projectState({ outputStatus }),
			);
			const item = summary.items.find((candidate) =>
				candidate.id.startsWith("generation."),
			);

			expect(item).toBeDefined();
			if (!item) throw new Error(`Missing generation item for ${outputStatus}`);

			expect(item.id).toBe(`generation.${outputStatus}`);
			expect(item.message).toContain("unavailable in this migration");
			expect(item.fixAction).toBeUndefined();
		}
	});

	it("treats a finite chart offset as valid without warning", () => {
		const summary = buildDesktopValidationSummary(
			generateState({
				sourcePath: "song.mid",
				audioPath: "song.ogg",
				outputDir: "/tmp/out",
				selectedTracks: [3],
				offsetMs: 25,
				metadata: { artist: "Artist", charter: "Charter" },
			}),
			projectState(),
		);

		expect(summary.canGenerate).toBe(true);
		expect(summary.items).not.toContainEqual(
			expect.objectContaining({
				id: "offset.present",
			}),
		);
		expect(summary.items).not.toContainEqual(
			expect.objectContaining({
				id: "offset.invalid",
			}),
		);
	});

	it("does not emit an offset warning when offset is unset or zero", () => {
		const baseState = {
			sourcePath: "song.mid",
			audioPath: "song.ogg",
			outputDir: "/tmp/out",
			selectedTracks: [3],
			metadata: { artist: "Artist", charter: "Charter" },
		};

		const unsetSummary = buildDesktopValidationSummary(
			generateState(baseState),
			projectState(),
		);
		const zeroSummary = buildDesktopValidationSummary(
			generateState({ ...baseState, offsetMs: 0 }),
			projectState(),
		);

		expect(unsetSummary.items).not.toContainEqual(
			expect.objectContaining({ id: "offset.present" }),
		);
		expect(zeroSummary.items).not.toContainEqual(
			expect.objectContaining({ id: "offset.present" }),
		);
		expect(zeroSummary.items).not.toContainEqual(
			expect.objectContaining({ id: "offset.invalid" }),
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
			projectState({
				ffmpegDiagnostic: { available: false, message: "FFmpeg not found." },
			}),
		);

		expect(summary.canGenerate).toBe(false);
		expect(summary.items).toContainEqual(
			expect.objectContaining({
				id: "ffmpeg.unavailable",
				category: "ffmpeg",
				blocking: true,
			}),
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
			projectState({
				ffmpegDiagnostic: { available: false, message: "FFmpeg not found." },
			}),
		);

		expect(summary.canGenerate).toBe(true);
		expect(summary.items).toContainEqual(
			expect.objectContaining({
				id: "ffmpeg.not-required",
				category: "ffmpeg",
				blocking: false,
			}),
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
				expect.objectContaining({
					id: "generation.generated",
					severity: "info",
				}),
				expect.objectContaining({ id: "ffmpeg.available", severity: "info" }),
			]),
		);
	});
});
