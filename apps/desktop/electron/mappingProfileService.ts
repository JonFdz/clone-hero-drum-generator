import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { app } from "electron";
import type { MappingOverrideProfile } from "@chdg/project";
import { validateMappingOverrideProfileStore } from "@chdg/project";

const PROFILE_FILE_NAME = "mapping-profiles.json";

async function getProfilePath(): Promise<string> {
	const dir = app.getPath("userData");
	await mkdir(dir, { recursive: true });
	return path.join(dir, PROFILE_FILE_NAME);
}

export async function readMappingProfiles(): Promise<MappingOverrideProfile[]> {
	const filePath = await getProfilePath();
	try {
		const text = await readFile(filePath, "utf8");
		return validateMappingOverrideProfileStore(JSON.parse(text)).profiles;
	} catch {
		return [];
	}
}

export async function writeMappingProfiles(
	profiles: MappingOverrideProfile[],
): Promise<void> {
	const filePath = await getProfilePath();
	await writeFile(
		filePath,
		JSON.stringify({ schemaVersion: 1, profiles }, null, 2),
		"utf8",
	);
}
