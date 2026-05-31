import { rm, stat, unlink } from "node:fs/promises";
import path from "node:path";
import type { RecentProject } from "@chdg/project";

export class ProjectFileDeletionError extends Error {
	constructor(
		readonly code: string,
		message: string,
	) {
		super(message);
		this.name = "ProjectFileDeletionError";
	}
}

export type DeletableProjectFile = {
	filePath: string;
	exists: boolean;
};

export async function resolveDeletableProjectFilePath(
	filePath: string,
	allowedProjectFiles: ReadonlySet<string>,
	readRecentProjects: () => Promise<RecentProject[]>,
): Promise<DeletableProjectFile> {
	const targetPath = path.resolve(filePath);
	if (path.extname(targetPath).toLowerCase() !== ".chdg") {
		throw new ProjectFileDeletionError(
			"PROJECT_DELETE_NOT_CHDG",
			"Only .chdg project files can be deleted.",
		);
	}

	const allowed = new Set(
		[...allowedProjectFiles].map((candidate) => path.resolve(candidate)),
	);
	const recents = await readRecentProjects();
	for (const recent of recents) {
		allowed.add(path.resolve(recent.path));
	}
	if (!allowed.has(targetPath)) {
		throw new ProjectFileDeletionError(
			"PROJECT_DELETE_NOT_ALLOWED",
			"Project file was not selected in this desktop session or found in Electron-owned recents.",
		);
	}

	let fileStat;
	try {
		fileStat = await stat(targetPath);
	} catch (error) {
		if (isMissingFileError(error)) {
			return { filePath: targetPath, exists: false };
		}
		throw error;
	}
	if (!fileStat.isFile()) {
		throw new ProjectFileDeletionError(
			"PROJECT_DELETE_NOT_FILE",
			"Only .chdg files can be deleted; unsafe directories are never removed.",
		);
	}

	return { filePath: targetPath, exists: true };
}

export async function deleteProjectFilePath(filePath: string): Promise<void> {
	await unlink(filePath);
}

export async function deleteManagedProjectFolderIfEmpty(input: {
	projectFilePath: string;
	projectLocation: string;
	projectName: string;
}): Promise<boolean> {
	const projectLocation = path.resolve(input.projectLocation);
	const projectFolder = path.dirname(path.resolve(input.projectFilePath));
	const expectedFolder = path.join(projectLocation, input.projectName);
	if (projectFolder !== expectedFolder) return false;
	await rm(projectFolder, { recursive: false, force: true });
	return true;
}

function isMissingFileError(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code?: unknown }).code === "ENOENT"
	);
}
