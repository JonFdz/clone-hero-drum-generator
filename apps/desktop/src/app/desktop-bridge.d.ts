import type {
	GeneratePackageInput,
	GeneratePackageResult,
	InspectSourceInput,
	JsonEnvelope,
	NormalizationPreview,
	NormalizeSelectionInput,
	SourceInspectionResult,
} from "@chdg/project";
import type {
	DesktopAppInfo,
	DesktopHealthStatus,
	OpenOutputFolderResult,
	PickedPath,
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
		};
	}
}
