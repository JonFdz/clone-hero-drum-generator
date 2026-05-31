# Evidence — Phase 17K.1

## Discovery

After Phase 17K, generated GPIF charts can contain correctly positioned section events such as:

```chart
0 = E "section Intro"
30720 = E "section Verse 1"
184320 = E "section Break"
353280 = E "section Solo"
414720 = E "section Bridge"
```

Preview currently parses generated notes and tempo data but does not parse generated chart sections.

## User need

When validating generated charts, the user wants to know where they are in the song and jump quickly between song parts.

## Expected Preview behavior

If generated `notes.chart` has section events, Preview should show a compact section overlay and allow section jumps.

If generated `notes.chart` has no section events, Preview should remain unchanged and not show section UI.
