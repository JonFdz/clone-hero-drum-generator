import { describe, expect, it } from "vitest";
import { inspectGpifXml } from "./inspectGpif.js";

const minimalGpif = `<?xml version="1.0" encoding="UTF-8"?>
<GPIF>
  <Score>
    <Title>Inspection Demo</Title>
    <Artist>CHDG</Artist>
    <Album>Synthetic Tests</Album>
    <Composer>Test Composer</Composer>
    <Tempo>147</Tempo>
  </Score>
  <Tracks>
    <Track id="1">
      <Name>Guitar</Name>
      <InstrumentName>Electric Guitar</InstrumentName>
      <Channel>1</Channel>
    </Track>
    <Track id="2">
      <Name>Drums</Name>
      <InstrumentName>Standard Drum Kit</InstrumentName>
      <Channel>10</Channel>
    </Track>
  </Tracks>
  <MasterBars>
    <MasterBar>
      <TimeSignature>4/4</TimeSignature>
      <Marker><Name>Intro</Name></Marker>
      <Bars>guitar-bar-1 drums-bar-1</Bars>
    </MasterBar>
    <MasterBar>
      <Marker><Name>Chorus</Name></Marker>
      <Bars>guitar-bar-2 drums-bar-2</Bars>
    </MasterBar>
  </MasterBars>
  <Bars>
    <Bar id="guitar-bar-1"><Voices><Voice><Beats><Beat><Notes><Note><Name>G3</Name></Note></Notes></Beat></Beats></Voice></Voices></Bar>
    <Bar id="drums-bar-1"><Voices><Voice><Beats><Beat><Notes><Note><Name>Kick</Name></Note><Note><Name>Snare</Name></Note></Notes></Beat></Beats></Voice></Voices></Bar>
    <Bar id="guitar-bar-2"><Voices><Voice><Beats><Beat><Notes><Note><Name>A3</Name></Note></Notes></Beat></Beats></Voice></Voices></Bar>
    <Bar id="drums-bar-2"><Voices><Voice><Beats><Beat><Notes><Note><Name>Crash</Name></Note></Notes></Beat></Beats></Voice></Voices></Bar>
  </Bars>
  <DrumArticulations>
    <Articulation><Name>Kick</Name></Articulation>
    <Articulation><Name>Snare</Name></Articulation>
    <Articulation><Name>Snare</Name></Articulation>
  </DrumArticulations>
  <UnknownPercussionThing>Side Stick</UnknownPercussionThing>
</GPIF>`;

describe("inspectGpifXml", () => {
  it("extracts metadata, tracks, timing, markers and drum structures", () => {
    const result = inspectGpifXml(minimalGpif, { filePath: "song.gp", gpifPath: "Content/score.gpif" });

    expect(result.filePath).toBe("song.gp");
    expect(result.gpifPath).toBe("Content/score.gpif");
    expect(result.metadata).toMatchObject({
      title: "Inspection Demo",
      artist: "CHDG",
      album: "Synthetic Tests",
      composer: "Test Composer",
      tempo: "147",
    });
    expect(result.tracks).toHaveLength(2);
    expect(result.tracks[1]).toMatchObject({
      index: 1,
      id: "2",
      name: "Drums",
      instrument: "Standard Drum Kit",
      channel: 10,
      noteCount: 3,
      isDrumCandidate: true,
    });
    expect(result.tracks[0].noteCount).toBe(2);
    expect(result.drumTrackCandidates).toEqual([1]);
    expect(result.tempos).toEqual([{ path: "GPIF.Score.Tempo", value: "147" }]);
    expect(result.timeSignatures).toContainEqual({ path: "GPIF.MasterBars.MasterBar[0].TimeSignature", value: "4/4" });
    expect(result.sections.map((section) => section.name)).toEqual(["Intro", "Chorus"]);
    expect(result.drumArticulations.map((item) => item.name)).toContain("Kick");
    expect(result.drumArticulations).toContainEqual(expect.objectContaining({ name: "Snare", count: 2 }));
  });

  it("handles missing metadata without crashing", () => {
    const result = inspectGpifXml("<GPIF><Tracks /></GPIF>");

    expect(result.metadata).toEqual({});
    expect(result.warnings).toContain("No GPIF tracks were detected.");
  });

  it("detects drum candidates conservatively by track and instrument name", () => {
    const xml = `<GPIF><Tracks><Track><Name>Bateria</Name><InstrumentName>Percussion</InstrumentName></Track></Tracks></GPIF>`;

    const result = inspectGpifXml(xml);

    expect(result.drumTrackCandidates).toEqual([0]);
    expect(result.tracks[0].drumCandidateReasons).toContain("name/instrument indicates drums or percussion");
  });

  it("keeps structured results deterministic", () => {
    const first = inspectGpifXml(minimalGpif);
    const second = inspectGpifXml(minimalGpif);

    expect(second).toEqual(first);
  });

  it("reports unknown timing and sections explicitly", () => {
    const result = inspectGpifXml("<GPIF><Tracks><Track><Name>Guitar</Name></Track></Tracks></GPIF>");

    expect(result.unhandled).toContain("No recognized GPIF tempo structures found; timing may be absent or not yet understood.");
    expect(result.unhandled).toContain("No recognized GPIF time signature structures found; timing may be absent or not yet understood.");
    expect(result.unhandled).toContain("No recognized GPIF section/marker structures found.");
  });

  it("reports malformed XML as a GPIF parse error", () => {
    expect(() => inspectGpifXml("<GPIF><Score></GPIF>")).toThrow(/GPIF parse error/i);
  });

  it("extracts GPIF tempo automation structures", () => {
    const xml = `<GPIF><Automations><Automation><Type>Tempo</Type><Value>147 2</Value></Automation></Automations></GPIF>`;

    const result = inspectGpifXml(xml);

    expect(result.tempos).toContainEqual({ path: "GPIF.Automation[Type=Tempo]", value: "Tempo: 147 2" });
    expect(result.unhandled).not.toContain("No recognized GPIF tempo structures found; timing may be absent or not yet understood.");
  });
});
