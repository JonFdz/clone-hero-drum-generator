# Simplified V1 Route Contract

## Canonical production routes

```text
/home
/projects
/projects/new/details
/projects/new/mapping
/projects/new/creating
/projects/:projectId/editor/preview
/projects/:projectId/editor/mappings
/settings
```

## Responsibilities

### `/home`

Create Project, Open Project, recent projects, View All, Settings.

### `/projects`

All known projects, search, open, remove stale recent entry, explicit delete with confirmation.

### `/projects/new/details`

Transient wizard state: source, audio, cover, required identity, optional metadata, default locations. No final project folder yet.

### `/projects/new/mapping`

Analysis result, recommended/manual track, advanced multiple tracks, compact mappings, Create Project. Missing wizard state redirects to details.

### `/projects/new/creating`

Transient operation progress/error. Missing active operation redirects to details.

### `/projects/:projectId/editor/preview`

Primary project route: contextual header, playback/waveform/Highway, offset, note selection/editing, warnings, Project Details, Export, overflow.

### `/projects/:projectId/editor/mappings`

Two-level source mapping editor and attention states.

### `/settings`

Global settings.

## Contextual states, not routes

- Project Details panel
- Edit Note dialog/panel
- Export confirm/progress/success/failure
- Save a Copy
- output conflict
- save failure

## Redirects

```text
/ → /home
/projects/:projectId → /projects/:projectId/editor/preview
```

Old routes may redirect temporarily during implementation:

```text
/projects/details
/source-review
/generate
/preview
```

Remove obsolete compatibility before first public release unless still documented/tested.

## Project resolution

Route project ID resolves through Electron-owned project catalog. Unknown ID shows a missing-project state and Open Project action; never guess a filesystem path.

Catalog entry:

```ts
{
  projectId: string;
  path: string;
  displayName: string;
  lastOpenedAt: string;
  coverPreviewPath?: string;
  durationMs?: number;
}
```

## Canonical harness URLs

```text
/home?scenario=home-recent&harnessUi=hidden
/projects?scenario=projects-list&harnessUi=hidden
/projects/new/details?scenario=create-details-filled&harnessUi=hidden
/projects/new/mapping?scenario=create-mapping-default&harnessUi=hidden
/projects/new/mapping?scenario=create-mapping-attention&harnessUi=hidden
/projects/new/creating?scenario=create-progress&harnessUi=hidden
/projects/demo-project/editor/preview?scenario=editor-ready&harnessUi=hidden
/projects/demo-project/editor/preview?scenario=editor-note-selected&harnessUi=hidden
/projects/demo-project/editor/preview?scenario=editor-edit-note&harnessUi=hidden
/projects/demo-project/editor/preview?scenario=editor-project-details&harnessUi=hidden
/projects/demo-project/editor/preview?scenario=editor-duration-warning&harnessUi=hidden
/projects/demo-project/editor/preview?scenario=export-progress&harnessUi=hidden
/projects/demo-project/editor/preview?scenario=export-success&harnessUi=hidden
/projects/demo-project/editor/preview?scenario=export-failed&harnessUi=hidden
/projects/demo-project/editor/preview?scenario=export-conflict&harnessUi=hidden
/projects/demo-project/editor/mappings?scenario=mappings-default&harnessUi=hidden
/projects/demo-project/editor/mappings?scenario=mappings-modified&harnessUi=hidden
/projects/demo-project/editor/mappings?scenario=mappings-attention&harnessUi=hidden
/settings?scenario=settings-ready&harnessUi=hidden
```

The harness project is synthetic.
