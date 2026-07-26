# Proposal — Phase 17J Preview and Project Lifecycle Bugfixes

## Why

CHDG needs a focused bugfix pass for generated-output correctness and project lifecycle reliability.

The most urgent issue is Preview. Preview currently can fall back to `.chdg` cached `analysis.normalizationPreview` data. That cache is useful for Source Review persistence, but it is not a generated chart representation. In particular, `normalizationPreview.firstHits` is only a small sample and must not be stretched over the full audio duration.

Additional related bugs affect generated output/package completeness and filesystem consistency:

- selected cover images are not emitted as `album.jpg`;
- auto-created project folders do not follow project rename;
- project deletion can fail or behave unclearly.

## What changes

- Make Preview generated-output-only.
- Attempt cover export to `album.jpg` during Generate, warning-only on failure.
- Rename CHDG auto-created project folder/file when project name changes.
- Improve safe project deletion reliability.

## Priority

P0 Preview is mandatory and must be completed first.

If P0 becomes larger than expected, stop after P0 and report. Do not block the Preview fix on the lower-priority lifecycle bugs.

## Source of truth process

The accepted OpenSpec must be transferred to Engram before implementation. Engram is the project source of truth after transfer.
