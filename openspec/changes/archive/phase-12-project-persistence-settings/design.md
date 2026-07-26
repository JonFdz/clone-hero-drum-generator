# Design: Phase 12 — Project Persistence + Settings

## Overview

Phase 12 turns the in-memory desktop generation workflow into a project-aware workflow.

The app remains local-only and offline.

Architecture:

```txt
Angular renderer
  -> DesktopBridgeService
  -> preload bridge
  -> Electron main IPC
  -> project/settings filesystem services
  -> @chdg/project for generation
```

Renderer must not directly access Node APIs.

## Project file

Initial `.chdg` format is JSON.

Recommended schema:

```ts
export type ChdgProjectFile = {
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
};
```

Use runtime validation when reading project files. Invalid data should not crash the app.

## Schema versioning

Add:

```txt
schemaVersion: 1
```

When reading unknown future versions, fail gracefully with `UNSUPPORTED_PROJECT_VERSION`.

## Path strategy

Store absolute paths in MVP:

```txt
sourcePath
audioPath
outputDir
projectFilePath
```

Do not copy source/audio assets by default.

On load:

```txt
check whether sourcePath exists
check whether audioPath exists
check whether outputDir exists
show warnings for missing paths
block generate until required paths are valid/reselected
```

## Recent projects

Store recent projects in local app data.

Suggested fields:

```ts
type RecentProject = {
  path: string;
  name: string;
  lastOpenedAt: string;
};
```

Keep a sensible limit, for example 10 or 20.

## Settings

Store desktop settings in app data.

Suggested file:

```txt
userData/settings.json
```

Suggested structure:

```ts
type DesktopSettings = {
  schemaVersion: 1;
  theme: "dark";
  accentColor?: string;
  projectLocation: string;
  defaultOutputFolder?: string;
  defaultCharter?: string;
  defaultOffsetMs?: number;
  ffmpegPath?: string;
};
```

Do not rely only on browser localStorage.

## Bridge methods

Add explicit bridge APIs only.

Suggested:

```ts
createProject(input)
saveProject(input)
saveProjectAs(input)
openProject()
readRecentProjects()
removeRecentProject(path)
readSettings()
writeSettings(settings)
testFfmpeg(input)
```

Avoid arbitrary filesystem read/write.

## Project state integration

Desktop state should include:

```txt
projectFilePath
projectName
dirty
outputStatus
missingPaths
recentProjects
settings
```

When state-changing fields change, mark dirty.

When generation inputs change after successful generation, mark:

```txt
outputStatus = needs-regenerate
```

Fields that should mark needs-regenerate:

```txt
sourcePath
audioPath
selectedTracks
metadata that affects song.ini
offsetMs
outputDir
```

## Create / Save / Save As / Open

Minimum UI:

```txt
Home/Projects: recent projects
New Project: create project/save project
Settings: project location/defaults
topbar or page actions: Save / Save As where practical
```

Do not overbuild a full project manager.

## Output folder

Default:

```txt
<project folder>/output
```

Do not recursively clear output folders.

Preserve Phase 11 overwrite behavior.

## FFmpeg settings

Add FFmpeg path field and diagnostic action.

Implementation can be minimal:

```txt
if ffmpegPath set, test it
else try ffmpeg from PATH if feasible
return version or unavailable message
```

Do not bundle FFmpeg in this phase.

## UX polish scope

Only fix UX blockers encountered while implementing project/settings.

Do not broad-redesign all screens.

Defer complete polish until before packaging.

## Testing strategy

Add tests for:

```txt
project file serialization
project file parsing/validation
unsupported schema version
recent projects add/remove/dedupe/limit
settings read/write/defaults
dirty state
needs-regenerate transitions
missing path detection
bridge missing fallback if relevant
FFmpeg diagnostic shape
```

## Scope guard

Do not implement:

```txt
bundle .chdg
file association
cloud sync
validation checklist
preview player
mapping overrides
packaging
full visual polish
```
