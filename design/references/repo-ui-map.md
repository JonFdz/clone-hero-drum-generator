# Desktop UI Repository Map

This map helps design agents find the current implementation without scanning unrelated backend code.

## Application shell

```text
apps/desktop/src/app/app.component.ts
apps/desktop/src/app/app.component.html
apps/desktop/src/app/app.component.css
apps/desktop/src/app/app.routes.ts
apps/desktop/src/styles.css
```

## Routes

| Route | Current feature |
|---|---|
| `/home` | Home |
| `/projects` | Project list |
| `/projects/details` | Project details and source selection |
| `/source-review` | Source review, tracks, mapping, profiles, and issues |
| `/generate` | Generation readiness, execution, logs, and output actions |
| `/preview` | Generated-chart preview |
| `/settings` | Application settings |

## Redirects

| Legacy or alternate route | Destination |
|---|---|
| `/new-project` | `/projects/details` |
| `/inspect-source` | `/source-review` |
| `/track-selection` | `/source-review` |
| `/mapping` | `/source-review` |
| `/validation` | `/generate` |

## Feature directories

```text
apps/desktop/src/app/features/home/
apps/desktop/src/app/features/projects/
apps/desktop/src/app/features/project-details/
apps/desktop/src/app/features/project-session/
apps/desktop/src/app/features/source-review/
apps/desktop/src/app/features/generation/
apps/desktop/src/app/features/preview/
apps/desktop/src/app/features/settings/
```

## Preview and Highway

```text
apps/desktop/src/app/features/preview/
apps/desktop/src/app/features/preview/highway/
apps/desktop/src/app/features/preview/components/preview-highway/
```

## Design inspection order

1. `styles.css`
2. app shell files
3. routes
4. project session state
5. Project Details
6. Source Review
7. Generation
8. Preview
9. Settings
