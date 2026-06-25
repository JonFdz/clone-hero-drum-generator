import { describe, expect, it } from "vitest";
import {
	HIGHWAY_STAGE_VISUAL_PROFILE,
	type HighwayStageVisualProfile,
	stageDepthForProgress,
} from "./highway-stage-visual-profile";

describe("highway-stage-visual-profile", () => {
	it("exports one production profile with every profile-owned section", () => {
		const profile = HIGHWAY_STAGE_VISUAL_PROFILE;
		expect(profile.scene).toBeDefined();
		expect(profile.road).toBeDefined();
		expect(profile.projection).toBeDefined();
		expect(profile.targets).toBeDefined();
		expect(profile.notes).toBeDefined();
		expect(profile.hud).toBeDefined();
		expect(profile.palette).toBeDefined();
	});

	it("defaults the HUD to hidden for the stage profile", () => {
		expect(HIGHWAY_STAGE_VISUAL_PROFILE.hud.enabledByDefault).toBe(false);
	});

	it("does not retain Fast-only projection fields in the shared profile", () => {
		const projection = HIGHWAY_STAGE_VISUAL_PROFILE.projection as Record<string, unknown>;
		expect(Object.hasOwn(projection, "fastNearFieldSeconds")).toBe(false);
		expect(Object.hasOwn(projection, "fastNearFieldDepthRatio")).toBe(false);
		expect(Object.hasOwn(projection, "fastFarFieldCompression")).toBe(false);
	});

	it("keeps the road horizontally restrained without making it tiny on a wide scene", () => {
		const { scene, road } = HIGHWAY_STAGE_VISUAL_PROFILE;
		const canvasWidth = 1440;
		const viewport = Math.min(
			scene.maxRoadViewportWidth,
			canvasWidth * scene.roadViewportWidthRatio,
		);
		const bottomRoadWidth = viewport * road.bottomWidthRatio;
		// Camera + density pass: near road should occupy about a third of the canvas.
		expect(bottomRoadWidth).toBeLessThan(canvasWidth * 0.38);
		expect(bottomRoadWidth).toBeGreaterThan(canvasWidth * 0.33);
		// Negative space remains primarily lateral.
		expect(canvasWidth - bottomRoadWidth).toBeGreaterThan(canvasWidth * 0.6);
	});

	it("uses profile-owned camera ratios inside the calibrated tall-gameplay bands", () => {
		const { scene } = HIGHWAY_STAGE_VISUAL_PROFILE;
		expect(scene.horizonRatio).toBeGreaterThanOrEqual(0.18);
		expect(scene.horizonRatio).toBeLessThanOrEqual(0.22);
		expect(scene.hitLineRatio).toBeGreaterThanOrEqual(0.88);
		expect(scene.hitLineRatio).toBeLessThanOrEqual(0.91);
		expect(scene.hitLineRatio - scene.horizonRatio).toBeGreaterThanOrEqual(0.7);
		expect(scene.hitLineRatio - scene.horizonRatio).toBeLessThanOrEqual(0.75);
	});

	describe("stageDepthForProgress", () => {
		it("clamps finite input to [0, 1] and maps endpoints to 0 and 1", () => {
			const profile = HIGHWAY_STAGE_VISUAL_PROFILE;
			expect(stageDepthForProgress(0, profile)).toBe(0);
			expect(stageDepthForProgress(1, profile)).toBe(1);
			expect(stageDepthForProgress(-0.5, profile)).toBe(0);
			expect(stageDepthForProgress(1.5, profile)).toBe(1);
		});

		it("returns finite values for finite input", () => {
			const profile = HIGHWAY_STAGE_VISUAL_PROFILE;
			for (const p of [0, 0.1, 0.25, 0.5, 0.75, 0.99, 1]) {
				const depth = stageDepthForProgress(p, profile);
				expect(Number.isFinite(depth)).toBe(true);
				expect(depth).toBeGreaterThanOrEqual(0);
				expect(depth).toBeLessThanOrEqual(1);
			}
		});

		it("is monotonic non-decreasing across the visible window", () => {
			const profile = HIGHWAY_STAGE_VISUAL_PROFILE;
			let previous = -Infinity;
			for (let i = 0; i <= 100; i += 1) {
				const depth = stageDepthForProgress(i / 100, profile);
				expect(depth).toBeGreaterThanOrEqual(previous);
				previous = depth;
			}
		});

		it("strongly opens the lower field while still compressing toward the horizon", () => {
			const profile = HIGHWAY_STAGE_VISUAL_PROFILE;
			// Perspective mapping should lift even tiny near-field progress values.
			expect(stageDepthForProgress(0.01, profile)).toBeGreaterThan(0.02);
			// Midpoint should already be far away from the hit line under the gameplay camera.
			expect(stageDepthForProgress(0.5, profile)).toBeGreaterThan(0.7);
			// Far notes still compress strongly near the horizon.
			expect(stageDepthForProgress(0.9, profile)).toBeGreaterThan(0.95);
		});

		it("returns 0 for non-finite input instead of propagating NaN/Infinity", () => {
			const profile = HIGHWAY_STAGE_VISUAL_PROFILE;
			expect(stageDepthForProgress(Number.NaN, profile)).toBe(0);
			expect(stageDepthForProgress(Number.POSITIVE_INFINITY, profile)).toBe(0);
			expect(stageDepthForProgress(Number.NEGATIVE_INFINITY, profile)).toBe(0);
		});

		it("stays monotonic for a range of calibrated perspective compression values", () => {
			const base = HIGHWAY_STAGE_VISUAL_PROFILE;
			for (const compression of [0.25, 0.4, 0.55, 0.8, 1.1]) {
				const profile: HighwayStageVisualProfile = {
					...base,
					projection: { perspectiveCompression: compression },
				};
				let previous = -Infinity;
				let monotonic = true;
				for (let i = 0; i <= 100; i += 1) {
					const depth = stageDepthForProgress(i / 100, profile);
					if (depth < previous - 1e-12) monotonic = false;
					previous = depth;
				}
				expect(monotonic).toBe(true);
			}
		});
	});
});
