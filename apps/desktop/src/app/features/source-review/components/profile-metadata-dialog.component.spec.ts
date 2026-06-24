import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { ProfileMetadataDialogComponent } from "./profile-metadata-dialog.component";

describe("ProfileMetadataDialogComponent", () => {
	it("disables confirm when required and name is empty", () => {
		const c = new ProfileMetadataDialogComponent();
		c.required = true;
		expect(c.confirmDisabled).toBe(true);
		c.name = "  Live Drums  ";
		expect(c.confirmDisabled).toBe(false);
	});

	it("ignores empty descriptions on confirm and trims the name", () => {
		const c = new ProfileMetadataDialogComponent();
		c.required = true;
		const results: { name: string; description?: string }[] = [];
		c.confirmed.subscribe((v) => results.push(v));

		c.name = "   ";
		c.onConfirm();
		expect(results).toEqual([]);

		c.name = "  Live Drums  ";
		c.description = "   ";
		c.onConfirm();
		expect(results).toEqual([{ name: "Live Drums", description: undefined }]);
	});

	it("keeps a provided description on confirm", () => {
		const c = new ProfileMetadataDialogComponent();
		c.name = "Live Drums";
		c.description = "Hard rock kit";
		const results: { name: string; description?: string }[] = [];
		c.confirmed.subscribe((v) => results.push(v));
		c.onConfirm();
		expect(results).toEqual([
			{ name: "Live Drums", description: "Hard rock kit" },
		]);
	});

	it("emits cancelled on Escape only when open", () => {
		const c = new ProfileMetadataDialogComponent();
		let cancelled = 0;
		c.cancelled.subscribe(() => (cancelled += 1));
		c.onEscape();
		expect(cancelled).toBe(0);
		c.isOpen = true;
		c.onEscape();
		expect(cancelled).toBe(1);
	});

	it("syncValues resets editable fields to the configured initial values", () => {
		const c = new ProfileMetadataDialogComponent();
		c.nameInitialValue = "Existing";
		c.descriptionInitialValue = "Old desc";
		c.syncValues();
		expect(c.name).toBe("Existing");
		expect(c.description).toBe("Old desc");
	});
});
