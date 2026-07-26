import type {
	InspectSourceInput,
	MappingOverrideProfile,
	NormalizeSelectionInput,
} from "@chdg/project/browser";
import { stableMappingFingerprint } from "../app/services/source-review-model";
import { BrowserHarnessError } from "./browser-harness-error";
import type { BrowserHarnessScenario } from "./browser-scenario";
import {
	buildBrowserAppInfo,
	buildBrowserHealth,
	buildChartPreviewData,
	buildRecentProjects,
	buildSettings,
	HARNESS_AUDIO_PREVIEW_SRC,
	successEnvelope,
} from "./fixture-builders";

interface BrowserBridgeTarget {
	chdg?: Window["chdg"];
}

function unsupported<T>(scenario: BrowserHarnessScenario, operation: string): Promise<T> {
	return Promise.reject(
		new BrowserHarnessError(
			`operation "${operation}" is unsupported in scenario "${scenario.id}"`,
		),
	);
}

function invalidInput(
	scenario: BrowserHarnessScenario,
	operation: string,
	detail: string,
): never {
	throw new BrowserHarnessError(
		`operation "${operation}" rejected input in scenario "${scenario.id}": ${detail}`,
	);
}

function requireScenarioSourcePath(
	scenario: BrowserHarnessScenario,
	operation: string,
	sourcePath: string,
): void {
	if (!scenario.project?.sourcePath || sourcePath !== scenario.project.sourcePath) {
		invalidInput(
			scenario,
			operation,
			"sourcePath must equal the scenario synthetic source path",
		);
	}
}

function validateInspectionInput(
	scenario: BrowserHarnessScenario,
	input: InspectSourceInput,
): void {
	requireScenarioSourcePath(scenario, "inspectSource", input.sourcePath);
	const selectedTracks = scenario.project?.selectedTracks ?? [];
	if (input.trackIndex !== undefined && !selectedTracks.includes(input.trackIndex)) {
		invalidInput(
			scenario,
			"inspectSource",
			`trackIndex must belong to scenario tracks [${selectedTracks.join(", ")}]`,
		);
	}
	if (input.drumsOnly === false) {
		invalidInput(
			scenario,
			"inspectSource",
			"drumsOnly=false is not represented by this static fixture",
		);
	}
}

function validateNormalizationInput(
	scenario: BrowserHarnessScenario,
	input: NormalizeSelectionInput,
): void {
	requireScenarioSourcePath(scenario, "normalizeSelection", input.sourcePath);
	if (input.trackIndex !== undefined && input.trackIndexes !== undefined) {
		invalidInput(
			scenario,
			"normalizeSelection",
			"trackIndex and trackIndexes cannot both be provided",
		);
	}
	const requestedTracks = input.trackIndexes ??
		(input.trackIndex === undefined ? [] : [input.trackIndex]);
	const scenarioTracks = scenario.project?.selectedTracks ?? [];
	if (
		requestedTracks.length !== scenarioTracks.length ||
		requestedTracks.some((track, index) => track !== scenarioTracks[index])
	) {
		invalidInput(
			scenario,
			"normalizeSelection",
			`selected tracks must equal scenario tracks [${scenarioTracks.join(", ")}]`,
		);
	}
	if (
		stableMappingFingerprint(input.mappingOverrides ?? {}) !==
		stableMappingFingerprint(scenario.runtimeMappingOverrides ?? {})
	) {
		invalidInput(
			scenario,
			"normalizeSelection",
			"mappingOverrides must equal the scenario mapping state",
		);
	}
}

function validatePreviewPath(
	scenario: BrowserHarnessScenario,
	operation: string,
	actual: string | undefined,
	expected: string | undefined,
	field: string,
): void {
	if (!expected || actual !== expected) {
		invalidInput(
			scenario,
			operation,
			`${field} must equal the scenario synthetic ${field}`,
		);
	}
}

