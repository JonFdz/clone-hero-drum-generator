# Components — Phase 17N — GPIF Articulation Resolver

## Affected areas

Likely files:

```text
packages/guitarpro/src/inspectGpif.ts
packages/guitarpro/src/normalizeGpDrums.ts
packages/guitarpro/src/inspectGpif.test.ts
packages/guitarpro/src/normalizeGpDrums.test.ts
packages/project/src/types.ts
packages/project/src/normalizeSelection.ts
packages/project/src/generatePackage.ts
apps/desktop/src/app/services/source-review-model.ts
apps/desktop/src/app/pages/mapping/mapping-page.model.ts
```

Exact file names may differ; inspect the repo before editing.

## New or updated concepts

### GPIF articulation metadata

The resolver should consume available metadata such as:

```ts
type GpifArticulationMetadata = {
  id?: string;
  name?: string;
  inputMidiNumbers?: number[];
  outputMidiNumber?: number;
  element?: string;
  instrument?: string;
  trackName?: string;
};
```

Use repo-style naming and existing parsed structures where possible.

### GPIF articulation mapping result

Recommended semantics:

```ts
type GpifArticulationResolvedVia =
  | "override"
  | "output-midi-number"
  | "name-pattern"
  | "input-midi-number"
  | "atlas"
  | "conflict"
  | "unknown";

type GpifArticulationResolution = {
  sourceKind: "gpif";
  key: string;
  sourceValue: string;
  noteName?: string;
  inputMidiNumbers?: number[];
  outputMidiNumber?: number;
  resolvedVia: GpifArticulationResolvedVia;
  action: "map" | "candidate" | "ignore" | "unknown";
  automaticPiece?: DrumPiece;
  suggestedPiece?: DrumPiece;
  confidence: "high" | "medium" | "low";
  family?: string;
  reason: string;
};
```

The actual type names may differ, but the data should support these semantics.

## Resolver flow

### Step 1 — build stable GPIF key

Use the most stable available value:

```text
gpif:<track id>:<articulation id>
```

or fallback:

```text
gpif:<track index>:<normalized name>:<output midi>:<input midi list>
```

Avoid keys that change only because display labels change.

### Step 2 — apply project override

If the project has an override for the GPIF articulation key, piece override maps to that piece and ignore override skips the hit.

### Step 3 — resolve via OutputMidiNumber

If `outputMidiNumber` is present, resolve through the 17L MIDI Drum Note Atlas.

### Step 4 — resolve by controlled name pattern

If no usable output MIDI exists, use controlled name patterns documented in `GPIF_ARTICULATION_DECISIONS.md`.

### Step 5 — fallback via InputMidiNumbers

If no output/name resolution is possible and input midi numbers exist:

- If exactly one input MIDI maps safely via the 17L atlas, resolve with lower confidence.
- If multiple inputs disagree, produce candidate/review or unknown.
- Do not let non-GM input numbers become false unknown when name/output are available.
- Do not let input override valid output.

### Step 6 — conflict handling

If output and name imply different pieces/action classes, produce `candidate` or `unknown` depending on confidence and include a reason describing the conflict.

### Step 7 — emit rows and hits

Use the resolved action according to 17L semantics:

```text
map       -> create hit
candidate -> no hit by default
ignore    -> no hit
unknown   -> no hit
```

Overrides can convert candidate/ignore/unknown to a mapped piece.

## Source Review display

No large UI redesign is required. 17M already handles GPIF rows.

Ensure GPIF rows have useful primary label, meta label, current mapping label, reason, and confidence.
