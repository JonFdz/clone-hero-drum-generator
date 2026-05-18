import { describe, expect, it } from "vitest";
import { parseGenerateArgs } from "./generateArgs.js";

describe("parseGenerateArgs", () => {
	it("parses file before options", () => {
		const result = parseGenerateArgs([
			"samples/demo.mid",
			"--track",
			"179",
			"--out",
			"output/demo",
		]);
		expect("help" in result).toBe(false);
		if ("help" in result) return;
		expect(result.file).toBe("samples/demo.mid");
		expect(result.options.trackIndex).toBe(179);
		expect(result.options.outDir).toBe("output/demo");
	});

	it("parses options before file", () => {
		const result = parseGenerateArgs([
			"--track",
			"179",
			"--out",
			"output/demo",
			"samples/demo.mid",
		]);
		expect("help" in result).toBe(false);
		if ("help" in result) return;
		expect(result.file).toBe("samples/demo.mid");
		expect(result.options.trackIndex).toBe(179);
		expect(result.options.outDir).toBe("output/demo");
	});

	it("parses mixed options and file", () => {
		const result = parseGenerateArgs([
			"--track",
			"179",
			"samples/demo.mid",
			"--out",
			"output/demo",
			"--audio",
			"song.opus",
		]);
		expect("help" in result).toBe(false);
		if ("help" in result) return;
		expect(result.file).toBe("samples/demo.mid");
		expect(result.options.trackIndex).toBe(179);
		expect(result.options.outDir).toBe("output/demo");
		expect(result.options.audioFile).toBe("song.opus");
	});

	it("returns help when --help is present", () => {
		const result = parseGenerateArgs([
			"--help",
			"samples/demo.mid",
			"--out",
			"output/demo",
		]);
		expect("help" in result).toBe(true);
	});

	it("throws when file is missing", () => {
		expect(() => parseGenerateArgs(["--out", "output/demo"])).toThrow(
			/missing source file/i,
		);
	});

	it("throws when --out is missing", () => {
		expect(() => parseGenerateArgs(["samples/demo.mid"])).toThrow(
			/--out .* is required/i,
		);
	});

	it("throws on unknown option", () => {
		expect(() =>
			parseGenerateArgs([
				"samples/demo.mid",
				"--out",
				"output/demo",
				"--unknown",
			]),
		).toThrow(/unknown option/i);
	});

	it("throws when --track value is missing", () => {
		expect(() => parseGenerateArgs(["samples/demo.mid", "--track"])).toThrow(
			/--track requires/i,
		);
	});

	it("throws when --track value is not an integer", () => {
		expect(() =>
			parseGenerateArgs(["samples/demo.mid", "--track", "abc"]),
		).toThrow(/invalid track index/i);
	});

	it("does not treat option values as the file", () => {
		const result = parseGenerateArgs([
			"--out",
			"output/demo",
			"--track",
			"2",
			"samples/demo.mid",
		]);
		expect("help" in result).toBe(false);
		if ("help" in result) return;
		expect(result.file).toBe("samples/demo.mid");
		expect(result.options.outDir).toBe("output/demo");
		expect(result.options.trackIndex).toBe(2);
	});

	it("parses --audio option as the final audio filename", () => {
		const result = parseGenerateArgs([
			"samples/demo.mid",
			"--out",
			"output/demo",
			"--audio",
			"song.opus",
		]);
		expect("help" in result).toBe(false);
		if ("help" in result) return;
		expect(result.options.audioFile).toBe("song.opus");
	});

	it("parses --audio-source option as the source audio path", () => {
		const result = parseGenerateArgs([
			"samples/demo.mid",
			"--out",
			"output/demo",
			"--audio-source",
			"samples/demo.mp3",
		]);
		expect("help" in result).toBe(false);
		if ("help" in result) return;
		expect(result.options.audioSource).toBe("samples/demo.mp3");
	});

	it("keeps --audio as final filename when --audio-source is present", () => {
		const result = parseGenerateArgs([
			"samples/demo.mid",
			"--out",
			"output/demo",
			"--audio-source",
			"samples/demo.mp3",
			"--audio",
			"preview.ogg",
		]);
		expect("help" in result).toBe(false);
		if ("help" in result) return;
		expect(result.options.audioSource).toBe("samples/demo.mp3");
		expect(result.options.audioFile).toBe("preview.ogg");
	});

	it("defaults audioFile and audioSource to undefined when omitted", () => {
		const result = parseGenerateArgs([
			"samples/demo.mid",
			"--out",
			"output/demo",
		]);
		expect("help" in result).toBe(false);
		if ("help" in result) return;
		expect(result.options.audioFile).toBeUndefined();
		expect(result.options.audioSource).toBeUndefined();
	});

	it("parses metadata options", () => {
		const result = parseGenerateArgs([
			"samples/demo.gp",
			"--track",
			"3",
			"--out",
			"output/demo",
			"--name",
			"Eat My Dust",
			"--artist",
			"Dead Pony",
			"--album",
			"Ignore This",
			"--year",
			"2024",
			"--genre",
			"Punk Rock",
			"--charter",
			"CHDG",
		]);
		expect("help" in result).toBe(false);
		if ("help" in result) return;
		expect(result.options.name).toBe("Eat My Dust");
		expect(result.options.artist).toBe("Dead Pony");
		expect(result.options.album).toBe("Ignore This");
		expect(result.options.year).toBe("2024");
		expect(result.options.genre).toBe("Punk Rock");
		expect(result.options.charter).toBe("CHDG");
	});

	it.each(["--name", "--artist", "--album", "--year", "--genre", "--charter"])(
		"throws when %s value is missing",
		(option) => {
			expect(() =>
				parseGenerateArgs([
					"samples/demo.mid",
					"--out",
					"output/demo",
					option,
				]),
			).toThrow(`${option} requires a value`);
		},
	);

	it.each([
		["900", 900],
		["1200", 1200],
		["-250", -250],
		["0", 0],
	] as const)("parses valid --offset-ms %s", (rawOffset, expected) => {
		const result = parseGenerateArgs([
			"samples/demo.mid",
			"--out",
			"output/demo",
			"--offset-ms",
			rawOffset,
		]);
		expect("help" in result).toBe(false);
		if ("help" in result) return;
		expect(result.options.offsetMs).toBe(expected);
	});

	it.each(["abc", "Infinity", "NaN"])(
		"throws when --offset-ms value is invalid: %s",
		(rawOffset) => {
			expect(() =>
				parseGenerateArgs([
					"samples/demo.mid",
					"--out",
					"output/demo",
					"--offset-ms",
					rawOffset,
				]),
			).toThrow(/invalid --offset-ms value/i);
		},
	);

	it("throws when --offset-ms value is missing", () => {
		expect(() =>
			parseGenerateArgs([
				"samples/demo.mid",
				"--out",
				"output/demo",
				"--offset-ms",
			]),
		).toThrow(/--offset-ms requires/i);
	});

	it("throws when --audio-source value is missing", () => {
		expect(() =>
			parseGenerateArgs([
				"samples/demo.mid",
				"--out",
				"output/demo",
				"--audio-source",
			]),
		).toThrow(/--audio-source requires/i);
	});

	it("throws when an extra positional GP source follows the first file", () => {
		expect(() =>
			parseGenerateArgs(["a.gp", "b.gp", "--track", "3", "--out", "output"]),
		).toThrow(/unexpected argument: b\.gp/i);
	});

	it("throws when an extra positional GP source appears after options", () => {
		expect(() =>
			parseGenerateArgs(["a.gp", "--track", "3", "b.gp", "--out", "output"]),
		).toThrow(/unexpected argument: b\.gp/i);
	});

	it("throws when an extra positional MIDI source follows the first file", () => {
		expect(() =>
			parseGenerateArgs(["a.mid", "b.mid", "--track", "53", "--out", "output"]),
		).toThrow(/unexpected argument: b\.mid/i);
	});
});
