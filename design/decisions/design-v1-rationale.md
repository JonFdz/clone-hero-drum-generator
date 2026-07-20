# CHDG Design V1 Rationale

**Decision:** Use the approved bounded hybrid with Workflow-first orientation,
compact project context, an ordered revisitable workflow, and page-local Source
Review navigation.

## Why this direction

Workflow-first gave the clearest orientation, intended order, dominant next
action, and recovery context. The full Project workspace direction provided
strong revisitation but required dual persistent navigation and consumed too
much desktop working space, especially at 1024 × 768. V1 therefore assigns one
responsibility to each layer instead of visually blending both alternatives.

| Layer | Responsibility |
|---|---|
| Global navigation | Home, Projects, Settings, and optional Help/status only |
| Project context | Active project, source identity, supported save state, high-level readiness, project actions |
| Workflow navigation | Details → Source Review → Generate → Preview and their semantic states |
| Page-local navigation | Source and Tracks, Normalization, Mappings, Validation inside Source Review |
| Page actions | One dominant action; secondary and technical actions remain contextual |

## Key decisions

### Compact project context

The project header keeps identity and supported persistence state visible
without becoming a repeated metadata dashboard. Detailed source/output values
stay in page content.

### Source Review task navigation

The current page mixes track selection, normalization, mappings, validation,
warnings, and technical evidence into one long surface. V1 keeps the existing
route but shows one primary detail region, compact completed summaries, and a
task selector. This reduces page length without removing capabilities.

### Explicit status ownership

Project, workflow, page-validation, advisory, and runtime-failure states are
not interchangeable. Each appears where it can be acted on. A generic status
pill was intentionally rejected because it would encourage context-free or
duplicated status labels.

### Revisitable completed steps

Completed workflow steps remain reachable so users can inspect or adjust prior
work without reconstructing project context. V1 does not claim that revisiting
or editing is consequence-free; downstream reassessment remains unresolved.

### Advisory unknown mappings

Unknown mappings remain non-blocking. The affected item, source/track context,
possible consequence, correction path, and permission to continue are explicit.
Advisory treatment is distinct from blocking validation and generation failure.

### Partially unvalidated Preview

Preview belongs in the workflow and the chart/highway owns the visual hierarchy.
The current deterministic scenario covers the timing-diagnostics fallback, not
the primary audio-backed experience. Detailed audio behavior is therefore not
claimed as current or proven.

### Structural 1024 compaction

The 1024 adaptation changes composition rather than shrinking everything:

- the global navigation becomes a 72 px rail;
- project and workflow chrome become compact but remain labeled;
- Source Review uses horizontal local navigation and one detail region;
- Generate content stacks and technical detail collapses;
- Generate failure retains visible recovery while compressing context;
- Preview removes the permanent diagnostic sidebar so the highway remains usable.

## Accepted compromises

- Workflow strips require careful wording so they do not imply strict linearity.
- Some secondary metadata moves into compact rows or disclosure at 1024.
- The design uses generic progress rather than unsupported named phases.
- Preview hierarchy is designed while audio-backed interaction remains unverified.
- Standalone PNG export is not required; Pencil MCP inspection is review evidence.

## Rejected alternatives

- Workflow steps as unrelated global destinations.
- A second persistent project-section sidebar.
- A third complete IA alternative disguised as a hybrid.
- Advisory mappings styled as blocking errors.
- Multiple equal-weight primary actions.
- Permanently visible technical logs or diagnostics.
- A generic standalone status pill.
- New Source Review routes in this issue.

## Unresolved questions

1. What exactly does Retry repeat?
2. Which upstream edits stale or invalidate downstream output?
3. Is Open output safe during generation?
4. Which save-state transitions can the current model expose reliably?
5. What is the validated audio-backed Preview behavior?

## Deferred work

Production implementation, deterministic audio-backed Preview evidence,
behavior-definition issues, accessibility testing, and automated visual
regression validation remain separate follow-up work.
