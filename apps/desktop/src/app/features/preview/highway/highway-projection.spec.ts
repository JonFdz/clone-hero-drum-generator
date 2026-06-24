import { describe, expect, it } from "vitest";
import {
	buildHighwayGeometry,
	buildHighwaySourceNotes,
	filterVisibleHighwayNotes,
	projectHighwayNotes,
	visibleChartWindow,
} from "./highway-projection";
import { HIGHWAY_SPEED_PRESETS } from "./highway-model";

describe("highway-projection", () => {
	it("creates deterministic source notes with stable ids", () => {
		const notes = buildHighwaySourceNotes([
			{ tick: 192, lane: 2, seconds: 1 },
			{ tick: 192, lane: 2, seconds: 1 },
			{ tick: 192, lane: 9, seconds: 1 },
		]);
		expect(notes.map((note) => note.id)).toEqual(["192-2-0", "192-2-1"]);
	});

	it("filters visible notes inside the chart-time window", () => {
		const notes = buildHighwaySourceNotes([
			{ tick: 0, lane: 1, seconds: 0.4 },
			{ tick: 192, lane: 2, seconds: 1 },
			{ tick: 384, lane: 3, seconds: 4.9 },
		]);
		const visible = filterVisibleHighwayNotes(notes, 0.5, 4.5);
		expect(visible.map((note) => note.lane)).toEqual([2]);
	});

	it("keeps five lane note centers ordered inside road bounds", () => {
		const geometry = buildHighwayGeometry(800, 420);
		const preset = HIGHWAY_SPEED_PRESETS[1]!;
		const projected = projectHighwayNotes({
			notes: buildHighwaySourceNotes([
				{ tick: 0, lane: 0, seconds: 1 },
				{ tick: 1, lane: 1, seconds: 1 },
				{ tick: 2, lane: 2, seconds: 1 },
				{ tick: 3, lane: 3, seconds: 1 },
				{ tick: 4, lane: 4, seconds: 1 },
			]),
			playbackSeconds: 0,
			previewOffsetSeconds: 0,
			preset,
			geometry,
		});
		const centers = projected.map((note) => note.centerX);
		expect(centers).toEqual([...centers].sort((a, b) => a - b));
		expect(centers[0]).toBeGreaterThan(0);
		expect(centers.at(-1)).toBeLessThan(800);
	});

	it("projects hit-line and horizon notes with expected scale ordering", () => {
		const geometry = buildHighwayGeometry(800, 420);
		const preset = HIGHWAY_SPEED_PRESETS[1]!;
		const projected = projectHighwayNotes({
			notes: buildHighwaySourceNotes([
				{ tick: 0, lane: 1, seconds: 1 },
				{ tick: 1, lane: 2, seconds: 1 + preset.lookAheadSeconds },
			]),
			playbackSeconds: 1,
			previewOffsetSeconds: 0,
			preset,
			geometry,
		});
		expect(projected[0]?.radius).toBeLessThan(projected[1]?.radius ?? 0);
		expect(projected[0]?.centerY).toBeLessThan(projected[1]?.centerY ?? 0);
	});

	it("changes visible chart window with speed presets only", () => {
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
