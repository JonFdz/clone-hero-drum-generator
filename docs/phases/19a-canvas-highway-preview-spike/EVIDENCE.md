# Phase 19A — Canvas Highway Preview Spike Evidence

## Implemented

- Added an experimental Preview-owned Canvas 2D highway mode without replacing the existing 2D chart view.
- Kept the existing chart stage as the default Preview mode.
- Added pure highway timing, projection, and renderer modules under the Preview feature.
- Added an OnPush standalone `PreviewHighwayComponent` with:
  - one `<canvas>`;
  - DPR-aware sizing capped at 2x;
  - `ResizeObserver`-driven resize handling;
  - redraw-only animation based on existing Preview playback time;
  - RAF cleanup on destroy;
  - reduced-motion handling;
  - compact accessible summary text.
- Added in-memory Preview controls for:
  - visual mode switch (`Chart view` / `Highway (experimental)`);
  - highway speed preset (`Fast`, `Normal`, `Slow`);
  - HUD visibility toggle.
- Corrected reduced-motion behavior so playback-time updates no longer trigger continuous redraws while audio advances.
- Corrected timing validity so invalid mid-measure time-signature changes cut beat/measure and musical lines only from the first invalid tick onward.
- Corrected lane validation so only finite integer lanes `0..4` are accepted; fractional lanes are discarded.

## Architecture

### Angular ownership

- `/Users/jonfdz/Projects/clone-hero-drum-generator/apps/desktop/src/app/features/preview/components/preview-highway/preview-highway.component.ts`
  - owns canvas lifecycle, resize handling, RAF lifecycle, and frame preparation.
- `/Users/jonfdz/Projects/clone-hero-drum-generator/apps/desktop/src/app/features/preview/preview-page.component.ts`
  - owns feature-local mode/preset/HUD state and routes existing Preview playback/chart inputs into the highway component.

### Pure helpers

- `/Users/jonfdz/Projects/clone-hero-drum-generator/apps/desktop/src/app/features/preview/highway/highway-timing.ts`
  - timing map build, tick/seconds conversion, musical position, visible beat/measure lines.
- `/Users/jonfdz/Projects/clone-hero-drum-generator/apps/desktop/src/app/features/preview/highway/highway-projection.ts`
  - source-note adaptation, visible-window filtering, highway geometry, note/line projection.
- `/Users/jonfdz/Projects/clone-hero-drum-generator/apps/desktop/src/app/features/preview/highway/highway-renderer.ts`
  - imperative Canvas 2D draw order only.

## Known limitations

- The highway renders only the five generated Clone Hero lanes: kick, red, yellow, blue, green.
- No edit semantics were introduced.
- No project persistence was added for highway mode, HUD visibility, or speed presets.
- No new Electron main/preload IPC was added.
- No `packages/*` code was changed.
- Rich drum semantics such as sustain, cymbal/tom split overlays, accents, ghosts, and editing affordances remain out of scope for 19A.
- Manual desktop playback validation was not completed in this agent environment.

## Validation results

### Automated

- ✅ Focused highway follow-up tests
  - Result: `4 passed`, `21 passed`
- ✅ `node ./node_modules/vitest/vitest.mjs run` from `/Users/jonfdz/Projects/clone-hero-drum-generator/apps/desktop`
  - Result: `73 passed`, `365 passed`
- ✅ `node ./node_modules/vitest/vitest.mjs run` from repo root
  - Result: `113 passed`, `764 passed`
- ✅ `node ./node_modules/typescript/bin/tsc -p tsconfig.electron.json --noEmit`
- ✅ `node ./node_modules/@angular/cli/bin/ng.js build --configuration development`
- ✅ `node ./node_modules/@angular/cli/bin/ng.js build --configuration production`
- ✅ `node ./node_modules/eslint/bin/eslint.js .`
- ✅ `node scripts/check-architecture.mjs`

### Environment-specific command limitations

- ⚠️ `pnpm --filter @chdg/desktop lint`
  - In this environment, bundled `pnpm` aborted with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` while attempting a workspace install/modules purge step without a TTY.
  - Equivalent validation was run with the package-local ESLint bin instead.
- ⚠️ `pnpm --filter @chdg/desktop test`
  - In this environment, bundled `pnpm` aborted with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`.
  - Equivalent validation was run with the workspace-local Vitest entrypoint and bundled Node runtime instead.
- ⚠️ `pnpm --filter @chdg/desktop typecheck`
  - In this environment, bundled `pnpm` triggered an install/status path that failed with `ERR_PNPM_IGNORED_BUILDS`.
  - Equivalent validation was run with direct Angular development build + Electron TypeScript commands.
- ⚠️ `pnpm --filter @chdg/desktop build`
  - In this environment, bundled `pnpm` triggered an install/status path that failed with `ERR_PNPM_IGNORED_BUILDS`.
  - Equivalent validation was run with the direct Angular production build instead.
- ⚠️ `pnpm test`
  - In this environment, bundled `pnpm` triggered the same install/status path limitations instead of running the requested script directly.
  - Equivalent repo-root Vitest validation was run directly.

## Manual validation

- Not completed here.
- Specifically not claimed as passed:
  - playback / pause / seek visual validation in the desktop app;
  - reduced-motion preference verification in a live desktop session;
  - high-DPI visual inspection by eye;
  - “no active animation loops after navigation” manual app-level verification.

## Performance observations

- No third-party rendering dependency was introduced.
- The renderer filters visible notes and projects only the visible window per frame.
- The draw loop uses the existing Preview playback time as authority and does not accumulate song time from frames.
- A numeric FPS claim is intentionally not recorded here because no live desktop playtest measurement was completed in this environment.

## Deferred decisions for 19B+

- whether richer drum semantics need additional Preview payload data;
- whether section markers should be rendered inside the highway;
- whether dense patterns need adaptive decluttering;
- whether future editing phases need a different effective-note identity model than the render-only deterministic note id used here.
