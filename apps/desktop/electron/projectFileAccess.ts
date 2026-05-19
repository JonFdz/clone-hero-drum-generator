import type { RecentProject } from "@chdg/project";
import { addAllowedPath, DesktopPathSelectionError } from "./pathAllowlist.js";

export function addAllowedProjectFile(
	allowedProjectFiles: Set<string>,
	candidatePath: string,
): string {
	return addAllowedPath(allowedProjectFiles, candidatePath);
}

export function assertAllowedProjectFile(
	allowedProjectFiles: Set<string>,
	candidatePath: string,
	code: string,
	message: string,
): string {
	const normalized = addAllowedProjectFile(new Set<string>(), candidatePath);
	if (!allowedProjectFiles.has(normalized)) {
		throw new DesktopPathSelectionError(code, message);
	}
	return normalized;
}

export async function resolveAllowedOpenProjectFile(
	allowedProjectFiles: Set<string>,
	candidatePath: string,
	readRecentProjects: () => Promise<RecentProject[]>,
	code = "PROJECT_FILE_NOT_ALLOWED",
	message = "Project file was not selected in this desktop session or found in Electron-owned recents.",
): Promise<string> {
	const normalized = addAllowedProjectFile(new Set<string>(), candidatePath);
	if (allowedProjectFiles.has(normalized)) {
		return normalized;
	}

	const recents = await readRecentProjects();
	const recent = recents.find((item) => addAllowedProjectFile(new Set<string>(), item.path) === normalized);
	if (recent) {
		allowedProjectFiles.add(normalized);
		return normalized;
	}

	throw new DesktopPathSelectionError(code, message);
}
