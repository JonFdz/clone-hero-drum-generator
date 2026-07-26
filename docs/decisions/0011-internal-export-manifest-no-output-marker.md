# ADR 0011: Keep Export Ownership Inside `project.chdg`

## Status

Accepted.

## Decision

Do not write `.chdg-project.json` or another output marker. Persist target, fingerprints, managed-file hashes, and last-export state in the project.

## Safety

- first export to existing destination asks confirmation;
- external changes to managed files ask confirmation;
- unknown files are preserved;
- export stages and commits atomically.

## Accepted limitation

Arbitrarily copied/renamed output ownership cannot be proven without an external marker. Ambiguity is handled through confirmation.
