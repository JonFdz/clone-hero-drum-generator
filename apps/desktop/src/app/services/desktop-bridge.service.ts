import { Injectable, signal } from "@angular/core";
import type {
	GeneratePackageInput,
	GeneratePackageResult,
	InspectSourceInput,
	JsonEnvelope,
	NormalizationPreview,
	NormalizeSelectionInput,
	SourceInspectionResult,
	ChdgProjectAnalysisCache,
	ChdgProjectFile,
	ChdgOutputStatus,
	ChdgSourceFingerprint,
	DesktopSettings,
	MappingOverrideProfile,
	RecentProject,
	ProjectMappingOverrides,
} from "@chdg/project/browser";
import { unavailableDesktopHealth } from "./desktop-bridge-model";

export const RUNTIME_MODE = {
	DESKTOP: "desktop",
	BROWSER_HARNESS: "browser-harness",
} as const;

export type RuntimeMode = (typeof RUNTIME_MODE)[keyof typeof RUNTIME_MODE];

export type DesktopAppInfo = {
	name: string;
	version: string;
	mode: RuntimeMode;
};

export type DesktopHealthStatus = {
	ok: boolean;
	appVersion: string;
	mode: RuntimeMode;
	checks: {
		bridge: boolean;
	};
	message?: string;
};

export type PickedPath = {
	path: string;
	name: string;
	fileUrl?: string;
};

export type OpenOutputFolderResult = {
	opened: true;
};

export type FfmpegDiagnostic = {
	available: boolean;
	version?: string;
	path?: string;
	message: string;
};

export type AudioPreviewSource = {
	src: string;
	sourceKind: "generated";
};

export type ChartPreviewSectionEvent = {
	tick: number;
	name: string;
	seconds: number;
	source?: "generated-chart";
};

export type ChartPreviewNoteEvent = {
	tick: number;
	lane: number;
	length: number;
	seconds: number;
	endSeconds: number;
};

export type ChartPreviewData = {
	resolution: number;
	offsetSeconds: number;
	hasAccurateTiming: boolean;
	limitations: string[];
	noteEvents: ChartPreviewNoteEvent[];
	sectionEvents: ChartPreviewSectionEvent[];
	timing: {
		resolution: number;
		offsetSeconds: number;
		hasAccurateTiming: boolean;
		tempos: Array<{
			tick: number;
			bpm: number;
			seconds: number;
			source: "generated-chart";
		}>;
		timeSignatures: Array<{
			tick: number;
			numerator: number;
			denominator: number;
			seconds: number;
			source: "generated-chart";
		}>;
		sections: ChartPreviewSectionEvent[];
		notes: {
			count: number;
			firstTick?: number;
			lastTick?: number;
			firstSeconds?: number;
			lastSeconds?: number;
		};
		diagnostics: Array<{
			severity: "info" | "warning" | "error";
			code: string;
			message: string;
			details?: Record<string, unknown>;
		}>;
		summary: {
			status: "ok" | "info" | "warning" | "error";
			label: string;
			errorCount: number;
			warningCount: number;
			infoCount: number;
			importantMessages: string[];
		};
	};
};

export type ApplyChartOffsetInput = {
	outputDir: string;
	chartPath?: string;
	offsetMs: number;
};

export type ProjectStatePayload = {
	projectName: string;
	projectFilePath?: string;
	sourcePath?: string;
	audioPath?: string;
	outputDir?: string;
	cover?: { imagePath?: string };
	sourceKind?: "midi" | "gpif";
	selectedTracks: number[];
	metadata: {
		name?: string;
		artist?: string;
		album?: string;
		year?: string;
		genre?: string;
		charter?: string;
	};
	offsetMs?: number;
	generationStatus: ChdgOutputStatus;
	lastGeneratedAt?: string;
	outputFiles?: {
		chart?: string;
		songIni?: string;
		songOgg?: string;
		albumJpg?: string;
	};
	mappingOverrides?: ProjectMappingOverrides;
	analysis?: ChdgProjectAnalysisCache;
};

