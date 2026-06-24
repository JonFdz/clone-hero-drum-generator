import "@angular/compiler"; import { describe, expect, it } from "vitest"; import { GenerationStepsComponent } from "./generation-steps.component";
describe("GenerationStepsComponent", () => { it("accepts steps and state", () => { const c = new GenerationStepsComponent(); c.steps = ["Parse"]; c.state = "Running"; expect(c.steps).toHaveLength(1); }); });
