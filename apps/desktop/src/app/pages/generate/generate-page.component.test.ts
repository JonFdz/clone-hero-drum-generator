import { readFileSync } from "node:fs";
import { join , resolve} from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
const __appRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..");


const source = readFileSync(
	join(
		__appRoot, "pages/generate/generate-page.component.ts",
	),
	"utf8",
);

describe("GeneratePageComponent unified flow", () => {
	it("contains integrated validation sections and no standalone validation link", () => {
		expect(source).toContain("Validation Report");
		expect(source).toContain("QA Checklist");
		expect(source).toContain("Generation Configuration");
		expect(source).toContain("Output Files Preview");
		expect(source).not.toContain("Open full validation checklist");
		expect(source).not.toContain('routerLink="/validation"');
	});

	it("runs validation on page entry and immediately before generation", () => {
		expect(source).toContain("ngOnInit(): void");
		expect(source).toContain("this.runValidation();");
		expect(source).toContain("const summary = this.runValidation();");
		expect(source).toContain("if (!summary.canGenerate)");
	});

	it("keeps warnings non-blocking and exposes generated actions", () => {
		expect(source).toContain('return this.state().status !== "generating" && this.summary().canGenerate;');
		expect(source).toContain('return this.state().generationResult ? "Regenerate" : "Start Generate";');
		expect(source).toContain("canOpenPreview(): boolean");
		expect(source).toContain('await this.router.navigateByUrl("/preview")');
	});

	it("autosaves successful generation without creating route or validation loops", () => {
		expect(source).toContain("private async autosaveGenerationResult()");
		expect(source).toContain("if (!project.projectFilePath) return;");
		expect(source).toContain("this.projectState.saveProject(payload)");
		expect(source).not.toContain("markNeedsRegenerate");
	});

	it("shows the concise generated timing summary and important warnings", () => {
		expect(source).toContain("Timing Summary");
		expect(source).toContain("result.timing.summary.label");
		expect(source).toContain("result.timing.summary.importantMessages");
		expect(source).not.toContain("result.timing.tempos");
	});
});
