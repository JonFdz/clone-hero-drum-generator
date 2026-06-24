import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { SourceReviewActionAreaComponent } from "./source-review-action-area.component";

describe("SourceReviewActionAreaComponent", () => {
	it("emits back and continueToGenerate intents", () => {
		const c = new SourceReviewActionAreaComponent();
		c.canContinue = true;
		const intents: string[] = [];
		c.back.subscribe(() => intents.push("back"));
		c.continueToGenerate.subscribe(() => intents.push("continue"));
		c.back.emit();
		c.continueToGenerate.emit();
		expect(intents).toEqual(["back", "continue"]);
	});
});
