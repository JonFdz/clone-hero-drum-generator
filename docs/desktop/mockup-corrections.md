# Mockup Corrections and Canonical Interpretation

The mockups are generated visual references. They define layout/style/product direction, but some labels in the images are not canonical. During implementation, follow the rules below whenever a mockup conflicts with product decisions.

## Global corrections

### `.chdg` is a project file, not generated output

Some mockups may visually imply that `.chdg` is generated as a final package artifact.

Canonical rule:

```txt
.chdg = CHDG project file
Clone Hero output = folder containing notes.chart, song.ini, song.ogg
```

Generation output previews should show:

```txt
notes.chart
song.ini
song.ogg
output folder
project saved/updated
```

Do not present `.chdg` as the Clone Hero song package.

### Source formats

Canonical supported source formats for the current roadmap:

```txt
.mid
.midi
.gp / GPIF
```

Do not promise support for:

```txt
.gp3
.gp4
.gp5
.gpx
YouTube
URL import
network import
```

unless a future phase explicitly implements them.

### Audio is required for Desktop Generate MVP

If a mockup implies that audio is optional, treat that as incorrect for the MVP.

Canonical rule:

```txt
Audio File is required for Desktop Generate MVP.
```

A future advanced mode may generate chart-only output, but that is not the core MVP.

### Demo metadata should be internally consistent

Some mockups contain mixed placeholder metadata. Implementation should use consistent demo/project values.

Prefer generic fictional metadata in UI examples, or use a single coherent local validation demo.

Avoid mixed examples such as:

```txt
Song: Eat My Dust
Artist: Weezer
Album: Blue Album
```

### Local-only workflow

If any mockup implies remote/network workflows, ignore that implication.

Canonical rule:

```txt
Local files only.
No uploads.
No URLs.
No scraping.
No YouTube import.
```

## Screen-specific corrections

### Home

If workflow step numbering appears inconsistent, use:

```txt
1 Import source
2 Inspect
3 Select track(s)
4 Generate
5 Validate
6 Preview
```

### Projects

Project source types should be limited to local supported source concepts:

```txt
MIDI
Guitar Pro / GPIF
Mixed
Draft / Unknown
```

Do not include YouTube/URL/local folder source types as core source kinds.

### New Project

Canonical labels:

```txt
Source File
Supports .mid, .midi, .gp

Audio File (Required)
Local audio file required

Output Folder
Project folder / output folder

Chart Offset (ms)
Stored in notes.chart Offset; note ticks are not moved
```

### Inspect Source

This screen should show structured inspection data:

```txt
source type
file path
resolution / PPQ
tempo count/map
time signatures
sections
total tracks
drum candidates
weak candidates
unknown notes/articulations
warnings
View JSON
```

### Track Selection

Multi-track selection is supported.

Canonical merge rules:

```txt
merge selected complementary tracks
deduplicate identical hits
open hi-hat wins over closed hi-hat
warn on impossible hand chords
preserve source timing
do not average velocity/timing unless explicitly specified later
```

If a mockup says "velocity and timing averaged", replace with:

```txt
Source timing preserved
```

or:

```txt
Conflicts reported
```

### Generate

Source file must be a symbolic chart source:

```txt
demo.gp
demo.mid
```

Audio file must be audio:

```txt
demo.mp3
demo.wav
```

Avoid showing an `.mp3` as the source file.

Generation steps should use symbolic wording:

```txt
Parse Source
Normalize Drums
Merge Selected Tracks
Write notes.chart
Write song.ini
Convert Audio to song.ogg
Finalize Package
```

Do not use wording like "enhancing drum frequencies" because CHDG is not doing audio enhancement.

### Validation

Validation checks the generated Clone Hero output folder.

Canonical summary:

```txt
Output Type: Clone Hero song folder
Files: notes.chart, song.ini, song.ogg
Project: .chdg
```

Validation should not imply `.chdg` is the output format.

Primary action:

```txt
Open Output Folder
```

Optional future action:

```txt
Open Preview
```

Do not make Moonscraper/external editor part of the core path.

### Preview

Canonical preview data source:

```txt
notes.chart + song.ogg
```

Offset wording should say:

```txt
Chart Offset
Positive values delay chart notes relative to audio
```

Avoid saying "audio is shifted" unless the implementation actually shifts audio, which is not planned.

State handling:

```txt
Preview Up To Date
Preview Modified
Unsaved Offset Changes
Needs Regenerate
Validation Outdated
```

Avoid contradictory simultaneous states such as "Preview Up To Date" and "Needs Regenerate" unless clearly scoped to different artifacts.

Actions should distinguish:

```txt
Apply to Preview
Save Offset
```

### Mapping Overrides

Mapping should avoid misleading lane/color labels unless they are guaranteed correct.

Prefer target labels like:

```txt
Snare
Closed Hi-Hat
Open Hi-Hat
Crash
Ride
Tom
Ignore
```

Sidestick handling should allow:

```txt
Map to Snare
Ignore
```

Optional future behavior can add a dedicated side-stick piece if needed.

### Settings

Settings should focus on CHDG needs:

```txt
Theme
Accent color
Project location
Default output folder
Default charter
Default offset
FFmpeg path
Detect FFmpeg from PATH
Test FFmpeg
Backend diagnostics
CLI JSON support
Project format .chdg
```

Avoid unrelated video export settings such as:

```txt
resolution
video bitrate
include preview audio
```
