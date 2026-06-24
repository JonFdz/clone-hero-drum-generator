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
	MappingOverrideProfile,
	MappingProfileApplyMode,
	ProjectIssue,
	ProjectMappingOverrides,
} from "@chdg/project/browser";
import { applyMappingProfile } from "@chdg/project/browser";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { SourceReviewOrchestratorService } from "../../services/source-review-orchestrator.service";
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
import {
	APPLY_MODE_OPTIONS,
	type ApplyModeOption,
	type CombinedSummaryView,
	type DisplayIssueView,
	type MappingFilterOption,
	type MappingProfileView,
	type MappingReviewRowViewWithControls,
	type PieceSummaryEntry,
	type SelectedSourceView,
	type SummaryFact,
	type TrackRowView,
} from "./source-review-view.model";
import {
	MAPPING_PIECE_OPTIONS,
	MAPPING_PIECES,
	compactFileName,
	confidenceLabel,
	issueGroupKey,
	issueLabel,
	isMappingIssue,
	mappingSourceKind,
	noteCountLabel,
} from "./source-review-format.util";
import { ConfirmationDialogComponent } from "../../shared/confirmation-dialog/confirmation-dialog.component";
import { ProfileMetadataDialogComponent } from "./components/profile-metadata-dialog.component";
import { SourceReviewSelectedSourceComponent } from "./components/source-review-selected-source.component";
import { SourceReviewSummariesComponent } from "./components/source-review-summaries.component";
import { SourceReviewTrackListComponent } from "./components/source-review-track-list.component";
import { SourceReviewMappingReviewComponent } from "./components/source-review-mapping-review.component";
import { SourceReviewMappingProfilesComponent } from "./components/source-review-mapping-profiles.component";
import { SourceReviewIssuesComponent } from "./components/source-review-issues.component";
import { SourceReviewAdvancedComponent } from "./components/source-review-advanced.component";
import { SourceReviewActionAreaComponent } from "./components/source-review-action-area.component";

type IssueSeverityCounts = { errors: number; warnings: number; info: number };

const severityRank: Record<ProjectIssue["severity"], number> = {
	error: 0,
	warning: 1,
	info: 2,
};

