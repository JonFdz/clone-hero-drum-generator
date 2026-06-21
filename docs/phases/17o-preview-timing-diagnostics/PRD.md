# PRD — Phase 17O — Preview Timing Diagnostics

## Problem

CHDG can generate charts where drum notes are correct but timing is wrong. This is especially painful for:

- songs with tempo changes,
- Guitar Pro / GPIF files where note placement is good but tempo map is wrong,
- generated charts that start in sync but drift later,
- generated charts that silently fall back to a default tempo/time signature,
- cases where the source has tempo data but generated `notes.chart` lost it.

Currently users must discover these problems by listening. CHDG needs to make timing data visible and diagnose likely causes before adding manual correction tools.

## Users

Primary user: Jon, using CHDG to create Clone Hero drum charts from MIDI/GPIF sources.

Secondary user: future maintainers/agents reviewing generated chart quality.

## Goals

- Make generated chart timing inspectable in Preview.
- Show generated `SyncTrack` tempo and time signature data clearly.
- Show generated section positions clearly.
- Show note timing summary.
- Diagnose missing, duplicate, malformed, suspicious, or incomplete timing data.
- Compare source analysis timing data with generated chart timing data when cached source analysis exists.
- Distinguish offset from tempo drift in user-facing language.
- Avoid false alarms for valid constant-tempo songs.
- Keep the phase diagnostic-only.

## Non-goals

- No manual tempo editor.
- No persisted tempo overrides.
- No anchor-based tempo mapping.
- No audio beat detection.
- No automatic tempo correction.
- No clap/metronome playback.
- No slow playback.
- No chart note editing.
- No section editing.
- No full MoonScraper clone.

## User stories

### Story 1 — Inspect tempo map

As a user, I want to see all generated BPM events with tick and time so I can verify that tempo changes are present.

Acceptance:

- Preview displays every generated BPM event.
- Each row shows tick, `mm:ss.mmm`, and BPM.
- The first BPM at tick 0 is visually clear.

### Story 2 — Detect missing tempo map

As a user, I want CHDG to warn me when generated `notes.chart` has no usable tempo map.

Acceptance:

- No BPM events triggers `TIMING_NO_TEMPO_EVENTS`.
- Preview marks accurate timing unavailable.
- The warning explains that visual/audio timing may use fallback and must be reviewed.

### Story 3 — Detect missing initial tempo

As a user, I want CHDG to warn me if the first BPM does not start at tick 0.

Acceptance:

- Missing tick 0 BPM triggers `TIMING_NO_INITIAL_TEMPO`.
- Timing should be treated as unreliable before the first tempo event.

### Story 4 — Inspect time signatures

As a user, I want to see generated time signatures with tick and time so I can confirm measure structure.

Acceptance:

- Preview displays generated TS events.
- TS denominator is decoded from chart log2 denominator format.
- `TS 6 3` displays as `6/8`.

### Story 5 — Source-vs-generated mismatch

As a user, I want CHDG to tell me if source analysis had tempo events that generated chart lost.

Acceptance:

- If source analysis is cached and source has 2 tempos while generated chart has 1, Preview reports a warning.
- The message explains possible drift.
- The diagnostic includes enough detail to locate missing tick/BPM values.

### Story 6 — Source comparison unavailable

As a user, I want CHDG to avoid pretending it compared source and generated data when source analysis is unavailable.

Acceptance:

- Preview displays `SOURCE_COMPARISON_UNAVAILABLE` info.
- Preview does not automatically normalize or inspect source just by opening Preview.
- Message directs user to Source Review or Generate.

### Story 7 — Generate summary

As a user, I want Generate to surface timing warnings immediately after generation.

Acceptance:

- Generate result/report includes a concise timing summary.
- Serious warnings from generated chart diagnostics are visible without requiring the user to open a hidden log.

## UX copy guidelines

Use direct language:

- “Possible tempo drift” when tempo-map mismatch may cause accumulating sync error.
- “Offset shifts the entire chart equally” when explaining offset.
- “Source comparison unavailable” when analysis cache is missing.
- “Generated chart uses fallback timing” when Preview lacks tempo data.

Avoid alarming language for normal cases:

- A single BPM is info only.
- Offset is info/metadata, not a warning.

## Product decisions

- Preview should not auto-recalculate missing source analysis.
- One BPM in a long song is not a warning.
- BPM jump thresholds: info > 30 BPM, warning > 50 BPM.
- Writer SyncTrack ordering may be corrected in this phase.
- No manual corrections in this phase.

## Success metrics

Qualitative:

- User can identify whether a problematic chart is likely an offset issue or tempo-map/drift issue.
- User can see whether generated chart contains expected tempo changes.
- User can see source/generated timing mismatch without reading raw `notes.chart`.

Technical:

- Diagnostics are deterministic and unit-tested.
- Generated preview still uses actual generated files.
- No source analysis is run implicitly from Preview.
