import { execFile } from "node:child_process";
import { access } from "node:fs/promises";

export type FfmpegDiagnostic = {
	available: boolean;
	version?: string;
	path?: string;
	message: string;
};

function runFfmpegVersion(ffmpegPath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		execFile(ffmpegPath, ["-version"], { timeout: 10000 }, (error, stdout) => {
			if (error) {
				reject(error);
				return;
			}
			const firstLine = stdout.split("\n")[0] ?? "";
			resolve(firstLine.trim());
		});
	});
}

export async function testFfmpeg(configuredPath?: string): Promise<FfmpegDiagnostic> {
	const candidates: string[] = [];
	if (configuredPath) {
		candidates.push(configuredPath);
	}
	if (process.platform === "win32") {
		candidates.push("ffmpeg.exe");
	} else {
		candidates.push("ffmpeg");
	}

	for (const candidate of candidates) {
		try {
			await access(candidate);
			const version = await runFfmpegVersion(candidate);
			return {
				available: true,
				version,
				path: candidate,
				message: `FFmpeg found: ${version}`,
			};
		} catch {
			// Try next candidate
		}
	}

	return {
		available: false,
		message: configuredPath
			? `FFmpeg not found at configured path: ${configuredPath}`
			: "FFmpeg not found in PATH.",
	};
}
