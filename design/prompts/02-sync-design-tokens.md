# Prompt 02 — Sync Current Design Tokens

```text
Read design/AGENTS.md and design/DESIGN.md.

Use Pencil MCP tools to inspect design/chdg-ui.pen.

Read the current visual tokens from:

- apps/desktop/src/styles.css
- apps/desktop/src/app/app.component.css

Compare them with the variables already present in design/chdg-ui.pen.

Update only design/chdg-ui.pen and design/references/design-token-map.md.

Requirements:

1. Preserve semantic naming.
2. Reuse existing variables instead of creating duplicates.
3. Add a variable only when it is part of the current implementation and useful in design.
4. Do not replace the current visual language.
5. Do not modify CSS or Angular files.
6. Record values that Pencil cannot represent directly in design/references/design-token-map.md.
7. Treat this as baseline synchronization, not redesign.

After updating:
- list variables added, changed, or intentionally omitted;
- inspect the document variables through MCP;
- save the Pencil document;
- confirm that no file outside design/ changed.
```
