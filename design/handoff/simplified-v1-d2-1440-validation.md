# D2 Simplified V1 1440 Validation

The saved Pencil workspace contains the complete Phase A checkpoint and
reopens successfully. The `1024 × 768` adaptation is intentionally outside this
checkpoint.

## Status

- **1440 × 900 checkpoint complete.**
- **1024 × 768 final adaptation not started.**
- **Issue #98 remains incomplete.**
- **The PR must remain draft.**
- **Maintainer approval is required before Phase B.**

## Pencil persistence

| Evidence | Result |
|---|---|
| Active file | `design/chdg-ui.pen` in the issue #98 worktree |
| Initial SHA-256 | `c9a0ba34347134e503a276fb283b115545c4e874893dab6cfd4f621e463b7d8c` |
| Final SHA-256 | `7f5a77a22b0a76055c71edfdf59b485c5b6724ac3f369f9bdd03ea4b166d2a73` |
| Explicit save | Performed |
| Save/reopen | Succeeded |
| Historical top-level count | 27 before D2 |
| Final top-level count | 29 |
| Historical reusable count | 57 before D2 |
| Final reusable count | 63 |

## Structural validation

| Check | Result |
|---|---|
| Route/state frame count | 27 |
| Contextual frame count | 16 |
| Total D2 production frames | 43 |
| Production dimensions | Every D2 production frame read back as `1440 × 900` |
| D2 flow layout inspection | `problemsOnly`, depth 6: no layout problems |
| D2 component layout inspection | `problemsOnly`, depth 6: no layout problems |
| Historical D1 sections | `08`, `09`, and `10` remain present |
| Historical/reusable material | Preserved; no historical section removed |
| Permanent sidebar | None |
| Editor dominant region | Waveform and bounded copied/refined Highway derivation |
| Milestone 2 updated source | Not created as a route or screen |

### Evidence-metadata caveat

The Markdown checkpoint records use the normalized evidence taxonomy
(`OpenSpec-approved`, `Design proposal`, `Backend-dependent state`,
`Unresolved`, and `Mockup reference`).
The saved Pencil frames still retain legacy compound metadata strings such as
`product-approved + interaction proposal`. This is non-user-visible provenance
debt: it does not change the rendered flow, but the live frame metadata must be
normalized in a later safe Pencil pass rather than treated as authoritative.

## Visual inspection

All 43 production frames were exported individually for visual review. Focused
screenshots were additionally inspected for invalid/disabled actions, mapping
attention and override rows, creation progress/failures, save failure, Project
Details rename failure, invalid Accent/Ghost, export confirmation/conflict/
success, Save a Copy collision/failure, component reuse, and visible keyboard
focus. Navigation selection was confirmed for Projects, Settings, Preview, and
Mappings. Update lifecycle frames display `Update Song`.

Lifecycle review verifies that linked progress/failure variants are labeled as
non-concurrent. `nqc2V` presents finalization failure as the current state and
keeps write failure in a distinct linked card. `aBu3s` and `q3LHDn` similarly
separate their linked progress and failure evidence. Export success removes
managed `album.jpg` only for the represented cover-removal case.

## Accessibility observations

- Primary controls use approximately 42–44 px target heights.
- Essential actions keep text labels; rare icon actions remain recognizable
  and subordinate.
- Error, warning, progress, success, and selected states combine color with
  text or structural treatment.
- Contrast uses the approved `v1.*` semantic tokens.
- The Editor preserves a clear dominant content region and compact secondary
  diagnostics.
- A representative 3 px focus-visible ring using the approved focus token is
  shown on the valid Details frame.
- Proposed focus order is application navigation → task Back/Cancel → content
  → dominant action. Editor proceeds through header → transport →
  waveform/Highway → diagnostics → contextual invoker.
- Contextual surfaces should trap focus and restore it to their invoker on
  close.
- Focus order/restoration are **Design proposals**. Exact shortcuts and final
  compact behavior remain **Unresolved**.

## Approved mockup hashes

The ten approved PNG references were not modified.

| File | SHA-256 |
|---|---|
| `01-home-recent.png` | `16f114afb5c906c8f28deaef48972ce51d05fe43e47c2f79c8a0c1a028b2673d` |
| `02-create-project-details.png` | `5c14e14da7ce4218c253937e759ac9b26275e486ab1f1c7d32cb1a05df12b2e2` |
| `03-create-project-track-mapping.png` | `cd48791c80b836e239121226cfcbea4c32dd5d9fe066ea5c0de9c2351d634caa` |
| `04-creating-project-progress.png` | `c5b66635013bfa86297d49c43104ba4144a5dda733c77ce25d71632299d473b9` |
| `05-editor-preview.png` | `e8a1184a2be39afa214156ceed022c934effcdb2351df2b1c61129e90b3c1169` |
| `06-edit-note-dialog.png` | `cafd59f056257030a9d2bfe7f1f72a4c5060630943413843c017af2b5e375c56` |
| `07-editor-mappings.png` | `b5207cdd0cfb628882f43a6b5ea8c9ad62e2f0f607f6f74ed980883575e65066` |
| `08-project-details-panel.png` | `2bd4436d8e4e7ae044bed436dfab81bae5c7d8cf1bcafc862e4201898bc03cb8` |
| `09-export-success.png` | `e30a2f74b1189d3f1916f610a07091c6d373bfdeecf3e13b69b5141356a251a0` |
| `10-import-updated-source-milestone-2.png` | `cd5d80deffe49b2585c0195d0883f93ccb185c62a5d134ef4acdb20510f65fe5` |

## Repository gates

The exact requested commands first resolved to the Codex fallback pnpm
`11.9.0`. Its dependency preflight inserted an unrelated placeholder
`allowBuilds` block into `pnpm-workspace.yaml` and then stopped every command
with `ERR_PNPM_IGNORED_BUILDS` (exit `1`) before repository scripts ran. A
fresh-context incident audit verified that this was the only out-of-scope
mutation, and that generated block was restored from `HEAD`.

Replacement attempts used the repository-compatible pnpm `9.15.4` entry point
with Node `v24.14.0`. Every command reached its repository script, then the
execution environment denied the next child process with `spawn EPERM` (exit
`1`). The post-run worktree status was unchanged. These are infrastructure
blockers, not passing gate evidence and not verified repository failures.

| Gate | Result |
|---|---|
| `pnpm build` | Exit `1`: initial pnpm 11 preflight `ERR_PNPM_IGNORED_BUILDS`; pnpm 9 replacement reached `packages/audio build$ tsc -p tsconfig.json`, then `spawn EPERM` |
| `pnpm typecheck` | Exit `1`: initial pnpm 11 preflight `ERR_PNPM_IGNORED_BUILDS`; pnpm 9 replacement reached `packages/audio typecheck$ tsc -p tsconfig.json --noEmit`, then `spawn EPERM` |
| `pnpm lint` | Exit `1`: initial pnpm 11 preflight `ERR_PNPM_IGNORED_BUILDS`; pnpm 9 replacement reached `packages/core lint$ echo "lint not configured yet"`, then `spawn EPERM` |
| `pnpm test` | Exit `1`: initial pnpm 11 preflight `ERR_PNPM_IGNORED_BUILDS`; pnpm 9 replacement resolved `vitest run`, then `spawn EPERM` |

## Maintainer checkpoint

Review the 1440 flow and either approve Phase B or request focused D2 changes.
Do not mark the PR ready, merge, or begin `1024 × 768` adaptation before that
decision.
