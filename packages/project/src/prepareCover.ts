import { copyFile, mkdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { issue } from "./issues.js";
import type { ProjectIssue } from "./types.js";

export type PrepareCoverResult =
	| { ok: true; outputPath: string; issues: ProjectIssue[] }
	| { ok: false; issues: ProjectIssue[] };

export async function prepareCover(input: {
	coverImagePath?: string;
	outputDir: string;
}): Promise<PrepareCoverResult> {
	if (!input.coverImagePath?.trim()) {
		return { ok: false, issues: [] };
	}

	const extension = extname(input.coverImagePath).toLowerCase();
	const outputPath = join(input.outputDir, "album.jpg");
	if (extension !== ".jpg" && extension !== ".jpeg") {
		return {
			ok: false,
			issues: [
				issue(
					"warning",
					"COVER_OUTPUT_UNSUPPORTED_FORMAT",
					"Cover was not exported because only JPG/JPEG cover copying is currently supported.",
					{ coverImagePath: input.coverImagePath, outputPath },
				),
			],
		};
	}

	try {
		await mkdir(input.outputDir, { recursive: true });
		await copyFile(input.coverImagePath, outputPath);
		return { ok: true, outputPath, issues: [] };
	} catch (error) {
		return {
			ok: false,
			issues: [
				issue(
					"warning",
					"COVER_OUTPUT_FAILED",
					"Cover was not exported as album.jpg, but chart generation completed.",
					{
						coverImagePath: input.coverImagePath,
						outputPath,
						error: error instanceof Error ? error.message : "Unknown error",
					},
				),
			],
		};
	}
}
