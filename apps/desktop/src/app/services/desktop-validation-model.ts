import type {
	ProjectIssue,
	ValidationCategory,
	ValidationItem,
	ValidationSummary,
} from "@chdg/project";
import { detectDesktopSourceKind } from "./desktop-generate-model";
import type { DesktopGenerateState } from "./desktop-generate-state.service";
import type { DesktopProjectState } from "./desktop-project-state.service";

export function buildDesktopValidationSummary(
	generate: DesktopGenerateState,
	project: DesktopProjectState,
	checkedAt: string = new Date().toISOString(),
): ValidationSummary {
	return createValidationSummary(buildDesktopValidationItems(generate, project), checkedAt);
}

export function buildDesktopValidationItems(
	generate: DesktopGenerateState,
	project: DesktopProjectState,
): ValidationItem[] {
	const items: ValidationItem[] = [];

	if (!generate.sourcePath) {
		items.push(errorItem("source.missing", "source", "Source file required", "Choose a .mid, .midi, or .gp source file before generating.", "/new-project"));
	} else if (!detectDesktopSourceKind(generate.sourcePath)) {
		items.push(errorItem("source.unsupported", "source", "Unsupported source type", "Supported source files are .mid, .midi, and .gp.", "/new-project"));
	} else {
		items.push(infoItem("source.ready", "source", "Source selected", `${generate.sourcePath} is a supported source type.`));
	}

	if (project.missingPaths.some((warning) => warning.kind === "sourcePath")) {
		items.push(errorItem("source.path-missing", "source", "Saved source path is missing", missingPathMessage(project.missingPaths, "sourcePath"), "/new-project"));
	}

	if (!generate.audioPath) {
		items.push(errorItem("audio.missing", "audio", "Audio file required", "Audio is required for the Desktop Generate MVP so CHDG can create song.ogg.", "/new-project"));
	} else {
		items.push(infoItem("audio.ready", "audio", "Audio selected", `${generate.audioPath} will be converted to song.ogg.`));
	}

	if (project.missingPaths.some((warning) => warning.kind === "audioPath")) {
		items.push(errorItem("audio.path-missing", "audio", "Saved audio path is missing", missingPathMessage(project.missingPaths, "audioPath"), "/new-project"));
	}

	if (!generate.outputDir) {
		items.push(errorItem("output.missing", "output", "Output folder required", "Choose the Clone Hero song output folder before generating.", "/new-project"));
	} else {
		items.push(infoItem("output.ready", "output", "Output folder selected", generate.outputDir));
	}

	if (project.missingPaths.some((warning) => warning.kind === "outputDir")) {
		items.push(errorItem("output.path-missing", "output", "Saved output folder is missing", missingPathMessage(project.missingPaths, "outputDir"), "/new-project"));
	}

	if (generate.selectedTracks.length === 0) {
		items.push(errorItem("tracks.missing", "tracks", "Select at least one drum track", "Generation needs one or more selected drum tracks.", "/track-selection"));
	} else {
		items.push(infoItem("tracks.selected", "tracks", "Tracks selected", `${generate.selectedTracks.length} track(s): ${generate.selectedTracks.join(", ")}`));
	}

	if (generate.offsetMs !== undefined && !Number.isFinite(generate.offsetMs)) {
		items.push(errorItem("offset.invalid", "offset", "Invalid chart offset", "Offset must be a finite number of milliseconds.", "/new-project"));
	} else if (generate.offsetMs !== undefined) {
		items.push(infoItem("offset.present", "offset", "Chart offset set", `${generate.offsetMs} ms; note ticks are not moved.`));
	}

	if (generate.errorMessage?.toLowerCase().includes("offset")) {
		items.push(errorItem("offset.invalid", "offset", "Invalid chart offset", generate.errorMessage, "/new-project"));
	}

	if (!hasText(generate.metadata.artist)) {
		items.push(warningItem("metadata.missing-artist", "metadata", "Artist metadata missing", "Artist is recommended for song.ini quality.", "/new-project"));
	}
	if (!hasText(generate.metadata.charter)) {
		items.push(warningItem("metadata.missing-charter", "metadata", "Charter metadata missing", "Charter is recommended for song.ini quality.", "/new-project"));
	}

	if (generate.audioPath) {
		const diagnostic = project.ffmpegDiagnostic;
		const conversionRequired = isAudioConversionRequired(generate.audioPath);
		if (conversionRequired && diagnostic?.available === false) {
			items.push(errorItem("ffmpeg.unavailable", "ffmpeg", "FFmpeg unavailable", diagnostic.message || "FFmpeg is required to convert audio to song.ogg.", "/settings"));
		} else if (diagnostic?.available === true) {
			items.push(infoItem("ffmpeg.available", "ffmpeg", "FFmpeg available", diagnostic.version ? `${diagnostic.message} (${diagnostic.version})` : diagnostic.message));
		} else if (!conversionRequired) {
			items.push(infoItem("ffmpeg.not-required", "ffmpeg", "FFmpeg not required", "Selected audio is already .ogg and can be copied to song.ogg."));
		} else {
			items.push(infoItem("ffmpeg.not-checked", "ffmpeg", "FFmpeg readiness not checked", "Use Settings to test FFmpeg if audio conversion fails."));
		}
	}

	switch (project.outputStatus) {
		case "generated":
			items.push(infoItem("generation.generated", "generation", "Generated output is current", generate.lastGeneratedAt ? `Last generated at ${formatCheckedAt(generate.lastGeneratedAt)}.` : "Project output is marked generated."));
			break;
		case "needs-regenerate":
			items.push(warningItem("generation.needs-regenerate", "generation", "Output needs regenerate", "Project inputs changed after the last generated output. Regenerate to refresh Clone Hero files.", "/generate"));
			break;
		case "failed":
			items.push(warningItem("generation.failed", "generation", "Previous generation failed", "Review the Generate page log and try again after fixing blocking errors.", "/generate"));
			break;
		case "not-generated":
			items.push(infoItem("generation.not-generated", "generation", "Not generated yet", "Generate the Clone Hero song folder when required inputs are ready."));
			break;
	}

	items.push(...projectIssueItems(collectProjectIssues(generate)));
	return dedupeItems(items);
}