export type SaveProjectResult = {
	filePath: string;
	project: ChdgProjectFile;
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

	async pickCoverImageFile(): Promise<PickedPath | null> {
		return this.requireBridge().pickCoverImageFile();
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

	async getSourceFingerprint(
		sourcePath: string,
	): Promise<JsonEnvelope<ChdgSourceFingerprint>> {
		return this.requireBridge().getSourceFingerprint(sourcePath);
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

	// Project persistence
	async saveProjectFile(
		projectName: string,
		currentPath?: string,
	): Promise<PickedPath | null> {
		return this.requireBridge().saveProjectFile(projectName, currentPath);
	}

	async openProjectFile(): Promise<PickedPath | null> {
		return this.requireBridge().openProjectFile();
	}

	async createProject(input: {
		projectName: string;
	}): Promise<JsonEnvelope<ProjectStatePayload>> {
		return this.requireBridge().createProject(input);
	}

	async saveProject(
		input: ProjectStatePayload,
	): Promise<JsonEnvelope<SaveProjectResult>> {
		return this.requireBridge().saveProject(input);
	}

	async saveProjectAs(
		input: ProjectStatePayload & { filePath: string },
	): Promise<JsonEnvelope<SaveProjectResult>> {
		return this.requireBridge().saveProjectAs(input);
	}

	async openProject(
		filePath: string,
	): Promise<JsonEnvelope<ProjectStatePayload & { missingPaths: string[] }>> {
		return this.requireBridge().openProject(filePath);
	}

	async readRecentProjects(): Promise<JsonEnvelope<RecentProject[]>> {
		return this.requireBridge().readRecentProjects();
	}

	async removeRecentProject(projectPath: string): Promise<JsonEnvelope<void>> {
		return this.requireBridge().removeRecentProject(projectPath);
	}

	async deleteProjectFile(projectPath: string): Promise<JsonEnvelope<void>> {
		return this.requireBridge().deleteProjectFile(projectPath);
	}

	async getCoverImagePreviewUrl(
		imagePath: string,
	): Promise<JsonEnvelope<{ src: string }>> {
		return this.requireBridge().getCoverImagePreviewUrl(imagePath);
	}

	async readSettings(): Promise<JsonEnvelope<DesktopSettings>> {
		return this.requireBridge().readSettings();
	}

	async writeSettings(
		settings: DesktopSettings,
	): Promise<JsonEnvelope<DesktopSettings>> {
		return this.requireBridge().writeSettings(settings);
	}

	async readMappingProfiles(): Promise<JsonEnvelope<MappingOverrideProfile[]>> {
		return this.requireBridge().readMappingProfiles();
	}

	async saveMappingProfile(
		profile: MappingOverrideProfile,
	): Promise<JsonEnvelope<MappingOverrideProfile[]>> {
		return this.requireBridge().saveMappingProfile(profile);
	}

	async deleteMappingProfile(
		profileId: string,
	): Promise<JsonEnvelope<MappingOverrideProfile[]>> {
		return this.requireBridge().deleteMappingProfile(profileId);
	}

	async testFfmpeg(input: string): Promise<JsonEnvelope<FfmpegDiagnostic>> {
		return this.requireBridge().testFfmpeg(input);
	}

	async getAudioPreviewSource(input: {
		outputDir?: string;
		generatedSongOggPath?: string;
	}): Promise<JsonEnvelope<AudioPreviewSource>> {
		return this.requireBridge().getAudioPreviewSource(input);
	}

	async getChartPreviewData(input: {
		outputDir?: string;
		chartPath?: string;
		analysis?: ChdgProjectAnalysisCache;
	}): Promise<JsonEnvelope<ChartPreviewData>> {
		return this.requireBridge().getChartPreviewData(input);
	}

	async applyChartOffset(
		input: ApplyChartOffsetInput,
	): Promise<JsonEnvelope<{ chartPath: string; offsetSeconds: number }>> {
		return this.requireBridge().applyChartOffset(input);
	}

	private requireBridge(): NonNullable<Window["chdg"]> {
		if (!window.chdg) {
			throw new Error(unavailableHealth.message);
		}
		return window.chdg;
	}
}
