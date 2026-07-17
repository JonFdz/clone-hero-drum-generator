import { describe, expect, it } from "vitest";
import {
	desktopRuntimeStatusLabel,
	unavailableDesktopHealth,
} from "./desktop-bridge-model";

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

describe("desktop runtime status labels", () => {
	it("preserves production desktop wording", () => {
		expect(
			desktopRuntimeStatusLabel({
				ok: true,
				appVersion: "1.0.0",
				mode: "desktop",
				checks: { bridge: true },
			}),
		).toBe("Backend Connected");
	});

	it("identifies a healthy browser harness instead of unavailable backend", () => {
		expect(
			desktopRuntimeStatusLabel({
				ok: true,
				appVersion: "0.1.0-harness",
				mode: "browser-harness",
				checks: { bridge: true },
			}),
		).toBe("Browser Harness · Mock Data");
	});
});
