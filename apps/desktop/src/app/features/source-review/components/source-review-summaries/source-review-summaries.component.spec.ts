import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { SourceReviewSummariesComponent } from "./source-review-summaries.component";

describe("SourceReviewSummariesComponent", () => {
	it("renders source facts and combined preview inputs", () => {
		const c = new SourceReviewSummariesComponent();
		c.sourceFacts = [{ icon: "♬", label: "Resolution (PPQ)", value: "480" }];
		c.combined = {
			selectedTracks: 1,
			hitCountLabel: "100",
			duplicatesLabel: "0 (0%)",
			unknownCountLabel: "0",
			warningCountLabel: "2 issues",
		};
		c.pieceEntries = [{ kind: "kick", label: "Kick", count: "347" }];
		c.hasPreview = true;
		c.buildingMessage = "";
		expect(c.sourceFacts[0].value).toBe("480");
		expect(c.combined.hitCountLabel).toBe("100");
	});
});
