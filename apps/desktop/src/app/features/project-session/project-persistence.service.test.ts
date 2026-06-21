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
	it("creates a project, hydrates the session, and returns a typed success outcome", async () => {
		const bridge = makeBridge();
		const { session, persistence } = makeService(bridge);

		const result = await persistence.createProject("Demo");

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.payload).toEqual(samplePayload);
		expect(session.projectName()).toBe("Demo");
		expect(session.projectFilePath()).toBe("/p/demo.chdg.json");
		expect(session.isDirty()).toBe(false);
	});

	it("returns a typed error outcome when createProject fails", async () => {
		const bridge = makeBridge({
			createProject: vi.fn().mockResolvedValue({ ok: false, error: { message: "nope" } }),
		});
		const { session, persistence } = makeService(bridge);

		const result = await persistence.createProject("Demo");

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.code).toBe("create_failed");
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

	it("saves a project, hydrates the session from the saved file, and returns the saved payload", async () => {
		const bridge = makeBridge({
			saveProject: vi.fn().mockResolvedValue({
				ok: true,
				data: {
					filePath: "/p/saved.chdg.json",
					project: {
						project: { name: "Saved" },
						paths: { sourcePath: "/s.mid", audioPath: "/s.ogg", outputDir: "/o" },
						cover: { imagePath: "/c.jpg" },
						source: { sourceKind: "midi" },
						selection: { selectedTracks: [1] },
						metadata: {},
						generation: { offsetMs: 0, status: "not-generated" },
						mappingOverrides: {},
						analysis: undefined,
					},
				},
			}),
		});
		const { session, persistence } = makeService(bridge);

		const result = await persistence.saveProject(samplePayload);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.filePath).toBe("/p/saved.chdg.json");
		expect(result.payload.projectName).toBe("Saved");
		expect(session.projectFilePath()).toBe("/p/saved.chdg.json");
		expect(session.isDirty()).toBe(false);
	});

	it("saveProjectAs returns cancelled when the save picker is dismissed", async () => {
		const bridge = makeBridge({ saveProjectFile: vi.fn().mockResolvedValue(null) });
		const { persistence } = makeService(bridge);

		const result = await persistence.saveProjectAs(samplePayload);

		expect(result.ok).toBe(false);
		expect("cancelled" in result).toBe(true);
		expect(bridge.saveProjectAs).not.toHaveBeenCalled();
	});

	it("saveProjectAs picks a path, saves, and hydrates the session", async () => {
		const bridge = makeBridge({
			saveProjectFile: vi.fn().mockResolvedValue({ path: "/p/as.chdg.json", name: "as" }),
			saveProjectAs: vi.fn().mockResolvedValue({
				ok: true,
				data: {
					filePath: "/p/as.chdg.json",
					project: {
						project: { name: "As" },
						paths: { sourcePath: "/s.mid", audioPath: "/s.ogg", outputDir: "/o" },
						cover: { imagePath: "/c.jpg" },
						source: { sourceKind: "midi" },
						selection: { selectedTracks: [1] },
						metadata: {},
						generation: { offsetMs: 0, status: "not-generated" },
						mappingOverrides: {},
						analysis: undefined,
					},
				},
			}),
		});
		const { session, persistence } = makeService(bridge);

		const result = await persistence.saveProjectAs(samplePayload);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.filePath).toBe("/p/as.chdg.json");
		expect(bridge.saveProjectAs).toHaveBeenCalledWith(
			expect.objectContaining({ filePath: "/p/as.chdg.json" }),
		);
		expect(session.projectFilePath()).toBe("/p/as.chdg.json");
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
