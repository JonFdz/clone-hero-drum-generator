import { describe, expect, it } from "vitest";
import {
	missingPathWarning,
	projectFileToPayload,
	toMissingPathWarnings,
} from "./project-session.mapper";
import type { ProjectStatePayload } from "../../services/desktop-bridge.service";

const basePayload: ProjectStatePayload = {
	projectName: "Demo",
	projectFilePath: "/p/demo.chdg.json",
	sourcePath: "/songs/demo.mid",
	audioPath: "/songs/demo.ogg",
	outputDir: "/out/demo",
	cover: { imagePath: "/cover.jpg" },
	selectedTracks: [3],
	metadata: { name: "Demo", artist: "Artist" },
	generationStatus: "generated",
};

describe("project-session.mapper", () => {
	it("maps a ChdgProjectFile into a ProjectStatePayload", () => {
		const payload = projectFileToPayload("/p/demo.chdg.json", {
			project: { name: "Demo" },
			paths: {
				sourcePath: "/songs/demo.mid",
				audioPath: "/songs/demo.ogg",
				outputDir: "/out/demo",
			},
			cover: { imagePath: "/cover.jpg" },
			source: { sourceKind: "midi" },
			selection: { selectedTracks: [3] },
			metadata: { name: "Demo", artist: "Artist" },
			generation: {
				offsetMs: 12,
				status: "generated",
				lastGeneratedAt: "2026-01-01T00:00:00.000Z",
				outputFiles: { chart: "/out/demo/notes.chart" },
			},
			mappingOverrides: {},
			analysis: undefined,
		} as Parameters<typeof projectFileToPayload>[1]);

		expect(payload.projectName).toBe("Demo");
		expect(payload.projectFilePath).toBe("/p/demo.chdg.json");
		expect(payload.sourceKind).toBe("midi");
		expect(payload.selectedTracks).toEqual([3]);
		expect(payload.generationStatus).toBe("generated");
		expect(payload.outputFiles?.chart).toBe("/out/demo/notes.chart");
	});

	it("builds a missing-path warning for each kind", () => {
		expect(missingPathWarning("sourcePath", basePayload)).toEqual({
			kind: "sourcePath",
			path: "/songs/demo.mid",
			message: "Missing sourcePath: /songs/demo.mid",
		});
		expect(missingPathWarning("audioPath", basePayload).kind).toBe("audioPath");
		expect(missingPathWarning("outputDir", basePayload).kind).toBe("outputDir");
		expect(missingPathWarning("coverImagePath", basePayload)).toEqual({
			kind: "coverImagePath",
			path: "/cover.jpg",
			message: "Missing cover image: /cover.jpg",
		});
	});

	it("maps a list of missing-path kinds into warnings", () => {
		const warnings = toMissingPathWarnings(["sourcePath", "coverImagePath"], basePayload);
		expect(warnings).toHaveLength(2);
		expect(warnings[0].kind).toBe("sourcePath");
		expect(warnings[1].kind).toBe("coverImagePath");
	});
});
