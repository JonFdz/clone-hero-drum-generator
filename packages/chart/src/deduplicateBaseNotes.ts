import type { CloneHeroDrumNote } from "@chdg/core";

export function deduplicateBaseNotes(notes: CloneHeroDrumNote[]): CloneHeroDrumNote[] {
  const seen = new Set<string>();
  const result: CloneHeroDrumNote[] = [];

  for (const note of notes) {
    const key = `${note.tick}|${note.lane}|${note.length}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(note);
  }

  return result;
}
