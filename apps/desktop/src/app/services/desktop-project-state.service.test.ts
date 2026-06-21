import { describe, expect, it, vi } from "vitest";
import { ProjectSessionStore } from "../features/project-session/project-session.store";
import { ProjectLibraryService } from "../features/projects/project-library.service";
import { SettingsService } from "../features/settings/settings.service";
import { DesktopProjectStateService } from "./desktop-project-state.service";
import type { ProjectStatePayload } from "./desktop-bridge.service";

function mockBridge() {
	return {
		readRecentProjects: vi
			.fn()
			.mockResolvedValue({ ok: true, data: [] }),
		readSettings: vi
			.fn()
			.mockResolvedValue({ ok: true, data: { schemaVersion: 1, theme: "dark", projectLocation: "" } }),
		removeRecentProject: vi.fn().mockResolvedValue({ ok: true }),
		deleteProjectFile: vi.fn().mockResolvedValue({ ok: true }),
	} as unknown as InstanceType<typeof import("./desktop-bridge.service").DesktopBridgeService>;
}

function makeDeps(bridge = mockBridge()) {
	const session = new ProjectSessionStore();
	const library = new ProjectLibraryService(bridge);
	const settings = new SettingsService(bridge);
	return { bridge, session, library, settings };
}

const samplePayload: ProjectStatePayload = {
	projectName: "Demo",
	projectFilePath: "/projects/demo.chdg.json",
	sourcePath: "/songs/demo.mid",
	selectedTracks: [3],
	generationStatus: "not-generated",
	metadata: {},
};

describe("DesktopProjectStateService facade", () => {
	it("delegates createProject to persistence, refreshes recents, and returns the payload", async () => {
		const { session, library, settings } = makeDeps();
		const persistence = {
			createProject: vi.fn().mockResolvedValue({ ok: true, payload: samplePayload }),
		} as Pick<import("../features/project-session/project-persistence.service").ProjectPersistenceService, "createProject"> as unknown as import("../features/project-session/project-persistence.service").ProjectPersistenceService;
		const facade = new DesktopProjectStateService(session, library, settings, persistence);
		const refreshSpy = vi.spyOn(library, "refresh").mockResolvedValue(undefined);

		const result = await facade.createProject("Demo");

		expect(result).toEqual(samplePayload);
		expect(persistence.createProject).toHaveBeenCalledWith("Demo");
		expect(refreshSpy).toHaveBeenCalled();
	});

	it("returns null when createProject fails", async () => {
		const { session, library, settings } = makeDeps();
		const persistence = {
			createProject: vi
				.fn()
				.mockResolvedValue({ ok: false, error: { code: "create_failed", message: "boom" } }),
		} as unknown as import("../features/project-session/project-persistence.service").ProjectPersistenceService;
		const facade = new DesktopProjectStateService(session, library, settings, persistence);

		expect(await facade.createProject("Demo")).toBeNull();
	});

	it("delegates openProject to persistence and refreshes recents", async () => {
		const { session, library, settings } = makeDeps();
		const persistence = {
			openProject: vi.fn().mockResolvedValue({ ok: true, payload: samplePayload, missingPaths: [] }),
		} as unknown as import("../features/project-session/project-persistence.service").ProjectPersistenceService;
		const facade = new DesktopProjectStateService(session, library, settings, persistence);
		const refreshSpy = vi.spyOn(library, "refresh").mockResolvedValue(undefined);

		const result = await facade.openProject("/projects/demo.chdg.json");

		expect(result).toEqual(samplePayload);
		expect(persistence.openProject).toHaveBeenCalledWith("/projects/demo.chdg.json");
		expect(refreshSpy).toHaveBeenCalled();
	});

	it("resets the active session when deleting the currently open project file", async () => {
		const { session, library, settings } = makeDeps();
		const persistence = {} as unknown as import("../features/project-session/project-persistence.service").ProjectPersistenceService;
		const facade = new DesktopProjectStateService(session, library, settings, persistence);
		session.applyHydration({ ...samplePayload, generationStatus: "not-generated" });
		expect(session.projectFilePath()).toBe("/projects/demo.chdg.json");
		vi.spyOn(library, "deleteFile").mockResolvedValue(true);

		await facade.deleteProjectFile("/projects/demo.chdg.json");

		expect(session.projectFilePath()).toBeUndefined();
		expect(session.projectName()).toBe("Untitled");
	});

	it("composes state from the session, library, and settings boundaries", () => {
		const { session, library, settings } = makeDeps();
		const persistence = {} as unknown as import("../features/project-session/project-persistence.service").ProjectPersistenceService;
		const facade = new DesktopProjectStateService(session, library, settings, persistence);
		session.applyHydration({ ...samplePayload, generationStatus: "generated" });
		session.markDirty();
		library.recentProjects.set([{ name: "Recent", path: "/r.chdg.json", lastOpenedAt: "" }]);
		settings.settings.set({ schemaVersion: 1, theme: "dark", projectLocation: "/p" });

		const state = facade.state();

		expect(state.projectName).toBe("Demo");
		expect(state.dirty).toBe(true);
		expect(state.outputStatus).toBe("generated");
		expect(state.recentProjects).toHaveLength(1);
		expect(state.settings.projectLocation).toBe("/p");
	});
});
