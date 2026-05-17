# ADR 0006: Desktop-First Local Processing

## Status

Accepted

## Context

CHDG needs to process local symbolic chart sources and audio files. A pure web app would require users to upload `.mid`/`.gp` and audio files to a server, where CHDG would convert audio, generate chart output and return a ZIP.

That creates avoidable issues:

- upload size limits;
- backend CPU cost for audio conversion;
- privacy concerns around user audio;
- copyright sensitivity;
- temporary storage cleanup;
- more deployment complexity.

A local desktop application avoids these problems because the user's files stay on their machine.

## Decision

CHDG will target a local desktop application first.

Preferred desktop stack:

```txt
Electron + Angular
```

The app will run frontend and backend locally on the user's PC.

The CLI remains part of the product and continues to be used for:

- tests;
- automation;
- agent implementation;
- debugging;
- power-user workflows.

A future web UI may exist, but it is not the primary product target.

## Rationale

Electron fits CHDG because:

- Angular can run as the renderer;
- Node.js can run in the Electron main process;
- existing TypeScript packages can be reused directly;
- ffmpeg can be called locally or bundled later;
- local file dialogs and local output folders are natural for this workflow.

Tauri remains an interesting future alternative, but it introduces Rust/sidecar complexity and is less direct for the current TypeScript/pnpm monorepo.

## Consequences

Positive:

- User audio does not need to leave the machine.
- Audio conversion can run locally.
- File/folder workflows are natural.
- Existing TypeScript packages remain reusable.
- The CLI and desktop app can share the same core pipeline.

Negative:

- Electron apps are heavier than pure web apps.
- Packaging/distribution becomes a desktop concern.
- IPC security and file access must be designed carefully.
- ffmpeg bundling or configuration must be handled.
