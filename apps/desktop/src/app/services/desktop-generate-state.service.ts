import { Injectable, computed, inject, signal } from "@angular/core";
import type {
	GeneratePackageInput,
	GeneratePackageResult,
	JsonEnvelope,
	NormalizationPreview,
	ProjectIssue,
	SourceInspectionResult,
	SourceKind,
	ProjectMappingOverrides,
} from "@chdg/project";
import {
	chooseDefaultTracks,
	cleanMetadata,
	detectDesktopSourceKind,
	validateGenerateState,
} from "./desktop-generate-model";
import { DesktopProjectStateService } from "./desktop-project-state.service";

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
	lastGeneratedAt?: string;
	outputFiles?: {
		chart?: string;
		songIni?: string;
		songOgg?: string;
	};
	mappingOverrides: ProjectMappingOverrides;
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
	mappingOverrides: {},
	issues: [],
	logs: [],
	status: "idle",
};

@Injectable({ providedIn: "root" })
export class DesktopGenerateStateService {
	readonly state = signal<DesktopGenerateState>(initialState);
	private readonly projectState: DesktopProjectStateService;

	constructor(projectState: DesktopProjectStateService = inject(DesktopProjectStateService)) {
		this.projectState = projectState;
	}

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
		this.projectState.markNeedsRegenerate();
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
		this.projectState.markNeedsRegenerate();
	}

	setOutputDir(outputDir: string): void {
		this.patch({ outputDir });
		this.projectState.markNeedsRegenerate();
	}

	setMetadata(metadata: DesktopMetadata): void {
		this.patch({ metadata: { ...this.state().metadata, ...metadata } });
		this.projectState.markNeedsRegenerate();
	}

	setOffsetMsInput(value: string): void {
		const trimmed = value.trim();
		if (trimmed.length === 0) {
			this.patch({ offsetMs: undefined });
			this.projectState.markNeedsRegenerate();
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
		this.projectState.markNeedsRegenerate();
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
		this.projectState.markNeedsRegenerate();
	}

	setSelectedTracks(selectedTracks: number[]): void {
		this.patch({ selectedTracks: [...selectedTracks].sort((a, b) => a - b) });
		this.projectState.markNeedsRegenerate();
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
			this.projectState.markFailed();
			return;
		}

		this.patch({
			generationResult: envelope.data,
			lastGeneratedAt: new Date().toISOString(),
			outputFiles: {
				chart: envelope.data.files.chart,
				songIni: envelope.data.files.songIni,
				songOgg: envelope.data.files.songOgg,
			},
			issues: envelope.issues,
			status: "generated",
			logs: appendLog(this.state().logs, "Generation completed successfully."),
			errorMessage: undefined,
		});
		this.projectState.markGenerated();
	}

	applyError(message: string, issues: ProjectIssue[] = []): void {
		this.patch({
			errorMessage: message,
			issues,
			status: "error",
			logs: appendLog(this.state().logs, `Error: ${message}`),
		});
		if (this.state().status === "generating") {
			this.projectState.markFailed();
		}
	}

	buildNormalizeInput(): {
		sourcePath: string;
		trackIndex?: number;
		trackIndexes?: number[];
		mappingOverrides?: ProjectMappingOverrides;
	} | null {
		const state = this.state();
		if (!state.sourcePath || state.selectedTracks.length === 0) {
			return null;
		}
		const base = toTrackInput(
			{ sourcePath: state.sourcePath },
			state.selectedTracks,
		);
		return { ...base, mappingOverrides: state.mappingOverrides };
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
				mappingOverrides: state.mappingOverrides,
			},
			state.selectedTracks,
		);
	}

	reset(): void {
		this.state.set(initialState);
	}

	loadProjectState(payload: {
		sourcePath?: string;
		audioPath?: string;
		outputDir?: string;
		sourceKind?: SourceKind;
		selectedTracks: number[];
		metadata: DesktopMetadata;
		offsetMs?: number;
		mappingOverrides?: ProjectMappingOverrides;
		generationResult?: GeneratePackageResult;
		lastGeneratedAt?: string;
		outputFiles?: {
			chart?: string;
			songIni?: string;
			songOgg?: string;
		};
	}): void {
		const sourceKind = payload.sourceKind ?? (payload.sourcePath ? detectDesktopSourceKind(payload.sourcePath) : undefined);
		this.state.set({
			...initialState,
			sourcePath: payload.sourcePath,
			audioPath: payload.audioPath,
			outputDir: payload.outputDir,
			sourceKind,
			selectedTracks: payload.selectedTracks,
			metadata: payload.metadata,
			offsetMs: payload.offsetMs,
			generationResult: payload.generationResult,
			lastGeneratedAt: payload.lastGeneratedAt,
			outputFiles: payload.outputFiles,
			mappingOverrides: payload.mappingOverrides ?? {},
			status:
				payload.generationResult || payload.outputFiles
					? "generated"
					: sourceKind
						? "ready-to-inspect"
						: "idle",
		});
	}

	buildProjectStatePayload(projectName: string, projectFilePath?: string): import("./desktop-bridge.service").ProjectStatePayload {
		const state = this.state();
		return {
			projectName,
			projectFilePath,
			sourcePath: state.sourcePath,
			audioPath: state.audioPath,
			outputDir: state.outputDir,
			sourceKind: state.sourceKind,
			selectedTracks: state.selectedTracks,
			metadata: state.metadata,
			offsetMs: state.offsetMs,
			generationStatus: this.projectState.outputStatus(),
			lastGeneratedAt: state.lastGeneratedAt,
			outputFiles: state.generationResult
				? {
						chart: state.generationResult.files.chart,
						songIni: state.generationResult.files.songIni,
						songOgg: state.generationResult.files.songOgg,
				  }
				: state.outputFiles,
			mappingOverrides: state.mappingOverrides,
		};
	}

	setMappingOverrides(mappingOverrides: ProjectMappingOverrides): void {
		this.patch({
			mappingOverrides: { ...mappingOverrides },
			normalizationPreview: undefined,
		});
		this.projectState.markNeedsRegenerate();
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
