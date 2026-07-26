import "@angular/compiler";
import { readFileSync } from "node:fs";
import { Injector, runInInjectionContext, signal } from "@angular/core";
import { Router } from "@angular/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { ProjectPersistenceService, ProjectSessionStore, ProjectWorkflowHydrator } from "../project-session/public-api";
import { ProjectLibraryService } from "../projects/public-api";
import {
  HOME_CREATION_IMPORT_UNAVAILABLE_MESSAGE,
  HomePageComponent,
} from "./home-page.component";
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

  it("disables and unroutes project creation and source import quick actions", () => {
    const template = readFileSync(
      new URL("./home-page.component.html", import.meta.url),
      "utf8",
    );
    expect(component.creationImportUnavailableMessage).toBe(
      HOME_CREATION_IMPORT_UNAVAILABLE_MESSAGE,
    );
    expect(template).toContain("New Project (Unavailable)");
    expect(template).toContain("Import MIDI (Unavailable)");
    expect(template).toContain("Import Guitar Pro (Unavailable)");
    expect(template).not.toContain(
      "(click)=\"navigateTo('/projects/details')\"",
    );
    expect(template).toContain("[disabled]=\"!canOpenOutputFolder()\"");
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
    expect(navigateByUrl).toHaveBeenCalledWith("/mapping");
  });

  it("keeps output-folder navigation unavailable when no target is recorded", async () => {
    await component.openOutputFolder();
    expect(component.canOpenOutputFolder()).toBe(false);
    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(openOutputFolder).not.toHaveBeenCalled();
  });

  it("opens the recorded output target when available", async () => {
    workflowState.update((state) => ({ ...state, outputDir: "/output" }));
    await component.openOutputFolder();
    expect(component.canOpenOutputFolder()).toBe(true);
    expect(openOutputFolder).toHaveBeenCalledWith("/output");
  });

  it("disables a stale recorded output target reported missing", async () => {
    workflowState.update((state) => ({ ...state, outputDir: "/missing/output" }));
    session.setMissingPaths([
      {
        kind: "outputDir",
        path: "/missing/output",
        message: "Missing outputDir: /missing/output",
      },
    ]);

    expect(component.canOpenOutputFolder()).toBe(false);
    expect(component.outputFolderActionTitle()).toBe(
      "The recorded export target or required managed preview files are unavailable",
    );
    await component.openOutputFolder();
    expect(openOutputFolder).not.toHaveBeenCalled();
  });

  it("disables an existing output folder when required managed preview files are missing", async () => {
    workflowState.update((state) => ({ ...state, outputDir: "/existing/output" }));
    session.setMissingPaths([
      {
        kind: "outputAudioPath",
        path: "/existing/output/song.ogg",
        message: "Missing managed audio",
      },
    ]);

    expect(component.canOpenOutputFolder()).toBe(false);
    await component.openOutputFolder();
    expect(openOutputFolder).not.toHaveBeenCalled();
  });
});