function createValidationSummary(items: ValidationItem[], checkedAt: string): ValidationSummary {
	const errorCount = items.filter((item) => item.severity === "error").length;
	const warningCount = items.filter((item) => item.severity === "warning").length;
	const infoCount = items.filter((item) => item.severity === "info").length;
	return { canGenerate: !items.some((item) => item.blocking), errorCount, warningCount, infoCount, items, checkedAt };
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
	return issues.map((issue, index) => validationItemFromProjectIssue(issue, `project.issue-${index}`));
}

function validationItemFromProjectIssue(issue: ProjectIssue, fallbackId: string): ValidationItem {
	const category = categoryForProjectIssue(issue.code);
	const severity = issue.severity === "error" ? "error" : issue.severity === "warning" ? "warning" : "info";
	return {
		id: stableProjectIssueId(issue.code, fallbackId),
		category,
		severity,
		title: titleForProjectIssue(issue.code),
		message: issue.message,
		blocking: severity === "error",
		fixAction: severity === "error" ? { label: fixLabel(category), route: routeForCategory(category) } : undefined,
	};
}

function stableProjectIssueId(code: string, fallbackId: string): string {
	switch (code) {
		case "DUPLICATE_HIT_DEDUPED": return "chart.duplicate-hits";
		case "HIHAT_OPEN_CLOSED_CONFLICT": return "chart.hihat-conflict";
		case "IMPOSSIBLE_HAND_CHORD": return "chart.impossible-hand-chord";
		case "UNSUPPORTED_SOURCE_TYPE": return "source.unsupported";
		default: return fallbackId;
	}
}

function categoryForProjectIssue(code: string): ValidationCategory {
	if (["DUPLICATE_HIT_DEDUPED", "HIHAT_OPEN_CLOSED_CONFLICT", "IMPOSSIBLE_HAND_CHORD"].includes(code)) return "chart";
	if (code.includes("SOURCE")) return "source";
	return "project";
}

function titleForProjectIssue(code: string): string {
	switch (code) {
		case "DUPLICATE_HIT_DEDUPED": return "Duplicate hits deduped";
		case "HIHAT_OPEN_CLOSED_CONFLICT": return "Hi-hat conflict resolved";
		case "IMPOSSIBLE_HAND_CHORD": return "Impossible hand chord warning";
		case "UNSUPPORTED_SOURCE_TYPE": return "Unsupported source type";
		default: return code.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
	}
}

function errorItem(id: string, category: ValidationCategory, title: string, message: string, route?: string): ValidationItem {
	return { id, category, severity: "error", title, message, blocking: true, fixAction: route ? { label: fixLabel(category), route } : undefined };
}

function warningItem(id: string, category: ValidationCategory, title: string, message: string, route?: string): ValidationItem {
	return { id, category, severity: "warning", title, message, blocking: false, fixAction: route ? { label: fixLabel(category), route } : undefined };
}

function infoItem(id: string, category: ValidationCategory, title: string, message: string): ValidationItem {
	return { id, category, severity: "info", title, message, blocking: false };
}

function fixLabel(category: ValidationCategory): string {
	switch (category) {
		case "ffmpeg": return "Open Settings";
		case "tracks":
		case "chart": return "Review Tracks";
		case "generation": return "Open Generate";
		default: return "Review Inputs";
	}
}

function routeForCategory(category: ValidationCategory): string {
	switch (category) {
		case "ffmpeg": return "/settings";
		case "tracks":
		case "chart": return "/track-selection";
		case "generation": return "/generate";
		default: return "/new-project";
	}
}

function missingPathMessage(warnings: { kind: string; message: string }[], kind: string): string {
	return warnings.find((warning) => warning.kind === kind)?.message ?? "Saved path no longer exists.";
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
