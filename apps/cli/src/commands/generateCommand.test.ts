import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
	detectSourceKind: vi.fn(),
	generatePackage: vi.fn(),
}));

vi.mock("@chdg/project", () => ({
	detectSourceKind: mocks.detectSourceKind,
	generatePackage: mocks.generatePackage,
	ProjectServiceError: class ProjectServiceError extends Error {
		code: string;
		issues: unknown[];
		constructor(code: string, message: string, issues: unknown[] = []) {
			super(message);
			this.code = code;
			this.issues = issues;
		}
	},
}));

import {
	detectGenerateSourceKind,
	runGenerateCommand,
} from "./generateCommand.js";

describe("detectGenerateSourceKind", () => {
	it("delegates source kind detection", () => {
		mocks.detectSourceKind.mockReturnValue("midi");
		expect(detectGenerateSourceKind("song.mid")).toBe("midi");
		expect(mocks.detectSourceKind).toHaveBeenCalledWith("song.mid");
	});
});

describe("runGenerateCommand", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;
	let warnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
	});

	afterEach(() => {
		logSpy.mockRestore();
		warnSpy.mockRestore();
	});

	it("prints valid JSON envelope with --json", async () => {
		mocks.generatePackage.mockResolvedValue({
			sourceKind: "gpif",
			sourcePath: "song.gp",
			selectedTrack: 3,
			outputDir: "output/demo",
			hitCount: 10,
			mappedNoteCount: 10,
			deduplicatedCount: 0,
			files: {
				chart: "output/demo/notes.chart",
				songIni: "output/demo/song.ini",
				songOgg: "output/demo/song.ogg",
			},
			issues: [
				{
					severity: "warning",
					code: "GPIF_WARNING",
					message: "Synthetic warning",
				},
			],
		});

		await runGenerateCommand([
			"song.gp",
			"--track",
			"3",
			"--out",
			"output/demo",
			"--json",
		]);

		expect(logSpy).toHaveBeenCalledTimes(1);
		const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
		expect(payload.ok).toBe(true);
		expect(payload.data.outputDir).toBe("output/demo");
		expect(Array.isArray(payload.issues)).toBe(true);
		expect(warnSpy).not.toHaveBeenCalled();
	});

	it("keeps human output without --json", async () => {
		mocks.generatePackage.mockResolvedValue({
			sourceKind: "midi",
			sourcePath: "song.mid",
			selectedTrack: 53,
			outputDir: "output/demo",
			hitCount: 3,
			mappedNoteCount: 3,
			deduplicatedCount: 1,
			files: {
				chart: "output/demo/notes.chart",
				songIni: "output/demo/song.ini",
			},
			issues: [
				{
					severity: "warning",
					code: "UNKNOWN_MIDI_NOTES",
					message: "Unknown MIDI notes were skipped.",
				},
			],
		});

		await runGenerateCommand([
			"song.mid",
			"--track",
			"53",
			"--out",
			"output/demo",
		]);

		expect(logSpy).toHaveBeenCalledWith("CHDG Chart Generation");
		expect(warnSpy).toHaveBeenCalledWith(
			"Warning: Unknown MIDI notes were skipped.",
		);
	});
});
