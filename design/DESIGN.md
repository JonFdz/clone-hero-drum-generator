# CHDG Design Contract

**Status:** Baseline draft  
**Scope:** Existing desktop UI before redesign  
**Product:** Clone Hero Drum Generator  
**Primary implementation:** Angular 19 + Electron

This file documents the current design language and the principles that future redesign work must preserve or deliberately revise.

## 1. Product context

CHDG helps users transform drum-oriented MIDI or GPIF source material into Clone Hero-compatible drum charts.

The desktop workflow currently includes:

1. project selection and persistence;
2. source selection;
3. source and track review;
4. drum-note mapping review;
5. mapping-profile management;
6. chart generation;
7. generated-chart preview;
8. output access and validation.

The application serves a technical workflow, but the interface should not require users to understand internal architecture before they can complete the task.

## 2. Current visual direction

The current UI uses a dark desktop-tool aesthetic with:

- near-black backgrounds;
- elevated blue-gray surfaces;
- violet accent color;
- restrained borders;
- semantic green, amber, and red statuses;
- rounded cards and controls;
- dense but structured information presentation.

This baseline is not automatically the final redesign direction.

## 3. Color tokens

| Semantic token | Current value |
|---|---:|
| Background | `#0D1117` |
| Elevated background | `#141B24` |
| Surface | `rgba(22, 29, 38, 0.84)` |
| Strong surface | `rgba(28, 36, 47, 0.92)` |
| Border | `rgba(197, 209, 225, 0.13)` |
| Primary text | `#F2F5F9` |
| Soft text | `#CBD3DF` |
| Muted text | `#98A2B3` |
| Accent | `#A66CFF` |
| Soft accent | `#D7B8FF` |
| Success | `#65DE77` |
| Warning | `#F6B450` |
| Danger | `#FF6B7A` |

## 4. Typography

Current font stack:

```text
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Baseline guidance:

- Use clear hierarchy rather than decorative type.
- Keep body copy readable in dense desktop layouts.
- Reserve monospace typography for logs, technical identifiers, and source data.
- Avoid using weight alone as the only status signal.

## 5. Spacing

Current spacing scale:

| Token | Value |
|---|---:|
| `space.2` | 8 px |
| `space.3` | 12 px |
| `space.4` | 16 px |
| `space.5` | 20 px |
| `space.6` | 24 px |
| `space.8` | 32 px |

Use the established scale before introducing new spacing values.

## 6. Radius

| Token | Approximate value |
|---|---:|
| `radius.sm` | 6.4 px |
| `radius.md` | 11.2 px |
| `radius.lg` | 16 px |

## 7. Current component language

Baseline components include:

- primary, secondary, ghost, and disabled buttons;
- inputs and selects;
- cards and mini-cards;
- semantic status pills;
- sidebar navigation items;
- warning and error messages;
- sticky action areas;
- technical log and detail regions.

Components should expose semantic states, not only visual variants.

## 8. Interaction principles

Future work should follow these principles:

1. **One clear primary action per stage.**
2. **Project state must remain visible without dominating the interface.**
3. **Workflow stages must be understandable without knowledge of internal routes.**
4. **Advanced technical data should use progressive disclosure.**
5. **Warnings should appear close to the item that requires action.**
6. **Destructive actions require explicit confirmation.**
7. **Generated output and preview must remain clearly read-only unless editing is intentionally introduced.**
8. **Status must never be conveyed by color alone.**

## 9. Accessibility baseline

- Preserve visible keyboard focus.
- Maintain readable contrast on dark surfaces.
- Use text or icons in addition to semantic color.
- Respect reduced-motion preferences.
- Keep interactive targets appropriately sized.
- Ensure dialog and drawer focus behavior is testable.
- Provide accessible summaries for complex visual previews.

## 10. Anti-patterns

Avoid:

- presenting internal application modules as equal user goals;
- showing backend health when everything is operating normally;
- exposing technical logs by default;
- placing save, navigation, status, and workflow actions in one undifferentiated toolbar;
- stacking many full-width cards without clear priority;
- duplicating project state in multiple regions;
- generating visually impressive mockups that omit real states or capabilities;
- changing visual style before fixing information architecture;
- implementing directly from a generated prototype without adapting it to Angular architecture.

## 11. Open questions

The following require screenshot and user validation:

- Which page feels most difficult during real usage?
- Which mapping actions are used most frequently?
- Which profile operations are common versus rare?
- Which project actions must remain permanently visible?
- Which preview controls are essential during normal validation?
- What minimum desktop viewport must be supported?
