import type { MappingOverrideProfile } from "@chdg/project/browser";
import { BrowserHarnessError } from "./browser-harness-error";
import type { BrowserHarnessScenario } from "./browser-scenario";
import {
	buildBrowserAppInfo,
	buildBrowserHealth,
	buildChartPreviewData,
	buildProjectFile,
	buildRecentProjects,
	buildSettings,
	failureEnvelope,
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
		inspectSource: () =>
			scenario.inspection
				? Promise.resolve(successEnvelope(scenario.inspection))
				: unsupported(scenario, "inspectSource"),
		normalizeSelection: () =>
			scenario.normalization
				? Promise.resolve(successEnvelope(scenario.normalization))
				: unsupported(scenario, "normalizeSelection"),
		getSourceFingerprint: () =>
			scenario.sourceFingerprint
				? Promise.resolve(successEnvelope(scenario.sourceFingerprint))
				: unsupported(scenario, "getSourceFingerprint"),
		generatePackage: () => unsupported(scenario, "generatePackage"),
		openOutputFolder: () => unsupported(scenario, "openOutputFolder"),
		saveProjectFile: () => unsupported(scenario, "saveProjectFile"),
		openProjectFile: () => unsupported(scenario, "openProjectFile"),
		createProject: () => unsupported(scenario, "createProject"),
		saveProject: async (payload) =>
			successEnvelope({
				filePath: payload.projectFilePath ?? scenario.project?.projectFilePath ?? "",
				project: buildProjectFile(payload),
			}),
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
		getAudioPreviewSource: () =>
			scenario.id === "preview-ready"
				? Promise.resolve(
						failureEnvelope(
							"BROWSER_AUDIO_UNAVAILABLE",
							"Synthetic browser scenario does not provide audio.",
						),
					)
				: unsupported(scenario, "getAudioPreviewSource"),
		getChartPreviewData: () =>
			scenario.id === "preview-ready"
				? Promise.resolve(successEnvelope(buildChartPreviewData()))
				: unsupported(scenario, "getChartPreviewData"),
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
