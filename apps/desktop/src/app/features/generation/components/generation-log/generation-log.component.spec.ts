import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { GenerationLogComponent } from "./generation-log.component";
describe("GenerationLogComponent", () => {
	it("accepts logs and errors", () => {
		const c = new GenerationLogComponent();
		c.logs = ["Generated"];
		c.errorMessage = "boom";
		expect(c.logs[0]).toBe("Generated");
	});
});
