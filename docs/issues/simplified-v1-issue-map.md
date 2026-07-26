# Simplified V1 Issue Map

Create issues in dependency order. Replace placeholders with actual issue numbers.

| ID | Wave | Proposed title | Depends on | Worktree |
|---|---:|---|---|---|
| B1 | 1 | backend: define the self-contained CHDG project V1 contract | Wave 0 approval | `backend/<ISSUE>-project-v1-contract` |
| D1 | 1 | design: define the Simplified V1 information architecture | Wave 0 approval | `design/<ISSUE>-simplified-v1-ia` |
| B2 | 2 | backend: import deterministic sources into a self-contained project | B1 | `backend/<ISSUE>-project-import` |
| B3 | 2 | backend: materialize effective drum notes and individual corrections | B1 | `backend/<ISSUE>-effective-chart` |
| B4 | 2 | desktop: add atomic project persistence, recovery, rename, and Save a Copy | B1 | `backend/<ISSUE>-project-persistence` |
| D2 | 2 | design: create the complete Simplified V1 Pencil flow | D1 approval | `design/<ISSUE>-simplified-v1-pencil` |
| B5 | 3 | backend: build project-backed Preview data and timing diagnostics | B3 | `backend/<ISSUE>-project-preview` |
| B6 | 3 | backend: export self-contained projects incrementally and safely | B1, B3 | `backend/<ISSUE>-project-export` |
| F1 | 3 | frontend: replace the sidebar shell with contextual navigation | D1, B1 route/catalog contracts | `frontend/<ISSUE>-shell-home` |
| F2 | 3 | frontend: build the two-step Create Project wizard | D2 screen approval, B2 contract, F1 | `frontend/<ISSUE>-create-project` |
| D3 | 3 | design: complete the Simplified V1 implementation handoff | D2 and stable B1–B3 contracts | `design/<ISSUE>-simplified-v1-handoff` |
| B7 | 4 | desktop: integrate Simplified V1 packages through typed IPC and progress | B2–B6 | `desktop/<ISSUE>-simplified-v1-ipc` |
| F3 | 4 | frontend: build the project-backed Editor and Preview shell | D2, F1, B5 contract | `frontend/<ISSUE>-editor-base` |
| F6 | 4 | frontend: add Project Details, autosave state, rename, and Save a Copy | F1/F3 extension points, B4/B7 | `frontend/<ISSUE>-project-details` |
| F4 | 5 | frontend: add individual note correction and Undo/Redo | F3, B3/B7 edit contract | `frontend/<ISSUE>-note-corrections` |
| F5 | 5 | frontend: add compact two-level project mappings | F3, B3/B7 mapping contract | `frontend/<ISSUE>-mappings` |
| F7 | 5 | frontend: add Export/Update progress, conflict, success, and failure | F3, B6/B7 | `frontend/<ISSUE>-export-ui` |
| I1 | 6 | integration: connect, validate, and finalize Simplified V1 | B1–B7, D1–D3, F1–F7 | `integration/<ISSUE>-simplified-v1` |
| M2-1 | M2 | lifecycle: replace a project audio asset safely | I1 | `lifecycle/<ISSUE>-replace-audio` |
| M2-2 | M2 | lifecycle: create a new project version from an updated source | I1 | `lifecycle/<ISSUE>-import-updated-source` |

## Milestones

- Milestone 1: B1–B7, D1–D3, F1–F7, I1.
- Milestone 2: M2-1, M2-2.

Do not recreate the deleted broad grid/add/move editor issues. V1 is change/delete only.