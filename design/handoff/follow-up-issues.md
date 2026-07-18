# Recommended Follow-up Issues

These issues are recommendations only. They were not created as part of issue
#89.

| Recommended issue | Outcome | Why separate |
|---|---|---|
| Deterministic audio-backed Preview scenario | A stable harness state for the primary Preview experience | Current evidence covers only the timing-diagnostics fallback |
| Verify save-state transitions | Document which Saved, Saving, Unsaved, and Save failed states are actually exposed | Design must not invent persistence guarantees |
| Define generation retry scope | Specify whether Retry repeats all work, the failed phase, or cached work | Recovery UI deliberately leaves scope unresolved |
| Define downstream invalidation | Specify how upstream edits affect readiness and generated output | Revisitation is approved but consequences are unknown |
| Verify Open output safety during generation | Establish whether the action is safe, disabled, stale, or partially available | V1 intentionally avoids making it central |
| Implement CHDG Design V1 | Deliver the approved shell, semantics, components, and sixteen states | Issue #89 is design-only |
| Accessibility and visual-regression validation | Validate keyboard, focus, contrast, zoom, wrapping, and deterministic screenshots | Requires implemented UI and stable scenarios |
