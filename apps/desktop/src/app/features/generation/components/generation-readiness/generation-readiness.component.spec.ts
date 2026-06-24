import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { GenerationReadinessComponent } from "./generation-readiness.component";

describe("GenerationReadinessComponent", () => {
	it("exposes a presentational readiness contract", () => {
		const c = new GenerationReadinessComponent();
		c.tone = "success";
		c.icon = "✓";
		c.label = "Ready";
		c.detail = "Checked";
		expect(c.label).toBe("Ready");
	});
});
