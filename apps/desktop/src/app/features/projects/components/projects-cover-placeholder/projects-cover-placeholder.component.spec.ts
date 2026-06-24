import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { ProjectsCoverPlaceholderComponent } from "./projects-cover-placeholder.component";

describe("ProjectsCoverPlaceholderComponent", () => {
  it("exposes its presentation contract", () => { const c = new ProjectsCoverPlaceholderComponent(); expect(c.projectName).toBe("Project"); });
});
