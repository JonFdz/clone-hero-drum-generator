# PRD Phase 17D: Home Dashboard Redesign

## Goal

Redesign the Home screen so it behaves like a useful project dashboard / launchpad instead of duplicating the Projects page.

Primary visual reference:

```txt
docs/desktop/mockups/01-home-dashboard.png
```

Use the mock as a visual/product reference, applying canonical corrections from:

```txt
docs/desktop/mockup-corrections.md
```

This phase is Home-only.

## Current repo baseline

Current Home implementation:

```txt
apps/desktop/src/app/pages/home/home-page.component.ts
```

Current Projects implementation:

```txt
apps/desktop/src/app/pages/projects/projects-page.component.ts
```

Current state source for Home:

```txt
apps/desktop/src/app/services/desktop-project-state.service.ts
apps/desktop/src/app/services/desktop-generate-state.service.ts
apps/desktop/src/app/services/desktop-bridge.service.ts
```

Current Home is too similar to Projects:

```txt
Home currently shows Recent Projects and Workflow overview.
Projects also shows Recent Projects and project open/create actions.
```

Phase 17D should make Home a dashboard and keep Projects as the dedicated project library.

## Roadmap context

```txt
Phase 17A — Desktop Bug Bash
Phase 17B — Real Waveform Preview
Phase 17C — Preview Highway UX Redesign
Phase 17D — Home Dashboard Redesign
Phase 17E — Projects Library Redesign
Phase 18  — Desktop Packaging / Distribution
```

This phase is **17D only**.

## Product direction

Home should answer:

```txt
What project am I working on?
What is the current project state?
What should I do next?
Can I quickly continue/open/create?
Are there any missing paths or output status issues?
```

Projects should remain the place to manage the full library/list of recent `.chdg` files.

## Scope

Included:

```txt
Home page redesign only
componentized Home dashboard
current project summary / resume card
primary next-step card
compact recent projects section
workflow progress/status strip
quick actions
missing path warnings
generated/needs-regenerate/not-generated/failed output state display
empty state for no current project
tests for pure Home dashboard model helpers
```

Out of scope:

```txt
Projects page redesign
New Project redesign
Preview/Mapping/Generate/Validation redesign
global sidebar/header redesign
.chdg bundle format
packaging/distribution
new persistence model
new external dependencies
OpenSpec commit
```

## Visual target

Use:

```txt
docs/desktop/mockups/01-home-dashboard.png
```

as the reference for:

```txt
dashboard-like composition
dark/purple cards
strong project summary
clear primary CTA
workflow progress
compact recent projects
status cards
```

Do not treat the mock as pixel-perfect if it conflicts with current product decisions.

## Canonical corrections

Follow:

```txt
docs/desktop/mockup-corrections.md
```

Relevant Home correction:

```txt
Workflow step order:
1 Import source
2 Inspect
3 Select track(s)
4 Generate
5 Validate
6 Preview
```

Do not present `.chdg` as Clone Hero generated output.

Canonical rule:

```txt
.chdg = project file
Clone Hero output = notes.chart + song.ini + song.ogg in an output folder
```

## Required Home information hierarchy

The Home screen should prioritize:

```txt
1. Current project / resume work
2. Next recommended action
3. Project health/status
4. Recent projects
5. Workflow overview/progress
```

Do not make Recent Projects the dominant Home feature. That belongs more to the Projects page.

## Required component breakdown

Keep `HomePageComponent` as a container/composer and split the dashboard into focused components where practical.

Suggested folder:

```txt
apps/desktop/src/app/pages/home/components/
```

### HomePageComponent

Current file:

```txt
apps/desktop/src/app/pages/home/home-page.component.ts
```

Responsibilities after redesign:

```txt
load/use DesktopProjectStateService
load/use DesktopGenerateStateService if needed
compose Home dashboard components
route actions to existing pages
open recent project using existing logic
do not contain large repeated dashboard card templates
```

### HomeDashboardHeroComponent

Main top card / hero.

Responsibilities:

```txt
show current project name
show dirty/modified state if available
show .chdg path if saved
show output status pill
show primary CTA
show secondary actions: New Project, Open Project
```

Inputs:

```txt
projectName
projectFilePath
dirty
outputStatus
hasProject
missingPathCount
```

Outputs:

```txt
primaryAction
newProject
openProject
```

Primary CTA rules:

```txt
no current project -> New Project
project exists but source/audio/output missing -> Continue Setup
not-generated -> Inspect Source or Generate depending available state
needs-regenerate -> Generate
generated -> Preview
failed -> Review Generate
```

