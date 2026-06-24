import "@angular/compiler";
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
});
