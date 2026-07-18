import { describe, expect, it } from "vitest";
import { buildBrowserGenerationState } from "./browser-generation-seeder";
import type { DesktopGenerateState } from "../app/services/desktop-generate-state.service";

const readyState: DesktopGenerateState = {
	metadata: { name: "Harness Demo" },
	selectedTracks: [3],
	mappingOverrides: {},
	issues: [],
	logs: [],
	status: "ready-to-generate",
};

describe("browser generation seeder", () => {
	it("creates a stable running state without timers or timestamps", () => {
		expect(buildBrowserGenerationState(readyState, "running")).toMatchObject({
			status: "generating",
			logs: [
				"[HARNESS] Validating deterministic project inputs.",
				"[HARNESS] Writing synthetic Clone Hero package.",
			],
			errorMessage: undefined,
		});
	});

	it("creates a stable failed state with related log evidence", () => {
		expect(buildBrowserGenerationState(readyState, "failed")).toMatchObject({
			status: "error",
			errorMessage:
				"Synthetic generation failure: output validation rejected notes.chart.",
			logs: [
				"[HARNESS] Validating deterministic project inputs.",
				"[HARNESS] Error: output validation rejected notes.chart.",
			],
		});
	});
});
