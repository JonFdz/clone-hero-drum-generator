import "@angular/compiler";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SourceReviewActionAreaComponent } from "./source-review-action-area.component";

describe("SourceReviewActionAreaComponent", () => {
	it("emits only the read-only back intent", () => {
		const c = new SourceReviewActionAreaComponent();
		const intents: string[] = [];
		c.back.subscribe(() => intents.push("back"));
		c.back.emit();
		expect(intents).toEqual(["back"]);
	});

	it("keeps generation continuation disabled and explicit", () => {
		const template = readFileSync(
			new URL("./source-review-action-area.component.html", import.meta.url),
			"utf8",
		);
		const renderedText = template.replace(/\s+/g, " ").toLowerCase();

		expect(template).toContain("Generation Unavailable");
		expect(renderedText).toContain(
			"continuing to managed generation is unavailable",
		);
		expect(template).toContain("disabled");
		expect(template).not.toContain("Continue to Generate");
		expect(template).not.toContain("continueToGenerate");
	});
});
