import type { HarnessUi } from "./browser-harness-query";
import type { BrowserScenarioId } from "./browser-scenario";

export function shouldShowHarnessUi(harnessUi: HarnessUi): boolean {
	return harnessUi === "visible";
}

export function harnessIndicatorText(scenarioId: BrowserScenarioId): string {
	return `Browser Harness · ${scenarioId}`;
}

export function attachBrowserHarnessChrome(
	documentRef: Document,
	scenarioId: BrowserScenarioId,
	harnessUi: HarnessUi,
): void {
	if (!shouldShowHarnessUi(harnessUi)) return;
	if (
		documentRef.querySelector(
			'aside[aria-label="Browser harness scenario"]',
		)
	) {
		return;
	}
	const indicator = documentRef.createElement("aside");
	indicator.setAttribute("aria-label", "Browser harness scenario");
	indicator.textContent = harnessIndicatorText(scenarioId);
	Object.assign(indicator.style, {
		position: "fixed",
		right: "16px",
		bottom: "16px",
		zIndex: "2147483647",
		padding: "8px 12px",
		border: "1px solid #7c5cff",
		borderRadius: "6px",
		background: "#17142a",
		color: "#e6e1ff",
		font: "600 12px/1.2 system-ui, sans-serif",
		boxShadow: "0 4px 16px rgb(0 0 0 / 35%)",
		pointerEvents: "none",
	});
	documentRef.body.append(indicator);
}
