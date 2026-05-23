import { describe, expect, it } from "vitest";
import { buildWaveformOverview } from "./desktop-waveform-overview";

describe("desktop-waveform-overview", () => {
	it("builds bounded bucket count", () => {
		const channel = new Float32Array(1000).fill(0.5);
		const overview = buildWaveformOverview({
			channels: [channel],
			durationSeconds: 10,
			bucketCount: 4000,
			sampleRate: 44100,
		});
		expect(overview.buckets.length).toBeLessThanOrEqual(1000);
		expect(overview.buckets.length).toBeGreaterThan(0);
	});

	it("keeps finite normalized amplitudes", () => {
		const channel = new Float32Array([2, -2, Number.NaN, Number.POSITIVE_INFINITY, 0.5]);
		const overview = buildWaveformOverview({ channels: [channel], durationSeconds: 5, bucketCount: 5 });
		for (const bucket of overview.buckets) {
			expect(Number.isFinite(bucket.min)).toBe(true);
			expect(Number.isFinite(bucket.max)).toBe(true);
			expect(bucket.min).toBeGreaterThanOrEqual(-1);
			expect(bucket.max).toBeLessThanOrEqual(1);
			expect(bucket.rms).toBeGreaterThanOrEqual(0);
			expect(bucket.rms).toBeLessThanOrEqual(1);
		}
	});

	it("produces zero amplitude buckets for silence", () => {
		const channel = new Float32Array(256).fill(0);
		const overview = buildWaveformOverview({ channels: [channel], durationSeconds: 3, bucketCount: 32 });
		expect(overview.buckets.every((bucket) => bucket.min === 0 && bucket.max === 0 && bucket.rms === 0)).toBe(true);
	});

	it("preserves duration seconds", () => {
		const channel = new Float32Array(44100).fill(0.1);
		const overview = buildWaveformOverview({ channels: [channel], durationSeconds: 7.25, bucketCount: 50 });
		expect(overview.durationSeconds).toBe(7.25);
		expect(overview.buckets.at(-1)?.endSeconds).toBeCloseTo(7.25, 5);
	});

	it("handles empty input safely", () => {
		const overview = buildWaveformOverview({ channels: [], durationSeconds: 0, bucketCount: 100 });
		expect(overview.buckets).toHaveLength(0);
		expect(overview.durationSeconds).toBe(0);
	});
});
