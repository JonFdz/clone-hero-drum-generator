# Prompt 08 — Design CHDG Simplified V1

Use this prompt only under the D1/D2/D3 issue scope and after the Simplified V1
OpenSpec has been transferred to Engram.

## Mission

Extend `design/chdg-ui.pen` with the new no-sidebar Simplified V1 flow while
preserving every historical CURRENT, EXPLORATION, SELECTED, V1, and DEFERRED
section.

## Read first

```text
openspec/changes/chdg-simplified-v1/
docs/product/CHDG_V1_PRODUCT_DECISIONS.md
docs/product/PRD.md
design/decisions/simplified-v1-design-brief.md
design/references/simplified-v1-mockups/README.md
design/AGENTS.md
```

## Mandatory constraints

- Angular/Electron remains the production stack.
- Do not modify production files.
- No permanent sidebar.
- No global workflow strip.
- No Source Review, Generate, or Validation page.
- Permanent Editor tabs: Preview and Mappings only.
- Keep Highway as the dominant Editor visual.
- Use the final approved mockup PNGs as references without regenerating them.
- Preserve Foundations V1 unless a documented delta is necessary.
- Design 1440 × 900 and 1024 × 768.
- Use no color-only status.
- Use real progress steps without invented percentages.
- Do not add note timing, duration, creation, batch, or tempo controls.

## Required stages

### Stage A — Workspace and supersession

1. Verify active Pencil file and record on-disk hash.
2. Reopen prior sections.
3. Add an explicit supersession record for the old workflow IA.
4. Import/place the approved mockup references in a reference-only section.
5. Do not modify historical frames.

Stop and report if any historical content is missing or Pencil cannot resolve
the images.

### Stage B — IA and components

Define:

- minimal application header;
- creation header/step indicator;
- active project header;
- Preview/Mappings tabs;
- project card;
- source/audio/cover picker;
- derived folder preview;
- selected track row;
- compact mapping row;
- progress step;
- transport;
- offset control;
- waveform;
- Highway integration;
- note details/correction panel;
- mapping list;
- Project Details panel;
- autosave status;
- warning/callout;
- export confirmation/progress/result;
- overflow menu;
- empty/error states.

Document ownership and variants.

Approval checkpoint: IA, component inventory, and representative 1440
wireframes. Do not proceed without approval.

### Stage C — Main high-fidelity frames

Create the main frames listed in `design/README.md` at 1440 × 900.

Validate:

- exact dimensions;
- names;
- layout;
- focus order;
- one primary action;
- project identity;
- no duplicated status;
- Highway space;
- route/context ownership.

Approval checkpoint: full 1440 main flow.

### Stage D — State coverage and 1024

Create required error/advisory/empty/contextual states and structurally adapt the
main flow to 1024 × 768.

Approval checkpoint: 1024 and state system.

### Stage E — Handoff

Complete:

- screen inventory;
- state matrix;
- route/scenario map;
- component inventory;
- responsive rules;
- keyboard behavior;
- behavior/proposal classification;
- unresolved list;
- Pencil validation report;
- final hash.

Do not implement Angular or Electron.

## Reporting

At each checkpoint report:

- branch and commit state;
- files changed;
- Pencil sections and frame names;
- mockup references used;
- design decisions;
- product behavior assumptions avoided;
- 1440/1024 status;
- layout validation;
- OpenSpec task state;
- confirmation that no production files changed.
