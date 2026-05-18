# PRD Phase 13: Validation Checklist

## Goal

Add automated validation checks for generated Clone Hero output folders.

## Visual references

```txt
docs/desktop/mockups/07-validation.png
```

Also read:

```txt
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
```

## Scope

- Validate required files.
- Validate ExpertDrums.
- Validate metadata and offset.
- Validate Pro Drums markers where expected.
- Validate open hi-hat markers where expected.
- Produce structured pass/warning/error/info report.
- Render Validation screen.
- Copy/export report.
- Open output folder.
- Link to internal preview where available.

## Non-goals

- No Moonscraper dependency.
- No audio waveform analysis.
- No musical correctness claims.
- No individual note editing.
- Do not validate `.chdg` as the generated output package.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
