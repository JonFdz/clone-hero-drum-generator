# Simplified V1 Progress Event Contract

Progress must represent real backend milestones. Do not invent percentages.

```ts
export type OperationProgressEvent = {
  operationId: string;
  operation: "create-project" | "export-project" | "save-copy";
  step: string;
  state: "started" | "completed" | "failed";
  message: string;
  sequence: number;
  timestamp: string;
  details?: Record<string, unknown>;
};
```

Rules:

- operation-scoped IDs;
- monotonically increasing sequence;
- ignore stale/other-operation events;
- typed error in final failure;
- explicit cancellation when supported;
- completed steps never regress.

## Create Project steps

```text
validate-inputs
read-source
extract-drum-track
materialize-project-chart
archive-source
convert-audio
prepare-cover
write-project
finalize-project
```

`prepare-cover` may complete as skipped. “Opening editor” is frontend transition, not a backend step.

## Export steps

```text
validate-project
materialize-effective-chart
prepare-chart
prepare-metadata
prepare-audio
prepare-cover
stage-output
commit-output
record-export-state
```

Audio/cover may report unchanged/skipped in details.

## Save a Copy steps

```text
validate-copy-target
copy-project-assets
rewrite-copy-identity
write-copy-project
finalize-copy
```

## UI

- pending/current/completed/failed;
- spinner only current;
- check only completed;
- no fake percentage;
- optional indeterminate bar;
- technical detail in disclosure;
- one actionable failure.

Use a scoped subscription or async-iterator-style adapter. Electron removes listeners on complete, cancel, renderer disposal, or replacement.
