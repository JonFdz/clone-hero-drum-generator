import type { CloneHeroDrumNote } from "@chdg/core";

function flagKey(note: CloneHeroDrumNote): string {
  const c = note.cymbal ? "1" : "0";
  const g = note.ghost ? "1" : "0";
  const a = note.accent ? "1" : "0";
  return `${c}${g}${a}`;
}

export function deduplicateBaseNotes(notes: CloneHeroDrumNote[]): CloneHeroDrumNote[] {
  const seen = new Set<string>();
  const result: CloneHeroDrumNote[] = [];

  for (const note of notes) {
    const key = `${note.tick}|${note.lane}|${note.length}|${flagKey(note)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(note);
  }

  return result;
}
