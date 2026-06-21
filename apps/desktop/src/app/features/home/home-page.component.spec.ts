import "@angular/compiler";
import { signal } from "@angular/core";
import { Injector, runInInjectionContext } from "@angular/core";
import { Router } from "@angular/router";
import { describe, expect, it, vi } from "vitest";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { ProjectPersistenceService, ProjectSessionStore, ProjectWorkflowHydrator } from "../project-session/public-api";
import { ProjectLibraryService } from "../projects/public-api";
import { HomePageComponent } from "./home-page.component";
import { HomeService } from "./home.service";

describe("HomePageComponent", () => {
  it("keeps navigation in the page after a typed open success", async () => {
    const navigateByUrl = vi.fn(); const refresh = vi.fn(); const hydrate = vi.fn();
    const payload = { projectName: "Demo", generationStatus: "not-generated", selectedTracks: [], metadata: {}, mappingOverrides: {} } as never;
    const injector = Injector.create({ providers: [ProjectSessionStore,
      { provide: Router, useValue: { navigateByUrl } },
      { provide: ProjectLibraryService, useValue: { recentProjects: signal([]), refresh, remove: vi.fn() } },
      { provide: ProjectPersistenceService, useValue: { openProject: vi.fn().mockResolvedValue({ ok: true, payload }) } },
      { provide: ProjectWorkflowHydrator, useValue: { hydrate } },
      { provide: DesktopGenerateStateService, useValue: { state: signal({ selectedTracks: [], metadata: {} }) } },
      { provide: HomeService, useValue: { openOutputFolder: vi.fn() } },
    ]});
    const component = runInInjectionContext(injector, () => new HomePageComponent());
    await component.openRecent("/demo.chdg");
    expect(hydrate).toHaveBeenCalledWith(payload);
    expect(refresh).toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalled();
  });
});
