# PRD Phase 17A: Desktop Bug Bash

## Goal

Fix the functional bugs found during real desktop app testing before starting broader UI redesign, preview redesign, packaging, or advanced editor work.

This phase is intentionally focused on **correctness and trust**:

```txt
the app should show truthful inspection data
generated output should match user choices
preview should not present misleading placeholder behavior as production-ready
state/status should be consistent after actions
```

## Roadmap context

```txt
Phase 16A — Project Mapping Overrides
Phase 16B — Mapping Override Profiles
Phase 17A — Desktop Bug Bash
Phase 17B — Preview UX Redesign
Phase 17C — General UI Polish / Information Architecture
Phase 18  — Desktop Packaging / Distribution
```

This phase is **17A only**.

## Why this phase exists

After the main app flow became functional, manual testing surfaced several issues that can mislead users or make the app feel unreliable.

The most important known issue is that Inspect Source can show `0 notes` for GPIF tracks while later Mapping/Normalize detects actual source candidates. This breaks trust in the track selection workflow.

Separately, the Preview Timeline and Clone Hero Highway UI need a redesign, and the waveform is still placeholder-like. Those are tracked separately and should not be mixed into this bug-fix phase unless a specific functional bug blocks the current app flow.

## Current known bugs

### BUG-01 — Inspect Source shows `0 notes` for GPIF tracks while Mapping detects notes

**Area:** Inspect Source / Track Candidates  
**Type:** Functional data consistency bug  
**Priority:** High

Observed in manual testing:

```txt
Source type: gpif
Detected tracks:
Lead Guitar -> 0 notes
Rhythm Guitar -> 0 notes
Electric Bass -> 0 notes
Drums -> 0 notes
Vocals -> 0 notes
```

But later Mapping shows real source candidates/counts.

This means one of these is likely true:

```txt
Inspect Source is reading the wrong count field.
GPIF inspection does not compute per-track note/event counts.
The desktop DTO is losing the count.
The UI renders a default 0 where the value is actually unknown/unavailable.
```

### Expected behavior

Inspect should never show a false `0`.

Use:

```txt
actual count
```

when known.

Use:

```txt
n/a
Unknown
Available after normalization
```

when the count cannot be computed during inspection.

### Acceptance for BUG-01

- GPIF drum track no longer displays false `0 notes` when notes/candidates are present later.
- MIDI inspection still displays correct track counts.
- If GPIF count is not available at inspect time, UI displays a non-misleading fallback.
- Track candidate cards and detected tracks table use the same count semantics.
- Tests cover GPIF unknown/unavailable count vs real count.
- Tests cover no false `0` fallback.

## Secondary consistency checks

While fixing BUG-01, review related inspection/track metadata consistency:

```txt
candidate count
detected tracks table count
drum candidate card count
selected track state
source kind
warnings/issues
```

If a related one-line bug is found, fix it in this phase. Do not expand into redesign.

## Explicitly out of scope

This phase must not implement broad UI/preview redesign.

Out of scope:

```txt
real waveform rendering
timeline visual redesign
Clone Hero Highway visual redesign
Home dashboard redesign
Projects library redesign
global UI polish pass
desktop packaging
external editor integration
individual note editing
automatic offset detection
```

Those are tracked separately.

## UI/preview items intentionally deferred

The following items are real and should be documented, but not implemented in Phase 17A unless they hide a functional bug:

```txt
UI-01 Timeline Notes visualization is unreadable / not useful
UI-02 Clone Hero Highway preview needs redesign
UI-03 General desktop UI polish pass needed after features are stable
UI-04 Home duplicates Projects instead of being contextual dashboard
UI-05 Projects Library lacks project metadata/search/status/actions
UI-06 Workflow overview should be status-based, not static/cramped
PREVIEW-01 Waveform is placeholder/decorative, not decoded real audio waveform
```

## Scope

- Fix Inspect Source false `0 notes` issue.
- Audit inspection DTOs for count semantics.
- Make count fields explicit:
  - known numeric count;
  - unknown/unavailable;
  - not applicable.
- Update UI copy/rendering so unknown count is not displayed as zero.
- Add tests for GPIF track count behavior.
- Add tests for UI/model formatting if applicable.
- Preserve all Phase 16A/16B mapping and profile behavior.
- Preserve generation/validation/preview/offset behavior.
- Preserve Electron security boundaries.

## Implementation guidance

Recommended approach:

1. Inspect backend GPIF inspection result shape.
2. Find where track candidate `notes` or `noteCount` is assigned.
3. Identify whether `0` is a real value or fallback.
4. If unknown, model it as `undefined`/`null` or an explicit status.
5. Update UI formatting:
   - number -> `"N notes"`;
   - unknown -> `"n/a"` or `"Available after normalization"`;
   - not applicable -> `"n/a"`.
6. Ensure drum candidates and detected track list use the same logic.

Avoid hiding the bug by simply removing counts everywhere.

## Acceptance criteria

- Inspect Source no longer shows false `0 notes` for GPIF tracks when later data proves there are source candidates.
- If exact GPIF counts cannot be known at inspect time, the UI shows `n/a` or equivalent, not `0`.
- Track candidate card and detected tracks table agree.
- MIDI count behavior still works.
- Existing GPIF inspection still works.
- Existing Mapping candidates still work.
- Existing Generate still works.
- Existing Preview/Highway still work.
- Existing Offset loop still works.
- Mapping override profiles still work.
- Tests pass.
