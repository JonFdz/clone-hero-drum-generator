import { Injectable, computed, inject, signal } from "@angular/core";
import type {
	ChdgProjectAnalysisCache,
	GeneratePackageInput,
	GeneratePackageResult,
	JsonEnvelope,
	NormalizationPreview,
	ProjectIssue,
	SourceInspectionResult,
	SourceKind,
	ProjectMappingOverrides,
} from "@chdg/project/browser";
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
	cover?: { imagePath?: string };
	metadata: DesktopMetadata;
	offsetMs?: number;
	inspection?: SourceInspectionResult;
	analysisCache?: ChdgProjectAnalysisCache;
	selectedTracks: number[];
	normalizationPreview?: NormalizationPreview;
	normalizationPreviewStale?: boolean;
	generationResult?: GeneratePackageResult;
	lastGeneratedAt?: string;
	outputFiles?: {
		chart?: string;
		songIni?: string;
		songOgg?: string;
		albumJpg?: string;
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

	constructor(
		projectState: DesktopProjectStateService = inject(
			DesktopProjectStateService,
		),
	) {
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
			analysisCache: undefined,
			normalizationPreview: undefined,
			normalizationPreviewStale: undefined,
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

	setSavedOutputDir(outputDir: string | undefined): void {
		this.patch({ outputDir });
	}

	setCoverImagePath(imagePath: string | undefined): void {
		this.patch({ cover: imagePath ? { imagePath } : undefined });
		this.projectState.markDirty();
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

		this.applyInspectionWithSelection(
			envelope,
			chooseDefaultTracks(envelope.data.tracks),
		);
	}

	applyInspectionWithSelection(
		envelope: JsonEnvelope<SourceInspectionResult>,
		selectedTracks: number[],
	): void {
		if (!envelope.ok) {
			this.applyError(envelope.error.message, envelope.issues);
			return;
		}

		this.patch({
			inspection: envelope.data,
			sourceKind: envelope.data.sourceKind,
			selectedTracks: [...selectedTracks].sort((a, b) => a - b),
			issues: envelope.issues,
			status: "ready-to-select-tracks",
			logs: appendLog(
				this.state().logs,
				`Inspection complete: ${envelope.data.tracks.length} track(s) found.`,
			),
			errorMessage: undefined,
		});
	}

	applyCachedInspection(inspection: SourceInspectionResult): void {
		this.patch({
			inspection,
			sourceKind: inspection.sourceKind,
			issues: inspection.issues,
			status: "ready-to-select-tracks",
			errorMessage: undefined,
		});
	}

	applySourceReviewCache(cache: ChdgProjectAnalysisCache): void {
		this.patch({
			analysisCache: cache,
			inspection: cache.inspection,
			sourceKind: cache.inspection.sourceKind,
			selectedTracks: [...cache.selectedTracks],
			normalizationPreview: cache.normalizationPreview,
			normalizationPreviewStale: false,
			issues: [
				...(cache.inspection.issues ?? []),
				...(cache.normalizationPreview?.issues ?? []),
			],
			status: cache.normalizationPreview
				? "ready-to-generate"
				: "ready-to-select-tracks",
			errorMessage: undefined,
		});
	}

	setAnalysisCache(analysisCache: ChdgProjectAnalysisCache | undefined): void {
		this.patch({ analysisCache });
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
			normalizationPreviewStale: false,
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
				albumJpg: envelope.data.files.albumJpg,
			},
			issues: envelope.issues,
			status: "generated",
			logs: appendLog(this.state().logs, "Generation completed successfully."),
			errorMessage: undefined,
		});
		this.projectState.markGenerated();
	}

	applyError(message: string, issues: ProjectIssue[] = []): void {
		const wasGenerating = this.state().status === "generating";
		this.patch({
			errorMessage: message,
			issues,
			status: "error",
			logs: appendLog(this.state().logs, `Error: ${message}`),
		});
		if (wasGenerating) {
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
				coverImagePath: state.cover?.imagePath,
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
		cover?: { imagePath?: string };
		sourceKind?: SourceKind;
		selectedTracks: number[];
		metadata: DesktopMetadata;
		offsetMs?: number;
		mappingOverrides?: ProjectMappingOverrides;
		analysis?: ChdgProjectAnalysisCache;
		generationResult?: GeneratePackageResult;
		lastGeneratedAt?: string;
		outputFiles?: {
			chart?: string;
			songIni?: string;
			songOgg?: string;
			albumJpg?: string;
		};
	}): void {
		const sourceKind =
			payload.sourceKind ??
			(payload.sourcePath
				? detectDesktopSourceKind(payload.sourcePath)
				: undefined);
		this.state.set({
			...initialState,
			sourcePath: payload.sourcePath,
			audioPath: payload.audioPath,
			outputDir: payload.outputDir,
			cover: payload.cover,
			sourceKind,
			selectedTracks: payload.selectedTracks,
			metadata: payload.metadata,
			offsetMs: payload.offsetMs,
			generationResult: payload.generationResult,
			lastGeneratedAt: payload.lastGeneratedAt,
			outputFiles: payload.outputFiles,
			mappingOverrides: payload.mappingOverrides ?? {},
			analysisCache: payload.analysis,
			inspection: payload.analysis?.inspection,
			normalizationPreview: payload.analysis?.normalizationPreview,
			normalizationPreviewStale: false,
			status:
				payload.generationResult || payload.outputFiles
					? "generated"
					: sourceKind
						? "ready-to-inspect"
						: "idle",
		});
	}

	buildProjectStatePayload(
		projectName: string,
		projectFilePath?: string,
	): import("./desktop-bridge.service").ProjectStatePayload {
		const state = this.state();
		return {
			projectName,
			projectFilePath,
			sourcePath: state.sourcePath,
			audioPath: state.audioPath,
			outputDir: state.outputDir,
			cover: state.cover,
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
			analysis: state.analysisCache,
		};
	}

	setMappingOverrides(mappingOverrides: ProjectMappingOverrides): void {
		this.patch({
			mappingOverrides: { ...mappingOverrides },
			normalizationPreviewStale: true,
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
