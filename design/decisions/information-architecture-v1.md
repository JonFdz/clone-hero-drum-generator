# CHDG Information Architecture Exploration

**Status:** SELECTED — bounded hybrid approved at Approval Checkpoint 2  
**Issue:** #89  
**Updated:** 2026-07-18  
**Scope:** Selected architecture record; Foundations and high-fidelity artifacts are documented separately

## Selected direction

Use a bounded hybrid: Workflow-first owns progression and next-action clarity;
Project workspace owns revisitation and stable project sections. This is not a
third alternative. It assigns one responsibility to each navigation layer and
keeps existing routes and capabilities.

The maintainer approved this responsibility model at Checkpoint 2. Foundations
V1 and the high-fidelity 1440 × 900 core workflow implement it without a second
persistent project-section sidebar and were approved at Checkpoint 3.

## Problem statement

The current shell presents workflow stages as unrelated global destinations,
repeats project information, hides advisory attention, and makes Source Review
an exceptionally long mixed-responsibility page. At 1024 × 768, fixed shell and
action regions consume too much working space. The architecture must improve
orientation and recovery without inventing domain behavior.

## Confirmed constraints

| Constraint | Architectural consequence |
|---|---|
| Unknown mappings remain advisory | Show affected content, consequence, and review path without blocking progression. |
| Retry stays in Generate | Preserve project, Generate context, failure summary, retry entry, and access to corrective steps. Retry scope remains unspecified. |
| Autosave is clarified, not redesigned | Communicate only states supported by the persistence model; any semantic change is future product work. |
| Completed steps are revisitable | Keep navigation available while warning that downstream readiness or output may change. |
| Audio-backed Preview is partially unvalidated | Place Preview in the architecture but avoid unsupported audio-detail design. |
| Current routes and capabilities remain | Use existing route boundaries; Source Review subdivisions are in-page interaction proposals, not new routes. |

## Shared status semantics

Both alternatives use text plus shape/icon, never color alone.

| State | Meaning | Treatment |
|---|---|---|
| Ready | Requirements currently satisfied | “Ready” label with check marker |
| Advisory attention | Review recommended; progression allowed | “Attention · advisory” with affected item and consequence |
| Blocking issue | Requirement prevents progression | “Blocked” with corrective action |
| In progress | Work is executing | “In progress” with activity/progress region |
| Failed | Execution failed | “Failed” with recovery action and retained-context summary |
| Completed | Step completed and revisitable | “Completed” with revisit affordance |
| Unavailable | Prerequisite not satisfied | “Unavailable” with prerequisite explanation |

Generation failure is not styled as a validation warning. Advisory mapping
attention is not styled as blocking.

## Alternative A — Workflow-first

### Responsibility model

- **Global navigation:** Home, Projects, Settings, and optional help/status.
- **Project context:** compact persistent header with project name, source
  identity, save-state wording, overall readiness, and contextual project menu.
- **Workflow navigation:** ordered Details → Source Review → Generate → Preview
  stepper. Completed steps remain interactive; unavailable steps explain why.
- **Page navigation:** local Source Review sequence within the existing route.
- **Page actions:** one dominant action aligned with the current step; secondary
  and technical actions are grouped separately.

### Representative states

| State | Low-fidelity response |
|---|---|
| Home / Empty | One primary “Create project”; Open project and recent projects are secondary; help/import details are subordinate. |
| Project Details / Loaded | Details is current; project/source summary is compact; “Review source” is dominant. |
| Source Review / Ready | Local sequence shows Source & Tracks, Normalize, Mapping, Validate, Continue; completed summaries collapse. |
| Source Review / Attention | Header and Mapping section show “Attention · advisory,” affected track/item, possible skipped-content consequence, and Review action; Continue remains available. |
| Generate / Ready | Prerequisites summarize as ready; “Generate chart” is dominant; logs and profiles are disclosed on demand. |
| Generate / Failed | Failure summary leads, prior-input validity is stated only when known, “Retry generation” is dominant, Source Review is reachable, and Preview is unavailable or stale with explanation. |
| Preview / Ready | Preview is the final workflow step; current fallback is labeled partially validated; output/diagnostic actions remain secondary. |

