import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { ProjectsEmptyStateComponent } from "./projects-empty-state.component";

describe("ProjectsEmptyStateComponent", () => {
  it("exposes its presentation contract", () => { const c = new ProjectsEmptyStateComponent(); let called=false; c.newProject.subscribe(()=>called=true); c.newProject.emit(); expect(called).toBe(true); });
});
