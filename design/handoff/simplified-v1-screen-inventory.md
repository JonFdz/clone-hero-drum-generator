# Simplified V1 Screen and Context Inventory

This is a planning inventory. D3 must replace reference-level entries with final
Pencil frame names and component links.

## Route screens

| ID | Canonical route | Screen | Required core states |
|---|---|---|---|
| H1 | `/home` | Home | recent projects, empty, open failure, recovery available |
| P1 | `/projects` | Projects | populated, empty, search/no result, unavailable project |
| C1 | `/projects/new/details` | Create Project — Details | empty, valid, invalid file, collision |
| C2 | `/projects/new/mapping` | Create Project — Track & Mapping | recommended track, multiple candidates, manual track, unknown mappings |
| C3 | `/projects/new/creating` | Creating Project | running, source failure, audio failure, write failure |
| E1 | `/projects/:projectId/editor/preview` | Editor — Preview | ready, note selected, warning, no internal audio, save failed |
| E2 | `/projects/:projectId/editor/mappings` | Editor — Mappings | defaults, changed, unknown, reset confirmation |
| S1 | `/settings` | Settings | normal, invalid path, FFmpeg unavailable |

## Contextual surfaces

| ID | Parent | Surface | Required states |
|---|---|---|---|
| X1 | Editor | Project Details | view/edit, identity collision, rename progress/failure |
| X2 | Editor Preview | Edit Note | unchanged, corrected, deleted/restorable, invalid flag combination |
| X3 | Editor | Export confirmation | first export, update, ambiguous target, external modification |
| X4 | Editor | Export progress | running, failed |
| X5 | Editor | Export result | success with updated/unchanged files |
| X6 | Editor | Save a Copy | identity, target collision, progress/failure |
| X7 | Editor | Overflow menu | open project folder, open export folder, Save a Copy |
| M2-1 | Editor | Replace Project Audio | deferred |
| M2-2 | Editor | Import Updated Source | deferred |

## Browser harness minimum scenarios

```text
/home?scenario=empty&harnessUi=hidden
/home?scenario=home-recent&harnessUi=hidden
/projects/new/details?scenario=create-details-empty&harnessUi=hidden
/projects/new/details?scenario=create-details-filled&harnessUi=hidden
/projects/new/mapping?scenario=create-mapping-default&harnessUi=hidden
/projects/new/mapping?scenario=create-mapping-attention&harnessUi=hidden
/projects/new/creating?scenario=create-progress&harnessUi=hidden
/projects/new/creating?scenario=create-failed-source&harnessUi=hidden
/projects/demo/editor/preview?scenario=editor-ready&harnessUi=hidden
/projects/demo/editor/preview?scenario=editor-note-selected&harnessUi=hidden
/projects/demo/editor/preview?scenario=editor-duration-warning&harnessUi=hidden
/projects/demo/editor/preview?scenario=editor-save-failed&harnessUi=hidden
/projects/demo/editor/mappings?scenario=mappings-default&harnessUi=hidden
/projects/demo/editor/mappings?scenario=mappings-modified&harnessUi=hidden
/projects/demo/editor/preview?scenario=export-progress&harnessUi=hidden
/projects/demo/editor/preview?scenario=export-success&harnessUi=hidden
/projects/demo/editor/preview?scenario=export-failed&harnessUi=hidden
```

Scenario names are contracts for fixture planning. Implementation may introduce
typed scenario builders but must not silently rename the public query values
without updating OpenSpec and this inventory.

## D2 Phase A realization

The planning entries above are realized at `1440 × 900` in
`11 / SIMPLIFIED V1 / D2 / 1440 FLOW` (`dPSDd`).

| Planning ID | D2 frames |
|---|---|
| H1 | `Nkbx7`, `H7jwM` |
| P1 | `pfAoW`, `Ag1BG`, `RlLTH` |
| S1 | `HG6qw`, `DNQBe` |
| C1 | `bGYAe`, `dkxQL`, `c1Ce08` |
| C2 | `SIeWF`, `nOz1i`, `MGHSv`, `be9aO` |
| C3 | `xRanW`, `xztYr`, `d2hS1p`, `nqc2V` |
| E1 | `Tr58P`, `Z8wVb`, `c5RIW`, `oQsuh`, `mNiYd` |
| E2 | `g7Aea`, `oTfZU`, `C9itDx`, `OcLvH` |
| X1 | `OfDEn`, `tSPfb`, `aBu3s` |
| X2 | `WwIRH`, `AKsIx`, `pGCpE`, `YpPDv` |
| X3–X5 | `x2crFY`, `Ne3Cz`, `z7dh9`, `R04bl`, `Bh4Dg`, `iiKS3` |
| X6 | `opxt4`, `q3LHDn` |
| X7 | `tpYNy` |

See `simplified-v1-d2-1440-frame-inventory.md` for exact frame names and
`simplified-v1-d2-1440-route-state-map.md` for route and ownership evidence.

The Milestone 2 entries remain deferred. The `1024 × 768` final adaptation has
not started, issue #98 remains incomplete, and maintainer approval is required
before Phase B.
