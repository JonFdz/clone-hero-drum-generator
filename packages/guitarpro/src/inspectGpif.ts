import { XMLParser, XMLValidator } from "fast-xml-parser";
import { extractGpifFromFile } from "./extractGpif.js";
import type {
  GpDrumArticulationSummary,
  GpInspection,
  GpMetadataInspection,
  GpSectionInspection,
  GpTrackInspection,
} from "./gpifTypes.js";

type XmlNode = Record<string, unknown>;

type WalkEntry = {
  path: string;
  key: string;
  value: unknown;
};

const TEXT_KEY = "#text";
const ATTRIBUTE_PREFIX = "@_";

export async function inspectGpFile(filePath: string): Promise<GpInspection> {
  const extraction = await extractGpifFromFile(filePath);
  return inspectGpifXml(extraction.xml, {
    filePath,
    gpifPath: extraction.gpifPath,
  });
}

export function inspectGpifXml(
  xml: string,
  options: { filePath?: string; gpifPath?: string } = {}
): GpInspection {
  let root: unknown;
  try {
    const validation = XMLValidator.validate(xml);
    if (validation !== true) {
      throw new Error(formatXmlValidationError(validation));
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: ATTRIBUTE_PREFIX,
      textNodeName: TEXT_KEY,
      trimValues: true,
      parseTagValue: false,
      parseAttributeValue: false,
      isArray: (_name: string, jPath: unknown) => isKnownArrayPath(String(jPath)),
    });
    root = parser.parse(xml);
  } catch (err) {
    throw new Error(`GPIF parse error: ${(err as Error).message}`);
  }

  const warnings: string[] = [];
  const unhandled = new Set<string>();
  const entries = walk(root);
  const metadata = extractMetadata(entries);
  const tracks = extractTracks(root, entries);
  const drumTrackCandidates = tracks.filter((track) => track.isDrumCandidate).map((track) => track.index);
  const tempos = extractTempos(root, entries);
  const timeSignatures = extractTimeSignatures(entries);
  const sections = extractSections(entries);
  const drumArticulations = extractDrumArticulations(entries, tracks);

  if (tempos.length === 0) {
    unhandled.add("No recognized GPIF tempo structures found; timing may be absent or not yet understood.");
  }
  if (timeSignatures.length === 0) {
    unhandled.add("No recognized GPIF time signature structures found; timing may be absent or not yet understood.");
  }
  if (sections.length === 0) {
    unhandled.add("No recognized GPIF section/marker structures found.");
  }
  if (drumArticulations.length === 0 && drumTrackCandidates.length > 0) {
    unhandled.add("Drum track candidates found, but no recognized percussion articulation structures were summarized.");
  }

  if (tracks.length === 0) {
    warnings.push("No GPIF tracks were detected.");
  }

  return {
    filePath: options.filePath ?? "(xml input)",
    format: "gpif",
    gpifPath: options.gpifPath,
    metadata,
    tracks,
    drumTrackCandidates,
    tempos,
    timeSignatures,
    sections,
    drumArticulations,
    warnings: Array.from(new Set(warnings)).sort(),
    unhandled: Array.from(unhandled).sort(),
  };
}

function isKnownArrayPath(jPath: string): boolean {
  return /(?:Tracks\.Track|MasterBars\.MasterBar|Bars\.Bar|Voices\.Voice|Beats\.Beat|Notes\.Note|Rhythms\.Rhythm|Markers?\.Marker|Sections?\.Section)$/i.test(
    jPath
  );
}

function walk(value: unknown, path = ""): WalkEntry[] {
  const out: WalkEntry[] = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      out.push(...walk(item, `${path}[${index}]`));
    });
    return out;
  }

  if (isObject(value)) {
    for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
      const childPath = path ? `${path}.${key}` : key;
      const child = value[key];
      out.push({ path: childPath, key, value: child });
      out.push(...walk(child, childPath));
    }
  }

  return out;
}

function extractMetadata(entries: WalkEntry[]): GpMetadataInspection {
  return stripUndefined({
    title: firstText(entries, ["Title", "title", "Name"], ["Score", "Metadata", "Song"]),
    artist: firstText(entries, ["Artist", "artist", "Lyricist"], ["Score", "Metadata", "Song"]),
    album: firstText(entries, ["Album", "album"], ["Score", "Metadata", "Song"]),
    composer: firstText(entries, ["Composer", "composer", "Music"], ["Score", "Metadata", "Song"]),
    copyright: firstText(entries, ["Copyright", "copyright"], ["Score", "Metadata", "Song"]),
    tempo: firstText(entries, ["Tempo", "tempo", "BPM", "bpm"], ["Score", "Metadata", "Song"]),
  });
}

