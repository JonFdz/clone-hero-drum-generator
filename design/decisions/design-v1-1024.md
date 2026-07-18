# CHDG Design V1 — 1024 Desktop Adaptation

**Status:** Complete for final maintainer review
**Issue:** #89
**Updated:** 2026-07-18
**Viewport:** 1024 × 768 desktop window

## Shared structural adaptation

- Global navigation uses a 72 px labeled rail.
- Project context is 60 px high and retains project, source, supported save
  state, readiness, and project actions.
- The four-step workflow remains fully visible and labeled in a compact strip.
- Page content has one dominant scrolling region; no second project sidebar is
  introduced.
- Primary actions remain visible in the page header or recovery region.
- Technical detail is disclosed rather than permanently occupying width.
- Semantic states retain text, icon/shape, border, and color.

## Screen decisions

| Screen | 1024 adaptation |
|---|---|
| Home / Empty | Reduced decorative space; retained one dominant Create action, subordinate Open action, recent projects, and compact alternatives. |
| Project Details / Loaded | Changed the permanent two-column layout to one vertical flow; kept output and known-source context in a compact subordinate row. |
| Source Review / Ready | Replaced the summary rail with a horizontal task selector and compact completed summaries above one Validation detail region. |
| Source Review / Attention | Kept the advisory adjacent to Mappings, shortened summary copy, and preserved both correction and non-blocking continuation. |
| Generate / Ready | Stacked readiness, generation summary, and compact guidance; advanced detail remains disclosed. |
| Generate / Running | Kept generic progress visible; stacked retained context and subordinate running guidance; logs remain closed. |
| Generate / Failed | Removed the redundant disabled header action; kept Retry in the recovery panel; compressed recovery context into a horizontal summary. |
| Preview / Ready | Stacked a dominant highway above compact audio, summary, and diagnostics regions; removed the permanent diagnostic sidebar. |

## Validation

All eight frames are exactly 1024 × 768. Pencil MCP visual inspection and deep
layout validation reported no clipping, overlap, or layout problems. The
adaptations do not change routes, persistence, retry scope, invalidation rules,
generation behavior, or Preview audio behavior.
