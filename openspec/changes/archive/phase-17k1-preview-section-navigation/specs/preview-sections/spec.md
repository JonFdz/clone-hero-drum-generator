# Spec — Preview Section Navigation

## ADDED Requirements

### Requirement: Preview parses generated chart sections

Preview SHALL parse generated `notes.chart` `[Events]` section markers into chart preview data.

#### Scenario: Parse section event

Given generated `notes.chart` contains:

```chart
30720 = E "section Verse 1"
```

When Preview loads chart data  
Then `ChartPreviewData.sectionEvents` contains a section named `Verse 1` at tick `30720`.

#### Scenario: Ignore non-section events

Given generated `notes.chart` contains non-section events  
When Preview loads chart data  
Then those events are not added to `sectionEvents`.

### Requirement: Preview shows current section only when sections exist

Preview SHALL show section navigation UI only when generated chart section events exist.

#### Scenario: Chart has sections

Given generated chart preview data has one or more section events  
When Preview is open  
Then Preview shows a compact section navigation overlay.

#### Scenario: Chart has no sections

Given generated chart preview data has no section events  
When Preview is open  
Then Preview does not show section navigation UI.

### Requirement: Preview derives current section using preview offset

Preview SHALL derive the current section using generated section seconds plus `previewOffsetMs`.

#### Scenario: Offset shifts section effective time

Given a section has `seconds = 30`  
And `previewOffsetMs = 250`  
When playback time is `30.1` seconds  
Then the section is not yet current  
When playback time is `30.25` seconds  
Then the section is current.

### Requirement: Preview can jump between sections

Preview SHALL allow jumping to previous, next, and selected sections.

#### Scenario: Jump to section

Given a section has `seconds = 72.6`  
And `previewOffsetMs = 250`  
When the user selects that section  
Then Preview seeks to `72.85` seconds.

### Requirement: Repeated section names are disambiguated in UI

Preview SHALL disambiguate repeated section names in UI labels without modifying the underlying generated chart section name.

#### Scenario: Repeated section names

Given generated chart sections are named `Chorus`, `Chorus`, and `Chorus`  
When Preview builds section dropdown labels  
Then the labels are `Chorus`, `Chorus 2`, and `Chorus 3`.

### Requirement: Preview preserves playback state when jumping

Preview SHALL preserve playback state when seeking to a section.

#### Scenario: Jump while paused

Given Preview audio is paused  
When the user jumps to a section  
Then audio remains paused.

#### Scenario: Jump while playing

Given Preview audio is playing  
When the user jumps to a section  
Then audio continues playing.
