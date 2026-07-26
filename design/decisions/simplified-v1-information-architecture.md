# Simplified V1 information architecture

Issue #94 defines the D1 structural model for the approved Simplified V1. It
replaces the earlier workflow-first IA for current product work while retaining
that material as historical design evidence.

## Review path

1. Inspect `08 / SIMPLIFIED V1 / IA` in `design/chdg-ui.pen`.
2. Verify navigation and state ownership in
   `10 / SIMPLIFIED V1 / ROUTE AND STATE MAP`.
3. Review component classifications in
   `09 / SIMPLIFIED V1 / STRUCTURAL COMPONENTS`.
4. Confirm open implementation dependencies before starting D2.

## Decision

```text
Home
  → Create Project
      → Project Details
      → Track & Mapping
      → Creating Project
  → Editor
      → Preview
      → Mappings
      → contextual Project Details
      → contextual Edit Note
      → contextual Export
```

**Evidence: OpenSpec-confirmed.**

The application has no permanent sidebar. Home, Projects, and Settings are
application-level destinations. Preview and Mappings are the only permanent
active-project tabs. Project Details, Edit Note, Export, Save a Copy, and
exceptional lifecycle actions are contextual surfaces.

## Supersession

The earlier Details → Source Review → Generate → Preview model is superseded.
Its Pencil frames and records remain unchanged as historical evidence.

The following are not visible destinations:

- Inspect Source;
- Source Review;
- Normalize;
- Generate;
- Validate.

GP/MIDI and original audio are import inputs only. After creation, the portable
CHDG project folder is the source of truth. The Editor works before first
export.

**Evidence: OpenSpec-confirmed.**

## Route and surface inventory

| Type | Inventory | Evidence |
|---|---|---|
| Application routes | Home, Projects, Settings | OpenSpec-confirmed |
| Creation task | Project Details → Track & Mapping → Creating Project | OpenSpec-confirmed |
| Project routes | Editor / Preview, Editor / Mappings | OpenSpec-confirmed |
| Contextual surfaces | Project Details, Edit Note, Export, Save a Copy | OpenSpec-confirmed |
| Exceptional states | creation failure, save failure, export failure, destination ambiguity, managed-file conflict | Backend-dependent state |
| Advisory states | unknown mapping, track alternatives, duration mismatch | OpenSpec-confirmed structure; backend-dependent signals |

## Navigation ownership

| Owner | Responsibility | Evidence |
|---|---|---|
| Application header | CHDG identity and access to Home, Projects, Settings | OpenSpec-confirmed |
| Active-project header | return to application context, cover/identity, save state, Preview/Mappings, Undo/Redo, Export/Update, details entry, overflow | OpenSpec-confirmed |
| Creation task header | two-step position, Back/Cancel, one dominant forward action | OpenSpec-confirmed; placement is an Interaction proposal |
| Contextual surface | Apply/Cancel, Done, or recovery actions for one bounded task | OpenSpec-confirmed |
| Project overflow | Save a Copy and rare lifecycle actions | Interaction proposal |

Project switching belongs to Home/Projects. A user returns from an active
project through the compact active-project header. No second hierarchy, wide
rail, or disguised sidebar is introduced.

## Create Project

### Project Details

- source GP/MIDI;
- audio;
- optional cover;
- mandatory Artist, Song Name, and Project Name;
- optional metadata;
- derived `Artist - Song Name - Project Name`;
- default output root;
- Next as the dominant action.

### Track & Mapping

- recommended drum track selected automatically;
- arbitrary manual track selection remains available;
- additional tracks remain under an advanced disclosure;
- mapping rows preserve `source → musical piece → Clone Hero target`;
- defaults normally require no action;
- unknowns are advisory and editable;
- Create Project is dominant.

Creating Project uses discrete, real backend step names. It shows completed,
active, pending, and failed steps without invented percentages. Navigation is
restricted only while the atomic task is active. Success opens Editor / Preview;
failure preserves progress and offers an actionable recovery.

Contract-backed creation steps:

