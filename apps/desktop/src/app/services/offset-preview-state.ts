export function nudgeOffsetMs(currentMs: number, deltaMs: number): number {
	return currentMs + deltaMs;
}

export function isOffsetDirty(previewOffsetMs: number, savedOffsetMs: number): boolean {
	return previewOffsetMs !== savedOffsetMs;
}

export function resetOffsetToSaved(savedOffsetMs: number): number {
	return savedOffsetMs;
}
