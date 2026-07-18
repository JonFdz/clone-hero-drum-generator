# Design Decision Log

Record design decisions here once they are explicitly approved.

Do not use this file for unvalidated ideas. Keep alternatives and hypotheses in the relevant audit or exploration document.

| ID | Date | Status | Decision | Rationale | Consequences |
|---|---|---|---|---|---|
| D-001 | 2026-07-16 | Accepted | Keep Pencil design files inside the repository under `design/`. | Design and code can be versioned and reviewed together. | Contributors must save and commit `.pen` changes intentionally. |
| D-002 | 2026-07-16 | Accepted | Treat issue #89 as a baseline-only phase. | Redesign decisions require an accurate representation of the current application. | No production UI changes are allowed in this issue. |
| D-003 | 2026-07-16 | Accepted | Keep all repository design artifacts English-first. | This matches the repository-wide language policy. | Prompts, notes, labels, filenames, and design copy must be English. |
