import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
	generatePackage,
	inspectSource,
	normalizeSelection,
	type GeneratePackageInput,
	type JsonEnvelope,
	type NormalizeSelectionInput,
	type ProjectIssue,
	type SourceInspectionResult,
	type NormalizationPreview,
	type GeneratePackageResult,
	type ChdgProjectFile,
	type ChdgOutputStatus,
	type RecentProject,
	type ProjectMappingOverrides,
	type MappingOverrideProfile,
	validateMappingOverrides,
} from "@chdg/project";
import { addAllowedPath, assertAllowedPath } from "./pathAllowlist.js";
import {
	readProjectFile,
	writeProjectFile,
	buildProjectFileFromState,
	getDefaultProjectFilePath,
	getDefaultOutputDir,
} from "./projectFileService.js";
import {
	readSettings,
	writeSettings,
	readRecentProjects,
	addRecentProject,
	removeRecentProject,
} from "./settingsService.js";
import {
	readMappingProfiles,
	writeMappingProfiles,
} from "./mappingProfileService.js";
import { testFfmpeg } from "./ffmpegDiagnostic.js";
import {
	addAllowedProjectFile,
	assertAllowedProjectFile,
	resolveAllowedOpenProjectFile,
} from "./projectFileAccess.js";
import {
	assertCreateProjectName,
	optionalSelectedTracks,
} from "./projectPayloadValidation.js";
import {
	pickAudioPreviewCandidate,
	parseChartPreviewData,
	resolveChartPreviewPath,
} from "./previewData.js";
import { applyChartOffsetFile } from "./chartOffset.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rendererIndex = path.join(__dirname, "../renderer/browser/index.html");
const preloadScript = path.join(__dirname, "preload.cjs");
const knownOutputFiles = ["notes.chart", "song.ini", "song.ogg"];
const allowedSourceFiles = new Set<string>();
const allowedAudioFiles = new Set<string>();
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
};

type DesktopGeneratePackageInput = GeneratePackageInput & {
	audioSource: string;
	overwriteKnownFiles?: boolean;
};

