import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	inspectSource: vi.fn(),
	normalizeSelection: vi.fn(),
}));

vi.mock("@chdg/project", () => ({
	inspectSource: mocks.inspectSource,
	normalizeSelection: mocks.normalizeSelection,
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

import { runInspectMidiCommand } from "./inspectMidiCommand.js";
import { runInspectGpCommand } from "./inspectGpCommand.js";
import { runNormalizeDrumsCommand } from "./normalizeDrumsCommand.js";
import { runNormalizeGpDrumsCommand } from "./normalizeGpDrumsCommand.js";

describe("CLI command JSON mode", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;
	let errorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
	});

	afterEach(() => {
		logSpy.mockRestore();
		errorSpy.mockRestore();
	});

	it("inspect-midi --json outputs parseable JSON", async () => {
		mocks.inspectSource.mockResolvedValue({
			sourceKind: "midi",
			sourcePath: "demo.mid",
			resolution: 480,
			tempos: [],
			timeSignatures: [],
			sections: [],
			tracks: [],
			issues: [],
		});

		await runInspectMidiCommand(["demo.mid", "--json"]);
		const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
		expect(payload.ok).toBe(true);
		expect(payload.data.sourceKind).toBe("midi");
	});

	it("inspect-gp --json outputs parseable JSON", async () => {
		mocks.inspectSource.mockResolvedValue({
			sourceKind: "gpif",
			sourcePath: "/abs/demo.gp",
			tempos: [],
			timeSignatures: [],
			sections: [],
			tracks: [],
			issues: [
				{
					severity: "warning",
					code: "GPIF_WARNING",
					message: "Synthetic warning",
				},
			],
		});

		await runInspectGpCommand(["/abs/demo.gp", "--json"]);
		const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
		expect(payload.ok).toBe(true);
		expect(payload.issues[0].code).toBe("GPIF_WARNING");
	});

	it("normalize-drums --json outputs parseable JSON", async () => {
		mocks.normalizeSelection.mockResolvedValue({
			sourceKind: "midi",
			sourcePath: "demo.mid",
			selectedTrack: 53,
			selectedTracks: [53],
			hitCount: 10,
			pieceSummary: { kick: 4 },
			firstHits: [],
			issues: [],
		});

		await runNormalizeDrumsCommand(["demo.mid", "--track", "53", "--json"]);
		const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
		expect(payload.ok).toBe(true);
		expect(payload.data.selectedTrack).toBe(53);
	});

	it("normalize-gp-drums --json outputs parseable JSON", async () => {
		mocks.normalizeSelection.mockResolvedValue({
			sourceKind: "gpif",
			sourcePath: "/abs/demo.gp",
			selectedTrack: 3,
			selectedTracks: [3],
			hitCount: 5,
			pieceSummary: { snare: 2 },
			firstHits: [],
			issues: [],
		});

		await runNormalizeGpDrumsCommand([
			"/abs/demo.gp",
			"--track",
			"3",
			"--json",
		]);
		const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
		expect(payload.ok).toBe(true);
		expect(payload.data.sourceKind).toBe("gpif");
	});

	it("normalize-gp-drums --tracks --json outputs parseable multi-track JSON", async () => {
		mocks.normalizeSelection.mockResolvedValue({
			sourceKind: "gpif",
			sourcePath: "/abs/demo.gp",
			selectedTrack: 3,
			selectedTracks: [3, 10],
			mergeSummary: {
				selectedTracks: [3, 10],
				sourceTrackCount: 2,
				inputHitCount: 3,
				mergedHitCount: 2,
				deduplicatedHitCount: 1,
				duplicateHitCount: 1,
				impossibleChordCount: 0,
				issues: [],
			},
			hitCount: 2,
			pieceSummary: { kick: 1, snare: 1 },
			firstHits: [],
			issues: [],
		});

		await runNormalizeGpDrumsCommand([
			"/abs/demo.gp",
			"--tracks",
			"3,10",
			"--json",
		]);
		const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
		expect(payload.ok).toBe(true);
		expect(payload.data.selectedTracks).toEqual([3, 10]);
		expect(payload.data.mergeSummary.duplicateHitCount).toBe(1);
	});

	it("inspect-midi --json rejects extra positional args as parseable JSON", async () => {
		await expect(
			runInspectMidiCommand(["demo.mid", "extra.mid", "--json"]),
		).rejects.toThrow("COMMAND_FAILED");

		const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
		expect(payload).toMatchObject({
			ok: false,
			error: {
				code: "ARG_PARSE_ERROR",
				message: "Unexpected argument: extra.mid",
			},
		});
		expect(errorSpy).not.toHaveBeenCalled();
	});

	it("normalize-drums --json rejects extra positional args as parseable JSON", async () => {
		await expect(
			runNormalizeDrumsCommand([
				"demo.mid",
				"extra.mid",
				"--track",
				"53",
				"--json",
			]),
		).rejects.toThrow("COMMAND_FAILED");

		const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
		expect(payload).toMatchObject({
			ok: false,
			error: {
				code: "ARG_PARSE_ERROR",
				message: "Unexpected argument: extra.mid",
			},
		});
		expect(errorSpy).not.toHaveBeenCalled();
	});

	it("inspect-gp --json returns parseable runtime error envelopes", async () => {
		mocks.inspectSource.mockRejectedValue(new Error("Synthetic failure"));

		await expect(runInspectGpCommand(["/abs/demo.gp", "--json"]))
			.rejects.toThrow("COMMAND_FAILED");

		const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
		expect(payload).toMatchObject({
			ok: false,
			error: {
				code: "INSPECT_SOURCE_FAILED",
				message: "Synthetic failure",
			},
		});
		expect(errorSpy).not.toHaveBeenCalled();
	});
});
