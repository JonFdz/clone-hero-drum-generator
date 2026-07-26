import { describe, expect, it } from "vitest";
import { HARNESS_AUDIO_PREVIEW_SRC } from "./fixture-builders";

describe("browser harness audio fixture", () => {
	it("contains a structurally valid PCM WAV with a non-empty signal", () => {
		const encoded = HARNESS_AUDIO_PREVIEW_SRC.split(",")[1];
		const wav = Buffer.from(encoded ?? "", "base64");
		const dataSize = wav.readUInt32LE(40);

		expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
		expect(wav.toString("ascii", 8, 12)).toBe("WAVE");
		expect(wav.toString("ascii", 12, 16)).toBe("fmt ");
		expect(wav.readUInt32LE(4)).toBe(wav.length - 8);
		expect(wav.readUInt16LE(20)).toBe(1);
		expect(wav.readUInt16LE(22)).toBe(1);
		expect(wav.readUInt32LE(24)).toBe(8_000);
		expect(wav.readUInt16LE(34)).toBe(16);
		expect(wav.toString("ascii", 36, 40)).toBe("data");
		expect(dataSize).toBeGreaterThan(0);
		expect(dataSize).toBe(wav.length - 44);
		expect(wav.subarray(44).some((byte) => byte !== 0)).toBe(true);
	});
});
