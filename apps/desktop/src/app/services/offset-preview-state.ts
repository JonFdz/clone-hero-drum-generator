export function nudgeOffsetMs(currentMs: number, deltaMs: number): number {
	return currentMs + deltaMs;
}

export function isOffsetDirty(
	previewOffsetMs: number,
	savedOffsetMs: number,
): boolean {
	return previewOffsetMs !== savedOffsetMs;
}

export function resetOffsetToSaved(savedOffsetMs: number): number {
	return savedOffsetMs;
}

export function isOffsetInputValid(value: string): boolean {
	return value.trim().length > 0 && Number.isFinite(Number(value));
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

export function resolveOffsetApplyFlow(input: {
	hasOutputDir: boolean;
	hasChart: boolean;
	chartUpdateOk?: boolean;
}): {
	canPersistOffset: boolean;
	chartUpdated: boolean;
	chartMissing: boolean;
	outputMissing: boolean;
	failed: boolean;
} {
	if (!input.hasOutputDir) {
		return {
			canPersistOffset: true,
			chartUpdated: false,
			chartMissing: false,
			outputMissing: true,
			failed: false,
		};
	}

	if (!input.hasChart) {
		return {
			canPersistOffset: true,
			chartUpdated: false,
			chartMissing: true,
			outputMissing: false,
			failed: false,
		};
	}

	if (input.chartUpdateOk === false) {
		return {
			canPersistOffset: false,
			chartUpdated: false,
			chartMissing: false,
			outputMissing: false,
			failed: true,
		};
	}

	return {
		canPersistOffset: true,
		chartUpdated: true,
		chartMissing: false,
		outputMissing: false,
		failed: false,
	};
}

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
