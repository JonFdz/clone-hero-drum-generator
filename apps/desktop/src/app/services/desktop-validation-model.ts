import type {
	ProjectIssue,
	ValidationCategory,
	ValidationItem,
	ValidationSummary,
} from "@chdg/project/browser";
import { detectDesktopSourceKind } from "./desktop-generate-model";
import type { DesktopGenerateState } from "./desktop-generate-state.service";
import type { DesktopProjectState } from "./desktop-project-state.service";

export function buildDesktopValidationSummary(
	generate: DesktopGenerateState,
	project: DesktopProjectState,
	checkedAt: string = new Date().toISOString(),
): ValidationSummary {
	return createValidationSummary(
		buildDesktopValidationItems(generate, project),
		checkedAt,
	);
}

export function buildDesktopValidationItems(
	generate: DesktopGenerateState,
	project: DesktopProjectState,
): ValidationItem[] {
	const items: ValidationItem[] = [];

	if (!generate.sourcePath) {
		items.push(
			errorItem(
				"source.missing",
				"source",
				"Runtime source unavailable",
				"No runtime source is available for this dormant diagnostic view. Source replacement is unavailable in this migration.",
			),
		);
	} else if (!detectDesktopSourceKind(generate.sourcePath)) {
		items.push(
			errorItem(
				"source.unsupported",
				"source",
				"Unsupported source type",
				"The runtime source is not a supported .mid, .midi, or .gp file. Source replacement is unavailable in this migration.",
			),
		);
	} else {
		items.push(
			infoItem(
				"source.ready",
				"source",
				"Source selected",
				`${generate.sourcePath} is a supported source type.`,
			),
		);
	}

	if (project.missingPaths.some((warning) => warning.kind === "sourcePath")) {
		items.push(
			errorItem(
				"source.path-missing",
				"source",
				"Saved source path is missing",
				missingPathMessage(project.missingPaths, "sourcePath"),
			),
		);
	}

	if (!generate.audioPath) {
		items.push(
			errorItem(
				"audio.missing",
				"audio",
				"Runtime audio unavailable",
				"No runtime audio is available for this dormant diagnostic view. Audio replacement is unavailable in this migration.",
			),
		);
	} else {
		items.push(
			infoItem(
				"audio.ready",
				"audio",
				"Runtime audio reference",
				generate.audioPath,
			),
		);
	}

	if (project.missingPaths.some((warning) => warning.kind === "audioPath")) {
		items.push(
			errorItem(
				"audio.path-missing",
				"audio",
				"Saved audio path is missing",
				missingPathMessage(project.missingPaths, "audioPath"),
			),
		);
	}

	if (!generate.outputDir) {
		items.push(
			infoItem(
				"output.missing",
				"output",
				"Export target not recorded",
				"No runtime export target is recorded. A target is optional until export, and managed export is unavailable in this migration.",
			),
		);
	} else {
		items.push(
			infoItem(
				"output.ready",
				"output",
				"Runtime export target",
				generate.outputDir,
			),
		);
	}

	if (project.missingPaths.some((warning) => warning.kind === "outputDir")) {
		items.push(
			errorItem(
				"output.path-missing",
				"output",
				"Recorded export target unavailable",
				`Existing managed preview output cannot be opened. ${missingPathMessage(project.missingPaths, "outputDir")}`,
			),
		);
	}
	if (
		project.missingPaths.some(
			(warning) => warning.kind === "outputChartPath",
		)
	) {
		items.push(
			errorItem(
				"output.chart-missing",
				"output",
				"Managed preview chart unavailable",
				missingPathMessage(project.missingPaths, "outputChartPath"),
			),
		);
	}
	if (
		project.missingPaths.some(
			(warning) => warning.kind === "outputAudioPath",
		)
	) {
		items.push(
			errorItem(
				"output.audio-missing",
				"output",
				"Managed preview audio unavailable",
				missingPathMessage(project.missingPaths, "outputAudioPath"),
			),
		);
	}

	if (generate.selectedTracks.length === 0) {
		items.push(
			errorItem(
				"tracks.missing",
				"tracks",
				"No runtime track selection",
				"No runtime drum-track selection is available. Source Review is dormant in this migration.",
			),
		);
	} else {
		items.push(
			infoItem(
				"tracks.selected",
				"tracks",
				"Tracks selected",
				`${generate.selectedTracks.length} track(s): ${generate.selectedTracks.join(", ")}`,
			),
		);
	}

	if (generate.offsetMs !== undefined && !Number.isFinite(generate.offsetMs)) {
		items.push(
			errorItem(
				"offset.invalid",
				"offset",
				"Invalid chart offset",
				"Offset must be a finite number of milliseconds.",
			),
		);
	}

	if (generate.errorMessage?.toLowerCase().includes("offset")) {
		items.push(
			errorItem(
				"offset.invalid",
				"offset",
				"Invalid chart offset",
				generate.errorMessage,
			),
		);
	}

	if (!hasText(generate.metadata.artist)) {
		items.push(
			warningItem(
				"metadata.missing-artist",
				"metadata",
				"Artist metadata missing",
				"The dormant runtime metadata does not include an artist. Canonical identity is read-only in this migration.",
			),
		);
	}
	if (!hasText(generate.metadata.charter)) {
		items.push(
			warningItem(
				"metadata.missing-charter",
				"metadata",
				"Charter metadata missing",
				"The dormant runtime metadata does not include a charter. Metadata editing is unavailable in this migration.",
			),
		);
	}

	if (generate.audioPath) {
		const diagnostic = project.ffmpegDiagnostic;
		const conversionRequired = isAudioConversionRequired(generate.audioPath);
		if (conversionRequired && diagnostic?.available === false) {
			items.push(
				errorItem(
					"ffmpeg.unavailable",
					"ffmpeg",
					"FFmpeg unavailable",
					diagnostic.message ||
						"FFmpeg is required to convert audio to song.ogg.",
					"/settings",
				),
			);
		} else if (diagnostic?.available === true) {
			items.push(
				infoItem(
					"ffmpeg.available",
					"ffmpeg",
					"FFmpeg available",
					diagnostic.version
						? `${diagnostic.message} (${diagnostic.version})`
						: diagnostic.message,
				),
			);
		} else if (!conversionRequired) {
			items.push(
				infoItem(
					"ffmpeg.not-required",
					"ffmpeg",
					"FFmpeg not required",
					"Selected audio is already .ogg and can be copied to song.ogg.",
				),
			);
		} else {
			items.push(
				infoItem(
					"ffmpeg.not-checked",
					"ffmpeg",
					"FFmpeg readiness not checked",
					"Use Settings to test FFmpeg if audio conversion fails.",
				),
			);
		}
	}

	switch (project.outputStatus) {
		case "generated":
			items.push(
				infoItem(
					"generation.generated",
					"generation",
					"Generated output is current",
					generate.lastGeneratedAt
						? `Last generated at ${formatCheckedAt(generate.lastGeneratedAt)}.`
						: "Project output is marked generated.",
				),
			);
			break;
		case "needs-regenerate":
			items.push(
				warningItem(
					"generation.needs-regenerate",
					"generation",
					"Persisted export status is outdated",
					"Managed regeneration is unavailable in this migration.",
				),
			);
			break;
		case "failed":
			items.push(
				warningItem(
					"generation.failed",
					"generation",
					"Previous generation failed",
					"Managed regeneration is unavailable in this migration.",
				),
			);
			break;
		case "not-generated":
			items.push(
				infoItem(
					"generation.not-generated",
					"generation",
					"Not generated yet",
					"Managed generation is unavailable in this migration.",
				),
			);
			break;
	}

	items.push(...projectIssueItems(collectProjectIssues(generate)));
	return dedupeItems(items);
}

