import { describe, expect, it } from "vitest";
import { buildGpifArticulationKey, resolveGpifArticulation } from "./gpifArticulationResolver.js";

describe("resolveGpifArticulation", () => {
	it("prioritizes OutputMidiNumber over non-GM input MIDI", () => {
		const result = resolveGpifArticulation({
			trackIndex: 0,
			name: "Hi-Hat (half)",
			inputMidiNumbers: [92],
			outputMidiNumber: 46,
		});

		expect(result).toMatchObject({
			sourceKind: "gpif",
			action: "map",
			automaticPiece: "hihat_open",
			confidence: "high",
			resolvedVia: "output-midi-number",
		});
	});

	it("keeps pedal hi-hat as a candidate", () => {
		expect(resolveGpifArticulation({ trackIndex: 0, name: "Pedal Hi-Hat", outputMidiNumber: 44 })).toMatchObject({
			action: "candidate",
			suggestedPiece: "hihat_closed",
			confidence: "medium",
			resolvedVia: "output-midi-number",
		});
	});

	it.each([
		["Rimshot", 37, "snare"],
		["Side Stick", 37, "snare"],
		["Cross Stick", 37, "snare"],
		["Ride Bell", 53, "ride"],
		["China", 52, "crash"],
		["Splash", 55, "crash"],
	])("maps clear GPIF articulation %s", (name, outputMidiNumber, automaticPiece) => {
		expect(resolveGpifArticulation({ trackIndex: 0, name, outputMidiNumber })).toMatchObject({
			action: "map",
			automaticPiece,
		});
	});

	it("classifies known auxiliary percussion from the atlas", () => {
		expect(resolveGpifArticulation({ trackIndex: 0, name: "Tambourine", outputMidiNumber: 54 })).toMatchObject({
			action: "ignore",
			confidence: "high",
		});
	});

	it("keeps candidate auxiliary percussion review-only", () => {
		expect(resolveGpifArticulation({ trackIndex: 0, name: "High Bongo", outputMidiNumber: 60 })).toMatchObject({
			action: "candidate",
			suggestedPiece: "tom_high",
		});
	});

	it("keeps unknown custom non-GM input unknown", () => {
		expect(resolveGpifArticulation({ trackIndex: 0, name: "Custom articulation", inputMidiNumbers: [92] })).toMatchObject({
			action: "unknown",
			automaticPiece: "unknown",
			confidence: "low",
			resolvedVia: "unknown",
		});
	});

	it.each([
		["Hi-Hat (half)", 42],
		["Ride Bell", 49],
	])("marks name/output mismatch as conflict for %s", (name, outputMidiNumber) => {
		expect(resolveGpifArticulation({ trackIndex: 0, name, outputMidiNumber })).toMatchObject({
			action: "candidate",
			confidence: "low",
			resolvedVia: "conflict",
		});
	});

	it("applies project overrides before automatic resolution", () => {
		const metadata = { trackIndex: 0, name: "Custom articulation", inputMidiNumbers: [92] };
		const key = buildGpifArticulationKey(metadata);
		expect(resolveGpifArticulation(metadata, { [key]: { target: { kind: "piece", piece: "snare" } } })).toMatchObject({
			action: "map",
			automaticPiece: "snare",
			resolvedVia: "override",
		});
		expect(resolveGpifArticulation(metadata, { [key]: { target: { kind: "ignore" } } })).toMatchObject({
			action: "ignore",
			resolvedVia: "override",
		});
	});
});
