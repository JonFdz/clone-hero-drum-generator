import "@angular/compiler";
import { signal } from "@angular/core";
import { Injector, runInInjectionContext } from "@angular/core";
import { describe, expect, it, vi } from "vitest";
import { SettingsPageComponent } from "./settings-page.component";
import { SettingsService } from "./settings.service";

describe("SettingsPageComponent", () => {
  it("delegates persistence and FFmpeg diagnostics to SettingsService", async () => {
    const save = vi.fn(); const testFfmpeg = vi.fn();
    const injector = Injector.create({ providers: [{ provide: SettingsService, useValue: {
      settings: signal({ schemaVersion: 1, theme: "dark", projectLocation: "" }),
      ffmpegDiagnostic: signal(undefined), save, testFfmpeg,
    }}]});
    const component = runInInjectionContext(injector, () => new SettingsPageComponent());
    await component.save(); await component.testFfmpeg();
    expect(save).toHaveBeenCalled();
    expect(testFfmpeg).toHaveBeenCalledWith("");
  });
});
