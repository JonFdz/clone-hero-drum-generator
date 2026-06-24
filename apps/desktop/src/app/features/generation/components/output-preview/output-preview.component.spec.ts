import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { OutputPreviewComponent } from "./output-preview.component";
describe("OutputPreviewComponent", () => {
	it("accepts output file rows", () => {
		const c = new OutputPreviewComponent();
		c.files = [{ icon: "▧", name: "notes.chart", compactPath: "notes.chart" }];
		expect(c.files[0].name).toBe("notes.chart");
	});
});
