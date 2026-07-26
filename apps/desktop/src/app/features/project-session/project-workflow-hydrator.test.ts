import { describe, expect, it, vi } from "vitest";
import {
	ProjectWorkflowHydrator,
	toGenerateWorkflowState,
} from "./project-workflow-hydrator";
import type { ProjectStatePayload } from "../../services/desktop-bridge.service";
import type { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
const fullPayload: ProjectStatePayload = {
	project: {
		projectId: "project-demo",
		artist: "Artist",
		songName: "Demo",
		projectName: "Expert Drums",
		displayName: "Artist - Demo - Expert Drums",
	},
	projectName: "Demo",
	projectFilePath: "/p/demo.chdg.json",
	sourcePath: "/songs/demo.mid",
	audioPath: "/songs/demo.ogg",
	outputDir: "/out/demo",
	cover: { imagePath: "/cover.jpg" },
	sourceKind: "midi",
	selectedTracks: [3, 7],
	metadata: { name: "Demo", artist: "Artist", album: "Album", year: "2026" },
	offsetMs: 12,
	sourceTiming: {
		resolution: 960,
		tempos: [{ tick: 0, bpm: 120 }],
		timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
		sections: [],
	},
	generationStatus: "generated",
	lastGeneratedAt: "2026-01-01T00:00:00.000Z",
	outputFiles: {
		chart: "/out/demo/notes.chart",
		songIni: "/out/demo/song.ini",
		songOgg: "/out/demo/song.ogg",
		albumJpg: "/out/demo/album.jpg",
	},
};

describe("toGenerateWorkflowState", () => {
	it("maps every persisted workflow field from one canonical place", () => {
		const mapped = toGenerateWorkflowState(fullPayload);

		expect(mapped.sourcePath).toBe("/songs/demo.mid");
		expect(mapped.audioPath).toBe("/songs/demo.ogg");
		expect(mapped.outputDir).toBe("/out/demo");
		expect(mapped.cover).toEqual({ imagePath: "/cover.jpg" });
		expect(mapped.sourceKind).toBe("midi");
		expect(mapped.selectedTracks).toEqual([3, 7]);
		expect(mapped.metadata).toEqual({
			name: "Demo",
			artist: "Artist",
			album: "Album",
			year: "2026",
		});
		expect(mapped.offsetMs).toBe(12);
		expect(mapped.sourceTiming?.resolution).toBe(960);
		expect(mapped.outputFiles).toEqual({
			chart: "/out/demo/notes.chart",
			songIni: "/out/demo/song.ini",
			songOgg: "/out/demo/song.ogg",
			albumJpg: "/out/demo/album.jpg",
		});
		expect(mapped.mappingOverrides).toBeUndefined();
		expect(mapped.analysis).toBeUndefined();
		expect(mapped.lastGeneratedAt).toBe("2026-01-01T00:00:00.000Z");
	});

	it("does not carry persistence-only fields into the workflow state", () => {
		const mapped = toGenerateWorkflowState(fullPayload);
		// projectFilePath/projectName/generationStatus are session concerns,
		// not generation-workflow input, and must not leak through the mapping.
		expect(mapped).not.toHaveProperty("projectFilePath");
		expect(mapped).not.toHaveProperty("projectName");
		expect(mapped).not.toHaveProperty("generationStatus");
	});

	it("preserves undefined optional workflow fields without inventing values", () => {
		const sparse: ProjectStatePayload = {
			project: {
				projectId: "project-empty",
				artist: "Artist",
				songName: "Empty",
				projectName: "Expert Drums",
				displayName: "Artist - Empty - Expert Drums",
			},
			projectName: "Empty",
			selectedTracks: [],
			metadata: {},
			generationStatus: "not-generated",
		};
		const mapped = toGenerateWorkflowState(sparse);
		expect(mapped.sourcePath).toBeUndefined();
		expect(mapped.audioPath).toBeUndefined();
		expect(mapped.outputDir).toBeUndefined();
		expect(mapped.cover).toBeUndefined();
		expect(mapped.sourceKind).toBeUndefined();
		expect(mapped.offsetMs).toBeUndefined();
		expect(mapped.lastGeneratedAt).toBeUndefined();
		expect(mapped.outputFiles).toBeUndefined();
		expect(mapped.mappingOverrides).toBeUndefined();
		expect(mapped.analysis).toBeUndefined();
		expect(mapped.selectedTracks).toEqual([]);
		expect(mapped.metadata).toEqual({});
	});
});

describe("ProjectWorkflowHydrator", () => {
	function makeHydrator() {
		const loadProjectState = vi.fn();
		const generateState = {
			loadProjectState,
		} as unknown as DesktopGenerateStateService;
		const hydrator = new ProjectWorkflowHydrator(generateState);
		return { hydrator, loadProjectState };
	}

	it("hydrate() loads the generation workflow with the canonical mapping", () => {
		const { hydrator, loadProjectState } = makeHydrator();

		hydrator.hydrate(fullPayload);

		expect(loadProjectState).toHaveBeenCalledTimes(1);
		expect(loadProjectState).toHaveBeenCalledWith(
			toGenerateWorkflowState(fullPayload),
		);
	});

	it("hydrate() passes the mapped payload (all workflow fields present)", () => {
		const { hydrator, loadProjectState } = makeHydrator();

		hydrator.hydrate(fullPayload);

		const arg = loadProjectState.mock.calls[0][0];
		expect(arg).toEqual(toGenerateWorkflowState(fullPayload));
		expect(arg.analysis).toBeUndefined();
		expect(arg.mappingOverrides).toBeUndefined();
	});
});
