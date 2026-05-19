import path from "node:path";

export function addAllowedPath(
	allowedPaths: Set<string>,
	candidatePath: string,
): string {
	const normalized = path.resolve(candidatePath);
	allowedPaths.add(normalized);
	return normalized;
}

export function assertAllowedPath(
	allowedPaths: Set<string>,
	candidatePath: string,
	code: string,
	message: string,
): string {
	const normalized = path.resolve(candidatePath);
	if (!allowedPaths.has(normalized)) {
		throw new DesktopPathSelectionError(code, message);
	}
	return normalized;
}

export class DesktopPathSelectionError extends Error {
	constructor(
		readonly code: string,
		message: string,
	) {
		super(message);
		this.name = "DesktopPathSelectionError";
	}
}
