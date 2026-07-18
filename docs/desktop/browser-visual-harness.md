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

Production and harness artifacts are deliberately separate:

| Build | Entry point | Output |
|---|---|---|
| `pnpm --filter @chdg/desktop build` | `src/main.ts` | `apps/desktop/dist/renderer/browser/` |
| `pnpm --filter @chdg/desktop build:browser` | `src/browser-harness/main.browser.ts` | `apps/desktop/dist/browser-harness/browser/` |

Running `build:browser` after the production build does not modify the renderer loaded by Electron.

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

Deterministic safe operations include runtime/status reads, settings reads and in-memory writes, recent-project reads, and in-memory mapping-profile operations.

Scenario-owned interactive operations enforce the following narrow contract:

- Source inspection, fingerprinting, and normalization accept only the scenario's synthetic source path.
- Source inspection accepts only the scenario track when a track is requested and does not represent `drumsOnly=false`.
- Normalization accepts exactly the scenario-selected tracks and mapping overrides. Changing either rejects instead of returning unrelated static data.
- `preview-ready` chart and audio requests must use the scenario output, `notes.chart`, and `song.ogg` paths. Chart data is returned in memory; audio remains explicitly unavailable.
- Project-backed scenarios support in-memory autosave when project name, project file, source, audio, and output identity still match the active fixture. Metadata, analysis, generation status, offset, and output-state mutations may be saved in memory. Stateless scenarios and identity changes reject.

No supported interaction reads or writes a file. Input combinations outside this contract reject with `BrowserHarnessError` rather than returning misleading fixture data.

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
- Only the `browser-harness` Angular configuration uses `main.browser.ts`, and it writes outside `dist/renderer`.
- Electron continues to load only `dist/renderer/browser/index.html`.
- The architecture gate resolves module imports and rejects imports into `browser-harness/` from production `src/main.ts` or any file under `src/app/`.
- Harness chrome is attached by browser startup code and is absent from production `AppComponent` markup.

The repository does not disable Angular caching globally. In the supported macOS agent environment, Angular 19.2.26 aborts with exit code 134 immediately after `Building...` when its local persistent cache opens. A repository-owned Node wrapper runs the affected Angular commands and sets `CI=1` only in the Angular CLI child-process environment. It preserves existing environment variables, resolves Angular CLI from the repository installation, and does not require a global `ng` installation.

The wrapper invokes the current Node executable with an argument array, inherited standard streams, and `shell: false`. This avoids POSIX-only package-script environment assignment and is designed for Windows, macOS, and Linux without Bash, Zsh, PowerShell, or `cmd.exe` mediation. **Validated on macOS; Windows and Linux execution not performed in this PR.** Electron compilation and other repository commands are unaffected. Build isolation still comes from distinct output paths, not cache behavior.

## Troubleshooting

| Symptom | Check |
|---|---|
| Unknown-scenario error | Use an ID from the scenario table exactly. |
| Invalid `harnessUi` error | Use `visible`, `hidden`, or omit it. |
| Duplicate bridge error | Do not load the harness entry in an Electron/preload page. |
| Backend unavailable | Confirm the URL is served by `dev:browser` and inspect the first startup error in the console. |
| Route becomes Home | Confirm the path matches a route in `app.routes.ts`; keep `scenario` in the query string. |
