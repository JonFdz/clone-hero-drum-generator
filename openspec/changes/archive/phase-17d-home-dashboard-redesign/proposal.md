# Proposal: Phase 17D Home Pixel-Perfect Correction

## Summary

Correct PR #47 so Home follows `docs/desktop/mockups/01-home-dashboard.png` much more closely.

## Problem

The current PR implementation is a clean dashboard but not close enough to the mock. It has too many abstract cards and duplicated actions.

## Change

Recompose Home around:

```txt
current project / continue card
integrated primary + secondary actions
compact status badges
compact recent projects
compact workflow overview
conditional warnings
```

Remove/fold:

```txt
large status card row
large standalone next action card
standalone quick actions card
long workflow descriptions
```

## Non-goals

No Projects redesign, no `.chdg` format change, no global shell redesign.
