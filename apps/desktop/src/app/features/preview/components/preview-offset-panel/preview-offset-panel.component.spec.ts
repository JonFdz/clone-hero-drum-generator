import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { PreviewOffsetPanelComponent } from "./preview-offset-panel.component";

describe("PreviewOffsetPanelComponent", () => {
	it("computes direction text based on preview offset sign", () => {
		const c = new PreviewOffsetPanelComponent();

		c.previewOffsetMs = 50;
		expect(c.directionText()).toBe("Audio is shifted forward");

		c.previewOffsetMs = -30;
		expect(c.directionText()).toBe("Audio is shifted backward");

		c.previewOffsetMs = 0;
		expect(c.directionText()).toBe("No preview offset applied");
	});

	it("formats signed offset values", () => {
		const c = new PreviewOffsetPanelComponent();
		expect(c.signedOffset(50)).toBe("+50");
		expect(c.signedOffset(-30)).toBe("-30");
		expect(c.signedOffset(0)).toBe("0");
	});

	it("emits nudge values", () => {
		const c = new PreviewOffsetPanelComponent();
		const nudges: number[] = [];
		c.nudge.subscribe((v) => nudges.push(v));

		c.nudge.emit(-100);
		c.nudge.emit(50);
		expect(nudges).toEqual([-100, 50]);
	});

	it("emits inputOffset from onInput", () => {
		const c = new PreviewOffsetPanelComponent();
		let lastInput = "";
		c.inputOffset.subscribe((v) => (lastInput = v));

		const fakeEvent = {
			target: { value: "250" },
		} as unknown as Event;
		c.onInput(fakeEvent);
		expect(lastInput).toBe("250");
	});

	it("emits apply, resetPreview, and resetToZero events", () => {
		const c = new PreviewOffsetPanelComponent();
		let applyCount = 0;
		let resetCount = 0;
		let resetZeroCount = 0;
		c.apply.subscribe(() => (applyCount += 1));
		c.resetPreview.subscribe(() => (resetCount += 1));
		c.resetToZero.subscribe(() => (resetZeroCount += 1));

		c.apply.emit();
		c.resetPreview.emit();
		c.resetToZero.emit();
		expect(applyCount).toBe(1);
		expect(resetCount).toBe(1);
		expect(resetZeroCount).toBe(1);
	});
});
