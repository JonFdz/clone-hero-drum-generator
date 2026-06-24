import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { GenerationActionBarComponent } from "./generation-action-bar.component";
describe("GenerationActionBarComponent", () => {
	it("emits action events", () => {
		const c = new GenerationActionBarComponent();
		let called = false;
		c.generate.subscribe(() => (called = true));
		c.generate.emit();
		expect(called).toBe(true);
	});
});
