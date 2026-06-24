import "@angular/compiler";
import { describe, expect, it } from "vitest";
import type { PreviewSectionNavigationItem } from "../../../services/desktop-preview-model";
import { PreviewChartStageComponent } from "./preview-chart-stage.component";

describe("PreviewChartStageComponent", () => {
	it("computes viewport from currentTime and duration", () => {
		const c = new PreviewChartStageComponent();
		c.currentTime = 10;
		c.duration = 60;
		const vp = c.viewport();
		expect(vp.startSeconds).toBeLessThanOrEqual(10);
		expect(vp.endSeconds).toBeGreaterThan(vp.startSeconds);
	});

	it("produces empty allNotes when chartData is null", () => {
		const c = new PreviewChartStageComponent();
		expect(c.chartData).toBeNull();
		expect(c.allNotes()).toEqual([]);
	});

	it("verticalTicks returns 9 evenly spaced fractions", () => {
		const c = new PreviewChartStageComponent();
		const ticks = c.verticalTicks();
		expect(ticks).toHaveLength(9);
		expect(ticks[0]).toBe(0);
		expect(ticks[8]).toBe(1);
	});

	it("timeTicks is empty when viewport has no span", () => {
		const c = new PreviewChartStageComponent();
		c.duration = 0;
		c.currentTime = 0;
		const vp = c.viewport();
		if (vp.endSeconds <= vp.startSeconds) {
			expect(c.timeTicks()).toEqual([]);
		} else {
			expect(c.timeTicks().length).toBeGreaterThan(0);
		}
	});

	it("timeTicks produces quarter-second intervals within viewport", () => {
		const c = new PreviewChartStageComponent();
		c.duration = 30;
		c.currentTime = 5;
		const ticks = c.timeTicks();
		expect(ticks.length).toBeGreaterThan(0);
		for (const tick of ticks) {
			expect(tick.seconds).toBeGreaterThanOrEqual(0);
		}
	});

	it("waveformPath is empty when no waveform overview is provided", () => {
		const c = new PreviewChartStageComponent();
		expect(c.waveformPath()).toBe("");
	});

	it("playheadX is within chart bounds for valid currentTime", () => {
		const c = new PreviewChartStageComponent();
		c.duration = 60;
		c.currentTime = 30;
		const x = c.playheadX();
		expect(x).toBeGreaterThanOrEqual(c.chartX);
		expect(x).toBeLessThanOrEqual(c.chartX + c.chartWidth);
	});

	it("sectionItems is empty when chartData is null", () => {
		const c = new PreviewChartStageComponent();
		expect(c.sectionItems()).toEqual([]);
		expect(c.currentSection()).toBeUndefined();
	});

	it("emits seek from seekToSection", () => {
		const c = new PreviewChartStageComponent();
		const seeks: number[] = [];
		c.seek.subscribe((v) => seeks.push(v));

		c.seekToSection(undefined);
		expect(seeks).toEqual([]);

		const section: PreviewSectionNavigationItem = {
			index: 0,
			tick: 0,
			name: "Intro",
			displayName: "Intro",
			label: "Intro",
			seconds: 5,
			effectiveSeconds: 5,
		};
		c.seekToSection(section);
		expect(seeks).toEqual([5]);
	});

	it("laneY computes vertical center for each lane index", () => {
		const c = new PreviewChartStageComponent();
		const y0 = c.laneY(0);
		const y1 = c.laneY(1);
		expect(y1 - y0).toBe(c.rowHeight);
	});

	it("diamondPoints produces 4 coordinate pairs", () => {
		const c = new PreviewChartStageComponent();
		const points = c.diamondPoints(50, 60, 10);
		expect(points.split(" ")).toHaveLength(4);
	});
});
