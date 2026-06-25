// Phase 19B.1 — Highway Stage Visual Profile
//
// Single feature-owned source of truth for the stage-style drum highway
// composition. The projection and renderer consume this profile instead of
// duplicating visual-geometry literals. Chart semantics (lane data, kick
// identity, note meaning) live in highway-model/highway-note-semantics and are
// intentionally NOT owned by this profile.
//
// One production profile is exported. There is no user-selectable theme and no
// persisted visual preference in this phase.

/**
 * Shape of the stage visual profile.
 *
 * The exact field set may evolve; the contract is that every profile-driven
 * visual value used by geometry, projection and rendering is discoverable here
 * rather than scattered as renderer/projection-local literals.
 */
export type HighwayStageVisualProfile = {
	/** Scene framing: the playable road lives inside a bounded centered viewport. */
	scene: {
		/** Hard cap (CSS px) for the road viewport width on wide canvases. */
		maxRoadViewportWidth: number;
		/** Fraction of canvas width used for the road viewport before capping. */
		roadViewportWidthRatio: number;
		/** Minimum road viewport width (CSS px) before the road collapses. */
		minRoadViewportWidth: number;
		/** Minimum dark scene padding retained on each side of the road. */
		sideScenePadding: number;
		/** Horizon Y as a fraction of scene height (smaller = farther / deeper road). */
		horizonRatio: number;
		/** Hit-line / target-row Y as a fraction of scene height. */
		hitLineRatio: number;
	};
	/** Road trapezoid and grid treatment. */
	road: {
		/** Top (far) road width as a fraction of the road viewport width. */
		topWidthRatio: number;
		/** Bottom (near) road width as a fraction of the road viewport width. */
		bottomWidthRatio: number;
		/** Outer border thickness at the near (hit-line) edge. */
		borderWidthNear: number;
		/** Outer border thickness at the far (horizon) edge. */
		borderWidthFar: number;
		/** Internal lane divider alpha (quieter than outer borders). */
		laneDividerAlpha: number;
	};
	/** Named monotonic time-to-depth parameters. */
	projection: {
		/** Perspective compression factor for calibrated time-to-depth projection. */
		perspectiveCompression: number;
	};
	/** Compact target pads. */
	targets: {
		/** Maximum target pad height at the near edge (CSS px). */
		heightNear: number;
		/** Minimum target pad height on narrow local lanes (CSS px). */
		minHeight: number;
		/** Target height as a fraction of the local lane width. */
		heightLaneWidthRatio: number;
		/** Interior fill alpha (darker/more solid gameplay base). */
		interiorAlpha: number;
		/** Lane-colored outline thickness. */
		outlineWidth: number;
		/** Inset ratio within each lane at the hit line. */
		laneInsetRatio: number;
		/** Bottom lip depth as a fraction of target height. */
		bottomLipRatio: number;
		/** Top taper inset (CSS px). */
		topTaperInset: number;
	};
	/** Note-head, kick-rail and sustain dimensions. */
	notes: {
		/** Square head half-size at the near edge (CSS px). */
		squareNearSize: number;
		/** Square head half-size at the far edge (CSS px). */
		squareFarSize: number;
		/** Maximum square-head half-size as a fraction of the local lane width. */
		squareMaxLaneWidthRatio: number;
		/** Cymbal disc radius at the near edge (CSS px). */
		circleNearRadius: number;
		/** Cymbal disc radius at the far edge (CSS px). */
		circleFarRadius: number;
		/** Maximum cymbal radius as a fraction of the local lane width. */
		circleMaxLaneWidthRatio: number;
		/** Kick rail thickness at the near edge (CSS px). */
		kickRailNearThickness: number;
		/** Kick rail thickness at the far edge (CSS px). */
		kickRailFarThickness: number;
		/** Alpha applied to sustain bands (quieter than their terminal head/rail). */
		sustainAlpha: number;
	};
	/** Compact technical HUD. */
	hud: {
		/** Default visibility for the stage profile (off by default). */
		enabledByDefault: boolean;
		/** HUD font size (CSS px). */
		fontSize: number;
		/** HUD text alpha. */
		alpha: number;
		/** Inset from the chosen corner (CSS px). */
		edgeInset: number;
	};
	/** Original procedural Canvas palette (no external assets). */
	palette: {
		sceneBackground: string;
		sceneVignetteInner: string;
		sceneVignetteOuter: string;
		roadFillNear: string;
		roadFillFar: string;
		roadBorderNear: string;
		roadBorderFar: string;
		beatLine: string;
		measureLine: string;
		hitLine: string;
		targetInterior: string;
		hudText: string;
	};
};

