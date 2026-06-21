// Architecture gate for the @chdg/desktop Angular renderer.
//
// Enforces the accepted Angular architecture on the foundation boundaries
// (the application shell and the new core/ shared/ features/ areas). Legacy
// pages/ and services/ are migrated under this gate in #75/#76.
//
// Fails when it finds, inside the audited scope:
//   - inline `template`/`styles`/`style` component metadata;
//   - a component without ChangeDetectionStrategy.OnPush (unless exempted);
//   - a component importing DesktopBridgeService;
//   - `window.confirm` or `window.prompt` usage;
//   - a feature importing another feature's internals (project-session is the
//     only feature other features may depend on, via its public contract).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import process from "node:process";

const ROOT = join(process.cwd(), "src", "app");
const SHELL = join(ROOT, "app.component.ts");
const AUDITED_DIRS = ["core", "shared", "features"];

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
	const files = [SHELL];
	for (const dir of AUDITED_DIRS) {
		const abs = join(ROOT, dir);
		let exists = true;
		try {
			exists = statSync(abs).isDirectory();
		} catch {
			exists = false;
		}
		if (exists) files.push(...walk(abs));
	}
	return files.filter((f) => f.endsWith(".ts"));
}

function isComponentFile(file) {
	return /\.component\.ts$/.test(file);
}

function featureName(file) {
	const rel = relative(ROOT, file);
	const parts = rel.split(sep);
	if (parts[0] !== "features") return null;
	return parts[1] ?? null;
}

const violations = [];

for (const file of collectAuditedFiles()) {
	const rel = relative(process.cwd(), file);
	const source = readFileSync(file, "utf8");

	if (/\bwindow\.(confirm|prompt)\s*\(/.test(source)) {
		violations.push(
			`${rel}: forbidden window.${RegExp.$1 || "confirm/prompt"}() usage`,
		);
	}

	if (isComponentFile(file)) {
		if (/\btemplate\s*:\s*["'`]/.test(source)) {
			violations.push(`${rel}: inline \`template\` metadata is forbidden`);
		}
		if (/\bstyles\s*:\s*\[/.test(source)) {
			violations.push(`${rel}: inline \`styles\` metadata is forbidden`);
		}
		if (/\bstyle\s*:\s*["'`]/.test(source)) {
			violations.push(`${rel}: inline \`style\` metadata is forbidden`);
		}
		if (!ON_PUSH_EXCEPTIONS.has(rel) && !source.includes("ChangeDetectionStrategy.OnPush")) {
			violations.push(`${rel}: component missing ChangeDetectionStrategy.OnPush`);
		}
		const bridgeImportMatch =
			/import\s+[^;]*\bDesktopBridgeService\b[^;]*\s+from\s+["'][^"']*desktop-bridge\.service["']/.test(
				source,
			);
		if (bridgeImportMatch) {
			violations.push(
				`${rel}: component must not import DesktopBridgeService`,
			);
		}
	}

	const currentFeature = featureName(file);
	if (currentFeature) {
		const importPattern = /from\s+["']([^"']+)["']/g;
		let match;
		while ((match = importPattern.exec(source)) !== null) {
			const importPath = match[1];
			const featureIndex = importPath.indexOf("/features/");
			if (featureIndex === -1) continue;
			const targetFeature = importPath
				.slice(featureIndex + "/features/".length)
				.split("/")[0];
			if (
				targetFeature &&
				targetFeature !== currentFeature &&
				targetFeature !== "project-session"
			) {
				violations.push(
					`${rel}: feature "${currentFeature}" imports another feature "${targetFeature}" internals (${importPath})`,
				);
			}
		}
	}
}

if (violations.length > 0) {
	console.error("check:architecture failed:\n");
	for (const v of violations) console.error(`  - ${v}`);
	console.error(
		`\n${violations.length} violation(s). See docs/architecture/angular-frontend-architecture.md.`,
	);
	process.exit(1);
}

console.error("check:architecture passed: no architectural violations in audited scope.");
