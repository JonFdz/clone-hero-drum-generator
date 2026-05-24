# PRD Phase 17F: Project Details + Cover Flow

## Goal

Turn the old `New Project` screen into a Projects-owned `Project Details` editing flow, and redesign it near pixel-perfect to the existing New Project mockup while adding a cover/portada section.

Primary visual reference:

```txt
docs/desktop/mockups/03-new-project.png
```

Important product change:

```txt
New Project should no longer be treated as a separate app section/screen.
It becomes a create/edit project details flow under Projects.
```

## Context

After Phase 17E, Projects is the dedicated project library.

This phase makes Projects responsible for:

```txt
creating a new project
selecting/loading an existing project as active
editing project details
removing from recents
optionally deleting the .chdg file from disk after explicit confirmation
```

## Current repo baseline

Current routes include a dedicated `/new-project` route:

```txt
apps/desktop/src/app/app.routes.ts
```

Current New Project implementation:

```txt
apps/desktop/src/app/pages/new-project/new-project-page.component.ts
```

Current project state/services:

```txt
apps/desktop/src/app/services/desktop-project-state.service.ts
apps/desktop/src/app/services/desktop-generate-state.service.ts
apps/desktop/src/app/services/desktop-bridge.service.ts
apps/desktop/src/app/desktop-bridge.d.ts
apps/desktop/electron/main.ts
```

Current New Project screen already handles:

```txt
project name
create project
source file
audio file
output folder
metadata
offset
inspect source
save
save as
summary
missing paths
needs-regenerate warning
```

Current Projects screen after Phase 17E should be treated as the owner of project library interactions.

## Product decisions

### New Project becomes Project Details

Replace the mental model:

```txt
New Project = standalone section
```

with:

```txt
Projects -> Project Details
```

Expected flow:

```txt
Projects > New Project
  creates/initializes a new .chdg project
  then opens Project Details for that project

Projects > Select on a project
  loads the project as the active/current project
  stays in Projects and marks it as current

Projects > Edit on a project
  loads the project if needed
  opens Project Details for editing

Projects > Remove
  opens a confirmation dialog with two choices:
    Remove from recents only
    Remove from recents and delete .chdg file
```

### Project Details can be a route

This phase should add a Projects-owned details route.

Recommended route:

```txt
/projects/details
```

Use query params or in-memory active project state to determine what is being edited.

Examples:

```txt
/projects/details
/projects/details?mode=new
/projects/details?path=<encoded path>
```

Do not use raw file paths directly in path segments because project paths contain slashes.

### Sidebar/nav

The sidebar should not keep treating New Project as a top-level app section after this phase.

Recommended:

```txt
Remove or de-emphasize top-level New Project nav item.
Projects screen/header owns New Project.
```

If removing the nav item is too risky, it may redirect to the new Projects Details flow, but the UI should no longer present New Project as a separate major section.

## Cover/portada

Add a cover image section to Project Details.

This is the first phase to add cover/portada support.

Required:

```txt
cover placeholder/preview
choose cover image
remove/clear cover image
persist cover reference in the .chdg project
show cover in project details summary
```

Recommended supported input types:

```txt
.png
.jpg
.jpeg
.webp
```

Decision for this phase:

```txt
Persist cover image path/reference, not a binary copy.
```

Rationale:

```txt
This keeps the phase smaller and avoids changing .chdg into a bundled archive.
```

Future phase may convert `.chdg` to a bundle/archive and embed the cover.

If using a path reference, opening a project should report a missing cover warning if the file no longer exists, but missing cover should not block generation.

## Project file/schema changes

This phase likely needs a project schema extension.

Add optional cover metadata to project file/payload types.

Suggested shape:

```ts
cover?: {
  imagePath?: string;
};
```

or:

```ts
assets?: {
  coverImagePath?: string;
};
```

Pick one canonical shape and use it consistently.

Required updates:

```txt
@chdg/project project file types/browser exports
desktop bridge ProjectStatePayload
buildProjectFileFromState()
readProjectFile()
saveProject/openProject bridge handlers
DesktopProjectStateService or DesktopGenerateStateService state as appropriate
```

Important:

```txt
Existing .chdg files without cover must still open.
Cover field must be optional and backwards compatible.
```

## Cover picker bridge

Current desktop bridge supports source/audio/output/project file picking, but not cover image picking.

Add a new safe desktop bridge flow:

```txt
pickCoverImageFile()
```

Electron dialog filters:

```txt
Images: png, jpg, jpeg, webp
```

Security rules:

```txt
selected cover path is added to an allowed cover/image path set
only selected or project-owned paths may be used
```

No image upload, no network, local-only.

## Delete project file bridge

Current remove recent only removes the recent list entry.

This phase adds optional deletion of the `.chdg` file from disk after explicit confirmation.

Add a safe bridge/service method:

```txt
deleteProjectFile(filePath)
```

or:

```txt
removeRecentProjectAndDeleteFile(filePath)
```

Recommended behavior:

```txt
Only allow deletion of files that:
- are .chdg files
- are in Electron-owned recent projects OR were selected/opened in the current session
- resolve to the exact target path
```

The delete confirmation must be explicit.

Do not delete project folders or generated output folders in this phase.

Delete only:

```txt
the .chdg project file
```

After deletion:

```txt
remove from recents
if deleted project was current, reset active project/generate state or navigate to Projects
```

## Projects buttons

Update Projects cards/actions.

Required actions per project:

```txt
Select
Edit
Remove
```

### Select

Means:

```txt
make this project active/current
load .chdg into DesktopProjectStateService
load generate state into DesktopGenerateStateService
```

Preferred behavior:

```txt
Select stays on Projects and marks the project as active.
```

### Edit

Means:

```txt
load the project if needed
open Project Details for editing
```

### Remove

Means:

```txt
open confirmation dialog
```

Dialog must offer:

```txt
Cancel
Remove from Recents
Remove from Recents and Delete File
```

Delete option must be visually dangerous and explicit.

Dialog copy must say:

```txt
Deleting removes the .chdg file from disk. It does not delete source/audio/output folders.
```

## Project Details UX

Project Details should be near pixel-perfect to:

```txt
docs/desktop/mockups/03-new-project.png
```

with one intentional addition:

```txt
Cover / portada section
```

Sections should include:

```txt
project identity / name
cover image
source file
audio file
output folder
metadata
offset
project summary/readiness
save/save as
inspect source / continue action
```

When editing an existing project:

```txt
title should say Project Details or Edit Project
primary action should be Save / Save Changes
```

When creating a new project:

```txt
flow should create a project then land on Project Details
```

## Acceptance criteria

- `New Project` is no longer a standalone top-level app concept.
- Projects owns the create/select/edit/remove flows.
- A Project Details screen/route exists under Projects.
- Project Details visually matches `03-new-project.png` closely.
- Project Details includes a cover/portada image section.
- Cover image can be picked, previewed, cleared, saved, and reopened.
- Existing `.chdg` files without cover still open.
- Projects cards show Select / Edit / Remove.
- Select loads project as active.
- Edit opens Project Details.
- Remove confirms before action.
- Remove from recents does not delete file.
- Remove from recents + delete file deletes only the `.chdg` file after explicit confirmation.
- Home and Projects still work after this flow change.
- No generated output folders/source/audio files are deleted.
