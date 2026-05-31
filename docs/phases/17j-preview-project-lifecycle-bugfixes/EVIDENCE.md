# Evidence — Phase 17J

## Preview fallback bug

Observed behavior from Limerence project artifacts:

- ORG and new generated `notes.chart` are effectively equivalent for the reported case.
- ORG and new `song.ini` are equivalent.
- ORG and new `song.ogg` decode to equivalent PCM.
- The new `.chdg` contains `analysis.normalizationPreview` while the older project did not.

`normalizationPreview.firstHits` is only a small sample of the first hits. In current project code it is created from the first 10 merged hits:

```ts
firstHits: merged.hits.slice(0, 10).map(toHitPreview)
```

Using those 10 sample hits as a full preview timeline and scaling them across the whole audio duration creates misleading behavior.

## Product conclusion

Preview must not use `.chdg` analysis cache as playback/timing source. The `.chdg` analysis cache belongs to Source Review persistence.

Preview must use generated output only:

- `notes.chart`
- `song.ogg`

## Cover evidence

Current generated output includes chart/ini/audio but does not include project cover as `album.jpg`.

## Project lifecycle evidence

Current project file helpers create default project folders and default output folders from project paths, but a later project name change does not necessarily rename the folder/file.

Current deletion helper is conservative and deletes only the `.chdg` file. Reliability and user expectations around deleting managed project files/folders need tightening.
