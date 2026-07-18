# CHDG Foundations V1

**Status:** Approved at Approval Checkpoint 3  
**Issue:** #89  
**Updated:** 2026-07-18  
**Pencil section:** `06 / SELECTED / CHDG Foundations V1`

## Purpose

Foundations V1 provides the semantic visual system for the selected bounded
hybrid. It is intentionally separate from `01 / CURRENT / CHDG Foundations`.
It changes presentation and ownership, not application behavior.

## Semantic color system

| Role | Token | Value | Use |
|---|---|---:|---|
| Application background | `v1.color.bg` | `#0B1016` | Main desktop canvas |
| Elevated background | `v1.color.bgElevated` | `#111923` | Rails, headers, secondary regions |
| Surface | `v1.color.surface` | `#17212C` | Panels and controls |
| Strong surface | `v1.color.surfaceStrong` | `#1D2936` | Selected and emphasized surfaces |
| Border | `v1.color.border` | `#314154` | Default separation |
| Strong border | `v1.color.borderStrong` | `#4A6075` | Focused or persistent regions |
| Primary text | `v1.color.text` | `#F4F7FA` | Titles and primary content |
| Secondary text | `v1.color.textSecondary` | `#C2CCD6` | Descriptions and supporting values |
| Muted text | `v1.color.textMuted` | `#8493A3` | Metadata and subordinate detail |
| Interactive accent | `v1.color.accent` | `#8B6DF2` | Primary actions and current selection |
| Selected | `v1.color.selected` | `#6F5BD8` | Active/selected control background |
| Focus | `v1.color.focus` | `#7DD3FC` | Keyboard focus-visible ring |
| Advisory | `v1.color.advisory` | `#F4B860` | Non-blocking attention |
| Blocking | `v1.color.blocking` | `#F87171` | Validation that prevents progression |
| Failure | `v1.color.failure` | `#F43F6A` | Generation/runtime failure |
| Completed | `v1.color.completed` | `#34D399` | Completed or successful state |
| In progress | `v1.color.progress` | `#38BDF8` | Active work and progress |
| Unavailable | `v1.color.unavailable` | `#64748B` | Disabled or unavailable state |
| Destructive | `v1.color.destructive` | `#DC2626` | Destructive action |

Advisory, blocking, and failure are separate semantics. Every status pairs
color with an icon, explicit label, and border/shape treatment.

## Typography

- **Application title:** 20 / 700.
- **Page title:** 30 / 800.
- **Section title:** 18 / 700.
- **Body:** 14–15 / regular.
- **Secondary and metadata:** 11–13 with reduced contrast.
- **Labels:** 10–12 / 700 with restrained letter spacing.
- **Technical values:** IBM Plex Mono at 11–13 only where exact paths, timing,
  or diagnostic values benefit from fixed-width alignment.

Inter remains the primary application family. The system avoids extra display
styles so hierarchy comes from responsibility and spacing rather than novelty.

## Spacing, density, and shape

- Spacing scale: 4, 8, 12, 16, 20, 24, 32, and 40 px.
- Default control height: 44 px; compact control height: 36 px.
- Global navigation rail: 88 px at 1440.
- Radii: 6 px for compact elements, 10 px for controls, 14 px for structural
  panels.
- Borders provide the default hierarchy. Elevation is reserved for overlays or
  persistent action regions and is not decorative.
- Page rhythm uses 24–32 px between major sections and 12–20 px inside task
  groups.

## Interaction states

The component system defines default, hover, active, selected, focus-visible,
disabled, loading, advisory, blocking, failed, and destructive treatments.
Keyboard focus uses a shared 2 px `v1.color.focus` outline and never relies on
the selected fill alone.

## Icon treatment

- Lucide outline icons are used at 14, 16, 18, 20, or 24 px.
- Icons align to the first line of status copy or the center of a control.
- Status icons always accompany text.
- Icons never replace essential action or status labels.

## Material changes

| Change | Classification | Rationale |
|---|---|---|
| Darker layered surface hierarchy | Visual-only | Improves separation without decorative elevation. |
| Explicit advisory/blocking/failure tokens | Information architecture | Makes status meaning and ownership distinguishable. |
| Shared focus-visible treatment | Visual-only / accessibility | Makes keyboard position explicit. |
| Compact rail and 44/36 px density modes | Information architecture | Preserves desktop working space and action hierarchy. |
| Monospace only for technical evidence | Visual-only | Reduces unnecessary technical visual weight. |

No token changes persistence, validation, generation, retry, or Preview behavior.
