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

	it("keeps the road narrower than the canvas on a wide scene", () => {
		const { scene, road } = HIGHWAY_STAGE_VISUAL_PROFILE;
		const canvasWidth = 1440;
		const viewport = Math.min(
			scene.maxRoadViewportWidth,
			canvasWidth * scene.roadViewportWidthRatio,
		);
		const bottomRoadWidth = viewport * road.bottomWidthRatio;
		// Bottom road must be materially narrower than the canvas (34–48% band).
		expect(bottomRoadWidth).toBeLessThan(canvasWidth * 0.5);
		expect(bottomRoadWidth).toBeGreaterThan(canvasWidth * 0.3);
		// Each side retains substantial dark negative space.
		expect(canvasWidth - bottomRoadWidth).toBeGreaterThan(canvasWidth * 0.5);
	});

	it("uses profile-owned camera ratios inside the calibrated deeper-stage bands", () => {
		const { scene } = HIGHWAY_STAGE_VISUAL_PROFILE;
		expect(scene.horizonRatio).toBeGreaterThanOrEqual(0.24);
		expect(scene.horizonRatio).toBeLessThanOrEqual(0.32);
		expect(scene.hitLineRatio).toBeGreaterThanOrEqual(0.84);
		expect(scene.hitLineRatio).toBeLessThanOrEqual(0.9);
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

		it("keeps the midpoint lower for readability, then compresses hard near the far horizon", () => {
			const profile = HIGHWAY_STAGE_VISUAL_PROFILE;
			// Calibration pass goal: more readable near/mid spacing, so midpoint depth
			// should remain below half the road depth.
			expect(stageDepthForProgress(0.5, profile)).toBeLessThan(0.45);
			// But far notes should still compress strongly toward the horizon.
			expect(stageDepthForProgress(0.9, profile)).toBeGreaterThan(0.9);
		});

		it("returns 0 for non-finite input instead of propagating NaN/Infinity", () => {
			const profile = HIGHWAY_STAGE_VISUAL_PROFILE;
			expect(stageDepthForProgress(Number.NaN, profile)).toBe(0);
			expect(stageDepthForProgress(Number.POSITIVE_INFINITY, profile)).toBe(0);
			expect(stageDepthForProgress(Number.NEGATIVE_INFINITY, profile)).toBe(0);
		});

		it("stays monotonic for a range of calibrated profile parameters", () => {
			const base = HIGHWAY_STAGE_VISUAL_PROFILE;
			for (const params of [
				{
					nearFieldExponent: 1.2,
					farCompressionStart: 0.6,
					farCompressionExponent: 2,
				},
				{
					nearFieldExponent: 1.75,
					farCompressionStart: 0.68,
					farCompressionExponent: 2.9,
				},
				{
					nearFieldExponent: 2.4,
					farCompressionStart: 0.75,
					farCompressionExponent: 4,
				},
			]) {
				const profile: HighwayStageVisualProfile = {
					...base,
					projection: params,
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
