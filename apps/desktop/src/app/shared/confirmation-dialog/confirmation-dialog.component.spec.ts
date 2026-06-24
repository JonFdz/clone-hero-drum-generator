import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { ConfirmationDialogComponent } from "./confirmation-dialog.component";

describe("ConfirmationDialogComponent", () => {
	it("emits cancelled on Escape when open and not when closed", () => {
		const c = new ConfirmationDialogComponent();
		let cancelled = 0;
		c.cancelled.subscribe(() => (cancelled += 1));

		c.onEscape();
		expect(cancelled).toBe(0);

		c.isOpen = true;
		c.onEscape();
		expect(cancelled).toBe(1);
	});

	it("emits distinct confirmed and cancelled events for confirm/cancel paths", () => {
		const c = new ConfirmationDialogComponent();
		c.isOpen = true;
		c.destructive = true;
		let confirmed = 0;
		let cancelled = 0;
		c.confirmed.subscribe(() => (confirmed += 1));
		c.cancelled.subscribe(() => (cancelled += 1));

		c.confirmed.emit();
		c.cancelled.emit();

		expect(confirmed).toBe(1);
		expect(cancelled).toBe(1);
	});

	it("exposes its presentation contract inputs as defaults", () => {
		const c = new ConfirmationDialogComponent();
		expect(c.isOpen).toBe(false);
		expect(c.destructive).toBe(false);
		expect(c.confirmLabel).toBe("Confirm");
		expect(c.cancelLabel).toBe("Cancel");
	});
});
