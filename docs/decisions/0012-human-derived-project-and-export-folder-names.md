# ADR 0012: Human-Derived Project and Export Folder Names

## Status

Accepted.

## Decision

Artist, Song Name, and Project Name are mandatory. Display/project/default export folder:

```text
Artist - Song Name - Project Name
```

Internal file is always `project.chdg`.

No visible UUID or silent numeric suffix. Collision requires another Project Name. Identity changes rename transactionally.
