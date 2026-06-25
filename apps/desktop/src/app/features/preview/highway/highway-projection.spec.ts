import { describe, expect, it } from "vitest";
import {
	buildHighwayGeometry,
	buildHighwayLaneCenters,
	buildHighwayLaneDividers,
	buildHighwayTargets,
	filterVisibleHighwayNotes,
	projectHighwayNotes,
	projectHighwayLines,
	projectKickRailAtDepth,
	roadBoundsAtDepth,
	visibleChartWindow,
} from "./highway-projection";
import {
	HIGHWAY_SPEED_PRESETS,
	type HighwayProjectedHead,
	type HighwaySemanticNote,
} from "./highway-model";
import {
	HIGHWAY_STAGE_VISUAL_PROFILE,
	stageDepthForProgress,
	type HighwayStageVisualProfile,
} from "./highway-stage-visual-profile";

function pitchedNote(
	overrides: Partial<HighwaySemanticNote> = {},
): HighwaySemanticNote {
	return {
		id: "pitched",
		tick: 192,
		chartLane: 2,
		pitchedLane: "yellow",
		visualKind: "square-head",
		dynamic: null,
		length: 0,
		chartSeconds: 1,
		endChartSeconds: 1,
		fill: "#ffd84d",
		stroke: "#fff0b0",
		...overrides,
	};
}

function expectSquareHead(
	head: HighwayProjectedHead | undefined,
): Extract<HighwayProjectedHead, { visualKind: "square-head" }> {
	expect(head?.visualKind).toBe("square-head");
	return head as Extract<HighwayProjectedHead, { visualKind: "square-head" }>;
}

function normalizedGap(
	nearY: number,
	farY: number,
	geometry: { hitLineY: number; horizonY: number },
): number {
	return (nearY - farY) / (geometry.hitLineY - geometry.horizonY);
}

