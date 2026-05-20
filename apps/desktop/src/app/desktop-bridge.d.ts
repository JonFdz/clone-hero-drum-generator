import type {
	GeneratePackageInput,
	GeneratePackageResult,
	InspectSourceInput,
	JsonEnvelope,
	NormalizationPreview,
	NormalizeSelectionInput,
	SourceInspectionResult,
	ChdgProjectFile,
	ChdgOutputStatus,
	DesktopSettings,
	RecentProject,
} from "@chdg/project";
import type {
	DesktopAppInfo,
	DesktopHealthStatus,
	OpenOutputFolderResult,
	PickedPath,
	FfmpegDiagnostic,
	ProjectStatePayload,
	SaveProjectResult,
	AudioPreviewSource,
	ChartPreviewData,
} from "./services/desktop-bridge.service";

declare global {
	interface Window {
		chdg?: {
			getAppInfo: () => Promise<DesktopAppInfo>;
			getHealth: () => Promise<DesktopHealthStatus>;
			pickSourceFile: () => Promise<PickedPath | null>;
			pickAudioFile: () => Promise<PickedPath | null>;
			pickOutputFolder: () => Promise<PickedPath | null>;
			inspectSource: (
				input: InspectSourceInput,
			) => Promise<JsonEnvelope<SourceInspectionResult>>;
			normalizeSelection: (
				input: NormalizeSelectionInput,
			) => Promise<JsonEnvelope<NormalizationPreview>>;
			generatePackage: (
				input: GeneratePackageInput & { overwriteKnownFiles?: boolean },
			) => Promise<JsonEnvelope<GeneratePackageResult>>;
			openOutputFolder: (
				folderPath: string,
			) => Promise<JsonEnvelope<OpenOutputFolderResult>>;
			// Project persistence
			saveProjectFile: (
				projectName: string,
				currentPath?: string,
			) => Promise<PickedPath | null>;
			openProjectFile: () => Promise<PickedPath | null>;
			createProject: (
				input: { projectName: string },
			) => Promise<JsonEnvelope<ProjectStatePayload>>;
			saveProject: (
				input: ProjectStatePayload,
			) => Promise<JsonEnvelope<SaveProjectResult>>;
			saveProjectAs: (
				input: ProjectStatePayload & { filePath: string },
			) => Promise<JsonEnvelope<SaveProjectResult>>;
			openProject: (
				filePath: string,
			) => Promise<JsonEnvelope<ProjectStatePayload & { missingPaths: string[] }>>;
			readRecentProjects: () => Promise<JsonEnvelope<RecentProject[]>>;
			removeRecentProject: (
				projectPath: string,
			) => Promise<JsonEnvelope<void>>;
			readSettings: () => Promise<JsonEnvelope<DesktopSettings>>;
			writeSettings: (
				settings: DesktopSettings,
			) => Promise<JsonEnvelope<DesktopSettings>>;
			testFfmpeg: (input: string) => Promise<JsonEnvelope<FfmpegDiagnostic>>;
			getAudioPreviewSource: (input: {
				outputDir?: string;
				generatedSongOggPath?: string;
				selectedAudioPath?: string;
			}) => Promise<JsonEnvelope<AudioPreviewSource>>;
			getChartPreviewData: (input: {
				outputDir?: string;
				chartPath?: string;
			}) => Promise<JsonEnvelope<ChartPreviewData>>;
		};
	}
}
