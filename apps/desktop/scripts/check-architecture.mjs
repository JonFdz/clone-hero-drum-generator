// Architecture gate CLI for the @chdg/desktop Angular renderer.
//
// Delegates all checking to the pure helpers in `check-architecture.lib.mjs`.
// Audits the application shell and the new core/ shared/ features/ boundaries.
// Legacy pages/ and services/ are enrolled as they migrate (#75/#76).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import {
	AUDITED_DIR_NAMES,
	findAllViolations,
	isAuditedFile,
} from "./check-architecture.lib.mjs";

const ROOT = join(process.cwd(), "src", "app");

// Components with a proven, documented OnPush exception. Listed in
// docs/architecture/angular-refactor-follow-ups.md. Empty for the foundation.
const ON_PUSH_EXCEPTIONS = new Set([]);

function walk(dir) {
	const out = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			out.push(...walk(full));
		} else if (entry.endsWith(".ts")) {
			out.push(full);
		}
	}
	return out;
}

function collectAuditedFiles() {
	const files = [join(ROOT, "app.component.ts")];
	for (const dir of AUDITED_DIR_NAMES) {
		const abs = join(ROOT, dir);
		let exists = true;
		try {
			exists = statSync(abs).isDirectory();
		} catch {
			exists = false;
		}
		if (exists) files.push(...walk(abs));
	}
	return files.filter((f) => f.endsWith(".ts") && isAuditedFile(f, ROOT));
}

function formatViolation(v) {
	if (v.rule === "cross-feature-import") {
		return `${v.file}: feature "${v.from}" imports another feature "${v.to}" internals (${v.spec})`;
	}
	if (v.rule === "component-bridge-import") {
		return `${v.file}: component must not import DesktopBridgeService`;
	}
	if (v.rule === "missing-onpush") {
		return `${v.file}: component missing ChangeDetectionStrategy.OnPush`;
	}
	if (v.rule === "inline-template") {
		return `${v.file}: inline \`template\` metadata is forbidden`;
	}
	if (v.rule === "inline-styles") {
		return `${v.file}: inline \`styles\` metadata is forbidden`;
	}
	if (v.rule === "inline-style") {
		return `${v.file}: inline \`style\` metadata is forbidden`;
	}
	if (v.rule?.startsWith("window.")) {
		return `${v.file}: forbidden ${v.rule}() usage`;
	}
	return `${v.file}: ${v.rule}`;
}

const files = collectAuditedFiles();
const entries = files.map((file) => ({ file, source: readFileSync(file, "utf8") }));
const violations = findAllViolations(entries, ROOT, {
	onPushExceptions: ON_PUSH_EXCEPTIONS,
});

if (violations.length > 0) {
	console.error("check:architecture failed:\n");
	for (const v of violations) console.error(`  - ${formatViolation(v)}`);
	console.error(
		`\n${violations.length} violation(s). See docs/architecture/angular-frontend-architecture.md.`,
	);
	process.exit(1);
}

console.error(
	"check:architecture passed: no architectural violations in audited scope.",
);
