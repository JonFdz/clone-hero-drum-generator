# PRD Phase 17E: Projects Library Pixel-Perfect Redesign

## Goal

Redesign the Projects screen to match the existing Projects mockup as closely as practical.

Primary visual reference:

```txt
docs/desktop/mockups/02-projects-library.png
```

This phase should be treated as a **near pixel-perfect Projects Library implementation**, following the same standard used for the final Home redesign.

## Current repo baseline

Current Projects implementation:

```txt
apps/desktop/src/app/pages/projects/projects-page.component.ts
```

Current state/services:

```txt
apps/desktop/src/app/services/desktop-project-state.service.ts
apps/desktop/src/app/services/desktop-generate-state.service.ts
apps/desktop/src/app/services/desktop-bridge.service.ts
```

Current implementation is very basic:

```txt
page header
Recent Projects card
list of recent projects
Remove button removes immediately
New Project / Open Project actions
```

## Product direction

Projects is the dedicated project library.

It should answer:

```txt
What projects have I recently worked on?
Can I quickly search/filter/sort projects?
Can I open a project quickly?
Can I remove a project from recents safely?
What does my local project library look like at a glance?
```

Home is the launchpad. Projects is the library.

## Scope

Included:

```txt
Projects page redesign only
near pixel-perfect composition based on 02-projects-library.png
project library header
search/filter/sort using currently available recent-project data
project cards/list rows matching the mock
library stats / overview card instead of fake recent activity
safe remove-from-recents confirmation dialog
trash/delete icon for remove action
empty state
responsive behavior
tests for pure Projects library model helpers
```

Out of scope:

```txt
Home redesign
New Project redesign
Preview/Generate/Validation/Mapping/Settings redesign
global sidebar/header redesign
real recent activity/event log
reading all .chdg files to derive real output status
deleting .chdg files from disk
cover/portada picker or cover persistence
.chdg bundle/format changes
new persistence model
new dependencies
```

## Important future context: cover art

A later phase will allow the user to set a cover image/portada for each song/project.

Projects should be designed so project cards can eventually display that cover.

This phase should **not** implement cover persistence or cover picking.

But the visual design should reserve a clear cover/image slot in project rows/cards:

```txt
current phase:
- show a generated placeholder/icon/avatar in the cover slot

future phase:
- replace placeholder with project cover art from .chdg/project metadata
```

Do not hardcode layout in a way that makes cover art hard to add later.

## Recent Activity decision

Do **not** implement fake Recent Activity.

The current persisted data only reliably supports recent project entries, not a real activity feed.

Do not invent events like:

```txt
Generated 2 hours ago
Validated yesterday
Offset changed
Mapping profile applied
Exported package
```

unless those events are actually persisted and read.

Instead, replace the mock's recent activity concept with a truthful:

```txt
Library Stats
Library Overview
```

The card should keep the mock's visual position/proportions but use honest data.

## Library stats

Use only data available from `recentProjects`.

Allowed safe stats:

```txt
total recent projects
opened today
opened this week
MIDI-like projects inferred from name/path
Guitar Pro-like projects inferred from name/path
unknown source type count
most recent opened label
```

Important:

```txt
Source type is inferred from project name/path only unless real metadata exists.
Do not claim real source type if it cannot be known.
```

Do not show:

```txt
generated projects count
validated projects count
failed projects count
total notes
last generated
last validated
```

unless implemented from real persisted data.

## Remove from recents

Projects must not remove a recent project immediately without confirmation.

Replace the current direct remove behavior with a clear action:

```txt
trash icon / remove from recents action
```

Clicking it opens a confirmation dialog.

Dialog copy:

```txt
Remove from recent projects?
This only removes the project from the recent list. It will not delete the .chdg file from disk.
```

Actions:

```txt
Cancel
Remove from Recent
```

This operation must only remove from the recent list. It must not delete files from disk.

## Project card / row requirements

Each project item should show:

```txt
cover slot / placeholder image area
project name
path
last opened
source type badge if safely inferred
status badge only if truthful
primary Open action
remove/trash action with confirmation
```

Status rule:

```txt
current loaded project -> may show actual output status
other recent projects -> show neutral "Recent" or no status badge
```

Do not invent statuses for non-current recent projects.

## Search/filter/sort

Implement using available recent-project data.

Search fields:

```txt
project name
path
```

Filters/sort may include:

```txt
All
MIDI-like
Guitar Pro-like
Unknown
Last opened newest first
Name A-Z
```

If the mock has controls in this area, match them as closely as practical.

## Required component breakdown

Suggested folder:

```txt
apps/desktop/src/app/pages/projects/components/
```

Recommended components:

```txt
ProjectsLibraryHeaderComponent
ProjectsToolbarComponent
ProjectsProjectGridComponent
ProjectsProjectCardComponent
ProjectsLibraryStatsComponent
ProjectsEmptyStateComponent
ProjectsRemoveConfirmDialogComponent
```

Optional:

```txt
ProjectsCoverPlaceholderComponent
ProjectsSourceBadgeComponent
```

Keep `ProjectsPageComponent` as a container/composer.

## Required pure helper/model

Create if practical:

```txt
apps/desktop/src/app/services/projects-library-model.ts
apps/desktop/src/app/services/projects-library-model.test.ts
```

Responsibilities:

```txt
deriveProjectsLibraryModel()
filterProjects()
sortProjects()
inferProjectSourceType()
formatLastOpenedLabel()
deriveLibraryStats()
buildRemoveConfirmationCopy()
```

## Data constraints

Use existing state only:

```txt
DesktopProjectStateService.state().recentProjects
DesktopProjectStateService.state().projectFilePath
DesktopProjectStateService.state().outputStatus
DesktopProjectStateService.removeRecentProject()
DesktopProjectStateService.openProject()
DesktopGenerateStateService.loadProjectState()
DesktopBridgeService.openProjectFile()
```

Do not read every `.chdg` file in this phase.

Do not introduce a new project database.

## Acceptance criteria

- Projects visually matches `02-projects-library.png` closely.
- Projects is clearly the full library screen, distinct from Home.
- Recent Activity is not faked.
- A Library Stats/Overview card replaces fake activity using honest data.
- Project cards include a cover slot/placeholder ready for future cover art.
- Remove uses a trash/remove icon and requires confirmation.
- Confirmation dialog explicitly says the `.chdg` file is not deleted from disk.
- Search/filter/sort work on available recent-project data.
- Open Project works.
- Open Recent works.
- Remove from Recent works after confirmation.
- Cancel confirmation does not remove anything.
- Empty state works.
- Projects page remains local-only and offline.
- No new dependencies are added.
