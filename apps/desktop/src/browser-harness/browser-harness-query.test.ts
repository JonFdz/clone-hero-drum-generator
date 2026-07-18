import { describe, expect, it } from "vitest";
import { BrowserHarnessError } from "./browser-harness-error";
import { parseBrowserHarnessQuery } from "./browser-harness-query";

describe("parseBrowserHarnessQuery", () => {
	it("uses the error name as the single rendered prefix", () => {
		const error = new BrowserHarnessError("query: invalid value");
		expect(error.name).toBe("BrowserHarnessError");
		expect(error.message).toBe("query: invalid value");
		expect(error.toString()).toBe("BrowserHarnessError: query: invalid value");
	});

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
