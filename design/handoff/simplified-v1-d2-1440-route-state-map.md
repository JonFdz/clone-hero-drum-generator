# D2 Simplified V1 1440 Route and State Map

The 1440 checkpoint implements the approved small route set and keeps
project-level tasks contextual. No Source Review, Normalize, Generate, or
Validate destination was reintroduced.

## Route coverage

| Canonical route | Covered frames |
|---|---|
| `/home` | `Nkbx7` recent projects; `H7jwM` empty |
| `/projects` | `pfAoW` populated; `Ag1BG` empty/no results; `RlLTH` unavailable recovery |
| `/settings` | `HG6qw` ready; `DNQBe` invalid path/dependency unavailable |
| `/projects/new/details` | `bGYAe` empty; `dkxQL` valid; `c1Ce08` validation/collision |
| `/projects/new/mapping` | `SIeWF` default; `nOz1i` unknown; `MGHSv` candidates; `be9aO` manual selection |
| `/projects/new/creating` | `xRanW` running; `xztYr` source failure; `d2hS1p` audio failure; `nqc2V` current finalization failure plus a labeled linked write-failure variant |
| `/projects/:projectId/editor/preview` | `Tr58P` ready; `Z8wVb` selected; `c5RIW` duration warning; `oQsuh` audio unavailable; `mNiYd` save failed |
| `/projects/:projectId/editor/mappings` | `g7Aea` defaults; `oTfZU` overrides; `C9itDx` attention; `OcLvH` reset confirmation |

## Contextual coverage

| Owner | Surface | Covered frames |
|---|---|---|
| Editor | Project Details | `OfDEn`, `tSPfb`, `aBu3s` with linked active-progress and failure variants |
| Editor Preview | Edit Note | `WwIRH`, `AKsIx`, `pGCpE`, `YpPDv` |
| Editor | Export / Update Song | `x2crFY`, `Ne3Cz`, `z7dh9`, `R04bl`, `Bh4Dg`, `iiKS3` |
| Editor | Save a Copy | `opxt4`; `q3LHDn` with linked progress and operation-failure variants |
| Active-project header | Overflow menu | `tpYNy` |

## Navigation ownership

- Application header: CHDG, Home, Projects, and Settings.
- Creation: two task steps only—Project Details and Track & Mapping.
- Active-project header: compact identity, save state, Preview/Mappings,
  Undo/Redo, Export/Update Song, Project Details, and rare overflow actions.
- Contextual tasks do not create a second navigation hierarchy.
- There is no permanent sidebar.

## OpenSpec-approved behavior represented

- Identity requires Artist, Song Name, and Project Name.
- The derived folder name is `Artist - Song Name - Project Name`.
- Mapping communicates source identity → musical piece → Clone Hero target.
- Individual note corrections take precedence over project mapping overrides.
- Edit Note excludes timing, tick, duration, move, add, batch, tempo, and
  Expert+ controls.
- Accent and ghost cannot both be effective.
- Export updates only CHDG-managed files, preserves unmanaged files, and does
  not imply partial success after a failed atomic update.
- Export success uses `album.jpg` as the managed removal example only when the
  project cover was removed and managed ownership was proven.

## Backend-dependent states

Creation frames use the approved identifiers:

```text
validate-inputs
read-source
extract-drum-track
materialize-project-chart
archive-source
convert-audio
prepare-cover
write-project
finalize-project
```

Export uses:

```text
validate-project
materialize-effective-chart
prepare-chart
prepare-metadata
prepare-audio
prepare-cover
stage-output
commit-output
record-export-state
```

Save a Copy uses:

```text
validate-copy-target
copy-project-assets
rewrite-copy-identity
write-copy-project
finalize-copy
```

The visual states are pending, current, completed, and failed. No percentage is
shown. Filesystem evidence, dependency diagnostics, retry detail, tolerance,
and exact error messages remain backend-dependent.

Linked state variants are explicitly labeled as non-concurrent review evidence.
They do not imply that progress and failure are active simultaneously.

## Design proposals

- Projects search/no-result density and missing-project recovery placement.
- Save a Copy placement in the rare-action overflow.
- Collision, retry, and duration-warning wording.
- Compact diagnostics and technical-disclosure density.
- Right-side contextual surfaces at 1440.

These proposals are reviewable D2 treatments, not new backend or route
contracts.

## Unresolved before Phase B

- Exact keyboard shortcuts.
- Compact truncation and density at `1024 × 768`.
- Exact contextual-surface mode at `1024 × 768`.
- Final backend-provided collision, retry, dependency, and duration copy.
- Whether any proposed Projects filtering requires additional product
  confirmation before implementation.

## Evidence taxonomy

Every D2 frame is classified using only these labels:

- **OpenSpec-approved**
- **Design proposal**
- **Backend-dependent state**
- **Unresolved**
- **Mockup reference**

Combined labels indicate that a frame visualizes an approved requirement while
proposing presentation or depending on runtime evidence. They do not promote a
proposal to product behavior.

## Keyboard focus proposal

The 1440 recommendation is:

1. Application header navigation.
2. Task-level Back or Cancel.
3. Primary content in reading order.
4. The single dominant action.

In Editor, focus proceeds through the active-project header, transport,
waveform/Highway, compact diagnostics, and the contextual-surface invoker.
Contextual surfaces trap focus while open and restore it to the invoking
control on close. The visible ring in `dkxQL` demonstrates the proposed focus
treatment. This is a **Design proposal**; exact shortcuts remain **Unresolved**.
