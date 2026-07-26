# OpenSpec Proposal — 17O Preview Timing Diagnostics

## Why

CHDG can generate drum charts where the mapped notes are correct but timing is wrong. This is especially common with songs containing tempo changes or GPIF/Guitar Pro sources whose note positions are usable but whose tempo data is missing, incomplete, or unreliable.

Without timing diagnostics, users must discover drift by listening and manually inspecting `notes.chart`. CHDG should make generated chart timing visible and explain likely causes before adding tempo editing/override tools.

## What changes

Add generated chart timing diagnostics to Preview and a concise timing summary to Generate.

The implementation will:

- parse generated `notes.chart` timing data;
- expose generated BPM events with tick/time/BPM;
- expose generated time signature events with tick/time/signature;
- expose generated section events with tick/time/name;
- expose note count and first/last note timing;
- diagnose missing, duplicate, invalid, unordered, and suspicious timing data;
- compare generated timing data against cached source analysis when available;
- show source comparison unavailable when cached analysis is missing;
- optionally make `chartWriter` output SyncTrack sorted by tick, TS before BPM on the same tick;
- add tests and evidence.

## Impact

Affected areas:

- generated chart parser / Preview data model;
- Preview UI;
- Generate summary/report;
- chart writer ordering, if implemented;
- tests.

This phase intentionally does not edit or fix tempo maps. It creates diagnostic visibility and prepares for future tempo override/editing work.

## Product decisions

- One BPM in a long song is info only.
- BPM jumps > 30 BPM are info.
- BPM jumps > 50 BPM are warning.
- Offset is an adjustment/info, not a warning.
- Preview does not automatically recalculate source analysis.
- Source comparison uses cached analysis only.
- Phase 17O compares ticks exactly and BPM within ±0.001.
- Manual tempo editing and audio beat detection are out of scope.

## Engram rule

OpenSpec is not the final source of truth. The first implementation task is to transfer this accepted OpenSpec into Engram. Engram is the project source of truth. Do not implement until Engram is aligned.
