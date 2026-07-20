# CHDG V1 Screen-to-Scenario Map

Each V1 frame is mapped to the deterministic current-state evidence used for
traceability. V1 is a design proposal; the baseline screenshots remain evidence
of current behavior.

## Shared classifications

- **Visual-only:** semantic styling, hierarchy, spacing, typography, and density.
- **Information architecture:** application-only global navigation, compact
  project context, ordered workflow, local Source Review tasks, and one dominant
  page action.
- **Interaction proposals:** Source Review task selection/collapse, workflow
  revisitation, generic progress hierarchy, contextual recovery links, and
  technical disclosure.
- **Domain/product proposals:** none approved.

| V1 frame | Viewport | Route / scenario | Current baseline | Primary state | Primary reusable components |
|---|---:|---|---|---|---|
| `V1 / Home / Empty / 1440` | 1440×900 | `/home` / `empty` | `design/current-ui/1440x900/home-empty.png` | No active project | Global nav, empty state, buttons |
| `V1 / Home / Empty / 1024` | 1024×768 | `/home` / `empty` | `design/current-ui/1024x768/home-empty.png` | No active project | Compact global nav, empty state, buttons |
| `V1 / Project Details / Loaded / 1440` | 1440×900 | `/projects/details` / `project-loaded` | `design/current-ui/1440x900/project-details-loaded.png` | Details ready | Project header, workflow, page header, status summary, fields/panels |
| `V1 / Project Details / Loaded / 1024` | 1024×768 | `/projects/details` / `project-loaded` | `design/current-ui/1024x768/project-details-loaded.png` | Details ready | Compact shell/header/workflow, status summary, compact panels |
| `V1 / Source Review / Ready / 1440` | 1440×900 | `/source-review` / `source-review-ready` | `design/current-ui/1440x900/source-review-ready.png` | Validation ready | Workflow, local task navigation, validation message, panels, disclosure |
| `V1 / Source Review / Ready / 1024` | 1024×768 | `/source-review` / `source-review-ready` | `design/current-ui/1024x768/source-review-ready.png` | Validation ready | Compact workflow, horizontal local navigation, summaries, validation message |
| `V1 / Source Review / Attention / 1440` | 1440×900 | `/source-review` / `source-review-attention` | `design/current-ui/1440x900/source-review-attention.png` | Advisory mapping | Advisory workflow step, local navigation, advisory callout, list row |
| `V1 / Source Review / Attention / 1024` | 1024×768 | `/source-review` / `source-review-attention` | `design/current-ui/1024x768/source-review-attention.png` | Advisory mapping | Compact advisory workflow, horizontal local navigation, callout, list row |
| `V1 / Generate / Ready / 1440` | 1440×900 | `/generate` / `generate-ready` | `design/current-ui/1440x900/generate-ready.png` | Ready to generate | Workflow, status summary, panels, primary button, disclosure |
| `V1 / Generate / Ready / 1024` | 1024×768 | `/generate` / `generate-ready` | `design/current-ui/1024x768/generate-ready.png` | Ready to generate | Compact workflow, stacked panels, primary button, disclosure |
| `V1 / Generate / Running / 1440` | 1440×900 | `/generate` / `generate-running` | `design/current-ui/1440x900/generate-running.png` | In progress | In-progress workflow step, progress state, loading button, disclosure |
| `V1 / Generate / Running / 1024` | 1024×768 | `/generate` / `generate-running` | `design/current-ui/1024x768/generate-running.png` | In progress | Compact in-progress workflow, progress state, stacked context, disclosure |
| `V1 / Generate / Failed / 1440` | 1440×900 | `/generate` / `generate-failed` | `design/current-ui/1440x900/generate-failed.png` | Runtime failure | Failed workflow step, failure panel, Retry, disclosure |
| `V1 / Generate / Failed / 1024` | 1024×768 | `/generate` / `generate-failed` | `design/current-ui/1024x768/generate-failed.png` | Runtime failure | Compact failed workflow, failure panel, Retry, context summary, disclosure |
| `V1 / Preview / Ready / 1440` | 1440×900 | `/preview` / `preview-ready` | `design/current-ui/1440x900/preview-ready.png` | Timing-diagnostics fallback | Workflow, preview region, controls, availability callout, disclosure |
| `V1 / Preview / Ready / 1024` | 1024×768 | `/preview` / `preview-ready` | `design/current-ui/1024x768/preview-ready.png` | Timing-diagnostics fallback | Compact workflow, preview-dominant region, controls, compact disclosure row |

## State-specific change and behavior notes

| State | Visual-only changes | IA changes | Interaction proposals | Current constraints and unresolved questions |
|---|---|---|---|---|
| Home / Empty | Clearer hierarchy and compact density | Application-only global nav; one primary entry path | Recent-project selection stays secondary | No behavior change |
| Project Details / Loaded | Grouped metadata and clearer readiness | Compact project header; ordered workflow | Workflow steps can be revisited | Save transitions and downstream effects remain unresolved |
| Source Review / Ready | Short summaries and reduced technical weight | Four local tasks inside the existing route | Select/collapse completed tasks | Revisit consequences remain unresolved |
| Source Review / Attention | Distinct advisory icon, border, label, and consequence | Advisory owned by workflow step and affected Mappings section | Correct mapping or continue | Unknown mapping is verified advisory/non-blocking; downstream effect unresolved |
| Generate / Ready | Concise input/output summary | Generate owns one dominant action | Advanced details disclosed | Mandatory prerequisites must remain current-behavior driven |
| Generate / Running | Generic progress and subordinate logs | Generate owns running state; Preview unavailable | Technical logs disclosed | No unsupported phases; Open output safety unresolved |
| Generate / Failed | Failure/recovery hierarchy | Generate owns failure; Preview unavailable | Retry and corrective Source Review link | Retry scope and retained-input validity unresolved |
| Preview / Ready | Highway-first hierarchy | Preview is the final workflow step | Diagnostics disclosed | Audio-backed behavior is unverified; current deterministic scenario is fallback-only |

No V1 frame should be interpreted as proof of behavior that the corresponding
browser-harness scenario does not expose.
