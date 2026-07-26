# Simplified V1 component and state inventory

`09 / SIMPLIFIED V1 / STRUCTURAL COMPONENTS` (`QJDNH`) records responsibility,
variants, classification, and evidence. Seven reusable D1 skeletons demonstrate
the intended composition without replacing the existing component system.

## Component classification

| Component | Classification | Responsibility / variants |
|---|---|---|
| Application header | new Simplified V1 component | Home/Projects/Settings at application level; minimal default |
| Active-project header | new Simplified V1 component | return, identity, save, tabs/actions; saved, saving, failed |
| Project identity | refine existing | cover + identity; compact, truncated |
| Save-state indicator | new Simplified V1 component | Saving/Saved/Save failed; quiet, active, failed |
| Project tabs | new Simplified V1 component | Preview/Mappings; selected, unselected |
| Project overflow menu | refine existing | rare lifecycle actions; closed, open |
| Page/task header | refine existing | purpose and one dominant action; app, wizard, contextual |
| Creation step indicator | refine existing | two steps; current, completed |
| File picker row | refine existing | source/audio/cover; empty, selected, invalid |
| Metadata field group | refine existing | identity/metadata/derived name; create, details, collision |
| Track recommendation row | new Simplified V1 component | recommended/manual/additional |
| Mapping row | new Simplified V1 component | source → piece → target; default, override, attention |
| Unknown mapping advisory | refine existing | piece then proposed target; advisory, resolved |
| Progress step | refine existing | real backend step; completed, active, pending, failed |
| Progress state | refine existing | named-step task; running, failed, complete |
| Transport | new Simplified V1 component | playback; ready, playing, disabled |
| Waveform region | new Simplified V1 component | timing and selection; default, selected, warning |
| Highway region | new Simplified V1 component | dominant preview; default, selected note |
| Section navigator | new Simplified V1 component | section jumps; collapsed, expanded |
| Offset control | new Simplified V1 component | project offset; default, adjusted |
| Note selection | new Simplified V1 component | focus and Edit Note entry; selected, restorable |
| Note editor surface | new Simplified V1 component | approved attributes; dock, overlay, dialog |
| Project Details surface | new Simplified V1 component | identity/rename/export default; default, collision, saving |
| Export surface | new Simplified V1 component | confirmation/progress/result; first, update |
| Confirmation dialog | refine existing | ambiguity/conflict; standard, destructive warning |
| Success state | refine existing | result and return; creation, export |
| Failure state | refine existing | reason and recovery; creation, export, save |
| Compact warning | refine existing | mapping/duration/external-edit advisory |
| Technical disclosure | reuse current | support detail; closed, open |

No required component is classified as historical-only or deferred. Historical
workflow-specific navigation and Generate-specific components remain preserved
in the existing workspace, but are not reused as Simplified V1 navigation.

## Reusable D1 skeletons

| Component | Pencil ID |
|---|---|
| Application Header | `QYenb` |
| Active Project Header | `S0YAZ` |
| Mapping Row | `LdUPs` |
| Contextual Surface | `uVP2d` |
| Progress State | `FH5zo` |
| Compact Warning | `ctYKG` |
| Technical Disclosure | `gp40N` |

Connected instances appear in `10 / SIMPLIFIED V1 / ROUTE AND STATE MAP`
(`WIPI3`) under `Referenced Component Instances` (`rYHq7`).

## State ownership

| State | Owner | Notes |
|---|---|---|
| Saving / Saved / Save failed | active-project header | failure expands contextually |
| create running/failure | Creating Project task | navigation restricted only while running |
| export confirmation/progress/result | Export contextual surface | Done returns to Editor |
| unknown mapping | mapping row/advisory | correction remains advisory |
| duration mismatch | compact warning | tolerance/severity is backend-dependent |
| rename collision | Project Details surface | transactional preflight required |
| managed-file conflict | Export surface | confirmation required; unmanaged files preserved |

## Precedence and safety

```text
individual note correction
> source-specific project target override
> default target for the effective musical piece
```

Mapping changes never overwrite individual note corrections. Export changes
only CHDG-managed files and never leaves a partial managed update.

Export success distinguishes updated, unchanged, and removed managed files and
separately confirms preservation of unmanaged files.
