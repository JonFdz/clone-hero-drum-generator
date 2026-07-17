import { describe, expect, it } from "vitest";
import { BrowserHarnessError } from "./browser-harness-error";
import { parseBrowserHarnessQuery } from "./browser-harness-query";

describe("parseBrowserHarnessQuery", () => {
	it("defaults to the empty scenario with visible harness UI", () => {
		expect(parseBrowserHarnessQuery(new URLSearchParams())).toEqual({
			scenario: "empty",
			harnessUi: "visible",
		});
	});

	it("preserves an explicit scenario and hidden harness UI", () => {
		expect(
			parseBrowserHarnessQuery(
				new URLSearchParams("scenario=preview-ready&harnessUi=hidden"),
			),
		).toEqual({ scenario: "preview-ready", harnessUi: "hidden" });
	});

	it("rejects unexpected harnessUi values explicitly", () => {
		expect(() =>
			parseBrowserHarnessQuery(new URLSearchParams("harnessUi=quiet")),
		).toThrowError(
			new BrowserHarnessError(
				'query: unsupported harnessUi value "quiet"; expected "visible" or "hidden"',
			),
		);
	});
});
