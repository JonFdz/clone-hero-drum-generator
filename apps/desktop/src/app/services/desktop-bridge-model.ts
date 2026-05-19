import type { DesktopHealthStatus } from "./desktop-bridge.service";

export function unavailableDesktopHealth(
	message = "Desktop bridge unavailable",
): DesktopHealthStatus {
	return {
		ok: false,
		appVersion: "unknown",
		mode: "desktop",
		checks: { bridge: false },
		message,
	};
}