describe("highway-projection", () => {
	it("filters notes by interval intersection, not only start time", () => {
		const visible = filterVisibleHighwayNotes(
			[
				pitchedNote({
					id: "overlap",
					chartSeconds: 0.2,
					endChartSeconds: 0.9,
					length: 96,
				}),
				pitchedNote({ id: "inside", chartSeconds: 1, endChartSeconds: 1 }),
				pitchedNote({ id: "outside", chartSeconds: 5, endChartSeconds: 5 }),
			],
			0.5,
			4.5,
		);
		expect(visible.map((note) => note.id)).toEqual(["overlap", "inside"]);
	});

	it("builds exactly four pitched lane centers, three dividers, and four targets", () => {
		const geometry = buildHighwayGeometry(800, 420);
		expect(buildHighwayLaneCenters(geometry)).toHaveLength(4);
		expect(buildHighwayLaneDividers(geometry)).toHaveLength(3);
		expect(buildHighwayTargets(geometry)).toHaveLength(4);
	});

	it("keeps four lane centers ordered inside road bounds with no fifth target", () => {
		const geometry = buildHighwayGeometry(800, 420);
		const centers = buildHighwayLaneCenters(geometry);
		expect(centers).toEqual([...centers].sort((a, b) => a - b));
		expect(centers[0]).toBeGreaterThan(0);
		expect(centers.at(-1)).toBeLessThan(800);
		expect(buildHighwayTargets(geometry).map((target) => target.lane)).toEqual([
			"red",
			"yellow",
			"blue",
			"green",
		]);
	});

	it("projects kick rail inside road bounds instead of as a fifth lane center", () => {
		const geometry = buildHighwayGeometry(800, 420);
		const rail = projectKickRailAtDepth(geometry, 0.2);
		const roadLeft = geometry.roadCenterX - geometry.bottomRoadWidth / 2;
		const roadRight = geometry.roadCenterX + geometry.bottomRoadWidth / 2;
		expect(rail.leftX).toBeGreaterThan(roadLeft);
		expect(rail.rightX).toBeLessThan(roadRight);
		expect(rail.width).toBeGreaterThan(0);
	});

	it("projects square heads, circular cymbals, kick rails, and sustains", () => {
		const geometry = buildHighwayGeometry(800, 420);
		const preset = HIGHWAY_SPEED_PRESETS[1]!;
		const projected = projectHighwayNotes({
			notes: [
				pitchedNote({ id: "square", chartSeconds: 1.2 }),
				pitchedNote({
					id: "circle",
					chartLane: 3,
					pitchedLane: "blue",
					visualKind: "cymbal-head",
					chartSeconds: 1.5,
				}),
				pitchedNote({
					id: "tail",
					chartLane: 4,
					pitchedLane: "green",
					chartSeconds: 1.8,
					endChartSeconds: 3.2,
					length: 192,
				}),
				pitchedNote({
					id: "kick",
					chartLane: 0,
					pitchedLane: null,
					visualKind: "kick-rail",
					chartSeconds: 2,
					endChartSeconds: 2.8,
					length: 96,
					fill: "#ff9a3c",
					stroke: "#ffd8ae",
				}),
			],
			playbackSeconds: 0,
			previewOffsetSeconds: 0,
			preset,
			geometry,
		});
		expect(projected.heads.map((head) => head.visualKind)).toEqual([
			"kick-rail",
			"square-head",
			"cymbal-head",
			"square-head",
		]);
		expect(projected.sustains.map((sustain) => sustain.kind)).toEqual([
			"kick",
			"pitched",
		]);
	});

	it("falls back safely by omitting invalid sustain geometry while keeping head geometry", () => {
		const geometry = buildHighwayGeometry(800, 420);
		const preset = HIGHWAY_SPEED_PRESETS[1]!;
		const projected = projectHighwayNotes({
			notes: [
				pitchedNote({
					id: "invalid-tail",
					chartSeconds: 1,
					endChartSeconds: Number.NaN,
					length: 96,
				}),
			],
			playbackSeconds: 0,
			previewOffsetSeconds: 0,
			preset,
			geometry,
		});
		expect(projected.sustains).toHaveLength(0);
		expect(projected.heads).toHaveLength(1);
	});

	it("updates visible chart window with Fast shorter than Normal while still showing meaningful future content", () => {
		const fast = visibleChartWindow({
			playbackSeconds: 10,
			previewOffsetSeconds: 0.5,
			preset: HIGHWAY_SPEED_PRESETS[0]!,
		});
		const normal = visibleChartWindow({
			playbackSeconds: 10,
			previewOffsetSeconds: 0.5,
			preset: HIGHWAY_SPEED_PRESETS[1]!,
		});
		const slow = visibleChartWindow({
			playbackSeconds: 10,
			previewOffsetSeconds: 0.5,
			preset: HIGHWAY_SPEED_PRESETS[2]!,
		});
		expect(fast.startChartSeconds).toBe(normal.startChartSeconds);
		expect(normal.startChartSeconds).toBe(slow.startChartSeconds);
		expect(fast.endChartSeconds).toBeCloseTo(12.5, 5);
		expect(normal.endChartSeconds).toBeCloseTo(14, 5);
		expect(slow.endChartSeconds).toBeCloseTo(15.5, 5);
		expect(fast.endChartSeconds).toBeLessThan(normal.endChartSeconds);
		expect(normal.endChartSeconds).toBeLessThan(slow.endChartSeconds);
		expect(fast.endChartSeconds - fast.startChartSeconds).toBeGreaterThan(2.5);
	});

	describe("stage scene viewport (profile-driven)", () => {
		it("bounds and centers the road on a wide canvas with lateral negative space and a tall gameplay field", () => {
			const geometry = buildHighwayGeometry(1600, 720);
			const roadLeft = geometry.roadCenterX - geometry.bottomRoadWidth / 2;
			const roadRight = geometry.roadCenterX + geometry.bottomRoadWidth / 2;
			const playableSpanRatio =
				(geometry.hitLineY - geometry.horizonY) / geometry.cssHeight;
			// Near road should occupy about a third of the canvas width, not a tiny sliver.
			expect(geometry.bottomRoadWidth).toBeLessThan(1600 * 0.38);
			expect(geometry.bottomRoadWidth).toBeGreaterThan(1600 * 0.33);
			// Centered within 1 CSS px tolerance.
			expect(Math.abs(geometry.roadCenterX - 1600 / 2)).toBeLessThanOrEqual(1);
			// Negative space remains primarily lateral.
			expect(roadLeft).toBeGreaterThan(1600 * 0.3);
			expect(1600 - roadRight).toBeGreaterThan(1600 * 0.3);
			// Road occupies most of the useful vertical playfield.
			expect(geometry.horizonY).toBeGreaterThanOrEqual(720 * 0.18);
			expect(geometry.horizonY).toBeLessThanOrEqual(720 * 0.22);
			expect(geometry.hitLineY).toBeGreaterThanOrEqual(720 * 0.88);
			expect(geometry.hitLineY).toBeLessThanOrEqual(720 * 0.91);
			expect(playableSpanRatio).toBeGreaterThanOrEqual(0.7);
			expect(playableSpanRatio).toBeLessThanOrEqual(0.75);
		});

		it("caps the road viewport with the profile maximum on very wide canvases", () => {
			const profile = HIGHWAY_STAGE_VISUAL_PROFILE;
			const geometry = buildHighwayGeometry(2400, 720);
			const expectedViewport = Math.min(
				profile.scene.maxRoadViewportWidth,
				2400 * profile.scene.roadViewportWidthRatio,
			);
			expect(geometry.bottomRoadWidth).toBeCloseTo(
				expectedViewport * profile.road.bottomWidthRatio,
				5,
			);
		});

		it("keeps geometry safe and centered on an ordinary canvas", () => {
			const geometry = buildHighwayGeometry(800, 420);
			expect(Math.abs(geometry.roadCenterX - 400)).toBeLessThanOrEqual(1);
			expect(geometry.bottomRoadWidth).toBeGreaterThan(0);
			expect(geometry.topRoadWidth).toBeGreaterThan(0);
			expect(geometry.topRoadWidth).toBeLessThan(geometry.bottomRoadWidth);
			expect(geometry.horizonY).toBeLessThan(geometry.hitLineY);
		});

		it("keeps geometry safe on a narrow canvas without clipping past the scene padding", () => {
			const geometry = buildHighwayGeometry(320, 480);
			const roadLeft = geometry.roadCenterX - geometry.bottomRoadWidth / 2;
			const roadRight = geometry.roadCenterX + geometry.bottomRoadWidth / 2;
			expect(roadLeft).toBeGreaterThanOrEqual(0);
			expect(roadRight).toBeLessThanOrEqual(320);
			expect(Math.abs(geometry.roadCenterX - 160)).toBeLessThanOrEqual(1);
			expect(geometry.bottomRoadWidth).toBeGreaterThan(0);
			expect(geometry.topRoadWidth).toBeGreaterThan(0);
		});

		it("preserves exactly four centers, three dividers, and four targets under the stage profile", () => {
			const geometry = buildHighwayGeometry(1280, 600);
			expect(buildHighwayLaneCenters(geometry)).toHaveLength(4);
			expect(buildHighwayLaneDividers(geometry)).toHaveLength(3);
			expect(buildHighwayTargets(geometry)).toHaveLength(4);
			expect(buildHighwayLaneCenters(geometry, 0.5)).toHaveLength(4);
		});

		it("never introduces a fifth kick target, center, or divider", () => {
			const geometry = buildHighwayGeometry(1280, 600);
			const targets = buildHighwayTargets(geometry);
			expect(targets.map((t) => t.lane)).toEqual([
				"red",
				"yellow",
				"blue",
				"green",
			]);
			// Kick rail is a road-contained rail, not a lane center/target/divider.
			const rail = projectKickRailAtDepth(geometry, 0);
			const centers = buildHighwayLaneCenters(geometry, 0);
			expect(rail.width).toBeGreaterThan(0);
			expect(centers).not.toContain(rail.leftX);
			expect(targets).not.toContainEqual(
				expect.objectContaining({ lane: expect.stringContaining("kick") }),
			);
		});

		it("keeps the kick rail inside road bounds at near and far depths", () => {
			const geometry = buildHighwayGeometry(1200, 600);
			for (const depth of [0, 0.25, 0.5, 0.75, 1]) {
				const rail = projectKickRailAtDepth(geometry, depth);
				const bounds = roadBoundsAtDepth(geometry, depth);
				expect(rail.leftX).toBeGreaterThanOrEqual(bounds.leftX);
				expect(rail.rightX).toBeLessThanOrEqual(bounds.rightX);
				expect(rail.width).toBeGreaterThan(0);
			}
		});

		it("derives targets and projection from the same road geometry (no renderer-only interpretation)", () => {
			const geometry = buildHighwayGeometry(1100, 560);
			const targets = buildHighwayTargets(geometry);
			const bounds = roadBoundsAtDepth(geometry, 0);
			for (const target of targets) {
				expect(target.leftX).toBeGreaterThanOrEqual(bounds.leftX);
				expect(target.rightX).toBeLessThanOrEqual(bounds.rightX);
			}
		});

		it("respects an explicit profile override for the road viewport", () => {
			const narrowProfile: HighwayStageVisualProfile = {
				...HIGHWAY_STAGE_VISUAL_PROFILE,
				scene: {
					...HIGHWAY_STAGE_VISUAL_PROFILE.scene,
					roadViewportWidthRatio: 0.3,
					maxRoadViewportWidth: 360,
				},
			};
			const geometry = buildHighwayGeometry(1400, 600, narrowProfile);
			const full = buildHighwayGeometry(1400, 600);
			const expectedViewport = Math.min(
				narrowProfile.scene.maxRoadViewportWidth,
				1400 * narrowProfile.scene.roadViewportWidthRatio,
			);
			expect(geometry.bottomRoadWidth).toBeLessThan(full.bottomRoadWidth);
			expect(geometry.bottomRoadWidth).toBeCloseTo(
				expectedViewport * narrowProfile.road.bottomWidthRatio,
				5,
			);
		});

		it("projects musical lines with finite clamped depths and monotonic screen ordering", () => {
			const geometry = buildHighwayGeometry(900, 480);
			const preset = HIGHWAY_SPEED_PRESETS[1]!;
			const lines = projectHighwayLines({
				lines: [
					{ tick: 0, kind: "beat", chartSeconds: 0.4, measure: 0, beat: 2 },
					{ tick: 192, kind: "beat", chartSeconds: 0.8, measure: 1, beat: 1 },
					{
						tick: 384,
						kind: "measure",
						chartSeconds: 1.2,
						measure: 1,
						beat: 1,
					},
				],
				playbackSeconds: 0,
				previewOffsetSeconds: 0,
				preset,
				geometry,
			});
			// Lines are returned sorted by screen Y ascending (near to far), so depth
			// is non-increasing under a monotonic curve.
			const ys = lines.map((l) => l.y);
			expect(ys).toEqual([...ys].sort((a, b) => a - b));
			const depths = lines.map((l) => l.depth);
			for (let i = 1; i < depths.length; i += 1) {
				expect(depths[i]).toBeLessThanOrEqual(depths[i - 1]!);
			}
			for (const depth of depths) {
				expect(Number.isFinite(depth)).toBe(true);
				expect(depth).toBeGreaterThanOrEqual(0);
				expect(depth).toBeLessThanOrEqual(1);
			}
		});
	});

	describe("projection correction pass (fast preset)", () => {
		it("uses the shared gameplay projection while gaining spacing from shorter travel duration", () => {
			const geometry = buildHighwayGeometry(900, 480);
			const fastPreset = HIGHWAY_SPEED_PRESETS[0]!;
			const normalPreset = HIGHWAY_SPEED_PRESETS[1]!;
			const playableHeight = geometry.hitLineY - geometry.horizonY;
			const progress = 0.5;
			const sharedDepth = stageDepthForProgress(
				progress,
				HIGHWAY_STAGE_VISUAL_PROFILE,
			);
			expect(sharedDepth).toBeGreaterThan(0);
			expect(sharedDepth).toBeLessThan(1);
			const fastDepthAtProgress = stageDepthForProgress(
				progress,
				HIGHWAY_STAGE_VISUAL_PROFILE,
			);
			const normalDepthAtProgress = stageDepthForProgress(
				progress,
				HIGHWAY_STAGE_VISUAL_PROFILE,
			);
			const slowDepthAtProgress = stageDepthForProgress(
				progress,
				HIGHWAY_STAGE_VISUAL_PROFILE,
			);
			expect(fastDepthAtProgress).toBeCloseTo(normalDepthAtProgress, 10);
			expect(normalDepthAtProgress).toBeCloseTo(slowDepthAtProgress, 10);

			const deltaSeconds = 1;
			const fastProjectedY =
				geometry.hitLineY -
				stageDepthForProgress(
					deltaSeconds / fastPreset.lookAheadSeconds,
					HIGHWAY_STAGE_VISUAL_PROFILE,
				) *
					playableHeight;
			const normalProjectedY =
				geometry.hitLineY -
				stageDepthForProgress(
					deltaSeconds / normalPreset.lookAheadSeconds,
					HIGHWAY_STAGE_VISUAL_PROFILE,
				) *
					playableHeight;
			expect(fastProjectedY).toBeLessThan(normalProjectedY);

			const fastProjected = projectHighwayNotes({
				notes: [
					pitchedNote({
						id: "n005",
						chartSeconds: 0.05,
						endChartSeconds: 0.05,
					}),
					pitchedNote({ id: "n010", chartSeconds: 0.1, endChartSeconds: 0.1 }),
					pitchedNote({ id: "n020", chartSeconds: 0.2, endChartSeconds: 0.2 }),
					pitchedNote({ id: "n040", chartSeconds: 0.4, endChartSeconds: 0.4 }),
					pitchedNote({ id: "n100", chartSeconds: 1, endChartSeconds: 1 }),
					pitchedNote({ id: "n200", chartSeconds: 2, endChartSeconds: 2 }),
					pitchedNote({
						id: "kick",
						chartLane: 0,
						pitchedLane: null,
						visualKind: "kick-rail",
						chartSeconds: 0.3,
						endChartSeconds: 0.6,
						length: 96,
						fill: "#ff9a3c",
						stroke: "#ffd8ae",
					}),
				],
				playbackSeconds: 0,
				previewOffsetSeconds: 0,
				preset: fastPreset,
				geometry,
			});
			const normalProjected = projectHighwayNotes({
				notes: [
					pitchedNote({
						id: "n005",
						chartSeconds: 0.05,
						endChartSeconds: 0.05,
					}),
					pitchedNote({ id: "n010", chartSeconds: 0.1, endChartSeconds: 0.1 }),
					pitchedNote({ id: "n020", chartSeconds: 0.2, endChartSeconds: 0.2 }),
					pitchedNote({ id: "n040", chartSeconds: 0.4, endChartSeconds: 0.4 }),
				],
				playbackSeconds: 0,
				previewOffsetSeconds: 0,
				preset: normalPreset,
				geometry,
			});
			const fastById = new Map(
				fastProjected.heads.map((head) => [head.id, head]),
			);
			const normalById = new Map(
				normalProjected.heads.map((head) => [head.id, head]),
			);
			const fast005 = expectSquareHead(fastById.get("n005"));
			const fast010 = expectSquareHead(fastById.get("n010"));
			const fast020 = expectSquareHead(fastById.get("n020"));
			const fast040 = expectSquareHead(fastById.get("n040"));
			const fast100 = expectSquareHead(fastById.get("n100"));
			const fast200 = expectSquareHead(fastById.get("n200"));
			const normal005 = expectSquareHead(normalById.get("n005"));
			const normal010 = expectSquareHead(normalById.get("n010"));
			const normal020 = expectSquareHead(normalById.get("n020"));
			const normal040 = expectSquareHead(normalById.get("n040"));
			const kick = fastById.get("kick");
			const fastGap005_010 = normalizedGap(
				fast005.centerY,
				fast010.centerY,
				geometry,
			);
			const fastGap010_020 = normalizedGap(
				fast010.centerY,
				fast020.centerY,
				geometry,
			);
			const fastGap020_040 = normalizedGap(
				fast020.centerY,
				fast040.centerY,
				geometry,
			);
			const normalGap010_020 = normalizedGap(
				normal010.centerY,
				normal020.centerY,
				geometry,
			);

			expect(fast005.centerY).toBeGreaterThan(fast010.centerY);
			expect(fast010.centerY).toBeGreaterThan(fast020.centerY);
			expect(fast020.centerY).toBeGreaterThan(fast040.centerY);
			expect(fast040.centerY).toBeGreaterThan(fast100.centerY);
			expect(fast100.centerY).toBeGreaterThan(fast200.centerY);
			expect(fastGap005_010).toBeGreaterThan(0.015);
			expect(fastGap010_020).toBeGreaterThan(0.03);
			expect(fastGap020_040).toBeGreaterThan(0.055);
			expect(fastGap010_020).toBeGreaterThan(normalGap010_020);
			expect(fastProjected.heads).toHaveLength(7);
			expect(normal005.centerY).toBeGreaterThan(normal010.centerY);
			expect(normal010.centerY).toBeGreaterThan(normal020.centerY);
			expect(normal020.centerY).toBeGreaterThan(normal040.centerY);
			expect(geometry.bottomRoadWidth / geometry.cssWidth).toBeGreaterThan(
				0.33,
			);
			expect(geometry.bottomRoadWidth / geometry.cssWidth).toBeLessThan(0.38);
			expect(buildHighwayTargets(geometry)).toHaveLength(4);
			expect(buildHighwayLaneDividers(geometry)).toHaveLength(3);
			expect(kick?.visualKind).toBe("kick-rail");
		});

		it("does not render a head that is already in the past", () => {
			const geometry = buildHighwayGeometry(900, 480);
			const preset = HIGHWAY_SPEED_PRESETS[0]!;
			const projected = projectHighwayNotes({
				notes: [
					pitchedNote({
						id: "past-head",
						chartSeconds: -0.05,
						endChartSeconds: -0.05,
					}),
					pitchedNote({
						id: "future-head",
						chartSeconds: 0.05,
						endChartSeconds: 0.05,
					}),
				],
				playbackSeconds: 0,
				previewOffsetSeconds: 0,
				preset,
				geometry,
			});
			expect(projected.heads.map((head) => head.id)).toEqual(["future-head"]);
		});

		it("does not render a musical line that is already in the past", () => {
			const geometry = buildHighwayGeometry(900, 480);
			const preset = HIGHWAY_SPEED_PRESETS[0]!;
			const lines = projectHighwayLines({
				lines: [
					{ tick: -48, kind: "beat", chartSeconds: -0.05, measure: 0, beat: 0 },
					{ tick: 48, kind: "beat", chartSeconds: 0.05, measure: 1, beat: 1 },
				],
				playbackSeconds: 0,
				previewOffsetSeconds: 0,
				preset,
				geometry,
			});
			expect(lines.map((line) => line.tick)).toEqual([48]);
		});

		it("clips a sustain crossing playback to the hit line without rendering a duplicate head", () => {
			const geometry = buildHighwayGeometry(900, 480);
			const preset = HIGHWAY_SPEED_PRESETS[0]!;
			const projected = projectHighwayNotes({
				notes: [
					pitchedNote({
						id: "crossing",
						chartSeconds: -0.05,
						endChartSeconds: 0.2,
						length: 96,
					}),
				],
				playbackSeconds: 0,
				previewOffsetSeconds: 0,
				preset,
				geometry,
			});
			const sustain = projected.sustains[0];
			expect(projected.heads).toHaveLength(0);
			expect(projected.sustains).toHaveLength(1);
			expect(sustain?.nearY).toBe(geometry.hitLineY);
		});

		it("clamps projected head sizes relative to local lane width and keeps compact targets", () => {
			const geometry = buildHighwayGeometry(900, 480);
			const projected = projectHighwayNotes({
				notes: [
					pitchedNote({
						id: "square",
						chartSeconds: 0.05,
						endChartSeconds: 0.05,
					}),
					pitchedNote({
						id: "cymbal",
						chartLane: 3,
						pitchedLane: "blue",
						visualKind: "cymbal-head",
						chartSeconds: 0.1,
						endChartSeconds: 0.1,
					}),
				],
				playbackSeconds: 0,
				previewOffsetSeconds: 0,
				preset: HIGHWAY_SPEED_PRESETS[0]!,
				geometry,
			});
			const square = expectSquareHead(
				projected.heads.find((head) => head.id === "square"),
			);
			const cymbal = projected.heads.find((head) => head.id === "cymbal");
			expect(cymbal?.visualKind).toBe("cymbal-head");
			const targets = buildHighwayTargets(geometry);
			const squareBounds = roadBoundsAtDepth(geometry, square.depth);
			expect(square.radius).toBeLessThanOrEqual(
				squareBounds.laneWidth *
					HIGHWAY_STAGE_VISUAL_PROFILE.notes.squareMaxLaneWidthRatio,
			);
			if (cymbal?.visualKind === "cymbal-head") {
				const cymbalBounds = roadBoundsAtDepth(geometry, cymbal.depth);
				expect(cymbal.radius).toBeLessThanOrEqual(
					cymbalBounds.laneWidth *
						HIGHWAY_STAGE_VISUAL_PROFILE.notes.circleMaxLaneWidthRatio,
				);
			}
			for (const target of targets) {
				expect(target.rightX - target.leftX).toBeLessThan(
					geometry.bottomRoadWidth / 4,
				);
			}
		});
	});
});
