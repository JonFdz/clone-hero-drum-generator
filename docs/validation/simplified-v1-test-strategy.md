# Simplified V1 Test Strategy

## Pure domain

- schema and path validation;
- hit IDs;
- mapping resolution;
- correction precedence;
- target validation;
- accent/ghost;
- deterministic effective chart;
- multi-tempo;
- fingerprints.

## Filesystem integration

Temporary directories:

- transactional creation;
- source/audio/cover placement;
- atomic save/recovery;
- rename collision;
- Save a Copy;
- export staging/commit;
- unmanaged files;
- external managed-file changes;
- failure injection.

## Electron adapter

- payload/path validation;
- project ID resolution;
- progress listener lifecycle;
- typed errors;
- no arbitrary renderer writes.

## Angular

- route guards/redirects;
- creation validation;
- progress rendering;
- contextual header/tabs;
- note dialog/focus;
- unknown mapping flow;
- autosave states;
- export states.

## Harness

Deterministic 1440/1024 state coverage.

## Manual acceptance

Using licensed/local content only:

- create;
- delete/move originals;
- reopen;
- correct mapping/note;
- close/reopen;
- export;
- preserve manually added output files;
- verify multi-tempo synchronization.

## Synthetic regression fixtures

- simple one-tempo beat;
- two-tempo Decode-like timeline;
- unknown MIDI note;
- unknown GPIF articulation;
- multiple candidates;
- no recognized drum track;
- notes after audio;
- 50,000-hit chart;
- Ride → Green Cymbal;
- open/closed hi-hat with accent override.

## Performance

- no all-notes work per animation frame;
- time/lane indexing for hit testing;
- autosave outside playback hot path;
- renderer remains responsive for large fixture.
