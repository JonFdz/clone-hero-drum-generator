import "@angular/compiler";
import { readFileSync } from "node:fs";
import { Injector, runInInjectionContext, signal } from "@angular/core";
import { Router } from "@angular/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { ProjectPersistenceService, ProjectSessionStore, ProjectWorkflowHydrator } from "../project-session/public-api";
import { ProjectLibraryService } from "../projects/public-api";
import { SettingsService } from "../settings/public-api";
import {
  PROJECT_DETAILS_UNAVAILABLE_MESSAGE,
  PROJECT_DETAILS_REACTIVE_EFFECTS,
  ProjectDetailsPageComponent,
} from "./project-details-page.component";
import { ProjectDetailsService } from "./project-details.service";

describe("ProjectDetailsPageComponent", () => {
  const navigateByUrl = vi.fn();
  const refresh = vi.fn();
  const hydrate = vi.fn();
  const createProject = vi.fn();
  const saveProject = vi.fn();
  const saveProjectAs = vi.fn();
  const setSavedOutputDir = vi.fn();
  const applyError = vi.fn();
  const pickSource = vi.fn();
  const pickAudio = vi.fn();
  const pickOutput = vi.fn();
  const pickCover = vi.fn();
  const setSourcePath = vi.fn();
  const setAudioPath = vi.fn();
  const setOutputDir = vi.fn();
  const setCoverImagePath = vi.fn();
  const workflowState = signal({ metadata: {}, selectedTracks: [], mappingOverrides: {}, issues: [], logs: [], status: "idle", offsetMs: 0 });
  let component: ProjectDetailsPageComponent;
  let session: ProjectSessionStore;
  let injector: Injector;

  beforeEach(() => {
    vi.clearAllMocks();
    workflowState.set({ metadata: {}, selectedTracks: [], mappingOverrides: {}, issues: [], logs: [], status: "idle", offsetMs: 0 });
    session = new ProjectSessionStore();
    injector = Injector.create({ providers: [
      { provide: PROJECT_DETAILS_REACTIVE_EFFECTS, useValue: false },
      { provide: ProjectSessionStore, useValue: session },
      { provide: Router, useValue: { navigateByUrl } },
      { provide: ProjectPersistenceService, useValue: { createProject, saveProject, saveProjectAs } },
      { provide: ProjectLibraryService, useValue: { refresh } },
      { provide: ProjectWorkflowHydrator, useValue: { hydrate } },
      { provide: SettingsService, useValue: { settings: signal({ schemaVersion: 1, theme: "dark", projectLocation: "" }) } },
      { provide: ProjectDetailsService, useValue: { pickSource, pickAudio, pickOutput, pickCover, coverPreview: vi.fn() } },
      { provide: DesktopGenerateStateService, useValue: {
        state: workflowState,
        validation: signal({ errors: [] }),
        setSavedOutputDir,
        setMetadata: vi.fn(),
        setOffsetMsInput: vi.fn(),
        setSourcePath,
        setAudioPath,
        setOutputDir,
        setCoverImagePath,
        applyError,
      } },
    ]});
    component = runInInjectionContext(injector, () => new ProjectDetailsPageComponent());
  });

  it("reports canonical project creation as unavailable without invoking persistence", async () => {
    await component.createProject();
    expect(createProject).not.toHaveBeenCalled();
    expect(hydrate).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(applyError).toHaveBeenCalledWith(
      PROJECT_DETAILS_UNAVAILABLE_MESSAGE,
    );
  });

  it("displays canonical projectName rather than the composite display name", () => {
    session.applyHydration({
      project: {
        projectId: "project-demo",
        artist: "Artist",
        songName: "Song",
        projectName: "Expert Drums",
        displayName: "Artist - Song - Expert Drums",
      },
      projectName: "Artist - Song - Expert Drums",
      selectedTracks: [],
      metadata: {},
      generationStatus: "not-generated",
    });
    component = runInInjectionContext(
      injector,
      () => new ProjectDetailsPageComponent(),
    );
    expect(component.projectNameInput).toBe("Expert Drums");
    expect(component.setupDisabled()).toBe(true);
  });

  it("uses truthful unavailable create-mode labels and disables setup controls", () => {
    const template = readFileSync(
      new URL("./project-details-page.component.html", import.meta.url),
      "utf8",
    );
    expect(component.title()).toBe("Project Setup Unavailable");
    expect(component.primarySaveLabel).toBe("Save Unavailable");
    expect(component.setupDisabled()).toBe(true);
    expect(template).not.toContain("Create Project");
    expect(template).not.toContain("Save Draft");
    expect(template).not.toContain("Save Changes");
    expect(template).toContain("New Project Unavailable");
    expect(template).toContain("Save As Unavailable");
    expect(template).toContain("[disabled]=\"setupDisabled()\"");
    expect(template).toContain(
      "Open an existing .chdg project from Projects",
    );
    for (const contradiction of [
      "Re-select",
      "Regenerate to",
      "Choose File",
      "Choose Folder",
      "Choose Cover",
      "Set song information",
      "Before generation",
      "Review Source",
      "adjust settings before proceeding",
    ]) {
      expect(template).not.toContain(contradiction);
    }
    expect(template).toContain(
      "Read-only inspection. Editing, replacement, review, and persistence are unavailable.",
    );
  });

  it("reports Save as unavailable without building or persisting a provisional payload", async () => {
    await component.saveProject();
    expect(saveProject).not.toHaveBeenCalled();
    expect(setSavedOutputDir).not.toHaveBeenCalled();
    expect(applyError).toHaveBeenCalledWith(
      PROJECT_DETAILS_UNAVAILABLE_MESSAGE,
    );
  });

  it("reports Save As as unavailable without invoking persistence", async () => {
    await component.saveProjectAs();
    expect(saveProjectAs).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(applyError).toHaveBeenCalledWith(
      PROJECT_DETAILS_UNAVAILABLE_MESSAGE,
    );
  });

  it("does not invoke external pickers or replace runtime paths", async () => {
    await component.pickSource();
    await component.pickAudio();
    await component.pickOutput();
    await component.pickCover();
    expect(pickSource).not.toHaveBeenCalled();
    expect(pickAudio).not.toHaveBeenCalled();
    expect(pickOutput).not.toHaveBeenCalled();
    expect(pickCover).not.toHaveBeenCalled();
    expect(setSourcePath).not.toHaveBeenCalled();
    expect(setAudioPath).not.toHaveBeenCalled();
    expect(setOutputDir).not.toHaveBeenCalled();
    expect(setCoverImagePath).not.toHaveBeenCalled();
    expect(applyError).toHaveBeenCalledWith(
      PROJECT_DETAILS_UNAVAILABLE_MESSAGE,
    );
  });
});
