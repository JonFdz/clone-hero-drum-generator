import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { SourceReviewSelectedSourceComponent } from "./source-review-selected-source.component";

describe("SourceReviewSelectedSourceComponent", () => {
	it("emits refresh and toggleJson intents", () => {
		const c = new SourceReviewSelectedSourceComponent();
		c.view = {
			sourceKind: "midi",
			sourceKindLabel: "MIDI",
			fileName: "demo.mid",
			filePath: "/x/demo.mid",
			analyzedAt: "now",
		};
		let refreshed = false;
		let json = false;
		c.refresh.subscribe(() => (refreshed = true));
		c.toggleJson.subscribe(() => (json = true));
		c.refresh.emit();
		c.toggleJson.emit();
		expect(refreshed).toBe(true);
		expect(json).toBe(true);
	});
});
