import { Injectable, computed, signal } from "@angular/core";
import type {
	GeneratePackageInput,
	GeneratePackageResult,
	JsonEnvelope,
	NormalizationPreview,
	ProjectIssue,
	SourceInspectionResult,
	SourceKind,
} from "@chdg/project";
import {
	chooseDefaultTracks,
	cleanMetadata,
	detectDesktopSourceKind,
	validateGenerateState,
} from "./desktop-generate-model";

export type DesktopMetadata = {
	name?: string;
	artist?: string;
	album?: string;
	year?: string;
	genre?: string;
	charter?: string;
};

export type DesktopGenerateStatus =
	| "idle"
	| "ready-to-inspect"
	| "inspecting"
	| "ready-to-select-tracks"
	| "normalizing"
	| "ready-to-generate"
	| "generating"
	| "generated"
	| "error";

export type DesktopGenerateState = {
	sourcePath?: string;
	sourceKind?: SourceKind;
	audioPath?: string;
	outputDir?: string;
	metadata: DesktopMetadata;
	offsetMs?: number;
	inspection?: SourceInspectionResult;
	selectedTracks: number[];
	normalizationPreview?: NormalizationPreview;
	generationResult?: GeneratePackageResult;
	issues: ProjectIssue[];
	logs: string[];
	status: DesktopGenerateStatus;
	errorMessage?: string;
};

export type GenerateValidationResult = {
	ok: boolean;
	errors: string[];
};

const initialState: DesktopGenerateState = {
	metadata: {},
	selectedTracks: [],
	issues: [],
	logs: [],
	status: "idle",
};

@Injectable({ providedIn: "root" })
export class DesktopGenerateStateService {
	readonly state = signal<DesktopGenerateState>(initialState);

	readonly validation = computed(() => validateGenerateState(this.state()));
	readonly trackCandidates = computed(
		() => this.state().inspection?.tracks ?? [],
	);

	setSourcePath(sourcePath: string): void {
		const sourceKind = detectDesktopSourceKind(sourcePath);
		this.patch({
			sourcePath,
			sourceKind,
			inspection: undefined,
			normalizationPreview: undefined,
			generationResult: undefined,
			selectedTracks: [],
			issues: [],
			errorMessage: undefined,
			status: sourceKind ? "ready-to-inspect" : "error",
		});
		if (!sourceKind) {
			this.addIssue(
				"error",
				"UNSUPPORTED_SOURCE_TYPE",
				"Supported source files are .mid, .midi, and .gp.",
			);
		}
	}

	setAudioPath(audioPath: string): void {
		this.patch({ audioPath });
	}

	setOutputDir(outputDir: string): void {
		this.patch({ outputDir });
	}

	setMetadata(metadata: DesktopMetadata): void {
		this.patch({ metadata: { ...this.state().metadata, ...metadata } });
	}

	setOffsetMsInput(value: string): void {
		const trimmed = value.trim();
		if (trimmed.length === 0) {
			this.patch({ offsetMs: undefined });
			return;
		}

		const parsed = Number(trimmed);
		if (!Number.isFinite(parsed)) {
			this.patch({
				errorMessage: "Offset must be numeric if provided.",
				status: "error",
			});
			return;
		}

		this.patch({ offsetMs: parsed, errorMessage: undefined });
	}

	startInspecting(): void {
		this.patch({
			status: "inspecting",
			errorMessage: undefined,
			logs: appendLog(this.state().logs, "Inspecting source..."),
		});
	}

	applyInspection(envelope: JsonEnvelope<SourceInspectionResult>): void {
		if (!envelope.ok) {
			this.applyError(envelope.error.message, envelope.issues);
			return;
		}

		const candidates = chooseDefaultTracks(envelope.data.tracks);
		this.patch({
			inspection: envelope.data,
			sourceKind: envelope.data.sourceKind,
			selectedTracks: candidates,
			issues: envelope.issues,
			status: "ready-to-select-tracks",
			logs: appendLog(
				this.state().logs,
				`Inspection complete: ${envelope.data.tracks.length} track(s) found.`,
			),
			errorMessage: undefined,
		});
	}

