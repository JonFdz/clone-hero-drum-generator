import type { JsonEnvelope, ProjectIssue } from "@chdg/project";

export function printJsonSuccess<T>(
	data: T,
	issues: ProjectIssue[] = [],
): void {
	const payload: JsonEnvelope<T> = { ok: true, data, issues };
	console.log(JSON.stringify(payload));
}

export function printJsonError(
	code: string,
	message: string,
	issues: ProjectIssue[] = [],
): void {
	const payload: JsonEnvelope<never> = {
		ok: false,
		error: { code, message },
		issues,
	};
	console.log(JSON.stringify(payload));
}

export function consumeJsonFlag(rawArgs: string[]): {
	args: string[];
	json: boolean;
} {
	let json = false;
	const args: string[] = [];

	for (const arg of rawArgs) {
		if (arg === "--json") {
			json = true;
			continue;
		}
		args.push(arg);
	}

	return { args, json };
}
