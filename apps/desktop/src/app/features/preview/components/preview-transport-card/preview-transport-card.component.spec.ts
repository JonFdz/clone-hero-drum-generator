import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { PreviewTransportCardComponent } from "./preview-transport-card.component";

describe("PreviewTransportCardComponent", () => {
	it("emits playPressed when not playing and togglePlay is called", () => {
		const c = new PreviewTransportCardComponent();
		let playCount = 0;
		let pauseCount = 0;
		c.playPressed.subscribe(() => (playCount += 1));
		c.pausePressed.subscribe(() => (pauseCount += 1));

		c.isPlaying = false;
		c.togglePlay();
		expect(playCount).toBe(1);
		expect(pauseCount).toBe(0);
	});

	it("emits pausePressed when playing and togglePlay is called", () => {
		const c = new PreviewTransportCardComponent();
		let pauseCount = 0;
		c.pausePressed.subscribe(() => (pauseCount += 1));

		c.isPlaying = true;
		c.togglePlay();
		expect(pauseCount).toBe(1);
	});

	it("computes seek progress percent from currentTime and duration", () => {
		const c = new PreviewTransportCardComponent();
		c.duration = 100;
		c.currentTime = 25;
		expect(c.seekProgressPercent()).toBe(25);

		c.currentTime = 0;
		expect(c.seekProgressPercent()).toBe(0);
	});

	it("returns 0 progress when duration is 0 or invalid", () => {
		const c = new PreviewTransportCardComponent();
		c.duration = 0;
		c.currentTime = 10;
		expect(c.seekProgressPercent()).toBe(0);
	});

	it("computes seek thumb transform at boundaries", () => {
		const c = new PreviewTransportCardComponent();
		c.duration = 100;

		c.currentTime = 0;
		expect(c.seekThumbTransform()).toBe("translate(0, -50%)");

		c.currentTime = 100;
		expect(c.seekThumbTransform()).toBe("translate(-100%, -50%)");

		c.currentTime = 50;
		expect(c.seekThumbTransform()).toBe("translate(-50%, -50%)");
	});

	it("clamps safeCurrentTime to duration", () => {
		const c = new PreviewTransportCardComponent();
		c.duration = 50;
		c.currentTime = 75;
		expect(c.safeCurrentTime()).toBe(50);

		c.currentTime = -10;
		expect(c.safeCurrentTime()).toBe(0);
	});

	it("emits clamped seek value on seekBy", () => {
		const c = new PreviewTransportCardComponent();
		const seeks: number[] = [];
		c.seek.subscribe((v) => seeks.push(v));

		c.duration = 100;
		c.currentTime = 95;
		c.seekBy(10);
		expect(seeks).toEqual([100]);

		c.currentTime = 3;
		c.seekBy(-10);
		expect(seeks).toEqual([100, 0]);
	});
});
