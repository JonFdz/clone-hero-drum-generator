import type { RecentProject } from "@chdg/project/browser";
import type { DesktopOutputStatus } from "../../services/desktop-project-runtime";
import type { MissingPathWarning } from "../project-session/public-api";

export type HomeNextActionId =
	| "mappings"
	| "preview"
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
	outputStatus: DesktopOutputStatus;
	missingPathWarnings: MissingPathWarning[];
	recentProjects: RecentProject[];
	hasProject: boolean;
	isDirty: boolean;
	sourcePath?: string;
	audioPath?: string;
	outputDir?: string;
	selectedTrackCount: number;
};

export type HomeOutputReadiness = {
	hasRecordedTarget: boolean;
	recordedTargetMissing: boolean;
	requiredManagedPreviewMissing: boolean;
	canOpenOutputFolder: boolean;
	canPreviewCurrentOutput: boolean;
};

export const HOME_WORKFLOW_LABELS = [
	"Project source",
	"Mappings",
	"Export status",
	"Preview",
] as const;

const workflowDescriptions: Record<
	(typeof HOME_WORKFLOW_LABELS)[number],
	string
> = {
	"Project source": "Use the project-owned imported MIDI or Guitar Pro source",
	Mappings: "Inspect mapping information available for the opened project",
	"Export status": "Inspect the persisted canonical export status",
	Preview: "Preview existing managed output when it is available",
};

export function deriveHomeDashboardModel(
	input: HomeDashboardModelInput,
): HomeDashboardModel {
	const outputReadiness = deriveHomeOutputReadiness(input);
	const outputStatus = formatHomeOutputStatus(
		input.outputStatus,
		outputReadiness,
	);
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
	const outputReadiness = deriveHomeOutputReadiness(input);
	if (!hasProject) {
		return {
			id: "open_project",
			label: "Open Project",
			description:
				"Open an existing canonical .chdg project. Project creation and source import are not yet available.",
			route: "/projects",
		};
	}

	if (hasRequiredAssetWarning(input) || hasMissingSetupPaths(input)) {
		return {
			id: "open_project",
			label: "Open Project",
			description:
				"This project references unavailable local files. Replacement and setup are unavailable in this migration.",
			route: "/projects",
		};
	}

	if (
		input.outputStatus === "generated" &&
		!outputReadiness.canPreviewCurrentOutput
	) {
		return {
			id: "open_project",
			label: "Open Project",
			description:
				"The persisted export status is current, but its recorded output folder or required managed preview files are unavailable. Preview cannot open existing managed output, and generation is unavailable in this migration.",
			route: "/projects",
		};
	}

	if (input.outputStatus === "generated") {
		return {
			id: "preview",
			label: "Preview",
			description:
				"Ready to preview notes.chart with song.ogg from the output folder.",
			route: "/preview",
			secondaryLabel: "Mappings",
			secondaryRoute: "/mapping",
		};
	}

	if (input.sourcePath) {
		return {
			id: "mappings",
			label: "Mappings",
			description:
				"Inspect available runtime mapping information. Editing and generation are unavailable in this migration.",
			route: "/mapping",
		};
	}

	return {
		id: "open_project",
		label: "Open Project",
		description:
			"Project setup, replacement, and generation are unavailable in this migration.",
		route: "/projects",
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
	const outputReadiness = deriveHomeOutputReadiness(input);

	const statuses: HomeWorkflowStepStatus[] = [
		hasSource ? "complete" : hasProject ? "unknown" : "upcoming",
		hasSource ? (selected ? "complete" : "available") : "blocked",
		generated
			? outputReadiness.canPreviewCurrentOutput
				? "complete"
				: "unknown"
			: failed
				? "unknown"
				: "upcoming",
		outputReadiness.canPreviewCurrentOutput ? "available" : "blocked",
	];

	return HOME_WORKFLOW_LABELS.map((label, index) => ({
		index: index + 1,
		label,
		description: workflowDescriptions[label],
		status: statuses[index],
	}));
}

export function formatHomeOutputStatus(
	status: DesktopOutputStatus,
	readiness?: HomeOutputReadiness,
): {
	label: string;
	detail: string;
	tone: HomeTone;
} {
	switch (status) {
		case "generated":
			if (readiness && !readiness.canPreviewCurrentOutput) {
				return {
					label: "Generated output unavailable",
					detail:
						"The persisted export status is current, but its recorded output folder or required managed preview files cannot be opened.",
					tone: "warning",
				};
			}
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
	if (!path) return "No project file";
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
	return [input.sourcePath, input.audioPath].filter((path) => !path).length;
}

function hasRequiredAssetWarning(input: HomeDashboardModelInput): boolean {
	return input.missingPathWarnings.some(
		(warning) =>
			warning.kind === "sourcePath" || warning.kind === "audioPath",
	);
}

function hasMissingRecordedExportTarget(
	input: Pick<HomeDashboardModelInput, "missingPathWarnings">,
): boolean {
	return input.missingPathWarnings.some(
		(warning) => warning.kind === "outputDir",
	);
}

export function deriveHomeOutputReadiness(
	input: Pick<
		HomeDashboardModelInput,
		"outputStatus" | "outputDir" | "missingPathWarnings"
	>,
): HomeOutputReadiness {
	const hasRecordedTarget = !!input.outputDir;
	const recordedTargetMissing = hasMissingRecordedExportTarget(input);
	const requiredManagedPreviewMissing = input.missingPathWarnings.some(
		(warning) =>
			warning.kind === "outputChartPath" ||
			warning.kind === "outputAudioPath",
	);
	const canOpenOutputFolder =
		hasRecordedTarget &&
		!recordedTargetMissing &&
		!requiredManagedPreviewMissing;
	return {
		hasRecordedTarget,
		recordedTargetMissing,
		requiredManagedPreviewMissing,
		canOpenOutputFolder,
		canPreviewCurrentOutput:
			input.outputStatus === "generated" && canOpenOutputFolder,
	};
}