function createValidationSummary(
	items: ValidationItem[],
	checkedAt: string,
): ValidationSummary {
	const errorCount = items.filter((item) => item.severity === "error").length;
	const warningCount = items.filter(
		(item) => item.severity === "warning",
	).length;
	const infoCount = items.filter((item) => item.severity === "info").length;
	return {
		canGenerate: !items.some((item) => item.blocking),
		errorCount,
		warningCount,
		infoCount,
		items,
		checkedAt,
	};
}

function collectProjectIssues(state: DesktopGenerateState): ProjectIssue[] {
	return [
		...(state.inspection?.issues ?? []),
		...(state.normalizationPreview?.issues ?? []),
		...(state.normalizationPreview?.mergeSummary?.issues ?? []),
		...(state.generationResult?.issues ?? []),
		...(state.generationResult?.mergeSummary?.issues ?? []),
		...state.issues,
	];
}

function projectIssueItems(issues: ProjectIssue[]): ValidationItem[] {
	return issues.map((issue, index) =>
		validationItemFromProjectIssue(issue, `project.issue-${index}`),
	);
}

function validationItemFromProjectIssue(
	issue: ProjectIssue,
	fallbackId: string,
): ValidationItem {
	const category = categoryForProjectIssue(issue.code);
	const severity =
		issue.severity === "error"
			? "error"
			: issue.severity === "warning"
				? "warning"
				: "info";
	return {
		id: stableProjectIssueId(issue.code, fallbackId),
		category,
		severity,
		title: titleForProjectIssue(issue.code),
		message: issue.message,
		blocking: severity === "error",
		fixAction: undefined,
	};
}

