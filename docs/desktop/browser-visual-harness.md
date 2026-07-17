# Validate CHDG Desktop in a browser

The browser visual harness runs the real Angular renderer with deterministic synthetic data. It never launches Electron, opens native file pickers, or reads fixture paths from disk.

## Quick path

1. Start the loopback-only server:

   ```bash
   pnpm --filter @chdg/desktop dev:browser
   ```

2. Open a canonical URL from the table below.
3. Reload the URL and verify the route, scenario indicator, runtime status, console, and responsive layout.

Build the harness without serving it:

```bash
pnpm --filter @chdg/desktop build:browser
```

The development server is fixed to `http://127.0.0.1:4200`.

## Scenarios

| Scenario | Canonical URL | Expected state |
|---|---|---|
| `empty` | `/home?scenario=empty` | Healthy mock runtime with no active project or recents. |
| `project-loaded` | `/projects/details?scenario=project-loaded` | Synthetic project metadata and paths. |
| `source-review-ready` | `/source-review?scenario=source-review-ready` | Selected drum track and normalized mapping ready to continue. |
| `source-review-attention` | `/source-review?scenario=source-review-attention` | One synthetic unknown MIDI mapping warning. |
| `generate-ready` | `/generate?scenario=generate-ready` | Complete generation inputs without starting generation. |
| `generate-running` | `/generate?scenario=generate-running` | Stable running status and deterministic logs; no process runs. |
| `generate-failed` | `/generate?scenario=generate-failed` | Stable failure status and related deterministic log evidence. |
| `preview-ready` | `/preview?scenario=preview-ready` | Synthetic chart timing and notes; audio is honestly unavailable. |

Prefix each path with `http://127.0.0.1:4200`.

Use `harnessUi=hidden` for clean screenshots:

```text
http://127.0.0.1:4200/preview?scenario=preview-ready&harnessUi=hidden
```

This hides only the fixed harness indicator. Mock bridge behavior and application-state seeding remain active. `harnessUi` accepts only `visible` or `hidden`; other values stop startup with a `BrowserHarnessError`.

## Safe fixture policy

- All fixture values live under `apps/desktop/src/browser-harness/`.
- Paths use the synthetic `C:\CHDG-Harness\...` namespace for display only.
- The browser bridge performs no filesystem, Electron IPC, native dialog, or production-process calls.
- No personal paths, commercial media, or local project data belong in a scenario.
- Unknown scenario identifiers fail explicitly and list the supported identifiers.

## Bridge behavior

The harness installs a complete `NonNullable<Window["chdg"]>` before Angular bootstraps. Angular continues to access it only through `DesktopBridgeService`.

Deterministic safe operations include runtime/status reads, settings reads and in-memory writes, recent-project reads, in-memory mapping-profile operations, scenario-owned inspection/normalization responses, chart-preview reads, and in-memory project autosave. Autosave does not write a file.

Other operations reject with a message such as:

```text
BrowserHarnessError: operation "pickSourceFile" is unsupported in scenario "preview-ready"
```

The error always identifies the operation and active scenario.

## Agent validation checklist

For every relevant URL:

1. Open the full URL directly, then reload it.
2. Confirm the requested Angular route remains active.
3. Confirm `Browser Harness · Mock Data` appears in runtime status.
4. Confirm the fixed indicator names the selected scenario unless hidden.
5. Compare visible content with the approved design reference.
6. Inspect the browser console for unexpected errors.
7. Check an ordinary desktop viewport and a narrow desktop viewport.
8. Confirm no native picker appears and no real generation or filesystem operation runs.

## Add a scenario

1. Add a stable ID to `BROWSER_SCENARIO_IDS` in `scenario-registry.ts`.
2. Add one coherent `BrowserHarnessScenario` definition with a recommended route.
3. Reuse or extend typed builders in `fixture-builders.ts`; never add real paths.
4. Add only the bridge responses required by that state. Unsupported operations must continue to reject.
5. Seed project state through `ProjectSessionStore` and `ProjectWorkflowHydrator`, or add a narrow browser-only seeder when public feature APIs are insufficient.
6. Add focused registry, bridge, and state tests before implementation.
7. Document the canonical URL and validate direct load plus reload.

## Production isolation

- `apps/desktop/src/main.ts` remains the normal Electron renderer entry.
- `apps/desktop/electron/preload.cts` remains the production source of `window.chdg`.
- Only the `browser-harness` Angular configuration uses `main.browser.ts`.
- The architecture gate rejects imports of `browser-harness/` from production `main.ts`.
- Harness chrome is attached by browser startup code and is absent from production `AppComponent` markup.

## Troubleshooting

| Symptom | Check |
|---|---|
| Unknown-scenario error | Use an ID from the scenario table exactly. |
| Invalid `harnessUi` error | Use `visible`, `hidden`, or omit it. |
| Duplicate bridge error | Do not load the harness entry in an Electron/preload page. |
| Backend unavailable | Confirm the URL is served by `dev:browser` and inspect the first startup error in the console. |
| Route becomes Home | Confirm the path matches a route in `app.routes.ts`; keep `scenario` in the query string. |
