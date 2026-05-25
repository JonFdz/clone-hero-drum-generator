import type { ProjectIssue } from "./types.js";

export type ValidationSeverity = "error" | "warning" | "info";

export type ValidationCategory =
	| "project"
	| "source"
	| "audio"
	| "output"
	| "tracks"
	| "metadata"
	| "offset"
	| "ffmpeg"
	| "generation"
	| "chart";

export type ValidationFixAction = {
	label: string;
	route?: string;
	action?: string;
};

export type ValidationItem = {
	id: string;
	category: ValidationCategory;
	severity: ValidationSeverity;
	title: string;
	message: string;
	blocking: boolean;
	fixAction?: ValidationFixAction;
};

export type ValidationSummary = {
	canGenerate: boolean;
	errorCount: number;
	warningCount: number;
	infoCount: number;
	items: ValidationItem[];
	checkedAt: string;
};

export function createValidationSummary(
	items: ValidationItem[],
	checkedAt: string = new Date().toISOString(),
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

export function validationItemFromProjectIssue(
	issue: ProjectIssue,
	fallbackId: string,
): ValidationItem {
	const category = categoryForProjectIssue(issue.code);
	const severity = normalizeProjectIssueSeverity(issue.severity);
	return {
		id: stableValidationIssueId(issue.code, fallbackId),
		category,
		severity,
		title: titleForProjectIssue(issue.code),
		message: issue.message,
		blocking: severity === "error",
		fixAction: fixActionForCategory(category),
	};
}

function normalizeProjectIssueSeverity(
	severity: ProjectIssue["severity"],
): ValidationSeverity {
	return severity === "error"
		? "error"
		: severity === "warning"
			? "warning"
			: "info";
}

function stableValidationIssueId(code: string, fallbackId: string): string {
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
		code === "DUPLICATE_HIT_DEDUPED" ||
		code === "HIHAT_OPEN_CLOSED_CONFLICT" ||
		code === "IMPOSSIBLE_HAND_CHORD"
	) {
		return "chart";
	}
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

function fixActionForCategory(
	category: ValidationCategory,
): ValidationFixAction | undefined {
	switch (category) {
		case "source":
		case "audio":
		case "output":
			return { label: "Review project inputs", route: "/projects/details" };
		case "tracks":
		case "chart":
			return { label: "Review source", route: "/source-review" };
		case "ffmpeg":
			return { label: "Review FFmpeg settings", route: "/settings" };
		default:
			return undefined;
	}
}
