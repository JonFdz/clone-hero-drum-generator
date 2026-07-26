# Design: Phase 17E — Projects Library Pixel-Perfect Redesign

## Target

Use:

```txt
docs/desktop/mockups/02-projects-library.png
```

as near pixel-perfect reference.

## Data

Use only existing recent-project state.

Do not scan every `.chdg` file.

## Recent Activity replacement

If the mock includes Recent Activity, replace it with Library Stats / Library Overview.

Stats are derived from `recentProjects`.

## Cover art future-proofing

Each project card gets a cover slot.

Current phase:

```txt
placeholder/source icon
```

Future phase:

```txt
saved project cover art
```

## Remove confirmation

Trash/remove action opens modal.

No immediate removal.

Copy must clarify that the file is not deleted from disk.

## Project status

Only current loaded project may show real output status.

Other recents show neutral `Recent` or no status.
