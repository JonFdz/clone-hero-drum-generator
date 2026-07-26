# Proposal — Phase 17M Source Review Mapping Coverage UI

## Summary

Improve Source Review Mapping Review so users can understand and act on the mapping coverage model introduced in Phase 17L.

This change adds clear filtering, row classification, quick actions, and educational copy for mapping coverage.

## Motivation

Phase 17L introduced the correct backend/model behavior:

- auto-mapped notes;
- candidates skipped by default;
- ignored known percussion;
- unknown notes;
- project overrides;
- mapping coverage summary.

The UI now needs to expose those distinctions clearly.

## Goals

- Show mapping coverage in a clear, usable way.
- Let users focus on unresolved candidates and unknowns.
- Let users quickly apply candidate suggestions.
- Let users map or ignore unknown notes.
- Let users map ignored known percussion if important.
- Let users override/ignore auto-mapped rows.
- Keep ignored known percussion visible but low-priority.
- Preserve Phase 17L mapping semantics.

## Non-goals

- No atlas changes.
- No candidate auto-mapping.
- No aggressive mapping profile.
- No GPIF articulation resolver.
- No Generate behavior changes.
- No Preview changes.
- No tempo review.
- No full profile redesign.

## Scope

- Source Review Mapping Review UI.
- Source Review mapping row/view model helpers.
- Tests for classification/filter/action behavior.
- Documentation and evidence updates.

## Out of scope

- Backend mapping resolver changes, except small UI model helpers if needed.
- Full `/mapping` route redesign.
- Mapping profile management redesign.
