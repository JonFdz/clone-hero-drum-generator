import { describe, expect, it } from "vitest";
import {
	applyMappingProfile,
	validateMappingOverrideProfile,
	validateMappingOverrideProfileStore,
} from "./mappingProfiles.js";

describe("mappingProfiles", () => {
	it("validates profile and store safely", () => {
		expect(validateMappingOverrideProfile({ id: "", name: "x" })).toBeUndefined();
		const store = validateMappingOverrideProfileStore({
			schemaVersion: 1,
			profiles: [
				{
					id: "a",
					name: "A",
					createdAt: "2026-05-22T00:00:00.000Z",
					updatedAt: "2026-05-22T00:00:00.000Z",
					overrides: {},
				},
				{ bad: true },
			],
		});
		expect(store.profiles).toHaveLength(1);
	});

	it("applies replace mode", () => {
		const result = applyMappingProfile({
			projectOverrides: {
				"midi:37": { sourceKind: "midi", key: "midi:37", target: { kind: "ignore" } },
			},
			profileOverrides: {
				"midi:38": { sourceKind: "midi", key: "midi:38", target: { kind: "ignore" } },
			},
			mode: "replace",
		});
		expect(Object.keys(result.overrides)).toEqual(["midi:38"]);
		expect(result.summary.removed).toBe(1);
	});

	it("applies merge mode with profile winning conflicts", () => {
		const result = applyMappingProfile({
			projectOverrides: {
				"midi:37": {
					sourceKind: "midi",
					key: "midi:37",
					target: { kind: "piece", piece: "snare" },
				},
			},
			profileOverrides: {
				"midi:37": { sourceKind: "midi", key: "midi:37", target: { kind: "ignore" } },
				"midi:38": { sourceKind: "midi", key: "midi:38", target: { kind: "ignore" } },
			},
			mode: "merge",
		});
		expect(result.overrides["midi:37"]?.target.kind).toBe("ignore");
		expect(result.summary).toEqual({ added: 1, replaced: 1, kept: 0 });
	});
});
