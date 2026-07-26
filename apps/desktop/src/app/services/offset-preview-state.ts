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

export function runtimeOffsetStatusMessage(): string {
	return "Preview offset applied for this runtime session only. notes.chart was not modified.";
}