function extractTracks(root: unknown, entries: WalkEntry[]): GpTrackInspection[] {
  const trackNodes = findObjectsByKey(root, "Track");
  const source = trackNodes.length > 0 ? trackNodes : inferTrackLikeObjects(entries);
  const noteCounts = extractTrackNoteCounts(root, source);

  return source.map((track, index) => {
    const id = stringValue(track[`${ATTRIBUTE_PREFIX}id`] ?? track.id ?? track.Id ?? track.ID);
    const name = firstValueInObject(track, ["Name", "name", "ShortName", "shortName"]);
    const instrument = firstNestedValue(track, ["Instrument", "instrument", "InstrumentName", "instrumentName", "Sound", "sound"]);
    const type = firstValueInObject(track, ["Type", "type"]);
    const channel = parseOptionalNumber(firstNestedValue(track, ["Channel", "channel", "MidiChannel", "midiChannel"]));
    const haystack = [name, instrument, type, JSON.stringify(track)].filter(Boolean).join(" ").toLowerCase();
    const reasons = drumReasons(haystack, channel);

    return {
      index,
      id,
      name,
      instrument,
      type,
      channel,
      ...(noteCounts.get(index) !== undefined ? { noteCount: noteCounts.get(index) } : {}),
      isDrumCandidate: reasons.length > 0,
      drumCandidateReasons: reasons,
    };
  });
}

function extractTrackNoteCounts(root: unknown, tracks: XmlNode[]): Map<number, number> {
  const bars = findObjectsByKey(root, "Bar");
  const notes = findObjectsByKey(root, "Note");
  const counts = new Map<number, number>();
  if (tracks.length === 0 || (bars.length === 0 && notes.length === 0)) {
    return counts;
  }

  const globalVoices = objectMapById(findObjectsByKey(root, "Voice"));
  const globalBeats = objectMapById(findObjectsByKey(root, "Beat"));
  const globalNotes = objectMapById(notes);

  tracks.forEach((track, index) => {
    const selectedBars = selectBarsForTrack(root, bars, index, trackReferenceValues(track, index));
    if (bars.length > 0 && selectedBars.length === 0) {
      counts.set(index, 0);
      return;
    }

    const candidateBars = selectedBars.length > 0 ? selectedBars : bars;
    let count = 0;
    for (const bar of candidateBars) {
      const voices = resolveChildObjects(bar, "Voice", "Voices", globalVoices);
      for (const voice of voices) {
        const beats = resolveChildObjects(voice, "Beat", "Beats", globalBeats);
        for (const beat of beats) {
          count += resolveChildObjects(beat, "Note", "Notes", globalNotes).length;
        }
      }
    }
    counts.set(index, count);
  });

  return counts;
}

function resolveChildObjects(
  parent: XmlNode,
  childKey: string,
  containerKey: string,
  globalById: Map<string, XmlNode>
): XmlNode[] {
  const container = parent[containerKey];
  const direct = isObject(container) ? container[childKey] : (container ?? parent[childKey]);
  const values = Array.isArray(direct) ? direct : direct !== undefined ? [direct] : [];
  return values.flatMap((value) => {
    if (isObject(value) && Object.keys(value).some((key) => !isReferenceKey(key))) {
      return [value];
    }
    const refs = referenceValues(value);
    const resolved = refs.map((ref) => globalById.get(ref)).filter((item): item is XmlNode => item !== undefined);
    if (resolved.length > 0) return resolved;
    return isObject(value) ? [value] : [];
  });
}

function objectMapById(objects: XmlNode[]): Map<string, XmlNode> {
  const map = new Map<string, XmlNode>();
  for (const obj of objects) {
    const id = firstValueInObject(obj, [`${ATTRIBUTE_PREFIX}id`, "id", "Id", "ID"]);
    if (id) map.set(id, obj);
  }
  return map;
}

function referenceValues(value: unknown): string[] {
  const text = textFromUnknown(value);
  if (text) return text.split(/\s+/).filter((part) => part !== "" && part !== "-1");
  if (isObject(value)) {
    return [firstValueInObject(value, ["ref", "id", "Id", `${ATTRIBUTE_PREFIX}ref`, `${ATTRIBUTE_PREFIX}id`])].filter((part): part is string => Boolean(part));
  }
  return [];
}

