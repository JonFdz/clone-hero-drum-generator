import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = () => readFileSync(fileURLToPath(new URL("./project-details-page.component.ts", import.meta.url)), "utf8");

describe("ProjectDetailsPageComponent architecture", () => {
  it("uses typed persistence outcomes, page-owned navigation, and recent refresh", () => {
    const text = source();
    expect(text).toContain("this.persistence.createProject(name)");
    expect(text).toContain("if (result.ok)");
    expect(text).toContain("await this.library.refresh()");
    expect(text).toContain('this.router.navigateByUrl("/projects/details?mode=new")');
    expect(text).not.toContain("DesktopBridgeService");
    expect(text).not.toContain("DesktopProjectStateService");
  });

  it("preserves typed cancelled Save As handling without refreshing recents", () => {
    const text = source();
    expect(text).toContain("this.persistence.saveProjectAs(payload)");
    expect(text).toContain("if (result.ok) await this.library.refresh()");
  });
});
