# ADR Phase 17E: Projects Library Pixel-Perfect Redesign

## Status

Proposed.

## Decision

Implement Projects as a near pixel-perfect screen based on:

```txt
docs/desktop/mockups/02-projects-library.png
```

while applying canonical product truthfulness rules.

## Context

The current Projects page is basic and only shows recent projects with immediate remove behavior.

The mock contains richer library-style UI. However, some mock concepts such as "Recent Activity" may imply persisted activity events that the app does not currently store.

## Decision: no fake activity

Do not implement fake Recent Activity.

Replace that area with a truthful Library Stats / Library Overview card using only existing `recentProjects` data.

Allowed stats:

```txt
total recent projects
opened today
opened this week
inferred MIDI-like count
inferred Guitar Pro-like count
unknown count
most recent opened
```

## Decision: cover-ready project cards

Projects cards should reserve a visual cover slot.

This phase shows placeholders/icons only.

A later phase will implement user-selected song/project covers and persist them in project metadata.

## Decision: safe remove

Removing a recent project requires confirmation.

The dialog must make clear:

```txt
Remove from recents only.
Do not delete the .chdg file from disk.
```

## Decision: do not scan all project files

Do not read every recent `.chdg` file to derive real statuses in this phase.

Only the currently loaded project may use actual output status. Other recent projects should use neutral labels such as `Recent`.

## Non-goals

- No `.chdg` bundle/format change.
- No cover persistence or cover picker.
- No real activity feed/event log.
- No disk deletion.
- No new dependencies.
