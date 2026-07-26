import { BrowserHarnessError } from "./browser-harness-error";
import type { BrowserHarnessScenario, BrowserScenarioId } from "./browser-scenario";
import {
	buildAnalysis,
	buildInspection,
	buildNormalization,
	buildProjectPayload,
	buildSourceFingerprint,
	HARNESS_PATHS,
} from "./fixture-builders";

export const BROWSER_SCENARIO_IDS = [
	"empty",
	"project-loaded",
	"source-review-ready",
	"source-review-attention",
	"generate-ready",
	"generate-running",
	"generate-failed",
	"preview-ready",
] as const;

const readyProject = () => buildProjectPayload();

const scenarios: BrowserHarnessScenario[] = [
	{
		id: "empty",
		description: "Healthy runtime with no active project.",
		recommendedRoute: "/home",
	},
	{
		id: "project-loaded",
		description: "Synthetic project metadata and paths are loaded.",
		recommendedRoute: "/projects/details",
		project: buildProjectPayload({ selectedTracks: [] }),
	},
	{
		id: "source-review-ready",
		description: "Source inspection and normalization are ready to continue.",
		recommendedRoute: "/source-review",
		project: readyProject(),
		runtimeAnalysis: buildAnalysis(),
		runtimeMappingOverrides: {},
		sourceFingerprint: buildSourceFingerprint(),
		inspection: buildInspection(),
		normalization: buildNormalization(),
	},
	{
		id: "source-review-attention",
		description: "A deterministic unknown mapping requires review.",
		recommendedRoute: "/source-review",
		project: buildProjectPayload(),
		runtimeAnalysis: buildAnalysis(true),
		runtimeMappingOverrides: {},
		sourceFingerprint: buildSourceFingerprint(),
		inspection: buildInspection(),
		normalization: buildNormalization(true),
	},
	{
		id: "generate-ready",
		description: "All deterministic generation inputs are ready.",
		recommendedRoute: "/generate",
		project: readyProject(),
		runtimeAnalysis: buildAnalysis(),
		runtimeMappingOverrides: {},
		generationSeed: "ready",
	},
	{
		id: "generate-running",
		description: "Package generation is deterministically in progress.",
		recommendedRoute: "/generate",
		project: readyProject(),
		runtimeAnalysis: buildAnalysis(),
		runtimeMappingOverrides: {},
		generationSeed: "running",
	},
	{
		id: "generate-failed",
		description: "Package generation has one deterministic failure.",
		recommendedRoute: "/generate",
		project: buildProjectPayload({ generationStatus: "failed" }),
		runtimeAnalysis: buildAnalysis(),
		runtimeMappingOverrides: {},
		generationSeed: "failed",
	},
	{
		id: "preview-ready",
		description: "Generated chart preview data is available without disk access.",
		recommendedRoute: "/preview",
		project: buildProjectPayload({
			generationStatus: "generated",
			lastGeneratedAt: "2026-01-15T12:05:00.000Z",
			outputFiles: {
				chart: HARNESS_PATHS.CHART,
				songIni: HARNESS_PATHS.SONG_INI,
				songOgg: HARNESS_PATHS.SONG_OGG,
			},
		}),
		runtimeAnalysis: buildAnalysis(),
		runtimeMappingOverrides: {},
		sourceFingerprint: buildSourceFingerprint(),
	},
];

export function validateScenarioRegistry(
	registry: readonly BrowserHarnessScenario[],
): void {
	const seen = new Set<string>();
	for (const scenario of registry) {
		if (seen.has(scenario.id)) {
			throw new BrowserHarnessError(
				`registry: duplicate scenario identifier "${scenario.id}"`,
			);
		}
		seen.add(scenario.id);
	}
}

validateScenarioRegistry(scenarios);

export function resolveBrowserScenario(id: string): BrowserHarnessScenario {
	const scenario = scenarios.find((candidate) => candidate.id === id);
	if (!scenario) {
		throw new BrowserHarnessError(
			`scenario: unknown scenario "${id}"; supported scenarios: ${BROWSER_SCENARIO_IDS.join(", ")}`,
		);
	}
	return scenario;
}

export function isBrowserScenarioId(id: string): id is BrowserScenarioId {
	return BROWSER_SCENARIO_IDS.some((candidate) => candidate === id);
}
