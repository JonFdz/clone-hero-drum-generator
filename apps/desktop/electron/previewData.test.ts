import { describe, expect, it } from "vitest";
import { pickAudioPreviewCandidate } from "./previewData";

describe("pickAudioPreviewCandidate", () => {
	it("prefers generated song.ogg path when explicit", () => {
		const result = pickAudioPreviewCandidate({
			generatedSongOggPath: "/tmp/output/song.ogg",
			outputDir: "/tmp/output",
			selectedAudioPath: "/tmp/source/demo.wav",
		});
		expect(result.generatedPath).toBe("/tmp/output/song.ogg");
	});

	it("derives generated song.ogg from output dir", () => {
		const result = pickAudioPreviewCandidate({ outputDir: "/tmp/output" });
		expect(result.generatedPath).toBe("/tmp/output/song.ogg");
	});
});
