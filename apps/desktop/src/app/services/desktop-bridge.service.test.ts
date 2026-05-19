import { describe, expect, it } from "vitest";
import { unavailableDesktopHealth } from "./desktop-bridge-model";

describe("DesktopBridgeService missing bridge fallback", () => {
	it("uses unavailable health when the preload bridge is missing", () => {
		expect(unavailableDesktopHealth()).toEqual({
			ok: false,
			appVersion: "unknown",
			mode: "desktop",
			checks: { bridge: false },
			message: "Desktop bridge unavailable",
		});
	});
});
