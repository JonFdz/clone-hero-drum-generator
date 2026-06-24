import type { ChdgOutputStatus, RecentProject } from "@chdg/project/browser";
import type { MissingPathWarning } from "../project-session/public-api";

export type HomeNextActionId =
	| "new_project"
	| "continue_setup"
	| "source_review"
	| "generate"
	| "preview"
	| "review_generate"
	| "open_project";

export type HomeWorkflowStepStatus =
	| "complete"
	| "current"
	| "available"
	| "blocked"
	| "upcoming"
	| "unknown";

export type HomeTone = "neutral" | "success" | "warning" | "danger";

export type HomeNextAction = {
	id: HomeNextActionId;
	label: string;
	description: string;
	route: string;
	secondaryLabel?: string;
	secondaryRoute?: string;
};

export type HomeRecentProjectItem = RecentProject & {
	icon: string;
	lastOpenedLabel: string;
	statusLabel: string;
	statusTone: HomeTone;
};

export type HomeWorkflowStep = {
	index: number;
	label: string;
	description: string;
	status: HomeWorkflowStepStatus;
};

export type HomeDashboardModel = {
	hasProject: boolean;
	projectName: string;
	projectFilePathLabel: string;
	isDirty: boolean;
	outputStatus: ReturnType<typeof formatHomeOutputStatus>;
	missingPathWarnings: MissingPathWarning[];
	missingPathCount: number;
	nextAction: HomeNextAction;
	recentProjects: HomeRecentProjectItem[];
	workflow: HomeWorkflowStep[];
};

export type HomeDashboardModelInput = {
	projectName: string;
	projectFilePath?: string;
	outputStatus: ChdgOutputStatus;
	missingPathWarnings: MissingPathWarning[];
	recentProjects: RecentProject[];
	hasProject: boolean;
	isDirty: boolean;
	sourcePath?: string;
	audioPath?: string;
	outputDir?: string;
	selectedTrackCount: number;
};

export const HOME_WORKFLOW_LABELS = [
	"Import source",
	"Source Review",
	"Generate",
	"Preview",
] as const;

const workflowDescriptions: Record<
	(typeof HOME_WORKFLOW_LABELS)[number],
	string
> = {
	"Import source": "Load a source file (MIDI, GP, etc.)",
	"Source Review": "Analyze source content, selected tracks, and mapping",
	Generate: "Validate readiness and generate drum chart output",
	Preview: "Preview chart and listen back",
};

export function deriveHomeDashboardModel(
	input: HomeDashboardModelInput,
): HomeDashboardModel {
	const outputStatus = formatHomeOutputStatus(input.outputStatus);
	const recentProjects = deriveRecentProjectItems(
		limitRecentProjects(input.recentProjects),
		input,
		outputStatus,
	);
	return {
		hasProject: input.hasProject,
		projectName: input.hasProject
			? input.projectName
			: "No project selected",
		projectFilePathLabel: compactPathLabel(input.projectFilePath),
		isDirty: input.isDirty,
		outputStatus,
		missingPathWarnings: input.missingPathWarnings,
		missingPathCount: input.missingPathWarnings.length,
		nextAction: deriveHomeNextAction(input),
		recentProjects,
		workflow: deriveWorkflowStepStatuses(input),
	};
}

export function deriveHomeNextAction(
	input: HomeDashboardModelInput,
): HomeNextAction {
	const { hasProject } = input;
	if (!hasProject) {
		return {
			id: "new_project",
			label: "New Project",
			description:
				"Create a .chdg project to start a local drum chart workflow.",
			route: "/projects/details",
			secondaryLabel: "Open Project",
			secondaryRoute: "/projects",
		};
	}

	if (input.missingPathWarnings.length > 0 || hasMissingSetupPaths(input)) {
		return {
			id: "continue_setup",
			label: "Continue Setup",
			description:
				"Add or repair the source, audio, and output folder before generation.",
			route: "/projects/details",
			secondaryLabel: "Source Review",
			secondaryRoute: input.sourcePath ? "/source-review" : undefined,
		};
	}

	if (input.outputStatus === "failed") {
		return {
			id: "review_generate",
			label: "Review Generate",
			description:
				"Generation failed. Review the Generate page logs and try again.",
			route: "/generate",
		};
	}

	if (input.outputStatus === "needs-regenerate") {
		return {
			id: "generate",
			label: "Generate",
			description:
				"Project inputs changed since the last successful Clone Hero output.",
			route: "/generate",
		};
	}

	if (input.outputStatus === "generated") {
		return {
			id: "preview",
			label: "Preview",
			description:
				"Ready to preview notes.chart with song.ogg from the output folder.",
			route: "/preview",
			secondaryLabel: "Generate",
			secondaryRoute: "/generate",
		};
	}

	if (input.sourcePath) {
		return {
			id: "source_review",
			label: "Source Review",
			description:
				"Source is set. Review source analysis, selected tracks, and mapping before generation.",
			route: "/source-review",
			secondaryLabel: "Generate",
			secondaryRoute: input.selectedTrackCount > 0 ? "/generate" : undefined,
		};
	}

	return {
		id: "continue_setup",
		label: "Continue Setup",
		description: "Complete project setup before reviewing or generating.",
		route: "/projects/details",
	};
}

