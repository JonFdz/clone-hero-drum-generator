import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { app } from "electron";
import type { DesktopSettings, RecentProject } from "@chdg/project";
import { DEFAULT_SETTINGS, validateSettings, validateRecents } from "@chdg/project";

const SETTINGS_FILE_NAME = "settings.json";
const RECENTS_FILE_NAME = "recents.json";
const RECENT_PROJECTS_LIMIT = 20;

function getUserDataPath(): string {
	return app.getPath("userData");
}

async function ensureUserData(): Promise<string> {
	const dir = getUserDataPath();
	await mkdir(dir, { recursive: true });
	return dir;
}

export async function readSettings(): Promise<DesktopSettings> {
	const dir = await ensureUserData();
	const filePath = path.join(dir, SETTINGS_FILE_NAME);
	try {
		const text = await readFile(filePath, "utf8");
		const parsed = JSON.parse(text) as unknown;
		const validated = validateSettings(parsed);
		if (validated) return validated;
	} catch {
		// Fall through to defaults
	}
	return { ...DEFAULT_SETTINGS };
}

export async function writeSettings(settings: DesktopSettings): Promise<void> {
	const dir = await ensureUserData();
	const filePath = path.join(dir, SETTINGS_FILE_NAME);
	await writeFile(filePath, JSON.stringify(settings, null, 2), "utf8");
}

export async function readRecentProjects(): Promise<RecentProject[]> {
	const dir = await ensureUserData();
	const filePath = path.join(dir, RECENTS_FILE_NAME);
	try {
		const text = await readFile(filePath, "utf8");
		const parsed = JSON.parse(text) as unknown;
		return validateRecents(parsed);
	} catch {
		return [];
	}
}

export async function writeRecentProjects(recents: RecentProject[]): Promise<void> {
	const dir = await ensureUserData();
	const filePath = path.join(dir, RECENTS_FILE_NAME);
	await writeFile(filePath, JSON.stringify(recents, null, 2), "utf8");
}

export async function addRecentProject(recent: RecentProject): Promise<void> {
	const recents = await readRecentProjects();
	const filtered = recents.filter((r) => r.path !== recent.path);
	const next = [recent, ...filtered].slice(0, RECENT_PROJECTS_LIMIT);
	await writeRecentProjects(next);
}

export async function removeRecentProject(projectPath: string): Promise<void> {
	const recents = await readRecentProjects();
	const next = recents.filter((r) => r.path !== projectPath);
	await writeRecentProjects(next);
}

export async function pathExists(targetPath: string): Promise<boolean> {
	try {
		await access(targetPath);
		return true;
	} catch {
		return false;
	}
}
