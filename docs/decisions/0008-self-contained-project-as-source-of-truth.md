# ADR 0008: Self-Contained Project as the Post-Import Source of Truth

## Status

Accepted.

## Context

The provisional project stores external source/audio paths and regenerates by re-reading them. This creates fragile projects and exposes technical stages.

## Decision

Successful import creates a self-contained folder with imported hits/timing, mappings, corrections, internal `song.ogg`, archived source, and optional cover. External originals are no longer runtime dependencies. The full folder is portable; the JSON alone is not.

## Consequences

Benefits:

- reopen after originals move;
- Preview before export;
- deterministic repeat export;
- no external missing-path workflow;
- source provenance retained.

Costs:

- larger project folder;
- transactional import required;
- provisional project/generation design replaced.

## Rejected

- external files as permanent source of truth;
- binary embedding inside JSON;
- ZIP/container `.chdg` in V1.
