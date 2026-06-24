import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { SourceReviewIssuesComponent } from "./source-review-issues.component";

describe("SourceReviewIssuesComponent", () => {
	it("emits toggleOpen and reviewInMapping intents", () => {
		const c = new SourceReviewIssuesComponent();
		c.open = false;
		c.needAttention = true;
		c.warningCount = 1;
		c.actionLabel = "Review Issues";
		c.summary = "1 warning · Review recommended";
		c.preview = "X — y";
		c.warningIssues = [
			{
				severity: "warning",
				code: "X",
				message: "y",
				count: 1,
				label: "warning · X",
				isMapping: true,
			},
		];
		c.infoIssues = [];
		let toggled = false;
		let review = false;
		c.toggleOpen.subscribe(() => (toggled = true));
		c.reviewInMapping.subscribe(() => (review = true));
		c.toggleOpen.emit();
		c.reviewInMapping.emit();
		expect(toggled).toBe(true);
		expect(review).toBe(true);
	});
});