@Component({
	selector: "chdg-source-review-page",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		ConfirmationDialogComponent,
		ProfileMetadataDialogComponent,
		SourceReviewSelectedSourceComponent,
		SourceReviewSummariesComponent,
		SourceReviewTrackListComponent,
		SourceReviewMappingReviewComponent,
		SourceReviewMappingProfilesComponent,
		SourceReviewIssuesComponent,
		SourceReviewAdvancedComponent,
		SourceReviewActionAreaComponent,
	],
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
	readonly profiles = this.mappingProfileService.profiles;
	readonly profileError = this.mappingProfileService.profileError;
	readonly pieces = MAPPING_PIECES;
	readonly pieceOptions = MAPPING_PIECE_OPTIONS;
	readonly mappingFilters: MappingFilterOption[] = MAPPING_REVIEW_FILTERS.map(
		(f) => ({ id: f.id, label: f.label }),
	);
	readonly applyModeOptions: ApplyModeOption[] = APPLY_MODE_OPTIONS;

	readonly selectedProfileId = signal<string | null>(null);
	readonly applyMode = signal<MappingProfileApplyMode>("merge");
	readonly jsonOpen = signal(false);
	readonly mappingUserOpen = signal(false);
	readonly issuesUserOpen = signal(false);
	readonly selectedMappingFilter = signal<MappingReviewFilter | undefined>(
		undefined,
	);

	// Profile dialog state
	readonly showCreateProfileDialog = signal(false);
	readonly showEditProfileDialog = signal(false);
	readonly showDeleteProfileConfirm = signal(false);

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

	readonly selectedSource = computed<SelectedSourceView>(() => ({
		sourceKind: this.state().sourceKind,
		sourceKindLabel: this.sourceKindLabel(),
		fileName: compactFileName(this.state().sourcePath),
		filePath: this.state().sourcePath ?? "",
		analyzedAt:
			(this.state().analysisCache?.normalizedAt ??
			this.state().analysisCache?.inspectedAt)
				? new Date(
						this.state().analysisCache?.normalizedAt ??
							this.state().analysisCache?.inspectedAt ??
							"",
					).toLocaleString()
				: "Not analyzed yet",
	}));

	readonly sourceSummaryFacts = computed<SummaryFact[]>(() => {
		const inspection = this.state().inspection;
		return [
			{ icon: "▧", label: "Source Type", value: this.sourceKindLabel() },
			{
				icon: "♬",
				label: "Resolution (PPQ)",
				value: String(inspection?.resolution ?? "n/a"),
			},
			{
				icon: "⌁",
				label: "Tempo Count",
				value: String(inspection?.tempos?.length ?? "n/a"),
			},
			{
				icon: "♯",
				label: "Time Signatures",
				value: String(inspection?.timeSignatures?.length ?? "n/a"),
			},
			{ icon: "◴", label: "Sections", value: this.sectionsLabel() },
			{
				icon: "☷",
				label: "Total Tracks",
				value: String(inspection?.tracks?.length ?? "n/a"),
			},
		];
	});

	readonly combinedSummary = computed<CombinedSummaryView>(() => {
		const preview = this.state().normalizationPreview;
		const summary = preview?.mergeSummary;
		const duplicatePercent =
			summary && summary.inputHitCount > 0
				? (summary.duplicateHitCount / summary.inputHitCount) * 100
				: 0;
		return {
			selectedTracks: this.state().selectedTracks.length,
			hitCountLabel: preview ? String(preview.hitCount) : "0",
			duplicatesLabel: summary
				? `${summary.duplicateHitCount} (${duplicatePercent.toFixed(1)}%)`
				: "0",
			unknownCountLabel: String(this.unknownCount()),
			warningCountLabel: `${this.warningCount()} issues`,
		};
	});

	readonly pieceEntries = computed<PieceSummaryEntry[]>(() => {
		const summary = this.state().normalizationPreview?.pieceSummary ?? {};
		const fmt = (n: number) => new Intl.NumberFormat().format(n);
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
			count: fmt(
				key === "toms"
					? (summary["tom_high"] ?? 0) +
							(summary["tom_mid"] ?? 0) +
							(summary["tom_floor"] ?? 0)
					: (summary[key as keyof typeof summary] ?? 0),
			),
		}));
	});

	readonly buildingMessage = computed(() =>
		this.state().status === "normalizing"
			? "Building normalized preview…"
			: "Waiting for normalized preview…",
	);

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

	readonly filteredMappingRows = computed<MappingReviewRowViewWithControls[]>(
		() =>
			filterMappingReviewRows(
				this.mappingRows(),
				this.state().mappingOverrides,
				this.mappingFilter(),
			).map((row) => ({
				...row,
				selectValue: this.overrideSelectValue(row.key),
				selectOptions: this.pieceOptions,
				showIgnoreAction: this.showIgnoreAction(row),
			})),
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

	readonly trackRows = computed<TrackRowView[]>(() => {
		const selected = new Set(this.state().selectedTracks);
		return [...(this.state().inspection?.tracks ?? [])]
			.sort((left, right) => {
				const leftSelected = selected.has(left.index) ? 0 : 1;
				const rightSelected = selected.has(right.index) ? 0 : 1;
				return leftSelected - rightSelected || left.index - right.index;
			})
			.map((track) => ({
				index: track.index,
				name: track.name || "Untitled",
				noteCountLabel: noteCountLabel(track.noteCount),
				confidenceLabel: confidenceLabel(track.strength),
				confidenceClass: track.strength,
				statusLabel: this.trackStatusLabel(
					track.index,
					selected.has(track.index),
				),
				statusClass: selected.has(track.index) ? "auto" : track.strength,
				selected: selected.has(track.index),
			}));
	});

	readonly selectedTrackCountLabel = computed(() => {
		const count = this.state().selectedTracks.length;
		return count === 1 ? "1 track selected" : `${count} tracks selected`;
	});

	readonly trackNotesSummaryLabel = computed(() => {
		let knownTotal = 0;
		let knownCount = 0;
		let unknown = 0;
		for (const track of this.trackRows()) {
			const noteCount = this.state().inspection?.tracks?.find(
				(t) => t.index === track.index,
			)?.noteCount;
			if (typeof noteCount === "number" && Number.isFinite(noteCount)) {
				knownTotal += noteCount;
				knownCount += 1;
			} else {
				unknown += 1;
			}
		}
		if (unknown === 0)
			return `Total Notes: ${new Intl.NumberFormat().format(knownTotal)}`;
		if (knownCount > 0)
			return `Known Notes: ${new Intl.NumberFormat().format(knownTotal)}`;
		return "Total Notes: n/a";
	});

	readonly reviewIssues = computed<ProjectIssue[]>(() => [
		...(this.state().inspection?.issues ?? []),
		...(this.state().normalizationPreview?.issues ?? []),
		...(this.state().normalizationPreview?.mergeSummary?.issues ?? []),
	]);

	readonly displayIssues = computed<DisplayIssueView[]>(() => {
		const sorted = [...this.reviewIssues()].sort(
			(a, b) =>
				severityRank[a.severity] - severityRank[b.severity] ||
				a.code.localeCompare(b.code) ||
				a.message.localeCompare(b.message),
		);
		const grouped = new Map<string, DisplayIssueView>();
		for (const issue of sorted) {
			const key = issueGroupKey(issue);
			const existing = grouped.get(key);
			if (existing) {
				existing.count += 1;
			} else {
				grouped.set(key, {
					severity: issue.severity,
					code: issue.code,
					message: issue.message,
					count: 1,
					label: "",
					isMapping: isMappingIssue(issue),
				});
			}
		}
		const rows = Array.from(grouped.values());
		for (const row of rows) row.label = issueLabel(row);
		return rows;
	});

	readonly warningIssues = computed<DisplayIssueView[]>(() =>
		this.displayIssues().filter((issue) => issue.severity !== "info"),
	);
	readonly infoIssues = computed<DisplayIssueView[]>(() =>
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
		const issue = [...this.reviewIssues()].sort(
			(a, b) => severityRank[a.severity] - severityRank[b.severity],
		)[0];
		if (issue && (issue.severity === "error" || issue.severity === "warning"))
			return `${issue.code} — ${issue.message}`;
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
	readonly mappingNeedsAttention = computed(
		() =>
			this.mappingAttentionState() === "manual-mapping-needed" ||
			this.mappingAttentionState() === "review-recommended",
	);
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
		const fmt = (n: number) => new Intl.NumberFormat().format(n);
		const pendingLabel =
			pending.unresolvedCandidates > 0 || pending.unresolvedUnknown > 0
				? ` · Pending review: ${fmt(pending.unresolvedCandidates)} candidates · ${fmt(pending.unresolvedUnknown)} unknown`
				: "";
		if (coverage) {
			return `Mapped events ${fmt(coverage.mappedEventCount)} · Candidate events ${fmt(coverage.candidateEventCount)} · Ignored known events ${fmt(coverage.ignoredEventCount)} · Unknown events ${fmt(coverage.unknownEventCount)} · ${overrides} overrides${pendingLabel}`;
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
	readonly rowsEmpty = computed(() => this.mappingRows().length === 0);

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

	// --- Mapping profile state ---

	readonly profileViews = computed<MappingProfileView[]>(() =>
		this.profiles().map((profile) => ({
			id: profile.id,
			name: profile.name,
			description: profile.description,
			overrideCount: this.mappingProfileService.overrideCountOf(profile),
		})),
	);

	readonly selectedProfile = computed<MappingOverrideProfile | null>(() => {
		const id = this.selectedProfileId();
		if (id === null) return null;
		return this.profiles().find((p) => p.id === id) ?? null;
	});

	readonly selectedProfileView = computed<MappingProfileView | null>(() => {
		const id = this.selectedProfileId();
		if (id === null) return null;
		return this.profileViews().find((p) => p.id === id) ?? null;
	});

	readonly profileStatus = computed(() => {
		const profiles = this.profiles();
		const selected = this.selectedProfile();
		if (selected) return `Selected: ${selected.name}`;
		return profiles.length === 0
			? "No profile selected"
			: `${profiles.length} local profile(s) available`;
	});

	readonly editProfileInitial = computed(() => ({
		name: this.selectedProfile()?.name ?? "",
		description: this.selectedProfile()?.description ?? "",
	}));

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
		this.syncSelectedProfile();
		await this.orchestrator.reviewCurrentSource();
	}

	// --- Event handlers ---

	refreshAnalysis(): void {
		this.generateState.setAnalysisCache(undefined);
		void this.orchestrator.reviewCurrentSource();
	}

	toggleJson(): void {
		this.jsonOpen.update((open) => !open);
	}

	async toggleTrack(trackIndex: number): Promise<void> {
		await this.orchestrator.toggleTrack(trackIndex);
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
		row: MappingRow | MappingReviewRowViewWithControls,
		value: string,
	): Promise<void> {
		const current = { ...this.state().mappingOverrides };
		const sourceKind = mappingSourceKind(row);
		if (!value) {
			delete current[row.key];
			this.generateState.setMappingOverrides(current);
			await this.orchestrator.mappingChanged();
			return;
		}
		current[row.key] =
			value === "ignore"
				? {
						sourceKind,
						key: row.key,
						target: { kind: "ignore" as const },
					}
				: {
						sourceKind,
						key: row.key,
						target: {
							kind: "piece" as const,
							piece: value as (typeof MAPPING_PIECES)[number],
						},
					};
		this.generateState.setMappingOverrides(current as ProjectMappingOverrides);
		await this.orchestrator.mappingChanged();
	}

	async applySuggestion(row: MappingReviewRowViewWithControls): Promise<void> {
		if (!row.suggestedPiece) return;
		await this.setOverride(row, row.suggestedPiece);
	}

	async ignoreRow(row: MappingReviewRowViewWithControls): Promise<void> {
		await this.setOverride(row, "ignore");
	}

	async mapRow(
		row: MappingReviewRowViewWithControls,
		value: string,
	): Promise<void> {
		if (!value) return;
		await this.setOverride(row, value);
	}

	async resetOverride(row: MappingReviewRowViewWithControls): Promise<void> {
		await this.setOverride(row, "");
	}

	// --- Mapping profile handlers ---

	selectProfile(profileId: string): void {
		this.selectedProfileId.set(profileId);
	}

	setApplyMode(mode: MappingProfileApplyMode): void {
		this.applyMode.set(mode);
	}

	openCreateProfileDialog(): void {
		this.showCreateProfileDialog.set(true);
	}

	cancelCreateProfileDialog(): void {
		this.showCreateProfileDialog.set(false);
	}

	async confirmCreateProfile(intent: {
		name: string;
		description?: string;
	}): Promise<void> {
		this.showCreateProfileDialog.set(false);
		if (!intent.name) return;
		const now = new Date().toISOString();
		const result = await this.mappingProfileService.saveProfile({
			id: crypto.randomUUID(),
			name: intent.name,
			description: intent.description,
			overrides: { ...this.state().mappingOverrides },
			createdAt: now,
			updatedAt: now,
		});
		if (result.ok) this.syncSelectedProfile(intent.name);
	}

	openEditProfileDialog(): void {
		if (!this.selectedProfile()) return;
		this.showEditProfileDialog.set(true);
	}

	cancelEditProfileDialog(): void {
		this.showEditProfileDialog.set(false);
	}

	async confirmEditProfile(intent: {
		name: string;
		description?: string;
	}): Promise<void> {
		this.showEditProfileDialog.set(false);
		const profile = this.selectedProfile();
		if (!profile || !intent.name) return;
		await this.mappingProfileService.saveProfile({
			...profile,
			name: intent.name,
			description: intent.description,
			updatedAt: new Date().toISOString(),
		});
	}

	async updateSelectedFromCurrent(): Promise<void> {
		const profile = this.selectedProfile();
		if (!profile) return;
		await this.mappingProfileService.saveProfile({
			...profile,
			overrides: { ...this.state().mappingOverrides },
			updatedAt: new Date().toISOString(),
		});
	}

	requestDeleteProfile(): void {
		if (!this.selectedProfile()) return;
		this.showDeleteProfileConfirm.set(true);
	}

	cancelDeleteProfile(): void {
		this.showDeleteProfileConfirm.set(false);
	}

	async confirmDeleteProfile(): Promise<void> {
		this.showDeleteProfileConfirm.set(false);
		const profile = this.selectedProfile();
		if (!profile) return;
		const result = await this.mappingProfileService.deleteProfile(profile.id);
		if (result.ok) this.selectedProfileId.set(null);
	}

	async applySelectedProfile(): Promise<void> {
		const profile = this.selectedProfile();
		if (!profile) return;
		const result = applyMappingProfile({
			projectOverrides: this.state().mappingOverrides,
			profileOverrides: profile.overrides,
			mode: this.applyMode(),
		});
		this.generateState.setMappingOverrides(result.overrides);
		this.mappingUserOpen.set(true);
		await this.orchestrator.mappingChanged();
	}

	async continueToGenerate(): Promise<void> {
		if (this.canContinue()) await this.router.navigateByUrl("/generate");
	}

	goBack(): void {
		void this.router.navigateByUrl("/projects/details");
	}

	// --- Private helpers (presentation VM derivation, NOT template methods) ---

	private overrideSelectValue(key: string): string {
		const override = this.state().mappingOverrides[key];
		return override?.target.kind === "piece" ? override.target.piece : "";
	}

	private showIgnoreAction(row: MappingReviewRowView): boolean {
		if (row.action === "ignore" && !row.hasOverride) return false;
		return this.overrideLabelFor(row.key) !== "ignore";
	}

	private overrideLabelFor(key: string): string {
		const override = this.state().mappingOverrides[key];
		if (!override) return "";
		return override.target.kind === "ignore" ? "ignore" : override.target.piece;
	}

	private trackStatusLabel(index: number, selected: boolean): string {
		if (selected)
			return this.state().selectedTracks.length === 1
				? "Auto-selected"
				: "Selected";
		const strength =
			this.state().inspection?.tracks?.find((t) => t.index === index)
				?.strength ?? "unknown";
		return strength === "weak" ? "Low confidence" : "Available";
	}

	private syncSelectedProfile(preferName?: string): void {
		const profiles = this.profiles();
		if (profiles.length === 0) {
			this.selectedProfileId.set(null);
			return;
		}
		const current = this.selectedProfileId();
		const stillExists = profiles.some((p) => p.id === current);
		if (stillExists) return;
		const byName = preferName
			? profiles.find((p) => p.name === preferName)
			: undefined;
		this.selectedProfileId.set((byName ?? profiles[0]).id);
	}
}