export function deriveWorkflowStepStatuses(
	input: HomeDashboardModelInput,
): HomeWorkflowStep[] {
	const { hasProject } = input;
	const hasSource = !!input.sourcePath;
	const selected = input.selectedTrackCount > 0;
	const generated = input.outputStatus === "generated";
	const failed = input.outputStatus === "failed";
	const canGenerate =
		hasSource && !!input.audioPath && !!input.outputDir && selected;

	const statuses: HomeWorkflowStepStatus[] = [
		hasSource ? "complete" : hasProject ? "current" : "upcoming",
		!hasSource ? "blocked" : selected ? "complete" : "current",
		generated
			? "complete"
			: failed
				? "current"
				: canGenerate
					? "current"
					: "upcoming",
		generated ? "current" : "upcoming",
	];

	return HOME_WORKFLOW_LABELS.map((label, index) => ({
		index: index + 1,
		label,
		description: workflowDescriptions[label],
		status: statuses[index],
	}));
}

export function formatHomeOutputStatus(status: ChdgOutputStatus): {
	label: string;
	detail: string;
	tone: HomeTone;
} {
	switch (status) {
		case "generated":
			return {
				label: "Generated",
				detail: "Clone Hero output is available.",
				tone: "success",
			};
		case "needs-regenerate":
			return {
				label: "Needs regenerate",
				detail: "Inputs changed after generation.",
				tone: "warning",
			};
		case "failed":
			return {
				label: "Failed",
				detail: "Last generation attempt failed.",
				tone: "danger",
			};
		case "not-generated":
		default:
			return {
				label: "Not generated",
				detail: "No Clone Hero output has been generated yet.",
				tone: "neutral",
			};
	}
}

export function compactPathLabel(path?: string, maxLength = 52): string {
	if (!path) return "Not saved yet";
	if (path.length <= maxLength) return path;
	const parts = path.split(/[\\/]/).filter(Boolean);
	if (parts.length <= 2) return `…${path.slice(-(maxLength - 1))}`;
	const tail = parts.slice(-2).join("/");
	return tail.length + 2 <= maxLength
		? `…/${tail}`
		: `…${path.slice(-(maxLength - 1))}`;
}

export function limitRecentProjects(
	projects: RecentProject[],
	limit = 3,
): RecentProject[] {
	return projects.slice(0, limit);
}

function deriveRecentProjectItems(
	projects: RecentProject[],
	input: HomeDashboardModelInput,
	outputStatus: ReturnType<typeof formatHomeOutputStatus>,
): HomeRecentProjectItem[] {
	return projects.map((project) => {
		const isCurrentProject =
			!!input.projectFilePath && project.path === input.projectFilePath;
		return {
			...project,
			icon: iconForRecentProject(project.name, project.path),
			lastOpenedLabel: `Last opened: ${formatRecentOpened(project.lastOpenedAt)}`,
			statusLabel: isCurrentProject ? outputStatus.label : "Recent",
			statusTone: isCurrentProject ? outputStatus.tone : "neutral",
		};
	});
}

function iconForRecentProject(name: string, path: string): string {
	const value = `${name} ${path}`.toLowerCase();
	if (value.includes("gp") || value.includes("guitar")) return "GP";
	if (
		value.includes("midi") ||
		value.endsWith(".mid") ||
		value.endsWith(".midi")
	) {
		return "♫";
	}
	return "▣";
}

function formatRecentOpened(value: string): string {
	const opened = new Date(value);
	if (Number.isNaN(opened.getTime())) return "Recently";
	const now = new Date();
	const sameDay = opened.toDateString() === now.toDateString();
	if (sameDay) {
		return `Today, ${opened.toLocaleTimeString(undefined, {
			hour: "numeric",
			minute: "2-digit",
		})}`;
	}
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (opened.toDateString() === yesterday.toDateString()) {
		return `Yesterday, ${opened.toLocaleTimeString(undefined, {
			hour: "numeric",
			minute: "2-digit",
		})}`;
	}
	return opened.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function hasMissingSetupPaths(input: HomeDashboardModelInput): boolean {
	return countMissingSetupPaths(input) > 0;
}

function countMissingSetupPaths(input: HomeDashboardModelInput): number {
	return [input.sourcePath, input.audioPath, input.outputDir].filter(
		(path) => !path,
	).length;
}
