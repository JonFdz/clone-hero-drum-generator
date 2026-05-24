import { describe, expect, it } from "vitest";
import type { RecentProject } from "@chdg/project/browser";
import {
	deriveLibraryStats,
	deriveProjectsLibraryModel,
	filterProjects,
	inferProjectSourceType,
	sortProjects,
} from "./projects-library-model";

const now = new Date("2026-05-23T12:00:00.000Z");

function recent(overrides: Partial<RecentProject>): RecentProject {
	return {
		name: "Demo Project",
		path: "/tmp/demo.chdg",
		lastOpenedAt: "2026-05-23T10:00:00.000Z",
		...overrides,
	};
}

describe("projects library filtering", () => {
	const projects = [
		recent({ name: "Eat My Dust", path: "/projects/eat-my-dust.chdg" }),
		recent({ name: "Granite Practice", path: "/projects/gp/granite.chdg" }),
	];

	it("search filters by name", () => {
		expect(filterProjects(projects, "eat", "all")).toEqual([projects[0]]);
	});

	it("search filters by path", () => {
		expect(filterProjects(projects, "gp/granite", "all")).toEqual([projects[1]]);
	});
});

describe("projects source type inference", () => {
	it("infers MIDI-like from project name or path", () => {
		expect(inferProjectSourceType(recent({ name: "Demo MIDI Test" }))).toBe("midi");
		expect(inferProjectSourceType(recent({ path: "/sources/song.mid.chdg" }))).toBe("midi");
	});

	it("infers Guitar Pro-like from project name or path", () => {
		expect(inferProjectSourceType(recent({ name: "Songsterr GP Test" }))).toBe("guitar-pro");
		expect(inferProjectSourceType(recent({ path: "/sources/song.gp5.chdg" }))).toBe("guitar-pro");
	});

	it("infers Unknown when there is no safe source hint", () => {
		expect(inferProjectSourceType(recent({ name: "Granite Practice", path: "/projects/granite.chdg" }))).toBe("unknown");
	});
});

describe("projects sorting", () => {
	const projects = [
		recent({ name: "Beta", lastOpenedAt: "2026-05-21T10:00:00.000Z" }),
		recent({ name: "Alpha", lastOpenedAt: "2026-05-23T10:00:00.000Z" }),
	];

	it("sorts by lastOpenedAt descending", () => {
		expect(sortProjects(projects, "last-opened").map((project) => project.name)).toEqual(["Alpha", "Beta"]);
	});

	it("sorts by name A-Z", () => {
		expect(sortProjects(projects, "name-az").map((project) => project.name)).toEqual(["Alpha", "Beta"]);
	});
});

describe("projects library stats", () => {
	const projects = [
		recent({ name: "Today MIDI", lastOpenedAt: "2026-05-23T10:00:00.000Z" }),
		recent({ name: "Week GP", lastOpenedAt: "2026-05-19T10:00:00.000Z" }),
		recent({ name: "Old Unknown", path: "/tmp/old.chdg", lastOpenedAt: "2026-04-01T10:00:00.000Z" }),
	];

	it("counts total projects", () => {
		expect(deriveLibraryStats(projects, now).totalProjects).toBe(3);
	});

	it("counts opened today and this week", () => {
		const stats = deriveLibraryStats(projects, now);
		expect(stats.openedToday).toBe(1);
		expect(stats.openedThisWeek).toBe(2);
	});

	it("counts source types", () => {
		const stats = deriveLibraryStats(projects, now);
		expect(stats.sourceCounts).toEqual({ midi: 1, "guitar-pro": 1, unknown: 1 });
	});
});

describe("projects library current status", () => {
	const projects = [
		recent({ name: "Current", path: "/tmp/current.chdg" }),
		recent({ name: "Other", path: "/tmp/other.chdg" }),
	];

	it("gives current loaded project the real output status", () => {
		const model = deriveProjectsLibraryModel({
			recentProjects: projects,
			query: "",
			sourceFilter: "all",
			sortMode: "last-opened",
			currentProjectFilePath: "/tmp/current.chdg",
			currentOutputStatus: "generated",
			now,
		});
		expect(model.projects[0]).toMatchObject({ statusLabel: "Generated", statusTone: "success" });
	});

	it("gives non-current recent projects a neutral status", () => {
		const model = deriveProjectsLibraryModel({
			recentProjects: projects,
			query: "",
			sourceFilter: "all",
			sortMode: "last-opened",
			currentProjectFilePath: "/tmp/current.chdg",
			currentOutputStatus: "generated",
			now,
		});
		expect(model.projects[1]).toMatchObject({ statusLabel: "Recent", statusTone: "neutral" });
	});
});
