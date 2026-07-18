# CHDG Reusable Component System V1

**Status:** Approved at Approval Checkpoint 3  
**Issue:** #89  
**Updated:** 2026-07-18  
**Pencil section:** `07 / SELECTED / Reusable Components V1`

## Component inventory

| Family | Variants or states | Owner | Used by | Relationship to CURRENT |
|---|---|---|---|---|
| Application shell | 1440 structure | Global application layout | All project frames | Replaces the CURRENT shell for V1 |
| Global navigation item | Default, selected, focus-visible | Application destinations only | All eight frames | Refines CURRENT navigation and removes workflow destinations |
| Project context header | Saved reference | Project identity, source, save state, project readiness/actions | All active-project frames | Replaces repeated CURRENT project metadata |
| Workflow step | Completed, current, advisory, blocking, in progress, failed, unavailable | Workflow progression and availability | All active-project frames | New shared V1 pattern |
| Page header | Default with one dominant action | Page purpose and next action | Core workflow pages | Refines CURRENT title/action hierarchy |
| Status summary | Ready; semantic callouts provide other states | Current-page validation | Details, Source Review, Generate | Replaces repeated equal-weight readiness cards |
| Buttons | Primary, secondary, ghost, destructive, disabled, loading | Contextual action hierarchy | All frames | Refines CURRENT buttons with explicit states |
| Field and selector | Default | Page-owned input | Project Details and future form use | Refines CURRENT inputs |
| Grouped panel/card | Standard grouped panel | One task or summary | Details, review, generation | Replaces screen-specific card copies |
| Source Review local navigation | Completed/current/pending task states | In-page Source Review task selection | Source Review Ready/Attention | New; no Angular routes added |
| Validation message | Success | Page validation | Source Review Ready | Refines CURRENT success messaging |
| Advisory callout | Unknown mapping | Non-blocking affected condition | Source Review Attention | Replaces warning treatment that obscured advisory semantics |
| Blocking callout | Error | Page validation that prevents progression | Available for blocking states | Separate from advisory and runtime failure |
| Empty state | Project | First-use hierarchy | Home Empty | Refines CURRENT equal-weight entry paths |
| Progress state | Generation | Active generation feedback | Generate Running | Refines CURRENT progress hierarchy |
| Generation failure panel | Default recovery hierarchy | Generate failure and retry | Generate Failed | Replaces contradictory ready/failure/preview signals |
| List row | Status | Mapping or validation item | Source Review Attention | Shared structured row |
| Technical disclosure | Closed | Secondary technical evidence | Review, Generate, Preview | Replaces always-visible technical detail |
| Persistent action region | Compact | Dominant long-page action | Available for Source Review/1024 adaptation | New shared pattern; used only when it improves access |

## State and ownership rules

- Global navigation never owns Source Review, Generate, or Preview.
- The project header owns identity and supported save-state wording.
- The workflow strip owns completion, attention, failure, and availability.
- Page summaries own current-page validation.
- Advisory mapping conditions appear in the workflow step and affected local
  section, but remain non-blocking.
- Generation failure appears in the Generate step and recovery panel.
- Technical evidence uses disclosure and never competes with the primary action.

## Approved standalone status-pill deviation

No generic standalone V1 status-pill component exists. This is an approved
deviation, not an incomplete component task. Status representations are
implemented through owner-specific components and variants:

- project identity, readiness, and save state: project context header;
- workflow completion, attention, failure, progress, and availability:
  workflow-step variants;
- page validation: status summary and validation message;
- unknown mapping attention: advisory callout and affected local section;
- generation failure: Generate recovery panel and failed workflow step.

This prevents duplicated or context-free status presentation.

## Reference validation

The eight 1440 frames use V1 component references for global navigation,
project context, workflow states, controls, Source Review navigation, semantic
messages, recovery, and technical disclosure. Pencil reports 35 V1 reusable
components alongside 15 preserved CURRENT components. CURRENT components are
not used as sources for V1 screens.

## Accessibility

- Focus-visible has a shared non-color-only outline.
- Disabled and unavailable states use reduced emphasis plus explicit labels or
  lock markers.
- Advisory, blocking, failed, completed, and in-progress states combine text,
  icons, and borders.
- Essential icons retain visible text labels.
