import "@angular/compiler";
import { signal } from "@angular/core";
import { Injector, runInInjectionContext } from "@angular/core";
import { Router } from "@angular/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectPersistenceService, ProjectSessionStore, ProjectWorkflowHydrator } from "../project-session/public-api";
import { ProjectLibraryService } from "./project-library.service";
import { ProjectsPageComponent } from "./projects-page.component";

const payload = {
  project: {
    projectId: "project-demo",
    artist: "Artist",
    songName: "Demo",
    projectName: "Expert Drums",
    displayName: "Artist - Demo - Expert Drums",
  },
  projectName: "Artist - Demo - Expert Drums",
  generationStatus: "not-generated",
  selectedTracks: [],
  metadata: {},
} as never;

describe("ProjectsPageComponent", () => {
  const navigateByUrl = vi.fn();
  const refresh = vi.fn();
  const openProject = vi.fn();
  const openProjectFromPicker = vi.fn();
  const deleteFile = vi.fn();
  const remove = vi.fn();
  const applyError = vi.fn();
  const hydrate = vi.fn();
  let component: ProjectsPageComponent;
  let session: ProjectSessionStore;

  beforeEach(() => {
    vi.clearAllMocks();
    session = new ProjectSessionStore();
    const injector = Injector.create({ providers: [
      { provide: ProjectSessionStore, useValue: session },
      { provide: Router, useValue: { navigateByUrl } },
      { provide: ProjectLibraryService, useValue: { recentProjects: signal([]), loading: signal(false), error: signal(null), refresh, remove, deleteFile } },
      { provide: ProjectPersistenceService, useValue: { openProject, openProjectFromPicker } },
      { provide: ProjectWorkflowHydrator, useValue: { hydrate } },
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

  it("exposes canonical creation as unavailable to disabled child controls", () => {
    expect(component.persistenceUnavailableMessage).toBe(
      "Canonical project creation and saving are not available in this legacy workflow.",
    );
    expect(applyError).not.toHaveBeenCalled();
  });

  it("removes a project from recents without resetting the active session", async () => {
    session.setProjectFilePath("/active.chdg");
    component.projectPendingRemoval.set({ path: "/active.chdg", name: "Active" } as never);
    await component.confirmRemoveFromRecents();
    expect(remove).toHaveBeenCalledWith("/active.chdg");
    expect(session.projectFilePath()).toBe("/active.chdg");
    expect(deleteFile).not.toHaveBeenCalled();
  });
});
