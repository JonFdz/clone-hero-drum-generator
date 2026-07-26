# Simplified V1 D1 validation

Issue #94 reaches the blocking IA checkpoint. It does not authorize D2 or
production implementation.

## Pencil checkpoint

| Check | Result |
|---|---|
| Active file | repository worktree `design/chdg-ui.pen` |
| Initial SHA-256 | `dade8c1d482459f0071cedf50303795f277510cb796c34a95a1406cdb771a604` |
| First explicit persisted SHA-256 | `3db84aac08585f1026d2fe2a74fd7c5836568ff04fd9a59d703347859d2ecf90` |
| Pre-review persisted SHA-256 | `b27a9d1a9a1d5ebc6a98f7d37dc7fe2ab3b781a2b36b306500cc39766a2f0bc8` |
| Post-review final SHA-256 | `65d4bc0da81be4bc53f99deea49ab84f40d8ea1c149a6316a339f0086eb4c846` |
| Top-level count | 27: original 24 + new 3 |
| Reusable component count | 57: original 50 + new 7 |
| New IA section | `08 / SIMPLIFIED V1 / IA` (`qlILE`) |
| New component section | `09 / SIMPLIFIED V1 / STRUCTURAL COMPONENTS` (`QJDNH`) |
| New route/state section | `10 / SIMPLIFIED V1 / ROUTE AND STATE MAP` (`WIPI3`) |
| Required structural items | 22 of 22 represented and named |
| Connected component references | 7 D1 skeleton instances inspected |
| Mockups | all ten retained unmodified |
| Standalone PNG export | not performed; optional and non-blocking |

## Structural validation

- Every new root frame used `placeholder: true` during construction and was
  finalized with `placeholder: false`.
- `FindEmptySpace` placed all three new root sections below existing material.
- Frame names and component references were inspected through Pencil MCP.
- After the second explicit save, all three new section screenshots rendered
  clearly and were visually inspected.
- Section-level `problemsOnly` layout validation is clean for all three new
  sections.
- Deep validation of section 10 is clean after expanding the seven connected
  component instances to their native height and enlarging the reference shelf.
- All 22 required frame names and the seven connected component references were
  inspected directly through Pencil MCP.
- Responsive evidence now includes a true 1440 × 900 Editor Preview frame and a
  materially adapted 1024 × 768 Editor frame. Remaining states stay at
  checkpoint-card fidelity; D1 does not claim every screen at both sizes.

## Acceptance coverage

- [x] No permanent sidebar or disguised project rail.
- [x] Home, Projects, and Settings are application destinations.
- [x] Preview and Mappings are the only permanent project tabs.
- [x] Project Details, Edit Note, Export, and Save a Copy are contextual.
- [x] Two-step creation and actionable progress/failure are represented.
- [x] Editor reserves dominant space for waveform and Highway.
- [x] Note editing respects the approved V1 boundary.
- [x] Mappings preserve source, piece, and target semantics and precedence.
- [x] Export preserves unmanaged files and atomic managed updates.
- [x] 1440 and 1024 structural strategies are recorded.
- [x] All required structural components are classified.
- [x] Earlier Design V1 and handoff history remain intact.

## D1 limitations

- The Pencil work is intentionally structural, not final high fidelity.
- Lifecycle status/results around contracted backend step IDs, track
  recommendation signals, duration tolerances, autosave/retry behavior, and
  filesystem error detail remain dependencies.
- Exact 1024 contextual-surface mode and final keyboard/focus behavior require
  D2 validation.

## Approval gate

Maintainer IA approval is required before issue #98 begins.
