# Component Breakdown Phase 17E: Projects Library Pixel-Perfect Redesign

## Current file

```txt
apps/desktop/src/app/pages/projects/projects-page.component.ts
```

## Target mock

```txt
docs/desktop/mockups/02-projects-library.png
```

## Suggested final structure

```txt
ProjectsPageComponent
  ProjectsLibraryHeaderComponent
  ProjectsToolbarComponent
  ProjectsProjectGridComponent
    ProjectsProjectCardComponent
      ProjectsCoverPlaceholderComponent
      ProjectsSourceBadgeComponent
  ProjectsLibraryStatsComponent
  ProjectsEmptyStateComponent
  ProjectsRemoveConfirmDialogComponent
```

Exact file names may follow repo style, but responsibilities should remain clear.

## ProjectsPageComponent

Container/composer.

Responsibilities:

```txt
read DesktopProjectStateService
read DesktopGenerateStateService only for active/current project context
compose library model
handle open project dialog
handle open recent project
handle remove confirmation state
route after opening
```

Avoid:

```txt
large inline project card template
direct remove without dialog
fake statuses/activity
```

## ProjectsLibraryHeaderComponent

Matches mock header area.

Responsibilities:

```txt
title
subtitle
New Project action
Open Project action
optional total count badge
```

Actions:

```txt
New Project -> /new-project
Open Project -> bridge openProjectFile()
```

## ProjectsToolbarComponent

Search/filter/sort controls.

Responsibilities:

```txt
search by name/path
filter source type: All / MIDI / Guitar Pro / Unknown
sort: Last opened / Name
```

Inputs:

```txt
query
sourceFilter
sortMode
resultCount
```

Outputs:

```txt
queryChange
sourceFilterChange
sortModeChange
```

## ProjectsProjectGridComponent

Displays filtered/sorted projects.

Responsibilities:

```txt
layout project cards/list rows like mock
show empty state when no results
```

## ProjectsProjectCardComponent

Single project card/row.

Responsibilities:

```txt
cover slot / placeholder
project name
path
last opened
source type badge
truthful status badge
Open action
Remove from recents action
```

Important:

```txt
remove action emits requestRemove
does not remove directly
```

## ProjectsCoverPlaceholderComponent

Future-proof visual cover slot.

Current phase:

```txt
display generated placeholder/icon/initials/source icon
```

Future phase:

```txt
display saved cover art
```

No cover persistence in this phase.

## ProjectsLibraryStatsComponent

Replaces fake Recent Activity.

Responsibilities:

```txt
show library stats derived from recentProjects only
keep visual position/proportion of mock side panel
```

Allowed stats:

```txt
Total Projects
Opened Today
Opened This Week
MIDI-like
Guitar Pro-like
Unknown
Most Recent
```

Do not show fake generated/validated/activity stats.

## ProjectsEmptyStateComponent

Shown when:

```txt
recentProjects.length === 0
or filtered result count === 0
```

Actions:

```txt
New Project
Open Project
Clear Search/Filters
```

## ProjectsRemoveConfirmDialogComponent

Modal/dialog.

Props:

```txt
projectName
projectPath
isOpen
```

Outputs:

```txt
cancel
confirm
```

Required copy:

```txt
Remove from recent projects?
This only removes the project from the recent list. It will not delete the .chdg file from disk.
```

Confirm button:

```txt
Remove from Recent
```

Cancel button:

```txt
Cancel
```

## Pure helper/model

Create:

```txt
apps/desktop/src/app/services/projects-library-model.ts
```

Suggested exports:

```txt
deriveProjectsLibraryModel()
filterProjects()
sortProjects()
inferProjectSourceType()
formatLastOpenedLabel()
deriveLibraryStats()
isCurrentProject()
```

Tests:

```txt
apps/desktop/src/app/services/projects-library-model.test.ts
```

## Implementation order

1. Add pure model/helper and tests.
2. Add remove confirmation dialog state.
3. Build project card with cover placeholder.
4. Build toolbar search/filter/sort.
5. Build stats panel replacing Recent Activity.
6. Compose Projects page to match mock.
7. Manual compare against `02-projects-library.png`.