type ProjectStatePayload = {
	projectName: string;
	projectFilePath?: string;
	sourcePath?: string;
	audioPath?: string;
	outputDir?: string;
	sourceKind?: "midi" | "gpif";
	selectedTracks: number[];
	metadata: {
		name?: string;
		artist?: string;
		album?: string;
		year?: string;
		genre?: string;
		charter?: string;
	};
	offsetMs?: number;
	generationStatus: ChdgOutputStatus;
	lastGeneratedAt?: string;
	outputFiles?: {
		chart?: string;
		songIni?: string;
		songOgg?: string;
	};
	mappingOverrides?: ProjectMappingOverrides;
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
		"chdg:generate-package",
		async (
			_event,
			input: unknown,
		): Promise<JsonEnvelope<GeneratePackageResult>> => {
			return toEnvelope(async () => {
				const generateInput = assertGenerateInput(input);
				const sourcePath = assertAllowedSourcePath(generateInput.sourcePath);
				const audioSource = assertAllowedAudioPath(generateInput.audioSource);
				const normalizedOutDir = assertAllowedOutputFolder(
					generateInput.outDir,
				);
				const existing = await findExistingKnownOutputs(normalizedOutDir);
				if (existing.length > 0 && !generateInput.overwriteKnownFiles) {
					throw new DesktopIpcError(
						"OVERWRITE_CONFIRMATION_REQUIRED",
						`Output folder already contains ${existing.join(", ")}. Confirm overwrite to replace only known CHDG output files.`,
					);
				}
				return generatePackage({
					...generateInput,
					sourcePath,
					audioSource,
					outDir: normalizedOutDir,
				});
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
		async (_event, projectName: unknown, currentPath?: unknown): Promise<PickedPath | null> => {
			const name = typeof projectName === "string" && projectName.trim().length > 0 ? projectName.trim() : "Untitled";
			const defaultPath = typeof currentPath === "string" && currentPath.trim().length > 0
				? currentPath
				: getDefaultProjectFilePath(name);
			const result = await dialog.showSaveDialog({
				title: "Save Project",
				defaultPath,
				filters: [{ name: "CHDG Project", extensions: ["chdg"] }],
			});
			if (result.canceled || !result.filePath) return null;
			const picked = toPickedPath(result.filePath);
			addAllowedProjectFile(allowedProjectFiles, picked.path);
			return picked;
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
		async (_event, input: unknown): Promise<JsonEnvelope<ProjectStatePayload>> => {
			return toEnvelope(async () => {
				const name = assertCreateProjectName(input);
				const settings = await readSettings();
				const projectFolder = path.join(settings.projectLocation, name);
				const filePath = path.join(projectFolder, `${name}.chdg`);
				const outputDir = getDefaultOutputDir(filePath);
				addAllowedProjectFile(allowedProjectFiles, filePath);
				const project = buildProjectFileFromState(name, app.getVersion(), {
					outputDir,
					selectedTracks: [],
					metadata: {},
					generationStatus: "not-generated",
				});
				const writeResult = await writeProjectFile(filePath, project);
				if (!writeResult.ok) {
					throw new DesktopIpcError(writeResult.code, writeResult.message);
				}
				await addRecentProject({ path: filePath, name, lastOpenedAt: new Date().toISOString() });
				addAllowedPath(allowedOutputFolders, outputDir);
				return {
					projectName: name,
					projectFilePath: filePath,
					outputDir,
					selectedTracks: [],
					metadata: {},
					generationStatus: "not-generated" as ChdgOutputStatus,
					mappingOverrides: {},
				};
			});
		},
	);

	ipcMain.handle(
		"chdg:save-project",
		async (_event, input: unknown): Promise<JsonEnvelope<SaveProjectResult>> => {
			return toEnvelope(async () => {
				const payload = assertProjectStatePayload(input);
				const defaultPath = getDefaultProjectFilePath(payload.projectName);
				const candidatePath = payload.projectFilePath ?? defaultPath;
				if (!payload.projectFilePath) {
					addAllowedProjectFile(allowedProjectFiles, candidatePath);
				}
				const filePath = assertAllowedProjectFile(
					allowedProjectFiles,
					candidatePath,
					"PROJECT_SAVE_PATH_NOT_SELECTED",
					"Project save path was not selected or created by a trusted desktop flow.",
				);
				const project = buildProjectFileFromState(payload.projectName, app.getVersion(), payload);
				const writeResult = await writeProjectFile(filePath, project);
				if (!writeResult.ok) {
					throw new DesktopIpcError(writeResult.code, writeResult.message);
				}
				await addRecentProject({ path: filePath, name: payload.projectName, lastOpenedAt: new Date().toISOString() });
				return { filePath, project };
			});
		},
	);

	ipcMain.handle(
		"chdg:save-project-as",
		async (_event, input: unknown): Promise<JsonEnvelope<SaveProjectResult>> => {
			return toEnvelope(async () => {
				const payload = assertProjectStatePayload(input);
				const value = assertRecord(input, "Save As payload is required.");
				const candidatePath = assertNonEmptyString(
					value["filePath"],
					"filePath is required for Save As.",
				);
				const filePath = assertAllowedProjectFile(
					allowedProjectFiles,
					candidatePath,
					"PROJECT_SAVE_PATH_NOT_SELECTED",
					"Select the project file path with the desktop save dialog before writing it.",
				);
				const project = buildProjectFileFromState(payload.projectName, app.getVersion(), payload);
				const writeResult = await writeProjectFile(filePath, project);
				if (!writeResult.ok) {
					throw new DesktopIpcError(writeResult.code, writeResult.message);
				}
				await addRecentProject({ path: filePath, name: payload.projectName, lastOpenedAt: new Date().toISOString() });
				return { filePath, project };
			});
		},
	);

	ipcMain.handle(
		"chdg:open-project",
		async (_event, filePath: unknown): Promise<JsonEnvelope<ProjectStatePayload & { missingPaths: string[] }>> => {
			return toEnvelope(async () => {
				const candidatePath = assertNonEmptyString(filePath, "Project file path is required.");
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
				if (project.paths.sourcePath) {
					addAllowedPath(allowedSourceFiles, project.paths.sourcePath);
				}
				if (project.paths.audioPath) {
					addAllowedPath(allowedAudioFiles, project.paths.audioPath);
				}
				if (project.paths.outputDir) {
					addAllowedPath(allowedOutputFolders, project.paths.outputDir);
				}
				await addRecentProject({ path: targetPath, name: project.project.name, lastOpenedAt: new Date().toISOString() });
				return {
					projectName: project.project.name,
					projectFilePath: targetPath,
					sourcePath: project.paths.sourcePath,
					audioPath: project.paths.audioPath,
					outputDir: project.paths.outputDir,
					sourceKind: project.source?.sourceKind,
					selectedTracks: project.selection.selectedTracks,
					metadata: project.metadata,
					offsetMs: project.generation.offsetMs,
					generationStatus: project.generation.status,
					lastGeneratedAt: project.generation.lastGeneratedAt,
					outputFiles: project.generation.outputFiles,
					mappingOverrides: validateMappingOverrides(project.mappingOverrides),
					missingPaths,
				};
			});
		},
	);

	ipcMain.handle("chdg:read-recent-projects", async (): Promise<JsonEnvelope<RecentProject[]>> => {
		return toEnvelope(() => readRecentProjects());
	});

	ipcMain.handle(
		"chdg:remove-recent-project",
		async (_event, projectPath: unknown): Promise<JsonEnvelope<void>> => {
			return toEnvelope(async () => {
				const target = assertNonEmptyString(projectPath, "Project path is required.");
				await removeRecentProject(target);
			});
		},
	);

	ipcMain.handle("chdg:read-settings", async (): Promise<JsonEnvelope<import("@chdg/project").DesktopSettings>> => {
		return toEnvelope(() => readSettings());
	});
	ipcMain.handle("chdg:read-mapping-profiles", async (): Promise<JsonEnvelope<MappingOverrideProfile[]>> => {
		return toEnvelope(() => readMappingProfiles());
	});
	ipcMain.handle("chdg:save-mapping-profile", async (_event, input: unknown): Promise<JsonEnvelope<MappingOverrideProfile[]>> => {
		return toEnvelope(async () => {
			const profile = assertMappingProfile(input);
			const current = await readMappingProfiles();
			const next = current.filter((item) => item.id !== profile.id);
			next.push(profile);
			await writeMappingProfiles(next);
			return next.sort((a, b) => a.name.localeCompare(b.name));
		});
	});
	ipcMain.handle("chdg:delete-mapping-profile", async (_event, profileId: unknown): Promise<JsonEnvelope<MappingOverrideProfile[]>> => {
		return toEnvelope(async () => {
			const id = assertNonEmptyString(profileId, "Profile id is required.");
			const next = (await readMappingProfiles()).filter((item) => item.id !== id);
			await writeMappingProfiles(next);
			return next.sort((a, b) => a.name.localeCompare(b.name));
		});
	});

	ipcMain.handle(
		"chdg:write-settings",
		async (_event, settings: unknown): Promise<JsonEnvelope<import("@chdg/project").DesktopSettings>> => {
			return toEnvelope(async () => {
				const validated = assertSettingsPayload(settings);
				await writeSettings(validated);
				return validated;
			});
		},
	);

	ipcMain.handle(
		"chdg:test-ffmpeg",
		async (_event, input: unknown): Promise<JsonEnvelope<import("./ffmpegDiagnostic.js").FfmpegDiagnostic>> => {
			return toEnvelope(async () => {
				const pathValue = typeof input === "string" ? input : undefined;
				return testFfmpeg(pathValue);
			});
		},
	);

	ipcMain.handle(
		"chdg:get-audio-preview-source",
		async (_event, input: unknown): Promise<JsonEnvelope<{ src: string; sourceKind: "generated" | "selected-audio" }>> => {
			return toEnvelope(async () => {
				const value = assertRecord(input, "Audio preview input is required.");
				const candidate = pickAudioPreviewCandidate({
					outputDir: optionalString(value["outputDir"], "outputDir must be text."),
					generatedSongOggPath: optionalString(value["generatedSongOggPath"], "generatedSongOggPath must be text."),
					selectedAudioPath: optionalString(value["selectedAudioPath"], "selectedAudioPath must be text."),
				});

				if (candidate.generatedPath) {
					const generatedPath = path.resolve(candidate.generatedPath);
					if (path.basename(generatedPath).toLowerCase() === "song.ogg") {
						const outputDir = path.dirname(generatedPath);
						assertAllowedOutputFolder(outputDir);
						try {
							await access(generatedPath);
							return { src: pathToFileURL(generatedPath).toString(), sourceKind: "generated" as const };
						} catch {
							// try fallback below
						}
					}
				}

				if (candidate.selectedAudioPath) {
					const selected = assertAllowedAudioPath(candidate.selectedAudioPath);
					await access(selected);
					return { src: pathToFileURL(selected).toString(), sourceKind: "selected-audio" as const };
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
		async (_event, input: unknown): Promise<JsonEnvelope<import("./previewData.js").ChartPreviewData>> => {
			return toEnvelope(async () => {
				const value = assertRecord(input, "Chart preview input is required.");
				const outputDir = optionalString(value["outputDir"], "outputDir must be text.");
				const chartPathInput = optionalString(value["chartPath"], "chartPath must be text.");
				let resolved: ReturnType<typeof resolveChartPreviewPath>;
				try {
					resolved = resolveChartPreviewPath({ outputDir, chartPath: chartPathInput });
				} catch (error) {
					if (error instanceof Error && error.message === "PREVIEW_CHART_NOT_AVAILABLE") {
						throw new DesktopIpcError("PREVIEW_CHART_NOT_AVAILABLE", "Chart path is unavailable.");
					}
					throw new DesktopIpcError("PREVIEW_CHART_NOT_ALLOWED", "Only notes.chart can be used for chart preview.");
				}
				assertAllowedOutputFolder(resolved.chartDir);
				await access(resolved.chartPath);
				return parseChartPreviewData(resolved.chartPath);
			});
		},
	);

	ipcMain.handle(
		"chdg:apply-chart-offset",
		async (_event, input: unknown): Promise<JsonEnvelope<{ chartPath: string; offsetSeconds: number }>> => {
			return toEnvelope(async () => {
				const value = assertRecord(input, "Chart offset input is required.");
				const outputDir = assertNonEmptyString(value["outputDir"], "outputDir is required.");
				const chartPathInput = optionalString(value["chartPath"], "chartPath must be text.");
				const offsetMs = optionalNumber(value["offsetMs"], "offsetMs must be numeric.");
				if (offsetMs === undefined) {
					throw new DesktopIpcError("INVALID_INPUT", "offsetMs is required.");
				}

				let resolved: ReturnType<typeof resolveChartPreviewPath>;
				try {
					resolved = resolveChartPreviewPath({ outputDir, chartPath: chartPathInput });
				} catch {
					throw new DesktopIpcError("PREVIEW_CHART_NOT_ALLOWED", "Only notes.chart can be updated for chart offset.");
				}

				assertAllowedOutputFolder(outputDir);
				assertAllowedOutputFolder(resolved.chartDir);
				await access(resolved.chartPath);
				return applyChartOffsetFile({ chartPath: resolved.chartPath, offsetMs });
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

function assertGenerateInput(input: unknown): DesktopGeneratePackageInput {
	const value = assertRecord(input, "Generate input is required.");
	return {
		sourcePath: assertNonEmptyString(
			value["sourcePath"],
			"Source path is required.",
		),
		outDir: assertNonEmptyString(value["outDir"], "Output folder is required."),
		trackIndex: optionalNumber(
			value["trackIndex"],
			"Track index must be numeric.",
		),
		trackIndexes: optionalNumberArray(
			value["trackIndexes"],
			"Track indexes must be numeric.",
		),
		audioFile: optionalString(
			value["audioFile"],
			"Audio file name must be text.",
		),
		audioSource: assertNonEmptyString(
			value["audioSource"],
			"Audio file is required for Desktop Generate MVP.",
		),
		offsetMs: optionalNumber(value["offsetMs"], "Offset must be numeric."),
		name: optionalString(value["name"], "Song name must be text."),
		artist: optionalString(value["artist"], "Artist must be text."),
		album: optionalString(value["album"], "Album must be text."),
		year: optionalString(value["year"], "Year must be text."),
		genre: optionalString(value["genre"], "Genre must be text."),
		charter: optionalString(value["charter"], "Charter must be text."),
		overwriteKnownFiles: optionalBoolean(
			value["overwriteKnownFiles"],
			"overwriteKnownFiles must be boolean.",
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

function assertProjectStatePayload(input: unknown): ProjectStatePayload {
	const value = assertRecord(input, "Project state payload is required.");
	return {
		projectName: assertNonEmptyString(value["projectName"], "projectName is required."),
		projectFilePath: optionalString(value["projectFilePath"], "projectFilePath must be a string."),
		sourcePath: optionalString(value["sourcePath"], "sourcePath must be a string."),
		audioPath: optionalString(value["audioPath"], "audioPath must be a string."),
		outputDir: optionalString(value["outputDir"], "outputDir must be a string."),
		sourceKind: optionalSourceKind(value["sourceKind"]),
		selectedTracks: optionalSelectedTracks(value["selectedTracks"]),
		metadata: assertMetadata(value["metadata"]),
		offsetMs: optionalNumber(value["offsetMs"], "offsetMs must be numeric."),
		generationStatus: assertGenerationStatus(value["generationStatus"]),
		lastGeneratedAt: optionalString(value["lastGeneratedAt"], "lastGeneratedAt must be a string."),
		outputFiles: optionalOutputFiles(value["outputFiles"]),
		mappingOverrides: validateMappingOverrides(value["mappingOverrides"]),
	};
}

function assertSettingsPayload(input: unknown): import("@chdg/project").DesktopSettings {
	const value = assertRecord(input, "Settings payload is required.");
	return {
		schemaVersion: 1,
		theme: "dark",
		accentColor: optionalString(value["accentColor"], "accentColor must be a string."),
		projectLocation: assertNonEmptyString(value["projectLocation"], "projectLocation is required."),
		defaultOutputFolder: optionalString(value["defaultOutputFolder"], "defaultOutputFolder must be a string."),
		defaultCharter: optionalString(value["defaultCharter"], "defaultCharter must be a string."),
		defaultOffsetMs: optionalNumber(value["defaultOffsetMs"], "defaultOffsetMs must be numeric."),
		ffmpegPath: optionalString(value["ffmpegPath"], "ffmpegPath must be a string."),
	};
}

function assertMappingProfile(input: unknown): MappingOverrideProfile {
	const value = assertRecord(input, "Mapping profile payload is required.");
	const id = assertNonEmptyString(value["id"], "Profile id is required.");
	const name = assertNonEmptyString(value["name"], "Profile name is required.");
	const createdAt = assertNonEmptyString(value["createdAt"], "Profile createdAt is required.");
	const updatedAt = assertNonEmptyString(value["updatedAt"], "Profile updatedAt is required.");
	const sourceKind = value["sourceKind"];
	if (sourceKind !== undefined && sourceKind !== "midi" && sourceKind !== "gpif") {
		throw new DesktopIpcError("INVALID_PROFILE_SOURCE_KIND", "Profile sourceKind must be midi or gpif.");
	}
	return {
		id,
		name,
		description: typeof value["description"] === "string" ? value["description"] : undefined,
		sourceKind,
		overrides: validateMappingOverrides(value["overrides"]),
		createdAt,
		updatedAt,
	};
}

function optionalSourceKind(input: unknown): "midi" | "gpif" | undefined {
	if (input === undefined || input === null) return undefined;
	if (input === "midi" || input === "gpif") return input;
	return undefined;
}

function assertMetadata(input: unknown): ProjectStatePayload["metadata"] {
	if (typeof input !== "object" || input === null) return {};
	const value = input as Record<string, unknown>;
	return {
		name: optionalString(value["name"], "name must be a string."),
		artist: optionalString(value["artist"], "artist must be a string."),
		album: optionalString(value["album"], "album must be a string."),
		year: optionalString(value["year"], "year must be a string."),
		genre: optionalString(value["genre"], "genre must be a string."),
		charter: optionalString(value["charter"], "charter must be a string."),
	};
}

function assertGenerationStatus(input: unknown): ChdgOutputStatus {
	const valid: ChdgOutputStatus[] = ["not-generated", "generated", "needs-regenerate", "failed"];
	if (valid.includes(input as ChdgOutputStatus)) return input as ChdgOutputStatus;
	return "not-generated";
}

function optionalOutputFiles(input: unknown): { chart?: string; songIni?: string; songOgg?: string } | undefined {
	if (typeof input !== "object" || input === null) return undefined;
	const value = input as Record<string, unknown>;
	return {
		chart: optionalString(value["chart"], "chart must be a string."),
		songIni: optionalString(value["songIni"], "songIni must be a string."),
		songOgg: optionalString(value["songOgg"], "songOgg must be a string."),
	};
}

async function findExistingKnownOutputs(outDir: string): Promise<string[]> {
	const existing: string[] = [];
	for (const fileName of knownOutputFiles) {
		try {
			await access(path.join(outDir, fileName));
			existing.push(fileName);
		} catch {
			// File does not exist or cannot be accessed; generation can proceed for MVP.
		}
	}
	return existing;
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
