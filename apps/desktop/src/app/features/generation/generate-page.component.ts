import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	type OnInit,
	computed,
	inject,
	signal,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import type {
	GeneratePackageResult,
	ValidationItem,
	ValidationSummary,
} from "@chdg/project/browser";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { DesktopProjectStateService } from "../../services/desktop-project-state.service";
import { DesktopValidationService } from "../../services/desktop-validation.service";
import { GenerationService } from "./generation.service";
import { ConfirmationDialogComponent } from "../../shared/confirmation-dialog/confirmation-dialog.component";

type ChecklistFilter = "all" | ValidationItem["severity"];
type ConfigRowStatus = "ok" | "warning" | "missing";

type ConfigRow = {
	icon: string;
	label: string;
	value: string;
	status: ConfigRowStatus;
	route?: string;
};

type OutputFileRow = {
	icon: string;
	name: string;
	path?: string;
};

const severityRank: Record<ValidationItem["severity"], number> = {
	error: 0,
	warning: 1,
	info: 2,
};

function compactPath(value: string | undefined): string {
	if (!value) return "";
	const normalized = value.replace(/\\/g, "/");
	const parts = normalized.split("/").filter(Boolean);
	return parts.at(-1) ?? value;
}

function fallbackSongName(sourcePath: string | undefined): string {
	const fileName = compactPath(sourcePath);
	if (!fileName) return "From source filename";
	return fileName.replace(/\.[^.]+$/, "");
}

function formatCheckedAt(value: string): string {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

@Component({
	selector: "chdg-generate-page",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, RouterModule, ConfirmationDialogComponent],
	templateUrl: "./generate-page.component.html",
	styleUrl: "./generate-page.component.css",
})
export class GeneratePageComponent implements OnInit {
	private readonly generateState = inject(DesktopGenerateStateService);
	private readonly validationService = inject(DesktopValidationService);
	private readonly projectState = inject(DesktopProjectStateService);
	private readonly generationService = inject(GenerationService);
	private readonly router = inject(Router);

	readonly state = this.generateState.state;
	readonly project = this.projectState.state;
	readonly autosaveWarning = this.generationService.autosaveWarning;
	readonly checklistFilter = signal<ChecklistFilter>("all");
	readonly showOverwriteDialog = signal(false);
	private pendingOverwriteMessage = "";
	private readonly validationRun = signal(0);

	readonly summary = computed<ValidationSummary>(() => {
		this.validationRun();
		return this.validationService.validateNow();
	});

	readonly generationSteps = [
		"Parse Source",
		"Normalize Drums",
		"Merge Selected Tracks",
		"Write notes.chart",
		"Write song.ini",
		"Convert Audio to song.ogg",
		"Finalize Package",
	];

	// --- Computed presentation state ---

	readonly statusLabel = computed(() => {
		if (this.state().status === "generating") return "Generating…";
		if (this.state().generationResult) return "Generated";
		if (this.project().outputStatus === "failed") return "Failed";
		if (this.summary().errorCount > 0) return "Cannot generate yet";
		if (this.summary().warningCount > 0) return "Ready with warnings";
		return "Ready to generate";
	});

	readonly statusDetail = computed(() => {
		if (this.state().status === "generating")
			return "Package generation is running.";
		if (this.state().generationResult) {
			return `Completed: ${formatCheckedAt(this.state().lastGeneratedAt ?? this.summary().checkedAt)}`;
		}
		if (this.project().outputStatus === "failed")
			return "Generation failed. Review the log.";
		return `Last checked: ${formatCheckedAt(this.summary().checkedAt)}`;
	});

	readonly statusTone = computed<"success" | "warning" | "danger" | "running">(
		() => {
			if (this.state().status === "generating") return "running";
			if (this.state().generationResult) return "success";
			if (this.project().outputStatus === "failed") return "danger";
			if (this.summary().errorCount > 0) return "danger";
			if (this.summary().warningCount > 0) return "warning";
			return "success";
		},
	);

	readonly statusIcon = computed(() => {
		switch (this.statusTone()) {
			case "danger":
				return "!";
			case "warning":
				return "!";
			case "running":
				return "…";
			default:
				return "✓";
		}
	});

	readonly reportLabel = computed(() =>
		this.statusLabel() === "Generating…"
			? "Ready to generate"
			: this.statusLabel(),
	);

	readonly reportMessage = computed(() => {
		if (this.state().generationResult)
			return "Package generated successfully. Ready for preview.";
		if (this.summary().errorCount > 0)
			return "Fix blocking errors before generating.";
		if (this.summary().warningCount > 0)
			return "Warnings are present, but generation is allowed.";
		return "No blocking issues found. You can generate your Clone Hero package.";
	});

	readonly sortedChecklistItems = computed<ValidationItem[]>(() =>
		[...this.summary().items].sort(
			(a, b) => severityRank[a.severity] - severityRank[b.severity],
		),
	);

	readonly filteredChecklistItems = computed<ValidationItem[]>(() => {
		const filter = this.checklistFilter();
		return this.sortedChecklistItems().filter(
			(item) => filter === "all" || item.severity === filter,
		);
	});

