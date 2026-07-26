export const DRUM_PIECE = {
	KICK: "kick",
	SNARE: "snare",
	HIHAT_CLOSED: "hihat_closed",
	HIHAT_OPEN: "hihat_open",
	CRASH: "crash",
	RIDE: "ride",
	TOM_HIGH: "tom_high",
	TOM_MID: "tom_mid",
	TOM_FLOOR: "tom_floor",
	UNKNOWN: "unknown",
} as const;

export type DrumPiece = (typeof DRUM_PIECE)[keyof typeof DRUM_PIECE];
export type MidiDrumHitSource = { midiNote: number; trackIndex: number; trackName: string; channel: number };
export type GpifDrumHitSource = {
  kind: "gpif";
  trackIndex: number;
  trackName?: string;
  articulationKey?: string;
  rawArticulation?: string;
  noteName?: string;
  inputMidiNumbers?: number[];
  outputMidiNumber?: number;
  resolvedVia?: string;
  measureIndex?: number;
  beatIndex?: number;
  noteIndex?: number;
};
export type DrumHit = {
  tick: number;
  piece: DrumPiece;
  velocity: number;
  durationTicks: number;
  source: MidiDrumHitSource | GpifDrumHitSource;
};
export type CloneHeroDrumLane = "kick" | "red" | "yellow" | "blue" | "green";
export type CloneHeroDrumNote = { tick: number; lane: CloneHeroDrumLane; length: number; cymbal?: boolean; ghost?: boolean; accent?: boolean };
export type TempoEvent = { tick: number; bpm: number };
export type TimeSignatureEvent = { tick: number; numerator: number; denominator: number };
export type SongSection = { tick: number; name: string };
export type DrumChart = { resolution: number; offsetSeconds?: number; tempos: TempoEvent[]; timeSignatures: TimeSignatureEvent[]; sections: SongSection[]; expertDrums: CloneHeroDrumNote[] };

export const SOURCE_DOCUMENT_KIND = {
	MIDI: "midi",
	GPIF: "gpif",
} as const;

export type SourceDocumentKind =
	(typeof SOURCE_DOCUMENT_KIND)[keyof typeof SOURCE_DOCUMENT_KIND];

export interface MidiHitSourceIdentity {
	readonly kind: typeof SOURCE_DOCUMENT_KIND.MIDI;
	readonly trackIndex: number;
	readonly channel: number;
	readonly tick: number;
	readonly midiNote: number;
	readonly occurrenceIndex: number;
}

export interface GpifHitSourceIdentity {
	readonly kind: typeof SOURCE_DOCUMENT_KIND.GPIF;
	readonly trackIndex: number;
	readonly measureIndex: number;
	readonly voiceIndex: number;
	readonly beatIndex: number;
	readonly noteIndex: number;
	readonly articulationKey: string;
}

export type HitSourceIdentity =
	| MidiHitSourceIdentity
	| GpifHitSourceIdentity;

/** Readonly provenance snapshot persisted with the immutable imported hit. */
export interface PersistedMidiDrumHitSource {
	readonly midiNote: number;
	readonly trackIndex: number;
	readonly trackName: string;
	readonly channel: number;
}

/** Readonly provenance snapshot persisted with the immutable imported hit. */
export interface PersistedGpifDrumHitSource {
	readonly kind: typeof SOURCE_DOCUMENT_KIND.GPIF;
	readonly trackIndex: number;
	readonly trackName?: string;
	readonly articulationKey?: string;
	readonly rawArticulation?: string;
	readonly noteName?: string;
	readonly inputMidiNumbers?: readonly number[];
	readonly outputMidiNumber?: number;
	readonly resolvedVia?: string;
	readonly measureIndex?: number;
	readonly beatIndex?: number;
	readonly noteIndex?: number;
}

export type PersistedDrumHitSource =
	| PersistedMidiDrumHitSource
	| PersistedGpifDrumHitSource;

export interface ImportedDrumHit {
	readonly id: string;
	readonly tick: number;
	readonly detectedPiece: DrumPiece;
	readonly velocity: number;
	readonly durationTicks: number;
	readonly sourceMappingKey: string;
	readonly sourceIdentity: HitSourceIdentity;
	readonly source: PersistedDrumHitSource;
}
