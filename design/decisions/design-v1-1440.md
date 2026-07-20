# CHDG Design V1 — 1440 Core Workflow

**Status:** Approved at Approval Checkpoint 3  
**Issue:** #89  
**Updated:** 2026-07-18  
**Viewport:** 1440 × 900 desktop window

## Frame inventory

| Frame | Primary purpose | Material classification |
|---|---|---|
| `V1 / Home / Empty / 1440` | Start or reopen a project with one dominant Create action | Information architecture + visual-only |
| `V1 / Project Details / Loaded / 1440` | Confirm project/source/output context and continue to review | Information architecture + visual-only |
| `V1 / Source Review / Ready / 1440` | Review compact completed summaries and current validation | Information architecture + visual-only |
| `V1 / Source Review / Attention / 1440` | Review an affected unknown mapping or continue with stated consequence | Information architecture + interaction proposal |
| `V1 / Generate / Ready / 1440` | Confirm reviewed inputs and run generation | Information architecture + visual-only |
| `V1 / Generate / Running / 1440` | Show retained context, generic progress, and honest action availability | Interaction proposal + unresolved |
| `V1 / Generate / Failed / 1440` | Explain failure and recover without reconstructing the workflow | Information architecture + unresolved |
| `V1 / Preview / Ready / 1440` | Make the chart/highway primary and diagnostics secondary | Information architecture + unresolved |

## Selected-direction implementation

- **Global navigation:** Home, Projects, and Settings only.
- **Project context:** one compact persistent header with project/source/save
  state and high-level readiness.
- **Workflow:** an ordered, readable, revisitable Details → Source Review →
  Generate → Preview strip.
- **Page navigation:** Source Review uses Source & Tracks, Normalization,
  Mappings, and Validation inside the existing route.
- **Page actions:** every frame has one dominant action; technical actions are
  contextual or disclosed.

## Source Review response

Completed tasks collapse into short summaries. One detail region is active at a
time. Ready focuses Validation; Attention focuses Mappings and identifies the
affected MIDI note, track, occurrence count, consequence, correction path, and
non-blocking continuation. This is materially shorter than the CURRENT
uninterrupted page and does not remove capabilities or add routes.

## Generate response

- **Ready:** reviewed inputs, destination, format, and advanced disclosure lead
  to one Generate action.
- **Running:** generic progress is shown without claiming unsupported phases.
  Project/source/output context remains visible. Preview and incompatible output
  actions are unavailable. `Open output` is not central because its safety is
  unresolved.
- **Failed:** the failure summary leads, the active project and input context
  remain visible, Retry is primary, Source Review and technical detail remain
  reachable, and Preview is explicitly unavailable because no valid output was
  produced. Retry scope remains unspecified.

## Preview response and validation gap

The chart/highway is the dominant region. Transport and offset controls are
present, while audio availability and diagnostics are secondary. The design
does not claim validated audio-backed playback: the current deterministic
reference covers timing diagnostics only. A future issue must add a
deterministic audio-backed Preview scenario before production visual validation.

## Interaction proposals

- In-page Source Review task navigation and collapsed completed summaries.
- Ordered revisitable workflow strip with semantic states.
- Generic generation progress hierarchy.
- Compact status and action ownership across project, workflow, and page layers.

## Domain/product proposals

None. Unknown mappings remain advisory, persistence semantics are unchanged,
retry scope is not defined, route structure is unchanged, and audio behavior is
not invented.

## Remaining unresolved questions

1. What exactly does Retry generation repeat?
2. Which upstream edits stale or invalidate downstream output?
3. Is `Open output` safe during generation?
4. Which save-state transitions can the current application expose reliably?
5. What is the validated primary audio-backed Preview behavior?

## Known 1024 × 768 risks

- The workflow strip may require abbreviated labels or a compact overflow
  treatment without losing state text.
- Project context, workflow, page title, and actions must not stack into a large
  fixed header.
- Source Review summaries and detail must become a single dominant column.
- Preview side information must collapse below or into disclosure.
- Persistent actions must not obscure content or create a second fixed footer.

Approval Checkpoint 3 approved this complete 1440 flow and semantic system.
Final 1024 adaptations and implementation handoff may proceed without materially
redesigning these approved frames.
