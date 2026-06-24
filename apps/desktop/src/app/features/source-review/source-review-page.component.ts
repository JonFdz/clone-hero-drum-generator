import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	type OnInit,
	computed,
	inject,
	signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import type {
	MappingProfileApplyMode,
	ProjectIssue,
	ProjectMappingOverrides,
	TrackCandidate,
} from "@chdg/project/browser";
import { applyMappingProfile } from "@chdg/project/browser";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { SourceReviewOrchestratorService } from "../../services/source-review-orchestrator.service";
import { formatTrackNoteCount } from "../../services/track-note-count";
import {
	MAPPING_REVIEW_FILTERS,
	buildMappingReviewRowView,
	deriveDefaultMappingFilter,
	filterMappingReviewRows,
	mappingAttentionState,
	mappingReviewCounts,
	mappingReviewFilterCount,
	shouldExpandMappingReview,
	sourceSectionsLabel,
	type MappingReviewFilter,
	type MappingReviewRowView,
} from "../../services/source-review-model";
import { buildMappingRows, type MappingRow } from "./mapping.model";
import { MappingProfileService } from "./mapping-profile.service";
import { TextInputDialogComponent } from "../../shared/text-input-dialog/text-input-dialog.component";

const PIECES = [
	"kick",
	"snare",
	"hihat_closed",
	"hihat_open",
	"crash",
	"ride",
	"tom_high",
	"tom_mid",
	"tom_floor",
] as const;

type IssueSeverityCounts = {
	errors: number;
	warnings: number;
	info: number;
};

type DisplayIssue = ProjectIssue & {
	count: number;
};

const PIECE_LABELS: Record<string, string> = {
	kick: "Kick",
	snare: "Snare",
	hihat_closed: "Closed Hi-Hat",
	hihat_open: "Open Hi-Hat",
	crash: "Crash",
	ride: "Ride",
	tom_high: "High Tom",
	tom_mid: "Mid Tom",
	tom_floor: "Floor Tom",
};

function formatNumber(value: number): string {
	return new Intl.NumberFormat().format(value);
}

@Component({
	selector: "chdg-source-review-page",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, FormsModule, RouterModule, TextInputDialogComponent],
	templateUrl: "./source-review-page.component.html",
	styleUrl: "./source-review-page.component.css",
})
export class SourceReviewPageComponent implements OnInit {
	private readonly generateState = inject(DesktopGenerateStateService);
	readonly orchestrator = inject(SourceReviewOrchestratorService);
	private readonly mappingProfileService = inject(MappingProfileService);
	private readonly router = inject(Router);

	readonly state = this.generateState.state;
	readonly status = this.orchestrator.status;
	readonly pieces = PIECES;
	readonly mappingFilters = MAPPING_REVIEW_FILTERS;
	readonly profiles = this.mappingProfileService.profiles;

	readonly mappingUserOpen = signal(false);
	readonly issuesUserOpen = signal(false);
	readonly jsonOpen = signal(false);
	readonly selectedMappingFilter = signal<MappingReviewFilter | undefined>(
		undefined,
	);
	readonly applyMode: MappingProfileApplyMode = "merge";
	readonly showProfileDialog = signal(false);

	// --- Computed presentation state ---

	readonly sectionsLabel = computed(() =>
		sourceSectionsLabel(this.state().inspection),
	);

	readonly statusLabel = computed(() => {
		switch (this.status()) {
			case "analyzing":
				return "Analyzing source…";
			case "updating":
				return "Updating preview…";
			case "attention":
				return "Review needs attention";
			case "failed":
				return "Source review failed";
			case "up-to-date":
				return "Source review up to date";
			default:
				return this.state().sourcePath ? "Ready to review" : "Source required";
		}
	});

	readonly sourceKindLabel = computed(() => {
		const kind = this.state().sourceKind;
		return kind === "gpif"
			? "Guitar Pro"
			: kind === "midi"
				? "MIDI"
				: "Unknown";
	});

	readonly analyzedAt = computed(() => {
		const value =
			this.state().analysisCache?.normalizedAt ??
			this.state().analysisCache?.inspectedAt;
		return value ? new Date(value).toLocaleString() : "Not analyzed yet";
	});

	readonly mappingRows = computed<MappingRow[]>(() =>
		buildMappingRows(
			this.state().normalizationPreview?.mappingCandidates,
			this.state().mappingOverrides,
		),
	);