	toggleTrack(trackIndex: number): void {
		const current = this.state().selectedTracks;
		const selectedTracks = current.includes(trackIndex)
			? current.filter((index) => index !== trackIndex)
			: [...current, trackIndex].sort((a, b) => a - b);
		this.patch({
			selectedTracks,
			normalizationPreview: undefined,
			generationResult: undefined,
		});
	}

	setSelectedTracks(selectedTracks: number[]): void {
		this.patch({ selectedTracks: [...selectedTracks].sort((a, b) => a - b) });
	}

	startNormalizing(): void {
		this.patch({
			status: "normalizing",
			errorMessage: undefined,
			logs: appendLog(this.state().logs, "Normalizing selected track(s)..."),
		});
	}

	applyNormalization(envelope: JsonEnvelope<NormalizationPreview>): void {
		if (!envelope.ok) {
			this.applyError(envelope.error.message, envelope.issues);
			return;
		}

		this.patch({
			normalizationPreview: envelope.data,
			issues: envelope.issues,
			status: "ready-to-generate",
			logs: appendLog(
				this.state().logs,
				`Normalization complete: ${envelope.data.hitCount} hit(s).`,
			),
			errorMessage: undefined,
		});
	}

	startGenerating(): void {
		this.patch({
			status: "generating",
			errorMessage: undefined,
			logs: appendLog(this.state().logs, "Generating Clone Hero package..."),
		});
	}

	applyGeneration(envelope: JsonEnvelope<GeneratePackageResult>): void {
		if (!envelope.ok) {
			this.applyError(envelope.error.message, envelope.issues);
			return;
		}

		this.patch({
			generationResult: envelope.data,
			issues: envelope.issues,
			status: "generated",
			logs: appendLog(this.state().logs, "Generation completed successfully."),
			errorMessage: undefined,
		});
	}

	applyError(message: string, issues: ProjectIssue[] = []): void {
		this.patch({
			errorMessage: message,
			issues,
			status: "error",
			logs: appendLog(this.state().logs, `Error: ${message}`),
		});
	}

	buildNormalizeInput(): {
		sourcePath: string;
		trackIndex?: number;
		trackIndexes?: number[];
	} | null {
		const state = this.state();
		if (!state.sourcePath || state.selectedTracks.length === 0) {
			return null;
		}
		return toTrackInput({ sourcePath: state.sourcePath }, state.selectedTracks);
	}

	buildGenerateInput(
		overwriteKnownFiles = false,
	): (GeneratePackageInput & { overwriteKnownFiles?: boolean }) | null {
		const state = this.state();
		const validation = validateGenerateState(state);
		if (
			!validation.ok ||
			!state.sourcePath ||
			!state.audioPath ||
			!state.outputDir
		) {
			return null;
		}

		return toTrackInput(
			{
				sourcePath: state.sourcePath,
				audioSource: state.audioPath,
				audioFile: "song.ogg",
				outDir: state.outputDir,
				offsetMs: state.offsetMs,
				...cleanMetadata(state.metadata),
				overwriteKnownFiles,
			},
			state.selectedTracks,
		);
	}

	reset(): void {
		this.state.set(initialState);
	}

	private patch(patch: Partial<DesktopGenerateState>): void {
		this.state.update((state) => ({ ...state, ...patch }));
	}

	private addIssue(
		severity: ProjectIssue["severity"],
		code: string,
		message: string,
	): void {
		this.state.update((state) => ({
			...state,
			issues: [...state.issues, { severity, code, message }],
			errorMessage: message,
		}));
	}
}

function toTrackInput<T extends { sourcePath: string }>(
	base: T,
	selectedTracks: number[],
): T & { trackIndex?: number; trackIndexes?: number[] } {
	if (selectedTracks.length === 1) {
		return { ...base, trackIndex: selectedTracks[0] };
	}
	return { ...base, trackIndexes: selectedTracks };
}

function appendLog(logs: string[], message: string): string[] {
	const timestamp = new Date().toLocaleTimeString();
	return [...logs, `${timestamp} ${message}`];
}
