// Pure, testable architecture-check helpers for the @chdg/desktop renderer.
//
// All functions are side-effect free and operate on in-memory entries
// ({ file, source }) so they can be unit-tested with fixtures without reading
// the real source tree. The CLI in `check-architecture.mjs` reads files and
// calls these helpers.
import { relative, resolve, dirname, sep } from "node:path";

/** Top-level app folders audited by the gate. */
export const AUDITED_DIR_NAMES = ["core", "shared", "features"];

/** The only feature whose public contract other features may consume. */
export const PROJECT_SESSION_FEATURE = "project-session";

/**
 * App-relative key of the project-session public API barrel.
 * Other features may import ONLY from this key when reaching into
 * project-session.
 */
export const PROJECT_SESSION_PUBLIC_KEY = "features/project-session/public-api";

// ---------------------------------------------------------------------------
// Path / feature helpers
// ---------------------------------------------------------------------------

/**
 * Returns the app-relative path (using "/") for an absolute file, or null if
 * the file is outside the app tree.
 */
export function relativeToApp(absFile, appRoot) {
	const rel = relative(appRoot, absFile);
	if (rel.startsWith("..")) return null;
	return rel.split(sep).join("/");
}

/** Whether a file is inside the audited scope (shell + core/ shared/ features/). */
export function isAuditedFile(absFile, appRoot) {
	const rel = relativeToApp(absFile, appRoot);
	if (rel == null) return false;
	if (rel === "app.component.ts") return true;
	const first = rel.split("/")[0];
	return AUDITED_DIR_NAMES.includes(first);
}

/** Returns the feature name for a file inside features/<name>/..., else null. */
export function featureNameOf(absFile, appRoot) {
	const rel = relativeToApp(absFile, appRoot);
	if (rel == null) return null;
	const parts = rel.split("/");
	if (parts[0] !== "features") return null;
	return parts[1] ?? null;
}

/**
 * Resolves an import specifier to an app-relative key (using "/").
 *
 * Handles both relative specifiers (resolved against the importing file's
 * directory) and non-relative specifiers that contain a `/features/` segment.
 * Returns null when the import does not resolve into the app tree.
 */
export function resolveImportKey(importSpec, fromFile, appRoot) {
	if (!importSpec.startsWith(".")) {
		const idx = importSpec.indexOf("/features/");
		if (idx === -1) return null;
		return "features/" + importSpec.slice(idx + "/features/".length);
	}
	const resolved = resolve(dirname(fromFile), importSpec);
	return relativeToApp(resolved, appRoot);
}

/** Returns the feature name targeted by an app-relative key, or null. */
export function targetFeatureOfKey(key) {
	if (!key || !key.startsWith("features/")) return null;
	return key.split("/")[1] ?? null;
}

// ---------------------------------------------------------------------------
// Import extraction
// ---------------------------------------------------------------------------

const IMPORT_RE = /import\s[^;]*?from\s["']([^"']+)["']/g;

/** Extracts all static import specifiers from a source string. */
export function extractImports(source) {
	const out = [];
	IMPORT_RE.lastIndex = 0;
	let m;
	while ((m = IMPORT_RE.exec(source)) !== null) {
		out.push(m[1]);
	}
	return out;
}

// ---------------------------------------------------------------------------
// Violation finders
// ---------------------------------------------------------------------------

/** entries: Array<{ file: string, source: string }> */
export function findCrossFeatureViolations(entries, appRoot) {
	const violations = [];
	for (const entry of entries) {
		const sourceFeature = featureNameOf(entry.file, appRoot);
		if (!sourceFeature) continue; // only feature -> feature is restricted
		for (const spec of extractImports(entry.source)) {
			const key = resolveImportKey(spec, entry.file, appRoot);
			if (!key) continue;
			const targetFeature = targetFeatureOfKey(key);
			if (!targetFeature) continue;
			if (targetFeature === sourceFeature) continue; // same feature ok
			// project-session public API is the only allowed cross-feature target.
			if (
				targetFeature === PROJECT_SESSION_FEATURE &&
				key === PROJECT_SESSION_PUBLIC_KEY
			) {
				continue;
			}
			violations.push({
				file: relativeToApp(entry.file, appRoot),
				rule: "cross-feature-import",
				spec,
				from: sourceFeature,
				to: targetFeature,
				resolvedKey: key,
			});
		}
	}
	return violations;
}

export function isComponentFile(file) {
	return /\.component\.ts$/.test(file);
}

/**
 * Finds component-level violations: inline template/styles, missing OnPush
 * (unless exempted), and components importing DesktopBridgeService.
 */
export function findComponentViolations(entries, appRoot, onPushExceptions = new Set()) {
	const violations = [];
	for (const entry of entries) {
		if (!isComponentFile(entry.file)) continue;
		const rel = relativeToApp(entry.file, appRoot) ?? entry.file;
		const source = entry.source;
		if (/\btemplate\s*:\s*["'`]/.test(source)) {
			violations.push({ file: rel, rule: "inline-template" });
		}
		if (/\bstyles\s*:\s*\[/.test(source)) {
			violations.push({ file: rel, rule: "inline-styles" });
		}
		if (/\bstyle\s*:\s*["'`]/.test(source)) {
			violations.push({ file: rel, rule: "inline-style" });
		}
		if (
			!onPushExceptions.has(rel) &&
			!source.includes("ChangeDetectionStrategy.OnPush")
		) {
			violations.push({ file: rel, rule: "missing-onpush" });
		}
		if (
			/import\s[^;]*\bDesktopBridgeService\b[^;]*\sfrom\s["'][^"']*desktop-bridge\.service["']/.test(
				source,
			)
		) {
			violations.push({ file: rel, rule: "component-bridge-import" });
		}
	}
	return violations;
}

/** Finds window.confirm / window.prompt usages. */
export function findWindowDialogViolations(entries, appRoot) {
	const violations = [];
	for (const entry of entries) {
		const rel = relativeToApp(entry.file, appRoot) ?? entry.file;
		const m = /\bwindow\.(confirm|prompt)\s*\(/.exec(entry.source);
		if (m) {
			violations.push({ file: rel, rule: `window.${m[1]}` });
		}
	}
	return violations;
}

/** Runs all finders and returns a flat list of violations. */
export function findAllViolations(entries, appRoot, options = {}) {
	const onPushExceptions = options.onPushExceptions ?? new Set();
	return [
		...findComponentViolations(entries, appRoot, onPushExceptions),
		...findWindowDialogViolations(entries, appRoot),
		...findCrossFeatureViolations(entries, appRoot),
	];
}
