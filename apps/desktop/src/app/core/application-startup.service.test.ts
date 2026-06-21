import { describe, expect, it, vi } from "vitest";
import { ApplicationStartupService } from "./application-startup.service";
import { ProjectLibraryService } from "../features/projects/project-library.service";
import { SettingsService } from "../features/settings/settings.service";
import { DesktopBridgeService } from "../services/desktop-bridge.service";

function makeBridge() {
	return {
		loadStatus: vi.fn().mockResolvedValue(undefined),
		appInfo: vi.fn(),
		health: vi.fn(),
		readRecentProjects: vi.fn().mockResolvedValue({ ok: true, data: [] }),
		readSettings: vi
			.fn()
			.mockResolvedValue({ ok: true, data: { schemaVersion: 1, theme: "dark", projectLocation: "" } }),
	} as unknown as DesktopBridgeService;
}

describe("ApplicationStartupService", () => {
	it("runs the bootstrap sequence once: bridge status, settings, recents", async () => {
		const bridge = makeBridge();
		const library = new ProjectLibraryService(bridge);
		const settings = new SettingsService(bridge);
		const startup = new ApplicationStartupService(bridge, settings, library);
		const loadSpy = vi.spyOn(bridge, "loadStatus");
		const settingsSpy = vi.spyOn(settings, "refresh");
		const librarySpy = vi.spyOn(library, "refresh");

		await startup.initialize();
		await startup.initialize();

		expect(loadSpy).toHaveBeenCalledTimes(1);
		expect(settingsSpy).toHaveBeenCalledTimes(1);
		expect(librarySpy).toHaveBeenCalledTimes(1);
	});

	it("exposes the bridge health and app info signals without importing the bridge in the shell", () => {
		const bridge = makeBridge();
		const library = new ProjectLibraryService(bridge);
		const settings = new SettingsService(bridge);
		const startup = new ApplicationStartupService(bridge, settings, library);

		expect(startup.health).toBe(bridge.health);
		expect(startup.appInfo).toBe(bridge.appInfo);
	});

	it("refreshRecentProjects delegates to the library", async () => {
		const bridge = makeBridge();
		const library = new ProjectLibraryService(bridge);
		const settings = new SettingsService(bridge);
		const startup = new ApplicationStartupService(bridge, settings, library);
		const spy = vi.spyOn(library, "refresh");

		await startup.refreshRecentProjects();

		expect(spy).toHaveBeenCalled();
	});
});
