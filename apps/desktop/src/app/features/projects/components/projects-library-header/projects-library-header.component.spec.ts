import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { ProjectsLibraryHeaderComponent } from "./projects-library-header.component";

describe("ProjectsLibraryHeaderComponent", () => {
  it("exposes its presentation contract", () => { const c = new ProjectsLibraryHeaderComponent(); c.projectCount=2; expect(c.projectCount).toBe(2); });
});
