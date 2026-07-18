# CHDG V1 Component Inventory

Pencil contains 35 V1 reusable nodes across 19 implementation-facing component
families, plus 15 preserved CURRENT components. Two nested reusable action nodes
belong to their parent patterns and are not separate implementation families.

| Component family | Responsibility | Variants / states | 1440 and 1024 usage | Current equivalent | Implementation / behavior dependency |
|---|---|---|---|---|---|
| Application shell | Own global rail and project workspace regions | 1440; compact 1024 composition | All frames | CURRENT shell | Preserve existing route outlets; responsive composition only |
| Global navigation item | Application-level destinations | Default, selected, focus-visible | Home, Projects, Settings on all frames | CURRENT normal/active navigation | Do not add workflow routes to global nav |
| Project context header | Project/source identity, supported save state, readiness, actions | Saved reference; compact height at 1024 | All active-project frames | Repeated CURRENT project metadata | Exact save-state events remain unresolved |
| Workflow step | Ordered workflow status and revisitation | Completed, current, advisory, blocking, in progress, failed, unavailable | All active-project frames | No equivalent ordered pattern | Revisitation effects and invalidation remain unresolved |
| Page header | Page identity and one dominant action | Default; compact composition at 1024 | All core pages | CURRENT title/action regions | One primary action only |
| Status summary | Current-page validation | Ready plus semantic page-owned composition | Details, Review, Generate | CURRENT cards/pills | Must not duplicate project/workflow state |
| Button | Action hierarchy | Primary, secondary, ghost, destructive, disabled, loading | All frames | CURRENT primary/secondary/ghost/disabled | Use current enabled/disabled behavior |
| Field | Page-owned text/path value | Default | Details; future form use | CURRENT input | Existing validation/persistence rules |
| Selector | Page-owned selection | Default | Details; future form use | CURRENT select | Existing option/source behavior |
| Grouped panel/card | One task or summary region | Standard; compact responsive composition | Details, Review, Generate | CURRENT standard/mini cards | Structural only |
| Source Review local navigation | Select one task detail region | Completed, current, attention, pending | Review Ready/Attention; horizontal at 1024 | None | Same Angular route; route splitting not approved |
| Validation message | Page-validation result | Success | Source Review Ready | CURRENT messages | Reflect verified validation only |
| Advisory callout | Non-blocking attention with consequence/action | Unknown mapping | Source Review Attention | CURRENT warning message | Unknown mappings remain advisory |
| Blocking callout | Prevented progression with correction | Blocking error | Available for future verified blocking states | CURRENT danger message | Must be driven by verified mandatory rules |
| Empty state | First-use hierarchy | Project empty | Home | CURRENT empty content | No behavior change |
| Progress state | Honest operation feedback | Generic generation progress | Generate Running | CURRENT running content | Do not invent phases |
| Generation failure panel | Failure summary and recovery | Failed/retry | Generate Failed | CURRENT failed content | Retry scope remains unresolved |
| List/table row | Structured affected item/status | Mapping/status row | Source Review Attention | Screen-specific rows | Preserve mapping identity and current actions |
| Technical detail disclosure | Subordinate evidence | Closed | Review, Generate, Preview | Always-visible technical detail | Disclosure interaction is proposed |
| Compact persistent action region | Keep one long-page action reachable | Compact | Available where scroll requires it; not forced on every frame | None | Must not obscure content or create nested scroll traps |

## Approved status-component deviation

There is no generic standalone V1 status-pill component. This is an approved
Checkpoint 3 deviation, not missing work. Owner-specific variants replace it:

| Status owner | Component / variant |
|---|---|
| Project identity, readiness, save state | Project context header |
| Workflow completion, current, attention, blocking, progress, failure, availability | Workflow-step variants |
| Current-page validation | Status summary and validation message |
| Unknown mapping advisory | Advisory callout plus affected Source Review task |
| Generation failure | Generation failure panel plus failed workflow step |

Icons never replace labels, and status meaning never depends on color alone.

## Exact Pencil reusable-node inventory

| # | Pencil node | Family / usage |
|---:|---|---|
| 1 | `V1 / Button / Primary` | Dominant page and recovery actions |
| 2 | `V1 / Button / Secondary` | Open/change/output actions |
| 3 | `V1 / Button / Ghost` | Contextual actions |
| 4 | `V1 / Button / Destructive` | Destructive project actions when required |
| 5 | `V1 / Button / Disabled` | Explicit unavailable action state |
| 6 | `V1 / Button / Loading` | Generate Running action feedback |
| 7 | `V1 / Field / Default` | Project Details and future forms |
| 8 | `V1 / Selector / Default` | Project/source selections |
| 9 | `V1 / Global Nav Item / Default` | Unselected global destinations |
| 10 | `V1 / Global Nav Item / Selected` | Current global destination |
| 11 | `V1 / Global Nav Item / Focus Visible` | Keyboard-focus reference |
| 12 | `V1 / Application Shell / 1440` | Shared 1440 shell reference; compact composition is demonstrated in 1024 frames |
| 13 | `V1 / Project Context Header / Saved` | Active-project frames at both viewports |
| 14 | `V1 / Workflow Step / Completed` | Revisitable completed steps |
| 15 | `V1 / Workflow Step / Current` | Current workflow step |
| 16 | `V1 / Workflow Step / Advisory` | Source Review advisory attention |
| 17 | `V1 / Workflow Step / Blocking` | Verified future blocking state |
| 18 | `V1 / Workflow Step / In Progress` | Generate Running |
| 19 | `V1 / Workflow Step / Failed` | Generate Failed |
| 20 | `V1 / Workflow Step / Unavailable` | Not-ready workflow steps |
| 21 | `V1 / Page Header / Default` | Shared page identity/action reference |
| 22 | `V1 / Status Summary / Ready` | Page validation/readiness summaries |
| 23 | `V1 / Card / Grouped Panel` | Details, Review, and Generate grouping |
| 24 | `V1 / Source Review Local Navigation / Default` | Ready and Attention at both viewports |
| 25 | `V1 / Validation Message / Success` | Source Review Ready |
| 26 | `V1 / Advisory Callout / Mapping` | Source Review Attention |
| 27 | `V1 / Blocking Callout / Error` | Verified future blocking validation |
| 28 | `V1 / Empty State / Project` | Home Empty |
| 29 | `Empty Primary Action` | Nested reusable action owned by the empty-state pattern |
| 30 | `V1 / Progress State / Generation` | Generate Running |
| 31 | `V1 / Generation Failure Panel / Default` | Generate Failed |
| 32 | `Retry Action` | Nested reusable action owned by the failure panel |
| 33 | `V1 / List Row / Status` | Affected mapping/validation rows |
| 34 | `V1 / Technical Detail Disclosure / Closed` | Review, Generate, and Preview |
| 35 | `V1 / Persistent Action Region / Compact` | Optional long-page action ownership |

The two nested reusable action nodes are implementation children of their
parent patterns, so the implementation-facing count remains 19 component
families.
