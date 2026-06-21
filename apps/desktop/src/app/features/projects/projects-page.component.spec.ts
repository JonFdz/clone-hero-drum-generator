import "@angular/compiler";
import { signal } from "@angular/core";
import { Injector, runInInjectionContext } from "@angular/core";
import { Router } from "@angular/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { ProjectPersistenceService, ProjectSessionStore, ProjectWorkflowHydrator } from "../project-session/public-api";
import { ProjectLibraryService } from "./project-library.service";
import { ProjectsPageComponent } from "./projects-page.component";

const payload = { projectName: "Demo", generationStatus: "not-generated", selectedTracks: [], metadata: {}, mappingOverrides: {} } as never;

describe("ProjectsPageComponent", () => {
  const navigateByUrl = vi.fn();
  const refresh = vi.fn();
  const openProject = vi.fn();
  const openProjectFromPicker = vi.fn();
  const createProject = vi.fn();
  const hydrate = vi.fn();
  let component: ProjectsPageComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    const injector = Injector.create({ providers: [
      ProjectSessionStore,
      { provide: Router, useValue: { navigateByUrl } },
      { provide: ProjectLibraryService, useValue: { recentProjects: signal([]), refresh, remove: vi.fn(), deleteFile: vi.fn() } },
      { provide: ProjectPersistenceService, useValue: { openProject, openProjectFromPicker, createProject } },
      { provide: ProjectWorkflowHydrator, useValue: { hydrate } },
      { provide: DesktopGenerateStateService, useValue: { reset: vi.fn() } },
    ]});
    component = runInInjectionContext(injector, () => new ProjectsPageComponent());
  });

  it("opens a recent project through persistence, hydrates workflow, and refreshes recents", async () => {
    openProject.mockResolvedValue({ ok: true, payload });
    await component.editRecent("/demo.chdg");
    expect(hydrate).toHaveBeenCalledWith(payload);
    expect(refresh).toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith("/projects/details");
  });

  it("does not navigate when the project picker is cancelled", async () => {
    openProjectFromPicker.mockResolvedValue({ ok: false, cancelled: true });
    await component.openProject();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it("creates through persistence before navigating", async () => {
    createProject.mockResolvedValue({ ok: true, payload });
    await component.newProject();
    expect(refresh).toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith("/projects/details?mode=new");
  });
});
