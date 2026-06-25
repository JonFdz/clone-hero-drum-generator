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
		/** Horizon Y as a fraction of scene height (lower = deeper stage). */
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
	/** Named monotonic depth curve parameters. */
	projection: {
		/** Base ease-out exponent for the depth curve (>1 compresses distance). */
		depthExponent: number;
		/** Extra curvature added to the exponent to widen the near field. */
		nearFieldBias: number;
	};
	/** Compact target pads. */
	targets: {
		/** Target pad height at the near edge (CSS px). */
		heightNear: number;
		/** Interior fill alpha (dark/low-alpha interior). */
		interiorAlpha: number;
		/** Lane-colored outline thickness. */
		outlineWidth: number;
	};
	/** Note-head, kick-rail and sustain dimensions. */
	notes: {
		/** Square head half-size at the near edge (CSS px). */
		squareNearSize: number;
		/** Square head half-size at the far edge (CSS px). */
		squareFarSize: number;
		/** Cymbal disc radius at the near edge (CSS px). */
		circleNearRadius: number;
		/** Cymbal disc radius at the far edge (CSS px). */
		circleFarRadius: number;
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
 * Tuned so that on a wide canvas the bottom road lands in the 34–48% band of
 * canvas width, the top road stays in the 8–16% band, the horizon sits in the
 * upper-middle scene, and the hit line leaves a spacious near field. Narrow
 * canvases retain safe side padding via minRoadViewportWidth + sideScenePadding.
 */
export const HIGHWAY_STAGE_VISUAL_PROFILE: HighwayStageVisualProfile = {
	scene: {
		maxRoadViewportWidth: 760,
		roadViewportWidthRatio: 0.46,
		minRoadViewportWidth: 300,
		sideScenePadding: 18,
		horizonRatio: 0.34,
		hitLineRatio: 0.82,
	},
	road: {
		topWidthRatio: 0.3,
		bottomWidthRatio: 0.92,
		borderWidthNear: 2.5,
		borderWidthFar: 1,
		laneDividerAlpha: 0.12,
	},
	projection: {
		depthExponent: 2.2,
		nearFieldBias: 0.2,
	},
	targets: {
		heightNear: 16,
		interiorAlpha: 0.18,
		outlineWidth: 2,
	},
	notes: {
		squareNearSize: 17,
		squareFarSize: 6,
		circleNearRadius: 15,
		circleFarRadius: 5,
		kickRailNearThickness: 9,
		kickRailFarThickness: 3,
		sustainAlpha: 0.32,
	},
	hud: {
		enabledByDefault: false,
		fontSize: 11,
		alpha: 0.62,
		edgeInset: 12,
	},
	palette: {
		sceneBackground: "#05070f",
		sceneVignetteInner: "rgba(10, 14, 26, 0)",
		sceneVignetteOuter: "rgba(0, 0, 0, 0.55)",
		roadFillNear: "#0c1322",
		roadFillFar: "#070b16",
		roadBorderNear: "rgba(150, 170, 205, 0.55)",
		roadBorderFar: "rgba(110, 130, 165, 0.28)",
		beatLine: "rgba(150, 160, 185, 0.14)",
		measureLine: "rgba(175, 185, 210, 0.26)",
		hitLine: "rgba(200, 210, 235, 0.5)",
		targetInterior: "#080d18",
		hudText: "#aebbdc",
	},
};

/**
 * Named, profile-driven monotonic depth curve.
 *
 * Maps a normalized look-ahead progress (`0` at the hit line, `1` at the
 * horizon) to a depth value in `[0, 1]` used to interpolate road width and Y.
 *
 * Contract:
 * - receives finite values; non-finite input is clamped to 0;
 * - returns finite values clamped to `[0, 1]`;
 * - monotonic non-decreasing for the production profile;
 * - compresses distant notes smoothly toward the horizon (depth → 1) while
 *   leaving readable spacing between notes near the target row.
 *
 * Implementation: a generalized ease-out `1 - (1 - p)^k` where `k` is the
 * profile exponent plus the near-field bias. For any `k > 0` this is strictly
 * monotonic on `[0, 1]`, with `f(0) = 0` and `f(1) = 1`. Larger `k` increases
 * curvature, pushing more of the visible window into the near field and
 * compressing distant notes toward the horizon.
 */
export function stageDepthForProgress(
	progress: number,
	profile: HighwayStageVisualProfile,
): number {
	if (!Number.isFinite(progress)) return 0;
	const p = clamp(progress, 0, 1);
	const exponent = Math.max(
		0.1,
		profile.projection.depthExponent + profile.projection.nearFieldBias,
	);
	const shaped = 1 - Math.pow(1 - p, exponent);
	const depth = clamp(shaped, 0, 1);
	return Number.isFinite(depth) ? depth : 0;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}
