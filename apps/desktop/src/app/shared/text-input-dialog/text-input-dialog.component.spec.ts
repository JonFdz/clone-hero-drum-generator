import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { TextInputDialogComponent } from "./text-input-dialog.component";

describe("TextInputDialogComponent", () => {
	it("disables confirm when required and value is empty, enables once non-empty", () => {
		const c = new TextInputDialogComponent();
		c.required = true;
		expect(c.confirmDisabled).toBe(true);

		c.value = "  My Profile  ";
		expect(c.confirmDisabled).toBe(false);
	});

	it("does not disable confirm when not required even with empty value", () => {
		const c = new TextInputDialogComponent();
		c.required = false;
		c.value = "";
		expect(c.confirmDisabled).toBe(false);
	});

	it("emits the trimmed value on confirm and ignores confirm when disabled", () => {
		const c = new TextInputDialogComponent();
		c.required = true;
		const results: string[] = [];
		c.confirmed.subscribe((v) => results.push(v));

		c.value = "   ";
		c.onConfirm();
		expect(results).toEqual([]);

		c.value = "  Source Review Profile  ";
		c.onConfirm();
		expect(results).toEqual(["Source Review Profile"]);
	});

	it("emits cancelled on Escape when open and not when closed", () => {
		const c = new TextInputDialogComponent();
		let cancelled = 0;
		c.cancelled.subscribe(() => (cancelled += 1));

		c.onEscape();
		expect(cancelled).toBe(0);

		c.isOpen = true;
		c.onEscape();
		expect(cancelled).toBe(1);
	});

	it("syncValue resets the editable value to the configured initial value", () => {
		const c = new TextInputDialogComponent();
		c.initialValue = "Existing";
		c.syncValue();
		expect(c.value).toBe("Existing");
	});
});
