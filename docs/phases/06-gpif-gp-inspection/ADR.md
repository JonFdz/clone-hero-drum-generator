# ADR Phase 06: GPIF / .gp Inspection

## Status

Proposed.

## Context

The project currently has a validated MIDI-first pipeline. The next major source type is Guitar Pro `.gp`.

Modern `.gp` files commonly contain GPIF XML inside an archive/container, often under:

```txt
Content/score.gpif
```

GPIF can contain richer information than MIDI, but the exact structure varies by file and needs deterministic inspection before normalization.

## Decision

Add Phase 06 as inspection-only.

Create a package boundary:

```txt
packages/guitarpro
```

Add a CLI command:

```bash
pnpm chdg inspect-gp <file.gp>
```

The command extracts GPIF XML, parses enough of it to produce a useful deterministic inspection report, and does not generate charts.

## Rationale

Inspection should come before normalization because real GPIF files need to be understood before committing to mapping rules.

Keeping the code in `packages/guitarpro` follows the existing architecture and keeps `apps/cli` as orchestration only.

## Dependency approach

The implementation may add lightweight open-source dependencies for:

- reading ZIP/container entries;
- parsing XML.

Dependencies should be Node-compatible, reasonably small, and documented in the PR.

## Consequences

Positive:

- Real `.gp` files can be analyzed without committing to mapping logic.
- Future GPIF normalization can be based on observed structures.
- CLI remains useful for debugging and agent workflows.
- Desktop UI can later reuse the same package.

Negative:

- Adds at least one new package boundary.
- May add ZIP/XML parsing dependencies.
- GPIF output may initially include unknown/unhandled structures until more real files are inspected.
