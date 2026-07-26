# Change Proposal: CHDG Simplified V1

## Status

Proposed for maintainer approval before implementation.

## Why

CHDG currently exposes its technical conversion pipeline as application
navigation. Users must configure Project Details, navigate Source Review, run
Generate, and then open Preview. The project also retains permanent external
source/audio dependencies and Preview consumes exported files.

The maintainer has clarified a simpler product:

```text
Home → Create Project → Editor → Export
```

Users provide GP/MIDI and audio once. After successful import, the complete CHDG
project folder becomes the source of truth. Users correct isolated conversion
exceptions in a focused Editor and export/update the Clone Hero song from that
same context.

## User value

- fewer screens and fewer technical concepts;
- no broken project because an original import file moved;
- Preview immediately after creation, before first export;
- mappings are normally accepted and remain compact;
- isolated note correction without turning CHDG into Guitar Pro or Moonscraper;
- safe autosave and export;
- substantially more space for waveform and Highway.

## Scope

### Product

- replace visible pipeline with Home, two-step Create Project, Editor, and
  contextual Export;
- remove permanent sidebar;
- only Preview and Mappings remain permanent Editor tabs;
- Project Details and note editing are contextual;
- first-class autosave;
- self-contained project folder;
- source/audio import-only lifecycle;
- limited note corrections;
- export/update from project-owned data.

### Backend/domain

- redefine direct schema V1; provisional files are unsupported;
- persist imported `DrumHit[]`, full timing, mappings, corrections, assets, and
  export manifest;
- split import from export;
- produce Preview from project data;
- atomic save, recovery, Save a Copy;
- incremental atomic export;
- real progress events.

### Design

- supersede prior workflow IA while preserving historical Pencil content and
  reusable Foundations/Highway work;
- create final 1440 × 900 and 1024 × 768 screens from approved mockup references.

### Frontend

- no-sidebar shell;
- simplified routes;
- wizard;
- project-backed Editor;
- note correction, mappings, details/autosave, export;
- deterministic browser harness.

## Non-goals

- audio-to-chart inference;
- adding or moving notes;
- editing tick or duration;
- full chart grid;
- batch operations;
- tempo/time-signature/section editing;
- Expert+ / special double-kick authoring;
- multiple difficulties;
- output marker file;
- migration of provisional `.chdg`;
- Replace Audio in Milestone 1;
- Import Updated Source in Milestone 1;
- mobile UI;
- cloud processing.

## Key approved decisions

1. Complete project folder is portable unit.
2. Internal filename is always `project.chdg`.
3. Artist, Song Name, and Project Name are mandatory.
4. Derived display/folder name is `Artist - Song Name - Project Name`.
5. Imported `DrumHit[]` is the persisted musical base.
6. Musical interpretation and Clone Hero target are separate.
7. Individual corrections override project mapping.
8. GP/MIDI and original audio are not monitored after import.
9. Full source tempo map is preserved; no tempo editor.
10. All V1 drum notes have zero exported length.
11. Autosave + one previous valid file + session Undo/Redo; no history UI.
12. Export identity/fingerprints live only in `project.chdg`.
13. Real backend step events; no fabricated percentages.
14. Replace Audio and Import Updated Source are Milestone 2.

## Impacted repository areas

```text
AGENTS.md
docs/product/
docs/architecture/
docs/decisions/
docs/roadmaps/
docs/issues/
docs/prompts/
docs/validation/
design/
openspec/
packages/core/
packages/project/
packages/chart/
packages/audio/
packages/validation/
apps/desktop/electron/
apps/desktop/src/
apps/desktop/src/browser-harness/
```

Wave 0 changes only documentation, design references, and OpenSpec.

## Risks

- new schema and internal model are broad cross-cutting changes;
- stable hit identity must remain deterministic;
- mapping/correction precedence can silently lose user intent if incorrect;
- export without an output marker has ambiguity after external changes;
- folder renames need transactional rollback;
- Electron bridge files are conflict hotspots;
- frontend can drift if implemented before contracts stabilize;
- large charts require indexed/canvas rendering.

## Mitigations

- B1 contract first;
- pure tested effective-chart functions;
- explicit export manifest and confirmation rules;
- one owner for Electron IPC;
- issue-owned file boundaries and worktrees;
- browser fixtures before IPC integration;
- synthetic multi-tempo regression;
- single final integration owner.

## Delivery strategy

See `design.md`, the master roadmap, and the worktree plan. The work is divided
into reviewable issues and waves with explicit dependency gates.

## Approval checkpoints

1. Wave 0 product/OpenSpec package.
2. B1 domain/project contract.
3. D1 IA.
4. D2 1440 main flow.
5. D2 1024 and state system.
6. B2/B3/B4 foundational backends.
7. B5/B6 consumer contracts.
8. B7 IPC.
9. frontend feature PRs.
10. final integration and release-candidate validation.
