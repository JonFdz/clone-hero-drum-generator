import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { SourceReviewTrackListComponent } from "./source-review-track-list.component";

describe("SourceReviewTrackListComponent", () => {
	it("emits toggleTrack intents by index", () => {
		const c = new SourceReviewTrackListComponent();
		c.rows = [
			{
				index: 2,
				name: "Drums",
				noteCountLabel: "100 notes",
				confidenceLabel: "Strong",
				confidenceClass: "strong",
				statusLabel: "Available",
				statusClass: "strong",
				selected: false,
			},
		];
		c.selectedCountLabel = "0 tracks selected";
		c.notesSummaryLabel = "Total Notes: n/a";
		const toggled: number[] = [];
		c.toggleTrack.subscribe((i) => toggled.push(i));
		c.toggleTrack.emit(c.rows[0].index);
		expect(toggled).toEqual([2]);
	});
});
