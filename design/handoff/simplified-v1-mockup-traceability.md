# Simplified V1 mockup traceability

The ten approved PNGs are conceptual references. They were not edited,
regenerated, cropped, recolored, or promoted above the accepted OpenSpec.

## Traceability

| Mockup | D1 use | Contract correction or boundary |
|---|---|---|
| `01-home-recent.png` | Home recent-project hierarchy | Application access is Home/Projects/Settings without a sidebar. |
| `02-create-project-details.png` | Step 1 grouping and dominant Next action | Artist, Song Name, and Project Name are mandatory; derived name is explicit. |
| `03-create-project-track-mapping.png` | recommendation and compact mapping structure | Arbitrary manual selection remains possible; source, piece, and target stay distinct. |
| `04-creating-project-progress.png` | discrete progress hierarchy | D1 uses real backend step names and no invented percentage or old Source Review pipeline. |
| `05-editor-preview.png` | waveform/Highway dominance | Editor works before export; Preview/Mappings are the only permanent project tabs. |
| `06-edit-note-dialog.png` | contextual editing surface | No position, tick, duration, add, move, copy/paste, batch, or Expert+ controls. |
| `07-editor-mappings.png` | two-level mapping rows | Individual note corrections take precedence and are not overwritten. |
| `08-project-details-panel.png` | contextual details treatment | Project Details is not a tab; rename/collision and Save a Copy relationship are required. |
| `09-export-success.png` | success summary and return | Export is contextual; Done returns to Editor and no Generate route exists. |
| `10-import-updated-source-milestone-2.png` | future conceptual reference only | Milestone 2; it is not a Milestone 1 route or primary screen. |

## Evidence rule

- Repository PNG composition: **Original approved mockup**.
- External maintainer screenshot: **Maintainer-provided visual benchmark**.
- Product behavior and acceptance: **OpenSpec-approved behavior**.
- Placement/adaptation not fixed by OpenSpec: **Design proposal**.
- Step labels, recommendation signals, tolerances, and filesystem errors:
  **Backend-dependent state**.
- Decisions intentionally left open: **Unresolved**.

Generated mockup text never overrides the approved product contract.

## Four-anchor remediation traceability

The first D2 visual direction was rejected. Section
`13 / SIMPLIFIED V1 / D2 / VISUAL DIRECTION REVIEW` (`tkFJf`) preserves the
original 43-frame inventory and adds four replacement-direction anchors:

| Anchor | Original approved mockup | Previous D2 frame | New anchor |
|---|---|---|---|
| Projects populated | `01-home-recent.png` indirectly supports the application/library shell; it is not a dedicated Projects screen | `pfAoW` | `DQOkV` |
| Settings blocking error | None | `DNQBe` | `qOC3b` |
| Create Project Details filled/valid | `02-create-project-details.png` | `dkxQL` | `FSmVJ` |
| Editor Preview ready | `05-editor-preview.png` | `Tr58P` | `JMKSM` |

Settings has no original approved high-fidelity repository mockup. Its
behavioral authority is **OpenSpec-approved behavior** plus D1. The external
maintainer screenshot is a **Maintainer-provided visual benchmark** only.

The benchmark is
`design/references/maintainer-visual-feedback/2026-07-26-d2-visual-direction-benchmark.png`
with SHA-256
`4a9c83503807fbdc567fc12c91b145e89ef1b608fb6886edd6768df5845feef3`.
It is embedded uncropped in section 13 for review. The approved mockup
`manifest.json` was not changed.

## D2 Phase A traceability

| Mockup | D2 1440 realization |
|---|---|
| `01-home-recent.png` | `Nkbx7`, `H7jwM`, `pfAoW`, `Ag1BG`, `RlLTH` |
| `02-create-project-details.png` | `bGYAe`, `dkxQL`, `c1Ce08` |
| `03-create-project-track-mapping.png` | `SIeWF`, `nOz1i`, `MGHSv`, `be9aO` |
| `04-creating-project-progress.png` | `xRanW`, `xztYr`, `d2hS1p`, `nqc2V` |
| `05-editor-preview.png` | `Tr58P`, `Z8wVb`, `c5RIW`, `oQsuh`, `mNiYd` |
| `06-edit-note-dialog.png` | `WwIRH`, `AKsIx`, `pGCpE`, `YpPDv` |
| `07-editor-mappings.png` | `g7Aea`, `oTfZU`, `C9itDx`, `OcLvH` |
| `08-project-details-panel.png` | `OfDEn`, `tSPfb`, `aBu3s`, `opxt4`, `q3LHDn` |
| `09-export-success.png` | `x2crFY`, `Ne3Cz`, `z7dh9`, `R04bl`, `Bh4Dg`, `iiKS3` |
| `10-import-updated-source-milestone-2.png` | Deferred reference only; no Milestone 1 frame created |

All approved hashes remain unchanged:

| File | SHA-256 |
|---|---|
| `01-home-recent.png` | `16f114afb5c906c8f28deaef48972ce51d05fe43e47c2f79c8a0c1a028b2673d` |
| `02-create-project-details.png` | `5c14e14da7ce4218c253937e759ac9b26275e486ab1f1c7d32cb1a05df12b2e2` |
| `03-create-project-track-mapping.png` | `cd48791c80b836e239121226cfcbea4c32dd5d9fe066ea5c0de9c2351d634caa` |
| `04-creating-project-progress.png` | `c5b66635013bfa86297d49c43104ba4144a5dda733c77ce25d71632299d473b9` |
| `05-editor-preview.png` | `e8a1184a2be39afa214156ceed022c934effcdb2351df2b1c61129e90b3c1169` |
| `06-edit-note-dialog.png` | `cafd59f056257030a9d2bfe7f1f72a4c5060630943413843c017af2b5e375c56` |
| `07-editor-mappings.png` | `b5207cdd0cfb628882f43a6b5ea8c9ad62e2f0f607f6f74ed980883575e65066` |
| `08-project-details-panel.png` | `2bd4436d8e4e7ae044bed436dfab81bae5c7d8cf1bcafc862e4201898bc03cb8` |
| `09-export-success.png` | `e30a2f74b1189d3f1916f610a07091c6d373bfdeecf3e13b69b5141356a251a0` |
| `10-import-updated-source-milestone-2.png` | `cd5d80deffe49b2585c0195d0883f93ccb185c62a5d134ef4acdb20510f65fe5` |
