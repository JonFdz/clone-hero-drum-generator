import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { ProjectSessionStore } from "./project-session.store";
import { ProjectPersistenceService } from "./project-persistence.service";
import type {
	DesktopBridgeService,
	ProjectStatePayload,
	SaveProjectResult,
} from "../../services/desktop-bridge.service";

type Bridge = Pick<
	DesktopBridgeService,
	| "createProject"
	| "openProject"
	| "openProjectFile"
	| "saveProject"
	| "saveProjectAs"
	| "saveProjectFile"
>;

const samplePayload: ProjectStatePayload = {
	project: {
		projectId: "project-demo",
		artist: "Artist",
		songName: "Demo",
		projectName: "Expert Drums",
		displayName: "Artist - Demo - Expert Drums",
	},
	projectName: "Demo",
	projectFilePath: "/p/demo.chdg.json",
	sourcePath: "/songs/demo.mid",
	audioPath: "/songs/demo.ogg",
	outputDir: "/out/demo",
	cover: { imagePath: "/cover.jpg" },
	sourceKind: "midi",
	selectedTracks: [3],
	metadata: { name: "Demo", artist: "Artist" },
	generationStatus: "generated",
};

function makeBridge(overrides: Partial<Bridge> = {}): Bridge {
	return {
		createProject: vi.fn().mockResolvedValue({ ok: true, data: samplePayload }),
		openProject: vi
			.fn()
			.mockResolvedValue({ ok: true, data: { ...samplePayload, missingPaths: [] } }),
		openProjectFile: vi.fn().mockResolvedValue({ path: "/p/demo.chdg.json", name: "demo" }),
		saveProject: vi.fn().mockResolvedValue({
			ok: true,
			data: { filePath: "/p/demo.chdg.json", project: {} } as SaveProjectResult,
		}),
		saveProjectAs: vi.fn().mockResolvedValue({
			ok: true,
			data: { filePath: "/p/demo2.chdg.json", project: {} } as SaveProjectResult,
		}),
		saveProjectFile: vi
			.fn()
			.mockResolvedValue({ path: "/p/demo2.chdg.json", name: "demo2" }),
		...overrides,
	} as unknown as Bridge;
}

function makeService(bridge: Bridge) {
	const session = new ProjectSessionStore();
	const persistence = new ProjectPersistenceService(
		bridge as unknown as DesktopBridgeService,
		session,
	);
	return { session, persistence };
}

