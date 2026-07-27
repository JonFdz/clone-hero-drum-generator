import "@angular/compiler";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ProjectsRemoveConfirmDialogComponent } from "./projects-remove-confirm-dialog.component";

describe("ProjectsRemoveConfirmDialogComponent", () => {
	it("exposes its presentation contract", () => {
		const component = new ProjectsRemoveConfirmDialogComponent();
		component.isOpen = true;
		let called = false;
		component.cancelled.subscribe(() => {
			called = true;
		});
		component.onEscape();
		expect(called).toBe(true);
	});

	it("offers only removal from recents, never physical deletion", () => {
		const template = readFileSync(
			new URL(
				"./projects-remove-confirm-dialog.component.html",
				import.meta.url,
			),
			"utf8",
		);

		expect(template).toContain("Remove from Recents");
		expect(template).not.toContain("Delete File");
		expect(template).not.toContain("removeAndDelete");
	});
});
