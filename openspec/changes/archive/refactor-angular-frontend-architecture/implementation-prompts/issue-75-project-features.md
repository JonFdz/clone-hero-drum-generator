# Implementation Prompt — Issue #75

Use this prompt only after #74 has been externally merged.

Implement **issue #75 only**: `Angular refactor 2/3: Projects, project details, home, settings, and shared UI`.

Read and transfer this OpenSpec into Engram first. Work only on `refactor/75-angular-project-features`, based on current `main`.

Preserve the architectural foundation from #74. Do not modify Electron main/preload, packages, CLI, or domain contracts.

Migrate Projects, Project Details, Home, and Settings to feature-owned external component files with OnPush. Use the centralized project persistence/session boundary; do not reintroduce duplicate open/hydrate flows. Keep settings and FFmpeg diagnostics outside the active project session. Create shared UI only with genuine reuse or infrastructure need.

Run all required quality commands, create one ready-for-review PR with `Closes #75` and `Parent: #73`, and do not merge or review.
