export class DesktopInputValidationError extends Error {
	constructor(
		readonly code: string,
		message: string,
	) {
		super(message);
		this.name = "DesktopInputValidationError";
	}
}

export function assertCreateProjectName(input: unknown): string {
	const value = assertRecord(input, "Create project payload is required.");
	return assertNonEmptyString(value["projectName"], "Project name is required.");
}

export function optionalSelectedTracks(input: unknown): number[] {
	if (input === undefined || input === null) return [];
	if (!Array.isArray(input)) {
		throw new DesktopInputValidationError(
			"INVALID_SELECTED_TRACKS",
			"selectedTracks must be an array of numbers.",
		);
	}

	const tracks = input.map((value) => {
		if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
			throw new DesktopInputValidationError(
				"INVALID_SELECTED_TRACKS",
				"selectedTracks must contain non-negative integer track indexes.",
			);
		}
		return value;
	});

	return [...new Set(tracks)].sort((a, b) => a - b);
}

function assertRecord(
	input: unknown,
	message: string,
): Record<string, unknown> {
	if (typeof input !== "object" || input === null || Array.isArray(input)) {
		throw new DesktopInputValidationError("INVALID_INPUT", message);
	}
	return input as Record<string, unknown>;
}

function assertNonEmptyString(input: unknown, message: string): string {
	if (typeof input !== "string" || input.trim().length === 0) {
		throw new DesktopInputValidationError("INVALID_INPUT", message);
	}
	return input;
}
