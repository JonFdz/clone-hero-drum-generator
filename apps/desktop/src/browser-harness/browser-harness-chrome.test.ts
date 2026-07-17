// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import {
	attachBrowserHarnessChrome,
	harnessIndicatorText,
	shouldShowHarnessUi,
} from "./browser-harness-chrome";

describe("browser harness chrome", () => {
	beforeEach(() => {
		document.body.replaceChildren();
	});

	it("shows the active scenario when harness UI is visible", () => {
		expect(shouldShowHarnessUi("visible")).toBe(true);
		expect(harnessIndicatorText("source-review-ready")).toBe(
			"Browser Harness · source-review-ready",
		);
	});

	it("hides only visual chrome when harnessUi is hidden", () => {
		expect(shouldShowHarnessUi("hidden")).toBe(false);
		attachBrowserHarnessChrome(document, "preview-ready", "hidden");
		expect(document.querySelector("aside")).toBeNull();
	});

	it("appends an accessible aside containing the active scenario", () => {
		attachBrowserHarnessChrome(document, "source-review-ready", "visible");
		const indicator = document.querySelector("aside");
		expect(indicator?.textContent).toBe(
			"Browser Harness · source-review-ready",
		);
		expect(indicator?.getAttribute("aria-label")).toBe(
			"Browser harness scenario",
		);
	});

	it("keeps one scenario indicator when attachment runs twice", () => {
		attachBrowserHarnessChrome(document, "project-loaded", "visible");
		attachBrowserHarnessChrome(document, "project-loaded", "visible");
		const indicators = document.querySelectorAll(
			'aside[aria-label="Browser harness scenario"]',
		);
		expect(indicators).toHaveLength(1);
		expect(indicators[0]?.textContent).toBe(
			"Browser Harness · project-loaded",
		);
	});
});
