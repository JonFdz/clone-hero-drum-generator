import { readFileSync } from "node:fs";
import { join , resolve} from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
const __appRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..", "..");


const source = () =>
	readFileSync(
		join(
			__appRoot, "pages/projects/project-details/project-details-page.component.ts",
		),
		"utf8",
	);

describe("ProjectDetailsPageComponent source", () => {
	it("loads the returned createProject payload instead of resetting state", () => {
		const text = source();
		expect(text).toContain("const name = createDefaultProjectName()");
		expect(text).toContain(
			"const payload = await this.projectState.createProject(name)",
		);
		expect(text).toContain("this.generateState.loadProjectState(payload)");
		expect(text).not.toContain(
			"this.projectNameInput.trim() || \"Untitled\"",
		);
		expect(text).not.toContain(
			"this.generateState.reset();\n\t\t\tthis.projectNameInput = name",
		);
	});

	it("syncs local editable fields when the loaded project changes", () => {
		const text = source();
		expect(text).toContain("private readonly loadedProjectKey = computed");
		expect(text).toContain("effect(() =>");
		expect(text).toContain(
			"this.projectNameInput = this.projectState.state().projectName",
		);
		expect(text).toContain(
			"this.metadata = { ...this.generateState.state().metadata }",
		);
	});

	it("does not manually build file:// cover preview URLs", () => {
		const text = source();
		expect(text).not.toContain("file://${imagePath}");
		expect(text).toContain("getCoverImagePreviewUrl(imagePath)");
	});

	it("uses Create Project title when no project file exists", () => {
		const text = source();
		expect(text).toContain('"Create Project"');
		expect(text).not.toContain('"Edit Project"');
	});
});
