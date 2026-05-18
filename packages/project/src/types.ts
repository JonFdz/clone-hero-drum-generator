import type {
	DrumHit,
	SongSection,
	TempoEvent,
	TimeSignatureEvent,
} from "@chdg/core";

export type SourceKind = "midi" | "gpif";

export type ProjectIssueSeverity = "info" | "warning" | "error";

export type ProjectIssue = {
	severity: ProjectIssueSeverity;
	code: string;
	message: string;
	details?: Record<string, unknown>;
};

export type TrackCandidateStrength = "strong" | "weak" | "unknown";

export type TrackCandidateRole = "drums" | "unknown";

export type TrackCandidate = {
	index: number;
	name?: string;
	channel?: number;
	noteCount: number;
	strength: TrackCandidateStrength;
	role: TrackCandidateRole;
	reasons?: string[];
};

export type SourceInspectionResult = {
	sourceKind: SourceKind;
	sourcePath: string;
	resolution?: number;
	tempos: TempoEvent[] | unknown[];
	timeSignatures: TimeSignatureEvent[] | unknown[];
	sections: SongSection[] | unknown[];
	tracks: TrackCandidate[];
	issues: ProjectIssue[];
};

export type NormalizationHitPreview = {
	tick: number;
	piece: DrumHit["piece"];
	velocity: number;
	source: DrumHit["source"];
};

export type NormalizationPreview = {
	sourceKind: SourceKind;
	sourcePath: string;
	selectedTrack: number;
	hitCount: number;
	pieceSummary: Record<string, number>;
	firstHits: NormalizationHitPreview[];
	issues: ProjectIssue[];
};

export type SongMetadataInput = {
	name?: string;
	artist?: string;
	album?: string;
	year?: string;
	genre?: string;
	charter?: string;
};

export type GeneratePackageInput = SongMetadataInput & {
	sourcePath: string;
	outDir: string;
	trackIndex?: number;
	audioFile?: string;
	audioSource?: string;
	offsetMs?: number;
};

export type GeneratePackageResult = {
	sourceKind: SourceKind;
	sourcePath: string;
	selectedTrack: number;
	outputDir: string;
	hitCount: number;
	mappedNoteCount: number;
	deduplicatedCount: number;
	files: {
		chart: string;
		songIni: string;
		songOgg?: string;
	};
	issues: ProjectIssue[];
};

export type GenerateProgressEvent = {
	stage:
		| "normalize"
		| "map_notes"
		| "write_chart"
		| "write_song_ini"
		| "prepare_audio"
		| "complete";
	message: string;
	details?: Record<string, unknown>;
};

export type ValidatePackageReport = {
	ok: boolean;
	issues: ProjectIssue[];
	checks: Array<{ id: string; ok: boolean; message: string }>;
};

export type JsonEnvelope<T> =
	| { ok: true; data: T; issues: ProjectIssue[] }
	| {
			ok: false;
			error: { code: string; message: string };
			issues: ProjectIssue[];
	  };
