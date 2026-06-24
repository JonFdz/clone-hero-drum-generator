import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { ProjectsSourceBadgeComponent } from "./projects-source-badge.component";

describe("ProjectsSourceBadgeComponent", () => {
  it("exposes its presentation contract", () => { const c = new ProjectsSourceBadgeComponent(); expect(c.label).toBe("Unknown"); });
});
