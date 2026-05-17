import { describe, expect, it } from "vitest";
import { normalizeGpDrumsXml } from "./normalizeGpDrums.js";

const syntheticGpif = `<?xml version="1.0" encoding="UTF-8"?>
<GPIF>
  <Score><Title>Normalization Demo</Title><Tempo>147</Tempo></Score>
  <Resolution>960</Resolution>
  <MasterBars><MasterBar><Time>7/8</Time></MasterBar></MasterBars>
  <Tracks>
    <Track id="1"><Name>Guitar</Name><InstrumentName>Electric Guitar</InstrumentName></Track>
    <Track id="2"><Name>Drums</Name><InstrumentName>Standard Drum Kit</InstrumentName><Channel>10</Channel></Track>
  </Tracks>
  <Bars>
    <Bar>
      <Track>2</Track>
      <Duration>Whole</Duration>
      <Voices>
        <Voice>
          <Beats>
            <Beat><Duration>Quarter</Duration><Notes><Note><Name>Kick</Name></Note></Notes></Beat>
            <Beat><Duration>Quarter</Duration><Notes><Note><Name>Closed Hi-Hat</Name><Velocity>88</Velocity></Note></Notes></Beat>
            <Beat><Duration>Quarter</Duration><Notes><Note><Name>Open Hi-Hat</Name><Dynamic>ff</Dynamic></Note></Notes></Beat>
            <Beat><Duration>Quarter</Duration><Notes><Note><Name>Mystery Splash</Name></Note></Notes></Beat>
          </Beats>
        </Voice>
      </Voices>
    </Bar>
    <Bar>
      <Track>2</Track>
      <Duration>Whole</Duration>
      <Voices>
        <Voice>
          <Beats>
            <Beat><Tick>480</Tick><Duration>Eighth</Duration><Notes><Note><Name>Snare</Name><Dynamic>mf</Dynamic></Note></Notes></Beat>
            <Beat><Tick>0</Tick><Duration>Eighth</Duration><Notes><Note><Name>Crash</Name></Note></Notes></Beat>
            <Beat><Tick>960</Tick><Duration>Quarter</Duration><Notes><Note><Name>Ride</Name></Note><Note><Name>High Tom</Name></Note></Notes></Beat>
            <Beat><Tick>1920</Tick><Duration>Quarter</Duration><Notes><Note><Name>Mid Tom</Name></Note><Note><Name>Floor Tom</Name></Note></Notes></Beat>
          </Beats>
        </Voice>
      </Voices>
    </Bar>
  </Bars>
</GPIF>`;

describe("normalizeGpDrumsXml", () => {
	it("normalizes supported GPIF drum articulations into DrumHit values", () => {
		const result = normalizeGpDrumsXml(syntheticGpif, {
			filePath: "song.gp",
			trackIndex: 1,
		});

		expect(result.filePath).toBe("song.gp");
		expect(result.trackName).toBe("Drums");
		expect(result.resolution).toBe(960);
		expect(result.hits.map((hit) => hit.piece)).toEqual([
			"kick",
			"hihat_closed",
			"hihat_open",
			"crash",
			"snare",
			"ride",
			"tom_high",
			"tom_mid",
			"tom_floor",
		]);
		expect(result.hits[0]).toMatchObject({
			tick: 0,
			piece: "kick",
			velocity: 95,
			durationTicks: 0,
		});
		expect(result.hits[0].source).toMatchObject({
			kind: "gpif",
			trackIndex: 1,
			rawArticulation: "Kick",
		});
	});

	it("normalizes basic GPIF timing metadata for chart generation", () => {
		const result = normalizeGpDrumsXml(syntheticGpif, { trackIndex: 1 });

		expect(result.tempos).toEqual([{ tick: 0, bpm: 147 }]);
		expect(result.timeSignatures).toEqual([
			{ tick: 0, numerator: 7, denominator: 8 },
		]);
		expect(result.sections).toEqual([]);
	});

	it("maps open and closed hi-hats distinctly", () => {
		const result = normalizeGpDrumsXml(syntheticGpif, { trackIndex: 1 });

		expect(result.hits).toContainEqual(
			expect.objectContaining({ tick: 960, piece: "hihat_closed" }),
		);
		expect(result.hits).toContainEqual(
			expect.objectContaining({ tick: 1920, piece: "hihat_open" }),
		);
	});

	it("reports unknown articulations without crashing", () => {
		const result = normalizeGpDrumsXml(syntheticGpif, { trackIndex: 1 });

		expect(result.unknownArticulations).toEqual([
			expect.objectContaining({ rawArticulation: "Mystery Splash", count: 1 }),
		]);
	});

	it("uses stable default velocity and documented dynamic mapping", () => {
		const result = normalizeGpDrumsXml(syntheticGpif, { trackIndex: 1 });

		expect(result.hits.find((hit) => hit.piece === "kick")?.velocity).toBe(95);
		expect(
			result.hits.find((hit) => hit.piece === "hihat_closed")?.velocity,
		).toBe(88);
		expect(
			result.hits.find((hit) => hit.piece === "hihat_open")?.velocity,
		).toBe(115);
		expect(result.hits.find((hit) => hit.piece === "snare")?.velocity).toBe(80);
	});

	it("throws clearly for invalid track index", () => {
		expect(() =>
			normalizeGpDrumsXml(syntheticGpif, { trackIndex: 99 }),
		).toThrow(/invalid gpif track index 99/i);
	});

	it("warns but attempts normalization for selected non-drum tracks", () => {
		const xml = `<GPIF><Tracks><Track id="1"><Name>Guitar</Name></Track></Tracks><Bars><Bar><Track>1</Track><Voices><Voice><Beats><Beat><Notes><Note><Name>Kick</Name></Note></Notes></Beat></Beats></Voice></Voices></Bar></Bars></GPIF>`;
		const result = normalizeGpDrumsXml(xml, { trackIndex: 0 });

		expect(result.warnings.join("\n")).toMatch(
			/not a detected drum candidate/i,
		);
		expect(result.hits).toContainEqual(
			expect.objectContaining({ piece: "kick" }),
		);
	});

	it("reports unsupported repeat or alternate-ending timing structures", () => {
		const xml = `<GPIF><Tracks><Track id="1"><Name>Drums</Name><InstrumentName>Drumkit</InstrumentName></Track></Tracks><MasterBars><MasterBar><Bars>0</Bars><RepeatClose>2</RepeatClose><AlternateEnding>1</AlternateEnding></MasterBar></MasterBars><Bars><Bar id="0"><Voices><Voice><Beats><Beat><Duration>Quarter</Duration><Notes><Note><Name>Kick</Name></Note></Notes></Beat></Beats></Voice></Voices></Bar></Bars></GPIF>`;
		const result = normalizeGpDrumsXml(xml, { trackIndex: 0 });

		expect(result.hits).toContainEqual(
			expect.objectContaining({ piece: "kick" }),
		);
		expect(result.unhandled.join("\n")).toMatch(
			/unsupported gpif timing structure/i,
		);
		expect(result.unhandled.join("\n")).toMatch(/repeat/i);
		expect(result.unhandled.join("\n")).toMatch(/alternate/i);
	});

	it("keeps hit ordering deterministic", () => {
		const first = normalizeGpDrumsXml(syntheticGpif, { trackIndex: 1 });
		const second = normalizeGpDrumsXml(syntheticGpif, { trackIndex: 1 });

		expect(second.hits).toEqual(first.hits);
		expect(second.unknownArticulations).toEqual(first.unknownArticulations);
	});
});
