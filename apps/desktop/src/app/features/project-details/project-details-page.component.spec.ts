import "@angular/compiler";
import { Injector, runInInjectionContext, signal } from "@angular/core";
import { Router } from "@angular/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { ProjectPersistenceService, ProjectSessionStore, ProjectWorkflowHydrator } from "../project-session/public-api";
import { ProjectLibraryService } from "../projects/public-api";
import { SettingsService } from "../settings/public-api";
import {
  PROJECT_DETAILS_REACTIVE_EFFECTS,
  ProjectDetailsPageComponent,
} from "./project-details-page.component";
import { ProjectDetailsService } from "./project-details.service";

const projectPayload = {
  projectName: "Created Project",
  generationStatus: "not-generated",
  selectedTracks: [],
  metadata: {},
  mappingOverrides: {},
} as never;

describe("ProjectDetailsPageComponent", () => {
  const navigateByUrl = vi.fn();
  const refresh = vi.fn();
  const hydrate = vi.fn();
  const createProject = vi.fn();
  const saveProject = vi.fn();
  const saveProjectAs = vi.fn();
  const buildProjectStatePayload = vi.fn();
  const setSavedOutputDir = vi.fn();
  const applyError = vi.fn();
  const pickSource = vi.fn();
  const workflowState = signal({ metadata: {}, selectedTracks: [], mappingOverrides: {}, issues: [], logs: [], status: "idle", offsetMs: 0 });
  let component: ProjectDetailsPageComponent;
  let session: ProjectSessionStore;

  beforeEach(() => {
    vi.clearAllMocks();
    workflowState.set({ metadata: {}, selectedTracks: [], mappingOverrides: {}, issues: [], logs: [], status: "idle", offsetMs: 0 });
    session = new ProjectSessionStore();
    const injector = Injector.create({ providers: [
      { provide: PROJECT_DETAILS_REACTIVE_EFFECTS, useValue: false },
      { provide: ProjectSessionStore, useValue: session },
      { provide: Router, useValue: { navigateByUrl } },
      { provide: ProjectPersistenceService, useValue: { createProject, saveProject, saveProjectAs } },
      { provide: ProjectLibraryService, useValue: { refresh } },
      { provide: ProjectWorkflowHydrator, useValue: { hydrate } },
      { provide: SettingsService, useValue: { settings: signal({ schemaVersion: 1, theme: "dark", projectLocation: "" }) } },
      { provide: ProjectDetailsService, useValue: { pickSource, pickAudio: vi.fn(), pickOutput: vi.fn(), pickCover: vi.fn(), coverPreview: vi.fn() } },
      { provide: DesktopGenerateStateService, useValue: {
        state: workflowState,
        validation: signal({ errors: [] }),
        buildProjectStatePayload,
        setSavedOutputDir,
        setMetadata: vi.fn(),
        setOffsetMsInput: vi.fn(),
        setSourcePath: vi.fn(),
        setAudioPath: vi.fn(),
        setOutputDir: vi.fn(),
        setCoverImagePath: vi.fn(),
        applyError,
      } },
    ]});
    component = runInInjectionContext(injector, () => new ProjectDetailsPageComponent());
  });

  it("creates, hydrates, refreshes, updates the name, and navigates", async () => {
    createProject.mockResolvedValue({ ok: true, payload: projectPayload });
    await component.createProject();
    expect(hydrate).toHaveBeenCalledWith(projectPayload);
    expect(refresh).toHaveBeenCalledOnce();
    expect(component.projectNameInput).toBe("Created Project");
    expect(navigateByUrl).toHaveBeenCalledWith("/projects/details?mode=new");
  });

  it("saves the current payload and updates the saved output", async () => {
    const currentPayload = { projectName: "Demo", outputDir: "/current" };
    const savedPayload = { ...currentPayload, outputDir: "/normalized" };
    buildProjectStatePayload.mockReturnValue(currentPayload);
    saveProject.mockResolvedValue({ ok: true, filePath: "/demo.chdg", payload: savedPayload });
    await component.saveProject();
    expect(saveProject).toHaveBeenCalledWith(currentPayload);
    expect(setSavedOutputDir).toHaveBeenCalledWith("/normalized");
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("does not refresh recents when Save As is cancelled", async () => {
    buildProjectStatePayload.mockReturnValue({ projectName: "Demo" });
    saveProjectAs.mockResolvedValue({ ok: false, cancelled: true });
    await component.saveProjectAs();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("refreshes recents after a successful Save As", async () => {
    buildProjectStatePayload.mockReturnValue({ projectName: "Demo" });
    saveProjectAs.mockResolvedValue({ ok: true, filePath: "/saved.chdg", payload: projectPayload });
    await component.saveProjectAs();
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("reports picker failures through workflow error state", async () => {
    pickSource.mockRejectedValue(new Error("picker failed"));
    await component.pickSource();
    expect(applyError).toHaveBeenCalledWith("picker failed");
  });
});
