import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = () =>
	readFileSync(
		join(
			process.cwd(),
			"apps/desktop/src/app/pages/projects/projects-page.component.ts",
		),
		"utf8",
	);

describe("ProjectsPageComponent source", () => {
	it("selects projects without navigating to Project Details", () => {
		const text = source();
		expect(text).toContain("async selectRecent");
		expect(text).toContain("this.loadProjectState(payload);");
		expect(text).not.toContain('selectRecent(filePath: string): Promise<void> {\n\t\tconst payload = await this.projectState.openProject(filePath);\n\t\tif (payload) {\n\t\t\tthis.loadProjectState(payload);\n\t\t\tawait this.router.navigateByUrl');
	});

	it("edits projects through /projects/details", () => {
		const text = source();
		expect(text).toContain("async editRecent");
		expect(text).toContain('await this.router.navigateByUrl("/projects/details")');
	});

	it("keeps recents-only removal separate from file deletion", () => {
		const text = source();
		expect(text).toContain("async confirmRemoveFromRecents");
		expect(text).toContain("await this.projectState.removeRecentProject(project.path)");
		expect(text).toContain("async confirmRemoveAndDelete");
		expect(text).toContain("await this.projectState.deleteProjectFile(project.path)");
	});
});
