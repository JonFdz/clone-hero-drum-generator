import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
	new URL("./new-project-page.component.ts", import.meta.url),
	"utf8",
);

describe("NewProjectPageComponent persistence availability", () => {
	it("disables legacy persistence controls and surfaces the explicit unavailable message", () => {
		expect(source).toContain("PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE");
		expect(source).toContain("[disabled]=\"true\"");
		expect(source).toContain("persistenceUnavailableMessage");
		expect(source).not.toContain("await this.projectState.createProject(");
		expect(source).not.toContain("await this.projectState.saveProject(payload)");
		expect(source).not.toContain("await this.projectState.saveProjectAs(payload)");
		expect(source).toContain(
			'<fieldset class="grid two" disabled [title]="persistenceUnavailableMessage">',
		);
		expect(source).toContain("Source Review Unavailable");
		expect(source).not.toContain('routerLink="/source-review"');
		expect(source).not.toContain("this.bridge.pickSourceFile");
		expect(source).not.toContain("this.bridge.pickAudioFile");
		expect(source).not.toContain("this.bridge.pickOutputFolder");
		expect(source).not.toContain("this.generateState.setSourcePath");
		expect(source).not.toContain("this.generateState.setAudioPath");
		expect(source).not.toContain("this.generateState.setOutputDir");
	});
});
