import { BrowserHarnessError } from "./browser-harness-error";

export const HARNESS_UI = {
	VISIBLE: "visible",
	HIDDEN: "hidden",
} as const;

export type HarnessUi = (typeof HARNESS_UI)[keyof typeof HARNESS_UI];

export interface BrowserHarnessQuery {
	scenario: string;
	harnessUi: HarnessUi;
}

export function parseBrowserHarnessQuery(
	params: URLSearchParams,
): BrowserHarnessQuery {
	const scenario = params.get("scenario")?.trim() || "empty";
	const harnessUi = params.get("harnessUi")?.trim() || HARNESS_UI.VISIBLE;
	if (harnessUi !== HARNESS_UI.VISIBLE && harnessUi !== HARNESS_UI.HIDDEN) {
		throw new BrowserHarnessError(
			`query: unsupported harnessUi value "${harnessUi}"; expected "visible" or "hidden"`,
		);
	}
	return { scenario, harnessUi };
}
