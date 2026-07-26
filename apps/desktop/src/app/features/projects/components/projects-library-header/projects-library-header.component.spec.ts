import "@angular/compiler";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ProjectsLibraryHeaderComponent } from "./projects-library-header.component";

describe("ProjectsLibraryHeaderComponent", () => {
  it("exposes the unavailable create-project message", () => {
    const component = new ProjectsLibraryHeaderComponent();
    component.projectCount = 2;
    component.newProjectUnavailableMessage = "Creation unavailable.";
    expect(component.projectCount).toBe(2);
    expect(component.newProjectUnavailableMessage).toBe("Creation unavailable.");
    expect(component).not.toHaveProperty("newProject");
  });

  it("renders New Project as a disabled control with unavailable guidance", () => {
    const template = readFileSync(
      new URL("./projects-library-header.component.html", import.meta.url),
      "utf8",
    );
    expect(template).toContain("disabled");
    expect(template).toContain("[title]=\"newProjectUnavailableMessage\"");
    expect(template).not.toContain("newProject.emit()");
  });
});
