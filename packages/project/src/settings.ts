import { join } from "node:path";

export type DesktopSettings = {
	schemaVersion: number;
	theme: "dark";
	accentColor?: string;
	projectLocation: string;
	defaultOutputFolder?: string;
	defaultCharter?: string;
	defaultOffsetMs?: number;
	ffmpegPath?: string;
};

export type RecentProject = {
	path: string;
	name: string;
	lastOpenedAt: string;
};

export const DEFAULT_SETTINGS: DesktopSettings = {
	schemaVersion: 1,
	theme: "dark",
	projectLocation: defaultProjectLocation(),
};

function defaultProjectLocation(): string {
	const home = process.env["HOME"] || process.env["USERPROFILE"] || ".";
	return join(home, "Documents", "CHDG Projects");
}

export function validateSettings(data: unknown): DesktopSettings | null {
	if (typeof data !== "object" || data === null || Array.isArray(data)) {
		return null;
	}
	const obj = data as Record<string, unknown>;
	if (typeof obj["schemaVersion"] !== "number") {
		return null;
	}
	if (obj["theme"] !== "dark") {
		return null;
	}
	if (
		typeof obj["projectLocation"] !== "string" ||
		obj["projectLocation"].trim().length === 0
	) {
		return null;
	}
	return { ...DEFAULT_SETTINGS, ...(obj as unknown as DesktopSettings) };
}

export function validateRecents(data: unknown): RecentProject[] {
	if (!Array.isArray(data)) return [];
	return data.filter((item): item is RecentProject => {
		if (typeof item !== "object" || item === null) return false;
		const obj = item as Record<string, unknown>;
		return (
			typeof obj["path"] === "string" &&
			typeof obj["name"] === "string" &&
			typeof obj["lastOpenedAt"] === "string"
		);
	});
}
