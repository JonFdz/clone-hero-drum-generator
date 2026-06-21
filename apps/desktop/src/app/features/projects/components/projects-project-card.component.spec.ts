import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { ProjectsProjectCardComponent } from "./projects-project-card.component";

describe("ProjectsProjectCardComponent", () => {
  it("exposes its presentation contract", () => { const c = new ProjectsProjectCardComponent(); const seen:string[]=[]; c.editProject.subscribe(v=>seen.push(v)); c.editProject.emit("/a"); expect(seen).toEqual(["/a"]); });
});
