import { describe, expect, it } from "vitest";
import type { DesktopGenerateState } from "../app/services/desktop-generate-state.service";
import type { DesktopProjectState } from "../app/services/desktop-project-state.service";
import { buildBrowserValidationSummary } from "./browser-validation-adapter";
import { resolveBrowserScenario } from "./scenario-registry";

function projectState(status: DesktopProjectState["outputStatus"]): DesktopProjectState {
	return {
		projectName: "Demo Project",
		dirty: false,
		outputStatus: status,
		missingPaths: [],
		recentProjects: [],
		settings: { schemaVersion: 1, theme: "dark", projectLocation: "" },
	};
}

function generateState(
	id: "generate-ready" | "generate-running" | "generate-failed",
): DesktopGenerateState {
	const scenario = resolveBrowserScenario(id);
	return {
		sourcePath: scenario.project?.sourcePath,
		audioPath: scenario.project?.audioPath,
		outputDir: scenario.project?.outputDir,
		sourceKind: scenario.project?.sourceKind,
		selectedTracks: scenario.project?.selectedTracks ?? [],
		metadata: scenario.project?.metadata ?? {},
		mappingOverrides: scenario.project?.mappingOverrides ?? {},
		issues: [],
		logs: [],
		status:
			scenario.generationSeed === "running"
				? "generating"
				: scenario.generationSeed === "failed"
					? "error"
					: "ready-to-generate",
	};
}

describe("browser validation adapter", () => {
	it.each([
		["generate-ready", "not-generated"],
		["generate-running", "not-generated"],
		["generate-failed", "failed"],
	] as const)(
		"uses the repository-owned checked-at timestamp for repeated %s validation",
		(id, outputStatus) => {
			const generate = generateState(id);
			const project = projectState(outputStatus);

			const first = buildBrowserValidationSummary(generate, project);
			const second = buildBrowserValidationSummary(generate, project);

			expect(first.checkedAt).toBe("2026-01-15T12:00:02.000Z");
			expect(second.checkedAt).toBe(first.checkedAt);
			expect(first.items.length).toBeGreaterThan(0);
		},
	);
});
