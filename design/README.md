# CHDG Design Workspace

> **Current authority (Simplified V1):** `openspec/changes/chdg-simplified-v1/`,
> `docs/product/CHDG_V1_PRODUCT_DECISIONS.md`, and the Simplified V1 design
> records supersede the workflow information architecture approved in issue #89.
> The prior Design V1 remains historical evidence and a reusable source for
> foundations, semantic states, accessibility treatment, and the Highway visual
> direction. Do not delete or silently rewrite it.

This directory is the version-controlled design workspace for the Clone Hero
Drum Generator desktop application.

## Current product flow

```text
Home
  → Create Project
      → Project Details
      → Track & Mapping
      → Creating Project
  → Editor
      → Preview
      → Mappings
      → contextual Project Details
      → contextual Export
```

There is no permanent application sidebar and no user-facing Source Review,
Generate, or Validation stage.

## Design authority

- `design/chdg-ui.pen` is the editable Pencil workspace.
- `design/decisions/simplified-v1-design-brief.md` is the approved Simplified V1
  design contract.
- `design/references/simplified-v1-mockups/` contains the final exploratory
  mockups explicitly approved by the maintainer.
- The mockups are references, not implementation-ready specifications.
- `openspec/changes/chdg-simplified-v1/` owns product requirements and
  implementation acceptance scenarios.
- Production behavior remains authoritative for current behavior until each
  Simplified V1 implementation issue is merged.

## Historical material

The existing CURRENT, EXPLORATION, SELECTED, V1, and DEFERRED Pencil material
from issue #89 must remain distinguishable.

The following prior concepts are superseded for the new product V1:

```text
global rail/sidebar
Project Details → Source Review → Generate → Preview workflow strip
Source Review as a standalone route
Generate as a standalone route
Validation as a standalone route
manual Save as a normal primary action
external GP/MIDI and original audio as permanent project dependencies
Preview depending on exported notes.chart/song.ogg
```

The following prior work remains reusable:

- semantic color and state ownership;
- typography and density;
- visible keyboard focus;
- no color-only statuses;
- buttons, fields, grouped panels, callouts, progress, errors, disclosures;
- responsive 1440 × 900 and 1024 × 768 discipline;
- waveform and Highway visual direction;
- contextual technical diagnostics.

## Canonical Simplified V1 routes

```text
/home
/projects
/projects/new/details
/projects/new/mapping
/projects/new/creating
/projects/:projectId/editor/preview
/projects/:projectId/editor/mappings
/settings
```

The following are contextual surfaces and **not routes**:

```text
Project Details panel/dialog
Edit Note panel/dialog
Export confirmation
Export progress
Export result
Save a Copy
```

Do not invent additional permanent routes without updating the OpenSpec route
contract first.

## Approved mockup references

Read:

```text
design/references/simplified-v1-mockups/README.md
```

The PNGs were copied byte-for-byte from the final approved generated images.
They must not be regenerated during Wave 0. Pencil work should use them as
visual references while correcting text, responsive behavior, state coverage,
and implementation feasibility.

## Simplified V1 Pencil work

Issue #94 established the D1 checkpoint in three new top-level sections:

```text
08 / SIMPLIFIED V1 / IA
09 / SIMPLIFIED V1 / STRUCTURAL COMPONENTS
10 / SIMPLIFIED V1 / ROUTE AND STATE MAP
```

These are structural D1 artifacts, not final D2 screens. Review the decision and
handoff records before treating a placement or responsive pattern as final:

- `design/decisions/simplified-v1-information-architecture.md`
- `design/handoff/simplified-v1-ia-inventory.md`
- `design/handoff/simplified-v1-component-state-inventory.md`
- `design/handoff/simplified-v1-mockup-traceability.md`
- `design/handoff/simplified-v1-ia-validation.md`

## D1 structural inventory

```text
Simplified V1 / Home / Recent Projects
Simplified V1 / Create Project / Details
Simplified V1 / Create Project / Track & Mapping
Simplified V1 / Create Project / Creating
Simplified V1 / Editor / Preview
Simplified V1 / Editor / Preview / Note Selected
Simplified V1 / Editor / Mappings
Simplified V1 / Editor / Project Details
Simplified V1 / Export / Progress
Simplified V1 / Export / Success
Simplified V1 / Export / Failure
```

Issue #94 represents the full route/state inventory as 22 review cards. It also
includes two production-scale structural examples:

```text
Editor / Preview Default — 1440 × 900
Editor / 1024 Structural Adaptation — 1024 × 768
```

These examples prove the desktop and compact structural strategies; they do not
claim that every listed state has a full-size frame at both breakpoints. D2 may
add the remaining production-scale state frames while preserving D1 ownership
and navigation.

## D2 Phase A checkpoint

Issue #98 Phase A adds two non-destructive Pencil sections:

```text
11 / SIMPLIFIED V1 / D2 / 1440 FLOW
12 / SIMPLIFIED V1 / D2 / COMPONENTS AND STATES
```

The flow section contains the structurally complete inventory of 43 full
`1440 × 900` frames: 27 route-state frames and 16 contextual-surface frames.
The first visual direction was rejected during maintainer review, so those 43
frames must not yet be treated as the approved high-fidelity direction.

A separate, non-destructive remediation section now contains four production
anchors:

```text
13 / SIMPLIFIED V1 / D2 / VISUAL DIRECTION REVIEW
```

Review:

- `design/handoff/simplified-v1-d2-1440-frame-inventory.md`
- `design/handoff/simplified-v1-d2-1440-route-state-map.md`
- `design/handoff/simplified-v1-d2-1440-validation.md`
- `design/decisions/simplified-v1-d2-1440-visual-decisions.md`
- `design/handoff/visual-direction-review/simplified-v1-d2-four-anchor-comparison.md`

Review remediation adds explicit unavailable-action reasons, Back/Cancel and
progress-navigation treatment, material mapping attention/override rows,
transactionally coherent lifecycle failures, export destination/conflict/result
detail, authoritative header save failure, connected progress/contextual
component instances, and a representative visible keyboard-focus treatment.
The historical Highway is a bounded copied/refined visual derivation because
its source node is not a reusable Pencil component.

Checkpoint status:

- **The structural 1440 × 900 inventory is complete.**
- **The first visual direction was rejected.**
- **Four-anchor visual remediation is complete and awaiting maintainer visual review.**
- **Propagation to the remaining 39 frames has not started.**
- **1024 × 768 final adaptation not started.**
- **Issue #98 remains incomplete.**
- **PR #116 must remain draft.**
- **Maintainer approval of the four anchors is required before propagation or Phase B.**

## Working rules

- All repository artifacts are English-first.
- Use Pencil MCP for `.pen` edits.
- Save explicitly and record the on-disk hash at checkpoints.
- Preserve approved mockup references and historical Pencil content.
- Do not copy generated HTML or CSS from an image.
- Do not introduce React, Next.js, Tailwind, shadcn, or another frontend.
- Design work must not modify `apps/`, `packages/`, dependencies, or behavior.
- Every design proposal must be classified as visual, IA, interaction,
  product/domain, or unresolved.
- The design must remain viable at 1024 × 768 through structural adaptation,
  not globally smaller typography.
- The Highway must retain the majority of usable Editor space.
