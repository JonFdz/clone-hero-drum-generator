import { describe, expect, it } from "vitest";
import {
	applyProjectMappingOverrides,
	buildMappingOverrideKeyFromHit,
	type ProjectMappingOverrides,
	validateMappingOverrides,
} from "./mappingOverrides.js";

describe("mappingOverrides", () => {
	it("applies MIDI note -> piece override", () => {
		const hits = [
			{
				tick: 0,
				piece: "kick",
				velocity: 100,
				durationTicks: 0,
				source: { midiNote: 37, trackIndex: 0, trackName: "Drums", channel: 9 },
			},
		] as const;
		const overrides: ProjectMappingOverrides = {
			"midi:37": {
				sourceKind: "midi",
				key: "midi:37",
				target: { kind: "piece", piece: "snare" },
			},
		};
		const result = applyProjectMappingOverrides([...hits], overrides);
		expect(result[0].piece).toBe("snare");
	});

	it("applies GPIF ignore override", () => {
		const hits = [
			{
				tick: 0,
				piece: "snare",
				velocity: 100,
				durationTicks: 0,
				source: { kind: "gpif" as const, trackIndex: 0, rawArticulation: "Side Stick" },
			},
		];
		const overrides: ProjectMappingOverrides = {
			"gpif:side stick": {
				sourceKind: "gpif",
				key: "gpif:side stick",
				target: { kind: "ignore" },
			},
		};
		const result = applyProjectMappingOverrides(hits, overrides);
		expect(result).toEqual([]);
	});

	it("builds source keys from hit source", () => {
		expect(
			buildMappingOverrideKeyFromHit({
				tick: 0,
				piece: "kick",
				velocity: 1,
				durationTicks: 0,
				source: { midiNote: 36, trackIndex: 0, trackName: "Drums", channel: 9 },
			}),
		).toBe("midi:36");
		expect(
			buildMappingOverrideKeyFromHit({
				tick: 0,
				piece: "snare",
				velocity: 1,
				durationTicks: 0,
				source: { kind: "gpif", trackIndex: 0, rawArticulation: "Cross Stick" },
			}),
		).toBe("gpif:cross stick");
	});

	it("drops malformed override payload entries", () => {
		const result = validateMappingOverrides({
			"midi:37": {
				sourceKind: "midi",
				key: "midi:37",
				target: { kind: "piece", piece: "snare" },
			},
			bad: {
				sourceKind: "midi",
				key: "",
				target: { kind: "piece", piece: "invalid" },
			},
		});
		expect(Object.keys(result)).toEqual(["midi:37"]);
	});
});
