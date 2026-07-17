import { describe, expect, it } from "vitest";
import {
	stableMappingFingerprint,
	validateSourceReviewCache,
} from "../app/services/source-review-model";
import { BrowserHarnessError } from "./browser-harness-error";
import {
	BROWSER_SCENARIO_IDS,
	resolveBrowserScenario,
	validateScenarioRegistry,
} from "./scenario-registry";
import {
	buildBrowserAppInfo,
	buildBrowserHealth,
	buildProjectPayload,
	successEnvelope,
} from "./fixture-builders";

describe("browser scenario registry", () => {
	it("resolves every stable initial scenario identifier", () => {
		expect(BROWSER_SCENARIO_IDS).toEqual([
			"empty",
			"project-loaded",
			"source-review-ready",
			"source-review-attention",
			"generate-ready",
			"generate-running",
			"generate-failed",
			"preview-ready",
		]);
		for (const id of BROWSER_SCENARIO_IDS) {
			expect(resolveBrowserScenario(id).id).toBe(id);
		}
	});

	it("rejects unknown scenarios and lists supported identifiers", () => {
		expect(() => resolveBrowserScenario("missing-state")).toThrowError(
			new BrowserHarnessError(
				`scenario: unknown scenario "missing-state"; supported scenarios: ${BROWSER_SCENARIO_IDS.join(", ")}`,
			),
		);
	});

	it("rejects duplicate scenario identifiers", () => {
		const scenario = resolveBrowserScenario("empty");
		expect(() => validateScenarioRegistry([scenario, scenario])).toThrow(
			'duplicate scenario identifier "empty"',
		);
	});

	it.each(["source-review-ready", "source-review-attention"] as const)(
		"keeps %s on its repository-owned analysis timestamp across repeated loads",
		(id) => {
			const first = resolveBrowserScenario(id);
			const second = resolveBrowserScenario(id);
			const expectedTimestamp = "2026-01-15T12:00:01.000Z";

			for (const scenario of [first, second]) {
				expect(scenario.project?.analysis?.normalizedAt).toBe(expectedTimestamp);
				expect(
					validateSourceReviewCache({
						cache: scenario.project?.analysis,
						sourceFingerprint: scenario.sourceFingerprint!,
						mappingFingerprint: stableMappingFingerprint(
							scenario.project?.mappingOverrides,
						),
						selectedTracks: scenario.project?.selectedTracks ?? [],
					}),
				).toMatchObject({ valid: true });
			}
		},
	);
});

describe("browser fixture builders", () => {
	it("builds a healthy browser runtime and typed success envelope", () => {
		expect(buildBrowserAppInfo()).toEqual({
			name: "CHDG Browser Harness",
			version: "0.1.0-harness",
			mode: "browser-harness",
		});
		expect(buildBrowserHealth().ok).toBe(true);
		expect(successEnvelope({ value: 1 })).toEqual({
			ok: true,
			data: { value: 1 },
			issues: [],
		});
	});

	it("builds deterministic synthetic project paths", () => {
		const first = buildProjectPayload();
		const second = buildProjectPayload();
		expect(first).toEqual(second);
		expect(first.projectFilePath).toBe(
			"C:\\CHDG-Harness\\Projects\\Demo Project.chdg.json",
		);
		expect(first.sourcePath).not.toContain("/Users/");
	});
});
