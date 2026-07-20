# Design Decision Log

Record design decisions here once they are explicitly approved.

Do not use this file for unvalidated ideas. Keep alternatives and hypotheses in the relevant audit or exploration document.

| ID | Date | Status | Decision | Rationale | Consequences |
|---|---|---|---|---|---|
| D-001 | 2026-07-16 | Accepted | Keep Pencil design files inside the repository under `design/`. | Design and code can be versioned and reviewed together. | Contributors must save and commit `.pen` changes intentionally. |
| D-002 | 2026-07-16 | Accepted | Treat issue #89 as a baseline-only phase. | Redesign decisions require an accurate representation of the current application. | No production UI changes are allowed in this issue. |
| D-003 | 2026-07-16 | Accepted | Keep all repository design artifacts English-first. | This matches the repository-wide language policy. | Prompts, notes, labels, filenames, and design copy must be English. |
| D-004 | 2026-07-18 | Accepted | Select the bounded hybrid IA for CHDG Design V1. | Workflow-first provides the strongest orientation while compact project context and page-local navigation support revisitation without full workspace density. | Global navigation is application-only; the project header owns identity/save state; the workflow strip owns progression; Source Review uses local task navigation. This supersedes D-002's baseline-only stopping point while preserving its design-only safety boundary. |
| D-005 | 2026-07-18 | Accepted | Approve Foundations V1, the reusable component system, and the complete 1440 × 900 flow without a generic standalone status pill. | Owner-specific status components preserve explicit responsibility and avoid duplicated or context-free readiness labels. | The project header, workflow steps, page summaries, advisory callouts, and Generate recovery panel satisfy the status requirement; 1024 adaptations must preserve these semantics. |
| D-006 | 2026-07-18 | Accepted | Adapt the approved V1 flow to 1024 × 768 through structural compaction rather than uniform shrinking. | A compact rail, single dominant content region, local horizontal task navigation, stacked generation states, and disclosed diagnostics preserve orientation and working space. | All eight 1024 frames retain route/state identity and semantic ownership without adding a second project sidebar or changing product behavior. |
