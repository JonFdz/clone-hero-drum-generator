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

Create new top-level sections without deleting old ones. Recommended naming:

```text
08 / SUPERSEDED / Design V1 Workflow
09 / REFERENCE / Simplified V1 Approved Mockups
10 / SELECTED / Simplified V1 Foundations Delta
11 / SELECTED / Simplified V1 Components
12 / V1 / Simplified Flow / 1440
13 / V1 / Simplified Flow / 1024
14 / V1 / Simplified States
15 / HANDOFF / Simplified V1
```

The exact numeric prefix may be adjusted to avoid collision with existing
sections, but the human-readable names must remain stable and explicit.

## Required main frames

At both 1440 × 900 and 1024 × 768:

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

Additional state frames are defined by the OpenSpec and the screen inventory.

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
