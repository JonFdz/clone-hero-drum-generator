import { access, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { ChdgProjectFile } from "@chdg/project";
import { validateProjectFile, createProjectFile } from "@chdg/project";
import type { ProjectMappingOverrides } from "@chdg/project";
import { app } from "electron";

export async function readProjectFile(filePath: string): Promise<{
	ok: true;
	project: ChdgProjectFile;
	missingPaths: string[];
} | {
	ok: false;
	code: string;
	message: string;
}> {
	let text: string;
	try {
		text = await readFile(filePath, "utf8");
	} catch {
		return { ok: false, code: "PROJECT_FILE_NOT_FOUND", message: `Could not read project file: ${filePath}` };
	}

	let json: unknown;
	try {
		json = JSON.parse(text);
	} catch {
		return { ok: false, code: "INVALID_PROJECT_JSON", message: "Project file is not valid JSON." };
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
		generationStatus: "not-generated" | "generated" | "needs-regenerate" | "failed";
		lastGeneratedAt?: string;
		outputFiles?: { chart?: string; songIni?: string; songOgg?: string };
		mappingOverrides?: ProjectMappingOverrides;
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
	};
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