function trackReferenceValues(track: XmlNode | undefined, trackIndex: number): Set<string> {
  return new Set([String(trackIndex), String(trackIndex + 1), firstValueInObject(track ?? {}, [`${ATTRIBUTE_PREFIX}id`, "id", "Id", "ID"])].filter((value): value is string => Boolean(value)));
}

function selectBarsForTrack(root: unknown, bars: XmlNode[], trackIndex: number, trackRefs: Set<string>): XmlNode[] {
  const barById = objectMapById(bars);
  const masterBars = findObjectsByKey(root, "MasterBar");
  const selectedFromMasterBars = masterBars
    .map((masterBar) => referenceValues(masterBar.Bars)[trackIndex])
    .map((barId) => (barId !== undefined ? barById.get(barId) : undefined))
    .filter((bar): bar is XmlNode => bar !== undefined);

  if (selectedFromMasterBars.length > 0) return selectedFromMasterBars;
  return bars.filter((bar) => barBelongsToTrack(bar, trackRefs));
}

function barBelongsToTrack(bar: XmlNode, trackRefs: Set<string>): boolean {
  const value = firstNestedValue(bar, ["Track", "TrackId", "trackId", "track", `${ATTRIBUTE_PREFIX}track`, `${ATTRIBUTE_PREFIX}trackId`]);
  if (value === undefined) return true;
  return trackRefs.has(value);
}

function isReferenceKey(key: string): boolean {
  return /^(?:@_)?(?:id|ref)$/i.test(key);
}

function extractTempos(root: unknown, entries: WalkEntry[]): unknown[] {
  const directTempos = entries
    .filter((entry) => /tempo|bpm/i.test(entry.key))
    .filter((entry) => isScalar(entry.value) || isObject(entry.value))
    .map((entry) => summarizeEntry(entry));

  const automationTempos = findObjectsByKey(root, "Automation")
    .map((automation) => summarizeTempoAutomation(automation))
    .filter((tempo): tempo is { path: string; value: string } => tempo !== undefined);

  return dedupeBy([...directTempos, ...automationTempos], (entry) => JSON.stringify(entry)).slice(0, 50);
}

function summarizeTempoAutomation(automation: XmlNode): { path: string; value: string } | undefined {
  const type = firstNestedValue(automation, ["Type", "type"]);
  if (!type || !/tempo|bpm/i.test(type)) {
    return undefined;
  }

  const value = firstNestedValue(automation, ["Value", "value", "Tempo", "tempo", "BPM", "bpm"]);
  return {
    path: "GPIF.Automation[Type=Tempo]",
    value: value ? `${type}: ${value}` : type,
  };
}

function extractTimeSignatures(entries: WalkEntry[]): unknown[] {
  return entries
    .filter((entry) => /timesignature|time|keysignature/i.test(entry.key) || /MasterBar/i.test(entry.path))
    .filter((entry) => /timesignature|time|keysignature/i.test(entry.path))
    .map((entry) => summarizeEntry(entry))
    .slice(0, 50);
}

function extractSections(entries: WalkEntry[]): GpSectionInspection[] {
  const candidates = entries.filter((entry) => /marker|section|rehearsal|direction/i.test(entry.path));
  const sections: GpSectionInspection[] = [];

  for (const entry of candidates) {
    const text = textFromUnknown(entry.value);
    if (!text || text.length > 120) {
      continue;
    }
    if (/^\d+$/.test(text)) {
      continue;
    }
    sections.push({
      name: text,
      kind: classifySectionKind(entry.path),
      path: entry.path,
    });
  }

  return dedupeBy(sections, (section) => `${section.kind}:${section.name}`).slice(0, 100);
}

