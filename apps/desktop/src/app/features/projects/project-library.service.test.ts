import { describe, expect, it, vi } from "vitest";
import { ProjectLibraryService } from "./project-library.service";
import type { DesktopBridgeService } from "../../services/desktop-bridge.service";

type Bridge = Pick<
	DesktopBridgeService,
	"readRecentProjects" | "removeRecentProject" | "deleteProjectFile"
>;

function makeBridge(overrides: Partial<Bridge> = {}): Bridge {
	return {
		readRecentProjects: vi.fn().mockResolvedValue({
			ok: true,
			data: [{ path: "/a.json", name: "A", lastOpenedAt: "" }],
		}),
		removeRecentProject: vi.fn().mockResolvedValue({ ok: true }),
		deleteProjectFile: vi.fn().mockResolvedValue({ ok: true }),
		...overrides,
	} as unknown as Bridge;
}

describe("ProjectLibraryService", () => {
	it("refresh loads recent projects into the signal", async () => {
		const bridge = makeBridge();
		const library = new ProjectLibraryService(bridge as unknown as DesktopBridgeService);

		await library.refresh();

		expect(library.recentProjects()).toEqual([
			{ path: "/a.json", name: "A", lastOpenedAt: "" },
		]);
	});

	it("refresh keeps the current list when the bridge fails", async () => {
		const bridge = makeBridge({
			readRecentProjects: vi.fn().mockRejectedValue(new Error("boom")),
		});
		const library = new ProjectLibraryService(bridge as unknown as DesktopBridgeService);
		library.recentProjects.set([{ path: "/old.json", name: "Old", lastOpenedAt: "" }]);

		await library.refresh();

		expect(library.recentProjects()).toHaveLength(1);
		expect(library.recentProjects()[0].name).toBe("Old");
	});

	it("remove calls the bridge and refreshes", async () => {
		const bridge = makeBridge();
		const library = new ProjectLibraryService(bridge as unknown as DesktopBridgeService);
		await library.refresh();

		await library.remove("/a.json");

		expect(bridge.removeRecentProject).toHaveBeenCalledWith("/a.json");
		expect(bridge.readRecentProjects).toHaveBeenCalledTimes(2);
	});

	it("deleteFile returns false when the bridge fails and keeps recents", async () => {
		const bridge = makeBridge({
			deleteProjectFile: vi.fn().mockResolvedValue({ ok: false, error: { message: "no" } }),
		});
		const library = new ProjectLibraryService(bridge as unknown as DesktopBridgeService);

		const ok = await library.deleteFile("/a.json");

		expect(ok).toBe(false);
	});

	it("deleteFile returns true and refreshes on success", async () => {
		const bridge = makeBridge();
		const library = new ProjectLibraryService(bridge as unknown as DesktopBridgeService);

		const ok = await library.deleteFile("/a.json");

		expect(ok).toBe(true);
		expect(bridge.deleteProjectFile).toHaveBeenCalledWith("/a.json");
	});
});
