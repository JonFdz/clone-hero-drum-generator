# Prompt 01 — Verify the Pencil Workspace

Copy the following prompt into the connected agent while `design/chdg-ui.pen` is open.

```text
Read design/AGENTS.md, design/README.md, and design/DESIGN.md before doing anything.

This is issue #89, a design-only baseline phase.

You may read the entire repository, but you must not modify anything outside design/.

Verify the following:

1. design/chdg-ui.pen is open and readable through Pencil MCP.
2. The document uses the current supported Pencil schema.
3. The document contains the expected CHDG variables and the three starter frames:
   - 00 / Workspace Cover
   - 01 / CHDG Foundations
   - 02 / Current App Shell
4. The repository paths referenced by the design workspace exist.
5. No production file needs to change for Pencil to work.

Do not modify the design yet.

Report:
- Pencil document status;
- available MCP tools;
- missing or invalid variables;
- missing repository paths;
- any setup problem that blocks the next prompt.
```