/**
 * The single production stage visual profile.
 *
 * This calibration pass intentionally pushes the composition closer to a long,
 * narrow, centered gameplay road with more black negative space, smaller note
 * pieces, and a more conservative HUD. The road is materially narrower on wide
 * canvases, the horizon sits higher to lengthen the stage, and the near field
 * is deeper thanks to a lower hit line.
 */
export const HIGHWAY_STAGE_VISUAL_PROFILE: HighwayStageVisualProfile = {
	scene: {
		maxRoadViewportWidth: 560,
		roadViewportWidthRatio: 0.32,
		minRoadViewportWidth: 250,
		sideScenePadding: 24,
		horizonRatio: 0.27,
		hitLineRatio: 0.74,
	},
	road: {
		topWidthRatio: 0.16,
		bottomWidthRatio: 0.66,
		borderWidthNear: 2.25,
		borderWidthFar: 1,
		laneDividerAlpha: 0.1,
	},
	projection: {
		perspectiveCompression: 0.4,
	},
	targets: {
		heightNear: 11,
		minHeight: 7,
		heightLaneWidthRatio: 0.24,
		interiorAlpha: 0.48,
		outlineWidth: 1.75,
		laneInsetRatio: 0.16,
		bottomLipRatio: 0.12,
		topTaperInset: 4,
	},
	notes: {
		squareNearSize: 11,
		squareFarSize: 4,
		squareMaxLaneWidthRatio: 0.23,
		circleNearRadius: 9.5,
		circleFarRadius: 3.75,
		circleMaxLaneWidthRatio: 0.21,
		kickRailNearThickness: 6,
		kickRailFarThickness: 2,
		sustainAlpha: 0.26,
	},
	hud: {
		enabledByDefault: false,
		fontSize: 9,
		alpha: 0.38,
		edgeInset: 8,
	},
	palette: {
		sceneBackground: "#03050b",
		sceneVignetteInner: "rgba(8, 10, 18, 0)",
		sceneVignetteOuter: "rgba(0, 0, 0, 0.64)",
		roadFillNear: "#0a101d",
		roadFillFar: "#050914",
		roadBorderNear: "rgba(140, 156, 188, 0.46)",
		roadBorderFar: "rgba(98, 112, 144, 0.22)",
		beatLine: "rgba(150, 160, 185, 0.1)",
		measureLine: "rgba(175, 185, 210, 0.18)",
		hitLine: "rgba(188, 198, 222, 0.24)",
		targetInterior: "#03060c",
		hudText: "#8f9dbf",
	},
};

/**
 * Named, profile-driven monotonic depth curve.
 *
 * Maps a normalized look-ahead progress (`0` at the hit line, `1` at the
 * horizon) to a depth value in `[0, 1]` used to interpolate road width and Y.
 *
 * Contract:
 * - receives finite values; non-finite input yields 0;
 * - returns finite values clamped to `[0, 1]`;
 * - monotonic non-decreasing for valid profile values;
 * - strongly expands the lower field while compressing primarily toward the
 *   horizon.
 *
 * Implementation: calibrated perspective-style mapping.
 *
 * `depth = p / (p + perspectiveCompression * (1 - p))`
 *
 * This camera-calibration pass replaces the earlier generic ease-out curve with
 * a named perspective-style mapping so the lower field opens up more
 * aggressively while the far horizon still compresses. Lower compression values
 * produce a longer, gameplay-like near field; higher values flatten it back
 * toward the hit line.
 */
export function stageDepthForProgress(
	progress: number,
	profile: HighwayStageVisualProfile,
): number {
	if (!Number.isFinite(progress)) return 0;
	const p = clamp(progress, 0, 1);
	const compression = Math.max(0.01, profile.projection.perspectiveCompression);
	const denominator = p + compression * (1 - p);
	const depth = denominator <= 0 ? 0 : clamp(p / denominator, 0, 1);
	return Number.isFinite(depth) ? depth : 0;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}