### Source Review organization

Use an in-page local stepper, not new routes:

1. Source and track selection.
2. Normalization summary.
3. Mapping review.
4. Validation and advisory issues.
5. Continue decision.

Only the active/problem section expands fully. Completed sections retain a
compact summary and Edit/Revisit action. Technical JSON, profile metadata, and
healthy diagnostics remain collapsed.

### 1024 × 768 behavior

- Global navigation becomes a 72 px icon-and-tooltip rail.
- Project identity and save state stay in a single compact header row.
- Workflow steps become a labeled horizontal progress strip.
- Source Review local steps become a section selector plus summary, not seven
  stacked full-width cards.
- The primary action uses a compact persistent footer; secondary actions move
  into the page or overflow menu.
- Content scrolls independently without a double-height top bar.

### Strengths and risks

Strongest orientation, next-action clarity, advisory visibility, and failure
recovery. Risk: a stepper can imply strict linearity or consequence-free
revisitation unless copy and state transitions remain honest.

## Alternative B — Project workspace

### Responsibility model

- **Global navigation:** Home, Projects, Settings, and optional help/status.
- **Project context:** persistent workspace header with project identity,
  save-state wording, overall readiness, and project actions.
- **Workspace sections:** Overview/Details, Source Review, Generate, Preview.
- **Progression:** section navigation carries Completed, Attention, Failed, or
  Unavailable labels plus a “Next recommended” cue.
- **Page actions:** each section retains one dominant action while users may
  revisit any available section.

### Representative states

| State | Low-fidelity response |
|---|---|
| Home / Empty | One primary “Create project”; recent workspaces provide the main return path; Open/import/help remain secondary. |
| Project Details / Loaded | Overview is current; readiness summary identifies Source Review as next; project metadata is not repeated in content cards. |
| Source Review / Ready | Workspace section is current; summary/detail regions separate readiness from tracks, mappings, validation, and technical detail. |
| Source Review / Attention | Section badge reads “Attention · advisory”; overview names the affected track/item and consequence; Mappings sub-section is selected; Continue remains available. |
| Generate / Ready | Generate section is current and ready; prerequisites are summarized; “Generate chart” is dominant. |
| Generate / Failed | Generate section owns the Failed state and recovery panel; “Retry generation” remains primary; likely corrective section links and Preview availability are explicit. |
| Preview / Ready | Preview is a stable workspace section; fallback validation gap is labeled; diagnostics and output actions are secondary. |

### Source Review organization

Keep one route with stable local sub-navigation:

- Summary.
- Tracks.
- Mappings.
- Validation.

The summary region owns readiness and advisory consequences. The detail region
owns the selected subsection. JSON, logs, profile metadata, and healthy runtime
facts use drawers or disclosure panels. Route splitting is a future interaction
proposal, not part of this architecture.

### 1024 × 768 behavior

- Global navigation becomes a 72 px rail.
- A 176 px project-section rail preserves workspace identity and readiness.
- Project header uses one compact line; redundant metadata moves to Overview.
- Source Review detail uses one main column; technical detail opens as a drawer
  or disclosure region rather than a permanent side panel.
- Dominant actions remain in a compact section footer; section navigation does
  not scroll away.

### Strengths and risks

Strongest revisitation, stable project identity, and future scalability. Risk:
the workspace can feel unordered or settings-like unless readiness labels and
the recommended next action remain prominent.

## Evaluation matrix