	readonly mappingReviewRows = computed<MappingReviewRowView[]>(() =>
		this.mappingRows().map((row) =>
			buildMappingReviewRowView(row, this.state().mappingOverrides),
		),
	);

	readonly mappingFilter = computed<MappingReviewFilter>(
		() =>
			this.selectedMappingFilter() ??
			deriveDefaultMappingFilter({
				rows: this.mappingRows(),
				overrides: this.state().mappingOverrides,
			}),
	);

	readonly filteredMappingRows = computed<MappingReviewRowView[]>(() =>
		filterMappingReviewRows(
			this.mappingRows(),
			this.state().mappingOverrides,
			this.mappingFilter(),
		),
	);

	readonly mappingFilterCountRecord = computed<Record<string, number>>(() => {
		const rows = this.mappingRows();
		const overrides = this.state().mappingOverrides;
		const record: Record<string, number> = {};
		for (const filter of MAPPING_REVIEW_FILTERS) {
			record[filter.id] = mappingReviewFilterCount({
				rows,
				overrides,
				filter: filter.id,
			});
		}
		return record;
	});

	readonly trackRows = computed<TrackCandidate[]>(() => {
		const selected = new Set(this.state().selectedTracks);
		return [...(this.state().inspection?.tracks ?? [])].sort((left, right) => {
			const leftSelected = selected.has(left.index) ? 0 : 1;
			const rightSelected = selected.has(right.index) ? 0 : 1;
			return leftSelected - rightSelected || left.index - right.index;
		});
	});

	readonly selectedTrackCountLabel = computed(() => {
		const count = this.state().selectedTracks.length;
		return count === 1 ? "1 track selected" : `${count} tracks selected`;
	});

	readonly reviewIssues = computed<ProjectIssue[]>(() => [
		...(this.state().inspection?.issues ?? []),
		...(this.state().normalizationPreview?.issues ?? []),
		...(this.state().normalizationPreview?.mergeSummary?.issues ?? []),
	]);

	readonly sortedReviewIssues = computed<ProjectIssue[]>(() => {
		const severityRank: Record<ProjectIssue["severity"], number> = {
			error: 0,
			warning: 1,
			info: 2,
		};
		return [...this.reviewIssues()].sort(
			(left, right) =>
				severityRank[left.severity] - severityRank[right.severity] ||
				left.code.localeCompare(right.code) ||
				left.message.localeCompare(right.message),
		);
	});

	readonly displayIssues = computed<DisplayIssue[]>(() => {
		const grouped = new Map<string, DisplayIssue>();
		for (const issue of this.sortedReviewIssues()) {
			const key = this.issueGroupKey(issue);
			const existing = grouped.get(key);
			if (existing) {
				existing.count += 1;
			} else {
				grouped.set(key, { ...issue, count: 1 });
			}
		}
		return Array.from(grouped.values());
	});

	readonly warningIssues = computed<DisplayIssue[]>(() =>
		this.displayIssues().filter((issue) => issue.severity !== "info"),
	);

	readonly infoIssues = computed<DisplayIssue[]>(() =>
		this.displayIssues().filter((issue) => issue.severity === "info"),
	);

	readonly issueSeverityCounts = computed<IssueSeverityCounts>(() =>
		this.reviewIssues().reduce(
			(counts, issue) => {
				if (issue.severity === "error") counts.errors += 1;
				else if (issue.severity === "warning") counts.warnings += 1;
				else counts.info += 1;
				return counts;
			},
			{ errors: 0, warnings: 0, info: 0 },
		),
	);

	readonly issueCount = computed(() => this.reviewIssues().length);

	readonly issuesSummary = computed(() => {
		const counts = this.issueSeverityCounts();
		if (this.issueCount() === 0) return "0 warnings · 0 issues · All good";
		const parts = [
			counts.errors > 0
				? `${counts.errors} ${counts.errors === 1 ? "error" : "errors"}`
				: undefined,
			counts.warnings > 0
				? `${counts.warnings} ${counts.warnings === 1 ? "warning" : "warnings"}`
				: undefined,
			counts.info > 0
				? `${counts.info} ${counts.info === 1 ? "info message" : "info messages"}`
				: undefined,
		].filter((part): part is string => Boolean(part));
		const suffix =
			counts.errors > 0 || counts.warnings > 0
				? "Review recommended"
				: "No blocking issues";
		return `${parts.join(" · ")} · ${suffix}`;
	});

