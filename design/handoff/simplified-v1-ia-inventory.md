# Simplified V1 D1 IA inventory

This is the review index for the 22 structural representations created for
issue #94. All nodes are inside `08 / SIMPLIFIED V1 / IA` (`qlILE`).

## Structural representations

| # | Pencil node | ID | Kind | Evidence |
|---:|---|---|---|---|
| 1 | Home / Recent Projects | `rotqy` | route | OpenSpec-confirmed |
| 2 | Home / Empty | `Y0A3T` | route state | OpenSpec-confirmed |
| 3 | Projects / List and Search | `irdc4` | route | Interaction proposal |
| 4 | Settings | `JHYQH` | route | Interaction proposal |
| 5 | Create Project / Project Details | `S5MgL` | task step | OpenSpec-confirmed |
| 6 | Create Project / Track and Mapping | `Gl2rH` | task step | OpenSpec-confirmed |
| 7 | Creating Project / Progress | `QhZhv` | task state | Backend-dependent state |
| 8 | Creating Project / Actionable Failure | `kBUCc` | task state | Backend-dependent state |
| 9 | Editor / Preview Default — true 1440 × 900 structural frame | `QNl8c` | project route | OpenSpec-confirmed |
| 10 | Editor / Note Selected | `eRMNA` | project route state | OpenSpec-confirmed |
| 11 | Edit Note / Contextual Surface | `oyTlY` | contextual surface | OpenSpec-confirmed |
| 12 | Editor / Mappings | `QYIeZ` | project route | OpenSpec-confirmed |
| 13 | Project Details / Contextual Surface | `Qm7xx` | contextual surface | OpenSpec-confirmed |
| 14 | Export / Confirmation | `yY9lY` | contextual state | OpenSpec-confirmed |
| 15 | Export / Progress | `A5rbvZ` | contextual state | Backend-dependent state |
| 16 | Export / Success | `g4vhIq` | contextual state | Backend-dependent state |
| 17 | Export / Failure | `q2hQaI` | contextual state | Backend-dependent state |
| 18 | Save / Failure | `SF8ap` | header/context state | Backend-dependent state |
| 19 | Unknown Mapping / Attention | `k5ZRUU` | advisory state | OpenSpec-confirmed |
| 20 | Track Recommendation / Alternatives | `ZL0Qu` | advisory state | Interaction proposal |
| 21 | Audio Chart Duration / Warning | `G8y88E` | advisory state | Backend-dependent state |
| 22 | Editor / 1024 Structural Adaptation — true 1024 × 768 frame | `LpEWJ` | responsive pattern | OpenSpec-confirmed |

## Route and surface summary

```text
Home ↔ Projects ↔ Settings
Home → Create Project / Details
     → Create Project / Track & Mapping
     → Creating Project
     → Editor / Preview ↔ Editor / Mappings
```

Contextual, never permanent:

```text
Project Details
Edit Note
Export / Update Song
Save a Copy
exceptional lifecycle actions
```

## Ownership checkpoints

- Application header owns Home, Projects, and Settings.
- Creation uses a task header and two-step indicator; it does not repeat the
  application destination bar.
- Active-project header owns return, identity, save state, project tabs,
  Undo/Redo, Export/Update, Project Details entry, and overflow.
- While a project is active, Settings is available through application-level
  overflow rather than a second persistent chrome layer.
- Project switching belongs to Home/Projects.
- Wizard navigation owns Back/Cancel and the single dominant forward action.
- Active progress restricts navigation; success opens/returns to Editor and
  failure offers recovery without inventing a permanent route.

## D1 boundary

The inventory cards are low/medium-fidelity structural models. D1 includes one
true 1440 × 900 Editor Preview and one materially adapted 1024 × 768 Editor
frame. It does not claim full-size coverage for every state at both breakpoints.
D2 owns the remaining production-scale frames, interaction polish, and
accessibility walkthroughs without changing the approved route model.
