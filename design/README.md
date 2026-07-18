# CHDG Design Workspace

> **Current authority (2026-07-18):** Revised issue #89 and the
> `chdg-design-v1` OpenSpec supersede older statements in this workspace that
> stop issue #89 after baseline work or require three IA alternatives. The
> approved continuation contains exactly two explorations—Workflow-first and
> Project workspace. Approval Checkpoint 2 selected the bounded hybrid
> responsibility model. Approval Checkpoint 3 approved Foundations V1, the
> reusable component system, and the high-fidelity 1440 flow. The final package
> now includes the complete 1024 desktop adaptation and implementation handoff.

This directory is the version-controlled design workspace for the Clone Hero Drum Generator desktop application.

It was introduced by issue **#89 — `design: bootstrap Pencil workspace and audit current desktop UI`**.

## Purpose

The workspace now preserves four clearly separated layers:

1. CURRENT browser evidence, foundations, and shell.
2. EXPLORATION material for the two approved IA alternatives.
3. SELECTED Foundations V1 and reusable components approved at Checkpoint 3.
4. The approved high-fidelity 1440 × 900 workflow and final 1024 × 768 desktop
   adaptations.

Issue #89 remains design-only and must not modify production UI code or
application behavior.

## Directory structure

```text
design/
├── AGENTS.md
├── DESIGN.md
├── README.md
├── chdg-ui.pen
├── current-ui/
│   └── README.md
├── decisions/
│   ├── current-ux-audit.md
│   ├── foundations-v1.md
│   ├── component-system-v1.md
│   ├── design-v1-1024.md
│   ├── design-v1-1440.md
│   ├── design-v1-rationale.md
│   ├── information-architecture-v1.md
│   ├── workspace-preservation-plan.md
│   └── decision-log.md
├── exports/
│   └── README.md
├── handoff/
│   ├── README.md
│   ├── component-inventory.md
│   ├── follow-up-issues.md
│   ├── implementation-sequence.md
│   ├── screen-scenario-map.md
│   ├── state-matrix.md
│   └── validation-report.md
├── prompts/
│   ├── README.md
│   ├── 01-verify-workspace.md
│   ├── 02-sync-design-tokens.md
│   ├── 03-build-foundations.md
│   ├── 04-recreate-current-app-shell.md
│   ├── 05-audit-current-ux.md
│   ├── 06-compare-with-screenshots.md
│   └── 07-explore-information-architecture.md
└── references/
    ├── design-token-map.md
    ├── repo-ui-map.md
    ├── screenshot-checklist.md
    └── validation-checklist.md
```

## First session

1. Check out the issue branch:

   ```bash
   git fetch origin
   git switch design/89-pencil-bootstrap
   ```

2. Copy this `design/` directory into the repository root.

3. Open the repository root in VS Code.

4. Open `design/chdg-ui.pen` and wait for Pencil to activate.

5. Save the file once with `Ctrl+S`.

6. Run the prompts in numeric order, starting with:

   ```text
   design/prompts/01-verify-workspace.md
   ```

7. Prompt 07 may run only after Approval Checkpoint 1 under the supersession note above.

## Source of truth

- The Angular/Electron application remains the source of truth for current behavior.
- `chdg-ui.pen` is the source of truth for approved visual design work.
- `DESIGN.md` is the human-readable design contract.
- Screenshots under `current-ui/` are evidence, not editable source files.
- Files under `exports/` are generated previews and must not be treated as design source.

## Selected V1 sections and frames

- `06 / SELECTED / CHDG Foundations V1`
- `07 / SELECTED / Reusable Components V1`
- `V1 / Home / Empty / 1440`
- `V1 / Project Details / Loaded / 1440`
- `V1 / Source Review / Ready / 1440`
- `V1 / Source Review / Attention / 1440`
- `V1 / Generate / Ready / 1440`
- `V1 / Generate / Running / 1440`
- `V1 / Generate / Failed / 1440`
- `V1 / Preview / Ready / 1440`
- `V1 / Home / Empty / 1024`
- `V1 / Project Details / Loaded / 1024`
- `V1 / Source Review / Ready / 1024`
- `V1 / Source Review / Attention / 1024`
- `V1 / Generate / Ready / 1024`
- `V1 / Generate / Running / 1024`
- `V1 / Generate / Failed / 1024`
- `V1 / Preview / Ready / 1024`

These V1 frames and the semantic system were approved at Approval Checkpoint 3.
The 1024 frames structurally adapt that approved flow without changing its
information architecture. The CURRENT sections remain the fidelity reference
for existing behavior.

## Status ownership

- Project identity, readiness, and save state: project context header.
- Workflow state: workflow-step variants.
- Page validation: page status summary and validation messages.
- Unknown mapping attention: affected Source Review task and advisory callout.
- Generation failure: Generate recovery panel and failed workflow step.

Approved deviation: no generic standalone status-pill component. Owner-specific
components satisfy the requirement without duplicating status.

## Implementation handoff

Implementation agents should begin with `design/handoff/README.md`, then review
the state matrix, screen/scenario map, component inventory, and implementation
sequence. They must verify current behavior through the browser harness rather
than treating V1 proposals as implemented behavior.

The unresolved behavior list remains: Retry scope, downstream invalidation,
Open output safety during generation, exact save-state transitions, and the
primary audio-backed Preview experience.

## Working rules

- All repository content is English-first.
- Save `.pen` files frequently; Pencil does not currently guarantee automatic saving.
- Commit design changes in small, reviewable increments.
- Keep code-based findings distinct from visually confirmed findings.
- Do not edit the `.pen` JSON manually unless Pencil cannot open the file and a format repair is required.
- Do not generate React, Next.js, Tailwind, or shadcn output for this application.
- Do not implement design changes in `apps/` or `packages/` during issue #89.

## Recommended first commit

After Pencil opens the file and the initial workspace is verified:

```bash
git add design/
git commit -m "design: bootstrap Pencil workspace"
```