	readonly issuePreview = computed<string | undefined>(() => {
		const issue = this.sortedReviewIssues().find(
			(item) => item.severity === "error" || item.severity === "warning",
		);
		if (issue) return `${issue.code} — ${issue.message}`;
		const info = this.issueSeverityCounts().info;
		return info > 0 ? `No blocking issues · ${info} info messages` : undefined;
	});

	readonly issuesNeedAttention = computed(() =>
		this.reviewIssues().some((issue) => issue.severity === "error"),
	);

	readonly issuesOpen = computed(
		() => this.issuesNeedAttention() || this.issuesUserOpen(),
	);

	readonly issuesActionLabel = computed(() =>
		this.issuesOpen() && !this.issuesNeedAttention()
			? "Hide Details"
			: "Review Issues",
	);

	readonly mappingReviewCounts = computed(() =>
		mappingReviewCounts({
			rows: this.mappingRows(),
			overrides: this.state().mappingOverrides,
		}),
	);

	readonly mappingAttentionState = computed(() =>
		mappingAttentionState({
			rows: this.mappingRows(),
			overrides: this.state().mappingOverrides,
		}),
	);

	readonly unknownCount = computed(() => this.mappingReviewCounts().unknown);
	readonly candidateCount = computed(
		() => this.mappingReviewCounts().candidates,
	);
	readonly ignoredKnownCount = computed(
		() => this.mappingReviewCounts().ignoredKnown,
	);

	readonly mappingNeedsAttention = computed(() => {
		const state = this.mappingAttentionState();
		return state === "manual-mapping-needed" || state === "review-recommended";
	});

	readonly mappingShouldOpen = computed(() =>
		shouldExpandMappingReview({
			normalizationPreview: this.state().normalizationPreview,
			overrides: this.state().mappingOverrides,
		}),
	);

	readonly mappingOpen = computed(
		() => this.mappingShouldOpen() || this.mappingUserOpen(),
	);

	readonly mappingActionLabel = computed(() =>
		this.mappingOpen() && !this.mappingShouldOpen()
			? "Hide Mapping"
			: "Review Mapping",
	);

	readonly mappingStatusLabel = computed(() => {
		switch (this.mappingAttentionState()) {
			case "manual-mapping-needed":
				return "Manual mapping needed";
			case "review-recommended":
				return "Review recommended";
			case "known-percussion-ignored":
				return "Known percussion ignored";
			default:
				return "Automatic mapping ready";
		}
	});

	readonly mappingSummary = computed(() => {
		const coverage = this.state().normalizationPreview?.mappingCoverage;
		const overrides = this.overrideCount();
		const pending = this.mappingReviewCounts();
		const pendingLabel =
			pending.unresolvedCandidates > 0 || pending.unresolvedUnknown > 0
				? ` · Pending review: ${formatNumber(pending.unresolvedCandidates)} candidates · ${formatNumber(pending.unresolvedUnknown)} unknown`
				: "";
		if (coverage) {
			return `Mapped events ${formatNumber(coverage.mappedEventCount)} · Candidate events ${formatNumber(coverage.candidateEventCount)} · Ignored known events ${formatNumber(coverage.ignoredEventCount)} · Unknown events ${formatNumber(coverage.unknownEventCount)} · ${overrides} overrides${pendingLabel}`;
		}
		const rows = this.mappingRows();
		const unknown = this.unknownCount();
		return `${rows.length - unknown} mapped sources · ${unknown} unknown · ${overrides} overrides${pendingLabel}`;
	});

	readonly mappingCoverageSummary = computed<string | undefined>(() => {
		const coverage = this.state().normalizationPreview?.mappingCoverage;
		if (!coverage) return undefined;
		return `Atlas ${coverage.atlasVersion} · Sources: ${coverage.mappedSourceCount} mapped, ${coverage.candidateSourceCount} candidates, ${coverage.ignoredSourceCount} ignored known, ${coverage.unknownSourceCount} unknown`;
	});

	readonly mappingEmptyFilterMessage = computed(() =>
		this.mappingFilter() === "needs-review"
			? "All mapping decisions are resolved."
			: "No rows match this filter.",
	);

	readonly overrideCount = computed(
		() => Object.keys(this.state().mappingOverrides).length,
	);

	readonly ignoredCount = computed(
		() =>
			Object.values(this.state().mappingOverrides).filter(
				(override) => override.target.kind === "ignore",
			).length,
	);

	readonly changedMappingCount = computed(
		() =>
			Object.values(this.state().mappingOverrides).filter(
				(override) => override.target.kind === "piece",
			).length,
	);

