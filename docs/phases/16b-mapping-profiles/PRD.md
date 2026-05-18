# PRD Phase 16B: Mapping Profiles

## Goal

Allow reusable mapping override profiles after observing real cases.

## Visual references

```txt
docs/desktop/mockups/09-mapping-overrides.png
```

Also read:

```txt
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
```

## Scope

- Save project overrides as profile.
- Apply profile to project.
- Manage profiles locally.
- Support likely real-source profiles such as Songsterr only after collecting real cases.

## Non-goals

- No invented default Songsterr profile before real cases.
- No cloud profile sync.
- No automatic profile selection unless explicitly designed.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
