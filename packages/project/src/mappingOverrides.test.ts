import { describe, expect, it } from "vitest";
import {
	applyProjectMappingOverrides,
	buildGpifOverrideKey,
	buildMappingCandidates,
	buildMappingOverrideKeyFromHit,
	buildMidiOverrideKey,
	hasPieceOverrideForGpifArticulation,
	hasPieceOverrideForMidiNote,
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

	it("builds mapping candidates from all hits and aggregates counts", () => {
		const hits = [
			{
				tick: 20,
				piece: "unknown",
				velocity: 80,
				durationTicks: 0,
				source: { midiNote: 39, trackIndex: 0, trackName: "Drums", channel: 9 },
			},
			{
				tick: 10,
				piece: "unknown",
				velocity: 70,
				durationTicks: 0,
				source: { midiNote: 39, trackIndex: 0, trackName: "Drums", channel: 9 },
			},
			{
				tick: 30,
				piece: "snare",
				velocity: 100,
				durationTicks: 0,
				source: { kind: "gpif" as const, trackIndex: 0, rawArticulation: "Side Stick" },
			},
		];
		const candidates = buildMappingCandidates(hits);
		expect(candidates).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: "midi:39",
					count: 2,
					firstTick: 10,
					automaticPiece: "unknown",
				}),
				expect.objectContaining({
					key: "gpif:side stick",
					automaticPiece: "snare",
				}),
			]),
		);
	});

	it("detects piece overrides by midi and gpif keys", () => {
		const overrides: ProjectMappingOverrides = {
			[buildMidiOverrideKey(37)]: {
				sourceKind: "midi",
				key: buildMidiOverrideKey(37),
				target: { kind: "piece", piece: "snare" },
			},
			[buildGpifOverrideKey("Side Stick")]: {
				sourceKind: "gpif",
				key: buildGpifOverrideKey("Side Stick"),
				target: { kind: "ignore" },
			},
		};
		expect(hasPieceOverrideForMidiNote(overrides, 37)).toBe(true);
		expect(hasPieceOverrideForMidiNote(overrides, 38)).toBe(false);
		expect(hasPieceOverrideForGpifArticulation(overrides, "Side Stick")).toBe(
			false,
		);
	});
});
