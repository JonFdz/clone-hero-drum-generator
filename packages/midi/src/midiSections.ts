import type { SongSection } from "@chdg/core";

export type MidiMetaEventType = "marker" | "text" | "cue";

export type MidiMetaEvent = {
  tick: number;
  type: MidiMetaEventType;
  text: string;
  trackIndex: number;
};

const TECHNICAL_MARKER_PATTERNS = [
  /^MEASURE_\d+$/i,
  /^END_OF_VOICE$/i,
  /^END$/i,
  /^START$/i,
] as const;

const SEMANTIC_SECTION_PATTERN = /^(?:guitar\s+)?(?:intro|verse|chorus|bridge|solo|breakdown|outro|pre[-\s]?verse|pre[-\s]?chorus|post[-\s]?chorus|interlude|instrumental)\b/i;

function cleanSectionName(text: string): { name: string; explicitSectionPrefix: boolean } {
  let name = text.trim().replace(/\s+/g, " ");
  name = name.replace(/^["']+|["']+$/g, "").trim();

  const explicitSectionPrefix = /^section\s+/i.test(name);
  if (explicitSectionPrefix) {
    name = name.replace(/^section\s+/i, "").trim();
  }

  return { name, explicitSectionPrefix };
}

function isTechnicalMarker(name: string): boolean {
  return TECHNICAL_MARKER_PATTERNS.some((pattern) => pattern.test(name));
}

function isSemanticSectionName(name: string): boolean {
  return SEMANTIC_SECTION_PATTERN.test(name);
}

export function extractSectionsFromMidiMetaEvents(events: MidiMetaEvent[]): SongSection[] {
  const sections: SongSection[] = [];
  const seen = new Set<string>();

  for (const event of events) {
    const { name, explicitSectionPrefix } = cleanSectionName(event.text);
    if (name.length === 0 || isTechnicalMarker(name)) {
      continue;
    }

    if (!explicitSectionPrefix && !isSemanticSectionName(name)) {
      continue;
    }

    const tick = Math.max(0, Math.trunc(event.tick));
    const key = `${tick}\u0000${name}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    sections.push({ tick, name });
  }

  return sections.sort((a, b) => a.tick - b.tick || a.name.localeCompare(b.name));
}
