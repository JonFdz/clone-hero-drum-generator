import { Injectable, inject, signal } from "@angular/core";
import type { DesktopSettings } from "@chdg/project/browser";
import {
	DesktopBridgeService,
	type FfmpegDiagnostic,
} from "../../services/desktop-bridge.service";

const initialSettings: DesktopSettings = {
	schemaVersion: 1,
	theme: "dark",
	projectLocation: "",
};

/**
 * Seed service for the Settings feature: owns persisted application settings
 * and FFmpeg diagnostics.
 *
 * Introduced by the #74 foundation to move settings/FFmpeg state out of the
 * active project session. The Settings page/feature is fully migrated in #75;
 * until then the legacy {@link DesktopProjectStateService} facade delegates
 * settings operations here.
 */
@Injectable({ providedIn: "root" })
export class SettingsService {
	private readonly bridge: DesktopBridgeService;

	readonly settings = signal<DesktopSettings>(initialSettings);
	readonly ffmpegDiagnostic = signal<FfmpegDiagnostic | undefined>(undefined);

	constructor(bridge: DesktopBridgeService = inject(DesktopBridgeService)) {
		this.bridge = bridge;
	}

	/** Reloads persisted settings from the desktop bridge. */
	async refresh(): Promise<void> {
		try {
			const envelope = await this.bridge.readSettings();
			if (envelope.ok) {
				this.settings.set(envelope.data);
			}
		} catch {
			// Keep defaults.
		}
	}

	/** Persists settings and updates the local signal. */
	async save(settings: DesktopSettings): Promise<void> {
		try {
			const envelope = await this.bridge.writeSettings(settings);
			if (envelope.ok) {
				this.settings.set(envelope.data);
			}
		} catch {
			// Ignore.
		}
	}

	/** Runs an FFmpeg diagnostic and stores the result. Returns the diagnostic. */
	async testFfmpeg(input: string): Promise<FfmpegDiagnostic | null> {
		try {
			const envelope = await this.bridge.testFfmpeg(input);
			if (envelope.ok) {
				this.ffmpegDiagnostic.set(envelope.data);
				return envelope.data;
			}
			const diagnostic: FfmpegDiagnostic = {
				available: false,
				message: envelope.error.message,
			};
			this.ffmpegDiagnostic.set(diagnostic);
			return diagnostic;
		} catch (e) {
			const diagnostic: FfmpegDiagnostic = {
				available: false,
				message: e instanceof Error ? e.message : "FFmpeg check failed.",
			};
			this.ffmpegDiagnostic.set(diagnostic);
			return diagnostic;
		}
	}
}
