# Pencil Prompt Sequence

> **Superseded planning note (2026-07-18):** Revised issue #89 and the current
> OpenSpec authorize Prompt 07 after Approval Checkpoint 1. They require exactly
> two alternatives, not three. The older wording below is retained as historical
> context.
>
> Approval Checkpoint 2 selected the bounded hybrid responsibility model. Prompt
> 07 is now historical input, not the active Design V1 direction.

Run the prompts in numeric order.

Prompts 01–06 belong to issue #89.

Prompt 07 is included for the follow-up information-architecture exploration issue and must not be used to modify the baseline frames.

## Operating rule

Before every prompt:

1. Open the repository root in the IDE.
2. Open `design/chdg-ui.pen`.
3. Confirm Pencil MCP tools are available.
4. Save the document.
5. Ensure the agent has read `design/AGENTS.md`.

After every prompt:

1. Inspect the visual result.
2. Ask the agent to run layout inspection if available.
3. Save the `.pen` file.
4. Update the relevant Markdown record.
5. Review `git diff` before committing.
