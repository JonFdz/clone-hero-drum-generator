import type { NormalizationPreview, SourceInspectionResult } from "./types.js";

export type ChdgOutputStatus =
	| "not-generated"
	| "generated"
	| "needs-regenerate"
	| "failed";

export type ChdgSourceFingerprint = {
	path: string;
	sizeBytes?: number;
	mtimeMs?: number;
};

export type ChdgProjectAnalysisCache = {
	schemaVersion: 1;
	sourceFingerprint: ChdgSourceFingerprint;
	mappingFingerprint: string;
	selectedTracks: number[];
	inspectedAt: string;
	normalizedAt?: string;
	inspection: SourceInspectionResult;
	normalizationPreview?: NormalizationPreview;
};

export type ChdgProjectFile = {
	schemaVersion: number;
	appVersion?: string;
	project: {
		name: string;
		createdAt: string;
		updatedAt: string;
	};
	paths: {
		sourcePath?: string;
		audioPath?: string;
		outputDir?: string;
	};
	cover?: {
		imagePath?: string;
	};
	source?: {
		sourceKind?: "midi" | "gpif";
		inspectionSummary?: unknown;
	};
	selection: {
		selectedTracks: number[];
	};
	metadata: {
		name?: string;
		artist?: string;
		album?: string;
		year?: string;
		genre?: string;
		charter?: string;
	};
	generation: {
		offsetMs?: number;
		status: ChdgOutputStatus;
		lastGeneratedAt?: string;
		outputFiles?: {
			chart?: string;
			songIni?: string;
			songOgg?: string;
		};
		lastResultSummary?: unknown;
	};
	settings?: Record<string, unknown>;
	mappingOverrides?: Record<string, unknown>;
	analysis?: ChdgProjectAnalysisCache;
};
