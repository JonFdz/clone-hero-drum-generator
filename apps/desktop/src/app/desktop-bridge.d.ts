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
} from "@chdg/project/browser";
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
			pickCoverImageFile: () => Promise<PickedPath | null>;
			inspectSource: (
				input: InspectSourceInput,
			) => Promise<JsonEnvelope<SourceInspectionResult>>;
			normalizeSelection: (
				input: NormalizeSelectionInput,
			) => Promise<JsonEnvelope<NormalizationPreview>>;
			getSourceFingerprint: (
				sourcePath: string,
			) => Promise<JsonEnvelope<ChdgSourceFingerprint>>;
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
			createProject: (input: {
				projectName: string;
			}) => Promise<JsonEnvelope<ProjectStatePayload>>;
			saveProject: (
				input: ProjectStatePayload,
			) => Promise<JsonEnvelope<SaveProjectResult>>;
			saveProjectAs: (
				input: ProjectStatePayload & { filePath: string },
			) => Promise<JsonEnvelope<SaveProjectResult>>;
			openProject: (
				filePath: string,
			) => Promise<
				JsonEnvelope<ProjectStatePayload & { missingPaths: string[] }>
			>;
			readRecentProjects: () => Promise<JsonEnvelope<RecentProject[]>>;
			removeRecentProject: (projectPath: string) => Promise<JsonEnvelope<void>>;
			deleteProjectFile: (projectPath: string) => Promise<JsonEnvelope<void>>;
			getCoverImagePreviewUrl: (
				imagePath: string,
			) => Promise<JsonEnvelope<{ src: string }>>;
			readSettings: () => Promise<JsonEnvelope<DesktopSettings>>;
			writeSettings: (
				settings: DesktopSettings,
			) => Promise<JsonEnvelope<DesktopSettings>>;
			readMappingProfiles: () => Promise<
				JsonEnvelope<MappingOverrideProfile[]>
			>;
			saveMappingProfile: (
				profile: MappingOverrideProfile,
			) => Promise<JsonEnvelope<MappingOverrideProfile[]>>;
			deleteMappingProfile: (
				profileId: string,
			) => Promise<JsonEnvelope<MappingOverrideProfile[]>>;
			testFfmpeg: (input: string) => Promise<JsonEnvelope<FfmpegDiagnostic>>;
			getAudioPreviewSource: (input: {
				outputDir?: string;
				generatedSongOggPath?: string;
			}) => Promise<JsonEnvelope<AudioPreviewSource>>;
			getChartPreviewData: (input: {
				outputDir?: string;
				chartPath?: string;
				analysis?: ChdgProjectAnalysisCache;
			}) => Promise<JsonEnvelope<ChartPreviewData>>;
			applyChartOffset: (input: {
				outputDir: string;
				chartPath?: string;
				offsetMs: number;
			}) => Promise<JsonEnvelope<{ chartPath: string; offsetSeconds: number }>>;
		};
	}
}
