# Simplified V1 Desktop IPC Contract

## Goals

Keep filesystem/process capabilities in Electron, reusable behavior in packages, Angular contracts narrow and typed, progress real, and renderer unable to write arbitrary paths.

## APIs

### Creation

```ts
analyzeProjectImport(input): Promise<JsonEnvelope<AnalyzeImportResult>>;
startCreateProject(input): Promise<JsonEnvelope<{ operationId: string }>>;
waitForCreateProject(operationId): Promise<JsonEnvelope<CreateImportedProjectResult>>;
subscribeOperationProgress(operationId, listener): Unsubscribe;
```

Picker-approved external paths are temporary capabilities. Create input references trusted analysis output/token plus user choices.

### Catalog/open

```ts
openProjectFromPicker();
openProjectById(projectId);
readProjects();
deleteProject(projectId);
```

### Editing

Prefer commands, not full renderer-owned project serialization:

```ts
applyProjectCommand(input);
undoProjectCommand(projectId);
redoProjectCommand(projectId);
flushProject(projectId);
```

### Preview

```ts
getProjectPreview(projectId);
getProjectAudioSource(projectId);
```

Preview notes include stable IDs and correction state.

### Export

```ts
startExportProject(input);
waitForExportProject(operationId);
confirmExportConflict(input);
```

### Details/copy

```ts
updateProjectDetails(input);
startSaveProjectCopy(input);
```

## Typed errors

Import:

- INVALID_IMPORT_INPUT
- UNSUPPORTED_SOURCE
- SOURCE_READ_FAILED
- NO_DRUM_TRACK
- TRACK_NORMALIZATION_FAILED
- FFMPEG_UNAVAILABLE
- AUDIO_CONVERSION_FAILED
- COVER_PREPARATION_FAILED
- PROJECT_TARGET_EXISTS
- PROJECT_WRITE_FAILED
- PROJECT_FINALIZE_FAILED

Project:

- PROJECT_NOT_FOUND
- PROJECT_INVALID
- PROJECT_ASSET_MISSING
- PROJECT_ASSET_CORRUPT
- PROJECT_SAVE_FAILED
- PROJECT_RENAME_CONFLICT
- PROJECT_RENAME_FAILED
- SAVE_COPY_CONFLICT

Editing:

- HIT_NOT_FOUND
- INVALID_NOTE_CORRECTION
- INVALID_MAPPING_TARGET
- UNDO_UNAVAILABLE
- REDO_UNAVAILABLE

Export:

- EXPORT_TARGET_REQUIRED
- EXPORT_TARGET_CONFLICT
- EXTERNALLY_MODIFIED_MANAGED_FILE
- EXPORT_VALIDATION_FAILED
- EXPORT_STAGE_FAILED
- EXPORT_COMMIT_FAILED
- EXPORT_STATE_SAVE_FAILED

## Electron refactor

Extract handler registration:

```text
apps/desktop/electron/ipc/project-import-handlers.ts
apps/desktop/electron/ipc/project-edit-handlers.ts
apps/desktop/electron/ipc/project-preview-handlers.ts
apps/desktop/electron/ipc/project-export-handlers.ts
apps/desktop/electron/ipc/project-catalog-handlers.ts
apps/desktop/electron/ipc/settings-handlers.ts
apps/desktop/electron/ipc/operation-progress.ts
```

One B7 owner controls `main.ts`, `preload.cts`, global bridge declarations, and bridge service integration.

## Autosave

Backend-owned open-project session queues atomic saves and emits save state. Angular does not send the entire JSON on every mutation.

## Security

- external picker paths temporary and allowlisted;
- internal assets resolve from trusted project root;
- project IDs resolve via catalog;
- output roots validated through settings/pickers;
- no arbitrary renderer write path;
- progress channels carry data only.
