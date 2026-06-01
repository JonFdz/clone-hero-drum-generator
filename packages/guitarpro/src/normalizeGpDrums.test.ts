import { describe, expect, it } from "vitest";
import { normalizeGpDrumsXml } from "./normalizeGpDrums.js";


function masterBars(count: number): string {
	return Array.from({ length: count }, () => `<MasterBar><Time>4/4</Time></MasterBar>`).join("\n");
}

function referencedMasterBars(count: number, drumBarIndex: number): string {
	return Array.from({ length: count }, (_, index) => {
		const guitarBarId = `g${index}`;
		const drumBarId = index === drumBarIndex ? `d${index}` : "-1";
		return `<MasterBar><Time>4/4</Time><Bars>${guitarBarId} ${drumBarId}</Bars></MasterBar>`;
	}).join("\n");
}

const decodeLikeTempoMapGpif = `<?xml version="1.0" encoding="UTF-8"?>
<GPIF>
  <Score><Title>Decode-like</Title></Score>
  <Resolution>960</Resolution>
  <MasterTrack>
    <Automations>
      <Automation><Type>Tempo</Type><Bar>0</Bar><Position>0</Position><Value>164 2</Value></Automation>
      <Automation><Type>Tempo</Type><Bar>48</Bar><Position>0</Position><Value>160 2</Value></Automation>
    </Automations>
    <Markers><Marker><Name>Bridge</Name><Bar>48</Bar><Position>0</Position></Marker></Markers>
  </MasterTrack>
  <MasterBars>${referencedMasterBars(49, 48)}</MasterBars>
  <Tracks>
    <Track id="guitar"><Name>Guitar</Name><InstrumentName>Electric Guitar</InstrumentName></Track>
    <Track id="drums"><Name>Drums</Name><InstrumentName>Standard Drum Kit</InstrumentName><Channel>10</Channel></Track>
  </Tracks>
  <Bars>
    <Bar id="g0"><Track>guitar</Track></Bar>
    <Bar id="d48"><Track>drums</Track><Voices><Voice><Beats><Beat><Duration>Quarter</Duration><Notes><Note><Name>Kick</Name></Note></Notes></Beat></Beats></Voice></Voices></Bar>
  </Bars>
</GPIF>`;

const decodeLikeSections = new Map<number, string>([
	[0, "Intro"],
	[8, "Verse 1"],
	[24, "Refrain"],
	[32, "Chorus"],
	[48, "Break"],
	[52, "Verse 2"],
	[92, "Solo"],
	[108, "Bridge"],
]);

