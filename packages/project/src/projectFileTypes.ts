export type ChdgOutputStatus =
	| "not-generated"
	| "generated"
	| "needs-regenerate"
	| "failed";

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
};
