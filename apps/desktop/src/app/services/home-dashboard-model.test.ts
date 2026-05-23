import { describe, expect, it } from "vitest";
import type { RecentProject } from "@chdg/project/browser";
import type { DesktopGenerateState } from "./desktop-generate-state.service";
import type { DesktopProjectState } from "./desktop-project-state.service";
import {
	deriveHomeNextAction,
	deriveWorkflowStepStatuses,
	formatHomeOutputStatus,
	limitRecentProjects,
} from "./home-dashboard-model";

function project(
	overrides: Partial<DesktopProjectState> = {},
): DesktopProjectState {
	return {
		projectName: "Demo",
		dirty: false,
		outputStatus: "not-generated",
		missingPaths: [],
		recentProjects: [],
		settings: {
			schemaVersion: 1,
			theme: "dark",
			projectLocation: "",
		},
		...overrides,
	};
}

function generate(
	overrides: Partial<DesktopGenerateState> = {},
): DesktopGenerateState {
	return {
		metadata: {},
		selectedTracks: [],
		mappingOverrides: {},
		issues: [],
		logs: [],
		status: "idle",
		...overrides,
	};
}

function recent(index: number): RecentProject {
	return {
		name: `Project ${index}`,
		path: `/tmp/project-${index}.chdg`,
		lastOpenedAt: `2026-05-2${index}T00:00:00.000Z`,
	};
}

describe("home dashboard next action", () => {
	it("uses New Project when no project is active", () => {
		expect(
			deriveHomeNextAction({
				project: project({ projectName: "Untitled" }),
				generate: generate(),
				hasProject: false,
				isDirty: false,
			}).id,
		).toBe("new_project");
	});

	it("uses Continue Setup when required paths are missing", () => {
		expect(
			deriveHomeNextAction({
				project: project({
					missingPaths: [{ kind: "sourcePath", message: "Missing sourcePath" }],
				}),
				generate: generate({ audioPath: "demo.ogg", outputDir: "/tmp/out" }),
				hasProject: true,
				isDirty: false,
			}).id,
		).toBe("continue_setup");
	});

	it("uses Inspect Source for a safe not-generated setup", () => {
		expect(
			deriveHomeNextAction({
				project: project({ outputStatus: "not-generated" }),
				generate: generate({
					sourcePath: "demo.mid",
					audioPath: "demo.ogg",
					outputDir: "/tmp/out",
				}),
				hasProject: true,
				isDirty: false,
			}).id,
		).toBe("inspect_source");
	});

	it("uses Generate when output needs regeneration", () => {
		expect(
			deriveHomeNextAction({
				project: project({ outputStatus: "needs-regenerate" }),
				generate: generate({
					sourcePath: "demo.mid",
					audioPath: "demo.ogg",
					outputDir: "/tmp/out",
				}),
				hasProject: true,
				isDirty: true,
			}).id,
		).toBe("generate");
	});

	it("uses Preview when output is generated", () => {
		expect(
			deriveHomeNextAction({
				project: project({ outputStatus: "generated" }),
				generate: generate({
					sourcePath: "demo.mid",
					audioPath: "demo.ogg",
					outputDir: "/tmp/out",
				}),
				hasProject: true,
				isDirty: false,
			}).id,
		).toBe("preview");
	});

	it("uses Review Generate when output failed", () => {
		expect(
			deriveHomeNextAction({
				project: project({ outputStatus: "failed" }),
				generate: generate({
					sourcePath: "demo.mid",
					audioPath: "demo.ogg",
					outputDir: "/tmp/out",
				}),
				hasProject: true,
				isDirty: true,
			}).id,
		).toBe("review_generate");
	});
});

describe("home dashboard helpers", () => {
	it("keeps six canonical workflow steps in order", () => {
		const steps = deriveWorkflowStepStatuses({
			project: project(),
			generate: generate(),
			hasProject: true,
			isDirty: false,
		});

		expect(steps.map((step) => step.label)).toEqual([
			"Import source",
			"Inspect",
			"Select track(s)",
			"Generate",
			"Validate",
			"Preview",
		]);
	});

	it("limits compact recent projects to three", () => {
		expect(
			limitRecentProjects([recent(1), recent(2), recent(3), recent(4)]),
		).toEqual([recent(1), recent(2), recent(3)]);
	});

	it("keeps output labels stable", () => {
		expect(formatHomeOutputStatus("not-generated").label).toBe("Not generated");
		expect(formatHomeOutputStatus("needs-regenerate").label).toBe(
			"Needs regenerate",
		);
		expect(formatHomeOutputStatus("generated").label).toBe("Generated");
		expect(formatHomeOutputStatus("failed").label).toBe("Failed");
	});
});
