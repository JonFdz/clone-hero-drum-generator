# Design: Phase 10A — Structured Project Services + CLI --json

## Overview

Phase 10A introduces a shared orchestration boundary.

Current state:

```txt
CLI commands orchestrate package-level functions directly.
Desktop shell exists but has only placeholders.
```

Target after Phase 10A:

```txt
packages/project
  exposes structured services and DTOs

apps/cli
  consumes packages/project
  prints human output or JSON

future apps/desktop
  consumes packages/project through Electron bridge
```

## Package structure

Recommended package:

```txt
packages/project/
  package.json
  src/
    index.ts
    types.ts
    inspectSource.ts
    normalizeSelection.ts
    generatePackage.ts
    issues.ts
```

Exact names can follow repo conventions.

Do not import Electron or Angular from `packages/project`.

`packages/project` should be pure TypeScript/Node-compatible orchestration.

## DTO design

Suggested type groups:

```ts
type SourceKind = "midi" | "gpif";

type ProjectIssue = {
  severity: "info" | "warning" | "error";
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

type SourceInspectionResult = {
  sourceKind: SourceKind;
  sourcePath: string;
  resolution?: number;
  tempos: unknown[];
  timeSignatures: unknown[];
  sections: unknown[];
  tracks: TrackCandidate[];
  issues: ProjectIssue[];
};

type TrackCandidate = {
  index: number;
  name?: string;
  channel?: number;
  noteCount: number;
  strength?: "strong" | "weak" | "unknown";
  role?: "drums" | "unknown";
};

type NormalizationPreview = {
  sourceKind: SourceKind;
  sourcePath: string;
  selectedTrack: number;
  hitCount: number;
  pieceSummary: Record<string, number>;
  firstHits: unknown[];
  issues: ProjectIssue[];
};

type GeneratePackageResult = {
  sourceKind: SourceKind;
  sourcePath: string;
  selectedTrack: number;
  outputDir: string;
  files: {
    chart?: string;
    songIni?: string;
    songOgg?: string;
  };
  issues: ProjectIssue[];
};
```

Use existing project types where available instead of creating duplicates. Keep DTOs serializable.

## JSON output rules

CLI `--json` mode must be machine-readable.

Rules:

```txt
stdout = JSON only
no headings
no ASCII tables
no progress text in stdout
warnings go inside JSON issues[] or stderr
errors should preferably produce JSON error shape when --json is active
```

Suggested JSON error shape:

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_TRACK",
    "message": "Track 99 was not found"
  },
  "issues": []
}
```

Successful output can be:

```json
{
  "ok": true,
  "data": { ... },
  "issues": []
}
```

or direct DTO output if the repo style prefers it. Prefer a consistent envelope if possible.

## CLI integration

Commands to update/adapt:

```txt
inspect / inspect-midi equivalent
inspect-gp
normalize-drums
normalize-gp-drums
generate
```

The repo may use different command names. Preserve existing names.

Add parser support for:

```txt
--json
```

to each relevant command.

Human output should continue to use existing formatting.

## Desktop relation

Do not wire the desktop UI to these services yet unless a trivial health reference is needed.

This phase prepares Phase 11.

## Future blockers from Phase 10

### Electron routing

Keep in mind that future file association/deep-link work may need hash routing or another Electron-safe strategy. Do not solve in Phase 10A unless necessary.

### Desktop dev workflow

Desktop hot reload/dev-server workflow may become useful soon, but is not required for this phase.

## Testing strategy

Add tests for:

```txt
project service DTOs
CLI --json parseability
human output unchanged enough
warnings in JSON
error JSON where feasible
MIDI inspect/normalize JSON
GPIF inspect/normalize JSON
generate JSON
```

Use synthetic/minimal fixtures when possible.

Do not commit copyrighted `.gp`, MIDI or audio files.

## Scope guard

Do not implement:

```txt
desktop generation UI
file pickers
project persistence
.chdg read/write
multi-track generation
preview player
validation checklist UI
mapping overrides
packaging
```
