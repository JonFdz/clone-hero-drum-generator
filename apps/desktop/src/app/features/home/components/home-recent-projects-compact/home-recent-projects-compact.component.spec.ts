import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { HomeRecentProjectsCompactComponent } from "./home-recent-projects-compact.component";

describe("HomeRecentProjectsCompactComponent", () => {
  it("exposes its presentation contract", () => { const c = new HomeRecentProjectsCompactComponent(); const seen:string[]=[]; c.openProject.subscribe(v=>seen.push(v)); c.openProject.emit("/a.chdg"); expect(seen).toEqual(["/a.chdg"]); });
});
