# Existing Workspace Preservation Plan

**Status:** CURRENT inventory for Approval Checkpoint 1  
**Reviewed:** 2026-07-18

The existing `design/` workspace is coherent and remains the base structure. No broad reorganization is proposed.

## Preserve unchanged

- `design/AGENTS.md` — design-only safety and evidence discipline.
- `design/DESIGN.md` — current visual contract and open questions.
- `design/decisions/decision-log.md` — accepted historical decisions.
- `design/exports/README.md` — export policy.
- `design/prompts/01-verify-workspace.md` through `06-compare-with-screenshots.md` — useful baseline workflow records.
- `design/prompts/README.md` — prompt operating discipline.
- `design/references/repo-ui-map.md` — accurate implementation map.
- `design/references/screenshot-checklist.md` — broader follow-up checklist.
- `design/references/validation-checklist.md` — baseline validation reference.
- Pencil section `00 / Workspace Cover` — preserved without edits.

## Extend

- `design/chdg-ui.pen` — replaced only the two documented placeholder sections with validated CURRENT foundations and shell references.
- `design/current-ui/README.md` — extended to viewport-specific catalog and provenance.
- `design/decisions/current-ux-audit.md` — extended from hypotheses to prioritized screenshot/code evidence.
- `design/references/design-token-map.md` — clarify the CSS font-stack/Pencil font-family limitation.
- `design/README.md` — retain as the workspace index; update only when later approved phases add stable structures.
- `openspec/changes/chdg-design-v1/tasks.md` — track validated local transfer state.

## Superseded with rationale

- Flat screenshot naming in the original `current-ui/README.md` is superseded by `1440x900/` and `1024x768/` directories because the approved issue and OpenSpec require two desktop viewports.
- Placeholder content inside `01 / CHDG Foundations` and `02 / Current App Shell` is superseded by faithful CURRENT references; the top-level numeric convention remains.
- The Pencil `font.family` variable now stores `Inter` rather than the complete CSS fallback stack because Pencil accepts one renderable family. The CSS stack remains documented as implementation source of truth.

## Unclear and requiring maintainer input before IA work

- `design/AGENTS.md` and `design/prompts/07-explore-information-architecture.md` describe issue #89 as baseline-only and Prompt 07 as a later three-alternative exercise.
- Approved issue #89 and the current OpenSpec instead require exactly two alternatives within issue #89 after Checkpoint 1.
- This discrepancy does not affect the completed baseline, but the approved source hierarchy must be confirmed before continuing. Recommendation: treat issue #89 plus the OpenSpec as superseding the older baseline-only/three-alternative instructions, then revise those design instructions in the next approved phase.

## Pencil inventory

| Section | Classification | Contents |
|---|---|---|
| `00 / Workspace Cover` | Preserve unchanged | Scope guardrails and workspace introduction. |
| `01 / CURRENT / CHDG Foundations` | Extend | Current colors, type, spacing, radii, borders, elevation, density, statuses, and 15 reusable baseline components. |
| `02 / CURRENT / App Shell` | Extend | Faithful 1440 × 900 shell reference with sidebar, project actions, runtime status, routed content, and CURRENT metadata label. |

Reusable component naming uses `CURRENT / <family> / <variant>`. Proposed-state naming is deferred until explicit approval.

