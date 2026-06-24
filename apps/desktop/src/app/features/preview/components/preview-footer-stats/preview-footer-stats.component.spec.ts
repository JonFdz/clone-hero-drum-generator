import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { PreviewFooterStatsComponent } from "./preview-footer-stats.component";

describe("PreviewFooterStatsComponent", () => {
	it("derives status text for each waveform status", () => {
		const c = new PreviewFooterStatsComponent();
		c.waveformStatus = "ready";
		expect(c.statusText()).toBe("Ready");

		c.waveformStatus = "loading";
		expect(c.statusText()).toBe("Loading waveform");

		c.waveformStatus = "empty";
		expect(c.statusText()).toBe("No waveform");
	});

	it("uses waveformError fallback when status is error", () => {
		const c = new PreviewFooterStatsComponent();
		c.waveformStatus = "error";
		c.waveformError = "Decode failed";
		expect(c.statusText()).toBe("Decode failed");

		c.waveformError = null;
		expect(c.statusText()).toBe("Waveform unavailable");
	});

	it("defaults to idle when status is idle", () => {
		const c = new PreviewFooterStatsComponent();
		expect(c.statusText()).toBe("Idle");
	});

	it("formats duration using formatTime", () => {
		const c = new PreviewFooterStatsComponent();
		expect(c.formatDuration(0)).toBe("00:00.000");
		expect(c.formatDuration(65.5)).toBe("01:05.500");
	});
});
