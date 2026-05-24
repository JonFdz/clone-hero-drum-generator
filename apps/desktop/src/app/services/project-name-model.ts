export function createDefaultProjectName(date = new Date()): string {
	const stamp = date.toISOString().replace(/[:.]/g, "-").slice(0, 19);
	return `Untitled ${stamp}`;
}
