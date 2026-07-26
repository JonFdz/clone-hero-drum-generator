import { describe, expect, it } from "vitest";
import {
	missingPathWarning,
	toMissingPathWarnings,
} from "./project-session.mapper";
import type { ProjectStatePayload } from "../../services/desktop-bridge.service";

const basePayload: ProjectStatePayload = {
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
	outputFiles: {
		chart: "/out/demo/notes.chart",
		songOgg: "/out/demo/song.ogg",
	},
	cover: { imagePath: "/cover.jpg" },
	selectedTracks: [3],
	metadata: { name: "Demo", artist: "Artist" },
	generationStatus: "generated",
};

describe("project-session.mapper", () => {
	it("builds a missing-path warning for each kind", () => {
		expect(missingPathWarning("sourcePath", basePayload)).toEqual({
			kind: "sourcePath",
			path: "/songs/demo.mid",
			message: "Missing sourcePath: /songs/demo.mid",
		});
		expect(missingPathWarning("audioPath", basePayload).kind).toBe("audioPath");
		expect(missingPathWarning("outputDir", basePayload).kind).toBe("outputDir");
		expect(missingPathWarning("outputChartPath", basePayload)).toEqual({
			kind: "outputChartPath",
			path: "/out/demo/notes.chart",
			message: "Missing managed chart: /out/demo/notes.chart",
		});
		expect(missingPathWarning("outputAudioPath", basePayload)).toEqual({
			kind: "outputAudioPath",
			path: "/out/demo/song.ogg",
			message: "Missing managed audio: /out/demo/song.ogg",
		});
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
