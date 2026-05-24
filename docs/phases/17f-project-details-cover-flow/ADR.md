# ADR Phase 17F: Project Details + Cover Flow

## Status

Proposed.

## Decision

Move New Project into the Projects domain by replacing the top-level New Project screen with a Projects-owned Project Details flow.

## Context

Current app has a separate `/new-project` route and top-level nav item.

Current Projects after Phase 17E is the dedicated project library. The user now wants Projects to own create/edit/select/remove behavior.

## Decisions

### Route decision

Add a Projects-owned Project Details route.

Recommended:

```txt
/projects/details
```

Do not use file paths as path params.

Use query params or current project state.

### New Project decision

The New Project button on Projects should:

```txt
create/initialize a new .chdg project
open Project Details for editing
```

A compatibility redirect from `/new-project` may exist temporarily, but the product concept is Project Details under Projects.

### Select/Edit decision

Projects cards expose:

```txt
Select
Edit
Remove
```

Select loads the project as active/current.
Edit opens details.
Remove opens confirmation.

### Cover decision

Add optional cover image path metadata to project state/persistence.

This phase persists a local image path, not embedded binary data.

Reason:

```txt
Cover support is needed now.
Bundled .chdg/archive format is a later phase.
```

### Delete decision

Remove dialog offers two destructive levels:

```txt
Remove from recents only
Remove from recents and delete .chdg file
```

Delete only deletes the `.chdg` file, never source/audio/output folders.

## Non-goals

- No .chdg bundle/archive conversion.
- No copying/embedding cover images.
- No output/source/audio deletion.
- No full project database.
- No real activity feed.
