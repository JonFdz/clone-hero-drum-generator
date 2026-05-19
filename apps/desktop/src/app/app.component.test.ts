import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("AppComponent source", () => {
	it("does not include the no-op self-assignment anti-pattern", () => {
		const source = readFileSync(
			join(process.cwd(), "apps/desktop/src/app/app.component.ts"),
			"utf8",
		);
		expect(source).not.toContain("this.generateState.applyError = this.generateState.applyError");
	});
});