The exact route can use the best available current state. If uncertain, prefer the safest next route and keep labels honest.

### HomeNextStepCardComponent

A smaller "what to do next" card.

Responsibilities:

```txt
derive next recommended step
explain why
show one primary button
show optional secondary link
```

Inputs:

```txt
homeDashboardModel / current project state
```

Outputs:

```txt
goToStep
```

### HomeProjectStatusCardsComponent

Small status cards row.

Responsibilities:

```txt
show project saved/unsaved
show output status
show missing paths count
show recent project count
optional ffmpeg status if already available
```

Do not perform new expensive checks automatically.

### HomeRecentProjectsCompactComponent

Compact recent projects section.

Responsibilities:

```txt
show up to 3 recent projects
show project name and path
open recent on click
remove recent
link to Projects page for full library
```

Rules:

```txt
Home recent list must be compact.
Projects page remains full project library.
```

### HomeWorkflowProgressComponent

Workflow progress strip.

Responsibilities:

```txt
render six canonical steps
mark current/available/completed where the state supports it
avoid claiming completion when state is unknown
```

Steps:

```txt
Import source
Inspect
Select track(s)
Generate
Validate
Preview
```

Possible statuses:

```txt
complete
current
available
blocked
upcoming
unknown
```

If the current state cannot reliably determine a step, show neutral/upcoming rather than misleading completion.

### HomeWarningsPanelComponent

Only show when useful.

Responsibilities:

```txt
show missing source/audio/output warnings from DesktopProjectStateService
show concise recovery action
do not duplicate global error UI
```

Inputs:

```txt
missingPathWarnings
```

### HomeQuickActionsComponent

Optional compact actions card.

Responsibilities:

```txt
New Project
Open Project
Continue Setup
Generate
Preview
Open Projects Library
```

Only show actions that make sense for current state.

## Required pure helper/model

Create a small Angular-free model helper if practical:

```txt
apps/desktop/src/app/services/home-dashboard-model.ts
```

Tests:

```txt
apps/desktop/src/app/services/home-dashboard-model.test.ts
```

Suggested responsibilities:

```txt
deriveHomeDashboardModel()
deriveHomeNextAction()
deriveWorkflowStepStatuses()
formatProjectPath()
formatOutputStatusLabel()
```

Suggested model:

```ts
type HomeNextActionId =
  | "new_project"
  | "continue_setup"
  | "inspect_source"
  | "generate"
  | "validate"
  | "preview"
  | "review_generate"
  | "open_project";

type HomeDashboardModel = {
  hasProject: boolean;
  projectName: string;
  projectFilePath?: string;
  dirty: boolean;
  outputStatus: ChdgOutputStatus;
  missingPathCount: number;
  recentProjectCount: number;
  nextAction: {
    id: HomeNextActionId;
    label: string;
    route?: string;
  };
  workflowSteps: Array<{
    id: "import" | "inspect" | "select_tracks" | "generate" | "validate" | "preview";
    label: string;
    status: "complete" | "current" | "available" | "blocked" | "upcoming" | "unknown";
  }>;
};
```

Use actual repo types where available.

## State sources

Use existing state only:

```txt
DesktopProjectStateService.state()
DesktopProjectStateService.hasProject()
DesktopProjectStateService.isDirty()
DesktopProjectStateService.outputStatus()
DesktopProjectStateService.missingPathWarnings()
DesktopProjectStateService.recentProjects
DesktopGenerateStateService state if needed for source/audio/output/selected tracks
```

Do not add new persistence in this phase.

## Navigation rules

Use existing routes:

```txt
/home
/projects
/new-project
/inspect-source
/track-selection
/generate
/validation
/preview
/mapping
/settings
```

When opening a recent project, preserve existing behavior of loading project state into `DesktopGenerateStateService`.

## Empty state

If there is no active/current project:

```txt
Hero should invite the user to create or open a project.
Recent projects should be compact.
Workflow should explain the process but not dominate the screen.
```

## Current project state

If a project is active:

```txt
Hero should show the project name.
Show saved/modified status.
Show generation status.
Show missing path warning if any.
Next action should point to the most useful screen.
```

## Acceptance criteria

- Home no longer feels like a duplicate of Projects.
- Home visually follows `01-home-dashboard.png` direction.
- Recent Projects is compact and not the dominant section.
- Current project / next action is the dominant section.
- Workflow order is canonical.
- Missing path warnings are visible when present.
- Output status is visible.
- Existing New Project / Open Project / open recent behavior still works.
- No Projects page redesign is included.
- No new external dependencies are added.
- Tests cover pure helper decisions where practical.
