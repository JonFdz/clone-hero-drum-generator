import "@angular/compiler";
import { Injector, runInInjectionContext, signal } from "@angular/core";
import { Router } from "@angular/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { ProjectPersistenceService, ProjectSessionStore, ProjectWorkflowHydrator } from "../project-session/public-api";
import { ProjectLibraryService } from "../projects/public-api";
import { HomePageComponent } from "./home-page.component";
import { HomeService } from "./home.service";

const payload = {
  projectName: "Demo",
  generationStatus: "not-generated",
  sourcePath: "/demo.mid",
  audioPath: "/demo.ogg",
  outputDir: "/output",
  selectedTracks: [],
  metadata: {},
  mappingOverrides: {},
} as never;

describe("HomePageComponent", () => {
  const navigateByUrl = vi.fn();
  const refresh = vi.fn();
  const hydrate = vi.fn();
  const openProject = vi.fn();
  const openProjectFromPicker = vi.fn();
  const openOutputFolder = vi.fn();
  const workflowState = signal({ selectedTracks: [], metadata: {}, sourcePath: undefined as string | undefined, audioPath: undefined as string | undefined, outputDir: undefined as string | undefined });
  let component: HomePageComponent;
  let session: ProjectSessionStore;

  beforeEach(() => {
    vi.clearAllMocks();
    session = new ProjectSessionStore();
    workflowState.set({ selectedTracks: [], metadata: {}, sourcePath: undefined, audioPath: undefined, outputDir: undefined });
    hydrate.mockImplementation((opened: typeof payload) => workflowState.update((state) => ({ ...state, sourcePath: opened.sourcePath, audioPath: opened.audioPath, outputDir: opened.outputDir })));
    const injector = Injector.create({ providers: [
      { provide: ProjectSessionStore, useValue: session },
      { provide: Router, useValue: { navigateByUrl } },
      { provide: ProjectLibraryService, useValue: { recentProjects: signal([]), refresh, remove: vi.fn() } },
      { provide: ProjectPersistenceService, useValue: { openProject, openProjectFromPicker } },
      { provide: ProjectWorkflowHydrator, useValue: { hydrate } },
      { provide: DesktopGenerateStateService, useValue: { state: workflowState } },
      { provide: HomeService, useValue: { openOutputFolder } },
    ]});
    component = runInInjectionContext(injector, () => new HomePageComponent());
  });

  it("does not navigate or hydrate when the project picker is cancelled", async () => {
    openProjectFromPicker.mockResolvedValue({ ok: false, cancelled: true });
    await component.openProject();
    expect(hydrate).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it("opens a recent project, hydrates, refreshes, and navigates to the next step", async () => {
    session.applyHydration(payload);
    openProject.mockResolvedValue({ ok: true, payload, missingPaths: [] });
    await component.openRecent("/demo.chdg");
    expect(hydrate).toHaveBeenCalledWith(payload);
    expect(refresh).toHaveBeenCalledOnce();
    expect(navigateByUrl).toHaveBeenCalledWith("/source-review");
  });

  it("navigates to Project Details when no output folder is configured", async () => {
    await component.openOutputFolder();
    expect(navigateByUrl).toHaveBeenCalledWith("/projects/details");
    expect(openOutputFolder).not.toHaveBeenCalled();
  });
});
