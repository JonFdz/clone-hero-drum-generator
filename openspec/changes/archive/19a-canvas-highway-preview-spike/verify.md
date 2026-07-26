# Verification — Canvas Highway Preview Spike

## Verification principle

This phase proves a renderer and timing projection. Passing tests alone are not enough; manual validation must show that visual behavior remains tied to the existing Preview clock and that the current Preview experience is not displaced.

## A. Automated verification

### A1. Pure timing tests

| Case | Setup | Expected result |
|---|---|---|
| Constant tempo | Resolution 192, 120 BPM at tick 0 | Tick 192 maps to 0.5 seconds; tick 384 maps to 1.0 second |
| Tempo boundary | 120 BPM at tick 0, 60 BPM at tick 384 | Conversion is continuous at tick 384 and uses correct rate after boundary |
| Tick round trip | Several ticks around tempo changes | `tick -> seconds -> tick` is within one tick after display rounding |
| Missing initial tempo | Tempo starts after tick 0 | Timing map reports unavailable for required earlier range; no fabricated tick HUD |
| Invalid tempo | BPM zero, negative or non-finite | Invalid event is rejected and limitation is exposed |
| 4/4 position | 192 resolution, TS 4/4 at tick 0 | tick 0 = measure 1 beat 1; tick 192 = measure 1 beat 2; tick 768 = measure 2 beat 1 |
| Legal meter change | New signature begins on measure boundary | Measure/beat continues deterministically |
| Invalid meter data | No TS at tick 0 or invalid denominator | Beat/measure unavailable; notes can still render |
| Line uniqueness | Beat and measure share tick | Only one `measure` line returned |
| Line cap | Extremely dense visible timing range | Output is bounded and deterministic |

### A2. Projection tests

| Case | Expected result |
|---|---|
| Five lane centers | Strict left-to-right ordering within road boundaries |
| Hit-line note | `deltaSeconds = 0` projects at hit line with maximum scale |
| Horizon note | `deltaSeconds = lookAhead` projects at horizon with minimum scale |
| Out-of-window note | Not returned for drawing |
| Fast/Normal/Slow presets | Same note has expected relative depth by preset |
| Chord | Same-time notes retain separate lanes and stable order |
| Determinism | Equivalent input produces equal projected output |

### A3. Component lifecycle tests

| Case | Expected result |
|---|---|
| Default Preview state | Existing chart view is selected; Canvas loop is not running |
| Activate highway | Canvas receives current Preview state and schedules redraw |
| Pause and seek | Next rendered snapshot reflects supplied time without internal time drift |
| Resize | Backing store equals CSS size multiplied by capped DPR |
| High DPR | DPR is capped at 2 and geometry still uses CSS pixels |
| Destroy | Pending RAF is cancelled and ResizeObserver is disconnected |
| Reduced motion | No continuous RAF loop is retained |
| Incomplete timing | Accessible limitation summary appears; notes remain visible from seconds |

## B. Manual verification

Use only safe local material or synthetic fixtures. Do not commit music, commercial chart files or audio.

### B1. Entry and coexistence

1. Open a generated project with audio and a chart.
2. Enter Preview in the normal 2D chart view.
3. Verify waveform, sections, offset controls and timing diagnostics still appear.
4. Switch to Highway (experimental).
5. Verify audio position and play/pause state did not reset.
6. Switch back and verify the normal chart is unchanged.

### B2. Playback synchronization

1. Start playback from a known beat.
2. Observe at least ten note arrivals at the hit line.
3. Pause while notes are in motion; verify the road freezes at the supplied playback position.
4. Seek forward and backward repeatedly; verify notes jump directly to the correct positions without visible catch-up drift.
5. Change speed preset; verify only visual distance/speed changes, never audio speed or current time.

### B3. Musical HUD and lines

1. Use a synthetic fixture with known 4/4 timing and 120 BPM.
2. Check HUD values at tick 0, one beat, one measure and the next measure.
3. Verify thin beat lines and stronger measure lines align with those positions.
4. Use a fixture with a legal tempo change; verify note positions remain continuous at the change.
5. Use incomplete timing data; verify unavailable HUD fields use an explicit placeholder and no false measure lines appear.

### B4. Visual and resize behavior

1. Resize Preview from a compact desktop pane to a wide pane.
2. Verify road remains centered, five lanes stay readable and notes remain crisp.
3. Test at normal scaling and a high-DPI display/scaling mode when available.
4. Confirm no blurry Canvas output after resizing.
5. Confirm road/notes become a compact limitation state instead of collapsing into unreadable geometry when the container is very small.

### B5. Reduced motion and accessibility

1. Enable reduced-motion preference if available.
2. Open highway mode while playback state changes.
3. Verify the mode remains understandable without continuous visual motion.
4. Confirm the accessible summary reports mode and available musical position without spamming changes.
5. Confirm current 2D view remains available as the non-canvas information surface.

## C. Performance evidence

Record the following in an evidence file:

- OS and display scaling used for manual validation;
- size of the Canvas viewport;
- selected highway speed preset;
- approximate note density of the tested local chart or synthetic fixture;
- observed median and worst visible behavior during playback/seek;
- whether input, playback or resizing stutter was observed;
- known limitations or open questions.

Do not claim a target FPS unless it was measured. Do not record copyrighted source material in the repository.

## D. Quality gates

Run and report the exact outcome of:

```bash
pnpm --filter @chdg/desktop lint
pnpm --filter @chdg/desktop check:architecture
pnpm --filter @chdg/desktop test
pnpm --filter @chdg/desktop typecheck
pnpm --filter @chdg/desktop build
pnpm test
```

If an environment limitation prevents a command, document:

1. exact command;
2. exact observed failure/limitation;
3. why it appears environment-specific or code-specific;
4. what other evidence was completed;
5. why the result must not be interpreted as a successful pass.
