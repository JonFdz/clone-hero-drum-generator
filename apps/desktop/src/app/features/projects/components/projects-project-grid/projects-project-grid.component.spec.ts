import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { ProjectsProjectGridComponent } from "./projects-project-grid.component";

describe("ProjectsProjectGridComponent", () => {
  it("exposes its presentation contract", () => { const c = new ProjectsProjectGridComponent(); expect(c.projects).toEqual([]); });
});
