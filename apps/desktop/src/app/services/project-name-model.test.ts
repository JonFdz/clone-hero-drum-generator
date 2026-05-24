import { describe, expect, it } from "vitest";
import { createDefaultProjectName } from "./project-name-model";

describe("createDefaultProjectName", () => {
	it("includes date, time, and seconds", () => {
		const name = createDefaultProjectName(
			new Date("2026-05-24T13:32:10.000Z"),
		);
		expect(name).toContain("2026-05-24");
		expect(name).toContain("13-32-10");
	});

	it("is deterministic for a fixed date", () => {
		const date = new Date("2026-05-24T13:32:10.000Z");
		expect(createDefaultProjectName(date)).toBe(createDefaultProjectName(date));
	});

	it("does not use a date-only same-day name", () => {
		expect(createDefaultProjectName(new Date("2026-05-24T01:02:03.000Z"))).not.toBe(
			"Untitled 2026-05-24",
		);
	});
});
