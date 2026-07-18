import { EventEmitter } from "node:events";
import process from "node:process";
import { describe, expect, it, vi } from "vitest";
import {
	createAngularCliInvocation,
	resolveAngularCliPath,
	runAngularCli,
} from "./run-angular-cli.lib.mjs";

function createChildProcess() {
	const child = new EventEmitter();
	child.killed = false;
	child.kill = vi.fn((signal) => {
		child.killed = true;
		queueMicrotask(() => child.emit("exit", null, signal));
		return true;
	});
	return child;
}

describe("Angular CLI invocation", () => {
	it("uses the current Node executable and forwards arguments unchanged", () => {
		const angularCliPath = "/repo path/@angular/cli/bin/ng.js";
		const forwardedArgs = ["build", "--configuration", "config with spaces"];

		const invocation = createAngularCliInvocation({
			angularCliPath,
			forwardedArgs,
			environment: { HOME: "/home/example", CUSTOM_VALUE: "preserved" },
		});

		expect(invocation.command).toBe(process.execPath);
		expect(invocation.args).toEqual([angularCliPath, ...forwardedArgs]);
		expect(invocation.options).toEqual({
			env: {
				HOME: "/home/example",
				CUSTOM_VALUE: "preserved",
				CI: "1",
			},
			shell: false,
			stdio: "inherit",
		});
	});

	it("resolves Angular CLI from the desktop package installation", () => {
		const angularCliPath = resolveAngularCliPath();

		expect(angularCliPath).toMatch(/@angular[\\/]cli[\\/]bin[\\/]ng\.js$/);
	});
});

describe("Angular CLI process lifecycle", () => {
	it("propagates a non-zero Angular exit code", async () => {
		const child = createChildProcess();
		const spawn = vi.fn(() => {
			queueMicrotask(() => child.emit("exit", 17, null));
			return child;
		});

		const exitCode = await runAngularCli(
			{ command: process.execPath, args: ["cli.js", "build"], options: {} },
			{ spawn, hostProcess: new EventEmitter(), writeError: vi.fn() },
		);

		expect(exitCode).toBe(17);
		expect(spawn).toHaveBeenCalledWith(
			process.execPath,
			["cli.js", "build"],
			{},
		);
	});

	it("reports child-process startup errors as a clear non-zero failure", async () => {
		const child = createChildProcess();
		const startupError = new Error("spawn failed");
		const writeError = vi.fn();
		const spawn = vi.fn(() => {
			queueMicrotask(() => child.emit("error", startupError));
			return child;
		});

		const exitCode = await runAngularCli(
			{ command: process.execPath, args: ["cli.js", "build"], options: {} },
			{ spawn, hostProcess: new EventEmitter(), writeError },
		);

		expect(exitCode).toBe(1);
		expect(writeError).toHaveBeenCalledWith(
			"Failed to start Angular CLI: spawn failed\n",
		);
	});

	it("reports synchronous spawn failures as a clear non-zero failure", async () => {
		const writeError = vi.fn();
		const spawn = vi.fn(() => {
			throw new Error("invalid executable");
		});

		const exitCode = await runAngularCli(
			{ command: process.execPath, args: ["cli.js", "build"], options: {} },
			{ spawn, hostProcess: new EventEmitter(), writeError },
		);

		expect(exitCode).toBe(1);
		expect(writeError).toHaveBeenCalledWith(
			"Failed to start Angular CLI: invalid executable\n",
		);
	});

	it("forwards wrapper termination to the child and waits for it to exit", async () => {
		const hostProcess = new EventEmitter();
		const child = createChildProcess();
		const spawn = vi.fn(() => child);

		const result = runAngularCli(
			{ command: process.execPath, args: ["cli.js", "serve"], options: {} },
			{ spawn, hostProcess, writeError: vi.fn() },
		);
		hostProcess.emit("SIGTERM");

		expect(child.kill).toHaveBeenCalledWith("SIGTERM");
		expect(await result).toBe(143);
		expect(hostProcess.listenerCount("SIGINT")).toBe(0);
		expect(hostProcess.listenerCount("SIGTERM")).toBe(0);
	});

	it("maps an Angular process interrupted directly by SIGINT to its conventional exit code", async () => {
		const child = createChildProcess();
		const spawn = vi.fn(() => {
			queueMicrotask(() => child.emit("exit", null, "SIGINT"));
			return child;
		});

		const exitCode = await runAngularCli(
			{ command: process.execPath, args: ["cli.js", "serve"], options: {} },
			{ spawn, hostProcess: new EventEmitter(), writeError: vi.fn() },
		);

		expect(exitCode).toBe(130);
	});
});
