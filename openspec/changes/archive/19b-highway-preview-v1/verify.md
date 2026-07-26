# Verification — Highway Preview v1

## Verification principle

Phase 19B turns the spike into a supported read-only review mode. Verification must prove together that:

1. generated chart data is interpreted faithfully for supported semantics;
2. the visual topology is four pitched lanes plus a separate kick rail;
3. playback time remains tied to the existing Preview audio clock;
4. Canvas lifecycle/accessibility are safe;
5. Preview remains non-destructive and Chart view remains available.

Passing unit tests alone is insufficient. Automated and manual evidence are both required and must be recorded truthfully.

## A. Automated verification

### A1. Generated-chart Preview data

| Case | Setup | Expected result |
|---|---|---|
| Tap | Base lane with length `0` | `seconds === endSeconds`; no tail input. |
| Sustain | Base lane with positive length | Exact `length`, start seconds and end seconds. |
| Tempo-crossing sustain | Base starts before tempo change and ends after | End time uses both tempo segments. |
| Raw cymbal marker | Base yellow + `66` at same tick | Both raw events reach Preview payload. |
| Raw dynamics marker | Compatible base plus accent/ghost marker | Both raw events reach payload for grouping. |
| Malformed note text | Invalid syntax/fields | Event ignored safely. |
| Sorting | Mixed input order | Stable tick/lane/length ordering. |
| Offset separation | Non-zero chart offset | Start/end chart seconds exclude visual Preview offset. |

### A2. Semantic adaptation

| Case | Expected result |
|---|---|
| Base `0` kick | One semantic note with `kick-rail`, no pitched lane/center. |
| Bases `1..4` | One semantic note mapped to red/yellow/blue/green pitched lane. |
| Standard pitched note | `square-head`. |
| Yellow/blue/green marker | Matching semantic note has `cymbal: true` and `cymbal-head`. |
| Accent | Compatible semantic note has accent treatment. |
| Ghost | Compatible semantic note has ghost treatment. |
| Accent + ghost | Accent true, ghost false; no duplicate semantic note. |
| Modifier with no compatible base | No playable semantic note created. |
| Unknown/special lane | No throw, no playable note. |
| Kick dynamic marker | Not represented as unverified kick dynamic. |
| Cymbal + accent | Circle plus accent; no named articulation inferred. |
| Duplicate base event | Separate deterministic occurrences remain. |

### A3. Geometry, projection and renderer

| Case | Expected result |
|---|---|
| Pitched road | Exactly four lane centers and three internal dividers. |
| Hit targets | Exactly four targets: red/yellow/blue/green. |
| Kick | Orange horizontal rail stays inside projected road interior; no fifth center/target. |
| Standard/tom | Square draw path. |
| Cymbal | Circular draw path. |
| Accent | Emphasis path layered over square/circle. |
| Ghost | Subdued path layered over square/circle. |
| Combined cymbal/accent | Circle and accent treatment coexist. |
| Pitched sustain | Tail stays in pitched lane and is drawn before head. |
| Kick sustain | Orange road-spanning band is clipped and drawn before rail. |
| Interval visibility | A sustain overlapping the visible window appears even when its start is outside window. |
| Hit-line/horizon | Finite geometry and readable clipping. |
| Dense window | Valid base notes are never silently discarded. |
| Small canvas | Existing readable limitation, no invalid geometry. |

### A4. Lifecycle and UI regressions

| Case | Expected result |
|---|---|
| Initial Preview open | Chart view selected by default. |
| Switch to Highway | Time, play state, offset, chart data and diagnostics unchanged. |
| Switch back | Existing Chart view works unchanged. |
| Normal playback | Highway follows existing Preview clock. |
| Pause | Paused position is rendered; no continuous Highway RAF remains. |
| Seek | Highway refreshes immediately at new position. |
| Reduced motion | Parent `currentTime` updates do not cause continuous Highway redraw. |
| Resize | Canvas tracks container with DPR cap. |
| Destroy | RAF canceled, observer disconnected. |
| Accessibility | No per-frame `aria-live` announcement. |
| Read-only | No project or generated-chart mutation. |

## B. Required focused test ownership

The implementation must add or update coverage at the appropriate boundaries, including:

```text
apps/desktop/electron/previewData*.test.ts
apps/desktop/src/app/features/preview/highway/highway-note-semantics.spec.ts
apps/desktop/src/app/features/preview/highway/highway-projection.spec.ts
apps/desktop/src/app/features/preview/highway/highway-renderer.spec.ts
apps/desktop/src/app/features/preview/highway/highway-timing.spec.ts
apps/desktop/src/app/features/preview/components/preview-highway/preview-highway.component.spec.ts
apps/desktop/src/app/features/preview/preview-page.component.spec.ts
```

Exact names may differ, but coverage must exist at the responsible boundaries.

## C. Required commands

```bash
pnpm --filter @chdg/desktop lint
pnpm --filter @chdg/desktop check:architecture
pnpm --filter @chdg/desktop test
pnpm --filter @chdg/desktop typecheck
pnpm --filter @chdg/desktop build
pnpm test
```

When any command cannot run:

- record the command exactly;
- record relevant failure output;
- identify the environment limitation;
- run a truthful equivalent only where appropriate;
- never mark the original command as passed.

## D. Manual desktop validation

Use a safe generated project or synthetic fixture that contains:

- kick taps and at least one non-zero-duration kick;
- red snare square and yellow/blue/green tom-style square cases;
- yellow, blue and green cymbal circle cases;
- supported red/yellow/blue/green accent and ghost cases where generated;
- at least one tempo change;
- at least one valid time-signature change.

Validate:

1. Chart view opens by default.
2. Highway has four pitched lanes and exactly four corresponding targets.
3. Kick is orange horizontal rail across road interior, not a fifth lane or target.
4. Snare/tom-style heads are square.
5. Cymbal heads are circular.
6. Accent/ghost treatments preserve their underlying shape class.
7. Pitched and kick tails align with timing across tempo change.
8. Play, pause and seek remain synchronized.
9. Switching modes does not reset transport.
10. Reduced motion does not produce continuous Highway motion.
11. Canvas remains legible after resize and on high-DPI display.
12. Timing limitations remain truthful with incomplete/invalid metric data.
13. Orphan/malformed modifiers do not error or become notes.
14. No action mutates project/chart data.

## E. Evidence format

`docs/phases/19b-highway-preview-v1/EVIDENCE.md` must contain:

- implementation summary;
- raw Preview data contract;
- explicit visual topology: four pitched lanes + kick rail;
- supported square/circle/rail semantics;
- known/intentional unsupported semantics;
- automated command results;
- manual checklist results;
- performance observations;
- remaining risks/deferred Phase 19C+ decisions.

It must clearly distinguish automated checks actually executed, manual validation actually performed and checks unavailable due to environment.
