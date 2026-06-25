import { describe, expect, it } from "vitest";
import { buildHighwaySemanticNotes } from "./highway-note-semantics";

function event(
	tick: number,
	lane: number,
	seconds: number,
	length = 0,
	endSeconds = seconds,
) {
	return { tick, lane, length, seconds, endSeconds };
}

describe("highway-note-semantics", () => {
	it("maps kick lane 0 to one kick rail semantic note", () => {
		const notes = buildHighwaySemanticNotes([event(0, 0, 0.5)]);
		expect(notes).toEqual([
			expect.objectContaining({
				chartLane: 0,
				pitchedLane: null,
				visualKind: "kick-rail",
			}),
		]);
	});

	it("maps base lanes 1..4 to red/yellow/blue/green pitched lanes", () => {
		const notes = buildHighwaySemanticNotes([
			event(0, 1, 0.5),
			event(1, 2, 0.6),
			event(2, 3, 0.7),
			event(3, 4, 0.8),
		]);
		expect(notes.map((note) => note.pitchedLane)).toEqual([
			"red",
			"yellow",
			"blue",
			"green",
		]);
		expect(notes.map((note) => note.visualKind)).toEqual([
			"square-head",
			"square-head",
			"square-head",
			"square-head",
		]);
	});

	it("turns supported yellow blue and green cymbal markers into circular heads only", () => {
		const notes = buildHighwaySemanticNotes([
			event(0, 1, 0.5),
			event(1, 2, 0.6),
			event(1, 66, 0.6),
			event(2, 3, 0.7),
			event(2, 67, 0.7),
			event(3, 4, 0.8),
			event(3, 68, 0.8),
			event(0, 66, 0.5),
		]);
		expect(notes.map((note) => note.visualKind)).toEqual([
			"square-head",
			"cymbal-head",
			"cymbal-head",
			"cymbal-head",
		]);
	});

	it("applies compatible accent and ghost markers with accent precedence", () => {
		const notes = buildHighwaySemanticNotes([
			event(0, 1, 0.5),
			event(0, 34, 0.5),
			event(1, 2, 0.6),
			event(1, 41, 0.6),
			event(2, 3, 0.7),
			event(2, 36, 0.7),
			event(2, 42, 0.7),
		]);
		expect(notes.map((note) => note.dynamic)).toEqual([
			"accent",
			"ghost",
			"accent",
		]);
	});

	it("keeps cymbal plus accent as a circular accented note", () => {
		const notes = buildHighwaySemanticNotes([
			event(0, 2, 0.5),
			event(0, 66, 0.5),
			event(0, 35, 0.5),
		]);
		expect(notes[0]).toEqual(
			expect.objectContaining({
				visualKind: "cymbal-head",
				dynamic: "accent",
			}),
		);
	});

	it("ignores orphan, unknown, malformed, and unsupported kick dynamic events", () => {
		const notes = buildHighwaySemanticNotes([
			event(0, 34, 0.5),
			event(0, 66, 0.5),
			event(0, 99, 0.5),
			{ tick: 0, lane: 2, length: -1, seconds: 0.5, endSeconds: 0.4 },
			event(1, 0, 1),
			event(1, 40, 1),
		]);
		expect(notes).toHaveLength(1);
		expect(notes[0]).toEqual(
			expect.objectContaining({ visualKind: "kick-rail", dynamic: null }),
		);
	});

	it("preserves duplicate valid base events as separate deterministic notes", () => {
		const notes = buildHighwaySemanticNotes([
			event(0, 2, 0.5),
			event(0, 2, 0.5),
			event(0, 66, 0.5),
		]);
		expect(notes.map((note) => note.id)).toEqual(["0-2-0", "0-2-1"]);
		expect(notes.every((note) => note.visualKind === "cymbal-head")).toBe(true);
	});
});
