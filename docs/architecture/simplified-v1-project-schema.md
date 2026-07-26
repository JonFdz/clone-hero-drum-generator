# Simplified V1 Project Schema Contract

## Folder

```text
<project-root>/<derived-name>/
├── project.chdg
├── assets/
│   ├── source.<original-extension>
│   ├── song.ogg
│   └── album.jpg                 # optional
└── recovery/
    └── previous.chdg             # after first replacement
```

## Path rules

- Internal paths are POSIX-style relative paths.
- Normalized paths must not escape project root.
- External export target may be absolute and machine-specific.
- Missing export target does not block open/edit.
- External original source/audio paths are not persisted as dependencies.

## Proposed contract

```ts
export type ChdgProjectFile = {
  schemaVersion: 1;
  appVersion?: string;

  project: {
    id: string;
    artist: string;
    songName: string;
    projectName: string;
    createdAt: string;
    updatedAt: string;
  };

  assets: {
    source: {
      relativePath: string;
      originalFileName: string;
      sourceKind: "midi" | "gpif";
      sha256: string;
      importedAt: string;
    };
    audio: {
      relativePath: "assets/song.ogg";
      sha256: string;
      durationMs?: number;
    };
    cover?: {
      relativePath: "assets/album.jpg";
      sha256: string;
    };
  };

  import: {
    selectedTrackIds: number[];
    sourceMappings: Record<string, SourceMappingDefinition>;
    importedAt: string;
    importerVersion: string;
  };

  chart: {
    resolution: number;
    tempos: TempoEvent[];
    timeSignatures: TimeSignatureEvent[];
    sections: SongSection[];
    hits: ImportedDrumHit[];
  };

  mappings: ProjectMappings;
  corrections: Record<string, NoteCorrection>;

  metadata: {
    album?: string;
    year?: string;
    genre?: string;
    charter?: string;
  };

  editor: {
    offsetMs: number;
  };

  export: {
    targetDirectory?: string;
    lastSuccessfulAt?: string;
    fingerprints?: {
      chart?: string;
      metadata?: string;
      audio?: string;
      cover?: string;
    };
    managedFiles?: Partial<Record<
      "notes.chart" | "song.ini" | "song.ogg" | "album.jpg",
      {
        sha256: string;
        sizeBytes: number;
        writtenAt: string;
      }
    >>;
  };
};
```

Derived display name is not independently authoritative:

```ts
`${artist} - ${songName} - ${projectName}`
```

## Folder-name sanitization

One shared function shall:

1. trim fields;
2. collapse whitespace;
3. reject empty identity;
4. replace control characters and `<>:"/\|?*` with `-`;
5. collapse separators;
6. trim trailing spaces/dots;
7. handle Windows reserved names;
8. enforce a conservative segment length;
9. preserve original identity in JSON;
10. show the final derived name before creation/rename.

Never silently append UUIDs or numeric suffixes. Collision requires a user-visible Project Name change.

## Validation

Identity:

- stable opaque/UUID project ID;
- mandatory non-empty identity.

Assets:

- source/audio required;
- referenced internal files exist on normal open;
- missing internal audio is a repair error;
- cover optional;
- hashes structurally valid.

Chart:

- positive resolution;
- tempo event at tick 0;
- finite non-negative ticks;
- unique hit IDs;
- mapping keys exist;
- corrections reference existing hit IDs;
- no correction timing/duration fields.

Mappings:

- valid interpretation pieces;
- valid lane/cymbal combination;
- unresolved mappings explicit.

Export:

- optional before first export;
- stale/missing target does not invalidate project;
- manifest values are structurally validated.

## Atomic save

1. Serialize canonical JSON.
2. Write `project.chdg.tmp`.
3. Flush/close.
4. Read and validate temp.
5. Replace `recovery/previous.chdg` from current valid project.
6. Atomically replace `project.chdg`.
7. clean stale temp.

Failure leaves the previous valid project intact.

## Save a Copy

Copy full folder to temporary destination, change identity, create new project ID, clear all export target/fingerprints/hashes/timestamp, retain base hits/mappings/corrections/assets/metadata/offset, validate, and commit the new folder atomically.

## Compatibility

Provisional pre-release files may return an explicit unsupported-format error. No migration layer is required.
