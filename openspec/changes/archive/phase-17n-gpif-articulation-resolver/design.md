# OpenSpec Design — Phase 17N — GPIF Articulation Resolver

## Core algorithm

```text
resolveGpifArticulation(articulation, overrides):
  if override exists:
    return override resolution

  outputResolution = resolveOutputMidiNumber(articulation.outputMidiNumber)
  nameResolution = resolveNamePattern(articulation.name)
  inputResolution = resolveInputMidiNumbers(articulation.inputMidiNumbers)

  if outputResolution and nameResolution conflict:
    return conflict candidate/review

  if outputResolution:
    return outputResolution

  if nameResolution:
    return nameResolution

  if inputResolution:
    return inputResolution with lower confidence

  return unknown
```

## Output MIDI resolution

Use Phase 17L atlas resolution exactly:

- `map` -> GPIF `map`
- `candidate` -> GPIF `candidate`
- `ignore` -> GPIF `ignore`
- `unknown` -> continue fallback or unknown

## Name resolution

Use only patterns documented in `GPIF_ARTICULATION_DECISIONS.md`.

Do not infer from generic names such as `bell`, `click`, `cymbal`, `tom`, `drum`, `percussion`, `effect`, or `noise` unless output MIDI or context disambiguates.

## Conflict handling

A conflict exists when output MIDI maps to one piece but name clearly implies another piece, or when output MIDI maps to one action class but name implies another.

Conflict result should be conservative:

```text
action: candidate
confidence: low
resolvedVia: conflict
reason: describes name/output mismatch
```

## Key fields

GPIF rows should include:

- `sourceKind: "gpif"`
- stable `key`
- `sourceValue`
- `noteName`
- `inputMidiNumbers`
- `outputMidiNumber`
- `resolvedVia`
- `action`
- `automaticPiece` or `suggestedPiece`
- `confidence`
- `reason`
- `count`
- `firstTick`

## Source Review behavior

Source Review should not require a UI redesign. It should display improved GPIF rows using existing 17M mapping row UI.

## Caching

If new resolution changes normalization output or mapping coverage, ensure source-review cache/fingerprint invalidates appropriately. Use a repo-consistent mechanism.

Suggested development version:

```text
gpifArticulationResolverVersion: 0.1.0
```

Do not use `1.0.0` yet.
