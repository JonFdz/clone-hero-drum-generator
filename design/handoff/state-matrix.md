# CHDG Design V1 State Matrix

The matrix records the required deterministic states at both approved desktop
viewports. The 1024 frames are structural desktop adaptations, not mobile
designs.

## Home / Empty

| Field | Value |
|---|---|
| 1440 frame | `V1 / Home / Empty / 1440` |
| 1024 frame | `V1 / Home / Empty / 1024` |
| Route / scenario | `/home` / `empty` |
| Project state | No active project |
| Workflow state | Not started; project workflow is not shown |
| Page validation | None |
| Primary action | Create project |
| Secondary actions | Open project; recent-project selection; subordinate import/help |
| Advisory / blocking | None |
| Unavailable actions | Project workflow actions |
| Persistence wording | None |
| Unresolved behavior | None introduced by V1 |
| 1024 adaptation | 72 px rail; reduced decorative space; recent projects remain dominant content; alternatives remain subordinate. |

## Project Details / Loaded

| Field | Value |
|---|---|
| 1440 frame | `V1 / Project Details / Loaded / 1440` |
| 1024 frame | `V1 / Project Details / Loaded / 1024` |
| Route / scenario | `/projects/details` / `project-loaded` |
| Project state | Active project with source and output context |
| Workflow state | Project Details current; Source Review next; Generate and Preview unavailable |
| Page validation | Project details ready |
| Primary action | Continue to Source Review |
| Secondary actions | Change source/output settings; project menu |
| Advisory / blocking | None in deterministic state |
| Unavailable actions | Generate; Preview |
| Persistence wording | `Saved` only; no new guarantee |
| Unresolved behavior | Exact save-state transition coverage |
| 1024 adaptation | One primary vertical content flow; output and known-source context share a compact subordinate row. |

## Source Review / Ready

| Field | Value |
|---|---|
| 1440 frame | `V1 / Source Review / Ready / 1440` |
| 1024 frame | `V1 / Source Review / Ready / 1024` |
| Route / scenario | `/source-review` / `source-review-ready` |
| Project state | Active project; source interpreted |
| Workflow state | Details completed; Source Review current; Generate next; Preview unavailable |
| Page validation | Validation ready; no known advisory |
| Primary action | Continue to Generate |
| Secondary actions | Revisit Source and Tracks, Normalization, or Mappings; technical details |
| Advisory / blocking | None in deterministic ready state |
| Unavailable actions | Preview |
| Persistence wording | `Saved` in project header |
| Unresolved behavior | Consequences of revisiting upstream tasks |
| 1024 adaptation | Horizontal task selector; compact completed summaries; one Validation detail region; no second rail. |

## Source Review / Attention

| Field | Value |
|---|---|
| 1440 frame | `V1 / Source Review / Attention / 1440` |
| 1024 frame | `V1 / Source Review / Attention / 1024` |
| Route / scenario | `/source-review` / `source-review-attention` |
| Project state | Active project with one unknown mapping advisory |
| Workflow state | Source Review has advisory attention; Generate remains reachable; Preview unavailable |
| Page validation | Review recommended; progression allowed |
| Primary action | Review/correct mapping in the affected section |
| Secondary actions | Continue to Generate; return to prior task; technical details |
| Advisory conditions | Affected track, MIDI note/mapping, occurrence count, possible consequence, correction path |
| Blocking conditions | None; unknown mappings remain non-blocking |
| Unavailable actions | Preview |
| Persistence wording | `Saved` in project header |
| Unresolved behavior | Exact downstream effect if the mapping is changed |
| 1024 adaptation | Advisory stays next to Mappings detail; continuation remains visible but subordinate to correction. |

## Generate / Ready

| Field | Value |
|---|---|
| 1440 frame | `V1 / Generate / Ready / 1440` |
| 1024 frame | `V1 / Generate / Ready / 1024` |
| Route / scenario | `/generate` / `generate-ready` |
| Project state | Reviewed inputs and output destination available |
| Workflow state | Details and Source Review completed; Generate current; Preview unavailable |
| Page validation | Ready to generate |
| Primary action | Generate chart |
| Secondary actions | Change output; review advanced details; revisit prior steps |
| Advisory conditions | Retained when applicable; not blocking by default |
| Blocking conditions | Missing mandatory prerequisite, if current behavior exposes one |
| Unavailable actions | Preview until valid output exists |
| Persistence wording | `Saved` in project header |
| Unresolved behavior | Downstream invalidation after upstream changes |
| 1024 adaptation | Single-column generation summary; guidance collapses beneath the primary region. |

## Generate / Running

| Field | Value |
|---|---|
| 1440 frame | `V1 / Generate / Running / 1440` |
| 1024 frame | `V1 / Generate / Running / 1024` |
| Route / scenario | `/generate` / `generate-running` |
| Project state | Generation in progress with retained inputs/context |
| Workflow state | Generate in progress; Preview unavailable |
| Page validation | Running, not ready or failed |
| Primary action | No competing action; running feedback owns the page |
| Secondary actions | Technical logs disclosure; prior-step navigation where safe |
| Advisory / blocking | No advisory implied; incompatible actions unavailable |
| Unavailable actions | Preview; central Open output action; another Generate action |
| Persistence wording | `Saved` in project header when supported |
| Unresolved behavior | Safety of Open output during generation |
| 1024 adaptation | Progress remains above the fold; logs stay disclosed; running guidance becomes a compact subordinate region. |

## Generate / Failed

| Field | Value |
|---|---|
| 1440 frame | `V1 / Generate / Failed / 1440` |
| 1024 frame | `V1 / Generate / Failed / 1024` |
| Route / scenario | `/generate` / `generate-failed` |
| Project state | Active project retained; no valid output produced |
| Workflow state | Generate failed; Preview unavailable |
| Page validation | Runtime failure, distinct from validation blocking |
| Primary action | Retry generation |
| Secondary actions | Review Source Review; disclose technical detail |
| Advisory conditions | Any prior advisory remains contextual, not the failure itself |
| Blocking conditions | Failed run prevents valid Preview |
| Unavailable actions | Preview; normal Generate action while failure recovery is active |
| Persistence wording | `Saved` in project header when supported |
| Unresolved behavior | Retry scope; whether retained inputs are fully valid |
| 1024 adaptation | Recovery panel remains dominant; evidence/logs are subordinate; context becomes a compact horizontal summary. |

## Preview / Ready

| Field | Value |
|---|---|
| 1440 frame | `V1 / Preview / Ready / 1440` |
| 1024 frame | `V1 / Preview / Ready / 1024` |
| Route / scenario | `/preview` / `preview-ready` |
| Project state | Valid generated output available |
| Workflow state | Prior steps completed; Preview current |
| Page validation | Preview reference available; audio-backed behavior partially unvalidated |
| Primary action | Inspect chart/highway |
| Secondary actions | Transport/offset controls; Open output folder; diagnostics disclosure |
| Advisory conditions | Audio availability notice where current state requires it |
| Blocking conditions | None claimed for the deterministic fallback |
| Unavailable actions | Unsupported audio actions must not be implied as available |
| Persistence wording | `Saved` in project header |
| Unresolved behavior | Primary audio-backed Preview behavior |
| 1024 adaptation | Highway receives most usable space; diagnostics become a compact disclosure row; transport remains reachable. |
