import { Injectable, signal } from "@angular/core";
import type {
	GeneratePackageInput,
	GeneratePackageResult,
	InspectSourceInput,
	JsonEnvelope,
	NormalizationPreview,
	NormalizeSelectionInput,
	SourceInspectionResult,
} from "@chdg/project";
import { unavailableDesktopHealth } from "./desktop-bridge-model";

export type DesktopAppInfo = {
	name: string;
	version: string;
	mode: "desktop";
};

export type DesktopHealthStatus = {
	ok: boolean;
	appVersion: string;
	mode: "desktop";
	checks: {
		bridge: boolean;
	};
	message?: string;
};

export type PickedPath = {
	path: string;
	name: string;
};

export type OpenOutputFolderResult = {
	opened: true;
};

const unavailableHealth = unavailableDesktopHealth();

@Injectable({ providedIn: "root" })
export class DesktopBridgeService {
	readonly appInfo = signal<DesktopAppInfo | null>(null);
	readonly health = signal<DesktopHealthStatus>(unavailableHealth);

	async loadStatus(): Promise<void> {
		const bridge = window.chdg;

		if (!bridge) {
			this.health.set(unavailableHealth);
			return;
		}

		try {
			const [appInfo, health] = await Promise.all([
				bridge.getAppInfo(),
				bridge.getHealth(),
			]);

			this.appInfo.set(appInfo);
			this.health.set(health);
		} catch (error) {
			this.health.set({
				...unavailableHealth,
				message:
					error instanceof Error ? error.message : unavailableHealth.message,
			});
		}
	}

	async pickSourceFile(): Promise<PickedPath | null> {
		return this.requireBridge().pickSourceFile();
	}

	async pickAudioFile(): Promise<PickedPath | null> {
		return this.requireBridge().pickAudioFile();
	}

	async pickOutputFolder(): Promise<PickedPath | null> {
		return this.requireBridge().pickOutputFolder();
	}

	async inspectSource(
		input: InspectSourceInput,
	): Promise<JsonEnvelope<SourceInspectionResult>> {
		return this.requireBridge().inspectSource(input);
	}

	async normalizeSelection(
		input: NormalizeSelectionInput,
	): Promise<JsonEnvelope<NormalizationPreview>> {
		return this.requireBridge().normalizeSelection(input);
	}

	async generatePackage(
		input: GeneratePackageInput & { overwriteKnownFiles?: boolean },
	): Promise<JsonEnvelope<GeneratePackageResult>> {
		return this.requireBridge().generatePackage(input);
	}

	async openOutputFolder(
		folderPath: string,
	): Promise<JsonEnvelope<OpenOutputFolderResult>> {
		return this.requireBridge().openOutputFolder(folderPath);
	}

	private requireBridge(): NonNullable<Window["chdg"]> {
		if (!window.chdg) {
			throw new Error(unavailableHealth.message);
		}
		return window.chdg;
	}
}