	readonly warningCount = computed(() => this.issueSeverityCounts().warnings);

	readonly duplicateLabel = computed(() => {
		const summary = this.state().normalizationPreview?.mergeSummary;
		if (!summary) return "0";
		const percent =
			summary.inputHitCount > 0
				? (summary.duplicateHitCount / summary.inputHitCount) * 100
				: 0;
		return `${formatNumber(summary.duplicateHitCount)} (${percent.toFixed(1)}%)`;
	});

	readonly pieceEntries = computed(() => {
		const summary = this.state().normalizationPreview?.pieceSummary ?? {};
		return [
			["kick", "Kick"],
			["snare", "Snare"],
			["hihat_closed", "Hi-Hat Closed"],
			["hihat_open", "Hi-Hat Open"],
			["crash", "Crash"],
			["ride", "Ride"],
			["toms", "Toms"],
		].map(([key, label]) => ({
			kind: key,
			label,
			count:
				key === "toms"
					? (summary["tom_high"] ?? 0) +
						(summary["tom_mid"] ?? 0) +
						(summary["tom_floor"] ?? 0)
					: (summary[key] ?? 0),
		}));
	});

	readonly trackNotesSummaryLabel = computed(() => {
		let knownTotal = 0;
		let knownCount = 0;
		let unknownCount = 0;
		for (const track of this.trackRows()) {
			if (
				typeof track.noteCount === "number" &&
				Number.isFinite(track.noteCount)
			) {
				knownTotal += track.noteCount;
				knownCount += 1;
			} else {
				unknownCount += 1;
			}
		}
		if (unknownCount === 0) return `Total Notes: ${formatNumber(knownTotal)}`;
		if (knownCount > 0) return `Known Notes: ${formatNumber(knownTotal)}`;
		return "Total Notes: n/a";
	});

	readonly profileStatus = computed(() =>
		this.profiles().length === 0
			? "No profile applied"
			: `${this.profiles().length} local profiles available`,
	);

	readonly analysisJson = computed(() =>
		JSON.stringify(
			{
				inspection: this.state().inspection,
				normalizationPreview: this.state().normalizationPreview,
				analysis: this.state().analysisCache,
			},
			null,
			2,
		),
	);

	readonly canContinue = computed(() =>
		Boolean(
			this.state().sourcePath &&
				this.state().selectedTracks.length > 0 &&
				this.state().normalizationPreview &&
				!this.state().errorMessage,
		),
	);

	// --- Lifecycle ---

	async ngOnInit(): Promise<void> {
		await this.mappingProfileService.loadProfiles();
		await this.orchestrator.reviewCurrentSource();
	}

	// --- Event handlers ---

	async refreshAnalysis(): Promise<void> {
		this.generateState.setAnalysisCache(undefined);
		await this.orchestrator.reviewCurrentSource();
	}

	async toggleTrack(trackIndex: number): Promise<void> {
		await this.orchestrator.toggleTrack(trackIndex);
	}

	isSelected(trackIndex: number): boolean {
		return this.state().selectedTracks.includes(trackIndex);
	}

	trackStatus(trackIndex: number, strength: string): string {
		if (this.isSelected(trackIndex)) {
			return this.state().selectedTracks.length === 1
				? "Auto-selected"
				: "Selected";
		}
		return strength === "weak" ? "Low confidence" : "Available";
	}

	setMappingFilter(filter: MappingReviewFilter): void {
		this.selectedMappingFilter.set(filter);
	}

	toggleMappingReview(): void {
		if (this.mappingOpen() && !this.mappingShouldOpen()) {
			this.mappingUserOpen.set(false);
			return;
		}
		this.mappingUserOpen.set(true);
	}

	toggleIssues(): void {
		if (this.issuesOpen() && !this.issuesNeedAttention()) {
			this.issuesUserOpen.set(false);
			return;
		}
		this.issuesUserOpen.set(true);
	}

	async setOverride(
		row: MappingRow | MappingReviewRowView,
		value: string,
	): Promise<void> {
		const current = { ...this.state().mappingOverrides };
		if (!value) {
			delete current[row.key];
			this.generateState.setMappingOverrides(current);
			await this.orchestrator.mappingChanged();
			return;
		}
		current[row.key] =
			value === "ignore"
				? {
						sourceKind: row.sourceKind ?? this.mappingSourceKind(row),
						key: row.key,
						target: { kind: "ignore" as const },
					}
				: {
						sourceKind: row.sourceKind ?? this.mappingSourceKind(row),
						key: row.key,
						target: {
							kind: "piece" as const,
							piece: value as (typeof PIECES)[number],
						},
					};
		this.generateState.setMappingOverrides(current as ProjectMappingOverrides);
		await this.orchestrator.mappingChanged();
	}

