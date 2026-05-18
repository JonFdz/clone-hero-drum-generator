import { describe, expect, it } from "vitest";
import { writeSongIni } from "./songIniWriter.js";

describe("writeSongIni", () => {
	it("writes provided name, artist, and charter", () => {
		const output = writeSongIni({
			name: "Eat My Dust",
			artist: "Dead Pony",
			charter: "CHDG",
		});

		expect(output).toContain("name = Eat My Dust");
		expect(output).toContain("artist = Dead Pony");
		expect(output).toContain("charter = CHDG");
	});

	it("writes optional metadata fields when provided", () => {
		const output = writeSongIni({
			name: "Song",
			artist: "Artist",
			album: "Album Name",
			year: "2026",
			genre: "Punk Rock",
		});

		expect(output).toContain("album = Album Name");
		expect(output).toContain("year = 2026");
		expect(output).toContain("genre = Punk Rock");
	});

	it("preserves default metadata output when optional fields are omitted", () => {
		const output = writeSongIni({ name: "demo", artist: "Unknown Artist" });

		expect(output).toContain("charter = CHDG");
		expect(output).toContain("album =\n");
		expect(output).toContain("genre =\n");
		expect(output).toContain("year =\n");
		expect(output).toContain("song = song.ogg");
	});
});
