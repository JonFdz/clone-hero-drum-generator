import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { ValidationReportComponent } from "./validation-report.component";

describe("ValidationReportComponent", () => {
	it("accepts validation summary inputs", () => {
		const c = new ValidationReportComponent();
		c.label = "Ready"; c.message = "OK"; c.icon = "✓"; c.checkedAt = "now";
		c.summary = { canGenerate: true, errorCount: 0, warningCount: 0, infoCount: 1, checkedAt: "now", items: [] };
		expect(c.summary.canGenerate).toBe(true);
	});
});
