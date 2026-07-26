import type {
	DrumPiece,
	ImportedDrumHit,
	SongSection,
	SourceDocumentKind,
	TempoEvent,
	TimeSignatureEvent,
} from "@chdg/core";

export type ProjectId = string;
export type HitId = string;
export type SourceMappingKey = string;
export type ProjectInternalPath = string;
export type Sha256 = string;

export const CLONE_HERO_LANE = {
	KICK: "kick",
	RED: "red",
	YELLOW: "yellow",
	BLUE: "blue",
	GREEN: "green",
} as const;

export type CloneHeroLane =
	(typeof CLONE_HERO_LANE)[keyof typeof CLONE_HERO_LANE];

export interface CloneHeroTarget {
	readonly lane: CloneHeroLane;
	readonly cymbal: boolean;
}

export const MAPPING_CONFIDENCE = {
	HIGH: "high",
	MEDIUM: "medium",
	LOW: "low",
} as const;

export type MappingConfidence =
	(typeof MAPPING_CONFIDENCE)[keyof typeof MAPPING_CONFIDENCE];

export const SOURCE_MAPPING_STATUS = {
	MAPPED: "mapped",
	UNKNOWN: "unknown",
	IGNORED: "ignored",
} as const;

export type SourceMappingStatus =
	(typeof SOURCE_MAPPING_STATUS)[keyof typeof SOURCE_MAPPING_STATUS];

export interface SourceMappingDefinition {
	readonly key: SourceMappingKey;
	readonly sourceKind: SourceDocumentKind;
	readonly sourceLabel: string;
	readonly detectedPiece: DrumPiece;
	readonly defaultTarget?: CloneHeroTarget;
	readonly count: number;
	readonly confidence?: MappingConfidence;
	readonly status: SourceMappingStatus;
}

export interface PieceInterpretationOverride {
	readonly kind: "piece";
	readonly piece: Exclude<DrumPiece, "unknown">;
}

export interface IgnoreInterpretationOverride {
	readonly kind: "ignore";
}

export type InterpretationOverride =
	| PieceInterpretationOverride
	| IgnoreInterpretationOverride;

export interface ProjectMappings {
	readonly interpretationOverrides: Readonly<
		Record<SourceMappingKey, InterpretationOverride>
	>;
	readonly targetOverrides: Readonly<
		Record<SourceMappingKey, CloneHeroTarget>
	>;
}

export interface NoteCorrection {
	readonly hitId: HitId;
	readonly piece?: Exclude<DrumPiece, "unknown">;
	readonly target?: CloneHeroTarget;
	readonly accent?: boolean;
	readonly ghost?: boolean;
	readonly deleted?: true;
	readonly updatedAt: string;
}

export interface ChdgProjectIdentity {
	readonly projectId: ProjectId;
	readonly artist: string;
	readonly songName: string;
	readonly projectName: string;
	readonly createdAt: string;
	readonly updatedAt: string;
	readonly album?: string;
	readonly year?: string;
	readonly genre?: string;
	readonly charter?: string;
}

export interface ChdgImportSection {
	readonly selectedTrackIds: readonly number[];
	readonly sourceMappings: Readonly<
		Record<SourceMappingKey, SourceMappingDefinition>
	>;
	readonly importedAt: string;
	readonly importerVersion: string;
}

export interface ArchivedSourceAsset {
	relativePath: ProjectInternalPath;
	originalFileName: string;
	readonly sourceKind: SourceDocumentKind;
	readonly sha256: Sha256;
	readonly importedAt: string;
}

export interface InternalAudioAsset {
	readonly relativePath: "assets/song.ogg";
	readonly sha256: Sha256;
	durationMs?: number;
}

export interface InternalCoverAsset {
	readonly relativePath: "assets/album.jpg";
	readonly sha256: Sha256;
}

export interface ChdgAssetsSection {
	readonly source: ArchivedSourceAsset;
	readonly audio: InternalAudioAsset;
	cover?: InternalCoverAsset;
}

export interface ChdgSourceDocument {
	readonly resolution: number;
	tempos: readonly TempoEvent[];
	readonly timeSignatures: readonly TimeSignatureEvent[];
	readonly sections: readonly SongSection[];
	readonly hits: readonly ImportedDrumHit[];
}

export interface ChdgEditorState {
	readonly offsetMs: number;
}

export const EXPORT_STATUS = {
	NEVER_EXPORTED: "never-exported",
	CURRENT: "current",
	OUTDATED: "outdated",
	FAILED: "failed",
} as const;

export type ChdgExportStatus =
	(typeof EXPORT_STATUS)[keyof typeof EXPORT_STATUS];

export const MANAGED_EXPORT_FILE = {
	CHART: "notes.chart",
	METADATA: "song.ini",
	AUDIO: "song.ogg",
	COVER: "album.jpg",
} as const;

export type ManagedExportFileName =
	(typeof MANAGED_EXPORT_FILE)[keyof typeof MANAGED_EXPORT_FILE];

export interface ManagedFileMetadata {
	readonly sha256: Sha256;
	readonly sizeBytes: number;
	readonly writtenAt: string;
}

export interface ExportFingerprints {
	readonly sourceDocument?: Sha256;
	readonly mappings?: Sha256;
	readonly corrections?: Sha256;
	readonly metadata?: Sha256;
	readonly audio?: Sha256;
	readonly cover?: Sha256;
}

export interface ChdgExportState {
	readonly status: ChdgExportStatus;
	targetDirectory?: string;
	readonly lastSuccessfulAt?: string;
	readonly fingerprints?: ExportFingerprints;
	readonly managedFiles?: Readonly<
		Partial<Record<ManagedExportFileName, ManagedFileMetadata>>
	>;
}

export interface ChdgProjectFile {
	readonly schemaVersion: 1;
	readonly appVersion?: string;
	readonly project: ChdgProjectIdentity;
	readonly import: ChdgImportSection;
	readonly assets: ChdgAssetsSection;
	readonly sourceDocument: ChdgSourceDocument;
	mappings: ProjectMappings;
	corrections: Readonly<Record<HitId, NoteCorrection>>;
	readonly editor: ChdgEditorState;
	export: ChdgExportState;
}
