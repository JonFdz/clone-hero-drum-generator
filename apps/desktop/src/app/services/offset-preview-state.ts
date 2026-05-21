export function nudgeOffsetMs(currentMs: number, deltaMs: number): number {
	return currentMs + deltaMs;
}

export function isOffsetDirty(previewOffsetMs: number, savedOffsetMs: number): boolean {
	return previewOffsetMs !== savedOffsetMs;
}

export function resetOffsetToSaved(savedOffsetMs: number): number {
	return savedOffsetMs;
}

export function isOffsetInputValid(value: string): boolean {
	return Number.isFinite(Number(value));
}

export function canApplyOffset(input: {
	inputValid: boolean;
	previewOffsetMs: number;
	savedOffsetMs: number;
}): boolean {
	return (
		input.inputValid &&
		Number.isFinite(input.previewOffsetMs) &&
		isOffsetDirty(input.previewOffsetMs, input.savedOffsetMs)
	);
}

export type OffsetApplyOutcome =
	| "project-and-chart"
	| "project-only-chart-missing"
	| "project-only-output-missing"
	| "project-only";

export function offsetApplyStatusMessage(outcome: OffsetApplyOutcome): string {
	switch (outcome) {
		case "project-and-chart":
			return "Chart offset saved to project and notes.chart.";
		case "project-only-chart-missing":
			return "Chart offset saved to project. Regenerate to write notes.chart.";
		case "project-only-output-missing":
			return "Chart offset saved to project. Select an output folder and generate to write notes.chart.";
		case "project-only":
			return "Chart offset saved to project.";
	}
}
