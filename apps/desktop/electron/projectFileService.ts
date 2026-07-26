import { access, readFile, writeFile, mkdir, stat } from "node:fs/promises";
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
	try {
		await access(
			path.resolve(projectDirectory, validation.project.assets.source.relativePath),
		);
	} catch {
		missingPaths.push("sourcePath");
	}
	try {
		await access(
			path.resolve(projectDirectory, validation.project.assets.audio.relativePath),
		);
	} catch {
		missingPaths.push("audioPath");
	}
	if (validation.project.export.targetDirectory) {
		try {
			await access(validation.project.export.targetDirectory);
		} catch {
			missingPaths.push("outputDir");
		}
	}
	if (validation.project.export.status === "current") {
		const targetDirectory = validation.project.export.targetDirectory;
		const managedFiles = validation.project.export.managedFiles;
		for (const required of REQUIRED_MANAGED_PREVIEW_FILES) {
			if (!targetDirectory || !managedFiles?.[required.fileName]) {
				missingPaths.push(required.missingKind);
				continue;
			}
			try {
				const fileStats = await stat(
					path.join(targetDirectory, required.fileName),
				);
				if (!fileStats.isFile()) {
					missingPaths.push(required.missingKind);
				}
			} catch {
				missingPaths.push(required.missingKind);
			}
		}
	}
	if (validation.project.assets.cover) {
		try {
			await access(
				path.resolve(
					projectDirectory,
					validation.project.assets.cover.relativePath,
				),
			);
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
		await writeFile(filePath, serializeProjectFile(updated), "utf8");
		return { ok: true };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Write failed.";
		return { ok: false, code: "PROJECT_WRITE_FAILED", message };
	}
}