```text
validate-inputs
read-source
extract-drum-track
materialize-project-chart
archive-source
convert-audio
prepare-cover
write-project
finalize-project
```

**Evidence: OpenSpec-confirmed step identifiers; lifecycle status, results, and
retry behavior are Backend-dependent states.**

## Editor

The waveform and Highway receive most usable space. The active-project header
owns project identity and Saving, Saved, or Save failed state. Preview and
Mappings remain understandable without another navigation layer.

Preview includes transport, waveform, sections, offset, Highway, note
selection, warnings, and compact secondary diagnostics. It does not become a
full authoring grid and does not expose note movement, addition, duration, tick,
or tempo controls.

Edit Note supports musical piece, Clone Hero target/lane, tom/cymbal,
open/closed hi-hat, accent, ghost, delete/restore, provenance, and Apply/Cancel.

Mappings communicates source identity, detected/effective musical piece, Clone
Hero target/color, note count, and default/override/attention state. Unknown
resolution follows:

1. choose musical piece;
2. CHDG proposes a target;
3. optionally change the target.

Individual note corrections take precedence and are never overwritten by
mapping changes.

**Evidence: OpenSpec-confirmed.**

## Project Details and export

Project Details is contextual. It covers identity, optional metadata, cover,
default export destination, derived name, rename/collision state, Apply/Cancel,
and the relationship to Save a Copy.

Export is an Editor action and distinguishes first Export from Update Song. It
summarizes managed files, preserved unmanaged files, ambiguous destinations,
and externally modified managed files. Success explicitly reports updated,
unchanged, and removed managed files plus preserved unmanaged files.

Contract-backed export steps:

```text
validate-project
materialize-effective-chart
prepare-chart
prepare-metadata
prepare-audio
prepare-cover
stage-output
commit-output
record-export-state
```

The atomic update never leaves a partial managed result. Done returns to Editor.

**Evidence: OpenSpec-confirmed step identifiers and safety; lifecycle status,
results, filesystem failure detail, and retry contracts are Backend-dependent
states.**

## Structural strategies

### 1440

- minimal application chrome;
- compact active-project header;
- full-width waveform/Highway working region;
- contextual panels instead of persistent secondary columns;
- limited persistent vertical layers;
- one dominant action per context;
- diagnostics through secondary disclosure.

### 1024

- no sidebar or second project rail;
- compact project header and legible Preview/Mappings;
- usable Highway width and height;
- contextual surfaces may overlay, temporarily dock, or become dialogs;
- secondary diagnostics collapse;
- creation becomes one primary column where needed;
- mappings remain scannable;
- sticky actions do not cover content;
- no horizontal page overflow;
- one primary scrolling region.

**Evidence: OpenSpec-confirmed constraints; exact panel mode is an Interaction
proposal for D2 validation.**

## Interaction proposals

- Projects uses compact search and sorting.
- Project overflow contains Save a Copy and exceptional lifecycle actions.
- Contextual surfaces choose overlay, temporary dock, or dialog based on
  viewport and task risk.
- Advanced additional-track selection is disclosed beneath the recommended and
  manual track choices.
- Secondary diagnostics remain collapsed by default.

These are proposals, not implemented behavior.

## Backend-dependent states

- creation and export lifecycle status/results around the contracted step IDs;
- track recommendation reasons and confidence signals;
- audio/chart duration tolerance and severity;
- autosave trigger, debounce, retry, and dirty-state behavior;
- rename preflight and collision detail;
- filesystem error detail and managed-file conflict recovery.

## Unresolved for D2 or implementation

- exact Projects filters and missing-project recovery copy;
- final 1024 mode for each contextual surface;
- keyboard focus order and shortcuts;
- final compact density and truncation rules;
- exact Save a Copy placement inside the overflow/details relationship;
- final collision, retry, and duration-warning language.

No unresolved item changes the approved route or ownership model.

## Non-goals

D1 does not deliver final high-fidelity screens, production UI, new backend
behavior, or Milestone 2 updated-source flows.
