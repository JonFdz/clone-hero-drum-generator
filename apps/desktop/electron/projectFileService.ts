import { access, readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import type { ChdgProjectAnalysisCache, ChdgProjectFile } from "@chdg/project";
import { validateProjectFile, createProjectFile } from "@chdg/project";
import type { ProjectMappingOverrides } from "@chdg/project";
import { app } from "electron";

export async function readProjectFile(filePath: string): Promise<
	| {
			ok: true;
			project: ChdgProjectFile;
			missingPaths: string[];
	  }
	| {
			ok: false;
			code: string;
			message: string;
	  }
> {
	let text: string;
	try {
		text = await readFile(filePath, "utf8");
	} catch {
		return {
			ok: false,
			code: "PROJECT_FILE_NOT_FOUND",
			message: `Could not read project file: ${filePath}`,
		};
	}

	let json: unknown;
	try {
		json = JSON.parse(text);
	} catch {
		return {
			ok: false,
			code: "INVALID_PROJECT_JSON",
			message: "Project file is not valid JSON.",
		};
	}

	const validation = validateProjectFile(json);
	if (!validation.ok) {
		return { ok: false, code: validation.code, message: validation.message };
	}

	const missingPaths: string[] = [];
	if (validation.project.paths.sourcePath) {
		try {
			await access(validation.project.paths.sourcePath);
		} catch {
			missingPaths.push("sourcePath");
		}
	}
	if (validation.project.paths.audioPath) {
		try {
			await access(validation.project.paths.audioPath);
		} catch {
			missingPaths.push("audioPath");
		}
	}
	if (validation.project.paths.outputDir) {
		try {
			await access(validation.project.paths.outputDir);
		} catch {
			missingPaths.push("outputDir");
		}
	}
	if (validation.project.cover?.imagePath) {
		try {
			await access(validation.project.cover.imagePath);
		} catch {
			missingPaths.push("coverImagePath");
		}
	}

	return { ok: true, project: validation.project, missingPaths };
}

export async function writeProjectFile(
	filePath: string,
	project: ChdgProjectFile,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
	try {
		await mkdir(path.dirname(filePath), { recursive: true });
		const updated: ChdgProjectFile = {
			...project,
			project: {
				...project.project,
				updatedAt: new Date().toISOString(),
			},
		};
		await writeFile(filePath, JSON.stringify(updated, null, 2), "utf8");
		return { ok: true };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Write failed.";
		return { ok: false, code: "PROJECT_WRITE_FAILED", message };
	}
}

export function buildProjectFileFromState(
	name: string,
	appVersion: string | undefined,
	state: {
		sourcePath?: string;
		audioPath?: string;
		outputDir?: string;
		cover?: { imagePath?: string };
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
		generationStatus:
			| "not-generated"
			| "generated"
			| "needs-regenerate"
			| "failed";
		lastGeneratedAt?: string;
		outputFiles?: { chart?: string; songIni?: string; songOgg?: string; albumJpg?: string };
		mappingOverrides?: ProjectMappingOverrides;
		analysis?: ChdgProjectAnalysisCache;
	},
): ChdgProjectFile {
	const now = new Date().toISOString();
	return {
		schemaVersion: 1,
		appVersion,
		project: {
			name,
			createdAt: now,
			updatedAt: now,
		},
		paths: {
			sourcePath: state.sourcePath,
			audioPath: state.audioPath,
			outputDir: state.outputDir,
		},
		cover: state.cover?.imagePath
			? { imagePath: state.cover.imagePath }
			: undefined,
		source: {
			sourceKind: state.sourceKind,
		},
		selection: {
			selectedTracks: state.selectedTracks,
		},
		metadata: { ...state.metadata },
		generation: {
			offsetMs: state.offsetMs,
			status: state.generationStatus,
			lastGeneratedAt: state.lastGeneratedAt,
			outputFiles: state.outputFiles,
		},
		mappingOverrides: state.mappingOverrides,
		analysis: state.analysis,
	};
}

export type UniqueProjectTarget = {
	name: string;
	projectFolder: string;
	filePath: string;
};

export async function resolveUniqueProjectTarget(
	baseLocation: string,
	requestedName: string,
): Promise<UniqueProjectTarget> {
	const safeName = sanitizeProjectName(requestedName);
	for (let index = 0; index < 100; index += 1) {
		const name = index === 0 ? safeName : `${safeName} ${index + 1}`;
		const projectFolder = path.join(baseLocation, name);
		const filePath = path.join(projectFolder, `${name}.chdg`);
		try {
			await access(filePath);
		} catch {
			return { name, projectFolder, filePath };
		}
	}
	throw new Error("Could not create a unique project file name.");
}

function sanitizeProjectName(name: string): string {
	const trimmed = name.trim();
	return trimmed.length > 0 ? trimmed : "Untitled";
}

export function getDefaultProjectFolder(projectName: string): string {
	const base = app.getPath("documents");
	return path.join(base, "CHDG Projects", projectName);
}

export function getDefaultProjectFilePath(projectName: string): string {
	return path.join(getDefaultProjectFolder(projectName), `${projectName}.chdg`);
}

export function getDefaultOutputDir(projectFilePath: string): string {
	return path.join(path.dirname(projectFilePath), "output");
}


export type ManagedProjectRenameResult = {
	filePath: string;
	outputDir?: string;
	renamed: boolean;
};

export async function renameManagedProjectTarget(input: {
	currentFilePath: string;
	oldProjectName: string;
	newProjectName: string;
	projectLocation: string;
	outputDir?: string;
}): Promise<ManagedProjectRenameResult> {
	const currentFilePath = path.resolve(input.currentFilePath);
	const currentFolder = path.dirname(currentFilePath);
	const projectLocation = path.resolve(input.projectLocation);
	const oldName = sanitizeProjectName(input.oldProjectName);
	const newName = sanitizeProjectName(input.newProjectName);

	if (oldName === newName) {
		return { filePath: currentFilePath, outputDir: input.outputDir, renamed: false };
	}

	if (!isAutoCreatedProjectPath(currentFilePath, oldName, projectLocation)) {
		return { filePath: currentFilePath, outputDir: input.outputDir, renamed: false };
	}

	const targetFolder = path.join(projectLocation, newName);
	const targetFilePath = path.join(targetFolder, `${newName}.chdg`);
	try {
		await access(targetFolder);
		throw new Error("PROJECT_RENAME_TARGET_EXISTS");
	} catch (error) {
		if (error instanceof Error && error.message === "PROJECT_RENAME_TARGET_EXISTS") {
			throw error;
		}
	}

	const oldDefaultOutputDir = getDefaultOutputDir(currentFilePath);
	const nextOutputDir =
		input.outputDir && path.resolve(input.outputDir) === path.resolve(oldDefaultOutputDir)
			? getDefaultOutputDir(targetFilePath)
			: input.outputDir;

	await rename(currentFolder, targetFolder);
	await rename(path.join(targetFolder, `${oldName}.chdg`), targetFilePath);
	return { filePath: targetFilePath, outputDir: nextOutputDir, renamed: true };
}

export function isAutoCreatedProjectPath(
	filePath: string,
	projectName: string,
	projectLocation: string,
): boolean {
	const safeName = sanitizeProjectName(projectName);
	const resolvedFile = path.resolve(filePath);
	const resolvedLocation = path.resolve(projectLocation);
	const expectedFolder = path.join(resolvedLocation, safeName);
	const expectedFile = path.join(expectedFolder, `${safeName}.chdg`);
	return resolvedFile === expectedFile;
}
