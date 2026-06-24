import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { SourceReviewAdvancedComponent } from "./source-review-advanced.component";

describe("SourceReviewAdvancedComponent", () => {
	it("emits hide intent", () => {
		const c = new SourceReviewAdvancedComponent();
		c.open = true;
		c.json = "{}";
		let hidden = false;
		c.hide.subscribe(() => (hidden = true));
		c.hide.emit();
		expect(hidden).toBe(true);
	});
});
