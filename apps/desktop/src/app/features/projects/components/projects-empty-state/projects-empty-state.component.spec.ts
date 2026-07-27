import "@angular/compiler";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ProjectsEmptyStateComponent } from "./projects-empty-state.component";

describe("ProjectsEmptyStateComponent", () => {
  it("exposes the unavailable create-project message without an event", () => {
    const component = new ProjectsEmptyStateComponent();
    component.newProjectUnavailableMessage = "Creation unavailable.";
    expect(component.newProjectUnavailableMessage).toBe("Creation unavailable.");
    expect(component).not.toHaveProperty("newProject");
  });

  it("renders New Project as a disabled control with unavailable guidance", () => {
    const template = readFileSync(
      new URL("./projects-empty-state.component.html", import.meta.url),
      "utf8",
    );
    expect(template).toContain("disabled");
    expect(template).toContain("[title]=\"newProjectUnavailableMessage\"");
    expect(template).not.toContain("newProject.emit()");
  });
});
