# Simplified V1 D2 four-anchor visual comparison

The first D2 visual direction was rejected. These four `1440 × 900` anchors
provide a focused replacement direction for maintainer review before any
propagation.

## Review status

- **Structural 1440 inventory:** complete, 43 frames preserved.
- **First visual checkpoint/direction:** rejected.
- **Four-anchor remediation:** complete and awaiting maintainer visual review.
- **Remaining propagation:** 39 frames not started.
- **1024 × 768 adaptation:** not started.
- **Issue #98:** incomplete.
- **PR #116:** draft.

## Evidence key

| Classification | Meaning |
|---|---|
| **Original approved mockup** | One of the ten repository PNGs; visual reference only. |
| **Maintainer-provided visual benchmark** | External composition/density benchmark; never behavioral authority. |
| **OpenSpec-approved behavior** | Product requirements and acceptance criteria. |
| **Design proposal** | Visual or interaction treatment awaiting approval. |
| **Backend-dependent state** | Runtime evidence supplied by later implementation. |
| **Unresolved** | Intentionally deferred decision. |

The shared benchmark is
`design/references/maintainer-visual-feedback/2026-07-26-d2-visual-direction-benchmark.png`
(SHA-256
`4a9c83503807fbdc567fc12c91b145e89ef1b608fb6886edd6768df5845feef3`).
It appears uncropped in Pencil section `tkFJf`.

## Pencil metadata limitation

The four stable anchors were not replaced, duplicated, recreated, or detached.
Pencil MCP persisted their current `context` values but could not safely
replace existing legacy `metadata` in place. Complete metadata cleanup is
deferred Pencil tooling debt, not a blocker.

Authority precedence is:

1. **OpenSpec-approved behavior**;
2. **D1-approved IA**;
3. current Pencil `context`;
4. current Markdown taxonomy;
5. legacy Pencil `metadata`, historical only and ignored on conflict.

| Stable ID | Authoritative `context` | Conflicting legacy `metadata` | Why ignored | Benchmark/reference evidence | Review |
|---|---|---|---|---|---|
| `DQOkV` | `Design proposal — visual treatment awaiting maintainer review` | `interaction proposal` | Legacy terminology omits whole-treatment review status. | Maintainer benchmark; `01-home-recent.png` indirectly supports the shell. | Awaiting maintainer visual review |
| `qOC3b` | `Design proposal + Backend-dependent state — visual treatment awaiting maintainer review` | `backend-dependent` | Runtime classification alone does not classify the proposed visual treatment. | Maintainer benchmark; no original approved high-fidelity Settings mockup. | Awaiting maintainer visual review |
| `FSmVJ` | `Design proposal + OpenSpec-approved behavior — visual treatment awaiting maintainer review` | `product-approved` | Approved behavior does not approve the visual composition. | Maintainer benchmark; original approved `02-create-project-details.png`. | Awaiting maintainer visual review |
| `JMKSM` | `Design proposal + OpenSpec-approved behavior + Backend-dependent state — visual treatment awaiting maintainer review` | `product-approved + interaction proposal` | Compound legacy wording can overclaim approval. | Maintainer benchmark; original approved `05-editor-preview.png`. | Awaiting maintainer visual review |

## Anchor comparison

| Route/state | Corresponding reference | Previous D2 frame | New anchor | Shortcomings corrected | Intentional differences | Reusable decisions |
|---|---|---|---|---|---|---|
| Projects populated | `01-home-recent.png` indirectly for the app/library shell; shared maintainer benchmark | `pfAoW` | `DQOkV` | Replaces sparse, generic list treatment with strong library hierarchy, project/cover identity, status-rich rows, search focus, and one dominant action. | Projects is a dedicated library view rather than a duplicate of Home recent projects. Search/status presentation remains a **Design proposal**. | Minimal application header, generous route title hierarchy, differentiated project rows, subordinate local metrics. |
| Settings blocking error | No original approved high-fidelity repository mockup; shared maintainer benchmark | `DNQBe` | `qOC3b` | Replaces generic error treatment with one unmistakable blocking surface, two readiness failures, explicit impact/recovery, and a sole Recheck action. | Exact validation detail is not copied from the benchmark. **OpenSpec-approved behavior** and D1 own the state; diagnostic results are **Backend-dependent**. | One dominant recovery action, no cloud fallback, strong semantic error hierarchy, compact support evidence. |
| Create Project Details filled/valid | `02-create-project-details.png`; shared maintainer benchmark | `dkxQL` | `FSmVJ` | Adds production density and grouping for source/audio/cover, required identity, optional metadata, location, and portable-folder preview. | Uses exact approved identity/folder rules instead of generated-reference copy; optional export-default presentation remains bounded by product approval. | Two-column task composition, visible step ownership, derived-name preview, one dominant Next action. |
| Editor Preview ready | `05-editor-preview.png`; shared maintainer benchmark | `Tr58P` | `JMKSM` | Replaces placeholder-like preview regions with a detailed waveform and convincing perspective Highway, while strengthening project identity, transport/time, sections, lanes, notes, receptors, and save state. | Keeps diagnostics deliberately compact and omits chart-authoring controls prohibited by V1. Exact diagnostic copy is a **Design proposal** or **Backend-dependent state**. | Compact active-project header, waveform/Highway dominance, five-lane drum language, one dominant Export action, subordinate diagnostics. |

## Pencil evidence

| Evidence | Value |
|---|---|
| Section | `tkFJf` — `13 / SIMPLIFIED V1 / D2 / VISUAL DIRECTION REVIEW` |
| Projects anchor | `DQOkV` |
| Settings anchor | `qOC3b` |
| Details anchor | `FSmVJ` |
| Editor anchor | `JMKSM` |
| Starting Pencil SHA-256 | `7f5a77a22b0a76055c71edfdf59b485c5b6724ac3f369f9bdd03ea4b166d2a73` |
| Final Pencil SHA-256 | `1640747129decbc2511cdcffe2d1a6be179ed07b3ebf1b6566736904ababcb87` |
| Final save/reopen | Confirmed in the issue #98 worktree |
| Final section layout | Section `tkFJf`, depth-6 `problemsOnly`: no problems |
| Comparison connection | Exact uncropped benchmark and all four anchors remain connected in `tkFJf` |
| Component references | `zKiov` valid in Projects/Settings/Details; `mQo0l` valid in Editor |
| Anchor preservation | No frame recreated, duplicated, detached, or replaced |

## Review request

Review the four anchors as a direction system, not as completed propagation.
Approval permits planning the remaining 39 `1440 × 900` remediations. It does
not approve or start the final `1024 × 768` adaptation.
