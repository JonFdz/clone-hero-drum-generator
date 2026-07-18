# Current CSS to Pencil Token Map

**Status:** Baseline  
**Primary source:** `apps/desktop/src/styles.css`

| CSS variable or value | Pencil variable | Pencil value | Notes |
|---|---|---:|---|
| `--color-bg` | `color.bg` | `#0D1117` | Exact |
| `--color-bg-elevated` | `color.bgElevated` | `#141B24` | Exact |
| `--color-surface` | `color.surface` | `#161D26D6` | RGBA converted to eight-digit hex |
| `--color-surface-strong` | `color.surfaceStrong` | `#1C242FEB` | RGBA converted to eight-digit hex |
| `--color-border` | `color.border` | `#C5D1E121` | RGBA converted to eight-digit hex |
| `--color-text` | `color.text` | `#F2F5F9` | Exact |
| `--color-text-soft` | `color.textSoft` | `#CBD3DF` | Exact |
| `--color-muted` | `color.muted` | `#98A2B3` | Exact |
| `--color-accent` | `color.accent` | `#A66CFF` | Exact |
| `--color-accent-soft` | `color.accentSoft` | `#D7B8FF` | Exact |
| `--color-success` | `color.success` | `#65DE77` | Exact |
| `--color-warning` | `color.warning` | `#F6B450` | Exact |
| `--color-danger` | `color.danger` | `#FF6B7A` | Exact |
| `--space-2` | `space.2` | `8` | Assumes 16 px root font size |
| `--space-3` | `space.3` | `12` | Assumes 16 px root font size |
| `--space-4` | `space.4` | `16` | Assumes 16 px root font size |
| `--space-5` | `space.5` | `20` | Assumes 16 px root font size |
| `--space-6` | `space.6` | `24` | Assumes 16 px root font size |
| `--space-8` | `space.8` | `32` | Assumes 16 px root font size |
| `--radius-sm` | `radius.sm` | `6.4` | Assumes 16 px root font size |
| `--radius-md` | `radius.md` | `11.2` | Assumes 16 px root font size |
| `--radius-lg` | `radius.lg` | `16` | Assumes 16 px root font size |
| Root font stack | `font.family` | `Inter` | Pencil accepts one renderable font family; the CSS fallback stack remains the implementation source of truth |
| Sidebar grid column | `layout.sidebarWidth` | `260` | From `app.component.css` |
| `--shadow-panel` | Not represented as one variable | N/A | Pencil variables do not represent a compound CSS shadow token; recreate through component effects |

## Rules

- Prefer semantic variables over raw values.
- Do not create duplicate variables for equivalent values without a semantic reason.
- Record unsupported compound CSS values here.
- Keep CSS as the source of truth until a later explicit token-sync decision.
