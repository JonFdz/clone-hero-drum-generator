import { describe, expect, it } from "vitest";
import { testFfmpeg } from "./ffmpegDiagnostic.js";

describe("ffmpegDiagnostic", () => {
	it("returns unavailable for missing ffmpeg", async () => {
		const result = await testFfmpeg("/tmp/ffmpeg-does-not-exist");
		expect(result.available).toBe(false);
		expect(result.message).toContain("not found");
	});

	it("returns shape with required fields", async () => {
		const result = await testFfmpeg();
		expect(result).toHaveProperty("available");
		expect(result).toHaveProperty("message");
		expect(typeof result.available).toBe("boolean");
		expect(typeof result.message).toBe("string");
	});
});
