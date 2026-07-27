import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import type { ChdgProjectFile } from "@chdg/project";
import {
	MANAGED_EXPORT_FILE,
	parseProjectFile,
	serializeProjectFile,
} from "@chdg/project";

export type ProjectMissingPathKind =
	| "sourcePath"
	| "audioPath"
	| "outputDir"
	| "outputChartPath"
	| "outputAudioPath"
	| "coverImagePath";

const REQUIRED_MANAGED_PREVIEW_FILES = [
	{
		fileName: MANAGED_EXPORT_FILE.CHART,
		missingKind: "outputChartPath",
	},
	{
		fileName: MANAGED_EXPORT_FILE.AUDIO,
		missingKind: "outputAudioPath",
	},
] as const;

export class ProjectFilePathError extends Error {
	constructor(
		readonly code: "INVALID_PROJECT_FILE_NAME",
		message: string,
	) {
		super(message);
		this.name = "ProjectFilePathError";
	}
}

export function assertCanonicalProjectFilePath(filePath: string): void {
	if (path.basename(filePath) !== "project.chdg") {
		throw new ProjectFilePathError(
			"INVALID_PROJECT_FILE_NAME",
			"A canonical project must be opened through its project.chdg file.",
		);
	}
}

export async function readProjectFile(filePath: string): Promise<
	| {
			ok: true;
			project: ChdgProjectFile;
			missingPaths: ProjectMissingPathKind[];
	  }
	| {
			ok: false;
			code: string;
			message: string;
	  }
> {
	try {
		assertCanonicalProjectFilePath(filePath);
	} catch (error) {
		if (error instanceof ProjectFilePathError) {
			return { ok: false, code: error.code, message: error.message };
		}
		throw error;
	}

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

	const validation = parseProjectFile(text);
	if (!validation.ok) {
		return { ok: false, code: validation.code, message: validation.message };
	}

	const projectDirectory = path.dirname(filePath);
	const missingPaths: ProjectMissingPathKind[] = [];
	if (
		!(await isRegularFile(
			path.resolve(projectDirectory, validation.project.assets.source.relativePath),
		))
	) {
		missingPaths.push("sourcePath");
	}
	if (
		!(await isRegularFile(
			path.resolve(projectDirectory, validation.project.assets.audio.relativePath),
		))
	) {
		missingPaths.push("audioPath");
	}
	if (
		validation.project.export.targetDirectory &&
		!(await isDirectory(validation.project.export.targetDirectory))
	) {
		missingPaths.push("outputDir");
	}
	if (validation.project.export.status === "current") {
		const targetDirectory = validation.project.export.targetDirectory;
		const managedFiles = validation.project.export.managedFiles;
		for (const required of REQUIRED_MANAGED_PREVIEW_FILES) {
			if (!targetDirectory || !managedFiles?.[required.fileName]) {
				missingPaths.push(required.missingKind);
				continue;
			}
			if (
				!(await isRegularFile(path.join(targetDirectory, required.fileName)))
			) {
				missingPaths.push(required.missingKind);
			}
		}
	}
	if (validation.project.assets.cover) {
		if (
			!(await isRegularFile(
				path.resolve(
					projectDirectory,
					validation.project.assets.cover.relativePath,
				),
			))
		) {
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
		assertCanonicalProjectFilePath(filePath);
		await mkdir(path.dirname(filePath), { recursive: true });
		const updated: ChdgProjectFile = {
			...project,
			project: {
				...project.project,
				updatedAt: new Date().toISOString(),
			},
		};
		await writeFile(filePath, serializeProjectFile(updated), "utf8");
		return { ok: true };
	} catch (error) {
		if (error instanceof ProjectFilePathError) {
			return { ok: false, code: error.code, message: error.message };
		}
		const message = error instanceof Error ? error.message : "Write failed.";
		return { ok: false, code: "PROJECT_WRITE_FAILED", message };
	}
}

async function isRegularFile(filePath: string): Promise<boolean> {
	try {
		return (await stat(filePath)).isFile();
	} catch {
		return false;
	}
}

async function isDirectory(directoryPath: string): Promise<boolean> {
	try {
		return (await stat(directoryPath)).isDirectory();
	} catch {
		return false;
	}
}