export function createBrowserBridge(
	scenario: BrowserHarnessScenario,
): NonNullable<Window["chdg"]> {
	let settings = buildSettings();
	let mappingProfiles: MappingOverrideProfile[] = [];
	const recents = scenario.id === "empty" ? [] : buildRecentProjects();

	return {
		getAppInfo: async () => buildBrowserAppInfo(),
		getHealth: async () => buildBrowserHealth(),
		pickSourceFile: () => unsupported(scenario, "pickSourceFile"),
		pickAudioFile: () => unsupported(scenario, "pickAudioFile"),
		pickOutputFolder: () => unsupported(scenario, "pickOutputFolder"),
		pickCoverImageFile: () => unsupported(scenario, "pickCoverImageFile"),
		inspectSource: async (input) => {
			if (!scenario.inspection) return unsupported(scenario, "inspectSource");
			validateInspectionInput(scenario, input);
			return successEnvelope(scenario.inspection);
		},
		normalizeSelection: async (input) => {
			if (!scenario.normalization) {
				return unsupported(scenario, "normalizeSelection");
			}
			validateNormalizationInput(scenario, input);
			return successEnvelope(scenario.normalization);
		},
		getSourceFingerprint: async (sourcePath) => {
			if (!scenario.sourceFingerprint) {
				return unsupported(scenario, "getSourceFingerprint");
			}
			requireScenarioSourcePath(scenario, "getSourceFingerprint", sourcePath);
			return successEnvelope(scenario.sourceFingerprint);
		},
		generatePackage: () => unsupported(scenario, "generatePackage"),
		openOutputFolder: () => unsupported(scenario, "openOutputFolder"),
		saveProjectFile: () => unsupported(scenario, "saveProjectFile"),
		openProjectFile: () => unsupported(scenario, "openProjectFile"),
		createProject: () => unsupported(scenario, "createProject"),
		saveProject: () => unsupported(scenario, "saveProject"),
		saveProjectAs: () => unsupported(scenario, "saveProjectAs"),
		openProject: () => unsupported(scenario, "openProject"),
		readRecentProjects: async () => successEnvelope(recents),
		removeRecentProject: () => unsupported(scenario, "removeRecentProject"),
		deleteProjectFile: () => unsupported(scenario, "deleteProjectFile"),
		getCoverImagePreviewUrl: () =>
			unsupported(scenario, "getCoverImagePreviewUrl"),
		readSettings: async () => successEnvelope(settings),
		writeSettings: async (nextSettings) => {
			settings = { ...nextSettings };
			return successEnvelope(settings);
		},
		readMappingProfiles: async () => successEnvelope(mappingProfiles),
		saveMappingProfile: async (profile) => {
			mappingProfiles = [
				...mappingProfiles.filter((candidate) => candidate.id !== profile.id),
				profile,
			];
			return successEnvelope(mappingProfiles);
		},
		deleteMappingProfile: async (profileId) => {
			mappingProfiles = mappingProfiles.filter(
				(candidate) => candidate.id !== profileId,
			);
			return successEnvelope(mappingProfiles);
		},
		testFfmpeg: () => unsupported(scenario, "testFfmpeg"),
		getAudioPreviewSource: async (input) => {
			if (scenario.id !== "preview-ready") {
				return unsupported(scenario, "getAudioPreviewSource");
			}
			validatePreviewPath(
				scenario,
				"getAudioPreviewSource",
				input.generatedSongOggPath,
				scenario.project?.outputFiles?.songOgg,
				"generatedSongOggPath",
			);
			return successEnvelope({
				src: HARNESS_AUDIO_PREVIEW_SRC,
				sourceKind: "generated" as const,
			});
		},
		getChartPreviewData: async (input) => {
			if (scenario.id !== "preview-ready") {
				return unsupported(scenario, "getChartPreviewData");
			}
			validatePreviewPath(
				scenario,
				"getChartPreviewData",
				input.chartPath,
				scenario.project?.outputFiles?.chart,
				"chartPath",
			);
			return successEnvelope(buildChartPreviewData());
		},
		applyChartOffset: () => unsupported(scenario, "applyChartOffset"),
	};
}

export function installBrowserBridge(
	target: BrowserBridgeTarget,
	scenario: BrowserHarnessScenario,
): NonNullable<Window["chdg"]> {
	if (target.chdg) {
		throw new BrowserHarnessError(
			"bridge installation: window.chdg is already defined",
		);
	}
	const bridge = createBrowserBridge(scenario);
	target.chdg = bridge;
	return bridge;
}
