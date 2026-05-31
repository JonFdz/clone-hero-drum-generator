import { describe, expect, it } from "vitest";
import { XMLParser } from "fast-xml-parser";
import { barPositionToTick, buildGpifTimeline } from "./gpifTimeline.js";

const TEXT_KEY = "#text";
const ATTRIBUTE_PREFIX = "@_";

function parse(xml: string): unknown {
	return new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: ATTRIBUTE_PREFIX,
		textNodeName: TEXT_KEY,
		trimValues: true,
		parseTagValue: false,
		parseAttributeValue: false,
		isArray: (_name: string, jPath: unknown) =>
			/(?:MasterBars\.MasterBar|Automations\.Automation|Markers?\.Marker)$/i.test(String(jPath)),
	}).parse(xml);
}

function masterBars(count: number, changes: Record<number, string> = {}): string {
	return Array.from({ length: count }, (_, index) => `<MasterBar><Time>${changes[index] ?? "4/4"}</Time></MasterBar>`).join("\n");
}

describe("buildGpifTimeline", () => {
	it("converts a Decode-like tempo automation at bar 48 to tick 184320 at 960 PPQ in 4/4", () => {
		const root = parse(`<?xml version="1.0" encoding="UTF-8"?>
<GPIF>
  <Resolution>960</Resolution>
  <MasterBars>${masterBars(49)}</MasterBars>
  <Automations>
    <Automation><Type>Tempo</Type><Bar>0</Bar><Position>0</Position><Value>164 2</Value></Automation>
    <Automation><Type>Tempo</Type><Bar>48</Bar><Position>0</Position><Value>160 2</Value></Automation>
  </Automations>
</GPIF>`);

		const timeline = buildGpifTimeline(root, 960);

		expect(barPositionToTick(timeline, 48, 0)).toBe(184_320);
		expect(timeline.tempos).toEqual([
			{ tick: 0, bpm: 164 },
			{ tick: 184_320, bpm: 160 },
		]);
	});

	it("places markers at their bar timeline tick instead of collapsing to zero", () => {
		const root = parse(`<?xml version="1.0" encoding="UTF-8"?>
<GPIF>
  <Resolution>960</Resolution>
  <MasterBars>${masterBars(5)}</MasterBars>
  <Markers><Marker><Name>Chorus</Name><Bar>4</Bar><Position>0</Position></Marker></Markers>
</GPIF>`);

		const timeline = buildGpifTimeline(root, 960);

		expect(timeline.sections).toEqual([{ tick: 15_360, name: "Chorus" }]);
	});

	it("emits time signature changes at master bar start ticks", () => {
		const root = parse(`<?xml version="1.0" encoding="UTF-8"?>
<GPIF>
  <Resolution>960</Resolution>
  <MasterBars>${masterBars(4, { 2: "3/4", 3: "3/4" })}</MasterBars>
</GPIF>`);

		const timeline = buildGpifTimeline(root, 960);

		expect(timeline.timeSignatures).toEqual([
			{ tick: 0, numerator: 4, denominator: 4 },
			{ tick: 7_680, numerator: 3, denominator: 4 },
		]);
	});
	it("uses MasterBars length rather than per-track Bars count when MasterBars exist", () => {
		const root = parse(`<?xml version="1.0" encoding="UTF-8"?>
<GPIF>
  <Resolution>960</Resolution>
  <MasterBars>${masterBars(2)}</MasterBars>
  <Bars>
    ${Array.from({ length: 10 }, (_, index) => `<Bar id="track-bar-${index}" />`).join("\n")}
  </Bars>
</GPIF>`);

		const timeline = buildGpifTimeline(root, 960);

		expect(timeline.masterBars).toHaveLength(2);
	});

	it("documents current Position conversion semantics", () => {
		const root = parse(`<?xml version="1.0" encoding="UTF-8"?>
<GPIF>
  <Resolution>960</Resolution>
  <MasterBars>${masterBars(2)}</MasterBars>
</GPIF>`);
		const timeline = buildGpifTimeline(root, 960);

		// GPIF tempo evidence for Phase 17I only verified Position=0 in real Decode data.
		// Until broader fixtures prove another unit, CHDG treats integer positions as
		// raw ticks and fractional positions as quarter-note fractions.
		expect(barPositionToTick(timeline, 1, 0)).toBe(3_840);
		expect(barPositionToTick(timeline, 1, 0.5)).toBe(4_320);
		expect(barPositionToTick(timeline, 1, 1)).toBe(3_841);
		expect(barPositionToTick(timeline, 1, 960)).toBe(4_800);
	});

});
