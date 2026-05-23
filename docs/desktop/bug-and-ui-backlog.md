# Desktop Bug and UI Backlog

This document separates functional bugs from UI/UX redesign work discovered during manual desktop testing.

## Functional bugs

### BUG-01 — Inspect Source shows false `0 notes` for GPIF tracks

**Area:** Inspect Source  
**Status:** Fixed in Phase 17A (pending manual desktop validation)  
**Priority:** High

Observed:

```txt
GPIF source has tracks.
Inspect Source shows all tracks with 0 notes.
Mapping/Normalize later shows source candidates/counts.
```

Expected:

```txt
Show real count when known.
Show n/a/unknown/available after normalization when not known.
Never show false 0.
```

### BUG-02 — Preview waveform is placeholder/decorative

**Area:** Preview  
**Status:** Fixed in Phase 17B (pending manual desktop validation)  
**Priority:** High-Medium

Observed:

```txt
Waveform-like overview is not decoded real audio waveform.
It does not help synchronize song and notes.
```

Implemented behavior in Phase 17B:

```txt
Real waveform overview decoded from actual preview audio.
Preview labels audio source (generated song.ogg vs project audio).
Waveform loading/empty/error states added.
Playhead overlays waveform while preserving existing timeline/highway/offset flows.
```

Deferred follow-up (17C+): zoom/scroll and broader timeline/highway redesign.

## UI / UX redesign backlog

### UI-01 — Timeline Notes visualization is unreadable / not useful

**Area:** Preview Timeline  
**Status:** Deferred to Preview UX Redesign  
**Priority:** Medium

Observed:

```txt
Notes appear as dense long blue bars.
No clear piece/lane separation.
Hard to understand timing or note type.
```

### UI-02 — Clone Hero Highway preview needs redesign

**Area:** Preview Highway  
**Status:** Deferred to Preview UX Redesign  
**Priority:** Medium

Observed:

```txt
Highway is visually flat.
Hit line/playhead are not intuitive.
Lane/note scale makes validation hard.
```

### UI-03 — General desktop UI polish pass needed

**Area:** Global app  
**Status:** Deferred  
**Priority:** Medium

Observed:

```txt
Some inputs/buttons/cards feel placeholder or inconsistent.
Spacing and visual hierarchy need a final pass.
```

### UI-04 — Home duplicates Projects instead of being a dashboard

**Area:** Home  
**Status:** Deferred to Information Architecture / UI Polish  
**Priority:** Medium-High

Observed:

```txt
Home repeats Recent Projects.
Projects also shows Recent Projects.
Home does not clearly show current project state or next action.
```

Expected future behavior:

```txt
Home becomes current project dashboard:
current project
next action
readiness checklist
stale/needs-regenerate state
quick actions
```

### UI-05 — Projects Library lacks project metadata/search/status/actions

**Area:** Projects  
**Status:** Deferred to Information Architecture / UI Polish  
**Priority:** Medium

Expected future behavior:

```txt
Project library with search/filter/sort.
Status badges.
Last opened/modified.
Source type.
Open/reveal/remove actions.
```

### UI-06 — Workflow overview should be status-based, not static/cramped

**Area:** Home  
**Status:** Deferred  
**Priority:** Medium

Expected future behavior:

```txt
Workflow steps reflect actual project state:
Import source
Inspect
Select tracks
Generate
Validate
Preview
```

## Proposed follow-up phases

```txt
Phase 17A — Desktop Bug Bash
Phase 17B — Real Waveform Preview
Phase 17C — Timeline + Clone Hero Preview UX Redesign
Phase 17D — General UI Polish / Information Architecture
Phase 18  — Packaging / Distribution
```