	async applySuggestion(row: MappingReviewRowView): Promise<void> {
		if (!row.suggestedPiece) return;
		await this.setOverride(row, row.suggestedPiece);
	}

	async ignoreRow(row: MappingReviewRowView): Promise<void> {
		await this.setOverride(row, "ignore");
	}

	async mapRow(row: MappingReviewRowView, piece: string): Promise<void> {
		if (!piece) return;
		await this.setOverride(row, piece);
	}

	async resetOverride(row: MappingReviewRowView): Promise<void> {
		await this.setOverride(row, "");
	}

	openProfileDialog(): void {
		this.showProfileDialog.set(true);
	}

	cancelProfileDialog(): void {
		this.showProfileDialog.set(false);
	}

	async confirmSaveProfile(name: string): Promise<void> {
		this.showProfileDialog.set(false);
		if (!name) return;
		const now = new Date().toISOString();
		await this.mappingProfileService.saveProfile({
			id: crypto.randomUUID(),
			name,
			overrides: { ...this.state().mappingOverrides },
			createdAt: now,
			updatedAt: now,
		});
	}

	async applyFirstProfile(): Promise<void> {
		const profile = this.profiles()[0];
		if (!profile) return;
		const result = applyMappingProfile({
			projectOverrides: this.state().mappingOverrides,
			profileOverrides: profile.overrides,
			mode: this.applyMode,
		});
		this.generateState.setMappingOverrides(result.overrides);
		this.mappingUserOpen.set(true);
		await this.orchestrator.mappingChanged();
	}

	// --- Pure formatting helpers (used by template, like pipes) ---

	pieceLabel(piece: string): string {
		return (
			PIECE_LABELS[piece] ??
			piece.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
		);
	}

	formatNumberValue(value: number): string {
		return formatNumber(value);
	}

	filePath(filePath: string | undefined): string {
		return filePath?.split(/[\\/]/).pop() ?? "";
	}

	confidenceLabel(value: string): string {
		return value === "unknown"
			? "N/A"
			: value.charAt(0).toUpperCase() + value.slice(1);
	}

	noteCountLabel(noteCount: number | null | undefined): string {
		return formatTrackNoteCount(noteCount);
	}

	// --- Per-item helpers (pure, take loop parameters) ---

	pieceOverrideValue(key: string): string {
		const override = this.state().mappingOverrides[key];
		return override?.target.kind === "piece" ? override.target.piece : "";
	}

	showIgnoreAction(row: MappingReviewRowView): boolean {
		if (row.action === "ignore" && !row.hasOverride) return false;
		return this.overrideLabelFor(row.key) !== "ignore";
	}

	overrideLabelFor(key: string): string {
		const override = this.state().mappingOverrides[key];
		if (!override) return "";
		return override.target.kind === "ignore" ? "ignore" : override.target.piece;
	}

	mappingSourceKind(row: MappingRow | MappingReviewRowView): "midi" | "gpif" {
		return row.sourceKind ?? (row.key.startsWith("gpif:") ? "gpif" : "midi");
	}

	isMappingIssue(issue: ProjectIssue): boolean {
		if (issue.severity === "info") return false;
		return (
			/unknown|unmapped|mapping/i.test(issue.code) ||
			/(unknown|unmapped|mapping|articulation|rimshot|side[- ]?stick|midi note|note \d+)/i.test(
				issue.message,
			) ||
			Boolean(
				issue.details?.["notes"] || issue.details?.["unknownArticulations"],
			)
		);
	}

	issueLabel(issue: DisplayIssue): string {
		const base = `${issue.severity} · ${issue.code}`;
		return issue.count > 1 ? `${base} · ${issue.count} similar` : base;
	}

	private issueGroupKey(issue: ProjectIssue): string {
		if (issue.severity !== "info")
			return `${issue.severity}:${issue.code}:${issue.message}`;
		return `${issue.severity}:${issue.code}:${issue.message.replace(/\d+/g, "#")}`;
	}

	async continueToGenerate(): Promise<void> {
		if (this.canContinue()) await this.router.navigateByUrl("/generate");
	}
}
