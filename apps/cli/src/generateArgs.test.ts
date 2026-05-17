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
});
