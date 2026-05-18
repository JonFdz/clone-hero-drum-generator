import type { ProjectIssue } from "./types.js";

export class ProjectServiceError extends Error {
	readonly code: string;
	readonly issues: ProjectIssue[];

	constructor(code: string, message: string, issues: ProjectIssue[] = []) {
		super(message);
		this.name = "ProjectServiceError";
		this.code = code;
		this.issues = issues;
	}
}

export function issue(
	severity: ProjectIssue["severity"],
	code: string,
	message: string,
	details?: Record<string, unknown>,
): ProjectIssue {
	return details === undefined
		? { severity, code, message }
		: { severity, code, message, details };
}

export function toProjectServiceError(
	error: unknown,
	defaultCode: string,
): ProjectServiceError {
	if (error instanceof ProjectServiceError) {
		return error;
	}
	if (error instanceof Error) {
		return new ProjectServiceError(defaultCode, error.message);
	}
	return new ProjectServiceError(defaultCode, "Unknown error");
}
