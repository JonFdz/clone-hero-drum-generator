import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	ProjectFileDeletionError,
	resolveDeletableProjectFilePath,
} from "./projectFileDeletion.js";

function emptyRecents() {
	return Promise.resolve([]);
}

describe("projectFileDeletion", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "chdg-delete-"));
	});

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true });
	});

	it("allows selected .chdg files", async () => {
		const filePath = join(tempDir, "demo.chdg");
		writeFileSync(filePath, "{}", "utf8");
		await expect(
			resolveDeletableProjectFilePath(
				filePath,
				new Set([filePath]),
				emptyRecents,
			),
		).resolves.toBe(filePath);
	});

	it("allows .chdg files from Electron recents", async () => {
		const filePath = join(tempDir, "recent.chdg");
		writeFileSync(filePath, "{}", "utf8");
		await expect(
			resolveDeletableProjectFilePath(filePath, new Set(), () =>
				Promise.resolve([
					{ path: filePath, name: "Recent", lastOpenedAt: "now" },
				]),
			),
		).resolves.toBe(filePath);
	});

	it("rejects non-.chdg files", async () => {
		const filePath = join(tempDir, "demo.mid");
		writeFileSync(filePath, "midi", "utf8");
		await expect(
			resolveDeletableProjectFilePath(
				filePath,
				new Set([filePath]),
				emptyRecents,
			),
		).rejects.toMatchObject({ code: "PROJECT_DELETE_NOT_CHDG" });
	});

	it("rejects directories", async () => {
		const dirPath = join(tempDir, "folder.chdg");
		mkdirSync(dirPath);
		await expect(
			resolveDeletableProjectFilePath(
				dirPath,
				new Set([dirPath]),
				emptyRecents,
			),
		).rejects.toBeInstanceOf(ProjectFileDeletionError);
		await expect(
			resolveDeletableProjectFilePath(
				dirPath,
				new Set([dirPath]),
				emptyRecents,
			),
		).rejects.toMatchObject({ code: "PROJECT_DELETE_NOT_FILE" });
	});

	it("rejects untrusted .chdg files", async () => {
		const filePath = join(tempDir, "untrusted.chdg");
		writeFileSync(filePath, "{}", "utf8");
		await expect(
			resolveDeletableProjectFilePath(filePath, new Set(), emptyRecents),
		).rejects.toMatchObject({ code: "PROJECT_DELETE_NOT_ALLOWED" });
	});
});
