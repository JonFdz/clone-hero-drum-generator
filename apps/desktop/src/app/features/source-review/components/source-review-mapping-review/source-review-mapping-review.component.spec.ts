import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { SourceReviewMappingReviewComponent } from "./source-review-mapping-review.component";

describe("SourceReviewMappingReviewComponent", () => {
	it("emits semantic mapping intents", () => {
		const c = new SourceReviewMappingReviewComponent();
		c.open = true;
		c.needsAttention = false;
		c.actionLabel = "Hide Mapping";
		c.statusLabel = "Automatic mapping ready";
		c.summary = "s";
		c.coverageSummary = undefined;
		c.selectedProfileName = "Live";
		c.filters = [];
		c.filterCountRecord = {};
		c.filter = "all";
		c.rowsEmpty = false;
		c.filteredRowsEmpty = false;
		c.emptyFilterMessage = "";
		c.filteredRows = [];
		c.unknownCount = 0;
		c.ignoredKnownCount = 0;
		c.overrideCount = 0;
		c.changedCount = 0;
		c.ignoredCount = 0;

		let toggled = false;
		c.toggleOpen.subscribe(() => (toggled = true));
		c.toggleOpen.emit();
		expect(toggled).toBe(true);

		let filter = "";
		c.setFilter.subscribe((f) => (filter = f));
		c.setFilter.emit("needs-review");
		expect(filter).toBe("needs-review");
	});
});
