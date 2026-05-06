import type { MidiDrumPieceMap, CloneHeroProDrumsMapping } from "@chdg/mappings";
import generalMidiDrumsUntyped from "@chdg/mappings/data/general-midi-drums.json" with { type: "json" };
import cloneHeroProDrumsUntyped from "@chdg/mappings/data/clone-hero-pro-drums.json" with { type: "json" };

export const generalMidiDrums: MidiDrumPieceMap = generalMidiDrumsUntyped as MidiDrumPieceMap;
export const cloneHeroProDrums: CloneHeroProDrumsMapping = cloneHeroProDrumsUntyped as CloneHeroProDrumsMapping;
