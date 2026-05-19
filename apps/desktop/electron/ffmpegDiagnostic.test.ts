import { describe, expect, it, vi } from "vitest";
import { testFfmpeg } from "./ffmpegDiagnostic.js";

describe("ffmpegDiagnostic", () => {
	it("configured missing path returns unavailable", async () => {
		const accessSpy = vi.fn(async () => {
			throw new Error("missing");
		});
		const runSpy = vi.fn();
		const result = await testFfmpeg("/tmp/ffmpeg-does-not-exist", {
			access: accessSpy as typeof import("node:fs/promises").access,
			runFfmpegVersion: runSpy as typeof import("./ffmpegDiagnostic.js").runFfmpegVersion,
		});
		expect(result.available).toBe(false);
		expect(result.message).toContain("not found");
		expect(accessSpy).toHaveBeenCalledWith("/tmp/ffmpeg-does-not-exist");
		expect(runSpy).not.toHaveBeenCalled();
	});

	it("PATH detection uses exec version lookup directly without access", async () => {
		const accessSpy = vi.fn();
		const runSpy = vi.fn(async (binary: string) => `${binary} version 1.0`);
		const result = await testFfmpeg(undefined, {
			access: accessSpy as typeof import("node:fs/promises").access,
			runFfmpegVersion: runSpy as typeof import("./ffmpegDiagnostic.js").runFfmpegVersion,
		});
		expect(result.available).toBe(true);
		expect(result.message).toContain("PATH");
		expect(accessSpy).not.toHaveBeenCalled();
		expect(runSpy).toHaveBeenCalledTimes(1);
	});
});
