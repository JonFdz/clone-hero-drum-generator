import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { access, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
	inspectSource,
	normalizeSelection,
	type JsonEnvelope,
	type NormalizeSelectionInput,
	type ProjectIssue,
	type SourceInspectionResult,
	type NormalizationPreview,
	type ChdgProjectFile,
	type RecentProject,
	type ProjectMappingOverrides,
	type MappingOverrideProfile,
	validateMappingOverrides,
} from "@chdg/project";
import { addAllowedPath, assertAllowedPath } from "./pathAllowlist.js";
import {
	readProjectFile,
	type ProjectMissingPathKind,
} from "./projectFileService.js";
import type {
	SourceReviewFingerprint,
	SourceReviewRuntimeCache,
} from "./desktopRuntimeTypes.js";
import {
	projectFileToDesktopState,
	type ProjectStatePayload,
} from "./projectStateProjection.js";
import {
	readSettings,
	writeSettings,
	readRecentProjects,
	addRecentProject,
	removeRecentProject,
} from "./settingsService.js";
import {
	deleteProjectFilePath,
	resolveDeletableProjectFilePath,
} from "./projectFileDeletion.js";
import {
	readMappingProfiles,
	writeMappingProfiles,
} from "./mappingProfileService.js";
import { testFfmpeg } from "./ffmpegDiagnostic.js";
import {
	addAllowedProjectFile,
	resolveAllowedOpenProjectFile,
} from "./projectFileAccess.js";
import {
	pickAudioPreviewCandidate,
	parseChartPreviewData,
	resolveChartPreviewPath,
	sourceTimingFromAnalysisCache,
	sourceTimingFromDocument,
} from "./previewData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rendererIndex = path.join(__dirname, "../renderer/browser/index.html");
const preloadScript = path.join(__dirname, "preload.cjs");
const allowedSourceFiles = new Set<string>();
const allowedAudioFiles = new Set<string>();
const allowedCoverImageFiles = new Set<string>();
const allowedOutputFolders = new Set<string>();
const allowedProjectFiles = new Set<string>();

type DesktopHealthStatus = {
	ok: boolean;
	appVersion: string;
	mode: "desktop";
	checks: {
		bridge: boolean;
	};
	message?: string;
};

type PickedPath = {
	path: string;
	name: string;
	fileUrl?: string;
};

type SaveProjectResult = {
	filePath: string;
	project: ChdgProjectFile;
};

