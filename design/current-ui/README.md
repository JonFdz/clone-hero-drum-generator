# Current UI Baseline

**Status:** CURRENT evidence for Approval Checkpoint 1  
**Captured:** 2026-07-18  
**Runtime:** deterministic browser harness on `127.0.0.1:4200`  
**Harness UI:** hidden

The screenshots in this directory capture the current Angular desktop UI. They are evidence, not editable design source and not Design V1 proposals.

## Capture environment

- macOS development environment.
- The repository command was attempted with the pinned `pnpm@9.15.4`, but the repository Angular launcher could not spawn its child process in this agent environment (`EPERM`).
- The same Angular CLI invocation was run directly from `apps/desktop`; it bound successfully to `http://127.0.0.1:4200/`.
- The server remained operational despite environment-only `EMFILE: too many open files, watch` watcher warnings.
- Every required URL loaded directly, survived reload, retained its route and scenario, and reported no browser console warnings or errors during capture.
- `harnessUi=hidden` removed harness controls only. The in-application `Browser Harness · Mock Data` runtime status remains visible by design.

## Catalog and provenance

| Filename | Screen | Route | Scenario | Viewport | Direct load | Reload | Console | Known limitations |
|---|---|---|---|---:|---|---|---|---|
| `1440x900/home-empty.png` | Home / Empty | `/home` | `empty` | 1440 × 900 | Passed | Passed | Clean | Page scroll height is 913 px; the first viewport does not show the complete page. |
| `1440x900/project-details-loaded.png` | Project Details / Loaded | `/projects/details` | `project-loaded` | 1440 × 900 | Passed | Passed | Clean | Synthetic harness paths; page scroll height is 1539 px. |
| `1440x900/source-review-ready.png` | Source Review / Ready | `/source-review` | `source-review-ready` | 1440 × 900 | Passed | Passed | Clean | Continue action is below the first viewport; page scroll height is 1224 px. |
| `1440x900/source-review-attention.png` | Source Review / Attention | `/source-review` | `source-review-attention` | 1440 × 900 | Passed | Passed | Clean | Attention detail is below the first viewport; page scroll height is 1643 px. |
| `1440x900/generate-ready.png` | Generate / Ready | `/generate` | `generate-ready` | 1440 × 900 | Passed | Passed | Clean | Sticky action bar overlays the bottom edge of scrollable content. |
| `1440x900/generate-running.png` | Generate / Running | `/generate` | `generate-running` | 1440 × 900 | Passed | Passed | Clean | Deterministic seeded state; it does not execute a real package generation. |
| `1440x900/generate-failed.png` | Generate / Failed | `/generate` | `generate-failed` | 1440 × 900 | Passed | Passed | Clean | Deterministic synthetic failure; page scroll height is 1303 px. |
| `1440x900/preview-ready.png` | Preview / Ready | `/preview` | `preview-ready` | 1440 × 900 | Passed | Passed | Clean | Scenario contains chart timing data but no audio, waveform, chart-stage, or Highway view. |
| `1024x768/home-empty.png` | Home / Empty | `/home` | `empty` | 1024 × 768 | Passed | Passed | Clean | Fixed 260 px sidebar; page scroll height is 1789 px. |
| `1024x768/project-details-loaded.png` | Project Details / Loaded | `/projects/details` | `project-loaded` | 1024 × 768 | Passed | Passed | Clean | Top bar wraps to 124 px; page scroll height is 2250 px. |
| `1024x768/source-review-ready.png` | Source Review / Ready | `/source-review` | `source-review-ready` | 1024 × 768 | Passed | Passed | Clean | Top bar is 124 px; Continue action is near the bottom of a 1917 px page. |
| `1024x768/source-review-attention.png` | Source Review / Attention | `/source-review` | `source-review-attention` | 1024 × 768 | Passed | Passed | Clean | Attention detail is below the fold; Continue action is near the bottom of a 2493 px page. |
| `1024x768/generate-ready.png` | Generate / Ready | `/generate` | `generate-ready` | 1024 × 768 | Passed | Passed | Clean | Sticky action bar becomes 138 px high; page scroll height is 1828 px. |
| `1024x768/generate-running.png` | Generate / Running | `/generate` | `generate-running` | 1024 × 768 | Passed | Passed | Clean | Seeded progress; Open Output Folder remains enabled while generation is running. |
| `1024x768/generate-failed.png` | Generate / Failed | `/generate` | `generate-failed` | 1024 × 768 | Passed | Passed | Clean | Sticky action bar is 138 px high; page scroll height is 2156 px. |
| `1024x768/preview-ready.png` | Preview / Ready | `/preview` | `preview-ready` | 1024 × 768 | Passed | Passed | Clean | Timing-diagnostics fallback only; page scroll height is 910 px. |

## Privacy review

- No personal paths, private files, API keys, account data, or copyrighted media appear.
- Windows-like paths belong to deterministic harness fixtures.
- Screenshots were not cropped or retouched.

