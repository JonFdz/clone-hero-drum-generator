import "@angular/compiler";
import { Injector, runInInjectionContext, signal } from "@angular/core";
import type { DesktopSettings } from "@chdg/project/browser";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPageComponent } from "./settings-page.component";
import { SettingsService } from "./settings.service";

const initial: DesktopSettings = { schemaVersion: 1, theme: "dark", projectLocation: "/initial" };

describe("SettingsPageComponent", () => {
  const settings = signal<DesktopSettings>({ ...initial });
  const ffmpegDiagnostic = signal<{ available: boolean; message: string } | undefined>(undefined);
  const save = vi.fn(async (draft: DesktopSettings) => {
    settings.set({ ...draft, projectLocation: draft.projectLocation.trim() });
  });
  const testFfmpeg = vi.fn(async (path: string) => {
    const diagnostic = path === "/ok" ? { available: true, message: "FFmpeg 7" } : { available: false, message: "FFmpeg missing" };
    ffmpegDiagnostic.set(diagnostic);
    return diagnostic;
  });
  let component: SettingsPageComponent;

  beforeEach(() => {
    settings.set({ ...initial });
    ffmpegDiagnostic.set(undefined);
    vi.clearAllMocks();
    const injector = Injector.create({ providers: [{ provide: SettingsService, useValue: { settings, ffmpegDiagnostic, save, testFfmpeg } }] });
    component = runInInjectionContext(injector, () => new SettingsPageComponent());
  });

  it("reflects settings loaded after the page is created", () => {
    settings.set({ ...initial, projectLocation: "/loaded", defaultCharter: "Jon" });
    expect(component.settings()).toMatchObject({ projectLocation: "/loaded", defaultCharter: "Jon" });
  });

  it("persists the current immutable form draft", async () => {
    component.updateSettings({ projectLocation: " /draft ", defaultOutputFolder: "/output" });
    await component.save();
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ projectLocation: " /draft ", defaultOutputFolder: "/output" }));
  });

  it("synchronizes the form with the normalized successful save result", async () => {
    component.updateSettings({ projectLocation: " /normalized " });
    await component.save();
    expect(component.settings().projectLocation).toBe("/normalized");
  });

  it("shows successful and failed FFmpeg diagnostics", async () => {
    component.updateSettings({ ffmpegPath: "/ok" });
    await component.testFfmpeg();
    expect(component.ffmpegResult()).toEqual({ available: true, message: "FFmpeg 7" });

    component.updateSettings({ ffmpegPath: "/missing" });
    await component.testFfmpeg();
    expect(component.ffmpegResult()).toEqual({ available: false, message: "FFmpeg missing" });
  });
});
