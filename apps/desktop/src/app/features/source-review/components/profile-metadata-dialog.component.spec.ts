import "@angular/compiler";
import { describe, expect, it } from "vitest";
import type { SimpleChange, SimpleChanges } from "@angular/core";
import { ProfileMetadataDialogComponent } from "./profile-metadata-dialog.component";

function openTransition(previousValue: boolean, currentValue: boolean): SimpleChanges {
	return {
		isOpen: {
			previousValue,
			currentValue,
			firstChange: previousValue === undefined,
			isFirstChange: () => previousValue === undefined,
		} satisfies SimpleChange,
	};
}

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

	it("resets create-dialog draft input when reopened", () => {
		const c = new ProfileMetadataDialogComponent();
		c.nameInitialValue = "";
		c.descriptionInitialValue = "";

		c.isOpen = true;
		c.ngOnChanges(openTransition(false, true));
		expect(c.name).toBe("");
		expect(c.description).toBe("");

		c.name = "Draft name";
		c.description = "Draft description";
		c.isOpen = false;
		c.ngOnChanges(openTransition(true, false));
		expect(c.name).toBe("Draft name");
		expect(c.description).toBe("Draft description");

		c.isOpen = true;
		c.ngOnChanges(openTransition(false, true));
		expect(c.name).toBe("");
		expect(c.description).toBe("");
	});

	it("prefills edit-dialog fields from initial values on open", () => {
		const c = new ProfileMetadataDialogComponent();
		c.nameInitialValue = "Existing";
		c.descriptionInitialValue = "Old desc";
		c.isOpen = true;
		c.ngOnChanges(openTransition(false, true));
		expect(c.name).toBe("Existing");
		expect(c.description).toBe("Old desc");
	});

	it("reopens edit dialog with the newly selected profile metadata", () => {
		const c = new ProfileMetadataDialogComponent();
		c.nameInitialValue = "Profile A";
		c.descriptionInitialValue = "A desc";
		c.isOpen = true;
		c.ngOnChanges(openTransition(false, true));
		expect(c.name).toBe("Profile A");
		expect(c.description).toBe("A desc");

		c.isOpen = false;
		c.ngOnChanges(openTransition(true, false));
		c.nameInitialValue = "Profile B";
		c.descriptionInitialValue = "B desc";
		c.isOpen = true;
		c.ngOnChanges(openTransition(false, true));
		expect(c.name).toBe("Profile B");
		expect(c.description).toBe("B desc");
	});

	it("does not overwrite user edits while the dialog stays open", () => {
		const c = new ProfileMetadataDialogComponent();
		c.nameInitialValue = "Existing";
		c.descriptionInitialValue = "Old desc";
		c.isOpen = true;
		c.ngOnChanges(openTransition(false, true));

		c.name = "User typing";
		c.description = "Changed draft";
		c.nameInitialValue = "New external value";
		c.descriptionInitialValue = "New external desc";
		c.ngOnChanges({
			nameInitialValue: {
				previousValue: "Existing",
				currentValue: "New external value",
				firstChange: false,
				isFirstChange: () => false,
			},
			descriptionInitialValue: {
				previousValue: "Old desc",
				currentValue: "New external desc",
				firstChange: false,
				isFirstChange: () => false,
			},
		});

		expect(c.name).toBe("User typing");
		expect(c.description).toBe("Changed draft");
	});
});