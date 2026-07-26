# Implementation Prompt — Issue #76

Use this prompt only after #74 and #75 have been externally merged.

Implement **issue #76 only**: `Angular refactor 3/3: Source review, integrated mapping, generation, and preview`.

Read and transfer this OpenSpec into Engram first. Work only on `refactor/76-angular-workflow-features`, based on current `main`.

Preserve the foundation and feature boundaries from #74/#75. Do not modify Electron main/preload, packages, CLI, or domain contracts.

Keep Mapping integrated in Source Review. Replace browser-native prompts/confirms with accessible Angular dialogs. Extract workflow orchestration into services and stable visual sections into focused components. Split Generate at least into readiness, validation report, configuration, QA checklist, steps, log, output preview, and action bar. Preserve current workflow behavior. Delete legacy routes/components only when dead-code proof is complete; otherwise document them as follow-ups.

Run all required quality commands, create one ready-for-review PR with `Closes #76` and `Parent: #73`, and do not merge or review.
