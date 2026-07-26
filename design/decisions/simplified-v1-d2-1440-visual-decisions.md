# Simplified V1 D2 1440 Visual Decisions

Phase A turns the approved D1 information architecture into a complete
production-scale `1440 × 900` flow. These decisions refine visual hierarchy and
interaction presentation without changing product or backend contracts.

## Decisions

| Topic | Decision |
|---|---|
| Application shell | Use a minimal horizontal header for CHDG, Home, Projects, and Settings; reserve no sidebar. |
| Creation | Use a two-step task sequence with one dominant action: Next, then Create Project. |
| Active project | Use one compact header for identity, save state, Preview/Mappings, Undo/Redo, Export/Update Song, Details, and overflow. |
| Editor | Give the waveform and approved Highway most usable space; keep diagnostics compact and secondary. |
| Contextual tasks | Use right-side contextual surfaces at 1440 so the Editor remains visible and task ownership stays clear. |
| Mapping | Show source identity → musical piece → Clone Hero target as three distinct concepts. |
| Progress | Show named real steps and semantic states; never fabricate percentages. |
| Export | Keep confirmation, progress, success, and failure contextual to Editor; distinguish updated and unchanged files. |
| Lifecycle variants | Use clearly labeled linked state cards when one canonical frame must make progress and failure reviewable; never imply concurrent outcomes. |
| Action hierarchy | Keep one dominant action per context and move rare lifecycle actions into overflow. |
| Visual language | Reuse approved `v1.*` tokens, semantic states, typography, spacing, and Highway direction. |

## Component strategy

Six D2 reusable components were added:

```text
zKiov  Application Header / 1440
mQo0l  Active Project Header / 1440
z8PsO  Mapping Row / Default
EWkJp  Progress Step / Active
UKZeo  Contextual Surface / Right
NXTj4  Compact Warning / Attention
```

`EWkJp` and `UKZeo` are connected instances in production frames. The
historical Highway (`Xab8q`) is not reusable in Pencil, so D2 uses a bounded
copied and refined visual derivation. Historical D1 skeletons and Design V1
components remain evidence and were not replaced or flattened.

## Design proposals

The following are recommended 1440 treatments, not implementation claims:

- Projects search/no-result and missing-project recovery presentation.
- Save a Copy placement in project overflow.
- Right-side Project Details, Edit Note, Export, and Save a Copy surfaces.
- Collision, retry, and duration-warning wording.
- Compact diagnostics and technical-disclosure density.
- Reset Overrides confirmation presentation.
- Disabled-action explanatory copy and task-level Back/Cancel placement.
- Focus order and focus restoration described below.

Alternatives remain possible if implementation evidence exposes a stronger
treatment. Phase B must evaluate whether each right-side surface remains
appropriate or becomes a dialog/overlay at `1024 × 768`.

## Backend-dependent states

- Track confidence and source evidence.
- Creation, export, rename, and Save a Copy progress evidence.
- Dependency and path validation.
- Duration mismatch tolerance and severity.
- Filesystem ambiguity and externally modified managed-file detail.
- Retry availability and final error messages.

These frames use approved identifiers and safety rules, but do not invent wire
contracts.

## Accessibility

- Text labels remain on essential controls.
- Semantic states are not communicated by color alone.
- Primary controls use approximately 42–44 px target heights.
- Selected navigation and tabs use both fill and label emphasis.
- Warning/error surfaces use explicit headings and recovery copy.
- A representative focus-visible ring is present in `dkxQL`.
- Proposed 1440 order: application header → task Back/Cancel → content →
  dominant action.
- Proposed Editor order: active-project header → transport →
  waveform/Highway → diagnostics → contextual invoker.
- Proposed contextual behavior: trap focus while open and restore focus to the
  invoking control on close.
- Exact shortcuts, compact truncation, and the final `1024 × 768` contextual
  behavior remain unresolved.

## Evidence taxonomy

D2 Markdown records use: **OpenSpec-approved**, **Design proposal**,
**Backend-dependent state**, **Unresolved**, and **Mockup reference**.
Runtime-specific diagnostics and filesystem results are never presented as
implemented behavior.

The live Pencil frames still contain legacy compound metadata strings. The
exact limitation and deferred safe-normalization requirement are recorded in
`../handoff/simplified-v1-d2-1440-validation.md`; this decision record does not
claim that live frame metadata has already been normalized.

## Out of scope

- `1024 × 768` final frames.
- Milestone 2 updated-source import.
- Production Angular/Electron behavior.
- New backend contracts or routes.
- A full chart-authoring grid or timing-editing controls.

## Checkpoint

- **1440 × 900 checkpoint complete.**
- **1024 × 768 final adaptation not started.**
- **Issue #98 remains incomplete.**
- **The PR must remain draft.**
- **Maintainer approval is required before Phase B.**