	readonly hasOnlyInfoChecks = computed(() => {
		const summary = this.summary();
		return summary.errorCount === 0 && summary.warningCount === 0;
	});

	readonly configRows = computed<ConfigRow[]>(() => {
		const state = this.state();
		const metadata = state.metadata;
		const offset = state.offsetMs ?? 0;
		return [
			{
				icon: "▧",
				label: "Source File",
				value: compactPath(state.sourcePath) || "Not selected",
				status: state.sourcePath ? "ok" : "missing",
				route: "/source-review",
			},
			{
				icon: "♫",
				label: "Audio File",
				value: compactPath(state.audioPath) || "Not selected",
				status: state.audioPath ? "ok" : "missing",
				route: "/projects/details",
			},
			{
				icon: "♬",
				label: "Selected Tracks",
				value: state.selectedTracks.length
					? `${state.selectedTracks.length} track${state.selectedTracks.length === 1 ? "" : "s"}`
					: "None",
				status: state.selectedTracks.length > 0 ? "ok" : "missing",
				route: "/source-review",
			},
			{
				icon: "▭",
				label: "Output Folder",
				value: compactPath(state.outputDir) || "Not selected",
				status: state.outputDir ? "ok" : "missing",
				route: "/projects/details",
			},
			{
				icon: "◇",
				label: "Song",
				value: metadata.name || fallbackSongName(state.sourcePath),
				status: "ok",
				route: "/projects/details",
			},
			{
				icon: "♙",
				label: "Artist",
				value: metadata.artist || "Not set",
				status: metadata.artist ? "ok" : "warning",
				route: "/projects/details",
			},
			{
				icon: "▣",
				label: "Album",
				value: metadata.album || "Not set",
				status: "ok",
				route: "/projects/details",
			},
			{
				icon: "◴",
				label: "Offset",
				value: `${offset} ms`,
				status: "ok",
				route: "/projects/details",
			},
		];
	});

	readonly generationStepState = computed<
		"Pending" | "Running" | "Completed" | "Failed"
	>(() => {
		if (this.state().status === "generating") return "Running";
		if (this.project().outputStatus === "failed") return "Failed";
		if (this.state().generationResult) return "Completed";
		return "Pending";
	});

	readonly canStartGeneration = computed(
		() => this.state().status !== "generating" && this.summary().canGenerate,
	);

	readonly canOpenOutputFolder = computed(() =>
		Boolean(
			this.state().generationResult?.outputDir ?? this.state().outputDir,
		),
	);

	readonly canOpenPreview = computed(() =>
		Boolean(this.state().generationResult),
	);

	readonly generateActionLabel = computed(() =>
		this.state().generationResult ? "Regenerate" : "Start Generate",
	);

	// --- Lifecycle ---

	ngOnInit(): void {
		this.validationRun.update((value) => value + 1);
	}

	// --- Event handlers ---

	runValidation(): void {
		this.validationRun.update((value) => value + 1);
	}

	async generate(): Promise<void> {
		const outcome = await this.generationService.generate(false);
		if (outcome.ok) {
			this.runValidation();
		} else if ("needsOverwriteConfirmation" in outcome) {
			this.pendingOverwriteMessage = outcome.message;
			this.showOverwriteDialog.set(true);
		} else if (outcome.error) {
			this.generateState.applyError(outcome.error);
		}
	}

	async confirmOverwrite(): Promise<void> {
		this.showOverwriteDialog.set(false);
		const outcome = await this.generationService.generate(true);
		if (outcome.ok) {
			this.runValidation();
		} else if (!("needsOverwriteConfirmation" in outcome) && outcome.error) {
			this.generateState.applyError(outcome.error);
		}
	}

	cancelOverwrite(): void {
		this.showOverwriteDialog.set(false);
	}

	async openOutputFolder(): Promise<void> {
		await this.generationService.openOutputFolder();
	}

	async openPreview(): Promise<void> {
		if (!this.canOpenPreview()) return;
		await this.router.navigateByUrl("/preview");
	}

	// --- Per-item helpers ---

	outputFileRows(result: GeneratePackageResult): OutputFileRow[] {
		return [
			{ icon: "▧", name: "notes.chart", path: result.files.chart },
			{ icon: "▧", name: "song.ini", path: result.files.songIni },
			...(result.files.songOgg
				? [{ icon: "♫", name: "song.ogg", path: result.files.songOgg }]
				: []),
		];
	}

	compactPath(value: string | undefined): string {
		return compactPath(value);
	}

	formatCheckedAt(value: string): string {
		return formatCheckedAt(value);
	}

	statusGlyph(status: ConfigRowStatus): string {
		if (status === "missing") return "×";
		if (status === "warning") return "⚠";
		return "✓";
	}

	severityIcon(severity: ValidationItem["severity"]): string {
		if (severity === "error") return "⚠";
		if (severity === "warning") return "⚠";
		return "ⓘ";
	}
}
