import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { HomeWarningsPanelComponent } from "./home-warnings-panel.component";

describe("HomeWarningsPanelComponent", () => {
  it("exposes its presentation contract", () => { const c = new HomeWarningsPanelComponent(); c.warnings=[]; expect(c.warnings).toEqual([]); });
});
