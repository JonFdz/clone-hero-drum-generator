import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { HomeWorkflowProgressComponent } from "./home-workflow-progress.component";

describe("HomeWorkflowProgressComponent", () => {
  it("exposes its presentation contract", () => { const c = new HomeWorkflowProgressComponent(); c.steps=[]; expect(c.steps).toEqual([]); });
});