function extractDrumArticulations(entries: WalkEntry[], tracks: GpTrackInspection[]): GpDrumArticulationSummary[] {
  const drumTrackNames = tracks
    .filter((track) => track.isDrumCandidate)
    .map((track) => track.name?.toLowerCase())
    .filter((name): name is string => Boolean(name));
  const counts = new Map<string, GpDrumArticulationSummary>();

  for (const entry of entries) {
    const path = entry.path.toLowerCase();
    const raw = textFromUnknown(entry.value);
    const looksPercussive = /drum|percussion|articulation|element\[\d+\]\.(?:name|type|soundbankname)|instrumentset\.type|instrumentset\.name/i.test(entry.path);
    const mentionsDrumTrack = drumTrackNames.some((name) => path.includes(name));
    if (!looksPercussive && !mentionsDrumTrack) {
      continue;
    }
    if (!raw || raw.length > 80) {
      continue;
    }

    const normalized = raw.trim();
    if (!normalized || /^-?\d+(?:\.\d+)?$/.test(normalized)) {
      continue;
    }
    const key = normalized;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, {
        name: normalized,
        count: 1,
        path: entry.path,
        rawValue: normalized,
      });
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => a.name.localeCompare(b.name) || (a.path ?? "").localeCompare(b.path ?? ""))
    .slice(0, 100);
}

function formatXmlValidationError(validation: Exclude<ReturnType<typeof XMLValidator.validate>, true>): string {
  const err = validation.err;
  const location = err.line !== undefined ? ` at line ${err.line}, column ${err.col}` : "";
  return `${err.msg}${location}`;
}

function drumReasons(haystack: string, channel?: number): string[] {
  const reasons: string[] = [];
  if (/\b(drum|drums|percussion|battery|bateria|batería)\b/i.test(haystack)) {
    reasons.push("name/instrument indicates drums or percussion");
  }
  if (/drumkit|drum-kit|percussionkit|percussion-kit/i.test(haystack)) {
    reasons.push("GPIF structure indicates drum/percussion kit");
  }
  if (channel === 9 || channel === 10) {
    reasons.push("MIDI channel suggests percussion");
  }
  return Array.from(new Set(reasons)).sort();
}

function findObjectsByKey(value: unknown, targetKey: string): XmlNode[] {
  const matches: XmlNode[] = [];
  if (Array.isArray(value)) {
    for (const item of value) {
      matches.push(...findObjectsByKey(item, targetKey));
    }
  } else if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (key === targetKey) {
        const nodes = Array.isArray(child) ? child : [child];
        matches.push(...nodes.filter(isObject));
      }
      matches.push(...findObjectsByKey(child, targetKey));
    }
  }
  return matches;
}

function inferTrackLikeObjects(entries: WalkEntry[]): XmlNode[] {
  return entries
    .filter((entry) => /Tracks?\./.test(entry.path) && isObject(entry.value))
    .map((entry) => entry.value as XmlNode)
    .filter((value) => firstValueInObject(value, ["Name", "name"]) !== undefined);
}

function firstText(entries: WalkEntry[], names: string[], pathHints: string[]): string | undefined {
  const exact = entries.find(
    (entry) => names.includes(entry.key) && pathHints.some((hint) => entry.path.toLowerCase().includes(hint.toLowerCase()))
  );
  return exact ? textFromUnknown(exact.value) : undefined;
}

function firstValueInObject(obj: XmlNode, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    const text = textFromUnknown(value);
    if (text) {
      return text;
    }
  }
  return undefined;
}

function firstNestedValue(obj: XmlNode, keys: string[]): string | undefined {
  const direct = firstValueInObject(obj, keys);
  if (direct) return direct;

  for (const value of Object.values(obj)) {
    if (isObject(value)) {
      const nested = firstValueInObject(value, keys) ?? firstNestedValue(value, keys);
      if (nested) return nested;
    }
  }
  return undefined;
}

function textFromUnknown(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (isObject(value)) {
    const text = value[TEXT_KEY] ?? value["Text"] ?? value["text"] ?? value["Name"] ?? value["name"];
    return textFromUnknown(text);
  }
  return undefined;
}

function stringValue(value: unknown): string | undefined {
  return textFromUnknown(value);
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function summarizeEntry(entry: WalkEntry): unknown {
  const text = textFromUnknown(entry.value);
  return text !== undefined ? { path: entry.path, value: text } : { path: entry.path };
}

function classifySectionKind(path: string): string {
  if (/marker/i.test(path)) return "marker";
  if (/section/i.test(path)) return "section";
  if (/rehearsal/i.test(path)) return "rehearsal";
  if (/direction/i.test(path)) return "direction";
  return "unknown";
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as T;
}

function dedupeBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

function isObject(value: unknown): value is XmlNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScalar(value: unknown): boolean {
  return ["string", "number", "boolean"].includes(typeof value);
}