function createWindow(): void {
	const window = new BrowserWindow({
		width: 1440,
		height: 900,
		minWidth: 1100,
		minHeight: 720,
		title: "CHDG",
		backgroundColor: "#0d1117",
		webPreferences: {
			preload: preloadScript,
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	});

	void window.loadFile(rendererIndex);
}

app.whenReady().then(() => {
	ipcMain.handle("app:get-info", () => ({
		name: app.getName(),
		version: app.getVersion(),
		mode: "desktop" as const,
	}));

	ipcMain.handle(
		"chdg:get-health",
		(): DesktopHealthStatus => ({
			ok: true,
			appVersion: app.getVersion(),
			mode: "desktop",
			checks: {
				bridge: true,
			},
			message: "Desktop bridge connected",
		}),
	);

	ipcMain.handle(
		"dialog:pick-source-file",
		async (): Promise<PickedPath | null> => {
			const result = await dialog.showOpenDialog({
				title: "Select source file",
				properties: ["openFile"],
				filters: [{ name: "CHDG sources", extensions: ["mid", "midi", "gp"] }],
			});

			if (result.canceled || result.filePaths.length === 0) {
				return null;
			}

			const picked = toPickedPath(result.filePaths[0]);
			addAllowedPath(allowedSourceFiles, picked.path);
			return picked;
		},
	);

	ipcMain.handle(
		"dialog:pick-audio-file",
		async (): Promise<PickedPath | null> => {
			const result = await dialog.showOpenDialog({
				title: "Select required audio file",
				properties: ["openFile"],
				filters: [
					{
						name: "Audio",
						extensions: ["mp3", "wav", "ogg", "flac", "m4a", "aac"],
					},
				],
			});

			if (result.canceled || result.filePaths.length === 0) {
				return null;
			}

			const picked = toPickedPath(result.filePaths[0]);
			addAllowedPath(allowedAudioFiles, picked.path);
			return picked;
		},
	);

	ipcMain.handle(
		"dialog:pick-output-folder",
		async (): Promise<PickedPath | null> => {
			const result = await dialog.showOpenDialog({
				title: "Select output folder",
				properties: ["openDirectory", "createDirectory"],
			});

			if (result.canceled || result.filePaths.length === 0) {
				return null;
			}

			const picked = toPickedPath(result.filePaths[0]);
			addAllowedPath(allowedOutputFolders, picked.path);
			return picked;
		},
	);

	ipcMain.handle(
		"dialog:pick-cover-image-file",
		async (): Promise<PickedPath | null> => {
			const result = await dialog.showOpenDialog({
				title: "Select cover image",
				properties: ["openFile"],
				filters: [
					{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] },
				],
			});

			if (result.canceled || result.filePaths.length === 0) {
				return null;
			}

			const picked = toPickedPath(result.filePaths[0]);
			addAllowedPath(allowedCoverImageFiles, picked.path);
			return { ...picked, fileUrl: pathToFileURL(picked.path).toString() };
		},
	);

	ipcMain.handle(
		"chdg:inspect-source",
		async (
			_event,
			input: unknown,
		): Promise<JsonEnvelope<SourceInspectionResult>> => {
			return toEnvelope(() => {
				const inspectInput = assertInspectInput(input);
				const sourcePath = assertAllowedSourcePath(inspectInput.sourcePath);
				return inspectSource({ ...inspectInput, sourcePath });
			});
		},
	);

	ipcMain.handle(
		"chdg:normalize-selection",
		async (
			_event,
			input: unknown,
		): Promise<JsonEnvelope<NormalizationPreview>> => {
			return toEnvelope(() => {
				const normalizeInput = assertNormalizeInput(input);
				const sourcePath = assertAllowedSourcePath(normalizeInput.sourcePath);
				return normalizeSelection({ ...normalizeInput, sourcePath });
			});
		},
	);

	ipcMain.handle(
		"chdg:get-source-fingerprint",
		async (
			_event,
			sourcePathInput: unknown,
		): Promise<JsonEnvelope<SourceReviewFingerprint>> => {
			return toEnvelope(async () => {
				const sourcePath = assertAllowedSourcePath(
					assertNonEmptyString(sourcePathInput, "Source path is required."),
				);
				const stats = await stat(sourcePath);
				return {
					path: sourcePath,
					sizeBytes: stats.size,
					mtimeMs: stats.mtimeMs,
				};
			});
		},
	);

	ipcMain.handle(
		"chdg:generate-package",
		async (
			_event,
			input: unknown,
		): Promise<JsonEnvelope<never>> => {
			void input;
			return toEnvelope(() => {
				throw new DesktopIpcError(
					"GENERATION_NOT_AVAILABLE",
					"Managed package generation is not available in this legacy workflow.",
				);
			});
		},
	);

	ipcMain.handle(
		"shell:open-output-folder",
		async (
			_event,
			folderPath: unknown,
		): Promise<JsonEnvelope<{ opened: true }>> => {
			return toEnvelope(async () => {
				if (typeof folderPath !== "string" || folderPath.trim().length === 0) {
					throw new DesktopIpcError(
						"INVALID_OUTPUT_FOLDER",
						"Output folder path is required.",
					);
				}
				const normalized = assertAllowedOpenOutputFolder(folderPath);
				const errorMessage = await shell.openPath(normalized);
				if (errorMessage) {
					throw new DesktopIpcError("OPEN_OUTPUT_FOLDER_FAILED", errorMessage);
				}
				return { opened: true as const };
			});
		},
	);

	// Project persistence handlers
	ipcMain.handle(
		"dialog:save-project-file",
		async (): Promise<never> => {
			throw new DesktopIpcError(
				"PROJECT_SAVE_PICKER_NOT_AVAILABLE",
				"Save Project is not available until canonical project persistence is implemented.",
			);
		},
	);

	ipcMain.handle(
		"dialog:open-project-file",
		async (): Promise<PickedPath | null> => {
			const result = await dialog.showOpenDialog({
				title: "Open Project",
				properties: ["openFile"],
				filters: [{ name: "CHDG Project", extensions: ["chdg"] }],
			});
			if (result.canceled || result.filePaths.length === 0) return null;
			const picked = toPickedPath(result.filePaths[0]);
			addAllowedProjectFile(allowedProjectFiles, picked.path);
			return picked;
		},
	);

	ipcMain.handle(
		"chdg:create-project",
		async (
			_event,
			_input: unknown,
		): Promise<JsonEnvelope<ProjectStatePayload>> => {
			return toEnvelope(() => {
				throw new DesktopIpcError(
					"PROJECT_CREATION_NOT_AVAILABLE",
					"Project creation is not available until the canonical import workflow is implemented.",
				);
			});
		},
	);

	ipcMain.handle(
		"chdg:save-project",
		async (
			_event,
			_input: unknown,
		): Promise<JsonEnvelope<SaveProjectResult>> => {
			return toEnvelope(() => {
				throw new DesktopIpcError(
					"PROJECT_SAVE_NOT_AVAILABLE",
					"Saving canonical projects is not available in this legacy workflow.",
				);
			});
		},
	);

	ipcMain.handle(
		"chdg:save-project-as",
		async (
			_event,
			_input: unknown,
		): Promise<JsonEnvelope<SaveProjectResult>> => {
			return toEnvelope(() => {
				throw new DesktopIpcError(
					"PROJECT_SAVE_AS_NOT_AVAILABLE",
					"Save As is not available until canonical project copying is implemented.",
				);
			});
		},
	);

	ipcMain.handle(
		"chdg:open-project",
		async (
			_event,
			filePath: unknown,
		): Promise<
			JsonEnvelope<
				ProjectStatePayload & { missingPaths: ProjectMissingPathKind[] }
			>
		> => {
			return toEnvelope(async () => {
				const candidatePath = assertNonEmptyString(
					filePath,
					"Project file path is required.",
				);
				const targetPath = await resolveAllowedOpenProjectFile(
					allowedProjectFiles,
					candidatePath,
					readRecentProjects,
					"PROJECT_FILE_NOT_ALLOWED",
					"Project file was not selected in this desktop session or found in Electron-owned recents.",
				);
				const readResult = await readProjectFile(targetPath);
				if (!readResult.ok) {
					throw new DesktopIpcError(readResult.code, readResult.message);
				}
				const { project, missingPaths } = readResult;
				const payload = projectFileToDesktopState(targetPath, project);
				addAllowedPath(allowedSourceFiles, payload.sourcePath);
				addAllowedPath(allowedAudioFiles, payload.audioPath);
				if (payload.outputDir) {
					addAllowedPath(allowedOutputFolders, payload.outputDir);
				}
				if (payload.cover?.imagePath) {
					addAllowedPath(allowedCoverImageFiles, payload.cover.imagePath);
				}
				await addRecentProject({
					path: targetPath,
					name: payload.projectName,
					lastOpenedAt: new Date().toISOString(),
				});
				return {
					...payload,
					missingPaths,
				};
			});
		},
	);

	ipcMain.handle(
		"chdg:read-recent-projects",
		async (): Promise<JsonEnvelope<RecentProject[]>> => {
			return toEnvelope(() => readRecentProjects());
		},
	);

	ipcMain.handle(
		"chdg:remove-recent-project",
		async (_event, projectPath: unknown): Promise<JsonEnvelope<void>> => {
			return toEnvelope(async () => {
				const target = assertNonEmptyString(
					projectPath,
					"Project path is required.",
				);
				await removeRecentProject(target);
			});
		},
	);

	ipcMain.handle(
		"chdg:delete-project-file",
		async (_event, projectPath: unknown): Promise<JsonEnvelope<void>> => {
			return toEnvelope(async () => {
				const target = assertNonEmptyString(
					projectPath,
					"Project path is required.",
				);
				const deletable = await resolveDeletableProjectFilePath(
					target,
					allowedProjectFiles,
					readRecentProjects,
				);
				if (deletable.exists) {
					await deleteProjectFilePath(deletable.filePath);
				}
				await removeRecentProject(deletable.filePath);
			});
		},
	);

	ipcMain.handle(
		"chdg:read-settings",
		async (): Promise<
			JsonEnvelope<import("@chdg/project").DesktopSettings>
		> => {
			return toEnvelope(() => readSettings());
		},
	);
	ipcMain.handle(
		"chdg:read-mapping-profiles",
		async (): Promise<JsonEnvelope<MappingOverrideProfile[]>> => {
			return toEnvelope(() => readMappingProfiles());
		},
	);
	ipcMain.handle(
		"chdg:save-mapping-profile",
		async (
			_event,
			input: unknown,
		): Promise<JsonEnvelope<MappingOverrideProfile[]>> => {
			return toEnvelope(async () => {
				const profile = assertMappingProfile(input);
				const current = await readMappingProfiles();
				const next = current.filter((item) => item.id !== profile.id);
				next.push(profile);
				await writeMappingProfiles(next);
				return next.sort((a, b) => a.name.localeCompare(b.name));
			});
		},
	);
	ipcMain.handle(
		"chdg:delete-mapping-profile",
		async (
			_event,
			profileId: unknown,
		): Promise<JsonEnvelope<MappingOverrideProfile[]>> => {
			return toEnvelope(async () => {
				const id = assertNonEmptyString(profileId, "Profile id is required.");
				const next = (await readMappingProfiles()).filter(
					(item) => item.id !== id,
				);
				await writeMappingProfiles(next);
				return next.sort((a, b) => a.name.localeCompare(b.name));
			});
		},
	);

	ipcMain.handle(
		"chdg:get-cover-image-preview-url",
		async (
			_event,
			imagePath: unknown,
		): Promise<JsonEnvelope<{ src: string }>> => {
			return toEnvelope(async () => {
				const target = assertNonEmptyString(
					imagePath,
					"Cover image path is required.",
				);
				const safePath = assertAllowedCoverImagePath(target);
				await access(safePath);
				return { src: pathToFileURL(safePath).toString() };
			});
		},
	);

	ipcMain.handle(
		"chdg:write-settings",
		async (
			_event,
			settings: unknown,
		): Promise<JsonEnvelope<import("@chdg/project").DesktopSettings>> => {
			return toEnvelope(async () => {
				const validated = assertSettingsPayload(settings);
				await writeSettings(validated);
				return validated;
			});
		},
	);

	ipcMain.handle(
		"chdg:test-ffmpeg",
		async (
			_event,
			input: unknown,
		): Promise<
			JsonEnvelope<import("./ffmpegDiagnostic.js").FfmpegDiagnostic>
		> => {
			return toEnvelope(async () => {
				const pathValue = typeof input === "string" ? input : undefined;
				return testFfmpeg(pathValue);
			});
		},
	);

	ipcMain.handle(
		"chdg:get-audio-preview-source",
		async (
			_event,
			input: unknown,
		): Promise<
			JsonEnvelope<{ src: string; sourceKind: "generated" }>
		> => {
			return toEnvelope(async () => {
				const value = assertRecord(input, "Audio preview input is required.");
				const candidate = pickAudioPreviewCandidate({
					generatedSongOggPath: optionalString(
						value["generatedSongOggPath"],
						"generatedSongOggPath must be text.",
					),
				});

				if (candidate.generatedPath) {
					const generatedPath = path.resolve(candidate.generatedPath);
					if (path.basename(generatedPath).toLowerCase() === "song.ogg") {
						const outputDir = path.dirname(generatedPath);
						assertAllowedOutputFolder(outputDir);
						try {
							await access(generatedPath);
							return {
								src: pathToFileURL(generatedPath).toString(),
								sourceKind: "generated" as const,
							};
						} catch {
							// try fallback below
						}
					}
				}

				throw new DesktopIpcError(
					"PREVIEW_AUDIO_NOT_AVAILABLE",
					"No safe preview audio source is available for this project.",
				);
			});
		},
	);

	ipcMain.handle(
		"chdg:get-chart-preview-data",
		async (
			_event,
			input: unknown,
		): Promise<JsonEnvelope<import("./previewData.js").ChartPreviewData>> => {
			return toEnvelope(async () => {
				const value = assertRecord(input, "Chart preview input is required.");
				const chartPathInput = optionalString(
					value["chartPath"],
					"chartPath must be text.",
				);
				const analysis = optionalAnalysisCache(value["analysis"]);
				const sourceTiming = sourceTimingFromDocument(value["sourceTiming"]);
				let resolved: ReturnType<typeof resolveChartPreviewPath>;
				try {
					resolved = resolveChartPreviewPath({
						chartPath: chartPathInput,
					});
				} catch (error) {
					if (
						error instanceof Error &&
						error.message === "PREVIEW_CHART_NOT_AVAILABLE"
					) {
						throw new DesktopIpcError(
							"PREVIEW_CHART_NOT_AVAILABLE",
							"Chart path is unavailable.",
						);
					}
					throw new DesktopIpcError(
						"PREVIEW_CHART_NOT_ALLOWED",
						"Only notes.chart can be used for chart preview.",
					);
				}
				assertAllowedOutputFolder(resolved.chartDir);
				await access(resolved.chartPath);
				return parseChartPreviewData(
					resolved.chartPath,
					sourceTiming ?? sourceTimingFromAnalysisCache(analysis),
				);
			});
		},
	);

	ipcMain.handle(
		"chdg:apply-chart-offset",
		async (
			_event,
			input: unknown,
		): Promise<JsonEnvelope<{ chartPath: string; offsetSeconds: number }>> => {
			void input;
			return toEnvelope(() => {
				throw new DesktopIpcError(
					"CHART_OFFSET_WRITE_NOT_AVAILABLE",
					"Writing preview offsets to managed notes.chart is not available until canonical export state can be persisted.",
				);
			});
		},
	);

	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

function toPickedPath(filePath: string): PickedPath {
	return { path: filePath, name: path.basename(filePath) };
}

function assertAllowedSourcePath(sourcePath: string): string {
	return assertAllowedPath(
		allowedSourceFiles,
		sourcePath,
		"SOURCE_FILE_NOT_SELECTED",
		"Select the source file with the desktop file picker before using it.",
	);
}

function assertAllowedAudioPath(audioSource: string): string {
	return assertAllowedPath(
		allowedAudioFiles,
		audioSource,
		"AUDIO_FILE_NOT_SELECTED",
		"Select the audio file with the desktop file picker before generating.",
	);
}

function assertAllowedCoverImagePath(coverImagePath: string): string {
	return assertAllowedPath(
		allowedCoverImageFiles,
		coverImagePath,
		"COVER_IMAGE_NOT_SELECTED",
		"Select the cover image with the desktop file picker before saving it.",
	);
}

function assertAllowedOutputFolder(outDir: string): string {
	return assertAllowedPath(
		allowedOutputFolders,
		outDir,
		"OUTPUT_FOLDER_NOT_SELECTED",
		"Select the output folder with the desktop folder picker before generating.",
	);
}

function assertAllowedOpenOutputFolder(folderPath: string): string {
	return assertAllowedPath(
		allowedOutputFolders,
		folderPath,
		"OPEN_OUTPUT_FOLDER_DENIED",
		"Output folder was not selected or generated in this desktop session.",
	);
}

async function toEnvelope<T>(
	operation: () => Promise<T>,
): Promise<JsonEnvelope<T>> {
	try {
		const data = await operation();
		return { ok: true, data, issues: [] };
	} catch (error) {
		const projectError = error as {
			code?: unknown;
			message?: unknown;
			issues?: unknown;
		};
		return {
			ok: false,
			error: {
				code:
					typeof projectError.code === "string"
						? projectError.code
						: "DESKTOP_OPERATION_FAILED",
				message:
					typeof projectError.message === "string"
						? projectError.message
						: "Desktop operation failed.",
			},
			issues: Array.isArray(projectError.issues)
				? (projectError.issues as ProjectIssue[])
				: [],
		};
	}
}

function assertInspectInput(input: unknown): {
	sourcePath: string;
	trackIndex?: number;
	drumsOnly?: boolean;
} {
	const value = assertRecord(input, "Inspect input is required.");
	return {
		sourcePath: assertNonEmptyString(
			value["sourcePath"],
			"Source path is required.",
		),
		trackIndex: optionalNumber(
			value["trackIndex"],
			"Track index must be numeric.",
		),
		drumsOnly: optionalBoolean(
			value["drumsOnly"],
			"drumsOnly must be boolean.",
		),
	};
}

function assertNormalizeInput(input: unknown): NormalizeSelectionInput {
	const value = assertRecord(input, "Normalize input is required.");
	return {
		sourcePath: assertNonEmptyString(
			value["sourcePath"],
			"Source path is required.",
		),
		trackIndex: optionalNumber(
			value["trackIndex"],
			"Track index must be numeric.",
		),
		trackIndexes: optionalNumberArray(
			value["trackIndexes"],
			"Track indexes must be numeric.",
		),
		mappingOverrides: optionalMappingOverrides(value["mappingOverrides"]),
	};
}

function assertRecord(
	input: unknown,
	message: string,
): Record<string, unknown> {
	if (typeof input !== "object" || input === null || Array.isArray(input)) {
		throw new DesktopIpcError("INVALID_INPUT", message);
	}
	return input as Record<string, unknown>;
}

function assertNonEmptyString(input: unknown, message: string): string {
	if (typeof input !== "string" || input.trim().length === 0) {
		throw new DesktopIpcError("INVALID_INPUT", message);
	}
	return input;
}

function optionalString(input: unknown, message: string): string | undefined {
	if (input === undefined || input === null || input === "") return undefined;
	if (typeof input !== "string")
		throw new DesktopIpcError("INVALID_INPUT", message);
	return input;
}

function optionalNumber(input: unknown, message: string): number | undefined {
	if (input === undefined || input === null || input === "") return undefined;
	if (typeof input !== "number" || !Number.isFinite(input))
		throw new DesktopIpcError("INVALID_INPUT", message);
	return input;
}

function optionalBoolean(input: unknown, message: string): boolean | undefined {
	if (input === undefined || input === null) return undefined;
	if (typeof input !== "boolean")
		throw new DesktopIpcError("INVALID_INPUT", message);
	return input;
}

function optionalNumberArray(
	input: unknown,
	message: string,
): number[] | undefined {
	if (input === undefined || input === null) return undefined;
	if (
		!Array.isArray(input) ||
		input.length === 0 ||
		input.some((item) => typeof item !== "number" || !Number.isFinite(item))
	) {
		throw new DesktopIpcError("INVALID_INPUT", message);
	}
	return input;
}

function optionalMappingOverrides(
	value: unknown,
): ProjectMappingOverrides | undefined {
	if (value === undefined) return undefined;
	return validateMappingOverrides(value);
}

function optionalAnalysisCache(
	value: unknown,
): SourceReviewRuntimeCache | undefined {
	if (value === undefined || value === null) return undefined;
	if (typeof value !== "object" || Array.isArray(value)) return undefined;
	return value as SourceReviewRuntimeCache;
}

function assertSettingsPayload(
	input: unknown,
): import("@chdg/project").DesktopSettings {
	const value = assertRecord(input, "Settings payload is required.");
	return {
		schemaVersion: 1,
		theme: "dark",
		accentColor: optionalString(
			value["accentColor"],
			"accentColor must be a string.",
		),
		projectLocation: assertNonEmptyString(
			value["projectLocation"],
			"projectLocation is required.",
		),
		defaultOutputFolder: optionalString(
			value["defaultOutputFolder"],
			"defaultOutputFolder must be a string.",
		),
		defaultCharter: optionalString(
			value["defaultCharter"],
			"defaultCharter must be a string.",
		),
		defaultOffsetMs: optionalNumber(
			value["defaultOffsetMs"],
			"defaultOffsetMs must be numeric.",
		),
		ffmpegPath: optionalString(
			value["ffmpegPath"],
			"ffmpegPath must be a string.",
		),
	};
}

function assertMappingProfile(input: unknown): MappingOverrideProfile {
	const value = assertRecord(input, "Mapping profile payload is required.");
	const id = assertNonEmptyString(value["id"], "Profile id is required.");
	const name = assertNonEmptyString(value["name"], "Profile name is required.");
	const createdAt = assertNonEmptyString(
		value["createdAt"],
		"Profile createdAt is required.",
	);
	const updatedAt = assertNonEmptyString(
		value["updatedAt"],
		"Profile updatedAt is required.",
	);
	const sourceKind = value["sourceKind"];
	if (
		sourceKind !== undefined &&
		sourceKind !== "midi" &&
		sourceKind !== "gpif"
	) {
		throw new DesktopIpcError(
			"INVALID_PROFILE_SOURCE_KIND",
			"Profile sourceKind must be midi or gpif.",
		);
	}
	return {
		id,
		name,
		description:
			typeof value["description"] === "string"
				? value["description"]
				: undefined,
		sourceKind,
		overrides: validateMappingOverrides(value["overrides"]),
		createdAt,
		updatedAt,
	};
}

class DesktopIpcError extends Error {
	constructor(
		readonly code: string,
		message: string,
	) {
		super(message);
		this.name = "DesktopIpcError";
	}
}