| Criterion | Workflow-first | Project workspace | Trade-off | Unresolved dependency |
|---|---|---|---|---|
| User orientation | Excellent: explicit current step and sequence | Strong: current section plus readiness | Sequence clarity versus spatial stability | Effects of revisitation |
| Active-project clarity | Strong compact header | Excellent persistent workspace header | Both avoid repeated metadata | Exact save-state events |
| Intended workflow clarity | Excellent ordered stepper | Strong recommended-next cue | Linear clarity versus flexibility | Downstream invalidation rules |
| Advisory vs blocking | Excellent step-level attention | Strong section badge and summary | Both use shared semantics | Which consequences can be stated precisely |
| Revisiting completed steps | Strong but visually secondary | Excellent direct section access | Guided path versus free navigation | Whether output becomes stale |
| Primary next action | Excellent by construction | Strong if recommendation stays prominent | Workflow owns action hierarchy more naturally | None |
| Save/autosave clarity | Strong header state | Excellent persistent workspace state | Workspace offers more stable placement | Current persistence event coverage |
| Generate failure recovery | Excellent retained workflow context | Excellent retained Generate section | Equivalent when status ownership is explicit | Retry scope |
| Source Review complexity | Strong local sequence/collapse | Strong summary/detail sub-navigation | Sequential chunks versus task-based sections | Frequency of profile/mapping tasks |
| Technical disclosure | Strong per-step disclosure | Excellent drawers/detail regions | Workspace scales better for expert detail | Which diagnostics are routine |
| 1024 viability | Excellent single content rail | Good dual-rail layout | More width versus more persistent navigation | Minimum useful Source Review width |
| Future scalability | Good; new steps extend stepper | Excellent; sections/states scale independently | Step count risk versus workspace growth | Future workflow stages |
| Current route consistency | Excellent direct mapping | Excellent direct mapping | Both preserve routes | None |
| Implementation complexity | Moderate | Moderate-to-high | Workspace needs dual navigation/state summaries | Existing shell refactor effort |
| Unsupported-behavior risk | Low if step copy is careful | Low if readiness avoids guarantees | Stepper more likely to imply strict rules | Revisitation, retry, autosave semantics |

## Recommended bounded hybrid

The recommendation combines responsibilities, not visual fragments.

### Global navigation

Home, Projects, Settings, and optional help/application status only.

### Project context

A compact persistent header owns project name, source identity, save-state
wording, overall readiness, and global project actions.

### Workflow navigation

Details, Source Review, Generate, and Preview use an ordered, revisitable
workflow strip. It owns Completed, Attention, Current, Failed, and Unavailable
workflow states.

### Page navigation

Long pages such as Source Review use local task-based sections. Local navigation
does not create new application routes in this proposal.

### Page actions

Each page owns one dominant action in a compact persistent action region.
Secondary actions stay near relevant content; technical actions use disclosure.

### Status ownership

| Status | Owner |
|---|---|
| Project/save state | Project context header |
| Workflow completion/readiness | Workflow strip |
| Page validation | Page summary near the dominant action |
| Advisory mapping attention | Workflow step plus affected local section |
| Generation failure | Generate page recovery panel plus Generate step |

## Product or interaction proposals

These are design proposals, not current behavior:

- In-page Source Review section navigation and collapsing summaries.
- A compact project context header with explicit save-state wording.
- A workflow strip that exposes advisory and failure states.
- A persistent but compact dominant-action region.

No proposal changes warning blocking, retry scope, persistence semantics, route
structure, or preview audio behavior.

## Risks and implementation implications

- The shell must distinguish global navigation from project workflow.
- Workflow and page status need a single presentation model, even if underlying
  state remains distributed.
- 1024 support requires structural navigation changes, not typography reduction.
- Source Review needs view-level composition work but should retain its route
  and existing capabilities.
- Status copy must avoid promising safe revisitation or retry behavior.

## Deferred questions

1. Is opening output during generation intentionally safe?
2. What exactly does retry repeat?
3. Which previous-step edits invalidate or stale generated output?
4. Which save-state transitions can the current persistence model expose?
5. Which Source Review technical details are routine for expert users?
6. A future issue should add a deterministic audio-backed Preview reference
   before production visual validation.

## Selection record

Approval Checkpoint 2 selected the bounded hybrid on 2026-07-18. Workflow-first
orientation is the primary visual influence; Project workspace contributes
stable project context and revisitation responsibilities without its full
dual-navigation density. Foundations V1, reusable V1 components, and the eight
1440 × 900 frames now apply this selection and are pending Approval Checkpoint
3. Final 1024 × 768 adaptation and implementation handoff remain blocked.
