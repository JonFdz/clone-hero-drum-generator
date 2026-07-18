import { spawn as spawnProcess } from "node:child_process";
import { createRequire } from "node:module";
import process from "node:process";

const require = createRequire(import.meta.url);
const FORWARDED_SIGNALS = ["SIGINT", "SIGTERM"];
const SIGNAL_EXIT_CODES = new Map([
	["SIGINT", 130],
	["SIGTERM", 143],
]);

export function resolveAngularCliPath() {
	return require.resolve("@angular/cli/bin/ng.js");
}

export function createAngularCliInvocation({
	angularCliPath,
	forwardedArgs,
	environment = process.env,
}) {
	return {
		command: process.execPath,
		args: [angularCliPath, ...forwardedArgs],
		options: {
			env: { ...environment, CI: "1" },
			shell: false,
			stdio: "inherit",
		},
	};
}

export function runAngularCli(
	invocation,
	{
		spawn = spawnProcess,
		hostProcess = process,
		writeError = (message) => process.stderr.write(message),
	} = {},
) {
	return new Promise((resolve) => {
		let child;
		let receivedSignal = null;
		let settled = false;
		const signalHandlers = new Map();

		function cleanUp() {
			for (const [signal, handler] of signalHandlers) {
				hostProcess.off(signal, handler);
			}
		}

		function finish(exitCode) {
			if (settled) return;
			settled = true;
			cleanUp();
			resolve(exitCode);
		}

		function failToStart(error) {
			const message = error instanceof Error ? error.message : String(error);
			writeError(`Failed to start Angular CLI: ${message}\n`);
			finish(1);
		}

		try {
			child = spawn(invocation.command, invocation.args, invocation.options);
		} catch (error) {
			failToStart(error);
			return;
		}

		for (const signal of FORWARDED_SIGNALS) {
			const handler = () => {
				receivedSignal ??= signal;
				if (!child.killed) child.kill(signal);
			};
			signalHandlers.set(signal, handler);
			hostProcess.on(signal, handler);
		}

		child.once("error", failToStart);
		child.once("exit", (code, signal) => {
			if (receivedSignal) {
				finish(SIGNAL_EXIT_CODES.get(receivedSignal) ?? 1);
				return;
			}
			if (Number.isInteger(code)) {
				finish(code);
				return;
			}
			finish(SIGNAL_EXIT_CODES.get(signal) ?? 1);
		});
	});
}
