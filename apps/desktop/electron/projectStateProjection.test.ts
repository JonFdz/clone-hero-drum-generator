import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ChdgProjectFile } from "@chdg/project";
import { projectFileToDesktopState } from "./projectStateProjection.js";

describe("projectFileToDesktopState", () => {
	it("projects the canonical aggregate for the Electron open-project handler", () => {
		const filePath = path.join("/projects", "demo", "project.chdg");
		const project = {
			project: {
				projectId: "project-demo",
				artist: "Artist",
				songName: "Song",
				projectName: "Expert Drums",
				album: "Album",
			},
			assets: {
				source: {
					relativePath: "assets/source.mid",
					sourceKind: "midi",
				},
				audio: { relativePath: "assets/song.ogg" },
				cover: { relativePath: "assets/album.jpg" },
			},
			import: { selectedTrackIds: [2, 4] },
			sourceDocument: {
				resolution: 960,
				tempos: [{ tick: 0, bpm: 140 }],
				timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
				sections: [{ tick: 960, name: "Verse" }],
			},
			editor: { offsetMs: 125 },
			export: {
				status: "current",
				targetDirectory: "/clone-hero/Artist - Song",
				lastSuccessfulAt: "2026-07-26T10:30:00.000Z",
				managedFiles: {
					"notes.chart": {
						sha256: "a".repeat(64),
						sizeBytes: 100,
						writtenAt: "2026-07-26T10:30:00.000Z",
					},
					"song.ogg": {
						sha256: "b".repeat(64),
						sizeBytes: 200,
						writtenAt: "2026-07-26T10:30:00.000Z",
					},
				},
			},
		} as ChdgProjectFile;

		const payload = projectFileToDesktopState(filePath, project);

		expect(payload.project).toEqual({
			projectId: "project-demo",
			artist: "Artist",
			songName: "Song",
			projectName: "Expert Drums",
			displayName: "Artist - Song - Expert Drums",
		});
		expect(payload).not.toHaveProperty("projectId");
		expect(payload.projectName).toBe("Artist - Song - Expert Drums");
		expect(payload.projectFilePath).toBe(filePath);
		expect(payload.sourcePath).toBe(path.join("/projects", "demo", "assets", "source.mid"));
		expect(payload.audioPath).toBe(path.join("/projects", "demo", "assets", "song.ogg"));
		expect(payload.cover?.imagePath).toBe(
			path.join("/projects", "demo", "assets", "album.jpg"),
		);
		expect(payload.selectedTracks).toEqual([2, 4]);
		expect(payload.sourceTiming).toEqual({
			resolution: 960,
			tempos: [{ tick: 0, bpm: 140 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 960, name: "Verse" }],
		});
		expect(payload.offsetMs).toBe(125);
		expect(payload.generationStatus).toBe("generated");
		expect(payload.outputDir).toBe("/clone-hero/Artist - Song");
		expect(payload.outputFiles).toEqual({
			chart: path.join("/clone-hero/Artist - Song", "notes.chart"),
			songOgg: path.join("/clone-hero/Artist - Song", "song.ogg"),
		});
		expect(payload).not.toHaveProperty("paths");
		expect(payload).not.toHaveProperty("selection");
		expect(payload).not.toHaveProperty("generation");
		expect(payload).not.toHaveProperty("analysis");
		expect(payload).not.toHaveProperty("mappingOverrides");
	});
});