describe("ProjectPersistenceService", () => {
	it("reports canonical project creation as unavailable without calling name-only IPC", async () => {
		const bridge = makeBridge();
		const { session, persistence } = makeService(bridge);

		const result = await persistence.createProject("Demo");

		expect(result).toEqual({
			ok: false,
			error: {
				code: "create_unavailable",
				message:
					"Canonical project creation and saving are not available in this legacy workflow.",
			},
		});
		expect(bridge.createProject).not.toHaveBeenCalled();
		expect(session.projectName()).toBe("Untitled");
		expect(session.isDirty()).toBe(false);
	});

	it("does not delegate creation even when a legacy bridge implementation exists", async () => {
		const bridge = makeBridge({
			createProject: vi.fn().mockResolvedValue({ ok: false, error: { message: "nope" } }),
		});
		const { session, persistence } = makeService(bridge);

		const result = await persistence.createProject("Demo");

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe("create_unavailable");
		expect(bridge.createProject).not.toHaveBeenCalled();
		expect(session.projectName()).toBe("Untitled");
	});

	it("opens a project by path, hydrates the session, and surfaces missing-path warnings", async () => {
		const bridge = makeBridge({
			openProject: vi.fn().mockResolvedValue({
				ok: true,
				data: { ...samplePayload, missingPaths: ["sourcePath", "coverImagePath"] },
			}),
		});
		const { session, persistence } = makeService(bridge);

		const result = await persistence.openProject("/p/demo.chdg.json");

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.missingPaths).toHaveLength(2);
		expect(result.missingPaths[0].kind).toBe("sourcePath");
		expect(session.missingPathWarnings()).toHaveLength(2);
		expect(bridge.openProject).toHaveBeenCalledWith("/p/demo.chdg.json");
	});

	it("openProjectFromPicker returns cancelled when the picker is dismissed", async () => {
		const bridge = makeBridge({ openProjectFile: vi.fn().mockResolvedValue(null) });
		const { persistence } = makeService(bridge);

		const result = await persistence.openProjectFromPicker();

		expect(result.ok).toBe(false);
		expect("cancelled" in result).toBe(true);
	});

	it("openProjectFromPicker opens the picked path", async () => {
		const bridge = makeBridge();
		const { session, persistence } = makeService(bridge);

		const result = await persistence.openProjectFromPicker();

		expect(result.ok).toBe(true);
		expect(session.projectName()).toBe("Demo");
		expect(bridge.openProjectFile).toHaveBeenCalled();
	});

	it("reports legacy state save as unavailable without manufacturing a canonical aggregate", async () => {
		const bridge = makeBridge();
		const { session, persistence } = makeService(bridge);

		const result = await persistence.saveProject(samplePayload);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "save_unavailable",
				message:
					"Canonical project creation and saving are not available in this legacy workflow.",
			},
		});
		expect(bridge.saveProject).not.toHaveBeenCalled();
		expect(session.projectFilePath()).toBeUndefined();
	});

	it("saveProjectAs returns an error outcome rather than a cancellation outcome", async () => {
		const bridge = makeBridge({ saveProjectFile: vi.fn().mockResolvedValue(null) });
		const { persistence } = makeService(bridge);

		const result = await persistence.saveProjectAs(samplePayload);

		expect(result.ok).toBe(false);
		expect("error" in result && result.error.code).toBe("save_as_unavailable");
		expect(result).not.toHaveProperty("cancelled");
		expect(bridge.saveProjectFile).not.toHaveBeenCalled();
		expect(bridge.saveProjectAs).not.toHaveBeenCalled();
	});

	it("reports Save As as unavailable without opening a legacy picker", async () => {
		const bridge = makeBridge();
		const { session, persistence } = makeService(bridge);

		const result = await persistence.saveProjectAs(samplePayload);

		expect(result).toEqual({
			ok: false,
			error: {
				code: "save_as_unavailable",
				message:
					"Canonical project creation and saving are not available in this legacy workflow.",
			},
		});
		expect(bridge.saveProjectFile).not.toHaveBeenCalled();
		expect(bridge.saveProjectAs).not.toHaveBeenCalled();
		expect(session.projectFilePath()).toBeUndefined();
	});

	it("saveProjectAs never opens the provisional save picker", async () => {
		const saveProjectFile = vi.fn().mockResolvedValue({ path: "/p/as.chdg.json", name: "as" });
		const bridge = makeBridge({ saveProjectFile });
		const { persistence } = makeService(bridge);

		await persistence.saveProjectAs(samplePayload);

		expect(saveProjectFile).not.toHaveBeenCalled();
		expect(bridge.saveProjectAs).not.toHaveBeenCalled();
	});

	it("saveProjectAs does not consult legacy picker cancellation", async () => {
		const saveProjectFile = vi.fn().mockResolvedValue(null);
		const bridge = makeBridge({ saveProjectFile });
		const { persistence } = makeService(bridge);

		const result = await persistence.saveProjectAs(samplePayload);

		expect(saveProjectFile).not.toHaveBeenCalled();
		expect(bridge.saveProjectAs).not.toHaveBeenCalled();
		expect(result.ok).toBe(false);
		expect("error" in result && result.error.code).toBe("save_as_unavailable");
	});

	it("does not inject or use the Angular Router", async () => {
		const source = readFileSync(
			new URL("./project-persistence.service.ts", import.meta.url),
			"utf8",
		);
		expect(source).not.toMatch(/import[^;]*\bRouter\b/);
		expect(source).not.toContain("navigateByUrl");
		expect(source).not.toContain("router.navigateByUrl");
	});
});
