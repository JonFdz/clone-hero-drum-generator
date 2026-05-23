import type { ChdgOutputStatus, RecentProject } from "@chdg/project/browser";
import type { DesktopGenerateState } from "./desktop-generate-state.service";
import type {
	DesktopProjectState,
	MissingPathWarning,
} from "./desktop-project-state.service";

export type HomeNextActionId =
	| "new_project"
	| "continue_setup"
	| "inspect_source"
	| "generate"
	| "validate"
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
	project: DesktopProjectState;
	generate: DesktopGenerateState;
	hasProject: boolean;
	isDirty: boolean;
};

export const HOME_WORKFLOW_LABELS = [
	"Import source",
	"Inspect",
	"Select track(s)",
	"Generate",
	"Validate",
	"Preview",
] as const;

const workflowDescriptions: Record<
	(typeof HOME_WORKFLOW_LABELS)[number],
	string
> = {
	"Import source": "Load a source file (MIDI, GP, etc.)",
	Inspect: "Analyze and review the source content",
	"Select track(s)": "Choose the track(s) to generate",
	Generate: "Generate drum chart from selected track(s)",
	Validate: "Run validations and fix any issues",
	Preview: "Preview chart and listen back",
};

export function deriveHomeDashboardModel(
	input: HomeDashboardModelInput,
): HomeDashboardModel {
	const outputStatus = formatHomeOutputStatus(input.project.outputStatus);
	const recentProjects = deriveRecentProjectItems(
		limitRecentProjects(input.project.recentProjects),
		input,
		outputStatus,
	);
	return {
		hasProject: input.hasProject,
		projectName: input.hasProject
			? input.project.projectName
			: "No project selected",
		projectFilePathLabel: compactPathLabel(input.project.projectFilePath),
		isDirty: input.isDirty,
		outputStatus,
		missingPathWarnings: input.project.missingPaths,
		missingPathCount: input.project.missingPaths.length,
		nextAction: deriveHomeNextAction(input),
		recentProjects,
		workflow: deriveWorkflowStepStatuses(input),
	};
}

export function deriveHomeNextAction(
	input: HomeDashboardModelInput,
): HomeNextAction {
	const { project, generate, hasProject } = input;
	if (!hasProject) {
		return {
			id: "new_project",
			label: "New Project",
			description:
				"Create a .chdg project to start a local drum chart workflow.",
			route: "/new-project",
			secondaryLabel: "Open Project",
			secondaryRoute: "/projects",
		};
	}

	if (project.missingPaths.length > 0 || hasMissingSetupPaths(generate)) {
		return {
			id: "continue_setup",
			label: "Continue Setup",
			description:
				"Add or repair the source, audio, and output folder before generation.",
			route: "/new-project",
			secondaryLabel: "Inspect Source",
			secondaryRoute: generate.sourcePath ? "/inspect-source" : undefined,
		};
	}

	if (project.outputStatus === "failed") {
		return {
			id: "review_generate",
			label: "Review Generate",
			description:
				"Generation failed. Review the Generate page logs and try again.",
			route: "/generate",
		};
	}

	if (project.outputStatus === "needs-regenerate") {
		return {
			id: "generate",
			label: "Generate",
			description:
				"Project inputs changed since the last successful Clone Hero output.",
			route: "/generate",
			secondaryLabel: "Validate",
			secondaryRoute: "/validation",
		};
	}

	if (project.outputStatus === "generated") {
		return {
			id: "preview",
			label: "Preview",
			description:
				"Ready to preview notes.chart with song.ogg from the output folder.",
			route: "/preview",
			secondaryLabel: "Validate",
			secondaryRoute: "/validation",
		};
	}

	if (generate.sourcePath) {
		return {
			id: "inspect_source",
			label: "Inspect Source",
			description:
				"Source, audio, and output are set. Inspect the source before track selection.",
			route: "/inspect-source",
			secondaryLabel: "Generate",
			secondaryRoute:
				generate.selectedTracks.length > 0 ? "/generate" : undefined,
		};
	}

	return {
		id: "continue_setup",
		label: "Continue Setup",
		description: "Complete project setup before inspecting or generating.",
		route: "/new-project",
	};
}

export function deriveWorkflowStepStatuses(
	input: HomeDashboardModelInput,
): HomeWorkflowStep[] {
	const { hasProject, generate, project } = input;
	const hasSource = !!generate.sourcePath;
	const inspected = !!generate.inspection;
	const selected = generate.selectedTracks.length > 0;
	const generated = project.outputStatus === "generated";
	const failed = project.outputStatus === "failed";
	const canGenerate =
		hasSource && !!generate.audioPath && !!generate.outputDir && selected;

	const statuses: HomeWorkflowStepStatus[] = [
		hasSource ? "complete" : hasProject ? "current" : "upcoming",
		!hasSource ? "blocked" : inspected ? "complete" : "current",
		!inspected ? "upcoming" : selected ? "complete" : "current",
		generated
			? "complete"
			: failed
				? "current"
				: canGenerate
					? "current"
					: "upcoming",
		generated ? "available" : "upcoming",
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
			!!input.project.projectFilePath &&
			project.path === input.project.projectFilePath;
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

function hasMissingSetupPaths(generate: DesktopGenerateState): boolean {
	return countMissingSetupPaths(generate) > 0;
}

function countMissingSetupPaths(generate: DesktopGenerateState): number {
	return [generate.sourcePath, generate.audioPath, generate.outputDir].filter(
		(path) => !path,
	).length;
}