function stableProjectIssueId(code: string, fallbackId: string): string {
	switch (code) {
		case "DUPLICATE_HIT_DEDUPED":
			return "chart.duplicate-hits";
		case "HIHAT_OPEN_CLOSED_CONFLICT":
			return "chart.hihat-conflict";
		case "IMPOSSIBLE_HAND_CHORD":
			return "chart.impossible-hand-chord";
		case "UNSUPPORTED_SOURCE_TYPE":
			return "source.unsupported";
		default:
			return fallbackId;
	}
}

function categoryForProjectIssue(code: string): ValidationCategory {
	if (
		[
			"DUPLICATE_HIT_DEDUPED",
			"HIHAT_OPEN_CLOSED_CONFLICT",
			"IMPOSSIBLE_HAND_CHORD",
		].includes(code)
	)
		return "chart";
	if (code.includes("SOURCE")) return "source";
	return "project";
}

function titleForProjectIssue(code: string): string {
	switch (code) {
		case "DUPLICATE_HIT_DEDUPED":
			return "Duplicate hits deduped";
		case "HIHAT_OPEN_CLOSED_CONFLICT":
			return "Hi-hat conflict resolved";
		case "IMPOSSIBLE_HAND_CHORD":
			return "Impossible hand chord warning";
		case "UNSUPPORTED_SOURCE_TYPE":
			return "Unsupported source type";
		default:
			return code
				.toLowerCase()
				.split("_")
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join(" ");
	}
}

function errorItem(
	id: string,
	category: ValidationCategory,
	title: string,
	message: string,
	route?: string,
): ValidationItem {
	return {
		id,
		category,
		severity: "error",
		title,
		message,
		blocking: true,
		fixAction: route ? { label: fixLabel(category), route } : undefined,
	};
}

function warningItem(
	id: string,
	category: ValidationCategory,
	title: string,
	message: string,
	route?: string,
): ValidationItem {
	return {
		id,
		category,
		severity: "warning",
		title,
		message,
		blocking: false,
		fixAction: route ? { label: fixLabel(category), route } : undefined,
	};
}

function infoItem(
	id: string,
	category: ValidationCategory,
	title: string,
	message: string,
): ValidationItem {
	return { id, category, severity: "info", title, message, blocking: false };
}

function fixLabel(category: ValidationCategory): string {
	switch (category) {
		case "ffmpeg":
			return "Open Settings";
		case "tracks":
		case "chart":
			return "Review Source";
		case "generation":
			return "Open Project";
		default:
			return "Review Project Details";
	}
}

function missingPathMessage(
	warnings: { kind: string; message: string }[],
	kind: string,
): string {
	return (
		warnings.find((warning) => warning.kind === kind)?.message ??
		"Saved path no longer exists."
	);
}

function isAudioConversionRequired(audioPath: string): boolean {
	return !audioPath.toLowerCase().endsWith(".ogg");
}

function hasText(value: string | undefined): boolean {
	return typeof value === "string" && value.trim().length > 0;
}

function dedupeItems(items: ValidationItem[]): ValidationItem[] {
	const seen = new Set<string>();
	return items.filter((item) => {
		const key = `${item.id}:${item.message}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function formatCheckedAt(value: string): string {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
