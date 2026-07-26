import { readFileSync } from "node:fs";
import { join , resolve} from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
const __appRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), ".");

const componentSource = () =>
	readFileSync(join(__appRoot, "app.component.ts"), "utf8");

describe("AppComponent source", () => {
	it("does not include the no-op self-assignment anti-pattern", () => {
		expect(componentSource()).not.toContain("this.generateState.applyError = this.generateState.applyError");
	});

	it("does not keep the empty saved branch in saveProjectAs", () => {
		expect(componentSource()).not.toContain("const saved = await this.projectState.saveProjectAs");
		expect(componentSource()).not.toContain("if (saved)");
	});

	it("does not expose New Project as a top-level navigation item", () => {
		expect(componentSource()).not.toContain('label: "New Project"');
		expect(componentSource()).toContain('path: "/projects"');
	});

	it("exposes Source Review instead of old separated review steps", () => {
		expect(componentSource()).toContain('label: "Source Review"');
		expect(componentSource()).toContain('path: "/source-review"');
		expect(componentSource()).not.toContain('label: "Inspect Source"');
		expect(componentSource()).not.toContain('label: "Track Selection"');
		expect(componentSource()).not.toContain('label: "Mapping"');
	});

	it("exposes Generate but not standalone Validation navigation", () => {
		expect(componentSource()).toContain('label: "Generate"');
		expect(componentSource()).toContain('path: "/generate"');
		expect(componentSource()).not.toContain('label: "Validation"');
		expect(componentSource()).not.toContain('path: "/validation"');
	});

	it("is an OnPush shell with external template and stylesheet", () => {
		const src = componentSource();
		expect(src).toContain("ChangeDetectionStrategy.OnPush");
		expect(src).toContain('templateUrl: "./app.component.html"');
		expect(src).toContain('styleUrl: "./app.component.css"');
		expect(src).not.toMatch(/\btemplate\s*:/);
		expect(src).not.toMatch(/\bstyles\s*:/);
	});

	it("does not import DesktopBridgeService directly", () => {
		const src = componentSource();
		expect(src).not.toMatch(/import[^;]*DesktopBridgeService[^;]*from/);
		expect(src).not.toContain("this.desktopBridge");
		expect(src).not.toContain("this.bridge");
	});

	it("opens projects through the centralized persistence service", () => {
		const src = componentSource();
		expect(src).toContain("ProjectPersistenceService");
		expect(src).toContain("openProjectFromPicker");
		// The duplicate bridge pick + project-state open sequence must be gone.
		expect(src).not.toContain("openProjectFile");
		expect(src).not.toContain("projectState.openProject");
	});

	it("hydrates the generation workflow through the canonical hydrator, not a local mapping", () => {
		const src = componentSource();
		expect(src).toContain("ProjectWorkflowHydrator");
		expect(src).toContain("this.workflowHydrator.hydrate(result.payload)");
		// The duplicated local payload mapping must be gone.
		expect(src).not.toContain("toGeneratePayload");
		expect(src).not.toMatch(/this\.generateState\.loadProjectState/);
	});

	it("surfaces canonical persistence as unavailable instead of invoking legacy save paths", () => {
		const source = componentSource();
		const template = readFileSync(
			join(__appRoot, "app.component.html"),
			"utf8",
		);
		expect(source).toContain("PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE");
		expect(source).not.toContain("this.persistence.saveProject(payload)");
		expect(source).not.toContain("this.persistence.saveProjectAs(payload)");
		expect(template).toContain("[disabled]=\"true\"");
		expect(template).toContain("persistenceUnavailableMessage");
	});
});
