# Simplified V1 Design Agent Instructions

These instructions apply to every agent modifying files under `design/`.

## Authority and scope

Read in this order:

1. `openspec/changes/chdg-simplified-v1/`
2. `docs/product/CHDG_V1_PRODUCT_DECISIONS.md`
3. `docs/product/PRD.md`
4. `design/decisions/simplified-v1-design-brief.md`
5. `design/references/simplified-v1-mockups/README.md`
6. existing `design/` history and foundations.

The Simplified V1 OpenSpec supersedes the prior workflow IA. Preserve the old
Pencil material as historical evidence.

Agents operating under D1, D2, or D3 may write only inside `design/` and the
explicit issue-owned design documentation paths. They must not modify:

- `apps/`;
- `packages/`;
- tests;
- dependencies or lockfiles;
- Electron;
- Angular;
- persistence;
- IPC;
- generation behavior.

## Product boundary

The approved visible flow is:

```text
Home → Create Project → Editor → Export
```

Do not add back:

- a permanent sidebar;
- a permanent four-step workflow strip;
- Source Review;
- Generate;
- Validation;
- a separate metadata destination;
- a full chart-authoring grid.

Permanent Editor navigation contains only:

```text
Preview
Mappings
```

Project Details, Edit Note, Export, Save a Copy, and exceptional lifecycle
actions are contextual panels/dialogs/menus.

## Required design behavior

- Artist, Song Name, and Project Name are mandatory.
- The derived name is `Artist - Song Name - Project Name`.
- Track recommendation is automatic; manual selection remains available.
- Mappings preserve musical identity separately from Clone Hero target.
- Individual note correction can change piece/target/tom-cymbal/open-closed
  hi-hat/accent/ghost, delete, restore, Undo, and Redo.
- No note add, move, tick, length, copy/paste, batch edit, tempo edit, or
  Expert+ kick.
- Import and export use real backend steps without fake percentages.
- The project is self-contained after import.
- Preview works before first export.
- Autosave is normal; manual Save is not a primary workflow action.
- Save a Copy is exceptional.
- Export ends with `Done`, returning to the Editor.

## Evidence labels

Every material statement must be marked or traceable as:

- **User-confirmed**
- **Code-confirmed**
- **OpenSpec-approved**
- **Design proposal**
- **Unresolved**

Never present a mockup detail as current behavior.

## Mockup use

The files in `design/references/simplified-v1-mockups/` are the exact approved
references. Do not regenerate, crop, recolor, upscale, replace, or overwrite
them. You may place them into a dedicated reference section in Pencil.

Mockups communicate direction, not exact implementation contracts. Correct:

- text legibility;
- control semantics;
- responsive composition;
- state completeness;
- focus order;
- real data constraints;
- component reuse;
- route ownership.

## Pencil requirements

- Use Pencil MCP.
- Never hand-edit `.pen` node IDs.
- Reuse variables and components.
- Use explicit 1440 × 900 and 1024 × 768 frames.
- Validate layout after each group.
- Inspect every required frame visually.
- Preserve CURRENT and prior Design V1 content.
- Record final hash and frame inventory.
- Do not claim PNG export unless performed successfully.

## Accessibility

- shared visible focus-visible treatment;
- no color-only status;
- labeled icons;
- keyboard-reachable actions;
- modal/drawer focus containment and restoration;
- meaningful disabled explanations;
- minimum usable hit targets;
- readable wrapping at 1024;
- no essential hover-only information.

## Checkpoints

D1 checkpoint:
- IA, route ownership, contextual surfaces, component responsibilities,
  responsive strategy, and state inventory.

D2 checkpoint:
- approved 1440 main flow, then approved 1024 adaptations and state coverage.

D3 checkpoint:
- complete handoff, route/scenario matrix, component inventory, interaction
  notes, keyboard behavior, unresolved list, and implementation sequence.

Stop at each issue-defined checkpoint. Do not self-approve.
