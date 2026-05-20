import { describe, expect, it } from "vitest";
import {
	createValidationSummary,
	validationItemFromProjectIssue,
	type ValidationItem,
} from "./validation.js";

function item(overrides: Partial<ValidationItem>): ValidationItem {
	return {
		id: "project.info",
		category: "project",
		severity: "info",
		title: "Info",
		message: "Informational item",
		blocking: false,
		...overrides,
	};
}

describe("validation summary", () => {
	it("counts severities and blocks only on blocking items", () => {
		const summary = createValidationSummary(
			[
				item({
					id: "source.missing",
					category: "source",
					severity: "error",
					blocking: true,
				}),
				item({
					id: "metadata.missing-artist",
					category: "metadata",
					severity: "warning",
				}),
				item({ id: "ffmpeg.available", category: "ffmpeg", severity: "info" }),
			],
			"2026-05-20T00:00:00.000Z",
		);

		expect(summary.canGenerate).toBe(false);
		expect(summary.errorCount).toBe(1);
		expect(summary.warningCount).toBe(1);
		expect(summary.infoCount).toBe(1);
		expect(summary.checkedAt).toBe("2026-05-20T00:00:00.000Z");
	});

	it("allows generation when only warnings and info exist", () => {
		const summary = createValidationSummary([
			item({
				id: "generation.needs-regenerate",
				category: "generation",
				severity: "warning",
			}),
			item({
				id: "generation.generated",
				category: "generation",
				severity: "info",
			}),
		]);

		expect(summary.canGenerate).toBe(true);
		expect(summary.errorCount).toBe(0);
	});

	it("maps merge warnings to stable chart validation IDs", () => {
		expect(
			validationItemFromProjectIssue(
				{
					severity: "warning",
					code: "IMPOSSIBLE_HAND_CHORD",
					message: "Too many hand notes.",
				},
				"project.issue-0",
			),
		).toMatchObject({
			id: "chart.impossible-hand-chord",
			category: "chart",
			severity: "warning",
			blocking: false,
		});
	});
});
