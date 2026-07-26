# Design Process: CHDG Design V1

## Context

CHDG has an existing Pencil workspace and a deterministic browser visual harness. The design process must evolve the current workspace, not start from an empty redesign or modify application code.

## Workflow

```text
Preflight and safe branch synchronization
  → Existing design inventory
  → Browser baseline capture
  → Current shell and token reference
  → Evidence-based UX audit
  → Checkpoint 1
  → Workflow-first and Project-workspace low fidelity
  → Comparison and recommendation
  → Checkpoint 2
  → Foundations V1 and reusable components
  → Complete 1440 high-fidelity flow
  → Checkpoint 3
  → 1024 adaptations
  → State matrix and implementation handoff
  → Pencil and repository boundary validation
```

## Decision 1: Preserve Before Reorganizing

Inventory existing files, Pencil sections, variables, components, frames, prompts, and decisions. The suggested folder structure is a target capability, not permission to rearrange everything. Preserve an existing coherent convention and document how it maps to the required deliverables.

## Decision 2: Pencil MCP Is the Primary Editor

Use Pencil MCP to open, inspect, edit, and validate `design/chdg-ui.pen`. Do not rewrite the whole file as generic JSON. Reopen and visually inspect the file after baseline organization, IA exploration, foundations, 1440 flow, and 1024 adaptation.

## Decision 3: Current and Proposed Material Stay Distinct

Use clear statuses such as:

```text
CURRENT
EXPLORATION
SELECTED
V1 PROPOSED
V1 APPROVED
DEFERRED
```

Do not overwrite current-state evidence with the V1 proposal.

## Decision 4: Canonical Baseline URLs

Run:

```bash
pnpm --filter @chdg/desktop dev:browser
```

Capture with `harnessUi=hidden`:

```text
http://127.0.0.1:4200/home?scenario=empty&harnessUi=hidden
http://127.0.0.1:4200/projects/details?scenario=project-loaded&harnessUi=hidden
http://127.0.0.1:4200/source-review?scenario=source-review-ready&harnessUi=hidden
http://127.0.0.1:4200/source-review?scenario=source-review-attention&harnessUi=hidden
http://127.0.0.1:4200/generate?scenario=generate-ready&harnessUi=hidden
http://127.0.0.1:4200/generate?scenario=generate-running&harnessUi=hidden
http://127.0.0.1:4200/generate?scenario=generate-failed&harnessUi=hidden
http://127.0.0.1:4200/preview?scenario=preview-ready&harnessUi=hidden
```

For each, open directly, reload, inspect console, verify state, capture 1440 × 900 and 1024 × 768, and record provenance.

## Decision 5: Preferred Screenshot Naming

```text
design/current-ui/1440x900/home-empty.png
design/current-ui/1440x900/project-details-loaded.png
design/current-ui/1440x900/source-review-ready.png
design/current-ui/1440x900/source-review-attention.png
design/current-ui/1440x900/generate-ready.png
design/current-ui/1440x900/generate-running.png
design/current-ui/1440x900/generate-failed.png
design/current-ui/1440x900/preview-ready.png
```

Repeat under `1024x768/`. Preserve another established naming convention if it is already coherent.

## Decision 6: Audit Format

Each important finding should use:

```markdown
## UX-001 — Finding title

**Severity:** High
**Category:** Information architecture
**Affected screens:** ...

### Problem
...

### Evidence
- Screenshot reference
- Observed behavior

### User consequence
...

### Design V1 response
...

### Open question
...
```

Use Critical, High, Medium, or Low severity. Prefer fewer well-supported findings over a large generic list.

## Decision 7: Information Architecture Alternatives

### Workflow-first

Dominant ordered workflow, persistent project context, clear completed/current/attention/future step states, strong next action, and safe revisitation.

### Project workspace

Dominant active-project workspace, stable project sections, section readiness, visible prerequisites, and explicit next-action guidance.

### Hybrid

A hybrid is allowed only when responsibilities are explicit, for example:

```text
Global navigation: Home, Projects, Settings
Project context: active project, save state, overall readiness
Workflow navigation: Details → Source Review → Generate → Preview
Page actions: local work, validation, primary next step
```

Do not make a hybrid by simply mixing visual elements.

## Decision 8: Evaluation Criteria

Compare both alternatives using:

- orientation;
- persistent project context;
- workflow clarity;
- attention visibility;
- revisitation;
- next-action clarity;
- 1024 viability;
- scalability;
- implementation implications.

## Decision 9: Foundations Before Final Polish

After IA approval, define V1 colors, typography, spacing, radii, borders/elevation, density, control sizing, icons, and state semantics. Then create reusable components for shell, navigation, project context, workflow, headers, controls, panels, validation, empty/progress/error states, rows, and action footer.

## Decision 10: 1440 Primary, 1024 Adaptation

Complete and approve the coherent 1440 × 900 flow first. Then adapt to 1024 × 768 with wrapping, stacking, scrolling, collapsing secondary panels, progressive disclosure, and compact variants. Do not introduce mobile navigation.

## Decision 11: Frame Naming

Preferred names:

```text
V1 / Home / Empty / 1440
V1 / Project Details / Loaded / 1440
V1 / Source Review / Ready / 1440
V1 / Source Review / Attention / 1440
V1 / Generate / Ready / 1440
V1 / Generate / Running / 1440
V1 / Generate / Failed / 1440
V1 / Preview / Ready / 1440
```

Use equivalent `/ 1024` names. A different established convention is acceptable if consistent and documented.

## Decision 12: Change Classification

Classify material changes as:

- visual-only;
- information architecture;
- interaction behavior;
- domain/product behavior;
- unresolved.

Domain changes are not approved merely because they appear in Pencil.

## Decision 13: Blocking Checkpoints

### Checkpoint 1
Present baseline, top findings, evidence, severity, missing states, and open behavior questions.

### Checkpoint 2
Present both IA alternatives, evaluation matrix, recommendation/hybrid responsibilities, risks, and implementation implications.

### Checkpoint 3
Present all eight 1440 frames, shared components, behavior proposals, unresolved questions, and known 1024 risks.

Wait for explicit approval after each.

## Decision 14: Handoff

Preferred documents:

```text
design/handoff/screen-scenario-map.md
design/handoff/component-inventory.md
design/handoff/implementation-sequence.md
```

The screen map should contain frame, route, scenario, viewport, state, components, constraints, visual changes, behavior proposals, and open questions. The component inventory should contain variants, states, screens, current equivalents, and new dependencies. The implementation sequence should recommend focused follow-up issues starting with foundations/shell and then screens/states.

## Final Validation

Before PR:

- reopen Pencil;
- inspect required sections and all 16 viewport frames;
- verify component references;
- verify screenshot provenance;
- verify handoff mapping;
- review unresolved questions;
- inspect Git diff;
- prove no file under apps/ or packages/ changed.

## Stop Conditions

Stop and ask the maintainer if the workspace cannot be opened, current behavior is ambiguous, a scenario cannot be reproduced, architecture approval is missing, a design changes domain behavior, 1024 requires a structural compromise, a production change appears necessary, a new dependency/tool is needed, or Pencil MCP cannot safely perform the edit.
