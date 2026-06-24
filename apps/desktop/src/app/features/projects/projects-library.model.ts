import type { ChdgOutputStatus, RecentProject } from "@chdg/project/browser";

export type ProjectsSourceFilter = "all" | "midi" | "guitar-pro" | "unknown";
export type ProjectsSourceType = Exclude<ProjectsSourceFilter, "all">;
export type ProjectsSortMode = "last-opened" | "name-az";
export type ProjectsTone = "neutral" | "success" | "warning" | "danger" | "accent";

export type ProjectsLibraryItem = RecentProject & {
	coverLabel: string;
	lastOpenedLabel: string;
	sourceType: ProjectsSourceType;
	sourceLabel: string;
	statusLabel: string;
	statusTone: ProjectsTone;
	isCurrent: boolean;
};

export type ProjectsLibraryStats = {
	totalProjects: number;
	openedToday: number;
	openedThisWeek: number;
	sourceCounts: Record<ProjectsSourceType, number>;
	mostRecentLabel: string;
};

export type ProjectsLibraryModel = {
	projects: ProjectsLibraryItem[];
	stats: ProjectsLibraryStats;
	resultCount: number;
	totalCount: number;
};

export type ProjectsLibraryModelInput = {
	recentProjects: RecentProject[];
	query: string;
	sourceFilter: ProjectsSourceFilter;
	sortMode: ProjectsSortMode;
	currentProjectFilePath?: string;
	currentOutputStatus: ChdgOutputStatus;
	now?: Date;
};

const sourceLabels: Record<ProjectsSourceType, string> = {
	midi: "MIDI-like",
	"guitar-pro": "Guitar Pro-like",
	unknown: "Unknown",
};

export function deriveProjectsLibraryModel(
	input: ProjectsLibraryModelInput,
): ProjectsLibraryModel {
	const now = input.now ?? new Date();
	const sorted = sortProjects(
		filterProjects(input.recentProjects, input.query, input.sourceFilter),
		input.sortMode,
	);
	const projects = sorted.map((project) => {
		const sourceType = inferProjectSourceType(project);
		const current = isCurrentProject(project, input.currentProjectFilePath);
		const status = current
			? formatProjectOutputStatus(input.currentOutputStatus)
			: { label: "Recent", tone: "neutral" as const };
		return {
			...project,
			coverLabel: deriveCoverLabel(project.name),
			lastOpenedLabel: formatLastOpenedLabel(project.lastOpenedAt, now),
			sourceType,
			sourceLabel: sourceLabels[sourceType],
			statusLabel: status.label,
			statusTone: status.tone,
			isCurrent: current,
		};
	});
	return {
		projects,
		stats: deriveLibraryStats(input.recentProjects, now),
		resultCount: projects.length,
		totalCount: input.recentProjects.length,
	};
}

export function filterProjects(
	projects: RecentProject[],
	query: string,
	sourceFilter: ProjectsSourceFilter = "all",
): RecentProject[] {
	const normalizedQuery = query.trim().toLocaleLowerCase();
	return projects.filter((project) => {
		const matchesQuery =
			normalizedQuery.length === 0 ||
			project.name.toLocaleLowerCase().includes(normalizedQuery) ||
			project.path.toLocaleLowerCase().includes(normalizedQuery);
		const matchesSource =
			sourceFilter === "all" || inferProjectSourceType(project) === sourceFilter;
		return matchesQuery && matchesSource;
	});
}

export function sortProjects(
	projects: RecentProject[],
	sortMode: ProjectsSortMode,
): RecentProject[] {
	return [...projects].sort((a, b) => {
		if (sortMode === "name-az") {
			return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
		}
		return parseDate(b.lastOpenedAt) - parseDate(a.lastOpenedAt);
	});
}

export function inferProjectSourceType(project: Pick<RecentProject, "name" | "path">): ProjectsSourceType {
	const haystack = `${project.name} ${project.path}`.toLocaleLowerCase();
	if (/\b(midi|mid)\b|\.(mid|midi)(\b|$)/.test(haystack)) {
		return "midi";
	}
	if (/\b(guitar\s*pro|gpif|gp[345x]?|songsterr)\b|\.(gp|gpif|gpx|gp3|gp4|gp5)(\b|$)/.test(haystack)) {
		return "guitar-pro";
	}
	return "unknown";
}

export function formatLastOpenedLabel(value: string, now = new Date()): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Unknown";
	const time = new Intl.DateTimeFormat(undefined, {
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
	if (isSameCalendarDay(date, now)) return `Today, ${time}`;
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (isSameCalendarDay(date, yesterday)) return `Yesterday, ${time}`;
	return new Intl.DateTimeFormat(undefined, {
		month: "short",
		day: "numeric",
		year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

export function deriveLibraryStats(
	projects: RecentProject[],
	now = new Date(),
): ProjectsLibraryStats {
	const sourceCounts: Record<ProjectsSourceType, number> = {
		midi: 0,
		"guitar-pro": 0,
		unknown: 0,
	};
	let openedToday = 0;
	let openedThisWeek = 0;
	for (const project of projects) {
		sourceCounts[inferProjectSourceType(project)] += 1;
		const openedAt = new Date(project.lastOpenedAt);
		if (Number.isNaN(openedAt.getTime())) continue;
		if (isSameCalendarDay(openedAt, now)) openedToday += 1;
		const ageMs = now.getTime() - openedAt.getTime();
		if (ageMs >= 0 && ageMs <= 7 * 24 * 60 * 60 * 1000) openedThisWeek += 1;
	}
	const mostRecent = sortProjects(projects, "last-opened")[0];
	return {
		totalProjects: projects.length,
		openedToday,
		openedThisWeek,
		sourceCounts,
		mostRecentLabel: mostRecent
			? formatLastOpenedLabel(mostRecent.lastOpenedAt, now)
			: "None yet",
	};
}

export function isCurrentProject(
	project: Pick<RecentProject, "path">,
	currentProjectFilePath?: string,
): boolean {
	return !!currentProjectFilePath && project.path === currentProjectFilePath;
}

export function formatProjectOutputStatus(status: ChdgOutputStatus): {
	label: string;
	tone: ProjectsTone;
} {
	switch (status) {
		case "generated":
			return { label: "Generated", tone: "success" };
		case "needs-regenerate":
			return { label: "Needs regenerate", tone: "warning" };
		case "failed":
			return { label: "Failed", tone: "danger" };
		case "not-generated":
		default:
			return { label: "Not generated", tone: "neutral" };
	}
}

function deriveCoverLabel(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return "CH";
	if (words.length === 1) return words[0].slice(0, 2).toLocaleUpperCase();
	return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toLocaleUpperCase();
}

function parseDate(value: string): number {
	const date = new Date(value).getTime();
	return Number.isNaN(date) ? 0 : date;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}
