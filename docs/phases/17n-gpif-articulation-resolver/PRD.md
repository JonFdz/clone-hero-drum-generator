# PRD — Phase 17N — GPIF Articulation Resolver

## Background

CHDG currently supports MIDI and GP/Guitar Pro sources. MIDI normalization relies on a GM/GM2 drum atlas created in Phase 17L. Source Review Mapping Coverage UI was improved in Phase 17M.

However, Guitar Pro / GPIF drum data can contain articulation metadata that is richer than raw MIDI numbers. A GPIF articulation can have:

```text
Name: Hi-Hat (half)
InputMidiNumbers: [92]
OutputMidiNumber: 46
```

The input number `92` may not be a General MIDI percussion note, but `OutputMidiNumber 46` is Open Hi-Hat. The correct CHDG piece is `hihat_open`.

## Product problem

When GPIF articulations are interpreted primarily through `InputMidiNumbers`, valid drum articulations may be surfaced as unknowns.

This creates noisy Source Review warnings, unnecessary manual overrides, incorrect mapping coverage, lower trust in GP import, and potential generation gaps if articulations are skipped as unknown.

## User story

As a CHDG user importing Guitar Pro files, I want GPIF drum articulations to be interpreted from GPIF metadata so that playable drum articulations are mapped correctly without requiring manual overrides for common Guitar Pro articulations.

## Scope

### In scope

- Add a GPIF articulation resolver.
- Read/use articulation metadata: `Name`, `InputMidiNumbers`, `OutputMidiNumber`, stable articulation key/id when available, count/first tick if available, and instrument/drumkit context if already parsed or easy to access.
- Resolve `OutputMidiNumber` through the 17L MIDI atlas.
- Use controlled name-pattern fallback for known drum articulation names.
- Detect conflicts between name and output mapping.
- Emit mapping rows with `sourceKind: "gpif"`.
- Preserve project mapping overrides for GPIF articulations.
- Expose useful metadata in normalization preview / mapping coverage.
- Add tests for GPIF articulation decisions.
- Document future work for unresolved GPIF-specific profiles.

### Out of scope

- No new lanes.
- No full UI redesign.
- No automatic candidate mapping by default.
- No aggressive profile.
- No tempo-map review/override.
- No Preview changes.
- No Generate redesign.
- No generalized NLP matching of arbitrary articulation names.
- No full GPIF drumkit editor.
- No source mutation.

## Product decisions

### 1. Output MIDI is primary

When `OutputMidiNumber` exists and maps through the 17L atlas, use it as the primary resolution.

### 2. Input MIDI is not primary when output exists

Do not treat internal input MIDI numbers as unknown if `OutputMidiNumber` resolves.

### 3. Name fallback is controlled

Use name-pattern fallback only for known safe patterns: Kick/Bass Drum, Snare/Rimshot/Side Stick/Cross Stick, Closed/Open/Half-open Hi-Hat, Pedal/Foot Hi-Hat as candidate, Toms by height, Crash/China/Splash, Ride/Ride Bell/Cup, known auxiliary percussion, and candidate auxiliary percussion matching 17L decisions.

### 4. Conflict handling is conservative

If `Name` and `OutputMidiNumber` imply different CHDG pieces or different action classes, do not silently choose one unless the output decision is clearly safe and the name is only a synonym.

Conflict examples:

```text
Name: Hi-Hat (half)
OutputMidiNumber: 42
```

Name suggests open/half-open hi-hat. Output says closed hi-hat. Mark as candidate/review, not silent map.

```text
Name: Ride Bell
OutputMidiNumber: 49
```

Name suggests ride, output says crash. Mark as candidate/review.

### 5. Preserve candidate behavior

Candidates do not generate chart hits by default. They appear in Source Review and can be overridden.

### 6. Preserve ignored-known behavior

Known ignored percussion should appear as ignored known, not as unknown.

### 7. Unknown stays non-blocking

Unknown GPIF articulations are non-blocking warnings/review items.

## Required acceptance examples

### Decode hi-hat half

Input:

```json
{
  "name": "Hi-Hat (half)",
  "inputMidiNumbers": [92],
  "outputMidiNumber": 46
}
```

Expected:

```json
{
  "sourceKind": "gpif",
  "action": "map",
  "automaticPiece": "hihat_open",
  "confidence": "high",
  "resolvedVia": "output-midi-number"
}
```

### Pedal hi-hat

```json
{
  "name": "Pedal Hi-Hat",
  "inputMidiNumbers": [44],
  "outputMidiNumber": 44
}
```

Expected: `candidate -> hihat_closed`, confidence `medium`.

### Tambourine

Expected: `ignore`, confidence `high`.

### Ride bell

Expected: `map -> ride`, confidence `high`.

### Unknown GPIF articulation

Custom articulation with input 92 and no output/name clue should be `unknown`, confidence `low`.
