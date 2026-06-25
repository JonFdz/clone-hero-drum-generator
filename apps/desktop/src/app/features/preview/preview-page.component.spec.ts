import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { PreviewPageComponent } from "./preview-page.component";

describe("PreviewPageComponent", () => {
	it("formats diagnostic time as MM:SS.mmm", () => {
		const c = new PreviewPageComponent(null as never);
		expect(c.formatDiagnosticTime(0)).toBe("00:00.000");
		expect(c.formatDiagnosticTime(65.5)).toBe("01:05.500");
		expect(c.formatDiagnosticTime(undefined)).toBe("Unavailable");
		expect(c.formatDiagnosticTime(-1)).toBe("Unavailable");
		expect(c.formatDiagnosticTime(Number.NaN)).toBe("Unavailable");
	});

	it("converts offset seconds to rounded milliseconds", () => {
		const c = new PreviewPageComponent(null as never);
		expect(c.formatOffsetMilliseconds(0)).toBe(0);
		expect(c.formatOffsetMilliseconds(0.1234)).toBe(123);
		expect(c.formatOffsetMilliseconds(-0.05)).toBe(-50);
	});

	it("starts with isPlaying false", () => {
		const c = new PreviewPageComponent(null as never);
		expect(c.isPlaying()).toBe(false);
	});

	it("defaults to chart mode, normal highway preset, and HUD off", () => {
		const c = new PreviewPageComponent(null as never);
		expect(c.visualMode()).toBe("chart");
		expect(c.highwayPreset()).toBe("normal");
		expect(c.highwayHudEnabled()).toBe(false);
	});
});
