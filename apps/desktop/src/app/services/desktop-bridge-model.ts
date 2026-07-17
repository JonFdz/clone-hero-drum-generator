import type { DesktopHealthStatus } from "./desktop-bridge.service";

export function desktopRuntimeStatusLabel(
	health: DesktopHealthStatus,
): string {
	if (!health.ok) return "Backend Unavailable";
	return health.mode === "browser-harness"
		? "Browser Harness · Mock Data"
		: "Backend Connected";
}

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
