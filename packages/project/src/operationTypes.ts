import type { ProjectMappingOverrides } from "./mappingOverrides.js";

export type InspectSourceInput = {
	sourcePath: string;
	trackIndex?: number;
	drumsOnly?: boolean;
};

export type NormalizeSelectionInput = {
	sourcePath: string;
	trackIndex?: number;
	trackIndexes?: number[];
	mappingOverrides?: ProjectMappingOverrides;
};
