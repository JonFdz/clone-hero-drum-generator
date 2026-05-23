export function formatTrackNoteCount(noteCount: number | null | undefined): string {
	if (typeof noteCount !== "number" || !Number.isFinite(noteCount)) {
		return "n/a";
	}
	return noteCount === 1 ? "1 note" : `${noteCount} notes`;
}
