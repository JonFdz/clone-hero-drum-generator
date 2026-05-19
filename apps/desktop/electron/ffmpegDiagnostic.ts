import { execFile } from "node:child_process";
import { access } from "node:fs/promises";

export type FfmpegDiagnostic = {
	available: boolean;
	version?: string;
	path?: string;
	message: string;
};

export function runFfmpegVersion(ffmpegPath: string): Promise<string> {
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

export async function testFfmpeg(
	configuredPath?: string,
	deps: {
		access?: typeof access;
		runFfmpegVersion?: typeof runFfmpegVersion;
	} = {},
): Promise<FfmpegDiagnostic> {
	const accessFn = deps.access ?? access;
	const runVersion = deps.runFfmpegVersion ?? runFfmpegVersion;
	const binary = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
	const normalizedConfiguredPath = configuredPath?.trim();

	if (normalizedConfiguredPath) {
		try {
			await accessFn(normalizedConfiguredPath);
			const version = await runVersion(normalizedConfiguredPath);
			return {
				available: true,
				version,
				path: normalizedConfiguredPath,
				message: `FFmpeg found: ${version}`,
			};
		} catch {
			return {
				available: false,
				path: normalizedConfiguredPath,
				message: `FFmpeg not found at configured path: ${normalizedConfiguredPath}`,
			};
		}
	}

	try {
		const version = await runVersion(binary);
		return {
			available: true,
			version,
			path: binary,
			message: `FFmpeg found from PATH: ${version}`,
		};
	} catch {
		return {
			available: false,
			message: "FFmpeg not found in PATH.",
		};
	}
}
