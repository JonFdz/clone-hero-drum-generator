# Design Workspace Agent Instructions

> **Supersession note (2026-07-18):** The revised GitHub issue #89 and
> `openspec/changes/chdg-design-v1/` supersede the baseline-only stopping rule
> below. After Approval Checkpoint 1, issue #89 continues with exactly two
> bounded IA alternatives: Workflow-first and Project workspace. Historical
> baseline instructions remain here for provenance. Production-code and
> design-only safety boundaries remain unchanged.
>
> Approval Checkpoint 2 selected the bounded hybrid responsibility model:
> Workflow-first owns orientation and progression; compact project context and
> page-local navigation own revisitation and long-page organization.

These instructions apply to every agent operating on files under `design/`.

## Language

All repository artifacts must be written in English, including:

- prompts;
- design notes;
- decision records;
- layer and frame names;
- component names;
- screenshots and export filenames;
- commit messages;
- issue and pull-request text.

Conversation with the user may be in Spanish, but repository content must remain English-first.

## Current issue scope

Issue #89 is a design-baseline phase.

Agents may read the full repository to understand the application, but they may write only inside `design/`.

Do not modify:

- `apps/`;
- `packages/`;
- tests;
- build configuration;
- Electron behavior;
- Angular behavior;
- persistence or IPC contracts;
- chart generation behavior.

## Product and stack constraints

The production application uses Angular and Electron.

Do not:

- replace Angular;
- introduce React, Next.js, Tailwind, shadcn, or a parallel frontend;
- invent new product functionality;
- remove existing workflow capabilities;
- infer behavior solely from visual appearance;
- copy generated HTML directly into the production application.

## Baseline-first workflow

During issue #89:

1. Inspect the current code.
2. Sync current tokens into Pencil.
3. Build current UI foundations.
4. Recreate the current app shell faithfully.
5. Capture screenshots.
6. Audit usability.
7. Stop before redesign exploration or production implementation.

Do not improve the design while recreating the baseline. Any proposed improvement belongs in the audit or a follow-up design frame.

## Evidence discipline

Label findings as one of:

- **Code-confirmed** — directly supported by repository code.
- **Screenshot-confirmed** — directly visible in a captured application screenshot.
- **User-confirmed** — explicitly confirmed by the user.
- **Hypothesis** — requires validation.

Never present a hypothesis as confirmed behavior.

## Pencil rules

- Use Pencil MCP tools for `.pen` changes.
- Prefer variables over hardcoded visual values.
- Prefer reusable components over duplicated structures.
- Keep frame and layer names descriptive and stable.
- Save the document frequently.
- Inspect layout and screenshots after significant changes.
- Do not hand-edit generated node IDs after Pencil has created content.

## Completion bar

A task is not complete until:

- the `.pen` file opens successfully;
- required frames and variables are present;
- the document is saved;
- visual output has been inspected;
- relevant Markdown records are updated;
- no production code has changed.
