# ADR Phase 05B: Sections and Global Events

## Status

Proposed.

## Context

`.chart` supports global sections using `[Events]` entries:

```chart
tick = E "section Section Name"
```

Moonscraper treats these as song sections rather than ordinary text events.

The current CHDG model does not include sections.

MIDI files can contain section-like data through marker/text/cue meta-events, but not all markers are semantic. The current demo MIDI contains many `MEASURE_*` markers and `END_OF_VOICE`, which are technical markers and should not become sections.

## Decision

Add sections as first-class project metadata:

```ts
export type SongSection = {
  tick: number;
  name: string;
};
```

Extend the chart model with:

```ts
sections: SongSection[];
```

Write sections to `[Events]` in `.chart` format as:

```chart
tick = E "section Name"
```

For MIDI import, extract marker/text/cue meta-events and import only semantic section candidates.

Generated technical markers should be filtered.

## Rationale

Sections are shared song metadata, not chart-writer-only data.

Adding them to core lets future MIDI, GPIF and desktop flows use the same representation.

Filtering is required because many MIDI exports contain measure markers that would create unusable charts if imported directly.

## Consequences

Positive:

- Better generated charts.
- Better Moonscraper navigation.
- Future GPIF import can target the same model.
- Desktop UI can display sections later.

Negative:

- MIDI meta-event parsing requires either a low-level parser or a small new dependency.
- Section detection from MIDI needs conservative heuristics.
- Some MIDI files may not include semantic sections.
