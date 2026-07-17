import { describe, expect, it } from "vitest";
import { harnessIndicatorText, shouldShowHarnessUi } from "./browser-harness-chrome";

describe("browser harness chrome", () => {
	it("shows the active scenario when harness UI is visible", () => {
		expect(shouldShowHarnessUi("visible")).toBe(true);
		expect(harnessIndicatorText("source-review-ready")).toBe(
			"Browser Harness · source-review-ready",
		);
	});

	it("hides only visual chrome when harnessUi is hidden", () => {
		expect(shouldShowHarnessUi("hidden")).toBe(false);
	});
});
