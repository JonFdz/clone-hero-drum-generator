import "@angular/compiler";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { QaChecklistComponent } from "./qa-checklist.component";
describe("QaChecklistComponent", () => {
	it("emits filter changes", () => {
		const c = new QaChecklistComponent();
		let value = "";
		c.filterChange.subscribe((v) => (value = v));
		c.filterChange.emit("warning");
		expect(value).toBe("warning");
	});

	it("presents dormant read-only diagnostics without generation claims", () => {
		const template = readFileSync(
			new URL("./qa-checklist.component.html", import.meta.url),
			"utf8",
		);
		expect(template).toContain("Legacy Runtime Diagnostics");
		expect(template).toContain("Read-only diagnostics from dormant runtime state");
		expect(template).not.toContain("Errors block generation");
		expect(template).not.toContain("All checks passed");
	});
});
