import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { ProjectsToolbarComponent } from "./projects-toolbar.component";

describe("ProjectsToolbarComponent", () => {
  it("exposes its presentation contract", () => { const c = new ProjectsToolbarComponent(); const seen:string[]=[]; c.queryChange.subscribe(v=>seen.push(v)); c.queryChange.emit("drums"); expect(seen).toEqual(["drums"]); });
});
