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

	it("shares one in-flight initialization across concurrent calls", async () => {
		const bridge = makeBridge();
		const library = new ProjectLibraryService(bridge);
		const settings = new SettingsService(bridge);
		const startup = new ApplicationStartupService(bridge, settings, library);
		const settingsSpy = vi.spyOn(settings, "refresh").mockResolvedValue(undefined);
		const librarySpy = vi.spyOn(library, "refresh").mockResolvedValue(undefined);

		const [a, b, c] = await Promise.all([
			startup.initialize(),
			startup.initialize(),
			startup.initialize(),
		]);

		expect(settingsSpy).toHaveBeenCalledTimes(1);
		expect(librarySpy).toHaveBeenCalledTimes(1);
		// All concurrent callers resolve together.
		expect(a).toBeUndefined();
		expect(b).toBeUndefined();
		expect(c).toBeUndefined();
	});

	it("allows retrying a failed initialization", async () => {
		const bridge = makeBridge();
		const library = new ProjectLibraryService(bridge);
		const settings = new SettingsService(bridge);
		const startup = new ApplicationStartupService(bridge, settings, library);
		const settingsSpy = vi.spyOn(settings, "refresh");
		settingsSpy.mockRejectedValueOnce(new Error("settings down"));
		settingsSpy.mockResolvedValueOnce(undefined);
		const librarySpy = vi.spyOn(library, "refresh").mockResolvedValue(undefined);

		await expect(startup.initialize()).rejects.toThrow("settings down");

		// A failed bootstrap must not mark the service as started.
		await startup.initialize();

		expect(settingsSpy).toHaveBeenCalledTimes(2);
		expect(librarySpy).toHaveBeenCalledTimes(1);
	});

	it("remains idempotent after a successful initialization", async () => {
		const bridge = makeBridge();
		const library = new ProjectLibraryService(bridge);
		const settings = new SettingsService(bridge);
		const startup = new ApplicationStartupService(bridge, settings, library);
		const settingsSpy = vi.spyOn(settings, "refresh").mockResolvedValue(undefined);
		const librarySpy = vi.spyOn(library, "refresh").mockResolvedValue(undefined);

		await startup.initialize();
		await startup.initialize();
		await startup.initialize();

		expect(settingsSpy).toHaveBeenCalledTimes(1);
		expect(librarySpy).toHaveBeenCalledTimes(1);
	});

	it("does not hide unexpected bootstrap failures", async () => {
		const bridge = makeBridge();
		const library = new ProjectLibraryService(bridge);
		const settings = new SettingsService(bridge);
		const startup = new ApplicationStartupService(bridge, settings, library);
		vi.spyOn(library, "refresh").mockRejectedValue(new Error("unexpected"));

		await expect(startup.initialize()).rejects.toThrow("unexpected");
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
