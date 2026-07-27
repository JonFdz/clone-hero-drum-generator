import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	CANONICAL_PROJECT_DELETE_NOT_AVAILABLE,
	CANONICAL_PROJECT_DELETE_NOT_AVAILABLE_MESSAGE,
	deleteProjectFilePath,
} from "./projectFileDeletion.js";

describe("projectFileDeletion", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "chdg-delete-"));
	});

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true });
	});

	it("rejects manifest-only deletion without changing the canonical project folder", async () => {
		const projectFile = join(tempDir, "project.chdg");
		const sourceFile = join(tempDir, "assets", "source.mid");
		const audioFile = join(tempDir, "assets", "song.ogg");
		const recoveryFile = join(tempDir, "recovery", "previous.chdg");
		mkdirSync(join(tempDir, "assets"), { recursive: true });
		mkdirSync(join(tempDir, "recovery"), { recursive: true });
		writeFileSync(projectFile, "{}");
		writeFileSync(sourceFile, "source");
		writeFileSync(audioFile, "audio");
		writeFileSync(recoveryFile, "{}");

		await expect(deleteProjectFilePath(projectFile)).rejects.toMatchObject({
			code: CANONICAL_PROJECT_DELETE_NOT_AVAILABLE,
			message: CANONICAL_PROJECT_DELETE_NOT_AVAILABLE_MESSAGE,
		});

		expect(existsSync(projectFile)).toBe(true);
		expect(existsSync(sourceFile)).toBe(true);
		expect(existsSync(audioFile)).toBe(true);
		expect(existsSync(recoveryFile)).toBe(true);
		expect(existsSync(join(tempDir, "assets"))).toBe(true);
		expect(existsSync(join(tempDir, "recovery"))).toBe(true);
	});
});
