# CHDG Design Workspace

This directory is the version-controlled design workspace for the Clone Hero Drum Generator desktop application.

It was introduced by issue **#89 — `design: bootstrap Pencil workspace and audit current desktop UI`**.

## Purpose

The first phase is intentionally conservative:

1. Establish a valid Pencil workspace inside the repository.
2. Represent the existing visual tokens and reusable UI foundations.
3. Recreate the current Angular/Electron application shell.
4. Capture the current workflow in screenshots.
5. Audit usability before proposing a redesign.

This phase must not modify production UI code or application behavior.

## Directory structure

```text
design/
├── AGENTS.md
├── DESIGN.md
├── README.md
├── chdg-ui.pen
├── current-ui/
│   └── README.md
├── decisions/
│   ├── current-ux-audit.md
│   └── decision-log.md
├── exports/
│   └── README.md
├── prompts/
│   ├── README.md
│   ├── 01-verify-workspace.md
│   ├── 02-sync-design-tokens.md
│   ├── 03-build-foundations.md
│   ├── 04-recreate-current-app-shell.md
│   ├── 05-audit-current-ux.md
│   ├── 06-compare-with-screenshots.md
│   └── 07-explore-information-architecture.md
└── references/
    ├── design-token-map.md
    ├── repo-ui-map.md
    ├── screenshot-checklist.md
    └── validation-checklist.md
```

## First session

1. Check out the issue branch:

   ```bash
   git fetch origin
   git switch design/89-pencil-bootstrap
   ```

2. Copy this `design/` directory into the repository root.

3. Open the repository root in VS Code.

4. Open `design/chdg-ui.pen` and wait for Pencil to activate.

5. Save the file once with `Ctrl+S`.

6. Run the prompts in numeric order, starting with:

   ```text
   design/prompts/01-verify-workspace.md
   ```

7. Do not run prompt 07 during issue #89. It belongs to the follow-up exploration phase.

## Source of truth

- The Angular/Electron application remains the source of truth for current behavior.
- `chdg-ui.pen` is the source of truth for approved visual design work.
- `DESIGN.md` is the human-readable design contract.
- Screenshots under `current-ui/` are evidence, not editable source files.
- Files under `exports/` are generated previews and must not be treated as design source.

## Working rules

- All repository content is English-first.
- Save `.pen` files frequently; Pencil does not currently guarantee automatic saving.
- Commit design changes in small, reviewable increments.
- Keep code-based findings distinct from visually confirmed findings.
- Do not edit the `.pen` JSON manually unless Pencil cannot open the file and a format repair is required.
- Do not generate React, Next.js, Tailwind, or shadcn output for this application.
- Do not implement design changes in `apps/` or `packages/` during issue #89.

## Recommended first commit

After Pencil opens the file and the initial workspace is verified:

```bash
git add design/
git commit -m "design: bootstrap Pencil workspace"
```
