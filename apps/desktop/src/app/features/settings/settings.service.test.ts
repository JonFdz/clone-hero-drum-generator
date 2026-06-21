import { describe, expect, it, vi } from "vitest";
import { SettingsService } from "./settings.service";
import type { DesktopBridgeService } from "../../services/desktop-bridge.service";

type Bridge = Pick<DesktopBridgeService, "readSettings" | "writeSettings" | "testFfmpeg">;

function makeBridge(overrides: Partial<Bridge> = {}): Bridge {
	return {
		readSettings: vi
			.fn()
			.mockResolvedValue({ ok: true, data: { schemaVersion: 1, theme: "dark", projectLocation: "/p" } }),
		writeSettings: vi
			.fn()
			.mockResolvedValue({ ok: true, data: { schemaVersion: 1, theme: "dark", projectLocation: "/p2" } }),
		testFfmpeg: vi
			.fn()
			.mockResolvedValue({ ok: true, data: { available: true, version: "7.0", message: "ok" } }),
		...overrides,
	} as unknown as Bridge;
}

describe("SettingsService", () => {
	it("refresh loads persisted settings", async () => {
		const bridge = makeBridge();
		const settings = new SettingsService(bridge as unknown as DesktopBridgeService);

		await settings.refresh();

		expect(settings.settings().projectLocation).toBe("/p");
	});

	it("refresh keeps defaults when the bridge fails", async () => {
		const bridge = makeBridge({
			readSettings: vi.fn().mockRejectedValue(new Error("boom")),
		});
		const settings = new SettingsService(bridge as unknown as DesktopBridgeService);

		await settings.refresh();

		expect(settings.settings().projectLocation).toBe("");
	});

	it("save persists and updates the local signal", async () => {
		const bridge = makeBridge();
		const settings = new SettingsService(bridge as unknown as DesktopBridgeService);

		await settings.save({ schemaVersion: 1, theme: "dark", projectLocation: "/p2" });

		expect(bridge.writeSettings).toHaveBeenCalled();
		expect(settings.settings().projectLocation).toBe("/p2");
	});

	it("testFfmpeg stores a successful diagnostic and returns it", async () => {
		const bridge = makeBridge();
		const settings = new SettingsService(bridge as unknown as DesktopBridgeService);

		const result = await settings.testFfmpeg("/usr/bin/ffmpeg");

		expect(result?.available).toBe(true);
		expect(settings.ffmpegDiagnostic()?.version).toBe("7.0");
	});

	it("testFfmpeg synthesizes an unavailable diagnostic on bridge error", async () => {
		const bridge = makeBridge({
			testFfmpeg: vi.fn().mockResolvedValue({ ok: false, error: { message: "missing" } }),
		});
		const settings = new SettingsService(bridge as unknown as DesktopBridgeService);

		const result = await settings.testFfmpeg("/x");

		expect(result?.available).toBe(false);
		expect(result?.message).toBe("missing");
		expect(settings.ffmpegDiagnostic()?.available).toBe(false);
	});
});
