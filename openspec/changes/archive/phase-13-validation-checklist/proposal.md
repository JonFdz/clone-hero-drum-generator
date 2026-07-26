# Proposal: Phase 13 — Validation Checklist / Pre-Generate Review

## Change ID

`phase-13-validation-checklist`

## Summary

Add a project-aware validation checklist and pre-generate review layer for CHDG Desktop.

Phase 11 made desktop generation usable. Phase 12 added `.chdg` project persistence, settings, recents, dirty state, output status and FFmpeg diagnostic.

Phase 13 should make the app clearly explain whether a project is ready to generate, what is missing, what is risky, and what is only informational.

This phase adds:

```txt
project validation service
validation checklist UI
blocking errors vs warnings vs info
pre-generate review integration
FFmpeg readiness check integration
missing paths validation
track/source/audio/output validation
multi-track merge warnings visibility
impossible hand chord warnings visibility
```

## Why this phase exists

The app can now save/load projects and generate output, but the user needs a reliable answer to:

```txt
Can I generate now?
If not, what exactly must I fix?
If yes, what warnings should I review first?
Is my output stale?
Is FFmpeg ready?
Are source/audio/output paths still valid?
```

A validation checklist is the foundation for later preview, offset adjustment, mapping overrides, and packaging.

## Goals

1. Add structured project validation.
2. Add validation severity levels: `error`, `warning`, `info`.
3. Add blocking vs non-blocking validation behavior.
4. Add desktop Validation page implementation.
5. Add pre-generate review on the Generate page.
6. Validate source/audio/output/selected tracks.
7. Validate path existence for loaded `.chdg` projects.
8. Validate supported source type: `.mid`, `.midi`, `.gp`.
9. Validate metadata quality where useful.
10. Validate offset shape/range where useful.
11. Integrate FFmpeg diagnostic/settings readiness.
12. Show output status: `not-generated`, `generated`, `needs-regenerate`, `failed`.
13. Surface normalization/merge warnings: duplicate hits, hi-hat conflicts, impossible hand chords and project issues.
14. Preserve Phase 11/12 generate flow.
15. Preserve Electron security boundaries.

## Non-goals

- No audio/waveform preview.
- No Clone Hero highway preview.
- No offset adjustment preview.
- No note editor.
- No mapping override UI.
- No mapping profiles.
- No `.chdg` bundle format.
- No file association/double-click opening.
- No packaging/distribution.
- No full desktop UX polish pass.
- No automatic simplification of impossible chords.
- No external editor/Moonscraper integration.

## UX polish note

Continue the Phase 12 decision: do not do broad visual polish now; only fix UX blockers that prevent validation/generation use. Full Desktop UX Polish happens later before packaging.

## Branch

```txt
feat/phase-13-validation-checklist
```

## Required docs to read

```txt
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/phases/13-validation-checklist/PRD.md
docs/phases/13-validation-checklist/ADR.md
docs/phases/13-validation-checklist/CHECKLIST.md
docs/phases/12-project-persistence-settings/PRD.md
docs/phases/11-desktop-generate-mvp/PRD.md
docs/phases/10b-multi-track-normalization-generation/PRD.md
```

Visual references:

```txt
docs/desktop/mockups/07-validation-checklist.png
docs/desktop/mockups/06-generate.png
docs/desktop/mockups/03-new-project.png
docs/desktop/mockups/10-settings.png
```

If mockup text conflicts with docs, follow `docs/desktop/mockup-corrections.md`.

## Expected architecture

Validation should be shared and structured.

Recommended flow:

```txt
@chdg/project
  -> validation domain types/helpers where portable

Angular renderer
  -> DesktopProjectStateService
  -> DesktopGenerateStateService
  -> DesktopValidationService
  -> Validation page / Generate page preflight

Electron main/preload
  -> explicit methods only where filesystem/FFmpeg/path checks are needed
```

Validation rules that do not need filesystem/Electron should live outside UI components.

Filesystem/path existence checks should happen through Electron main/preload, not direct Node access from renderer.

## Suggested validation model

```ts
type ValidationSeverity = "error" | "warning" | "info";

type ValidationCategory =
  | "project"
  | "source"
  | "audio"
  | "output"
  | "tracks"
  | "metadata"
  | "offset"
  | "ffmpeg"
  | "generation"
  | "chart";

type ValidationItem = {
  id: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  title: string;
  message: string;
  blocking: boolean;
  fixAction?: {
    label: string;
    route?: string;
    action?: string;
  };
};

type ValidationSummary = {
  canGenerate: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  items: ValidationItem[];
  checkedAt: string;
};
```

Exact names can follow repo style.

## Severity rules

Errors block generation.

Examples:

```txt
missing source
missing audio
missing output folder
missing selected tracks
unsupported source type
missing project source/audio path after loading .chdg
FFmpeg unavailable when audio conversion is required
invalid offset
```

Warnings do not block generation.

Examples:

```txt
metadata missing recommended fields
output status needs-regenerate
impossible hand chord warnings
multi-track merge conflicts
duplicate hits deduped
existing output files will require overwrite confirmation
```

Info items are purely explanatory.

## Generate integration

Before generation:

```txt
run validation summary
if errors exist, block generate and show errors
if only warnings exist, allow generate
```

Do not remove the existing overwrite confirmation behavior.

## `.chdg` persistence

If lightweight and useful, persist last validation summary or timestamp into project state.

Do not make this a schema-breaking requirement.

It is acceptable to recompute validation on load instead of storing it.

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
open existing project
run validation
missing source blocks generate
missing audio blocks generate
missing selected tracks blocks generate
unsupported source blocks generate
FFmpeg unavailable blocks generate if required
warnings do not block generate
needs-regenerate shown clearly
merge/impossible chord warnings visible after normalization
valid project can still generate
```

## Review policy

The implementation agent should do focused self-checks only. Final PR review is external and will be performed by Jon/ChatGPT. The agent must not merge.
