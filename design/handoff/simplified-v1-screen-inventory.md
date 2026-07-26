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
