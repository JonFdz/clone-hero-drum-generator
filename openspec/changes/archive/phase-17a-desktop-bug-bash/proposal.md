# Proposal: Phase 17A — Desktop Bug Bash

## Change ID

`phase-17a-desktop-bug-bash`

## Summary

Fix functional desktop bugs discovered during real app testing, starting with the Inspect Source false `0 notes` issue for GPIF tracks.

This change is focused on correctness and trust, not visual redesign.

## Roadmap boundary

```txt
Phase 16A — Project Mapping Overrides
Phase 16B — Mapping Override Profiles
Phase 17A — Desktop Bug Bash
Phase 17B — Preview UX Redesign
Phase 17C — General UI Polish / Information Architecture
Phase 18  — Desktop Packaging / Distribution
```

This change implements **Phase 17A only**.

## Branch

```txt
fix/phase-17a-desktop-bug-bash
```

## Problem

Manual desktop testing found that Inspect Source can show:

```txt
0 notes
```

for all GPIF tracks, including the detected drum candidate, while later Mapping/Normalize shows real candidates/counts.

That is misleading. A false numeric zero makes the app look like the source has no playable notes even when later steps prove otherwise.

## Goals

1. Fix BUG-01: Inspect Source false `0 notes` for GPIF tracks.
2. Audit inspection DTOs and desktop rendering around track/candidate counts.
3. Make count semantics explicit:
   - known count;
   - unknown/unavailable;
   - not applicable.
4. Never render a fallback `0 notes` when the count is actually unknown.
5. Keep detected tracks table and drum candidates card consistent.
6. Preserve MIDI inspection count behavior.
7. Preserve GPIF inspection, Track Selection, Mapping, Generate, Preview, Offset, mapping overrides, and mapping profiles.
8. Add tests for the fixed count behavior.

## Non-goals

- No real waveform implementation.
- No timeline redesign.
- No Clone Hero Highway redesign.
- No Home dashboard redesign.
- No Projects library redesign.
- No global UI polish pass.
- No desktop packaging/distribution.
- No external editor integration.
- No individual note editing.
- No automatic offset detection.
- No Phase 17B/17C/18 work.

## Required docs to read

```txt
AGENTS.md
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/desktop/feature-inventory.md
docs/desktop/bug-and-ui-backlog.md
docs/phases/17a-desktop-bug-bash/PRD.md
docs/phases/17a-desktop-bug-bash/ADR.md
docs/phases/17a-desktop-bug-bash/CHECKLIST.md
```

## Functional acceptance

- GPIF Inspect Source no longer displays false `0 notes` when later Mapping/Normalize detects notes/candidates.
- If exact GPIF note count cannot be known during inspection, UI displays `n/a`, `Unknown`, or `Available after normalization`.
- MIDI inspection counts still work.
- Detected tracks table and drum candidates card use the same semantics.
- Mapping candidates still work.
- Generate still works.
- Preview/highway still work.
- Offset loop still works.
- Mapping overrides and profiles still work.
- Tests pass.

## Validation

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

Manual validation:

```txt
Open GPIF source
Inspect Source
Confirm no false 0 notes
Continue to Track Selection
Normalize
Mapping still shows candidates
Generate still works
Preview still works
Mapping overrides still affect Generate
Mapping profiles still apply correctly
```

## Review policy

Final PR review is external and will be performed by Jon/ChatGPT.

The agent must not merge.
