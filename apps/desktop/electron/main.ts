import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
} from "@chdg/project";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rendererIndex = path.join(__dirname, "../renderer/browser/index.html");
const preloadScript = path.join(__dirname, "preload.js");
const knownOutputFiles = ["notes.chart", "song.ini", "song.ogg"];
const allowedOutputFolders = new Set<string>();

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
	overwriteKnownFiles?: boolean;
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

			return toPickedPath(result.filePaths[0]);
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

			return toPickedPath(result.filePaths[0]);
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
			allowedOutputFolders.add(path.resolve(picked.path));
			return picked;
		},
	);

	ipcMain.handle(
		"chdg:inspect-source",
		async (
			_event,
			input: unknown,
		): Promise<JsonEnvelope<SourceInspectionResult>> => {
			return toEnvelope(() => inspectSource(assertInspectInput(input)));
		},
	);

	ipcMain.handle(
		"chdg:normalize-selection",
		async (
			_event,
			input: unknown,
		): Promise<JsonEnvelope<NormalizationPreview>> => {
			return toEnvelope(() => normalizeSelection(assertNormalizeInput(input)));
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
				const normalizedOutDir = path.resolve(generateInput.outDir);
				if (!allowedOutputFolders.has(normalizedOutDir)) {
					throw new DesktopIpcError(
						"OUTPUT_FOLDER_NOT_SELECTED",
						"Select the output folder with the desktop folder picker before generating.",
					);
				}
				const existing = await findExistingKnownOutputs(normalizedOutDir);
				if (existing.length > 0 && !generateInput.overwriteKnownFiles) {
					throw new DesktopIpcError(
						"OVERWRITE_CONFIRMATION_REQUIRED",
						`Output folder already contains ${existing.join(", ")}. Confirm overwrite to replace only known CHDG output files.`,
					);
				}
				return generatePackage({ ...generateInput, outDir: normalizedOutDir });
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
				const normalized = path.resolve(folderPath);
				if (!allowedOutputFolders.has(normalized)) {
					throw new DesktopIpcError(
						"OPEN_OUTPUT_FOLDER_DENIED",
						"Output folder was not selected or generated in this desktop session.",
					);
				}
				const errorMessage = await shell.openPath(normalized);
				if (errorMessage) {
					throw new DesktopIpcError("OPEN_OUTPUT_FOLDER_FAILED", errorMessage);
				}
				return { opened: true as const };
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
