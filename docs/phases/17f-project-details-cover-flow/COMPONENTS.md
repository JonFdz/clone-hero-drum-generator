# Component Breakdown Phase 17F: Project Details + Cover Flow

## Current files

```txt
apps/desktop/src/app/pages/new-project/new-project-page.component.ts
apps/desktop/src/app/pages/projects/projects-page.component.ts
apps/desktop/src/app/app.routes.ts
apps/desktop/src/app/app.component.ts
apps/desktop/src/app/app.component.html
```

## Target files / suggested structure

```txt
apps/desktop/src/app/pages/projects/project-details/project-details-page.component.ts
apps/desktop/src/app/pages/projects/project-details/components/project-details-header.component.ts
apps/desktop/src/app/pages/projects/project-details/components/project-cover-card.component.ts
apps/desktop/src/app/pages/projects/project-details/components/project-inputs-card.component.ts
apps/desktop/src/app/pages/projects/project-details/components/project-metadata-card.component.ts
apps/desktop/src/app/pages/projects/project-details/components/project-summary-card.component.ts
apps/desktop/src/app/pages/projects/project-details/components/project-path-warning-card.component.ts
apps/desktop/src/app/pages/projects/components/projects-remove-confirm-dialog.component.ts
```

Existing `NewProjectPageComponent` may be:

```txt
renamed/migrated to ProjectDetailsPageComponent
or replaced by a route redirect to /projects/details
```

## ProjectsPageComponent changes

Add actions:

```txt
Select
Edit
Remove
```

Responsibilities:

```txt
select project as current
edit project via Project Details
remove from recents / delete file confirmation
```

## ProjectDetailsPageComponent

Replaces old New Project page as the editing surface.

Responsibilities:

```txt
load current project/generate state
edit project name
pick source
pick audio
pick output
pick cover image
clear cover image
edit metadata
edit offset
show summary
save/save as
inspect source
```

## ProjectCoverCardComponent

New.

Responsibilities:

```txt
display cover preview if cover image exists
display placeholder if missing
Choose Cover
Remove Cover
show missing cover warning if path missing
```

Inputs:

```txt
coverImagePath
projectName
missingCover
```

Outputs:

```txt
chooseCover
clearCover
```

## Project remove confirmation dialog

Update existing Phase 17E confirm dialog.

New choices:

```txt
Cancel
Remove from Recents
Remove from Recents and Delete File
```

Required copy:

```txt
Remove this project?
You can remove it only from the recent list, or remove it from recents and delete the .chdg file from disk.
Deleting the .chdg file does not delete source/audio/output folders.
```

## Services / bridge

Update:

```txt
DesktopBridgeService
desktop-bridge.d.ts
Electron preload if applicable
Electron main IPC handlers
DesktopProjectStateService
DesktopGenerateStateService or new ProjectDetailsState helper
```

New bridge methods:

```txt
pickCoverImageFile()
deleteProjectFile(filePath)
```

Maybe:

```txt
removeRecentProjectAndDeleteFile(filePath)
```

Pick one clean API and keep it consistent.

## Project model helper

Create if useful:

```txt
apps/desktop/src/app/services/project-details-model.ts
apps/desktop/src/app/services/project-details-model.test.ts
```

Responsibilities:

```txt
deriveProjectDetailsModel()
validateProjectDetails()
formatCoverLabel()
deriveProjectDetailsPrimaryAction()
cover path/missing warning logic
```

## Persistence touch points

Update project file schema/types where project persistence is defined:

```txt
packages/project
@chdg/project/browser exports
Electron project persistence helpers
ProjectStatePayload
Save/open conversion
```

Cover field must be optional.

## Implementation order

1. Add project schema optional cover field and tests.
2. Add bridge cover picker.
3. Add bridge delete .chdg file method.
4. Add DesktopProjectStateService / payload cover plumbing.
5. Create Project Details route/page from New Project page.
6. Add cover card.
7. Update Projects card actions Select/Edit/Remove.
8. Update remove dialog for two remove choices.
9. Add tests.
10. Manual validate flows.
