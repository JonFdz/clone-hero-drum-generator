import { describe, expect, it } from "vitest";
import {
	buildHighwayGeometry,
	buildHighwayLaneCenters,
	buildHighwayLaneDividers,
	buildHighwayTargets,
	filterVisibleHighwayNotes,
	projectHighwayNotes,
	projectKickRailAtDepth,
	visibleChartWindow,
} from "./highway-projection";
import { HIGHWAY_SPEED_PRESETS, type HighwaySemanticNote } from "./highway-model";

function pitchedNote(overrides: Partial<HighwaySemanticNote> = {}): HighwaySemanticNote {
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

describe("highway-projection", () => {
	it("filters notes by interval intersection, not only start time", () => {
		const visible = filterVisibleHighwayNotes(
			[
				pitchedNote({ id: "overlap", chartSeconds: 0.2, endChartSeconds: 0.9, length: 96 }),
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
				pitchedNote({ id: "circle", chartLane: 3, pitchedLane: "blue", visualKind: "cymbal-head", chartSeconds: 1.5 }),
				pitchedNote({ id: "tail", chartLane: 4, pitchedLane: "green", chartSeconds: 1.8, endChartSeconds: 3.2, length: 192 }),
				pitchedNote({ id: "kick", chartLane: 0, pitchedLane: null, visualKind: "kick-rail", chartSeconds: 2, endChartSeconds: 2.8, length: 96, fill: "#ff9a3c", stroke: "#ffd8ae" }),
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
				pitchedNote({ id: "invalid-tail", chartSeconds: 1, endChartSeconds: Number.NaN, length: 96 }),
			],
			playbackSeconds: 0,
			previewOffsetSeconds: 0,
			preset,
			geometry,
		});
		expect(projected.sustains).toHaveLength(0);
		expect(projected.heads).toHaveLength(1);
	});

	it("updates visible chart window with speed presets only", () => {
		const fast = visibleChartWindow({
			playbackSeconds: 10,
			previewOffsetSeconds: 0.5,
			preset: HIGHWAY_SPEED_PRESETS[0]!,
		});
		const slow = visibleChartWindow({
			playbackSeconds: 10,
			previewOffsetSeconds: 0.5,
			preset: HIGHWAY_SPEED_PRESETS[2]!,
		});
		expect(fast.startChartSeconds).toBe(slow.startChartSeconds);
		expect(fast.endChartSeconds).toBeLessThan(slow.endChartSeconds);
	});
});
