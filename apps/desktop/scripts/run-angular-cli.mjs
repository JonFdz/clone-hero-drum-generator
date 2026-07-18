import process from "node:process";
import {
	createAngularCliInvocation,
	resolveAngularCliPath,
	runAngularCli,
} from "./run-angular-cli.lib.mjs";

try {
	const invocation = createAngularCliInvocation({
		angularCliPath: resolveAngularCliPath(),
		forwardedArgs: process.argv.slice(2),
	});
	process.exitCode = await runAngularCli(invocation);
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	process.stderr.write(`Unable to prepare Angular CLI: ${message}\n`);
	process.exitCode = 1;
}
