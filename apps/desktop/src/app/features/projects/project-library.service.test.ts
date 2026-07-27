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
		expect(library.error()).toBe("boom");
		expect(library.loading()).toBe(false);
	});

	it("remove calls the bridge and refreshes", async () => {
		const bridge = makeBridge();
		const library = new ProjectLibraryService(bridge as unknown as DesktopBridgeService);
		await library.refresh();

		await library.remove("/a.json");

		expect(bridge.removeRecentProject).toHaveBeenCalledWith("/a.json");
		expect(bridge.readRecentProjects).toHaveBeenCalledTimes(2);
	});

	it("deleteFile remains unavailable without calling the physical-delete bridge", async () => {
		const bridge = makeBridge();
		const library = new ProjectLibraryService(bridge as unknown as DesktopBridgeService);
		library.recentProjects.set([
			{ path: "/a.json", name: "A", lastOpenedAt: "" },
		]);

		const ok = await library.deleteFile("/a.json");

		expect(ok).toBe(false);
		expect(bridge.deleteProjectFile).not.toHaveBeenCalled();
		expect(library.recentProjects()).toHaveLength(1);
		expect(library.error()).toBe(ProjectLibraryService.deleteUnavailableMessage);
	});
});
