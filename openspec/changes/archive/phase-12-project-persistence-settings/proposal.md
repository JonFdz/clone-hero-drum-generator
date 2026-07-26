# Proposal: Phase 12 — Project Persistence + Settings

## Change ID

`phase-12-project-persistence-settings`

## Summary

Introduce `.chdg` project persistence, recent projects, and local desktop settings.

Phase 11 made the desktop app usable for one in-memory generation workflow. Phase 12 makes that workflow project-based enough to reopen and continue work later.

This phase adds:

```txt
.chdg JSON project files
save/load project
recent projects
settings persistence
default project/output locations
FFmpeg path setting/diagnostic
dirty/outdated state tracking
```

## Why this phase exists

The Desktop Generate MVP currently keeps generation state in memory. That is enough for first use, but not enough for iterative charting.

Users need to:

```txt
create a project
save selected source/audio/output/metadata/tracks/offset
close app
reopen project
adjust inputs
regenerate output
see when generated output is outdated
```

This phase adds that foundation before validation, preview, offset adjustment, and mapping overrides build on top of project state.

## Goals

1. Define `.chdg` JSON project schema.
2. Add project read/write services.
3. Save current desktop generation state into a `.chdg` project file.
4. Load `.chdg` project files into desktop state.
5. Add Create/Save/Save As/Open Project actions.
6. Add recent projects list.
7. Add settings persistence.
8. Add default project location.
9. Add default output folder behavior.
10. Add default charter and default offset settings.
11. Add FFmpeg path setting and diagnostic.
12. Track project dirty state.
13. Track output status:
    - not generated;
    - generated;
    - needs regenerate;
    - generation failed.
14. Preserve Phase 11 desktop generate flow.
15. Preserve Electron security boundaries.

## Non-goals

- No `.chdg` bundle format yet.
- No copying source/audio assets into the project folder by default.
- No relative path migration yet, unless trivial.
- No cloud sync.
- No file association/double-click opening.
- No validation checklist implementation.
- No audio/waveform preview.
- No Clone Hero highway preview.
- No offset adjustment preview.
- No mapping overrides UI.
- No mapping profiles.
- No packaging/distribution.
- No full desktop UX polish pass.
- No external editor/Moonscraper integration.

## UX polish note

Manual Phase 11 testing found some visual/layout issues such as mis-sized inputs.

Do not turn Phase 12 into a broad frontend redesign.

Allowed in Phase 12:

```txt
fix UX blockers that prevent use
fix inputs that hide required values
fix missing scroll that blocks access
fix path overflow that breaks layout
```

Defer broad polish to a later dedicated phase before packaging:

```txt
Desktop UX Polish Before Packaging
```

That future phase should cover inputs, spacing, responsive tables, path overflow, empty/loading/error states, modal polish, and cross-platform layout.

## Product constraints

Continue to respect:

```txt
local-first
100% offline
local files only
no uploads
no YouTube/URL imports
no scraping
no Moonscraper dependency
.chdg is a project file, not Clone Hero output
Clone Hero output = folder with notes.chart, song.ini, song.ogg
```

## Branch

```txt
feat/phase-12-project-persistence-settings
```

## Required docs to read

```txt
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/phases/12-project-persistence-settings/PRD.md
docs/phases/12-project-persistence-settings/ADR.md
docs/phases/12-project-persistence-settings/CHECKLIST.md
docs/phases/11-desktop-generate-mvp/PRD.md
docs/phases/10b-multi-track-normalization-generation/PRD.md
```

Visual references:

```txt
docs/desktop/mockups/01-home-dashboard.png
docs/desktop/mockups/02-projects-library.png
docs/desktop/mockups/03-new-project.png
docs/desktop/mockups/10-settings.png
```

If mockup text conflicts with `docs/desktop/mockup-corrections.md`, the docs are canonical.

## Project format

Initial `.chdg` should be JSON.

Suggested shape:

```ts
type ChdgProjectFile = {
  schemaVersion: 1;
  appVersion?: string;
  project: {
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  paths: {
    sourcePath?: string;
    audioPath?: string;
    outputDir?: string;
  };
  source?: {
    sourceKind?: "midi" | "gpif";
    inspectionSummary?: unknown;
  };
  selection: {
    selectedTracks: number[];
  };
  metadata: {
    name?: string;
    artist?: string;
    album?: string;
    year?: string;
    genre?: string;
    charter?: string;
  };
  generation: {
    offsetMs?: number;
    status: "not-generated" | "generated" | "needs-regenerate" | "failed";
    lastGeneratedAt?: string;
    outputFiles?: {
      chart?: string;
      songIni?: string;
      songOgg?: string;
    };
    lastResultSummary?: unknown;
  };
  settings?: {
    // project-level settings only if needed
  };
};
```

Exact fields can follow implementation needs, but keep it serializable and forward-compatible.

## Path strategy

MVP path strategy:

```txt
store absolute source/audio/output paths
do not copy assets by default
warn/show missing file state if paths no longer exist
```

Relative paths/bundle format can be planned later.

## Default locations

Default project location:

```txt
~/Documents/CHDG Projects/<project-name>/<project-name>.chdg
```

Default output folder can live inside the project folder:

```txt
~/Documents/CHDG Projects/<project-name>/output/
```

If user chooses custom output folder, preserve it.

## Settings

Persist local settings.

Suggested settings:

```ts
type DesktopSettings = {
  theme: "dark";
  accentColor?: string;
  projectLocation: string;
  defaultOutputFolder?: string;
  defaultCharter?: string;
  defaultOffsetMs?: number;
  ffmpegPath?: string;
};
```

Settings should be stored locally using Electron main, not browser localStorage as the only source of truth.

## FFmpeg setting/diagnostic

Add:

```txt
FFmpeg path field
Detect from PATH / use configured path
Test FFmpeg button
Diagnostic result
```

This phase does not need to bundle FFmpeg.

## Electron security

Preserve:

```txt
contextIsolation: true
nodeIntegration: false
sandbox: true
explicit preload bridge
no direct Node APIs in Angular renderer
```

Add only explicit project/settings bridge methods.

## Suggested bridge capabilities

```ts
createProject(input): Promise<JsonEnvelope<ProjectState>>
saveProject(input): Promise<JsonEnvelope<SaveProjectResult>>
saveProjectAs(input): Promise<JsonEnvelope<SaveProjectResult>>
openProject(): Promise<JsonEnvelope<ProjectState | null>>
readRecentProjects(): Promise<JsonEnvelope<RecentProject[]>>
removeRecentProject(path): Promise<JsonEnvelope<void>>
readSettings(): Promise<JsonEnvelope<DesktopSettings>>
writeSettings(settings): Promise<JsonEnvelope<DesktopSettings>>
testFfmpeg(input): Promise<JsonEnvelope<FfmpegDiagnostic>>
```

Exact names can follow project style.

## Validation

Required:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

Manual desktop validation:

```txt
create new project
save .chdg
close/reopen app
open .chdg
state restored
recent project appears
settings persist after restart
FFmpeg diagnostic works
generate still works after loading project
changing source/audio/tracks/metadata marks project dirty/needs regenerate
```

If desktop cannot be launched in the agent environment, state that clearly and provide build/typecheck/test evidence.

## Review policy

The implementation agent should do focused self-checks only.

Final PR review is external and will be performed by Jon/ChatGPT.

The agent must not merge.