const decodeLikeSectionsGpif = `<?xml version="1.0" encoding="UTF-8"?>
<GPIF>
  <Score><Title>Decode-like sections</Title></Score>
  <Resolution>960</Resolution>
  <MasterBars>
    ${Array.from({ length: 109 }, (_, index) => {
			const section = decodeLikeSections.get(index);
			return `<MasterBar><Time>4/4</Time><Bars>${index}</Bars>${section ? `<Section>${section}</Section>` : ""}</MasterBar>`;
		}).join("\n")}
  </MasterBars>
  <Tracks>
    <Track id="drums"><Name>Drums</Name><InstrumentName>Standard Drum Kit</InstrumentName><Channel>10</Channel></Track>
  </Tracks>
  <Bars>
    <Bar id="0"><Track>drums</Track><Voices><Voice><Beats><Beat><Duration>Quarter</Duration><Notes><Note><Name>Kick</Name></Note></Notes></Beat></Beats></Voice></Voices></Bar>
  </Bars>
</GPIF>`;

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
            <Beat><Duration>Quarter</Duration><Notes><Note><Name>Mystery Effect</Name></Note></Notes></Beat>
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

	it("preserves GPIF tempo automations at their timeline ticks", () => {
		const result = normalizeGpDrumsXml(decodeLikeTempoMapGpif, { trackIndex: 1 });

		expect(result.tempos).toEqual([
			{ tick: 0, bpm: 164 },
			{ tick: 184_320, bpm: 160 },
		]);
	});

	it("places GPIF sections from bar context on the timeline", () => {
		const result = normalizeGpDrumsXml(decodeLikeTempoMapGpif, { trackIndex: 1 });

		expect(result.sections).toEqual([{ tick: 184_320, name: "Bridge" }]);
	});

	it("normalizes Decode-like GPIF master-bar sections at non-zero timeline ticks", () => {
		const result = normalizeGpDrumsXml(decodeLikeSectionsGpif, { trackIndex: 0 });

		expect(result.sections).toEqual([
			{ tick: 0, name: "Intro" },
			{ tick: 30_720, name: "Verse 1" },
			{ tick: 92_160, name: "Refrain" },
			{ tick: 122_880, name: "Chorus" },
			{ tick: 184_320, name: "Break" },
			{ tick: 199_680, name: "Verse 2" },
			{ tick: 353_280, name: "Solo" },
			{ tick: 414_720, name: "Bridge" },
		]);
		expect(result.sections.some((section) => section.tick > 0)).toBe(true);
	});

	it("uses the original master bar index for selected GPIF note ticks", () => {
		const result = normalizeGpDrumsXml(decodeLikeTempoMapGpif, { trackIndex: 1 });

		expect(result.hits).toContainEqual(
			expect.objectContaining({
				tick: 184_320,
				piece: "kick",
				source: expect.objectContaining({ measureIndex: 48 }),
			}),
		);
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
			expect.objectContaining({ rawArticulation: "Mystery Effect", count: 1 }),
		]);
	});

	it("uses GPIF OutputMidiNumber before internal input MIDI numbers", () => {
		const xml = `<GPIF><Tracks><Track id="drums"><Name>Drums</Name><InstrumentName>Drumkit</InstrumentName></Track></Tracks><Bars><Bar><Track>drums</Track><Voices><Voice><Beats><Beat><Notes><Note><Name>Hi-Hat (half)</Name><InputMidiNumbers>92</InputMidiNumbers><OutputMidiNumber>46</OutputMidiNumber></Note></Notes></Beat></Beats></Voice></Voices></Bar></Bars></GPIF>`;
		const result = normalizeGpDrumsXml(xml, { trackIndex: 0 });

		expect(result.hits).toContainEqual(
			expect.objectContaining({
				piece: "hihat_open",
				source: expect.objectContaining({
					inputMidiNumbers: [92],
					outputMidiNumber: 46,
					resolvedVia: "output-midi-number",
				}),
			}),
		);
		expect(result.unknownArticulations).toEqual([]);
		expect(result.mappingSources[0]).toMatchObject({
			action: "map",
			automaticPiece: "hihat_open",
			resolvedVia: "output-midi-number",
		});
	});

	it("resolves notes that reference external GPIF articulation definitions", () => {
		const xml = `<GPIF>
			<InstrumentSet>
				<Elements>
					<Element id="hh-half">
						<Name>Hi-Hat (half)</Name>
						<InputMidiNumbers>92</InputMidiNumbers>
						<OutputMidiNumber>46</OutputMidiNumber>
					</Element>
				</Elements>
			</InstrumentSet>
			<Tracks><Track id="drums"><Name>Drums</Name><InstrumentName>Drumkit</InstrumentName></Track></Tracks>
			<Bars><Bar><Track>drums</Track><Voices><Voice><Beats><Beat><Notes><Note><Element ref="hh-half" /></Note></Notes></Beat></Beats></Voice></Voices></Bar></Bars>
		</GPIF>`;
		const result = normalizeGpDrumsXml(xml, { trackIndex: 0 });

		expect(result.hits).toContainEqual(
			expect.objectContaining({
				piece: "hihat_open",
				source: expect.objectContaining({
					noteName: "Hi-Hat (half)",
					inputMidiNumbers: [92],
					outputMidiNumber: 46,
					resolvedVia: "output-midi-number",
				}),
			}),
		);
		expect(result.unknownArticulations).toEqual([]);
	});

	it("keeps candidate articulations out of hits unless overridden", () => {
		const xml = `<GPIF><Tracks><Track id="drums"><Name>Drums</Name><InstrumentName>Drumkit</InstrumentName></Track></Tracks><Bars><Bar><Track>drums</Track><Voices><Voice><Beats><Beat><Notes><Note><Name>Pedal Hi-Hat</Name><OutputMidiNumber>44</OutputMidiNumber></Note></Notes></Beat></Beats></Voice></Voices></Bar></Bars></GPIF>`;
		const initial = normalizeGpDrumsXml(xml, { trackIndex: 0 });
		const key = initial.mappingSources[0].key;

		expect(initial.hits).toEqual([]);
		expect(initial.mappingSources[0]).toMatchObject({
			action: "candidate",
			suggestedPiece: "hihat_closed",
		});

		const overridden = normalizeGpDrumsXml(xml, {
			trackIndex: 0,
			mappingOverrides: {
				[key]: { target: { kind: "piece", piece: "hihat_closed" } },
			},
		});

		expect(overridden.hits).toContainEqual(
			expect.objectContaining({ piece: "hihat_closed" }),
		);
	});

	it("honors ignore overrides for GPIF articulations", () => {
		const xml = `<GPIF><Tracks><Track id="drums"><Name>Drums</Name><InstrumentName>Drumkit</InstrumentName></Track></Tracks><Bars><Bar><Track>drums</Track><Voices><Voice><Beats><Beat><Notes><Note><Name>Kick</Name></Note></Notes></Beat></Beats></Voice></Voices></Bar></Bars></GPIF>`;
		const initial = normalizeGpDrumsXml(xml, { trackIndex: 0 });
		const key = initial.mappingSources[0].key;
		const result = normalizeGpDrumsXml(xml, {
			trackIndex: 0,
			mappingOverrides: { [key]: { target: { kind: "ignore" } } },
		});

		expect(result.hits).toEqual([]);
		expect(result.mappingSources[0]).toMatchObject({
			action: "ignore",
			resolvedVia: "override",
		});
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
