export type * from "./types.js";
export type {
	MappingCandidate,
	ProjectMappingOverride,
	ProjectMappingOverrides,
	MappingOverrideTarget,
} from "./mappingOverrides.js";
export { applyMappingProfile } from "./mappingProfiles.js";
export type {
	MappingOverrideProfile,
	MappingOverrideProfileStore,
	MappingProfileApplyMode,
} from "./mappingProfiles.js";
export type { DesktopSettings, RecentProject } from "./settingsTypes.js";
export type {
	InspectSourceInput,
	NormalizeSelectionInput,
} from "./operationTypes.js";
export type * from "./projectFileTypes.js";
export type {
	ValidationCategory,
	ValidationFixAction,
	ValidationItem,
	ValidationSeverity,
	ValidationSummary,
} from "./validation.js";

export { MIDI_DRUM_NOTE_ATLAS_VERSION } from "@chdg/mappings";
