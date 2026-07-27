import "@angular/compiler";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HomeWarningsPanelComponent } from "./home-warnings-panel.component";

describe("HomeWarningsPanelComponent", () => {
	it("exposes its presentation contract", () => {
		const component = new HomeWarningsPanelComponent();
		component.warnings = [];
		expect(component.warnings).toEqual([]);
	});

	it("describes missing files and failed generation as unavailable", () => {
		const template = readFileSync(
			new URL("./home-warnings-panel.component.html", import.meta.url),
			"utf8",
		);

		expect(template).toContain(
			"Replacement and persistence are unavailable in this migration.",
		);
		expect(template).toContain(
			"Managed regeneration is unavailable in this migration.",
		);
		expect(template).not.toContain("Continue Setup");
		expect(template).not.toContain("Open Generate");
		expect(template).not.toContain("retry safely");
	});
});
